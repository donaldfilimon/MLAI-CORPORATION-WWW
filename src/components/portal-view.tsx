"use client";
import { useEffect, useRef, useState } from "react";
import {
  Plus,
  FileText,
  Download,
  Check,
  MessageCircle,
  Upload,
  X,
  Users,
} from "lucide-react";
import { useApp, useData, ErrorMessage, Status, date } from "./app-context";
import type { Engagement } from "@/lib/types";
interface Inquiry {
  id: string;
  name: string;
  email: string;
  company: string;
  message: string;
  status: string;
  created_at: number;
}
interface Directory {
  staff: { id: string; name: string; email: string }[];
  workspaces: { id: string; name: string }[];
}
export function PortalView({ staffMode = false }: { staffMode?: boolean }) {
  const { api, upload, url, data: boot } = useApp();
  const list = useData<Engagement[]>(
      `engagements${staffMode ? "?staff=1" : ""}`,
    ),
    directory = useData<Directory>(staffMode ? "staff/directory" : null),
    inquiries = useData<Inquiry[]>(staffMode ? "staff/inquiries" : null);
  const [selected, setSelected] = useState<string | null>(null),
    [newRequest, setNewRequest] = useState(false),
    [error, setError] = useState(""),
    [tab, setTab] = useState("engagements"),
    [busy, setBusy] = useState(false),
    [review, setReview] = useState("");
  const detail = useData<Engagement>(
      selected ? `engagements/${selected}` : null,
    ),
    fileInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setSelected(new URLSearchParams(window.location.search).get("engagement"));
  }, []);
  const item = detail.data;
  async function perform(path: string, method = "POST", payload: unknown = {}) {
    setError("");
    setBusy(true);
    try {
      await api(path, method, payload);
      await list.reload();
      if (selected) await detail.reload();
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="tabs page-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={tab === "engagements"}
          className={tab === "engagements" ? "active" : ""}
          onClick={() => setTab("engagements")}
        >
          {staffMode ? "Assigned work & requests" : "My engagements"}
        </button>
        {staffMode && (
          <button
            role="tab"
            aria-selected={tab === "inquiries"}
            className={tab === "inquiries" ? "active" : ""}
            onClick={() => setTab("inquiries")}
          >
            Inquiries
          </button>
        )}
      </div>
      <div className="page-padding">
        <div className="section-heading">
          <div>
            <h2>
              {staffMode
                ? "Move the work forward."
                : "Work together, with a clear record."}
            </h2>
            <p className="muted">
              {staffMode
                ? "Triage requests, manage assigned engagements, and publish reviewable deliverables."
                : "Service requests, milestones, and deliverables stay together."}
            </p>
          </div>
          {boot.role !== "viewer" && (
            <button
              className="button primary"
              onClick={() => setNewRequest(!newRequest)}
            >
              <Plus size={17} />
              {staffMode ? "New engagement" : "New service request"}
            </button>
          )}
        </div>
        <ErrorMessage message={error || list.error} />
        {newRequest && (
          <form
            className="request-form"
            onSubmit={async (e) => {
              e.preventDefault();
              const fields = Object.fromEntries(new FormData(e.currentTarget));
              setBusy(true);
              try {
                const r = await api<{ id: string }>(
                  staffMode ? "staff/engagements" : "engagements",
                  "POST",
                  fields,
                );
                setNewRequest(false);
                setSelected(r.id);
                await list.reload();
                setError("");
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <h3>
              {staffMode ? "Create an engagement" : "Tell us what you need"}
            </h3>
            {staffMode && (
              <label>
                Customer workspace
                <select name="workspace_id" required>
                  {directory.data?.workspaces.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label>
              Title
              <input
                name="title"
                required
                maxLength={160}
                placeholder="A focused description of the work"
              />
            </label>
            <label>
              Goals and context
              <textarea name="description" required rows={4} maxLength={8000} />
            </label>
            <div className="button-row">
              <button className="button primary" disabled={busy}>
                {busy
                  ? "Saving…"
                  : staffMode
                    ? "Create engagement"
                    : "Submit request"}
              </button>
              <button
                type="button"
                className="button secondary"
                onClick={() => setNewRequest(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
        {tab === "inquiries" && staffMode ? (
          <div className="inquiry-list">
            {inquiries.data?.map((i) => (
              <article key={i.id}>
                <div className="section-heading">
                  <h3>
                    {i.name} {i.company && `· ${i.company}`}
                  </h3>
                  <Status value={i.status} />
                </div>
                <p className="small muted">
                  {i.email} · {date(i.created_at)}
                </p>
                <p className="message-body">{i.message}</p>
                <select
                  aria-label={`Inquiry status for ${i.name}`}
                  value={i.status}
                  onChange={async (e) => {
                    await perform("staff/inquiries", "PATCH", {
                      id: i.id,
                      status: e.target.value,
                    });
                    await inquiries.reload();
                  }}
                >
                  <option value="new">New</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="closed">Closed</option>
                </select>
              </article>
            ))}
            {!inquiries.data?.length && (
              <p className="empty">No inquiries have been submitted.</p>
            )}
          </div>
        ) : (
          <div className={`portal-layout ${selected ? "has-selection" : ""}`}>
            <aside className="engagement-list">
              {list.data?.map((e) => (
                <div
                  className={`engagement-item ${selected === e.id ? "selected" : ""}`}
                  key={e.id}
                >
                  <button onClick={() => setSelected(e.id)}>
                    <strong>{e.title}</strong>
                    <Status value={e.status} />
                  </button>
                  {staffMode && e.status === "requested" && (
                    <button
                      className="text-button"
                      onClick={async () => {
                        if (await perform(`engagements/${e.id}/claim`)) {
                          setSelected(e.id);
                          await detail.reload();
                        }
                      }}
                    >
                      Claim request
                    </button>
                  )}
                </div>
              ))}
              {!list.data?.length && (
                <div className="empty">
                  <Users />
                  <h3>
                    {staffMode
                      ? "No assigned work yet."
                      : "Start a conversation about your project."}
                  </h3>
                  <p>
                    {staffMode
                      ? "New service requests will appear here."
                      : "Submit a request to begin an engagement."}
                  </p>
                </div>
              )}
            </aside>
            {selected && (
              <section className="engagement-detail">
                <header className="section-heading">
                  <div>
                    <h2>{item?.title || "Engagement"}</h2>
                    {item && <Status value={item.status} />}
                  </div>
                  <button
                    className="icon-button"
                    aria-label="Close engagement"
                    onClick={() => setSelected(null)}
                  >
                    <X size={18} />
                  </button>
                </header>
                <ErrorMessage message={detail.error} />
                {item && (
                  <>
                    <p>{item.description}</p>
                    {item.canManage && (
                      <div className="staff-controls">
                        <label>
                          Engagement status
                          <select
                            value={item.status}
                            onChange={(e) =>
                              void perform(`engagements/${selected}`, "PATCH", {
                                status: e.target.value,
                              })
                            }
                          >
                            {["active", "review", "completed", "cancelled"].map(
                              (s) => (
                                <option key={s}>{s}</option>
                              ),
                            )}
                          </select>
                        </label>
                        <label>
                          Assign a colleague
                          <select
                            defaultValue=""
                            onChange={(e) => {
                              if (e.target.value)
                                void perform(
                                  `engagements/${selected}/assign`,
                                  "POST",
                                  { user_id: e.target.value },
                                );
                            }}
                          >
                            <option value="">Select staff member</option>
                            {directory.data?.staff.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    )}
                    {item.assignments?.length ? (
                      <p className="small muted">
                        Assigned MLAI staff:{" "}
                        {item.assignments.map((s) => s.name).join(", ")}
                      </p>
                    ) : null}
                    {!staffMode && (
                      <details className="onboarding-details">
                        <summary>Engagement onboarding</summary>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            void perform(`engagements/${selected}`, "PATCH", {
                              onboarding: Object.fromEntries(
                                new FormData(e.currentTarget),
                              ),
                            });
                          }}
                        >
                          <label>
                            Desired outcome
                            <textarea
                              name="outcome"
                              rows={2}
                              defaultValue={
                                JSON.parse(item.onboarding || "{}").outcome ||
                                ""
                              }
                            />
                          </label>
                          <label>
                            Constraints and timeline
                            <textarea
                              name="constraints"
                              rows={2}
                              defaultValue={
                                JSON.parse(item.onboarding || "{}")
                                  .constraints || ""
                              }
                            />
                          </label>
                          <button
                            className="button secondary small"
                            disabled={busy || boot.role === "viewer"}
                          >
                            Save onboarding
                          </button>
                        </form>
                      </details>
                    )}
                    <h3 className="space-top">Milestones</h3>
                    <div className="milestone-list">
                      {item.milestones?.map((m) => (
                        <div key={m.id}>
                          <span
                            className={
                              m.status === "complete"
                                ? "milestone-check complete"
                                : "milestone-check"
                            }
                          >
                            {m.status === "complete" ? <Check size={15} /> : ""}
                          </span>
                          <strong>{m.title}</strong>
                          {item.canManage ? (
                            <select
                              aria-label={`Status for ${m.title}`}
                              value={m.status}
                              onChange={(e) =>
                                void perform(
                                  `engagements/${selected}/milestones/${m.id}`,
                                  "PATCH",
                                  { status: e.target.value },
                                )
                              }
                            >
                              {["planned", "active", "complete"].map((s) => (
                                <option key={s}>{s}</option>
                              ))}
                            </select>
                          ) : (
                            <Status value={m.status} />
                          )}
                          <span className="small muted">
                            {m.due_date || ""}
                          </span>
                        </div>
                      ))}
                      {!item.milestones?.length && (
                        <p className="muted small">
                          Milestones will appear when the engagement is planned.
                        </p>
                      )}
                    </div>
                    {item.canManage && (
                      <form
                        className="inline-form"
                        onSubmit={(e) => {
                          e.preventDefault();
                          void perform(
                            `engagements/${selected}/milestones`,
                            "POST",
                            Object.fromEntries(new FormData(e.currentTarget)),
                          );
                        }}
                      >
                        <input
                          aria-label="Milestone title"
                          name="title"
                          required
                          maxLength={160}
                          placeholder="New milestone"
                        />
                        <input
                          aria-label="Milestone due date"
                          type="date"
                          name="due_date"
                        />
                        <button className="button secondary small">Add</button>
                      </form>
                    )}
                    <div className="section-heading space-top">
                      <h3>Deliverables</h3>
                      {item.canManage && (
                        <button
                          className="button secondary small"
                          disabled={busy}
                          onClick={() => fileInput.current?.click()}
                        >
                          <Upload size={16} />
                          Upload version
                        </button>
                      )}
                    </div>
                    <input
                      ref={fileInput}
                      type="file"
                      className="sr-only"
                      aria-label="Upload deliverable"
                      disabled={!item.canManage || busy}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setBusy(true);
                        try {
                          await upload(
                            `engagements/${selected}/deliverables`,
                            file,
                          );
                          await detail.reload();
                          await list.reload();
                        } catch (e) {
                          setError((e as Error).message);
                        } finally {
                          setBusy(false);
                          if (fileInput.current) fileInput.current.value = "";
                        }
                      }}
                    />
                    {item.deliverables?.map((d) => (
                      <div className="deliverable" key={d.id}>
                        <FileText size={21} />
                        <div>
                          <strong>{d.name}</strong>
                          <span className="small muted">
                            Version {d.version} · {date(d.created_at)} ·{" "}
                            {d.decision?.replace(/_/g, " ") ||
                              "Awaiting review"}
                          </span>
                        </div>
                        <a
                          className="button secondary small"
                          href={url(
                            `engagements/${selected}/deliverables/${d.id}`,
                          )}
                        >
                          <Download size={15} />
                          Open
                        </a>
                        {!staffMode && boot.role !== "viewer" && (
                          <button
                            className="button secondary small"
                            onClick={() =>
                              setReview(review === d.id ? "" : d.id)
                            }
                          >
                            Review
                          </button>
                        )}
                        {review === d.id && (
                          <form
                            className="deliverable-review"
                            onSubmit={async (e) => {
                              e.preventDefault();
                              if (
                                await perform(
                                  `engagements/${selected}/deliverables/${d.id}`,
                                  "POST",
                                  Object.fromEntries(
                                    new FormData(e.currentTarget),
                                  ),
                                )
                              )
                                setReview("");
                            }}
                          >
                            <label>
                              Decision
                              <select name="decision">
                                <option value="approved">
                                  Approve this version
                                </option>
                                <option value="changes_requested">
                                  Request changes
                                </option>
                              </select>
                            </label>
                            <label>
                              Review comments
                              <textarea
                                name="comment"
                                maxLength={8000}
                                rows={3}
                              />
                            </label>
                            <button
                              className="button primary small"
                              disabled={busy}
                            >
                              Record review
                            </button>
                          </form>
                        )}
                      </div>
                    ))}
                    {!item.deliverables?.length && (
                      <p className="small muted">
                        No deliverables uploaded yet.
                      </p>
                    )}
                    {!!item.reviews?.length && (
                      <>
                        <h3 className="space-top">Version review history</h3>
                        <div className="engagement-comments">
                          {item.reviews.map((r) => {
                            const d = item.deliverables?.find(
                              (d) => d.id === r.deliverable_id,
                            );
                            return (
                              <article key={r.id}>
                                <strong>
                                  {d?.name} · Version {d?.version} ·{" "}
                                  {r.decision.replace(/_/g, " ")}
                                </strong>
                                <p className="small muted">
                                  {r.name} · {date(r.created_at)}
                                </p>
                                {r.comment && <p>{r.comment}</p>}
                              </article>
                            );
                          })}
                        </div>
                      </>
                    )}
                    <h3 className="space-top">Activity</h3>
                    <div className="engagement-comments">
                      {item.comments?.map((c) => (
                        <article key={c.id}>
                          <div>
                            <span className="avatar">{c.name.slice(0, 1)}</span>
                            <strong>{c.name}</strong>
                            <time className="small muted">
                              {date(c.created_at)}
                            </time>
                          </div>
                          <p>{c.content}</p>
                        </article>
                      ))}
                    </div>
                    {boot.role !== "viewer" && (
                      <form
                        className="comment-form"
                        onSubmit={async (e) => {
                          e.preventDefault();
                          const form = e.currentTarget;
                          if (
                            await perform(
                              `engagements/${selected}/comments`,
                              "POST",
                              Object.fromEntries(new FormData(form)),
                            )
                          )
                            form.reset();
                        }}
                      >
                        <textarea
                          name="content"
                          aria-label="Add engagement comment"
                          required
                          maxLength={8000}
                          rows={2}
                          placeholder="Add a comment…"
                        />
                        <button
                          className="button primary small"
                          disabled={busy}
                        >
                          <MessageCircle size={15} />
                          Add comment
                        </button>
                      </form>
                    )}
                  </>
                )}
              </section>
            )}
          </div>
        )}
      </div>
    </>
  );
}
