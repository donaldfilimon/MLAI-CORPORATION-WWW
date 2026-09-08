import Link from "next/link";
import { ArrowRight } from "lucide-react";

const capabilities = [
  {
    title: "Multi-provider LLM support",
    desc: "OpenAI, Anthropic, and local models via Ollama. Seamless provider switching — always an explicit workspace choice.",
  },
  {
    title: "Vector-based semantic memory",
    desc: "Powered by WDBX. Remembers conversations, learns preferences — all stored locally on hardware you control.",
  },
  {
    title: "A chain you can walk back",
    desc: "Stored blocks carry the digest of the block before them, so history cannot be edited without breaking the link. Reconstructing a session from that chain is a design target, not a shipped command.",
  },
  {
    title: "Emotional intelligence",
    desc: "Technical precision balanced with empathetic communication, tuned per persona.",
  },
] as const;

const personas = [
  {
    key: "abbey",
    name: "Abbey",
    role: "Empathetic polymath. The neutral prior favors Abbey, so an unremarkable turn lands here.",
  },
  {
    key: "aviva",
    name: "Aviva",
    role: "Direct expert. Selected when the turn carries directness or urgency cues, not by a separate model.",
  },
  {
    key: "abi",
    name: "Abi",
    role: "Moderator. Keyword-weighted scores are normalized to a distribution and the highest weight wins; two profiles can be blended for one turn.",
  },
] as const;

const registers: [string, string, string][] = [
  ["Abbey", "emerald", "empathetic, open-ended"],
  ["Aviva", "violet", "direct, token-frugal"],
  ["Abi", "cyan", "router / moderator"],
];

/**
 * Two separate Discord products, not one port of the other. Stacks read from
 * source: abbey-bot/Cargo.toml (serenity 0.12 · poise 0.6 · songbird 0.6) and
 * AbbeyBot/Package.swift (swift-tools 6.4 · DiscordBM · Vapor · Fluent).
 * Both repositories are private, so the citation is a path, not a link.
 */
const shipping = [
  {
    k: "Abbey Bot — Rust (serenity 0.12 · poise 0.6)",
    v: "Shipping",
  },
  {
    k: "AbbeyBot — Swift 6.4 (DiscordBM · Vapor · Fluent)",
    v: "Shipping, voice audio not claimed",
  },
  { k: "Twitch EventSub, in the Swift surface only", v: "In progress" },
] as const;

export function AbbeyPage() {
  return (
    <div className="public-container marketing-page">
      <section className="marketing-hero">
        <div>
          <span className="eyeline abbey">
            IWL · Application · three personas, one core
          </span>
          <h1>An assistant that remembers — locally.</h1>
          <p className="hero-description">
            IWL is the assistant workspace with persistent vector-backed memory.
            Abbey, Aviva, and Abi share one core; every conversation stays on
            hardware you control.
          </p>
          <div className="button-row">
            <Link className="button primary" href="/app/abbey">
              Open IWL workspace <ArrowRight size={18} />
            </Link>
            <Link className="button secondary" href="/docs/models">
              Model setup
            </Link>
          </div>
        </div>
        <aside className="persona-panel" aria-label="Persona roster">
          <div className="persona-panel-label">The roster</div>
          <ul>
            {personas.map((p) => (
              <li key={p.key}>
                <span className={`persona-dot ${p.key}`} aria-hidden="true" />
                <div>
                  <strong>{p.name}</strong>
                  <p>{p.role}</p>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="system-section marketing-section">
        <div className="section-intro">
          <span className="eyeline abbey">Capabilities</span>
          <h2>What the surface can do.</h2>
          <p className="muted">
            Underneath: WDBX for memory, ABI for compute. On the surface: an
            assistant with a strong opinion about where your data lives.
          </p>
        </div>
        <div className="feature-grid">
          {capabilities.map((item) => (
            <article className="feature-card abbey" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="system-section marketing-section">
        <div className="section-intro">
          <span className="eyeline abbey">The registers</span>
          <h2>Why three, not one.</h2>
          <p className="muted">
            A model tuned to be warm is bad at being blunt. The split is a
            training decision, and the router&apos;s choice is recorded on the
            audit chain.
          </p>
        </div>
        <div className="table-scroll registers-table">
          <table>
            <caption>Fixed persona colors — distinct on sight.</caption>
            <thead>
              <tr>
                <th>Persona</th>
                <th>Accent</th>
                <th>Register</th>
              </tr>
            </thead>
            <tbody>
              {registers.map(([persona, accent, register]) => (
                <tr key={persona}>
                  <td>{persona}</td>
                  <td>
                    <code>{accent}</code>
                  </td>
                  <td>{register}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="prov-note muted">
          Eval harness figures are omitted here until they ship with provenance
          in brand sources — no unsourced scores on this page.
        </p>
      </section>

      <section className="system-section marketing-section">
        <div className="section-intro">
          <span className="eyeline abbey">Where it runs</span>
          <h2>Platform status.</h2>
          <p className="muted">
            Shipping surfaces are labeled shipping; work in flight is labeled in
            progress.
          </p>
        </div>
        <dl className="spec-list">
          {shipping.map((row) => (
            <div key={row.k}>
              <dt>{row.k}</dt>
              <dd>{row.v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="split-section abbey">
        <div>
          <span className="eyeline abbey">Memory</span>
          <h2>Recall is a vector lookup.</h2>
        </div>
        <div>
          <p>
            Conversations are embedded and stored in WDBX, on-device. When you
            ask what you decided last month, the answer is retrieved from your
            own hardware — with the path that produced it.
          </p>
          <p>
            Because interaction blocks are hash-chained, drift has a remedy: the
            chain is traversed backward to the divergence point and the session
            state rewound.
          </p>
        </div>
      </section>

      <nav className="next-up" aria-label="Continue reading">
        <Link className="next-up-card abi" href="/platform">
          <span className="eyeline abi">Platform</span>
          <strong>
            The four layers that make IWL&apos;s autonomy inspectable.
          </strong>
          <span>
            View platform <ArrowRight size={16} />
          </span>
        </Link>
        <Link className="next-up-card wdbx" href="/wdbx">
          <span className="eyeline wdbx">WDBX</span>
          <strong>The store IWL memory lives in.</strong>
          <span>
            View WDBX <ArrowRight size={16} />
          </span>
        </Link>
      </nav>
    </div>
  );
}
