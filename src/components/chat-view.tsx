"use client";
import { useDrawerFocus } from "./use-drawer-focus";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Send,
  Square,
  Copy,
  ExternalLink,
  FileText,
  MessageCircle,
  X,
  Download,
  Trash2,
  Pencil,
  Folder,
  Paperclip,
} from "lucide-react";
import { useApp, useData, ErrorMessage, locationLabel } from "./app-context";
import type { Conversation, Message, Citation, Connection } from "@/lib/types";
import { AgentView, updateAbbeyLocation } from "./agent-view";
import styles from "./agent-view.module.css";
export function ChatView() {
  const [mode, setMode] = useState<"ask" | "agent">("ask");
  useEffect(() => {
    const read = () =>
      setMode(
        new URLSearchParams(window.location.search).get("mode") === "agent"
          ? "agent"
          : "ask",
      );
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, []);
  return (
    <div className={styles.workspace}>
      <nav className={styles.modes} aria-label="Abbey mode">
        {(["ask", "agent"] as const).map((value) => (
          <button
            key={value}
            aria-pressed={mode === value}
            onClick={() => {
              updateAbbeyLocation({ mode: value === "agent" ? "agent" : null });
              setMode(value);
            }}
          >
            {value === "ask" ? "Ask" : "Agent"}
          </button>
        ))}
      </nav>
      {mode === "agent" ? <AgentView /> : <AskView />}
    </div>
  );
}
function AskView() {
  const { api, url, data: boot } = useApp();
  const list = useData<Conversation[]>("conversations"),
    connections = useData<Connection[]>("connections");
  const [selected, setSelected] = useState<string | null>(null),
    [messages, setMessages] = useState<Message[]>([]),
    [input, setInput] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [project, setProject] = useState<string>(""),
    [source, setSource] = useState<Citation | null>(null),
    [provider, setProvider] = useState("");
  const abort = useRef<AbortController | null>(null),
    bottom = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setProject(q.get("project") || "");
    if (q.get("conversation")) setSelected(q.get("conversation"));
  }, []);
  useEffect(() => {
    if (abort.current) return;
    if (!selected) {
      setMessages([]);
      return;
    }
    let live = true;
    api<Conversation>(`conversations/${selected}`)
      .then((c) => {
        if (live) {
          setMessages(c.messages || []);
          setProject(c.project_id || "");
        }
      })
      .catch((e) => setError(e.message));
    return () => {
      live = false;
    };
  }, [api, selected]);
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "auto", block: "nearest" });
  }, [messages]);
  useEffect(() => () => abort.current?.abort(), []);
  useDrawerFocus(!!source, ".source-inspector", () => setSource(null), 1000);
  useEffect(() => {
    if (!source || source.removed) return;
    let live = true;
    api<{ content: string }>(
      `documents/${source.documentId}/source?chunk=${source.id}`,
    )
      .then((result) => {
        if (live)
          setSource((current) =>
            current ? { ...current, content: result.content } : null,
          );
      })
      .catch(() => {
        if (live)
          setSource((current) =>
            current
              ? { ...current, removed: true, content: "Source removed." }
              : null,
          );
      });
    return () => {
      live = false;
    };
  }, [source?.id, api]);
  const selectedProvider =
    connections.data?.find((c) => c.id === boot.workspace.provider_id) ||
    connections.data?.find((c) => c.kind === "local");
  async function send(text = input) {
    if (!text.trim() || busy) return;
    setError("");
    setBusy(true);
    const controller = new AbortController();
    abort.current = controller;
    setInput("");
    let cid = selected;
    const localId = crypto.randomUUID();
    try {
      if (!cid) {
        const c = await api<{ id: string }>("conversations", "POST", {
          project_id: project || null,
        });
        cid = c.id;
        setSelected(cid);
        updateAbbeyLocation({ conversation: cid, run: null });
      }
      const user: Message = {
          id: crypto.randomUUID(),
          role: "user",
          content: text,
          status: "complete",
          citations: [],
          created_at: Date.now(),
        },
        assistant: Message = {
          id: localId,
          role: "assistant",
          content: "",
          status: "streaming",
          citations: [],
          created_at: Date.now(),
        };
      setMessages((current) => [...current, user, assistant]);

      const docId = new URLSearchParams(window.location.search).get("document");
      const response = await fetch(url(`chat/${cid}`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          ...(docId ? { document_ids: [docId] } : {}),
        }),
        signal: controller.signal,
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error?.message || "Unable to start generation.");
      }
      const reader = response.body!.getReader(),
        decoder = new TextDecoder();
      let buffer = "",
        full = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";
        for (const event of events) {
          const kind = event.match(/^event: (.+)$/m)?.[1],
            raw = event.match(/^data: (.+)$/m)?.[1];
          if (!raw) continue;
          const value = JSON.parse(raw);
          if (kind === "delta") {
            full += value.text;
            setMessages((current) =>
              current.map((m) =>
                m.id === localId ? { ...m, content: full } : m,
              ),
            );
          }
          if (kind === "provider") setProvider(value.provider);
          if (kind === "done")
            setMessages((current) =>
              current.map((m) =>
                m.id === localId
                  ? {
                      ...m,
                      content: value.content,
                      citations: value.citations,
                      status: "complete",
                    }
                  : m,
              ),
            );
          if (kind === "error") {
            setError(value.message);
            setMessages((current) =>
              current.map((m) =>
                m.id === localId
                  ? {
                      ...m,
                      status:
                        value.code === "cancelled" ? "cancelled" : "failed",
                    }
                  : m,
              ),
            );
          }
        }
      }
      await list.reload();
    } catch (e) {
      const cancelled = (e as Error).name === "AbortError";
      setError(cancelled ? "Generation stopped." : (e as Error).message);
      setMessages((current) =>
        current.map((m) =>
          m.id === localId
            ? { ...m, status: cancelled ? "cancelled" : "failed" }
            : m,
        ),
      );
    } finally {
      setBusy(false);
      abort.current = null;
      void list.reload();
    }
  }
  return (
    <div className="chat-layout">
      <aside className="conversation-rail">
        <button
          className="button secondary full"
          disabled={busy}
          onClick={() => {
            setSelected(null);
            updateAbbeyLocation({ conversation: null, run: null });
            setSource(null);
            setMessages([]);
            setError("");
          }}
        >
          <Plus size={17} />
          New conversation
        </button>
        <span className="small muted">Conversations</span>
        {list.data
          ?.filter((c) => !project || c.project_id === project)
          .map((c) => (
            <button
              key={c.id}
              className={`conversation-item ${selected === c.id ? "active" : ""}`}
              disabled={busy}
              title={c.title}
              onClick={() => {
                setSelected(c.id);
                setSource(null);
                updateAbbeyLocation({ conversation: c.id, run: null });
              }}
            >
              {c.title}
            </button>
          ))}
        {!list.data?.length && (
          <p className="small muted">Your conversations will appear here.</p>
        )}
        <ErrorMessage message={list.error} />
      </aside>
      <div className="chat-center">
        <div className="chat-toolbar">
          <Link href="/app/settings" className="provider-button">
            <i
              className={
                selectedProvider?.kind === "hosted" ? "dot hosted" : "dot"
              }
            />
            {selectedProvider
              ? `${selectedProvider.kind === "hosted" ? "Hosted" : "Local"} · ${selectedProvider.name}${selectedProvider.model ? ` / ${selectedProvider.model}` : " / auto-discover"}`
              : "Choose a model"}
          </Link>
          {selected && (
            <div className="button-row">
              <button
                className="icon-button"
                aria-label="Rename conversation"
                onClick={async () => {
                  const title = prompt(
                    "Conversation title",
                    list.data?.find((c) => c.id === selected)?.title,
                  );
                  if (title) {
                    await api(`conversations/${selected}`, "PATCH", {
                      title,
                      project_id: project || null,
                    });
                    await list.reload();
                  }
                }}
              >
                <Pencil size={16} />
              </button>
              <a
                className="icon-button"
                aria-label="Export conversation"
                href={url(`conversations/${selected}/export`)}
              >
                <Download size={16} />
              </a>
              <button
                className="icon-button"
                aria-label="Delete conversation"
                disabled={busy}
                onClick={async () => {
                  if (confirm("Delete this conversation and its messages?")) {
                    await api(`conversations/${selected}`, "DELETE");
                    setSelected(null);
                    updateAbbeyLocation({ conversation: null, run: null });
                    await list.reload();
                  }
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
        <div className="chat-messages">
          {!messages.length && (
            <div className="chat-welcome">
              <div className="abbey-symbol">✦</div>
              <h2>
                Understand your documents.
                <br />
                Build with context.
              </h2>
              <p>
                Ask a question, explore an idea, or work through a source with
                Abbey.
              </p>
              <div className="suggestions">
                {[
                  "Help me plan this project",
                  "What should I look for in my sources?",
                  "Summarize the uploaded architecture notes",
                ].map((text) => (
                  <button key={text} onClick={() => setInput(text)}>
                    {text}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m) => (
            <article className={`chat-message ${m.role}`} key={m.id}>
              <div className="message-label">
                <span
                  className={`avatar ${m.role === "assistant" ? "assistant-avatar" : ""}`}
                >
                  {m.role === "assistant" ? "✦" : boot.user.name.slice(0, 1)}
                </span>
                <strong>{m.role === "assistant" ? "Abbey" : "You"}</strong>
                {m.status !== "complete" && (
                  <span className="small muted">{m.status}</span>
                )}
              </div>
              <div className="message-body">
                {m.content || (
                  <span className="muted">
                    {m.status === "streaming"
                      ? "Thinking…"
                      : "No answer was generated."}
                  </span>
                )}
              </div>
              {m.citations?.length > 0 && (
                <div className="citations">
                  {m.citations.map((c) => (
                    <button
                      key={c.id}
                      className="citation"
                      disabled={c.removed}
                      onClick={() => setSource(c)}
                    >
                      <FileText size={15} />[{c.number}] {c.name} ·{" "}
                      {c.removed ? "Source removed" : locationLabel(c.location)}
                      <ExternalLink size={13} />
                    </button>
                  ))}
                </div>
              )}
              {m.role === "assistant" && m.content && (
                <div className="message-actions">
                  <button
                    className="text-button"
                    onClick={() => navigator.clipboard.writeText(m.content)}
                  >
                    <Copy size={14} />
                    Copy
                  </button>
                  {m.citations?.length > 0 && (
                    <button
                      className="text-button"
                      onClick={() => setSource(m.citations[0])}
                    >
                      View sources
                    </button>
                  )}
                  {["failed", "cancelled", "interrupted"].includes(
                    m.status,
                  ) && (
                    <button
                      className="text-button"
                      disabled={busy}
                      onClick={() => {
                        const i = messages.findIndex((x) => x.id === m.id);
                        void send(messages[i - 1]?.content || "");
                      }}
                    >
                      Retry
                    </button>
                  )}
                </div>
              )}
            </article>
          ))}
          <div ref={bottom} />
        </div>
        <div className="composer-wrap">
          <ErrorMessage message={error} />
          <form
            className="composer"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <textarea
              aria-label="Message Abbey"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Abbey about this project…"
              disabled={boot.role === "viewer"}
              rows={2}
              maxLength={16000}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
            />
            <div className="composer-bottom">
              <Link
                className="icon-button"
                href="/app/documents"
                title="Upload documents"
              >
                <Paperclip size={20} />
              </Link>
              <label className="project-select">
                <Folder size={16} />
                <select
                  aria-label="Conversation project"
                  value={project}
                  disabled={busy || boot.role === "viewer"}
                  onChange={async (e) => {
                    const next = e.target.value;
                    try {
                      if (selected)
                        await api(`conversations/${selected}`, "PATCH", {
                          project_id: next || null,
                        });
                      setProject(next);
                      await list.reload();
                    } catch (e) {
                      setError((e as Error).message);
                    }
                  }}
                >
                  <option value="">All workspace sources</option>
                  {boot.projects
                    .filter((p) => !p.archived)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </label>
              {busy ? (
                <button
                  type="button"
                  className="send-button"
                  aria-label="Stop generation"
                  onClick={() => abort.current?.abort()}
                >
                  <Square size={18} />
                </button>
              ) : (
                <button
                  className="send-button"
                  aria-label="Send message"
                  disabled={!input.trim() || boot.role === "viewer"}
                >
                  <Send size={20} />
                </button>
              )}
            </div>
          </form>
          <p className="processing-note">
            <i
              className={
                selectedProvider?.kind === "hosted" ? "dot hosted" : "dot"
              }
            />
            {provider ||
              `${selectedProvider?.kind === "hosted" ? "Hosted" : "Local"} processing selected`}
          </p>
        </div>
      </div>
      {source && (
        <aside className="source-inspector" aria-label="Source inspector">
          <header>
            <h3>Sources</h3>
            <button
              className="icon-button"
              aria-label="Close source inspector"
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
          {source.content && <blockquote>{source.content}</blockquote>}
          <Link
            className="button secondary"
            href={`/app/documents?document=${source.documentId}&chunk=${source.id}`}
          >
            Open document <ExternalLink size={16} />
          </Link>
        </aside>
      )}
    </div>
  );
}
