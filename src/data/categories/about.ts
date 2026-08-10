import type { About } from '../schemas';

export const about: About = ({
  values: [
    {
      title: "Safety Before Scale",
      description: "We design autonomy around bounded execution, explicit approvals, and measurable failure modes before expanding capability or throughput."
    },
    {
      title: "Observable Reasoning",
      description: "Every orchestration layer is built to expose provenance, retrieval context, decision checkpoints, and the operator actions that changed state."
    },
    {
      title: "Performance With Proof",
      description: "Latency, recall quality, and GPU utilization are benchmarked against repeatable workloads instead of optimistic demos or synthetic-only claims."
    },
    {
      title: "Private Deployment Paths",
      description: "Architectures are shaped for on-premise, VPC, hybrid, and edge deployments where data residency and auditability cannot be compromised."
    },
    {
      title: "Human-Centered Control",
      description: "MLAI systems keep escalation, review, and override flows visible so subject-matter experts remain in control of critical outcomes."
    },
    {
      title: "Research-To-Runtime Discipline",
      description: "Novel techniques are packaged with integration notes, safety constraints, and operational guidance so research can survive production pressure."
    }
  ],
  operatingPrinciples: [
    "No autonomous write action without an observable policy boundary.",
    "No retrieval claim without a traceable source or confidence signal.",
    "No benchmark without environment notes, workload shape, and reproducibility context.",
    "No deployment plan that ignores rollback, incident review, and human escalation."
  ]
});

// The company on paper — registration-level facts, not measurements, which is
// why they render through `SpecList` (configuration facts) rather than a
// provenance-tagged `StatBlock`. Ported from the design handoff's Company page.
export const companyFacts: readonly { k: string; v: string }[] = [
  { k: "Legal name", v: "Machine Learning Advanced Innovations, Inc." },
  { k: "Entity", v: "Delaware C-Corp" },
  { k: "Location", v: "Orlando, FL" },
  { k: "Languages", v: "Zig, Swift, TypeScript" },
  { k: "Model", v: "SDK licensing + integration services" },
];

// Positioning thesis — three claim-free cards on why on-device wins, ported
// verbatim from the design handoff's Investors page. Deliberately carries no
// figures; any number here would need a provenance tag and a repo artifact.
export const investorThesis: readonly { title: string; description: string }[] = [
  {
    title: "Privacy is becoming law",
    description:
      "Regulated industries increasingly cannot send corpora to third-party clouds. On-device is the compliance story, not a feature.",
  },
  {
    title: "The silicon is already shipped",
    description:
      "Apple Silicon's unified memory and Neural Engine sit idle in hundreds of millions of devices. We write the software that spends them.",
  },
  {
    title: "Zero marginal cloud cost",
    description:
      "Local-first inference and storage carry no per-query COGS. Unit economics improve with adoption instead of degrading.",
  },
];
