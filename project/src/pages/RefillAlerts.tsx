import { useState } from 'react';
import { AlertTriangle, CheckCircle2, BellOff, ShoppingCart, RefreshCw, Package, CalendarClock, Info } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card, PageHeader, Badge, EmptyState, SectionTitle } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { getRefillAlerts, formatDate, uid } from '@/lib/medUtils';
import type { RefillEvent } from '@/types';

export default function RefillAlerts() {
  const { medications, updateMedication, refills, addRefill } = useData();
  const notify = useToast();
  const alerts = getRefillAlerts(medications);
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({});
  const [snoozed, setSnoozed] = useState<Record<string, number>>({});
  const [refillOpen, setRefillOpen] = useState<string | null>(null);
  const [refillQty, setRefillQty] = useState(0);

  const activeAlerts = alerts.filter((a) => !dismissed[a.med.id] && (!snoozed[a.med.id] || snoozed[a.med.id] < Date.now()));

  function dismiss(id: string) {
    setDismissed({ ...dismissed, [id]: true });
    notify('Alert dismissed.', 'info');
  }

  function snooze(id: string) {
    setSnoozed({ ...snoozed, [id]: Date.now() + 3600000 });
    notify('Alert snoozed for 1 hour.', 'info');
  }

  function openRefill(medId: string) {
    const med = medications.find((m) => m.id === medId);
    if (med) setRefillQty(med.quantity + 30);
    setRefillOpen(medId);
  }

  function handleRefill() {
    if (!refillOpen) return;
    const med = medications.find((m) => m.id === refillOpen);
    if (!med) return;
    updateMedication({ ...med, quantity: refillQty });
    const event: RefillEvent = {
      id: uid('refill-'),
      medicationId: med.id,
      medicationName: med.name,
      date: new Date().toISOString().split('T')[0],
      quantity: refillQty - med.quantity,
      type: 'refill',
    };
    addRefill(event);
    setDismissed({ ...dismissed, [med.id]: false });
    setSnoozed({ ...snoozed, [med.id]: 0 });
    notify(`${med.name} refilled to ${refillQty} ${med.unit}.`, 'success');
    setRefillOpen(null);
  }

  return (
    <div>
      <PageHeader title="Refill Alerts" subtitle="Never run out of essential medicines. Estimates are approximate and not medical instructions." />

      <div className="mb-4 flex items-start gap-2 rounded-xl bg-secondary-50 p-3 text-xs text-secondary-700 dark:bg-secondary-700/10 dark:text-secondary-400">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>Supply estimates assume you take medicines exactly as scheduled. Actual usage may differ. This app does not recommend substitute medicines.</p>
      </div>

      {activeAlerts.length === 0 ? (
        <EmptyState icon={<CheckCircle2 className="h-10 w-10" />} title="All medicines well stocked" message="No refill alerts at this time. Check back as your stock decreases." />
      ) : (
        <div className="space-y-4">
          {activeAlerts.map((a) => (
            <Card key={a.med.id} className="border-warning-200 dark:border-warning-700/50">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning-100 text-warning-600 dark:bg-warning-700/20">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{a.med.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{a.med.dosage} {a.med.unit} · Current: {a.med.quantity} {a.med.unit}</p>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs">
                      <Badge variant={a.daysRemaining <= 2 ? 'error' : 'warning'}>
                        <CalendarClock className="h-3 w-3" /> ~{a.daysRemaining} days left
                      </Badge>
                      <Badge variant="neutral">Run-out: {formatDate(a.runOutDate)}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Your medicine stock is low. Approximately {a.daysRemaining} days of supply remain. Please arrange a refill before {formatDate(a.runOutDate)}.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => openRefill(a.med.id)} className="btn btn-primary btn-sm">
                    <ShoppingCart className="h-3 w-3" /> Mark as Refilled
                  </button>
                  <button onClick={() => snooze(a.med.id)} className="btn btn-ghost btn-sm">
                    <BellOff className="h-3 w-3" /> Snooze
                  </button>
                  <button onClick={() => dismiss(a.med.id)} className="btn btn-ghost btn-sm">
                    Dismiss
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Refill history */}
      <Card className="mt-6">
        <SectionTitle className="mb-3">Refill & Purchase History</SectionTitle>
        {refills.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No refill events recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs text-gray-500 dark:border-slate-700">
                  <th className="pb-2 pr-4 font-medium">Date</th>
                  <th className="pb-2 pr-4 font-medium">Medicine</th>
                  <th className="pb-2 pr-4 font-medium">Quantity</th>
                  <th className="pb-2 font-medium">Type</th>
                </tr>
              </thead>
              <tbody>
                {[...refills].sort((a, b) => b.date.localeCompare(a.date)).map((r) => (
                  <tr key={r.id} className="border-b border-gray-100 dark:border-slate-800">
                    <td className="py-2 pr-4 text-gray-600 dark:text-gray-400">{formatDate(r.date)}</td>
                    <td className="py-2 pr-4 text-gray-900 dark:text-white">{r.medicationName}</td>
                    <td className="py-2 pr-4 text-gray-600 dark:text-gray-400">{r.quantity}</td>
                    <td className="py-2"><Badge variant={r.type === 'purchase' ? 'info' : 'primary'}>{r.type}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Refill modal */}
      {refillOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 no-print">
          <div className="absolute inset-0 bg-black/50" onClick={() => setRefillOpen(null)} />
          <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Record Refill</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Enter the new total stock quantity after refill.</p>
            <div className="mt-4">
              <label className="label">New Stock Quantity</label>
              <input type="number" min={0} className="input" value={refillQty} onChange={(e) => setRefillQty(Math.max(0, parseInt(e.target.value) || 0))} />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setRefillOpen(null)} className="btn btn-outline">Cancel</button>
              <button onClick={handleRefill} className="btn btn-primary"><RefreshCw className="h-4 w-4" /> Save Refill</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
