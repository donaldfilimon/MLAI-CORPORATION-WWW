# Bun TypeScript Publication Filter Implementation Plan

## STATUS: COMPLETE — all four tasks landed 2026-09-06

Commits, in order: `de01140` (Task 1), `8733b91` (Task 2), `82e0b9f` (Task 3),
`622e8b0` + `1cc6827` + `737bd4f` (Task 4 and its follow-ups). Verified 2026-09-06 19:5x
with `bun run check` (exit 0, 10 tests across 3 files) and the manifest gate
(`files 99 bad [] unlisted []`, `content True publications bad [] attachments bad []`).

Two deliberate deviations from the text below, both applied after the plan landed:

- **The `package.json` snippet in Task 4 Step 3 is superseded.** Its
  `devDependencies: { "shadcn": "^4.21.0" }` was unused — no `components.json`, no React,
  no import anywhere — while pulling 81 MB of Babel into `node_modules`. Removed, which
  leaves the artifact with zero dependencies and no `bun.lock` at all (`bun install`
  deletes an empty lockfile). The gate is still green without it. Do not restore that
  block when reading the snippet below.
- **`.mcp.json` is now gitignored** rather than merely left uncommitted. Task 4's closing
  note said not to add it without Donald's word; with the `shadcn` dependency gone its
  only server is unused here, so it joins `.agents/`, `.claude/`, `.grok/`, `.pi/` and
  `.playwright-mcp/` as local CLI state that cannot drift into the review export.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the bun TypeScript publication-filter pipeline so filter logic is unit-tested, `bun run build` emits the browser IIFE and updates the provenance hash, and local CLI droppings stay out of git.

**Architecture:** Keep generated HTML in `public/` unchanged. Pure tag-matching stays in `src/publication-filter.ts`. Card apply/hide/status lives in `src/apply-filter.ts` behind duck-typed DOM surfaces so bun tests do not need a browser. `src/filter.ts` only queries the document and calls `applyFilter`. `scripts/build.ts` compiles `src/filter.ts` to a minified browser IIFE at `public/assets/filter.js`, rewrites that file's sha256 in `public/research-manifest.json` without reformatting the rest of the JSON, then copies `public/` to `out/`.

**Tech Stack:** bun 1.4, TypeScript (bun types, `tsconfig.json` already present), `bun:test`, static HTML in `public/` that loads `/assets/filter.js` with `defer`.

---

## Starting state (do not redo)

These already exist and already pass `bun test` / `bun run build`. Leave them unless a later task edits them:

- `src/publication-filter.ts` exports `ALL_TAG`, `matchesPublicationTag`, `statusText`
- `src/publication-filter.test.ts` covers All / exact / null tags and zero / nonzero status copy
- `src/filter.ts` currently inlines apply + init (Task 2 replaces the apply body)
- `scripts/build.ts` compiles the IIFE and copies `public/` → `out/` but does **not** update the manifest hash
- `package.json` `"check"` writes an IIFE to `/tmp/mlai-filter-check.js` (Task 4 removes `/tmp`)
- `bun.lock`, `bunfig.toml`, `tsconfig.json` are present
- `package-lock.json` must stay deleted
- Pages still reference `<script src="/assets/filter.js" defer="">`. Do not change HTML.

**Out of scope (separate plan if ever requested):** shadcn/React rewrite of the static pages, nested `package.json` installs under `public/` (none exist), editing publication prose/HTML/PDFs.

Work on the canonical checkout's `main` branch. Do not create a worktree. Do not commit `.agents/`, `.claude/`, `.grok/`, `.pi/`, `.playwright-mcp/`, or `skills-lock.json`.

## File map

