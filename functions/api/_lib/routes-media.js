
export async function handleMedia(ctx) {
  const { route, method, request, env, headers, respond, compressJson, decompressJson, CREATE_SESSIONS, CREATE_BANNED_EMAILS, CREATE_PAGES, authed, visitorAuthed, _adminRole } = ctx;

  const CREATE_IMAGES = `CREATE TABLE IF NOT EXISTS images (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL DEFAULT '',
    data       TEXT    NOT NULL,
    mime       TEXT    NOT NULL DEFAULT 'image/jpeg',
    size       INTEGER NOT NULL DEFAULT 0,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  )`;

  if (route === 'images' && method === 'GET') {
    if (!authed()) return respond({ error: 'unauthorized' }, 401);
    await env.DB.prepare(CREATE_IMAGES).run();
    const { results } = await env.DB.prepare(
      'SELECT id, name, mime, size, created_at FROM images ORDER BY id DESC'
    ).all();
    return respond(results);
  }

  if (route === 'images' && method === 'POST') {
    if (!authed()) return respond({ error: 'unauthorized' }, 401);
    await env.DB.prepare(CREATE_IMAGES).run();
    const { name = '', data, mime = 'image/jpeg', size = 0 } = await request.json().catch(() => ({}));
    if (!data) return respond({ error: 'data required' }, 400);
    const r = await env.DB.prepare(
      'INSERT INTO images (name, data, mime, size) VALUES (?, ?, ?, ?)'
    ).bind(name, data, mime, size).run();
    return respond({ id: r.meta?.last_row_id }, 201);
  }

  const imageSingle = route.match(/^images\/(\d+)$/);

  if (imageSingle && method === 'GET') {
    await env.DB.prepare(CREATE_IMAGES).run();
    const row = await env.DB.prepare('SELECT data, mime FROM images WHERE id = ?').bind(parseInt(imageSingle[1])).first();
    if (!row) return new Response('Not found', { status: 404 });
    const base64 = row.data.replace(/^data:[^;]+;base64,/, '');
    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    return new Response(bytes, {
      headers: {
        'Content-Type': row.mime,

        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=604800',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  if (imageSingle && method === 'PUT') {
    if (!authed()) return respond({ error: 'unauthorized' }, 401);
    const { name, data, mime, size } = await request.json().catch(() => ({}));
    const id = parseInt(imageSingle[1]);
    if (data) {

      await env.DB.prepare('UPDATE images SET data = ?, mime = ?, size = ? WHERE id = ?')
        .bind(data, mime || 'image/jpeg', size || 0, id).run();
      if (typeof name === 'string') await env.DB.prepare('UPDATE images SET name = ? WHERE id = ?').bind(name, id).run();
    } else {
      await env.DB.prepare('UPDATE images SET name = ? WHERE id = ?').bind(name || '', id).run();
    }
    return respond({ ok: true });
  }

  if (imageSingle && method === 'DELETE') {
    if (!authed()) return respond({ error: 'unauthorized' }, 401);
    await env.DB.prepare('DELETE FROM images WHERE id = ?').bind(parseInt(imageSingle[1])).run();
    return respond({ ok: true });
  }

  const CREATE_FILES = `CREATE TABLE IF NOT EXISTS files (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL DEFAULT '',
    mime       TEXT    NOT NULL DEFAULT 'application/octet-stream',
    size       INTEGER NOT NULL DEFAULT 0,
    data       TEXT    NOT NULL,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  )`;

  if (route === 'files' && method === 'GET') {
    if (!authed()) return respond({ error: 'unauthorized' }, 401);
    await env.DB.prepare(CREATE_FILES).run();
    const { results } = await env.DB.prepare(
      'SELECT id, name, mime, size, created_at FROM files ORDER BY id DESC'
    ).all();
    return respond(results);
  }

  if (route === 'files' && method === 'POST') {
    if (!authed()) return respond({ error: 'unauthorized' }, 401);
    await env.DB.prepare(CREATE_FILES).run();
    const { name = '', data, mime = 'application/octet-stream', size = 0 } = await request.json().catch(() => ({}));
    if (!data) return respond({ error: 'data required' }, 400);
    const r = await env.DB.prepare(
      'INSERT INTO files (name, data, mime, size) VALUES (?, ?, ?, ?)'
    ).bind(name, data, mime, size).run();
    return respond({ id: r.meta?.last_row_id }, 201);
  }

  const fileSingle = route.match(/^files\/(\d+)$/);

  if (fileSingle && method === 'GET') {
    await env.DB.prepare(CREATE_FILES).run();
    const row = await env.DB.prepare('SELECT data, mime, name FROM files WHERE id = ?').bind(parseInt(fileSingle[1])).first();
    if (!row) return new Response('Not found', { status: 404 });
    const base64 = row.data.replace(/^data:[^;]+;base64,/, '');
    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    const filename = encodeURIComponent(row.name || `file-${fileSingle[1]}`);
    const url2 = new URL(request.url);
    const inline = url2.searchParams.has('preview') || url2.searchParams.has('inline');
    return new Response(bytes, {
      headers: {
        'Content-Type': row.mime,
        'Content-Disposition': `${inline ? 'inline' : 'attachment'}; filename*=UTF-8''${filename}`,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  if (fileSingle && method === 'DELETE') {
    if (!authed()) return respond({ error: 'unauthorized' }, 401);
    await env.DB.prepare('DELETE FROM files WHERE id = ?').bind(parseInt(fileSingle[1])).run();
    return respond({ ok: true });
  }

  return null;
}
