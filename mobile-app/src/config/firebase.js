/**
 * Firebase Client SDK Configuration for React Native / Expo
 * 
 * Rules:
 * 1. Uses initializeAuth with getReactNativePersistence(AsyncStorage) for persistent mobile login.
 * 2. Firestore initialized via getFirestore.
 * 3. Safe analytics handler (works in Web environment; safely guarded on native Android/iOS).
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { isSupported, getAnalytics } from 'firebase/analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const firebaseConfig = {
  apiKey: "AIzaSyC4eQqFbkYaQQTM_ft7JBaChP8CX6V0kwc",
  authDomain: "myresturent-13093.firebaseapp.com",
  projectId: "myresturent-13093",
  storageBucket: "myresturent-13093.firebasestorage.app",
  messagingSenderId: "817402279727",
  appId: "1:817402279727:web:cce7148e8ea33f038913da",
  measurementId: "G-L3Y3J7D17V"
};

// Initialize Firebase App instance
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with AsyncStorage persistence to ensure sessions survive app restarts
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  // If already initialized (e.g. Fast Refresh during local development)
  auth = getAuth(app);
}

// Initialize Cloud Firestore
const db = getFirestore(app);

// Initialize Analytics if running on Web and supported
let analytics = null;
if (Platform.OS === 'web') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

export { app, auth, db, analytics };
