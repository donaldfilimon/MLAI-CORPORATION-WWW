import { getSession } from "@/lib/server/session";

export async function POST(req: Request) {
  const user = await getSession(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const paymentLink = process.env.STRIPE_PAYMENT_LINK;
  if (!paymentLink) {
    return Response.json(
      {
        ok: false,
        error: "Billing checkout is not configured yet.",
        nextStep:
          "Set STRIPE_PAYMENT_LINK or replace this endpoint with Stripe Checkout session creation.",
      },
      { status: 503 },
    );
  }

  const url = new URL(paymentLink);
  url.searchParams.set("prefilled_email", user.email);
  url.searchParams.set("client_reference_id", user.userId);
  return Response.json({ ok: true, url: url.toString() });
}
