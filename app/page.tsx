import { getCategories, getReceipts } from "@/lib/receipts";
import { ReceiptsApp } from "@/components/ReceiptsApp";

export default async function Home() {
  const [categories, receipts] = await Promise.all([getCategories(), getReceipts()]);

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

      <ReceiptsApp initialReceipts={receipts} categories={categories} />
    </main>
  );
}
