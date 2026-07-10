import type { SupabaseClient } from "@supabase/supabase-js";

// TASKS.md Sprint 3: "Free tier limited to 5 scans/month (enforced server-side)"
export const FREE_SCAN_LIMIT = 5;

export async function scansThisMonth(supabase: SupabaseClient, userId: string): Promise<number> {
  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();

  const { count, error } = await supabase
    .from("receipts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfMonth);

  if (error) {
    console.error("[scanLimit] count failed", error.message);
    return 0;
  }
  return count ?? 0;
}
