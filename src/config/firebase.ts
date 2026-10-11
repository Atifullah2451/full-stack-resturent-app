// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyC4eQqFbkYaQQTM_ft7JBaChP8CX6V0kwc",
  authDomain: "myresturent-13093.firebaseapp.com",
  projectId: "myresturent-13093",
  storageBucket: "myresturent-13093.firebasestorage.app",
  messagingSenderId: "817402279727",
  appId: "1:817402279727:web:cce7148e8ea33f038913da",
  measurementId: "G-L3Y3J7D17V"
};

// Initialize Firebase
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// Safe Analytics Initialization for Browser / Web
let analyticsInstance: any = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analyticsInstance = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics optional fallback
  });
}

export const analytics = analyticsInstance;
