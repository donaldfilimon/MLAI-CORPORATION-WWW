/* ──────────────────────────────────────────────────────────────────────────
   lib/content.ts — long-form editorial content.

   This module holds the *prose* layer of the site. Hard facts and every number
   live in lib/brand.ts and carry provenance there; nothing here introduces a
   new benchmark, claim, or Apple-affiliation statement. This is explanation,
   context, and narrative built on top of the established facts.
   ────────────────────────────────────────────────────────────────────────── */

export const overview = {
  thesis:
    "Most AI runs in someone else's cloud. The model weights, the vector index, and your data sit on rented hardware three network hops away, and every query is a round trip you pay for in latency, cost, and exposure. MLAI is built on the opposite premise: the inference, the index, and the data should live on the same chip you already own.",
  paragraphs: [
    "Apple Silicon changed what is possible on a personal device. Unified memory removes the copy between CPU and GPU. The Neural Engine puts dedicated matrix hardware in every recent Mac, iPhone, and iPad. A 7B–13B model now runs locally at interactive speed — which means the cloud is no longer the only place capable AI can live.",
    "MLAI is the infrastructure layer that takes advantage of that shift. Three products stack on one chip: WDBX stores and searches vectors, the ABI Framework runs the math on the GPU, and Abbey is the assistant people actually talk to. Each is useful on its own; together they are a private AI stack that never has to phone home.",
    "We are deliberate about what we claim. Performance figures on this site are tagged by how we know them — measured on our hardware, a target we are building toward, or a figure reported from a cited document. We would rather under-claim and be trusted than over-claim and be corrected.",
  ],
  pillars: [
    {
      title: "Private by default",
      body: "On-device inference means data never leaves hardware the user controls. Privacy stops being a policy you have to trust and becomes a property of where the computation physically runs.",
    },
    {
      title: "Fast because it is local",
      body: "The latency advantage is not a clever optimization — it is the absence of a network. No round trip means single-digit-millisecond retrieval is the floor, not the ceiling.",
    },
    {
      title: "Verifiable end to end",
      body: "Every retrieval path, policy check, and tool call is captured as an inspectable event. Autonomy you cannot audit is autonomy you cannot ship into anything that matters.",
    },
    {
      title: "Built on open foundations",
      body: "The core is Apache-2.0. The runtime is Zig. The framing is honest: built on Apple's public frameworks — Metal, Accelerate, Core ML — with no claim of partnership or endorsement.",
    },
  ],
  faq: [
    {
      q: "Is MLAI a model, or infrastructure?",
      a: "Infrastructure. We do not train a frontier model and ask you to trust it. We build the storage (WDBX), the GPU compute framework (ABI), and the assistant layer (Abbey) that let capable open models run privately on Apple Silicon. The model is pluggable — OpenAI, Anthropic, or a local model via Ollama.",
    },
    {
      q: "What does \"privacy-first\" actually mean here?",
      a: "It means the default execution path keeps data on the device. Abbey's memory is stored locally in WDBX; inference can run fully on-device against a local model. Where a workload needs the cloud, the platform's Private Runtime supports VPC and on-premise deployment so the boundary is explicit and yours.",
    },
    {
      q: "Why Apple Silicon specifically?",
      a: "Unified memory and the Neural Engine make on-device inference viable at interactive speed in a way commodity laptops still can't match. Building for one well-understood architecture lets us use Metal, Accelerate, and Core ML directly instead of abstracting across a dozen targets and losing the advantage.",
    },
    {
      q: "Is any of this open source?",
      a: "Yes. The WDBX and ABI core is Apache-2.0 licensed — the same open-core model that GitLab, MongoDB, and Elastic used to build trust and adoption before monetizing advanced and managed tiers.",
    },
    {
      q: "How should I read the numbers on this site?",
      a: "Every metric carries a tag. A filled dot means measured — reproduced on our hardware with the harness in the repo. A hollow dot means target — an engineering goal we are building toward, not a result we have hit. A diamond means reported — a figure from a cited research document. We never blur the three.",
    },
  ],
};

