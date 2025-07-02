"""
Video Lab APIs - Video processing endpoints
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from typing import Optional
import uuid
import os

from app.models.schemas import (
    VideoConvertRequest, VideoTrimRequest, VideoCompressRequest,
    ConversionResponse, FileInfo
)
from app.core.config import settings
from app.services.video_service import VideoService

router = APIRouter()
video_service = VideoService()

@router.post("/convert", response_model=ConversionResponse)
async def convert_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="Video file to convert"),
    target_format: str = "mp4",
    quality: str = "medium",
    resolution: Optional[str] = None
):
    """
    Convert video file to different format
    """
    try:
        # Validate target format
        if target_format not in settings.SUPPORTED_VIDEO_FORMATS:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported target format. Supported: {settings.SUPPORTED_VIDEO_FORMATS}"
            )
        
        # Validate quality
        if quality not in ["low", "medium", "high"]:
            raise HTTPException(status_code=400, detail="Quality must be 'low', 'medium', or 'high'")
        
        # Save uploaded file
        file_id = str(uuid.uuid4())
        input_path = os.path.join(settings.TEMP_DIR, f"{file_id}_{file.filename}")
        
        with open(input_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Generate output filename
        conversion_id = str(uuid.uuid4())
        output_filename = f"converted_{conversion_id}.{target_format}"
        output_path = os.path.join(settings.OUTPUT_DIR, output_filename)
        
        # Perform conversion
        success = await video_service.convert_video(
            input_path, output_path, target_format, quality, resolution
        )
        
        if success:
            file_size = os.path.getsize(output_path)
            file_info = FileInfo(
                filename=output_filename,
                size=file_size,
                format=target_format,
                mime_type=f"video/{target_format}"
            )
            
            return ConversionResponse(
                success=True,
                message=f"Video converted to {target_format.upper()} successfully",
                conversion_id=conversion_id,
                status="completed",
                progress=100,
                download_url=f"/api/v1/core/download/{conversion_id}",
                file_info=file_info
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to convert video")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/compress", response_model=ConversionResponse)
async def compress_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="Video file to compress"),
    target_size_mb: Optional[int] = None,
    quality: int = 75
):
    """
    Compress video file to reduce file size
    """
    try:
        # Validate quality parameter
        if not 10 <= quality <= 100:
            raise HTTPException(status_code=400, detail="Quality must be between 10 and 100")
        
        # Save uploaded file
        file_id = str(uuid.uuid4())
        input_path = os.path.join(settings.TEMP_DIR, f"{file_id}_{file.filename}")
        
        with open(input_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Generate output filename
        conversion_id = str(uuid.uuid4())
        file_ext = os.path.splitext(file.filename)[1]
        output_filename = f"compressed_{conversion_id}{file_ext}"
        output_path = os.path.join(settings.OUTPUT_DIR, output_filename)
        
        # Perform compression
        success = await video_service.compress_video(input_path, output_path, target_size_mb, quality)
        
        if success:
            # Get file info
            original_size = os.path.getsize(input_path)
            compressed_size = os.path.getsize(output_path)
            compression_ratio = ((original_size - compressed_size) / original_size) * 100
            
            file_info = FileInfo(
                filename=output_filename,
                size=compressed_size,
                format=file_ext[1:],
                mime_type=f"video/{file_ext[1:]}"
            )
            
            return ConversionResponse(
                success=True,
                message=f"Video compressed successfully. Size reduced by {compression_ratio:.1f}%",
                conversion_id=conversion_id,
                status="completed",
                progress=100,
                download_url=f"/api/v1/core/download/{conversion_id}",
                file_info=file_info
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to compress video")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/trim", response_model=ConversionResponse)
async def trim_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="Video file to trim"),
    start_time: float = 0.0,
    end_time: Optional[float] = None
):
    """
    Trim/cut video file to specified time range
    """
    try:
        # Validate time parameters
        if start_time < 0:
            raise HTTPException(status_code=400, detail="Start time cannot be negative")
        
        if end_time is not None and end_time <= start_time:
            raise HTTPException(status_code=400, detail="End time must be greater than start time")
        
        # Save uploaded file
        file_id = str(uuid.uuid4())
        input_path = os.path.join(settings.TEMP_DIR, f"{file_id}_{file.filename}")
        
        with open(input_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Generate output filename
        conversion_id = str(uuid.uuid4())
        file_ext = os.path.splitext(file.filename)[1]
        output_filename = f"trimmed_{conversion_id}{file_ext}"
        output_path = os.path.join(settings.OUTPUT_DIR, output_filename)
        
        # Perform trimming
        success = await video_service.trim_video(input_path, output_path, start_time, end_time)
        
        if success:
            file_size = os.path.getsize(output_path)
            file_info = FileInfo(
                filename=output_filename,
                size=file_size,
                format=file_ext[1:],
                mime_type=f"video/{file_ext[1:]}"
            )
            
            return ConversionResponse(
                success=True,
                message="Video trimmed successfully",
                conversion_id=conversion_id,
                status="completed",
                progress=100,
                download_url=f"/api/v1/core/download/{conversion_id}",
                file_info=file_info
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to trim video")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/to-gif", response_model=ConversionResponse)
async def video_to_gif(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="Video file to convert to GIF"),
    start_time: float = 0.0,
    duration: Optional[float] = None,
    fps: int = 10,
    width: Optional[int] = None
):
    """
    Convert video to GIF format
    """
    try:
        # Validate parameters
        if start_time < 0:
            raise HTTPException(status_code=400, detail="Start time cannot be negative")
        
        if duration is not None and duration <= 0:
            raise HTTPException(status_code=400, detail="Duration must be positive")
        
        if not 1 <= fps <= 30:
            raise HTTPException(status_code=400, detail="FPS must be between 1 and 30")
        
        # Save uploaded file
        file_id = str(uuid.uuid4())
        input_path = os.path.join(settings.TEMP_DIR, f"{file_id}_{file.filename}")
        
        with open(input_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Generate output filename
        conversion_id = str(uuid.uuid4())
        output_filename = f"converted_{conversion_id}.gif"
        output_path = os.path.join(settings.OUTPUT_DIR, output_filename)
        
        # Perform conversion
        success = await video_service.video_to_gif(
            input_path, output_path, start_time, duration, fps, width
        )
        
        if success:
            file_size = os.path.getsize(output_path)
            file_info = FileInfo(
                filename=output_filename,
                size=file_size,
                format="gif",
                mime_type="image/gif"
            )
            
            return ConversionResponse(
                success=True,
                message="Video converted to GIF successfully",
                conversion_id=conversion_id,
                status="completed",
                progress=100,
                download_url=f"/api/v1/core/download/{conversion_id}",
                file_info=file_info
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to convert video to GIF")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 