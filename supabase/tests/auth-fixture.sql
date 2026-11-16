-- Test-only minimal Auth schema. Never apply this file to Supabase.
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
create schema auth;
create table auth.users(id uuid primary key,email text unique,last_sign_in_at timestamptz);
create table auth.identities(user_id uuid references auth.users(id) on delete cascade,provider text);
create table auth.sessions(user_id uuid references auth.users(id) on delete cascade);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid; $$;
grant usage on schema auth,public to anon,authenticated,service_role;
