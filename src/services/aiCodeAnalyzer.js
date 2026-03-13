// ─────────────────────────────────────────────────────────────────────────────
// AI CODE ANALYZER — unified endpoint resolution for local + Vercel
//
// LOCAL  (localhost): FastAPI at :8000 → /api/trace  (real sys.settrace)
// VERCEL (deployed):
//   - Known algo or Python → /api/run   (serverless Python tracer)
//   - Unknown / non-Python → /api/analyze (serverless Gemini AI fallback)
// ─────────────────────────────────────────────────────────────────────────────

const IS_LOCAL =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

// Explicit override wins; otherwise auto-detect
const API_BASE =
  import.meta.env.VITE_API_URL !== undefined
    ? import.meta.env.VITE_API_URL
    : IS_LOCAL
    ? "http://localhost:8000"
    : "";

// ── Parse the backend step array into the shape the visualiser expects ────────
function parseBackendResponse(data) {
  if (!data) return { error: "No response from backend." };
  if (data.error) return { error: data.error };

  const rawSteps = data.steps || [];
  if (rawSteps.length === 0) {
    return {
      error:
        "No steps were generated. Make sure your code calls a function or has a print statement.",
    };
  }

  const steps = rawSteps.map((s, i) => ({
    line: s.line ?? 1,
    note: s.note ?? `Step ${i + 1}`,
    stack:
      Array.isArray(s.stack) && s.stack.length > 0
        ? s.stack
        : [{ fn: "<module>", vars: s.vars || {}, depth: 0 }],
    depth: s.depth ?? 0,
    arr: null,
    searchIdx: -1,
    found: -1,
    hi: -1,
    hj: -1,
    swapped: -1,
  }));

  return {
    title: data.title || "Custom Program",
    language: data.language || "Python",
    steps,
    output: data.output || "",
  };
}

// ── POST helper with timeout ──────────────────────────────────────────────────
async function postWithTimeout(url, body, timeoutMs = 20000) {
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(tid);
    return res;
  } catch (err) {
    clearTimeout(tid);
    throw err;
  }
}

// ── Main export ───────────────────────────────────────────────────────────────
export async function analyzeCodeWithAI(code, language) {
  if (!code?.trim()) {
    return { error: "Please write some code first." };
  }

  try {
    let endpoint;

    if (IS_LOCAL) {
      // Local dev — FastAPI handles everything via /api/trace
      endpoint = `${API_BASE}/api/trace`;
    } else {
      // Vercel — /api/run handles Python tracing + non-Python structural steps.
      // /api/analyze (Gemini) is the fallback for truly custom / unrecognised code.
      // We always try /api/run first; if it gives steps back we're done.
      // If it returns no steps (e.g. the Gemini path is needed), we fall through.
      endpoint = `${API_BASE}/api/run`;
    }

    const res = await postWithTimeout(endpoint, {
      code: code.trim(),
      language,
    });

    if (!res.ok) {
      let detail = `Server error (HTTP ${res.status})`;
      try {
        const body = await res.json();
        detail = body?.detail || body?.error || detail;
      } catch {
        /* ignore */
      }
      // On Vercel, if /api/run fails try the Gemini fallback
      if (!IS_LOCAL) {
        return await analyzeWithGemini(code, language);
      }
      return { error: detail };
    }

    const data = await res.json();

    // If /api/run returned steps, we're good
    if (data.steps && data.steps.length > 0) {
      return parseBackendResponse(data);
    }

    // /api/run returned no steps (custom code it couldn't handle)
    // → fall back to Gemini on Vercel
    if (!IS_LOCAL) {
      return await analyzeWithGemini(code, language);
    }

    return parseBackendResponse(data);
  } catch (err) {
    if (err.name === "AbortError") {
      return { error: "Request timed out. Try a shorter program." };
    }
    if (IS_LOCAL) {
      return {
        error:
          "Cannot reach backend. Start it with:\n  cd Backend\n  uvicorn main:app --reload --port 8000\nThen refresh this page.",
      };
    }
    // Network error on Vercel — try Gemini
    return await analyzeWithGemini(code, language);
  }
}

// ── Gemini fallback (Vercel only) ─────────────────────────────────────────────
async function analyzeWithGemini(code, language) {
  try {
    const res = await postWithTimeout(
      "/api/analyze",
      { code: code.trim(), language },
      25000
    );

    if (!res.ok) {
      let detail = `AI service error (HTTP ${res.status})`;
      try {
        const body = await res.json();
        detail = body?.detail || body?.error || detail;
      } catch {
        /* ignore */
      }
      return { error: detail };
    }

    const data = await res.json();
    return parseBackendResponse(data);
  } catch (err) {
    if (err.name === "AbortError") {
      return { error: "AI analysis timed out. Try a shorter program." };
    }
    return {
      error:
        "Trace service unavailable. Please try again in a moment.",
    };
  }
}
