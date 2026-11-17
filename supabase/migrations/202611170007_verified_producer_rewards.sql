-- Separate producer-refresh rewards from energy while sharing the daily four-reward ledger.
alter table public.energy_ad_intents add column reward_kind text not null default 'energy' check(reward_kind in ('energy','producer'));
alter table public.energy_ad_intents add column city_id text;
alter table public.energy_ad_intents add column producer_id text;
alter table public.energy_ad_intents add constraint energy_ad_target_check check(
 (reward_kind='energy' and city_id is null and producer_id is null) or
 (reward_kind='producer' and city_id is not null and producer_id is not null));
alter table public.energy_ad_rewards drop constraint energy_ad_rewards_amount_check;
alter table public.energy_ad_rewards add constraint energy_ad_rewards_amount_check check(amount in(1,15,25));
create or replace function public.prepare_energy_ad(request_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare owner_id uuid:=auth.uid(); used integer; pending_id uuid;
begin
  if owner_id is null or request_id is null or not public.account_is_active() then raise exception 'Account unavailable' using errcode='42501'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(owner_id::text,0));
  select count(*) into used from public.energy_ad_rewards where user_id=owner_id and reward_day=(now() at time zone 'UTC')::date;
  if used>=4 then return pg_catalog.jsonb_build_object('kind','daily_limit','used',used); end if;
  -- Reuse one pending intent across retries/devices; client callbacks never create credits.
  select id into pending_id from public.energy_ad_intents where user_id=owner_id and reward_kind='energy' and claimed_at is null and expires_at>now() order by created_at desc limit 1;
  if pending_id is null then
    insert into public.energy_ad_intents(id,user_id) values(request_id,owner_id);
    pending_id:=request_id;
  end if;
  return pg_catalog.jsonb_build_object('kind','ready','intent_id',pending_id,'used',used,'amount',25);
end; $$;
revoke all on function public.prepare_energy_ad(uuid) from public,anon;
grant execute on function public.prepare_energy_ad(uuid) to authenticated;


