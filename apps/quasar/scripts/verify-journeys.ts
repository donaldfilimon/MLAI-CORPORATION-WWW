/** Isolated real-service/Next-preview acceptance. Generation is a declared fixture. */
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { parseArgs } from 'node:util';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createServer } from '../packages/service/src/server';
import { PreviewManager } from '../packages/service/src/preview';
import type { Site, PreviewStatus } from '../packages/shared/src';
const root = path.resolve(import.meta.dir, '..');
const { values } = parseArgs({ options: { output: { type: 'string' } }, strict: true });
assert.ok(values.output, 'Pass --output with a new receipt filename.');
const output = path.resolve(values.output);
await mkdir(path.dirname(output), { recursive: true });
// Reserve the receipt before touching any service, refusing historical overwrite.
await writeFile(output, '', { flag: 'wx' });
function digest() {
  const h = createHash('sha256');
  const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean).sort();
  for (const file of new Set(files)) {
    if (file.startsWith('docs/') || file.endsWith('.md')) continue;
    h.update(file).update('\0').update(readFileSync(path.join(root, file)));
  }
  return h.digest('hex');
}
const sourceSha256 = digest();
const home = await mkdtemp(path.join(tmpdir(), 'mlai-quasar-journeys-'));
const preview = new PreviewManager();
let generations = 0;
const engine = async ({ siteDir, onEvent }: { siteDir: string; onEvent: (event: any) => void }) => {
  generations++;
  await writeFile(path.join(siteDir, 'app/page.tsx'), 'export default function Page() { return <main><h1>Isolated Quasar acceptance</h1></main>; }\n');
  onEvent({ type: 'text', text: 'Synthetic fixture wrote the acceptance page.' });
  onEvent({ type: 'done' });
};
const makeServer = (port: number) => createServer({ home, templateDir: path.join(root, 'templates/next-site'), engine, makeClient: () => ({} as never), preview, scaffoldInstall: false, port });
let server = makeServer(0);
const port = server.port;
const base = `http://127.0.0.1:${port}`;
const receipt: Record<string, any> = { checkedAt: new Date().toISOString(), sourceSha256, baseCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(), base, home, checks: [], generation: 'injected fixture, no provider requests', liveAnthropic: 'not exercised by this fixture verifier; see acceptance ledger for credential preflight' };
let previewUrl: string | null = null;
async function request<T>(route: string, method = 'GET', body?: unknown): Promise<T> {
  const response = await fetch(`${base}${route}`, { method, headers: body ? { 'content-type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(120_000) });
  assert.ok(response.ok, `${method} ${route}: ${response.status} ${await response.clone().text()}`);
  return response.status === 204 ? undefined as T : await response.json() as T;
}
async function idle(id: string) {
  for (let n = 0; n < 100; n++) {
    const site = await request<Site>(`/api/sites/${id}`);
    if (site.status === 'idle') return site;
    assert.notEqual(site.status, 'error');
    await Bun.sleep(100);
  }
  throw new Error('Fixture generation did not become idle');
}
try {
  assert.deepEqual(await request('/api/sites'), []);
  const site = await request<Site>('/api/sites', 'POST', { name: 'Journey acceptance', prompt: 'Render the synthetic acceptance heading.' });
  await idle(site.id);
  assert.equal(generations, 1);
  const events = await request<{ events: unknown[]; next: number }>(`/api/sites/${site.id}/events?since=0`);
  assert.equal(events.events.length, 2);
  assert.deepEqual((await request<{ events: unknown[] }>(`/api/sites/${site.id}/events?since=${events.next}`)).events, []);
  receipt.checks.push('Create, terminal state and event cursor catch-up without duplicate events');
  const siteDir = path.join(home, 'sites', site.slug);
  const install = Bun.spawn(['bun', 'install', '--frozen-lockfile'], { cwd: siteDir, stdout: 'pipe', stderr: 'pipe' });
  const installResult = await Promise.all([install.exited, new Response(install.stdout).text(), new Response(install.stderr).text()]);
  assert.equal(installResult[0], 0, `Frozen scaffold install: ${installResult[2]}`);
  const started = await request<PreviewStatus>(`/api/sites/${site.id}/preview/start`, 'POST');
  assert.equal(started.state, 'running', started.logTail.join('\n'));
  assert.ok(started.url);
  previewUrl = started.url;
  const html = await (await fetch(previewUrl, { signal: AbortSignal.timeout(30_000) })).text();
  assert.ok(html.includes('Isolated Quasar acceptance'));
  receipt.checks.push('Real copied Next template, frozen install, actual preview process and rendered synthetic heading');
  await request(`/api/sites/${site.id}/preview/stop`, 'POST');
  assert.equal((await request<PreviewStatus>(`/api/sites/${site.id}/preview`)).state, 'stopped');
  server.stop(true);
  await assert.rejects(() => fetch(`${base}/api/sites`, { signal: AbortSignal.timeout(1000) }));
  server = makeServer(port);
  const restored = await request<Site[]>('/api/sites');
  assert.equal(restored.length, 1);
  assert.equal(restored[0]?.id, site.id);
  assert.equal(restored[0]?.promptHistory.length, 1);
  assert.equal(generations, 1);
  receipt.checks.push('Service disconnect and restart preserve site and prompt history without replaying generation');
  const restarted = await request<PreviewStatus>(`/api/sites/${site.id}/preview/start`, 'POST');
  assert.equal(restarted.state, 'running');
  assert.ok((await (await fetch(restarted.url!)).text()).includes('Isolated Quasar acceptance'));
  // Drive the exported Expo client against this disposable service.
  const playwright = createRequire(path.join(root, '../web/.ds-sync/package.json'))('playwright');
  const dist = path.join(root, 'apps/quasar/dist');
  const ui = Bun.serve({ hostname: '127.0.0.1', port: 0, async fetch(req) {
    const pathname = decodeURIComponent(new URL(req.url).pathname);
    let file = path.resolve(dist, `.${pathname}`);
    if (!file.startsWith(`${dist}/`) && file !== dist) return new Response('', { status: 403 });
    if (pathname === '/') file = path.join(dist, 'index.html');
    else if (pathname.startsWith('/site/')) file = path.join(dist, 'site/[id].html');
    else if (!path.extname(file)) file += '.html';
    return await Bun.file(file).exists() ? new Response(Bun.file(file)) : new Response('Not found', { status: 404 });
  } });
  let browser: any;
  let page: any;
  try {
    browser = await playwright.chromium.launch();
    page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
    const mutations: string[] = [];
    const pageErrors: string[] = [];
    page.on('request', (r: any) => { if (['POST', 'DELETE'].includes(r.method()) && r.url().startsWith(base)) mutations.push(r.url()); });
    page.on('pageerror', (e: Error) => pageErrors.push(e.message));
    const uiBase = `http://127.0.0.1:${ui.port}`;
    await page.goto(`${uiBase}/settings`);
    await page.getByPlaceholder('http://localhost:4700').fill(`${base}/`);
    await page.getByText('Save and test connection', { exact: true }).click();
    await page.getByText('Connected. 1 sites available.', { exact: true }).waitFor();
    await page.reload();
    await page.waitForFunction((origin: string) => document.querySelector('input')?.value === origin, base);
    await page.goto(uiBase);
    await page.getByText('Journey acceptance', { exact: true }).click();
    await page.frameLocator('iframe').getByRole('heading', { name: 'Isolated Quasar acceptance' }).waitFor();
    receipt.checks.push('Chromium exported Expo settings save/test, restart hydration, site discovery and actual preview iframe');
    server.stop(true);
    await page.getByText('Retry / refresh state', { exact: true }).waitFor();
    await page.getByText('Open settings', { exact: true }).waitFor();
    await page.route(`${base}/api/sites`, async (route: any) => { server = makeServer(port); await route.continue(); }, { times: 1 });
    await page.getByText('Retry / refresh state', { exact: true }).click();
    await page.getByText('Retry / refresh state', { exact: true }).waitFor({ state: 'hidden' });
    await page.frameLocator('iframe').getByRole('heading', { name: 'Isolated Quasar acceptance' }).waitFor();
    assert.deepEqual(mutations, []);
    assert.equal(generations, 1);
    assert.deepEqual(pageErrors, []);
    const artifacts = `${output}.artifacts`;
    await mkdir(artifacts);
    await page.screenshot({ path: path.join(artifacts, 'quasar-recovered.png'), fullPage: true });
    receipt.checks.push('Browser disconnect displays Retry/Open settings; recovery performs zero mutations and preserves preview');
    receipt.browserArtifacts = artifacts;
    await page.goto(`${uiBase}/new`);
    await page.getByPlaceholder('My site').fill('Browser uncertain');
    await page.getByPlaceholder('Describe the site you want built...').fill('Synthetic browser recovery task.');
    let appliedId: string | undefined;
    await page.route(`${base}/api/sites`, async (route: any) => {
      if (route.request().method() !== 'POST') return route.continue();
      const applied = await route.fetch();
      appliedId = (await applied.json()).id;
      await route.abort('failed'); // Server committed, browser did not receive the outcome.
    }, { times: 1 });
    await page.getByText('Create site', { exact: true }).click();
    await page.getByText('Retry / refresh state', { exact: true }).waitFor();
    assert.ok(appliedId);
    await idle(appliedId);
    await page.getByText('Create site', { exact: true }).click();
    await page.getByText(/Previous action outcome is uncertain/).waitFor();
    assert.equal(mutations.length, 1);
    await page.getByText('Retry / refresh state', { exact: true }).click();
    await page.getByText('Browser uncertain', { exact: true }).waitFor();
    assert.equal(mutations.length, 1);
    assert.equal((await request<Site>(`/api/sites/${appliedId}`)).promptHistory.length, 1);
    assert.equal(generations, 2);
    receipt.checks.push('Lost create response after committed write: repeated Create sends no second request; explicit recovery discovers the single saved site');
    const other = createServer({ home: path.join(home, 'other-service'), templateDir: path.join(root, 'templates/next-site'), engine, makeClient: () => ({} as never), preview: new PreviewManager(), scaffoldInstall: false, port: 0 });
    try {
      const otherBase = `http://127.0.0.1:${other.port}`;
      await page.goto(`${uiBase}/settings`);
      await page.getByPlaceholder('http://localhost:4700').fill(otherBase);
      await page.getByText('Save and test connection', { exact: true }).click();
      await page.getByText('Connected. 0 sites available.', { exact: true }).waitFor();
      await page.goto(uiBase);
      await page.getByText('No sites yet. Tap ＋ New to create one.', { exact: true }).waitFor();
      assert.equal(await page.getByText('Journey acceptance', { exact: true }).count(), 0);
      assert.equal(await page.getByText('Browser uncertain', { exact: true }).count(), 0);
      await page.reload();
      await page.getByText('No sites yet. Tap ＋ New to create one.', { exact: true }).waitFor();
      assert.equal(generations, 2);
      receipt.checks.push('Changing to another isolated origin clears previous sites and persists across reload without replaying mutations');
    } finally { other.stop(true); }
    await request(`/api/sites/${appliedId}`, 'DELETE');
  } catch (error) {
    if (page) { receipt.browserFailure = { url: page.url(), text: await page.locator('body').innerText() }; await page.screenshot({ path: `${output}.failure.png`, fullPage: true }); }
    throw error;
  } finally { await browser?.close(); ui.stop(true); }
  await request(`/api/sites/${site.id}`, 'DELETE');
  assert.deepEqual(await request('/api/sites'), []);
  receipt.checks.push('Explicit preview restart recovers saved source; delete stops preview and removes isolated registry entry');
  receipt.passed = true;
} catch (error) {
  receipt.failure = error instanceof Error ? error.message : String(error);
  process.exitCode = 1;
} finally {
  await preview.stopAll();
  server.stop(true);
  receipt.processCleanup = true;
  for (const url of [base, previewUrl].filter(Boolean) as string[]) {
    try { await fetch(url, { signal: AbortSignal.timeout(1000) }); receipt.processCleanup = false; } catch {}
  }
  receipt.stableSource = digest() === sourceSha256;
  receipt.passed = receipt.passed === true && receipt.processCleanup && receipt.stableSource;
  if (!receipt.passed) process.exitCode = 1;
  await rm(home, { recursive: true, force: true }); // Only our mkdtemp-owned source/data.
  receipt.ownedDataRemoved = true;
  await writeFile(output, `${JSON.stringify(receipt, null, 2)}\n`);
  console.log(JSON.stringify(receipt, null, 2));
}
