-- Existing 15-energy records remain valid historical receipts.
alter table public.energy_ad_rewards drop constraint energy_ad_rewards_amount_check;
alter table public.energy_ad_rewards add constraint energy_ad_rewards_amount_check check (amount in (15,25));
alter table public.energy_ad_rewards alter column amount set default 25;
create or replace function public.prepare_energy_ad(request_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare owner_id uuid:=auth.uid(); used integer; pending_id uuid;
begin
  if owner_id is null or request_id is null or not public.account_is_active() then raise exception 'Account unavailable' using errcode='42501'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(owner_id::text,0));
  select count(*) into used from public.energy_ad_rewards where user_id=owner_id and reward_day=(now() at time zone 'UTC')::date;
  if used>=4 then return pg_catalog.jsonb_build_object('kind','daily_limit','used',used); end if;
  -- Reuse one pending intent across retries/devices; client callbacks never create credits.
  select id into pending_id from public.energy_ad_intents where user_id=owner_id and claimed_at is null and expires_at>now() order by created_at desc limit 1;
  if pending_id is null then
    insert into public.energy_ad_intents(id,user_id) values(request_id,owner_id);
    pending_id:=request_id;
  end if;
  return pg_catalog.jsonb_build_object('kind','ready','intent_id',pending_id,'used',used,'amount',25);
end; $$;
revoke all on function public.prepare_energy_ad(uuid) from public,anon;
grant execute on function public.prepare_energy_ad(uuid) to authenticated;

-- Only the signature-verifying Edge Function may invoke this function.
create or replace function public.record_energy_ssv(owner_id uuid,intent_id uuid,transaction_id text,event_time timestamptz)
returns jsonb language plpgsql security definer set search_path='' as $$
declare intent public.energy_ad_intents%rowtype; used integer; reward_date date;
begin
  if owner_id is null or intent_id is null or transaction_id is null or event_time is null then raise exception 'Invalid reward' using errcode='22023'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(owner_id::text,0));
  if exists(select 1 from public.energy_ad_rewards r where r.transaction_id=record_energy_ssv.transaction_id or r.intent_id=record_energy_ssv.intent_id) then return pg_catalog.jsonb_build_object('kind','duplicate'); end if;
  if not exists(select 1 from public.app_accounts a join auth.users u on u.id=a.user_id where a.user_id=owner_id and a.status='active') then return pg_catalog.jsonb_build_object('kind','account_unavailable'); end if;
  select * into intent from public.energy_ad_intents i where i.id=record_energy_ssv.intent_id and i.user_id=owner_id;
  if not found or event_time<intent.created_at-interval '5 minutes' or event_time>intent.expires_at+interval '5 minutes' then return pg_catalog.jsonb_build_object('kind','invalid_intent'); end if;
  reward_date:=(event_time at time zone 'UTC')::date;
  select count(*) into used from public.energy_ad_rewards r where r.user_id=owner_id and r.reward_day=reward_date;
  if used>=4 then return pg_catalog.jsonb_build_object('kind','daily_limit'); end if;
  insert into public.energy_ad_rewards(transaction_id,intent_id,user_id,reward_day) values(record_energy_ssv.transaction_id,record_energy_ssv.intent_id,owner_id,reward_date);
  update public.energy_ad_intents set claimed_at=now() where id=record_energy_ssv.intent_id;
  return pg_catalog.jsonb_build_object('kind','granted','amount',25,'used',used+1);
end; $$;
revoke all on function public.record_energy_ssv(uuid,uuid,text,timestamptz) from public,anon,authenticated;
grant execute on function public.record_energy_ssv(uuid,uuid,text,timestamptz) to service_role;
