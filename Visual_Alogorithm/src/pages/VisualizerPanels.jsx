// ─────────────────────────────────────────────────────────────────────────────
// VISUALIZER PANELS — TheoryPanel + ChapterSidebar
// Separated from Visualizer.jsx for maintainability
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from "react";
import {
  FiBook, FiSettings, FiSearch, FiZap, FiBookOpen,
  FiChevronRight, FiChevronDown, FiClock, FiDatabase
} from "react-icons/fi";
import { CHAPTERS, DIFF_COLORS } from "./visualizerData";

export function TheoryPanel({ theory }) {
  if (!theory) {
    return (
      <div className="theory-panel">
        <div className="theory-empty">
          <FiBookOpen size={28} color="var(--text-dim)" />
          <p>No theory available for this program yet.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="theory-panel">
      <div className="theory-title">{theory.title}</div>

      <div className="theory-section">
        <div className="theory-section-label">
          <FiBook size={13} color="#a78bfa" style={{flexShrink:0}} />
          <span>Concept</span>
        </div>
        <p className="theory-concept">{theory.concept}</p>
      </div>

      <div className="theory-section">
        <div className="theory-section-label">
          <FiSettings size={13} color="#60a5fa" style={{flexShrink:0}} />
          <span>How It Works</span>
        </div>
        <ol className="theory-steps">
          {theory.howItWorks.map((step, i) => (
            <li key={i}>
              <span className="theory-step-num">{String(i + 1).padStart(2, "0")}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="theory-section theory-example">
        <div className="theory-section-label">
          <FiSearch size={13} color="#34d399" style={{flexShrink:0}} />
          <span>Example</span>
        </div>
        <div className="theory-example-input">
          <span className="theory-label">Input</span>
          <code>{theory.example.input}</code>
        </div>
        <div className="theory-trace">
          {theory.example.trace.map((line, i) => (
            <div key={i} className="theory-trace-line">
              <span className="theory-trace-num">{i + 1}</span>
              <span>{line}</span>
            </div>
          ))}
        </div>
        <div className="theory-example-output">
          <span className="theory-label">Output</span>
          <code className="theory-output-val">{theory.example.output}</code>
        </div>
      </div>

      <div className="theory-complexity-row">
        <div className="theory-complexity-badge">
          <span className="theory-complexity-label">
            <FiClock size={11} color="#fb923c" />
            <span>Time</span>
          </span>
          <span className="theory-complexity-val">{theory.complexity.time}</span>
        </div>
        <div className="theory-complexity-badge">
          <span className="theory-complexity-label">
            <FiDatabase size={11} color="#38bdf8" />
            <span>Space</span>
          </span>
          <span className="theory-complexity-val">{theory.complexity.space}</span>
        </div>
      </div>

      <div className="theory-key-insight">
        <FiZap size={15} color="#fbbf24" style={{flexShrink:0, marginTop:2}} />
        <span>{theory.keyInsight}</span>
      </div>
    </div>
  );
}

export function ChapterSidebar({ selectedKey, onSelect }) {
  const [openChapters, setOpenChapters] = useState({ recursion: true });
  const toggle = (id) => setOpenChapters(p => ({ ...p, [id]: !p[id] }));

  return (
    <div className="chapter-sidebar">
      <div className="sidebar-title">Programs</div>
      {CHAPTERS.map(ch => (
        <div key={ch.id} className="chapter-group">
          <button className="chapter-header" onClick={() => toggle(ch.id)}>
            <span className="chapter-label">{ch.label}</span>
            {openChapters[ch.id] ? <FiChevronDown size={13} /> : <FiChevronRight size={13} />}
          </button>
          {openChapters[ch.id] && (
            <div className="chapter-programs">
              {ch.programs.map(p => (
                <button
                  key={p.key}
                  className={`program-btn ${selectedKey === p.key ? "program-active" : ""}`}
                  onClick={() => onSelect(ch, p)}
                >
                  <span className="program-name">{p.label}</span>
                  <span className={`diff-badge ${DIFF_COLORS[p.difficulty]}`}>{p.difficulty}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
