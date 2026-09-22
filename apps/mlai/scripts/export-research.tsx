/**
 * Owner-private presentation artifact; canonical prose is never maintained here.
 * bun scripts/export-research.tsx --output /absolute/site --generated-at ISO_DATE
 * Repeat with the same source revision and timestamp for byte-identical public/.
 */
import React, { type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  readFile,
  writeFile,
  mkdir,
  cp,
  rm,
  readdir,
  lstat,
  realpath,
  mkdtemp,
  rename,
} from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import katex from "katex";
import { research } from "../src/data/categories/research";
import { researchContext } from "../src/data/categories/research-context";
import {
  ResearchAreaGrid,
  ResearchArticleEvidence,
  ResearchArticleBody,
} from "../src/components/research";
import {
  projectResearch,
  publicationManifest,
  researchDigest,
  sha256,
  RESEARCH_CANONICAL_ORIGIN,
  RESEARCH_EXPORT_VERSION,
} from "../src/lib/research-export";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
function argument(name: string) {
  const i = args.indexOf(name);
  return i < 0 ? undefined : args[i + 1];
}
const destination = argument("--output");
if (!destination || !path.isAbsolute(destination))
  throw new Error(
    "--output must name an absolute generated Sites project directory",
  );
const stamp = argument("--generated-at") ?? new Date().toISOString();
if (!Number.isFinite(Date.parse(stamp)))
  throw new Error("--generated-at must be a date");
const generatedAt = new Date(stamp).toISOString();
const siteRoot = path.resolve(destination);
const canonicalRepo = path.resolve(root, "../..");
if (
  siteRoot === canonicalRepo ||
  siteRoot.startsWith(canonicalRepo + path.sep) ||
  canonicalRepo.startsWith(siteRoot + path.sep)
)
  throw new Error("Output must be outside the canonical repository");
if (existsSync(siteRoot) && (await lstat(siteRoot)).isSymbolicLink())
  throw new Error("Refusing a symlinked destination");
await mkdir(siteRoot, { recursive: true });
if ((await realpath(siteRoot)) !== siteRoot)
  throw new Error("Destination must use its real filesystem path");
const entries = await readdir(siteRoot);
const existingPackage = path.join(siteRoot, "package.json");
const owned =
  existsSync(existingPackage) &&
  JSON.parse(await readFile(existingPackage, "utf8")).name ===
    "mlai-research-review-artifact";
if (!owned && entries.some((name) => name !== ".openai"))
  throw new Error("Refusing to modify an unrelated destination");
