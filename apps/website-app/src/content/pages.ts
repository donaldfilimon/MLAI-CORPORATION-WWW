export interface Article {
  title: string;
  description: string;
  category: string;
  sections: { title: string; body: string[]; code?: string }[];
  links?: { label: string; href: string }[];
}
const section = (title: string, ...body: string[]) => ({ title, body });
export const pages: Record<string, Article> = {
  platform: {
    title: "Autonomy you can answer for.",
    description:
      "Four layers make autonomy inspectable: what the agent saw, what it was allowed to do, how it was tested, and where it runs.",
    category: "Platform",
    sections: [
      section(
        "Three ways to work",
        "Use Abbey to reason over project documents, the developer console to inspect real service requests, and the customer portal to review work with MLAI.",
        "Application records and uploaded documents remain in the local installation. Model providers are an explicit workspace choice.",
      ),
      section(
        "A clear boundary around every workspace",
        "Projects, messages, source files, and application keys belong to a workspace. Membership is enforced by the server on every operation, including source downloads.",
        "Assigned staff can work on an engagement without gaining access to unrelated private AI conversations.",
      ),
    ],
    links: [
      { label: "Read the architecture", href: "/architecture" },
      { label: "Open workspace", href: "/app" },
    ],
  },
  abi: {
    title: "Compute you can interrogate.",
    description:
      "A Rust runtime for agent orchestration, model connections, and inspectable capabilities.",
    category: "ABI · Runtime & orchestration",
    sections: [
      section(
        "Start with what the runtime can prove",
        "ABI exposes runtime diagnostics, scheduler state, and capability reports through its CLI. The developer console connects to a configured executable and shows actual responses.",
        "Linked features, native acceleration, and fallback behavior are distinct states. A configured backend is not proof that a particular model or accelerator is ready.",
      ),
      section(
        "Explicit execution interfaces",
        "The local console permits a bounded diagnostic snapshot and backend report. It does not expose a shell or accept arbitrary command arguments.",
        "Broader ABI functionality remains documented in the runtime repository. This website does not treat every runtime command as an application feature.",
      ),
    ],
    links: [
      { label: "ABI repository", href: "https://github.com/donaldfilimon/abi" },
      { label: "Connect ABI", href: "/docs/abi" },
    ],
  },
  wdbx: {
    title: "Memory with a path you can follow.",
    description:
      "Memory and retrieval infrastructure with inspectable storage and explicit interfaces.",
    category: "WDBX · Memory & retrieval",
    sections: [
      section(
        "Query a real store",
        "The ABI WDBX gateway exposes vector insertion and search, key/value operations, statistics, and mutation events through an authenticated gRPC interface.",
        "Playground results come from the selected gateway. The interface reports disconnected services and failed requests directly.",
      ),
      section(
        "Isolation has a concrete boundary",
        "A gateway binding belongs to one application workspace. The current gateway has no tenant field, so different customer workspaces cannot share one bound store.",
        "The application's document index is separate. It owns document deletion, source references, and semantic model versions; gateway playground data has its own lifecycle.",
      ),
    ],
    links: [
      {
        label: "WDBX repository",
        href: "https://github.com/donaldfilimon/wdbx",
      },
      { label: "Gateway integration", href: "/docs/wdbx" },
    ],
  },
  abbey: {
    title: "IWL — an assistant that remembers locally.",
    description:
      "IWL is the assistant workspace with persistent vector-backed memory. Abbey, Aviva, and Abi share one core on hardware you control.",
    category: "IWL · Assistant experience",
    sections: [
      section(
        "Ask with sources in reach",
        "Organize a project, upload a document, and ask a focused question. Abbey can retrieve relevant excerpts and attach citations that open the source location.",
        "Source extraction and generated interpretation are separate. A summary is a model-produced interpretation, not a replacement for the underlying document.",
      ),
      section(
        "Choose the model boundary",
        "Local mode connects to an operator-configured model endpoint on this computer. Hosted mode is an explicit workspace setting.",
        "The app never silently sends a failed local request to a cloud provider. If the selected model is unavailable, the conversation reports the failure and preserves your work.",
      ),
    ],
    links: [
      { label: "Open Abbey", href: "/app/abbey" },
      { label: "Model setup", href: "/docs/models" },
    ],
  },
  architecture: {
    title: "Follow the data. Inspect the boundaries.",
    description:
      "A document moves through upload, interpretation, indexing, retrieval, and a cited answer. Each stage has an observable state.",
    category: "Architecture",
    sections: [
      section(
        "Upload and interpret",
        "The server validates workspace access and stores the original outside the public web directory. A persistent worker identifies the format, extracts structured content, and uses OCR when the installed pipeline supports it.",
        "Pages, sections, rows, slides, and tables retain location metadata. Partial conversion is visible rather than silently presented as a complete document.",
      ),
      section(
        "Index and retrieve",
        "SQLite stores the authoritative document and job records. Full-text search works independently of a model service. A separately versioned local embedding index can add semantic retrieval.",
        "Only chunks authorized for the current workspace and selected project are supplied as source context.",
      ),
      section(
        "Generate and inspect",
        "The selected model receives a bounded conversation and selected source excerpts. Local and hosted connections never interchange automatically.",
        "Answers stream into a persistent conversation. Citations reference authorized source records; deleted sources remain labeled as removed in historical conversations.",
      ),
      section(
        "Services remain explicit",
        "ABI diagnostics use allowlisted CLI operations. WDBX requests use its published gRPC messages and authenticated gateway. Application API keys are distinct from upstream service credentials.",
      ),
    ],
    links: [
      { label: "Processing and privacy", href: "/processing" },
      { label: "API reference", href: "/docs/api" },
    ],
  },
  company: {
    title: "Building intelligence you can inspect.",
    description:
      "MLAI brings systems engineering, practical AI workflows, and careful source handling into one product experience.",
    category: "Company",
    sections: [
      section(
        "A systems perspective",
        "Machine Learning Advanced Innovations focuses on the infrastructure around model output: runtime behavior, source provenance, explicit provider selection, and operator control.",
        "Donald Filimon leads the work across ABI, WDBX, Abbey, and the MLAI application.",
      ),
      section(
        "Show the evidence",
        "We distinguish implemented capabilities from targets, and local validation from deployed service readiness. Product documentation points to the interfaces that support its claims.",
        "Built on Apple's public frameworks describes the use of public technology. It does not imply an Apple partnership or endorsement.",
      ),
    ],
    links: [
      { label: "Explore the research", href: "/research" },
      { label: "Contact MLAI", href: "/contact" },
    ],
  },
  services: {
    title: "Work on the system that matters.",
    description:
      "From a focused architecture review to an integrated AI workflow, begin with the actual problem and a reviewable deliverable.",
    category: "Services",
    sections: [
      section(
        "Architecture and readiness",
        "Map a workflow's data, model, and tool boundaries. Define measurable acceptance criteria and identify which parts require local processing or explicit human review.",
      ),
      section(
        "Retrieval and model integration",
        "Design source ingestion, retrieval, citations, provider selection, and failure handling around the documents and systems your team actually uses.",
      ),
      section(
        "Runtime and evaluation",
        "Inspect service behavior, build regression scenarios, and turn technical findings into a bounded implementation plan.",
      ),
      section(
        "A visible engagement",
        "Submit a service request, complete onboarding, review milestones, and leave feedback on versioned deliverables in the customer portal.",
        "An approval applies to the exact version you reviewed. New versions receive a fresh review.",
      ),
    ],
    links: [
      { label: "Request an engagement", href: "/app/portal" },
      { label: "Discuss a project", href: "/contact" },
    ],
  },
  investors: {
    title: "An engineering-led view of MLAI.",
    description:
      "The product thesis, current scope, and evidence behind the work.",
    category: "Investor information",
    sections: [
      section(
        "The thesis",
        "AI applications need durable context, explicit execution boundaries, and useful operator interfaces. MLAI develops runtime, memory, and application surfaces around those needs.",
      ),
      section(
        "The product scope",
        "The local release combines a public technical website, an AI workspace, a developer console, and a customer portal. Billing and public production deployment are separate milestones.",
      ),
      section(
        "Evidence before projections",
        "This page does not publish unsourced market sizes, fabricated customer traction, or performance targets as measured results.",
        "Contact the team for a discussion of the current roadmap and supporting technical material. Financial information and investment terms are not provided here.",
      ),
    ],
    links: [
      { label: "Technical architecture", href: "/architecture" },
      { label: "Contact the team", href: "/contact" },
    ],
  },
  privacy: {
    title: "Privacy follows the data.",
    description:
      "How this local installation stores and processes your information.",
    category: "Privacy",
    sections: [
      section(
        "Local records",
        "Account identifiers, memberships, projects, conversations, uploads, and engagement records are stored in this installation's private data directory. Local account email addresses are identifiers and are not automatically verified.",
      ),
      section(
        "Model processing",
        "Local processing uses a configured loopback model service. Hosted processing sends the prompt and selected source excerpts to the explicitly chosen hosted provider, only after a workspace owner enables it.",
        "Provider credentials stay on the server. The app does not silently switch providers or enable cloud processing because a local request fails.",
      ),
      section(
        "Controls and access",
        "Workspace access is checked for documents, messages, downloads, and API requests. Staff access is limited to assigned engagements.",
        "You can delete conversations and documents. Operational traces record outcomes and timing without raw prompts or document bodies. Operator backups are separate copies and require their own retention decisions.",
      ),
      section(
        "Contact and policy scope",
        "Inquiries and service requests persist locally for staff review. This local release does not send external email or run a billing system.",
        "This policy describes the local release. A hosted deployment requires deployment-specific privacy and retention information before publication.",
      ),
    ],
  },
  terms: {
    title: "Terms for the local release.",
    description:
      "Understand the role and limits of this application before using it.",
    category: "Terms",
    sections: [
      section(
        "Your material and access",
        "Upload documents you are authorized to process and share. Workspace owners manage membership; MLAI staff roles are assigned by the installation operator.",
      ),
      section(
        "Generated output",
        "Model output can be incomplete or incorrect. Review original sources and citations before relying on generated interpretations. The application does not turn a model answer into professional advice or a verified measurement.",
      ),
      section(
        "Local software scope",
        "This release runs on your local installation. Model availability, optional parsers, and external gateways depend on their configured services. The interface reports unavailable integrations.",
        "No payment processing, subscription agreement, or service-level commitment is created by using this local application.",
      ),
    ],
  },
  processing: {
    title: "Know where the work happens.",
    description:
      "Local processing is the default. Hosted connections require an explicit choice.",
    category: "Processing",
    sections: [
      section(
        "On this computer",
        "Document extraction, OCR, application storage, and keyword search run locally. Model and parser installation may download dependencies or weights; document content is not sent as part of those downloads.",
      ),
      section(
        "At the selected model",
        "Local chat connects to a loopback endpoint. Hosted chat sends conversation context and selected document excerpts to the configured hosted provider. The provider name stays visible in the workspace.",
      ),
      section(
        "When a service is unavailable",
        "Documents and projects remain available when a model is offline. Answers and interpretations report an unavailable provider rather than returning a fabricated response.",
        "If semantic indexing is unavailable, search states that it is using keyword retrieval.",
      ),
    ],
  },
  "docs/getting-started": {
    title: "Start a local workspace",
    description:
      "From installation to a first project and a cited conversation.",
    category: "Documentation",
    sections: [
      {
        ...section(
          "Install and launch",
          "Run the setup command from the project root. It initializes the database and Python worker environment. Development starts the website and worker together.",
        ),
        code: "bun install\nbun run setup\nbun run dev",
      },
      section(
        "Create your account",
        "Register a local account using a password of at least twelve characters. Your first workspace is created automatically. Email is a local account identifier, not a verified mailbox.",
      ),
      section(
        "Create a project and add sources",
        "Create a project, upload a supported document, and wait for extraction to finish. Open the document to inspect the result before asking Abbey to interpret it.",
      ),
      section(
        "Connect a model",
        "An operator configures provider destinations. Select an available local connection in Settings; if it is offline, the rest of your workspace remains usable.",
      ),
    ],
  },
  "docs/models": {
    title: "Model connections",
    description: "Configure explicit local and hosted model destinations.",
    category: "Integration guide",
    sections: [
      section(
        "Operator-owned configuration",
        "Connections are configured in the private connections.json file. Model credentials are read from named server environment variables, never browser storage.",
        "A local endpoint must be loopback. A hosted endpoint must use HTTPS. Each entry supplies a stable connection ID, name, kind, URL, and optional model ID.",
      ),
      {
        ...section(
          "Local connection example",
          "Set the address to the actual MLX Core server and select a model it exposes. With no model ID, the application selects the first model returned by the configured endpoint.",
        ),
        code: '[{"id":"mlx","name":"MLX Core","kind":"local","url":"http://127.0.0.1:8080/v1","model":""}]',
      },
      section(
        "Hosted processing",
        "Add a hosted connection with its keyEnv variable name, then have the workspace owner explicitly enable hosted processing and select that connection.",
        "Local failures never activate the hosted connection.",
      ),
    ],
  },
  "docs/documents": {
    title: "Document processing",
    description:
      "Understand extraction, source locations, interpretation, and deletion.",
    category: "Documentation",
    sections: [
      section(
        "Check installed formats",
        "The Documents page shows the installed parser capabilities. Native text, structured documents, legacy conversion, and OCR may have different dependencies.",
      ),
      section(
        "Inspect the result",
        "Preview source content, read the outline, inspect extracted tables, and review warnings. A partial document is searchable but remains labeled partial.",
      ),
      section(
        "Interpret deliberately",
        "Choose summary, classification, key facts, action items, or comparison. Generated interpretation is saved separately from source extraction and identifies its provider.",
      ),
      section(
        "Delete the complete document",
        "Deletion removes the original, extraction artifacts, index entries, embeddings, jobs, and interpretations. Older conversation references become source removed.",
      ),
    ],
  },
  "docs/abi": {
    title: "Connect ABI diagnostics",
    description: "Inspect the real runtime through a bounded interface.",
    category: "Integration guide",
    sections: [
      {
        ...section(
          "Configure the executable",
          "The operator supplies the absolute ABI executable path. The app invokes fixed arguments and disables runtime persistence for diagnostic requests.",
        ),
        code: '{"id":"abi-local","name":"ABI","kind":"abi","binary":"/absolute/path/to/abi"}',
      },
      section(
        "Available operations",
        "Snapshot invokes dashboard --once --json. Backends invokes backends. Results and timing come from the actual process.",
        "The console never accepts a shell command, arbitrary executable, or arbitrary CLI arguments.",
      ),
    ],
  },
  "docs/wdbx": {
    title: "Connect a WDBX gateway",
    description:
      "Authenticated gRPC operations against a workspace-exclusive store.",
    category: "Integration guide",
    sections: [
      section(
        "Bind the right store",
        "The operator configures the gRPC address and bearer-token file. A workspace owner then binds the connection. The same gateway cannot be bound to another workspace.",
      ),
      section(
        "Transport security",
        "Loopback gateways may use a plain local connection. Non-loopback gateways require TLS; CA and client certificate/key paths preserve mutual TLS when configured.",
      ),
      section(
        "Playground operations",
        "Use Stats, PutVector, Search, PutKv, and GetKv. Search accepts a numeric query vector and a bounded result limit. Mutation events are available as a short-lived event stream.",
      ),
      section(
        "Document data is separate",
        "Playground records are not the application's document index. The application owns document lifecycle and deletion in its own local store.",
      ),
    ],
  },
  "docs/api": {
    title: "Application API",
    description: "A versioned interface for authorized workspace operations.",
    category: "API reference",
    sections: [
      section(
        "Authentication",
        "Browser requests use Better Auth sessions. Programmatic requests use a workspace API key with only the required scopes. Keys are shown once at creation and can be revoked.",
      ),
      {
        ...section(
          "Read workspace projects",
          "The key identifies its workspace. Resource authorization still applies to every operation.",
        ),
        code: 'curl http://127.0.0.1:3100/api/v1/projects \\\n  -H "Authorization: Bearer $MLAI_API_KEY"',
      },
      section(
        "Scopes and errors",
        "Scopes are read, write, chat, documents, and console. Owner and staff management operations require an interactive session.",
        "Errors include a stable code, a useful message, and a request ID. The OpenAPI document describes endpoint inputs and outputs.",
      ),
    ],
    links: [{ label: "OpenAPI JSON", href: "/api/v1/openapi.json" }],
  },
  "docs/operations": {
    title: "Operate the local installation",
    description: "Accounts, persistent jobs, backups, and recovery.",
    category: "Operations",
    sections: [
      {
        ...section(
          "Verification",
          "Run the project gate and browser acceptance before treating a change as complete.",
        ),
        code: "bun run check\nbun run test:e2e",
      },
      {
        ...section(
          "Staff and account recovery",
          "A local operator can assign staff access or reset a registered account. Resetting a password revokes existing sessions.",
        ),
        code: "bun run account:staff person@example.com\nbun run account:reset person@example.com",
      },
      section(
        "Back up and restore",
        "Stop active writes before taking a complete backup of the database and private files. Restore into a separate data directory and validate before using the recovered installation.",
        "Document jobs use leases and can recover after interruption. Failed jobs retain a readable reason and an explicit retry action.",
      ),
    ],
  },
  "research/provenance": {
    title: "Retrieval and source provenance",
    description: "A technical note on making document answers inspectable.",
    category: "Technical note",
    sections: [
      section(
        "An answer needs a path back",
        "A useful citation identifies the document and the location that supports a claim. A link to a whole file is often insufficient when the file contains many pages or tables.",
      ),
      section(
        "Extraction is not interpretation",
        "The parser produces text and structure. A model produces an interpretation of selected excerpts. Keeping them separate makes it possible to inspect uncertainty and correct extraction independently.",
      ),
      section(
        "Deletion and historical references",
        "When source material is removed, old conversations should say that the source is gone. Retaining a citation label must not silently retain the deleted source body.",
      ),
    ],
    links: [
      { label: "Document architecture", href: "/architecture" },
      {
        label: "Docling documentation",
        href: "https://docling-project.github.io/docling/",
      },
    ],
  },
  "research/provider-boundaries": {
    title: "Local and hosted model boundaries",
    description:
      "A technical guide to explicit provider selection and honest failure states.",
    category: "Technical guide",
    sections: [
      section(
        "A provider change is a data decision",
        "Switching from a local endpoint to a hosted API changes where the prompt and source excerpts travel. That should be a visible workspace choice, not an invisible retry strategy.",
      ),
      section(
        "Availability and capability differ",
        "An endpoint can respond while no usable model is loaded. A text model may not support image interpretation or embeddings. Each capability needs its own observable test.",
      ),
      section(
        "Failure preserves intent",
        "A failed local request should preserve the conversation and its provider choice. It should not fabricate an answer or silently send the request elsewhere.",
      ),
    ],
    links: [{ label: "Provider setup", href: "/docs/models" }],
  },
  "research/execution-traces": {
    title: "Inspectable execution traces",
    description:
      "Observe outcomes without making operational logs a second document store.",
    category: "Architecture guide",
    sections: [
      section(
        "Record the operation",
        "A request ID, operation, selected service, outcome, and duration are useful operational facts. Token usage is included only when the provider actually reports it.",
      ),
      section(
        "Avoid accidental content logs",
        "Prompts, source documents, and secrets do not belong in ordinary operational traces. Content remains in the authorized application record where its lifecycle is explicit.",
      ),
      section(
        "Measure only what happened",
        "A disconnected gateway has no successful latency measurement. Missing usage is unknown, not zero. The console should preserve that distinction.",
      ),
    ],
    links: [{ label: "API reference", href: "/docs/api" }],
  },
};
export const researchPaths = [
  "research/provenance",
  "research/provider-boundaries",
  "research/execution-traces",
];
export const docPaths = Object.keys(pages).filter((k) => k.startsWith("docs/"));
