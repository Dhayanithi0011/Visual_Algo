// ─────────────────────────────────────────────────────────────────────────────
// CODE PARSER — helpers to extract values from user-edited code
// Separated from Visualizer.jsx for clarity and reuse
// ─────────────────────────────────────────────────────────────────────────────

export function parseArray(code) {
  const match = code.match(/\[([^\]]+)\]/);
  if (!match) return null;
  const nums = match[1].split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  return nums.length > 0 ? nums : null;
}
export function parseNamedInt(code, name) {
  const re = new RegExp(`${name}\\s*=\\s*(-?\\d+)`);
  const m = code.match(re);
  return m ? parseInt(m[1]) : null;
}
export function parseAllArrays(code) {
  const results = [];
  const re = /\[([^\]]+)\]/g;
  let m;
  while ((m = re.exec(code)) !== null) {
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
export function parseSumArray(code) { return parseArray(code) || [1, 2, 3, 4, 5]; }
export function parseHanoiN(code) {
  const m = code.match(/hanoi\((\d+)/);
  return m ? parseInt(m[1]) : 3;
}
export function parseFibRange(code) {
  const m = code.match(/range\((\d+)\)/);
  return m ? parseInt(m[1]) : 8;
}
export function parseKnapsack(code) {
  const arrays = parseAllArrays(code);
  const capMatch = code.match(/capacity\s*=\s*(\d+)/);
  return { weights: arrays[0] || [2,3,4,5], values: arrays[1] || [3,4,5,6], capacity: capMatch ? parseInt(capMatch[1]) : 8 };
}
export function parseLCS(code) {
  const m = code.match(/lcs\(["']([^"']+)["'],\s*["']([^"']+)["']\)/);
  return m ? { s1: m[1], s2: m[2] } : { s1: "ABCBDAB", s2: "BDCAB" };
}
export function parseSearch(code) {
  const arr = parseArray(code) || [1,3,5,7,9,11,13];
  const callMatch = code.match(/\w+_search\(\w+,\s*(\d+)\)/);
  const target = callMatch ? parseInt(callMatch[1]) : 7;
  return { arr, target };
}
