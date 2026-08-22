import { FounderProfile } from "./client";
import { teamMeta, toNextMetadata } from "@/lib/route-meta";
import { personLd } from "@/lib/structured-data";
import { content } from "@/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return toNextMetadata(teamMeta(slug), `/team/${slug}`);
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const member = content.team.find((m) => m.slug === slug);
  return (
    <>
      {member ? (
        <script
          type="application/ld+json"
          // Safe only because the payload is in-repo content validated by the
          // Zod schema in src/data/schemas (see content.test.ts) — JSON.stringify
          // does NOT escape "</script>", so never widen this to user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd(member)) }}
        />
      ) : null}
      <FounderProfile />
    </>
  );
}
