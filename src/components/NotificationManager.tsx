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
  if (!('Notification' in window)) return;

  if (Notification.permission !== 'granted') {
    return;
  }

  const finalTitle = formatNotificationTitle(title);

  // Try vibration for haptic feedback
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate([300, 100, 300]);
    } catch {
      // ignore
    }
  }

  const notifOptions: NotificationOptions = {
    body,
    icon: iconUrl,
    badge: iconUrl,
    tag: `unity-${Date.now()}`,
    requireInteraction: true
  };

  // 1. Try Service Worker showNotification (Best for Android Chrome system tray)
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(finalTitle, notifOptions);
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
    new Notification(finalTitle, notifOptions);
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

  // Update permission status on focus/interaction
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Listen to incoming notifications in Firestore
  useEffect(() => {
    const q = query(
      collection(db, 'notifications'),
      orderBy('createdAt', 'desc'),
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
          const notifTime = getNotificationMillis(n.createdAt);
          const timeDiff = now - notifTime;
          
          // Only trigger if notification is relatively recent (within last 2.5 minutes)
          // or if it was received live after component mount
          if (timeDiff < 150000 && !isFirstLoadRef.current) {
            if (audioRef.current) {
              audioRef.current.play().catch(e => console.log('Audio play error:', e));
            }
            triggerNativeNotification(n.title, n.body);
          }
        }
      });

      if (isFirstLoadRef.current) {
        isFirstLoadRef.current = false;
      }
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
    await addDoc(collection(db, 'notifications'), {
      title: formattedTitle,
      body,
      recipient,
      sender,
      createdAt: serverTimestamp(),
      readBy: [],
      isSystem: sender === 'system'
    });
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
};
