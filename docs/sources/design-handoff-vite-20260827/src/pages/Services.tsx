import { Nav, Footer, Section, FeatureCard, StepList, Callout, NextUp, Eyebrow } from "mlai-site";
import { page, shell, Hero, HeroTitle, HeroSub, PillLink } from "../components/site";

export default function Services() {
  return (
    <div style={page}>
      <Nav />
      <Hero accent="#00D4FF" accent2="#10B981" keyLight="rgba(0,212,255,0.13)">
        <Eyebrow accent="wdbx">Services</Eyebrow>
        <HeroTitle>We integrate what we build.</HeroTitle>
        <HeroSub>A small systems team, hands-on with your codebase. Engagements are scoped in weeks, measured in p50s, and end with a reproducible benchmark harness in your repo.</HeroSub>
      </Hero>

      <Section eyebrow="Engagements" title="Three ways to work with us" accent="wdbx">
        <div className="mlai-g3">
          <FeatureCard accent="wdbx" title="Integration engineering" desc="WDBX and the ABI Framework embedded in your app — schema design, index tuning, SDK wiring, App Store review support." />
          <FeatureCard accent="abi" title="Benchmark validation" desc="Your workload, your hardware, our harness. Measured numbers with the tag to prove it — before you commit." />
          <FeatureCard accent="abbey" title="Private deployment" desc="Air-gapped and regulated environments: offline-first retrieval, inference, and audit where cloud egress is prohibited." />
        </div>
      </Section>

      <Section eyebrow="Process" title="How an engagement runs" lead="Four phases, no ceremony." accent="abi">
        <StepList accent="abi" steps={[
          { title: "Scope", body: "One call. What you're building, where the data has to live, what number has to move." },
          { title: "Baseline", body: "We benchmark your current stack on your hardware — the before picture, measured and tagged." },
          { title: "Integrate", body: "WDBX / ABI land in your codebase behind your interfaces. Weekly drops, no big-bang merge." },
          { title: "Hand off", body: "The harness, the docs, and the numbers stay in your repo. You can reproduce everything without us." },
        ]} />
      </Section>

      <Section eyebrow="Fit" title="What we say no to" accent="abbey">
        <div className="mlai-g2">
          <Callout accent="abbey" label="Scope discipline">
            We don't take work that puts your data in our hands. If the engagement requires your corpus to leave your hardware, the engagement is designed wrong — and we'll say so.
          </Callout>
          <Callout accent="wdbx" label="Claims discipline">
            Deliverables ship with provenance-tagged numbers. Targets are framed as targets; nothing is reported as measured until it reproduces on your hardware.
          </Callout>
        </div>
      </Section>

      <div style={{ ...shell, padding: "0 24px 56px", display: "flex", gap: 14, flexWrap: "wrap" }}>
        <PillLink to="/contact" primary>Start a conversation</PillLink>
        <PillLink to="/platform">See the platform →</PillLink>
      </div>

      <div style={{ ...shell, padding: "0 24px 96px" }}>
        <NextUp items={[
          { label: "Platform", href: "/platform", desc: "What the stack looks like assembled.", accent: "wdbx" },
          { label: "Company", href: "/company", desc: "Principles, FAQ, and the team on paper.", accent: "abbey" },
        ]} />
      </div>
      <Footer />
    </div>
  );
}
