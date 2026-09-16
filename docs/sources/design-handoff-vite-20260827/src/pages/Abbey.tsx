import { Nav, Footer, StatBlock, ProvLegend, FeatureCard, PersonaCard, PullQuote, SpecList, NextUp, Section, Eyebrow } from "mlai-site";
import { page, shell, Hero, HeroTitle, HeroSub } from "../components/site";

const capabilities = [
  { title: "Vector-based semantic memory", desc: "Powered by WDBX. Remembers conversations, learns preferences — all stored locally." },
  { title: "Multi-provider LLM support", desc: "OpenAI, Anthropic, and local models via Ollama. Seamless provider switching." },
  { title: "Multi-platform interface", desc: "Discord-native today. HTTP REST for apps. Voice capable." },
  { title: "Emotional intelligence", desc: "Technical precision balanced with empathetic communication, tuned per persona." },
];

export default function Abbey() {
  return (
    <div style={page}>
      <Nav />
      <Hero accent="#10B981" accent2="#00D4FF" keyLight="rgba(16,185,129,0.12)">
        <Eyebrow accent="abbey">Personas</Eyebrow>
        <HeroTitle>An assistant that remembers — locally.</HeroTitle>
        <HeroSub>Self-learning, emotionally aware AI assistant with persistent vector-backed memory. Every conversation stays on hardware you control.</HeroSub>
      </Hero>

      <Section eyebrow="Three minds" title="One system, three registers" lead="Each persona is a trained register with its own loss terms — not a prompt template." accent="abbey">
        <PersonaCard />
        <div style={{ marginTop: 32 }}>
          <PullQuote accent="abbey">Think of a vector database as a library that files books by meaning, not title.</PullQuote>
        </div>
      </Section>

      <Section eyebrow="Capabilities" title="What Abbey can do" lead="Memory, providers, platforms, and tone — all local-first." accent="abbey">
        <div className="mlai-g2" style={{ gap: 20 }}>
          {capabilities.map((f) => <FeatureCard key={f.title} accent="abbey" title={f.title} desc={f.desc} />)}
        </div>
      </Section>

      <Section eyebrow="Evaluation" title="Persona scores" lead="Internal eval harness; reported figures." accent="abbey">
        <div className="mlai-g4" style={{ width: "100%", minWidth: 0 }}>
          <StatBlock accent="abbey" stat={{ value: "0.92", label: "Abbey empathy score", tag: "reported", note: "Internal eval harness" }} />
          <StatBlock accent="abbey" stat={{ value: "90.5%", label: "Abbey technical accuracy", tag: "reported", note: "Internal eval harness" }} />
          <StatBlock accent="wdbx" stat={{ value: "30%", label: "Aviva latency reduction vs hedged responses", tag: "reported" }} />
          <StatBlock accent="wdbx" stat={{ value: "40%", label: "Aviva content density gain", tag: "reported" }} />
        </div>
        <div style={{ marginTop: 24 }}><ProvLegend /></div>
      </Section>

      <Section eyebrow="Platforms" title="Where Abbey runs" accent="abbey">
        <SpecList rows={[
          { k: "Discord (Bun + discord.js v14)", v: "Shipping" },
          { k: "Swift 6 / Vapor 4 / DiscordBM port", v: "In progress" },
          { k: "Python + Twitch expansion", v: "In progress" },
        ]} />
      </Section>

      <div style={{ ...shell, padding: "0 24px 96px" }}>
        <NextUp items={[
          { label: "WDBX", href: "/wdbx", desc: "The memory Abbey trusts.", accent: "wdbx" },
          { label: "Research", href: "/research", desc: "The papers behind the personas.", accent: "abi" },
        ]} />
      </div>
      <Footer />
    </div>
  );
}
