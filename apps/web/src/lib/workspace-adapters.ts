/**
 * The adapters the console actually runs against.
 *
 * Both point at same-origin route handlers that hold the Google/Microsoft
 * credentials server-side; the browser never sees a provider token. A user who
 * has not linked an account gets a 200 with `connected: false`, which the
 * adapter turns into the `unconfigured` source state so the console can offer
 * a Connect action.
 */
import { httpWorkspaceAdapter, type WorkspaceAdapter } from "./workspace-sources";

export function liveWorkspaceAdapters(): WorkspaceAdapter[] {
  return [
    httpWorkspaceAdapter({
      id: "google-drive",
      identity: "google",
      label: "Google Drive",
      endpoint: "/api/workspace/drive",
    }),
    httpWorkspaceAdapter({
      id: "sharepoint",
      identity: "microsoft",
      label: "SharePoint / OneDrive",
      endpoint: "/api/workspace/sharepoint",
    }),
  ];
}

/** Maps a source onto the OAuth provider slug its routes use. */
export const SOURCE_PROVIDER = {
  "google-drive": "google",
  sharepoint: "microsoft",
} as const;
