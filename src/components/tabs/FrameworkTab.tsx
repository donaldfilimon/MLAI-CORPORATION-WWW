import React from "react";
import { cn } from "../../lib/utils";
import {
  Network,
  Server,
  Zap,
  Database,
  Layers,
  Brain,
  BarChart,
  FileText,
} from "lucide-react";

export function FrameworkTab({ theme }: { theme: any }) {
  return (
    <div className="pt-6 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="space-y-4 border-b border-white/10 pb-6">
        <h1 className="technical-label text-[14px] flex items-center gap-2 text-white">
          <Database className="w-5 h-5 text-emerald-400" />
          High-Performance Neural State Management
        </h1>
        <p className="text-emerald-400 text-sm font-bold tracking-widest uppercase mb-2">
          A Comprehensive Technical Analysis of WDBX and Multi-Persona AI
          Architectures
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. Introduction */}
        <div className="space-y-4">
          <h2 className="technical-label text-white text-[12px] flex items-center gap-2">
            <span className="bg-emerald-400 text-black px-1.5 py-0.5 rounded-sm">
              1
            </span>
            Introduction: Paradigm Shift in AI Architectures
          </h2>
          <p className="text-text-dim text-[11px] font-mono leading-relaxed text-justify">
            The contemporary landscape of Artificial Intelligence (AI) and
            Machine Learning (ML) is currently navigating a critical inflection
            point. For the past decade, the dominant paradigm has been
            characterized by the pursuit of monolithic Large Language Models
            (LLMs)—singular, gigantic neural networks trained to be universally
            capable across an exhaustive range of tasks. Models such as GPT-4,
            PaLM 2, and Claude have demonstrated remarkable proficiency.
            However, as these models scale, they increasingly encounter the
            "curse of universality." The operational requirement to balance
            competing objectives—such as creative empathy versus rigid factual
            accuracy—within a single set of weights creates inherent performance
            trade-offs.
          </p>
          <div className="glass-card p-4 border-l-2 border-emerald-400 bg-emerald-400/5">
            <p className="text-text-dim text-[11px] font-mono leading-relaxed text-justify">
              To address these systemic limitations, a new architectural
              philosophy has emerged: the <b>Multi-Persona AI Framework</b>,
              underpinned by specialized, high-performance state management
              systems like the <b>Wide Distributed Block Exchange (WDBX)</b>.
              Traditional RDBMS and NoSQL stores were not architected for
              massive concurrency and vector workloads. WDBX was developed as a
              purpose-built computational substrate combining intelligent
              sharding, immutable integrity, and non-blocking Multiversion
              Concurrency Control (MVCC).
            </p>
          </div>
        </div>

        {/* 2. WDBX Architecture Specifications */}
        <div className="space-y-4">
          <h2 className="technical-label text-white text-[12px] flex items-center gap-2">
            <span className="bg-emerald-400 text-black px-1.5 py-0.5 rounded-sm">
              2
            </span>
            WDBX: Architectural Specifications
          </h2>
          <p className="text-text-dim text-[11px] font-mono leading-relaxed">
            The foundational bedrock of the framework is WDBX, addressing the
            challenge of sub-millisecond vector retrieval through a novel
            synthesis of distributed systems theory.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="glass-card p-4 space-y-3">
              <h3 className="technical-label text-[11px] text-emerald-400">
                2.1.1 Intelligent Sharding & Latency
              </h3>
              <p className="text-text-dim text-[10px] font-mono">
                Employs a predictive sharding mechanism. The linear latency
                model suggests{" "}
                {"$L_{shard} = \\alpha + \\frac{\\beta \\cdot S}{n}$"}. While a
                linear model is idealistic, rigid scalability requires applying
                the Universal Scalability Law (USL), taking into account
                contention ({"$\\sigma$"}) and coherency ({"$\\kappa$"}). WDBX
                approximates the ideal linear model through shared-nothing
                architectures minimizing {"$\\kappa$"}.
              </p>
            </div>

            <div className="glass-card p-4 space-y-3">
              <h3 className="technical-label text-[11px] text-emerald-400">
                2.1.2 Block Chaining: Integrity & Backtracking
              </h3>
              <p className="text-text-dim text-[10px] font-mono">
                Incorporates a Block Chaining Protocol for Neural Backtracking
                and integrity, hashing sequentially:{" "}
                {
                  "$H_{block\\_i} = \\text{SHA256}(Data_i \\oplus H_{block\\_i-1})$"
                }
                . This is implemented at the transaction log (WAL) level to
                ensure vector searches remain fast while maintaining an
                immutable audit trail for identifying hallucination divergence.
              </p>
            </div>

            <div className="glass-card p-4 space-y-3">
              <h3 className="technical-label text-[11px] text-emerald-400">
                2.1.3 Multiversion Concurrency Control (MVCC)
              </h3>
              <p className="text-text-dim text-[10px] font-mono">
                Handles high concurrency without read-locks. Writers create new
                versions of data rather than overwriting, essential for
                maintaining throughput without stalling readers.
              </p>
            </div>

            <div className="glass-card p-4 space-y-3 border-emerald-400/30 border">
              <h3 className="technical-label text-[11px] text-white flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-400" /> Implementation: Zig
              </h3>
              <p className="text-text-dim text-[10px] font-mono">
                WDBX and ABI Agent runtime are implemented in Zig 0.16.0-dev. It
                guarantees memory safety without Garbage Collection (GC)
                pauses—eliminating tail latency spikes. Comptime execution
                allows pre-computation of vector lookup tables, reducing runtime
                latency constant $\beta$.
              </p>
            </div>
          </div>
        </div>

        {/* 3. The Multi-Persona Ecosystem */}
        <div className="space-y-4">
          <h2 className="technical-label text-white text-[12px] flex items-center gap-2">
            <span className="bg-emerald-400 text-black px-1.5 py-0.5 rounded-sm">
              3
            </span>
            The Multi-Persona Ecosystem
          </h2>
          <div className="space-y-3">
            <h3 className="technical-label text-[11px] text-white">
              Abi: Adaptive Moderator
            </h3>
            <p className="text-text-dim text-[10px] font-mono ml-4 border-l border-emerald-400/30 pl-3">
              Acts as the executive function routing inputs:{" "}
              {
                "$p_{selected} = \\underset{p \\in \\{Abbey, Aviva\\}}{\\text{argmax}} P(p \\mid I, C)$"
              }
              . Can perform Dynamic Persona Blending:{" "}
              {
                "$R_{final} = \\alpha \\cdot R_{Abbey} + (1 - \\alpha) \\cdot R_{Aviva}$"
              }
            </p>

            <h3 className="technical-label text-[11px] text-white">
              Abbey & Aviva: Specialized Models
            </h3>
            <ul className="text-text-dim text-[10px] font-mono ml-4 space-y-1 list-disc pl-4">
              <li>
                <b>Abbey (Empathetic):</b> Optimized for high-EQ. Includes
                penalty term {"$L_{empathy}$"} favoring supportive language.
              </li>
              <li>
                <b>Aviva (Expert):</b> Optimized for high-IQ, low-latency.
                Includes {"$L_{conciseness}$"} penalizing unnecessary tokens.
              </li>
            </ul>
          </div>
        </div>

        {/* 4. Math Foundations & 5. Energy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="technical-label text-white text-[12px] flex items-center gap-2">
              <span className="bg-emerald-400 text-black px-1.5 py-0.5 rounded-sm">
                4
              </span>
              Mathematical Foundations
            </h2>
            <div className="glass-card p-4 space-y-2">
              <h3 className="technical-label text-[10px] text-emerald-400">
                Little’s Law ($L = \lambda W$)
              </h3>
              <p className="text-text-dim text-[10px] font-mono">
                Reported latency (0.11s), Throughput (90 req/s), derived
                Concurrency $L \approx 9.9$ concurrent requests. This low
                concurrency requirement highlights Zig-based architecture
                efficiency, vastly reducing needed hardware footprints compared
                to a 2s latency model like GPT-4 needing 180 concurrent threads
                to match.
              </p>
            </div>
            <div className="glass-card p-4 space-y-2">
              <h3 className="technical-label text-[10px] text-emerald-400">
                Vector Similarity Metrics
              </h3>
              <p className="text-text-dim text-[10px] font-mono">
                Utilizes computationally normalized <b>Cosine Similarity</b> for
                semantic retrieval. For anomaly detection, it shifts to
                Euclidean Distance ($L2$ Norm).
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="technical-label text-white text-[12px] flex items-center gap-2">
              <span className="bg-emerald-400 text-black px-1.5 py-0.5 rounded-sm">
                5
              </span>
              Energy Consumption Efficiency
            </h2>
            <div className="glass-card p-4 space-y-2 bg-[#134e4a]/10 border border-[#134e4a]">
              <h3 className="technical-label text-[10px] text-emerald-400">
                The "15 kWh" Methodology
              </h3>
              <p className="text-text-dim text-[10px] font-mono">
                WDBX metric relies on 15 kWh per 1000 inferences (15 Wh/query).
                A standard GPT-4 query is ~0.34 Wh. This 44x discrepancy
                indicates inferences represent <b>Agentic Tasks</b> with Chain
                of Thought, RAG, and self-correction loops. Adjusting for 50
                internal sub-inferences per interaction, the math aligns ($50
                \times 0.3 \approx 15$ Wh). WDBX boasts ~25% higher efficiency
                over generic setups due to surgical retrieval and concise
                routing to Aviva.
              </p>
            </div>
          </div>
        </div>

        {/* 6. Benchmarking */}
        <div className="space-y-4">
          <h2 className="technical-label text-white text-[12px] flex items-center gap-2">
            <span className="bg-emerald-400 text-black px-1.5 py-0.5 rounded-sm">
              6
            </span>
            Comparative Benchmarking
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] text-text-dim font-mono border-collapse">
              <thead>
                <tr className="bg-white/5 technical-label">
                  <th className="p-3 border border-white/10">Metric</th>
                  <th className="p-3 border border-emerald-400/50 text-emerald-400">
                    Abbey+Aviva+Abi (WDBX)
                  </th>
                  <th className="p-3 border border-white/10">GPT-4o</th>
                  <th className="p-3 border border-white/10">OpenAI o1</th>
                  <th className="p-3 border border-white/10">PaLM 2</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3 border border-white/10">Latency (ms)</td>
                  <td className="p-3 border border-emerald-400/50 text-white font-bold bg-emerald-400/10">
                    110
                  </td>
                  <td className="p-3 border border-white/10">~320</td>
                  <td className="p-3 border border-white/10">
                    ~5,000 - 30,000
                  </td>
                  <td className="p-3 border border-white/10">200</td>
                </tr>
                <tr>
                  <td className="p-3 border border-white/10">
                    Throughput (req/s)
                  </td>
                  <td className="p-3 border border-emerald-400/50 text-white font-bold bg-emerald-400/10">
                    90
                  </td>
                  <td className="p-3 border border-white/10">~100</td>
                  <td className="p-3 border border-white/10">Low</td>
                  <td className="p-3 border border-white/10">55</td>
                </tr>
                <tr>
                  <td className="p-3 border border-white/10">SQuAD 1.1 (F1)</td>
                  <td className="p-3 border border-emerald-400/50 text-white font-bold bg-emerald-400/10">
                    90.7
                  </td>
                  <td className="p-3 border border-white/10">88.0</td>
                  <td className="p-3 border border-white/10">High</td>
                  <td className="p-3 border border-white/10">88.0</td>
                </tr>
                <tr>
                  <td className="p-3 border border-white/10">CodeSearchNet</td>
                  <td className="p-3 border border-emerald-400/50 text-white font-bold bg-emerald-400/10">
                    0.85
                  </td>
                  <td className="p-3 border border-white/10">0.78</td>
                  <td className="p-3 border border-white/10">0.85+ (Est.)</td>
                  <td className="p-3 border border-white/10">-</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-text-dim font-mono italic">
            <b>Conclusion:</b> Specialization beats generalization at scale.
            Decoupling the single monolithic brain into distinct personas on a
            Zig-backed database strictly optimizes real-time latency while
            retaining agentic multi-step reasoning. WDBX offers a viable
            blueprint for the next generation of high-performance AI agents.
          </p>
        </div>
      </div>
    </div>
  );
}
