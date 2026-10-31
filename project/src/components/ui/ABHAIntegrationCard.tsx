import { ShieldCheck, HeartHandshake, Landmark, FileText, CheckCircle2, RefreshCw } from 'lucide-react';
import { Card, Badge } from '@/components/ui'; // Adjust import path if needed

export default function ABHAIntegrationCard() {
  return (
    <Card className="border-emerald-200 bg-emerald-50/50 shadow-sm dark:border-emerald-900/30 dark:bg-emerald-950/10 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-100/50 pb-4 dark:border-emerald-900/50">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <Landmark className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Ayushman Bharat (ABHA) Sync
              <Badge variant="success">Verified</Badge>
            </h3>
            <p className="text-xs text-slate-500 font-medium">PM-JAY Scheme & ABDM Medical History Integration</p>
          </div>
        </div>
        <button className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-white px-4 py-2 text-xs font-bold text-emerald-700 shadow-sm transition-all hover:bg-emerald-50 focus:ring-2 focus:ring-emerald-500 active:scale-95 dark:border-emerald-800 dark:bg-slate-900 dark:text-emerald-400">
           <RefreshCw className="mr-2 h-3.5 w-3.5" /> Sync Health Records
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 mt-4">
        {/* Auto-Fetched Data Box */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <h4 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
            <FileText className="h-3.5 w-3.5" /> Auto-Fetched History
          </h4>
          <ul className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Type 2 Diabetes (Diagnosed 2021)</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Hypertension (Active)</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Metformin 500mg (Added to Reminders)</li>
          </ul>
        </div>

        {/* Govt Schemes Box */}
        <div className="rounded-xl border border-amber-200/80 bg-amber-50 p-4 shadow-sm dark:border-amber-900/30 dark:bg-amber-950/20">
          <h4 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600">
            <HeartHandshake className="h-3.5 w-3.5" /> Eligible Govt Schemes
          </h4>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
               <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
               <div>
                 <p className="text-sm font-bold text-slate-900 dark:text-slate-100">PM-JAY ₹5 Lakh Health Cover</p>
                 <p className="text-xs text-slate-500">Eligible. Free treatment available at 3 nearby empanelled hospitals on your map.</p>
               </div>
            </li>
          </ul>
        </div>
      </div>
    </Card>
  );
}