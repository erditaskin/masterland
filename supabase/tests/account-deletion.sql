\set ON_ERROR_STOP on
insert into auth.users values('00000000-0000-4000-8000-000000000001','same@example.test',now()),('00000000-0000-4000-8000-000000000002','other@example.test',now());
insert into auth.identities values('00000000-0000-4000-8000-000000000001','google');
insert into auth.sessions values('00000000-0000-4000-8000-000000000001');
set role authenticated;
set request.jwt.claim.sub='00000000-0000-4000-8000-000000000001';
do $$begin
  begin
    perform public.write_game_save(0,'00000000-0000-4000-8000-000000000099','{"testOnly":true}');
    raise exception 'Test progress entered live cloud';
  exception when insufficient_privilege then null; end;
end $$;
select public.write_game_save(0,'00000000-0000-4000-8000-000000000011','{"test":true}');
do $$begin
  if (select count(*) from public.game_saves)<>1 then raise exception 'Own save missing'; end if;
end $$;
set request.jwt.claim.sub='00000000-0000-4000-8000-000000000002';
do $$begin
  if (select count(*) from public.game_saves)<>0 then raise exception 'Cross-user save leak'; end if;
end $$;
set request.jwt.claim.sub='00000000-0000-4000-8000-000000000001';
select public.request_account_deletion_with_receipt('00000000-0000-4000-8000-000000000021','DELETE',repeat('a',64));
-- Double-submit returns the existing request, rather than creating another.
select public.request_account_deletion_with_receipt('00000000-0000-4000-8000-000000000022','DELETE',repeat('a',64));
do $$begin
  if (select count(*) from public.account_deletion_requests)<>1 then raise exception 'Duplicate request'; end if;
  if (select count(*) from public.game_saves)<>0 then raise exception 'Deleting user can read save'; end if;
  begin
    perform public.write_game_save(1,'00000000-0000-4000-8000-000000000012','{"test":false}');
    raise exception 'Deleting user can write save';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
delete from auth.users where id='00000000-0000-4000-8000-000000000001';
update public.app_accounts set status='deleted',deleted_at=now() where user_id='00000000-0000-4000-8000-000000000001';
update public.account_deletion_requests set status='completed',completed_at=now() where user_id='00000000-0000-4000-8000-000000000001';
-- Same email creates a different Auth UUID and a fresh active application record.
insert into auth.users values('00000000-0000-4000-8000-000000000003','same@example.test',now());
do $$begin
  if exists(select 1 from auth.sessions where user_id='00000000-0000-4000-8000-000000000001') then raise exception 'Old session survived'; end if;
  if exists(select 1 from auth.identities where user_id='00000000-0000-4000-8000-000000000001') then raise exception 'Old identity survived'; end if;
  if not exists(select 1 from public.app_accounts where user_id='00000000-0000-4000-8000-000000000001' and status='deleted') then raise exception 'Tombstone missing'; end if;
end $$;
set role authenticated;
set request.jwt.claim.sub='00000000-0000-4000-8000-000000000001';
do $$begin
  if public.account_is_active() then raise exception 'Deleted JWT still active'; end if;
  begin
    perform public.write_game_save(0,'00000000-0000-4000-8000-000000000013','{}');
    raise exception 'Deleted JWT recreated save';
  exception when insufficient_privilege then null; end;
end $$;
set request.jwt.claim.sub='00000000-0000-4000-8000-000000000003';
do $$begin
  if not public.account_is_active() then raise exception 'New account inactive'; end if;
  if (select count(*) from public.game_saves)<>0 then raise exception 'New account inherited old progress'; end if;
end $$;
reset role;
-- Stale reauthentication is rejected.
update auth.users set last_sign_in_at=now()-interval '1 hour' where id='00000000-0000-4000-8000-000000000003';
set role authenticated;
do $$begin
  begin
    perform public.request_account_deletion_with_receipt('00000000-0000-4000-8000-000000000023','DELETE',repeat('a',64));
    raise exception 'Stale sign-in accepted';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
select 'account deletion SQL checks passed' as result;
