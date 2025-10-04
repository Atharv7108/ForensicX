import razorpay
from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel
import os
import logging

try:
    from .auth import get_current_active_user
    from .database import get_db, User
except ImportError:
    from auth import get_current_active_user
    from database import get_db, User

router = APIRouter()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_RKCU4kkAe3HIkw")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "jw1MZ563bg6cTDqgYgP0WdE5")

logger.info(f"Razorpay Key ID: {RAZORPAY_KEY_ID}")
logger.info(f"Razorpay Key Secret: {'*' * len(RAZORPAY_KEY_SECRET) if RAZORPAY_KEY_SECRET else 'None'}")

try:
    razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
    logger.info("Razorpay client initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize Razorpay client: {e}")
    razorpay_client = None

class CreateOrderRequest(BaseModel):
    amount: int  # in INR paise (e.g., 10000 = ₹100)
    plan: str  # 'pro' or 'plus'

class VerifyPaymentRequest(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str

@router.post("/payment/create-order")
def create_order(data: CreateOrderRequest, user: User = Depends(get_current_active_user)):
    try:
        # Check if Razorpay client is initialized
        if razorpay_client is None:
            logger.error("Razorpay client is not initialized")
            raise HTTPException(status_code=500, detail="Payment service not available")
        
        # Validate plan
        if data.plan not in ["pro", "plus"]:
            raise HTTPException(status_code=400, detail="Invalid plan")
        
        logger.info(f"Creating order for user {user.id}, plan: {data.plan}, amount: {data.amount}")
        
        # Create order
        order_data = {
            "amount": data.amount,
            "currency": "INR",
            "payment_capture": 1,
            "notes": {"user_id": str(user.id), "plan": data.plan}
        }
        
        logger.info(f"Order data: {order_data}")
        order = razorpay_client.order.create(order_data)
        
        logger.info(f"Order created successfully: {order.get('id')}")
        return {"order_id": order["id"], "amount": order["amount"], "currency": order["currency"]}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating Razorpay order: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(e)}")

@router.post("/payment/verify")
def verify_payment(data: VerifyPaymentRequest, user: User = Depends(get_current_active_user), db=Depends(get_db)):
    try:
        # Check if Razorpay client is initialized
        if razorpay_client is None:
            logger.error("Razorpay client is not initialized")
            raise HTTPException(status_code=500, detail="Payment service not available")
        
        logger.info(f"Verifying payment for user {user.id}")
        
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
        
        logger.info(f"Payment verified successfully, upgrading to plan: {plan_type}")
        
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
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Payment verification failed: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Payment verification failed: {str(e)}")
