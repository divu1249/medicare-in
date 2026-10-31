import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Siren, Phone, Copy, Download, Printer, Search, Crosshair, Navigation, ExternalLink, Info,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card, PageHeader, Badge, SectionTitle } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { generateEmergencyPDF } from '@/lib/pdf';
import MapModal from '@/components/ui/MapModal';

// NOTE (SAFE-9): these numbers are static text and have NOT been through a review process yet.
// Numbers and ambulance services differ by state - keep the "verify" notice visible.
const officialIndiaHelplines = [
  { number: '112', title: 'National Emergency Number (ERSS)', scope: 'Police, Fire & Rescue' },
  { number: '108', title: 'Emergency Ambulance', scope: 'Critical care & trauma (varies by state)' },
  { number: '102', title: 'Ambulance / patient transport', scope: 'Service varies by state' },
  { number: '1800116117', display: '1800-11-6117', title: 'Poisons Information Centre', scope: 'Poisoning & overdose' },
];

const discoveryCategories = [
  { id: 'hospital', label: '24x7 Emergency Hospitals', query: 'emergency hospital' },
  { id: 'pharmacy', label: 'Jan Aushadhi & Pharmacies', query: 'Jan Aushadhi Kendra pharmacy' },
  { id: 'clinic', label: 'Primary Health Centre', query: 'Primary Health Centre clinic' },
  { id: 'vet', label: 'Veterinary Emergency', query: 'veterinary hospital clinic' },
];

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 py-2 text-sm last:border-0 dark:border-slate-800">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-right font-medium text-slate-900 dark:text-slate-100">{value || 'Not provided'}</span>
    </div>
  );
}

