-- Driver suspension. Run once, after 0001 to 0003.
-- Suspending a driver does not delete anything. It sets a flag the driver app can read later (when the app is
-- connected) and shows a notice on the driver's dashboard. Only admins who passed two-step sign-in can change it,
-- and every change is written to audit_log.

alter table public.profiles add column if not exists suspended_at timestamptz;
alter table public.profiles add column if not exists suspended_reason text;

create or replace function public.set_driver_suspension(target uuid, suspend boolean, reason text default null)
returns public.profiles
language plpgsql security definer set search_path = public as $$
#variable_conflict use_variable
declare p public.profiles;
begin
  if not public.is_admin() then raise exception 'Not allowed'; end if;
  if suspend and coalesce(btrim(reason), '') = '' then raise exception 'A reason is required'; end if;
  select * into p from public.profiles where id = target for update;
  if not found or p.role <> 'driver' then raise exception 'Driver not found'; end if;
  update public.profiles
     set suspended_at = case when suspend then now() else null end,
         suspended_reason = case when suspend then nullif(btrim(reason), '') else null end
   where id = target returning * into p;
  insert into public.audit_log (actor_id, action, target_type, target_id, detail)
    values (auth.uid(), case when suspend then 'driver.suspended' else 'driver.reinstated' end, 'user', target::text,
            jsonb_build_object('reason', nullif(btrim(reason), '')));
  return p;
end $$;
revoke all on function public.set_driver_suspension(uuid, boolean, text) from public, anon;
grant execute on function public.set_driver_suspension(uuid, boolean, text) to authenticated;
