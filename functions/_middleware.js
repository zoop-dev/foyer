




const SB_URL  = 'https://tvtfoghrdqwssdwvebuo.supabase.co';

const SB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2dGZvZ2hyZHF3c3Nkd3ZlYnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMzk2ODksImV4cCI6MjA5NTgxNTY4OX0.n_CRdzQQKYNGDHYmoVxyKafFJCfezKKlSiZddx8MXH4';

async function blockedState(env, host) {
  try {
    const base = (env.SUPABASE_URL || SB_URL).replace(/\/$/, '');
    const key  = env.SUPABASE_ANON_KEY || SB_ANON;
    const r = await fetch(`${base}/rest/v1/foyer_sites?domain=eq.${encodeURIComponent(host)}&select=offline,licensed,offline_message`, {
      headers: { apikey: key, authorization: `Bearer ${key}` },
      cf: { cacheTtl: 60, cacheEverything: true },   // edge-cache the check ~60s
    });
    if (!r.ok) return null;                            // fail open
    const row = (await r.json())[0];
    if (!row) return null;                             // unregistered → fail open (soft)
    if (row.licensed === false) return { kind: 'unlicensed', eyebrow: 'Unavailable', title: 'This site isn’t licensed', message: row.offline_message || 'This site is not licensed to run Foyer.' };
    if (row.offline === true)   return { kind: 'offline',    eyebrow: 'Temporarily offline', title: 'This site is taking a short break', message: row.offline_message || '' };
    return null;
  } catch { return null; }                             // fail open
}
const esc = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

export async function onRequest(ctx) {
  const { request, next, env } = ctx;
  try {
    const url = new URL(request.url);
    const p = url.pathname;


    const hasExt = /\.[a-z0-9]+$/i.test(p);
    const accept = request.headers.get('accept') || '';
    if (request.method !== 'GET' || hasExt ||
        p.startsWith('/api') || p.startsWith('/foyer') || p.startsWith('/admin') ||
        !accept.includes('text/html')) {
      return next();
    }
    const state = await blockedState(env, url.hostname);
    if (state) {

      const res = await env.ASSETS.fetch(new Request(new URL('/offline', url), { headers: request.headers }));
      let html = await res.text();
      const swap = (id, val) => { if (val) html = html.replace(new RegExp(`(<[^>]*id="${id}"[^>]*>)[\\s\\S]*?(</)`), `$1${esc(val)}$2`); };
      swap('foyer-offline-eyebrow', state.eyebrow);
      swap('foyer-offline-title', state.title);
      swap('foyer-offline-msg', state.message);
      return new Response(html, { status: 200, headers: { 'content-type': 'text/html;charset=utf-8', 'cache-control': 'no-store' } });
    }
  } catch {  }
  return next();
}
