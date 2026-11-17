/** Cloudflare Worker entry point for jcooperkai.com. */
import handler from "vinext/server/app-router-entry";
import { loadActivity } from "./github";

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
  /** 120 requests per minute per client, for the buffered read-back routes. */
  ASSET_LIMIT?: RateLimiter;
}

/**
 * The rate-limit key. CF-Connecting-IP is set by the edge and cannot be spoofed by the client;
 * anything client-supplied (X-Forwarded-For) would make the limit trivially bypassable. The IP is
 * used transiently for this decision and never stored.
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
  // unlimited route would go unnoticed. `wrangler tail` now shows which case occurred. No
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
  "001", "002", "003", "004", "005", "006", "008", "009", "010", "011", "012",
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

const RETIRED_PATH =
  /^\/(?:downloads|papers|badges|api\/paper|api\/experiment|assets\/(?:buttons|badges|profile))(?:\/|$)|^\/assets\/(?:fire-strip|jc-wordmark)\.png$/i;

function applySecurityHeaders(response: Response, url: URL) {
  const headers = new Headers(response.headers);
  const localPreview = isLocalPreview(url);

  if (RETIRED_PATH.test(url.pathname) || url.hostname.endsWith(".workers.dev")) {
    headers.set("X-Robots-Tag", "noindex, noarchive, noimageindex");
  }

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
    headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains");
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
        "media-src 'self'",
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
    headers.set("Cache-Control", "public, max-age=300, stale-while-revalidate=86400");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
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

    if (request.method !== "GET" && request.method !== "HEAD") {
      return textResponse(url, "Method not allowed.", 405, {
        Allow: "GET, HEAD",
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
     * to throw it away, which was pure waste.
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
      const headPaper = /^\/api\/paper\/(\d{3})$/.exec(decodedPathname);
      if (headPaper) {
        return PAPER_NUMBERS.has(headPaper[1])
          ? headOnly("application/pdf")
          : textResponse(url, "Not found.", 404);
      }
      if (decodedPathname === "/api/github") {
        return headOnly("application/json; charset=utf-8");
      }
      const headText = /^\/api\/experiment\/([a-z0-9-]+)$/.exec(decodedPathname);
      if (headText) {
        return READABLE_TEXT[headText[1]]
          ? headOnly("text/plain; charset=utf-8")
          : textResponse(url, "Not found.", 404);
      }
    }

    if (decodedPathname === "/api/github") {
      if (await overLimit(env?.ASSET_LIMIT, request, "github")) {
        return textResponse(url, "Too many requests. Try again shortly.", 429, {
          "Retry-After": "60",
        });
      }
      const loaded = await loadActivity();
      if (!loaded) {
        return applySecurityHeaders(
          new Response(JSON.stringify({ error: "github_unavailable" }), {
            status: 502,
            headers: { "Content-Type": "application/json; charset=utf-8" },
          }),
          url,
        );
      }
      return applySecurityHeaders(
        new Response(JSON.stringify({ ...loaded.activity, stale: loaded.stale }), {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": loaded.stale ? "no-store" : "public, max-age=60, stale-while-revalidate=600",
          },
        }),
        url,
      );
    }

    // This portfolio uses native local images. Closing the unused optimization
    // endpoint removes a resource-amplification and remote-fetch attack surface.
    if (
      decodedPathname === "/_vinext/image" ||
      decodedPathname === "/_next/image"
    ) {
      return textResponse(url, "Not found.", 404);
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
