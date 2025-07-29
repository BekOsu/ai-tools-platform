from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import cv2
import numpy as np
import io
import base64
from PIL import Image, ImageEnhance, ImageFilter
import os
import uuid
from typing import List, Optional
import asyncio
from pydantic import BaseModel
import json
from datetime import datetime

app = FastAPI(title="Image Processing Service", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create directories for file storage
os.makedirs("uploads", exist_ok=True)
os.makedirs("processed", exist_ok=True)

class ImageProcessingRequest(BaseModel):
    operation: str
    parameters: dict = {}

class ImageAnalysisRequest(BaseModel):
    analyze_faces: bool = False
    detect_objects: bool = False
    extract_text: bool = False
    analyze_colors: bool = False

class ProcessingResult(BaseModel):
    job_id: str
    status: str
    result_url: Optional[str] = None
    metadata: dict = {}
    created_at: str

# In-memory job storage (use Redis in production)
jobs = {}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "image-processing",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

@app.post("/api/image/upload")
async def upload_image(file: UploadFile = File(...)):
    """Upload an image for processing"""
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Generate unique filename
    file_id = str(uuid.uuid4())
    file_extension = file.filename.split('.')[-1]
    filename = f"{file_id}.{file_extension}"
    file_path = os.path.join("uploads", filename)
    
    # Save uploaded file
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    return {
        "file_id": file_id,
        "filename": filename,
        "size": len(content),
        "message": "Image uploaded successfully"
    }

@app.post("/api/image/process/{file_id}")
async def process_image(
    file_id: str, 
    request: ImageProcessingRequest,
    background_tasks: BackgroundTasks
):
    """Process an uploaded image"""
    file_path = os.path.join("uploads", f"{file_id}.jpg")
    if not os.path.exists(file_path):
        # Try different extensions
        for ext in ['png', 'jpeg', 'bmp', 'tiff']:
            test_path = os.path.join("uploads", f"{file_id}.{ext}")
            if os.path.exists(test_path):
                file_path = test_path
                break
        else:
            raise HTTPException(status_code=404, detail="Image not found")
    
    job_id = str(uuid.uuid4())
    jobs[job_id] = ProcessingResult(
        job_id=job_id,
        status="processing",
        created_at=datetime.now().isoformat(),
        metadata={"operation": request.operation, "parameters": request.parameters}
    )
    
    # Start background processing
    background_tasks.add_task(
        process_image_background, 
        job_id, 
        file_path, 
        request.operation, 
        request.parameters
    )
    
    return {"job_id": job_id, "status": "processing"}

@app.get("/api/image/job/{job_id}")
async def get_job_status(job_id: str):
    """Get processing job status"""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return jobs[job_id]

@app.post("/api/image/analyze/{file_id}")
async def analyze_image(file_id: str, request: ImageAnalysisRequest):
    """Analyze an image for various features"""
    file_path = os.path.join("uploads", f"{file_id}.jpg")
    if not os.path.exists(file_path):
        for ext in ['png', 'jpeg', 'bmp', 'tiff']:
            test_path = os.path.join("uploads", f"{file_id}.{ext}")
            if os.path.exists(test_path):
                file_path = test_path
                break
        else:
            raise HTTPException(status_code=404, detail="Image not found")
    
    results = {}
    
    # Load image
    image = cv2.imread(file_path)
    if image is None:
        raise HTTPException(status_code=400, detail="Invalid image file")
    
    # Basic image info
    height, width, channels = image.shape
    results["image_info"] = {
        "width": width,
        "height": height,
        "channels": channels,
        "size_mb": os.path.getsize(file_path) / (1024 * 1024)
    }
    
    # Face detection
    if request.analyze_faces:
        results["faces"] = detect_faces(image)
    
    # Object detection (simplified)
    if request.detect_objects:
        results["objects"] = detect_objects(image)
    
    # Color analysis
    if request.analyze_colors:
        results["colors"] = analyze_colors(image)
    
    # Text extraction (OCR simulation)
    if request.extract_text:
        results["text"] = extract_text_simulation(image)
    
    return results

@app.get("/api/image/download/{job_id}")
async def download_processed_image(job_id: str):
    """Download processed image"""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = jobs[job_id]
    if job.status != "completed":
        raise HTTPException(status_code=400, detail="Job not completed")
    
    if not job.result_url:
        raise HTTPException(status_code=404, detail="Processed image not found")
    
    return FileResponse(job.result_url)

@app.post("/api/image/batch-process")
async def batch_process_images(
    files: List[UploadFile] = File(...),
    operation: str = "enhance",
    background_tasks: BackgroundTasks = None
):
    """Process multiple images in batch"""
    if len(files) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 files allowed")
    
    batch_id = str(uuid.uuid4())
    job_ids = []
    
    for file in files:
        if not file.content_type.startswith('image/'):
            continue
            
        # Upload file
        file_id = str(uuid.uuid4())
        file_extension = file.filename.split('.')[-1]
        filename = f"{file_id}.{file_extension}"
        file_path = os.path.join("uploads", filename)
        
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Create processing job
        job_id = str(uuid.uuid4())
        jobs[job_id] = ProcessingResult(
            job_id=job_id,
            status="processing",
            created_at=datetime.now().isoformat(),
            metadata={"operation": operation, "batch_id": batch_id}
        )
        
        job_ids.append(job_id)
        
        # Start background processing
        if background_tasks:
            background_tasks.add_task(
                process_image_background, 
                job_id, 
                file_path, 
                operation, 
                {}
            )
    
    return {
        "batch_id": batch_id,
        "job_ids": job_ids,
        "total_files": len(job_ids),
        "status": "processing"
    }

# Background processing functions
async def process_image_background(job_id: str, file_path: str, operation: str, parameters: dict):
    """Background task for image processing"""
    try:
        # Load image
        image = cv2.imread(file_path)
        if image is None:
            jobs[job_id].status = "failed"
            jobs[job_id].metadata["error"] = "Failed to load image"
            return
        
        # Process based on operation
        processed_image = None
        
        if operation == "enhance":
            processed_image = enhance_image(image, parameters)
        elif operation == "blur":
            processed_image = blur_image(image, parameters)
        elif operation == "sharpen":
            processed_image = sharpen_image(image, parameters)
        elif operation == "resize":
            processed_image = resize_image(image, parameters)
        elif operation == "rotate":
            processed_image = rotate_image(image, parameters)
        elif operation == "grayscale":
            processed_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        elif operation == "edge_detection":
            processed_image = detect_edges(image, parameters)
        elif operation == "color_correction":
            processed_image = correct_colors(image, parameters)
        elif operation == "noise_reduction":
            processed_image = reduce_noise(image, parameters)
        else:
            processed_image = image  # No processing
        
        # Save processed image
        output_filename = f"processed_{job_id}.jpg"
        output_path = os.path.join("processed", output_filename)
        cv2.imwrite(output_path, processed_image)
        
        # Update job status
        jobs[job_id].status = "completed"
        jobs[job_id].result_url = output_path
        jobs[job_id].metadata["processed_at"] = datetime.now().isoformat()
        
    except Exception as e:
        jobs[job_id].status = "failed"
        jobs[job_id].metadata["error"] = str(e)

# Image processing functions
def enhance_image(image, parameters):
    """Enhance image brightness, contrast, saturation"""
    brightness = parameters.get("brightness", 1.0)
    contrast = parameters.get("contrast", 1.0)
    
    # Convert to PIL for easier enhancement
    pil_image = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
    
    if brightness != 1.0:
        enhancer = ImageEnhance.Brightness(pil_image)
        pil_image = enhancer.enhance(brightness)
    
    if contrast != 1.0:
        enhancer = ImageEnhance.Contrast(pil_image)
        pil_image = enhancer.enhance(contrast)
    
    # Convert back to OpenCV format
    return cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)

