import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderHeart, Search, Download, Printer, Edit2, FileText, Pill,
  AlertTriangle, Activity, Package, FlaskConical, Stethoscope, Phone,
  ShieldCheck, HeartPulse, Clock, Camera,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card, PageHeader, Badge, SectionTitle, EmptyState } from '@/components/ui';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { generateMedicalPDF } from '@/lib/pdf';
import {
  formatDate, formatTime, getAdherenceStats, todayISO, ensureTodayDoses,
} from '@/lib/medUtils';
import type { PatientProfile } from '@/types';

const fileSections = [
  { id: 'cover', label: 'Cover Page', icon: ShieldCheck },
  { id: 'demographics', label: 'Demographics', icon: FolderHeart },
  { id: 'emergency', label: 'Emergency Contacts', icon: Phone },
  { id: 'allergies', label: 'Allergies & Sensitivities', icon: AlertTriangle },
  { id: 'history', label: 'Medical History', icon: Activity },
  { id: 'medications', label: 'Medications & Schedules', icon: Pill },
  { id: 'adherence', label: 'Adherence History', icon: Clock },
  { id: 'monitoring', label: 'Camera Monitoring History', icon: Camera },
  { id: 'inventory', label: 'Inventory & Refill History', icon: Package },
  { id: 'reports', label: 'Medical Reports', icon: FileText },
  { id: 'labs', label: 'Lab Reports (Sample)', icon: FlaskConical },
  { id: 'visits', label: 'Visits & Consultations (Sample)', icon: Stethoscope },
  { id: 'provider', label: 'Healthcare Provider', icon: Stethoscope },
  { id: 'additional', label: 'Additional Information', icon: FileText },
];

