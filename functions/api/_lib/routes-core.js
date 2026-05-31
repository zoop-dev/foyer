
export async function handleCore(ctx) {
  const { route, method, request, env, headers, respond, compressJson, decompressJson, CREATE_SESSIONS, CREATE_BANNED_EMAILS, CREATE_PAGES, authed, visitorAuthed, _adminRole } = ctx;

  if (route === 'config' && method === 'GET') {
    return respond({ google_client_id: env.GOOGLE_CLIENT_ID || '', github_client_id: env.GITHUB_CLIENT_ID || '', discord_client_id: env.DISCORD_CLIENT_ID || '', magic_enabled: !!env.RESEND_API_KEY });
  }

  const CREATE_VERSIONS = `CREATE TABLE IF NOT EXISTS versions (
    id  INTEGER PRIMARY KEY CHECK (id = 1),
    sys TEXT NOT NULL DEFAULT '1',
    ui  TEXT NOT NULL DEFAULT '1'
  )`;

  if (route === 'version' && method === 'GET') {
    await env.DB.prepare(CREATE_VERSIONS).run();
    await env.DB.prepare("INSERT OR IGNORE INTO versions (id, sys, ui) VALUES (1, '1', '1')").run();
    const row = await env.DB.prepare('SELECT sys, ui FROM versions WHERE id = 1').first().catch(() => null);
    return respond({ sys_version: row?.sys || '', ui_version: row?.ui || '0' });
  }

  if (route === 'version' && method === 'PUT') {
    if (!authed()) return respond({ error: 'unauthorized' }, 401);
    await env.DB.prepare(CREATE_VERSIONS).run();
    await env.DB.prepare("INSERT OR IGNORE INTO versions (id, sys, ui) VALUES (1, '1', '1')").run();
    const b = await request.json().catch(() => ({}));
    if (b.sys != null) await env.DB.prepare('UPDATE versions SET sys = ? WHERE id = 1').bind(String(b.sys)).run();
    if (b.ui  != null) await env.DB.prepare('UPDATE versions SET ui = ? WHERE id = 1').bind(String(b.ui)).run();
    const row = await env.DB.prepare('SELECT sys, ui FROM versions WHERE id = 1').first();
    return respond({ ok: true, sys_version: row?.sys, ui_version: row?.ui });
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
