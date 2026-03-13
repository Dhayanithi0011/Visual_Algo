// ─────────────────────────────────────────────────────────────────────────────
// CODE VALIDATOR — client-side Python syntax check + optional backend validation
// Backend URL is driven by VITE_API_URL env var (set in Vercel dashboard)
// Falls back gracefully to null (no error shown) if backend is unreachable.
// ─────────────────────────────────────────────────────────────────────────────

export function clientSidePythonCheck(code) {
  const lines = code.split("\n");

  function stripStrings(line) {
    let out = "";
    let i = 0;
    while (i < line.length) {
      const ch = line[i];
      if (ch === "#") { out += " ".repeat(line.length - i); break; }
      if ((ch === "f" || ch === "F") && i + 1 < line.length &&
          (line[i + 1] === '"' || line[i + 1] === "'")) {
        out += " "; i++; continue;
      }
      if ((ch === '"' || ch === "'") && line.slice(i, i + 3) === ch + ch + ch) {
        const q = ch + ch + ch;
        const close = line.indexOf(q, i + 3);
        if (close === -1) { out += " ".repeat(line.length - i); break; }
        out += " ".repeat(close + 3 - i);
        i = close + 3; continue;
      }
      if (ch === '"' || ch === "'") {
        const q = ch;
        let j = i + 1;
        while (j < line.length && line[j] !== q) { if (line[j] === "\\") j++; j++; }
        out += " ".repeat(j + 1 - i);
        i = j + 1; continue;
      }
      out += ch; i++;
    }
    return out;
  }

  // ── Bracket balance check ─────────────────────────────────────
  const opens = { "(": 0, "[": 0, "{": 0 };
  const pairs = { ")": "(", "]": "[", "}": "{" };
  for (let ln = 0; ln < lines.length; ln++) {
    const stripped = stripStrings(lines[ln]);
    for (let ci = 0; ci < stripped.length; ci++) {
      const ch = stripped[ci];
      if (opens[ch] !== undefined) opens[ch]++;
      else if (pairs[ch]) {
        opens[pairs[ch]]--;
        if (opens[pairs[ch]] < 0)
          return `SyntaxError: unexpected '${ch}' on line ${ln + 1}`;
      }
    }
  }
  if (opens["("] > 0) return "SyntaxError: unmatched '(' — missing closing ')'";
  if (opens["["] > 0) return "SyntaxError: unmatched '[' — missing closing ']'";
  if (opens["{"] > 0) return "SyntaxError: unmatched '{' — missing closing '}'";

  // ── Mixed indent check ────────────────────────────────────────
  let hasTabs = false, hasSpaces = false;
  for (const line of lines) {
    const mx = line.match(/^([ \t]+)/);
    if (!mx) continue;
    if (mx[1].includes("\t")) hasTabs = true;
    if (mx[1].includes(" "))  hasSpaces = true;
    if (hasTabs && hasSpaces) return "IndentationError: mixed tabs and spaces";
  }

  // ── NameError heuristic — only top-level undefined names ─────
  // Collect all defined names
  const defined = new Set([
    // Python built-ins
    "print", "len", "range", "int", "float", "str", "bool", "list",
    "dict", "set", "tuple", "type", "input", "abs", "max", "min",
    "sum", "sorted", "reversed", "enumerate", "zip", "map", "filter",
    "isinstance", "hasattr", "getattr", "setattr", "repr", "round",
    "open", "iter", "next", "id", "hash", "hex", "bin", "oct",
    "chr", "ord", "divmod", "pow", "any", "all", "vars", "dir",
    "super", "object", "Exception", "ValueError", "TypeError",
    "IndexError", "KeyError", "StopIteration", "NotImplementedError",
    "AssertionError", "RuntimeError", "AttributeError", "NameError",
    "append", "pop", "popleft", "extend", "insert", "remove",
    "index", "count", "sort", "reverse", "copy", "clear", "update",
    "keys", "values", "items", "get",
    // Common stdlib used in our algorithms
    "math", "deque", "defaultdict", "sqrt", "floor", "ceil", "inf",
    "collections", "sys", "os", "re", "json", "time", "random",
    // Common variables used across algorithms
    "arr", "n", "i", "j", "k", "v", "result", "node", "graph",
    "visited", "queue", "stack", "left", "right", "mid", "target",
    "low", "high", "prev", "step", "order", "start", "end",
    // Graph-specific
    "bfs", "dfs", "nb", "neighbors", "adj", "dist", "parent",
    "path", "level", "depth", "weight", "capacity", "flow",
    // BST / Tree specific
    "root", "insert", "inorder", "preorder", "postorder",
    "search", "delete", "tree", "cur", "head", "tail", "val",
    // Data structure methods / misc
    "heappush", "heappop", "heapify", "defaultdict", "Counter",
    "bisect", "bisect_left", "bisect_right", "insort",
    "pprint", "copy", "deepcopy", "reduce", "partial",
    "chain", "product", "permutations", "combinations",
    "stdout", "stderr", "stdin", "argv", "exit",
  ]);

  // Collect names defined in code (assignments, defs, imports, for-vars)
  for (const rawLine of lines) {
    const raw = rawLine.trim();
    if (!raw || raw.startsWith("#")) continue;

    // import X or import X as Y
    let m;
    if ((m = raw.match(/^import\s+(\w[\w.,\s]*)/))) {
      m[1].split(",").forEach(s => {
        const parts = s.trim().split(/\s+as\s+/);
        defined.add((parts[1] || parts[0]).trim());
      });
    }
    // from X import Y, Z or from X import Y as Z
    if ((m = raw.match(/^from\s+\S+\s+import\s+(.+)/))) {
      m[1].split(",").forEach(s => {
        const parts = s.trim().split(/\s+as\s+/);
        defined.add((parts[1] || parts[0]).trim().replace(/[()]/g, ""));
      });
    }
    // def funcname / class Classname
    if ((m = raw.match(/^(?:def|class)\s+([A-Za-z_]\w*)/))) defined.add(m[1]);
    // assignments: name = ...  or  name, name2 = ...
    if ((m = raw.match(/^([A-Za-z_][\w,\s]*)\s*=/)) && !raw.startsWith("==") && !raw.includes("==")) {
      m[1].split(",").forEach(p => {
        const nm = p.trim();
        if (/^[A-Za-z_]\w*$/.test(nm)) defined.add(nm);
      });
    }
    if ((m = raw.match(/\bas\s+([A-Za-z_]\w*)/))) defined.add(m[1]);
    // for var in ...
    const compRe = /\bfor\s+([A-Za-z_]\w*)\s+in\b/g;
    let cm;
    while ((cm = compRe.exec(raw)) !== null) defined.add(cm[1]);
    // with ... as var:
    if ((m = raw.match(/^except\s+\w+\s+as\s+([A-Za-z_]\w*)/))) defined.add(m[1]);
  }

  // Only check top-level lines that look like standalone expressions (not assignments/control flow)
  const KEYWORDS = new Set([
    "and", "or", "not", "in", "is", "if", "else", "elif", "for",
    "while", "return", "True", "False", "None", "lambda", "pass",
    "break", "continue", "import", "from", "as", "with", "try",
    "except", "finally", "raise", "del", "global", "nonlocal",
    "class", "def", "yield",
  ]);

  for (let ln = 0; ln < lines.length; ln++) {
    const stripped = lines[ln].trim();
    if (!stripped || stripped.startsWith("#")) continue;
    // Skip any line that is a statement keyword, indented, or a function/class def
    if (/^(def |class |import |from |return |if |elif |else[:\s]|for |while |pass\b|break\b|continue\b|raise |with |try[:\s]|except|finally|yield)/.test(stripped))
      continue;
    const indent = lines[ln].match(/^(\s*)/)[1].length;
    if (indent > 0) continue; // only check top-level
    const safe = stripStrings(lines[ln]).trim();
    if (!safe) continue;

    // Skip lines that are purely an assignment
    let rhs = safe;
    const eqIdx = safe.search(/(?<![=!<>+\-*\/])=(?!=)/);
    if (eqIdx > 0) rhs = safe.slice(eqIdx + 1).trim();
    else if (eqIdx === 0) continue; // starts with =, skip

    const tokRe = /\b([A-Za-z_]\w*)\b/g;
    let tk;
    while ((tk = tokRe.exec(rhs)) !== null) {
      const tok = tk[1];
      if (defined.has(tok))  continue;
      if (KEYWORDS.has(tok)) continue;
      if (/^\d/.test(tok))   continue;
      return `NameError: name '${tok}' is not defined (line ${ln + 1})`;
    }
  }

  return null;
}

