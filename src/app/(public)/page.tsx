import Link from "next/link";
import { ArrowRight, Code2, Users } from "lucide-react";
import { ArchitectureDiagram, DocumentFlow } from "@/components/architecture";
import { ProvLegend } from "@/components/prov-tag";
import { publications } from "@/content/research";

const stack = [
  {
    name: "WDBX",
    color: "wdbx",
    href: "/wdbx",
    title: "WDBX — Storage",
    text: "Memory and retrieval with source references. The index stays where the data lives.",
  },
  {
    name: "ABI",
    color: "abi",
    href: "/abi",
    title: "ABI — Compute",
    text: "Runtime and orchestration through explicit interfaces. Model choices are never silent.",
  },
  {
    name: "Abbey",
    color: "abbey",
    href: "/abbey",
    title: "IWL — Application",
    text: "Projects, documents, and conversations in one assistant workspace you can inspect. Abbey, Aviva, and Abi share the core.",
  },
] as const;

export default function Home() {
  return (
    <div className="public-container">
      <section className="home-hero">
        <div>
          <span className="eyeline wdbx">
            Privacy-first AI infrastructure · Apple Silicon
          </span>
          <h1>
            AI infrastructure
            <br />
            that never phones home.
          </h1>
          <p className="hero-description">
            From the vector engine up — WDBX for memory, ABI for compute, and an
            assistant workspace with explicit model choices. Inference, index,
            and data stay on hardware you control.
          </p>
          <div className="button-row">
            <Link className="button primary" href="/wdbx">
              Explore the stack <ArrowRight size={18} />
            </Link>
            <Link className="button secondary" href="/architecture">
              Architecture
            </Link>
          </div>
        </div>
        <ArchitectureDiagram />
      </section>

      <section className="system-section stack-section">
        <div className="section-intro">
          <span className="eyeline wdbx">The stack</span>
          <h2>Three layers. One machine.</h2>
          <p className="muted">
            Each is useful on its own; together they are a private AI stack that
            does not need to phone home.
          </p>
        </div>
        <div className="stack-grid">
          {stack.map((p) => (
            <Link
              className={`stack-card ${p.color}`}
              href={p.href}
              key={p.name}
            >
              <h3>{p.title}</h3>
              <p>{p.text}</p>
              <span>
                View {p.name} <ArrowRight size={16} />
              </span>
            </Link>
          ))}
        </div>
        <div className="home-prov">
          <p className="muted home-prov-note">
            Public figures carry provenance tags. Sourced constants live on{" "}
            <Link href="/wdbx">WDBX</Link> and <Link href="/abi">ABI</Link> —
            not as a home benchmarks grid.
          </p>
          <ProvLegend variant="inline" />
        </div>
      </section>

      <section className="flow-section">
        <div>
          <h2>Read the architecture.</h2>
          <p>
            Follow a document from upload to extraction, retrieval, and a cited
            answer.
          </p>
          <Link href="/architecture" className="text-link">
            Follow the data <ArrowRight size={16} />
          </Link>
        </div>
        <DocumentFlow />
      </section>

      <section className="research-section">
        <div className="section-heading">
          <h2>Research & technical notes</h2>
          <Link href="/research" className="text-link">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        {publications
          .filter((p) =>
            [
              "wdbx-weighted-backtrace-memory-store",
              "multi-persona-routing-policy-weights",
              "mcp-implementation-guide",
            ].includes(p.slug),
          )
          .map((publication) => (
            <Link
              className="editorial-row"
              href={`/research/${publication.slug}`}
              key={publication.slug}
            >
              <span>{publication.title}</span>
              <span className="muted">{publication.topic.toUpperCase()}</span>
              <ArrowRight size={18} />
            </Link>
          ))}
      </section>

      <section className="work-section">
        <Link href="/docs">
          <Code2 size={36} />
          <div>
            <h2>Build with MLAI</h2>
            <p>Developer documentation and integration guides.</p>
            <span className="text-link wdbx">
              Explore developer docs <ArrowRight size={16} />
            </span>
          </div>
        </Link>
        <Link href="/contact">
          <Users size={36} />
          <div>
            <h2>Talk with the team</h2>
            <p>Deploy, pilot, partner, or invest — same inbox.</p>
            <span className="text-link abbey">
              Contact <ArrowRight size={16} />
            </span>
          </div>
        </Link>
      </section>

      <section className="closing-row">
        <h2>Open your workspace.</h2>
        <Link href="/app" className="button secondary">
          Open workspace <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}
