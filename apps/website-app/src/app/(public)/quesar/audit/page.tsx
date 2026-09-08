import type { Metadata } from "next";
import { QuesarAudit } from "@/components/quesar-pages";

export const metadata: Metadata = {
  title: "Audit viewer · Quesar",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <QuesarAudit />;
}
