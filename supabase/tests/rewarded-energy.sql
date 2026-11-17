\set ON_ERROR_STOP on
insert into auth.users values('00000000-0000-4000-8000-000000000004','ad@example.test',now());
set role authenticated;
set request.jwt.claim.sub='00000000-0000-4000-8000-000000000004';
select public.prepare_energy_ad('00000000-0000-4000-8000-000000000101');
select public.prepare_energy_ad('00000000-0000-4000-8000-000000000102');
do $$begin
  if (select count(*) from public.energy_ad_intents)<>1 then raise exception 'Retry created extra intent'; end if;
  begin
    perform public.record_energy_ssv('00000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000101','forged',now());
    raise exception 'Client can self-credit';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
select public.record_energy_ssv('00000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000101','real-1',now());
select public.record_energy_ssv('00000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000101','real-1',now());
select public.record_energy_ssv('00000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000101','real-duplicate-intent',now());
-- Simulate four independently verified completions, then reject a fifth.
insert into public.energy_ad_intents(id,user_id) values
('00000000-0000-4000-8000-000000000102','00000000-0000-4000-8000-000000000004'),
('00000000-0000-4000-8000-000000000103','00000000-0000-4000-8000-000000000004'),
('00000000-0000-4000-8000-000000000104','00000000-0000-4000-8000-000000000004'),
('00000000-0000-4000-8000-000000000105','00000000-0000-4000-8000-000000000004');
select public.record_energy_ssv('00000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000102','real-2',now());
select public.record_energy_ssv('00000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000103','real-3',now());
select public.record_energy_ssv('00000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000104','real-4',now());
do $$declare result jsonb; begin
  result:=public.record_energy_ssv('00000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000105','real-5',now());
  if result->>'kind'<>'daily_limit' then raise exception 'Daily cap bypass'; end if;
  if (select sum(amount) from public.energy_ad_rewards where user_id='00000000-0000-4000-8000-000000000004')<>100 then raise exception 'Incorrect credit total'; end if;
end $$;
set role authenticated;
set request.jwt.claim.sub='00000000-0000-4000-8000-000000000003';
do $$begin
  if (select count(*) from public.energy_ad_rewards)<>0 then raise exception 'Reward ledger leaked'; end if;
end $$;
reset role;
select 'rewarded energy SQL checks passed' as result;
