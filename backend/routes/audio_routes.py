from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from fastapi.responses import FileResponse
from typing import List, Optional
import os
import uuid
import aiofiles
try:
    # Try to use full ffmpeg version first
    from helpers.audio_utils import (
        trim_audio,
        convert_audio_format,
        adjust_volume,
        merge_audio_files,
        add_fade_effects,
        get_audio_info,
        get_supported_formats,
        validate_audio_file,
        generate_sine_melody,
        generate_square_tones,
        overlay_audio_files
    )
except ImportError:
    # Fallback to simple version if ffmpeg not available
    from helpers.audio_utils_simple import (
        trim_audio,
        convert_audio_format,
        adjust_volume,
        merge_audio_files,
        add_fade_effects,
        get_audio_info,
        get_supported_formats,
        validate_audio_file,
        generate_sine_melody,
        generate_square_tones,
        overlay_audio_files
    )

router = APIRouter(prefix="/api/audio", tags=["Audio Operations"])

# Ensure uploads directory exists
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

async def save_upload_file(upload_file: UploadFile, destination: str) -> str:
    """Save uploaded file to destination"""
    async with aiofiles.open(destination, 'wb') as f:
        content = await upload_file.read()
        await f.write(content)
    return destination

@router.get("/health")
async def health_check():
    """Check the health of audio services"""
    return {
        "audio_services": "operational",
        "supported_formats": get_supported_formats(),
        "features": [
            "trim", "convert", "volume_adjust", 
            "merge", "fade_effects", "info_extraction",
            "audio_generation", "overlay_merge"
        ]
    }

@router.post("/generate/demo-files")
async def generate_demo_audio_files():
    """Generate demo audio files for merging - sine melody and square tones"""
    try:
        file_id = str(uuid.uuid4())
        
        # Generate paths for demo files
        sine_melody_path = os.path.join(UPLOAD_DIR, f"sine_melody_{file_id}.mp3")
        square_tones_path = os.path.join(UPLOAD_DIR, f"square_tones_{file_id}.mp3")
        
        # Generate the audio files
        sine_result = generate_sine_melody(sine_melody_path)
        square_result = generate_square_tones(square_tones_path)
        
        return {
            "success": True,
            "sine_melody": {
                "file_id": f"sine_melody_{file_id}",
                "filename": f"sine_melody_{file_id}.mp3",
                "details": sine_result
            },
            "square_tones": {
                "file_id": f"square_tones_{file_id}",
                "filename": f"square_tones_{file_id}.mp3", 
                "details": square_result
            },
            "message": "Demo audio files generated successfully. Use the file IDs to download or merge them."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/download/{file_id}")
async def download_generated_audio(file_id: str):
    """Download a generated audio file by its ID"""
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}.mp3")
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Audio file not found")
    
    return FileResponse(
        file_path,
        media_type='audio/mpeg',
        filename=f"{file_id}.mp3"
    )

@router.post("/overlay")
async def overlay_audio_endpoint(files: List[UploadFile] = File(...)):
    """Overlay (mix) two audio files together - plays them simultaneously"""
    if len(files) != 2:
        raise HTTPException(status_code=400, detail="Exactly 2 audio files required for overlay")
    
    # Validate all files
    supported_formats = get_supported_formats()
    for file in files:
        file_extension = file.filename.lower().split('.')[-1]
        if file_extension not in supported_formats:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported audio format in file {file.filename}. Supported formats: {', '.join(supported_formats)}"
            )
    
    file_id = str(uuid.uuid4())
    input_paths = []
    output_path = os.path.join(UPLOAD_DIR, f"overlayed_{file_id}.mp3")
    
    try:
        # Save both uploaded files
        for i, file in enumerate(files):
            input_path = os.path.join(UPLOAD_DIR, f"{file_id}_{i}_{file.filename}")
            await save_upload_file(file, input_path)
            
            # Validate each audio file
            if not validate_audio_file(input_path):
                raise HTTPException(status_code=400, detail=f"Invalid or corrupted audio file: {file.filename}")
            
            input_paths.append(input_path)
        
        # Overlay the two audio files
        result = overlay_audio_files(input_paths[0], input_paths[1], output_path)
        
        # Clean up input files
        for path in input_paths:
            os.remove(path)
        
        return FileResponse(
            output_path,
            media_type='audio/mpeg',
            filename="overlayed_audio.mp3",
            headers={
                "X-Audio1-Duration": str(result["audio1_duration"]),
                "X-Audio2-Duration": str(result["audio2_duration"]),
                "X-Merged-Duration": str(result["merged_duration"]),
                "X-Operation": "overlay"
            }
        )
    
    except Exception as e:
        # Clean up on error
        for path in input_paths + [output_path]:
            if os.path.exists(path):
                os.remove(path)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/merge-generated")
