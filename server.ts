import admin from 'firebase-admin';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
