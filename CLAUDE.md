# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`AGENTS.md` is canonical for this repository; defer to it on any conflict. It states the
ownership rule (this is a generated export, not the MLAI source app), the regeneration route,
and the local command boundary. This file adds what it does not carry: the verification
commands and the provenance model behind `public/research-manifest.json`.

## What this repository is

A generated static artifact: the approved MLAI research collection, exported for private
review. There is no application here, no framework, no dev server, and no test suite. The
only build step copies bytes.

Origin is `git.chatgpt-team.site/.../appgprj_6a9d484ec5a881919dc02a7a3ee7934e.git`, a
Codex-app generated host, not a `donaldfilimon/*` GitHub repository. Push rights and
durability of that host are unverified, so do not treat a successful commit here as a backup.

The canonical site is `https://quesar.cloud`; every page carries `noindex,nofollow` plus a
`rel=canonical` pointing there. `robots.txt` disallows all crawling. Neither is an access
control.

## Commands

```sh
bun run build                        # or npm run build; same node one-liner
node --check public/assets/filter.js # the only executable file; syntax check only
git diff --check                     # whitespace check for documentation edits
```

`build` runs a `node -e` one-liner that removes `out/` and recursively copies `public/` to
`out/`. It compiles nothing, validates nothing, and deploys nothing. `out/` is gitignored and
disposable; never leave unique work there.

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

Clean output is `files 99 bad [] unlisted []` and `content True publications bad [] attachments bad []`.

What each hash actually covers, because getting this wrong produces a false green:

- `files` maps every file under `public/` except the manifest itself to its byte sha256.
  Ninety-nine entries, and the tree holds exactly those ninety-nine. Rendered HTML is
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
publication. `assets/filter.js` filters cards by `data-filter` against `data-publication-tag`
and updates `#publication-status`; it is progressive enhancement, and every article link works
without JavaScript.

Assets are only partly local. Geist and KaTeX fonts plus `lab.css` ship in `public/assets/`,
but all 24 HTML pages load Spectral from `fonts.googleapis.com`, so the pages are not
offline-complete. AGENTS.md's "bundled locally" describes the local half.

## Editing boundaries

Prose, HTML, PDFs, CSS, and JavaScript under `public/` are exporter output. Fixing content by
hand here fixes the review copy and diverges it from source. Route content changes to the
canonical MLAI repository and its `scripts/export-research.tsx`, which is not present in this
checkout; the local `build` is not a regeneration path.

This artifact is not `dev/active/mlai` (the published monorepo) and not `mlai-website-app`
(the independent Next.js application). Confirm which MLAI tree a request means before editing.
