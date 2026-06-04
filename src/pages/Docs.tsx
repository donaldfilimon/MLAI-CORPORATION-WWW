import { motion } from "framer-motion";
import {
  Book,
  Code,
  FileCheck2,
  GitBranch,
  LockKeyhole,
  ServerCog,
  ShieldCheck,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const docSections = [
  {
    title: "Traceable Retrieval",
    description:
      "Index documents with source metadata, confidence signals, graph weights, and rollback-friendly provenance.",
    icon: (
      <GitBranch className="w-8 h-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
    ),
  },
  {
    title: "Agent Policy Gates",
    description:
      "Bind tools to explicit permissions, approval thresholds, and review roles before execution reaches production data.",
    icon: (
      <ShieldCheck className="w-8 h-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
    ),
  },
  {
    title: "Evaluation Harness",
    description:
      "Run regression suites for retrieval faithfulness, prompt-injection resilience, latency, and operator review burden.",
    icon: (
      <FileCheck2 className="w-8 h-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
    ),
  },
  {
    title: "Runtime API",
    description:
      "Connect model providers, private indexes, approval flows, and audit events through a thin orchestration boundary.",
    icon: (
      <Code className="w-8 h-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
    ),
  },
];

const apiRoutes = [
  {
    method: "GET",
    path: "/api/auth/me",
    purpose: "Returns the public session user without exposing WorkOS tokens.",
  },
  {
    method: "GET",
    path: "/api/auth/verify-user",
    purpose: "Confirms the active session maps to a real WorkOS user.",
  },
  {
    method: "GET",
    path: "/api/llm/status",
    purpose:
      "Reports protected LLM provider configuration for the signed-in user.",
  },
  {
    method: "POST",
    path: "/api/llm/chat",
    purpose: "Runs server-side LLM requests behind the WorkOS session cookie.",
  },
  {
    method: "POST",
    path: "/api/billing/checkout",
    purpose:
      "Creates or redirects to subscription checkout when billing is configured.",
  },
];

const deploymentChecklist = [
  "Set WorkOS credentials and configure the AuthKit redirect URI.",
  "Enable MFA and passkeys in the WorkOS dashboard for the production environment.",
  "Set server-only LLM provider keys; never expose them to browser bundles.",
  "Configure billing links or replace the billing scaffold with Stripe Checkout sessions.",
  "Run evaluation gates before allowing autonomous write actions or external tool calls.",
];

export function Docs() {
  return (
    <div className="container-custom pt-32 pb-20 min-h-screen flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 pr-8 hidden md:block">
        <nav className="space-y-6 sticky top-32">
          <div>
            <h3 className="font-semibold text-white mb-3">Getting Started</h3>
            <ul className="space-y-2 text-text-dim text-sm">
              <li>
                <a
                  href="#intro"
                  className="hover:text-primary transition-colors"
                >
                  Introduction
                </a>
              </li>
              <li>
                <a
                  href="#quickstart"
                  className="hover:text-primary transition-colors"
                >
                  Quickstart
                </a>
              </li>
              <li>
                <a
                  href="#deployment"
                  className="hover:text-primary transition-colors"
                >
                  Deployment Modes
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Core API</h3>
            <ul className="space-y-2 text-text-dim text-sm">
              <li>
                <a href="#api" className="hover:text-primary transition-colors">
                  Protected API
                </a>
              </li>
              <li>
                <a
                  href="#quickstart"
                  className="hover:text-primary transition-colors"
                >
                  WDBX Retrieval
                </a>
              </li>
              <li>
                <a
                  href="#deployment"
                  className="hover:text-primary transition-colors"
                >
                  Safety Evaluation
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Operations</h3>
            <ul className="space-y-2 text-text-dim text-sm">
              <li>
                <a href="#api" className="hover:text-primary transition-colors">
                  Audit Events
                </a>
              </li>
              <li>
                <a
                  href="#deployment"
                  className="hover:text-primary transition-colors"
                >
                  Human Review
                </a>
              </li>
              <li>
                <a
                  href="#deployment"
                  className="hover:text-primary transition-colors"
                >
                  Incident Runbooks
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl pl-0 md:pl-12 flex">
        <Separator
          orientation="vertical"
          className="hidden md:block mr-8 h-auto bg-white/10"
        />
        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div id="intro" className="label-chip mb-6">
              <Book className="w-4 h-4" /> Documentation v2.0
            </div>
            <h1 className="section-title">MLAI Developer Platform</h1>
            <p className="section-subtitle">
              Build private, traceable AI workflows with retrieval provenance,
              policy-gated tools, evaluation suites, and operator-ready audit
              trails.
            </p>

            <div className="grid sm:grid-cols-2 gap-6 mb-12">
              {docSections.map((section) => (
                <div
                  key={section.title}
                  className="glass-card cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="mb-4 text-primary group-hover:scale-105 transition-transform duration-300">
                      {section.icon}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {section.title}
                    </h3>
                    <p className="text-sm text-text-dim leading-relaxed">
                      {section.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <h2 id="quickstart" className="text-2xl font-bold mb-4 text-white">
              Quickstart
            </h2>
            <div className="bg-[#0D1117] rounded-lg p-4 border border-white/10 mb-8 font-mono text-sm overflow-x-auto">
              <div className="flex gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <code className="text-gray-500">
                # Create a private workflow profile
              </code>
              <br />
              <code className="text-blue-400">mlai</code>{" "}
              <code className="text-white">workflows init --mode private</code>
              <br />
              <code className="text-gray-500">
                # Attach a traceable retrieval index
              </code>
              <br />
              <code className="text-blue-400">mlai</code>{" "}
              <code className="text-white">
                indexes attach ./knowledge --trace wdbx
              </code>
              <br />
              <code className="text-gray-500">
                # Run policy and retrieval evaluations before launch
              </code>
              <br />
              <code className="text-blue-400">mlai</code>{" "}
              <code className="text-white">
                eval run ./evals --gate release
              </code>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {[
                "Define permissions",
                "Capture evidence",
                "Ship behind gates",
              ].map((step, index) => (
                <div key={step} className="glass-card">
                  <div className="mb-3 font-mono text-xs font-bold text-blue-300">
                    0{index + 1}
                  </div>
                  <h3 className="font-bold text-white mb-2">{step}</h3>
                  <p className="text-sm leading-relaxed text-text-dim">
                    Use MLAI docs as implementation checklists, not just API
                    references.
                  </p>
                </div>
              ))}
            </div>

            <section id="api" className="mt-16">
              <div className="mb-6 flex items-center gap-3">
                <LockKeyhole className="h-5 w-5 text-blue-400" />
                <h2 className="text-xl font-bold text-white">
                  Protected API Surface
                </h2>
              </div>
              <div className="glass-card p-0 overflow-hidden">
                {apiRoutes.map((route) => (
                  <div
                    key={route.path}
                    className="grid gap-4 border-b border-white/5 p-5 last:border-b-0 md:grid-cols-[12rem_1fr] hover:bg-white/[0.01] transition-colors"
                  >
                    <div className="font-mono text-xs font-bold text-blue-400">
                      {route.method} {route.path}
                    </div>
                    <p className="text-sm leading-relaxed text-text-dim">
                      {route.purpose}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section id="deployment" className="mt-16">
              <div className="mb-6 flex items-center gap-3">
                <ServerCog className="h-5 w-5 text-cyan-400" />
                <h2 className="text-xl font-bold text-white">
                  Deployment Checklist
                </h2>
              </div>
              <div className="grid gap-4">
                {deploymentChecklist.map((item, index) => (
                  <div
                    key={item}
                    className="glass-card flex gap-5 p-5 items-center"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10 font-mono text-xs font-bold text-blue-400 ring-1 ring-blue-500/20">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-relaxed text-text-dim">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
