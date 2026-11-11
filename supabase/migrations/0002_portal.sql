-- Vuka Ride portal (driver + admin dashboards). Run after 0001 in the Supabase SQL editor.
--
-- Security model
--   * Supabase Auth (email one-time code / link). Every new user gets a `profiles` row with role 'driver'.
--   * The ONLY way to become an admin is to run the SQL in the "First admin" note at the bottom, as the
--     project owner. Nobody can change their own role: the app roles are not updatable by `authenticated`.
--   * Row level security is on for every table. Drivers see and edit only their own rows. Admins (is_admin())
--     can read everything and change review state only through the functions below, which write an audit_log row.
--   * Driver documents live in a PRIVATE storage bucket, one folder per user id, 10 MB, PDF/JPEG/PNG/WebP only.
--
-- Not included on purpose: trips, riders, fares, payouts. Those depend on the mobile app's data model and are
-- added once the app code is in the repo (see docs/platform-plan.md).

-- ---------------------------------------------------------------------------------------------- profiles
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  role        text not null default 'driver' check (role in ('driver', 'admin')),
  email       text,
  full_name   text,
  phone       text,
  created_at  timestamptz not null default now()
);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email) on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

create policy "profiles: read own or admin" on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());
create policy "profiles: update own" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- ---------------------------------------------------------------------------------------------- audit_log
create table if not exists public.audit_log (
  id           bigint generated always as identity primary key,
  created_at   timestamptz not null default now(),
  actor_id     uuid references auth.users (id) on delete set null,
  action       text not null,
  target_type  text not null,
  target_id    text not null,
  detail       jsonb not null default '{}'::jsonb
);
alter table public.audit_log enable row level security;
revoke all on public.audit_log from anon, authenticated;
grant select on public.audit_log to authenticated;
create policy "audit_log: admins read" on public.audit_log for select to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------------------------- driver_applications
create table if not exists public.driver_applications (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null unique references auth.users (id) on delete cascade,
  status             text not null default 'draft'
                       check (status in ('draft', 'submitted', 'in_review', 'needs_info', 'approved', 'rejected')),
  full_name          text,
  mobile             text,
  email              text,
  city               text,
  other_city         text,
  vehicle            text,
  vehicle_year       text,
  plate              text,
  licence_confirmed  boolean not null default false,
  terms_accepted     boolean not null default false,
  submitted_at       timestamptz,
  reviewed_at        timestamptz,
  reviewed_by        uuid references auth.users (id) on delete set null,
  review_note        text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists driver_applications_status_idx on public.driver_applications (status, updated_at desc);

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists driver_applications_touch on public.driver_applications;
create trigger driver_applications_touch before update on public.driver_applications for each row execute function public.touch_updated_at();

alter table public.driver_applications enable row level security;
revoke all on public.driver_applications from anon, authenticated;
grant select on public.driver_applications to authenticated;
-- Drivers can write only the details columns. status and the review_* columns are changed by the functions below.
grant insert (user_id, full_name, mobile, email, city, other_city, vehicle, vehicle_year, plate, licence_confirmed, terms_accepted)
  on public.driver_applications to authenticated;
grant update (full_name, mobile, email, city, other_city, vehicle, vehicle_year, plate, licence_confirmed, terms_accepted)
  on public.driver_applications to authenticated;

create policy "applications: read own or admin" on public.driver_applications for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy "applications: create own" on public.driver_applications for insert to authenticated
  with check (user_id = auth.uid());
create policy "applications: edit own while open" on public.driver_applications for update to authenticated
  using (user_id = auth.uid() and status in ('draft', 'needs_info'))
  with check (user_id = auth.uid() and status in ('draft', 'needs_info'));

-- Driver sends the application for review. Required details must be filled in.
create or replace function public.submit_my_application() returns public.driver_applications
language plpgsql security definer set search_path = public as $$
declare app public.driver_applications;
begin
  select * into app from public.driver_applications where user_id = auth.uid() for update;
  if not found then raise exception 'No application found'; end if;
  if app.status not in ('draft', 'needs_info') then raise exception 'This application can no longer be edited'; end if;
  if coalesce(app.full_name, '') = '' or coalesce(app.mobile, '') = '' or coalesce(app.email, '') = ''
     or coalesce(app.city, '') = '' or coalesce(app.vehicle, '') = '' or coalesce(app.vehicle_year, '') = ''
     or coalesce(app.plate, '') = '' or not app.licence_confirmed or not app.terms_accepted then
    raise exception 'Please complete all required details first';
  end if;
  update public.driver_applications
     set status = 'submitted', submitted_at = now(), review_note = null
   where id = app.id returning * into app;
  insert into public.audit_log (actor_id, action, target_type, target_id) values (auth.uid(), 'application.submitted', 'application', app.id::text);
  return app;
end $$;
revoke all on function public.submit_my_application() from public, anon;
grant execute on function public.submit_my_application() to authenticated;

-- Admin decision on an application. A note is required when asking for more information or rejecting.
create or replace function public.review_application(app_id uuid, new_status text, note text default null)
returns public.driver_applications
language plpgsql security definer set search_path = public as $$
declare app public.driver_applications;
begin
  if not public.is_admin() then raise exception 'Not allowed'; end if;
  if new_status not in ('in_review', 'needs_info', 'approved', 'rejected') then raise exception 'Invalid status'; end if;
  if new_status in ('needs_info', 'rejected') and coalesce(btrim(note), '') = '' then raise exception 'A note is required'; end if;
  update public.driver_applications
     set status = new_status, review_note = nullif(btrim(note), ''), reviewed_at = now(), reviewed_by = auth.uid()
   where id = app_id and status <> 'draft' returning * into app;
  if not found then raise exception 'Application not found or still a draft'; end if;
  insert into public.audit_log (actor_id, action, target_type, target_id, detail)
    values (auth.uid(), 'application.' || new_status, 'application', app.id::text, jsonb_build_object('note', nullif(btrim(note), '')));
  return app;
end $$;
revoke all on function public.review_application(uuid, text, text) from public, anon;
grant execute on function public.review_application(uuid, text, text) to authenticated;

-- ---------------------------------------------------------------------------------------------- driver_documents
create table if not exists public.driver_documents (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  kind          text not null check (kind in (
                  'licence', 'prdp', 'id', 'criminal_record', 'proof_of_address', 'selfie',
                  'bank_proof', 'vehicle_registration', 'insurance', 'operating_licence')),
  storage_path  text not null unique,
  file_name     text not null,
  status        text not null default 'uploaded' check (status in ('uploaded', 'accepted', 'rejected')),
  note          text,
  created_at    timestamptz not null default now()
);
create index if not exists driver_documents_user_idx on public.driver_documents (user_id, created_at desc);

alter table public.driver_documents enable row level security;
revoke all on public.driver_documents from anon, authenticated;
grant select, delete on public.driver_documents to authenticated;
grant insert (user_id, kind, storage_path, file_name) on public.driver_documents to authenticated;

create policy "documents: read own or admin" on public.driver_documents for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy "documents: add own" on public.driver_documents for insert to authenticated
  with check (user_id = auth.uid() and storage_path like auth.uid()::text || '/%');
create policy "documents: delete own unless accepted" on public.driver_documents for delete to authenticated
  using (user_id = auth.uid() and status <> 'accepted');

create or replace function public.review_document(doc_id uuid, new_status text, note text default null)
returns public.driver_documents
language plpgsql security definer set search_path = public as $$
#variable_conflict use_variable
declare doc public.driver_documents;
begin
  if not public.is_admin() then raise exception 'Not allowed'; end if;
  if new_status not in ('accepted', 'rejected') then raise exception 'Invalid status'; end if;
  if new_status = 'rejected' and coalesce(btrim(note), '') = '' then raise exception 'A note is required'; end if;
  update public.driver_documents set status = new_status, note = nullif(btrim(note), '') where id = doc_id returning * into doc;
  if not found then raise exception 'Document not found'; end if;
  insert into public.audit_log (actor_id, action, target_type, target_id, detail)
    values (auth.uid(), 'document.' || new_status, 'document', doc.id::text, jsonb_build_object('kind', doc.kind, 'note', nullif(btrim(note), '')));
  return doc;
end $$;
revoke all on function public.review_document(uuid, text, text) from public, anon;
grant execute on function public.review_document(uuid, text, text) to authenticated;

-- ---------------------------------------------------------------------------------------------- storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('driver-documents', 'driver-documents', false, 10485760, array['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "driver-documents: upload to own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'driver-documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "driver-documents: read own or admin" on storage.objects for select to authenticated
  using (bucket_id = 'driver-documents' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
create policy "driver-documents: delete own" on storage.objects for delete to authenticated
  using (bucket_id = 'driver-documents' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------------------------------------------------------------------------------------------- website form inbox (from 0001)
-- Admins read the website submissions and mark them done. ip_hash is deliberately not readable.
grant select (id, created_at, kind, payload, status) on public.form_submissions to authenticated;
grant update (status) on public.form_submissions to authenticated;
create policy "form_submissions: admins read" on public.form_submissions for select to authenticated using (public.is_admin());
create policy "form_submissions: admins update status" on public.form_submissions for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------------------------- First admin
-- After you sign in once with your own email, promote yourself (run as the project owner in the SQL editor):
--   update public.profiles set role = 'admin' where email = 'you@example.com';
