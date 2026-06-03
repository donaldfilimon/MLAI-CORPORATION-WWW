import { FAQSchema, type FAQ } from '../schemas';

export const faq: FAQ = FAQSchema.parse([
  {
    question: "What is the WDBX Engine?",
    answer: "The Weighted Directed Backtrace eXecution engine is a retrieval and orchestration pattern that keeps context as weighted paths. It is designed to help teams inspect why a result was produced, which sources were used, and where confidence dropped."
  },
  {
    question: "How does the Abbey-Aviva-Abi framework differ from traditional agents?",
    answer: "Instead of giving one agent every responsibility, the framework separates creative planning, safety review, and technical execution. That separation makes permissions easier to reason about and gives operators clearer intervention points."
  },
  {
    question: "What industries do you serve?",
    answer: "We focus on teams that need private, auditable, high-reliability AI workflows, including regulated software, research operations, finance, healthcare-adjacent workflows, critical infrastructure, and security-conscious product teams."
  },
  {
    question: "Can MLAI systems run in private infrastructure?",
    answer: "Yes. We design for VPC, on-premise, hybrid, and offline-first deployment paths when data residency, network isolation, or customer policy requires it."
  },
  {
    question: "Do you replace existing LLMs?",
    answer: "Usually no. MLAI focuses on orchestration, retrieval, evaluation, and safety layers that can sit around existing model providers or self-hosted models."
  },
  {
    question: "What does an initial engagement include?",
    answer: "Most teams begin with a readiness audit: workflow mapping, data and tool inventory, failure-mode analysis, latency targets, and a staged rollout plan with measurable acceptance criteria."
  },
  {
    question: "How do you test safety behavior?",
    answer: "We build scenario suites for prompt injection, source poisoning, permission escalation, contradictory context, low-confidence retrieval, and human-approval bypass attempts."
  },
  {
    question: "Can your team help with benchmarks?",
    answer: "Yes. We help define reproducible workloads, environment notes, dashboards, regression gates, and benchmark narratives that separate real operating limits from demo conditions."
  }
]);
