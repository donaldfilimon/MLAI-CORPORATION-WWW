"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Check,
  ExternalLink,
  FileText,
  Plus,
  Send,
  Square,
  X,
} from "lucide-react";
import {
  agentRunDetailSchema,
  type AgentAction,
  type AgentRunDetail,
  type AgentSourceReference,
} from "@/lib/agent-contracts";
import type { Connection, Conversation } from "@/lib/types";
import {
  ErrorMessage,
  date,
  locationLabel,
  useApp,
  useData,
} from "./app-context";
import { useDrawerFocus } from "./use-drawer-focus";
import styles from "./agent-view.module.css";

const toolNames: Record<string, string> = {
  list_projects: "List projects",
  list_documents: "List documents",
  search_documents: "Search documents",
  inspect_source: "Inspect source",
  read_interpretations: "Read interpretations",
  create_project: "Create project",
  update_project: "Update project",
  associate_document: "Associate document",
  interpret_documents: "Interpret documents",
};
const statusNames: Record<string, string> = {
  queued: "Queued",
  running: "Processing",
  awaiting_approval: "Waiting for confirmation",
  completed: "Complete",
  complete: "Complete",
  cancelled: "Cancelled",
  failed: "Failed",
  pending: "Needs confirmation",
  approved: "Confirmed · queued for application",
  rejected: "Rejected",
  stale: "Stale · source or record changed",
};
const terminal = (run: AgentRunDetail) =>
  ["completed", "cancelled", "failed"].includes(run.status);

export function updateAbbeyLocation(values: Record<string, string | null>) {
  const next = new URL(window.location.href);
  for (const [key, value] of Object.entries(values)) {
    if (value) next.searchParams.set(key, value);
    else next.searchParams.delete(key);
  }
  window.history.replaceState(window.history.state, "", next);
}

