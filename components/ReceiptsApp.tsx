"use client";

import { useMemo, useState } from "react";
import type { Category, Receipt } from "@/lib/types";
import { totalsByCategory } from "@/lib/totals";
import { CategoryTotals } from "@/components/CategoryTotals";
import { UploadWidget } from "@/components/UploadWidget";
import { EditableReceiptRow } from "@/components/EditableReceiptRow";

export function ReceiptsApp({
  initialReceipts,
  categories,
  uploadDisabled,
  uploadDisabledReason,
  signInRequired,
}: {
  initialReceipts: Receipt[];
  categories: Category[];
  uploadDisabled?: boolean;
  uploadDisabledReason?: string;
  signInRequired?: boolean;
}) {
  const [receipts, setReceipts] = useState(initialReceipts);
  const [banner, setBanner] = useState<string | null>(null);

  const totals = useMemo(() => totalsByCategory(receipts, categories), [receipts, categories]);

  function handleScanned(receipt: Receipt, warning?: string) {
    setReceipts((prev) => [receipt, ...prev]);
    setBanner(warning ?? null);
  }

  function handleUpdated(receipt: Receipt) {
    setReceipts((prev) => prev.map((r) => (r.id === receipt.id ? receipt : r)));
  }

  return (
    <>
      <section className="mb-6">
        <UploadWidget
          onScanned={handleScanned}
          disabled={uploadDisabled}
          disabledReason={uploadDisabledReason}
          signInRequired={signInRequired}
        />
        {banner && (
          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{banner}</p>
        )}
      </section>

      <section className="mb-8">
        <CategoryTotals totals={totals} />
      </section>

      <section className="space-y-3">
        {receipts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 p-10 text-center text-neutral-500">
            <p className="text-lg">📥 Upload your first receipt</p>
            <p className="mt-1 text-sm">Drop an image above to get started.</p>
            <div className="mx-auto mt-6 flex max-w-md flex-col gap-3 text-left text-sm">
              <div className="flex items-start gap-3">
                <span className="shrink-0">1️⃣</span>
                <span>Upload a photo of any receipt — a coffee, a flight, a laptop.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="shrink-0">2️⃣</span>
                <span>AI reads the vendor, date, amount, and picks a category for you.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="shrink-0">3️⃣</span>
                <span>Tap any field to fix anything it got wrong — it saves instantly.</span>
              </div>
            </div>
          </div>
        ) : (
          receipts.map((receipt) => (
            <EditableReceiptRow
              key={receipt.id}
              receipt={receipt}
              categories={categories}
              onUpdated={handleUpdated}
            />
          ))
        )}
      </section>
    </>
  );
}
