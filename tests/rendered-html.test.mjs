import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

async function render(url = "http://localhost/", init = {}) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const headers = new Headers(init.headers);
  if (!headers.has("accept")) headers.set("accept", "text/html");

  return worker.fetch(
    new Request(url, { ...init, headers }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the complete AI research portfolio", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /COOPER E\./);
  assert.match(html, /Research Papers/);
  assert.match(html, /Experiments &amp; Projects/);
  assert.match(html, /Download My Work/);
  assert.match(html, /Talk to Buddy/);
  assert.match(html, /Contact \/ Collaborate/);
  assert.match(html, /© 1996 jcooperkai/i);
  assert.doesNotMatch(html, /\[(?:YOUR|PLACE|ADD|REPLACE)\b/i);
  // Retired artwork and UI must never come back. Each term targets a class name, id, or asset
  // filename — the hyphenated form these are always written in. "neural-net" therefore still
  // blocks the rejected neural-network/computer scene assets (e.g. "neural-net-scene.png",
  // class="neural-net-bg") while allowing the ordinary English phrase "neural networks" in copy.
  assert.doesNotMatch(
    html,
    /guestbook-dialog|modal-backdrop|jc-panel|ascii-terminal|neural-net/i,
  );
});

test("all authored local assets and downloadable files exist", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  const references = new Set(
    [...`${page}\n${css}`.matchAll(/["'(](\/(?:assets|downloads)\/[^"'()]+)["')]/g)].map(
      (match) => match[1],
    ),
  );

  assert.ok(references.size >= 35, "expected a complete set of local artifacts");
  await Promise.all(
    [...references].map((path) =>
      access(new URL(`../public${path}`, import.meta.url)),
    ),
  );

  const zip = await readFile(
    new URL("../public/downloads/selected-work.zip", import.meta.url),
  );
  assert.equal(zip.subarray(0, 2).toString("ascii"), "PK");
});

