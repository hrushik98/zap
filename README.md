# Zap by Zenetia

Zenetia Zap is a comprehensive all-in-one file conversion API service built with FastAPI. It supports PDF, audio, video, and image processing with a modern, scalable architecture.

## 🌟 Features

### Core Functionality
- **PDF Processing**: Merge, split, compress, convert to Word
- **Image Processing**: Convert, resize, crop, background removal, compression
- **Audio Processing**: Format conversion, trimming, volume adjustment
- **Video Processing**: Format conversion, compression, trimming, GIF creation

### Authentication & Security
- **User Management**: Profile management and session handling
- **Rate Limiting**: Usage limits and quota management

### API Features
- **RESTful API**: Clean, documented endpoints
- **File Upload**: Multi-file upload with validation
- **Progress Tracking**: Real-time conversion status
- **Download Management**: Secure file download URLs

## 🚀 Quick Start

### Prerequisites
- Python 3.10

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd zap
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key
CLERK_SECRET_KEY=sk_test_your_secret_key
CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key
CLERK_JWT_VERIFY_AUDIENCE=https://your-clerk-domain.clerk.accounts.dev
CLERK_JWT_VERIFY_ISSUER=https://your-clerk-domain.clerk.accounts.dev
CLERK_JWKS_URL=https://your-clerk-domain.clerk.accounts.dev/.well-known/jwks.json

# Application Settings
DEBUG=True
SECRET_KEY=your-secret-key-change-in-production
MAX_FILE_SIZE=104857600

# Redis (optional)
REDIS_URL=redis://localhost:6379

# File Storage
UPLOAD_DIR=./uploads
OUTPUT_DIR=./outputs
TEMP_DIR=./temp
```

4. **Start the server**
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

## 📚 API Documentation

### Authentication

All API endpoints require a valid Clerk JWT token in the Authorization header:
```
Authorization: Bearer <clerk_jwt_token>
```

### Core Endpoints

#### Authentication
- `GET /api/v1/auth/me` - Get current user profile
- `POST /api/v1/auth/verify` - Verify token validity
- `GET /api/v1/auth/session` - Get session information
- `GET /api/v1/auth/health` - Check auth service health

#### PDF Operations
- `POST /api/v1/pdf/merge` - Merge multiple PDFs
- `POST /api/v1/pdf/split` - Split PDF by pages
- `POST /api/v1/pdf/compress` - Compress PDF file
- `POST /api/v1/pdf/to-word` - Convert PDF to Word document

#### File Management
- `POST /api/v1/core/upload` - Upload files
- `GET /api/v1/core/download/{conversion_id}` - Download converted files
- `GET /api/v1/core/health` - System health check

### Example Usage

#### PDF Merge
```python
import requests

headers = {"Authorization": "Bearer <your_clerk_jwt_token>"}
files = [
    ("files", ("doc1.pdf", open("doc1.pdf", "rb"), "application/pdf")),
    ("files", ("doc2.pdf", open("doc2.pdf", "rb"), "application/pdf"))
]

response = requests.post(
    "http://localhost:8000/api/v1/pdf/merge",
    files=files,
    headers=headers
)

result = response.json()
print(f"Download URL: {result['download_url']}")
```

#### PDF to Word Conversion
```python
import requests

headers = {"Authorization": "Bearer <your_clerk_jwt_token>"}
files = {"file": ("document.pdf", open("document.pdf", "rb"), "application/pdf")}

response = requests.post(
    "http://localhost:8000/api/v1/pdf/to-word",
    files=files,
    headers=headers
)

result = response.json()
print(f"Converted file: {result['download_url']}")
```

## 🔧 Configuration

### Clerk Setup

1. Create a Clerk application at [clerk.com](https://clerk.com)
2. Get your publishable and secret keys
3. Configure your JWT settings:
   - Audience: Your Clerk domain
   - Issuer: Your Clerk domain
   - JWKS URL: `https://your-domain.clerk.accounts.dev/.well-known/jwks.json`

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `CLERK_SECRET_KEY` | Clerk secret key | Yes |
| `CLERK_PUBLISHABLE_KEY` | Clerk publishable key | Yes |
| `CLERK_JWT_VERIFY_AUDIENCE` | JWT audience for verification | Yes |
| `CLERK_JWT_VERIFY_ISSUER` | JWT issuer for verification | Yes |
| `CLERK_JWKS_URL` | JWKS endpoint URL | Yes |
| `MAX_FILE_SIZE` | Maximum file upload size in bytes | No |
| `DEBUG` | Enable debug mode | No |

## 🛠️ Development

### Project Structure
```
zap/
├── app/
│   ├── api/v1/endpoints/    # API endpoints
│   ├── core/                # Core configuration
│   ├── models/              # Pydantic schemas
│   └── services/            # Business logic
├── frontend/                # Next.js frontend
├── requirements.txt         # Python dependencies
└── README.md
```

### Running Tests
```bash
python demo_api_usage.py
```

### API Documentation
Visit `http://localhost:8000/docs` for interactive API documentation.

## 📦 Dependencies

### Core
- **FastAPI**: Modern web framework
- **Pydantic**: Data validation
- **PyJWT**: JWT token handling
- **Cryptography**: Security utilities

### File Processing
- **PyPDF2**: PDF manipulation
- **pdf2docx**: PDF to Word conversion
- **Pillow**: Image processing
- **moviepy**: Video processing
- **pydub**: Audio processing

### Authentication
- **Clerk**: User authentication and management

## 🚦 Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 413 | File Too Large |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

## 🔒 Security

- JWT token validation with Clerk
- File type validation
- File size limits
- Rate limiting (configurable)
- CORS protection

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For support and questions:
- Documentation: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/api/v1/core/health`
- Auth Health: `http://localhost:8000/api/v1/auth/health`
