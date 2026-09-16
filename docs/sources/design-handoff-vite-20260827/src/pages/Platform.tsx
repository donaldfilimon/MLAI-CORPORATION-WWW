import type { CSSProperties } from "react";
import { Nav, Footer, Section, StepList, SpecList, Callout, NextUp, Eyebrow } from "mlai-site";
import { Link } from "react-router-dom";
import { page, shell, mono, Hero, HeroTitle, HeroSub } from "../components/site";

const layerRow = (accent: string) => ({
  "--accent": accent,
  padding: "28px 30px",
  color: "#CBD5E1",
} as CSSProperties);

const layers = [
  { to: "/wdbx", accent: "#00D4FF", tier: "L1", name: "WDBX", desc: "Vector storage. HNSW indexing, MVCC transactions, hash-chained audit log.", cta: "Store →", ctaColor: "#00D4FF" },
  { to: "/abi", accent: "#7C3AED", tier: "L2", name: "ABI Framework", desc: "Acceleration and orchestration. Tensor ops on Metal, persona routing, tracing.", cta: "Accelerate →", ctaColor: "#A78BFA" },
  { to: "/abbey", accent: "#10B981", tier: "L3", name: "Abbey", desc: "Intelligence. Three persona registers over persistent, verifiable memory.", cta: "Remember →", ctaColor: "#34D399" },
];

export default function Platform() {
  return (
    <div style={page}>
      <Nav />
      <Hero accent="#00D4FF" accent2="#7C3AED" keyLight="rgba(0,212,255,0.13)">
        <Eyebrow accent="wdbx">Platform</Eyebrow>
        <HeroTitle>One stack, no seams.</HeroTitle>
        <HeroSub>WDBX stores, ABI accelerates, Abbey remembers — one binary, one memory, zero network hops. Every layer runs on hardware you control.</HeroSub>
      </Hero>

      <Section eyebrow="The layers" title="Storage up to intelligence" lead="Three products, deliberately thin interfaces between them." accent="wdbx">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {layers.map((l) => (
            <Link key={l.tier} to={l.to} className="surface surface-hover accent-edge mlai-layer-row" style={layerRow(l.accent)}>
              <span style={{ ...mono, fontSize: 12, letterSpacing: "0.2em", color: "#475569" }}>{l.tier}</span>
              <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 700, color: "#fff" }}>{l.name}</span>
              <span style={{ fontSize: 15, lineHeight: 1.6, color: "#94A3B8" }}>{l.desc}</span>
              <span style={{ ...mono, fontSize: 12, letterSpacing: "0.15em", color: l.ctaColor }}>{l.cta}</span>
            </Link>
          ))}
        </div>
      </Section>

      <Section eyebrow="Data flow" title="From input to auditable answer" lead="The same four hops, whether the caller is an app, a bot, or a shell." accent="abi">
        <StepList accent="abi" steps={[
          { title: "Embed", body: "Content becomes vectors on-device via the ABI tensor pipeline. Nothing is uploaded to be understood." },
          { title: "Index", body: "WDBX files each vector into the HNSW graph inside an MVCC transaction; the WAL records the write before it counts." },
          { title: "Retrieve", body: "Queries pull durable records under a hard token budget, with provenance attached to every chunk." },
          { title: "Govern", body: "Every hop lands in the hash-chained audit trail. Answers keep their receipts; operators keep rollback points." },
        ]} />
      </Section>

      <Section eyebrow="Deployment" title="Runs where the data lives" accent="wdbx">
        <div className="mlai-g2">
          <SpecList rows={[
            { k: "Targets", v: "macOS / iOS (Swift 6 SDK)" },
            { k: "GPU backends", v: "Metal · CUDA · Vulkan" },
            { k: "Binary", v: "Single static binary, Zig-built" },
            { k: "Network", v: "None required in the request path" },
            { k: "Cloud LLMs", v: "Optional, explicit, off by default" },
          ]} />
          <Callout accent="wdbx" label="Local-first, by construction">
            There is no MLAI cloud in the request path. Cloud LLM providers are optional, explicit, and off by default — the storage, index, and audit trail never leave the device.
          </Callout>
        </div>
      </Section>

      <div style={{ ...shell, padding: "0 24px 96px" }}>
        <NextUp items={[
          { label: "Architecture", href: "/architecture", desc: "The six layers and the verifiable memory model.", accent: "abi" },
          { label: "WDBX", href: "/wdbx", desc: "Start at the storage layer.", accent: "wdbx" },
        ]} />
      </div>
      <Footer />
    </div>
  );
}
