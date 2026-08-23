#!/usr/bin/env bash
# Single-process dev: Next.js serves pages AND /api/* route handlers.
# (The old two-process Vite + Hono model is retired — see .retired/.)
set -euo pipefail

bun run dev
