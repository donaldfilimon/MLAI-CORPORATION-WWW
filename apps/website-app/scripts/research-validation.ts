import { createHash } from "node:crypto";
import { readFileSync, realpathSync } from "node:fs";
import { isAbsolute, resolve, sep } from "node:path";
import { z } from "zod";

const text = z.string().trim().min(1);
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const digest = z.string().regex(/^[a-f0-9]{64}$/);
const revision = z.string().regex(/^[a-f0-9]{40}$/);
const source = z.object({ title: text, url: z.url(), revision });
const attachment = z.object({
  title: text,
  url: z.string().regex(/^\/research\/[a-z0-9-]+\.pdf$/),
  sha256: digest,
  edition: text,
  date: text,
  pages: z.number().int().positive(),
});
const researchSchema = z
  .object({
    tracks: z
      .array(
        z
          .object({
            id: slug,
            overviewSlug: slug,
            name: text,
            description: text,
            application: text,
            availability: text,
            limitations: z.array(text).min(1),
          })
          .passthrough(),
      )
      .min(1),
    publications: z
      .array(
        z
          .object({
            slug,
            title: text,
            abstract: text,
            topic: slug,
            tag: text,
            date: text,
            readTime: text,
            authors: text.optional(),
            practicalSummary: text,
            status: text,
            statusNote: text,
            reviewedAt: z.iso.date(),
            documentType: z.enum([
              "overview",
              "research-note",
              "implementation-guide",
            ]),
            sources: z.array(source.passthrough()).min(1),
            attachments: z.array(attachment.passthrough()),
            limitations: z.array(text).min(1),
            body: z
              .array(z.object({ paragraphs: z.array(text) }).passthrough())
              .min(1),
          })
          .passthrough(),
      )
      .min(1),
  })
  .passthrough();
const studiesSchema = z
  .array(
    z.object({
      slug,
      title: text,
      summary: text,
      relatedTopics: z.array(slug).min(1),
      sections: z
        .array(z.object({ heading: text, paragraphs: z.array(text).min(1) }))
        .min(1),
      sources: z.array(source.extend({ sha256: digest })).min(1),
      limitations: z.array(text).min(1),
    }),
  )
  .min(1);
