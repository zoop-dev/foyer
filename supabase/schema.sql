-- ════════════════════════════════════════════════════════════════
--  Foyer control-plane — Supabase schema
--  Project: https://tvtfoghrdqwssdwvebuo.supabase.co
--  Paste this whole file into the Supabase SQL editor and Run.
-- ════════════════════════════════════════════════════════════════

-- ── helper: keep updated_at fresh ───────────────────────────────
create or replace function foyer_touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

-- ── 1. site registry + remote kill-switch ───────────────────────
create table if not exists foyer_sites (
  id              uuid primary key default gen_random_uuid(),
  domain          text unique not null,            -- 'lanson.org' — how a site identifies itself
  name            text not null default '',
  cf_project      text not null default '',         -- Cloudflare Pages project name
  licensed        boolean not null default true,    -- allowed to run Foyer?
  offline         boolean not null default false,   -- Foyer-level remote kill-switch
  offline_message text not null default 'This site is temporarily unavailable.',
  offline_bypass_hash    text not null default '',   -- sha256(hex) of the offline view-bypass code ('' = none)
  unlicensed_bypass_hash text not null default '',   -- sha256(hex) of the unlicensed view-bypass code ('' = none)
  notes           text not null default '',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
-- For tables created before the bypass columns existed:
alter table foyer_sites add column if not exists offline_bypass_hash    text not null default '';
alter table foyer_sites add column if not exists unlicensed_bypass_hash text not null default '';
drop trigger if exists trg_foyer_sites_touch on foyer_sites;
create trigger trg_foyer_sites_touch before update on foyer_sites
  for each row execute function foyer_touch_updated_at();

-- ── 2. changelog (rendered on /foyer) ───────────────────────────
create table if not exists foyer_changelog (
  id           uuid primary key default gen_random_uuid(),
  version      text not null default '',            -- '68'
  tag          text not null default 'feature',     -- feature | fix | release
  title        text not null,
  body         text not null default '',            -- markdown
  published    boolean not null default true,
  released_at  timestamptz not null default now(),
  created_at   timestamptz not null default now()
);
create index if not exists foyer_changelog_released_idx on foyer_changelog (released_at desc);

-- ── Row Level Security ──────────────────────────────────────────
-- anon key (public, used by sites) can READ only. No write policies are
-- defined for anon, so inserts/updates/deletes require the service_role
-- key (server-side / your admin tooling only).
alter table foyer_sites     enable row level security;
alter table foyer_changelog enable row level security;

drop policy if exists "anon read sites" on foyer_sites;
create policy "anon read sites" on foyer_sites
  for select to anon using (true);

drop policy if exists "anon read published changelog" on foyer_changelog;
create policy "anon read published changelog" on foyer_changelog
  for select to anon using (published = true);

-- ── seed: current Foyer sites ───────────────────────────────────
insert into foyer_sites (domain, name, cf_project, licensed, offline) values
  ('lanson.org', 'Zachary Lanson',     'lanson', true, false),
  ('burzer.org', 'Max-Emanuel Burzer', 'burzer', true, false)
on conflict (domain) do nothing;

-- ── seed: changelog (recent Foyer history) ──────────────────────
insert into foyer_changelog (version, tag, title, body, released_at) values
  ('68','feature','Animated & custom backgrounds','Per-page backgrounds: solid, gradient, aurora glow, or image — with optional animation.', now()),
  ('67','feature','Collection sections','Showcase a collection — item counts and “for sale” badges with prices.', now()),
  ('65','feature','Redesigned admin settings','Settings reorganised into clean tabbed panels.', now()),
  ('64','feature','Access modes','Public mode (no sign-in) and Lockdown (invite-only allowlist).', now()),
  ('62','feature','Movable nav & anchor links','Top / bottom / left / right navigation, per-visitor override, and in-page anchor links.', now()),
  ('61','fix','Mobile polish','Responsive layouts and images on phones.', now()),
  ('52','release','Foyer','The gated-site framework — magic-link & OAuth auth, a block page builder, and an admin CMS on Cloudflare.', now());

-- ════════════════════════════════════════════════════════════════
--  Quick checks (optional):
--    select domain, licensed, offline from foyer_sites;
--    select version, title from foyer_changelog order by released_at desc;
--  Flip a site offline (run as service role / SQL editor):
--    update foyer_sites set offline = true where domain = 'lanson.org';
-- ════════════════════════════════════════════════════════════════
