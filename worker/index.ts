/** Cloudflare Worker entry point for Cooper E.'s AI Lab. */
import handler from "vinext/server/app-router-entry";

/**
 * Cloudflare Rate Limiting binding. Enforced at the edge across isolates, which is the reason it
 * is a binding and not a counter in this file: isolates do not share memory, so an in-process
 * counter would limit nothing.
 */
interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

interface Env {
  ASSETS: Fetcher;
  /** Optional KV namespace for unique-visit counting. Absent locally and on hosts without KV. */
  VISITS?: KVNamespace;
  /**
   * Server-side only. Set as a Cloudflare secret; never exposed to the browser. Kept as a
   * fallback -- if LAB_BUDDY_TOKEN is absent or the Hermes route fails, Buddy still answers via
   * Groq rather than going fully offline.
   */
  GROQ_API_KEY?: string;
  /**
   * Shared secret for Cooper's own Hermes 3 8B, run on his hardware and reached through an
   * unrelated project's already-deployed API (webbify.build/v1/lab/buddy) rather than standing
   * up a second model. Server-side only. Absent means Buddy falls back to Groq.
   */
  LAB_BUDDY_TOKEN?: string;
  /** 10 requests per minute per client. Absent under the local dev server. */
  BUDDY_LIMIT?: RateLimiter;
  /** 60 requests per minute per client. Absent under the local dev server. */
  VISITS_LIMIT?: RateLimiter;
  /** 120 requests per minute per client, for the buffered read-back routes. */
  ASSET_LIMIT?: RateLimiter;
}

/**
 * The rate-limit key. CF-Connecting-IP is set by the edge and cannot be spoofed by the client;
 * anything client-supplied (X-Forwarded-For) would make the limit trivially bypassable. The IP is
 * used transiently for this decision and never stored — the visit counter still only ever persists
 * a salted digest.
 */
function clientKey(request: Request) {
  return request.headers.get("CF-Connecting-IP") ?? "unknown";
}

/**
 * Returns true when the request should be refused. Fails open when the binding is absent, which is
 * the local dev server and preview builds only; production always has both bindings.
 */
