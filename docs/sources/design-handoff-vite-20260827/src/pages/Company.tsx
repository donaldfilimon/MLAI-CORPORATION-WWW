import { Nav, Footer, DeepDive, SpecList, Callout, FAQList, Section, Eyebrow } from "mlai-site";
import { page, mono, Hero, HeroTitle, HeroSub, PillLink, CONTACT_EMAIL } from "../components/site";

export default function Company() {
  return (
    <div style={page}>
      <Nav />
      <Hero accent="#10B981" accent2="#7C3AED" keyLight="rgba(16,185,129,0.12)">
        <Eyebrow accent="abbey">Company</Eyebrow>
        <HeroTitle>Machine Learning Advanced Innovations</HeroTitle>
        <HeroSub>Privacy-first AI infrastructure for Apple Silicon. Built on Apple's public frameworks — Metal, Accelerate, and Core ML.</HeroSub>
      </Hero>

      <Section eyebrow="Principles" title="How we hold ourselves" accent="abbey">
        <DeepDive accent="abbey" cols={3} items={[
          { title: "Disciplined secrecy", body: "We publish benchmarks, not roadmaps. What ships speaks; what's in flight stays quiet until it's real." },
          { title: "Mission stewardship", body: "Privacy-first is an architecture decision, not a marketing position. Data never leaves the device unless the owner sends it." },
          { title: "Operational velocity", body: "Small team, systems languages, zero ceremony. We measure in p50s and ship in weeks." },
        ]} />
      </Section>

      <Section eyebrow="Facts" title="The company on paper" accent="abbey">
        <div className="mlai-g2">
          <SpecList rows={[
            { k: "Legal name", v: "Machine Learning Advanced Innovations, Inc." },
            { k: "Entity", v: "Delaware C-Corp" },
            { k: "Location", v: "Orlando, FL" },
            { k: "Focus", v: "Privacy-first AI infrastructure for Apple Silicon" },
            { k: "Languages", v: "Zig, Swift, TypeScript" },
          ]} />
          <Callout accent="abbey" label="Claims discipline">
            Every number on this site carries a provenance tag — measured, target, or reported. Goals are framed as goals, never as achievements.
          </Callout>
        </div>
      </Section>

      <Section eyebrow="FAQ" title="Common questions" accent="abbey">
        <FAQList accent="abbey" items={[
          { q: "Does my data ever leave my device?", a: "Not unless you send it. Storage, indexing, and inference run locally; cloud LLM providers are optional and explicit." },
          { q: "What platforms are supported?", a: "macOS and iOS natively via Swift 6 SDKs. WDBX backends target Metal, CUDA, and Vulkan. Abbey ships on Discord today, with Swift and Python ports in progress." },
          { q: "Are the benchmark numbers verified?", a: "Every figure carries a provenance tag. Measured means reproduced on hardware with the harness in the repo; target is an engineering goal; reported is a cited internal figure." },
          { q: "How do the three personas differ?", a: "They're trained registers, not prompt templates. Abbey optimizes for empathy, Aviva for density and speed, and Abi routes between them per query." },
          { q: "How do I get access?", a: "Email us with what you're building and where the data has to live. We onboard small batches while the SDKs harden." },
        ]} />
      </Section>

      <Section eyebrow="Contact" title="Request access" lead="Tell us what you're building and where the data has to live." accent="wdbx">
        <div id="contact" style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
          <a href={"mailto:" + CONTACT_EMAIL} style={{ ...mono, border: "1px solid #00D4FF", background: "#00D4FF", color: "#05070B", padding: "12px 22px", fontSize: 13, fontWeight: 600, letterSpacing: "0.15em" }}>
            {CONTACT_EMAIL}
          </a>
          <PillLink to="/research">Read the research →</PillLink>
        </div>
      </Section>
      <Footer />
    </div>
  );
}