const manifestSchema = z.object({
  sourceRevision: revision,
  sourceDirty: z.literal(false),
  contentSha256: digest,
  topics: z.array(slug),
  publications: z.array(
    z.object({
      slug,
      contentSha256: digest,
      sourceCount: z.number().int().positive(),
      attachments: z.array(z.object({ url: text, sha256: digest })),
    }),
  ),
  files: z.record(z.string(), digest),
});
const reviewSchema = z.object({
  sourceRevision: revision,
  sourceDirty: z.literal(false),
  contentSha256: digest,
  implementationDataSha256: digest,
  implementationCount: z.number().int().positive(),
  publicationCount: z.number().int().positive(),
  topics: z.array(slug),
});
export function sha256(bytes: string | Buffer) {
  return createHash("sha256").update(bytes).digest("hex");
}
function requireMatch(condition: boolean, path: string) {
  if (!condition) throw new Error(`Research validation failed: ${path}`);
}
function unique(values: string[], path: string) {
  requireMatch(
    new Set(values).size === values.length,
    `${path}: duplicate value`,
  );
}
export function validateResearchSnapshot(input: {
  research: unknown;
  studies: unknown;
  manifest: unknown;
  review: unknown;
  researchBytes: string;
  studyBytes: string;
  readAttachment: (url: string) => Buffer;
}) {
  requireMatch(
    JSON.stringify(JSON.parse(input.researchBytes)) ===
      JSON.stringify(input.research),
    "research object/bytes parity",
  );
  requireMatch(
    JSON.stringify(JSON.parse(input.studyBytes)) ===
      JSON.stringify(input.studies),
    "study object/bytes parity",
  );
  const research = researchSchema.parse(input.research);
  const studies = studiesSchema.parse(input.studies);
  const manifest = manifestSchema.parse(input.manifest);
  const review = reviewSchema.parse(input.review);
  const topics = research.tracks.map((track) => track.id);
  const slugs = research.publications.map((publication) => publication.slug);
  unique(topics, "tracks.id");
  unique(slugs, "publications.slug");
  unique(
    studies.map((study) => study.slug),
    "studies.slug",
  );
  unique(
    manifest.publications.map((publication) => publication.slug),
    "manifest.publications.slug",
  );
  requireMatch(
    JSON.stringify(topics) === JSON.stringify(manifest.topics) &&
      JSON.stringify(topics) === JSON.stringify(review.topics),
    "manifest topics parity",
  );
  requireMatch(
    manifest.contentSha256 === review.contentSha256,
    "review content parity",
  );
  requireMatch(
    sha256(JSON.stringify(JSON.parse(input.researchBytes))) ===
      manifest.contentSha256,
    "research-data.json content digest",
  );
  requireMatch(
    sha256(input.studyBytes) === review.implementationDataSha256,
    "implementation-data.json byte digest",
  );
  requireMatch(
    research.publications.length === review.publicationCount &&
      research.publications.length === manifest.publications.length,
    "publication count parity",
  );
  requireMatch(
    studies.length === review.implementationCount,
    "study count parity",
  );
  for (const track of research.tracks) {
    requireMatch(
      research.publications.some(
        (publication) =>
          publication.slug === track.overviewSlug &&
          publication.topic === track.id &&
          publication.documentType === "overview",
      ),
      `tracks.${track.id}.overviewSlug`,
    );
  }
  let attachments = 0;
  for (const [index, publication] of research.publications.entries()) {
    const path = `publications.${index}`;
    requireMatch(topics.includes(publication.topic), `${path}.topic`);
    const receipt = manifest.publications.find(
      (item) => item.slug === publication.slug,
    );
    requireMatch(!!receipt, `${path}.manifest`);
    // Hash the original record: schema parsing must not reorder reviewed input.
    const original = (input.research as { publications: unknown[] })
      .publications[index];
    requireMatch(
      sha256(JSON.stringify(original)) === receipt!.contentSha256,
      `${path}.contentSha256`,
    );
    requireMatch(
      publication.sources.length === receipt!.sourceCount,
      `${path}.sourceCount`,
    );
    requireMatch(
      publication.attachments.length === receipt!.attachments.length,
      `${path}.attachment count`,
    );
    unique(
      publication.attachments.map((item) => item.url),
      `${path}.attachments`,
    );
    for (const item of publication.attachments) {
      requireMatch(
        receipt!.attachments.some(
          (entry) => entry.url === item.url && entry.sha256 === item.sha256,
        ),
        `${path}.attachment manifest parity`,
      );
      requireMatch(
        manifest.files[item.url.slice(1)] === item.sha256,
        `${path}.attachment file manifest parity`,
      );
      requireMatch(
        sha256(input.readAttachment(item.url)) === item.sha256,
        `${path}.attachment bytes`,
      );
      attachments++;
    }
  }
  for (const [index, study] of studies.entries()) {
    unique(study.relatedTopics, `studies.${index}.relatedTopics`);
    requireMatch(
      study.relatedTopics.every((topic) => topics.includes(topic)),
      `studies.${index}.relatedTopics`,
    );
  }
  for (const entry of [...research.publications, ...studies]) {
    for (const item of entry.sources) {
      const url = new URL(item.url);
      const parts = url.pathname.split("/");
      const pinned =
        url.hostname === "github.com"
          ? parts.length > 5 &&
            parts[3] === "blob" &&
            parts[4] === item.revision
          : url.hostname === "git.chatgpt-team.site" &&
            url.pathname.endsWith(".git") &&
            url.hash.startsWith(`#${item.revision}:`);
      requireMatch(
        url.protocol === "https:" &&
          !url.username &&
          !url.password &&
          !url.port &&
          pinned,
        `${entry.slug}.source pinned public URL`,
      );
    }
  }
  return {
    topics: topics.length,
    publications: slugs.length,
    studies: studies.length,
    attachments,
  };
}
export function readResearchSnapshot(root = process.cwd()) {
  const read = (path: string) => readFileSync(resolve(root, path), "utf8");
  const researchBytes = read("src/content/research-data.json");
  const studyBytes = read("src/content/implementation-data.json");
  return {
    research: JSON.parse(researchBytes) as unknown,
    studies: JSON.parse(studyBytes) as unknown,
    manifest: JSON.parse(
      read("docs/research-merge/source-manifest.json"),
    ) as unknown,
    review: JSON.parse(
      read("docs/research-merge/published-review-manifest.json"),
    ) as unknown,
    researchBytes,
    studyBytes,
    readAttachment(url: string) {
      const publicRoot = realpathSync(resolve(root, "public/research"));
      const path = realpathSync(resolve(root, "public", `.${url}`));
      requireMatch(
        path.startsWith(`${publicRoot}${sep}`),
        "attachment path boundary",
      );
      return readFileSync(path);
    },
  };
}

export function verifySiteParity(siteRoot: string, root = process.cwd()) {
  requireMatch(isAbsolute(siteRoot), "site root must be absolute");
  const site = realpathSync(siteRoot);
  const input = readResearchSnapshot(root);
  validateResearchSnapshot(input);
  const sourceResearch = readFileSync(
    resolve(site, "research-data.json"),
    "utf8",
  );
  const sourceStudies = readFileSync(
    resolve(site, "implementation-data.json"),
    "utf8",
  );
  const sourceManifest = manifestSchema.parse(
    JSON.parse(readFileSync(resolve(site, "research-manifest.json"), "utf8")),
  );
  const review = reviewSchema.parse(input.review);
  requireMatch(
    sourceManifest.sourceRevision === review.sourceRevision,
    "site source revision parity",
  );
  requireMatch(
    sourceManifest.contentSha256 === review.contentSha256 &&
      sourceManifest.files["implementation-data.json"] ===
        review.implementationDataSha256,
    "site manifest content parity",
  );
  requireMatch(
    sha256(JSON.stringify(JSON.parse(sourceResearch))) === review.contentSha256,
    "site research semantic parity",
  );
  requireMatch(
    sha256(sourceStudies) === review.implementationDataSha256 &&
      sourceStudies === input.studyBytes,
    "site implementation byte parity",
  );
  const research = researchSchema.parse(input.research);
  for (const publication of research.publications) {
    for (const item of publication.attachments) {
      const path = realpathSync(resolve(site, `.${item.url}`));
      requireMatch(
        path.startsWith(`${site}${sep}`),
        "site attachment path boundary",
      );
      requireMatch(
        sha256(readFileSync(path)) === item.sha256,
        "site attachment byte parity",
      );
    }
  }
  return {
    sourceRevision: sourceManifest.sourceRevision,
    sourceDirty: sourceManifest.sourceDirty,
    contentSha256: review.contentSha256,
    implementationDataSha256: review.implementationDataSha256,
    researchParity: "semantic",
    implementationParity: "byte-identical",
    attachmentParity: "byte-identical",
    remoteAvailability: "not checked",
  };
}
