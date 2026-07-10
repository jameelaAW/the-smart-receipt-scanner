-- Requested addition: two more expense categories beyond the original PRD set.
insert into categories (id, name, icon) values
  ('11111111-1111-1111-1111-111111111107', 'Rent', '🏠'),
  ('11111111-1111-1111-1111-111111111108', 'Local Transport', '🚌')
on conflict (id) do nothing;
