import { makeD1Http } from "./d1http.js";
import type { Ctx, Env, NewSessionResult } from "./types.ts";

interface BuildCtxArgs {
  request: Request;
  env: Env;
  params: { route?: string[] };
  waitUntil: (promise: Promise<unknown>) => void;
}

export async function buildCtx({
  request: request,
  env: env,
  params: params,
  waitUntil: waitUntil,
}: BuildCtxArgs): Promise<Ctx> {
  if (env && env.DB_HTTP_URL) {
    const _db = makeD1Http(
      env.DB_HTTP_URL,
      env.DB_HTTP_SECRET || "",
      env.DB_HTTP_NAME || "",
      env.CF_ACCESS_CLIENT_ID || "",
      env.CF_ACCESS_CLIENT_SECRET || ""
    );
    env = new Proxy(env, {
      get(t, p) {
        return p === "DB" ? _db : t[p as string];
      },
    }) as Env;
  }
  const route = (params.route || []).join("/");
  const method = request.method;
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Session-Token",
  };
  const respond = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), { status: status, headers: headers });
  async function compressJson(str: string): Promise<string> {
    const cs = new CompressionStream("gzip");
    const w = cs.writable.getWriter();
    w.write(new TextEncoder().encode(str));
    w.close();
    const buf = await new Response(cs.readable).arrayBuffer();
    const bytes = new Uint8Array(buf);
    let b = "";
    for (let i = 0; i < bytes.length; i++) b += String.fromCharCode(bytes[i]);
    return "gz:" + btoa(b);
  }
  async function decompressJson(
    stored: string | null | undefined
  ): Promise<string | null | undefined> {
    if (!stored || !stored.startsWith("gz:")) return stored;
    const bin = atob(stored.slice(3));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const ds = new DecompressionStream("gzip");
    const w = ds.writable.getWriter();
    w.write(bytes);
    w.close();
    const buf = await new Response(ds.readable).arrayBuffer();
    return new TextDecoder().decode(buf);
  }
  const CREATE_SESSIONS = `CREATE TABLE IF NOT EXISTS sessions (\n    token      TEXT    PRIMARY KEY,\n    visitor_id INTEGER NOT NULL,\n    sid        TEXT,\n    user_agent TEXT,\n    ip         TEXT,\n    last_seen  TEXT,\n    created_at TEXT    NOT NULL DEFAULT (datetime('now')),\n    expires_at TEXT    NOT NULL\n  )`;
  let _sessionColsReady = false;
  async function ensureSessionCols(): Promise<void> {
    if (_sessionColsReady) return;
    await env.DB.prepare(CREATE_SESSIONS).run();
    for (const col of [
      "ALTER TABLE sessions ADD COLUMN sid TEXT",
      "ALTER TABLE sessions ADD COLUMN user_agent TEXT",
      "ALTER TABLE sessions ADD COLUMN ip TEXT",
      "ALTER TABLE sessions ADD COLUMN last_seen TEXT",
    ]) {
      await env.DB.prepare(col)
        .run()
        .catch(() => {});
    }
    _sessionColsReady = true;
  }
  async function newSession(visitorId: number | string): Promise<NewSessionResult> {
    await ensureSessionCols();
    const token = crypto.randomUUID();
    const sid = crypto.randomUUID();
    const ua = (request.headers.get("User-Agent") || "").slice(0, 300);
    const ip = request.headers.get("CF-Connecting-IP") || "";
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3)
      .toISOString()
      .replace("T", " ")
      .replace(/\.\d{3}Z$/, "");
    await env.DB.prepare(
      "INSERT INTO sessions (token, visitor_id, sid, user_agent, ip, last_seen, expires_at) VALUES (?, ?, ?, ?, ?, datetime('now'), ?)"
    )
      .bind(token, visitorId, sid, ua, ip, expiresAt)
      .run();
    return { token: token, sid: sid };
  }
  async function currentVisitor(): Promise<Record<string, unknown> | null> {
    const token = request.headers.get("X-Session-Token") || "";
    if (!token) return null;
    await env.DB.prepare(CREATE_SESSIONS).run();
    const row = await env.DB.prepare(
      "SELECT v.*, s.token AS session_token FROM sessions s JOIN visitors v ON v.id = s.visitor_id WHERE s.token = ? AND s.expires_at > datetime('now')"
    )
      .bind(token)
      .first()
      .catch(() => null);
    if (!row || row.is_banned) return null;
    return row;
  }
  const CREATE_BANNED_EMAILS = `CREATE TABLE IF NOT EXISTS banned_emails (\n    email TEXT NOT NULL PRIMARY KEY,\n    banned_at TEXT NOT NULL DEFAULT (datetime('now'))\n  )`;
  const CREATE_PAGES = `CREATE TABLE IF NOT EXISTS pages (\n    id           INTEGER PRIMARY KEY AUTOINCREMENT,\n    title        TEXT    NOT NULL DEFAULT 'Untitled',\n    slug         TEXT    NOT NULL UNIQUE,\n    page_json    TEXT    NOT NULL DEFAULT '',\n    is_published INTEGER NOT NULL DEFAULT 1,\n    sort_order   INTEGER NOT NULL DEFAULT 0,\n    created_at   TEXT    NOT NULL DEFAULT (datetime('now'))\n  )`;
  let _adminRole: false | "owner" | "admin" = false;
  const passwordAdmin = (): boolean => {
    const h = request.headers.get("Authorization") || "";
    const token = h.startsWith("Bearer ") ? h.slice(7) : h;
    if (!token) return false;
    return token === env.ADMIN_PASSWORD || token === env.ADMIN_PASSWORD_2;
  };
  const resolveAdminRole = async (): Promise<false | "owner" | "admin"> => {
    if (passwordAdmin()) return "owner";
    const st = request.headers.get("X-Session-Token") || "";
    if (!st) return false;
    await env.DB.prepare(CREATE_SESSIONS).run();
    const row = await env.DB.prepare(
      "SELECT v.role, v.is_banned FROM sessions s JOIN visitors v ON v.id = s.visitor_id WHERE s.token = ? AND s.expires_at > datetime('now')"
    )
      .bind(st)
      .first<{ role: string; is_banned: unknown }>()
      .catch(() => null);
    if (!row || row.is_banned) return false;
    return row.role === "owner" || row.role === "admin" ? (row.role as "owner" | "admin") : false;
  };
  const authed = (): boolean => !!_adminRole;
  const visitorAuthed = async (): Promise<false | "banned" | "ok"> => {
    const token = request.headers.get("X-Session-Token") || "";
    if (!token) return false;
    await env.DB.prepare(CREATE_SESSIONS).run();
    const row = await env.DB.prepare(
      "SELECT v.is_banned FROM sessions s JOIN visitors v ON v.id = s.visitor_id WHERE s.token = ? AND s.expires_at > datetime('now')"
    )
      .bind(token)
      .first<{ is_banned: unknown }>();
    if (!row) return false;
    if (row.is_banned) return "banned";
    return "ok";
  };
  const sitePublic = async (): Promise<boolean> => {
    if (env.FOYER_PUBLIC === "1") return true;
    const r = await env.DB.prepare("SELECT value FROM site_settings WHERE key='site_public'")
      .first<{ value: string }>()
      .catch(() => null);
    return r?.value === "1";
  };
  const canView = async (): Promise<boolean> => {
    if (_adminRole) return true;
    const token = request.headers.get("X-Session-Token") || "";
    let row: { email: string; is_banned: unknown; role: string } | null = null;
    if (token) {
      await env.DB.prepare(CREATE_SESSIONS).run();
      row = await env.DB.prepare(
        "SELECT v.email, v.is_banned, v.role FROM sessions s JOIN visitors v ON v.id = s.visitor_id WHERE s.token = ? AND s.expires_at > datetime('now')"
      )
        .bind(token)
        .first<{ email: string; is_banned: unknown; role: string }>()
        .catch(() => null);
    }
    if (row?.is_banned) return false;
    const lockRow = await env.DB.prepare(
      "SELECT value FROM site_settings WHERE key='site_lockdown'"
    )
      .first<{ value: string }>()
      .catch(() => null);
    if (lockRow?.value === "1") {
      if (!row) return false;
      if (row.role === "owner" || row.role === "admin") return true;
      await env.DB.prepare(
        "CREATE TABLE IF NOT EXISTS allowed_emails (email TEXT PRIMARY KEY, added_at TEXT NOT NULL DEFAULT (datetime('now')))"
      ).run();
      const ok = await env.DB.prepare("SELECT 1 FROM allowed_emails WHERE email = ?")
        .bind(row.email)
        .first()
        .catch(() => null);
      return !!ok;
    }
    if (row) return true;
    return await sitePublic();
  };
  _adminRole = await resolveAdminRole();
  let _perms: Set<string> | null = null;
  if (_adminRole === "admin") {
    try {
      const st = request.headers.get("X-Session-Token") || "";
      if (st) {
        const vr = await env.DB.prepare(
          "SELECT v.role_id FROM sessions s JOIN visitors v ON v.id = s.visitor_id WHERE s.token = ? AND s.expires_at > datetime('now')"
        )
          .bind(st)
          .first<{ role_id: unknown }>();
        if (vr && vr.role_id) {
          const rr = await env.DB.prepare("SELECT perms FROM roles WHERE id = ?")
            .bind(vr.role_id)
            .first<{ perms: string }>();
          if (rr)
            _perms = new Set(
              String(rr.perms || "")
                .split(",")
                .map((x) => x.trim())
                .filter(Boolean)
            );
        }
      }
    } catch (e) {
      _perms = null;
    }
  }
  const can = (perm: string): boolean => (_perms === null ? true : _perms.has(perm));
  const adminPerms: "all" | string[] = _perms === null ? "all" : [..._perms];
  return {
    route: route,
    method: method,
    request: request,
    env: env,
    headers: headers,
    respond: respond,
    compressJson: compressJson,
    decompressJson: decompressJson,
    waitUntil: waitUntil,
    CREATE_SESSIONS: CREATE_SESSIONS,
    CREATE_BANNED_EMAILS: CREATE_BANNED_EMAILS,
    CREATE_PAGES: CREATE_PAGES,
    authed: authed,
    visitorAuthed: visitorAuthed,
    _adminRole: _adminRole,
    can: can,
    adminPerms: adminPerms,
    ensureSessionCols: ensureSessionCols,
    newSession: newSession,
    currentVisitor: currentVisitor,
    sitePublic: sitePublic,
    canView: canView,
  };
}
