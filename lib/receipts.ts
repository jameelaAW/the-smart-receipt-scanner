import { createClient } from "@/lib/supabase/server";
import type { Category, Receipt } from "@/lib/types";

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (error) throw new Error(`Failed to load categories: ${error.message}`);
  return data ?? [];
}

export async function getReceipts(): Promise<Receipt[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("receipts")
    .select("*")
    .order("review_status", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to load receipts: ${error.message}`);
  return data ?? [];
}
