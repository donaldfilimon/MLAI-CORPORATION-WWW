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
 * `networkidle` is the wrong READINESS signal for this site, and raising the
 * budget makes it worse rather than better. Measured against a production
 * build: /showcase/film serves HTTP 200 in 15ms and fires `load` in 78ms, but
 * reaches networkidle only at 26.6s in isolation -- and during a full crawl,
 * with the cinematic canvas loops and the lazily fetched neural-TTS runtime
 * holding connections open, it does not settle at all. A 30s budget marked one
 * route unreachable; moving to 45s marked FOUR (/showcase/{film,design},
 * /projects/{abbey,gama}), because the extra waiting only lets more routes
 * accumulate open sockets.
 *
 * So navigate on `load`, which is the signal that actually means "the document
 * is here", then wait for idleness only on a short best-effort budget and
 * swallow its timeout. A route that never goes idle is no longer reported as
 * unreachable, and one that does still gets waited for. The click phase never
 * depended on this anyway: client-side navigation starts no new document load,
 * so it waits on the URL itself.
 */
const NAV_TIMEOUT_MS = 30_000;
const SETTLE_TIMEOUT_MS = 5_000;

/** Navigate, then settle if the page is willing to. Never fails on idleness. */
async function gotoSettled(page, url) {
  const res = await page.goto(url, { waitUntil: "load", timeout: NAV_TIMEOUT_MS });
  await page.waitForLoadState("networkidle", { timeout: SETTLE_TIMEOUT_MS }).catch(() => {});
  return res;
}

/**
 * An unauthenticated crawl of the gated console SHOULD see 401s: /console,
 * /console/workspace and /profile each fetch `/api/workspace/*` and friends on
 * mount, and the routes correctly refuse without a session. Measured on
 * /console/workspace: 401 on /api/workspace/{drive,sharepoint,connections}.
 * Counting those as problems would leave `bun run crawl` permanently red, which
 * is how a check stops being read. They are still PRINTED, just not counted --
 * any other console error on those same routes, and any 401 anywhere else,
 * still fails the run.
 */
const AUTH_GATED = [/^\/console(\/|$)/, /^\/profile(\/|$)/];
const isExpectedAuthChallenge = (route, message) =>
  AUTH_GATED.some((r) => r.test(route)) &&
  /Failed to load resource.*status of 40[13]\b/.test(message);

/**
 * `scrollIntoView({ block: "start" })` lands the target's top at a FRACTIONAL
 * offset, not at exactly 0: measured -0.3px for `/#request-path` on a 1280x720
 * viewport, with the section itself 800px tall and filling the whole viewport.
 * A `top >= 0` assertion therefore fails on a fragment that scrolled perfectly,
 * which is how this check reported a false failure on every run. Allow a couple
 * of pixels of sub-pixel slack; a genuinely unrevealed target is off by
 * hundreds.
 */
const REVEAL_SLACK_PX = 2;

/**
 * Prefer a VISIBLE anchor among duplicates. The site renders its nav twice (a
 * desktop bar and a mobile drawer), so `a[href="/docs/architecture"]` matches
 * two elements on /docs and the first in DOM order is the hidden one. Calling
 * `.first()` there makes `click()` wait out its timeout on an element that can
 * never be actionable, reporting "landed on nowhere" for a link that works.
 * Fall back to the first match when nothing is visible, so a genuinely hidden
 * link still gets attempted and fails with a real reason.
 */
async function visibleFirst(locator) {
  const visible = locator.filter({ visible: true });
  return (await visible.count()) > 0 ? visible.first() : locator.first();
}

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
  "/login", "/signup", "/console", "/console/workspace", "/profile", "/changelog", "/demo",
  // The ported /docs/:slug and /projects surfaces. Without these the crawl
  // never reaches a single new route and its "no dead links" result says
  // nothing about them.
  "/projects",
  "/docs/getting-started", "/docs/architecture", "/docs/identity",
  "/docs/gama", "/docs/evidence",
];

/** Auth-guarded routes legitimately bounce to /login — not a broken link. */
const GUARD_REDIRECTS = { "/console": "/login", "/profile": "/login" };

/** One definition of "landing here counts as reaching `target`". */
const accepts = (target, landed) => landed === target || landed === GUARD_REDIRECTS[target];

