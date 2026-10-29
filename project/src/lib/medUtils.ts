import type { Medication, DoseRecord, RefillEvent } from '@/types';

export function todayISO(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

export function formatDate(iso: string): string {
  if (!iso) return 'Not provided';
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''));
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatTime(t: string): string {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

export function daysBetween(a: string, b: string): number {
  const d1 = new Date(a + 'T00:00:00').getTime();
  const d2 = new Date(b + 'T00:00:00').getTime();
  return Math.round((d2 - d1) / 86400000);
}

export function estimateSupply(med: Medication): { daysRemaining: number; runOutDate: string } | null {
  const dosesPerDay = med.times.length || 1;
  const usedPerDay = med.quantityPerDose * dosesPerDay;
  if (usedPerDay <= 0 || med.quantity <= 0) return null;
  const daysRemaining = Math.floor(med.quantity / usedPerDay);
  const runOut = new Date();
  runOut.setDate(runOut.getDate() + daysRemaining);
  return { daysRemaining, runOutDate: runOut.toISOString().split('T')[0] };
}

export function isLowStock(med: Medication): boolean {
  return med.quantity <= med.lowStockThreshold;
}

export function getAdherenceStats(doses: DoseRecord[]): { rate: number; taken: number; total: number; missed: number; skipped: number } {
  const past = doses.filter((d) => d.status !== 'scheduled' || d.scheduledDate < todayISO());
  const total = past.length || 1;
  const taken = past.filter((d) => d.status === 'taken').length;
  const missed = past.filter((d) => d.status === 'missed').length;
  const skipped = past.filter((d) => d.status === 'skipped').length;
  return { rate: Math.round((taken / total) * 100), taken, total, missed, skipped };
}

export function getTodayDoses(doses: DoseRecord[], medications: Medication[]): DoseRecord[] {
  const today = todayISO();
  const medIds = new Set(medications.map((m) => m.id));
  return doses
    .filter((d) => d.scheduledDate === today && medIds.has(d.medicationId))
    .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
}

export function getRefillAlerts(medications: Medication[]): { med: Medication; daysRemaining: number; runOutDate: string }[] {
  const alerts: { med: Medication; daysRemaining: number; runOutDate: string }[] = [];
  medications.forEach((med) => {
    if (isLowStock(med)) {
      const est = estimateSupply(med);
      alerts.push({ med, daysRemaining: est?.daysRemaining ?? 0, runOutDate: est?.runOutDate ?? 'Unknown' });
    }
  });
  return alerts.sort((a, b) => a.daysRemaining - b.daysRemaining);
}

export function uid(prefix = ''): string {
  return `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getDosesForDate(doses: DoseRecord[], medications: Medication[], date: string): DoseRecord[] {
  const medIds = new Set(medications.map((m) => m.id));
  return doses
    .filter((d) => d.scheduledDate === date && medIds.has(d.medicationId))
    .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
}

export function ensureTodayDoses(doses: DoseRecord[], medications: Medication[]): DoseRecord[] {
  const today = todayISO();
  const existing = new Set(doses.filter((d) => d.scheduledDate === today).map((d) => `${d.medicationId}-${d.scheduledTime}`));
  const newDoses: DoseRecord[] = [];
  medications.forEach((med) => {
    med.times.forEach((time) => {
      const key = `${med.id}-${time}`;
      if (!existing.has(key)) {
        newDoses.push({
          id: uid('dose-'),
          medicationId: med.id,
          medicationName: med.name,
          scheduledDate: today,
          scheduledTime: time,
          dosage: `${med.dosage} ${med.unit}`,
          status: 'scheduled',
          confirmedAt: null,
          monitoringStatus: 'scheduled',
          source: 'manual',
          note: '',
        });
      }
    });
  });
  return newDoses.length > 0 ? [...doses, ...newDoses] : doses;
}

export function refillHistoryForMed(refills: RefillEvent[], medId: string): RefillEvent[] {
  return refills.filter((r) => r.medicationId === medId).sort((a, b) => b.date.localeCompare(a.date));
}
