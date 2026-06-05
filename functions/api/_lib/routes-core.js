


const AI_SB_URL = 'https://tvtfoghrdqwssdwvebuo.supabase.co';
const AI_SB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2dGZvZ2hyZHF3c3Nkd3ZlYnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMzk2ODksImV4cCI6MjA5NTgxNTY4OX0.n_CRdzQQKYNGDHYmoVxyKafFJCfezKKlSiZddx8MXH4';
async function aiEnabledForHost(env, host) {
  try {
    const base = (env.SUPABASE_URL || AI_SB_URL).replace(/\/$/, '');
    const key = env.SUPABASE_ANON_KEY || AI_SB_ANON;
    const r = await fetch(`${base}/rest/v1/foyer_sites?domain=eq.${encodeURIComponent(host)}&select=ai_enabled`, {
      headers: { apikey: key, authorization: `Bearer ${key}` }, cf: { cacheTtl: 60, cacheEverything: true },
    });
    if (!r.ok) return true;
    const row = (await r.json())[0];
    return !(row && row.ai_enabled === false);
  } catch { return true; }
}

export async function handleCore(ctx) {
  const { route, method, request, env, headers, respond, compressJson, decompressJson, CREATE_SESSIONS, CREATE_BANNED_EMAILS, CREATE_PAGES, authed, visitorAuthed, _adminRole } = ctx;

  if (route === 'config' && method === 'GET') {
    return respond({ google_client_id: env.GOOGLE_CLIENT_ID || '', github_client_id: env.GITHUB_CLIENT_ID || '', discord_client_id: env.DISCORD_CLIENT_ID || '', magic_enabled: !!env.RESEND_API_KEY, turnstile_site_key: env.TURNSTILE_SITE_KEY || '', recaptcha_site_key: env.RECAPTCHA_SITE_KEY || '' });
  }





  if (route === 'ai/page' && method === 'GET') {
    if (!authed()) return respond({ error: 'unauthorized' }, 401);
    const enabled = !!env.AI && await aiEnabledForHost(env, new URL(request.url).hostname);
    return respond({ enabled });
  }

  if (route === 'ai/page' && method === 'POST') {
    if (!authed()) return respond({ error: 'unauthorized' }, 401);
    if (!env.AI) return respond({ error: 'Workers AI isn’t enabled for this site.' }, 503);
    if (!(await aiEnabledForHost(env, new URL(request.url).hostname))) return respond({ error: 'The AI assistant is disabled for this site.' }, 403);
    const body = await request.json().catch(() => ({}));

    let history = Array.isArray(body.messages) ? body.messages : (body.prompt ? [{ role: 'user', content: String(body.prompt) }] : []);
    history = history.filter(m => m && (m.role === 'user' || m.role === 'assistant') && m.content)
      .slice(-12).map(m => ({ role: m.role, content: String(m.content).slice(0, 2000) }));
    if (!history.length) return respond({ error: 'Say something.' }, 400);

    let current = Array.isArray(body.sections) ? body.sections : [];
    current = current.map(({ id, anchor, ...rest }) => rest).slice(0, 40);

    const schema = String(body.schema || '').slice(0, 6000) ||
      `- hero: eyebrow, name, tagline
- features: heading, sub, items:[{icon, title, text}]
- pricing: heading, items:[{name, price, period, features, featured}]
- cta: text, button_label, button_url
- contactform: heading, sub`;

    const site = body.site || {};
    let siteCtx = '';
    if (site.name) {
      siteCtx = `\nThe site is "${String(site.name).slice(0, 80)}".`;
      if (Array.isArray(site.pages) && site.pages.length) {
        siteCtx += ` Its pages (use slugs for links): ${site.pages.slice(0, 40).map(p => `"${String(p.title || '').slice(0, 40)}" (${String(p.slug || '').slice(0, 40)})`).join(', ')}.`;
      }
      siteCtx += ` Keep copy on-brand.`;
    }

    const system = `You are the Foyer assistant — a friendly, concise helper for building one web page, chatting with the site's owner.
A page is a JSON array of "sections" (blocks). Available block types and fields (icon = a single emoji; pricing "features" is a newline-separated string; yes/no fields use "yes"/"no"):
${schema}
${siteCtx}

The current page is:
${current.length ? JSON.stringify(current) : '(empty — no sections yet)'}

How to respond:
- Reply in plain, brief conversational text. Ask a clarifying question or propose a short plan when useful.
- ONLY when you are actually creating or changing the page, append the FULL updated page as a JSON array of blocks at the very end of your message inside a fenced code block: \`\`\`json … \`\`\`. Include EVERY block (unchanged ones too). If you are just chatting or planning, do NOT include any JSON.
- Write real, specific copy (never lorem ipsum). Leave image/url fields out unless you have a real value. A good page is 8-14 blocks, starts with a hero/banner and ends with a contact form or CTA.`;

    let out;
    try {
      out = await env.AI.run('@cf/meta/llama-3.2-3b-instruct', {
        messages: [{ role: 'system', content: system }, ...history],
        max_tokens: 4096, temperature: 0.5,
      });
    } catch { return respond({ error: 'The AI request failed — try again.' }, 502); }

    const txt = (out && out.response) || '';

    let sections = null, reply = txt;
    const fence = txt.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/i);
    const bare = fence ? null : txt.match(/\n(\[[\s\S]*\])\s*$/);
    const raw = fence ? fence[1] : (bare ? bare[1] : null);
    if (raw) {
      try { const parsed = JSON.parse(raw); if (Array.isArray(parsed)) { sections = parsed; reply = txt.replace(fence ? fence[0] : bare[1], '').trim(); } } catch {}
    }
    if (!reply) reply = sections ? 'Done — updated the page.' : '…';
    return respond({ reply, sections });
  }

  const CREATE_VERSIONS = `CREATE TABLE IF NOT EXISTS versions (
    id  INTEGER PRIMARY KEY CHECK (id = 1),
    ui  TEXT NOT NULL DEFAULT '1'
  )`;

  if (route === 'version' && method === 'GET') {
    await env.DB.prepare(CREATE_VERSIONS).run();
    await env.DB.prepare("INSERT OR IGNORE INTO versions (id, ui) VALUES (1, '1')").run();
    const row = await env.DB.prepare('SELECT ui FROM versions WHERE id = 1').first().catch(() => null);
    return respond({ ui_version: row?.ui || '0' });
  }

  if (route === 'version' && method === 'PUT') {
    if (!authed()) return respond({ error: 'unauthorized' }, 401);
    await env.DB.prepare(CREATE_VERSIONS).run();
    await env.DB.prepare("INSERT OR IGNORE INTO versions (id, ui) VALUES (1, '1')").run();
    const b = await request.json().catch(() => ({}));
    if (b.ui != null) await env.DB.prepare('UPDATE versions SET ui = ? WHERE id = 1').bind(String(b.ui)).run();
    const row = await env.DB.prepare('SELECT ui FROM versions WHERE id = 1').first();
    return respond({ ok: true, ui_version: row?.ui });
  }

  if (route === 'me' && method === 'GET') {
    const vAuth = await visitorAuthed();
    if (vAuth === 'banned') return respond({ banned: true }, 403);
    if (vAuth !== 'ok') return respond({ error: 'unauthorized' }, 401);

    const st = request.headers.get('X-Session-Token') || '';
    if (st) await env.DB.prepare("UPDATE sessions SET last_seen = datetime('now') WHERE token = ?").bind(st).run().catch(() => {});
    return respond({ ok: true });
  }

  if (route === 'admin-check' && method === 'GET') {
    return respond({ role: _adminRole || null });
  }

  return null;
}
