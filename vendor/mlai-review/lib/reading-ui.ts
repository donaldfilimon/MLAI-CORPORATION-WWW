import { copyText, downloadText, selectText, type Scope } from './dom';
import { safeDownloadName } from './reading';
export function setupReading(scope: Scope): void {
  const { one, all, on, root, win } = scope;
  const article = one<HTMLElement>('[data-doc-article]');
  if (!article) return;
  const progress = all<HTMLProgressElement>('[data-reading-progress]');
  const percentage = all<HTMLElement>('[data-reading-percent]');
  const tocLinks = all<HTMLAnchorElement>('[data-toc-link]');
  const headings = Array.from(article.querySelectorAll<HTMLElement>('h2[id]'));
  let queued = false, lastPercent = -1, activeID = '';
  function refresh() {
    queued = false;
    const top = article!.getBoundingClientRect().top + win.scrollY;
    const end = top + article!.offsetHeight - win.innerHeight + 100;
    const value = Math.round(Math.min(100, Math.max(0, 100 * (win.scrollY - top + 110) / Math.max(1, end - top + 110))));
    if (value !== lastPercent) {
      progress.forEach(node => node.value = value);
      percentage.forEach(node => node.textContent = `${value}%`);
      lastPercent = value;
    }
    let current = headings[0]?.id || '';
    for (const heading of headings) if (heading.getBoundingClientRect().top <= 140) current = heading.id;
    if (current !== activeID) {
      tocLinks.forEach(link => { if (link.hash === '#' + current) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); });
      activeID = current;
    }
  }
  const schedule = () => { if (!queued) { queued = true; scope.frame(refresh); } };
  on(win, 'scroll', schedule); on(win, 'resize', schedule); refresh();
  const resize = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null;
  resize?.observe(article); scope.onCleanup(() => resize?.disconnect());
  let markdown = '', title = 'guide';
  try {
    const data = JSON.parse(one<HTMLScriptElement>('#article-export')?.textContent || '{}');
    if (typeof data.markdown === 'string' && typeof data.title === 'string') { markdown = data.markdown; title = data.title; }
  } catch { /* Export controls remain disabled for missing or invalid content. */ }
  const message = one<HTMLElement>('[data-article-message]');
  const status = (text: string) => { if (message) message.textContent = text; scope.toast(text); };
  all<HTMLButtonElement>('[data-copy-article]').forEach(button => {
    if (markdown) button.disabled = false;
    on(button, 'click', () => { void (async () => {
      button.disabled = true;
      const success = await copyText(scope, markdown);
      if (scope.signal.aborted) return;
      button.disabled = false;
      if (success) status('Article Markdown copied.');
      else {
        const fallback = one<HTMLDetailsElement>('[data-article-fallback]');
        const output = one<HTMLElement>('[data-article-markdown]');
        if (fallback) { fallback.hidden = false; fallback.open = true; }
        if (output) { output.textContent = markdown; selectText(scope, output); }
        status('Clipboard unavailable. Article Markdown is selected below for manual copying.');
      }
    })(); });
  });
  all<HTMLButtonElement>('[data-download-article]').forEach(button => {
    if (markdown) button.disabled = false;
    on(button, 'click', () => status(downloadText(scope, markdown, safeDownloadName(title, '.md')) ? 'Markdown download requested.' : 'Download unavailable. Use Copy Markdown or the manual-copy fallback.'));
  });
  all<HTMLButtonElement>('[data-print-article]').forEach(button => {
    button.disabled = false;
    on(button, 'click', () => { try { win.print(); } catch { status('Printing is unavailable in this viewer. Download the Markdown instead.'); } });
  });
  on<MouseEvent>(one('.mobile-toc'), 'click', event => {
    if ((event.target as Element).closest('a')) one<HTMLDetailsElement>('.mobile-toc')?.removeAttribute('open');
  });
  scope.onCleanup(() => all<HTMLButtonElement>('[data-copy-article],[data-download-article],[data-print-article]').forEach(button => button.disabled = true));
}
