/** Recent SharePoint / OneDrive files for the signed-in user. */
import { respondWithSourceFiles } from "@/lib/server/workspace-route";
import { fetchGraphFiles } from "@/lib/server/workspace-remote";

export async function GET(req: Request) {
  return respondWithSourceFiles(req, "microsoft", (token, days, signal) =>
    fetchGraphFiles(token, days, fetch, signal),
  );
}
