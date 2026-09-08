"use client";
import { useDrawerFocus } from "./use-drawer-focus";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  MessageCircle,
  Folder,
  FileText,
  Search,
  Terminal,
  Users,
  Settings,
  Bell,
  Menu,
  X,
  ArrowRight,
  Plus,
  LogOut,
  Check,
  Shield,
} from "lucide-react";
import { Brand } from "./brand";
import { AppContext, ErrorMessage, useApp, useData, date } from "./app-context";
import type { Bootstrap, Project, Notification, Citation } from "@/lib/types";
import { ChatView } from "./chat-view";
import { DocumentsView } from "./documents-view";
import { ConsoleView } from "./console-view";
import { PortalView } from "./portal-view";
import { SettingsView } from "./settings-view";
const navigation = [
  { key: "", label: "Overview", icon: Home },
  { key: "abbey", label: "Abbey", icon: MessageCircle },
  { key: "projects", label: "Projects", icon: Folder },
  { key: "documents", label: "Documents", icon: FileText },
  { key: "search", label: "Search", icon: Search },
  { key: "console", label: "Developer console", icon: Terminal },
  { key: "portal", label: "Customer portal", icon: Users },
];
export function WorkspaceApp({ view }: { view: string }) {
  const [data, setData] = useState<Bootstrap | null>(null),
    [error, setError] = useState(""),
    [workspace, setWorkspace] = useState(""),
    [open, setOpen] = useState(false);
  const router = useRouter(),
    pathname = usePathname();
  useEffect(() => {
    setWorkspace(localStorage.getItem("mlai-workspace") || "");
  }, []);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);
  useDrawerFocus(open, ".app-sidebar", () => setOpen(false));
  const url = useCallback(
    (path: string) =>
      `/api/v1/${path}${path.includes("?") ? "&" : "?"}workspace=${encodeURIComponent(workspace)}`,
    [workspace],
  );
  const api = useCallback(
    async <T,>(path: string, method = "GET", payload?: unknown): Promise<T> => {
      const response = await fetch(url(path), {
        method,
        headers: payload ? { "Content-Type": "application/json" } : undefined,
        body: payload ? JSON.stringify(payload) : undefined,
      });
      const result = await response.json();
      if (!response.ok) {
        if (response.status === 401) router.push("/sign-in");
        throw new Error(result.error?.message || "The request failed.");
      }
      return result as T;
    },
    [url, router],
  );
  const upload = useCallback(
    async <T,>(path: string, file: File): Promise<T> => {
      const response = await fetch(url(path), {
        method: "POST",
        headers: {
          "X-File-Name": encodeURIComponent(file.name),
          "Content-Type": "application/octet-stream",
        },
        body: file,
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error?.message || "Upload failed.");
      return result as T;
    },
    [url],
  );
  const refresh = useCallback(async () => {
    try {
      const result = await api<Bootstrap>("bootstrap");
      setData(result);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }, [api]);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  const switchWorkspace = (id: string) => {
    localStorage.setItem("mlai-workspace", id);
    setData(null);
    setWorkspace(id);
  };
  if (!data)
    return (
      <main id="main" className="loading-screen">
        <Brand />
        <p>{error || "Opening your workspace…"}</p>
        {error && (
          <button
            className="button secondary"
            onClick={() => {
              localStorage.removeItem("mlai-workspace");
              setWorkspace("");
              void refresh();
            }}
          >
            Retry
          </button>
        )}
      </main>
    );
  const title =
    navigation.find((n) => n.key === view)?.label ||
    (
      {
        settings: "Settings",
        notifications: "Notifications",
        staff: "MLAI staff",
      } as Record<string, string>
    )[view] ||
    "Overview";
  return (
    <AppContext.Provider
      value={{ data, refresh, url, api, upload, switchWorkspace }}
    >
      <div className="app-shell">
        {open && (
          <button
            className="drawer-backdrop"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
          />
        )}
        <aside
          className={`app-sidebar ${open ? "open" : ""}`}
          aria-label="Workspace navigation"
        >
          <Brand />
          <label className="workspace-selector">
            <span className="sr-only">Current workspace</span>
            <select
              value={data.workspace.id}
              onChange={(e) => switchWorkspace(e.target.value)}
            >
              {data.workspaces.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </label>
          <nav aria-label="Application navigation">
            {navigation.map((n, i) => (
              <Link
                href={`/app${n.key ? `/${n.key}` : ""}`}
                key={n.key}
                className={`${view === n.key ? "active" : ""} ${i === 5 ? "nav-divider" : ""}`}
                aria-current={view === n.key ? "page" : undefined}
              >
                <n.icon size={21} />
                {n.label}
              </Link>
            ))}
            {data.staff && (
              <Link
                href="/app/staff"
                className={view === "staff" ? "active" : ""}
              >
                <Shield size={21} />
                MLAI staff
              </Link>
            )}
          </nav>
          <div className="sidebar-bottom">
            <Link
              href="/app/notifications"
              className={view === "notifications" ? "active" : ""}
            >
              <Bell size={20} />
              Notifications
              {data.unread > 0 && <span className="count">{data.unread}</span>}
            </Link>
            <Link
              href="/app/settings"
              className={view === "settings" ? "active" : ""}
            >
              <Settings size={20} />
              Settings
            </Link>
            <div className="user-row">
              <span className="avatar">{data.user.name.slice(0, 1)}</span>
              <span>{data.user.name}</span>
              <button
                className="icon-button"
                title="Sign out"
                aria-label="Sign out"
                onClick={async () => {
                  await fetch("/api/auth/sign-out", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: "{}",
                  });
                  router.push("/");
                  router.refresh();
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </aside>
        <div className="app-main">
          <header className="app-topbar">
            <div>
              <button
                className="icon-button mobile-only"
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                aria-label="Open navigation"
              >
                <Menu />
              </button>
              <h1>{title}</h1>
            </div>
            <span className="workspace-role">
              {data.role} <span>·</span> {data.workspace.name}
            </span>
          </header>
          <main
            id="main"
            className={`workspace-content ${view === "abbey" ? "chat-content" : ""}`}
            key={`${data.workspace.id}:${view}`}
          >
            <ErrorMessage message={error} />
            {view === "abbey" ? (
              <ChatView />
            ) : view === "projects" ? (
              <ProjectsView />
            ) : view === "documents" ? (
              <DocumentsView />
            ) : view === "search" ? (
              <SearchView />
            ) : view === "console" ? (
              <ConsoleView />
            ) : view === "portal" || view === "staff" ? (
              <PortalView staffMode={view === "staff"} />
            ) : view === "settings" ? (
              <SettingsView />
            ) : view === "notifications" ? (
              <NotificationsView />
            ) : (
              <Overview />
            )}
          </main>
        </div>
      </div>
    </AppContext.Provider>
  );
}
function Overview() {
  const { data, api, refresh } = useApp();
  return (
    <div className="page-padding">
      <header className="view-intro">
        <h2>A clear place to begin.</h2>
        <p>Bring your projects, sources, and next questions together.</p>
      </header>
      {!data.workspace.onboarded && (
        <section className="onboarding">
          <div>
            <h3>Make this workspace yours.</h3>
            <p>Start with a project, connect a model, and add a source.</p>
          </div>
          <ol>
            {[
              ["Create a project", "/app/projects"],
              ["Choose a model", "/app/settings"],
              ["Upload a document", "/app/documents"],
            ].map(([label, href], i) => (
              <li key={href}>
                <span>{i + 1}</span>
                <Link href={href}>
                  {label}
                  <ArrowRight size={16} />
                </Link>
              </li>
            ))}
          </ol>
          {data.role === "owner" && (
            <button
              className="text-button"
              onClick={async () => {
                await api("workspaces/settings", "PATCH", { onboarded: true });
                await refresh();
              }}
            >
              Dismiss onboarding
            </button>
          )}
        </section>
      )}
      <div className="section-heading">
        <h3>Your projects</h3>
        <Link className="text-link" href="/app/projects">
          Manage projects <ArrowRight size={16} />
        </Link>
      </div>
      {data.projects.length ? (
        <div className="project-grid">
          {data.projects
            .filter((p) => !p.archived)
            .map((p) => (
              <Link
                href={`/app/abbey?project=${p.id}`}
                className="project-card"
                key={p.id}
              >
                <Folder size={23} />
                <h3>{p.name}</h3>
                <p>
                  {p.description ||
                    "Open this project's conversations and sources."}
                </p>
                <span className="small muted">
                  Updated {date(p.updated_at)}
                </span>
              </Link>
            ))}
        </div>
      ) : (
        <div className="empty">
          <Folder />
          <h3>Your first project starts here.</h3>
          <p>Keep related documents and conversations together.</p>
          <Link className="button primary" href="/app/projects">
            Create a project
          </Link>
        </div>
      )}
      <div className="workspace-paths">
        {[
          [
            "Ask Abbey",
            "Work through a question with your selected model.",
            "/app/abbey",
          ],
          [
            "Inspect a service",
            "Connect ABI or WDBX and run a real request.",
            "/app/console",
          ],
          [
            "Start an engagement",
            "Discuss a project and review deliverables.",
            "/app/portal",
          ],
        ].map(([title, description, href]) => (
          <Link href={href} key={href}>
            <h3>
              {title}
              <ArrowRight size={18} />
            </h3>
            <p>{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
function ProjectsView() {
  const { api, refresh, data: boot } = useApp();
  const { data, reload, error } = useData<Project[]>("projects");
  const [editing, setEditing] = useState<Project | null>(null),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <div className="page-padding">
      <div className="view-intro">
        <h2>Give your work some context.</h2>
        <p>
          Projects connect documents and conversations around a shared purpose.
        </p>
      </div>
      <ErrorMessage message={message || error} />
      {boot.role !== "viewer" && (
        <form
          className="inline-project-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setMessage("");
            const fields = Object.fromEntries(new FormData(e.currentTarget));
            try {
              await api(
                editing ? `projects/${editing.id}` : "projects",
                editing ? "PATCH" : "POST",
                fields,
              );
              setEditing(null);
              e.currentTarget?.reset();
              await reload();
              await refresh();
            } catch (e) {
              setMessage((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
          key={editing?.id || "new"}
        >
          <label>
            Project name
            <input
              name="name"
              defaultValue={editing?.name || ""}
              required
              maxLength={120}
              placeholder="Website launch"
            />
          </label>
          <label>
            Description
            <input
              name="description"
              defaultValue={editing?.description || ""}
              maxLength={4000}
              placeholder="What are you working toward?"
            />
          </label>
          <button className="button primary" disabled={busy}>
            <Plus size={17} />
            {editing ? "Save changes" : "Create project"}
          </button>
          {editing && (
            <button
              type="button"
              className="button secondary"
              onClick={() => setEditing(null)}
            >
              Cancel
            </button>
          )}
        </form>
      )}
      <div className="project-list">
        {data?.map((p) => (
          <div className="project-list-row" key={p.id}>
            <Folder size={23} />
            <div>
              <Link href={`/app/abbey?project=${p.id}`}>
                <h3>{p.name}</h3>
              </Link>
              <p>{p.description || "No description"}</p>
              <span className="small muted">
                {p.archived ? "Archived · " : ""}
                {date(p.updated_at)}
              </span>
            </div>
            {boot.role !== "viewer" && (
              <div className="button-row">
                <button
                  className="button secondary small"
                  onClick={() => setEditing(p)}
                >
                  Edit
                </button>
                <button
                  className="button secondary small"
                  onClick={async () => {
                    try {
                      await api(`projects/${p.id}`, "PATCH", {
                        archived: !p.archived,
                      });
                      await reload();
                      await refresh();
                    } catch (e) {
                      setMessage((e as Error).message);
                    }
                  }}
                >
                  {p.archived ? "Unarchive" : "Archive"}
                </button>
                <button
                  className="text-button danger"
                  onClick={async () => {
                    if (
                      !confirm(
                        "Delete this project? Its documents and conversations will remain unassigned.",
                      )
                    )
                      return;
                    await api(`projects/${p.id}`, "DELETE");
                    await reload();
                    await refresh();
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
        {data?.length === 0 && <p className="empty">No projects yet.</p>}
      </div>
    </div>
  );
}
function SearchView() {
  const { api } = useApp();
  const [q, setQ] = useState(""),
    [results, setResults] = useState<Citation[]>([]),
    [searchMode, setSearchMode] = useState("keyword"),
    [searched, setSearched] = useState(false),
    [error, setError] = useState("");
  return (
    <div className="page-padding">
      <header className="view-intro">
        <h2>Find the source.</h2>
        <p>Search the documents you can access in this workspace.</p>
      </header>
      <form
        className="search-form"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            const result = await api<{ mode: string; results: Citation[] }>(
              `search?q=${encodeURIComponent(q)}`,
            );
            setResults(result.results);
            setSearchMode(result.mode);
            setSearched(true);
            setError("");
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      >
        <label className="search-input">
          <Search size={20} />
          <input
            autoFocus
            aria-label="Search workspace documents"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search your documents…"
          />
        </label>
        <button className="button primary">Search</button>
      </form>
      <p className="small muted">
        {searchMode === "hybrid" ? "Local semantic + keyword" : "Keyword"}{" "}
        retrieval · sources stay within this workspace
      </p>
      <ErrorMessage message={error} />
      <div className="search-results">
        {results.map((r) => (
          <Link
            href={`/app/documents?document=${r.documentId}&chunk=${r.id}`}
            key={r.id}
          >
            <h3>
              <FileText size={18} />
              {r.name}
            </h3>
            <p>{r.content}</p>
            <span className="small muted">
              {Object.entries(r.location)
                .map(([k, v]) => `${k} ${v}`)
                .join(" · ")}
            </span>
          </Link>
        ))}
        {searched && !results.length && (
          <div className="empty">
            No matching sources. Try a different phrase or upload a document.
          </div>
        )}
      </div>
    </div>
  );
}
function NotificationsView() {
  const { api, refresh } = useApp();
  const { data, reload, error } = useData<Notification[]>("notifications");
  return (
    <div className="page-padding">
      <div className="section-heading">
        <h2>Keep up with your work.</h2>
        <button
          className="button secondary small"
          onClick={async () => {
            await api("notifications", "PATCH", {});
            await reload();
            await refresh();
          }}
        >
          <Check size={16} />
          Mark all read
        </button>
      </div>
      <ErrorMessage message={error} />
      {data?.map((n) => (
        <div className={`notification ${n.read_at ? "" : "unread"}`} key={n.id}>
          <Bell size={20} />
          <Link
            href={n.href}
            onClick={async () => {
              await api(`notifications/${n.id}`, "PATCH", {});
              void refresh();
            }}
          >
            <strong>{n.title}</strong>
            <span className="small muted">{date(n.created_at)}</span>
          </Link>
        </div>
      ))}
      {!data?.length && (
        <div className="empty">
          <Bell />
          <h3>You’re up to date.</h3>
          <p>New replies and review decisions will appear here.</p>
        </div>
      )}
    </div>
  );
}
