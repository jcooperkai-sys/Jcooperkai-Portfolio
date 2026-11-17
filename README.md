# jcooperkai.com

Personal site of Cooper E. (`jcooperkai`): company, projects, private projects, gallery and a live
GitHub activity chart. Black page, faint star field, ruled grid with bracketed section labels.

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

`npm test` does a production build and runs the rendered-page, worker and security tests.

After editing `app/resume/page.tsx`, regenerate the PDF with the dev server running:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --no-pdf-header-footer --print-to-pdf=public/assets/Jeffery-Eckert-Resume.pdf http://localhost:3001/resume
```

## Site structure

- `app/page.tsx`: the page and all of its content
- `app/activity.tsx`: the GitHub activity chart (loads `/api/github`, refreshes every five minutes)
- `app/gallery.tsx`: gallery bundles (one sideways strip per project) and the image and video viewer
- `app/ask.tsx`: the Ask AI panel with copyable prompts
- `app/resume/`, `app/privacy/`, `app/security-policy/`: the resume and policy pages (the policy pages render `public/*.txt`)
- `app/logo.tsx`: the JC logo as inline SVG, used for the load animation
- `app/globals.css`, `app/stars.css`: styles and the star field
- `worker/index.ts`: Cloudflare Worker entry, response headers, read-back routes
- `worker/github.ts`: reads the public GitHub contribution calendar for `/api/github`
- `public/assets/`: logo, favicons, share image, project logos, gallery images
- `SECURITY.md`: threat model, enforced boundaries and hosting-account checklist

## Shipping

Every change goes through a pull request. `main` is production (jcooperkai.com on Cloudflare,
`npm run deploy`).
