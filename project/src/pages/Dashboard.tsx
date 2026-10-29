import { Link } from 'react-router-dom';
import {
  Pill, Bell, Camera, Package, FileText, BookOpen, Siren, Shield,
  Plus, CheckCircle2, XCircle, Clock, AlertTriangle, TrendingUp,
  Calendar, Activity, RefreshCw, FolderHeart,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card, PageHeader, StatCard, SectionTitle, EmptyState, Badge } from '@/components/ui';
import {
  getTodayDoses, getAdherenceStats, getRefillAlerts, formatTime, formatDate,
  ensureTodayDoses, todayISO,
} from '@/lib/medUtils';

const quickActions = [
  { label: 'Add Medication', icon: Plus, path: '/medications', color: 'bg-primary-50 text-primary-600 dark:bg-primary-700/20 dark:text-primary-400' },
  { label: "Today's Schedule", icon: Calendar, path: '/reminders', color: 'bg-secondary-50 text-secondary-600 dark:bg-secondary-700/20 dark:text-secondary-400' },
  { label: 'Start Camera Monitoring', icon: Camera, path: '/camera-monitoring', color: 'bg-accent-50 text-accent-600 dark:bg-accent-700/20 dark:text-accent-400' },
  { label: 'Update Stock', icon: Package, path: '/inventory', color: 'bg-warning-50 text-warning-600 dark:bg-warning-700/20 dark:text-warning-400' },
  { label: 'Generate Report', icon: FileText, path: '/reports', color: 'bg-secondary-50 text-secondary-600 dark:bg-secondary-700/20 dark:text-secondary-400' },
  { label: 'Open Library', icon: BookOpen, path: '/library', color: 'bg-primary-50 text-primary-600 dark:bg-primary-700/20 dark:text-primary-400' },
  { label: 'Patient File', icon: FolderHeart, path: '/patient-file', color: 'bg-accent-50 text-accent-600 dark:bg-accent-700/20 dark:text-accent-400' },
  { label: 'Emergency Guide', icon: Shield, path: '/emergency-guide', color: 'bg-error-50 text-error-600 dark:bg-error-700/20 dark:text-error-400' },
  { label: 'Emergency Info', icon: Siren, path: '/emergency', color: 'bg-error-50 text-error-600 dark:bg-error-700/20 dark:text-error-400' },
];

const statusConfig = {
  scheduled: { label: 'Scheduled', icon: Clock, color: 'text-gray-500' },
  taken: { label: 'Taken', icon: CheckCircle2, color: 'text-success-500' },
  skipped: { label: 'Skipped', icon: XCircle, color: 'text-gray-400' },
  not_confirmed: { label: 'Not Confirmed', icon: AlertTriangle, color: 'text-warning-500' },
  missed: { label: 'Missed', icon: XCircle, color: 'text-error-500' },
};

