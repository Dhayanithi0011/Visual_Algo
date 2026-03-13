import { useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Visualizer from "./pages/Visualizer";
import LearningPath from "./pages/LearningPath";
import GapDetector from "./pages/GapDetector";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import AuthPage from "./pages/AuthPage";
import AdminDashboard from "./pages/AdminDashboard";
import { useAuth } from "./services/useAuth";
import { useUserProgress } from "./services/useUserProgress";
import "./App.css";

// ── Admin credentials ─────────────────────────────────────────────────────────
const ADMIN_EMAILS = ["dhaya00011@gmail.com", "inpa233@gmail.com"];

// Restore last visited page across browser refreshes (same session)
function getInitialPage() {
  try { return sessionStorage.getItem("vz_page") || "home"; } catch { return "home"; }
}

export default function App() {
  const [activePage, setActivePage] = useState(getInitialPage);
  const [showAuth, setShowAuth]     = useState(false);
  const [theme, setTheme]           = useState(localStorage.getItem("theme") || "dark");
  const { user, loading: authLoading, signInWithGoogle, logout } = useAuth();

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };

  // ── Detect admin ──────────────────────────────────────────────────────────
  const isAdmin = !!user && ADMIN_EMAILS.includes(user.email);

  // ── All persistent progress lives here ────────────────────────────────────
  const {
    scores, watchedSet, vizSessions, quizHistory,
    streak, loaded: progressLoaded,
    recordQuizScore, recordProgramWatched,
  } = useUserProgress(user);

  const navigate = (page) => {
    if (page === "auth") { setShowAuth(true); return; }
    setShowAuth(false);
    setActivePage(page);
    try { sessionStorage.setItem("vz_page", page); } catch {}
  };

  const handleProgramWatched = (programKey, programLabel) => {
    recordProgramWatched(programKey, programLabel);
  };

  const handleQuizScore = (programKey, programLabel, score) => {
    recordQuizScore(programKey, programLabel, score);
  };

  // ── Auth loading splash ───────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="app-root" style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: "#d4d4d4", letterSpacing: "-0.02em" }}>VisuAlgo</span>
            <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", background: "rgba(0,122,204,0.15)", color: "var(--vsc-blue)", border: "1px solid rgba(0,122,204,0.3)", borderRadius: 3, padding: "2px 5px", fontWeight: 700 }}>BETA</span>
          </div>
          <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid rgba(0,122,204,0.3)", borderTopColor: "var(--vsc-blue)", animation: "spin 0.8s linear infinite" }} />
        </div>
      </div>
    );
  }

  // ── Admin users go straight to Admin Dashboard (full-screen, no navbar) ──
  if (isAdmin) {
    return (
      <AdminDashboard
        onLogout={async () => {
          await logout();
          setActivePage("home");
          try { sessionStorage.setItem("vz_page", "home"); } catch {}
        }}
      />
    );
  }

  // ── Not signed in AND auth page explicitly shown ──────────────────────────
  const protectedPages = ["visualizer", "learning", "gap-detector", "dashboard"];
  const needsAuth = !user && (showAuth || protectedPages.includes(activePage));

  if (needsAuth) {
    return (
      <AuthPage
        onSuccess={() => {
          setShowAuth(false);
          const dest = protectedPages.includes(activePage) ? activePage : "home";
          setActivePage(dest);
          try { sessionStorage.setItem("vz_page", dest); } catch {}
        }}
        onBack={() => {
          setShowAuth(false);
          setActivePage("home");
          try { sessionStorage.setItem("vz_page", "home"); } catch {}
        }}
      />
    );
  }

  // ── Page renderer ─────────────────────────────────────────────────────────
  const renderPage = () => {
    if (!user && protectedPages.includes(activePage)) return <Home onNavigate={navigate} />;

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
            streak={streak}
            progressLoaded={progressLoaded}
          />
        );

      case "settings":
        return (
          <Settings
            user={user}
            theme={theme}
            onThemeToggle={toggleTheme}
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
        onSignIn={() => setShowAuth(true)}
        onSignOut={logout}
      />
      <main className="main-content">{renderPage()}</main>
    </div>
  );
}
