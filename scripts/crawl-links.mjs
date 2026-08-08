#!/usr/bin/env node
/**
 * Real-browser link-integrity crawl.
 *
 * Why this exists: `next build` proves every page COMPILES; it does not prove
 * that a `<Link href>` resolves to a real route. This repo routes 23 view files
 * through the `react-router-dom` → `src/lib/router-compat.tsx` alias, wired
 * separately in the webpack and turbopack blocks of `next.config.ts`. Link
 * integrity through a compat shim, under two bundler configs, is a bug class no
 * unit test in `src/__tests__/` covers. This is the only check that catches it.
 *
 * Replaces the previous `crawl-links.sh` + `link-crawl.py` pair, which shelled
 * out to an external `playwright_cli.sh` wrapper under `~/.claude/skills/` and
 * scraped a `### Result` header out of its stdout. That wrapper does not exist
 * on this machine (or on any CI runner), so `bun run crawl` failed with a
 * FileNotFoundError; and the old docstring still described filtering "/api/*
 * 502s from running Vite without the Bun API server" — the retired stack.
 *
 * Usage:  bun run dev        (in another shell)
 *         bun run crawl
 *         BASE_URL=https://… bun run crawl     # or point at a deployed origin
 */

import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");

/**
 * Playwright is not a root dependency — it is installed into the gitignored
 * `.ds-sync/` staging dir by the design-sync flow, alongside a matching cached
 * Chromium. Resolve from either location and say exactly what to do if neither
 * has it, rather than throwing a module-not-found stack at the user.
 */
async function loadPlaywright() {
  for (const from of [path.join(ROOT, "package.json"), path.join(ROOT, ".ds-sync/package.json")]) {
    try {
      return await import(createRequire(from).resolve("playwright"));
    } catch {
      /* try the next candidate */
    }
  }
  console.error(
    [
      "playwright is not installed.",
      "",
      "  It is not a root dependency. Either:",
      "    bun add -d playwright            # add it to this repo, or",
      "    (cd .ds-sync && npm i playwright) # reuse the design-sync staging dir",
      "",
      "  A matching browser is likely already cached under",
      "  ~/Library/Caches/ms-playwright (macOS) — check the build number there",
      "  and install the playwright release that pins it, with",
      "  PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1.",
    ].join("\n"),
  );
  process.exit(2);
}

const SEEDS = [
  "/", "/about", "/research", "/services", "/team", "/blog", "/docs",
  "/benchmarks", "/links", "/showcase", "/privacy", "/terms", "/security",
  "/login", "/signup", "/console", "/profile", "/changelog", "/demo",
];

/** Auth-guarded routes legitimately bounce to /login — not a broken link. */
const GUARD_REDIRECTS = { "/console": "/login", "/profile": "/login" };

const ASSET_EXTS = [".pdf", ".md", ".svg", ".xml", ".webmanifest", ".txt", ".png", ".jpg", ".ico"];
const isAsset = (p) => ASSET_EXTS.some((e) => p.toLowerCase().endsWith(e));

/** Strip origin, query and hash so "/docs?x=1#y" and "/docs" are one route. */
function norm(href) {
  try {
    const u = new URL(href, BASE);
    return u.pathname.replace(/\/$/, "") || "/";
  } catch {
    return href;
  }
}

