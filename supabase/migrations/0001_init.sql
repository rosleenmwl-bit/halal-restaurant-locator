create table if not exists cuisines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  name text not null unique
);

alter table cuisines enable row level security;
drop policy if exists "cuisines_v1_read" on cuisines;
create policy "cuisines_v1_read" on cuisines for select using (true);
drop policy if exists "cuisines_v1_write" on cuisines;
create policy "cuisines_v1_write" on cuisines for all using (true) with check (true);

create table if not exists restaurants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  name text not null,
  city text not null,
  country text not null,
  address text,
  cuisine_id uuid references cuisines(id),
  halal_status text not null default 'halal-certified',
  signature_dish text,
  price_range text,
  average_rating numeric,
  review_count integer default 0,
  description text,
  phone text,
  website text,
  google_maps_url text,
  image_url text,
  is_published boolean not null default true,
  halal_status_source text,
  halal_status_confidence numeric,
  halal_status_review_status text default 'unreviewed'
);

alter table restaurants enable row level security;
drop policy if exists "restaurants_v1_read" on restaurants;
create policy "restaurants_v1_read" on restaurants for select using (true);
drop policy if exists "restaurants_v1_write" on restaurants;
create policy "restaurants_v1_write" on restaurants for all using (true) with check (true);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  action text not null,
  target_table text not null,
  target_id uuid,
  payload jsonb
);

alter table audit_logs enable row level security;
drop policy if exists "audit_logs_v1_read" on audit_logs;
create policy "audit_logs_v1_read" on audit_logs for select using (true);
drop policy if exists "audit_logs_v1_write" on audit_logs;
create policy "audit_logs_v1_write" on audit_logs for all using (true) with check (true);

insert into cuisines (id, name) values
  ('a1000000-0000-0000-0000-000000000001', 'Middle Eastern'),
  ('a1000000-0000-0000-0000-000000000002', 'South Asian'),
  ('a1000000-0000-0000-0000-000000000003', 'Turkish'),
  ('a1000000-0000-0000-0000-000000000004', 'Malaysian'),
  ('a1000000-0000-0000-0000-000000000005', 'Mediterranean')
on conflict (name) do nothing;

insert into restaurants (name, city, country, address, cuisine_id, halal_status, signature_dish, price_range, average_rating, review_count, description, image_url, is_published, halal_status_source, halal_status_confidence, halal_status_review_status) values
  ('Al Baik', 'Jeddah', 'Saudi Arabia', 'King Abdulaziz Road, Jeddah', 'a1000000-0000-0000-0000-000000000001', 'halal-certified', 'Broasted Chicken', '£', 4.7, 3200, 'Iconic Saudi fast-food chain beloved for crispy broasted chicken. Halal-certified and family friendly.', 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=800', true, 'owner-verified', 1.0, 'reviewed'),
  ('Dishoom', 'London', 'United Kingdom', '12 Upper St Martin''s Lane, London WC2H 9FB', 'a1000000-0000-0000-0000-000000000002', 'halal-certified', 'Black Dal', '££', 4.6, 8900, 'Bombay-style café serving halal meat. Famous for the rich, slow-cooked black dal and fluffy naan.', 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800', true, 'owner-verified', 0.95, 'reviewed'),
  ('Karaköy Güllüoğlu', 'Istanbul', 'Turkey', 'Rıhtım Caddesi No:3, Karaköy, Istanbul', 'a1000000-0000-0000-0000-000000000003', 'halal-certified', 'Pistachio Baklava', '£', 4.8, 5100, 'Historic baklava shop in Karaköy. A must-visit for anyone with a sweet tooth — pistachios are fresh daily.', 'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=800', true, 'owner-verified', 1.0, 'reviewed'),
  ('Nasi Kandar Pelita', 'Kuala Lumpur', 'Malaysia', 'Jalan Ampang, Kuala Lumpur 50450', 'a1000000-0000-0000-0000-000000000004', 'halal-certified', 'Nasi Kandar with Fish Curry', '£', 4.4, 2700, '24-hour halal-certified Malaysian mamak restaurant. Iconic for its mix-and-match curry nasi kandar.', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800', true, 'owner-verified', 1.0, 'reviewed'),
  ('Maison Kayser', 'Paris', 'France', '8 Rue de l''Ancienne Comédie, 75006 Paris', 'a1000000-0000-0000-0000-000000000005', 'muslim-friendly', 'Croque Monsieur (halal option)', '££', 4.3, 1400, 'French bakery-café with dedicated halal meat options. Great for a Parisian breakfast without compromise.', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800', true, 'staff-research', 0.80, 'unreviewed');