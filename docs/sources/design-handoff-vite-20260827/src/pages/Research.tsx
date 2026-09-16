import { Nav, Footer, PublicationIndex, Glossary, NextUp, Section, Eyebrow } from "mlai-site";
import { page, shell, Hero, HeroTitle, HeroSub } from "../components/site";

export default function Research() {
  return (
    <div style={page}>
      <Nav />
      <Hero accent="#7C3AED" accent2="#00D4FF" keyLight="rgba(124,58,237,0.12)">
        <Eyebrow accent="abi">Research</Eyebrow>
        <HeroTitle>Publications</HeroTitle>
        <HeroSub>Traceable retrieval, bounded context assembly, policy-locked tool use. We publish what we can reproduce.</HeroSub>
      </Hero>

      <div style={{ ...shell, padding: "48px 24px 0" }}>
        <PublicationIndex />
      </div>

      <Section eyebrow="Glossary" title="Terms we use precisely" accent="abi">
        <Glossary items={[
          { term: "HNSW", def: "Hierarchical Navigable Small World — a layered graph index giving O(log n) approximate nearest-neighbor search." },
          { term: "MVCC", def: "Multiversion concurrency control. Readers see a consistent snapshot; writers never block them." },
          { term: "Product quantization", def: "Compressing vectors into sub-space codebooks — up to 32× smaller with minimal recall loss." },
          { term: "RAG", def: "Retrieval-augmented generation: assembling durable records into a model's context, with provenance." },
          { term: "WAL", def: "Write-ahead log. Every mutation lands in an append-only, hash-chained journal before it counts." },
          { term: "Unified memory", def: "Apple Silicon's shared CPU/GPU address space — the reason zero-copy pipelines exist." },
        ]} />
      </Section>

      <div style={{ ...shell, padding: "0 24px 96px" }}>
        <NextUp items={[
          { label: "WDBX", href: "/wdbx", desc: "The architecture most of these papers describe.", accent: "wdbx" },
          { label: "Company", href: "/company", desc: "Principles, FAQ, and contact.", accent: "abbey" },
        ]} />
      </div>
      <Footer />
    </div>
  );
}
