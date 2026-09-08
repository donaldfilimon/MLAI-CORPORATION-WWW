import type { ReactNode } from "react";
import { research } from "@/data/categories/research";
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
  { k: "Runtime", v: "Rust workspace with linked AI, WDBX, GPU, MCP, and terminal surfaces" },
  { k: "Configuration", v: "Crate-specific Cargo features; no legacy -Dfeat-* switches" },
  { k: "Capability inspection", v: "abi backends; abi wdbx gpu info" },
];
const moduleMap = [
  { term: "abi-ai", def: "Profile routing, completion, and governance helpers" },
  { term: "abi-sea", def: "Evidence selection, scoring, and learning loop" },
  { term: "abi-wdbx", def: "Durable memory and retrieval from the sibling Rust substrate" },
  { term: "abi-gpu", def: "Backend reporting, optional Metal DOT kernels, and CPU fallback" },
  { term: "abi-mcp", def: "JSON-RPC tool handlers and stdio server" },
  { term: "abi-cli", def: "Commands, agent REPL, and diagnostics dashboard" },
];
const designDecisions = [
  { title: "Inspectable capabilities", body: "Report the selected backend and whether acceleration is active. Capability detection alone is not evidence of accelerated execution." },
  { title: "Bounded evidence", body: "SEA selects evidence within record, token, cluster, and prompt-byte budgets. Retrieval is distinct from model training." },
  { title: "Explicit runtime boundaries", body: "Local completion is deterministic persona-template generation. Live HTTP completion requires an explicitly configured provider." },
];

/** Transport configuration for `abi-mcp`. */
const mcpSpec = [
  { k: "Transport", v: "JSON-RPC 2.0 over stdio" },
  { k: "Request cap", v: "64 KB" },
  { k: "Custom loopback HTTP listener", v: "127.0.0.1:8080" },
  { k: "Port override", v: "ABI_MCP_HTTP_PORT" },
  { k: "Discovery only", v: "GET /sse emits one event and closes" },
  { k: "Message endpoint", v: "POST /message" },
];

const mcpTools = [
  { term: "ai_learn", def: "Evidence-augmented completion with bounded evidence selection." },
  { term: "scheduler_info", def: "Compatibility alias for scheduler statistics." },
  { term: "ai_complete", def: "Run a single completion through the selected persona profile." },
  { term: "ai_run", def: "Run completion with local profile routing." },
  { term: "ai_train", def: "Train the selected local profile against WDBX." },
  { term: "wdbx_query", def: "Vector / block retrieval against the WDBX store with ordered results." },
  { term: "wdbx_stats", def: "Report store size, index health, and snapshot metadata." },
  { term: "gpu_status", def: "Report GPU capability and backend, with deterministic CPU fallback." },
  { term: "scheduler_stats", def: "Report scheduler task counts." },
  { term: "connector_test", def: "Run local connector validation; does not prove live credentials work." },
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
      "Intelligence Without Limits, with policy gating: warm, precise, never condescending — Abbey explains the why behind the what, says \"I'm not sure\" instead of bluffing, and will not claim unlimited/AGI capability, unverified benchmarks, or NYX/Quesar as bot features.",
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
  { title: "Explicit address", body: "A leading Abbey, Aviva, or Abi name selects that profile; mentioning a name later in prose does not." },
  { title: "Token-prefix signals", body: "Without an explicit address, keyword stems at the start of whitespace-separated tokens adjust an Abbey-favoring prior." },
  { title: "Normalized selection", body: "The largest normalized weight selects the primary profile. A routing share is not a calibrated confidence in correctness." },
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
                  ABI is a Rust framework for local AI orchestration, semantic vector
                  storage, and GPU capability reporting. Build the CLI and MCP server
                  with the repository&apos;s pinned toolchain and{" "}
                  <code className="text-cyan-300">./tools/cargo.sh</code> wrapper.

                </>
              }
            >
              <div className="bg-[#0D1117] rounded-lg p-4 border border-white/10 font-mono text-sm overflow-x-auto">
                <div className="flex gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <code className="text-gray-500"># Validate the Rust workspace</code><br />
                <code className="text-cyan-400">./tools/check.sh</code><br />
                <code className="text-gray-500"># Build the CLI and MCP server</code><br />
                <code className="text-cyan-400">./tools/cargo.sh</code> <code className="text-white">build -p abi-cli -p abi-mcp</code><br />
                <br />
                <code className="text-gray-500"># Inspect capabilities and terminal surfaces</code><br />
                <code className="text-cyan-400">./target/debug/abi</code> <code className="text-white">backends</code><br />
                <code className="text-cyan-400">./target/debug/abi</code> <code className="text-white">dashboard --pane system --once --json</code><br />
                <code className="text-cyan-400">./target/debug/abi</code> <code className="text-white">agent tui</code>
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
                  paths; persistence and admission errors must remain explicit.
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
              lead="The Abbey–Aviva–Abi framework answers one question: how do you get advanced capability without giving up governance? Instead of one agent that plans, reviews, and executes, it separates those roles across three persona profiles. Routing between them is deterministic and weight-based. Profile selection does not itself grant execution authority."
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
                  An explicit leading persona address takes precedence. Otherwise,
                  token-prefix signals adjust a prior and the runtime normalizes the
                  resulting weights before selecting the largest. The distribution
                  describes routing preference, not model quality, authorization,
                  or a parallel-execution strategy.
                </p>
                <DeepDive className="mt-6" cols={3} items={routingSignals} />
                <Callout className="mt-6" label="Authority boundary">
                  A persona name is not an authorization mechanism. Execution and
                  admission controls enforce their own policy checks independently
                  of the selected profile.
                </Callout>
              </div>

              <div className="mt-10">
                <DocSubhead>Abbey&apos;s voice</DocSubhead>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text-dim">
                  Abbey is the profile you hear most in explanation and review, so her
                  voice sets the tone for the whole framework — Intelligence Without
                  Limits, gated by policy. She says what she knows and what she doesn&apos;t;
                  she will not claim unlimited/AGI capability, unverified benchmarks, or
                  treat NYX/Quesar as bot features. One principle set sums it up:
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
                The Rust workspace links WDBX directly. Storage, authentication, and admission failures must be explicit; legacy disabled-feature flags are not the current runtime boundary.
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
              title="Historical WDBX V2 Documentation"
              lead="This frozen Zig-era documentation mirror is retained for historical reference. It is not the current Rust implementation guide. Use the source-backed WDBX research overview for current availability and limitations; claims in the historical snapshot require revalidation against the Rust substrate."
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
                {research.publications.flatMap(publication => publication.attachments).map(attachment => (
                  <a key={attachment.url} href={attachment.url} download className="glass-card inline-flex flex-col gap-1 px-4 py-3 text-base text-white">
                    <span>{attachment.title} (PDF)</span>
                    <span className="text-sm text-text-dim">{attachment.edition === "historical" ? "Historical edition" : "Current edition"} · {attachment.date}</span>
                  </a>
                ))}
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
                  over stdio. Its custom loopback HTTP compatibility listener is not a persistent conforming MCP HTTP+SSE transport.
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
