create extension if not exists pgcrypto;

create type public.user_role as enum ('GUEST', 'OWNER', 'ADMIN');
create type public.booking_status as enum ('HELD', 'PAID', 'CHECKED_IN', 'CANCELLED');
create type public.escrow_status as enum ('HELD', 'RELEASED');

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  phone text unique,
  role public.user_role not null default 'GUEST',
  created_at timestamptz not null default now()
);

create table public.properties (
  property_id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  alias text not null,
  exact_name text not null,
  manager_phone text not null,
  location text not null,
  image_url text,
  river_distance text,
  signal text,
  rating numeric(2,1),
  wholesale_rate integer not null check (wholesale_rate >= 0),
  direct_rack_rate integer not null check (direct_rack_rate >= wholesale_rate),
  is_verified boolean not null default false,
  is_masked boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.rooms (
  room_id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(property_id) on delete cascade,
  room_type text not null,
  max_capacity integer not null check (max_capacity > 0),
  total_units integer not null default 1 check (total_units > 0),
  active boolean not null default true
);

create table public.activities (
  activity_id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  detail text not null,
  price_per_guest integer not null check (price_per_guest >= 0),
  total_capacity integer not null check (total_capacity > 0),
  active boolean not null default true
);

create table public.bookings (
  booking_id uuid primary key default gen_random_uuid(),
  guest_id uuid references auth.users(id),
  property_id uuid not null references public.properties(property_id),
  room_id uuid not null references public.rooms(room_id),
  guest_name text not null,
  guest_phone text,
  check_in date not null,
  check_out date not null,
  guests integer not null check (guests > 0),
  nights integer not null check (nights > 0),
  total_amount integer not null check (total_amount >= 0),
  deposit_amount integer not null check (deposit_amount >= 0),
  platform_fee integer not null check (platform_fee >= 0),
  status public.booking_status not null default 'HELD',
  is_unlocked boolean not null default false,
  qr_hash text unique,
  created_at timestamptz not null default now(),
  constraint valid_booking_dates check (check_out > check_in)
);

create table public.booking_requests (
  request_id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(property_id),
  guest_name text not null,
  guest_phone text not null,
  check_in date not null,
  check_out date not null,
  guests integer not null check (guests between 1 and 16),
  nights integer not null check (nights between 1 and 30),
  nightly_rate integer not null check (nightly_rate >= 0),
  activity_ids text[] not null default '{}',
  stay_amount integer not null check (stay_amount >= 0),
  meal_amount integer not null check (meal_amount >= 0),
  activities_amount integer not null check (activities_amount >= 0),
  platform_fee integer not null check (platform_fee >= 0),
  estimated_amount integer not null check (estimated_amount >= 0),
  status text not null default 'REQUESTED'
    check (status in ('REQUESTED', 'CONFIRMED', 'DECLINED', 'CANCELLED')),
  created_at timestamptz not null default now(),
  constraint valid_booking_request_dates check (check_out > check_in)
);

create index booking_requests_status_created_idx
  on public.booking_requests (status, created_at desc);

alter table public.booking_requests enable row level security;

create table public.booking_items (
  booking_item_id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(booking_id) on delete cascade,
  activity_id uuid references public.activities(activity_id),
  item_name text not null,
  quantity integer not null check (quantity > 0),
  unit_amount integer not null check (unit_amount >= 0),
  total_amount integer not null check (total_amount >= 0)
);

create table public.escrow_ledger (
  ledger_id uuid primary key default gen_random_uuid(),
  booking_id uuid unique not null references public.bookings(booking_id) on delete cascade,
  partner_payout_amount integer not null check (partner_payout_amount >= 0),
  platform_commission integer not null check (platform_commission >= 0),
  status public.escrow_status not null default 'HELD',
  created_at timestamptz not null default now(),
  released_at timestamptz
);

create table public.inventory_locks (
  lock_key text primary key,
  room_id uuid not null references public.rooms(room_id) on delete cascade,
  check_in date not null,
  check_out date not null,
  lock_token uuid unique not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index bookings_dates_idx on public.bookings (room_id, check_in, check_out);
create index inventory_locks_expiry_idx on public.inventory_locks (expires_at);

create or replace function public.acquire_inventory_lock(
  p_room_id uuid,
  p_check_in date,
  p_check_out date,
  p_ttl_seconds integer default 600
) returns table(lock_token uuid, expires_at timestamptz)
language plpgsql security definer set search_path = public
as $$
declare
  v_key text := p_room_id::text || ':' || p_check_in::text || ':' || p_check_out::text;
  v_token uuid := gen_random_uuid();
  v_expiry timestamptz := now() + make_interval(secs => p_ttl_seconds);
begin
  insert into inventory_locks(lock_key, room_id, check_in, check_out, lock_token, expires_at)
  values (v_key, p_room_id, p_check_in, p_check_out, v_token, v_expiry)
  on conflict (lock_key) do update set lock_token = excluded.lock_token, expires_at = excluded.expires_at
  where inventory_locks.expires_at <= now();
  if found then return query select v_token, v_expiry; end if;
  return;
end;
$$;

create or replace function public.validate_inventory_lock(p_token uuid)
returns boolean language sql security definer set search_path = public
as $$ select exists(select 1 from inventory_locks where lock_token = p_token and expires_at > now()); $$;

insert into public.properties (property_id, slug, alias, exact_name, manager_phone, location, image_url, river_distance, signal, rating, wholesale_rate, direct_rack_rate, is_verified)
values
  ('00000000-0000-0000-0000-000000000001', 'riverfront-02', 'Ganeshgudi Riverfront #02', 'Kali River Canopy Retreat', '+91 98452 77120', 'Near Kali River · 2.4 km', 'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1200&q=85', '2.4 km to river', '4G signal', 4.8, 3600, 4800, true),
  ('00000000-0000-0000-0000-000000000002', 'jungle-04', 'Eco-Jungle Homestay #04', 'Kogilban Forest House', '+91 99801 44321', 'Kogilban · 5.1 km', 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=85', '5.1 km to river', 'Limited signal', 4.7, 2850, 3900, true),
  ('00000000-0000-0000-0000-000000000003', 'camp-07', 'Bison Valley Camp #07', 'Bison Valley Wilderness Camp', '+91 99018 61244', 'Dandeli forest edge · 7.8 km', 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=85', '7.8 km to river', '4G signal', 4.6, 2400, 3400, true)
on conflict (slug) do nothing;

insert into public.rooms (room_id, property_id, room_type, max_capacity, total_units)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Forest room', 4, 3),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Forest room', 4, 3),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'Forest room', 4, 3)
on conflict (room_id) do nothing;

alter table public.properties enable row level security;
create policy "verified properties are public" on public.properties for select using (is_verified = true);
alter table public.activities enable row level security;
create policy "active activities are public" on public.activities for select using (active = true);