export const wdbxContent = {
  intro: [
    "A vector database has one job: given a query vector, find the nearest stored vectors fast, and keep doing it correctly as the dataset grows and changes underneath you. Most production systems solve this in the cloud, where memory is cheap and latency is somebody else's problem. WDBX solves it on the device, where every megabyte and every microsecond is visible.",
    "It is written in Zig for a specific reason: control without a runtime. There is no garbage collector to pause mid-query, no hidden allocations in the hot path, and SIMD is a first-class language feature rather than an intrinsic you fight with. The same source compiles a distance kernel to AVX-512 on an x86 server and to NEON on Apple Silicon, and the database ships as a single static binary.",
  ],
  hnsw: [
    "Search uses HNSW — Hierarchical Navigable Small World graphs. The structure is a stack of layers: a sparse top layer for long jumps across the space, progressively denser layers below, and the full dataset at the base. A query enters at the top, greedily walks toward its nearest neighbor, drops a layer, and repeats. The result is logarithmic search complexity instead of scanning every vector.",
    "The defaults — M = 16 edges per node, efConstruction = 200 — are chosen to land high recall at low latency on realistic data. They are not magic constants; they are the knobs that trade index build time and memory against recall, and they are exposed so you can tune for your workload.",
  ],
  persistence: [
    "Vectors are held in memory-mapped files. The operating system pages data in on demand, large virtual ranges are reserved up front and committed in chunks, and serialization uses exact memory layouts so loading is closer to a pointer cast than a parse. Cold starts are fast because there is very little to do on start.",
    "Durability comes from a write-ahead log: append-only, fsync'd, checksummed. The same log is hash-chained, which is what makes the audit trail tamper-evident without slowing the index — the integrity property lives at the WAL level, not inside the HNSW hot path.",
  ],
  quantization: [
    "Product and scalar quantization compress vectors by replacing full-precision coordinates with compact codes. The recall cost is small and tunable; the memory win is large. This is what turns 'too big for the device' into 'fits in RAM' — the difference between a model of your data that lives in the cloud and one that lives in your pocket.",
  ],
  useCases: [
    {
      title: "On-device semantic memory",
      body: "Give an assistant a durable memory of every conversation without sending a word to a server. WDBX stores the embeddings locally; retrieval is a sub-millisecond lookup, not an API call.",
    },
    {
      title: "Private document search",
      body: "Index a knowledge base, a codebase, or a case file on the machine that holds it. The data and the index never leave, so search works offline and crosses no compliance boundary.",
    },
    {
      title: "Edge retrieval for agents",
      body: "Vector-aware retrieval close to where the agent runs, with the trust and recency scoring built in — so an agent's memory is fast, ranked, and explainable rather than a flat nearest-neighbor dump.",
    },
    {
      title: "App Store-shippable AI",
      body: "Native Swift and Metal integration means a vector database that passes App Store review and runs inside a shipping iOS or macOS app — not a server you have to stand up alongside it.",
    },
  ],
  glossary: [
    { term: "HNSW", def: "Hierarchical Navigable Small World — a layered proximity graph that gives approximate nearest-neighbor search in logarithmic time." },
    { term: "MVCC", def: "Multi-Version Concurrency Control — writers create new versions while readers see a consistent snapshot, so ingestion and query traffic never block each other." },
    { term: "Quantization", def: "Compressing vectors into compact codes (product or scalar) to cut memory footprint with a small, tunable recall cost." },
    { term: "Recall@k", def: "The fraction of the true k nearest neighbors an approximate search actually returns — the accuracy axis you trade against speed." },
    { term: "WAL", def: "Write-Ahead Log — an append-only durable record of every change, here hash-chained so the history is tamper-evident." },
    { term: "mmap", def: "Memory-mapped file access — the OS maps file pages directly into the address space, enabling near-instant cold starts and zero-copy reads." },
  ],
  faq: [
    {
      q: "How is WDBX different from Pinecone, Qdrant, or Chroma?",
      a: "Those are cloud-first vector databases reached over the network. WDBX is on-device-first: it runs inside your application on Apple Silicon with native Swift and Metal integration, so retrieval has no network latency and the data never leaves the machine. The competitive page lays out the comparison point by point.",
    },
    {
      q: "Does on-device mean small-scale?",
      a: "No. Quantization makes large datasets fit in unified memory, and HNSW keeps search logarithmic as the dataset grows. The design target is large collections that still answer in single-digit milliseconds locally.",
    },
    {
      q: "What backends does it support?",
      a: "Metal on Apple Silicon, with CUDA and Vulkan paths for other GPUs. The distance kernels are written once and compiled to the target instruction set.",
    },
    {
      q: "Is the audit log going to slow down my queries?",
      a: "No — that is the point of putting it at the write-ahead-log level rather than inside the index. The hash chain protects integrity on write; it is not in the read hot path, so search latency is unaffected.",
    },
  ],
};

