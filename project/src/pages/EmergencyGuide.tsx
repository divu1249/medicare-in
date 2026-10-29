import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Download, Printer, FileText, ShieldCheck, Wifi, WifiOff, RefreshCw,
  AlertTriangle, Info, BookOpen, Heart, Activity, CheckCircle2, Phone,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card, PageHeader, Badge, SectionTitle } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { generateEmergencyPDF } from '@/lib/pdf';
import { getOfflineStatus, checkOnlineStatus } from '@/lib/offline';
import { formatDate } from '@/lib/medUtils';

const guideSections = [
  {
    title: 'Emergency Contacts',
    icon: Phone,
    content: ['Call your local emergency number (e.g., 112, 911, 102) immediately in a real emergency.', 'Keep a written list of family and medical contacts accessible.', 'Inform your emergency contact about your conditions and medications.'],
  },
  {
    title: 'CPR Awareness',
    icon: Heart,
    content: ['Call emergency services first.', 'Push hard and fast in the centre of the chest, 100–120/min.', 'Use an AED if available.', 'Continue until help arrives.'],
  },
  {
    title: 'Choking',
    icon: Activity,
    content: ['5 back blows between shoulder blades.', '5 abdominal thrusts (Heimlich).', 'Alternate until blockage clears.', 'Call emergency services if not relieved.'],
  },
  {
    title: 'Seizure',
    icon: AlertTriangle,
    content: ['Time the seizure.', 'Clear area of hazards.', 'Do not restrain or put anything in mouth.', 'Recovery position after shaking stops.', 'Call help if >5 minutes.'],
  },
  {
    title: 'Recovery Position',
    icon: ShieldCheck,
    content: ['Arm at right angle.', 'Far arm across chest.', 'Roll toward you onto side.', 'Tilt head back to open airway.'],
  },
  {
    title: 'Preparedness Checklist',
    icon: CheckCircle2,
    content: ['Emergency contact list accessible.', 'Medication and allergy list current.', 'First-aid kit stocked.', 'Know local emergency number.', 'Medical alert tag for serious conditions.'],
  },
];

