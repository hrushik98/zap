from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.pdf_routes import router as pdf_router
from routes.audio_routes import router as audio_router

# Create FastAPI app
app = FastAPI(
    title="Media Processing API",
    description="API for PDF operations and Audio processing including conversion, trimming, effects, and more",
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
app.include_router(audio_router)

@app.get("/")
async def root():
    return {
        "message": "Media Processing API",
        "version": "1.0.0",
        "services": {
            "pdf_operations": {
                "extract_text": "/api/pdf/extract-text",
                "ocr_image": "/api/pdf/ocr-image", 
                "encrypt": "/api/pdf/encrypt",
                "docx_to_pdf": "/api/pdf/docx-to-pdf",
                "extract_text_docx": "/api/pdf/extract-text-docx",
                "merge": "/api/pdf/merge",
                "split": "/api/pdf/split",
                "compress": "/api/pdf/compress",
                "unlock": "/api/pdf/unlock",
                "watermark": "/api/pdf/watermark"
            },
            "audio_operations": {
                "trim": "/api/audio/trim",
                "convert": "/api/audio/convert",
                "volume": "/api/audio/volume",
                "merge": "/api/audio/merge",
                "effects": "/api/audio/effects",
                "info": "/api/audio/info",
                "formats": "/api/audio/formats"
            }
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "services": ["pdf", "audio"]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 