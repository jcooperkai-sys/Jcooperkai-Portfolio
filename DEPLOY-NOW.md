# Deploy to jcooperkai.com — the ordered sequence

Everything code-side is done. The four steps below need your Cloudflare account, so they are
yours to run. Nothing is deployed until you run step 4.

## 1. Authenticate

```bash
npx wrangler login
```

Opens a browser and asks you to authorize Wrangler on your Cloudflare account.

## 2. Set the Groq key as a secret

```bash
npx wrangler secret put GROQ_API_KEY
```

Paste the key when prompted. It is write-only afterwards and cannot be read back from the
dashboard. Do not paste it into a chat, a commit, a log, or a screenshot; if it ever lands in
one, rotate it at console.groq.com and set it again. The value currently in `.dev.vars` is the
local-preview copy and is gitignored.

## 3. Create the visit-counter KV namespace (optional, free)

```bash
npx wrangler kv namespace create VISITS
```

Copy the id it prints, then build with it so the binding reaches the deployed config:

```bash
CF_KV_VISITS_ID=<id-from-above> npm run build
```

Skip this and the counter shows the static figure with `live: false`. Nothing else changes.

## 4. Deploy

```bash
npm run build && npx wrangler deploy
```

Then attach the domain in the Cloudflare dashboard: Workers & Pages → the worker →
Settings → Domains & Routes → add `jcooperkai.com` and `www.jcooperkai.com`.

## 5. Verify against the live site

```bash
curl -sI https://jcooperkai.com/api/paper/001 | grep -i content-type   # application/pdf
curl -sI -X POST https://jcooperkai.com/                               # 405
curl -s https://jcooperkai.com/api/visits                              # live:true if KV bound
curl -sI https://jcooperkai.com/worker/index.ts | head -1              # 404
curl -sI https://jcooperkai.com/ | grep -ci set-cookie                 # 0
```

Then in a browser: Buddy answers a question, VIEW PAPER opens a PDF in a tab, and eleven Buddy
messages inside a minute produce a 429 on the last one.

## 6. Account hardening

Covered in SECURITY.md's hosting checklist. The short version: keep DDoS protection and the
managed WAF on, require TLS 1.2 minimum, enable DNSSEC once the domain is attached, protect the
Cloudflare and registrar accounts with hardware keys, turn on registrar lock and auto-renew, and
disable or protect the `workers.dev` preview URL so it cannot bypass custom-domain rules.
