import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Siren, Phone, Copy, Download, Printer, MapPin, Hospital, AlertTriangle,
  ShieldCheck, Heart, Activity, FileText, CheckCircle2, Info, BookOpen,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card, PageHeader, Badge, SectionTitle } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { generateEmergencyPDF } from '@/lib/pdf';
import { formatDate } from '@/lib/medUtils';

const firstAidTopics = [
  {
    title: 'CPR Awareness',
    icon: Heart,
    steps: [
      'Check responsiveness — tap and shout. If no response, call your local emergency number immediately (e.g., 112, 911, 102).',
      'Check for normal breathing. If absent, begin chest compressions.',
      'Push hard and fast in the centre of the chest at 100–120 compressions per minute, about 5 cm deep.',
      'If trained, give rescue breaths in a 30:2 ratio (30 compressions, 2 breaths).',
      'Use an AED (defibrillator) if available and follow its voice instructions.',
      'Continue until emergency help arrives or the person starts breathing.',
    ],
    source: 'Adapted from widely published emergency-care guidance.',
  },
  {
    title: 'Choking Emergency',
    icon: Activity,
    steps: [
      'Ask "Are you choking?" If the person cannot speak, cough, or breathe — act immediately.',
      'Give 5 back blows between the shoulder blades with the heel of your hand.',
      'Give 5 abdominal thrusts (Heimlich manoeuvre) — a fist above the navel, pull inward and upward.',
      'Alternate between 5 back blows and 5 abdominal thrusts.',
      'Call your local emergency number if the blockage does not clear quickly.',
      'If the person becomes unconscious, start CPR.',
    ],
    source: 'Adapted from general first-aid guidance.',
  },
  {
    title: 'Seizure First Aid',
    icon: AlertTriangle,
    steps: [
      'Stay calm and time the seizure with a watch or clock.',
      'Clear the area of hard or sharp objects to prevent injury.',
      'Cushion the person’s head gently.',
      'Do NOT restrain the person or put anything in their mouth.',
      'Once shaking stops, gently roll them onto their side (recovery position).',
      'Call emergency services if the seizure lasts more than 5 minutes, repeats, or it is their first seizure.',
    ],
    source: 'Adapted from general first-aid guidance.',
  },
  {
    title: 'Recovery Position',
    icon: ShieldCheck,
    steps: [
      'Kneel beside the unconscious but breathing person.',
      'Place the arm nearest you at a right angle to the body.',
      'Bring the far arm across the chest, hand against the near cheek.',
      'Pull the far knee up so the foot is flat on the ground.',
      'Gently roll the person toward you onto their side.',
      'Tilt the head back to keep the airway open. Monitor breathing until help arrives.',
    ],
    source: 'Adapted from general first-aid guidance.',
  },
  {
    title: 'Obtaining Emergency Assistance',
    icon: Phone,
    steps: [
      'Know your local emergency number (e.g., 112 in the EU, 911 in the US, 102 for ambulance in some countries).',
      'Speak clearly: state your location, the nature of the emergency, and any known conditions.',
      'Mention allergies, current medications, and blood group if you know them.',
      'Stay on the line and follow the dispatcher’s instructions.',
      'If possible, send someone to meet the responders at the street.',
    ],
    source: 'General emergency-preparedness guidance.',
  },
  {
    title: 'Emergency Preparedness Checklist',
    icon: CheckCircle2,
    steps: [
      'Keep a written list of emergency contacts with you.',
      'Carry a card with current medications, doses, and known allergies.',
      'Maintain a basic first-aid kit at home and in your car.',
      'Know your local emergency number and nearest emergency facility.',
      'Consider wearing a medical alert tag for serious conditions.',
      'Review and practise your emergency plan regularly.',
    ],
    source: 'General emergency-preparedness guidance.',
  },
];

const checklistItems = [
  'Written emergency contact list is accessible',
  'Current medication and allergy list is up to date',
  'Basic first-aid kit is stocked and accessible',
  'Local emergency number is known',
  'Medical alert tag or card for serious conditions',
  'Emergency guide PDF has been downloaded and is current',
];

