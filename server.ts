import admin from 'firebase-admin';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// Initialize Firebase Admin
let firebaseAdminReady = false;
try {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) 
    : null;

  if (serviceAccount) {
    initializeApp({
      credential: cert(serviceAccount)
    });
    firebaseAdminReady = true;
    console.log('Firebase Admin initialized with service account.');
  } else {
    console.warn('FIREBASE_SERVICE_ACCOUNT not found. Push notifications will be disabled.');
  }
} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error);
}

const app = express();
app.use(express.json());

const PORT = 3000;

async function startServer() {
  // API Routes
  app.post('/api/save-token', async (req, res) => {
    const { whatsapp, token, platform } = req.body;
    if (!whatsapp || !token) {
      return res.status(400).json({ error: 'Missing whatsapp or token' });
    }

    if (!firebaseAdminReady) {
      return res.status(503).json({ error: 'Push service not configured' });
    }

    try {
      const db = getFirestore();
      // Save token to a collection
      await db.collection('fcmTokens').doc(token).set({
        whatsapp,
        platform: platform || 'web',
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });

      res.json({ success: true });
    } catch (error) {
      console.error('Error saving token:', error);
      res.status(500).json({ error: 'Failed to save token' });
    }
  });

  app.post('/api/notify', async (req, res) => {
    const { title, body, recipient, icon } = req.body;
    
    if (!firebaseAdminReady) {
      console.warn('Notification requested but push service not configured.');
      return res.status(503).json({ error: 'Push service not configured' });
    }

    try {
      const db = getFirestore();
      const messaging = getMessaging();
      let tokens: string[] = [];

      if (recipient === 'all') {
        const snapshot = await db.collection('fcmTokens').get();
        tokens = snapshot.docs.map(doc => doc.id);
      } else {
        const snapshot = await db.collection('fcmTokens').where('whatsapp', '==', recipient).get();
        tokens = snapshot.docs.map(doc => doc.id);
      }

      if (tokens.length === 0) {
        return res.json({ success: true, sentCount: 0, message: 'No tokens found' });
      }

      const message = {
        notification: {
          title: title || 'Unity Earning',
          body: body || '',
        },
        data: {
          title: title || 'Unity Earning',
          body: body || '',
          url: '/',
          icon: icon || '/icon.jpg',
          tag: `unity-${Date.now()}`
        },
        webpush: {
          headers: {
            'Urgency': 'high'
          },
          notification: {
            icon: icon || '/icon.jpg',
            badge: '/icon.jpg',
            vibrate: [300, 100, 300, 100, 300],
            requireInteraction: true,
            timestamp: Date.now()
          },
          fcmOptions: {
            link: '/'
          }
        },
        tokens: tokens
      };

      const response = await messaging.sendEachForMulticast(message);
      
      // Clean up invalid tokens
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const error = resp.error as any;
            if (error.code === 'messaging/invalid-registration-token' || error.code === 'messaging/registration-token-not-registered') {
              failedTokens.push(tokens[idx]);
            }
          }
        });

        if (failedTokens.length > 0) {
          const batch = db.batch();
          failedTokens.forEach(t => {
            batch.delete(db.collection('fcmTokens').doc(t));
          });
          await batch.commit();
        }
      }

      res.json({ 
        success: true, 
        sentCount: response.successCount, 
        failureCount: response.failureCount 
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      res.status(500).json({ error: 'Failed to send notification' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

// Background Timer Worker for offline timer management & push notifications
async function runTimerWorker() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pybarkjpvxchnllwtweo.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5YmFya2pwdnhjaG5sbHd0d2VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzODgxMzAsImV4cCI6MjEwNDk2NDEzMH0.U8gFSq-SJM3y0eCsJx3tV6vUaCSBVWcfVyqLX5mMQVg';

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase not configured for server background worker. Offline timer/auto-timer is disabled.');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  console.log('Background Timer Worker initialized successfully.');

  let fiveMinWarningSentForEndTime = 0;

  // Helper to get current time and date in Bangladesh timezone (Asia/Dhaka)
  function getBangladeshTime() {
    const now = new Date();
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Dhaka',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23'
      });
      const parts = formatter.formatToParts(now);
      const partMap = Object.fromEntries(parts.map(p => [p.type, p.value]));
      const currentTime = `${partMap.hour}:${partMap.minute}`;
      const todayStr = `${partMap.year}-${partMap.month}-${partMap.day}`;
      return { currentTime, todayStr };
    } catch (e) {
      // Fallback in case of formatting error
      const HH = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      return { currentTime: `${HH}:${mm}`, todayStr: now.toDateString() };
    }
  }

  // Send push notification helper
  async function triggerPush(title: string, body: string) {
    if (!firebaseAdminReady) {
      console.warn('Cannot send background push: Firebase Admin not configured.');
      return;
    }
    try {
      const db = getFirestore();
      const messaging = getMessaging();
      const snapshot = await db.collection('fcmTokens').get();
      const tokens = snapshot.docs.map(doc => doc.id);

      if (tokens.length === 0) {
        console.log('No registered FCM tokens found for background push.');
        return;
      }

      const message = {
        notification: { title, body },
        data: { title, body, url: '/' },
        webpush: {
          headers: { 'Urgency': 'high' },
          notification: {
            icon: '/icon.jpg',
            badge: '/icon.jpg',
            vibrate: [300, 100, 300, 100, 300],
            requireInteraction: true,
            timestamp: Date.now()
          },
          fcmOptions: { link: '/' }
        },
        tokens
      };

      const resp = await messaging.sendEachForMulticast(message);
      console.log(`Background push sent successfully to ${resp.successCount} tokens (${resp.failureCount} failed).`);

      // Cleanup invalid tokens
      if (resp.failureCount > 0) {
        const failedTokens: string[] = [];
        resp.responses.forEach((r, idx) => {
          if (!r.success) {
            const err = r.error as any;
            if (err?.code === 'messaging/invalid-registration-token' || err?.code === 'messaging/registration-token-not-registered') {
              failedTokens.push(tokens[idx]);
            }
          }
        });
        if (failedTokens.length > 0) {
          const batch = db.batch();
          failedTokens.forEach(t => {
            batch.delete(db.collection('fcmTokens').doc(t));
          });
          await batch.commit();
          console.log(`Cleaned up ${failedTokens.length} expired FCM tokens from Firebase.`);
        }
      }
    } catch (err) {
      console.error('Failed to send background multicast push:', err);
    }
  }

  // Save notification inside Supabase so active clients display it in the app UI
  async function saveNotification(title: string, body: string) {
    try {
      const id = 'notif_bg_' + Math.random().toString(36).substring(2, 11) + Date.now();
      const row = {
        id,
        title,
        body,
        recipient: 'all',
        sender: 'system',
        createdMillis: Date.now(),
        createdAt: new Date().toISOString(),
        readBy: [],
        isSystem: true
      };
      await supabase.from('notifications').insert(row);
      console.log(`Saved background notification in Supabase: ${id}`);
    } catch (err) {
      console.error('Failed to save background notification to Supabase:', err);
    }
  }

  // Generate top performer summary
  async function generateSummary() {
    try {
      const { data: globalConf } = await supabase.from('config').select('totalConverts').eq('id', 'global').maybeSingle();
      const totalConverts = globalConf?.totalConverts || 0;

      const { data: members } = await supabase.from('members').select('*');
      const { data: results } = await supabase.from('results').select('*');

      if (!members || !results || members.length === 0) {
        return {
          title: 'Unity Earning 🏁 টাইমার সমাপ্ত & সেরা পারফরম্যান্স!',
          body: `আজকের মোট সাবমিট হওয়া কনভার্ট: ${totalConverts} টি। 🎯`
        };
      }

      const resultsMap = new Map();
      results.forEach((r: any) => {
        resultsMap.set(r.id, r);
      });

      const enriched = members.map((m: any) => {
        const mData = { ...m, ...m.data };
        const res = resultsMap.get(mData.whatsapp || m.id) || null;
        let resData = null;
        if (res) {
          resData = { ...res, ...res.data };
        }
        return { ...mData, result: resData };
      });

      const leaders = enriched.filter((m: any) => m.position === 'Leader' || m.position === 'Team Leader');
      const trainers = enriched.filter((m: any) => m.position === 'Trainer');

      const topL = leaders.filter((l: any) => (l.result?.convert || 0) > 0).sort((a, b) => (b.result?.convert || 0) - (a.result?.convert || 0))[0] || null;
      const topT = trainers.filter((t: any) => (t.result?.convert || 0) > 0).sort((a, b) => (b.result?.convert || 0) - (a.result?.convert || 0))[0] || null;

      const lines: string[] = ['টাইমার অফ হয়ে গিয়েছে! আজকের ফলাফল: 📊'];
      
      if (topL) {
        lines.push(`👑 টপ টিম লিডার: 🥇 ${topL.name} (${topL.result?.convert || 0} টি কনভার্ট)`);
      }
      if (topT) {
        lines.push(`🌟 টপ ট্রেনার: 🥇 ${topT.name} (${topT.result?.convert || 0} টি কনভার্ট)`);
      }

      if (!topL && !topT) {
        lines.push(`আজকের মোট সাবমিট হওয়া কনভার্ট: ${totalConverts} টি। 🎯`);
      } else {
        lines.push(`🎯 মোট কনভার্ট: ${totalConverts} টি | অভিনন্দন ও ধন্যবাদ! 🎉✨`);
      }

      return {
        title: 'Unity Earning 🏁 টাইমার সমাপ্ত & সেরা পারফরম্যান্স!',
        body: lines.join('\n')
      };
    } catch (err) {
      console.error('Error generating summary:', err);
      return {
        title: 'Unity Earning 🏁 টাইমার সমাপ্ত!',
        body: 'টাইমার অফ হয়ে গিয়েছে! সবাই দ্রুত রেজাল্ট সাবমিট করে ফেলুন। 🚀✨'
      };
    }
  }

  // Periodic interval check loop (runs every 5 seconds)
  setInterval(async () => {
    try {
      const { data: config, error } = await supabase.from('config').select('*').eq('id', 'global').maybeSingle();
      if (error || !config) return;

      const now = Date.now();

      // 1. Check Auto-timer trigger
      if (config.autoTimerEnabled && config.autoTimerTime && !config.timerActive) {
        const { currentTime, todayStr } = getBangladeshTime();
        if (currentTime === config.autoTimerTime && config.lastAutoStartTime !== todayStr) {
          const duration = config.timerDuration || 1800;
          const endTime = now + duration * 1000;

          // Start the timer
          const { error: updateErr } = await supabase.from('config').update({
            timerActive: true,
            timerStartedAt: now,
            timerEndTime: endTime,
            lastAutoStartTime: todayStr
          }).eq('id', 'global');

          if (!updateErr) {
            console.log(`Auto-timer successfully triggered at ${currentTime} BD time!`);
            const title = 'Unity Earning ⏳ অটো-টাইমার শুরু হয়েছে!';
            const body = `${Math.round(duration / 60)} মিনিটের জন্য টাইমার চালু হয়েছে! সবাই দ্রুত রেজাল্ট সাবমিট করুন। 🚀✨`;
            
            await triggerPush(title, body);
            await saveNotification(title, body);
          }
        }
      }

      // 2. Check 5-minute warning trigger
      if (config.timerActive && config.timerEndTime > 0) {
        const timeLeft = Math.floor((config.timerEndTime - now) / 1000);
        if (timeLeft > 0 && timeLeft <= 300) {
          if (fiveMinWarningSentForEndTime !== config.timerEndTime) {
            console.log('Sending 5-minute warning push...');
            const title = 'Unity Earning ⏳ ৫ মিনিট বাকি আছে!';
            const body = 'আর মাত্র ৫ মিনিট বাকি আছে! সবাই দ্রুত আজকের কনভার্ট ও রেজাল্ট সাবমিট করে ফেলেন। 🏃💨';
            
            fiveMinWarningSentForEndTime = config.timerEndTime;
            await triggerPush(title, body);
            await saveNotification(title, body);
          }
        }
      }

      // 3. Check Natural Timer expiration
      if (config.timerActive && config.timerEndTime > 0 && now >= config.timerEndTime) {
        console.log('Timer expired naturally! Stopping timer and sending summary push...');
        
        // Disable timer in database first
        const { error: endErr } = await supabase.from('config').update({
          timerActive: false,
          timerEndTime: 0
        }).eq('id', 'global');

        if (!endErr) {
          const summary = await generateSummary();
          await triggerPush(summary.title, summary.body);
          await saveNotification(summary.title, summary.body);
        }
      }
    } catch (err) {
      console.error('Error inside background timer checker interval loop:', err);
    }
  }, 5000);
}

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    runTimerWorker().catch(console.error);
  });
}

startServer();
