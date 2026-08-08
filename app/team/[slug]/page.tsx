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
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd(member)) }}
        />
      ) : null}
      <FounderProfile />
    </>
  );
}
