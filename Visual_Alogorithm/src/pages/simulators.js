// ─────────────────────────────────────────────────────────────────────────────
// SIMULATORS — all step-by-step execution engines for every algorithm type
// Separated from Visualizer.jsx for maintainability
// ─────────────────────────────────────────────────────────────────────────────
import {
  parseArray, parseAllArrays, parseLinkedListNodes, parseStackValues,
  parseQueueValues, parseBSTValues, parseFactorialN, parseFibN,
  parseSumArray, parseHanoiN, parseFibRange, parseKnapsack,
  parseLCS, parseSearch
} from "./codeParser";

export function simulateExecution(programKey, userCode) {
  const sortKeys   = ["bubble_sort","selection_sort","insertion_sort","merge_sort","quick_sort"];
  const searchKeys = ["linear_search","binary_search","jump_search"];
  if (sortKeys.includes(programKey))   return simSorting(programKey, userCode);
  if (searchKeys.includes(programKey)) return simSearch(programKey, userCode);
  return simStack(programKey, userCode);
}

// ════════════════════════════════════════════════════════════════
// SORTING SIMULATIONS
// ════════════════════════════════════════════════════════════════
function simSorting(key, code) {
  let arr = parseArray(code) || [64,34,25,12,22,11,90];
  if (arr.length > 12) arr = arr.slice(0, 12);
  const steps = [];
  const a = [...arr];

  const S = (line, arr, hi, hj, swapped, sorted, minIdx, note, extra = {}) => ({
    line, arr: [...arr], hi, hj, swapped, sorted: sorted || [], minIdx: minIdx ?? -1, note,
    stack: [{ fn: "<module>", vars: { arr: `[${arr.join(", ")}]` }, depth: 0 }],
    ...extra
  });

  if (key === "bubble_sort") {
    steps.push(S(1, a, -1, -1, -1, [], -1, `▶ Initialize array: [${a.join(", ")}]`));
    for (let i = 0; i < a.length; i++) {
      steps.push(S(3, a, i, -1, -1, [], -1, `🔁 Outer loop: pass ${i+1} of ${a.length}. Each pass bubbles the largest unsorted element to position ${a.length-1-i}.`));
      for (let j = 0; j < a.length - i - 1; j++) {
        steps.push(S(4, a, i, j, -1, [], -1, `🔁 Inner loop: j = ${j}. Comparing arr[${j}] = ${a[j]} with arr[${j+1}] = ${a[j+1]}.`));
        steps.push(S(5, a, i, j, -1, [], -1, `❓ Is arr[${j}] (${a[j]}) > arr[${j+1}] (${a[j+1]})? → ${a[j] > a[j+1] ? "YES → swap!" : "NO → no swap, move on."}`));
        if (a[j] > a[j+1]) {
          [a[j], a[j+1]] = [a[j+1], a[j]];
          steps.push(S(6, a, i, j, j, [], -1, `🔄 Swapped! arr[${j}] ↔ arr[${j+1}]. Array is now: [${a.join(", ")}]`));
        }
      }
    }
    steps.push(S(8, a, -1, -1, -1, a.map((_,i)=>i), -1, `✅ Bubble Sort complete! Final sorted array: [${a.join(", ")}]`));

  } else if (key === "selection_sort") {
    steps.push(S(1, a, -1, -1, -1, [], -1, `▶ Initialize array: [${a.join(", ")}]`));
    for (let i = 0; i < a.length; i++) {
      steps.push(S(3, a, i, -1, -1, [], -1, `🔁 Outer loop: i = ${i}. Looking for the minimum in the unsorted portion arr[${i}..${a.length-1}].`));
      let minIdx = i;
      steps.push(S(4, a, i, -1, -1, [], minIdx, `📌 Assume minimum is at index ${i} → min_idx = ${minIdx}, value = ${a[minIdx]}.`));
      for (let j = i + 1; j < a.length; j++) {
        steps.push(S(5, a, i, j, -1, [], minIdx, `🔁 Inner loop: j = ${j}. Compare arr[${j}] = ${a[j]} with current min arr[${minIdx}] = ${a[minIdx]}.`));
        steps.push(S(6, a, i, j, -1, [], minIdx, `❓ Is arr[${j}] (${a[j]}) < arr[${minIdx}] (${a[minIdx]})? → ${a[j] < a[minIdx] ? "YES → new minimum found!" : "NO → keep current minimum."}`));
        if (a[j] < a[minIdx]) {
          minIdx = j;
          steps.push(S(7, a, i, j, -1, [], minIdx, `📌 New minimum! min_idx updated to ${minIdx}, value = ${a[minIdx]}.`));
        }
      }
      if (minIdx !== i) {
        [a[i], a[minIdx]] = [a[minIdx], a[i]];
        steps.push(S(8, a, i, -1, i, [], minIdx, `🔄 Swap arr[${i}] ↔ arr[${minIdx}]. Placed ${a[i]} at position ${i}. Array: [${a.join(", ")}]`));
      } else {
        steps.push(S(8, a, i, -1, -1, [], -1, `✔ arr[${i}] = ${a[i]} is already the minimum. No swap needed.`));
      }
    }
    steps.push(S(10, a, -1, -1, -1, a.map((_,i)=>i), -1, `✅ Selection Sort complete! Sorted: [${a.join(", ")}]`));

  } else if (key === "insertion_sort") {
    steps.push(S(1, a, -1, -1, -1, [], -1, `▶ Initialize array: [${a.join(", ")}]. arr[0] is trivially sorted.`));
    for (let i = 1; i < a.length; i++) {
      const keyVal = a[i];
      steps.push(S(3, a, i, -1, -1, [], -1, `🔁 Outer loop: i = ${i}. Pick element arr[${i}] = ${keyVal} as the key to insert.`));
      steps.push(S(4, a, i, -1, -1, [], -1, `🔑 key = ${keyVal}. This element needs to be placed in the correct position in arr[0..${i}].`));
      let j = i - 1;
      steps.push(S(5, a, i, j, -1, [], -1, `📍 j = ${j}. Start comparing key (${keyVal}) with the sorted portion going left.`));
      steps.push(S(6, a, i, j, -1, [], -1, `❓ While condition: j(${j}) >= 0 AND arr[${j}](${a[j]}) > key(${keyVal})? → ${j >= 0 && a[j] > keyVal ? "YES → shift element right." : "NO → found the correct spot."}`));
      while (j >= 0 && a[j] > keyVal) {
        a[j + 1] = a[j];
        steps.push(S(7, a, i, j, j+1, [], -1, `↪ Shift: arr[${j+1}] = arr[${j}] = ${a[j]}. Making room for key=${keyVal}. Array: [${a.join(", ")}]`));
        j--;
        steps.push(S(8, a, i, j, -1, [], -1, `🔁 j = ${j}. Continue: j(${j}) >= 0 AND arr[${j}](${j >= 0 ? a[j] : "—"}) > key(${keyVal})? → ${j >= 0 && a[j] > keyVal ? "YES → keep shifting." : "NO → stop shifting."}`));
      }
      a[j + 1] = keyVal;
      steps.push(S(9, a, i, j+1, j+1, [], -1, `✔ Insert key = ${keyVal} at index ${j+1}. Sorted portion is now [${a.slice(0,i+1).join(", ")}]. Array: [${a.join(", ")}]`));
    }
    steps.push(S(11, a, -1, -1, -1, a.map((_,i)=>i), -1, `✅ Insertion Sort complete! Sorted: [${a.join(", ")}]`));

  } else if (key === "merge_sort") {
    const msSteps = [];
    const origArr = [...a];
    function findRange(subArr) {
      outer: for (let start = 0; start <= origArr.length - subArr.length; start++) {
        for (let k = 0; k < subArr.length; k++) {
          if (origArr[start + k] !== subArr[k]) continue outer;
        }
        return { left: start, right: start + subArr.length - 1 };
      }
      return { left: -1, right: -1 };
    }
    function mergeSortSim(arr, depth = 0) {
      if (arr.length <= 1) return arr;
      const mid = Math.floor(arr.length / 2);
      const range = findRange(arr);
      msSteps.push({
        line: 2, arr: [...a], hi: depth, hj: -1, swapped: -1,
        mergeLeft: range.left, mergeRight: range.right,
        stack: [{ fn: "merge_sort", vars: { arr: `[${arr.join(",")}]`, len: arr.length }, depth }],
        note: `❓ Base case check: len([${arr.join(",")}]) = ${arr.length} > 1 → NOT base case, continue splitting.`
      });
      msSteps.push({
        line: 4, arr: [...a], hi: depth, hj: -1, swapped: -1,
        mergeLeft: range.left, mergeRight: range.right,
        stack: [{ fn: "merge_sort", vars: { arr: `[${arr.join(",")}]`, mid }, depth }],
        note: `✂ Split: mid = ${mid}. Left = [${arr.slice(0,mid).join(",")}], Right = [${arr.slice(mid).join(",")}].`
      });
      const left = mergeSortSim(arr.slice(0, mid), depth + 1);
      const right = mergeSortSim(arr.slice(mid), depth + 1);
      const merged = [];
      let i2 = 0, j2 = 0;
      while (i2 < left.length && j2 < right.length) {
        msSteps.push({
          line: 10, arr: [...a], hi: depth, hj: -1, swapped: -1,
          mergeLeft: range.left, mergeRight: range.right,
          stack: [{ fn: "merge", vars: { left: `[${left.join(",")}]`, right: `[${right.join(",")}]`, comparing: `${left[i2]} vs ${right[j2]}` }, depth }],
          note: `🔀 Merging: Compare ${left[i2]} and ${right[j2]} → pick ${left[i2] <= right[j2] ? left[i2] : right[j2]}.`
        });
        if (left[i2] <= right[j2]) merged.push(left[i2++]);
        else merged.push(right[j2++]);
      }
      while (i2 < left.length) merged.push(left[i2++]);
      while (j2 < right.length) merged.push(right[j2++]);
      msSteps.push({
        line: 6, arr: [...a], hi: depth, hj: -1, swapped: -1,
        mergeLeft: range.left, mergeRight: range.right,
        stack: [{ fn: "merge_sort", vars: { result: `[${merged.join(",")}]` }, depth }],
        note: `✅ Merged result: [${merged.join(", ")}].`
      });
      return merged;
    }
    steps.push({ line: 1, arr: [...a], hi: -1, hj: -1, swapped: -1, mergeLeft: -1, mergeRight: -1, stack: [{ fn: "<module>", vars: { arr: `[${a.join(",")}]` }, depth: 0 }], note: `▶ Starting Merge Sort on [${a.join(", ")}].` });
    const sorted = mergeSortSim([...a]);
    steps.push(...msSteps);
    steps.push({ line: 18, arr: sorted, hi: -1, hj: -1, swapped: -1, mergeLeft: -1, mergeRight: -1, stack: [{ fn: "<module>", vars: { result: `[${sorted.join(",")}]` }, depth: 0 }], note: `✅ Merge Sort complete! Result: [${sorted.join(", ")}].` });

  } else if (key === "quick_sort") {
    const qsSteps = [];
    const qa = [...a];
    function quickSortSim(arr, low, high, depth = 0) {
      qsSteps.push({
        line: 1, arr: [...arr], hi: high, hj: low, swapped: -1,
        partLow: low, partHigh: high, pivotIdx: high,
        stack: [{ fn: "quick_sort", vars: { low, high }, depth }],
        note: `❓ Condition check: low(${low}) < high(${high})? → ${low < high ? "YES → partition and recurse." : "NO → base case, subarray has 0 or 1 element, already sorted."}`
      });
      if (low < high) {
        const pivot = arr[high];
        qsSteps.push({
          line: 7, arr: [...arr], hi: high, hj: low, swapped: -1,
          partLow: low, partHigh: high, pivotIdx: high,
          stack: [{ fn: "partition", vars: { pivot: `arr[${high}] = ${pivot}`, range: `[${low}..${high}]` }, depth }],
          note: `📌 Pivot selected: arr[${high}] = ${pivot}. Elements ≤ ${pivot} go left, elements > ${pivot} go right.`
        });
        let i = low - 1;
        for (let j = low; j < high; j++) {
          qsSteps.push({
            line: 9, arr: [...arr], hi: high, hj: j, swapped: -1,
            partLow: low, partHigh: high, pivotIdx: high,
            stack: [{ fn: "partition", vars: { j, "arr[j]": arr[j], pivot, i }, depth }],
            note: `❓ Is arr[${j}] (${arr[j]}) ≤ pivot (${pivot})? → ${arr[j] <= pivot ? "YES → move to left partition." : "NO → leave in right partition."}`
          });
          if (arr[j] <= pivot) {
            i++;
            if (i !== j) {
              [arr[i], arr[j]] = [arr[j], arr[i]];
              qsSteps.push({
                line: 10, arr: [...arr], hi: high, hj: j, swapped: i,
                partLow: low, partHigh: high, pivotIdx: high,
                stack: [{ fn: "partition", vars: { swapped: `arr[${i}] ↔ arr[${j}]`, "i": i }, depth }],
                note: `🔄 Swap arr[${i}] (${arr[j]}) ↔ arr[${j}] (${arr[i]}). Array: [${arr.join(",")}]`
              });
            } else {
              qsSteps.push({
                line: 10, arr: [...arr], hi: high, hj: j, swapped: i,
                partLow: low, partHigh: high, pivotIdx: high,
                stack: [{ fn: "partition", vars: { i }, depth }],
                note: `✔ i = ${i}. arr[${j}] = ${arr[j]} already in place, no swap needed.`
              });
            }
          }
        }
        [arr[i+1], arr[high]] = [arr[high], arr[i+1]];
        const pi = i + 1;
        qsSteps.push({
          line: 11, arr: [...arr], hi: -1, hj: -1, swapped: pi,
          partLow: low, partHigh: high, pivotIdx: pi,
          stack: [{ fn: "partition", vars: { pivot_pos: pi, pivot_val: arr[pi] }, depth }],
          note: `📍 Place pivot ${arr[pi]} at index ${pi}. Everything left is ≤ ${arr[pi]}, everything right is > ${arr[pi]}.`
        });
        quickSortSim(arr, low, pi - 1, depth + 1);
        quickSortSim(arr, pi + 1, high, depth + 1);
      }
    }
    steps.push({ line: 16, arr: [...qa], hi: -1, hj: -1, swapped: -1, partLow: -1, partHigh: -1, pivotIdx: -1, stack: [{ fn: "<module>", vars: { arr: `[${qa.join(",")}]` }, depth: 0 }], note: `▶ Start Quick Sort on [${qa.join(", ")}].` });
    quickSortSim(qa, 0, qa.length - 1);
    steps.push({ line: 17, arr: [...qa], hi: -1, hj: -1, swapped: -1, partLow: -1, partHigh: -1, pivotIdx: -1, stack: [{ fn: "<module>", vars: { result: `[${qa.join(",")}]` }, depth: 0 }], note: `✅ Quick Sort complete! Sorted: [${qa.join(", ")}].` });
  }

  return steps;
}

