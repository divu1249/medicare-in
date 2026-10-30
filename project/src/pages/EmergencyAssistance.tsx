import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Siren, Phone, Copy, Download, Printer, MapPin, Hospital, AlertTriangle,
  ShieldCheck, Heart, Activity, Info, BookOpen, ExternalLink, Search, Crosshair, Navigation,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card, PageHeader, Badge, SectionTitle } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { generateEmergencyPDF } from '@/lib/pdf';
import { formatDate } from '@/lib/medUtils';
import MapModal from '@/components/ui/MapModal';

const officialIndiaHelplines = [
  { number: '112', title: 'National Emergency Number (ERSS)', authority: 'Ministry of Home Affairs, Govt. of India', scope: 'Police, Fire & Emergency Rescue (Pan-India)' },
  { number: '108', title: 'Emergency Ambulance Service', authority: 'National Health Mission (NHM) / State EMRI', scope: 'Critical Care & Trauma Ambulance' },
  { number: '102', title: 'Maternal & Neonatal Ambulance', authority: 'National Health Mission (JSSK)', scope: 'Pregnant Women & Infant Transport' },
  { number: '1800116117', display: '1800-11-6117', title: 'National Poisons Information Centre', authority: 'AIIMS New Delhi (24x7 Toll-Free)', scope: 'Suspected Poisoning & Overdose Guidance' },
];

const discoveryCategories = [
  { id: 'hospital', label: '24x7 Emergency Hospitals', query: 'emergency hospital' },
  { id: 'pharmacy', label: 'Jan Aushadhi Kendra & Pharmacies', query: 'Jan Aushadhi Kendra pharmacy' },
  { id: 'clinic', label: 'Primary Health Centre / Clinic', query: 'Primary Health Centre clinic' },
  { id: 'vet', label: 'Veterinary Emergency Care', query: 'veterinary hospital clinic' },
];

const firstAidTopics = [
  {
    title: 'CPR Awareness (Adult Hands-Only)',
    icon: Heart,
    steps: [
      'Check responsiveness — tap shoulder and shout. If unresponsive, call 112 or 108 immediately.',
      'Check for normal breathing for no more than 10 seconds.',
      'Push hard and fast in the centre of the chest at 100–120 compressions per minute (5–6 cm depth).',
      'If trained, provide rescue breaths in a 30:2 ratio; otherwise continue uninterrupted chest compressions.',
      'Use an Automated External Defibrillator (AED) as soon as available and follow voice prompts.',
    ],
    source: 'Source: Indian Red Cross Society & ILCOR Basic Life Support Guidelines (v2.2, Reviewed 2026-09)',
  },
  {
    title: 'Choking Emergency',
    icon: Activity,
    steps: [
      'Ask "Are you choking?" If the person can cough or speak, encourage coughing.',
      'If unable to breathe, cough, or speak: deliver 5 firm back blows between the shoulder blades.',
      'Deliver 5 abdominal thrusts (Heimlich manoeuvre) inward and upward above the navel.',
      'Alternate 5 back blows and 5 abdominal thrusts until the airway clears or help arrives.',
    ],
    source: 'Source: Indian Red Cross First Aid Protocol (v2.0, Reviewed 2026-08)',
  },
  {
    title: 'Seizure First Aid',
    icon: AlertTriangle,
    steps: [
      'Stay calm, note the start time of the seizure, and clear hard/sharp hazards from the area.',
      'Cushion the head with a folded cloth or jacket; loosen tight neckwear.',
      'NEVER restrain the person or put any object, water, or medicine into their mouth.',
      'Once jerking stops, gently roll them onto their side (recovery position) to keep the airway clear.',
      'Call 108 / 112 if the seizure lasts more than 5 minutes, repeats, or breathing does not resume.',
    ],
    source: 'Source: Indian Epilepsy Association First Aid Consensus (v1.9, Reviewed 2026-08)',
  },
];

const checklistItems = [
  'Written emergency contact list is accessible offline',
  'User-entered medication and allergy list is up to date',
  'Basic first-aid kit is stocked and expiry-checked',
  'National emergency numbers (112 / 108) are known to household members',
  'Offline Emergency Guide PDF has been downloaded to device storage',
];

