import { useState, useRef, useEffect } from "react";
import {
  FiPlay, FiPause, FiSkipBack, FiSkipForward,
  FiRotateCcw, FiCpu, FiAlertCircle, FiChevronRight,
  FiChevronDown, FiEdit3, FiRefreshCw, FiBookOpen, FiX,
  FiBook, FiSettings, FiSearch, FiZap, FiCheckCircle,
  FiClock, FiDatabase
} from "react-icons/fi";
import { saveVisualizerSession } from "../services/sessions";
import { ProgramDiagram } from "./VisualizerDiagrams";
import "./Visualizer.css";

// ─────────────────────────────────────────────────────────────────────────────
// CHAPTER + PROGRAM DATA
// ─────────────────────────────────────────────────────────────────────────────
const CHAPTERS = [
  {
    id: "recursion",
    label: "Recursion",
    level: "Beginner",
    programs: [
      {
        key: "factorial",
        label: "Factorial",
        desc: "Classic recursive function. n! = n × (n-1) × ... × 1",
        difficulty: "Easy",
        code: `def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n - 1)

result = factorial(4)
print(result)`,
        theory: {
          title: "Factorial — Recursive Logic",
          concept: "Factorial of a number n (written n!) is the product of all positive integers from 1 to n. The recursive definition says: n! = n × (n−1)!, with base case 0! = 1.",
          howItWorks: [
            "The function receives n and first checks if n == 0 (the base case).",
            "If n == 0, it immediately returns 1 — this stops the infinite recursion.",
            "Otherwise, it calls itself with n−1 and multiplies the result by n.",
            "Each call waits on the stack until the deeper call returns, then completes its own multiplication.",
            "The call stack unwinds from the base case back up to the original call.",
          ],
          example: {
            input: "factorial(4)",
            trace: [
              "factorial(4) → 4 × factorial(3)",
              "factorial(3) → 3 × factorial(2)",
              "factorial(2) → 2 × factorial(1)",
              "factorial(1) → 1 × factorial(0)",
              "factorial(0) → 1  ← base case",
              "factorial(1) → 1 × 1 = 1",
              "factorial(2) → 2 × 1 = 2",
              "factorial(3) → 3 × 2 = 6",
              "factorial(4) → 4 × 6 = 24",
            ],
            output: "24",
          },
          complexity: { time: "O(n)", space: "O(n) — one stack frame per recursive call" },
          keyInsight: "Every recursive function must have a base case (stopping condition) and make progress toward it. Without a base case, recursion would run forever — a stack overflow!",
        },
      },
      {
        key: "fibonacci",
        label: "Fibonacci",
        desc: "Each number is the sum of the two before it.",
        difficulty: "Easy",
        code: `def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)

result = fib(5)
print(result)`,
        theory: {
          title: "Fibonacci — Double Recursion",
          concept: "The Fibonacci sequence is 0, 1, 1, 2, 3, 5, 8, 13 ... where each number is the sum of the two preceding ones. Defined recursively: fib(n) = fib(n−1) + fib(n−2), with base cases fib(0)=0, fib(1)=1.",
          howItWorks: [
            "Check the base case: if n ≤ 1, return n directly.",
            "Otherwise, make TWO recursive calls: fib(n−1) and fib(n−2).",
            "Wait for fib(n−1) to fully resolve (it branches further), then fib(n−2).",
            "Add the two results and return. The call tree grows exponentially!",
            "This naive version recomputes the same sub-problems many times (e.g. fib(3) is computed multiple times for fib(5)).",
          ],
          example: {
            input: "fib(5)",
            trace: [
              "fib(5) = fib(4) + fib(3)",
              "fib(4) = fib(3) + fib(2)",
              "fib(3) = fib(2) + fib(1) = 1+1 = 2",
              "fib(2) = fib(1) + fib(0) = 1+0 = 1",
              "fib(4) = 2 + 1 = 3",
              "fib(3) = 2 (computed again!)",
              "fib(5) = 3 + 2 = 5",
            ],
            output: "5",
          },
          complexity: { time: "O(2ⁿ) — exponential (many redundant calls)", space: "O(n) — max stack depth" },
          keyInsight: "The double recursion creates a tree of calls. For fib(5) alone, fib(3) is calculated twice! This is why memoization (storing already-computed values) makes Fibonacci O(n) instead of O(2ⁿ).",
        },
      },
      {
        key: "sum_array",
        label: "Sum of Array",
        desc: "Recursively sum elements in a list.",
        difficulty: "Easy",
        code: `def sum_arr(arr):
    if len(arr) == 0:
        return 0
    return arr[0] + sum_arr(arr[1:])

result = sum_arr([1, 2, 3, 4, 5])
print(result)`,
        theory: {
          title: "Sum of Array — Recursive Decomposition",
          concept: "Recursive array sum works by breaking the problem: the sum of an array is its first element plus the sum of the rest. This continues until the array is empty (base case: empty array sums to 0).",
          howItWorks: [
            "Base case: if the array is empty (len == 0), return 0.",
            "Otherwise, take the first element arr[0] and recursively sum the rest arr[1:].",
            "arr[1:] creates a new smaller array (Python slicing), shrinking the problem each step.",
            "The results bubble back up: each call adds its arr[0] to the result from the recursive call.",
          ],
          example: {
            input: "sum_arr([1, 2, 3, 4, 5])",
            trace: [
              "sum_arr([1,2,3,4,5]) = 1 + sum_arr([2,3,4,5])",
              "sum_arr([2,3,4,5])   = 2 + sum_arr([3,4,5])",
              "sum_arr([3,4,5])     = 3 + sum_arr([4,5])",
              "sum_arr([4,5])       = 4 + sum_arr([5])",
              "sum_arr([5])         = 5 + sum_arr([]) = 5 + 0 = 5",
              "Unwinding: 4+5=9, 3+9=12, 2+12=14, 1+14=15",
            ],
            output: "15",
          },
          complexity: { time: "O(n)", space: "O(n) — n stack frames + n slice copies" },
          keyInsight: "Notice the pattern: each call processes exactly one element and delegates the rest. This is the recursive 'divide into head + tail' pattern, common in functional programming.",
        },
      },
      {
        key: "tower_of_hanoi",
        label: "Tower of Hanoi",
        desc: "Move n disks from A to C using B as helper.",
        difficulty: "Medium",
        code: `def hanoi(n, src, dst, aux):
    if n == 1:
        print(f"Move disk 1: {src} -> {dst}")
        return
    hanoi(n-1, src, aux, dst)
    print(f"Move disk {n}: {src} -> {dst}")
    hanoi(n-1, aux, dst, src)

hanoi(3, 'A', 'C', 'B')`,
        theory: {
          title: "Tower of Hanoi — Classic Recursion Puzzle",
          concept: "Move n disks from peg A to peg C using peg B as a helper. Rule: a larger disk can never be placed on top of a smaller disk. The recursive insight is elegant: to move n disks, first move the top n−1 disks out of the way, move the big disk, then move the n−1 disks back.",
          howItWorks: [
            "Base case: if n == 1, simply move the single disk from src to dst.",
            "Recursive step 1: Move top n−1 disks from src to aux (using dst as helper).",
            "Then move the largest (bottom) disk directly from src to dst.",
            "Recursive step 2: Move the n−1 disks from aux to dst (using src as helper).",
            "This takes exactly 2ⁿ − 1 moves for n disks.",
          ],
          example: {
            input: "hanoi(3, 'A', 'C', 'B')",
            trace: [
              "Move disk 1: A → C",
              "Move disk 2: A → B",
              "Move disk 1: C → B",
              "Move disk 3: A → C",
              "Move disk 1: B → A",
              "Move disk 2: B → C",
              "Move disk 1: A → C",
            ],
            output: "7 moves total (2³ − 1 = 7)",
          },
          complexity: { time: "O(2ⁿ) — doubles for each extra disk", space: "O(n) — recursion depth" },
          keyInsight: "The number of moves doubles every time you add one more disk. With 64 disks (the original legend), it would take 2⁶⁴ − 1 moves — over 18 quintillion! Even at one move per second, it would take ~585 billion years.",
        },
      },
    ],
  },
  {
    id: "sorting",
    label: "Sorting Algorithms",
    level: "Beginner → Intermediate",
    programs: [
      {
        key: "bubble_sort",
        label: "Bubble Sort",
        desc: "Repeatedly swap adjacent elements if they are out of order.",
        difficulty: "Easy",
        code: `arr = [64, 34, 25, 12, 22, 11, 90]

for i in range(len(arr)):  
    for j in range(len(arr) - i - 1):
        if arr[j] > arr[j+1]:
            arr[j], arr[j+1] = arr[j+1], arr[j]

print(arr)`,
        theory: {
          title: "Bubble Sort — Swap Neighbors",
          concept: "Bubble Sort repeatedly walks through the array comparing adjacent pairs and swapping them if they're in the wrong order. After each full pass, the largest unsorted element 'bubbles up' to its correct position at the end.",
          howItWorks: [
            "Outer loop runs n times (one pass per element).",
            "Inner loop compares arr[j] and arr[j+1] for every adjacent pair in the unsorted region.",
            "If arr[j] > arr[j+1], swap them so the larger one moves right.",
            "After pass 1, the largest element is at the last position.",
            "After pass 2, the second-largest is at second-to-last, and so on.",
            "The inner loop range shrinks each pass since the tail is already sorted.",
          ],
          example: {
            input: "[64, 34, 25, 12]",
            trace: [
              "Pass 1: [34,25,12,64] — 64 bubbled to end",
              "Pass 2: [25,12,34,64] — 34 in place",
              "Pass 3: [12,25,34,64] — fully sorted",
            ],
            output: "[12, 25, 34, 64]",
          },
          complexity: { time: "O(n²) — worst and average case", space: "O(1) — in-place" },
          keyInsight: "Bubble Sort is simple to understand but inefficient for large arrays. It's mainly used for teaching. One optimization: if a full pass makes no swaps, the array is already sorted — you can stop early.",
        },
      },
      {
        key: "selection_sort",
        label: "Selection Sort",
        desc: "Find the minimum and place it at the correct position.",
        difficulty: "Easy",
        code: `arr = [64, 25, 12, 22, 11]

for i in range(len(arr)):
    min_idx = i
    for j in range(i+1, len(arr)):
        if arr[j] < arr[min_idx]:
            min_idx = j
    arr[i], arr[min_idx] = arr[min_idx], arr[i]

print(arr)`,
        theory: {
          title: "Selection Sort — Find Minimum, Place It",
          concept: "Selection Sort divides the array into a sorted left portion and unsorted right portion. In each pass, it finds the minimum element in the unsorted portion and swaps it to the front of the unsorted region.",
          howItWorks: [
            "Start with the entire array as unsorted.",
            "Outer loop: position i is where the next minimum will be placed.",
            "Assume arr[i] is the minimum; scan arr[i+1..end] to verify.",
            "If a smaller element is found, update min_idx.",
            "After the inner scan, swap arr[i] with arr[min_idx].",
            "Now arr[0..i] is sorted. Advance i.",
          ],
          example: {
            input: "[64, 25, 12, 22, 11]",
            trace: [
              "Pass 1: min=11 at idx 4 → swap → [11, 25, 12, 22, 64]",
              "Pass 2: min=12 at idx 2 → swap → [11, 12, 25, 22, 64]",
              "Pass 3: min=22 at idx 3 → swap → [11, 12, 22, 25, 64]",
              "Pass 4: min=25 already in place → [11, 12, 22, 25, 64]",
            ],
            output: "[11, 12, 22, 25, 64]",
          },
          complexity: { time: "O(n²) — always", space: "O(1) — in-place, at most n swaps" },
          keyInsight: "Unlike Bubble Sort, Selection Sort makes at most n swaps (one per pass). This makes it preferable when writes to memory are expensive. However, it's not stable — equal elements may change relative order.",
        },
      },
      {
        key: "insertion_sort",
        label: "Insertion Sort",
        desc: "Build sorted array one element at a time.",
        difficulty: "Easy",
        code: `arr = [12, 11, 13, 5, 6]

for i in range(1, len(arr)):
    key = arr[i]
    j = i - 1
    while j >= 0 and arr[j] > key:
        arr[j + 1] = arr[j]
        j -= 1
    arr[j + 1] = key

print(arr)`,
        theory: {
          title: "Insertion Sort — Build Sorted Array Left to Right",
          concept: "Insertion Sort works like sorting playing cards in your hand: pick one card at a time and insert it into its correct position among already-sorted cards. It builds a sorted region on the left, growing it by one element per pass.",
          howItWorks: [
            "Start: arr[0] is trivially sorted.",
            "Pick arr[i] as the 'key' element to insert into the sorted portion arr[0..i-1].",
            "Shift elements in the sorted portion one position right while they are greater than key.",
            "Insert key into the gap left behind.",
            "The sorted portion grows by 1 each iteration until the whole array is sorted.",
          ],
          example: {
            input: "[12, 11, 13, 5, 6]",
            trace: [
              "i=1: key=11 → shift 12 right → [11, 12, 13, 5, 6]",
              "i=2: key=13 → 13>12, no shift → [11, 12, 13, 5, 6]",
              "i=3: key=5 → shift 13,12,11 right → [5, 11, 12, 13, 6]",
              "i=4: key=6 → shift 13,12,11 right → [5, 6, 11, 12, 13]",
            ],
            output: "[5, 6, 11, 12, 13]",
          },
          complexity: { time: "O(n²) worst, O(n) best (already sorted)", space: "O(1) — in-place" },
          keyInsight: "Insertion Sort is very efficient for small or nearly-sorted arrays — it's O(n) when data is almost sorted. Many real-world sorting implementations use Insertion Sort for small subarrays (e.g. Python's Timsort uses it for runs < 64 elements).",
        },
      },
      {
        key: "merge_sort",
        label: "Merge Sort",
        desc: "Divide and conquer: split, sort, merge.",
        difficulty: "Medium",
        theory: {
          title: "Merge Sort — Divide and Conquer",
          concept: "Merge Sort recursively splits the array in half until each piece has one element (which is trivially sorted), then merges pairs of sorted pieces together. The merge step is the key: it efficiently combines two sorted arrays into one.",
          howItWorks: [
            "Divide: find the midpoint and split the array into left and right halves.",
            "Conquer: recursively sort each half (base case: array of length ≤ 1).",
            "Combine: merge the two sorted halves by repeatedly picking the smaller front element.",
            "The merge step uses two pointers (i, j) — one for each half — advancing whichever is smaller.",
            "Append any remaining elements from either half after the other is exhausted.",
          ],
          example: {
            input: "[38, 27, 43, 3]",
            trace: [
              "Split: [38,27] | [43,3]",
              "Split: [38]|[27] and [43]|[3]",
              "Merge: [27,38] and [3,43]",
              "Merge: compare 27 vs 3 → [3], 27 vs 43 → [3,27], 38 vs 43 → [3,27,38], append 43",
              "Result: [3, 27, 38, 43]",
            ],
            output: "[3, 27, 38, 43]",
          },
          complexity: { time: "O(n log n) — always", space: "O(n) — auxiliary arrays for merging" },
          keyInsight: "Merge Sort is one of the most efficient general-purpose sorting algorithms. It guarantees O(n log n) in ALL cases (unlike Quick Sort which can degrade). It's the basis of Python's sorted() and Java's Arrays.sort() for objects.",
        },
        code: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(l, r):
    result = []
    i = j = 0
    while i < len(l) and j < len(r):
        if l[i] < r[j]:
            result.append(l[i]); i += 1
        else:
            result.append(r[j]); j += 1
    result += l[i:]; result += r[j:]
    return result

print(merge_sort([38, 27, 43, 3, 9, 82, 10]))`,
      },
      {
        key: "quick_sort",
        label: "Quick Sort",
        desc: "Pick pivot, partition around it, recurse.",
        difficulty: "Hard",
        theory: {
          title: "Quick Sort — Partition Around a Pivot",
          concept: "Quick Sort picks a 'pivot' element, rearranges the array so all elements less than or equal to the pivot are on its left and all greater elements are on its right, then recursively sorts each side. The pivot ends up in its final sorted position.",
          howItWorks: [
            "Choose pivot: the last element arr[high] is selected as pivot.",
            "Partition: use a pointer i (initialized to low−1) and scan j from low to high−1.",
            "Whenever arr[j] ≤ pivot, increment i and swap arr[i] ↔ arr[j] (moving small elements left).",
            "After the loop, place the pivot at position i+1 by swapping it there.",
            "Recursively sort arr[low..pi−1] and arr[pi+1..high].",
          ],
          example: {
            input: "[10, 7, 8, 9, 1, 5], pivot = 5",
            trace: [
              "Scan: 10>5 skip, 7>5 skip, 8>5 skip, 9>5 skip, 1≤5 → i=0, swap arr[0]↔arr[4] → [1,7,8,9,10,5]",
              "Place pivot: swap arr[1] ↔ arr[5] → [1,5,8,9,10,7]",
              "Pivot 5 is now at index 1 (its final position)",
              "Recurse left [1] and right [8,9,10,7]",
            ],
            output: "[1, 5, 7, 8, 9, 10]",
          },
          complexity: { time: "O(n log n) average, O(n²) worst (sorted input)", space: "O(log n) — recursion stack" },
          keyInsight: "Quick Sort is typically the fastest sorting algorithm in practice due to excellent cache behavior. The worst case (O(n²)) happens when the pivot is always the min or max — randomizing the pivot selection avoids this.",
        },
        code: `def quick_sort(arr, low, high):
    if low < high:
        pi = partition(arr, low, high)
        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)

def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i+1], arr[high] = arr[high], arr[i+1]
    return i + 1

arr = [10, 7, 8, 9, 1, 5]
quick_sort(arr, 0, len(arr)-1)
print(arr)`,
      },
    ],
  },
  {
    id: "searching",
    label: "Searching Algorithms",
    level: "Beginner → Intermediate",
    programs: [
      {
        key: "linear_search",
        label: "Linear Search",
        desc: "Check each element one by one.",
        difficulty: "Easy",
        theory: {
          title: "Linear Search — Sequential Scan",
          concept: "Linear Search is the simplest search algorithm: examine each element from left to right until the target is found or the array is exhausted. It works on unsorted arrays.",
          howItWorks: [
            "Start at index 0 and compare each element with the target.",
            "If arr[i] == target, return index i immediately.",
            "If the loop finishes without finding target, return -1.",
            "No preprocessing or sorting needed — works on any array.",
          ],
          example: {
            input: "arr = [4, 2, 7, 1, 9, 3], target = 7",
            trace: [
              "i=0: arr[0]=4 ≠ 7",
              "i=1: arr[1]=2 ≠ 7",
              "i=2: arr[2]=7 = 7 ✓ Found!",
            ],
            output: "Found at index: 2",
          },
          complexity: { time: "O(n) — may need to check every element", space: "O(1)" },
          keyInsight: "Linear search is optimal for unsorted data — you have no choice but to check each element. For sorted data, Binary Search is far superior (O(log n) vs O(n)).",
        },
        code: `def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1

arr = [4, 2, 7, 1, 9, 3]
result = linear_search(arr, 7)
print(f"Found at index: {result}")`,
      },
      {
        key: "binary_search",
        label: "Binary Search",
        desc: "Search sorted array by halving the range.",
        difficulty: "Easy",
        theory: {
          title: "Binary Search — Halve the Search Space",
          concept: "Binary Search exploits a sorted array to eliminate half the remaining candidates at each step. By comparing the target to the middle element, we know which half to continue searching.",
          howItWorks: [
            "Require: array must be sorted.",
            "Set low = 0, high = n−1. Repeat while low ≤ high.",
            "Compute mid = (low + high) / 2. Compare arr[mid] with target.",
            "If arr[mid] == target → found! Return mid.",
            "If arr[mid] < target → target must be in right half. Set low = mid + 1.",
            "If arr[mid] > target → target must be in left half. Set high = mid − 1.",
            "If loop ends without match → target not in array, return -1.",
          ],
          example: {
            input: "arr = [1, 3, 5, 7, 9, 11, 13], target = 7",
            trace: [
              "low=0, high=6, mid=3: arr[3]=7 == target ✓",
            ],
            output: "Found at index: 3",
          },
          complexity: { time: "O(log n) — halves search space each step", space: "O(1)" },
          keyInsight: "Binary search is incredibly efficient. For 1 billion elements, it takes at most 30 comparisons (log₂(10⁹) ≈ 30). The array MUST be sorted — that's the trade-off for this speed.",
        },
        code: `def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1

arr = [1, 3, 5, 7, 9, 11, 13]
result = binary_search(arr, 7)
print(f"Found at index: {result}")`,
      },
      {
        key: "jump_search",
        label: "Jump Search",
        desc: "Jump by block size then linear search.",
        difficulty: "Medium",
        theory: {
          title: "Jump Search — Block Jumps + Linear Scan",
          concept: "Jump Search is a middle ground between Linear and Binary Search. It jumps ahead by fixed block size √n until it overshoots the target, then does a linear search in the previous block.",
          howItWorks: [
            "Requires a sorted array.",
            "Compute block size = √n (square root of array length).",
            "Jump: advance in steps of block size while arr[min(step,n)−1] < target.",
            "Once you overshoot (arr at jump position ≥ target), step back one block.",
            "Linear search within that block to find the exact target.",
          ],
          example: {
            input: "arr = [0,1,1,2,3,5,8,13,21,34], target = 13, step = √10 ≈ 3",
            trace: [
              "Jump to idx 2: arr[2]=1 < 13 → jump",
              "Jump to idx 5: arr[5]=5 < 13 → jump",
              "Jump to idx 8: arr[8]=21 ≥ 13 → stop",
              "Linear search [5..8]: arr[7]=13 ✓",
            ],
            output: "7",
          },
          complexity: { time: "O(√n)", space: "O(1)" },
          keyInsight: "Jump Search's O(√n) beats Linear Search but is slower than Binary Search O(log n). Its advantage is that it makes fewer back-comparisons than Binary Search, which matters for systems where backward traversal is costly (like tape storage).",
        },
        code: `import math

def jump_search(arr, target):
    n = len(arr)
    step = int(math.sqrt(n))
    prev = 0
    while arr[min(step, n)-1] < target:
        prev = step
        step += int(math.sqrt(n))
        if prev >= n:
            return -1
    while arr[prev] < target:
        prev += 1
        if prev == min(step, n):
            return -1
    if arr[prev] == target:
        return prev
    return -1

arr = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
print(jump_search(arr, 13))`,
      },
    ],
  },
  {
    id: "data_structures",
    label: "Data Structures",
    level: "Intermediate",
    programs: [
      {
        key: "linked_list",
        label: "Linked List",
        desc: "Nodes connected by pointers.",
        difficulty: "Medium",
        theory: {
          title: "Linked List — Chained Nodes",
          concept: "A Linked List is a data structure where elements (nodes) are stored non-contiguously in memory, each holding a value and a pointer (next) to the next node. Unlike arrays, there's no random access — you must traverse from the head.",
          howItWorks: [
            "Each Node has two fields: val (data) and next (pointer to next node).",
            "The last node's next is None, marking the end.",
            "To traverse: start at head, follow .next pointers until None.",
            "Insertion/deletion is O(1) if you already have a reference to the correct node.",
            "Search is O(n) since you must start from the head.",
          ],
          example: {
            input: "head → Node(1) → Node(2) → Node(3) → None",
            trace: [
              "cur = head (val=1) → print 1 → cur = cur.next",
              "cur = Node(2) (val=2) → print 2 → cur = cur.next",
              "cur = Node(3) (val=3) → print 3 → cur = cur.next",
              "cur = None → loop ends",
            ],
            output: "1  2  3",
          },
          complexity: { time: "O(n) traversal, O(1) insert/delete at known position", space: "O(n)" },
          keyInsight: "Linked Lists shine when you frequently insert/delete from the middle of a sequence. Arrays require shifting elements (O(n)), but Linked Lists just re-link pointers (O(1)). Trade-off: no index access like arr[5].",
        },
        code: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

head = Node(1)
head.next = Node(2)
head.next.next = Node(3)

cur = head
while cur:
    print(cur.val)
    cur = cur.next`,
      },
      {
        key: "stack_impl",
        label: "Stack (LIFO)",
        desc: "Last In First Out.",
        difficulty: "Easy",
        theory: {
          title: "Stack — Last In, First Out (LIFO)",
          concept: "A Stack is like a pile of plates: you can only add (push) or remove (pop) from the top. The last item added is the first one removed. Python's list supports this natively.",
          howItWorks: [
            "Push: stack.append(x) adds element x to the top.",
            "Pop: stack.pop() removes and returns the top element.",
            "Peek: stack[-1] looks at the top without removing.",
            "All three operations are O(1) — very efficient.",
          ],
          example: {
            input: "Push 10, 20, 30",
            trace: [
              "append(10) → stack = [10]",
              "append(20) → stack = [10, 20]",
              "append(30) → stack = [10, 20, 30]",
              "Top = 30",
              "pop() → removes 30 → stack = [10, 20]",
              "pop() → removes 20 → stack = [10]",
            ],
            output: "Top: 30 → After pops: [10]",
          },
          complexity: { time: "O(1) push/pop/peek", space: "O(n)" },
          keyInsight: "Stacks are used everywhere: function call stacks, undo/redo systems, browser back button, expression parsing (balancing parentheses), and DFS graph traversal all rely on the LIFO principle.",
        },
        code: `stack = []

stack.append(10)
stack.append(20)
stack.append(30)

print("Top:", stack[-1])
stack.pop()
print("After pop:", stack)
stack.pop()
print("After pop:", stack)`,
      },
      {
        key: "queue_impl",
        label: "Queue (FIFO)",
        desc: "First In First Out.",
        difficulty: "Easy",
        theory: {
          title: "Queue — First In, First Out (FIFO)",
          concept: "A Queue is like a line at a store: the first person to join is the first to be served. Python's collections.deque provides an efficient double-ended queue implementation.",
          howItWorks: [
            "Enqueue: deque.append(x) adds to the back — O(1).",
            "Dequeue: deque.popleft() removes from the front — O(1).",
            "Regular list.pop(0) is O(n) for queues; deque.popleft() is O(1).",
            "Front element: queue[0] peeks without removing.",
          ],
          example: {
            input: "Enqueue A, B, C",
            trace: [
              "append('A') → queue = ['A']",
              "append('B') → queue = ['A', 'B']",
              "append('C') → queue = ['A', 'B', 'C']",
              "Front = 'A'",
              "popleft() → removes A → queue = ['B', 'C']",
              "popleft() → removes B → queue = ['C']",
            ],
            output: "Front: A → After dequeues: ['C']",
          },
          complexity: { time: "O(1) enqueue/dequeue with deque", space: "O(n)" },
          keyInsight: "Queues are used in BFS (Breadth-First Search), task scheduling, print queues, and message passing systems. The key insight: deque is O(1) for both ends, while a plain list is O(n) to remove from the front.",
        },
        code: `from collections import deque

queue = deque()
queue.append("A")
queue.append("B")
queue.append("C")

print("Front:", queue[0])
queue.popleft()
print("After dequeue:", list(queue))
queue.popleft()
print("After dequeue:", list(queue))`,
      },
      {
        key: "bst_insert",
        label: "Binary Search Tree",
        desc: "Insert nodes and traverse in-order.",
        difficulty: "Hard",
        theory: {
          title: "Binary Search Tree — Ordered Hierarchy",
          concept: "A BST is a binary tree where for every node: all values in its left subtree are smaller, and all values in its right subtree are larger. This ordering enables efficient search, insertion, and deletion.",
          howItWorks: [
            "Insert: starting at root, go left if new value < current, right if ≥. Insert at the first null position found.",
            "In-order traversal visits left subtree, then root, then right subtree — always yields sorted order.",
            "Search: similar to binary search — O(log n) for balanced trees.",
            "A BST with values [5,3,7,1,4,6,8] forms a perfectly balanced tree.",
          ],
          example: {
            input: "Insert [5, 3, 7, 1, 4, 6, 8]",
            trace: [
              "Insert 5 → root",
              "Insert 3 → 3<5, go left of root",
              "Insert 7 → 7>5, go right of root",
              "Insert 1 → 1<5→left, 1<3→left of 3",
              "Insert 4 → 4<5→left, 4>3→right of 3",
              "In-order: 1 3 4 5 6 7 8 (sorted!)",
            ],
            output: "1 3 4 5 6 7 8",
          },
          complexity: { time: "O(log n) avg, O(n) worst (degenerate/skewed tree)", space: "O(n)" },
          keyInsight: "In-order traversal of any BST always produces elements in sorted order. This is the key property! The BST becomes a linked list (O(n) operations) if you insert already-sorted data — self-balancing variants like AVL or Red-Black trees fix this.",
        },
        code: `class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

def insert(root, val):
    if root is None:
        return Node(val)
    if val < root.val:
        root.left = insert(root.left, val)
    else:
        root.right = insert(root.right, val)
    return root

def inorder(root):
    if root:
        inorder(root.left)
        print(root.val, end=" ")
        inorder(root.right)

root = None
for v in [5, 3, 7, 1, 4, 6, 8]:
    root = insert(root, v)
inorder(root)`,
      },
    ],
  },
  {
    id: "graph",
    label: "Graph Algorithms",
    level: "Intermediate → Advanced",
    programs: [
      {
        key: "bfs",
        label: "BFS (Breadth-First Search)",
        desc: "Explore nodes level by level using a queue.",
        difficulty: "Medium",
        theory: {
          title: "BFS — Level-by-Level Graph Traversal",
          concept: "Breadth-First Search explores a graph layer by layer — all neighbors of the starting node first, then their neighbors, and so on. It uses a queue (FIFO) to ensure nodes are visited in order of their distance from the start.",
          howItWorks: [
            "Start: add the source node to the queue and mark it visited.",
            "Dequeue the front node; process it and add all unvisited neighbors to the queue.",
            "Repeat until the queue is empty.",
            "BFS guarantees that when a node is first visited, it is reached via the shortest path (fewest hops).",
          ],
          example: {
            input: "Graph: 0-[1,2], 1-[3,4], 2-[5]. Start=0",
            trace: [
              "Queue: [0] → visit 0, enqueue 1,2",
              "Queue: [1,2] → visit 1, enqueue 3,4",
              "Queue: [2,3,4] → visit 2, enqueue 5",
              "Queue: [3,4,5] → visit 3,4,5",
            ],
            output: "Order: [0, 1, 2, 3, 4, 5]",
          },
          complexity: { time: "O(V + E) — vertices + edges", space: "O(V) — queue storage" },
          keyInsight: "BFS finds the SHORTEST PATH in an unweighted graph. This is why it's used in GPS navigation (hop count), social network degrees of separation, and finding the nearest exit in a maze.",
        },
        code: `from collections import deque

graph = {
    0: [1, 2],
    1: [0, 3, 4],
    2: [0, 5],
    3: [1],
    4: [1],
    5: [2]
}

def bfs(start):
    visited = set([start])
    queue = deque([start])
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for nb in graph[node]:
            if nb not in visited:
                visited.add(nb)
                queue.append(nb)
    return order

print(bfs(0))`,
      },
      {
        key: "dfs",
        label: "DFS (Depth-First Search)",
        desc: "Explore as deep as possible before backtracking.",
        difficulty: "Medium",
        theory: {
          title: "DFS — Go Deep, Then Backtrack",
          concept: "Depth-First Search dives as deep as possible along one path before backtracking to explore other branches. It uses recursion (or an explicit stack) rather than a queue, giving it a very different traversal pattern from BFS.",
          howItWorks: [
            "Mark the current node as visited, then recursively visit each unvisited neighbor.",
            "When a node has no unvisited neighbors, return (backtrack) to the previous node.",
            "The implicit call stack handles the 'remember where I came from' part.",
            "DFS may not find the shortest path, but it excels at exploring full paths.",
          ],
          example: {
            input: "Graph: 0-[1,2], 1-[3,4], 2-[5]. Start=0",
            trace: [
              "Visit 0 → recurse into 1",
              "Visit 1 → recurse into 3",
              "Visit 3 → no unvisited → backtrack to 1",
              "Visit 4 → backtrack to 1 → backtrack to 0",
              "Visit 2 → recurse into 5",
            ],
            output: "Order: 0 1 3 4 2 5",
          },
          complexity: { time: "O(V + E)", space: "O(V) — recursion depth" },
          keyInsight: "DFS is used for: cycle detection, topological sort, finding connected components, solving mazes, and generating all permutations/combinations. BFS is better for shortest paths; DFS is better for exhaustive search.",
        },
        code: `graph = {
    0: [1, 2],
    1: [0, 3, 4],
    2: [0, 5],
    3: [1],
    4: [1],
    5: [2]
}

def dfs(node, visited=None):
    if visited is None:
        visited = set()
    visited.add(node)
    print(node, end=" ")
    for nb in graph[node]:
        if nb not in visited:
            dfs(nb, visited)

dfs(0)`,
      },
    ],
  },
  {
    id: "dynamic_programming",
    label: "Dynamic Programming",
    level: "Advanced",
    programs: [
      {
        key: "fib_dp",
        label: "Fibonacci (DP)",
        desc: "Memoization avoids redundant calculations.",
        difficulty: "Medium",
        theory: {
          title: "Fibonacci with Memoization — Dynamic Programming",
          concept: "This version solves the exponential inefficiency of naive recursion by storing (memoizing) already-computed results. When the same sub-problem is encountered again, the cached answer is returned instantly instead of recomputing.",
          howItWorks: [
            "Use a dictionary (memo) to store fib(n) results as they're computed.",
            "Before computing, check if n is already in memo — if so, return memo[n] immediately.",
            "Otherwise, compute recursively, store the result in memo[n], then return it.",
            "This transforms the exponential call tree into a linear sequence of unique computations.",
          ],
          example: {
            input: "fib_memo(6)",
            trace: [
              "fib(6): not in memo → compute fib(5)+fib(4)",
              "fib(5): not in memo → compute fib(4)+fib(3)",
              "fib(4): not in memo → ... → memo[4]=3",
              "fib(5): uses memo[4]=3 → memo[5]=5",
              "fib(6): uses memo[5]=5, memo[4]=3 → 8",
            ],
            output: "fib(0)=0 fib(1)=1 fib(2)=1 fib(3)=2 fib(4)=3 fib(5)=5 fib(6)=8 fib(7)=13",
          },
          complexity: { time: "O(n) — each sub-problem solved once", space: "O(n) — memo dictionary" },
          keyInsight: "Memoization is a top-down DP approach. Without it, fib(40) makes over 300 million calls. With memoization, it makes exactly 40 unique calls. This is the core idea of Dynamic Programming: avoid recomputing overlapping sub-problems.",
        },
        code: `def fib_memo(n, memo={}):
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fib_memo(n-1, memo) + fib_memo(n-2, memo)
    return memo[n]

for i in range(8):
    print(f"fib({i}) = {fib_memo(i)}")`,
      },
      {
        key: "knapsack",
        label: "0/1 Knapsack",
        desc: "Maximize value given weight capacity.",
        difficulty: "Hard",
        theory: {
          title: "0/1 Knapsack — DP Table Building",
          concept: "Given items with weights and values, and a knapsack with limited capacity, find the maximum value you can carry. '0/1' means each item is either taken (1) or left (0) — no fractions. Dynamic programming builds a 2D table of optimal solutions for all sub-problems.",
          howItWorks: [
            "Create dp[i][w] = max value using first i items with capacity w.",
            "For each item i and each capacity w: either skip item i (dp[i-1][w]) or take it if it fits (values[i-1] + dp[i-1][w-weights[i-1]]).",
            "Take the maximum of those two choices.",
            "dp[n][capacity] gives the final answer.",
          ],
          example: {
            input: "weights=[2,3,4,5], values=[3,4,5,6], capacity=8",
            trace: [
              "Item 1 (w=2, v=3): fits in capacity ≥ 2",
              "Item 2 (w=3, v=4): try adding to subsets",
              "Best combo: items 1+2 → weight=5, value=7",
              "Or item 1+3: weight=6, value=8",
              "dp[4][8] = 10 (items 1+2+... best combination)",
            ],
            output: "Max value: 10",
          },
          complexity: { time: "O(n × capacity)", space: "O(n × capacity) for the dp table" },
          keyInsight: "The DP table represents ALL possible (items, capacity) combinations. Each cell depends only on the row above it, which is why space can be optimized to O(capacity) using a single row. This is a classic example of bottom-up DP.",
        },
        code: `def knapsack(weights, values, capacity):
    n = len(weights)
    dp = [[0]*(capacity+1) for _ in range(n+1)]
    for i in range(1, n+1):
        for w in range(capacity+1):
            dp[i][w] = dp[i-1][w]
            if weights[i-1] <= w:
                dp[i][w] = max(dp[i][w],
                    values[i-1] + dp[i-1][w-weights[i-1]])
    return dp[n][capacity]

weights = [2, 3, 4, 5]
values  = [3, 4, 5, 6]
capacity = 8
print("Max value:", knapsack(weights, values, capacity))`,
      },
      {
        key: "lcs",
        label: "Longest Common Subsequence",
        desc: "Find LCS of two strings.",
        difficulty: "Hard",
        theory: {
          title: "Longest Common Subsequence — String DP",
          concept: "LCS finds the longest sequence of characters that appears in the same relative order in both strings (but not necessarily contiguous). For example, LCS of 'ABCBDAB' and 'BDCAB' is 'BCAB' or 'BDAB' (length 4).",
          howItWorks: [
            "Build dp[i][j] = length of LCS of s1[0..i-1] and s2[0..j-1].",
            "If s1[i-1] == s2[j-1]: dp[i][j] = dp[i-1][j-1] + 1 (characters match — extend LCS).",
            "If they differ: dp[i][j] = max(dp[i-1][j], dp[i][j-1]) (skip one character from either string).",
            "dp[m][n] holds the final LCS length.",
          ],
          example: {
            input: "s1='ABCB', s2='BCB'",
            trace: [
              "A vs B: no match → dp[1][1]=0",
              "A vs BC: no match → 0",
              "B vs B: match! dp[2][1] = dp[1][0]+1 = 1",
              "B vs BC: B matches B → 1, B matches C → 0, max=1",
              "C vs BCB: C matches C → 2",
              "B vs BCB: B matches B(last) → 3",
            ],
            output: "LCS length = 4 (for ABCBDAB vs BDCAB)",
          },
          complexity: { time: "O(m × n) — m, n are string lengths", space: "O(m × n) for dp table" },
          keyInsight: "LCS is widely used in diff tools (git diff), DNA sequence alignment, and spell-checkers. The dp table elegantly encodes all sub-problem solutions, and you can backtrack through it to reconstruct the actual LCS string.",
        },
        code: `def lcs(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0]*(n+1) for _ in range(m+1)]
    for i in range(1, m+1):
        for j in range(1, n+1):
            if s1[i-1] == s2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    return dp[m][n]

print(lcs("ABCBDAB", "BDCAB"))`,
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS — parse user-edited code values
// ─────────────────────────────────────────────────────────────────────────────
function parseArray(code) {
  const match = code.match(/\[([^\]]+)\]/);
  if (!match) return null;
  const nums = match[1].split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  return nums.length > 0 ? nums : null;
}
function parseNamedInt(code, name) {
  const re = new RegExp(`${name}\\s*=\\s*(-?\\d+)`);
  const m = code.match(re);
  return m ? parseInt(m[1]) : null;
}
function parseAllArrays(code) {
  const results = [];
  const re = /\[([^\]]+)\]/g;
  let m;
  while ((m = re.exec(code)) !== null) {
    const nums = m[1].split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (nums.length > 1) results.push(nums);
  }
  return results;
}
function parseLinkedListNodes(code) {
  return [...code.matchAll(/Node\((\d+)\)/g)].map(m => parseInt(m[1]));
}
function parseStackValues(code) {
  return [...code.matchAll(/\.append\((\d+)\)/g)].map(m => parseInt(m[1]));
}
function parseQueueValues(code) {
  return [...code.matchAll(/\.append\(["']?([^"')]+)["']?\)/g)].map(m => m[1].trim());
}
function parseBSTValues(code) {
  const m = code.match(/for\s+\w+\s+in\s+\[([^\]]+)\]/);
  if (!m) return null;
  const nums = m[1].split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  return nums.length > 0 ? nums : null;
}
function parseFactorialN(code) {
  const m = code.match(/factorial\((\d+)\)/);
  return m ? parseInt(m[1]) : 4;
}
function parseFibN(code) {
  const m = code.match(/fib\((\d+)\)/);
  return m ? parseInt(m[1]) : 5;
}
function parseSumArray(code) { return parseArray(code) || [1, 2, 3, 4, 5]; }
function parseHanoiN(code) {
  const m = code.match(/hanoi\((\d+)/);
  return m ? parseInt(m[1]) : 3;
}
function parseFibRange(code) {
  const m = code.match(/range\((\d+)\)/);
  return m ? parseInt(m[1]) : 8;
}
function parseKnapsack(code) {
  const arrays = parseAllArrays(code);
  const capMatch = code.match(/capacity\s*=\s*(\d+)/);
  return { weights: arrays[0] || [2,3,4,5], values: arrays[1] || [3,4,5,6], capacity: capMatch ? parseInt(capMatch[1]) : 8 };
}
function parseLCS(code) {
  const m = code.match(/lcs\(["']([^"']+)["'],\s*["']([^"']+)["']\)/);
  return m ? { s1: m[1], s2: m[2] } : { s1: "ABCBDAB", s2: "BDCAB" };
}
function parseSearch(code) {
  const arr = parseArray(code) || [1,3,5,7,9,11,13];
  const callMatch = code.match(/\w+_search\(\w+,\s*(\d+)\)/);
  const target = callMatch ? parseInt(callMatch[1]) : 7;
  return { arr, target };
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP BUILDER — each step has:
//   line       : 1-based line number to highlight (the line being EXECUTED now)
//   note       : human-readable explanation of what is happening at this exact moment
//   stack      : call stack array (index 0 = top/active frame)
//   arr        : (sorting/search) current array state
//   ...        : other viz fields
// ─────────────────────────────────────────────────────────────────────────────

function simulateExecution(programKey, userCode) {
  const sortKeys   = ["bubble_sort","selection_sort","insertion_sort","merge_sort","quick_sort"];
  const searchKeys = ["linear_search","binary_search","jump_search"];
  if (sortKeys.includes(programKey))   return simSorting(programKey, userCode);
  if (searchKeys.includes(programKey)) return simSearch(programKey, userCode);
  return simStack(programKey, userCode);
}

// ════════════════════════════════════════════════════════════════
// SORTING SIMULATIONS — accurate line highlights + notes
// ════════════════════════════════════════════════════════════════
function simSorting(key, code) {
  let arr = parseArray(code) || [64,34,25,12,22,11,90];
  if (arr.length > 12) arr = arr.slice(0, 12);
  const steps = [];
  const a = [...arr];

  // Helper to make a sort step
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
    // FIX #4: track original array positions to show mergeLeft/mergeRight
    const origArr = [...a];
    function findRange(subArr) {
      // Find leftmost position of subArr in origArr (by value sequence)
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
      // FIX #2: attach partLow/partHigh/pivotIdx to every step in this partition
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
// STACK / RECURSIVE SIMULATIONS — pedagogically accurate
// ════════════════════════════════════════════════════════════════
function simStack(key, code) {

  // ── Helpers ──────────────────────────────────────────────────
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
      steps.push(S(1, cs, `📥 Enter fib(n=${val}). Stack depth = ${cs.length}. Current call stack shown on the right.`));
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
      steps.push(S(4, cs, `🔁 Return arr[0] + sum_arr(arr[1:]). arr[0] = ${a[0]}, rest = [${a.slice(1).join(",")}]. Now calling sum_arr([${a.slice(1).join(",")}]).`));
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
    // moves is a plain array of {disk, from, to} objects grown incrementally.
    // Every step gets a SNAPSHOT (hanoiMoves: [...moves]) so the diagram knows
    // exactly which moves have happened without any fragile regex parsing.
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
        // Push the move BEFORE taking the snapshot so the step shows it executed
        moves.push({ disk: 1, from: src, to: dst });
        const ret = [{ ...newFrame, vars: { ...newFrame.vars, move: `disk 1: ${src}→${dst}` }, returning: true }, ...callStack];
        steps.push({ ...S(3, ret, `🔄 Move disk 1 from '${src}' → '${dst}'. Move #${moves.length} of ${Math.pow(2,n)-1}.`), ...hanoiMeta() });
        return;
      }
      steps.push({ ...S(5, cs, `📞 Step 1: Move top ${disks-1} disk(s) from '${src}' to '${aux}' (using '${dst}' as helper). Calling hanoi(${disks-1}, '${src}', '${aux}', '${dst}').`), ...hanoiMeta() });
      hanoiSteps(disks - 1, src, aux, dst, cs);
      // Push the big disk move BEFORE snapshot
      moves.push({ disk: disks, from: src, to: dst });
      const cs2 = [newFrame, ...callStack];
      steps.push({ ...S(6, [{ ...newFrame, vars: { ...newFrame.vars, move: `disk ${disks}: ${src}→${dst}` } }, ...callStack], `🔄 Step 2: Move disk ${disks} from '${src}' → '${dst}'. Move #${moves.length}.`), ...hanoiMeta() });
      steps.push({ ...S(7, cs2, `📞 Step 3: Move ${disks-1} disk(s) from '${aux}' to '${dst}' (using '${src}' as helper). Calling hanoi(${disks-1}, '${aux}', '${dst}', '${src}').`), ...hanoiMeta() });
      hanoiSteps(disks - 1, aux, dst, src, cs2);
      const ret = [{ ...newFrame, returning: true }, ...callStack];
      steps.push({ ...S(7, ret, `✅ hanoi(${disks}) complete. Pop frame. All ${disks} disks moved.`), ...hanoiMeta() });
    }

    hanoiSteps(n, 'A', 'C', 'B', [{ fn: "<module>", vars: {}, depth: 0 }]);
    steps.push({ ...S(9, [{ fn: "<module>", vars: { done: true, total_moves: moves.length }, depth: 0 }], `🎉 Done! All ${n} disks moved from A to C in ${moves.length} moves.`), ...hanoiMeta() });
    return steps;
  }

  // ── LINKED LIST ──────────────────────────────────────────────
  if (key === "linked_list") {
    const vals = parseLinkedListNodes(code);
    const nodes = vals.length > 0 ? vals : [1, 2, 3];
    // Build full heap object (all nodes always visible)
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

    // Allocation phase — heap grows incrementally
    nodes.forEach((v, i) => {
      const partial = {};
      for (let k = 0; k <= i; k++) partial[`Node@${String(k+1).padStart(2,"0")}`] = fullHeap[`Node@${String(k+1).padStart(2,"0")}`];
      const lineNo = 6 + i;
      if (i === 0) {
        steps.push(S(lineNo, mkStack({ head: "Node@01" }), `📦 head = Node(${v}). Allocate new node on heap at Node@01 with val=${v}, next=None.`, { heap: partial, lastHeap: partial }));
      } else {
        const chain = nodes.slice(0, i+1).join(" → ");
        steps.push(S(lineNo, mkStack({ head: "Node@01" }), `🔗 head${".next".repeat(i)} = Node(${v}). Chain now: ${chain}.`, { heap: partial, lastHeap: partial }));
      }
    });

    // FIX #3: traversal steps carry fullHeap as both heap AND lastHeap so diagram never goes blank
    steps.push(S(10, mkStack({ cur: "Node@01" }), `▶ cur = head (Node@01). Start traversal. Loop while cur != None.`, { heap: fullHeap, lastHeap: fullHeap }));
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
    steps.push(S(1, [{ fn: "<module>", vars: { stack: "[]" }, depth: 0 }], `▶ stack = []. Initialize an empty list to use as a stack (LIFO — Last In, First Out).`));
    items.forEach((v, i) => {
      stack.push(v);
      steps.push(S(3 + i, [{ fn: "<module>", vars: { stack: `[${stack.join(", ")}]`, pushed: v }, depth: 0 }], `📥 stack.append(${v}). Push ${v} onto the top. Stack is now: [${stack.join(", ")}]. Top = ${v}.`));
    });
    steps.push(S(7, [{ fn: "<module>", vars: { stack: `[${stack.join(", ")}]`, top: stack[stack.length-1] }, depth: 0 }], `📤 print("Top:", stack[-1]) → Top is ${stack[stack.length-1]}.`));
    const pops = Math.min(2, stack.length);
    for (let i = 0; i < pops; i++) {
      const popped = stack.pop();
      steps.push(S(8 + i*2, [{ fn: "<module>", vars: { popped, stack: `[${stack.join(", ")}]` }, depth: 0 }], `📤 stack.pop() removes ${popped} (the last-in element). Stack is now: [${stack.join(", ")}].`));
      steps.push(S(9 + i*2, [{ fn: "<module>", vars: { stack: `[${stack.join(", ")}]` }, depth: 0 }], `📤 print("After pop:", ${JSON.stringify(stack)}) → [${stack.join(", ")}].`));
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
      steps.push(S(4 + i, [{ fn: "<module>", vars: { queue: `[${queue.join(", ")}]`, enqueued: `'${v}'` }, depth: 0 }], `📥 queue.append('${v}'). Enqueue '${v}' at the back. Queue: [${queue.join(", ")}]. Front='${queue[0]}', Back='${v}'.`));
    });
    steps.push(S(8, [{ fn: "<module>", vars: { front: `'${queue[0]}'` }, depth: 0 }], `📤 print("Front:", queue[0]) → Front is '${queue[0]}'. First element in, first to leave.`));
    const dequeues = Math.min(2, queue.length);
    for (let i = 0; i < dequeues; i++) {
      const removed = queue.shift();
      steps.push(S(9 + i*2, [{ fn: "<module>", vars: { dequeued: `'${removed}'`, queue: `[${queue.join(", ")}]` }, depth: 0 }], `📤 queue.popleft() removes '${removed}' from the front (FIFO). Queue: [${queue.join(", ")}].`));
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
      steps.push(S(9, cs, `❓ root is None? → ${!node ? "YES ✓ Found the insertion spot! Create new Node(" + val + ")." : "NO → compare val with root.val."}`));
      if (!node) {
        const ret = [{ ...newFrame, vars: { ...newFrame.vars, "↩ return": `Node(${val})` }, returning: true }, ...callStack];
        steps.push(S(10, ret, `✅ Create Node(${val}) and return it. Inserted at path: ${path}.`));
        return { val, left: null, right: null };
      }
      if (val < node.val) {
        steps.push(S(11, cs, `❓ Is val(${val}) < root.val(${node.val})? → YES → go LEFT. Call insert(root.left, ${val}).`));
        node.left = bstInsertSim(node.left, val, path + " → Left", cs);
      } else {
        steps.push(S(13, cs, `❓ Is val(${val}) < root.val(${node.val})? → NO (${val} ≥ ${node.val}) → go RIGHT. Call insert(root.right, ${val}).`));
        node.right = bstInsertSim(node.right, val, path + " → Right", cs);
      }
      const ret = [{ ...newFrame, vars: { ...newFrame.vars, "↩ return": `Node(${node.val})` }, returning: true }, ...callStack];
      steps.push(S(14, ret, `↩ Return Node(${node.val}) back up the chain.`));
      return node;
    }

    vals.forEach((v, i) => {
      steps.push(S(20, [{ fn: "<module>", vars: { inserting: v, inserted_so_far: vals.slice(0,i).join(",") || "∅" }, depth: 0 }], `🔁 Loop iteration ${i+1}: Inserting ${v} into the BST.`));
      root = bstInsertSim(root, v, "root", [{ fn: "<module>", vars: {}, depth: 0 }]);
    });

    const order = [];
    function inorderSim(node, callStack) {
      if (!node) return;
      const cs = [{ fn: "inorder", vars: { root: `Node(${node.val})` }, depth: callStack.length }, ...callStack];
      steps.push(S(17, cs, `📥 inorder(Node(${node.val})). Visit left subtree first (in-order: left → root → right).`));
      inorderSim(node.left, cs);
      order.push(node.val);
      steps.push(S(18, cs, `📤 print(${node.val}). In-order output so far: [${order.join(", ")}].`));
      inorderSim(node.right, cs);
    }
    steps.push(S(21, [{ fn: "<module>", vars: { root: `Node(${root.val})` }, depth: 0 }], `📞 Call inorder(root). In-order traversal of BST always produces sorted output.`));
    inorderSim(root, [{ fn: "<module>", vars: {}, depth: 0 }]);
    steps.push(S(18, [{ fn: "<module>", vars: { sorted_output: order.join(" ") }, depth: 0 }], `✅ In-order traversal complete. Output: [${order.join(", ")}] — BST guarantees sorted order!`));
    return steps;
  }

  // ── BFS ──────────────────────────────────────────────────────
  if (key === "bfs") {
    const graph = { 0:[1,2], 1:[0,3,4], 2:[0,5], 3:[1], 4:[1], 5:[2] };
    const queue = [0];
    const visited = new Set([0]);
    const order = [];
    steps.push(S(3, [{ fn: "<module>", vars: { graph: "{0:[1,2], 1:[0,3,4], ...}" }, depth: 0 }], `▶ Define adjacency list graph. Each key maps to its neighbors.`));
    steps.push(S(12, [{ fn: "<module>", vars: {}, depth: 0 }], `📞 Call bfs(start=0).`));
    steps.push(S(13, [{ fn: "bfs", vars: { visited: "{0}", queue: "[0]" }, depth: 1 }], `📥 Enter bfs(0). visited = {0}, queue = [0]. Mark start node as visited.`));
    while (queue.length > 0) {
      const node = queue.shift();
      order.push(node);
      steps.push(S(14, [{ fn: "bfs", vars: { node, queue: `[${queue.join(",")}]`, order: `[${order.join(",")}]` }, depth: 1 }], `📤 Dequeue node ${node}. Add to order → [${order.join(", ")}]. Now explore its neighbors: [${graph[node].join(", ")}].`));
      (graph[node] || []).forEach(nb => {
        if (!visited.has(nb)) {
          steps.push(S(16, [{ fn: "bfs", vars: { neighbor: nb, "already visited?": "NO" }, depth: 1 }], `❓ Is neighbor ${nb} visited? → NO → mark visited and enqueue.`));
          visited.add(nb);
          queue.push(nb);
          steps.push(S(17, [{ fn: "bfs", vars: { enqueued: nb, queue: `[${queue.join(",")}]`, visited: `{${[...visited].join(",")}}` }, depth: 1 }], `✔ Mark ${nb} visited. Enqueue ${nb}. Queue: [${queue.join(", ")}].`));
        } else {
          steps.push(S(16, [{ fn: "bfs", vars: { neighbor: nb, "already visited?": "YES → skip" }, depth: 1 }], `❓ Is neighbor ${nb} visited? → YES → skip, already processed.`));
        }
      });
    }
    steps.push(S(19, [{ fn: "bfs", vars: { return: `[${order.join(",")}]` }, depth: 1 }], `↩ Return order = [${order.join(", ")}].`));
    steps.push(S(21, [{ fn: "<module>", vars: { result: `[${order.join(",")}]` }, depth: 0 }], `✅ BFS complete! Traversal order: [${order.join(", ")}]. Nodes visited level by level.`));
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
      steps.push(S(10, [{ ...newFrame, vars: { node, "↩ print": node, visited: `{${[...visited].join(",")}}` } }, ...callStack], `📤 print(${node}). Output so far: ${order.join(" → ")}.`));
      (graph[node] || []).forEach(nb => {
        if (!visited.has(nb)) {
          steps.push(S(11, [{ ...newFrame, vars: { node, neighbor: nb, "visited?": "NO" } }, ...callStack], `❓ Neighbor ${nb} visited? → NO → recurse into dfs(${nb}).`));
          dfsSim(nb, cs);
          steps.push(S(11, [{ ...newFrame, vars: { node, backtrack: `back to ${node}` } }, ...callStack], `↩ Backtrack to node ${node}. Continue checking remaining neighbors.`));
        } else {
          steps.push(S(11, [{ ...newFrame, vars: { node, neighbor: nb, "visited?": "YES → skip" } }, ...callStack], `❓ Neighbor ${nb} visited? → YES → skip.`));
        }
      });
      const ret = [{ ...newFrame, returning: true }, ...callStack];
      steps.push(S(9, ret, `↩ dfs(${node}) complete. All neighbors explored. Pop frame.`));
    }

    dfsSim(0, [{ fn: "<module>", vars: {}, depth: 0 }]);
    steps.push(S(12, [{ fn: "<module>", vars: { output: order.join(" → ") }, depth: 0 }], `✅ DFS complete! Traversal: ${order.join(" → ")}. Explored depth-first.`));
    return steps;
  }

  // ── FIB DP ───────────────────────────────────────────────────
  if (key === "fib_dp") {
    const limit = Math.min(parseFibRange(code), 10);
    const memo = {};
    steps.push(S(1, [{ fn: "<module>", vars: {}, depth: 0 }], `▶ Define fib_memo(n, memo={}). Uses memoization to cache results.`));
    steps.push(S(8, [{ fn: "<module>", vars: { i: "0.." + (limit-1) }, depth: 0 }], `🔁 Loop: compute fib(0) through fib(${limit-1}) using memoized function.`));

    function fibMemoSim(n, callStack) {
      const cs = [{ fn: "fib_memo", vars: { n, memo: `{${Object.entries(memo).map(([k,v])=>k+":"+v).join(",")}}` }, depth: callStack.length }, ...callStack];
      steps.push(S(1, cs, `📥 Enter fib_memo(${n}). Current memo: {${Object.entries(memo).map(([k,v])=>k+":"+v).join(", ")||"empty"}}.`));
      if (memo[n] !== undefined) {
        steps.push(S(2, cs, `❓ Is ${n} in memo? → YES ✓ Cache hit! memo[${n}] = ${memo[n]}. No recursion needed.`));
        const ret = [{ fn: "fib_memo", vars: { n, "↩ cache hit": memo[n] }, depth: callStack.length, returning: true }, ...callStack];
        steps.push(S(3, ret, `✅ Return ${memo[n]} directly from cache. This is the power of memoization — no repeated computation!`));
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
      steps.push(S(9, [{ fn: "<module>", vars: { [`fib(${i})`]: v }, depth: 0 }], `📤 print(f"fib(${i}) = {fib_memo(${i})}") → fib(${i}) = ${v}`));
    }
    return steps;
  }

  // ── KNAPSACK ─────────────────────────────────────────────────
  if (key === "knapsack") {
    const { weights, values, capacity } = parseKnapsack(code);
    const n = weights.length;
    const dp = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));
    // FIX #8: attach kWeights/kValues/kCapacity to every step
    const knapsackMeta = { kWeights: weights, kValues: values, kCapacity: capacity };
    steps.push(S(1, [{ fn: "<module>", vars: { weights: `[${weights.join(",")}]`, values: `[${values.join(",")}]`, capacity }, depth: 0 }], `▶ ${n} items. weights=[${weights.join(",")}], values=[${values.join(",")}], capacity=${capacity}.`, knapsackMeta));
    steps.push(S(3, [{ fn: "knapsack", vars: { n, capacity, dp: `(${n+1})×(${capacity+1}) zeros` }, depth: 1 }], `▶ Create dp table [${n+1}][${capacity+1}], all zeros. dp[i][w] = max value using first i items with capacity w.`, knapsackMeta));

    for (let i = 1; i <= n; i++) {
      steps.push(S(4, [{ fn: "knapsack", vars: { item: i, weight: weights[i-1], value: values[i-1] }, depth: 1 }], `🔁 Item ${i}: weight=${weights[i-1]}, value=${values[i-1]}.`, knapsackMeta));
      for (let w = 0; w <= capacity; w++) {
        dp[i][w] = dp[i-1][w];
        if (weights[i-1] <= w) {
          const withItem = values[i-1] + dp[i-1][w - weights[i-1]];
          if (withItem > dp[i][w]) {
            dp[i][w] = withItem;
            if (w === capacity || w === Math.floor(capacity / 2)) {
              steps.push(S(7, [{ fn: "knapsack", vars: { i, w, "skip": dp[i-1][w], "include": withItem, "dp[i][w]": dp[i][w] }, depth: 1 }], `❓ w=${w}: Include item ${i}? skip=${dp[i-1][w]}, include=${withItem}. → include is better! dp[${i}][${w}] = ${dp[i][w]}.`, knapsackMeta));
            }
          }
        }
      }
    }
    steps.push(S(9, [{ fn: "<module>", vars: { result: dp[n][capacity] }, depth: 0 }], `✅ dp[${n}][${capacity}] = ${dp[n][capacity]}. Max value that fits in capacity ${capacity} is ${dp[n][capacity]}.`, knapsackMeta));
    return steps;
  }

  // ── LCS ──────────────────────────────────────────────────────
  if (key === "lcs") {
    const { s1, s2 } = parseLCS(code);
    const m = s1.length, n2 = s2.length;
    const dp = Array.from({ length: m+1 }, () => Array(n2+1).fill(0));
    // FIX #9: attach lcsS1/lcsS2 to every step
    const lcsMeta = { lcsS1: s1, lcsS2: s2 };
    steps.push(S(1, [{ fn: "<module>", vars: { s1: `"${s1}"`, s2: `"${s2}"` }, depth: 0 }], `▶ lcs("${s1}", "${s2}"). Find the length of their longest common subsequence.`, lcsMeta));
    steps.push(S(3, [{ fn: "lcs", vars: { m, n: n2, dp: `(${m+1})×(${n2+1}) zeros` }, depth: 1 }], `▶ dp table [${m+1}][${n2+1}], all zeros. dp[i][j] = LCS length of s1[0..i-1] and s2[0..j-1].`, lcsMeta));
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n2; j++) {
        if (s1[i-1] === s2[j-1]) {
          dp[i][j] = dp[i-1][j-1] + 1;
          steps.push(S(5, [{ fn: "lcs", vars: { i, j, "s1[i-1]": `'${s1[i-1]}'`, "s2[j-1]": `'${s2[j-1]}'`, match: "YES!", "dp[i][j]": dp[i][j] }, depth: 1 }], `✅ s1[${i-1}]='${s1[i-1]}' == s2[${j-1}]='${s2[j-1]}'. Match! dp[${i}][${j}] = dp[${i-1}][${j-1}]+1 = ${dp[i][j]}.`, lcsMeta));
        } else {
          dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
          if (dp[i][j] > 0) {
            steps.push(S(7, [{ fn: "lcs", vars: { i, j, "s1[i-1]": `'${s1[i-1]}'`, "s2[j-1]": `'${s2[j-1]}'`, match: "NO", "dp[i][j]": dp[i][j] }, depth: 1 }], `❓ s1[${i-1}]='${s1[i-1]}' vs s2[${j-1}]='${s2[j-1]}'. No match. dp[${i}][${j}] = max(${dp[i-1][j]}, ${dp[i][j-1]}) = ${dp[i][j]}.`, lcsMeta));
          }
        }
      }
    }
    steps.push(S(10, [{ fn: "<module>", vars: { result: dp[m][n2] }, depth: 0 }], `✅ LCS length = dp[${m}][${n2}] = ${dp[m][n2]}. The longest common subsequence of "${s1}" and "${s2}" has length ${dp[m][n2]}.`, lcsMeta));
    return steps;
  }

  return [{ line: 1, stack: [{ fn: "<module>", vars: {}, depth: 0 }], note: "▶ Starting execution." }];
}

