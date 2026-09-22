# MLAI repository tooling

Repository-only checks live here so app packages do not acquire orchestration
dependencies. `check-topology.ts` verifies the documented app and shared-package
boundaries before the platform-specific gates run: the root `bun.lock` and
`bunfig.toml` (isolated linker), every workspace manifest, the Next app, the
Quasar service, the Python worker sidecar, no app-level lockfile, and no
nested `workspaces` field.
`check-topology.test.ts` covers each rule against temporary fixtures.

`bun run check:workflows` at the root runs Actionlint 1.7.12 using
`go run github.com/rhysd/actionlint/cmd/actionlint@v1.7.12`. Go 1.25+ and an
initial module download are required; Go caches subsequent runs. ShellCheck and
Pyflakes are disabled so workflow validation does not depend on local optional
analyzers. The root aggregate gate and CI topology job both run it.

Run `bun run check:tooling` from the root for wrapper regression tests
(`bun test packages/tooling/src`). The aggregate gate and CI topology job also
run these tests.
