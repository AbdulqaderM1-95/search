-- ============================================================
-- EZsearch — initial schema
-- ============================================================

-- ── iphone_models ──────────────────────────────────────────
create table public.iphone_models (
  id           uuid primary key default gen_random_uuid(),
  model_name   text not null,
  storage_options text[] not null default '{}',
  image_url    text,
  updated_at   timestamptz not null default now()
);

-- ── shops ──────────────────────────────────────────────────
create table public.shops (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null,
  area                 text,
  phone                text,
  instagram_handle     text,
  instagram_url        text,
  reach_url            text,
  logo_url             text,
  is_authorised_reseller boolean not null default false
);

-- ── prices ─────────────────────────────────────────────────
create table public.prices (
  id             uuid primary key default gen_random_uuid(),
  shop_id        uuid not null references public.shops(id) on delete cascade,
  model_id       uuid not null references public.iphone_models(id) on delete cascade,
  storage_option text not null,
  price_kwd      numeric(10,3) not null,
  in_stock       boolean not null default true,
  updated_at     timestamptz not null default now(),
  unique (shop_id, model_id, storage_option)
);

-- ── price_history ───────────────────────────────────────────
create table public.price_history (
  id             uuid primary key default gen_random_uuid(),
  shop_id        uuid not null references public.shops(id) on delete cascade,
  model_id       uuid not null references public.iphone_models(id) on delete cascade,
  storage_option text not null,
  price_kwd      numeric(10,3) not null,
  recorded_at    timestamptz not null default now()
);

create index on public.price_history (shop_id, model_id, storage_option, recorded_at desc);

-- Auto-log price changes to history
create or replace function public.record_price_history()
returns trigger language plpgsql as $$
begin
  if (TG_OP = 'INSERT') or (OLD.price_kwd is distinct from NEW.price_kwd) then
    insert into public.price_history (shop_id, model_id, storage_option, price_kwd)
    values (NEW.shop_id, NEW.model_id, NEW.storage_option, NEW.price_kwd);
  end if;
  return NEW;
end;
$$;

create trigger prices_history_trigger
after insert or update on public.prices
for each row execute function public.record_price_history();

-- ── saved_alerts (watchlist) ───────────────────────────────
create table public.saved_alerts (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  shop_id        uuid not null references public.shops(id) on delete cascade,
  model_id       uuid not null references public.iphone_models(id) on delete cascade,
  storage_option text not null,
  price_at_save  numeric(10,3) not null,
  saved_at       timestamptz not null default now(),
  unique (user_id, shop_id, model_id, storage_option)
);

-- ── profiles (role + disabled flag) ───────────────────────
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  role       text not null default 'user' check (role in ('user','admin')),
  disabled   boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (NEW.id);
  return NEW;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ── audit_log ──────────────────────────────────────────────
create table public.audit_log (
  id           uuid primary key default gen_random_uuid(),
  admin_id     uuid not null references auth.users(id),
  action       text not null,
  target_table text not null,
  target_id    text not null,
  created_at   timestamptz not null default now()
);

-- ── Row Level Security ─────────────────────────────────────
alter table public.iphone_models  enable row level security;
alter table public.shops           enable row level security;
alter table public.prices          enable row level security;
alter table public.price_history   enable row level security;
alter table public.saved_alerts    enable row level security;
alter table public.profiles        enable row level security;
alter table public.audit_log       enable row level security;

-- Public read for catalogue tables
create policy "public read iphone_models"  on public.iphone_models  for select using (true);
create policy "public read shops"           on public.shops           for select using (true);
create policy "public read prices"          on public.prices          for select using (true);
create policy "public read price_history"   on public.price_history   for select using (true);

-- Saved alerts: users manage their own rows
create policy "own alerts select" on public.saved_alerts for select using (auth.uid() = user_id);
create policy "own alerts insert" on public.saved_alerts for insert with check (auth.uid() = user_id);
create policy "own alerts delete" on public.saved_alerts for delete using (auth.uid() = user_id);

-- Helper: security definer so it can read profiles without RLS recursion
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  );
$$;

-- Profiles: users read their own; admins read all
create policy "own profile" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

-- Admins can update profiles (disable/enable users)
create policy "admin update profiles" on public.profiles
  for update using (public.is_admin());

-- Admins can write catalogue data (prices, shops, models)
create policy "admin write prices"       on public.prices          for all using (public.is_admin());
create policy "admin write shops"        on public.shops           for all using (public.is_admin());
create policy "admin write models"       on public.iphone_models   for all using (public.is_admin());
create policy "admin write price_history" on public.price_history  for all using (public.is_admin());

-- ── Seed data ──────────────────────────────────────────────

-- iPhone models
insert into public.iphone_models (model_name, storage_options) values
  ('iPhone 17',         array['128 GB','256 GB','512 GB','1 TB']),
  ('iPhone 17 Pro',     array['128 GB','256 GB','512 GB','1 TB']),
  ('iPhone 17 Pro Max', array['256 GB','512 GB','1 TB']);

-- Shops
insert into public.shops (name, phone, instagram_handle, instagram_url, reach_url, is_authorised_reseller) values
  ('Xcite',           '+965 1803 535',  '@xcitealghanim',  'https://www.instagram.com/xcitealghanim?igsh=N3d4emN5anBrYmIx',       'https://reach.link/xcitealghanim',    true),
  ('Blink',           '1800081',        '@blinkcomkw',     'https://www.instagram.com/blinkcomkw?igsh=MWpqNWNscnY1NDhtbQ==',      'https://maps.app.goo.gl/srprFrMLDd1fsdzS8', false),
  ('Eureka',          '+965 2576 1100', '@eurekakuwait',   'https://www.instagram.com/eurekakuwait?igsh=c3kzejliMXltdW91',        'https://links.eureka.com.kw',         false),
  ('Best Al-Yousifi', '+965 1809 809',  '@bestalyousifi',  'https://www.instagram.com/bestalyousifi?igsh=MXJzaWl4anEwOWZkbA==',  'https://reach.link/bestalyousifi',    true);
