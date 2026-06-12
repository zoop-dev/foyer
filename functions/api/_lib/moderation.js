import { sb } from './supabase.js';









const BLOCK_DOMAINS = [

  'grabify.link', 'grabify.icu', 'grabify.org', 'iplogger.org', 'iplogger.com', 'iplogger.ru',
  'iplogger.co', 'iplogger.info', 'iplogger.shop', 'iplogger.cn', 'ip-logger.org', '2no.co',
  'blasze.tk', 'blasze.com', 'yip.su', 'ps3cfw.com', 'ipgrabber.ru', 'ipgraber.ru', 'iplis.ru',
  'whatstheirip.com', '02ip.ru', 'ezstat.ru', 'lovebird.guru', 'stopify.co', 'leancoding.co',
  'freegiftcards.co', 'joinmy.site', 'curiouscat.club', 'catsnthings.fun', 'fortnitechat.site',
  'minecraftservervote.fun', 'headshot.monster', 'gaming-at-my.best', 'progaming.monster',
  'yt-creator.com', 'truloo.shop', 'sololearn.fun', 'quickmessage.us', 'ssh.tf',

  'xhamster.com', 'redtube.com', 'spankbang.com', 'brazzers.com', 'chaturbate.com',
  'stripchat.com', 'motherless.com', 'eporner.com', 'fapello.com', 'thothub.to',

  'free-robux.com', 'robux-generator.com', 'free-vbucks.com', 'nitro-gift.com', 'discordnitro.gift',
];
const BLOCK_HOST_KEYWORDS = [
  'porn', 'xvideos', 'xnxx', 'xxx', 'camgirl', 'rule34', 'escort', 'onlyfans-leak', 'hentai',
  'nsfw-', 'sex-cam', 'free-robux', 'robux-gen', 'free-vbucks', 'steam-gift-card-free', 'discord-nitro-free',
];




const DEFAULT_CFG = { enabled: true, dead: true, http: true, inappropriate: true, blocklist: [], keywords: [] };
const _cfgCache = new Map();   // host -> { cfg, at }
export async function getModConfig(env, host) {
  const k = host || '';
  const hit = _cfgCache.get(k);
  if (hit && Date.now() - hit.at < 60000) return hit.cfg;
  const { base, headers: H } = sb(env);
  let cfg = { ...DEFAULT_CFG };
  try {
    const r = await fetch(`${base}/rest/v1/foyer_meta?key=eq.moderation_config&select=value`, { headers: H, cf: { cacheTtl: 60, cacheEverything: true } });
    if (r.ok) { const rows = await r.json(); if (Array.isArray(rows) && rows[0] && rows[0].value) cfg = { ...DEFAULT_CFG, ...JSON.parse(rows[0].value) }; }
  } catch (e) {}
  if (host) {
    try {
      const r = await fetch(`${base}/rest/v1/foyer_sites?domain=eq.${encodeURIComponent(host)}&select=moderation_config`, { headers: H, cf: { cacheTtl: 60, cacheEverything: true } });
      if (r.ok) {
        const rows = await r.json();
        let ov = rows[0] && rows[0].moderation_config;
        if (typeof ov === 'string') { try { ov = JSON.parse(ov); } catch (e) { ov = null; } }
        if (ov && typeof ov === 'object') cfg = { ...cfg, ...ov };   // per-site overrides global
      }
    } catch (e) {}
  }
  _cfgCache.set(k, { cfg, at: Date.now() });
  return cfg;
}

function inappropriate(u, cfg) {
  if (cfg.inappropriate === false) return null;
  let host = '';
  try { host = new URL(u).hostname.toLowerCase().replace(/^www\./, ''); } catch { return null; }
  const domains = (cfg.blocklist && cfg.blocklist.length) ? BLOCK_DOMAINS.concat(cfg.blocklist) : BLOCK_DOMAINS;
  for (const d of domains) if (d && (host === d || host.endsWith('.' + d))) return 'blocked domain';
  const kws = (cfg.keywords && cfg.keywords.length) ? BLOCK_HOST_KEYWORDS.concat(cfg.keywords) : BLOCK_HOST_KEYWORDS;
  for (const k of kws) if (k && host.includes(k)) return 'blocked content';
  return null;
}


