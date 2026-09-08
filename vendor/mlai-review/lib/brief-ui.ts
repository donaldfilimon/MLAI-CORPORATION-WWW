import { copyText, downloadText, selectText, type Scope } from './dom';
import { safeDownloadName } from './reading';
type Draft = { title: string; area: string; problem: string; outcome: string; constraints: string; prepared: boolean };
const drafts = new WeakMap<Document, Draft>();
const keys = ['title', 'area', 'problem', 'outcome', 'constraints'] as const;
export function setupBrief(scope: Scope): void {
  const { root, one, all, on } = scope;
  const form = one<HTMLFormElement>('#brief-form');
  const fields = one<HTMLFieldSetElement>('[data-brief-fields]');
  const result = one<HTMLElement>('#brief-result');
  const output = one<HTMLElement>('#brief-text');
  if (!form || !fields || !result || !output) return;
  const field = (name: typeof keys[number]) => form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  let draft = drafts.get(root) || { title: '', area: 'Not sure yet', problem: '', outcome: '', constraints: '', prepared: false };
  const read = () => { for (const name of keys) draft[name] = field(name).value; drafts.set(root, draft); };
  const counters = () => all<HTMLElement>('[data-brief-counter]').forEach(node => {
    const name = node.dataset.briefCounter as typeof keys[number];
    const control = field(name) as HTMLTextAreaElement;
    node.textContent = `${control.value.length.toLocaleString('en-US')} / ${control.maxLength.toLocaleString('en-US')}`;
  });
  const error = (name: 'title' | 'problem', invalid: boolean) => {
    field(name).setAttribute('aria-invalid', String(invalid));
    const message = one<HTMLElement>(`#brief-${name}-error`); if (message) message.hidden = !invalid;
  };
  const plain = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const text = () => `# ${plain(draft.title.trim().replace(/[\r\n]/g, ' '))}\n\n## Area of interest\n${plain(draft.area)}\n\n## Problem to solve\n${plain(draft.problem.trim())}\n\n## Intended outcome\n${plain(draft.outcome.trim()) || 'Not specified'}\n\n## Constraints\n${plain(draft.constraints.trim()) || 'Not specified'}\n\n---\nPrepared locally with the MLAI review site. Nothing has been submitted.\n`;
  const render = () => {
    form.hidden = draft.prepared; result.hidden = !draft.prepared;
    if (draft.prepared) output.textContent = text();
  };
  for (const key of keys) field(key).value = draft[key];
  counters(); render();
  on(form, 'input', () => {
    read(); counters();
    if (draft.title.trim().length > 0 && draft.title.length <= 120) error('title', false);
    if (draft.problem.trim().length >= 10 && draft.problem.length <= 2000) error('problem', false);
  });
  on(form, 'change', read);
  on<SubmitEvent>(form, 'submit', event => {
    event.preventDefault(); read();
    const badTitle = !draft.title.trim() || draft.title.length > 120;
    const badProblem = draft.problem.trim().length < 10 || draft.problem.length > 2000;
    error('title', badTitle); error('problem', badProblem);
    if (badTitle || badProblem) { field(badTitle ? 'title' : 'problem').focus(); return; }
    if (draft.outcome.length > 1500 || draft.constraints.length > 500) {
      scope.toast('Please keep the optional fields within their displayed length limits.');
      field(draft.outcome.length > 1500 ? 'outcome' : 'constraints').focus(); return;
    }
    draft.prepared = true; drafts.set(root, draft); render(); one<HTMLElement>('#brief-result-title')?.focus();
  });
  // Enable only AFTER the preventDefault submit handler is installed. Cleanup disables again.
  fields.disabled = false;
  all<HTMLButtonElement>('[data-brief-edit]').forEach(button => on(button, 'click', () => {
    draft.prepared = false; render(); field('title').focus();
  }));
  const status = (message: string) => { const node = one<HTMLElement>('#brief-action-status'); if (node) node.textContent = message; scope.toast(message); };
  all<HTMLButtonElement>('[data-brief-copy]').forEach(button => on(button, 'click', () => { void (async () => {
    if (!draft.prepared) return;
    const success = await copyText(scope, text());
    if (scope.signal.aborted) return;
    status(success ? 'Brief copied. Nothing was sent.' : 'Clipboard unavailable. Select and copy the brief manually.');
    if (!success) selectText(scope, output);
  })(); }));
  all<HTMLButtonElement>('[data-brief-download]').forEach(button => on(button, 'click', () => {
    if (!draft.prepared) return;
    status(downloadText(scope, text(), safeDownloadName(draft.title, '-brief.md')) ? 'Download requested. Nothing was sent.' : 'Download unavailable. Use Copy brief or select the text.');
  }));
  scope.onCleanup(() => { read(); fields.disabled = true; });
}
