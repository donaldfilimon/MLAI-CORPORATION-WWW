import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
  {
    title: "Delaware corporation, Orlando roots",
    desc: "Machine Learning Advanced Innovations, Inc. builds the stack Donald Filimon leads across ABI, WDBX, and IWL.",
  },
] as const;

export function CompanyPage() {
  return (
    <div className="public-container marketing-page">
      <section className="marketing-hero">
        <div>
          <span className="eyeline wdbx">Company</span>
          <h1>Build what you can show.</h1>
          <p className="hero-description">
            MLAI builds privacy-first AI infrastructure for teams that need
            inspectable autonomy — WDBX for memory, ABI for compute, and IWL for
            the assistant workspace.
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
        <aside className="callout-card wdbx">
          <strong>How we talk about progress</strong>
          <p>
            Investors and partners get evidence before projections. Numeric
            market claims stay off this site until they ship with provenance.
          </p>
        </aside>
      </section>
      <section className="system-section marketing-section">
        <div className="section-intro">
          <span className="eyeline wdbx">Principles</span>
          <h2>What the company optimizes for.</h2>
        </div>
        <div className="feature-grid">
          {pillars.map((item) => (
            <article className="feature-card wdbx" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
      </section>
      <nav className="next-up" aria-label="Continue reading">
        <Link className="next-up-card abi" href="/investors">
          <span className="eyeline abi">Investors</span>
          <strong>Evidence-first notes — no invented TAM.</strong>
          <span>
            Read investors <ArrowRight size={16} />
          </span>
        </Link>
        <Link className="next-up-card abbey" href="/services">
          <span className="eyeline abbey">Services</span>
          <strong>How engagements usually start.</strong>
          <span>
            View services <ArrowRight size={16} />
          </span>
        </Link>
      </nav>
    </div>
  );
}
