"""
PDF Hub APIs - PDF processing endpoints
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from typing import List
import uuid
import os
from pathlib import Path

from app.models.schemas import (
    PDFMergeRequest, PDFSplitRequest, PDFCompressRequest,
    ConversionResponse, BaseResponse, FileInfo
)
from app.core.config import settings
from app.services.pdf_service import PDFService

router = APIRouter()
pdf_service = PDFService()

@router.post("/merge", response_model=ConversionResponse)
async def merge_pdfs(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(..., description="PDF files to merge")
):
    """
    Merge multiple PDF files into a single PDF
    """
    try:
        # Validate all files are PDFs
        for file in files:
            if not file.filename.lower().endswith('.pdf'):
                raise HTTPException(status_code=400, detail=f"File {file.filename} is not a PDF")
        
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
        output_filename = f"merged_{conversion_id}.pdf"
        output_path = os.path.join(settings.OUTPUT_DIR, output_filename)
        
        # Perform merge operation
        success = await pdf_service.merge_pdfs(file_paths, output_path)
        
        if success:
            # Get file info
            file_size = os.path.getsize(output_path)
            file_info = FileInfo(
                filename=output_filename,
                size=file_size,
                format="pdf",
                mime_type="application/pdf"
            )
            
            return ConversionResponse(
                success=True,
                message="PDFs merged successfully",
                conversion_id=conversion_id,
                status="completed",
                progress=100,
                download_url=f"/api/v1/core/download/{conversion_id}",
                file_info=file_info
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to merge PDFs")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/split", response_model=ConversionResponse)
async def split_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="PDF file to split"),
    pages: str = None  # Comma-separated page numbers or ranges like "1,3,5-10"
):
    """
    Split a PDF file by specified pages or ranges
    """
    try:
        # Validate PDF file
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="File must be a PDF")
        
        # Save uploaded file
        file_id = str(uuid.uuid4())
        input_path = os.path.join(settings.TEMP_DIR, f"{file_id}_{file.filename}")
        
        with open(input_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Parse page ranges
        page_list = []
        if pages:
            for page_part in pages.split(','):
                if '-' in page_part:
                    start, end = map(int, page_part.split('-'))
                    page_list.extend(range(start, end + 1))
                else:
                    page_list.append(int(page_part))
        
        # Generate output
        conversion_id = str(uuid.uuid4())
        output_dir = os.path.join(settings.OUTPUT_DIR, conversion_id)
        os.makedirs(output_dir, exist_ok=True)
        
        # Perform split operation
        success = await pdf_service.split_pdf(input_path, output_dir, page_list)
        
        if success:
            return ConversionResponse(
                success=True,
                message="PDF split successfully",
                conversion_id=conversion_id,
                status="completed",
                progress=100,
                download_url=f"/api/v1/core/download/{conversion_id}"
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to split PDF")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/compress", response_model=ConversionResponse)
async def compress_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="PDF file to compress"),
    quality: int = 80
):
    """
    Compress a PDF file to reduce file size
    """
    try:
        # Validate PDF file
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="File must be a PDF")
        
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
        output_filename = f"compressed_{conversion_id}.pdf"
        output_path = os.path.join(settings.OUTPUT_DIR, output_filename)
        
        # Perform compression
        success = await pdf_service.compress_pdf(input_path, output_path, quality)
        
        if success:
            # Get file info
            original_size = os.path.getsize(input_path)
            compressed_size = os.path.getsize(output_path)
            compression_ratio = ((original_size - compressed_size) / original_size) * 100
            
            file_info = FileInfo(
                filename=output_filename,
                size=compressed_size,
                format="pdf",
                mime_type="application/pdf"
            )
            
            return ConversionResponse(
                success=True,
                message=f"PDF compressed successfully. Size reduced by {compression_ratio:.1f}%",
                conversion_id=conversion_id,
                status="completed",
                progress=100,
                download_url=f"/api/v1/core/download/{conversion_id}",
                file_info=file_info
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to compress PDF")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/to-word", response_model=ConversionResponse)
async def pdf_to_word(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="PDF file to convert to Word")
):
    """
    Convert PDF to Word (DOCX) format
    """
    try:
        # Validate PDF file
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="File must be a PDF")
        
        # Save uploaded file
        file_id = str(uuid.uuid4())
        input_path = os.path.join(settings.TEMP_DIR, f"{file_id}_{file.filename}")
        
        with open(input_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Generate output filename
        conversion_id = str(uuid.uuid4())
        output_filename = f"converted_{conversion_id}.docx"
        output_path = os.path.join(settings.OUTPUT_DIR, output_filename)
        
        # Perform conversion (placeholder - would need actual implementation)
        success = await pdf_service.pdf_to_word(input_path, output_path)
        
        if success:
            file_size = os.path.getsize(output_path)
            file_info = FileInfo(
                filename=output_filename,
                size=file_size,
                format="docx",
                mime_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            )
            
            return ConversionResponse(
                success=True,
                message="PDF converted to Word successfully",
                conversion_id=conversion_id,
                status="completed",
                progress=100,
                download_url=f"/api/v1/core/download/{conversion_id}",
                file_info=file_info
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to convert PDF to Word")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 