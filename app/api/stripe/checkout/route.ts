import { createCheckoutSession, isStripeConfigured } from "@/lib/stripe";
import { getIdentity } from "@/lib/identity";
import { getSubscriptionForUser } from "@/lib/subscription";
import { NextResponse } from "next/server";

/**
 * POST /api/stripe/checkout
 *
 * PRD.md's success scenario has no login wall "until checkout" — so this is
 * the one point in the app that requires a real signed-in user (Sprint 4).
 */
export async function POST(request: Request) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: "Billing isn't configured yet — add STRIPE_SECRET_KEY and a price ID to enable checkout." },
        { status: 503 },
      );
    }

    const { userId, isAuthenticated } = await getIdentity();
    if (!isAuthenticated || !userId) {
      return NextResponse.json(
        { error: "Sign up to upgrade to Pro", signUpRequired: true },
        { status: 401 },
      );
    }

    const existing = await getSubscriptionForUser(userId);
    const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "";

    const session = await createCheckoutSession({
      customerId: existing?.stripe_customer_id,
      userId,
      successUrl: `${origin}/success`,
      cancelUrl: `${origin}/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
