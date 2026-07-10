# Test Plan

## v1 Success Scenario (walk every step)
1. Open `/` as anonymous visitor → 5 demo receipts visible, totals shown per category
2. Click "Upload Receipt" → file picker opens
3. Upload a real receipt JPEG → spinner appears → within 10s vendor/date/amount/category populate
4. Verify row exists in Supabase `receipts` table with correct values and `review_status = 'unreviewed'`
5. Click vendor field → edit to corrected name → save → refresh page → corrected name persists
6. Confirm `audit_logs` has one row for the edit with old + new value
7. Click "Upgrade to Pro" → Stripe test checkout loads with correct plan/price
8. Complete checkout with Stripe test card `4242 4242 4242 4242` → redirect to `/success`
9. Check `subscriptions` table → status = 'active', stripe_customer_id populated
10. Pro badge appears in header without manual refresh (webhook fired)

## Empty States
- New account with zero receipts → shows "Upload your first receipt" prompt with upload CTA, not blank page

## Error Cases
- Upload a non-image file (PDF, txt) → friendly error: "Please upload a JPG or PNG"
- OpenAI timeout or error → receipt row created with blank fields + `review_status = 'manual_entry'` + banner: "Auto-extraction failed — please enter details manually"
- Stripe webhook arrives with invalid signature → 400 returned, no DB write, error logged
- User hits free-tier scan limit → "You've used your 5 free scans — upgrade to continue" message; scan endpoint returns 403

## Regression Check (run after every sprint)
- Demo receipts still load for anonymous visitor
- Previously edited fields still show correct values
- Stripe webhook endpoint still rejects tampered payloads