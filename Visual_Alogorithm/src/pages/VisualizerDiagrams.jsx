// ═══════════════════════════════════════════════════════════════════════════
//  VisualizerDiagrams.jsx  — ALL 9 BUGS FIXED
//  Fix #1: Hanoi pegs show disks PERMANENTLY (cumulative state from allSteps)
//  Fix #2: Quick sort partition range corrected (partLow/partHigh fields)
//  Fix #3: Linked list carries lastHeap so diagram never goes blank
//  Fix #4: Merge sort highlights currently-merging subarray
//  Fix #5: Queue parser uses proper string split, not char-level replace
//  Fix #6: BST layout correct when node has only a right child
//  Fix #7: DFS shows call-stack strip (reads from step.stack frames)
//  Fix #8: Knapsack reads weights/values/capacity from step metadata
//  Fix #9: LCS reads s1/s2 from step metadata
// ═══════════════════════════════════════════════════════════════════════════

const C = {
  accent:       "#6c3fdb",
  accentLight:  "rgba(108,63,219,0.12)",
  accentMid:    "rgba(108,63,219,0.35)",
  accentBorder: "rgba(108,63,219,0.55)",
  blue:         "#1a6fb5",
  blueLight:    "rgba(26,111,181,0.12)",
  blueBorder:   "rgba(26,111,181,0.5)",
  teal:         "#0e8f7f",
  tealLight:    "rgba(14,143,127,0.12)",
  tealBorder:   "rgba(14,143,127,0.5)",
  orange:       "#c05c1a",
  orangeLight:  "rgba(192,92,26,0.13)",
  orangeBorder: "rgba(192,92,26,0.5)",
  red:          "#b52a2a",
  redLight:     "rgba(181,42,42,0.12)",
  redBorder:    "rgba(181,42,42,0.5)",
  purple:       "#8b3fbf",
  purpleLight:  "rgba(139,63,191,0.12)",
  purpleBorder: "rgba(139,63,191,0.5)",
  bg:           "#ffffff",
  bgSubtle:     "#f4f3f0",
  border:       "#d8d5cf",
  text:         "#1a1a1a",
  muted:        "#6b6760",
  dim:          "#a09d98",
  edgeLine:     "#c5c2bc",
  mono: "JetBrains Mono, Fira Code, monospace",
  sans: "Inter, system-ui, sans-serif",
};

