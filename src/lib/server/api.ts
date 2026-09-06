import { openapi } from "../openapi";
import { z } from "zod";
import { all, run } from "./db";
import { body, context, fail, handle, id, json, now, rateLimit } from "./http";
import { workspaceRoutes } from "./workspace";
import { documentRoutes } from "./documents";
import { portalRoutes } from "./portal";
import { consoleRoutes, mutationEvents } from "./console";
import { chat } from "./chat";
export async function dispatch(req: Request, path: string[]) {
  return handle(req, async () => {
    if (path[0] === "openapi.json" && req.method === "GET")
      return json(openapi());
    if (path[0] === "health" && req.method === "GET")
      return json({ status: "ok", storage: "sqlite", mode: "local" });
    if (path[0] === "inquiries" && req.method === "POST") {
      rateLimit("public-inquiries", 10, 60000);
      const data = await body(
        req,
        z.object({
          name: z.string().trim().min(1).max(100),
          email: z.string().email().max(200),
          company: z.string().max(200).default(""),
          message: z.string().trim().min(10).max(8000),
        }),
        16000,
      );
      const key = id();
      run(
        "INSERT INTO inquiries(id,name,email,company,message,created_at) VALUES(?,?,?,?,?,?)",
        key,
        data.name,
        data.email,
        data.company,
        data.message,
        now(),
      );
      return json(
        {
          id: key,
          message: "Your inquiry was saved for MLAI staff to review.",
        },
        201,
      );
    }
    const scope =
      req.method === "GET"
        ? "read"
        : path[0] === "chat"
          ? "chat"
          : path[0] === "documents"
            ? "documents"
            : ["playground", "connections"].includes(path[0])
              ? "console"
              : "write";
    const ctx = await context(req, scope);
    if (path[0] === "chat" && path[1] && req.method === "POST")
      return chat(req, path[1], ctx);
    if (
      path[0] === "connections" &&
      path[1] &&
      path[2] === "events" &&
      req.method === "GET"
    )
      return mutationEvents(req, path[1], ctx);
    for (const route of [
      workspaceRoutes,
      documentRoutes,
      portalRoutes,
      consoleRoutes,
    ]) {
      const result = await route(req, path, ctx);
      if (result) return result;
    }
    fail(404, "not_found", "API route not found.");
  });
}
