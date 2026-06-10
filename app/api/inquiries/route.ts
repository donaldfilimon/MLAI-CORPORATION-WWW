import { getDb } from "@/lib/server/db";
import { getSession } from "@/lib/server/session";
import { checkAdminMfa } from "@/lib/server/workos";
import { rateLimit, tooMany } from "@/lib/server/rate-limit";

export async function POST(req: Request) {
  if (!rateLimit("inquiries", req, { windowMs: 5 * 60 * 1000, max: 5 })) return tooMany();

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const company = typeof body.company === "string" ? body.company.trim() : "";
  const projectType =
    typeof body.projectType === "string" ? body.projectType.trim() : "research";
  const message = typeof body.message === "string" ? body.message.trim() : "";

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

  try {
    getDb()
      .prepare(
        "INSERT INTO inquiries (name, email, company, project_type, message) VALUES (?, ?, ?, ?, ?)",
      )
      .run(name, email, company, projectType, message);
    return Response.json({ ok: true, message: "Inquiry submitted successfully." });
  } catch (err) {
    console.error("Database error saving inquiry:", err);
    return Response.json({ error: "Failed to store inquiry" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const user = await getSession(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const mfa = await checkAdminMfa(user);
  if (!mfa.ok) return Response.json({ error: mfa.error }, { status: 403 });

  try {
    const inquiries = getDb()
      .prepare("SELECT * FROM inquiries ORDER BY created_at DESC")
      .all();
    return Response.json({ ok: true, inquiries });
  } catch (err) {
    console.error("Database error loading inquiries:", err);
    return Response.json({ error: "Failed to load inquiries" }, { status: 500 });
  }
}
