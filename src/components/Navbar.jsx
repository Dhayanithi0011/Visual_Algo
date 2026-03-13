import { useState, useEffect, useRef } from "react";
import {
  FiCode, FiGrid, FiHome, FiLogIn, FiLogOut,
  FiTarget, FiX, FiMenu, FiSun, FiMoon, FiChevronRight,
  FiSettings, FiUser
} from "react-icons/fi";
import "./Navbar.css";

const navItems = [
  { id: "home",         label: "Home",       icon: FiHome   },
  { id: "visualizer",   label: "Visualizer", icon: FiCode   },
  { id: "gap-detector", label: "Quiz",       icon: FiTarget },
  { id: "dashboard",    label: "Dashboard",  icon: FiGrid   },
];

// ── Avatar with dropdown ──────────────────────────────────────────────────────
function AvatarMenu({ user, onSignOut, onNavigate }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initial = user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "?";

  return (
    <div className="avatar-menu-wrap" ref={ref}>
      <button
        className="avatar-btn"
        onClick={() => setOpen(o => !o)}
        title={user.displayName || user.email}
        aria-label="User menu"
      >
        {user.photoURL
          ? <img src={user.photoURL} alt="avatar" className="avatar-img" />
          : <div className="avatar-initial">{initial}</div>
        }
        <span className="avatar-online-dot" />
      </button>

      {open && (
        <div className="avatar-dropdown">
          {/* User info header */}
          <div className="avd-header">
            {user.photoURL
              ? <img src={user.photoURL} alt="avatar" className="avd-photo" />
              : <div className="avd-initial">{initial}</div>
            }
            <div className="avd-info">
              <span className="avd-name">{user.displayName || "User"}</span>
              <span className="avd-email">{user.email}</span>
            </div>
          </div>

          <div className="avd-divider" />

          <button className="avd-item" onClick={() => { setOpen(false); onNavigate("settings"); }}>
            <FiSettings size={14} />
            Settings
          </button>
          <button className="avd-item" onClick={() => { setOpen(false); onNavigate("dashboard"); }}>
            <FiGrid size={14} />
            Dashboard
          </button>

          <div className="avd-divider" />

          <button className="avd-item avd-signout" onClick={() => { setOpen(false); onSignOut(); }}>
            <FiLogOut size={14} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar({ activePage, onNavigate, user, loading, onSignIn, onSignOut }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

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
          <button className="navbar-menu-btn" onClick={() => setIsDrawerOpen(o => !o)} aria-label="Open menu">
            <FiMenu size={20} />
          </button>

          {/* Brand */}
          <div className="navbar-brand" onClick={() => handleNavigate("home")}>
            <span className="brand-dot" />
            <span className="brand-name">Algorithm Visualizer</span>
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
            {/* Theme toggle */}
            <button className="nav-link theme-toggle" onClick={toggleTheme} title="Toggle theme">
              {theme === "dark" ? <FiSun size={15} /> : <FiMoon size={15} />}
              <span>{theme === "dark" ? "Light" : "Dark"}</span>
            </button>
          </div>

          {/* Desktop auth — avatar only (no name) */}
          <div className="navbar-auth">
            {!loading && (
              user
                ? <AvatarMenu user={user} onSignOut={onSignOut} onNavigate={onNavigate} />
                : (
                  <button className="btn btn-outline auth-btn" onClick={onSignIn}>
                    <FiLogIn size={15} />
                    <span>Sign in</span>
                  </button>
                )
            )}
          </div>

          {/* Mobile: theme toggle + avatar */}
          <div className="navbar-mobile-actions">
            <button className="nav-icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === "dark" ? <FiSun size={17} /> : <FiMoon size={17} />}
            </button>
            {!loading && user && (
              <AvatarMenu user={user} onSignOut={onSignOut} onNavigate={handleNavigate} />
            )}
          </div>
        </div>
      </nav>

      {/* ── Drawer overlay ────────────────────────────────────── */}
      <div
        className={`drawer-overlay ${isDrawerOpen ? "drawer-overlay-open" : ""}`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* ── Left Drawer ───────────────────────────────────────── */}
      <aside className={`nav-drawer ${isDrawerOpen ? "nav-drawer-open" : ""}`}>
        <div className="drawer-header">
          <div className="drawer-brand">
            <span className="brand-dot" />
            <span className="brand-name">Algorithm Visualizer</span>
            <span className="brand-tag">BETA</span>
          </div>
          <button className="drawer-close-btn" onClick={closeDrawer} aria-label="Close menu">
            <FiX size={18} />
          </button>
        </div>

        <nav className="drawer-nav">
          <p className="drawer-section-label">Navigation</p>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`drawer-nav-item ${activePage === id ? "drawer-nav-active" : ""}`}
              onClick={() => handleNavigate(id)}
            >
              <span className="drawer-nav-icon"><Icon size={17} /></span>
              <span className="drawer-nav-label">{label}</span>
              {activePage === id && <FiChevronRight size={14} className="drawer-nav-arrow" />}
            </button>
          ))}
        </nav>

        <div className="drawer-divider" />

        <div className="drawer-settings">
          <p className="drawer-section-label">Settings</p>
          <button className="drawer-setting-row" onClick={toggleTheme}>
            <span className="drawer-setting-icon">
              {theme === "dark" ? <FiSun size={16} /> : <FiMoon size={16} />}
            </span>
            <span className="drawer-setting-label">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            <span className="drawer-setting-badge">{theme === "dark" ? "Off" : "On"}</span>
          </button>
          {user && (
            <button className="drawer-setting-row" onClick={() => handleNavigate("settings")}>
              <span className="drawer-setting-icon"><FiSettings size={16} /></span>
              <span className="drawer-setting-label">Account Settings</span>
            </button>
          )}
        </div>

        <div className="drawer-divider" />

        <div className="drawer-auth">
          {!loading && (
            user ? (
              <div className="drawer-user-row">
                {user.photoURL
                  ? <img src={user.photoURL} alt="avatar" className="drawer-avatar" />
                  : <div className="drawer-avatar-placeholder">{user.displayName?.[0]?.toUpperCase() ?? "?"}</div>
                }
                <div className="drawer-user-info">
                  <span className="drawer-user-name">{user.displayName || "User"}</span>
                  <span className="drawer-user-email">{user.email}</span>
                </div>
                <button className="drawer-signout-btn" onClick={() => { onSignOut(); closeDrawer(); }} title="Sign out">
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
