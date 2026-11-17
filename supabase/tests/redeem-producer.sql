\set ON_ERROR_STOP on
insert into auth.users values('00000000-0000-4000-8000-000000000008','producer@example.test',now());
set role authenticated;
set request.jwt.claim.sub='00000000-0000-4000-8000-000000000008';
select public.write_game_save(0,'00000000-0000-4000-8000-000000000800',
 jsonb_build_object('schema',2,'stamina',90,'cities',jsonb_build_object('city1',jsonb_build_object('owned',jsonb_build_array('producer1'),'batches',jsonb_build_object('producer1',jsonb_build_object('remaining',0,'readyAt',extract(epoch from now()+interval '2 minutes')*1000))))));
select public.prepare_energy_ad('00000000-0000-4000-8000-000000000801');
do $$declare result jsonb; begin
 result:=public.prepare_producer_ad('00000000-0000-4000-8000-000000000802','city1','producer1');
 if result->>'kind'<>'ready' or result->>'amount'<>'1' or result->>'intent_id'<>'00000000-0000-4000-8000-000000000802' then raise exception 'Producer intent reused energy intent'; end if;
 result:=public.prepare_producer_ad('00000000-0000-4000-8000-000000000803','city1','producer1');
 if result->>'intent_id'<>'00000000-0000-4000-8000-000000000802' then raise exception 'Producer retry duplicated intent'; end if;
 if public.prepare_producer_ad('00000000-0000-4000-8000-000000000804','city2','producer1')->>'kind'<>'not_waiting' then raise exception 'Foreign city producer allowed'; end if;
end $$;
reset role;
do $$begin
 if public.record_game_ssv('00000000-0000-4000-8000-000000000008','00000000-0000-4000-8000-000000000802','wrong-kind',now(),'energy')->>'kind'<>'invalid_reward_kind' then raise exception 'Wrong ad unit can pay producer'; end if;
end $$;
select public.record_game_ssv('00000000-0000-4000-8000-000000000008','00000000-0000-4000-8000-000000000802','producer-verified',now(),'producer');
set role authenticated;
set request.jwt.claim.sub='00000000-0000-4000-8000-000000000008';
do $$declare result jsonb; original jsonb; begin
 select payload into original from public.game_saves;
 result:=public.redeem_energy_ad('00000000-0000-4000-8000-000000000802',1,original);
 if result->>'kind'<>'redeemed' or result->>'reward_kind'<>'producer' or result->>'amount'<>'1'
  or result->'payload'->>'stamina'<>'90' or result#>>'{payload,cities,city1,batches,producer1,remaining}'<>'80'
  or result#>>'{payload,cities,city1,batches,producer1,readyAt}'<>'0' then raise exception 'Wrong producer redemption'; end if;
 if public.redeem_energy_ad('00000000-0000-4000-8000-000000000802',2,result->'payload')->>'kind'<>'already_redeemed' then raise exception 'Producer double credit'; end if;
 if public.prepare_producer_ad('00000000-0000-4000-8000-000000000804','city1','producer1')->>'kind'<>'not_waiting' then raise exception 'Ready producer can request ad'; end if;
end $$;
reset role;
insert into public.energy_ad_intents(id,user_id) values
 ('00000000-0000-4000-8000-000000000803','00000000-0000-4000-8000-000000000008'),
 ('00000000-0000-4000-8000-000000000804','00000000-0000-4000-8000-000000000008'),
 ('00000000-0000-4000-8000-000000000805','00000000-0000-4000-8000-000000000008');
select public.record_energy_ssv('00000000-0000-4000-8000-000000000008','00000000-0000-4000-8000-000000000801','shared-energy-1',(select created_at from public.energy_ad_intents where id='00000000-0000-4000-8000-000000000801'));
select public.record_energy_ssv('00000000-0000-4000-8000-000000000008','00000000-0000-4000-8000-000000000803','shared-energy-2',now());
select public.record_energy_ssv('00000000-0000-4000-8000-000000000008','00000000-0000-4000-8000-000000000804','shared-energy-3',now());
update public.game_saves set payload=jsonb_set(payload,'{cities,city1,batches,producer1}',jsonb_build_object('remaining',0,'readyAt',extract(epoch from now()+interval '2 minutes')*1000)) where user_id='00000000-0000-4000-8000-000000000008';
set role authenticated;
set request.jwt.claim.sub='00000000-0000-4000-8000-000000000008';
do $$begin
 if public.prepare_producer_ad('00000000-0000-4000-8000-000000000806','city1','producer1')->>'kind'<>'daily_limit' then raise exception 'Producer bypasses shared daily limit'; end if;
 if public.prepare_energy_ad('00000000-0000-4000-8000-000000000806')->>'kind'<>'daily_limit' then raise exception 'Energy bypasses shared daily limit'; end if;
end $$;
reset role;
do $$begin
 if public.record_energy_ssv('00000000-0000-4000-8000-000000000008','00000000-0000-4000-8000-000000000805','shared-energy-5',now())->>'kind'<>'daily_limit' then raise exception 'Fifth shared reward credited'; end if;
 if has_function_privilege('authenticated','public.record_game_ssv(uuid,uuid,text,timestamptz,text)','EXECUTE') then raise exception 'Client can credit typed SSV'; end if;
end $$;
select 'verified producer reward SQL checks passed' as result;
