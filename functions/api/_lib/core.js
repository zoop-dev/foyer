
export async function buildCtx({ request, env, params, waitUntil }) {
  const route  = (params.route || []).join('/');
  const method = request.method;

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Session-Token',
  };

  const respond = (data, status = 200) =>
    new Response(JSON.stringify(data), { status, headers });

  async function compressJson(str) {
    const cs = new CompressionStream('gzip');
    const w = cs.writable.getWriter();
    w.write(new TextEncoder().encode(str));
    w.close();
    const buf = await new Response(cs.readable).arrayBuffer();
    const bytes = new Uint8Array(buf);
    let b = '';
    for (let i = 0; i < bytes.length; i++) b += String.fromCharCode(bytes[i]);
    return 'gz:' + btoa(b);
  }

  async function decompressJson(stored) {
    if (!stored || !stored.startsWith('gz:')) return stored;
    const bin = atob(stored.slice(3));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const ds = new DecompressionStream('gzip');
    const w = ds.writable.getWriter();
    w.write(bytes);
    w.close();
    const buf = await new Response(ds.readable).arrayBuffer();
    return new TextDecoder().decode(buf);
  }

  const CREATE_SESSIONS = `CREATE TABLE IF NOT EXISTS sessions (
    token      TEXT    PRIMARY KEY,
    visitor_id INTEGER NOT NULL,
    sid        TEXT,
    user_agent TEXT,
    ip         TEXT,
    last_seen  TEXT,
    created_at TEXT    NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT    NOT NULL
  )`;


  let _sessionColsReady = false;
  async function ensureSessionCols() {
    if (_sessionColsReady) return;
    await env.DB.prepare(CREATE_SESSIONS).run();
    for (const col of [
      'ALTER TABLE sessions ADD COLUMN sid TEXT',
      'ALTER TABLE sessions ADD COLUMN user_agent TEXT',
      'ALTER TABLE sessions ADD COLUMN ip TEXT',
      'ALTER TABLE sessions ADD COLUMN last_seen TEXT',
    ]) {
      await env.DB.prepare(col).run().catch(() => {});
    }
    _sessionColsReady = true;
  }

  async function newSession(visitorId) {
    await ensureSessionCols();
    const token = crypto.randomUUID();
    const sid   = crypto.randomUUID();
    const ua    = (request.headers.get('User-Agent') || '').slice(0, 300);
    const ip    = request.headers.get('CF-Connecting-IP') || '';
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, '');
    await env.DB.prepare(
      "INSERT INTO sessions (token, visitor_id, sid, user_agent, ip, last_seen, expires_at) VALUES (?, ?, ?, ?, ?, datetime('now'), ?)"
    ).bind(token, visitorId, sid, ua, ip, expiresAt).run();
    return { token, sid };
  }

  async function currentVisitor() {
    const token = request.headers.get('X-Session-Token') || '';
    if (!token) return null;
    await env.DB.prepare(CREATE_SESSIONS).run();
    const row = await env.DB.prepare(
      "SELECT v.*, s.token AS session_token FROM sessions s JOIN visitors v ON v.id = s.visitor_id WHERE s.token = ? AND s.expires_at > datetime('now')"
    ).bind(token).first().catch(() => null);
    if (!row || row.is_banned) return null;
    return row;
  }

  const CREATE_BANNED_EMAILS = `CREATE TABLE IF NOT EXISTS banned_emails (
    email TEXT NOT NULL PRIMARY KEY,
    banned_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`;

  const CREATE_PAGES = `CREATE TABLE IF NOT EXISTS pages (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    title        TEXT    NOT NULL DEFAULT 'Untitled',
    slug         TEXT    NOT NULL UNIQUE,
    page_json    TEXT    NOT NULL DEFAULT '',
    is_published INTEGER NOT NULL DEFAULT 1,
    sort_order   INTEGER NOT NULL DEFAULT 0,
    created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
  )`;

  let _adminRole = false;
  const passwordAdmin = () => {
    const h = request.headers.get('Authorization') || '';
    const token = h.startsWith('Bearer ') ? h.slice(7) : h;
    if (!token) return false;
    return token === env.ADMIN_PASSWORD || token === env.ADMIN_PASSWORD_2;
  };
  const resolveAdminRole = async () => {
    if (passwordAdmin()) return 'owner';
    const st = request.headers.get('X-Session-Token') || '';
    if (!st) return false;
    await env.DB.prepare(CREATE_SESSIONS).run();
    const row = await env.DB.prepare(
      "SELECT v.role, v.is_banned FROM sessions s JOIN visitors v ON v.id = s.visitor_id WHERE s.token = ? AND s.expires_at > datetime('now')"
    ).bind(st).first().catch(() => null);
    if (!row || row.is_banned) return false;
    return (row.role === 'owner' || row.role === 'admin') ? row.role : false;
  };
  const authed = () => !!_adminRole;

  const visitorAuthed = async () => {
    const token = request.headers.get('X-Session-Token') || '';
    if (!token) return false;
    await env.DB.prepare(CREATE_SESSIONS).run();
    const row = await env.DB.prepare(
      "SELECT v.is_banned FROM sessions s JOIN visitors v ON v.id = s.visitor_id WHERE s.token = ? AND s.expires_at > datetime('now')"
    ).bind(token).first();
    if (!row) return false;
    if (row.is_banned) return 'banned';
    return 'ok';
  };

  const sitePublic = async () => {
    if (env.FOYER_PUBLIC === '1') return true;   // permanent public flag from config.json (publicAccess)
    const r = await env.DB.prepare("SELECT value FROM site_settings WHERE key='site_public'").first().catch(() => null);
    return r?.value === '1';
  };



  const canView = async () => {
    if (_adminRole) return true;
    const token = request.headers.get('X-Session-Token') || '';
    let row = null;
    if (token) {
      await env.DB.prepare(CREATE_SESSIONS).run();
      row = await env.DB.prepare(
        "SELECT v.email, v.is_banned, v.role FROM sessions s JOIN visitors v ON v.id = s.visitor_id WHERE s.token = ? AND s.expires_at > datetime('now')"
      ).bind(token).first().catch(() => null);
    }
    if (row?.is_banned) return false;
    const lockRow = await env.DB.prepare("SELECT value FROM site_settings WHERE key='site_lockdown'").first().catch(() => null);
    if (lockRow?.value === '1') {
      if (!row) return false;
      if (row.role === 'owner' || row.role === 'admin') return true;
      await env.DB.prepare("CREATE TABLE IF NOT EXISTS allowed_emails (email TEXT PRIMARY KEY, added_at TEXT NOT NULL DEFAULT (datetime('now')))").run();
      const ok = await env.DB.prepare('SELECT 1 FROM allowed_emails WHERE email = ?').bind(row.email).first().catch(() => null);
      return !!ok;
    }
    if (row) return true;
    return await sitePublic();
  };

  _adminRole = await resolveAdminRole();

  return { route, method, request, env, headers, respond, compressJson, decompressJson, waitUntil,
           CREATE_SESSIONS, CREATE_BANNED_EMAILS, CREATE_PAGES, authed, visitorAuthed, _adminRole,
           ensureSessionCols, newSession, currentVisitor, sitePublic, canView };
}
