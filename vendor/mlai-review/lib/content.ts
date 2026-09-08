export type Section = {
    id: string;
    title: string;
    paragraphs: string[];
    code?: string;
    note?: string;
};
export type Article = {
    slug: string;
    title: string;
    description: string;
    group: string;
    sections: Section[];
    sources: string[];
};
export type Project = {
    id: string;
    name: string;
    kind: string;
    category: string;
    tagline: string;
    description: string;
    scope: string[];
    limit: string;
    source: string;
    docs: string;
    glyph: string;
};
export const reviewedAt = 'September 7, 2026';
export const sources = {
    platform: { title: 'MLAI platform README', url: 'https://github.com/donaldfilimon/MLAI-CORPORATION-WWW/blob/f08203c58ce1c1ab5ce69f5790597a72d1bad830/README.md', scope: 'Repository structure; reviewed at the pinned source revision.' },
    website: { title: 'Existing website README', url: 'https://github.com/donaldfilimon/MLAI-CORPORATION-WWW/blob/f08203c58ce1c1ab5ce69f5790597a72d1bad830/apps/web/README.md', scope: 'Existing Next.js surface and separate deployment gates.' },
    abi: { title: 'ABI README', url: 'https://github.com/donaldfilimon/abi/blob/main/README.md', scope: 'Source description, tool commands and stated limitations; not a reproduced test run.' },
    gama: { title: 'Gama README', url: 'https://github.com/donaldfilimon/gama/blob/main/README.md', scope: 'Documented framework architecture, not independent platform acceptance.' },
    identity: { title: 'Abbey identity specification', url: 'https://github.com/donaldfilimon/abi/blob/main/docs/spec/abbey-core-identity.mdx', scope: 'Further reading linked by the ABI README; not separately audited here.' },
    wdbx: { title: 'WDBX north-star specification', url: 'https://github.com/donaldfilimon/abi/blob/main/docs/spec/wdbx-north-star.mdx', scope: 'Further reading linked by the ABI README; not separately audited here.' },
    claims: { title: 'External claims audit', url: 'https://github.com/donaldfilimon/abi/blob/main/docs/contracts/external-claims-audit.mdx', scope: 'Further reading linked by the ABI README; not separately audited here.' },
};
export const repoUrl = 'https://github.com/donaldfilimon/MLAI-CORPORATION-WWW';
export const projects: Project[] = [
    { id: 'abi', name: 'ABI', kind: 'Local AI runtime', category: 'runtime', tagline: 'A runtime you can inspect.', description: 'Nightly Rust foundations for local AI orchestration, semantic storage, and explicit capability reporting.', scope: ['Local AI service orchestration and runtime primitives.', 'CLI and MCP interfaces described in the source.', 'Capability reporting that distinguishes a fallback from native acceleration.'], limit: 'The README describes a nightly Rust workspace. It does not establish production LLM quality, autonomous browser execution, or blanket GPU acceleration. Its site benchmark samples are synthetic.', source: 'abi', docs: 'runtime', glyph: 'layers' },
    { id: 'wdbx', name: 'WDBX', kind: 'Semantic storage', category: 'storage', tagline: 'Give retrieval a foundation.', description: 'The semantic-storage work associated with ABI, with source-documented retrieval and persistence contracts.', scope: ['Ordered vector search and hybrid ranking described upstream.', 'Repository-reported metadata, recovery and compaction contracts.', 'Temporal graph snapshot restoration described in the README.'], limit: 'The cited coverage is reported by the repository, not rerun here. Persistence may be skipped or fail. This website is not a connected database and shows no live retrieval results.', source: 'abi', docs: 'wdbx', glyph: 'database' },
    { id: 'abbey', name: 'Abbey', kind: 'Companion & identity', category: 'companion', tagline: 'A more thoughtful interface.', description: 'The companion identity described in ABI’s source, with distinct interaction and governance roles.', scope: ['Abbey is described as the primary empathetic-polymath profile.', 'Aviva is the direct expert mode, not a separately verified product.', 'ABI supplies the orchestration and governance role in that description.'], limit: 'An identity specification is not evidence of a deployed model, independent intelligence, or consciousness. The companion repository is referenced by ABI; its current build was not independently assessed here.', source: 'identity', docs: 'identity', glyph: 'spark' },
    { id: 'gama', name: 'Gama', kind: 'Swift UI framework', category: 'framework', tagline: 'One tree. Many surfaces.', description: 'A modular declarative UI framework in Swift, organized around scenes and a retained render tree.', scope: ['GamaCore organizes scenes, state, layout and events.', 'The README describes terminal, Apple, WASM and C/Android integrations.', 'MLIR and Embedded Swift are documented integration tracks.'], limit: 'These are documented integrations, not a blanket platform-support guarantee. Check the current source prerequisites and acceptance evidence for your target. Gama is separate from ABI’s Rust runtime.', source: 'gama', docs: 'gama', glyph: 'command' },
];
export const articles: Article[] = [
    { slug: '', title: 'A good place to begin.', description: 'Understand the projects, follow the source, and know what each claim rests on.', group: 'Start here', sources: ['platform', 'abi', 'gama'], sections: [
            { id: 'choose-a-direction', title: 'Choose a direction', paragraphs: ['MLAI brings together work in local AI systems, semantic storage, companion interaction, and application frameworks. Start with the project that matches the problem you are exploring, rather than assuming the entire ecosystem is a single package.', 'ABI is the runtime track. WDBX is the associated storage work. Abbey describes the companion and identity direction. Gama is a separate Swift framework for application interfaces. The project directory explains these roles and links to their public source.'] },
            { id: 'read-the-boundaries', title: 'Read the boundaries', paragraphs: ['These guides summarize source descriptions. They do not replace upstream API documentation, execute the projects, or establish production readiness. A repository’s reported tests are useful context, but are different from a test run reproduced in your environment.', 'Read the evidence guide alongside capability descriptions. No latency, accuracy, throughput, certification, or availability figure is asserted on this site. The conceptual project map is an explanation, not a deployment topology.'] },
            { id: 'existing-platform', title: 'An existing platform, not a blank slate', paragraphs: ['The MLAI-CORPORATION-WWW repository already contains an active website in apps/web, a mobile companion in apps/mobile, and a separate Quasar workspace in apps/quasar. Their validation and deployment boundaries remain distinct.', 'This review site is a separate design and implementation candidate. It does not replace those applications, connect to their private console, run an AI model, or submit information to them. Use the source links to reach the current implementation.'] },
        ] },
    { slug: 'getting-started', title: 'Start with the source.', description: 'Prepare an ABI checkout and follow its own validation workflow.', group: 'Start here', sources: ['abi'], sections: [
            { id: 'prepare-your-checkout', title: 'Prepare your checkout', paragraphs: ['Begin with the current ABI README and its toolchain and sibling-workspace prerequisites. The project uses nightly Rust and a checked-in Cargo wrapper. Do not treat a copied command as proof that every dependency is present on your machine.', 'Clone the public repository into your own development workspace, then finish the upstream setup instructions before building. This website does not execute these commands or provision a runtime.'], code: 'git clone https://github.com/donaldfilimon/abi.git\ncd abi', note: 'The repository may require additional sibling-workspace setup. Follow its current README before running the gate.' },
            { id: 'run-the-project-gate', title: 'Use the project’s validation gate', paragraphs: ['The README identifies tools/check.sh as the primary validation gate and tools/cargo.sh as the wrapper for nightly Cargo. Use the wrapper rather than assuming bare cargo selects the intended toolchain.', 'A successful gate is evidence for that checkout and environment. Record the commit, toolchain and actual output when you share results. The commands below come from documentation; they were not executed as part of this website build.'], code: './tools/cargo.sh --version\n./tools/check.sh\n./tools/cargo.sh build -p abi-cli' },
            { id: 'inspect-local-behavior', title: 'Inspect local behavior', paragraphs: ['Once the CLI has built, the README provides local inspection entry points. Start with backend and scheduler information before enabling an external provider. Check what your process actually reports instead of inferring capabilities from a product label.', 'Live transports require their own configuration and explicit authorization. This guide does not ask for credentials, activate a cloud backend, or turn a local demonstration into a production service.'], code: './target/debug/abi backends\n./target/debug/abi scheduler status' },
        ] },
    { slug: 'architecture', title: 'Different tools. Clear roles.', description: 'Separate runtime, storage, interface, and application framework responsibilities.', group: 'Start here', sources: ['abi', 'identity', 'platform', 'gama'], sections: [
            { id: 'runtime-and-storage', title: 'Runtime and storage', paragraphs: ['ABI’s README describes local orchestration, runtime primitives and WDBX integration. WDBX addresses the storage and retrieval side of that work. Their relationship does not imply that every operation is persistent or that a production cluster is deployed.', 'The README explicitly allows persistence to be disabled or unavailable, and requires those conditions to be reported rather than presented as successful writes. A diagram cannot establish operational behavior; the relevant source and tests must do that.'] },
            { id: 'interface-and-identity', title: 'Interface and identity', paragraphs: ['Abbey is the primary companion profile described by the source. Aviva is a direct expert mode, while ABI also names the orchestration/governance layer. These identity roles should not be mistaken for separate, independently verified models or repositories.', 'The existing MLAI platform also separates product and persona visual identities. For example, an ABI product accent does not define the color of an Abi persona. The distinction matters in content models as well as interface design.'] },
            { id: 'a-separate-framework-track', title: 'A separate framework track', paragraphs: ['Gama’s README describes Swift scenes and a retained render tree driving different interface backends. This is an application-framework track, not a required component of the conceptual Abbey–ABI–WDBX relationship.', 'Keep project-specific build instructions and evidence separate. A passing web build does not prove a Swift target works; a local runtime test does not validate a mobile app, a hosted deployment, or a live provider integration.'] },
        ] },
    { slug: 'runtime', title: 'Capability is a runtime question.', description: 'Read ABI’s reported capabilities without turning fallback behavior into a promise.', group: 'Systems', sources: ['abi', 'claims'], sections: [
            { id: 'local-foundations', title: 'Local foundations', paragraphs: ['The current README describes ABI as a nightly Rust framework for local AI service orchestration, semantic storage and runtime primitives. The former Zig tree has been removed. The CLI and MCP surfaces are documented entry points into that work.', 'The scope of those interfaces is important. Source-reported contract coverage establishes a specific type of evidence, not an unrestricted guarantee of model quality, performance, or deployment readiness.'] },
            { id: 'acceleration-and-fallback', title: 'Acceleration and fallback', paragraphs: ['A preferred accelerator backend is not evidence that native kernels are linked. The README requires accelerated=false when the native path is absent and describes deterministic CPU SIMD fallback.', 'Do not convert that fallback into a CUDA, Vulkan or ANE claim. A performance statement needs a reproducible artifact: checked-out revision, hardware, configuration, workload, method, measurements and limitations. None is published in this review site.'] },
            { id: 'plans-are-not-actions', title: 'Plans are not actions', paragraphs: ['ABI’s documented browser command provides a reviewed local plan. The README says browser autonomy is not Current; actual navigation remains an external integration step. A plan displayed on screen is not evidence that a browser was controlled.', 'Likewise, the small neural demonstration is not described as a production LLM. Preserve those boundaries in product copy, screenshots and examples. A compelling explanation should not require removing a material limitation.'] },
        ] },
    { slug: 'wdbx', title: 'Retrieval with its scope intact.', description: 'Read storage behavior and repository-reported contracts as distinct evidence.', group: 'Systems', sources: ['abi', 'wdbx'], sections: [
            { id: 'representations-and-retrieval', title: 'Representations and retrieval', paragraphs: ['In a vector-retrieval system, stored representations make it possible to rank candidate matches to a query. Similarity is a retrieval signal; it is not, by itself, proof that a result is correct or appropriate for a downstream task.', 'ABI’s README associates WDBX with semantic storage and hybrid ranking. For exact interfaces and the Current/Partial/Proposed mapping, use the upstream source and specification rather than treating this overview as an SDK reference.'] },
            { id: 'persistence-is-not-implicit', title: 'Persistence is not implicit', paragraphs: ['The README describes code paths that attempt configured storage and notes that persistence can be disabled, skipped, unavailable or unsuccessful. A system must distinguish those outcomes instead of fabricating a successful write.', 'For example, the documented environment values ABI_WDBX_PERSIST=0 and ABI_WDBX_PATH=:memory: opt out of durable persistence for relevant paths. Check the source for the exact command behavior before applying an override to your application.'] },
            { id: 'what-coverage-means', title: 'What reported coverage means', paragraphs: ['The README reports contract coverage for ordered search results, metadata round trips, segment/WAL recovery and compaction, temporal graph snapshot restoration, and MCP hybrid ranking. That is an upstream report; these tests were not rerun for this website.', 'It does not establish arbitrary scale, deployment topology, compliance, encryption guarantees or throughput. This review includes no connected database and no simulated query results presented as live output.'] },
        ] },
    { slug: 'identity', title: 'A companion, not a capability claim.', description: 'Understand Abbey, Aviva and ABI without confusing identity with implementation.', group: 'Systems', sources: ['abi', 'identity'], sections: [
            { id: 'the-described-roles', title: 'The described roles', paragraphs: ['The ABI README describes Abbey as the primary empathetic-polymath profile, Aviva as the direct expert mode, and ABI as the orchestration/governance layer. The linked identity specification contains the preserved declaration and a Current/Partial/Proposed mapping.', 'Those are source-described interaction roles. They should not be presented as proof of three separately deployed models, standalone commercial products, consciousness or unlimited autonomous capabilities.'] },
            { id: 'a-useful-design-principle', title: 'A useful design principle', paragraphs: ['An interface should make its actions and limits legible. A helpful tone and a persona name cannot substitute for permission, a working integration, or an accurate report of what happened.', 'This review applies that principle directly: documentation search uses bundled text, the diagram is conceptual, and the collaboration brief is prepared in your browser without being submitted. There is no simulated chatbot claiming to have accessed a runtime or private memory.'] },
            { id: 'follow-the-evidence', title: 'Follow the evidence', paragraphs: ['ABI links a companion repository for Abbey. That reference is useful, but it does not establish the companion’s present deployment state or test health. Its current build was not independently assessed in preparing this review.', 'When evaluating an identity-related feature, ask for the implemented behavior and evidence relevant to it. Keep design intent, source description, reported testing and independently measured outcomes as separate statements.'] },
        ] },
    { slug: 'gama', title: 'One tree. Many surfaces.', description: 'A source-based introduction to Gama’s Swift scene and rendering model.', group: 'Systems', sources: ['gama'], sections: [
            { id: 'scenes-and-a-render-tree', title: 'Scenes and a render tree', paragraphs: ['Gama’s README describes a modular declarative UI framework in Swift. App scenes and state produce a retained render tree, followed by layout, painting and backend-specific output. Platform events return through a host-owned event path.', 'The scene model requires one explicit primary scene. Auxiliary surfaces and typed groups are separate concepts; readers should use the current migration guide for exact declarations instead of copying an outdated example.'] },
            { id: 'modules-with-clear-jobs', title: 'Modules with clear jobs', paragraphs: ['GamaCore owns the foundational scenes, views, identity, state, layout and event vocabulary. GamaTUI targets terminal output. The README describes Apple host modules, a browser WASM reactor, a C embedding interface and a deterministic MLIR emitter.', 'These descriptions explain intended boundaries, not a promise that all platform targets have passed acceptance tests in this environment. Gama’s Swift interface work is separate from ABI’s Rust runtime and its toolchain instructions.'] },
            { id: 'verify-your-target', title: 'Verify your target', paragraphs: ['Choose a concrete host and inspect the current repository’s prerequisites, sample and verification command for it. Record your target, toolchain, checked-out revision and observed results before sharing a compatibility statement.', 'A framework benchmark harness is not automatically a performance gate. Do not invent a threshold, speedup or universal support matrix from the existence of a measurement tool or a module name. Follow the source link for the authoritative starting point.'] },
        ] },
    { slug: 'evidence', title: 'Evidence before promises.', description: 'Keep documented behavior, reported testing, measured results and targets separate.', group: 'Principles', sources: ['platform', 'abi', 'claims'], sections: [
            { id: 'two-independent-axes', title: 'Two independent axes', paragraphs: ['Implementation status and evidence provenance answer different questions. Current/Partial/Proposed describe the scope of an implementation. Measured/reported/target describe how a public numerical figure should be interpreted in the existing MLAI content contract.', 'Neither axis can replace the other. A reported test suite is not an independently reproduced benchmark. A proposed feature is not a delivered capability. An attractive graph is not evidence that its numbers were measured.'] },
            { id: 'a-minimum-evidence-record', title: 'A minimum evidence record', paragraphs: ['A useful performance statement identifies the source revision, date, environment, configuration, workload, methodology and artifact containing the results. It also states limitations and keeps comparisons consistent.', 'This review publishes no runtime performance figures. ABI’s README labels its project-site dashboard data as synthetic samples. Those samples must not become latency, accuracy, energy-efficiency or throughput claims elsewhere.'] },
            { id: 'what-this-review-verifies', title: 'What this review can establish', paragraphs: ['Source review establishes what a particular document says. Testing this website can establish whether its own links, search, controls and layouts work in the tested browser. Neither activity independently validates the linked software’s runtime, security, model quality or production deployment.', 'The evidence ledger names these limits next to each capability. Links to further specifications are reading pointers, not an assertion that every linked document, implementation path or external service was audited.'] },
        ] },
];
export type Evidence = {
    title: string;
    type: string;
    description: string;
    source: string;
};
export const evidence: Evidence[] = [
    { title: 'Nightly Rust runtime', type: 'Documented', description: 'ABI’s README describes the Rust rewrite and local orchestration. No runtime build was executed for this review.', source: 'abi' },
    { title: 'Storage and retrieval contracts', type: 'Reported coverage', description: 'Upstream reports search, recovery, compaction and snapshot contracts. The suites were not rerun here.', source: 'abi' },
    { title: 'Gama rendering integrations', type: 'Documented', description: 'The README describes its scene/render-tree architecture and modules; per-platform acceptance is separate.', source: 'gama' },
    { title: 'Native GPU acceleration', type: 'Conditional', description: 'The README requires accelerated=false when native kernels are absent. No universal acceleration claim.', source: 'abi' },
    { title: 'Benchmark dashboard', type: 'Synthetic', description: 'The ABI project-site dashboard uses synthetic sample data, not measured performance evidence.', source: 'abi' },
    { title: 'Autonomous browser execution', type: 'Not current', description: 'The source distinguishes a reviewed local browser plan from real browser control.', source: 'abi' },
];
export type SearchEntry = {
    url: string;
    title: string;
    description: string;
    body: string;
    group: string;
    sections?: { id: string; title: string; text: string }[];
};
export const searchEntries: SearchEntry[] = [
    ...articles.map(article => ({
        url: article.slug ? `/docs/${article.slug}/` : '/docs/',
        title: article.title, description: article.description, group: 'Documentation',
        body: article.sections.map(section => [section.title, ...section.paragraphs, section.code || '', section.note || ''].join(' ')).join(' '),
        sections: article.sections.map(section => ({ id: section.id, title: section.title, text: [...section.paragraphs, section.code || '', section.note || ''].join(' ') })),
    })),
    ...projects.map(project => ({ url: `/projects/${project.id}/`, title: project.name, description: project.description, body: project.scope.join(' '), group: project.kind })),
];
export function getArticle(slug: string) { return articles.find(a => a.slug === slug); }
export function getProject(id: string) { return projects.find(p => p.id === id); }
export const siteRoutes = ['/', '/projects/', ...projects.map(p => `/projects/${p.id}/`), ...articles.map(a => a.slug ? `/docs/${a.slug}/` : '/docs/'), '/trust/', '/about/', '/brief/'];
