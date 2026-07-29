# Security model

## Current attack surface

This release is read-only with three exceptions, all listed here:

- no account, login, session cookie, or privileged user role
- no server-side form, guestbook, or comment box
- `POST /api/buddy` is the single write-method route in the whole application.
  Every other path still refuses anything but `GET`/`HEAD`. It calls a metered
  third-party model server-side; the key lives in a Cloudflare secret and is
  never sent to the browser, placed in a `NEXT_PUBLIC_` variable, or logged.
- `GET /api/visits` writes to a KV namespace. It stores a digest of the client address, never the
  address, with a 24-hour TTL. The digest is salted with 32 random bytes generated per day and held
  server-side. An earlier version used the calendar date as the salt, which is public and
  predictable, so the digest was recoverable by hashing all ~2^32 IPv4 candidates — the notice's
  claim of irreversibility was false as written. The residual, stated rather than implied: full read
  access to the namespace also exposes the salt, so this protects a leak of the digests alone.
- `GET /api/paper/NNN` and `GET /api/experiment/<name>` read authored files back
  out and re-serve them with a correct `Content-Type`. Both accept only an
  allow-listed identifier — three paper numbers and four filenames — so neither
  can be steered into reading an arbitrary path.
- no remote upload endpoint
- no third-party script, analytics tag, advertising pixel, iframe, or embedded
  media
- no `next/image` use; the unused image-optimization route returns `404`

Buddy's reply now comes from a server-side model call, but nothing else about it
moved: attachments are still read and kept in the browser and are never uploaded.
The request body is capped at 4 KB before parsing, the message at 1,500
characters, the forwarded history at six turns of 800 characters, and the reply
at 2,000. The upstream call is capped at 15 seconds so a hung connection cannot
hold a request open. Upstream error bodies are never logged, because they can
echo the request.

One residual issue is recorded rather than hidden: the conversation history is
supplied by the client, so a caller can forge prior assistant turns and try to
steer Buddy's persona. The system prompt is sent first on every call and the
route is capped and rate limited, so the worst outcome is Buddy saying something
off-key in one visitor's own session. It does not widen access to anything.

React renders filenames, file excerpts, and
messages as escaped text. The file picker accepts a small allowlist, enforces a
2 MB cap, removes control characters from displayed filenames, truncates text
locally, and never sends a file to the server.

## Code-level defenses

- only `GET` and `HEAD` are accepted, except `POST /api/buddy`, which is
  allow-listed by exact path before the method gate and nowhere else
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
limiting. Worker isolates and locations do not share that state, so a counter in
this process limits nothing.

Both routes that do work per request are limited by a Cloudflare Rate Limiting
binding, declared in `vite.config.ts` and enforced in `worker/index.ts`:

| Route | Limit | Risk it closes |
|---|---|---|
| `POST /api/buddy` | 10 / min / IP | exhausting the model provider's free-tier quota, which takes Buddy down for every visitor |
| `GET /api/visits` | 60 / min / IP | KV write amplification against a 1,000 writes/day allowance |

Refusals return `429` with `Retry-After: 60`. The key is `CF-Connecting-IP`,
which the edge sets and a client cannot spoof; keying on a client-supplied
header such as `X-Forwarded-For` would make the limit bypassable by anyone who
sets it. The address is used for that decision only and is never stored.

The binding fails open when it errors or is absent, so a limiter fault cannot
take a route offline. Absent means the local dev server; production has both.

A known trade-off, stated because it is a real cost: a per-IP limit can affect
several legitimate visitors sharing one carrier NAT or privacy relay. The quotas
are set well above ordinary browsing for that reason, and neither route is
needed to read the site — Buddy falls back to its offline guide and the counter
falls back to a static figure.

Cloudflare's automatic network and HTTP DDoS protection should remain enabled. A
WAF rate-limiting rule may be layered on top but is not required.

Before any future `/upload/`, `/auth/`, form handler, or database write is
deployed:

1. add a rate-limiting rule or binding scoped to that exact route;
2. key on the authenticated user or API client where possible, not a shared IP;
3. return `429` with `Retry-After`;
4. cap body size and execution time before parsing;
5. authenticate and authorize before reading private data or performing work;
6. record rate-limit events without logging message or file contents.

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
