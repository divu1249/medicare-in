import { useState, useMemo, useEffect } from 'react';
import {
  CheckCircle2, XCircle, Clock, AlertTriangle, Bell, BellOff,
  Calendar, TrendingUp, Pill, RefreshCw, Info,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { useData } from '@/context/DataContext';
import { Card, PageHeader, Badge, EmptyState, SectionTitle } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import {
  ensureTodayDoses, getDosesForDate, getAdherenceStats, formatTime, formatDate, todayISO,
} from '@/lib/medUtils';
import type { DoseStatus } from '@/types';
import { requestNotificationPermission, showBrowserNotification } from '@/lib/offline';

const statusConfig: Record<DoseStatus, { label: string; icon: typeof Clock; variant: 'neutral' | 'success' | 'warning' | 'error' | 'info' }> = {
  scheduled: { label: 'Scheduled', icon: Clock, variant: 'info' },
  taken: { label: 'Taken', icon: CheckCircle2, variant: 'success' },
  skipped: { label: 'Skipped', icon: XCircle, variant: 'neutral' },
  not_confirmed: { label: 'Not Confirmed', icon: AlertTriangle, variant: 'warning' },
  missed: { label: 'Missed', icon: XCircle, variant: 'error' },
};

export default function DoseReminders() {
  const { doses, medications, setDoseStatus, settings, updateSettings } = useData();
  const notify = useToast();
  const allDoses = ensureTodayDoses(doses, medications);
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const dayDoses = getDosesForDate(allDoses, medications, selectedDate);
  const adherence = getAdherenceStats(allDoses);
  const [snoozed, setSnoozed] = useState<Record<string, number>>({});

  // Check for due reminders
  useEffect(() => {
    if (!settings.reminderEnabled) return;
    const check = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      dayDoses.forEach((d) => {
        if (d.status === 'scheduled' && d.scheduledTime <= currentTime && !snoozed[d.id]) {
          showBrowserNotification('MediCare AI Reminder', `Time to take ${d.medicationName} (${d.dosage})`);
        }
      });
    };
    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, [dayDoses, settings.reminderEnabled, snoozed]);

  // Auto-mark missed doses (past days that remained scheduled)
  useEffect(() => {
    allDoses.forEach((d) => {
      if (d.status === 'scheduled' && d.scheduledDate < todayISO()) {
        setDoseStatus(d.id, 'missed');
      }
    });
  }, [allDoses, setDoseStatus]);

  const chartData = useMemo(() => {
    const last7: { date: string; taken: number; missed: number; skipped: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = todayISO(-i);
      const dayD = allDoses.filter((x) => x.scheduledDate === d);
      last7.push({
        date: new Date(d + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short' }),
        taken: dayD.filter((x) => x.status === 'taken').length,
        missed: dayD.filter((x) => x.status === 'missed').length,
        skipped: dayD.filter((x) => x.status === 'skipped').length,
      });
    }
    return last7;
  }, [allDoses]);

  const pieData = [
    { name: 'Taken', value: adherence.taken, color: '#16a34a' },
    { name: 'Skipped', value: adherence.skipped, color: '#9ca3af' },
    { name: 'Missed', value: adherence.missed, color: '#dc2626' },
  ].filter((d) => d.value > 0);

  async function enableNotifications() {
    const perm = await requestNotificationPermission();
    if (perm === 'granted') {
      updateSettings({ notificationsEnabled: true });
      notify('Browser notifications enabled.', 'success');
    } else {
      notify('Notification permission denied. In-app reminders remain available.', 'warning');
    }
  }

  function handleSnooze(doseId: string) {
    setSnoozed({ ...snoozed, [doseId]: Date.now() + settings.snoozeMinutes * 60000 });
    notify(`Reminder snoozed for ${settings.snoozeMinutes} minutes.`, 'info');
  }

  function handleStatus(doseId: string, status: DoseStatus) {
    setDoseStatus(doseId, status);
    notify(`Dose marked as ${statusConfig[status].label.toLowerCase()}.`, 'success');
  }

  return (
    <div>
      <PageHeader
        title="Dose Reminders & Adherence"
        subtitle="Track your daily medication schedule and view your adherence statistics."
        actions={
          settings.notificationsEnabled ? (
            <Badge variant="success"><Bell className="h-3 w-3" /> Notifications On</Badge>
          ) : (
            <button onClick={enableNotifications} className="btn btn-outline">
              <Bell className="h-4 w-4" /> Enable Notifications
            </button>
          )
        }
      />

      {/* Limitations notice */}
      <div className="mb-6 flex items-start gap-2 rounded-xl bg-secondary-50 p-3 text-xs text-secondary-700 dark:bg-secondary-700/10 dark:text-secondary-400">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>Browser notifications and reminders may not run reliably when the app is closed, the browser is suspended, or the device restricts background activity. Keep the app open for reminders to work.</p>
      </div>

      {/* Adherence stats */}
      <div className="grid gap-4 lg:grid-cols-4">
        <StatBox label="Adherence Rate" value={`${adherence.rate}%`} icon={<TrendingUp className="h-5 w-5" />} color="text-primary-600" />
        <StatBox label="Doses Taken" value={adherence.taken} icon={<CheckCircle2 className="h-5 w-5" />} color="text-success-500" />
        <StatBox label="Doses Missed" value={adherence.missed} icon={<XCircle className="h-5 w-5" />} color="text-error-500" />
        <StatBox label="Doses Skipped" value={adherence.skipped} icon={<AlertTriangle className="h-5 w-5" />} color="text-gray-400" />
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle className="mb-4">Last 7 Days Adherence</SectionTitle>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-20" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="taken" stackId="a" fill="#16a34a" name="Taken" />
              <Bar dataKey="skipped" stackId="a" fill="#9ca3af" name="Skipped" />
              <Bar dataKey="missed" stackId="a" fill="#dc2626" name="Missed" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SectionTitle className="mb-4">Overall Distribution</SectionTitle>
          {pieData.length === 0 ? (
            <EmptyState title="No data yet" message="Record doses to see distribution." />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {pieData.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Date selector */}
      <Card className="mt-6">
        <div className="flex items-center justify-between">
          <SectionTitle>Dose Timeline</SectionTitle>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <input type="date" className="input w-auto" value={selectedDate} max={todayISO()} onChange={(e) => setSelectedDate(e.target.value)} />
          </div>
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{formatDate(selectedDate)}</p>

        {dayDoses.length === 0 ? (
          <div className="mt-4">
            <EmptyState icon={<Pill className="h-8 w-8" />} title="No doses scheduled" message="Add a medication to see scheduled doses here." />
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {dayDoses.map((dose) => {
              const cfg = statusConfig[dose.status];
              const StatusIcon = cfg.icon;
              return (
                <div key={dose.id} className="flex flex-col gap-3 rounded-xl border border-gray-100 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-slate-800">
                      <StatusIcon className={`h-5 w-5 ${cfg.variant === 'success' ? 'text-success-500' : cfg.variant === 'error' ? 'text-error-500' : cfg.variant === 'warning' ? 'text-warning-500' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 dark:text-white">{dose.medicationName}</p>
                        <Badge variant={cfg.variant}>{cfg.label}</Badge>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{dose.dosage} · {formatTime(dose.scheduledTime)}{dose.confirmedAt ? ` · Confirmed ${new Date(dose.confirmedAt).toLocaleTimeString()}` : ''}</p>
                    </div>
                  </div>
                  {dose.status === 'scheduled' && (
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => handleStatus(dose.id, 'taken')} className="btn btn-primary btn-sm"><CheckCircle2 className="h-3 w-3" /> Taken</button>
                      <button onClick={() => handleStatus(dose.id, 'skipped')} className="btn btn-outline btn-sm"><XCircle className="h-3 w-3" /> Skip</button>
                      <button onClick={() => handleSnooze(dose.id)} className="btn btn-ghost btn-sm"><RefreshCw className="h-3 w-3" /> Snooze</button>
                    </div>
                  )}
                  {dose.status !== 'scheduled' && (
                    <button onClick={() => handleStatus(dose.id, 'scheduled')} className="btn btn-ghost btn-sm">Reset</button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Reminder prefs */}
      <Card className="mt-6">
        <SectionTitle className="mb-3">Reminder Preferences</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Reminders</label>
            <button onClick={() => updateSettings({ reminderEnabled: !settings.reminderEnabled })} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${settings.reminderEnabled ? 'border-success-200 bg-success-50 text-success-700 dark:border-success-700/50 dark:bg-success-700/10 dark:text-success-400' : 'border-gray-200 text-gray-600 dark:border-slate-700 dark:text-gray-400'}`}>
              {settings.reminderEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
              {settings.reminderEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
          <div>
            <label className="label">Lead Time (minutes)</label>
            <input type="number" min={0} max={60} className="input" value={settings.reminderLeadMinutes} onChange={(e) => updateSettings({ reminderLeadMinutes: parseInt(e.target.value) || 0 })} />
          </div>
          <div>
            <label className="label">Snooze (minutes)</label>
            <input type="number" min={1} max={60} className="input" value={settings.snoozeMinutes} onChange={(e) => updateSettings({ snoozeMinutes: parseInt(e.target.value) || 10 })} />
          </div>
        </div>
      </Card>
    </div>
  );
}

function StatBox({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <Card className="flex items-center gap-3">
      <div className={`${color}`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </Card>
  );
}
