importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Use compat version for simpler service worker integration
firebase.initializeApp({
  apiKey: "AIzaSyA57DZOvxurZ2obs-TmODJNOTLDt_DCY3w",
  authDomain: "gen-lang-client-0545920377.firebaseapp.com",
  projectId: "gen-lang-client-0545920377",
  storageBucket: "gen-lang-client-0545920377.firebasestorage.app",
  messagingSenderId: "608389293870",
  appId: "1:608389293870:web:9b2d6ecc78f643c1d3bcbf"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/icon.jpg',
    badge: '/icon.jpg',
    vibrate: [300, 100, 300, 100, 300],
    requireInteraction: true,
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

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
