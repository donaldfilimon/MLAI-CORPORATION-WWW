import { ServicesSchema, type Services } from '../schemas';

export const services: Services = ServicesSchema.parse([
  {
    title: "Autonomy Readiness Audit",
    description: "Map workflows, prompt surfaces, data paths, and approval gates to determine which tasks are safe to automate and which need human review.",
    outcomes: ["Risk register", "Control-map", "90-day rollout plan"]
  },
  {
    title: "WDBX Retrieval Architecture",
    description: "Design weighted backtrace retrieval pipelines that preserve source context, reduce hallucination surfaces, and support fast vector search at scale.",
    outcomes: ["Index strategy", "Recall benchmarks", "Trace schema"]
  },
  {
    title: "Multi-Agent Orchestration",
    description: "Implement agent roles, tool permissions, task handoffs, and conflict-resolution policies for complex operational workflows.",
    outcomes: ["Agent graph", "Tool policy", "Evaluation harness"]
  },
  {
    title: "Model & Runtime Optimization",
    description: "Profile inference paths, memory pressure, GPU kernels, batching behavior, and edge constraints to improve real-world latency and cost.",
    outcomes: ["Latency profile", "Optimization backlog", "Capacity model"]
  },
  {
    title: "Safety & Compliance Layering",
    description: "Embed policy checks, audit trails, red-team scenarios, and evidence capture into AI systems that operate in regulated or high-trust contexts.",
    outcomes: ["Policy matrix", "Audit events", "Red-team scripts"]
  },
  {
    title: "Private AI Deployment",
    description: "Package AI workflows for VPC, on-premise, offline, and hybrid environments with secret management, observability, and update paths.",
    outcomes: ["Deployment topology", "Runbook", "Rollback plan"]
  },
  {
    title: "Research Translation",
    description: "Turn promising papers, prototypes, and notebooks into constrained, documented, production-aware services your engineers can maintain.",
    outcomes: ["Prototype hardening", "API contract", "Test plan"]
  },
  {
    title: "Executive & Engineering Workshops",
    description: "Align leadership, security, product, and engineering teams around practical autonomy strategy, risk boundaries, and delivery milestones.",
    outcomes: ["Decision memo", "Team training", "Architecture review"]
  },
  {
    title: "Continuous Evaluation Systems",
    description: "Build test suites that evaluate tool use, retrieval faithfulness, safety behavior, regression drift, and user-facing quality over time.",
    outcomes: ["Eval suite", "Scorecards", "Release gates"]
  }
]);
