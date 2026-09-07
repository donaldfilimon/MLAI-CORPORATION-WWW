import type { Metadata } from "next";
import { QuesarLanding } from "@/components/quesar-pages";

export const metadata: Metadata = {
  title: "Quesar — Private AI operations",
  description:
    "Only invited organization members can generate; metadata-only gateway; KMS-wrapped audit you can consent to, export, or delete.",
};

export default function Page() {
  return <QuesarLanding />;
}
