import React, { useEffect, useState, useRef } from 'react';
import { collection, onSnapshot, query, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
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

export const triggerNativeNotification = async (title: string, body: string, iconUrl: string = '/icon.jpg') => {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  if (Notification.permission !== 'granted') {
    return;
  }

  const finalTitle = formatNotificationTitle(title);

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
    icon: iconUrl,
    badge: iconUrl,
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
    // Read cached seen IDs from sessionStorage to avoid duplicate alerts on reload
    try {
      const stored = sessionStorage.getItem('unity_seen_notif_ids');
      if (stored) {
        JSON.parse(stored).forEach((id: string) => seenIdsRef.current.add(id));
      }
    } catch {
      // ignore
    }

    // Direct collection query with limit - guaranteed to work across all devices without index requirements
    const q = query(
      collection(db, 'notifications'),
      limit(25)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs: (AppNotification & { parsedTime: number })[] = [];
      
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as AppNotification;
        const recipient = data.recipient;
        if (
          recipient === 'all' || 
          (user && (recipient === user.uid || recipient === user.whatsapp)) ||
          (position && recipient === position)
        ) {
          const parsedTime = (data as any).createdMillis || getNotificationMillis(data.createdAt);
          notifs.push({ id: docSnap.id, ...data, parsedTime });
        }
      });

      // Sort newest first
      notifs.sort((a, b) => b.parsedTime - a.parsedTime);

      const now = Date.now();

      notifs.forEach(n => {
        if (n.id && !seenIdsRef.current.has(n.id)) {
          seenIdsRef.current.add(n.id);
          try {
            sessionStorage.setItem('unity_seen_notif_ids', JSON.stringify(Array.from(seenIdsRef.current).slice(-50)));
          } catch {
            // ignore
          }

          const timeDiff = now - n.parsedTime;
          
          // If created within last 90 seconds (either live or recently broadcasted), trigger alert
          if (timeDiff >= 0 && timeDiff < 90000) {
            if (audioRef.current) {
              audioRef.current.play().catch(e => console.log('Audio play error:', e));
            }
            triggerNativeNotification(n.title, n.body);
          }
        }
      });
    }, (error) => {
      console.warn('Notifications listener error:', error);
    });

    return () => unsubscribe();
  }, [user?.uid, user?.whatsapp, position]);

  const handleEnableNotifications = async () => {
    const perm = await requestNotificationPermission();
    setPermission(perm);
    if (perm === 'granted') {
      try {
        localStorage.setItem('unity_notif_enabled', 'true');
      } catch {
        // ignore
      }
      await triggerNativeNotification('Unity Earning 🔔 নোটিফিকেশন সক্রিয় হয়েছে!', 'আপনার ফোনে ক্রোম পুশ নোটিফিকেশন সফলভাবে চালু করা হয়েছে। 🚀✨');
    }
  };

  // If permission is already granted or not supported on this platform, do not show any prompt
  if (permission === 'granted' || permission === 'unsupported') {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="w-full max-w-md bg-slate-900 border border-amber-500/30 text-white p-6 sm:p-7 rounded-3xl shadow-2xl flex flex-col items-center text-center relative overflow-hidden"
        >
          {/* Ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-amber-500/20 blur-3xl rounded-full pointer-events-none" />

          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center mb-5 shadow-lg shadow-amber-500/30 animate-pulse">
            <Bell size={32} className="stroke-[2.5]" />
          </div>

          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 mb-2">
            Unity Earning Alert System
          </span>

          <h3 className="text-lg sm:text-xl font-black text-white mb-2">
            ফোনে ক্রোম নোটিফিকেশন চালু করুন
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
            টাইমার শুরু, ৫ মিনিটের সতর্কতা অ্যালার্ম এবং লাইভ রেজাল্ট সরাসরি আপনার ফোনের স্ক্রিনে পেতে নোটিফিকেশন পারমিশন চালু করুন।
          </p>

          <div className="w-full space-y-3">
            <button
              onClick={handleEnableNotifications}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-600 hover:to-amber-600 text-slate-950 font-black rounded-2xl text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Check size={18} className="stroke-[3]" /> নোটিফিকেশন চালু করুন (Allow)
            </button>
            
            {isInIframe && (
              <button
                onClick={() => window.open(window.location.href, '_blank')}
                className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ExternalLink size={14} /> ক্রোম ফুল স্ক্রিন ট্যাবে ওপেন করুন
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
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
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
};
