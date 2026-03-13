// src/pages/Settings.jsx
import { useState, useRef } from "react";
import {
  FiLock, FiSun, FiMoon,
  FiSave, FiAlertCircle, FiCheckCircle, FiEye, FiEyeOff,
  FiRefreshCw, FiCamera
} from "react-icons/fi";
import {
  updateProfile, updatePassword,
  EmailAuthProvider, reauthenticateWithCredential
} from "firebase/auth";
import { auth, db } from "../services/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import "./Settings.css";

// ── Helpers ───────────────────────────────────────────────────────────────────
function Alert({ msg, type = "error" }) {
  if (!msg) return null;
  return (
    <div className={`set-alert set-alert-${type}`}>
      {type === "error" ? <FiAlertCircle size={13} /> : <FiCheckCircle size={13} />}
      <span>{msg}</span>
    </div>
  );
}

function SettingRow({ label, hint, children }) {
  return (
    <div className="set-row">
      <div className="set-row-label">
        <span className="set-label">{label}</span>
        {hint && <span className="set-hint">{hint}</span>}
      </div>
      <div className="set-row-control">{children}</div>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="set-card">
      <div className="set-card-title">{title}</div>
      {children}
    </div>
  );
}

function getProvider(user) {
  return user?.providerData?.[0]?.providerId || "password";
}
function isPhoneEmail(email) {
  return email?.endsWith("@phone.visualgo.app");
}

// ── Compress image to 96x96 JPEG via canvas ───────────────────────────────────
function compressImage(file, size = 96, quality = 0.75) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        // Crop to square from center
        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2;
        const sy = (img.height - side) / 2;
        ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// SETTINGS PAGE
