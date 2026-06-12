
import { canonHost } from './site-config.js';
import { isPro } from './plan.js';
import { ragEnabled, ragSearch, ragUpsertPage, ragStats, extractPageText } from './rag.js';
import { sb } from './supabase.js';


async function aiEnabledForHost(env, host) {
  try {
    const { base, headers } = sb(env);
    const r = await fetch(`${base}/rest/v1/foyer_sites?domain=eq.${encodeURIComponent(host)}&select=ai_enabled`, {
      headers, cf: { cacheTtl: 60, cacheEverything: true },
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



  if (route && route.startsWith('sb/')) {
    const { base: sbBase, headers: sbH } = sb(env);
    const host = new URL(request.url).hostname, enc = encodeURIComponent(host);
    const get = (p, ttl) => fetch(`${sbBase}/rest/v1/${p}`, { headers: sbH, cf: { cacheTtl: ttl, cacheEverything: true } }).then(r => r.ok ? r.json() : null).catch(() => null);

    if (route === 'sb/site' && method === 'GET') {
      const row = ((await get(`foyer_sites?domain=eq.${enc}&select=offline,licensed,hide_branding,ai_enabled,plan`, 30)) || [])[0] || null;
      return respond({
        offline:       !!(row && row.offline === true),
        licensed:      !(row && row.licensed === false),
        hide_branding: !!(row && row.hide_branding === true),
        ai_enabled:    !(row && row.ai_enabled === false),
        plan:          (row && row.plan) || 'free',
      });
    }
    if (route === 'sb/version' && method === 'GET') {
      const rows = await get(`foyer_meta?key=eq.latest_version&select=value`, 60);
      return respond({ version: (rows && rows[0] && rows[0].value) || null });
    }
    if (route === 'sb/flags' && method === 'GET') {
      const rows = await get(`foyer_flags?scope=in.(global,${enc})&select=key,value`, 60);
      const f = {}; (rows || []).forEach(r => { f[r.key] = r.value; });
      return respond(f);
    }
    if (route === 'sb/announcements' && method === 'GET') {
      const rows = await get(`foyer_announcements?scope=in.(global,${enc})&active=eq.true&select=id,message,level,hide_after,starts_at,ends_at&order=created_at.desc`, 30);
      return respond(rows || []);
    }
    if (route === 'sb/beat' && method === 'POST') {
      const b = await request.json().catch(() => ({}));
      await fetch(`${sbBase}/rest/v1/foyer_heartbeats?on_conflict=domain`, {
        method: 'POST', headers: { ...sbH, 'content-type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({ domain: host, live_version: String(b.version || '').slice(0, 20), last_seen: new Date().toISOString() }),
      }).catch(() => {});
      return respond({ ok: true });
    }
    if (route === 'sb/err' && method === 'POST') {
      const b = await request.json().catch(() => ({}));
      await fetch(`${sbBase}/rest/v1/foyer_errors`, {
        method: 'POST', headers: { ...sbH, 'content-type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ domain: host, message: String(b.message || '').slice(0, 500), stack: String(b.stack || '').slice(0, 2000), url: String(b.url || '').slice(0, 300), ua: (request.headers.get('user-agent') || '').slice(0, 300) }),
      }).catch(() => {});
      return respond({ ok: true });
    }
  }




  if (route === 'ai/ask' && method === 'POST') {
    if (!env.AI) return respond({ error: 'This assistant isn’t available right now.' }, 503);
    const host = canonHost(env, request);
    if (!(await isPro(env, host))) return respond({ error: '“Ask this site” is a Pro feature.' }, 403);
    const enRow = await env.DB.prepare("SELECT value FROM site_settings WHERE key='ask_enabled'").first().catch(() => null);
    if (!(enRow && enRow.value === '1')) return respond({ error: 'The site assistant is turned off.' }, 403);

    const body = await request.json().catch(() => ({}));
    let history = Array.isArray(body.messages) ? body.messages : (body.prompt ? [{ role: 'user', content: String(body.prompt) }] : []);
    history = history.filter(m => m && (m.role === 'user' || m.role === 'assistant') && m.content)
      .slice(-8).map(m => ({ role: m.role, content: String(m.content).slice(0, 1500) }));
    if (!history.length) return respond({ error: 'Ask a question.' }, 400);

    const setRow = async (k) => (await env.DB.prepare('SELECT value FROM site_settings WHERE key=?').bind(k).first().catch(() => null))?.value || '';
    const ownerPrompt = (await setRow('ask_prompt')).slice(0, 2000);
    const siteName = (await setRow('name')) || host;

    let corpus = '';

    if (ragEnabled(env)) {
      const q = [...history].reverse().find(m => m.role === 'user')?.content || '';
      try { const hits = await ragSearch(env, q, 6); if (hits.length) corpus = hits.map(h => h.text).join('\n\n').slice(0, 9000); } catch {}
    }

    if (!corpus) {
      await env.DB.prepare(CREATE_PAGES).run();
      await env.DB.prepare('ALTER TABLE pages ADD COLUMN pw_hash TEXT').run().catch(() => {});
      const { results } = await env.DB.prepare("SELECT title, slug, page_json FROM pages WHERE is_published = 1 AND slug != '__404__' AND (pw_hash IS NULL OR pw_hash = '')").all().catch(() => ({ results: [] }));
      const parts = [];
      for (const p of (results || [])) {
        let x = '';
        try { x = extractPageText(await decompressJson(p.page_json)); } catch {}
        if (x.trim()) parts.push(`# ${p.title || p.slug}\n${x.slice(0, 2500)}`);
      }
      corpus = parts.join('\n\n').slice(0, 9000);
    }
    corpus = corpus || '(This site has no readable page content yet.)';

    const system = `You are the website assistant for "${siteName}". Answer visitors' questions using ONLY the SITE CONTENT below. If the answer isn't in the content, say you're not sure and suggest the visitor use the site's contact form — never invent facts, prices, dates, or links. Keep answers short, friendly, and plain-text.
${ownerPrompt ? `\nThe site owner's instructions for you: ${ownerPrompt}\n` : ''}
--- SITE CONTENT ---
${corpus}`;

    let out;
    try {
      out = await env.AI.run('@cf/meta/llama-3.2-3b-instruct', {
        messages: [{ role: 'system', content: system }, ...history],
        max_tokens: 700, temperature: 0.3,
      });
    } catch { return respond({ error: 'The assistant is busy — please try again.' }, 502); }
    return respond({ reply: ((out && out.response) || '').trim() || 'Sorry — I’m not sure about that one.' });
  }

  if (route === 'ai/reindex' && method === 'GET') {
    if (!authed()) return respond({ error: 'unauthorized' }, 401);
    if (!ragEnabled(env)) return respond({ enabled: false });
    return respond({ enabled: true, index: await ragStats(env) });
  }


  if (route === 'ai/reindex' && method === 'POST') {
    if (!authed()) return respond({ error: 'unauthorized' }, 401);
    if (!ragEnabled(env)) return respond({ error: 'Site search isn’t configured (needs the Pi RAG store).' }, 503);
    await env.DB.prepare(CREATE_PAGES).run();
    await env.DB.prepare('ALTER TABLE pages ADD COLUMN pw_hash TEXT').run().catch(() => {});
    const { results } = await env.DB.prepare("SELECT title, slug, page_json FROM pages WHERE is_published = 1 AND slug != '__404__' AND (pw_hash IS NULL OR pw_hash = '')").all().catch(() => ({ results: [] }));
    let pages = 0, chunks = 0;
    for (const p of (results || [])) {
      let text = '';
      try { text = extractPageText(await decompressJson(p.page_json)); } catch {}
      if (!text.trim()) continue;
      try { chunks += await ragUpsertPage(env, p.slug, `${p.title || ''}. ${text}`); pages++; } catch {}
    }
    return respond({ ok: true, pages, chunks, index: await ragStats(env) });
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

    const schema = String(body.schema || '').slice(0, 14000) ||
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


    const pageList = current.length
      ? current.map((s, i) => `[${i}] ${s.type}${s.heading ? ` — "${String(s.heading).slice(0, 40)}"` : s.name ? ` — "${String(s.name).slice(0, 40)}"` : ''}`).join('\n')
      : '(empty — no sections yet)';

    const system = `You are the Foyer assistant — a friendly, concise helper for building one web page, chatting with the site's owner.

About Foyer (use only if the owner asks): Foyer is the website platform this site is built on — a config-driven site builder and framework created by Zach (zo0p.dev). It gives each site a visual page builder (the blocks below), built-in sign-in/auth, image & file hosting, and runs on Cloudflare. If they ask a basic question about Foyer or who made it, answer briefly and warmly; otherwise your job is building and editing THIS page.

A page is a list of "sections" (blocks). Each block is a JSON object with a "type". Available block types and their fields (a|b|c = pick one of those values; field="example" shows the kind of value; items:[{…}] is a list of objects; icon = one emoji; pricing "features" is a newline-separated string; yes/no fields use "yes"/"no"):
${schema}
${siteCtx}

The current page (index: type):
${pageList}

How to respond — keep your text reply to ONE short sentence (a question or a one-line plan), then, ONLY when actually changing the page, end your message with ONE fenced \`\`\`json … \`\`\` block. Inside it, do the SMALLEST change — do NOT resend unchanged blocks:
- ADD section(s): the new block object(s), each with "_op":"add". Add "_at":N to insert before index N (omit = append at the end).
- EDIT a section: {"_op":"update","_at":N, ...only the fields you're changing}.
- REMOVE a section: {"_op":"remove","_at":N}.
- BUILD FROM SCRATCH / big restructure only: the full page as a plain JSON array of blocks (no "_op").

Example — user says "add an FAQ after the quote", you reply EXACTLY like:
Sure — adding an FAQ section after your quote.
\`\`\`json
{"_op":"add","_at":3,"type":"faq","heading":"Frequently Asked Questions","items":[{"q":"What's your specialty?","a":"Building fast, clean web apps."},{"q":"How can I reach you?","a":"Use the contact form below."}]}
\`\`\`

Hard rules: the JSON MUST sit inside the fence and be VALID JSON (real double-quotes, real commas, a real "type"). NEVER describe a block in prose or in the "type — field=value" shorthand — that shorthand is ONLY how I list the current page TO you; your output is ALWAYS real JSON. Never write JSON outside the one fence. Write real, specific copy (never lorem ipsum). Omit image/url fields unless you have a real value. If you're only chatting or planning, include NO JSON. A good fresh page is 8-14 blocks, opens with a hero/banner and ends with a contact form or CTA.`;

    let out;
    try {
      out = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [{ role: 'system', content: system }, ...history],
        max_tokens: 4096, temperature: 0.3,
      });
    } catch { return respond({ error: 'The AI request failed — try again.' }, 502); }

    const txt = (out && out.response) || '';





    let sections = null, reply = txt;
    const blocks = [], seen = new Set(); let firstStart = -1;
    for (let i = 0; i < txt.length; i++) {
      if (txt[i] !== '{') continue;
      let depth = 0, inStr = false, esc = false, j = i;
      for (; j < txt.length; j++) {
        const ch = txt[j];
        if (esc) { esc = false; continue; }
        if (ch === '\\') { esc = true; continue; }
        if (ch === '"') { inStr = !inStr; continue; }
        if (inStr) continue;
        if (ch === '{') depth++;
        else if (ch === '}') { if (--depth === 0) break; }
      }
      if (depth === 0 && j < txt.length) {
        try {
          const o = JSON.parse(txt.slice(i, j + 1));

          if (o && typeof o === 'object' && (typeof o.type === 'string' || typeof o._op === 'string')) {
            const k = JSON.stringify(o);
            if (!seen.has(k)) { seen.add(k); blocks.push(o); if (firstStart < 0) firstStart = i; }
          }
        } catch {}
        i = j;   // skip past this object (nested items aren't matched separately)
      }
    }
    if (blocks.length) {
      sections = blocks.slice(0, 40);


      reply = txt.slice(0, firstStart)
        .replace(/```json/gi, '').replace(/```/g, '')
        .replace(/\bjson\s*$/i, '')
        .replace(/[\[\](){}:<>\-–—\s]+$/, '')
        .replace(/\n{3,}/g, '\n\n').trim();
    }
    if (!reply || reply.length < 2) reply = sections ? 'Done — I’ve updated the page. ✓' : '…';
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
