import PyPDF2
import cv2
import os
import platform
import subprocess
from typing import List, Optional
from PyPDF2 import PdfReader, PdfWriter
from docx2pdf import convert as docx_to_pdf_convert
from docx import Document
import tempfile
import shutil
try:
    import pikepdf
    PIKEPDF_AVAILABLE = True
except ImportError:
    PIKEPDF_AVAILABLE = False

# Try to import pytesseract
try:
    import pytesseract
    PYTESSERACT_AVAILABLE = True
except ImportError:
    PYTESSERACT_AVAILABLE = False

def check_tesseract_installation() -> tuple[bool, Optional[str]]:
    """Check if Tesseract is properly installed and return path if found"""
    
    # Common Tesseract installation paths on Windows
    common_paths = [
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
        r"C:\Users\{}\AppData\Local\Tesseract-OCR\tesseract.exe".format(os.getenv('USERNAME', '')),
        r"C:\tesseract\tesseract.exe"
    ]
    
    # First, try to find tesseract in PATH
    try:
        result = subprocess.run(['tesseract', '--version'], 
                              capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            return True, 'tesseract'  # Found in PATH
    except (subprocess.TimeoutExpired, subprocess.CalledProcessError, FileNotFoundError):
        pass
    
    # Check common installation paths
    for path in common_paths:
        if os.path.exists(path):
            return True, path
    
    return False, None

def setup_tesseract_path():
    """Setup Tesseract path for pytesseract"""
    if not PYTESSERACT_AVAILABLE:
        return False
    
    is_installed, tesseract_path = check_tesseract_installation()
    
    if is_installed and tesseract_path and tesseract_path != 'tesseract':
        pytesseract.pytesseract.tesseract_cmd = tesseract_path
        return True
    elif is_installed:
        return True
    
    return False

def get_tesseract_download_info():
    """Get download information for Tesseract OCR"""
    system = platform.system().lower()
    
    if system == "windows":
        return {
            "url": "https://github.com/UB-Mannheim/tesseract/wiki",
            "installer": "tesseract-ocr-w64-setup-5.3.3.20231005.exe",
            "instructions": [
                "1. Download the Windows installer from: https://github.com/UB-Mannheim/tesseract/wiki",
                "2. Run the installer as Administrator",
                "3. Install to the default location: C:\\Program Files\\Tesseract-OCR\\",
                "4. Add Tesseract to your system PATH, or restart your application",
                "5. Restart your FastAPI server after installation"
            ]
        }
    elif system == "darwin":  # macOS
        return {
            "url": "https://brew.sh/",
            "command": "brew install tesseract",
            "instructions": [
                "1. Install Homebrew if not already installed",
                "2. Run: brew install tesseract",
                "3. Restart your FastAPI server"
            ]
        }
    else:  # Linux
        return {
            "command": "sudo apt-get install tesseract-ocr",
            "instructions": [
                "Ubuntu/Debian: sudo apt-get install tesseract-ocr",
                "CentOS/RHEL: sudo yum install tesseract",
                "Arch: sudo pacman -S tesseract",
                "Restart your FastAPI server after installation"
            ]
        }

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
    """Perform OCR on image file and return extracted text with proper error handling"""
    
    # Check if pytesseract is available
    if not PYTESSERACT_AVAILABLE:
        download_info = get_tesseract_download_info()
        raise Exception(
            f"Tesseract OCR is not installed. Please install it:\n"
            f"Instructions: {'; '.join(download_info.get('instructions', []))}"
        )
    
    # Setup Tesseract path
    tesseract_ready = setup_tesseract_path()
    if not tesseract_ready:
        download_info = get_tesseract_download_info()
        raise Exception(
            f"Tesseract OCR executable not found. Please install Tesseract OCR:\n"
            f"Download from: {download_info.get('url', 'Official Tesseract repository')}\n"
            f"Instructions: {'; '.join(download_info.get('instructions', []))}"
        )
    
    try:
        # Read image
        img = cv2.imread(image_path)
        if img is None:
            raise Exception("Could not read image file. Supported formats: PNG, JPG, JPEG, TIFF, BMP")
        
        # Preprocess image for better OCR
        img = get_grayscale(img)
        img = thresholding(img)
        img = remove_noise(img)
        
        # Perform OCR with better configuration
        custom_config = r'--oem 3 --psm 6 -c tessedit_char_whitelist=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz .,!?-'
        text = pytesseract.image_to_string(img, config=custom_config)
        
        if not text or text.strip() == "":
            # Try with different PSM mode if no text found
            custom_config = r'--oem 3 --psm 8'
            text = pytesseract.image_to_string(img, config=custom_config)
        
        return text.strip() if text else "No text detected in the image."
        
    except pytesseract.TesseractNotFoundError:
        download_info = get_tesseract_download_info()
        raise Exception(
            f"Tesseract executable not found in system PATH. Please:\n"
            f"1. Install Tesseract OCR: {download_info.get('url', '')}\n"
            f"2. Add it to your system PATH\n"
            f"3. Restart the application"
        )
    except pytesseract.TesseractError as e:
        raise Exception(f"Tesseract OCR processing error: {str(e)}")
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
    """Compress PDF by optimizing pages and content streams"""
    try:
        reader = PdfReader(input_path)
        writer = PdfWriter()
        
        # Get original file size
        original_size = os.path.getsize(input_path)
        
        # Add pages with compression
        for page_num, page in enumerate(reader.pages):
            try:
                # Compress content streams if method exists
                if hasattr(page, 'compress_content_streams'):
                    page.compress_content_streams()
                
                # Remove annotations to reduce size (optional)
                if hasattr(page, 'annotations') and '/Annots' in page:
                    try:
                        del page['/Annots']
                    except:
                        pass
                
                writer.add_page(page)
                
            except Exception as e:
                # If individual page compression fails, add page normally
                writer.add_page(page)
        
        # Additional writer optimizations
        try:
            # Set compression for images if available
            if hasattr(writer, 'compress_identical_objects'):
                writer.compress_identical_objects()
        except:
            pass
        
        # Write the compressed PDF
        with open(output_path, "wb") as output_file:
            writer.write(output_file)
        
        # Verify the file was created and calculate compression
        if os.path.exists(output_path):
            compressed_size = os.path.getsize(output_path)
            compression_ratio = max(0, (1 - compressed_size / original_size) * 100)
            
            # If no compression achieved, still return success
            return output_path
        else:
            raise Exception("Compressed file was not created")
        
    except Exception as e:
        # If compression fails completely, copy the original file
        try:
            import shutil
            shutil.copy2(input_path, output_path)
            return output_path
        except Exception as copy_error:
            raise Exception(f"Error compressing PDF: {str(e)}. Copy fallback also failed: {str(copy_error)}")

def unlock_pdf(input_path: str, output_path: str, password: str) -> str:
    """Remove password protection from PDF using pikepdf or PyPDF2 as fallback"""
    
    # Try pikepdf first (preferred method)
    if PIKEPDF_AVAILABLE:
        try:
            # Open the password-protected PDF
            with pikepdf.Pdf.open(input_path, password=password) as pdf:
                # Save without password protection
                pdf.save(output_path)
            
            return output_path
        except pikepdf.PasswordError:
            raise Exception("Invalid password provided for PDF unlock")
        except pikepdf.PdfError as e:
            raise Exception(f"PDF processing error: {str(e)}")
        except Exception as e:
            # If pikepdf fails, try PyPDF2 fallback
            pass
    
    # Fallback to PyPDF2 method
    try:
        reader = PdfReader(input_path)
        
        # Check if PDF is encrypted
        if reader.is_encrypted:
            # Try to decrypt with password
            if not reader.decrypt(password):
                raise Exception("Invalid password provided for PDF unlock")
        
        # Create a new PDF without encryption
        writer = PdfWriter()
        for page in reader.pages:
            writer.add_page(page)
        
        # Save the unlocked PDF
        with open(output_path, "wb") as output_file:
            writer.write(output_file)
        
        return output_path
        
    except Exception as e:
        if "Invalid password" in str(e):
            raise Exception("Invalid password provided for PDF unlock")
        else:
            raise Exception(f"Error unlocking PDF: {str(e)}. Note: For best results, install pikepdf using: pip install pikepdf") 

def watermark_pdf(template_path: str, watermark_path: str, output_path: str) -> str:
    """Add watermark to PDF using PyPDF2"""
    try:
        # Read the template PDF
        with open(template_path, "rb") as template_file:
            template = PdfReader(template_file)
            
            # Read the watermark PDF  
            with open(watermark_path, "rb") as watermark_file:
                watermark = PdfReader(watermark_file)
                
                if len(watermark.pages) == 0:
                    raise Exception("Watermark PDF has no pages")
                
                output = PdfWriter()
                watermark_page = watermark.pages[0]
                
                # Loop through all pages and merge watermark
                for i in range(len(template.pages)):
                    page = template.pages[i]
                    page.merge_page(watermark_page)
                    output.add_page(page)
                
                # Write to new PDF
                with open(output_path, "wb") as output_file:
                    output.write(output_file)
                
                return output_path
                
    except Exception as e:
        raise Exception(f"Error adding watermark to PDF: {str(e)}") 