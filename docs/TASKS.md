# Tasks & Sprints

## Sprint 1 — DB + Demo Shell (Days 1–2)
**Goal:** App loads with real seed data; core tables exist; no login wall.
- Create Supabase project; run migration SQL (receipts, categories, subscriptions, audit_logs)
- Seed 5 demo receipts across 4 categories
- Build receipt list page (`/`) showing vendor, date, amount, category badge
- Handle loading / empty / error states on list
- Deploy to Vercel (public, no auth gate)

**Definition of Done:** Visiting `/` shows 5 demo receipts with correct data from DB. Refresh is stable. No login prompt.

---

## Sprint 2 — Core Engine: Scan + Extract (Days 3–4) ✅ v1 functional milestone
**Goal:** Upload a receipt → AI extracts fields → row saved → user can edit.
- Build upload widget (drag-and-drop + file picker)
- `/api/receipts/scan` route: upload image to Supabase Storage → call OpenAI Vision → write receipts row
- Rule-based category fallback when AI confidence < 0.6
- Show extracted fields immediately after scan; yellow badge on low-confidence fields
- Inline edit form for vendor, date, amount, category → PATCH `/api/receipts/[id]` → DB updated
- All five UI states: loading (spinner), empty ("Upload your first receipt"), partial (fields populating), error ("Extraction failed — enter manually"), ready
- Write audit_log row on every edit

**Definition of Done:** Upload real receipt → vendor/date/amount appear in list → edit one field → refresh → edited value persists. Low-confidence badge shows when score < 0.7.

---

## Sprint 3 — Stripe Checkout + Subscription (Days 5–6)
**Goal:** Paid tier works end-to-end with real money.
- Add "Upgrade to Pro" button (disabled for already-subscribed users)
- `/api/stripe/checkout` route → Stripe Checkout session → redirect
- Stripe webhook `/api/stripe/webhook` → verify signature → upsert subscriptions row
- Free tier limited to 5 scans/month (enforced server-side)
- Success / cancel redirect pages
- Show subscription badge in header

**Definition of Done:** Click Upgrade → Stripe checkout loads → complete test payment → subscription row status = 'active' in DB → Pro badge appears. Webhook failure logs an error; client redirect alone does NOT update subscription.

---

## Sprint 4 — Lock It Down: Auth + Per-User RLS (Days 7–8)
**Goal:** Real users sign up; each user sees only their own receipts.
- Enable Supabase Auth (email + magic link)
- Sign-up / login pages; redirect after auth
- Update RLS: receipts + subscriptions scoped to `auth.uid() = user_id`; demo rows (user_id IS NULL) readable by all
- Associate new receipts and subscriptions to `auth.uid()`
- Gate scan endpoint: unauthenticated users see demo only; prompt to sign up

**Definition of Done:** Two test accounts each see only their own receipts. Demo rows visible to anonymous visitors. Supabase RLS policy blocks cross-user reads — confirmed by direct Supabase query with wrong JWT.

---

## Gantt (text)
```
Day 1-2   Sprint 1  DB + Demo Shell
Day 3-4   Sprint 2  Scan + Extract  ← v1 functional
Day 5-6   Sprint 3  Stripe Checkout
Day 7-8   Sprint 4  Auth + Lock Down
```