| File | Responsibility |
|------|----------------|
| `src/publication-filter.ts` | Pure tag match + status sentence (unchanged) |
| `src/apply-filter.ts` | Apply selected tag to buttons, cards, status node |
| `src/apply-filter.test.ts` | bun:test for `applyFilter` |
| `src/filter.ts` | Query DOM, bind click, call `applyFilter` |
| `src/publication-filter.test.ts` | Existing pure-function tests (unchanged) |
| `scripts/replace-file-hash.ts` | Surgical sha256 replace in manifest text |
| `scripts/replace-file-hash.test.ts` | bun:test for the replace helper |
| `scripts/build.ts` | Compile IIFE, update hash, copy `public/` → `out/` |
| `package.json` | `build` / `test` / `check` scripts |
| `.gitignore` | `out/`, `node_modules/`, `package-lock.json`, local CLI dirs |
| `README.md` | One-line build description |

---

### Task 1: `applyFilter` (testable, no document global)

**Files:**
- Create: `src/apply-filter.ts`
- Create: `src/apply-filter.test.ts`

- [x] **Step 1: Write the failing tests**

Create `src/apply-filter.test.ts`:

```ts
import { describe, expect, test } from "bun:test";
import { applyFilter } from "./apply-filter.ts";

type Attrs = Record<string, string>;

function control(attrs: Attrs) {
  const store: Attrs = { ...attrs };
  return {
    getAttribute(name: string): string | null {
      return store[name] ?? null;
    },
    setAttribute(name: string, value: string): void {
      store[name] = value;
    },
  };
}

function item(tag: string) {
  const base = control({ "data-publication-tag": tag });
  return {
    ...base,
    hidden: false,
  };
}

describe("applyFilter", () => {
  test("presses only the selected button and hides non-matching cards", () => {
    const all = control({ "data-filter": "All" });
    const safety = control({ "data-filter": "SAFETY" });
    const overview = item("OVERVIEW");
    const safetyCard = item("SAFETY");
    const status = { textContent: "21 publications shown." };

    applyFilter(safety, [all, safety], [overview, safetyCard], status);

    expect(all.getAttribute("aria-pressed")).toBe("false");
    expect(safety.getAttribute("aria-pressed")).toBe("true");
    expect(overview.hidden).toBe(true);
    expect(safetyCard.hidden).toBe(false);
    expect(status.textContent).toBe("1 publications shown.");
  });

  test("All shows every card", () => {
    const all = control({ "data-filter": "All" });
    const overview = item("OVERVIEW");
    const safetyCard = item("SAFETY");
    overview.hidden = true;
    const status = { textContent: "" };

    applyFilter(all, [all], [overview, safetyCard], status);

    expect(overview.hidden).toBe(false);
    expect(safetyCard.hidden).toBe(false);
    expect(status.textContent).toBe("2 publications shown.");
  });

  test("zero matches writes the empty-status sentence and ignores a null status node", () => {
    const routing = control({ "data-filter": "ROUTING" });
    const overview = item("OVERVIEW");

    applyFilter(routing, [routing], [overview], null);

    expect(overview.hidden).toBe(true);
  });
});
```

- [x] **Step 2: Run tests to verify they fail**

Run:

```bash
bun test src/apply-filter.test.ts
```

Expected: FAIL with resolve error `Could not resolve: "./apply-filter.ts"` (or `applyFilter` is not exported).

- [x] **Step 3: Write minimal implementation**

Create `src/apply-filter.ts`:

```ts
import {
  matchesPublicationTag,
  statusText,
} from "./publication-filter.ts";

export type FilterControl = {
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: string): void;
};

export type FilterItem = FilterControl & {
  hidden: boolean;
};

export type StatusNode = {
  textContent: string | null;
};

export function applyFilter(
  selectedButton: FilterControl,
  buttons: readonly FilterControl[],
  publications: readonly FilterItem[],
  status: StatusNode | null,
): void {
  const tag = selectedButton.getAttribute("data-filter");
  for (const other of buttons) {
    other.setAttribute("aria-pressed", String(other === selectedButton));
  }
  let shown = 0;
  for (const article of publications) {
    const visible = matchesPublicationTag(
      tag,
      article.getAttribute("data-publication-tag"),
    );
    article.hidden = !visible;
    if (visible) shown += 1;
  }
  if (status) status.textContent = statusText(shown);
}
```

