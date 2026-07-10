import type { SupabaseClient } from "@supabase/supabase-js";

export async function writeAuditLog(
  supabase: SupabaseClient,
  entry: {
    user_id?: string | null;
    action: string;
    object_type: string;
    object_id: string;
    old_value?: unknown;
    new_value?: unknown;
    source: "user" | "ai";
  },
) {
  const { error } = await supabase.from("audit_logs").insert({
    user_id: entry.user_id ?? null,
    action: entry.action,
    object_type: entry.object_type,
    object_id: entry.object_id,
    old_value: entry.old_value != null ? String(entry.old_value) : null,
    new_value: entry.new_value != null ? String(entry.new_value) : null,
    source: entry.source,
  });
  if (error) console.error("[audit_logs] insert failed", error.message);
}
