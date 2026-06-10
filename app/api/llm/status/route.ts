import { getSession, toPublicUser } from "@/lib/server/session";

export async function GET(req: Request) {
  const user = await getSession(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const provider = process.env.LLM_PROVIDER ?? "gemini";
  return Response.json({
    ok: true,
    user: toPublicUser(user),
    llm: {
      provider,
      configured: provider === "gemini" ? Boolean(process.env.GEMINI_API_KEY) : false,
      model: process.env.GEMINI_MODEL ?? "gemini-1.5-flash",
    },
  });
}
