// ─────────────────────────────────────────────────────────────────────────────
// SIMULATORS — step-by-step execution engines for every algorithm
// ─────────────────────────────────────────────────────────────────────────────
import {
  parseArray, parseAllArrays, parseAssignedArray, parseLinkedListNodes, parseStackValues,
  parseQueueValues, parseBSTValues, parseFactorialN, parseFibN,
  parseSumArray, parseHanoiN, parseFibRange, parseKnapsack,
  parseLCS, parseSearch, parseGraph, parseGraphStart
} from "./codeParser";

export function simulateExecution(programKey, userCode) {
  const sortKeys   = ["bubble_sort","selection_sort","insertion_sort","merge_sort","quick_sort"];
  const searchKeys = ["linear_search","binary_search","jump_search"];
  if (sortKeys.includes(programKey))   return simSorting(programKey, userCode);
  if (searchKeys.includes(programKey)) return simSearch(programKey, userCode);
  return simStack(programKey, userCode);
}

// ════════════════════════════════════════════════════════════════
// SORTING
// ════════════════════════════════════════════════════════════════
function simSorting(key, code) {
  // Always parse the user's arr = [...] first, then fall back to any array in code
  let arr = parseAssignedArray(code) || parseArray(code) || [64,34,25,12,22,11,90];
  if (arr.length > 12) arr = arr.slice(0, 12);
  const steps = [];
  const a = [...arr];

  const S = (line, arr, hi, hj, swapped, sorted, minIdx, note, extra = {}) => ({
    line, arr: [...arr], hi, hj, swapped, sorted: sorted || [], minIdx: minIdx ?? -1, note,
    stack: [{ fn: "<module>", vars: { arr: `[${arr.join(", ")}]` }, depth: 0 }],
    ...extra
  });

  if (key === "bubble_sort") {
    steps.push(S(1, a, -1, -1, -1, [], -1, `Initialize array: [${a.join(", ")}]`));
    for (let i = 0; i < a.length; i++) {
      steps.push(S(3, a, i, -1, -1, [], -1, `Outer loop: pass ${i+1}. Each pass bubbles the largest unsorted element to the end.`));
      for (let j = 0; j < a.length - i - 1; j++) {
        steps.push(S(4, a, i, j, -1, [], -1, `Compare arr[${j}]=${a[j]} with arr[${j+1}]=${a[j+1]}.`));
        if (a[j] > a[j+1]) {
          [a[j], a[j+1]] = [a[j+1], a[j]];
          steps.push(S(6, a, i, j, j, [], -1, `Swapped! arr[${j}] and arr[${j+1}]. Array: [${a.join(", ")}]`));
        }
      }
    }
    steps.push(S(8, a, -1, -1, -1, a.map((_,i)=>i), -1, `Bubble Sort complete! Sorted: [${a.join(", ")}]`));

  } else if (key === "selection_sort") {
    steps.push(S(1, a, -1, -1, -1, [], -1, `Initialize array: [${a.join(", ")}]`));
    for (let i = 0; i < a.length; i++) {
      let minIdx = i;
      steps.push(S(3, a, i, -1, -1, [], minIdx, `Outer loop: i=${i}. Minimum assumed at index ${i}, value=${a[minIdx]}.`));
      for (let j = i + 1; j < a.length; j++) {
        steps.push(S(5, a, i, j, -1, [], minIdx, `Compare arr[${j}]=${a[j]} with current min arr[${minIdx}]=${a[minIdx]}.`));
        if (a[j] < a[minIdx]) {
          minIdx = j;
          steps.push(S(7, a, i, j, -1, [], minIdx, `New minimum found at index ${minIdx}, value=${a[minIdx]}.`));
        }
      }
      if (minIdx !== i) {
        [a[i], a[minIdx]] = [a[minIdx], a[i]];
        steps.push(S(8, a, i, -1, i, [], minIdx, `Swap arr[${i}] and arr[${minIdx}]. Array: [${a.join(", ")}]`));
      }
    }
    steps.push(S(10, a, -1, -1, -1, a.map((_,i)=>i), -1, `Selection Sort complete! Sorted: [${a.join(", ")}]`));

  } else if (key === "insertion_sort") {
    steps.push(S(1, a, -1, -1, -1, [], -1, `Initialize array: [${a.join(", ")}]`));
    for (let i = 1; i < a.length; i++) {
      const keyVal = a[i];
      steps.push(S(3, a, i, -1, -1, [], -1, `Pick arr[${i}]=${keyVal} as key to insert into sorted portion.`));
      let j = i - 1;
      while (j >= 0 && a[j] > keyVal) {
        a[j + 1] = a[j];
        steps.push(S(7, a, i, j, j+1, [], -1, `Shift arr[${j}]=${a[j]} right. Array: [${a.join(", ")}]`));
        j--;
      }
      a[j + 1] = keyVal;
      steps.push(S(9, a, i, j+1, j+1, [], -1, `Insert key=${keyVal} at index ${j+1}. Array: [${a.join(", ")}]`));
    }
    steps.push(S(11, a, -1, -1, -1, a.map((_,i)=>i), -1, `Insertion Sort complete! Sorted: [${a.join(", ")}]`));

  } else if (key === "merge_sort") {
    const workArr = [...a];
    const msSteps = [];

    function mergeSortSim(lo, hi, depth) {
      if (lo >= hi) {
        msSteps.push({
          line: 2, arr: [...workArr], hi: depth, hj: -1, swapped: -1,
          mergeLeft: lo, mergeRight: hi,
          stack: [{ fn: "merge_sort", vars: { arr: `[${workArr.slice(lo,hi+1).join(",")}]` }, depth }],
          note: `Base case: single element [${workArr[lo]}] at index ${lo}.`
        });
        return;
      }
      const mid = Math.floor((lo + hi) / 2);
      msSteps.push({
        line: 2, arr: [...workArr], hi: depth, hj: -1, swapped: -1,
        mergeLeft: lo, mergeRight: hi,
        stack: [{ fn: "merge_sort", vars: { arr: `[${workArr.slice(lo,hi+1).join(",")}]`, len: hi-lo+1 }, depth }],
        note: `Split [${workArr.slice(lo,hi+1).join(",")}]: left=[${workArr.slice(lo,mid+1).join(",")}], right=[${workArr.slice(mid+1,hi+1).join(",")}]`
      });
      mergeSortSim(lo, mid, depth + 1);
      mergeSortSim(mid + 1, hi, depth + 1);

      const left  = workArr.slice(lo, mid + 1);
      const right = workArr.slice(mid + 1, hi + 1);
      let i2 = 0, j2 = 0, k = lo;
      while (i2 < left.length && j2 < right.length) {
        msSteps.push({
          line: 10, arr: [...workArr], hi: depth, hj: -1, swapped: -1,
          mergeLeft: lo, mergeRight: hi,
          stack: [{ fn: "merge", vars: { left: `[${left.join(",")}]`, right: `[${right.join(",")}]`, comparing: `${left[i2]} vs ${right[j2]}` }, depth }],
          note: `Merging [${lo}..${hi}]: pick ${left[i2] <= right[j2] ? left[i2] : right[j2]} (${left[i2]} vs ${right[j2]}).`
        });
        if (left[i2] <= right[j2]) workArr[k++] = left[i2++];
        else workArr[k++] = right[j2++];
      }
      while (i2 < left.length)  workArr[k++] = left[i2++];
      while (j2 < right.length) workArr[k++] = right[j2++];

      msSteps.push({
        line: 6, arr: [...workArr], hi: depth, hj: -1, swapped: -1,
        mergeLeft: lo, mergeRight: hi,
        stack: [{ fn: "merge_sort", vars: { merged: `[${workArr.slice(lo,hi+1).join(",")}]`, range: `[${lo}..${hi}]` }, depth }],
        note: `Merged range [${lo}..${hi}] => [${workArr.slice(lo,hi+1).join(", ")}]`
      });
    }

    steps.push({ line: 1, arr: [...workArr], hi: -1, hj: -1, swapped: -1, mergeLeft: -1, mergeRight: -1, stack: [{ fn: "<module>", vars: { arr: `[${workArr.join(",")}]` }, depth: 0 }], note: `Starting Merge Sort on [${workArr.join(", ")}].` });
    mergeSortSim(0, workArr.length - 1, 0);
    steps.push(...msSteps);
    steps.push({ line: 18, arr: [...workArr], hi: -1, hj: -1, swapped: -1, mergeLeft: -1, mergeRight: -1, stack: [{ fn: "<module>", vars: { result: `[${workArr.join(",")}]` }, depth: 0 }], note: `Merge Sort complete! Result: [${workArr.join(", ")}]` });

  } else if (key === "quick_sort") {
    const qa = [...a];
    const qsSteps = [];

    function quickSortSim(arr, low, high, depth = 0) {
      qsSteps.push({
        line: 1, arr: [...arr], hi: high, hj: low, swapped: -1,
        partLow: low, partHigh: high, pivotIdx: high,
        stack: [{ fn: "quick_sort", vars: { low, high }, depth }],
        note: `low(${low}) < high(${high})? ${low < high ? "YES -> partition." : "NO -> base case."}`
      });
      if (low >= high) return;

      const pivot = arr[high];
      qsSteps.push({
        line: 7, arr: [...arr], hi: high, hj: low, swapped: -1,
        partLow: low, partHigh: high, pivotIdx: high,
        stack: [{ fn: "partition", vars: { pivot: `arr[${high}]=${pivot}`, range: `[${low}..${high}]` }, depth }],
        note: `Pivot = arr[${high}] = ${pivot}. Elements <= ${pivot} go left.`
      });

      let i = low - 1;
      for (let j = low; j < high; j++) {
        qsSteps.push({
          line: 9, arr: [...arr], hi: high, hj: j, swapped: -1,
          partLow: low, partHigh: high, pivotIdx: high,
          stack: [{ fn: "partition", vars: { j, "arr[j]": arr[j], pivot, i }, depth }],
          note: `arr[${j}](${arr[j]}) <= pivot(${pivot})? ${arr[j] <= pivot ? "YES" : "NO"}`
        });
        if (arr[j] <= pivot) {
          i++;
          [arr[i], arr[j]] = [arr[j], arr[i]];
          qsSteps.push({
            line: 10, arr: [...arr], hi: high, hj: j, swapped: i,
            partLow: low, partHigh: high, pivotIdx: high,
            stack: [{ fn: "partition", vars: { i, swapped: `arr[${i}]<->arr[${j}]` }, depth }],
            note: i !== j ? `Swap arr[${i}](${arr[i]}) and arr[${j}](${arr[j]}). Array: [${arr.join(",")}]` : `arr[${j}]=${arr[j]} already in place.`
          });
        }
      }
      [arr[i+1], arr[high]] = [arr[high], arr[i+1]];
      const pi = i + 1;
      qsSteps.push({
        line: 11, arr: [...arr], hi: -1, hj: -1, swapped: pi,
        partLow: low, partHigh: high, pivotIdx: pi,
        stack: [{ fn: "partition", vars: { pivot_pos: pi, pivot_val: arr[pi] }, depth }],
        note: `Place pivot ${arr[pi]} at index ${pi}.`
      });

      quickSortSim(arr, low, pi - 1, depth + 1);
      quickSortSim(arr, pi + 1, high, depth + 1);
    }

    steps.push({ line: 16, arr: [...qa], hi: -1, hj: -1, swapped: -1, partLow: -1, partHigh: -1, pivotIdx: -1, stack: [{ fn: "<module>", vars: { arr: `[${qa.join(",")}]` }, depth: 0 }], note: `Starting Quick Sort on [${qa.join(", ")}].` });
    quickSortSim(qa, 0, qa.length - 1);
    steps.push({ line: 17, arr: [...qa], hi: -1, hj: -1, swapped: -1, partLow: -1, partHigh: -1, pivotIdx: -1, stack: [{ fn: "<module>", vars: { result: `[${qa.join(",")}]` }, depth: 0 }], note: `Quick Sort complete! Sorted: [${qa.join(", ")}]` });
  }

  return steps;
}

