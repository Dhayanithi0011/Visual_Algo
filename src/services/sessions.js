// src/services/sessions.js
// Save and load visualizer sessions + gap analysis results to Firestore

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// ── Visualizer sessions ─────────────────────────────────────────────────

/**
 * Save a visualizer run to Firestore.
 * @param {string} uid  - Firebase user UID
 * @param {string} code - Code that was run
 * @param {string} label - Sample label (e.g. "Factorial")
 * @param {number} stepCount - Number of steps generated
 */
export async function saveVisualizerSession(uid, code, label, stepCount) {
  try {
    await addDoc(collection(db, "sessions"), {
      uid,
      type: "visualizer",
      label,
      code,
      stepCount,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.error("Failed to save session:", e);
  }
}

/**
 * Load all visualizer sessions for a user.
 */
export async function loadVisualizerSessions(uid) {
  try {
    const q = query(
      collection(db, "sessions"),
      where("uid", "==", uid),
      where("type", "==", "visualizer"),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error("Failed to load sessions:", e);
    return [];
  }
}

// ── Gap analysis results ────────────────────────────────────────────────

/**
 * Save a gap analysis result to Firestore.
 * @param {string} uid
 * @param {string} topic
 * @param {object} scores  - { concept_id: score }
 * @param {Array}  blindSpots
 * @param {number} overallScore
 */
export async function saveGapAnalysis(uid, topic, scores, blindSpots, overallScore) {
  try {
    await addDoc(collection(db, "gap_analyses"), {
      uid,
      topic,
      scores,
      blindSpotIds: blindSpots.map((b) => b.id),
      overallScore,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.error("Failed to save gap analysis:", e);
  }
}

/**
 * Load all gap analyses for a user.
 */
export async function loadGapAnalyses(uid) {
  try {
    const q = query(
      collection(db, "gap_analyses"),
      where("uid", "==", uid),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error("Failed to load gap analyses:", e);
    return [];
  }
}
