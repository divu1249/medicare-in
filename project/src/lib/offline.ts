const OFFLINE_KEY = 'medicare-offline-status';

export function setOfflineReady(value: boolean) {
  localStorage.setItem(OFFLINE_KEY, JSON.stringify({ ready: value, date: new Date().toISOString() }));
}

export function getOfflineStatus(): { ready: boolean; date: string | null } {
  try {
    const raw = localStorage.getItem(OFFLINE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { ready: false, date: null };
}

export function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) return Promise.resolve();
  return navigator.serviceWorker
    .register('/sw.js')
    .then((reg) => {
      if (reg.active) setOfflineReady(true);
    })
    .catch(() => { /* SW registration may fail in sandboxed environments */ });
}

export function checkOnlineStatus(): boolean {
  return navigator.onLine;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  return Notification.requestPermission();
}

export function showBrowserNotification(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body });
  }
}
