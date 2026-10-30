export async function setupNativeNotifications() {
  if (!("Notification" in window)) {
    console.warn("This browser does not support desktop notifications.");
    return false;
  }

  let permission = Notification.permission;
  
  if (permission === "default") {
    permission = await Notification.requestPermission();
  }

  if (permission === "granted") {
    // Register the service worker to handle background waking
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/sw.js');
        console.log('MediGuard Service Worker registered for alarms.');
      } catch (err) {
        console.error('SW registration failed:', err);
      }
    }
    return true;
  }
  
  return false;
}

export function triggerLocalAlarm(title: string, message: string) {
  if (Notification.permission === "granted") {
    new Notification(title, {
      body: message,
      vibrate: [200, 100, 200],
      requireInteraction: true
    });
  }
}