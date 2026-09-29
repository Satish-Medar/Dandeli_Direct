create table if not exists public.booking_requests (
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

create index if not exists booking_requests_status_created_idx
  on public.booking_requests (status, created_at desc);

alter table public.booking_requests enable row level security;