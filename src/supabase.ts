import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Configuration keys
const STORAGE_URL_KEY = 'unity_supabase_url';
const STORAGE_KEY_KEY = 'unity_supabase_anon_key';

export function getSupabaseConfig(): { url: string; anonKey: string } {
  const envUrl = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) || 
                 (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) || 'https://pybarkjpvxchnllwtweo.supabase.co';
  const envKey = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) || 
                 (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5YmFya2pwdnhjaG5sbHd0d2VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzODgxMzAsImV4cCI6MjEwNDk2NDEzMH0.U8gFSq-SJM3y0eCsJx3tV6vUaCSBVWcfVyqLX5mMQVg';

  let storedUrl = '';
  let storedKey = '';
  if (typeof window !== 'undefined' && window.localStorage) {
    storedUrl = window.localStorage.getItem(STORAGE_URL_KEY) || '';
    storedKey = window.localStorage.getItem(STORAGE_KEY_KEY) || '';
  }

  return {
    url: envUrl || storedUrl || '',
    anonKey: envKey || storedKey || ''
  };
}

export function saveSupabaseConfig(url: string, anonKey: string) {
  if (typeof window !== 'undefined' && window.localStorage) {
    if (url) window.localStorage.setItem(STORAGE_URL_KEY, url.trim());
    else window.localStorage.removeItem(STORAGE_URL_KEY);

    if (anonKey) window.localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
    else window.localStorage.removeItem(STORAGE_KEY_KEY);
    
    // Invalidate client
    cachedClient = null;
  }
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(url && anonKey && url.startsWith('http'));
}

let cachedClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey || !url.startsWith('http')) {
    return null;
  }

  if (!cachedClient) {
    cachedClient = createClient(url, anonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
  }
  return cachedClient;
}

export async function testSupabaseConnection(overrideUrl?: string, overrideKey?: string): Promise<{ success: boolean; message: string }> {
  try {
    const url = overrideUrl || getSupabaseConfig().url;
    const anonKey = overrideKey || getSupabaseConfig().anonKey;
    if (!url || !anonKey || !url.startsWith('http')) {
      return { success: false, message: 'Supabase URL বা Anon Key সঠিকভাবে দেওয়া হয়নি।' };
    }

    const client = createClient(url, anonKey);
    // Ping by querying config or health
    const { error } = await client.from('config').select('id').limit(1);
    if (error) {
      // If table does not exist yet, connection itself might still be valid
      if (error.code === '42P01') {
        return { 
          success: true, 
          message: 'Supabase-এর সাথে সফলভাবে কানেক্ট হয়েছে! তবে টেবিল তৈরি করা হয়নি। অনুগ্রহ করে supabase_schema.sql স্ক্রিপ্টটি চালান।' 
        };
      }
      return { success: false, message: `Supabase ত্রুটি: ${error.message} (${error.code || ''})` };
    }
    return { success: true, message: 'Supabase কানেকশন সম্পূর্ণ সফল এবং ডাটাবেস প্রস্তুত!' };
  } catch (err: any) {
    return { success: false, message: `কানেক্ট করতে ব্যর্থ: ${err?.message || 'অজানা সমস্যা'}` };
  }
}
