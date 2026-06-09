#!/usr/bin/env python3
"""
Real-browser link-integrity crawl for the MLAI site.

Drives the playwright-cli wrapper (the repo's standard, no extra install) to
BFS-crawl every in-app link starting from "/", visiting each unique internal
route in a real Chromium page and asserting:
  - it does not render the catch-all 404 ("Page Not Found") — which would mean
    a link points at a route that doesn't exist;
  - it logs no unexpected console errors. The /api/* 502s you get from running
    Vite without the Bun API server are filtered out (env, not a link bug).

Run via output/playwright/run.sh. Needs a dev server on :3000 (bun run dev),
or set BASE_URL to a deployed origin. Exits non-zero on any broken link.
"""
import json
import os
import subprocess
import sys

PWCLI = os.environ.get(
    "PWCLI", os.path.expanduser("~/.claude/skills/playwright/scripts/playwright_cli.sh")
)
BASE = os.environ.get("BASE_URL", "http://localhost:3000")

SEEDS = [
    "/", "/about", "/research", "/services", "/team", "/blog", "/docs",
    "/benchmarks", "/privacy", "/terms", "/security", "/login", "/signup",
    "/console", "/profile",
]

EVAL_FN = (
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


def norm(href: str) -> str:
    p = href.split("#")[0].split("?")[0].rstrip("/")
    return p or "/"


def visit(path: str):
    cli("goto", BASE + path)
    out = cli("eval", EVAL_FN)
    data = {"title": "", "is404": False, "links": []}
    for i, line in enumerate(out.splitlines()):
        if line.strip() == "### Result":
            raw = out.splitlines()[i + 1].strip()
            try:
                data = json.loads(json.loads(raw))  # Result is a JSON-encoded string
            except Exception:
                pass
            break
    # console errors — only real "[ERROR] ..." message lines (skip the wrapper's
    # "Total messages"/"Returning" meta). The /api/* 502 from running Vite without
    # the Bun API server is expected and filtered out.
    errs = []
    for line in cli("console", "error").splitlines():
        line = line.strip()
        if not line.startswith("[ERROR]"):
            continue
        if "/api/" in line or "favicon" in line:
            continue
        errs.append(line[:110])
    data["errors"] = errs
    return data


def main():
    seen, queue, results = set(), list(dict.fromkeys(norm(s) for s in SEEDS)), []
    while queue:
        path = queue.pop(0)
        if path in seen:
            continue
        seen.add(path)
        d = visit(path)
        results.append((path, d))
        for href in d.get("links", []):
            n = norm(href)
            if n not in seen and n not in queue:
                queue.append(n)

    broken = [p for p, d in results if d.get("is404")]
    errored = [(p, d["errors"]) for p, d in results if d.get("errors")]

    print(f"\nCrawled {len(results)} routes from {BASE}\n")
    for p, d in results:
        flag = "x 404" if d.get("is404") else ("! err" if d.get("errors") else "ok   ")
        print(f"  [{flag}] {p}")
        for e in d.get("errors", []):
            print(f"          console: {e}")
    print(
        f"\nSummary: {len(results)} routes | {len(broken)} broken links | "
        f"{len(errored)} with console errors"
    )
    if broken:
        print("BROKEN LINKS:", ", ".join(broken))
    sys.exit(1 if broken else 0)


if __name__ == "__main__":
    main()
