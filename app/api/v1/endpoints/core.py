"""
Core System APIs - Core system endpoints
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Response
from fastapi.responses import FileResponse
from typing import List, Dict, Any
import uuid
import os
import time
import shutil
from datetime import datetime

from app.models.schemas import (
    UploadResponse, FileInfo, HealthResponse, UsageStats,
    BaseResponse, ConversionProgress
)
from app.core.config import settings

router = APIRouter()

# In-memory storage for demo purposes - use database in production
conversion_status_storage: Dict[str, Dict] = {}
upload_storage: Dict[str, Dict] = {}

@router.post("/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(..., description="File to upload")):
    """
    Upload a file to the system
    """
    try:
        # Check file size
        content = await file.read()
        if len(content) > settings.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413, 
                detail=f"File size exceeds maximum allowed size of {settings.MAX_FILE_SIZE / (1024*1024):.1f}MB"
            )
        
        # Generate unique file ID
        file_id = str(uuid.uuid4())
        
        # Save file
        file_path = os.path.join(settings.UPLOAD_DIR, f"{file_id}_{file.filename}")
        with open(file_path, "wb") as buffer:
            buffer.write(content)
        
        # Store file info
        file_info = FileInfo(
            filename=file.filename,
            size=len(content),
            format=os.path.splitext(file.filename)[1][1:].lower(),
            mime_type=file.content_type or "application/octet-stream"
        )
        
        upload_storage[file_id] = {
            "file_info": file_info.dict(),
            "file_path": file_path,
            "upload_time": datetime.now()
        }
        
        return UploadResponse(
            success=True,
            message="File uploaded successfully",
            file_id=file_id,
            file_info=file_info
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/download/{conversion_id}")
async def download_file(conversion_id: str):
    """
    Download a converted file
    """
    try:
        # Check if conversion exists
        if conversion_id not in conversion_status_storage:
            raise HTTPException(status_code=404, detail="Conversion not found")
        
        conversion_info = conversion_status_storage[conversion_id]
        if conversion_info["status"] != "completed":
            raise HTTPException(status_code=400, detail="Conversion not completed yet")
        
        output_path = conversion_info["output_path"]
        if not os.path.exists(output_path):
            raise HTTPException(status_code=404, detail="File not found")
        
        # Return file
        filename = conversion_info.get("filename", "converted_file")
        return FileResponse(
            path=output_path,
            filename=filename,
            media_type="application/octet-stream"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/progress/{conversion_id}", response_model=ConversionProgress)
async def get_conversion_progress(conversion_id: str):
    """
    Get the progress of a conversion
    """
    try:
        if conversion_id not in conversion_status_storage:
            raise HTTPException(status_code=404, detail="Conversion not found")
        
        conversion_info = conversion_status_storage[conversion_id]
        
        return ConversionProgress(
            conversion_id=conversion_id,
            status=conversion_info["status"],
            progress=conversion_info.get("progress", 0),
            message=conversion_info.get("message", "Processing..."),
            estimated_completion=conversion_info.get("estimated_completion")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    System health check
    """
    try:
        uptime = time.time() - getattr(health_check, 'start_time', time.time())
        if not hasattr(health_check, 'start_time'):
            health_check.start_time = time.time()
        
        supported_formats = {
            "pdf": settings.SUPPORTED_PDF_FORMATS,
            "image": settings.SUPPORTED_IMAGE_FORMATS,
            "audio": settings.SUPPORTED_AUDIO_FORMATS,
            "video": settings.SUPPORTED_VIDEO_FORMATS
        }
        
        return HealthResponse(
            status="healthy",
            version=settings.VERSION,
            uptime=uptime,
            supported_formats=supported_formats
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats", response_model=UsageStats)
async def get_usage_stats():
    """
    Get system usage statistics
    """
    try:
        # Calculate disk usage
        def get_directory_size(path):
            total_size = 0
            if os.path.exists(path):
                for dirpath, dirnames, filenames in os.walk(path):
                    for filename in filenames:
                        filepath = os.path.join(dirpath, filename)
                        if os.path.exists(filepath):
                            total_size += os.path.getsize(filepath)
            return total_size
        
        upload_size = get_directory_size(settings.UPLOAD_DIR)
        output_size = get_directory_size(settings.OUTPUT_DIR)
        temp_size = get_directory_size(settings.TEMP_DIR)
        
        total_disk_usage = (upload_size + output_size + temp_size) / (1024 * 1024)  # MB
        
        # Count active conversions
        active_conversions = sum(
            1 for conv in conversion_status_storage.values() 
            if conv["status"] in ["pending", "processing"]
        )
        
        return UsageStats(
            total_conversions=len(conversion_status_storage),
            total_files_processed=len(upload_storage),
            disk_usage_mb=total_disk_usage,
            active_conversions=active_conversions
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/cleanup", response_model=BaseResponse)
async def cleanup_temporary_files():
    """
    Clean up temporary files and old conversions
    """
    try:
        # Clean temp directory
        if os.path.exists(settings.TEMP_DIR):
            shutil.rmtree(settings.TEMP_DIR)
            os.makedirs(settings.TEMP_DIR, exist_ok=True)
        
        # Clean old files from upload and output directories (older than 24 hours)
        cutoff_time = time.time() - (24 * 60 * 60)  # 24 hours ago
        
        cleaned_count = 0
        for directory in [settings.UPLOAD_DIR, settings.OUTPUT_DIR]:
            if os.path.exists(directory):
                for filename in os.listdir(directory):
                    filepath = os.path.join(directory, filename)
                    if os.path.isfile(filepath) and os.path.getctime(filepath) < cutoff_time:
                        os.remove(filepath)
                        cleaned_count += 1
        
        return BaseResponse(
            success=True,
            message=f"Cleanup completed. Removed {cleaned_count} old files."
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/formats")
async def get_supported_formats():
    """
    Get list of all supported file formats
    """
    try:
        return {
            "pdf_formats": settings.SUPPORTED_PDF_FORMATS,
            "image_formats": settings.SUPPORTED_IMAGE_FORMATS,
            "audio_formats": settings.SUPPORTED_AUDIO_FORMATS,
            "video_formats": settings.SUPPORTED_VIDEO_FORMATS,
            "max_file_size_mb": settings.MAX_FILE_SIZE / (1024 * 1024)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/validate")
async def validate_file(file: UploadFile = File(..., description="File to validate")):
    """
    Validate file type and size without uploading
    """
    try:
        # Check file size
        content = await file.read()
        file_size = len(content)
        
        if file_size > settings.MAX_FILE_SIZE:
            return {
                "valid": False,
                "reason": f"File size ({file_size / (1024*1024):.1f}MB) exceeds maximum allowed size ({settings.MAX_FILE_SIZE / (1024*1024):.1f}MB)"
            }
        
        # Check file type
        file_ext = os.path.splitext(file.filename)[1][1:].lower()
        all_supported_formats = (
            settings.SUPPORTED_PDF_FORMATS + 
            settings.SUPPORTED_IMAGE_FORMATS + 
            settings.SUPPORTED_AUDIO_FORMATS + 
            settings.SUPPORTED_VIDEO_FORMATS
        )
        
        if file_ext not in all_supported_formats:
            return {
                "valid": False,
                "reason": f"File type '{file_ext}' is not supported. Supported formats: {all_supported_formats}"
            }
        
        return {
            "valid": True,
            "file_info": {
                "filename": file.filename,
                "size": file_size,
                "format": file_ext,
                "mime_type": file.content_type
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 