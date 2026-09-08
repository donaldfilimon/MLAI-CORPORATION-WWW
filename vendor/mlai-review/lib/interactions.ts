import { createScope, copyText, selectText } from './dom';
import { setupChrome } from './chrome-ui';
import { setupSearch } from './search-ui';
import { setupFilters } from './filter-ui';
import { setupReading } from './reading-ui';
import { setupBrief } from './brief-ui';

const lifetimes = new WeakMap<Document, () => void>();

/** Each enhancement owns a focused surface; one abortable lifetime works in both renderers. */
export function initInteractions(root: Document = document): () => void {
  lifetimes.get(root)?.();
  const scope = createScope(root);
  setupChrome(scope);
  setupSearch(scope);
  setupFilters(scope);
  setupReading(scope);
  setupBrief(scope);
  scope.all<HTMLButtonElement>('[data-copy-code]').forEach(button => scope.on(button, 'click', () => {
    void (async () => {
      const block = button.closest('.code-block'), code = block?.querySelector('code');
      const pre = block?.querySelector('pre'), status = block?.querySelector('.copy-status');
      if (!code) return;
      const success = await copyText(scope, code.textContent || '');
      if (scope.signal.aborted) return;
      const message = success ? 'Code copied.' : 'Clipboard unavailable. The code is selected; copy it manually.';
      if (status) status.textContent = message;
      scope.toast(message);
      const label = button.querySelector('span');
      if (label) { label.textContent = success ? 'Copied' : 'Select & copy'; scope.delay(() => label.textContent = 'Copy', 3500); }
      if (!success && pre) selectText(scope, pre);
    })();
  }));
  const cleanup = () => {
    scope.cleanup();
    if (lifetimes.get(root) === cleanup) lifetimes.delete(root);
  };
  lifetimes.set(root, cleanup);
  return cleanup;
}
