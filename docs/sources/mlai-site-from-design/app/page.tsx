import { Reveal, Counter } from '@/components/Motion';

const HERO_STATS = [
  { v: 2.3, d: 1, suf: 'ms', l: 'p50 search latency', s: 'measured · M-series node', c: 'c-cyan' },
  { v: 98.2, d: 1, suf: '%', l: 'Recall@10', s: 'measured · wdbx bench', c: 'c-violet' },
  { v: 16.5, d: 1, suf: 'K', l: 'QPS', s: 'stress-test objective', c: 'c-emerald' },
  { v: 0.8, d: 1, suf: 'ms', l: 'p50 @ 1M vectors', s: 'measured · wdbx bench', c: 'c-amber' },
];

const TRIFECTA = [
  { tag: 'Storage', tc: 'cyan', name: 'WDBX', blurb: 'Memory you can verify.', desc: 'Zig-built vector storage with HNSW indexing, MVCC transactions, and Metal / CUDA / Vulkan backends. Runs where the data lives.', href: '/wdbx' },
  { tag: 'Compute', tc: 'violet', name: 'ABI Framework', blurb: 'Compute, close to the metal.', desc: 'ML and GPU acceleration framework — tensor operations, neural network layers, and zero-copy unified-memory pipelines in Zig + Metal.', href: '/abi' },
  { tag: 'Application', tc: 'emerald', name: 'Abbey', blurb: 'Technical mastery, human delivery.', desc: 'Self-learning, emotionally aware AI assistant with persistent vector-backed memory. Every conversation stays on hardware you control.', href: '/abbey' },
];

const MINDS = [
  { tag: 'Empathic Polymath', tc: 'emerald', name: 'Abbey', desc: 'Warm, encouraging, scaffolds hard ideas with metaphor before precision — confident enough to hold an opinion.', quote: '“Think of a vector database as a library that files books by meaning, not title. Here’s exactly how WDBX does it…”' },
  { tag: 'Unfiltered Expert', tc: 'violet', name: 'Aviva', desc: 'Direct, concise, zero hedging or preamble. Optimized for technical density and speed.', quote: '“Use HNSW. M=16, ef=200. Cosine for text, L2 for clustering. Done.”' },
  { tag: 'Adaptive Moderator', tc: 'cyan', name: 'Abi', desc: 'Neutral and balanced. Classifies intent, routes, and blends the other two — the system’s default register.', quote: '“Routing this to Abbey — it reads as a learning question with some frustration.”' },
];

const BENCH = [
  ['p50 search latency', '2.3 ms', 'measured'],
  ['Recall@10', '98.2%', 'measured'],
  ['Throughput', '16.5K QPS', 'stress-test objective'],
  ['p50 @ 1M vectors', '0.8 ms', 'measured'],
];

