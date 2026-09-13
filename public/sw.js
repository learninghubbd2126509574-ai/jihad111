const CACHE_NAME = 'unity-earning-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon.jpg'
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
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) => {
        return Promise.all(
          keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
        );
      })
    ])
  );
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
    const finalOptions = {
      body: options?.body || '',
      icon: options?.icon || '/icon.jpg',
      badge: options?.badge || '/icon.jpg',
      vibrate: options?.vibrate || [300, 100, 300, 100, 300],
      tag: options?.tag || `unity-${Date.now()}`,
      renotify: true,
      requireInteraction: true,
      data: options?.data || { url: '/' }
    };
    event.waitUntil(
      self.registration.showNotification(title || 'Unity Earning Notification', finalOptions)
    );
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
        vibrate: [300, 100, 300, 100, 300],
        tag: data.tag || `unity-${Date.now()}`,
        renotify: true,
        requireInteraction: true,
        data: data
      };
      event.waitUntil(
        self.registration.showNotification(data.title || 'Unity Earning', options)
      );
    } catch (e) {
      event.waitUntil(
        self.registration.showNotification('Unity Earning', {
          body: event.data.text(),
          icon: '/icon.jpg',
          badge: '/icon.jpg',
          vibrate: [300, 100, 300]
        })
      );
    }
  }
});
