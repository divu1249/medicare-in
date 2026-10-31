import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PhoneCall, MapPin, WifiOff, Wifi, AlertTriangle, 
  BookOpen, Share2, Activity, ShieldAlert, HeartPulse 
} from 'lucide-react';
import { Card, PageHeader, Badge, SectionTitle } from '@/components/ui';

// Cached offline data for zero-network environments
const offlineHospitals = [
  { name: 'Max Super Speciality Hospital (Saket)', phone: '011-26515050', type: '24/7 Emergency & Trauma' },
  { name: 'Fortis Memorial Research (Gurugram)', phone: '0124-4962200', type: '24/7 Emergency & Cardiac' },
  { name: 'Medanta - The Medicity', phone: '1068', type: '24/7 Multi-Speciality' },
];

export default function EmergencyAssistance() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'locating' | 'success' | 'error'>('idle');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const shareEmergencyLocation = () => {
    setLocationStatus('locating');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationStatus('success');
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const mapLink = `https://maps.google.com/?q=${lat},${lng}`;
          const text = `EMERGENCY: I need immediate assistance. My exact GPS location is: ${mapLink}`;
          
          // Fallback to WhatsApp intent for mobile sharing
          window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
          setTimeout(() => setLocationStatus('idle'), 3000);
        },
        () => {
          setLocationStatus('error');
          setTimeout(() => setLocationStatus('idle'), 3000);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setLocationStatus('error');
    }
  };

  return (
    <div className="space-y-6 pb-20 sm:pb-6">
      {/* Dynamic Network Status Banner */}
      <div className={`flex items-center justify-between p-3 rounded-xl border ${isOnline ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/30' : 'bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/30'}`}>
        <div className="flex items-center gap-3">
          {isOnline ? (
            <Wifi className="h-5 w-5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
          ) : (
            <WifiOff className="h-5 w-5 text-rose-600 dark:text-rose-400" />
          )}
          <div>
            <h3 className={`text-sm font-bold ${isOnline ? 'text-emerald-800 dark:text-emerald-400' : 'text-rose-800 dark:text-rose-400'}`}>
              {isOnline ? 'Live Network Active' : 'Offline Emergency Mode'}
            </h3>
            <p className={`text-xs ${isOnline ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-600 dark:text-rose-500'}`}>
              {isOnline ? 'Full GPS and AI features available.' : 'Displaying cached local data and offline protocols.'}
            </p>
          </div>
        </div>
      </div>

      <PageHeader 
        title="Emergency SOS" 
        subtitle="Immediate action hub. Tap to dial national services or share your GPS coordinates."
      />

      {/* Primary SOS Actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <a href="tel:112" className="flex items-center justify-between bg-rose-600 hover:bg-rose-700 text-white p-5 rounded-2xl shadow-lg transition-transform active:scale-95">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-wider">Dial 112</h2>
            <p className="text-rose-100 text-sm font-medium mt-1">National Emergency (Police/Fire/Medical)</p>
          </div>
          <div className="h-14 w-14 rounded-full bg-rose-500/50 flex items-center justify-center animate-pulse">
            <PhoneCall className="h-7 w-7 text-white" />
          </div>
        </a>

        <a href="tel:108" className="flex items-center justify-between bg-rose-50 dark:bg-rose-950/30 border-2 border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 p-5 rounded-2xl transition-transform active:scale-95">
          <div>
            <h2 className="text-2xl font-black text-rose-700 dark:text-rose-400 uppercase tracking-wider">Dial 108</h2>
            <p className="text-rose-600 dark:text-rose-500 text-sm font-medium mt-1">Medical Ambulance Network</p>
          </div>
          <div className="h-14 w-14 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center">
            <Activity className="h-7 w-7 text-rose-600 dark:text-rose-400" />
          </div>
        </a>
      </div>

      {/* Utility Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <button 
          onClick={shareEmergencyLocation}
          disabled={!isOnline || locationStatus === 'locating'}
          className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Share2 className={`h-8 w-8 mb-2 ${locationStatus === 'locating' ? 'text-blue-500 animate-spin' : locationStatus === 'error' ? 'text-rose-500' : 'text-blue-600 dark:text-blue-400'}`} />
          <span className="font-bold text-slate-900 dark:text-slate-100">
            {locationStatus === 'locating' ? 'Acquiring GPS...' : locationStatus === 'error' ? 'Location Failed' : 'Share Exact GPS'}
          </span>
          <span className="text-xs text-slate-500 mt-1">Sends coordinates via WhatsApp</span>
        </button>

        <Link to="/emergency-guide" className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-all">
          <BookOpen className="h-8 w-8 mb-2 text-amber-600 dark:text-amber-400" />
          <span className="font-bold text-slate-900 dark:text-slate-100">Offline First-Aid</span>
          <span className="text-xs text-slate-500 mt-1">CPR, Burns, Choking Guide</span>
        </Link>
        
        {/* Live Maps (Online) vs Cached DB (Offline) */}
        {isOnline ? (
          <a 
            href="https://www.google.com/maps/search/24%2F7+emergency+hospitals+near+me" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all sm:col-span-2 lg:col-span-1 text-center"
          >
            <MapPin className="h-8 w-8 mb-2 text-emerald-600 dark:text-emerald-400" />
            <span className="font-bold text-slate-900 dark:text-slate-100">Live Hospital Map</span>
            <span className="text-xs text-slate-500 mt-1">Find 24/7 ERs near you</span>
          </a>
        ) : (
          <div className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/10 opacity-75 sm:col-span-2 lg:col-span-1">
            <WifiOff className="h-8 w-8 mb-2 text-rose-500" />
            <span className="font-bold text-rose-900 dark:text-rose-400">Live Map Disabled</span>
            <span className="text-xs text-rose-600 mt-1">See cached hospitals below</span>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Personal Medical ID */}
        <Card className="border-l-4 border-l-rose-500">
          <SectionTitle className="flex items-center gap-2 mb-4">
            <ShieldAlert className="h-5 w-5 text-rose-600" /> Personal Medical ID
          </SectionTitle>
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="text-sm font-bold text-slate-500">Blood Type</span>
              <span className="text-sm font-extrabold text-rose-600">O Positive (O+)</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="text-sm font-bold text-slate-500">Known Allergies</span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Penicillin, Peanuts</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="text-sm font-bold text-slate-500">Chronic Conditions</span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Type 2 Diabetes</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-sm font-bold text-slate-500">Emergency Contact</span>
              <div className="text-right">
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 block">Rajesh Kumar (Father)</span>
                <a href="tel:+919876543210" className="text-xs font-bold text-blue-600 flex items-center justify-end gap-1 mt-0.5">
                  <PhoneCall className="h-3 w-3" /> Call Now
                </a>
              </div>
            </div>
          </div>
        </Card>

        {/* Offline Fallback Hospital Cache */}
        <Card>
          <SectionTitle className="flex items-center gap-2 mb-4">
            <HeartPulse className="h-5 w-5 text-emerald-600" /> Local 24/7 Trauma Centers
          </SectionTitle>
          {!isOnline && (
            <div className="mb-4 text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg flex items-start gap-2 border border-amber-200 dark:border-amber-900/50">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Showing cached local database due to network outage.
            </div>
          )}
          <div className="space-y-3">
            {offlineHospitals.map((hospital, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{hospital.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{hospital.type}</p>
                </div>
                <a href={`tel:${hospital.phone}`} className="btn bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 py-1.5 px-3 text-xs w-full sm:w-auto flex justify-center gap-2 shadow-sm">
                  <PhoneCall className="h-3.5 w-3.5" /> {hospital.phone}
                </a>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}