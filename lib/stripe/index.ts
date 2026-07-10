import Stripe from "stripe";

// Falls back to a placeholder so `new Stripe()` doesn't throw at build time when
// STRIPE_SECRET_KEY isn't configured yet. Real calls still require a valid key at
// runtime — callers check `isStripeConfigured()` first and fail gracefully.
export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder_build_only",
  { apiVersion: "2025-02-24.acacia", typescript: true },
);

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY);
}

// create_stripe_checkout(user_id, plan) — named tool from AGENTIC_LAYER.md.
export async function createCheckoutSession({
  customerId,
  userId,
  successUrl,
  cancelUrl,
}: {
  customerId?: string | null;
  userId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  return stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY!, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { userId },
    subscription_data: { metadata: { userId } },
    ...(customerId ? { customer: customerId } : { customer_creation: "always" }),
  });
}

export function constructWebhookEvent(payload: string, signature: string) {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!,
  );
}