const published = path.join(siteRoot, "public");
if (existsSync(published)) {
  if ((await lstat(published)).isSymbolicLink())
    throw new Error("Refusing a symlinked public directory");
  const prior = JSON.parse(
    await readFile(path.join(published, "research-manifest.json"), "utf8"),
  );
  if (
    !owned ||
    prior.format !== "mlai-research-review" ||
    prior.version !== RESEARCH_EXPORT_VERSION
  )
    throw new Error("Refusing to replace an unrelated public directory");
}
const stage = await mkdtemp(path.join(siteRoot, ".research-export-"));
const output = path.join(stage, "public");
try {
  await mkdir(path.join(output, "assets"), { recursive: true });
  const data = projectResearch(research);
  const studySlugs = new Set<string>();
  for (const study of researchContext) {
    if (
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(study.slug) ||
      studySlugs.has(study.slug)
    )
      throw new Error("Invalid or duplicate implementation study slug");
    studySlugs.add(study.slug);
    if (
      !study.relatedTopics.length ||
      study.relatedTopics.some(
        (topic) => !data.tracks.some((track) => track.id === topic),
      )
    )
      throw new Error(`Unknown implementation research area: ${study.slug}`);
    if (
      !study.sources.length ||
      !study.limitations.length ||
      !study.sections.length
    )
      throw new Error(`Incomplete implementation study: ${study.slug}`);
    for (const source of study.sources) {
      if (!/^[a-f0-9]{40}$/.test(source.revision))
        throw new Error(`Invalid source revision: ${study.slug}`);
      if (!/^[a-f0-9]{64}$/.test(source.sha256))
        throw new Error(`Invalid source digest: ${study.slug}`);
      const url = new URL(source.url);
      const pinned =
        url.hostname === "github.com"
          ? new RegExp(`^/[^/]+/[^/]+/blob/${source.revision}/.+`).test(
              url.pathname,
            )
          : url.hostname === "git.chatgpt-team.site" &&
            url.hash.includes(source.revision);
      if (url.protocol !== "https:" || !pinned)
        throw new Error(`Invalid source locator: ${study.slug}`);
    }
  }
  const revision = execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: root,
    encoding: "utf8",
  }).trim();
  const dirty = !!execFileSync("git", ["status", "--porcelain"], {
    cwd: root,
    encoding: "utf8",
  }).trim();
  const styleInput = path.join(root, "src/index.css");
  // Resolve font assets into the generated artifact rather than referencing node_modules.
  const built = await postcss([tailwind({ base: root })]).process(
    await readFile(styleInput, "utf8"),
    { from: styleInput, to: path.join(output, "assets/lab.css") },
  );
  let css = built.css;
  const fontUrls = [...css.matchAll(/url\((['"]?)([^)'"\s]+\.woff2?)\1\)/g)];
  for (const [, , url] of fontUrls) {
    if (!url || /^(data:|https?:)/.test(url)) continue;
    const filename = path.basename(url);
    const candidates = [
      path.resolve(path.dirname(styleInput), url),
      path.resolve(output, "assets", url),
      path.join(
        root,
        "node_modules/@fontsource-variable/geist/files",
        filename,
      ),
    ];
    const source = candidates.find(existsSync);
    if (!source) throw new Error(`Cannot resolve font ${filename}`);
    await cp(source, path.join(output, "assets", filename));
    css = css.split(url).join(`/assets/${filename}`);
  }
  const extraCss = await readFile(
    path.join(root, "scripts/research-preview.css"),
    "utf8",
  );
  await writeFile(path.join(output, "assets/lab.css"), css + "\n" + extraCss);
  await cp(
    path.join(root, "node_modules/katex/dist/katex.min.css"),
    path.join(output, "assets/katex.min.css"),
  );
  await cp(
    path.join(root, "node_modules/katex/dist/fonts"),
    path.join(output, "assets/fonts"),
    { recursive: true },
  );
  await cp(
    path.join(root, "public/mlai-mark.svg"),
    path.join(output, "assets/mlai-mark.svg"),
  );
  for (const publication of data.publications) {
    for (const attachment of publication.attachments) {
      const bytes = await readFile(path.join(root, "public", attachment.url));
      if (sha256(bytes) !== attachment.sha256)
        throw new Error(`Attachment digest mismatch: ${attachment.url}`);
      await mkdir(path.dirname(path.join(output, attachment.url)), {
        recursive: true,
      });
      await writeFile(path.join(output, attachment.url), bytes);
    }
  }
  function shell(title: string, canonicalPath: string, content: ReactNode) {
    const html = renderToStaticMarkup(
      <html lang="en" className="dark">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>{`${title} · MLAI Research`}</title>
          <meta name="robots" content="noindex,nofollow" />
          <meta
            name="description"
            content="MLAI research, implementation guides, and the evidence behind systems for memory, agents, and local computing."
          />
          <meta name="theme-color" content="#0c0c09" />
          <link
            rel="canonical"
            href={`${RESEARCH_CANONICAL_ORIGIN}${canonicalPath}`}
          />
          <link rel="icon" href="/assets/mlai-mark.svg" type="image/svg+xml" />
          <link rel="stylesheet" href="/assets/lab.css" />
          <link rel="stylesheet" href="/assets/katex.min.css" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Spectral:wght@400;500;600;700&display=swap"
            rel="stylesheet"
          />
          <script src="/assets/discovery.js" defer />
        </head>
        <body>
          <a className="preview-skip" href="#main">
            Skip to content
          </a>
          <div className="preview-banner">
            Research collection · Snapshot generated {generatedAt.slice(0, 10)}
          </div>
          <header className="preview-header">
            <a href="/research" className="preview-brand">
              <img src="/assets/mlai-mark.svg" width="32" height="32" alt="" />
              MLAI <span>Research</span>
            </a>
            <a href={`${RESEARCH_CANONICAL_ORIGIN}/research`}>
              Canonical website ↗
            </a>
          </header>
          <main id="main" tabIndex={-1} className="preview-main">
            {content}
          </main>
          <footer className="preview-footer">
            MLAI Research · Practical ideas, inspectable evidence.
            <br />
            Generated {generatedAt.slice(0, 10)} from source revision{" "}
            <code>{revision.slice(0, 12)}</code>
            {dirty ? " (working changes included)" : ""}.{" "}
            <a href="/research-manifest.json">Inspect snapshot provenance</a>
            <br />
            <a href="/research#implementations">Implementation guides</a> ·{" "}
            <a href="/research#publications-heading">Research library</a>
          </footer>
        </body>
      </html>,
    );
    return "<!doctype html>\n" + html;
  }
  function Contents({ sections }: { sections: { heading?: string }[] }) {
    const links = sections.map(
      (section, index) =>
        section.heading && (
          <a key={index} href={`#section-${index + 1}`}>
            {section.heading}
          </a>
        ),
    );
    return (
      <aside className="preview-reading-nav">
        <nav
          className="preview-contents preview-desktop-contents"
          aria-label="On this page"
        >
          <strong>On this page</strong>
          {links}
        </nav>
        <details className="preview-mobile-contents">
          <summary>On this page</summary>
          <nav className="preview-contents" aria-label="On this page">
            {links}
          </nav>
        </details>
      </aside>
    );
  }
  const index = shell(
    "Research collection",
    "/research",
    <>
      <div className="preview-intro">
        <h1>MLAI Research</h1>
        <p>
          Explore the ideas behind MLAI’s AI systems, memory, evidence
          selection, and developer tools. These reference snapshots describe
          reviewed source implementations, not a visitor’s private configuration
          or an activated local application.
        </p>
        <nav className="preview-jump" aria-label="Research sections">
          <a href="#publications-heading">Collection</a>
          <a href="#research-areas">Research areas</a>
          <a href="#implementations">Implementation studies</a>
        </nav>
      </div>
      <section
        className="preview-publications preview-collection"
        aria-labelledby="publications-heading"
      >
        <div className="preview-section-title">
          <h2 id="publications-heading">The research collection</h2>
          <span>
            {data.publications.length + researchContext.length} research
            documents
          </span>
        </div>
        <form className="preview-discovery" role="search">
          <label className="preview-search">
            Search research
            <input
              name="q"
              type="search"
              autoComplete="off"
              placeholder="Memory, retrieval, agent policy…"
            />
          </label>
          <label>
            Research area
            <select name="topic">
              <option value="">All areas</option>
              {data.tracks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Document type
            <select name="type">
              <option value="">All documents</option>
              <option value="overview">Overview</option>
              <option value="research-note">Research note</option>
              <option value="implementation-guide">Implementation guide</option>
              <option value="implementation-study">Implementation study</option>
            </select>
          </label>
        </form>
        <p id="legacy-tag-filter" hidden />
        <div className="preview-recovery">
          <button type="button" id="clear-search" hidden>
            Clear search
          </button>
          <button type="button" id="reset-filters" hidden>
            Reset filters
          </button>
          <button type="button" id="clear-all" hidden>
            Clear all
          </button>
        </div>
        <p role="status" id="publication-status">
          {data.publications.length + researchContext.length} research documents
          shown.
        </p>
        <ul className="preview-paper-list">
          {data.publications.map((p) => (
            <li
              key={p.slug}
              data-research-item=""
              data-publication-tag={p.tag}
              data-topics={p.topic}
              data-type={p.documentType}
            >
              <a href={`/research/${p.slug}`}>
                <div className="preview-paper-meta">
                  <span>
                    {p.documentType.replaceAll("-", " ")} · {p.status}
                  </span>
                  <span>{p.readTime}</span>
                </div>
                <h3>{p.title}</h3>
                <p>{p.practicalSummary}</p>
                <div className="preview-paper-meta">
                  <span>Reference snapshot</span>
                  <span>
                    Source reviewed{" "}
                    <time dateTime={p.reviewedAt}>{p.reviewedAt}</time>
                  </span>
                </div>
              </a>
            </li>
          ))}
          {researchContext.map((study) => (
            <li
              key={study.slug}
              data-research-item=""
              data-topics={study.relatedTopics.join(" ")}
              data-type="implementation-study"
            >
              <a href={`/research/implementations/${study.slug}`}>
                <div className="preview-paper-meta">
                  Implementation study ·{" "}
                  {study.relatedTopics.join(" / ").toUpperCase()}
                </div>
                <h3>{study.title}</h3>
                <p>{study.summary}</p>
                <div className="preview-paper-meta">Reference snapshot</div>
              </a>
            </li>
          ))}
        </ul>
      </section>
      <section id="research-areas" className="preview-publications">
        <h2>Research areas</h2>
        <ResearchAreaGrid tracks={data.tracks} />
      </section>
      <section
        id="implementations"
        className="preview-publications"
        aria-labelledby="implementation-heading"
      >
        <div className="preview-section-title">
          <h2 id="implementation-heading">From research to systems</h2>
          <span>{researchContext.length} implementation studies</span>
        </div>
        <p className="preview-lede">
          Explore how these ideas appear across MLAI’s websites and
          applications. Each study identifies its source, operating boundaries,
          and connections to the research.
        </p>
        <ul className="preview-paper-list">
          {researchContext.map((study) => (
            <li key={study.slug}>
              <a href={`/research/implementations/${study.slug}`}>
                <div className="preview-paper-meta">
                  Implementation study ·{" "}
                  {study.relatedTopics.join(" / ").toUpperCase()}
                </div>
                <h3>{study.title}</h3>
                <p>{study.summary}</p>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>,
  );
  await mkdir(path.join(output, "research"), { recursive: true });
  await writeFile(path.join(output, "index.html"), index);
  await writeFile(path.join(output, "research/index.html"), index);
  for (const publication of data.publications) {
    const math = (tex: string) => (
      <div
        className="preview-math"
        tabIndex={0}
        role="region"
        aria-label="Equation"
        dangerouslySetInnerHTML={{
          __html: katex.renderToString(tex, {
            displayMode: true,
            throwOnError: true,
            trust: false,
            output: "htmlAndMathml",
          }),
        }}
      />
    );
    const body = shell(
      publication.title,
      `/research/${publication.slug}`,
      <article className="preview-article">
        <a href="/research" className="preview-back">
          ← All research
        </a>
        <p className="preview-eyebrow">
          {publication.documentType.replaceAll("-", " ")} · {publication.status}{" "}
          · Reference snapshot
        </p>
        <h1>{publication.title}</h1>
        <p className="preview-lede">{publication.practicalSummary}</p>
        <p className="preview-byline">
          {publication.authors} · {publication.date} · {publication.readTime}
        </p>
        <p className="preview-claim">
          {publication.statusNote}{" "}
          <a href="#evidence">Inspect sources and limitations ↓</a>
        </p>
        <div className="preview-reading">
          <Contents sections={publication.body} />
          <div className="preview-reading-body">
            <ResearchArticleBody body={publication.body} renderMath={math} />
            <section id="evidence">
              <ResearchArticleEvidence publication={publication} />
            </section>
            <section>
              <h2>Explore the implementation</h2>
              <ul>
                {researchContext
                  .filter((s) => s.relatedTopics.includes(publication.topic))
                  .map((s) => (
                    <li key={s.slug}>
                      <a href={`/research/implementations/${s.slug}`}>
                        {s.title}
                      </a>
                    </li>
                  ))}
              </ul>
            </section>
          </div>
        </div>
      </article>,
    );
    const directory = path.join(output, "research", publication.slug);
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, "index.html"), body);
  }
  for (const study of researchContext) {
    const directory = path.join(output, "research/implementations", study.slug);
    await mkdir(directory, { recursive: true });
    await writeFile(
      path.join(directory, "index.html"),
      shell(
        study.title,
        "/research",
        <article className="preview-article">
          <a className="preview-back" href="/research#implementations">
            ← Implementation studies
          </a>
          <p className="preview-eyebrow">
            Implementation study · Reference snapshot
          </p>
          <h1>{study.title}</h1>
          <p className="preview-lede">{study.summary}</p>
          <div className="preview-reading">
            <Contents sections={study.sections} />
            <div className="preview-reading-body">
              <ResearchArticleBody body={study.sections} />
              <section id="operating-boundaries">
                <h2>Operating boundaries</h2>
                <ul>
                  {study.limitations.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </section>
              <section id="source-evidence">
                <h2>Source evidence</h2>
                <ul>
                  {study.sources.map((s) => (
                    <li key={s.url}>
                      <a href={s.url}>{s.title}</a>
                      <small> · revision {s.revision.slice(0, 12)}</small>
                    </li>
                  ))}
                </ul>
              </section>
              <section id="related-research">
                <h2>Related research</h2>
                <ul>
                  {data.publications
                    .filter(
                      (p) =>
                        study.relatedTopics.includes(p.topic) &&
                        p.documentType === "overview",
                    )
                    .map((p) => (
                      <li key={p.slug}>
                        <a href={`/research/${p.slug}`}>{p.title}</a>
                      </li>
                    ))}
                </ul>
              </section>
            </div>
          </div>
        </article>,
      ),
    );
  }
  await writeFile(
    path.join(output, "implementation-data.json"),
    JSON.stringify(researchContext, null, 2) + "\n",
  );
  await cp(
    path.join(root, "scripts/research-discovery.js"),
    path.join(output, "assets/discovery.js"),
  );
  await writeFile(
    path.join(output, "robots.txt"),
    "User-agent: *\nDisallow: /\n",
  );
  await writeFile(
    path.join(output, "404.html"),
    shell(
      "Page not found",
      "/research",
      <div className="preview-intro">
        <h1>That research page is not here.</h1>
        <p>
          <a href="/research">Browse the research collection</a>
        </p>
      </div>,
    ),
  );
  await writeFile(
    path.join(output, "research-data.json"),
    JSON.stringify(data, null, 2) + "\n",
  );
  async function files(directory: string): Promise<string[]> {
    const paths: string[] = [];
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) paths.push(...(await files(full)));
      else paths.push(full);
    }
    return paths.sort();
  }
  const hashes: Record<string, string> = {};
  for (const file of await files(output))
    hashes[path.relative(output, file)] = sha256(await readFile(file));
  await writeFile(
    path.join(output, "research-manifest.json"),
    JSON.stringify(
      {
        format: "mlai-research-review",
        version: RESEARCH_EXPORT_VERSION,
        sourceRevision: revision,
        sourceDirty: dirty,
        generatedAt,
        canonicalOrigin: RESEARCH_CANONICAL_ORIGIN,
        contentSha256: researchDigest(data),
        topics: data.tracks.map((t) => t.id),
        publications: publicationManifest(data),
        files: hashes,
      },
      null,
      2,
    ) + "\n",
  );
  await writeFile(
    path.join(stage, "package.json"),
    JSON.stringify(
      {
        name: "mlai-research-review-artifact",
        private: true,
        description:
          "Generated static artifact. Edit research source in the canonical MLAI repository; do not edit this snapshot.",
        scripts: {
          build:
            "node -e \"const fs=require('node:fs'); fs.rmSync('out',{recursive:true,force:true}); fs.cpSync('public','out',{recursive:true});\"",
        },
      },
      null,
      2,
    ) + "\n",
  );
  await writeFile(
    path.join(stage, "README.md"),
    `# MLAI Research private review\n\nGenerated from canonical MLAI source ${revision}.\n\nThe public/ directory contains the exact approved structured research collection and shared renderers. No runtime secrets, production APIs or independent prose. Rebuild with the canonical exporter, apps/quasar-web/scripts/export-research.tsx in the MLAI repository; see public/research-manifest.json for provenance.\n\nRun bun run build to stage the unchanged static bytes into out/ for Sites packaging. Configure .openai/hosting.json static.directory as out. The out/ directory is disposable build output.\n`,
  );
  // Publish only a completely generated artifact; keep the previous usable tree on failure.
  const backup = path.join(stage, "previous-public");
  if (existsSync(published)) await rename(published, backup);
  try {
    await rename(output, published);
    if (!owned) {
      await rename(
        path.join(stage, "package.json"),
        path.join(siteRoot, "package.json"),
      );
      await rename(
        path.join(stage, "README.md"),
        path.join(siteRoot, "README.md"),
      );
    }
  } catch (error) {
    if (existsSync(backup)) {
      if (existsSync(published)) await rm(published, { recursive: true });
      await rename(backup, published);
    }
    throw error;
  }
  console.log(
    `Exported ${data.tracks.length} areas, ${data.publications.length} publications to ${published}; content ${researchDigest(data)}`,
  );
} finally {
  await rm(stage, { recursive: true, force: true });
}
