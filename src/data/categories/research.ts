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
      slug: "wdbx-graph-weights-traceable-retrieval",
      tag: "CORE ARCHITECTURE",
      title: "WDBX Graph Weights for Traceable Neural Retrieval",
      date: "MAY 2026",
      abstract: "A practical architecture note on storing retrieval context as weighted directed paths so answers can preserve provenance, confidence, and rollback points.",
      readTime: "11 min read",
      authors: "MLAI Research · WDBX Core",
      body: [
        {
          paragraphs: [
            "Most retrieval-augmented systems treat retrieval as a ranked list: embed the query, return the top-k nearest records, and hand them to the model. That works until someone has to explain, after the fact, why a particular answer was produced. A ranked list tells you which records were available; it does not tell you which ones carried the answer, whether any of them contradicted each other, or where confidence quietly dropped along the way.",
            "WDBX — the Weighted Directed Backtrace eXecution store — is built around the claim that retrieval context should be a weighted directed graph, not a flat list. This note describes the data model, why the weights matter, and how the structure pays for itself during incident review."
          ]
        },
        {
          heading: "The data model",
          paragraphs: [
            "Each retrieved record is a node. Edges connect a query to the records that informed it and connect records to one another where they share derivation. Every edge carries a weight reflecting how strongly that path contributed to the generated answer. The store persists these structures with JSONL snapshots guarded by SHA-256 integrity checks, so a graph produced last quarter can be reopened and walked today without re-running the model."
          ]
        },
        {
          heading: "Why weighting changes the question you can ask",
          paragraphs: [
            "Once retrieval is a weighted graph, three questions become answerable from the artifact alone, rather than by guesswork:"
          ],
          list: [
            "Provenance — which sources actually carried the answer, separated from the ones that were merely nearby in embedding space.",
            "Confidence — read as a property of the structure: source coverage, graph distance from query to supporting evidence, and contradiction between competing paths.",
            "Rollback — if a path is later found to be poisoned or stale, walk the graph forward to every downstream decision that depended on it, instead of estimating blast radius."
          ]
        },
        {
          heading: "Cost and fallback",
          paragraphs: [
            "The store exposes key-value, vector (cosine search with a SIMD path), and block/spatial surfaces. Vector search falls back deterministically to a CPU path when native acceleration is unavailable, and disabled builds fail closed with explicit errors rather than silently degrading. The graph overhead is paid at write time and at snapshot, not on the hot read path, which keeps the structure affordable for the high-throughput retrieval it is meant to make explainable.",
            "The bet is simple: as agents take on higher-stakes work, the retrieval layer has to carry relationships, not just neighbors. Ranking tells you what was close. Backtrace tells you what was responsible."
          ]
        }
      ]
    },
    {
      slug: "policy-locked-tool-use-multi-agent",
      tag: "SAFETY",
      title: "Policy-Locked Tool Use in Multi-Agent Systems",
      date: "APRIL 2026",
      abstract: "A design pattern for separating creative planning, compliance review, and execution so agents can collaborate without inheriting unrestricted tool authority.",
      readTime: "9 min read",
      authors: "MLAI Safety Engineering",
      body: [
        {
          paragraphs: [
            "When a single agent plans an action, judges whether it is safe, and then executes it, it is acting as its own auditor — and its permission set is the union of everything it might ever need. That union is a large, hard-to-reason-about attack surface. Policy-locked tool use is the pattern we use to shrink it: separate the roles, then scope tool authority per role."
          ]
        },
        {
          heading: "Three roles, three permission sets",
          paragraphs: [
            "The Abbey–Aviva–Abi framework splits the work into distinct profiles, and the control plane grants each only what its job requires:"
          ],
          list: [
            "Aviva (expert) — plans and proposes. Reads broadly; holds no write or execute authority.",
            "Abbey (polymath) — reviews. Can block or request changes; cannot execute.",
            "Abi (moderator) — routes and executes, but only on plans that already passed review, and only through tools bound to explicit permissions."
          ]
        },
        {
          heading: "Locking tools to policy",
          paragraphs: [
            "A tool is not simply available to an agent; it is bound to a permission, an approval threshold, and a review role before execution can reach production data. Routing between profiles is deterministic and weight-based rather than a hidden model call, which means the choice of role is itself an inspectable trace event. An operator can see not just what the system did, but which profile decided to do it and under which policy.",
            "The connector layer enforces the boundary at the edge: Discord credentials are validated for printable non-whitespace content and snowflake-like IDs; Twilio payloads are checked for account/token shape, transport, and escaping before any live dispatch. A policy lock that the connector does not enforce is a suggestion, not a control."
          ]
        },
        {
          heading: "Why separation is the point",
          paragraphs: [
            "Role separation is not ceremony. It makes intervention points explicit: there is a defined moment where review happens before execution, a defined boundary an action cannot cross without approval, and a defined place an operator can step in. \"No autonomous write action without an observable policy boundary\" is far easier to keep when the boundary is a different agent with a different mandate and a smaller key ring."
          ]
        }
      ]
    },
    {
      slug: "latency-budgets-real-time-orchestration",
      tag: "ENGINEERING",
      title: "Latency Budgets for Real-Time AI Orchestration",
      date: "MARCH 2026",
      abstract: "How to allocate milliseconds across retrieval, model calls, safety checks, and UI feedback loops without hiding reliability work behind optimistic averages.",
      readTime: "8 min read",
      authors: "MLAI Runtime Engineering",
      body: [
        {
          paragraphs: [
            "A real-time AI workflow is a chain of operations, each of which spends time: retrieval, one or more model calls, safety checks, tool invocations, and the UI feedback that tells the user something is happening. A latency budget is the discipline of deciding, in advance, how many milliseconds each link is allowed — and then measuring against that budget with tail percentiles, not averages."
          ]
        },
        {
          heading: "Averages hide the work that matters",
          paragraphs: [
            "Mean latency is the number that demos well and the number that lies. The user who abandons a workflow is on the tail, not the mean. Budgets are written and enforced against p95/p99 so that the safety check you added last week shows up as the regression it is, rather than being absorbed into a comfortable average."
          ]
        },
        {
          heading: "Allocating the budget",
          paragraphs: [
            "A workable allocation treats each stage as a line item with its own ceiling:"
          ],
          list: [
            "Retrieval — bounded by the WDBX read path, which keeps graph overhead off the hot path and falls back to CPU vector search deterministically.",
            "Model calls — the largest and most variable line item; budgeted with explicit timeouts and degradation paths rather than open-ended waits.",
            "Safety checks — gated and parallelized where possible so review cost does not serialize behind the model.",
            "UI feedback — budgeted first, because perceived latency is a product surface: progressive disclosure and streamed feedback buy real headroom for the stages behind them."
          ]
        },
        {
          heading: "Budgets as release gates",
          paragraphs: [
            "A latency budget is only real if it can fail a release. Tied into the evaluation mesh, a change that blows the retrieval line item or widens the p99 is a gate failure, not a footnote on a dashboard. That is the difference between knowing your system is slow and being prevented from shipping it slower."
          ]
        }
      ]
    },
    {
      slug: "backtrace-confidence-signals-hallucination",
      tag: "RESEARCH",
      title: "Backtrace Confidence Signals for Hallucination Reduction",
      date: "FEBRUARY 2026",
      abstract: "A framework for combining source coverage, graph distance, contradiction checks, and model uncertainty into operator-visible confidence signals.",
      readTime: "12 min read",
      authors: "MLAI Research",
      body: [
        {
          paragraphs: [
            "\"Confidence\" attached to a model output is usually a single scalar with no provenance — a number the model emits about itself. For high-stakes answers that is not enough. When retrieval is a weighted backtrace graph, confidence stops being a self-report and becomes something you can compute from the structure that produced the answer."
          ]
        },
        {
          heading: "Four signals, read off the graph",
          paragraphs: [
            "Rather than trust one number, the framework combines several independent signals, each of which fails differently:"
          ],
          list: [
            "Source coverage — what fraction of the answer's claims trace back to a retrieved record versus model memory.",
            "Graph distance — how far the supporting evidence sits from the query along the backtrace path; distant support is weaker support.",
            "Contradiction checks — whether competing paths in the graph disagree, which should lower confidence even when coverage is high.",
            "Model uncertainty — the model's own signal, used as one input among four rather than the verdict."
          ]
        },
        {
          heading: "Abstention as the correct output",
          paragraphs: [
            "The point of combining these signals is to make abstention a first-class behavior. An agent that escalates when coverage is low and paths contradict is behaving correctly; an agent that fabricates a confident answer under the same conditions has failed, regardless of how often it is right elsewhere. This is where role separation helps operationally: Abbey's safety-oriented review can flag a low-confidence retrieval before Abi's execution profile ever acts on it."
          ]
        },
        {
          heading: "Surfacing it to operators",
          paragraphs: [
            "A confidence signal that lives only in logs changes no decisions. The signals resolve into an operator-visible band on the control surface, so a human can calibrate trust at a glance instead of treating every output as equally certain. Reducing hallucination, in practice, is less about a better model and more about refusing to present low-evidence answers as if they were high-evidence ones."
          ]
        }
      ]
    },
    {
      slug: "vector-index-maintenance-continuous-ingestion",
      tag: "SCALABILITY",
      title: "Vector Index Maintenance Under Continuous Ingestion",
      date: "JANUARY 2026",
      abstract: "Operational tactics for keeping high-volume indexes fresh while protecting recall quality, write latency, and audit history.",
      readTime: "10 min read",
      authors: "MLAI Runtime Engineering · WDBX Core",
      body: [
        {
          paragraphs: [
            "A vector index that never changes is easy. A vector index that ingests continuously — while still being queried, while staying recall-accurate, and while preserving an audit trail — is where the operational difficulty lives. This note collects the tactics that keep a live WDBX index fresh without trading away the properties that make it trustworthy."
          ]
        },
        {
          heading: "The three things you are protecting",
          paragraphs: [
            "Every maintenance decision is a trade against one of three properties, and the job is to avoid sacrificing any of them silently:"
          ],
          list: [
            "Recall quality — new records must become findable without degrading search over existing ones.",
            "Write latency — ingestion must not stall behind index rebuilds, and queries must not stall behind ingestion.",
            "Audit history — snapshots and their integrity checks must remain coherent across continuous mutation, so the store can still be reopened and verified."
          ]
        },
        {
          heading: "Snapshots as the coherence boundary",
          paragraphs: [
            "WDBX persists through JSONL snapshots with SHA-256 integrity and tamper rejection. Treating the snapshot as the coherence boundary lets ingestion proceed against the live structure while audit history is pinned to verifiable points in time. The block-chain entry model gives a stable lookup for prior states even as the working set moves underneath it."
          ]
        },
        {
          heading: "Verifying under load",
          paragraphs: [
            "Contract coverage in the WDBX core verifies ordered vector-search results, block metadata round-tripping, and block-chain snapshot lookup — the invariants that continuous ingestion is most likely to quietly break. The maintenance discipline is to keep those contracts green while the index is moving, not just when it is idle."
          ]
        }
      ]
    },
    {
      slug: "human-approval-gates-operators-use",
      tag: "ETHICS & SAFETY",
      title: "Human Approval Gates That Operators Actually Use",
      date: "DECEMBER 2025",
      abstract: "A field guide to designing approval flows that reduce risk without creating alert fatigue, rubber-stamping, or invisible escalation paths.",
      readTime: "7 min read",
      authors: "MLAI Safety Engineering · Product",
      body: [
        {
          paragraphs: [
            "An approval gate that fires on everything trains operators to approve on reflex. An approval gate that fires on nothing is theater. The hard part of human-in-the-loop design is not adding the gate — it is calibrating it so that the human attention it demands is attention worth spending."
          ]
        },
        {
          heading: "Failure modes of bad gates",
          paragraphs: [
            "Most approval flows fail in one of three recognizable ways:"
          ],
          list: [
            "Alert fatigue — too many low-stakes prompts, so the operator stops reading them.",
            "Rubber-stamping — the prompt lacks the context to make a real decision, so approval becomes a click.",
            "Invisible escalation — the path to a human exists on paper but is buried, so under pressure no one finds it."
          ]
        },
        {
          heading: "Designing the gate around the decision",
          paragraphs: [
            "A gate that operators use shows them a decision diff — what changed between the proposed action and the last approved state — so review is a focused comparison rather than a re-read of everything. It surfaces the confidence band behind the action so the operator can calibrate. And it keeps the emergency stop visible and always reachable, because a control that is hard to find is not a control.",
            "The review burden itself is a metric. If every run needs a human, the system does not scale; if no run does, the gates are probably theater. We track the ratio over time and treat a sharp move in either direction as a signal to retune the control plane, not just the model."
          ]
        }
      ]
    },
    {
      slug: "chunk-provenance-long-context-retrieval",
      tag: "CORE ARCHITECTURE",
      title: "Chunk Provenance in Long-Context Retrieval Systems",
      date: "NOVEMBER 2025",
      abstract: "A study of source segmentation, citation persistence, and drift detection for teams using large private corpora in regulated environments.",
      readTime: "9 min read",
      authors: "MLAI Research · WDBX Core",
      body: [
        {
          paragraphs: [
            "As context windows grow, it becomes tempting to stuff more source material into a single prompt and let the model sort it out. For regulated teams, that temptation is a liability: when an answer is challenged, \"the model read the whole corpus\" is not a citation. Chunk provenance is the discipline of keeping each retrieved segment traceable to its source, even inside a long context."
          ]
        },
        {
          heading: "Segmentation that survives retrieval",
          paragraphs: [
            "How a corpus is segmented determines what can later be cited. Chunks carry source metadata into the WDBX store so that a claim in the generated answer resolves to a specific segment of a specific document, not to an undifferentiated blob of context. The backtrace graph preserves the path from claim to chunk to source."
          ]
        },
        {
          heading: "Citation persistence and drift",
          paragraphs: [
            "Two properties matter most for teams with large private corpora in regulated environments:"
          ],
          list: [
            "Citation persistence — a citation produced today must still resolve to the same source segment months later, which is what the integrity-checked snapshot model is for.",
            "Drift detection — when the underlying corpus changes, the system should notice that previously cited segments have moved or changed, rather than silently citing stale text."
          ]
        },
        {
          heading: "Why this is a compliance feature",
          paragraphs: [
            "Provenance is not an aesthetic preference here; it is what makes a long-context system defensible under review. The ability to point from an answer to the exact segment that supports it — and to prove that segment has not drifted — is the difference between a system a regulated team can deploy and one they cannot."
          ]
        }
      ]
    },
    {
      slug: "offline-first-ai-sensitive-data",
      tag: "ENGINEERING",
      title: "Offline-First AI Workflows for Sensitive Data",
      date: "OCTOBER 2025",
      abstract: "Deployment notes for packaging retrieval, inference, and audit services where cloud egress is limited or prohibited by policy.",
      readTime: "8 min read",
      authors: "MLAI Runtime Engineering",
      body: [
        {
          paragraphs: [
            "Some workloads cannot send their context to unmanaged infrastructure — data residency, network isolation, or customer policy makes cloud egress a non-starter. Offline-first is the design stance that treats that constraint as the default case rather than an exception, and packages retrieval, inference, and audit so that going private subtracts nothing from observability."
          ]
        },
        {
          heading: "The runtime travels with its controls",
          paragraphs: [
            "The Private Runtime packages LLM orchestration, retrieval, audit logs, and controls together for cloud, VPC, on-premise, and offline-first deployments. The design intent is that the same controls an operator would have in a hosted deployment are present inside the boundary:"
          ],
          list: [
            "Local audit trails — traces persist inside the boundary with integrity checks, not shipped to an external service.",
            "Repeatable evals — regression suites run on demand without a network round-trip.",
            "Release gates — the evaluation mesh runs against local scenarios before changes reach production, air-gapped or not.",
            "Operator-visible confidence — the same retrieval confidence and source-coverage signals a hosted deployment would show."
          ]
        },
        {
          heading: "Deterministic by design",
          paragraphs: [
            "Offline-first rewards determinism. GPU status and vector operations fall back deterministically to CPU when native kernels are unavailable, so a workflow behaves the same on a workstation as in a constrained data center. The reference architecture even uses deterministic local embeddings so the system is self-contained and testable, with the embedding backend swappable while the retrieval API stays fixed.",
            "Private and auditable are not in tension. They are the same requirement seen from two sides: keep the data inside the boundary, and keep its rigor inside the boundary too."
          ]
        }
      ]
    },
    {
      slug: "prompt-injection-drills-agentic-systems",
      tag: "SAFETY",
      title: "Prompt Injection Drills for Agentic Systems",
      date: "SEPTEMBER 2025",
      abstract: "A repeatable drill catalog for testing tool permission boundaries, source poisoning resilience, and confused-deputy failure modes.",
      readTime: "10 min read",
      authors: "MLAI Safety Engineering",
      body: [
        {
          paragraphs: [
            "Prompt injection is not a single bug to patch; it is a class of failure that re-emerges every time an agent gains a new tool or a new source. Treating it as a one-time audit guarantees regressions. The alternative is a drill catalog: repeatable scenarios that run as part of the evaluation mesh, so resilience is re-tested on every change."
          ]
        },
        {
          heading: "The drills",
          paragraphs: [
            "Each drill targets a distinct way an agentic system gets subverted:"
          ],
          list: [
            "Permission boundary — adversarial input that tries to make an agent attempt an action outside its granted tools. Scored on whether the attempt is even made, not just whether it is blocked.",
            "Source poisoning — malicious content embedded in a retrieved document that tries to redirect the agent's goal or exfiltrate context.",
            "Confused deputy — input that tricks a privileged agent into acting on behalf of an unprivileged one, crossing a role boundary it should not.",
            "Contradictory context — conflicting instructions across sources, testing whether the agent abstains and escalates rather than picking one arbitrarily.",
            "Approval bypass — attempts to reach a write action without passing the human approval gate."
          ]
        },
        {
          heading: "Why drills beat audits",
          paragraphs: [
            "A drill catalog turns prompt-injection resilience into a release gate. Because role separation already scopes permissions per profile — planning reads but cannot write, review blocks but cannot execute — many of these drills are testing that the boundaries hold under adversarial pressure, not that they exist. When a drill fails, it fails loudly in CI, with a concrete trace to reproduce from, rather than quietly in production."
          ]
        }
      ]
    }
  ]
});
