// src/services/useAuth.js

import { useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";

export function useAuth() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  // ── Google ────────────────────────────────────────────────────────────────
  const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

  // ── Email / Password (also used by Phone tab via synthetic email) ─────────
  const registerWithEmail = async (name, email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    setUser({ ...cred.user, displayName: name });
    return cred.user;
  };

  const signInWithEmail = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = () => signOut(auth);

  return {
    user,
    loading,
    signInWithGoogle,
    registerWithEmail,
    signInWithEmail,
    resetPassword,
    logout,
  };
}