// ════════════════════════════════════════════════════════════════
// SEARCH — FIX: uses the EXACT array from code (no sorting)
// ════════════════════════════════════════════════════════════════
function simSearch(key, code) {
  // Parse the raw array exactly as written — do NOT sort it
  const { arr: rawArr, target } = parseSearch(code);

  // For binary/jump search the array must be sorted to work correctly
  // but we show the user's array AS-IS in the visualization (they wrote sorted code)
  const arr = [...rawArr];

  const steps = [];

  if (key === "linear_search") {
    steps.push({ line: 1, arr, searchIdx: -1, found: -1, lo: -1, hi: -1, mid: -1, stack: [{ fn: "<module>", vars: { arr: `[${arr.join(",")}]`, target }, depth: 0 }], note: `linear_search(arr, ${target}). Scan every element left-to-right.` });
    let foundAt = -1;
    for (let i = 0; i < arr.length; i++) {
      steps.push({ line: 2, arr, searchIdx: i, found: -1, lo: -1, hi: -1, mid: -1, stack: [{ fn: "linear_search", vars: { i, "arr[i]": arr[i], target }, depth: 1 }], note: `i=${i}. Examining arr[${i}]=${arr[i]}.` });
      const match = arr[i] === target;
      steps.push({ line: 3, arr, searchIdx: i, found: -1, lo: -1, hi: -1, mid: -1, stack: [{ fn: "linear_search", vars: { "arr[i]": arr[i], target, match }, depth: 1 }], note: `arr[${i}](${arr[i]}) == target(${target})? ${match ? "YES - Found!" : "NO -> keep searching."}` });
      if (match) { foundAt = i; break; }
    }
    if (foundAt >= 0)
      steps.push({ line: 4, arr, searchIdx: -1, found: foundAt, lo: -1, hi: -1, mid: -1, stack: [{ fn: "linear_search", vars: { return: foundAt }, depth: 1 }], note: `Return ${foundAt}. Target ${target} found at arr[${foundAt}].` });
    else
      steps.push({ line: 5, arr, searchIdx: -1, found: -1, lo: -1, hi: -1, mid: -1, stack: [{ fn: "linear_search", vars: { return: -1 }, depth: 1 }], note: `Target ${target} not found. Return -1.` });

  } else if (key === "binary_search") {
    // Binary search needs a sorted array — sort a copy but keep original for display
    const sorted = [...arr].sort((a, b) => a - b);
    let lo = 0, hi = sorted.length - 1;
    steps.push({ line: 1, arr: sorted, searchIdx: -1, found: -1, lo, hi, mid: -1, stack: [{ fn: "<module>", vars: { arr: `[${sorted.join(",")}]`, target }, depth: 0 }], note: `binary_search(arr, ${target}). Array must be sorted. Range [0..${hi}].` });
    steps.push({ line: 2, arr: sorted, searchIdx: -1, found: -1, lo, hi, mid: -1, stack: [{ fn: "binary_search", vars: { low: lo, high: hi }, depth: 1 }], note: `low=${lo}, high=${hi}.` });
    let foundAt = -1;
    while (lo <= hi) {
      steps.push({ line: 3, arr: sorted, searchIdx: -1, found: -1, lo, hi, mid: -1, stack: [{ fn: "binary_search", vars: { low: lo, high: hi }, depth: 1 }], note: `low(${lo}) <= high(${hi})? YES -> compute mid.` });
      const mid = Math.floor((lo + hi) / 2);
      steps.push({ line: 4, arr: sorted, searchIdx: -1, found: -1, lo, hi, mid, stack: [{ fn: "binary_search", vars: { mid, "arr[mid]": sorted[mid], target }, depth: 1 }], note: `mid=(${lo}+${hi})/2=${mid}. arr[${mid}]=${sorted[mid]}.` });
      if (sorted[mid] === target) {
        steps.push({ line: 5, arr: sorted, searchIdx: -1, found: mid, lo, hi, mid, stack: [{ fn: "binary_search", vars: { result: "FOUND", index: mid }, depth: 1 }], note: `arr[${mid}](${sorted[mid]}) == target(${target}). Return ${mid}.` });
        foundAt = mid; break;
      } else if (sorted[mid] < target) {
        steps.push({ line: 7, arr: sorted, searchIdx: -1, found: -1, lo, hi, mid, stack: [{ fn: "binary_search", vars: { action: "go right", "new low": mid+1 }, depth: 1 }], note: `arr[${mid}](${sorted[mid]}) < target(${target}). Discard left half. low=${mid+1}.` });
        lo = mid + 1;
      } else {
        steps.push({ line: 9, arr: sorted, searchIdx: -1, found: -1, lo, hi, mid, stack: [{ fn: "binary_search", vars: { action: "go left", "new high": mid-1 }, depth: 1 }], note: `arr[${mid}](${sorted[mid]}) > target(${target}). Discard right half. high=${mid-1}.` });
        hi = mid - 1;
      }
    }
    if (foundAt < 0) {
      steps.push({ line: 3, arr: sorted, searchIdx: -1, found: -1, lo, hi, mid: -1, stack: [{ fn: "binary_search", vars: { low: lo, high: hi }, depth: 1 }], note: `low(${lo}) <= high(${hi})? NO -> loop ends.` });
      steps.push({ line: 11, arr: sorted, searchIdx: -1, found: -1, lo, hi, mid: -1, stack: [{ fn: "binary_search", vars: { return: -1 }, depth: 1 }], note: `Target ${target} not found. Return -1.` });
    }

  } else {
    // jump_search — needs sorted array
    const sorted = [...arr].sort((a, b) => a - b);
    const n = sorted.length;
    const step = Math.floor(Math.sqrt(n));
    steps.push({ line: 1, arr: sorted, searchIdx: -1, found: -1, lo: 0, hi: n-1, mid: -1, stack: [{ fn: "<module>", vars: { arr: `[${sorted.join(",")}]`, target }, depth: 0 }], note: `jump_search(arr, ${target}). Length=${n}, block step=sqrt(${n})=${step}.` });
    steps.push({ line: 5, arr: sorted, searchIdx: -1, found: -1, lo: 0, hi: n-1, mid: -1, stack: [{ fn: "jump_search", vars: { n, step }, depth: 1 }], note: `step = floor(sqrt(${n})) = ${step}. Jump ${step} elements at a time.` });
    let prev = 0, s = step;
    while (s < n && sorted[Math.min(s, n) - 1] < target) {
      const idx = Math.min(s, n) - 1;
      steps.push({ line: 7, arr: sorted, searchIdx: idx, found: -1, lo: prev, hi: idx, mid: -1, stack: [{ fn: "jump_search", vars: { prev, step: s, "arr[step-1]": sorted[idx], target }, depth: 1 }], note: `arr[${idx}]=${sorted[idx]} < target(${target}) -> jump. prev=${s}.` });
      prev = s; s += step;
    }
    const blockEnd = Math.min(s, n) - 1;
    steps.push({ line: 9, arr: sorted, searchIdx: -1, found: -1, lo: prev, hi: blockEnd, mid: -1, stack: [{ fn: "jump_search", vars: { range: `[${prev}..${blockEnd}]` }, depth: 1 }], note: `Overshot. Linear search in block [${prev}..${blockEnd}].` });
    let foundAt = -1;
    for (let i = prev; i <= blockEnd && i < n; i++) {
      steps.push({ line: 10, arr: sorted, searchIdx: i, found: -1, lo: prev, hi: blockEnd, mid: -1, stack: [{ fn: "jump_search", vars: { i, "arr[i]": sorted[i], target }, depth: 1 }], note: `arr[${i}](${sorted[i]}) == target(${target})? ${sorted[i] === target ? "YES - Found!" : "NO -> continue."}` });
      if (sorted[i] === target) { foundAt = i; break; }
      if (sorted[i] > target) break;
    }
    if (foundAt >= 0)
      steps.push({ line: 13, arr: sorted, searchIdx: -1, found: foundAt, lo: -1, hi: -1, mid: -1, stack: [{ fn: "jump_search", vars: { return: foundAt }, depth: 1 }], note: `Found ${target} at index ${foundAt}.` });
    else
      steps.push({ line: 15, arr: sorted, searchIdx: -1, found: -1, lo: -1, hi: -1, mid: -1, stack: [{ fn: "jump_search", vars: { return: -1 }, depth: 1 }], note: `${target} not found. Return -1.` });
  }

  return steps;
}