export const abiContent = {
  intro: [
    "The ABI Framework is the compute layer — the part that actually runs the math. WDBX needs distance calculations and embeddings; Abbey needs inference. ABI is what spends the GPU to make both fast, on Apple Silicon and beyond.",
    "It is a Zig framework with a Metal backend. Tensor operations, neural-network layers, and the zero-copy pipelines that move data between stages without round-tripping through host memory — all built to use unified memory the way the hardware intends.",
  ],
  unifiedMemory: [
    "On a discrete GPU, every operation begins and ends with a copy: host to device, compute, device back to host. On Apple Silicon the CPU and GPU share one pool of memory, so a tensor produced by one stage is visible to the next without moving a byte. ABI is written around that fact — pipelines are zero-copy by construction, not by optimization.",
    "This is why the framework targets one architecture deeply instead of many shallowly. Generic cross-platform layers have to assume the copy exists. Building on Metal, Accelerate, and Core ML directly lets ABI delete it.",
  ],
  kernels: [
    "Distance and matrix kernels are written once in Zig's @Vector form and compiled to the exact target ISA — AVX-512 on x86, NEON on Apple Silicon. The database and the compute framework share that lowering, so there is a single source of truth for the hot numeric paths rather than a hand-written kernel per platform.",
    "The GPU speedup figures on the product page are matrix-workload benchmarks against a single-threaded CPU baseline on the same device. The smaller matrices show modest speedups where dispatch overhead dominates; the large ones show where the GPU earns its keep. The 295× figure is tagged a target — a benchmark-track objective, not a measured result.",
  ],
  features: [
    {
      title: "N-dimensional tensors",
      body: "Tensors with automatic differentiation, SIMD-optimized CPU paths, and Metal GPU kernels — the substrate every higher-level operation is built on.",
    },
    {
      title: "Neural-network layers",
      body: "Dense, Conv2D, LSTM, Attention, and the activation set (ReLU, Sigmoid, Softmax) with full backpropagation, so models train and run inside the same framework that serves them.",
    },
    {
      title: "GPU context management",
      body: "Metal Performance Shaders integration with automatic kernel selection and async pipelines, so the framework picks the right kernel for the device instead of asking you to.",
    },
    {
      title: "Capability reporting",
      body: "ABI reports what the GPU it is running on can actually do, so the same binary adapts across M-series generations rather than assuming a fixed feature set.",
    },
  ],
  faq: [
    {
      q: "Is ABI a training framework or an inference framework?",
      a: "Both, by design. Layers carry full backpropagation, so models can be trained, and the same tensor and kernel stack serves them — there is no handoff to a separate runtime.",
    },
    {
      q: "Does ABI only run on Apple Silicon?",
      a: "It is built for Apple Silicon and Metal first, because that is where unified memory makes the zero-copy design pay off. CUDA and Vulkan paths exist for other GPUs; the numeric kernels are written once and lowered per target.",
    },
    {
      q: "How does ABI relate to WDBX?",
      a: "ABI is the compute under WDBX. The vector database's GPU-accelerated distance calculations and embedding generation run through ABI — one framework spending the GPU for the whole stack.",
    },
  ],
};

