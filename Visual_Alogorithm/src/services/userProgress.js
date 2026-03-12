// src/services/userProgress.js
// ─────────────────────────────────────────────────────────────────────────────
// Single Firestore document per user:
//   users/{uid}/progress/data
//
// Shape:
// {
//   scores:           { [programKey]: number },   // quiz scores
//   watchedPrograms:  string[],                   // programs run in visualizer
//   vizSessions:      { key, label, ts }[],       // recent visualizer runs
//   quizHistory:      { key, label, score, ts }[] // recent quiz attempts
// }
// ─────────────────────────────────────────────────────────────────────────────

import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

const progressRef = (uid) => doc(db, "users", uid, "progress", "data");

// ── Load ──────────────────────────────────────────────────────────────────────
export async function loadUserProgress(uid) {
  try {
    const snap = await getDoc(progressRef(uid));
    if (!snap.exists()) return defaultProgress();
    const d = snap.data();
    return {
      scores:          d.scores          || {},
      watchedPrograms: d.watchedPrograms || [],
      vizSessions:     d.vizSessions     || [],
      quizHistory:     d.quizHistory     || [],
    };
  } catch (e) {
    console.error("loadUserProgress:", e);
    return defaultProgress();
  }
}

// ── Save quiz score ───────────────────────────────────────────────────────────
export async function saveQuizScore(uid, programKey, programLabel, score, prevScores, prevHistory) {
  const newScores  = { ...prevScores, [programKey]: score };
  const historyEntry = { key: programKey, label: programLabel, score, ts: Date.now() };
  const newHistory = [historyEntry, ...prevHistory].slice(0, 50); // keep last 50

  try {
    await setDoc(progressRef(uid), {
      scores:      newScores,
      quizHistory: newHistory,
    }, { merge: true });
  } catch (e) {
    console.error("saveQuizScore:", e);
  }

  return { newScores, newHistory };
}

// ── Save watched program (visualizer run) ─────────────────────────────────────
export async function saveWatchedProgram(uid, programKey, programLabel, prevWatched, prevSessions) {
  const newWatched  = prevWatched.includes(programKey)
    ? prevWatched
    : [...prevWatched, programKey];

  const sessionEntry = { key: programKey, label: programLabel, ts: Date.now() };
  const newSessions  = [sessionEntry, ...prevSessions].slice(0, 50);

  try {
    await setDoc(progressRef(uid), {
      watchedPrograms: newWatched,
      vizSessions:     newSessions,
    }, { merge: true });
  } catch (e) {
    console.error("saveWatchedProgram:", e);
  }

  return { newWatched, newSessions };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function defaultProgress() {
  return { scores: {}, watchedPrograms: [], vizSessions: [], quizHistory: [] };
}
