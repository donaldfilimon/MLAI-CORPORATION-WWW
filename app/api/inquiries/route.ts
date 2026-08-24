import { readJsonLimited } from "@/lib/server/body-limit";
import { ensureDatabase } from "@/lib/server/db";
import { getSession } from "@/lib/server/session";
import { checkAdminAccess, checkOrganizationAccess } from "@/lib/server/workos";
import { rateLimit, tooMany } from "@/lib/server/rate-limit";
import { verifyTurnstile } from "@/lib/server/turnstile";

export async function POST(req: Request) {
  if (!rateLimit("inquiries", req, { windowMs: 5 * 60 * 1000, max: 5 })) return tooMany();

  // 32 KB cap: room for a long message field, nothing more.
  const body = await readJsonLimited<{
    name?: unknown;
    email?: unknown;
    company?: unknown;
    projectType?: unknown;
    message?: unknown;
    turnstileToken?: unknown;
  }>(req, 32 * 1024);
  if (body instanceof Response) return body;

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const company = typeof body.company === "string" ? body.company.trim() : "";
  const projectType =
    typeof body.projectType === "string" ? body.projectType.trim() : "research";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const turnstileToken = typeof body.turnstileToken === "string" ? body.turnstileToken.trim() : "";

  if (name.length < 2) {
    return Response.json({ error: "Name must be at least 2 characters" }, { status: 400 });
  }
  if (!email || !email.includes("@")) {
    return Response.json({ error: "Invalid email address" }, { status: 400 });
  }
  if (company.length < 2) {
    return Response.json({ error: "Company name is required" }, { status: 400 });
  }
  if (message.length < 10) {
    return Response.json({ error: "Message must be at least 10 characters" }, { status: 400 });
  }
  if (!(await verifyTurnstile(req, turnstileToken, "inquiry"))) {
    return Response.json({ error: "Human verification failed" }, { status: 403 });
  }

  try {
    const sql = await ensureDatabase();
    await sql`INSERT INTO inquiries (name, email, company, project_type, message)
      VALUES (${name}, ${email}, ${company}, ${projectType}, ${message})`;
    return Response.json({ ok: true, message: "Inquiry submitted successfully." });
  } catch (err) {
    console.error("Database error saving inquiry:", err);
    return Response.json({ error: "Failed to store inquiry" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const user = await getSession(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const admin = await checkAdminAccess(user);
  if (!admin.ok) return Response.json({ error: admin.error }, { status: 403 });
  const access = await checkOrganizationAccess(user);
  if (!access.ok) return Response.json({ error: access.error }, { status: access.status });

  try {
    const sql = await ensureDatabase();
    const inquiries = await sql`SELECT * FROM inquiries ORDER BY created_at DESC`;
    return Response.json({ ok: true, inquiries });
  } catch (err) {
    console.error("Database error loading inquiries:", err);
    return Response.json({ error: "Failed to load inquiries" }, { status: 500 });
  }
}
