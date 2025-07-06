from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.pdf_routes import router as pdf_router

# Create FastAPI app
app = FastAPI(
    title="PDF Processing API",
    description="API for PDF operations including text extraction, OCR, encryption, and conversions",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(pdf_router)

@app.get("/")
async def root():
    return {
        "message": "PDF Processing API",
        "version": "1.0.0",
        "endpoints": {
            "extract_text": "/api/pdf/extract-text",
            "ocr_image": "/api/pdf/ocr-image", 
            "encrypt": "/api/pdf/encrypt",
            "docx_to_pdf": "/api/pdf/docx-to-pdf",
            "extract_text_docx": "/api/pdf/extract-text-docx",
            "merge": "/api/pdf/merge",
            "split": "/api/pdf/split",
            "compress": "/api/pdf/compress"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 