async function checkDead(url, cfg) {
  const attempt = async () => {
    try {
      const r = await fetch(url, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(5000), headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FoyerLinkCheck/1.0)' } });
      if (cfg.dead !== false && (r.status === 404 || r.status === 410)) return 'dead link';
      if (cfg.http !== false && r.status === 403) return 'forbidden (403)';
      if (cfg.http !== false && r.status === 401) return 'unauthorized (401)';
      return 'ok';
    } catch (e) {
      if (e && (e.name === 'TimeoutError' || e.name === 'AbortError')) return 'unverified';
      return 'error'; // DNS/connection failure
    }
  };
  let r = await attempt();
  if (r === 'error') { await new Promise(s => setTimeout(s, 400)); r = await attempt(); }
  if (r === 'ok' || r === 'unverified') return null;
  return r === 'error' ? (cfg.dead !== false ? 'dead link' : null) : r;
}

const URL_RE = /https?:\/\/[^\s"'<>)\]}]+/gi;
const cleanUrl = (u) => u.replace(/[.,;:!?)\]}'"]+$/, '');

export async function moderatePage(jsonStr, cfg) {
  cfg = cfg || DEFAULT_CFG;
  let state;
  try { state = JSON.parse(jsonStr); } catch { return { json: jsonStr, log: [] }; }
  if (!state || !Array.isArray(state.sections)) return { json: jsonStr, log: [] };

  const perSection = state.sections.map((sec) => {
    const set = new Set();
    JSON.stringify(sec).replace(URL_RE, (m) => { set.add(cleanUrl(m)); return m; });
    return [...set];
  });
  const all = [...new Set(perSection.flat())];
  if (!all.length) return { json: jsonStr, log: [] };

  const verdict = {};
  for (const u of all) { const r = inappropriate(u, cfg); if (r) verdict[u] = r; }

  if (cfg.dead !== false || cfg.http !== false) {
    const toCheck = all.filter((u) => !verdict[u]).slice(0, 40);
    const res = await Promise.allSettled(toCheck.map((u) => checkDead(u, cfg)));
    res.forEach((r, i) => { if (r.status === 'fulfilled' && r.value) verdict[toCheck[i]] = r.value; });
  }

  const log = [];
  state.sections = state.sections.map((sec, idx) => {
    const bad = perSection[idx].filter((u) => verdict[u]);
    if (!bad.length) return sec;
    bad.forEach((u) => log.push({ url: u, reason: verdict[u], block: sec.type || '' }));
    return { id: sec.id || Math.random().toString(36).slice(2, 9), type: 'callout', variant: 'warn', title: '', body: 'this content was removed automatically.', icon: '@ban', pad: 'sm' };
  });
  if (!log.length) return { json: jsonStr, log: [] };
  return { json: JSON.stringify(state), log };
}

const LOG_DDL = `CREATE TABLE IF NOT EXISTS moderation_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT, url TEXT, reason TEXT, block_type TEXT,
  removed_at TEXT NOT NULL DEFAULT (datetime('now')))`;


export async function logModeration(env, host, slug, log) {
  if (!log || !log.length) return;
  await env.DB.prepare(LOG_DDL).run();
  await env.DB.batch(log.map((e) => env.DB.prepare('INSERT INTO moderation_log (slug, url, reason, block_type) VALUES (?,?,?,?)').bind(slug || '', e.url, e.reason, e.block)));
  try {
    const { base, headers: H2 } = sb(env);
    const rows = log.map((e) => ({ domain: host || '', slug: slug || '', url: e.url, reason: e.reason, block_type: e.block }));
    await fetch(`${base}/rest/v1/foyer_moderation`, { method: 'POST', headers: { ...H2, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify(rows), signal: AbortSignal.timeout(4000) });
  } catch (e) {}
}
