/**
 * The console Files view renders whatever the adapters hand it, so the
 * boundary that matters is the one where untrusted JSON becomes
 * `WorkspaceFile`. These cases pin that: malformed rows are dropped rather
 * than rendered, a failing source degrades to a visible state instead of
 * throwing, and `empty` stays distinguishable from `unconfigured`.
 */
import { describe, expect, it } from "vitest";
import {
  countByKind,
  filterFiles,
  formatFileSize,
  formatModified,
  httpWorkspaceAdapter,
  kindFromMimeType,
  loadWorkspaceSources,
  parseWorkspaceFile,
  sortByModifiedDesc,
  staticWorkspaceAdapter,
  type WorkspaceFile,
} from "../lib/workspace-sources";

const file = (over: Partial<WorkspaceFile> = {}): WorkspaceFile => ({
  id: "a",
  title: "Architecture reference",
  kind: "doc",
  source: "google-drive",
  modified: "2026-09-04T17:12:00.000Z",
  sizeBytes: 5120,
  url: "https://drive.google.com/",
  owner: null,
  ...over,
});

describe("parseWorkspaceFile", () => {
  it("accepts a well-formed row", () => {
    const parsed = parseWorkspaceFile(file(), "google-drive");
    expect(parsed).not.toBeNull();
    expect(parsed?.title).toBe("Architecture reference");
    expect(parsed?.kind).toBe("doc");
  });

  it("rejects rows missing a field the view has to render", () => {
    for (const key of ["id", "title", "url", "modified"] as const) {
      const row: Record<string, unknown> = { ...file() };
      delete row[key];
      expect(parseWorkspaceFile(row, "google-drive")).toBeNull();
    }
  });

  it("rejects a non-object, an array, and an unparseable date", () => {
    expect(parseWorkspaceFile(null, "google-drive")).toBeNull();
    expect(parseWorkspaceFile("nope", "google-drive")).toBeNull();
    expect(parseWorkspaceFile([file()], "google-drive")).toBeNull();
    expect(parseWorkspaceFile(file({ modified: "last tuesday" }), "google-drive")).toBeNull();
  });

  it("falls back rather than trusting an unknown kind or source", () => {
    const parsed = parseWorkspaceFile(
      { ...file(), kind: "hologram", source: "dropbox" },
      "sharepoint",
    );
    expect(parsed?.kind).toBe("other");
    expect(parsed?.source).toBe("sharepoint");
  });

  it("nulls a size it cannot trust instead of storing 0", () => {
    expect(parseWorkspaceFile(file({ sizeBytes: -5 }), "google-drive")?.sizeBytes).toBeNull();
    expect(
      parseWorkspaceFile({ ...file(), sizeBytes: "5 KB" }, "google-drive")?.sizeBytes,
    ).toBeNull();
    expect(parseWorkspaceFile(file({ sizeBytes: 0 }), "google-drive")?.sizeBytes).toBe(0);
  });
});

describe("loadWorkspaceSources", () => {
  it("reports ok with newest first, and empty for a connected-but-quiet source", async () => {
    const results = await loadWorkspaceSources([
      staticWorkspaceAdapter({
        id: "google-drive",
        identity: "google",
        label: "Google Drive",
        files: [
          file({ id: "old", modified: "2026-08-27T08:03:00.000Z" }),
          file({ id: "new", modified: "2026-09-05T09:41:00.000Z" }),
        ],
      }),
      staticWorkspaceAdapter({
        id: "sharepoint",
        identity: "microsoft",
        label: "SharePoint / OneDrive",
        files: [],
      }),
    ]);

    expect(results[0]?.status).toBe("ok");
    expect(results[0]?.files.map((f) => f.id)).toEqual(["new", "old"]);
    // Empty is its own state — the view says "connected, nothing in window"
    // rather than inventing rows or claiming the source is broken.
    expect(results[1]?.status).toBe("empty");
    expect(results[1]?.files).toEqual([]);
  });

  it("turns a failing source into a rendered error instead of rejecting", async () => {
    const results = await loadWorkspaceSources([
      {
        id: "google-drive",
        identity: "google",
        label: "Google Drive",
        list: async () => {
          throw new Error("token expired");
        },
      },
      staticWorkspaceAdapter({
        id: "sharepoint",
        identity: "microsoft",
        label: "SharePoint / OneDrive",
        files: [file({ source: "sharepoint" })],
      }),
    ]);

    expect(results[0]?.status).toBe("error");
    expect(results[0]?.message).toBe("token expired");
    // One source failing must not take the other down with it.
    expect(results[1]?.status).toBe("ok");
  });

  it("preserves adapter order so the view's sections do not reshuffle", async () => {
    const results = await loadWorkspaceSources([
      staticWorkspaceAdapter({
        id: "sharepoint",
        identity: "microsoft",
        label: "SharePoint / OneDrive",
        files: [],
      }),
      staticWorkspaceAdapter({
        id: "google-drive",
        identity: "google",
        label: "Google Drive",
        files: [file()],
      }),
    ]);
    expect(results.map((r) => r.source)).toEqual(["sharepoint", "google-drive"]);
  });
});

