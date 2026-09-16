import { Nav, Footer, Section, FeatureCard, StatBlock, ProvLegend, SpecList, Callout, NextUp, Eyebrow } from "mlai-site";
import { page, shell, mono, Hero, HeroTitle, HeroSub, PillLink } from "../components/site";

export default function Investors() {
  return (
    <div style={page}>
      <Nav />
      <Hero accent="#7C3AED" accent2="#10B981" keyLight="rgba(124,58,237,0.12)">
        <Eyebrow accent="abi">Investors</Eyebrow>
        <HeroTitle>Infrastructure for resilient intelligence.</HeroTitle>
        <HeroSub>The AI stack is re-centralizing around a handful of clouds while the hardware in everyone's pocket gets fast enough not to need them. We build for the second curve.</HeroSub>
      </Hero>

      <Section eyebrow="Thesis" title="Why on-device wins" accent="abi">
        <div className="mlai-g3">
          <FeatureCard accent="wdbx" title="Privacy is becoming law" desc="Regulated industries increasingly cannot send corpora to third-party clouds. On-device is the compliance story, not a feature." />
          <FeatureCard accent="abi" title="The silicon is already shipped" desc="Apple Silicon's unified memory and Neural Engine sit idle in hundreds of millions of devices. We write the software that spends them." />
          <FeatureCard accent="abbey" title="Zero marginal cloud cost" desc="Local-first inference and storage carry no per-query COGS. Unit economics improve with adoption instead of degrading." />
        </div>
      </Section>

      <Section eyebrow="The numbers" title="What we can show today" lead="Provenance-tagged, reproducible on request." accent="wdbx">
        <div className="mlai-g4" style={{ width: "100%", minWidth: 0 }}>
          <StatBlock accent="wdbx" stat={{ value: "2.3ms", label: "p50 search latency", tag: "measured" }} />
          <StatBlock accent="wdbx" stat={{ value: "6–12×", label: "Faster search vs cloud competitors", tag: "measured" }} />
          <StatBlock accent="abi" stat={{ value: "84×", label: "GPU MatMul 1024×1024", tag: "measured" }} />
          <StatBlock accent="abi" stat={{ value: "295×", label: "MatMul 4096×4096 — benchmark track", tag: "target", note: "Engineering goal" }} />
        </div>
        <div style={{ marginTop: 24 }}><ProvLegend /></div>
      </Section>

      <Section eyebrow="On paper" title="The company" accent="abbey">
        <div className="mlai-g2">
          <SpecList rows={[
            { k: "Legal name", v: "Machine Learning Advanced Innovations, Inc." },
            { k: "Entity", v: "Delaware C-Corp" },
            { k: "Location", v: "Orlando, FL" },
            { k: "Products", v: "WDBX · ABI Framework · Abbey" },
            { k: "Languages", v: "Zig, Swift, TypeScript" },
            { k: "Model", v: "SDK licensing + integration services" },
          ]} />
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <Callout accent="abbey" label="How we report">
              We publish benchmarks, not roadmaps. Every figure an investor sees carries the same measured / target / reported discipline as this site.
            </Callout>
            <div>
              <p style={{ ...mono, fontSize: 11, letterSpacing: "0.2em", color: "#64748B", margin: "0 0 12px" }}>Covered by</p>
              <p style={{ ...mono, fontSize: 14, color: "#94A3B8", margin: 0, textTransform: "none" }}>
                Cult of Mac <span style={{ color: "#334155" }}>·</span> PhoneArena <span style={{ color: "#334155" }}>·</span> TechTimes
              </p>
            </div>
          </div>
        </div>
      </Section>

      <div style={{ ...shell, padding: "0 24px 56px", display: "flex", gap: 14, flexWrap: "wrap" }}>
        <PillLink to="/contact" primary>Request the deck</PillLink>
        <PillLink to="/research">Read the research →</PillLink>
      </div>

      <div style={{ ...shell, padding: "0 24px 96px" }}>
        <NextUp items={[
          { label: "Research", href: "/research", desc: "What we've published and can reproduce.", accent: "abi" },
          { label: "Company", href: "/company", desc: "Principles and the FAQ.", accent: "abbey" },
        ]} />
      </div>
      <Footer />
    </div>
  );
}
