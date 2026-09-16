import { Reveal, Counter } from '@/components/Motion';

export const metadata = {
  title: 'Investors — Pre-Seed Brief · MLAI',
  description: 'Privacy-first AI infrastructure for Apple Silicon. Pre-seed brief: market, why now, open-core model, use of funds.',
};

const TRENDS = [
  ['01', 'Hardware readiness', 'M4 @ 38 TOPS', 'Neural Engine at 38 TOPS — 60× faster than A11 Bionic. 200M+ Apple Silicon devices run 7B–13B models on-device; unified memory up to 128GB.'],
  ['02', 'Regulatory wave', '€6.2B fines', 'GDPR fines exceed €6.2B since 2018, 60% imposed since 2023. EU AI Act enforcement underway. On-device processing becomes a compliance posture, not a preference.'],
  ['03', 'Cloud cost inflection', '10× cost rise', 'H100 hours at $2–7. On-device inference carries zero marginal cost; hybrid edge cuts infrastructure spend 60–80% vs pure cloud.'],
  ['04', 'Model ecosystem maturity', 'Llama 3 era', 'Llama 3, Mistral, Phi competitive at 7B–13B. Apple Intelligence validates on-device viability and kills cloud lock-in.'],
  ['05', 'Enterprise edge adoption', '73% moving', '73% of enterprises moving to edge AI for privacy and real-time processing. Apple Intelligence hit 68–76% adoption on iOS 18.'],
] as const;

const TIERS = [
  ['Free', 'cyan', 'Open Source Core', 'Full WDBX and ABI functionality. Apache-2.0 licensed. The developer-adoption flywheel.'],
  ['$99/mo', 'cyan', 'WDBX Pro', 'Distributed clustering, advanced quantization, priority support, commercial license.'],
  ['$50K–250K', 'violet', 'Enterprise', 'SSO/RBAC, audit logging, dedicated support, custom integrations, SLA guarantees.'],
  ['Usage-based', 'emerald', 'WDBX Cloud', 'Fully managed. Pay-per-query. Hybrid cloud/edge deployment.'],
] as const;

export default function InvestorsPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="neural-host" data-neural="galaxy" data-glow="0.7" data-density="0.9" data-chain="0"></div>
        <div className="veil"></div>
        <div className="wrap">
          <Reveal><div className="eyebrow">Pre-seed brief · 18-month runway to Series A</div></Reveal>
          <Reveal as="h1" delay={70}>On-device AI is the <span className="grad-text">next platform shift.</span></Reveal>
          <Reveal as="p" className="lede" delay={140}>
            MLAI delivers privacy-first AI infrastructure purpose-built for Apple Silicon&apos;s unified memory architecture. 200M+ Apple Silicon devices, zero native vector database solutions, and 73% of enterprises moving to edge AI — positioned against the $2.88B vector database market through proven open-core monetization (GitLab, MongoDB, Elastic).
          </Reveal>
        </div>
      </section>

      <section className="band" id="market">
        <div className="wrap">
          <Reveal className="sec-head"><div className="eyebrow">Market</div><h2>The numbers underneath</h2></Reveal>
          <div className="stats cols-3">
            <Reveal className="stat c-cyan glass"><div className="v">$127B</div><div className="l">TAM</div><div className="s">global AI infrastructure</div></Reveal>
            <Reveal delay={70} className="stat c-violet glass"><div className="v">$45B</div><div className="l">SAM</div><div className="s">edge AI + privacy-first</div></Reveal>
            <Reveal delay={140} className="stat c-emerald glass"><div className="v">$2.5B</div><div className="l">SOM</div><div className="s">Apple ecosystem · year 5</div></Reveal>
            <Reveal className="stat c-cyan glass"><div className="v"><Counter to={35} suffix="%" /></div><div className="l">Vector DB CAGR</div><div className="s">market reports</div></Reveal>
            <Reveal delay={70} className="stat c-violet glass"><div className="v"><Counter to={42} suffix="%" /></div><div className="l">Edge AI CAGR</div><div className="s">market reports</div></Reveal>
            <Reveal delay={140} className="stat c-emerald glass"><div className="v">2B+</div><div className="l">Active Apple devices</div><div className="s">install base</div></Reveal>
          </div>
        </div>
      </section>

      <section className="band alt" id="whynow">
        <div className="wrap">
          <Reveal className="sec-head"><div className="eyebrow">Why now</div><h2>Five converging trends</h2><p className="sub">We saw this with iOS apps in 2008. We&apos;re seeing it again with on-device AI in 2026 — native-first builders capture the platform shift.</p></Reveal>
          <div className="vstack">
            {TRENDS.map(([n, k, t, d], i) => (
              <Reveal key={n} delay={i * 60} className="numrow glass">
                <div className="num">{n}</div><div><div className="kick">{k}</div><h3>{t}</h3><p>{d}</p></div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="band" id="model">
        <div className="wrap">
          <Reveal className="sec-head"><div className="eyebrow">Business model</div><h2>Open core, enterprise top</h2><p className="sub">The model that built GitLab, MongoDB, and Elastic: free core drives adoption; clustering, compliance, and managed hosting drive revenue.</p></Reveal>
          <div className="grid-2">
            {TIERS.map(([tag, tc, t, d], i) => (
              <Reveal key={t} delay={(i % 2) * 90} className="card glass"><div className={`tag ${tc}`}>{tag}</div><h3>{t}</h3><p className="desc">{d}</p></Reveal>
            ))}
          </div>
          <div className="stats">
            <Reveal className="stat c-cyan glass"><div className="v">$50K+</div><div className="l">Target enterprise ACV</div><div className="s">target</div></Reveal>
            <Reveal delay={70} className="stat c-violet glass"><div className="v">85%+</div><div className="l">Target gross margin</div><div className="s">target</div></Reveal>
            <Reveal delay={140} className="stat c-emerald glass"><div className="v">5:1</div><div className="l">Target LTV:CAC</div><div className="s">target</div></Reveal>
            <Reveal delay={210} className="stat c-amber glass"><div className="v">120%</div><div className="l">NRR target</div><div className="s">target</div></Reveal>
          </div>
        </div>
      </section>

      <section className="band alt" id="funds">
        <div className="wrap">
          <Reveal className="sec-head"><div className="eyebrow">Use of funds</div><h2>Deploying the $1.5M</h2></Reveal>
          <div className="stats cols-3">
            <Reveal className="stat c-cyan glass"><div className="v">$900K</div><div className="l">Engineering</div><div className="s">2 senior engineers · infra · security audits</div></Reveal>
            <Reveal delay={70} className="stat c-violet glass"><div className="v">$375K</div><div className="l">Developer relations</div><div className="s">content · community</div></Reveal>
            <Reveal delay={140} className="stat c-emerald glass"><div className="v">$225K</div><div className="l">Operations</div><div className="s">legal · compliance · admin</div></Reveal>
          </div>
        </div>
      </section>
    </main>
  );
}
