import { describe, expect, it } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import {
  readResearchSnapshot,
  validateResearchSnapshot,
  sha256,
  verifySiteParity,
} from "../scripts/research-validation";

function syncStudyFixture(input: ReturnType<typeof readResearchSnapshot>) {
  input.studyBytes = JSON.stringify(input.studies);
  (
    input.review as { implementationDataSha256: string }
  ).implementationDataSha256 = sha256(input.studyBytes);
}

describe("public research snapshot validation", () => {
  it("rejects a supplied candidate revision without a site root, including empty", () => {
    for (const value of ["", "a".repeat(40)]) {
      const result = spawnSync(
        process.execPath,
        [
          "--import",
          "tsx",
          "scripts/verify-research.ts",
          `--site-revision=${value}`,
        ],
        { encoding: "utf8" },
      );
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("--site-revision requires --site-root");
    }
  });
  it("checks export parity and rejects a changed export without a sibling dependency", () => {
    const input = readResearchSnapshot();
    const dir = mkdtempSync(join(tmpdir(), "mlai-public-parity-"));
    try {
      mkdirSync(join(dir, "research"));
      writeFileSync(join(dir, "research-data.json"), input.researchBytes);
      writeFileSync(join(dir, "implementation-data.json"), input.studyBytes);
      const manifest = input.manifest as {
        sourceRevision: string;
        files: Record<string, string>;
      };
      const review = input.review as {
        sourceRevision: string;
        implementationDataSha256: string;
      };
      manifest.sourceRevision = review.sourceRevision;
      manifest.files["implementation-data.json"] =
        review.implementationDataSha256;
      writeFileSync(
        join(dir, "research-manifest.json"),
        JSON.stringify(manifest),
      );
      const research = input.research as {
        publications: { attachments: { url: string }[] }[];
      };
      for (const attachment of research.publications.flatMap(
        (p) => p.attachments,
      )) {
        writeFileSync(
          join(dir, attachment.url.slice(1)),
          input.readAttachment(attachment.url),
        );
      }
      expect(verifySiteParity(dir)).toMatchObject({
        researchParity: "semantic",
        attachmentParity: "byte-identical",
      });
      expect(() => verifySiteParity(dir, process.cwd(), "")).toThrow();
      const candidateRevision = "a".repeat(40);
      manifest.sourceRevision = candidateRevision;
      writeFileSync(
        join(dir, "research-manifest.json"),
        JSON.stringify(manifest),
      );
      expect(() => verifySiteParity(dir)).toThrow(
        /site source revision parity/,
      );
      expect(
        verifySiteParity(dir, process.cwd(), candidateRevision),
      ).toMatchObject({
        sourceRevision: candidateRevision,
        reviewedContentRevision: review.sourceRevision,
        revisionBasis: "explicit candidate revision; publication not asserted",
      });
      expect(() => verifySiteParity(dir, process.cwd(), "main")).toThrow();
      expect(() =>
        verifySiteParity(dir, process.cwd(), "b".repeat(40)),
      ).toThrow(/site source revision parity/);
      const checkCandidate = () =>
        verifySiteParity(dir, process.cwd(), candidateRevision);
      writeFileSync(join(dir, "research-data.json"), "{}");
      expect(checkCandidate).toThrow(/site research semantic parity/);
      writeFileSync(join(dir, "research-data.json"), input.researchBytes);
      const attachment = research.publications.flatMap((p) => p.attachments)[0];
      const attachmentPath = join(dir, attachment.url.slice(1));
      writeFileSync(attachmentPath, "corrupted PDF");
      expect(checkCandidate).toThrow(/site attachment byte parity/);
      rmSync(attachmentPath);
      expect(checkCandidate).toThrow();
      writeFileSync(attachmentPath, input.readAttachment(attachment.url));
      writeFileSync(
        join(dir, "implementation-data.json"),
        `${input.studyBytes}\n`,
      );
      expect(() =>
        verifySiteParity(dir, process.cwd(), candidateRevision),
      ).toThrow(/site implementation byte parity/);
      expect(() => verifySiteParity("relative/public")).toThrow(
        /must be absolute/,
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
  it("validates the reviewed snapshot and all attachment bytes without application imports", () => {
    expect(validateResearchSnapshot(readResearchSnapshot())).toEqual({
      topics: 6,
      publications: 21,
      studies: 7,
      attachments: 4,
    });
  });
  it("rejects malformed JSON shapes with a precise field path", () => {
    const input = readResearchSnapshot();
    (input.research as { publications: unknown[] }).publications[0] = {
      slug: "bad/slug",
    };
    input.researchBytes = JSON.stringify(input.research);
    expect(() => validateResearchSnapshot(input)).toThrow(/slug/);
  });
  it("rejects duplicate slugs before parity checks", () => {
    const input = readResearchSnapshot();
    const data = input.research as { publications: { slug: string }[] };
    data.publications[1].slug = data.publications[0].slug;
    input.researchBytes = JSON.stringify(input.research);
    expect(() => validateResearchSnapshot(input)).toThrow(
      /publications.slug: duplicate/,
    );
  });
  it("rejects an unknown study topic", () => {
    const input = readResearchSnapshot();
    (input.studies as { relatedTopics: string[] }[])[0].relatedTopics = [
      "unknown",
    ];
    syncStudyFixture(input);
    expect(() => validateResearchSnapshot(input)).toThrow(/relatedTopics/);
  });
  it("rejects a changed public source artifact", () => {
    const input = readResearchSnapshot();
    input.studyBytes += "\n";
    expect(() => validateResearchSnapshot(input)).toThrow(
      /implementation-data.json byte digest/,
    );
  });
  it("rejects changed publication content despite unchanged source bytes", () => {
    const input = readResearchSnapshot();
    (
      input.research as { publications: { title: string }[] }
    ).publications[0].title = "Changed";
    expect(() => validateResearchSnapshot(input)).toThrow(
      /research object\/bytes parity/,
    );
  });
  it("rejects missing and corrupted attachment bytes", () => {
    const input = readResearchSnapshot();
    input.readAttachment = () => Buffer.from("not the PDF");
    expect(() => validateResearchSnapshot(input)).toThrow(/attachment bytes/);
    input.readAttachment = () => {
      throw new Error("missing attachment");
    };
    expect(() => validateResearchSnapshot(input)).toThrow(/missing attachment/);
  });
  it("rejects attachment paths outside the public snapshot", () => {
    const input = readResearchSnapshot();
    const data = input.research as {
      publications: { attachments: { url: string }[] }[];
    };
    data.publications.find((p) => p.attachments.length)!.attachments[0].url =
      "/research/../../private.pdf";
    input.researchBytes = JSON.stringify(input.research);
    expect(() => validateResearchSnapshot(input)).toThrow(/attachments/);
  });
  it("rejects unpinned study URLs", () => {
    const input = readResearchSnapshot();
    (input.studies as { sources: { url: string }[] }[])[0].sources[0].url =
      "https://github.com/example/repo/blob/main/README.md";
    syncStudyFixture(input);
    expect(() => validateResearchSnapshot(input)).toThrow(/pinned public URL/);
  });
  it("rejects study and track object mutations disconnected from input bytes", () => {
    const input = readResearchSnapshot();
    (input.studies as { title: string }[])[0].title = "Unreviewed title";
    expect(() => validateResearchSnapshot(input)).toThrow(
      /study object\/bytes parity/,
    );
    const tracks = readResearchSnapshot();
    (tracks.research as { tracks: { name: string }[] }).tracks[0].name =
      "Changed";
    expect(() => validateResearchSnapshot(tracks)).toThrow(
      /research object\/bytes parity/,
    );
  });
  it("rejects a moving GitHub ref with a revision-looking directory", () => {
    const input = readResearchSnapshot();
    const source = (
      input.studies as { sources: { url: string; revision: string }[] }[]
    )[0].sources[0];
    source.url = `https://github.com/example/repo/blob/main/${source.revision}/README.md`;
    syncStudyFixture(input);
    expect(() => validateResearchSnapshot(input)).toThrow(/pinned public URL/);
  });
});
