#!/usr/bin/env python3
"""
Test script to simulate quota exceeded (429) error for upgrade prompt testing
"""
import requests
import json
import sqlite3

BASE_URL = "http://localhost:8001"

def update_user_detection_count():
    """Update admin user to have 20 detections (at the free limit)"""
    try:
        conn = sqlite3.connect('forensicx.db')
        cursor = conn.cursor()
        
        # Update admin user to have 20 monthly detections (free limit)
        cursor.execute("""
            UPDATE users 
            SET monthly_detections = 20, plan_type = 'free'
            WHERE email = 'admin@forensicx.com'
        """)
        
        conn.commit()
        conn.close()
        print("✅ Updated admin user to have 20 detections (free limit reached)")
        return True
    except Exception as e:
        print(f"❌ Failed to update user: {e}")
        return False

def test_quota_exceeded():
    """Test the quota exceeded scenario"""
    print("🧪 Testing quota exceeded scenario...")
    
    # First, login to get token
    login_data = {
        "email": "admin@forensicx.com",
        "password": "admin123"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login-json", json=login_data)
    if response.status_code != 200:
        print(f"❌ Login failed: {response.status_code} - {response.text}")
        return False
    
    token = response.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}
    
    print(f"✅ Login successful! Token: {token[:20]}...")
    
    # Try to make a detection (should fail with 429)
    test_file_path = "/Users/atharvravindragole/Documents/Developer/ForensicX/test_text_image.png"
    
    try:
        with open(test_file_path, 'rb') as f:
            files = {"file": f}
            response = requests.post(f"{BASE_URL}/detect-image", headers=headers, files=files)
        
        if response.status_code == 429:
            print(f"✅ Quota exceeded as expected!")
            print(f"   Status: {response.status_code}")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"⚠️  Unexpected response: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return False

def reset_user_detection_count():
    """Reset admin user detection count for future testing"""
    try:
        conn = sqlite3.connect('forensicx.db')
        cursor = conn.cursor()
        
        # Reset admin user detections
        cursor.execute("""
            UPDATE users 
            SET monthly_detections = 0
            WHERE email = 'admin@forensicx.com'
        """)
        
        conn.commit()
        conn.close()
        print("✅ Reset admin user detection count")
        return True
    except Exception as e:
        print(f"❌ Failed to reset user: {e}")
        return False

def main():
    print("🚀 Testing Upgrade Prompt Functionality\n")
    
    # Step 1: Set user to quota limit
    if not update_user_detection_count():
        return
    
    # Step 2: Test quota exceeded
    if test_quota_exceeded():
        print("\n✅ Quota exceeded test successful!")
        print("Frontend should now show the upgrade prompt when this error occurs.")
    
    # Step 3: Reset for future testing
    print("\n🔄 Resetting user for future testing...")
    reset_user_detection_count()

if __name__ == "__main__":
    main()