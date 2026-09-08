import { ProjectPage } from "./client";
import { projectMeta, toNextMetadata } from "@/lib/route-meta";
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
  return <ProjectPage slug={slug} />;
}
