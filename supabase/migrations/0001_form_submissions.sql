-- Vuka Ride website forms. Run once in the Supabase SQL editor of the NEW project (not the one whose
-- password was shared in chat).
--
-- Only the Vercel function writes here, using the service-role key. Row level security is on and there
-- are no policies, so the public (anon) and signed-in keys can read and write nothing.

create table if not exists public.form_submissions (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  kind        text not null check (kind in ('driver-application', 'contact', 'delete-account', 'notify')),
  payload     jsonb not null,
  -- Salted SHA-256 of the visitor IP, used only for rate limiting. The raw IP is never stored.
  ip_hash     text not null,
  status      text not null default 'new' check (status in ('new', 'in_progress', 'done', 'spam'))
);

create index if not exists form_submissions_rate_idx on public.form_submissions (ip_hash, created_at desc);
create index if not exists form_submissions_kind_idx on public.form_submissions (kind, created_at desc);

alter table public.form_submissions enable row level security;
revoke all on public.form_submissions from anon, authenticated;

comment on table public.form_submissions is
  'Website form submissions (driver applications, contact, account deletion requests, launch sign-ups). Personal information: apply the retention periods in the Privacy Policy.';