export const abbeyContent = {
  intro: [
    "Abbey is the layer people actually talk to. Underneath it is WDBX for memory and ABI for compute; on the surface it is an assistant with a personality, a memory, and a strong opinion about where your data should live — which is on your hardware.",
    "The interesting design decision is that Abbey is not one assistant. It is three personas over one core, because a single model tuned to be warm is bad at being blunt, and a single model tuned to be blunt is bad at being kind. So the system splits the job.",
  ],
  personas: [
    "Abbey is the empathetic polymath — creative, emotionally aware, the default voice. Training penalizes unsupportive phrasing through an explicit empathy term, so warmth is a property of the objective, not a prompt instruction.",
    "Aviva is the unfiltered expert — direct technical answers with minimal hedging. A conciseness term penalizes filler tokens, which is why Aviva's answers are denser and, mechanically, lower-latency and lower-energy: fewer tokens is less compute.",
    "Abi is the adaptive moderator — the router. It chooses the persona per query by argmax over P(persona | input, context), and blends continuously when a question genuinely needs both warmth and precision.",
  ],
  memory: [
    "Abbey's memory is WDBX running locally. Conversations are embedded and stored on the device; recall is a vector lookup, not a server call. The assistant remembers because the index is right there — and it stays private for the same reason.",
    "On top of that sits neural backtracking. Interaction blocks are hash-chained, which gives an ordered, tamper-evident timeline of the session. When the assistant drifts or contradicts itself, the chain is walked backward to the exact point of divergence and the state is rewound — a structural fix for hallucination rather than a prompt-level patch.",
  ],
  efficiency: [
    "Low latency is not just a nice feel — it is a hardware-footprint multiplier. By Little's Law, the number of in-flight requests a system must hold equals arrival rate times time-in-system. At the reported 110 ms latency and 90 requests per second, steady-state concurrency is roughly ten requests in flight. A two-second-latency system would need on the order of 180 concurrent threads for the same throughput. Being fast is how you serve many people on modest hardware.",
  ],
  platforms: [
    "Abbey ships on Discord today, built on Bun and discord.js. A Swift 6 / Vapor 4 / DiscordBM port is in progress to bring the assistant fully native on Apple platforms, and a Python plus Twitch expansion is underway. The interface surface grows; the private-by-default core does not change.",
  ],
  faq: [
    {
      q: "Why three personas instead of one good assistant?",
      a: "Because the objectives conflict. Warmth and bluntness pull a single model in opposite directions, so tuning for one degrades the other. Splitting the roles and routing between them with Abi lets each persona be good at its job, and lets the system blend them when a query needs both.",
    },
    {
      q: "Where is my conversation history stored?",
      a: "Locally, in WDBX, on hardware you control. Memory recall is an on-device vector lookup. Nothing about remembering you requires sending your history to a server.",
    },
    {
      q: "What is neural backtracking?",
      a: "A drift-correction mechanism. Interaction blocks are hash-chained into an ordered, tamper-evident timeline; when the assistant goes off the rails, the chain is traversed back to the divergence point and the session state is rewound, rather than trying to patch the bad turn with more prompting.",
    },
    {
      q: "Which models can Abbey use?",
      a: "Multiple providers — OpenAI, Anthropic, or a local model via Ollama — with seamless switching. The persona system and memory sit above the model, so the provider is a choice, not a lock-in.",
    },
  ],
};