test("interactive controls retain accessible names and safe external links", async () => {
  const page = await readFile(
    new URL("../app/page.tsx", import.meta.url),
    "utf8",
  );

  assert.match(page, /aria-pressed=\{secretMode\}/);
  assert.match(page, /aria-pressed=\{motionPaused\}/);
  assert.match(page, /handleBuddyFile/);
  assert.match(page, /FILES STAY LOCAL TO THIS BROWSER/);
  assert.match(page, /rel="noopener noreferrer"/);
  assert.match(page, /target="_blank"/);
  assert.match(page, /download\s+href=/);
  assert.match(page, /onClick=\{\(\) => window\.print\(\)\}/);
  assert.doesNotMatch(page, /dangerouslySetInnerHTML|\beval\s*\(|javascript:/i);
});

test("production responses include defensive browser headers", async () => {
  const response = await render("https://portfolio.example/");
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.equal(
    response.headers.get("referrer-policy"),
    "strict-origin-when-cross-origin",
  );
  const csp = response.headers.get("content-security-policy") ?? "";
  assert.match(csp, /default-src 'self'/);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.match(csp, /object-src 'none'/);
  assert.match(csp, /worker-src 'none'/);
  assert.match(csp, /upgrade-insecure-requests/);
  assert.equal(
    response.headers.get("strict-transport-security"),
    "max-age=31536000",
  );
  assert.equal(response.headers.get("cross-origin-opener-policy"), "same-origin");
  assert.equal(
    response.headers.get("cross-origin-resource-policy"),
    "same-origin",
  );
  assert.equal(response.headers.get("x-powered-by"), null);
  assert.equal(response.headers.get("server"), null);
});

test("worker closes unused and unsafe request surfaces", async () => {
  for (const method of ["POST", "PUT", "PATCH", "DELETE", "OPTIONS"]) {
    const response = await render("https://portfolio.example/", { method });
    assert.equal(response.status, 405, `${method} should be rejected`);
    assert.equal(response.headers.get("allow"), "GET, HEAD");
    assert.equal(response.headers.get("cache-control"), "no-store");
  }

  const head = await render("https://portfolio.example/", { method: "HEAD" });
  assert.equal(head.status, 200);
  assert.equal((await head.arrayBuffer()).byteLength, 0);

  for (const route of ["/_vinext/image", "/_next/image"]) {
    const imageProxy = await render(
      `https://portfolio.example${route}?url=http://169.254.169.254/latest/meta-data/`,
    );
    assert.equal(imageProxy.status, 404);
  }

  const sourcePath = await render("https://portfolio.example/.openai/hosting.json");
  assert.equal(sourcePath.status, 404);

  const encodedSourcePath = await render(
    "https://portfolio.example/app%2Fpage.tsx",
  );
  assert.equal(encodedSourcePath.status, 404);

  const malformedPath = await render("https://portfolio.example/%E0%A4%A");
  assert.equal(malformedPath.status, 400);

  const injection = await render(
    "https://portfolio.example/?q=%3C%2Fscript%3E%3Cscript%3Ealert(1)%3C%2Fscript%3E",
  );
  assert.equal(injection.status, 200);
  assert.doesNotMatch(
    await injection.text(),
    /<\/script><script>alert\(1\)<\/script>/i,
  );

  const longUri = await render(
    `https://portfolio.example/?q=${"a".repeat(4_100)}`,
  );
  assert.equal(longUri.status, 414);
});

test("build metadata and release tree are safe to upload", async () => {
  const [sourceHosting, builtHosting, assetsIgnore, profileFiles] =
    await Promise.all([
      readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
      readFile(new URL("../dist/.openai/hosting.json", import.meta.url), "utf8"),
      readFile(new URL("../dist/client/.assetsignore", import.meta.url), "utf8"),
      readdir(new URL("../dist/client/assets/profile/", import.meta.url)),
    ]);

  assert.deepEqual(JSON.parse(builtHosting), JSON.parse(sourceHosting));
  assert.match(assetsIgnore, /^\.vite\/$/m);
  assert.deepEqual(profileFiles, ["rocket-pixel.png"]);

  const tree = await readdir(new URL("../dist/client/", import.meta.url), {
    recursive: true,
  });
  assert.equal(tree.some((path) => path.endsWith(".map")), false);
  assert.equal(
    tree.some((path) =>
      /(?:^|[/_-])(?:face|voxel|minecraft|age-\d+)(?:[/_.-]|$)/i.test(path),
    ),
    false,
  );

  const textFiles = tree.filter((path) =>
    /\.(?:css|html|js|json|txt|xml)$/i.test(path),
  );
  for (const path of textFiles) {
    const contents = await readFile(
      new URL(`../dist/client/${path}`, import.meta.url),
      "utf8",
    );
    assert.doesNotMatch(contents, /\/Users\/|art_v1_|-----BEGIN [A-Z ]+PRIVATE KEY-----/);
  }
});

test("privacy and responsible-disclosure files are present", async () => {
  const [privacy, security, robots] = await Promise.all([
    readFile(new URL("../public/privacy.txt", import.meta.url), "utf8"),
    readFile(
      new URL("../public/.well-known/security.txt", import.meta.url),
      "utf8",
    ),
    readFile(new URL("../public/robots.txt", import.meta.url), "utf8"),
  ]);

  assert.match(privacy, /not transmitted to or stored by this\s+website/i);
  assert.match(security, /Contact: mailto:jcooperkai@gmail\.com/);
  assert.match(robots, /Sitemap: https:\/\/jcooperkai\.com\/sitemap\.xml/);
});

/** Like render(), but with a caller-supplied env so bindings can be exercised. */
async function renderWithEnv(url, env, init = {}) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${Math.random()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(url, init), env, {
    waitUntil() {},
    passThroughOnException() {},
  });
}

