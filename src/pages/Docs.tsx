import { motion } from "framer-motion";
import {
  Book,
  Boxes,
  Code,
  Cpu,
  FileCheck2,
  GitBranch,
  LockKeyhole,
  Network,
  ServerCog,
  ShieldCheck,
  Terminal,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

/** Inline "read the paper" cross-link from Docs into the research archive. */
function PaperLink({ to, children }: { to: string; children: string }) {
  return (
    <Link
      to={to}
      className="mt-5 inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
    >
      {children}
      <ArrowRight className="h-3 w-3" />
    </Link>
  );
}

const docSections = [
  {
    title: "Traceable Retrieval",
    description:
      "Index records with source metadata, confidence signals, and weighted backtrace paths so every claim has provenance and a rollback point.",
    icon: <GitBranch className="w-8 h-8 text-primary mb-2" />,
  },
  {
    title: "Agent Policy Gates",
    description:
      "Bind tools to explicit permissions, approval thresholds, and review roles before execution reaches production data.",
    icon: <ShieldCheck className="w-8 h-8 text-primary mb-2" />,
  },
  {
    title: "Evaluation Mesh",
    description:
      "Run regression suites for retrieval faithfulness, prompt-injection resilience, latency, and operator review burden as a release gate.",
    icon: <FileCheck2 className="w-8 h-8 text-primary mb-2" />,
  },
  {
    title: "Private Runtime",
    description:
      "Package orchestration, retrieval, audit logs, and controls for cloud, VPC, on-premise, and offline-first deployments.",
    icon: <Code className="w-8 h-8 text-primary mb-2" />,
  },
];

const personas = [
  {
    name: "Aviva",
    role: "Expert",
    accent: "#d946ef",
    description:
      "Direct, creative, and exploratory. Generates plans and alternative approaches for idea generation.",
  },
  {
    name: "Abbey",
    role: "Polymath",
    accent: "#38bdf8",
    description:
      "Analytical and supportive. Handles structured explanation and safety-oriented review of proposed work.",
  },
  {
    name: "Abi",
    role: "Moderator",
    accent: "#818cf8",
    description:
      "Concise and action-oriented. Context- and policy-aware routing and execution once a plan clears review.",
  },
];

const mcpTools = [
  { name: "ai_complete", purpose: "Run a single completion through the selected persona profile." },
  { name: "ai_run", purpose: "Execute an agent workflow with routing, retrieval, and tool calls." },
  { name: "ai_train", purpose: "Update routing weights for a persona profile or all profiles." },
  { name: "wdbx_query", purpose: "Vector / block retrieval against the WDBX store with ordered results." },
  { name: "wdbx_stats", purpose: "Report store size, index health, and snapshot metadata." },
  { name: "gpu_status", purpose: "Report GPU capability and backend, with deterministic CPU fallback." },
  { name: "scheduler_stats", purpose: "Surface scheduler throughput and queue depth." },
  { name: "connector_test", purpose: "Validate a connector's credentials and payload shape before live dispatch." },
  { name: "plugin_list", purpose: "Enumerate registered plugins and their target features." },
  { name: "plugin_run", purpose: "Invoke a registered plugin entry point." },
];

const apiRoutes = [
  { method: "GET", path: "/api/auth/me", purpose: "Returns the public session user without exposing WorkOS tokens." },
  { method: "GET", path: "/api/auth/verify-user", purpose: "Confirms the active session maps to a real WorkOS user." },
  { method: "GET", path: "/api/llm/status", purpose: "Reports protected LLM provider configuration for the signed-in user." },
  { method: "POST", path: "/api/llm/chat", purpose: "Runs server-side LLM requests behind the WorkOS session cookie." },
  { method: "GET", path: "/api/billing/plans", purpose: "Lists available subscription plans for the console." },
  { method: "POST", path: "/api/billing/checkout", purpose: "Creates or redirects to subscription checkout when billing is configured." },
  { method: "PATCH", path: "/api/profile", purpose: "Updates the authenticated user's profile fields." },
  { method: "POST", path: "/api/inquiries", purpose: "Stores a public, rate-limited sales inquiry." },
];

const deploymentChecklist = [
  "Set WorkOS credentials and configure the AuthKit redirect URI.",
  "Enable MFA and passkeys in the WorkOS dashboard for the production environment.",
  "Set server-only LLM provider keys; never expose them to browser bundles.",
  "Configure billing links or replace the billing scaffold with Stripe Checkout sessions.",
  "Run evaluation gates before allowing autonomous write actions or external tool calls.",
];

// Single source of truth for the docs section nav — drives both the desktop
// sidebar and the mobile section bar. Every anchor maps to a real section id.
const docNav = [
  {
    group: "Getting Started",
    items: [
      { id: "intro", label: "Introduction" },
      { id: "runtime", label: "ABI Runtime" },
      { id: "deployment", label: "Deployment" },
    ],
  },
  {
    group: "Platform",
    items: [
      { id: "mcp", label: "MCP Server" },
      { id: "wdbx", label: "WDBX Retrieval" },
      { id: "personas", label: "Persona Routing" },
    ],
  },
  {
    group: "Console",
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
                className="inline-flex whitespace-nowrap rounded-full border border-white/10 px-3.5 py-1.5 text-xs font-medium text-text-dim transition-colors hover:border-indigo-500/30 hover:text-indigo-400"
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div id="intro" className="label-chip mb-6">
              <Book className="w-4 h-4" /> Documentation v2.1
            </div>
            <h1 className="section-title">MLAI Developer Platform</h1>
            <p className="section-subtitle">
              Build private, traceable AI workflows on the ABI runtime: retrieval
              provenance through WDBX, policy-gated agents, evaluation suites, and
              operator-ready audit trails — exposed over a local CLI and an MCP server.
            </p>

            <div className="grid sm:grid-cols-2 gap-6 mb-12">
              {docSections.map((section) => (
                <div key={section.title} className="glass-card group flex flex-col justify-between">
                  <div>
                    <div className="mb-4 text-primary">{section.icon}</div>
                    <h3 className="text-lg font-bold text-white mb-2">{section.title}</h3>
                    <p className="text-sm text-text-dim leading-relaxed">{section.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ABI Runtime */}
            <section id="runtime" className="mt-16">
              <div className="mb-6 flex items-center gap-3">
                <Terminal className="h-5 w-5 text-indigo-400" />
                <h2 className="text-2xl font-bold text-white">ABI Runtime</h2>
              </div>
              <p className="text-sm text-text-dim leading-relaxed mb-6 max-w-2xl">
                ABI is a Zig 0.17 framework for local AI orchestration, semantic vector
                storage, and GPU capability reporting. Build the CLI and MCP server from a
                pinned toolchain; on macOS use the <code className="text-indigo-300">./build.sh</code> wrapper.
              </p>
              <div className="bg-[#0D1117] rounded-lg p-4 border border-white/10 mb-8 font-mono text-sm overflow-x-auto">
                <div className="flex gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <code className="text-gray-500"># Primary validation gate (build, tests, lint, mod/stub parity)</code><br />
                <code className="text-indigo-400">./build.sh</code> <code className="text-white">check</code><br />
                <code className="text-gray-500"># Build the CLI and MCP server binaries</code><br />
                <code className="text-indigo-400">./build.sh</code> <code className="text-white">cli</code>{"   "}<code className="text-gray-500"># → zig-out/bin/abi</code><br />
                <code className="text-indigo-400">./build.sh</code> <code className="text-white">mcp</code>{"   "}<code className="text-gray-500"># → zig-out/bin/abi-mcp</code><br />
                <br />
                <code className="text-gray-500"># Run a completion, plan an agent, open the dashboard TUI</code><br />
                <code className="text-indigo-400">abi</code> <code className="text-white">complete "summarize the incident trace"</code><br />
                <code className="text-indigo-400">abi</code> <code className="text-white">agent plan</code><br />
                <code className="text-indigo-400">abi</code> <code className="text-white">agent os execute --confirm</code>
              </div>
              <p className="text-xs text-text-dim/70 leading-relaxed max-w-2xl">
                Top-level commands: <span className="text-text-dim">help, complete, train, agent, backends, plugin, auth, twilio, tui, dashboard.</span> Feature
                modules are selected at build time via <code className="text-indigo-300">-Dfeat-*</code> flags
                (ai, wdbx, gpu, accelerator, shader, mlir, os-control, tui, hash enabled by default).
              </p>
            </section>

            {/* MCP Server */}
            <section id="mcp" className="mt-16">
              <div className="mb-6 flex items-center gap-3">
                <Network className="h-5 w-5 text-sky-400" />
                <h2 className="text-2xl font-bold text-white">MCP Server</h2>
              </div>
              <p className="text-sm text-text-dim leading-relaxed mb-6 max-w-2xl">
                The <code className="text-indigo-300">abi-mcp</code> server speaks JSON-RPC 2.0 over stdio
                (64&nbsp;KB request cap) and an optional HTTP transport on{" "}
                <code className="text-indigo-300">127.0.0.1:8080</code> — configurable with{" "}
                <code className="text-indigo-300">ABI_MCP_HTTP_PORT</code>, exposing{" "}
                <code className="text-indigo-300">GET /sse</code> and{" "}
                <code className="text-indigo-300">POST /message</code>.
              </p>
              <div className="glass-card p-0 overflow-hidden">
                {mcpTools.map((tool) => (
                  <div
                    key={tool.name}
                    className="grid gap-4 border-b border-white/5 p-4 last:border-b-0 md:grid-cols-[12rem_1fr] hover:bg-white/[0.01] transition-colors"
                  >
                    <div className="font-mono text-xs font-bold text-sky-400">{tool.name}</div>
                    <p className="text-sm leading-relaxed text-text-dim">{tool.purpose}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* WDBX */}
            <section id="wdbx" className="mt-16">
              <div className="mb-6 flex items-center gap-3">
                <Boxes className="h-5 w-5 text-indigo-400" />
                <h2 className="text-2xl font-bold text-white">WDBX Retrieval</h2>
              </div>
              <p className="text-sm text-text-dim leading-relaxed mb-6 max-w-2xl">
                WDBX is the Weighted Directed Backtrace eXecution store. It keeps context as
                weighted paths so retrieval can be inspected, not just ranked. The store exposes
                key-value, vector (cosine search with a SIMD path), and block/spatial surfaces,
                with JSONL snapshot persistence guarded by SHA-256 integrity checks. Disabled
                builds fail closed with explicit errors rather than degrading silently.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { icon: <GitBranch className="h-4 w-4 text-indigo-400" />, label: "Weighted backtrace paths", text: "Inspect which sources were used and where confidence dropped." },
                  { icon: <Cpu className="h-4 w-4 text-indigo-400" />, label: "SIMD vector search", text: "Cosine nearest-neighbor with an HNSW-style index and CPU fallback." },
                  { icon: <ServerCog className="h-4 w-4 text-indigo-400" />, label: "Durable snapshots", text: "JSONL serialize/restore with integrity checks and tamper rejection." },
                  { icon: <ShieldCheck className="h-4 w-4 text-indigo-400" />, label: "Opt-in persistence", text: "Completions persist only when store_result is set on the request." },
                ].map((item) => (
                  <div key={item.label} className="glass-card p-5">
                    <div className="mb-2 flex items-center gap-2">{item.icon}<span className="text-sm font-bold text-white">{item.label}</span></div>
                    <p className="text-sm leading-relaxed text-text-dim">{item.text}</p>
                  </div>
                ))}
              </div>
              <PaperLink to="/research/wdbx-weighted-backtrace-memory-store">
                Read the paper: WDBX weighted-backtrace store
              </PaperLink>
            </section>

            {/* Personas */}
            <section id="personas" className="mt-16">
              <div className="mb-6 flex items-center gap-3">
                <Boxes className="h-5 w-5 text-sky-400" />
                <h2 className="text-2xl font-bold text-white">Persona Routing</h2>
              </div>
              <p className="text-sm text-text-dim leading-relaxed mb-6 max-w-2xl">
                Instead of one agent that plans, reviews, and executes, the Abbey–Aviva–Abi
                framework separates those roles. Routing between profiles is deterministic and
                weight-based — an inspectable trace event, not a hidden model call.
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                {personas.map((p) => (
                  <div key={p.name} className="glass-card p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.accent }} aria-hidden="true" />
                      <span className="text-base font-bold text-white">{p.name}</span>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-text-dim/60">{p.role}</span>
                    </div>
                    <p className="text-sm leading-relaxed text-text-dim">{p.description}</p>
                  </div>
                ))}
              </div>
              <PaperLink to="/research/policy-locked-tool-use-multi-agent">
                Read the paper: policy-locked tool use
              </PaperLink>
            </section>

            {/* Protected API */}
            <section id="api" className="mt-16">
              <div className="mb-6 flex items-center gap-3">
                <LockKeyhole className="h-5 w-5 text-indigo-400" />
                <h2 className="text-2xl font-bold text-white">Protected Console API</h2>
              </div>
              <p className="text-sm text-text-dim leading-relaxed mb-6 max-w-2xl">
                The MLAI console is served behind a WorkOS AuthKit session (an encrypted{" "}
                <code className="text-indigo-300">mlai_session</code> cookie). Protected routes
                require a valid session; inquiry submission is public and rate-limited.
              </p>
              <div className="glass-card p-0 overflow-hidden">
                {apiRoutes.map((route) => (
                  <div
                    key={route.path}
                    className="grid gap-4 border-b border-white/5 p-5 last:border-b-0 md:grid-cols-[14rem_1fr] hover:bg-white/[0.01] transition-colors"
                  >
                    <div className="font-mono text-xs font-bold text-indigo-400">{route.method} {route.path}</div>
                    <p className="text-sm leading-relaxed text-text-dim">{route.purpose}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Deployment */}
            <section id="deployment" className="mt-16">
              <div className="mb-6 flex items-center gap-3">
                <ServerCog className="h-5 w-5 text-sky-400" />
                <h2 className="text-2xl font-bold text-white">Deployment Checklist</h2>
              </div>
              <div className="grid gap-4">
                {deploymentChecklist.map((item, index) => (
                  <div key={item} className="glass-card flex gap-5 p-5 items-center">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 font-mono text-xs font-bold text-indigo-400 ring-1 ring-indigo-500/20">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-relaxed text-text-dim">{item}</p>
                  </div>
                ))}
              </div>
            </section>
          </motion.div>
        </div>
        </main>
      </div>
    </div>
  );
}
