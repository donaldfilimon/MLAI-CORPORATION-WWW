import { Reveal, Counter } from '@/components/Motion';

const CAPS = [
  { tag: 'Core', tc: 'cyan', t: 'Tensor operations', d: 'N-dimensional tensors with automatic differentiation. SIMD-optimized CPU paths plus Metal GPU kernels.' },
  { tag: 'GPU', tc: 'cyan', t: 'GPU context management', d: 'Metal Performance Shaders integration, automatic kernel selection, async pipelines.' },
  { tag: 'Layers', tc: 'cyan', t: 'Neural network layers', d: 'Dense, Conv2D, LSTM, Attention. ReLU, Sigmoid, Softmax. Full backpropagation.' },
  { tag: 'Memory', tc: 'violet', t: 'Zero-copy operations', d: 'Unified memory eliminates host↔device transfers. Span-based APIs, actor-based concurrency.' },
  { tag: 'Orchestration', tc: 'violet', t: 'Multi-persona orchestration', d: 'Intent classification, persona routing across Abbey / Aviva / Abi, RAG over WDBX, DQN reward loop.' },
  { tag: 'Compiler', tc: 'emerald', t: 'Comptime specialization', d: 'Zig compile-time execution pre-computes lookup tables and vectorized kernels for the exact target ISA.' },
];

export const metadata = {
  title: 'ABI Framework — Compute Layer · MLAI',
  description: 'ML and GPU acceleration framework: tensor operations, neural network layers, and zero-copy unified-memory pipelines in Zig + Metal.',
  openGraph: {
    title: 'ABI Framework — orchestration you can trace',
    description: 'The six-layer runtime that routes, traces and governs. Metal-accelerated, Zig-built.',
    images: [{ url: '/og/og-home.png', width: 1200, height: 630, alt: 'MLAI ABI Framework' }],
  },
};

export default function AbiPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="neural-host" data-neural="galaxy" data-glow="0.7" data-density="0.9" data-chain="0"></div>
        <div className="veil"></div>
        <div className="wrap">
          <Reveal><div className="eyebrow">Compute layer · Zig 0.17-dev + Metal</div></Reveal>
          <Reveal as="h1" delay={70}>Apple Silicon, <span className="grad-text">fully spent.</span></Reveal>
          <Reveal as="p" className="lede" delay={140}>
            ML and GPU acceleration framework: tensor operations, neural network layers, and zero-copy unified-memory pipelines in Zig 0.17-dev + Metal.
          </Reveal>
          <div className="stats">
            {[
              { v: 5, d: 0, l: 'MatMul 128×128', s: 'measured · GPU vs CPU', c: 'c-cyan' },
              { v: 84, d: 0, l: 'MatMul 1024×1024', s: 'measured · GPU vs CPU', c: 'c-violet' },
              { v: 295, d: 0, l: 'MatMul 4096×4096', s: 'benchmark-track objective', c: 'c-emerald' },
              { v: 13, d: 0, l: '10-layer neural net', s: 'measured · GPU vs CPU', c: 'c-amber' },
            ].map((s, i) => (
              <Reveal key={s.l} delay={i * 70} className={`stat ${s.c} glass`}>
                <div className="v"><Counter to={s.v} decimals={s.d} suffix="×" /></div>
                <div className="l">{s.l}</div>
                <div className="s">{s.s}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="band" id="inside">
        <div className="wrap">
          <Reveal className="sec-head"><div className="eyebrow">Capabilities</div><h2>What&apos;s inside</h2></Reveal>
          <div className="grid-3">
            {CAPS.map((c, i) => (
              <Reveal key={c.t} delay={(i % 3) * 90} className="card glass">
                <div className={`tag ${c.tc}`}>{c.tag}</div><h3>{c.t}</h3><p className="desc">{c.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="band alt" id="substrate">
        <div className="wrap">
          <Reveal className="sec-head">
            <div className="eyebrow">The substrate</div>
            <h2>The Apple Silicon advantage</h2>
            <p className="sub">Unified memory makes the host-to-device copy — the tax every CUDA pipeline pays — simply not exist. ABI&apos;s APIs are designed around that fact.</p>
          </Reveal>
          <div className="stats cols-3">
            <Reveal className="stat c-cyan glass"><div className="v">546 GB/s</div><div className="l">Unified memory bandwidth</div><div className="s">M-series</div></Reveal>
            <Reveal delay={70} className="stat c-violet glass"><div className="v">38 TOPS</div><div className="l">Neural Engine</div><div className="s">M4</div></Reveal>
            <Reveal delay={140} className="stat c-emerald glass"><div className="v">200 GFLOPS/W</div><div className="l">Power efficiency</div><div className="s">on-device inference</div></Reveal>
          </div>
        </div>
      </section>

      <section className="band" id="training">
        <div className="wrap">
          <Reveal className="sec-head">
            <div className="eyebrow">Training pipeline</div>
            <h2>From kernels to models</h2>
            <p className="sub">The same stack trains: a Zig 0.17-dev + MLX pipeline targeting a ~1B-parameter transformer runs end-to-end on Apple Silicon — data loading, tokenization, and the training loop, no cloud leg.</p>
          </Reveal>
          <div className="grid-2">
            <Reveal className="card glass"><div className="tag violet">Reinforcement</div><h3>DQN reward loop</h3><p className="desc">Persona routing decisions feed a deep Q-network reward loop, so orchestration quality improves from production traffic without shipping data anywhere.</p></Reveal>
            <Reveal delay={90} className="card glass"><div className="tag cyan">Grounding</div><h3>Intent classification + RAG</h3><p className="desc">Queries are classified, routed, and grounded against WDBX retrieval before generation — surgical context instead of window-stuffing.</p></Reveal>
          </div>
        </div>
      </section>
    </main>
  );
}
