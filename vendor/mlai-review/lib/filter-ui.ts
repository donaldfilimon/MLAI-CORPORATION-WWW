import { normalizeSearch, queryTerms } from './search';
import { routeURL, writeQuery, type Scope } from './dom';
export function setupFilters(scope: Scope): void {
  const { one, all, on, win } = scope;
  const input = one<HTMLInputElement>('[data-project-search]');
  const buttons = all<HTMLButtonElement>('[data-project-filter]');
  const rows = all<HTMLElement>('[data-project]');
  let category = 'all';
  const updateProjects = (write = true) => {
    if (!input) return;
    const terms = queryTerms(input.value);
    let visible = 0;
    rows.forEach(row => {
      const text = normalizeSearch(row.dataset.searchText || '');
      const matches = (category === 'all' || row.dataset.category === category) && terms.every(term => text.includes(term));
      row.hidden = !matches; if (matches) visible++;
    });
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.projectFilter === category)));
    const count = one<HTMLElement>('[data-project-count]'), empty = one<HTMLElement>('[data-project-empty]');
    if (count) count.textContent = `${visible} ${visible === 1 ? 'project' : 'projects'}`;
    if (empty) empty.hidden = visible > 0;
    if (write) writeQuery(scope, { q: input.value.trim().slice(0, 100), category: category === 'all' ? '' : category });
  };
  const restoreProjects = () => {
    if (!input) return;
    const url = routeURL(scope), requested = url.searchParams.get('category');
    category = requested && buttons.some(button => button.dataset.projectFilter === requested) ? requested : 'all';
    input.value = (url.searchParams.get('q') || '').slice(0, 100); updateProjects(false);
  };
  restoreProjects(); on(input, 'input', () => updateProjects());
  buttons.forEach(button => on(button, 'click', () => { category = button.dataset.projectFilter || 'all'; updateProjects(); }));
  all<HTMLButtonElement>('[data-project-reset]').forEach(button => on(button, 'click', () => { category = 'all'; if (input) { input.value = ''; input.focus(); } updateProjects(); }));
  on(win, 'popstate', restoreProjects);

  const evidenceInput = one<HTMLInputElement>('[data-evidence-search]');
  const select = one<HTMLSelectElement>('[data-evidence-filter]');
  const evidenceRows = all<HTMLElement>('[data-evidence]');
  const updateEvidence = (write = true) => {
    if (!select || !evidenceInput) return;
    const terms = queryTerms(evidenceInput.value);
    let visible = 0;
    evidenceRows.forEach(row => {
      const text = normalizeSearch(row.dataset.evidenceText || row.textContent || '');
      row.hidden = !(select.value === 'all' || select.value === row.dataset.evidence) || !terms.every(term => text.includes(term));
      if (!row.hidden) visible++;
    });
    const count = one<HTMLElement>('[data-evidence-count]'), empty = one<HTMLElement>('[data-evidence-empty]');
    if (count) count.textContent = `${visible} ${visible === 1 ? 'entry' : 'entries'}`;
    if (empty) empty.hidden = visible > 0;
    if (write) writeQuery(scope, { q: evidenceInput.value.trim().slice(0, 100), type: select.value === 'all' ? '' : select.value });
  };
  const restoreEvidence = () => {
    if (!select || !evidenceInput) return;
    const url = routeURL(scope), type = url.searchParams.get('type') || 'all';
    select.value = Array.from(select.options).some(option => option.value === type) ? type : 'all';
    evidenceInput.value = (url.searchParams.get('q') || '').slice(0, 100); updateEvidence(false);
  };
  restoreEvidence(); on(evidenceInput, 'input', () => updateEvidence()); on(select, 'change', () => updateEvidence());
  all<HTMLButtonElement>('[data-evidence-reset]').forEach(button => on(button, 'click', () => {
    if (select) select.value = 'all'; if (evidenceInput) { evidenceInput.value = ''; evidenceInput.focus(); } updateEvidence();
  }));
  on(win, 'popstate', restoreEvidence);
}
