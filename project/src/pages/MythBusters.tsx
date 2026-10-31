import { AlertTriangle, ShieldCheck, Flame, XCircle, CheckCircle2, Search } from 'lucide-react';
import { Card, PageHeader, Badge } from '@/components/ui';

const trendingMyths = [
  {
    id: 1,
    topic: 'Emergency First Aid',
    myth: 'If someone is having a seizure, you should put a spoon or wallet in their mouth to prevent them from swallowing their tongue.',
    reality: 'Never put anything in the mouth of someone having a seizure. It can cause severe dental or jaw injury. Gently roll them onto their side, cushion their head, and time the seizure.',
    source: 'Epilepsy Foundation & WHO First Aid Guidelines',
    verifiedAt: '2 hours ago',
    trending: true,
  },
  {
    id: 2,
    topic: 'Cardiac Arrest',
    myth: 'CPR is useless unless you provide mouth-to-mouth rescue breaths.',
    reality: 'Hands-only CPR (chest compressions without rescue breaths) is highly effective and recommended for bystanders. Push hard and fast in the center of the chest at 100-120 beats per minute.',
    source: 'American Heart Association (AHA)',
    verifiedAt: '5 hours ago',
    trending: true,
  },
  {
    id: 3,
    topic: 'Heart Attacks',
    myth: 'A heart attack always starts with severe, crushing chest pain.',
    reality: 'While chest pain is common, many patients—especially women, the elderly, and diabetics—experience atypical symptoms like extreme fatigue, nausea, jaw pain, or shortness of breath without chest pressure.',
    source: 'National Institutes of Health (NIH)',
    verifiedAt: '1 day ago',
    trending: false,
  },
  {
    id: 4,
    topic: 'Burn Treatment',
    myth: 'Applying butter or ice to a severe burn helps soothe the skin and prevent blistering.',
    reality: 'Butter traps heat and increases infection risk. Ice can cause tissue damage (frostbite) on compromised skin. Cool the burn under running room-temperature or cool tap water for 10-20 minutes.',
    source: 'Indian Red Cross Society',
    verifiedAt: '2 days ago',
    trending: false,
  }
];

export default function MythBusters() {
  return (
    <div className="space-y-6 pb-20 sm:pb-6">
      <PageHeader 
        title="Live Myth vs. Reality" 
        subtitle="Combating viral medical misinformation with board-certified facts and AI-driven clinical consensus."
      />

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
        <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 rounded-xl border border-rose-200 dark:border-rose-900/50 w-full sm:w-auto">
          <Flame className="h-5 w-5 animate-pulse" />
          <span className="text-sm font-bold">Tracking 14 Viral Claims Today</span>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input className="input pl-9 w-full" placeholder="Search a claim or home remedy..." />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {trendingMyths.map((item) => (
          <Card key={item.id} className="flex flex-col overflow-hidden p-0 transition-all hover:shadow-md">
            {/* Header */}
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 px-5 py-3 border-b border-slate-100 dark:border-slate-800">
              <Badge variant="neutral">{item.topic}</Badge>
              {item.trending && (
                <span className="flex items-center text-xs font-bold text-rose-600 dark:text-rose-400">
                  <Flame className="h-3.5 w-3.5 mr-1" /> Trending
                </span>
              )}
            </div>

            <div className="p-5 flex flex-col gap-5">
              {/* Myth Section */}
              <div className="flex gap-3 items-start">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400 mt-0.5">
                  <XCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">Viral Myth</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">"{item.myth}"</p>
                </div>
              </div>

              {/* Reality Section */}
              <div className="flex gap-3 items-start rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 p-4 border border-emerald-100 dark:border-emerald-900/30">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 mt-0.5">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Clinical Reality</p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.reality}</p>
                  
                  <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span>Verified by: {item.source} • {item.verifiedAt}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}