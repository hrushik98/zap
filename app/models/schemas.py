"""
Pydantic schemas for request and response models
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum
from datetime import datetime

# Enums for supported formats
class FileFormat(str, Enum):
    # PDF formats
    PDF = "pdf"
    
    # Image formats
    JPG = "jpg"
    JPEG = "jpeg"
    PNG = "png"
    WEBP = "webp"
    BMP = "bmp"
    TIFF = "tiff"
    HEIC = "heic"
    
    # Audio formats
    MP3 = "mp3"
    WAV = "wav"
    FLAC = "flac"
    AAC = "aac"
    OGG = "ogg"
    M4A = "m4a"
    
    # Video formats
    MP4 = "mp4"
    WEBM = "webm"
    AVI = "avi"
    MOV = "mov"
    MKV = "mkv"
    FLV = "flv"
    
    # Document formats
    DOCX = "docx"
    XLSX = "xlsx"
    PPTX = "pptx"

class ConversionStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

# Base response schemas
class BaseResponse(BaseModel):
    success: bool
    message: str
    timestamp: datetime = Field(default_factory=datetime.now)

class ErrorResponse(BaseResponse):
    error_code: Optional[str] = None
    details: Optional[Dict[str, Any]] = None

# File upload schemas
class FileInfo(BaseModel):
    filename: str
    size: int
    format: str
    mime_type: str

class UploadResponse(BaseResponse):
    file_id: str
    file_info: FileInfo

# Conversion schemas
class ConversionRequest(BaseModel):
    file_id: str
    target_format: FileFormat
    options: Optional[Dict[str, Any]] = {}

class ConversionResponse(BaseResponse):
    conversion_id: str
    status: ConversionStatus
    progress: int = 0
    download_url: Optional[str] = None
    file_info: Optional[FileInfo] = None

class ConversionProgress(BaseModel):
    conversion_id: str
    status: ConversionStatus
    progress: int
    message: str
    estimated_completion: Optional[datetime] = None

# PDF specific schemas
class PDFMergeRequest(BaseModel):
    file_ids: List[str]
    output_filename: Optional[str] = "merged.pdf"

class PDFSplitRequest(BaseModel):
    file_id: str
    pages: Optional[List[int]] = None  # Specific pages
    page_ranges: Optional[List[str]] = None  # e.g., ["1-5", "10-15"]

class PDFCompressRequest(BaseModel):
    file_id: str
    quality: int = Field(default=80, ge=10, le=100)

# Audio specific schemas
class AudioConvertRequest(BaseModel):
    file_id: str
    target_format: str
    bitrate: Optional[int] = None
    sample_rate: Optional[int] = None

class AudioTrimRequest(BaseModel):
    file_id: str
    start_time: float
    end_time: float

class AudioVolumeRequest(BaseModel):
    file_id: str
    volume_change: float  # in dB

# Video specific schemas
class VideoConvertRequest(BaseModel):
    file_id: str
    target_format: str
    quality: Optional[str] = "medium"  # low, medium, high
    resolution: Optional[str] = None  # e.g., "1920x1080"

class VideoTrimRequest(BaseModel):
    file_id: str
    start_time: float
    end_time: float

class VideoCompressRequest(BaseModel):
    file_id: str
    target_size_mb: Optional[int] = None
    quality: int = Field(default=75, ge=10, le=100)

# Image specific schemas
class ImageConvertRequest(BaseModel):
    file_id: str
    target_format: str
    quality: Optional[int] = Field(default=95, ge=10, le=100)

class ImageResizeRequest(BaseModel):
    file_id: str
    width: Optional[int] = None
    height: Optional[int] = None
    maintain_aspect_ratio: bool = True

class ImageCropRequest(BaseModel):
    file_id: str
    x: int
    y: int
    width: int
    height: int

# Batch processing schemas
class BatchConversionRequest(BaseModel):
    file_ids: List[str]
    target_format: FileFormat
    options: Optional[Dict[str, Any]] = {}

class BatchConversionResponse(BaseResponse):
    batch_id: str
    total_files: int
    conversions: List[ConversionResponse]

# User and authentication schemas
class UserCreate(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    is_active: bool
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str

# System schemas
class HealthResponse(BaseModel):
    status: str
    version: str
    uptime: float
    supported_formats: Dict[str, List[str]]

class UsageStats(BaseModel):
    total_conversions: int
    total_files_processed: int
    disk_usage_mb: float
    active_conversions: int 