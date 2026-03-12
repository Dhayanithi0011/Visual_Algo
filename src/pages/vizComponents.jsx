// ─────────────────────────────────────────────────────────────────────────────
// VIZ COMPONENTS — SortViz, SearchViz, StackViz, GraphViz, HeapViz
// Separated from Visualizer.jsx for maintainability
// ─────────────────────────────────────────────────────────────────────────────

export function SortViz({ step }) {
  if (!step?.arr) return null;
  const max = Math.max(...step.arr, 1);
  return (
    <div className="sort-viz">
      {step.arr.map((v, i) => (
        <div key={i} className="sort-bar-wrap">
          <div
            className={[
              "sort-bar",
              i === step.hj ? "compare-a" : "",
              i === step.hj + 1 ? "compare-b" : "",
              step.swapped === i ? "swapped" : "",
              step.sorted?.includes(i) ? "sorted-bar" : "",
              step.minIdx === i ? "min-bar" : "",
            ].filter(Boolean).join(" ")}
            style={{ height: `${Math.max(8, (v / max) * 180)}px` }}
          />
          <span className="bar-val">{v}</span>
        </div>
      ))}
    </div>
  );
}

export function SearchViz({ step }) {
  if (!step?.arr) return null;
  return (
    <div className="search-viz">
      {step.arr.map((v, i) => (
        <div
          key={i}
          className={[
            "search-cell",
            i === step.searchIdx ? "search-current" : "",
            i === step.found ? "search-found" : "",
            i === step.mid ? "search-mid" : "",
            step.lo !== -1 && step.hi !== -1 && i >= step.lo && i <= step.hi && step.found === -1 ? "search-range" : "",
          ].filter(Boolean).join(" ")}
        >
          <div className="search-val">{v}</div>
          <div className="search-idx">{i}</div>
        </div>
      ))}
    </div>
  );
}

