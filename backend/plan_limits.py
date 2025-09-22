# Plan limits and detection counting system

PLAN_LIMITS = {
    "free": 20,
    "pro": 500,
    "plus": 1000
}

def get_plan_limit(plan_type: str) -> int:
    """Get the monthly detection limit for a plan type"""
    return PLAN_LIMITS.get(plan_type.lower(), PLAN_LIMITS["free"])

def can_perform_detection(user) -> bool:
    """Check if user can perform another detection based on their plan and usage"""
    limit = get_plan_limit(user.plan_type)
    return user.monthly_detections < limit

def get_remaining_detections(user) -> int:
    """Get remaining detections for the user this month"""
    limit = get_plan_limit(user.plan_type)
    return max(0, limit - user.monthly_detections)

def increment_detection_count(db, user):
    """Increment user's detection count and total count"""
    user.monthly_detections += 1
    user.total_detections += 1
    db.commit()
    db.refresh(user)
    return user