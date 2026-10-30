import { useEffect, useRef, useState } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';
import { Camera, AlertCircle, ShieldCheck, Loader2 } from 'lucide-react';
import { Card, PageHeader } from '@/components/ui';

export default function CameraMonitoring() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [personDetected, setPersonDetected] = useState(false);
  const detectionInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => clearInterval(detectionInterval.current);
  }, []);

  async function startMonitoring() {
    try {
      setIsActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Load AI Model
      const model = await cocoSsd.load();
      setIsModelLoading(false);

      // Run inference loop
      detectionInterval.current = setInterval(async () => {
        if (videoRef.current && videoRef.current.readyState === 4) {
          const predictions = await model.detect(videoRef.current);
          const hasPerson = predictions.some(p => p.class === 'person' && p.score > 0.65);
          
          setPersonDetected(hasPerson);
          
          if (hasPerson) {
            // Native device alarm trigger goes here
            console.log("AI Confirmed: Patient Present.");
          }
        }
      }, 1000);
    } catch (err) {
      console.error("Camera access denied", err);
      setIsActive(false);
    }
  }

  function stopMonitoring() {
    clearInterval(detectionInterval.current);
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
    setIsActive(false);
    setPersonDetected(false);
    setIsModelLoading(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="AI Patient Monitoring" subtitle="Uses on-device TensorFlow.js to detect patient presence securely." />
      
      <Card>
        <div className="relative overflow-hidden rounded-2xl bg-slate-950 aspect-video flex items-center justify-center">
          {!isActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-900 z-10">
              <Camera className="h-12 w-12 mb-3 opacity-50" />
              <p className="font-semibold">Camera Inactive</p>
            </div>
          )}
          
          <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />

          {/* AI Status Overlay */}
          {isActive && (
            <div className="absolute top-4 left-4 z-20 flex gap-2">
              <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold flex items-center gap-2 border border-white/10">
                {isModelLoading ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" /> Loading TensorFlow...</>
                ) : (
                  <><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> AI Active</>
                )}
              </div>
              {!isModelLoading && personDetected && (
                <div className="px-3 py-1.5 rounded-full bg-rose-600/90 backdrop-blur-md text-white text-xs font-bold flex items-center gap-2 animate-pulse border border-rose-400/30">
                  <AlertCircle className="h-3.5 w-3.5" /> Patient Detected
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          {isActive ? (
            <button onClick={stopMonitoring} className="btn btn-danger w-full sm:w-auto">Stop AI Monitoring</button>
          ) : (
            <button onClick={startMonitoring} className="btn btn-primary w-full sm:w-auto">Start AI Monitoring</button>
          )}
        </div>
      </Card>
    </div>
  );
}