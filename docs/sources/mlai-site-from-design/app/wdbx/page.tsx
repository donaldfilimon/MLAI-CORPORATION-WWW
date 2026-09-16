import { Reveal, Counter } from '@/components/Motion';

const CAPS = [
  { tag: 'Index', tc: 'cyan', t: 'HNSW index architecture', d: 'Hierarchical Navigable Small World graphs. O(log n) search. 95% recall at 8.2ms on 1M vectors.' },
  { tag: 'Persistence', tc: 'cyan', t: 'Memory-mapped persistence', d: 'Span-based zero-copy I/O. WAL journaling. Instant cold starts.' },
  { tag: 'Compression', tc: 'cyan', t: 'Scalar & product quantization', d: 'Up to 32× compression with minimal recall loss. 10B vectors addressable in 2GB RAM.' },
  { tag: 'Acceleration', tc: 'violet', t: 'Metal GPU acceleration', d: 'Distance calculations on Apple GPU via the ABI Framework. First App Store-ready vector database.' },
  { tag: 'Concurrency', tc: 'violet', t: 'MVCC transactions', d: 'Multiversion concurrency control. Readers never block writers; writers never block readers.' },
  { tag: 'Security', tc: 'emerald', t: 'AES-256 + RBAC', d: 'Encryption at rest, role-based access control, audit-grade write-ahead log.' },
];

export const metadata = {
  title: 'WDBX — Vector Database · MLAI',
  description: 'Zig-built vector storage with HNSW indexing, MVCC transactions, and Metal / CUDA / Vulkan backends. Runs where the data lives.',
  openGraph: {
    title: 'WDBX — The fastest vector database alive',
    description: 'HNSW indexing, MVCC transactions, SHA-256-chained history. 2.3ms p50, measured.',
    images: [{ url: '/og/og-wdbx.png', width: 1200, height: 630, alt: 'WDBX — the fastest vector database alive' }],
  },
};

export default function WdbxPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="neural-host" data-neural="galaxy" data-glow="0.7" data-density="0.9" data-chain="0"></div>
        <div className="veil"></div>
        <div className="wrap">
          <Reveal><div className="eyebrow">Storage layer · Zig 0.17-dev</div></Reveal>
          <Reveal as="h1" delay={70}>The fastest <span className="grad-text">vector database</span> alive.</Reveal>
          <Reveal as="p" className="lede" delay={140}>
            Zig-built vector storage with HNSW indexing, MVCC transactions, and Metal / CUDA / Vulkan backends. Runs where the data lives.
          </Reveal>
          <div className="stats">
            {[
              { v: 2.3, suf: 'ms', l: 'p50 search latency', s: 'measured', c: 'c-cyan' },
              { v: 98.2, suf: '%', l: 'Recall@10', s: 'measured', c: 'c-violet' },
              { v: 16.5, suf: 'K', l: 'QPS', s: 'stress-test objective', c: 'c-emerald' },
              { v: 0.8, suf: 'ms', l: 'p50 @ 1M vectors', s: 'measured', c: 'c-amber' },
            ].map((s, i) => (
              <Reveal key={s.l} delay={i * 70} className={`stat ${s.c} glass`}>
                <div className="v"><Counter to={s.v} decimals={1} suffix={s.suf} /></div>
                <div className="l">{s.l}</div>
                <div className="s">{s.s}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="band" id="inside">
        <div className="wrap">
          <Reveal className="sec-head">
            <div className="eyebrow">Capabilities</div>
            <h2>What&apos;s inside</h2>
          </Reveal>
          <div className="grid-3">
            {CAPS.map((c, i) => (
              <Reveal key={c.t} delay={(i % 3) * 90} className="card glass">
                <div className={`tag ${c.tc}`}>{c.tag}</div>
                <h3>{c.t}</h3>
                <p className="desc">{c.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="band alt" id="benchmarks">
        <div className="wrap">
          <Reveal className="sec-head">
            <div className="eyebrow">Benchmarks</div>
            <h2>Performance at scale</h2>
            <p className="sub">Single Apple Silicon node; harness in repo. All figures measured unless marked.</p>
          </Reveal>
          <Reveal className="table-wrap glass">
            <div className="scroll">
              <table>
                <thead><tr><th>Metric</th><th>100K vectors</th><th>1M vectors</th><th>10M vectors</th></tr></thead>
                <tbody>
                  <tr><td>Insert throughput</td><td className="win">6,667/s</td><td>6,579/s</td><td>6,500/s</td></tr>
                  <tr><td>Search latency (k=10)</td><td className="win">2.5ms</td><td>8.2ms</td><td>15.3ms</td></tr>
                  <tr><td>Memory usage</td><td>150MB</td><td>1.5GB</td><td>15GB</td></tr>
                  <tr><td>With quantization</td><td className="win">20MB</td><td>200MB</td><td>2GB</td></tr>
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
