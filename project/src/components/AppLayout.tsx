import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Pill, Bell, Camera, Package, RefreshCw, Siren,
  Shield, BookOpen, Bot, FolderHeart, FileText, User, Settings,
  Menu, X, Activity, HeartPulse, Wifi, WifiOff,
  Layers, Flame, PawPrint, Building, Landmark // All USP Icons included
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useData } from '@/context/DataContext';
import { checkOnlineStatus } from '@/lib/offline';

export const navItems = [
  { path: '/vision', label: 'Platform Vision', icon: Layers },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/medications', label: 'My Medications', icon: Pill },
  { path: '/reminders', label: 'Dose Reminders', icon: Bell },
  { path: '/camera-monitoring', label: 'Camera Monitoring', icon: Camera },
  { path: '/inventory', label: 'Medicine Inventory', icon: Package },
  { path: '/refill-alerts', label: 'Refill Alerts', icon: RefreshCw },
  { path: '/pet-care', label: 'Veterinary Hub', icon: PawPrint },
  { path: '/gov-schemes', label: 'Gov Schemes & ABHA', icon: Landmark },
  { path: '/emergency', label: 'Emergency Assistance', icon: Siren },
  { path: '/emergency-guide', label: 'Offline Guide', icon: Shield },
  { path: '/library', label: 'Medical Library', icon: BookOpen },
  { path: '/ai-advisor', label: 'AI Health Advisor', icon: Bot },
  { path: '/myth-busters', label: 'Myth Busters', icon: Flame },
  { path: '/patient-file', label: 'My Patient File', icon: FolderHeart },
  { path: '/reports', label: 'Medical Reports', icon: FileText },
  { path: '/admin', label: 'Enterprise Admin', icon: Building },
  { path: '/profile', label: 'My Profile', icon: User },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useData();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [online, setOnline] = useState(checkOnlineStatus());

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = () => setOnline(checkOnlineStatus());
    window.addEventListener('online', handler);
    window.addEventListener('offline', handler);
    return () => {
      window.removeEventListener('online', handler);
      window.removeEventListener('offline', handler);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 no-print">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800 lg:hidden"
              aria-label="Toggle navigation"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link to="/vision" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm">
                <HeartPulse className="h-5 w-5" />
              </div>
              <div>
                <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">MediGuard</span>
                <span className="ml-1 text-lg font-black text-primary-600 dark:text-primary-400">IN</span>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className={`hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold sm:flex shadow-sm ${online ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'}`}>
              {online ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
              {online ? 'Online' : 'Offline'}
            </div>
            <Link to="/emergency" className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-rose-700 transition-colors">
              <Siren className="h-4 w-4" />
              <span className="hidden sm:inline">SOS</span>
            </Link>
            <ThemeToggle />
            <button
              onClick={() => navigate('/profile')}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700 dark:bg-primary-900/50 dark:text-primary-400 border border-primary-200 dark:border-primary-800"
              aria-label="View profile"
            >
              {profile?.fullName?.charAt(0) || 'U'}
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 mt-16 w-64 overflow-y-auto border-r border-gray-200 bg-white transition-transform dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-16 lg:mt-0 lg:h-[calc(100vh-4rem)] lg:translate-x-0 no-print ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <nav className="space-y-1 p-3">
            {navItems.map((item) => {
              const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all ${
                    active
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 shadow-sm border border-primary-100 dark:border-primary-900/50'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 border border-transparent'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto p-4 mb-4">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-500 dark:bg-slate-900/50 dark:border-slate-800 dark:text-slate-400">
              <Activity className="mb-2 h-5 w-5 text-primary-600" />
              <p className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">Hackathon MVP</p>
              <p className="mt-1 leading-relaxed">Not a substitute for professional medical care. Do not use for real emergencies.</p>
            </div>
          </div>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden no-print" onClick={() => setSidebarOpen(false)} />}

        {/* Main */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}