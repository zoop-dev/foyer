import type { Ctx } from "./types.ts";

function b64ToBytes(data: unknown): Uint8Array {
  const bin = atob(String(data).replace(/^data:[^;]+;base64,/, ""));
  const len = bin.length,
    bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}
export async function handleMedia(ctx: Ctx): Promise<Response | null> {
  const {
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
  } = ctx;
  const CREATE_IMAGES = `CREATE TABLE IF NOT EXISTS images (\n    id         INTEGER PRIMARY KEY AUTOINCREMENT,\n    name       TEXT    NOT NULL DEFAULT '',\n    data       TEXT    NOT NULL,\n    mime       TEXT    NOT NULL DEFAULT 'image/jpeg',\n    size       INTEGER NOT NULL DEFAULT 0,\n    created_at TEXT    NOT NULL DEFAULT (datetime('now'))\n  )`;
  if (route === "images" && method === "GET") {
    if (!authed()) return respond({ error: "unauthorized" }, 401);
    await env.DB.prepare(CREATE_IMAGES).run();
    const { results: results } = await env.DB.prepare(
      "SELECT id, name, mime, size, created_at FROM images ORDER BY id DESC"
    ).all();
    return respond(results);
  }
  if (route === "images" && method === "POST") {
    if (!authed()) return respond({ error: "unauthorized" }, 401);
    await env.DB.prepare(CREATE_IMAGES).run();
    const {
      name: name = "",
      data: data,
      mime: mime = "image/jpeg",
      size: size = 0,
    } = (await request
      .json()
      .catch(() => ({}) as { name?: string; data?: string; mime?: string; size?: number })) as any;
    if (!data) return respond({ error: "data required" }, 400);
    const r = await env.DB.prepare(
      "INSERT INTO images (name, data, mime, size) VALUES (?, ?, ?, ?)"
    )
      .bind(name, data, mime, size)
      .run();
    return respond({ id: r.meta?.last_row_id }, 201);
  }
  const imageSingle = route.match(/^images\/(\d+)$/);
  if (imageSingle && method === "GET") {
    const cache = (caches as any).default;
    const cacheKey = new Request(new URL(request.url).toString(), { method: "GET" });
    const hit = await cache.match(cacheKey);
    if (hit) return hit;
    const row = await env.DB.prepare("SELECT data, mime FROM images WHERE id = ?")
      .bind(parseInt(imageSingle[1]))
      .first<{ data: string; mime: string }>();
    if (!row) return new Response("Not found", { status: 404 });
    const resp = new Response(b64ToBytes(row.data) as any, {
      headers: {
        "Content-Type": row.mime,
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=604800",
        "Access-Control-Allow-Origin": "*",
      },
    });
    if (waitUntil) waitUntil(cache.put(cacheKey, resp.clone()));
    return resp;
  }
  if (imageSingle && method === "PUT") {
    if (!authed()) return respond({ error: "unauthorized" }, 401);
    const {
      name: name,
      data: data,
      mime: mime,
      size: size,
    } = (await request
      .json()
      .catch(() => ({}) as { name?: string; data?: string; mime?: string; size?: number })) as any;
    const id = parseInt(imageSingle[1]);
    if (data) {
      await env.DB.prepare("UPDATE images SET data = ?, mime = ?, size = ? WHERE id = ?")
        .bind(data, mime || "image/jpeg", size || 0, id)
        .run();
      if (typeof name === "string")
        await env.DB.prepare("UPDATE images SET name = ? WHERE id = ?").bind(name, id).run();
      await (caches as any).default
        .delete(new Request(new URL(request.url).toString(), { method: "GET" }))
        .catch(() => {});
    } else {
      await env.DB.prepare("UPDATE images SET name = ? WHERE id = ?")
        .bind(name || "", id)
        .run();
    }
    return respond({ ok: true });
  }
  if (imageSingle && method === "DELETE") {
    if (!authed()) return respond({ error: "unauthorized" }, 401);
    await env.DB.prepare("DELETE FROM images WHERE id = ?").bind(parseInt(imageSingle[1])).run();
    await (caches as any).default
      .delete(new Request(new URL(request.url).toString(), { method: "GET" }))
      .catch(() => {});
    return respond({ ok: true });
  }
  const CREATE_FILES = `CREATE TABLE IF NOT EXISTS files (\n    id         INTEGER PRIMARY KEY AUTOINCREMENT,\n    name       TEXT    NOT NULL DEFAULT '',\n    mime       TEXT    NOT NULL DEFAULT 'application/octet-stream',\n    size       INTEGER NOT NULL DEFAULT 0,\n    data       TEXT    NOT NULL,\n    created_at TEXT    NOT NULL DEFAULT (datetime('now'))\n  )`;
  if (route === "files" && method === "GET") {
    if (!authed()) return respond({ error: "unauthorized" }, 401);
    await env.DB.prepare(CREATE_FILES).run();
    const { results: results } = await env.DB.prepare(
      "SELECT id, name, mime, size, created_at FROM files ORDER BY id DESC"
    ).all();
    return respond(results);
  }
  if (route === "files" && method === "POST") {
    if (!authed()) return respond({ error: "unauthorized" }, 401);
    await env.DB.prepare(CREATE_FILES).run();
    const {
      name: name = "",
      data: data,
      mime: mime = "application/octet-stream",
      size: size = 0,
    } = (await request
      .json()
      .catch(() => ({}) as { name?: string; data?: string; mime?: string; size?: number })) as any;
    if (!data) return respond({ error: "data required" }, 400);
    const r = await env.DB.prepare("INSERT INTO files (name, data, mime, size) VALUES (?, ?, ?, ?)")
      .bind(name, data, mime, size)
      .run();
    return respond({ id: r.meta?.last_row_id }, 201);
  }
  const fileSingle = route.match(/^files\/(\d+)$/);
  if (fileSingle && method === "GET") {
    const cache = (caches as any).default;
    const cacheKey = new Request(new URL(request.url).toString(), { method: "GET" });
    const hit = await cache.match(cacheKey);
    if (hit) return hit;
    const row = await env.DB.prepare("SELECT data, mime, name FROM files WHERE id = ?")
      .bind(parseInt(fileSingle[1]))
      .first<{ data: string; mime: string; name: string }>();
    if (!row) return new Response("Not found", { status: 404 });
    const filename = encodeURIComponent(row.name || `file-${fileSingle[1]}`);
    const url2 = new URL(request.url);
    const inline = url2.searchParams.has("preview") || url2.searchParams.has("inline");
    const resp = new Response(b64ToBytes(row.data) as any, {
      headers: {
        "Content-Type": row.mime,
        "Content-Disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${filename}`,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
    if (waitUntil) waitUntil(cache.put(cacheKey, resp.clone()));
    return resp;
  }
  if (fileSingle && method === "DELETE") {
    if (!authed()) return respond({ error: "unauthorized" }, 401);
    await env.DB.prepare("DELETE FROM files WHERE id = ?").bind(parseInt(fileSingle[1])).run();
    await (caches as any).default
      .delete(new Request(new URL(request.url).toString(), { method: "GET" }))
      .catch(() => {});
    return respond({ ok: true });
  }
  return null;
}
