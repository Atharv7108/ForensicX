from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta, datetime

# Import local modules with error handling
try:
    from .database import get_db, create_tables, User
    from .auth import (
        authenticate_user, 
        create_access_token, 
        create_user, 
        get_user_by_email, 
        get_user_by_username,
        get_current_active_user,
        ACCESS_TOKEN_EXPIRE_MINUTES
    )
    from .schemas import (
        RegisterRequest, 
        UserResponse, 
        Token, 
        LoginRequest
    )
    # Import WebSocket manager for real-time updates
    try:
        from .websocket_manager import manager
    except ImportError:
        manager = None
except ImportError:
    # Fallback to absolute imports
    from database import get_db, create_tables, User
    from auth import (
        authenticate_user, 
        create_access_token, 
        create_user, 
        get_user_by_email, 
        get_user_by_username,
        get_current_active_user,
        ACCESS_TOKEN_EXPIRE_MINUTES
    )
    from schemas import (
        RegisterRequest, 
        UserResponse, 
        Token, 
        LoginRequest
    )
    # Import WebSocket manager for real-time updates
    try:
        from websocket_manager import manager
    except ImportError:
        manager = None

# Create router
router = APIRouter(prefix="/auth", tags=["authentication"])

# Create tables on startup
create_tables()

@router.post("/register", response_model=UserResponse)
async def register(user_data: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if user already exists
    if get_user_by_email(db, user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    if get_user_by_username(db, user_data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create new user
    user = create_user(
        db=db,
        email=user_data.email,
        username=user_data.username,
        password=user_data.password,
        full_name=user_data.full_name
    )
    
    return user

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login user and return access token."""
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Update last login time
    user.last_login = datetime.utcnow()
    db.commit()
    db.refresh(user)
    
    # Broadcast user update to admin panel
    if manager:
        await manager.send_user_update({
            "type": "user_login",
            "user_id": user.id,
            "email": user.email,
            "last_login": user.last_login.isoformat() if user.last_login else None
        })
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login-json", response_model=Token)
async def login_json(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Login user with JSON payload."""
    user = authenticate_user(db, login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Update last login time
    user.last_login = datetime.utcnow()
    db.commit()
    db.refresh(user)
    
    # Broadcast user update to admin panel
    if manager:
        await manager.send_user_update({
            "type": "user_login",
            "user_id": user.id,
            "email": user.email,
            "last_login": user.last_login.isoformat() if user.last_login else None
        })
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user = Depends(get_current_active_user)):
    """Get current user information."""
    return current_user

@router.get("/verify-token")
async def verify_token(current_user = Depends(get_current_active_user)):
    """Verify if token is valid."""
    return {"valid": True, "user_id": current_user.id, "email": current_user.email}