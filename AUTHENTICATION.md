# 🔐 ForensicX Authentication System

## 🚀 **Successfully Implemented!**

Your ForensicX API now includes a complete authentication system with user registration, login, and JWT token-based security.

---

## 📡 **Available Authentication Endpoints**

### 🔑 **Base URL**: `http://localhost:8000`

### 1. **User Registration**
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "securepassword123",
  "full_name": "John Doe"
}
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "full_name": "John Doe",
  "is_active": true,
  "created_at": "2024-09-20T10:30:00",
  "total_detections": 0,
  "monthly_detections": 0,
  "plan_type": "free"
}
```

### 2. **User Login (JSON)**
```http
POST /auth/login-json
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### 3. **User Login (Form Data)**
```http
POST /auth/login
Content-Type: application/x-www-form-urlencoded

username=user@example.com&password=securepassword123
```

### 4. **Get Current User Info**
```http
GET /auth/me
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "full_name": "John Doe",
  "is_active": true,
  "created_at": "2024-09-20T10:30:00",
  "total_detections": 5,
  "monthly_detections": 5,
  "plan_type": "free"
}
```

### 5. **Verify Token**
```http
GET /auth/verify-token
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:**
```json
{
  "valid": true,
  "user_id": 1,
  "email": "user@example.com"
}
```

---

## 🛡️ **Security Features**

- ✅ **JWT Token Authentication**: Stateless and secure
- ✅ **Password Hashing**: bcrypt encryption
- ✅ **Token Expiration**: 30 minutes by default
- ✅ **SQLite Database**: User data storage
- ✅ **Input Validation**: Pydantic schemas
- ✅ **CORS Support**: Frontend integration ready

---

## 💾 **Database Schema**

### **Users Table**
- `id`: Primary key
- `email`: Unique email address
- `username`: Unique username
- `full_name`: User's full name
- `hashed_password`: Encrypted password
- `is_active`: Account status
- `is_superuser`: Admin privileges
- `created_at`: Registration timestamp
- `total_detections`: Lifetime detection count
- `monthly_detections`: Current month detections
- `plan_type`: Subscription plan (free/pro/plus)

### **Detection History Table**
- `id`: Primary key
- `user_id`: Reference to user
- `detection_type`: text/image/pdf
- `content_hash`: Content identifier
- `result`: Detection results (JSON)
- `confidence`: Confidence score
- `created_at`: Analysis timestamp

---

## 🎯 **Integration with Existing Endpoints**

Your existing detection endpoints can now be protected:

```python
from auth import get_current_active_user

@app.post("/detect-text")
async def detect_text_protected(
    text_data: TextRequest,
    current_user: User = Depends(get_current_active_user)
):
    # Only authenticated users can access
    # Track usage for the user
    return detection_result
```

---

## 🧪 **Testing the Authentication**

### **Option 1: Using the API Documentation**
Visit: `http://localhost:8000/docs`
- Interactive Swagger UI with authentication
- Test all endpoints directly

### **Option 2: Using curl**
```bash
# Register a user
curl -X POST "http://localhost:8000/auth/register" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@forensicx.dev",
       "username": "testuser",
       "password": "testpass123",
       "full_name": "Test User"
     }'

# Login
curl -X POST "http://localhost:8000/auth/login-json" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@forensicx.dev",
       "password": "testpass123"
     }'

# Use the returned token for protected endpoints
curl -X GET "http://localhost:8000/auth/me" \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### **Option 3: Using the Test Script**
```bash
python test_auth.py
```

---

## 🔧 **Environment Configuration**

Create a `.env` file in your project root:

```env
# Security
SECRET_KEY=your-super-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database
DATABASE_URL=sqlite:///./forensicx.db
# For PostgreSQL: DATABASE_URL=postgresql://user:pass@localhost/forensicx
```

---

## 📈 **Next Steps**

1. **Frontend Integration**: Connect your React frontend to use these endpoints
2. **Rate Limiting**: Implement usage limits based on plan types
3. **Email Verification**: Add email confirmation for new users
4. **Password Reset**: Implement forgot password functionality
5. **Social Login**: Add Google/GitHub OAuth
6. **Admin Panel**: Create admin interface for user management

---

## 🎉 **Success!**

Your ForensicX API now has enterprise-grade authentication! Users can register, login, and securely access your AI detection services with proper user tracking and plan management.

**API Documentation**: http://localhost:8000/docs
**Database**: `forensicx.db` (created automatically)