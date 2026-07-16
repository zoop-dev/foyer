import { canonHost } from "./site-config.js";
import { isPro, isUltra, sitePlan } from "./plan.js";
import { rateLimit, clientIp } from "./rate-limit.js";
const ADMIN_LIMIT = { free: 5, pro: 10, ultra: Infinity };
const PERM_KEYS = [
  "pages",
  "content",
  "media",
  "analytics",
  "inbox",
  "comments",
  "settings",
  "team",
];
let _pageViewsReady = false;
async function ensureRoles(env) {
  await env.DB.prepare(
    "CREATE TABLE IF NOT EXISTS roles (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, perms TEXT, created_at TEXT DEFAULT (datetime('now')))"
  )
    .run()
    .catch(() => {});
  await env.DB.prepare("ALTER TABLE visitors ADD COLUMN role_id INTEGER")
    .run()
    .catch(() => {});
}
export async function handlePeople(ctx) {
  const {
    route: route,
    method: method,
    request: request,
    env: env,
    headers: headers,
    respond: respond,
    compressJson: compressJson,
    decompressJson: decompressJson,
    CREATE_SESSIONS: CREATE_SESSIONS,
    CREATE_BANNED_EMAILS: CREATE_BANNED_EMAILS,
    CREATE_PAGES: CREATE_PAGES,
    authed: authed,
    visitorAuthed: visitorAuthed,
    _adminRole: _adminRole,
    adminPerms: adminPerms,
    can: can,
  } = ctx;
  const CREATE_PAGE_VIEWS = `CREATE TABLE IF NOT EXISTS page_views (\n    id        INTEGER PRIMARY KEY AUTOINCREMENT,\n    sess      TEXT NOT NULL DEFAULT '',\n    path      TEXT NOT NULL DEFAULT '/',\n    referrer  TEXT NOT NULL DEFAULT '',\n    ip        TEXT NOT NULL DEFAULT '',\n    country   TEXT NOT NULL DEFAULT '',\n    city      TEXT NOT NULL DEFAULT '',\n    region    TEXT NOT NULL DEFAULT '',\n    postal    TEXT NOT NULL DEFAULT '',\n    lat       REAL,\n    lon       REAL,\n    tz        TEXT NOT NULL DEFAULT '',\n    asn       TEXT NOT NULL DEFAULT '',\n    isp       TEXT NOT NULL DEFAULT '',\n    colo      TEXT NOT NULL DEFAULT '',\n    continent TEXT NOT NULL DEFAULT '',\n    is_eu     INTEGER NOT NULL DEFAULT 0,\n    ua        TEXT NOT NULL DEFAULT '',\n    screen    TEXT NOT NULL DEFAULT '',\n    lang      TEXT NOT NULL DEFAULT '',\n    http      TEXT NOT NULL DEFAULT '',\n    tls       TEXT NOT NULL DEFAULT '',\n    viewed_at TEXT NOT NULL DEFAULT (datetime('now'))\n  )`;
  async function ensurePageViews() {
    if (_pageViewsReady) return;
    _pageViewsReady = true;
    await env.DB.prepare(CREATE_PAGE_VIEWS).run();
    await Promise.all(
      [
        "CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at ON page_views(viewed_at)",
        "CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(path)",
        "CREATE INDEX IF NOT EXISTS idx_page_views_ip ON page_views(ip)",
        "CREATE INDEX IF NOT EXISTS idx_page_views_country ON page_views(country)",
      ].map((sql) => env.DB.prepare(sql).run())
    );
  }
  if (route === "visitors" && method === "GET") {
    if (!authed()) return respond({ error: "unauthorized" }, 401);
    await ensureRoles(env);
    const { results: results } = await env.DB.prepare(
      "SELECT id, email, name, picture, visit_count, is_banned, role, role_id, first_seen, last_seen FROM visitors ORDER BY last_seen DESC"
    ).all();
    return respond({ visitors: results, caller_role: _adminRole || "" });
  }
  const roleChange = route.match(/^visitors\/(\d+)\/(promote|demote)$/);
  if (roleChange && method === "POST") {
    if (_adminRole !== "owner") return respond({ error: "owner_only" }, 403);
    const id = parseInt(roleChange[1]);
    const newRole = roleChange[2] === "promote" ? "admin" : "";
    const target = await env.DB.prepare("SELECT role FROM visitors WHERE id = ?").bind(id).first();
    if (target?.role === "owner") return respond({ error: "cannot_modify_owner" }, 403);
    if (newRole === "admin") {
      const plan = await sitePlan(env, canonHost(env, request));
      const limit = ADMIN_LIMIT[plan] != null ? ADMIN_LIMIT[plan] : ADMIN_LIMIT.free;
      const c = await env.DB.prepare(
        "SELECT COUNT(*) AS n FROM visitors WHERE role IN ('owner','admin')"
      )
        .first()
        .catch(() => ({ n: 0 }));
      if ((c?.n || 0) >= limit)
        return respond(
          { error: `Your plan allows up to ${limit} admins. Upgrade for more.`, limit: limit },
          403
        );
    }
    await env.DB.prepare("UPDATE visitors SET role = ? WHERE id = ?").bind(newRole, id).run();
    return respond({ ok: true, role: newRole });
  }
  if (route === "me" && method === "GET") {
    if (!authed()) return respond({ error: "unauthorized" }, 401);
    return respond({ role: _adminRole || "", perms: adminPerms, keys: PERM_KEYS });
  }
  if (route === "roles" && method === "GET") {
    if (!authed()) return respond({ error: "unauthorized" }, 401);
    await ensureRoles(env);
    const { results: results } = await env.DB.prepare(
      "SELECT id, name, perms FROM roles ORDER BY name"
    )
      .all()
      .catch(() => ({ results: [] }));
    return respond(
      (results || []).map((r) => ({
        id: r.id,
        name: r.name,
        perms: String(r.perms || "")
          .split(",")
          .filter(Boolean),
      }))
    );
  }
  if (route === "roles" && method === "POST") {
    if (_adminRole !== "owner") return respond({ error: "owner_only" }, 403);
    if (!(await isUltra(env, canonHost(env, request))))
      return respond({ error: "Custom roles are an Ultra feature." }, 403);
    await ensureRoles(env);
    const b = await request.json().catch(() => ({}));
    const name = String(b.name || "")
      .slice(0, 40)
      .trim();
    const perms = (Array.isArray(b.perms) ? b.perms : [])
      .filter((p) => PERM_KEYS.includes(p))
      .join(",");
    if (!name) return respond({ error: "A role name is required." }, 400);
    const r = await env.DB.prepare("INSERT INTO roles (name, perms) VALUES (?,?)")
      .bind(name, perms)
      .run();
    return respond(
      { id: r.meta?.last_row_id, name: name, perms: perms.split(",").filter(Boolean) },
      201
    );
  }
  const roleOne = route.match(/^roles\/(\d+)$/);
  if (roleOne && method === "PUT") {
    if (_adminRole !== "owner") return respond({ error: "owner_only" }, 403);
    await ensureRoles(env);
    const b = await request.json().catch(() => ({}));
    const name = String(b.name || "")
      .slice(0, 40)
      .trim();
    const perms = (Array.isArray(b.perms) ? b.perms : [])
      .filter((p) => PERM_KEYS.includes(p))
      .join(",");
    await env.DB.prepare("UPDATE roles SET name = ?, perms = ? WHERE id = ?")
      .bind(name, perms, parseInt(roleOne[1]))
      .run()
      .catch(() => {});
    return respond({ ok: true });
  }
  if (roleOne && method === "DELETE") {
    if (_adminRole !== "owner") return respond({ error: "owner_only" }, 403);
    await ensureRoles(env);
    const rid = parseInt(roleOne[1]);
    await env.DB.prepare("DELETE FROM roles WHERE id = ?")
      .bind(rid)
      .run()
      .catch(() => {});
    await env.DB.prepare("UPDATE visitors SET role_id = NULL WHERE role_id = ?")
      .bind(rid)
      .run()
      .catch(() => {});
    return respond({ ok: true });
  }
  const assign = route.match(/^visitors\/(\d+)\/role$/);
  if (assign && method === "POST") {
    if (_adminRole !== "owner") return respond({ error: "owner_only" }, 403);
    await ensureRoles(env);
    const b = await request.json().catch(() => ({}));
    const roleId = b.role_id ? parseInt(b.role_id) : null;
    await env.DB.prepare("UPDATE visitors SET role_id = ? WHERE id = ? AND role = ?")
      .bind(roleId, parseInt(assign[1]), "admin")
      .run()
      .catch(() => {});
    return respond({ ok: true });
  }
  if (route === "banned-emails" && method === "GET") {
    if (!authed()) return respond({ error: "unauthorized" }, 401);
    await env.DB.prepare(CREATE_BANNED_EMAILS).run();
    const { results: results } = await env.DB.prepare(
      "SELECT email, banned_at FROM banned_emails ORDER BY banned_at DESC"
    ).all();
    return respond(results);
  }
  if (route === "banned-emails" && method === "POST") {
    if (!authed()) return respond({ error: "unauthorized" }, 401);
    await env.DB.prepare(CREATE_BANNED_EMAILS).run();
    const { email: email } = await request.json().catch(() => ({}));
    if (!email?.trim()) return respond({ error: "email required" }, 400);
    const addr = email.trim().toLowerCase();
    const ownerEmail = await env.DB.prepare(
      "SELECT 1 FROM visitors WHERE email = ? AND role = 'owner'"
    )
      .bind(addr)
      .first();
    if (ownerEmail) return respond({ error: "cannot_ban_owner" }, 403);
    await env.DB.prepare("INSERT OR IGNORE INTO banned_emails (email) VALUES (?)").bind(addr).run();
    await env.DB.prepare(
      "UPDATE visitors SET is_banned = 1, google_sub = 'banned:' || google_sub WHERE email = ? AND google_sub NOT LIKE 'banned:%'"
    )
      .bind(addr)
      .run();
    return respond({ ok: true });
  }
  const bannedEmailDel = route.match(/^banned-emails\/(.+)$/);
  if (bannedEmailDel && method === "DELETE") {
    if (!authed()) return respond({ error: "unauthorized" }, 401);
    await env.DB.prepare(CREATE_BANNED_EMAILS).run();
    const addr = decodeURIComponent(bannedEmailDel[1]).toLowerCase();
    await env.DB.prepare("DELETE FROM banned_emails WHERE email = ?").bind(addr).run();
    await env.DB.prepare(
      "UPDATE visitors SET is_banned = 0, google_sub = SUBSTR(google_sub, 8) WHERE email = ? AND google_sub LIKE 'banned:%'"
    )
      .bind(addr)
      .run();
    return respond({ ok: true });
  }
  const CREATE_ALLOWED_EMAILS =
    "CREATE TABLE IF NOT EXISTS allowed_emails (email TEXT PRIMARY KEY, added_at TEXT NOT NULL DEFAULT (datetime('now')))";
  if (route === "allowed-emails" && method === "GET") {
    if (!authed()) return respond({ error: "unauthorized" }, 401);
    await env.DB.prepare(CREATE_ALLOWED_EMAILS).run();
    const { results: results } = await env.DB.prepare(
      "SELECT email, added_at FROM allowed_emails ORDER BY added_at DESC"
    ).all();
    return respond(results);
  }
  if (route === "allowed-emails" && method === "POST") {
    if (!authed()) return respond({ error: "unauthorized" }, 401);
    await env.DB.prepare(CREATE_ALLOWED_EMAILS).run();
    const { email: email } = await request.json().catch(() => ({}));
    if (!email?.trim()) return respond({ error: "email required" }, 400);
    await env.DB.prepare("INSERT OR IGNORE INTO allowed_emails (email) VALUES (?)")
      .bind(email.trim().toLowerCase())
      .run();
    return respond({ ok: true });
  }
  const allowedEmailDel = route.match(/^allowed-emails\/(.+)$/);
  if (allowedEmailDel && method === "DELETE") {
    if (!authed()) return respond({ error: "unauthorized" }, 401);
    await env.DB.prepare(CREATE_ALLOWED_EMAILS).run();
    await env.DB.prepare("DELETE FROM allowed_emails WHERE email = ?")
      .bind(decodeURIComponent(allowedEmailDel[1]).toLowerCase())
      .run();
    return respond({ ok: true });
  }
  const visitorBan = route.match(/^visitors\/(\d+)\/(ban|unban)$/);
  if (visitorBan && method === "POST") {
    if (!authed()) return respond({ error: "unauthorized" }, 401);
    const id = parseInt(visitorBan[1]);
    const banning = visitorBan[2] === "ban";
    const { scope: scope = "one" } = banning ? await request.json().catch(() => ({})) : {};
    if (banning) {
      const target = await env.DB.prepare("SELECT role FROM visitors WHERE id = ?")
        .bind(id)
        .first();
      if (target?.role === "owner") return respond({ error: "cannot_ban_owner" }, 403);
      const ownerGuard = " AND role != 'owner'";
      await env.DB.prepare(
        "UPDATE visitors SET is_banned = 1, google_sub = 'banned:' || google_sub WHERE id = ? AND google_sub NOT LIKE 'banned:%'"
      )
        .bind(id)
        .run();
      if (scope === "email" || scope === "email_block") {
        const v = await env.DB.prepare("SELECT email FROM visitors WHERE id = ?").bind(id).first();
        if (v?.email) {
          await env.DB.prepare(
            "UPDATE visitors SET is_banned = 1, google_sub = 'banned:' || google_sub WHERE email = ? AND id != ? AND google_sub NOT LIKE 'banned:%'" +
              ownerGuard
          )
            .bind(v.email, id)
            .run();
          if (scope === "email_block") {
            await env.DB.prepare(CREATE_BANNED_EMAILS).run();
            await env.DB.prepare("INSERT OR IGNORE INTO banned_emails (email) VALUES (?)")
              .bind(v.email)
              .run();
          }
        }
      }
    } else {
      await env.DB.prepare(
        "UPDATE visitors SET is_banned = 0, google_sub = SUBSTR(google_sub, 8) WHERE id = ? AND google_sub LIKE 'banned:%'"
      )
        .bind(id)
        .run();
      await env.DB.prepare(CREATE_BANNED_EMAILS).run();
      const v = await env.DB.prepare("SELECT email FROM visitors WHERE id = ?").bind(id).first();
      if (v?.email) {
        await env.DB.prepare("DELETE FROM banned_emails WHERE email = ?").bind(v.email).run();
        await env.DB.prepare(
          "UPDATE visitors SET is_banned = 0, google_sub = SUBSTR(google_sub, 8) WHERE email = ? AND google_sub LIKE 'banned:%'"
        )
          .bind(v.email)
          .run();
      }
    }
    return respond({ ok: true, banned: banning });
  }
  const visitorAnalytics = route.match(/^analytics\/visitor\/(\d+)$/);
  if (visitorAnalytics && method === "GET") {
    if (!authed()) return respond({ error: "unauthorized" }, 401);
    const visId = parseInt(visitorAnalytics[1]);
    await env.DB.prepare(CREATE_SESSIONS).run();
    const { results: sessions } = await env.DB.prepare(
      "SELECT token FROM sessions WHERE visitor_id = ?"
    )
      .bind(visId)
      .all();
    if (!sessions.length) return respond({ views: [], no_sessions: true });
    const tokens = sessions.map((s) => s.token);
    const ph = tokens.map(() => "?").join(",");
    await ensurePageViews();
    const { results: views } = await env.DB.prepare(
      `SELECT * FROM page_views WHERE sess IN (${ph}) ORDER BY viewed_at DESC LIMIT 200`
    )
      .bind(...tokens)
      .all();
    return respond({ views: views, session_count: sessions.length });
  }
  if (route === "analytics/ping" && method === "POST") {
    const rl = await rateLimit(env, `pv:${clientIp(request)}`, 40, 60);
    if (!rl.ok) return respond({ ok: true });
    await ensurePageViews();
    const cf = request.cf || {};
    const ip = request.headers.get("CF-Connecting-IP") || "";
    const ua = request.headers.get("User-Agent") || "";
    const b = await request.json().catch(() => ({}));
    await env.DB.prepare(
      `INSERT INTO page_views (sess,path,referrer,ip,country,city,region,postal,lat,lon,tz,asn,isp,colo,continent,is_eu,ua,screen,lang,http,tls)\n       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    )
      .bind(
        b.session || "",
        b.path || "/",
        b.referrer || "",
        ip,
        cf.country || "",
        cf.city || "",
        cf.region || "",
        cf.postalCode || "",
        cf.latitude ?? null,
        cf.longitude ?? null,
        cf.timezone || "",
        String(cf.asn || ""),
        cf.asOrganization || "",
        cf.colo || "",
        cf.continent || "",
        cf.isEUCountry ? 1 : 0,
        ua,
        b.screen || "",
        b.lang || "",
        cf.httpProtocol || "",
        cf.tlsVersion || ""
      )
      .run();
    return respond({ ok: true });
  }
  if (route === "analytics" && method === "GET") {
    if (!authed()) return respond({ error: "unauthorized" }, 401);
    if (!can("analytics")) return respond({ error: "no_permission" }, 403);
    await ensurePageViews();
    const pro = await isPro(env, canonHost(env, request));
    const [total, today, week, uIPs, uCountries, topPaths, visitors] = await Promise.all([
      env.DB.prepare("SELECT COUNT(*) n FROM page_views").first(),
      env.DB.prepare(
        "SELECT COUNT(*) n FROM page_views WHERE viewed_at >= datetime('now','-1 day')"
      ).first(),
      env.DB.prepare(
        "SELECT COUNT(*) n FROM page_views WHERE viewed_at >= datetime('now','-7 days')"
      ).first(),
      env.DB.prepare("SELECT COUNT(DISTINCT ip) n FROM page_views WHERE ip != ''").first(),
      env.DB.prepare(
        "SELECT COUNT(DISTINCT country) n FROM page_views WHERE country != ''"
      ).first(),
      env.DB.prepare(
        "SELECT path, COUNT(*) n FROM page_views GROUP BY path ORDER BY n DESC LIMIT 12"
      ).all(),
      env.DB.prepare(
        "SELECT id,email,name,picture,visit_count,is_banned,role,first_seen,last_seen FROM visitors ORDER BY last_seen DESC"
      ).all(),
    ]);
    const out = {
      caller_role: _adminRole || "",
      pro: pro,
      total: total?.n || 0,
      today: today?.n || 0,
      week: week?.n || 0,
      unique_ips: uIPs?.n || 0,
      unique_countries: uCountries?.n || 0,
      top_paths: topPaths.results || [],
      visitors: visitors.results || [],
      top_countries: [],
      top_cities: [],
      top_isps: [],
      top_asns: [],
      top_tz: [],
      top_screens: [],
      top_lang: [],
      top_colo: [],
      top_tls: [],
      recent: [],
    };
    if (pro) {
      const [
        topCountries,
        topCities,
        topISPs,
        topASNs,
        topTZ,
        topScreens,
        topLang,
        topColo,
        topTLS,
        recent,
      ] = await Promise.all([
        env.DB.prepare(
          "SELECT country, COUNT(*) n FROM page_views WHERE country != '' GROUP BY country ORDER BY n DESC LIMIT 15"
        ).all(),
        env.DB.prepare(
          "SELECT city, region, country, COUNT(*) n FROM page_views WHERE city != '' GROUP BY city,country ORDER BY n DESC LIMIT 10"
        ).all(),
        env.DB.prepare(
          "SELECT isp, asn, COUNT(*) n FROM page_views WHERE isp != '' GROUP BY isp ORDER BY n DESC LIMIT 10"
        ).all(),
        env.DB.prepare(
          "SELECT asn, isp, COUNT(*) n FROM page_views WHERE asn != '' GROUP BY asn ORDER BY n DESC LIMIT 10"
        ).all(),
        env.DB.prepare(
          "SELECT tz, COUNT(*) n FROM page_views WHERE tz != '' GROUP BY tz ORDER BY n DESC LIMIT 10"
        ).all(),
        env.DB.prepare(
          "SELECT screen, COUNT(*) n FROM page_views WHERE screen != '' GROUP BY screen ORDER BY n DESC LIMIT 10"
        ).all(),
        env.DB.prepare(
          "SELECT lang, COUNT(*) n FROM page_views WHERE lang != '' GROUP BY lang ORDER BY n DESC LIMIT 10"
        ).all(),
        env.DB.prepare(
          "SELECT colo, COUNT(*) n FROM page_views WHERE colo != '' GROUP BY colo ORDER BY n DESC LIMIT 10"
        ).all(),
        env.DB.prepare(
          "SELECT tls, COUNT(*) n FROM page_views WHERE tls != '' GROUP BY tls ORDER BY n DESC LIMIT 6"
        ).all(),
        env.DB.prepare("SELECT * FROM page_views ORDER BY viewed_at DESC LIMIT 100").all(),
      ]);
      Object.assign(out, {
        top_countries: topCountries.results || [],
        top_cities: topCities.results || [],
        top_isps: topISPs.results || [],
        top_asns: topASNs.results || [],
        top_tz: topTZ.results || [],
        top_screens: topScreens.results || [],
        top_lang: topLang.results || [],
        top_colo: topColo.results || [],
        top_tls: topTLS.results || [],
        recent: recent.results || [],
      });
    }
    return respond(out);
  }
  return null;
}
