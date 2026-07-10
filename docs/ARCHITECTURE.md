# Architecture

## Stack
- **Frontend:** Next.js 14 (App Router) + Tailwind CSS
- **Backend:** Next.js API routes (edge-compatible)
- **Database + Auth:** Supabase (Postgres + Storage + RLS)
- **AI extraction:** OpenAI GPT-4o Vision via server-side API route
- **Payments:** Stripe Checkout + Stripe Webhooks
- **Hosting:** Vercel

## Now vs Later
**Now (v1):** receipt upload → AI extraction → category auto-tag → manual correction → paid tier checkout
**Next:** CSV export, monthly summary email, category budget alerts
**Later:** mobile camera shortcut, team workspaces, accounting integrations (QuickBooks, Xero)

## Key User Action — Step by Step
1. User drops a receipt image on the upload widget
2. Browser POSTs image to `/api/receipts/scan` (server route)
3. Server uploads image to Supabase Storage, gets public URL
4. Server sends image URL to OpenAI Vision — receives vendor, date, amount, category JSON
5. Server writes a `receipts` row with AI fields + confidence scores + `review_status = 'unreviewed'`
6. Frontend polls / revalidates — receipt appears in the list
7. User edits any field → PATCH `/api/receipts/[id]` → DB updated, `review_status = 'reviewed'`
8. User clicks Upgrade → POST `/api/stripe/checkout` → redirected to Stripe → webhook sets `subscriptions.status = 'active'`

## Layer Plan
1. **Data first** — tables, RLS, seed rows; app renders without AI
2. **App logic** — upload, CRUD, Stripe webhook
3. **Smart features** — OpenAI extraction, category confidence, auto-tagging

## Core Without AI
If OpenAI is unavailable, the receipt row is created with blank extraction fields and `review_status = 'manual_entry'` — user fills fields by hand. Nothing breaks.