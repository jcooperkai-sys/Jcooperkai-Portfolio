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

## 3. Register a workers.dev subdomain (first deploy only)

A brand-new Cloudflare account has no `workers.dev` subdomain, and a worker cannot publish without
either that or a custom domain. Wrangler does ask, but `vinext deploy` runs it non-interactively so
the prompt auto-answers "no" and the deploy fails with:

```
You need to register a workers.dev subdomain before publishing to workers.dev
```

There is no `wrangler subdomain` command. Register it in the dashboard — Workers & Pages →
Onboarding — and pick `jcooperkai`, which makes the site
`www.jcooperkai.workers.dev`.

Free, one time, account-wide. Every later deploy skips this.

## 4. Deploy

```bash
cd ~/Documents/Codex/2026-07-28/sites-plugin-sites-openai-bundled-create \
  && npm run deploy
```

This is the step that puts the site on the internet, at the generated `workers.dev` URL. It also
creates the worker, which the secret and the KV binding both need to exist first.

Buddy returns a plain "unconfigured" response until step 5 — expected, and the page falls back to
its offline guide rather than erroring.

## 5. Set the Groq key

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

## 6. Visit counter (optional, free)

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

## 7. Verify against the live site

```bash
# Substitute your workers.dev host until the domain is attached, e.g.
#   https://www.<your-subdomain>.workers.dev
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

## 8. Attach the domain

You are buying `jcooperkai.com` from Cloudflare Registrar, so it arrives already set up in your
account — nothing to configure, no nameservers to change, no waiting.

Three clicks:

1. Workers & Pages → **www** → Settings → **Domains & Routes**
2. Add → **Custom Domain** → `jcooperkai.com`
3. Add → **Custom Domain** → `www.jcooperkai.com`

Done. The site is live on the domain in about a minute, and stays live on `workers.dev` too.

No redeploy. No code changes. The five files that mention `jcooperkai.com` become correct by
themselves.

Check it worked:

```bash
curl -sI https://jcooperkai.com/ | head -1
```

`200` means you are finished.

Two things not to do, because either one makes it look broken:

- Do not pick **Route** instead of Custom Domain. Route needs a DNS record you have not made.
- Do not add an A or CNAME record yourself. The Custom Domain step makes it for you, and a second one conflicts.

If the browser shows a certificate warning at first, wait a few minutes — the certificate is still
being issued. It fixes itself.

## 9. Account hardening

Full list in SECURITY.md's hosting checklist. The short version: keep DDoS protection and the
managed WAF on, require TLS 1.2 minimum, enable DNSSEC once the domain is attached, protect the
Cloudflare and registrar accounts with hardware keys, turn on registrar lock and auto-renew, and
disable or protect the `workers.dev` preview URL so it cannot bypass custom-domain rules.