const ASSET_EXTS = [".pdf", ".md", ".svg", ".xml", ".webmanifest", ".txt", ".png", ".jpg", ".ico"];
const isAsset = (p) => ASSET_EXTS.some((e) => p.toLowerCase().endsWith(e));

/**
 * Strip origin, query and hash so "/docs?x=1#y" and "/docs" are one route.
 *
 * Deliberately no try/catch: BASE is absolute and callers pass hrefs already
 * filtered to a leading "/", so this cannot throw — and returning the raw href
 * on a phantom failure would feed an un-normalized value into `seen`/`queue`
 * as though it were a route. If it ever does throw, the stack is what you want.
 */
function norm(href) {
  return new URL(href, BASE).pathname.replace(/\/$/, "") || "/";
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
    const res = await gotoSettled(page, BASE + route);
    const data = await page.evaluate(() => ({
      title: document.title,
      // SOFT 404: `/blog/[slug]` matches any slug, so a dead <Link> renders the
      // in-page not-found view at HTTP 200. route-meta.ts gives every unknown
      // slug the shared not-found title, so the title is the one signal that
      // covers it. (Body-copy regexes were tried and dropped: the per-view
      // wording — "That lab note doesn't exist." — never matched them, so they
      // were dead weight riding on the title check.)
      softNotFound: /Page Not Found/i.test(document.title),
      links: [
        ...new Set(
          [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")),
        ),
      ].filter((h) => h && h.startsWith("/") && !h.startsWith("//") && !h.startsWith("/api")),
    }));
    // Hard 404s are exact — the server already told us. No prose guessing.
    const is404 = (res?.status() ?? 0) >= 400 || data.softNotFound;
    return { ...data, is404, errors: [...consoleErrors] };
  }

  // ── Phase 1 — BFS discovery, 404 + console checks ────────────────────────
  // `seen` means "ever enqueued", which is what both the dequeue guard and the
  // old O(n) `queue.includes` scan were approximating.
  const seen = new Set(SEEDS.map(norm));
  const queue = [...seen];
  const results = [];
  const navFails = []; // [route, why] — could not be reached at all
  const assetLinks = new Map(); // asset href -> a route that links it
  const firstSeen = new Map(); // route href -> a route where an anchor exists
  const fragmentLinks = new Map(); // cross-route href#fragment -> source route

  while (queue.length) {
    const route = queue.shift();

    let d;
    try {
      d = await visit(route);
    } catch (e) {
      // A connection failure is not a 404 and not a console error. It used to
      // be reported as both, so one dead route counted twice in the total.
      navFails.push([route, e.message.slice(0, 80)]);
      continue;
    }
    results.push([route, d]);

    for (const href of d.links) {
      const n = norm(href);
      if (isAsset(n)) {
        if (!assetLinks.has(n)) assetLinks.set(n, route);
        continue;
      }
      const fragment = new URL(href, BASE).hash;
      if (fragment && n !== route && !fragmentLinks.has(`${n}${fragment}`)) {
        fragmentLinks.set(`${n}${fragment}`, route);
      }
      if (!firstSeen.has(n)) firstSeen.set(n, route);
      if (!seen.has(n)) {
        seen.add(n);
        queue.push(n);
      }
    }
  }

  // ── Asset links are status-checked over HTTP, not crawled ────────────────
  const badAssets = (
    await Promise.all(
      [...assetLinks.keys()].sort().map(async (a) => {
        try {
          const res = await fetch(BASE + a, { method: "HEAD" });
          return res.status >= 400 ? [a, String(res.status)] : null;
        } catch (e) {
          return [a, String(e.message).slice(0, 60)];
        }
      }),
    )
  ).filter(Boolean);

  // ── Phase 2 — click each unique link once and assert where it lands ──────
  // This is the part that actually exercises the router shim: a compiling
  // <Link href> that navigates nowhere only shows up when something clicks it.
  const clickFails = [];
  let clickOk = 0;

  for (const [target, source] of [...firstSeen.entries()].sort()) {
    /**
     * Always resolves to `{ landed, why? }` — never throws. goto/count/click
     * failures used to leak out and were marshalled into that shape by two
     * identical try/catch blocks at the call site; owning it here makes the
     * retry one line instead of fourteen.
     */
    const attempt = async () => {
      try {
        await gotoSettled(page, BASE + source);
        const all = page.locator(`a[href="${target}"], a[href="${target}/"]`);
        if ((await all.count()) === 0) return { landed: null, why: "anchor vanished" };
        const link = await visibleFirst(all);
        await link.click({ timeout: 10_000 });
        // Client-side navigation never starts a new document load, so
        // waitForLoadState("networkidle") resolves IMMEDIATELY (the current
        // page is already idle) and reading page.url() then races the SPA
        // router — measured on `next dev`, the URL updates ~2.5s after
        // networkidle resolves, which made every click-through "land on" its
        // source page. Wait for the URL itself.
        await page
          .waitForURL((u) => accepts(target, norm(u.href)), { timeout: 20_000 })
          .catch(() => {
            /* report wherever we actually are */
          });
        return { landed: norm(page.url()) };
      } catch (e) {
        return { landed: null, why: e.message.slice(0, 80) };
      }
    };

    let r = await attempt();
    if (!accepts(target, r.landed)) r = await attempt(); // absorbs a slow hydration race
    if (accepts(target, r.landed)) clickOk += 1;
    else clickFails.push([target, source, r]);
  }

  // ── Phase 3 — cross-route fragments must reveal their target ────────────
  // `norm()` intentionally removes hashes for route discovery, but URL-only
  // click checks cannot tell whether App Router left the destination section
  // below the viewport. Verify the fragment's rendered position separately.
  const fragmentFails = [];
  let fragmentOk = 0;

  for (const [target, source] of [...fragmentLinks.entries()].sort()) {
    try {
      await gotoSettled(page, BASE + source);
      const all = page.locator(`a[href=${JSON.stringify(target)}]`);
      if ((await all.count()) === 0) throw new Error("anchor vanished");
      const link = await visibleFirst(all);

      await link.click({ timeout: 10_000 });
      await page.waitForURL(
        (u) => `${norm(u.href)}${u.hash}` === target,
        { timeout: 20_000 },
      );

      const id = decodeURIComponent(new URL(target, BASE).hash.slice(1));
      await page.waitForFunction(
        ([targetId, slack]) => {
          const element = document.getElementById(targetId);
          if (!element) return false;
          const { top, bottom } = element.getBoundingClientRect();
          return top >= -slack && top < window.innerHeight && bottom > 0;
        },
        [id, REVEAL_SLACK_PX],
        { timeout: 5_000 },
      );
      fragmentOk += 1;
    } catch (e) {
      fragmentFails.push([target, source, e.message.slice(0, 80)]);
    }
  }

  await browser.close();

  // ── Report ───────────────────────────────────────────────────────────────
  const broken = results.filter(([, d]) => d.is404).map(([p]) => p);
  const withErrors = results.filter(([, d]) => d.errors.length);
  const errored = withErrors.filter(([p, d]) =>
    d.errors.some((e) => !isExpectedAuthChallenge(p, e)),
  );
  const authChallenged = withErrors.filter(([p, d]) =>
    d.errors.every((e) => isExpectedAuthChallenge(p, e)),
  );

  console.log(`\nRoutes crawled : ${results.length}${navFails.length ? ` (+${navFails.length} unreachable)` : ""}`);
  console.log(`Asset links    : ${assetLinks.size - badAssets.length}/${assetLinks.size} OK`);
  console.log(`Click-throughs : ${clickOk}/${firstSeen.size} landed correctly`);
  console.log(`Fragment links : ${fragmentOk}/${fragmentLinks.size} revealed their target`);

  for (const [p, why] of navFails) console.log(`  x  unreachable: ${p} — ${why}`);
  for (const p of broken) console.log(`  x  404 or unresolved: ${p}`);
  for (const [a, st] of badAssets) console.log(`  x  asset ${a} -> ${st}`);
  for (const [p, d] of errored) {
    const real = d.errors.filter((e) => !isExpectedAuthChallenge(p, e));
    console.log(`  x  console errors on ${p}: ${real[0]}`);
  }
  for (const [p, d] of authChallenged) {
    console.log(`  -  expected auth challenge on ${p}: ${d.errors[0]} (not counted)`);
  }
  for (const [t, s, r] of clickFails) {
    console.log(`  x  click ${t} (from ${s}) landed on ${r.landed ?? "nowhere"}${r.why ? ` — ${r.why}` : ""}`);
  }
  for (const [t, s, why] of fragmentFails) {
    console.log(`  x  fragment ${t} (from ${s}) did not reveal its target — ${why}`);
  }

  const failed =
    navFails.length + broken.length + badAssets.length + clickFails.length +
    fragmentFails.length + errored.length;
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
