import { useState, useMemo } from 'react';
import {
  Plus, Search, Edit2, Trash2, Pill, Clock, Package, CalendarDays,
  FileText, AlertCircle, ScanLine,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card, PageHeader, Badge, EmptyState, ConfirmDialog } from '@/components/ui';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import type { Medication } from '@/types';
import { uid } from '@/lib/medUtils';
import { formatDate } from '@/lib/medUtils';

const emptyMed: Omit<Medication, 'id' | 'createdAt'> = {
  name: '', dosage: '', unit: 'mg', times: ['08:00'], frequency: 'Once daily',
  duration: '', instructions: '', startDate: '', endDate: '',
  quantity: 0, quantityPerDose: 1, lowStockThreshold: 10,
  expiryDate: '', notes: '', pharmacy: '',
};

export default function Medications() {
  const { medications, addMedication, updateMedication, deleteMedication } = useData();
  const notify = useToast();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterStock, setFilterStock] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Medication | null>(null);
  const [form, setForm] = useState(emptyMed);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [ocrOpen, setOcrOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = [...medications];
    if (search) list = list.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()) || m.instructions.toLowerCase().includes(search.toLowerCase()));
    if (filterStock === 'low') list = list.filter((m) => m.quantity <= m.lowStockThreshold);
    if (filterStock === 'ok') list = list.filter((m) => m.quantity > m.lowStockThreshold);
    list.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'stock') return a.quantity - b.quantity;
      if (sortBy === 'expiry') return (a.expiryDate || '9999').localeCompare(b.expiryDate || '9999');
      return 0;
    });
    return list;
  }, [medications, search, sortBy, filterStock]);

  function openAdd() {
    setEditing(null);
    setForm(emptyMed);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(med: Medication) {
    setEditing(med);
    setForm({ ...med });
    setErrors({});
    setModalOpen(true);
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Medicine name is required';
    if (!form.dosage.trim()) e.dosage = 'Dosage is required';
    if (form.times.length === 0 || form.times.some((t) => !t)) e.times = 'At least one dose time is required';
    if (form.quantity < 0) e.quantity = 'Quantity cannot be negative';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    if (editing) {
      updateMedication({ ...editing, ...form });
      notify('Medication updated successfully.', 'success');
    } else {
      addMedication({ ...form, id: uid('med-'), createdAt: new Date().toISOString() });
      notify('Medication added successfully.', 'success');
    }
    setModalOpen(false);
  }

  function handleDelete() {
    if (deleteId) {
      deleteMedication(deleteId);
      notify('Medication deleted.', 'success');
      setDeleteId(null);
    }
  }

  function updateTime(idx: number, value: string) {
    const times = [...form.times];
    times[idx] = value;
    setForm({ ...form, times });
  }
  function addTime() { setForm({ ...form, times: [...form.times, ''] }); }
  function removeTime(idx: number) { setForm({ ...form, times: form.times.filter((_, i) => i !== idx) }); }

  return (
    <div>
      <PageHeader
        title="My Medications"
        subtitle="Manage your prescribed medicines, doses and instructions. Use only information from your prescription."
        actions={
          <>
            <button onClick={() => setOcrOpen(true)} className="btn btn-outline">
              <ScanLine className="h-4 w-4" /> OCR Import
            </button>
            <button onClick={openAdd} className="btn btn-primary">
              <Plus className="h-4 w-4" /> Add Medication
            </button>
          </>
        }
      />

      {/* Search & filters */}
      <Card className="mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input className="input pl-10" placeholder="Search medicines..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input sm:w-40" value={filterStock} onChange={(e) => setFilterStock(e.target.value)}>
            <option value="all">All stock</option>
            <option value="low">Low stock</option>
            <option value="ok">Well stocked</option>
          </select>
          <select className="input sm:w-40" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Sort by name</option>
            <option value="stock">Sort by stock</option>
            <option value="expiry">Sort by expiry</option>
          </select>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState icon={<Pill className="h-10 w-10" />} title="No medications found" message="Add your first medication to get started." action={<button onClick={openAdd} className="btn btn-primary"><Plus className="h-4 w-4" /> Add Medication</button>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((med) => (
            <Card key={med.id}>
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-700/20 dark:text-primary-400">
                    <Pill className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{med.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{med.dosage} {med.unit} · {med.frequency}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(med)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-slate-800" aria-label="Edit medication">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => setDeleteId(med.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-error-600 dark:hover:bg-slate-800" aria-label="Delete medication">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Clock className="h-4 w-4 text-secondary-500" />
                  {med.times.map((t) => {
                    const [h, m] = t.split(':');
                    const hr = parseInt(h, 10);
                    const ampm = hr >= 12 ? 'PM' : 'AM';
                    const h12 = hr % 12 || 12;
                    return <span key={t} className="badge bg-secondary-100 text-secondary-700 dark:bg-secondary-700/30 dark:text-secondary-400">{h12}:{m} {ampm}</span>;
                  })}
                </div>
                {med.instructions && <p className="flex items-start gap-2 text-gray-600 dark:text-gray-400"><FileText className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />{med.instructions}</p>}
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-warning-500" />
                  <span className="text-gray-600 dark:text-gray-400">{med.quantity} {med.unit} in stock</span>
                  {med.quantity <= med.lowStockThreshold && <Badge variant="error">Low</Badge>}
                </div>
                {med.expiryDate && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <CalendarDays className="h-4 w-4 text-gray-400" />
                    Expires {formatDate(med.expiryDate)}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Medication' : 'Add Medication'}
        size="lg"
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="btn btn-outline">Cancel</button>
            <button onClick={handleSave} className="btn btn-primary">{editing ? 'Save Changes' : 'Add Medication'}</button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-xl bg-warning-50 p-3 text-xs text-warning-700 dark:bg-warning-700/10 dark:text-warning-400">
            <AlertCircle className="mb-1 inline h-4 w-4" /> Enter details exactly as prescribed. This app does not prescribe or recommend dose changes.
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Medicine Name *</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Metformin" />
              {errors.name && <p className="mt-1 text-xs text-error-500">{errors.name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label">Dosage *</label>
                <input className="input" value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} placeholder="500" />
                {errors.dosage && <p className="mt-1 text-xs text-error-500">{errors.dosage}</p>}
              </div>
              <div>
                <label className="label">Unit</label>
                <select className="input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                  <option>mg</option><option>ml</option><option>tablets</option><option>capsules</option><option>drops</option><option>units</option>
                </select>
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Frequency</label>
              <input className="input" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} placeholder="e.g., Twice daily" />
            </div>
            <div>
              <label className="label">Duration</label>
              <input className="input" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g., 30 days / Ongoing" />
            </div>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="label mb-0">Scheduled Dose Times *</label>
              <button onClick={addTime} className="text-xs font-medium text-primary-600 hover:underline dark:text-primary-400">+ Add time</button>
            </div>
            <div className="space-y-2">
              {form.times.map((t, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="time" className="input flex-1" value={t} onChange={(e) => updateTime(i, e.target.value)} />
                  {form.times.length > 1 && <button onClick={() => removeTime(i)} className="rounded-lg p-2 text-gray-400 hover:text-error-500" aria-label="Remove time"><Trash2 className="h-4 w-4" /></button>}
                </div>
              ))}
            </div>
            {errors.times && <p className="mt-1 text-xs text-error-500">{errors.times}</p>}
          </div>
          <div>
            <label className="label">Prescription Instructions</label>
            <textarea className="input" rows={2} value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} placeholder="e.g., Take after meals with water" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Quantity in Stock</label>
              <input type="number" min={0} className="input" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })} />
              {errors.quantity && <p className="mt-1 text-xs text-error-500">{errors.quantity}</p>}
            </div>
            <div>
              <label className="label">Per-Dose Quantity</label>
              <input type="number" min={0} className="input" value={form.quantityPerDose} onChange={(e) => setForm({ ...form, quantityPerDose: parseInt(e.target.value) || 1 })} />
            </div>
            <div>
              <label className="label">Low-Stock Threshold</label>
              <input type="number" min={0} className="input" value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Start Date</label>
              <input type="date" className="input" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label className="label">End Date (optional)</label>
              <input type="date" className="input" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Expiry Date (optional)</label>
              <input type="date" className="input" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
            </div>
            <div>
              <label className="label">Pharmacy / Supplier</label>
              <input className="input" value={form.pharmacy} onChange={(e) => setForm({ ...form, pharmacy: e.target.value })} placeholder="e.g., Apollo Pharmacy" />
            </div>
          </div>
          <div>
            <label className="label">Notes (optional)</label>
            <textarea className="input" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>
      </Modal>

      {/* OCR Modal */}
      <Modal open={ocrOpen} onClose={() => setOcrOpen(false)} title="OCR Import (Optional)" size="lg"
        footer={<>
          <button onClick={() => setOcrOpen(false)} className="btn btn-outline">Close</button>
          <button onClick={() => { setOcrOpen(false); openAdd(); }} className="btn btn-primary">Use Extracted Data</button>
        </>}
      >
        <OcrImport onExtract={(text) => {
          setForm({ ...emptyMed, name: text.split('\n')[0]?.slice(0, 50) || '', instructions: text.slice(0, 200) });
        }} />
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Medication?"
        message="This will remove the medication and its dose records. This action cannot be undone."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}

function OcrImport({ onExtract }: { onExtract: (text: string) => void }) {
  const [image, setImage] = useState<string | null>(null);
  const [extracted, setExtracted] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const notify = useToast();

  async function handleFile(file: File) {
    setError('');
    setExtracted('');
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function runOcr() {
    if (!image) return;
    setProcessing(true);
    setError('');
    try {
      const { default: Tesseract } = await import('tesseract.js');
      const result = await Tesseract.recognize(image, 'eng');
      setExtracted(result.data.text);
      onExtract(result.data.text);
      notify('OCR extraction complete. Please review the text carefully.', 'success');
    } catch {
      setError('OCR processing failed. You can still enter medication details manually.');
      notify('OCR failed. Please enter details manually.', 'error');
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-warning-50 p-3 text-xs text-warning-700 dark:bg-warning-700/10 dark:text-warning-400">
        <AlertCircle className="mb-1 inline h-4 w-4" /> OCR may misread medicine names, strengths and instructions. Always verify extracted text against your original prescription before saving.
      </div>
      <div>
        <label className="label">Upload prescription or medicine label image</label>
        <input type="file" accept="image/*" className="input" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </div>
      {image && (
        <div>
          <img src={image} alt="Uploaded" className="max-h-48 rounded-xl border border-gray-200 dark:border-slate-700" />
          <button onClick={runOcr} disabled={processing} className="btn btn-primary mt-3">
            <ScanLine className="h-4 w-4" /> {processing ? 'Processing...' : 'Extract Text'}
          </button>
        </div>
      )}
      {error && <p className="text-sm text-error-500">{error}</p>}
      {extracted && (
        <div>
          <label className="label">Extracted Text (review and correct)</label>
          <textarea className="input" rows={6} value={extracted} onChange={(e) => { setExtracted(e.target.value); onExtract(e.target.value); }} />
        </div>
      )}
    </div>
  );
}
