-- INTELLIGENCE_LAYER.md: "if no rule matches -> Uncategorized". 0001 seeded the
-- five real categories but not the fallback bucket; add it here (data only, no
-- schema change).
insert into categories (id, name, icon) values
  ('11111111-1111-1111-1111-111111111106', 'Uncategorized', '❓')
on conflict (id) do nothing;
