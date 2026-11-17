-- Redeem only a server-verified reward, atomically with a revision-checked save.
alter table public.energy_ad_rewards add column redeemed_at timestamptz;
alter table public.energy_ad_rewards add column redeemed_revision bigint;
create function public.redeem_energy_ad(intent_id uuid, expected_revision bigint, save_payload jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
  owner_id uuid:=auth.uid();
  reward public.energy_ad_rewards%rowtype;
  result jsonb;
  updated_payload jsonb;
  energy numeric;
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
  energy:=(save_payload->>'stamina')::numeric;
  if energy<0 or energy<>pg_catalog.trunc(energy) or energy>9007199254740991-reward.amount then
    raise exception 'Invalid energy' using errcode='22023';
  end if;
  updated_payload:=pg_catalog.jsonb_set(save_payload,'{stamina}',pg_catalog.to_jsonb(energy+reward.amount));
  updated_payload:=pg_catalog.jsonb_set(updated_payload,'{transactions}',
    coalesce(save_payload->'transactions','[]'::jsonb)||pg_catalog.jsonb_build_array('ad:'||intent_id::text));
  result:=public.write_game_save(expected_revision,intent_id,updated_payload,1);
  if result->>'kind'<>'saved' then return result; end if;
  update public.energy_ad_rewards r set redeemed_at=now(),redeemed_revision=(result->>'revision')::bigint
    where r.intent_id=redeem_energy_ad.intent_id and r.user_id=owner_id;
  return pg_catalog.jsonb_build_object('kind','redeemed','revision',result->'revision','amount',reward.amount,'payload',updated_payload);
end; $$;
revoke all on function public.redeem_energy_ad(uuid,bigint,jsonb) from public,anon;
grant execute on function public.redeem_energy_ad(uuid,bigint,jsonb) to authenticated;
