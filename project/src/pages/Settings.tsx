import { useState } from 'react';
import {
  Palette, Bell, Camera, FileText, Database, Shield, AlertTriangle,
  RefreshCw, Sun, Moon, Monitor, Info, Trash2, Wifi, WifiOff,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card, PageHeader, Badge, SectionTitle, ConfirmDialog } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { getOfflineStatus, requestNotificationPermission, checkOnlineStatus } from '@/lib/offline';
import { formatDate } from '@/lib/medUtils';
import type { ThemeMode } from '@/types';

export default function Settings() {
  const { settings, updateSettings, resetDemoData } = useData();
  const notify = useToast();
  const [resetOpen, setResetOpen] = useState(false);
  const [offlineReady] = useState(getOfflineStatus());
  const online = checkOnlineStatus();

  async function enableNotifications() {
    const perm = await requestNotificationPermission();
    updateSettings({ notificationsEnabled: perm === 'granted' });
    notify(perm === 'granted' ? 'Browser notifications enabled.' : 'Notification permission denied.', perm === 'granted' ? 'success' : 'warning');
  }

  function handleReset() {
    resetDemoData();
    notify('Demo data has been reset to defaults.', 'success');
  }

  const themeOptions: { mode: ThemeMode; label: string; icon: typeof Sun }[] = [
    { mode: 'light', label: 'Light', icon: Sun },
    { mode: 'dark', label: 'Dark', icon: Moon },
    { mode: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your preferences, privacy and demo data." />

      <div className="space-y-6 max-w-3xl">
        {/* Theme */}
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary-500" />
            <SectionTitle>Theme Preferences</SectionTitle>
          </div>
          <div className="flex gap-3">
            {themeOptions.map(({ mode, label, icon: Icon }) => (
              <button key={mode} onClick={() => updateSettings({ theme: mode })}
                className={`flex flex-1 flex-col items-center gap-2 rounded-xl border-2 p-4 transition ${settings.theme === mode ? 'border-primary-500 bg-primary-50 dark:bg-primary-700/10' : 'border-gray-200 hover:border-gray-300 dark:border-slate-700'}`}>
                <Icon className={`h-6 w-6 ${settings.theme === mode ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`} />
                <span className={`text-sm font-medium ${settings.theme === mode ? 'text-primary-700 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300'}`}>{label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Reminders */}
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-secondary-500" />
            <SectionTitle>Dose Reminder Preferences</SectionTitle>
          </div>
          <div className="space-y-4">
            <ToggleRow label="Enable reminders" description="In-app reminders while the application is open." checked={settings.reminderEnabled} onChange={(v) => updateSettings({ reminderEnabled: v })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Lead Time (minutes before dose)</label>
                <input type="number" min={0} max={60} className="input" value={settings.reminderLeadMinutes} onChange={(e) => updateSettings({ reminderLeadMinutes: parseInt(e.target.value) || 0 })} />
              </div>
              <div>
                <label className="label">Snooze Duration (minutes)</label>
                <input type="number" min={1} max={60} className="input" value={settings.snoozeMinutes} onChange={(e) => updateSettings({ snoozeMinutes: parseInt(e.target.value) || 10 })} />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3 dark:bg-slate-800">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Browser Notifications</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Shows desktop notifications when permission is granted.</p>
              </div>
              {settings.notificationsEnabled ? (
                <Badge variant="success"><Bell className="h-3 w-3" /> Enabled</Badge>
              ) : (
                <button onClick={enableNotifications} className="btn btn-outline btn-sm">Enable</button>
              )}
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">Browser notifications and reminders may not run reliably when the app is closed, the browser is suspended, or the device restricts background activity.</p>
          </div>
        </Card>

        {/* Camera */}
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Camera className="h-5 w-5 text-accent-500" />
            <SectionTitle>Camera Monitoring Settings</SectionTitle>
          </div>
          <div className="space-y-4">
            <ToggleRow label="Enable camera monitoring" description="Allow camera-assisted dose monitoring on the monitoring page." checked={settings.cameraEnabled} onChange={(v) => updateSettings({ cameraEnabled: v })} />
            <div>
              <label className="label">Monitoring Window (minutes)</label>
              <input type="number" min={1} max={60} className="input w-40" value={settings.monitoringWindowMinutes} onChange={(e) => updateSettings({ monitoringWindowMinutes: parseInt(e.target.value) || 10 })} />
              <p className="mt-1 text-xs text-gray-400">Duration for which motion detection runs during a scheduled dose.</p>
            </div>
          </div>
        </Card>

        {/* Reports */}
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-secondary-500" />
            <SectionTitle>Default Report Preferences</SectionTitle>
          </div>
          <div>
            <label className="label">Default Report Type</label>
            <select className="input" value={settings.defaultReportType} onChange={(e) => updateSettings({ defaultReportType: e.target.value })}>
              <option>Complete Patient Medical Summary</option>
              <option>Medication List and Schedule</option>
              <option>Medication Adherence Report</option>
              <option>Emergency Medical Summary</option>
              <option>Medicine Inventory and Refill Report</option>
            </select>
          </div>
        </Card>

        {/* Offline */}
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-primary-500" />
            <SectionTitle>Offline Content Availability</SectionTitle>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3 dark:bg-slate-800">
              <div className="flex items-center gap-2">
                {online ? <Wifi className="h-4 w-4 text-success-500" /> : <WifiOff className="h-4 w-4 text-warning-500" />}
                <span className="text-sm font-medium text-gray-900 dark:text-white">{online ? 'Online' : 'Offline'}</span>
              </div>
              <Badge variant={offlineReady.ready ? 'success' : 'warning'}>
                {offlineReady.ready ? 'Cached' : 'Caching...'}
              </Badge>
            </div>
            {offlineReady.date && <p className="text-xs text-gray-500 dark:text-gray-400">Last cached: {formatDate(offlineReady.date.split('T')[0])}</p>}
            <p className="text-xs text-gray-400 dark:text-gray-500">Essential emergency content is bundled with the app. Browser storage may be cleared and offline content may become outdated — generate a fresh emergency PDF regularly.</p>
          </div>
        </Card>

        {/* Privacy */}
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary-500" />
            <SectionTitle>Privacy Notice</SectionTitle>
          </div>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>This prototype uses your browser's LocalStorage to persist preferences and demo records. This data stays on your device.</p>
            <p>LocalStorage and IndexedDB are NOT secure medical-record storage. Do not store real sensitive medical information in this demo.</p>
            <p>This app does not claim regulatory compliance, clinical validation, or production-grade security.</p>
            <p>Camera frames are processed locally and are never recorded, uploaded, or retained.</p>
            <p>No data is sent to any server. You can reset all demo data at any time.</p>
          </div>
        </Card>

        {/* Medical Disclaimer */}
        <Card className="border-warning-200 dark:border-warning-700/50">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning-500" />
            <SectionTitle>Medical Disclaimer</SectionTitle>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            MediCare AI is a hackathon prototype for demonstration purposes only. It is not a medical device and does not provide medical advice, diagnosis, or treatment recommendations. Always follow your doctor's prescription and consult a qualified healthcare professional for any medical concerns. In an emergency, contact your local emergency services directly.
          </p>
        </Card>

        {/* Reset data */}
        <Card className="border-error-200 dark:border-error-700/50">
          <div className="mb-4 flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-error-500" />
            <SectionTitle>Reset Demo Data</SectionTitle>
          </div>
          <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">This will restore all medications, doses, refills, reports and settings to their default demo values. All your changes will be lost.</p>
          <button onClick={() => setResetOpen(true)} className="btn btn-danger">
            <RefreshCw className="h-4 w-4" /> Reset All Demo Data
          </button>
        </Card>
      </div>

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={handleReset}
        title="Reset all demo data?"
        message="This will erase all your changes and restore default demo data. This cannot be undone."
        confirmLabel="Reset Everything"
        danger
      />
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3 dark:bg-slate-800">
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-primary-600' : 'bg-gray-300 dark:bg-slate-600'}`}
        role="switch"
        aria-checked={checked}
        aria-label={label}
      >
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${checked ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  );
}
