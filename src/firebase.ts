import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, onAuthStateChanged, signOut, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Initialize services with the specific database ID from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Messaging is optional as it requires a service worker and vapidKey
let messagingInstance = null;
try {
  messagingInstance = getMessaging(app);
} catch (e) {
  console.warn('Firebase Messaging could not be initialized:', e);
}
export const messaging = messagingInstance;

export { 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut, 
  signInAnonymously,
  ref,
  uploadBytes,
  getDownloadURL,
  uploadBytesResumable,
  getToken,
  onMessage
};

export type FirebaseUser = import('firebase/auth').User;


