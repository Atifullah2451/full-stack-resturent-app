/**
 * Firebase Admin SDK Initialization
 * Handles service account credential resolution from environment variables or local JSON.
 */
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

let db = null;
let auth = null;
let isConfigured = false;

try {
  let credential = null;

  // 1. Check if raw JSON string is provided in env (common in production cloud providers)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      const parsedServiceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      credential = admin.credential.cert(parsedServiceAccount);
    } catch (err) {
      console.warn('⚠️ Could not parse FIREBASE_SERVICE_ACCOUNT_JSON from environment variable.');
    }
  }

  // 2. Check if a path is specified or serviceAccountKey.json exists locally
  if (!credential) {
    const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH 
      ? path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
      : path.resolve(__dirname, '../../serviceAccountKey.json');

    if (fs.existsSync(keyPath)) {
      const serviceAccount = require(keyPath);
      credential = admin.credential.cert(serviceAccount);
      console.log(`🔑 Firebase Admin initialized using service account key at: ${keyPath}`);
    }
  }

  if (credential) {
    admin.initializeApp({
      credential,
      projectId: process.env.FIREBASE_PROJECT_ID || 'myresturent-13093'
    });
    db = admin.firestore();
    auth = admin.auth();
    isConfigured = true;
    console.log('✅ Firebase Admin connected to project: myresturent-13093');
  } else {
    // Initialize with application default or dummy project for local development warnings
    console.warn('\n⚠️ [Firebase Admin Warning]');
    console.warn('No serviceAccountKey.json was found in /backend and FIREBASE_SERVICE_ACCOUNT_JSON is not set.');
    console.warn('To generate serviceAccountKey.json:');
    console.warn('1. Go to Firebase Console -> Project Settings -> Service accounts');
    console.warn('2. Click "Generate new private key"');
    console.warn('3. Save file as "backend/serviceAccountKey.json"');
    console.warn('Running backend in preview mode with Firestore fallback.\n');

    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'myresturent-13093'
    });
    db = admin.firestore();
    auth = admin.auth();
    isConfigured = false;
  }
} catch (error) {
  console.error('Firebase Admin init error:', error.message);
}

module.exports = {
  admin,
  db,
  auth,
  isConfigured
};
