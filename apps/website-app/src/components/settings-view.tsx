"use client";
import { useState } from "react";
import { useApp, useData, ErrorMessage } from "./app-context";
import type { Connection } from "@/lib/types";
export function SettingsView() {
  const { api, data: boot, refresh, switchWorkspace } = useApp(),
    connections = useData<Connection[]>("connections"),
    members =
      useData<{ id: string; name: string; email: string; role: string }[]>(
        "workspaces/members",
      );
  const [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [testing, setTesting] = useState(false),
    [lastTest, setLastTest] = useState<{
      id: string;
      message: string;
      time: string;
    } | null>(null);
  const selectedProvider =
    connections.data?.find(
      (connection) => connection.id === boot.workspace.provider_id,
    ) || connections.data?.find((connection) => connection.kind === "local");
  async function save(fn: () => Promise<unknown>) {
    setError("");
    setNotice("");
    try {
      await fn();
      await refresh();
      setNotice("Changes saved.");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <div className="page-padding settings-page">
      <header className="view-intro">
        <h2>Your workspace, explicitly configured.</h2>
        <p>
          Manage account details, model selection, and the people who can access
          your work.
        </p>
      </header>
      <ErrorMessage message={error} />
      {notice && (
        <p className="success" role="status">
          {notice}
        </p>
      )}
      <section className="settings-section">
        <div>
          <h3>Profile</h3>
          <p>Your local account name.</p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const name = new FormData(e.currentTarget).get("name");
            void save(async () => {
              const r = await fetch("/api/auth/update-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
              });
              if (!r.ok) throw new Error("Profile update failed.");
            });
          }}
        >
          <label>
            Name
            <input
              name="name"
              defaultValue={boot.user.name}
              required
              maxLength={100}
            />
          </label>
          <button className="button secondary small">Save profile</button>
        </form>
      </section>
      <section className="settings-section">
        <div>
          <h3>Password</h3>
          <p>Changing it revokes your other sessions.</p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = Object.fromEntries(new FormData(e.currentTarget));
            void save(async () => {
              const r = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...f, revokeOtherSessions: true }),
              });
              const value = await r.json();
              if (!r.ok)
                throw new Error(value.message || "Password change failed.");
            });
          }}
        >
          <label>
            Current password
            <input
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          <label>
            New password
            <input
              name="newPassword"
              type="password"
              minLength={12}
              maxLength={128}
              autoComplete="new-password"
              required
            />
          </label>
          <button className="button secondary small">Change password</button>
        </form>
      </section>
      <section className="settings-section">
        <div>
          <h3>Active sessions</h3>
          <p>Review and revoke signed-in devices.</p>
        </div>
        <Sessions />
      </section>
      {boot.role === "owner" && (
        <>
          <section className="settings-section">
            <div>
              <h3>Workspace & models</h3>
              <p>
                Local processing is the default. Hosted processing sends prompts
                and selected excerpts to the provider you choose.
              </p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                void save(() =>
                  api("workspaces/settings", "PATCH", {
                    name: f.get("name"),
                    provider_id: f.get("provider") || undefined,
                    hosted_consent: f.get("consent") === "on",
                  }),
                );
              }}
            >
              <label>
                Workspace name
                <input
                  name="name"
                  required
                  maxLength={120}
                  defaultValue={boot.workspace.name}
                />
              </label>
              <label>
                Model provider
                <select
                  name="provider"
                  defaultValue={
                    boot.workspace.provider_id ||
                    connections.data?.find((c) => c.kind === "local")?.id ||
                    ""
                  }
                >
                  <option value="">Default local connection</option>
                  {connections.data
                    ?.filter((c) => ["local", "hosted"].includes(c.kind))
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.kind === "hosted" ? "Hosted" : "Local"} · {c.name}
                      </option>
                    ))}
                </select>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="consent"
                  defaultChecked={!!boot.workspace.hosted_consent}
                />
                <span>
                  Allow this workspace to use an explicitly selected hosted
                  provider.
                </span>
              </label>
              <button className="button primary small">
                Save workspace settings
              </button>
            </form>
          </section>
          <section className="settings-section">
            <div>
              <h3>Provider connectivity</h3>
              <p>
                A saved selection does not establish reachability. Tests run
                only when you request them; a result is a point-in-time
                connection check, not a successful generation.
              </p>
            </div>
            <div>
              <p>
                {selectedProvider
                  ? `${boot.workspace.provider_id ? "Selected" : "Default local"}: ${selectedProvider.name}`
                  : "No model connection configured."}
              </p>
              <p className="small muted">
                Projects, uploads, extracted text, and keyword search remain
                usable without a model.
              </p>
              <button
                className="button secondary small"
                disabled={testing || !selectedProvider}
                onClick={async () => {
                  if (!selectedProvider || testing) return;
                  const id = selectedProvider.id;
                  setTesting(true);
                  try {
                    const result = await api<{
                      connected: boolean;
                      reason?: string;
                    }>(`connections/${id}/probe`, "POST", {});
                    setLastTest({
                      id,
                      message: result.connected
                        ? "Connection reachable"
                        : `Connection unavailable: ${result.reason || "Provider did not respond"}`,
                      time: new Date().toLocaleTimeString(),
                    });
                  } catch (error) {
                    setLastTest({
                      id,
                      message: `Connection test failed: ${(error as Error).message}`,
                      time: new Date().toLocaleTimeString(),
                    });
                  } finally {
                    setTesting(false);
                  }
                }}
              >
                {testing ? "Testing connection…" : "Test selected provider"}
              </button>
              <p role="status">
                {lastTest && lastTest.id === selectedProvider?.id
                  ? `Last test at ${lastTest.time}: ${lastTest.message}`
                  : "Not tested in this visit."}
              </p>
            </div>
          </section>
          <section className="settings-section">
            <div>
              <h3>Members</h3>
              <p>
                Add people who already have a local account. Owners manage
                settings; members can edit; viewers can read.
              </p>
            </div>
            <div>
              <form
                className="member-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const f = Object.fromEntries(new FormData(e.currentTarget));
                  await save(() => api("workspaces/members", "POST", f));
                  await members.reload();
                }}
              >
                <label>
                  Account email
                  <input name="email" type="email" required />
                </label>
                <label>
                  Role
                  <select name="role">
                    <option>member</option>
                    <option>viewer</option>
                    <option>owner</option>
                  </select>
                </label>
                <button className="button secondary small">
                  Add or update member
                </button>
              </form>
              {members.data?.map((m) => (
                <div className="member-row" key={m.id}>
                  <div>
                    <strong>{m.name}</strong>
                    <span className="small muted">{m.email}</span>
                  </div>
                  <span>{m.role}</span>
                  {m.id !== boot.user.id && (
                    <button
                      className="text-button danger"
                      onClick={async () => {
                        await save(() =>
                          api(`workspaces/members/${m.id}`, "DELETE"),
                        );
                        await members.reload();
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        </>
      )}
      <section className="settings-section">
        <div>
          <h3>New workspace</h3>
          <p>Create a separate place for another team or project.</p>
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const name = new FormData(e.currentTarget).get("name");
            try {
              const r = await api<{ id: string }>("workspaces", "POST", {
                name,
              });
              switchWorkspace(r.id);
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        >
          <label>
            Workspace name
            <input name="name" required maxLength={120} />
          </label>
          <button className="button secondary small">Create workspace</button>
        </form>
      </section>
      <section className="settings-section">
        <div>
          <h3>Notifications</h3>
          <p>
            In-app updates are currently{" "}
            {boot.notificationsEnabled ? "enabled" : "muted"} for this
            workspace.
          </p>
        </div>
        <div className="button-row">
          <button
            className="button secondary small"
            onClick={() =>
              void save(() =>
                api("notifications/preferences", "PATCH", { enabled: true }),
              )
            }
          >
            Enable updates
          </button>
          <button
            className="button secondary small"
            onClick={() =>
              void save(() =>
                api("notifications/preferences", "PATCH", { enabled: false }),
              )
            }
          >
            Mute updates
          </button>
        </div>
      </section>
    </div>
  );
}
function Sessions() {
  const [items, setItems] = useState<
      { token: string; userAgent: string; createdAt: string }[]
    >([]),
    [error, setError] = useState("");
  async function load() {
    const r = await fetch("/api/auth/list-sessions");
    const data = await r.json();
    if (r.ok) setItems(data);
    else setError(data.message || "Unable to list sessions.");
  }
  return (
    <div>
      <button className="button secondary small" onClick={() => void load()}>
        Show sessions
      </button>
      <ErrorMessage message={error} />
      {items.map((s) => (
        <div className="member-row" key={s.token}>
          <p className="small">{s.userAgent || "Local browser"}</p>
          <button
            className="text-button danger"
            onClick={async () => {
              await fetch("/api/auth/revoke-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: s.token }),
              });
              await load();
            }}
          >
            Revoke
          </button>
        </div>
      ))}
    </div>
  );
}
