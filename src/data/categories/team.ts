import { TeamSchema, type Team } from '../schemas';

export const team: Team = TeamSchema.parse([
  {
    name: "Donald Filimon",
    role: "Founder & Systems Architect",
    slug: "donald-filimon",
    location: "United States",
    image: "https://avatars.githubusercontent.com/u/64335640?v=4",
    tagline:
      "Building privacy-first AI infrastructure — durable memory, traceable retrieval, and bounded autonomy — close to the metal across Zig, Rust, and Swift.",
    bio: "Builds privacy-first AI infrastructure, developer tools, and high-performance systems across Zig, Rust, Swift, TypeScript, and GPU-oriented runtimes. Leads WDBX retrieval, the Abbey–Aviva–Abi orchestration framework, and the ABI runtime.",
    socials: {
      github: "donaldfilimon",
      x: "donaldfilimonx",
      web: "donaldfilimon.com",
    },
    focusAreas: [
      {
        title: "Privacy-first AI infrastructure",
        description:
          "Architectures shaped for on-premise, VPC, hybrid, and edge deployment, where data residency and auditability cannot be compromised.",
      },
      {
        title: "Vector & memory systems",
        description:
          "WDBX — durable vector/block stores for traceable retrieval and long-lived agent memory, implemented across several languages.",
      },
      {
        title: "Polyglot systems engineering",
        description:
          "Working close to the metal across Zig, Rust, Swift, and TypeScript: databases, GPU-oriented runtimes, CLIs, and developer tooling.",
      },
      {
        title: "Agent orchestration & safety",
        description:
          "The ABI runtime and the Abbey–Aviva–Abi persona system for bounded, observable autonomy with explicit operator control.",
      },
    ],
    projects: [
      {
        name: "abi",
        description:
          "An AI agent runtime paired with the WDBX vector database — high-performance local AI/ML orchestration in Zig, with GPU capability reporting and an MCP server.",
        url: "https://github.com/donaldfilimon/abi",
        lang: "Zig",
      },
      {
        name: "WDBX",
        description:
          "A durable vector/block memory store for traceable retrieval and agent memory, with implementations spanning Zig, Rust, Python, and TypeScript.",
        url: "https://github.com/donaldfilimon/wdbx_python",
        lang: "Zig · Rust · Py",
      },
      {
        name: "gama",
        description:
          "A Swift + MLX framework for on-device language-model inference on Apple Silicon, including a self-learning agent.",
        url: "https://github.com/donaldfilimon/gama",
        lang: "Swift",
      },
      {
        name: "mlaix-app",
        description:
          "MLAI's Swift application surface for on-device AI experiences.",
        url: "https://github.com/donaldfilimon/mlaix-app",
        lang: "Swift",
      },
      {
        name: "Nyon",
        description:
          "A voxel 3D world experiment exploring a novel hexa-gravity system and creator-first game development.",
        url: "https://github.com/donaldfilimon/nyon-game",
        lang: "Zig",
      },
    ],
    body: [
      {
        heading: "Building close to the metal",
        paragraphs: [
          "Donald is a polyglot systems engineer who works deliberately low in the stack. His public projects span Zig, Rust, Swift, TypeScript, and Python — databases, GPU-oriented runtimes, agent frameworks, and the tooling that holds them together — because the guarantees MLAI cares about (latency, provenance, data residency) are won or lost at that level.",
          "That range is intentional, not scattered. Each language is chosen for where it pays off: Zig for the performance-critical core of the ABI runtime and WDBX, Rust for safe systems surfaces, Swift and MLX for on-device inference on Apple Silicon, and TypeScript for the operator-facing layers.",
        ],
      },
      {
        heading: "Memory you can trace",
        paragraphs: [
          "The throughline across his work is WDBX — a durable vector and block memory store designed so retrieval is traceable rather than opaque. The ABI runtime plans queries and assembles context packs on top of it, and the same store backs the long-lived memory that agents reason over.",
          "The design commitment is simple to state and hard to honor: no retrieval claim without a traceable source or confidence signal. That principle is what makes the infrastructure suitable for private, audited deployments instead of demos.",
        ],
      },
      {
        heading: "Autonomy with a boundary",
        paragraphs: [
          "On top of retrieval sits the Abbey–Aviva–Abi persona system — Abbey the empathetic polymath, Aviva the direct expert, and Abi the adaptive router — operating under one motto: \"Care first. Clarity always. Competence throughout.\"",
          "The orchestration is built around bounded execution and explicit approvals: no autonomous write action without an observable policy boundary, and escalation, review, and override flows kept visible so the people responsible stay in control. Safety before scale is the founding constraint, not a later addition.",
        ],
      },
    ],
  },
]);
