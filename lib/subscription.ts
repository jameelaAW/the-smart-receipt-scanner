import { createClient } from "@/lib/supabase/server";
import type { Subscription } from "@/lib/types";

export async function getSubscriptionForUser(
  userId: string | null,
): Promise<Subscription | null> {
  if (!userId) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[subscriptions] lookup failed", error.message);
    return null;
  }
  return data;
}

export function isPro(subscription: Subscription | null) {
  return subscription?.status === "active" && subscription?.plan === "pro";
}
