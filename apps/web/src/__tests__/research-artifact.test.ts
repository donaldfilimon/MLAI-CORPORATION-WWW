import { describe, expect, it } from "vitest";
import {
  mkdtempSync,
  realpathSync,
  readFileSync,
  readdirSync,
  writeFileSync,
  rmSync,
  mkdirSync,
  symlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { research } from "../data/categories/research";
import { researchContext } from "../data/categories/research-context";
import {
  projectResearch,
  researchDigest,
  sha256,
} from "../lib/research-export";

const root = process.cwd();
const run = (output: string, stamp = "2026-09-06T11:00:00Z") =>
  execFileSync(
    "bun",
    [
      "scripts/export-research.tsx",
      "--output",
      output,
      "--generated-at",
      stamp,
    ],
    { cwd: root, stdio: "pipe" },
  );
function scratch() {
  return realpathSync(
    mkdtempSync(path.join(tmpdir(), "mlai-research-artifact-")),
  );
}
function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#x27;");
}

describe("generated private research artifact", () => {
  it("exports the complete corpus and all structured text, links and hashed assets reproducibly", () => {
    const site = scratch();
    try {
      run(site);
      const publicDir = path.join(site, "public");
      const manifestPath = path.join(publicDir, "research-manifest.json");
      const first = readFileSync(manifestPath, "utf8");
      const manifest = JSON.parse(first);
      const indexHtml = readFileSync(
        path.join(publicDir, "research/index.html"),
        "utf8",
      );
      expect(indexHtml).toContain("<h1>MLAI Research</h1>");
      expect(indexHtml.match(/data-research-item=""/g)).toHaveLength(28);
      expect(indexHtml.indexOf('name="q"')).toBeLessThan(
        indexHtml.indexOf('id="research-areas"'),
      );
      expect(indexHtml).not.toContain("/assets/filter.js");
      for (const study of researchContext)
        expect(indexHtml).toContain(
          `data-topics="${study.relatedTopics.join(" ")}" data-type="implementation-study"`,
        );
      expect(indexHtml.match(/Source reviewed <time/g)).toHaveLength(21);
      execFileSync("bun", ["run", "build"], { cwd: site, stdio: "pipe" });
      for (const [name, hash] of Object.entries(manifest.files))
        expect(sha256(readFileSync(path.join(site, "out", name)))).toBe(hash);
      expect(
        JSON.parse(
          readFileSync(path.join(publicDir, "research-data.json"), "utf8"),
        ),
      ).toEqual(projectResearch(research));
      expect(manifest.contentSha256).toBe(researchDigest(research));
      expect(
        manifest.publications.map((p: { slug: string }) => p.slug),
      ).toEqual(research.publications.map((p) => p.slug));
      expect(
        JSON.parse(
          readFileSync(
            path.join(publicDir, "implementation-data.json"),
            "utf8",
          ),
        ),
      ).toEqual(researchContext);
      for (const study of researchContext) {
        const html = readFileSync(
          path.join(
            publicDir,
            "research/implementations",
            study.slug,
            "index.html",
          ),
          "utf8",
        );
        expect(html).toContain('<details class="preview-mobile-contents">');
        expect(html).toContain("preview-desktop-contents");
        for (const section of study.sections)
          for (const paragraph of section.paragraphs)
            expect(html).toContain(escapeHtml(paragraph));
        for (const source of study.sources)
          expect(html).toContain(escapeHtml(source.url));
        for (const limitation of study.limitations)
          expect(html).toContain(escapeHtml(limitation));
      }
      for (const [name, hash] of Object.entries(manifest.files))
        expect(sha256(readFileSync(path.join(publicDir, name)))).toBe(hash);
      for (const p of research.publications) {
        const html = readFileSync(
          path.join(publicDir, "research", p.slug, "index.html"),
          "utf8",
        );
        expect(html).toContain(escapeHtml(p.practicalSummary));
        for (const s of p.body) {
          for (const text of [...s.paragraphs, ...(s.list ?? [])])
            expect(html).toContain(escapeHtml(text));
          for (const code of s.code ?? [])
            expect(html).toContain(escapeHtml(code.code));
          if (s.math?.length) expect(html).toContain("katex-mathml");
        }
        for (const source of p.sources)
          expect(html).toContain(escapeHtml(source.url));
        for (const attachment of p.attachments)
          expect(html).toContain(attachment.url);
        expect(html).toContain(`https://quesar.cloud/research/${p.slug}`);
        expect(html).toContain("noindex,nofollow");
      }
      const retainedPackage = readFileSync(
        path.join(site, "package.json"),
        "utf8",
      );
      writeFileSync(
        path.join(site, "README.md"),
        "Locally maintained artifact instructions.",
      );
      run(site);
      expect(readFileSync(path.join(site, "package.json"), "utf8")).toBe(
        retainedPackage,
      );
      expect(readFileSync(path.join(site, "README.md"), "utf8")).toBe(
        "Locally maintained artifact instructions.",
      );
      expect(readFileSync(manifestPath, "utf8")).toBe(first);
      // An invalid run cannot remove the last complete artifact.
      expect(() => run(site, "not-a-date")).toThrow();
      expect(readFileSync(manifestPath, "utf8")).toBe(first);
      expect(
        readdirSync(site).filter((n) => n.startsWith(".research-export-")),
      ).toEqual([]);
    } finally {
      rmSync(site, { recursive: true, force: true });
    }
  }, 30000);
  it("refuses unrelated projects and symlinked output without changing their files", () => {
    const site = scratch();
    try {
      writeFileSync(
        path.join(site, "package.json"),
        ' {"name":"unrelated-project"} ',
      );
      writeFileSync(path.join(site, "README.md"), "Keep this document.");
      expect(() => run(site)).toThrow();
      expect(readFileSync(path.join(site, "README.md"), "utf8")).toBe(
        "Keep this document.",
      );
      expect(readdirSync(site).sort()).toEqual(["README.md", "package.json"]);
      const owned = path.join(site, "owned");
      mkdirSync(owned);
      run(owned);
      const original = path.join(owned, "public");
      const protectedDir = path.join(site, "protected");
      mkdirSync(protectedDir);
      writeFileSync(path.join(protectedDir, "keep"), "safe");
      rmSync(original, { recursive: true });
      symlinkSync(protectedDir, original);
      expect(() => run(owned)).toThrow();
      expect(readFileSync(path.join(protectedDir, "keep"), "utf8")).toBe(
        "safe",
      );
    } finally {
      rmSync(site, { recursive: true, force: true });
    }
  }, 30000);
});
