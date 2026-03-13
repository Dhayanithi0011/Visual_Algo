// src/services/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  // Use the canonical firebaseapp.com authDomain — required for signInWithPopup
  // to work on localhost and all deployed domains without extra configuration.
  authDomain:        "visualgo-64b3f.firebaseapp.com",
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

// Analytics is optional — silently skip if blocked by ad blockers or not enabled
export let analytics = null;
try {
  const { getAnalytics } = await import("firebase/analytics");
  analytics = getAnalytics(app);
} catch {
  // Analytics unavailable (ad blocker, missing config, etc.) — safe to ignore
}

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
// Request profile + email so displayName and photoURL are always returned
googleProvider.addScope("profile");
googleProvider.addScope("email");
// Force account picker so users can choose which Google account to use
googleProvider.setCustomParameters({ prompt: "select_account" });

export const db = getFirestore(app);
export default app;
