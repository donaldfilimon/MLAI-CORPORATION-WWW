// Progressive enhancement: all article links remain usable without JavaScript.
const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
const publications = Array.from(document.querySelectorAll('[data-publication-tag]'));
for (const button of filterButtons) {
  button.addEventListener('click', () => {
    const tag = button.getAttribute('data-filter');
    for (const other of filterButtons) other.setAttribute('aria-pressed', String(other === button));
    let shown = 0;
    for (const article of publications) {
      article.hidden = tag !== 'All' && article.getAttribute('data-publication-tag') !== tag;
      if (!article.hidden) shown++;
    }
    const status = document.getElementById('publication-status');
    if (status) status.textContent = shown ? `${shown} publications shown.` : 'No publications match that tag.';
  });
}
