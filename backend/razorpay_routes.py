import razorpay
from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel
import os
from .auth import get_current_active_user
from .database import get_db, User

router = APIRouter()

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_RKCU4kkAe3HIkw")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "jw1MZ563bg6cTDqgYgP0WdE5")
razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

class CreateOrderRequest(BaseModel):
    amount: int  # in INR paise (e.g., 10000 = ₹100)
    plan: str  # 'pro' or 'plus'

class VerifyPaymentRequest(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str

@router.post("/payment/create-order")
def create_order(data: CreateOrderRequest, user: User = Depends(get_current_active_user)):
    if data.plan not in ["pro", "plus"]:
        raise HTTPException(status_code=400, detail="Invalid plan")
    order = razorpay_client.order.create({
        "amount": data.amount,
        "currency": "INR",
        "payment_capture": 1,
        "notes": {"user_id": user.id, "plan": data.plan}
    })
    return {"order_id": order["id"], "amount": order["amount"], "currency": order["currency"]}

@router.post("/payment/verify")
def verify_payment(data: VerifyPaymentRequest, user: User = Depends(get_current_active_user), db=Depends(get_db)):
    try:
        # Verify payment signature with Razorpay
        params_dict = {
            'razorpay_order_id': data.razorpay_order_id,
            'razorpay_payment_id': data.razorpay_payment_id,
            'razorpay_signature': data.razorpay_signature
        }
        razorpay_client.utility.verify_payment_signature(params_dict)
        
        # Get order details to find the plan
        order = razorpay_client.order.fetch(data.razorpay_order_id)
        plan_type = order.get('notes', {}).get('plan', 'free')
        
        # Update user plan in database
        db_user = db.query(User).filter(User.id == user.id).first()
        if db_user:
            db_user.plan_type = plan_type
            # Reset monthly detections when upgrading plan (give them a fresh start)
            db_user.monthly_detections = 0
            db.commit()
            db.refresh(db_user)
        
        return {
            "status": "success", 
            "message": f"Plan upgraded to {plan_type}",
            "user_plan": plan_type
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Payment verification failed: {str(e)}")
