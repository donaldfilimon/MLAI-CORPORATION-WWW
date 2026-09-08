"use client";
import { useDrawerFocus } from "./use-drawer-focus";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Upload,
  Search,
  RefreshCw,
  Download,
  Trash2,
  X,
  ArrowRight,
} from "lucide-react";
import {
  useApp,
  useData,
  ErrorMessage,
  Status,
  date,
  locationLabel,
} from "./app-context";
import type { DocumentRecord, Citation } from "@/lib/types";
interface Capabilities {
  available: boolean;
  maxUploadMB?: number;
  native: string[];
  structured: string[];
  legacy: string[];
  ocr: boolean;
  semantic: boolean;
  reason?: string;
}
export function DocumentsView() {
  const { api, upload, url, data: boot } = useApp(),
    list = useData<DocumentRecord[]>("documents"),
    caps = useData<Capabilities>("documents/capabilities");
  const [selected, setSelected] = useState<string | null>(null),
    [project, setProject] = useState(""),
    [chunk, setChunk] = useState<string | null>(null),
    [q, setQ] = useState(""),
    [tab, setTab] = useState("preview"),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [kind, setKind] = useState("summary"),
    [compare, setCompare] = useState<string[]>([]);
  const focusedSource = useData<{
    id: string;
    content: string;
    location: Record<string, unknown>;
  }>(selected && chunk ? `documents/${selected}/source?chunk=${chunk}` : null);
  const detail = useData<DocumentRecord>(
      selected ? `documents/${selected}` : null,
    ),
    fileInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setSelected(new URLSearchParams(window.location.search).get("document"));
    setChunk(new URLSearchParams(window.location.search).get("chunk"));
  }, []);
  useEffect(() => {
    if (
      !list.data?.some((d) => ["queued", "processing"].includes(d.status)) &&
      !detail.data?.jobs?.some((j) => ["queued", "running"].includes(j.status))
    )
      return;
    const timer = setInterval(() => {
      void list.reload();
      if (selected) void detail.reload();
    }, 2000);
    return () => clearInterval(timer);
  }, [list.data, list.reload, detail.reload, detail.data, selected]);
  const files =
    list.data?.filter(
      (d) =>
        (!project || d.project_id === project) &&
        d.name.toLowerCase().includes(q.toLowerCase()),
    ) || [];
  useDrawerFocus(!!selected, ".document-inspector", () => setSelected(null));
  const doc = detail.data;
  async function action(name: string) {
    if (!selected) return;
    setError("");
    try {
      await api(`documents/${selected}/${name}`, "POST", {});
      await list.reload();
      await detail.reload();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <div className={`documents-layout ${selected ? "has-selection" : ""}`}>
      <div className="document-list-pane">
        <div className="documents-toolbar">
          <button
            className="button primary"
            disabled={busy || boot.role === "viewer" || !caps.data?.available}
            onClick={() => fileInput.current?.click()}
          >
            <Upload size={18} />
            {busy ? "Uploading…" : "Upload documents"}
          </button>
          <input
            ref={fileInput}
            type="file"
            multiple
            className="sr-only"
            aria-label="Upload documents"
            accept={
              caps.data
                ? [
                    ...caps.data.native,
                    ...caps.data.structured,
                    ...caps.data.legacy,
                  ]
                    .map((e) => `.${e}`)
                    .join(",")
                : undefined
            }
            onChange={async (e) => {
              const files = [...(e.target.files || [])];
              setBusy(true);
              setError("");
              try {
                for (const file of files) {
                  const result = await upload<{ id: string }>(
                    `documents${project ? `?project=${project}` : ""}`,
                    file,
                  );
                  setSelected(result.id);
                }
                await list.reload();
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
                if (fileInput.current) fileInput.current.value = "";
              }
            }}
          />
          <select
            aria-label="Filter documents by project"
            value={project}
            onChange={(e) => setProject(e.target.value)}
          >
            <option value="">All projects</option>
            {boot.projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <label className="search-input">
          <Search size={18} />
          <input
            aria-label="Search documents"
            placeholder="Search documents"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
        <ErrorMessage message={error || list.error || caps.error} />
        <div className="document-table" role="table" aria-label="Documents">
          <div className="document-table-header" role="row">
            <span>Name</span>
            <span>Status</span>
            <span>Updated</span>
          </div>
          {files.map((d) => (
            <button
              className={`document-table-row ${selected === d.id ? "selected" : ""}`}
              key={d.id}
              onClick={() => {
                setSelected(d.id);
                setChunk(null);
                setTab("preview");
              }}
            >
              <span>
                <FileText size={21} />
                <span>
                  {d.name}
                  <small>
                    {d.extension.toUpperCase()} · {(d.size / 1024).toFixed(1)}{" "}
                    KB
                  </small>
                </span>
              </span>
              <Status value={d.status} />
              <time>{date(d.updated_at)}</time>
            </button>
          ))}
        </div>
        {!files.length && (
          <div className="empty">
            <FileText />
            <h3>Bring your sources into focus.</h3>
            <p>Upload a document to read, search, and discuss it with Abbey.</p>
          </div>
        )}
        <details className="capabilities">
          <summary>Installed document capabilities</summary>
          <p>
            {caps.data?.available ? "Available extensions" : "Parser not ready"}
          </p>
          <p className="small">
            {caps.data
              ? [
                  ...caps.data.native,
                  ...caps.data.structured,
                  ...caps.data.legacy,
                ].join(", ")
              : "Checking installed parsers…"}
          </p>
          <p className="small muted">
            OCR requires a working local parser and model assets. Unsupported or
            encrypted files report a processing error. Maximum file size:{" "}
            {caps.data?.maxUploadMB || 100} MB.
          </p>
        </details>
      </div>
      {selected && (
        <section className="document-inspector" aria-label="Document inspector">
          <header>
            <h3>{doc?.name || "Opening document…"}</h3>
            <div className="button-row">
              {boot.role !== "viewer" && (
                <button
                  className="icon-button"
                  aria-label="Reprocess document"
                  onClick={() => void action("reprocess")}
                >
                  <RefreshCw size={17} />
                </button>
              )}
              <a
                className="icon-button"
                href={url(`documents/${selected}/download`)}
                aria-label="Download original"
              >
                <Download size={17} />
              </a>
              {boot.role !== "viewer" && (
                <button
                  className="icon-button"
                  aria-label="Delete document"
                  onClick={async () => {
                    if (
                      confirm(
                        "Delete this document, its extracted content, and all generated insights?",
                      )
                    ) {
                      try {
                        await api(`documents/${selected}`, "DELETE");
                        setSelected(null);
                        await list.reload();
                      } catch (e) {
                        setError((e as Error).message);
                      }
                    }
                  }}
                >
                  <Trash2 size={17} />
                </button>
              )}
              <button
                className="icon-button"
                aria-label="Close document"
                onClick={() => setSelected(null)}
              >
                <X size={18} />
              </button>
            </div>
          </header>
          <div className="tabs" role="tablist">
            {["preview", "outline", "tables", "text", "insights"].map((t) => (
              <button
                role="tab"
                aria-selected={tab === t}
                key={t}
                className={tab === t ? "active" : ""}
                onClick={() => setTab(t)}
              >
                {t[0].toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <div className="document-view">
            <ErrorMessage message={detail.error} />
            {doc && !["ready", "partial"].includes(doc.status) && (
              <div className="processing-state">
                <Status value={doc.status} />
                <p>{doc.progress}</p>
                {["queued", "processing"].includes(doc.status) && (
                  <button
                    className="button secondary small"
                    onClick={() => void action("cancel")}
                  >
                    Cancel processing
                  </button>
                )}
                {["failed", "cancelled"].includes(doc.status) && (
                  <button
                    className="button secondary small"
                    onClick={() => void action("reprocess")}
                  >
                    Try again
                  </button>
                )}
              </div>
            )}
            {doc && Array.isArray(doc.warnings) && doc.warnings.length > 0 && (
              <div className="warning">{doc.warnings.join(" ")}</div>
            )}
            {focusedSource.data && (
              <section className="focused-source" tabIndex={-1}>
                <span className="eyebrow">
                  Cited source · {locationLabel(focusedSource.data.location)}
                </span>
                <p>{focusedSource.data.content}</p>
              </section>
            )}
            {focusedSource.error && (
              <ErrorMessage message={focusedSource.error} />
            )}
            {tab === "preview" &&
              doc &&
              ["pdf", "png", "jpg", "jpeg", "webp"].includes(doc.extension) && (
                <a
                  className="button secondary small"
                  target="_blank"
                  rel="noreferrer"
                  href={url(`documents/${selected}/download?preview=1`)}
                >
                  Open original preview
                </a>
              )}
            {tab === "preview" && doc?.extraction && (
              <div className="document-paper">
                <h2>{doc.name.replace(/\.[^.]+$/, "")}</h2>
                {doc.extraction.chunks.slice(0, 60).map((c, i) => (
                  <section key={i}>
                    <p>{c.content}</p>
                    <span className="source-location">
                      {locationLabel(c.location)}
                    </span>
                  </section>
                ))}
              </div>
            )}
            {tab === "outline" && (
              <ol className="outline-list">
                {doc?.extraction?.outline.map((text, i) => (
                  <li key={i}>{text}</li>
                ))}
                {!doc?.extraction?.outline.length && (
                  <p className="muted">No section headings were extracted.</p>
                )}
              </ol>
            )}
            {tab === "text" && (
              <pre className="extracted-text">
                {doc?.extraction?.text || "No extracted text is available yet."}
              </pre>
            )}
            {tab === "tables" && (
              <div>
                {doc?.extraction?.tables.map((t, i) => (
                  <div className="extracted-table" key={i}>
                    <h4>
                      {t.name} · {locationLabel(t.location)}
                    </h4>
                    <div className="table-scroll">
                      <table>
                        <tbody>
                          {t.rows.map((row, j) => (
                            <tr key={j}>
                              {row.map((cell, k) => (
                                <td key={k}>{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
                {!doc?.extraction?.tables.length && (
                  <p className="muted">No tables were extracted.</p>
                )}
              </div>
            )}
            {tab === "insights" && (
              <div>
                <p className="muted">
                  Generated interpretations are separate from extracted source
                  content.
                </p>
                <div className="interpret-controls">
                  <select
                    aria-label="Interpretation type"
                    value={kind}
                    onChange={(e) => setKind(e.target.value)}
                  >
                    {[
                      "summary",
                      "classification",
                      "key_facts",
                      "action_items",
                      "comparison",
                    ].map((k) => (
                      <option key={k} value={k}>
                        {k.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                  <button
                    className="button primary"
                    disabled={
                      busy || boot.role === "viewer" || !doc?.extraction
                    }
                    onClick={async () => {
                      setBusy(true);
                      setError("");
                      try {
                        await api(`documents/${selected}/interpret`, "POST", {
                          kind,
                          compare_with: compare,
                        });
                        await detail.reload();
                      } catch (e) {
                        setError((e as Error).message);
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    {busy ? "Interpreting…" : "Generate insight"}
                  </button>
                </div>
                {kind === "comparison" && (
                  <fieldset>
                    <legend>Compare with</legend>
                    {files
                      .filter((d) => d.id !== selected)
                      .map((d) => (
                        <label className="checkbox-label" key={d.id}>
                          <input
                            type="checkbox"
                            checked={compare.includes(d.id)}
                            onChange={(e) =>
                              setCompare(
                                e.target.checked
                                  ? [...compare, d.id]
                                  : compare.filter((x) => x !== d.id),
                              )
                            }
                          />
                          {d.name}
                        </label>
                      ))}
                  </fieldset>
                )}
                {doc?.jobs
                  ?.filter((j) => j.kind === "interpret")
                  .map((j) => (
                    <div className="processing-state" key={j.id}>
                      <Status value={j.status} />
                      <span> Interpretation job</span>
                      {j.error && <ErrorMessage message={j.error} />}{" "}
                      {["running", "queued"].includes(j.status) && (
                        <button
                          className="button secondary small"
                          onClick={() => void action("cancel")}
                        >
                          Cancel interpretation
                        </button>
                      )}
                    </div>
                  ))}
                {doc?.insights?.map((i) => (
                  <article className="insight" key={i.id}>
                    <h4>{i.kind.replace(/_/g, " ")}</h4>
                    <p className="small muted">
                      {i.provider} · {date(i.created_at)}
                    </p>
                    <div className="message-body">{i.content}</div>
                    <div className="citations">
                      {(JSON.parse(i.citations || "[]") as Citation[]).map(
                        (c) => (
                          <Link
                            key={c.id}
                            href={`/app/documents?document=${c.documentId}&chunk=${c.id}`}
                            onClick={() => {
                              setSelected(c.documentId);
                              setChunk(c.id);
                              setTab("preview");
                            }}
                          >
                            [{c.number}] {c.name} · {locationLabel(c.location)}
                          </Link>
                        ),
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
          <footer className="document-footer">
            <Link
              className="button secondary full"
              href={`/app/abbey?document=${selected}${doc?.project_id ? `&project=${doc.project_id}` : ""}`}
            >
              Ask Abbey about this document <ArrowRight size={17} />
            </Link>
          </footer>
        </section>
      )}
    </div>
  );
}
