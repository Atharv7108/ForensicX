import pickle
import torch


import os
def load_model():
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    model_path = os.path.join(BASE_DIR, "models", "text_model.pkl")
    with open(model_path, "rb") as f:
        data = pickle.load(f)
    return data["tokenizer"], data["model"]

def predict(text):
    tokenizer, model = load_model()
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        probs = torch.softmax(logits, dim=1)
        pred = torch.argmax(probs, dim=1).item()
        confidence = probs[0, pred].item()
    label = "AI" if pred == 1 else "Human"
    return {"label": label, "confidence": confidence}

if __name__ == "__main__":
    test_texts = [
        "The quick brown fox jumps over the lazy dog.",
        "As an AI language model developed by OpenAI, I am here to help you.",
    ]
    for text in test_texts:
        result = predict(text)
        print(f"Text: {text}\nPrediction: {result['label']} (Confidence: {result['confidence']:.2f})\n")
