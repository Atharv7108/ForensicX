# app.py
import os
import io
import tempfile
import pickle
import torch
import re
from fastapi import FastAPI, UploadFile, File, Depends, WebSocket, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
from torchvision import models, transforms
import numpy as np
import easyocr
import fitz  # PyMuPDF

# Import authentication modules (optional for backwards compatibility)
try:
    from .auth_routes import router as auth_router
    from .auth import get_current_active_user
    from .database import User, get_db
    from .websocket_manager import manager
    from .plan_limits import can_perform_detection, increment_detection_count, get_remaining_detections
    AUTH_AVAILABLE = True
except ImportError:
    try:
        # Try absolute imports as fallback
        import sys
        import os
        sys.path.append(os.path.dirname(__file__))
        from auth_routes import router as auth_router
        from auth import get_current_active_user
        from database import User, get_db
        from websocket_manager import manager
        from plan_limits import can_perform_detection, increment_detection_count, get_remaining_detections
        AUTH_AVAILABLE = True
    except ImportError as e:
        print(f"Authentication modules not available: {e}")
        AUTH_AVAILABLE = False
        manager = None

# --- FastAPI app ---
app = FastAPI(title="ForensicX Multi-Modal Detector API")

# --- CORS middleware (MUST be added BEFORE routes) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://localhost:3000", 
        "http://localhost:8080",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8080",
        "*"  # Allow all origins for development
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"],
)

# Include authentication routes if available
if AUTH_AVAILABLE:
    app.include_router(auth_router)
    print("✅ Authentication routes loaded successfully")
    
    # Include admin routes for development
    try:
        from .admin_routes import router as admin_router
        app.include_router(admin_router)
        print("✅ Admin routes loaded successfully")
        # Register Razorpay payment router
        try:
            from .razorpay_routes import router as razorpay_router
            app.include_router(razorpay_router, prefix="/api")
            print("✅ Razorpay payment routes loaded successfully")
        except ImportError:
            try:
                from razorpay_routes import router as razorpay_router
                app.include_router(razorpay_router, prefix="/api")
                print("✅ Razorpay payment routes loaded successfully")
            except ImportError:
                print("⚠️  Razorpay payment routes not available")
    except ImportError:
        try:
            from admin_routes import router as admin_router
            app.include_router(admin_router)
            print("✅ Admin routes loaded successfully")
        except ImportError:
            print("⚠️  Admin routes not available")
else:
    print("⚠️  Authentication modules not available")

# --- Base directory ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# --- Load text model ---
TEXT_MODEL_PATH = os.path.join(BASE_DIR, "models", "text_model.pkl")
with open(TEXT_MODEL_PATH, "rb") as f:
    data = pickle.load(f)
    tokenizer = data["tokenizer"]
    text_model = data["model"]
    text_model.eval()

# --- Load image model (original) ---
IMAGE_MODEL_PATH = os.path.join(BASE_DIR, "models", "efficientnet_best.pth")
# Try original class order to match training data
image_classes = ['ai_enhanced', 'ai_generated', 'natural']
# Previously tried: ['natural', 'ai_generated', 'ai_enhanced']

device = torch.device("mps") if torch.backends.mps.is_available() else torch.device("cpu")

# Try loading the retrained final model with different approaches
# Try to load the model, checking what type it is first
loaded_data = torch.load(IMAGE_MODEL_PATH, map_location=device)
print(f"🔍 Model loading debug: Type of loaded data: {type(loaded_data)}")

if hasattr(loaded_data, 'eval'):
    # It's a full model
    image_model = loaded_data
    print(f"✅ Loaded original model (full) from {IMAGE_MODEL_PATH}")
else:
    # It's a state dict
    print(f"⚠️  Loaded data is state_dict, creating model structure...")
    image_model = models.efficientnet_b0(pretrained=False)
    num_ftrs = image_model.classifier[1].in_features
    image_model.classifier[1] = torch.nn.Linear(num_ftrs, len(image_classes))
    image_model.load_state_dict(loaded_data)
    print(f"✅ Loaded original model (state_dict) from {IMAGE_MODEL_PATH}")

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

# --- Helper function for granular text analysis ---
def analyze_text_granular(text: str, tokenizer, model, device):
    """
    Analyze text in sentences and return granular AI detection results.
    """
    # Split text into sentences using regex (basic sentence splitter)
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())

    highlights = []
    current_pos = 0
    total_ai_length = 0
    total_length = len(text)

    for sentence in sentences:
        if not sentence.strip():
            continue

        sentence_length = len(sentence)
        sentence_start = current_pos
        sentence_end = current_pos + sentence_length

        # Analyze the sentence
        inputs = tokenizer(sentence, return_tensors="pt", truncation=True, max_length=512)
        with torch.no_grad():
            outputs = model(**inputs)
            logits = outputs.logits
            probs = torch.softmax(logits, dim=1)
            pred = torch.argmax(probs, dim=1).item()
            confidence = probs[0, pred].item()

        # If AI detected with confidence > 0.7, mark as AI highlight
        if pred == 1 and confidence > 0.7:
            highlights.append({
                "start": sentence_start,
                "end": sentence_end,
                "type": "ai",
                "confidence": confidence
            })
            total_ai_length += sentence_length
        else:
            highlights.append({
                "start": sentence_start,
                "end": sentence_end,
                "type": "human",
                "confidence": confidence
            })

        current_pos = sentence_end + 1  # +1 for space

    ai_percentage = (total_ai_length / total_length * 100) if total_length > 0 else 0

    return highlights, ai_percentage

