// ─────────────────────────────────────────────────────────────────────────────
// CODE VALIDATOR — client-side Python syntax check + backend validation
// ─────────────────────────────────────────────────────────────────────────────

export function clientSidePythonCheck(code) {
  const lines = code.split("\n");

  // Strip string literals and comments so we only analyse real tokens
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

  // ── 1. Bracket balance ───────────────────────────────────────────────────
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

  // ── 2. Mixed tabs / spaces ───────────────────────────────────────────────
  let hasTabs = false, hasSpaces = false;
  for (const line of lines) {
    const mx = line.match(/^([ \t]+)/);
    if (!mx) continue;
    if (mx[1].includes("\t")) hasTabs = true;
    if (mx[1].includes(" "))  hasSpaces = true;
  }
  if (hasTabs && hasSpaces) return "TabError: mixed tabs and spaces in indentation";

  // ── 3. NameError scan ────────────────────────────────────────────────────
  // Large allow-list so pre-written programs never produce false positives.
  const ALWAYS_KNOWN = new Set([
    // Python builtins
    "print", "len", "range", "int", "str", "float", "bool",
    "list", "dict", "set", "tuple", "type", "isinstance",
    "input", "abs", "min", "max", "sum", "sorted", "reversed",
    "enumerate", "zip", "map", "filter", "any", "all", "open",
    "None", "True", "False", "self", "cls",
    "Exception", "ValueError", "TypeError", "KeyError",
    "IndexError", "StopIteration", "object", "super",
    "property", "staticmethod", "classmethod",
    // keywords (kept here for RHS scanning)
    "pass", "break", "continue", "return", "yield", "lambda",
    "if", "else", "elif", "while", "for", "in", "not", "and",
    "or", "is", "del", "global", "nonlocal", "with", "as",
    "try", "except", "finally", "raise", "import", "from",
    "class", "def",
    // stdlib
    "math", "collections", "deque",
    "append", "pop", "popleft", "appendleft", "extendleft",
    "insert", "remove", "copy", "keys", "values", "items",
    "get", "update", "rotate", "clear", "reverse", "extend", "sort",
    // ── algorithm variable names ──────────────────────────────────────────
    "memo", "arr", "node", "graph", "dp",
    "n", "m", "i", "j", "k", "w", "v", "u",
    "result", "visited", "queue", "stack",
    "capacity", "weights", "profits", "values",
    "s1", "s2", "left", "right", "mid",
    "lo", "hi", "low", "high", "target",
    "key", "val", "head", "curr", "prev",
    "peg_a", "peg_b", "peg_c", "disks", "move",
    "num", "total", "current", "temp", "idx",
    "src", "dst", "aux", "step", "order", "path", "root",
    "f", "end", "sep", "_", "__",
    // ── graph / BFS / DFS ─────────────────────────────────────────────────
    "bfs", "dfs", "nb", "neighbor", "neighbors",
    "start", "adj", "edges", "nodes",
    // ── sorting / partition ───────────────────────────────────────────────
    "pivot", "partition", "pi", "merge",
    // ── jump search ───────────────────────────────────────────────────────
    "prev",
    // ── single-letter catch-all ───────────────────────────────────────────
    "a", "b", "c", "d", "e", "g", "h", "o",
    "p", "q", "r", "s", "t", "x", "y", "z",
    // ── string / math methods ─────────────────────────────────────────────
    "split", "join", "strip", "replace", "lower", "upper",
    "find", "startswith", "endswith", "format", "encode",
    "decode", "count", "index", "isdigit", "isalpha",
    "sqrt", "floor", "ceil", "log", "log2", "pow", "pi",
    "sin", "cos", "tan", "exp", "fabs",
    // ── tree / struct fields ──────────────────────────────────────────────
    "data", "size", "height", "depth", "parent", "children",
    // ── graph extras ─────────────────────────────────────────────────────
    // visited is used as set([start]) in BFS — 'set' must be in builtins (already is).
    // These are extra names that appear in graph algorithm templates:
    "end", "component", "components", "color", "colors",
    "dist", "distance", "weight", "costs", "cost",
    "pq", "heapq", "heappush", "heappop",
    // ── misc ──────────────────────────────────────────────────────────────
    "__name__", "__main__",
  ]);

  const defined = new Set(ALWAYS_KNOWN);

  // First pass — collect ALL definitions in the file regardless of indentation
  for (const line of lines) {
    const raw = line.trim();
    let m;

    // def / class names
    if ((m = raw.match(/^def\s+([A-Za-z_]\w*)\s*\(/)))   defined.add(m[1]);
    if ((m = raw.match(/^class\s+([A-Za-z_]\w*)/)))       defined.add(m[1]);

    // imports
    if ((m = raw.match(/^import\s+([A-Za-z_][\w.]*)/)))   m[1].split(".").forEach(p => defined.add(p));
    if ((m = raw.match(/^from\s+([A-Za-z_]\w*)/)))        defined.add(m[1]);
    if ((m = raw.match(/\bimport\s+([A-Za-z_]\w*)(?:\s+as\s+([A-Za-z_]\w*))?/))) {
      defined.add(m[1]);
      if (m[2]) defined.add(m[2]);
    }

    // for-loop variables at ANY indentation level
    const forRe = /\bfor\s+([\w,\s]+)\s+in\b/g;
    let fm;
    while ((fm = forRe.exec(raw)) !== null) {
      fm[1].split(",").forEach(p => {
        const nm = p.trim();
        if (/^[A-Za-z_]\w*$/.test(nm)) defined.add(nm);
      });
    }

    // function parameters (including defaults)
    if ((m = raw.match(/def\s+[A-Za-z_]\w*\s*\(([^)]*)\)/))) {
      m[1].split(",").forEach(p => {
        const pn = p.trim().split("=")[0].trim().replace(/^\*+/, "");
        if (pn && /^[A-Za-z_]\w*$/.test(pn)) defined.add(pn);
      });
    }

    // simple assignments: x = ..., x += ..., etc.
    if ((m = raw.match(/^([A-Za-z_]\w*)\s*(?:[+\-*\/]?=)(?!=)/))) defined.add(m[1]);

    // tuple unpacking: a, b = ...
    if ((m = raw.match(/^((?:[A-Za-z_]\w*\s*,\s*)+[A-Za-z_]\w*)\s*=/))) {
      m[1].split(",").forEach(p => {
        const nm = p.trim();
        if (/^[A-Za-z_]\w*$/.test(nm)) defined.add(nm);
      });
    }

    // subscript assignment: arr[i] = ...
    if ((m = raw.match(/^([A-Za-z_]\w*)\s*\[/))) defined.add(m[1]);

    // with ... as x  /  except X as e
    if ((m = raw.match(/\bas\s+([A-Za-z_]\w*)/)))              defined.add(m[1]);
    if ((m = raw.match(/^except\s+\w+\s+as\s+([A-Za-z_]\w*)/))) defined.add(m[1]);

    // comprehension variables [x for x in ...]
    const compRe = /\bfor\s+([A-Za-z_]\w*)\s+in\b/g;
    let cm;
    while ((cm = compRe.exec(raw)) !== null) defined.add(cm[1]);
  }

  const KEYWORDS = new Set([
    "and", "or", "not", "in", "is", "if", "else", "elif", "for",
    "while", "return", "True", "False", "None", "lambda", "pass",
    "break", "continue", "import", "from", "as", "with", "try",
    "except", "finally", "raise", "del", "global", "nonlocal",
    "class", "def", "yield",
  ]);

  // Second pass — scan RHS tokens for anything we don't recognise.
  // Skip lines inside function/class bodies (indented lines) when they
  // begin with a call expression — those are too complex to validate
  // safely without a real Python AST. We only flag clear module-level issues.
  for (let ln = 0; ln < lines.length; ln++) {
    const stripped = lines[ln].trim();
    if (!stripped || stripped.startsWith("#")) continue;

    // Skip lines that open with a pure statement keyword
    if (/^(def |class |import |from |return |if |elif |else[:\s]|for |while |pass\b|break\b|continue\b|raise |with |try[:\s]|except|finally|yield)/.test(stripped))
      continue;

    // Skip indented lines entirely — too risky to false-positive on
    // local variables, comprehensions, chained calls, etc.
    const indent = lines[ln].match(/^(\s*)/)[1].length;
    if (indent > 0) continue;

    const safe = stripStrings(lines[ln]).trim();
    if (!safe) continue;

    // Only scan to the right of the first plain `=` sign (skip lhs)
    let rhs = safe;
    const eqIdx = safe.search(/(?<![=!<>+\-*\/])=(?!=)/);
    if (eqIdx > 0) rhs = safe.slice(eqIdx + 1).trim();

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

export async function validateCodeWithBackend(code) {
  const clientErr = clientSidePythonCheck(code);
  if (clientErr) return clientErr;

  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 3000);
    const res = await fetch("http://localhost:8000/api/run", {
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
    return null;
  }
}
