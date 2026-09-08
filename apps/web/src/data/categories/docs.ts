import { DocsSchema, type Docs } from '../schemas';

const raw = [
  {
    slug: "getting-started",
    title: "Start with the source.",
    description: "Prepare an ABI checkout and follow its own validation workflow.",
    group: "Start here",
    sources: ["abi"],
    body: [
      {
        heading: "Prepare your checkout",
        paragraphs: [
          "Begin with the current ABI README and its toolchain and sibling-workspace prerequisites. The project uses nightly Rust and a checked-in Cargo wrapper. Do not treat a copied command as proof that every dependency is present on your machine.",
          "Clone the public repository into your own development workspace, then finish the upstream setup instructions before building. This page does not execute these commands or provision a runtime.",
        ],
        code: [
          {
            lang: "bash",
            code: "git clone https://github.com/donaldfilimon/abi.git\ncd abi",
          },
        ],
        note: "The repository may require additional sibling-workspace setup. Follow its current README before running the gate.",
      },
      {
        heading: "Use the project’s validation gate",
        paragraphs: [
          "The README identifies tools/check.sh as the primary validation gate and tools/cargo.sh as the wrapper for nightly Cargo. Use the wrapper rather than assuming bare cargo selects the intended toolchain.",
          "A successful gate is evidence for that checkout and environment. Record the commit, toolchain and actual output when you share results. The commands below come from upstream documentation and were not executed in preparing this page.",
        ],
        code: [
          {
            lang: "bash",
            code: "./tools/cargo.sh --version\n./tools/check.sh\n./tools/cargo.sh build -p abi-cli",
          },
        ],
      },
      {
        heading: "Inspect local behavior",
        paragraphs: [
          "Once the CLI has built, the README provides local inspection entry points. Start with backend and scheduler information before enabling an external provider. Check what your process actually reports instead of inferring capabilities from a product label.",
          "Live transports require their own configuration and explicit authorization. This guide does not ask for credentials, activate a cloud backend, or turn a local demonstration into a production service.",
        ],
        code: [
          {
            lang: "bash",
            code: "./target/debug/abi backends\n./target/debug/abi scheduler status",
          },
        ],
      },
    ],
  },
  {
    slug: "architecture",
    title: "Different tools. Clear roles.",
    description: "Separate runtime, storage, interface, and application framework responsibilities.",
    group: "Start here",
    sources: ["abi", "identity", "platform", "gama"],
    body: [
      {
        heading: "Runtime and storage",
        paragraphs: [
          "ABI’s README describes local orchestration, runtime primitives and WDBX integration. WDBX addresses the storage and retrieval side of that work. Their relationship does not imply that every operation is persistent or that a production cluster is deployed.",
          "The README explicitly allows persistence to be disabled or unavailable, and requires those conditions to be reported rather than presented as successful writes. A diagram cannot establish operational behavior; the relevant source and tests must do that.",
        ],
      },
      {
        heading: "Interface and identity",
        paragraphs: [
          "Abbey is the primary companion profile described by the source. Aviva is a direct expert mode, while ABI also names the orchestration/governance layer. These identity roles should not be mistaken for separate, independently verified models or repositories.",
          "The existing MLAI platform also separates product and persona visual identities. For example, an ABI product accent does not define the color of an Abi persona. The distinction matters in content models as well as interface design.",
        ],
      },
      {
        heading: "A separate framework track",
        paragraphs: [
          "Gama’s README describes Swift scenes and a retained render tree driving different interface backends. This is an application-framework track, not a required component of the conceptual Abbey–ABI–WDBX relationship.",
          "Keep project-specific build instructions and evidence separate. A passing web build does not prove a Swift target works; a local runtime test does not validate a mobile app, a hosted deployment, or a live provider integration.",
        ],
      },
    ],
  },
  {
    slug: "identity",
    title: "A companion, not a capability claim.",
    description: "Understand Abbey, Aviva and ABI without confusing identity with implementation.",
    group: "Systems",
    sources: ["abi", "identity"],
    body: [
      {
        heading: "The described roles",
        paragraphs: [
          "The ABI README describes Abbey as the primary empathetic-polymath profile, Aviva as the direct expert mode, and ABI as the orchestration/governance layer. The linked identity specification contains the preserved declaration and a Current/Partial/Proposed mapping.",
          "Those are source-described interaction roles. They should not be presented as proof of three separately deployed models, standalone commercial products, consciousness or unlimited autonomous capabilities.",
        ],
      },
      {
        heading: "A useful design principle",
        paragraphs: [
          "An interface should make its actions and limits legible. A helpful tone and a persona name cannot substitute for permission, a working integration, or an accurate report of what happened.",
        ],
      },
      {
        heading: "Follow the evidence",
        paragraphs: [
          "ABI links a companion repository for Abbey. That reference is useful, but it does not establish the companion’s present deployment state or test health. Its current build was not independently assessed here.",
          "When evaluating an identity-related feature, ask for the implemented behavior and evidence relevant to it. Keep design intent, source description, reported testing and independently measured outcomes as separate statements.",
        ],
      },
    ],
  },
  {
    slug: "gama",
    title: "One tree. Many surfaces.",
    description: "A source-based introduction to Gama’s Swift scene and rendering model.",
    group: "Systems",
    sources: ["gama"],
    body: [
      {
        heading: "Scenes and a render tree",
        paragraphs: [
          "Gama’s README describes a modular declarative UI framework in Swift. App scenes and state produce a retained render tree, followed by layout, painting and backend-specific output. Platform events return through a host-owned event path.",
          "The scene model requires one explicit primary scene. Auxiliary surfaces and typed groups are separate concepts; readers should use the current migration guide for exact declarations instead of copying an outdated example.",
        ],
      },
      {
        heading: "Modules with clear jobs",
        paragraphs: [
          "GamaCore owns the foundational scenes, views, identity, state, layout and event vocabulary. GamaTUI targets terminal output. The README describes Apple host modules, a browser WASM reactor, a C embedding interface and a deterministic MLIR emitter.",
          "These descriptions explain intended boundaries, not a promise that all platform targets have passed acceptance tests in this environment. Gama’s Swift interface work is separate from ABI’s Rust runtime and its toolchain instructions.",
        ],
      },
      {
        heading: "Verify your target",
        paragraphs: [
          "Choose a concrete host and inspect the current repository’s prerequisites, sample and verification command for it. Record your target, toolchain, checked-out revision and observed results before sharing a compatibility statement.",
          "A framework benchmark harness is not automatically a performance gate. Do not invent a threshold, speedup or universal support matrix from the existence of a measurement tool or a module name. Follow the source link for the authoritative starting point.",
        ],
      },
    ],
  },
  {
    slug: "evidence",
    title: "Evidence before promises.",
    description: "Keep documented behavior, reported testing, measured results and targets separate.",
    group: "Principles",
    sources: ["platform", "abi", "claims"],
    body: [
      {
        heading: "Two independent axes",
        paragraphs: [
          "Implementation status and evidence provenance answer different questions. Current/Partial/Proposed describe the scope of an implementation. Measured/reported/target describe how a public numerical figure should be interpreted in the existing MLAI content contract.",
          "Neither axis can replace the other. A reported test suite is not an independently reproduced benchmark. A proposed feature is not a delivered capability. An attractive graph is not evidence that its numbers were measured.",
        ],
      },
      {
        heading: "A minimum evidence record",
        paragraphs: [
          "A useful performance statement identifies the source revision, date, environment, configuration, workload, methodology and artifact containing the results. It also states limitations and keeps comparisons consistent.",
          "This page publishes no runtime performance figures. ABI’s README labels its project-site dashboard data as synthetic samples. Those samples must not become latency, accuracy, energy-efficiency or throughput claims elsewhere.",
        ],
      },
      {
        heading: "What source review can establish",
        paragraphs: [
          "Source review establishes what a particular document says. Testing a website can establish whether its own links, search, controls and layouts work in the tested browser. Neither activity independently validates the linked software’s runtime, security, model quality or production deployment.",
          "Links to further specifications are reading pointers, not an assertion that every linked document, implementation path or external service was audited.",
        ],
      },
    ],
  },
];

export const docs: Docs = DocsSchema.parse(raw);
