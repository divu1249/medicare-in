import { useState } from 'react';
import { 
  Landmark, ShieldCheck, HeartHandshake, FileText, CheckCircle2, 
  RefreshCw, Search, ArrowRight, CreditCard, Activity, FileKey 
} from 'lucide-react';
import { Card, PageHeader, Badge, SectionTitle } from '@/components/ui';

export default function GovSchemes() {
  const [abhaLinked, setAbhaLinked] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleLinkAbha = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setAbhaLinked(true);
      setIsSyncing(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-20 sm:pb-6">
      <PageHeader 
        title="Gov Schemes & ABHA" 
        subtitle="National Digital Health Mission Integration. Link your ABHA ID to auto-fetch records and check PM-JAY eligibility."
      />

      {/* ABHA Linking Section */}
      <Card className={abhaLinked ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-950/10" : ""}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-4">
            <div className={`flex h-14 w-14 items-center justify-center rounded-xl shadow-sm ${abhaLinked ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'}`}>
              <Landmark className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Ayushman Bharat Health Account
                {abhaLinked ? <Badge variant="success">Linked</Badge> : <Badge variant="neutral">Not Linked</Badge>}
              </h2>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {abhaLinked ? "ABHA ID: 91-XXXX-XXXX-4321" : "Connect your 14-digit ABHA number to sync health records."}
              </p>
            </div>
          </div>
          {!abhaLinked ? (
            <button 
              onClick={handleLinkAbha}
              disabled={isSyncing}
              className="btn bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center justify-center gap-2"
            >
              {isSyncing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <FileKey className="h-4 w-4" />}
              {isSyncing ? "Authenticating..." : "Link ABHA via OTP"}
            </button>
          ) : (
            <button className="btn bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:bg-slate-900 dark:border-emerald-800 dark:text-emerald-400 shadow-sm">
              <RefreshCw className="mr-2 h-4 w-4" /> Sync Latest Records
            </button>
          )}
        </div>

        {/* Auto-Fetched Data Box (Only shows when linked) */}
        {abhaLinked && (
          <div className="grid gap-4 sm:grid-cols-2 mt-4 animate-in fade-in slide-in-from-top-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
              <h4 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                <Activity className="h-3.5 w-3.5" /> ABDM Clinical History
              </h4>
              <ul className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Type 2 Diabetes</span>
                  <span className="text-xs text-slate-400">Diagnosed 2021</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Hypertension</span>
                  <span className="text-xs text-slate-400">Active</span>
                </li>
                <li className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-500 font-bold">14 records imported to My Patient File</span>
                  <ArrowRight className="h-3 w-3 text-blue-500 cursor-pointer hover:translate-x-1 transition-transform" />
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm dark:border-amber-900/30 dark:bg-amber-950/20">
              <h4 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600">
                <HeartHandshake className="h-3.5 w-3.5" /> Verified Scheme Eligibility
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">PM-JAY (Ayushman Bharat)</p>
                    <p className="text-xs text-slate-500 mt-0.5">Eligible for ₹5 Lakh/year cashless health cover.</p>
                  </div>
                </li>
                <li className="flex items-start gap-2 pt-2 border-t border-amber-200/50 dark:border-amber-900/50">
                  <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Senior Citizen Savings Scheme</p>
                    <p className="text-xs text-slate-500 mt-0.5">Age criteria met. Discounted diagnostics available.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        )}
      </Card>

      {/* General Schemes Explorer */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
          <SectionTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-600" /> State & Central Schemes
          </SectionTitle>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input className="input pl-9 w-full" placeholder="Search by state or illness..." />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Dummy Scheme 1 */}
          <div className="flex flex-col justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-blue-300 transition-colors">
            <div>
              <div className="flex justify-between items-start mb-2">
                <Badge variant="info">Central Govt</Badge>
                <span className="text-xs font-bold text-slate-400">Apply Online</span>
              </div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">National Dialysis Programme</h4>
              <p className="text-xs text-slate-500">Free dialysis services for BPL/PM-JAY beneficiaries at district hospitals.</p>
            </div>
            <button className="mt-4 text-sm font-bold text-blue-600 flex items-center gap-1 hover:underline w-max">
              Check Nearest Facility <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Dummy Scheme 2 */}
          <div className="flex flex-col justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-blue-300 transition-colors">
            <div>
              <div className="flex justify-between items-start mb-2">
                <Badge variant="warning">Haryana State</Badge>
                <span className="text-xs font-bold text-slate-400">Offline Application</span>
              </div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Mukhya Mantri Muft Ilaj Yojana</h4>
              <p className="text-xs text-slate-500">Free surgeries, basic lab tests, and diagnostics for residents of Haryana.</p>
            </div>
            <button className="mt-4 text-sm font-bold text-blue-600 flex items-center gap-1 hover:underline w-max">
              View Required Documents <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}