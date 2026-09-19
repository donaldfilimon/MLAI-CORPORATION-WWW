import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { content } from "@/data";

export const runtime = "nodejs";
export const alt = "MLAI Corporation — Team";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return content.team.filter((m) => m.slug).map((member) => ({ slug: member.slug as string }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const member = content.team.find((m) => m.slug === slug);

  return renderOgImage({
    kicker: member?.role ?? "TEAM",
    title: member?.name ?? "MLAI Corporation",
    subtitle: member?.tagline,
  });
}
