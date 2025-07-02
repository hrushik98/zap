"""
Audio Studio APIs - Audio processing endpoints
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from typing import List, Optional
import uuid
import os

from app.models.schemas import (
    AudioConvertRequest, AudioTrimRequest, AudioVolumeRequest,
    ConversionResponse, FileInfo
)
from app.core.config import settings
from app.services.audio_service import AudioService

router = APIRouter()
audio_service = AudioService()

@router.post("/convert", response_model=ConversionResponse)
async def convert_audio(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="Audio file to convert"),
    target_format: str = "mp3",
    bitrate: Optional[int] = None,
    sample_rate: Optional[int] = None
):
    """
    Convert audio file to different format
    """
    try:
        # Validate target format
        if target_format not in settings.SUPPORTED_AUDIO_FORMATS:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported target format. Supported: {settings.SUPPORTED_AUDIO_FORMATS}"
            )
        
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
        success = await audio_service.convert_audio(
            input_path, output_path, target_format, bitrate, sample_rate
        )
        
        if success:
            file_size = os.path.getsize(output_path)
            file_info = FileInfo(
                filename=output_filename,
                size=file_size,
                format=target_format,
                mime_type=f"audio/{target_format}"
            )
            
            return ConversionResponse(
                success=True,
                message=f"Audio converted to {target_format.upper()} successfully",
                conversion_id=conversion_id,
                status="completed",
                progress=100,
                download_url=f"/api/v1/core/download/{conversion_id}",
                file_info=file_info
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to convert audio")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/trim", response_model=ConversionResponse)
async def trim_audio(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="Audio file to trim"),
    start_time: float = 0.0,
    end_time: Optional[float] = None
):
    """
    Trim/cut audio file to specified time range
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
        success = await audio_service.trim_audio(input_path, output_path, start_time, end_time)
        
        if success:
            file_size = os.path.getsize(output_path)
            file_info = FileInfo(
                filename=output_filename,
                size=file_size,
                format=file_ext[1:],  # Remove the dot
                mime_type=f"audio/{file_ext[1:]}"
            )
            
            return ConversionResponse(
                success=True,
                message="Audio trimmed successfully",
                conversion_id=conversion_id,
                status="completed",
                progress=100,
                download_url=f"/api/v1/core/download/{conversion_id}",
                file_info=file_info
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to trim audio")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/merge", response_model=ConversionResponse)
async def merge_audio(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(..., description="Audio files to merge"),
    output_format: str = "mp3"
):
    """
    Merge multiple audio files into one
    """
    try:
        # Validate output format
        if output_format not in settings.SUPPORTED_AUDIO_FORMATS:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported output format. Supported: {settings.SUPPORTED_AUDIO_FORMATS}"
            )
        
        # Save uploaded files
        file_paths = []
        for file in files:
            file_id = str(uuid.uuid4())
            file_path = os.path.join(settings.TEMP_DIR, f"{file_id}_{file.filename}")
            
            with open(file_path, "wb") as buffer:
                content = await file.read()
                buffer.write(content)
            
            file_paths.append(file_path)
        
        # Generate output filename
        conversion_id = str(uuid.uuid4())
        output_filename = f"merged_{conversion_id}.{output_format}"
        output_path = os.path.join(settings.OUTPUT_DIR, output_filename)
        
        # Perform merge operation
        success = await audio_service.merge_audio(file_paths, output_path)
        
        if success:
            file_size = os.path.getsize(output_path)
            file_info = FileInfo(
                filename=output_filename,
                size=file_size,
                format=output_format,
                mime_type=f"audio/{output_format}"
            )
            
            return ConversionResponse(
                success=True,
                message="Audio files merged successfully",
                conversion_id=conversion_id,
                status="completed",
                progress=100,
                download_url=f"/api/v1/core/download/{conversion_id}",
                file_info=file_info
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to merge audio files")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/volume-adjust", response_model=ConversionResponse)
async def adjust_volume(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="Audio file to adjust volume"),
    volume_change: float = 0.0  # in dB
):
    """
    Adjust the volume of an audio file
    """
    try:
        # Validate volume change (reasonable limits)
        if not -50 <= volume_change <= 50:
            raise HTTPException(status_code=400, detail="Volume change must be between -50dB and +50dB")
        
        # Save uploaded file
        file_id = str(uuid.uuid4())
        input_path = os.path.join(settings.TEMP_DIR, f"{file_id}_{file.filename}")
        
        with open(input_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Generate output filename
        conversion_id = str(uuid.uuid4())
        file_ext = os.path.splitext(file.filename)[1]
        output_filename = f"volume_adjusted_{conversion_id}{file_ext}"
        output_path = os.path.join(settings.OUTPUT_DIR, output_filename)
        
        # Perform volume adjustment
        success = await audio_service.adjust_volume(input_path, output_path, volume_change)
        
        if success:
            file_size = os.path.getsize(output_path)
            file_info = FileInfo(
                filename=output_filename,
                size=file_size,
                format=file_ext[1:],
                mime_type=f"audio/{file_ext[1:]}"
            )
            
            volume_action = "increased" if volume_change > 0 else "decreased" if volume_change < 0 else "maintained"
            
            return ConversionResponse(
                success=True,
                message=f"Audio volume {volume_action} by {abs(volume_change)}dB",
                conversion_id=conversion_id,
                status="completed",
                progress=100,
                download_url=f"/api/v1/core/download/{conversion_id}",
                file_info=file_info
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to adjust audio volume")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 