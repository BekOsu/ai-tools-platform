'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface ProcessingJob {
  job_id: string;
  status: 'processing' | 'completed' | 'failed';
  result_url?: string;
  metadata: any;
}

export default function ImageDemoPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [job, setJob] = useState<ProcessingJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('http://localhost:8000/api/image/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      setFileId(data.file_id);
      setSelectedFile(file);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const processImage = async (operation: string) => {
    if (!fileId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/image/process/${fileId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation,
          parameters: operation === 'enhance' ? { brightness: 1.2, contrast: 1.1 } : {}
        })
      });
      
      const data = await response.json();
      setJob(data);
      
      // Poll for completion
      pollJobStatus(data.job_id);
    } catch (error) {
      console.error('Processing failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeImage = async () => {
    if (!fileId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/image/analyze/${fileId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analyze_faces: true,
          detect_objects: true,
          extract_text: false,
          analyze_colors: true
        })
      });
      
      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const pollJobStatus = async (jobId: string) => {
    const poll = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/image/job/${jobId}`);
        const jobData = await response.json();
        setJob(jobData);
        
        if (jobData.status === 'processing') {
          setTimeout(poll, 2000);
        }
      } catch (error) {
        console.error('Status check failed:', error);
      }
    };
    poll();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI Image Processing Demo
        </h1>
        <p className="text-gray-600">
          Advanced computer vision with face detection, image effects, and analysis
        </p>
      </div>

      {/* File Upload */}
      <Card className="mb-6 p-6">
        <h2 className="text-xl font-semibold mb-4">Upload Image</h2>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="text-gray-600">
              <div className="text-4xl mb-4">📸</div>
              <p className="text-lg font-medium">Click to upload an image</p>
              <p className="text-sm">Supports JPG, PNG, WebP, TIFF</p>
            </div>
          </label>
          
          {selectedFile && (
            <div className="mt-4">
              <p className="text-sm text-green-600">
                ✅ Uploaded: {selectedFile.name}
              </p>
              {fileId && (
                <p className="text-xs text-gray-500">File ID: {fileId}</p>
              )}
            </div>
          )}
        </div>
      </Card>

      {fileId && (
        <>
          {/* Processing Operations */}
          <Card className="mb-6 p-6">
            <h2 className="text-xl font-semibold mb-4">Image Processing</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button onClick={() => processImage('enhance')} disabled={loading}>
                Enhance
              </Button>
              <Button onClick={() => processImage('blur')} disabled={loading} variant="secondary">
                Blur
              </Button>
              <Button onClick={() => processImage('sharpen')} disabled={loading} variant="secondary">
                Sharpen
              </Button>
              <Button onClick={() => processImage('grayscale')} disabled={loading} variant="secondary">
                Grayscale
              </Button>
            </div>
            
            <div className="mt-4">
              <Button onClick={analyzeImage} disabled={loading}>
                Analyze Image
              </Button>
            </div>
          </Card>

          {/* Processing Status */}
          {job && (
            <Card className="mb-6 p-6">
              <h2 className="text-xl font-semibold mb-4">Processing Status</h2>
              <div className="flex items-center gap-4">
                <div className={`w-4 h-4 rounded-full ${
                  job.status === 'completed' ? 'bg-green-500' :
                  job.status === 'processing' ? 'bg-yellow-500 animate-pulse' :
                  'bg-red-500'
                }`} />
                <span className="capitalize font-medium">{job.status}</span>
                <span className="text-sm text-gray-600">Job ID: {job.job_id}</span>
              </div>
              
              {job.status === 'completed' && job.result_url && (
                <div className="mt-4">
                  <Button 
                    onClick={() => window.open(`http://localhost:8000/api/image/download/${job.job_id}`, '_blank')}
                  >
                    Download Processed Image
                  </Button>
                </div>
              )}
            </Card>
          )}

          {/* Analysis Results */}
          {analysis && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div>
                  <h3 className="font-semibold mb-2">Image Information</h3>
                  <div className="space-y-1 text-sm">
                    <p>Dimensions: {analysis.image_info?.width} × {analysis.image_info?.height}</p>
                    <p>Channels: {analysis.image_info?.channels}</p>
                    <p>Size: {analysis.image_info?.size_mb?.toFixed(2)} MB</p>
                  </div>
                </div>

                {/* Face Detection */}
                {analysis.faces && (
                  <div>
                    <h3 className="font-semibold mb-2">Face Detection</h3>
                    <p className="text-sm">
                      Found {analysis.faces.count} face(s)
                    </p>
                    {analysis.faces.faces.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {analysis.faces.faces.map((face: any, index: number) => (
                          <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                            Face {index + 1}: {face.width}×{face.height} (confidence: {(face.confidence * 100).toFixed(1)}%)
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Object Detection */}
                {analysis.objects && (
                  <div>
                    <h3 className="font-semibold mb-2">Object Detection</h3>
                    <p className="text-sm mb-2">
                      Found {analysis.objects.count} object(s)
                    </p>
                    <div className="space-y-1">
                      {analysis.objects.objects.map((obj: any, index: number) => (
                        <div key={index} className="text-xs bg-blue-50 p-2 rounded">
                          {obj.class} (confidence: {(obj.confidence * 100).toFixed(1)}%)
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Analysis */}
                {analysis.colors && (
                  <div>
                    <h3 className="font-semibold mb-2">Color Analysis</h3>
                    <p className="text-sm mb-2">Palette: {analysis.colors.color_palette}</p>
                    <div className="space-y-1">
                      {analysis.colors.dominant_colors.slice(0, 3).map((color: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                          <div 
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: `rgb(${color.color.join(',')})` }}
                          />
                          <span>{color.percentage.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </>
      )}

      {/* Service Features */}
      <Card className="mt-6 p-6">
        <h2 className="text-xl font-semibold mb-4">Service Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-blue-600 text-2xl mb-2">👁️</div>
            <h3 className="font-semibold">Computer Vision</h3>
            <p className="text-sm text-gray-600">Advanced object & face detection</p>
          </div>
          <div className="text-center">
            <div className="text-green-600 text-2xl mb-2">🎨</div>
            <h3 className="font-semibold">Image Effects</h3>
            <p className="text-sm text-gray-600">Enhancement, filters, transformations</p>
          </div>
          <div className="text-center">
            <div className="text-purple-600 text-2xl mb-2">🔍</div>
            <h3 className="font-semibold">Analysis</h3>
            <p className="text-sm text-gray-600">Color analysis, metadata extraction</p>
          </div>
          <div className="text-center">
            <div className="text-orange-600 text-2xl mb-2">⚡</div>
            <h3 className="font-semibold">Batch Processing</h3>
            <p className="text-sm text-gray-600">Multiple image processing</p>
          </div>
        </div>
      </Card>
    </div>
  );
}