import { BlogSchema, type Blog } from '../schemas';

export const blog: Blog = BlogSchema.parse([
  {
    slug: "on-saying-im-not-sure",
    tag: "FROM ABBEY",
    title: "On Saying “I'm Not Sure”",
    excerpt:
      "A note in Abbey's voice — the empathetic-polymath persona — on why an honest “I don't know” is one of the most useful things an agent can say.",
    date: "June 8, 2026",
    readTime: "4 min read",
    author: "Abbey",
    body: [
      {
        paragraphs: [
          "This note is written in Abbey's voice — the empathetic-polymath persona in the Abbey–Aviva–Abi framework — as a small, deliberate demonstration of the tone we build toward. I'm not narrating a product launch here; I'm showing you how the framework is meant to sound when it talks to a person.",
          "So let me start with the two words I'm most often thanked for, and most often expected to avoid: “I'm not sure.”",
        ],
      },
      {
        heading: "Uncertainty is information, not failure",
        paragraphs: [
          "When the evidence behind an answer is thin — few sources, weak support, or two retrieved paths that quietly disagree — the honest move is to say so. A confident-sounding guess in that moment isn't helpfulness; it's a liability dressed up as competence.",
          "The framework is built so that confidence is something you can read off the retrieval structure rather than a number I make up about myself. When that signal is low, “I'm not sure” is the correct output, and surfacing it is the most respectful thing I can do with your attention.",
        ],
      },
      {
        heading: "What care looks like here",
        paragraphs: [
          "Care first doesn't mean softening everything. It means meeting you where you are: telling you plainly what I do know, where the gap is, and what would close it — a source to check, a question to answer, or a review step before anyone acts on it.",
        ],
        list: [
          "Name the gap instead of papering over it.",
          "Offer the part I can stand behind, clearly separated from the part I can't.",
          "Hand off rather than bluff — route to review (that's Abi's job) before an uncertain answer becomes an action.",
        ],
      },
      {
        heading: "Clarity, then competence",
        paragraphs: [
          "Competence isn't knowing everything; it's knowing the edges of what you know and being useful right up to them. If this note reads as warm and precise at the same time, that's the whole point — care first, clarity always, competence throughout. It's easier to trust a system that tells you when to trust it.",
        ],
      },
    ],
  },
  {
    slug: "inside-wdbx-hybrid-ranker",
    tag: "ENGINEERING",
    title: "Inside the WDBX Hybrid Ranker: Four Factors, One Score",
    excerpt:
      "Semantic similarity is only the first of four factors. Here is the exact score WDBX uses to rank retrieval candidates — and why every factor is bounded to [0,1].",
    date: "June 6, 2026",
    readTime: "8 min read",
    author: "MLAI Research · WDBX Core",
    body: [
      {
        paragraphs: [
          "Plain top-k vector search answers one question: what is closest to the query in embedding space? That is a fine question, and a poor stopping point. A record can be a near-perfect semantic match and still be the wrong thing to retrieve — because it is two years stale, because it sits far from the query in the causal graph, or because the active persona should not be weighting it heavily.",
          "The WDBX hybrid ranker, which companions our paper on the weighted-backtrace store, answers the harder question by combining four independent factors into a single bounded score. This note walks through that score the way you would read it during an incident review.",
        ],
      },
      {
        heading: "The four factors",
        paragraphs: [
          "Every candidate j is ranked by the product of four terms, each living in the unit interval. Because they multiply, any one factor collapsing toward zero pulls the whole score down — there is no averaging away a fatal weakness:",
        ],
        math: ["s_{ij} \\;=\\; \\sigma_j \\,\\cdot\\, \\tau_j \\,\\cdot\\, \\gamma_j \\,\\cdot\\, \\pi_j"],
        list: [
          "σ — semantic similarity (cosine distance between query and candidate, via a SIMD path with a deterministic CPU fallback).",
          "τ — temporal weight (exponential recency decay).",
          "γ — causal weight (proximity along the backtrace graph).",
          "π — persona weight, supplied by the router for the active profile.",
        ],
      },
      {
        heading: "Recency and relatedness, written down",
        paragraphs: [
          "Recency is an exponential half-life decay: a record's temporal weight halves every t½, clamped so future-dated records cannot exceed one. Causal weight decays with the number of graph hops h between the query focus and the candidate, but bottoms out at a floor so unrelated records are down-weighted, not erased:",
        ],
        math: [
          "\\tau_j \\;=\\; \\max\\!\\Big(0,\\ \\min\\!\\big(1,\\ 2^{-(t_0 - t_j)/t_{1/2}}\\big)\\Big)",
          "\\gamma_j \\;=\\; \\max\\!\\big(c_{\\mathrm{floor}},\\ c_{\\mathrm{decay}}^{\\,h_j}\\big), \\qquad c_{\\mathrm{decay}} = 0.6,\\ c_{\\mathrm{floor}} = 0.25",
        ],
      },
      {
        heading: "Why a product beats a weighted sum",
        paragraphs: [
          "A weighted sum lets a high score on one axis paper over a near-zero on another — exactly the failure that produces confident, stale, off-topic retrievals. The product makes each factor a veto: low semantic support, ancient timestamps, or distant causal paths each independently sink the rank. That is the behaviour you want from a store whose whole point is to be defensible after the fact.",
          "And because the factors are stored alongside the rank, the ranker is its own explanation. You never have to reconstruct why a record surfaced — the four numbers that decided it are right there in the trace.",
        ],
      },
    ],
  },
  {
    slug: "what-the-model-sees-sea",
    tag: "RESEARCH",
    title: "How Sparse Evidence Attention Decides What the Model Sees",
    excerpt:
      "Before a model reasons, something must choose which records reach the context window. SEA scores eight criteria, then packs greedily under a hard token budget.",
    date: "June 4, 2026",
    readTime: "7 min read",
    author: "MLAI Research · Abbey",
    body: [
      {
        paragraphs: [
          "A bigger context window does not remove the decision of what to put in it; it raises the cost of deciding badly. Sparse Evidence Attention (SEA) is the layer that chooses which durable records become part of a context pack. It is deliberately not a single similarity sort — it scores eight heterogeneous criteria so that a record which is strong on one axis but weak on another is caught.",
        ],
      },
      {
        heading: "Eight criteria, one weighted score",
        paragraphs: [
          "Each candidate c is scored on semantic similarity, keyword overlap, metadata fit, recency, source authority, graph connectivity, an explicit contradiction flag, and task-fit. The eight scores combine under a fixed weight vector, clamped to the unit interval — most mass on semantics, but never enough for one criterion to dominate:",
        ],
        math: [
          "\\mathrm{score}(c) \\;=\\; \\mathrm{clamp}_{[0,1]}\\!\\Big(\\textstyle\\sum_{i} w_i\\, s_i(c)\\Big)",
          "w \\;=\\; (0.30,\\ 0.15,\\ 0.15,\\ 0.10,\\ 0.10,\\ 0.10,\\ 0.05,\\ 0.05)",
        ],
      },
      {
        heading: "Packing under a hard budget",
        paragraphs: [
          "Scoring ranks the candidates; selection respects the window. SEA admits records greedily by score, but rejects any that would exceed the token budget B or violate a per-cluster diversity cap. Token cost is estimated from length, and the budget is a hard ceiling — the pack never overflows:",
        ],
        math: [
          "\\mathrm{tok}(x) = \\max\\!\\big(1,\\ \\lceil |x|/4 \\rceil\\big), \\qquad \\sum_{c \\in S} \\mathrm{tok}(c) \\;\\le\\; B",
        ],
      },
      {
        heading: "Auditable by construction",
        paragraphs: [
          "SEA returns the rejected set and the reason each candidate was dropped — budget, diversity, or score — alongside the selection. That turns context assembly into something an operator can review: you can see why a record that 'should' have been included was not. Naive top-k stuffing cannot answer that, because it never made the decision explicit.",
        ],
      },
    ],
  },
  {
    slug: "weights-behind-the-personas",
    tag: "SAFETY",
    title: "The Weights Behind Abbey, Aviva, and Abi",
    excerpt:
      "Persona routing is not a hidden model call. It is a normalized weight vector with hard policy overrides and an inspectable strategy decision.",
    date: "June 2, 2026",
    readTime: "6 min read",
    author: "MLAI Safety Engineering",
    body: [
      {
        paragraphs: [
          "The Abbey–Aviva–Abi system routes each request to a persona — Abbey the empathetic polymath, Aviva the direct expert, Abi the adaptive moderator. The important property is not which persona answers; it is that the choice is a transparent, weight-based decision rather than an opaque model call. Every routing decision is itself a trace event you can read.",
        ],
      },
      {
        heading: "From signals to weights",
        paragraphs: [
          "Routing starts from a baseline weight per persona and adjusts it from inspectable input signals — task keywords, emotional cues, and policy risk. The adjusted weights are normalized to a distribution, and the highest becomes the primary; its share is the routing confidence:",
        ],
        math: [
          "w'_i \\;=\\; \\frac{\\max(0,\\ w_i)}{\\sum_j \\max(0,\\ w_j)}, \\qquad \\mathrm{primary} = \\arg\\max_i\\, w'_i",
        ],
      },
      {
        heading: "One, several, or all three",
        paragraphs: [
          "The confidence then selects a strategy. A clear winner runs a single persona; a contested decision runs personas in parallel; a genuinely split one escalates to consensus. The thresholds are explicit, so an operator can see why a request fanned out instead of resolving to one voice:",
        ],
        math: [
          "\\mathrm{strategy} = \\begin{cases} \\textsf{single} & w'_{\\max} > 0.90 \\\\ \\textsf{parallel} & 0.50 \\le w'_{\\max} \\le 0.90 \\\\ \\textsf{consensus} & w'_{\\max} < 0.50 \\end{cases}",
        ],
      },
      {
        heading: "Policy wins, always",
        paragraphs: [
          "Signals nudge the weights; policy overrides them. When the control plane flags risk, weight shifts hard toward Abi, the moderating profile — and a disallowed action collapses the distribution to Abi outright, regardless of how the keywords scored. \"No autonomous write without an observable policy boundary\" is enforced here as arithmetic, not etiquette.",
        ],
      },
    ],
  },
  {
    slug: "explainable-last-move",
    tag: "FIELD NOTE",
    title: "Designing AI Systems That Can Explain Their Last Move",
    excerpt:
      "A practical guide to capturing retrieval paths, policy checks, and operator decisions so teams can debug autonomous workflows after the fact.",
    date: "May 21, 2026",
    readTime: "7 min read",
    author: "MLAI Engineering",
    body: [
      {
        paragraphs: [
          "When an autonomous workflow does something surprising in production, the first question is never \"what is the model?\" It is \"what just happened?\" Most AI stacks cannot answer that question, because the only durable artifact they keep is the final response. The retrieval that fed it, the policy checks that passed, the tool calls that fired, and the operator who approved the run are all gone by the time anyone goes looking.",
          "MLAI's Trace Layer is built around the opposite default: every orchestration step emits an inspectable event before it is allowed to change state. The trace is the system of record, not a debug log you remember to turn on.",
        ],
      },
      {
        heading: "What a trace actually contains",
        paragraphs: [
          "A complete trace for a single agent run reconstructs the decision without re-running it. In the ABI runtime that means the captured events cover the full causal chain:",
        ],
        list: [
          "Retrieval paths — which records were pulled from WDBX, their source metadata, and the weighted backtrace that connected them to the query.",
          "Policy checks — every control-plane gate that was evaluated, with the inputs it saw and the pass/abstain/deny result.",
          "Model decisions — the profile that was selected (Abbey, Aviva, or Abi), the routing weights that selected it, and the completion that came back.",
          "Tool calls — the connector invoked (OpenAI, Anthropic, Discord, Twilio, HTTP), the validated arguments, and the response envelope.",
          "Operator interventions — any human approval, override, or escalation that changed the run, with who and when.",
        ],
      },
      {
        heading: "Why provenance has to be weighted",
        paragraphs: [
          "Flat citation lists tell you which sources were available, not which ones carried the answer. WDBX keeps context as weighted directed paths, so a trace can show not only that a record was retrieved but how strongly it influenced the result and where confidence dropped along the chain. That distinction is what turns an incident review from speculation into reconstruction.",
          "It also makes rollback meaningful. If a retrieval path is later found to be poisoned or stale, you can walk the graph forward to every downstream decision that depended on it instead of guessing at blast radius.",
        ],
      },
      {
        heading: "Designing for the review you will eventually run",
        paragraphs: [
          "The practical discipline is to treat the post-incident review as a first-class consumer of your architecture from day one. If you cannot answer \"why did the agent take its last move\" from durable artifacts alone — without re-prompting the model and hoping for the same output — the trace is incomplete.",
          "Our operating principle here is blunt: no autonomous write action without an observable policy boundary, and no retrieval claim without a traceable source or confidence signal. Everything in the Trace Layer exists to keep those two promises auditable months after the run.",
        ],
      },
    ],
  },
  {
    slug: "production-ready-agent-metrics",
    tag: "ENGINEERING",
    title: "What We Measure Before Calling an Agent Production-Ready",
    excerpt:
      "Latency and accuracy are not enough. We track tool-boundary violations, source coverage, rollback paths, abstention quality, and human-review burden.",
    date: "May 18, 2026",
    readTime: "9 min read",
    author: "MLAI Safety Engineering",
    body: [
      {
        paragraphs: [
          "Latency and accuracy are the metrics that demo well, which is exactly why they are insufficient as a release gate. An agent can be fast and frequently correct while still being unsafe to deploy, because the failure modes that matter in production are the ones that do not show up in a happy-path benchmark.",
          "The Evaluation Mesh exists to turn AI quality into a release gate instead of an after-the-fact dashboard. Before we call an agent production-ready, it has to clear regression scenarios across dimensions that a single accuracy score hides.",
        ],
      },
      {
        heading: "The dimensions we gate on",
        paragraphs: [
          "Each of these runs as a repeatable scenario suite, not a one-time audit. A change to a prompt, a tool permission, or a retrieval index re-runs the full mesh.",
        ],
        list: [
          "Tool-boundary violations — did the agent attempt an action outside its granted permissions, even if the attempt was blocked?",
          "Source coverage — what fraction of factual claims trace back to a retrieved record versus model memory?",
          "Rollback paths — for every write action, can we reconstruct and reverse it from trace artifacts alone?",
          "Abstention quality — when the agent should have said \"I don't know\" or escalated, did it? Confident wrong answers are scored worse than honest abstentions.",
          "Prompt-injection resilience — does adversarial content in retrieved documents or user input change the agent's permissions or goals?",
          "Human-review burden — how many runs require an operator, and is that number trending toward fatigue?",
        ],
      },
      {
        heading: "Abstention is a feature, not a failure",
        paragraphs: [
          "Most evaluation harnesses penalize a model for not answering. We invert that for high-stakes workflows. An agent that abstains and escalates when retrieval confidence is low is behaving correctly; an agent that fabricates a plausible answer under the same conditions has failed the gate, regardless of how often it is right elsewhere.",
          "This is why the persona split matters operationally. Abbey's analytical, safety-oriented review can flag a low-confidence retrieval before Abi's action-oriented execution profile ever touches production data.",
        ],
      },
      {
        heading: "Review burden as a leading indicator",
        paragraphs: [
          "The metric teams most often forget is the one that predicts whether their controls will survive contact with reality: human-review burden. If every run needs a human, the system does not scale. If no run needs a human, the gates are probably theater. We track the ratio over time and treat a sharp move in either direction as a signal that the control plane needs retuning, not just the model.",
        ],
      },
    ],
  },
  {
    slug: "vector-search-to-backtrace-graphs",
    tag: "RESEARCH",
    title: "From Vector Search to Weighted Backtrace Graphs",
    excerpt:
      "Why retrieval infrastructure needs relationship-aware context and why ranking alone is not sufficient for high-stakes answer generation.",
    date: "May 12, 2026",
    readTime: "12 min read",
    author: "MLAI Research",
    body: [
      {
        paragraphs: [
          "Vector search answers a narrow question well: which records are nearest to this query in embedding space? For a lot of retrieval-augmented generation, that is enough. For high-stakes answer generation — where a wrong citation is a liability, not an inconvenience — nearest-neighbor ranking alone leaves too much unsaid.",
          "WDBX, the Weighted Directed Backtrace eXecution engine, is our answer to what ranking leaves out. It keeps retrieval context as weighted paths so a system can inspect why a result was produced, which sources were used, and where confidence dropped.",
        ],
      },
      {
        heading: "What ranking cannot tell you",
        paragraphs: [
          "A ranked list gives you the top-k records and a similarity score. It does not tell you whether two of those records contradict each other, whether the third was only retrieved because it shares boilerplate with the query, or whether the answer actually depended on the record ranked seventh. In an audit, \"the model saw these ten documents\" is not the same claim as \"the answer rests on these two.\"",
          "Backtrace graphs make the dependency explicit. Each retrieved record is a node; edges carry weights that reflect how strongly a record contributed to the generated answer, and the graph preserves the path from query to claim.",
        ],
      },
      {
        heading: "Confidence as a graph property",
        paragraphs: [
          "Once retrieval is a weighted graph rather than a flat list, confidence stops being a single scalar bolted onto the response. It becomes a property you can read off the structure: source coverage, graph distance from query to supporting evidence, and contradiction between paths all become measurable signals. Combining them gives operators a confidence band they can actually reason about instead of a number with no provenance.",
        ],
      },
      {
        heading: "Durable, inspectable, portable",
        paragraphs: [
          "WDBX persists these structures with JSONL snapshots and integrity checks, so the graph that produced an answer last quarter can be reopened and walked today. The store exposes key-value, vector (cosine search with a SIMD path), and block/spatial surfaces, and disabled builds fail closed with explicit errors rather than silently degrading.",
          "The research bet is simple: as agents take on higher-stakes work, the retrieval layer has to carry relationships, not just neighbors. Ranking tells you what was close. Backtrace tells you what was responsible.",
        ],
      },
    ],
  },
  {
    slug: "separate-planning-review-execution",
    tag: "SAFETY",
    title: "The Case for Separate Planning, Review, and Execution Agents",
    excerpt:
      "Role separation lets teams encode checks and balances into an AI workflow instead of relying on a single agent to police itself.",
    date: "May 8, 2026",
    readTime: "8 min read",
    author: "MLAI Safety Engineering",
    body: [
      {
        paragraphs: [
          "Asking one agent to plan an action, judge whether the action is safe, and then execute it is asking it to be its own auditor. That works until it doesn't, and when it doesn't, there is no separation of duties to catch the mistake. The Abbey–Aviva–Abi framework exists to put checks and balances inside the workflow rather than hoping a single model polices itself.",
        ],
      },
      {
        heading: "Three roles, three temperaments",
        paragraphs: [
          "The framework separates creative planning, safety review, and technical execution into distinct profiles, each tuned for its job:",
        ],
        list: [
          "Aviva — the expert. Direct, creative, and exploratory, used for generating plans and alternative approaches.",
          "Abbey — the polymath. Analytical and supportive, used for structured explanation and safety-oriented review of what Aviva proposes.",
          "Abi — the moderator. Concise and action-oriented, context- and policy-aware, used to route and to execute once a plan clears review.",
        ],
      },
      {
        heading: "Why separation makes permissions tractable",
        paragraphs: [
          "When one agent does everything, its permission set is the union of every capability it might ever need — a large, hard-to-reason-about attack surface. Splitting the roles lets the control plane scope permissions per role: the planning profile can read broadly but cannot write, the review profile can block but cannot execute, and the execution profile acts only on plans that already passed a gate.",
          "Routing between profiles is deterministic and weight-based rather than a hidden model call, so the choice of role is itself an inspectable trace event. An operator can see not just what the system did, but which profile decided to do it and why.",
        ],
      },
      {
        heading: "Checks and balances as code",
        paragraphs: [
          "The point of role separation is not ceremony — it is that intervention points become explicit. There is a defined moment where review happens before execution, a defined boundary an action cannot cross without approval, and a defined place an operator can step in. \"No autonomous write action without an observable policy boundary\" is much easier to keep when the boundary is a different agent with a different mandate.",
        ],
      },
    ],
  },
  {
    slug: "calm-control-surfaces",
    tag: "PRODUCT",
    title: "Making AI Control Surfaces Feel Calm Under Pressure",
    excerpt:
      "Interface details that prevent overload: progressive disclosure, confidence bands, decision diffs, and emergency stop affordances.",
    date: "April 29, 2026",
    readTime: "6 min read",
    author: "MLAI Product",
    body: [
      {
        paragraphs: [
          "An AI control surface is judged on its worst day, not its average one. When a workflow is misbehaving and an operator has thirty seconds to understand and intervene, every design decision that optimized for looking impressive instead of being legible becomes a liability. Calm under pressure is a product requirement, not an aesthetic.",
        ],
      },
      {
        heading: "Progressive disclosure over dashboards",
        paragraphs: [
          "A wall of metrics is the opposite of clarity. The default view should answer one question — is anything wrong right now — and let the operator drill into traces, retrieval paths, and policy decisions only when they need to. The detail is always there; it is just not all shouting at once.",
        ],
      },
      {
        heading: "Confidence bands, decision diffs, and a real stop button",
        paragraphs: [
          "Three affordances do most of the work of keeping operators in control:",
        ],
        list: [
          "Confidence bands — surface the retrieval confidence and source coverage behind a decision so the operator can calibrate trust at a glance instead of treating every output as equally certain.",
          "Decision diffs — show what changed between the proposed action and the last approved state, so review is a focused comparison rather than a re-read of everything.",
          "Emergency stop — a visible, always-reachable affordance to halt autonomous execution. If stopping the system requires hunting through menus, it is not a control surface.",
        ],
      },
      {
        heading: "The goal is a human who stays in control",
        paragraphs: [
          "Human-centered control means escalation, review, and override flows stay visible so subject-matter experts remain in charge of critical outcomes. A calm interface is how that principle survives contact with a real incident. The measure of success is not how little the operator has to do on a good day — it is how confidently they can act on a bad one.",
        ],
      },
    ],
  },
  {
    slug: "incident-reviews-from-ai-logs",
    tag: "OPERATIONS",
    title: "What Incident Reviews Need From AI Logs",
    excerpt:
      "How to structure traces so teams can reconstruct context, model output, policy decisions, tool calls, and human overrides after a production event.",
    date: "April 18, 2026",
    readTime: "10 min read",
    author: "MLAI Operations",
    body: [
      {
        paragraphs: [
          "A good incident review reconstructs what happened from durable evidence. A bad one reconstructs it from memory and Slack scrollback. The difference is decided long before the incident, in how the system structures its logs — and most AI systems log for debugging, not for review.",
        ],
      },
      {
        heading: "Logs vs. traces",
        paragraphs: [
          "Conventional application logs are a stream of strings written for whoever is tailing them at the time. A trace is a structured, causal record written for whoever opens it months later. For AI workflows the review needs the second kind: events that connect query to retrieval to decision to action to outcome, each with enough context to stand alone.",
          "In practice an incident review needs to answer five questions from artifacts alone, with no re-running of the model: what context was retrieved, what the model produced, which policy decisions were evaluated, which tools were called, and where a human overrode the system.",
        ],
      },
      {
        heading: "Structure that survives the handoff",
        paragraphs: [
          "The reviewer is rarely the person who built the workflow. That means the trace has to carry its own context: source metadata on retrieved records, the routing weights behind a profile selection, the inputs a policy gate evaluated, and the identity and timestamp on every human intervention. A trace event that only makes sense to its author is a trace event that fails the review.",
        ],
      },
      {
        heading: "Private does not mean unaudited",
        paragraphs: [
          "Teams running offline or in a VPC sometimes assume that audit is something you trade away for privacy. It is the opposite. Local audit trails, release gates, and repeatable evals are exactly what make a private deployment defensible. The trace stays inside your boundary; its rigor does not have to.",
        ],
      },
    ],
  },
  {
    slug: "private-ai-is-not-invisible-ai",
    tag: "DEPLOYMENT",
    title: "Private AI Does Not Mean Invisible AI",
    excerpt:
      "Offline and VPC deployments still need measurable controls: local audit trails, release gates, repeatable evals, and operator-visible confidence signals.",
    date: "April 11, 2026",
    readTime: "8 min read",
    author: "MLAI Engineering",
    body: [
      {
        paragraphs: [
          "There is a tempting shortcut in private AI: if the data never leaves the building, surely the controls matter less. The opposite is true. A deployment that cannot send telemetry to a vendor dashboard is a deployment that has to be observable on its own terms, because no one else is watching it for you.",
        ],
      },
      {
        heading: "The same controls, inside your boundary",
        paragraphs: [
          "The Private Runtime packages LLM orchestration, retrieval, audit logs, and controls for cloud, VPC, on-premise, and offline-first deployments. The design intent is that going private subtracts nothing from observability:",
        ],
        list: [
          "Local audit trails — traces persist inside the boundary with integrity checks, not shipped to an external service.",
          "Release gates — the evaluation mesh runs against your own scenarios before changes reach production, online or air-gapped.",
          "Repeatable evals — regression suites you can run on demand without a network round-trip.",
          "Operator-visible confidence — the same retrieval confidence and source-coverage signals an operator would see in a hosted deployment.",
        ],
      },
      {
        heading: "Why teams choose this path",
        paragraphs: [
          "Private deployment is shaped for environments where data residency, network isolation, or customer policy make unmanaged infrastructure a non-starter: regulated software teams, research organizations with sensitive corpora, security and compliance teams evaluating tool-using agents, and infrastructure teams running near the edge.",
          "For those teams, \"private\" and \"auditable\" are not in tension — they are the same requirement seen from two sides. The runtime is built so you never have to choose between keeping your data and seeing what your AI did with it.",
        ],
      },
    ],
  },
]);
