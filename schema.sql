CREATE TABLE IF NOT EXISTS visitors (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  google_sub  TEXT    NOT NULL UNIQUE,
  email       TEXT    NOT NULL,
  name        TEXT    NOT NULL DEFAULT '',
  picture     TEXT    NOT NULL DEFAULT '',
  visit_count INTEGER NOT NULL DEFAULT 1,
  is_banned   INTEGER NOT NULL DEFAULT 0,
  role        TEXT    NOT NULL DEFAULT '',
  first_seen  TEXT    NOT NULL DEFAULT (datetime('now')),
  last_seen   TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reviews (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT    NOT NULL,
  slug        TEXT    NOT NULL UNIQUE,
  description TEXT    NOT NULL DEFAULT '',
  content     TEXT    NOT NULL DEFAULT '',
  cover_image TEXT    NOT NULL DEFAULT '',
  rating      INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS site_settings (
  key   TEXT NOT NULL PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

-- Neutral defaults; the live name/tagline are edited in the admin panel,
-- and the build-time config.json "name" is the meta/title fallback.
INSERT OR IGNORE INTO site_settings (key, value) VALUES
  ('name',       ''),
  ('tagline',    '');

-- Versions live in their own table now
CREATE TABLE IF NOT EXISTS versions (
  id  INTEGER PRIMARY KEY CHECK (id = 1),
  sys TEXT NOT NULL DEFAULT '1',
  ui  TEXT NOT NULL DEFAULT '1'
);
INSERT OR IGNORE INTO versions (id, sys, ui) VALUES (1, '1', '1');

CREATE TABLE IF NOT EXISTS page_views (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  sess      TEXT NOT NULL DEFAULT '',
  path      TEXT NOT NULL DEFAULT '/',
  referrer  TEXT NOT NULL DEFAULT '',
  ip        TEXT NOT NULL DEFAULT '',
  country   TEXT NOT NULL DEFAULT '',
  city      TEXT NOT NULL DEFAULT '',
  region    TEXT NOT NULL DEFAULT '',
  postal    TEXT NOT NULL DEFAULT '',
  lat       REAL,
  lon       REAL,
  tz        TEXT NOT NULL DEFAULT '',
  asn       TEXT NOT NULL DEFAULT '',
  isp       TEXT NOT NULL DEFAULT '',
  colo      TEXT NOT NULL DEFAULT '',
  continent TEXT NOT NULL DEFAULT '',
  is_eu     INTEGER NOT NULL DEFAULT 0,
  ua        TEXT NOT NULL DEFAULT '',
  screen    TEXT NOT NULL DEFAULT '',
  lang      TEXT NOT NULL DEFAULT '',
  http      TEXT NOT NULL DEFAULT '',
  tls       TEXT NOT NULL DEFAULT '',
  viewed_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at ON page_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(path);
CREATE INDEX IF NOT EXISTS idx_page_views_ip ON page_views(ip);
CREATE INDEX IF NOT EXISTS idx_page_views_country ON page_views(country);

CREATE TABLE IF NOT EXISTS banned_emails (
  email     TEXT NOT NULL PRIMARY KEY,
  banned_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tutorials (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT    NOT NULL,
  slug        TEXT    NOT NULL UNIQUE,
  description TEXT    NOT NULL DEFAULT '',
  content     TEXT    NOT NULL DEFAULT '',
  cover_image TEXT    NOT NULL DEFAULT '',
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