// ════════════════════════════════════════════════════════════════
// SEARCH SIMULATIONS
// ════════════════════════════════════════════════════════════════
function simSearch(key, code) {
  const { arr, target } = parseSearch(code);
  const steps = [];

  if (key === "linear_search") {
    steps.push({ line: 1, arr, searchIdx: -1, found: -1, lo: -1, hi: -1, mid: -1, stack: [{ fn: "<module>", vars: { arr: `[${arr.join(",")}]`, target }, depth: 0 }], note: `▶ Call linear_search(arr, ${target}). Will scan every element left-to-right.` });
    let foundAt = -1;
    for (let i = 0; i < arr.length; i++) {
      steps.push({ line: 2, arr, searchIdx: i, found: -1, lo: -1, hi: -1, mid: -1, stack: [{ fn: "linear_search", vars: { i, "arr[i]": arr[i], target }, depth: 1 }], note: `🔁 Loop: i = ${i}. Now examining arr[${i}] = ${arr[i]}.` });
      const match = arr[i] === target;
      steps.push({ line: 3, arr, searchIdx: i, found: -1, lo: -1, hi: -1, mid: -1, stack: [{ fn: "linear_search", vars: { "arr[i]": arr[i], target, match }, depth: 1 }], note: `❓ Is arr[${i}] (${arr[i]}) == target (${target})? → ${match ? "YES ✓ Found it!" : "NO → keep searching."}` });
      if (match) { foundAt = i; break; }
    }
    if (foundAt >= 0) {
      steps.push({ line: 4, arr, searchIdx: -1, found: foundAt, lo: -1, hi: -1, mid: -1, stack: [{ fn: "linear_search", vars: { return: foundAt }, depth: 1 }], note: `✅ Return index ${foundAt}. Target ${target} found at arr[${foundAt}].` });
    } else {
      steps.push({ line: 5, arr, searchIdx: -1, found: -1, lo: -1, hi: -1, mid: -1, stack: [{ fn: "linear_search", vars: { return: -1 }, depth: 1 }], note: `❌ Loop finished. Target ${target} not found. Return -1.` });
    }

  } else if (key === "binary_search") {
    let lo = 0, hi = arr.length - 1;
    steps.push({ line: 1, arr, searchIdx: -1, found: -1, lo, hi, mid: -1, stack: [{ fn: "<module>", vars: { arr: `[${arr.join(",")}]`, target }, depth: 0 }], note: `▶ Call binary_search(arr, ${target}). Array must be sorted. Search range: [0..${hi}].` });
    steps.push({ line: 2, arr, searchIdx: -1, found: -1, lo, hi, mid: -1, stack: [{ fn: "binary_search", vars: { low: lo, high: hi }, depth: 1 }], note: `📍 Initialize: low = ${lo}, high = ${hi}.` });
    let foundAt = -1;
    while (lo <= hi) {
      steps.push({ line: 3, arr, searchIdx: -1, found: -1, lo, hi, mid: -1, stack: [{ fn: "binary_search", vars: { low: lo, high: hi }, depth: 1 }], note: `❓ While condition: low(${lo}) ≤ high(${hi})? → YES → compute midpoint.` });
      const mid = Math.floor((lo + hi) / 2);
      steps.push({ line: 4, arr, searchIdx: -1, found: -1, lo, hi, mid, stack: [{ fn: "binary_search", vars: { mid, "arr[mid]": arr[mid], target }, depth: 1 }], note: `📐 mid = (${lo} + ${hi}) ÷ 2 = ${mid}. Checking arr[${mid}] = ${arr[mid]}.` });
      if (arr[mid] === target) {
        steps.push({ line: 5, arr, searchIdx: -1, found: mid, lo, hi, mid, stack: [{ fn: "binary_search", vars: { "arr[mid]": arr[mid], target, result: "FOUND" }, depth: 1 }], note: `✅ arr[${mid}] (${arr[mid]}) == target (${target}). Return index ${mid}.` });
        foundAt = mid; break;
      } else if (arr[mid] < target) {
        steps.push({ line: 6, arr, searchIdx: -1, found: -1, lo, hi, mid, stack: [{ fn: "binary_search", vars: { "arr[mid]": arr[mid], target }, depth: 1 }], note: `❓ arr[${mid}] (${arr[mid]}) == target? NO. arr[${mid}] < target? → YES → target is in right half.` });
        lo = mid + 1;
        steps.push({ line: 7, arr, searchIdx: -1, found: -1, lo, hi, mid, stack: [{ fn: "binary_search", vars: { low: lo, high: hi }, depth: 1 }], note: `➡ Discard left half. new low = mid + 1 = ${lo}. Search range now: [${lo}..${hi}].` });
      } else {
        steps.push({ line: 8, arr, searchIdx: -1, found: -1, lo, hi, mid, stack: [{ fn: "binary_search", vars: { "arr[mid]": arr[mid], target }, depth: 1 }], note: `❓ arr[${mid}] (${arr[mid]}) == target? NO. arr[${mid}] < target? NO → arr[mid] > target → target is in left half.` });
        hi = mid - 1;
        steps.push({ line: 9, arr, searchIdx: -1, found: -1, lo, hi, mid, stack: [{ fn: "binary_search", vars: { low: lo, high: hi }, depth: 1 }], note: `⬅ Discard right half. new high = mid - 1 = ${hi}. Search range now: [${lo}..${hi}].` });
      }
    }
    if (foundAt < 0) {
      steps.push({ line: 3, arr, searchIdx: -1, found: -1, lo, hi, mid: -1, stack: [{ fn: "binary_search", vars: { low: lo, high: hi }, depth: 1 }], note: `❓ While condition: low(${lo}) ≤ high(${hi})? → NO → loop ends.` });
      steps.push({ line: 11, arr, searchIdx: -1, found: -1, lo, hi, mid: -1, stack: [{ fn: "binary_search", vars: { return: -1 }, depth: 1 }], note: `❌ Target ${target} not found in array. Return -1.` });
    }

  } else {
    // jump search
    const n = arr.length;
    const step = Math.floor(Math.sqrt(n));
    steps.push({ line: 1, arr, searchIdx: -1, found: -1, lo: 0, hi: n-1, mid: -1, stack: [{ fn: "<module>", vars: { arr: `[${arr.join(",")}]`, target }, depth: 0 }], note: `▶ Call jump_search(arr, ${target}). Array length = ${n}, block step = √${n} ≈ ${step}.` });
    let prev = 0, s = step;
    steps.push({ line: 5, arr, searchIdx: -1, found: -1, lo: 0, hi: n-1, mid: -1, stack: [{ fn: "jump_search", vars: { n, step }, depth: 1 }], note: `📐 step = int(√${n}) = ${step}. Jump ahead ${step} elements at a time.` });
    while (s < n && arr[Math.min(s, n) - 1] < target) {
      const idx = Math.min(s, n) - 1;
      steps.push({ line: 7, arr, searchIdx: idx, found: -1, lo: prev, hi: idx, mid: -1, stack: [{ fn: "jump_search", vars: { prev, step: s, "arr[step-1]": arr[idx], target }, depth: 1 }], note: `🦘 arr[${idx}] = ${arr[idx]} < target ${target} → jump forward. prev = ${s}.` });
      prev = s; s += step;
    }
    steps.push({ line: 9, arr, searchIdx: -1, found: -1, lo: prev, hi: Math.min(s,n)-1, mid: -1, stack: [{ fn: "jump_search", vars: { range: `[${prev}..${Math.min(s,n)-1}]` }, depth: 1 }], note: `🔍 Overshot! Now do linear search in block [${prev}..${Math.min(s,n)-1}].` });
    let foundAt = -1;
    for (let i = prev; i < Math.min(s, n); i++) {
      steps.push({ line: 10, arr, searchIdx: i, found: -1, lo: prev, hi: Math.min(s,n)-1, mid: -1, stack: [{ fn: "jump_search", vars: { i, "arr[i]": arr[i], target }, depth: 1 }], note: `❓ arr[${i}] (${arr[i]}) == target (${target})? → ${arr[i] === target ? "YES ✓ Found!" : "NO → continue."}` });
      if (arr[i] === target) { foundAt = i; break; }
    }
    if (foundAt >= 0) steps.push({ line: 13, arr, searchIdx: -1, found: foundAt, lo: -1, hi: -1, mid: -1, stack: [{ fn: "jump_search", vars: { return: foundAt }, depth: 1 }], note: `✅ Return ${foundAt}. Found ${target} at index ${foundAt}.` });
    else steps.push({ line: 15, arr, searchIdx: -1, found: -1, lo: -1, hi: -1, mid: -1, stack: [{ fn: "jump_search", vars: { return: -1 }, depth: 1 }], note: `❌ ${target} not found. Return -1.` });
  }

  return steps;
}

