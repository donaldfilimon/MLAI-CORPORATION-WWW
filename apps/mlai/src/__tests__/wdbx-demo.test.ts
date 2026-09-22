import { describe, it, expect } from "vitest";
import { embed, cosine, blockHash, WdbxEngine, DIM, type Doc } from "../lib/wdbx-demo";

describe("wdbx-demo — embedding", () => {
  it("is deterministic and L2-normalized (self-cosine = 1)", () => {
    const a = embed("weighted backtrace vector memory");
    const b = embed("weighted backtrace vector memory");
    expect(a.length).toBe(DIM);
    expect(cosine(a, b)).toBeCloseTo(1, 6); // same input → identical vector
    let norm = 0;
    for (let i = 0; i < DIM; i++) norm += (a[i] ?? 0) * (a[i] ?? 0);
    expect(Math.sqrt(norm)).toBeCloseTo(1, 5); // unit length
  });

  it("scores identical text above unrelated text", () => {
    const q = embed("vector database retrieval");
    const same = cosine(q, embed("vector database retrieval"));
    const diff = cosine(q, embed("unrelated weekend cooking recipe"));
    expect(same).toBeGreaterThan(diff);
    expect(same).toBeCloseTo(1, 5);
  });
});

describe("wdbx-demo — blockHash", () => {
  it("is deterministic, 8 lowercase hex chars, and input-sensitive", () => {
    expect(blockHash("00000000", "q", 1)).toBe(blockHash("00000000", "q", 1));
    expect(blockHash("00000000", "q", 1)).toMatch(/^[0-9a-f]{8}$/);
    expect(blockHash("00000000", "q", 1)).not.toBe(blockHash("00000000", "q", 2));
  });
});

describe("WdbxEngine.search", () => {
  const corpus: Doc[] = [
    { id: "1", title: "WDBX", text: "weighted backtrace vector memory store", tag: "wdbx" },
    { id: "2", title: "Abbey", text: "empathetic persona assistant", tag: "persona" },
    { id: "3", title: "Infra", text: "cloud deployment topology", tag: "infra" },
  ];

  it("ranks the most relevant doc first, sorts desc, and honors k", () => {
    const eng = new WdbxEngine(corpus);
    const { hits, stats } = eng.search("vector memory store", 2);
    expect(hits.length).toBe(2);
    expect(hits[0]!.doc.id).toBe("1");
    expect(hits[0]!.score).toBeGreaterThanOrEqual(hits[1]!.score);
    expect(stats.scanned).toBe(3);
    expect(stats.dim).toBe(DIM);
  });

  it("appends a hash-linked block per query (tamper-evident chain)", () => {
    const eng = new WdbxEngine(corpus);
    const before = eng.blocks.length; // genesis
    eng.search("alpha");
    eng.search("beta");
    const blocks = eng.blocks;
    expect(blocks.length).toBe(before + 2);
    for (let i = 1; i < blocks.length; i++) {
      expect(blocks[i]!.prevHash).toBe(blocks[i - 1]!.hash);
      expect(blocks[i]!.height).toBe(blocks[i - 1]!.height + 1);
    }
  });

  it("acquires a monotonic MVCC snapshot per read", () => {
    const eng = new WdbxEngine(corpus);
    const s1 = eng.search("x").stats.snapshot;
    const s2 = eng.search("y").stats.snapshot;
    expect(s2).toBe(s1 + 1);
  });
});
