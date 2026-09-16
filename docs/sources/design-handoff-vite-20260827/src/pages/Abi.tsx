import { Nav, Footer, StatBlock, ProvLegend, FeatureCard, ThroughputCard, SpecList, StepList, NextUp, Section, Eyebrow } from "mlai-site";
import { page, shell, Hero, HeroTitle, HeroSub, HeroStats } from "../components/site";

const features = [
  { title: "Tensor operations", desc: "N-dimensional tensors with automatic differentiation. SIMD-optimized CPU paths plus Metal GPU kernels." },
  { title: "GPU context management", desc: "Metal Performance Shaders integration, automatic kernel selection, async pipelines." },
  { title: "Neural network layers", desc: "Dense, Conv2D, LSTM, Attention. ReLU, Sigmoid, Softmax. Full backpropagation." },
  { title: "Zero-copy operations", desc: "Unified memory eliminates host↔device transfers. Span-based APIs, actor-based concurrency." },
  { title: "Multi-persona orchestration", desc: "Intent classification, persona routing across Abbey / Aviva / Abi, RAG over WDBX, DQN reward loop." },
  { title: "Comptime specialization", desc: "Zig compile-time execution pre-computes lookup tables and vectorized kernels for the exact target ISA." },
];

export default function Abi() {
  return (
    <div style={page}>
      <Nav />
      <Hero accent="#7C3AED" accent2="#00D4FF" keyLight="rgba(124,58,237,0.14)">
        <Eyebrow accent="abi">ML &amp; GPU acceleration</Eyebrow>
        <HeroTitle>Apple Silicon, fully spent.</HeroTitle>
        <HeroSub>ML and GPU acceleration framework: tensor operations, neural network layers, and zero-copy unified-memory pipelines in Zig + Metal.</HeroSub>
        <HeroStats>
          <StatBlock accent="abi" stat={{ value: "5×", label: "MatMul 128×128", tag: "measured" }} />
          <StatBlock accent="abi" stat={{ value: "84×", label: "MatMul 1024×1024", tag: "measured" }} />
          <StatBlock accent="abi" stat={{ value: "295×", label: "MatMul 4096×4096 — benchmark track", tag: "target", note: "Matrix workload objective" }} />
          <StatBlock accent="abi" stat={{ value: "13×", label: "10-layer neural net", tag: "measured" }} />
        </HeroStats>
        <div style={{ marginTop: 24 }}><ProvLegend /></div>
      </Hero>

      <Section eyebrow="Throughput" title="The speedup ladder" lead="GPU speedups over CPU baselines grow with the workload." accent="abi">
        <div className="mlai-g2">
          <ThroughputCard />
          <SpecList rows={[
            { k: "Unified memory bandwidth", v: "546 GB/s" },
            { k: "Neural Engine (M4)", v: "38 TOPS" },
            { k: "Power efficiency", v: "200 GFLOPS/W" },
            { k: "Language", v: "Zig 0.17-dev + Metal" },
            { k: "Frameworks", v: "Metal, Accelerate, Core ML" },
          ]} />
        </div>
      </Section>

      <Section eyebrow="Capabilities" title="What the runtime carries" lead="From tensor math to multi-persona orchestration — one framework, no glue code." accent="abi">
        <div className="mlai-g3">
          {features.map((f) => <FeatureCard key={f.title} accent="abi" title={f.title} desc={f.desc} />)}
        </div>
      </Section>

      <Section eyebrow="Pipeline" title="From query to answer" lead="The orchestration path every request takes." accent="abi">
        <StepList accent="abi" steps={[
          { title: "Classify intent", body: "Abi scores the incoming query and picks a persona register — or a blend." },
          { title: "Retrieve context", body: "RAG over WDBX pulls durable records under a hard token budget, with provenance attached." },
          { title: "Accelerate inference", body: "Tensor work lands on Metal via zero-copy unified memory. No host↔device transfers." },
          { title: "Trace and govern", body: "Every hop is logged to the hash-chained audit trail. Answers keep their receipts." },
        ]} />
      </Section>

      <div style={{ ...shell, padding: "0 24px 96px" }}>
        <NextUp items={[
          { label: "WDBX", href: "/wdbx", desc: "The vector store this runtime accelerates.", accent: "wdbx" },
          { label: "Abbey", href: "/abbey", desc: "The assistant built on both.", accent: "abbey" },
        ]} />
      </div>
      <Footer />
    </div>
  );
}
