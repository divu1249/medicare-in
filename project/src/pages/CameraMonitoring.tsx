import { useEffect, useRef, useState } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';
import { Camera, AlertCircle, ShieldCheck, Loader2, Activity } from 'lucide-react';
import { Card, PageHeader, SectionTitle } from '@/components/ui';

export default function CameraMonitoring() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [personDetected, setPersonDetected] = useState(false);
  const detectionInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => clearInterval(detectionInterval.current);
  }, []);

  async function startMonitoring() {
    try {
      setIsActive(true);
      setIsModelLoading(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
        };
      }

      // Load AI Model
      const model = await cocoSsd.load();
      setIsModelLoading(false);

      // Run inference loop (running every 500ms for smoother tracking)
      detectionInterval.current = setInterval(async () => {
        if (videoRef.current && canvasRef.current && videoRef.current.readyState === 4) {
          
          // Match canvas dimensions to the actual video feed
          const videoWidth = videoRef.current.videoWidth;
          const videoHeight = videoRef.current.videoHeight;
          canvasRef.current.width = videoWidth;
          canvasRef.current.height = videoHeight;

          const predictions = await model.detect(videoRef.current);
          const ctx = canvasRef.current.getContext('2d');
          
          if (ctx) {
            ctx.clearRect(0, 0, videoWidth, videoHeight);
            
            let hasPerson = false;
            
            predictions.forEach(prediction => {
              // Only track "person" objects with high confidence
              if (prediction.class === 'person' && prediction.score > 0.65) {
                hasPerson = true;
                const [x, y, width, height] = prediction.bbox;
                
                // Draw bounding box
                ctx.strokeStyle = '#f43f5e'; // Rose-500 (Alert Color)
                ctx.lineWidth = 4;
                ctx.strokeRect(x, y, width, height);
                
                // Draw label background
                ctx.fillStyle = '#f43f5e';
                ctx.fillRect(x, y > 30 ? y - 30 : 0, width, 30);
                
                // Draw label text
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 16px Arial';
                ctx.fillText(
                  `PATIENT DETECTED (${Math.round(prediction.score * 100)}%)`, 
                  x + 10, 
                  y > 30 ? y - 10 : 20
                );
              }
            });
            
            setPersonDetected(hasPerson);
          }
        }
      }, 500);
    } catch (err) {
      console.error("Camera access denied or hardware error:", err);
      setIsActive(false);
      setIsModelLoading(false);
    }
  }

  function stopMonitoring() {
    clearInterval(detectionInterval.current);
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
    
    // Clear the canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    
    setIsActive(false);
    setPersonDetected(false);
    setIsModelLoading(false);
  }

  return (
    <div className="space-y-6 pb-20 sm:pb-6">
      <PageHeader 
        title="AI Patient Monitoring" 
        subtitle="Uses on-device TensorFlow.js to detect patient movement securely without cloud uploads." 
      />
      
      <Card className="border-slate-200 dark:border-slate-800">
        <SectionTitle className="mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-emerald-600" /> Live Feed
        </SectionTitle>
        
        {/* Camera Container */}
        <div className="relative overflow-hidden rounded-xl bg-slate-950 aspect-video flex items-center justify-center border-2 border-slate-800 shadow-inner">
          
          {!isActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-900 z-10">
              <Camera className="h-12 w-12 mb-3 opacity-30" />
              <p className="font-semibold tracking-wider uppercase text-sm">Camera Offline</p>
              <p className="text-xs text-slate-500 mt-2 text-center max-w-xs">
                Press Start to initialize local AI models and request camera permissions.
              </p>
            </div>
          )}
          
          {/* Video Feed */}
          <video 
            ref={videoRef} 
            muted 
            playsInline 
            className="absolute inset-0 h-full w-full object-cover" 
          />
          
          {/* AI Bounding Box Overlay */}
          <canvas 
            ref={canvasRef} 
            className="absolute inset-0 h-full w-full object-cover z-10 pointer-events-none" 
          />

          {/* HUD Overlay */}
          {isActive && (
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
              <div className="px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-md text-white text-xs font-bold flex items-center gap-2 border border-white/10 shadow-lg">
                {isModelLoading ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" /> Loading TensorFlow...</>
                ) : (
                  <><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Edge AI Active</>
                )}
              </div>
              
              {!isModelLoading && personDetected && (
                <div className="px-3 py-1.5 rounded-lg bg-rose-600/90 backdrop-blur-md text-white text-xs font-bold flex items-center gap-2 animate-pulse border border-rose-400/30 shadow-lg shadow-rose-900/50">
                  <AlertCircle className="h-3.5 w-3.5" /> Movement Detected
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-xs text-slate-500 font-medium">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold mr-1">Privacy First:</span> 
            Video is processed locally on your device. No data is sent to the cloud.
          </div>
          
          {isActive ? (
            <button 
              onClick={stopMonitoring} 
              className="w-full sm:w-auto px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-all shadow-sm flex justify-center items-center gap-2 active:scale-95"
            >
              Stop Monitoring
            </button>
          ) : (
            <button 
              onClick={startMonitoring} 
              className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-sm flex justify-center items-center gap-2 active:scale-95"
            >
              Start Edge AI
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}