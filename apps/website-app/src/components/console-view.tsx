"use client";
import { useState } from "react";
import { Play, Plus, Copy, Plug, RefreshCw } from "lucide-react";
import { useApp, useData, ErrorMessage, Status, date } from "./app-context";
import type { Connection, Trace } from "@/lib/types";
import { WdbxStudioLink } from "./wdbx-studio-link";
interface KeyRecord {
  id: string;
  name: string;
  prefix: string;
  scopes: string;
  created_at: number;
  revoked_at: number | null;
  last_used_at: number | null;
}
export function ConsoleView() {
  const { api, data: boot, url } = useApp(),
    connections = useData<Connection[]>("connections"),
    traces = useData<Trace[]>("traces"),
    capabilities = useData<{ semantic: boolean }>("documents/capabilities");
  const [tab, setTab] = useState("connections"),
    [error, setError] = useState(""),
    [connection, setConnection] = useState(""),
    [operation, setOperation] = useState("Stats"),
    [input, setInput] = useState("{}"),
    [output, setOutput] = useState<unknown>(null),
    [busy, setBusy] = useState(false),
    [probeResult, setProbeResult] = useState<Record<string, string>>({}),
    [events, setEvents] = useState<string[]>([]);
  const service = connections.data?.find((c) => c.id === connection);
  return (
    <>
      <div className="tabs page-tabs" role="tablist">
        {["connections", "api keys", "playground", "usage", "traces"].map(
          (t) => (
            <button
              role="tab"
              aria-selected={tab === t}
              key={t}
              className={tab === t ? "active" : ""}
              onClick={() => setTab(t)}
            >
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ),
        )}
      </div>
      <div className="page-padding">
        <ErrorMessage message={error || connections.error} />
        {(tab === "connections" || tab === "playground") && <WdbxStudioLink />}
        {tab === "connections" && (
          <>
            <header className="view-intro">
              <h2>Real services. Explicit connections.</h2>
              <p>
                Destinations are configured by the installation operator.
                Workspace owners bind WDBX gateways to one workspace.
              </p>
            </header>
            <div className="connection-list">
              {connections.data?.map((c) => (
                <section key={c.id}>
                  <Plug size={24} />
                  <div>
                    <h3>{c.name}</h3>
                    <p>
                      {c.kind === "local"
                        ? "Local model endpoint"
                        : c.kind === "hosted"
                          ? "Hosted model provider"
                          : c.kind === "abi"
                            ? "Allowlisted runtime diagnostics"
                            : "Authenticated gRPC gateway"}
                    </p>
                    <span className="small muted">
                      {probeResult[c.id] ||
                        (c.kind === "wdbx"
                          ? c.bound
                            ? "Bound to this workspace"
                            : "Workspace binding required"
                          : "Not checked in this session")}
                    </span>
                  </div>
                  <div className="button-row">
                    {["local", "hosted"].includes(c.kind) && (
                      <button
                        className="button secondary small"
                        onClick={async () => {
                          try {
                            const r = await api<{
                              connected: boolean;
                              reason?: string;
                              models?: string[];
                            }>(`connections/${c.id}/probe`, "POST", {});
                            setProbeResult((p) => ({
                              ...p,
                              [c.id]: r.connected
                                ? `Available models: ${r.models?.join(", ")}`
                                : r.reason || "Not connected",
                            }));
                          } catch (e) {
                            setError((e as Error).message);
                          }
                        }}
                      >
                        <RefreshCw size={15} />
                        Check connection
                      </button>
                    )}
                    {c.kind === "wdbx" && !c.bound && boot.role === "owner" && (
                      <button
                        className="button secondary small"
                        onClick={async () => {
                          try {
                            await api(`connections/${c.id}/bind`, "POST", {});
                            await connections.reload();
                          } catch (e) {
                            setError((e as Error).message);
                          }
                        }}
                      >
                        Bind workspace
                      </button>
                    )}
                    {["wdbx", "abi"].includes(c.kind) && (
                      <button
                        className="button secondary small"
                        onClick={() => {
                          setConnection(c.id);
                          setOperation(c.kind === "abi" ? "snapshot" : "Stats");
                          setInput("{}");
                          setTab("playground");
                        }}
                      >
                        Open playground
                      </button>
                    )}
                  </div>
                </section>
              ))}
            </div>
          </>
        )}
        {tab === "api keys" &&
          (boot.role === "owner" ? (
            <KeysView />
          ) : (
            <p className="empty">API keys are managed by workspace owners.</p>
          ))}
        {tab === "playground" && (
          <>
            <div className="playground">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setBusy(true);
                  setError("");
                  setOutput(null);
                  try {
                    const parsed = JSON.parse(input);
                    const r = await api("playground", "POST", {
                      connection_id: connection,
                      operation,
                      input: parsed,
                    });
                    setOutput(r);
                    await traces.reload();
                  } catch (e) {
                    setError((e as Error).message);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <div className="two-columns">
                  <label>
                    Service
                    <select
                      value={connection}
                      onChange={(e) => {
                        setConnection(e.target.value);
                        const c = connections.data?.find(
                          (c) => c.id === e.target.value,
                        );
                        setOperation(c?.kind === "abi" ? "snapshot" : "Stats");
                        setInput("{}");
                      }}
                    >
                      <option value="">Choose a service</option>
                      {connections.data
                        ?.filter((c) => ["abi", "wdbx"].includes(c.kind))
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                  </label>
                  <label>
                    Operation
                    <select
                      value={operation}
                      onChange={(e) => {
                        setOperation(e.target.value);
                        setInput(
                          (
                            {
                              TextSearch:
                                '{ "text": "source review", "limit": 5 }',
                              Search:
                                '{\n  "query": [0.1, 0.2, 0.3],\n  "limit": 5\n}',
                              PutVector:
                                '{\n  "vectors": [{ "values": [0.1, 0.2, 0.3] }]\n}',
                              PutKv:
                                '{\n  "entries": [{ "key": "example", "value": "hello" }]\n}',
                              GetKv: '{\n  "key": "example"\n}',
                            } as Record<string, string>
                          )[e.target.value] || "{}",
                        );
                      }}
                    >
                      {(service?.kind === "abi"
                        ? ["snapshot", "backends"]
                        : [
                            "Stats",
                            "Search",
                            "TextSearch",
                            "PutVector",
                            "PutKv",
                            "GetKv",
                          ]
                      ).map((o) => (
                        <option
                          key={o}
                          disabled={
                            o === "TextSearch" && !capabilities.data?.semantic
                          }
                        >
                          {o}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                {service?.kind === "wdbx" && !capabilities.data?.semantic && (
                  <p className="small muted">
                    Text search requires the installed, verified local embedding
                    model. Native Search accepts vector JSON.
                  </p>
                )}
                <label>
                  Request JSON
                  <textarea
                    className="code-input"
                    rows={12}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    spellCheck={false}
                  />
                </label>
                <button
                  className="button primary full"
                  disabled={
                    busy ||
                    (operation === "TextSearch" &&
                      !capabilities.data?.semantic) ||
                    !service ||
                    boot.role === "viewer" ||
                    (service.kind === "wdbx" && !service.bound)
                  }
                >
                  <Play size={17} />
                  {busy ? "Running…" : "Run request"}
                </button>
                {service?.kind === "wdbx" && !service.bound && (
                  <p className="small muted">
                    Bind this gateway in Connections before running requests.
                  </p>
                )}
              </form>
              <div className="playground-output">
                {output ? (
                  <pre>{JSON.stringify(output, null, 2)}</pre>
                ) : (
                  <div className="empty">
                    <Plug size={38} />
                    <h3>
                      {service
                        ? "Ready for a real request"
                        : "Connect a service to begin"}
                    </h3>
                    <p>
                      Choose an operator-configured ABI or WDBX connection.
                      Responses appear here after execution.
                    </p>
                  </div>
                )}
              </div>
            </div>
            {service?.kind === "wdbx" && service.bound && (
              <section className="events-panel">
                <button
                  className="button secondary small"
                  onClick={() => {
                    setEvents([]);
                    const stream = new EventSource(
                      url(`connections/${service.id}/events`),
                    );
                    stream.addEventListener("mutation", (e) =>
                      setEvents((old) => [e.data, ...old].slice(0, 30)),
                    );
                    stream.addEventListener("error", () => stream.close());
                    setTimeout(() => stream.close(), 60000);
                  }}
                >
                  Watch mutations for 60 seconds
                </button>
                <pre>
                  {events.join("\n") ||
                    "No mutation events received in this view."}
                </pre>
              </section>
            )}
            <h3 className="space-top">Recent requests</h3>
            <TraceTable rows={traces.data || []} />
          </>
        )}
        {tab === "traces" && (
          <>
            <div className="section-heading">
              <h2>Execution traces</h2>
              <button
                className="button secondary small"
                onClick={() => void traces.reload()}
              >
                Refresh
              </button>
            </div>
            <p className="muted">
              Operation metadata only. Prompts, document bodies, and credentials
              are not included.
            </p>
            <TraceTable rows={traces.data || []} />
          </>
        )}
        {tab === "usage" && <UsageView />}
      </div>
    </>
  );
}
function KeysView() {
  const { api } = useApp(),
    keys = useData<KeyRecord[]>("api-keys");
  const [secret, setSecret] = useState(""),
    [error, setError] = useState("");
  return (
    <>
      <h2>Workspace API keys</h2>
      <p className="muted">
        Choose only the scopes the client needs. A new secret is shown once.
      </p>
      <form
        className="key-form"
        onSubmit={async (e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          try {
            const result = await api<{ secret: string }>("api-keys", "POST", {
              name: data.get("name"),
              scopes: data.getAll("scope"),
            });
            setSecret(result.secret);
            await keys.reload();
            setError("");
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      >
        <label>
          Key name
          <input
            name="name"
            required
            maxLength={100}
            placeholder="Local development"
          />
        </label>
        <fieldset>
          <legend>Scopes</legend>
          {["read", "write", "chat", "documents", "console"].map((scope) => (
            <label className="checkbox-label" key={scope}>
              <input
                type="checkbox"
                name="scope"
                value={scope}
                defaultChecked={scope === "read"}
              />
              {scope}
            </label>
          ))}
        </fieldset>
        <button className="button primary">
          <Plus size={16} />
          Create key
        </button>
      </form>
      <ErrorMessage message={error || keys.error} />
      {secret && (
        <div className="secret-panel">
          <strong>Copy this key now. It will not be shown again.</strong>
          <code>{secret}</code>
          <div className="button-row">
            <button
              className="button secondary small"
              onClick={() => navigator.clipboard.writeText(secret)}
            >
              <Copy size={15} />
              Copy key
            </button>
            <button className="text-button" onClick={() => setSecret("")}>
              I’ve saved it
            </button>
          </div>
        </div>
      )}
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Prefix</th>
              <th>Scopes</th>
              <th>Created</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {keys.data?.map((k) => (
              <tr key={k.id}>
                <td>{k.name}</td>
                <td>
                  <code>{k.prefix}…</code>
                </td>
                <td>{JSON.parse(k.scopes).join(", ")}</td>
                <td>{date(k.created_at)}</td>
                <td>{k.revoked_at ? "Revoked" : "Active"}</td>
                <td>
                  {!k.revoked_at && (
                    <button
                      className="text-button danger"
                      onClick={async () => {
                        await api(`api-keys/${k.id}`, "DELETE");
                        await keys.reload();
                      }}
                    >
                      Revoke
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
function TraceTable({ rows }: { rows: Trace[] }) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Operation</th>
            <th>Provider</th>
            <th>Status</th>
            <th>Duration</th>
            <th>Request ID</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{date(r.created_at)}</td>
              <td>{r.operation}</td>
              <td>{r.provider || "Unavailable"}</td>
              <td>
                <Status value={r.status} />
              </td>
              <td>{r.duration_ms} ms</td>
              <td>
                <code title={r.id}>{r.id.slice(0, 8)}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && <div className="empty">No requests yet.</div>}
    </div>
  );
}
function UsageView() {
  const { data, error } = useData<
    {
      provider: string | null;
      requests: number;
      input_tokens: number | null;
      output_tokens: number | null;
      avg_duration_ms: number;
    }[]
  >("usage");
  return (
    <>
      <h2>Measured application usage</h2>
      <p className="muted">
        Token counts appear only when the selected provider reports them. These
        are local application records, not billing totals.
      </p>
      <ErrorMessage message={error} />
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Provider</th>
              <th>Requests</th>
              <th>Input tokens</th>
              <th>Output tokens</th>
              <th>Average duration</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((r, i) => (
              <tr key={i}>
                <td>{r.provider || "Unavailable"}</td>
                <td>{r.requests}</td>
                <td>{r.input_tokens ?? "Unavailable"}</td>
                <td>{r.output_tokens ?? "Unavailable"}</td>
                <td>{Math.round(r.avg_duration_ms)} ms</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!data?.length && (
          <p className="empty">Usage will appear after real requests.</p>
        )}
      </div>
    </>
  );
}
