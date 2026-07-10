import type { Category, Receipt } from "@/lib/types";
import { CategoryBadge } from "@/components/CategoryBadge";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ReviewBadge({ status }: { status: Receipt["review_status"] }) {
  if (status === "unreviewed") {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
        Please verify
      </span>
    );
  }
  if (status === "manual_entry") {
    return (
      <span className="inline-flex items-center rounded-full bg-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-700">
        Manual entry
      </span>
    );
  }
  return null;
}

export function ReceiptRow({
  receipt,
  category,
}: {
  receipt: Receipt;
  category: Category | undefined;
}) {
  const lowConfidence =
    (receipt.vendor_confidence != null && receipt.vendor_confidence < 0.7) ||
    (receipt.amount_confidence != null && receipt.amount_confidence < 0.7) ||
    (receipt.category_confidence != null && receipt.category_confidence < 0.7);

  return (
    <div className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4">
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
    </div>
  );
}
