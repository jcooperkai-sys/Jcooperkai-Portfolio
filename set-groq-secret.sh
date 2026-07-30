#!/usr/bin/env bash
#
# Move the Groq key from wherever it already lives on this machine into the Cloudflare secret,
# without the value ever being displayed, copied, or written anywhere new.
#
#   ./set-groq-secret.sh            # find the key and set the secret
#   ./set-groq-secret.sh --check    # find it and report the source only, set nothing
#
# The value is held in one shell variable and piped straight into wrangler's stdin. It is never
# echoed, never passed as an argument (arguments are visible in `ps`), and never appended to shell
# history, because it is not typed. The only things printed are the source it was found in and its
# length, which are enough to confirm the right key moved without exposing it.
#
# Requires: `wrangler login` already done, and the worker to exist (`npm run deploy` at least once).

set -euo pipefail

SECRET_NAME="GROQ_API_KEY"
CHECK_ONLY=0
[ "${1:-}" = "--check" ] && CHECK_ONLY=1

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

KEY=""
SOURCE=""

# Pull the first gsk_-shaped token out of a file, if the file exists and contains one.
try_file() {
  local path="$1" label="$2" found
  [ -n "$KEY" ] && return 0
  [ -f "$path" ] || return 0
  found="$(grep -oE 'gsk_[A-Za-z0-9_-]{20,}' "$path" 2>/dev/null | head -n 1 || true)"
  if [ -n "$found" ]; then
    KEY="$found"
    SOURCE="$label"
  fi
}

# 1. Already exported in this shell — the way AIRN receives it.
if [ -n "${GROQ_API_KEY:-}" ]; then
  KEY="$GROQ_API_KEY"
  SOURCE="the GROQ_API_KEY environment variable in this shell"
fi

# 2. This project's local-preview file.
try_file "$REPO_ROOT/.dev.vars" "$REPO_ROOT/.dev.vars"

# 3. AIRN, in case a local env file was added there later.
for f in \
  "$HOME/Projects/airn/.env" \
  "$HOME/Projects/airn/ai-research-network/project/.env" \
  "$HOME/Projects/airn/ai-research-network/project/server/.env"; do
  try_file "$f" "$f"
done

# 4. Shell profiles, where an `export GROQ_API_KEY=...` for AIRN would live.
for f in "$HOME/.zshrc" "$HOME/.zprofile" "$HOME/.bash_profile" "$HOME/.profile"; do
  try_file "$f" "$f"
done

# 5. macOS Keychain, if it was stored there under this service name.
if [ -z "$KEY" ] && command -v security >/dev/null 2>&1; then
  found="$(security find-generic-password -s groq-api-key -w 2>/dev/null || true)"
  if [ -n "$found" ]; then
    KEY="$found"
    SOURCE="macOS Keychain (service: groq-api-key)"
  fi
fi

if [ -z "$KEY" ]; then
  cat >&2 <<'MSG'
No Groq key found on this machine.

Looked in: the GROQ_API_KEY environment variable, this project's .dev.vars, AIRN's env files,
your shell profiles, and the macOS Keychain (service "groq-api-key").

Create a key at https://console.groq.com/keys, then make it available in one of those places and
run this again. The least fragile option, which also means AIRN and this script both find it:

  security add-generic-password -s groq-api-key -a "$USER" -w

That prompts for the value, stores it in the Keychain, and never puts it in a file or in history.
MSG
  exit 1
fi

echo "Found a key in: $SOURCE"
echo "Length: ${#KEY} characters"

if [ "$CHECK_ONLY" -eq 1 ]; then
  echo "--check given, so nothing was set."
  exit 0
fi

echo "Setting Cloudflare secret $SECRET_NAME (worker name comes from wrangler.jsonc)..."
# printf, not echo, and piped rather than passed as an argument: process arguments are readable by
# any other process on the machine via `ps`, and a here-string would land in history.
printf '%s' "$KEY" | npx wrangler secret put "$SECRET_NAME"

echo
echo "Done. The secret is write-only from here on and cannot be read back."
echo "Verify Buddy end to end:"
echo "  curl -s -X POST https://www.jcooperkai.workers.dev/api/buddy -H 'Content-Type: application/json' -d '{\"message\":\"hi\"}'"
