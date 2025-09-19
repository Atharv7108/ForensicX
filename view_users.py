#!/usr/bin/env python3
"""
Script to view login data from ForensicX database
"""
import sqlite3
import json
from datetime import datetime

def view_users():
    """View all users in the database"""
    try:
        # Connect to the database
        conn = sqlite3.connect('forensicx.db')
        cursor = conn.cursor()
        
        # Get all users
        cursor.execute("SELECT * FROM users")
        users = cursor.fetchall()
        
        # Get column names
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        
        print("="*60)
        print("FORENSICX - USER LOGIN DATA")
        print("="*60)
        print(f"Total Users: {len(users)}")
        print("-"*60)
        
        if users:
            # Print header
            print(f"{'ID':<5} {'Username':<15} {'Email':<25} {'Created':<20} {'Active':<8}")
            print("-"*60)
            
            # Print user data
            for user in users:
                user_dict = dict(zip(columns, user))
                print(f"{user_dict['id']:<5} {user_dict['username']:<15} {user_dict['email']:<25} {user_dict['created_at']:<20} {user_dict['is_active']}")
        else:
            print("No users found in database.")
        
        print("-"*60)
        
        # Get detection history
        cursor.execute("SELECT * FROM detection_history")
        detections = cursor.fetchall()
        
        print(f"Total Detections: {len(detections)}")
        
        if detections:
            print("\nRecent Detection History:")
            cursor.execute("PRAGMA table_info(detection_history)")
            det_columns = [column[1] for column in cursor.fetchall()]
            
            print(f"{'ID':<5} {'User ID':<8} {'Type':<10} {'Result':<15} {'Created':<20}")
            print("-"*60)
            
            for detection in detections[-5:]:  # Show last 5 detections
                det_dict = dict(zip(det_columns, detection))
                print(f"{det_dict['id']:<5} {det_dict['user_id']:<8} {det_dict['content_type']:<10} {det_dict['detection_result']:<15} {det_dict['created_at']:<20}")
        
        conn.close()
        
    except sqlite3.Error as e:
        print(f"Database error: {e}")
    except Exception as e:
        print(f"Error: {e}")

def view_user_details(user_id=None, username=None, email=None):
    """View detailed information for a specific user"""
    try:
        conn = sqlite3.connect('forensicx.db')
        cursor = conn.cursor()
        
        # Build query based on provided parameter
        if user_id:
            cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        elif username:
            cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        elif email:
            cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        else:
            print("Please provide user_id, username, or email")
            return
        
        user = cursor.fetchone()
        
        if user:
            cursor.execute("PRAGMA table_info(users)")
            columns = [column[1] for column in cursor.fetchall()]
            user_dict = dict(zip(columns, user))
            
            print("="*50)
            print("USER DETAILS")
            print("="*50)
            for key, value in user_dict.items():
                if key != 'hashed_password':  # Don't show password hash
                    print(f"{key.replace('_', ' ').title():<15}: {value}")
            
            # Get user's detection history
            cursor.execute("SELECT * FROM detection_history WHERE user_id = ?", (user_dict['id'],))
            detections = cursor.fetchall()
            
            print(f"\nTotal Detections: {len(detections)}")
            
        else:
            print("User not found.")
        
        conn.close()
        
    except sqlite3.Error as e:
        print(f"Database error: {e}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "user" and len(sys.argv) > 2:
            view_user_details(username=sys.argv[2])
        elif sys.argv[1] == "email" and len(sys.argv) > 2:
            view_user_details(email=sys.argv[2])
        elif sys.argv[1] == "id" and len(sys.argv) > 2:
            view_user_details(user_id=int(sys.argv[2]))
        else:
            print("Usage:")
            print("  python view_users.py              # View all users")
            print("  python view_users.py user <username>  # View specific user by username")
            print("  python view_users.py email <email>    # View specific user by email")
            print("  python view_users.py id <user_id>     # View specific user by ID")
    else:
        view_users()