create function public.prepare_producer_ad(request_id uuid,city_id text,producer_id text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare owner_id uuid:=auth.uid(); used integer; pending_id uuid; payload jsonb; batch jsonb;
begin
 if owner_id is null or request_id is null or city_id is null or producer_id is null or not public.account_is_active() then
  raise exception 'Account unavailable' using errcode='42501'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(owner_id::text,0));
 select s.payload into payload from public.game_saves s where s.user_id=owner_id;
 batch:=payload#>array['cities',city_id,'batches',producer_id];
 if not coalesce((payload#>array['cities',city_id,'owned']) ? producer_id,false)
  or batch is null or batch->>'remaining' is distinct from '0'
  or coalesce((batch->>'readyAt')::numeric,0)<=extract(epoch from now())*1000 then
  return pg_catalog.jsonb_build_object('kind','not_waiting'); end if;
 select count(*) into used from public.energy_ad_rewards where user_id=owner_id and reward_day=(now() at time zone 'UTC')::date;
 if used>=4 then return pg_catalog.jsonb_build_object('kind','daily_limit','used',used); end if;
 select i.id into pending_id from public.energy_ad_intents i where i.user_id=owner_id and i.reward_kind='producer'
  and i.city_id=prepare_producer_ad.city_id and i.producer_id=prepare_producer_ad.producer_id
  and i.claimed_at is null and i.expires_at>now() order by i.created_at desc limit 1;
 if pending_id is null then
  insert into public.energy_ad_intents(id,user_id,reward_kind,city_id,producer_id)
   values(request_id,owner_id,'producer',prepare_producer_ad.city_id,prepare_producer_ad.producer_id);
  pending_id:=request_id;
 end if;
 return pg_catalog.jsonb_build_object('kind','ready','intent_id',pending_id,'used',used,'amount',1);
end; $$;
revoke all on function public.prepare_producer_ad(uuid,text,text) from public,anon;
grant execute on function public.prepare_producer_ad(uuid,text,text) to authenticated;
create function public.record_game_ssv(owner_id uuid,intent_id uuid,transaction_id text,event_time timestamptz,verified_kind text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare intent public.energy_ad_intents%rowtype; used integer; reward_date date;
begin
  if owner_id is null or intent_id is null or transaction_id is null or event_time is null then raise exception 'Invalid reward' using errcode='22023'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(owner_id::text,0));
  if exists(select 1 from public.energy_ad_rewards r where r.transaction_id=record_game_ssv.transaction_id or r.intent_id=record_game_ssv.intent_id) then return pg_catalog.jsonb_build_object('kind','duplicate'); end if;
  if not exists(select 1 from public.app_accounts a join auth.users u on u.id=a.user_id where a.user_id=owner_id and a.status='active') then return pg_catalog.jsonb_build_object('kind','account_unavailable'); end if;
  select * into intent from public.energy_ad_intents i where i.id=record_game_ssv.intent_id and i.user_id=owner_id;
  if not found or event_time<intent.created_at-interval '5 minutes' or event_time>intent.expires_at+interval '5 minutes' then return pg_catalog.jsonb_build_object('kind','invalid_intent'); end if;
  if verified_kind is distinct from intent.reward_kind then return pg_catalog.jsonb_build_object('kind','invalid_reward_kind'); end if;
  reward_date:=(event_time at time zone 'UTC')::date;
  select count(*) into used from public.energy_ad_rewards r where r.user_id=owner_id and r.reward_day=reward_date;
  if used>=4 then return pg_catalog.jsonb_build_object('kind','daily_limit'); end if;
  insert into public.energy_ad_rewards(transaction_id,intent_id,user_id,reward_day,amount) values(record_game_ssv.transaction_id,record_game_ssv.intent_id,owner_id,reward_date,case when verified_kind='producer' then 1 else 25 end);
  update public.energy_ad_intents set claimed_at=now() where id=record_game_ssv.intent_id;
  return pg_catalog.jsonb_build_object('kind','granted','amount',case when verified_kind='producer' then 1 else 25 end,'used',used+1);
end; $$;
revoke all on function public.record_game_ssv(uuid,uuid,text,timestamptz,text) from public,anon,authenticated;
grant execute on function public.record_game_ssv(uuid,uuid,text,timestamptz,text) to service_role;

-- Keep the earlier service-only energy entry point compatible with existing deployments.
create or replace function public.record_energy_ssv(owner_id uuid,intent_id uuid,transaction_id text,event_time timestamptz)
returns jsonb language sql security definer set search_path='' as $$
 select public.record_game_ssv(owner_id,intent_id,transaction_id,event_time,'energy');
$$;
revoke all on function public.record_energy_ssv(uuid,uuid,text,timestamptz) from public,anon,authenticated;
grant execute on function public.record_energy_ssv(uuid,uuid,text,timestamptz) to service_role;
create or replace function public.redeem_energy_ad(intent_id uuid, expected_revision bigint, save_payload jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
  owner_id uuid:=auth.uid();
  reward public.energy_ad_rewards%rowtype;
  result jsonb;
  updated_payload jsonb;
  energy numeric;
  intent public.energy_ad_intents%rowtype;
begin
  if owner_id is null or not public.account_is_active() then
    raise exception 'Account unavailable' using errcode='42501';
  end if;
  if intent_id is null or expected_revision is null or expected_revision<0 then
    raise exception 'Invalid reward request' using errcode='22023';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(owner_id::text,0));
  select * into reward from public.energy_ad_rewards r
    where r.intent_id=redeem_energy_ad.intent_id and r.user_id=owner_id;
  if not found then return pg_catalog.jsonb_build_object('kind','pending'); end if;
  if reward.redeemed_at is not null then
    return pg_catalog.jsonb_build_object('kind','already_redeemed','revision',reward.redeemed_revision);
  end if;
  if pg_catalog.jsonb_typeof(save_payload) is distinct from 'object'
    or save_payload->>'schema' is distinct from '2'
    or coalesce(save_payload->>'testOnly','false')<>'false'
    or pg_catalog.jsonb_typeof(save_payload->'stamina') is distinct from 'number'
    or (save_payload ? 'transactions' and pg_catalog.jsonb_typeof(save_payload->'transactions') is distinct from 'array') then
    raise exception 'Invalid reward snapshot' using errcode='22023';
  end if;
  select * into intent from public.energy_ad_intents i where i.id=redeem_energy_ad.intent_id and i.user_id=owner_id;
  if intent.reward_kind='producer' then
    if not coalesce((save_payload#>array['cities',intent.city_id,'owned']) ? intent.producer_id,false) then
      raise exception 'Producer unavailable' using errcode='22023';
    end if;
    updated_payload:=pg_catalog.jsonb_set(save_payload,array['cities',intent.city_id,'batches'],
      coalesce(save_payload#>array['cities',intent.city_id,'batches'],'{}'::jsonb)||
      pg_catalog.jsonb_build_object(intent.producer_id,pg_catalog.jsonb_build_object('remaining',80,'readyAt',0)));
  else
    energy:=(save_payload->>'stamina')::numeric;
    if energy<0 or energy<>pg_catalog.trunc(energy) or energy>9007199254740991-reward.amount then
      raise exception 'Invalid energy' using errcode='22023';
    end if;
    updated_payload:=pg_catalog.jsonb_set(save_payload,'{stamina}',pg_catalog.to_jsonb(energy+reward.amount));
  end if;
  updated_payload:=pg_catalog.jsonb_set(updated_payload,'{transactions}',
    coalesce(save_payload->'transactions','[]'::jsonb)||pg_catalog.jsonb_build_array('ad:'||intent_id::text));
  result:=public.write_game_save(expected_revision,intent_id,updated_payload,1);
  if result->>'kind'<>'saved' then return result; end if;
  update public.energy_ad_rewards r set redeemed_at=now(),redeemed_revision=(result->>'revision')::bigint
    where r.intent_id=redeem_energy_ad.intent_id and r.user_id=owner_id;
  return pg_catalog.jsonb_build_object('kind','redeemed','revision',result->'revision','amount',reward.amount,'reward_kind',intent.reward_kind,'city_id',intent.city_id,'producer_id',intent.producer_id,'payload',updated_payload);
end; $$;
revoke all on function public.redeem_energy_ad(uuid,bigint,jsonb) from public,anon;
grant execute on function public.redeem_energy_ad(uuid,bigint,jsonb) to authenticated;
