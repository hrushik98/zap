import PyPDF2
import cv2
import pytesseract
import os
from typing import List
from PyPDF2 import PdfReader, PdfWriter
from docx2pdf import convert as docx_to_pdf_convert
from docx import Document
import tempfile
import shutil

def extract_text_from_pdf(pdf_path: str) -> List[str]:
    """Extract text from PDF file and return list of page contents"""
    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            pdf_text = []
            
            for page in reader.pages:
                content = page.extract_text()
                pdf_text.append(content)
            
            return pdf_text
    except Exception as e:
        raise Exception(f"Error extracting text from PDF: {str(e)}")

def ocr_from_image(image_path: str) -> str:
    """Perform OCR on image file and return extracted text"""
    try:
        # Read image
        img = cv2.imread(image_path)
        if img is None:
            raise Exception("Could not read image file")
        
        # Preprocess image for better OCR
        img = get_grayscale(img)
        img = thresholding(img)
        img = remove_noise(img)
        
        # Perform OCR
        text = pytesseract.image_to_string(img)
        return text
    except Exception as e:
        raise Exception(f"Error performing OCR: {str(e)}")

def get_grayscale(image):
    """Convert image to grayscale"""
    return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

def remove_noise(image):
    """Remove noise from image"""
    return cv2.medianBlur(image, 5)

def thresholding(image):
    """Apply thresholding to image"""
    return cv2.threshold(image, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]

def encrypt_pdf(input_path: str, output_path: str, password: str) -> str:
    """Encrypt PDF with password protection"""
    try:
        writer = PdfWriter()
        reader = PdfReader(input_path)
        
        # Add all pages to writer
        for page in reader.pages:
            writer.add_page(page)
        
        # Encrypt with password
        writer.encrypt(password)
        
        # Write encrypted PDF
        with open(output_path, "wb") as output_file:
            writer.write(output_file)
        
        return output_path
    except Exception as e:
        raise Exception(f"Error encrypting PDF: {str(e)}")

def extract_text_from_docx(docx_path: str) -> List[str]:
    """Extract text from DOCX file"""
    try:
        doc = Document(docx_path)
        paragraphs = []
        
        for para in doc.paragraphs:
            paragraphs.append(para.text)
        
        return paragraphs
    except Exception as e:
        raise Exception(f"Error extracting text from DOCX: {str(e)}")

def convert_docx_to_pdf(docx_path: str, output_path: str) -> str:
    """Convert DOCX file to PDF"""
    try:
        docx_to_pdf_convert(docx_path, output_path)
        return output_path
    except Exception as e:
        raise Exception(f"Error converting DOCX to PDF: {str(e)}")

def merge_pdfs(pdf_paths: List[str], output_path: str) -> str:
    """Merge multiple PDF files into one"""
    try:
        writer = PdfWriter()
        
        for pdf_path in pdf_paths:
            reader = PdfReader(pdf_path)
            for page in reader.pages:
                writer.add_page(page)
        
        with open(output_path, "wb") as output_file:
            writer.write(output_file)
        
        return output_path
    except Exception as e:
        raise Exception(f"Error merging PDFs: {str(e)}")

def split_pdf(input_path: str, output_dir: str, page_ranges: List[tuple] = None) -> List[str]:
    """Split PDF into multiple files or by page ranges"""
    try:
        reader = PdfReader(input_path)
        output_files = []
        
        if page_ranges:
            # Split by specified ranges
            for i, (start, end) in enumerate(page_ranges):
                writer = PdfWriter()
                for page_num in range(start - 1, min(end, len(reader.pages))):
                    writer.add_page(reader.pages[page_num])
                
                output_path = os.path.join(output_dir, f"split_{i+1}.pdf")
                with open(output_path, "wb") as output_file:
                    writer.write(output_file)
                output_files.append(output_path)
        else:
            # Split into individual pages
            for page_num, page in enumerate(reader.pages):
                writer = PdfWriter()
                writer.add_page(page)
                
                output_path = os.path.join(output_dir, f"page_{page_num + 1}.pdf")
                with open(output_path, "wb") as output_file:
                    writer.write(output_file)
                output_files.append(output_path)
        
        return output_files
    except Exception as e:
        raise Exception(f"Error splitting PDF: {str(e)}")

def compress_pdf(input_path: str, output_path: str) -> str:
    """Compress PDF by removing duplicated objects and optimizing"""
    try:
        reader = PdfReader(input_path)
        writer = PdfWriter()
        
        # Add pages and compress
        for page in reader.pages:
            writer.add_page(page)
        
        # Remove duplicated objects and compress
        writer.remove_duplication()
        
        with open(output_path, "wb") as output_file:
            writer.write(output_file)
        
        return output_path
    except Exception as e:
        raise Exception(f"Error compressing PDF: {str(e)}") 