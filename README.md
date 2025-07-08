# ZAP3 - PDF Processing Hub 🗂️

A comprehensive PDF processing application with OCR capabilities, built with FastAPI backend and Next.js frontend.

## ✨ Features

- **📄 PDF Text Extraction** - Extract text content from PDF files
- **🔍 OCR Image Processing** - Extract text from images using Tesseract OCR
- **🔒 PDF Encryption** - Password protect your PDFs
- **📄➡️📑 DOCX to PDF** - Convert Word documents to PDF
- **🔗 PDF Merging** - Combine multiple PDFs into one
- **✂️ PDF Splitting** - Split PDFs into individual pages
- **🗜️ PDF Compression** - Reduce file size without losing quality
- **💾 Download History** - Access and download recent conversions
- **👁️ File Preview** - Preview processed files before downloading

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+**
- **Node.js 16+**
- **Tesseract OCR** (for image text extraction)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd zap3
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

### 3. Install Tesseract OCR

#### 🪟 Windows (Automated)
```bash
cd backend
python setup_tesseract.py
```

#### 🪟 Windows (Manual)
1. Download from: https://github.com/UB-Mannheim/tesseract/wiki
2. Run installer as Administrator
3. Install to: `C:\Program Files\Tesseract-OCR\`
4. Add to system PATH or restart application

#### 🍎 macOS
```bash
brew install tesseract
```

#### 🐧 Linux
```bash
# Ubuntu/Debian
sudo apt-get install tesseract-ocr

# CentOS/RHEL  
sudo yum install tesseract

# Arch
sudo pacman -S tesseract
```

### 4. Start Backend Server

```bash
cd backend
python start.py
```

Backend will run on: http://localhost:8000

### 5. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on: http://localhost:3000

## 🛠️ Troubleshooting

### OCR Not Working?

If you see "Tesseract OCR Not Installed" errors:

1. **Check Installation Status**
   ```bash
   tesseract --version
   ```

2. **Run Health Check**
   - Visit: http://localhost:8000/api/pdf/health
   - Check `tesseract_ocr.status`

3. **Use Setup Script** (Windows)
   ```bash
   cd backend
   python setup_tesseract.py
   ```

4. **Manual PATH Setup** (Windows)
   - Press `Win + R`, type `sysdm.cpl`
   - Environment Variables → System Variables → Path → Edit
   - Add: `C:\Program Files\Tesseract-OCR`
   - Restart command prompt/IDE

### Common Issues

#### "pytesseract not found"
```bash
pip install pytesseract==0.3.10
```

#### "cv2 module not found"  
```bash
pip install opencv-python==4.8.1.78
```

#### "Permission denied" (Windows)
- Run setup script as Administrator
- Install Tesseract as Administrator

#### OCR returns empty text
- Image might be low quality or unreadable
- Try preprocessing the image for better contrast
- Supported formats: PNG, JPG, JPEG, TIFF, BMP

## 📁 Project Structure

```
zap3/
├── backend/                 # FastAPI backend
│   ├── helpers/            # Utility functions
│   │   ├── pdf_utils.py   # PDF processing logic
│   │   └── __init__.py
│   ├── routes/            # API endpoints
│   │   ├── pdf_routes.py  # PDF operation routes
│   │   └── __init__.py
│   ├── uploads/           # Temporary file storage
│   ├── main.py           # FastAPI app configuration
│   ├── start.py          # Server startup script
│   ├── setup_tesseract.py # OCR setup helper
│   └── requirements.txt  # Python dependencies
├── frontend/              # Next.js frontend
│   ├── app/              # App router pages
│   ├── components/       # React components
│   │   ├── pdf-hub.tsx  # Main PDF processing UI
│   │   ├── sidebar.tsx  # Navigation sidebar
│   │   └── ui/          # UI components
│   ├── lib/             # Utilities
│   │   ├── api.ts       # API client
│   │   └── utils.ts     # Helper functions
│   └── package.json     # Node.js dependencies
└── README.md            # This file
```

## 🔧 API Endpoints

### Health Check
- `GET /api/pdf/health` - Check service status and OCR availability

### PDF Operations
- `POST /api/pdf/extract-text` - Extract text from PDF
- `POST /api/pdf/ocr-image` - OCR text from image
- `POST /api/pdf/encrypt` - Password protect PDF
- `POST /api/pdf/docx-to-pdf` - Convert DOCX to PDF
- `POST /api/pdf/merge` - Merge multiple PDFs
- `POST /api/pdf/split` - Split PDF into pages
- `POST /api/pdf/compress` - Compress PDF file

## 🧩 Dependencies

### Backend
- **FastAPI** - Web framework
- **PyPDF2** - PDF processing
- **pytesseract** - OCR wrapper
- **opencv-python** - Image processing
- **python-docx** - DOCX handling
- **docx2pdf** - Document conversion

### Frontend
- **Next.js** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## 🔒 Security Notes

- Files are temporarily stored during processing
- Automatic cleanup after operations
- No permanent file storage on server
- All data stored locally in browser

## 🐛 Known Issues

1. **Large File Processing** - Very large files may timeout
2. **DOCX Conversion** - Requires Microsoft Office or LibreOffice on system
3. **OCR Accuracy** - Depends on image quality and text clarity

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section
2. Run the health check endpoint
3. Verify Tesseract installation
4. Check browser console for errors

## 📄 License

This project is licensed under the MIT License.

---

**Made with ❤️ for efficient PDF processing**