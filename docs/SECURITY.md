# Security

## Secret Handling
- `OPENAI_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY` — stored in Vercel environment variables only, never in frontend bundles or client-side code
- All AI and Stripe calls happen in Next.js server-side API routes (`/api/*`)
- Supabase `anon` key is safe to expose; service role key is server-only

## Permission Model (v1 demo → lock-down)
- **v1:** RLS allows all reads and writes (demo-first; no sensitive user data yet)
- **Lock-down sprint:** `receipts` and `subscriptions` rows restricted to `auth.uid() = user_id`; unauthenticated users read only seeded demo rows (user_id IS NULL)
- Users can only access their own receipts — enforced at the DB layer, not just in code

## Approved Tools Rule
Agents and API routes may only call the four named tools in AGENTIC_LAYER.md. No `eval`, no dynamic SQL, no raw `run_any` style calls. Tool inputs are validated server-side before execution.

## Stripe Webhooks
- Webhook signature verified with `stripe.webhooks.constructEvent` before any DB write
- Subscription status is always set by the webhook, never by client-side redirect alone

## Audit Principle
Every field edit, AI extraction, category override, and subscription change writes an `audit_logs` row. Deletion is soft (flag only) until a human explicitly confirms. Nothing is silently discarded.