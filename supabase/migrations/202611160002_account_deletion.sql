-- No email or provider tokens in tombstones. A later signup always has a new Auth UUID.
create table public.app_accounts (
  user_id uuid primary key,
  status text not null default 'active' check(status in ('active','deleting','deleted')),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);
create table public.account_deletion_requests (
  id uuid primary key,
  user_id uuid not null,
  status text not null check(status in ('requested','processing','data_deleted','completed','failed')),
  provider_revocation text not null default 'not_required' check(provider_revocation in ('not_required','pending','completed')),
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  error_code text check(error_code in ('auth_delete_failed','provider_revoke_pending'))
);
create unique index one_active_deletion_per_account on public.account_deletion_requests(user_id)
  where status in ('requested','processing','failed');
alter table public.app_accounts enable row level security;
alter table public.account_deletion_requests enable row level security;
revoke all on public.app_accounts, public.account_deletion_requests from anon, authenticated;
grant select on public.app_accounts, public.account_deletion_requests to authenticated;
create policy own_account_read on public.app_accounts for select to authenticated using ((select auth.uid())=user_id);
create policy own_deletion_read on public.account_deletion_requests for select to authenticated using ((select auth.uid())=user_id);

create function public.create_app_account() returns trigger language plpgsql security definer set search_path='' as $$
begin
  insert into public.app_accounts(user_id) values(new.id);
  return new;
end; $$;
revoke all on function public.create_app_account() from public, anon, authenticated;
create trigger masterland_create_account after insert on auth.users for each row execute function public.create_app_account();
insert into public.app_accounts(user_id) select id from auth.users on conflict do nothing;

-- JWTs can outlive Auth deletion. Every protected data path checks current account existence/status.
create function public.account_is_active() returns boolean language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.app_accounts a join auth.users u on u.id=a.user_id
    where a.user_id=auth.uid() and a.status='active');
$$;
revoke all on function public.account_is_active() from public, anon;
grant execute on function public.account_is_active() to authenticated;
drop policy own_save_read on public.game_saves;
drop policy own_history_read on public.game_save_history;
create policy own_active_save_read on public.game_saves for select to authenticated using ((select auth.uid())=user_id and (select public.account_is_active()));
create policy own_active_history_read on public.game_save_history for select to authenticated using ((select auth.uid())=user_id and (select public.account_is_active()));
create function public.reject_inactive_save_write() returns trigger language plpgsql security definer set search_path='' as $$
begin
  if new.payload->>'testOnly'='true' then raise exception 'Test progress cannot enter production cloud' using errcode='42501'; end if;
  if not exists(select 1 from public.app_accounts a join auth.users u on u.id=a.user_id where a.user_id=new.user_id and a.status='active') then
    raise exception 'Account unavailable' using errcode='42501';
  end if;
  return new;
end; $$;
revoke all on function public.reject_inactive_save_write() from public, anon, authenticated;
create trigger require_active_save before insert or update on public.game_saves for each row execute function public.reject_inactive_save_write();

create function public.request_account_deletion(request_id uuid, confirmation text) returns uuid
language plpgsql security definer set search_path='' as $$
declare owner_id uuid := auth.uid(); existing_id uuid; last_login timestamptz;
begin
  if owner_id is null or request_id is null or confirmation is distinct from 'DELETE' then raise exception 'Confirmation required' using errcode='42501'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(owner_id::text,0));
  select id into existing_id from public.account_deletion_requests where user_id=owner_id and status in ('requested','processing','failed');
  if found then return existing_id; end if;
  select last_sign_in_at into last_login from auth.users where id=owner_id;
  if last_login is null or last_login < now()-interval '5 minutes' or not public.account_is_active() then
    raise exception 'Recent sign-in required' using errcode='42501';
  end if;
  if exists(select 1 from public.account_deletion_requests where id=request_id) then raise exception 'Request already used' using errcode='22023'; end if;
  insert into public.account_deletion_requests(id,user_id,status,provider_revocation)
    values(request_id,owner_id,'requested',case when exists(select 1 from auth.identities where user_id=owner_id and provider='apple') then 'pending' else 'not_required' end);
  update public.app_accounts set status='deleting' where user_id=owner_id;
  return request_id;
end; $$;
revoke all on function public.request_account_deletion(uuid,text) from public, anon;
grant execute on function public.request_account_deletion(uuid,text) to authenticated;

-- Run from the controlled maintenance job; retain minimal deletion audit for 30 days.
create function public.purge_expired_deletion_audit() returns void language sql security definer set search_path='' as $$
  delete from public.account_deletion_requests where status='completed' and completed_at<now()-interval '30 days';
  delete from public.app_accounts a where status='deleted' and deleted_at<now()-interval '30 days'
    and not exists(select 1 from public.account_deletion_requests r where r.user_id=a.user_id);
$$;
revoke all on function public.purge_expired_deletion_audit() from public, anon, authenticated;
grant execute on function public.purge_expired_deletion_audit() to service_role;
