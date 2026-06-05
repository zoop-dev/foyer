




const SB_URL  = 'https://tvtfoghrdqwssdwvebuo.supabase.co';

const SB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2dGZvZ2hyZHF3c3Nkd3ZlYnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMzk2ODksImV4cCI6MjA5NTgxNTY4OX0.n_CRdzQQKYNGDHYmoVxyKafFJCfezKKlSiZddx8MXH4';

async function siteState(env, host) {
  try {
    const base = (env.SUPABASE_URL || SB_URL).replace(/\/$/, '');
    const key  = env.SUPABASE_ANON_KEY || SB_ANON;
    const r = await fetch(`${base}/rest/v1/foyer_sites?domain=eq.${encodeURIComponent(host)}&select=offline,licensed,offline_message,offline_bypass_hash,unlicensed_bypass_hash,hide_branding`, {
      headers: { apikey: key, authorization: `Bearer ${key}` },
      cf: { cacheTtl: 60, cacheEverything: true },   // edge-cache the check ~60s
    });
    if (!r.ok) return { block: null, hideBranding: false };       // fail open
    const row = (await r.json())[0];
    if (!row) return { block: null, hideBranding: false };        // unregistered → fail open (soft)
    const hideBranding = row.hide_branding === true;
    if (row.licensed === false) return { block: { kind: 'unlicensed', eyebrow: 'Unavailable', title: 'This site isn’t licensed', message: row.offline_message || 'This site is not licensed to run Foyer.', bypassHash: row.unlicensed_bypass_hash || '' }, hideBranding };
    if (row.offline === true)   return { block: { kind: 'offline',    eyebrow: 'Temporarily offline', title: 'This site is taking a short break', message: row.offline_message || '', bypassHash: row.offline_bypass_hash || '' }, hideBranding };
    return { block: null, hideBranding };
  } catch { return { block: null, hideBranding: false }; }        // fail open
}
const esc = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const escA = (s) => esc(s).replace(/"/g,'&quot;');




const OG_BOT = /(facebookexternalhit|Facebot|Twitterbot|Slackbot|Discordbot|LinkedInBot|WhatsApp|TelegramBot|Pinterest|redditbot|Applebot|SkypeUriPreview|vkShare|embedly|Iframely|Google-InspectionTool)/i;
async function injectOg(ctx, url) {
  const { request, env } = ctx;
  if (!env.DB) return null;
  try {
    const slug = url.pathname === '' ? '/' : url.pathname;
    const row = await env.DB.prepare('SELECT title, page_json FROM pages WHERE slug = ? AND is_published = 1').bind(slug).first();
    if (!row) return null;
    let p = {}; try { p = JSON.parse(row.page_json || '{}'); } catch { p = {}; }
    const title = p.page_title || row.title || '';
    const desc  = p.page_subtitle || '';
    let image = p.page_image || '';
    if (image && !/^https?:\/\//.test(image)) image = `https://${url.hostname}${image.startsWith('/') ? '' : '/'}${image}`;
    if (!title && !desc && !image) return null;
    const res = await env.ASSETS.fetch(new Request(new URL('/index.html', url), { headers: request.headers }));
    let html = await res.text();
    const pageUrl = `https://${url.hostname}${slug}`;
    const setM = (id, val) => { if (!val) return; html = html.replace(new RegExp(`<meta\\b[^>]*\\bid="${id}"[^>]*>`), (tag) => tag.replace(/content="[^"]*"/, `content="${escA(val)}"`)); };
    if (title) { html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`); setM('og-title', title); setM('tw-title', title); }
    if (desc)  { setM('og-desc', desc); setM('tw-desc', desc); }
    if (image) { setM('og-image', image); setM('tw-image', image); setM('tw-card', 'summary_large_image'); }
    html = html.replace(/<meta\b[^>]*\bid="og-url"[^>]*>/, (t) => t.replace(/content="[^"]*"/, `content="${escA(pageUrl)}"`))
               .replace(/<link\b[^>]*\bid="canonical"[^>]*>/, (t) => t.replace(/href="[^"]*"/, `href="${escA(pageUrl)}"`));
    return new Response(html, { status: 200, headers: { 'content-type': 'text/html;charset=utf-8', 'cache-control': 'public, max-age=300' } });
  } catch { return null; }
}

async function sha256Hex(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequest(ctx) {
  const { request, next, env } = ctx;
  try {
    const url = new URL(request.url);
    const p = url.pathname;


    const hasExt = /\.[a-z0-9]+$/i.test(p);
    const accept = request.headers.get('accept') || '';



    if (request.method !== 'GET' || hasExt ||
        p.startsWith('/api') || p.startsWith('/foyer') ||
        !accept.includes('text/html')) {
      return next();
    }
    const { block: state, hideBranding } = await siteState(env, url.hostname);
    if (state) {




      const fb = url.searchParams.get('__fb');
      if (fb && state.bypassHash && (await sha256Hex(fb)) === state.bypassHash) {
        return next();
      }

      const res = await env.ASSETS.fetch(new Request(new URL('/offline', url), { headers: request.headers }));
      let html = await res.text();
      const swap = (id, val) => { if (val) html = html.replace(new RegExp(`(<[^>]*id="${id}"[^>]*>)[\\s\\S]*?(</)`), `$1${esc(val)}$2`); };
      swap('foyer-offline-eyebrow', state.eyebrow);
      swap('foyer-offline-title', state.title);
      swap('foyer-offline-msg', state.message);
      return new Response(html, { status: 200, headers: { 'content-type': 'text/html;charset=utf-8', 'cache-control': 'no-store' } });
    }

    if (!p.startsWith('/admin') && OG_BOT.test(request.headers.get('user-agent') || '')) {
      const og = await injectOg(ctx, url);
      if (og) return og;
    }



    if (hideBranding && !p.startsWith('/admin')) {
      try {
        const res = await env.ASSETS.fetch(new Request(new URL('/index.html', url), { headers: request.headers }));
        let html = await res.text();
        html = html.replace('</head>', '<style>.made-by,.foyer-credit{display:none!important}</style><script>window.__FOYER_NOBRAND=1</script></head>')
                   .replace(/<meta name="generator"[^>]*>/, '');
        return new Response(html, { status: res.status, headers: { 'content-type': 'text/html;charset=utf-8', 'cache-control': 'public, max-age=120' } });
      } catch {  }
    }
  } catch {  }
  return next();
}
