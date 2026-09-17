# Self-hosted GitHub Actions runner (macOS arm64)

The `check (self-hosted)` job in `workflows/ci.yml` runs the full root gate
(`bun run check`, all eight stages) on Donald's Mac. It was added on
2026-09-17 while GitHub-hosted runners were refused by an account billing
lock. The hosted jobs are unchanged, and they remain the only jobs a fork
pull request can reach.

| Field | Value |
|---|---|
| Labels | `self-hosted`, `macOS`, `ARM64`, `mlai` |
| Install directory | `~/actions-runner-mlai` (separate from abi's `~/actions-runner` and abbey's `~/actions-runner-abbey`) |
| Service | launchd agent `actions.runner.donaldfilimon-MLAI-CORPORATION-WWW.<name>` (the exact label is in the install directory's `.service`) |
| Settings | https://github.com/donaldfilimon/MLAI-CORPORATION-WWW/settings/actions/runners |

## Security model (public repository)

A self-hosted runner on a public repository executes whatever a workflow
tells it to, as Donald's own user. The gates:

1. **Job-level trust gate.** The job runs only when the repository is
   `donaldfilimon/MLAI-CORPORATION-WWW` and the event is a push, a manual
   dispatch, or a pull request whose head repository is this repository.
2. **Fork pull requests** stay on the `ubuntu-latest` jobs.
3. **Read-only token.** The workflow sets `permissions: contents: read`,
   and the checkout does not persist credentials.
4. **No secrets.** The job needs none; do not add repository secrets to it.

Rules for workflow authors:

- Never add `runs-on` with these labels without the same `if:` gate.
- Never use `pull_request_target` with a checkout of the PR head.
- Keep the fork-reachable coverage on GitHub-hosted labels.

Recommended in **Settings → Actions → General**: require approval for all
outside collaborators (the current policy is first-time contributors only).

## What the host needs

The job uses `oven-sh/setup-bun` (Bun 1.4.2 in the runner tool cache) and
the host's Go (1.25 or newer, for `check:workflows`), `uv` and Python (for
the website-app worker tests), and Git. Measured on 2026-09-17: Go 1.27.1,
uv 0.11.26.

## Install

The runner binaries can be copied from an existing install on this Mac (no
download needed). Registration needs a short-lived token from GitHub, which
Donald supplies himself:

```bash
cd ~/actions-runner-mlai
./config.sh --url https://github.com/donaldfilimon/MLAI-CORPORATION-WWW \
  --token "$(gh api -X POST repos/donaldfilimon/MLAI-CORPORATION-WWW/actions/runners/registration-token --jq .token)" \
  --name "$(scutil --get LocalHostName)-mlai" --labels mlai --work _work --unattended
./svc.sh install && ./svc.sh start && ./svc.sh status
```

## Day-2 operations

```bash
cd ~/actions-runner-mlai
./svc.sh status
./svc.sh stop && ./svc.sh start
./svc.sh uninstall   # removes the launchd agent only; does not unregister
./config.sh remove --token "$(gh api -X POST repos/donaldfilimon/MLAI-CORPORATION-WWW/actions/runners/remove-token --jq .token)"
```

Logs: `~/Library/Logs/actions.runner.donaldfilimon-MLAI-CORPORATION-WWW.*/`
and `~/actions-runner-mlai/_diag/`. Never read or copy `.credentials` or
`.credentials_rsaparams`.

While the billing lock stands, the hosted jobs still fail in seconds with
zero steps, so the CI run's overall conclusion stays red and `pages.yml`
(which requires a successful CI run) does not publish. Read the
`check (self-hosted)` job's own result.
