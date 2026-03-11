export const CHAPTERS = [
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
          concept: "Move n disks from peg A to peg C using peg B as a helper. Rule: a larger disk can never be placed on top of a smaller disk. The recursive insight: to move n disks, first move the top n−1 disks out of the way, move the big disk, then move the n−1 disks back.",
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
          concept: "Quick Sort picks a 'pivot' element, rearranges the array so all elements ≤ pivot are on its left and all greater elements are on its right, then recursively sorts each side. The pivot ends up in its final sorted position.",
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
          keyInsight: "Jump Search's O(√n) beats Linear Search but is slower than Binary Search O(log n). Its advantage is fewer back-comparisons than Binary Search, which matters for systems where backward traversal is costly (like tape storage).",
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

export const DIFF_COLORS = { Easy: "diff-easy", Medium: "diff-medium", Hard: "diff-hard" };