describe("httpWorkspaceAdapter", () => {
  it("asks for the requested window and drops rows it cannot render", async () => {
    let requested = "";
    const adapter = httpWorkspaceAdapter({
      id: "google-drive",
      identity: "google",
      label: "Google Drive",
      endpoint: "/api/workspace/drive",
      fetchImpl: (async (input: string) => {
        requested = String(input);
        return {
          ok: true,
          status: 200,
          json: async () => ({ files: [file(), { id: "broken" }, null] }),
        };
      }) as unknown as typeof fetch,
    });

    const files = await adapter.list({ days: 30 });
    expect(requested).toBe("/api/workspace/drive?days=30");
    expect(files).toHaveLength(1);
    expect(files[0]?.id).toBe("a");
  });

  it("throws on a non-ok response so loadWorkspaceSources can show it", async () => {
    const adapter = httpWorkspaceAdapter({
      id: "google-drive",
      identity: "google",
      label: "Google Drive",
      endpoint: "/api/workspace/drive",
      fetchImpl: (async () => ({ ok: false, status: 503, json: async () => ({}) })) as unknown as typeof fetch,
    });
    await expect(adapter.list({ days: 30 })).rejects.toThrow("Google Drive responded 503");
  });

  it("treats a body without a files array as no files, not a crash", async () => {
    const adapter = httpWorkspaceAdapter({
      id: "sharepoint",
      identity: "microsoft",
      label: "SharePoint / OneDrive",
      endpoint: "/api/workspace/sharepoint",
      fetchImpl: (async () => ({
        ok: true,
        status: 200,
        json: async () => ({ message: "no tenant" }),
      })) as unknown as typeof fetch,
    });
    await expect(adapter.list({ days: 30 })).resolves.toEqual([]);
  });
});

describe("filtering and counts", () => {
  const files = [
    file({ id: "1", kind: "doc", title: "Architecture reference" }),
    file({ id: "2", kind: "slides", title: "Persona routing deck" }),
    file({ id: "3", kind: "slides", title: "Console scope" }),
  ];

  it("filters by kind and by a case-insensitive title match", () => {
    expect(filterFiles(files, { kind: "slides", query: "" }).map((f) => f.id)).toEqual(["2", "3"]);
    expect(filterFiles(files, { kind: null, query: "PERSONA" }).map((f) => f.id)).toEqual(["2"]);
    expect(filterFiles(files, { kind: "doc", query: "persona" })).toEqual([]);
    expect(filterFiles(files, { kind: null, query: "   " })).toHaveLength(3);
  });

  it("counts every kind, including the ones with no files", () => {
    const counts = countByKind(files);
    expect(counts.All).toBe(3);
    expect(counts.Docs).toBe(1);
    expect(counts.Slides).toBe(2);
    expect(counts.Sheets).toBe(0);
    expect(counts.PDFs).toBe(0);
  });

  it("sorts newest first without mutating the input", () => {
    const input = [file({ id: "old", modified: "2026-01-01T00:00:00.000Z" }), file({ id: "new" })];
    expect(sortByModifiedDesc(input).map((f) => f.id)).toEqual(["new", "old"]);
    expect(input.map((f) => f.id)).toEqual(["old", "new"]);
  });
});

describe("formatting", () => {
  it("formats sizes, and renders an unknown size as a dash rather than 0 B", () => {
    expect(formatFileSize(null)).toBe("—");
    expect(formatFileSize(0)).toBe("0 B");
    expect(formatFileSize(512)).toBe("512 B");
    expect(formatFileSize(2048)).toBe("2.0 KB");
    expect(formatFileSize(65_536)).toBe("64 KB");
    expect(formatFileSize(5_242_880)).toBe("5.0 MB");
  });

  /* Formatted in UTC so server and client render the same string; a local-time
     formatter would flip this date either side of midnight and desync hydration. */
  it("formats dates in UTC regardless of the host timezone", () => {
    expect(formatModified("2026-09-04T23:59:00.000Z")).toBe("Sep 4, 2026");
    expect(formatModified("2026-09-05T00:01:00.000Z")).toBe("Sep 5, 2026");
    expect(formatModified("not a date")).toBe("—");
  });

  it("maps the MIME types that carry a distinct icon, and guesses nothing else", () => {
    expect(kindFromMimeType("application/pdf")).toBe("pdf");
    expect(kindFromMimeType("application/vnd.google-apps.presentation")).toBe("slides");
    expect(kindFromMimeType("application/vnd.google-apps.spreadsheet")).toBe("sheet");
    expect(kindFromMimeType("application/vnd.google-apps.document")).toBe("doc");
    expect(kindFromMimeType("text/markdown")).toBe("doc");
    expect(kindFromMimeType("image/png")).toBe("other");
    expect(kindFromMimeType(null)).toBe("other");
  });
});
