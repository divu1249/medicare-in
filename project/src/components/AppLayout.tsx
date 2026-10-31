import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Pill, Bell, Camera, Package, RefreshCw, Siren,
  Shield, BookOpen, Bot, FolderHeart, FileText, User, Settings,
  Menu, X, Activity, HeartPulse, Wifi, WifiOff,
  Layers, Flame, PawPrint, Building // New icons added here
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
  { path: '/emergency', label: 'Emergency Assistance', icon: Siren },
  { path: '/emergency-guide', label: 'Emergency Guide', icon: Shield },
  { path: '/library', label: 'Medical Library', icon: BookOpen },
  { path: '/ai-advisor', label: 'AI Health Advisor', icon: Bot },
  { path: '/myth-busters', label: 'Myth Busters', icon: Flame },
  { path: '/patient-file', label: 'My Patient File', icon: FolderHeart },
  { path: '/reports', label: 'Medical Reports', icon: FileText },
  { path: '/profile', label: 'My Profile', icon: User },
  { path: '/settings', label: 'Settings', icon: Settings },
  { path: '/admin', label: 'Enterprise Admin', icon: Building },
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
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
                <HeartPulse className="h-5 w-5" />
              </div>
              <div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">MediGuard</span>
                <span className="ml-1 text-lg font-bold text-primary-600 dark:text-primary-400">IN</span>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className={`hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium sm:flex ${online ? 'bg-success-100 text-success-700 dark:bg-success-700/20 dark:text-success-400' : 'bg-error-100 text-error-700 dark:bg-error-700/20 dark:text-error-400'}`}>
              {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {online ? 'Online' : 'Offline'}
            </div>
            <Link to="/emergency" className="flex items-center gap-1.5 rounded-xl bg-error-600 px-3 py-2 text-sm font-semibold text-white hover:bg-error-700">
              <Siren className="h-4 w-4" />
              <span className="hidden sm:inline">Emergency</span>
            </Link>
            <ThemeToggle />
            <button
              onClick={() => navigate('/profile')}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700 dark:bg-primary-700/30 dark:text-primary-400"
              aria-label="View profile"
            >
              {profile.fullName.charAt(0) || 'U'}
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
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-700/20 dark:text-primary-400'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto p-4">
            <div className="rounded-xl bg-gray-50 p-3 text-xs text-gray-500 dark:bg-slate-800 dark:text-gray-400">
              <Activity className="mb-1 h-4 w-4 text-primary-500" />
              <p className="font-semibold text-gray-700 dark:text-gray-300">Demo Prototype</p>
              <p className="mt-1">Not a substitute for professional medical care. Always consult your doctor.</p>
            </div>
          </div>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden no-print" onClick={() => setSidebarOpen(false)} />}

        {/* Main */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}