async function main() {
  const { chromium } = await loadPlaywright();
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Console errors are collected per-navigation; reset on each visit.
  let consoleErrors = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text().slice(0, 200));
  });
  page.on("pageerror", (e) => consoleErrors.push(String(e.message).slice(0, 200)));

  /** Visit a route and report 404-ness, console errors, and outbound links. */
  async function visit(route) {
    consoleErrors = [];
    await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 30_000 });
    const data = await page.evaluate(() => ({
      title: document.title,
      is404:
        /Page Not Found/i.test(document.title) ||
        /doesn.?t resolve|could not be found/i.test(document.body.innerText),
      links: [
        ...new Set(
          [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")),
        ),
      ].filter((h) => h && h.startsWith("/") && !h.startsWith("//") && !h.startsWith("/api")),
    }));
    return { ...data, errors: [...consoleErrors] };
  }

  // ── Phase 1 — BFS discovery, 404 + console checks ────────────────────────
  const seen = new Set();
  const queue = [...new Set(SEEDS.map(norm))];
  const results = [];
  const assetLinks = new Map(); // asset href -> a route that links it
  const firstSeen = new Map(); // route href -> a route where an anchor exists

  while (queue.length) {
    const route = queue.shift();
    if (seen.has(route)) continue;
    seen.add(route);

    let d;
    try {
      d = await visit(route);
    } catch (e) {
      results.push([route, { is404: true, errors: [`navigation failed: ${e.message}`], links: [] }]);
      continue;
    }
    results.push([route, d]);

    for (const href of d.links) {
      const n = norm(href);
      if (isAsset(n)) {
        if (!assetLinks.has(n)) assetLinks.set(n, route);
        continue;
      }
      if (!firstSeen.has(n)) firstSeen.set(n, route);
      if (!seen.has(n) && !queue.includes(n)) queue.push(n);
    }
  }

  // ── Asset links are status-checked over HTTP, not crawled ────────────────
  const badAssets = [];
  for (const a of [...assetLinks.keys()].sort()) {
    try {
      const res = await fetch(BASE + a, { method: "HEAD" });
      if (res.status >= 400) badAssets.push([a, res.status]);
    } catch (e) {
      badAssets.push([a, String(e.message).slice(0, 60)]);
    }
  }

  // ── Phase 2 — click each unique link once and assert where it lands ──────
  // This is the part that actually exercises the router shim: a compiling
  // <Link href> that navigates nowhere only shows up when something clicks it.
  const clickFails = [];
  let clickOk = 0;

  for (const [target, source] of [...firstSeen.entries()].sort()) {
    const attempt = async () => {
      await page.goto(BASE + source, { waitUntil: "networkidle", timeout: 30_000 });
      const link = page.locator(`a[href="${target}"], a[href="${target}/"]`).first();
      if ((await link.count()) === 0) return { landed: null, why: "anchor vanished" };
      await link.click({ timeout: 10_000 });
      // Client-side navigation never starts a new document load, so
      // waitForLoadState("networkidle") resolves IMMEDIATELY (the current page
      // is already idle) and reading page.url() then races the SPA router —
      // measured on `next dev`, the URL updates ~2.5s after networkidle
      // resolves, which made every click-through "land on" its source page.
      // Wait for the URL itself: target or its known auth-guard redirect.
      const ok = target;
      const guard = GUARD_REDIRECTS[target];
      try {
        await page.waitForURL(
          (u) => {
            const n = norm(u.href);
            return n === ok || (guard !== undefined && n === guard);
          },
          { timeout: 20_000 },
        );
      } catch {
        /* fall through — report wherever we actually are */
      }
      return { landed: norm(page.url()) };
    };

    let r;
    try {
      r = await attempt();
    } catch (e) {
      r = { landed: null, why: e.message.slice(0, 80) };
    }
    const accepts = (landed) => landed === target || landed === GUARD_REDIRECTS[target];
    if (!accepts(r.landed)) {
      try {
        r = await attempt(); // one retry absorbs a slow hydration race
      } catch (e) {
        r = { landed: null, why: e.message.slice(0, 80) };
      }
    }
    if (accepts(r.landed)) clickOk += 1;
    else clickFails.push([target, source, r]);
  }

  await browser.close();

  // ── Report ───────────────────────────────────────────────────────────────
  const broken = results.filter(([, d]) => d.is404).map(([p]) => p);
  const errored = results.filter(([, d]) => d.errors.length);

  console.log(`\nRoutes crawled : ${results.length}`);
  console.log(`Asset links    : ${assetLinks.size - badAssets.length}/${assetLinks.size} OK`);
  console.log(`Click-throughs : ${clickOk}/${firstSeen.size} landed correctly`);

  for (const p of broken) console.log(`  x  404 or unresolved: ${p}`);
  for (const [a, st] of badAssets) console.log(`  x  asset ${a} -> ${st}`);
  for (const [p, d] of errored) console.log(`  !  console errors on ${p}: ${d.errors[0]}`);
  for (const [t, s, r] of clickFails) {
    console.log(`  x  click ${t} (from ${s}) landed on ${r.landed ?? "nowhere"}${r.why ? ` — ${r.why}` : ""}`);
  }

  const failed = broken.length + badAssets.length + clickFails.length + errored.length;
  if (failed) {
    console.log(`\n${failed} problem(s) found.`);
    process.exit(1);
  }
  console.log("\nAll links resolve.");
}

main().catch((e) => {
  console.error("crawl failed:", e);
  process.exit(1);
});