function ReviewCard({
  action,
  canDecide,
  busy,
  decide,
}: {
  action: AgentAction;
  canDecide: boolean;
  busy: boolean;
  decide: (id: string, decision: "confirm" | "reject") => void;
}) {
  return (
    <article
      className={styles.review}
      aria-label={`Review ${toolNames[action.tool] || action.tool}`}
    >
      <div className={styles.cardHeading}>
        <h3>{toolNames[action.tool] || action.tool}</h3>
        <span>{statusNames[action.status]}</span>
      </div>
      <p className="small muted">
        This saved proposal applies exactly the values below.
      </p>
      <dl className={styles.values}>
        {Object.entries(action.input).map(([key, value]) => (
          <div key={key}>
            <dt>{key.replace(/_/g, " ")}</dt>
            <dd>
              {typeof value === "string"
                ? value
                : JSON.stringify(value, null, 2)}
            </dd>
          </div>
        ))}
      </dl>
      {action.affected.length > 0 && (
        <details className={styles.affected} open>
          <summary>Affected records and saved versions</summary>
          {action.affected.map((record) => (
            <div key={`${record.table}:${record.id}`}>
              <strong>{record.name}</strong>
              <p className="small muted">
                {record.table} · {record.id} · revision {record.revision}
              </p>
              <dl className={styles.values}>
                {Object.entries(record.values).map(([key, value]) => (
                  <div key={key}>
                    <dt>{key.replace(/_/g, " ")}</dt>
                    <dd>
                      {typeof value === "string"
                        ? value
                        : JSON.stringify(value, null, 2)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </details>
      )}
      <p className={`${styles.recordId} small muted`}>
        Proposal {action.id} ·{" "}
        {action.tool === "create_project"
          ? "New project"
          : action.tool === "interpret_documents"
            ? "Interpretation job"
            : "Target"}{" "}
        {action.tool === "update_project"
          ? String(action.input.project_id)
          : action.tool === "associate_document"
            ? String(action.input.document_id)
            : action.target_id}
      </p>
      {action.status === "pending" &&
        (canDecide ? (
          <div className="button-row">
            <button
              className="button primary"
              disabled={busy}
              onClick={() => decide(action.id, "confirm")}
            >
              <Check size={16} />
              Confirm
            </button>
            <button
              className="button secondary"
              disabled={busy}
              onClick={() => decide(action.id, "reject")}
            >
              <X size={16} />
              Reject
            </button>
          </div>
        ) : (
          <p className="small muted">
            Only the requesting member can confirm or reject this proposal.
          </p>
        ))}
      {action.status === "rejected" && (
        <p className="small muted">
          The proposal was rejected. This run will make no replacement change.
        </p>
      )}
      {action.status === "stale" && (
        <p className="small muted">
          Start a new run to review the current records.
        </p>
      )}
    </article>
  );
}

export function AgentView() {
  const { api, url, refresh, data: boot } = useApp();
  const conversations = useData<Conversation[]>("conversations");
  const connections = useData<Connection[]>("connections");
  const [selected, setSelected] = useState<string | null>(null);
  const conversation = useData<Conversation>(
    selected ? `conversations/${selected}` : null,
  );
  const [runId, setRunId] = useState<string | null>(null);
  const [run, setRun] = useState<AgentRunDetail | null>(null);
  const [objective, setObjective] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [streamState, setStreamState] = useState("");
  const [source, setSource] = useState<
    (AgentSourceReference & { content?: string }) | null
  >(null);
  const [sourceError, setSourceError] = useState("");
  const [ready, setReady] = useState(false);
  const generation = useRef(0);
  const lastRefresh = useRef("");
  const provider =
    connections.data?.find((c) => c.id === boot.workspace.provider_id) ||
    connections.data?.find((c) => c.kind === "local");
  const runProvider = connections.data?.find(
    (connection) =>
      connection.id === run?.provider || connection.name === run?.provider,
  );

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    setSelected(query.get("conversation"));
    setRunId(query.get("run"));
    setReady(true);
    return () => {
      generation.current++;
    };
  }, []);
  useEffect(() => {
    if (
      !ready ||
      runId ||
      conversation.data?.id !== selected ||
      !conversation.data?.agentRuns?.length
    )
      return;
    const recent = conversation.data.agentRuns[0];
    setRunId(recent.id);
    updateAbbeyLocation({
      mode: "agent",
      conversation: selected,
      run: recent.id,
    });
  }, [conversation.data, ready, runId, selected]);

  useEffect(() => {
    setRun(null);
    setSource(null);
    setError("");
    setStreamState("");
    if (!runId) return;
    let live = true;
    const stream = new EventSource(url(`agent/runs/${runId}/events`));
    const accept = (value: unknown) => {
      const parsed = agentRunDetailSchema.safeParse(value);
      if (!live) return;
      if (
        !parsed.success ||
        parsed.data.id !== runId ||
        (selected && parsed.data.conversation_id !== selected)
      ) {
        setError(
          "Unable to read this agent run. Reload to retrieve its saved state.",
        );
        stream.close();
        return;
      }
      setRun((current) =>
        current && current.revision > parsed.data.revision
          ? current
          : parsed.data,
      );
      setStreamState("");
      // Interpretation jobs can still change after the agent has answered.
      const jobsActive = parsed.data.results.some(
        (r) => r.kind === "write" && ["queued", "running"].includes(r.status),
      );
      if (terminal(parsed.data) && !jobsActive) stream.close();
    };
    setStreamState("Connecting to saved run…");
    void api<AgentRunDetail>(`agent/runs/${runId}`)
      .then(accept)
      .catch((e: Error) => {
        if (live) {
          setError(e.message);
          stream.close();
          setStreamState("");
        }
      });
    stream.addEventListener("snapshot", (event: MessageEvent<string>) => {
      try {
        accept(JSON.parse(event.data));
      } catch {
        if (live)
          setError(
            "Unable to read a run update. Reload to retrieve its saved state.",
          );
      }
    });
    stream.onopen = () => {
      if (live) setStreamState("");
    };
    stream.onerror = () => {
      if (live && stream.readyState !== EventSource.CLOSED)
        setStreamState(
          "Connection interrupted. Reconnecting to the saved run…",
        );
    };
    return () => {
      live = false;
      stream.close();
    };
  }, [api, url, runId, selected]);

  useEffect(() => {
    if (
      !run ||
      !terminal(run) ||
      lastRefresh.current === `${run.id}:${run.revision}`
    )
      return;
    lastRefresh.current = `${run.id}:${run.revision}`;
    void conversations.reload();
    void conversation.reload();
    void refresh();
  }, [run, conversations.reload, conversation.reload, refresh]);

  useDrawerFocus(!!source, "[data-agent-source]", () => setSource(null), 1000);
  useEffect(() => {
    setSourceError("");
    if (!source || source.removed) return;
    let live = true;
    setSource((current) =>
      current ? { ...current, content: undefined } : null,
    );
    void api<{ content: string }>(
      `documents/${encodeURIComponent(source.documentId)}/source?chunk=${encodeURIComponent(source.id)}`,
    )
      .then((result) => {
        if (live)
          setSource((current) =>
            current ? { ...current, content: result.content } : null,
          );
      })
      .catch((e: Error) => {
        if (live) setSourceError(e.message);
      });
    return () => {
      live = false;
    };
  }, [api, source?.id, source?.documentId, source?.removed, run?.revision]);

  const chooseRun = useCallback(
    (id: string | null, conversationId = selected) => {
      generation.current++;
      setPending(false);
      setSelected(conversationId);
      setRunId(id);
      setRun(null);
      setSource(null);
      setError("");
      updateAbbeyLocation({
        mode: "agent",
        conversation: conversationId,
        run: id,
      });
    },
    [selected],
  );

  async function start() {
    if (!objective.trim() || pending || loadingRun || (run && !terminal(run)))
      return;
    const request = generation.current;
    setPending(true);
    setError("");
    try {
      let cid = selected;
      const query = new URLSearchParams(window.location.search);
      if (!cid) {
        const created = await api<Conversation>("conversations", "POST", {
          project_id: query.get("project") || null,
        });
        cid = created.id;
      }
      if (request !== generation.current) return;
      const documentIds = query.getAll("document").filter(Boolean);
      const created = await api<AgentRunDetail>("agent/runs", "POST", {
        conversation_id: cid,
        objective: objective.trim(),
        ...(documentIds.length ? { document_ids: documentIds } : {}),
      });
      if (request !== generation.current) return;
      setSelected(cid);
      setRunId(created.id);
      setRun(created);
      setObjective("");
      updateAbbeyLocation({
        mode: "agent",
        conversation: cid,
        run: created.id,
      });
      void conversations.reload();
      void conversation.reload();
    } catch (e) {
      if (request === generation.current) setError((e as Error).message);
    } finally {
      if (request === generation.current) setPending(false);
    }
  }
  async function mutate(path: string) {
    if (pending || !run) return;
    const request = generation.current;
    setPending(true);
    setError("");
    try {
      const updated = await api<AgentRunDetail>(path, "POST", {});
      if (request === generation.current)
        setRun((current) =>
          current && current.revision > updated.revision ? current : updated,
        );
    } catch (e) {
      if (request === generation.current) setError((e as Error).message);
    } finally {
      if (request === generation.current) setPending(false);
    }
  }
  const active = !!run && !terminal(run);
  const hasActiveJobs = !!run?.results.some(
    (result) =>
      result.kind === "write" && ["queued", "running"].includes(result.status),
  );
  const loadingRun =
    !ready || (!!runId && !run) || (!!selected && conversation.loading);
  const canDecide =
    !!run && run.requester_id === boot.user.id && boot.role !== "viewer";
  const citationButtons = (references: AgentSourceReference[]) => (
    <div className="citations">
      {references.map((reference) => (
        <button
          className="citation"
          key={reference.id}
          disabled={reference.removed}
          onClick={() => setSource(reference)}
        >
          <FileText size={15} />
          {reference.number ? `[${reference.number}] ` : ""}
          {reference.name} ·{" "}
          {reference.removed
            ? "Source removed"
            : locationLabel(reference.location)}
          <ExternalLink size={13} />
        </button>
      ))}
    </div>
  );

  return (
    <div className={`chat-layout ${styles.layout}`}>
      <aside className="conversation-rail" aria-label="Agent conversations">
        <button
          className="button secondary full"
          disabled={pending}
          onClick={() => chooseRun(null, null)}
        >
          <Plus size={17} />
          New conversation
        </button>
        <span className="small muted">Conversations</span>
        {conversations.data?.map((item) => (
          <button
            key={item.id}
            title={item.title}
            className={`conversation-item ${selected === item.id ? "active" : ""}`}
            disabled={pending}
            onClick={() => chooseRun(null, item.id)}
          >
            {item.title}
          </button>
        ))}
        {!conversations.data?.length && (
          <p className="small muted">Your conversations will appear here.</p>
        )}
        <ErrorMessage message={conversations.error} />
      </aside>
      <section
        className={`chat-center ${styles.center}`}
        aria-label="Abbey agent"
      >
        <div className={`chat-toolbar ${styles.toolbar}`}>
          <Link href="/app/settings" className="provider-button">
            {!run && (
              <i
                className={provider?.kind === "hosted" ? "dot hosted" : "dot"}
              />
            )}
            {run
              ? `${runProvider ? `${runProvider.kind === "hosted" ? "Hosted" : "Local"} · ${runProvider.name}` : run.provider} / ${run.model}`
              : provider
                ? `${provider.kind === "hosted" ? "Hosted" : "Local"} · ${provider.name} / ${provider.model || "auto-discover"}`
                : "Choose a model"}
          </Link>
          {run &&
            (active || hasActiveJobs) &&
            run.requester_id === boot.user.id && (
              <button
                className="button secondary small"
                disabled={pending}
                onClick={() => void mutate(`agent/runs/${run.id}/cancel`)}
              >
                <Square size={14} />
                Cancel run
              </button>
            )}
        </div>
        <div className={styles.activity}>
          {!!conversation.data?.agentRuns?.length && (
            <label className={styles.history}>
              Saved agent runs
              <select
                aria-label="Saved agent runs"
                value={runId || ""}
                onChange={(event) => chooseRun(event.target.value)}
              >
                {conversation.data.agentRuns.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.objective} · {statusNames[item.status]}
                  </option>
                ))}
              </select>
            </label>
          )}
          <ErrorMessage message={error || conversation.error} />
          {streamState && (
            <p className="small muted" role="status">
              {streamState}
            </p>
          )}
          {!run && !runId && (
            <div className="chat-welcome">
              <div className="abbey-symbol">✦</div>
              <h2>Work through an objective.</h2>
              <p>
                Abbey can investigate workspace sources and propose specific
                changes for your review.
              </p>
              <p className="small muted">
                Every change requires confirmation. Up to eight tool steps per
                run.
              </p>
            </div>
          )}
          {run && (
            <>
              <header className={styles.objective}>
                <span className="eyebrow">Agent objective</span>
                <h2>{run.objective}</h2>
                <p className="small muted">
                  {date(run.created_at)} · {run.step_count} of 8 tool steps
                </p>
                <p role="status" className={styles.runStatus}>
                  {statusNames[run.status]}
                </p>
                <ErrorMessage message={run.error || ""} />
              </header>
              {run.steps.length > 0 && (
                <section aria-label="Agent activity">
                  <h3>Activity</h3>
                  <ol className={styles.steps}>
                    {run.steps.map((step, index) => (
                      <li key={step.id}>
                        <strong>{toolNames[step.tool] || step.tool}</strong>
                        <span className="small muted">
                          Step {index + 1} · {step.count}{" "}
                          {step.count === 1 ? "record" : "records"}
                        </span>
                        {citationButtons(step.sources)}
                      </li>
                    ))}
                  </ol>
                </section>
              )}
              {run.actions.map((action) => (
                <ReviewCard
                  key={action.id}
                  action={action}
                  canDecide={canDecide}
                  busy={pending || run.status !== "awaiting_approval"}
                  decide={(id, decision) =>
                    void mutate(`agent/actions/${id}/${decision}`)
                  }
                />
              ))}
              {run.results.map((result) => (
                <article
                  key={result.id}
                  className={styles.result}
                  aria-label={
                    result.kind === "answer" ? "Agent answer" : "Action result"
                  }
                >
                  <h3>
                    {result.kind === "answer"
                      ? "Abbey"
                      : run.actions.find(
                            (action) => action.id === result.action_id,
                          )?.tool === "interpret_documents"
                        ? "Interpretation job"
                        : "Applied change"}
                  </h3>
                  <p>{result.content}</p>
                  {result.kind === "write" && (
                    <p className="small muted">
                      {statusNames[result.status] || result.status}
                      {result.resource_id && <> · {result.resource_id}</>}
                    </p>
                  )}
                  {citationButtons(result.citations)}
                </article>
              ))}
            </>
          )}
        </div>
        <div className="composer-wrap">
          {boot.role === "viewer" && (
            <p className="small muted">
              Viewer access: investigate sources. Workspace changes require a
              requesting member.
            </p>
          )}
          <form
            className="composer"
            onSubmit={(event) => {
              event.preventDefault();
              void start();
            }}
          >
            <textarea
              aria-label="Agent objective"
              placeholder="Describe the outcome you want Abbey to investigate…"
              value={objective}
              rows={2}
              maxLength={16000}
              disabled={pending || active || loadingRun}
              onChange={(event) => setObjective(event.target.value)}
            />
            <div className={`composer-bottom ${styles.composerBottom}`}>
              <span className="small muted">Changes wait for your review.</span>
              <button
                className="send-button"
                aria-label="Start agent run"
                disabled={!objective.trim() || pending || active || loadingRun}
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      </section>
      {source && (
        <aside
          className={`source-inspector ${styles.inspector}`}
          data-agent-source
          aria-label="Agent source inspector"
        >
          <header>
            <h3>Source</h3>
            <button
              className="icon-button"
              aria-label="Close agent source inspector"
              onClick={() => setSource(null)}
            >
              <X size={18} />
            </button>
          </header>
          <h4>
            <FileText size={20} />
            {source.name}
          </h4>
          <p className="muted">{locationLabel(source.location)}</p>
          <ErrorMessage message={sourceError} />
          {source.removed ? (
            <p>Source removed.</p>
          ) : (
            <>
              {source.content ? (
                <blockquote>{source.content}</blockquote>
              ) : (
                !sourceError && <p role="status">Loading source…</p>
              )}
              <Link
                className="button secondary"
                href={`/app/documents?document=${encodeURIComponent(source.documentId)}&chunk=${encodeURIComponent(source.id)}`}
              >
                Open document
                <ExternalLink size={16} />
              </Link>
            </>
          )}
        </aside>
      )}
    </div>
  );
}
