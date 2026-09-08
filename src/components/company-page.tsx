import Link from "next/link";
import { ArrowRight } from "lucide-react";

const principles = [
  {
    title: "Disciplined secrecy",
    desc: "We publish benchmarks, not roadmaps. What ships speaks; what's in flight stays quiet until it's real.",
  },
  {
    title: "Mission stewardship",
    desc: "Privacy-first is an architecture decision, not a marketing position. Data never leaves the device unless the owner sends it.",
  },
  {
    title: "Operational velocity",
    desc: "Small team, systems languages, zero ceremony. We measure in p50s and ship in weeks — without inventing market multiples for this page.",
  },
] as const;

const pillars = [
  {
    title: "Evidence before projections",
    desc: "Public claims stay tied to what the stack can demonstrate in a workspace you control — not pitch-deck multiples.",
  },
  {
    title: "Privacy-first infrastructure",
    desc: "Runtime, memory, and assistant surfaces are designed so inference and indexes can stay on hardware you operate.",
  },
  {
    title: "Inspectable by default",
    desc: "Retrieval paths, model choices, and policy boundaries are meant to be visible to operators, not hidden behind a single opaque agent.",
  },
] as const;

const companyFacts = [
  { k: "Legal name", v: "Machine Learning Advanced Innovations, Inc." },
  { k: "Entity", v: "Delaware C-Corp" },
  { k: "Location", v: "Orlando, FL" },
  { k: "Languages", v: "Rust, Swift, TypeScript" },
  { k: "Model", v: "SDK licensing + integration services" },
] as const;

const projects: [string, string, string][] = [
  [
    "abi",
    "AI agent runtime + WDBX vector database — local AI/ML orchestration with GPU capability reporting and an MCP server.",
    "Rust",
  ],
  [
    "WDBX",
    "Durable vector/block memory store for traceable retrieval and agent memory.",
    "Rust · TS · Py",
  ],
  [
    "gama",
    "Swift declarative UI framework (not an MLX inference stack).",
    "Swift",
  ],
  [
    "Nyon",
    "Voxel 3D world experiment exploring a novel hexa-gravity system.",
    "Zig",
  ],
];

const hiring: [string, string, string][] = [
  ["1", "Senior Swift Engineer", "Metal / GPU, Core ML"],
  ["2", "Systems Engineer", "WDBX core, distributed"],
  ["3", "ML Engineer", "Embeddings, quantization"],
  ["4", "Developer Advocate", "Content, community"],
];

export function CompanyPage() {
  return (
    <div className="public-container marketing-page">
      <section className="marketing-hero">
        <div>
          <span className="eyeline abbey">
            Company · Delaware C-Corp · Orlando, FL
          </span>
          <h1>Why MLAI exists.</h1>
          <p className="hero-description">
            The most capable AI is also the most opaque and least private. The
            bet behind MLAI is that Apple Silicon finally makes the alternative
            practical — capable AI that runs where you can see it. WDBX for
            memory, ABI for compute, and IWL for the assistant workspace.
          </p>
          <div className="button-row">
            <Link className="button primary" href="/contact">
              Contact <ArrowRight size={18} />
            </Link>
            <Link className="button secondary" href="/research">
              Research
            </Link>
          </div>
        </div>
        <aside className="callout-card abbey">
          <strong>How we talk about progress</strong>
          <p>
            Investors and partners get evidence before projections. Numeric
            market claims (TAM, raise amounts, fabricated traction) stay off
            this site until they ship with provenance.
          </p>
        </aside>
      </section>

      <section className="split-section abbey">
        <div>
          <span className="eyeline abbey">Founder</span>
          <h2>Donald Filimon — Founder &amp; Systems Architect.</h2>
        </div>
        <div>
          <p>
            Polyglot systems engineer who works deliberately low in the stack —
            Rust, Swift, TypeScript, Python, and GPU-oriented runtimes — because
            the guarantees MLAI cares about (latency, provenance, data
            residency) are won or lost at that level.
          </p>
          <p>
            Leads WDBX retrieval, the Abbey–Aviva–Abi orchestration framework,
            and the ABI runtime across systems programming, compiler
            infrastructure, and AI development.
          </p>
          <p>
            <strong>Care first. Clarity always. Competence throughout.</strong>
          </p>
        </div>
      </section>

      <section className="system-section marketing-section">
        <div className="section-intro">
          <span className="eyeline abbey">Principles</span>
          <h2>How we operate.</h2>
        </div>
        <div className="feature-grid three">
          {principles.map((item) => (
            <article className="feature-card abbey" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="system-section marketing-section">
        <div className="section-intro">
          <span className="eyeline wdbx">What we optimize for</span>
          <h2>Evidence, privacy, inspectability.</h2>
        </div>
        <div className="feature-grid three">
          {pillars.map((item) => (
            <article className="feature-card wdbx" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="system-section marketing-section">
        <div className="section-intro">
          <span className="eyeline abbey">Facts</span>
          <h2>The company on paper.</h2>
          <p className="muted">
            Registration-level facts — not measurements. They render as
            configuration, not provenance-tagged product benchmarks.
          </p>
        </div>
        <dl className="spec-list">
          {companyFacts.map((row) => (
            <div key={row.k}>
              <dt>{row.k}</dt>
              <dd>{row.v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="system-section marketing-section">
        <div className="section-intro">
          <span className="eyeline wdbx">Open work</span>
          <h2>The projects.</h2>
          <p className="muted">Public repositories and what they are.</p>
        </div>
        <div className="table-scroll registers-table">
          <table>
            <caption>Public repositories.</caption>
            <thead>
              <tr>
                <th>Project</th>
                <th>What it is</th>
                <th>Stack</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(([name, what, stack]) => (
                <tr key={name}>
                  <td>
                    <code>{name}</code>
                  </td>
                  <td>{what}</td>
                  <td>{stack}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="system-section marketing-section">
        <div className="section-intro">
          <span className="eyeline abi">Hiring</span>
          <h2>Four seats, in order.</h2>
        </div>
        <div className="table-scroll registers-table">
          <table>
            <caption>Open roles.</caption>
            <thead>
              <tr>
                <th>#</th>
                <th>Role</th>
                <th>Focus</th>
              </tr>
            </thead>
            <tbody>
              {hiring.map(([n, role, focus]) => (
                <tr key={n}>
                  <td>{n}</td>
                  <td>{role}</td>
                  <td>{focus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="prov-note muted">
          Interested? Use{" "}
          <Link className="text-link" href="/contact">
            Contact
          </Link>{" "}
          — same inbox as deploy, pilot, partner, and invest.
        </p>
      </section>

      <nav className="next-up" aria-label="Continue reading">
        <Link className="next-up-card abi" href="/investors">
          <span className="eyeline abi">Investors</span>
          <strong>Evidence-first notes — deliberately non-numeric.</strong>
          <span>
            Read investors <ArrowRight size={16} />
          </span>
        </Link>
        <Link className="next-up-card abbey" href="/contact">
          <span className="eyeline abbey">Contact</span>
          <strong>Deploy, pilot, partner, or invest.</strong>
          <span>
            Start a conversation <ArrowRight size={16} />
          </span>
        </Link>
      </nav>
    </div>
  );
}
