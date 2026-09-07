import { DocsShell } from "@/components/docs-shell";
import { getDocsNavItems } from "@/lib/docs";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="public-container">
      <DocsShell items={getDocsNavItems()}>{children}</DocsShell>
    </div>
  );
}
