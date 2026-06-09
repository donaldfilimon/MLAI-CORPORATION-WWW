#!/usr/bin/env bash
# Real-browser link-integrity crawl (drives the playwright-cli wrapper; uses the
# already-cached Chromium, no extra install). Needs a dev server on :3000
# (bun run dev) or set BASE_URL to a deployed origin.
set -uo pipefail
cd "$(dirname "$0")/.."
export PWCLI="${PWCLI:-$HOME/.claude/skills/playwright/scripts/playwright_cli.sh}"
export BASE_URL="${BASE_URL:-http://localhost:3000}"
exec python3 scripts/link-crawl.py