async def merge_generated_demo_files():
    """Generate demo files and immediately overlay them"""
    try:
        file_id = str(uuid.uuid4())
        
        # Generate paths for demo files
        sine_melody_path = os.path.join(UPLOAD_DIR, f"sine_melody_{file_id}.mp3")
        square_tones_path = os.path.join(UPLOAD_DIR, f"square_tones_{file_id}.mp3")
        output_path = os.path.join(UPLOAD_DIR, f"merged_demo_{file_id}.mp3")
        
        # Generate the audio files
        sine_result = generate_sine_melody(sine_melody_path)
        square_result = generate_square_tones(square_tones_path)
        
        # Overlay them
        overlay_result = overlay_audio_files(sine_melody_path, square_tones_path, output_path)
        
        # Clean up temporary files
        os.remove(sine_melody_path)
        os.remove(square_tones_path)
        
        return FileResponse(
            output_path,
            media_type='audio/mpeg',
            filename="merged_demo_audio.mp3",
            headers={
                "X-Sine-Notes": ", ".join(sine_result["notes"]),
                "X-Square-Notes": ", ".join(square_result["notes"]),
                "X-Operation": "demo_generation_and_overlay",
                "X-Total-Duration": str(overlay_result["merged_duration"])
            }
        )
        
    except Exception as e:
        # Clean up on error
        for path in [sine_melody_path, square_tones_path, output_path]:
            if 'path' in locals() and os.path.exists(path):
                os.remove(path)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/formats")
async def get_supported_audio_formats():
    """Get list of supported audio formats"""
    return {
        "supported_formats": get_supported_formats(),
        "input_formats": get_supported_formats(),
        "output_formats": ["mp3", "wav", "flac", "aac", "ogg", "m4a"]
    }

@router.post("/info")
async def get_audio_file_info(file: UploadFile = File(...)):
    """Get information about an audio file"""
    # Validate file extension
    supported_formats = get_supported_formats()
    file_extension = file.filename.lower().split('.')[-1]
    if file_extension not in supported_formats:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported audio format. Supported formats: {', '.join(supported_formats)}"
        )
    
    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
    
    try:
        await save_upload_file(file, file_path)
        
        # Validate audio file
        if not validate_audio_file(file_path):
            raise HTTPException(status_code=400, detail="Invalid or corrupted audio file")
        
        # Get audio info
        audio_info = get_audio_info(file_path)
        
        # Clean up
        os.remove(file_path)
        
        return {
            "success": True,
            "filename": file.filename,
            "audio_info": audio_info
        }
    
    except Exception as e:
        # Clean up on error
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/trim")
async def trim_audio_endpoint(
    file: UploadFile = File(...),
    start_time: float = Form(...),
    end_time: float = Form(...)
):
    """Trim audio file between start_time and end_time (in seconds)"""
    # Validate file extension
    supported_formats = get_supported_formats()
    file_extension = file.filename.lower().split('.')[-1]
    if file_extension not in supported_formats:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported audio format. Supported formats: {', '.join(supported_formats)}"
        )
    
    # Validate time parameters
    if start_time < 0:
        raise HTTPException(status_code=400, detail="Start time cannot be negative")
    if start_time >= end_time:
        raise HTTPException(status_code=400, detail="Start time must be less than end time")
    
    file_id = str(uuid.uuid4())
    input_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
    output_path = os.path.join(UPLOAD_DIR, f"trimmed_{file_id}_{file.filename.rsplit('.', 1)[0]}.mp3")
    
    try:
        await save_upload_file(file, input_path)
        
        # Validate audio file
        if not validate_audio_file(input_path):
            raise HTTPException(status_code=400, detail="Invalid or corrupted audio file")
        
        # Trim audio
        result = trim_audio(input_path, output_path, start_time, end_time)
        
        # Clean up input file
        os.remove(input_path)
        
        return FileResponse(
            output_path,
            media_type='audio/mpeg',
            filename=f"trimmed_{file.filename.rsplit('.', 1)[0]}.mp3",
            headers={
                "X-Original-Duration": str(result["original_duration"]),
                "X-Trimmed-Duration": str(result["trimmed_duration"]),
                "X-Start-Time": str(start_time),
                "X-End-Time": str(end_time)
            }
        )
    
    except Exception as e:
        # Clean up on error
        for path in [input_path, output_path]:
            if os.path.exists(path):
                os.remove(path)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/convert")
