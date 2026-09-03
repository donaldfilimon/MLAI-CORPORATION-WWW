import type { ReactNode } from "react";
import { m } from "framer-motion";
import {
  Book,
  Boxes,
  LockKeyhole,
  Network,
  ServerCog,
  Shield,
  Terminal,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import {
  Callout,
  CardPanel,
  DeepDive,
  Eyebrow,
  FeatureCard,
  Glossary,
  PullQuote,
  SpecList,
  StepList,
} from "@/components/site";

/** Inline "read the paper" cross-link from Docs into the research archive. */
function PaperLink({ to, children }: { to: string; children: string }) {
  return (
    <Link
      to={to}
      className="mt-8 inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-cyan-400 hover:text-cyan-300 transition-colors"
    >
      {children}
      <ArrowRight className="h-3 w-3" />
    </Link>
  );
}

/**
 * One documentation band inside the sidebar column.
 *
 * Deliberately *not* `<Section>` from `@/components/site`: that component
 * composes `.container-custom`, which re-applies the page gutter (up to
 * `lg:px-12`) and would inset every section heading relative to the `h1` in
 * this already-columned layout. The header composition — `Eyebrow` kicker
 * (the section's nav group), icon, `h2` — is the part worth sharing, and the
 * section `id` stays exactly where the in-page anchors expect it.
 */
function DocSection({
  id,
  group,
  icon,
  title,
  lead,
  children,
}: {
  id: string;
  group: string;
  icon: ReactNode;
  title: string;
  lead?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="mt-16 scroll-mt-28">
      <header className="mb-6">
        <Eyebrow>{group}</Eyebrow>
        <div className="mt-2.5 flex items-center gap-3">
          {icon}
          <h2 id={`${id}-title`} className="font-display text-2xl font-bold text-white">
            {title}
          </h2>
        </div>
      </header>
      {lead && <p className="mb-6 max-w-2xl text-sm leading-relaxed text-text-dim">{lead}</p>}
      {children}
    </section>
  );
}

/** Sub-heading inside a documentation band. */
function DocSubhead({ children }: { children: ReactNode }) {
  return <h3 className="font-display text-lg font-semibold text-white">{children}</h3>;
}

const capabilities = [
  {
    title: "Traceable Retrieval",
    desc: "Index records with source metadata, confidence signals, and weighted backtrace paths so every claim has provenance and a rollback point.",
  },
  {
    title: "Agent Policy Gates",
    desc: "Bind tools to explicit permissions, approval thresholds, and review roles before execution reaches production data.",
  },
  {
    title: "Evaluation Mesh",
    desc: "Run regression suites for retrieval faithfulness, prompt-injection resilience, latency, and operator review burden as a release gate.",
  },
  {
    title: "Private Runtime",
    desc: "Package orchestration, retrieval, audit logs, and controls for cloud, VPC, on-premise, and offline-first deployments.",
  },
];

/** Build-time configuration facts for the runtime — no measurements here. */
const runtimeSpec = [
  {
    k: "Top-level commands",
    v: "help, complete, train, agent, backends, plugin, auth, twilio, tui, dashboard",
  },
  { k: "Build-time feature selection", v: "-Dfeat-*" },
  {
    k: "Enabled by default",
    v: "ai, wdbx, gpu, accelerator, shader, mlir, os-control, tui, hash",
  },
];

const moduleMap = [
  { term: "database/", def: "WDBX vector/block memory, indexes, persistence, and query-path primitives" },
  { term: "mcp/", def: "Tool-facing ABI surfaces for agent workflows" },
  { term: "ai/agents/", def: "Abbey · Aviva · Abi persona vocabulary and routing contracts" },
  { term: "ai/llm/", def: "Provider adapters and local inference integration points" },
  { term: "runtime/", def: "Schedulers, allocators, telemetry, and execution primitives" },
  { term: "shared/", def: "Shared contracts, types, and cross-module utilities" },
];

const designDecisions = [
  {
    title: "SIMD-native vector math",
    body: "@Vector builtins compile distance kernels to the target ISA (AVX-512 on x86, NEON on Apple Silicon) from one source.",
  },
  {
    title: "One build, every platform",
    body: "zig build cross-compiles static binaries for macOS arm64/x86_64, Linux, and Windows. No container, no runtime, no GC pauses.",
  },
  {
    title: "TLS at the edge",
    body: "Zig's std TLS server is still pending upstream (ziglang #14171), so deployments terminate TLS at a reverse proxy by design rather than shipping an unvetted stack.",
  },
];

/** Transport configuration for `abi-mcp`. */
const mcpSpec = [
  { k: "Transport", v: "JSON-RPC 2.0 over stdio" },
  { k: "Request cap", v: "64 KB" },
  { k: "Optional HTTP transport", v: "127.0.0.1:8080" },
  { k: "Port override", v: "ABI_MCP_HTTP_PORT" },
  { k: "SSE stream", v: "GET /sse" },
  { k: "Message endpoint", v: "POST /message" },
];

const mcpTools = [
  { term: "ai_complete", def: "Run a single completion through the selected persona profile." },
  { term: "ai_run", def: "Execute an agent workflow with routing, retrieval, and tool calls." },
  { term: "ai_train", def: "Update routing weights for a persona profile or all profiles." },
  { term: "wdbx_query", def: "Vector / block retrieval against the WDBX store with ordered results." },
  { term: "wdbx_stats", def: "Report store size, index health, and snapshot metadata." },
  { term: "gpu_status", def: "Report GPU capability and backend, with deterministic CPU fallback." },
  { term: "scheduler_stats", def: "Surface scheduler throughput and queue depth." },
  { term: "connector_test", def: "Validate a connector's credentials and payload shape before live dispatch." },
  { term: "plugin_list", def: "Enumerate registered plugins and their target features." },
  { term: "plugin_run", def: "Invoke a registered plugin entry point." },
];

const wdbxCapabilities = [
  {
    title: "Weighted backtrace paths",
    desc: "Inspect which sources were used and where confidence dropped.",
  },
  {
    title: "SIMD vector search",
    desc: "Cosine nearest-neighbor through the active Rust substrate's layered HNSW index (M=16, EF_CONSTRUCTION=40, EF_SEARCH=32).",
  },
  {
    title: "Durable snapshots",
    desc: "JSONL serialize/restore with integrity checks and tamper rejection.",
  },
  {
    title: "Opt-in persistence",
    desc: "Completions persist only when store_result is set on the request.",
  },
];

const wdbxV2Docs = [
  { file: "getting-started.md", label: "Getting Started", text: "Install, first run, and the snapshot workflow." },
  { file: "architecture.md", label: "Architecture", text: "Personas, pipeline shape, and main modules." },
  { file: "persistence.md", label: "Persistence", text: "Snapshots and SHA-256-linked block-chain memory." },
  { file: "acceleration.md", label: "Acceleration", text: "CPU kernels today; WGSL/WebGPU scaffolding labeled as such." },
  { file: "api.md", label: "HTTP API", text: "Historical status and dashboard routes from the frozen Zig-era snapshot." },
  { file: "cli.md", label: "CLI & TUI", text: "Commands, chat interface, and teaching flow." },
  { file: "protocols.md", label: "Protocols", text: "MCP / LSP / ACP JSON-RPC surfaces." },
  { file: "limitations.md", label: "Limitations", text: "What V2 explicitly does not claim." },
  { file: "index.md", label: "Index", text: "The full documentation map." },
];

const personas = [
  {
    name: "Aviva",
    role: "Direct Expert",
    accent: "#a855f7",
    description:
      "Direct, creative, and exploratory. Generates plans, analysis, and alternative approaches — the framework's research and planning voice. Proposes; never executes on its own.",
  },
  {
    name: "Abbey",
    role: "Empathetic Polymath",
    accent: "#34d399",
    description:
      "Intelligence Without Limits, gated by a claims ledger. Warm, precise, and never condescending — Abbey pairs technical range with emotional intelligence, explains the why, and says \"I'm not sure\" instead of bluffing. She will not claim AGI, live markets as advice, or Quesar as a bot feature.",
  },
  {
    name: "Abi",
    role: "Adaptive Moderator",
    accent: "#22d3ee",
    description:
      "Concise and policy-aware. Mediates, routes, and executes — but only once a plan clears review. The governance layer of the framework.",
  },
];

const routingSignals = [
  {
    title: "Technical execution",
    body: "Cues like debug, fix, error, build, compile, code, and test steer toward Aviva.",
  },
  {
    title: "Directness",
    body: "Cues like urgent, quick, concise, direct, or fast raise her weight further.",
  },
  {
    title: "Policy overrides win",
    body: "When the control plane flags risk, weight shifts hard toward Abi, and a disallowed action routes to Abi outright regardless of the keyword signals.",
  },
];

const abbeyPrinciples = [
  {
    title: "Care first",
    body: "Read the person's goal and state before reaching for the answer; meet them where they are, never condescending.",
  },
  {
    title: "Clarity always",
    body: "Explain the why, not just the what; teach rather than dictate, and keep jargon in service of understanding.",
  },
  {
    title: "Competence throughout",
    body: "Broad technical range, paired with the honesty to name uncertainty and defer to review instead of bluffing.",
  },
];

const apiRoutes = [
  { term: "GET /api/auth/me", def: "Returns the public session user without exposing WorkOS tokens." },
  { term: "GET /api/auth/verify-user", def: "Confirms the active session maps to a real WorkOS user." },
  { term: "GET /api/llm/status", def: "Revalidates invited WorkOS organization access and reports the fixed Gemini/gateway boundary." },
  { term: "POST /api/llm/chat", def: "Requires active organization membership and explicit consent, then returns only after the encrypted audit is durable." },
  { term: "GET/POST/DELETE /api/consent", def: "Reads, accepts, or withdraws the versioned one-year conversation-audit policy." },
  { term: "GET /api/audits", def: "Lists the signed-in user's encrypted conversation records." },
  { term: "GET/DELETE /api/audits/:id", def: "Reads, exports, or deletes one user-owned live audit; backup copies age out under retention." },
  { term: "GET /api/billing/plans", def: "Lists available subscription plans for the console." },
  { term: "POST /api/billing/checkout", def: "Creates or redirects to subscription checkout when billing is configured." },
  { term: "PATCH /api/profile", def: "Updates the authenticated user's profile fields." },
  { term: "POST /api/inquiries", def: "Stores a public, rate-limited inquiry only after exact-action/hostname Turnstile verification." },
];

const deploymentSteps = [
  {
    title: "WorkOS credentials",
    body: "Set WorkOS credentials and configure the AuthKit redirect URI.",
  },
  {
    title: "MFA and passkeys",
    body: "Enable MFA and passkeys in the WorkOS dashboard for the production environment.",
  },
  {
    title: "Server-only provider keys",
    body: "Set server-only LLM provider keys; never expose them to browser bundles.",
  },
  {
    title: "Billing",
    body: "Configure billing links or replace the billing scaffold with Stripe Checkout sessions.",
  },
  {
    title: "Evaluation gates",
    body: "Run evaluation gates before allowing autonomous write actions or external tool calls.",
  },
];

// Single source of truth for the docs section nav — drives both the desktop
// sidebar and the mobile section bar. Every anchor maps to a real section id,
// and each group name is reused as that section's Eyebrow kicker.
const docNav = [
  {
    group: "Start",
    items: [
      { id: "intro", label: "Introduction" },
      { id: "runtime", label: "ABI Runtime" },
    ],
  },
  {
    group: "Security & trust",
    items: [{ id: "trust", label: "Security & trust" }],
  },
  {
    group: "Architecture",
    items: [
      { id: "personas", label: "Persona Routing" },
      { id: "wdbx", label: "WDBX Retrieval" },
      { id: "wdbx-v2", label: "WDBX V2 Docs" },
      { id: "mcp", label: "MCP Server" },
    ],
  },
  {
    group: "Operations",
    items: [{ id: "deployment", label: "Deployment" }],
  },
  {
    group: "Reference",
    items: [{ id: "api", label: "Protected API" }],
  },
];

export function Docs() {
  return (
    <div className="container-custom pt-32 pb-20 min-h-screen">
      {/* Mobile section nav — the desktop sidebar is hidden < md, so small
          screens get a horizontally scrollable bar of section anchors. */}
      <nav
        className="md:hidden mb-8 -mx-5 overflow-x-auto px-5"
        aria-label="Documentation sections"
      >
        <ul className="flex w-max gap-2">
          {docNav.flatMap((g) => g.items).map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="inline-flex whitespace-nowrap rounded-full border border-white/10 px-3.5 py-1.5 text-xs font-medium text-text-dim transition-colors hover:border-cyan-500/30 hover:text-cyan-400"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex overflow-hidden">
        {/* Sidebar (desktop) */}
        <aside className="w-64 pr-8 hidden md:block">
          <nav className="space-y-6 sticky top-32" aria-label="Documentation">
            {docNav.map((g) => (
              <div key={g.group}>
                <h3 className="font-semibold text-white mb-3">{g.group}</h3>
                <ul className="space-y-2 text-text-dim text-sm">
                  {g.items.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 max-w-4xl pl-0 md:pl-12 flex">
        <Separator orientation="vertical" className="hidden md:block mr-8 h-auto bg-white/10" />
        <div className="flex-1">
          <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div id="intro" className="label-chip mb-6">
              <Book className="w-4 h-4" /> Documentation v2.1
            </div>
            <h1 className="section-title">MLAI Developer Platform</h1>
            <p className="section-subtitle">
              Build private, traceable AI workflows on the ABI runtime: retrieval
              provenance through WDBX, policy-gated agents, evaluation suites, and
              operator-ready audit trails — exposed over a local CLI and an MCP server.
            </p>

            <div className="grid gap-5 sm:grid-cols-2">
              {capabilities.map((c) => (
                <FeatureCard key={c.title} title={c.title} desc={c.desc} />
              ))}
            </div>

            {/* ABI Runtime */}
            <DocSection
              id="runtime"
              group="Start"
              icon={<Terminal className="h-5 w-5 text-cyan-400" />}
              title="ABI Runtime"
              lead={
                <>
                  ABI is a Zig 0.17 framework for local AI orchestration, semantic vector
                  storage, and GPU capability reporting. Build the CLI and MCP server from a
                  pinned toolchain; on macOS use the{" "}
                  <code className="text-cyan-300">./build.sh</code> wrapper.
                </>
              }
            >
              <div className="bg-[#0D1117] rounded-lg p-4 border border-white/10 font-mono text-sm overflow-x-auto">
                <div className="flex gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <code className="text-gray-500"># Primary validation gate (build, tests, lint, mod/stub parity)</code><br />
                <code className="text-cyan-400">./build.sh</code> <code className="text-white">check</code><br />
                <code className="text-gray-500"># Build the CLI and MCP server binaries</code><br />
                <code className="text-cyan-400">./build.sh</code> <code className="text-white">cli</code>{"   "}<code className="text-gray-500"># → zig-out/bin/abi</code><br />
                <code className="text-cyan-400">./build.sh</code> <code className="text-white">mcp</code>{"   "}<code className="text-gray-500"># → zig-out/bin/abi-mcp</code><br />
                <br />
                <code className="text-gray-500"># Run a completion, plan an agent, open the dashboard TUI</code><br />
                <code className="text-cyan-400">abi</code> <code className="text-white">complete "summarize the incident trace"</code><br />
                <code className="text-cyan-400">abi</code> <code className="text-white">agent plan</code><br />
                <code className="text-cyan-400">abi</code> <code className="text-white">agent os execute --confirm</code>
              </div>

              {/* Stacked, not a 2-up grid: `Glossary`'s term track is capped at
                  10rem, so inside a half-width card the definitions get ~150px
                  and every module wraps to four lines. Full width keeps them
                  one line each. */}
              <div className="mt-8 space-y-5">
                <CardPanel title="Build configuration">
                  <SpecList rows={runtimeSpec} />
                </CardPanel>
                <CardPanel title="Module map">
                  <Glossary items={moduleMap} />
                </CardPanel>
              </div>

              <div className="mt-8">
                <DocSubhead>Design decisions</DocSubhead>
                <DeepDive className="mt-5" cols={3} items={designDecisions} />
              </div>
            </DocSection>

            {/* Security & trust */}
            <DocSection
              id="trust"
              group="Security & trust"
              icon={<Shield className="h-5 w-5 text-cyan-400" />}
              title="Security & trust"
              lead={
                <>
                  Trust on this surface is a boundary and a claims discipline: what is
                  authenticated, what is rate-limited, and what fails closed. Session
                  access uses WorkOS AuthKit; public inquiry submission is rate-limited;
                  evaluation gates sit in front of autonomous write or external tool
                  paths; WDBX builds that are disabled fail closed with explicit errors.
                  Product-facing security detail lives on the dedicated page.
                </>
              }
            >
              <Callout label="Boundary">
                Prefer the security page for org gate, gateway, consent, and retention
                wording — this hub only points at the same boundary without restating
                marketing claims.
              </Callout>
              <Link
                to="/security"
                className="mt-8 inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Review the trust boundary
                <ArrowRight className="h-3 w-3" />
              </Link>
            </DocSection>

            {/* Personas */}
            <DocSection
              id="personas"
              group="Architecture"
              icon={<Boxes className="h-5 w-5 text-sky-400" />}
              title="Persona Routing"
              lead="The Abbey–Aviva–Abi framework answers one question: how do you get advanced capability without giving up governance? Instead of one agent that plans, reviews, and executes, it separates those roles across three persona profiles. Routing between them is deterministic and weight-based — an inspectable trace event, not a hidden model call."
            >
              {/* Persona dot colors are the fixed *persona* axis (Abbey emerald,
                  Aviva violet, Abi cyan) — deliberately not the product accent
                  axis in `site/accent.ts`, where "abi" is violet. */}
              <div className="grid gap-5 sm:grid-cols-3">
                {personas.map((p) => (
                  <CardPanel key={p.name} gap="sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.accent }} aria-hidden="true" />
                      <span className="text-base font-bold text-white">{p.name}</span>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-text-dim/60">{p.role}</span>
                    </div>
                    <p className="text-sm leading-relaxed text-text-dim">{p.description}</p>
                  </CardPanel>
                ))}
              </div>

              <div className="mt-10">
                <DocSubhead>How a profile is selected</DocSubhead>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text-dim">
                  Routing starts from a baseline weight per profile, then adjusts
                  it from inspectable input signals. The adjusted weights are
                  normalized to a distribution; the largest becomes primary and
                  its share is the routing confidence (which in turn picks a
                  single, parallel, or consensus strategy). Take{" "}
                  <span className="text-violet-300">Aviva</span>, the direct
                  expert — she gains weight when the request reads as hands-on or
                  time-pressed:
                </p>
                <DeepDive className="mt-6" cols={3} items={routingSignals} />
                <Callout className="mt-6" label="Authority boundary">
                  Aviva plans and proposes; she holds no autonomous write or
                  execute authority — that boundary belongs to Abi, and only on
                  plans that have cleared review.
                </Callout>
              </div>

              <div className="mt-10">
                <DocSubhead>Abbey&apos;s voice</DocSubhead>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text-dim">
                  Abbey is the profile you hear most in explanation and review, so her
                  voice sets the tone for the whole framework. It follows one principle
                  set, summed up by the motto the system is built around:
                </p>
                <PullQuote accent="abbey">
                  &ldquo;Care first. Clarity always. Competence throughout.&rdquo;
                </PullQuote>
                <DeepDive cols={3} accent="abbey" items={abbeyPrinciples} />
              </div>

              <PaperLink to="/research/policy-locked-tool-use-multi-agent">
                Read the paper: policy-locked tool use
              </PaperLink>
            </DocSection>

            {/* WDBX */}
            <DocSection
              id="wdbx"
              group="Architecture"
              icon={<Boxes className="h-5 w-5 text-cyan-400" />}
              title="WDBX Retrieval"
              lead={
                <>
                  WDBX is the Weighted Directed Backtrace eXecution store. It keeps context as
                  weighted paths so retrieval can be inspected, not just ranked. The store exposes
                  key-value, vector (cosine search with a SIMD path), and block/spatial surfaces,
                  with JSONL snapshot persistence guarded by SHA-256 integrity checks.
                </>
              }
            >
              <div className="grid gap-5 sm:grid-cols-2">
                {wdbxCapabilities.map((c) => (
                  <FeatureCard key={c.title} title={c.title} desc={c.desc} accent="wdbx" />
                ))}
              </div>
              <Callout className="mt-6" label="Fail closed">
                Disabled builds fail closed with explicit errors rather than degrading silently.
              </Callout>
              <PaperLink to="/research/wdbx-weighted-backtrace-memory-store">
                Read the paper: WDBX weighted-backtrace store
              </PaperLink>
            </DocSection>

            {/* WDBX V2 documentation set */}
            <DocSection
              id="wdbx-v2"
              group="Architecture"
              icon={<Boxes className="h-5 w-5 text-sky-400" />}
              title="WDBX V2 Documentation"
              lead="The V2 release of the Abbey/WDBX runtime ships an observable pipeline: block-chain memory with temporal queries, multimodal input fusion, an async neural path, and research-alignment telemetry scored on every turn. The complete Markdown documentation set is mirrored here from the wdbx repository — including its limitations page, which states plainly what is scaffolding versus shipped."
            >
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {wdbxV2Docs.map((doc) => (
                  <a
                    key={doc.file}
                    href={`/docs/wdbx/${doc.file}`}
                    download
                    className="glass-card group p-4"
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-bold text-white">{doc.label}</span>
                      <span className="font-mono text-[10px] text-text-dim/60 group-hover:text-sky-400">.md ↓</span>
                    </div>
                    <p className="text-xs leading-relaxed text-text-dim">{doc.text}</p>
                  </a>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="/research/wdbx-weighted-backtrace-memory-store.pdf" download className="glass-card inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white">
                  WDBX store paper (PDF) <span className="font-mono text-[10px] text-text-dim/60">↓</span>
                </a>
                <a href="/research/multi-persona-routing-policy-weights.pdf" download className="glass-card inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white">
                  Persona routing paper (PDF) <span className="font-mono text-[10px] text-text-dim/60">↓</span>
                </a>
              </div>
              <PaperLink to="/blog/wdbx-v2-release">
                Read the release note: WDBX V2
              </PaperLink>
            </DocSection>

            {/* MCP Server */}
            <DocSection
              id="mcp"
              group="Architecture"
              icon={<Network className="h-5 w-5 text-sky-400" />}
              title="MCP Server"
              lead={
                <>
                  The <code className="text-cyan-300">abi-mcp</code> server speaks JSON-RPC 2.0
                  over stdio, with an optional local HTTP transport.
                </>
              }
            >
              <SpecList rows={mcpSpec} />
              <div className="mt-8">
                <DocSubhead>Tools</DocSubhead>
                <Glossary className="mt-5" items={mcpTools} />
              </div>
            </DocSection>

            {/* Deployment */}
            <DocSection
              id="deployment"
              group="Operations"
              icon={<ServerCog className="h-5 w-5 text-sky-400" />}
              title="Deployment Checklist"
            >
              <StepList steps={deploymentSteps} />
            </DocSection>

            {/* Protected API */}
            <DocSection
              id="api"
              group="Reference"
              icon={<LockKeyhole className="h-5 w-5 text-cyan-400" />}
              title="Protected Console API"
              lead={
                <>
                  The MLAI console is served behind a WorkOS AuthKit session (an encrypted{" "}
                  <code className="text-cyan-300">mlai_session</code> cookie). Protected routes
                  require a valid session; inquiry submission is public and rate-limited.
                </>
              }
            >
              <Glossary items={apiRoutes} />
            </DocSection>

          </m.div>
        </div>
        </main>
      </div>
    </div>
  );
}
