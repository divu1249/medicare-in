import { WifiOff, Download, CheckCircle2, FileText, ChevronRight, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Card, PageHeader, Badge } from '@/components/ui';

const offlinePackages = [
  { id: 1, title: 'Basic First Aid & CPR', size: '2.4 MB', updated: 'Today', status: 'downloaded' },
  { id: 2, title: 'Cardiac & Stroke Protocols', size: '1.8 MB', updated: 'Oct 15', status: 'downloaded' },
  { id: 3, title: 'Snakebites & Poisoning (India)', size: '1.1 MB', updated: 'Oct 10', status: 'downloaded' },
  { id: 4, title: 'Travel Mode: Remote Himalayas', size: '4.5 MB', updated: '-', status: 'available' },
];

export default function EmergencyGuide() {
  return (
    <div className="space-y-6 pb-20 sm:pb-6">
      <PageHeader 
        title="Offline Emergency Guide" 
        subtitle="Board-certified emergency protocols cached locally on your device for zero-network environments."
      />

      <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-950/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <WifiOff className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Offline Mode Ready
                <Badge variant="success">Active</Badge>
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Your device has 3 secured emergency packages available without an internet connection.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> Downloaded Packages
          </h3>
          {offlinePackages.filter(p => p.status === 'downloaded').map(pkg => (
            <Card key={pkg.id} className="flex items-center justify-between p-4 hover:border-emerald-300 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{pkg.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{pkg.size} • Updated {pkg.updated}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Download className="h-4 w-4" /> Available for Travel
          </h3>
          {offlinePackages.filter(p => p.status === 'available').map(pkg => (
            <Card key={pkg.id} className="flex items-center justify-between p-4 border-dashed border-2 hover:border-slate-400 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{pkg.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{pkg.size} • Tap to download</p>
                </div>
              </div>
              <Download className="h-5 w-5 text-slate-400" />
            </Card>
          ))}

          <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30 mt-6">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-amber-800 dark:text-amber-500">Storage Notice</h4>
                <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-1">
                  Offline packages are stored securely in your browser's IndexedDB. Clearing your browser cache will remove downloaded protocols.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}