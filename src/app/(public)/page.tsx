import Link from "next/link";
import { ArrowRight, Code2, Users } from "lucide-react";
import { ArchitectureDiagram, DocumentFlow } from "@/components/architecture";
import { publications } from "@/content/research";
export default function Home() {
  return (
    <div className="public-container">
      <section className="home-hero">
        <div>
          <h1>
            Intelligence
            <br />
            you can inspect.
          </h1>
          <p className="hero-description">
            Runtime, memory, and an assistant workspace—with explicit model
            choices and traceable sources.
          </p>
          <div className="button-row">
            <Link className="button white" href="/architecture">
              Read the architecture <ArrowRight size={18} />
            </Link>
            <Link className="button secondary" href="/app">
              Open workspace
            </Link>
          </div>
        </div>
        <ArchitectureDiagram />
      </section>
      <section className="system-section">
        <h2>The system, in three parts.</h2>
        {[
          {
            name: "WDBX",
            color: "wdbx",
            text: "Store and retrieve knowledge with source references.",
          },
          {
            name: "ABI",
            color: "abi",
            text: "Connect model and tool execution through explicit interfaces.",
          },
          {
            name: "Abbey",
            color: "abbey",
            text: "Work with projects, documents, and conversations.",
          },
        ].map((p) => (
          <Link
            className={`product-row ${p.color}`}
            href={`/${p.name.toLowerCase()}`}
            key={p.name}
          >
            <h3>{p.name}</h3>
            <p>{p.text}</p>
            <span>
              View documentation <ArrowRight size={18} />
            </span>
          </Link>
        ))}
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
        <Link href="/services">
          <Users size={36} />
          <div>
            <h2>Work with the team</h2>
            <p>Implementation support and technical collaboration.</p>
            <span className="text-link abbey">
              Explore services <ArrowRight size={16} />
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
