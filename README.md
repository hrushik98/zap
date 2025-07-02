# Zenetia Zap - Universal File Converter API

Zenetia Zap is a comprehensive all-in-one file conversion API service built with FastAPI. It supports PDF, audio, video, and image processing with a modern, scalable architecture.

## 🚀 Features

### 📄 PDF Hub
- **Merge PDFs** - Combine multiple PDF files into one
- **Split PDFs** - Split PDFs by pages or ranges
- **Compress PDFs** - Reduce file size with quality control
- **PDF to Word** - Convert PDF to DOCX format
- **Add Watermarks** - Add text watermarks to PDFs
- **Extract Text** - OCR and text extraction

### 🎵 Audio Studio
- **Convert Audio** - Support for MP3, WAV, FLAC, AAC, OGG, M4A
- **Trim Audio** - Cut/trim audio files by time
- **Merge Audio** - Combine multiple audio files
- **Volume Control** - Adjust volume levels
- **Fade Effects** - Add fade in/out effects
- **Speed Control** - Change playback speed

### 🎬 Video Lab
- **Convert Video** - Support for MP4, WebM, AVI, MOV, MKV, FLV
- **Compress Video** - Reduce file size with quality/bitrate control
- **Trim Video** - Cut video by time ranges
- **Video to GIF** - Convert video clips to animated GIFs
- **Extract Audio** - Extract audio tracks from videos
- **Add Watermarks** - Add text watermarks to videos

### 🖼️ Image Workshop
- **Convert Images** - Support for JPG, PNG, WebP, HEIC, BMP, TIFF
- **Resize Images** - Change dimensions with aspect ratio control
- **Crop Images** - Crop to specific rectangles
- **Background Removal** - AI-powered background removal
- **Compress Images** - Reduce file size with quality control
- **Image Enhancement** - Brightness, contrast, saturation adjustments

### 🔧 Core System
- **File Upload/Download** - Secure file handling
- **Progress Tracking** - Real-time conversion progress
- **Health Monitoring** - System health checks
- **Usage Statistics** - Track conversions and disk usage
- **File Validation** - Validate file types and sizes

### 👤 User Management
- **Authentication** - JWT-based user authentication
- **User Profiles** - Profile management
- **Usage Limits** - Track and enforce usage quotas
- **Admin Panel** - Admin user management

## 🛠️ Installation

### Prerequisites
- Python 3.8+
- FFmpeg (for video/audio processing)
- Tesseract OCR (for text extraction)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd zap
```

### 2. Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Install System Dependencies

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg tesseract-ocr
```

**macOS:**
```bash
brew install ffmpeg tesseract
```

**Windows:**
- Download FFmpeg from https://ffmpeg.org/download.html
- Download Tesseract from https://github.com/UB-Mannheim/tesseract/wiki

### 5. Environment Configuration
Create a `.env` file in the root directory:
```env
# App Settings
DEBUG=True
SECRET_KEY=your-super-secret-key-change-in-production

# File Settings
MAX_FILE_SIZE=104857600  # 100MB in bytes
UPLOAD_DIR=./uploads
OUTPUT_DIR=./outputs
TEMP_DIR=./temp

# Database (optional)
DATABASE_URL=sqlite:///./zap.db

# Redis (optional - for background tasks)
REDIS_URL=redis://localhost:6379

# External APIs
YOUTUBE_DL_ENABLED=True
```

## 🚀 Running the Application

### Development Mode
```bash
python -m app.main
```

### Production Mode
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Using Docker (optional)
```bash
# Build image
docker build -t zenetia-zap .

# Run container
docker run -p 8000:8000 -v $(pwd)/uploads:/app/uploads -v $(pwd)/outputs:/app/outputs zenetia-zap
```

## 📖 API Documentation

Once the server is running, visit:
- **Interactive API Docs**: http://localhost:8000/docs
- **ReDoc Documentation**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/

### Authentication

Most endpoints require authentication. First, get an access token:

```bash
# Login (demo admin user)
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=admin@zenetia.com&password=admin123"
```

