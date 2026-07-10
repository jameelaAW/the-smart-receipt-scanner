import type { Category, Receipt } from "@/lib/types";

export function totalsByCategory(receipts: Receipt[], categories: Category[]) {
  const totals = new Map<string, number>();
  for (const r of receipts) {
    if (!r.category_id || r.amount == null) continue;
    totals.set(r.category_id, (totals.get(r.category_id) ?? 0) + Number(r.amount));
  }
  return categories
    .map((c) => ({ category: c, total: totals.get(c.id) ?? 0 }))
    .filter((t) => t.total > 0)
    .sort((a, b) => b.total - a.total);
}
