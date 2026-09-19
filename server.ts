import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

async function startServer() {
  // API Routes
  app.get('/api/time', (req, res) => {
    res.json({ now: Date.now() });
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

  // Background Timer Worker for offline timer management via Supabase
  async function runTimerWorker() {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pybarkjpvxchnllwtweo.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5YmFya2pwdnhjaG5sbHd0d2VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzODgxMzAsImV4cCI6MjEwNDk2NDEzMH0.U8gFSq-SJM3y0eCsJx3tV6vUaCSBVWcfVyqLX5mMQVg';

    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase not configured for server background worker.');
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Background Timer Worker initialized successfully via Supabase.');

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
        const HH = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        return { currentTime: `${HH}:${mm}`, todayStr: now.toDateString() };
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

            await supabase.from('config').update({
              timerActive: true,
              timerStartedAt: now,
              timerEndTime: endTime,
              lastAutoStartTime: todayStr
            }).eq('id', 'global');

            console.log(`Auto-timer successfully triggered at ${currentTime} BD time!`);
          }
        }

        // 2. Check Natural Timer expiration
        if (config.timerActive && config.timerEndTime > 0 && now >= config.timerEndTime) {
          console.log('Timer expired naturally! Stopping timer in Supabase...');
          await supabase.from('config').update({
            timerActive: false,
            timerEndTime: 0
          }).eq('id', 'global');
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