def blur_image(image, parameters):
    """Apply blur effect"""
    kernel_size = parameters.get("kernel_size", 15)
    return cv2.GaussianBlur(image, (kernel_size, kernel_size), 0)

def sharpen_image(image, parameters):
    """Sharpen image"""
    kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
    return cv2.filter2D(image, -1, kernel)

def resize_image(image, parameters):
    """Resize image"""
    width = parameters.get("width", image.shape[1])
    height = parameters.get("height", image.shape[0])
    return cv2.resize(image, (width, height))

def rotate_image(image, parameters):
    """Rotate image"""
    angle = parameters.get("angle", 0)
    height, width = image.shape[:2]
    center = (width // 2, height // 2)
    matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
    return cv2.warpAffine(image, matrix, (width, height))

def detect_edges(image, parameters):
    """Edge detection"""
    threshold1 = parameters.get("threshold1", 100)
    threshold2 = parameters.get("threshold2", 200)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    return cv2.Canny(gray, threshold1, threshold2)

def correct_colors(image, parameters):
    """Color correction"""
    # Simple white balance
    result = cv2.xphoto.createSimpleWB()
    return result.balanceWhite(image)

def reduce_noise(image, parameters):
    """Noise reduction"""
    return cv2.fastNlMeansDenoisingColored(image, None, 10, 10, 7, 21)

# Analysis functions
def detect_faces(image):
    """Detect faces in image"""
    # Load face cascade classifier
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)
    
    face_data = []
    for (x, y, w, h) in faces:
        face_data.append({
            "x": int(x),
            "y": int(y),
            "width": int(w),
            "height": int(h),
            "confidence": 0.8  # Mock confidence
        })
    
    return {
        "count": len(face_data),
        "faces": face_data
    }

def detect_objects(image):
    """Detect objects in image (simplified)"""
    # This is a mock implementation
    # In production, you'd use YOLO, SSD, or other object detection models
    return {
        "count": 3,
        "objects": [
            {"class": "person", "confidence": 0.95, "bbox": [100, 50, 200, 300]},
            {"class": "car", "confidence": 0.87, "bbox": [300, 200, 150, 100]},
            {"class": "tree", "confidence": 0.72, "bbox": [50, 10, 80, 200]}
        ]
    }

def analyze_colors(image):
    """Analyze dominant colors in image"""
    # Convert to RGB
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    pixels = rgb_image.reshape(-1, 3)
    
    # Use k-means to find dominant colors
    from sklearn.cluster import KMeans
    kmeans = KMeans(n_clusters=5, random_state=42)
    kmeans.fit(pixels)
    
    colors = []
    for i, color in enumerate(kmeans.cluster_centers_):
        colors.append({
            "color": [int(c) for c in color],
            "percentage": float(np.sum(kmeans.labels_ == i) / len(kmeans.labels_) * 100)
        })
    
    return {
        "dominant_colors": sorted(colors, key=lambda x: x["percentage"], reverse=True),
        "color_palette": "warm" if colors[0]["color"][0] > 150 else "cool"
    }

def extract_text_simulation(image):
    """Simulate OCR text extraction"""
    # This is a mock implementation
    # In production, you'd use Tesseract OCR or cloud OCR services
    return {
        "text": "This is simulated extracted text from the image.",
        "confidence": 0.85,
        "language": "en",
        "words_count": 8
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)