# --- Text request model ---
class TextRequest(BaseModel):
    text: str

# --- Text detection endpoint ---
@app.post("/detect-text")
def detect_text(req: TextRequest, current_user: User = Depends(get_current_active_user), db = Depends(get_db)):
    # Check if user can perform detection
    if not can_perform_detection(current_user):
        remaining = get_remaining_detections(current_user)
        raise HTTPException(
            status_code=429, 
            detail=f"Detection limit exceeded. You have {remaining} detections remaining this month. Upgrade your plan for more detections."
        )
    
    # Perform detection
    highlights, ai_percentage = analyze_text_granular(req.text, tokenizer, text_model, device)
    
    # Increment detection count
    current_user = increment_detection_count(db, current_user)
    
    # Determine overall label based on AI percentage
    overall_label = "AI" if ai_percentage > 50 else "Human"
    overall_confidence = ai_percentage / 100 if overall_label == "AI" else (100 - ai_percentage) / 100
    
    return {
        "label": overall_label,
        "confidence": overall_confidence,
        "highlights": highlights,
        "ai_percentage": ai_percentage,
        "detections_used": current_user.monthly_detections,
        "remaining_detections": get_remaining_detections(current_user)
    }

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
async def detect_pdf(file: UploadFile = File(...), current_user: User = Depends(get_current_active_user), db = Depends(get_db)):
    # Check if user can perform detection
    if not can_perform_detection(current_user):
        remaining = get_remaining_detections(current_user)
        raise HTTPException(
            status_code=429, 
            detail=f"Detection limit exceeded. You have {remaining} detections remaining this month. Upgrade your plan for more detections."
        )
    
    # Save uploaded PDF to temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    # Extract text and images
    text, images = extract_text_and_images_from_pdf(tmp_path)

    # Granular text detection for PDF text
    if text.strip():
        highlights, ai_percentage = analyze_text_granular(text, tokenizer, text_model, device)
        # Determine overall label based on AI percentage
        overall_label = "AI" if ai_percentage > 50 else "Human"
        overall_confidence = ai_percentage / 100 if overall_label == "AI" else (100 - ai_percentage) / 100
        text_result = {
            "label": overall_label,
            "confidence": overall_confidence,
            "highlights": highlights,
            "ai_percentage": ai_percentage
        }
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

    # Increment detection count
    current_user = increment_detection_count(db, current_user)

    # Clean up temp file
    os.remove(tmp_path)
    return {
        "text_result": text_result, 
        "images": classified_images, 
        "extracted_text": text,
        "detections_used": current_user.monthly_detections,
        "remaining_detections": get_remaining_detections(current_user)
    }

# --- Public Image detection endpoint (for testing) ---
@app.post("/detect-image-public")
async def detect_image_public(file: UploadFile = File(...)):
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
            
            # Enhanced debug output  
            print(f"🔍 Image prediction debug (PUBLIC ENDPOINT):")
            print(f"   Model: {IMAGE_MODEL_PATH}")
            print(f"   Model output shape: {outputs.shape}")
            print(f"   Raw outputs: {outputs[0].cpu().numpy()}")
            print(f"   Raw outputs sum: {outputs[0].cpu().numpy().sum()}")
            print(f"   Probabilities: {probs[0].cpu().numpy()}")
            print(f"   Class order: {image_classes}")
            for i, (cls, prob) in enumerate(zip(image_classes, probs[0].cpu().numpy())):
                print(f"   Class {i} ({cls}): {prob:.4f} ({prob*100:.2f}%)")
            print(f"   → Predicted class index: {pred}")
            print(f"   → Predicted class: {image_classes[pred]}")
            print(f"   → Confidence: {confidence:.4f}")
            print(f"   → Output variance: {outputs[0].var().item():.6f}")
            
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

    return {
        "image_result": image_result, 
        "text_result": text_result,
        "note": "Public endpoint - no authentication required"
    }

# --- Image detection endpoint with OCR integration ---
@app.post("/detect-image")
async def detect_image(file: UploadFile = File(...), current_user: User = Depends(get_current_active_user), db = Depends(get_db)):
    # Check if user can perform detection
    if not can_perform_detection(current_user):
        remaining = get_remaining_detections(current_user)
        raise HTTPException(
            status_code=429, 
            detail=f"Detection limit exceeded. You have {remaining} detections remaining this month. Upgrade your plan for more detections."
        )
    
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
            
            # Debug output
            print(f"🔍 Image prediction debug:")
            print(f"   Raw outputs: {outputs[0].cpu().numpy()}")
            print(f"   Probabilities: {probs[0].cpu().numpy()}")
            for i, (cls, prob) in enumerate(zip(image_classes, probs[0].cpu().numpy())):
                print(f"   Class {i} ({cls}): {prob:.4f} ({prob*100:.2f}%)")
            print(f"   → Predicted class index: {pred}")
            print(f"   → Predicted class: {image_classes[pred]}")
            print(f"   → Confidence: {confidence:.4f}")
            
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

    # Increment detection count
    current_user = increment_detection_count(db, current_user)

    return {
        "image_result": image_result, 
        "text_result": text_result,
        "detections_used": current_user.monthly_detections,
        "remaining_detections": get_remaining_detections(current_user)
    }
