import { Layers, WifiOff, MapPin, ShieldCheck, Activity, BrainCircuit, Unplug, Globe, Lock } from 'lucide-react';
import { Card, PageHeader, Badge } from '@/components/ui';

export default function PlatformVision() {
  return (
    <div className="space-y-6 pb-20 sm:pb-6">
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-12 shadow-2xl sm:px-12 sm:py-16 border border-slate-800">
        {/* Background Decorative Elements */}
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -left-10 -bottom-10 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />
        
        <div className="relative z-10 max-w-3xl">
          <Badge variant="success" className="mb-4 bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
            The MediGuard USP
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl mb-4">
            Solving Healthcare Fragmentation.
          </h1>
          <p className="text-lg text-slate-300 font-medium leading-relaxed">
            Medication apps, document vaults, hospital finders, and search engines already exist. 
            But what happens when you travel, lose connectivity, or need them all at once? 
            MediGuard is the unified infrastructure connecting everyday management with emergency preparedness.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-6">
          <Layers className="h-6 w-6 text-emerald-600" />
          The Three-Layer Architecture
        </h2>
        
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Layer 1: Online Intelligence */}
          <Card className="flex flex-col gap-4 border-t-4 border-t-blue-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">1. Online Intelligence</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Powered by Live-Web AI APIs (Perplexity/Groq). We bridge raw inference with strict source validation. AI-generated explanations are strictly segregated from our reviewed, board-certified medical knowledge database.
            </p>
            <div className="mt-auto pt-4 flex gap-2">
              <Badge variant="neutral"><BrainCircuit className="w-3 h-3 inline mr-1"/> Live AI</Badge>
              <Badge variant="neutral"><ShieldCheck className="w-3 h-3 inline mr-1"/> Source Validation</Badge>
            </div>
          </Card>

          {/* Layer 2: Offline Resilience */}
          <Card className="flex flex-col gap-4 border-t-4 border-t-amber-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                <WifiOff className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">2. Offline Resilience</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              True preparedness requires zero internet reliance. Users download localized, peer-reviewed emergency protocols and facility records before traveling. Accessible instantly in dead zones.
            </p>
            <div className="mt-auto pt-4 flex gap-2">
              <Badge variant="neutral"><Unplug className="w-3 h-3 inline mr-1"/> Travel Mode</Badge>
              <Badge variant="neutral"><Activity className="w-3 h-3 inline mr-1"/> Local Cache</Badge>
            </div>
          </Card>

          {/* Layer 3: Live Discovery */}
          <Card className="flex flex-col gap-4 border-t-4 border-t-emerald-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">3. Live Discovery</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Deep Google Maps integration with precise GPS targeting. We separate human and veterinary pathways, and strictly distinguish standard map listings from independently verified professional medical registrations.
            </p>
            <div className="mt-auto pt-4 flex gap-2">
              <Badge variant="neutral"><MapPin className="w-3 h-3 inline mr-1"/> Geo-Routing</Badge>
              <Badge variant="neutral"><ShieldCheck className="w-3 h-3 inline mr-1"/> Vet & Human</Badge>
            </div>
          </Card>
        </div>
      </div>

      {/* Privacy Guarantee */}
      <Card className="mt-6 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Privacy by Design</h3>
              <p className="text-sm text-slate-500 max-w-2xl mt-1">
                Camera monitoring is strictly opt-in and processed on-device (TensorFlow.js). Medical records remain under user control, and enterprise/caregiver access is fundamentally permission-based.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}