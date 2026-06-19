#!/usr/bin/env node
/*
 * run-mlai-mobile driver — launches and drives the MLAI mobile app's WEB target.
 *
 * The app is Expo / React Native; the surface that runs headlessly is the
 * react-native-web build. This script:
 *   1. serves a pre-built static export (dist/) over http,
 *   2. launches the system Chrome via playwright-core (channel:"chrome" — no
 *      chromium download),
 *   3. screenshots the sign-in screen (always reachable),
 *   4. attempts the "Continue in preview" path into the tabs, and DETECTS
 *      whether it worked. On the stock build it does NOT: expo-secure-store has
 *      an empty web stub, so AuthProvider cannot persist a session and the gate
 *      is impassable on web. Apply the optional shim (see SKILL.md) to unlock
 *      the gated screens — then this script also captures home + tabs.
 *
 * Usage:
 *   node driver.mjs [distDir=dist] [outDir=screenshots]
 * Prereq: `bunx expo export --platform web` produced distDir, and `npm i` ran
 *   in this skill dir (installs playwright-core).
 */
import { chromium } from "playwright-core";
import http from "node:http";
import { stat, mkdir, rm } from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";

const DIST = path.resolve(process.argv[2] || "dist");
const OUT = path.resolve(process.argv[3] || "screenshots");
const PORT = 8099;

const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript",
  ".css": "text/css", ".json": "application/json", ".png": "image/png",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml",
  ".ico": "image/x-icon", ".ttf": "font/ttf", ".otf": "font/otf",
  ".woff": "font/woff", ".woff2": "font/woff2", ".map": "application/json",
};

// Static server: exact file → `<path>.html` → SPA fallback to index.html.
function makeServer(root) {
  return http.createServer(async (req, res) => {
    try {
      let p = decodeURIComponent((req.url || "/").split("?")[0]);
      if (p === "/") p = "/index.html";
      let fp = path.join(root, p);
      let s = await stat(fp).catch(() => null);
      if (s?.isDirectory()) { fp = path.join(fp, "index.html"); s = await stat(fp).catch(() => null); }
      if (!s) { const alt = path.join(root, p + ".html"); if (await stat(alt).catch(() => null)) { fp = alt; s = true; } }
      if (!s) fp = path.join(root, "index.html");
      res.writeHead(200, { "content-type": MIME[path.extname(fp).toLowerCase()] || "application/octet-stream" });
      createReadStream(fp).pipe(res);
    } catch (e) { res.writeHead(500); res.end(String(e)); }
  });
}

async function main() {
  if (!(await stat(DIST).catch(() => null))) {
    console.error(`No build at ${DIST}. Run: bunx expo export --platform web`);
    process.exit(1);
  }
  await rm(OUT, { recursive: true, force: true }); // drop stale shots from prior runs
  await mkdir(OUT, { recursive: true });

  const server = makeServer(DIST);
  await new Promise((r) => server.listen(PORT, r));
  const base = `http://localhost:${PORT}`;
  console.log(`serving ${DIST} at ${base}`);

  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const shots = [];
  const shot = async (name) => {
    const f = path.join(OUT, name);
    await page.screenshot({ path: f });
    shots.push(f);
    console.log("  shot:", f);
  };

  // 1. Boot → client-side auth gate redirects to the sign-in screen.
  await page.goto(base, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500); // let fonts + entering animations settle
  await shot("01-sign-in.png");

  // 2. Try the preview/guest path (Apple sign-in is iOS-only on web).
  //    Target the role=button (not getByText — the hint paragraph above the
  //    button also contains "continue in preview").
  await page.getByRole("button", { name: /continue in preview/i }).first().click().catch(() => {});
  await page.waitForTimeout(2000);

  // 3. Did we get past the gate? (left /sign-in and the tab bar is present)
  const passedGate = !page.url().endsWith("/sign-in") && (await page.getByRole("tab", { name: "Vault" }).count()) > 0;

  if (!passedGate) {
    console.log("\n  GATE NOT PASSED — web build cannot persist a session");
    console.log("  (expo-secure-store has an empty web stub). Only the sign-in");
    console.log("  screen is reachable on web. Apply the shim in SKILL.md to");
    console.log("  unlock the gated screens, or use an iOS simulator.");
    await browser.close();
    await new Promise((r) => server.close(r));
    console.log(`\nDONE — ${shots.length} screenshot in ${OUT} (sign-in only)`);
    return;
  }

  // Shim applied: capture the gated app via the bottom tab bar (role=tab).
  await shot("02-home.png");
  for (const [label, file] of [["Stack", "03-products.png"], ["Vault", "04-vault.png"], ["Company", "05-company.png"]]) {
    await page.getByRole("tab", { name: label }).click({ timeout: 5000 }).catch((e) => console.log(`  (skip ${label}: ${e.message.split("\n")[0]})`));
    await page.waitForTimeout(1200);
    await shot(file);
  }

  await browser.close();
  await new Promise((r) => server.close(r));
  console.log(`\nDONE — ${shots.length} screenshots in ${OUT}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
