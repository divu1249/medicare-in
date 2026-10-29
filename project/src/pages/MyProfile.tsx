import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User, Phone, AlertTriangle, Pill, FolderHeart, FileText,
  Hospital, Stethoscope, HeartHandshake, Edit2, Save, X,
  ShieldCheck, Info,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card, PageHeader, Badge, SectionTitle } from '@/components/ui';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/medUtils';
import type { PatientProfile } from '@/types';

export default function MyProfile() {
  const { profile, setProfile, medications, reports } = useData();
  const notify = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState<PatientProfile>(profile);

  function save() {
    setProfile(form);
    setEditOpen(false);
    notify('Profile updated successfully.', 'success');
  }

  return (
    <div>
      <PageHeader
        title="My Profile"
        subtitle="Your patient details, emergency contacts and caregiver information."
        actions={
          <button onClick={() => { setForm(profile); setEditOpen(true); }} className="btn btn-primary">
            <Edit2 className="h-4 w-4" /> Edit Profile
          </button>
        }
      />

      {/* Profile header */}
      <Card className="mb-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-100 text-2xl font-bold text-primary-700 dark:bg-primary-700/20 dark:text-primary-400">
            {profile.fullName.charAt(0)}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{profile.fullName}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Patient ID: {profile.patientId}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
              {profile.conditions.map((c) => <Badge key={c} variant="warning">{c}</Badge>)}
              {profile.allergies.map((a) => <Badge key={a} variant="error">Allergy: {a}</Badge>)}
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/patient-file" className="btn btn-outline btn-sm"><FolderHeart className="h-4 w-4" /> Patient File</Link>
            <Link to="/reports" className="btn btn-outline btn-sm"><FileText className="h-4 w-4" /> Reports</Link>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Basic details */}
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-primary-500" />
            <SectionTitle>Basic Details</SectionTitle>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoRow label="Full Name" value={profile.fullName} />
            <InfoRow label="Date of Birth" value={profile.dateOfBirth ? formatDate(profile.dateOfBirth) : ''} />
            <InfoRow label="Age" value={profile.age} />
            <InfoRow label="Gender" value={profile.gender} />
            <InfoRow label="Blood Group" value={profile.bloodGroup} />
            <InfoRow label="Phone" value={profile.phone} />
            <InfoRow label="Email" value={profile.email} />
            <InfoRow label="Address" value={profile.address} />
          </div>
        </Card>

        {/* Emergency contacts */}
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Phone className="h-5 w-5 text-error-500" />
            <SectionTitle>Emergency Contacts</SectionTitle>
          </div>
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
        </Card>

        {/* Allergies & conditions */}
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning-500" />
            <SectionTitle>Allergies & Conditions</SectionTitle>
          </div>
          <div className="space-y-3">
            <div>
              <p className="label">Allergies</p>
              {profile.allergies.length === 0 ? <p className="text-sm text-gray-500 dark:text-gray-400">Not provided</p> : (
                <div className="flex flex-wrap gap-2">{profile.allergies.map((a) => <Badge key={a} variant="error">{a}</Badge>)}</div>
              )}
            </div>
            <div>
              <p className="label">Conditions</p>
              {profile.conditions.length === 0 ? <p className="text-sm text-gray-500 dark:text-gray-400">Not provided</p> : (
                <div className="flex flex-wrap gap-2">{profile.conditions.map((c) => <Badge key={c} variant="warning">{c}</Badge>)}</div>
              )}
            </div>
            <div>
              <p className="label">Medical Alerts</p>
              {profile.medicalAlerts.length === 0 ? <p className="text-sm text-gray-500 dark:text-gray-400">Not provided</p> : (
                <p className="text-sm text-gray-700 dark:text-gray-300">{profile.medicalAlerts.join('; ')}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Current medications */}
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Pill className="h-5 w-5 text-primary-500" />
            <SectionTitle>Current Medications</SectionTitle>
          </div>
          {medications.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No medications added.</p>
          ) : (
            <div className="space-y-2">
              {medications.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-xl border border-gray-100 p-3 dark:border-slate-800">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{m.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{m.dosage} {m.unit} · {m.frequency}</p>
                  </div>
                  <Badge variant={m.quantity <= m.lowStockThreshold ? 'error' : 'success'}>{m.quantity} {m.unit}</Badge>
                </div>
              ))}
            </div>
          )}
          <Link to="/medications" className="mt-3 inline-flex items-center gap-1 text-sm text-primary-600 hover:underline dark:text-primary-400">Manage medications →</Link>
        </Card>

        {/* Healthcare provider (sample) */}
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-secondary-500" />
            <SectionTitle>Healthcare Provider</SectionTitle>
            <Badge variant="info">Sample</Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoRow label="Provider" value={profile.providerName} />
            <InfoRow label="Specialty" value={profile.providerSpecialty} />
            <InfoRow label="Phone" value={profile.providerPhone} />
            <InfoRow label="Hospital" value={profile.hospitalName} />
            <InfoRow label="Hospital Address" value={profile.hospitalAddress} />
          </div>
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-secondary-50 p-3 text-xs text-secondary-700 dark:bg-secondary-700/10 dark:text-secondary-400">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p>Sample provider and hospital information for demonstration. This app does not integrate with real healthcare providers.</p>
          </div>
        </Card>

        {/* Caregiver */}
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <HeartHandshake className="h-5 w-5 text-accent-500" />
            <SectionTitle>Caregiver Information</SectionTitle>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoRow label="Caregiver Name" value={profile.caregiverName} />
            <InfoRow label="Caregiver Phone" value={profile.caregiverPhone} />
          </div>
        </Card>

        {/* Report history */}
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-secondary-500" />
              <SectionTitle>Report History</SectionTitle>
            </div>
            <Link to="/reports" className="text-sm text-primary-600 hover:underline dark:text-primary-400">View all</Link>
          </div>
          {reports.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No reports generated yet.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {reports.slice(0, 6).map((r) => (
                <Link key={r.id} to="/reports" className="rounded-xl border border-gray-100 p-3 hover:bg-gray-50 dark:border-slate-800 dark:hover:bg-slate-800">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{r.type}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(r.generatedDate)}</p>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Edit modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile" size="lg"
        footer={<><button onClick={() => setEditOpen(false)} className="btn btn-outline">Cancel</button><button onClick={save} className="btn btn-primary"><Save className="h-4 w-4" /> Save</button></>}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Full Name *</label><input className="input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
          <div><label className="label">Date of Birth</label><input type="date" className="input" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} /></div>
          <div><label className="label">Age</label><input className="input" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} /></div>
          <div><label className="label">Gender</label><input className="input" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} /></div>
          <div><label className="label">Blood Group</label><input className="input" value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} /></div>
          <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="sm:col-span-2"><label className="label">Email</label><input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div className="sm:col-span-2"><label className="label">Address</label><input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          <div className="sm:col-span-2"><label className="label">Allergies (comma-separated)</label><input className="input" value={form.allergies.join(', ')} onChange={(e) => setForm({ ...form, allergies: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} /></div>
          <div className="sm:col-span-2"><label className="label">Conditions (comma-separated)</label><input className="input" value={form.conditions.join(', ')} onChange={(e) => setForm({ ...form, conditions: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} /></div>
          <div className="sm:col-span-2"><label className="label">Medical Alerts (semicolon-separated)</label><input className="input" value={form.medicalAlerts.join('; ')} onChange={(e) => setForm({ ...form, medicalAlerts: e.target.value.split(';').map((s) => s.trim()).filter(Boolean) })} /></div>
          <div><label className="label">Provider Name</label><input className="input" value={form.providerName} onChange={(e) => setForm({ ...form, providerName: e.target.value })} /></div>
          <div><label className="label">Provider Phone</label><input className="input" value={form.providerPhone} onChange={(e) => setForm({ ...form, providerPhone: e.target.value })} /></div>
          <div><label className="label">Caregiver Name</label><input className="input" value={form.caregiverName} onChange={(e) => setForm({ ...form, caregiverName: e.target.value })} /></div>
          <div><label className="label">Caregiver Phone</label><input className="input" value={form.caregiverPhone} onChange={(e) => setForm({ ...form, caregiverPhone: e.target.value })} /></div>
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
