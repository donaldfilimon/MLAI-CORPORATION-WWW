/** Recent Google Drive files for the signed-in user. */
import { respondWithSourceFiles } from "@/lib/server/workspace-route";
import { fetchDriveFiles } from "@/lib/server/workspace-remote";

export async function GET(req: Request) {
  return respondWithSourceFiles(req, "google", (token, days, signal) =>
    fetchDriveFiles(token, days, fetch, signal),
  );
}
