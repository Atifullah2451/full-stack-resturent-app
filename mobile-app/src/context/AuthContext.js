/**
 * Authentication Context & Provider
 * Manages Firebase Auth lifecycle, persistent user state, Firestore profile synchronization,
 * login, signup, logout, and password resets.
 */
import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../config/firebase';
import { CART_STORAGE_KEY, USER_PROFILE_CACHE_KEY } from '../config/storageKeys';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Listen to Firebase Auth state change on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchUserProfile(
          currentUser.uid,
          currentUser.email,
          currentUser.displayName
        );
      } else {
        setUser(null);
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch or cache user profile from Firestore "users"
  const fetchUserProfile = async (uid, email, displayName) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userSnapshot = await getDoc(userDocRef);

      if (auth.currentUser?.uid !== uid) return;

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        setProfile(userData);
        await AsyncStorage.setItem(USER_PROFILE_CACHE_KEY, JSON.stringify(userData));
      } else {
        // Create initial skeleton if not present
        const initialData = {
          uid,
          email: email || '',
          name: displayName || 'Guest User',
          phone: '',
          address: '',
          createdAt: new Date().toISOString()
        };
        await setDoc(userDocRef, initialData, { merge: true });
        if (auth.currentUser?.uid !== uid) return;
        setProfile(initialData);
      }
    } catch (err) {
      console.warn('Error fetching Firestore user profile:', err.message);
    }
  };

  // Sign up with name, email, phone, password
  const signup = async (name, email, phone, password) => {
    setAuthError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const newUser = userCredential.user;

      // Update Firebase Auth display name
      if (name) {
        await updateFirebaseProfile(newUser, { displayName: name });
      }

      // Store complete profile in Firestore "users" collection
      const profileData = {
        uid: newUser.uid,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : '',
        address: '',
        role: 'customer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', newUser.uid), profileData);
      setProfile(profileData);
      setUser(newUser);
      return { success: true };
    } catch (error) {
      let message = 'Registration failed. Please try again.';
      if (error.code === 'auth/email-already-in-use') message = 'This email address is already registered.';
      if (error.code === 'auth/invalid-email') message = 'Please enter a valid email address.';
      if (error.code === 'auth/weak-password') message = 'Password must be at least 6 characters.';
      setAuthError(message);
      throw new Error(message);
    }
  };

  // Login
  const login = async (email, password) => {
    setAuthError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      setUser(userCredential.user);
      await fetchUserProfile(
        userCredential.user.uid,
        userCredential.user.email,
        userCredential.user.displayName
      );
      return { success: true };
    } catch (error) {
      let message = 'Login failed. Check your credentials.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = 'Invalid email or password.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Access temporarily disabled due to many failed attempts. Try again later.';
      }
      setAuthError(message);
      throw new Error(message);
    }
  };

  // Logout
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
    await AsyncStorage.multiRemove([USER_PROFILE_CACHE_KEY, CART_STORAGE_KEY]);
  };

  // Forgot password
  const resetPassword = async (email) => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return { success: true };
    } catch (error) {
      let message = 'Could not send reset email.';
      if (error.code === 'auth/user-not-found') message = 'No account found with this email.';
      setAuthError(message);
      throw new Error(message);
    }
  };

  // Update profile
  const updateProfileData = async (updates) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      const newProfile = {
        ...profile,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      await setDoc(userRef, newProfile, { merge: true });
      setProfile(newProfile);
      await AsyncStorage.setItem(USER_PROFILE_CACHE_KEY, JSON.stringify(newProfile));
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: !!user,
        isLoading,
        authError,
        signup,
        login,
        logout,
        resetPassword,
        updateProfileData,
        refreshProfile: () => user && fetchUserProfile(user.uid, user.email)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
