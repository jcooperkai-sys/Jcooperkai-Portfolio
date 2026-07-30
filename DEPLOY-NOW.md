# Deploy to jcooperkai.com — the ordered sequence

Everything code-side is done. The steps below need your Cloudflare account. Nothing is live until
step 3.

**You do not need the domain to deploy.** Step 3 publishes to a free `workers.dev` subdomain, and the
Workers free tier needs no payment method. Everything works there — Buddy, the papers, the rate
limiters, the visit counter. Attaching `jcooperkai.com` (step 6) is cosmetic and can wait as long as
you like.

Every command below already includes the `cd`, so each block can be copied on its own in any order
without leaving you in the wrong directory. That matters here: outside this directory wrangler cannot
resolve the worker name and fails with *"Required Worker name missing"*.

## 1. Authenticate

```bash
cd ~/Documents/Codex/2026-07-28/sites-plugin-sites-openai-bundled-create \
  && npx wrangler login
```

Opens a browser and asks you to authorize Wrangler on your Cloudflare account.

## 2. Sanity check before anything is published

```bash
cd ~/Documents/Codex/2026-07-28/sites-plugin-sites-openai-bundled-create \
  && npm run deploy:check
```

A dry run: deploys nothing, and confirms the config resolves.

## 3. Deploy

```bash
cd ~/Documents/Codex/2026-07-28/sites-plugin-sites-openai-bundled-create \
  && npm run deploy
```

This is the step that puts the site on the internet, at the generated `workers.dev` URL. It also
creates the worker, which steps 4 and 5 need to exist first.

Buddy returns a plain "unconfigured" response until step 4 — expected, and the page falls back to
its offline guide rather than erroring.

## 4. Set the Groq key

The worker exists now, so the secret has somewhere to attach. Use the script — it finds the key
where it already lives on this machine and pipes it into wrangler's stdin, so the value is never
displayed, never typed, never put in shell history, and never passed as a command argument (those
are readable by any other process via `ps`):

```bash
cd ~/Documents/Codex/2026-07-28/sites-plugin-sites-openai-bundled-create \
  && ./set-groq-secret.sh
```

To see which source it would use without setting anything:

```bash
cd ~/Documents/Codex/2026-07-28/sites-plugin-sites-openai-bundled-create \
  && ./set-groq-secret.sh --check
```

It searches, in order: the `GROQ_API_KEY` environment variable, this project's `.dev.vars`, AIRN's
env files, your shell profiles, and the macOS Keychain under service `groq-api-key`. It prints only
the source and the key's length.

Groq shows a key once and never again, so if none is found, create one at
https://console.groq.com/keys and put it somewhere durable that both AIRN and this script read:

```bash
cd ~/Documents/Codex/2026-07-28/sites-plugin-sites-openai-bundled-create \
  && security add-generic-password -s groq-api-key -a "$USER" -w
```

That prompts for the value and stores it in the Keychain — no file, no history entry.

The secret applies immediately. No redeploy needed.

## 5. Visit counter (optional, free)

```bash
cd ~/Documents/Codex/2026-07-28/sites-plugin-sites-openai-bundled-create \
  && npx wrangler kv namespace create VISITS
```

Take the id it prints, uncomment the `kv_namespaces` block at the bottom of `wrangler.jsonc`, paste
the id in, then redeploy:

```bash
cd ~/Documents/Codex/2026-07-28/sites-plugin-sites-openai-bundled-create \
  && npm run deploy
```

Skip this and the counter shows the static figure with `live: false`. That is a supported state,
not a broken one.

## 6. Verify against the live site

```bash
# Substitute your workers.dev host until the domain is attached, e.g.
#   https://jcooperkai-ai-lab.<your-subdomain>.workers.dev
curl -sI https://jcooperkai.com/api/paper/001 | grep -i content-type   # application/pdf
curl -sI -X POST https://jcooperkai.com/ | head -1                     # 405
curl -s  https://jcooperkai.com/api/visits                             # live:true once KV is bound
curl -sI https://jcooperkai.com/worker/index.ts | head -1              # 404
curl -sI https://jcooperkai.com/ | grep -ci set-cookie                 # 0
```

Rate limiting can only be confirmed here — the local dev server has no limiter binding, so it fails
open by design and the limit never fires locally:

```bash
for i in $(seq 1 12); do
  curl -s -o /dev/null -w "%{http_code} " -X POST https://jcooperkai.com/api/buddy \
    -H 'Content-Type: application/json' -d '{"message":"hi"}'
done; echo
```

Expect ten `200`s, then `429`s.

Then in a browser: Buddy answers, VIEW PAPER opens a PDF in a tab, and the layout holds at 980, 610
and 500 px.

## 8. Attach the domain (whenever you have it)

Cloudflare dashboard → Workers & Pages → `jcooperkai-ai-lab` → Settings → Domains & Routes → add
`jcooperkai.com` and `www.jcooperkai.com`.

If the domain's nameservers are not already pointed at Cloudflare, do that at your registrar first.
That is the one step with a propagation delay.

Cloudflare Registrar requires a card. If a card is not an option, Namecheap and Porkbun both accept
PayPal, and the domain works the same — you point its nameservers at Cloudflare afterwards either
way. Nothing about the deployment changes.

## 9. Account hardening

Full list in SECURITY.md's hosting checklist. The short version: keep DDoS protection and the
managed WAF on, require TLS 1.2 minimum, enable DNSSEC once the domain is attached, protect the
Cloudflare and registrar accounts with hardware keys, turn on registrar lock and auto-renew, and
disable or protect the `workers.dev` preview URL so it cannot bypass custom-domain rules.
