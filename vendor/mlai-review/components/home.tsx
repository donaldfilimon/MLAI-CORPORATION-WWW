import { Icon } from './icons';
import { ButtonLink, SourceLink } from './chrome';
import { projects, sources } from '../lib/content';
import { CodeBlock } from './docs';
export function EcosystemMap() {
    return <div className="ecosystem-visual">
    <div className="map-topline">
    <span>Project relationships</span>
    <Icon name="layers" size={17}/>
    </div>
    <div className="map-canvas">
    <div className="map-path path-a"/>
    <div className="map-path path-b"/>
    <a className="map-node node-abbey" href="/projects/abbey/">
    <Icon name="spark" size={24}/>
    <span>
    <strong>Abbey</strong>
    <small>Companion & identity</small>
    </span>
    <Icon name="external" size={15}/>
    </a>
    <a className="map-node node-abi" href="/projects/abi/">
    <span className="map-abi-symbol">
    <Icon name="layers" size={31}/>
    </span>
    <div>
    <span className="map-node-index">RUNTIME LAYER</span>
    <strong>ABI</strong>
    <span>Orchestration, made inspectable.</span>
    </div>
    <Icon name="external" size={18}/>
    </a>
    <a className="map-node node-wdbx" href="/projects/wdbx/">
    <Icon name="database" size={24}/>
    <span>
    <strong>WDBX</strong>
    <small>Semantic storage</small>
    </span>
    <Icon name="external" size={15}/>
    </a>
    <div className="map-track-label track-one">Interaction</div>
    <div className="map-track-label track-two">Retrieval</div>
    </div>
    <div className="map-caption">
    <span className="map-dash"/>Conceptual relationship, not live telemetry</div>
    </div>;
}
export function ProjectRows({ compact = false }: {
    compact?: boolean;
}) {
    return <div className={'project-rows ' + (compact ? 'compact' : '')}>{projects.map((p, i) => <a key={p.id} className={'project-row project-' + p.id} href={'/projects/' + p.id + '/'}>
        <span className="project-number">0{i + 1}</span>
        <span className="project-word">
        <span className="project-symbol">
        <Icon name={p.glyph} size={26}/>
        </span>
        <strong>{p.name}</strong>
        </span>
        <span className="project-row-description">{p.description}</span>
        <span className="project-kind">{p.kind}</span>
        <span className="row-arrow">
        <Icon name="external" size={25}/>
        </span>
        </a>)}</div>;
}
export const previewTopics = [
    { id: 'runtime', label: 'Runtime', title: 'Start with ABI.', text: 'Inspect the checkout, prepare its dependencies, and use the project’s own validation gate.', code: './tools/cargo.sh --version\n./tools/check.sh\n./tools/cargo.sh build -p abi-cli', url: '/docs/getting-started/', note: 'From the ABI README. Requires a prepared checkout; not executed by this website.' },
    { id: 'storage', label: 'Storage', title: 'Understand the retrieval layer.', text: 'Read WDBX’s documented contracts and separate stored representations from evidence of correctness.', code: null, url: '/docs/wdbx/', note: 'A source-based overview. No live vector database or simulated query results.' },
    { id: 'framework', label: 'Framework', title: 'Choose a Gama surface.', text: 'Explore scenes, the retained render tree, and target-specific integrations in the Swift framework.', code: null, url: '/docs/gama/', note: 'Documented integrations are not a blanket platform-support guarantee.' }
];
export function SourcePreview() {
    return <section className="source-section">
    <div className="container source-grid">
    <div>
    <span className="section-index">02 / A PATH INTO THE WORK</span>
    <h2>Start with<br />the source.</h2>
    <p>Good documentation brings the next step into focus. No black boxes. No invented results.</p>
    <a className="text-link light-link" href="/docs/">Open the documentation<Icon name="arrow" size={18}/>
    </a>
    </div>
    <div className="source-preview">
    <div className="topic-controls" role="tablist" aria-label="Choose a documentation topic">{previewTopics.map((t, i) => <button key={t.id} id={'topic-' + t.id} role="tab" data-topic={t.id} aria-pressed={i === 0} aria-selected={i === 0} aria-controls={'panel-' + t.id} tabIndex={i === 0 ? 0 : -1}>{t.label}</button>)}</div>{previewTopics.map((t, i) => <div key={t.id} className="topic-panel" role="tabpanel" id={'panel-' + t.id} aria-labelledby={'topic-' + t.id} data-topic-panel={t.id} hidden={i !== 0}>
        <span className="mono subtle">A READING PATH</span>
        <h3>{t.title}</h3>
        <p>{t.text}</p>{t.code ? <CodeBlock code={t.code} label="ABI · shell commands"/> : <div className="reading-excerpt">
            <Icon name={t.id === 'storage' ? 'database' : 'command'} size={36}/>
            <p>{t.id === 'storage' ? 'Representations → retrieval → a result with context.' : 'Scenes → render tree → layout → a host surface.'}</p>
            </div>}<p className="source-note">{t.note}</p>
        <a href={t.url} className="text-link light-link">Read this guide<Icon name="arrow" size={17}/>
        </a>
        </div>)}</div>
    </div>
    </section>;
}
export function Home() {
    return <>
    <section className="container hero">
    <div className="hero-copy">
    <h1>Intelligence,<br />with <span>integrity.</span>
    </h1>
    <p>Local AI systems, semantic storage, and developer tools. Explore the work. Inspect the source. Build with clarity.</p>
    <div className="hero-actions">
    <ButtonLink href="/projects/">Explore projects</ButtonLink>
    <a className="text-link" href="/docs/">Read the docs<Icon name="arrow" size={18}/>
    </a>
    </div>
    </div>
    <EcosystemMap />
    </section>
    <div className="container hero-foot">
    <span>Thoughtful software. Explicit boundaries.</span>
    <a href="/trust/">Our approach to evidence<Icon name="arrow" size={16}/>
    </a>
    </div>
    <section className="container section projects-section">
    <div className="section-heading">
    <div>
    <span className="section-index">01 / THE ECOSYSTEM</span>
    <h2>Different tools.<br />Shared intention.</h2>
    </div>
    <p>A connected body of work, with a clear role for each project. Start where your curiosity takes you.</p>
    </div>
    <ProjectRows />
    <div className="section-end">
    <span>Source descriptions are not independent performance verification.</span>
    <a href="/projects/" className="text-link">Find your starting point<Icon name="arrow" size={17}/>
    </a>
    </div>
    </section>
    <SourcePreview />
    <section className="container section principles">
    <div>
    <span className="section-index">03 / HOW WE THINK</span>
    <h2>Useful systems.<br />Clear boundaries.</h2>
    <p>Ambition and honesty belong in the same sentence.</p>
    <a className="text-link" href="/trust/">Explore the evidence ledger<Icon name="arrow" size={18}/>
    </a>
    </div>
    <div className="principle-list">
    <div>
    <span>01</span>
    <div>
    <h3>Show what’s there.</h3>
    <p>Make the path from an explanation to the source easy to follow.</p>
    </div>
    </div>
    <div>
    <span>02</span>
    <div>
    <h3>Name what’s not.</h3>
    <p>Keep reference demos, conditional capabilities, and future ideas distinct.</p>
    </div>
    </div>
    <div>
    <span>03</span>
    <div>
    <h3>Let evidence do the talking.</h3>
    <p>A measurement needs a method. A source description is not a benchmark.</p>
    </div>
    </div>
    </div>
    </section>
    <section className="closing">
    <div className="container closing-inner">
    <div>
    <h2>Build something<br />worth understanding.</h2>
    <p>Start with a guide. Or put your next idea into words.</p>
    </div>
    <div className="closing-actions">
    <ButtonLink href="/docs/">Read the documentation</ButtonLink>
    <a href="/brief/" className="text-link">Prepare a project brief<Icon name="arrow" size={18}/>
    </a>
    </div>
    </div>
    </section>
    </>;
}
