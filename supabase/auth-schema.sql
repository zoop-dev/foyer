-- ════════════════════════════════════════════════════════════════
--  Foyer Auth — the Foyer-ecosystem OAuth2 identity provider
--  (served from foyer.zo0p.dev). Run in the Foyer Supabase SQL editor.
--  All access is via the service_role key from the provider's Functions —
--  RLS is ON with NO anon policies, so the user store is fully locked down.
-- ════════════════════════════════════════════════════════════════

create table if not exists foyer_users (
  id             uuid primary key default gen_random_uuid(),
  email          text not null,                 -- as entered (display)
  email_norm     text unique not null,          -- lowercased, for lookup/uniqueness
  password_hash  text not null default '',      -- pbkdf2$<iter>$<saltB64>$<hashB64>
  name           text not null default '',
  avatar         text not null default '',
  verified       boolean not null default false,
  created_at     timestamptz not null default now(),
  last_login     timestamptz
);

-- Single-use authorization codes (PKCE). Short-lived.
create table if not exists foyer_auth_codes (
  code            text primary key,
  user_id         uuid not null references foyer_users(id) on delete cascade,
  client_id       text not null,                -- the requesting Foyer site's domain
  redirect_uri    text not null,
  code_challenge  text not null default '',     -- S256 PKCE challenge
  expires_at      timestamptz not null,
  created_at      timestamptz not null default now()
);
create index if not exists foyer_auth_codes_exp_idx on foyer_auth_codes (expires_at);

-- SSO sessions (the foyer.zo0p.dev login cookie).
create table if not exists foyer_auth_sessions (
  token        text primary key,                -- random opaque token (cookie value)
  user_id      uuid not null references foyer_users(id) on delete cascade,
  expires_at   timestamptz not null,
  created_at   timestamptz not null default now()
);
create index if not exists foyer_auth_sessions_exp_idx on foyer_auth_sessions (expires_at);

alter table foyer_users         enable row level security;
alter table foyer_auth_codes    enable row level security;
alter table foyer_auth_sessions enable row level security;
-- (No anon policies on purpose — only the service_role key, used server-side by the
--  provider's Pages Functions, can read/write these. service_role bypasses RLS.)
