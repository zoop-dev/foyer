








const BLOCK_DOMAINS = [
  'grabify.link', 'iplogger.org', 'iplogger.com', 'iplogger.ru', '2no.co', 'blasze.tk',
  'yip.su', 'ps3cfw.com', 'ipgrabber.ru', 'iplis.ru', 'whatstheirip.com',
];
const BLOCK_HOST_KEYWORDS = ['porn', 'xvideos', 'xnxx', 'xxx', 'camgirl', 'rule34', 'escort', 'onlyfans-leak', 'free-robux', 'robux-gen', 'steam-gift-card-free'];

function inappropriate(u) {
  let host = '';
  try { host = new URL(u).hostname.toLowerCase().replace(/^www\./, ''); } catch { return null; }
  for (const d of BLOCK_DOMAINS) if (host === d || host.endsWith('.' + d)) return 'blocked domain';
  for (const k of BLOCK_HOST_KEYWORDS) if (host.includes(k)) return 'blocked content';
  return null;
}


async function checkDead(url) {
  const attempt = async () => {
    try {
      const r = await fetch(url, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(5000), headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FoyerLinkCheck/1.0)' } });
      if (r.status === 404 || r.status === 410) return 'dead link';
      if (r.status === 403) return 'forbidden (403)';
      if (r.status === 401) return 'unauthorized (401)';
      return 'ok';
    } catch (e) {
      if (e && (e.name === 'TimeoutError' || e.name === 'AbortError')) return 'unverified';
      return 'error'; // DNS/connection failure
    }
  };
  let r = await attempt();
  if (r === 'error') { await new Promise(s => setTimeout(s, 400)); r = await attempt(); }
  if (r === 'ok' || r === 'unverified') return null;
  return r === 'error' ? 'dead link' : r;   // 'dead link' or 'forbidden (403)'
}

const URL_RE = /https?:\/\/[^\s"'<>)\]}]+/gi;
const cleanUrl = (u) => u.replace(/[.,;:!?)\]}'"]+$/, '');

export async function moderatePage(jsonStr) {
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
  for (const u of all) { const r = inappropriate(u); if (r) verdict[u] = r; }

  const toCheck = all.filter((u) => !verdict[u]).slice(0, 40);
  const res = await Promise.allSettled(toCheck.map((u) => checkDead(u)));
  res.forEach((r, i) => { if (r.status === 'fulfilled' && r.value) verdict[toCheck[i]] = r.value; });

  const log = [];
  state.sections = state.sections.map((sec, idx) => {
    const bad = perSection[idx].filter((u) => verdict[u]);
    if (!bad.length) return sec;
    bad.forEach((u) => log.push({ url: u, reason: verdict[u], block: sec.type || '' }));
    return { id: sec.id || Math.random().toString(36).slice(2, 9), type: 'callout', variant: 'warn', title: '', body: 'This content was removed.', icon: '', pad: sec.pad || 'md' };
  });
  if (!log.length) return { json: jsonStr, log: [] };
  return { json: JSON.stringify(state), log };
}

const LOG_DDL = `CREATE TABLE IF NOT EXISTS moderation_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT, url TEXT, reason TEXT, block_type TEXT,
  removed_at TEXT NOT NULL DEFAULT (datetime('now')))`;
export async function logModeration(env, slug, log) {
  if (!log || !log.length) return;
  await env.DB.prepare(LOG_DDL).run();
  await env.DB.batch(log.map((e) => env.DB.prepare('INSERT INTO moderation_log (slug, url, reason, block_type) VALUES (?,?,?,?)').bind(slug || '', e.url, e.reason, e.block)));
}
