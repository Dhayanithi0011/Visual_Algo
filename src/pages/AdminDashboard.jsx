// AdminDashboard.jsx  — reads directly from Firestore client SDK (no backend needed)
import { useState, useEffect, useCallback } from "react";
import "./AdminDashboard.css";
import {
  FiUsers, FiActivity, FiBarChart2, FiAward, FiLogOut,
  FiSearch, FiChevronDown, FiChevronUp, FiMenu, FiX,
  FiCode, FiTarget, FiGrid, FiTrendingUp,
  FiRefreshCw, FiShield, FiWifi,
} from "react-icons/fi";
import { db } from "../services/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(ms) {
  if (!ms) return "—";
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 60)    return `${s}s ago`;
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
function scoreColor(s) {
  if (s >= 80) return "#4ec9b0";
  if (s >= 60) return "#007acc";
  if (s >= 40) return "#fd9e5a";
  return "#f44747";
}
function toMs(val) {
  if (!val) return 0;
  if (val?.toMillis) return val.toMillis();          // Firestore Timestamp
  if (val?.seconds)  return val.seconds * 1000;     // Firestore Timestamp object
  return Number(val) || 0;
}

const CHAPTER_MAP = {
  factorial:"recursion", fibonacci:"recursion", sum_array:"recursion", tower_of_hanoi:"recursion",
  bubble_sort:"sorting", selection_sort:"sorting", insertion_sort:"sorting", merge_sort:"sorting", quick_sort:"sorting",
  linear_search:"searching", binary_search:"searching", jump_search:"searching",
  linked_list:"data_structures", stack_impl:"data_structures", queue_impl:"data_structures", bst_insert:"data_structures",
  bfs:"graph", dfs:"graph",
  fib_dp:"dynamic_programming", knapsack:"dynamic_programming", lcs:"dynamic_programming",
};
const CHAPTER_LABELS = {
  recursion:"Recursion", sorting:"Sorting", searching:"Searching",
  data_structures:"Data Structures", graph:"Graph", dynamic_programming:"Dynamic Programming",
};
const CHAPTER_COLORS = {
  recursion:"#7c5cbf", sorting:"#2d8fd9", searching:"#12a08f",
  data_structures:"#d4721e", graph:"#9b4fd1", dynamic_programming:"#1e9e4a",
};

// ── Fetch ALL users from Firestore directly ───────────────────────────────────
// Structure: users/{uid}  has fields: displayName, email, photoURL, provider, createdAt, lastLoginAt
//            users/{uid}/progress/data  has fields: scores, quizHistory, vizSessions, streak
async function fetchAllUsers() {
  // 1. Get all user docs
  const usersSnap = await getDocs(collection(db, "users"));
  const users = [];

  for (const userDoc of usersSnap.docs) {
    const uid  = userDoc.id;
    const data = userDoc.data() || {};

    // 2. Get progress sub-doc
    let progress = {};
    try {
      const progSnap = await getDoc(doc(db, "users", uid, "progress", "data"));
      if (progSnap.exists()) progress = progSnap.data() || {};
    } catch { /* skip */ }

    const scores       = progress.scores        || {};
    const quizHistory  = progress.quizHistory   || [];
    const vizSessions  = progress.vizSessions   || [];
    const streakData   = progress.streak        || {};

    const scoreVals = Object.values(scores).filter(v => typeof v === "number");
    const avgScore  = scoreVals.length ? Math.round(scoreVals.reduce((a,b)=>a+b,0)/scoreVals.length) : 0;
    const mastered  = scoreVals.filter(v => v >= 80).length;

    users.push({
      uid,
      name:      data.displayName  || data.name  || "Anonymous",
      email:     data.email        || "",
      photoURL:  data.photoURL     || null,
      provider:  data.provider     || "password",
      createdAt: toMs(data.createdAt    || data.created_at),
      lastLogin: toMs(data.lastLoginAt  || data.last_login || data.lastLogin),
      scores,
      quizCount:   scoreVals.length,
      avgScore,
      mastered,
      vizCount:    vizSessions.length,
      streak:      typeof streakData === "number" ? streakData : (streakData.count || streakData.current || 0),
      quizHistory: quizHistory.slice(-30),
      vizSessions: vizSessions.slice(-30),
    });
  }

  // Sort by most recent login
  users.sort((a,b) => (b.lastLogin || 0) - (a.lastLogin || 0));
  return users;
}

