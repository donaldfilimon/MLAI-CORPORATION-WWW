#!/usr/bin/env sh
set -eu

bun run build
cargo run -p mlai-www-server
