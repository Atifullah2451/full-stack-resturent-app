/**
 * Backend API Client & Network Configuration
 * Connects Expo app to the Node.js Express REST API.
 */
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from './firebase';

const IP_STORAGE_KEY = '@savoria_custom_api_host';

// Default host based on environment:
// - Android Emulator loops back to host via 10.0.2.2
// - iOS Simulator uses localhost
// - Physical device will use configured LAN IP
export const DEFAULT_HOST = Platform.select({
  android: 'http://10.0.2.2:5000',
  ios: 'http://localhost:5000',
  default: 'http://localhost:5000',
});

/**
 * Get the active API Base URL.
 * Checks AsyncStorage first for custom IP entered by the user.
 */
export const getApiBaseUrl = async () => {
  try {
    const saved = await AsyncStorage.getItem(IP_STORAGE_KEY);
    return saved ? saved.trim() : DEFAULT_HOST;
  } catch {
    return DEFAULT_HOST;
  }
};

/**
 * Save custom server IP address (useful when testing with Expo Go on a physical phone)
 */
export const setApiBaseUrl = async (url) => {
  if (!url) {
    await AsyncStorage.removeItem(IP_STORAGE_KEY);
  } else {
    let formatted = url.trim();
    if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
      formatted = `http://${formatted}`;
    }
    await AsyncStorage.setItem(IP_STORAGE_KEY, formatted);
  }
};

/**
 * Perform authenticated fetch request to Express backend
 */
export const apiFetch = async (endpoint, options = {}) => {
  const baseUrl = await getApiBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // Attach Firebase ID Token if user is logged in
  if (auth.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    } catch (err) {
      console.warn('Could not retrieve Firebase ID token:', err.message);
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};
