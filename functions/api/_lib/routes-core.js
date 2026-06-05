
export async function handleCore(ctx) {
  const { route, method, request, env, headers, respond, compressJson, decompressJson, CREATE_SESSIONS, CREATE_BANNED_EMAILS, CREATE_PAGES, authed, visitorAuthed, _adminRole } = ctx;

  if (route === 'config' && method === 'GET') {
    return respond({ google_client_id: env.GOOGLE_CLIENT_ID || '', github_client_id: env.GITHUB_CLIENT_ID || '', discord_client_id: env.DISCORD_CLIENT_ID || '', magic_enabled: !!env.RESEND_API_KEY, turnstile_site_key: env.TURNSTILE_SITE_KEY || '', recaptcha_site_key: env.RECAPTCHA_SITE_KEY || '' });
  }



  if (route === 'ai/page' && method === 'POST') {
    if (!authed()) return respond({ error: 'unauthorized' }, 401);
    if (!env.AI) return respond({ error: 'Workers AI isn’t enabled for this site.' }, 503);
    const body = await request.json().catch(() => ({}));
    const prompt = String(body.prompt || '').slice(0, 600).trim();
    if (prompt.length < 3) return respond({ error: 'Describe what you want.' }, 400);
    let current = Array.isArray(body.sections) ? body.sections : [];

    current = current.map(({ id, anchor, ...rest }) => rest).slice(0, 40);


    const schema = String(body.schema || '').slice(0, 6000) ||
      `- hero: eyebrow, name, tagline
- banner: eyebrow, heading, subheading, btn_label, btn_url
- heading: text, align
- text: text
- features: heading, sub, items:[{icon, title, text}]
- pricing: heading, items:[{name, price, period, features, featured}]
- testimonials: heading, items:[{quote, name, role}]
- cta: text, button_label, button_url
- contactform: heading, sub`;

    const site = body.site || {};
    let siteCtx = '';
    if (site.name) {
      siteCtx = `\nThis page belongs to the website "${String(site.name).slice(0, 80)}".`;
      if (Array.isArray(site.pages) && site.pages.length) {
        const list = site.pages.slice(0, 40).map(p => `"${String(p.title || '').slice(0, 40)}" (${String(p.slug || '').slice(0, 40)})`).join(', ');
        siteCtx += ` Other pages on this site (use their slugs as URLs for links/CTAs when relevant): ${list}.`;
      }
      siteCtx += ` Keep the tone and copy on-brand for this site.`;
    }

    const system = `You build and edit web pages as a JSON array of "sections" (blocks).
Use ONLY these block types and their fields (icon fields take a single emoji; "features" in pricing is a newline-separated string; yes/no fields use "yes"/"no"):
${schema}
${siteCtx}
Rules: Output ONLY a JSON array — no prose, no markdown fences. Every object needs a "type". Write real, specific copy for the topic (never lorem ipsum or "your text here"). Leave image/url fields out unless you have a real value. A good page is 8-14 blocks, opens with a hero or banner and ends with a contact form or CTA.`;

    const userMsg = current.length
      ? `Current page:\n${JSON.stringify(current)}\n\nApply this change and return the FULL updated array, keeping everything else as-is:\n${prompt}`
      : `Build a page: ${prompt}`;

    let out;
    try {
      out = await env.AI.run('@cf/meta/llama-3.2-3b-instruct', {
        messages: [{ role: 'system', content: system }, { role: 'user', content: userMsg }],
        max_tokens: 4096, temperature: 0.4,
      });
    } catch { return respond({ error: 'The AI request failed — try again.' }, 502); }

    const txt = (out && out.response) || '';
    let sections;
    try { const m = txt.match(/\[[\s\S]*\]/); sections = JSON.parse(m ? m[0] : txt); } catch { sections = null; }
    if (!Array.isArray(sections)) return respond({ error: 'The AI returned something odd — try rephrasing.' }, 502);
    return respond({ sections });
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