async function overLimit(
  limiter: RateLimiter | undefined,
  request: Request,
  route: string,
) {
  // Each outcome is logged by name. Failing open is deliberate, but a silently unbound or throwing
  // limiter is indistinguishable from a working one at the HTTP layer, which is exactly how an
  // unlimited /api/buddy would go unnoticed. `wrangler tail` now shows which case occurred. No
  // request content is logged.
  if (!limiter) {
    console.error(JSON.stringify({ event: "ratelimit_binding_absent", route }));
    return false;
  }
  try {
    const outcome = await limiter.limit({ key: clientKey(request) });
    if (!outcome || typeof outcome.success !== "boolean") {
      console.error(
        JSON.stringify({ event: "ratelimit_unexpected_shape", route, keys: Object.keys(outcome ?? {}).join(",") }),
      );
      return false;
    }
    if (!outcome.success) {
      console.error(JSON.stringify({ event: "ratelimit_refused", route }));
    }
    return !outcome.success;
  } catch (err) {
    console.error(
      JSON.stringify({
        event: "ratelimit_call_failed",
        route,
        reason: String((err as { message?: string })?.message ?? err).slice(0, 160),
      }),
    );
    // A limiter failure must not take the route down with it.
    return false;
  }
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

const MAX_URL_LENGTH = 4_096;

/**
 * The papers and text files reachable through the read-back routes.
 *
 * Both are allow-lists rather than patterns, so neither route can be steered into reading an
 * arbitrary file out of the assets directory. They live at module scope because HEAD and GET both
 * consult them: HEAD must agree with GET about what exists, or a monitor sees 200 for a paper that
 * GET reports as missing.
 */
// 007 (Decodability Is Not Mechanism) retired 2026-09-10 -- superseded by Causal-State
// Interpretability v1.0 (005), which reproduces its result and overturns its main negative
// finding. Left out on purpose so an old bookmark 404s instead of serving a paper the site no
// longer lists.
const PAPER_NUMBERS = new Set([
  "001", "002", "003", "004", "005", "006", "008", "009", "010", "011",
]);

const READABLE_TEXT: Record<string, string> = {
  "exp1-xor": "/downloads/experiments/exp1_xor.py.txt",
  "exp2-auc-null": "/downloads/experiments/exp2_auc_null.py.txt",
  "exp3-bb22": "/downloads/experiments/exp3_bb22.py.txt",
  results: "/downloads/experiments/results.txt",
};

const BLOCKED_SOURCE_PATH =
  /^\/(?:\.env(?:\.|\/|$)|\.git(?:\/|$)|\.openai(?:\/|$)|app(?:\/|$)|build(?:\/|$)|db(?:\/|$)|node_modules(?:\/|$)|work(?:\/|$)|worker(?:\/|$)|package(?:-lock)?\.json$)/i;

function isLocalPreview(url: URL) {
  return (
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1" ||
    url.hostname === "::1"
  );
}

function applySecurityHeaders(response: Response, url: URL) {
  const headers = new Headers(response.headers);
  const localPreview = isLocalPreview(url);

  headers.delete("server");
  headers.delete("x-powered-by");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("X-XSS-Protection", "0");
  headers.set("X-DNS-Prefetch-Control", "off");
  headers.set("X-Permitted-Cross-Domain-Policies", "none");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
  headers.set("Cross-Origin-Resource-Policy", "same-origin");
  headers.set("Origin-Agent-Cluster", "?1");
  headers.set(
    "Permissions-Policy",
    [
      "accelerometer=()",
      "ambient-light-sensor=()",
      "autoplay=()",
      "battery=()",
      "camera=()",
      "display-capture=()",
      "document-domain=()",
      "encrypted-media=()",
      "fullscreen=(self)",
      "geolocation=()",
      "gyroscope=()",
      "magnetometer=()",
      "microphone=()",
      "midi=()",
      "payment=()",
      "publickey-credentials-get=()",
      "screen-wake-lock=()",
      "serial=()",
      "usb=()",
      "web-share=()",
      "xr-spatial-tracking=()",
    ].join(", "),
  );

  if (!localPreview) {
    headers.set("Strict-Transport-Security", "max-age=31536000");
    headers.set(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "base-uri 'self'",
        "child-src 'none'",
        "connect-src 'self'",
        "font-src 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "frame-src 'none'",
        "img-src 'self' data:",
        "manifest-src 'self'",
        "media-src 'none'",
        "object-src 'none'",
        "script-src 'self' 'unsafe-inline'",
        "script-src-attr 'none'",
        "style-src 'self' 'unsafe-inline'",
        "worker-src 'none'",
        "upgrade-insecure-requests",
      ].join("; "),
    );
  }

  // Declare an accurate type for readable text, so a browser shows it instead of downloading it.
  // With nosniff set, an inaccurate Content-Type means a download, and privacy.txt,
  // security-policy.txt and the citation files are all linked as things to read.
  //
  // Honest caveat about where this actually takes effect: under the local dev server it does not.
  // That layer re-derives Content-Type from the file extension after the Worker returns, which is
  // the same override that forced the papers onto an extensionless route. Locally these still
  // arrive as application/octet-stream no matter what is set here. In production the header applies,
  // and public/_headers declares the same types as a second, independent guarantee.
  //
  // The ZIP is unaffected either way: neither extension matches, so it keeps its attachment
  // disposition.
  const path = url.pathname.toLowerCase();
  if (path.endsWith(".txt") || path.endsWith(".bib")) {
    headers.set("Content-Type", "text/plain; charset=utf-8");
  }

  const contentType = headers.get("content-type") ?? "";
  if (!response.ok) {
    headers.set("Cache-Control", "no-store");
  } else if (contentType.includes("text/html")) {
    headers.set("Cache-Control", "public, max-age=0, must-revalidate");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Visitor counting.
 *
 * Counts unique visits without retaining personal data. The client address is never stored: it is
 * combined with 32 random bytes generated per day and hashed with SHA-256, and only that digest is
 * written, with a 24-hour expiry. Because the salt is random rather than derived from anything
 * public, the digest cannot be reversed by hashing candidate addresses, and because it is replaced
 * daily, today's digests cannot be correlated with yesterday's. See dailySalt for the full reasoning
 * and the residual exposure.
 *
 * Recording happens on a GET so the Worker keeps accepting only GET and HEAD; no write method is
 * exposed. When no KV binding is present (local preview, or a host without KV) the endpoint reports
 * zero with live:false, rather than inventing a figure.
 *
 * KV is eventually consistent and the increment is a read-modify-write, so simultaneous first-time
 * visits can occasionally coalesce into one. For a personal site that is an acceptable trade against
 * the cost and complexity of a strongly consistent counter.
 */
/**
 * The counter starts at zero and only ever reports visits that actually happened.
 *
 * It used to seed from a decorative 13,581, so the first real visitor was displayed as 13,582 —
 * a real count stacked on top of an invented baseline, which is just a fake number that moves.
 * If there is nothing to report, it reports nothing.
 */
const NO_VISITS = 0;

/**
 * The per-day salt, and the reason it exists.
 *
 * An earlier version used the calendar date as the "salt". That is not a salt — it is public,
 * predictable input, so the stored digest was SHA-256("2026-07-29:1.2.3.4") and anyone holding the
 * stored keys could recover the addresses by hashing all 2^32 IPv4 candidates, which takes seconds.
 * The privacy notice's claim of an irreversible digest was false as written.
 *
 * This generates 32 random bytes per day instead, keeps them in the counting store, and never sends
 * them anywhere. Without the salt the digest cannot be reversed by brute force, because there is
 * nothing to guess. The residual exposure is honest and worth stating: anyone who can read the
 * counting store can read the salt too, so this protects a leak of the visit keys alone, not a full
 * compromise of the namespace.
 *
 * The 48-hour expiry is deliberately longer than the day the salt is used for, so a visit arriving
 * either side of midnight still finds the salt its digest was built with.
 */
async function dailySalt(store: KVNamespace, day: string): Promise<string> {
  const key = `salt:${day}`;
  const existing = await store.get(key);
  if (existing) return existing;
  const fresh = [...crypto.getRandomValues(new Uint8Array(32))]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  await store.put(key, fresh, { expirationTtl: 172_800 });
  return fresh;
}

async function dailyDigest(ip: string, salt: string, day: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${salt}:${day}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .slice(0, 16)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function recordVisit(request: Request, env: Env): Promise<Response> {
  // env itself is absent under some local runtimes, not merely the binding.
  const store = env?.VISITS;
  if (!store) {
    return Response.json({ count: NO_VISITS, live: false });
  }
  try {
    const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
    const day = new Date().toISOString().slice(0, 10);
    const key = `v:${await dailyDigest(ip, await dailySalt(store, day), day)}`;
    const seen = await store.get(key);
    let total = Number.parseInt((await store.get("total")) ?? "", 10);
    if (!Number.isFinite(total)) total = NO_VISITS;
    if (!seen) {
      // Read-modify-write on a single key, so simultaneous first-time visitors can both read the
      // same total and one increment is lost. KV is also eventually consistent, so a fresh visitor
      // may briefly read a stale figure. Both are accepted here: this is a visit counter, an
      // undercount of a few is harmless, and the alternative is a Durable Object for a number in
      // the page footer. Two writes per new visitor also bound usage against the free tier's
      // 1,000 writes per day — roughly 500 unique visitors before it stops incrementing.
      total += 1;
      await store.put(key, "1", { expirationTtl: 86_400 });
      await store.put("total", String(total));
    }
    return Response.json({ count: total, live: true });
  } catch {
    // Counting must never take the page down.
    return Response.json({ count: NO_VISITS, live: false });
  }
}

/**
 * Buddy's model-backed reply.
 *
 * The API key is read from a server-side binding only. It is never sent to the browser, never
 * placed in a NEXT_PUBLIC_ variable, and never logged. The request body is capped before parsing,
 * the conversation sent upstream is truncated, and the reply length is bounded. If no key is
 * configured the route reports that plainly and the page falls back to its offline guide.
 *
 * This is the only route accepting POST; every other path still rejects non-GET/HEAD.
 */
const BUDDY_MAX_BODY = 4_096;
const BUDDY_SYSTEM = [
  "You are Buddy, the research guide on Cooper E.'s personal site (handle: jcooperkai).",
  "Answer as a knowledgeable assistant about Cooper's work. Be concise, concrete and friendly.",
  "Never invent results, metrics, publications or affiliations. If you do not know, say so.",
  "",
  "Cooper's work:",
  "- HisokaOS: a 32-bit x86 operating system written from scratch in C and assembly. Boots on its",
  "  own kernel in QEMU to an interactive shell. Paging, GDT/IDT, remapped PIC, PIT, PS/2 keyboard",
  "  and mouse, VGA console, ATA disk, RTL8139 networking, RAM filesystem, preemptive task",
  "  switching, and 27 bundled applications including Tetris, Snake, 2048 and a text editor.",
  "- The Lazy Driver: an autonomous-driving perception stack over ordinary dashcam footage.",
  "  YOLO11m detection with cross-frame tracking and metric distances, YOLOPv2 drivable-surface and",
  "  lane segmentation, openpilot supercombo path prediction, monocular metric depth. The predicted",
  "  path is clamped to the segmented road.",
  "- Bill: a local-first conversational system. A local language model wrapped in durable memory,",
  "  retrieval, planning, grounding and verification. Paired with bill2, a from-scratch predictive",
  "  concept graph built without ML frameworks. Cooper is explicit that the fluent prose comes from",
  "  the local model, not from bill2.",
  "- Oneiro: a continuously running generative art system. A local model free-associates concepts",
  "  that train a from-scratch NumPy pixel-art generator online.",
  "- Busy Beaver research: an enumeration and decision pipeline that completely decides BB(2,2)=6,",
  "  BB(3,2)=21, BB(2,3)=38 and BB(4,2)=107, proving every machine halts or never halts. These",
  "  reproduce known values; Cooper claims no new Busy Beaver value.",
  "- Market microstructure: on 258,737 real minute bars, short-horizon direction was shown to be",
  "  unpredictable (AUC 0.5105). Cooper publishes negative results deliberately.",
  "- Constraint Collapse: a forced one-token Y/N answer from a language model agrees with that",
  "  model's own free-form answer only 0% of the time on preference questions vs 100% on checkable",
  "  facts -- driven by a fixed per-token prior, not conversational momentum.",
  "- Autocorrection Fidelity: when a model corrects a typo in isolation it fails 97% of the time by",
  "  confidently returning a different, correctly-spelled real word -- not by refusing. Sentence",
  "  context only helps once corruption is heavy enough to need it.",
  "- Causal-State Interpretability (v1.0): defines a network feature as a causal state, not a",
  "  direction in activation space -- two configurations are the same feature exactly when",
  "  intervening on either produces the same future behaviour. An unused signal that is 100%",
  "  readable from activations leaks 10,000x less into a causal description than a correlational",
  "  one. Also gives a method that recovers the exact number of a network's causal states on 15 of",
  "  15 unseen test systems without ever merging two different ones. Supersedes and subsumes",
  "  Cooper's earlier 'Decodability Is Not Mechanism' note, which is retired.",
  "- Red-teamed a small local LLM (minicpm-v4.6) across secret extraction, degenerate generation,",
  "  fuzzing and guardrail bypass; found an effectively absent safety wall (6/6 bypassed).",
  "- The Token Tax / Cheap Damage: tokenizers shatter unfamiliar text into fragments. A doubled",
  "  letter inflates token count 30.9%; Hindi costs 4x the tokens of the same English sentence;",
  "  deletion and insertion typos damage recoverability in opposite, non-obvious ways.",
  "- Webbify (webbify.build) is Cooper's new startup: AI-built small business websites.",
  "",
  "Cooper is at jcooperkai@gmail.com, on GitHub as jcooperkai-sys, and on X as @jcooperkai.",
  "Keep replies under about 130 words unless asked for more.",
].join("\n");

function readApiKey(env: Env): string {
  const fromBinding = env?.GROQ_API_KEY;
  if (fromBinding) return fromBinding;
  // Local preview convenience only; absent in the Workers runtime.
  const proc = (globalThis as { process?: { env?: Record<string, string> } }).process;
  return proc?.env?.GROQ_API_KEY ?? "";
}

async function buddyReply(request: Request, env: Env): Promise<Response> {
  const key = readApiKey(env);
  // The old "no Groq key configured" early-out moved below the Hermes attempt -- Hermes is now
  // the primary route and needs no Groq key at all. See the unconfigured check further down.
  // Refuse on the declared length before reading anything. Checking only after `text()` still
  // returns 413, but the body has been buffered in full by then — a 100 MB request (the platform
  // ceiling) was being held in memory purely to reject it. The post-read check below stays, because
  // Content-Length is absent on a chunked request and a client can understate it.
  const declared = Number(request.headers.get("Content-Length") ?? "");
  if (Number.isFinite(declared) && declared > BUDDY_MAX_BODY) {
    return Response.json({ ok: false, reason: "too_large" }, { status: 413 });
  }
  const raw = await request.text();
  if (raw.length > BUDDY_MAX_BODY) {
    return Response.json({ ok: false, reason: "too_large" }, { status: 413 });
  }
  let message = "";
  let history: { role: string; content: string }[] = [];
  try {
    const parsed = JSON.parse(raw) as {
      message?: unknown;
      history?: unknown;
    };
    message = typeof parsed.message === "string" ? parsed.message.slice(0, 1_500) : "";
    if (Array.isArray(parsed.history)) {
      history = parsed.history
        .slice(-6)
        .filter(
          (m): m is { role: string; content: string } =>
            typeof (m as { role?: unknown })?.role === "string" &&
            typeof (m as { content?: unknown })?.content === "string",
        )
        .map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.content.slice(0, 800) }));
    }
  } catch {
    return Response.json({ ok: false, reason: "bad_request" }, { status: 400 });
  }
  if (!message.trim()) {
    return Response.json({ ok: false, reason: "empty" }, { status: 400 });
  }

  const hermesToken = env?.LAB_BUDDY_TOKEN;
  if (hermesToken) {
    const hermes = await hermesReply(message, hermesToken);
    if (hermes) return Response.json({ ok: true, reply: hermes });
    // Falls through to Groq below rather than surfacing an error -- Hermes runs on Cooper's own
    // hardware through an unrelated project's API and can be offline for reasons that have
    // nothing to do with this site (a redeploy over there, the model unloaded, etc).
    console.error(JSON.stringify({ event: "hermes_unavailable_falling_back_to_groq" }));
  }

  if (!key) {
    return Response.json({ ok: false, reason: "unconfigured" }, { status: 503 });
  }
  try {
    const upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // llama-3.3-70b-versatile moved behind Groq's enterprise/contact-sales tier at some
        // point and now 404s for a standard key -- confirmed live via wrangler tail on
        // 2026-09-10, which is why Buddy silently fell back to the offline guide on every
        // request. This model is on Groq's regular production tier.
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: BUDDY_SYSTEM },
          ...history,
          { role: "user", content: message },
        ],
        temperature: 0.6,
        max_tokens: 320,
      }),
      // Without this a hung upstream connection holds the request open until the platform kills
      // it, burning wall-clock on every stalled call. 15s is well past a normal completion.
      signal: AbortSignal.timeout(15_000),
    });
    if (!upstream.ok) {
      // Status only. Upstream bodies can echo the request and must not be logged.
      console.error(JSON.stringify({ event: "buddy_upstream_error", status: upstream.status }));
      return Response.json({ ok: false, reason: "upstream" }, { status: 502 });
    }
    const data = (await upstream.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const reply = data.choices?.[0]?.message?.content?.trim() ?? "";
    if (!reply) return Response.json({ ok: false, reason: "empty_reply" }, { status: 502 });
    return Response.json({ ok: true, reply: reply.slice(0, 2_000) });
  } catch {
    console.error(JSON.stringify({ event: "buddy_request_failed" }));
    return Response.json({ ok: false, reason: "unavailable" }, { status: 502 });
  }
}

