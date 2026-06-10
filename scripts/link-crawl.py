#!/usr/bin/env python3
"""
Real-browser link-integrity crawl for the MLAI site.

Drives the playwright-cli wrapper (the repo's standard, no extra install) to:

  1. BFS-crawl every in-app route from "/", asserting each renders and is not
     the catch-all 404 and logs no unexpected console errors (the /api/* 502s
     from running Vite without the Bun API server are filtered — env, not links).

  2. CLICK-THROUGH: for each unique internal link, actually click the anchor in
     a real browser and assert the URL navigates to that link's href. This
     catches broken <Link> components / intercepted clicks that a plain goto
     would miss.

Run via `bun run crawl` (or scripts/crawl-links.sh). Needs a dev server on :3000
(bun run dev), or set BASE_URL to a deployed origin. Exits non-zero on any
broken link, failed click-navigation, or unexpected console error.
"""
import json
import time
import os
import subprocess
import sys

PWCLI = os.environ.get(
    "PWCLI", os.path.expanduser("~/.claude/skills/playwright/scripts/playwright_cli.sh")
)
BASE = os.environ.get("BASE_URL", "http://localhost:3000")

SEEDS = [
    "/", "/about", "/research", "/services", "/team", "/blog", "/docs",
    "/benchmarks", "/links", "/showcase", "/privacy", "/terms", "/security", "/login", "/signup",
    "/console", "/profile",
]

LINKS_FN = (
    "() => JSON.stringify({"
    "title: document.title,"
    "is404: /Page Not Found/.test(document.title) || /doesn..t resolve/.test(document.body.innerText),"
    "links: [...new Set([...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')))]"
    ".filter(h=>h&&h.startsWith('/')&&!h.startsWith('//')&&!h.startsWith('/api'))"
    "})"
)


def cli(*args, timeout=90):
    return subprocess.run(
        [PWCLI, *args], capture_output=True, text=True, timeout=timeout
    ).stdout


def result_payload(out: str):
    """Extract the JSON value printed under the wrapper's '### Result' header."""
    lines = out.splitlines()
    for i, line in enumerate(lines):
        if line.strip() == "### Result" and i + 1 < len(lines):
            try:
                return json.loads(json.loads(lines[i + 1].strip()))
            except Exception:
                return None
    return None


def norm(href: str) -> str:
    p = href.split("#")[0].split("?")[0].rstrip("/")
    return p or "/"


def console_errors():
    errs = []
    for line in cli("console", "error").splitlines():
        line = line.strip()
        if not line.startswith("[ERROR]"):
            continue
        if "/api/" in line or "favicon" in line:
            continue
        errs.append(line[:110])
    return errs


def visit(path: str):
    cli("goto", BASE + path)
    data = result_payload(cli("eval", LINKS_FN)) or {"title": "", "is404": False, "links": []}
    data["errors"] = console_errors()
    return data


def click_through(target: str, source: str):
    """Click the anchor for `target` on page `source`; return the landed path."""
    cli("goto", BASE + source)
    time.sleep(0.6)  # let the navigation commit + hydrate before clicking
    # Guard against a raced goto: confirm we are actually on `source` before
    # clicking (otherwise the click hits whatever page the browser was left on).
    for _ in range(8):
        loc = result_payload(cli("eval", "() => JSON.stringify({p: location.pathname})"))
        if loc and norm(loc.get("p", "")) == source:
            break
        time.sleep(0.5)
        cli("goto", BASE + source)
    click_fn = (
        "() => {"
        "const t=" + json.dumps(target) + ";"
        "const a=[...document.querySelectorAll('a[href]')].find(x=>{"
        "let h=x.getAttribute('href');if(!h||!h.startsWith('/')||h.startsWith('//')||h.startsWith('/api'))return false;"
        "h=h.split('#')[0].split('?')[0].replace(/\\/$/,'')||'/';return h===t;});"
        "if(!a)return JSON.stringify({error:'anchor-not-found'});"
        "a.scrollIntoView();a.click();"
        "return JSON.stringify({clicked:true});}"
    )
    res = result_payload(cli("eval", click_fn))
    if not res or res.get("error"):
        return {"error": res.get("error") if res else "eval-failed"}
    # Next.js <Link> navigations are async (router transition + RSC fetch) —
    # poll the location instead of reading it synchronously after the click.
    landed = norm(source)
    for _ in range(16):
        time.sleep(0.25)
        loc = result_payload(cli("eval", "() => JSON.stringify({p: location.pathname})"))
        if loc and "p" in loc:
            landed = norm(loc["p"])
            if landed == target:
                break
    return {"landed": landed}