- [x] **Step 4: Run tests to verify they pass**

Run:

```bash
bun test src/apply-filter.test.ts src/publication-filter.test.ts
```

Expected: PASS, 7 tests (3 new + 4 existing).

- [x] **Step 5: Commit**

```bash
git add src/apply-filter.ts src/apply-filter.test.ts
git commit -m "$(cat <<'EOF'
feat: add testable publication applyFilter

Extract card hide/show and aria-pressed updates behind duck-typed DOM
surfaces so bun:test can cover filter behavior without a browser.
EOF
)"
```

---

### Task 2: Wire `src/filter.ts` to `applyFilter`

**Files:**
- Modify: `src/filter.ts`

- [x] **Step 1: Write a failing smoke test that init is not required for applyFilter**

This task does not add a new test file. Confirm Task 1 tests still import `applyFilter` from `./apply-filter.ts`, then replace the inlined function in `src/filter.ts`. If `src/filter.ts` still contains `function applyFilter(`, the wiring is incomplete.

Run:

```bash
rg -n "function applyFilter" src/filter.ts
```

Expected before the edit: a match at the inlined function. After the edit: no matches.

- [x] **Step 2: Confirm the pre-edit grep finds the inline function**

Run:

```bash
rg -n "function applyFilter" src/filter.ts
```

Expected: a hit (for example `src/filter.ts:10:function applyFilter(`).

- [x] **Step 3: Replace `src/filter.ts` with DOM init only**

Write `src/filter.ts` as:

```ts
import { applyFilter } from "./apply-filter.ts";

function queryAll<T extends Element>(selector: string): T[] {
  return Array.from(document.querySelectorAll<T>(selector));
}

function init(): void {
  const buttons = queryAll<HTMLElement>("[data-filter]");
  const publications = queryAll<HTMLElement>("[data-publication-tag]");
  if (buttons.length === 0) return;
  for (const button of buttons) {
    button.addEventListener("click", () => {
      applyFilter(
        button,
        buttons,
        publications,
        document.getElementById("publication-status"),
      );
    });
  }
}

if (typeof document !== "undefined") {
  init();
}
```

- [x] **Step 4: Re-run unit tests and compile the IIFE**

Run:

```bash
bun test
bun build src/filter.ts --outfile public/assets/filter.js --target=browser --format=iife --minify
```

Expected: all tests PASS. Compile prints `Bundled 3 modules` (filter.ts + apply-filter.ts + publication-filter.ts) and writes `public/assets/filter.js`.

- [x] **Step 5: Commit**

```bash
git add src/filter.ts public/assets/filter.js
git commit -m "$(cat <<'EOF'
refactor: bind page filter clicks through applyFilter

Keep document queries in src/filter.ts. Browser IIFE still loads as
/assets/filter.js so generated HTML does not change.
EOF
)"
```

Do not `git add` `public/research-manifest.json` yet; Task 3 updates that hash from the build.

---

### Task 3: Surgical manifest hash update in build

**Files:**
- Create: `scripts/replace-file-hash.ts`
- Create: `scripts/replace-file-hash.test.ts`
- Modify: `scripts/build.ts`

- [x] **Step 1: Write the failing tests**

Create `scripts/replace-file-hash.test.ts`:

```ts
import { describe, expect, test } from "bun:test";
import { replaceFileHash } from "./replace-file-hash.ts";

const OLD =
  "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const NEXT =
  "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";

describe("replaceFileHash", () => {
  test("replaces only the named 64-hex hash", () => {
    const input = `{
  "files": {
    "404.html": "${OLD}",
    "assets/filter.js": "${OLD}"
  }
}
`;
    const output = replaceFileHash(input, "assets/filter.js", NEXT);
    expect(output).toContain(`"assets/filter.js": "${NEXT}"`);
    expect(output).toContain(`"404.html": "${OLD}"`);
  });

  test("throws when the path is missing", () => {
    expect(() =>
      replaceFileHash(`{"files":{}}`, "assets/filter.js", NEXT),
    ).toThrow("assets/filter.js");
  });
});
```

