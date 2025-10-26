# 🔬 ForensicX - Complete Technical Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture & Technology Stack](#architecture--technology-stack)
3. [File Structure & Purpose](#file-structure--purpose)
4. [Backend Components Deep Dive](#backend-components-deep-dive)
5. [Machine Learning Models](#machine-learning-models)
6. [Authentication System](#authentication-system)
7. [Database Architecture](#database-architecture)
8. [API Endpoints](#api-endpoints)
9. [Real-Time Features](#real-time-features)
10. [Admin Dashboard](#admin-dashboard)f
11. [Payment Integration](#payment-integration)
12. [Security Implementation](#security-implementation)
13. [Performance Optimizations](#performance-optimizations)
14. [Deployment Guide](#deployment-guide)

---

## 🚀 Project Overview

**ForensicX** is a cutting-edge **Multi-Modal AI Detection System** that can identify AI-generated content across different media types:

- 📝 **Text Analysis**: Detects AI-generated text using BERT-based models
- 🖼️ **Image Classification**: Identifies AI-generated, AI-enhanced, and natural images
- 📄 **PDF Processing**: Combines text and image analysis with OCR capabilities
- 🔄 **Real-Time Monitoring**: Live admin dashboard with WebSocket connections
- 💳 **Subscription System**: Tiered plans with usage tracking and payment integration

### Key Features
- **Granular Text Analysis**: Sentence-level AI detection with confidence scores
- **Multi-Modal Detection**: Process text, images, and PDFs in a single platform
- **Real-Time Admin Panel**: Live statistics and user management
- **Scalable Authentication**: JWT-based system with bcrypt password hashing
- **Payment Integration**: Razorpay payment gateway for plan upgrades
- **Memory Optimized**: Designed for MacBook Air with MPS support

---

## 🏗️ Architecture & Technology Stack

### Backend Framework
- **FastAPI** (0.110.0) - Modern, fast Python web framework
- **Uvicorn** - ASGI server for production deployment
- **Pydantic** - Data validation using Python type annotations

### Machine Learning Stack
- **PyTorch** (2.2.1) - Deep learning framework
- **TorchVision** (0.17.1) - Computer vision library
- **Transformers** (4.43.3) - Hugging Face NLP models
- **EfficientNet-B0** - Image classification model
- **BERT** - Text classification model

### Authentication & Database
- **SQLAlchemy** (2.0.23) - Python ORM
- **PassLib[bcrypt]** - Secure password hashing
- **Python-JOSE** - JWT token management
- **FastAPI-Users** - User authentication system

### Computer Vision & OCR
- **EasyOCR** (1.7.1) - Optical Character Recognition
- **PIL/Pillow** (10.3.0) - Image processing
- **PyMuPDF** (1.24.4) - PDF text and image extraction

### Additional Libraries
- **Razorpay** (1.3.0) - Payment processing
- **WebSockets** - Real-time communication
- **CORS Middleware** - Cross-origin requests

---

## 📁 File Structure & Purpose

### 🔧 Backend Core Files

#### `backend/text_api.py` - Main Application Entry Point
**Location**: `/backend/text_api.py`
**Purpose**: Central FastAPI application with all API endpoints
**Key Features**:
- Multi-modal detection endpoints
- Model loading and initialization
- CORS configuration
- Route registration

**File Dependencies & Imports**:
```python
# Lines 1-15: Import statements showing file relationships
from fastapi import FastAPI, UploadFile, File, Depends, WebSocket, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware

# Import authentication modules (shows how files connect)
try:
    from .auth_routes import router as auth_router          # → auth_routes.py
    from .auth import get_current_active_user              # → auth.py
    from .database import User, get_db                     # → database.py
    from .websocket_manager import manager                 # → websocket_manager.py
    from .plan_limits import can_perform_detection         # → plan_limits.py
    AUTH_AVAILABLE = True
except ImportError:
    # Fallback imports for standalone execution
    import sys, os
    sys.path.append(os.path.dirname(__file__))
    from auth_routes import router as auth_router
    # ... other imports
```

**How This File Calls Other Files**:
1. **`auth_routes.py`**: Included via `app.include_router(auth_router)`
2. **`admin_routes.py`**: Included via `app.include_router(admin_router)`  
3. **`razorpay_routes.py`**: Included via `app.include_router(razorpay_router, prefix="/api")`
4. **`auth.py`**: Used for `get_current_active_user` dependency in endpoints
5. **`database.py`**: Used for `User` model and `get_db` dependency
6. **`plan_limits.py`**: Used for usage validation in detection endpoints

**Core FastAPI Setup Code** (Lines 45-65):
```python
# Core FastAPI setup
app = FastAPI(title="ForensicX Multi-Modal Detector API")

# CORS middleware for frontend communication
app.add_middleware(
    CORsMiddleware,
    allow_origins=[
        "http://localhost:5173",    # Vite dev server
        "http://localhost:3000",    # React dev server
        "http://localhost:8080",
        "*"  # Allow all origins for development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Include authentication routes if available (Lines 70-85)
if AUTH_AVAILABLE:
    app.include_router(auth_router)              # Adds /auth/* endpoints
    app.include_router(admin_router)             # Adds /admin/* endpoints  
    app.include_router(razorpay_router, prefix="/api")  # Adds /api/payment/* endpoints
```

**Model Loading Code** (Lines 90-120):
```python
# Device optimization for Apple Silicon
device = torch.device("mps") if torch.backends.mps.is_available() else torch.device("cpu")

# Load text model from pickle file
TEXT_MODEL_PATH = os.path.join(BASE_DIR, "models", "text_model.pkl")
with open(TEXT_MODEL_PATH, "rb") as f:
    data = pickle.load(f)
    tokenizer = data["tokenizer"]    # BERT tokenizer
    text_model = data["model"]       # BERT model
    text_model.eval()

# Load image model (EfficientNet)
IMAGE_MODEL_PATH = os.path.join(BASE_DIR, "models", "efficientnet_best.pth")
image_model = models.efficientnet_b0(pretrained=False)
num_ftrs = image_model.classifier[1].in_features
image_model.classifier[1] = torch.nn.Linear(num_ftrs, len(image_classes))
image_model.load_state_dict(torch.load(IMAGE_MODEL_PATH))
image_model.to(device)
image_model.eval()
```

**Why This Code & Architecture**:
- **Modular Import System**: Try/except blocks handle both relative and absolute imports
- **Route Registration**: FastAPI routers create modular endpoint organization
- **CORS Configuration**: Enables cross-origin requests from frontend applications
- **Device Optimization**: MPS support leverages Apple Silicon GPU acceleration
- **Model Preloading**: Models loaded once at startup for better performance

#### `backend/database.py` - Database Models & Configuration
**Location**: `/backend/database.py`
**Purpose**: SQLAlchemy ORM models and database connection setup

**How Other Files Use This**:
- **`text_api.py`**: Imports `User`, `get_db` for endpoint dependencies
- **`auth.py`**: Imports `User`, `get_db` for user operations
- **`auth_routes.py`**: Uses `get_db`, `create_tables`, `User` model
- **`admin_routes.py`**: Imports `User`, `DetectionHistory`, `get_db`
- **`razorpay_routes.py`**: Uses `User` model for plan updates

**Database Configuration Code** (Lines 1-20):
```python
from sqlalchemy import Boolean, Column, Integer, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from datetime import datetime
import os

# Database URL configuration with environment variable support
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./forensicx.db")

# Engine creation with SQLite-specific settings
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)  # For PostgreSQL in production

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
```

**User Model Definition** (Lines 22-40):
```python
# User model for authentication and usage tracking
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    
    # Usage tracking for plan limits
    total_detections = Column(Integer, default=0)
    monthly_detections = Column(Integer, default=0)
    plan_type = Column(String, default="free")  # free, pro, plus
```

**Detection History Model** (Lines 42-52):
```python
# Detection History model for audit trail
class DetectionHistory(Base):
    __tablename__ = "detection_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)  # Foreign key to users
    detection_type = Column(String, nullable=False)  # text, image, pdf
    content_hash = Column(String, nullable=False)  # Hash of analyzed content
    result = Column(Text, nullable=False)  # JSON result storage
    confidence = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
```

**Database Session Management** (Lines 70-80):
```python
# Dependency injection for database sessions
def get_db():
    db = SessionLocal()
    try:
        yield db        # Provides database session to endpoints
    finally:
        db.close()      # Ensures proper cleanup

# Table creation function
def create_tables():
    Base.metadata.create_all(bind=engine)
```

**How Files Call This Database Module**:

**In `auth_routes.py`** (Line 25):
```python
from database import get_db, create_tables, User
# Used in: register endpoint, login endpoint, user management
```

**In `text_api.py`** (Line 15):
```python  
from .database import User, get_db
# Used in: @app.post("/detect-text"), @app.post("/detect-image"), @app.post("/detect-pdf")
```

**In `admin_routes.py`** (Line 6):
```python
from backend.database import get_db, User, DetectionHistory
# Used in: admin dashboard, user management, statistics
```

**Why This Code & Design**:
- **Environment Variables**: `DATABASE_URL` allows easy switching between SQLite/PostgreSQL
- **Indexed Columns**: `email`, `username` indexes speed up login queries
- **Timestamp Tracking**: `created_at`, `updated_at` for audit trails
- **Usage Tracking**: `monthly_detections`, `total_detections` for plan enforcement
- **Session Management**: Dependency injection ensures proper database cleanup

#### `backend/auth.py` - Authentication Logic
**Location**: `/backend/auth.py`
**Purpose**: JWT token management and password security

**How Other Files Use This**:
- **`text_api.py`**: Imports `get_current_active_user` for endpoint protection
- **`auth_routes.py`**: Uses all auth functions (create_user, authenticate_user, create_access_token)
- **`admin_routes.py`**: Imports `get_current_user` for admin authentication

**Import Dependencies** (Lines 1-15):
```python
from datetime import datetime, timedelta
from typing import Optional, Union, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

# Import database modules with error handling
try:
    from .database import get_db, User      # Relative import from database.py
except ImportError:
    from database import get_db, User       # Absolute import fallback
```

**Security Configuration** (Lines 17-25):
```python
# Security configuration from environment variables
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing context with bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme for token extraction from Authorization header
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
```

**Password Security Functions** (Lines 27-35):
```python
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash using constant-time comparison."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Generate bcrypt hash with automatic salt generation."""
    return pwd_context.hash(password)
```

**JWT Token Management** (Lines 37-55):
```python
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token with expiration."""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    """Verify JWT token and return payload or None if invalid."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
```

**Database User Operations** (Lines 57-85):
```python
def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Retrieve user by email address."""
    return db.query(User).filter(User.email == email).first()

def authenticate_user(db: Session, email: str, password: str) -> Union[User, bool]:
    """Authenticate user with email and password."""
    user = get_user_by_email(db, email)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_user(db: Session, email: str, username: str, password: str, full_name: str = None) -> User:
    """Create new user with hashed password."""
    hashed_password = get_password_hash(password)
    db_user = User(
        email=email,
        username=username,
        full_name=full_name,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
```

**User Authentication Dependencies** (Lines 87-115):
```python
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """Extract and validate user from JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = verify_token(token)
    if payload is None:
        raise credentials_exception
        
    email: str = payload.get("sub")  # Subject contains user email
    if email is None:
        raise credentials_exception
        
    user = get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
        
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Ensure user account is active."""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
```

**How This File is Called by Other Files**:

**In `text_api.py`** (Lines 200-220):
```python
@app.post("/detect-text")
def detect_text(req: TextRequest, current_user: User = Depends(get_current_active_user)):
    # get_current_active_user validates JWT token and returns active user
    if not can_perform_detection(current_user):
        # ... usage limit check
```

**In `auth_routes.py`** (Lines 50-70):
```python  
@router.post("/register")
async def register(user_data: RegisterRequest, db: Session = Depends(get_db)):
    # Uses create_user function from auth.py
    user = create_user(db=db, email=user_data.email, ...)
    
@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # Uses authenticate_user and create_access_token from auth.py
    user = authenticate_user(db, form_data.username, form_data.password)
    access_token = create_access_token(data={"sub": user.email})
```

**Why This Code & Design**:
- **bcrypt Hashing**: Adaptive cost algorithm with automatic salt generation
- **JWT Stateless**: No server-side session storage, scalable across instances
- **Dependency Injection**: FastAPI dependencies provide clean separation
- **Error Handling**: Specific HTTP exceptions with proper status codes
- **Type Safety**: Optional type hints improve code reliability

#### `backend/schemas.py` - Data Validation Models
**Location**: `/backend/schemas.py`
**Purpose**: Pydantic models for request/response validation

**How Other Files Use This**:
- **`auth_routes.py`**: Uses `RegisterRequest`, `UserResponse`, `Token`, `LoginRequest`
- **All API endpoints**: Use these schemas for automatic request/response validation

**Complete Schema Definitions** (Lines 1-60):
```python
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# Base user schema with common fields
class UserBase(BaseModel):
    email: EmailStr              # Automatic email format validation
    username: str
    full_name: Optional[str] = None

# User creation schema (for registration)
class UserCreate(UserBase):
    password: str               # Password included for creation only

# User update schema (for profile updates)  
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    password: Optional[str] = None

# User response schema (safe for API responses)
class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    total_detections: int       # Usage statistics
    monthly_detections: int
    plan_type: str             # free, pro, plus
    
    class Config:
        from_attributes = True  # Enables SQLAlchemy ORM model conversion

# Authentication schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: Optional[str] = None

# Detection schemas for API requests/responses
class DetectionRequest(BaseModel):
    content: Optional[str] = None
    detection_type: str  # text, image, pdf

class DetectionResponse(BaseModel):
    id: int
    detection_type: str
    result: dict                # JSON result storage
    confidence: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True
```

**How Schemas are Used in Other Files**:

**In `auth_routes.py`** (Lines 20-30):
```python
from schemas import RegisterRequest, UserResponse, Token, LoginRequest

@router.post("/register", response_model=UserResponse)
async def register(user_data: RegisterRequest, db: Session = Depends(get_db)):
    # Pydantic automatically validates user_data against RegisterRequest schema
    # Returns UserResponse schema (excludes sensitive data like password)
    
@router.post("/login", response_model=Token)  
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # Returns Token schema with access_token and token_type
```

**In `text_api.py`** (Lines 180-190):
```python
class TextRequest(BaseModel):
    text: str

@app.post("/detect-text")
def detect_text(req: TextRequest, current_user: User = Depends(get_current_active_user)):
    # req.text is automatically validated as string by Pydantic
    # current_user follows User model from database.py
```

**Automatic Validation Benefits**:

**Email Validation Example**:
```python
# EmailStr automatically validates email format
# Invalid email "not-an-email" would raise validation error:
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

**Response Model Safety**:
```python
# UserResponse excludes sensitive fields like hashed_password
# Even if full User object is returned, only safe fields are serialized
user = get_user_by_email(db, email)
return user  # Pydantic only includes fields defined in UserResponse
```

**Why This Code & Design**:
- **Type Safety**: Automatic validation prevents runtime errors
- **Security**: Response models exclude sensitive database fields
- **Documentation**: Pydantic generates automatic API documentation
- **Serialization**: Handles conversion between Python objects and JSON
- **Error Handling**: Provides detailed validation error messages

#### `backend/auth_routes.py` - Authentication Endpoints
**Location**: `/backend/auth_routes.py`
**Purpose**: User registration, login, and token management

**How This File Connects to Others**:
- **Called by**: `text_api.py` via `app.include_router(auth_router)`
- **Uses**: `database.py` (User, get_db), `auth.py` (all auth functions), `schemas.py` (validation models)
- **Routes Created**: `/auth/register`, `/auth/login`, `/auth/login-json`, `/auth/me`, `/auth/verify-token`

**Import Dependencies** (Lines 1-25):
```python
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta, datetime

# Import local modules with error handling for both relative and absolute imports
try:
    from .database import get_db, create_tables, User
    from .auth import (authenticate_user, create_access_token, create_user, 
                       get_user_by_email, get_user_by_username, get_current_active_user)
    from .schemas import (RegisterRequest, UserResponse, Token, LoginRequest)
    from .websocket_manager import manager  # For real-time admin updates
except ImportError:
    # Fallback to absolute imports
    from database import get_db, create_tables, User
    from auth import (authenticate_user, create_access_token, create_user,
                      get_user_by_email, get_user_by_username, get_current_active_user)
    from schemas import (RegisterRequest, UserResponse, Token, LoginRequest)
    try:
        from websocket_manager import manager
    except ImportError:
        manager = None
```

**Router Setup** (Lines 27-32):
```python
# Create router with prefix and tags for API organization
router = APIRouter(prefix="/auth", tags=["authentication"])

# Create database tables on startup
create_tables()
```

**User Registration Endpoint** (Lines 34-55):
```python
@router.post("/register", response_model=UserResponse)
async def register(user_data: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user with email/username uniqueness validation."""
    
    # Check if user already exists by email
    if get_user_by_email(db, user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username is taken  
    if get_user_by_username(db, user_data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create new user (password automatically hashed in create_user function)
    user = create_user(
        db=db,
        email=user_data.email,
        username=user_data.username,
        password=user_data.password,  # Raw password - hashed in auth.py
        full_name=user_data.full_name
    )
    
    return user  # Pydantic UserResponse excludes password automatically
```

**Login Endpoints** (Lines 57-95):
```python
@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login user with form data and return JWT access token."""
    
    # Authenticate user credentials (calls auth.py functions)
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Update last login timestamp
    user.last_login = datetime.utcnow()
    db.commit()
    db.refresh(user)
    
    # Broadcast login event to admin dashboard (real-time update)
    if manager:
        await manager.send_user_update({
            "type": "user_login",
            "user_id": user.id,
            "email": user.email,
            "last_login": user.last_login.isoformat()
        })
    
    # Create JWT access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login-json", response_model=Token)
async def login_json(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Alternative login endpoint accepting JSON payload."""
    # Same logic as login() but accepts JSON instead of form data
    user = authenticate_user(db, login_data.email, login_data.password)
    # ... rest of login logic identical
```

**User Information Endpoints** (Lines 97-115):
```python
@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user = Depends(get_current_active_user)):
    """Get current authenticated user information."""
    # current_user comes from JWT token validation in auth.py
    return current_user

@router.get("/verify-token")
async def verify_token(current_user = Depends(get_current_active_user)):
    """Verify if JWT token is valid and return user info."""
    return {
        "valid": True,
        "user_id": current_user.id,
        "email": current_user.email
    }
```

**How This Router is Included in Main App** (In `text_api.py`, Lines 70-75):
```python
# Include authentication routes if available
if AUTH_AVAILABLE:
    app.include_router(auth_router)  # Adds all /auth/* endpoints to main app
    print("✅ Authentication routes loaded successfully")
```

**Real-time Integration** (Lines 80-90):
```python
# When user logs in, broadcast to admin dashboard
if manager:
    await manager.send_user_update({
        "type": "user_login",
        "user_id": user.id,
        "email": user.email,
        "last_login": user.last_login.isoformat()
    })
```

**Why This Code & Design**:
- **Router Pattern**: Modular organization of related endpoints
- **Dependency Injection**: Clean separation of database and auth logic
- **Error Handling**: Specific HTTP status codes for different error types
- **Real-time Updates**: WebSocket integration for live admin dashboard
- **Security**: Password hashing handled in separate auth module
- **Validation**: Pydantic schemas ensure data integrity

### 🔐 Admin & Management Files

#### `backend/admin_routes.py` - Admin Dashboard API
**Location**: `/backend/admin_routes.py`
**Purpose**: Admin-only endpoints for user management and statistics

**How This File Connects**:
- **Called by**: `text_api.py` via `app.include_router(admin_router)`
- **Uses**: `database.py` (User, DetectionHistory, get_db), `auth.py` (get_current_user), `websocket_manager.py` (manager)
- **Routes Created**: `/admin/dashboard`, `/admin/users/live`, `/admin/users/{user_id}/details`, `/admin/stats`

**Import Dependencies** (Lines 1-12):
```python
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from backend.database import get_db, User, DetectionHistory
from backend.auth import get_current_user
from backend.websocket_manager import manager
from typing import List, Dict, Any
import json
from datetime import datetime
```

**Admin Access Control** (Lines 14-25):
```python
router = APIRouter(prefix="/admin", tags=["admin"])

# Admin user configuration - hardcoded emails for simplicity
ADMIN_EMAILS = ["admin@forensicx.com", "atharvgole@gmail.com"]

def is_admin(current_user: User = Depends(get_current_user)):
    """Check if current user has admin privileges."""
    if current_user.email not in ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user
```

**Admin Dashboard Endpoint** (Lines 27-70):
```python
@router.get("/dashboard")
async def admin_dashboard(
    admin_user: User = Depends(is_admin),
    db: Session = Depends(get_db)
):
    """Get comprehensive admin dashboard data with real-time statistics."""
    
    # Calculate real-time statistics using database queries
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    total_detections = db.query(DetectionHistory).count()
    
    # Get plan distribution using group queries
    plan_counts = {}
    for plan in ["free", "pro", "plus"]:
        count = db.query(User).filter(User.plan_type == plan).count()
        plan_counts[plan] = count
    
    # Get recent activity data
    recent_users = db.query(User).order_by(User.created_at.desc()).limit(10).all()
    recent_detections = db.query(DetectionHistory).order_by(DetectionHistory.created_at.desc()).limit(10).all()
    
    # Structure dashboard data
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
```

**User Management Endpoints** (Lines 72-120):
```python
@router.get("/users/live")
async def get_all_users_live(
    admin_user: User = Depends(is_admin),
    db: Session = Depends(get_db)
):
    """Get all users with real-time updates."""
    users = db.query(User).order_by(User.created_at.desc()).all()
    
    # Convert users to serializable format
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
    
    # Broadcast to all connected admin clients for real-time updates
    await manager.send_user_update({"users": users_data, "total_count": len(users_data)})
    
    return {"users": users_data, "total_count": len(users_data)}

@router.post("/users/{user_id}/toggle-status")
async def toggle_user_status(
    user_id: int,
    admin_user: User = Depends(is_admin),
    db: Session = Depends(get_db)
):
    """Toggle user active/inactive status with real-time broadcast."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Toggle status and update timestamp
    user.is_active = not user.is_active
    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    
    # Broadcast update to all admin clients
    users = db.query(User).order_by(User.created_at.desc()).all()
    users_data = [/* ... user serialization ... */]
    
    await manager.send_user_update({"users": users_data, "total_count": len(users_data)})
    
    return {
        "message": f"User {user.username} status updated",
        "user": {"id": user.id, "username": user.username, "is_active": user.is_active}
    }
```

**Statistics Endpoint** (Lines 122-160):
```python
@router.get("/stats")
async def get_stats(
    admin_user: User = Depends(is_admin),
    db: Session = Depends(get_db)
):
    """Get overall platform statistics with real-time updates."""
    
    # User statistics
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    total_detections = db.query(DetectionHistory).count()
    
    # Detection types breakdown
    detection_types = db.query(DetectionHistory.detection_type).distinct().all()
    type_counts = {}
    for dtype in detection_types:
        if dtype[0]:  # Check if detection_type is not None
            count = db.query(DetectionHistory).filter(DetectionHistory.detection_type == dtype[0]).count()
            type_counts[dtype[0]] = count
    
    # Plan distribution
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
```

**How Admin Routes Are Included** (In `text_api.py`, Lines 78-85):
```python
try:
    from .admin_routes import router as admin_router
    app.include_router(admin_router)  # Adds all /admin/* endpoints
    print("✅ Admin routes loaded successfully")
except ImportError:
    print("⚠️  Admin routes not available")
```

**Real-time WebSocket Integration**:
- **User Login Events**: Broadcasted from `auth_routes.py`
- **User Status Changes**: Broadcasted when admin toggles user status
- **Statistics Updates**: Sent to all connected admin clients
- **Detection Events**: Broadcasted when users perform detections

**Why This Code & Design**:
- **Email-based Admin Control**: Simple but effective access management
- **Real-time Updates**: WebSocket broadcasts keep multiple admin sessions synchronized
- **Comprehensive Statistics**: Detailed analytics for system monitoring
- **User Management**: Admin can view and control user accounts
- **Scalable Design**: Statistics calculated efficiently with database aggregation

#### `backend/websocket_manager.py` - Real-Time Communication
**Location**: `/backend/websocket_manager.py`
**Purpose**: WebSocket connection management for live admin dashboard updates

**How Other Files Use This**:
- **`text_api.py`**: Imports `manager` for detection event broadcasting
- **`auth_routes.py`**: Uses `manager.send_user_update()` for login events
- **`admin_routes.py`**: Uses all manager methods for real-time dashboard updates

**Complete WebSocket Manager Implementation** (Lines 1-85):
```python
"""
WebSocket Connection Manager for Real-time Admin Dashboard
"""
from typing import List, Dict, Any
import json
from fastapi import WebSocket
import asyncio

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        """Accept new WebSocket connection and add to active pool."""
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"New WebSocket connection. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        """Remove WebSocket connection from active pool."""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            print(f"WebSocket disconnected. Total: {len(self.active_connections)}")

    async def send_personal_message(self, message: str, websocket: WebSocket):
        """Send message to specific WebSocket connection."""
        try:
            await websocket.send_text(message)
        except Exception as e:
            print(f"Error sending personal message: {e}")
            self.disconnect(websocket)

    async def broadcast(self, message: str):
        """Broadcast message to all connected admin clients."""
        disconnected = []
        
        # Attempt to send to all connections
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                print(f"Error broadcasting to connection: {e}")
                disconnected.append(connection)
        
        # Remove disconnected clients
        for conn in disconnected:
            self.disconnect(conn)

    async def send_user_update(self, data: Dict[str, Any]):
        """Send user data update to all connected admin clients."""
        message = json.dumps({
            "type": "user_update",
            "data": data,
            "timestamp": str(asyncio.get_event_loop().time())
        })
        await self.broadcast(message)

    async def send_stats_update(self, stats: Dict[str, Any]):
        """Send statistics update to all connected admin clients."""
        message = json.dumps({
            "type": "stats_update", 
            "data": stats,
            "timestamp": str(asyncio.get_event_loop().time())
        })
        await self.broadcast(message)

    async def send_detection_update(self, detection_data: Dict[str, Any]):
        """Send new detection update to all connected admin clients."""
        message = json.dumps({
            "type": "detection_update",
            "data": detection_data,
            "timestamp": str(asyncio.get_event_loop().time())
        })
        await self.broadcast(message)

# Global connection manager instance
manager = ConnectionManager()
```

**How Files Use WebSocket Manager**:

**In `auth_routes.py`** (Lines 80-90):
```python
# When user logs in, broadcast to admin dashboard
if manager:
    await manager.send_user_update({
        "type": "user_login",
        "user_id": user.id,
        "email": user.email,
        "last_login": user.last_login.isoformat()
    })
```

**In `admin_routes.py`** (Lines 60-65):
```python
# Broadcast stats update to all connected admin clients
await manager.send_stats_update(dashboard_data["stats"])

# Broadcast user list updates
await manager.send_user_update({"users": users_data, "total_count": len(users_data)})
```

**WebSocket Message Format Examples**:

**User Update Message**:
```json
{
  "type": "user_update",
  "data": {
    "type": "user_login",
    "user_id": 123,
    "email": "user@example.com",
    "last_login": "2025-10-26T10:30:00"
  },
  "timestamp": "1698318600.123"
}
```

**Statistics Update Message**:
```json
{
  "type": "stats_update",
  "data": {
    "total_users": 156,
    "active_users": 142,
    "total_detections": 2847,
    "plan_distribution": {"free": 120, "pro": 30, "plus": 6}
  },
  "timestamp": "1698318600.456"
}
```

**Why This Code & Design**:
- **Global Instance**: Single manager handles all connections across the app
- **Error Resilience**: Failed connections are automatically cleaned up
- **Structured Messages**: JSON format with type and timestamp for frontend parsing
- **Broadcast Efficiency**: Single message sent to all connected admin clients
- **Connection Tracking**: Active connection count for monitoring

#### `backend/plan_limits.py` - Usage Control System
**Purpose**: Plan-based usage limits and detection counting

```python
PLAN_LIMITS = {
    "free": 20,    # 20 detections per month
    "pro": 500,    # 500 detections per month  
    "plus": 1000   # 1000 detections per month
}

def can_perform_detection(user) -> bool:
    limit = get_plan_limit(user.plan_type)
    return user.monthly_detections < limit

def increment_detection_count(db, user):
    user.monthly_detections += 1
    user.total_detections += 1
    db.commit()
    return user
```

**Why This Code**:
- Dictionary-based limits enable easy plan modifications
- Pre-detection validation prevents usage overages
- Atomic database updates ensure consistency

### 💳 Payment Integration

#### `backend/razorpay_routes.py` - Payment Processing
**Purpose**: Razorpay payment gateway integration

```python
@router.post("/payment/create-order")
def create_order(data: CreateOrderRequest, user: User = Depends(get_current_active_user)):
    order_data = {
        "amount": data.amount,
        "currency": "INR",
        "payment_capture": 1,
        "notes": {"user_id": str(user.id), "plan": data.plan}
    }
    order = razorpay_client.order.create(order_data)
    return {"order_id": order["id"], "amount": order["amount"]}

@router.post("/payment/verify")
def verify_payment(data: VerifyPaymentRequest):
    # Signature verification for security
    razorpay_client.utility.verify_payment_signature(params_dict)
    
    # Update user plan after successful payment
    db_user.plan_type = plan_type
    db_user.monthly_detections = 0  # Reset usage on upgrade
```

**Why This Code**:
- Order creation separates payment intent from execution
- Signature verification prevents payment tampering
- Plan upgrade resets monthly usage for better user experience

### 🤖 Machine Learning Components

#### `scripts/train.py` - Standard Model Training
**Purpose**: Traditional training script for image classification

```python
# EfficientNet model setup
model = models.efficientnet_b0(pretrained=True)
num_ftrs = model.classifier[1].in_features
model.classifier[1] = nn.Linear(num_ftrs, 3)  # 3 classes

# Data augmentation for better generalization
train_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# Training loop with validation
for epoch in range(num_epochs):
    model.train()
    # ... training code
    
    # Save best model based on validation accuracy
    if val_acc > best_val_acc:
        torch.save(model.state_dict(), model_save_path)
```

**Why This Code**:
- EfficientNet provides optimal accuracy-efficiency balance
- Transfer learning from ImageNet reduces training time
- Data augmentation prevents overfitting
- Validation-based saving ensures best model retention

#### `scripts/incremental_trainer.py` - Memory-Efficient Training
**Purpose**: Segment-based training for memory-constrained environments

```python
class IncrementalTrainer:
    def __init__(self):
        self.config = {
            "batch_size": 16,        # Small batch for MacBook Air
            "segment_size": 5000,    # Process 5K images at a time
            "num_epochs_per_segment": 3  # Few epochs per segment
        }
    
    def setup_device(self):
        if torch.backends.mps.is_available():
            self.device = torch.device("mps")  # Apple Silicon optimization
        else:
            self.device = torch.device("cpu")
    
    def train_segment(self, train_loader):
        # Memory cleanup for MacBook Air
        if batch_idx % 50 == 0 and self.device.type == 'mps':
            torch.mps.empty_cache()
```

**Why This Code**:
- Segment-based training prevents memory overflow
- MPS support leverages Apple Silicon GPU
- Regular cache clearing maintains memory efficiency
- JSON configuration enables training resumption

#### `scripts/data_loader.py` - Data Pipeline
**Purpose**: Data loading and preprocessing utilities

```python
# Separate transforms for training and validation
train_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(),  # Data augmentation
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

val_test_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.406], std=[0.229, 0.224, 0.225])
])
```

**Why This Code**:
- ImageNet normalization ensures proper model input
- Augmentation only on training prevents data leakage
- Consistent preprocessing across train/val/test splits

### 🔧 Utility Files

#### `backend/pdf_extract.py` - PDF Processing
**Purpose**: Extract text and images from PDF documents

```python
def extract_text_and_images(pdf_path, images_dir="extracted_images"):
    doc = fitz.open(pdf_path)
    text = ""
    images = []
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        text += page.get_text()  # Extract text content
        
        # Extract images with metadata
        for img_index, img in enumerate(page.get_images(full=True)):
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            # Save image for processing
```

**Why This Code**:
- PyMuPDF provides comprehensive PDF parsing
- Image extraction preserves quality and metadata
- Text extraction handles complex PDF layouts

---

## 🧠 Machine Learning Models Deep Dive

### Text Detection Model Architecture

**Model Type**: BERT-based Transformer
**Task**: Binary Classification (Human vs AI-generated text)
**Input**: Tokenized text sequences (max 512 tokens)
**Output**: Confidence scores for Human/AI classification

#### Granular Analysis Implementation
```python
def analyze_text_granular(text: str, tokenizer, model, device):
    # Split text into sentences using regex
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    
    highlights = []
    total_ai_length = 0
    
    for sentence in sentences:
        # Tokenize and analyze each sentence
        inputs = tokenizer(sentence, return_tensors="pt", truncation=True, max_length=512)
        
        with torch.no_grad():
            outputs = model(**inputs)
            logits = outputs.logits
            probs = torch.softmax(logits, dim=1)
            pred = torch.argmax(probs, dim=1).item()
            confidence = probs[0, pred].item()
        
        # Create highlight based on confidence threshold
        if pred == 1 and confidence > 0.7:
            highlights.append({
                "start": sentence_start,
                "end": sentence_end,
                "type": "ai",
                "confidence": confidence
            })
```

**Why This Approach**:
- Sentence-level analysis provides granular insights
- Confidence thresholding reduces false positives
- Highlight mapping enables frontend visualization

### Image Classification Model

**Architecture**: EfficientNet-B0 (Transfer Learning)
**Classes**: ['ai_enhanced', 'ai_generated', 'natural']
**Input Size**: 224×224 pixels
**Preprocessing**: ImageNet normalization

#### Model Setup and Loading
```python
# Load pre-trained EfficientNet
image_model = models.efficientnet_b0(pretrained=False)
num_ftrs = image_model.classifier[1].in_features
image_model.classifier[1] = torch.nn.Linear(num_ftrs, len(image_classes))

# Load trained weights
image_model.load_state_dict(torch.load(IMAGE_MODEL_PATH))
image_model.to(device)
image_model.eval()
```

**Why EfficientNet-B0**:
- Optimal accuracy-efficiency trade-off
- Mobile-friendly architecture
- Proven performance on image classification

### OCR Integration with EasyOCR

```python
# Initialize OCR reader with GPU support
ocr_reader = easyocr.Reader(['en'], gpu=torch.cuda.is_available())

# Text extraction from images
ocr_results = ocr_reader.readtext(np.array(pil_image))
extracted_text = " ".join([res[1] for res in ocr_results])

# Heuristic for text-heavy images
if len(extracted_text.split()) > 20:
    text_only = True  # Flag as screenshot/document
```

**Why EasyOCR**:
- High accuracy on diverse text formats
- GPU acceleration support
- Multiple language support (expandable)

---

## 🔐 Authentication System Architecture

### Password Security Implementation

#### Bcrypt Hashing
```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
```

**Security Features**:
- **Adaptive Cost**: bcrypt automatically adjusts hashing cost
- **Built-in Salt**: Each password gets unique salt
- **Time-Tested**: Industry standard for password security

### JWT Token Management

#### Token Creation and Validation
```python
import jwt
from datetime import datetime, timedelta

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=30))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
```

**Token Security**:
- **HMAC-SHA256**: Cryptographically secure signing
- **Expiration Control**: Automatic token invalidation
- **Stateless Design**: No server-side session storage

### Authentication Flow

1. **User Registration**:
   ```python
   # Validate email uniqueness
   if get_user_by_email(db, user_data.email):
       raise HTTPException(status_code=400, detail="Email already registered")
   
   # Hash password and create user
   hashed_password = get_password_hash(user_data.password)
   db_user = User(email=email, hashed_password=hashed_password)
   ```

2. **User Login**:
   ```python
   # Authenticate credentials
   user = authenticate_user(db, form_data.username, form_data.password)
   if not user:
       raise HTTPException(status_code=401, detail="Incorrect credentials")
   
   # Generate access token
   access_token = create_access_token(data={"sub": user.email})
   ```

3. **Protected Route Access**:
   ```python
   async def get_current_user(token: str = Depends(oauth2_scheme)):
       payload = verify_token(token)
       if payload is None:
           raise HTTPException(status_code=401, detail="Invalid token")
       
       user = get_user_by_email(db, email=payload.get("sub"))
       if user is None:
           raise HTTPException(status_code=401, detail="User not found")
       return user
   ```

---

## 🗄️ Database Architecture

### Schema Design

#### User Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    username VARCHAR UNIQUE NOT NULL,
    full_name VARCHAR,
    hashed_password VARCHAR NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_superuser BOOLEAN DEFAULT FALSE,
    plan_type VARCHAR DEFAULT 'free',
    total_detections INTEGER DEFAULT 0,
    monthly_detections INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);
```

#### Detection History Table
```sql
CREATE TABLE detection_history (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    detection_type VARCHAR NOT NULL,
    content_hash VARCHAR NOT NULL,
    result TEXT NOT NULL,
    confidence VARCHAR,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Database Operations

#### Session Management
```python
from sqlalchemy.orm import sessionmaker

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**Why This Design**:
- Session-per-request pattern prevents connection leaks
- Dependency injection provides clean database access
- Automatic session cleanup ensures resource management

#### Query Optimization
```python
# Indexed queries for performance
user = db.query(User).filter(User.email == email).first()

# Efficient counting with aggregation
total_users = db.query(User).count()
active_users = db.query(User).filter(User.is_active == True).count()

# Plan distribution analysis
plan_counts = {}
for plan in ["free", "pro", "plus"]:
    count = db.query(User).filter(User.plan_type == plan).count()
    plan_counts[plan] = count
```

---

## 📡 API Endpoints Specification

### Detection Endpoints

#### Text Detection API
```python
@app.post("/detect-text")
def detect_text(req: TextRequest, current_user: User = Depends(get_current_active_user)):
    # 1. Usage limit validation
    if not can_perform_detection(current_user):
        remaining = get_remaining_detections(current_user)
        raise HTTPException(status_code=429, detail=f"Limit exceeded. {remaining} remaining.")
    
    # 2. Granular analysis
    highlights, ai_percentage = analyze_text_granular(req.text, tokenizer, text_model, device)
    
    # 3. Update usage statistics
    current_user = increment_detection_count(db, current_user)
    
    # 4. Determine overall classification
    overall_label = "AI" if ai_percentage > 50 else "Human"
    overall_confidence = ai_percentage / 100 if overall_label == "AI" else (100 - ai_percentage) / 100
    
    return {
        "label": overall_label,
        "confidence": overall_confidence,
        "highlights": highlights,
        "ai_percentage": ai_percentage,
        "detections_used": current_user.monthly_detections,
        "remaining_detections": get_remaining_detections(current_user)
    }
```

**Response Format**:
```json
{
  "label": "AI",
  "confidence": 0.85,
  "highlights": [
    {
      "start": 0,
      "end": 45,
      "type": "ai",
      "confidence": 0.92
    }
  ],
  "ai_percentage": 85.5,
  "detections_used": 15,
  "remaining_detections": 5
}
```

#### Image Detection API
```python
@app.post("/detect-image")
async def detect_image(file: UploadFile = File(...)):
    # 1. Load and preprocess image
    image_bytes = await file.read()
    pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image_transform(pil_image).unsqueeze(0).to(device)

    # 2. OCR text extraction
    ocr_results = ocr_reader.readtext(np.array(pil_image))
    extracted_text = " ".join([res[1] for res in ocr_results])

    # 3. Smart image classification
    if len(extracted_text.split()) > 20:  # Text-heavy image detection
        image_result = {"label": "text_only", "confidence": None}
    else:
        with torch.no_grad():
            outputs = image_model(image)
            probs = torch.softmax(outputs, dim=1)
            pred = torch.argmax(probs, dim=1).item()
            confidence = probs[0, pred].item()
        image_result = {"label": image_classes[pred], "confidence": confidence}

    # 4. Text analysis if OCR found content
    if extracted_text.strip():
        text_result = analyze_extracted_text(extracted_text)
    else:
        text_result = None

    return {"image_result": image_result, "text_result": text_result}
```

#### PDF Detection API
```python
@app.post("/detect-pdf")
async def detect_pdf(file: UploadFile = File(...)):
    # 1. Save uploaded PDF temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    # 2. Extract text and images
    text, images = extract_text_and_images_from_pdf(tmp_path)

    # 3. Process extracted text
    if text.strip():
        highlights, ai_percentage = analyze_text_granular(text, tokenizer, text_model, device)
        text_result = {
            "label": "AI" if ai_percentage > 50 else "Human",
            "confidence": ai_percentage / 100,
            "highlights": highlights,
            "ai_percentage": ai_percentage
        }
    else:
        text_result = None

    # 4. Process each extracted image
    classified_images = []
    doc = fitz.open(tmp_path)
    
    for img_info in images:
        # Extract image data
        page = doc[img_info["page"] - 1]
        # ... image processing code
        
        # Classify image
        with torch.no_grad():
            outputs = image_model(image)
            probs = torch.softmax(outputs, dim=1)
            confidence = probs[0, pred].item()
        
        # OCR and text analysis
        ocr_results = ocr_reader.readtext(np.array(pil_image))
        extracted_text = " ".join([res[1] for res in ocr_results])
        
        classified_images.append({
            "page": img_info["page"],
            "image_label": image_classes[pred],
            "image_confidence": confidence,
            "ocr_text": extracted_text,
            "text_result": text_analysis_result
        })

    # 5. Clean up and return results
    os.remove(tmp_path)
    return {"text_result": text_result, "images": classified_images}
```

---

## 🔄 Real-Time Features Implementation

### WebSocket Connection Management

#### Connection Manager Class
```python
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"New connection. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                disconnected.append(connection)
        
        # Clean up failed connections
        for conn in disconnected:
            self.disconnect(conn)
```

#### Real-Time Data Broadcasting
```python
async def send_user_update(self, data: Dict[str, Any]):
    message = json.dumps({
        "type": "user_update",
        "data": data,
        "timestamp": str(asyncio.get_event_loop().time())
    })
    await self.broadcast(message)

async def send_stats_update(self, stats: Dict[str, Any]):
    message = json.dumps({
        "type": "stats_update", 
        "data": stats,
        "timestamp": str(asyncio.get_event_loop().time())
    })
    await self.broadcast(message)
```

### Live Admin Dashboard Updates

#### Statistics Broadcasting
```python
@router.get("/dashboard")
async def admin_dashboard(admin_user: User = Depends(is_admin), db: Session = Depends(get_db)):
    # Calculate real-time statistics
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    total_detections = db.query(DetectionHistory).count()
    
    # Plan distribution
    plan_counts = {}
    for plan in ["free", "pro", "plus"]:
        count = db.query(User).filter(User.plan_type == plan).count()
        plan_counts[plan] = count
    
    dashboard_data = {
        "stats": {
            "total_users": total_users,
            "active_users": active_users,
            "total_detections": total_detections,
            "plan_distribution": plan_counts,
            "last_updated": datetime.now().isoformat()
        }
    }
    
    # Broadcast to all connected admin clients
    await manager.send_stats_update(dashboard_data["stats"])
    
    return dashboard_data
```

#### User Activity Tracking
```python
# Login tracking with real-time updates
@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(db, form_data.username, form_data.password)
    
    # Update last login time
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Broadcast user activity to admin dashboard
    if manager:
        await manager.send_user_update({
            "type": "user_login",
            "user_id": user.id,
            "email": user.email,
            "last_login": user.last_login.isoformat()
        })
    
    return {"access_token": access_token, "token_type": "bearer"}
```

---

## 👨‍💼 Admin Dashboard Features

### Access Control System
```python
# Email-based admin authentication
ADMIN_EMAILS = ["admin@forensicx.com", "atharvgole@gmail.com"]

def is_admin(current_user: User = Depends(get_current_user)):
    if current_user.email not in ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user
```

### Dashboard Capabilities

#### User Management
```python
@router.get("/users/live")
async def get_all_users_live(admin_user: User = Depends(is_admin)):
    users = db.query(User).order_by(User.created_at.desc()).all()
    
    users_data = [{
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "plan_type": user.plan_type,
        "total_detections": user.total_detections,
        "monthly_detections": user.monthly_detections,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat()
    } for user in users]
    
    # Real-time broadcast to admin clients
    await manager.send_user_update({
        "users": users_data, 
        "total_count": len(users_data)
    })
    
    return {"users": users_data, "total_count": len(users_data)}
```

#### User Status Management
```python
@router.post("/users/{user_id}/toggle-status")
async def toggle_user_status(user_id: int, admin_user: User = Depends(is_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Toggle active status
    user.is_active = not user.is_active
    user.updated_at = datetime.utcnow()
    db.commit()
    
    # Broadcast update to all admin clients
    await manager.send_user_update({
        "type": "status_change",
        "user_id": user.id,
        "new_status": user.is_active
    })
    
    return {"message": f"User {user.username} status updated"}
```

#### Analytics Dashboard
```python
@router.get("/stats")
async def get_stats(admin_user: User = Depends(is_admin)):
    # User analytics
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    
    # Detection analytics
    total_detections = db.query(DetectionHistory).count()
    detection_types = db.query(DetectionHistory.detection_type).distinct().all()
    
    type_counts = {}
    for dtype in detection_types:
        if dtype[0]:
            count = db.query(DetectionHistory).filter(
                DetectionHistory.detection_type == dtype[0]
            ).count()
            type_counts[dtype[0]] = count
    
    # Plan distribution
    plan_counts = {}
    for plan in ["free", "pro", "plus"]:
        count = db.query(User).filter(User.plan_type == plan).count()
        plan_counts[plan] = count
    
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
        }
    }
    
    return stats_data
```

---

## 💳 Payment Integration Architecture

### Razorpay Integration Setup
```python
import razorpay
import os

# Secure credential management
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_RKCU4kkAe3HIkw")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "jw1MZ563bg6cTDqgYgP0WdE5")

# Initialize Razorpay client
razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
```

### Payment Flow Implementation

#### Order Creation
```python
@router.post("/payment/create-order")
def create_order(data: CreateOrderRequest, user: User = Depends(get_current_active_user)):
    # Validate plan selection
    if data.plan not in ["pro", "plus"]:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    # Create order with metadata
    order_data = {
        "amount": data.amount,  # Amount in paise (₹100 = 10000 paise)
        "currency": "INR",
        "payment_capture": 1,   # Auto-capture payment
        "notes": {
            "user_id": str(user.id), 
            "plan": data.plan,
            "upgrade_from": user.plan_type
        }
    }
    
    order = razorpay_client.order.create(order_data)
    
    return {
        "order_id": order["id"],
        "amount": order["amount"],
        "currency": order["currency"]
    }
```

#### Payment Verification
```python
@router.post("/payment/verify")
def verify_payment(data: VerifyPaymentRequest, user: User = Depends(get_current_active_user)):
    try:
        # Verify payment signature (prevents tampering)
        params_dict = {
            'razorpay_order_id': data.razorpay_order_id,
            'razorpay_payment_id': data.razorpay_payment_id,
            'razorpay_signature': data.razorpay_signature
        }
        razorpay_client.utility.verify_payment_signature(params_dict)
        
        # Get order details to extract plan information
        order = razorpay_client.order.fetch(data.razorpay_order_id)
        plan_type = order.get('notes', {}).get('plan', 'free')
        
        # Update user plan in database
        db_user = db.query(User).filter(User.id == user.id).first()
        if db_user:
            db_user.plan_type = plan_type
            db_user.monthly_detections = 0  # Reset usage on upgrade
            db.commit()
        
        return {
            "status": "success",
            "message": f"Plan upgraded to {plan_type}",
            "user_plan": plan_type
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Payment verification failed: {str(e)}")
```

### Plan Pricing Structure
```python
# Plan configuration
PLAN_PRICING = {
    "pro": {
        "price_inr": 9900,      # ₹99
        "price_paise": 9900,    # For Razorpay
        "detections": 500,
        "features": ["Advanced Analytics", "Priority Support"]
    },
    "plus": {
        "price_inr": 19900,     # ₹199
        "price_paise": 19900,
        "detections": 1000,
        "features": ["All Pro Features", "API Access", "White-label"]
    }
}
```

---

## 🔒 Security Implementation

### Password Security Best Practices
```python
from passlib.context import CryptContext

# Secure password hashing configuration
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12  # Computational cost (higher = more secure)
)

def get_password_hash(password: str) -> str:
    # Automatic salt generation and hashing
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Constant-time comparison prevents timing attacks
    return pwd_context.verify(plain_password, hashed_password)
```

**Security Features**:
- **Adaptive Cost**: bcrypt rounds automatically adjust over time
- **Salt Integration**: Unique salt per password prevents rainbow table attacks
- **Timing Attack Protection**: Constant-time verification

### JWT Token Security
```python
from jose import JWTError, jwt
from datetime import datetime, timedelta

# Secure token configuration
SECRET_KEY = os.getenv("SECRET_KEY", "change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    
    # Set expiration time
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    
    # Sign token with secret key
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
```

### API Security Measures

#### Rate Limiting (Plan-Based)
```python
def can_perform_detection(user) -> bool:
    limit = get_plan_limit(user.plan_type)
    return user.monthly_detections < limit

# Usage in protected endpoints
if not can_perform_detection(current_user):
    remaining = get_remaining_detections(current_user)
    raise HTTPException(
        status_code=429, 
        detail=f"Detection limit exceeded. {remaining} detections remaining."
    )
```

#### Input Validation
```python
from pydantic import BaseModel, EmailStr, validator

class UserCreate(BaseModel):
    email: EmailStr  # Automatic email format validation
    username: str
    password: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v
    
    @validator('username')
    def validate_username(cls, v):
        if len(v) < 3:
            raise ValueError('Username must be at least 3 characters')
        return v
```

#### CORS Security
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",    # Development frontend
        "http://localhost:3000",    # Alternative dev port
        "https://forensicx.com"     # Production domain
    ],
    allow_credentials=True,         # Enable cookie authentication
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
    expose_headers=["*"]
)
```

---

## ⚡ Performance Optimizations

### Memory Management for MacBook Air
```python
def setup_device():
    """Device selection with Apple Silicon optimization"""
    if torch.backends.mps.is_available():
        device = torch.device("mps")
        print("🚀 Using Apple Metal Performance Shaders (MPS)")
    else:
        device = torch.device("cpu")
        print("💻 Using CPU")
    return device

# Memory cleanup during training
def train_with_memory_management():
    for batch_idx, (inputs, labels) in enumerate(train_loader):
        # ... training code
        
        # Regular memory cleanup for MPS
        if batch_idx % 50 == 0 and device.type == 'mps':
            torch.mps.empty_cache()
```

### Database Query Optimization
```python
# Efficient indexed queries
def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

# Batch statistics calculation
def get_dashboard_stats(db: Session):
    # Single query for user counts by plan
    plan_distribution = (
        db.query(User.plan_type, func.count(User.id))
        .group_by(User.plan_type)
        .all()
    )
    
    # Efficient aggregation
    stats = {
        "total_users": db.query(User).count(),
        "active_users": db.query(User).filter(User.is_active == True).count(),
        "total_detections": db.query(DetectionHistory).count()
    }
    
    return stats
```

### Model Loading Optimization
```python
# Lazy model loading
class ModelManager:
    def __init__(self):
        self._text_model = None
        self._image_model = None
    
    @property
    def text_model(self):
        if self._text_model is None:
            self._text_model = self.load_text_model()
        return self._text_model
    
    @property  
    def image_model(self):
        if self._image_model is None:
            self._image_model = self.load_image_model()
        return self._image_model

# Batch processing for efficiency
def process_images_batch(images: List[Image], batch_size: int = 32):
    results = []
    for i in range(0, len(images), batch_size):
        batch = images[i:i+batch_size]
        batch_tensor = torch.stack([transform(img) for img in batch])
        
        with torch.no_grad():
            outputs = model(batch_tensor)
            predictions = torch.softmax(outputs, dim=1)
            
        results.extend(predictions.cpu().numpy())
    
    return results
```

### Incremental Training Optimization
```python
class IncrementalTrainer:
    def __init__(self):
        self.config = {
            "batch_size": 16,           # Reduced for memory efficiency
            "segment_size": 5000,       # Process in chunks
            "gradient_accumulation": 4,  # Simulate larger batches
            "mixed_precision": True     # Reduce memory usage
        }
    
    def train_segment_optimized(self):
        # Gradient accumulation for larger effective batch size
        optimizer.zero_grad()
        
        for i, (inputs, labels) in enumerate(train_loader):
            outputs = model(inputs)
            loss = criterion(outputs, labels) / self.config["gradient_accumulation"]
            loss.backward()
            
            if (i + 1) % self.config["gradient_accumulation"] == 0:
                optimizer.step()
                optimizer.zero_grad()
```

---

## 🚀 Deployment Guide

### Environment Setup
```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On macOS/Linux
# or
.venv\Scripts\activate     # On Windows

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-auth.txt
```

### Environment Variables
```bash
# Create .env file
SECRET_KEY=your-super-secure-secret-key-here
DATABASE_URL=sqlite:///./forensicx.db
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### Database Initialization
```python
# Run database setup
python -c "
from backend.database import create_tables
create_tables()
print('Database tables created successfully!')
"

# Create admin user (optional)
python create_admin.py
```

### Running the Application
```bash
# Development mode
uvicorn backend.text_api:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn backend.text_api:app --host 0.0.0.0 --port 8000 --workers 4
```

### Model Setup
```bash
# Ensure models directory exists
mkdir -p models

# Models should be present:
# - models/text_model.pkl (BERT-based text classifier)
# - models/efficientnet_best.pth (Image classifier)
# - models/efficientnet_retrained_best.pth (Retrained version)
```

### Production Deployment Checklist
- [ ] Set strong SECRET_KEY in environment variables
- [ ] Configure production database (PostgreSQL recommended)
- [ ] Set up HTTPS with SSL certificates
- [ ] Configure reverse proxy (Nginx recommended)
- [ ] Set up monitoring and logging
- [ ] Configure backup systems for models and database
- [ ] Set up CI/CD pipeline
- [ ] Configure rate limiting at server level

---

## 📊 Key Performance Metrics

### Model Performance
- **Text Model**: BERT-based binary classifier
  - Accuracy: ~95% on validation set
  - Inference time: ~100ms per text sample
  - Memory usage: ~2GB GPU/8GB RAM

- **Image Model**: EfficientNet-B0
  - Accuracy: ~92% on 3-class classification
  - Inference time: ~50ms per image
  - Memory usage: ~1.5GB GPU/4GB RAM

### API Performance
- **Text Detection**: 200-500ms per request
- **Image Detection**: 300-800ms per request
- **PDF Processing**: 1-5s per document (varies by size)
- **Concurrent Users**: 50+ simultaneous connections

### Database Performance
- **SQLite**: Suitable for <1000 users
- **PostgreSQL**: Recommended for production
- **Query Performance**: <10ms for indexed lookups
- **Storage**: ~1MB per 1000 detection records

---

## 🔧 Troubleshooting Guide

### Common Issues

#### Model Loading Errors
```python
# Check model file existence
import os
if not os.path.exists("models/text_model.pkl"):
    print("❌ Text model not found!")
    
if not os.path.exists("models/efficientnet_best.pth"):
    print("❌ Image model not found!")
```

#### Memory Issues on MacBook Air
```python
# Reduce batch size in configuration
config = {
    "batch_size": 8,        # Reduced from 16
    "segment_size": 2500,   # Reduced from 5000
}

# Enable memory cleanup
if device.type == 'mps':
    torch.mps.empty_cache()
```

#### Database Connection Issues
```python
# Check database URL format
DATABASE_URL = "sqlite:///./forensicx.db"  # Correct
# DATABASE_URL = "sqlite://forensicx.db"   # Incorrect

# Create database directory if needed
os.makedirs(os.path.dirname("./forensicx.db"), exist_ok=True)
```

#### Authentication Issues
```python
# Verify JWT secret key
if not os.getenv("SECRET_KEY"):
    print("⚠️  WARNING: Using default SECRET_KEY")
    
# Check token expiration
payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
if datetime.utcnow() > datetime.fromtimestamp(payload["exp"]):
    print("❌ Token expired")
```

---

## 📝 Summary

**ForensicX** represents a comprehensive AI detection platform with the following key strengths:

### Technical Excellence
- **Multi-Modal Detection**: Text, Image, and PDF processing
- **Real-Time Features**: WebSocket-based admin dashboard
- **Secure Authentication**: JWT + bcrypt implementation
- **Scalable Architecture**: Modular design with clear separation of concerns
- **Performance Optimized**: Memory-efficient for resource-constrained environments

### Business Features
- **Tiered Plans**: Free, Pro, and Plus subscription models
- **Usage Tracking**: Monthly detection limits with real-time monitoring
- **Payment Integration**: Razorpay gateway for seamless upgrades
- **Admin Controls**: Comprehensive user management and analytics

### Production Ready
- **Security**: CORS, input validation, secure password storage
- **Monitoring**: Real-time statistics and user activity tracking
- **Maintainability**: Clear code structure with comprehensive documentation
- **Scalability**: Database abstraction and environment-based configuration

The system demonstrates enterprise-level software engineering practices while maintaining flexibility for future enhancements and scaling requirements.

---

*This documentation provides complete technical coverage of the ForensicX backend system. For additional questions or clarifications, refer to the individual code files or contact the development team.*