import { createCheckoutSession, isStripeConfigured } from "@/lib/stripe";
import { getVisitorId } from "@/lib/visitor";
import { getSubscriptionForUser } from "@/lib/subscription";
import { NextResponse } from "next/server";

/**
 * POST /api/stripe/checkout
 *
 * v1 has no login wall (PRD.md) — the visitor-id cookie set by middleware.ts
 * stands in for a user id until Sprint 4 auth lands. Creates a Stripe
 * Checkout Session for the Pro monthly plan and returns its URL.
 */
export async function POST(request: Request) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: "Billing isn't configured yet — add STRIPE_SECRET_KEY and a price ID to enable checkout." },
        { status: 503 },
      );
    }

    const visitorId = await getVisitorId();
    if (!visitorId) {
      return NextResponse.json({ error: "Missing visitor session — reload the page" }, { status: 400 });
    }

    const existing = await getSubscriptionForUser(visitorId);
    const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "";

    const session = await createCheckoutSession({
      customerId: existing?.stripe_customer_id,
      userId: visitorId,
      successUrl: `${origin}/success`,
      cancelUrl: `${origin}/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
