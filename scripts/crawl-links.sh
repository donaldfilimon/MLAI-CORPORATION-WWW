#!/usr/bin/env bash
# Real-browser link-integrity crawl (drives the playwright-cli wrapper; uses the
# already-cached Chromium, no extra install). Needs a dev server on :3000
# (bun run dev) or set BASE_URL to a deployed origin.
set -uo pipefail
cd "$(dirname "$0")/.."
export PWCLI="${PWCLI:-$HOME/.claude/skills/playwright/scripts/playwright_cli.sh}"
export BASE_URL="${BASE_URL:-http://localhost:3000}"

# Preflight: the wrapper lives outside this repo (it ships with the Claude
# "playwright" skill), so a machine without that skill installed would other-
# wise fail deep inside link-crawl.py with a bare FileNotFoundError traceback.
# Fail here instead, naming the missing path and how to point at another one.
if [ ! -x "$PWCLI" ]; then
  echo "crawl: playwright CLI wrapper not found at:" >&2
  echo "         $PWCLI" >&2
  echo >&2
  echo "  This wrapper is not part of this repository — it ships with the" >&2
  echo "  Claude 'playwright' skill. Install that skill, or point PWCLI at" >&2
  echo "  your own wrapper:" >&2
  echo >&2
  echo "      PWCLI=/path/to/playwright_cli.sh bun run crawl" >&2
  echo >&2
  echo "  Every other gate is self-contained: bun run lint / test / build / smoke." >&2
  exit 127
fi

exec python3 scripts/link-crawl.py
