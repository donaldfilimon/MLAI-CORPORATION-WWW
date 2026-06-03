#!/usr/bin/env bash
set -euo pipefail

bun server.ts &
SERVER_PID=$!

cleanup() {
  kill "$SERVER_PID" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

bun run dev
