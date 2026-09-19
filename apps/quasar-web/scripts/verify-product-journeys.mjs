#!/usr/bin/env node
/** Browser acceptance for product discovery; does not start or replace a server. */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync, lstatSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { execFileSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { values } = parseArgs({ options: { 'base-url': { type: 'string' }, 'static-url': { type: 'string' }, output: { type: 'string' }, 'allow-self-signed': { type: 'boolean', default: false } } });
assert.ok(values['base-url'], 'Pass --base-url for an existing isolated production server.');
const base = new URL(values['base-url']).origin;
assert.ok(values['static-url'], 'Pass --static-url for an isolated standalone Pages server.');
assert.ok(!values['allow-self-signed'] || ['127.0.0.1', 'localhost', '[::1]'].includes(new URL(base).hostname), 'Self-signed allowance is loopback only.');
const staticBase = new URL(values['static-url']).origin;
assert.ok(!values['allow-self-signed'] || ['127.0.0.1', 'localhost', '[::1]'].includes(new URL(staticBase).hostname), 'Self-signed allowance also requires a loopback static server.');
const output = resolve(root, values.output || `output/playwright/product-journeys-${Date.now()}`);
mkdirSync(dirname(output), { recursive: true });
mkdirSync(output); // Deliberately refuse to replace any earlier report.
let playwright;
for (const from of [join(root, 'package.json'), join(root, '.ds-sync/package.json')]) {
  try { const module = await import(createRequire(from).resolve('playwright')); playwright = module.default ?? module; break; } catch {}
}
assert.ok(playwright, 'Install Playwright in this app or its documented .ds-sync tooling environment.');
function sourceDigest() {
  const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean).sort();
  const hash = createHash('sha256');
  for (const file of files) {
    if (file.startsWith('docs/') || !lstatSync(join(root, file)).isFile()) continue;
    hash.update(file).update('\0').update(readFileSync(join(root, file)));
  }
  return hash.digest('hex');
}
const sourceSha256 = sourceDigest();
const receipt = { sourceSha256, checkedAt: new Date().toISOString(), baseCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(), base, staticBase, selfSignedLoopback: values['allow-self-signed'], engines: [], limitations: ['Native screen-reader and actual browser zoom are not evaluated by this harness.'] };
try {
  for (const engine of ['chromium', 'firefox', 'webkit']) {
    const browser = await playwright[engine].launch();
    const result = { engine, checks: [], uncaughtErrors: [] };
    receipt.engines.push(result);
    try {
      const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, reducedMotion: 'reduce', ignoreHTTPSErrors: values['allow-self-signed'] });
      const page = await context.newPage();
      page.on('pageerror', (error) => result.uncaughtErrors.push(error.message));
      async function visit(path) {
        const response = await page.goto(`${base}${path}`, { waitUntil: 'load' });
        assert.ok([200, 304].includes(response?.status()), `${engine}: ${path} returned ${response?.status()}`);
        await page.locator('main h1').first().waitFor();
        await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('main h1')).opacity) === 1);
        assert.ok((await page.locator('main h1').first().innerText()).trim());
        result.checks.push(`Successful navigation and visible heading: ${path}`);
      }
      await visit('/products');
      for (const slug of ['abi', 'abbey', 'wdbx', 'quasar']) {
        assert.ok(await page.locator(`main a[href="/products/${slug}"]`).count(), `Missing product discovery ${slug}`);
      }
      // Reach a real navigation link by keyboard, then activate it.
      await page.locator('body').click({ position: { x: 1, y: 1 } });
      let keyboardLink = false;
      for (let step = 0; step < 35; step++) {
        await page.keyboard.press(engine === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab');
        keyboardLink = await page.evaluate(() => document.activeElement?.getAttribute('href') === '/get-started');
        if (keyboardLink) break;
      }
      assert.ok(keyboardLink, `${engine}: Get started must be keyboard reachable`);
      await page.keyboard.press('Enter');
      await page.waitForURL(`${base}/get-started`);
      result.checks.push(`Keyboard navigation reaches and opens Get started (${engine === 'webkit' && process.platform === 'darwin' ? 'macOS Option-Tab includes links' : 'Tab'})`);
      for (const width of [390, 768, 1440]) {
        await page.setViewportSize({ width, height: 960 });
        await visit('/get-started');
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${engine}: overflow at ${width}`);
        assert.equal(await page.locator('main a[href*="localhost"],main a[href*="127.0.0.1"]').count(), 0);
        if (width === 390) {
          const toggle = page.getByRole('button', { name: 'Toggle navigation menu' });
          await toggle.click();
          const menu = page.locator('#mobile-navigation');
          await menu.waitFor({ state: 'visible' });
          for (const label of ['Products', 'Research', 'Docs', 'Company', 'Get started']) assert.ok(await menu.getByRole('link', { name: label, exact: true }).count(), `Missing mobile ${label}`);
          await page.keyboard.press('Escape');
          await menu.waitFor({ state: 'hidden' });
          assert.ok(await toggle.evaluate((element) => document.activeElement === element), 'Menu must restore trigger focus');
          result.checks.push('Mobile menu contains all destinations and restores focus on Escape');
        }
        await page.screenshot({ path: join(output, `${engine}-get-started-${width}.png`), fullPage: true, animations: 'disabled' });
      }
      await page.setViewportSize({ width: 1440, height: 960 });
      for (const slug of ['abi', 'abbey', 'wdbx', 'quasar']) {
        await visit('/products');
        await page.locator(`main a[href="/products/${slug}"]`).first().click();
        await page.waitForURL(`${base}/products/${slug}`);
        await page.waitForLoadState('networkidle');
        assert.ok(await page.locator('main a[href^="/research"]').count(), `Missing research path for ${slug}`);
        const researchLink = page.locator('main a[href^="/research/"]').first();
        const destination = await researchLink.getAttribute('href');
        await researchLink.click();
        await page.waitForURL(`${base}${destination}`);
        await page.locator(`main a[href="/products/${slug}"]`).first().click();
        await page.waitForURL(`${base}/products/${slug}`);
        await page.waitForLoadState('networkidle');
        result.checks.push(`Product index → ${slug} → research → product links activated`);
      }
      await visit('/research');
      const filters = page.getByRole('group', { name: 'Filter publications by tag' });
      await filters.getByRole('button').nth(1).click();
      assert.equal(await filters.getByRole('button').nth(1).getAttribute('aria-pressed'), 'true');
      await filters.getByRole('button', { name: 'All', exact: true }).click();
      await page.getByRole('button', { name: 'Search documentation', exact: true }).click();
      await page.getByRole('searchbox', { name: 'Search documentation' }).fill('WDBX');
      await page.getByRole('option').first().waitFor();
      await page.keyboard.press('Escape');
      result.checks.push('Research filtering and documentation search retain results');
      await visit('/research/wdbx-weighted-backtrace-memory-store');
      assert.ok(await page.locator('main a[href="/products/wdbx"]').count(), 'Research must link back to WDBX');
      const pdf = '/research/wdbx-weighted-backtrace-memory-store-2026-09-06.pdf';
      assert.ok(await page.locator(`main a[href="${pdf}"]`).count(), 'Current PDF must remain linked');
      const download = await context.request.get(`${base}${pdf}`);
      assert.equal(download.status(), 200);
      const bytes = await download.body();
      assert.ok(bytes.subarray(0, 5).equals(Buffer.from('%PDF-')));
      assert.equal(createHash('sha256').update(bytes).digest('hex'), createHash('sha256').update(readFileSync(join(root, 'public', pdf))).digest('hex'));
      result.checks.push('Research product backlink and original PDF HTTP bytes verified');
      await page.locator('main a[href="/products/wdbx"]').first().click();
      await page.waitForURL(`${base}/products/wdbx`);
      await page.waitForLoadState('networkidle');
      for (const width of [390, 768, 1440]) {
        await page.setViewportSize({ width, height: 960 });
        assert.equal((await page.goto(staticBase, { waitUntil: 'load' }))?.status(), 200);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Standalone overflow at ${width}`);
        for (const id of ['products', 'research', 'docs', 'company', 'get-started']) {
          await page.getByRole('navigation', { name: 'Primary navigation' }).locator(`a[href="#${id}"]`).click();
          assert.equal(new URL(page.url()).hash, `#${id}`);
          assert.ok(await page.locator(`#${id}`).isVisible());
        }
        for (const slug of ['abi', 'abbey', 'wdbx', 'quasar']) {
          assert.ok(await page.locator(`#${slug} a[href^="https://github.com/"]`).count());
        }
        assert.equal(await page.locator('a[href^="/"],a[href*="localhost"],a[href*="127.0.0.1"]').count(), 0);
        await page.screenshot({ path: join(output, `${engine}-static-${width}.png`), fullPage: true, animations: 'disabled' });
      }
      result.checks.push('Standalone Pages navigation activated at 390/768/1440 with four source setup paths and no server-only links');
      assert.deepEqual(result.uncaughtErrors, [], `${engine}: uncaught browser errors`);
      result.passed = true;
    } finally { await browser.close(); }
  }
} catch (error) {
  receipt.failure = error instanceof Error ? error.message : String(error);
  process.exitCode = 1;
} finally {
  receipt.stableSource = sourceDigest() === sourceSha256;
  if (!receipt.stableSource) process.exitCode = 1;
  writeFileSync(join(output, 'receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`, { flag: 'wx' });
  console.log(JSON.stringify(receipt, null, 2));
}
