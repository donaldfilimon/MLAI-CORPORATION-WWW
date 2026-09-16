import { Reveal } from '@/components/Motion';

export const metadata = {
  title: 'Company — Machine Learning Advanced Innovations · MLAI',
  description: 'Machine Learning Advanced Innovations, Inc. Small team. Systems languages. No ceremony.',
};

const PRINCIPLES = [
  ['01', 'Disciplined secrecy', 'We publish benchmarks, not roadmaps. What ships speaks; what’s in flight stays quiet until it’s real.'],
  ['02', 'Mission stewardship', 'Privacy-first is an architecture decision, not a marketing position. Data never leaves the device unless the owner sends it.'],
  ['03', 'Operational velocity', 'Small team, systems languages, zero ceremony. We measure in p50s and ship in weeks.'],
] as const;

const VALUES = [
  ['01', 'cyan', 'Safety Before Scale', 'We design autonomy around bounded execution, explicit approvals, and measurable failure modes before expanding capability or throughput.'],
  ['02', 'cyan', 'Observable Reasoning', 'Every orchestration layer is built to expose provenance, retrieval context, decision checkpoints, and the operator actions that changed state.'],
  ['03', 'cyan', 'Performance With Proof', 'Latency, recall quality, and GPU utilization are benchmarked against repeatable workloads instead of optimistic demos.'],
  ['04', 'violet', 'Private Deployment Paths', 'Architectures are shaped for on-premise, VPC, hybrid, and edge deployments where data residency and auditability cannot be compromised.'],
  ['05', 'violet', 'Human-Centered Control', 'MLAI systems keep escalation, review, and override flows visible so subject-matter experts remain in control of critical outcomes.'],
  ['06', 'violet', 'Research-To-Runtime Discipline', 'Novel techniques are packaged with integration notes, safety constraints, and operational guidance so research can survive production pressure.'],
] as const;

const HIRES = [
  ['01', 'Metal / GPU · Core ML', 'Senior Swift Engineer'],
  ['02', 'WDBX core · distributed', 'Systems Engineer (Zig)'],
  ['03', 'Embeddings · quantization', 'ML Engineer'],
  ['04', 'Content · community', 'Developer Advocate'],
] as const;

export default function CompanyPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="veil"></div>
        <div className="wrap">
          <Reveal><div className="eyebrow">Machine Learning Advanced Innovations, Inc.</div></Reveal>
          <Reveal as="h1" delay={70}>Small team. Systems languages. <span className="grad-text">No ceremony.</span></Reveal>
          <Reveal as="p" className="lede" delay={140}>Apple Silicon-native. Built on Apple’s public frameworks — Metal, Accelerate, and Core ML.</Reveal>
        </div>
      </section>
      <section className="band">
        <div className="wrap">
          <Reveal className="sec-head"><div className="eyebrow">Operating system</div><h2>Three binding principles</h2></Reveal>
          <div className="vstack">
            {PRINCIPLES.map(([n, t, d], i) => (
              <Reveal key={n} delay={i * 60} className="numrow glass"><div className="num">{n}</div><div><h3>{t}</h3><p>{d}</p></div></Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="band alt">
        <div className="wrap">
          <Reveal className="sec-head"><div className="eyebrow">Values</div><h2>How we decide</h2><p className="sub">Six values, and four operating principles stated as refusals — because a principle you can’t violate isn’t one.</p></Reveal>
          <div className="grid-3">
            {VALUES.map(([n, tc, t, d], i) => (
              <Reveal key={n} delay={(i % 3) * 90} className="card glass"><div className={`tag ${tc}`}>{n}</div><h3>{t}</h3><p className="desc">{d}</p></Reveal>
            ))}
          </div>
          <Reveal className="glass" >
            <ul className="status" style={{ padding: '12px 28px' }}>
              <li><span className="dot off"></span> No autonomous write action without an observable policy boundary.</li>
              <li><span className="dot off"></span> No retrieval claim without a traceable source or confidence signal.</li>
              <li><span className="dot off"></span> No benchmark without environment notes, workload shape, and reproducibility context.</li>
              <li><span className="dot off"></span> No deployment plan that ignores rollback, incident review, and human escalation.</li>
            </ul>
          </Reveal>
        </div>
      </section>
      <section className="band">
        <div className="wrap">
          <Reveal className="sec-head"><div className="eyebrow">Hiring</div><h2>The first four hires</h2><p className="sub">Pre-seed funds two of these immediately. If you read the architecture page and disagreed with a decision for a good reason, we should talk.</p></Reveal>
          <div className="vstack">
            {HIRES.map(([n, k, t], i) => (
              <Reveal key={n} delay={i * 60} className="numrow glass"><div className="num">{n}</div><div><div className="kick">{k}</div><h3>{t}</h3></div></Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
