// ─────────────────────────────────────────────────────────────────────────────
// CODE PARSER — helpers to extract values from user-edited code
// ─────────────────────────────────────────────────────────────────────────────

// Parse the LAST array literal in the code (avoids matching arr[mid:] slice syntax)
export function parseArray(code) {
  const stripped = code.replace(/\w+\s*\[[\w\s:+\-*/.]+\]/g, "[]");
  const re = /\[([^\]]+)\]/g;
  let last = null, m;
  while ((m = re.exec(stripped)) !== null) {
    const nums = m[1].split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (nums.length > 1) last = nums;
  }
  return last;
}

// Parse the array assigned to 'arr' variable specifically: arr = [...]
export function parseAssignedArray(code) {
  // Match: arr = [...] — must be specifically 'arr' variable
  const m = code.match(/\barr\s*=\s*\[([^\]]+)\]/);
  if (!m) return null;
  const nums = m[1].split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  return nums.length > 0 ? nums : null;
}

export function parseNamedInt(code, name) {
  const re = new RegExp(`${name}\\s*=\\s*(-?\\d+)`);
  const m = code.match(re);
  return m ? parseInt(m[1]) : null;
}

export function parseAllArrays(code) {
  const results = [];
  const stripped = code.replace(/\w+\s*\[[\w\s:+\-*/.]+\]/g, "[]");
  const re = /\[([^\]]+)\]/g;
  let m;
  while ((m = re.exec(stripped)) !== null) {
    const nums = m[1].split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (nums.length > 1) results.push(nums);
  }
  return results;
}

export function parseLinkedListNodes(code) {
  return [...code.matchAll(/Node\((\d+)\)/g)].map(m => parseInt(m[1]));
}
export function parseStackValues(code) {
  return [...code.matchAll(/\.append\((\d+)\)/g)].map(m => parseInt(m[1]));
}
export function parseQueueValues(code) {
  return [...code.matchAll(/\.append\(["']?([^"')]+)["']?\)/g)].map(m => m[1].trim());
}
export function parseBSTValues(code) {
  // Match: for v in [5, 3, 7, ...]
  const m = code.match(/for\s+\w+\s+in\s+\[([^\]]+)\]/);
  if (!m) return null;
  const nums = m[1].split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  return nums.length > 0 ? nums : null;
}
export function parseFactorialN(code) {
  const m = code.match(/factorial\((\d+)\)/);
  return m ? parseInt(m[1]) : 4;
}
export function parseFibN(code) {
  const m = code.match(/fib\((\d+)\)/);
  return m ? parseInt(m[1]) : 5;
}
export function parseSumArray(code) {
  // Prefer the call argument: result = sum_arr([1, 2, 3, 4, 5])
  const callMatch = code.match(/sum_arr\(\s*\[([^\]]+)\]/);
  if (callMatch) {
    const nums = callMatch[1].split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (nums.length > 0) return nums;
  }
  return parseArray(code) || [1, 2, 3, 4, 5];
}
export function parseHanoiN(code) {
  const m = code.match(/hanoi\((\d+)/);
  return m ? parseInt(m[1]) : 3;
}
export function parseFibRange(code) {
  // Match: for i in range(N) — the loop count for fib DP
  const m = code.match(/for\s+\w+\s+in\s+range\s*\((\d+)\)/);
  if (m) return parseInt(m[1]);
  // Fallback: any range(N)
  const m2 = code.match(/range\s*\((\d+)\)/);
  return m2 ? parseInt(m2[1]) : 10;
}
export function parseKnapsack(code) {
  const arrays = parseAllArrays(code);
  const capMatch = code.match(/capacity\s*=\s*(\d+)/);
  return {
    weights:  arrays[0] || [2,3,4,5],
    values:   arrays[1] || [3,4,5,6],
    capacity: capMatch ? parseInt(capMatch[1]) : 8
  };
}
export function parseLCS(code) {
  const m = code.match(/lcs\(["']([^"']+)["'],\s*["']([^"']+)["']\)/);
  return m ? { s1: m[1], s2: m[2] } : { s1: "ABCBDAB", s2: "BDCAB" };
}

// Parse search: extracts the EXACT array from code (unsorted for linear, sorted for binary/jump)
export function parseSearch(code) {
  // First try arr = [...]
  const arr = parseAssignedArray(code) || parseArray(code) || [4, 2, 7, 1, 9, 3];
  // Match target from search call
  const callMatch = code.match(/(?:linear|binary|jump)_search\s*\(\s*\w+\s*,\s*(\d+)\s*\)/);
  const target = callMatch ? parseInt(callMatch[1]) : 7;
  return { arr, target };
}

// Parse graph from code: graph = {0: [1,2], 1: [0,3], ...}
export function parseGraph(code) {
  try {
    const blockMatch = code.match(/graph\s*=\s*\{([\s\S]*?)\}/);
    if (!blockMatch) return null;
    const block = blockMatch[1];
    const graph = {};
    const entryRe = /(\d+)\s*:\s*\[([^\]]*)\]/g;
    let m;
    while ((m = entryRe.exec(block)) !== null) {
      const node = parseInt(m[1]);
      const neighbors = m[2].split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      graph[node] = neighbors;
    }
    return Object.keys(graph).length > 0 ? graph : null;
  } catch {
    return null;
  }
}

// Parse the start node for BFS/DFS calls
export function parseGraphStart(code, fallback = 0) {
  // Match: bfs(graph, 0) or bfs(0) or dfs(node, visited) — extract the last integer arg
  const m = code.match(/(?:bfs|dfs)\s*\(\s*(?:\w+\s*,\s*)?(\d+)\s*\)/);
  return m ? parseInt(m[1]) : fallback;
}
