'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface AudioJob {
  job_id: string;
  status: 'processing' | 'completed' | 'failed';
  result_path?: string;
  metadata: any;
}

interface AudioAnalysis {
  basic_info: {
    duration: number;
    sample_rate: number;
    channels: number;
    format: string;
  };
  spectrum?: any;
  features?: any;
  speech_detection?: any;
  mood_analysis?: any;
}

export default function AudioDemoPage() {
  const [activeTab, setActiveTab] = useState('tts');
  const [loading, setLoading] = useState(false);
  
  // Text-to-Speech
  const [ttsText, setTtsText] = useState('Hello! Welcome to our AI Audio Synthesis platform. This is a demonstration of our advanced text-to-speech capabilities.');
  const [ttsVoice, setTtsVoice] = useState('default');
  const [ttsSpeed, setTtsSpeed] = useState(1.0);
  const [ttsPitch, setTtsPitch] = useState(1.0);
  const [ttsJob, setTtsJob] = useState<AudioJob | null>(null);

  // Music Generation
  const [musicGenre, setMusicGenre] = useState('ambient');
  const [musicDuration, setMusicDuration] = useState(30);
  const [musicTempo, setMusicTempo] = useState(120);
  const [musicKey, setMusicKey] = useState('C');
  const [musicMood, setMusicMood] = useState('calm');
  const [musicJob, setMusicJob] = useState<AudioJob | null>(null);

  // Audio Upload & Analysis
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);
  const [audioAnalysis, setAudioAnalysis] = useState<AudioAnalysis | null>(null);
  const [effectsJob, setEffectsJob] = useState<AudioJob | null>(null);

  // Text-to-Speech Generation
  const generateSpeech = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/audio/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: ttsText,
          voice: ttsVoice,
          speed: ttsSpeed,
          pitch: ttsPitch,
          language: 'en'
        })
      });
      
      const data = await response.json();
      setTtsJob(data);
      
      if (data.job_id) {
        pollJobStatus(data.job_id, setTtsJob);
      }
    } catch (error) {
      console.error('TTS generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Music Generation
  const generateMusic = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/audio/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          genre: musicGenre,
          duration: musicDuration,
          tempo: musicTempo,
          key: musicKey,
          mood: musicMood
        })
      });
      
      const data = await response.json();
      setMusicJob(data);
      
      if (data.job_id) {
        pollJobStatus(data.job_id, setMusicJob);
      }
    } catch (error) {
      console.error('Music generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Upload Audio File
  const handleAudioUpload = async (file: File) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('http://localhost:8000/api/audio/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      setUploadedFileId(data.file_id);
    } catch (error) {
      console.error('Audio upload failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Analyze Audio
  const analyzeAudio = async () => {
    if (!uploadedFileId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/audio/analyze/${uploadedFileId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analyze_spectrum: true,
          extract_features: true,
          detect_speech: true,
          analyze_mood: true
        })
      });
      
      const data = await response.json();
      setAudioAnalysis(data);
    } catch (error) {
      console.error('Audio analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply Audio Effects
  const applyEffect = async (effectType: string) => {
    if (!uploadedFileId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/audio/apply-effects/${uploadedFileId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          effect_type: effectType,
          parameters: getEffectParameters(effectType)
        })
      });
      
      const data = await response.json();
      setEffectsJob(data);
      
      if (data.job_id) {
        pollJobStatus(data.job_id, setEffectsJob);
      }
    } catch (error) {
      console.error('Audio effects failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get effect parameters
  const getEffectParameters = (effectType: string) => {
    switch (effectType) {
      case 'reverb':
        return { room_size: 0.7, dampening: 0.3 };
      case 'echo':
        return { delay_ms: 300, feedback: 0.4 };
      case 'distortion':
        return { gain: 2.0, threshold: 0.7 };
      default:
        return {};
    }
  };

  // Poll job status
  const pollJobStatus = async (jobId: string, setJob: (job: AudioJob) => void) => {
    const poll = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/audio/job/${jobId}`);
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

  const tabs = [
    { id: 'tts', label: 'Text-to-Speech', icon: '🗣️' },
    { id: 'music', label: 'Music Generation', icon: '🎵' },
    { id: 'analysis', label: 'Audio Analysis', icon: '🔍' },
    { id: 'effects', label: 'Audio Effects', icon: '🎛️' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI Audio Synthesis Demo
        </h1>
        <p className="text-gray-600">
          Text-to-speech, music generation, voice cloning, and audio processing with PyTorch
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Text-to-Speech */}
      {activeTab === 'tts' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Text-to-Speech Generation</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text to Synthesize
                </label>
                <textarea
                  value={ttsText}
                  onChange={(e) => setTtsText(e.target.value)}
                  placeholder="Enter text to convert to speech..."
                  className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Voice
                  </label>
                  <select
                    value={ttsVoice}
                    onChange={(e) => setTtsVoice(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="default">Default</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="robotic">Robotic</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Speed: {ttsSpeed}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={ttsSpeed}
                    onChange={(e) => setTtsSpeed(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pitch: {ttsPitch}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={ttsPitch}
                    onChange={(e) => setTtsPitch(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
              
              <Button onClick={generateSpeech} disabled={loading || !ttsText}>
                {loading ? 'Generating...' : 'Generate Speech'}
              </Button>
            </div>
            
            {ttsJob && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-4 h-4 rounded-full ${
                    ttsJob.status === 'completed' ? 'bg-green-500' :
                    ttsJob.status === 'processing' ? 'bg-yellow-500 animate-pulse' :
                    'bg-red-500'
                  }`} />
                  <span className="capitalize font-medium">{ttsJob.status}</span>
                </div>
                
                {ttsJob.status === 'completed' && (
                  <Button 
                    onClick={() => window.open(`http://localhost:8000/api/audio/download/${ttsJob.job_id}`, '_blank')}
                  >
                    Download Audio
                  </Button>
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Music Generation */}
      {activeTab === 'music' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">AI Music Generation</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Genre
                </label>
                <select
                  value={musicGenre}
                  onChange={(e) => setMusicGenre(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="ambient">Ambient</option>
                  <option value="electronic">Electronic</option>
                  <option value="classical">Classical</option>
                  <option value="jazz">Jazz</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (seconds)
                </label>
                <Input
                  type="number"
                  min="10"
                  max="120"
                  value={musicDuration}
                  onChange={(e) => setMusicDuration(parseInt(e.target.value))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tempo (BPM)
                </label>
                <Input
                  type="number"
                  min="60"
                  max="180"
                  value={musicTempo}
                  onChange={(e) => setMusicTempo(parseInt(e.target.value))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key
                </label>
                <select
                  value={musicKey}
                  onChange={(e) => setMusicKey(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                  <option value="F">F</option>
                  <option value="G">G</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mood
                </label>
                <select
                  value={musicMood}
                  onChange={(e) => setMusicMood(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="calm">Calm</option>
                  <option value="energetic">Energetic</option>
                  <option value="sad">Sad</option>
                  <option value="happy">Happy</option>
                </select>
              </div>
            </div>
            
            <Button onClick={generateMusic} disabled={loading}>
              {loading ? 'Generating Music...' : 'Generate Music'}
            </Button>
            
            {musicJob && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-4 h-4 rounded-full ${
                    musicJob.status === 'completed' ? 'bg-green-500' :
                    musicJob.status === 'processing' ? 'bg-yellow-500 animate-pulse' :
                    'bg-red-500'
                  }`} />
                  <span className="capitalize font-medium">{musicJob.status}</span>
                  <span className="text-sm text-gray-600">Duration: {musicDuration}s</span>
                </div>
                
                {musicJob.status === 'completed' && (
                  <Button 
                    onClick={() => window.open(`http://localhost:8000/api/audio/download/${musicJob.job_id}`, '_blank')}
                  >
                    Download Music
                  </Button>
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Audio Analysis */}
      {activeTab === 'analysis' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Audio Upload & Analysis</h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => e.target.files?.[0] && handleAudioUpload(e.target.files[0])}
                className="hidden"
                id="audio-upload"
              />
              <label htmlFor="audio-upload" className="cursor-pointer">
                <div className="text-gray-600">
                  <div className="text-4xl mb-4">🎵</div>
                  <p className="text-lg font-medium">Click to upload an audio file</p>
                  <p className="text-sm">Supports MP3, WAV, FLAC, M4A</p>
                </div>
              </label>
            </div>
            
            {uploadedFileId && (
              <div className="mb-4">
                <p className="text-sm text-green-600 mb-4">
                  ✅ Audio uploaded successfully! File ID: {uploadedFileId}
                </p>
                <Button onClick={analyzeAudio} disabled={loading}>
                  {loading ? 'Analyzing...' : 'Analyze Audio'}
                </Button>
              </div>
            )}
            
            {audioAnalysis && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Basic Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Audio Information</h3>
                  <div className="space-y-1 text-sm">
                    <p>Duration: {audioAnalysis.basic_info.duration.toFixed(2)}s</p>
                    <p>Sample Rate: {audioAnalysis.basic_info.sample_rate} Hz</p>
                    <p>Channels: {audioAnalysis.basic_info.channels}</p>
                    <p>Format: {audioAnalysis.basic_info.format.toUpperCase()}</p>
                  </div>
                </div>
                
                {/* Speech Detection */}
                {audioAnalysis.speech_detection && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Speech Detection</h3>
                    <div className="space-y-1 text-sm">
                      <p>Speech Detected: {audioAnalysis.speech_detection.speech_detected ? 'Yes' : 'No'}</p>
                      <p>Speech Ratio: {(audioAnalysis.speech_detection.speech_ratio * 100).toFixed(1)}%</p>
                      <p>Total Frames: {audioAnalysis.speech_detection.total_frames}</p>
                    </div>
                  </div>
                )}
                
                {/* Mood Analysis */}
                {audioAnalysis.mood_analysis && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Mood Analysis</h3>
                    <div className="space-y-1 text-sm">
                      <p>Predicted Mood: <span className="font-medium capitalize">{audioAnalysis.mood_analysis.predicted_mood}</span></p>
                      <p>Valence: {audioAnalysis.mood_analysis.valence.toFixed(2)}</p>
                      <p>Arousal: {audioAnalysis.mood_analysis.arousal.toFixed(2)}</p>
                      <p>Confidence: {(audioAnalysis.mood_analysis.confidence * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                )}
                
                {/* Spectrum Analysis */}
                {audioAnalysis.spectrum && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Spectrum Analysis</h3>
                    <div className="space-y-1 text-sm">
                      <p>Spectral Centroid: {audioAnalysis.spectrum.spectral_centroid?.toFixed(2)} Hz</p>
                      <p>Spectral Bandwidth: {audioAnalysis.spectrum.spectral_bandwidth?.toFixed(2)} Hz</p>
                      <p>Spectral Rolloff: {audioAnalysis.spectrum.spectral_rolloff?.toFixed(2)} Hz</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Audio Effects */}
      {activeTab === 'effects' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Audio Effects Processing</h2>
            
            {!uploadedFileId ? (
              <div className="text-center py-8 text-gray-500">
                <p>Please upload an audio file in the Analysis tab first</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button onClick={() => applyEffect('reverb')} disabled={loading} variant="secondary">
                    Add Reverb
                  </Button>
                  <Button onClick={() => applyEffect('echo')} disabled={loading} variant="secondary">
                    Add Echo
                  </Button>
                  <Button onClick={() => applyEffect('distortion')} disabled={loading} variant="secondary">
                    Distortion
                  </Button>
                  <Button onClick={() => applyEffect('normalize')} disabled={loading} variant="secondary">
                    Normalize
                  </Button>
                </div>
                
                {effectsJob && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-4 h-4 rounded-full ${
                        effectsJob.status === 'completed' ? 'bg-green-500' :
                        effectsJob.status === 'processing' ? 'bg-yellow-500 animate-pulse' :
                        'bg-red-500'
                      }`} />
                      <span className="capitalize font-medium">{effectsJob.status}</span>
                      <span className="text-sm text-gray-600">Effect: {effectsJob.metadata.effect}</span>
                    </div>
                    
                    {effectsJob.status === 'completed' && (
                      <Button 
                        onClick={() => window.open(`http://localhost:8000/api/audio/download/${effectsJob.job_id}`, '_blank')}
                      >
                        Download Processed Audio
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Service Features */}
      <Card className="mt-6 p-6">
        <h2 className="text-xl font-semibold mb-4">Service Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-orange-600 text-2xl mb-2">🗣️</div>
            <h3 className="font-semibold">Text-to-Speech</h3>
            <p className="text-sm text-gray-600">Natural voice synthesis</p>
          </div>
          <div className="text-center">
            <div className="text-purple-600 text-2xl mb-2">🎵</div>
            <h3 className="font-semibold">Music Generation</h3>
            <p className="text-sm text-gray-600">AI-composed music tracks</p>
          </div>
          <div className="text-center">
            <div className="text-blue-600 text-2xl mb-2">🔍</div>
            <h3 className="font-semibold">Audio Analysis</h3>
            <p className="text-sm text-gray-600">Speech detection & mood analysis</p>
          </div>
          <div className="text-center">
            <div className="text-green-600 text-2xl mb-2">🎛️</div>
            <h3 className="font-semibold">Audio Effects</h3>
            <p className="text-sm text-gray-600">Professional audio processing</p>
          </div>
        </div>
      </Card>
    </div>
  );
}