"""
Image Workshop APIs - Image processing endpoints
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from typing import Optional
import uuid
import os

from app.models.schemas import (
    ImageConvertRequest, ImageResizeRequest, ImageCropRequest,
    ConversionResponse, FileInfo
)
from app.core.config import settings
from app.services.image_service import ImageService

router = APIRouter()
image_service = ImageService()

@router.post("/convert", response_model=ConversionResponse)
async def convert_image(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="Image file to convert"),
    target_format: str = "jpg",
    quality: int = 95
):
    """
    Convert image file to different format
    """
    try:
        # Validate target format
        if target_format not in settings.SUPPORTED_IMAGE_FORMATS:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported target format. Supported: {settings.SUPPORTED_IMAGE_FORMATS}"
            )
        
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
        output_filename = f"converted_{conversion_id}.{target_format}"
        output_path = os.path.join(settings.OUTPUT_DIR, output_filename)
        
        # Perform conversion
        success = await image_service.convert_image(input_path, output_path, target_format, quality)
        
        if success:
            file_size = os.path.getsize(output_path)
            file_info = FileInfo(
                filename=output_filename,
                size=file_size,
                format=target_format,
                mime_type=f"image/{target_format}"
            )
            
            return ConversionResponse(
                success=True,
                message=f"Image converted to {target_format.upper()} successfully",
                conversion_id=conversion_id,
                status="completed",
                progress=100,
                download_url=f"/api/v1/core/download/{conversion_id}",
                file_info=file_info
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to convert image")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/resize", response_model=ConversionResponse)
async def resize_image(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="Image file to resize"),
    width: Optional[int] = None,
    height: Optional[int] = None,
    maintain_aspect_ratio: bool = True
):
    """
    Resize image to specified dimensions
    """
    try:
        # Validate parameters
        if width is None and height is None:
            raise HTTPException(status_code=400, detail="Either width or height must be specified")
        
        if width is not None and width <= 0:
            raise HTTPException(status_code=400, detail="Width must be positive")
        
        if height is not None and height <= 0:
            raise HTTPException(status_code=400, detail="Height must be positive")
        
        # Save uploaded file
        file_id = str(uuid.uuid4())
        input_path = os.path.join(settings.TEMP_DIR, f"{file_id}_{file.filename}")
        
        with open(input_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Generate output filename
        conversion_id = str(uuid.uuid4())
        file_ext = os.path.splitext(file.filename)[1]
        output_filename = f"resized_{conversion_id}{file_ext}"
        output_path = os.path.join(settings.OUTPUT_DIR, output_filename)
        
        # Perform resize
        success = await image_service.resize_image(
            input_path, output_path, width, height, maintain_aspect_ratio
        )
        
        if success:
            file_size = os.path.getsize(output_path)
            file_info = FileInfo(
                filename=output_filename,
                size=file_size,
                format=file_ext[1:],
                mime_type=f"image/{file_ext[1:]}"
            )
            
            return ConversionResponse(
                success=True,
                message="Image resized successfully",
                conversion_id=conversion_id,
                status="completed",
                progress=100,
                download_url=f"/api/v1/core/download/{conversion_id}",
                file_info=file_info
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to resize image")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/crop", response_model=ConversionResponse)
async def crop_image(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="Image file to crop"),
    x: int = 0,
    y: int = 0,
    width: int = 100,
    height: int = 100
):
    """
    Crop image to specified rectangle
    """
    try:
        # Validate parameters
        if x < 0 or y < 0:
            raise HTTPException(status_code=400, detail="X and Y coordinates must be non-negative")
        
        if width <= 0 or height <= 0:
            raise HTTPException(status_code=400, detail="Width and height must be positive")
        
        # Save uploaded file
        file_id = str(uuid.uuid4())
        input_path = os.path.join(settings.TEMP_DIR, f"{file_id}_{file.filename}")
        
        with open(input_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Generate output filename
        conversion_id = str(uuid.uuid4())
        file_ext = os.path.splitext(file.filename)[1]
        output_filename = f"cropped_{conversion_id}{file_ext}"
        output_path = os.path.join(settings.OUTPUT_DIR, output_filename)
        
        # Perform crop
        success = await image_service.crop_image(input_path, output_path, x, y, width, height)
        
        if success:
            file_size = os.path.getsize(output_path)
            file_info = FileInfo(
                filename=output_filename,
                size=file_size,
                format=file_ext[1:],
                mime_type=f"image/{file_ext[1:]}"
            )
            
            return ConversionResponse(
                success=True,
                message="Image cropped successfully",
                conversion_id=conversion_id,
                status="completed",
                progress=100,
                download_url=f"/api/v1/core/download/{conversion_id}",
                file_info=file_info
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to crop image")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/background-remove", response_model=ConversionResponse)
async def remove_background(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="Image file to remove background from")
):
    """
    Remove background from image using AI
    """
    try:
        # Save uploaded file
        file_id = str(uuid.uuid4())
        input_path = os.path.join(settings.TEMP_DIR, f"{file_id}_{file.filename}")
        
        with open(input_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Generate output filename (always PNG for transparency)
        conversion_id = str(uuid.uuid4())
        output_filename = f"no_bg_{conversion_id}.png"
        output_path = os.path.join(settings.OUTPUT_DIR, output_filename)
        
        # Perform background removal
        success = await image_service.remove_background(input_path, output_path)
        
        if success:
            file_size = os.path.getsize(output_path)
            file_info = FileInfo(
                filename=output_filename,
                size=file_size,
                format="png",
                mime_type="image/png"
            )
            
            return ConversionResponse(
                success=True,
                message="Background removed successfully",
                conversion_id=conversion_id,
                status="completed",
                progress=100,
                download_url=f"/api/v1/core/download/{conversion_id}",
                file_info=file_info
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to remove background")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/compress", response_model=ConversionResponse)
async def compress_image(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="Image file to compress"),
    quality: int = 80,
    max_width: Optional[int] = None,
    max_height: Optional[int] = None
):
    """
    Compress image to reduce file size
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
        success = await image_service.compress_image(
            input_path, output_path, quality, max_width, max_height
        )
        
        if success:
            # Get file info
            original_size = os.path.getsize(input_path)
            compressed_size = os.path.getsize(output_path)
            compression_ratio = ((original_size - compressed_size) / original_size) * 100
            
            file_info = FileInfo(
                filename=output_filename,
                size=compressed_size,
                format=file_ext[1:],
                mime_type=f"image/{file_ext[1:]}"
            )
            
            return ConversionResponse(
                success=True,
                message=f"Image compressed successfully. Size reduced by {compression_ratio:.1f}%",
                conversion_id=conversion_id,
                status="completed",
                progress=100,
                download_url=f"/api/v1/core/download/{conversion_id}",
                file_info=file_info
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to compress image")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 