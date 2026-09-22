import React, { useRef, useState, useEffect } from 'react';
import { Camera, CameraOff, Loader2, Info, Upload, Image as ImageIcon, Sparkles, RefreshCw } from 'lucide-react';
import { emotionApi } from '../services/api';
import ErrorMessage from './ErrorMessage';

const CameraView = ({ onEmotionDetected, onFaceError }) => {
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' or 'upload' or 'manual'

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const [status, setStatus] = useState('idle'); // idle, starting, active, error
  const [error, setError] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedPreview, setUploadedPreview] = useState(null);
  const [uploadedBlob, setUploadedBlob] = useState(null);

  const [diagnostics, setDiagnostics] = useState({
    apiSupported: 'Unknown',
    permission: 'Unknown',
    cameraState: 'Inactive',
    readyState: 0,
    dimensions: '0 x 0'
  });

  // Update diagnostics
  const updateDiagnostics = async () => {
    const apiSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    let permission = 'Unknown';

    if (navigator.permissions && navigator.permissions.query) {
      try {
        const result = await navigator.permissions.query({ name: 'camera' });
        permission = result.state;
      } catch (e) {
        permission = 'Unsupported';
      }
    }

    setDiagnostics(prev => ({
      ...prev,
      apiSupported: apiSupported ? 'Supported' : 'Not supported',
      permission: permission.charAt(0).toUpperCase() + permission.slice(1),
      cameraState: status === 'active' ? 'Active' : 'Inactive',
      readyState: videoRef.current?.readyState || 0,
      dimensions: videoRef.current
        ? `${videoRef.current.videoWidth} x ${videoRef.current.videoHeight}`
        : '0 x 0'
    }));
  };

  useEffect(() => {
    updateDiagnostics();
    const interval = setInterval(updateDiagnostics, 1500);
    return () => clearInterval(interval);
  }, [status]);

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("CAMERA_NOT_SUPPORTED");
      }

      setStatus('starting');
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;

      if (!videoRef.current) {
        throw new Error("VIDEO_ELEMENT_NOT_FOUND");
      }

      videoRef.current.srcObject = stream;

      await new Promise((resolve, reject) => {
        const v = videoRef.current;
        if (!v) return reject(new Error("VIDEO_ELEMENT_NOT_FOUND"));
        if (v.readyState >= 1) return resolve();
        v.onloadedmetadata = resolve;
        v.onerror = reject;
        setTimeout(() => resolve(), 3000); // gracefully continue
      });

      try {
        await videoRef.current.play();
      } catch (playError) {
        console.warn("Video play error:", playError);
      }

      setStatus('active');
    } catch (err) {
      console.error("Camera error:", err);
      setStatus('error');

      if (err.message === "CAMERA_NOT_SUPPORTED") {
        setError("Your browser does not support camera access.");
      } else if (err.message === "VIDEO_ELEMENT_NOT_FOUND") {
        setError("Video element not found.");
      } else if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError("Camera permission was denied. Try uploading a photo instead or allow camera permissions in your browser.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setError("No camera was found. You can easily upload a photo below instead!");
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        setError("The camera is already being used by another application.");
      } else {
        setError(`Camera access notice: ${err.message || 'Unable to access camera'}. You can still upload a photo below.`);
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStatus('idle');
    setError(null);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleCaptureLive = async () => {
    if (!videoRef.current || status !== 'active') return;

    if (videoRef.current.videoWidth === 0) {
      setError("Camera is not ready yet. Please wait 1-2 seconds.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.90));
      if (!blob) throw new Error("Failed to capture image frame.");

      await processDetectionBlob(blob);
    } catch (err) {
      console.error("Live capture error:", err);
      setError(`Analysis failed: ${err.response?.data?.detail || err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, or WebP).');
      return;
    }

    setError(null);
    setUploadedBlob(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedPreview(event.target?.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeUploadedPhoto = async () => {
    if (!uploadedBlob) {
      setError("Please select a photo to analyze.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    try {
      await processDetectionBlob(uploadedBlob);
    } catch (err) {
      console.error("Uploaded photo analysis error:", err);
      setError(`Analysis failed: ${err.response?.data?.detail || err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const processDetectionBlob = async (blob) => {
    const result = await emotionApi.detect(blob);

    if (result.success && result.emotion) {
      if (onEmotionDetected) onEmotionDetected(result);
    } else {
      if (onFaceError) {
        onFaceError(result);
      } else {
        if (result.faces_count === 0) {
          setError('No face detected in the picture. Ensure clear lighting and facing the camera directly.');
        } else if (result.faces_count > 1) {
          setError('Multiple faces detected. Please ensure only one person is in the frame.');
        } else {
          setError('Could not analyze expression. Please try another photo or angle.');
        }
      }
    }
  };

  // Instant mood testing
  const handleQuickMood = (emotion) => {
    if (onEmotionDetected) {
      onEmotionDetected({
        success: true,
        face_detected: true,
        faces_count: 1,
        emotion: emotion,
        confidence: 0.95
      });
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-3xl mx-auto p-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Facial Expression Detection</h2>
        <p className="text-gray-400">Discover personalized music matching your mood</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-white/5 p-1 rounded-full border border-white/10 gap-1 text-sm font-semibold">
        <button
          onClick={() => { setActiveTab('camera'); setError(null); }}
          className={`flex items-center gap-2 px-5 py-2 rounded-full transition-all ${
            activeTab === 'camera' ? 'bg-brand-accent text-white shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Camera className="w-4 h-4" /> Live Webcam
        </button>
        <button
          onClick={() => { setActiveTab('upload'); stopCamera(); setError(null); }}
          className={`flex items-center gap-2 px-5 py-2 rounded-full transition-all ${
            activeTab === 'upload' ? 'bg-brand-accent text-white shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Upload className="w-4 h-4" /> Upload Photo
        </button>
      </div>

      {/* Tab 1: Live Webcam */}
      {activeTab === 'camera' && (
        <div className="w-full flex flex-col items-center gap-6">
          <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover mirror ${status !== 'active' ? 'hidden' : 'block'}`}
            />

            {status !== 'active' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-4 bg-zinc-950/70 p-6 text-center">
                {status === 'starting' ? (
                  <Loader2 className="w-12 h-12 animate-spin text-brand-accent" />
                ) : (
                  <CameraOff className="w-12 h-12 text-gray-600" />
                )}
                <div>
                  <p className="font-semibold text-gray-300">
                    {status === 'starting' ? 'Initializing camera...' : 'Camera is currently inactive'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm">
                    Click "Start Camera" to enable real-time detection, or switch to "Upload Photo" if your webcam is unavailable.
                  </p>
                </div>
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />

            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-brand-accent animate-spin mx-auto mb-3" />
                  <p className="font-bold text-white text-lg">Analyzing your expression...</p>
                  <p className="text-xs text-gray-400 mt-1">Matching emotional frequencies</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {status !== 'active' ? (
              <button
                onClick={startCamera}
                className="flex items-center gap-2 bg-brand-accent hover:bg-purple-600 text-white px-8 py-3 rounded-full font-bold transition-all active:scale-95 shadow-lg shadow-purple-500/25"
              >
                <Camera className="w-5 h-5" /> Start Camera
              </button>
            ) : (
              <>
                <button
                  onClick={stopCamera}
                  className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-full font-bold transition-all active:scale-95"
                >
                  <CameraOff className="w-5 h-5" /> Stop Camera
                </button>
                <button
                  onClick={handleCaptureLive}
                  disabled={isAnalyzing}
                  className="flex items-center gap-2 bg-white text-brand-dark hover:bg-gray-100 px-8 py-3 rounded-full font-bold transition-all active:scale-95 disabled:opacity-50 shadow-xl"
                >
                  <Sparkles className="w-5 h-5 text-brand-accent" />
                  {isAnalyzing ? 'Analyzing...' : 'Capture & Detect Mood'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Upload Photo */}
      {activeTab === 'upload' && (
        <div className="w-full flex flex-col items-center gap-6">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-video bg-zinc-950/70 rounded-2xl border-2 border-dashed border-white/20 hover:border-brand-accent/60 transition-all flex flex-col items-center justify-center cursor-pointer p-6 text-center overflow-hidden relative group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            {uploadedPreview ? (
              <img
                src={uploadedPreview}
                alt="Preview"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-gray-400">
                <div className="p-4 bg-white/5 rounded-full text-brand-accent group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-10 h-10" />
                </div>
                <div>
                  <p className="font-bold text-white text-base">Click to upload an image of a face</p>
                  <p className="text-xs text-gray-500 mt-1">Supports JPG, PNG, WebP (selfies, portraits)</p>
                </div>
              </div>
            )}

            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-brand-accent animate-spin mx-auto mb-3" />
                  <p className="font-bold text-white text-lg">Analyzing photo...</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-full font-bold transition-all text-sm"
            >
              <Upload className="w-4 h-4" /> {uploadedPreview ? 'Change Photo' : 'Select Photo'}
            </button>
            {uploadedPreview && (
              <button
                onClick={handleAnalyzeUploadedPhoto}
                disabled={isAnalyzing}
                className="flex items-center gap-2 bg-brand-accent hover:bg-purple-600 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg shadow-purple-600/30 text-sm disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" /> {isAnalyzing ? 'Analyzing...' : 'Analyze Expression'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quick Mood Selector Bar */}
      <div className="w-full max-w-xl glass-card p-4 rounded-2xl border border-white/10 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> Or select a mood instantly:
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { id: 'happy', emoji: '😊', label: 'Happy' },
            { id: 'sad', emoji: '😢', label: 'Sad' },
            { id: 'angry', emoji: '😡', label: 'Angry' },
            { id: 'neutral', emoji: '😐', label: 'Neutral' },
            { id: 'surprise', emoji: '😲', label: 'Surprise' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => handleQuickMood(m.id)}
              className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-brand-accent/20 hover:border-brand-accent border border-white/10 text-xs font-medium text-gray-200 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <span>{m.emoji}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="w-full max-w-md">
          <ErrorMessage message={error} />
        </div>
      )}

      {/* Browser Diagnostics Dropdown */}
      <details className="w-full max-w-md text-xs text-gray-500">
        <summary className="cursor-pointer hover:text-gray-400 text-center py-1">
          Diagnostics & Camera Info
        </summary>
        <div className="glass-card p-4 rounded-xl border border-white/5 space-y-1.5 mt-2">
          <div className="flex justify-between">
            <span>Camera API:</span>
            <span className={diagnostics.apiSupported === 'Supported' ? 'text-green-400' : 'text-red-400'}>
              {diagnostics.apiSupported}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Permission:</span>
            <span className="text-gray-300">{diagnostics.permission}</span>
          </div>
          <div className="flex justify-between">
            <span>Stream State:</span>
            <span className="text-gray-300">{diagnostics.cameraState}</span>
          </div>
          <div className="flex justify-between">
            <span>Resolution:</span>
            <span className="text-brand-accent">{diagnostics.dimensions}</span>
          </div>
        </div>
      </details>
    </div>
  );
};

export default CameraView;
