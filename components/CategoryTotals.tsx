import type { Category } from "@/lib/types";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function CategoryTotals({
  totals,
}: {
  totals: { category: Category; total: number }[];
}) {
  if (totals.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3">
      {totals.map(({ category, total }) => (
        <div
          key={category.id}
          className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5"
        >
          <span className="text-lg">{category.icon}</span>
          <div className="leading-tight">
            <div className="text-xs text-neutral-500">{category.name}</div>
            <div className="text-sm font-semibold text-neutral-900">
              {currency.format(total)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
