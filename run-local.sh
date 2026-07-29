#!/bin/bash
# Local preview with Buddy's model enabled.
#
# Loads secrets from .dev.vars (gitignored) so no key ever needs to sit in shell history
# or in the repo. Without it the site still runs; Buddy falls back to its offline guide.
set -euo pipefail
cd "$(dirname "$0")"
[ -f .dev.vars ] && set -a && . ./.dev.vars && set +a
exec npm run start -- --port "${1:-3001}"
