import { Nav, Footer, StatBlock, ProvLegend, FeatureCard, IndexCard, SpecList, DataTable, NextUp, Section } from "mlai-site";
import { page, shell, Hero, HeroTitle, HeroSub, HeroStats } from "../components/site";
import { Eyebrow } from "mlai-site";

const features = [
  { title: "HNSW index architecture", desc: "Hierarchical Navigable Small World graphs. O(log n) search. 95% recall at 8.2ms on 1M vectors." },
  { title: "Memory-mapped persistence", desc: "Zero-copy I/O with WAL journaling. Instant cold starts." },
  { title: "Scalar & product quantization", desc: "Up to 32× compression with minimal recall loss. 10B vectors addressable in 2GB RAM." },
  { title: "Metal GPU acceleration", desc: "Distance calculations on Apple GPU via the ABI Framework. First App Store-ready vector database." },
  { title: "MVCC transactions", desc: "Multiversion concurrency control. Readers never block writers; writers never block readers." },
  { title: "AES-256 + RBAC", desc: "Encryption at rest, role-based access control, audit-grade write-ahead log." },
];

export default function Wdbx() {
  return (
    <div style={page}>
      <Nav />
      <Hero accent="#00D4FF" accent2="#7C3AED" keyLight="rgba(0,212,255,0.13)">
        <Eyebrow accent="wdbx">Vector store</Eyebrow>
        <HeroTitle>The fastest vector database alive.</HeroTitle>
        <HeroSub>Zig-built vector storage with HNSW indexing, MVCC transactions, and Metal / CUDA / Vulkan backends. Runs where the data lives.</HeroSub>
        <HeroStats>
          <StatBlock accent="wdbx" stat={{ value: "2.3ms", label: "p50 search latency", tag: "measured" }} />
          <StatBlock accent="wdbx" stat={{ value: "98.2%", label: "Recall@10", tag: "measured" }} />
          <StatBlock accent="wdbx" stat={{ value: "16.5K", label: "QPS — stress-test objective", tag: "target" }} />
          <StatBlock accent="wdbx" stat={{ value: "0.8ms", label: "p50 @ 1M vectors", tag: "target" }} />
        </HeroStats>
        <div style={{ marginTop: 24 }}><ProvLegend /></div>
      </Hero>

      <Section eyebrow="Engine" title="Built close to the metal" lead="Six subsystems, one binary. No network hop between your app and its memory." accent="wdbx">
        <div className="mlai-g3">
          {features.map((f) => <FeatureCard key={f.title} accent="wdbx" title={f.title} desc={f.desc} />)}
        </div>
      </Section>

      <Section eyebrow="Index structure" title="Hierarchy that narrows fast" lead="Sparse upper layers route long hops; dense lower layers finish the search." accent="wdbx">
        <div className="mlai-g2">
          <IndexCard />
          <SpecList rows={[
            { k: "Index", v: "HNSW, M=16, efConstruction=200" },
            { k: "Distance metrics", v: "Cosine, L2, dot product" },
            { k: "Concurrency", v: "Lock-free MVCC" },
            { k: "Persistence", v: "Memory-mapped + WAL journaling" },
            { k: "Compression", v: "Scalar & product quantization, up to 32×" },
            { k: "Security", v: "AES-256 at rest, RBAC, hash-chained audit log" },
            { k: "Backends", v: "Metal / CUDA / Vulkan" },
            { k: "SDK", v: "Swift 6 native, iOS / macOS" },
          ]} />
        </div>
      </Section>

      <Section eyebrow="Scale" title="Benchmarks at three sizes" lead="Single Apple Silicon node; harness in repo. All numbers measured." accent="wdbx">
        <DataTable accent="wdbx" cols={["Metric", "100K", "1M", "10M"]} rows={[
          ["Insert throughput", "6,667/s", "6,579/s", "6,500/s"],
          ["Search latency (k=10)", "2.5ms", "8.2ms", "15.3ms"],
          ["Memory usage", "150MB", "1.5GB", "15GB"],
          ["With quantization", "20MB", "200MB", "2GB"],
        ]} />
      </Section>

      <Section eyebrow="Competitive" title="On-device changes the math" lead="Zero network latency, native SDKs, and memory footprints a phone can carry." accent="wdbx">
        <DataTable accent="wdbx" highlightCol={1} cols={["", "WDBX", "Pinecone", "Qdrant", "Chroma"]} rows={[
          ["100% on-device privacy", "Yes", "—", "Partial", "Partial"],
          ["Apple Silicon optimized", "Native Metal", "—", "—", "—"],
          ["iOS / macOS native SDK", "Swift 6", "REST only", "REST only", "Python"],
          ["Search latency (1M vectors)", "8.2ms", "50–100ms", "25ms", "30ms"],
          ["Memory (1M vectors, quantized)", "200MB", "Cloud only", "1.5GB", "1.8GB"],
          ["Integrated ML acceleration", "ABI Framework", "—", "—", "—"],
        ]} />
        <div className="mlai-g3" style={{ marginTop: 32 }}>
          <StatBlock accent="wdbx" stat={{ value: "6–12×", label: "Faster search vs cloud competitors — zero network latency", tag: "measured" }} />
          <StatBlock accent="wdbx" stat={{ value: "8×", label: "Lower memory footprint with product quantization", tag: "measured" }} />
          <StatBlock accent="wdbx" stat={{ value: "Only", label: "App Store-ready vector DB with native Swift/Metal integration", tag: "measured" }} />
        </div>
      </Section>

      <div style={{ ...shell, padding: "0 24px 96px" }}>
        <NextUp items={[
          { label: "ABI Framework", href: "/abi", desc: "The acceleration layer WDBX rides on.", accent: "abi" },
          { label: "Abbey", href: "/abbey", desc: "What verifiable memory makes possible.", accent: "abbey" },
        ]} />
      </div>
      <Footer />
    </div>
  );
}
