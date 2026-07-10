"use client";

import { useState } from "react";
import type { Category, Receipt } from "@/lib/types";
import { CategoryBadge } from "@/components/CategoryBadge";
import { ReviewBadge } from "@/components/ReviewBadge";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function EditableReceiptRow({
  receipt,
  categories,
  onUpdated,
}: {
  receipt: Receipt;
  categories: Category[];
  onUpdated: (receipt: Receipt) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    vendor: receipt.vendor ?? "",
    amount: receipt.amount != null ? String(receipt.amount) : "",
    receipt_date: receipt.receipt_date ?? "",
    category_id: receipt.category_id ?? "",
  });

  const category = receipt.category_id
    ? categories.find((c) => c.id === receipt.category_id)
    : undefined;

  async function patchField(field: string, value: unknown) {
    const res = await fetch(`/api/receipts/${receipt.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field, value }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Save failed");
    return json.receipt as Receipt;
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const changes: [string, unknown][] = [];
      if (draft.vendor !== (receipt.vendor ?? "")) changes.push(["vendor", draft.vendor]);
      if (draft.amount !== (receipt.amount != null ? String(receipt.amount) : ""))
        changes.push(["amount", draft.amount === "" ? null : Number(draft.amount)]);
      if (draft.receipt_date !== (receipt.receipt_date ?? ""))
        changes.push(["receipt_date", draft.receipt_date || null]);
      if (draft.category_id !== (receipt.category_id ?? ""))
        changes.push(["category_id", draft.category_id || null]);

      let latest = receipt;
      for (const [field, value] of changes) {
        latest = await patchField(field, value);
      }
      onUpdated(latest);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    const lowConfidence =
      (receipt.vendor_confidence != null && receipt.vendor_confidence < 0.7) ||
      (receipt.amount_confidence != null && receipt.amount_confidence < 0.7) ||
      (receipt.category_confidence != null && receipt.category_confidence < 0.7);

    return (
      <button
        onClick={() => setEditing(true)}
        className="flex w-full items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 text-left transition-shadow hover:shadow-sm"
      >
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
          {receipt.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={receipt.image_url}
              alt={receipt.vendor ?? "Receipt"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xl">🧾</div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium text-neutral-900">
              {receipt.vendor || "Unknown vendor"}
            </span>
            {lowConfidence && receipt.review_status !== "manual_entry" && (
              <span className="text-amber-500" title="Low-confidence extraction">
                ⚠️
              </span>
            )}
          </div>
          <div className="text-sm text-neutral-500">{formatDate(receipt.receipt_date)}</div>
        </div>

        <CategoryBadge category={category} />

        <div className="w-24 shrink-0 text-right font-semibold text-neutral-900">
          {receipt.amount != null ? currency.format(Number(receipt.amount)) : "—"}
        </div>

        <div className="w-28 shrink-0 text-right">
          <ReviewBadge status={receipt.review_status} />
        </div>
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-900 bg-white p-4">
      {receipt.review_status === "manual_entry" && (
        <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Auto-extraction failed — please enter details manually
        </p>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <label className="text-xs text-neutral-500">
          Vendor
          <input
            className="mt-1 w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm text-neutral-900"
            value={draft.vendor}
            onChange={(e) => setDraft((d) => ({ ...d, vendor: e.target.value }))}
          />
        </label>
        <label className="text-xs text-neutral-500">
          Amount
          <input
            type="number"
            step="0.01"
            className="mt-1 w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm text-neutral-900"
            value={draft.amount}
            onChange={(e) => setDraft((d) => ({ ...d, amount: e.target.value }))}
          />
        </label>
        <label className="text-xs text-neutral-500">
          Date
          <input
            type="date"
            className="mt-1 w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm text-neutral-900"
            value={draft.receipt_date}
            onChange={(e) => setDraft((d) => ({ ...d, receipt_date: e.target.value }))}
          />
        </label>
        <label className="text-xs text-neutral-500">
          Category
          <select
            className="mt-1 w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm text-neutral-900"
            value={draft.category_id}
            onChange={(e) => setDraft((d) => ({ ...d, category_id: e.target.value }))}
          >
            <option value="">Uncategorized</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-3 flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          onClick={() => setEditing(false)}
          disabled={saving}
          className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
