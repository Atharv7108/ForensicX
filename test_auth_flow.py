#!/usr/bin/env python3
"""
Test script to verify authentication and image detection flow
"""
import requests
import json

BASE_URL = "http://localhost:8001"

def test_authentication():
    """Test login and get token"""
    print("🔐 Testing authentication...")
    
    login_data = {
        "email": "admin@forensicx.com",
        "password": "admin123"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login-json", json=login_data)
    
    if response.status_code == 200:
        data = response.json()
        token = data.get("access_token")
        print(f"✅ Login successful! Token: {token[:20]}...")
        return token
    else:
        print(f"❌ Login failed: {response.status_code} - {response.text}")
        return None

def test_token_verification(token):
    """Test token verification"""
    print("\n🔍 Testing token verification...")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/auth/verify-token", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Token valid! User: {data.get('email')}")
        return True
    else:
        print(f"❌ Token verification failed: {response.status_code} - {response.text}")
        return False

def test_current_user(token):
    """Test getting current user info"""
    print("\n👤 Testing current user endpoint...")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ User info retrieved! User: {data.get('username')} ({data.get('email')})")
        print(f"   Plan: {data.get('plan_type')}, Detections: {data.get('monthly_detections')}")
        return True
    else:
        print(f"❌ User info failed: {response.status_code} - {response.text}")
        return False

def test_image_detection_endpoint(token):
    """Test image detection endpoint availability"""
    print("\n🖼️  Testing image detection endpoint...")
    
    # Create a simple test file
    import tempfile
    import os
    
    # Create a small test image file
    test_file_path = "/Users/atharvravindragole/Documents/Developer/ForensicX/test_text_image.png"
    
    if not os.path.exists(test_file_path):
        print(f"❌ Test image file not found: {test_file_path}")
        return False
    
    headers = {"Authorization": f"Bearer {token}"}
    
    with open(test_file_path, 'rb') as f:
        files = {"file": f}
        response = requests.post(f"{BASE_URL}/detect-image", headers=headers, files=files)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Image detection successful!")
        print(f"   Image result: {data.get('image_result', {}).get('label')} ({data.get('image_result', {}).get('confidence')})")
        if data.get('text_result'):
            print(f"   Text result: {data.get('text_result', {}).get('label')} ({data.get('text_result', {}).get('confidence')})")
        return True
    else:
        print(f"❌ Image detection failed: {response.status_code} - {response.text}")
        return False

def main():
    print("🚀 Testing ForensicX Authentication & Image Detection Flow\n")
    
    # Test authentication
    token = test_authentication()
    if not token:
        return
    
    # Test token verification
    if not test_token_verification(token):
        return
    
    # Test current user
    if not test_current_user(token):
        return
    
    # Test image detection
    test_image_detection_endpoint(token)
    
    print("\n✅ All tests completed!")

if __name__ == "__main__":
    main()