import type { Metadata } from "next";
import { QuesarConsent } from "@/components/quesar-pages";

export const metadata: Metadata = {
  title: "Consent · Quesar",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <QuesarConsent />;
}
