import type { ReactNode } from "react";
import { PublicationIndex } from "mlai-corporation-www";

/** The Lab ink ground the design system is built for. */
const Ground = ({ children }: { children: ReactNode }) => (
  <div style={{ background: "#05070d", padding: 28, borderRadius: 12 }}>{children}</div>
);

/** Tagged entries, so the tag filter bar renders above the list. */
export const Filterable = () => (
  <Ground>
    <div style={{ maxWidth: 640 }}>
      <PublicationIndex
        items={[
          {
            slug: "wdbx-weighted-backtrace-memory-store",
            title: "WDBX: a weighted backtrace memory store",
            summary: "The durable vector and block substrate underneath the platform.",
            date: "2026",
            tags: ["Retrieval"],
          },
          {
            slug: "sparse-evidence-attention-context-assembly",
            title: "Sparse Evidence Attention for context assembly",
            summary: "Scoring durable records, then packing under a hard token budget.",
            date: "2026",
            tags: ["Retrieval"],
          },
          {
            slug: "multi-persona-routing-policy-weights",
            title: "Multi-persona routing and policy weights",
            summary: "How Abi selects between Abbey and Aviva, and when it blends.",
            date: "2026",
            tags: ["Agents"],
          },
          {
            slug: "prompt-injection-drills-agentic-systems",
            title: "Prompt-injection drills for agentic systems",
            summary: "Rehearsing the failure before it reaches production.",
            date: "2026",
            tags: ["Safety"],
          },
        ]}
      />
    </div>
  </Ground>
);

/** Untagged entries: the filter bar is suppressed and only the list renders. */
export const Untagged = () => (
  <Ground>
    <div style={{ maxWidth: 640 }}>
      <PublicationIndex
        items={[
          {
            slug: "notes-on-durable-agent-memory",
            title: "Notes on durable agent memory",
            summary: "What survives a restart, and what an agent has to re-derive.",
            date: "2026",
          },
          {
            slug: "context-budgets-as-a-design-constraint",
            title: "Context budgets as a design constraint",
            summary: "Treating the window as a fixed shelf rather than an aspiration.",
            date: "2025",
          },
          {
            slug: "auditing-a-block-chained-store",
            title: "Auditing a block-chained store",
            summary: "Walking parent hashes to prove a record was never rewritten.",
            date: "2025",
          },
        ]}
      />
    </div>
  </Ground>
);