- [x] **Step 2: Run tests to verify they fail**

Run:

```bash
bun test scripts/replace-file-hash.test.ts
```

Expected: FAIL, cannot resolve `./replace-file-hash.ts`.

- [x] **Step 3: Write the helper**

Create `scripts/replace-file-hash.ts`:

```ts
export function replaceFileHash(
  manifestText: string,
  relPath: string,
  hash: string,
): string {
  if (!/^[a-f0-9]{64}$/.test(hash)) {
    throw new Error(`expected 64 lowercase hex chars, got ${hash}`);
  }
  const escaped = JSON.stringify(relPath).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );
  const pattern = new RegExp(`(${escaped}:\\s*")[a-f0-9]{64}(")`);
  const next = manifestText.replace(pattern, `$1${hash}$2`);
  if (next === manifestText) {
    throw new Error(`no hash entry for ${relPath}`);
  }
  return next;
}
```

- [x] **Step 4: Run helper tests**

Run:

```bash
bun test scripts/replace-file-hash.test.ts
```

Expected: PASS, 2 tests.

- [x] **Step 5: Update `scripts/build.ts`**

Write `scripts/build.ts`:

```ts
import { cp, rm } from "node:fs/promises";
import { join } from "node:path";
import { replaceFileHash } from "./replace-file-hash.ts";

const root = join(import.meta.dir, "..");
const filterSource = join(root, "src/filter.ts");
const filterOut = join(root, "public/assets/filter.js");
const publicDir = join(root, "public");
const outDir = join(root, "out");
const manifestPath = join(publicDir, "research-manifest.json");

const build =
  await Bun.$`bun build ${filterSource} --outfile ${filterOut} --target=browser --format=iife --minify`.nothrow();
if (build.exitCode !== 0) {
  const err = build.stderr.toString();
  if (err) process.stderr.write(err);
  process.exit(build.exitCode ?? 1);
}

const bytes = await Bun.file(filterOut).arrayBuffer();
const hash = new Bun.CryptoHasher("sha256").update(bytes).digest("hex");
const manifestText = await Bun.file(manifestPath).text();
await Bun.write(
  manifestPath,
  replaceFileHash(manifestText, "assets/filter.js", hash),
);

await rm(outDir, { recursive: true, force: true });
await cp(publicDir, outDir, { recursive: true });
```

- [x] **Step 6: Run build and the provenance gate**

Run:

```bash
bun test
bun run build
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

Expected: tests PASS. Build bundles 3 modules. Python prints:

```
files 99 bad [] unlisted []
content True publications bad [] attachments bad []
```

`git diff --stat public/research-manifest.json` must be a one-line hash change for `assets/filter.js` only (or empty if the hash was already current).

- [x] **Step 7: Commit**

```bash
git add scripts/replace-file-hash.ts scripts/replace-file-hash.test.ts scripts/build.ts public/assets/filter.js public/research-manifest.json
git commit -m "$(cat <<'EOF'
feat: update filter.js provenance hash during bun build

