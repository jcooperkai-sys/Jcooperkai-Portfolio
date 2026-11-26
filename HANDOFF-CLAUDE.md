# Handoff notes

The 1996-style "AI Lab" design this file used to describe is retired (branch `legacy-1996-design`).
The current site is described in `README.md`; security boundaries are in `SECURITY.md`.

## Owner facts

- Name: Cooper E.
- Handle: `jcooperkai`
- Location shown on the site: Florida, USA
- Email: `jcooperkai@gmail.com`
- X: `https://x.com/jcooperkai`
- GitHub: `https://github.com/jcooperkai-sys`

## Design decisions to keep

- Pure black background with a faint black-and-white star field. No color in the interface.
- Full-width desktop layout inside a ruled grid, section labels in corner brackets.
- The JC logo reveals top to bottom on load. The top-left of the header is the name only, no logo.
- System fonts only, so nothing blocks first paint. No third-party requests from the browser.
- Motion is CSS only and is switched off for visitors who ask for reduced motion.

## Rules that still apply

- Do not upgrade `vinext` casually. Upgrade in a branch and repeat build, header and browser checks.
- Do not use an in-memory counter as rate limiting. Use the Cloudflare Rate Limiting binding.
- Never save credentials in a file, command history, documentation or Git configuration.
- No code or content license has been chosen for the research files. Do not assign one without Cooper.
