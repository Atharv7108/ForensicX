import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import pickle
import os


MODEL_NAME = "roberta-base-openai-detector"
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAVE_PATH = os.path.join(BASE_DIR, "models", "text_model.pkl")

def save_model():
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)
    with open(SAVE_PATH, "wb") as f:
        pickle.dump({"tokenizer": tokenizer, "model": model}, f)
    print(f"Model and tokenizer saved to {SAVE_PATH}")

if __name__ == "__main__":
    save_model()
