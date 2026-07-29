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

## 2. Rate limiting — required before public launch

Two routes now do work on request. Neither existed when the original threat model was written.

| Route | Method | Risk if unlimited |
|---|---|---|
| `/api/buddy` | POST | exhausts the Groq free-tier quota; Buddy stops answering for everyone |
| `/api/visits` | GET | KV write amplification |

Add a Cloudflare WAF rate-limiting rule, or a Workers Rate Limiting binding, scoped to each path.
Suggested starting point: 10 requests per minute per IP on `/api/buddy`, 60 per minute on
`/api/visits`, returning 429 with `Retry-After`.

Do not implement an in-memory counter in the Worker and call it rate limiting. Isolates do not
share memory, so it would not limit anything. SECURITY.md is explicit about this.

## 3. Visitor counting (optional, free)

```bash
npx wrangler kv namespace create VISITS
```

Bind the returned namespace as `VISITS`. Without it the counter reports the decorative figure and
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
- papers open in a tab rather than downloading (`Content-Type: text/plain`)
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
