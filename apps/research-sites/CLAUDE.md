# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`AGENTS.md` is canonical for this repository; defer to it on any conflict. It states the
ownership rule (this is a generated export, not the MLAI source app), the regeneration route,
and the local command boundary. This file adds what it does not carry: the verification
commands and the provenance model behind `public/research-manifest.json`.

## What this repository is

A generated static artifact: the approved MLAI research collection, exported for private
review. There is no application framework or dev server. `bun run build` compiles nothing:
it verifies the manifest, then copies `public/` to `out/` and verifies the copy. The
historical filter utilities in `src/*.ts` are tested but no exported page loads them.

The origin is now `donaldfilimon/MLAI-CORPORATION-WWW` (GitHub). The former standalone
copy's origin was `git.chatgpt-team.site/.../appgprj_6a9d484ec5a881919dc02a7a3ee7934e.git`,
a Codex-app generated host; that history is kept at
`~/dev/archive/mlai-research-sites-merged-20260916`.

The canonical site is `https://quesar.cloud`; every page carries `noindex,nofollow` plus a
`rel=canonical` pointing there. `robots.txt` disallows all crawling. Neither is an access
control.

## Commands

```sh
bun run build     # verify manifest + every file hash, copy public/ → out/, verify the copy
bun test          # filter unit tests plus scripts/ packaging tests (verify-export, replace-file-hash)
bun test scripts/verify-export.test.ts   # one test file
bun run check     # bun test && bun run build
git diff --check  # whitespace check for documentation edits
```

`build` is `scripts/build.ts` under bun. `out/` is gitignored and disposable; never leave
unique work there. Package manager is bun only, and the artifact has **zero
dependencies** — no `bun.lock`, no `node_modules`, no install step, because `bun test`
and `bun build` are builtins and `bun install` deletes an empty lockfile. A missing
`bun.lock` here is the correct state, not a lost file. Do not reintroduce
`package-lock.json`, and do not add a dependency the static pages do not use.

## The real gate: manifest verification

`public/research-manifest.json` is the provenance record and the only thing here that can
actually fail. Verify it after any change under `public/`, and before claiming an export is
intact:

```sh
python3 - <<'PY'
import json, hashlib, os
m = json.load(open('public/research-manifest.json'))
d = json.load(open('public/research-data.json'))
sha  = lambda b: hashlib.sha256(b).hexdigest()
shaj = lambda o: sha(json.dumps(o, separators=(',', ':'), ensure_ascii=False).encode())

bad = [r for r, h in m['files'].items()
       if not os.path.exists(os.path.join('public', r)) or sha(open(os.path.join('public', r), 'rb').read()) != h]
disk = {os.path.relpath(os.path.join(r, f), 'public')
        for r, _, fs in os.walk('public') for f in fs} - {'research-manifest.json'}
by = {p['slug']: p for p in d['publications']}
pubs = [p['slug'] for p in m['publications'] if shaj(by[p['slug']]) != p['contentSha256']]
att  = [a['url'] for p in m['publications'] for a in p['attachments']
        if sha(open(os.path.join('public', a['url'].lstrip('/')), 'rb').read()) != a['sha256']]

print('files', len(m['files']), 'bad', bad, 'unlisted', sorted(disk - set(m['files'])))
print('content', shaj(d) == m['contentSha256'], 'publications bad', pubs, 'attachments bad', att)
PY
```

Clean output is `files N bad [] unlisted []` and `content True publications bad [] attachments bad []`, where N is
whatever the manifest lists (107 at `a45d20f`, 2026-09-08; it was 99 before that export). The number is not the
contract; the empty `bad` and `unlisted` lists and the three `True`/empty results are. A stale N here has already
read as a defect once (2026-09-15), so compare the lists, not the count.

What each hash actually covers, because getting this wrong produces a false green:

- `files` maps every file under `public/` except the manifest itself to its byte sha256.
  The tree holds exactly the listed entries (107 on 2026-09-17; see the count note above). Rendered HTML is
  covered here and nowhere else.
- Top-level `contentSha256` hashes the compact UTF-8 re-serialization of `research-data.json`
  (a `JSON.stringify` equivalent), not the on-disk bytes. That is why it differs from
  `files["research-data.json"]`; both are correct and neither substitutes for the other.
- Each publication's `contentSha256` hashes the compact JSON of that entry inside
  `research-data.json`, not its rendered page.
- `attachments` covers the four PDFs under `public/research/`.

`ensure_ascii=False` is load-bearing in every JSON hash above. With Python's escaping default
only 13 of 21 publications match, which reads as content corruption and is not.

`sourceRevision`, `sourceDirty`, and `generatedAt` record the canonical MLAI commit this was
exported from. Read them from the manifest rather than trusting any revision quoted in prose;
on regeneration they move. Preserve real provenance, never restate a hash you did not compute.

