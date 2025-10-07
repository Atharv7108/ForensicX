#!/usr/bin/env python3
"""
Quick test of the public endpoint to see current model performance
"""
import requests
import json

def test_current_model():
    url = "http://localhost:8001/detect-image-public"
    file_path = "/Users/atharvravindragole/Documents/Developer/ForensicX/test_text_image.png"
    
    try:
        with open(file_path, 'rb') as f:
            files = {"file": f}
            response = requests.post(url, files=files)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Response received:")
            print(json.dumps(data, indent=2))
        else:
            print(f"❌ Error: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == "__main__":
    test_current_model()