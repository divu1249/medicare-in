import { Building, Users, Activity, TrendingUp, IndianRupee, Cpu, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, PageHeader, Badge, SectionTitle, StatCard } from '@/components/ui';

const b2bClients = [
  { name: 'Max Healthcare (Saket)', patients: 1245, adherence: '88%', status: 'Active', mrr: '₹15,000', apiCalls: '45.2K' },
  { name: 'Apollo Spectra', patients: 850, adherence: '92%', status: 'Active', mrr: '₹15,000', apiCalls: '28.1K' },
  { name: 'Fortis Escorts', patients: 2100, adherence: '85%', status: 'Warning', mrr: '₹25,000', apiCalls: '89.0K' },
  { name: 'ADGIPS Wellness Dept', patients: 450, adherence: '78%', status: 'Onboarding', mrr: '₹5,000', apiCalls: '12.4K' },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6 pb-20 sm:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Building className="h-6 w-6 text-emerald-600" />
            MediGuard Enterprise Console
          </h1>
          <p className="mt-1 text-sm text-slate-500">B2B SaaS Revenue & API Telemetry (Mock Data for Hackathon)</p>
        </div>
        <Badge variant="primary">Superadmin Access</Badge>
      </div>

      {/* Revenue & Usage KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex flex-col gap-3 hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50">
              <IndianRupee className="h-5 w-5" />
            </div>
            <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              <TrendingUp className="h-3 w-3 mr-1" /> +14.2%
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Recurring Rev</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">₹1,25,000</p>
          </div>
        </Card>

        <Card className="flex flex-col gap-3 hover:border-teal-300 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/50">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Managed B2B Patients</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">14,245</p>
          </div>
        </Card>

        <Card className="flex flex-col gap-3 hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50">
              <Activity className="h-5 w-5" />
            </div>
            <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              +8% YoY
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Global Adherence Rate</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">89.4%</p>
          </div>
        </Card>

        <Card className="flex flex-col gap-3 hover:border-rose-300 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/50">
              <Cpu className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Perplexity AI API Spend</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">₹8,450 <span className="text-sm font-medium text-slate-500">/ mo</span></p>
          </div>
        </Card>
      </div>

      {/* B2B Client Management Table */}
      <Card>
        <SectionTitle className="mb-4">Active Enterprise Clinics (B2B2C)</SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3 rounded-tl-xl">Hospital / Clinic</th>
                <th className="px-4 py-3">Patients</th>
                <th className="px-4 py-3">Adherence</th>
                <th className="px-4 py-3">MRR</th>
                <th className="px-4 py-3">AI Queries</th>
                <th className="px-4 py-3 rounded-tr-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {b2bClients.map((client, i) => (
                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-slate-100">{client.name}</td>
                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">{client.patients.toLocaleString()}</td>
                  <td className="px-4 py-3.5 font-semibold text-emerald-600">{client.adherence}</td>
                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">{client.mrr}</td>
                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">{client.apiCalls}</td>
                  <td className="px-4 py-3.5">
                    {client.status === 'Active' ? (
                      <Badge variant="success"><CheckCircle2 className="w-3 h-3 inline mr-1"/> Active</Badge>
                    ) : client.status === 'Warning' ? (
                      <Badge variant="warning"><AlertCircle className="w-3 h-3 inline mr-1"/> Check API Limit</Badge>
                    ) : (
                      <Badge variant="info">Onboarding</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}