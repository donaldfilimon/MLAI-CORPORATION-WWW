import { projects, type Project, sources } from '../lib/content';
import { Icon } from './icons';
import { ButtonLink, SourceLink } from './chrome';
import { SourceReferences } from './docs';
export function ProjectsPage() {
    return <div className="container directory-page">
    <div className="page-intro">
    <span className="section-index">THE PROJECT DIRECTORY</span>
    <h1>Find your<br />
    <span>starting point.</span>
    </h1>
    <p>Explore the runtime, storage, companion, and framework tracks. Each has its own role—and its own boundaries.</p>
    </div>
    <section className="directory-controls" aria-label="Filter projects">
    <div className="filter-buttons">{['All', 'Runtime', 'Storage', 'Companion', 'Framework'].map((label, i) => <button key={label} data-project-filter={label.toLowerCase()} aria-pressed={i === 0}>{label}</button>)}</div>
    <label className="filter-search">
    <Icon name="search" size={18}/>
    <span className="sr-only">Search projects</span>
    <input data-project-search type="search" placeholder="Find a project…" maxLength={100}/>
    </label>
    </section>
    <div className="directory-meta">
    <span data-project-count role="status" aria-live="polite">4 projects</span>
    <button className="plain-button" data-project-reset>Reset filters<Icon name="close" size={14}/>
    </button>
    </div>
    <div className="directory-list">{projects.map((p, i) => <article className={'directory-project project-' + p.id} key={p.id} data-project={p.id} data-category={p.category} data-search-text={(p.name + ' ' + p.description).toLowerCase()}>
        <div className="directory-project-name">
        <span className="project-symbol">
        <Icon name={p.glyph} size={30}/>
        </span>
        <span className="mono">0{i + 1}</span>
        <h2>
        <a href={'/projects/' + p.id + '/'}>{p.name}</a>
        </h2>
        <span className="project-kind">{p.kind}</span>
        </div>
        <div className="directory-project-body">
        <h3>{p.tagline}</h3>
        <p>{p.description}</p>
        <div className="directory-links">
        <a href={'/projects/' + p.id + '/'} className="text-link">Explore {p.name}<Icon name="arrow" size={17}/>
        </a>
        <a href={'/docs/' + p.docs + '/'} className="text-link quiet">Read the guide<Icon name="book" size={15}/>
        </a>
        </div>
        </div>
        </article>)}</div>
    <div className="empty-state" data-project-empty hidden>
    <Icon name="search" size={30}/>
    <h2>No matching projects.</h2>
    <p>Try a different name, or clear the selected category.</p>
    <button className="button button-secondary" data-project-reset>Show all projects</button>
    </div>
    <aside className="directory-note">
    <Icon name="book" size={20}/>
    <p>This directory summarizes source descriptions, not independent performance verification. <a href="/trust/">Read the evidence ledger.</a>
    </p>
    </aside>
    </div>;
}
export function ProjectPage({ project: p }: {
    project: Project;
}) {
    const source = sources[p.source as keyof typeof sources];
    return <div className={'container detail-page project-' + p.id}>
    <a className="back-link" href="/projects/">
    <Icon name="arrow" size={16} className="reverse"/>All projects</a>
    <div className="project-detail-hero">
    <div>
    <div className="detail-label">
    <span className="project-symbol">
    <Icon name={p.glyph} size={25}/>
    </span>
    <span>{p.kind}</span>
    </div>
    <h1>{p.name}<span>{p.tagline}</span>
    </h1>
    <p>{p.description}</p>
    <div className="hero-actions">
    <ButtonLink href={'/docs/' + p.docs + '/'}>Read the guide</ButtonLink>
    <SourceLink href={source.url}>Explore the source</SourceLink>
    </div>
    </div>
    <div className="project-emblem">
    <Icon name={p.glyph} size={118}/>
    <span>{p.name}</span>
    <small>{p.kind}</small>
    </div>
    </div>
    <div className="project-detail-content">
    <section>
    <span className="section-index">DOCUMENTED SCOPE</span>
    <h2>What this work covers.</h2>
    <ul className="scope-list">{p.scope.map((s, i) => <li key={s}>
        <span className="mono">0{i + 1}</span>
        <p>{s}</p>
        </li>)}</ul>
    <SourceReferences ids={[p.source, ...(p.id === 'abi' ? ['claims'] : p.id === 'wdbx' ? ['wdbx'] : p.id === 'abbey' ? ['abi'] : [])]}/>
    </section>
    <aside className="project-limit">
    <Icon name="book" size={23}/>
    <h2>Read the boundaries.</h2>
    <p>{p.limit}</p>
    <a className="text-link" href="/trust/">Claims & evidence<Icon name="arrow" size={17}/>
    </a>
    </aside>
    </div>
    <section className="related-projects">
    <span className="overline">Continue exploring</span>
    <div>{projects.filter(project => project.id !== p.id).map(project => <a key={project.id} href={'/projects/' + project.id + '/'}>
        <Icon name={project.glyph}/>
        <span>{project.name}</span>
        <Icon name="arrow" size={17}/>
        </a>)}</div>
    </section>
    </div>;
}
