\set ON_ERROR_STOP on
insert into auth.users values('00000000-0000-4000-8000-000000000010','recovery@example.test',now());
set role authenticated;
set request.jwt.claim.sub='00000000-0000-4000-8000-000000000010';
select public.request_account_deletion_with_receipt('00000000-0000-4000-8000-000000000031','DELETE',repeat('a',64));
select public.request_account_deletion_with_receipt('00000000-0000-4000-8000-000000000031','DELETE',repeat('a',64));
do $$begin
  begin
    perform public.read_account_deletion_receipt('00000000-0000-4000-8000-000000000031',repeat('a',64));
    raise exception 'Client bypassed receipt verifier';
  exception when insufficient_privilege then null; end;
  begin
    perform public.request_account_deletion_with_receipt('00000000-0000-4000-8000-000000000032','DELETE',repeat('b',64));
    raise exception 'Another receipt took over request';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
do $$begin
  if not public.claim_account_deletion('00000000-0000-4000-8000-000000000031') then raise exception 'First worker not claimed'; end if;
  if public.claim_account_deletion('00000000-0000-4000-8000-000000000031') then raise exception 'Concurrent worker claimed'; end if;
  if public.read_account_deletion_receipt('00000000-0000-4000-8000-000000000031',repeat('b',64)) is not null then raise exception 'Wrong receipt disclosed status'; end if;
end $$;
-- Auth deletion commits but the worker crashes before completing application audit rows.
delete from auth.users where id='00000000-0000-4000-8000-000000000010';
do $$declare result jsonb; begin
  result:=public.read_account_deletion_receipt('00000000-0000-4000-8000-000000000031',repeat('a',64));
  if result->>'auth_deleted'<>'true' or result->>'status'<>'completed' then raise exception 'Recovery did not reconcile Auth deletion'; end if;
  if not exists(select 1 from public.app_accounts where user_id='00000000-0000-4000-8000-000000000010' and status='deleted') then raise exception 'Tombstone not recovered'; end if;
  if public.claim_account_deletion('00000000-0000-4000-8000-000000000031') then raise exception 'Completed request reclaimed'; end if;
end $$;
select 'deletion recovery SQL checks passed' as result;
