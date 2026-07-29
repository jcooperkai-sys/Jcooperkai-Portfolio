# Security model

## Current attack surface

This release is intentionally read-only:

- no account, login, session cookie, or privileged user role
- no server-side form, guestbook, comment box, chat API, or AI API
- no database or object-storage binding
- no remote upload endpoint
- no third-party script, analytics tag, advertising pixel, iframe, or embedded
  media
- no `next/image` use; the unused image-optimization route returns `404`

Buddy runs only in the browser. React renders filenames, file excerpts, and
messages as escaped text. The file picker accepts a small allowlist, enforces a
2 MB cap, removes control characters from displayed filenames, truncates text
locally, and never sends a file to the server.

## Code-level defenses

- only `GET` and `HEAD` requests are accepted by the Worker
- overlong URLs and source-like paths are rejected before application routing
- production errors return a generic message rather than a stack trace
- powered-by/server response headers are removed
- CSP denies objects, frames, workers, media, off-origin connections, and
  off-origin assets; inline scripts/styles remain allowed only because the
  current React/vinext render requires them
- clickjacking, MIME sniffing, referrer leakage, browser-feature access, and
  cross-origin resource reuse are restricted with response headers
- production HTTPS receives one-year HSTS without the risky `preload` or
  `includeSubDomains` directives
- authored static assets receive matching defensive headers through
  `public/_headers`; their one-hour revalidation window allows Cooper to replace
  a same-named portrait without a year-long stale cache
- external links use a new browsing context with `noopener noreferrer`
- no raw HTML injection, `eval`, JavaScript URLs, or browser source maps
- dependencies, local asset references, downloads, and disclosure files are
  checked during release

## Rate limiting and DDoS

Do not add an in-memory JavaScript `Map` and describe it as production rate
limiting. Worker isolates and locations do not share that state, and blanket
per-IP limits can block many legitimate visitors behind one carrier or privacy
relay.

Cloudflare's automatic network and HTTP DDoS protection should remain enabled.
This static release has no expensive or mutating public route that needs a
separate application quota. Before a future `/api/`, `/upload/`, `/auth/`, form
handler, remote Buddy model, or database write is deployed:

1. add a Cloudflare WAF rate-limiting rule or a Workers Rate Limiting binding
   scoped to that exact route;
2. choose the key and quota for the authenticated user or API client where
   possible, instead of a shared IP;
3. return `429` with `Retry-After`;
4. cap body size and execution time before parsing;
5. authenticate and authorize before reading private data or performing work;
6. record rate-limit events without logging message/file contents.

Official references:

- https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/
- https://developers.cloudflare.com/ddos-protection/
- https://developers.cloudflare.com/workers/static-assets/headers/
- https://developers.cloudflare.com/workers/examples/security-headers/

## Hosting-account checklist

These controls cannot be proven or configured only from this repository:

- keep automatic DDoS protection and managed WAF rules enabled
- enable Always Use HTTPS, TLS 1.3, and a minimum TLS version of 1.2
- enable DNSSEC on a connected custom domain
- protect preview/staging deployments with an access policy; production stays
  public because it is a portfolio
- enable security-event alerts and periodically review Worker errors and `4xx`
  spikes
- turn on bot challenges only if measured abuse justifies the accessibility and
  privacy tradeoff
- keep deployment credentials short-lived and never write them into Git,
  `.env`, browser code, or documentation
- run dependency updates in a branch, rebuild, and repeat the full browser and
  security tests before deployment

## Future-feature rules

- secrets belong in the hosting platform's secret store, never in `NEXT_PUBLIC_*`
- every new state-changing route requires authentication, authorization, CSRF
  analysis, schema validation, size limits, rate limits, audit events, and
  generic error responses
- uploaded files require server-side magic-byte validation, randomized storage
  keys, malware scanning, download isolation, retention rules, and deletion
  controls
- a remote AI assistant requires prompt-injection boundaries, tool
  allowlisting, output encoding, cost ceilings, abuse monitoring, and a clear
  data-retention disclosure
- do not weaken CSP or add a third-party script without documenting why it is
  required and reviewing its data collection and supply-chain risk

## Privacy and disclosure

The public notice is at `public/privacy.txt`. The standard responsible
disclosure contact is at `public/.well-known/security.txt`.

Security reports: jcooperkai@gmail.com