async def convert_audio_endpoint(
    file: UploadFile = File(...),
    output_format: str = Form("mp3")
):
    """Convert audio file to different format"""
    # Validate input file extension
    supported_formats = get_supported_formats()
    file_extension = file.filename.lower().split('.')[-1]
    if file_extension not in supported_formats:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported audio format. Supported formats: {', '.join(supported_formats)}"
        )
    
    # Validate output format
    output_formats = ["mp3", "wav", "flac", "aac", "ogg", "m4a"]
    if output_format.lower() not in output_formats:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported output format. Supported formats: {', '.join(output_formats)}"
        )
    
    file_id = str(uuid.uuid4())
    input_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
    output_filename = f"converted_{file_id}_{file.filename.rsplit('.', 1)[0]}.{output_format}"
    output_path = os.path.join(UPLOAD_DIR, output_filename)
    
    try:
        await save_upload_file(file, input_path)
        
        # Validate audio file
        if not validate_audio_file(input_path):
            raise HTTPException(status_code=400, detail="Invalid or corrupted audio file")
        
        # Convert audio
        result = convert_audio_format(input_path, output_path, output_format)
        
        # Clean up input file
        os.remove(input_path)
        
        # Set appropriate media type
        media_types = {
            "mp3": "audio/mpeg",
            "wav": "audio/wav",
            "flac": "audio/flac",
            "aac": "audio/aac",
            "ogg": "audio/ogg",
            "m4a": "audio/mp4"
        }
        
        return FileResponse(
            output_path,
            media_type=media_types.get(output_format, "audio/mpeg"),
            filename=f"converted_{file.filename.rsplit('.', 1)[0]}.{output_format}",
            headers={
                "X-Original-Format": result["original_format"],
                "X-Output-Format": output_format,
                "X-Duration": str(result["duration"])
            }
        )
    
    except Exception as e:
        # Clean up on error
        for path in [input_path, output_path]:
            if os.path.exists(path):
                os.remove(path)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/volume")
async def adjust_volume_endpoint(
    file: UploadFile = File(...),
    volume_change: float = Form(0.0)
):
    """Adjust audio volume (volume_change in dB: positive = louder, negative = quieter)"""
    # Validate file extension
    supported_formats = get_supported_formats()
    file_extension = file.filename.lower().split('.')[-1]
    if file_extension not in supported_formats:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported audio format. Supported formats: {', '.join(supported_formats)}"
        )
    
    # Validate volume change range
    if volume_change < -60 or volume_change > 60:
        raise HTTPException(
            status_code=400, 
            detail="Volume change must be between -60dB and +60dB"
        )
    
    file_id = str(uuid.uuid4())
    input_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
    output_path = os.path.join(UPLOAD_DIR, f"volume_adjusted_{file_id}_{file.filename.rsplit('.', 1)[0]}.mp3")
    
    try:
        await save_upload_file(file, input_path)
        
        # Validate audio file
        if not validate_audio_file(input_path):
            raise HTTPException(status_code=400, detail="Invalid or corrupted audio file")
        
        # Adjust volume
        result = adjust_volume(input_path, output_path, volume_change)
        
        # Clean up input file
        os.remove(input_path)
        
        return FileResponse(
            output_path,
            media_type='audio/mpeg',
            filename=f"volume_adjusted_{file.filename.rsplit('.', 1)[0]}.mp3",
            headers={
                "X-Volume-Change": str(volume_change),
                "X-Duration": str(result["duration"])
            }
        )
    
    except Exception as e:
        # Clean up on error
        for path in [input_path, output_path]:
            if os.path.exists(path):
                os.remove(path)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/merge")
