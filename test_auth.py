#!/usr/bin/env python3
"""
Test script for ForensicX authentication system
"""
import sys
import os
import requests
import json

# Add the backend directory to Python path
backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_dir)

# Test authentication endpoints
BASE_URL = "http://localhost:8000"

def test_auth_endpoints():
    """Test authentication endpoints"""
    print("🔐 Testing ForensicX Authentication System")
    print("=" * 50)
    
    # Test registration
    print("1. Testing user registration...")
    register_data = {
        "email": "test@forensicx.dev",
        "username": "testuser",
        "password": "testpassword123",
        "full_name": "Test User"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
        if response.status_code == 200:
            print("✅ Registration successful!")
            print(f"User created: {response.json()}")
        else:
            print(f"❌ Registration failed: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ Registration error: {e}")
    
    print("\n" + "-" * 30)
    
    # Test login
    print("2. Testing user login...")
    login_data = {
        "email": "test@forensicx.dev",
        "password": "testpassword123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login-json", json=login_data)
        if response.status_code == 200:
            token_data = response.json()
            print("✅ Login successful!")
            print(f"Token type: {token_data['token_type']}")
            print(f"Access token: {token_data['access_token'][:50]}...")
            
            # Test protected endpoint
            print("\n3. Testing protected endpoint...")
            headers = {"Authorization": f"Bearer {token_data['access_token']}"}
            response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
            
            if response.status_code == 200:
                user_info = response.json()
                print("✅ Protected endpoint access successful!")
                print(f"User info: {user_info}")
            else:
                print(f"❌ Protected endpoint failed: {response.status_code}")
                
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ Login error: {e}")

if __name__ == "__main__":
    print("Make sure the ForensicX server is running on http://localhost:8000")
    print("Starting tests in 3 seconds...")
    import time
    time.sleep(3)
    test_auth_endpoints()