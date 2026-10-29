import { useState } from 'react';
import { Package, Plus, Minus, AlertTriangle, TrendingDown, CalendarDays, RefreshCw, Save, Pill } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card, PageHeader, Badge, EmptyState, SectionTitle } from '@/components/ui';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { estimateSupply, isLowStock, formatDate, uid, refillHistoryForMed } from '@/lib/medUtils';
import type { Medication, RefillEvent } from '@/types';

export default function Inventory() {
  const { medications, updateMedication, refills, addRefill } = useData();
  const notify = useToast();
  const [updateMed, setUpdateMed] = useState<Medication | null>(null);
  const [newQty, setNewQty] = useState(0);
  const [refillType, setRefillType] = useState<'refill' | 'purchase' | 'update'>('refill');

  function openUpdate(med: Medication) {
    setUpdateMed(med);
    setNewQty(med.quantity);
    setRefillType('refill');
  }

  function handleSave() {
    if (!updateMed) return;
    const diff = newQty - updateMed.quantity;
    updateMedication({ ...updateMed, quantity: newQty });
    const event: RefillEvent = {
      id: uid('refill-'),
      medicationId: updateMed.id,
      medicationName: updateMed.name,
      date: new Date().toISOString().split('T')[0],
      quantity: Math.abs(diff),
      type: refillType,
    };
    addRefill(event);
    notify(`Stock updated for ${updateMed.name}.`, 'success');
    setUpdateMed(null);
  }

  return (
    <div>
      <PageHeader title="Medicine Inventory" subtitle="Track medicine stock, expiry dates and refill history. Estimates are approximations." />

      <div className="grid gap-4 lg:grid-cols-4">
        <StatBox label="Total Medicines" value={medications.length} icon={<Pill className="h-5 w-5" />} color="text-primary-600" />
        <StatBox label="Low Stock" value={medications.filter(isLowStock).length} icon={<AlertTriangle className="h-5 w-5" />} color="text-warning-500" />
        <StatBox label="Expiring Soon (90d)" value={medications.filter((m) => m.expiryDate && (new Date(m.expiryDate).getTime() - Date.now()) / 86400000 < 90).length} icon={<CalendarDays className="h-5 w-5" />} color="text-error-500" />
        <StatBox label="Refill Events" value={refills.length} icon={<RefreshCw className="h-5 w-5" />} color="text-secondary-500" />
      </div>

      {medications.length === 0 ? (
        <div className="mt-6"><EmptyState icon={<Package className="h-10 w-10" />} title="No medicines in inventory" message="Add a medication to start tracking stock." /></div>
      ) : (
        <div className="mt-6 space-y-4">
          {medications.map((med) => {
            const est = estimateSupply(med);
            const low = isLowStock(med);
            const history = refillHistoryForMed(refills, med.id);
            return (
              <Card key={med.id}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${low ? 'bg-error-100 text-error-600 dark:bg-error-700/20' : 'bg-primary-100 text-primary-600 dark:bg-primary-700/20'}`}>
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{med.name}</h3>
                        {low && <Badge variant="error">Low Stock</Badge>}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{med.dosage} {med.unit} · {med.pharmacy || 'No pharmacy recorded'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Metric label="Current Stock" value={`${med.quantity} ${med.unit}`} icon={<Package className="h-3 w-3" />} />
                    <Metric label="Per Dose" value={`${med.quantityPerDose}`} icon={<TrendingDown className="h-3 w-3" />} />
                    <Metric label="Est. Supply" value={est ? `${est.daysRemaining} days` : 'N/A'} icon={<CalendarDays className="h-3 w-3" />} />
                    <Metric label="Est. Run-Out" value={est ? formatDate(est.runOutDate) : 'N/A'} icon={<CalendarDays className="h-3 w-3" />} />
                  </div>
                  <button onClick={() => openUpdate(med)} className="btn btn-primary btn-sm whitespace-nowrap">
                    <RefreshCw className="h-3 w-3" /> Update Stock
                  </button>
                </div>
                {med.expiryDate && (
                  <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">Expiry: {formatDate(med.expiryDate)}</p>
                )}
                {history.length > 0 && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-xs font-medium text-primary-600 hover:underline dark:text-primary-400">Refill history ({history.length})</summary>
                    <div className="mt-2 space-y-1">
                      {history.map((h) => (
                        <div key={h.id} className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Plus className="h-3 w-3" /> {formatDate(h.date)} — {h.quantity} {med.unit} ({h.type})
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={!!updateMed} onClose={() => setUpdateMed(null)} title={`Update Stock — ${updateMed?.name || ''}`}
        footer={<>
          <button onClick={() => setUpdateMed(null)} className="btn btn-outline">Cancel</button>
          <button onClick={handleSave} className="btn btn-primary"><Save className="h-4 w-4" /> Save</button>
        </>}
      >
        {updateMed && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-xl bg-gray-50 p-3 text-sm dark:bg-slate-800">
              <span className="text-gray-600 dark:text-gray-400">Current stock:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{updateMed.quantity} {updateMed.unit}</span>
            </div>
            <div>
              <label className="label">New Stock Quantity</label>
              <div className="flex items-center gap-2">
                <button onClick={() => setNewQty(Math.max(0, newQty - 1))} className="btn btn-outline btn-sm"><Minus className="h-4 w-4" /></button>
                <input type="number" min={0} className="input flex-1" value={newQty} onChange={(e) => setNewQty(Math.max(0, parseInt(e.target.value) || 0))} />
                <button onClick={() => setNewQty(newQty + 1)} className="btn btn-outline btn-sm"><Plus className="h-4 w-4" /></button>
              </div>
            </div>
            <div>
              <label className="label">Event Type</label>
              <select className="input" value={refillType} onChange={(e) => setRefillType(e.target.value as typeof refillType)}>
                <option value="refill">Refill</option>
                <option value="purchase">Purchase</option>
                <option value="update">Stock Correction</option>
              </select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function StatBox({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <Card className="flex items-center gap-3">
      <div className={color}>{icon}</div>
      <div><p className="text-xs text-gray-500 dark:text-gray-400">{label}</p><p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p></div>
    </Card>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-slate-800">
      <p className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">{icon} {label}</p>
      <p className="text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}