export function StackViz({ step, compact = false }) {
  if (!step?.stack) return null;
  const frames = step.stack;
  if (frames.length === 0) return null;

  if (compact) {
    return (
      <div className="stack-viz-compact">
        <div className="stack-viz-compact-header">
          <span className="svc-title">Call Stack</span>
          <span className="stack-depth-badge">{frames.length} frame{frames.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="stack-compact-frames">
          {frames.map((frame, i) => {
            const isActive = i === 0;
            const isReturn = frame.returning;
            return (
              <div
                key={i}
                className={[
                  "stack-compact-frame",
                  isActive ? "scf-active"    : "scf-lower",
                  isReturn ? "scf-returning" : "",
                ].filter(Boolean).join(" ")}
              >
                <div className="scf-header">
                  <span className="scf-num">#{frames.length - i}</span>
                  <span className="scf-name">{frame.fn}</span>
                  {isActive && !isReturn && <span className="scf-badge scf-active-badge">ACTIVE</span>}
                  {isReturn  && <span className="scf-badge scf-return-badge">↩ RET</span>}
                  {!isActive && !isReturn && <span className="scf-badge scf-wait-badge">wait</span>}
                </div>
                {Object.entries(frame.vars || {}).slice(0, 4).map(([k, v]) => (
                  <span key={k} className={`scf-var ${k.startsWith("↩") ? "scf-var-ret" : ""}`}>
                    <span className="scf-vname">{k}</span>
                    <span className="scf-veq">=</span>
                    <span className="scf-vval">{String(v)}</span>
                  </span>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="stack-viz">
      <div className="viz-section-label">
        Call Stack <span className="viz-tip">(top = currently executing)</span>
      </div>
      <div className="stack-depth-hint">Depth: {frames.length} frame{frames.length !== 1 ? "s" : ""}</div>
      <div className="stack-frames-list">
        {frames.map((frame, i) => {
          const isActive = i === 0;
          const isReturning = frame.returning;
          return (
            <div
              key={i}
              className={[
                "frame-box",
                isActive ? "frame-top" : "frame-lower",
                isReturning ? "frame-returning" : "",
              ].filter(Boolean).join(" ")}
            >
              <div className="frame-header">
                <div className="frame-name-wrap">
                  <span className="frame-depth-num">#{frames.length - i}</span>
                  <span className="frame-name">{frame.fn}</span>
                </div>
                {isActive && !isReturning && <span className="frame-badge">ACTIVE</span>}
                {isReturning && <span className="frame-badge frame-badge-return">↩ RETURN</span>}
                {!isActive && !isReturning && <span className="frame-badge-waiting">waiting</span>}
              </div>
              {Object.entries(frame.vars || {}).length > 0 && (
                <div className="frame-vars">
                  {Object.entries(frame.vars).map(([k, v]) => (
                    <div key={k} className={`frame-var ${k.startsWith("↩") ? "frame-var-return" : ""}`}>
                      <span className="var-name">{k}</span>
                      <span className="var-eq">=</span>
                      <span className="var-val">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}
              {frames.length > 1 && i < frames.length - 1 && (
                <div className="frame-connector">▾ called from</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const GRAPH_NODE_POSITIONS = {
  0: { x: 200, y: 55  },
  1: { x: 100, y: 155 },
  2: { x: 300, y: 155 },
  3: { x: 40,  y: 265 },
  4: { x: 160, y: 265 },
  5: { x: 300, y: 265 },
};
const GRAPH_EDGES = [[0,1],[0,2],[1,3],[1,4],[2,5]];

export function GraphViz({ step, algorithmKey }) {
  if (!step) return null;
  const topVars = step.stack?.[0]?.vars || {};

  const parseSet = (s) => {
    if (!s) return new Set();
    return new Set(String(s).replace(/[{}]/g, "").split(",").map(v => parseInt(v.trim())).filter(n => !isNaN(n)));
  };
  const parseArr = (s) => {
    if (!s) return [];
    return String(s).replace(/[\[\]]/g, "").split(",").map(v => parseInt(v.trim())).filter(n => !isNaN(n));
  };

  const visited      = parseSet(topVars.visited || "");
  const queueArr     = parseArr(topVars.queue || "");
  const orderArr     = parseArr(topVars.order || "");
  const activeNode   = topVars.node !== undefined ? parseInt(topVars.node) : topVars.start !== undefined ? parseInt(topVars.start) : -1;
  const enqueuedNode = topVars.enqueued !== undefined ? parseInt(topVars.enqueued) : -1;

  const orderMap = {};
  orderArr.forEach((n, i) => { orderMap[n] = i + 1; });

  const getState = (id) => {
    if (id === activeNode)     return "active";
    if (id === enqueuedNode)   return "enqueued";
    if (visited.has(id))       return "visited";
    if (queueArr.includes(id)) return "queued";
    return "unvisited";
  };

  const C = {
    active:    { fill: "rgba(200,245,66,0.22)",  stroke: "#c8f542",              label: "#c8f542" },
    enqueued:  { fill: "rgba(92,184,255,0.18)",  stroke: "#5cb8ff",              label: "#5cb8ff" },
    visited:   { fill: "rgba(200,245,66,0.07)",  stroke: "rgba(200,245,66,0.45)",label: "#e0e0e0" },
    queued:    { fill: "rgba(255,170,60,0.15)",  stroke: "#ffaa3c",              label: "#ffaa3c" },
    unvisited: { fill: "rgba(255,255,255,0.03)", stroke: "#333",                 label: "#555"   },
  };

  const W = 400, H = 330, R = 24;

  const edgeState = (a, b) => {
    const aIdx = orderArr.indexOf(a), bIdx = orderArr.indexOf(b);
    if (aIdx !== -1 && bIdx !== -1) return "traversed";
    if (a === activeNode || b === activeNode) return "active";
    return "default";
  };

  return (
    <div className="graph-viz-wrap card">
      <div className="viz-section-label" style={{ marginBottom: 8 }}>
        {algorithmKey === "bfs" ? "BFS" : "DFS"} — Graph Traversal
        <span className="viz-tip"> nodes light up as the algorithm visits them</span>
      </div>
      <div className="graph-legend">
        <span className="gl-item" style={{ color: "#c8f542" }}>● Active</span>
        <span className="gl-item" style={{ color: "rgba(200,245,66,0.6)" }}>● Visited</span>
        <span className="gl-item" style={{ color: "#ffaa3c" }}>● {algorithmKey === "bfs" ? "In Queue" : "In Stack"}</span>
        <span className="gl-item" style={{ color: "#5cb8ff" }}>● Just Enqueued</span>
        <span className="gl-item" style={{ color: "#444" }}>● Unvisited</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxHeight: 310, display: "block" }}>
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#2a2a2a" />
          </marker>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {GRAPH_EDGES.map(([a, b]) => {
          const pa = GRAPH_NODE_POSITIONS[a], pb = GRAPH_NODE_POSITIONS[b];
          const es = edgeState(a, b);
          const dx = pb.x - pa.x, dy = pb.y - pa.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          const ux = dx/dist, uy = dy/dist;
          return (
            <line key={`e${a}-${b}`}
              x1={pa.x + ux*R} y1={pa.y + uy*R} x2={pb.x - ux*R} y2={pb.y - uy*R}
              stroke={es === "active" ? "rgba(200,245,66,0.7)" : es === "traversed" ? "rgba(200,245,66,0.3)" : "#2a2a2a"}
              strokeWidth={es === "active" ? 2.5 : es === "traversed" ? 2 : 1.5}
              strokeDasharray={es === "default" ? "5,4" : "none"}
              style={{ transition: "stroke 0.3s, stroke-width 0.3s" }}
            />
          );
        })}
        {Object.entries(GRAPH_NODE_POSITIONS).map(([idStr, pos]) => {
          const id = parseInt(idStr), state = getState(id), col = C[state], badge = orderMap[id];
          return (
            <g key={id} style={{ transition: "all 0.3s" }}>
              {state === "active" && (
                <circle cx={pos.x} cy={pos.y} r={R + 9} fill="none" stroke="rgba(200,245,66,0.15)" strokeWidth={8} filter="url(#glow)" />
              )}
              <circle cx={pos.x} cy={pos.y} r={R} fill={col.fill} stroke={col.stroke} strokeWidth={state === "active" ? 2.5 : 1.5} style={{ transition: "fill 0.3s, stroke 0.3s" }} />
              <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="central" fill={col.label} fontSize={15} fontWeight={state === "active" ? "700" : "500"} fontFamily="Space Mono, monospace">{id}</text>
              {badge !== undefined && (
                <g>
                  <circle cx={pos.x + R - 2} cy={pos.y - R + 2} r={11} fill="#c8f542" stroke="#0f0f0f" strokeWidth={1.5} />
                  <text x={pos.x + R - 2} y={pos.y - R + 2} textAnchor="middle" dominantBaseline="central" fill="#0f0f0f" fontSize={9} fontWeight="900" fontFamily="Space Mono, monospace">{badge}</text>
                </g>
              )}
            </g>
          );
        })}
        {queueArr.length > 0 && (
          <g>
            <text x={8} y={H - 28} fill="#555" fontSize={10} fontFamily="Space Mono, monospace">{algorithmKey === "bfs" ? "Queue →" : "Stack →"}</text>
            {queueArr.map((n, i) => (
              <g key={i}>
                <rect x={74 + i*34} y={H - 42} width={28} height={24} rx={5} fill="rgba(255,170,60,0.13)" stroke="#ffaa3c" strokeWidth={1.5} />
                <text x={74 + i*34 + 14} y={H - 27} textAnchor="middle" dominantBaseline="central" fill="#ffaa3c" fontSize={12} fontWeight="700" fontFamily="Space Mono, monospace">{n}</text>
              </g>
            ))}
          </g>
        )}
        {orderArr.length > 0 && (
          <g>
            <text x={8} y={H - 6} fill="#555" fontSize={10} fontFamily="Space Mono, monospace">Order:</text>
            <text x={60} y={H - 6} fill="#c8f542" fontSize={10} fontWeight="700" fontFamily="Space Mono, monospace">{orderArr.join(" → ")}</text>
          </g>
        )}
      </svg>
    </div>
  );
}

export function HeapViz({ step }) {
  if (!step?.heap || Object.keys(step.heap).length === 0) return null;
  const entries = Object.entries(step.heap);
  return (
    <div className="heap-viz">
      <div className="viz-section-label">Heap Memory (Objects)</div>
      <div className="heap-nodes">
        {entries.map(([id, obj], i) => (
          <div key={id} className="heap-node-wrap">
            <div className="heap-node">
              <div className="heap-node-id">{id}</div>
              {Object.entries(obj).map(([k, v]) => (
                <div key={k} className="heap-field">
                  <span className="field-key">{k}:</span>
                  <span className="field-val">{String(v)}</span>
                </div>
              ))}
            </div>
            {i < entries.length - 1 && <div className="heap-arrow">→</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
