// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '@utils/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from Firestore
  const fetchUserProfile = async (uid) => {
    const docRef = doc(db, 'users', uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      setUserProfile(snap.data());
      return snap.data();
    }
    return null;
  };

  // Register with email
  const register = async (name, email, password) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName: name });

    // Create Firestore user doc
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      name,
      email,
      role: 'user',
      addresses: [],
      preferences: { sizes: [], categories: [], colors: [] },
      createdAt: serverTimestamp(),
    });

    return user;
  };

  // Login with email
  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  // Google login
  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const { user } = result;

    // Create user doc if first time
    const docRef = doc(db, 'users', user.uid);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      await setDoc(docRef, {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        role: 'user',
        addresses: [],
        preferences: { sizes: [], categories: [], colors: [] },
        createdAt: serverTimestamp(),
      });
    }
    return user;
  };

  const logout = () => signOut(auth);

  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  const isAdmin = userProfile?.role === 'admin';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchUserProfile(firebaseUser.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{
      user, userProfile, loading, isAdmin,
      register, login, loginWithGoogle, logout, resetPassword,
      fetchUserProfile,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
