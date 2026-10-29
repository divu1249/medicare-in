import { type ReactNode } from 'react';

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`card p-5 ${className}`}>{children}</div>;
}

export function SectionTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h2 className={`text-lg font-semibold text-gray-900 dark:text-white ${className}`}>{children}</h2>;
}

export function EmptyState({ icon, title, message, action }: { icon?: ReactNode; title: string; message?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 px-6 py-12 text-center dark:border-slate-700">
      {icon && <div className="mb-3 text-gray-400 dark:text-gray-500">{icon}</div>}
      <p className="font-medium text-gray-700 dark:text-gray-300">{title}</p>
      {message && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Badge({ variant = 'neutral', children }: { variant?: 'neutral' | 'success' | 'warning' | 'error' | 'info' | 'primary'; children: ReactNode }) {
  const variants = {
    neutral: 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-200',
    success: 'bg-success-100 text-success-700 dark:bg-success-700/30 dark:text-success-400',
    warning: 'bg-warning-100 text-warning-700 dark:bg-warning-700/30 dark:text-warning-400',
    error: 'bg-error-100 text-error-700 dark:bg-error-700/30 dark:text-error-400',
    info: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-700/30 dark:text-secondary-400',
    primary: 'bg-primary-100 text-primary-700 dark:bg-primary-700/30 dark:text-primary-400',
  };
  return <span className={`badge ${variants[variant]}`}>{children}</span>;
}

export function StatCard({ label, value, icon, accent = 'primary' }: { label: string; value: string | number; icon: ReactNode; accent?: 'primary' | 'secondary' | 'accent' | 'warning' | 'error' }) {
  const accents = {
    primary: 'bg-primary-50 text-primary-600 dark:bg-primary-700/20 dark:text-primary-400',
    secondary: 'bg-secondary-50 text-secondary-600 dark:bg-secondary-700/20 dark:text-secondary-400',
    accent: 'bg-accent-50 text-accent-600 dark:bg-accent-700/20 dark:text-accent-400',
    warning: 'bg-warning-50 text-warning-600 dark:bg-warning-700/20 dark:text-warning-400',
    error: 'bg-error-50 text-error-600 dark:bg-error-700/20 dark:text-error-400',
  };
  return (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accents[accent]}`}>{icon}</div>
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
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
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="btn btn-outline">Cancel</button>
          <button onClick={() => { onConfirm(); onClose(); }} className={danger ? 'btn btn-danger' : 'btn btn-primary'}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
