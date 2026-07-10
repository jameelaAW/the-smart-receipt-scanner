# Agentic Layer

## Risk Levels & Actions

### Low Risk — Auto-execute (no approval needed)
- Extract vendor, date, amount from receipt image
- Auto-assign category based on vendor keyword rules
- Set `review_status = 'unreviewed'` on new receipts
- Flag low-confidence extractions with a UI badge

### Medium Risk — Show draft, user confirms
- Suggest a category change when user edits vendor name ("Did you mean Office Supplies?")
- Generate a monthly expense summary draft

### High Risk — Explicit user action required
- Initiate Stripe checkout (user must click "Upgrade" button)
- Send any email notification

### Critical — Human-only, never automated
- Issue a refund
- Delete a receipt permanently
- Change subscription plan on behalf of user

## Named Tools (approved list)
- `scan_receipt(image_url)` → calls OpenAI Vision, returns extraction JSON
- `assign_category(vendor, amount)` → runs keyword rules, returns category_id + confidence
- `create_stripe_checkout(user_id, plan)` → returns Stripe session URL
- `update_subscription_status(stripe_event)` → webhook handler, sets subscriptions row

## Audit Log Fields
Every meaningful action writes to `audit_logs`: `id`, `user_id`, `action`, `object_type`, `object_id`, `old_value`, `new_value`, `source` ('user' | 'ai'), `created_at`.

## v1
Only `scan_receipt` and `assign_category` run automatically. Everything else requires explicit user action.