/**
 * Buddy's primary route: Cooper's own Hermes 3 8B, run on his hardware, reached through an
 * unrelated project's already-deployed API rather than standing up a second model. That route
 * (POST /v1/lab/buddy) carries a hardcoded system prompt on its own side -- BUDDY_SYSTEM above is
 * kept identical there by hand, since the two codebases are otherwise independent.
 *
 * Single-turn only (no history) to match that route's contract. Returns null on any failure so
 * the caller falls back to Groq instead of erroring.
 */
const HERMES_ENDPOINT = "https://api.webbify.build/v1/lab/buddy";

async function hermesReply(message: string, token: string): Promise<string | null> {
  try {
    const upstream = await fetch(HERMES_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
      // Hermes on local hardware is slower than a hosted API (cold load ~12s, ~13 tok/s), and
      // this request also crosses an extra hop through the other project's API -- generous but
      // still bounded so a stalled call doesn't hold this Worker's request open indefinitely.
      signal: AbortSignal.timeout(40_000),
    });
    if (!upstream.ok) {
      console.error(JSON.stringify({ event: "hermes_upstream_error", status: upstream.status }));
      return null;
    }
    const data = (await upstream.json()) as { ok?: boolean; reply?: string };
    const reply = data?.ok && typeof data.reply === "string" ? data.reply.trim() : "";
    return reply ? reply.slice(0, 2_000) : null;
  } catch {
    console.error(JSON.stringify({ event: "hermes_request_failed" }));
    return null;
  }
}

