-- Sprint 4 "Lock It Down" (TASKS.md) / SECURITY.md lock-down sprint:
-- receipts + subscriptions restricted to auth.uid() = user_id; demo rows
-- (user_id IS NULL) stay readable by everyone, anonymous or signed in.
--
-- NOTE: this migration has NOT been applied automatically — applying it
-- requires DB owner / service_role privileges, which the anon key used to
-- build this app does not have. Run it via the Supabase SQL editor (or
-- `supabase db push` with an authenticated CLI) when ready to enforce
-- per-user isolation. Until then, v1's permissive 0001 policies remain
-- active and the app continues to work, just without DB-level isolation.

drop policy if exists "receipts_v1_read" on receipts;
create policy "receipts_lockdown_read" on receipts for select
  using (user_id is null or auth.uid() = user_id);

drop policy if exists "receipts_v1_write" on receipts;
create policy "receipts_lockdown_write" on receipts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "subscriptions_v1_read" on subscriptions;
create policy "subscriptions_lockdown_read" on subscriptions for select
  using (user_id is null or auth.uid() = user_id);

drop policy if exists "subscriptions_v1_write" on subscriptions;
create policy "subscriptions_lockdown_write" on subscriptions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
