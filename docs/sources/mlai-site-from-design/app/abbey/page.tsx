import { Reveal, Counter } from '@/components/Motion';

export const metadata = {
  title: 'Abbey — AI Assistant · MLAI',
  description: 'Self-learning, emotionally aware AI assistant with persistent vector-backed memory. Every conversation stays on hardware you control.',
  openGraph: {
    title: 'The Personas — three minds, one system',
    description: 'Abbey, Aviva, Abi. One question — routed, blended, answered.',
    images: [{ url: '/og/og-personas.png', width: 1200, height: 630, alt: 'The MLAI personas — three minds, one system' }],
  },
};

const MINDS = [
  { tag: 'Empathetic Polymath', tc: 'emerald', n: 'Abbey', d: 'Creative problem solver with emotional awareness. Training penalizes unsupportive phrasing via an explicit empathy loss term.' },
  { tag: 'Unfiltered Expert', tc: 'violet', n: 'Aviva', d: 'Direct technical answers, minimal hedging. A conciseness loss term penalizes filler tokens — fewer tokens, lower latency, lower energy.' },
  { tag: 'Adaptive Moderator', tc: 'cyan', n: 'Abi', d: 'Routes each query to the right persona via argmax over P(persona | input, context), with continuous blending when a query needs both.' },
];

export default function AbbeyPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="neural-host" data-neural="galaxy" data-glow="0.7" data-density="0.9" data-chain="0"></div>
        <div className="veil"></div>
        <div className="wrap">
          <Reveal><div className="eyebrow">Application layer · Bun + TypeScript → Swift 6</div></Reveal>
          <Reveal as="h1" delay={70}>An assistant that <span className="grad-text">remembers — locally.</span></Reveal>
          <Reveal as="p" className="lede" delay={140}>
            Self-learning, emotionally aware AI assistant with persistent vector-backed memory. Every conversation stays on hardware you control.
          </Reveal>
        </div>
      </section>

      <section className="band" id="capabilities">
        <div className="wrap">
          <Reveal className="sec-head"><div className="eyebrow">Capabilities</div><h2>What Abbey does</h2></Reveal>
          <div className="grid-2">
            <Reveal className="card glass"><div className="tag cyan">Providers</div><h3>Multi-provider LLM support</h3><p className="desc">OpenAI, Anthropic, and local models via Ollama. Seamless provider switching.</p></Reveal>
            <Reveal delay={90} className="card glass"><div className="tag cyan">Memory</div><h3>Vector-based semantic memory</h3><p className="desc">Powered by WDBX. Remembers conversations, learns preferences — all stored locally.</p></Reveal>
            <Reveal className="card glass"><div className="tag violet">Interface</div><h3>Multi-platform interface</h3><p className="desc">Discord-native today (Bun + TypeScript + discord.js v14). HTTP REST for apps. Voice capable.</p></Reveal>
            <Reveal delay={90} className="card glass"><div className="tag emerald">Register</div><h3>Emotional intelligence</h3><p className="desc">Technical precision balanced with empathetic communication, tuned per persona.</p></Reveal>
          </div>
        </div>
      </section>

      <section className="band alt" id="minds">
        <div className="wrap">
          <Reveal className="sec-head">
            <div className="eyebrow">Multi-persona architecture</div>
            <h2>Three minds, one router</h2>
            <p className="sub">A single model can&apos;t optimize for empathy and terseness simultaneously — the objectives fight inside one set of weights. So we don&apos;t make it.</p>
          </Reveal>
          <div className="grid-3">
            {MINDS.map((m, i) => (
              <Reveal key={m.n} delay={i * 90} className="card glass">
                <div className={`tag ${m.tc}`}>{m.tag}</div><h3>{m.n}</h3><p className="desc">{m.d}</p>
              </Reveal>
            ))}
          </div>
          <div className="stats">
            <Reveal className="stat c-emerald glass"><div className="v"><Counter to={0.92} decimals={2} /></div><div className="l">Abbey empathy score</div><div className="s">internal eval harness</div></Reveal>
            <Reveal delay={70} className="stat c-emerald glass"><div className="v"><Counter to={90.5} decimals={1} suffix="%" /></div><div className="l">Abbey technical accuracy</div><div className="s">internal eval harness</div></Reveal>
            <Reveal delay={140} className="stat c-violet glass"><div className="v"><Counter to={30} suffix="%" /></div><div className="l">Aviva latency reduction</div><div className="s">vs hedged responses</div></Reveal>
            <Reveal delay={210} className="stat c-violet glass"><div className="v"><Counter to={40} suffix="%" /></div><div className="l">Aviva content density gain</div><div className="s">conciseness loss term</div></Reveal>
          </div>
        </div>
      </section>

      <section className="band" id="status">
        <div className="wrap">
          <Reveal className="sec-head"><div className="eyebrow">Platform status</div><h2>Where Abbey runs</h2><p className="sub">Shipping where the communities are first; the native port follows.</p></Reveal>
          <Reveal>
            <ul className="status">
              <li><span className="dot on"></span> Discord (Bun + discord.js v14) <span className="st">shipping</span></li>
              <li><span className="dot off"></span> Swift 6 / Vapor 4 / DiscordBM port <span className="st">in progress</span></li>
              <li><span className="dot off"></span> Python + Twitch expansion <span className="st">in progress</span></li>
            </ul>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
