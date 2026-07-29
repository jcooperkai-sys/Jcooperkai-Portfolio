/** Cloudflare Worker entry point for Cooper E.'s AI Lab. */
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

const MAX_URL_LENGTH = 4_096;

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

    // This portfolio uses native local images. Closing the unused optimization
    // endpoint removes a resource-amplification and remote-fetch attack surface.
    if (
      decodedPathname === "/_vinext/image" ||
      decodedPathname === "/_next/image"
    ) {
      return textResponse(url, "Not found.", 404);
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
