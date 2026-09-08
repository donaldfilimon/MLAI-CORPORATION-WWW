import { searchPageResults, highlightMatches, isLocalRoute, type Searchable } from './search';
import { isEditing, type Scope } from './dom';
export function setupSearch(scope: Scope): void {
  const { root, one, all, on } = scope;
  const dialog = one<HTMLDialogElement>('#search-dialog');
  const input = one<HTMLInputElement>('#search-input');
  const results = one<HTMLElement>('#search-results');
  const count = one<HTMLElement>('#search-count');
  const clear = one<HTMLButtonElement>('[data-search-clear]');
  if (!dialog || !input || !results) return;
  let entries: Searchable[] = [];
  try {
    const data: unknown = JSON.parse(one<HTMLScriptElement>('#search-index')?.textContent || '[]');
    if (Array.isArray(data)) entries = data.filter((entry): entry is Searchable => entry && ['url','title','body','description','group'].every(key => typeof entry[key] === 'string') && isLocalRoute(entry.url));
  } catch { /* Search remains usable with an explicit empty-result state. */ }
  let selected = -1;
  let links: HTMLAnchorElement[] = [];
  let trigger: HTMLElement | null = null;
  const highlight = (node: HTMLElement, text: string) => {
    for (const part of highlightMatches(text, input.value)) {
      if (part.match) { const mark = root.createElement('mark'); mark.textContent = part.text; node.append(mark); }
      else node.append(root.createTextNode(part.text));
    }
  };
  function select(index: number, scroll = true) {
    selected = links.length ? Math.max(0, Math.min(index, links.length - 1)) : -1;
    links.forEach((link, i) => { link.classList.toggle('selected', i === selected); link.setAttribute('aria-selected', String(i === selected)); });
    if (links[selected]) {
      input!.setAttribute('aria-activedescendant', links[selected].id);
      if (scroll) links[selected].scrollIntoView({ block: 'nearest' });
    } else input!.removeAttribute('aria-activedescendant');
  }
  function renderSearch() {
    const found = searchPageResults(input!.value, entries);
    results!.replaceChildren(); links = [];
    if (clear) clear.hidden = !input!.value;
    if (count) count.textContent = !found.query ? 'Suggested reading' : found.total > found.results.length ? `${found.results.length} of ${found.total} results — refine your search` : `${found.total} ${found.total === 1 ? 'result' : 'results'}`;
    for (const [index, result] of found.results.entries()) {
      const link = root.createElement('a'); link.href = result.url; link.className = 'search-result';
      link.id = `search-option-${index}`; link.role = 'option'; link.tabIndex = -1;
      const group = root.createElement('span'), title = root.createElement('strong'), snippet = root.createElement('p');
      group.textContent = result.entry.group + (result.url.includes('#') ? ' · Jump to section' : '');
      highlight(title, result.entry.title); highlight(snippet, result.excerpt);
      link.append(group, title, snippet); results!.append(link); links.push(link);
    }
    if (!links.length) {
      const message = root.createElement('p'); message.className = 'search-empty'; message.setAttribute('role', 'presentation');
      message.textContent = 'No matching pages. Try “storage”, “Rust”, or “evidence”.'; results!.append(message);
    }
    select(0, false);
  }
  const open = (from: HTMLElement | null) => {
    trigger = from || root.activeElement as HTMLElement;
    one<HTMLDialogElement>('#mobile-menu')?.close();
    if (!dialog.open) dialog.showModal();
    input.setAttribute('aria-expanded', 'true'); renderSearch(); input.focus(); input.select();
  };
  all<HTMLButtonElement>('[data-search-open]').forEach(button => on(button, 'click', () => open(button)));
  all<HTMLButtonElement>('[data-search-close]').forEach(button => on(button, 'click', () => dialog.close()));
  on(dialog, 'close', () => {
    input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant');
    if (trigger?.isConnected && trigger.getClientRects().length) trigger.focus();
  });
  on(input, 'input', renderSearch);
  on(clear, 'click', () => { input.value = ''; renderSearch(); input.focus(); });
  on<KeyboardEvent>(input, 'keydown', event => {
    if (event.isComposing) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); select(selected + (event.key === 'ArrowDown' ? 1 : -1)); }
    else if (event.key === 'Enter' && links[selected]) { event.preventDefault(); links[selected].click(); }
  });
  on<MouseEvent>(results, 'mousemove', event => {
    const link = (event.target as Element).closest<HTMLAnchorElement>('a.search-result');
    if (link && links.includes(link)) select(links.indexOf(link), false);
  });
  on<MouseEvent>(results, 'click', event => { if ((event.target as Element).closest('a')) dialog.close(); });
  on<KeyboardEvent>(root, 'keydown', event => {
    if (event.isComposing || event.altKey || !(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k') return;
    if (isEditing(event.target) && event.target !== input) return;
    event.preventDefault(); if (dialog.open) dialog.close(); else open(root.activeElement as HTMLElement);
  });
  scope.onCleanup(() => { if (dialog.open) dialog.close(); input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); });
}
