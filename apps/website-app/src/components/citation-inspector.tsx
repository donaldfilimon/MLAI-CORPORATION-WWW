"use client";
import Link from "next/link";
import { FileText, X, Download, ExternalLink } from "lucide-react";
import type { Citation } from "@/lib/types";
import { useApp, useData, ErrorMessage, locationLabel } from "./app-context";
import { useDrawerFocus } from "./use-drawer-focus";

interface InspectorProps {
  source: Citation;
  onClose: () => void;
  onOpenDocument?: (source: Citation) => void;
}
/** Source retrieval remains workspace-authorized; model-supplied excerpts are never proof. */
export function CitationInspector({
  source,
  onClose,
  onOpenDocument,
}: InspectorProps) {
  useDrawerFocus(true, ".source-inspector", onClose, 1000);
  return (
    <aside className="source-inspector" aria-label="Source inspector">
      <header>
        <h3>Sources</h3>
        <button
          className="icon-button"
          aria-label="Close source inspector"
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </header>
      <CitationContent
        key={`${source.documentId}:${source.id}`}
        source={source}
        onOpenDocument={onOpenDocument}
      />
    </aside>
  );
}
function CitationContent({
  source,
  onOpenDocument,
}: Pick<InspectorProps, "source" | "onOpenDocument">) {
  const { url } = useApp();
  const detail = useData<{
    content: string;
    location: Record<string, unknown>;
  }>(
    source.removed
      ? null
      : `documents/${source.documentId}/source?chunk=${source.id}`,
  );
  return (
    <>
      <h4>
        <FileText size={20} />
        {source.number ? `[${source.number}] ` : ""}
        {source.name}
      </h4>
      <p className="muted">
        {locationLabel(detail.data?.location || source.location) ||
          "Location unavailable"}
      </p>
      <p>
        A model citation is a reference, not independent verification. Compare
        the answer with this excerpt and the original document.
      </p>
      {source.removed ? (
        <p role="status">Source removed.</p>
      ) : (
        <>
          {detail.loading && <p role="status">Loading source excerpt…</p>}
          <ErrorMessage
            message={detail.error ? `Source unavailable: ${detail.error}` : ""}
          />
          {detail.data && (
            <blockquote aria-label="Source excerpt">
              {detail.data.content}
            </blockquote>
          )}
          <Link
            className="button secondary"
            onClick={() => onOpenDocument?.(source)}
            href={`/app/documents?document=${source.documentId}&chunk=${source.id}`}
          >
            Open document <ExternalLink size={16} />
          </Link>
          <a
            className="button secondary"
            href={url(`documents/${source.documentId}/download`)}
          >
            Download original <Download size={16} />
          </a>
        </>
      )}
    </>
  );
}
