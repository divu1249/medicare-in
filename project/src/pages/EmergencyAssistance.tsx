import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Siren, Phone, Copy, Download, Printer, MapPin, Hospital, AlertTriangle, ShieldCheck, Heart, Activity, Info, BookOpen, ExternalLink, Search, Crosshair, Navigation } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card, PageHeader, Badge, SectionTitle } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { generateEmergencyPDF } from '@/lib/pdf';
import MapModal from '@/components/ui/MapModal';

const officialIndiaHelplines = [
  { number: '112', title: 'National Emergency Number (ERSS)', authority: 'Ministry of Home Affairs', scope: 'Police, Fire & Rescue' },
  { number: '108', title: 'Emergency Ambulance', authority: 'National Health Mission', scope: 'Critical Care & Trauma' },
  { number: '102', title: 'Maternal Ambulance', authority: 'National Health Mission', scope: 'Pregnant Women & Infant' },
  { number: '1800116117', display: '1800-11-6117', title: 'Poisons Information Centre', authority: 'AIIMS New Delhi', scope: 'Poisoning & Overdose' },
];

const discoveryCategories = [
  { id: 'hospital', label: '24x7 Emergency Hospitals', query: 'emergency hospital' },
  { id: 'pharmacy', label: 'Jan Aushadhi & Pharmacies', query: 'Jan Aushadhi Kendra pharmacy' },
  { id: 'clinic', label: 'Primary Health Centre', query: 'Primary Health Centre clinic' },
  { id: 'vet', label: 'Veterinary Emergency', query: 'veterinary hospital clinic' },
];

export default function EmergencyAssistance() {
  const { profile, medications } = useData();
  const notify = useToast();
  const [locationContext, setLocationContext] = useState('New Delhi');
  const [activeMapCategory, setActiveMapCategory] = useState<{ title: string; query: string } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  function detectGPS() {
    if (!navigator.geolocation) {
      notify('Geolocation not supported.', 'error');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationContext(`${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)}`);
        setGpsLoading(false);
        notify('GPS acquired successfully', 'success');
      },
      () => {
        setGpsLoading(false);
        notify('Unable to retrieve exact GPS. Using region fallback.', 'warning');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  }

  return (
    <div className="space-y-6 pb-20 sm:pb-6">
      <PageHeader
        title="Emergency & Map Discovery"
        subtitle="Fast access to official Indian helplines, your emergency card, and live facility maps."
      />

      {/* Mobile-Optimized Emergency Alert */}
      <div className="rounded-2xl bg-rose-600 p-5 sm:p-6 text-white shadow-lg dark:bg-rose-950/80 border border-rose-500/30">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start sm:items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
              <Siren className="h-7 w-7 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight">Medical Emergency (India)? Dial 112 or 108.</h2>
              <p className="text-xs sm:text-sm text-rose-100 mt-1">Tapping opens your device dialer. Verify before calling.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 shrink-0 w-full sm:w-auto">
            <a href="tel:112" className="btn bg-white hover:bg-rose-50 text-rose-700 font-extrabold w-full sm:w-auto py-3 sm:py-2.5">
              <Phone className="h-4 w-4 mr-2" /> Dial 112
            </a>
            <a href="tel:108" className="btn bg-rose-800 hover:bg-rose-900 text-white font-extrabold w-full sm:w-auto py-3 sm:py-2.5">
              <Phone className="h-4 w-4 mr-2" /> Dial 108
            </a>
          </div>
        </div>
      </div>

      {/* Geolocation Widget (Mobile Stacked) */}
      <Card>
        <div className="flex flex-col gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <Navigation className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <SectionTitle>Live Map Discovery</SectionTitle>
              <p className="text-xs text-slate-500">
                Region: <span className="font-bold text-emerald-600">{locationContext}</span>
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button onClick={detectGPS} disabled={gpsLoading} className="btn bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 flex justify-center gap-1.5">
              <Crosshair className="h-4 w-4" /> {gpsLoading ? 'Detecting...' : 'Detect GPS'}
            </button>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 sm:top-2.5 h-4 w-4 text-slate-400" />
              <input
                className="input pl-9 text-xs py-2.5"
                value={locationContext}
                onChange={(e) => setLocationContext(e.target.value)}
                placeholder="City or Area (e.g., Gurugram)"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {discoveryCategories.map((cat) => (
            <button key={cat.id} onClick={() => setActiveMapCategory({ title: cat.label, query: cat.query })} className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-left hover:border-emerald-400 hover:bg-emerald-50/40 dark:hover:bg-slate-800/80 group transition-all">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600">{cat.label}</p>
                <p className="text-[11px] text-emerald-600 flex items-center gap-1 mt-0.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Open Live Map</p>
              </div>
              <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 shrink-0" />
            </button>
          ))}
        </div>
      </Card>

      {/* Helplines Grid */}
      <Card>
        <SectionTitle className="mb-4">Official Helplines</SectionTitle>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {officialIndiaHelplines.map((h) => (
            <div key={h.number} className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-extrabold text-rose-600">{h.display || h.number}</span>
                  <Badge variant="success">India</Badge>
                </div>
                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">{h.title}</p>
                <p className="text-xs text-slate-500 mt-1">{h.scope}</p>
              </div>
              <a href={`tel:${h.number}`} className="mt-4 btn border border-slate-300 dark:border-slate-700 bg-white text-xs font-semibold py-2.5 flex justify-center text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <Phone className="h-3.5 w-3.5 text-rose-500 mr-2" /> Open Dialer
              </a>
            </div>
          ))}
        </div>
      </Card>

      {/* Map Modal */}
      {activeMapCategory && (
        <MapModal
          open={Boolean(activeMapCategory)}
          onClose={() => setActiveMapCategory(null)}
          categoryTitle={activeMapCategory.title}
          locationContext={locationContext}
        />
      )}
    </div>
  );
}