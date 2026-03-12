import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Visualizer from "./pages/Visualizer";
import LearningPath from "./pages/LearningPath";
import GapDetector from "./pages/GapDetector";
import Dashboard from "./pages/Dashboard";
import { useAuth } from "./services/useAuth";
import { useUserProgress } from "./services/useUserProgress";
import "./App.css";

// Restore last visited page across browser refreshes (same session)
function getInitialPage() {
  try { return sessionStorage.getItem("vz_page") || "home"; } catch { return "home"; }
}

export default function App() {
  const [activePage, setActivePage] = useState(getInitialPage);
  const { user, loading: authLoading, signInWithGoogle, logout } = useAuth();

  // ── All persistent progress: loaded once on login, kept live ─────────────
  const {
    scores,
    watchedSet,
    vizSessions,
    quizHistory,
    loaded: progressLoaded,
    recordQuizScore,
    recordProgramWatched,
  } = useUserProgress(user);

  // Persist active page across refreshes
  const navigate = (page) => {
    setActivePage(page);
    try { sessionStorage.setItem("vz_page", page); } catch {}
  };

  // ── Callbacks passed down to pages ────────────────────────────────────────
  const handleProgramWatched = (programKey, programLabel) => {
    recordProgramWatched(programKey, programLabel);
  };

  const handleQuizScore = (programKey, programLabel, score) => {
    recordQuizScore(programKey, programLabel, score);
  };

  const renderPage = () => {
    switch (activePage) {
      case "home":
        return <Home onNavigate={navigate} />;

      case "visualizer":
        return (
          <Visualizer
            user={user}
            onProgramWatched={handleProgramWatched}
          />
        );

      case "learning":
        return <LearningPath user={user} />;

      case "gap-detector":
        return (
          <GapDetector
            user={user}
            scores={scores}
            watchedPrograms={watchedSet}
            onQuizScore={handleQuizScore}
            onNavigate={navigate}
            progressLoaded={progressLoaded}
          />
        );

      case "dashboard":
        return (
          <Dashboard
            onNavigate={navigate}
            user={user}
            scores={scores}
            vizSessions={vizSessions}
            quizHistory={quizHistory}
            progressLoaded={progressLoaded}
          />
        );

      default:
        return <Home onNavigate={navigate} />;
    }
  };

  return (
    <div className="app-root">
      <Navbar
        activePage={activePage}
        onNavigate={navigate}
        user={user}
        loading={authLoading}
        onSignIn={signInWithGoogle}
        onSignOut={logout}
      />
      <main className="main-content">{renderPage()}</main>
    </div>
  );
}
