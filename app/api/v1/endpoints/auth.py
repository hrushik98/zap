"""
Authentication APIs - User authentication and management
"""

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Any
import uuid
from datetime import datetime, timedelta

from app.models.schemas import (
    UserCreate, UserResponse, Token, BaseResponse
)
from app.core.config import settings

router = APIRouter()
security = HTTPBearer()

# In-memory storage for demo purposes - use database in production
users_storage: Dict[str, Dict] = {}
tokens_storage: Dict[str, Dict] = {}

# Demo admin user
DEMO_ADMIN = {
    "id": "admin-001",
    "email": "admin@zenetia.com",
    "password": "admin123",  # In production, this should be hashed
    "full_name": "Admin User",
    "is_active": True,
    "created_at": datetime.now()
}

users_storage["admin@zenetia.com"] = DEMO_ADMIN

def create_access_token(user_id: str) -> str:
    """Create access token for user"""
    token = str(uuid.uuid4())
    tokens_storage[token] = {
        "user_id": user_id,
        "created_at": datetime.now(),
        "expires_at": datetime.now() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    }
    return token

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """Get current authenticated user"""
    token = credentials.credentials
    
    if token not in tokens_storage:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )
    
    token_info = tokens_storage[token]
    if datetime.now() > token_info["expires_at"]:
        del tokens_storage[token]
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    
    user_id = token_info["user_id"]
    user = next((u for u in users_storage.values() if u["id"] == user_id), None)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user

@router.post("/register", response_model=UserResponse)
async def register_user(user_data: UserCreate):
    """
    Register a new user
    """
    try:
        # Check if user already exists
        if user_data.email in users_storage:
            raise HTTPException(
                status_code=400,
                detail="User with this email already exists"
            )
        
        # Create new user
        user_id = str(uuid.uuid4())
        new_user = {
            "id": user_id,
            "email": user_data.email,
            "password": user_data.password,  # In production, hash this password
            "full_name": user_data.full_name,
            "is_active": True,
            "created_at": datetime.now()
        }
        
        users_storage[user_data.email] = new_user
        
        return UserResponse(
            id=user_id,
            email=user_data.email,
            full_name=user_data.full_name,
            is_active=True,
            created_at=new_user["created_at"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login", response_model=Token)
async def login(email: str, password: str):
    """
    Authenticate user and return access token
    """
    try:
        # Find user
        if email not in users_storage:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )
        
        user = users_storage[email]
        
        # Check password (in production, use proper password hashing)
        if user["password"] != password:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )
        
        # Check if user is active
        if not user["is_active"]:
            raise HTTPException(
                status_code=401,
                detail="User account is disabled"
            )
        
        # Create access token
        access_token = create_access_token(user["id"])
        
        return Token(
            access_token=access_token,
            token_type="bearer"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/logout", response_model=BaseResponse)
async def logout(current_user: Dict = Depends(get_current_user), credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Logout user and invalidate token
    """
    try:
        token = credentials.credentials
        
        if token in tokens_storage:
            del tokens_storage[token]
        
        return BaseResponse(
            success=True,
            message="Successfully logged out"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/profile", response_model=UserResponse)
async def get_user_profile(current_user: Dict = Depends(get_current_user)):
    """
    Get current user's profile
    """
    try:
        return UserResponse(
            id=current_user["id"],
            email=current_user["email"],
            full_name=current_user.get("full_name"),
            is_active=current_user["is_active"],
            created_at=current_user["created_at"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/profile", response_model=UserResponse)
async def update_user_profile(
    full_name: str = None,
    current_user: Dict = Depends(get_current_user)
):
    """
    Update current user's profile
    """
    try:
        # Update user data
        if full_name is not None:
            current_user["full_name"] = full_name
        
        # Update in storage
        users_storage[current_user["email"]] = current_user
        
        return UserResponse(
            id=current_user["id"],
            email=current_user["email"],
            full_name=current_user.get("full_name"),
            is_active=current_user["is_active"],
            created_at=current_user["created_at"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/users", response_model=list)
async def list_users(current_user: Dict = Depends(get_current_user)):
    """
    List all users (admin only)
    """
    try:
        # Check if user is admin
        if current_user["email"] != "admin@zenetia.com":
            raise HTTPException(
                status_code=403,
                detail="Access forbidden. Admin privileges required."
            )
        
        users_list = []
        for user in users_storage.values():
            users_list.append(UserResponse(
                id=user["id"],
                email=user["email"],
                full_name=user.get("full_name"),
                is_active=user["is_active"],
                created_at=user["created_at"]
            ))
        
        return users_list
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/usage-limits")
async def get_user_usage_limits(current_user: Dict = Depends(get_current_user)):
    """
    Get user's usage limits and current usage
    """
    try:
        # For demo purposes, return static limits
        # In production, this would be based on user's subscription plan
        return {
            "max_file_size_mb": settings.MAX_FILE_SIZE / (1024 * 1024),
            "daily_conversions_limit": 100,
            "daily_conversions_used": 0,  # Would be calculated from database
            "monthly_storage_limit_gb": 10,
            "monthly_storage_used_gb": 0,  # Would be calculated from database
            "supported_features": [
                "pdf_conversion",
                "image_processing", 
                "audio_conversion",
                "video_processing",
                "batch_processing"
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 