(()=>{const factories={"search":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeSearch = normalizeSearch;
exports.queryTerms = queryTerms;
exports.isLocalRoute = isLocalRoute;
exports.searchPageResults = searchPageResults;
exports.searchDocuments = searchDocuments;
exports.matchProject = matchProject;
exports.highlightMatches = highlightMatches;
/** Apply the same normalization to both sides of a search. No query is executable. */
function normalizeSearch(value) {
    return value.normalize('NFKD').replace(/\p{M}/gu, '').toLocaleLowerCase('en-US');
}
function queryTerms(value) {
    return [...new Set(normalizeSearch(value.slice(0, 160)).trim().split(/\s+/).filter(Boolean))];
}
function isLocalRoute(url) {
    return url.startsWith('/') && !url.startsWith('//') && !/[\\\u0000-\u001f]/.test(url);
}
function termScore(text, terms, weight) {
    const normalized = normalizeSearch(text);
    return terms.reduce((score, term) => score + (normalized.includes(term) ? weight : 0), 0);
}
function excerpt(text, terms, length = 190) {
    const clean = text.replace(/\s+/g, ' ').trim();
    if (clean.length <= length)
        return clean;
    const normalized = normalizeSearch(clean);
    const positions = terms.map(term => normalized.indexOf(term)).filter(index => index >= 0);
    const hit = positions.length ? Math.min(...positions) : 0;
    let start = Math.max(0, hit - 55);
    if (start) {
        const wordBoundary = clean.indexOf(' ', start);
        if (wordBoundary >= start && wordBoundary < hit)
            start = wordBoundary + 1;
    }
    let end = Math.min(clean.length, start + length);
    if (end < clean.length) {
        const boundary = clean.lastIndexOf(' ', end);
        if (boundary > hit + 20)
            end = boundary;
    }
    return (start ? '…' : '') + clean.slice(start, end) + (end < clean.length ? '…' : '');
}
/** Rank complete records once; never confuse a displayed limit with the total count. */
function searchPageResults(query, entries, limit = 10) {
    const cleanQuery = query.slice(0, 160).trim();
    const terms = queryTerms(cleanQuery);
    const maximum = Math.max(0, Math.min(100, Number.isFinite(limit) ? Math.floor(limit) : 10));
    const ranked = [];
    entries.forEach((entry, order) => {
        if (!isLocalRoute(entry.url))
            return;
        const sections = entry.sections || [];
        const combined = normalizeSearch([entry.title, entry.description, entry.body, ...sections.map(s => s.title + ' ' + s.text)].join(' '));
        if (terms.length && !terms.every(term => combined.includes(term)))
            return;
        const score = termScore(entry.title, terms, 12) + termScore(entry.description, terms, 4) + termScore(entry.body, terms, 1);
        const titleMatch = terms.length > 0 && terms.every(term => normalizeSearch(entry.title).includes(term));
        const section = sections.map((value, index) => ({ value, index, score: termScore(value.title, terms, 6) + termScore(value.text, terms, 2) }))
            .filter(item => item.score > 0).sort((a, b) => b.score - a.score || a.index - b.index)[0]?.value;
        const target = !titleMatch && section ? entry.url.split('#')[0] + '#' + encodeURIComponent(section.id) : entry.url;
        const context = !terms.length || titleMatch ? entry.description : section?.text || (termScore(entry.description, terms, 1) ? entry.description : entry.body);
        ranked.push({ entry, url: target, excerpt: excerpt(context, terms), score, order });
    });
    ranked.sort((a, b) => b.score - a.score || a.order - b.order);
    return { query: cleanQuery, total: ranked.length, results: ranked.slice(0, terms.length ? maximum : Math.min(maximum, 6)) };
}
/** Compatibility for callers interested only in matched records. */
function searchDocuments(query, entries) {
    return searchPageResults(query, entries).results.map(result => result.entry);
}
function matchProject(query, category, project) {
    const text = normalizeSearch(project.name + ' ' + project.description);
    return (category === 'all' || category === project.category) && queryTerms(query).every(term => text.includes(term));
}
/** Produce text segments, not HTML. Offsets retain Unicode characters and accents. */
function highlightMatches(text, query) {
    const terms = queryTerms(query);
    if (!terms.length || !text)
        return [{ text, match: false }];
    let normalized = '', offset = 0;
    const starts = [], ends = [];
    for (const character of text) {
        const part = normalizeSearch(character);
        for (let i = 0; i < part.length; i++) {
            starts.push(offset);
            ends.push(offset + character.length);
        }
        if (!part && ends.length)
            ends[ends.length - 1] = offset + character.length;
        normalized += part;
        offset += character.length;
    }
    const ranges = [];
    for (const term of terms) {
        let index = normalized.indexOf(term);
        while (index >= 0) {
            ranges.push([starts[index], ends[index + term.length - 1]]);
            index = normalized.indexOf(term, index + Math.max(term.length, 1));
        }
    }
    ranges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const merged = [];
    for (const range of ranges) {
        const previous = merged[merged.length - 1];
        if (previous && range[0] <= previous[1])
            previous[1] = Math.max(previous[1], range[1]);
        else
            merged.push([...range]);
    }
    const parts = [];
    let cursor = 0;
    for (const [start, end] of merged) {
        if (start > cursor)
            parts.push({ text: text.slice(cursor, start), match: false });
        parts.push({ text: text.slice(start, end), match: true });
        cursor = end;
    }
    if (cursor < text.length)
        parts.push({ text: text.slice(cursor), match: false });
    return parts.length ? parts : [{ text, match: false }];
}

},"reading":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.estimateReadingMinutes = estimateReadingMinutes;
exports.articleText = articleText;
exports.articleMarkdown = articleMarkdown;
exports.safeDownloadName = safeDownloadName;
function estimateReadingMinutes(text) {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 220));
}
function articleText(article) {
    return [article.title, article.description, ...article.sections.flatMap(section => [section.title, ...section.paragraphs, section.note || ''])].join('\n\n');
}
/** A portable document derived from canonical content, not copied from rendered chrome. */
function articleMarkdown(article, sources) {
    const blocks = [`# ${article.title}`, article.description];
    for (const section of article.sections) {
        blocks.push(`## ${section.title}`, ...section.paragraphs);
        if (section.code) {
            const longestRun = Math.max(2, ...(section.code.match(/`+/g) || []).map(value => value.length));
            const fence = '`'.repeat(longestRun + 1);
            blocks.push(`${fence}sh\n${section.code}\n${fence}`);
        }
        if (section.note)
            blocks.push(section.note.split('\n').map(line => '> ' + line).join('\n'));
    }
    blocks.push('## Follow the source');
    for (const id of article.sources) {
        const source = sources[id];
        if (source)
            blocks.push(`- [${source.title}](${source.url}) — ${source.scope}`);
    }
    blocks.push('---\nExported from the independent MLAI review. Source descriptions are not independently reproduced test results.');
    return blocks.join('\n\n') + '\n';
}
function safeDownloadName(title, suffix) {
    return (title.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70) || 'mlai-document') + suffix;
}

},"dom":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createScope = createScope;
exports.copyText = copyText;
exports.selectText = selectText;
exports.downloadText = downloadText;
exports.routeURL = routeURL;
exports.writeQuery = writeQuery;
exports.isEditing = isEditing;
function createScope(root) {
    const win = root.defaultView || window;
    const controller = new AbortController();
    const signal = controller.signal;
    const timers = new Set();
    const frames = new Set();
    const finalizers = new Set();
    let disposed = false;
    const one = (selector) => root.querySelector(selector);
    const all = (selector) => Array.from(root.querySelectorAll(selector));
    const on = (target, type, listener) => target?.addEventListener(type, listener, { signal });
    const delay = (callback, ms) => {
        const id = win.setTimeout(() => { timers.delete(id); if (!signal.aborted)
            callback(); }, ms);
        timers.add(id);
        return id;
    };
    const frame = (callback) => {
        const id = win.requestAnimationFrame(() => { frames.delete(id); if (!signal.aborted)
            callback(); });
        frames.add(id);
        return id;
    };
    let toastTimer = 0;
    const toast = (message) => {
        const node = one('#toast');
        if (!node || signal.aborted)
            return;
        win.clearTimeout(toastTimer);
        timers.delete(toastTimer);
        node.textContent = message;
        node.classList.add('visible');
        toastTimer = delay(() => node.classList.remove('visible'), 4500);
    };
    const cleanup = () => {
        if (disposed)
            return;
        disposed = true;
        controller.abort();
        timers.forEach(id => win.clearTimeout(id));
        frames.forEach(id => win.cancelAnimationFrame(id));
        finalizers.forEach(callback => callback());
        const node = one('#toast');
        if (node) {
            node.textContent = '';
            node.classList.remove('visible');
        }
    };
    return { root, win, signal, one, all, on, delay, frame, toast, onCleanup: (fn) => { finalizers.add(fn); return () => finalizers.delete(fn); }, cleanup };
}
async function copyText(scope, text) {
    try {
        if (!scope.win.navigator.clipboard?.writeText)
            return false;
        await scope.win.navigator.clipboard.writeText(text);
        return !scope.signal.aborted;
    }
    catch {
        return false;
    }
}
function selectText(scope, element) {
    const range = scope.root.createRange();
    range.selectNodeContents(element);
    const selection = scope.win.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    element.focus();
}
function downloadText(scope, text, filename) {
    let url = null;
    try {
        url = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }));
        const address = url;
        const revoke = () => URL.revokeObjectURL(address);
        const release = scope.onCleanup(revoke);
        scope.delay(() => { revoke(); release(); }, 5000);
        const anchor = scope.root.createElement('a');
        anchor.href = url;
        anchor.download = filename;
        scope.root.body.append(anchor);
        anchor.click();
        anchor.remove();
        return true;
    }
    catch {
        if (url)
            URL.revokeObjectURL(url);
        return false;
    }
}
function routeURL(scope) {
    const { location } = scope.win;
    return new URL(scope.root.documentElement.dataset.singleFile === 'true' ? location.hash.slice(1) || '/' : location.pathname + location.search + location.hash, 'https://review.invalid');
}
function writeQuery(scope, fields) {
    const url = routeURL(scope);
    for (const [name, value] of Object.entries(fields)) {
        if (value)
            url.searchParams.set(name, value);
        else
            url.searchParams.delete(name);
    }
    const path = url.pathname + url.search + url.hash;
    try {
        scope.win.history.replaceState(null, '', (scope.root.documentElement.dataset.singleFile === 'true' ? '#' : '') + path);
    }
    catch { /* Opaque embedded origins can reject History API writes. */ }
}
function isEditing(target) {
    return target instanceof Element && !!target.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"])');
}

},"chrome-ui":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.themePrepaint = void 0;
exports.setupChrome = setupChrome;
const preferences = new WeakMap();
exports.themePrepaint = `try{var t=localStorage.getItem('mlai-review-theme-v1');document.documentElement.dataset.theme=(t==='light'||t==='dark')?t:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}catch{document.documentElement.dataset.theme=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}`;
function setupChrome(scope) {
    const { root, win, one, all, on } = scope;
    const media = win.matchMedia('(prefers-color-scheme: dark)');
    if (!preferences.has(root)) {
        let value = 'system';
        try {
            const saved = win.localStorage.getItem('mlai-review-theme-v1');
            if (saved === 'light' || saved === 'dark')
                value = saved;
        }
        catch { /* A preference is still kept in this document's memory. */ }
        preferences.set(root, value);
    }
    const applyTheme = () => {
        const choice = preferences.get(root) || 'system';
        const dark = choice === 'dark' || (choice === 'system' && media.matches);
        root.documentElement.dataset.theme = dark ? 'dark' : 'light';
        root.documentElement.dataset.themePreference = choice;
        all('[data-theme-toggle]').forEach(button => {
            button.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
            button.setAttribute('aria-pressed', String(dark));
        });
        all('[data-theme-choice]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.themeChoice === choice)));
    };
    const choose = (choice) => {
        preferences.set(root, choice);
        try {
            if (choice === 'system')
                win.localStorage.removeItem('mlai-review-theme-v1');
            else
                win.localStorage.setItem('mlai-review-theme-v1', choice);
        }
        catch { /* Denied storage must never reset the active theme. */ }
        applyTheme();
    };
    applyTheme();
    on(media, 'change', applyTheme);
    all('[data-theme-toggle]').forEach(button => on(button, 'click', () => choose(root.documentElement.dataset.theme === 'dark' ? 'light' : 'dark')));
    all('[data-theme-choice]').forEach(button => on(button, 'click', () => {
        const choice = button.dataset.themeChoice;
        if (choice === 'system' || choice === 'light' || choice === 'dark')
            choose(choice);
    }));
    const syncModals = () => root.documentElement.classList.toggle('has-modal', !!one('dialog[open]'));
    const observer = new MutationObserver(syncModals);
    all('dialog').forEach(modal => {
        observer.observe(modal, { attributes: true, attributeFilter: ['open'] });
        on(modal, 'keydown', event => {
            if (event.key !== 'Tab' || !modal.open)
                return;
            const focusable = Array.from(modal.querySelectorAll('a[href],button,input,select,textarea,[tabindex]')).filter(node => node.tabIndex >= 0 && !node.hasAttribute('disabled') && node.getClientRects().length > 0);
            const first = focusable[0], last = focusable[focusable.length - 1];
            if (!first) {
                event.preventDefault();
                modal.focus();
                return;
            }
            if (event.shiftKey && (root.activeElement === first || !modal.contains(root.activeElement))) {
                event.preventDefault();
                last.focus();
            }
            else if (!event.shiftKey && (root.activeElement === last || !modal.contains(root.activeElement))) {
                event.preventDefault();
                first.focus();
            }
        });
        on(modal, 'click', event => {
            if (event.target !== modal)
                return;
            const box = modal.getBoundingClientRect();
            if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)
                modal.close();
        });
    });
    scope.onCleanup(() => { observer.disconnect(); all('dialog[open]').forEach(modal => modal.close()); root.documentElement.classList.remove('has-modal'); });
    const menu = one('#mobile-menu');
    let menuTrigger = null;
    all('[data-menu-open]').forEach(button => {
        button.setAttribute('aria-expanded', 'false');
        on(button, 'click', () => { menuTrigger = button; button.setAttribute('aria-expanded', 'true'); if (menu && !menu.open)
            menu.showModal(); });
    });
    all('[data-menu-close]').forEach(button => on(button, 'click', () => menu?.close()));
    on(menu, 'close', () => {
        all('[data-menu-open]').forEach(button => button.setAttribute('aria-expanded', 'false'));
        if (menuTrigger?.isConnected && menuTrigger.getClientRects().length)
            menuTrigger.focus();
    });
    on(menu, 'click', event => { if (event.target.closest('a'))
        menu?.close(); });
    on(win, 'resize', () => { if (win.innerWidth > 900 && menu?.open)
        menu.close(); });
    const topics = all('[data-topic]');
    const selectTopic = (button) => {
        topics.forEach(node => { node.setAttribute('aria-pressed', String(node === button)); node.setAttribute('aria-selected', String(node === button)); node.tabIndex = node === button ? 0 : -1; });
        all('[data-topic-panel]').forEach(panel => panel.hidden = panel.dataset.topicPanel !== button.dataset.topic);
    };
    topics.forEach((button, index) => {
        on(button, 'click', () => selectTopic(button));
        on(button, 'keydown', event => {
            let next = index;
            if (event.key === 'ArrowRight')
                next = (index + 1) % topics.length;
            else if (event.key === 'ArrowLeft')
                next = (index + topics.length - 1) % topics.length;
            else if (event.key === 'Home')
                next = 0;
            else if (event.key === 'End')
                next = topics.length - 1;
            else
                return;
            event.preventDefault();
            selectTopic(topics[next]);
            topics[next].focus();
        });
    });
}

},"search-ui":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSearch = setupSearch;
const search_1 = require("./search");
const dom_1 = require("./dom");
function setupSearch(scope) {
    const { root, one, all, on } = scope;
    const dialog = one('#search-dialog');
    const input = one('#search-input');
    const results = one('#search-results');
    const count = one('#search-count');
    const clear = one('[data-search-clear]');
    if (!dialog || !input || !results)
        return;
    let entries = [];
    try {
        const data = JSON.parse(one('#search-index')?.textContent || '[]');
        if (Array.isArray(data))
            entries = data.filter((entry) => entry && ['url', 'title', 'body', 'description', 'group'].every(key => typeof entry[key] === 'string') && (0, search_1.isLocalRoute)(entry.url));
    }
    catch { /* Search remains usable with an explicit empty-result state. */ }
    let selected = -1;
    let links = [];
    let trigger = null;
    const highlight = (node, text) => {
        for (const part of (0, search_1.highlightMatches)(text, input.value)) {
            if (part.match) {
                const mark = root.createElement('mark');
                mark.textContent = part.text;
                node.append(mark);
            }
            else
                node.append(root.createTextNode(part.text));
        }
    };
    function select(index, scroll = true) {
        selected = links.length ? Math.max(0, Math.min(index, links.length - 1)) : -1;
        links.forEach((link, i) => { link.classList.toggle('selected', i === selected); link.setAttribute('aria-selected', String(i === selected)); });
        if (links[selected]) {
            input.setAttribute('aria-activedescendant', links[selected].id);
            if (scroll)
                links[selected].scrollIntoView({ block: 'nearest' });
        }
        else
            input.removeAttribute('aria-activedescendant');
    }
    function renderSearch() {
        const found = (0, search_1.searchPageResults)(input.value, entries);
        results.replaceChildren();
        links = [];
        if (clear)
            clear.hidden = !input.value;
        if (count)
            count.textContent = !found.query ? 'Suggested reading' : found.total > found.results.length ? `${found.results.length} of ${found.total} results — refine your search` : `${found.total} ${found.total === 1 ? 'result' : 'results'}`;
        for (const [index, result] of found.results.entries()) {
            const link = root.createElement('a');
            link.href = result.url;
            link.className = 'search-result';
            link.id = `search-option-${index}`;
            link.role = 'option';
            link.tabIndex = -1;
            const group = root.createElement('span'), title = root.createElement('strong'), snippet = root.createElement('p');
            group.textContent = result.entry.group + (result.url.includes('#') ? ' · Jump to section' : '');
            highlight(title, result.entry.title);
            highlight(snippet, result.excerpt);
            link.append(group, title, snippet);
            results.append(link);
            links.push(link);
        }
        if (!links.length) {
            const message = root.createElement('p');
            message.className = 'search-empty';
            message.setAttribute('role', 'presentation');
            message.textContent = 'No matching pages. Try “storage”, “Rust”, or “evidence”.';
            results.append(message);
        }
        select(0, false);
    }
    const open = (from) => {
        trigger = from || root.activeElement;
        one('#mobile-menu')?.close();
        if (!dialog.open)
            dialog.showModal();
        input.setAttribute('aria-expanded', 'true');
        renderSearch();
        input.focus();
        input.select();
    };
    all('[data-search-open]').forEach(button => on(button, 'click', () => open(button)));
    all('[data-search-close]').forEach(button => on(button, 'click', () => dialog.close()));
    on(dialog, 'close', () => {
        input.setAttribute('aria-expanded', 'false');
        input.removeAttribute('aria-activedescendant');
        if (trigger?.isConnected && trigger.getClientRects().length)
            trigger.focus();
    });
    on(input, 'input', renderSearch);
    on(clear, 'click', () => { input.value = ''; renderSearch(); input.focus(); });
    on(input, 'keydown', event => {
        if (event.isComposing)
            return;
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            select(selected + (event.key === 'ArrowDown' ? 1 : -1));
        }
        else if (event.key === 'Enter' && links[selected]) {
            event.preventDefault();
            links[selected].click();
        }
    });
    on(results, 'mousemove', event => {
        const link = event.target.closest('a.search-result');
        if (link && links.includes(link))
            select(links.indexOf(link), false);
    });
    on(results, 'click', event => { if (event.target.closest('a'))
        dialog.close(); });
    on(root, 'keydown', event => {
        if (event.isComposing || event.altKey || !(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k')
            return;
        if ((0, dom_1.isEditing)(event.target) && event.target !== input)
            return;
        event.preventDefault();
        if (dialog.open)
            dialog.close();
        else
            open(root.activeElement);
    });
    scope.onCleanup(() => { if (dialog.open)
        dialog.close(); input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); });
}

},"filter-ui":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupFilters = setupFilters;
const search_1 = require("./search");
const dom_1 = require("./dom");
function setupFilters(scope) {
    const { one, all, on, win } = scope;
    const input = one('[data-project-search]');
    const buttons = all('[data-project-filter]');
    const rows = all('[data-project]');
    let category = 'all';
    const updateProjects = (write = true) => {
        if (!input)
            return;
        const terms = (0, search_1.queryTerms)(input.value);
        let visible = 0;
        rows.forEach(row => {
            const text = (0, search_1.normalizeSearch)(row.dataset.searchText || '');
            const matches = (category === 'all' || row.dataset.category === category) && terms.every(term => text.includes(term));
            row.hidden = !matches;
            if (matches)
                visible++;
        });
        buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.projectFilter === category)));
        const count = one('[data-project-count]'), empty = one('[data-project-empty]');
        if (count)
            count.textContent = `${visible} ${visible === 1 ? 'project' : 'projects'}`;
        if (empty)
            empty.hidden = visible > 0;
        if (write)
            (0, dom_1.writeQuery)(scope, { q: input.value.trim().slice(0, 100), category: category === 'all' ? '' : category });
    };
    const restoreProjects = () => {
        if (!input)
            return;
        const url = (0, dom_1.routeURL)(scope), requested = url.searchParams.get('category');
        category = requested && buttons.some(button => button.dataset.projectFilter === requested) ? requested : 'all';
        input.value = (url.searchParams.get('q') || '').slice(0, 100);
        updateProjects(false);
    };
    restoreProjects();
    on(input, 'input', () => updateProjects());
    buttons.forEach(button => on(button, 'click', () => { category = button.dataset.projectFilter || 'all'; updateProjects(); }));
    all('[data-project-reset]').forEach(button => on(button, 'click', () => { category = 'all'; if (input) {
        input.value = '';
        input.focus();
    } updateProjects(); }));
    on(win, 'popstate', restoreProjects);
    const evidenceInput = one('[data-evidence-search]');
    const select = one('[data-evidence-filter]');
    const evidenceRows = all('[data-evidence]');
    const updateEvidence = (write = true) => {
        if (!select || !evidenceInput)
            return;
        const terms = (0, search_1.queryTerms)(evidenceInput.value);
        let visible = 0;
        evidenceRows.forEach(row => {
            const text = (0, search_1.normalizeSearch)(row.dataset.evidenceText || row.textContent || '');
            row.hidden = !(select.value === 'all' || select.value === row.dataset.evidence) || !terms.every(term => text.includes(term));
            if (!row.hidden)
                visible++;
        });
        const count = one('[data-evidence-count]'), empty = one('[data-evidence-empty]');
        if (count)
            count.textContent = `${visible} ${visible === 1 ? 'entry' : 'entries'}`;
        if (empty)
            empty.hidden = visible > 0;
        if (write)
            (0, dom_1.writeQuery)(scope, { q: evidenceInput.value.trim().slice(0, 100), type: select.value === 'all' ? '' : select.value });
    };
    const restoreEvidence = () => {
        if (!select || !evidenceInput)
            return;
        const url = (0, dom_1.routeURL)(scope), type = url.searchParams.get('type') || 'all';
        select.value = Array.from(select.options).some(option => option.value === type) ? type : 'all';
        evidenceInput.value = (url.searchParams.get('q') || '').slice(0, 100);
        updateEvidence(false);
    };
    restoreEvidence();
    on(evidenceInput, 'input', () => updateEvidence());
    on(select, 'change', () => updateEvidence());
    all('[data-evidence-reset]').forEach(button => on(button, 'click', () => {
        if (select)
            select.value = 'all';
        if (evidenceInput) {
            evidenceInput.value = '';
            evidenceInput.focus();
        }
        updateEvidence();
    }));
    on(win, 'popstate', restoreEvidence);
}

},"reading-ui":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupReading = setupReading;
const dom_1 = require("./dom");
const reading_1 = require("./reading");
function setupReading(scope) {
    const { one, all, on, root, win } = scope;
    const article = one('[data-doc-article]');
    if (!article)
        return;
    const progress = all('[data-reading-progress]');
    const percentage = all('[data-reading-percent]');
    const tocLinks = all('[data-toc-link]');
    const headings = Array.from(article.querySelectorAll('h2[id]'));
    let queued = false, lastPercent = -1, activeID = '';
    function refresh() {
        queued = false;
        const top = article.getBoundingClientRect().top + win.scrollY;
        const end = top + article.offsetHeight - win.innerHeight + 100;
        const value = Math.round(Math.min(100, Math.max(0, 100 * (win.scrollY - top + 110) / Math.max(1, end - top + 110))));
        if (value !== lastPercent) {
            progress.forEach(node => node.value = value);
            percentage.forEach(node => node.textContent = `${value}%`);
            lastPercent = value;
        }
        let current = headings[0]?.id || '';
        for (const heading of headings)
            if (heading.getBoundingClientRect().top <= 140)
                current = heading.id;
        if (current !== activeID) {
            tocLinks.forEach(link => { if (link.hash === '#' + current)
                link.setAttribute('aria-current', 'location');
            else
                link.removeAttribute('aria-current'); });
            activeID = current;
        }
    }
    const schedule = () => { if (!queued) {
        queued = true;
        scope.frame(refresh);
    } };
    on(win, 'scroll', schedule);
    on(win, 'resize', schedule);
    refresh();
    const resize = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null;
    resize?.observe(article);
    scope.onCleanup(() => resize?.disconnect());
    let markdown = '', title = 'guide';
    try {
        const data = JSON.parse(one('#article-export')?.textContent || '{}');
        if (typeof data.markdown === 'string' && typeof data.title === 'string') {
            markdown = data.markdown;
            title = data.title;
        }
    }
    catch { /* Export controls remain disabled for missing or invalid content. */ }
    const message = one('[data-article-message]');
    const status = (text) => { if (message)
        message.textContent = text; scope.toast(text); };
    all('[data-copy-article]').forEach(button => {
        if (markdown)
            button.disabled = false;
        on(button, 'click', () => {
            void (async () => {
                button.disabled = true;
                const success = await (0, dom_1.copyText)(scope, markdown);
                if (scope.signal.aborted)
                    return;
                button.disabled = false;
                if (success)
                    status('Article Markdown copied.');
                else {
                    const fallback = one('[data-article-fallback]');
                    const output = one('[data-article-markdown]');
                    if (fallback) {
                        fallback.hidden = false;
                        fallback.open = true;
                    }
                    if (output) {
                        output.textContent = markdown;
                        (0, dom_1.selectText)(scope, output);
                    }
                    status('Clipboard unavailable. Article Markdown is selected below for manual copying.');
                }
            })();
        });
    });
    all('[data-download-article]').forEach(button => {
        if (markdown)
            button.disabled = false;
        on(button, 'click', () => status((0, dom_1.downloadText)(scope, markdown, (0, reading_1.safeDownloadName)(title, '.md')) ? 'Markdown download requested.' : 'Download unavailable. Use Copy Markdown or the manual-copy fallback.'));
    });
    all('[data-print-article]').forEach(button => {
        button.disabled = false;
        on(button, 'click', () => { try {
            win.print();
        }
        catch {
            status('Printing is unavailable in this viewer. Download the Markdown instead.');
        } });
    });
    on(one('.mobile-toc'), 'click', event => {
        if (event.target.closest('a'))
            one('.mobile-toc')?.removeAttribute('open');
    });
    scope.onCleanup(() => all('[data-copy-article],[data-download-article],[data-print-article]').forEach(button => button.disabled = true));
}

},"brief-ui":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupBrief = setupBrief;
const dom_1 = require("./dom");
const reading_1 = require("./reading");
const drafts = new WeakMap();
const keys = ['title', 'area', 'problem', 'outcome', 'constraints'];
function setupBrief(scope) {
    const { root, one, all, on } = scope;
    const form = one('#brief-form');
    const fields = one('[data-brief-fields]');
    const result = one('#brief-result');
    const output = one('#brief-text');
    if (!form || !fields || !result || !output)
        return;
    const field = (name) => form.elements.namedItem(name);
    let draft = drafts.get(root) || { title: '', area: 'Not sure yet', problem: '', outcome: '', constraints: '', prepared: false };
    const read = () => { for (const name of keys)
        draft[name] = field(name).value; drafts.set(root, draft); };
    const counters = () => all('[data-brief-counter]').forEach(node => {
        const name = node.dataset.briefCounter;
        const control = field(name);
        node.textContent = `${control.value.length.toLocaleString('en-US')} / ${control.maxLength.toLocaleString('en-US')}`;
    });
    const error = (name, invalid) => {
        field(name).setAttribute('aria-invalid', String(invalid));
        const message = one(`#brief-${name}-error`);
        if (message)
            message.hidden = !invalid;
    };
    const plain = (value) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const text = () => `# ${plain(draft.title.trim().replace(/[\r\n]/g, ' '))}\n\n## Area of interest\n${plain(draft.area)}\n\n## Problem to solve\n${plain(draft.problem.trim())}\n\n## Intended outcome\n${plain(draft.outcome.trim()) || 'Not specified'}\n\n## Constraints\n${plain(draft.constraints.trim()) || 'Not specified'}\n\n---\nPrepared locally with the MLAI review site. Nothing has been submitted.\n`;
    const render = () => {
        form.hidden = draft.prepared;
        result.hidden = !draft.prepared;
        if (draft.prepared)
            output.textContent = text();
    };
    for (const key of keys)
        field(key).value = draft[key];
    counters();
    render();
    on(form, 'input', () => {
        read();
        counters();
        if (draft.title.trim().length > 0 && draft.title.length <= 120)
            error('title', false);
        if (draft.problem.trim().length >= 10 && draft.problem.length <= 2000)
            error('problem', false);
    });
    on(form, 'change', read);
    on(form, 'submit', event => {
        event.preventDefault();
        read();
        const badTitle = !draft.title.trim() || draft.title.length > 120;
        const badProblem = draft.problem.trim().length < 10 || draft.problem.length > 2000;
        error('title', badTitle);
        error('problem', badProblem);
        if (badTitle || badProblem) {
            field(badTitle ? 'title' : 'problem').focus();
            return;
        }
        if (draft.outcome.length > 1500 || draft.constraints.length > 500) {
            scope.toast('Please keep the optional fields within their displayed length limits.');
            field(draft.outcome.length > 1500 ? 'outcome' : 'constraints').focus();
            return;
        }
        draft.prepared = true;
        drafts.set(root, draft);
        render();
        one('#brief-result-title')?.focus();
    });
    // Enable only AFTER the preventDefault submit handler is installed. Cleanup disables again.
    fields.disabled = false;
    all('[data-brief-edit]').forEach(button => on(button, 'click', () => {
        draft.prepared = false;
        render();
        field('title').focus();
    }));
    const status = (message) => { const node = one('#brief-action-status'); if (node)
        node.textContent = message; scope.toast(message); };
    all('[data-brief-copy]').forEach(button => on(button, 'click', () => {
        void (async () => {
            if (!draft.prepared)
                return;
            const success = await (0, dom_1.copyText)(scope, text());
            if (scope.signal.aborted)
                return;
            status(success ? 'Brief copied. Nothing was sent.' : 'Clipboard unavailable. Select and copy the brief manually.');
            if (!success)
                (0, dom_1.selectText)(scope, output);
        })();
    }));
    all('[data-brief-download]').forEach(button => on(button, 'click', () => {
        if (!draft.prepared)
            return;
        status((0, dom_1.downloadText)(scope, text(), (0, reading_1.safeDownloadName)(draft.title, '-brief.md')) ? 'Download requested. Nothing was sent.' : 'Download unavailable. Use Copy brief or select the text.');
    }));
    scope.onCleanup(() => { read(); fields.disabled = true; });
}

},"interactions":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initInteractions = initInteractions;
const dom_1 = require("./dom");
const chrome_ui_1 = require("./chrome-ui");
const search_ui_1 = require("./search-ui");
const filter_ui_1 = require("./filter-ui");
const reading_ui_1 = require("./reading-ui");
const brief_ui_1 = require("./brief-ui");
const lifetimes = new WeakMap();
/** Each enhancement owns a focused surface; one abortable lifetime works in both renderers. */
function initInteractions(root = document) {
    lifetimes.get(root)?.();
    const scope = (0, dom_1.createScope)(root);
    (0, chrome_ui_1.setupChrome)(scope);
    (0, search_ui_1.setupSearch)(scope);
    (0, filter_ui_1.setupFilters)(scope);
    (0, reading_ui_1.setupReading)(scope);
    (0, brief_ui_1.setupBrief)(scope);
    scope.all('[data-copy-code]').forEach(button => scope.on(button, 'click', () => {
        void (async () => {
            const block = button.closest('.code-block'), code = block?.querySelector('code');
            const pre = block?.querySelector('pre'), status = block?.querySelector('.copy-status');
            if (!code)
                return;
            const success = await (0, dom_1.copyText)(scope, code.textContent || '');
            if (scope.signal.aborted)
                return;
            const message = success ? 'Code copied.' : 'Clipboard unavailable. The code is selected; copy it manually.';
            if (status)
                status.textContent = message;
            scope.toast(message);
            const label = button.querySelector('span');
            if (label) {
                label.textContent = success ? 'Copied' : 'Select & copy';
                scope.delay(() => label.textContent = 'Copy', 3500);
            }
            if (!success && pre)
                (0, dom_1.selectText)(scope, pre);
        })();
    }));
    const cleanup = () => {
        scope.cleanup();
        if (lifetimes.get(root) === cleanup)
            lifetimes.delete(root);
    };
    lifetimes.set(root, cleanup);
    return cleanup;
}

}};const cache={};function load(name){if(name.startsWith('./'))name=name.slice(2);if(cache[name])return cache[name].exports;const m={exports:{}};cache[name]=m;factories[name](load,m,m.exports);return m.exports}window.MLAI=load('interactions');})();
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
