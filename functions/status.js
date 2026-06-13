



import { sb } from './api/_lib/supabase.js';

export async function onRequest(ctx) {
  const { request, env } = ctx;
  const url = new URL(request.url);
  const host = env.FOYER_DOMAIN || url.hostname;

  let name = host, dbOk = true, siteOffline = false, cpOffline = false, licensed = true;

  try {
    const n = await env.DB.prepare("SELECT value FROM site_settings WHERE key='name'").first();
    name = (n && n.value) || host;
    const off = await env.DB.prepare("SELECT value FROM site_settings WHERE key='site_offline'").first();
    siteOffline = !!(off && off.value === '1');
  } catch (e) { dbOk = false; }

  try {
    const { base, headers } = sb(env);
    const r = await fetch(`${base}/rest/v1/foyer_sites?domain=eq.${encodeURIComponent(host)}&select=offline,licensed`, { headers, cf: { cacheTtl: 30 } });
    if (r.ok) { const row = (await r.json())[0]; if (row) { cpOffline = row.offline === true; licensed = row.licensed !== false; } }
  } catch (e) {}

  const components = [
    { label: 'Website', ok: !siteOffline && !cpOffline },
    { label: 'Database', ok: dbOk },
    { label: 'Content delivery', ok: true },
    { label: 'License', ok: licensed },
  ];
  const allOk = components.every((c) => c.ok);
  const anyDown = components.some((c) => !c.ok);
  const overall = allOk ? { t: 'All systems operational', c: '#3fb96a', e: '✅' }
    : (components[0].ok && components[1].ok) ? { t: 'Partial degradation', c: '#e0a93f', e: '⚠️' }
    : { t: 'Service disruption', c: '#e0556a', e: '🔴' };
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const now = new Date().toUTCString();

  const html = `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="refresh" content="60"><meta name="robots" content="noindex">
<title>Status — ${esc(name)}</title>
<style>
  :root{color-scheme:dark}
  *{box-sizing:border-box}
  body{margin:0;min-height:100vh;display:flex;align-items:flex-start;justify-content:center;background:#0a0e12;color:#e7edf3;font-family:'Inter',system-ui,-apple-system,sans-serif;padding:8vh 1.2rem 4rem}
  .wrap{width:100%;max-width:560px}
  .name{font-size:.72rem;letter-spacing:.22em;text-transform:uppercase;color:#5b6976;margin-bottom:1.2rem}
  .hero{display:flex;align-items:center;gap:.8rem;border:1px solid ${overall.c}44;background:${overall.c}12;border-radius:14px;padding:1.3rem 1.4rem;margin-bottom:1.6rem}
  .hero .dot{width:11px;height:11px;border-radius:50%;background:${overall.c};box-shadow:0 0 0 4px ${overall.c}33;flex-shrink:0}
  .hero h1{font-size:1.15rem;font-weight:500;margin:0;color:${overall.c}}
  .comp{display:flex;align-items:center;justify-content:space-between;padding:.95rem 1.1rem;border:1px solid #1c242d;border-radius:11px;margin-bottom:.6rem;background:#0e141a}
  .comp .l{font-size:.92rem;font-weight:400}
  .comp .s{font-size:.74rem;font-weight:500;display:flex;align-items:center;gap:.45rem}
  .comp .s .d{width:8px;height:8px;border-radius:50%}
  .ok{color:#3fb96a}.ok .d{background:#3fb96a}
  .down{color:#e0556a}.down .d{background:#e0556a}
  .foot{margin-top:1.8rem;font-size:.7rem;color:#46525e;text-align:center;line-height:1.8}
  .foot a{color:#5b6976}
</style></head><body><div class="wrap">
  <div class="name">${esc(name)} · Status</div>
  <div class="hero"><span class="dot"></span><h1>${overall.e} ${overall.t}</h1></div>
  ${components.map((c) => `<div class="comp"><span class="l">${esc(c.label)}</span><span class="s ${c.ok ? 'ok' : 'down'}"><span class="d"></span>${c.ok ? 'Operational' : 'Disrupted'}</span></div>`).join('')}
  <div class="foot">Last checked ${esc(now)} · refreshes automatically<br><a href="/">← back to ${esc(name)}</a></div>
</div></body></html>`;
  return new Response(html, { status: anyDown ? 503 : 200, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}