export const platformContent = {
  intro: [
    "Autonomy is easy to demo and hard to trust. An agent that plans, calls tools, and acts on your behalf is useful exactly to the degree that you can see what it did and constrain what it is allowed to do. The MLAI platform is the wrapper that makes on-device autonomy inspectable: what the agent saw, what it was allowed to do, how it was tested, and where it runs.",
    "These are not four features bolted on after the fact. They are the four questions anyone responsible for an AI system has to answer before it touches anything important, expressed as layers you can configure.",
  ],
  layersDetail: [
    {
      title: "Trace Layer",
      body: "Captures retrieval paths, policy checks, model decisions, tool calls, and operator interventions as inspectable events. When something goes wrong, you read the trace instead of guessing. When it goes right, you can prove why.",
      meta: "what the agent saw",
    },
    {
      title: "Control Plane",
      body: "Defines which agents may plan, review, execute, escalate, or abstain under each workflow condition. Capability is a grant, not an assumption — an agent does only what its policy permits, and abstaining is a first-class option.",
      meta: "what it was allowed to do",
    },
    {
      title: "Evaluation Mesh",
      body: "Runs regression scenarios across retrieval faithfulness, latency, safety behavior, prompt injection, and human-review burden. Changes are measured against the same battery every time, so a quiet regression shows up as a failed scenario rather than a production incident.",
      meta: "how it was tested",
    },
    {
      title: "Private Runtime",
      body: "Packages orchestration, retrieval, audit logs, and controls for cloud, VPC, on-premise, and offline-first deployment. The boundary where computation happens is a deployment choice you make explicitly, not a default you inherit.",
      meta: "where it runs",
    },
  ],
  principles: [
    {
      title: "Inspectable beats clever",
      body: "A system you can audit is worth more than a system that is marginally smarter and opaque. Every layer is designed to be read by a human who needs to answer for it.",
    },
    {
      title: "Abstaining is a feature",
      body: "An agent that knows when not to act is safer than one that always produces an answer. The Control Plane treats abstention as a valid, configurable outcome.",
    },
    {
      title: "Test the behavior, not the vibes",
      body: "The Evaluation Mesh turns 'it seems fine' into a scored regression suite — faithfulness, safety, injection resistance — so quality is measured rather than felt.",
    },
  ],
  faq: [
    {
      q: "Is the platform a separate product from WDBX and ABI?",
      a: "It is the operational layer around them. WDBX and ABI provide storage and compute; the platform provides the trace, control, evaluation, and runtime wrapper that makes an autonomous system built on them safe to deploy.",
    },
    {
      q: "Can it run fully offline?",
      a: "Yes — offline-first is one of the supported Private Runtime modes, alongside cloud, VPC, and on-premise. The same controls and audit logs apply regardless of where it runs.",
    },
    {
      q: "What does the Evaluation Mesh actually check?",
      a: "Regression scenarios across retrieval faithfulness, latency, safety behavior, prompt-injection resistance, and how much human review a change creates — the axes that tend to regress quietly when a model or prompt changes.",
    },
  ],
};

export const architectureContent = {
  intro: [
    "The whole stack reduces to one sentence: the inference, the index, and the data live on the same chip. Everything else is the engineering that makes that sentence true without giving up speed, scale, or correctness.",
    "Read from the bottom up. Silicon provides unified memory and the Neural Engine. ABI spends that hardware on tensor math. WDBX stores and searches vectors using ABI's compute. Abbey talks to people using WDBX's memory. The platform wraps the whole thing so it can be trusted in production.",
  ],
  flow: [
    { title: "Silicon", body: "Apple Silicon's unified memory and Neural Engine — one pool of memory shared by CPU and GPU, with dedicated matrix hardware. This is the substrate the entire stack is shaped around." },
    { title: "ABI Framework", body: "Tensor operations and GPU kernels that turn the silicon into usable compute, with zero-copy pipelines that exploit unified memory instead of copying around it." },
    { title: "WDBX", body: "Vector storage and HNSW search running on ABI's compute, with MVCC for concurrency and a hash-chained WAL for durable, auditable writes." },
    { title: "Abbey", body: "The assistant layer — personas, routing, and locally-stored memory backed by WDBX, talking to pluggable models." },
    { title: "Platform", body: "Trace, control, evaluation, and private runtime wrapped around all of it, so the autonomy is inspectable and deployable on your terms." },
  ],
  designChoices: [
    {
      title: "One architecture, deeply",
      body: "Targeting Apple Silicon first is a choice to use Metal, Accelerate, and Core ML directly rather than abstract across many platforms and lose the unified-memory advantage that makes on-device viable.",
    },
    {
      title: "Zig for the hot paths",
      body: "No garbage collector, no hidden allocations, SIMD as a language primitive, and single-binary cross-compilation. The database and compute framework share one numeric lowering.",
    },
    {
      title: "Integrity at the log, not the index",
      body: "Hash-chaining lives at the write-ahead-log level so the audit trail is tamper-evident without taxing search latency. Correctness and speed are not traded against each other.",
    },
    {
      title: "Provenance as a first-class field",
      body: "Every metric carries how it is known — measured, target, or reported. The data model itself refuses to let a goal be presented as a result.",
    },
  ],
};

