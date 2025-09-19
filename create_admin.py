#!/usr/bin/env python3
"""
Script to create an admin user directly in the database
"""
import sys
import os
sys.path.append('backend')

from backend.database import get_db, User, create_tables
from backend.auth import get_password_hash
from datetime import datetime

def create_admin_user():
    """Create admin user with known credentials"""
    # First create tables if they don't exist
    create_tables()
    print("✅ Database tables created/verified")
    
    db = next(get_db())
    
    # Check if admin@forensicx.com already exists
    existing_user = db.query(User).filter(User.email == "admin@forensicx.com").first()
    if existing_user:
        print("✅ Admin user already exists!")
        print(f"Email: admin@forensicx.com")
        print(f"Username: {existing_user.username}")
        return
    
    # Create new admin user
    admin_password = "admin123"  # Known password
    hashed_password = get_password_hash(admin_password)
    
    admin_user = User(
        email="admin@forensicx.com",
        username="admin",
        full_name="Admin User",
        hashed_password=hashed_password,
        is_active=True,
        is_superuser=True,
        created_at=datetime.utcnow()
    )
    
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    
    print("✅ Admin user created successfully!")
    print(f"Email: admin@forensicx.com")
    print(f"Username: admin")
    print(f"Password: admin123")
    print(f"User ID: {admin_user.id}")
    
    db.close()

if __name__ == "__main__":
    create_admin_user()