export default function Home() {
  return (
    <main>
      {/* ═ HERO ═ */}
      <section className="hero" id="top">
        <div id="hero-neural" data-neural="galaxy"></div>
        <div className="veil"></div>
        <div className="wrap">
          <Reveal><div className="badge"><span className="dot"></span> AI infrastructure that never phones home</div></Reveal>
          <Reveal as="h1" delay={70}>The infrastructure layer for<br /><span className="grad-text">private, high-performance AI</span></Reveal>
          <Reveal as="p" className="lede" delay={140}>
            Machine Learning Advanced Innovations builds privacy-first AI infrastructure for Apple Silicon — Zig-built,
            Metal-accelerated, on-device. Built on Apple&apos;s public frameworks: Metal, Accelerate, and Core ML.
          </Reveal>
          <Reveal delay={210}>
            <div className="hero-actions">
              <a className="btn-primary" href="/wdbx">Explore WDBX</a>
              <a className="btn-ghost" href="/investors">Investor brief</a>
            </div>
          </Reveal>
          <Reveal delay={280}>
            <div className="persona-legend">
              {[['Abbey', 'empathic · polymath', 'var(--emerald)'], ['Aviva', 'unfiltered · expert', 'var(--violet)'], ['Abi', 'adaptive · moderator', 'var(--cyan)']].map(([n, r, c], i) => (
                <span key={n} style={{ display: 'contents' }}>
                  {i > 0 && <span className="sep"></span>}
                  <span className="p">
                    <span className="pd" style={{ background: c, boxShadow: `0 0 10px ${c}` }}></span>
                    <span className="pt"><span className="pn">{n}</span><span className="pr">{r}</span></span>
                  </span>
                </span>
              ))}
            </div>
          </Reveal>
          <div className="stats">
            {HERO_STATS.map((s, i) => (
              <Reveal key={s.l} delay={i * 70} className={`stat ${s.c} glass`}>
                <div className="v"><Counter to={s.v} decimals={s.d} suffix={s.suf} /></div>
                <div className="l">{s.l}</div>
                <div className="s">{s.s}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═ STACK ═ */}
      <section className="band" id="stack">
        <div className="wrap">
          <Reveal className="sec-head">
            <div className="eyebrow">One integrated stack</div>
            <h2>Three layers. One chip.</h2>
            <p className="sub grad-text">Storage, compute, and application — a vector engine, an acceleration framework, and an assistant that keeps every conversation on hardware you control.</p>
          </Reveal>
          <div className="grid-3">
            {TRIFECTA.map((p, i) => (
              <Reveal key={p.name} delay={i * 90}>
                <a className="card glass" href={p.href} style={{ display: 'flex' }}>
                  <div className={`tag ${p.tc}`}>{p.tag}</div>
                  <h3>{p.name}</h3>
                  <p className="blurb">{p.blurb}</p>
                  <p className="desc">{p.desc}</p>
                  <span className={`more ${p.tc}`}>Learn more →</span>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═ MINDS ═ */}
      <section className="band alt" id="minds">
        <div className="wrap">
          <Reveal className="sec-head">
            <div className="eyebrow">The ABI framework</div>
            <h2>Three specialized minds, one neural core</h2>
            <p className="sub grad-text">Abi classifies intent and routes every turn — blending empathy and precision through persona-token injection at the attention layer.</p>
          </Reveal>
          <div className="grid-3">
            {MINDS.map((m, i) => (
              <Reveal key={m.name} delay={i * 90} className="card glass">
                <div className={`tag ${m.tc}`}>{m.tag}</div>
                <h3>{m.name}</h3>
                <p className="desc">{m.desc}</p>
                <p className="quote">{m.quote}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═ BENCHMARKS ═ */}
      <section className="band" id="benchmarks">
        <div className="wrap">
          <Reveal className="sec-head">
            <div className="eyebrow">Benchmarks</div>
            <h2>Numbers with provenance</h2>
            <p className="sub grad-text">wdbx · bench · single M-series node. Every number is tagged measured, target, or reported — we don&apos;t ship numbers we can&apos;t reproduce.</p>
          </Reveal>
          <Reveal className="table-wrap glass">
            <table>
              <thead><tr><th>Metric</th><th>Result</th><th>Provenance</th></tr></thead>
              <tbody>
                {BENCH.map((r) => (
                  <tr key={r[0]}><td>{r[0]}</td><td className="win">{r[1]}</td><td>{r[2]}</td></tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        </div>
      </section>

      {/* ═ APPLE STRIP ═ */}
      <section className="band" id="apple" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Reveal className="apple glass">
            <div id="apple-net" data-neural="net" data-color="96,165,250" data-dense="11000"></div>
            <div className="glyph">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/mlai-logo-icon.svg" alt="MLAI mark" style={{ width: 44, height: 44, borderRadius: 11 }} />
            </div>
            <h2>Built on Apple&apos;s public frameworks</h2>
            <p>Metal, Accelerate, and Core ML — Apple Silicon-native by design. On-device inference with zero marginal cost, on hardware your users already own.</p>
            <a className="btn-primary" href="#benchmarks" style={{ marginTop: 24 }}>Run the benchmark</a>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