export const companyContent = {
  story: [
    "MLAI started from a frustration that anyone who has shipped AI knows: the most capable systems are also the most opaque and the least private. You send your data somewhere you cannot see, trust a model you cannot inspect, and pay for the round trip every time. The bet behind the company is that Apple Silicon finally makes the alternative practical — capable AI that runs where you can see it.",
    "The explainer film tells the origin as a parable: one model was built to answer everything, and it buckled under the weight of being all things at once. So instead of chasing one mind, three were built — Abbey to understand you, Aviva for the truth unfiltered, Abi to hold them in balance — on WDBX, private by default. That is the company in one breath.",
  ],
  approach: [
    {
      title: "Disciplined secrecy",
      body: "Build quietly, ship deliberately, and say only what is true. Claims are tagged by how they are known; unverified affiliations are not implied.",
    },
    {
      title: "Mission stewardship",
      body: "Privacy is the product, not the marketing. Decisions are made against whether they keep computation on hardware the user controls.",
    },
    {
      title: "Operational velocity",
      body: "A small team using the right tools — Zig, Swift, Bun, Metal — moving fast because the stack is chosen for control, not convention.",
    },
  ],
  faq: [
    {
      q: "Who is behind MLAI?",
      a: "Donald Filimon, founder and systems architect — a polyglot engineer across Zig, Swift, Rust, TypeScript, Python, and GPU runtimes, with shipped work in compiler infrastructure and on-device ML. The company is Machine Learning Advanced Innovations, Inc., a Delaware C-Corp based in Orlando, Florida.",
    },
    {
      q: "What is the relationship with Apple?",
      a: "MLAI builds on Apple's public frameworks — Metal, Accelerate, and Core ML — the same way any developer does. There is no partnership, endorsement, or employment affiliation implied. The site is careful to use only that framing.",
    },
    {
      q: "Is MLAI hiring?",
      a: "The team is small and growing deliberately, with the first raise funding senior engineering hires. The careers section reflects current openings; the bar is high and the surface area — compilers, GPU, on-device ML — is unusually deep for the stage.",
    },
  ],
};

export const investorsContent = {
  narrative: [
    "The opportunity is a timing bet, not a technology gamble. Vector databases are a real and growing market, on-device AI just became viable on hundreds of millions of shipped devices, and the regulatory and cost pressures pushing computation off the cloud are all moving the same direction at once.",
    "The wedge is the same open-core motion that built GitLab, MongoDB, and Elastic: a genuinely useful Apache-2.0 core that earns developer adoption, with advanced clustering, managed cloud, and enterprise controls as the monetized tiers above it. Adoption first, revenue second, defensibility from being the on-device default.",
  ],
  whyNowExpanded: [
    {
      title: "The hardware crossed the line",
      body: "The M4 Neural Engine runs at a level that makes 7B–13B models interactive on-device, on hundreds of millions of shipped Apple Silicon devices with unified memory up to 128GB. The capability is in people's hands already.",
    },
    {
      title: "Regulation rewards locality",
      body: "GDPR enforcement and the EU AI Act make on-device processing a compliance posture rather than a preference. Data that never leaves the device crosses no border and triggers no transfer rule.",
    },
    {
      title: "Cloud economics inverted",
      body: "As inference moves from experiment to product, the per-query cost of the cloud compounds. On-device inference carries zero marginal cost, and hybrid edge deployment cuts infrastructure spend substantially against pure cloud.",
    },
    {
      title: "Open models matured",
      body: "Llama, Mistral, and Phi are genuinely capable at sizes that fit on-device, and Apple Intelligence validated the on-device thesis in the market. The model layer stopped being a moat, which makes the infrastructure layer the place to build.",
    },
  ],
  thesisLong:
    "MLAI delivers privacy-first AI infrastructure purpose-built for Apple Silicon's unified memory architecture. With 200M+ Apple Silicon devices, effectively zero native vector-database solutions for that hardware, and 73% of enterprises moving toward edge AI for privacy, the company is positioned against a multi-billion-dollar vector-database market through a proven open-core monetization path.",
  faq: [
    {
      q: "What is being raised, and for what?",
      a: "A $1.5M pre-seed for an 18-month runway to Series A. The majority funds senior engineering; the remainder funds developer relations and the operations needed to convert open-source adoption into enterprise revenue.",
    },
    {
      q: "How does an open-source core make money?",
      a: "The same way GitLab, MongoDB, and Elastic did: the Apache-2.0 core drives adoption and trust, while advanced clustering and quantization (WDBX Pro), enterprise controls and SLAs, and a managed cloud tier are paid. Open core is the funnel, not the business model in full.",
    },
    {
      q: "What are the projections based on?",
      a: "The ARR trajectory and unit-economics figures shown are targets — modeled goals tied to the roadmap, tagged as such — not reported results. They describe what the plan is built to achieve, with milestones at the 18-month mark to check the thesis against reality.",
    },
  ],
};