// ═════════════════════════════════════════════════════════════════════════════
export default function Settings({ user, onThemeToggle, theme }) {
  const provider = getProvider(user);
  const isGoogle = provider === "google.com";
  const isPhone  = isPhoneEmail(user?.email);

  // Profile state
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [email,       setEmail]       = useState(isPhone ? "" : (user?.email || ""));
  const [phone,       setPhone]       = useState(isPhone ? user?.email?.split("@")[0] : "");
  const [photoURL,    setPhotoURL]    = useState(user?.photoURL || "");
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileMsg,  setProfileMsg]  = useState({ type: "", text: "" });

  // Password state
  const [curPass,  setCurPass]  = useState("");
  const [newPass,  setNewPass]  = useState("");
  const [confPass, setConfPass] = useState("");
  const [showCur,  setShowCur]  = useState(false);
  const [showNew,  setShowNew]  = useState(false);
  const [passBusy, setPassBusy] = useState(false);
  const [passMsg,  setPassMsg]  = useState({ type: "", text: "" });

  const fileRef = useRef(null);

  // ── Photo picker — compress before storing ────────────────────────────────
  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file, 96, 0.75);
    setPhotoURL(compressed);
  };

  // ── Save profile ──────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      setProfileMsg({ type: "error", text: "Display name cannot be empty." });
      return;
    }
    setProfileBusy(true);
    setProfileMsg({ type: "", text: "" });
    try {
      // Firebase Auth rejects base64 strings as photoURL.
      // Strategy: update Auth with name only (+ URL photo if it's a real URL).
      // Store the actual photo (base64 or URL) in Firestore.
      const isBase64 = photoURL?.startsWith("data:");
      await updateProfile(auth.currentUser, {
        displayName: displayName.trim(),
        // Only send to Auth if it's a proper URL (Google avatar, etc.)
        ...(!isBase64 && { photoURL: photoURL || null }),
      });

      // Firestore has no such restriction — save base64 here
      await setDoc(doc(db, "users", user.uid), {
        displayName: displayName.trim(),
        photoURL:    photoURL || null,
        lastLoginAt: serverTimestamp(),
      }, { merge: true });

      setProfileMsg({ type: "success", text: "Profile updated successfully!" });
    } catch (e) {
      setProfileMsg({ type: "error", text: e.message || "Failed to update profile." });
    }
    setProfileBusy(false);
  };

  // ── Change password ───────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    if (!curPass) { setPassMsg({ type: "error", text: "Enter your current password." }); return; }
    if (newPass.length < 6) { setPassMsg({ type: "error", text: "New password must be at least 6 characters." }); return; }
    if (newPass !== confPass) { setPassMsg({ type: "error", text: "Passwords don't match." }); return; }

    setPassBusy(true);
    setPassMsg({ type: "", text: "" });
    try {
      const credential = EmailAuthProvider.credential(user.email, curPass);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPass);
      setPassMsg({ type: "success", text: "Password changed successfully!" });
      setCurPass(""); setNewPass(""); setConfPass("");
    } catch (e) {
      const msgs = {
        "auth/wrong-password":     "Current password is incorrect.",
        "auth/invalid-credential": "Current password is incorrect.",
        "auth/too-many-requests":  "Too many attempts. Try again later.",
        "auth/weak-password":      "New password is too weak.",
      };
      setPassMsg({ type: "error", text: msgs[e.code] || e.message || "Failed to change password." });
    }
    setPassBusy(false);
  };

  const initial = displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?";

  return (
    <div className="settings-page">
      <div className="set-container">
        <div className="set-header">
          <h1 className="set-title">Settings</h1>
          <p className="set-subtitle">Manage your account and preferences</p>
        </div>

        {/* ── Profile ── */}
        <SectionCard title="Profile">
          {/* Avatar */}
          <div className="set-avatar-row">
            <div className="set-avatar-wrap">
              {photoURL
                ? <img src={photoURL} alt="avatar" className="set-avatar-img" />
                : <div className="set-avatar-placeholder">{initial}</div>
              }
              <button
                className="set-avatar-edit-btn"
                onClick={() => fileRef.current?.click()}
                title="Change photo"
              >
                <FiCamera size={12} />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handlePhotoChange}
              />
            </div>
            <div>
              <div className="set-avatar-name">{displayName || "No name set"}</div>
              <div className="set-avatar-sub">Click the camera icon to change your photo</div>
            </div>
          </div>

          <div className="set-divider" />

          <SettingRow label="Display Name" hint="Shown in the navbar and leaderboard">
            <input
              className="set-input"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Your full name"
            />
          </SettingRow>

          {!isPhone && (
            <SettingRow
              label="Email"
              hint={isGoogle ? "Managed by Google — cannot be changed here" : "Your sign-in email"}
            >
              <input className="set-input" value={email} disabled placeholder="your@email.com" />
            </SettingRow>
          )}

          <SettingRow
            label={isPhone ? "Phone Number" : "Mobile Number"}
            hint={isPhone ? "Your registered phone number" : "Optional — for account recovery"}
          >
            <input
              className="set-input"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
              placeholder="+91 9876543210"
              disabled={isPhone}
            />
          </SettingRow>

          {isPhone && (
            <SettingRow label="Email Address" hint="Add an email for recovery and notifications">
              <input
                className="set-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                type="email"
              />
            </SettingRow>
          )}

          <Alert msg={profileMsg.text} type={profileMsg.type} />

          <div className="set-actions">
            <button className="set-save-btn" onClick={handleSaveProfile} disabled={profileBusy}>
              {profileBusy
                ? <><FiRefreshCw size={13} className="spin" /> Saving…</>
                : <><FiSave size={13} /> Save Profile</>
              }
            </button>
          </div>
        </SectionCard>

        {/* ── Appearance ── */}
        <SectionCard title="Appearance">
          <SettingRow label="Theme" hint="Choose your preferred color scheme">
            <div className="set-theme-toggle">
              <button
                className={`set-theme-btn ${theme === "dark" ? "active" : ""}`}
                onClick={() => theme !== "dark" && onThemeToggle()}
              >
                <FiMoon size={14} /> Dark
              </button>
              <button
                className={`set-theme-btn ${theme === "light" ? "active" : ""}`}
                onClick={() => theme !== "light" && onThemeToggle()}
              >
                <FiSun size={14} /> Light
              </button>
            </div>
          </SettingRow>
        </SectionCard>

        {/* ── Security ── */}
        {!isGoogle ? (
          <SectionCard title="Security">
            <SettingRow label="Current Password" hint="Required to change your password">
              <div className="set-pass-wrap">
                <input
                  className="set-input"
                  type={showCur ? "text" : "password"}
                  value={curPass}
                  onChange={e => setCurPass(e.target.value)}
                  placeholder="Current password"
                  autoComplete="current-password"
                />
                <button className="set-eye-btn" onClick={() => setShowCur(s => !s)} type="button">
                  {showCur ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                </button>
              </div>
            </SettingRow>

            <SettingRow label="New Password">
              <div className="set-pass-wrap">
                <input
                  className="set-input"
                  type={showNew ? "text" : "password"}
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                  placeholder="New password (min 6 chars)"
                  autoComplete="new-password"
                />
                <button className="set-eye-btn" onClick={() => setShowNew(s => !s)} type="button">
                  {showNew ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                </button>
              </div>
            </SettingRow>

            <SettingRow label="Confirm Password">
              <input
                className="set-input"
                type="password"
                value={confPass}
                onChange={e => setConfPass(e.target.value)}
                placeholder="Confirm new password"
                autoComplete="new-password"
              />
            </SettingRow>

            <Alert msg={passMsg.text} type={passMsg.type} />

            <div className="set-actions">
              <button className="set-save-btn" onClick={handleChangePassword} disabled={passBusy}>
                {passBusy
                  ? <><FiRefreshCw size={13} className="spin" /> Updating…</>
                  : <><FiLock size={13} /> Change Password</>
                }
              </button>
            </div>
          </SectionCard>
        ) : (
          <SectionCard title="Security">
            <div className="set-google-note">
              <div className="set-google-badge">
                <svg width="16" height="16" viewBox="0 0 48 48">
                  <path fill="#4285F4" d="M46.145 24.504c0-1.636-.146-3.207-.418-4.716H24v8.924h12.418c-.535 2.892-2.163 5.344-4.61 6.99v5.81h7.465c4.369-4.025 6.872-9.954 6.872-16.008z"/>
                  <path fill="#34A853" d="M24 47c6.24 0 11.468-2.066 15.29-5.598l-7.465-5.81c-2.072 1.388-4.727 2.208-7.825 2.208-6.017 0-11.11-4.063-12.931-9.525H3.397v6.006C7.2 42.618 15.023 47 24 47z"/>
                  <path fill="#FBBC05" d="M11.069 28.275A14.832 14.832 0 0 1 10.5 24c0-1.486.254-2.932.569-4.275v-6.006H3.397A23.943 23.943 0 0 0 0 24c0 3.862.926 7.52 2.567 10.72l7.461-6.006.041-.44z"/>
                  <path fill="#EA4335" d="M24 9.2c3.39 0 6.436 1.165 8.827 3.45l6.618-6.617C35.462 2.298 30.234 0 24 0 15.024 0 7.2 4.382 3.397 10.719l7.672 5.952.031.054C12.89 11.263 17.983 9.2 24 9.2z"/>
                </svg>
                Signed in with Google
              </div>
              <p>Password management is handled by your Google account. Visit your Google account settings to change your password.</p>
            </div>
          </SectionCard>
        )}

      </div>
    </div>
  );
}
