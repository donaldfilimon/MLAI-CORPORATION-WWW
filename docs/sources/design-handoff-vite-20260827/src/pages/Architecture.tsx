import { Nav, Footer, Section, DeepDive, SpecList, Callout, FeatureCard, NextUp, Eyebrow } from "mlai-site";
import { page, shell, Hero, HeroTitle, HeroSub } from "../components/site";

export default function Architecture() {
  return (
    <div style={page}>
      <Nav />
      <Hero accent="#7C3AED" accent2="#00D4FF" keyLight="rgba(124,58,237,0.14)">
        <Eyebrow accent="abi">Architecture</Eyebrow>
        <HeroTitle>Verifiable by architecture.</HeroTitle>
        <HeroSub>A six-layer runtime that routes, traces, and governs — over memory whose history is hash-chained. Trust is a property of the design, not a policy document.</HeroSub>
      </Hero>

      <Section eyebrow="The runtime" title="Six layers, each with one job" lead="Thin interfaces between layers keep every hop traceable." accent="abi">
        <DeepDive accent="abi" cols={3} items={[
          { title: "Interface", body: "Discord, HTTP REST, and shell surfaces. Thin adapters — no logic lives here.", meta: "L6" },
          { title: "Orchestration", body: "Intent classification and persona routing across Abbey, Aviva, and Abi.", meta: "L5" },
          { title: "Retrieval", body: "RAG over WDBX under hard token budgets, provenance attached to every chunk.", meta: "L4" },
          { title: "Acceleration", body: "Tensor operations on Metal via zero-copy unified memory.", meta: "L3" },
          { title: "Storage", body: "HNSW-indexed vectors, MVCC transactions, memory-mapped persistence.", meta: "L2" },
          { title: "Audit", body: "The hash-chained WAL. Every layer above writes its receipts here.", meta: "L1" },
        ]} />
      </Section>

      <Section eyebrow="Memory model" title="Memory you can verify" lead="Every mutation is journaled before it counts; every answer keeps its receipts." accent="wdbx">
        <div className="mlai-g2">
          <SpecList rows={[
            { k: "Journal", v: "Append-only WAL, SHA-256 chained" },
            { k: "Concurrency", v: "Lock-free MVCC snapshots" },
            { k: "Provenance", v: "Weighted directed paths per answer" },
            { k: "Rollback", v: "Point-in-time recovery per record" },
            { k: "Verification", v: "Chain check on open, on demand" },
          ]} />
          <Callout accent="wdbx" label="Why hash-chaining">
            Each write commits with a SHA-256 link to the write before it. Tamper with history anywhere and the chain breaks visibly — an audit property inherited by everything built on WDBX.
          </Callout>
        </div>
      </Section>

      <Section eyebrow="Security posture" title="Locked down by default" accent="abi">
        <div className="mlai-g3">
          <FeatureCard accent="abi" title="AES-256 at rest" desc="Encryption at rest with role-based access control over every store." />
          <FeatureCard accent="abi" title="Policy-locked tool use" desc="Planning, compliance review, and execution are separated — agents never inherit unrestricted tool authority." />
          <FeatureCard accent="abi" title="Human approval gates" desc="Operator-visible confidence signals and approval flows designed against rubber-stamping." />
        </div>
      </Section>

      <div style={{ ...shell, padding: "0 24px 96px" }}>
        <NextUp items={[
          { label: "ABI Framework", href: "/abi", desc: "The acceleration layer in depth.", accent: "abi" },
          { label: "Research", href: "/research", desc: "The papers behind the memory model.", accent: "wdbx" },
        ]} />
      </div>
      <Footer />
    </div>
  );
}
