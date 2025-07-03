"""
Clerk Authentication Service
"""

import jwt
import requests
from typing import Dict, Any, Optional
from fastapi import HTTPException, status
from cryptography.hazmat.primitives import serialization
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

class ClerkAuthService:
    """Service for Clerk authentication and JWT verification"""
    
    def __init__(self):
        self._jwks_cache: Optional[Dict] = None
        self._public_keys_cache: Dict[str, Any] = {}
    
    async def get_jwks(self) -> Dict:
        """Get JSON Web Key Set from Clerk"""
        if self._jwks_cache:
            return self._jwks_cache
        
        try:
            response = requests.get(settings.CLERK_JWKS_URL, timeout=10)
            response.raise_for_status()
            self._jwks_cache = response.json()
            return self._jwks_cache
        except Exception as e:
            logger.error(f"Failed to fetch JWKS: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Authentication service unavailable"
            )
    
    async def get_public_key(self, kid: str) -> str:
        """Get public key for given key ID"""
        if kid in self._public_keys_cache:
            return self._public_keys_cache[kid]
        
        jwks = await self.get_jwks()
        
        for key in jwks.get("keys", []):
            if key.get("kid") == kid:
                # Convert JWK to PEM format
                try:
                    from cryptography.hazmat.primitives.asymmetric import rsa
                    from cryptography.hazmat.primitives import hashes
                    import base64
                    
                    # Decode the base64url-encoded values
                    n = int.from_bytes(
                        self._base64url_decode(key["n"]), 
                        byteorder="big"
                    )
                    e = int.from_bytes(
                        self._base64url_decode(key["e"]), 
                        byteorder="big"
                    )
                    
                    # Create RSA public key
                    public_numbers = rsa.RSAPublicNumbers(e, n)
                    public_key = public_numbers.public_key()
                    
                    # Serialize to PEM format
                    pem = public_key.public_bytes(
                        encoding=serialization.Encoding.PEM,
                        format=serialization.PublicFormat.SubjectPublicKeyInfo
                    )
                    
                    self._public_keys_cache[kid] = pem
                    return pem
                    
                except Exception as e:
                    logger.error(f"Failed to convert JWK to PEM: {str(e)}")
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Failed to process authentication key"
                    )
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: key not found"
        )
    
    def _base64url_decode(self, data: str) -> bytes:
        """Decode base64url string"""
        # Add padding if needed
        missing_padding = len(data) % 4
        if missing_padding:
            data += '=' * (4 - missing_padding)
        
        # Replace URL-safe characters
        data = data.replace('-', '+').replace('_', '/')
        
        import base64
        return base64.b64decode(data)
    
    async def verify_token(self, token: str) -> Dict[str, Any]:
        """Verify Clerk JWT token and return user claims"""
        try:
            # Decode token header to get key ID
            unverified_header = jwt.get_unverified_header(token)
            kid = unverified_header.get("kid")
            
            if not kid:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token: no key ID"
                )
            
            # Get public key for verification
            public_key = await self.get_public_key(kid)
            
            # Verify and decode token (Clerk session tokens don't require audience verification)
            payload = jwt.decode(
                token,
                public_key,
                algorithms=["RS256"],
                issuer=settings.CLERK_JWT_VERIFY_ISSUER,
                options={"verify_aud": False}  # Clerk session tokens don't require audience verification
            )
            
            return payload
            
        except jwt.InvalidTokenError as e:
            logger.warning(f"Invalid JWT token: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token"
            )
        except Exception as e:
            logger.error(f"Token verification failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Authentication verification failed"
            )
    
    async def get_user_from_token(self, token: str) -> Dict[str, Any]:
        """Get user information from Clerk token"""
        payload = await self.verify_token(token)
        
        # Extract user information from Clerk payload
        user_info = {
            "id": payload.get("sub"),  # Subject is user ID in Clerk
            "email": payload.get("email"),
            "full_name": payload.get("name", ""),
            "first_name": payload.get("given_name", ""),
            "last_name": payload.get("family_name", ""),
            "is_active": True,  # If token is valid, user is active
            "clerk_user_id": payload.get("sub"),
            "session_id": payload.get("sid"),
            "issued_at": payload.get("iat"),
            "expires_at": payload.get("exp"),
        }
        
        return user_info
    
    def extract_token_from_header(self, authorization_header: str) -> str:
        """Extract JWT token from Authorization header"""
        if not authorization_header:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authorization header missing"
            )
        
        parts = authorization_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authorization header format"
            )
        
        return parts[1]

# Create global instance
clerk_auth_service = ClerkAuthService() 