// ════════════════════════════════════════════════════════════════
// STACK / RECURSIVE SIMULATIONS
// ════════════════════════════════════════════════════════════════
function simStack(key, code) {
  const steps = [];
  const S = (line, stack, note, extra = {}) => ({ line, stack, note, ...extra });

  // ── FACTORIAL ────────────────────────────────────────────────
  if (key === "factorial") {
    const n = Math.min(parseFactorialN(code), 8);
    steps.push(S(1, [{ fn: "<module>", vars: {}, depth: 0 }], `▶ Define function factorial(n).`));
    steps.push(S(6, [{ fn: "<module>", vars: { result: "?" }, depth: 0 }], `📞 Call factorial(${n}). Jump into the function.`));

    function factSteps(val, callStack) {
      const newFrame = { fn: "factorial", vars: { n: val }, depth: callStack.length };
      const cs = [newFrame, ...callStack];
      steps.push(S(1, cs, `📥 Enter factorial(n=${val}). Push new frame onto call stack. Stack depth = ${cs.length}.`));
      steps.push(S(2, cs, `❓ Check base case: n == 0? → n is ${val}, so ${val === 0 ? "YES ✓ Base case reached!" : "NO → recurse deeper."}`));
      if (val === 0) {
        const retCs = [{ ...newFrame, vars: { n: val, "↩ return": 1 }, returning: true }, ...callStack];
        steps.push(S(3, retCs, `✅ Base case! n == 0 → return 1. This frame will now pop off the stack.`));
        return 1;
      }
      steps.push(S(4, cs, `🔁 n != 0. Execute: return ${val} × factorial(${val - 1}). First, call factorial(${val - 1}).`));
      const sub = factSteps(val - 1, cs);
      const result = val * sub;
      const retCs = [{ ...newFrame, vars: { n: val, "factorial(n-1)": sub, "↩ return": result }, returning: true }, ...callStack];
      steps.push(S(4, retCs, `✅ factorial(${val - 1}) returned ${sub}. Now compute ${val} × ${sub} = ${result}. Pop frame.`));
      return result;
    }

    const finalResult = factSteps(n, [{ fn: "<module>", vars: {}, depth: 0 }]);
    steps.push(S(6, [{ fn: "<module>", vars: { result: finalResult }, depth: 0 }], `🎉 factorial(${n}) = ${finalResult}. result = ${finalResult}.`));
    steps.push(S(7, [{ fn: "<module>", vars: { result: finalResult }, depth: 0 }], `📤 print(result) → Output: ${finalResult}`));
    return steps;
  }

  // ── FIBONACCI ────────────────────────────────────────────────
  if (key === "fibonacci") {
    const n = Math.min(parseFibN(code), 7);
    steps.push(S(1, [{ fn: "<module>", vars: {}, depth: 0 }], `▶ Define function fib(n).`));
    steps.push(S(6, [{ fn: "<module>", vars: { result: "?" }, depth: 0 }], `📞 Call fib(${n}). Starting Fibonacci computation.`));

    function fibSteps(val, callStack) {
      const newFrame = { fn: "fib", vars: { n: val }, depth: callStack.length };
      const cs = [newFrame, ...callStack];
      steps.push(S(1, cs, `📥 Enter fib(n=${val}). Stack depth = ${cs.length}.`));
      steps.push(S(2, cs, `❓ Check base case: n <= 1? → n = ${val}, so ${val <= 1 ? "YES ✓ Base case! Return n directly." : "NO → need to compute fib(n-1) + fib(n-2)."}`));
      if (val <= 1) {
        const retCs = [{ ...newFrame, vars: { n: val, "↩ return": val }, returning: true }, ...callStack];
        steps.push(S(3, retCs, `✅ Base case: n = ${val} ≤ 1 → return ${val}. Frame pops off the stack.`));
        return val;
      }
      steps.push(S(4, cs, `🔁 Recursive case. Need fib(${val-1}) + fib(${val-2}). First, calling fib(${val-1}).`));
      const a = fibSteps(val - 1, cs);
      steps.push(S(4, [{ ...newFrame, vars: { n: val, "fib(n-1)": a, "fib(n-2)": "?" } }, ...callStack], `✔ fib(${val-1}) = ${a}. Now call fib(${val-2}).`));
      const b = fibSteps(val - 2, [{ ...newFrame, vars: { n: val, "fib(n-1)": a } }, ...callStack]);
      const res = a + b;
      const retCs = [{ ...newFrame, vars: { n: val, "fib(n-1)": a, "fib(n-2)": b, "↩ return": `${a}+${b}=${res}` }, returning: true }, ...callStack];
      steps.push(S(4, retCs, `✅ fib(${val-2}) = ${b}. Compute ${a} + ${b} = ${res}. Return ${res}. Pop frame.`));
      return res;
    }

    const finalResult = fibSteps(n, [{ fn: "<module>", vars: {}, depth: 0 }]);
    steps.push(S(6, [{ fn: "<module>", vars: { result: finalResult }, depth: 0 }], `🎉 fib(${n}) = ${finalResult}. result = ${finalResult}.`));
    steps.push(S(7, [{ fn: "<module>", vars: { result: finalResult }, depth: 0 }], `📤 print(result) → Output: ${finalResult}`));
    return steps;
  }

  // ── SUM ARRAY ────────────────────────────────────────────────
  if (key === "sum_array") {
    const arr = parseSumArray(code);
    steps.push(S(1, [{ fn: "<module>", vars: {}, depth: 0 }], `▶ Define function sum_arr(arr).`));
    steps.push(S(6, [{ fn: "<module>", vars: { result: "?" }, depth: 0 }], `📞 Call sum_arr([${arr.join(", ")}]).`));

    function sumSteps(a, callStack) {
      const newFrame = { fn: "sum_arr", vars: { arr: `[${a.join(",")}]` }, depth: callStack.length };
      const cs = [newFrame, ...callStack];
      steps.push(S(1, cs, `📥 Enter sum_arr([${a.join(",")}]). Stack depth = ${cs.length}.`));
      steps.push(S(2, cs, `❓ Base case: len(arr) == 0? → len = ${a.length}, so ${a.length === 0 ? "YES ✓ Return 0." : "NO → recurse."}`));
      if (a.length === 0) {
        const ret = [{ ...newFrame, vars: { arr: "[]", "↩ return": 0 }, returning: true }, ...callStack];
        steps.push(S(3, ret, `✅ Empty array → return 0. Base case reached!`));
        return 0;
      }
      steps.push(S(4, cs, `🔁 Return arr[0] + sum_arr(arr[1:]). arr[0] = ${a[0]}, rest = [${a.slice(1).join(",")}].`));
      const sub = sumSteps(a.slice(1), cs);
      const res = a[0] + sub;
      const ret = [{ ...newFrame, vars: { arr: `[${a.join(",")}]`, "arr[0]": a[0], "sum_arr(rest)": sub, "↩ return": res }, returning: true }, ...callStack];
      steps.push(S(4, ret, `✅ sum_arr([${a.slice(1).join(",")}]) = ${sub}. Compute ${a[0]} + ${sub} = ${res}. Pop frame.`));
      return res;
    }

    const finalResult = sumSteps(arr, [{ fn: "<module>", vars: {}, depth: 0 }]);
    steps.push(S(6, [{ fn: "<module>", vars: { result: finalResult }, depth: 0 }], `🎉 sum_arr([${arr.join(",")}]) = ${finalResult}.`));
    steps.push(S(7, [{ fn: "<module>", vars: { result: finalResult }, depth: 0 }], `📤 print(${finalResult}) → Output: ${finalResult}`));
    return steps;
  }

  // ── TOWER OF HANOI ───────────────────────────────────────────
  if (key === "tower_of_hanoi") {
    const n = Math.min(parseHanoiN(code), 4);
    const moves = [];
    const hanoiMeta = () => ({ hanoiN: n, hanoiMoves: moves.map(m => ({ ...m })) });

    steps.push({ ...S(1, [{ fn: "<module>", vars: {}, depth: 0 }], `▶ Define function hanoi(n, src, dst, aux).`), ...hanoiMeta() });
    steps.push({ ...S(9, [{ fn: "<module>", vars: { n, src: "'A'", dst: "'C'", aux: "'B'" }, depth: 0 }], `📞 Call hanoi(${n}, 'A', 'C', 'B'). Total moves needed: 2^${n}-1 = ${Math.pow(2,n)-1}.`), ...hanoiMeta() });

    function hanoiSteps(disks, src, dst, aux, callStack) {
      const newFrame = { fn: "hanoi", vars: { n: disks, src: `'${src}'`, dst: `'${dst}'`, aux: `'${aux}'` }, depth: callStack.length };
      const cs = [newFrame, ...callStack];
      steps.push({ ...S(1, cs, `📥 Enter hanoi(n=${disks}, src='${src}', dst='${dst}', aux='${aux}'). Stack depth = ${cs.length}.`), ...hanoiMeta() });
      steps.push({ ...S(2, cs, `❓ Base case: n == 1? → n = ${disks}, so ${disks === 1 ? "YES ✓ Move the last disk directly." : "NO → need to make recursive calls."}`), ...hanoiMeta() });
      if (disks === 1) {
        moves.push({ disk: 1, from: src, to: dst });
        const ret = [{ ...newFrame, vars: { ...newFrame.vars, move: `disk 1: ${src}→${dst}` }, returning: true }, ...callStack];
        steps.push({ ...S(3, ret, `🔄 Move disk 1 from '${src}' → '${dst}'. Move #${moves.length} of ${Math.pow(2,n)-1}.`), ...hanoiMeta() });
        return;
      }
      steps.push({ ...S(5, cs, `📞 Step 1: Move top ${disks-1} disk(s) from '${src}' to '${aux}'. Calling hanoi(${disks-1}, '${src}', '${aux}', '${dst}').`), ...hanoiMeta() });
      hanoiSteps(disks - 1, src, aux, dst, cs);
      moves.push({ disk: disks, from: src, to: dst });
      const cs2 = [newFrame, ...callStack];
      steps.push({ ...S(6, [{ ...newFrame, vars: { ...newFrame.vars, move: `disk ${disks}: ${src}→${dst}` } }, ...callStack], `🔄 Step 2: Move disk ${disks} from '${src}' → '${dst}'. Move #${moves.length}.`), ...hanoiMeta() });
      steps.push({ ...S(7, cs2, `📞 Step 3: Move ${disks-1} disk(s) from '${aux}' to '${dst}'. Calling hanoi(${disks-1}, '${aux}', '${dst}', '${src}').`), ...hanoiMeta() });
      hanoiSteps(disks - 1, aux, dst, src, cs2);
      const ret = [{ ...newFrame, returning: true }, ...callStack];
      steps.push({ ...S(7, ret, `✅ hanoi(${disks}) complete. Pop frame.`), ...hanoiMeta() });
    }

    hanoiSteps(n, 'A', 'C', 'B', [{ fn: "<module>", vars: {}, depth: 0 }]);
    steps.push({ ...S(9, [{ fn: "<module>", vars: { done: true, total_moves: moves.length }, depth: 0 }], `🎉 Done! All ${n} disks moved from A to C in ${moves.length} moves.`), ...hanoiMeta() });
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

    steps.push(S(1, mkStack({}), `▶ Define class Node. A node stores a value and a pointer to the next node.`));
    steps.push(S(2, mkStack({}), `▶ Define __init__: sets self.val and self.next = None.`));

    nodes.forEach((v, i) => {
      const partial = {};
      for (let k = 0; k <= i; k++) partial[`Node@${String(k+1).padStart(2,"0")}`] = fullHeap[`Node@${String(k+1).padStart(2,"0")}`];
      const lineNo = 6 + i;
      if (i === 0) {
        steps.push(S(lineNo, mkStack({ head: "Node@01" }), `📦 head = Node(${v}). Allocate new node at Node@01 with val=${v}, next=None.`, { heap: partial, lastHeap: partial }));
      } else {
        steps.push(S(lineNo, mkStack({ head: "Node@01" }), `🔗 Chain: ${nodes.slice(0, i+1).join(" → ")}.`, { heap: partial, lastHeap: partial }));
      }
    });

    steps.push(S(10, mkStack({ cur: "Node@01" }), `▶ cur = head (Node@01). Start traversal.`, { heap: fullHeap, lastHeap: fullHeap }));
    nodes.forEach((v, i) => {
      const addr = `Node@${String(i+1).padStart(2,"0")}`;
      const next = i < nodes.length - 1 ? `Node@${String(i+2).padStart(2,"0")}` : "None";
      steps.push(S(11, [{ fn: "<module>", vars: { cur: addr, "cur.val": v, "cur.next": next }, depth: 0 }], `❓ cur != None? (cur = ${addr}) → YES. Execute loop body.`, { heap: fullHeap, lastHeap: fullHeap }));
      steps.push(S(12, [{ fn: "<module>", vars: { cur: addr, output: String(v) }, depth: 0 }], `📤 print(cur.val) → Output: ${v}.`, { heap: fullHeap, lastHeap: fullHeap }));
      steps.push(S(13, [{ fn: "<module>", vars: { cur: next }, depth: 0 }], `➡ cur = cur.next → ${next}.`, { heap: fullHeap, lastHeap: fullHeap }));
    });
    steps.push(S(11, [{ fn: "<module>", vars: { cur: "None" }, depth: 0 }], `❓ cur != None? (cur = None) → NO. Loop ends. Traversal complete!`, { heap: fullHeap, lastHeap: fullHeap }));
    return steps;
  }

  // ── STACK IMPL ───────────────────────────────────────────────
  if (key === "stack_impl") {
    const vals = parseStackValues(code);
    const items = vals.length > 0 ? vals : [10, 20, 30];
    const stack = [];
    steps.push(S(1, [{ fn: "<module>", vars: { stack: "[]" }, depth: 0 }], `▶ stack = []. Initialize an empty list (LIFO — Last In, First Out).`));
    items.forEach((v, i) => {
      stack.push(v);
      steps.push(S(3 + i, [{ fn: "<module>", vars: { stack: `[${stack.join(", ")}]`, pushed: v }, depth: 0 }], `📥 stack.append(${v}). Push ${v} onto the top. Stack: [${stack.join(", ")}]. Top = ${v}.`));
    });
    steps.push(S(7, [{ fn: "<module>", vars: { stack: `[${stack.join(", ")}]`, top: stack[stack.length-1] }, depth: 0 }], `📤 print("Top:", stack[-1]) → Top is ${stack[stack.length-1]}.`));
    const pops = Math.min(2, stack.length);
    for (let i = 0; i < pops; i++) {
      const popped = stack.pop();
      steps.push(S(8 + i*2, [{ fn: "<module>", vars: { popped, stack: `[${stack.join(", ")}]` }, depth: 0 }], `📤 stack.pop() removes ${popped}. Stack: [${stack.join(", ")}].`));
      steps.push(S(9 + i*2, [{ fn: "<module>", vars: { stack: `[${stack.join(", ")}]` }, depth: 0 }], `📤 print("After pop:", ${JSON.stringify(stack)}).`));
    }
    return steps;
  }

  // ── QUEUE IMPL ───────────────────────────────────────────────
  if (key === "queue_impl") {
    const vals = parseQueueValues(code);
    const items = vals.length > 0 ? vals : ["A", "B", "C"];
    const queue = [];
    steps.push(S(1, [{ fn: "<module>", vars: {}, depth: 0 }], `▶ from collections import deque. Import the double-ended queue.`));
    steps.push(S(3, [{ fn: "<module>", vars: { queue: "deque([])" }, depth: 0 }], `▶ queue = deque(). Empty queue. FIFO — First In, First Out.`));
    items.forEach((v, i) => {
      queue.push(v);
      steps.push(S(4 + i, [{ fn: "<module>", vars: { queue: `[${queue.join(", ")}]`, enqueued: `'${v}'` }, depth: 0 }], `📥 queue.append('${v}'). Enqueue at back. Queue: [${queue.join(", ")}].`));
    });
    steps.push(S(8, [{ fn: "<module>", vars: { front: `'${queue[0]}'` }, depth: 0 }], `📤 print("Front:", queue[0]) → Front is '${queue[0]}'.`));
    const dequeues = Math.min(2, queue.length);
    for (let i = 0; i < dequeues; i++) {
      const removed = queue.shift();
      steps.push(S(9 + i*2, [{ fn: "<module>", vars: { dequeued: `'${removed}'`, queue: `[${queue.join(", ")}]` }, depth: 0 }], `📤 queue.popleft() removes '${removed}' from front. Queue: [${queue.join(", ")}].`));
    }
    return steps;
  }

  // ── BST INSERT ───────────────────────────────────────────────
  if (key === "bst_insert") {
    const vals = parseBSTValues(code) || [5, 3, 7, 1, 4, 6, 8];
    let root = null;
    steps.push(S(1, [{ fn: "<module>", vars: {}, depth: 0 }], `▶ Define class Node and functions insert(), inorder().`));
    steps.push(S(19, [{ fn: "<module>", vars: { root: "None" }, depth: 0 }], `▶ root = None. Empty BST.`));

    function bstInsertSim(node, val, path, callStack) {
      const newFrame = { fn: "insert", vars: { root: node ? `Node(${node.val})` : "None", val, path }, depth: callStack.length };
      const cs = [newFrame, ...callStack];
      steps.push(S(8, cs, `📥 insert(root=${node ? `Node(${node.val})` : "None"}, val=${val}). Path: ${path}.`));
      steps.push(S(9, cs, `❓ root is None? → ${!node ? "YES ✓ Found insertion spot! Create Node(" + val + ")." : "NO → compare val with root.val."}`));
      if (!node) {
        const ret = [{ ...newFrame, vars: { ...newFrame.vars, "↩ return": `Node(${val})` }, returning: true }, ...callStack];
        steps.push(S(10, ret, `✅ Create Node(${val}) and return it. Inserted at: ${path}.`));
        return { val, left: null, right: null };
      }
      if (val < node.val) {
        steps.push(S(11, cs, `❓ Is val(${val}) < root.val(${node.val})? → YES → go LEFT.`));
        node.left = bstInsertSim(node.left, val, path + " → Left", cs);
      } else {
        steps.push(S(13, cs, `❓ Is val(${val}) < root.val(${node.val})? → NO → go RIGHT.`));
        node.right = bstInsertSim(node.right, val, path + " → Right", cs);
      }
      const ret = [{ ...newFrame, vars: { ...newFrame.vars, "↩ return": `Node(${node.val})` }, returning: true }, ...callStack];
      steps.push(S(14, ret, `↩ Return Node(${node.val}) back up the chain.`));
      return node;
    }

    vals.forEach((v, i) => {
      steps.push(S(20, [{ fn: "<module>", vars: { inserting: v }, depth: 0 }], `🔁 Loop iteration ${i+1}: Inserting ${v} into the BST.`));
      root = bstInsertSim(root, v, "root", [{ fn: "<module>", vars: {}, depth: 0 }]);
    });

    const order = [];
    function inorderSim(node, callStack) {
      if (!node) return;
      const cs = [{ fn: "inorder", vars: { root: `Node(${node.val})` }, depth: callStack.length }, ...callStack];
      steps.push(S(17, cs, `📥 inorder(Node(${node.val})). Visit left subtree first.`));
      inorderSim(node.left, cs);
      order.push(node.val);
      steps.push(S(18, cs, `📤 print(${node.val}). In-order output so far: [${order.join(", ")}].`));
      inorderSim(node.right, cs);
    }
    steps.push(S(21, [{ fn: "<module>", vars: { root: `Node(${root.val})` }, depth: 0 }], `📞 Call inorder(root). In-order traversal always produces sorted output.`));
    inorderSim(root, [{ fn: "<module>", vars: {}, depth: 0 }]);
    steps.push(S(18, [{ fn: "<module>", vars: { sorted_output: order.join(" ") }, depth: 0 }], `✅ In-order traversal complete. Output: [${order.join(", ")}] — sorted!`));
    return steps;
  }

  // ── BFS ──────────────────────────────────────────────────────
  if (key === "bfs") {
    const graph = { 0:[1,2], 1:[0,3,4], 2:[0,5], 3:[1], 4:[1], 5:[2] };
    const queue = [0];
    const visited = new Set([0]);
    const order = [];
    steps.push(S(3, [{ fn: "<module>", vars: { graph: "{0:[1,2], 1:[0,3,4], ...}" }, depth: 0 }], `▶ Define adjacency list graph.`));
    steps.push(S(12, [{ fn: "<module>", vars: {}, depth: 0 }], `📞 Call bfs(start=0).`));
    steps.push(S(13, [{ fn: "bfs", vars: { visited: "{0}", queue: "[0]" }, depth: 1 }], `📥 Enter bfs(0). visited = {0}, queue = [0].`));
    while (queue.length > 0) {
      const node = queue.shift();
      order.push(node);
      steps.push(S(14, [{ fn: "bfs", vars: { node, queue: `[${queue.join(",")}]`, order: `[${order.join(",")}]` }, depth: 1 }], `📤 Dequeue node ${node}. Order → [${order.join(", ")}]. Explore neighbors: [${graph[node].join(", ")}].`));
      (graph[node] || []).forEach(nb => {
        if (!visited.has(nb)) {
          steps.push(S(16, [{ fn: "bfs", vars: { neighbor: nb, "already visited?": "NO" }, depth: 1 }], `❓ Is neighbor ${nb} visited? → NO → mark visited and enqueue.`));
          visited.add(nb);
          queue.push(nb);
          steps.push(S(17, [{ fn: "bfs", vars: { enqueued: nb, queue: `[${queue.join(",")}]`, visited: `{${[...visited].join(",")}}` }, depth: 1 }], `✔ Enqueue ${nb}. Queue: [${queue.join(", ")}].`));
        } else {
          steps.push(S(16, [{ fn: "bfs", vars: { neighbor: nb, "already visited?": "YES → skip" }, depth: 1 }], `❓ Is neighbor ${nb} visited? → YES → skip.`));
        }
      });
    }
    steps.push(S(19, [{ fn: "bfs", vars: { return: `[${order.join(",")}]` }, depth: 1 }], `↩ Return order = [${order.join(", ")}].`));
    steps.push(S(21, [{ fn: "<module>", vars: { result: `[${order.join(",")}]` }, depth: 0 }], `✅ BFS complete! Order: [${order.join(", ")}].`));
    return steps;
  }

  // ── DFS ──────────────────────────────────────────────────────
  if (key === "dfs") {
    const graph = { 0:[1,2], 1:[0,3,4], 2:[0,5], 3:[1], 4:[1], 5:[2] };
    const visited = new Set();
    const order = [];
    steps.push(S(1, [{ fn: "<module>", vars: { graph: "{0:[1,2], 1:[0,3,4], ...}" }, depth: 0 }], `▶ Define adjacency list graph.`));
    steps.push(S(12, [{ fn: "<module>", vars: {}, depth: 0 }], `📞 Call dfs(0).`));

    function dfsSim(node, callStack) {
      const newFrame = { fn: "dfs", vars: { node, visited: `{${[...visited, node].join(",")}}` }, depth: callStack.length };
      const cs = [newFrame, ...callStack];
      steps.push(S(9, cs, `📥 Enter dfs(${node}). Add ${node} to visited. Stack depth = ${cs.length}.`));
      visited.add(node);
      order.push(node);
      steps.push(S(10, [{ ...newFrame, vars: { node, "↩ print": node, visited: `{${[...visited].join(",")}}` } }, ...callStack], `📤 print(${node}). Output: ${order.join(" → ")}.`));
      (graph[node] || []).forEach(nb => {
        if (!visited.has(nb)) {
          steps.push(S(11, [{ ...newFrame, vars: { node, neighbor: nb, "visited?": "NO" } }, ...callStack], `❓ Neighbor ${nb} visited? → NO → recurse into dfs(${nb}).`));
          dfsSim(nb, cs);
          steps.push(S(11, [{ ...newFrame, vars: { node, backtrack: `back to ${node}` } }, ...callStack], `↩ Backtrack to node ${node}.`));
        } else {
          steps.push(S(11, [{ ...newFrame, vars: { node, neighbor: nb, "visited?": "YES → skip" } }, ...callStack], `❓ Neighbor ${nb} visited? → YES → skip.`));
        }
      });
      const ret = [{ ...newFrame, returning: true }, ...callStack];
      steps.push(S(9, ret, `↩ dfs(${node}) complete. All neighbors explored. Pop frame.`));
    }

    dfsSim(0, [{ fn: "<module>", vars: {}, depth: 0 }]);
    steps.push(S(12, [{ fn: "<module>", vars: { output: order.join(" → ") }, depth: 0 }], `✅ DFS complete! Traversal: ${order.join(" → ")}.`));
    return steps;
  }

  // ── FIB DP ───────────────────────────────────────────────────
  if (key === "fib_dp") {
    const limit = Math.min(parseFibRange(code), 10);
    const memo = {};
    steps.push(S(1, [{ fn: "<module>", vars: {}, depth: 0 }], `▶ Define fib_memo(n, memo={}). Uses memoization to cache results.`));
    steps.push(S(8, [{ fn: "<module>", vars: { i: "0.." + (limit-1) }, depth: 0 }], `🔁 Loop: compute fib(0) through fib(${limit-1}).`));

    function fibMemoSim(n, callStack) {
      const cs = [{ fn: "fib_memo", vars: { n, memo: `{${Object.entries(memo).map(([k,v])=>k+":"+v).join(",")}}` }, depth: callStack.length }, ...callStack];
      steps.push(S(1, cs, `📥 Enter fib_memo(${n}). Current memo: {${Object.entries(memo).map(([k,v])=>k+":"+v).join(", ")||"empty"}}.`));
      if (memo[n] !== undefined) {
        steps.push(S(2, cs, `❓ Is ${n} in memo? → YES ✓ Cache hit! memo[${n}] = ${memo[n]}.`));
        const ret = [{ fn: "fib_memo", vars: { n, "↩ cache hit": memo[n] }, depth: callStack.length, returning: true }, ...callStack];
        steps.push(S(3, ret, `✅ Return ${memo[n]} from cache. No recursion needed!`));
        return memo[n];
      }
      steps.push(S(2, cs, `❓ Is ${n} in memo? → NO → compute it.`));
      if (n <= 1) {
        steps.push(S(4, cs, `❓ n <= 1? → YES (n=${n}) → base case. Return ${n}.`));
        memo[n] = n;
        const ret = [{ fn: "fib_memo", vars: { n, "↩ return": n }, depth: callStack.length, returning: true }, ...callStack];
        steps.push(S(5, ret, `✅ Store memo[${n}] = ${n}. Return ${n}.`));
        return n;
      }
      steps.push(S(4, cs, `❓ n <= 1? → NO (n=${n}) → recursive case. Compute fib_memo(${n-1}) + fib_memo(${n-2}).`));
      steps.push(S(6, cs, `📞 Call fib_memo(${n-1}).`));
      const a = fibMemoSim(n - 1, cs);
      steps.push(S(6, [{ fn: "fib_memo", vars: { n, "fib(n-1)": a }, depth: callStack.length }, ...callStack], `✔ fib_memo(${n-1}) = ${a}. Now call fib_memo(${n-2}).`));
      const b = fibMemoSim(n - 2, [{ fn: "fib_memo", vars: { n, "fib(n-1)": a }, depth: callStack.length }, ...callStack]);
      const res = a + b;
      memo[n] = res;
      const ret = [{ fn: "fib_memo", vars: { n, result: `${a}+${b}=${res}`, "↩ return": res }, depth: callStack.length, returning: true }, ...callStack];
      steps.push(S(6, ret, `✅ fib(${n}) = ${a} + ${b} = ${res}. Store in memo. Return ${res}.`));
      return res;
    }

    for (let i = 0; i < limit; i++) {
      steps.push(S(8, [{ fn: "<module>", vars: { i }, depth: 0 }], `🔁 Loop i = ${i}. Calling fib_memo(${i}).`));
      const v = fibMemoSim(i, [{ fn: "<module>", vars: {}, depth: 0 }]);
      steps.push(S(9, [{ fn: "<module>", vars: { [`fib(${i})`]: v }, depth: 0 }], `📤 fib(${i}) = ${v}`));
    }
    return steps;
  }

  // ── KNAPSACK ─────────────────────────────────────────────────
  if (key === "knapsack") {
    const { weights, values, capacity } = parseKnapsack(code);
    const n = weights.length;
    const dp = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));
    const knapsackMeta = { kWeights: weights, kValues: values, kCapacity: capacity };
    steps.push(S(1, [{ fn: "<module>", vars: { weights: `[${weights.join(",")}]`, values: `[${values.join(",")}]`, capacity }, depth: 0 }], `▶ ${n} items. weights=[${weights.join(",")}], values=[${values.join(",")}], capacity=${capacity}.`, knapsackMeta));
    steps.push(S(3, [{ fn: "knapsack", vars: { n, capacity, dp: `(${n+1})×(${capacity+1}) zeros` }, depth: 1 }], `▶ Create dp table [${n+1}][${capacity+1}], all zeros.`, knapsackMeta));

    for (let i = 1; i <= n; i++) {
      steps.push(S(4, [{ fn: "knapsack", vars: { item: i, weight: weights[i-1], value: values[i-1] }, depth: 1 }], `🔁 Item ${i}: weight=${weights[i-1]}, value=${values[i-1]}.`, knapsackMeta));
      for (let w = 0; w <= capacity; w++) {
        dp[i][w] = dp[i-1][w];
        if (weights[i-1] <= w) {
          const withItem = values[i-1] + dp[i-1][w - weights[i-1]];
          if (withItem > dp[i][w]) {
            dp[i][w] = withItem;
            if (w === capacity || w === Math.floor(capacity / 2)) {
              steps.push(S(7, [{ fn: "knapsack", vars: { i, w, "skip": dp[i-1][w], "include": withItem, "dp[i][w]": dp[i][w] }, depth: 1 }], `❓ w=${w}: Include item ${i}? skip=${dp[i-1][w]}, include=${withItem}. → include wins! dp[${i}][${w}] = ${dp[i][w]}.`, knapsackMeta));
            }
          }
        }
      }
    }
    steps.push(S(9, [{ fn: "<module>", vars: { result: dp[n][capacity] }, depth: 0 }], `✅ Max value = dp[${n}][${capacity}] = ${dp[n][capacity]}.`, knapsackMeta));
    return steps;
  }

  // ── LCS ──────────────────────────────────────────────────────
  if (key === "lcs") {
    const { s1, s2 } = parseLCS(code);
    const m = s1.length, n2 = s2.length;
    const dp = Array.from({ length: m+1 }, () => Array(n2+1).fill(0));
    const lcsMeta = { lcsS1: s1, lcsS2: s2 };
    steps.push(S(1, [{ fn: "<module>", vars: { s1: `"${s1}"`, s2: `"${s2}"` }, depth: 0 }], `▶ lcs("${s1}", "${s2}"). Find the longest common subsequence length.`, lcsMeta));
    steps.push(S(3, [{ fn: "lcs", vars: { m, n: n2, dp: `(${m+1})×(${n2+1}) zeros` }, depth: 1 }], `▶ dp table [${m+1}][${n2+1}], all zeros.`, lcsMeta));
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n2; j++) {
        if (s1[i-1] === s2[j-1]) {
          dp[i][j] = dp[i-1][j-1] + 1;
          steps.push(S(5, [{ fn: "lcs", vars: { i, j, "s1[i-1]": `'${s1[i-1]}'`, "s2[j-1]": `'${s2[j-1]}'`, match: "YES!", "dp[i][j]": dp[i][j] }, depth: 1 }], `✅ s1[${i-1}]='${s1[i-1]}' == s2[${j-1}]='${s2[j-1]}'. Match! dp[${i}][${j}] = ${dp[i][j]}.`, lcsMeta));
        } else {
          dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
          if (dp[i][j] > 0) {
            steps.push(S(7, [{ fn: "lcs", vars: { i, j, "s1[i-1]": `'${s1[i-1]}'`, "s2[j-1]": `'${s2[j-1]}'`, match: "NO", "dp[i][j]": dp[i][j] }, depth: 1 }], `❓ No match. dp[${i}][${j}] = max(${dp[i-1][j]}, ${dp[i][j-1]}) = ${dp[i][j]}.`, lcsMeta));
          }
        }
      }
    }
    steps.push(S(10, [{ fn: "<module>", vars: { result: dp[m][n2] }, depth: 0 }], `✅ LCS length = dp[${m}][${n2}] = ${dp[m][n2]}.`, lcsMeta));
    return steps;
  }

  return [{ line: 1, stack: [{ fn: "<module>", vars: {}, depth: 0 }], note: "▶ Starting execution." }];
}
