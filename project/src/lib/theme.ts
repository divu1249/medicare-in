import type { ThemeMode } from '@/types';

const THEME_KEY = 'medicare-theme';

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  const isDark =
    mode === 'dark' ||
    (mode === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);
  root.classList.toggle('dark', isDark);
}

export function initTheme() {
  const stored = (localStorage.getItem(THEME_KEY) as ThemeMode) || 'system';
  applyTheme(stored);
  if (stored === 'system') {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    mq.addEventListener('change', handler);
  }
}

export function setTheme(mode: ThemeMode) {
  localStorage.setItem(THEME_KEY, mode);
  applyTheme(mode);
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.onchange = mode === 'system' ? () => applyTheme('system') : null;
  if (mode === 'system') {
    const handler = () => applyTheme('system');
    mq.addEventListener('change', handler);
  }
}

export function getTheme(): ThemeMode {
  return (localStorage.getItem(THEME_KEY) as ThemeMode) || 'system';
}
