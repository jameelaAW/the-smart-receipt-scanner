import type { Receipt } from "@/lib/types";

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
