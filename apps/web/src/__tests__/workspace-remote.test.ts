/**
 * Provider responses are the untrusted edge of the console: whatever Drive and
 * Graph hand back becomes rows a user clicks. These pin the mapping, the rows
 * that get dropped rather than half-rendered, and the fact that provider error
 * bodies never reach a log line.
 */
import { describe, expect, it } from "vitest";
import {
  fetchDriveFiles,
  fetchGraphFiles,
  mapDriveFile,
  mapGraphItem,
  windowStartIso,
} from "../lib/server/workspace-remote";

const DRIVE_ROW = {
  id: "1abc",
  name: "Architecture reference",
  mimeType: "application/vnd.google-apps.document",
  modifiedTime: "2026-09-04T17:12:00.000Z",
  size: "5120",
  webViewLink: "https://docs.google.com/document/d/1abc/edit",
  owners: [{ displayName: "Ada", emailAddress: "ada@example.test" }],
};

const GRAPH_ROW = {
  id: "01XYZ",
  name: "Persona routing.pptx",
  lastModifiedDateTime: "2026-09-05T09:41:00.000Z",
  size: 65536,
  webUrl: "https://contoso.sharepoint.com/persona.pptx",
  file: { mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation" },
  lastModifiedBy: { user: { displayName: "Grace" } },
};

describe("windowStartIso", () => {
  it("subtracts the window and clamps nonsense to a sane default", () => {
    const now = Date.parse("2026-09-06T00:00:00.000Z");
    expect(windowStartIso(30, now)).toBe("2026-08-07T00:00:00.000Z");
    expect(windowStartIso(1, now)).toBe("2026-09-05T00:00:00.000Z");
    // A caller-supplied window must not become an unbounded history scan.
    expect(windowStartIso(100_000, now)).toBe(windowStartIso(365, now));
    expect(windowStartIso(0, now)).toBe(windowStartIso(30, now));
    expect(windowStartIso(Number.NaN, now)).toBe(windowStartIso(30, now));
    expect(windowStartIso(-5, now)).toBe(windowStartIso(30, now));
  });
});

describe("mapDriveFile", () => {
  it("maps a document, namespacing the id so two sources cannot collide", () => {
    const file = mapDriveFile(DRIVE_ROW);
    expect(file).toEqual({
      id: "google-drive:1abc",
      title: "Architecture reference",
      kind: "doc",
      source: "google-drive",
      modified: "2026-09-04T17:12:00.000Z",
      sizeBytes: 5120,
      url: "https://docs.google.com/document/d/1abc/edit",
      owner: "Ada",
    });
  });

  it("drops folders and rows missing anything the view renders", () => {
    expect(mapDriveFile({ ...DRIVE_ROW, mimeType: "application/vnd.google-apps.folder" })).toBeNull();
    for (const key of ["id", "name", "modifiedTime", "webViewLink"] as const) {
      const row: Record<string, unknown> = { ...DRIVE_ROW };
      delete row[key];
      expect(mapDriveFile(row)).toBeNull();
    }
    expect(mapDriveFile({ ...DRIVE_ROW, modifiedTime: "whenever" })).toBeNull();
    expect(mapDriveFile(null)).toBeNull();
    expect(mapDriveFile("nope")).toBeNull();
  });

  it("nulls a size it cannot trust and falls back to the owner's email", () => {
    expect(mapDriveFile({ ...DRIVE_ROW, size: undefined })?.sizeBytes).toBeNull();
    expect(mapDriveFile({ ...DRIVE_ROW, size: "lots" })?.sizeBytes).toBeNull();
    expect(
      mapDriveFile({ ...DRIVE_ROW, owners: [{ emailAddress: "ada@example.test" }] })?.owner,
    ).toBe("ada@example.test");
    expect(mapDriveFile({ ...DRIVE_ROW, owners: [] })?.owner).toBeNull();
  });
});

describe("mapGraphItem", () => {
  it("maps an item and reads through the remoteItem wrapper for shared files", () => {
    expect(mapGraphItem(GRAPH_ROW)).toMatchObject({
      id: "sharepoint:01XYZ",
      kind: "slides",
      source: "sharepoint",
      sizeBytes: 65536,
      owner: "Grace",
    });

    // /me/drive/recent returns shared items wrapped; the outer object carries
    // almost nothing, so reading only the top level would drop every shared file.
    const shared = mapGraphItem({ id: "outer", remoteItem: GRAPH_ROW });
    expect(shared?.id).toBe("sharepoint:01XYZ");
    expect(shared?.title).toBe("Persona routing.pptx");
  });

  it("drops folders and unrenderable rows", () => {
    expect(mapGraphItem({ ...GRAPH_ROW, folder: { childCount: 2 } })).toBeNull();
    expect(mapGraphItem({ ...GRAPH_ROW, webUrl: undefined })).toBeNull();
    expect(mapGraphItem({})).toBeNull();
    expect(mapGraphItem(null)).toBeNull();
  });
});

describe("fetchDriveFiles", () => {
  it("scopes the query to the window, untrashed, newest first, and bounded", async () => {
    let requested = "";
    let auth = "";
    const fetchImpl = (async (url: string, init: RequestInit) => {
      requested = url;
      auth = String((init.headers as Record<string, string>).authorization);
      return { ok: true, status: 200, json: async () => ({ files: [DRIVE_ROW, { id: "x" }] }) };
    }) as unknown as typeof fetch;

    const files = await fetchDriveFiles("token-1", 30, fetchImpl);
    const url = new URL(requested);
    expect(url.searchParams.get("q")).toContain("trashed = false");
    expect(url.searchParams.get("q")).toContain("modifiedTime >");
    expect(url.searchParams.get("orderBy")).toBe("modifiedTime desc");
    expect(url.searchParams.get("pageSize")).toBe("100");
    expect(auth).toBe("Bearer token-1");
    // The token is a header value, never a query parameter — query strings end
    // up in access logs and Referer headers.
    expect(requested).not.toContain("token-1");
    // One unmappable row must not blank the source.
    expect(files).toHaveLength(1);
  });

  it("reports the status of a failure without echoing the provider's body", async () => {
    const fetchImpl = (async () => ({
      ok: false,
      status: 403,
      json: async () => ({ error: { message: "Bearer token-1 lacks scope" } }),
    })) as unknown as typeof fetch;

    await expect(fetchDriveFiles("token-1", 30, fetchImpl)).rejects.toThrow(
      "Google Drive responded 403",
    );
    await fetchDriveFiles("token-1", 30, fetchImpl).catch((error: Error) => {
      expect(error.message).not.toContain("token-1");
    });
  });
});

describe("fetchGraphFiles", () => {
  it("applies the window itself, because /recent has no server-side date filter", async () => {
    const fetchImpl = (async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        value: [
          GRAPH_ROW,
          { ...GRAPH_ROW, id: "old", lastModifiedDateTime: "2020-01-01T00:00:00.000Z" },
        ],
      }),
    })) as unknown as typeof fetch;

    const files = await fetchGraphFiles("token-2", 30, fetchImpl);
    // Without the client-side filter the console would show items older than
    // the window it says it is showing.
    expect(files.map((f) => f.id)).toEqual(["sharepoint:01XYZ"]);
  });

  it("returns an empty list for a tenant with no recent items", async () => {
    const fetchImpl = (async () => ({
      ok: true,
      status: 200,
      json: async () => ({ value: [] }),
    })) as unknown as typeof fetch;
    await expect(fetchGraphFiles("t", 30, fetchImpl)).resolves.toEqual([]);
  });

  it("tolerates a body with no value array", async () => {
    const fetchImpl = (async () => ({
      ok: true,
      status: 200,
      json: async () => ({}),
    })) as unknown as typeof fetch;
    await expect(fetchGraphFiles("t", 30, fetchImpl)).resolves.toEqual([]);
  });
});