export default function EmergencyAssistance() {
  const { profile, medications } = useData();
  const notify = useToast();
  const [locationContext, setLocationContext] = useState('New Delhi');
  const [activeMapCategory, setActiveMapCategory] = useState<{ title: string; query: string } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  const medLine = (m: (typeof medications)[number]) => `${m.name} ${m.dosage} ${m.unit}`;

  function detectGPS() {
    if (!navigator.geolocation) {
      notify('Geolocation is not supported on this device. Type your city or area instead.', 'error');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationContext(`${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)}`);
        setGpsLoading(false);
        notify('Location detected.', 'success');
      },
      () => {
        setGpsLoading(false);
        notify('Could not get your location. Type your city or area instead.', 'warning');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  }

  function copyDetails() {
    const lines = [
      `Name: ${profile.fullName || 'Not provided'}`,
      `Blood Group: ${profile.bloodGroup || 'Not provided'}`,
      `Allergies: ${profile.allergies.join(', ') || 'Not provided'}`,
      `Conditions: ${profile.conditions.join(', ') || 'Not provided'}`,
      `Medications (user-entered): ${medications.map(medLine).join(', ') || 'Not provided'}`,
      `Emergency Contacts: ${profile.emergencyContacts.map((c) => `${c.name} (${c.phone})`).join(', ') || 'Not provided'}`,
    ];
    navigator.clipboard.writeText(lines.join('\n')).then(
      () => notify('Emergency details copied.', 'success'),
      () => notify('Could not copy. Please copy manually.', 'error')
    );
  }

  function downloadPDF() {
    try {
      generateEmergencyPDF(profile, medications).save('mediguard-emergency-card.pdf');
    } catch {
      notify('Could not create the PDF. Try Print instead.', 'error');
    }
  }

  return (
    <div className="space-y-6 pb-20 sm:pb-6">
      <PageHeader
        title="Emergency & Map Discovery"
        subtitle="Helplines, your emergency card and nearby facility maps."
      />

      {/* Emergency banner - works offline (static, no network needed) */}
      <div className="rounded-2xl border border-rose-500/30 bg-rose-600 p-5 text-white shadow-lg dark:bg-rose-950/80 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4 sm:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <Siren className="h-7 w-7 motion-safe:animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight">Medical emergency in India? Dial 112 or 108.</h2>
              <p className="mt-1 text-xs text-rose-100 sm:text-sm">
                Tapping opens your phone's dialer. MediGuard does not contact emergency services for you.
              </p>
            </div>
          </div>
          <div className="flex w-full shrink-0 flex-col gap-2.5 sm:w-auto sm:flex-row">
            <a href="tel:112" className="btn w-full bg-white py-3 font-extrabold text-rose-700 hover:bg-rose-50 sm:w-auto sm:py-2.5">
              <Phone className="mr-2 h-4 w-4" /> Dial 112
            </a>
            <a href="tel:108" className="btn w-full bg-rose-800 py-3 font-extrabold text-white hover:bg-rose-900 sm:w-auto sm:py-2.5">
              <Phone className="mr-2 h-4 w-4" /> Dial 108
            </a>
          </div>
        </div>
      </div>

      {/* Helplines */}
      <Card>
        <SectionTitle className="mb-1">Helplines</SectionTitle>
        <p className="mb-4 flex items-start gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Numbers and services can differ by state. These entries have not yet been independently reviewed - confirm locally.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {officialIndiaHelplines.map((h) => (
            <div key={h.number} className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-extrabold text-rose-600">{h.display || h.number}</span>
                  <Badge variant="neutral">India</Badge>
                </div>
                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">{h.title}</p>
                <p className="mt-1 text-xs text-slate-500">{h.scope}</p>
              </div>
              <a href={`tel:${h.number}`} className="btn mt-4 flex justify-center border border-slate-300 bg-white py-2.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <Phone className="mr-2 h-3.5 w-3.5 text-rose-500" /> Open dialer
              </a>
            </div>
          ))}
        </div>
      </Card>

      {/* Emergency card + contacts (offline-capable: local data) */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <SectionTitle>My emergency card</SectionTitle>
            <div className="no-print flex gap-2">
              <button onClick={copyDetails} className="btn btn-outline btn-sm"><Copy className="mr-1.5 h-3.5 w-3.5" /> Copy</button>
              <button onClick={downloadPDF} className="btn btn-outline btn-sm"><Download className="mr-1.5 h-3.5 w-3.5" /> PDF</button>
              <button onClick={() => window.print()} className="btn btn-outline btn-sm"><Printer className="mr-1.5 h-3.5 w-3.5" /> Print</button>
            </div>
          </div>
          <InfoRow label="Name" value={profile.fullName} />
          <InfoRow label="Blood group" value={profile.bloodGroup} />
          <InfoRow label="Allergies" value={profile.allergies.join(', ')} />
          <InfoRow label="Conditions" value={profile.conditions.join(', ')} />
          <InfoRow label="Medical alerts" value={profile.medicalAlerts.join('; ')} />
          <div className="mt-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Medications (user-entered)</p>
            {medications.length === 0 ? (
              <p className="text-sm text-slate-500">None added.</p>
            ) : (
              <ul className="list-disc pl-5 text-sm text-slate-800 dark:text-slate-200">
                {medications.map((m) => <li key={m.id}>{medLine(m)}</li>)}
              </ul>
            )}
          </div>
          <p className="mt-3 text-[11px] text-slate-500">Information is entered by you and has not been verified by a clinician.</p>
        </Card>

        <Card>
          <SectionTitle className="mb-3">Emergency contacts</SectionTitle>
          {profile.emergencyContacts.length === 0 ? (
            <p className="text-sm text-slate-500">
              No contacts yet. <Link to="/profile" className="font-semibold text-emerald-600 hover:underline">Add contacts in your profile</Link>.
            </p>
          ) : (
            <ul className="space-y-2">
              {profile.emergencyContacts.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{c.name}</p>
                    <p className="truncate text-xs text-slate-500">{c.relationship} · {c.phone}</p>
                  </div>
                  <a href={`tel:${c.phone.replace(/[^\d+]/g, '')}`} className="btn btn-primary btn-sm shrink-0" aria-label={`Call ${c.name}`}>
                    <Phone className="mr-1.5 h-3.5 w-3.5" /> Call
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Facility maps (online only) */}
      <Card className="no-print">
        <div className="mb-4 flex flex-col gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <Navigation className="h-5 w-5" />
            </div>
            <div>
              <SectionTitle>Nearby facilities</SectionTitle>
              <p className="text-xs text-slate-500">
                Searching near: <span className="font-bold text-emerald-600">{locationContext || '—'}</span> · requires internet
              </p>
            </div>
          </div>
          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            <button onClick={detectGPS} disabled={gpsLoading} className="btn btn-primary flex justify-center gap-1.5 py-2.5 text-xs">
              <Crosshair className="h-4 w-4" /> {gpsLoading ? 'Detecting...' : 'Use my location'}
            </button>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400 sm:top-2.5" />
              <input
                className="input py-2.5 pl-9 text-xs"
                value={locationContext}
                onChange={(e) => setLocationContext(e.target.value)}
                placeholder="City or area (e.g., Gurugram)"
                aria-label="City or area to search near"
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {discoveryCategories.map((cat) => (
            <button
              key={cat.id}
              disabled={!locationContext.trim()}
              onClick={() => setActiveMapCategory({ title: cat.label, query: cat.query })}
              className="group flex items-center justify-between rounded-xl border border-slate-200 p-4 text-left transition-all hover:border-emerald-400 hover:bg-emerald-50/40 disabled:opacity-50 dark:border-slate-800 dark:hover:bg-slate-800/80"
            >
              <div>
                <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 dark:text-slate-100">{cat.label}</p>
                <p className="mt-0.5 text-[11px] text-slate-500">Open map (approximate, unverified)</p>
              </div>
              <ExternalLink className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-emerald-600" />
            </button>
          ))}
        </div>
      </Card>

      {activeMapCategory && (
        <MapModal
          open
          onClose={() => setActiveMapCategory(null)}
          categoryTitle={activeMapCategory.title}
          query={activeMapCategory.query}
          locationContext={locationContext}
        />
      )}

      {/* Print-only emergency card */}
      <div className="print-area hidden print:block">
        <h1>Emergency Card - {profile.fullName || 'Name not provided'}</h1>
        <p><strong>Blood group:</strong> {profile.bloodGroup || 'Not provided'}</p>
        <p><strong>Allergies:</strong> {profile.allergies.join(', ') || 'Not provided'}</p>
        <p><strong>Conditions:</strong> {profile.conditions.join(', ') || 'Not provided'}</p>
        <p><strong>Medications (user-entered):</strong> {medications.map(medLine).join('; ') || 'Not provided'}</p>
        <p><strong>Emergency contacts:</strong> {profile.emergencyContacts.map((c) => `${c.name} (${c.relationship}): ${c.phone}`).join('; ') || 'Not provided'}</p>
        <p>In an emergency in India dial 112.</p>
      </div>
    </div>
  );
}
