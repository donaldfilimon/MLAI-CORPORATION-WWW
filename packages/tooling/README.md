# MLAI repository tooling

Repository-only checks live here so app packages do not acquire orchestration
dependencies. `check-topology.ts` verifies the documented app and shared-package
boundaries before the platform-specific gates run.

`bun run check:workflows` at the root runs Actionlint 1.7.12 using
`go run github.com/rhysd/actionlint/cmd/actionlint@v1.7.12`. Go 1.25+ and an
initial module download are required; Go caches subsequent runs. ShellCheck and
Pyflakes are disabled so workflow validation does not depend on local optional
analyzers. The root aggregate gate and CI topology job both run it.

`bun run check:website-app` runs `scripts/check-website-app.sh`, which creates an
isolated temporary data directory, exports the same `MLAI_DATA_DIR` to migration
and the app check, and removes only its own directory on exit. A nonempty
explicit override is retained and never removed, including on failure. Setup
remains an explicit prerequisite because it installs Python/parser/model
dependencies; see the app setup guide.

Run `bun run check:tooling` from the root for wrapper regression tests
(`bun test packages/tooling/src`). The aggregate gate and CI topology job also
run these tests. These use a fake Bun executable to verify data
ownership, command ordering and failure propagation without running app gates.
