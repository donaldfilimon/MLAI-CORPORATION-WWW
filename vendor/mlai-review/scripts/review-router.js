/* Local hash navigation for the portable review; no changes to Next's router. */
function startReviewRouter() {
  let cleanup = () => {};
  if (document.documentElement.dataset.singleFile !== 'true') { MLAI.initInteractions(document); return; }
  const main = document.querySelector('main');
  const templates = new Map(Array.from(document.querySelectorAll('template[data-route]')).map(template => [template.dataset.route, template]));
  let currentView = '';
  function readRoute() {
    const raw = location.hash.slice(1) || '/';
    try {
      if (!raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\')) throw new Error('Not a local route');
      const url = new URL(raw, 'https://review.invalid');
      const path = url.pathname === '/' ? '/' : '/' + url.pathname.split('/').filter(Boolean).join('/') + '/';
      return { path, search: url.search, anchor: url.hash.slice(1) };
    } catch { return { path: '/404/', search: '', anchor: '' }; }
  }
  function navigate() {
    const { path, search, anchor } = readRoute();
    const key = path + search;
    if (key !== currentView) {
      cleanup();
      const template = templates.get(path) || templates.get('/404/');
      main.replaceChildren(template.content.cloneNode(true));
      document.title = template.dataset.title;
      document.querySelectorAll('.desktop-nav a').forEach(link => {
        if (path.startsWith(link.getAttribute('href'))) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });
      cleanup = MLAI.initInteractions(document); currentView = key;
    }
    if (anchor) {
      let decoded = anchor;
      try { decoded = decodeURIComponent(anchor); } catch { /* Literal fragment still has a safe lookup. */ }
      const target = document.getElementById(decoded);
      if (target) { target.scrollIntoView(); target.tabIndex = -1; target.focus({ preventScroll: true }); }
    } else { window.scrollTo({ top: 0, behavior: 'instant' }); main.focus({ preventScroll: true }); }
  }
  document.addEventListener('click', event => {
    const link = event.target.closest && event.target.closest('a');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.hasAttribute('download')) return;
    const href = link.getAttribute('href');
    if (!href || (!href.startsWith('/') && !href.startsWith('#')) || href.startsWith('//')) return;
    event.preventDefault();
    if (href === '#main') { main.focus(); main.scrollIntoView(); return; }
    const route = readRoute();
    const next = href.startsWith('#') ? route.path + route.search + href : href;
    if (location.hash === '#' + next) navigate(); else location.hash = '#' + next;
  });
  window.addEventListener('hashchange', navigate);
  navigate();
}
startReviewRouter();