export default function EmergencyAssistance() {
  const { profile, medications } = useData();
  const notify = useToast();
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  function copyDetails() {
    const lines = [
      `Patient: ${profile.fullName}`,
      `Patient ID: ${profile.patientId}`,
      `Blood Group: ${profile.bloodGroup || 'Not provided'}`,
      `Allergies: ${profile.allergies.join(', ') || 'Not provided'}`,
      `Conditions: ${profile.conditions.join(', ') || 'Not provided'}`,
      `Medications: ${medications.map((m) => `${m.name} ${m.dosage} ${m.unit}`).join(', ') || 'Not provided'}`,
      `Emergency Contacts: ${profile.emergencyContacts.map((c) => `${c.name} (${c.phone})`).join(', ') || 'Not provided'}`,
    ];
    navigator.clipboard.writeText(lines.join('\n')).then(
      () => notify('Emergency details copied to clipboard.', 'success'),
      () => notify('Could not copy. Please copy manually.', 'error'),
    );
  }

  function downloadPDF() {
    try {
      const doc = generateEmergencyPDF(profile, medications);
      doc.save(`Emergency-Guide-${profile.fullName.replace(/\s/g, '-')}.pdf`);
      notify('Emergency guide PDF downloaded.', 'success');
    } catch {
      notify('PDF generation failed. Please try again.', 'error');
    }
  }

  function printSummary() {
    window.print();
  }

  return (
    <div>
      <PageHeader title="Emergency Assistance" subtitle="Quick access to your emergency information, contacts and first-aid guidance." />

      {/* Emergency banner */}
      <div className="mb-6 rounded-2xl bg-error-600 p-5 text-white">
        <div className="flex items-center gap-3">
          <Siren className="h-8 w-8" />
          <div>
            <h2 className="text-lg font-bold">In a real emergency, call your local emergency number immediately.</h2>
            <p className="text-sm text-error-100">This app does NOT contact emergency services. Use your phone to call 112 / 911 / 102 or your local number.</p>
          </div>
        </div>
      </div>

      {/* Emergency actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <button onClick={downloadPDF} className="card flex flex-col items-center gap-2 p-5 text-center transition hover:border-primary-300 hover:shadow-md">
          <Download className="h-8 w-8 text-primary-500" />
          <p className="text-sm font-medium text-gray-900 dark:text-white">Download Guide</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Real PDF, works offline</p>
        </button>
        <button onClick={copyDetails} className="card flex flex-col items-center gap-2 p-5 text-center transition hover:border-primary-300 hover:shadow-md">
          <Copy className="h-8 w-8 text-secondary-500" />
          <p className="text-sm font-medium text-gray-900 dark:text-white">Copy Details</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">To clipboard</p>
        </button>
        <button onClick={printSummary} className="card flex flex-col items-center gap-2 p-5 text-center transition hover:border-primary-300 hover:shadow-md no-print">
          <Printer className="h-8 w-8 text-accent-500" />
          <p className="text-sm font-medium text-gray-900 dark:text-white">Print Summary</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">A4-friendly layout</p>
        </button>
        <Link to="/emergency-guide" className="card flex flex-col items-center gap-2 p-5 text-center transition hover:border-primary-300 hover:shadow-md">
          <ShieldCheck className="h-8 w-8 text-error-500" />
          <p className="text-sm font-medium text-gray-900 dark:text-white">Offline Guide</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">View online content</p>
        </Link>
      </div>

      {/* Patient emergency summary */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle className="mb-4">Emergency Patient Summary</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoRow label="Patient Name" value={profile.fullName} />
            <InfoRow label="Patient ID" value={profile.patientId} />
            <InfoRow label="Blood Group" value={profile.bloodGroup} />
            <InfoRow label="Age" value={profile.age} />
            <InfoRow label="Allergies" value={profile.allergies.join(', ')} />
            <InfoRow label="Conditions" value={profile.conditions.join(', ')} />
            <InfoRow label="Medical Alerts" value={profile.medicalAlerts.join('; ')} />
            <InfoRow label="Provider" value={profile.providerName} />
          </div>
          <div className="mt-4">
            <p className="label">Current Medications</p>
            {medications.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Not provided</p>
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
            <p className="text-sm text-gray-500 dark:text-gray-400">Not provided</p>
          ) : (
            <div className="space-y-3">
              {profile.emergencyContacts.map((c) => (
                <div key={c.id} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 dark:border-slate-800">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-error-100 text-error-600 dark:bg-error-700/20">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{c.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{c.relationship} · {c.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-warning-50 p-3 text-xs text-warning-700 dark:bg-warning-700/10 dark:text-warning-400">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p>These are simulated contact entries. This app does not make calls. Dial the number on your phone manually.</p>
          </div>
        </Card>
      </div>

      {/* Hospital directory (sample) */}
      <Card className="mt-6">
        <SectionTitle className="mb-3">Sample Hospital Directory</SectionTitle>
        <div className="mb-3 flex items-start gap-2 rounded-xl bg-secondary-50 p-3 text-xs text-secondary-700 dark:bg-secondary-700/10 dark:text-secondary-400">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
          <p>This is a sample demonstration directory. These are not real, verified emergency facilities. Contact your local emergency services for actual hospital information.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: 'City Care Hospital (Sample)', addr: '100 Brigade Road, Bengaluru 560025', phone: '+91 80 2345 6789' },
            { name: 'General Medical Centre (Sample)', addr: '55 Residency Rd, Bengaluru 560025', phone: '+91 80 2233 4455' },
            { name: 'Community Health Hub (Sample)', addr: '12 Cunningham Rd, Bengaluru 560052', phone: '+91 80 2299 8877' },
          ].map((h) => (
            <div key={h.name} className="rounded-xl border border-gray-100 p-4 dark:border-slate-800">
              <div className="mb-2 flex items-center gap-2">
                <Hospital className="h-4 w-4 text-primary-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">{h.name}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{h.addr}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{h.phone}</p>
              <Badge variant="info">Sample</Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Preparedness checklist */}
      <Card className="mt-6">
        <SectionTitle className="mb-3">Emergency Preparedness Checklist</SectionTitle>
        <div className="space-y-2">
          {checklistItems.map((item, i) => (
            <label key={i} className="flex cursor-pointer items-center gap-3 rounded-xl p-2 hover:bg-gray-50 dark:hover:bg-slate-800">
              <input type="checkbox" checked={!!checked[i]} onChange={() => setChecked({ ...checked, [i]: !checked[i] })} className="h-4 w-4 rounded accent-primary-600" />
              <span className={`text-sm ${checked[i] ? 'text-gray-400 line-through dark:text-gray-600' : 'text-gray-700 dark:text-gray-300'}`}>{item}</span>
            </label>
          ))}
        </div>
      </Card>

      {/* First aid education */}
      <div className="mt-6">
        <div className="mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">First-Aid Education</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {firstAidTopics.map((topic) => {
            const Icon = topic.icon;
            return (
              <details key={topic.title} className="card cursor-pointer">
                <summary className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                  <Icon className="h-5 w-5 text-primary-500" />
                  {topic.title}
                </summary>
                <ol className="mt-3 list-inside list-decimal space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
                  {topic.steps.map((step, si) => (
                    <li key={si}>{step}</li>
                  ))}
                </ol>
                <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">{topic.source}</p>
              </details>
            );
          })}
        </div>
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-warning-50 p-3 text-xs text-warning-700 dark:bg-warning-700/10 dark:text-warning-400">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>This is educational information, not a substitute for certified first-aid training or professional medical care. In an emergency, always contact your local emergency services first.</p>
        </div>
      </div>

      {/* Printable area */}
      <div className="print-area hidden">
        <h1>Emergency Medical Summary</h1>
        <p>Patient: {profile.fullName} | ID: {profile.patientId}</p>
        <p>Generated: {formatDate(new Date().toISOString().split('T')[0])}</p>
        <h2>Allergies</h2><p>{profile.allergies.join(', ') || 'Not provided'}</p>
        <h2>Conditions</h2><p>{profile.conditions.join(', ') || 'Not provided'}</p>
        <h2>Medications</h2>
        <p>{medications.map((m) => `${m.name} ${m.dosage} ${m.unit} — ${m.times.join(', ')}`).join('; ') || 'Not provided'}</p>
        <h2>Emergency Contacts</h2>
        <p>{profile.emergencyContacts.map((c) => `${c.name} (${c.relationship}): ${c.phone}`).join('; ') || 'Not provided'}</p>
        <p style={{ fontSize: '10px', marginTop: '20px' }}>DEMO — Not an official medical record.</p>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-900 dark:text-white">{value || 'Not provided'}</p>
    </div>
  );
}
