import { useState, useEffect } from "react";
import {
  FiCode, FiGrid, FiHome, FiLogIn, FiLogOut,
  FiTarget, FiX, FiMenu, FiSun, FiMoon, FiChevronRight
} from "react-icons/fi";
import "./Navbar.css";

const navItems = [
  { id: "home",         label: "Home",       icon: FiHome   },
  { id: "visualizer",   label: "Visualizer", icon: FiCode   },
  { id: "gap-detector", label: "Quiz",       icon: FiTarget },
  { id: "dashboard",    label: "Dashboard",  icon: FiGrid   },
];

export default function Navbar({ activePage, onNavigate, user, loading, onSignIn, onSignOut }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  /* Apply theme to <html> */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  /* Lock body scroll when drawer is open */
  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isDrawerOpen]);

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");
  const closeDrawer = () => setIsDrawerOpen(false);

  const handleNavigate = (page) => {
    onNavigate(page);
    closeDrawer();
  };

  return (
    <>
      {/* ── Top bar ───────────────────────────────────────────── */}
      <nav className="navbar">
        <div className="navbar-inner">

          {/* Hamburger — mobile only */}
          <button
            className="navbar-menu-btn"
            onClick={() => setIsDrawerOpen(o => !o)}
            aria-label="Open menu"
          >
            <FiMenu size={20} />
          </button>

          {/* Brand */}
          <div className="navbar-brand" onClick={() => handleNavigate("home")}>
            <span className="brand-dot" />
            <span className="brand-name">VisuAlgo</span>
            <span className="brand-tag">BETA</span>
          </div>

          {/* Desktop nav links */}
          <div className="navbar-links">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`nav-link ${activePage === id ? "active" : ""}`}
                onClick={() => onNavigate(id)}
              >
                <Icon size={15} />
                <span>{label}</span>
              </button>
            ))}

            {/* Theme toggle — desktop */}
            <button className="nav-link theme-toggle" onClick={toggleTheme} title="Toggle theme">
              {theme === "dark" ? <FiSun size={15} /> : <FiMoon size={15} />}
              <span>{theme === "dark" ? "Light" : "Dark"}</span>
            </button>
          </div>

          {/* Desktop auth */}
          <div className="navbar-auth">
            {!loading && (
              user ? (
                <div className="user-info">
                  {user.photoURL && (
                    <img src={user.photoURL} alt="avatar" className="user-avatar" />
                  )}
                  <span className="user-name">{user.displayName?.split(" ")[0]}</span>
                  <button className="btn btn-ghost auth-btn" onClick={onSignOut} title="Sign out">
                    <FiLogOut size={15} />
                  </button>
                </div>
              ) : (
                <button className="btn btn-outline auth-btn" onClick={onSignIn}>
                  <FiLogIn size={15} />
                  <span>Sign in</span>
                </button>
              )
            )}
          </div>

          {/* Mobile: theme toggle + avatar in topbar */}
          <div className="navbar-mobile-actions">
            <button className="nav-icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === "dark" ? <FiSun size={17} /> : <FiMoon size={17} />}
            </button>
            {!loading && user?.photoURL && (
              <img
                src={user.photoURL}
                alt="avatar"
                className="user-avatar"
                style={{ cursor: "pointer" }}
                onClick={() => handleNavigate("dashboard")}
              />
            )}
          </div>

        </div>
      </nav>

      {/* ── Left Drawer Overlay ───────────────────────────────── */}
      <div
        className={`drawer-overlay ${isDrawerOpen ? "drawer-overlay-open" : ""}`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* ── Left Drawer Panel ─────────────────────────────────── */}
      <aside className={`nav-drawer ${isDrawerOpen ? "nav-drawer-open" : ""}`}>

        {/* Drawer header */}
        <div className="drawer-header">
          <div className="drawer-brand">
            <span className="brand-dot" />
            <span className="brand-name">VisuAlgo</span>
            <span className="brand-tag">BETA</span>
          </div>
          <button className="drawer-close-btn" onClick={closeDrawer} aria-label="Close menu">
            <FiX size={18} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="drawer-nav">
          <p className="drawer-section-label">Navigation</p>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`drawer-nav-item ${activePage === id ? "drawer-nav-active" : ""}`}
              onClick={() => handleNavigate(id)}
            >
              <span className="drawer-nav-icon">
                <Icon size={17} />
              </span>
              <span className="drawer-nav-label">{label}</span>
              {activePage === id && <FiChevronRight size={14} className="drawer-nav-arrow" />}
            </button>
          ))}
        </nav>

        {/* Divider */}
        <div className="drawer-divider" />

        {/* Settings section */}
        <div className="drawer-settings">
          <p className="drawer-section-label">Settings</p>

          {/* Theme toggle row */}
          <button className="drawer-setting-row" onClick={toggleTheme}>
            <span className="drawer-setting-icon">
              {theme === "dark" ? <FiSun size={16} /> : <FiMoon size={16} />}
            </span>
            <span className="drawer-setting-label">
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </span>
            <span className="drawer-setting-badge">
              {theme === "dark" ? "Off" : "On"}
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="drawer-divider" />

        {/* Auth section */}
        <div className="drawer-auth">
          {!loading && (
            user ? (
              <div className="drawer-user-row">
                {user.photoURL
                  ? <img src={user.photoURL} alt="avatar" className="drawer-avatar" />
                  : <div className="drawer-avatar-placeholder">{user.displayName?.[0] ?? "?"}</div>
                }
                <div className="drawer-user-info">
                  <span className="drawer-user-name">{user.displayName?.split(" ")[0]}</span>
                  <span className="drawer-user-email">{user.email}</span>
                </div>
                <button
                  className="drawer-signout-btn"
                  onClick={() => { onSignOut(); closeDrawer(); }}
                  title="Sign out"
                >
                  <FiLogOut size={15} />
                </button>
              </div>
            ) : (
              <button className="drawer-signin-btn btn btn-primary" onClick={() => { onSignIn(); closeDrawer(); }}>
                <FiLogIn size={15} />
                Sign in
              </button>
            )
          )}
        </div>

      </aside>
    </>
  );
}
