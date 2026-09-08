// Layer richer discovery over the retained tag-filter enhancement.
(() => {
  const form = document.querySelector('.preview-discovery');
  if (!form) return;
  const cards = Array.from(document.querySelectorAll('[data-publication-tag]'));
  const buttons = Array.from(document.querySelectorAll('[data-filter]'));
  const fields = ['q', 'track', 'type'];
  function apply(save) {
    const params = new URLSearchParams(location.search);
    const values = Object.fromEntries(fields.map(key => [key, form.elements.namedItem(key).value]));
    const tag = buttons.find(button => button.getAttribute('aria-pressed') === 'true')?.getAttribute('data-filter') || 'All';
    const words = values.q.toLowerCase().trim().split(/\s+/).filter(Boolean);
    let shown = 0;
    for (const card of cards) {
      card.hidden = (tag !== 'All' && card.dataset.publicationTag !== tag)
        || (values.track !== '' && card.dataset.track !== values.track)
        || (values.type !== '' && card.dataset.type !== values.type)
        || !words.every(word => card.textContent.toLowerCase().includes(word));
      if (!card.hidden) shown++;
    }
    document.getElementById('publication-status').textContent = shown ? `${shown} publications shown.` : 'No research matches these filters. Clear filters to explore the collection.';
    if (save) {
      for (const key of fields) values[key] ? params.set(key, values[key]) : params.delete(key);
      tag === 'All' ? params.delete('tag') : params.set('tag', tag);
      history.replaceState(null, '', `${location.pathname}${params.size ? '?' + params : ''}${location.hash}`);
    }
  }
  function restore() {
    const params = new URLSearchParams(location.search);
    for (const key of fields) {
      const field = form.elements.namedItem(key);
      field.value = params.get(key) || '';
      if (field.selectedIndex === -1) field.value = '';
    }
    const requested = params.get('tag');
    const tag = buttons.some(b => b.dataset.filter === requested) ? requested : 'All';
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.filter === tag));
    apply(false);
  }
  form.addEventListener('input', () => apply(true));
  form.addEventListener('change', () => apply(true));
  form.addEventListener('submit', event => { event.preventDefault(); apply(true); });
  form.addEventListener('reset', () => queueMicrotask(() => {
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.filter === 'All'));
    apply(true);
  }));
  for (const button of buttons) button.addEventListener('click', () => apply(true));
  window.addEventListener('popstate', restore);
  restore();
})();
