from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from fastapi.responses import FileResponse
from typing import List, Optional
import os
import uuid
import aiofiles
from helpers.pdf_utils import (
    extract_text_from_pdf,
    ocr_from_image,
    encrypt_pdf,
    extract_text_from_docx,
    convert_docx_to_pdf,
    merge_pdfs,
    split_pdf,
    compress_pdf,
    unlock_pdf,
    check_tesseract_installation,
    get_tesseract_download_info,
    setup_tesseract_path,
    PYTESSERACT_AVAILABLE
)

router = APIRouter(prefix="/api/pdf", tags=["PDF Operations"])

# Ensure uploads directory exists
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

async def save_upload_file(upload_file: UploadFile, destination: str) -> str:
    """Save uploaded file to destination"""
    async with aiofiles.open(destination, 'wb') as f:
        content = await upload_file.read()
        await f.write(content)
    return destination

@router.get("/health")
async def health_check():
    """Check the health of PDF services and Tesseract OCR installation"""
    
    # Check Tesseract installation
    tesseract_installed, tesseract_path = check_tesseract_installation()
    
    health_status = {
        "pdf_services": "operational",
        "tesseract_ocr": {
            "available": PYTESSERACT_AVAILABLE,
            "installed": tesseract_installed,
            "path": tesseract_path if tesseract_installed else None,
            "status": "operational" if (PYTESSERACT_AVAILABLE and tesseract_installed) else "not_available"
        }
    }
    
    # If Tesseract is not available, provide installation instructions
    if not (PYTESSERACT_AVAILABLE and tesseract_installed):
        download_info = get_tesseract_download_info()
        health_status["tesseract_ocr"]["installation_instructions"] = download_info.get("instructions", [])
        health_status["tesseract_ocr"]["download_url"] = download_info.get("url", "")
    
    return health_status

@router.post("/extract-text")
async def extract_text_endpoint(file: UploadFile = File(...)):
    """Extract text from PDF file"""
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    # Save uploaded file
    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
    
    try:
        await save_upload_file(file, file_path)
        
        # Extract text
        text_pages = extract_text_from_pdf(file_path)
        
        # Clean up
        os.remove(file_path)
        
        return {
            "success": True,
            "filename": file.filename,
            "total_pages": len(text_pages),
            "text_by_page": text_pages,
            "full_text": "\n\n".join(text_pages)
        }
    
    except Exception as e:
        # Clean up on error
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ocr-image")
async def ocr_image_endpoint(file: UploadFile = File(...)):
    """Perform OCR on uploaded image with improved error handling"""
    if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.tiff', '.bmp')):
        raise HTTPException(status_code=400, detail="File must be an image (PNG, JPG, JPEG, TIFF, BMP)")
    
    # Check Tesseract availability before processing
    if not PYTESSERACT_AVAILABLE:
        download_info = get_tesseract_download_info()
        raise HTTPException(
            status_code=503, 
            detail={
                "error": "Tesseract OCR is not installed",
                "message": "Please install Tesseract OCR to use this feature",
                "installation_instructions": download_info.get("instructions", []),
                "download_url": download_info.get("url", "")
            }
        )
    
    tesseract_installed, _ = check_tesseract_installation()
    if not tesseract_installed:
        download_info = get_tesseract_download_info()
        raise HTTPException(
            status_code=503,
            detail={
                "error": "Tesseract OCR executable not found",
                "message": "Tesseract OCR is installed but executable not found in system PATH",
                "installation_instructions": download_info.get("instructions", []),
                "download_url": download_info.get("url", "")
            }
        )
    
    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
    
    try:
        await save_upload_file(file, file_path)
        
        # Perform OCR
        extracted_text = ocr_from_image(file_path)
        
        # Clean up
        os.remove(file_path)
        
        return {
            "success": True,
            "filename": file.filename,
            "extracted_text": extracted_text,
            "text_length": len(extracted_text),
            "has_content": bool(extracted_text and extracted_text.strip())
        }
    
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        
        # Check if it's a Tesseract-specific error
        error_message = str(e)
        if "tesseract" in error_message.lower() or "ocr" in error_message.lower():
            download_info = get_tesseract_download_info()
            raise HTTPException(
                status_code=503,
                detail={
                    "error": "OCR processing failed",
                    "message": error_message,
                    "installation_instructions": download_info.get("instructions", []),
                    "download_url": download_info.get("url", "")
                }
            )
        else:
            raise HTTPException(status_code=500, detail=f"Processing error: {error_message}")

@router.post("/encrypt")
async def encrypt_pdf_endpoint(file: UploadFile = File(...), password: str = Form(...)):
    """Encrypt PDF with password protection"""
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    file_id = str(uuid.uuid4())
    input_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
    output_path = os.path.join(UPLOAD_DIR, f"encrypted_{file_id}_{file.filename}")
    
    try:
        await save_upload_file(file, input_path)
        
        # Encrypt PDF
        encrypt_pdf(input_path, output_path, password)
        
        # Clean up input file
        os.remove(input_path)
        
        return FileResponse(
            output_path,
            media_type='application/pdf',
            filename=f"encrypted_{file.filename}"
        )
    
    except Exception as e:
        # Clean up on error
        for path in [input_path, output_path]:
            if os.path.exists(path):
                os.remove(path)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/docx-to-pdf")