function textResponse(
  url: URL,
  body: string,
  status: number,
  extraHeaders: HeadersInit = {},
) {
  return applySecurityHeaders(
    new Response(body, {
      status,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "text/plain; charset=utf-8",
        ...extraHeaders,
      },
    }),
    url,
  );
}

const worker = {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    if (request.url.length > MAX_URL_LENGTH) {
      const fallbackUrl = new URL("https://invalid.local/");
      return textResponse(fallbackUrl, "Request URI too long.", 414);
    }

    let url: URL;
    try {
      url = new URL(request.url);
    } catch {
      return textResponse(
        new URL("https://invalid.local/"),
        "Invalid request URI.",
        400,
      );
    }

    let decodedPathname: string;
    try {
      decodedPathname = decodeURIComponent(url.pathname);
    } catch {
      return textResponse(url, "Invalid request path.", 400);
    }

    // Buddy's model route is the single exception to the read-only rule, and only for POST.
    // Every other path, and every other method on this path, is still refused.
    const isBuddyRoute = decodedPathname === "/api/buddy";
    if (isBuddyRoute && request.method === "POST") {
      if (await overLimit(env?.BUDDY_LIMIT, request, "buddy")) {
        return textResponse(url, "Too many requests. Try again shortly.", 429, {
          "Retry-After": "60",
        });
      }
      const replied = await buddyReply(request, env);
      return applySecurityHeaders(
        new Response(replied.body, {
          status: replied.status,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store",
          },
        }),
        url,
      );
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      return textResponse(url, "Method not allowed.", 405, {
        Allow: isBuddyRoute ? "POST" : "GET, HEAD",
      });
    }

    if (BLOCKED_SOURCE_PATH.test(decodedPathname)) {
      return textResponse(url, "Not found.", 404);
    }

    /**
     * HEAD on the routes below is answered without doing their work.
     *
     * HEAD is a legal method here and monitors and crawlers use it, but the HTTP layer discards the
     * body afterwards, so any work spent producing one is wasted. Two concrete consequences before
     * this existed: HEAD /api/paper/001 made the Worker fetch and buffer 196 KB per request purely
     * to throw it away, and HEAD /api/visits performed two KV writes — inflating the count and
     * spending the free tier's 1,000 daily writes on requests nobody was reading.
     *
     * The declared Content-Type is still accurate, which is the part of a HEAD response that
     * matters. Content-Length is omitted rather than guessed, since knowing it would mean doing
     * exactly the work this avoids.
     */
    if (request.method === "HEAD") {
      const headOnly = (type: string) =>
        applySecurityHeaders(
          new Response(null, {
            status: 200,
            headers: { "Content-Type": type, "Cache-Control": "no-store" },
          }),
          url,
        );
      if (decodedPathname === "/api/visits") {
        return headOnly("application/json; charset=utf-8");
      }
      const headPaper = /^\/api\/paper\/(\d{3})$/.exec(decodedPathname);
      if (headPaper) {
        return PAPER_NUMBERS.has(headPaper[1])
          ? headOnly("application/pdf")
          : textResponse(url, "Not found.", 404);
      }
      const headText = /^\/api\/experiment\/([a-z0-9-]+)$/.exec(decodedPathname);
      if (headText) {
        return READABLE_TEXT[headText[1]]
          ? headOnly("text/plain; charset=utf-8")
          : textResponse(url, "Not found.", 404);
      }
    }

    // This portfolio uses native local images. Closing the unused optimization
    // endpoint removes a resource-amplification and remote-fetch attack surface.
    if (
      decodedPathname === "/_vinext/image" ||
      decodedPathname === "/_next/image"
    ) {
      return textResponse(url, "Not found.", 404);
    }

    // Unique-visit counter. A GET, so the GET/HEAD-only rule above still holds and no write
    // method is exposed. Never cached, so each visit is actually seen.
    if (decodedPathname === "/api/visits") {
      if (await overLimit(env?.VISITS_LIMIT, request, "visits")) {
        return textResponse(url, "Too many requests. Try again shortly.", 429, {
          "Retry-After": "60",
        });
      }
      const counted = await recordVisit(request, env);
      return applySecurityHeaders(
        new Response(counted.body, {
          status: counted.status,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store",
          },
        }),
        url,
      );
    }

    // Papers are served through an extensionless route on purpose. The local dev server derives a
    // Content-Type from the file extension after the Worker returns, which overrode every header
    // set on /papers/001.pdf and made the browser download the file instead of opening it. With no
    // extension to derive from, the Content-Type set here survives, so VIEW PAPER opens in a tab.
    // Experiment scripts and their raw output, read in a tab for the same reason as the papers.
    const textMatch = /^\/api\/experiment\/([a-z0-9-]+)$/.exec(decodedPathname);
    if (textMatch) {
      if (await overLimit(env?.ASSET_LIMIT, request, "asset")) {
        return textResponse(url, "Too many requests. Try again shortly.", 429, {
          "Retry-After": "60",
        });
      }
      const assetPath = READABLE_TEXT[textMatch[1]];
      if (!assetPath) {
        return textResponse(url, "Not found.", 404);
      }
      const assetUrl = new URL(assetPath, url.origin);
      const asset = env?.ASSETS
        ? await env.ASSETS.fetch(new Request(assetUrl, { method: "GET" }))
        : await fetch(new Request(assetUrl, { method: "GET" }));
      if (!asset.ok) {
        return textResponse(url, "Not found.", 404);
      }
      return textResponse(url, await asset.text(), 200, {
        "Cache-Control": "public, max-age=3600, must-revalidate",
      });
    }

    const paperMatch = /^\/api\/paper\/(\d{3})$/.exec(decodedPathname);
    if (paperMatch) {
      if (!PAPER_NUMBERS.has(paperMatch[1])) {
        return textResponse(url, "Not found.", 404);
      }
      if (await overLimit(env?.ASSET_LIMIT, request, "asset")) {
        return textResponse(url, "Too many requests. Try again shortly.", 429, {
          "Retry-After": "60",
        });
      }
      const assetUrl = new URL(`/papers/${paperMatch[1]}.pdf`, url.origin);
      // env.ASSETS is the direct binding in production. It is absent under the local dev server,
      // whose handler returns an empty placeholder for static files and fills the body in
      // afterwards, so locally we re-request the file over the loopback origin instead.
      const asset = env?.ASSETS
        ? await env.ASSETS.fetch(new Request(assetUrl, { method: "GET" }))
        : await fetch(new Request(assetUrl, { method: "GET" }));
      if (!asset.ok) {
        return textResponse(url, "Not found.", 404);
      }
      // Buffered rather than streamed: passing the sub-request's body straight through yields an
      // empty response here, and a paper is a few hundred KB, so holding it is cheap.
      const bytes = await asset.arrayBuffer();
      return applySecurityHeaders(
        new Response(bytes, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": "inline",
            "Content-Length": String(bytes.byteLength),
            "Cache-Control": "public, max-age=3600, must-revalidate",
          },
        }),
        url,
      );
    }

    let response: Response;
    try {
      response = await handler.fetch(request, env, ctx);
    } catch {
      console.error(
        JSON.stringify({
          event: "site_handler_failure",
          pathname: url.pathname,
          cfRay: request.headers.get("cf-ray") ?? "unavailable",
        }),
      );
      return textResponse(url, "The site is temporarily unavailable.", 500);
    }

    const secured = applySecurityHeaders(response, url);
    if (request.method === "HEAD") {
      return new Response(null, {
        status: secured.status,
        statusText: secured.statusText,
        headers: secured.headers,
      });
    }

    return secured;
  },
};

export default worker;
