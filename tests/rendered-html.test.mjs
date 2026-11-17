import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import { register } from "node:module";
import test from "node:test";

// vinext 1.x's server bundle imports "cloudflare:workers", which only exists inside workerd. The
// worker never touches it on these code paths, so Node gets an empty module in its place.
register(
  "data:text/javascript," +
    encodeURIComponent(`export async function resolve(s, c, next) {
      if (s === "cloudflare:workers") return { url: "data:text/javascript,export const env = {};", shortCircuit: true };
      return next(s, c);
    }`),
);

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

test("server-renders the portfolio", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>jcooperkai, Agentic Engineer<\/title>/);
  assert.match(html, /Agentic Engineer/);
  for (const heading of ["Experience", "Projects", "All projects", "Other projects", "Skills", "Interests", "Gallery"]) {
    assert.match(html, new RegExp(`>${heading}<`), `missing section ${heading}`);
  }
  const order = ["Autonomous Drone Racing Policy", "GGUF Token Decoder", "HisokaOS"].map((n) => html.indexOf(n));
  assert.ok(order.every((n) => n > 0) && order[0] < order[1] && order[1] < order[2], "featured order");
  assert.match(html, /Florida, USA/);
  assert.match(html, /Head of Product &amp; Engineering/);
  assert.match(html, /Personal Agent Harness/);
  assert.doesNotMatch(html, /Ducky Studio|Editor Browser|App Installer|Transactional Relational|Live at webbify/);
  assert.match(html, /href="#gallery-drone"/);
  assert.match(html, /id="gallery-drone"/);
  assert.match(html, /href="\/resume"/);
  assert.match(html, /href="\/privacy"/);
  assert.match(html, /href="\/security-policy"/);
  assert.match(html, />Ask AI</);
  assert.match(html, /class="nav-toggle"[^>]*aria-expanded="false"[^>]*aria-controls="nav-list"/);
  assert.match(html, /aria-label="Open menu"/);
  assert.doesNotMatch(html, /San Diego/);
  assert.match(html, />GitHub activity</);
  assert.match(html, /© 2026 Cooper\. E/);
  assert.match(html, /See more projects on GitHub/);
  // Pinned projects are not repeated in the list under them.
  assert.equal(html.split('href="https://github.com/jcooperkai-sys/HisokaOS"').length - 1, 1);
  assert.match(html, /<meta property="og:image" content="https:\/\/jcooperkai\.com\/assets\/share\.png"/);
  assert.match(html, /<meta name="twitter:image" content="https:\/\/jcooperkai\.com\/assets\/share\.png"/);
  assert.match(html, /rel="icon" href="\/favicon\.ico\?v=2"/);
  assert.match(html, /rel="apple-touch-icon" href="\/assets\/apple-touch-icon\.png"/);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image"/);
  assert.match(html, /<meta name="description" content="jcooperkai is Cooper \(Jeffery Eckert\), an agentic engineer in Florida, USA\./);
  assert.match(html, /<meta property="og:description" content="jcooperkai is Cooper/);
  const ld = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  const person = ld["@graph"].find((node) => node["@type"] === "Person");
  assert.equal(person.name, "Jeffery Eckert");
  assert.deepEqual(person.worksFor.map((org) => org.name), ["Hyperlapse", "Webbify"]);
  assert.equal(person.address.addressRegion, "FL");
  assert.ok(ld["@graph"].some((node) => node["@type"] === "ProfilePage"));
  // Retired site content must never come back.
  assert.doesNotMatch(html, /Buddy|VISITOR COUNTER|AI Lab|Research Papers|\/api\/visits|\/api\/buddy/i);
  assert.doesNotMatch(html, /\[(?:YOUR|PLACE|ADD|REPLACE)\b/i);
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

  assert.ok(references.size >= 8, "expected a complete set of local artifacts");
  for (const file of ["share.png", "og.png", "apple-touch-icon.png", "icon.svg", "icon-512.png", "jc-avatar.png"]) {
    await access(new URL(`../public/assets/${file}`, import.meta.url));
  }
  const ico = await readFile(new URL("../public/favicon.ico", import.meta.url));
  assert.ok(ico.length > 2000 && ico.readUInt16LE(4) >= 3, "favicon.ico should carry several sizes of the current logo");
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

  const gallery = await readFile(new URL("../app/gallery.tsx", import.meta.url), "utf8");
  assert.match(page, /rel="noopener noreferrer"/);
  assert.match(page, /aria-label="Find me elsewhere"/);
  assert.match(gallery, /ArrowRight/);
  assert.match(gallery, /ArrowLeft/);
  assert.match(gallery, /aria-label="Next image"/);
  assert.doesNotMatch(gallery, /dangerouslySetInnerHTML|\beval\s*\(|javascript:/i);
  assert.doesNotMatch(page, /dangerouslySetInnerHTML|\beval\s*\(|href=\S*javascript:/i);
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
    "max-age=63072000; includeSubDomains",
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

  // The old site's Buddy, image-generation and visit-counter routes are gone.
  for (const route of ["/api/buddy", "/api/imagegen/start?prompt=x", "/api/imagegen/progress?job_id=" + "a".repeat(32), "/api/visits"]) {
    const gone = await render(`https://portfolio.example${route}`);
    assert.equal(gone.status, 404, `${route} should not exist`);
  }
  const buddyPost = await render("https://portfolio.example/api/buddy", { method: "POST", body: "{}" });
  assert.equal(buddyPost.status, 405);

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

  assert.match(privacy, /no requests to any third party/i);
  assert.doesNotMatch(privacy, /Buddy|visitor counter is decorative|digest/i);
  assert.match(security, /^Expires: \d{4}-\d{2}-\d{2}T/m);
  assert.ok(new Date(security.match(/^Expires: (.+)$/m)[1]) > new Date(), "security.txt has expired");
  assert.match(security, /^Policy: https:\/\/jcooperkai\.com\/security-policy\.txt$/m);
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

test("read-back routes are rate limited by the edge binding", async () => {
  // The limiter must be a binding, not a counter in the Worker: isolates do not share memory.
  const seenKeys = [];
  const env = {
    ASSETS: { fetch: async () => new Response("x", { status: 200 }) },
    ASSET_LIMIT: { limit: async ({ key }) => { seenKeys.push(key); return { success: false }; } },
  };
  const paper = await renderWithEnv("https://portfolio.example/api/paper/001", env, {
    headers: { "CF-Connecting-IP": "203.0.113.7", "X-Forwarded-For": "198.51.100.1" },
  });
  assert.equal(paper.status, 429);
  assert.equal(paper.headers.get("retry-after"), "60");
  // Keyed on the edge-set client address, never on a client-supplied forwarding header.
  assert.deepEqual(seenKeys, ["203.0.113.7"]);

  // Absent binding (local preview) must fail open rather than take the route down.
  const open = await renderWithEnv("https://portfolio.example/api/paper/001", { ASSETS: env.ASSETS });
  assert.equal(open.status, 200);
});

test("HEAD is answered without doing the route's work", async () => {
  // HEAD is legal here and monitors use it, but the HTTP layer discards the body, so any work
  // spent building one is wasted. Before this, HEAD /api/paper/001 buffered 196 KB per request.
  let assetReads = 0;
  const env = {
    ASSETS: {
      fetch: async () => {
        assetReads += 1;
        return new Response(new Uint8Array(4096), { status: 200 });
      },
    },
  };

  const paper = await renderWithEnv("https://portfolio.example/api/paper/001", env, { method: "HEAD" });
  assert.equal(paper.status, 200);
  assert.equal(paper.headers.get("content-type"), "application/pdf");
  assert.equal((await paper.arrayBuffer()).byteLength, 0);
  assert.equal(assetReads, 0, "HEAD must not read the asset");

  // HEAD must agree with GET about what exists, or a monitor reports a paper as present that GET
  // returns 404 for.
  for (const path of ["/api/paper/999", "/api/experiment/nope"]) {
    const get = await renderWithEnv(`https://portfolio.example${path}`, env);
    const head = await renderWithEnv(`https://portfolio.example${path}`, env, { method: "HEAD" });
    assert.equal(get.status, 404);
    assert.equal(head.status, get.status, `${path}: HEAD and GET disagree`);
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
  assert.deepEqual(limiters, ["ASSET_LIMIT"], "only the read-back limiter should be bound");
  assert.equal((generated.kv_namespaces ?? []).length, 0, "the visit counter's KV store is retired");

  // The worker name is also the first label of its workers.dev hostname, so renaming it changes the
  // public URL. Pinned here so a rename is a deliberate edit rather than a surprise.
  assert.equal(generated.name, "www");
});

test("llms.txt files describe the current site", async () => {
  const [brief, full] = await Promise.all([
    readFile(new URL("../public/llms.txt", import.meta.url), "utf8"),
    readFile(new URL("../public/llms-full.txt", import.meta.url), "utf8"),
  ]);
  for (const [name, text] of [["llms.txt", brief], ["llms-full.txt", full]]) {
    assert.match(text, /jcooperkai/, `${name}: missing the handle`);
    assert.match(text, /Agentic Engineer|agentic engineer/, `${name}: missing the role`);
    for (const project of ["GGUF Token Decoder", "Sentinel", "HisokaOS", "Wingwall Neural World", "Hyperlapse"]) {
      assert.ok(text.includes(project), `${name}: missing ${project}`);
    }
    assert.doesNotMatch(text, /Buddy|AI Lab|visitor|—/, `${name}: carries retired content or an em dash`);
  }
  assert.ok(full.length > brief.length * 1.5, "llms-full.txt should be substantially longer than llms.txt");

  // robots.txt should point at them, or nothing will find them.
  const robots = await readFile(new URL("../public/robots.txt", import.meta.url), "utf8");
  assert.match(robots, /llms\.txt/);
  assert.match(robots, /llms-full\.txt/);
});

test("favicons have transparent corners so browsers don't add a light plate behind them", async () => {
  const { default: sharp } = await import("sharp");
  for (const size of [48, 96, 192]) {
    const { data, info } = await sharp(new URL(`../public/assets/favicon-${size}.png`, import.meta.url).pathname)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    assert.equal(info.width, size);
    for (const [x, y] of [[0, 0], [size - 1, 0], [0, size - 1], [size - 1, size - 1]]) {
      assert.equal(data[(y * size + x) * 4 + 3], 0, `favicon-${size}.png corner (${x},${y}) is not transparent`);
    }
  }
});

function contributionsFixture(counts) {
  const start = Date.UTC(2025, 10, 16);
  let cells = "";
  let tips = "";
  counts.forEach((count, i) => {
    const date = new Date(start + i * 86_400_000).toISOString().slice(0, 10);
    const level = count === 0 ? 0 : Math.min(4, count);
    cells += `<td tabindex="0" data-ix="${i}" style="width: 10px" data-date="${date}" id="day-${i}" data-level="${level}" role="gridcell" class="ContributionCalendar-day"></td>`;
    tips += `<tool-tip id="tip-${i}" for="day-${i}" popover="manual" class="sr-only">${count === 0 ? "No contributions" : `${count} contribution${count === 1 ? "" : "s"}`} on a day.</tool-tip>`;
  });
  return `<table><tbody><tr>${cells}</tr></tbody></table>${tips}`;
}

test("the GitHub activity route reads the public calendar and survives upstream failure", async (t) => {
  const counts = Array.from({ length: 364 }, () => 0);
  counts[10] = 2;
  counts[11] = 5;
  counts[12] = 1;
  counts[200] = 9;
  counts[362] = 3;
  counts[363] = 0;

  const realFetch = globalThis.fetch;
  const upstream = [];
  let mode = "down";
  globalThis.fetch = async (input, init) => {
    upstream.push({ url: String(input), redirect: init?.redirect });
    if (mode === "down") throw new Error("connect failed");
    if (mode === "garbage") return new Response("<html>signed out</html>", { status: 200 });
    return new Response(contributionsFixture(counts), { status: 200 });
  };
  t.after(() => {
    globalThis.fetch = realFetch;
  });
  t.mock.timers.enable({ apis: ["Date"], now: Date.UTC(2026, 10, 16, 12) });

  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `github-${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const call = (env = {}, init = {}) =>
    worker.fetch(new Request("https://portfolio.example/api/github?user=someone-else", init), env, {
      waitUntil() {},
      passThroughOnException() {},
    });

  const down = await call();
  assert.equal(down.status, 502);
  assert.equal(down.headers.get("cache-control"), "no-store");
  assert.deepEqual(await down.json(), { error: "github_unavailable" });

  mode = "garbage";
  assert.equal((await call()).status, 502, "a page with no calendar is a failure, not an empty year");

  mode = "up";
  const ok = await call();
  assert.equal(ok.status, 200);
  assert.match(ok.headers.get("content-type") ?? "", /^application\/json/);
  assert.equal(ok.headers.get("cache-control"), "public, max-age=60, stale-while-revalidate=600");
  assert.equal(ok.headers.get("x-content-type-options"), "nosniff");
  const body = await ok.json();
  assert.equal(body.user, "jcooperkai-sys");
  assert.equal(body.total, 20);
  assert.equal(body.activeDays, 5);
  assert.deepEqual(body.bestDay, { date: "2026-06-04", count: 9 });
  assert.equal(body.longestStreak, 3);
  assert.equal(body.currentStreak, 1);
  assert.equal(body.days.length, 364);
  assert.deepEqual(body.days[11], ["2025-11-27", 5, 4]);
  assert.equal(body.stale, false);

  // The upstream address is fixed: nothing in the request can point it elsewhere, and redirects are not followed.
  assert.ok(upstream.every((u) => u.url === "https://github.com/users/jcooperkai-sys/contributions"));
  assert.ok(upstream.every((u) => u.redirect === "manual"));

  const before = upstream.length;
  mode = "down";
  const cached = await call();
  assert.equal(cached.status, 200);
  assert.equal(upstream.length, before, "a fresh copy is served without asking GitHub again");

  t.mock.timers.tick(121_000);
  const stale = await call();
  assert.equal(stale.status, 200);
  assert.equal(upstream.length, before + 1);
  assert.equal(stale.headers.get("cache-control"), "no-store");
  assert.equal((await stale.json()).stale, true);

  const limited = await call({ ASSET_LIMIT: { limit: async () => ({ success: false }) } });
  assert.equal(limited.status, 429);

  const head = await call({}, { method: "HEAD" });
  assert.equal(head.status, 200);
  assert.equal((await head.arrayBuffer()).byteLength, 0);
  assert.equal(upstream.length, before + 1, "HEAD must not call GitHub");

  const post = await call({}, { method: "POST" });
  assert.equal(post.status, 405);
});

test("policy and resume pages render as pages", async () => {
  for (const [path, heading] of [
    ["/privacy", "Privacy and local files"],
    ["/security-policy", "Responsible disclosure"],
    ["/resume", "Jeffery Eckert"],
  ]) {
    const response = await render(`http://localhost${path}`);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.ok(html.includes(heading), `${path}: missing ${heading}`);
    assert.match(html, /href="\/"/, `${path}: no way back home`);
  }
  await access(new URL("../public/assets/Jeffery-Eckert-Resume.pdf", import.meta.url));
});

test("every gallery file named in the page exists", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const files = [...page.matchAll(/"(\/assets\/gallery\/[^"]+)"/g)].map((m) => m[1]);
  assert.ok(files.length >= 40, "expected the full gallery");
  await Promise.all(files.map((file) => access(new URL(`../public${file}`, import.meta.url))));
});

test("video is allowed only from this site", async () => {
  const response = await render("https://jcooperkai.com/");
  assert.match(response.headers.get("content-security-policy") ?? "", /media-src 'self'/);
});

test("files from earlier versions of the site are kept out of search indexes", async () => {
  const env = { ASSETS: { fetch: async () => new Response("x", { status: 200 }) } };
  for (const path of ["/api/paper/001", "/api/experiment/results"]) {
    const response = await renderWithEnv(`https://jcooperkai.com${path}`, env);
    assert.equal(response.headers.get("x-robots-tag"), "noindex, noarchive, noimageindex", path);
  }
  const home = await render("https://jcooperkai.com/");
  assert.equal(home.headers.get("x-robots-tag"), null, "the current page must stay indexable");
  const mirror = await render("https://www.jcooperkai.workers.dev/");
  assert.equal(mirror.headers.get("x-robots-tag"), "noindex, noarchive, noimageindex", "the workers.dev mirror must not compete with the real domain");

  const headers = await readFile(new URL("../public/_headers", import.meta.url), "utf8");
  for (const path of ["/downloads/*", "/papers/*", "/assets/buttons/*", "/assets/profile/*"]) {
    assert.match(headers, new RegExp(`^${path.replace(/[/*]/g, "\\$&")}\\n  X-Robots-Tag: noindex`, "m"), path);
  }
});
