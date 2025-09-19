"""
Admin routes for viewing user data with real-time updates
"""
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from backend.database import get_db, User, DetectionHistory
from backend.auth import get_current_user
from backend.websocket_manager import manager
from typing import List, Dict, Any
import json
from datetime import datetime

router = APIRouter(prefix="/admin", tags=["admin"])

# Admin user configuration - Add your admin emails here
ADMIN_EMAILS = ["admin@forensicx.com", "atharvgole@gmail.com"]

def is_admin(current_user: User = Depends(get_current_user)):
    """Check if current user is an admin"""
    if current_user.email not in ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# Removed WebSocket related code and helper function for real-time admin dashboard

# Removed imports related to WebSocket and token validation for WebSocket

# Removed the entire websocket_endpoint function and get_user_from_token helper

# The rest of the admin routes remain unchanged

@router.get("/dashboard")
async def admin_dashboard(
    admin_user: User = Depends(is_admin),
    db: Session = Depends(get_db)
):
    """Get comprehensive admin dashboard data with real-time statistics"""
    # Get real-time statistics
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    total_detections = db.query(DetectionHistory).count()
    
    # Get plan distribution
    plan_counts = {}
    for plan in ["free", "pro", "plus"]:
        count = db.query(User).filter(User.plan_type == plan).count()
        plan_counts[plan] = count
    
    # Recent users (last 10)
    recent_users = db.query(User).order_by(User.created_at.desc()).limit(10).all()
    
    # Recent detections (last 10)
    recent_detections = db.query(DetectionHistory).order_by(DetectionHistory.created_at.desc()).limit(10).all()
    
    dashboard_data = {
        "stats": {
            "total_users": total_users,
            "active_users": active_users,
            "inactive_users": total_users - active_users,
            "total_detections": total_detections,
            "plan_distribution": plan_counts,
            "last_updated": datetime.now().isoformat()
        },
        "recent_users": [
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "plan_type": user.plan_type,
                "total_detections": user.total_detections,
                "monthly_detections": user.monthly_detections,
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "is_active": user.is_active
            } for user in recent_users
        ],
        "recent_detections": [
            {
                "id": detection.id,
                "user_id": detection.user_id,
                "detection_type": detection.detection_type,
                "result": detection.result,
                "confidence": detection.confidence,
                "created_at": detection.created_at.isoformat() if detection.created_at else None
            } for detection in recent_detections
        ]
    }
    
    # Broadcast stats update to all connected admin clients
    await manager.send_stats_update(dashboard_data["stats"])
    
    return dashboard_data

@router.get("/users/live")
async def get_all_users_live(
    admin_user: User = Depends(is_admin),
    db: Session = Depends(get_db)
):
    """Get all users with real-time updates"""
    users = db.query(User).order_by(User.created_at.desc()).all()
    users_data = [
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "plan_type": user.plan_type,
            "total_detections": user.total_detections,
            "monthly_detections": user.monthly_detections,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "updated_at": user.updated_at.isoformat() if user.updated_at else None,
            "is_active": user.is_active,
            "is_superuser": user.is_superuser
        } for user in users
    ]
    
    # Broadcast to all connected admin clients
    await manager.send_user_update({"users": users_data, "total_count": len(users_data)})
    
    return {"users": users_data, "total_count": len(users_data)}

@router.get("/users/{user_id}/details")
async def get_user_details(
    user_id: int,
    admin_user: User = Depends(is_admin),
    db: Session = Depends(get_db)
):
    """Get detailed information for a specific user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user's detection history
    detections = db.query(DetectionHistory).filter(DetectionHistory.user_id == user_id).order_by(DetectionHistory.created_at.desc()).all()
    
    detection_list = []
    for detection in detections:
        detection_data = {
            "id": detection.id,
            "detection_type": detection.detection_type,
            "result": detection.result,
            "confidence": detection.confidence,
            "content_hash": detection.content_hash,
            "created_at": detection.created_at.isoformat() if detection.created_at else None,
        }
        detection_list.append(detection_data)
    
    user_details = {
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "is_active": user.is_active,
            "is_superuser": user.is_superuser,
            "plan_type": user.plan_type,
            "total_detections": user.total_detections,
            "monthly_detections": user.monthly_detections,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "updated_at": user.updated_at.isoformat() if user.updated_at else None,
        },
        "detection_history": detection_list,
        "detection_count": len(detection_list)
    }
    
    return user_details

@router.get("/stats")
async def get_stats(
    admin_user: User = Depends(is_admin),
    db: Session = Depends(get_db)
):
    """Get overall platform statistics with real-time updates"""
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    total_detections = db.query(DetectionHistory).count()
    
    # Get detection types breakdown
    detection_types = db.query(DetectionHistory.detection_type).distinct().all()
    type_counts = {}
    for dtype in detection_types:
        if dtype[0]:  # Check if detection_type is not None
            count = db.query(DetectionHistory).filter(DetectionHistory.detection_type == dtype[0]).count()
            type_counts[dtype[0]] = count
    
    # Get plan distribution
    plan_types = db.query(User.plan_type).distinct().all()
    plan_counts = {}
    for ptype in plan_types:
        if ptype[0]:  # Check if plan_type is not None
            count = db.query(User).filter(User.plan_type == ptype[0]).count()
            plan_counts[ptype[0]] = count
    
    stats_data = {
        "users": {
            "total": total_users,
            "active": active_users,
            "inactive": total_users - active_users,
            "by_plan": plan_counts
        },
        "detections": {
            "total": total_detections,
            "by_type": type_counts
        },
        "last_updated": datetime.now().isoformat()
    }
    
    # Broadcast stats update to all connected admin clients
    await manager.send_stats_update(stats_data)
    
    return stats_data

@router.post("/users/{user_id}/toggle-status")
async def toggle_user_status(
    user_id: int,
    admin_user: User = Depends(is_admin),
    db: Session = Depends(get_db)
):
    """Toggle user active/inactive status"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Toggle status
    user.is_active = not user.is_active
    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    
    # Broadcast user update
    users = db.query(User).order_by(User.created_at.desc()).all()
    users_data = [
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "full_name": u.full_name,
            "plan_type": u.plan_type,
            "total_detections": u.total_detections,
            "monthly_detections": u.monthly_detections,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "updated_at": u.updated_at.isoformat() if u.updated_at else None,
            "is_active": u.is_active,
            "is_superuser": u.is_superuser
        } for u in users
    ]
    
    await manager.send_user_update({"users": users_data, "total_count": len(users_data)})
    
    return {
        "message": f"User {user.username} status updated",
        "user": {
            "id": user.id,
            "username": user.username,
            "is_active": user.is_active
        }
    }

@router.get("/stats")
async def get_stats(db: Session = Depends(get_db)):
    """Get overall platform statistics"""
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    total_detections = db.query(DetectionHistory).count()
    
    # Get detection types breakdown
    detection_types = db.query(DetectionHistory.detection_type).distinct().all()
    type_counts = {}
    for dtype in detection_types:
        count = db.query(DetectionHistory).filter(DetectionHistory.detection_type == dtype[0]).count()
        type_counts[dtype[0]] = count
    
    # Get plan distribution
    plan_types = db.query(User.plan_type).distinct().all()
    plan_counts = {}
    for ptype in plan_types:
        count = db.query(User).filter(User.plan_type == ptype[0]).count()
        plan_counts[ptype[0]] = count
    
    return {
        "users": {
            "total": total_users,
            "active": active_users,
            "inactive": total_users - active_users,
            "by_plan": plan_counts
        },
        "detections": {
            "total": total_detections,
            "by_type": type_counts
        }
    }