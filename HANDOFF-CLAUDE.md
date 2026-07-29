# Claude Code handoff: Cooper E.'s AI Lab

## Deployment state

The owner explicitly wants this handoff kept on localhost. Do not deploy it
through OpenAI Sites, Cloudflare, Vercel, GitHub Pages, or any other public
host. There is no live public deployment. Cooper will use Claude Code to connect
the finished site to `jcooperkai.com` later and must explicitly approve that
separate publication step.

## Release intent

This is Cooper E.'s (`jcooperkai`) finished 1996-style AI research
portfolio. Preserve the deliberately loud Web 1.0 look: live rainbow title,
bitmap plates, flame strip, dotted rules, marquee text, gray beveled panels,
tiny cursor stars, pressed-button overlays, visitor counter, badges, and the
wall-to-wall construction banner.

The design is original. It borrows the visual vocabulary of 1996 personal
homepages without copying another site's layout, copy, or identity.

## Owner facts

- Name: Cooper E.
- Handle/nickname: `jcooperkai`
- Location: San Diego, California
- Email: `jcooperkai@gmail.com`
- X: `https://x.com/jcooperkai`
- GitHub: `https://github.com/jcooperkai-sys`
- arXiv search: `https://arxiv.org/search/?query=jcooperkai&searchtype=author`
- ORCID search: `https://orcid.org/orcid-search/search?searchQuery=jcooperkai`
- Personal domain/canonical URL: `https://jcooperkai.com/`
- Coauthors: none

Removed profile links (owner decision, 29 Jul 2026): Google Scholar and LinkedIn.
Do not reinstate either without an explicit request.

## Non-negotiable visual decisions

- The only profile image is
  `public/assets/profile/rocket-pixel.png`, a pixel-art rocket/launch-tower
  portrait derived from the owner's supplied rocket photograph.
- Do not restore, regenerate, or reference the owner's face, age portraits,
  Minecraft/voxel portraits, the rejected Buddy mascot, neural-network/computer
  scenes, or any generated hero/title banner.
- The hero name and “Welcome to my research node” remain live HTML text.
- Do not add bracket artifacts, a green outline around the JC wordmark, the
  rejected bottom-right JC background, a popup modal, or time-travel copy.
- The JC mark belongs at the bottom-left of the footer.
- The generated footer construction banner must remain crisp, edge-to-edge
  inside its black stage, with thin white rules above and below.
- The separate social-preview banner was intentionally rejected. Do not add an
  Open Graph image unless Cooper explicitly chooses a new asset. The current
  Twitter card is `summary`.
- Generated bitmap labels must retain readable live accessible names through
  `aria-label` or `.sr-only` text.

## Functional behavior

- Every navigation plate scrolls to a real section.
- Papers expose abstracts, plain-text papers, and BibTeX downloads.
- Projects expose working README downloads.
- The downloads table provides individual files and a valid
  `selected-work.zip`.
- Every generated action plate has a pressed state and a brief gray,
  semi-transparent “old button” barrier.
- Print and pause/start-animation controls work.
- The visitor counter is decorative and uses no cookie or browser storage.
- Buddy is an honest, privacy-preserving local research guide. It accepts a
  small allowlist of files up to 2 MB, reads short text previews only in the
  current browser, and never uploads them. It is deliberately not connected to
  a remote model or database in this release.

If Cooper later requests a real model-backed Buddy, treat that as a new
security-sensitive feature. It requires a chosen provider/model, a hosting
secret, a server-only API route, route-scoped rate limiting, strict body/output
limits, cost ceilings, prompt-injection/tool boundaries, abuse monitoring, and
an updated privacy/retention notice. Never put an API key in browser code or a
`NEXT_PUBLIC_*` variable.

## Architecture

- Next.js App Router UI in `app/`
- React client interactions in `app/page.tsx`
- Original responsive Web 1.0 styling in `app/globals.css`
- Native generated PNG assets in `public/assets/`
- Public research downloads in `public/downloads/`
- Vinext/Vite build for Cloudflare
- Cloudflare Worker entry and defensive response policy in `worker/index.ts`
- Static asset response rules in `public/_headers`
- Sites project metadata in `.openai/hosting.json`
- No D1, R2, auth, session, analytics, third-party script, iframe, remote
  upload, contact-form backend, or AI backend

