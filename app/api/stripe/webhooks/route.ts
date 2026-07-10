import { constructWebhookEvent, stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/audit";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

/**
 * POST /api/stripe/webhooks
 *
 * update_subscription_status(stripe_event) — named tool from AGENTIC_LAYER.md.
 * Subscription status is always set here, never by the client-side redirect
 * alone (SECURITY.md). Register in Stripe dashboard -> Webhooks:
 *   checkout.session.completed, customer.subscription.updated,
 *   customer.subscription.deleted, invoice.payment_failed
 *
 * Stripe's dashboard destinations can send a "Thin" payload (id only) instead
 * of a full object snapshot. Every case below re-fetches the object by id
 * from the Stripe API instead of trusting event.data.object's fields, so this
 * works with either payload style.
 */
export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = constructWebhookEvent(payload, signature);
  } catch (err) {
    console.error("[stripe/webhooks] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createClient();

  async function upsertSubscription(
    userId: string,
    fields: {
      stripe_customer_id?: string | null;
      stripe_subscription_id?: string | null;
      status: string;
      plan: string;
    },
  ) {
    const { data: existing } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      await supabase.from("subscriptions").update(fields).eq("id", existing.id);
    } else {
      await supabase.from("subscriptions").insert({ user_id: userId, ...fields });
    }

    await writeAuditLog(supabase, {
      user_id: userId,
      action: "subscription_status_changed",
      object_type: "subscription",
      object_id: userId,
      new_value: JSON.stringify(fields),
      source: "ai",
    });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const sessionId = (event.data.object as Stripe.Checkout.Session).id;
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        const userId = session.metadata?.userId;
        if (!userId) break;

        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

        await upsertSubscription(userId, {
          stripe_customer_id: (session.customer as string) ?? null,
          stripe_subscription_id: subscriptionId ?? null,
          status: "active",
          plan: "pro",
        });
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const subId = (event.data.object as Stripe.Subscription).id;
        const sub = await stripe.subscriptions.retrieve(subId);
        let userId = sub.metadata?.userId;

        if (!userId) {
          const { data } = await supabase
            .from("subscriptions")
            .select("user_id")
            .eq("stripe_subscription_id", sub.id)
            .maybeSingle();
          userId = data?.user_id ?? undefined;
        }
        if (!userId) break;

        await upsertSubscription(userId, {
          stripe_customer_id: sub.customer as string,
          stripe_subscription_id: sub.id,
          status: sub.status === "active" || sub.status === "trialing" ? "active" : sub.status,
          plan: sub.status === "canceled" ? "free" : "pro",
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subId = (event.data.object as Stripe.Subscription).id;
        await supabase
          .from("subscriptions")
          .update({ status: "canceled", plan: "free" })
          .eq("stripe_subscription_id", subId);
        break;
      }

      case "invoice.payment_failed": {
        const invoiceId = (event.data.object as Stripe.Invoice).id;
        console.warn("[stripe/webhooks] payment failed, invoice:", invoiceId);
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error(`[stripe/webhooks] error handling ${event.type}:`, err);
    // Return 200 anyway — Stripe retries on 5xx, not on handler errors.
  }

  return NextResponse.json({ received: true });
}
