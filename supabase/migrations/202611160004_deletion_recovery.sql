-- A one-time receipt can confirm deletion after the Auth session has ceased to exist.
alter table public.account_deletion_requests add column receipt_hash text check(receipt_hash ~ '^[0-9a-f]{64}$');
alter table public.account_deletion_requests add column processing_started_at timestamptz;
create function public.request_account_deletion_with_receipt(request_id uuid, confirmation text, receipt_hash text)
returns uuid language plpgsql security definer set search_path='' as $$
declare deletion_id uuid; previous_hash text;
begin
  if receipt_hash is null or receipt_hash !~ '^[0-9a-f]{64}$' then raise exception 'Invalid receipt' using errcode='22023'; end if;
  deletion_id:=public.request_account_deletion(request_id,confirmation);
  select r.receipt_hash into previous_hash from public.account_deletion_requests r where r.id=deletion_id for update;
  if previous_hash is not null and previous_hash<>receipt_hash then raise exception 'Deletion pending on another device' using errcode='42501'; end if;
  update public.account_deletion_requests set receipt_hash=request_account_deletion_with_receipt.receipt_hash where id=deletion_id;
  return deletion_id;
end; $$;
revoke all on function public.request_account_deletion_with_receipt(uuid,text,text) from public,anon;
grant execute on function public.request_account_deletion_with_receipt(uuid,text,text) to authenticated;
revoke execute on function public.request_account_deletion(uuid,text) from authenticated;

-- Serialize privileged workers. Retrying a request must not exchange the Apple code twice concurrently.
create function public.claim_account_deletion(request_id uuid) returns boolean language plpgsql security definer set search_path='' as $$
begin
  update public.account_deletion_requests set status='processing',processing_started_at=now()
    where id=request_id and (status in ('requested','failed') or (status='processing' and coalesce(processing_started_at,requested_at)<now()-interval '3 minutes'));
  return found;
end; $$;
revoke all on function public.claim_account_deletion(uuid) from public,anon,authenticated;
grant execute on function public.claim_account_deletion(uuid) to service_role;

-- Called only by the Edge Function after hashing the secret receipt. No identity, email or progress is returned.
create function public.read_account_deletion_receipt(request_id uuid, receipt_hash text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare request public.account_deletion_requests%rowtype; deleted boolean;
begin
  select * into request from public.account_deletion_requests r where r.id=request_id and r.receipt_hash=read_account_deletion_receipt.receipt_hash;
  if not found then return null; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(request.user_id::text,0));
  deleted:=not exists(select 1 from auth.users where id=request.user_id);
  if deleted then
    update public.app_accounts set status='deleted',deleted_at=coalesce(deleted_at,now()) where user_id=request.user_id;
    update public.account_deletion_requests set status=case when provider_revocation='pending' then 'data_deleted' else 'completed' end,
      completed_at=coalesce(completed_at,now()) where id=request_id returning * into request;
  end if;
  return pg_catalog.jsonb_build_object('request_id',request.id,'status',request.status,'auth_deleted',deleted);
end; $$;
revoke all on function public.read_account_deletion_receipt(uuid,text) from public,anon,authenticated;
grant execute on function public.read_account_deletion_receipt(uuid,text) to service_role;
