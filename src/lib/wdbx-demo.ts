/**
 * wdbx-demo.ts — an in-browser simulation of the WDBX query path.
 *
 * This is NOT the Zig engine; it is a faithful miniature of its concepts:
 *   • real cosine similarity over deterministic embeddings
 *     (signed feature-hashing of words, bigrams, and char trigrams → ℝ^256)
 *   • vector-aware shard routing (4 shards, hash-partitioned)
 *   • MVCC snapshot counter (monotonic, acquired per read)
 *   • block-chained query log (FNV-1a, each block hashes its parent)
 *
 * Everything runs locally. No network, no keys, no deps.
 * Ported from the mlai-vite iteration's demo engine.
 */

export const DIM = 256;
export const SHARDS = 4;

export interface Doc {
  id: string;
  title: string;
  text: string;
  tag: "wdbx" | "abi" | "persona" | "infra" | "docs";
}

export interface Hit {
  doc: Doc;
  score: number;
  shard: number;
}

export interface QueryStats {
  ms: number;
  scanned: number;
  shardsHit: number;
  snapshot: number;
  dim: number;
}

export interface Block {
  height: number;
  hash: string;
  prevHash: string;
  query: string;
  ts: number;
}

/* ---------------- hashing ---------------- */

function fnv1a(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function blockHash(prev: string, query: string, ts: number): string {
  return (fnv1a(prev + "·" + query + "·" + ts) >>> 0).toString(16).padStart(8, "0");
}

/* ---------------- embedding ---------------- */

/** Deterministic embedding: words + bigrams + char trigrams, signed-hashed into ℝ^DIM, L2-normalized. */
export function embed(text: string): Float32Array {
  const v = new Float32Array(DIM);
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const feats: Array<[string, number]> = [];
  for (const w of words) feats.push([w, 1.0]);
  for (let i = 0; i < words.length - 1; i++) {
    feats.push([(words[i] ?? "") + "_" + (words[i + 1] ?? ""), 0.8]);
  }
  for (const w of words) {
    const p = `^${w}$`;
    for (let i = 0; i + 3 <= p.length; i++) feats.push(["#" + p.slice(i, i + 3), 0.4]);
  }

  for (const [f, w] of feats) {
    const h = fnv1a(f);
    const idx = h % DIM;
    const sign = (h >>> 13) & 1 ? 1 : -1;
    v[idx] = (v[idx] ?? 0) + sign * w;
  }

  let norm = 0;
  for (let i = 0; i < DIM; i++) norm += (v[i] ?? 0) * (v[i] ?? 0);
  norm = Math.sqrt(norm) || 1;
  for (let i = 0; i < DIM; i++) v[i] = (v[i] ?? 0) / norm;
  return v;
}

export function cosine(a: Float32Array, b: Float32Array): number {
  let s = 0;
  for (let i = 0; i < DIM; i++) s += (a[i] ?? 0) * (b[i] ?? 0);
  return s;
}

/* ---------------- engine ---------------- */

interface StoredVec {
  doc: Doc;
  vec: Float32Array;
  shard: number;
}

export class WdbxEngine {
  private store: StoredVec[] = [];
  private snapshot = 0;
  private chain: Block[] = [];

  constructor(corpus: Doc[]) {
    for (const doc of corpus) {
      this.store.push({
        doc,
        vec: embed(doc.title + " " + doc.text),
        shard: fnv1a(doc.id) % SHARDS,
      });
    }
    // genesis block
    this.chain.push({
      height: 0,
      hash: blockHash("0".repeat(8), "genesis", 0),
      prevHash: "0".repeat(8),
      query: "genesis",
      ts: 0,
    });
  }

  get size(): number {
    return this.store.length;
  }

  get blocks(): readonly Block[] {
    return this.chain;
  }

  search(query: string, k = 5): { hits: Hit[]; stats: QueryStats } {
    const t0 = performance.now();
    const snapshot = ++this.snapshot; // MVCC: readers acquire a monotonic snapshot
    const q = embed(query);

    const shardsTouched = new Set<number>();
    const hits: Hit[] = [];
    for (const s of this.store) {
      shardsTouched.add(s.shard);
      hits.push({ doc: s.doc, score: cosine(q, s.vec), shard: s.shard });
    }
    hits.sort((a, b) => b.score - a.score);
    const top = hits.slice(0, k);
    const ms = performance.now() - t0;

    // append to the chain — tamper-evident query history
    const prev = this.chain[this.chain.length - 1];
    const ts = Date.now();
    this.chain.push({
      height: (prev?.height ?? 0) + 1,
      hash: blockHash(prev?.hash ?? "0".repeat(8), query, ts),
      prevHash: prev?.hash ?? "0".repeat(8),
      query,
      ts,
    });
    if (this.chain.length > 24) this.chain.shift();

    return {
      hits: top,
      stats: { ms, scanned: this.store.length, shardsHit: shardsTouched.size, snapshot, dim: DIM },
    };
  }
}