export default function PatientFile() {
  const { profile, setProfile, medications, doses, refills, labs, visits, reports } = useData();
  const notify = useToast();
  const [activeSection, setActiveSection] = useState('cover');
  const [search, setSearch] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<PatientProfile>(profile);

  const allDoses = ensureTodayDoses(doses, medications);
  const adherence = getAdherenceStats(allDoses);
  const monitoringSessions = allDoses.filter((d) => d.source === 'camera' || d.source === 'simulated' || d.monitoringStatus !== 'scheduled').slice(-20).reverse();

  function exportFullPDF() {
    try {
      const doc = generateMedicalPDF({
        profile, medications, doses: allDoses, refills, labs, visits,
        reportId: `PF-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
        reportTitle: 'Complete Patient Medical File',
        includeSections: fileSections.map((s) => s.id),
      });
      doc.save(`Patient-File-${profile.fullName.replace(/\s/g, '-')}.pdf`);
      notify('Patient file PDF downloaded.', 'success');
    } catch {
      notify('PDF generation failed.', 'error');
    }
  }

  function saveEdit() {
    setProfile(editForm);
    setEditOpen(false);
    notify('Patient information updated.', 'success');
  }

  const renderSection = (id: string) => {
    switch (id) {
      case 'cover':
        return (
          <div>
            <div className="rounded-2xl border-2 border-primary-200 p-6 dark:border-primary-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HeartPulse className="h-6 w-6 text-primary-600" />
                  <span className="text-lg font-bold text-gray-900 dark:text-white">MediCare AI</span>
                </div>
                <Badge variant="error">DEMO — NOT AN OFFICIAL MEDICAL RECORD</Badge>
              </div>
              <h2 className="mt-6 text-xl font-bold text-gray-900 dark:text-white">Patient Medical File</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoRow label="Patient Name" value={profile.fullName} />
                <InfoRow label="Patient ID" value={profile.patientId} />
                <InfoRow label="Date of Birth / Age" value={profile.dateOfBirth ? `${formatDate(profile.dateOfBirth)} (${profile.age})` : profile.age} />
                <InfoRow label="Blood Group" value={profile.bloodGroup} />
                <InfoRow label="Emergency Contact" value={profile.emergencyContacts[0] ? `${profile.emergencyContacts[0].name} — ${profile.emergencyContacts[0].phone}` : ''} />
                <InfoRow label="Known Allergies" value={profile.allergies.join(', ')} />
                <InfoRow label="Current Medications" value={medications.map((m) => m.name).join(', ') || 'Not provided'} />
                <InfoRow label="Medical Alerts" value={profile.medicalAlerts.join('; ')} />
              </div>
              <p className="mt-6 text-xs text-gray-400">Generated: {formatDate(todayISO())}</p>
            </div>
          </div>
        );
      case 'demographics':
        return (
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoRow label="Full Name" value={profile.fullName} />
            <InfoRow label="Patient ID" value={profile.patientId} />
            <InfoRow label="Date of Birth" value={profile.dateOfBirth ? formatDate(profile.dateOfBirth) : ''} />
            <InfoRow label="Age" value={profile.age} />
            <InfoRow label="Gender" value={profile.gender} />
            <InfoRow label="Blood Group" value={profile.bloodGroup} />
            <InfoRow label="Address" value={profile.address} />
            <InfoRow label="Phone" value={profile.phone} />
            <InfoRow label="Email" value={profile.email} />
          </div>
        );
      case 'emergency':
        return profile.emergencyContacts.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Not provided</p>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 text-left text-xs text-gray-500 dark:border-slate-700"><th className="pb-2 pr-4">Name</th><th className="pb-2 pr-4">Relationship</th><th className="pb-2">Phone</th></tr></thead>
            <tbody>{profile.emergencyContacts.map((c) => (<tr key={c.id} className="border-b border-gray-100 dark:border-slate-800"><td className="py-2 pr-4 text-gray-900 dark:text-white">{c.name}</td><td className="py-2 pr-4 text-gray-600 dark:text-gray-400">{c.relationship}</td><td className="py-2 text-gray-600 dark:text-gray-400">{c.phone}</td></tr>))}</tbody>
          </table>
        );
      case 'allergies':
        return (
          <div className="space-y-4">
            <div><p className="label">Allergies</p>{profile.allergies.length === 0 ? <p className="text-sm text-gray-500 dark:text-gray-400">Not provided</p> : <div className="flex flex-wrap gap-2">{profile.allergies.map((a) => <Badge key={a} variant="error">{a}</Badge>)}</div>}</div>
            <div><p className="label">Medical Alerts</p>{profile.medicalAlerts.length === 0 ? <p className="text-sm text-gray-500 dark:text-gray-400">Not provided</p> : <p className="text-sm text-gray-700 dark:text-gray-300">{profile.medicalAlerts.join('; ')}</p>}</div>
          </div>
        );
      case 'history':
        return (
          <div><p className="label">Existing Conditions</p>{profile.conditions.length === 0 ? <p className="text-sm text-gray-500 dark:text-gray-400">Not provided</p> : <div className="flex flex-wrap gap-2">{profile.conditions.map((c) => <Badge key={c} variant="warning">{c}</Badge>)}</div>}</div>
        );
      case 'medications':
        return medications.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Not provided</p>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 text-left text-xs text-gray-500 dark:border-slate-700"><th className="pb-2 pr-3">Medicine</th><th className="pb-2 pr-3">Dose</th><th className="pb-2 pr-3">Schedule</th><th className="pb-2 pr-3">Instructions</th><th className="pb-2">Stock</th></tr></thead>
            <tbody>{medications.map((m) => (<tr key={m.id} className="border-b border-gray-100 dark:border-slate-800"><td className="py-2 pr-3 text-gray-900 dark:text-white">{m.name}</td><td className="py-2 pr-3 text-gray-600 dark:text-gray-400">{m.dosage} {m.unit}</td><td className="py-2 pr-3 text-gray-600 dark:text-gray-400">{m.times.map((t) => formatTime(t)).join(', ')}</td><td className="py-2 pr-3 text-gray-600 dark:text-gray-400">{m.instructions || 'Not provided'}</td><td className="py-2 text-gray-600 dark:text-gray-400">{m.quantity} {m.unit}</td></tr>))}</tbody>
          </table>
        );
      case 'adherence':
        return (
          <div>
            <div className="mb-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-success-50 p-3 dark:bg-success-700/10"><p className="text-2xl font-bold text-success-600 dark:text-success-400">{adherence.rate}%</p><p className="text-xs text-gray-500">Adherence</p></div>
              <div className="rounded-xl bg-primary-50 p-3 dark:bg-primary-700/10"><p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{adherence.taken}</p><p className="text-xs text-gray-500">Taken</p></div>
              <div className="rounded-xl bg-error-50 p-3 dark:bg-error-700/10"><p className="text-2xl font-bold text-error-600 dark:text-error-400">{adherence.missed}</p><p className="text-xs text-gray-500">Missed</p></div>
            </div>
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-200 text-left text-xs text-gray-500 dark:border-slate-700"><th className="pb-2 pr-3">Date</th><th className="pb-2 pr-3">Time</th><th className="pb-2 pr-3">Medicine</th><th className="pb-2">Status</th></tr></thead>
              <tbody>{allDoses.slice(-15).reverse().map((d) => (<tr key={d.id} className="border-b border-gray-100 dark:border-slate-800"><td className="py-2 pr-3 text-gray-600 dark:text-gray-400">{d.scheduledDate}</td><td className="py-2 pr-3 text-gray-600 dark:text-gray-400">{formatTime(d.scheduledTime)}</td><td className="py-2 pr-3 text-gray-900 dark:text-white">{d.medicationName}</td><td className="py-2"><Badge variant={d.status === 'taken' ? 'success' : d.status === 'missed' ? 'error' : 'neutral'}>{d.status.replace('_', ' ')}</Badge></td></tr>))}</tbody>
            </table>
          </div>
        );
      case 'monitoring':
        return monitoringSessions.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No monitoring sessions recorded.</p>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 text-left text-xs text-gray-500 dark:border-slate-700"><th className="pb-2 pr-3">Date</th><th className="pb-2 pr-3">Medicine</th><th className="pb-2 pr-3">Monitoring</th><th className="pb-2 pr-3">Confirmation</th><th className="pb-2">Source</th></tr></thead>
            <tbody>{monitoringSessions.map((d) => (<tr key={d.id} className="border-b border-gray-100 dark:border-slate-800"><td className="py-2 pr-3 text-gray-600 dark:text-gray-400">{d.scheduledDate}</td><td className="py-2 pr-3 text-gray-900 dark:text-white">{d.medicationName}</td><td className="py-2 pr-3 text-gray-600 dark:text-gray-400">{d.monitoringStatus.replace('_', ' ')}</td><td className="py-2 pr-3 text-gray-600 dark:text-gray-400">{d.status.replace('_', ' ')}</td><td className="py-2"><Badge variant="info">{d.source}</Badge></td></tr>))}</tbody>
          </table>
        );
      case 'inventory':
        return (
          <div className="space-y-4">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-200 text-left text-xs text-gray-500 dark:border-slate-700"><th className="pb-2 pr-3">Medicine</th><th className="pb-2 pr-3">Stock</th><th className="pb-2 pr-3">Low Threshold</th><th className="pb-2">Expiry</th></tr></thead>
              <tbody>{medications.map((m) => (<tr key={m.id} className="border-b border-gray-100 dark:border-slate-800"><td className="py-2 pr-3 text-gray-900 dark:text-white">{m.name}</td><td className="py-2 pr-3 text-gray-600 dark:text-gray-400">{m.quantity} {m.unit}</td><td className="py-2 pr-3 text-gray-600 dark:text-gray-400">{m.lowStockThreshold}</td><td className="py-2 text-gray-600 dark:text-gray-400">{m.expiryDate ? formatDate(m.expiryDate) : 'Not provided'}</td></tr>))}</tbody>
            </table>
            {refills.length > 0 && (
              <div>
                <p className="label">Refill History</p>
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-200 text-left text-xs text-gray-500 dark:border-slate-700"><th className="pb-2 pr-3">Date</th><th className="pb-2 pr-3">Medicine</th><th className="pb-2 pr-3">Qty</th><th className="pb-2">Type</th></tr></thead>
                  <tbody>{refills.map((r) => (<tr key={r.id} className="border-b border-gray-100 dark:border-slate-800"><td className="py-2 pr-3 text-gray-600 dark:text-gray-400">{formatDate(r.date)}</td><td className="py-2 pr-3 text-gray-900 dark:text-white">{r.medicationName}</td><td className="py-2 pr-3 text-gray-600 dark:text-gray-400">{r.quantity}</td><td className="py-2 text-gray-600 dark:text-gray-400">{r.type}</td></tr>))}</tbody>
                </table>
              </div>
            )}
          </div>
        );
      case 'reports':
        return reports.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No reports generated yet.</p>
        ) : (
          <div className="space-y-2">{reports.map((r) => (<Link key={r.id} to="/reports" className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 hover:bg-gray-50 dark:border-slate-800 dark:hover:bg-slate-800"><FileText className="h-5 w-5 text-secondary-500" /><div><p className="text-sm font-medium text-gray-900 dark:text-white">{r.type}</p><p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(r.generatedDate)} · {r.reportId}</p></div></Link>))}</div>
        );
      case 'labs':
        return (
          <div>
            <Badge variant="info">Sample Data</Badge>
            <table className="mt-3 w-full text-sm">
              <thead><tr className="border-b border-gray-200 text-left text-xs text-gray-500 dark:border-slate-700"><th className="pb-2 pr-3">Date</th><th className="pb-2 pr-3">Test</th><th className="pb-2 pr-3">Result</th><th className="pb-2 pr-3">Normal Range</th><th className="pb-2">Status</th></tr></thead>
              <tbody>{labs.map((l) => (<tr key={l.id} className="border-b border-gray-100 dark:border-slate-800"><td className="py-2 pr-3 text-gray-600 dark:text-gray-400">{formatDate(l.date)}</td><td className="py-2 pr-3 text-gray-900 dark:text-white">{l.testName}</td><td className="py-2 pr-3 text-gray-600 dark:text-gray-400">{l.result}</td><td className="py-2 pr-3 text-gray-600 dark:text-gray-400">{l.normalRange}</td><td className="py-2"><Badge variant={l.status === 'normal' ? 'success' : l.status === 'abnormal' ? 'error' : 'warning'}>{l.status}</Badge></td></tr>))}</tbody>
            </table>
          </div>
        );
      case 'visits':
        return (
          <div>
            <Badge variant="info">Sample Data</Badge>
            <div className="mt-3 space-y-3">{visits.map((v) => (<div key={v.id} className="rounded-xl border border-gray-100 p-3 dark:border-slate-800"><p className="text-sm font-medium text-gray-900 dark:text-white">{v.reason}</p><p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(v.date)} · {v.doctor}</p><p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{v.notes}</p></div>))}</div>
          </div>
        );
      case 'provider':
        return (
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoRow label="Provider Name" value={profile.providerName} />
            <InfoRow label="Specialty" value={profile.providerSpecialty} />
            <InfoRow label="Phone" value={profile.providerPhone} />
            <InfoRow label="Hospital" value={profile.hospitalName} />
            <InfoRow label="Hospital Address" value={profile.hospitalAddress} />
            <InfoRow label="Caregiver" value={profile.caregiverName ? `${profile.caregiverName} (${profile.caregiverPhone})` : ''} />
          </div>
        );
      case 'additional':
        return <InfoRow label="Additional Notes" value={profile.additionalInfo} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <PageHeader
        title="My Patient File"
        subtitle="A structured digital patient folder. Demo data is clearly labelled."
        actions={
          <>
            <button onClick={() => { setEditForm(profile); setEditOpen(true); }} className="btn btn-outline">
              <Edit2 className="h-4 w-4" /> Edit
            </button>
            <button onClick={exportFullPDF} className="btn btn-primary">
              <Download className="h-4 w-4" /> Export PDF
            </button>
            <button onClick={() => window.print()} className="btn btn-outline no-print">
              <Printer className="h-4 w-4" /> Print
            </button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Section nav */}
        <Card className="lg:col-span-1">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input className="input pl-10 text-sm" placeholder="Search sections..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <nav className="space-y-1">
            {fileSections
              .filter((s) => s.label.toLowerCase().includes(search.toLowerCase()))
              .map((s) => {
                const Icon = s.icon;
                const active = activeSection === s.id;
                return (
                  <button key={s.id} onClick={() => setActiveSection(s.id)} className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${active ? 'bg-primary-50 text-primary-700 dark:bg-primary-700/20 dark:text-primary-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800'}`}>
                    <Icon className="h-4 w-4 shrink-0" />
                    {s.label}
                  </button>
                );
              })}
          </nav>
        </Card>

        {/* Section content */}
        <div className="lg:col-span-3">
          <Card>
            <div className="mb-4 flex items-center gap-2">
              {(() => {
                const Icon = fileSections.find((s) => s.id === activeSection)?.icon || FileText;
                return <Icon className="h-5 w-5 text-primary-500" />;
              })()}
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{fileSections.find((s) => s.id === activeSection)?.label}</h2>
            </div>
            {renderSection(activeSection)}
          </Card>

          {/* Printable full file */}
          <div className="print-area hidden">
            <h1>Patient Medical File — {profile.fullName}</h1>
            <p>Generated: {formatDate(todayISO())}</p>
            <p>DEMO — NOT AN OFFICIAL MEDICAL RECORD</p>
            {fileSections.map((s) => (
              <div key={s.id}>
                <h2>{s.label}</h2>
                <div>{renderSection(s.id)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Patient Information" size="lg"
        footer={<><button onClick={() => setEditOpen(false)} className="btn btn-outline">Cancel</button><button onClick={saveEdit} className="btn btn-primary">Save</button></>}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Full Name</label><input className="input" value={editForm.fullName} onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })} /></div>
          <div><label className="label">Patient ID</label><input className="input" value={editForm.patientId} onChange={(e) => setEditForm({ ...editForm, patientId: e.target.value })} /></div>
          <div><label className="label">Date of Birth</label><input type="date" className="input" value={editForm.dateOfBirth} onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })} /></div>
          <div><label className="label">Age</label><input className="input" value={editForm.age} onChange={(e) => setEditForm({ ...editForm, age: e.target.value })} /></div>
          <div><label className="label">Blood Group</label><input className="input" value={editForm.bloodGroup} onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })} /></div>
          <div><label className="label">Gender</label><input className="input" value={editForm.gender} onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })} /></div>
          <div><label className="label">Phone</label><input className="input" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} /></div>
          <div><label className="label">Email</label><input className="input" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} /></div>
          <div className="sm:col-span-2"><label className="label">Address</label><input className="input" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} /></div>
          <div className="sm:col-span-2"><label className="label">Allergies (comma-separated)</label><input className="input" value={editForm.allergies.join(', ')} onChange={(e) => setEditForm({ ...editForm, allergies: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} /></div>
          <div className="sm:col-span-2"><label className="label">Conditions (comma-separated)</label><input className="input" value={editForm.conditions.join(', ')} onChange={(e) => setEditForm({ ...editForm, conditions: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} /></div>
          <div className="sm:col-span-2"><label className="label">Medical Alerts (semicolon-separated)</label><input className="input" value={editForm.medicalAlerts.join('; ')} onChange={(e) => setEditForm({ ...editForm, medicalAlerts: e.target.value.split(';').map((s) => s.trim()).filter(Boolean) })} /></div>
          <div><label className="label">Provider Name</label><input className="input" value={editForm.providerName} onChange={(e) => setEditForm({ ...editForm, providerName: e.target.value })} /></div>
          <div><label className="label">Provider Phone</label><input className="input" value={editForm.providerPhone} onChange={(e) => setEditForm({ ...editForm, providerPhone: e.target.value })} /></div>
          <div className="sm:col-span-2"><label className="label">Additional Info</label><textarea className="input" rows={3} value={editForm.additionalInfo} onChange={(e) => setEditForm({ ...editForm, additionalInfo: e.target.value })} /></div>
        </div>
      </Modal>
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
