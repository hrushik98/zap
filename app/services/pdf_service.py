"""
PDF processing service
"""

import os
import asyncio
from typing import List, Optional
from PyPDF2 import PdfReader, PdfWriter
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from pdf2docx import Converter
import logging

logger = logging.getLogger(__name__)

class PDFService:
    """Service for PDF processing operations"""
    
    async def merge_pdfs(self, input_paths: List[str], output_path: str) -> bool:
        """
        Merge multiple PDF files into one
        """
        try:
            writer = PdfWriter()
            
            for pdf_path in input_paths:
                reader = PdfReader(pdf_path)
                for page in reader.pages:
                    writer.add_page(page)
            
            with open(output_path, 'wb') as output_file:
                writer.write(output_file)
            
            # Clean up input files
            for pdf_path in input_paths:
                if os.path.exists(pdf_path):
                    os.remove(pdf_path)
            
            return True
            
        except Exception as e:
            logger.error(f"Error merging PDFs: {str(e)}")
            return False
    
    async def split_pdf(self, input_path: str, output_dir: str, pages: Optional[List[int]] = None) -> bool:
        """
        Split PDF into separate files
        """
        try:
            reader = PdfReader(input_path)
            total_pages = len(reader.pages)
            
            if pages is None:
                # Split each page into separate files
                pages = list(range(1, total_pages + 1))
            
            for i, page_num in enumerate(pages):
                if 1 <= page_num <= total_pages:
                    writer = PdfWriter()
                    writer.add_page(reader.pages[page_num - 1])  # Convert to 0-based index
                    
                    output_file = os.path.join(output_dir, f"page_{page_num}.pdf")
                    with open(output_file, 'wb') as out_file:
                        writer.write(out_file)
            
            # Clean up input file
            if os.path.exists(input_path):
                os.remove(input_path)
            
            return True
            
        except Exception as e:
            logger.error(f"Error splitting PDF: {str(e)}")
            return False
    
    async def compress_pdf(self, input_path: str, output_path: str, quality: int = 80) -> bool:
        """
        Compress PDF file (basic implementation)
        """
        try:
            reader = PdfReader(input_path)
            writer = PdfWriter()
            
            for page in reader.pages:
                # Apply basic compression
                page.compress_content_streams()
                writer.add_page(page)
            
            with open(output_path, 'wb') as output_file:
                writer.write(output_file)
            
            # Clean up input file
            if os.path.exists(input_path):
                os.remove(input_path)
            
            return True
            
        except Exception as e:
            logger.error(f"Error compressing PDF: {str(e)}")
            return False
    
    async def pdf_to_word(self, input_path: str, output_path: str) -> bool:
        """
        Convert PDF to Word document using pdf2docx
        """
        try:
            # Use pdf2docx for high-quality conversion
            cv = Converter(input_path)
            cv.convert(output_path, start=0, end=None)
            cv.close()
            
            # Verify the output file was created
            if not os.path.exists(output_path):
                raise Exception("Output file was not created")
            
            # Clean up input file
            if os.path.exists(input_path):
                os.remove(input_path)
            
            return True
            
        except Exception as e:
            logger.error(f"Error converting PDF to Word: {str(e)}")
            # Fallback to basic implementation if pdf2docx fails
            try:
                from docx import Document
                
                # Extract text using PyPDF2 as fallback
                reader = PdfReader(input_path)
                doc = Document()
                
                for page in reader.pages:
                    text = page.extract_text()
                    if text.strip():
                        doc.add_paragraph(text)
                
                doc.save(output_path)
                
                # Clean up input file
                if os.path.exists(input_path):
                    os.remove(input_path)
                
                logger.info("Used fallback method for PDF to Word conversion")
                return True
                
            except Exception as fallback_error:
                logger.error(f"Error in fallback PDF to Word conversion: {str(fallback_error)}")
                return False
    
    async def add_watermark(self, input_path: str, output_path: str, watermark_text: str) -> bool:
        """
        Add watermark to PDF
        """
        try:
            reader = PdfReader(input_path)
            writer = PdfWriter()
            
            # Create watermark PDF
            watermark_path = f"{output_path}_watermark.pdf"
            c = canvas.Canvas(watermark_path, pagesize=letter)
            c.setFont("Helvetica", 50)
            c.setFillAlpha(0.3)
            c.drawCentredText(300, 400, watermark_text)
            c.save()
            
            watermark_reader = PdfReader(watermark_path)
            watermark_page = watermark_reader.pages[0]
            
            # Apply watermark to each page
            for page in reader.pages:
                page.merge_page(watermark_page)
                writer.add_page(page)
            
            with open(output_path, 'wb') as output_file:
                writer.write(output_file)
            
            # Clean up
            if os.path.exists(input_path):
                os.remove(input_path)
            if os.path.exists(watermark_path):
                os.remove(watermark_path)
            
            return True
            
        except Exception as e:
            logger.error(f"Error adding watermark: {str(e)}")
            return False
    
    async def extract_text(self, input_path: str) -> str:
        """
        Extract text from PDF
        """
        try:
            reader = PdfReader(input_path)
            text = ""
            
            for page in reader.pages:
                text += page.extract_text() + "\n"
            
            return text
            
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {str(e)}")
            return "" 