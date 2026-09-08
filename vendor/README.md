# Vendored site archives — 2026-09-07

Seven archives from `~/Downloads` were reconciled against this repository on
2026-09-07 and the payloads that carry unique work are vendored here verbatim.

Nothing in `vendor/` is built, linted, tested, or deployed. The root gate
(`bun run check`) covers `apps/*` and `packages/*` only, and `check-topology`
asserts required paths exist rather than forbidding extra ones. Treat these
trees as reference material, not as a second product surface.

## What is here

| Path | Source archive | SHA-256 of archive |
|------|----------------|--------------------|
| `mlai-review/` | `MLAI-v2-Source.zip` (`mlai-review/`) | `9bbb85f5…c911f0c` |
| `mlai-review-verification/` | `MLAI-v2-Source.zip` (`verification/`) | `9bbb85f5…c911f0c` |
| `mlai-site/` | `MLAI-marketing-docs-source.zip` (`mlai-site/`) | `9fef7974…2bd74c3` |
| `mlai-site-qa-evidence/` | `MLAI-marketing-docs-source.zip` (`qa-evidence/`) | `9fef7974…2bd74c3` |
| `mlai-site-SHA256-MANIFEST.json` | `MLAI-marketing-docs-source.zip` | `9fef7974…2bd74c3` |
| `mlai-wand-demo/` | `MLAI-swift-site.zip` | `e6a0b1bc…48848421` |
| `hero-assets/` | `files (1).zip` (3 PNGs) | `c494713f…a96801de` |
| `mlai-landing/` | `files (2).zip` | `3b56977c…111d167a` |

Full digests are in the commit that adds this file.

`mlai-review/` and `mlai-site/` are **two revisions of the same standalone
Next.js site**, not two projects: a recursive diff shows 94 differing paths.
`mlai-review/` carries `.github/`, `CHANGELOG.md`, `app/about`, `app/brief`;
`mlai-site/` carries `.env.example`, `app/[[...route]]`, `app/error.tsx`.
Neither is a patch against `apps/web` — reconciling them into the shipping app
is a separate, per-file decision that has not been made.

`mlai-wand-demo/` is a **SwiftPM package** with a static HTML preview, not a
Next.js tree. It shares the name and nothing else.

## What was excluded, and why

- **`NSFW-Creator-Collective-Upgrade.zip`** — an unrelated adult-content site
  project. This repository is public; it was deliberately not merged.
- **`MLAI-CORPORATION-WWW-full.tar.gz`** — a full checkout of this repository
  with its own `.git`, HEAD `5840e4b`, 98 commits. **97 of 98 are already in
  this history.** The one absent commit, `5840e4b` "UX copy pass: the submit
  button was lying", already landed here as `87e89e1` with the paths moved
  under `apps/web/`; the string it replaced (`Check Inquiry Details`) is absent
  from `apps/web/src`. Nothing unique — not vendored.
- **The copy of that same tarball inside `files (1).zip`** — byte-identical,
  SHA-256 `dec836e5…4c73da10` on both. Not vendored.
- **`mlai-www-improvements.patch`** (in `files (1).zip`, 570 KB, 7 commits) —
  six of its seven commits are present in this history by SHA, and the seventh
  is `5840e4b` above. Fully redundant. Not vendored.

## Traps recorded so they are not rediscovered

- `vendor/.gitignore` re-includes `*.log` and re-includes nothing else. Without
  it the root ignore rules silently dropped the three
  `mlai-review-verification/*-browser.log` files, which are the QA evidence.
- `mlai-landing/nextjs-boilerplate/next-env.d.ts` **is** ignored, by the
  boilerplate's own `.gitignore`. That is correct: Next.js regenerates it.
- `mlai-review/.github/workflows/` does **not** run. GitHub reads workflows
  only from the repository root. It is kept as a record of that tree's intended
  CI, not as live automation.
