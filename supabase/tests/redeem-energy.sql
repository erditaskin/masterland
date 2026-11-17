\set ON_ERROR_STOP on
insert into auth.users values('00000000-0000-4000-8000-000000000006','redeem@example.test',now());
set role authenticated;
set request.jwt.claim.sub='00000000-0000-4000-8000-000000000006';
select public.prepare_energy_ad('00000000-0000-4000-8000-000000000601');
do $$declare result jsonb; begin
 result:=public.redeem_energy_ad('00000000-0000-4000-8000-000000000601',0,'{"schema":2,"stamina":100}');
 if result->>'kind'<>'pending' then raise exception 'Unverified reward credited'; end if;
end $$;
reset role;
select public.record_energy_ssv('00000000-0000-4000-8000-000000000006','00000000-0000-4000-8000-000000000601','redeem-verified',now());
set role authenticated;
set request.jwt.claim.sub='00000000-0000-4000-8000-000000000006';
do $$declare result jsonb; begin
 result:=public.redeem_energy_ad('00000000-0000-4000-8000-000000000601',0,'{"schema":2,"stamina":100,"gold":51}');
 if result->>'kind'<>'redeemed' or result->'payload'->>'stamina'<>'125' or result->'payload'->>'gold'<>'51' then raise exception 'Incorrect redemption'; end if;
 result:=public.redeem_energy_ad('00000000-0000-4000-8000-000000000601',1,'{"schema":2,"stamina":125}');
 if result->>'kind'<>'already_redeemed' then raise exception 'Repeated reward credited'; end if;
 if (select payload->>'stamina' from public.game_saves)<>'125' then raise exception 'Balance changed twice'; end if;
end $$;
-- Another account cannot redeem the first account's intent.
set request.jwt.claim.sub='00000000-0000-4000-8000-000000000004';
do $$begin
 if public.redeem_energy_ad('00000000-0000-4000-8000-000000000601',0,'{"schema":2,"stamina":100}')->>'kind'<>'pending' then raise exception 'Foreign reward leaked'; end if;
end $$;
reset role;
insert into public.energy_ad_intents(id,user_id) values('00000000-0000-4000-8000-000000000602','00000000-0000-4000-8000-000000000006');
select public.record_energy_ssv('00000000-0000-4000-8000-000000000006','00000000-0000-4000-8000-000000000602','redeem-conflict',now());
set role authenticated;
set request.jwt.claim.sub='00000000-0000-4000-8000-000000000006';
do $$declare result jsonb; begin
 result:=public.redeem_energy_ad('00000000-0000-4000-8000-000000000602',0,'{"schema":2,"stamina":90}');
 if result->>'kind'<>'conflict' then raise exception 'Stale save replaced'; end if;
 if exists(select 1 from public.energy_ad_rewards where intent_id='00000000-0000-4000-8000-000000000602' and redeemed_at is not null) then raise exception 'Conflict consumed reward'; end if;
 begin
  perform public.redeem_energy_ad('00000000-0000-4000-8000-000000000602',1,'{"schema":2,"stamina":100,"testOnly":true}');
  raise exception 'Test save rewarded';
 exception when invalid_parameter_value then null; end;
 result:=public.redeem_energy_ad('00000000-0000-4000-8000-000000000602',1,'{"schema":2,"stamina":90}');
 if result->>'kind'<>'redeemed' or result->'payload'->>'stamina'<>'115' then raise exception 'Retry failed'; end if;
end $$;
reset role;
select 'verified redemption SQL checks passed' as result;
