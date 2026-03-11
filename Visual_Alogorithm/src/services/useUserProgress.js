// src/services/useUserProgress.js
// ─────────────────────────────────────────────────────────────────────────────
// Custom hook — loads user progress once on login, keeps it in sync with
// Firestore in real-time without ever forcing a page refresh.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import {
  loadUserProgress,
  saveQuizScore,
  saveWatchedProgram,
} from "./userProgress";

export function useUserProgress(user) {
  const [scores,          setScores]          = useState({});
  const [watchedPrograms, setWatchedPrograms] = useState([]);
  const [vizSessions,     setVizSessions]     = useState([]);
  const [quizHistory,     setQuizHistory]     = useState([]);
  const [loaded,          setLoaded]          = useState(false); // true once first fetch done

  // ── Load on login / uid change ────────────────────────────────────────────
  useEffect(() => {
    if (!user?.uid) {
      // Logged out — clear everything
      setScores({});
      setWatchedPrograms([]);
      setVizSessions([]);
      setQuizHistory([]);
      setLoaded(false);
      return;
    }

    setLoaded(false);
    loadUserProgress(user.uid).then((data) => {
      setScores(data.scores);
      setWatchedPrograms(data.watchedPrograms);
      setVizSessions(data.vizSessions);
      setQuizHistory(data.quizHistory);
      setLoaded(true);
    });
  }, [user?.uid]);

  // ── Record quiz result ────────────────────────────────────────────────────
  const recordQuizScore = useCallback(async (programKey, programLabel, score) => {
    // Optimistic local update immediately (no flicker)
    const newScores = { ...scores, [programKey]: score };
    const newHistory = [
      { key: programKey, label: programLabel, score, ts: Date.now() },
      ...quizHistory,
    ].slice(0, 50);
    setScores(newScores);
    setQuizHistory(newHistory);

    // Persist to Firestore (non-blocking)
    if (user?.uid) {
      await saveQuizScore(user.uid, programKey, programLabel, score, scores, quizHistory);
    }
  }, [user?.uid, scores, quizHistory]);

  // ── Record visualizer run ─────────────────────────────────────────────────
  const recordProgramWatched = useCallback(async (programKey, programLabel) => {
    // Optimistic local update
    const newWatched = watchedPrograms.includes(programKey)
      ? watchedPrograms
      : [...watchedPrograms, programKey];
    const newSessions = [
      { key: programKey, label: programLabel, ts: Date.now() },
      ...vizSessions,
    ].slice(0, 50);
    setWatchedPrograms(newWatched);
    setVizSessions(newSessions);

    // Persist to Firestore (non-blocking)
    if (user?.uid) {
      await saveWatchedProgram(user.uid, programKey, programLabel, watchedPrograms, vizSessions);
    }
  }, [user?.uid, watchedPrograms, vizSessions]);

  return {
    scores,
    watchedPrograms,      // array of program keys
    watchedSet: new Set(watchedPrograms), // Set for O(1) lookup
    vizSessions,
    quizHistory,
    loaded,
    recordQuizScore,
    recordProgramWatched,
  };
}
