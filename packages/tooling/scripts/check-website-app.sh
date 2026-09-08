#!/bin/sh
set -eu

# Setup stays an explicit prerequisite: it installs parser/model dependencies.
# Only remove the scratch directory created by this invocation, never overrides.
owned_data_dir=''
cleanup() {
  if [ -n "$owned_data_dir" ]; then
    rm -rf -- "$owned_data_dir"
  fi
}
trap cleanup EXIT
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM

if [ "${MLAI_DATA_DIR+x}" = x ]; then
  if [ -z "$MLAI_DATA_DIR" ]; then
    echo 'MLAI_DATA_DIR must be nonempty when explicitly supplied.' >&2
    exit 1
  fi
else
  owned_data_dir=$(mktemp -d "${TMPDIR:-/tmp}/mlai-website-app-check.XXXXXX")
  owned_data_dir=$(CDPATH='' cd -- "$owned_data_dir" && pwd)
  MLAI_DATA_DIR=$owned_data_dir
fi
export MLAI_DATA_DIR

script_dir=$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)
cd "$script_dir/../../../apps/website-app"
# Finish migration before Next workers import SQLite using the same data path.
bun run db:migrate
bun run check
