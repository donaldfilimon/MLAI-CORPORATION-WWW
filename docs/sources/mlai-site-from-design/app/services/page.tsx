import { Reveal } from '@/components/Motion';

export const metadata = {
  title: 'Services — Engagements · MLAI',
  description: 'Nine engagements with named deliverables and measurable acceptance criteria — audit to production in 90 days.',
};

const ENG = [
  ['Assess', 'cyan', 'Autonomy Readiness Audit', 'Map workflows, prompt surfaces, data paths, and approval gates to determine which tasks are safe to automate and which need human review.', ['Risk register', 'Control map', '90-day rollout plan']],
  ['Design', 'cyan', 'WDBX Retrieval Architecture', 'Design weighted backtrace retrieval pipelines that preserve source context, reduce hallucination surfaces, and support fast vector search at scale.', ['Index strategy', 'Recall benchmarks', 'Trace schema']],
  ['Build', 'cyan', 'Multi-Agent Orchestration', 'Implement agent roles, tool permissions, task handoffs, and conflict-resolution policies for complex operational workflows.', ['Agent graph', 'Tool policy', 'Evaluation harness']],
  ['Optimize', 'violet', 'Model & Runtime Optimization', 'Profile inference paths, memory pressure, GPU kernels, batching behavior, and edge constraints to improve real-world latency and cost.', ['Latency profile', 'Optimization backlog', 'Capacity model']],
  ['Protect', 'violet', 'Safety & Compliance Layering', 'Embed policy checks, audit trails, red-team scenarios, and evidence capture into AI systems that operate in regulated or high-trust contexts.', ['Policy matrix', 'Audit events', 'Red-team scripts']],
  ['Deploy', 'violet', 'Private AI Deployment', 'Package AI workflows for VPC, on-premise, offline, and hybrid environments with secret management, observability, and update paths.', ['Deployment topology', 'Runbook', 'Rollback plan']],
  ['Translate', 'emerald', 'Research Translation', 'Turn promising papers, prototypes, and notebooks into constrained, documented, production-aware services your engineers can maintain.', ['Prototype hardening', 'API contract', 'Test plan']],
  ['Align', 'emerald', 'Executive & Engineering Workshops', 'Align leadership, security, product, and engineering teams around practical autonomy strategy, risk boundaries, and delivery milestones.', ['Decision memo', 'Team training', 'Architecture review']],
  ['Sustain', 'emerald', 'Continuous Evaluation Systems', 'Build test suites that evaluate tool use, retrieval faithfulness, safety behavior, regression drift, and user-facing quality over time.', ['Eval suite', 'Scorecards', 'Release gates']],
] as const;

const FAQ = [
  ['What is the WDBX Engine?', 'The Weighted Directed Backtrace eXecution engine is a retrieval and orchestration pattern that keeps context as weighted paths. It is designed to help teams inspect why a result was produced, which sources were used, and where confidence dropped.'],
  ['How does the Abbey–Aviva–Abi framework differ from traditional agents?', 'Instead of giving one agent every responsibility, the framework separates creative planning, safety review, and technical execution. That separation makes permissions easier to reason about and gives operators clearer intervention points.'],
  ['Can MLAI systems run in private infrastructure?', 'Yes. We design for VPC, on-premise, hybrid, and offline-first deployment paths when data residency, network isolation, or customer policy requires it.'],
  ['Do you replace existing LLMs?', 'Usually no. MLAI focuses on orchestration, retrieval, evaluation, and safety layers that can sit around existing model providers or self-hosted models.'],
  ['What does an initial engagement include?', 'Most teams begin with a readiness audit: workflow mapping, data and tool inventory, failure-mode analysis, latency targets, and a staged rollout plan with measurable acceptance criteria.'],
  ['How do you test safety behavior?', 'We build scenario suites for prompt injection, source poisoning, permission escalation, contradictory context, low-confidence retrieval, and human-approval bypass attempts.'],
] as const;

export default function ServicesPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="veil"></div>
        <div className="wrap">
          <Reveal><div className="eyebrow">Engagements</div></Reveal>
          <Reveal as="h1" delay={70}>Audit to production <span className="grad-text">in 90 days.</span></Reveal>
          <Reveal as="p" className="lede" delay={140}>Every engagement ships named deliverables and measurable acceptance criteria — not a slide deck and a retainer.</Reveal>
        </div>
      </section>

      <section className="band" id="engagements">
        <div className="wrap">
          <Reveal className="sec-head"><div className="eyebrow">Nine engagements</div><h2>What we deliver</h2></Reveal>
          <div className="grid-3">
            {ENG.map(([tag, tc, t, d, chips], i) => (
              <Reveal key={t} delay={(i % 3) * 90} className="card glass">
                <div className={`tag ${tc}`}>{tag}</div><h3>{t}</h3><p className="desc">{d}</p>
                <div className="chips">{chips.map((c) => <span key={c} className="chip">{c}</span>)}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="band alt" id="faq">
        <div className="wrap">
          <Reveal className="sec-head"><div className="eyebrow">FAQ</div><h2>Asked before every engagement</h2></Reveal>
          <div className="vstack">
            {FAQ.map(([q, a], i) => (
              <Reveal key={q} delay={(i % 3) * 60} className="numrow glass">
                <div className="num">Q{i + 1}</div><div><h3>{q}</h3><p>{a}</p></div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
