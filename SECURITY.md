# Security

Nothing on the internet is unhackable. This site is a static portfolio with a small attack surface,
and this file says what that surface is and what is and is not done about it.

## Reporting a problem

Email jcooperkai@gmail.com with the subject "Security report". The public policy is at
`public/security-policy.txt` and `public/.well-known/security.txt` (served at
https://jcooperkai.com/security-policy.txt and /.well-known/security.txt). Good-faith reports are welcome.

## What the site is

- Static pages rendered by a Cloudflare Worker (`worker/index.ts`) with assets in `dist/client`.
- No accounts, logins, cookies, forms, comment boxes, uploads, database, or third-party scripts.
- Only `GET` and `HEAD` are accepted; everything else is refused.
- The only routes that do work per request are `/api/paper/NNN` and `/api/experiment/<name>`. They
  re-serve authored files, accept only an allow-listed identifier, and are rate limited to 120 requests
  per minute per client by a Cloudflare Rate Limiting binding (`wrangler.jsonc`).
- `/api/github` returns my public GitHub contribution calendar as JSON. The Worker fetches one fixed
  GitHub URL (no part of the request reaches it, redirects are not followed), keeps the result for two
  minutes, serves the last good copy if GitHub fails, and shares the same rate limit. It uses no token
  and the browser never contacts GitHub.
- The earlier Buddy chat and visit counter routes are retired and return 404.

## Where the controls live

Response headers are defined in this repo, so a redeploy cannot silently drop them:

- Worker responses: `worker/index.ts` (Content-Security-Policy, Strict-Transport-Security with a
  two-year max-age and `includeSubDomains`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
  `Referrer-Policy: strict-origin-when-cross-origin`, a restrictive `Permissions-Policy`,
  cross-origin isolation headers).
- Static assets: `public/_headers`.
- The CSP allows `'unsafe-inline'` for scripts and styles because the current React render needs it. The
  one inline script is a fixed JSON-LD block (`app/layout.tsx`) that contains no request data and is not
  executed.

## Cloudflare account settings (not in the repo)

SSL mode Full (strict), Always Use HTTPS, minimum TLS 1.2, DNSSEC, and the registrar transfer lock are
enabled on the `jcooperkai.com` zone. Automatic DDoS protection and the managed rules stay on.

Bot Fight Mode and site-wide challenges are deliberately off for the public pages, so search engines,
AI assistants, and security scanners can read the site. Hosts that handle payments (`checkout.`) keep
stricter settings.

## Repository hygiene

- No secrets are committed. The git history was scanned for common key formats and found clean. Secrets
  belong in the Cloudflare secret store, never in Git, `.env`, or `NEXT_PUBLIC_*` variables.
- Dependabot is configured in `.github/dependabot.yml` (weekly npm updates).
- Dependency changes are built and run through `npm test` before deploy.

## Known limits

- A per-IP rate limit can affect several visitors behind one shared address.
- Anyone with access to the GitHub or Cloudflare account can change the site. Both accounts should keep
  two-factor authentication on.
