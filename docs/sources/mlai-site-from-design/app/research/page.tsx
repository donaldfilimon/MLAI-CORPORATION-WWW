import { Reveal } from '@/components/Motion';

export const metadata = {
  title: 'Research — The Math Behind the Milliseconds · MLAI',
  description: 'Research briefs on the WDBX architecture and the Abbey–Aviva–Abi multi-persona framework.',
};

const TRACKS = [
  ['Track 01', 'cyan', 'WDBX Core', 'Backtrace-aware retrieval, graph weighting, chunk provenance, and high-throughput vector search for production AI systems.'],
  ['Track 02', 'violet', 'Agent Safety', 'Permissioning, policy locks, prompt-injection resistance, role separation, and human escalation protocols.'],
  ['Track 03', 'emerald', 'Runtime Performance', 'GPU acceleration, memory layout, low-latency search, edge deployment, and repeatable benchmark design.'],
] as const;

const PUBS = [
  ['Jun 2026', 'Core Architecture', 'WDBX: A Weighted-Backtrace Memory Store for Traceable Retrieval'],
  ['Jun 2026', 'Research', 'Sparse Evidence Attention for Bounded Context Assembly'],
  ['May 2026', 'Core Architecture', 'WDBX Graph Weights for Traceable Neural Retrieval'],
  ['Apr 2026', 'Safety', 'Policy-Locked Tool Use in Multi-Agent Systems'],
  ['Mar 2026', 'Engineering', 'Latency Budgets for Real-Time AI Orchestration'],
  ['Feb 2026', 'Research', 'Backtrace Confidence Signals for Hallucination Reduction'],
  ['Jan 2026', 'Scalability', 'Vector Index Maintenance Under Continuous Ingestion'],
  ['Dec 2025', 'Ethics & Safety', 'Human Approval Gates That Operators Actually Use'],
  ['Nov 2025', 'Core Architecture', 'Chunk Provenance in Long-Context Retrieval Systems'],
  ['Oct 2025', 'Engineering', 'Offline-First AI Workflows for Sensitive Data'],
  ['Sep 2025', 'Safety', 'Prompt Injection Drills for Agentic Systems'],
] as const;

export default function ResearchPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="neural-host" data-neural="galaxy" data-glow="0.7" data-density="0.9" data-chain="0"></div>
        <div className="veil"></div>
        <div className="wrap">
          <Reveal><div className="eyebrow">Research briefs</div></Reveal>
          <Reveal as="h1" delay={70}>The math behind <span className="grad-text">the milliseconds.</span></Reveal>
          <Reveal as="p" className="lede" delay={140}>
            Two technical analyses of the WDBX architecture and the Abbey–Aviva–Abi multi-persona framework. Figures are reported from those documents and tagged accordingly; where a claim conflicts with our measured benchmarks, the measured number wins everywhere else on this site.
          </Reveal>
        </div>
      </section>

      <section className="band" id="tracks">
        <div className="wrap">
          <Reveal className="sec-head"><div className="eyebrow">Programs</div><h2>Three research tracks</h2></Reveal>
          <div className="grid-3">
            {TRACKS.map(([tag, tc, t, d], i) => (
              <Reveal key={t} delay={i * 90} className="card glass">
                <div className={`tag ${tc}`}>{tag}</div><h3>{t}</h3><p className="desc">{d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="band alt" id="model">
        <div className="wrap">
          <Reveal className="sec-head">
            <div className="eyebrow">The formal model</div>
            <h2>WDBX, stated precisely</h2>
            <p className="sub">Every record carries provenance, every ranking decision decomposes into named factors, and every write lands in a hash-chained log that can be re-verified later.</p>
          </Reveal>
          <div className="grid-2">
            <Reveal className="card glass">
              <div className="tag cyan">Composite retrieval score</div>
              <div className="eq" style={{ fontSize: 16 }}>sᵢⱼ = σⱼ · τⱼ · γⱼ · πⱼ</div>
              <p className="desc">σ cosine similarity over the HNSW index · τ temporal half-life decay · γ causal-hop weight, max(0.25, 0.6^h) · π source authority (inferred 0.30 → system_pinned 1.00).</p>
            </Reveal>
            <Reveal delay={90} className="card glass">
              <div className="tag violet">Hash-chained audit log</div>
              <div className="eq">Hᵢ = SHA-256(Hᵢ₋₁ ‖ tᵢ ‖ seqᵢ ‖ pᵢ ‖ mᵢ),  H₀ = 0</div>
              <p className="desc">Every write lands in a re-verifiable chain — the property that makes retrieval explainable to an auditor, not just a developer.</p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="band" id="pubs">
        <div className="wrap">
          <Reveal className="sec-head"><div className="eyebrow">Publications</div><h2>The publication index</h2><p className="sub">Eleven notes across the three tracks, September 2025 through June 2026.</p></Reveal>
          <Reveal className="table-wrap glass">
            <div className="scroll">
              <table>
                <thead><tr><th>Date</th><th>Track</th><th>Title</th></tr></thead>
                <tbody>
                  {PUBS.map(([d, tr, t]) => (
                    <tr key={t}><td>{d}</td><td>{tr}</td><td style={{ textAlign: 'left', color: '#e2e8f0', fontFamily: 'var(--font-body)' }}>{t}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