# Auth-guarded routes legitimately land on /login when crawled signed-out.
GUARD_REDIRECTS = {"/console": "/login", "/profile": "/login"}

ASSET_EXTS = (".pdf", ".md", ".svg", ".xml", ".webmanifest", ".txt", ".png", ".jpg", ".ico")


def is_asset(path: str) -> bool:
    return path.lower().endswith(ASSET_EXTS)


def main():
    cli("close")  # reset any stale session state from a prior run
    cli("open", BASE + "/")  # ensure a browser session exists (goto won't auto-open)
    # Phase 1 — discover routes + 404/console checks.
    seen, queue, results = set(), list(dict.fromkeys(norm(s) for s in SEEDS)), []
    asset_links = {}  # document/file hrefs — status-checked via HTTP, not crawled
    first_seen = {}  # href -> a route where an anchor for it exists
    while queue:
        path = queue.pop(0)
        if path in seen:
            continue
        seen.add(path)
        d = visit(path)
        results.append((path, d))
        for href in d.get("links", []):
            n = norm(href)
            if is_asset(n):
                asset_links.setdefault(n, path)
                continue
            first_seen.setdefault(n, path)
            if n not in seen and n not in queue:
                queue.append(n)

    import urllib.request
    bad_assets = []
    for a in sorted(asset_links):
        try:
            req = urllib.request.Request(BASE + a, method="HEAD")
            with urllib.request.urlopen(req, timeout=15) as resp:
                if resp.status >= 400:
                    bad_assets.append((a, resp.status))
        except Exception as e:
            bad_assets.append((a, str(e)[:60]))
    if asset_links:
        print(f"Asset links: {len(asset_links) - len(bad_assets)}/{len(asset_links)} OK")
        for a, st in bad_assets:
            print(f"  x  asset {a} -> {st}")

    broken = [p for p, d in results if d.get("is404")] + [a for a, _ in bad_assets]
    errored = [(p, d["errors"]) for p, d in results if d.get("errors")]

    # Phase 2 — click-through: click each unique link once, assert navigation.
    click_fails = []
    click_ok = 0
    for target, source in sorted(first_seen.items()):
        r = click_through(target, source)
        if not (r.get("landed") == target or r.get("landed") == GUARD_REDIRECTS.get(target)):
            r = click_through(target, source)  # one retry — absorbs harness flake
        if r.get("landed") == target or r.get("landed") == GUARD_REDIRECTS.get(target):
            click_ok += 1
        else:
            click_fails.append((target, source, r))

    # Report
    print(f"\nCrawled {len(results)} routes from {BASE}")
    for p, d in results:
        flag = "x 404" if d.get("is404") else ("! err" if d.get("errors") else "ok   ")
        print(f"  [{flag}] {p}")
        for e in d.get("errors", []):
            print(f"          console: {e}")
    print(f"\nClick-through: {click_ok}/{len(first_seen)} links navigated to their href")
    for target, source, r in click_fails:
        print(f"  x  click {target} (on {source}) -> {r}")
    print(
        f"\nSummary: {len(results)} routes | {len(first_seen)} links click-tested | "
        f"{len(broken)} broken | {len(click_fails)} click failures | "
        f"{len(errored)} console-error pages"
    )
    if broken:
        print("BROKEN LINKS:", ", ".join(broken))
    sys.exit(1 if (broken or click_fails or errored) else 0)


if __name__ == "__main__":
    main()
