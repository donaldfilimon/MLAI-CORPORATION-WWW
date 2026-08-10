import { readJsonLimited } from "@/lib/server/body-limit";
import { getSession } from "@/lib/server/session";

/**
 * Plan ids this endpoint accepts, mirroring GET /api/billing/plans.
 *
 * Only `pilot` is checkout-eligible: `platform` is priced "Custom", and a single
 * Stripe payment link cannot represent a negotiated price. The client has always
 * sent `{ planId }` (src/lib/api.ts) and this handler used to ignore it entirely,
 * so selecting Platform silently returned the Pilot payment link.
 */
const CHECKOUT_PLANS = { pilot: true, platform: false } as const;
type PlanId = keyof typeof CHECKOUT_PLANS;

export async function POST(req: Request) {
  const user = await getSession(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // 4 KB cap: the payload is a single plan id.
  const body = await readJsonLimited<{ planId?: unknown }>(req, 4 * 1024);
  if (body instanceof Response) return body;
  const planId = typeof body.planId === "string" ? body.planId : undefined;

  if (!planId || !(planId in CHECKOUT_PLANS)) {
    return Response.json(
      { error: "Unknown plan", validPlans: Object.keys(CHECKOUT_PLANS) },
      { status: 400 },
    );
  }

  if (!CHECKOUT_PLANS[planId as PlanId]) {
    return Response.json(
      {
        ok: false,
        error: "This plan is priced individually and has no self-serve checkout.",
        nextStep: "Contact sales to scope a Platform engagement.",
      },
      { status: 400 },
    );
  }

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
