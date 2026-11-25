-- 花詩はなHP: 匿名メッセージ / お問い合わせ(Supabase SQL Editorで実行)
create table if not exists hana_messages (
  id bigint generated always as identity primary key,
  body text not null check (char_length(body) between 1 and 300),
  read_ok boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists hana_contacts (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 1 and 50),
  reply_to text not null check (char_length(reply_to) between 1 and 100),
  kind text not null,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);
alter table hana_messages enable row level security;
alter table hana_contacts enable row level security;
-- 来訪者(anon)は「送るだけ」。読み取りは管理側(認証済み)のみ
create policy "anon insert messages" on hana_messages for insert to anon with check (true);
create policy "anon insert contacts" on hana_contacts for insert to anon with check (true);
