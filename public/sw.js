const CACHE_NAME = 'unity-earning-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(e => console.warn('Cache error:', e));
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    self.registration.showNotification(title || 'Unity Notification', options || {});
  }
});

self.addEventListener('push', (event) => {
  if (event.data) {
    try {
      const data = event.data.json();
      const options = {
        body: data.body || '',
        icon: data.icon || '/icon.jpg',
        badge: data.badge || '/icon.jpg',
        vibrate: [200, 100, 200],
        tag: data.tag || `unity-${Date.now()}`,
        data: data
      };
      event.waitUntil(self.registration.showNotification(data.title || 'Unity Notification', options));
    } catch (e) {
      event.waitUntil(self.registration.showNotification('Notification', { body: event.data.text() }));
    }
  }
});
