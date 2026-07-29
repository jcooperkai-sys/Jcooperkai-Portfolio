import vinext from "vinext";
import { defineConfig } from "vite";
import hostingConfig from "./.openai/hosting.json";
import { sites } from "./build/sites-vite-plugin";

const SITE_CREATOR_PLACEHOLDER_DATABASE_ID =
  "00000000-0000-4000-8000-000000000000";

const { d1, r2 } = hostingConfig;

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";

// The unique-visit counter's KV namespace. The id is an account resource, so it is supplied by
// the environment at build time rather than committed. Without it the binding is simply absent and
// the counter reports the decorative figure with `live: false` — see VISITS-SETUP.md.
const visitsNamespaceId = process.env.CF_KV_VISITS_ID;

// Both routes that do work per request are limited at the edge. These are Cloudflare Rate Limiting
// bindings, not in-Worker counters: isolates do not share memory, so a counter in this process
// would not limit anything (SECURITY.md is explicit about that). namespace_id is a local label
// chosen here, not an account resource, so this is complete as written.
const rateLimitBindings = [
  {
    name: "BUDDY_LIMIT",
    namespace_id: "1001",
    // Buddy calls a metered third-party model. An unlimited route lets one client exhaust the
    // free-tier quota and take Buddy down for every visitor.
    simple: { limit: 10, period: 60 as const },
  },
  {
    name: "VISITS_LIMIT",
    namespace_id: "1002",
    // Bounds KV write amplification against the free tier's 1,000 writes per day.
    simple: { limit: 60, period: 60 as const },
  },
];

const localBindingConfig = {
  main: "./worker/index.ts",
  compatibility_flags: ["nodejs_compat"],
  ratelimits: rateLimitBindings,
  kv_namespaces: visitsNamespaceId
    ? [{ binding: "VISITS", id: visitsNamespaceId }]
    : [],
  d1_databases: d1
    ? [
        {
          binding: d1,
          database_name: "site-creator-d1",
          database_id: SITE_CREATOR_PLACEHOLDER_DATABASE_ID,
        },
      ]
    : [],
  r2_buckets: r2
    ? [
        {
          binding: r2,
          bucket_name: "site-creator-r2",
        },
      ]
    : [],
};

export default defineConfig(async () => {
  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    server: isCodexSeatbeltSandbox
      ? { watch: { useFsEvents: false, usePolling: true } }
      : undefined,
    plugins: [
      vinext(),
      sites(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        config: localBindingConfig,
      }),
    ],
  };
});
