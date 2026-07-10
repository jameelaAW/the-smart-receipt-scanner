# Smart Receipt Scanner — PRD

## Problem
Freelancers and small business owners accumulate physical receipts and lose track of which expense belongs to which client or category. Manual entry is slow, error-prone, and universally hated.

## Target User
Freelancers, consultants, and small business owners who need to log and categorize business expenses without an accountant.

## Core Objects
- **Receipt** — the scanned document: vendor, date, amount, category, image URL
- **Category** — e.g. Client Meeting, Office Supplies, Travel, Meals
- **User** — owner of receipts
- **Subscription** — paid tier status per user

## MVP Must-Haves
- [ ] Upload or snap a receipt image
- [ ] AI extracts: vendor name, date, total amount
- [ ] AI auto-assigns a spending category
- [ ] User can correct vendor, amount, date, or category
- [ ] Receipt list view with totals per category
- [ ] Stripe checkout for paid tier (unlocks unlimited scans)
- [ ] Seed demo receipts visible without login

## Non-Goals (v1)
- Multi-user teams / shared workspaces
- CSV/accounting export
- Mobile native app
- Receipt approval workflows
- Tax calculation

## Success Criteria
**End-to-end scenario:** A visitor lands on the app, sees demo receipts already categorized, uploads a real receipt image, watches the AI extract vendor + amount + category, corrects one field, then clicks "Upgrade" and completes a real Stripe payment — all without hitting a login wall until checkout.

## Definition of Done
A real receipt image uploaded → fields extracted and stored in DB → category auto-assigned → user edits one field → edit persists on refresh → Stripe payment completes → subscription status updated in DB. No step is faked or seeded-only.