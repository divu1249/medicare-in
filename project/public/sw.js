self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : { title: 'MediGuard Alert', body: 'Please check your app.' };

  const options = {
    body: data.body,
    icon: '/vite.svg', // Replace with your actual app icon
    badge: '/vite.svg',
    vibrate: [200, 100, 200, 100, 200, 100, 200], // Aggressive alarm vibration pattern
    requireInteraction: true, // Forces the user to explicitly dismiss it
    tag: 'mediguard-urgent-alert',
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});