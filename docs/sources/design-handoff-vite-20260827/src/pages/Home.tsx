import type { CSSProperties } from "react";
import { Nav, Footer, HeroBench, StatBlock, ProvLegend, PersonaCard, PullQuote, DeepDive } from "mlai-site";
import { Link } from "react-router-dom";
import { Galaxy } from "../components/Galaxy";
import { page, mono, Kicker, H2, Lead, Band, PillLink } from "../components/site";

const personaDot = (color: string) => ({
  width: 7, height: 7, borderRadius: 99, background: color, boxShadow: "0 0 10px " + color,
} as const);

const productCard = (accent: string) => ({
  "--accent": accent,
  display: "flex",
  flexDirection: "column",
  gap: 14,
  padding: "34px 30px",
  color: "#CBD5E1",
  minHeight: "100%",
  height: "100%",
  boxSizing: "border-box",
} as CSSProperties);

export default function Home() {
  return (
    <div style={page}>
      <Nav />

      {/* Hero — embedding-galaxy canvas, 64px grid, cyan key light, floor fade */}
      <div className="mlai-home-hero">
        <Galaxy accent="#00D4FF" accent2="#7C3AED" density={80} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.035) 1px,transparent 1px)", backgroundSize: "64px 64px", WebkitMaskImage: "radial-gradient(ellipse 75% 65% at 50% 30%,black,transparent)", maskImage: "radial-gradient(ellipse 75% 65% at 50% 30%,black,transparent)" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% -10%,rgba(0,212,255,0.13),transparent 62%),radial-gradient(ellipse 50% 42% at 88% 104%,rgba(124,58,237,0.12),transparent 62%)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 220, background: "linear-gradient(180deg,transparent,#05070B)" }} />
        <div className="mlai-home-hero-inner" style={{ maxWidth: 1152, margin: "0 auto" }}>
          <p style={{ ...mono, fontSize: 12, letterSpacing: "0.24em", color: "#64748B", margin: 0, animation: "mlaiRise 700ms cubic-bezier(0.22,1,0.36,1) both" }}>
            Privacy-first AI infrastructure <span style={{ color: "#334155" }}>·</span> Zig <span style={{ color: "#334155" }}>·</span> Local-first
          </p>
          <h1 className="mlai-hero-home">
            Private,{" "}
            <span style={{ background: "linear-gradient(100deg,#00D4FF,#7C3AED 60%,#10B981)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              high-performance
            </span>{" "}
            AI.
          </h1>
          <p style={{ fontSize: 19, lineHeight: 1.7, color: "#94A3B8", maxWidth: 620, margin: "26px auto 0", animation: "mlaiRise 700ms cubic-bezier(0.22,1,0.36,1) 180ms both" }}>
            From the vector engine up — WDBX, the ABI Framework, and three minds in one system. Apple Silicon-native, built on Metal, Accelerate, and Core ML.
          </p>
          <div style={{ display: "flex", gap: 14, marginTop: 40, justifyContent: "center", flexWrap: "wrap", animation: "mlaiRise 700ms cubic-bezier(0.22,1,0.36,1) 270ms both" }}>
            <PillLink to="/wdbx" primary>Explore the stack</PillLink>
            <PillLink to="/company">Request access</PillLink>
          </div>
          <div style={{ display: "flex", gap: 28, justifyContent: "center", marginTop: 56, flexWrap: "wrap", animation: "mlaiRise 700ms cubic-bezier(0.22,1,0.36,1) 360ms both" }}>
            {[["#10B981", "Abbey — Empathic"], ["#7C3AED", "Aviva — Unfiltered"], ["#00D4FF", "Abi — Adaptive"]].map(([c, label]) => (
              <span key={label} style={{ ...mono, display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11, letterSpacing: "0.14em", color: "#64748B" }}>
                <span style={personaDot(c)} /> {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 920, margin: "-20px auto 0", padding: "0 24px 48px", position: "relative" }}>
        <HeroBench />
      </div>

      <div className="brand-seam" style={{ height: 2 }} />

      <Band>
        <Kicker>01 — The stack</Kicker>
        <H2>Three products, one architecture</H2>
        <Lead>Storage, acceleration, and intelligence — each layer runs where the data lives.</Lead>
        <div className="mlai-g3 mlai-cards" style={{ marginTop: 56 }}>
          <Link to="/wdbx" className="surface surface-hover accent-edge" style={productCard("#00D4FF")}>
            <span style={{ ...mono, fontSize: 12, letterSpacing: "0.2em", color: "#475569" }}>01</span>
            <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 26, fontWeight: 700, color: "#fff" }}>WDBX</span>
            <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, color: "#00D4FF" }}>The fastest vector database alive.</span>
            <span style={{ fontSize: 15, lineHeight: 1.65, color: "#94A3B8" }}>Zig-built vector storage with HNSW indexing, MVCC transactions, and Metal / CUDA / Vulkan backends.</span>
            <span style={{ ...mono, fontSize: 12, letterSpacing: "0.15em", color: "#00D4FF", marginTop: "auto" }}>Enter →</span>
          </Link>
          <Link to="/abi" className="surface surface-hover accent-edge" style={productCard("#7C3AED")}>
            <span style={{ ...mono, fontSize: 12, letterSpacing: "0.2em", color: "#475569" }}>02</span>
            <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 26, fontWeight: 700, color: "#fff" }}>ABI Framework</span>
            <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, color: "#A78BFA" }}>Apple Silicon, fully spent.</span>
            <span style={{ fontSize: 15, lineHeight: 1.65, color: "#94A3B8" }}>Tensor operations, neural network layers, and zero-copy unified-memory pipelines in Zig + Metal.</span>
            <span style={{ ...mono, fontSize: 12, letterSpacing: "0.15em", color: "#A78BFA", marginTop: "auto" }}>Enter →</span>
          </Link>
          <Link to="/abbey" className="surface surface-hover accent-edge" style={productCard("#10B981")}>
            <span style={{ ...mono, fontSize: 12, letterSpacing: "0.2em", color: "#475569" }}>03</span>
            <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 26, fontWeight: 700, color: "#fff" }}>Abbey</span>
            <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, color: "#34D399" }}>An assistant that remembers — locally.</span>
            <span style={{ fontSize: 15, lineHeight: 1.65, color: "#94A3B8" }}>Self-learning, emotionally aware, with persistent vector-backed memory on hardware you control.</span>
            <span style={{ ...mono, fontSize: 12, letterSpacing: "0.15em", color: "#34D399", marginTop: "auto" }}>Enter →</span>
          </Link>
        </div>
      </Band>

      <Band tint>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
          <Kicker>02 — Numbers with receipts</Kicker>
          <ProvLegend />
        </div>
        <div className="mlai-g4" style={{ marginTop: 40 }}>
          <StatBlock accent="wdbx" stat={{ value: "2.3ms", label: "p50 search latency", tag: "measured" }} />
          <StatBlock accent="wdbx" stat={{ value: "98.2%", label: "Recall@10", tag: "measured" }} />
          <StatBlock accent="abi" stat={{ value: "84×", label: "MatMul 1024×1024", tag: "measured" }} />
          <StatBlock accent="abbey" stat={{ value: "0.92", label: "Abbey empathy score", tag: "reported", note: "Internal eval harness" }} />
        </div>
      </Band>

      <Band>
        <Kicker color="#34D399">03 — Personas</Kicker>
        <H2>Three minds, one system</H2>
        <Lead>Abbey, Aviva, and Abi — trained registers over shared, verifiable memory. Not prompt templates.</Lead>
        <div style={{ marginTop: 48 }}><PersonaCard /></div>
        <div style={{ marginTop: 44, maxWidth: 820 }}>
          <PullQuote accent="abbey">Think of a vector database as a library that files books by meaning, not title.</PullQuote>
        </div>
        <div style={{ marginTop: 36 }}>
          <Link to="/abbey" style={{ ...mono, fontSize: 13, letterSpacing: "0.15em", color: "#34D399" }}>Meet Abbey →</Link>
        </div>
      </Band>

      <Band tint>
        <Kicker color="#A78BFA">04 — Principles</Kicker>
        <H2>How we hold ourselves</H2>
        <div style={{ marginTop: 48 }}>
          <DeepDive
            accent="abi"
            cols={3}
            items={[
              { title: "Disciplined secrecy", body: "We publish benchmarks, not roadmaps. What ships speaks; what's in flight stays quiet until it's real." },
              { title: "Mission stewardship", body: "Privacy-first is an architecture decision, not a marketing position. Data never leaves the device unless the owner sends it." },
              { title: "Operational velocity", body: "Small team, systems languages, zero ceremony. We measure in p50s and ship in weeks." },
            ]}
          />
        </div>
      </Band>

      {/* Closing CTA over a sparser galaxy */}
      <div className="mlai-home-cta">
        <Galaxy accent="#00D4FF" accent2="#10B981" density={46} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 55% 70% at 50% 110%,rgba(0,212,255,0.1),transparent 65%)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 120, background: "linear-gradient(180deg,#0A0E16,transparent)" }} />
        <div className="mlai-home-cta-inner" style={{ maxWidth: 1152, margin: "0 auto" }}>
          <h2 className="mlai-cta-title">
            Where does your data have to live?
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: "#94A3B8", maxWidth: 520, margin: "18px auto 0" }}>
            Tell us what you're building. We onboard small batches while the SDKs harden.
          </p>
          <div style={{ display: "flex", gap: 14, marginTop: 36, justifyContent: "center", flexWrap: "wrap" }}>
            <PillLink to="/contact" primary>Request access</PillLink>
            <PillLink to="/research">Read the research →</PillLink>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
