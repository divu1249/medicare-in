import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera, CameraOff, Play, Square, Video, VideoOff, AlertCircle,
  CheckCircle2, XCircle, Hand, Activity, Info, ShieldCheck, RefreshCw,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card, PageHeader, Badge, EmptyState, SectionTitle } from '@/components/ui';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import {
  ensureTodayDoses, getTodayDoses, formatTime, todayISO,
} from '@/lib/medUtils';
import type { DoseRecord, MonitoringStatus } from '@/types';

type CamState = 'idle' | 'requesting' | 'active' | 'denied' | 'error';

export default function CameraMonitoring() {
  const { medications, doses, updateDose, settings, updateSettings } = useData();
  const notify = useToast();
  const allDoses = ensureTodayDoses(doses, medications);
  const todayDoses = getTodayDoses(allDoses, medications);
  const eligibleDoses = todayDoses.filter((d) => d.status === 'scheduled');

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const motionCanvasRef = useRef<HTMLCanvasElement>(null);
  const motionTimerRef = useRef<number | null>(null);
  const prevFrameRef = useRef<ImageData | null>(null);

  const [camState, setCamState] = useState<CamState>('idle');
  const [activeDoseId, setActiveDoseId] = useState<string | null>(null);
  const [monitoringStatus, setMonitoringStatus] = useState<MonitoringStatus>('scheduled');
  const [showConfirm, setShowConfirm] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [motionScore, setMotionScore] = useState(0);

  const activeDose = todayDoses.find((d) => d.id === activeDoseId);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    if (motionTimerRef.current) {
      clearInterval(motionTimerRef.current);
      motionTimerRef.current = null;
    }
    prevFrameRef.current = null;
    setCamState('idle');
    setMonitoringStatus('scheduled');
    setMotionScore(0);
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  async function startCamera() {
    setCamState('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCamState('active');
      setDemoMode(false);
      notify('Camera started. Monitoring is ready.', 'success');
    } catch (err) {
      const e = err as Error;
      if (e.name === 'NotAllowedError') {
        setCamState('denied');
        notify('Camera permission denied. Use Demo Mode or manual tracking.', 'warning');
      } else {
        setCamState('error');
        notify('Camera could not be started. ' + e.message, 'error');
      }
    }
  }

  function startMonitoring(doseId: string) {
    if (demoMode || camState !== 'active') {
      setDemoMode(true);
      setActiveDoseId(doseId);
      setMonitoringStatus('monitoring');
      notify('Demonstration Mode active. This simulates motion detection.', 'info');
      runDemoSimulation();
      return;
    }
    setActiveDoseId(doseId);
    setMonitoringStatus('monitoring');
    updateDose(doseId, { monitoringStatus: 'monitoring' });
    startMotionDetection(doseId);
  }

  function startMotionDetection(doseId: string) {
    setMonitoringStatus('waiting');
    updateDose(doseId, { monitoringStatus: 'waiting' });
    if (motionTimerRef.current) clearInterval(motionTimerRef.current);

    motionTimerRef.current = window.setInterval(() => {
      const video = videoRef.current;
      const canvas = motionCanvasRef.current;
      if (!video || !canvas || video.readyState !== 4) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = 160;
      canvas.height = 120;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const current = ctx.getImageData(0, 0, canvas.width, canvas.height);

      if (prevFrameRef.current) {
        let diff = 0;
        const data = current.data;
        const prev = prevFrameRef.current.data;
        for (let i = 0; i < data.length; i += 4) {
          diff += Math.abs(data[i] - prev[i]) + Math.abs(data[i + 1] - prev[i + 1]) + Math.abs(data[i + 2] - prev[i + 2]);
        }
        const normalized = diff / (data.length / 4) / 765;
        setMotionScore(normalized);
        if (normalized > 0.06 && monitoringStatus === 'waiting') {
          setMonitoringStatus('movement_detected');
          updateDose(doseId, { monitoringStatus: 'movement_detected' });
          setShowConfirm(true);
          if (motionTimerRef.current) clearInterval(motionTimerRef.current);
        }
      }
      prevFrameRef.current = current;
    }, 500);
  }

  function runDemoSimulation() {
    setMonitoringStatus('waiting');
    setTimeout(() => {
      setMonitoringStatus('movement_detected');
      if (activeDoseId) updateDose(activeDoseId, { monitoringStatus: 'movement_detected' });
      setShowConfirm(true);
    }, 3500);
  }

  function confirmTaken() {
    if (activeDoseId) {
      updateDose(activeDoseId, { status: 'taken', monitoringStatus: 'confirmed', source: demoMode ? 'simulated' : 'camera', confirmedAt: new Date().toISOString() });
      notify('Dose confirmed as taken.', 'success');
    }
    setShowConfirm(false);
    setActiveDoseId(null);
    setMonitoringStatus('scheduled');
  }

  function confirmNotTaken() {
    if (activeDoseId) {
      updateDose(activeDoseId, { status: 'not_confirmed', monitoringStatus: 'not_confirmed', source: demoMode ? 'simulated' : 'camera' });
      notify('Dose marked as not taken. No dose doubling is advised.', 'info');
    }
    setShowConfirm(false);
    setActiveDoseId(null);
    setMonitoringStatus('scheduled');
  }

  const monitoringSessions = allDoses.filter((d) => d.source === 'camera' || d.source === 'simulated' || d.monitoringStatus !== 'scheduled').slice(-8).reverse();

  const statusInfo: Record<MonitoringStatus, { label: string; color: string }> = {
    scheduled: { label: 'Scheduled', color: 'text-gray-500' },
    monitoring: { label: 'Monitoring in Progress', color: 'text-secondary-500' },
    waiting: { label: 'Waiting for Movement', color: 'text-warning-500' },
    movement_detected: { label: 'Movement Detected', color: 'text-primary-500' },
    review: { label: 'Review Required', color: 'text-warning-500' },
    confirmed: { label: 'Patient Confirmed', color: 'text-success-500' },
    not_confirmed: { label: 'Not Confirmed', color: 'text-warning-500' },
    missed: { label: 'Missed Dose', color: 'text-error-500' },
  };

  return (
    <div>
      <PageHeader
        title="Camera-Assisted Dose Monitoring"
        subtitle="Detects possible medication-taking movement. Movement is never proof of ingestion — your confirmation is always required."
      />

      {/* Safety notices */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <div className="flex items-start gap-2 rounded-xl bg-secondary-50 p-3 text-xs text-secondary-700 dark:bg-secondary-700/10 dark:text-secondary-400">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Camera frames are processed locally in your browser. No video is recorded, uploaded, or retained. Camera stops automatically when you leave this page.</p>
        </div>
        <div className="flex items-start gap-2 rounded-xl bg-warning-50 p-3 text-xs text-warning-700 dark:bg-warning-700/10 dark:text-warning-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Motion detection cannot prove a medicine was swallowed. Lighting, camera angle, and other movements can affect accuracy. Always confirm manually.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Camera preview */}
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <SectionTitle>Camera Preview</SectionTitle>
            {camState === 'active' && (
              <Badge variant="error"><span className="h-2 w-2 animate-pulse rounded-full bg-error-500" /> Camera Active</Badge>
            )}
          </div>
          <div className="relative overflow-hidden rounded-xl bg-black aspect-video">
            <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
            <canvas ref={motionCanvasRef} className="hidden" />
            {camState !== 'active' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                <VideoOff className="h-12 w-12" />
                <p className="mt-2 text-sm">Camera is off</p>
              </div>
            )}
            {camState === 'active' && monitoringStatus !== 'scheduled' && (
              <div className="absolute bottom-3 left-3 rounded-lg bg-black/60 px-3 py-1.5 text-xs text-white">
                <Activity className="mr-1 inline h-3 w-3" />
                {statusInfo[monitoringStatus].label} {motionScore > 0 && `• Motion: ${(motionScore * 100).toFixed(1)}%`}
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {camState === 'idle' || camState === 'denied' || camState === 'error' ? (
              <button onClick={startCamera} className="btn btn-primary">
                <Camera className="h-4 w-4" /> Request Camera Permission
              </button>
            ) : (
              <button onClick={stopCamera} className="btn btn-danger">
                <CameraOff className="h-4 w-4" /> Stop Camera
              </button>
            )}
            <button onClick={() => { setDemoMode(true); setCamState('idle'); notify('Demonstration Mode enabled.', 'info'); }} className={`btn ${demoMode ? 'btn-secondary' : 'btn-outline'}`}>
              <Play className="h-4 w-4" /> Demo Mode
            </button>
          </div>

          {camState === 'denied' && (
            <div className="mt-3 rounded-xl bg-error-50 p-3 text-sm text-error-700 dark:bg-error-700/10 dark:text-error-400">
              Camera permission was denied. You can use Demonstration Mode or manual dose tracking instead.
            </div>
          )}
          {camState === 'error' && (
            <div className="mt-3 rounded-xl bg-error-50 p-3 text-sm text-error-700 dark:bg-error-700/10 dark:text-error-400">
              Camera is not available on this device or browser. Use Demo Mode or manual tracking.
            </div>
          )}
          {demoMode && (
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-secondary-50 p-3 text-xs text-secondary-700 dark:bg-secondary-700/10 dark:text-secondary-400">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              Demonstration Mode is active. Results are simulated for demonstration — no real camera analysis is occurring.
            </div>
          )}
        </Card>

        {/* Eligible doses */}
        <Card>
          <SectionTitle className="mb-3">Eligible Scheduled Doses</SectionTitle>
          {eligibleDoses.length === 0 ? (
            <EmptyState icon={<CheckCircle2 className="h-8 w-8" />} title="No eligible doses" message="All today's doses are already confirmed or there are no scheduled doses." />
          ) : (
            <div className="space-y-2">
              {eligibleDoses.map((dose) => (
                <div key={dose.id} className="flex items-center justify-between rounded-xl border border-gray-100 p-3 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-700/20 dark:text-primary-400">
                      <Hand className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{dose.medicationName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{dose.dosage} • {formatTime(dose.scheduledTime)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => startMonitoring(dose.id)}
                    disabled={camState === 'requesting'}
                    className="btn btn-primary btn-sm"
                  >
                    <Play className="h-3 w-3" /> Start
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4">
            <label className="label">Monitoring Window (minutes)</label>
            <input type="number" min={1} max={60} className="input w-32" value={settings.monitoringWindowMinutes} onChange={(e) => updateSettings({ monitoringWindowMinutes: parseInt(e.target.value) || 10 })} />
          </div>
        </Card>
      </div>

      {/* Monitoring history */}
      <Card className="mt-6">
        <SectionTitle className="mb-3">Camera Monitoring History</SectionTitle>
        {monitoringSessions.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No monitoring sessions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs text-gray-500 dark:border-slate-700">
                  <th className="pb-2 pr-4 font-medium">Date</th>
                  <th className="pb-2 pr-4 font-medium">Medicine</th>
                  <th className="pb-2 pr-4 font-medium">Monitoring</th>
                  <th className="pb-2 pr-4 font-medium">Confirmation</th>
                  <th className="pb-2 font-medium">Source</th>
                </tr>
              </thead>
              <tbody>
                {monitoringSessions.map((d: DoseRecord) => (
                  <tr key={d.id} className="border-b border-gray-100 dark:border-slate-800">
                    <td className="py-2 pr-4 text-gray-600 dark:text-gray-400">{d.scheduledDate}</td>
                    <td className="py-2 pr-4 text-gray-900 dark:text-white">{d.medicationName}</td>
                    <td className="py-2 pr-4"><span className={statusInfo[d.monitoringStatus].color}>{statusInfo[d.monitoringStatus].label}</span></td>
                    <td className="py-2 pr-4">{d.status.replace('_', ' ')}</td>
                    <td className="py-2"><Badge variant={d.source === 'camera' ? 'primary' : d.source === 'simulated' ? 'info' : 'neutral'}>{d.source}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Confirmation dialog */}
      <Modal open={showConfirm} onClose={() => setShowConfirm(false)} title="Possible Medication Intake Detected" size="md"
        footer={<>
          <button onClick={() => setShowConfirm(false)} className="btn btn-outline">Review Later</button>
          <button onClick={confirmNotTaken} className="btn btn-ghost"><XCircle className="h-4 w-4" /> Not Taken</button>
          <button onClick={confirmTaken} className="btn btn-primary"><CheckCircle2 className="h-4 w-4" /> Confirm Taken</button>
        </>}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl bg-primary-50 p-4 dark:bg-primary-700/10">
            <Hand className="h-8 w-8 text-primary-500" />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Possible Medication Intake Detected</p>
              {activeDose && <p className="text-sm text-gray-600 dark:text-gray-400">{activeDose.medicationName} • {activeDose.dosage} • {formatTime(activeDose.scheduledTime)}</p>}
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Movement was detected during the monitoring window. This does not prove the medicine was taken. Please confirm whether you took this dose.
          </p>
          <div className="rounded-xl bg-warning-50 p-3 text-xs text-warning-700 dark:bg-warning-700/10 dark:text-warning-400">
            <AlertCircle className="mb-1 inline h-4 w-4" /> Do not double a dose if you are unsure. Contact your doctor if you missed a dose.
          </div>
        </div>
      </Modal>
    </div>
  );
}