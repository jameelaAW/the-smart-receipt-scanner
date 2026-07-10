create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null,
  icon text,
  created_at timestamptz not null default now()
);

alter table categories enable row level security;
drop policy if exists "categories_v1_read" on categories;
create policy "categories_v1_read" on categories for select using (true);
drop policy if exists "categories_v1_write" on categories;
create policy "categories_v1_write" on categories for all using (true) with check (true);

insert into categories (id, name, icon) values
  ('11111111-1111-1111-1111-111111111101', 'Client Meeting', '☕'),
  ('11111111-1111-1111-1111-111111111102', 'Office Supplies', '🖊️'),
  ('11111111-1111-1111-1111-111111111103', 'Travel', '✈️'),
  ('11111111-1111-1111-1111-111111111104', 'Meals & Entertainment', '🍽️'),
  ('11111111-1111-1111-1111-111111111105', 'Equipment', '💻')
on conflict (id) do nothing;

create table if not exists receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  image_url text,
  vendor text,
  vendor_source text,
  vendor_confidence numeric,
  amount numeric,
  amount_source text,
  amount_confidence numeric,
  receipt_date date,
  receipt_date_source text,
  receipt_date_confidence numeric,
  category_id uuid references categories(id),
  category_source text,
  category_confidence numeric,
  review_status text default 'unreviewed',
  created_at timestamptz not null default now()
);

alter table receipts enable row level security;
drop policy if exists "receipts_v1_read" on receipts;
create policy "receipts_v1_read" on receipts for select using (true);
drop policy if exists "receipts_v1_write" on receipts;
create policy "receipts_v1_write" on receipts for all using (true) with check (true);

insert into receipts (id, user_id, image_url, vendor, vendor_source, vendor_confidence, amount, amount_source, amount_confidence, receipt_date, receipt_date_source, receipt_date_confidence, category_id, category_source, category_confidence, review_status) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', null, 'https://placehold.co/400x600?text=Starbucks', 'Starbucks', 'ai', 0.97, 14.75, 'ai', 0.93, '2024-11-12', 'ai', 0.91, '11111111-1111-1111-1111-111111111101', 'ai', 0.88, 'reviewed'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', null, 'https://placehold.co/400x600?text=Staples', 'Staples', 'ai', 0.95, 43.20, 'ai', 0.90, '2024-11-10', 'ai', 0.89, '11111111-1111-1111-1111-111111111102', 'ai', 0.91, 'reviewed'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', null, 'https://placehold.co/400x600?text=Uber', 'Uber', 'ai', 0.99, 22.50, 'ai', 0.97, '2024-11-09', 'ai', 0.95, '11111111-1111-1111-1111-111111111103', 'ai', 0.94, 'reviewed'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', null, 'https://placehold.co/400x600?text=Nobu', 'Nobu Restaurant', 'ai', 0.82, 187.00, 'ai', 0.79, '2024-11-07', 'ai', 0.85, '11111111-1111-1111-1111-111111111104', 'ai', 0.76, 'unreviewed'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', null, 'https://placehold.co/400x600?text=BestBuy', 'Best Buy', 'ai', 0.96, 329.99, 'ai', 0.95, '2024-11-05', 'ai', 0.93, '11111111-1111-1111-1111-111111111105', 'ai', 0.89, 'reviewed')
on conflict (id) do nothing;

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text default 'trialing',
  plan text default 'free',
  created_at timestamptz not null default now()
);

alter table subscriptions enable row level security;
drop policy if exists "subscriptions_v1_read" on subscriptions;
create policy "subscriptions_v1_read" on subscriptions for select using (true);
drop policy if exists "subscriptions_v1_write" on subscriptions;
create policy "subscriptions_v1_write" on subscriptions for all using (true) with check (true);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  action text not null,
  object_type text,
  object_id uuid,
  old_value text,
  new_value text,
  source text,
  created_at timestamptz not null default now()
);

alter table audit_logs enable row level security;
drop policy if exists "audit_logs_v1_read" on audit_logs;
create policy "audit_logs_v1_read" on audit_logs for select using (true);
drop policy if exists "audit_logs_v1_write" on audit_logs;
create policy "audit_logs_v1_write" on audit_logs for all using (true) with check (true);