export const servicesContent = {
  intro: [
    "Beyond the products, MLAI takes on a small number of engagements where the on-device, privacy-first approach is the whole point. These are not generic consulting hours — they are deep builds in the exact surface area the products are made of: vector search, GPU compute, and private AI on Apple Silicon.",
  ],
  engagementModel: [
    { title: "Scoped and senior", body: "Engagements are run by the people who build the stack, scoped tightly, and priced against outcomes rather than headcount. The point is leverage, not staffing." },
    { title: "Privacy as the constraint", body: "Every engagement starts from the assumption that data stays on hardware the client controls. The architecture follows from that, not the other way around." },
    { title: "Built to hand off", body: "Deliverables are real code and documentation a client team can own, not a dependency on MLAI. The goal is to make the client self-sufficient on the private-AI stack." },
  ],
};

export const researchContent = {
  intro: [
    "The research surface under MLAI is small but load-bearing: the formal model that makes WDBX's retrieval explainable, and the systems work that makes a pure-Zig stack practical to ship. It is published because the claims should be checkable, not taken on faith.",
    "The throughline is the same as the products': make the behavior inspectable. A retrieval score you can decompose, an audit trail you can verify, and a server architecture whose tradeoffs are written down rather than assumed.",
  ],
  themes: [
    {
      title: "Explainable retrieval",
      body: "A composite score that combines similarity, recency, causal distance, and source authority into one ranked, decomposable number — so a retrieval can be explained to an auditor, not just returned to a developer.",
    },
    {
      title: "Tamper-evident memory",
      body: "Hash-chaining the write-ahead log turns an agent's memory into a verifiable timeline, which is the precondition for neural backtracking and for trusting what the system says it remembered.",
    },
    {
      title: "Pure-Zig systems",
      body: "The architecture guide works through what it actually takes to ship a full-stack server in Zig today — HTTP framework tradeoffs, the TLS gap, SIMD distance kernels, mmap persistence, and single-binary cross-compilation.",
    },
  ],
};

export const contactContent = {
  intro:
    "One inbox, read by the people who build the thing. Whether you want to deploy WDBX, pilot the platform, talk about an engagement, or invest — say which, and you will get a direct answer rather than a routing maze.",
  paths: [
    { title: "Build with WDBX", body: "Deploying the vector database or the ABI framework in your own app. Start with the open-source core; reach out when you need Pro or enterprise terms." },
    { title: "Pilot the platform", body: "Running an autonomous workflow that has to be inspectable and private. Good fit for regulated or privacy-sensitive teams." },
    { title: "Engagements", body: "A scoped build in vector search, GPU compute, or private on-device AI on Apple Silicon." },
    { title: "Invest", body: "The pre-seed is open. The investor page has the thesis, the market, and the plan; this is how you start the conversation." },
  ],
};
