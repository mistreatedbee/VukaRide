-- Driver bank details (for payouts). Run once, after 0001 to 0004.
--
-- These are sensitive. Rules:
--   * A driver can read and change only their own row.
--   * Admins have NO direct table access. They call get_driver_bank_details(), which needs two-step sign-in and
--     writes an audit row every time someone looks.
--   * Every insert or change writes an audit row (never the values themselves), so a redirected payout can be traced.
--   * The values are not encrypted beyond Supabase's disk encryption. If you want column level encryption (Supabase
--     Vault), add it before real payouts start. [Decision for the owner.]

create table if not exists public.driver_bank_details (
  user_id         uuid primary key references auth.users (id) on delete cascade,
  account_holder  text not null check (char_length(account_holder) between 2 and 120),
  bank_name       text not null check (char_length(bank_name) between 2 and 80),
  account_type    text not null check (account_type in ('cheque', 'savings', 'transmission')),
  account_number  text not null check (account_number ~ '^[0-9]{6,16}$'),
  branch_code     text not null check (branch_code ~ '^[0-9]{6}$'),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

drop trigger if exists driver_bank_details_touch on public.driver_bank_details;
create trigger driver_bank_details_touch before update on public.driver_bank_details
  for each row execute function public.touch_updated_at();

alter table public.driver_bank_details enable row level security;
revoke all on public.driver_bank_details from anon, authenticated;
grant select on public.driver_bank_details to authenticated;
grant insert (user_id, account_holder, bank_name, account_type, account_number, branch_code) on public.driver_bank_details to authenticated;
grant update (account_holder, bank_name, account_type, account_number, branch_code) on public.driver_bank_details to authenticated;

create policy "bank: read own" on public.driver_bank_details for select to authenticated using (user_id = auth.uid());
create policy "bank: add own" on public.driver_bank_details for insert to authenticated with check (user_id = auth.uid());
create policy "bank: change own" on public.driver_bank_details for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace function public.audit_bank_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.audit_log (actor_id, action, target_type, target_id, detail)
    values (auth.uid(), 'bank_details.' || case when tg_op = 'INSERT' then 'added' else 'changed' end, 'user', new.user_id::text, '{}'::jsonb);
  return new;
end $$;
drop trigger if exists driver_bank_details_audit on public.driver_bank_details;
create trigger driver_bank_details_audit after insert or update on public.driver_bank_details
  for each row execute function public.audit_bank_change();

-- Admin lookup. Returns no row when the driver has not added any. Logged when a row is returned.
create or replace function public.get_driver_bank_details(target uuid)
returns public.driver_bank_details
language plpgsql security definer set search_path = public as $$
declare b public.driver_bank_details;
begin
  if not public.is_admin() then raise exception 'Not allowed'; end if;
  select * into b from public.driver_bank_details where user_id = target;
  if found then
    insert into public.audit_log (actor_id, action, target_type, target_id)
      values (auth.uid(), 'bank_details.viewed', 'user', target::text);
  end if;
  return b;
end $$;
revoke all on function public.get_driver_bank_details(uuid) from public, anon;
grant execute on function public.get_driver_bank_details(uuid) to authenticated;
