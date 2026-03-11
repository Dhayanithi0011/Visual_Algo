import { FiArrowRight, FiCode, FiCpu, FiZap, FiLayers, FiTarget } from "react-icons/fi";
import "./Home.css";

const features = [
  {
    icon: FiCode,
    color: "var(--accent)",
    title: "Real-Time Code Visualizer",
    desc: "Write code and watch memory, call stacks, and data structures animate step by step.",
    tag: "Visualizer",
    tagClass: "badge-accent",
  },
  {
    icon: FiCpu,
    color: "var(--teal)",
    title: "AI Learning Gap Detector",
    desc: "Upload quiz results or notes. The AI builds a concept dependency graph and finds exactly where your knowledge breaks down.",
    tag: "AI-Powered",
    tagClass: "badge-green",
  },
  {
    icon: FiTarget,
    color: "var(--orange)",
    title: "Personalized Learning Path",
    desc: "Get a custom step-by-step remediation plan that targets your specific blind spots, not just generic tips.",
    tag: "Adaptive",
    tagClass: "badge-orange",
  },
  {
    icon: FiLayers,
    color: "var(--purple)",
    title: "Algorithm-Specific Modes",
    desc: "Sorting bars, tree traversals, BFS/DFS node animation — specialized visualizations auto-detected from your code.",
    tag: "Smart",
    tagClass: "badge-purple",
  },
];

const stats = [
  { value: "20+", label: "Algorithm Programs" },
  { value: "6", label: "DSA Chapters" },
  { value: "AI", label: "Gap Detection" },
  { value: "Live", label: "Step-by-Step" },
];

export default function Home({ onNavigate }) {
  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-inner">
            <div className="hero-text fade-in">
              <div className="hero-label">
                <span className="badge badge-accent">VisuAlgo</span>
                <span className="hero-label-text">DSA Learning Platform</span>
              </div>
              <h1 className="hero-title">
                See your code
                <br />
                <span className="hero-title-accent">think out loud.</span>
              </h1>
              <p className="hero-desc">
                VisuAlgo combines real-time code execution visualization with AI-powered
                learning gap detection — so you don't just run code, you understand it.
              </p>
              <div className="hero-cta">
                <button className="btn btn-primary" onClick={() => onNavigate("visualizer")}>
                  Open Visualizer
                  <FiArrowRight size={16} />
                </button>
                <button className="btn btn-outline" onClick={() => onNavigate("learning")}>
                  Detect My Gaps
                </button>
              </div>
            </div>

            <div className="hero-preview fade-in">
              <div className="preview-window">
                <div className="preview-bar">
                  <span className="dot red" />
                  <span className="dot yellow" />
                  <span className="dot green" />
                  <span className="preview-title">factorial.py</span>
                </div>
                <div className="preview-body">
                  <div className="code-lines">
                    <div className="code-line active">
                      <span className="line-num">1</span>
                      <span className="code-text kw">def</span>
                      <span className="code-text"> factorial(n):</span>
                    </div>
                    <div className="code-line">
                      <span className="line-num">2</span>
                      <span className="code-text indent kw">if</span>
                      <span className="code-text"> n == 0:</span>
                    </div>
                    <div className="code-line">
                      <span className="line-num">3</span>
                      <span className="code-text indent2 kw">return</span>
                      <span className="code-text num"> 1</span>
                    </div>
                    <div className="code-line highlight">
                      <span className="line-num">4</span>
                      <span className="code-text indent kw">return</span>
                      <span className="code-text"> n * factorial(n</span>
                      <span className="code-text op">-</span>
                      <span className="code-text num">1</span>
                      <span className="code-text">)</span>
                    </div>
                  </div>
                  <div className="stack-preview">
                    <div className="stack-label">Call Stack</div>
                    <div className="stack-frames">
                      <div className="stack-frame current">factorial(3) — n=3</div>
                      <div className="stack-frame">factorial(2) — n=2</div>
                      <div className="stack-frame">factorial(1) — n=1</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-bar">
        <div className="container">
          <div className="stats-inner">
            {stats.map((s, i) => (
              <div key={i} className="stat-item">
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="container">
          <div className="section-label">What We Built</div>
          <h2 className="section-title">Two tools. One platform.</h2>
          <div className="features-grid">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div className="feature-card card" key={i}>
                  <div className="feature-icon-wrap" style={{ color: f.color }}>
                    <Icon size={22} />
                  </div>
                  <span className={`badge ${f.tagClass}`}>{f.tag}</span>
                  <h3 className="feature-title">{f.title}</h3>
                  <p className="feature-desc">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="workflow">
        <div className="container">
          <div className="workflow-inner">
            <div className="workflow-text">
              <div className="section-label">How It Works</div>
              <h2 className="section-title">From code to clarity.</h2>
              <div className="workflow-steps">
                {[
                  { n: "01", t: "Write or Paste Code", d: "Use the Monaco-style editor to write Python, JavaScript, or C++ code." },
                  { n: "02", t: "Step Through Execution", d: "Hit Play or Step. Watch memory, stacks, and variables update live." },
                  { n: "03", t: "Upload Your Results", d: "Drop in quiz results or topic list. The AI maps your concept dependencies." },
                  { n: "04", t: "Get Your Learning Path", d: "Receive a targeted plan to fix exactly what is blocking your progress." },
                ].map((s) => (
                  <div className="workflow-step" key={s.n}>
                    <span className="step-num">{s.n}</span>
                    <div>
                      <div className="step-title">{s.t}</div>
                      <div className="step-desc">{s.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="workflow-cta">
              <div className="card cta-card">
                <FiZap size={32} color="var(--accent)" />
                <h3>Ready to start?</h3>
                <p>Pick a tool and begin learning smarter.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button className="btn btn-primary" onClick={() => onNavigate("visualizer")}>
                    Launch Visualizer
                  </button>
                  <button className="btn btn-outline" onClick={() => onNavigate("learning")}>
                    Find My Blind Spots
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