async def merge_audio_endpoint(files: List[UploadFile] = File(...)):
    """Merge multiple audio files into one"""
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="At least 2 audio files required for merging")
    
    # Validate all files
    supported_formats = get_supported_formats()
    for file in files:
        file_extension = file.filename.lower().split('.')[-1]
        if file_extension not in supported_formats:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported audio format in file {file.filename}. Supported formats: {', '.join(supported_formats)}"
            )
    
    file_id = str(uuid.uuid4())
    input_paths = []
    output_path = os.path.join(UPLOAD_DIR, f"merged_{file_id}.mp3")
    
    try:
        # Save all uploaded files
        for i, file in enumerate(files):
            input_path = os.path.join(UPLOAD_DIR, f"{file_id}_{i}_{file.filename}")
            await save_upload_file(file, input_path)
            
            # Validate each audio file
            if not validate_audio_file(input_path):
                raise HTTPException(status_code=400, detail=f"Invalid or corrupted audio file: {file.filename}")
            
            input_paths.append(input_path)
        
        # Merge audio files
        result = merge_audio_files(input_paths, output_path)
        
        # Clean up input files
        for path in input_paths:
            os.remove(path)
        
        return FileResponse(
            output_path,
            media_type='audio/mpeg',
            filename="merged_audio.mp3",
            headers={
                "X-Files-Merged": str(result["files_merged"]),
                "X-Total-Duration": str(result["total_duration"])
            }
        )
    
    except Exception as e:
        # Clean up on error
        for path in input_paths + [output_path]:
            if os.path.exists(path):
                os.remove(path)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/effects")
async def add_effects_endpoint(
    file: UploadFile = File(...),
    fade_in: float = Form(0.0),
    fade_out: float = Form(0.0)
):
    """Add fade in/out effects to audio (times in seconds)"""
    # Validate file extension
    supported_formats = get_supported_formats()
    file_extension = file.filename.lower().split('.')[-1]
    if file_extension not in supported_formats:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported audio format. Supported formats: {', '.join(supported_formats)}"
        )
    
    # Validate fade parameters
    if fade_in < 0 or fade_out < 0:
        raise HTTPException(status_code=400, detail="Fade times cannot be negative")
    if fade_in > 30 or fade_out > 30:
        raise HTTPException(status_code=400, detail="Fade times cannot exceed 30 seconds")
    
    file_id = str(uuid.uuid4())
    input_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
    output_path = os.path.join(UPLOAD_DIR, f"effects_{file_id}_{file.filename.rsplit('.', 1)[0]}.mp3")
    
    try:
        await save_upload_file(file, input_path)
        
        # Validate audio file
        if not validate_audio_file(input_path):
            raise HTTPException(status_code=400, detail="Invalid or corrupted audio file")
        
        # Add fade effects
        result = add_fade_effects(input_path, output_path, fade_in, fade_out)
        
        # Clean up input file
        os.remove(input_path)
        
        return FileResponse(
            output_path,
            media_type='audio/mpeg',
            filename=f"effects_{file.filename.rsplit('.', 1)[0]}.mp3",
            headers={
                "X-Fade-In": str(fade_in),
                "X-Fade-Out": str(fade_out),
                "X-Duration": str(result["total_duration"])
            }
        )
    
    except Exception as e:
        # Clean up on error
        for path in [input_path, output_path]:
            if os.path.exists(path):
                os.remove(path)
        raise HTTPException(status_code=500, detail=str(e)) 