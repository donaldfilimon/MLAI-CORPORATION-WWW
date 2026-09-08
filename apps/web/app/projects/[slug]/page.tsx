import { ProjectPage } from "./client";
import { projectMeta, toNextMetadata } from "@/lib/route-meta";
import { projectLd } from "@/lib/structured-data";
import { content } from "@/data";

export function generateStaticParams() {
  return content.projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return toNextMetadata(projectMeta(slug), `/projects/${slug}`);
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const record = content.projects.find((p) => p.slug === slug);
  return (
    <>
      {record ? (
        <script
          type="application/ld+json"
          // Safe only because the payload is in-repo content validated by the
          // Zod schema in src/data/schemas (see content.test.ts) — JSON.stringify
          // does NOT escape "</script>", so never widen this to user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(projectLd(record)) }}
        />
      ) : null}
      <ProjectPage slug={slug} />
    </>
  );
}
