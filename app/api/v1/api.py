"""
Main API router for version 1
"""

from fastapi import APIRouter

from app.api.v1.endpoints import pdf, audio, video, image, core, auth

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(pdf.router, prefix="/pdf", tags=["PDF Hub"])
api_router.include_router(audio.router, prefix="/audio", tags=["Audio Studio"])
api_router.include_router(video.router, prefix="/video", tags=["Video Lab"])
api_router.include_router(image.router, prefix="/image", tags=["Image Workshop"])
api_router.include_router(core.router, prefix="/core", tags=["Core System"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"]) 