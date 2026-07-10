// Rule-based category fallback — INTELLIGENCE_LAYER.md "Auto-Categorization Rules"
const RULES: { keywords: string[]; category: string }[] = [
  { keywords: ["starbucks", "peet's", "peets", "coffee"], category: "Client Meeting" },
  { keywords: ["staples", "office depot"], category: "Office Supplies" },
  { keywords: ["delta", "united", "uber", "lyft"], category: "Travel" },
  { keywords: ["restaurant", "grill", "café", "cafe"], category: "Meals & Entertainment" },
  { keywords: ["amazon", "best buy"], category: "Equipment" },
  { keywords: ["rent", "landlord", "property management", "lease"], category: "Rent" },
  { keywords: ["taxi", "cab", "metro", "subway", "bus fare", "parking", "toll"], category: "Local Transport" },
];

export const UNCATEGORIZED = "Uncategorized";

export function ruleBasedCategory(vendor: string | null | undefined): string {
  if (!vendor) return UNCATEGORIZED;
  const v = vendor.toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some((k) => v.includes(k))) return rule.category;
  }
  return UNCATEGORIZED;
}

/**
 * assign_category(vendor, amount) — named tool from AGENTIC_LAYER.md.
 * AI suggestion wins when confident; otherwise the keyword rules run,
 * per INTELLIGENCE_LAYER.md: "If AI confidence < 0.6 -> rule-based fallback".
 */
export function assignCategory({
  vendor,
  aiSuggestedCategory,
  aiConfidence,
}: {
  vendor: string | null | undefined;
  aiSuggestedCategory?: string | null;
  aiConfidence?: number | null;
}): { name: string; source: "ai" | "manual"; confidence: number } {
  if (aiSuggestedCategory && aiConfidence != null && aiConfidence >= 0.6) {
    return { name: aiSuggestedCategory, source: "ai", confidence: aiConfidence };
  }
  return { name: ruleBasedCategory(vendor), source: "manual", confidence: 1 };
}