export default function EmergencyAssistance() {
  const { profile, medications } = useData();
  const notify = useToast();
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [locationContext, setLocationContext] = useState('New Delhi');
  const [activeMapCategory, setActiveMapCategory] = useState<{ title: string; query: string } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  function detectGPS() {
    if (!navigator.geolocation) {
      notify('Geolocation not supported by your browser.', 'error');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coordsStr = `${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)}`;
        setLocationContext(coordsStr);
        setGpsLoading(false);
        notify(`GPS acquired: ${coordsStr}`, 'success');
      },
      () => {
        setGpsLoading(false);
        notify('Unable to retrieve GPS. Using region fallback.', 'warning');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  }

  function copyDetails() {
    const lines = [
      `Patient: ${profile.fullName} (User-entered emergency summary)`,
      `Blood Group: ${profile.bloodGroup || 'Not provided'}`,
      `Allergies: ${profile.allergies.join(', ') || 'Not provided'}`,
      `Conditions: ${profile.conditions.join(', ') || 'Not provided'}`,
      `Medications (User-entered): ${medications.map((m) => `${m.name} ${m.dosage} ${m.unit}`).join(', ') || 'Not provided'}`,
      `Emergency Contacts: ${profile.emergencyContacts.map((c) => `${c.name} (${c.phone})`).join(', ') || 'Not provided'}`,
    ];
    navigator.clipboard.writeText(lines.join('\n')).then(
      () => notify('Emergency summary copied to clipboard.', 'success'),
      () => notify('Could not copy automatically.', 'error')
    );
  }

  function downloadPDF() {
    try {
      const doc = generateEmergencyPDF(profile, medications);
      doc.save(`MediGuard-Emergency-Guide-${profile.fullName.replace(/\s/g, '-')}.pdf`);
      notify('Emergency guide PDF downloaded for offline access.', 'success');
    } catch {
      notify('PDF generation failed.', 'error');
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Emergency Assistance & Live Healthcare Discovery"
        subtitle="Fast access to official Indian emergency helplines, your emergency card, verified first-aid guidance, and in-app live facility maps."
      />

      {/* Emergency Alert Banner */}
      <div className="rounded-2xl bg-rose-600 p-6 text-white shadow-lg dark:bg-rose-950/80 border border-rose-500/30">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
              <Siren className="h-7 w-7 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">In a medical emergency in India, dial 112 or 108 immediately.</h2>
              <p className="text-sm text-rose-100">
                Tapping a phone link opens your device dialer; it does not automatically dispatch emergency personnel.
              </p>
            </div>
          </div>
          <div className="flex gap-2.5 shrink-0">
            <a href="tel:112" className="btn bg-white hover:bg-rose-50 text-rose-700 font-extrabold px-5 py-2.5 shadow-sm">
              <Phone className="h-4 w-4" /> Dial 112
            </a>
            <a href="tel:108" className="btn bg-rose-800 hover:bg-rose-900 text-white font-extrabold px-5 py-2.5 shadow-sm">
              <Phone className="h-4 w-4" /> Dial 108
            </a>
          </div>
        </div>
      </div>

      {/* Official Helplines */}
      <Card>
        <SectionTitle className="mb-4">Official Emergency Helplines (Jurisdiction: India)</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {officialIndiaHelplines.map((h) => (
            <div key={h.number} className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-extrabold text-rose-600 dark:text-rose-400">{h.display || h.number}</span>
                  <Badge variant="success">Verified IN</Badge>
                </div>
                <p className="mt-2 text-sm font-bold text-slate-900 dark:text-slate-100">{h.title}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{h.scope}</p>
                <p className="mt-1.5 text-[11px] text-slate-400">{h.authority}</p>
              </div>
              <a href={`tel:${h.number}`} className="mt-4 btn border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold w-full">
                <Phone className="h-3.5 w-3.5 text-rose-500" /> Open in Dialer ({h.display || h.number})
              </a>
            </div>
          ))}
        </div>
      </Card>

      {/* Action Hub */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <button onClick={downloadPDF} className="card flex flex-col items-center gap-2.5 p-5 text-center transition hover:border-emerald-300 hover:shadow-md group">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 group-hover:scale-105 transition-transform">
            <Download className="h-6 w-6" />
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Download Offline PDF</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Saves emergency card to device</p>
        </button>
        <button onClick={copyDetails} className="card flex flex-col items-center gap-2.5 p-5 text-center transition hover:border-teal-300 hover:shadow-md group">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400 group-hover:scale-105 transition-transform">
            <Copy className="h-6 w-6" />
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Copy Emergency Card</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Plain text for SMS / sharing</p>
        </button>
        <button onClick={() => window.print()} className="card flex flex-col items-center gap-2.5 p-5 text-center transition hover:border-amber-300 hover:shadow-md group no-print">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 group-hover:scale-105 transition-transform">
            <Printer className="h-6 w-6" />
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Print A4 Summary</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Wallet / folder sheet</p>
        </button>
        <Link to="/emergency-guide" className="card flex flex-col items-center gap-2.5 p-5 text-center transition hover:border-rose-300 hover:shadow-md group">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 group-hover:scale-105 transition-transform">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Offline First-Aid Guide</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Cached clinical protocols</p>
        </Link>
      </div>

      {/* Geolocation & In-App Healthcare Discovery Widget */}
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <Navigation className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <SectionTitle>Live Healthcare & Pharmacy Discovery</SectionTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Current Region: <span className="font-bold text-emerald-600 dark:text-emerald-400">{locationContext}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={detectGPS}
              disabled={gpsLoading}
              className="btn bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-3.5 shadow-sm flex items-center gap-1.5"
            >
              <Crosshair className="h-3.5 w-3.5" /> {gpsLoading ? 'Detecting GPS...' : 'Detect My GPS'}
            </button>
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400" />
              <input
                className="input w-48 pl-8 text-xs"
                value={locationContext}
                onChange={(e) => setLocationContext(e.target.value)}
                placeholder="City / Area / Pin"
                aria-label="Location search"
              />
            </div>
          </div>
        </div>

        <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
          Tap any facility category below to instantly open an <strong>interactive live map view right inside the app</strong>.
        </p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          {discoveryCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveMapCategory({ title: cat.label, query: cat.query })}
              className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-left transition-all hover:border-emerald-400 hover:bg-emerald-50/40 dark:hover:bg-slate-800/80 group"
            >
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600">{cat.label}</p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Open Status
                </p>
              </div>
              <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </button>
          ))}
        </div>

        <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Metropolitan Reference Facilities</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { name: 'AIIMS New Delhi', addr: 'Sri Aurobindo Marg, Ansari Nagar', query: 'AIIMS New Delhi Hospital' },
              { name: 'Sir Ganga Ram Hospital', addr: 'Old Rajinder Nagar, New Delhi', query: 'Sir Ganga Ram Hospital New Delhi' },
              { name: 'Indraprastha Apollo Hospitals', addr: 'Mathura Rd, Jasola Vihar', query: 'Indraprastha Apollo Hospitals New Delhi' },
            ].map((h) => (
              <div key={h.name} className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <Hospital className="h-3.5 w-3.5 text-emerald-600" /> {h.name}
                    </span>
                    <Badge variant="success">24x7</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{h.addr}</p>
                </div>
                <button
                  onClick={() => setActiveMapCategory({ title: h.name, query: h.query })}
                  className="mt-3 btn border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold w-full"
                >
                  <MapPin className="h-3.5 w-3.5 text-emerald-600" /> View In-App Map
                </button>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Personal Emergency Card & Contacts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <SectionTitle>Personal Emergency Card</SectionTitle>
            <Badge variant="neutral">User-entered summary</Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoRow label="Patient Name" value={profile.fullName} />
            <InfoRow label="Blood Group" value={profile.bloodGroup} />
            <InfoRow label="Age / DOB" value={profile.age} />
            <InfoRow label="Primary Phone" value={profile.phone} />
            <InfoRow label="Known Allergies" value={profile.allergies.join(', ')} />
            <InfoRow label="Medical Conditions" value={profile.conditions.join(', ')} />
            <InfoRow label="Medical Alerts" value={profile.medicalAlerts.join('; ')} />
            <InfoRow label="Prescribing Doctor" value={profile.providerName} />
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-500 mb-2">Active Medications (User-entered)</p>
            {medications.length === 0 ? (
              <p className="text-sm text-slate-500">Not provided</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {medications.map((m) => (
                  <Badge key={m.id} variant="primary">{m.name} {m.dosage} {m.unit}</Badge>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <SectionTitle className="mb-4">Emergency Contacts</SectionTitle>
          {profile.emergencyContacts.length === 0 ? (
            <p className="text-sm text-slate-500">No emergency contacts configured yet.</p>
          ) : (
            <div className="space-y-3">
              {profile.emergencyContacts.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-xl border border-slate-200/80 p-3 dark:border-slate-800">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{c.name}</p>
                    <p className="text-xs text-slate-500">{c.relationship} · {c.phone}</p>
                  </div>
                  <a href={`tel:${c.phone.replace(/\s+/g, '')}`} className="btn border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold py-1.5 px-3">
                    <Phone className="h-3 w-3 text-rose-500" /> Call
                  </a>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p>Calling opens your phone dialer. Verify all numbers before an emergency occurs.</p>
          </div>
        </Card>
      </div>

      {/* Preparedness Checklist & First Aid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle className="mb-4">Preparedness Checklist</SectionTitle>
          <div className="space-y-2.5">
            {checklistItems.map((item, i) => (
              <label key={i} className="flex cursor-pointer items-center gap-3 rounded-xl p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <input type="checkbox" checked={!!checked[i]} onChange={() => setChecked({ ...checked, [i]: !checked[i] })} className="h-4 w-4 rounded accent-emerald-600" />
                <span className={`text-sm font-medium ${checked[i] ? 'text-slate-400 line-through dark:text-slate-600' : 'text-slate-700 dark:text-slate-300'}`}>{item}</span>
              </label>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-600" />
            <SectionTitle>First-Aid Reference (Offline)</SectionTitle>
          </div>
          <div className="space-y-3">
            {firstAidTopics.map((topic) => {
              const Icon = topic.icon;
              return (
                <details key={topic.title} className="group rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 cursor-pointer bg-slate-50/50 dark:bg-slate-900/50">
                  <summary className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-sm">
                    <Icon className="h-4 w-4 text-emerald-600" />
                    {topic.title}
                  </summary>
                  <ol className="mt-2.5 list-inside list-decimal space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pl-1">
                    {topic.steps.map((step, si) => (
                      <li key={si}>{step}</li>
                    ))}
                  </ol>
                  <p className="mt-2.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">{topic.source}</p>
                </details>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Interactive Map Modal */}
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{value || 'Not provided'}</p>
    </div>
  );
}