import { dispatch } from "@/lib/server/api";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 180;
type RouteContext = { params: Promise<{ path: string[] }> };
async function route(req: Request, ctx: RouteContext) {
  return dispatch(req, (await ctx.params).path);
}
export { route as GET, route as POST, route as PATCH, route as DELETE };
