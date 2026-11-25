-- 花詩はな HP 用テーブル(共有プロジェクト manabit で実行)
-- ※ 合言葉は下の 'CHANGE_ME' を決めた言葉に書き換えてから実行
create extension if not exists pgcrypto;

create table if not exists hana_messages(
  id bigserial primary key, created_at timestamptz default now(),
  body text not null check (char_length(body)<=300), read_ok boolean default true);
create table if not exists hana_contacts(
  id bigserial primary key, created_at timestamptz default now(),
  name text check (char_length(name)<=50), reply_to text check (char_length(reply_to)<=100),
  kind text check (char_length(kind)<=30), body text not null check (char_length(body)<=1000));
create table if not exists hana_settings(key text primary key, value jsonb not null, updated_at timestamptz default now());
create table if not exists hana_admin(id int primary key default 1 check (id=1), pass_hash text not null);

alter table hana_messages enable row level security;
alter table hana_contacts enable row level security;
alter table hana_settings enable row level security;
alter table hana_admin enable row level security;

drop policy if exists "anon insert" on hana_messages;
create policy "anon insert" on hana_messages for insert to anon with check (true);
drop policy if exists "anon insert" on hana_contacts;
create policy "anon insert" on hana_contacts for insert to anon with check (true);
drop policy if exists "anon read" on hana_settings;
create policy "anon read" on hana_settings for select to anon using (true);
-- hana_admin にはポリシーなし = 外から一切見えない

insert into hana_admin(id,pass_hash) values (1, crypt('CHANGE_ME', gen_salt('bf')))
on conflict (id) do nothing;

create or replace function hana_verify(p text) returns boolean
language sql security definer set search_path=public,extensions as
$$ select exists(select 1 from hana_admin where pass_hash = crypt(p, pass_hash)) $$;

create or replace function hana_save_setting(p text,k text,v jsonb) returns void
language plpgsql security definer set search_path=public,extensions as $$
begin
  if not hana_verify(p) then raise exception 'denied'; end if;
  if k not in ('schedule','news','profile','outfits','gallery') then raise exception 'bad key'; end if;
  insert into hana_settings(key,value,updated_at) values (k,v,now())
  on conflict (key) do update set value=excluded.value, updated_at=now();
end $$;

create or replace function hana_list_messages(p text) returns setof hana_messages
language plpgsql security definer set search_path=public,extensions as $$
begin
  if not hana_verify(p) then raise exception 'denied'; end if;
  return query select * from hana_messages order by id desc limit 200;
end $$;

create or replace function hana_list_contacts(p text) returns setof hana_contacts
language plpgsql security definer set search_path=public,extensions as $$
begin
  if not hana_verify(p) then raise exception 'denied'; end if;
  return query select * from hana_contacts order by id desc limit 200;
end $$;

revoke all on function hana_verify(text),hana_save_setting(text,text,jsonb),hana_list_messages(text),hana_list_contacts(text) from public;
grant execute on function hana_verify(text),hana_save_setting(text,text,jsonb),hana_list_messages(text),hana_list_contacts(text) to anon;