// ── Backend validation ────────────────────────────────────────────────────────
// On Vercel, the serverless function is at /api/run (relative URL — no host needed).
// Locally, the FastAPI backend runs on localhost:8000.
// VITE_API_URL can override both (set blank string in Vercel to use relative path).
const IS_LOCAL  = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const API_BASE  = import.meta.env.VITE_API_URL !== undefined
  ? import.meta.env.VITE_API_URL          // explicit override (can be "" for relative)
  : IS_LOCAL
    ? "http://localhost:8000"              // local dev — use FastAPI
    : "";                                  // production Vercel — use relative /api/run

export async function validateCodeWithBackend(code) {
  const clientErr = clientSidePythonCheck(code);
  if (clientErr) return clientErr;

  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 3000);
    const endpoint = API_BASE ? `${API_BASE}/api/run` : "/api/run";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language: "python" }),
      signal: controller.signal,
    });
    clearTimeout(tid);
    const data = await res.json();
    if (data.error) {
      const raw = String(data.error);
      const nameErr = raw.match(/NameError:\s*name '([^']+)' is not defined/);
      if (nameErr) return `NameError: name '${nameErr[1]}' is not defined`;
      const errLine = raw.match(/([A-Za-z]+Error:\s*[^\n]+)/);
      return errLine
        ? errLine[1].trim()
        : raw.split("\n").filter(Boolean).pop().trim();
    }
    return null;
  } catch {
    // Backend unreachable — silently skip
    return null;
  }
}