export default function EmergencyGuide() {
  const { profile, medications } = useData();
  const notify = useToast();
  const [offlineStatus, setOfflineStatus] = useState(getOfflineStatus());
  const [online, setOnline] = useState(checkOnlineStatus());

  useEffect(() => {
    const handler = () => setOnline(checkOnlineStatus());
    window.addEventListener('online', handler);
    window.addEventListener('offline', handler);
    return () => {
      window.removeEventListener('online', handler);
      window.removeEventListener('offline', handler);
    };
  }, []);

  function downloadPDF() {
    try {
      const doc = generateEmergencyPDF(profile, medications);
      doc.save(`Emergency-Guide-${profile.fullName.replace(/\s/g, '-')}.pdf`);
      notify('Emergency guide PDF downloaded. It works without internet.', 'success');
    } catch {
      notify('PDF generation failed. Please try again.', 'error');
    }
  }

  function printGuide() {
    window.print();
  }

  return (
    <div>
      <PageHeader
        title="Offline Emergency Guide"
        subtitle="Download this guide as a real PDF for access without internet. The content is bundled with the app."
        actions={
          <>
            <button onClick={printGuide} className="btn btn-outline no-print">
              <Printer className="h-4 w-4" /> Print
            </button>
            <button onClick={downloadPDF} className="btn btn-primary">
              <Download className="h-4 w-4" /> Download PDF
            </button>
          </>
        }
      />

      {/* Offline status */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium ${online ? 'bg-success-100 text-success-700 dark:bg-success-700/20 dark:text-success-400' : 'bg-warning-100 text-warning-700 dark:bg-warning-700/20 dark:text-warning-400'}`}>
          {online ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
          {online ? 'Online' : 'Offline mode'}
        </div>
        <Badge variant={offlineStatus.ready ? 'success' : 'warning'}>
          {offlineStatus.ready ? 'Offline content available' : 'Caching...'}
        </Badge>
        {offlineStatus.date && <span className="text-xs text-gray-500 dark:text-gray-400">Last cached: {formatDate(offlineStatus.date.split('T')[0])}</span>}
      </div>

      {/* Important notice */}
      <div className="mb-6 rounded-2xl bg-error-600 p-5 text-white">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-7 w-7 shrink-0" />
          <div>
            <h2 className="text-base font-bold">In a real emergency, call your local emergency number immediately.</h2>
            <p className="text-sm text-error-100">This guide is educational. It does not contact emergency services and is not a substitute for professional help.</p>
          </div>
        </div>
      </div>

      {/* Printable guide content */}
      <div className="print-area space-y-6">
        <Card>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary-500" />
            <SectionTitle>Patient Emergency Summary</SectionTitle>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <InfoRow label="Patient Name" value={profile.fullName} />
            <InfoRow label="Patient ID" value={profile.patientId} />
            <InfoRow label="Age" value={profile.age} />
            <InfoRow label="Blood Group" value={profile.bloodGroup} />
            <InfoRow label="Phone" value={profile.phone} />
            <InfoRow label="Allergies" value={profile.allergies.join(', ')} />
            <InfoRow label="Conditions" value={profile.conditions.join(', ')} />
            <InfoRow label="Medical Alerts" value={profile.medicalAlerts.join('; ')} />
          </div>
          <div className="mt-4">
            <p className="label">Emergency Contacts</p>
            {profile.emergencyContacts.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Not provided</p>
            ) : (
              <div className="space-y-1">
                {profile.emergencyContacts.map((c) => (
                  <p key={c.id} className="text-sm text-gray-700 dark:text-gray-300">{c.name} ({c.relationship}) — {c.phone}</p>
                ))}
              </div>
            )}
          </div>
          <div className="mt-4">
            <p className="label">Current Medications</p>
            {medications.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Not provided</p>
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-200 text-left dark:border-slate-700"><th className="pb-1">Medicine</th><th>Dose</th><th>Schedule</th></tr></thead>
                <tbody>
                  {medications.map((m) => (
                    <tr key={m.id} className="border-b border-gray-100 dark:border-slate-800"><td className="py-1.5">{m.name}</td><td>{m.dosage} {m.unit}</td><td>{m.times.join(', ')}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="mt-4">
            <p className="label">Healthcare Provider</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{profile.providerName} · {profile.providerPhone}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{profile.hospitalName}</p>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {guideSections.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.title}>
                <div className="mb-2 flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">{section.title}</h3>
                </div>
                <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
                  {section.content.map((line, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary-500" />
                      {line}
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>

        <Card className="border-warning-200 dark:border-warning-700/50">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-5 w-5 text-warning-500" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Important Notes</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>Downloaded information may become outdated if your details or medications change. Generate an updated copy regularly.</li>
                <li>This guide is for educational purposes and is not a substitute for professional medical care.</li>
                <li>Always contact your local emergency services in a real emergency.</li>
                <li>Browser storage may be cleared; keep your downloaded PDF file for reliable offline access.</li>
              </ul>
            </div>
          </div>
        </Card>

        <div className="mt-4 text-center text-xs text-gray-400">
          <p>DEMO — Generated on {formatDate(new Date().toISOString().split('T')[0])} — Not an official medical record.</p>
        </div>
      </div>

      {/* Non-print actions */}
      <div className="mt-6 flex flex-wrap gap-3 no-print">
        <Link to="/emergency" className="btn btn-outline">
          <AlertTriangle className="h-4 w-4" /> Emergency Assistance
        </Link>
        <Link to="/library" className="btn btn-outline">
          <BookOpen className="h-4 w-4" /> Medical Library
        </Link>
        <button onClick={downloadPDF} className="btn btn-primary">
          <RefreshCw className="h-4 w-4" /> Regenerate PDF
        </button>
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
