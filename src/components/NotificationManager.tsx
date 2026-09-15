import React, { useEffect, useState, useRef } from 'react';
import { collection, onSnapshot, query, orderBy, limit, addDoc, serverTimestamp } from '../lib/supabaseDb';
import { db } from '../firebase';
import { Bell, ExternalLink, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface AppNotification {
  id?: string;
  title: string;
  body: string;
  sender: string;
  recipient: string; // 'all', or user id, or position
  createdAt: any;
  readBy?: string[];
  isSystem?: boolean;
}

export const getNotificationMillis = (createdAt: any): number => {
  if (!createdAt) return Date.now();
  if (typeof createdAt?.toMillis === 'function') return createdAt.toMillis();
  if (typeof createdAt?.toDate === 'function') return createdAt.toDate().getTime();
  if (createdAt instanceof Date) return createdAt.getTime();
  if (typeof createdAt === 'number') return createdAt;
  if (typeof createdAt === 'string') {
    const parsed = new Date(createdAt).getTime();
    if (!isNaN(parsed)) return parsed;
  }
  return Date.now();
};

export const isPushNotificationsEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  if (!('Notification' in window)) return false;
  const pref = localStorage.getItem('unity_push_enabled');
  if (pref === 'false') return false;
  return Notification.permission === 'granted';
};

export const setPushNotificationsEnabled = (enabled: boolean) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('unity_push_enabled', enabled ? 'true' : 'false');
  window.dispatchEvent(new CustomEvent('unity_push_pref_changed', { detail: { enabled } }));
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) return 'denied';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (e) {
    console.warn('Error requesting notification permission:', e);
    return Notification.permission;
  }
};

export const formatNotificationTitle = (rawTitle: string): string => {
  let title = (rawTitle || '').trim();
  if (!title) return 'Unity Earning 📢 নোটিফিকেশন';
  if (!title.toLowerCase().includes('unity earning')) {
    title = `Unity Earning 📢 ${title}`;
  }
  return title;
};

export const triggerNativeNotification = async (title: string, body: string, iconUrl?: string) => {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  // Check if push notifications are turned off by user in Profile or Settings
  const pushPref = localStorage.getItem('unity_push_enabled');
  if (pushPref === 'false') {
    return;
  }

  if (Notification.permission !== 'granted') {
    return;
  }

  const finalTitle = formatNotificationTitle(title);
  const cachedLogo = localStorage.getItem('unity_custom_logo');
  const finalIcon = iconUrl || cachedLogo || '/icon.jpg';

  // Vibration for mobile devices
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([300, 100, 300, 100, 300]);
    } catch {
      // ignore
    }
  }

  const notifOptions: any = {
    body,
    icon: finalIcon,
    badge: finalIcon,
    tag: `unity-${Date.now()}`,
    renotify: true,
    requireInteraction: true,
    vibrate: [300, 100, 300, 100, 300],
    data: {
      url: window.location.href,
      time: Date.now()
    }
  };

  // 1. Service Worker Notification (Bypasses tab minimization & shows in Android system tray)
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && reg.showNotification) {
        await reg.showNotification(finalTitle, notifOptions);
        return;
      }
      const readyReg = await navigator.serviceWorker.ready;
      if (readyReg && readyReg.showNotification) {
        await readyReg.showNotification(finalTitle, notifOptions);
        return;
      }
    } catch (e) {
      console.warn('Service worker showNotification error:', e);
    }

    if (navigator.serviceWorker.controller) {
      try {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          title: finalTitle,
          options: notifOptions
        });
        return;
      } catch (e) {
        console.warn('Service worker postMessage error:', e);
      }
    }
  }

  // 2. Fallback to standard Window Notification
  try {
    const notif = new Notification(finalTitle, notifOptions);
    notif.onclick = () => {
      window.focus();
      notif.close();
    };
  } catch (e) {
    console.warn('Window Notification fallback error:', e);
  }
};

