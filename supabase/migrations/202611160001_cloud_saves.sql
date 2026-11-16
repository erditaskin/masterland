-- Prepared migration only. Apply deliberately after reviewing the target project.
create table public.game_saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  schema_version integer not null check (schema_version = 1),
  revision bigint not null check (revision > 0),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  updated_at timestamptz not null default now()
);
create table public.game_save_receipts (
  user_id uuid not null references auth.users(id) on delete cascade,
  request_id uuid not null,
  revision bigint not null,
  created_at timestamptz not null default now(),
  primary key (user_id, request_id)
);
create table public.game_save_history (
  user_id uuid not null references auth.users(id) on delete cascade,
  revision bigint not null,
  schema_version integer not null,
  payload jsonb not null,
  archived_at timestamptz not null default now(),
  primary key (user_id, revision)
);
alter table public.game_saves enable row level security;
alter table public.game_save_receipts enable row level security;
alter table public.game_save_history enable row level security;
create policy own_save_read on public.game_saves for select to authenticated using ((select auth.uid()) = user_id);
create policy own_history_read on public.game_save_history for select to authenticated using ((select auth.uid()) = user_id);
revoke all on public.game_saves, public.game_save_receipts, public.game_save_history from anon, authenticated;
grant select on public.game_saves, public.game_save_history to authenticated;

-- Serialize writes per authenticated owner, including the first insert. Never accept a user_id argument.
create function public.write_game_save(expected_revision bigint, request_id uuid, save_payload jsonb, save_schema_version integer default 1)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  owner_id uuid := auth.uid();
  current_save public.game_saves%rowtype;
  committed_revision bigint;
begin
  if owner_id is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if expected_revision is null or expected_revision < 0 or request_id is null or save_schema_version <> 1 or jsonb_typeof(save_payload) is distinct from 'object'
    then raise exception 'Invalid snapshot' using errcode = '22023'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(owner_id::text, 0));
  select r.revision into committed_revision from public.game_save_receipts r
    where r.user_id = owner_id and r.request_id = write_game_save.request_id;
  if found then return pg_catalog.jsonb_build_object('kind', 'saved', 'revision', committed_revision); end if;
  select * into current_save from public.game_saves where user_id = owner_id;
  if coalesce(current_save.revision, 0) <> expected_revision then
    return pg_catalog.jsonb_build_object('kind', 'conflict', 'revision', coalesce(current_save.revision, 0));
  end if;
  if current_save.user_id is not null then
    insert into public.game_save_history(user_id, revision, schema_version, payload)
      values(owner_id, current_save.revision, current_save.schema_version, current_save.payload);
  end if;
  committed_revision := expected_revision + 1;
  insert into public.game_saves(user_id, schema_version, revision, payload)
    values(owner_id, save_schema_version, committed_revision, save_payload)
    on conflict(user_id) do update set schema_version = excluded.schema_version,
      revision = excluded.revision, payload = excluded.payload, updated_at = now();
  insert into public.game_save_receipts(user_id, request_id, revision)
    values(owner_id, write_game_save.request_id, committed_revision);
  delete from public.game_save_history h where h.user_id = owner_id and h.revision < committed_revision - 10;
  return pg_catalog.jsonb_build_object('kind', 'saved', 'revision', committed_revision);
end;
$$;
revoke all on function public.write_game_save(bigint, uuid, jsonb, integer) from public, anon;
grant execute on function public.write_game_save(bigint, uuid, jsonb, integer) to authenticated;
