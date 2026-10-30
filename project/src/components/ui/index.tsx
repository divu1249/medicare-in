import { type ReactNode } from 'react';

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-4 dark:border-slate-800">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all dark:border-slate-800 dark:bg-slate-900 ${className}`}>{children}</div>;
}

export function SectionTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h2 className={`text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 ${className}`}>{children}</h2>;
}

export function EmptyState({ icon, title, message, action }: { icon?: ReactNode; title: string; message?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
      {icon && <div className="mb-3 text-emerald-600 dark:text-emerald-400">{icon}</div>}
      <p className="font-semibold text-slate-800 dark:text-slate-200">{title}</p>
      {message && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Badge({ variant = 'neutral', children }: { variant?: 'neutral' | 'success' | 'warning' | 'error' | 'info' | 'primary'; children: ReactNode }) {
  const variants = {
    neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50',
    warning: 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50',
    error: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50',
    info: 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-400 border border-teal-200 dark:border-teal-800/50',
    primary: 'bg-emerald-600 text-white dark:bg-emerald-700 dark:text-emerald-50',
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm ${variants[variant]}`}>{children}</span>;
}

export function StatCard({ label, value, icon, accent = 'primary' }: { label: string; value: string | number; icon: ReactNode; accent?: 'primary' | 'secondary' | 'accent' | 'warning' | 'error' }) {
  const accents = {
    primary: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
    secondary: 'bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400',
    accent: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
    warning: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
    error: 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400',
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${accents[accent]}`}>{icon}</div>
        <div>
          <p className="text-xs font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-400">{label}</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{value}</p>
        </div>
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger }: {
  open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string; confirmLabel?: string; danger?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 no-print">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="btn border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200">Cancel</button>
          <button onClick={() => { onConfirm(); onClose(); }} className={danger ? 'btn bg-rose-600 hover:bg-rose-700 text-white font-semibold' : 'btn bg-emerald-600 hover:bg-emerald-700 text-white font-semibold'}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}