import { Icon } from './icons';
import { sources, evidence, reviewedAt, repoUrl } from '../lib/content';
import { ButtonLink, SourceLink } from './chrome';
import { SourceReferences } from './docs';
export function TrustPage() {
    return <div className="container trust-page">
    <div className="page-intro">
    <span className="section-index">THE EVIDENCE LEDGER</span>
    <h1>Know what<br />a claim rests on.</h1>
    <p>Source descriptions, test reports, and measurements answer different questions. Keep the distinction visible.</p>
    </div>
    <aside className="callout wide-callout">
    <Icon name="book" size={21}/>
    <p>This is an editorial ledger based on linked source documentation, not a live CI feed or independent backend audit. Review context: {reviewedAt}.</p>
    </aside>
    <div className="ledger-tools">
    <label className="ledger-search"><span className="sr-only">Search evidence</span><Icon name="search" size={18}/><input data-evidence-search maxLength={100} placeholder="Search capabilities or limitations…" aria-label="Search evidence"/></label>
    <span className="overline" data-evidence-count role="status" aria-live="polite">{evidence.length} entries</span>
    <label>Evidence type<select data-evidence-filter>
    <option value="all">All entries</option>{[...new Set(evidence.map(e => e.type))].map(type => <option value={type} key={type}>{type}</option>)}</select>
    </label>
    <button type="button" className="filter-reset" data-evidence-reset>Reset filters</button>
    </div>
    <div className="ledger-empty" data-evidence-empty hidden><h2>No matching evidence.</h2><p>Try another phrase or evidence type.</p><button type="button" className="text-link plain-button" data-evidence-reset>Clear filters<Icon name="arrow" size={17}/></button></div>
    <div className="table-scroll">
    <table className="evidence-table">
    <caption className="sr-only">Capability evidence and scope</caption>
    <thead>
    <tr>
    <th>Capability</th>
    <th>Evidence type</th>
    <th>Scope & limitation</th>
    <th>Source</th>
    </tr>
    </thead>
    <tbody>{evidence.map(item => <tr key={item.title} data-evidence={item.type} data-evidence-text={item.title + ' ' + item.description + ' ' + item.type}>
        <th scope="row">{item.title}</th>
        <td>
        <span className={'evidence-tag ' + item.type.toLowerCase().replace(/\s/g, '-')}>{item.type}</span>
        </td>
        <td>{item.description}</td>
        <td>
        <a href={sources[item.source as keyof typeof sources].url} target="_blank" rel="noopener noreferrer" aria-label={'Read source for ' + item.title}>
        <span>Read</span>
        <Icon name="external" size={17}/>
        </a>
        </td>
        </tr>)}</tbody>
    </table>
    </div>
    <section className="evidence-bottom">
    <div>
    <h2>A target is not a result.</h2>
    <p>No runtime performance figures, production-scaling guarantees, compliance certifications, or model-quality comparisons are asserted here.</p>
    </div>
    <ButtonLink href="/docs/evidence/" secondary>Read the evidence policy</ButtonLink>
    </section>
    </div>;
}
export function AboutPage() {
    return <div className="container about-page">
    <div className="page-intro">
    <span className="section-index">THE IDEA BEHIND THE WORK</span>
    <h1>Make complex<br />things <span>clearer.</span>
    </h1>
    <p>MLAI brings together Donald Filimon’s work in AI systems and developer tools. This review gives that work a more legible front door.</p>
    </div>
    <section className="about-grid">
    <div className="about-quote">
    <Icon name="mark" size={55}/>
    <p>Good tools invite<br />understanding.</p>
    <span>THE DESIGN PRINCIPLE</span>
    </div>
    <div className="article-prose">
    <h2>A thoughtful way to explore.</h2>
    <p>Start with the purpose of a project. Follow a short path to its source. See the limitations close to the capability description, rather than buried behind a marketing promise.</p>
    <p>That is the organizing idea of this site. The project directory, documentation and evidence ledger share the same source-based content.</p>
    <SourceLink href="https://github.com/donaldfilimon">Donald’s public GitHub profile</SourceLink>
    <h2>An existing platform.</h2>
    <p>The MLAI-CORPORATION-WWW repository already houses the active website, a mobile companion, and a separate Quasar workspace. This review does not replace any of them or alter their validation and deployment boundaries.</p>
    <p>No source repository, production application, domain, account, private console, or infrastructure was changed to create this review.</p>
    </div>
    </section>
    <section className="about-boundary">
    <span className="section-index">ABOUT THIS REVIEW</span>
    <h2>A working review.<br />Not a production migration.</h2>
    <div>
    <p>The downloadable review is a pre-rendered, dependency-free website with local search and browser interactions. It does not run ABI, connect to WDBX, or send prompts to an AI provider.</p>
    <p>The accompanying source targets Next.js, React and headless Fumadocs. Its dependency installation, framework build, hydration and MDX integration require verification in a network-enabled development environment. The review is not proof of those checks.</p>
    <p>Only a light/dark preference may be stored locally. The project-brief composer keeps its text in memory and does not submit it. There are no accounts or third-party analytics in this review.</p>
    </div>
    </section>
    <SourceReferences ids={['platform', 'website']}/>
    </div>;
}
export function BriefPage() {
    return <div className="container brief-page">
    <div className="brief-intro">
    <a className="back-link" href="/about/">
    <Icon name="arrow" size={16} className="reverse"/>Our approach</a>
    <h1>Give your idea<br />a clearer shape.</h1>
    <p>A few thoughtful details make a better starting point. Prepare a brief, then take it with you.</p>
    <div className="brief-privacy">
    <Icon name="book" size={22}/>
    <p>Prepared locally in your browser.<br />
    <strong>Nothing is sent or saved remotely.</strong>
    <br />Your draft stays in memory while browsing this review. Use Copy or Download before closing it.</p>
    </div>
    <a className="text-link" href={repoUrl} target="_blank" rel="noopener noreferrer">Explore the existing platform<Icon name="external" size={17}/>
    </a>
    </div>
    <div className="brief-workspace">
    <noscript><p className="callout">This local composer requires JavaScript. Its fields stay disabled so no draft is submitted.</p></noscript>
    <form id="brief-form" noValidate>
    <fieldset disabled data-brief-fields>
    <legend className="sr-only">Project brief details</legend>
    <span className="section-index">YOUR PROJECT BRIEF</span>
    <label htmlFor="brief-title">Project title <span>Required</span>
    </label>
    <input id="brief-title" name="title" maxLength={120} placeholder="A name for the idea" required aria-describedby="brief-title-error"/>
    <p className="field-error" id="brief-title-error" hidden>Please add a project title.</p>
    <label htmlFor="brief-area">Area of interest</label>
    <select id="brief-area" name="area">
    <option>Not sure yet</option>
    <option>ABI runtime</option>
    <option>WDBX storage</option>
    <option>Abbey companion</option>
    <option>Gama framework</option>
    <option>Something else</option>
    </select>
    <label htmlFor="brief-problem">What problem are you solving? <span>Required</span>
    </label>
    <textarea id="brief-problem" name="problem" rows={4} maxLength={2000} placeholder="Who is this for, and what is difficult today?" required aria-describedby="brief-problem-error brief-problem-counter"/>
    <span id="brief-problem-counter" className="field-counter" data-brief-counter="problem">0 / 2,000</span>
    <p className="field-error" id="brief-problem-error" hidden>Describe the problem in at least 10 characters.</p>
    <label htmlFor="brief-outcome">What would success look like? <span>Optional</span>
    </label>
    <textarea id="brief-outcome" name="outcome" rows={3} maxLength={1500} placeholder="The outcome you’re aiming for—not a promise." aria-describedby="brief-outcome-counter"/>
    <span id="brief-outcome-counter" className="field-counter" data-brief-counter="outcome">0 / 1,500</span>
    <label htmlFor="brief-constraints">Constraints <span>Optional</span>
    </label>
    <input id="brief-constraints" name="constraints" maxLength={500} placeholder="Platform, timeline, scope, or other boundaries"/>
    <button className="button" type="submit">Prepare my brief<Icon name="arrow" size={18}/>
    </button>
    </fieldset>
    </form>
    <section id="brief-result" hidden aria-labelledby="brief-result-title">
    <span className="section-index">READY TO TAKE WITH YOU</span>
    <h2 id="brief-result-title" tabIndex={-1}>Your project brief.</h2>
    <p className="brief-result-note">Prepared locally. Nothing has been submitted.</p>
    <pre id="brief-text" tabIndex={0}/>
    <div className="brief-result-actions">
    <button className="button" data-brief-download>
    <Icon name="download" size={18}/>Download Markdown</button>
    <button className="button button-secondary" data-brief-copy>
    <Icon name="copy" size={17}/>Copy brief</button>
    </div>
    <button className="text-link plain-button" data-brief-edit>Edit your brief<Icon name="arrow" size={17}/>
    </button>
    <p id="brief-action-status" role="status" aria-live="polite"/>
    </section>
    </div>
    </div>;
}
export function NotFound() {
    return <div className="container not-found">
    <span className="section-index">404 / AN UNCHARTED PAGE</span>
    <h1>Not here.<br />But not a dead end.</h1>
    <p>That page isn’t part of this review. Start with a project or a guide.</p>
    <div className="hero-actions">
    <ButtonLink href="/">Back to the beginning</ButtonLink>
    <a className="text-link" href="/docs/">Explore the docs<Icon name="arrow" size={17}/>
    </a>
    </div>
    </div>;
}
