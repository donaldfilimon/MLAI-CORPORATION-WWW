import type { ReactNode } from 'react';
import { Icon } from './icons';
import { articleText, articleMarkdown, estimateReadingMinutes } from '../lib/reading';
import { articles, sources, reviewedAt, type Article } from '../lib/content';
export function CodeBlock({ code, label = 'Shell commands' }: {
    code: string;
    label?: string;
}) {
    return <div className="code-block">
    <div className="code-heading">
    <span>{label}</span>
    <button type="button" className="copy-button" data-copy-code aria-label={'Copy ' + label}>
    <Icon name="copy" size={15}/>
    <span>Copy</span>
    </button>
    </div>
    <pre tabIndex={0}>
    <code>{code}</code>
    </pre>
    <span className="copy-status sr-only" role="status" aria-live="polite"/>
    </div>;
}
export function SourceReferences({ ids }: {
    ids: string[];
}) {
    return <section className="source-references" aria-labelledby="references-heading">
    <h2 id="references-heading">Follow the source</h2>
    <p className="source-review-date">Review context: {reviewedAt}. Linked branches can change. Documentation review is not runtime testing.</p>{ids.map(id => {
            const source = sources[id as keyof typeof sources];
            return source ? <a key={id} href={source.url} target="_blank" rel="noopener noreferrer">
            <div>
            <strong>{source.title}</strong>
            <span>{source.scope}</span>
            </div>
            <Icon name="external" size={19}/>
            </a> : null;
        })}</section>;
}
export function DocBody({ article }: {
    article: Article;
}) {
    return <>{article.sections.map(section => <section key={section.id} className="article-section">
        <h2 id={section.id}>
        <a href={'#' + section.id}>{section.title}<span className="heading-hash" aria-hidden="true">#</span>
        </a>
        </h2>{section.paragraphs.map((p, i) => <p key={i}>{p}</p>)}{section.code && <CodeBlock code={section.code}/>} {section.note && <aside className="callout">
            <Icon name="book" size={19}/>
            <p>{section.note}</p>
            </aside>}</section>)}</>;
}
export function DocsSidebar({ article }: {
    article: Article;
}) {
    return <>
    <button className="docs-search-trigger" data-search-open>
    <Icon name="search" size={17}/>
    <span>Search the docs</span>
    <kbd>⌘ K</kbd>
    </button>{['Start here', 'Systems', 'Principles'].map(group => <div className="doc-nav-group" key={group}>
        <span className="overline">{group}</span>
        <nav aria-label={group}>{articles.filter(a => a.group === group).map(a => <a key={a.slug} href={a.slug ? '/docs/' + a.slug + '/' : '/docs/'} aria-current={article.slug === a.slug ? 'page' : undefined}>{({ '': 'Overview', 'getting-started': 'Getting started', architecture: 'Project architecture', runtime: 'ABI runtime', wdbx: 'WDBX storage', identity: 'Abbey & identity', gama: 'Gama framework', evidence: 'Claims & evidence' } as Record<string, string>)[a.slug]}</a>)}</nav>
        </div>)}<a className="sidebar-back" href="/projects/">
    <Icon name="layers" size={17}/>Back to projects<Icon name="external" size={14}/>
    </a>
    </>;
}
export function DocsPage({ article, children }: {
    article: Article;
    children?: ReactNode;
}) {
    const index = articles.findIndex(item => item.slug === article.slug), prev = articles[index - 1], next = articles[index + 1];
    const minutes = estimateReadingMinutes(articleText(article));
    const exportData = JSON.stringify({ title: article.title, markdown: articleMarkdown(article, sources) }).replace(/</g, '\\u003c');
    return <div className="container docs-container">
    <aside className="docs-sidebar">
    <div className="sidebar-sticky">
    <DocsSidebar article={article}/>
    </div>
    </aside>
    <div className="docs-main">
    <details className="mobile-docs-nav">
    <summary>Browse documentation<Icon name="chevron" size={16}/>
    </summary>
    <DocsSidebar article={article}/>
    </details>
    <div className="breadcrumbs">
    <a href="/docs/">Documentation</a>
    <Icon name="chevron" size={13}/>
    <span>{article.slug ? article.group : 'Overview'}</span>
    </div>
    <div className="doc-title">
    <span className="section-index">{article.group.toUpperCase()}</span>
    <h1>{article.title}</h1>
    <p>{article.description}</p>
    </div>
    <div className="doc-tools">
    <span className="reading-estimate" title="Estimated at 220 words per minute">{minutes} min read <span aria-hidden="true">·</span> {article.sections.length} sections</span>
    <div className="doc-tool-actions" role="group" aria-label="Article tools">
    <button type="button" data-copy-article disabled><Icon name="copy" size={15}/>Copy Markdown</button>
    <button type="button" data-download-article disabled aria-label="Download article Markdown"><Icon name="download" size={16}/></button>
    <button type="button" data-print-article disabled>Print</button>
    </div>
    </div>
    <p className="sr-only" data-article-message role="status" aria-live="polite"/>
    <details className="mobile-toc">
    <summary>On this page<Icon name="chevron" size={16}/></summary>
    <nav aria-label="Article sections">{article.sections.map(section => <a key={section.id} data-toc-link href={'#' + section.id}>{section.title}</a>)}</nav>
    </details>
    <details className="article-markdown-fallback" data-article-fallback hidden>
    <summary>Manual-copy Markdown</summary><pre data-article-markdown tabIndex={0}/>
    </details>
    <script id="article-export" type="application/json" dangerouslySetInnerHTML={{ __html: exportData }}/>
    <article className="article-prose" data-doc-article>{children || <DocBody article={article}/>}<SourceReferences ids={article.sources}/>
    </article>
    <nav className="docs-pagination" aria-label="Adjacent guides">{prev ? <a href={prev.slug ? '/docs/' + prev.slug + '/' : '/docs/'}>
        <span>Previous guide</span>
        <strong>{prev.title}</strong>
        </a> : <span />}{next && <a href={'/docs/' + next.slug + '/'}>
        <span>Next guide</span>
        <strong>{next.title}<Icon name="arrow" size={16}/>
        </strong>
        </a>}</nav>
    </div>
    <aside className="toc">
    <div className="sidebar-sticky">
    <span className="overline">On this page</span>
    <nav aria-label="On this page">{article.sections.map(s => <a key={s.id} data-toc-link href={'#' + s.id}>{s.title}</a>)}<a data-toc-link href="#references-heading">Follow the source</a>
    </nav>
    <div className="reading-status">
    <div><span>Reading progress</span><span data-reading-percent>0%</span></div>
    <progress data-reading-progress max={100} value={0} aria-label="Reading progress"/>
    </div>
    <div className="toc-note">
    <Icon name="book" size={18}/>
    <p>A reading guide.<br />Not a live runtime.</p>
    </div>
    </div>
    </aside>
    </div>;
}