An unused private Sites project was prepared during development but never
deployed:

- Project ID: `appgprj_6a6997c4277481918861e7761a2f8f0a`
- Slug: `jcooperkai-1996-ai-lab`
- Source branch: `main`

Do not deploy that project. Never invent or rewrite opaque Sites IDs. Never save
source-repository credentials in a file, command history, documentation, or Git
configuration.

## Local commands

Node.js 22.13 or newer is required.

```bash
npm ci
npm run dev -- --port 3001
npm run lint
npm run typecheck
npm test
```

`npm test` performs a clean production build and seven rendered/worker security
tests. Before any deployment, also run:

```bash
npm audit
npm audit --omit=dev
```

Do not upgrade the pre-1.0 `vinext` dependency casually. Upgrade in a branch
and repeat all browser, build, header, and download checks.

## Enforced security boundary

- Worker accepts only `GET` and `HEAD`.
- Overlong URLs, source-like paths, and the unused `/_vinext/image` route are
  closed.
- Errors are generic and not publicly cached.
- Logs never include Buddy messages, file contents, filenames, email content,
  query values, or credentials.
- CSP, HSTS, clickjacking, MIME-sniffing, referrer, feature-policy,
  cross-origin, and cache headers are set in the Worker.
- `public/_headers` covers static assets that bypass Worker routing.
- `public/.assetsignore` prevents Vite build metadata from becoming a public
  asset.
- Buddy filenames and text remain React-escaped, size-capped, and local.
- There are no application secrets in the source or build.
- Production browser source maps are disabled.

Do not implement an in-memory JavaScript `Map` as “production rate limiting.”
Workers and locations do not share it. This read-only release has no expensive
or mutating API route, so Cloudflare's edge DDoS protection is the appropriate
baseline. A future API/upload/auth route needs a Cloudflare WAF rate rule or
Workers Rate Limiting binding scoped to that route.

## Hosting-account controls

These are owner/account operations and cannot be guaranteed by this repository:

- Keep automatic DDoS protection and managed WAF rules enabled.
- Require HTTPS, TLS 1.2 minimum, and TLS 1.3.
- Enable DNSSEC when `jcooperkai.com` is connected.
- Protect Cloudflare and registrar accounts with passkeys or hardware-key MFA.
- Enable registrar lock, auto-renew, certificate-transparency alerts, and
  protected recovery email.
- Use a least-privilege, short-lived deployment credential restricted to this
  site and rotate it after handoff.
- Disable or protect alternate preview/`workers.dev` URLs when possible so they
  cannot bypass custom-domain rules.
- Monitor security events and sustained `4xx`/`5xx` spikes.

## Release verification

Before any owner-approved future live release, check:

- desktop and mobile layout, especially 980 px, 610 px, and 500 px widths;
- visible keyboard focus on the Buddy file plate;
- wrapping of very long Buddy messages and filenames;
- all former browser annotations;
- every anchor, download, details panel, print control, animation control, and
  Buddy control;
- exact HTML and static-file security/cache headers;
- no `Set-Cookie`;
- `POST /` returns `405`;
- source-like paths and `/.vite/manifest.json` return `404`;
- `/_vinext/image` returns `404`;
- the selected-work ZIP downloads and passes an integrity test;
- the archive contains the rocket portrait only, no retired personal imagery,
  source maps, environment files, credentials, machine paths, or scratch/build
  residue.

## Privacy, disclosure, and owner choices

- Privacy notice: `public/privacy.txt`
- Responsible disclosure contact:
  `public/.well-known/security.txt`
- Disclosure policy: `public/security-policy.txt`
- Full technical threat model: `SECURITY.md`

The research files currently invite scholarly use, but no binding code/content
license has been selected. Cooper should choose licenses before third-party
reuse is a concern; do not assign one without explicit approval.

The ornamental `© 1996` is part of the requested period design. If this site
becomes a commercial or legal publication, Cooper should decide whether to add
a separate current-year legal notice. This repository provides technical
hardening and general privacy/disclosure hygiene, not jurisdiction-specific
legal advice.