Use the returned token in subsequent requests:
```bash
curl -X GET "http://localhost:8000/api/v1/auth/profile" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🔧 API Examples

### Upload a File
```bash
curl -X POST "http://localhost:8000/api/v1/core/upload" \
  -F "file=@example.pdf"
```

### Convert PDF to Word
```bash
curl -X POST "http://localhost:8000/api/v1/pdf/to-word" \
  -F "file=@document.pdf"
```

### Convert Audio Format
```bash
curl -X POST "http://localhost:8000/api/v1/audio/convert" \
  -F "file=@audio.wav" \
  -F "target_format=mp3" \
  -F "bitrate=192"
```

### Resize Image
```bash
curl -X POST "http://localhost:8000/api/v1/image/resize" \
  -F "file=@image.jpg" \
  -F "width=800" \
  -F "height=600"
```

### Compress Video
```bash
curl -X POST "http://localhost:8000/api/v1/video/compress" \
  -F "file=@video.mp4" \
  -F "quality=75"
```

## 📁 Project Structure

```
zap/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   │   ├── core/
│   │   │   ├── config.py          # Configuration settings
│   │   │   └── dependencies.py    # Dependency injection
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── api.py         # Main API router
│   │   │       └── endpoints/     # API endpoint modules
│   │   │           ├── pdf.py     # PDF processing endpoints
│   │   │           ├── audio.py   # Audio processing endpoints
│   │   │           ├── video.py   # Video processing endpoints
│   │   │           ├── image.py   # Image processing endpoints
│   │   │           ├── core.py    # Core system endpoints
│   │   │           └── auth.py    # Authentication endpoints
│   │   ├── models/
│   │   │   └── schemas.py         # Pydantic models/schemas
│   │   ├── services/
│   │   │   ├── pdf_service.py     # PDF processing logic
│   │   │   ├── audio_service.py   # Audio processing logic
│   │   │   ├── video_service.py   # Video processing logic
│   │   │   └── image_service.py   # Image processing logic
│   │   └── utils/
│   │       └── file_utils.py      # File handling utilities
│   ├── uploads/                   # Uploaded files directory
│   ├── outputs/                   # Processed files directory
│   ├── temp/                      # Temporary files directory
│   ├── requirements.txt           # Python dependencies
│   ├── README.md                 # This file
│   └── .env                      # Environment variables
```

## 🔒 Security Considerations

### Production Deployment
1. **Change the SECRET_KEY** in production
2. **Configure CORS** for your frontend domain
3. **Use HTTPS** in production
4. **Set up rate limiting** for API endpoints
5. **Configure file size limits** appropriately
6. **Use a real database** instead of in-memory storage
7. **Set up proper logging** and monitoring

### File Security
- Files are automatically cleaned up after processing
- Uploaded files are validated for type and size
- Temporary files are periodically cleaned
- No executable files are processed

## 🚀 Deployment

### Using PM2 (Node.js Process Manager)
```bash
npm install -g pm2
pm2 start "uvicorn app.main:app --host 0.0.0.0 --port 8000" --name zenetia-zap
```

### Using systemd (Linux)
Create `/etc/systemd/system/zenetia-zap.service`:
```ini
[Unit]
Description=Zenetia Zap API
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/path/to/zap
Environment=PATH=/path/to/zap/venv/bin
ExecStart=/path/to/zap/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

### Using Nginx (Reverse Proxy)
```nginx
server {
    listen 80;
    server_name your-domain.com;

    client_max_body_size 100M;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Open an issue on GitHub
- Check the API documentation at `/docs`
- Review the examples above

## 🔄 Roadmap

- [ ] Add batch processing for multiple files
- [ ] Implement WebSocket for real-time progress
- [ ] Add more video formats and codecs
- [ ] Implement cloud storage integration (AWS S3, Google Cloud)
- [ ] Add machine learning-based image enhancement
- [ ] Create web-based frontend interface
- [ ] Add API rate limiting and quotas
- [ ] Implement caching for frequently requested conversions