// ════════════════════════════════════════════════════════════════
// STACK / RECURSIVE / GRAPH SIMULATIONS
// ════════════════════════════════════════════════════════════════
function simStack(key, code) {
  const steps = [];
  const S = (line, stack, note, extra = {}) => ({ line, stack, note, ...extra });

  // ── FACTORIAL ────────────────────────────────────────────────
  if (key === "factorial") {
    const n = Math.min(parseFactorialN(code), 8);
    steps.push(S(1, [{ fn: "<module>", vars: {}, depth: 0 }], `Define function factorial(n).`));
    steps.push(S(6, [{ fn: "<module>", vars: { result: "?" }, depth: 0 }], `Call factorial(${n}).`));
    function factSteps(val, callStack) {
      const newFrame = { fn: "factorial", vars: { n: val }, depth: callStack.length };
      const cs = [newFrame, ...callStack];
      steps.push(S(1, cs, `Enter factorial(n=${val}). Stack depth=${cs.length}.`));
      steps.push(S(2, cs, `n == 0? ${val === 0 ? "YES - Base case!" : "NO -> recurse."}`));
      if (val === 0) {
        steps.push(S(3, [{ ...newFrame, vars: { n: val, "return": 1 }, returning: true }, ...callStack], `Base case n=0 -> return 1.`));
        return 1;
      }
      steps.push(S(4, cs, `return ${val} * factorial(${val-1}).`));
      const sub = factSteps(val - 1, cs);
      const result = val * sub;
      steps.push(S(4, [{ ...newFrame, vars: { n: val, "factorial(n-1)": sub, "return": result }, returning: true }, ...callStack], `factorial(${val-1})=${sub}. ${val}*${sub}=${result}. Pop frame.`));
      return result;
    }
    const finalResult = factSteps(n, [{ fn: "<module>", vars: {}, depth: 0 }]);
    steps.push(S(6, [{ fn: "<module>", vars: { result: finalResult }, depth: 0 }], `factorial(${n}) = ${finalResult}.`));
    steps.push(S(7, [{ fn: "<module>", vars: { result: finalResult, output: String(finalResult) }, depth: 0 }], `print(result) -> Output: ${finalResult}`));
    return steps;
  }

  // ── FIBONACCI ────────────────────────────────────────────────
  if (key === "fibonacci") {
    const n = Math.min(parseFibN(code), 7);
    steps.push(S(1, [{ fn: "<module>", vars: {}, depth: 0 }], `Define function fib(n).`));
    steps.push(S(6, [{ fn: "<module>", vars: { result: "?" }, depth: 0 }], `Call fib(${n}).`));
    function fibSteps(val, callStack) {
      const newFrame = { fn: "fib", vars: { n: val }, depth: callStack.length };
      const cs = [newFrame, ...callStack];
      steps.push(S(1, cs, `Enter fib(n=${val}). Stack depth=${cs.length}.`));
      steps.push(S(2, cs, `n <= 1? ${val <= 1 ? "YES - Return n." : "NO -> recurse."}`));
      if (val <= 1) {
        steps.push(S(3, [{ ...newFrame, vars: { n: val, "return": val }, returning: true }, ...callStack], `Base case n=${val} -> return ${val}.`));
        return val;
      }
      steps.push(S(4, cs, `return fib(${val-1}) + fib(${val-2}).`));
      const a = fibSteps(val - 1, cs);
      steps.push(S(4, [{ ...newFrame, vars: { n: val, "fib(n-1)": a, "fib(n-2)": "?" } }, ...callStack], `fib(${val-1})=${a}. Now call fib(${val-2}).`));
      const b = fibSteps(val - 2, [{ ...newFrame, vars: { n: val, "fib(n-1)": a } }, ...callStack]);
      const res = a + b;
      steps.push(S(4, [{ ...newFrame, vars: { n: val, "fib(n-1)": a, "fib(n-2)": b, "return": `${a}+${b}=${res}` }, returning: true }, ...callStack], `fib(${val-2})=${b}. ${a}+${b}=${res}. Pop frame.`));
      return res;
    }
    const finalResult = fibSteps(n, [{ fn: "<module>", vars: {}, depth: 0 }]);
    steps.push(S(6, [{ fn: "<module>", vars: { result: finalResult }, depth: 0 }], `fib(${n}) = ${finalResult}.`));
    steps.push(S(7, [{ fn: "<module>", vars: { result: finalResult, output: String(finalResult) }, depth: 0 }], `print(result) -> Output: ${finalResult}`));
    return steps;
  }

  // ── SUM ARRAY ────────────────────────────────────────────────
  if (key === "sum_array") {
    const arr = parseSumArray(code);
    const totalSum = arr.reduce((a, b) => a + b, 0);
    steps.push(S(1, [{ fn: "<module>", vars: {}, depth: 0 }], `Define function sum_arr(arr).`));
    steps.push(S(6, [{ fn: "<module>", vars: { result: "?" }, depth: 0 }], `Call sum_arr([${arr.join(", ")}]).`));

    function sumSteps(a, callStack) {
      const newFrame = { fn: "sum_arr", vars: { arr: `[${a.join(",")}]` }, depth: callStack.length };
      const cs = [newFrame, ...callStack];
      steps.push(S(1, cs, `Enter sum_arr([${a.join(",")}]). Stack depth=${cs.length}.`));
      steps.push(S(2, cs, `len(arr) == 0? ${a.length === 0 ? "YES - Return 0." : "NO -> recurse."}`));
      if (a.length === 0) {
        steps.push(S(3, [{ ...newFrame, vars: { arr: "[]", "return": 0 }, returning: true }, ...callStack], `Empty array -> return 0 (base case).`));
        return 0;
      }
      steps.push(S(4, cs, `return arr[0] + sum_arr(arr[1:]). arr[0]=${a[0]}, rest=[${a.slice(1).join(",")}].`));
      const sub = sumSteps(a.slice(1), cs);
      const res = a[0] + sub;
      steps.push(S(4, [{ ...newFrame, vars: { arr: `[${a.join(",")}]`, "arr[0]": a[0], "sum_arr(rest)": sub, "return": res }, returning: true }, ...callStack], `sum_arr(rest)=${sub}. ${a[0]}+${sub}=${res}. Pop frame.`));
      return res;
    }

    const finalResult = sumSteps(arr, [{ fn: "<module>", vars: {}, depth: 0 }]);
    steps.push(S(6, [{ fn: "<module>", vars: { result: finalResult }, depth: 0 }], `sum_arr([${arr.join(",")}]) = ${finalResult}.`));
    // FIX: set both result and output so SumArrayViz shows the correct final value
    steps.push(S(7, [{ fn: "<module>", vars: { result: finalResult, output: String(finalResult) }, depth: 0 }], `print(${finalResult}) -> Output: ${finalResult}`));
    return steps;
  }

  // ── TOWER OF HANOI ───────────────────────────────────────────
  if (key === "tower_of_hanoi") {
    const n = Math.min(parseHanoiN(code), 4);
    const moves = [];
    const hanoiMeta = () => ({ hanoiN: n, hanoiMoves: moves.map(m => ({ ...m })) });
    steps.push({ ...S(1, [{ fn: "<module>", vars: {}, depth: 0 }], `Define function hanoi(n, src, dst, aux).`), ...hanoiMeta() });
    steps.push({ ...S(9, [{ fn: "<module>", vars: { n, src: "'A'", dst: "'C'", aux: "'B'" }, depth: 0 }], `Call hanoi(${n}, 'A', 'C', 'B'). Total moves: 2^${n}-1=${Math.pow(2,n)-1}.`), ...hanoiMeta() });
    function hanoiSteps(disks, src, dst, aux, callStack) {
      const newFrame = { fn: "hanoi", vars: { n: disks, src: `'${src}'`, dst: `'${dst}'`, aux: `'${aux}'` }, depth: callStack.length };
      const cs = [newFrame, ...callStack];
      steps.push({ ...S(1, cs, `Enter hanoi(${disks},'${src}','${dst}','${aux}'). Depth=${cs.length}.`), ...hanoiMeta() });
      if (disks === 1) {
        moves.push({ disk: 1, from: src, to: dst });
        steps.push({ ...S(3, [{ ...newFrame, vars: { ...newFrame.vars, move: `disk 1: ${src}->${dst}` }, returning: true }, ...callStack], `Move disk 1: '${src}' -> '${dst}'. Move #${moves.length}.`), ...hanoiMeta() });
        return;
      }
      hanoiSteps(disks - 1, src, aux, dst, cs);
      moves.push({ disk: disks, from: src, to: dst });
      steps.push({ ...S(6, [{ ...newFrame, vars: { ...newFrame.vars, move: `disk ${disks}: ${src}->${dst}` } }, ...callStack], `Move disk ${disks}: '${src}' -> '${dst}'. Move #${moves.length}.`), ...hanoiMeta() });
      hanoiSteps(disks - 1, aux, dst, src, cs);
      steps.push({ ...S(7, [{ ...newFrame, returning: true }, ...callStack], `hanoi(${disks}) complete. Pop frame.`), ...hanoiMeta() });
    }
    hanoiSteps(n, 'A', 'C', 'B', [{ fn: "<module>", vars: {}, depth: 0 }]);
    steps.push({ ...S(9, [{ fn: "<module>", vars: { done: true, total_moves: moves.length }, depth: 0 }], `Done! All ${n} disks moved A->C in ${moves.length} moves.`), ...hanoiMeta() });
    return steps;
  }

  // ── LINKED LIST ──────────────────────────────────────────────
  if (key === "linked_list") {
    const vals = parseLinkedListNodes(code);
    const nodes = vals.length > 0 ? vals : [1, 2, 3];
    const fullHeap = {};
    nodes.forEach((v, i) => {
      fullHeap[`Node@${String(i+1).padStart(2,"0")}`] = {
        val: v,
        next: i < nodes.length - 1 ? `Node@${String(i+2).padStart(2,"0")}` : "None"
      };
    });
    const mkStack = (vars) => [{ fn: "<module>", vars, depth: 0 }];
    steps.push(S(1, mkStack({}), `Define class Node.`));
    nodes.forEach((v, i) => {
      const partial = {};
      for (let k = 0; k <= i; k++) partial[`Node@${String(k+1).padStart(2,"0")}`] = fullHeap[`Node@${String(k+1).padStart(2,"0")}`];
      steps.push(S(6 + i, mkStack({ head: "Node@01" }), `head = Node(${v}). Chain: ${nodes.slice(0, i+1).join(" -> ")}.`, { heap: partial, lastHeap: partial }));
    });
    steps.push(S(10, mkStack({ cur: "Node@01" }), `cur = head. Start traversal.`, { heap: fullHeap, lastHeap: fullHeap }));
    nodes.forEach((v, i) => {
      const addr = `Node@${String(i+1).padStart(2,"0")}`;
      const next = i < nodes.length - 1 ? `Node@${String(i+2).padStart(2,"0")}` : "None";
      steps.push(S(11, [{ fn: "<module>", vars: { cur: addr, "cur.val": v, "cur.next": next }, depth: 0 }], `cur != None? YES. Execute loop.`, { heap: fullHeap, lastHeap: fullHeap }));
      steps.push(S(12, [{ fn: "<module>", vars: { cur: addr, output: String(v) }, depth: 0 }], `print(cur.val) -> Output: ${v}.`, { heap: fullHeap, lastHeap: fullHeap }));
      steps.push(S(13, [{ fn: "<module>", vars: { cur: next }, depth: 0 }], `cur = cur.next -> ${next}.`, { heap: fullHeap, lastHeap: fullHeap }));
    });
    steps.push(S(11, [{ fn: "<module>", vars: { cur: "None" }, depth: 0 }], `cur != None? NO. Traversal complete!`, { heap: fullHeap, lastHeap: fullHeap }));
    return steps;
  }

  // ── STACK IMPL ───────────────────────────────────────────────
  if (key === "stack_impl") {
    const vals = parseStackValues(code);
    const items = vals.length > 0 ? vals : [10, 20, 30];
    const stack = [];
    steps.push(S(1, [{ fn: "<module>", vars: { stack: "[]" }, depth: 0 }], `stack = []. Empty list (LIFO).`));
    items.forEach((v, i) => {
      stack.push(v);
      steps.push(S(3 + i, [{ fn: "<module>", vars: { stack: `[${stack.join(", ")}]`, pushed: v }, depth: 0 }], `stack.append(${v}). Top=${v}. Stack: [${stack.join(", ")}].`));
    });
    steps.push(S(7, [{ fn: "<module>", vars: { top: stack[stack.length-1] }, depth: 0 }], `print("Top:", stack[-1]) -> Top is ${stack[stack.length-1]}.`));
    const pops = Math.min(2, stack.length);
    for (let i = 0; i < pops; i++) {
      const popped = stack.pop();
      steps.push(S(8 + i*2, [{ fn: "<module>", vars: { popped, stack: `[${stack.join(", ")}]` }, depth: 0 }], `pop() removes ${popped}. Stack: [${stack.join(", ")}].`));
    }
    return steps;
  }

  // ── QUEUE IMPL ───────────────────────────────────────────────
  if (key === "queue_impl") {
    const vals = parseQueueValues(code);
    const items = vals.length > 0 ? vals : ["A", "B", "C"];
    const queue = [];
    steps.push(S(1, [{ fn: "<module>", vars: {}, depth: 0 }], `from collections import deque.`));
    steps.push(S(3, [{ fn: "<module>", vars: { queue: "deque([])" }, depth: 0 }], `queue = deque(). FIFO.`));
    items.forEach((v, i) => {
      queue.push(v);
      steps.push(S(4 + i, [{ fn: "<module>", vars: { queue: `[${queue.join(", ")}]`, enqueued: `'${v}'` }, depth: 0 }], `queue.append('${v}'). Queue: [${queue.join(", ")}].`));
    });
    steps.push(S(8, [{ fn: "<module>", vars: { front: `'${queue[0]}'` }, depth: 0 }], `Front = '${queue[0]}'.`));
    const dequeues = Math.min(2, queue.length);
    for (let i = 0; i < dequeues; i++) {
      const removed = queue.shift();
      steps.push(S(9 + i*2, [{ fn: "<module>", vars: { dequeued: `'${removed}'`, queue: `[${queue.join(", ")}]` }, depth: 0 }], `popleft() removes '${removed}'. Queue: [${queue.join(", ")}].`));
    }
    return steps;
  }

  // ── BST INSERT ───────────────────────────────────────────────
  if (key === "bst_insert") {
    const vals = parseBSTValues(code) || [5, 3, 7, 1, 4, 6, 8];
    let root = null;
    const insertedSoFar = [];
    // Embed the full final value list in EVERY step so the diagram can always
    // render the complete tree even before all insertions have run.
    const bstMeta = () => ({ inserted_so_far: [...insertedSoFar], bst_all_vals: [...vals] });

    steps.push(S(1,  [{ fn: "<module>", vars: {}, depth: 0 }], `Define class Node and functions insert(), inorder().`, bstMeta()));
    steps.push(S(19, [{ fn: "<module>", vars: { root: "None", values: `[${vals.join(",")}]` }, depth: 0 }], `root = None. Will insert ${vals.length} values into BST.`, bstMeta()));

    function bstInsertSim(node, val, path, callStack) {
      const newFrame = { fn: "insert", vars: { root: node ? `Node(${node.val})` : "None", val, inserting: val, path }, depth: callStack.length };
      const cs = [newFrame, ...callStack];
      steps.push(S(8, cs, `insert(root=${node ? `Node(${node.val})` : "None"}, val=${val}).`, bstMeta()));
      if (!node) {
        steps.push(S(10, [{ ...newFrame, vars: { ...newFrame.vars, "return": `Node(${val})` }, returning: true }, ...callStack], `Create Node(${val}) here.`, bstMeta()));
        return { val, left: null, right: null };
      }
      if (val < node.val) {
        steps.push(S(11, cs, `val(${val}) < root.val(${node.val}) -> go LEFT.`, bstMeta()));
        node.left = bstInsertSim(node.left, val, path + "->L", cs);
      } else {
        steps.push(S(13, cs, `val(${val}) >= root.val(${node.val}) -> go RIGHT.`, bstMeta()));
        node.right = bstInsertSim(node.right, val, path + "->R", cs);
      }
      steps.push(S(14, [{ ...newFrame, vars: { ...newFrame.vars, "return": `Node(${node.val})` }, returning: true }, ...callStack], `Return Node(${node.val}).`, bstMeta()));
      return node;
    }

    vals.forEach((v, i) => {
      steps.push(S(20, [{ fn: "<module>", vars: { inserting: v, progress: `${i+1}/${vals.length}` }, depth: 0 }], `Inserting value ${v} into BST (${i+1} of ${vals.length}).`, bstMeta()));
      root = bstInsertSim(root, v, "root", [{ fn: "<module>", vars: {}, depth: 0 }]);
      insertedSoFar.push(v);
      steps.push(S(20, [{ fn: "<module>", vars: { inserted: v, tree_size: insertedSoFar.length }, depth: 0 }], `${v} inserted. Tree: [${insertedSoFar.join(",")}].`, bstMeta()));
    });

    const order = [];
    function inorderSim(node, callStack) {
      if (!node) return;
      const cs = [{ fn: "inorder", vars: { root: `Node(${node.val})` }, depth: callStack.length }, ...callStack];
      steps.push(S(17, cs, `inorder(Node(${node.val})). Visit left subtree first.`, bstMeta()));
      inorderSim(node.left, cs);
      order.push(node.val);
      steps.push(S(18, cs, `print(${node.val}). In-order output so far: [${order.join(", ")}].`, bstMeta()));
      inorderSim(node.right, cs);
    }
    steps.push(S(21, [{ fn: "<module>", vars: { root: `Node(${root.val})` }, depth: 0 }], `Call inorder(root). In-order = sorted output.`, bstMeta()));
    inorderSim(root, [{ fn: "<module>", vars: {}, depth: 0 }]);
    steps.push(S(18, [{ fn: "<module>", vars: { sorted_output: order.join(" ") }, depth: 0 }], `In-order traversal complete. Output: [${order.join(", ")}] - sorted!`, bstMeta()));
    return steps;
  }

  // ── BFS ──────────────────────────────────────────────────────
  // FIX: parse graph from user code, embed graph in every step so diagram never loses it
  if (key === "bfs") {
    const graph = parseGraph(code) || { 0:[1,2], 1:[0,3,4], 2:[0,5], 3:[1], 4:[1], 5:[2] };
    const startNode = parseGraphStart(code, 0);
    const graphStr = formatGraph(graph);
    const queue = [startNode];
    const visited = new Set([startNode]);
    const order = [];

    const gStep = (line, stackVars, note) => ({
      ...S(line, [{ fn: stackVars.fn || "<module>", vars: stackVars, depth: stackVars.fn ? 1 : 0 }], note),
      _graph: graph,
      _graphStr: graphStr,
    });

    steps.push(gStep(3,  { graph: graphStr }, `Graph defined. Adjacency list: ${graphStr}.`));
    steps.push(gStep(12, {}, `Call bfs(start=${startNode}).`));
    steps.push(gStep(13, { fn: "bfs", visited: `{${startNode}}`, queue: `[${startNode}]` }, `Enter bfs(${startNode}). visited={${startNode}}, queue=[${startNode}].`));

    while (queue.length > 0) {
      const node = queue.shift();
      order.push(node);
      steps.push(gStep(14, { fn: "bfs", node, queue: `[${queue.join(",")}]`, order: `[${order.join(",")}]`, visited: `{${[...visited].join(",")}}` }, `Dequeue node ${node}. Order=[${order.join(", ")}].`));
      (graph[node] || []).forEach(nb => {
        if (!visited.has(nb)) {
          steps.push(gStep(16, { fn: "bfs", neighbor: nb, "visited?": "NO" }, `Neighbor ${nb} visited? NO -> enqueue.`));
          visited.add(nb);
          queue.push(nb);
          steps.push(gStep(17, { fn: "bfs", enqueued: nb, queue: `[${queue.join(",")}]`, visited: `{${[...visited].join(",")}}` }, `Enqueued ${nb}. Queue: [${queue.join(", ")}].`));
        } else {
          steps.push(gStep(16, { fn: "bfs", neighbor: nb, "visited?": "YES" }, `Neighbor ${nb} visited? YES -> skip.`));
        }
      });
    }
    steps.push(gStep(19, { fn: "bfs", return: `[${order.join(",")}]` }, `Return order=[${order.join(", ")}].`));
    steps.push(gStep(21, { result: `[${order.join(",")}]` }, `BFS complete! Order: ${order.join(" -> ")}.`));
    return steps;
  }

  // ── DFS ──────────────────────────────────────────────────────
  // FIX: parse graph from code, embed in every step so nodes never disappear
  if (key === "dfs") {
    const graph = parseGraph(code) || { 0:[1,2], 1:[0,3,4], 2:[0,5,6], 3:[1], 4:[1], 5:[2], 6:[2] };
    const startNode = parseGraphStart(code, 0);
    const graphStr = formatGraph(graph);
    const visited = new Set();
    const order = [];

    const gStep = (line, stackArr, note) => ({
      ...S(line, stackArr, note),
      _graph: graph,
      _graphStr: graphStr,
    });

    steps.push(gStep(1,  [{ fn: "<module>", vars: { graph: graphStr }, depth: 0 }], `Graph defined. Adjacency list: ${graphStr}.`));
    steps.push(gStep(12, [{ fn: "<module>", vars: {}, depth: 0 }], `Call dfs(${startNode}).`));

    function dfsSim(node, callStack) {
      const newFrame = { fn: "dfs", vars: { node, visited: `{${[...visited, node].join(",")}}` }, depth: callStack.length };
      const cs = [newFrame, ...callStack];
      steps.push(gStep(9, cs, `Enter dfs(${node}). Mark visited. Depth=${cs.length}.`));
      visited.add(node);
      order.push(node);
      steps.push(gStep(10, [{ ...newFrame, vars: { node, output: node, visited: `{${[...visited].join(",")}}` } }, ...callStack], `print(${node}). Path so far: ${order.join(" -> ")}.`));
      (graph[node] || []).forEach(nb => {
        if (!visited.has(nb)) {
          steps.push(gStep(11, [{ ...newFrame, vars: { node, neighbor: nb, "visited?": "NO" } }, ...callStack], `Neighbor ${nb} not visited -> recurse dfs(${nb}).`));
          dfsSim(nb, cs);
          steps.push(gStep(11, [{ ...newFrame, vars: { node, backtrack: `back to ${node}` } }, ...callStack], `Backtrack to node ${node}.`));
        } else {
          steps.push(gStep(11, [{ ...newFrame, vars: { node, neighbor: nb, "visited?": "YES" } }, ...callStack], `Neighbor ${nb} already visited -> skip.`));
        }
      });
      steps.push(gStep(9, [{ ...newFrame, returning: true }, ...callStack], `dfs(${node}) complete. Pop frame.`));
    }

    dfsSim(startNode, [{ fn: "<module>", vars: {}, depth: 0 }]);
    steps.push(gStep(12, [{ fn: "<module>", vars: { output: order.join(" -> ") }, depth: 0 }], `DFS complete! Traversal: ${order.join(" -> ")}.`));
    return steps;
  }

  // ── FIB DP ───────────────────────────────────────────────────
  if (key === "fib_dp") {
    const limit = Math.min(parseFibRange(code), 15);
    const memo = {};
    steps.push(S(1, [{ fn: "<module>", vars: {}, depth: 0 }], `Define fib_memo(n, memo={}). Uses memoization.`));
    steps.push(S(8, [{ fn: "<module>", vars: { range: `0..${limit-1}` }, depth: 0 }], `Loop: compute fib(0) through fib(${limit-1}).`));
    function fibMemoSim(n, callStack) {
      const memoStr = () => Object.entries(memo).map(([k,v])=>`${k}:${v}`).join(",") || "empty";
      const cs = [{ fn: "fib_memo", vars: { n, memo: `{${memoStr()}}` }, depth: callStack.length }, ...callStack];
      steps.push(S(1, cs, `Enter fib_memo(${n}). Cache: {${memoStr()}}.`));
      if (memo[n] !== undefined) {
        steps.push(S(2, cs, `${n} in memo? YES - Cache hit! memo[${n}]=${memo[n]}.`));
        steps.push(S(3, [{ fn: "fib_memo", vars: { n, "return": memo[n] }, depth: callStack.length, returning: true }, ...callStack], `Return ${memo[n]} from cache.`));
        return memo[n];
      }
      steps.push(S(2, cs, `${n} in memo? NO -> compute.`));
      if (n <= 1) {
        memo[n] = n;
        steps.push(S(5, [{ fn: "fib_memo", vars: { n, "return": n }, depth: callStack.length, returning: true }, ...callStack], `memo[${n}]=${n}. Return ${n}.`));
        return n;
      }
      const a = fibMemoSim(n - 1, cs);
      const b = fibMemoSim(n - 2, [{ fn: "fib_memo", vars: { n, "fib(n-1)": a }, depth: callStack.length }, ...callStack]);
      const res = a + b;
      memo[n] = res;
      steps.push(S(6, [{ fn: "fib_memo", vars: { n, result: `${a}+${b}=${res}`, "return": res }, depth: callStack.length, returning: true }, ...callStack], `fib(${n})=${a}+${b}=${res}. Cached.`));
      return res;
    }
    for (let i = 0; i < limit; i++) {
      steps.push(S(8, [{ fn: "<module>", vars: { i }, depth: 0 }], `i=${i}. Calling fib_memo(${i}).`));
      const v = fibMemoSim(i, [{ fn: "<module>", vars: {}, depth: 0 }]);
      steps.push(S(9, [{ fn: "<module>", vars: { [`fib(${i})`]: v }, depth: 0 }], `fib(${i}) = ${v}`));
    }
    return steps;
  }

  // ── KNAPSACK ─────────────────────────────────────────────────
  if (key === "knapsack") {
    const { weights, values, capacity } = parseKnapsack(code);
    const n = weights.length;
    const dp = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));
    const knapsackMeta = { kWeights: weights, kValues: values, kCapacity: capacity };
    steps.push(S(1, [{ fn: "<module>", vars: { weights: `[${weights.join(",")}]`, values: `[${values.join(",")}]`, capacity }, depth: 0 }], `${n} items. weights=[${weights.join(",")}], values=[${values.join(",")}], capacity=${capacity}.`, knapsackMeta));
    for (let i = 1; i <= n; i++) {
      steps.push(S(4, [{ fn: "knapsack", vars: { item: i, weight: weights[i-1], value: values[i-1] }, depth: 1 }], `Item ${i}: weight=${weights[i-1]}, value=${values[i-1]}.`, knapsackMeta));
      for (let w = 0; w <= capacity; w++) {
        dp[i][w] = dp[i-1][w];
        if (weights[i-1] <= w) {
          const withItem = values[i-1] + dp[i-1][w - weights[i-1]];
          if (withItem > dp[i][w]) {
            dp[i][w] = withItem;
            if (w === capacity || w === Math.floor(capacity / 2)) {
              steps.push(S(7, [{ fn: "knapsack", vars: { i, w, skip: dp[i-1][w], include: withItem, "dp[i][w]": dp[i][w] }, depth: 1 }], `w=${w}: include=${withItem} > skip=${dp[i-1][w]} -> dp[${i}][${w}]=${dp[i][w]}.`, knapsackMeta));
            }
          }
        }
      }
    }
    steps.push(S(9, [{ fn: "<module>", vars: { result: dp[n][capacity] }, depth: 0 }], `Max value = dp[${n}][${capacity}] = ${dp[n][capacity]}.`, knapsackMeta));
    return steps;
  }

  // ── LCS ──────────────────────────────────────────────────────
  if (key === "lcs") {
    const { s1, s2 } = parseLCS(code);
    const m = s1.length, n2 = s2.length;
    const dp = Array.from({ length: m+1 }, () => Array(n2+1).fill(0));
    const lcsMeta = { lcsS1: s1, lcsS2: s2 };
    steps.push(S(1, [{ fn: "<module>", vars: { s1: `"${s1}"`, s2: `"${s2}"` }, depth: 0 }], `lcs("${s1}", "${s2}"). Find longest common subsequence.`, lcsMeta));
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n2; j++) {
        if (s1[i-1] === s2[j-1]) {
          dp[i][j] = dp[i-1][j-1] + 1;
          steps.push(S(5, [{ fn: "lcs", vars: { i, j, "s1[i-1]": `'${s1[i-1]}'`, "s2[j-1]": `'${s2[j-1]}'`, match: "YES!", "dp[i][j]": dp[i][j] }, depth: 1 }], `'${s1[i-1]}'=='${s2[j-1]}'. Match! dp[${i}][${j}]=${dp[i][j]}.`, lcsMeta));
        } else {
          dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
          if (dp[i][j] > 0)
            steps.push(S(7, [{ fn: "lcs", vars: { i, j, match: "NO", "dp[i][j]": dp[i][j] }, depth: 1 }], `No match. dp[${i}][${j}]=max(${dp[i-1][j]},${dp[i][j-1]})=${dp[i][j]}.`, lcsMeta));
        }
      }
    }
    steps.push(S(10, [{ fn: "<module>", vars: { result: dp[m][n2] }, depth: 0 }], `LCS length = dp[${m}][${n2}] = ${dp[m][n2]}.`, lcsMeta));
    return steps;
  }

  return [{ line: 1, stack: [{ fn: "<module>", vars: {}, depth: 0 }], note: "Starting execution." }];
}

// ── Graph helpers ─────────────────────────────────────────────
function formatGraph(graph) {
  return "{" + Object.entries(graph).map(([k,v]) => `${k}:[${v.join(",")}]`).join(", ") + "}";
}