export default function Dashboard() {
  const { profile, medications, doses, reports } = useData();
  const allDoses = ensureTodayDoses(doses, medications);
  const todayDoses = getTodayDoses(allDoses, medications);
  const adherence = getAdherenceStats(allDoses);
  const refillAlerts = getRefillAlerts(medications);
  const lowStock = medications.filter((m) => m.quantity <= m.lowStockThreshold);
  const upcoming = todayDoses.filter((d) => d.status === 'scheduled');
  const completed = todayDoses.filter((d) => d.status === 'taken');
  const missed = todayDoses.filter((d) => d.status === 'missed');
  const recentReports = reports.slice(0, 3);

  return (
    <div>
      <PageHeader
        title={`Welcome, ${profile.fullName.split(' ')[0]}`}
        subtitle={`Today is ${formatDate(todayISO())} — here is your health overview.`}
        actions={
          <Link to="/medications" className="btn btn-primary">
            <Plus className="h-4 w-4" /> Add Medication
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Today's Doses" value={todayDoses.length} icon={<Calendar className="h-5 w-5" />} accent="primary" />
        <StatCard label="Adherence Rate" value={`${adherence.rate}%`} icon={<TrendingUp className="h-5 w-5" />} accent="accent" />
        <StatCard label="Low Stock" value={lowStock.length} icon={<Package className="h-5 w-5" />} accent="warning" />
        <StatCard label="Active Medicines" value={medications.length} icon={<Pill className="h-5 w-5" />} accent="secondary" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Today's schedule */}
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <SectionTitle>Today's Medication Schedule</SectionTitle>
            <Link to="/reminders" className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-400">View all</Link>
          </div>
          {todayDoses.length === 0 ? (
            <EmptyState icon={<Bell className="h-8 w-8" />} title="No doses scheduled for today" message="Add a medication to see your schedule." />
          ) : (
            <div className="space-y-2">
              {todayDoses.map((dose) => {
                const cfg = statusConfig[dose.status];
                const StatusIcon = cfg.icon;
                return (
                  <div key={dose.id} className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-800 ${cfg.color}`}>
                        <StatusIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{dose.medicationName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{dose.dosage} · {formatTime(dose.scheduledTime)}</p>
                      </div>
                    </div>
                    <Badge variant={dose.status === 'taken' ? 'success' : dose.status === 'missed' ? 'error' : dose.status === 'skipped' ? 'neutral' : 'info'}>
                      {cfg.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-success-50 p-3 dark:bg-success-700/10">
              <p className="text-2xl font-bold text-success-600 dark:text-success-400">{completed.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
            </div>
            <div className="rounded-xl bg-secondary-50 p-3 dark:bg-secondary-700/10">
              <p className="text-2xl font-bold text-secondary-600 dark:text-secondary-400">{upcoming.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Upcoming</p>
            </div>
            <div className="rounded-xl bg-error-50 p-3 dark:bg-error-700/10">
              <p className="text-2xl font-bold text-error-600 dark:text-error-400">{missed.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Missed</p>
            </div>
          </div>
        </Card>

        {/* Quick actions + emergency */}
        <div className="space-y-6">
          <Card>
            <SectionTitle className="mb-3">Quick Actions</SectionTitle>
            <div className="grid grid-cols-3 gap-2">
              {quickActions.map((a) => {
                const Icon = a.icon;
                return (
                  <Link key={a.label} to={a.path} className="flex flex-col items-center gap-1 rounded-xl border border-gray-100 p-3 text-center transition hover:bg-gray-50 dark:border-slate-800 dark:hover:bg-slate-800">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${a.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-medium leading-tight text-gray-700 dark:text-gray-300">{a.label}</span>
                  </Link>
                );
              })}
            </div>
          </Card>
          <Card className="border-error-200 dark:border-error-700/50">
            <div className="flex items-center gap-2">
              <Siren className="h-5 w-5 text-error-500" />
              <SectionTitle>Emergency</SectionTitle>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">In a real emergency, call your local emergency number (e.g., 112 / 911 / 102).</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link to="/emergency" className="btn btn-danger btn-sm">View Info</Link>
              <Link to="/emergency-guide" className="btn btn-outline btn-sm">Download Guide</Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Inventory + adherence + reports */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <SectionTitle>Medicine Inventory</SectionTitle>
            <Link to="/inventory" className="text-sm text-primary-600 hover:underline dark:text-primary-400">Manage</Link>
          </div>
          {medications.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No medicines added yet.</p>
          ) : (
            <div className="space-y-2">
              {medications.slice(0, 4).map((m) => (
                <div key={m.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">{m.name}</span>
                  <Badge variant={m.quantity <= m.lowStockThreshold ? 'error' : 'success'}>
                    {m.quantity} {m.unit}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <SectionTitle>Refill Alerts</SectionTitle>
            <Link to="/refill-alerts" className="text-sm text-primary-600 hover:underline dark:text-primary-400">View all</Link>
          </div>
          {refillAlerts.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-success-600 dark:text-success-400">
              <CheckCircle2 className="h-4 w-4" /> All medicines well stocked.
            </div>
          ) : (
            <div className="space-y-2">
              {refillAlerts.slice(0, 3).map((a) => (
                <div key={a.med.id} className="flex items-center gap-2 rounded-xl bg-warning-50 px-3 py-2 dark:bg-warning-700/10">
                  <AlertTriangle className="h-4 w-4 text-warning-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{a.med.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">~{a.daysRemaining} days left</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <SectionTitle>Recent Reports</SectionTitle>
            <Link to="/reports" className="text-sm text-primary-600 hover:underline dark:text-primary-400">All reports</Link>
          </div>
          {recentReports.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No reports generated yet.</p>
          ) : (
            <div className="space-y-2">
              {recentReports.map((r) => (
                <Link key={r.id} to="/reports" className="flex items-center gap-2 rounded-xl border border-gray-100 px-3 py-2 hover:bg-gray-50 dark:border-slate-800 dark:hover:bg-slate-800">
                  <FileText className="h-4 w-4 text-secondary-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{r.type}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(r.generatedDate)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div className="mt-4">
            <Link to="/patient-file" className="flex items-center gap-2 rounded-xl bg-primary-50 px-3 py-2 text-sm font-medium text-primary-700 hover:bg-primary-100 dark:bg-primary-700/10 dark:text-primary-400">
              <Activity className="h-4 w-4" /> View Patient File
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
