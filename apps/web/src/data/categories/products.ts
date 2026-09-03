import type { Products } from '../schemas';

// Product deep-dive narratives ported from the MLAI mega-site export.
// Claims discipline: equations describe the DESIGN of the routing/persona
// architecture (verifiable against the abi repo), not measured benchmarks.
// Anything aspirational is framed as design intent, never as a result.
export const products: Products = ([
  {
    slug: "abi",
    kicker: "Multi-Persona AI Framework",
    name: "ABI Framework",
    intro:
      "Local AI orchestration with inspectable memory. Instead of one brain switching contexts, ABI routes each interaction through specialized personas — Abbey, Aviva, Abi — and says what the ledger can prove.",
    accent: "aviva",
    sections: [
      {
        eyebrow: "Routing",
        title: "The mathematics of orchestration",
        paragraphs: [],
        equations: [
          {
            tex: "P(p \\mid I, C) = \\mathrm{softmax}\\big( f_\\theta(I, C) \\big)",
            note: "Abi classifies intent and sentiment over input I and context C, scoring each persona.",
          },
          {
            tex: "R_{\\text{final}} = \\alpha \\cdot R_{\\text{Abbey}} + (1 - \\alpha) \\cdot R_{\\text{Aviva}}",
            note: "Routing isn't binary — Abi blends. High α leans empathetic and scaffolded; low α leans concise and unfiltered; in between, a factual core is wrapped in an empathetic voice.",
          },
        ],
        // `Product.tsx` states that the per-row color IS the key linking each α
        // band to the persona it selects, so these accents are load-bearing and
        // were off by one: the "Pure Aviva" band rendered in Abi's cyan, telling
        // the reader that α < 0.2 routes to the moderator. The blend band names
        // no single persona — it is the one Abi produces — so it takes Abi's
        // accent, which also frees Aviva's for the band that actually is Aviva.
        blendTable: [
          { range: "α > 0.8", meaning: "Pure Abbey — empathetic, scaffolded", accent: "abbey" },
          { range: "0.2 ≤ α ≤ 0.8", meaning: "Blend — Aviva's facts, Abbey's voice, mixed by Abi", accent: "abi" },
          { range: "α < 0.2", meaning: "Pure Aviva — concise, unfiltered", accent: "aviva" },
        ],
      },
      {
        eyebrow: "Try it",
        title: "Watch Abi route in real time",
        sub: "Type a message — an illustrative keyword-sentiment heuristic scores the blend coefficient α. The production router uses a learned classifier; this demo shows the concept, not the model.",
        paragraphs: [],
        demo: "persona-router",
      },
      {
        eyebrow: "Neural mechanism",
        title: "Steering attention, not swapping weights",
        paragraphs: [],
        equations: [
          {
            tex: "\\mathrm{Attention}(Q, K, V) = \\mathrm{softmax}\\!\\left( \\frac{QK^\\top}{\\sqrt{d_k}} \\right) V",
            note: "Standard multi-head attention — the shared engine.",
          },
          {
            tex: "Q' = Q + z_{\\text{persona}}",
            note: "A persona-embedding token shifts the query Q — rotating it toward empathetic keys (Abbey) or factual keys (Aviva). One model, many voices, no reload cost. This is the design mechanism; per-persona quality is evaluated, not assumed.",
          },
        ],
      },
      {
        eyebrow: "The trifecta",
        title: "Three specialized minds",
        paragraphs: [],
        pillars: [
          {
            title: "Abbey — Empathic Polymath",
            description: "High-EQ tutor and partner, tuned toward empathetic dialogue and scaffolded teaching.",
            eq: "L = L_{NLL} + \\lambda \\cdot L_{empathy} + L_{technical}",
            accent: "abbey",
          },
          {
            title: "Aviva — Unfiltered Expert",
            description: "High-IQ, low-latency by design. Strips hedges and preambles; generating fewer tokens is the efficiency lever.",
            eq: "L = L_{factual} + \\gamma \\cdot L_{directness}",
            accent: "aviva",
          },
          {
            title: "Abi — Adaptive Moderator",
            description: "The gateway: classifies intent, moderates content, routes and blends. The system's regulatory firewall.",
            eq: "L = L_{moderation} + \\delta \\cdot L_{sentiment}",
            accent: "abi",
          },
        ],
      },
      {
        eyebrow: "Safety",
        title: "Bias, quantified",
        paragraphs: [],
        equations: [
          {
            tex: "\\mathrm{Score}_{bias} = \\frac{1}{n} \\sum_{i=1}^{n} |B_i|",
            note: "Abi measures bias across n protected attributes. Exceed the threshold and the response is rejected, regenerated, or post-filtered — a gate in the response path, not an after-the-fact report.",
          },
        ],
      },
      {
        eyebrow: "Acceleration",
        title: "Hardware backends",
        sub: "Compute targets of the Zig runtime. CPU/SIMD, Metal, CUDA, and Vulkan paths exist in the abi repo today; further backends are roadmap.",
        paragraphs: [],
        chips: ["CPU / SIMD", "Metal", "CUDA", "Vulkan"],
      },
    ],
  },
  {
    slug: "abbey",
    kicker: "Intelligence Without Limits",
    name: "Abbey",
    intro:
      "Intelligence Without Limits — with a claims ledger. Abbey is your companion for routing, memory, and calm ops help: personas that say what they know and what they don't. No AGI claims, no unverified benchmarks, no Quesar features dressed up as the bot.",
    accent: "abbey",
    sections: [
      {
        eyebrow: "Specialty",
        title: "Human-centric qualities in technical discourse",
        paragraphs: [],
        pillars: [
          {
            title: "Persona routing",
            description: "Routes each turn through Abbey, Aviva, or Abi with an inspectable reason — so the voice matches the job and the handoff is a trace event, not a guess.",
            accent: "abbey",
          },
          {
            title: "Durable memory",
            description: "Remembers facts and channel context with permission, on namespace-scoped stores you can inspect — rapport without opaque black-box recall.",
            accent: "abbey",
          },
          {
            title: "Ops with guardrails",
            description: "Calm ops help that names uncertainty, defers when policy says so, and never claims unlimited capability, AGI, unverified benchmarks, or NYX/Quesar as bot features.",
            accent: "abbey",
          },
        ],
      },
      {
        eyebrow: "The Abbey cognitive loop",
        title: "How empathy is operationalized",
        paragraphs: [],
        steps: [
          {
            n: "01",
            title: "Sentiment & frustration detection",
            description: "Input from Abi is evaluated for emotional state, prior knowledge, and subject complexity. A high frustration score triggers the Scaffolding Protocol.",
          },
          {
            n: "02",
            title: "The Scaffolding Protocol",
            description: "A tiered explanation: a high-level metaphor first → the precise technical answer → suggested pathways for deeper exploration.",
          },
          {
            n: "03",
            title: "Metaphorical Mapping Engine",
            description: "Finds the most conceptually parallel non-technical domain (e.g. music theory for distributed systems). Measured by conceptual isomorphism — structural similarity, not factual overlap.",
          },
          {
            n: "04",
            title: "Dynamic visual aid",
            description: "The mapping becomes a generative-image prompt, producing a visual anchor that encapsulates the core concept.",
          },
        ],
      },
      {
        eyebrow: "Operational pillars",
        title: "What sets Abbey apart",
        paragraphs: [],
        pillars: [
          {
            title: "Confident & theoretical",
            description: "Encouraged to form and share well-reasoned opinions and engage 'what-if' ideas — human-like, not merely a fact reporter.",
            accent: "abbey",
          },
          {
            title: "Unwavering technical rigor",
            description: "Meticulous code analysis and completion with validation in the loop, so answers are checked rather than assumed.",
            accent: "abbey",
          },
          {
            title: "Perpetual student",
            description: "Designed to research live sources when a query exceeds internal knowledge, and to validate sources before responding.",
            accent: "abbey",
          },
          {
            title: "Deep personalization",
            description: "Recalls and synthesizes prior conversations (with permission) to build genuine, long-term rapport.",
            accent: "abbey",
          },
        ],
      },
      {
        eyebrow: "Foundation",
        title: "Backed by WDBX",
        paragraphs: [
          "Abbey's memory and persona voices ride on WDBX. Per-channel vectors are stored with namespace-scoped isolation, and persona-token injection dynamically shapes the shared core into Abbey, Aviva, or Abi — designed so switching voices carries no reload cost, preserving the responsiveness a real-time partner demands.",
        ],
      },
    ],
  },
]);
