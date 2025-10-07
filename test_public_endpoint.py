#!/usr/bin/env python3
"""
Test the new public image detection endpoint
"""
import requests
import os

BASE_URL = "http://localhost:8001"

def test_public_endpoint():
    """Test the public image detection endpoint"""
    print("🔓 Testing public image detection endpoint...")
    
    # Use the test image
    test_file_path = "/Users/atharvravindragole/Documents/Developer/ForensicX/test_text_image.png"
    
    if not os.path.exists(test_file_path):
        print(f"❌ Test image file not found: {test_file_path}")
        return False
    
    # No authentication headers needed
    with open(test_file_path, 'rb') as f:
        files = {"file": f}
        response = requests.post(f"{BASE_URL}/detect-image-public", files=files)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Public image detection successful!")
        print(f"   Image result: {data.get('image_result', {}).get('label')} ({data.get('image_result', {}).get('confidence')})")
        if data.get('text_result'):
            print(f"   Text result: {data.get('text_result', {}).get('label')} ({data.get('text_result', {}).get('confidence')})")
        print(f"   Note: {data.get('note')}")
        return True
    else:
        print(f"❌ Public image detection failed: {response.status_code} - {response.text}")
        return False

def main():
    print("🚀 Testing Public Image Detection Endpoint\n")
    test_public_endpoint()

if __name__ == "__main__":
    main()