test("papers are served for reading, not downloading", async () => {
  // A PDF served with the extension in the URL is retyped as application/octet-stream by the
  // hosting layer, and nosniff then forces a download. The extensionless route exists so the
  // Content-Type set by the Worker survives and the browser opens the file in a tab.
  const pdf = Uint8Array.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);
  const requested = [];
  const env = {
    ASSETS: {
      fetch: async (request) => {
        requested.push(new URL(request.url).pathname);
        return new Response(pdf, { status: 200 });
      },
    },
  };

  const paper = await renderWithEnv("https://portfolio.example/api/paper/002", env);
  assert.equal(paper.status, 200);
  assert.equal(paper.headers.get("content-type"), "application/pdf");
  assert.equal(paper.headers.get("content-disposition"), "inline");
  assert.deepEqual(requested, ["/papers/002.pdf"]);
  // The body must actually arrive: streaming the sub-request through produced zero bytes.
  assert.equal((await paper.arrayBuffer()).byteLength, pdf.byteLength);

  // Only the three published papers resolve, and the id cannot be used to reach other assets.
  for (const path of ["/api/paper/9", "/api/paper/abc", "/api/paper/../worker/index.ts"]) {
    const rejected = await renderWithEnv(`https://portfolio.example${path}`, env);
    assert.notEqual(rejected.status, 200);
  }
});

test("metered routes are rate limited by the edge binding", async () => {
  // The limiter must be a binding, not a counter in the Worker: isolates do not share memory.
  // These assertions prove the binding is consulted and that a refusal is honoured.
  const seenKeys = [];
  const denying = {
    limit: async ({ key }) => {
      seenKeys.push(key);
      return { success: false };
    },
  };
  const env = {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    BUDDY_LIMIT: denying,
    VISITS_LIMIT: denying,
  };

  const buddy = await renderWithEnv("https://portfolio.example/api/buddy", env, {
    method: "POST",
    headers: { "Content-Type": "application/json", "CF-Connecting-IP": "203.0.113.7" },
    body: JSON.stringify({ message: "hello" }),
  });
  assert.equal(buddy.status, 429);
  assert.equal(buddy.headers.get("retry-after"), "60");

  const visits = await renderWithEnv("https://portfolio.example/api/visits", env, {
    headers: { "CF-Connecting-IP": "203.0.113.7" },
  });
  assert.equal(visits.status, 429);

  // Keyed on the edge-set client address, never on a client-supplied forwarding header.
  assert.deepEqual(seenKeys, ["203.0.113.7", "203.0.113.7"]);

  // Absent binding (local preview) must fail open rather than take the route down.
  const open = await renderWithEnv("https://portfolio.example/api/visits", {
    ASSETS: env.ASSETS,
  });
  assert.equal(open.status, 200);
});

test("HEAD is answered without doing the route's work", async () => {
  // HEAD is legal here and monitors use it, but the HTTP layer discards the body, so any work
  // spent building one is wasted. Before this, HEAD /api/paper/001 buffered 196 KB per request and
  // HEAD /api/visits performed two KV writes — inflating the count and spending the free tier's
  // daily write budget on requests nobody read.
  let assetReads = 0;
  const kvWrites = [];
  const env = {
    ASSETS: {
      fetch: async () => {
        assetReads += 1;
        return new Response(new Uint8Array(4096), { status: 200 });
      },
    },
    VISITS: { get: async () => null, put: async (k) => { kvWrites.push(k); } },
  };

  const paper = await renderWithEnv("https://portfolio.example/api/paper/001", env, { method: "HEAD" });
  assert.equal(paper.status, 200);
  assert.equal(paper.headers.get("content-type"), "application/pdf");
  assert.equal((await paper.arrayBuffer()).byteLength, 0);
  assert.equal(assetReads, 0, "HEAD must not read the asset");

  const visits = await renderWithEnv("https://portfolio.example/api/visits", env, { method: "HEAD" });
  assert.equal(visits.status, 200);
  assert.deepEqual(kvWrites, [], "HEAD must not write to KV");

  // HEAD must agree with GET about what exists, or a monitor reports a paper as present that GET
  // returns 404 for.
  for (const path of ["/api/paper/999", "/api/experiment/nope"]) {
    const get = await renderWithEnv(`https://portfolio.example${path}`, env);
    const head = await renderWithEnv(`https://portfolio.example${path}`, env, { method: "HEAD" });
    assert.equal(get.status, 404);
    assert.equal(head.status, get.status, `${path}: HEAD and GET disagree`);
  }
});

