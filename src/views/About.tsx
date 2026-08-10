import { Link } from "react-router-dom";
import { about, companyFacts, investorThesis } from '@/data/categories/about';
import { Button } from "@/components/ui/button";
import { ContactCTA } from "../components/ContactCTA";
import { useUI } from "@/lib/ui-context";
import { PageHeader } from "@/components/PageHeader";
import { CardGrid } from "@/components/CardGrid";
import {
  Callout,
  FeatureCard,
  Section,
  SpecList,
  SplitSection,
} from "@/components/site";

// The mono rail beside the page header — four standing facts, one per row.
const identity = [
  "ESTABLISHED 2024 · ORLANDO, FL",
  "PIONEERING WDBX ARCHITECTURE",
  "TRACEABLE RETRIEVAL AND AGENT SAFETY FOCUS",
  "AUDIT-READY SECURITY CONTROLS",
];

// The mission band's standing facts. These are descriptive facts, not
// measurements, which is why they go in a `SpecList` rather than a
// provenance-tagged `StatBlock`.
const missionFacts = [
  { k: "Founded", v: "2024" },
  { k: "Private-First Patterns", v: "Local" },
  { k: "Research Network", v: "Global" },
];

export const About = () => {
  const { openInquiry } = useUI();
  return (
    <section
      id="about"
      className="section-y bg-surface/50 relative overflow-hidden noise-overlay"
      aria-labelledby="about-heading"
    >
      <div className="container-custom relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <PageHeader
              id="about-heading"
              tag="WHO WE ARE"
              title="Rooted in Research. Driven by Reliability."
              subtitle="MLAI Corporation emerged from the intersection of deep neural research and the critical need for structural AI reliability. We don't just build models — we build the foundational layers that allow models to operate safely in the most demanding environments on Earth."
              className="mb-8"
            />

            <ul
              className="space-y-4 font-mono text-sm text-cyan-400/80 mb-8"
              role="list"
            >
              {identity.map((fact) => (
                <li key={fact} className="flex items-center gap-3">
                  <span
                    className="w-1.5 h-1.5 shrink-0 rounded-full bg-cyan-400"
                    aria-hidden="true"
                  />
                  {fact}
                </li>
              ))}
            </ul>

            <Link to="/research">
              <Button
                variant="outline"
                className="inline-flex items-center gap-2 text-sm"
              >
                Read Our Research →
              </Button>
            </Link>
          </div>

          <CardGrid cols={2} className="gap-5">
            {about.values.map((item) => (
              <FeatureCard
                key={item.title}
                title={item.title}
                desc={item.description}
              />
            ))}
          </CardGrid>
        </div>
      </div>

      {/*
        `SplitSection`/`Section` supply their own page gutter, so they sit as
        siblings of the container above rather than inside it. `relative z-10`
        is load-bearing: `.noise-overlay::before` is positioned at `z-index: 0`
        and would otherwise paint over static-flow content.
      */}
      <SplitSection
        kicker="Our Mission"
        title="Ensuring the Safety of Autonomous Progress."
        className="relative z-10"
      >
        <p>
          As AI systems transition from generative tools to autonomous agents,
          the margin for error disappears. Our mission is to provide the
          structural integrity required for this transition, building the
          guardrails, backtrace engines, and orchestration layers that make
          autonomous intelligence a force for positive, predictable change.
        </p>
        <SpecList rows={missionFacts} />
      </SplitSection>

      {/* Operating principles — accent-edged asides, read as a rules list. */}
      <Section className="relative z-10 py-0">
        <CardGrid cols={2} className="gap-4">
          {about.operatingPrinciples.map((principle) => (
            <Callout key={principle}>{principle}</Callout>
          ))}
        </CardGrid>
      </Section>

      {/* Positioning thesis — three claim-free cards; copy lives in about.ts. */}
      <Section
        eyebrow="Thesis"
        title="Why on-device wins"
        className="relative z-10"
      >
        <CardGrid cols={3} className="gap-5">
          {investorThesis.map((item) => (
            <FeatureCard
              key={item.title}
              title={item.title}
              desc={item.description}
            />
          ))}
        </CardGrid>
      </Section>

      {/*
        Registration-level facts, so a `SpecList` (configuration facts), not a
        provenance-tagged `StatBlock` — same reasoning as `missionFacts` above.
      */}
      <Section
        eyebrow="Facts"
        title="The company on paper"
        className="relative z-10 py-0"
      >
        <SpecList rows={companyFacts} className="max-w-2xl" />
      </Section>

      <ContactCTA onOpenInquiry={openInquiry} />
    </section>
  );
};
