import { getSession } from "@/lib/server/session";

export async function GET(req: Request) {
  const user = await getSession(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  return Response.json({
    ok: true,
    plans: [
      {
        id: "pilot",
        name: "Pilot",
        price: "$2,500/mo",
        description:
          "Private console access, protected LLM API, readiness audit support, and prototype evaluation gates.",
      },
      {
        id: "platform",
        name: "Platform",
        price: "Custom",
        description:
          "Team workspaces, private deployment support, custom retrieval pipelines, and production reliability reviews.",
      },
    ],
    provider: process.env.BILLING_PROVIDER ?? "manual",
    checkoutConfigured: Boolean(process.env.STRIPE_PAYMENT_LINK),
  });
}
