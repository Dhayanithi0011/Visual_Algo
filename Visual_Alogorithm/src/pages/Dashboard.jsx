import { FiCode, FiCpu, FiTrendingUp, FiActivity, FiArrowRight,
         FiLoader, FiAward, FiCheckCircle, FiBarChart2, FiUser } from "react-icons/fi";
import { QUIZ_CHAPTERS } from "./quizData";
import "./Dashboard.css";

// ── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(ts) {
  if (!ts) return "recently";
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  return `${Math.floor(seconds / 86400)} day${Math.floor(seconds / 86400) > 1 ? "s" : ""} ago`;
}

function scoreColor(s) {
  if (s >= 80) return "var(--green, #1e9e4a)";
  if (s >= 60) return "var(--accent, #4f6ef7)";
  if (s >= 40) return "var(--orange, #e0952a)";
  return "var(--red, #d94f4f)";
}

const CHAPTER_COLORS = {
  recursion:           "#7c5cbf",
  sorting:             "#2d8fd9",
  searching:           "#12a08f",
  data_structures:     "#d4721e",
  graph:               "#9b4fd1",
  dynamic_programming: "#1e9e4a",
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function Dashboard({
  onNavigate,
  user,
  scores        = {},   // { [programKey]: score }
  vizSessions   = [],   // [{ key, label, ts }]
  quizHistory   = [],   // [{ key, label, score, ts }]
  progressLoaded = false,
}) {

  // ── Derived stats ─────────────────────────────────────────────────────────
  const allPrograms = QUIZ_CHAPTERS.flatMap(ch =>
    ch.programs.map(p => ({ ...p, chapterId: ch.id }))
  );

  const quizzedPrograms = allPrograms.filter(p => scores[p.key] !== undefined);
  const totalQuizzes    = quizzedPrograms.length;
  const totalPrograms   = allPrograms.length;
  const mastered        = quizzedPrograms.filter(p => scores[p.key] >= 80).length;
  const overallAvg      = quizzedPrograms.length
    ? Math.round(quizzedPrograms.reduce((a, p) => a + scores[p.key], 0) / quizzedPrograms.length)
    : 0;
  const vizCount        = vizSessions.length;

  // Per-chapter averages for the progress chart
  const chapterProgress = QUIZ_CHAPTERS.map(ch => {
    const progs = ch.programs.filter(p => scores[p.key] !== undefined);
    const avg = progs.length
      ? Math.round(progs.reduce((a, p) => a + scores[p.key], 0) / progs.length)
      : null;
    return { ...ch, avg, done: progs.length, total: ch.programs.length };
  });

  // Recent activity — merge viz + quiz history, newest first
  const recentActivity = [
    ...vizSessions.slice(0, 5).map(s => ({
      icon: "viz",
      label: `Watched: ${s.label}`,
      ts: s.ts,
      color: "var(--accent, #4f6ef7)",
    })),
    ...quizHistory.slice(0, 5).map(q => ({
      icon: "quiz",
      label: `Quiz: ${q.label} — ${q.score}%`,
      ts: q.ts,
      color: scoreColor(q.score),
    })),
  ]
    .sort((a, b) => (b.ts || 0) - (a.ts || 0))
    .slice(0, 8);

  const quickStats = [
    { icon: FiBarChart2,  label: "Avg Quiz Score",      value: quizzedPrograms.length ? `${overallAvg}%` : "—",    color: scoreColor(overallAvg) },
    { icon: FiAward,      label: "Programs Mastered",   value: String(mastered),                                   color: "var(--green, #1e9e4a)" },
    { icon: FiCheckCircle,label: "Quizzes Completed",   value: `${totalQuizzes}/${totalPrograms}`,                 color: "var(--teal, #12a08f)" },
    { icon: FiCode,       label: "Visualizer Runs",      value: String(vizCount),                                   color: "var(--accent, #4f6ef7)" },
  ];

  // ── Not signed in ─────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="dash-page">
        <div className="dash-sign-in-prompt card">
          <FiUser size={36} color="#7c5cbf" />
          <h2>Sign in to track your progress</h2>
          <p>Your quiz scores, visualizer history, and learning path are saved to your account.</p>
        </div>
      </div>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (!progressLoaded) {
    return (
      <div className="dash-page">
        <div className="dash-header">
          <h2 className="dash-title">Dashboard</h2>
          <p className="dash-sub">Welcome back, {user.displayName?.split(" ")[0] || "learner"}!</p>
        </div>
        <div className="dash-loading">
          <FiLoader size={18} className="spin" color="var(--accent)" />
          <span>Loading your progress…</span>
        </div>
      </div>
    );
  }

  // ── Main Dashboard ────────────────────────────────────────────────────────
  return (
    <div className="dash-page">
      {/* Header */}
      <div className="dash-header">
        <div className="dash-header-inner">
          {user.photoURL && (
            <img src={user.photoURL} alt="avatar" className="dash-avatar" />
          )}
          <div>
            <h2 className="dash-title">
              Welcome back, {user.displayName?.split(" ")[0] || "learner"}!
            </h2>
            <p className="dash-sub">Here's your learning progress at a glance.</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        {quickStats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div className="stat-card card" key={i}>
              <Icon size={18} color={s.color} />
              <div>
                <div className="stat-card-val" style={{ color: s.color }}>{s.value}</div>
                <div className="stat-card-label">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="dash-grid">

        {/* Chapter Progress */}
        <div className="card dash-section">
          <div className="section-label">Chapter Progress</div>
          {chapterProgress.every(c => c.avg === null) ? (
            <p className="dash-empty">Complete quizzes to see chapter progress here.</p>
          ) : (
            <div className="topic-list">
              {chapterProgress.map((ch) => {
                const col = CHAPTER_COLORS[ch.id] || "var(--accent)";
                return (
                  <div className="topic-row" key={ch.id}>
                    <div className="topic-name">{ch.label}</div>
                    <div className="topic-bar-wrap">
                      <div
                        className="topic-bar"
                        style={{
                          width: `${ch.avg ?? 0}%`,
                          background: ch.avg !== null ? col : "transparent",
                        }}
                      />
                    </div>
                    <div className="topic-score" style={{ color: ch.avg !== null ? col : "var(--text-dim)" }}>
                      {ch.avg !== null ? `${ch.avg}%` : `${ch.done}/${ch.total}`}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card dash-section">
          <div className="section-label">Recent Activity</div>
          {recentActivity.length === 0 ? (
            <p className="dash-empty">No activity yet — open the Visualizer or take a quiz!</p>
          ) : (
            <div className="activity-list">
              {recentActivity.map((a, i) => (
                <div className="activity-item" key={i}>
                  <div className="activity-dot" style={{ background: a.color }} />
                  <div className="activity-text">{a.label}</div>
                  <div className="activity-time">{timeAgo(a.ts)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quiz Score Breakdown */}
        {quizzedPrograms.length > 0 && (
          <div className="card dash-section">
            <div className="section-label">Quiz Score Breakdown</div>
            <div className="topic-list">
              {quizzedPrograms.slice(0, 8).map(p => (
                <div className="topic-row" key={p.key}>
                  <div className="topic-name">{p.label}</div>
                  <div className="topic-bar-wrap">
                    <div className="topic-bar" style={{ width: `${scores[p.key]}%`, background: scoreColor(scores[p.key]) }} />
                  </div>
                  <div className="topic-score" style={{ color: scoreColor(scores[p.key]) }}>
                    {scores[p.key]}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className={`card dash-section ${quizzedPrograms.length === 0 ? "actions-section" : ""}`}>
          <div className="section-label">Quick Actions</div>
          <div className="action-btns">
            <button className="action-card" onClick={() => onNavigate("visualizer")}>
              <FiCode size={20} color="var(--accent)" />
              <div>
                <div className="action-title">Open Visualizer</div>
                <div className="action-desc">Step through algorithm code</div>
              </div>
              <FiArrowRight size={16} color="var(--text-dim)" />
            </button>
            <button className="action-card" onClick={() => onNavigate("gap-detector")}>
              <FiCpu size={20} color="var(--teal)" />
              <div>
                <div className="action-title">Take Quizzes</div>
                <div className="action-desc">Detect your knowledge gaps</div>
              </div>
              <FiArrowRight size={16} color="var(--text-dim)" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
