import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const SOURCE_FILES = [
  "src/design/docs/DocsContent.tsx",
  "src/design/brand/BrandBoard.tsx",
  "src/design/marketing/Personas.tsx",
  "src/design/console/Chat.tsx",
  "src/film/scenes/math.tsx",
  "src/data/categories/stats.ts",
  "src/views/Benchmarks.tsx",
] as const;

const sources = SOURCE_FILES.map((path) => ({
  path,
  text: readFileSync(resolve(__dirname, "../..", path), "utf8"),
}));

describe("public WDBX architecture claims", () => {
  it("does not restore the stale HNSW 200 defaults", () => {
    for (const source of sources) {
      expect(source.text, source.path).not.toMatch(/ef(?:_construction)?\s*[=:]\s*["']?200\b/i);
    }
  });

  it("does not advertise an install endpoint or release that does not exist", () => {
    const docs = sources.find(({ path }) => path.endsWith("DocsContent.tsx"))?.text ?? "";
    expect(docs).not.toContain("get.mlai.dev/wdbx");
    expect(docs).not.toContain("wdbx 2.4.0");
    expect(docs).not.toContain("zig 0.13");
    expect(docs).not.toContain("from wdbx import Client");
    expect(docs).not.toContain("wdbx chain verify");
  });

  it("does not present cluster replication as distributed sharding", () => {
    const renderedClaims = sources.map(({ text }) => text).join("\n");
    expect(renderedClaims).not.toMatch(/vectors are sharded across nodes/i);
    expect(renderedClaims).not.toMatch(/sharded storage/i);
    expect(renderedClaims).not.toMatch(/don't shard below/i);
    expect(renderedClaims).not.toMatch(/fusing sharding/i);
  });

  it("does not publish performance figures without a repository harness", () => {
    const renderedClaims = sources.map(({ text }) => text).join("\n");
    expect(renderedClaims).not.toMatch(
      /["'`](?:5×|84×|295×|295x|13×|2\.3ms|98\.2%|16\.5k|0\.8ms)["'`]/i,
    );
    expect(renderedClaims).not.toContain("wdbx-benchmark/Dashboard");
  });

  it("documents the substrate defaults that the Rust source currently defines", () => {
    const docs = sources.find(({ path }) => path.endsWith("DocsContent.tsx"))?.text ?? "";
    expect(docs).toContain('["M", "16"');
    expect(docs).toContain('["ef_construction", "40"');
    expect(docs).toContain('["ef", "32"');
  });
});