test("the stored visit digest cannot be recomputed from public information", async () => {
  // The earlier implementation used the calendar date as its "salt", so the stored key was
  // SHA-256("YYYY-MM-DD:<ip>") — recoverable by hashing 2^32 candidates, which takes seconds. The
  // privacy notice's claim of an irreversible digest was false as written. A random per-day salt
  // makes it true: there is no longer anything to guess.
  const ip = "203.0.113.7";
  const day = new Date().toISOString().slice(0, 10);
  const store = new Map();
  const written = [];
  const env = {
    ASSETS: { fetch: async () => new Response("", { status: 404 }) },
    VISITS: {
      get: async (k) => store.get(k) ?? null,
      put: async (k, v) => { written.push(k); store.set(k, v); },
    },
  };

  const res = await renderWithEnv("https://portfolio.example/api/visits", env, {
    headers: { "CF-Connecting-IP": ip },
  });
  assert.equal(res.status, 200);

  const storedKey = written.find((k) => k.startsWith("v:"));
  assert.ok(storedKey, "a visit key should have been written");

  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${day}:${ip}`),
  );
  const publicGuess =
    "v:" +
    [...new Uint8Array(digest)]
      .slice(0, 16)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  assert.notEqual(storedKey, publicGuess, "digest is brute-forceable from date and address alone");

  // The salt must be real randomness kept server-side, and never part of the response.
  const salt = store.get(`salt:${day}`);
  assert.equal(typeof salt, "string");
  assert.equal(salt.length, 64, "expected 32 random bytes as hex");
  assert.doesNotMatch(await res.text(), new RegExp(salt), "the salt must never reach the client");

  // The address itself must never be stored, under any key.
  for (const [k, v] of store) {
    assert.doesNotMatch(k, /203\.0\.113\.7/, `address leaked into key ${k}`);
    assert.doesNotMatch(String(v), /203\.0\.113\.7/, `address leaked into value at ${k}`);
  }
});

test("the generated deploy config declares each binding exactly once", async () => {
  // Bindings are declared in wrangler.jsonc; vite.config.ts must not repeat them. When both files
  // listed them, every rate limiter appeared twice in the generated config. This asserts on the
  // build output rather than either source, so drift between the two is caught wherever it starts.
  const generated = JSON.parse(
    await readFile(new URL("../dist/server/wrangler.json", import.meta.url), "utf8"),
  );

  for (const field of ["ratelimits", "kv_namespaces", "d1_databases", "r2_buckets"]) {
    const names = (generated[field] ?? []).map((b) => b.name ?? b.binding);
    assert.deepEqual(
      names,
      [...new Set(names)],
      `${field} contains a duplicate binding: ${names.join(", ")}`,
    );
  }

  // The limiters the worker consults must actually be present, or production silently has no
  // limits — the exact failure that shipped once already.
  const limiters = (generated.ratelimits ?? []).map((b) => b.name);
  for (const required of ["BUDDY_LIMIT", "VISITS_LIMIT", "ASSET_LIMIT"]) {
    assert.ok(limiters.includes(required), `${required} is missing from the deploy config`);
  }

  // The worker name is also the first label of its workers.dev hostname, so renaming it changes the
  // public URL. Pinned here so a rename is a deliberate edit rather than a surprise.
  assert.equal(generated.name, "www");
});