const mono  = { fontFamily: C.mono };
const label = { ...mono, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, marginBottom: 10 };
const card  = { background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" };

const Legend = ({ items }) => (
  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
    {items.map(({ color, label: l }) => (
      <span key={l} style={{ ...mono, fontSize: 10, color, display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ width: 10, height: 10, background: color, borderRadius: 2, display: "inline-block" }} />
        {l}
      </span>
    ))}
  </div>
);

const pSet = s => new Set(String(s || "").replace(/[{}]/g, "").split(",").map(v => parseInt(v.trim())).filter(n => !isNaN(n)));
const pArr = s => String(s || "").replace(/[\[\]]/g, "").split(",").map(v => parseInt(v.trim())).filter(n => !isNaN(n));

// ═══════════════════════════════════════════════════════════════════════════
// 1. RECURSION
// ═══════════════════════════════════════════════════════════════════════════

function mkFactTree(n, id = { v: 0 }) {
  const nd = { id: id.v++, label: `fact(${n})`, val: n, children: [] };
  if (n > 0) nd.children.push(mkFactTree(n - 1, id));
  return nd;
}
function mkFibTree(n, id = { v: 0 }, d = 0) {
  const nd = { id: id.v++, label: `fib(${n})`, val: n, children: [], d };
  if (n > 1 && d < 4) { nd.children.push(mkFibTree(n - 1, id, d + 1)); nd.children.push(mkFibTree(n - 2, id, d + 1)); }
  return nd;
}
function layoutTree(root, yGap = 50, xGap = 80) {
  let counter = { v: 0 };
  function lay(nd, depth) {
    if (!nd.children?.length) { nd.x = counter.v++ * xGap; nd.y = depth * yGap; }
    else { nd.children.forEach(c => lay(c, depth + 1)); const xs = nd.children.map(c => c.x); nd.x = (Math.min(...xs) + Math.max(...xs)) / 2; nd.y = depth * yGap; }
  }
  lay(root, 0); return root;
}
function allNodes(root) { const out = []; const walk = n => { out.push(n); n.children?.forEach(walk); }; walk(root); return out; }
function allEdges(root) { const out = []; const walk = n => { n.children?.forEach(c => { out.push([n, c]); walk(c); }); }; walk(root); return out; }

function CallTreeSVG({ root, activeLabel, returningLabel }) {
  if (!root) return null;
  const nodes = allNodes(root), edges = allEdges(root);
  const NW = 72, NH = 30, NR = NH / 2, PAD = 12;
  const minNX = Math.min(...nodes.map(n => n.x)), minNY = Math.min(...nodes.map(n => n.y));
  const maxNX = Math.max(...nodes.map(n => n.x)), maxNY = Math.max(...nodes.map(n => n.y));
  const svgW = (maxNX - minNX) + NW + PAD * 2, svgH = (maxNY - minNY) + NH + PAD * 2;
  const offX = PAD + NW / 2 - minNX, offY = PAD + NR - minNY;
  return (
    <svg width={svgW} height={svgH} style={{ display: "block", minWidth: svgW }}>
      {edges.map(([p, ch], i) => (
        <line key={i} x1={p.x + offX} y1={p.y + offY + NR} x2={ch.x + offX} y2={ch.y + offY - NR} stroke={C.edgeLine} strokeWidth={1.5} />
      ))}
      {nodes.map(n => {
        const isActive = n.label === activeLabel, isReturning = n.label === returningLabel, isBase = n.val === 0 || n.val <= 1;
        const fill  = isActive ? C.accentLight : isReturning ? C.blueLight  : isBase ? C.tealLight : C.bgSubtle;
        const stroke= isActive ? C.accent      : isReturning ? C.blue       : isBase ? C.teal      : C.border;
        const tc    = isActive ? C.accent      : isReturning ? C.blue       : isBase ? C.teal      : C.text;
        const cx = n.x + offX, cy = n.y + offY;
        return (
          <g key={n.id}>
            <rect x={cx - NW/2} y={cy - NR} width={NW} height={NH} rx={6} fill={fill} stroke={stroke} strokeWidth={isActive ? 2 : 1} style={{ transition: "fill .2s, stroke .2s" }} />
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fill={tc} fontSize={11} fontWeight={isActive ? "700" : "500"} fontFamily={C.mono}>{n.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── FIX #1: Tower of Hanoi — persistent peg state built from cumulative moves ───
function buildHanoiPegState(n, moves) {
  // Start: all n disks on peg A, largest at bottom
  const pegs = { A: Array.from({ length: n }, (_, i) => n - i), B: [], C: [] };
  for (const { disk, from, to } of moves) {
    const src = pegs[from];
    const dst = pegs[to];
    const idx = src.lastIndexOf(disk);
    if (idx !== -1) src.splice(idx, 1);
    dst.push(disk);
  }
  return pegs;
}

function HanoiPegs({ step }) {
  // Read structured data embedded directly by the simulator — no regex, no scanning
  const n = step.hanoiN || 3;
  const movesUpTo = Array.isArray(step.hanoiMoves) ? step.hanoiMoves : [];

  const pegs = buildHanoiPegState(n, movesUpTo);
  const lastMove = movesUpTo[movesUpTo.length - 1] || null;

  const pegNames = ["A", "B", "C"];
  const pegXs    = { A: 70, B: 210, C: 350 };
  const W = 420, baseY = 178, diskH = 20, diskGap = 2;
  const maxDiskW = 90, minDiskW = 28;

  return (
    <div style={card}>
      <div style={label}>Tower of Hanoi — Peg State (Persistent)</div>
      {lastMove ? (
        <div style={{ fontFamily: C.mono, fontSize: 12, color: C.accent, background: C.accentLight, border: `1px solid ${C.accentBorder}`, borderRadius: 6, padding: "5px 10px", marginBottom: 10 }}>
          🔄 Last move: Disk {lastMove.disk}  {lastMove.from} → {lastMove.to} &nbsp;
          <span style={{ color: C.muted }}>({movesUpTo.length} of {Math.pow(2, n) - 1} total moves)</span>
        </div>
      ) : (
        <div style={{ fontFamily: C.mono, fontSize: 12, color: C.muted, marginBottom: 10 }}>
          All {n} disks start on peg A. Step through to see moves.
        </div>
      )}
      <svg viewBox={`0 0 ${W} 215`} width="100%" style={{ maxHeight: 215, display: "block" }}>
        {/* Base platform */}
        <rect x={10} y={baseY + diskH + diskGap} width={W - 20} height={9} rx={4} fill={C.bgSubtle} stroke={C.border} strokeWidth={1.5} />

        {pegNames.map(peg => {
          const cx = pegXs[peg];
          const isActive = lastMove && (lastMove.from === peg || lastMove.to === peg);
          const diskStack = pegs[peg] || [];
          return (
            <g key={peg}>
              {/* Peg rod */}
              <rect x={cx - 5} y={38} width={10} height={baseY - 38 + diskH + diskGap} rx={4}
                fill={isActive ? C.accentMid : C.border} />
              {/* Peg label */}
              <text x={cx} y={210} textAnchor="middle"
                fill={isActive ? C.accent : C.muted}
                fontSize={16} fontWeight="700" fontFamily={C.mono}>{peg}</text>
              {/* Disks — index 0 = bottom of peg (largest), drawn bottom-up */}
              {diskStack.map((diskNum, stackIdx) => {
                const dw = minDiskW + ((diskNum - 1) / Math.max(n - 1, 1)) * (maxDiskW - minDiskW);
                const dy = baseY - stackIdx * (diskH + diskGap);
                const isJustMoved = lastMove?.disk === diskNum && lastMove?.to === peg;
                return (
                  <g key={diskNum}>
                    <rect x={cx - dw / 2} y={dy} width={dw} height={diskH} rx={5}
                      fill={isJustMoved ? C.accentLight : C.tealLight}
                      stroke={isJustMoved ? C.accent : C.teal}
                      strokeWidth={isJustMoved ? 2.5 : 1.5}
                      style={{ transition: "all .3s" }} />
                    <text x={cx} y={dy + diskH / 2} textAnchor="middle" dominantBaseline="central"
                      fill={isJustMoved ? C.accent : C.teal}
                      fontSize={10} fontWeight="700" fontFamily={C.mono}>{diskNum}</text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
      <div style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, marginTop: 4 }}>
        Disk 1 = smallest (top) · Disk {n} = largest (bottom) · Minimum moves needed: {Math.pow(2, n) - 1}
      </div>
    </div>
  );
}

function SumArrayViz({ step }) {
  const vars = step.stack?.[0]?.vars || {};
  const items = String(vars.arr || "[]").replace(/[\[\]]/g, "").split(",").map(s => s.trim()).filter(Boolean);
  const firstEl = vars["arr[0]"], ret = vars["↩ return"];
  return (
    <div style={card}>
      <div style={label}>Array at This Recursive Call</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        {items.map((v, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ width: 46, height: 46, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: C.mono, fontSize: 15, fontWeight: "700", background: i === 0 ? C.accentLight : C.bgSubtle, border: `1.5px solid ${i === 0 ? C.accent : C.border}`, color: i === 0 ? C.accent : C.muted, transition: "all .2s" }}>{v}</div>
            <div style={{ fontFamily: C.mono, fontSize: 9, color: C.dim }}>[{i}]</div>
          </div>
        ))}
        {items.length === 0 && <div style={{ padding: "8px 16px", borderRadius: 7, border: `1.5px dashed ${C.border}`, fontFamily: C.mono, fontSize: 12, color: C.dim }}>[ ] — base case</div>}
      </div>
      {firstEl !== undefined && <div style={{ marginTop: 10, fontFamily: C.mono, fontSize: 12, color: C.accent }}>arr[0] = {firstEl} → adding to recursive result</div>}
      {ret !== undefined && <div style={{ marginTop: 6, fontFamily: C.mono, fontSize: 13, color: C.blue, fontWeight: "700" }}>↩ returning {String(ret)}</div>}
    </div>
  );
}

export function RecursionDiagram({ step, programKey, allSteps, currentStepIdx }) {
  if (!step) return null;
  if (programKey === "tower_of_hanoi") return <HanoiPegs step={step} />;
  if (programKey === "sum_array")      return <SumArrayViz step={step} />;

  const activeFrame = step.stack?.[0];
  const fn = activeFrame?.fn || "", nVar = activeFrame?.vars?.n;
  const n = nVar !== undefined ? parseInt(nVar) : undefined;
  const isReturning = !!activeFrame?.returning;
  const stepsToScan = Array.isArray(allSteps) && allSteps.length > 0 ? allSteps : [step];
  let rootN = programKey === "fibonacci" ? 5 : 4;
  for (const s of stepsToScan) for (const f of (s.stack || [])) { const v = f.vars?.n; if (v !== undefined) { const num = parseInt(v); if (!isNaN(num) && num > rootN) rootN = num; } }
  rootN = Math.min(rootN, 9);
  const root = programKey === "fibonacci" ? layoutTree(mkFibTree(rootN)) : layoutTree(mkFactTree(rootN));
  const fnLabel = programKey === "fibonacci" ? "fib" : "fact";
  const isFnActive = fn === fnLabel || fn === "fib" || fn === "factorial";
  const activeLabel = isFnActive && n !== undefined ? `${fnLabel}(${n})` : "";
  const returningLabel = isReturning ? activeLabel : "";
  return (
    <div className="diag-card-scroll">
      <div style={{ position: "sticky", left: 0, ...label, marginBottom: 8 }}>Recursion Tree</div>
      <Legend items={[{ color: C.accent, label: "Active call" }, { color: C.blue, label: "Returning" }, { color: C.teal, label: "Base case" }]} />
      <CallTreeSVG root={root} activeLabel={activeLabel} returningLabel={returningLabel} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. SORTING  (Fix #2: quick sort partition range; Fix #4: merge sort highlight)
// ═══════════════════════════════════════════════════════════════════════════

export function SortingDiagram({ step, programKey }) {
  if (!step?.arr) return null;
  const arr = step.arr, max = Math.max(...arr, 1);
  const W = 420, H = 190, bGap = 5;
  const bW = Math.max(12, Math.floor((W - bGap * (arr.length - 1)) / arr.length));

  const getBarStyle = i => {
    if (step.sorted?.includes(i))  return { fill: C.tealLight,   stroke: C.teal   };
    if (i === step.swapped)        return { fill: C.accentLight, stroke: C.accent };
    if (i === step.hj)             return { fill: C.orangeLight, stroke: C.orange };
    if (i === step.hj + 1 && programKey !== "quick_sort") return { fill: C.redLight, stroke: C.red };
    if (i === step.minIdx)         return { fill: C.purpleLight, stroke: C.purple };
    // FIX #2: quick sort uses explicit partLow/partHigh fields (set by simulation)
    if (programKey === "quick_sort" && step.partLow !== undefined && step.partHigh !== undefined && i >= step.partLow && i <= step.partHigh)
      return { fill: C.blueLight, stroke: C.blue };
    // FIX #4: merge sort highlights actively-merging subarray via mergeLeft/mergeRight
    if (programKey === "merge_sort" && step.mergeLeft !== undefined && step.mergeRight !== undefined && i >= step.mergeLeft && i <= step.mergeRight)
      return { fill: C.blueLight, stroke: C.blue };
    return { fill: C.bgSubtle, stroke: C.border };
  };

  return (
    <div style={card}>
      <div style={label}>Array Visualization</div>
      <Legend items={[
        { color: C.orange, label: "Compare A" },
        ...(programKey !== "quick_sort" ? [{ color: C.red, label: "Compare B" }] : []),
        { color: C.accent, label: "Swapped / Placed" },
        { color: C.teal,   label: "Sorted" },
        { color: C.purple, label: "Minimum" },
        { color: C.blue,   label: programKey === "merge_sort" ? "Merging range" : "Partition range" },
      ]} />
      <svg viewBox={`0 0 ${W} ${H + 32}`} width="100%" style={{ maxHeight: 230 }}>
        {arr.map((v, i) => {
          const bh = Math.max(10, (v / max) * (H - 10));
          const x = i * (bW + bGap), y = H - bh;
          const { fill, stroke } = getBarStyle(i);
          return (
            <g key={i}>
              <rect x={x} y={y} width={bW} height={bh} rx={4} fill={fill} stroke={stroke} strokeWidth={1.5} style={{ transition: "height .15s, y .15s, fill .15s" }} />
              {bh > 22 && <text x={x + bW / 2} y={y + 13} textAnchor="middle" fill={stroke} fontSize={9} fontWeight="700" fontFamily={C.mono}>{v}</text>}
              <text x={x + bW / 2} y={H + 14} textAnchor="middle" fill={stroke} fontSize={Math.min(11, bW - 1)} fontFamily={C.mono}>{v}</text>
              <text x={x + bW / 2} y={H + 27} textAnchor="middle" fill={C.dim} fontSize={9} fontFamily={C.mono}>{i}</text>
            </g>
          );
        })}
        {/* FIX #2: pivot marker at correct pivotIdx */}
        {programKey === "quick_sort" && step.pivotIdx >= 0 && (
          <line x1={step.pivotIdx * (bW + bGap) + bW / 2} y1={0} x2={step.pivotIdx * (bW + bGap) + bW / 2} y2={H}
            stroke={C.orange} strokeWidth={2} strokeDasharray="5,3" />
        )}
      </svg>
      {programKey === "merge_sort" && step.note?.includes("Split") && (
        <div style={{ marginTop: 8, fontFamily: C.mono, fontSize: 11, color: C.blue, background: C.blueLight, border: `1px solid ${C.blueBorder}`, borderRadius: 6, padding: "6px 10px" }}>
          ✂ {step.note.replace(/^.*?:\s*/, "")}
        </div>
      )}
      {programKey === "quick_sort" && step.partLow !== undefined && (
        <div style={{ marginTop: 8, fontFamily: C.mono, fontSize: 11, color: C.blue, background: C.blueLight, border: `1px solid ${C.blueBorder}`, borderRadius: 6, padding: "6px 10px" }}>
          Partition [{step.partLow}…{step.partHigh}] · pivot = arr[{step.pivotIdx}] = {arr[step.pivotIdx] ?? ""}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. SEARCHING
// ═══════════════════════════════════════════════════════════════════════════

export function SearchingDiagram({ step }) {
  if (!step?.arr) return null;
  const { arr, searchIdx, found, mid, lo, hi } = step;
  return (
    <div style={card}>
      <div style={label}>Array Search Visualization</div>
      <Legend items={[{ color: C.orange, label: "Checking" }, { color: C.blue, label: "Midpoint" }, { color: C.accent, label: "Found!" }, { color: C.purple, label: "Search range" }]} />
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
        {arr.map((v, i) => {
          const isCur = i === searchIdx, isFnd = i === found, isMid = i === mid;
          const inRng = lo !== -1 && hi !== -1 && i >= lo && i <= hi && found === -1;
          const bg = isFnd ? C.accentLight : isCur ? C.orangeLight : isMid ? C.blueLight : inRng ? C.purpleLight : C.bgSubtle;
          const bc = isFnd ? C.accent      : isCur ? C.orange      : isMid ? C.blue      : inRng ? C.purple      : C.border;
          const tc = isFnd ? C.accent      : isCur ? C.orange      : isMid ? C.blue      : C.muted;
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <div style={{ height: 16, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                {isCur && !isFnd && <span style={{ color: C.orange, fontSize: 13 }}>▼</span>}
                {isMid && !isFnd && <span style={{ color: C.blue,   fontSize: 13 }}>▼</span>}
                {isFnd          && <span style={{ color: C.accent,  fontSize: 13 }}>★</span>}
              </div>
              <div style={{ width: 46, height: 46, background: bg, border: `1.5px solid ${bc}`, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: C.mono, fontSize: 14, fontWeight: "700", color: tc, transition: "all .2s" }}>{v}</div>
              <div style={{ fontFamily: C.mono, fontSize: 9, color: C.dim }}>{i}</div>
              <div style={{ fontFamily: C.mono, fontSize: 9, color: C.muted, height: 12, textAlign: "center" }}>
                {i === lo && i === hi ? "lo=hi" : i === lo ? "lo" : i === hi ? "hi" : ""}
              </div>
            </div>
          );
        })}
      </div>
      {lo !== -1 && hi !== -1 && found === -1 && (
        <div style={{ fontFamily: C.mono, fontSize: 12, color: C.blue, background: C.blueLight, border: `1px solid ${C.blueBorder}`, borderRadius: 6, padding: "5px 10px", marginTop: 4 }}>
          Range [{lo} … {hi}]{mid !== -1 ? `   mid = ${mid}` : ""}
        </div>
      )}
      {found !== -1 && (
        <div style={{ fontFamily: C.mono, fontSize: 13, color: C.accent, fontWeight: "700", background: C.accentLight, border: `1px solid ${C.accentBorder}`, borderRadius: 6, padding: "6px 12px", marginTop: 6 }}>
          ✅ Found at index {found}!  arr[{found}] = {arr[found]}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. DATA STRUCTURES
// ═══════════════════════════════════════════════════════════════════════════

// FIX #3: use step.heap OR step.lastHeap so diagram never goes blank
export function LinkedListDiagram({ step }) {
  const heap    = step?.heap || step?.lastHeap || {};
  const vars    = step?.stack?.[0]?.vars || {};
  const curAddr = String(vars.cur || "");
  const entries = Object.entries(heap);
  const W = Math.max(380, entries.length * 130 + 20);
  const NH = 54, NW = 90, gap = 40;
  return (
    <div style={card}>
      <div style={label}>Linked List — Memory Layout</div>
      {entries.length === 0 ? (
        <div style={{ color: C.dim, fontSize: 12, fontFamily: C.sans }}>Nodes appear as they are allocated.</div>
      ) : (
        <svg viewBox={`0 0 ${W} ${NH + 70}`} width="100%" style={{ maxHeight: 160 }}>
          <defs><marker id="llarr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill={C.muted} /></marker></defs>
          {entries.map(([addr, obj], i) => {
            const isCur = curAddr === addr || curAddr.includes(addr);
            return (
              <g key={addr}>
                <rect x={i*(NW+gap)+10} y={8} width={NW} height={NH} rx={8} fill={isCur ? C.accentLight : C.bgSubtle} stroke={isCur ? C.accent : C.border} strokeWidth={isCur ? 2 : 1.5} />
                <text x={i*(NW+gap)+10+NW/2} y={28} textAnchor="middle" fill={isCur ? C.accent : C.text} fontSize={18} fontWeight="700" fontFamily={C.mono}>{obj.val}</text>
                <line x1={i*(NW+gap)+11} y1={44} x2={i*(NW+gap)+10+NW-1} y2={44} stroke={C.border} strokeWidth={1} />
                <text x={i*(NW+gap)+10+NW/2} y={56} textAnchor="middle" fill={C.dim} fontSize={9} fontFamily={C.mono}>{obj.next === "None" ? "None →" : obj.next}</text>
                <text x={i*(NW+gap)+10+NW/2} y={NH+22} textAnchor="middle" fill={C.dim} fontSize={8} fontFamily={C.mono}>{addr}</text>
                {isCur && <text x={i*(NW+gap)+10+NW/2} y={NH+36} textAnchor="middle" fill={C.accent} fontSize={9} fontWeight="700" fontFamily={C.mono}>▲ cur</text>}
                {obj.next !== "None" && i < entries.length - 1 && (
                  <line x1={i*(NW+gap)+10+NW} y1={8+NH/2} x2={i*(NW+gap)+10+NW+gap-2} y2={8+NH/2} stroke={C.muted} strokeWidth={1.5} markerEnd="url(#llarr)" />
                )}
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}

export function StackImplDiagram({ step }) {
  const vars  = step?.stack?.[0]?.vars || {};
  const items = String(vars.stack || "[]").replace(/[\[\]]/g, "").split(",").map(s => s.trim()).filter(Boolean).reverse();
  return (
    <div style={card}>
      <div style={label}>Stack — LIFO (Last In, First Out)</div>
      <div style={{ display: "flex", gap: 24, alignItems: "flex-end" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 0, minWidth: 130 }}>
          {items.length === 0 && <div style={{ width: 130, height: 48, border: `1.5px dashed ${C.border}`, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: C.mono, fontSize: 12, color: C.dim }}>empty</div>}
          {items.map((v, i) => (
            <div key={i} style={{ width: 130, height: 48, position: "relative", background: i === 0 ? C.accentLight : C.bgSubtle, border: `1.5px solid ${i === 0 ? C.accent : C.border}`, borderRadius: i === 0 ? "7px 7px 0 0" : i === items.length-1 ? "0 0 7px 7px" : "0", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: C.mono, fontSize: 17, fontWeight: "700", color: i === 0 ? C.accent : C.muted, transition: "all .2s" }}>
              {v}
              {i === 0 && <span style={{ position: "absolute", right: -54, fontFamily: C.mono, fontSize: 10, color: C.accent, whiteSpace: "nowrap" }}>← TOP</span>}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontFamily: C.mono, fontSize: 13, color: C.accent, background: C.accentLight, border: `1px solid ${C.accentBorder}`, borderRadius: 6, padding: "6px 14px" }}>size = {items.length}</div>
          {items.length > 0 && <div style={{ fontFamily: C.mono, fontSize: 12, color: C.muted, background: C.bgSubtle, border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 14px" }}>top = <span style={{ color: C.accent, fontWeight: "700" }}>{items[0]}</span></div>}
          <div style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, maxWidth: 120 }}>push → top<br />pop  ← top</div>
        </div>
      </div>
    </div>
  );
}

// FIX #5: Queue parser — proper string split, no character-level replace
export function QueueImplDiagram({ step }) {
  const vars = step?.stack?.[0]?.vars || {};
  const rawQueue = String(vars.queue || "[]");
  // Properly strip deque([ ... ]) or [ ... ] wrappers, then split on comma
  const cleaned = rawQueue
    .replace(/^deque\(\[/, "").replace(/\]\)$/, "")
    .replace(/^\[/, "").replace(/\]$/, "").trim();
  const items = cleaned === "" ? [] : cleaned.split(",").map(s => s.trim().replace(/^['"]|['"]$/g, "")).filter(Boolean);
  const dequeuedRaw = vars.dequeued ? String(vars.dequeued).replace(/^['"]|['"]$/g, "") : null;
  return (
    <div style={card}>
      <div style={label}>Queue — FIFO (First In, First Out)</div>
      <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto" }}>
        <div style={{ fontFamily: C.mono, fontSize: 10, color: C.blue, marginRight: 10, flexShrink: 0 }}>BACK<br />← enqueue</div>
        {items.length === 0 ? (
          <div style={{ width: 120, height: 52, border: `1.5px dashed ${C.border}`, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: C.mono, fontSize: 11, color: C.dim }}>empty</div>
        ) : (
          [...items].reverse().map((v, i) => {
            const isFront = i === items.length - 1;
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ width: 56, height: 52, background: isFront ? C.accentLight : C.bgSubtle, border: `1.5px solid ${isFront ? C.accent : C.border}`, borderRadius: i === 0 ? "0 7px 7px 0" : isFront ? "7px 0 0 7px" : "0", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: C.mono, fontSize: 14, fontWeight: "700", color: isFront ? C.accent : C.muted, transition: "all .2s" }}>'{v}'</div>
                {isFront && <div style={{ fontFamily: C.mono, fontSize: 9, color: C.accent }}>FRONT</div>}
              </div>
            );
          })
        )}
        <div style={{ fontFamily: C.mono, fontSize: 10, color: C.accent, marginLeft: 10, flexShrink: 0 }}>FRONT<br />dequeue →</div>
      </div>
      {dequeuedRaw && (
        <div style={{ marginTop: 10, fontFamily: C.mono, fontSize: 12, color: C.orange, background: C.orangeLight, border: `1px solid ${C.orangeBorder}`, borderRadius: 6, padding: "5px 10px" }}>
          Removed: '{dequeuedRaw}' from front
        </div>
      )}
    </div>
  );
}

// FIX #6: BST layout — correct x when node has only right child
function buildBST(vals) {
  let root = null;
  function ins(nd, v) { if (!nd) return { val: v, left: null, right: null }; if (v < nd.val) nd.left = ins(nd.left, v); else nd.right = ins(nd.right, v); return nd; }
  vals.forEach(v => { root = ins(root, v); });
  return root;
}
function layoutBST(nd, depth = 0, xc = { v: 0 }) {
  if (!nd) return null;
  nd.left  = layoutBST(nd.left,  depth + 1, xc);
  nd.right = layoutBST(nd.right, depth + 1, xc);
  nd.y = depth * 68;
  if (!nd.left && !nd.right) {
    nd.x = xc.v * 62; xc.v++;
  } else if (nd.left && !nd.right) {
    nd.x = nd.left.x;
  } else if (!nd.left && nd.right) {
    // FIX #6: was incorrectly using 0 + right.x
    nd.x = nd.right.x;
  } else {
    nd.x = (nd.left.x + nd.right.x) / 2;
  }
  return nd;
}
function bstNodes(nd, out = []) { if (!nd) return out; bstNodes(nd.left, out); out.push(nd); bstNodes(nd.right, out); return out; }
function bstEdges(nd, out = []) { if (!nd) return out; if (nd.left) { out.push([nd, nd.left]); bstEdges(nd.left, out); } if (nd.right) { out.push([nd, nd.right]); bstEdges(nd.right, out); } return out; }

export function BSTDiagram({ step }) {
  const vars = step?.stack?.[0]?.vars || {};
  const insertingVal = vars.inserting !== undefined ? parseInt(vars.inserting) : null;
  const curVal       = vars.val       !== undefined ? parseInt(vars.val)       : null;
  const insertedStr  = String(vars.inserted_so_far || "");
  const existing = insertedStr && insertedStr !== "∅" ? insertedStr.split(",").map(Number).filter(n => !isNaN(n)) : [5, 3, 7, 1, 4, 6, 8];
  const allVals  = insertingVal && !existing.includes(insertingVal) ? [...existing, insertingVal] : existing;
  const rawRoot  = buildBST(allVals);
  if (!rawRoot) return null;
  const root  = layoutBST(JSON.parse(JSON.stringify(rawRoot)));
  const nodes = bstNodes(root), edges = bstEdges(root);
  const minX  = Math.min(...nodes.map(n => n.x));
  nodes.forEach(n => n.x -= minX - 28);
  const maxX = Math.max(...nodes.map(n => n.x)) + 52;
  const maxY = Math.max(...nodes.map(n => n.y)) + 48;
  const R = 22;
  return (
    <div style={card}>
      <div style={label}>Binary Search Tree</div>
      <Legend items={[{ color: C.accent, label: "Just inserted" }, { color: C.orange, label: "Comparing" }, { color: C.teal, label: "Root" }]} />
      <svg viewBox={`0 0 ${maxX} ${maxY}`} width="100%" style={{ maxHeight: 280 }}>
        {edges.map(([p, ch], i) => <line key={i} x1={p.x} y1={p.y + R} x2={ch.x} y2={ch.y - R} stroke={C.edgeLine} strokeWidth={1.5} />)}
        {nodes.map(n => {
          const ins    = n.val === insertingVal;
          const comp   = n.val === curVal && !ins;
          const isRoot = !nodes.some(o => o.left?.val === n.val || o.right?.val === n.val);
          const fill   = ins ? C.accentLight : comp ? C.orangeLight : isRoot ? C.tealLight : C.bgSubtle;
          const bc     = ins ? C.accent      : comp ? C.orange      : isRoot ? C.teal      : C.border;
          const tc     = ins ? C.accent      : comp ? C.orange      : C.text;
          return (
            <g key={n.val}>
              {ins && <circle cx={n.x} cy={n.y} r={R + 9} fill="none" stroke={C.accentMid} strokeWidth={8} />}
              <circle cx={n.x} cy={n.y} r={R} fill={fill} stroke={bc} strokeWidth={ins ? 2.5 : 1.5} style={{ transition: "all .25s" }} />
              <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central" fill={tc} fontSize={13} fontWeight={ins ? "700" : "500"} fontFamily={C.mono}>{n.val}</text>
            </g>
          );
        })}
      </svg>
      <div style={{ fontFamily: C.mono, fontSize: 11, color: C.dim, marginTop: 6 }}>In-order traversal of a BST always gives sorted output.</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. GRAPH  (Fix #7: DFS shows call-stack strip)
// ═══════════════════════════════════════════════════════════════════════════

const GP = { 0:{x:200,y:52}, 1:{x:100,y:152}, 2:{x:300,y:152}, 3:{x:40,y:262}, 4:{x:160,y:262}, 5:{x:300,y:262} };
const GE = [[0,1],[0,2],[1,3],[1,4],[2,5]];

export function GraphDiagram({ step, algorithmKey }) {
  if (!step) return null;
  const vars = step.stack?.[0]?.vars || {};
  const visited    = pSet(vars.visited || "");
  const queueArr   = pArr(vars.queue  || "");
  const orderArr   = pArr(vars.order  || "");
  const activeNode = vars.node  !== undefined ? parseInt(vars.node)  : vars.start !== undefined ? parseInt(vars.start) : -1;
  const enqueuedN  = vars.enqueued !== undefined ? parseInt(vars.enqueued) : -1;
  const orderMap   = {}; orderArr.forEach((n, i) => { orderMap[n] = i + 1; });

  // FIX #7: DFS call stack — read from step.stack frames that have fn==="dfs"
  const dfsCallStack = algorithmKey === "dfs"
    ? (step.stack || []).filter(f => f.fn === "dfs" && f.vars?.node !== undefined).map(f => parseInt(f.vars.node)).filter(n => !isNaN(n))
    : [];

  const getState = id => {
    if (id === activeNode)     return "active";
    if (id === enqueuedN)      return "enqueued";
    if (visited.has(id))       return "visited";
    if (queueArr.includes(id)) return "queued";
    if (algorithmKey === "dfs" && dfsCallStack.includes(id)) return "queued";
    return "unvisited";
  };

  const NC = {
    active:    { fill: C.accentLight, stroke: C.accent, lbl: C.accent },
    enqueued:  { fill: C.blueLight,   stroke: C.blue,   lbl: C.blue   },
    visited:   { fill: C.tealLight,   stroke: C.teal,   lbl: C.teal   },
    queued:    { fill: C.orangeLight, stroke: C.orange, lbl: C.orange },
    unvisited: { fill: C.bgSubtle,    stroke: C.border, lbl: C.muted  },
  };
  const W = 400, H = 320, R = 24;

  return (
    <div style={card}>
      <div style={label}>{algorithmKey === "bfs" ? "BFS" : "DFS"} — Graph Traversal</div>
      <Legend items={[
        { color: C.accent, label: "Active" },
        { color: C.teal,   label: "Visited" },
        { color: C.orange, label: algorithmKey === "bfs" ? "In Queue" : "On Call Stack" },
        { color: C.blue,   label: "Just Found" },
        { color: C.muted,  label: "Unvisited" },
      ]} />
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxHeight: 300, display: "block" }}>
        {GE.map(([a, b]) => {
          const pa = GP[a], pb = GP[b];
          const dx = pb.x - pa.x, dy = pb.y - pa.y, dist = Math.sqrt(dx*dx+dy*dy);
          const ux = dx/dist, uy = dy/dist;
          const isAct = a === activeNode || b === activeNode;
          const aV = visited.has(a) || a === activeNode, bV = visited.has(b) || b === activeNode;
          return <line key={`${a}-${b}`} x1={pa.x+ux*R} y1={pa.y+uy*R} x2={pb.x-ux*R} y2={pb.y-uy*R}
            stroke={isAct ? C.accentBorder : aV&&bV ? C.tealBorder : C.edgeLine}
            strokeWidth={isAct ? 2.5 : aV&&bV ? 2 : 1.5}
            strokeDasharray={aV&&bV ? "none" : "5,4"}
            style={{ transition: "stroke .3s" }} />;
        })}
        {Object.entries(GP).map(([idS, pos]) => {
          const id = parseInt(idS), st = getState(id), col = NC[st], badge = orderMap[id];
          return (
            <g key={id}>
              {st === "active" && <circle cx={pos.x} cy={pos.y} r={R+9} fill="none" stroke={C.accentMid} strokeWidth={8} />}
              <circle cx={pos.x} cy={pos.y} r={R} fill={col.fill} stroke={col.stroke} strokeWidth={st==="active"?2.5:1.5} style={{ transition: "fill .3s, stroke .3s" }} />
              <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="central" fill={col.lbl} fontSize={15} fontWeight={st==="active"?"700":"500"} fontFamily={C.mono}>{id}</text>
              {badge !== undefined && (
                <g>
                  <circle cx={pos.x+R-2} cy={pos.y-R+2} r={11} fill={C.accent} stroke={C.bg} strokeWidth={1.5} />
                  <text x={pos.x+R-2} y={pos.y-R+2} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={9} fontWeight="900" fontFamily={C.mono}>{badge}</text>
                </g>
              )}
            </g>
          );
        })}
        {/* BFS queue strip */}
        {algorithmKey === "bfs" && queueArr.length > 0 && (
          <g>
            <text x={8} y={H-28} fill={C.dim} fontSize={10} fontFamily={C.mono}>Queue →</text>
            {queueArr.map((n, i) => (
              <g key={i}>
                <rect x={74+i*34} y={H-42} width={28} height={24} rx={5} fill={C.orangeLight} stroke={C.orange} strokeWidth={1.5} />
                <text x={74+i*34+14} y={H-27} textAnchor="middle" dominantBaseline="central" fill={C.orange} fontSize={12} fontWeight="700" fontFamily={C.mono}>{n}</text>
              </g>
            ))}
          </g>
        )}
        {/* FIX #7: DFS call-stack strip */}
        {algorithmKey === "dfs" && dfsCallStack.length > 0 && (
          <g>
            <text x={8} y={H-28} fill={C.dim} fontSize={10} fontFamily={C.mono}>Call Stack →</text>
            {dfsCallStack.map((n, i) => (
              <g key={i}>
                <rect x={100+i*34} y={H-42} width={28} height={24} rx={5} fill={C.orangeLight} stroke={C.orange} strokeWidth={1.5} />
                <text x={100+i*34+14} y={H-27} textAnchor="middle" dominantBaseline="central" fill={C.orange} fontSize={12} fontWeight="700" fontFamily={C.mono}>{n}</text>
              </g>
            ))}
          </g>
        )}
        {orderArr.length > 0 && (
          <g>
            <text x={8} y={H-6} fill={C.dim} fontSize={10} fontFamily={C.mono}>Order:</text>
            <text x={60} y={H-6} fill={C.accent} fontSize={10} fontWeight="700" fontFamily={C.mono}>{orderArr.join(" → ")}</text>
          </g>
        )}
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. DYNAMIC PROGRAMMING
// ═══════════════════════════════════════════════════════════════════════════

export function FibDPDiagram({ step }) {
  const vars = step?.stack?.[0]?.vars || {};
  const n    = vars.n !== undefined ? parseInt(vars.n) : -1;
  const memo = {};
  String(vars.memo || "").replace(/(\d+):(\d+)/g, (_, k, v) => { memo[parseInt(k)] = parseInt(v); });
  const slots = Array.from({ length: Math.min(Math.max(n + 2, 8), 12) }, (_, i) => i);
  const isHit = step?.note?.includes("Cache hit") || step?.note?.includes("cache hit");
  return (
    <div style={card}>
      <div style={label}>Memoization Cache Table</div>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
        {slots.map(i => {
          const has = memo[i] !== undefined, isN = i === n, hit = isN && isHit;
          const bg = hit ? C.blueLight : isN ? C.accentLight : has ? C.tealLight : C.bgSubtle;
          const bc = hit ? C.blue      : isN ? C.accent      : has ? C.teal      : C.border;
          const vc = hit ? C.blue      : has ? C.accent      : C.dim;
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <div style={{ height: 16, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                {hit && <div style={{ fontFamily: C.mono, fontSize: 8, color: C.blue }}>HIT!</div>}
                {isN && !hit && <div style={{ fontFamily: C.mono, fontSize: 10, color: C.accent }}>▼</div>}
              </div>
              <div style={{ width: 50, height: 50, background: bg, border: `1.5px solid ${bc}`, borderRadius: 7, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1, transition: "all .2s" }}>
                <div style={{ fontFamily: C.mono, fontSize: 8, color: C.dim }}>fib({i})</div>
                <div style={{ fontFamily: C.mono, fontSize: 14, fontWeight: "700", color: vc }}>{has ? memo[i] : "—"}</div>
              </div>
            </div>
          );
        })}
      </div>
      {isHit && n >= 0 && (
        <div style={{ marginTop: 10, fontFamily: C.mono, fontSize: 12, color: C.blue, background: C.blueLight, border: `1px solid ${C.blueBorder}`, borderRadius: 6, padding: "6px 10px" }}>
          ⚡ Cache HIT! fib({n}) already computed = {memo[n] ?? ""} — skip recursion!
        </div>
      )}
    </div>
  );
}

// FIX #8: Knapsack reads actual weights/values/capacity from step metadata
export function KnapsackDiagram({ step }) {
  const vars    = step?.stack?.[0]?.vars || {};
  // Simulation now attaches kWeights, kValues, kCapacity to each step
  const weights = step.kWeights  || [2, 3, 4, 5];
  const values  = step.kValues   || [3, 4, 5, 6];
  const cap     = step.kCapacity !== undefined ? step.kCapacity : 8;
  const itemIdx = vars.item   !== undefined ? parseInt(vars.item)   : -1;
  const resVar  = vars.result !== undefined ? parseInt(vars.result) : -1;
  const N = weights.length;

  const dp = Array.from({ length: N+1 }, () => Array(cap+1).fill(0));
  for (let i = 1; i <= Math.min(itemIdx, N); i++) {
    for (let w = 0; w <= cap; w++) {
      dp[i][w] = dp[i-1][w];
      if (weights[i-1] <= w) dp[i][w] = Math.max(dp[i][w], values[i-1] + dp[i-1][w-weights[i-1]]);
    }
  }

  return (
    <div style={card}>
      <div style={label}>Knapsack DP Table — dp[item][capacity]</div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", fontFamily: C.mono, fontSize: 11 }}>
          <thead>
            <tr>
              <th style={{ padding: "4px 8px", color: C.muted, fontSize: 10, textAlign: "left", borderBottom: `1px solid ${C.border}` }}>item \ w</th>
              {Array.from({ length: cap+1 }, (_, w) => w).map(w => (
                <th key={w} style={{ padding: "4px 7px", fontSize: 10, textAlign: "center", color: w===cap?C.accent:C.muted, background: w===cap?C.accentLight:"transparent", borderBottom: `1px solid ${C.border}` }}>{w}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: N+1 }, (_, i) => i).map(i => (
              <tr key={i}>
                <td style={{ padding: "2px 8px", fontSize: 10, whiteSpace: "nowrap", color: i===itemIdx?C.accent:C.muted, borderRight: `1px solid ${C.border}`, background: i===itemIdx?C.accentLight:"transparent" }}>
                  {i === 0 ? "∅" : `#${i} w=${weights[i-1]} v=${values[i-1]}`}
                </td>
                {Array.from({ length: cap+1 }, (_, w) => w).map(w => {
                  const v = dp[i][w], active = i===itemIdx && w===cap;
                  return <td key={w} style={{ width: 34, height: 30, textAlign: "center", background: active?C.accentLight:v>0?C.tealLight:"transparent", border: `1px solid ${active?C.accent:C.border}`, color: active?C.accent:v>0?C.teal:C.dim, fontWeight: active?"700":"400", transition: "all .2s" }}>{v}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {resVar > 0 && (
        <div style={{ marginTop: 10, fontFamily: C.mono, fontSize: 13, fontWeight: "700", color: C.accent, background: C.accentLight, border: `1px solid ${C.accentBorder}`, borderRadius: 6, padding: "7px 12px" }}>
          ✅ Maximum value = {resVar}
        </div>
      )}
    </div>
  );
}

// FIX #9: LCS reads actual s1/s2 from step metadata
export function LCSDiagram({ step }) {
  const vars = step?.stack?.[0]?.vars || {};
  const iIdx = vars.i !== undefined ? parseInt(vars.i) : -1;
  const jIdx = vars.j !== undefined ? parseInt(vars.j) : -1;
  const isMatch = String(vars.match || "").toUpperCase().includes("YES");
  // Simulation now attaches lcsS1, lcsS2 to each step
  const s1 = step.lcsS1 || "ABCBDAB";
  const s2 = step.lcsS2 || "BDCAB";
  const m = s1.length, n2 = s2.length;

  const dp = Array.from({ length: m+1 }, () => Array(n2+1).fill(0));
  for (let i = 1; i <= Math.min(iIdx, m); i++) {
    const jMax = i < iIdx ? n2 : Math.min(jIdx, n2);
    for (let j = 1; j <= jMax; j++) {
      if (s1[i-1] === s2[j-1]) dp[i][j] = dp[i-1][j-1] + 1;
      else dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
    }
  }

  return (
    <div style={card}>
      <div style={label}>LCS Table — s1="{s1}" vs s2="{s2}"</div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", fontFamily: C.mono, fontSize: 11 }}>
          <thead>
            <tr>
              <th style={{ padding: "2px 6px", color: C.dim, fontSize: 10 }}> </th>
              <th style={{ padding: "2px 6px", color: C.dim, fontSize: 10 }}>ε</th>
              {s2.split("").map((c, j) => (
                <th key={j} style={{ padding: "2px 6px", fontSize: 10, color: j+1===jIdx?C.accent:C.muted, background: j+1===jIdx?C.accentLight:"transparent" }}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: m+1 }, (_, i) => i).map(i => (
              <tr key={i}>
                <td style={{ padding: "2px 6px", fontSize: 10, color: i===iIdx?C.accent:C.muted, background: i===iIdx?C.accentLight:"transparent" }}>{i === 0 ? "ε" : s1[i-1]}</td>
                {Array.from({ length: n2+1 }, (_, j) => j).map(j => {
                  const active = i===iIdx && j===jIdx, v = dp[i][j], matched = active && isMatch;
                  return <td key={j} style={{ width: 30, height: 28, textAlign: "center", background: matched?C.accentLight:active?C.orangeLight:v>0?C.tealLight:"transparent", border: `1px solid ${matched?C.accent:active?C.orange:C.border}`, color: matched?C.accent:active?C.orange:v>0?C.teal:C.dim, fontWeight: active?"700":"400", transition: "all .2s" }}>{v}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isMatch && iIdx > 0 && jIdx > 0 && (
        <div style={{ marginTop: 8, fontFamily: C.mono, fontSize: 12, color: C.accent, background: C.accentLight, border: `1px solid ${C.accentBorder}`, borderRadius: 6, padding: "6px 10px" }}>
          ✅ Match! '{s1[iIdx-1]}' == '{s2[jIdx-1]}' → dp[{iIdx}][{jIdx}] = {dp[iIdx]?.[jIdx] ?? 0}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MASTER DISPATCHER — now passes currentStepIdx for Hanoi
// ═══════════════════════════════════════════════════════════════════════════

export function ProgramDiagram({ step, programKey, allSteps, currentStepIdx }) {
  if (!step) return null;

  if (["factorial","fibonacci","sum_array","tower_of_hanoi"].includes(programKey))
    return <RecursionDiagram step={step} programKey={programKey} allSteps={allSteps} currentStepIdx={currentStepIdx} />;

  if (["bubble_sort","selection_sort","insertion_sort","merge_sort","quick_sort"].includes(programKey))
    return <SortingDiagram step={step} programKey={programKey} />;

  if (["linear_search","binary_search","jump_search"].includes(programKey))
    return <SearchingDiagram step={step} />;

  if (programKey === "linked_list") return <LinkedListDiagram step={step} />;
  if (programKey === "stack_impl")  return <StackImplDiagram  step={step} />;
  if (programKey === "queue_impl")  return <QueueImplDiagram  step={step} />;
  if (programKey === "bst_insert")  return <BSTDiagram        step={step} />;

  if (programKey === "bfs" || programKey === "dfs")
    return <GraphDiagram step={step} algorithmKey={programKey} />;

  if (programKey === "fib_dp")   return <FibDPDiagram   step={step} />;
  if (programKey === "knapsack") return <KnapsackDiagram step={step} />;
  if (programKey === "lcs")      return <LCSDiagram      step={step} />;

  return null;
}
