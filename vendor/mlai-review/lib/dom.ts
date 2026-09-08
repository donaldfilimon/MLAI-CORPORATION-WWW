export function createScope(root: Document) {
  const win = root.defaultView || window;
  const controller = new AbortController();
  const signal = controller.signal;
  const timers = new Set<number>();
  const frames = new Set<number>();
  const finalizers = new Set<() => void>();
  let disposed = false;
  const one = <T extends Element>(selector: string) => root.querySelector<T>(selector);
  const all = <T extends Element>(selector: string) => Array.from(root.querySelectorAll<T>(selector));
  const on = <E extends Event>(target: EventTarget | null, type: string, listener: (event: E) => void) => target?.addEventListener(type, listener as EventListener, { signal });
  const delay = (callback: () => void, ms: number) => {
    const id = win.setTimeout(() => { timers.delete(id); if (!signal.aborted) callback(); }, ms);
    timers.add(id); return id;
  };
  const frame = (callback: () => void) => {
    const id = win.requestAnimationFrame(() => { frames.delete(id); if (!signal.aborted) callback(); });
    frames.add(id); return id;
  };
  let toastTimer = 0;
  const toast = (message: string) => {
    const node = one<HTMLElement>('#toast');
    if (!node || signal.aborted) return;
    win.clearTimeout(toastTimer); timers.delete(toastTimer);
    node.textContent = message; node.classList.add('visible');
    toastTimer = delay(() => node.classList.remove('visible'), 4500);
  };
  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    controller.abort(); timers.forEach(id => win.clearTimeout(id)); frames.forEach(id => win.cancelAnimationFrame(id));
    finalizers.forEach(callback => callback());
    const node = one<HTMLElement>('#toast');
    if (node) { node.textContent = ''; node.classList.remove('visible'); }
  };
  return { root, win, signal, one, all, on, delay, frame, toast, onCleanup: (fn: () => void) => { finalizers.add(fn); return () => finalizers.delete(fn); }, cleanup };
}
export type Scope = ReturnType<typeof createScope>;
export async function copyText(scope: Scope, text: string): Promise<boolean> {
  try {
    if (!scope.win.navigator.clipboard?.writeText) return false;
    await scope.win.navigator.clipboard.writeText(text);
    return !scope.signal.aborted;
  } catch { return false; }
}
export function selectText(scope: Scope, element: HTMLElement): void {
  const range = scope.root.createRange(); range.selectNodeContents(element);
  const selection = scope.win.getSelection(); selection?.removeAllRanges(); selection?.addRange(range); element.focus();
}
export function downloadText(scope: Scope, text: string, filename: string): boolean {
  let url: string | null = null;
  try {
    url = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }));
    const address = url;
    const revoke = () => URL.revokeObjectURL(address);
    const release = scope.onCleanup(revoke); scope.delay(() => { revoke(); release(); }, 5000);
    const anchor = scope.root.createElement('a'); anchor.href = url; anchor.download = filename;
    scope.root.body.append(anchor); anchor.click(); anchor.remove(); return true;
  } catch { if (url) URL.revokeObjectURL(url); return false; }
}
export function routeURL(scope: Scope): URL {
  const { location } = scope.win;
  return new URL(scope.root.documentElement.dataset.singleFile === 'true' ? location.hash.slice(1) || '/' : location.pathname + location.search + location.hash, 'https://review.invalid');
}
export function writeQuery(scope: Scope, fields: Record<string, string>): void {
  const url = routeURL(scope);
  for (const [name, value] of Object.entries(fields)) {
    if (value) url.searchParams.set(name, value); else url.searchParams.delete(name);
  }
  const path = url.pathname + url.search + url.hash;
  try { scope.win.history.replaceState(null, '', (scope.root.documentElement.dataset.singleFile === 'true' ? '#' : '') + path); } catch { /* Opaque embedded origins can reject History API writes. */ }
}
export function isEditing(target: EventTarget | null): boolean {
  return target instanceof Element && !!target.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"])');
}
