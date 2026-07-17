import { isPro } from "./plan.js";
import { canonHost } from "./site-config.js";
import type { Ctx } from "./types.ts";

export async function handleCollections(ctx: Ctx): Promise<Response | null> {
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
    canView: canView,
  } = ctx;
  const CREATE_TUTORIALS = `CREATE TABLE IF NOT EXISTS tutorials (\n    id          INTEGER PRIMARY KEY AUTOINCREMENT,\n    title       TEXT NOT NULL,\n    slug        TEXT NOT NULL UNIQUE,\n    description TEXT NOT NULL DEFAULT '',\n    content     TEXT NOT NULL DEFAULT '',\n    cover_image TEXT NOT NULL DEFAULT '',\n    created_at  TEXT NOT NULL DEFAULT (datetime('now')),\n    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))\n  )`;
  if (route === "tutorials" && method === "GET") {
    await env.DB.prepare(CREATE_TUTORIALS).run();
    const { results: results } = await env.DB.prepare(
      "SELECT id, title, slug, description, cover_image, created_at FROM tutorials ORDER BY created_at DESC"
    ).all();
    return respond(results);
  }
  const tutBySlug = route.match(/^tutorials\/by-slug\/(.+)$/);
  if (tutBySlug && method === "GET") {
    if (!(await canView())) return respond({ error: "unauthorized" }, 401);
    await env.DB.prepare(CREATE_TUTORIALS).run();
    const slug = decodeURIComponent(tutBySlug[1]);
    const row = await env.DB.prepare("SELECT * FROM tutorials WHERE slug = ?").bind(slug).first();
    return row ? respond(row) : respond({ error: "not found" }, 404);
  }
  const tutSingle = route.match(/^tutorials\/(\d+)$/);
  if (tutSingle && method === "GET") {
    await env.DB.prepare(CREATE_TUTORIALS).run();
    const row = await env.DB.prepare("SELECT * FROM tutorials WHERE id = ?")
      .bind(parseInt(tutSingle[1]))
      .first();
    return row ? respond(row) : respond({ error: "not found" }, 404);
  }
  if (route === "tutorials" && method === "POST") {
    if (!authed()) return respond({ error: "unauthorized" }, 401);
    await env.DB.prepare(CREATE_TUTORIALS).run();
    if (!(await isPro(env, canonHost(env, request)))) {
      const c = await env.DB.prepare("SELECT COUNT(*) AS c FROM tutorials").first<{ c: number }>();
      if ((c?.c || 0) >= 5)
        return respond(
          { error: "Free plan is limited to 5 tutorials — upgrade to Pro for unlimited." },
          403
        );
    }
    const b: Record<string, unknown> = await request.json();
    if (
      String(b.slug || "")
        .trim()
        .toLowerCase() === "all"
    )
      return respond({ error: '"all" is a reserved slug' }, 409);
    const r = await env.DB.prepare(
      "INSERT INTO tutorials (title, slug, description, content, cover_image) VALUES (?, ?, ?, ?, ?)"
    )
      .bind(b.title || "", b.slug || "", b.description || "", b.content || "", b.cover_image || "")
      .run();
    return respond({ id: r.meta?.last_row_id }, 201);
  }
  if (tutSingle && method === "PUT") {
    if (!authed()) return respond({ error: "unauthorized" }, 401);
    await env.DB.prepare(CREATE_TUTORIALS).run();
    const b: Record<string, unknown> = await request.json();
    if (
      String(b.slug || "")
        .trim()
        .toLowerCase() === "all"
    )
      return respond({ error: '"all" is a reserved slug' }, 409);
    await env.DB.prepare(
      "UPDATE tutorials SET title=?, slug=?, description=?, content=?, cover_image=?, updated_at=datetime('now') WHERE id=?"
    )
      .bind(
        b.title || "",
        b.slug || "",
        b.description || "",
        b.content || "",
        b.cover_image || "",
        parseInt(tutSingle[1])
      )
      .run();
    return respond({ ok: true });
  }
  if (tutSingle && method === "DELETE") {
    if (!authed()) return respond({ error: "unauthorized" }, 401);
    await env.DB.prepare("DELETE FROM tutorials WHERE id = ?").bind(parseInt(tutSingle[1])).run();
    return respond({ ok: true });
  }
  const CREATE_REVIEWS = `CREATE TABLE IF NOT EXISTS reviews (\n    id          INTEGER PRIMARY KEY AUTOINCREMENT,\n    title       TEXT NOT NULL,\n    slug        TEXT NOT NULL UNIQUE,\n    description TEXT NOT NULL DEFAULT '',\n    content     TEXT NOT NULL DEFAULT '',\n    cover_image TEXT NOT NULL DEFAULT '',\n    rating      INTEGER NOT NULL DEFAULT 0,\n    created_at  TEXT NOT NULL DEFAULT (datetime('now')),\n    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))\n  )`;
  if (route === "reviews" && method === "GET") {
    await env.DB.prepare(CREATE_REVIEWS).run();
    const { results: results } = await env.DB.prepare(
      "SELECT id, title, slug, description, cover_image, rating, created_at FROM reviews ORDER BY created_at DESC"
    ).all();
    return respond(results);
  }
  const revBySlug = route.match(/^reviews\/by-slug\/(.+)$/);
  if (revBySlug && method === "GET") {
    if (!(await canView())) return respond({ error: "unauthorized" }, 401);
    await env.DB.prepare(CREATE_REVIEWS).run();
    const slug = decodeURIComponent(revBySlug[1]);
    const row = await env.DB.prepare("SELECT * FROM reviews WHERE slug = ?").bind(slug).first();
    return row ? respond(row) : respond({ error: "not found" }, 404);
  }
  const revSingle = route.match(/^reviews\/(\d+)$/);
  if (revSingle && method === "GET") {
    await env.DB.prepare(CREATE_REVIEWS).run();
    const row = await env.DB.prepare("SELECT * FROM reviews WHERE id = ?")
      .bind(parseInt(revSingle[1]))
      .first();
    return row ? respond(row) : respond({ error: "not found" }, 404);
  }
  if (route === "reviews" && method === "POST") {
    if (!authed()) return respond({ error: "unauthorized" }, 401);
    await env.DB.prepare(CREATE_REVIEWS).run();
    if (!(await isPro(env, canonHost(env, request)))) {
      const c = await env.DB.prepare("SELECT COUNT(*) AS c FROM reviews").first<{ c: number }>();
      if ((c?.c || 0) >= 5)
        return respond(
          { error: "Free plan is limited to 5 reviews — upgrade to Pro for unlimited." },
          403
        );
    }
    const b: Record<string, any> = await request.json();
    if (!b.slug?.trim()) return respond({ error: "slug required" }, 400);
    if (b.slug.trim().toLowerCase() === "all")
      return respond({ error: '"all" is a reserved slug' }, 409);
    try {
      const r = await env.DB.prepare(
        "INSERT INTO reviews (title, slug, description, content, cover_image, rating) VALUES (?, ?, ?, ?, ?, ?)"
      )
        .bind(
          b.title || "",
          b.slug.trim(),
          b.description || "",
          b.content || "",
          b.cover_image || "",
          parseInt(b.rating) || 0
        )
        .run();
      return respond({ id: r.meta?.last_row_id }, 201);
    } catch (e) {
      return respond({ error: "slug already exists" }, 409);
    }
  }
  if (revSingle && method === "PUT") {
    if (!authed()) return respond({ error: "unauthorized" }, 401);
    await env.DB.prepare(CREATE_REVIEWS).run();
    const b: Record<string, any> = await request.json();
    if (
      String(b.slug || "")
        .trim()
        .toLowerCase() === "all"
    )
      return respond({ error: '"all" is a reserved slug' }, 409);
    await env.DB.prepare(
      "UPDATE reviews SET title=?, slug=?, description=?, content=?, cover_image=?, rating=?, updated_at=datetime('now') WHERE id=?"
    )
      .bind(
        b.title || "",
        b.slug || "",
        b.description || "",
        b.content || "",
        b.cover_image || "",
        parseInt(b.rating) || 0,
        parseInt(revSingle[1])
      )
      .run();
    return respond({ ok: true });
  }
  if (revSingle && method === "DELETE") {
    if (!authed()) return respond({ error: "unauthorized" }, 401);
    await env.DB.prepare("DELETE FROM reviews WHERE id = ?").bind(parseInt(revSingle[1])).run();
    return respond({ ok: true });
  }
  const CREATE_COLLECTIONS = `CREATE TABLE IF NOT EXISTS collections (\n    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE,\n    created_at TEXT NOT NULL DEFAULT (datetime('now')))`;
  const CREATE_CITEMS = `CREATE TABLE IF NOT EXISTS collection_items (\n    id INTEGER PRIMARY KEY AUTOINCREMENT, collection_id INTEGER NOT NULL, title TEXT NOT NULL DEFAULT '',\n    slug TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', content TEXT NOT NULL DEFAULT '',\n    cover_image TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL DEFAULT 0,\n    created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')),\n    UNIQUE(collection_id, slug))`;
  const ensureColl = async () => {
    await env.DB.prepare(CREATE_COLLECTIONS).run();
    await env.DB.prepare(CREATE_CITEMS).run();
  };
  const RESERVED = new Set(["all", "new"]);
  const cleanSlug = (s: unknown) =>
    String(s || "")
      .trim()
      .replace(/^\/+|\/+$/g, "");
  const collBySlug = (cs: string) =>
    env.DB.prepare("SELECT id, name, slug FROM collections WHERE slug = ?")
      .bind(decodeURIComponent(cs))
      .first<{ id: number; name: string; slug: string }>();
  if (route === "collections" && method === "GET") {
    await ensureColl();
    const { results: results } = await env.DB.prepare(
      "SELECT id, name, slug FROM collections ORDER BY name"
    ).all();
    return respond(results || []);
  }
  if (route === "collections" && method === "POST") {
    if (!authed()) return respond({ error: "unauthorized" }, 401);
    await ensureColl();
    if (!(await isPro(env, canonHost(env, request)))) {
      const c = await env.DB.prepare("SELECT COUNT(*) AS c FROM collections").first<{
        c: number;
      }>();
      if ((c?.c || 0) >= 2)
        return respond(
          { error: "Free plan is limited to 2 collections — upgrade to Pro for unlimited." },
          403
        );
    }
    const b: Record<string, any> = (await request.json().catch(() => ({}))) as any;
    const slug = cleanSlug(b.slug);
    if (!b.name || !slug) return respond({ error: "name and slug required" }, 400);
    if (RESERVED.has(slug.toLowerCase())) return respond({ error: "reserved slug" }, 409);
    try {
      const r = await env.DB.prepare("INSERT INTO collections (name, slug) VALUES (?,?)")
        .bind(String(b.name).trim(), slug)
        .run();
      return respond({ id: r.meta?.last_row_id }, 201);
    } catch {
      return respond({ error: "slug already exists" }, 409);
    }
  }
  const collSingle = route.match(/^collections\/(\d+)$/);
  if (collSingle && method === "PUT") {
    if (!authed()) return respond({ error: "unauthorized" }, 401);
    await ensureColl();
    const b: Record<string, any> = (await request.json().catch(() => ({}))) as any;
    const slug = cleanSlug(b.slug);
    if (!b.name || !slug) return respond({ error: "name and slug required" }, 400);
    await env.DB.prepare("UPDATE collections SET name=?, slug=? WHERE id=?")
      .bind(String(b.name).trim(), slug, parseInt(collSingle[1]))
      .run();
    return respond({ ok: true });
  }
  if (collSingle && method === "DELETE") {
    if (!authed()) return respond({ error: "unauthorized" }, 401);
    await ensureColl();
    const id = parseInt(collSingle[1]);
    await env.DB.prepare("DELETE FROM collection_items WHERE collection_id=?").bind(id).run();
    await env.DB.prepare("DELETE FROM collections WHERE id=?").bind(id).run();
    return respond({ ok: true });
  }
  const ciList = route.match(/^collections\/([^/]+)\/items$/);
  const ciBySlug = route.match(/^collections\/([^/]+)\/items\/by-slug\/(.+)$/);
  const ciSingle = route.match(/^collections\/([^/]+)\/items\/(\d+)$/);
  if (ciList && method === "GET") {
    if (!(await canView())) return respond({ error: "unauthorized" }, 401);
    await ensureColl();
    const c = await collBySlug(ciList[1]);
    if (!c) return respond([]);
    const { results: results } = await env.DB.prepare(
      "SELECT id, title, slug, description, cover_image, sort_order, created_at FROM collection_items WHERE collection_id=? ORDER BY sort_order ASC, created_at DESC"
    )
      .bind(c.id)
      .all();
    return respond(results || []);
  }
  if (ciList && method === "POST") {
    if (!authed()) return respond({ error: "unauthorized" }, 401);
    await ensureColl();
    const c = await collBySlug(ciList[1]);
    if (!c) return respond({ error: "collection not found" }, 404);
    const b: Record<string, any> = (await request.json().catch(() => ({}))) as any;
    const slug = cleanSlug(b.slug);
    if (!slug) return respond({ error: "slug required" }, 400);
    if (RESERVED.has(slug.toLowerCase())) return respond({ error: "reserved slug" }, 409);
    try {
      const r = await env.DB.prepare(
        "INSERT INTO collection_items (collection_id,title,slug,description,content,cover_image) VALUES (?,?,?,?,?,?)"
      )
        .bind(c.id, b.title || "", slug, b.description || "", b.content || "", b.cover_image || "")
        .run();
      return respond({ id: r.meta?.last_row_id }, 201);
    } catch {
      return respond({ error: "slug already exists in this collection" }, 409);
    }
  }
  if (ciBySlug && method === "GET") {
    if (!(await canView())) return respond({ error: "unauthorized" }, 401);
    await ensureColl();
    const c = await collBySlug(ciBySlug[1]);
    if (!c) return respond({ error: "not found" }, 404);
    const row = await env.DB.prepare(
      "SELECT * FROM collection_items WHERE collection_id=? AND slug=?"
    )
      .bind(c.id, decodeURIComponent(ciBySlug[2]))
      .first();
    return row ? respond(row) : respond({ error: "not found" }, 404);
  }
  if (ciSingle && method === "GET") {
    await ensureColl();
    const row = await env.DB.prepare("SELECT * FROM collection_items WHERE id=?")
      .bind(parseInt(ciSingle[2]))
      .first();
    return row ? respond(row) : respond({ error: "not found" }, 404);
  }
  if (ciSingle && method === "PUT") {
    if (!authed()) return respond({ error: "unauthorized" }, 401);
    await ensureColl();
    const b: Record<string, any> = (await request.json().catch(() => ({}))) as any;
    const slug = cleanSlug(b.slug);
    await env.DB.prepare(
      "UPDATE collection_items SET title=?, slug=?, description=?, content=?, cover_image=?, updated_at=datetime('now') WHERE id=?"
    )
      .bind(
        b.title || "",
        slug,
        b.description || "",
        b.content || "",
        b.cover_image || "",
        parseInt(ciSingle[2])
      )
      .run();
    return respond({ ok: true });
  }
  if (ciSingle && method === "DELETE") {
    if (!authed()) return respond({ error: "unauthorized" }, 401);
    await env.DB.prepare("DELETE FROM collection_items WHERE id=?")
      .bind(parseInt(ciSingle[2]))
      .run();
    return respond({ ok: true });
  }
  return null;
}
