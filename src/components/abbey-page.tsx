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
    title: "Neural backtracking",
    desc: "Hash-chained interaction blocks rewind to the exact divergence point when an agent drifts.",
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
    role: "Empathetic Polymath — training penalizes unsupportive phrasing via an explicit empathy loss term.",
  },
  {
    key: "aviva",
    name: "Aviva",
    role: "Unfiltered Expert — a conciseness loss term penalizes filler tokens. Fewer tokens, lower latency.",
  },
  {
    key: "abi",
    name: "Abi",
    role: "Adaptive Moderator — routes via argmax over P(persona | input, context), blending when needed.",
  },
] as const;

const registers: [string, string, string][] = [
  ["Abbey", "emerald", "empathetic, open-ended"],
  ["Aviva", "violet", "direct, token-frugal"],
  ["Abi", "cyan", "router / moderator"],
];

const shipping = [
  { k: "Discord (Bun + discord.js v14)", v: "Shipping" },
  { k: "Swift 6 / Vapor 4 / DiscordBM port", v: "In progress" },
  { k: "Python + Twitch expansion", v: "In progress" },
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
