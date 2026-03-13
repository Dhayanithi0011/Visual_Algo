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
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db } from "./firebase";

// ── Save / update user profile in Firestore on every login ───────────────────
async function syncUserProfile(u) {
  if (!u) return;
  try {
    // merge: true means existing fields (like createdAt) won't be overwritten
    await setDoc(
      doc(db, "users", u.uid),
      {
        displayName: u.displayName || "Anonymous",
        email:       u.email       || "",
        photoURL:    u.photoURL    || null,
        provider:    u.providerData?.[0]?.providerId || "password",
        lastLoginAt: serverTimestamp(),
        createdAt:   serverTimestamp(), // only written fresh on first login; merge keeps existing
      },
      { merge: true }
    );
  } catch (e) {
    console.error("syncUserProfile:", e);
  }
}

export function useAuth() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        // Merge Firestore photoURL (may be custom base64) into the user object
        try {
          const snap = await getDoc(doc(db, "users", u.uid));
          if (snap.exists()) {
            const data = snap.data();
            // If Firestore has a custom photo, attach it to the user object
            if (data.photoURL) u = Object.assign(Object.create(Object.getPrototypeOf(u)), u, { photoURL: data.photoURL });
            if (data.displayName) u = Object.assign(Object.create(Object.getPrototypeOf(u)), u, { displayName: data.displayName });
          }
        } catch { /* ignore */ }
        syncUserProfile(u);
      }
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  // ── Google Sign-In ─────────────────────────────────────────────────────
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result;
    } catch (err) {
      // Log the real error code so we can debug
      console.error("Google sign-in error:", err.code, err.message);
      throw err;
    }
  };

  // ── Email / Password ──────────────────────────────────────────────────────
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