async def docx_to_pdf_endpoint(file: UploadFile = File(...)):
    """Convert DOCX file to PDF"""
    if not file.filename.lower().endswith('.docx'):
        raise HTTPException(status_code=400, detail="File must be a DOCX")
    
    file_id = str(uuid.uuid4())
    input_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
    output_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename.replace('.docx', '.pdf')}")
    
    try:
        await save_upload_file(file, input_path)
        
        # Convert to PDF
        convert_docx_to_pdf(input_path, output_path)
        
        # Clean up input file
        os.remove(input_path)
        
        return FileResponse(
            output_path,
            media_type='application/pdf',
            filename=file.filename.replace('.docx', '.pdf')
        )
    
    except Exception as e:
        for path in [input_path, output_path]:
            if os.path.exists(path):
                os.remove(path)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/extract-text-docx")
async def extract_text_docx_endpoint(file: UploadFile = File(...)):
    """Extract text from DOCX file"""
    if not file.filename.lower().endswith('.docx'):
        raise HTTPException(status_code=400, detail="File must be a DOCX")
    
    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
    
    try:
        await save_upload_file(file, file_path)
        
        # Extract text
        paragraphs = extract_text_from_docx(file_path)
        
        # Clean up
        os.remove(file_path)
        
        return {
            "success": True,
            "filename": file.filename,
            "total_paragraphs": len(paragraphs),
            "paragraphs": paragraphs,
            "full_text": "\n\n".join(paragraphs)
        }
    
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/merge")
async def merge_pdfs_endpoint(files: List[UploadFile] = File(...)):
    """Merge multiple PDF files into one"""
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="At least 2 PDF files required for merging")
    
    for file in files:
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="All files must be PDFs")
    
    file_id = str(uuid.uuid4())
    input_paths = []
    output_path = os.path.join(UPLOAD_DIR, f"merged_{file_id}.pdf")
    
    try:
        # Save all uploaded files
        for i, file in enumerate(files):
            input_path = os.path.join(UPLOAD_DIR, f"{file_id}_{i}_{file.filename}")
            await save_upload_file(file, input_path)
            input_paths.append(input_path)
        
        # Merge PDFs
        merge_pdfs(input_paths, output_path)
        
        # Clean up input files
        for path in input_paths:
            os.remove(path)
        
        return FileResponse(
            output_path,
            media_type='application/pdf',
            filename="merged_document.pdf"
        )
    
    except Exception as e:
        # Clean up on error
        for path in input_paths + [output_path]:
            if os.path.exists(path):
                os.remove(path)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/split")
async def split_pdf_endpoint(file: UploadFile = File(...), split_type: str = Form("pages")):
    """Split PDF into multiple files"""
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    file_id = str(uuid.uuid4())
    input_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
    output_dir = os.path.join(UPLOAD_DIR, f"split_{file_id}")
    
    try:
        await save_upload_file(file, input_path)
        os.makedirs(output_dir, exist_ok=True)
        
        # Split PDF
        if split_type == "pages":
            output_files = split_pdf(input_path, output_dir)
        else:
            # For now, default to splitting by pages
            output_files = split_pdf(input_path, output_dir)
        
        # Clean up input file
        os.remove(input_path)
        
        return {
            "success": True,
            "total_files": len(output_files),
            "files": [os.path.basename(f) for f in output_files],
            "message": f"PDF split into {len(output_files)} files"
        }
    
    except Exception as e:
        # Clean up on error
        if os.path.exists(input_path):
            os.remove(input_path)
        if os.path.exists(output_dir):
            import shutil
            shutil.rmtree(output_dir)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/compress")
async def compress_pdf_endpoint(file: UploadFile = File(...)):
    """Compress PDF file"""
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    file_id = str(uuid.uuid4())
    input_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
    output_path = os.path.join(UPLOAD_DIR, f"compressed_{file_id}_{file.filename}")
    
    try:
        await save_upload_file(file, input_path)
        
        # Get original file size
        original_size = os.path.getsize(input_path)
        
        # Compress PDF
        compress_pdf(input_path, output_path)
        
        # Get compressed file size
        compressed_size = os.path.getsize(output_path)
        compression_ratio = ((original_size - compressed_size) / original_size) * 100
        
        # Clean up input file
        os.remove(input_path)
        
        return FileResponse(
            output_path,
            media_type='application/pdf',
            filename=f"compressed_{file.filename}",
            headers={
                "X-Original-Size": str(original_size),
                "X-Compressed-Size": str(compressed_size),
                "X-Compression-Ratio": f"{compression_ratio:.1f}%"
            }
        )
    
    except Exception as e:
        for path in [input_path, output_path]:
            if os.path.exists(path):
                os.remove(path)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/unlock")
async def unlock_pdf_endpoint(file: UploadFile = File(...), password: str = Form(...)):
    """Remove password protection from PDF"""
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    file_id = str(uuid.uuid4())
    input_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
    output_path = os.path.join(UPLOAD_DIR, f"unlocked_{file_id}_{file.filename}")
    
    try:
        await save_upload_file(file, input_path)
        
        # Unlock PDF
        unlock_pdf(input_path, output_path, password)
        
        # Clean up input file
        os.remove(input_path)
        
        return FileResponse(
            output_path,
            media_type='application/pdf',
            filename=f"unlocked_{file.filename}"
        )
    
    except Exception as e:
        # Clean up on error
        for path in [input_path, output_path]:
            if os.path.exists(path):
                os.remove(path)
        raise HTTPException(status_code=500, detail=str(e)) 