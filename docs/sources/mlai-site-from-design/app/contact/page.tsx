import { Reveal } from '@/components/Motion';

export const metadata = {
  title: 'Contact · MLAI',
  description: 'Talk to the people who wrote the kernels. No SDRs, no sequences — mail goes to engineers.',
};

const CHANNELS = [
  ['Enterprise pilots', 'cyan', 'Teams whose data can’t leave the building', 'Healthcare, legal, finance — pilot programs open Q2 2026.', 'mailto:enterprise@mlai.dev', 'enterprise@mlai.dev'],
  ['Developers', 'cyan', 'WDBX core, ABI Framework, Swift SDK', 'Issues, benchmarks, and PRs welcome.', 'https://github.com/donaldfilimon/abi', 'github.com/donaldfilimon/abi'],
  ['Investors', 'violet', 'Pre-seed data room', 'Benchmark harness, codebase access, financial model, cap table.', 'mailto:invest@mlai.dev', 'invest@mlai.dev'],
  ['Hiring', 'emerald', 'Swift, Zig, Metal, embeddings', 'If you argue well about memory layouts, write us.', 'mailto:careers@mlai.dev', 'careers@mlai.dev'],
] as const;

export default function ContactPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="neural-host" data-neural="galaxy" data-glow="0.7" data-density="0.9" data-chain="0"></div>
        <div className="veil"></div>
        <div className="wrap">
          <Reveal><div className="eyebrow">Contact</div></Reveal>
          <Reveal as="h1" delay={70}>Talk to the people who <span className="grad-text">wrote the kernels.</span></Reveal>
          <Reveal as="p" className="lede" delay={140}>No SDRs, no sequences. Mail goes to engineers.</Reveal>
        </div>
      </section>

      <section className="band" id="channels">
        <div className="wrap">
          <div className="grid-2">
            {CHANNELS.map(([tag, tc, t, d, href, label], i) => (
              <Reveal key={tag} delay={(i % 2) * 90} className="card glass contact-card">
                <div className={`tag ${tc}`}>{tag}</div>
                <h3>{t}</h3>
                <p className="desc">{d}</p>
                <a className="mail" href={href}>{label}</a>
              </Reveal>
            ))}
          </div>
          <Reveal className="card glass contact-card" >
            <div className="tag amber">Founder</div>
            <h3>Donald Filimon</h3>
            <p className="desc">Systems architecture, partnerships, press.</p>
            <a className="mail" href="https://donaldfilimon.com">donaldfilimon.com · @donaldfilimonx</a>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
