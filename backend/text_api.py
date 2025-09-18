# app.py
import os
import io
import tempfile
import pickle
import torch
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
from torchvision import models, transforms
import numpy as np
import easyocr
import fitz  # PyMuPDF

# --- FastAPI app ---
app = FastAPI(title="ForensicX Multi-Modal Detector API")

# --- CORS middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:8082"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Base directory ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# --- Load text model ---
TEXT_MODEL_PATH = os.path.join(BASE_DIR, "models", "text_model.pkl")
with open(TEXT_MODEL_PATH, "rb") as f:
    data = pickle.load(f)
    tokenizer = data["tokenizer"]
    text_model = data["model"]
    text_model.eval()

# --- Load image model ---
IMAGE_MODEL_PATH = os.path.join(BASE_DIR, "models", "efficientnet_best.pth")
image_classes = ['ai_enhanced', 'ai_generated', 'natural']

device = torch.device("mps") if torch.backends.mps.is_available() else torch.device("cpu")

image_model = models.efficientnet_b0(pretrained=False)
num_ftrs = image_model.classifier[1].in_features
image_model.classifier[1] = torch.nn.Linear(num_ftrs, len(image_classes))
image_model.load_state_dict(torch.load(IMAGE_MODEL_PATH))
image_model.to(device)
image_model.eval()

image_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225])
])

# --- EasyOCR Reader ---
ocr_reader = easyocr.Reader(['en'], gpu=torch.cuda.is_available())

# --- Text request model ---
class TextRequest(BaseModel):
    text: str

# --- Text detection endpoint ---
@app.post("/detect-text")
def detect_text(req: TextRequest):
    inputs = tokenizer(req.text, return_tensors="pt", truncation=True, max_length=512)
    with torch.no_grad():
        outputs = text_model(**inputs)
        logits = outputs.logits
        probs = torch.softmax(logits, dim=1)
        pred = torch.argmax(probs, dim=1).item()
        confidence = probs[0, pred].item()
    label = "AI" if pred == 1 else "Human"
    return {"label": label, "confidence": confidence}

# --- PDF helper ---
def extract_text_and_images_from_pdf(pdf_path):
    doc = fitz.open(pdf_path)
    text = ""
    images = []
    seen_xrefs = set()
    for page_num in range(len(doc)):
        page = doc[page_num]
        text += page.get_text()
        for img_index, img in enumerate(page.get_images(full=True)):
            xref = img[0]
            if xref in seen_xrefs:
                continue
            seen_xrefs.add(xref)
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]
            image_info = {
                "page": page_num + 1,
                "img_index": img_index + 1,
                "ext": image_ext,
                "size": len(image_bytes)
            }
            images.append(image_info)
    return text, images

# --- PDF detection endpoint ---
@app.post("/detect-pdf")
async def detect_pdf(file: UploadFile = File(...)):
    # Save uploaded PDF to temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    # Extract text and images
    text, images = extract_text_and_images_from_pdf(tmp_path)

    # Text detection for full PDF text
    if text.strip():
        inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
        with torch.no_grad():
            outputs = text_model(**inputs)
            logits = outputs.logits
            probs = torch.softmax(logits, dim=1)
            pred = torch.argmax(probs, dim=1).item()
            confidence = probs[0, pred].item()
        label = "AI" if pred == 1 else "Human"
        text_result = {"label": label, "confidence": confidence}
    else:
        text_result = None

    # Classify and OCR each extracted image
    classified_images = []
    doc = fitz.open(tmp_path)
    for img_info in images:
        page_num = img_info["page"] - 1
        img_index = img_info["img_index"] - 1
        page = doc[page_num]
        img_list = page.get_images(full=True)
        xref = img_list[img_index][0]
        base_image = doc.extract_image(xref)
        image_bytes = base_image["image"]
        pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image = image_transform(pil_image).unsqueeze(0).to(device)

        # Image classification
        with torch.no_grad():
            outputs = image_model(image)
            probs = torch.softmax(outputs, dim=1)
            pred = torch.argmax(probs, dim=1).item()
            confidence = probs[0, pred].item()
        image_label = image_classes[pred]

        # OCR on image
        ocr_results = ocr_reader.readtext(np.array(pil_image))
        extracted_text = " ".join([res[1] for res in ocr_results])

        # Text detection if text found
        if extracted_text.strip():
            inputs = tokenizer(extracted_text, return_tensors="pt", truncation=True, max_length=512)
            with torch.no_grad():
                outputs = text_model(**inputs)
                logits = outputs.logits
                probs = torch.softmax(logits, dim=1)
                pred = torch.argmax(probs, dim=1).item()
                text_confidence = probs[0, pred].item()
            text_label = "AI" if pred == 1 else "Human"
            text_result_img = {"label": text_label, "confidence": text_confidence, "text": extracted_text}
        else:
            text_result_img = None

        classified_images.append({
            "page": img_info["page"],
            "img_index": img_info["img_index"],
            "image_label": image_label,
            "image_confidence": confidence,
            "ocr_text": extracted_text,
            "text_result": text_result_img
        })

    # Clean up temp file
    os.remove(tmp_path)
    return {"text_result": text_result, "images": classified_images, "extracted_text": text}

# --- Image detection endpoint with OCR integration ---
@app.post("/detect-image")
async def detect_image(file: UploadFile = File(...)):
    image_bytes = await file.read()
    pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image_transform(pil_image).unsqueeze(0).to(device)

    # OCR text extraction
    ocr_results = ocr_reader.readtext(np.array(pil_image))
    extracted_text = " ".join([res[1] for res in ocr_results])

    # Heuristic: If OCR finds a lot of text, flag as 'text_only' image
    text_only = False
    if len(extracted_text.split()) > 20:  # You can adjust this threshold
        text_only = True

    # Image classification (skip or flag if text_only)
    if text_only:
        image_result = {"label": "text_only", "confidence": None, "note": "Image contains mostly text (screenshot or document)"}
    else:
        with torch.no_grad():
            outputs = image_model(image)
            probs = torch.softmax(outputs, dim=1)
            pred = torch.argmax(probs, dim=1).item()
            confidence = probs[0, pred].item()
        image_label = image_classes[pred]
        image_result = {"label": image_label, "confidence": confidence}

    # Text detection if text found
    if extracted_text.strip():
        inputs = tokenizer(extracted_text, return_tensors="pt", truncation=True, max_length=512)
        with torch.no_grad():
            outputs = text_model(**inputs)
            logits = outputs.logits
            probs = torch.softmax(logits, dim=1)
            pred = torch.argmax(probs, dim=1).item()
            text_confidence = probs[0, pred].item()
        text_label = "AI" if pred == 1 else "Human"
        text_result = {"label": text_label, "confidence": text_confidence, "text": extracted_text}
    else:
        text_result = None

    return {"image_result": image_result, "text_result": text_result}
