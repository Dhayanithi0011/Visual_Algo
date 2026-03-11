import { useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Visualizer from "./pages/Visualizer";
import LearningPath from "./pages/LearningPath";
import Dashboard from "./pages/Dashboard";
import { useAuth } from "./services/useAuth";
import "./App.css";

export default function App() {
  const [activePage, setActivePage] = useState("home");
  const { user, loading, signInWithGoogle, logout } = useAuth();

  const renderPage = () => {
    switch (activePage) {
      case "home":
        return <Home onNavigate={setActivePage} />;
      case "visualizer":
        return <Visualizer user={user} />;
      case "learning":
        return <LearningPath user={user} />;
      case "dashboard":
        return <Dashboard onNavigate={setActivePage} user={user} />;
      default:
        return <Home onNavigate={setActivePage} />;
    }
  };

  return (
    <div className="app-root">
      <Navbar
        activePage={activePage}
        onNavigate={setActivePage}
        user={user}
        loading={loading}
        onSignIn={signInWithGoogle}
        onSignOut={logout}
      />
      <main className="main-content">{renderPage()}</main>
    </div>
  );
}
