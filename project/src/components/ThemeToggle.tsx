import { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useData } from '@/context/DataContext';
import type { ThemeMode } from '@/types';

export default function ThemeToggle() {
  const { settings, updateSettings } = useData();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<ThemeMode>(settings.theme);

  useEffect(() => setCurrent(settings.theme), [settings.theme]);

  const options: { mode: ThemeMode; label: string; icon: typeof Sun }[] = [
    { mode: 'light', label: 'Light', icon: Sun },
    { mode: 'dark', label: 'Dark', icon: Moon },
    { mode: 'system', label: 'System', icon: Monitor },
  ];

  const CurrentIcon = options.find((o) => o.mode === current)?.icon ?? Monitor;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-200 dark:hover:bg-slate-700"
        aria-label="Toggle theme"
        aria-expanded={open}
      >
        <CurrentIcon className="h-4 w-4" />
        <span className="hidden sm:inline">{options.find((o) => o.mode === current)?.label}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-40 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
            {options.map(({ mode, label, icon: Icon }) => (
              <button
                key={mode}
                onClick={() => { updateSettings({ theme: mode }); setCurrent(mode); setOpen(false); }}
                className={`flex w-full items-center gap-2 px-3 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-slate-700 ${current === mode ? 'font-semibold text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-200'}`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
