import type { Category } from "@/lib/types";

export function CategoryBadge({ category }: { category: Category | null | undefined }) {
  if (!category) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-500">
        Uncategorized
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700">
      <span>{category.icon}</span>
      {category.name}
    </span>
  );
}
