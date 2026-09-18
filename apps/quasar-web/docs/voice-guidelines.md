# MLAI Voice & Tone Guidelines

> Canonical **written-voice** reference for MLAI Corporation copy (site, docs, blog,
> research, product). For the **visual** side — palette, type, persona colors — see
> [design-resources.md](./design-resources.md). This document consolidates rules that
> already live in the repo; it does not invent new ones. Sources are cited inline so the
> guide stays verifiable.

## Voice in one line

> **Care first. Clarity always. Competence throughout.**

The motto is the voice. Every piece of copy should be defensible against all three at once.
(Source: [docs/master-reference.md](./master-reference.md); rendered with its gloss in
[src/views/Docs.tsx](../src/views/Docs.tsx).)

### Care first
Read the reader's goal and state before reaching for the answer; meet them where they are;
never condescend.
- **Do:** open with the reader's problem, name what they're trying to get done.
- **Don't:** lead with our cleverness, or soften everything into reassurance. *"Care first
  doesn't mean softening everything"* — it means telling people plainly what's true.

### Clarity always
Explain the *why*, not just the *what*; teach rather than dictate; keep jargon in service of
understanding.
- **Do:** define a term the first time it earns its place ("the Weighted Directed Backtrace
  eXecution engine is a retrieval and orchestration pattern that keeps context as weighted
  paths").
- **Don't:** stack acronyms the reader can't unpack, or assert behavior without saying how it
  works.

### Competence throughout
Broad technical range, paired with the honesty to name uncertainty and defer to review
instead of bluffing.
- **Do:** state the boundary — "where confidence dropped," "in-process today; networked is
  proposed."
- **Don't:** imply maturity, scale, or results we can't show. Bluffing fails *Competence*,
  not just *Care*.

## Per-persona voice

The three personas are also three writing registers. Match the register to the surface, and
use the canonical persona color when copy is attributed (Abbey emerald, Aviva violet, Abi
cyan — see [design-resources.md](./design-resources.md)). (Sources:
[team.ts](../src/data/categories/team.ts), [products.ts](../src/data/categories/products.ts),
[src/film/neural-voice.ts](../src/film/neural-voice.ts).)

| Persona | Register | Use for | Hallmarks |
|---|---|---|---|
| **Abbey** — empathetic polymath | Warm, precise, never condescending | onboarding, explainers, blog, support-facing copy | explains the *why*; scaffolds; says "I'm not sure" instead of bluffing |
| **Aviva** — direct expert | Direct, dense, exploratory | research papers, deep technical docs, architecture notes | states the model plainly; "not a black box"; **proposes, never executes on its own** |
| **Abi** — adaptive moderator | Concise, policy-aware | UI microcopy, governance/console, routing/status | mediates and routes; acts only once a plan clears review |

**Blend rule (α):** `α > 0.8` → pure Abbey; `0.2 ≤ α ≤ 0.8` → blend (Aviva's facts in
Abbey's voice); `α < 0.2` → pure Aviva. Default marketing/site copy sits in the blend:
Aviva's substance, Abbey's delivery.

### Voice exemplars (real copy)
- **Abbey** ([blog.ts](../src/data/categories/blog.ts), "On Saying 'I'm Not Sure'"):
  *"…telling you plainly what I do know, where the gap is, and what would close it — a source
  to check, a question to answer, or a review step before anyone acts on it."*
- **Aviva** ([research.ts](../src/data/categories/research.ts)):
  *"WDBX is the durable memory store underneath the ABI runtime. It is designed so that
  retrieval is not a black box: every record carries provenance… so the behaviour of the
  store can be reasoned about rather than inferred from outputs."*
- **Blend** ([about.ts](../src/data/categories/about.ts)):
  *"We design autonomy around bounded execution, explicit approvals, and measurable failure
  modes before expanding capability or throughput."*

## Claims discipline (non-negotiable)

External copy must not overstate capability. This mirrors the `abi` repo's
`docs/contracts/external-claims-audit.mdx` and the rule in [CLAUDE.md](../CLAUDE.md).

**Never state without a linked repo artifact proving it:**
- Specific QPS / latency / accuracy / energy / model-benchmark numbers
- Distributed sharding, clustering, replication, high-availability
- AES / RBAC / SSO specifics, compliance, certifications
- Customers, partners, team members, integrations, revenue, funding, uptime, production scale
- Stacks/features that don't exist in the code

**Instead:**
- Omit performance numbers until a reproducible repository harness, workload,
  hardware description, raw output, and methodology exist. A target label does
  not substitute for that evidence.
- Keep provenance tags distinct and never conflated: **● measured / ○ target / ◆ reported**.
- Ground claims in verifiable architecture: the real `abi` CLI, the MCP tools, WDBX stores,
  and Abbey/Aviva/Abi persona routing.
- MLAI is **founder-led** — list only Donald on team/leadership copy unless an artifact says
  otherwise.

### Before → after
> ❌ *"WDBX delivers 16,500 QPS with AES-256 encryption at rest."*
> ✅ *"WDBX implements layered HNSW retrieval, durable recovery, MVCC history,
> and a chained local audit trail; performance remains unpublished pending a
> reproducible benchmark artifact."*

## Quick do / don't

| Do | Don't |
|---|---|
| Lead with the reader's job | Lead with our cleverness |
| Explain the *why* | Assert the *what* alone |
| Name uncertainty and review steps | Bluff past the gap |
| Tag metrics as targets/goals + workload | State raw performance numbers as fact |
| Ground in shipped architecture | Imply scale, security, or traction we can't show |
| Define jargon when it earns its place | Stack unexplained acronyms |

## Where the truth lives
- **Motto + principles:** [master-reference.md](./master-reference.md),
  [src/views/Docs.tsx](../src/views/Docs.tsx)
- **Personas:** [team.ts](../src/data/categories/team.ts),
  [products.ts](../src/data/categories/products.ts),
  [src/film/neural-voice.ts](../src/film/neural-voice.ts)
- **Claims policy:** [CLAUDE.md](../CLAUDE.md),
  [stats.ts](../src/data/categories/stats.ts)
- **Live exemplars:** [blog.ts](../src/data/categories/blog.ts),
  [research.ts](../src/data/categories/research.ts)
- **Visual brand:** [design-resources.md](./design-resources.md)
