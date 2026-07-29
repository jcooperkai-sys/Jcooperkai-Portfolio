# Cooper E.'s AI Lab

A deliberately authentic 1996-style research portfolio for Cooper E.
(`jcooperkai`). The site combines bitmap interface artwork, downloadable
research notes, a working local-file research guide named Buddy, a visitor
counter, accessibility controls, and responsive layouts.

## Local preview

Requires Node.js 22.13 or newer.

```bash
npm ci
npm run dev -- --port 3001
```

Then visit `http://localhost:3001/`.

## Checks

```bash
npm run lint
npm run typecheck
npm test
```

Buddy is intentionally privacy-friendly: attached files are read only inside
the visitor's browser and are not transmitted or stored by the site.

## Site structure

- `app/`: portfolio page, metadata, and the complete 1996 interface
- `public/assets/`: generated bitmap artwork and badges
- `public/downloads/`: Cooper's plain-text papers, project notes, citations,
  CV, research statement, and selected-work bundle
- `worker/`: production response headers and Cloudflare runtime entry point
- `.openai/hosting.json`: Sites project and binding configuration
- `SECURITY.md`: threat model, enforced boundaries, and hosting-account checklist
- `HANDOFF-CLAUDE.md`: exact continuation brief and non-negotiable design decisions