// ─────────────────────────────────────────────────────────────────────────────
// VIZ COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function SortViz({ step }) {
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

function SearchViz({ step }) {
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

// ── CALL STACK VIZ ────────────────────────────────────────────────────
// compact=true  → horizontal scrollable version (lives in topbar beside player)
// compact=false → original full vertical version
function StackViz({ step, compact = false }) {
  if (!step?.stack) return null;
  const frames = step.stack;
  if (frames.length === 0) return null;

  // ── COMPACT MODE — shown in topbar right panel ──
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

  // ── FULL VERTICAL MODE (kept for reference) ──
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

// ─────────────────────────────────────────────────────────────────────────────
// GRAPH VIZ — SVG-based animated node/edge graph for BFS and DFS
// ─────────────────────────────────────────────────────────────────────────────

const GRAPH_NODE_POSITIONS = {
  0: { x: 200, y: 55  },
  1: { x: 100, y: 155 },
  2: { x: 300, y: 155 },
  3: { x: 40,  y: 265 },
  4: { x: 160, y: 265 },
  5: { x: 300, y: 265 },
};

const GRAPH_EDGES = [[0,1],[0,2],[1,3],[1,4],[2,5]];

function GraphViz({ step, algorithmKey }) {
  if (!step) return null;

  const topVars = step.stack?.[0]?.vars || {};

  const parseSet = (s) => {
    if (!s) return new Set();
    return new Set(
      String(s).replace(/[{}]/g, "").split(",")
        .map(v => parseInt(v.trim())).filter(n => !isNaN(n))
    );
  };
  const parseArr = (s) => {
    if (!s) return [];
    return String(s).replace(/[\[\]]/g, "").split(",")
      .map(v => parseInt(v.trim())).filter(n => !isNaN(n));
  };

  const visited     = parseSet(topVars.visited || "");
  const queueArr    = parseArr(topVars.queue || "");
  const orderArr    = parseArr(topVars.order || "");
  const activeNode  = topVars.node !== undefined ? parseInt(topVars.node) :
                      topVars.start !== undefined ? parseInt(topVars.start) : -1;
  const enqueuedNode = topVars.enqueued !== undefined ? parseInt(topVars.enqueued) : -1;

  const orderMap = {};
  orderArr.forEach((n, i) => { orderMap[n] = i + 1; });

  const getState = (id) => {
    if (id === activeNode)    return "active";
    if (id === enqueuedNode)  return "enqueued";
    if (visited.has(id))      return "visited";
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
          <marker id="arrow-active" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="rgba(200,245,66,0.7)" />
          </marker>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {GRAPH_EDGES.map(([a, b]) => {
          const pa = GRAPH_NODE_POSITIONS[a];
          const pb = GRAPH_NODE_POSITIONS[b];
          const es = edgeState(a, b);
          const dx = pb.x - pa.x, dy = pb.y - pa.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          const ux = dx/dist, uy = dy/dist;
          const x1 = pa.x + ux*R, y1 = pa.y + uy*R;
          const x2 = pb.x - ux*R, y2 = pb.y - uy*R;
          return (
            <line key={`e${a}-${b}`}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={
                es === "active"    ? "rgba(200,245,66,0.7)" :
                es === "traversed" ? "rgba(200,245,66,0.3)" :
                "#2a2a2a"
              }
              strokeWidth={es === "active" ? 2.5 : es === "traversed" ? 2 : 1.5}
              strokeDasharray={es === "default" ? "5,4" : "none"}
              style={{ transition: "stroke 0.3s, stroke-width 0.3s" }}
            />
          );
        })}

        {Object.entries(GRAPH_NODE_POSITIONS).map(([idStr, pos]) => {
          const id    = parseInt(idStr);
          const state = getState(id);
          const col   = C[state];
          const badge = orderMap[id];
          return (
            <g key={id} style={{ transition: "all 0.3s" }}>
              {state === "active" && (
                <circle cx={pos.x} cy={pos.y} r={R + 9}
                  fill="none" stroke="rgba(200,245,66,0.15)" strokeWidth={8}
                  filter="url(#glow)" />
              )}
              <circle
                cx={pos.x} cy={pos.y} r={R}
                fill={col.fill} stroke={col.stroke}
                strokeWidth={state === "active" ? 2.5 : 1.5}
                style={{ transition: "fill 0.3s, stroke 0.3s" }}
              />
              <text
                x={pos.x} y={pos.y}
                textAnchor="middle" dominantBaseline="central"
                fill={col.label} fontSize={15}
                fontWeight={state === "active" ? "700" : "500"}
                fontFamily="Space Mono, monospace"
              >
                {id}
              </text>
              {badge !== undefined && (
                <g>
                  <circle cx={pos.x + R - 2} cy={pos.y - R + 2} r={11}
                    fill="#c8f542" stroke="#0f0f0f" strokeWidth={1.5} />
                  <text
                    x={pos.x + R - 2} y={pos.y - R + 2}
                    textAnchor="middle" dominantBaseline="central"
                    fill="#0f0f0f" fontSize={9} fontWeight="900"
                    fontFamily="Space Mono, monospace"
                  >
                    {badge}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {queueArr.length > 0 && (
          <g>
            <text x={8} y={H - 28} fill="#555" fontSize={10}
              fontFamily="Space Mono, monospace">
              {algorithmKey === "bfs" ? "Queue →" : "Stack →"}
            </text>
            {queueArr.map((n, i) => (
              <g key={i}>
                <rect x={74 + i*34} y={H - 42} width={28} height={24} rx={5}
                  fill="rgba(255,170,60,0.13)" stroke="#ffaa3c" strokeWidth={1.5} />
                <text x={74 + i*34 + 14} y={H - 27}
                  textAnchor="middle" dominantBaseline="central"
                  fill="#ffaa3c" fontSize={12} fontWeight="700"
                  fontFamily="Space Mono, monospace">
                  {n}
                </text>
              </g>
            ))}
          </g>
        )}

        {orderArr.length > 0 && (
          <g>
            <text x={8} y={H - 6} fill="#555" fontSize={10}
              fontFamily="Space Mono, monospace">Order:</text>
            <text x={60} y={H - 6} fill="#c8f542" fontSize={10}
              fontWeight="700" fontFamily="Space Mono, monospace">
              {orderArr.join(" → ")}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

function HeapViz({ step }) {
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

// ─────────────────────────────────────────────────────────────────────────────
// ERROR DETECTION — client-side static check + backend runtime check
// ─────────────────────────────────────────────────────────────────────────────

function clientSidePythonCheck(code) {
  const lines = code.split("\n");

  // ── Helper: strip string literals from a line ──────────────────────────────
  // Returns the line with all string contents replaced by spaces, so the
  // tokenizer never sees words inside "..." or '...' or f"..." or f'...'
  function stripStrings(line) {
    let out = "";
    let i = 0;
    while (i < line.length) {
      const ch = line[i];
      // Skip comments
      if (ch === "#") { out += " ".repeat(line.length - i); break; }
      // f-string prefix: skip the 'f' or 'F' but treat the quote normally
      if ((ch === "f" || ch === "F") && i + 1 < line.length && (line[i+1] === '"' || line[i+1] === "'")) {
        out += " "; // replace 'f' prefix with space
        i++;
        continue;
      }
      // Triple quote string
      if ((ch === '"' || ch === "'") && line.slice(i, i+3) === ch+ch+ch) {
        const q = ch+ch+ch;
        const close = line.indexOf(q, i + 3);
        if (close === -1) { out += " ".repeat(line.length - i); break; }
        out += " ".repeat(close + 3 - i);
        i = close + 3;
        continue;
      }
      // Single/double quote string
      if (ch === '"' || ch === "'") {
        const q = ch;
        let j = i + 1;
        while (j < line.length && line[j] !== q) {
          if (line[j] === "\\") j++; // skip escaped char
          j++;
        }
        out += " ".repeat(j + 1 - i);
        i = j + 1;
        continue;
      }
      out += ch;
      i++;
    }
    return out;
  }

  // 1. Bracket balance (on stripped lines)
  const opens = { "(": 0, "[": 0, "{": 0 };
  const pairs = { ")": "(", "]": "[", "}": "{" };
  for (let ln = 0; ln < lines.length; ln++) {
    const stripped = stripStrings(lines[ln]);
    for (let ci = 0; ci < stripped.length; ci++) {
      const ch = stripped[ci];
      if (opens[ch] !== undefined) opens[ch]++;
      else if (pairs[ch]) {
        opens[pairs[ch]]--;
        if (opens[pairs[ch]] < 0) return `SyntaxError: unexpected '${ch}' on line ${ln + 1}`;
      }
    }
  }
  if (opens["("] > 0) return "SyntaxError: unmatched '(' — missing closing ')'";
  if (opens["["] > 0) return "SyntaxError: unmatched '[' — missing closing ']'";
  if (opens["{"] > 0) return "SyntaxError: unmatched '{' — missing closing '}'";

  // 2. Mixed indentation
  let hasTabs = false, hasSpaces = false;
  for (const line of lines) {
    const m = line.match(/^([ \t]+)/);
    if (!m) continue;
    if (m[1].includes("\t")) hasTabs = true;
    if (m[1].includes(" "))  hasSpaces = true;
  }
  if (hasTabs && hasSpaces) return "TabError: mixed tabs and spaces in indentation";

  // 3. Name resolution — collect all defined names first, then check RHS usages
  const BUILTINS = new Set([
    "print","len","range","int","str","float","bool","list","dict","set","tuple",
    "type","isinstance","input","abs","min","max","sum","sorted","reversed",
    "enumerate","zip","map","filter","any","all","open","None","True","False",
    "self","cls","__name__","__main__","Exception","ValueError","TypeError",
    "KeyError","IndexError","StopIteration","object","super","property",
    "staticmethod","classmethod","pass","break","continue","return","yield",
    "lambda","if","else","elif","while","for","in","not","and","or","is",
    "del","global","nonlocal","with","as","try","except","finally","raise",
    "import","from","math","collections","deque","popleft","appendleft",
    "append","pop","insert","remove","copy","keys","values","items","get","update",
    // common variable names used in VisuAlgo programs
    "memo","arr","node","graph","dp","n","m","i","j","k","w","v","u",
    "result","visited","queue","stack","capacity","weights","profits","s1","s2",
    "left","right","mid","lo","hi","target","key","val","head","curr","prev",
    "peg_a","peg_b","peg_c","disks","move","num","total","current","temp","idx",
    "src","dst","aux","low","high","step","prev","order","path","root",
    "f","end","sep","_","__",
    // common string method names that appear after dots
    "split","join","strip","replace","lower","upper","find","startswith","endswith",
    "format","encode","decode","count","index","isdigit","isalpha",
    // math module and common method names
    "sqrt","floor","ceil","log","log2","pow","pi","sin","cos","tan","exp","fabs",
    // object attribute / method names that appear as identifiers after dots
    "next","left","right","val","data","size","height","depth","parent","children",
    "popleft","appendleft","extendleft","rotate","clear","reverse","extend","sort",
  ]);
  const defined = new Set(BUILTINS);

  // Pass 1: collect all definitions (functions, classes, imports, assignments, loop vars, params)
  for (const line of lines) {
    const raw = line.trim();
    let m;
    if ((m = raw.match(/^def\s+([A-Za-z_]\w*)\s*\(/)))          defined.add(m[1]);
    if ((m = raw.match(/^class\s+([A-Za-z_]\w*)/)))              defined.add(m[1]);
    // "import X" or "from X import Y (as Z)"
    if ((m = raw.match(/^import\s+([A-Za-z_][\w.]*)/)))          m[1].split(".").forEach(p => defined.add(p));
    if ((m = raw.match(/^from\s+([A-Za-z_]\w*)/)))               defined.add(m[1]);
    if ((m = raw.match(/\bimport\s+([A-Za-z_]\w*)(?:\s+as\s+([A-Za-z_]\w*))?/))) {
      defined.add(m[1]); if (m[2]) defined.add(m[2]);
    }
    // "for VAR in" or "for VAR1, VAR2 in"
    if ((m = raw.match(/^for\s+([\w,\s]+)\s+in\b/))) {
      m[1].split(",").forEach(p => { const n = p.trim(); if (/^[A-Za-z_]\w*$/.test(n)) defined.add(n); });
    }
    // Function parameters
    if ((m = raw.match(/^def\s+[A-Za-z_]\w*\s*\(([^)]*)\)/))) {
      m[1].split(",").forEach(p => {
        const pn = p.trim().split("=")[0].trim().replace(/^\*+/, "");
        if (pn && /^[A-Za-z_]\w*$/.test(pn)) defined.add(pn);
      });
    }
    // Simple assignment: X = or X += etc.
    if ((m = raw.match(/^([A-Za-z_]\w*)\s*(?:[+\-*\/]?=)(?!=)/))) defined.add(m[1]);
    // Tuple assignment: a, b = ... (captures comma-separated names on LHS)
    if ((m = raw.match(/^((?:[A-Za-z_]\w*\s*,\s*)+[A-Za-z_]\w*)\s*=/))) {
      m[1].split(",").forEach(p => { const n = p.trim(); if (/^[A-Za-z_]\w*$/.test(n)) defined.add(n); });
    }
    // Augmented / subscript assignment: arr[i] = ...  → capture the array name
    if ((m = raw.match(/^([A-Za-z_]\w*)\s*\[/))) defined.add(m[1]);
    // with X as Y:
    if ((m = raw.match(/\bas\s+([A-Za-z_]\w*)/))) defined.add(m[1]);
    // except ExcType as e:
    if ((m = raw.match(/^except\s+\w+\s+as\s+([A-Za-z_]\w*)/))) defined.add(m[1]);
    // comprehension variable:  [... for X in ...]
    const compRe = /\bfor\s+([A-Za-z_]\w*)\s+in\b/g;
    let cm;
    while ((cm = compRe.exec(raw)) !== null) defined.add(cm[1]);
  }

  // Pass 2: check RHS of non-structural lines
  const KEYWORDS = new Set([
    "and","or","not","in","is","if","else","elif","for","while","return",
    "True","False","None","lambda","pass","break","continue","import","from",
    "as","with","try","except","finally","raise","del","global","nonlocal",
    "class","def","yield",
  ]);

  for (let ln = 0; ln < lines.length; ln++) {
    const stripped = lines[ln].trim();
    if (!stripped || stripped.startsWith("#")) continue;
    // Skip purely structural lines
    if (/^(def |class |import |from |return |if |elif |else[:\s]|for |while |pass\b|break\b|continue\b|raise |with |try[:\s]|except|finally|yield)/.test(stripped)) continue;

    // Work on string-stripped version so we don't tokenize string contents
    const safe = stripStrings(lines[ln]).trim();
    if (!safe.trim()) continue;

    // Find RHS — everything after the first bare '='
    let rhs = safe;
    const eqIdx = safe.search(/(?<![=!<>+\-*\/])=(?!=)/);
    if (eqIdx > 0) rhs = safe.slice(eqIdx + 1).trim();

    // Tokenize identifiers from RHS
    const tokRe = /\b([A-Za-z_]\w*)\b/g;
    let tk;
    while ((tk = tokRe.exec(rhs)) !== null) {
      const tok = tk[1];
      if (defined.has(tok)) continue;
      if (KEYWORDS.has(tok)) continue;
      if (/^\d/.test(tok)) continue;
      return `NameError: name '${tok}' is not defined (line ${ln + 1})`;
    }
  }

  return null;
}
async function validateCodeWithBackend(code) {
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
      return errLine ? errLine[1].trim() : raw.split("\n").filter(Boolean).pop().trim();
    }
    return null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// THEORY PANEL
// ─────────────────────────────────────────────────────────────────────────────
function TheoryPanel({ theory }) {
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

// ─────────────────────────────────────────────────────────────────────────────
// CHAPTER SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────
const DIFF_COLORS = { Easy: "diff-easy", Medium: "diff-medium", Hard: "diff-hard" };

function ChapterSidebar({ selectedKey, onSelect }) {
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

// ─────────────────────────────────────────────────────────────────────────────
// MAIN VISUALIZER
// ─────────────────────────────────────────────────────────────────────────────
export default function Visualizer({ user }) {
  const defaultChapter = CHAPTERS[0];
  const defaultProgram = CHAPTERS[0].programs[0];

  const [activeChapter, setActiveChapter] = useState(defaultChapter);
  const [activeProgram, setActiveProgram] = useState(defaultProgram);
  const [code, setCode] = useState(defaultProgram.code);
  const [isEditing, setIsEditing] = useState(false);
  const [codeDirty, setCodeDirty] = useState(false);
  const [activeTab, setActiveTab] = useState("code"); // "code" | "theory"
  const [codeError, setCodeError] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const validateTimerRef = useRef(null);

  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [speed, setSpeed] = useState(900);

  const intervalRef = useRef(null);
  const activeLineRef = useRef(null);

  const codeLines = code.split("\n");

  const handleSelect = (chapter, program) => {
    setActiveChapter(chapter);
    setActiveProgram(program);
    setCode(program.code);
    setHasRun(false);
    setSteps([]);
    setCurrentStep(0);
    setIsPlaying(false);
    setIsEditing(false);
    setCodeDirty(false);
    setActiveTab("code");
    setCodeError(null);
  };

  const handleCodeChange = (val) => {
    setCode(val);
    setCodeDirty(true);
    setIsPlaying(false);
    setCodeError(null); // clear stale error while typing

    // Debounce real Python validation — 600ms after user stops typing
    if (validateTimerRef.current) clearTimeout(validateTimerRef.current);
    validateTimerRef.current = setTimeout(async () => {
      setIsValidating(true);
      const err = await validateCodeWithBackend(val);
      setCodeError(err);
      setIsValidating(false);
    }, 600);
  };

  const handleResetCode = () => {
    setCode(activeProgram.code);
    setCodeDirty(false);
    setIsEditing(false);
    setCodeError(null);
    setHasRun(false);
    setSteps([]);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const runCode = async () => {
    // Always do a fresh backend validation before running
    const freshErr = await validateCodeWithBackend(code);
    if (freshErr) { setCodeError(freshErr); return; }
    setIsRunning(true);
    setIsPlaying(false);
    clearInterval(intervalRef.current);
    setTimeout(() => {
      const s = simulateExecution(activeProgram.key, code);
      setSteps(s);
      setCurrentStep(0);
      setHasRun(true);
      setIsRunning(false);
      setCodeDirty(false);
      if (user?.uid) {
        saveVisualizerSession(user.uid, code, activeProgram.label, s.length);
      }
    }, 400);
  };

  useEffect(() => {
    if (isPlaying && hasRun) {
      intervalRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) { setIsPlaying(false); return prev; }
          return prev + 1;
        });
      }, speed);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, hasRun, steps, speed]);

  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [currentStep]);

  const step = steps[currentStep];
  const activeLine = step?.line ?? -1;

  const reset = () => { setCurrentStep(0); setIsPlaying(false); };
  const stepBack = () => setCurrentStep(p => Math.max(0, p - 1));
  const stepFwd = () => setCurrentStep(p => Math.min(steps.length - 1, p + 1));

  return (
    <div className="viz-page">
      <ChapterSidebar selectedKey={activeProgram.key} onSelect={handleSelect} />

      <div className="viz-main">
        {/* Breadcrumb + desc */}
        <div className="viz-topbar">
          <div className="viz-breadcrumb">
            <span className="viz-chapter-name">{activeChapter.label}</span>
            <FiChevronRight size={14} color="var(--text-dim)" />
            <span className="viz-program-name">{activeProgram.label}</span>
            <span className={`diff-badge ${DIFF_COLORS[activeProgram.difficulty]}`}>{activeProgram.difficulty}</span>
          </div>
          <p className="viz-program-desc">{activeProgram.desc}</p>

          {hasRun && (
            <div className="topbar-row">
              {/* ── Left half: player controls ── */}
              <div className="topbar-player">
                <div className="player-controls">
                  <button className="ctrl-btn" onClick={reset} title="Reset to start">
                    <FiRotateCcw size={15} />
                  </button>
                  <button className="ctrl-btn" onClick={stepBack} title="Step back" disabled={currentStep === 0}>
                    <FiSkipBack size={15} />
                  </button>
                  <button className="ctrl-btn play-btn" onClick={() => setIsPlaying(p => !p)}>
                    {isPlaying ? <FiPause size={17} /> : <FiPlay size={17} />}
                  </button>
                  <button className="ctrl-btn" onClick={stepFwd} title="Step forward" disabled={currentStep === steps.length - 1}>
                    <FiSkipForward size={15} />
                  </button>
                </div>
                <div className="player-progress">
                  <span className="player-step">{currentStep + 1} / {steps.length}</span>
                  <input
                    type="range"
                    className="step-slider"
                    min={0}
                    max={steps.length - 1}
                    value={currentStep}
                    onChange={e => setCurrentStep(Number(e.target.value))}
                  />
                  <div className="speed-control">
                    <span className="speed-label">Speed</span>
                    <select className="speed-select" value={speed} onChange={e => setSpeed(Number(e.target.value))}>
                      <option value={1500}>0.5×</option>
                      <option value={900}>1×</option>
                      <option value={500}>2×</option>
                      <option value={200}>4×</option>
                    </select>
                  </div>
                </div>
                {step && (
                  <div className="player-note">
                    <span className="note-step">Step {currentStep + 1}:</span>
                    <span className="note-text">{step.note}</span>
                  </div>
                )}
              </div>

              {/* ── Right half: call stack ── */}
              {!['bubble_sort','selection_sort','insertion_sort','merge_sort','quick_sort',
                  'linear_search','binary_search','jump_search',
                  'bfs','dfs','knapsack','lcs','fib_dp'].includes(activeProgram.key)
                ? <div className="topbar-stack"><StackViz step={step} compact /></div>
                : <div className="topbar-stack topbar-stack-empty" />
              }
            </div>
          )}
        </div>

        {/* Editor + Viz */}
        <div className="viz-layout">
        {/* Editor Panel */}
        <div className="editor-panel card">
        <div className="panel-header">
        <div className="panel-tabs">
          <button
          className={`panel-tab ${activeTab === "code" ? "panel-tab-active" : ""}`}
          onClick={() => { setActiveTab("code"); setIsEditing(false); }}
        >
        <span className="badge badge-blue" style={{fontSize:10, padding:"2px 7px"}}>python</span>
        <span style={{marginLeft:5}}>Code</span>
        </button>
        <button
        className={`panel-tab ${activeTab === "theory" ? "panel-tab-active panel-tab-theory" : ""}`}
          onClick={() => { setActiveTab("theory"); setIsEditing(false); }}
          >
              <FiBookOpen size={13} style={{marginRight:4}} />
                  Theory
            </button>
        </div>
        {activeTab === "code" && (
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {isEditing && (
            <button
              className="edit-toggle reset-btn"
              onClick={handleResetCode}
                title="Reset to original code"
                >
                <FiRefreshCw size={12} />
              Reset
          </button>
        )}
        <button
        className={`edit-toggle ${isEditing ? "edit-active" : ""}`}
        onClick={() => { setIsEditing(p => !p); setCodeError(null); }}
        title="Toggle edit mode"
        >
        <FiEdit3 size={13} />
        {isEditing ? "Editing" : "Edit"}
        </button>
        </div>
        )}
        </div>

            {activeTab === "theory" ? (
          <TheoryPanel theory={activeProgram.theory} />
        ) : isEditing ? (
        <>
        <textarea
        className={`code-textarea ${codeError ? "code-textarea-error" : ""}`}
        value={code}
        onChange={e => handleCodeChange(e.target.value)}
          spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
        />
          {codeError && (
              <div className="code-error-banner">
                  <FiAlertCircle size={14} />
                    <span>{codeError}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="code-editor-wrap">
                {codeLines.map((line, i) => {
                  const isActive = !codeDirty && activeLine === i + 1 && hasRun;
                  return (
                    <div
                      key={i}
                      ref={isActive ? activeLineRef : null}
                      className={`editor-line ${isActive ? "editor-line-active" : ""}`}
                    >
                      <span className="editor-lnum">{i + 1}</span>
                      <span className="editor-text">{line || " "}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === "code" && (
              <div className="editor-footer">
                <button className="btn btn-primary" onClick={runCode} disabled={isRunning || isValidating || !!codeError}>
                  {isRunning
                    ? <><FiCpu size={14} className="spin" /> Analyzing...</>
                    : isValidating
                      ? <><FiCpu size={14} className="spin" /> Checking...</>
                      : codeDirty
                        ? <><FiRefreshCw size={14} /> Re-run with Changes</>
                        : <><FiPlay size={14} /> Run & Visualize</>
                  }
                </button>
                {codeError && (
                  <span className="dirty-hint" style={{color:"var(--red)"}}>Fix error before running.</span>
                )}
                {!codeError && codeDirty && hasRun && (
                  <span className="dirty-hint">Code changed — press Re-run to update.</span>
                )}
              </div>
            )}
          </div>

          {/* Visualization Panel */}
          <div className="vis-panel">
            {!hasRun ? (
              <div className="vis-empty card">
                <FiAlertCircle size={28} color="var(--text-dim)" />
                <p>Press <strong>Run & Visualize</strong> to start stepping.</p>
                {isEditing && <p className="vis-hint">You can edit the code first, then run.</p>}
              </div>
            ) : codeDirty ? (
              <div className="vis-stale card">
                <FiRefreshCw size={22} color="var(--orange)" />
                <p>Code was edited. Press <strong>Re-run with Changes</strong> to update.</p>
              </div>
            ) : (
              <>
                {/* Rich SVG diagrams — pass currentStepIdx so Hanoi can build cumulative peg state */}
                <ProgramDiagram
                  step={step}
                  programKey={activeProgram.key}
                  allSteps={steps}
                  currentStepIdx={currentStep}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
