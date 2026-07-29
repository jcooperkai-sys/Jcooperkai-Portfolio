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
  assert.doesNotMatch(
    html,
    /guestbook-dialog|modal-backdrop|jc-panel|ascii-terminal|neural net/i,
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