Compute sha256 of the compiled IIFE and rewrite only that files entry
in research-manifest.json so the provenance gate stays green.
EOF
)"
```

---

### Task 4: bun check path, gitignore, README

**Files:**
- Modify: `package.json`
- Modify: `.gitignore`
- Modify: `README.md`
- Modify: `CLAUDE.md` (commands block only, keep in sync with `package.json`)

- [x] **Step 1: Write a failing assertion on the check script**

Run:

```bash
python3 - <<'PY'
import json
p = json.load(open("package.json"))
check = p["scripts"]["check"]
assert "/tmp/" not in check, check
assert "bun test" in check, check
assert "bun run build" in check or "scripts/build.ts" in check, check
print("check ok", check)
PY
```

Expected before the edit: AssertionError because `check` contains `/tmp/mlai-filter-check.js`.

- [x] **Step 2: Confirm the assertion fails**

Same command as Step 1. Expected: `AssertionError` mentioning `/tmp/`.

- [x] **Step 3: Apply the three file edits**

`package.json` scripts:

```json
{
  "name": "mlai-research-review-artifact",
  "private": true,
  "type": "module",
  "description": "Generated static artifact. Edit research source in the canonical MLAI repository; do not edit this snapshot.",
  "scripts": {
    "build": "bun run scripts/build.ts",
    "check": "bun test && bun run build",
    "test": "bun test"
  },
  "devDependencies": {
    "shadcn": "^4.21.0"
  }
}
```

`.gitignore`:

```
out/
node_modules/
package-lock.json
.agents/
.claude/
.grok/
.pi/
.playwright-mcp/
skills-lock.json
```

Replace the last sentence of `README.md` so it matches the bun compile (keep the provenance paragraph). Final file:

```md
# MLAI Research private review

Generated from canonical MLAI source 0a516a84f3b2d8f6f0c96491b8ac4f3e4307cefb.

The public/ directory contains the exact approved structured research collection and shared renderers. No runtime secrets, production APIs or independent prose. Rebuild with the canonical scripts/export-research.tsx; see public/research-manifest.json for provenance.

Run bun run build to compile src/filter.ts to public/assets/filter.js, update that file's sha256 in public/research-manifest.json, and copy public/ to out/ for Sites packaging. Configure .openai/hosting.json static.directory as out. The out/ directory is disposable build output.
```

In `CLAUDE.md`, replace the commands fence with:

```sh
bun run build     # compile src/filter.ts → public/assets/filter.js, hash it, copy public/ → out/
bun test          # publication-filter and applyFilter unit tests
bun run check     # bun test && bun run build
git diff --check  # whitespace check for documentation edits
```

- [x] **Step 4: Re-run the assertion, tests, and check**

Run:

```bash
python3 - <<'PY'
import json
p = json.load(open("package.json"))
check = p["scripts"]["check"]
assert "/tmp/" not in check, check
assert check == "bun test && bun run build", check
print("check ok", check)
PY
bun run check
git diff --check
```

Expected: `check ok bun test && bun run build`. Tests PASS. Build succeeds. `git diff --check` silent.

- [x] **Step 5: Commit**

```bash
git add package.json .gitignore README.md CLAUDE.md
git commit -m "$(cat <<'EOF'
chore: bun check runs tests then build

Drop the /tmp IIFE compile. Ignore local CLI skill copies and
Playwright artifacts so they cannot enter the review export.
EOF
)"
```

Do not add `.mcp.json` unless Donald explicitly wants the shadcn MCP in this artifact. It is unused by the static pages.

---

## Self-review

**Spec coverage**

| Conversation requirement | Task |
|---|---|
| Convert the only JS (`public/assets/filter.js`) to TypeScript source | Tasks 1–2 (`src/*.ts`, IIFE emit) |
| Optimize for bun | Tasks 3–4 (`scripts/build.ts`, `bun run check`, bun.lock-only) |
| Polish filter behavior with tests | Task 1 `applyFilter` tests |
| Provenance gate stays green after filter.js changes | Task 3 |
| Nested package.json installs | None exist; out of scope |
| shadcn component app | Out of scope (separate plan) |

**Placeholder scan:** no TBD / "add validation" / "similar to Task N".

**Type consistency:** `FilterControl`, `FilterItem`, `StatusNode`, `applyFilter`, `replaceFileHash` are named the same in tests and implementation.

**YAGNI:** do not add jsdom, happy-dom, React, or shadcn components. Duck-typed objects are enough for bun:test.
