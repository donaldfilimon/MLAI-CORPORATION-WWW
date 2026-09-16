import { test, expect } from 'bun:test';
import { SITE_ORIGIN } from '@/lib/site';
import sitemap from '@/app/sitemap';

test('SITE_ORIGIN is an https origin without a trailing slash', () => {
  expect(SITE_ORIGIN.startsWith('https://')).toBe(true);
  expect(SITE_ORIGIN.endsWith('/')).toBe(false);
});

test('sitemap covers all 12 routes including home and /docs', () => {
  const entries = sitemap();
  expect(entries).toHaveLength(12);

  const urls = entries.map((e) => e.url);
  // home ("" route) maps to the bare origin
  expect(urls).toContain(`${SITE_ORIGIN}`);
  expect(urls).toContain(`${SITE_ORIGIN}/docs`);

  // every entry is an absolute URL rooted at the production origin
  for (const url of urls) {
    expect(url.startsWith(SITE_ORIGIN)).toBe(true);
  }
});

test('home route has top priority, others are deprioritized', () => {
  const entries = sitemap();
  const home = entries.find((e) => e.url === SITE_ORIGIN);
  expect(home?.priority).toBe(1);

  const docs = entries.find((e) => e.url === `${SITE_ORIGIN}/docs`);
  expect(docs?.priority).toBe(0.7);
});
