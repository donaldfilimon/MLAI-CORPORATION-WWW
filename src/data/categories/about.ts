import { AboutSchema, type About } from '../schemas';

export const about: About = AboutSchema.parse({
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
