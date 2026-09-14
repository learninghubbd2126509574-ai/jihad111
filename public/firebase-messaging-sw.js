importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// 1. Caching Configuration (from sw.js)
const CACHE_NAME = 'unity-earning-v4';
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

// 2. Firebase Configuration
firebase.initializeApp({
  apiKey: "AIzaSyA57DZOvxurZ2obs-TmODJNOTLDt_DCY3w",
  authDomain: "gen-lang-client-0545920377.firebaseapp.com",
  projectId: "gen-lang-client-0545920377",
  storageBucket: "gen-lang-client-0545920377.firebasestorage.app",
  messagingSenderId: "608389293870",
  appId: "1:608389293870:web:9b2d6ecc78f643c1d3bcbf"
});

const messaging = firebase.messaging();

// 3. Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || payload.data?.title || 'Unity Earning';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || '',
    icon: payload.notification?.icon || payload.data?.icon || '/icon.jpg',
    badge: '/icon.jpg',
    vibrate: [300, 100, 300, 100, 300],
    tag: payload.data?.tag || `unity-${Date.now()}`,
    renotify: true,
    requireInteraction: true,
    data: payload.data || { url: '/' }
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// 4. Handle Notification Clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// 5. Handle Messages from Foreground (from sw.js)
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
      self.registration.showNotification(title || 'Unity Earning', finalOptions)
    );
  }
});