### Checking this export against canonical source

The `sourceRevision` resolves in this repository, so freshness is measurable rather
than assumed. Run this from the repository root, not from `apps/research-sites`:

```sh
git cat-file -t <sourceRevision>                        # it is a real commit
git merge-base --is-ancestor <sourceRevision> main      # it is on the canonical line
git diff --name-only <sourceRevision>..main -- \
  apps/web/app/research apps/web/src/components/research apps/web/scripts/export-research.tsx
```

Empty output from the last command means the research surface has not moved and this
export is current. **Empty output is also what a broken command prints**, so pair it with
a control (`git diff --stat <rev>..main | tail -3`) that must show the unrelated commits —
that is the `find -newermt` trap in a different costume.

Measured 2026-09-06 19:5x: `0a516a84f3b2d8f6f0c96491b8ac4f3e4307cefb` is an ancestor of
`mlai` `main`, **13 commits back with zero changes to any research path**, control showing
10 unrelated files changed. So this artifact matched canonical research content exactly at
that point, and a re-export would have produced the same bytes. Re-measure rather than
trusting this line; it dates the moment, not the repository.

The path list above is not the whole input set. The exporter builds `assets/lab.css` with
Tailwind over all of `apps/web` (`base: root`), so a class added or removed anywhere in
`apps/web` changes exported bytes even when no research path moved. A re-export plus diff
(below) is the only complete freshness test.

Regenerated 2026-09-17 from `07fe5fbc549bd0143f8047a299b77a916a8d0f06` (then `origin/main`,
clean tree; `generatedAt` 2026-09-17T09:34:09Z). Against the previous export (`2718e0c`,
2026-09-08), re-exported with the old timestamp: `research-data.json`, `contentSha256`, the
107-file inventory, PDFs and fonts were identical; the 31 HTML pages differed only in the
footer revision; `assets/lab.css` really changed (utilities from the legacy landing
components deleted in `fb2037c` dropped out, and classes from `9a67562`'s Products/GetStarted
views came in). No exported page uses any of the changed classes.

## Regenerating this export

The exporter refuses any destination inside the repository, so
`--output apps/research-sites` throws by design. Export to scratch, then copy:

```sh
# from apps/web, in a CLEAN checkout (a dirty tree sets sourceDirty and marks every footer)
bun scripts/export-research.tsx --output /private/tmp/<scratch> --generated-at <ISO>
diff -r /private/tmp/<scratch>/public apps/research-sites/public   # from the repo root
rm -rf apps/research-sites/public && ditto /private/tmp/<scratch>/public apps/research-sites/public
bun run check:research-sites
```

Use a real (non-symlinked) absolute path; the exporter rejects `/tmp`. To test freshness
without regenerating, pass the committed manifest's `generatedAt` and normalize the footer
revision before diffing. Copy only `public/`: the scratch `README.md` and `package.json` are
the exporter's templates and would overwrite this package's scripts.

## Content model

`public/research-data.json` is the structured collection every page renders from:

- `tracks` (6): `ai`, `wdbx`, `sea`, `gpu`, `mcp`, `tui`. Each carries `application`,
  `availability`, `limitations`, and an `overviewSlug`.
- `publications` (21), keyed by `slug`, each with `topic` (one of the six tracks), `tag` (the
  UI filter label), `documentType` (`overview` 6, `research-note` 12, `implementation-guide` 3),
  `status` (`Implemented` 15, `Proposed` 6) with a `statusNote` scoping that claim to bounded
  source capabilities rather than a hosted product, plus `sources`, `limitations`,
  `attachments`, and a `body` of `{heading, paragraphs}` blocks.

Page layout mirrors it: `public/index.html` is the collection landing page,
`public/research/index.html` the index, and `public/research/<slug>/index.html` one page per
publication. Every page loads `assets/discovery.js` (exported from
`apps/web/scripts/research-discovery.js`) with `defer`; no page loads a `filter.js`, and
`src/filter.ts` is historical. It is progressive enhancement, and every article link works
without JavaScript.

Assets are only partly local. Geist and KaTeX fonts plus `lab.css` ship in `public/assets/`,
but all 31 HTML pages (2026-09-17) load Spectral from `fonts.googleapis.com`, so the pages are not
offline-complete. AGENTS.md's "bundled locally" describes the local half.

## Editing boundaries

Prose, HTML, PDFs, CSS, and JavaScript under `public/` are exporter output. Fixing content by
hand here fixes the review copy and diverges it from source. Route content changes to
`apps/web` and its exporter, `apps/web/scripts/export-research.tsx`, in this same repository;
the local `build` is not a regeneration path.

Since 2026-09-16 this artifact lives inside the MLAI monorepo as `apps/research-sites`. It is
not `apps/web` (the source it is exported from) and not `apps/website-app` (the independent
Next.js application). Confirm which MLAI tree a request means before editing.
