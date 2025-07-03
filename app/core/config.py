"""
Application configuration settings
"""

from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # App settings
    APP_NAME: str = "Zenetia Zap"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # API settings
    API_V1_STR: str = "/api/v1"
    
    # Clerk Authentication
    CLERK_PUBLISHABLE_KEY: Optional[str] = None
    CLERK_SECRET_KEY: Optional[str] = None
    CLERK_JWT_VERIFY_ISSUER: str = "https://evident-termite-94.clerk.accounts.dev"
    CLERK_JWKS_URL: str = "https://evident-termite-94.clerk.accounts.dev/.well-known/jwks.json"
    
    # File settings
    MAX_FILE_SIZE: int = 100 * 1024 * 1024  # 100MB
    UPLOAD_DIR: str = "./uploads"
    OUTPUT_DIR: str = "./outputs"
    TEMP_DIR: str = "./temp"
    
    # Supported file formats
    SUPPORTED_PDF_FORMATS: list = ["pdf"]
    SUPPORTED_IMAGE_FORMATS: list = ["jpg", "jpeg", "png", "webp", "bmp", "tiff", "heic"]
    SUPPORTED_AUDIO_FORMATS: list = ["mp3", "wav", "flac", "aac", "ogg", "m4a"]
    SUPPORTED_VIDEO_FORMATS: list = ["mp4", "webm", "avi", "mov", "mkv", "flv"]
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database (optional - for user management)
    DATABASE_URL: Optional[str] = None
    
    # Redis (for task queue)
    REDIS_URL: str = "redis://localhost:6379"
    
    # External APIs
    YOUTUBE_DL_ENABLED: bool = True
    
    # Rate limiting
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW: int = 3600  # 1 hour
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra environment variables

# Create settings instance
settings = Settings()

# Ensure directories exist
for directory in [settings.UPLOAD_DIR, settings.OUTPUT_DIR, settings.TEMP_DIR]:
    os.makedirs(directory, exist_ok=True) 