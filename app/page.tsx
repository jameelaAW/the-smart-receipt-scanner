import { getCategories, getReceipts, totalsByCategory } from "@/lib/receipts";
import { CategoryTotals } from "@/components/CategoryTotals";
import { ReceiptRow } from "@/components/ReceiptRow";

export default async function Home() {
  const [categories, receipts] = await Promise.all([getCategories(), getReceipts()]);
  const totals = totalsByCategory(receipts, categories);
  const categoryById = new Map(categories.map((c) => [c.id, c]));

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          🧾 Smart Receipt Scanner
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Snap a receipt, let AI file the expense, correct anything it gets wrong.
        </p>
      </header>

      <section className="mb-8">
        <CategoryTotals totals={totals} />
      </section>

      <section className="space-y-3">
        {receipts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 p-10 text-center text-neutral-500">
            <p className="text-lg">📥 Upload your first receipt</p>
            <p className="mt-1 text-sm">Nothing here yet — receipts you scan will show up in this list.</p>
          </div>
        ) : (
          receipts.map((receipt) => (
            <ReceiptRow
              key={receipt.id}
              receipt={receipt}
              category={receipt.category_id ? categoryById.get(receipt.category_id) : undefined}
            />
          ))
        )}
      </section>
    </main>
  );
}
