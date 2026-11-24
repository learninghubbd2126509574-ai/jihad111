import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';
import { db as supabaseDb } from './services/supabaseDb';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const db = supabaseDb;
export const auth = getAuth(app);
export const storage = getStorage(app);
