
export async function handleCore(ctx) {
  const { route, method, request, env, headers, respond, compressJson, decompressJson, CREATE_SESSIONS, CREATE_BANNED_EMAILS, CREATE_PAGES, authed, visitorAuthed, _adminRole } = ctx;

  if (route === 'config' && method === 'GET') {
    return respond({ google_client_id: env.GOOGLE_CLIENT_ID || '', github_client_id: env.GITHUB_CLIENT_ID || '', discord_client_id: env.DISCORD_CLIENT_ID || '', magic_enabled: !!env.RESEND_API_KEY, turnstile_site_key: env.TURNSTILE_SITE_KEY || '', recaptcha_site_key: env.RECAPTCHA_SITE_KEY || '' });
  }



  if (route === 'form' && method === 'POST') {
    const key = env.WEB3FORMS_APIKEY;
    if (!key) return respond({ error: 'forms not configured' }, 503);
    let body = {};
    const ct = request.headers.get('content-type') || '';
    try {
      if (ct.includes('application/json')) body = await request.json();
      else { const fd = await request.formData(); for (const [k, v] of fd) body[k] = v; }
    } catch { return respond({ error: 'bad request' }, 400); }
    if (body.botcheck) return respond({ ok: true });
    const email = String(body.email || '').trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return respond({ error: 'enter a valid email' }, 400);
    const payload = {
      access_key: key,
      subject: String(body._subject || body.subject || 'New form submission').slice(0, 150),
      from_name: String(body.name || email).slice(0, 120),
      email,
      message: String(body.message || '(newsletter signup)').slice(0, 5000),
    };
    const r = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : {};
    return respond({ ok: !!j.success, error: j.success ? undefined : (j.message || 'could not send') }, j.success ? 200 : 502);
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
