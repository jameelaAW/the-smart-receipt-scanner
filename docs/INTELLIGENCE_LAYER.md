# Intelligence Layer

## Messy Input
A crumpled receipt photo — skewed, low contrast, partial text.

## Extraction Schema (OpenAI Vision response → stored JSON)
```json
{
  "vendor": "Starbucks",
  "vendor_confidence": 0.97,
  "amount": 14.75,
  "amount_confidence": 0.91,
  "receipt_date": "2024-11-12",
  "receipt_date_confidence": 0.88,
  "suggested_category": "Client Meeting",
  "category_confidence": 0.85
}
```

## Auto-Categorization Rules (v1 — rule-based fallback always runs)
| Vendor keyword | → Category |
|---|---|
| Starbucks, Peet's, Coffee | Client Meeting |
| Staples, Office Depot | Office Supplies |
| Delta, United, Uber, Lyft | Travel |
| Restaurant, Grill, Café | Meals & Entertainment |
| Amazon, Best Buy | Equipment |

If AI confidence < 0.6 → rule-based fallback; if no rule matches → `Uncategorized`.

## Events to Track
- Receipt uploaded
- Extraction completed (with confidence scores)
- Field corrected by user (which field, old vs new value)
- Category override

## What Gets Ranked
- Receipts flagged `review_status = 'unreviewed'` surface first in the dashboard
- Low-confidence extractions (< 0.7) get a yellow "Please verify" badge

## v1 vs Later
- **v1:** GPT-4o Vision extraction + rule-based category fallback
- **Later:** fine-tune category model on user correction history; learn per-user vendor→category mappings