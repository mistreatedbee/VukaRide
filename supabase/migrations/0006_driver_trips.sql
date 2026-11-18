-- Driver trips and earnings. Run after 0005 in the Supabase SQL editor.
--
-- The driver app (or its backend, using the service-role key) WRITES trips. The portal only READS them:
-- a driver sees their own trips, nobody can insert, change or delete through the portal. Money is stored in
-- cents (ZAR) as whole numbers. Net earnings for a trip = fare - platform fee + tip.
-- Adjust the columns to match the real trip data when the app is added to this project.

create table if not exists public.driver_trips (
  id                 uuid primary key default gen_random_uuid(),
  driver_id          uuid not null references public.profiles (id) on delete cascade,
  status             text not null default 'completed' check (status in ('completed', 'cancelled')),
  started_at         timestamptz not null,
  completed_at       timestamptz,
  pickup             text not null default '',
  dropoff            text not null default '',
  distance_km        numeric(7, 1) check (distance_km is null or distance_km >= 0),
  fare_cents         integer not null check (fare_cents >= 0),
  platform_fee_cents integer not null default 0 check (platform_fee_cents >= 0),
  tip_cents          integer not null default 0 check (tip_cents >= 0),
  created_at         timestamptz not null default now()
);

create index if not exists driver_trips_driver_idx on public.driver_trips (driver_id, started_at desc);

alter table public.driver_trips enable row level security;
revoke all on public.driver_trips from anon, authenticated;
grant select on public.driver_trips to authenticated;

create policy "trips: read own" on public.driver_trips for select to authenticated
  using (driver_id = auth.uid());
