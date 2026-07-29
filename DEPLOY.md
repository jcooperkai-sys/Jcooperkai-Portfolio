# Deployment checklist

Nothing here is deployed. The site runs locally only. This file records the steps required
before `jcooperkai.com` is connected, and must be completed in order.

## 1. Secrets

Buddy's model route reads `GROQ_API_KEY` from a server-side binding. The key is never in the
repository, never in client code, and never in a `NEXT_PUBLIC_` variable — verified: zero
occurrences in `dist/client`, `dist/server`, the served HTML, and the source tree.

Local preview reads it from `.dev.vars`, which is gitignored and mode 600:

```bash
./run-local.sh          # loads .dev.vars, starts on 3001
```

Production requires it as a Cloudflare secret. This is an account operation and must be run by
the owner:

```bash
npx wrangler secret put GROQ_API_KEY
```

Secrets are write-only once set; they cannot be read back from the dashboard. If the key is ever
pasted into a chat, a log, a commit, or a screenshot, rotate it at console.groq.com and set it
again.

## 2. Rate limiting — done in code

Both routes that do work per request are limited by a Cloudflare Rate Limiting binding, declared
in `vite.config.ts` and enforced in `worker/index.ts`. No dashboard step is required.

| Route | Method | Limit | Risk it closes |
|---|---|---|---|
| `/api/buddy` | POST | 10 / min / IP | exhausts the Groq free-tier quota; Buddy stops answering for everyone |
| `/api/visits` | GET | 60 / min / IP | KV write amplification against the 1,000/day free tier |

Refusals return 429 with `Retry-After: 60`. The key is `CF-Connecting-IP`, which the edge sets and
a client cannot spoof; using a client-supplied header such as `X-Forwarded-For` would make the
limit trivially bypassable. The address is used for that decision only and is never stored.

The binding fails open if it errors or is absent, so a limiter fault cannot take the route down.
Absent is the local dev server only — production always has both.

This is deliberately not an in-Worker counter. Isolates do not share memory, so a counter in that
process would not limit anything. SECURITY.md is explicit about this.

A WAF rate-limiting rule may still be layered on top, but is no longer a launch blocker.

## 3. Visitor counting (optional, free)

```bash
npx wrangler kv namespace create VISITS
```

Then uncomment the `kv_namespaces` block at the bottom of `wrangler.jsonc`, paste the id in, and
redeploy. wrangler.jsonc is the single source of truth for deploy bindings — declaring them in
vite.config.ts as well put each one into the generated config twice. Without it the counter reports the decorative figure and
`live: false`. See VISITS-SETUP.md.

## 4. Pre-flight checks

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm audit
npm audit --omit=dev
```

Then verify against the running deployment:

- `POST /` returns 405; `POST /api/buddy` is the only accepted write and only on that path
- source-like paths and `/.vite/manifest.json` return 404
- `/_vinext/image` returns 404
- no `Set-Cookie` on any response
- `GET /api/paper/001` returns `Content-Type: application/pdf` with a non-zero body, and the
  browser opens it in a tab; `/api/paper/9` and `/api/paper/abc` do not return 200
- `POST /api/buddy` eleven times within a minute returns 429 with `Retry-After` on the last call
- `selected-work.zip` downloads and passes an integrity check
- the archive contains the rocket portrait only — no retired imagery, source maps, environment
  files, credentials, machine paths or build residue
- desktop and mobile layout at 980, 610 and 500 px
- keyboard focus visible on the Buddy file control; long messages and filenames wrap

## 5. Account controls

Keep DDoS protection and managed WAF rules enabled. Require HTTPS with TLS 1.2 minimum. Enable
DNSSEC once the domain is connected. Protect the Cloudflare and registrar accounts with hardware
keys. Enable registrar lock, auto-renew and certificate-transparency alerts. Use a least-privilege,
short-lived deployment credential and rotate it after handoff. Disable or protect any
`workers.dev` preview URL so it cannot bypass custom-domain rules.