export const NotificationManager = ({ 
  user,
  position
}: { 
  user?: any;
  position?: string;
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef<boolean>(true);
  
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission;
  });
  
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  // Sound init
  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
  }, []);

  // Inter-tab / local broadcast channel for instant 0ms communication
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    try {
      const bc = new BroadcastChannel('unity_instant_notifs');
      bc.onmessage = (event) => {
        const data = event.data;
        if (!data || !data.title) return;
        const recipient = data.recipient;
        if (
          recipient === 'all' || 
          (user && (recipient === user.uid || recipient === user.whatsapp)) ||
          (position && recipient === position)
        ) {
          const pushPref = typeof window !== 'undefined' ? localStorage.getItem('unity_push_enabled') : null;
          if (pushPref === 'false') return;

          if (audioRef.current) {
            audioRef.current.play().catch(e => console.log('Audio error:', e));
          }
          triggerNativeNotification(data.title, data.body);
        }
      };
      return () => {
        bc.close();
      };
    } catch {
      // ignore
    }
  }, [user?.uid, user?.whatsapp, position]);

  // Update permission status on focus/visibility change
  useEffect(() => {
    const updatePerm = () => {
      if ('Notification' in window) {
        setPermission(Notification.permission);
      }
    };
    updatePerm();
    window.addEventListener('focus', updatePerm);
    document.addEventListener('visibilitychange', updatePerm);
    return () => {
      window.removeEventListener('focus', updatePerm);
      document.removeEventListener('visibilitychange', updatePerm);
    };
  }, []);

  // Listen to incoming notifications in Firestore
  useEffect(() => {
    const q = query(
      collection(db, 'notifications'),
      orderBy('createdMillis', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs: AppNotification[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as AppNotification;
        const recipient = data.recipient;
        if (
          recipient === 'all' || 
          (user && (recipient === user.uid || recipient === user.whatsapp)) ||
          (position && recipient === position)
        ) {
          notifs.push({ id: docSnap.id, ...data });
        }
      });

      const now = Date.now();

      notifs.forEach(n => {
        if (n.id && !seenIdsRef.current.has(n.id)) {
          seenIdsRef.current.add(n.id);
          const notifTime = (n as any).createdMillis || getNotificationMillis(n.createdAt);
          const timeDiff = now - notifTime;
          
          // Trigger if notification is recent (within last 3 minutes) or incoming live
          if (timeDiff < 180000 && !isFirstLoadRef.current) {
            const pushPref = typeof window !== 'undefined' ? localStorage.getItem('unity_push_enabled') : null;
            if (pushPref !== 'false') {
              if (audioRef.current) {
                audioRef.current.play().catch(e => console.log('Audio play error:', e));
              }
              triggerNativeNotification(n.title, n.body);
            }
          }
        }
      });

      if (isFirstLoadRef.current) {
        isFirstLoadRef.current = false;
      }
    }, (error) => {
      // Fallback query if createdMillis index is pending
      console.warn('Notifications createdMillis query notice, using default order:', error);
      const fallbackQ = query(
        collection(db, 'notifications'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      return onSnapshot(fallbackQ, (snapshot) => {
        const now = Date.now();
        snapshot.forEach(docSnap => {
          const n = { id: docSnap.id, ...docSnap.data() } as AppNotification;
          if (n.id && !seenIdsRef.current.has(n.id)) {
            seenIdsRef.current.add(n.id);
            const notifTime = getNotificationMillis(n.createdAt);
            if (now - notifTime < 180000 && !isFirstLoadRef.current) {
              triggerNativeNotification(n.title, n.body);
            }
          }
        });
      });
    });

    return () => unsubscribe();
  }, [user?.uid, user?.whatsapp, position]);

  // Notification permission prompt disabled by user request
  return null;
};

export const sendNotification = async (title: string, body: string, recipient: string = 'all', sender: string = 'system') => {
  try {
    const formattedTitle = formatNotificationTitle(title);
    const now = Date.now();

    // Instant local BroadcastChannel delivery
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel('unity_instant_notifs');
        bc.postMessage({ title: formattedTitle, body, recipient, sender, createdMillis: now });
        bc.close();
      } catch {
        // ignore
      }
    }

    // Instant Firestore write with concrete timestamp for 0ms query ordering
    addDoc(collection(db, 'notifications'), {
      title: formattedTitle,
      body,
      recipient,
      sender,
      createdMillis: now,
      createdAt: serverTimestamp(),
      readBy: [],
      isSystem: sender === 'system'
    }).catch(e => console.error('Error writing notification doc:', e));

    // Send Push Notification via Backend (FCM)
    try {
      fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formattedTitle,
          body,
          recipient,
          icon: '/icon.jpg'
        })
      }).catch(e => console.warn('Push notification delivery skipped:', e));
    } catch (e) {
      // ignore push errors
    }
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
};
