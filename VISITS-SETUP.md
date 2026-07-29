# Enabling the visitor counter

The counter works without any configuration: with no store bound, `/api/visits` answers
`{"count":13581,"live":false}` and the decorative figure is shown. To make it count real unique
visits, bind a free Cloudflare KV namespace.

## One-time setup

```bash
npx wrangler kv namespace create VISITS
```

Add the returned id to the Worker configuration as a KV binding named exactly `VISITS`, then
redeploy. The Worker picks it up automatically; no code change is needed.

## Cost

Cloudflare's free tier allows 100,000 reads and 1,000 writes per day. A write happens only on a
visitor's *first* visit of a day; every repeat visit is a read. A personal site will not approach
either limit.

## What is stored

Never the address. The address is combined with a salt that rotates daily and hashed with SHA-256;
only the first 16 bytes of that digest are stored, with a 24-hour expiry, alongside a running total.
The digest cannot be reversed, and rotating the salt prevents correlating one day against another.
This is described for visitors in `public/privacy.txt`.

## Before enabling

Counting introduces the site's first write path. Add a Cloudflare rate-limiting rule scoped to
`/api/visits` before going live. Do not substitute an in-memory counter in the Worker: isolates do
not share memory, so it would not limit anything (see SECURITY.md).

## Accuracy

KV is eventually consistent and the total is a read-modify-write, so two simultaneous first-time
visits can occasionally register as one. Exact counting would require Durable Objects. For a
portfolio the trade is not worth the cost.
