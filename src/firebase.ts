import { db as supabaseDb } from './lib/supabaseDb';

// Supabase Database Primary Adapter
export const db = supabaseDb as any;

// Mocked / Supabase-backed authentication object
const mockUser: any = {
  uid: 'supabase-user-session',
  email: 'user@unity.app',
  emailVerified: true,
  isAnonymous: true
};

export const auth: any = {
  currentUser: mockUser,
  onAuthStateChanged: (callback: (user: any) => void) => {
    setTimeout(() => callback(mockUser), 0);
    return () => {};
  },
  signInAnonymously: async () => ({ user: mockUser }),
  signOut: async () => {}
};

export const storage: any = null;
export const messaging: any = null;

// Auth stubs & helpers
export class GoogleAuthProvider {}
export async function signInWithPopup(..._args: any[]) {
  return { user: mockUser };
}
export async function signInWithRedirect(..._args: any[]) {
  return { user: mockUser };
}
export async function getRedirectResult(..._args: any[]) {
  return null;
}
export function onAuthStateChanged(_auth: any, callback: (u: any) => void) {
  setTimeout(() => callback(mockUser), 0);
  return () => {};
}
export async function signOut(..._args: any[]) {
  return Promise.resolve();
}
export async function signInAnonymously(..._args: any[]) {
  return { user: mockUser };
}

// Storage stubs & helpers
export function ref(..._args: any[]) { return {}; }
export async function uploadBytes(..._args: any[]) { return {}; }
export async function getDownloadURL(..._args: any[]) { return ''; }
export function uploadBytesResumable(..._args: any[]) { return {}; }

// Messaging stubs & helpers
export async function getToken(..._args: any[]) { return ''; }
export function onMessage(..._args: any[]) { return () => {}; }

export type User = any;
export type FirebaseUser = any;


