"""
Authentication APIs - Clerk integration for user authentication
"""

from fastapi import APIRouter, HTTPException, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Any, Optional
import logging

from app.models.schemas import UserResponse, BaseResponse
from app.core.config import settings
from app.services.clerk_auth import clerk_auth_service

router = APIRouter()
security = HTTPBearer()
logger = logging.getLogger(__name__)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """Get current authenticated user from Clerk JWT token"""
    try:
        token = credentials.credentials
        user_info = await clerk_auth_service.get_user_from_token(token)
        return user_info
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Authentication failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: Dict = Depends(get_current_user)):
    """
    Get current authenticated user's profile from Clerk
    """
    try:
        return UserResponse(
            id=current_user["id"],
            email=current_user.get("email", ""),
            full_name=current_user.get("full_name", ""),
            is_active=current_user.get("is_active", True),
            created_at=None  # Clerk doesn't provide created_at in JWT, would need separate API call
        )
    except Exception as e:
        logger.error(f"Failed to get user profile: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify", response_model=BaseResponse)
async def verify_token(current_user: Dict = Depends(get_current_user)):
    """
    Verify if the provided token is valid
    """
    try:
        return BaseResponse(
            success=True,
            message=f"Token is valid for user: {current_user.get('email', current_user.get('id'))}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/session")
async def get_session_info(current_user: Dict = Depends(get_current_user)):
    """
    Get current session information
    """
    try:
        return {
            "user_id": current_user["id"],
            "session_id": current_user.get("session_id"),
            "email": current_user.get("email"),
            "issued_at": current_user.get("issued_at"),
            "expires_at": current_user.get("expires_at"),
            "is_authenticated": True
        }
    except Exception as e:
        logger.error(f"Failed to get session info: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user-limits")
async def get_user_usage_limits(current_user: Dict = Depends(get_current_user)):
    """
    Get user's usage limits and current usage
    """
    try:
        # For demo purposes, return static limits
        # In production, this would be based on user's subscription plan from Clerk metadata
        return {
            "user_id": current_user["id"],
            "email": current_user.get("email"),
            "max_file_size_mb": settings.MAX_FILE_SIZE / (1024 * 1024),
            "daily_conversions_limit": 100,
            "daily_conversions_used": 0,  # Would be calculated from database
            "monthly_storage_limit_gb": 10,
            "monthly_storage_used_gb": 0,  # Would be calculated from database
            "supported_features": [
                "pdf_conversion",
                "pdf_merge",
                "pdf_split",
                "pdf_compress",
                "pdf_to_word",
                "image_processing", 
                "audio_conversion",
                "video_processing",
                "batch_processing"
            ]
        }
    except Exception as e:
        logger.error(f"Failed to get user limits: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def auth_health_check():
    """
    Authentication service health check
    """
    try:
        # Test JWKS endpoint availability
        await clerk_auth_service.get_jwks()
        
        return {
            "status": "healthy",
            "clerk_integration": "active",
            "jwks_url": settings.CLERK_JWKS_URL,
            "audience": settings.CLERK_JWT_VERIFY_AUDIENCE,
            "issuer": settings.CLERK_JWT_VERIFY_ISSUER
        }
    except Exception as e:
        logger.error(f"Auth health check failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service unhealthy"
        )

# Legacy endpoints for compatibility (these would redirect to Clerk in frontend)
@router.post("/login", deprecated=True)
async def login_redirect():
    """
    Redirect to Clerk sign-in (legacy endpoint)
    """
    return {
        "message": "Please use Clerk authentication",
        "sign_in_url": f"{settings.CLERK_JWT_VERIFY_AUDIENCE}/sign-in",
        "note": "This endpoint is deprecated. Use Clerk's authentication flow instead."
    }

@router.post("/register", deprecated=True)
async def register_redirect():
    """
    Redirect to Clerk sign-up (legacy endpoint)
    """
    return {
        "message": "Please use Clerk authentication",
        "sign_up_url": f"{settings.CLERK_JWT_VERIFY_AUDIENCE}/sign-up",
        "note": "This endpoint is deprecated. Use Clerk's authentication flow instead."
    }

@router.post("/logout", deprecated=True)
async def logout_redirect():
    """
    Logout would be handled by Clerk (legacy endpoint)
    """
    return {
        "message": "Logout is handled by Clerk on the frontend",
        "note": "This endpoint is deprecated. Use Clerk's signOut() method in your frontend."
    } 