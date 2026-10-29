import { Link } from 'react-router-dom';
import {
  HeartPulse, Pill, Camera, Siren, BookOpen, FolderHeart, RefreshCw,
  ArrowRight, Shield, CheckCircle2, Activity, Bell, FileText, Bot, Menu, X, Sun, Moon, Monitor,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { getTheme, setTheme } from '@/lib/theme';
import type { ThemeMode } from '@/types';

const features = [
  { icon: Pill, title: 'Medication Management', desc: 'Add, edit and track your prescribed medicines with clear dose schedules.', path: '/medications', color: 'bg-primary-50 text-primary-600 dark:bg-primary-700/20' },
  { icon: Camera, title: 'Camera-Assisted Monitoring', desc: 'Motion-analysis to detect possible medication intake — always with your confirmation.', path: '/camera-monitoring', color: 'bg-secondary-50 text-secondary-600 dark:bg-secondary-700/20' },
  { icon: Siren, title: 'Emergency Assistance', desc: 'Quick access to emergency info, contacts and first-aid guidance.', path: '/emergency', color: 'bg-error-50 text-error-600 dark:bg-error-700/20' },
  { icon: BookOpen, title: 'Offline Medical Library', desc: 'Searchable health articles available without an internet connection.', path: '/library', color: 'bg-accent-50 text-accent-600 dark:bg-accent-700/20' },
  { icon: FolderHeart, title: 'Patient Records', desc: 'A structured digital patient file with sections for every part of your health.', path: '/patient-file', color: 'bg-warning-50 text-warning-600 dark:bg-warning-700/20' },
  { icon: RefreshCw, title: 'Refill Alerts', desc: 'Know when your medicine stock is running low and plan refills in time.', path: '/refill-alerts', color: 'bg-primary-50 text-primary-600 dark:bg-primary-700/20' },
];

const steps = [
  { icon: Pill, title: 'Add Your Medications', desc: 'Enter medicines and dose schedules as prescribed by your doctor.' },
  { icon: Bell, title: 'Get Reminders', desc: 'Receive in-app reminders so you never miss a scheduled dose.' },
  { icon: Camera, title: 'Optional Monitoring', desc: 'Use camera-assisted monitoring to detect possible intake movement.' },
  { icon: FileText, title: 'Generate Reports', desc: 'Download professional medical reports and an emergency PDF.' },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setThemeState] = useState<ThemeMode>('system');

  useEffect(() => {
    setThemeState(getTheme());
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setThemeState(getTheme());
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const cycleTheme = () => {
    const order: ThemeMode[] = ['light', 'dark', 'system'];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
    setThemeState(next);
  };

  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
              <HeartPulse className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">MediCare <span className="text-primary-600 dark:text-primary-400">AI</span></span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">Features</a>
            <a href="#how" className="text-sm font-medium text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">How It Works</a>
            <a href="#about" className="text-sm font-medium text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">About</a>
            <a href="#contact" className="text-sm font-medium text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">Contact</a>
            <Link to="/dashboard" className="btn btn-primary">Open Dashboard</Link>
            <button onClick={cycleTheme} className="rounded-xl border border-gray-200 p-2 text-gray-600 hover:bg-gray-100 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800" aria-label="Toggle theme">
              <ThemeIcon className="h-4 w-4" />
            </button>
          </nav>
          <div className="flex items-center gap-2 md:hidden">
            <button onClick={cycleTheme} className="rounded-xl border border-gray-200 p-2 text-gray-600 dark:border-slate-700 dark:text-gray-300" aria-label="Toggle theme">
              <ThemeIcon className="h-4 w-4" />
            </button>
            <button onClick={() => setMenuOpen((o) => !o)} className="rounded-lg p-2 text-gray-600 dark:text-gray-300" aria-label="Menu">
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="border-t border-gray-200 px-4 py-3 md:hidden dark:border-slate-800">
            <a href="#features" className="block py-2 text-sm text-gray-600 dark:text-gray-300" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#how" className="block py-2 text-sm text-gray-600 dark:text-gray-300" onClick={() => setMenuOpen(false)}>How It Works</a>
            <a href="#about" className="block py-2 text-sm text-gray-600 dark:text-gray-300" onClick={() => setMenuOpen(false)}>About</a>
            <a href="#contact" className="block py-2 text-sm text-gray-600 dark:text-gray-300" onClick={() => setMenuOpen(false)}>Contact</a>
            <Link to="/dashboard" className="mt-2 block btn btn-primary">Open Dashboard</Link>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-1.5 text-sm font-medium text-primary-700 dark:bg-primary-700/20 dark:text-primary-400">
            <Shield className="h-4 w-4" />
            Smart Medication Management System
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
            Your Health, Your Schedule, <span className="text-primary-600 dark:text-primary-400">Your Safety.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            MediCare AI helps patients and caregivers manage prescribed medicines, receive dose reminders, track inventory, access offline medical information, and stay prepared for emergencies — all in one secure, easy-to-use app.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/dashboard" className="btn btn-primary px-6 py-3 text-base">
              Open Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#features" className="btn btn-outline px-6 py-3 text-base">Explore Features</a>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: '14 App Sections', value: 'Complete' },
              { label: 'Offline Access', value: 'PWA Ready' },
              { label: 'PDF Reports', value: 'Downloadable' },
              { label: 'Dark & Light', value: 'Themes' },
            ].map((s) => (
              <div key={s.label} className="card p-4">
                <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">{s.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Everything you need in one place</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">A complete healthcare companion for medication safety and emergency preparedness.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Link key={f.path} to={f.path} className="card group p-6 transition hover:-translate-y-1 hover:shadow-md">
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${f.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{f.title}</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{f.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400">
                  Learn more <ArrowRight className="h-3 w-3 transition group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-gray-50 py-16 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">How it works</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Four simple steps to safer medication management.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.title} className="relative card p-6">
                  <div className="absolute right-4 top-4 text-3xl font-bold text-gray-100 dark:text-slate-800">{i + 1}</div>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-700/20 dark:text-primary-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{s.title}</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Supporting patients and caregivers</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              MediCare AI is designed for people managing regular prescriptions and the caregivers who help them. It brings medication schedules, adherence tracking, inventory monitoring, emergency preparedness and offline medical information together in a single, accessible interface.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                'Track medications and dose schedules exactly as prescribed',
                'Camera-assisted monitoring with mandatory patient confirmation',
                'Offline emergency guide downloadable as a real PDF',
                'Professional, printable medical reports from your local data',
                'Honest labelling of demo and sample content',
              ].map((point) => (
                <li key={point} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary-500" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Medical Disclaimer</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This is a hackathon prototype for demonstration purposes. It is not a medical device, does not provide medical advice, and does not replace consultation with a qualified healthcare professional. Always follow your doctor's prescription. In an emergency, contact your local emergency services directly.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/dashboard" className="btn btn-primary">Get Started</Link>
              <Link to="/library" className="btn btn-outline">Browse Library</Link>
              <Link to="/emergency-guide" className="btn btn-outline">Emergency Guide</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact / Footer */}
      <footer id="contact" className="border-t border-gray-200 bg-gray-50 py-12 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
                  <HeartPulse className="h-4 w-4" />
                </div>
                <span className="font-bold text-gray-900 dark:text-white">MediCare AI</span>
              </div>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Smart Medication Management, Patient Records and Emergency Support System.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Product</h4>
              <ul className="mt-3 space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li><Link to="/dashboard" className="hover:text-primary-600">Dashboard</Link></li>
                <li><Link to="/medications" className="hover:text-primary-600">Medications</Link></li>
                <li><Link to="/reports" className="hover:text-primary-600">Reports</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Resources</h4>
              <ul className="mt-3 space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li><Link to="/library" className="hover:text-primary-600">Medical Library</Link></li>
                <li><Link to="/ai-advisor" className="hover:text-primary-600">AI Advisor</Link></li>
                <li><Link to="/emergency" className="hover:text-primary-600">Emergency</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Legal</h4>
              <ul className="mt-3 space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li><Link to="/settings" className="hover:text-primary-600">Privacy Notice</Link></li>
                <li><Link to="/settings" className="hover:text-primary-600">Medical Disclaimer</Link></li>
                <li><a href="#about" className="hover:text-primary-600">About</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-gray-200 pt-6 text-center text-xs text-gray-400 dark:border-slate-800">
            <p>DEMO PROTOTYPE — Not a certified medical device. Not for clinical use. Fictional patient data is used for demonstration.</p>
            <p className="mt-1">Built with React, TypeScript, Tailwind CSS, Recharts and jsPDF.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
