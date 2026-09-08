import type { Scope } from './dom';
type Theme = 'system' | 'light' | 'dark';
const preferences = new WeakMap<Document, Theme>();
export const themePrepaint = `try{var t=localStorage.getItem('mlai-review-theme-v1');document.documentElement.dataset.theme=(t==='light'||t==='dark')?t:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}catch{document.documentElement.dataset.theme=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}`;
export function setupChrome(scope: Scope): void {
  const { root, win, one, all, on } = scope;
  const media = win.matchMedia('(prefers-color-scheme: dark)');
  if (!preferences.has(root)) {
    let value: Theme = 'system';
    try { const saved = win.localStorage.getItem('mlai-review-theme-v1'); if (saved === 'light' || saved === 'dark') value = saved; } catch { /* A preference is still kept in this document's memory. */ }
    preferences.set(root, value);
  }
  const applyTheme = () => {
    const choice = preferences.get(root) || 'system';
    const dark = choice === 'dark' || (choice === 'system' && media.matches);
    root.documentElement.dataset.theme = dark ? 'dark' : 'light';
    root.documentElement.dataset.themePreference = choice;
    all<HTMLButtonElement>('[data-theme-toggle]').forEach(button => {
      button.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme'); button.setAttribute('aria-pressed', String(dark));
    });
    all<HTMLButtonElement>('[data-theme-choice]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.themeChoice === choice)));
  };
  const choose = (choice: Theme) => {
    preferences.set(root, choice);
    try { if (choice === 'system') win.localStorage.removeItem('mlai-review-theme-v1'); else win.localStorage.setItem('mlai-review-theme-v1', choice); } catch { /* Denied storage must never reset the active theme. */ }
    applyTheme();
  };
  applyTheme(); on(media, 'change', applyTheme);
  all<HTMLButtonElement>('[data-theme-toggle]').forEach(button => on(button, 'click', () => choose(root.documentElement.dataset.theme === 'dark' ? 'light' : 'dark')));
  all<HTMLButtonElement>('[data-theme-choice]').forEach(button => on(button, 'click', () => {
    const choice = button.dataset.themeChoice;
    if (choice === 'system' || choice === 'light' || choice === 'dark') choose(choice);
  }));
  const syncModals = () => root.documentElement.classList.toggle('has-modal', !!one('dialog[open]'));
  const observer = new MutationObserver(syncModals);
  all<HTMLDialogElement>('dialog').forEach(modal => {
    observer.observe(modal, { attributes: true, attributeFilter: ['open'] });
    on<KeyboardEvent>(modal, 'keydown', event => {
      if (event.key !== 'Tab' || !modal.open) return;
      const focusable = Array.from(modal.querySelectorAll<HTMLElement>('a[href],button,input,select,textarea,[tabindex]')).filter(node => node.tabIndex >= 0 && !node.hasAttribute('disabled') && node.getClientRects().length > 0);
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (!first) { event.preventDefault(); modal.focus(); return; }
      if (event.shiftKey && (root.activeElement === first || !modal.contains(root.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (root.activeElement === last || !modal.contains(root.activeElement))) { event.preventDefault(); first.focus(); }
    });
    on<MouseEvent>(modal, 'click', event => {
      if (event.target !== modal) return;
      const box = modal.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) modal.close();
    });
  });
  scope.onCleanup(() => { observer.disconnect(); all<HTMLDialogElement>('dialog[open]').forEach(modal => modal.close()); root.documentElement.classList.remove('has-modal'); });
  const menu = one<HTMLDialogElement>('#mobile-menu');
  let menuTrigger: HTMLElement | null = null;
  all<HTMLButtonElement>('[data-menu-open]').forEach(button => {
    button.setAttribute('aria-expanded', 'false');
    on(button, 'click', () => { menuTrigger = button; button.setAttribute('aria-expanded', 'true'); if (menu && !menu.open) menu.showModal(); });
  });
  all<HTMLButtonElement>('[data-menu-close]').forEach(button => on(button, 'click', () => menu?.close()));
  on(menu, 'close', () => {
    all<HTMLButtonElement>('[data-menu-open]').forEach(button => button.setAttribute('aria-expanded', 'false'));
    if (menuTrigger?.isConnected && menuTrigger.getClientRects().length) menuTrigger.focus();
  });
  on<MouseEvent>(menu, 'click', event => { if ((event.target as Element).closest('a')) menu?.close(); });
  on(win, 'resize', () => { if (win.innerWidth > 900 && menu?.open) menu.close(); });

  const topics = all<HTMLButtonElement>('[data-topic]');
  const selectTopic = (button: HTMLButtonElement) => {
    topics.forEach(node => { node.setAttribute('aria-pressed', String(node === button)); node.setAttribute('aria-selected', String(node === button)); node.tabIndex = node === button ? 0 : -1; });
    all<HTMLElement>('[data-topic-panel]').forEach(panel => panel.hidden = panel.dataset.topicPanel !== button.dataset.topic);
  };
  topics.forEach((button, index) => {
    on(button, 'click', () => selectTopic(button));
    on<KeyboardEvent>(button, 'keydown', event => {
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % topics.length;
      else if (event.key === 'ArrowLeft') next = (index + topics.length - 1) % topics.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = topics.length - 1;
      else return;
      event.preventDefault(); selectTopic(topics[next]); topics[next].focus();
    });
  });
}