// ── Sub-components ────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="adm-stat-card">
      <div className="adm-stat-icon-wrap" style={{ background:`${color}18`, border:`1px solid ${color}28` }}>
        <Icon size={16} color={color} />
      </div>
      <div className="adm-stat-body">
        <div className="adm-stat-value">{value}</div>
        <div className="adm-stat-label">{label}</div>
        {sub && <div className="adm-stat-sub">{sub}</div>}
      </div>
    </div>
  );
}
function ProgBar({ val, max=100, color="#007acc" }) {
  const pct = Math.min(100, max>0 ? Math.round((val/max)*100) : 0);
  return <div className="adm-prog-track"><div className="adm-prog-fill" style={{ width:`${pct}%`, background:color }} /></div>;
}
function ScorePill({ score }) {
  const c = scoreColor(score);
  return <span className="adm-score-pill" style={{ color:c, background:`${c}18`, border:`1px solid ${c}28` }}>{score}%</span>;
}
function TagBadge({ label, color }) {
  return <span className="adm-tag" style={{ color, background:`${color}15`, border:`1px solid ${color}25` }}>{label}</span>;
}
function Avatar({ user:u }) {
  return u.photoURL
    ? <img src={u.photoURL} alt="" className="adm-avatar" />
    : <div className="adm-avatar adm-avatar-text">{u.name?.[0]?.toUpperCase()||"?"}</div>;
}
function SortTh({ col, active, asc, onClick, children }) {
  return (
    <th className={`sortable ${active?"sort-active":""}`} onClick={() => onClick(col)}>
      <span className="th-inner">
        {children}
        {active ? (asc ? <FiChevronUp size={10}/> : <FiChevronDown size={10}/>) : null}
      </span>
    </th>
  );
}
function EmptyRow({ cols, msg="No data yet." }) {
  return <tr><td colSpan={cols} className="adm-td-empty">{msg}</td></tr>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminDashboard({ onLogout }) {
  const [tab,        setTab]        = useState("overview");
  const [collapsed,  setCollapsed]  = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState(null);

  const [users,   setUsers]   = useState([]);
  const [summary, setSummary] = useState({
    totalUsers:0, activeToday:0, totalSessions:0,
    totalQuizzes:0, avgScore:0, masterRate:0,
  });

  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("all");
  const [sortCol, setSortCol] = useState("lastLogin");
  const [sortAsc, setSortAsc] = useState(false);

  // ── Fetch directly from Firestore ─────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const all = await fetchAllUsers();
      setUsers(all);

      const now     = Date.now();
      const dayMs   = 86_400_000;
      const actToday= all.filter(u => now - (u.lastLogin||0) < dayMs).length;
      const allScores= all.flatMap(u => Object.values(u.scores||{}).filter(v=>typeof v==="number"));
      const avgScore = allScores.length ? Math.round(allScores.reduce((a,b)=>a+b,0)/allScores.length) : 0;
      const totQuiz  = all.reduce((s,u) => s+(u.quizCount||0), 0);
      const totViz   = all.reduce((s,u) => s+(u.vizCount||0),  0);
      const totMast  = all.reduce((s,u) => s+(u.mastered||0),  0);

      setSummary({
        totalUsers:    all.length,
        activeToday:   actToday,
        totalSessions: totViz,
        totalQuizzes:  totQuiz,
        avgScore,
        masterRate: totQuiz>0 ? Math.round((totMast/totQuiz)*100) : 0,
      });
    } catch(e) {
      console.error("Admin Firestore error:", e);
      setError(e.message || "Failed to load user data from Firestore.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const chapterStats = Object.entries(CHAPTER_LABELS).map(([id, label]) => {
    const vals = users.flatMap(u =>
      Object.entries(u.scores||{}).filter(([k])=>CHAPTER_MAP[k]===id).map(([,v])=>v)
    ).filter(v=>typeof v==="number");
    const avg = vals.length ? Math.round(vals.reduce((a,b)=>a+b,0)/vals.length) : 0;
    return { id, label, count:vals.length, avg, color:CHAPTER_COLORS[id] };
  }).sort((a,b)=>b.count-a.count);

  const programMap = {};
  users.forEach(u => {
    Object.entries(u.scores||{}).forEach(([key,val]) => {
      if (!programMap[key]) programMap[key] = { count:0, total:0 };
      programMap[key].count++;
      programMap[key].total += val;
    });
  });
  const topPrograms = Object.entries(programMap)
    .map(([key,{count,total}]) => ({
      key,
      label: key.split("_").map(w=>w[0].toUpperCase()+w.slice(1)).join(" "),
      count,
      avg: Math.round(total/count),
    }))
    .sort((a,b)=>b.count-a.count).slice(0,10);

  const activityFeed = users.flatMap(u => [
    ...(u.quizHistory||[]).map(h=>({ type:"quiz", user:u.name, label:h.label, score:h.score, ts:h.ts })),
    ...(u.vizSessions||[]).map(s=>({ type:"viz",  user:u.name, label:s.label, steps:s.steps, ts:s.ts })),
  ]).sort((a,b)=>(b.ts||0)-(a.ts||0)).slice(0,30);

  const leaderboard = [...users].filter(u=>u.streak>0).sort((a,b)=>b.streak-a.streak).slice(0,10);

  const filteredUsers = users
    .filter(u => {
      const q = search.toLowerCase();
      const matchQ = !q || (u.name||"").toLowerCase().includes(q) || (u.email||"").toLowerCase().includes(q);
      const matchF =
        filter==="all"    ? true :
        filter==="active" ? u.streak>0 :
        filter==="master" ? u.mastered>=3 :
        filter==="new"    ? u.quizCount===0 : true;
      return matchQ && matchF;
    })
    .sort((a,b) => {
      let va=a[sortCol], vb=b[sortCol];
      if(sortCol==="lastLogin"){ va=va||0; vb=vb||0; }
      if(va<vb) return sortAsc?1:-1;
      if(va>vb) return sortAsc?-1:1;
      return 0;
    });

  const handleSort = col => {
    if(sortCol===col) setSortAsc(a=>!a);
    else { setSortCol(col); setSortAsc(false); }
  };

  const NAV = [
    { id:"overview",  label:"Overview",  Icon:FiGrid      },
    { id:"users",     label:"Users",     Icon:FiUsers     },
    { id:"analytics", label:"Analytics", Icon:FiBarChart2 },
    { id:"activity",  label:"Activity",  Icon:FiActivity  },
  ];

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="adm-loader">
      <div className="adm-loader-inner">
        <div className="adm-loader-brand"><FiShield size={20} color="#007acc"/><span>VisuAlgo Admin</span></div>
        <div className="adm-spinner"/>
        <p>Loading user data from Firestore…</p>
      </div>
    </div>
  );

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) return (
    <div className="adm-root">
      <aside className="adm-sidebar">
        <div className="adm-sidebar-head">
          <div className="adm-sidebar-brand">
            <div className="adm-brand-icon"><FiShield size={15} color="#007acc"/></div>
            <div className="adm-brand-text">
              <span className="adm-brand-name">VisuAlgo</span>
              <span className="adm-brand-tag">ADMIN</span>
            </div>
          </div>
        </div>
        <div className="adm-sidebar-foot">
          <button className="adm-nav-btn adm-signout-btn" onClick={onLogout}>
            <FiLogOut size={15}/><span>Sign Out</span>
          </button>
        </div>
      </aside>
      <div className="adm-main">
        <header className="adm-topbar">
          <div className="adm-topbar-left"><h1 className="adm-topbar-title">Admin Dashboard</h1></div>
          <div className="adm-topbar-right">
            <button className={`adm-icon-btn ${refreshing?"adm-spinning":""}`} onClick={fetchAll}>
              <FiRefreshCw size={14}/>
            </button>
          </div>
        </header>
        <div className="adm-content">
          <div className="adm-setup-guide">
            <h2 className="adm-setup-title" style={{color:"#f44747"}}>Firestore Error</h2>
            <p className="adm-setup-desc">{error}</p>
            <div className="adm-setup-steps">
              <div className="adm-setup-step">
                <span className="adm-step-num">1</span>
                <div>
                  <strong>Check Firestore Rules</strong>
                  <p>Make sure your Firestore security rules allow admin reads on the <code>users</code> collection.</p>
                  <code className="adm-code-block">{"allow read: if request.auth.token.email in ['dhaya00011@gmail.com','inpa233@gmail.com'];"}</code>
                </div>
              </div>
              <div className="adm-setup-step">
                <span className="adm-step-num">2</span>
                <div>
                  <strong>Check Firebase Console</strong>
                  <p>Verify the <code>users</code> collection exists and has documents in Firestore.</p>
                </div>
              </div>
              <div className="adm-setup-step">
                <span className="adm-step-num">3</span>
                <div>
                  <strong>Retry</strong>
                  <p>Click the refresh button above after fixing the rules.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Main Dashboard ────────────────────────────────────────────────────────
  return (
    <div className={`adm-root ${collapsed?"adm-collapsed":""}`}>

      {/* Sidebar */}
      <aside className="adm-sidebar">
        <div className="adm-sidebar-head">
          <div className="adm-sidebar-brand">
            <div className="adm-brand-icon"><FiShield size={15} color="#007acc"/></div>
            {!collapsed && (
              <div className="adm-brand-text">
                <span className="adm-brand-name">VisuAlgo</span>
                <span className="adm-brand-tag">ADMIN</span>
              </div>
            )}
          </div>
          <button className="adm-collapse-btn" onClick={()=>setCollapsed(c=>!c)}>
            {collapsed ? <FiMenu size={14}/> : <FiX size={14}/>}
          </button>
        </div>
        <nav className="adm-nav">
          {!collapsed && <span className="adm-nav-section-label">Navigation</span>}
          {NAV.map(({id,label,Icon})=>(
            <button key={id}
              className={`adm-nav-btn ${tab===id?"adm-nav-active":""}`}
              onClick={()=>setTab(id)}
              title={collapsed?label:undefined}
            >
              <Icon size={15}/>
              {!collapsed && <span>{label}</span>}
            </button>
          ))}
        </nav>
        <div className="adm-sidebar-foot">
          <button className="adm-nav-btn adm-signout-btn" onClick={onLogout} title={collapsed?"Sign Out":undefined}>
            <FiLogOut size={15}/>
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="adm-main">
        <header className="adm-topbar">
          <div className="adm-topbar-left">
            <h1 className="adm-topbar-title">{NAV.find(n=>n.id===tab)?.label}</h1>
            <span className="adm-topbar-sub">
              {summary.totalUsers} users &nbsp;&middot;&nbsp; {summary.activeToday} active today
            </span>
          </div>
          <div className="adm-topbar-right">
            <div className="adm-backend-chip">
              <FiWifi size={11} color="#4ec9b0"/>
              <span>Firestore connected</span>
            </div>
            <button className={`adm-icon-btn ${refreshing?"adm-spinning":""}`} onClick={fetchAll} title="Refresh">
              <FiRefreshCw size={14}/>
            </button>
            <div className="adm-admin-chip">
              <FiShield size={12} color="#007acc"/>
              <span>Admin</span>
            </div>
          </div>
        </header>

        {/* ── OVERVIEW ── */}
        {tab==="overview" && (
          <div className="adm-content fade-in">
            <div className="adm-stats-row">
              <StatCard icon={FiUsers}      label="Total Users"         value={summary.totalUsers}    color="#007acc" sub={`${summary.activeToday} active today`}/>
              <StatCard icon={FiActivity}   label="Visualizer Sessions" value={summary.totalSessions} color="#4ec9b0" sub="total runs"/>
              <StatCard icon={FiTarget}     label="Quizzes Taken"       value={summary.totalQuizzes}  color="#fd9e5a" sub="total attempts"/>
              <StatCard icon={FiBarChart2}  label="Platform Avg Score"  value={summary.avgScore?`${summary.avgScore}%`:"—"} color="#c586c0" sub="all programs"/>
              <StatCard icon={FiAward}      label="Mastery Rate"        value={`${summary.masterRate}%`} color="#4ec9b0" sub="scores 80+"/>
              <StatCard icon={FiTrendingUp} label="Active Streaks"      value={users.filter(u=>u.streak>0).length} color="#007acc" sub="users"/>
            </div>

            <div className="adm-two-col">
              <div className="adm-card">
                <div className="adm-card-head">
                  <span className="adm-card-title">Chapter Engagement</span>
                  <span className="adm-card-sub">Quiz attempts per chapter</span>
                </div>
                <div className="adm-chapter-list">
                  {chapterStats.map(ch => {
                    const maxCount = Math.max(...chapterStats.map(c=>c.count),1);
                    return (
                      <div key={ch.id} className="adm-chapter-row">
                        <div className="adm-chapter-name">{ch.label}</div>
                        <div className="adm-chapter-bar-wrap"><ProgBar val={ch.count} max={maxCount} color={ch.color}/></div>
                        <div className="adm-chapter-meta">
                          <span className="adm-chapter-count">{ch.count}</span>
                          {ch.count>0 && <ScorePill score={ch.avg}/>}
                        </div>
                      </div>
                    );
                  })}
                  {chapterStats.every(c=>c.count===0) && <p className="adm-empty-msg">No quiz data yet.</p>}
                </div>
              </div>

              <div className="adm-card">
                <div className="adm-card-head">
                  <span className="adm-card-title">Top Programs</span>
                  <span className="adm-card-sub">By number of attempts</span>
                </div>
                <div className="adm-top-prog-list">
                  {topPrograms.map((p,i)=>(
                    <div key={p.key} className="adm-top-prog-row">
                      <span className="adm-rank-num">{i+1}</span>
                      <span className="adm-prog-name">{p.label}</span>
                      <span className="adm-prog-count">{p.count}x</span>
                      <ScorePill score={p.avg}/>
                    </div>
                  ))}
                  {topPrograms.length===0 && <p className="adm-empty-msg">No data yet.</p>}
                </div>
              </div>
            </div>

            <div className="adm-card">
              <div className="adm-card-head">
                <span className="adm-card-title">Recent Users</span>
                <button className="adm-text-btn" onClick={()=>setTab("users")}>
                  View all <FiChevronDown size={11} style={{transform:"rotate(-90deg)"}}/>
                </button>
              </div>
              <div className="adm-recent-users">
                {users.slice(0,5).map(u=>(
                  <div key={u.uid} className="adm-recent-user-row">
                    <Avatar user={u}/>
                    <div className="adm-ru-info">
                      <span className="adm-ru-name">{u.name}</span>
                      <span className="adm-ru-email">{u.email}</span>
                    </div>
                    <div className="adm-ru-tags">
                      <TagBadge label={`${u.quizCount} quizzes`} color="#007acc"/>
                      {u.streak>0 && <TagBadge label={`${u.streak}d streak`} color="#fd9e5a"/>}
                    </div>
                    <span className="adm-ru-time">{timeAgo(u.lastLogin)}</span>
                  </div>
                ))}
                {users.length===0 && <p className="adm-empty-msg">No users registered yet.</p>}
              </div>
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {tab==="users" && (
          <div className="adm-content fade-in">
            <div className="adm-toolbar">
              <div className="adm-search-box">
                <FiSearch size={13} className="adm-search-ico"/>
                <input className="adm-search-input" placeholder="Search by name or email…"
                  value={search} onChange={e=>setSearch(e.target.value)}/>
                {search && <button className="adm-search-clear" onClick={()=>setSearch("")}><FiX size={12}/></button>}
              </div>
              <div className="adm-filter-row">
                {[{id:"all",label:"All"},{id:"active",label:"Active Streak"},{id:"master",label:"3+ Mastered"},{id:"new",label:"No Quizzes"}]
                  .map(f=>(
                    <button key={f.id}
                      className={`adm-filter-btn ${filter===f.id?"active":""}`}
                      onClick={()=>setFilter(f.id)}
                    >{f.label}</button>
                  ))}
              </div>
              <span className="adm-result-count">{filteredUsers.length} users</span>
            </div>

            <div className="adm-card adm-table-card">
              <div className="adm-table-scroll">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th className="adm-th-num">#</th>
                      <SortTh col="name"      active={sortCol==="name"}      asc={sortAsc} onClick={handleSort}>User</SortTh>
                      <SortTh col="lastLogin" active={sortCol==="lastLogin"} asc={sortAsc} onClick={handleSort}>Last Login</SortTh>
                      <SortTh col="quizCount" active={sortCol==="quizCount"} asc={sortAsc} onClick={handleSort}>Quizzes</SortTh>
                      <SortTh col="avgScore"  active={sortCol==="avgScore"}  asc={sortAsc} onClick={handleSort}>Avg Score</SortTh>
                      <SortTh col="mastered"  active={sortCol==="mastered"}  asc={sortAsc} onClick={handleSort}>Mastered</SortTh>
                      <SortTh col="vizCount"  active={sortCol==="vizCount"}  asc={sortAsc} onClick={handleSort}>Viz Runs</SortTh>
                      <SortTh col="streak"    active={sortCol==="streak"}    asc={sortAsc} onClick={handleSort}>Streak</SortTh>
                      <th>Provider</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length===0
                      ? <EmptyRow cols={9} msg="No users match your filters."/>
                      : filteredUsers.map((u,i)=>(
                        <tr key={u.uid} className="adm-tr">
                          <td className="adm-th-num adm-td-muted">{i+1}</td>
                          <td>
                            <div className="adm-user-cell">
                              <Avatar user={u}/>
                              <div>
                                <div className="adm-user-name">{u.name}</div>
                                <div className="adm-user-email">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="adm-td-muted">{timeAgo(u.lastLogin)}</td>
                          <td><span className="adm-td-num">{u.quizCount}</span></td>
                          <td>{u.quizCount>0?<ScorePill score={u.avgScore}/>:<span className="adm-td-muted">—</span>}</td>
                          <td><span className="adm-td-num">{u.mastered}</span></td>
                          <td><span className="adm-td-num">{u.vizCount}</span></td>
                          <td>
                            {u.streak>0
                              ? <TagBadge label={`${u.streak}d`} color="#fd9e5a"/>
                              : <span className="adm-td-muted">—</span>
                            }
                          </td>
                          <td>
                            <TagBadge
                              label={u.provider==="google"?"Google":"Email"}
                              color={u.provider==="google"?"#4285f4":"#4ec9b0"}
                            />
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {tab==="analytics" && (
          <div className="adm-content fade-in">
            <div className="adm-two-col">
              <div className="adm-card">
                <div className="adm-card-head">
                  <span className="adm-card-title">Score Distribution</span>
                  <span className="adm-card-sub">Users grouped by avg quiz score</span>
                </div>
                <div className="adm-dist-chart">
                  {[
                    {label:"80–100",color:"#4ec9b0",min:80,max:100},
                    {label:"60–79", color:"#007acc",min:60,max:79 },
                    {label:"40–59", color:"#fd9e5a",min:40,max:59 },
                    {label:"0–39",  color:"#f44747",min:0, max:39 },
                  ].map(b=>{
                    const quizzed = users.filter(u=>u.quizCount>0);
                    const cnt = quizzed.filter(u=>u.avgScore>=b.min&&u.avgScore<=b.max).length;
                    const pct = quizzed.length>0 ? Math.round(cnt/quizzed.length*100) : 0;
                    return (
                      <div key={b.label} className="adm-dist-col">
                        <div className="adm-dist-bar-track">
                          <div className="adm-dist-bar-fill" style={{height:`${Math.max(pct,4)}%`,background:b.color}}/>
                        </div>
                        <span className="adm-dist-pct" style={{color:b.color}}>{pct}%</span>
                        <span className="adm-dist-range">{b.label}%</span>
                        <span className="adm-dist-cnt">{cnt} users</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="adm-card">
                <div className="adm-card-head">
                  <span className="adm-card-title">Engagement Tiers</span>
                  <span className="adm-card-sub">Users segmented by activity</span>
                </div>
                <div className="adm-tier-list">
                  {[
                    {label:"Power Users",     desc:"10+ quizzes, 80%+ avg",  color:"#4ec9b0", fn:u=>u.quizCount>=10&&u.avgScore>=80},
                    {label:"Active Learners", desc:"5–9 quizzes attempted",  color:"#007acc", fn:u=>u.quizCount>=5&&u.quizCount<10 },
                    {label:"Casual Users",    desc:"1–4 quizzes attempted",  color:"#fd9e5a", fn:u=>u.quizCount>=1&&u.quizCount<5  },
                    {label:"New Users",       desc:"Registered, no quizzes", color:"#555",    fn:u=>u.quizCount===0                 },
                  ].map(t=>{
                    const cnt = users.filter(t.fn).length;
                    const pct = users.length>0 ? Math.round(cnt/users.length*100) : 0;
                    return (
                      <div key={t.label} className="adm-tier-row">
                        <div className="adm-tier-dot" style={{background:t.color}}/>
                        <div className="adm-tier-info">
                          <span className="adm-tier-label">{t.label}</span>
                          <span className="adm-tier-desc">{t.desc}</span>
                        </div>
                        <div className="adm-tier-right">
                          <span className="adm-tier-count" style={{color:t.color}}>{cnt}</span>
                          <span className="adm-tier-pct">{pct}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="adm-card">
              <div className="adm-card-head">
                <span className="adm-card-title">Program Performance</span>
                <span className="adm-card-sub">Avg score and pass rate per algorithm</span>
              </div>
              <div className="adm-table-scroll">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Program</th><th>Attempts</th><th>Avg Score</th>
                      <th style={{width:180}}>Score Bar</th><th>Pass Rate (60+)</th><th>Mastery Rate (80+)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPrograms.length===0
                      ? <EmptyRow cols={6}/>
                      : topPrograms.map(p=>{
                          const allVals = users.flatMap(u=>
                            Object.entries(u.scores||{}).filter(([k])=>k===p.key).map(([,v])=>v)
                          );
                          const passRate    = allVals.length ? Math.round(allVals.filter(v=>v>=60).length/allVals.length*100) : 0;
                          const masteryRate = allVals.length ? Math.round(allVals.filter(v=>v>=80).length/allVals.length*100) : 0;
                          return (
                            <tr key={p.key} className="adm-tr">
                              <td className="adm-user-name">{p.label}</td>
                              <td><span className="adm-td-num">{p.count}</span></td>
                              <td><ScorePill score={p.avg}/></td>
                              <td><ProgBar val={p.avg} color={scoreColor(p.avg)}/></td>
                              <td style={{color:scoreColor(passRate)}}>{passRate}%</td>
                              <td style={{color:scoreColor(masteryRate)}}>{masteryRate}%</td>
                            </tr>
                          );
                        })
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── ACTIVITY ── */}
        {tab==="activity" && (
          <div className="adm-content fade-in">
            <div className="adm-two-col">
              <div className="adm-card">
                <div className="adm-card-head">
                  <span className="adm-card-title">Activity Feed</span>
                  <span className="adm-card-sub">Latest quiz and visualizer events</span>
                </div>
                <div className="adm-feed">
                  {activityFeed.length===0
                    ? <p className="adm-empty-msg">No activity recorded yet.</p>
                    : activityFeed.map((item,i)=>(
                      <div key={i} className="adm-feed-item">
                        <div className="adm-feed-dot" style={{background:item.type==="quiz"?scoreColor(item.score):"#007acc"}}/>
                        <div className="adm-feed-body">
                          <span className="adm-feed-user">{item.user}</span>
                          <span className="adm-feed-action">{item.type==="quiz"?" completed quiz on ":" visualized "}</span>
                          <span className="adm-feed-prog">{item.label}</span>
                        </div>
                        <div className="adm-feed-meta">
                          {item.type==="quiz"
                            ? <ScorePill score={item.score}/>
                            : <TagBadge label={`${item.steps||0} steps`} color="#007acc"/>
                          }
                          <span className="adm-feed-time">{timeAgo(item.ts)}</span>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>

              <div className="adm-card">
                <div className="adm-card-head">
                  <span className="adm-card-title">Streak Leaderboard</span>
                  <span className="adm-card-sub">Top active day streaks</span>
                </div>
                <div className="adm-leaderboard">
                  {leaderboard.length===0
                    ? <p className="adm-empty-msg">No active streaks yet.</p>
                    : leaderboard.map((u,i)=>(
                      <div key={u.uid} className="adm-lb-row">
                        <span className={`adm-lb-rank ${i<3?"adm-lb-top":""}`}>{i+1}</span>
                        <Avatar user={u}/>
                        <div className="adm-lb-info">
                          <span className="adm-user-name">{u.name}</span>
                          <span className="adm-user-email">{u.email}</span>
                        </div>
                        <div className="adm-lb-bar-wrap">
                          <div className="adm-lb-bar" style={{width:`${Math.min(u.streak*5,100)}%`}}/>
                        </div>
                        <span className="adm-lb-streak">{u.streak}d</span>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
