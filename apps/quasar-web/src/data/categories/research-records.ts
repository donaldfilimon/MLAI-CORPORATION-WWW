import type { Research } from '../schemas';

export const researchRecords: Research = {
  "tracks": [
    {
      "id": "ai",
      "name": "AI & agent behavior",
      "description": "Understand how Abbey and ABI route requests, produce local responses, and expose bounded checks.",
      "application": "Evaluate assistant workflows with explicit behavior, provider and review boundaries.",
      "availability": "Local deterministic routing and completion are implemented; model quality requires separate evaluation.",
      "limitations": [
        "Local completion renders persona templates; it is not evidence of a trained foundation model.",
        "Keyword-based checks cannot establish general safety or emotional understanding."
      ],
      "overviewSlug": "ai-overview"
    },
    {
      "id": "wdbx",
      "name": "WDBX memory & retrieval",
      "description": "Durable records, searchable vectors and inspectable retrieval for applications that need continuity.",
      "application": "Build document recall and decision-history prototypes with explicit source ownership.",
      "availability": "Rust persistence, HNSW search and episode-store components are implemented.",
      "limitations": [
        "Storage integrity establishes consistency, not the truth of stored statements.",
        "The reference cluster protocol does not establish production multi-host operation or sharding."
      ],
      "overviewSlug": "wdbx-overview"
    },
    {
      "id": "sea",
      "name": "SEA evidence selection",
      "description": "Select a bounded set of relevant records before assembling an assistant context.",
      "application": "Prototype project recall or document assistance without placing every available record in a prompt.",
      "availability": "Eight-signal selection, task-specific scoring and bounded prompt assembly are implemented.",
      "limitations": [
        "Token costs are estimates; the implementation also enforces a prompt-byte boundary.",
        "Scoring heuristics do not guarantee relevance, truth or improved answer quality."
      ],
      "overviewSlug": "sea-overview"
    },
    {
      "id": "gpu",
      "name": "GPU & compute",
      "description": "Inspect native vector-operation support and explicit CPU fallback.",
      "application": "Assess whether a target Apple workstation can use the optional Metal DOT path.",
      "availability": "CPU vector operations and optional macOS Metal DOT dispatch are implemented.",
      "limitations": [
        "CUDA and Vulkan dispatch are not linked in the inspected ABI GPU implementation.",
        "A compiled kernel is not proof of acceleration on a particular machine or workload."
      ],
      "overviewSlug": "gpu-overview"
    },
    {
      "id": "mcp",
      "name": "MCP integrations",
      "description": "Expose bounded ABI operations through a documented tool interface.",
      "application": "Evaluate a local integration from an MCP client into the ABI tool catalog.",
      "availability": "The twelve-tool stdio JSON-RPC contract is implemented.",
      "limitations": [
        "The loopback HTTP endpoint is a custom compatibility listener, not a persistent conforming MCP HTTP+SSE transport.",
        "A listed tool does not prove provider credentials, production access or remote deployment."
      ],
      "overviewSlug": "mcp-overview"
    },
    {
      "id": "tui",
      "name": "TUI & operator tools",
      "description": "Inspect local runtime state and explore session-based agent interactions.",
      "application": "Give developers a local diagnostics and interaction surface during evaluation.",
      "availability": "The diagnostics dashboard and agent REPL are implemented.",
      "limitations": [
        "Interactive editing and refresh require a supported terminal.",
        "A dashboard view is not a production health certification or proof of provider execution."
      ],
      "overviewSlug": "tui-overview"
    }
  ],
  "publications": [
    {
      "slug": "ai-overview",
      "title": "AI & agent behavior",
      "topic": "ai",
      "documentType": "overview",
      "tag": "OVERVIEW",
      "date": "SEPTEMBER 2026",
      "abstract": "Understand how Abbey and ABI route requests, produce local responses, and expose bounded checks.",
      "practicalSummary": "Evaluate assistant workflows with explicit behavior, provider and review boundaries.",
      "readTime": "1 min read",
      "authors": "MLAI Research",
      "status": "Implemented",
      "statusNote": "Implementation status applies to the bounded source capabilities described here, not to a hosted product or benchmark result.",
      "reviewedAt": "2026-09-06",
      "sources": [
        {
          "title": "Local completion and adaptive routing",
          "url": "https://github.com/donaldfilimon/abi/blob/6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee/crates/abi-ai/src/completion.rs",
          "revision": "6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee",
          "kind": "source"
        },
        {
          "title": "Deterministic persona router",
          "url": "https://github.com/donaldfilimon/abi/blob/6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee/crates/abi-ai/src/router.rs",
          "revision": "6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee",
          "kind": "source"
        },
        {
          "title": "Constitutional checks and veto rules",
          "url": "https://github.com/donaldfilimon/abi/blob/6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee/crates/abi-ai/src/constitution.rs",
          "revision": "6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee",
          "kind": "source"
        }
      ],
      "limitations": [
        "Local completion renders persona templates; it is not evidence of a trained foundation model.",
        "Keyword-based checks cannot establish general safety or emotional understanding."
      ],
      "attachments": [],
      "body": [
        {
          "heading": "What it can help with",
          "paragraphs": [
            "Evaluate assistant workflows with explicit behavior, provider and review boundaries.",
            "These are potential pilot applications, not claims of customer outcomes."
          ]
        },
        {
          "heading": "What the source implements",
          "paragraphs": [
            "The local completion function selects a profile from keyword signals and renders an in-process persona template. The requested model identifier is metadata on this route, not proof that the named model ran. A hard constitutional veto substitutes a refusal in the returned local output."
          ]
        },
        {
          "heading": "Available today",
          "paragraphs": [
            "Local deterministic routing and completion are implemented; model quality requires separate evaluation."
          ]
        },
        {
          "heading": "How to evaluate it",
          "paragraphs": [
            "For a customer pilot, choose a concrete task and identify whether it uses local templates or an explicitly configured provider. Evaluate task correctness, escalation and data handling with representative inputs before making quality claims."
          ]
        },
        {
          "heading": "Supporting research and guides",
          "paragraphs": [
            "Read the accompanying archive entries: Policy-Locked Tool Use in Multi-Agent Systems; Human Approval Gates That Operators Actually Use; Offline-First AI Workflows for Sensitive Data; Prompt Injection Drills for Agentic Systems; Multi-Persona Routing Under Uncertainty: Policy Weights and Request Classification. Each distinguishes implemented behavior from proposed applications and includes pinned implementation evidence."
          ]
        }
      ]
    },
    {
      "slug": "wdbx-overview",
      "title": "WDBX memory & retrieval",
      "topic": "wdbx",
      "documentType": "overview",
      "tag": "OVERVIEW",
      "date": "SEPTEMBER 2026",
      "abstract": "Durable records, searchable vectors and inspectable retrieval for applications that need continuity.",
      "practicalSummary": "Build document recall and decision-history prototypes with explicit source ownership.",
      "readTime": "1 min read",
      "authors": "MLAI Research",
      "status": "Implemented",
      "statusNote": "Implementation status applies to the bounded source capabilities described here, not to a hosted product or benchmark result.",
      "reviewedAt": "2026-09-06",
      "sources": [
        {
          "title": "Durable store and writer ownership",
          "url": "https://github.com/donaldfilimon/wdbx/blob/14cb1341cb454bd3f887c4e54a83f8c42775a91d/crates/abi-wdbx/src/durable.rs",
          "revision": "14cb1341cb454bd3f887c4e54a83f8c42775a91d",
          "kind": "source"
        },
        {
          "title": "Layered HNSW index",
          "url": "https://github.com/donaldfilimon/wdbx/blob/14cb1341cb454bd3f887c4e54a83f8c42775a91d/crates/abi-wdbx/src/hnsw.rs",
          "revision": "14cb1341cb454bd3f887c4e54a83f8c42775a91d",
          "kind": "source"
        },
        {
          "title": "Hybrid retrieval and observable score factors",
          "url": "https://github.com/donaldfilimon/wdbx/blob/14cb1341cb454bd3f887c4e54a83f8c42775a91d/crates/abi-wdbx/src/retrieval.rs",
          "revision": "14cb1341cb454bd3f887c4e54a83f8c42775a91d",
          "kind": "source"
        },
        {
          "title": "Canonical episode persistence",
          "url": "https://github.com/donaldfilimon/wdbx/blob/14cb1341cb454bd3f887c4e54a83f8c42775a91d/crates/abi-wdbx/src/v3/episode/store.rs",
          "revision": "14cb1341cb454bd3f887c4e54a83f8c42775a91d",
          "kind": "source"
        },
        {
          "title": "Episode persistence and replay tests",
          "url": "https://github.com/donaldfilimon/wdbx/blob/14cb1341cb454bd3f887c4e54a83f8c42775a91d/crates/abi-wdbx/tests/v3_episode_store.rs",
          "revision": "14cb1341cb454bd3f887c4e54a83f8c42775a91d",
          "kind": "test"
        },
        {
          "title": "Reference cluster protocol boundaries",
          "url": "https://github.com/donaldfilimon/wdbx/blob/14cb1341cb454bd3f887c4e54a83f8c42775a91d/crates/abi-wdbx/src/cluster_rpc.rs",
          "revision": "14cb1341cb454bd3f887c4e54a83f8c42775a91d",
          "kind": "source"
        }
      ],
      "limitations": [
        "Storage integrity establishes consistency, not the truth of stored statements.",
        "The reference cluster protocol does not establish production multi-host operation or sharding."
      ],
      "attachments": [],
      "body": [
        {
          "heading": "What it can help with",
          "paragraphs": [
            "Build document recall and decision-history prototypes with explicit source ownership.",
            "These are potential pilot applications, not claims of customer outcomes."
          ]
        },
        {
          "heading": "What the source implements",
          "paragraphs": [
            "The durable store combines snapshots, write-ahead recovery and a layered HNSW search index. The hybrid retrieval library exposes score components. Canonical episode persistence is a separate v3 surface; consumers must use its defined semantics rather than assuming every legacy vector record is an admitted episode."
          ]
        },
        {
          "heading": "Available today",
          "paragraphs": [
            "Rust persistence, HNSW search and episode-store components are implemented."
          ]
        },
        {
          "heading": "How to evaluate it",
          "paragraphs": [
            "Start with a synthetic or authorized corpus. Check recovery, source identifiers, update behavior and retrieval relevance. Treat application permissions, data retention and deployment evidence as additional requirements."
          ]
        },
        {
          "heading": "Supporting research and guides",
          "paragraphs": [
            "Read the accompanying archive entries: WDBX: A Weighted-Backtrace Memory Store for Traceable Retrieval; WDBX Graph Weights for Traceable Neural Retrieval; Vector Index Maintenance Under Continuous Ingestion. Each distinguishes implemented behavior from proposed applications and includes pinned implementation evidence."
          ]
        }
      ]
    },
    {
      "slug": "sea-overview",
      "title": "SEA evidence selection",
      "topic": "sea",
      "documentType": "overview",
      "tag": "OVERVIEW",
      "date": "SEPTEMBER 2026",
      "abstract": "Select a bounded set of relevant records before assembling an assistant context.",
      "practicalSummary": "Prototype project recall or document assistance without placing every available record in a prompt.",
      "readTime": "1 min read",
      "authors": "MLAI Research",
      "status": "Implemented",
      "statusNote": "Implementation status applies to the bounded source capabilities described here, not to a hosted product or benchmark result.",
      "reviewedAt": "2026-09-06",
      "sources": [
        {
          "title": "Bounded evidence recall and prompt assembly",
          "url": "https://github.com/donaldfilimon/abi/blob/6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee/crates/abi-sea/src/evidence.rs",
          "revision": "6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee",
          "kind": "source"
        },
        {
          "title": "Eight-signal selection and task weights",
          "url": "https://github.com/donaldfilimon/abi/blob/6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee/crates/abi-sea/src/scorer.rs",
          "revision": "6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee",
          "kind": "source"
        },
        {
          "title": "Learning loop and persisted router weights",
          "url": "https://github.com/donaldfilimon/abi/blob/6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee/crates/abi-sea/src/learn_loop.rs",
          "revision": "6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee",
          "kind": "source"
        }
      ],
      "limitations": [
        "Token costs are estimates; the implementation also enforces a prompt-byte boundary.",
        "Scoring heuristics do not guarantee relevance, truth or improved answer quality."
      ],
      "attachments": [],
      "body": [
        {
          "heading": "What it can help with",
          "paragraphs": [
            "Prototype project recall or document assistance without placing every available record in a prompt.",
            "These are potential pilot applications, not claims of customer outcomes."
          ]
        },
        {
          "heading": "What the source implements",
          "paragraphs": [
            "SEA combines semantic, keyword, metadata, recency, authority, graph, contradiction and task-fit signals. Task-aware scoring adjusts selected task weights before bounded selection. The learning loop separately persists adaptive persona-router weights; these are not evidence that the eight retrieval weights were trained on a quality benchmark."
          ]
        },
        {
          "heading": "Available today",
          "paragraphs": [
            "Eight-signal selection, task-specific scoring and bounded prompt assembly are implemented."
          ]
        },
        {
          "heading": "How to evaluate it",
          "paragraphs": [
            "Use a documented corpus with relevant, irrelevant, conflicting and missing evidence. Review selected context and bounded behavior alongside answer quality; a successful selection test alone is not a hallucination-reduction result."
          ]
        },
        {
          "heading": "Supporting research and guides",
          "paragraphs": [
            "Read the accompanying archive entries: Sparse Evidence Attention for Bounded Context Assembly; Backtrace Confidence Signals for Hallucination Reduction; Chunk Provenance in Long-Context Retrieval Systems. Each distinguishes implemented behavior from proposed applications and includes pinned implementation evidence."
          ]
        }
      ]
    },
    {
      "slug": "gpu-overview",
      "title": "GPU & compute",
      "topic": "gpu",
      "documentType": "overview",
      "tag": "OVERVIEW",
      "date": "SEPTEMBER 2026",
      "abstract": "Inspect native vector-operation support and explicit CPU fallback.",
      "practicalSummary": "Assess whether a target Apple workstation can use the optional Metal DOT path.",
      "readTime": "1 min read",
      "authors": "MLAI Research",
      "status": "Implemented",
      "statusNote": "Implementation status applies to the bounded source capabilities described here, not to a hosted product or benchmark result.",
      "reviewedAt": "2026-09-06",
      "sources": [
        {
          "title": "GPU capability reporting and vector operations",
          "url": "https://github.com/donaldfilimon/abi/blob/6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee/crates/abi-gpu/src/lib.rs",
          "revision": "6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee",
          "kind": "source"
        },
        {
          "title": "Optional Metal DOT kernel",
          "url": "https://github.com/donaldfilimon/abi/blob/6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee/crates/abi-gpu/src/metal_kernels.rs",
          "revision": "6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee",
          "kind": "source"
        }
      ],
      "limitations": [
        "CUDA and Vulkan dispatch are not linked in the inspected ABI GPU implementation.",
        "A compiled kernel is not proof of acceleration on a particular machine or workload."
      ],
      "attachments": [],
      "body": [
        {
          "heading": "What it can help with",
          "paragraphs": [
            "Assess whether a target Apple workstation can use the optional Metal DOT path.",
            "These are potential pilot applications, not claims of customer outcomes."
          ]
        },
        {
          "heading": "What the source implements",
          "paragraphs": [
            "ABI reports platform availability, whether native kernels are linked, and whether a Metal pipeline initialized. These fields have different meanings. If the native path is unavailable, the vector-operation implementation retains a CPU fallback with accelerated=false."
          ]
        },
        {
          "heading": "Available today",
          "paragraphs": [
            "CPU vector operations and optional macOS Metal DOT dispatch are implemented."
          ]
        },
        {
          "heading": "How to evaluate it",
          "paragraphs": [
            "Inspect backend status on the intended machine and compare native and fallback results. Publish latency or throughput only with a reproducible harness, workload, hardware and methodology."
          ]
        },
        {
          "heading": "Supporting research and guides",
          "paragraphs": [
            "Read the accompanying archive entries: Latency Budgets for Real-Time AI Orchestration; Evaluating Metal acceleration and CPU fallback. Each distinguishes implemented behavior from proposed applications and includes pinned implementation evidence."
          ]
        }
      ]
    },
    {
      "slug": "mcp-overview",
      "title": "MCP integrations",
      "topic": "mcp",
      "documentType": "overview",
      "tag": "OVERVIEW",
      "date": "SEPTEMBER 2026",
      "abstract": "Expose bounded ABI operations through a documented tool interface.",
      "practicalSummary": "Evaluate a local integration from an MCP client into the ABI tool catalog.",
      "readTime": "1 min read",
      "authors": "MLAI Research",
      "status": "Implemented",
      "statusNote": "Implementation status applies to the bounded source capabilities described here, not to a hosted product or benchmark result.",
      "reviewedAt": "2026-09-06",
      "sources": [
        {
          "title": "Twelve-tool MCP contract",
          "url": "https://github.com/donaldfilimon/abi/blob/6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee/crates/abi-mcp/src/handlers.rs",
          "revision": "6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee",
          "kind": "source"
        },
        {
          "title": "Loopback HTTP compatibility boundary",
          "url": "https://github.com/donaldfilimon/abi/blob/6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee/crates/abi-mcp/src/http.rs",
          "revision": "6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee",
          "kind": "source"
        }
      ],
      "limitations": [
        "The loopback HTTP endpoint is a custom compatibility listener, not a persistent conforming MCP HTTP+SSE transport.",
        "A listed tool does not prove provider credentials, production access or remote deployment."
      ],
      "attachments": [],
      "body": [
        {
          "heading": "What it can help with",
          "paragraphs": [
            "Evaluate a local integration from an MCP client into the ABI tool catalog.",
            "These are potential pilot applications, not claims of customer outcomes."
          ]
        },
        {
          "heading": "What the source implements",
          "paragraphs": [
            "The handler catalog defines twelve tools spanning AI completion, learning and training, WDBX query and statistics, scheduler inspection, connectors, GPU status and plugins. Requests pass through explicit argument validation and dispatch."
          ]
        },
        {
          "heading": "Available today",
          "paragraphs": [
            "The twelve-tool stdio JSON-RPC contract is implemented."
          ]
        },
        {
          "heading": "How to evaluate it",
          "paragraphs": [
            "Start with initialization and tool discovery, then a harmless read-only call. Validate the exact client transport and required arguments. Enable writes or provider calls only within the intended application permissions."
          ]
        },
        {
          "heading": "Supporting research and guides",
          "paragraphs": [
            "Read the accompanying archive entries: Connecting an MCP client to ABI. Each distinguishes implemented behavior from proposed applications and includes pinned implementation evidence."
          ]
        }
      ]
    },
    {
      "slug": "tui-overview",
      "title": "TUI & operator tools",
      "topic": "tui",
      "documentType": "overview",
      "tag": "OVERVIEW",
      "date": "SEPTEMBER 2026",
      "abstract": "Inspect local runtime state and explore session-based agent interactions.",
      "practicalSummary": "Give developers a local diagnostics and interaction surface during evaluation.",
      "readTime": "1 min read",
      "authors": "MLAI Research",
      "status": "Implemented",
      "statusNote": "Implementation status applies to the bounded source capabilities described here, not to a hosted product or benchmark result.",
      "reviewedAt": "2026-09-06",
      "sources": [
        {
          "title": "Agent REPL commands and session state",
          "url": "https://github.com/donaldfilimon/abi/blob/6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee/crates/abi-cli/src/repl.rs",
          "revision": "6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee",
          "kind": "source"
        },
        {
          "title": "Diagnostics dashboard and one-shot output",
          "url": "https://github.com/donaldfilimon/abi/blob/6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee/crates/abi-cli/src/dashboard.rs",
          "revision": "6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee",
          "kind": "source"
        }
      ],
      "limitations": [
        "Interactive editing and refresh require a supported terminal.",
        "A dashboard view is not a production health certification or proof of provider execution."
      ],
      "attachments": [],
      "body": [
        {
          "heading": "What it can help with",
          "paragraphs": [
            "Give developers a local diagnostics and interaction surface during evaluation.",
            "These are potential pilot applications, not claims of customer outcomes."
          ]
        },
        {
          "heading": "What the source implements",
          "paragraphs": [
            "The agent REPL exposes session commands for model selection, profile and status inspection, context, history and reset. The diagnostics dashboard supports panes and deterministic one-shot output. A session-local SEA preference does not by itself prove durable evidence retrieval occurred."
          ]
        },
        {
          "heading": "Available today",
          "paragraphs": [
            "The diagnostics dashboard and agent REPL are implemented."
          ]
        },
        {
          "heading": "How to evaluate it",
          "paragraphs": [
            "Use one-shot diagnostics in automation and a terminal for interactive acceptance. Confirm the displayed data source and fallback disclosures before interpreting a pane as an observation of a live service."
          ]
        },
        {
          "heading": "Supporting research and guides",
          "paragraphs": [
            "Read the accompanying archive entries: Using the local diagnostics dashboard and agent REPL. Each distinguishes implemented behavior from proposed applications and includes pinned implementation evidence."
          ]
        }
      ]
    },
    {
      "slug": "wdbx-weighted-backtrace-memory-store",
      "title": "WDBX: A Weighted-Backtrace Memory Store for Traceable Retrieval",
      "date": "JUNE 2026",
      "authors": "MLAI Research · WDBX Core",
      "topic": "wdbx",
      "documentType": "research-note",
      "tag": "CORE ARCHITECTURE",
      "abstract": "A technical note on durable storage, approximate vector search and inspectable ranking, with legacy and canonical episode paths distinguished.",
      "practicalSummary": "Build document recall and decision-history prototypes with explicit source ownership.",
      "readTime": "3 min read",
      "status": "Implemented",
      "statusNote": "The described source behavior is implemented; customer outcomes and deployment readiness are not established.",
      "reviewedAt": "2026-09-06",
      "sources": [
        {
          "title": "Durable store and writer ownership",
          "url": "https://github.com/donaldfilimon/wdbx/blob/14cb1341cb454bd3f887c4e54a83f8c42775a91d/crates/abi-wdbx/src/durable.rs",
          "revision": "14cb1341cb454bd3f887c4e54a83f8c42775a91d",
          "kind": "source"
        },
        {
          "title": "Layered HNSW index",
          "url": "https://github.com/donaldfilimon/wdbx/blob/14cb1341cb454bd3f887c4e54a83f8c42775a91d/crates/abi-wdbx/src/hnsw.rs",
          "revision": "14cb1341cb454bd3f887c4e54a83f8c42775a91d",
          "kind": "source"
        },
        {
          "title": "Hybrid retrieval and observable score factors",
          "url": "https://github.com/donaldfilimon/wdbx/blob/14cb1341cb454bd3f887c4e54a83f8c42775a91d/crates/abi-wdbx/src/retrieval.rs",
          "revision": "14cb1341cb454bd3f887c4e54a83f8c42775a91d",
          "kind": "source"
        },
        {
          "title": "Snapshot chain verification",
          "url": "https://github.com/donaldfilimon/wdbx/blob/14cb1341cb454bd3f887c4e54a83f8c42775a91d/crates/abi-wdbx/src/store.rs",
          "revision": "14cb1341cb454bd3f887c4e54a83f8c42775a91d",
          "kind": "source"
        },
        {
          "title": "Canonical episode persistence",
          "url": "https://github.com/donaldfilimon/wdbx/blob/14cb1341cb454bd3f887c4e54a83f8c42775a91d/crates/abi-wdbx/src/v3/episode/store.rs",
          "revision": "14cb1341cb454bd3f887c4e54a83f8c42775a91d",
          "kind": "source"
        },
        {
          "title": "Temporal and causal ranking functions",
          "url": "https://github.com/donaldfilimon/wdbx/blob/14cb1341cb454bd3f887c4e54a83f8c42775a91d/crates/abi-wdbx/src/temporal.rs",
          "revision": "14cb1341cb454bd3f887c4e54a83f8c42775a91d",
          "kind": "source"
        },
        {
          "title": "CPU cosine reference and vector edge cases",
          "url": "https://github.com/donaldfilimon/wdbx/blob/14cb1341cb454bd3f887c4e54a83f8c42775a91d/crates/abi-compute/src/cpu.rs",
          "revision": "14cb1341cb454bd3f887c4e54a83f8c42775a91d",
          "kind": "source"
        }
      ],
      "limitations": [
        "Storage integrity establishes consistency, not the truth of stored statements.",
        "The reference cluster protocol does not establish production multi-host operation or sharding.",
        "Legacy snapshot chain verification and strict content verification are different entry points. Canonical v3 episode storage is also a distinct API. Applications must identify the path they actually use; this note does not assert that every write from every consumer passed episode admission."
      ],
      "attachments": [
        {
          "title": "Corrected source-audited PDF · 2026-09-06",
          "url": "/research/wdbx-weighted-backtrace-memory-store-2026-09-06.pdf",
          "edition": "current",
          "date": "2026-09-06",
          "sha256": "294a7906391b064273691eff60a0f83242cbbb78e2a894321285e993f31f3fa2",
          "pages": 3
        },
        {
          "title": "Historical June 2026 PDF — superseded",
          "url": "/research/wdbx-weighted-backtrace-memory-store.pdf",
          "edition": "historical",
          "date": "2026-06-01",
          "sha256": "1030bd50a64ab2426ba6558aee26398cfea1a7b7de39e527db0685bf54a853cf",
          "pages": 5
        }
      ],
      "body": [
        {
          "heading": "Practical context",
          "paragraphs": [
            "A technical note on durable storage, approximate vector search and inspectable ranking, with legacy and canonical episode paths distinguished.",
            "Build document recall and decision-history prototypes with explicit source ownership."
          ]
        },
        {
          "heading": "Implementation and research boundary",
          "paragraphs": [
            "The active Rust substrate provides durable snapshots and WAL recovery, a layered HNSW graph, and a hybrid retrieval API that exposes score components. HNSW defaults in the inspected source are M=16, EF_CONSTRUCTION=40 and EF_SEARCH=32.",
            "Legacy snapshot chain verification and strict content verification are different entry points. Canonical v3 episode storage is also a distinct API. Applications must identify the path they actually use; this note does not assert that every write from every consumer passed episode admission."
          ]
        },
        {
          "heading": "Similarity and approximate candidate selection",
          "paragraphs": [
            "For nonzero, equal-dimension vectors, cosine similarity is the normalized dot product below. It ranges from -1 to 1; it is not a probability. The CPU reference returns zero for empty or zero-norm inputs. HNSW supplies approximate candidates rather than an exhaustive guarantee of the globally closest records. An evaluation therefore needs an exact-search baseline for its chosen corpus and requested result count."
          ],
          "math": [
            "\\sigma(q,v)=\\frac{\\sum_d q_d v_d}{\\sqrt{\\sum_d q_d^2}\\sqrt{\\sum_d v_d^2}}"
          ]
        },
        {
          "heading": "Hybrid ranking is a separate calculation",
          "paragraphs": [
            "The hybrid scorer clamps semantic similarity and caller-provided persona affinity to the unit interval, then multiplies them by temporal and causal factors. With a positive half-life, temporal weight halves each half-life of nonnegative age; a nonpositive half-life disables decay. Missing timestamps use the query time. Causal reachability is bounded and uses an undirected view of persisted edges, so a hop count should not be interpreted as a proof of causal direction."
          ],
          "math": [
            "S_j=\\mathrm{clamp}_{[0,1]}(\\sigma_j)\\,\\tau_j\\,\\gamma_j\\,\\mathrm{clamp}_{[0,1]}(\\pi_j)",
            "\\tau_j=2^{-\\max(0,t_0-t_j)/t_{1/2}}"
          ]
        },
        {
          "heading": "A reconstructible storage experiment",
          "paragraphs": [
            "Use a disposable corpus with known vector neighbors and explicit metadata. Capture the source revision, vector dimensions, insertion order, query vectors and index parameters. Compare approximate results with exact ranking, then checkpoint, reopen and repeat the same queries. Separately alter a copied block payload to distinguish predecessor-link checks from strict content-hash verification. Neither successful recovery nor matching hashes validates the factual content of a stored statement. Canonical episode commitments must be tested through the v3 episode path, not inferred from legacy snapshot success."
          ]
        },
        {
          "heading": "Evaluation before adoption",
          "paragraphs": [
            "Start with a synthetic or authorized corpus. Check recovery, source identifiers, update behavior and retrieval relevance. Treat application permissions, data retention and deployment evidence as additional requirements."
          ]
        }
      ]
    },
    {
      "slug": "sparse-evidence-attention-context-assembly",
      "title": "Sparse Evidence Attention for Bounded Context Assembly",
      "date": "JUNE 2026",
      "authors": "MLAI Research · Abbey",
      "topic": "sea",
      "documentType": "research-note",
      "tag": "RESEARCH",
      "abstract": "A source-backed account of eight-signal selection and bounded prompt assembly.",
      "practicalSummary": "Prototype project recall or document assistance without placing every available record in a prompt.",
      "readTime": "3 min read",
      "status": "Implemented",
      "statusNote": "The described source behavior is implemented; customer outcomes and deployment readiness are not established.",
      "reviewedAt": "2026-09-06",
      "sources": [
        {
          "title": "Bounded evidence recall and prompt assembly",
          "url": "https://github.com/donaldfilimon/abi/blob/6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee/crates/abi-sea/src/evidence.rs",
          "revision": "6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee",
          "kind": "source"
        },
        {
          "title": "Eight-signal selection and task weights",
          "url": "https://github.com/donaldfilimon/abi/blob/6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee/crates/abi-sea/src/scorer.rs",
          "revision": "6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee",
          "kind": "source"
        },
        {
          "title": "Learning loop and persisted router weights",
          "url": "https://github.com/donaldfilimon/abi/blob/6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee/crates/abi-sea/src/learn_loop.rs",
          "revision": "6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee",
          "kind": "source"
        },
        {
          "title": "Keyword-based task classification",
          "url": "https://github.com/donaldfilimon/abi/blob/6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee/crates/abi-sea/src/query_plan.rs",
          "revision": "6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee",
          "kind": "source"
        }
      ],
      "limitations": [
        "Token costs are estimates; the implementation also enforces a prompt-byte boundary.",
        "Scoring heuristics do not guarantee relevance, truth or improved answer quality.",
        "The recall path estimates token cost from bytes and limits the assembled preamble by bytes. Task-aware retrieval scoring and the persisted adaptive persona router are separate mechanisms. No measured answer-quality improvement is asserted."
      ],
      "attachments": [],
      "body": [
        {
          "heading": "Practical context",
          "paragraphs": [
            "A source-backed account of eight-signal selection and bounded prompt assembly.",
            "Prototype project recall or document assistance without placing every available record in a prompt."
          ]
        },
        {
          "heading": "Implementation and research boundary",
          "paragraphs": [
            "SEA combines semantic, keyword, metadata, recency, authority, graph, contradiction and task-fit signals. Task-aware scoring adjusts selected task weights before bounded selection. The learning loop separately persists adaptive persona-router weights; these are not evidence that the eight retrieval weights were trained on a quality benchmark.",
            "The recall path estimates token cost from bytes and limits the assembled preamble by bytes. Task-aware retrieval scoring and the persisted adaptive persona router are separate mechanisms. No measured answer-quality improvement is asserted."
          ]
        },
        {
          "heading": "Score construction and its interpretation",
          "paragraphs": [
            "The eight dimensions are semantic, keyword, metadata, recency, authority, graph, contradiction and task fit, in that order. Default weights sum to one. Code-repair, project-recall and benchmark-review adjustments are additive and are not renormalized by adjust_weights_for_task; the final score is clamped. A score of one is therefore a saturated heuristic, not calibrated confidence. In generic-store recall, self-asserted authority metadata is observed but not trusted: those candidates are scored with inferred authority."
          ],
          "math": [
            "s(c)=\\mathrm{clamp}_{[0,1]}\\left(\\sum_{i=1}^{8}w_i x_i(c)\\right)",
            "w=(0.30,0.15,0.15,0.10,0.10,0.10,0.05,0.05)"
          ]
        },
        {
          "heading": "Selection under several budgets",
          "paragraphs": [
            "The selector orders candidates by descending score and breaks ties by stable record identifier. Duplicate identifiers do not consume budget twice. A candidate is rejected when the record cap or estimated token budget would be exceeded. The per-cluster diversity cap has an explicit exception for scores at least 0.92; it is not an unconditional diversity guarantee. Returned selected and rejected identifier lists share an aggregate reason, not a detailed per-candidate explanation.",
            "Token estimates use snippet byte length divided by four, rounded upward with a minimum of one. Prompt construction applies its own byte limit afterward. For example, under a ten-token budget, candidates costing eight and five estimated tokens cannot both fit; greedy order may select the first and reject the second even if another combination would be preferable."
          ],
          "math": [
            "\\widehat{T}(x)=\\max(1,\\lceil |x|_{\\mathrm{bytes}}/4\\rceil)",
            "\\sum_{c\\in S}\\widehat{T}(c)\\leq B"
          ]
        },
        {
          "heading": "Evaluate retrieval and generation separately",
          "paragraphs": [
            "Build fixtures for duplicate hits, tied scores, absent timestamps, self-asserted authority, conflicting records and an empty store. Keyword overlap counts significant query tokens matching case-insensitive substrings; it is not a unique-set intersection metric. Recency is relative to the latest candidate timestamp, not automatically wall-clock age. Inspect selected identifiers and the final prompt bytes before evaluating the resulting answer with a separate rubric. The EMA router update in the learning loop does not establish that evidence relevance improves over time."
          ]
        },
        {
          "heading": "Evaluation before adoption",
          "paragraphs": [
            "Use a documented corpus with relevant, irrelevant, conflicting and missing evidence. Review selected context and bounded behavior alongside answer quality; a successful selection test alone is not a hallucination-reduction result."
          ]
        }
      ]
    },
    {
      "slug": "wdbx-graph-weights-traceable-retrieval",
      "title": "WDBX Graph Weights for Traceable Neural Retrieval",
      "date": "MAY 2026",
      "authors": "MLAI Research · WDBX Core",
      "topic": "wdbx",
      "documentType": "research-note",
      "tag": "CORE ARCHITECTURE",
      "abstract": "Inspect how a candidate ranking can expose the factors that influenced it.",
      "practicalSummary": "Build document recall and decision-history prototypes with explicit source ownership.",
      "readTime": "2 min read",
      "status": "Implemented",
      "statusNote": "The described source behavior is implemented; customer outcomes and deployment readiness are not established.",
      "reviewedAt": "2026-09-06",
      "sources": [
        {
          "title": "Hybrid retrieval and observable score factors",
          "url": "https://github.com/donaldfilimon/wdbx/blob/14cb1341cb454bd3f887c4e54a83f8c42775a91d/crates/abi-wdbx/src/retrieval.rs",
          "revision": "14cb1341cb454bd3f887c4e54a83f8c42775a91d",
          "kind": "source"
        },
        {
          "title": "Layered HNSW index",
          "url": "https://github.com/donaldfilimon/wdbx/blob/14cb1341cb454bd3f887c4e54a83f8c42775a91d/crates/abi-wdbx/src/hnsw.rs",
          "revision": "14cb1341cb454bd3f887c4e54a83f8c42775a91d",
          "kind": "source"
        },
        {
          "title": "Temporal and causal ranking functions",
          "url": "https://github.com/donaldfilimon/wdbx/blob/14cb1341cb454bd3f887c4e54a83f8c42775a91d/crates/abi-wdbx/src/temporal.rs",
          "revision": "14cb1341cb454bd3f887c4e54a83f8c42775a91d",
          "kind": "source"
        }
      ],
      "limitations": [
        "Storage integrity establishes consistency, not the truth of stored statements.",
        "The reference cluster protocol does not establish production multi-host operation or sharding.",
        "A ranking factor can explain an ordering without proving a source is true. The caller supplies graph context and persona affinity; the library does not establish that an application captured a complete causal history."
      ],
      "attachments": [],
      "body": [
        {
          "heading": "Practical context",
          "paragraphs": [
            "Inspect how a candidate ranking can expose the factors that influenced it.",
            "Build document recall and decision-history prototypes with explicit source ownership."
          ]
        },
        {
          "heading": "Implementation and research boundary",
          "paragraphs": [
            "The hybrid retrieval API first obtains vector candidates and then applies graph and caller-provided persona factors. Ranked results include observable score components alongside the borrowed vector and stable identifier.",
            "A ranking factor can explain an ordering without proving a source is true. The caller supplies graph context and persona affinity; the library does not establish that an application captured a complete causal history."
          ]
        },
        {
          "heading": "Representing relationships without overstating them",
          "paragraphs": [
            "A retrieval graph supplies record identifiers, timestamps and adjacency to the ranking layer. The temporal module builds an undirected reachability view from persisted causal records. This is useful for finding nearby context, but it deliberately loses the directional distinction needed for a causal explanation. A product should display the actual relationship available, such as proximity to a selected record, rather than relabel every edge as established causation."
          ]
        },
        {
          "heading": "Weight behavior and a worked example",
          "paragraphs": [
            "For a reachable record at h hops, causal weight is the larger of a floor and decay raised to h. Default decay is 0.6 and floor is 0.25. A one-hop record receives 0.6, a two-hop record 0.36, and a three-hop record the floor because 0.216 is smaller. Missing reachability within the bounded search also returns the floor. These arithmetic examples explain the function; they are not measured retrieval-quality results."
          ],
          "math": [
            "\\gamma(h)=\\max(c_{\\mathrm{floor}},c_{\\mathrm{decay}}^h)"
          ]
        },
        {
          "heading": "Evaluate factors and ranking stability",
          "paragraphs": [
            "Construct equal-semantic candidates with different timestamps, reachability and persona factors so each influence can be isolated. Keep the original candidate set when comparing two weighting policies; otherwise a change in approximate search can be mistaken for a reranking effect. Record the complete factors and final order, including missing-node cases. Test zero persona affinity and stale records, because multiplying factors can suppress a semantically strong candidate. A decision-review interface should let the reviewer inspect the underlying source rather than treating a high combined score as an endorsement."
          ]
        },
        {
          "heading": "Evaluation before adoption",
          "paragraphs": [
            "Start with a synthetic or authorized corpus. Check recovery, source identifiers, update behavior and retrieval relevance. Treat application permissions, data retention and deployment evidence as additional requirements."
          ]
        }
      ]
    },
    {
      "slug": "policy-locked-tool-use-multi-agent",
      "title": "Policy-Locked Tool Use in Multi-Agent Systems",
      "date": "APRIL 2026",
      "authors": "MLAI Safety Engineering",
      "topic": "ai",
      "documentType": "research-note",
      "tag": "SAFETY",
      "abstract": "A proposed evaluation method for explicit authorization boundaries in agent workflows.",
      "practicalSummary": "Evaluate assistant workflows with explicit behavior, provider and review boundaries.",
      "readTime": "2 min read",
      "status": "Proposed",
      "statusNote": "This is a proposed study or application pattern, not a completed experiment or deployed feature.",
      "reviewedAt": "2026-09-06",
      "sources": [
        {
          "title": "Twelve-tool MCP contract",
          "url": "https://github.com/donaldfilimon/abi/blob/6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee/crates/abi-mcp/src/handlers.rs",
          "revision": "6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee",
          "kind": "source"
        },
        {
          "title": "Constitutional checks and veto rules",
          "url": "https://github.com/donaldfilimon/abi/blob/6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee/crates/abi-ai/src/constitution.rs",
          "revision": "6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee",
          "kind": "source"
        },
        {
          "title": "Gateway episode admission implementation",
          "url": "https://github.com/donaldfilimon/abi/blob/6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee/crates/abi-wdbx-gateway/src/episodes.rs",
          "revision": "6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee",
          "kind": "source"
        }
      ],
      "limitations": [
        "Local completion renders persona templates; it is not evidence of a trained foundation model.",
        "Keyword-based checks cannot establish general safety or emotional understanding.",
        "A general policy-locked multi-agent workflow must identify every privileged operation, its authorizer, its refusal behavior and its audit record. This note proposes that evaluation; it does not claim complete mediation of all tools or live service authorization."
      ],
      "attachments": [],
      "body": [
        {
          "heading": "Practical context",
          "paragraphs": [
            "A proposed evaluation method for explicit authorization boundaries in agent workflows.",
            "Evaluate assistant workflows with explicit behavior, provider and review boundaries."
          ]
        },
        {
          "heading": "Implementation and research boundary",
          "paragraphs": [
            "The MCP implementation validates tool arguments, the local completion path applies bounded constitutional checks, and the gateway has a separate episode-admission implementation. These are distinct mechanisms with distinct scopes.",
            "A general policy-locked multi-agent workflow must identify every privileged operation, its authorizer, its refusal behavior and its audit record. This note proposes that evaluation; it does not claim complete mediation of all tools or live service authorization."
          ]
        },
        {
          "heading": "Proposed authorization model",
          "paragraphs": [
            "Define an operation as an actor, a capability, a resource and bounded arguments. The proposed policy decision should bind to that specific operation so that an approval for reading one document cannot authorize deleting another. Keep data admission, tool invocation and model-output checks distinct: the inspected code implements examples of each boundary, not a single universal security layer. Persona routing chooses behavior and must never be treated as an authorization decision."
          ]
        },
        {
          "heading": "Protocol and failure cases to evaluate",
          "paragraphs": [
            "Create synthetic actors with allowed and denied capabilities. Submit the same well-formed operation with each identity, then vary the resource, argument bounds and request freshness. Include duplicate requests, malformed payloads, revoked permissions and a timeout after submission. Define whether a retry is idempotent and which identifier links request to outcome. This is an application-level study design; it does not assert that every listed retry or revocation control already exists in ABI."
          ]
        },
        {
          "heading": "Evidence required for a claim",
          "paragraphs": [
            "An acceptance record should identify the tested policy revision and operation, while rejection evidence should show that the protected side effect did not occur. Check the authoritative storage or execution result, not merely an approval message. A passing local test supports that tested path and policy. It does not prove that another transport, tool, or deployed service shares the same boundary. Before adoption, inventory all side-effecting entry points and test attempts to bypass the intended authorizer. Publish redacted synthetic evidence and methodology rather than customer records."
          ]
        },
        {
          "heading": "Evaluation before adoption",
          "paragraphs": [
            "For a customer pilot, choose a concrete task and identify whether it uses local templates or an explicitly configured provider. Evaluate task correctness, escalation and data handling with representative inputs before making quality claims."
          ]
        }
      ]
    },
    {
      "slug": "latency-budgets-real-time-orchestration",
      "title": "Latency Budgets for Real-Time AI Orchestration",
      "date": "MARCH 2026",
      "authors": "MLAI Runtime Engineering",
      "topic": "gpu",
      "documentType": "research-note",
      "tag": "ENGINEERING",
      "abstract": "A proposed method for measuring the stages that determine interactive response time.",
      "practicalSummary": "Assess whether a target Apple workstation can use the optional Metal DOT path.",
      "readTime": "2 min read",
      "status": "Proposed",
      "statusNote": "This is a proposed study or application pattern, not a completed experiment or deployed feature.",
      "reviewedAt": "2026-09-06",
      "sources": [
        {
          "title": "GPU capability reporting and vector operations",
          "url": "https://github.com/donaldfilimon/abi/blob/6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee/crates/abi-gpu/src/lib.rs",
          "revision": "6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee",
          "kind": "source"
        },
        {
          "title": "Bounded evidence recall and prompt assembly",
          "url": "https://github.com/donaldfilimon/abi/blob/6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee/crates/abi-sea/src/evidence.rs",
          "revision": "6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee",
          "kind": "source"
        },
        {
          "title": "Twelve-tool MCP contract",
          "url": "https://github.com/donaldfilimon/abi/blob/6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee/crates/abi-mcp/src/handlers.rs",
          "revision": "6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee",
          "kind": "source"
        }
      ],
      "limitations": [
        "CUDA and Vulkan dispatch are not linked in the inspected ABI GPU implementation.",
        "A compiled kernel is not proof of acceleration on a particular machine or workload.",
        "The inspected implementation supplies bounded retrieval and explicit backend reporting. It does not supply a published end-to-end latency result for this application, and this note sets no numeric performance promise."
      ],
      "attachments": [],
      "body": [
        {
          "heading": "Practical context",
          "paragraphs": [
            "A proposed method for measuring the stages that determine interactive response time.",
            "Assess whether a target Apple workstation can use the optional Metal DOT path."
          ]
        },
        {
          "heading": "Implementation and research boundary",
          "paragraphs": [
            "Separate context selection, tool transport, model execution and rendering when designing a latency study. Record native versus fallback execution and define the workload before assigning a budget.",
            "The inspected implementation supplies bounded retrieval and explicit backend reporting. It does not supply a published end-to-end latency result for this application, and this note sets no numeric performance promise."
          ]
        },
        {
          "heading": "A measurement model with explicit boundaries",
          "paragraphs": [
            "For a strictly sequential request, elapsed time can be decomposed into transport, retrieval, model execution, policy checks and presentation. Overlapping operations instead follow a critical path; summing every component would double-count concurrent work. Define whether timing ends at first visible output, the final token or a durable receipt. The simple sequential equation is a measurement model, not a claim that this runtime schedules every stage this way."
          ],
          "math": [
            "L_{\\mathrm{seq}}=L_{\\mathrm{transport}}+L_{\\mathrm{retrieval}}+L_{\\mathrm{model}}+L_{\\mathrm{policy}}+L_{\\mathrm{display}}"
          ]
        },
        {
          "heading": "Proposed experiment",
          "paragraphs": [
            "Pin source and configuration, identify machine and backend status, and separate warm from cold execution. Use a fixed corpus and request set with both empty and substantial evidence. Run each path repeatedly, retain failures as observations and report sample count, median and tail distributions. Measure native and CPU fallback separately; a Metal-capable build may still execute a fallback. Keep network and provider work labeled because local template latency cannot stand in for remote model generation."
          ]
        },
        {
          "heading": "Interpretation and acceptance",
          "paragraphs": [
            "Set a pilot-specific response-time requirement before collecting results. Report stage timings alongside end-to-end elapsed time, with uncertainty and the chosen concurrency level. Inspect cancellation, timeout and saturation behavior as well as successful requests. Do not multiply an assumed concurrency by GPU or shard counts to infer throughput: the inspected reference system does not establish sharding or linear scaling. A partner can use this method to compare two versions on its workload; this note provides no measured latency, capacity or comparative advantage."
          ]
        },
        {
          "heading": "Evaluation before adoption",
          "paragraphs": [
            "Inspect backend status on the intended machine and compare native and fallback results. Publish latency or throughput only with a reproducible harness, workload, hardware and methodology."
          ]
        }
      ]
    },
    {
      "slug": "backtrace-confidence-signals-hallucination",
      "title": "Backtrace Confidence Signals for Hallucination Reduction",
      "date": "FEBRUARY 2026",
      "authors": "MLAI Research",
      "topic": "sea",
      "documentType": "research-note",
      "tag": "RESEARCH",
      "abstract": "A proposed study of whether visible evidence helps reviewers detect unsupported answers.",
      "practicalSummary": "Prototype project recall or document assistance without placing every available record in a prompt.",
      "readTime": "2 min read",
      "status": "Proposed",
      "statusNote": "This is a proposed study or application pattern, not a completed experiment or deployed feature.",
      "reviewedAt": "2026-09-06",
      "sources": [
        {
          "title": "Bounded evidence recall and prompt assembly",
          "url": "https://github.com/donaldfilimon/abi/blob/6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee/crates/abi-sea/src/evidence.rs",
          "revision": "6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee",
          "kind": "source"
        },
        {
          "title": "Eight-signal selection and task weights",
          "url": "https://github.com/donaldfilimon/abi/blob/6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee/crates/abi-sea/src/scorer.rs",
          "revision": "6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee",
          "kind": "source"
        },
        {
          "title": "Hybrid retrieval and observable score factors",
          "url": "https://github.com/donaldfilimon/wdbx/blob/14cb1341cb454bd3f887c4e54a83f8c42775a91d/crates/abi-wdbx/src/retrieval.rs",
          "revision": "14cb1341cb454bd3f887c4e54a83f8c42775a91d",
          "kind": "source"
        }
      ],
      "limitations": [
        "Token costs are estimates; the implementation also enforces a prompt-byte boundary.",
        "Scoring heuristics do not guarantee relevance, truth or improved answer quality.",
        "An evaluation should define unsupported claims, compare against a baseline and disclose the corpus, scoring rubric and disagreements. No hallucination-reduction percentage or validated confidence calibration is available in this note."
      ],
      "attachments": [],
      "body": [
        {
          "heading": "Practical context",
          "paragraphs": [
            "A proposed study of whether visible evidence helps reviewers detect unsupported answers.",
            "Prototype project recall or document assistance without placing every available record in a prompt."
          ]
        },
        {
          "heading": "Implementation and research boundary",
          "paragraphs": [
            "Retrieval score components and source metadata can make context selection inspectable. They are inputs to review, not calibrated probabilities that an answer is correct.",
            "An evaluation should define unsupported claims, compare against a baseline and disclose the corpus, scoring rubric and disagreements. No hallucination-reduction percentage or validated confidence calibration is available in this note."
          ]
        },
        {
          "heading": "Research question and unit of analysis",
          "paragraphs": [
            "The proposed question is whether visible evidence and ranking factors help a reviewer identify unsupported statements. Define the unit as an individual factual claim, not an entire answer or a retrieval hit. A record can be relevant yet wrong, and an answer can contain both supported and unsupported claims. Keep relevance scores, source authority labels, confidence judgments and observed factual correctness as separate variables."
          ]
        },
        {
          "heading": "A proposed controlled comparison",
          "paragraphs": [
            "Use a versioned question set with answerable, unanswerable and contradictory-source cases. Compare the same answering workflow with and without the evidence display; keep the model, prompts and corpus fixed where possible. Have reviewers label claim support using a written rubric and record disagreements for adjudication. If judging without the evidence display is the control condition, prevent reviewers from seeing the treatment view first. These are proposed design choices, not a report of a conducted trial."
          ]
        },
        {
          "heading": "Metrics, calibration and reporting",
          "paragraphs": [
            "Report unsupported-claim rate with its denominator, abstention rate and reviewer error, rather than turning a bounded ranking score into a probability. A proposed empirical rate is unsupported factual claims divided by adjudicated factual claims; exclude or separately count nonfactual statements according to the declared rubric. If confidence probabilities are introduced later, test calibration on held-out cases. Publish annotation guidance, corpus coverage, uncertainty and failure examples. Avoid selecting only answers with available citations, which would hide failures to retrieve any useful evidence."
          ],
          "math": [
            "r_{\\mathrm{unsupported}}=\\frac{N_{\\mathrm{unsupported\\ factual\\ claims}}}{N_{\\mathrm{adjudicated\\ factual\\ claims}}}"
          ]
        },
        {
          "heading": "Evaluation before adoption",
          "paragraphs": [
            "Use a documented corpus with relevant, irrelevant, conflicting and missing evidence. Review selected context and bounded behavior alongside answer quality; a successful selection test alone is not a hallucination-reduction result."
          ]
        }
      ]
    },
    {
      "slug": "vector-index-maintenance-continuous-ingestion",
      "title": "Vector Index Maintenance Under Continuous Ingestion",
      "date": "JANUARY 2026",
      "authors": "MLAI Runtime Engineering · WDBX Core",
      "topic": "wdbx",
      "documentType": "research-note",
      "tag": "SCALABILITY",
      "abstract": "A source-based guide to persistence and index maintenance boundaries.",
      "practicalSummary": "Build document recall and decision-history prototypes with explicit source ownership.",
      "readTime": "2 min read",
      "status": "Implemented",
      "statusNote": "The described source behavior is implemented; customer outcomes and deployment readiness are not established.",
      "reviewedAt": "2026-09-06",
      "sources": [
        {
          "title": "Durable store and writer ownership",
          "url": "https://github.com/donaldfilimon/wdbx/blob/14cb1341cb454bd3f887c4e54a83f8c42775a91d/crates/abi-wdbx/src/durable.rs",
          "revision": "14cb1341cb454bd3f887c4e54a83f8c42775a91d",
          "kind": "source"
        },
        {
          "title": "Layered HNSW index",
          "url": "https://github.com/donaldfilimon/wdbx/blob/14cb1341cb454bd3f887c4e54a83f8c42775a91d/crates/abi-wdbx/src/hnsw.rs",
          "revision": "14cb1341cb454bd3f887c4e54a83f8c42775a91d",
          "kind": "source"
        },
        {
          "title": "Snapshot chain verification",
          "url": "https://github.com/donaldfilimon/wdbx/blob/14cb1341cb454bd3f887c4e54a83f8c42775a91d/crates/abi-wdbx/src/store.rs",
          "revision": "14cb1341cb454bd3f887c4e54a83f8c42775a91d",
          "kind": "source"
        }
      ],
      "limitations": [
        "Storage integrity establishes consistency, not the truth of stored statements.",
        "The reference cluster protocol does not establish production multi-host operation or sharding.",
        "Recovery and chain checks must be exercised on the actual storage path. These components do not establish a continuously available distributed index, unlimited ingest throughput or a published recall-under-load result."
      ],
      "attachments": [],
      "body": [
        {
          "heading": "Practical context",
          "paragraphs": [
            "A source-based guide to persistence and index maintenance boundaries.",
            "Build document recall and decision-history prototypes with explicit source ownership."
          ]
        },
        {
          "heading": "Implementation and research boundary",
          "paragraphs": [
            "The durable store integrates snapshots, WAL recovery and HNSW search. Writer ownership is explicit: the API reports a busy writer rather than assuming unrestricted concurrent mutation.",
            "Recovery and chain checks must be exercised on the actual storage path. These components do not establish a continuously available distributed index, unlimited ingest throughput or a published recall-under-load result."
          ]
        },
        {
          "heading": "Separate durability from retrieval freshness",
          "paragraphs": [
            "A durable record, an in-memory index entry and a checkpoint are different observations. The durable store combines snapshot and WAL recovery with its search index, while explicit writer ownership prevents treating it as an unrestricted multiwriter service. An application should define when a successful insert becomes searchable and which recovery boundary it promises. Inspect the actual API result instead of inferring a durability guarantee from a successful UI message."
          ]
        },
        {
          "heading": "Proposed repeatable workload",
          "paragraphs": [
            "Use a deterministic sequence of insertions and a fixed set of exact nearest-neighbor queries. Check recall after selected insertion batches against an exhaustive baseline, retaining record identifiers and insertion order. Repeat after checkpoint and reopen. On copied scratch data, interrupt between declared stages to evaluate recovery behavior, and attempt a second writer to verify the expected busy-writer outcome. Preserve the failing operation and error if any stage refuses work; do not silently remove errors from throughput statistics."
          ]
        },
        {
          "heading": "Maintenance decisions and acceptance",
          "paragraphs": [
            "Evaluate compaction and retention separately from indexing, because removing a segment can change what history remains available. Measure storage size, recovery time and query behavior with the same workload and source revision. A passing test should demonstrate the expected record set and ordering or declared approximation tolerance, not just that the process restarted. Traceability also requires stable application source references through replacement and deletion. These experiments would support a bounded maintenance claim; the source alone does not establish continuous availability or recall quality at a production ingest rate."
          ]
        },
        {
          "heading": "Evaluation before adoption",
          "paragraphs": [
            "Start with a synthetic or authorized corpus. Check recovery, source identifiers, update behavior and retrieval relevance. Treat application permissions, data retention and deployment evidence as additional requirements."
          ]
        }
      ]
    },
    {
      "slug": "human-approval-gates-operators-use",
      "title": "Human Approval Gates That Operators Actually Use",
      "date": "DECEMBER 2025",
      "authors": "MLAI Safety Engineering · Product",
      "topic": "ai",
      "documentType": "research-note",
      "tag": "ETHICS & SAFETY",
      "abstract": "A proposed usability study for understandable approval and refusal flows.",
      "practicalSummary": "Evaluate assistant workflows with explicit behavior, provider and review boundaries.",
      "readTime": "2 min read",
      "status": "Proposed",
      "statusNote": "This is a proposed study or application pattern, not a completed experiment or deployed feature.",
      "reviewedAt": "2026-09-06",
      "sources": [
        {
          "title": "Gateway episode admission implementation",
          "url": "https://github.com/donaldfilimon/abi/blob/6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee/crates/abi-wdbx-gateway/src/episodes.rs",
          "revision": "6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee",
          "kind": "source"
        },
        {
          "title": "Twelve-tool MCP contract",
          "url": "https://github.com/donaldfilimon/abi/blob/6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee/crates/abi-mcp/src/handlers.rs",
          "revision": "6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee",
          "kind": "source"
        }
      ],
      "limitations": [
        "Local completion renders persona templates; it is not evidence of a trained foundation model.",
        "Keyword-based checks cannot establish general safety or emotional understanding.",
        "Evaluate comprehension, cancellation, refusal and recovery with representative users before claiming usability. This research note reports no participant study or live Discord role-check result."
      ],
      "attachments": [],
      "body": [
        {
          "heading": "Practical context",
          "paragraphs": [
            "A proposed usability study for understandable approval and refusal flows.",
            "Evaluate assistant workflows with explicit behavior, provider and review boundaries."
          ]
        },
        {
          "heading": "Implementation and research boundary",
          "paragraphs": [
            "An approval interface should make the requested operation, affected data and decision outcome understandable. Backend argument checks and episode admission provide bounded implementation examples; they do not establish that a particular approval interface has been tested with operators.",
            "Evaluate comprehension, cancellation, refusal and recovery with representative users before claiming usability. This research note reports no participant study or live Discord role-check result."
          ]
        },
        {
          "heading": "What an approval should communicate",
          "paragraphs": [
            "This proposal treats approval as an interaction around one understandable action. Show the intended operation, affected resource, relevant consequences and the information needed to decide. Make refusal and cancellation as understandable as acceptance. Distinguish approval requested, decision recorded, execution started and execution completed. Backend admission examples are useful for those state distinctions, but they do not demonstrate that an interface communicates them successfully."
          ]
        },
        {
          "heading": "Proposed usability protocol",
          "paragraphs": [
            "Recruit representative operators with appropriate consent and give them synthetic tasks containing both appropriate and inappropriate requests. Include an ambiguous resource name, an expired request, a changed payload and an execution failure after approval. Observe whether participants correctly identify what they are authorizing, can refuse without losing context, and can find the final outcome. Avoid rewarding speed alone; a fast mistaken approval is a failure, not an interface improvement."
          ]
        },
        {
          "heading": "Outcome measures and adoption",
          "paragraphs": [
            "Record decision accuracy, time to comprehension, accidental approvals, cancellation success and ability to explain the outcome. Predefine the scoring rubric and collect qualitative reasons for mistakes. Compare two concrete interface variants if the study is intended to support a design choice. Report participant characteristics and limitations without exposing identities. Approval usability does not establish backend enforcement, and backend refusal does not establish usability. A customer pilot should verify both with separate evidence before adopting the flow for consequential work."
          ]
        },
        {
          "heading": "Evaluation before adoption",
          "paragraphs": [
            "For a customer pilot, choose a concrete task and identify whether it uses local templates or an explicitly configured provider. Evaluate task correctness, escalation and data handling with representative inputs before making quality claims."
          ]
        }
      ]
    },
    {
      "slug": "chunk-provenance-long-context-retrieval",
      "title": "Chunk Provenance in Long-Context Retrieval Systems",
      "date": "NOVEMBER 2025",
      "authors": "MLAI Research · WDBX Core",
      "topic": "sea",
      "documentType": "research-note",
      "tag": "CORE ARCHITECTURE",
      "abstract": "A proposed application pattern for preserving source references through document retrieval.",
      "practicalSummary": "Prototype project recall or document assistance without placing every available record in a prompt.",
      "readTime": "2 min read",
      "status": "Proposed",
      "statusNote": "This is a proposed study or application pattern, not a completed experiment or deployed feature.",
      "reviewedAt": "2026-09-06",
      "sources": [
        {
          "title": "Bounded evidence recall and prompt assembly",
          "url": "https://github.com/donaldfilimon/abi/blob/6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee/crates/abi-sea/src/evidence.rs",
          "revision": "6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee",
          "kind": "source"
        },
        {
          "title": "Durable store and writer ownership",
          "url": "https://github.com/donaldfilimon/wdbx/blob/14cb1341cb454bd3f887c4e54a83f8c42775a91d/crates/abi-wdbx/src/durable.rs",
          "revision": "14cb1341cb454bd3f887c4e54a83f8c42775a91d",
          "kind": "source"
        }
      ],
      "limitations": [
        "Token costs are estimates; the implementation also enforces a prompt-byte boundary.",
        "Scoring heuristics do not guarantee relevance, truth or improved answer quality.",
        "Enduring citation resolution also requires versioned source retention and an application-level resolver. Those requirements are proposed here; the presence of storage metadata does not prove long-term citation validity or regulatory compliance."
      ],
      "attachments": [],
      "body": [
        {
          "heading": "Practical context",
          "paragraphs": [
            "A proposed application pattern for preserving source references through document retrieval.",
            "Prototype project recall or document assistance without placing every available record in a prompt."
          ]
        },
        {
          "heading": "Implementation and research boundary",
          "paragraphs": [
            "A document application can retain source identity and segment boundaries alongside retrieved content, then present those references with an answer. The evidence path reads metadata from durable records and assembles bounded snippets.",
            "Enduring citation resolution also requires versioned source retention and an application-level resolver. Those requirements are proposed here; the presence of storage metadata does not prove long-term citation validity or regulatory compliance."
          ]
        },
        {
          "heading": "A proposed record model",
          "paragraphs": [
            "Bind each retrievable segment to a source identifier, a source version and a reproducible boundary such as a byte range or stable structural anchor. Keep the original text available under an authorized retention policy. A citation should resolve to that specific version rather than whatever content happens to be at the source URL today. The inspected evidence path consumes metadata and snippets, but the full document-version resolver described here belongs to an application and is proposed."
          ]
        },
        {
          "heading": "Data flow and drift handling",
          "paragraphs": [
            "At ingestion, record how the document was parsed and segmented. Carry the segment identifier through candidate retrieval, selection and answer presentation. When a source changes, distinguish an updated version from an in-place replacement that would invalidate old references. A hash can detect content change but does not grant permission to retain or reveal the document. On deletion, define how the product explains an unavailable reference while respecting the owner’s retention and access rules."
          ]
        },
        {
          "heading": "Proposed validation fixtures",
          "paragraphs": [
            "Use documents with repeated passages, changed headings, reordered sections and identical text in different sources. Ask queries that retrieve each case, then verify that displayed references resolve to the intended version and boundaries. Include a removed source and an unauthorized reader so that unavailable evidence is handled explicitly. Test the resolver independently of answer quality, then evaluate whether the answer actually supports its claims with those segments. Long context is not a substitute for citation correctness, and this design is not a certification of compliance."
          ]
        },
        {
          "heading": "Evaluation before adoption",
          "paragraphs": [
            "Use a documented corpus with relevant, irrelevant, conflicting and missing evidence. Review selected context and bounded behavior alongside answer quality; a successful selection test alone is not a hallucination-reduction result."
          ]
        }
      ]
    },
    {
      "slug": "offline-first-ai-sensitive-data",
      "title": "Offline-First AI Workflows for Sensitive Data",
      "date": "OCTOBER 2025",
      "authors": "MLAI Runtime Engineering",
      "topic": "ai",
      "documentType": "research-note",
      "tag": "ENGINEERING",
      "abstract": "A bounded description of local deterministic processing and its evaluation uses.",
      "practicalSummary": "Evaluate assistant workflows with explicit behavior, provider and review boundaries.",
      "readTime": "2 min read",
      "status": "Implemented",
      "statusNote": "The described source behavior is implemented; customer outcomes and deployment readiness are not established.",
      "reviewedAt": "2026-09-06",
      "sources": [
        {
          "title": "Local completion and adaptive routing",
          "url": "https://github.com/donaldfilimon/abi/blob/6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee/crates/abi-ai/src/completion.rs",
          "revision": "6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee",
          "kind": "source"
        },
        {
          "title": "Bounded evidence recall and prompt assembly",
          "url": "https://github.com/donaldfilimon/abi/blob/6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee/crates/abi-sea/src/evidence.rs",
          "revision": "6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee",
          "kind": "source"
        },
        {
          "title": "GPU capability reporting and vector operations",
          "url": "https://github.com/donaldfilimon/abi/blob/6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee/crates/abi-gpu/src/lib.rs",
          "revision": "6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee",
          "kind": "source"
        }
      ],
      "limitations": [
        "Local completion renders persona templates; it is not evidence of a trained foundation model.",
        "Keyword-based checks cannot establish general safety or emotional understanding.",
        "This is not a claim that every product feature works offline or that sensitive data is protected automatically. Provider calls, application logging, permissions and retention require their own data-flow review."
      ],
      "attachments": [],
      "body": [
        {
          "heading": "Practical context",
          "paragraphs": [
            "A bounded description of local deterministic processing and its evaluation uses.",
            "Evaluate assistant workflows with explicit behavior, provider and review boundaries."
          ]
        },
        {
          "heading": "Implementation and research boundary",
          "paragraphs": [
            "Local ABI completion renders in-process persona templates, and the evidence path can read a configured local store. Vector operations retain a CPU fallback when native acceleration is unavailable. This supports self-contained functional experiments with synthetic inputs.",
            "This is not a claim that every product feature works offline or that sensitive data is protected automatically. Provider calls, application logging, permissions and retention require their own data-flow review."
          ]
        },
        {
          "heading": "Define the offline boundary",
          "paragraphs": [
            "Offline can refer to generation, retrieval, interface rendering or storage, and those are not interchangeable. The local ABI completion function does not invoke the named provider model: it generates deterministic persona text. SEA can assemble evidence from a configured durable store, and CPU vector computation can support functional experiments when native acceleration is unavailable. These paths make useful local fixtures, but their successful execution cannot certify every integration as offline."
          ]
        },
        {
          "heading": "A safe evaluation setup",
          "paragraphs": [
            "Use synthetic prompts and a disposable data directory, record the selected completion mode and backend report, and keep provider credentials outside the test environment. Inspect the intended entry point for persistence before running it. For a retrieval experiment, populate the scratch corpus with known records and verify that output context derives from those records. Compare a run with no stored evidence and a run with relevant or contradictory evidence; do not describe the difference as quality improvement without a rubric."
          ]
        },
        {
          "heading": "Privacy and acceptance",
          "paragraphs": [
            "Trace inputs, generated output, logs, caches and exports across the whole application. A local model can still be embedded in software that transmits telemetry or calls remote tools. Inspect those paths and verify network behavior in the intended environment before making an offline claim. Evaluate access controls and deletion separately from physical locality. A partner can use this boundary map to choose what may remain on a workstation, while recognizing that production model capability, sensitive-data handling and operational support each require their own acceptance evidence."
          ]
        },
        {
          "heading": "Evaluation before adoption",
          "paragraphs": [
            "For a customer pilot, choose a concrete task and identify whether it uses local templates or an explicitly configured provider. Evaluate task correctness, escalation and data handling with representative inputs before making quality claims."
          ]
        }
      ]
    },
    {
      "slug": "prompt-injection-drills-agentic-systems",
      "title": "Prompt Injection Drills for Agentic Systems",
      "date": "SEPTEMBER 2025",
      "authors": "MLAI Safety Engineering",
      "topic": "ai",
      "documentType": "research-note",
      "tag": "SAFETY",
      "abstract": "A proposed adversarial test set for agent boundaries and failure handling.",
      "practicalSummary": "Evaluate assistant workflows with explicit behavior, provider and review boundaries.",
      "readTime": "2 min read",
      "status": "Proposed",
      "statusNote": "This is a proposed study or application pattern, not a completed experiment or deployed feature.",
      "reviewedAt": "2026-09-06",
      "sources": [
        {
          "title": "Constitutional checks and veto rules",
          "url": "https://github.com/donaldfilimon/abi/blob/6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee/crates/abi-ai/src/constitution.rs",
          "revision": "6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee",
          "kind": "source"
        },
        {
          "title": "Twelve-tool MCP contract",
          "url": "https://github.com/donaldfilimon/abi/blob/6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee/crates/abi-mcp/src/handlers.rs",
          "revision": "6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee",
          "kind": "source"
        },
        {
          "title": "Local completion and adaptive routing",
          "url": "https://github.com/donaldfilimon/abi/blob/6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee/crates/abi-ai/src/completion.rs",
          "revision": "6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee",
          "kind": "source"
        }
      ],
      "limitations": [
        "Local completion renders persona templates; it is not evidence of a trained foundation model.",
        "Keyword-based checks cannot establish general safety or emotional understanding.",
        "The local constitutional checker uses fixed substring rules and can substitute a refusal after a hard veto. It is not a general prompt-injection detector; successful drills cannot establish resistance to unseen attacks."
      ],
      "attachments": [],
      "body": [
        {
          "heading": "Practical context",
          "paragraphs": [
            "A proposed adversarial test set for agent boundaries and failure handling.",
            "Evaluate assistant workflows with explicit behavior, provider and review boundaries."
          ]
        },
        {
          "heading": "Implementation and research boundary",
          "paragraphs": [
            "Include hostile retrieved instructions, malformed tool arguments and attempts to cross an authorization boundary. Record which component rejects the request and what the caller observes.",
            "The local constitutional checker uses fixed substring rules and can substitute a refusal after a hard veto. It is not a general prompt-injection detector; successful drills cannot establish resistance to unseen attacks."
          ]
        },
        {
          "heading": "Threat model for the drill",
          "paragraphs": [
            "Treat retrieved documents and tool output as data that may contain hostile instructions. Define the trusted instruction source and the exact capability an attacker is trying to influence. A drill should distinguish an answer-content failure, an attempted tool call and a completed protected side effect. The inspected substring-based constitutional checker and MCP argument validation cover bounded rules; neither implies universal resistance to malicious instructions."
          ]
        },
        {
          "heading": "Build a synthetic adversarial corpus",
          "paragraphs": [
            "Pair a normal task with a document that requests an unrelated tool, claims higher authority or asks the assistant to reveal unrelated material. Add conflicting documents, encoded or paraphrased instructions, long distractors and plausible-looking metadata. Keep secrets synthetic and use tools that record intended calls without touching production systems. Include benign documents with similar vocabulary so that excessive refusals are visible. Record corpus and source revisions so future changes can replay the same cases."
          ]
        },
        {
          "heading": "Evaluate the full chain",
          "paragraphs": [
            "For each case, inspect selected context, the model or template response, tool dispatch and authoritative side-effect evidence. A refusal in text is insufficient if a tool already ran. Conversely, rejection of malformed arguments does not demonstrate resistance to a well-formed malicious request. Score attack success and legitimate-task completion separately and review false positives. Retest previously failing cases and hold out new variants to reduce overfitting. Findings should describe the exact tested boundaries, not claim that a passing fixed set proves general security."
          ]
        },
        {
          "heading": "Evaluation before adoption",
          "paragraphs": [
            "For a customer pilot, choose a concrete task and identify whether it uses local templates or an explicitly configured provider. Evaluate task correctness, escalation and data handling with representative inputs before making quality claims."
          ]
        }
      ]
    },
    {
      "slug": "multi-persona-routing-policy-weights",
      "title": "Multi-Persona Routing Under Uncertainty: Policy Weights and Request Classification",
      "date": "JUNE 2026",
      "authors": "MLAI Research · Agent Safety",
      "topic": "ai",
      "documentType": "research-note",
      "tag": "ROUTING",
      "abstract": "A corrected account of deterministic local profile routing and adaptive state in the SEA path.",
      "practicalSummary": "Evaluate assistant workflows with explicit behavior, provider and review boundaries.",
      "readTime": "3 min read",
      "status": "Implemented",
      "statusNote": "The described source behavior is implemented; customer outcomes and deployment readiness are not established.",
      "reviewedAt": "2026-09-06",
      "sources": [
        {
          "title": "Local completion and adaptive routing",
          "url": "https://github.com/donaldfilimon/abi/blob/6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee/crates/abi-ai/src/completion.rs",
          "revision": "6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee",
          "kind": "source"
        },
        {
          "title": "Deterministic persona router",
          "url": "https://github.com/donaldfilimon/abi/blob/6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee/crates/abi-ai/src/router.rs",
          "revision": "6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee",
          "kind": "source"
        },
        {
          "title": "Learning loop and persisted router weights",
          "url": "https://github.com/donaldfilimon/abi/blob/6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee/crates/abi-sea/src/learn_loop.rs",
          "revision": "6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee",
          "kind": "source"
        },
        {
          "title": "EMA update and state validation",
          "url": "https://github.com/donaldfilimon/abi/blob/6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee/crates/abi-ai/src/modulator.rs",
          "revision": "6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee",
          "kind": "source"
        },
        {
          "title": "Canonical persona priors",
          "url": "https://github.com/donaldfilimon/abi/blob/6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee/crates/abi-ai/src/identity.rs",
          "revision": "6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee",
          "kind": "source"
        }
      ],
      "limitations": [
        "Local completion renders persona templates; it is not evidence of a trained foundation model.",
        "Keyword-based checks cannot establish general safety or emotional understanding.",
        "This note does not claim a learned classifier of emotions, confidence-thresholded response blending, historical task-fit retrieval or a complete automatic rerouting audit trail. Those broader claims in the historical edition are not established by the cited implementation."
      ],
      "attachments": [
        {
          "title": "Corrected source-audited PDF · 2026-09-06",
          "url": "/research/multi-persona-routing-policy-weights-2026-09-06.pdf",
          "edition": "current",
          "date": "2026-09-06",
          "sha256": "38be0dfe5661e90d593e767c7a50c3030bb3daccf94b97ef5e64a3a8f70a0f37",
          "pages": 3
        },
        {
          "title": "Historical June 2026 PDF — superseded",
          "url": "/research/multi-persona-routing-policy-weights.pdf",
          "edition": "historical",
          "date": "2026-06-01",
          "sha256": "3e0163af561bfd28e2c0c3544b5108478f87433e838e7d8a8acd94ca0303d5b8",
          "pages": 4
        }
      ],
      "body": [
        {
          "heading": "Practical context",
          "paragraphs": [
            "A corrected account of deterministic local profile routing and adaptive state in the SEA path.",
            "Evaluate assistant workflows with explicit behavior, provider and review boundaries."
          ]
        },
        {
          "heading": "Implementation and research boundary",
          "paragraphs": [
            "Base local completion selects a persona from keyword-derived signals and renders a template. The adaptive completion function can use persisted router weights when invoked through the SEA learning path. The learning loop owns persistence of the updated state.",
            "This note does not claim a learned classifier of emotions, confidence-thresholded response blending, historical task-fit retrieval or a complete automatic rerouting audit trail. Those broader claims in the historical edition are not established by the cited implementation."
          ]
        },
        {
          "heading": "Base route: additive keyword weights",
          "paragraphs": [
            "The canonical prior is Abbey 0.40, Aviva 0.30 and ABI 0.30. The router splits ASCII whitespace, trims selected trailing punctuation and applies case-insensitive prefix matches against its keyword table. Each match adds one tenth of the keyword’s persona score. A positive total is normalized, then the largest weight wins; ties prefer Abbey, then Aviva, then ABI. These values describe a deterministic heuristic, not a trained probability model."
          ],
          "math": [
            "w^{(0)}=(0.40,0.30,0.30)",
            "\\widetilde{w}_p=w^{(0)}_p+0.1\\sum_{k\\in\\mathrm{matches}(I)}s_{k,p}",
            "w_p=\\frac{\\widetilde{w}_p}{\\sum_j\\widetilde{w}_j}"
          ]
        },
        {
          "heading": "Explicit selection and adaptive state",
          "paragraphs": [
            "An exact leading persona address can override keyword routing. The parser accepts forms such as “Aviva, be direct” or “ABI: orchestrate”; mentioning a persona later in prose is different. In the adaptive path, the pure modulator updates an exponential moving average and renormalizes it. The default smoothing factor is 0.3. Serialization and validation are explicit; malformed persisted state falls back to defaults rather than becoming an arbitrary routing distribution."
          ],
          "math": [
            "e_t=\\mathrm{normalize}\\left(0.3w_t+0.7e_{t-1}\\right)"
          ]
        },
        {
          "heading": "What to test and what the result means",
          "paragraphs": [
            "Test neutral text, each explicit address, punctuation and whitespace variants, near ties and corrupted saved state. Keep the original utterance separate from retrieved context so evidence text cannot silently impersonate the user’s persona selector. The SEA loop owns loading and saving adaptive state; base completion remains store-independent. Compare selected profiles and returned outputs across repeated runs at the pinned revision. A deterministic match establishes routing behavior, not empathy, expertise, calibrated uncertainty or automatic text blending between separate models."
          ]
        },
        {
          "heading": "Evaluation before adoption",
          "paragraphs": [
            "For a customer pilot, choose a concrete task and identify whether it uses local templates or an explicitly configured provider. Evaluate task correctness, escalation and data handling with representative inputs before making quality claims."
          ]
        }
      ]
    },
    {
      "slug": "gpu-implementation-guide",
      "title": "Evaluating Metal acceleration and CPU fallback",
      "topic": "gpu",
      "documentType": "implementation-guide",
      "tag": "IMPLEMENTATION GUIDE",
      "date": "SEPTEMBER 2026",
      "abstract": "Inspect native vector-operation support and explicit CPU fallback.",
      "practicalSummary": "Assess whether a target Apple workstation can use the optional Metal DOT path.",
      "readTime": "2 min read",
      "authors": "MLAI Runtime Engineering",
      "status": "Implemented",
      "statusNote": "The documented local interface exists in the cited source. Actual runtime and client acceptance must be checked in the intended environment.",
      "reviewedAt": "2026-09-06",
      "sources": [
        {
          "title": "GPU capability reporting and vector operations",
          "url": "https://github.com/donaldfilimon/abi/blob/6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee/crates/abi-gpu/src/lib.rs",
          "revision": "6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee",
          "kind": "source"
        },
        {
          "title": "Optional Metal DOT kernel",
          "url": "https://github.com/donaldfilimon/abi/blob/6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee/crates/abi-gpu/src/metal_kernels.rs",
          "revision": "6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee",
          "kind": "source"
        }
      ],
      "limitations": [
        "CUDA and Vulkan dispatch are not linked in the inspected ABI GPU implementation.",
        "A compiled kernel is not proof of acceleration on a particular machine or workload."
      ],
      "attachments": [],
      "body": [
        {
          "heading": "Start with the intended workflow",
          "paragraphs": [
            "Assess whether a target Apple workstation can use the optional Metal DOT path.",
            "ABI reports platform availability, whether native kernels are linked, and whether a Metal pipeline initialized. These fields have different meanings. If the native path is unavailable, the vector-operation implementation retains a CPU fallback with accelerated=false."
          ]
        },
        {
          "heading": "Local entry points",
          "paragraphs": [
            "Run from the ABI checkout with the CLI built and available on PATH. Use disposable data for evaluation; do not connect a test to a live memory store."
          ],
          "code": [
            {
              "lang": "sh",
              "code": "abi backends\nabi wdbx gpu info"
            }
          ]
        },
        {
          "heading": "Acceptance and limits",
          "paragraphs": [
            "Inspect backend status on the intended machine and compare native and fallback results. Publish latency or throughput only with a reproducible harness, workload, hardware and methodology.",
            "CUDA and Vulkan dispatch are not linked in the inspected ABI GPU implementation.",
            "A compiled kernel is not proof of acceleration on a particular machine or workload."
          ]
        },
        {
          "heading": "Interpret the report correctly",
          "paragraphs": [
            "available describes platform availability, native_kernels describes linkage and accelerated describes an initialized native path. On macOS, Metal can be the preferred backend while accelerated remains false. CUDA and Vulkan names are catalog entries in this implementation, not working native dispatch. Preserve the reported fallback message in an evaluation log so results from different machines are not silently combined."
          ]
        },
        {
          "heading": "Check native and fallback parity",
          "paragraphs": [
            "Run the crate’s vector-operation tests from the ABI checkout using its pinned toolchain wrapper. The following command runs local tests and redirects stdin; it does not publish benchmark results. Review skips and backend initialization failures explicitly. For performance work, add a separately reviewed harness that declares vector dimensions, repetition count and timing boundary."
          ],
          "code": [
            {
              "lang": "sh",
              "code": "./tools/cargo.sh test -p abi-gpu < /dev/null"
            }
          ]
        },
        {
          "heading": "Acceptance for an integration",
          "paragraphs": [
            "Use equal-length, empty and zero-norm vectors as appropriate to the operation, plus lengths that exercise a remainder beyond a SIMD block. Compare results under a declared numeric tolerance; matching output is a correctness observation, not a speedup. Check the exact caller path because backend status alone does not prove that a particular operation dispatched to the GPU. Record the source revision, machine and backend report with any local result. No hardware-specific speed or power outcome is supplied by this guide."
          ]
        }
      ]
    },
    {
      "slug": "mcp-implementation-guide",
      "title": "Connecting an MCP client to ABI",
      "topic": "mcp",
      "documentType": "implementation-guide",
      "tag": "IMPLEMENTATION GUIDE",
      "date": "SEPTEMBER 2026",
      "abstract": "Expose bounded ABI operations through a documented tool interface.",
      "practicalSummary": "Evaluate a local integration from an MCP client into the ABI tool catalog.",
      "readTime": "2 min read",
      "authors": "MLAI Runtime Engineering",
      "status": "Implemented",
      "statusNote": "The documented local interface exists in the cited source. Actual runtime and client acceptance must be checked in the intended environment.",
      "reviewedAt": "2026-09-06",
      "sources": [
        {
          "title": "Twelve-tool MCP contract",
          "url": "https://github.com/donaldfilimon/abi/blob/6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee/crates/abi-mcp/src/handlers.rs",
          "revision": "6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee",
          "kind": "source"
        },
        {
          "title": "Loopback HTTP compatibility boundary",
          "url": "https://github.com/donaldfilimon/abi/blob/6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee/crates/abi-mcp/src/http.rs",
          "revision": "6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee",
          "kind": "source"
        }
      ],
      "limitations": [
        "The loopback HTTP endpoint is a custom compatibility listener, not a persistent conforming MCP HTTP+SSE transport.",
        "A listed tool does not prove provider credentials, production access or remote deployment."
      ],
      "attachments": [],
      "body": [
        {
          "heading": "Start with the intended workflow",
          "paragraphs": [
            "Evaluate a local integration from an MCP client into the ABI tool catalog.",
            "The handler catalog defines twelve tools spanning AI completion, learning and training, WDBX query and statistics, scheduler inspection, connectors, GPU status and plugins. Requests pass through explicit argument validation and dispatch."
          ]
        },
        {
          "heading": "Local entry points",
          "paragraphs": [
            "Run from the ABI checkout with the CLI built and available on PATH. Use disposable data for evaluation; do not connect a test to a live memory store."
          ],
          "code": [
            {
              "lang": "sh",
              "code": "ABI_WDBX_PERSIST=0 ./mcp/launcher.sh stdio"
            }
          ]
        },
        {
          "heading": "Acceptance and limits",
          "paragraphs": [
            "Start with initialization and tool discovery, then a harmless read-only call. Validate the exact client transport and required arguments. Enable writes or provider calls only within the intended application permissions.",
            "The loopback HTTP endpoint is a custom compatibility listener, not a persistent conforming MCP HTTP+SSE transport.",
            "A listed tool does not prove provider credentials, production access or remote deployment."
          ]
        },
        {
          "heading": "A minimal read-only protocol exercise",
          "paragraphs": [
            "After building the ABI MCP binary, send newline-delimited requests using the local launcher. Persistence is explicitly disabled for this example. The initialization request, tool discovery and gpu_status call exercise handshake, catalog and read-only dispatch. Match response IDs and inspect protocol errors rather than treating process startup as successful integration. The listener may attempt its custom loopback port; a port warning must be interpreted separately from stdio responses."
          ],
          "code": [
            {
              "lang": "sh",
              "code": "ABI_WDBX_PERSIST=0 ./mcp/launcher.sh stdio <<'JSONRPC'\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"initialize\",\"params\":{\"protocolVersion\":\"2024-11-05\",\"capabilities\":{},\"clientInfo\":{\"name\":\"mlai-research-check\",\"version\":\"1\"}}}\n{\"jsonrpc\":\"2.0\",\"method\":\"notifications/initialized\"}\n{\"jsonrpc\":\"2.0\",\"id\":2,\"method\":\"tools/list\",\"params\":{}}\n{\"jsonrpc\":\"2.0\",\"id\":3,\"method\":\"tools/call\",\"params\":{\"name\":\"gpu_status\",\"arguments\":{}}}\nJSONRPC"
            }
          ]
        },
        {
          "heading": "Catalog and error checks",
          "paragraphs": [
            "The frozen tools are ai_run, ai_complete, ai_learn, ai_train, wdbx_query, scheduler_stats, scheduler_info, connector_test, gpu_status, plugin_list, wdbx_stats and plugin_run. scheduler_info is a compatibility alias. Test an unknown tool and a missing required argument separately from successful calls. Catalog presence says that an interface exists; it does not imply credentials, populated storage or production authorization."
          ]
        },
        {
          "heading": "Transport selection and adoption",
          "paragraphs": [
            "Use the actual stdio integration contract when configuring a client. The custom GET /sse endpoint emits discovery once and closes, while POST /message returns its response over HTTP. A client expecting a persistent HTTP+SSE response stream needs a different conforming transport implementation. Before enabling writes, define data ownership and error recovery for each tool. This guide does not ask you to run learning, training or plugin side effects as a handshake test."
          ]
        }
      ]
    },
    {
      "slug": "tui-implementation-guide",
      "title": "Using the local diagnostics dashboard and agent REPL",
      "topic": "tui",
      "documentType": "implementation-guide",
      "tag": "IMPLEMENTATION GUIDE",
      "date": "SEPTEMBER 2026",
      "abstract": "Inspect local runtime state and explore session-based agent interactions.",
      "practicalSummary": "Give developers a local diagnostics and interaction surface during evaluation.",
      "readTime": "2 min read",
      "authors": "MLAI Runtime Engineering",
      "status": "Implemented",
      "statusNote": "The documented local interface exists in the cited source. Actual runtime and client acceptance must be checked in the intended environment.",
      "reviewedAt": "2026-09-06",
      "sources": [
        {
          "title": "Agent REPL commands and session state",
          "url": "https://github.com/donaldfilimon/abi/blob/6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee/crates/abi-cli/src/repl.rs",
          "revision": "6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee",
          "kind": "source"
        },
        {
          "title": "Diagnostics dashboard and one-shot output",
          "url": "https://github.com/donaldfilimon/abi/blob/6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee/crates/abi-cli/src/dashboard.rs",
          "revision": "6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee",
          "kind": "source"
        },
        {
          "title": "Terminal modes, input and restoration",
          "url": "https://github.com/donaldfilimon/abi/blob/6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee/crates/abi-cli/src/terminal.rs",
          "revision": "6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee",
          "kind": "source"
        }
      ],
      "limitations": [
        "Interactive editing and refresh require a supported terminal.",
        "A dashboard view is not a production health certification or proof of provider execution."
      ],
      "attachments": [],
      "body": [
        {
          "heading": "Start with the intended workflow",
          "paragraphs": [
            "Give developers a local diagnostics and interaction surface during evaluation.",
            "The agent REPL exposes session commands for model selection, profile and status inspection, context, history and reset. The diagnostics dashboard supports panes and deterministic one-shot output. A session-local SEA preference does not by itself prove durable evidence retrieval occurred."
          ]
        },
        {
          "heading": "Local entry points",
          "paragraphs": [
            "Run from the ABI checkout with the CLI built and available on PATH. Use disposable data for evaluation; do not connect a test to a live memory store."
          ],
          "code": [
            {
              "lang": "sh",
              "code": "ABI_WDBX_PERSIST=0 abi dashboard --pane system --once --json\nABI_WDBX_PERSIST=0 abi agent tui"
            }
          ]
        },
        {
          "heading": "Acceptance and limits",
          "paragraphs": [
            "Use one-shot diagnostics in automation and a terminal for interactive acceptance. Confirm the displayed data source and fallback disclosures before interpreting a pane as an observation of a live service.",
            "Interactive editing and refresh require a supported terminal.",
            "A dashboard view is not a production health certification or proof of provider execution."
          ]
        },
        {
          "heading": "Automated and interactive checks",
          "paragraphs": [
            "One-shot output is suitable for a captured diagnostics check; interactive acceptance should use a real terminal. The redirected REPL example inspects help, status and context, then exits without a generation prompt. Persistence is disabled for this example, so it cannot be mistaken for evidence of stored learning."
          ],
          "code": [
            {
              "lang": "sh",
              "code": "ABI_WDBX_PERSIST=0 abi agent tui <<'REPL'\n/help\n/status\n/context\n/quit\nREPL"
            }
          ]
        },
        {
          "heading": "Read the session boundaries",
          "paragraphs": [
            "The diagnostics panes cover system, plugins, storage/WDBX, scheduler and memory. The REPL has a separate command surface for the current session. Changing a model label does not establish that a provider model executed; local generation remains subject to its disclosed completion route. The SEA toggle is a session preference, while durable evidence behavior belongs to the separate configured retrieval path. Context and history are bounded views, not a complete transcript of all earlier work."
          ]
        },
        {
          "heading": "Acceptance for operators",
          "paragraphs": [
            "Verify pane navigation, help discoverability, exit behavior and restoration of terminal modes after normal exit or interruption. Compare a one-shot JSON report with the visible pane while noting differing refresh times and declared data sources. Exercise a narrow terminal and redirected input so an interactive assumption does not break automation. Check that errors remain readable and that a missing backend is disclosed as fallback or unavailable. These interface checks establish usability of the local surface; operational health and provider acceptance remain separate observations."
          ]
        }
      ]
    }
  ]
};
