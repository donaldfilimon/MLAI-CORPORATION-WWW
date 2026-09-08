import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { expect, it } from 'vitest';

it('combines text, topic, type, and tag state and restores a shared URL', () => {
  const listeners: Record<string, () => void> = {};
  const fields = { q: { value: '' }, track: { value: '' }, type: { value: '' } };
  const cards = [
    { dataset: { publicationTag: 'RESEARCH', track: 'wdbx', type: 'research-note' }, textContent: 'Memory and traceable retrieval', hidden: false },
    { dataset: { publicationTag: 'OVERVIEW', track: 'ai', type: 'overview' }, textContent: 'Agent behavior', hidden: false },
  ];
  const buttons = ['All', 'RESEARCH'].map(tag => ({ dataset: { filter: tag }, pressed: tag === 'All',
    getAttribute(key: string) { return key === 'aria-pressed' ? String(this.pressed) : tag; },
    setAttribute(_key: string, value: string) { this.pressed = value === 'true'; },
    addEventListener() {},
  }));
  const status = { textContent: '' };
  let saved = '';
  const location = { pathname: '/research', search: '?q=memory&track=wdbx&type=research-note', hash: '' };
  runInNewContext(readFileSync('scripts/research-discovery.js', 'utf8'), {
    URLSearchParams, location, queueMicrotask: (fn: () => void) => fn(),
    history: { replaceState: (_state: unknown, _title: string, url: string) => { saved = url; } },
    window: { addEventListener: (event: string, fn: () => void) => { listeners[event] = fn; } },
    document: {
      querySelector: () => ({ elements: { namedItem: (key: keyof typeof fields) => fields[key] }, addEventListener: (event: string, fn: () => void) => { listeners[event] = fn; } }),
      querySelectorAll: (selector: string) => selector === '[data-filter]' ? buttons : cards,
      getElementById: () => status,
    },
  });
  expect(cards.map(c => c.hidden)).toEqual([false, true]);
  expect(status.textContent).toBe('1 publications shown.');
  fields.q.value = 'absent'; listeners.input!();
  expect(cards.every(c => c.hidden)).toBe(true);
  expect(saved).toContain('q=absent');
  location.search = '?track=ai'; listeners.popstate!();
  expect(cards.map(c => c.hidden)).toEqual([true, false]);
});
