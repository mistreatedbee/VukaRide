-- Hardening after the CTO review. Run once, after 0001 and 0002.
--
--  A  Drivers can no longer delete or add documents once the application is with the team, and can never
--     delete the file behind an accepted document.
--  D  An application can only be approved when every required document is accepted, and approved or
--     rejected applications must be reopened before they change again.
--  E  Inbox status changes, document views and role changes now write to the audit log.
--  C  document_counts() replaces fetching every document row to count them.
--  MFA  is_admin() now requires a second factor (aal2). Admins enrol an authenticator app on first sign-in.
--       If an admin loses their device, remove the factor in the SQL editor:
--         delete from auth.mfa_factors where user_id = (select id from auth.users where email = 'admin@example.com');

-- ---------------------------------------------------------------------------------------------- required documents
-- Keep in step with DOC_INFO (required: true) in src/portal/types.ts.
create or replace function public.required_document_kinds() returns text[]
language sql immutable as $$
  select array['licence', 'prdp', 'id', 'criminal_record', 'proof_of_address', 'selfie', 'vehicle_registration', 'insurance'];
$$;

-- True while the signed-in driver has no application, or it is still a draft or waiting for their changes.
create or replace function public.my_application_open() returns boolean
language sql stable security definer set search_path = public as $$
  select not exists (
    select 1 from public.driver_applications where user_id = auth.uid() and status not in ('draft', 'needs_info')
  );
$$;
revoke all on function public.my_application_open() from public, anon;
grant execute on function public.my_application_open() to authenticated;

drop policy if exists "documents: add own" on public.driver_documents;
create policy "documents: add own" on public.driver_documents for insert to authenticated
  with check (user_id = auth.uid() and storage_path like auth.uid()::text || '/%' and public.my_application_open());

drop policy if exists "documents: delete own unless accepted" on public.driver_documents;
create policy "documents: delete own unless accepted" on public.driver_documents for delete to authenticated
  using (user_id = auth.uid() and status <> 'accepted' and public.my_application_open());

drop policy if exists "driver-documents: delete own" on storage.objects;
create policy "driver-documents: delete own" on storage.objects for delete to authenticated
  using (
    bucket_id = 'driver-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.my_application_open()
    and not exists (select 1 from public.driver_documents d where d.storage_path = objects.name and d.status = 'accepted')
  );

-- ---------------------------------------------------------------------------------------------- review guards
create or replace function public.review_application(app_id uuid, new_status text, note text default null)
returns public.driver_applications
language plpgsql security definer set search_path = public as $$
#variable_conflict use_variable
declare
  app public.driver_applications;
  missing text[];
begin
  if not public.is_admin() then raise exception 'Not allowed'; end if;
  if new_status not in ('in_review', 'needs_info', 'approved', 'rejected') then raise exception 'Invalid status'; end if;
  if new_status in ('needs_info', 'rejected') and coalesce(btrim(note), '') = '' then raise exception 'A note is required'; end if;

  select * into app from public.driver_applications where id = app_id for update;
  if not found or app.status = 'draft' then raise exception 'Application not found or still a draft'; end if;
  if app.status in ('approved', 'rejected') and new_status <> 'in_review' then
    raise exception 'Reopen the application (Start review) before changing the decision';
  end if;

  if new_status = 'approved' then
    select coalesce(array_agg(k), '{}') into missing
      from unnest(public.required_document_kinds()) k
     where not exists (
       select 1 from public.driver_documents d where d.user_id = app.user_id and d.kind = k and d.status = 'accepted'
     );
    if array_length(missing, 1) > 0 then
      raise exception 'Accept all required documents first. Still missing: %', array_to_string(missing, ', ');
    end if;
  end if;

  update public.driver_applications
     set status = new_status, review_note = nullif(btrim(note), ''), reviewed_at = now(), reviewed_by = auth.uid()
   where id = app_id returning * into app;
  insert into public.audit_log (actor_id, action, target_type, target_id, detail)
    values (auth.uid(), 'application.' || new_status, 'application', app.id::text, jsonb_build_object('note', nullif(btrim(note), '')));
  return app;
end $$;

-- ---------------------------------------------------------------------------------------------- audit
create or replace function public.audit_submission_status() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status then
    insert into public.audit_log (actor_id, action, target_type, target_id, detail)
      values (auth.uid(), 'submission.' || new.status, 'submission', new.id::text, jsonb_build_object('kind', new.kind));
  end if;
  return new;
end $$;
drop trigger if exists form_submissions_audit on public.form_submissions;
create trigger form_submissions_audit after update of status on public.form_submissions
  for each row execute function public.audit_submission_status();

create or replace function public.audit_role_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role then
    insert into public.audit_log (actor_id, action, target_type, target_id, detail)
      values (auth.uid(), 'profile.role_changed', 'profile', new.id::text, jsonb_build_object('from', old.role, 'to', new.role));
  end if;
  return new;
end $$;
drop trigger if exists profiles_role_audit on public.profiles;
create trigger profiles_role_audit after update of role on public.profiles
  for each row execute function public.audit_role_change();

-- Admins call this each time they open a driver document.
create or replace function public.audit_document_view(doc_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare doc public.driver_documents;
begin
  if not public.is_admin() then raise exception 'Not allowed'; end if;
  select * into doc from public.driver_documents where id = doc_id;
  if not found then return; end if;
  insert into public.audit_log (actor_id, action, target_type, target_id, detail)
    values (auth.uid(), 'document.viewed', 'document', doc.id::text, jsonb_build_object('kind', doc.kind, 'owner', doc.user_id));
end $$;
revoke all on function public.audit_document_view(uuid) from public, anon;
grant execute on function public.audit_document_view(uuid) to authenticated;

-- ---------------------------------------------------------------------------------------------- counts
create or replace function public.document_counts() returns table (user_id uuid, n bigint)
language sql stable security invoker set search_path = public as $$
  select d.user_id, count(*) from public.driver_documents d group by d.user_id;
$$;
revoke all on function public.document_counts() from public, anon;
grant execute on function public.document_counts() to authenticated;

-- ---------------------------------------------------------------------------------------------- admins need a second factor
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
     and coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2';
$$;
