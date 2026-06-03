import { ResearchSchema, type Research } from '../schemas';

export const research: Research = ResearchSchema.parse({
  tracks: [
    {
      name: "WDBX Core",
      description: "Backtrace-aware retrieval, graph weighting, chunk provenance, and high-throughput vector search for production AI systems."
    },
    {
      name: "Agent Safety",
      description: "Permissioning, policy locks, prompt-injection resistance, role separation, and human escalation protocols."
    },
    {
      name: "Runtime Performance",
      description: "GPU acceleration, memory layout, low-latency search, edge deployment, and repeatable benchmark design."
    }
  ],
  publications: [
    {
      tag: "CORE ARCHITECTURE",
      title: "WDBX Graph Weights for Traceable Neural Retrieval",
      date: "MAY 2026",
      abstract: "A practical architecture note on storing retrieval context as weighted directed paths so answers can preserve provenance, confidence, and rollback points.",
      readTime: "11 min read"
    },
    {
      tag: "SAFETY",
      title: "Policy-Locked Tool Use in Multi-Agent Systems",
      date: "APRIL 2026",
      abstract: "A design pattern for separating creative planning, compliance review, and execution so agents can collaborate without inheriting unrestricted tool authority.",
      readTime: "9 min read"
    },
    {
      tag: "ENGINEERING",
      title: "Latency Budgets for Real-Time AI Orchestration",
      date: "MARCH 2026",
      abstract: "How to allocate milliseconds across retrieval, model calls, safety checks, and UI feedback loops without hiding reliability work behind optimistic averages.",
      readTime: "8 min read"
    },
    {
      tag: "RESEARCH",
      title: "Backtrace Confidence Signals for Hallucination Reduction",
      date: "FEBRUARY 2026",
      abstract: "A framework for combining source coverage, graph distance, contradiction checks, and model uncertainty into operator-visible confidence signals.",
      readTime: "12 min read"
    },
    {
      tag: "SCALABILITY",
      title: "Vector Index Maintenance Under Continuous Ingestion",
      date: "JANUARY 2026",
      abstract: "Operational tactics for keeping high-volume indexes fresh while protecting recall quality, write latency, and audit history.",
      readTime: "10 min read"
    },
    {
      tag: "ETHICS & SAFETY",
      title: "Human Approval Gates That Operators Actually Use",
      date: "DECEMBER 2025",
      abstract: "A field guide to designing approval flows that reduce risk without creating alert fatigue, rubber-stamping, or invisible escalation paths.",
      readTime: "7 min read"
    },
    {
      tag: "CORE ARCHITECTURE",
      title: "Chunk Provenance in Long-Context Retrieval Systems",
      date: "NOVEMBER 2025",
      abstract: "A study of source segmentation, citation persistence, and drift detection for teams using large private corpora in regulated environments.",
      readTime: "9 min read"
    },
    {
      tag: "ENGINEERING",
      title: "Offline-First AI Workflows for Sensitive Data",
      date: "OCTOBER 2025",
      abstract: "Deployment notes for packaging retrieval, inference, and audit services where cloud egress is limited or prohibited by policy.",
      readTime: "8 min read"
    },
    {
      tag: "SAFETY",
      title: "Prompt Injection Drills for Agentic Systems",
      date: "SEPTEMBER 2025",
      abstract: "A repeatable drill catalog for testing tool permission boundaries, source poisoning resilience, and confused-deputy failure modes.",
      readTime: "10 min read"
    }
  ]
});
