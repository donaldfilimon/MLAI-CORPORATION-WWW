/**
 * Development fixture for `/console/workspace`.
 *
 * These rows are illustrative, not anyone's files. The console reads live
 * Drive/SharePoint content through `httpWorkspaceAdapter` against a
 * server-side route handler; this fixture only exists so the screen is
 * legible in local dev and in tests before those handlers are wired.
 *
 * Deliberately not seeded from a real account: this repository is public, and
 * a person's document titles and share URLs are their data, not site content.
 *
 * SharePoint/OneDrive is intentionally absent from this list. The Microsoft
 * tenant returned no files for the 30-day window when the console was
 * designed, and the view renders that as an explicit empty state rather than
 * inventing rows to fill the panel.
 */
import {
  staticWorkspaceAdapter,
  type WorkspaceAdapter,
  type WorkspaceFile,
} from "./workspace-sources";

const DRIVE_FIXTURE: WorkspaceFile[] = [
  {
    id: "fixture-architecture-reference",
    title: "WDBX System Design and Architecture Reference",
    kind: "doc",
    source: "google-drive",
    modified: "2026-09-04T17:12:00.000Z",
    sizeBytes: 5_120,
    url: "https://drive.google.com/",
    owner: "MLAI",
  },
  {
    id: "fixture-persona-routing",
    title: "Persona routing — review deck",
    kind: "slides",
    source: "google-drive",
    modified: "2026-09-05T09:41:00.000Z",
    sizeBytes: 65_536,
    url: "https://drive.google.com/",
    owner: "MLAI",
  },
  {
    id: "fixture-console-scope",
    title: "Console scope — Files, Today, Triage, Work, Metrics",
    kind: "doc",
    source: "google-drive",
    modified: "2026-09-02T14:05:00.000Z",
    sizeBytes: 3_072,
    url: "https://drive.google.com/",
    owner: "MLAI",
  },
  {
    id: "fixture-retention-model",
    title: "Retention and consent model",
    kind: "sheet",
    source: "google-drive",
    modified: "2026-08-29T11:20:00.000Z",
    sizeBytes: 18_944,
    url: "https://drive.google.com/",
    owner: "MLAI",
  },
  {
    id: "fixture-verify",
    title: "VERIFY.md",
    kind: "doc",
    source: "google-drive",
    modified: "2026-08-27T08:03:00.000Z",
    sizeBytes: 2_048,
    url: "https://drive.google.com/",
    owner: "MLAI",
  },
];

/**
 * Swap these for `httpWorkspaceAdapter({ ..., endpoint: "/api/workspace/…" })`
 * once the route handlers exist; the view needs no other change.
 */
export function fixtureWorkspaceAdapters(): WorkspaceAdapter[] {
  return [
    staticWorkspaceAdapter({
      id: "google-drive",
      identity: "google",
      label: "Google Drive",
      files: DRIVE_FIXTURE,
    }),
    staticWorkspaceAdapter({
      id: "sharepoint",
      identity: "microsoft",
      label: "SharePoint / OneDrive",
      files: [],
    }),
  ];
}
