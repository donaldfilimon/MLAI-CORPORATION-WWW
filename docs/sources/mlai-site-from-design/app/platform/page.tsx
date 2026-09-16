import { Reveal } from '@/components/Motion';

export const metadata = {
  title: 'Platform — Autonomy You Can Inspect · MLAI',
  description: 'Four layers that make autonomy inspectable: what the agent saw, what it was allowed to do, how it was tested, and where it runs.',
};

const LAYERS = [
  ['01', 'Trace Layer', 'Captures retrieval paths, policy checks, model decisions, tool calls, and operator interventions as inspectable events.', 'Useful for debugging, compliance review, incident response, and customer-facing explanations.'],
  ['02', 'Control Plane', 'Defines which agents can plan, review, execute, escalate, or abstain under each workflow condition.', 'Keeps risky actions behind explicit approval gates and measurable release criteria.'],
  ['03', 'Evaluation Mesh', 'Runs regression scenarios across retrieval faithfulness, latency, safety behavior, prompt injection, and human-review burden.', 'Turns AI quality into a release gate instead of an after-the-fact dashboard.'],
  ['04', 'Private Runtime', 'Packages LLM orchestration, retrieval, audit logs, and controls for cloud, VPC, on-premise, and offline-first deployments.', 'Designed for teams that cannot send sensitive context to unmanaged infrastructure.'],
];

const TARGETS = [
  ['295×', 'GPU speedup', 'matrix benchmark track', 'c-cyan'],
  ['0.8ms', 'Search latency', '1M-vector local retrieval', 'c-violet'],
  ['16.5K', 'Throughput (QPS)', 'WDBX stress-test objective', 'c-emerald'],
  ['Roles', 'Agent control', 'planning · review · execution', 'c-cyan'],
  ['90d', 'Pilot window', 'audit-to-production roadmap', 'c-amber'],
  ['SOC 2', 'Readiness track', 'controls designed for audit evidence', 'c-emerald'],
];

export default function PlatformPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="neural-host" data-neural="galaxy" data-glow="0.7" data-density="0.9" data-chain="0"></div>
        <div className="veil"></div>
        <div className="wrap">
          <Reveal><div className="eyebrow">Neural AI orchestration</div></Reveal>
          <Reveal as="h1" delay={70}>Autonomy you can <span className="grad-text">inspect.</span></Reveal>
          <Reveal as="p" className="lede" delay={140}>
            The MLAI platform wraps orchestration in four layers that make autonomy inspectable: what the agent saw, what it was allowed to do, how it was tested, and where it runs.
          </Reveal>
        </div>
      </section>

      <section className="band" id="layers">
        <div className="wrap">
          <Reveal className="sec-head"><div className="eyebrow">Four layers</div><h2>What the platform guarantees</h2></Reveal>
          <div className="vstack">
            {LAYERS.map(([num, t, d1, d2], i) => (
              <Reveal key={num} delay={i * 60} className="numrow glass">
                <div className="num">{num}</div>
                <div><h3>{t}</h3><p>{d1}</p><p><strong>{d2}</strong></p></div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="band alt" id="numbers">
        <div className="wrap">
          <Reveal className="sec-head">
            <div className="eyebrow">Numbers</div>
            <h2>Targets stated as targets</h2>
            <p className="sub">Per our operating principles: no benchmark without environment notes, workload shape, and reproducibility context. These are the platform&apos;s stated objectives, tagged.</p>
          </Reveal>
          <div className="stats cols-3">
            {TARGETS.map(([v, l, s, c], i) => (
              <Reveal key={l} delay={(i % 3) * 70} className={`stat ${c} glass`}>
                <div className="v">{v}</div><div className="l">{l}</div><div className="s">{s}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="band" id="audience">
        <div className="wrap">
          <Reveal className="sec-head"><div className="eyebrow">Who it&apos;s for</div><h2>Built for the teams that can&apos;t compromise</h2></Reveal>
          <div className="grid-2">
            <Reveal className="card glass"><div className="tag cyan">Regulated software</div><p className="desc" style={{ fontSize: 15, color: '#cbd5e1' }}>Regulated software teams shipping AI copilots into customer workflows.</p></Reveal>
            <Reveal delay={90} className="card glass"><div className="tag violet">Research</div><p className="desc" style={{ fontSize: 15, color: '#cbd5e1' }}>Research organizations that need private retrieval over sensitive technical corpora.</p></Reveal>
            <Reveal className="card glass"><div className="tag emerald">Security &amp; compliance</div><p className="desc" style={{ fontSize: 15, color: '#cbd5e1' }}>Security and compliance teams evaluating tool-using autonomous agents.</p></Reveal>
            <Reveal delay={90} className="card glass"><div className="tag amber">Edge infrastructure</div><p className="desc" style={{ fontSize: 15, color: '#cbd5e1' }}>Infrastructure teams deploying AI near edge devices, private clouds, or constrained networks.</p></Reveal>
          </div>
        </div>
      </section>
    </main>
  );
}
