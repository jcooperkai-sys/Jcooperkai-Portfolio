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

## 7. Attach the domain (whenever you have it)

Nothing here touches code and no redeploy is needed. The worker keeps running on its `workers.dev`
address throughout; the domain is added alongside it, so there is no cutover and no downtime.

### If you bought it through Cloudflare Registrar

This is the short path. Registering there creates the zone in your account and points the
nameservers at Cloudflare already, so both of the slow steps are done. Go straight to *Attach it*.

### If you bought it anywhere else

The domain has to be a zone in the **same Cloudflare account** as the worker before it can be
attached.

1. Dashboard → **Add a site** → enter `jcooperkai.com` → pick the Free plan.
2. Cloudflare shows two nameservers, something like `xyz.ns.cloudflare.com`. Set those at the
   registrar, replacing whatever it gave you. This is the step with a real delay — usually under an
   hour, occasionally up to 24, because it depends on the registry publishing the change.
3. Wait until the zone reads **Active**. It will not attach while it is still Pending.

### Attach it

Workers & Pages → **jcooperkai-ai-lab** → Settings → **Domains & Routes** → Add → **Custom Domain**.

Enter `jcooperkai.com`. Then repeat for `www.jcooperkai.com`.

Choose **Custom Domain**, not Route. A Custom Domain creates the DNS record and provisions the TLS
certificate for you. A Route only matches a pattern and expects a proxied DNS record to already
exist — it is for putting a worker in front of part of an existing site, which is not this.

Do not add an A or CNAME record by hand. The Custom Domain creates the record itself, and a
conflicting manual record is the usual reason this appears to silently fail.

Certificate issuance is normally under a minute for a Registrar domain. Cloudflare documents up to
15 minutes, and a browser may show a certificate warning until it completes — that resolves itself,
so give it a few minutes before assuming something is wrong.

### Apex and www

Adding both as Custom Domains serves the site on both addresses, which is the simplest outcome and
what the steps above do.

If you would rather `www` redirect to the bare domain, attach only `jcooperkai.com`, then add a
Redirect Rule (Rules → Redirect Rules) from `www.jcooperkai.com/*` to `https://jcooperkai.com/$1`
with a 301. Do not attach `www` as a Custom Domain *and* redirect it; the Custom Domain wins and the
rule never fires.

### Verify

```bash
curl -sI https://jcooperkai.com/ | head -1                              # 200
curl -sI https://www.jcooperkai.com/ | head -1                          # 200, or 301 if redirecting
curl -sI https://jcooperkai.com/api/paper/001 | grep -i content-type    # application/pdf
curl -sI -X POST https://jcooperkai.com/ | head -1                      # 405
curl -sI https://jcooperkai.com/ | grep -i strict-transport-security    # max-age=31536000
```

The HSTS header is the one worth confirming, because it only appears off localhost — seeing it is
proof the request reached the worker over the real hostname rather than a cached edge response.

### What becomes correct on its own

Five files name the domain directly, and they are wrong only while the site is on `workers.dev`:

```
public/robots.txt                  Sitemap: https://jcooperkai.com/sitemap.xml
public/sitemap.xml                 <loc>https://jcooperkai.com/</loc>
public/.well-known/security.txt    Canonical and Policy URLs
public/security-policy.txt         "files served from jcooperkai.com"
```

They need no edit. Attaching the domain makes every one of them accurate. They matter to crawlers
and security researchers, neither of which will find the `workers.dev` address unless it is shared.

## 8. Account hardening

Full list in SECURITY.md's hosting checklist. The short version: keep DDoS protection and the
managed WAF on, require TLS 1.2 minimum, enable DNSSEC once the domain is attached, protect the
Cloudflare and registrar accounts with hardware keys, turn on registrar lock and auto-renew, and
disable or protect the `workers.dev` preview URL so it cannot bypass custom-domain rules.
