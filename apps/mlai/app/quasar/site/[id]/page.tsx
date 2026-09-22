import { QuasarSite } from "../../../../lib/quasar-screens";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <QuasarSite id={id} />;
}
