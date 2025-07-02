"""
Main FastAPI application for Zenetia Zap converter service
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time
import uvicorn

from app.api.v1.api import api_router
from app.core.config import settings

# Create FastAPI app instance
app = FastAPI(
    title="Zenetia Zap - Universal File Converter API",
    description="A comprehensive file conversion service supporting PDF, Audio, Video, and Image processing",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Include API routes
app.include_router(api_router, prefix="/api/v1")

# Health check endpoint
@app.get("/")
async def root():
    return {
        "message": "Zenetia Zap - Universal File Converter API",
        "version": "1.0.0",
        "status": "healthy",
        "docs": "/docs"
    }

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "message": "Internal server error occurred",
            "detail": str(exc) if settings.DEBUG else "An error occurred while processing your request"
        }
    )

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    ) 