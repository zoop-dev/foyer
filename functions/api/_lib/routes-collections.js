
export async function handleCollections(ctx) {
  const { route, method, request, env, headers, respond, compressJson, decompressJson, CREATE_SESSIONS, CREATE_BANNED_EMAILS, CREATE_PAGES, authed, visitorAuthed, _adminRole } = ctx;

  const CREATE_TUTORIALS = `CREATE TABLE IF NOT EXISTS tutorials (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    slug        TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL DEFAULT '',
    content     TEXT NOT NULL DEFAULT '',
    cover_image TEXT NOT NULL DEFAULT '',
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
  )`;

  if (route === 'tutorials' && method === 'GET') {
    await env.DB.prepare(CREATE_TUTORIALS).run();
    const { results } = await env.DB.prepare(
      'SELECT id, title, slug, description, cover_image, created_at FROM tutorials ORDER BY created_at DESC'
    ).all();
    return respond(results);
  }

  const tutBySlug = route.match(/^tutorials\/by-slug\/(.+)$/);
  if (tutBySlug && method === 'GET') {
    if (!authed() && !(await visitorAuthed())) return respond({ error: 'unauthorized' }, 401);
    await env.DB.prepare(CREATE_TUTORIALS).run();
    const slug = decodeURIComponent(tutBySlug[1]);
    const row = await env.DB.prepare('SELECT * FROM tutorials WHERE slug = ?').bind(slug).first();
    return row ? respond(row) : respond({ error: 'not found' }, 404);
  }

  const tutSingle = route.match(/^tutorials\/(\d+)$/);

  if (tutSingle && method === 'GET') {
    await env.DB.prepare(CREATE_TUTORIALS).run();
    const row = await env.DB.prepare('SELECT * FROM tutorials WHERE id = ?').bind(parseInt(tutSingle[1])).first();
    return row ? respond(row) : respond({ error: 'not found' }, 404);
  }

  if (route === 'tutorials' && method === 'POST') {
    if (!authed()) return respond({ error: 'unauthorized' }, 401);
    await env.DB.prepare(CREATE_TUTORIALS).run();
    const b = await request.json();
    if ((b.slug || '').trim().toLowerCase() === 'all') return respond({ error: '"all" is a reserved slug' }, 409);
    const r = await env.DB.prepare(
      'INSERT INTO tutorials (title, slug, description, content, cover_image) VALUES (?, ?, ?, ?, ?)'
    ).bind(b.title || '', b.slug || '', b.description || '', b.content || '', b.cover_image || '').run();
    return respond({ id: r.meta?.last_row_id }, 201);
  }

  if (tutSingle && method === 'PUT') {
    if (!authed()) return respond({ error: 'unauthorized' }, 401);
    await env.DB.prepare(CREATE_TUTORIALS).run();
    const b = await request.json();
    if ((b.slug || '').trim().toLowerCase() === 'all') return respond({ error: '"all" is a reserved slug' }, 409);
    await env.DB.prepare(
      "UPDATE tutorials SET title=?, slug=?, description=?, content=?, cover_image=?, updated_at=datetime('now') WHERE id=?"
    ).bind(b.title || '', b.slug || '', b.description || '', b.content || '', b.cover_image || '', parseInt(tutSingle[1])).run();
    return respond({ ok: true });
  }

  if (tutSingle && method === 'DELETE') {
    if (!authed()) return respond({ error: 'unauthorized' }, 401);
    await env.DB.prepare('DELETE FROM tutorials WHERE id = ?').bind(parseInt(tutSingle[1])).run();
    return respond({ ok: true });
  }

  const CREATE_REVIEWS = `CREATE TABLE IF NOT EXISTS reviews (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    slug        TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL DEFAULT '',
    content     TEXT NOT NULL DEFAULT '',
    cover_image TEXT NOT NULL DEFAULT '',
    rating      INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
  )`;

  if (route === 'reviews' && method === 'GET') {
    await env.DB.prepare(CREATE_REVIEWS).run();
    const { results } = await env.DB.prepare(
      'SELECT id, title, slug, description, cover_image, rating, created_at FROM reviews ORDER BY created_at DESC'
    ).all();
    return respond(results);
  }

  const revBySlug = route.match(/^reviews\/by-slug\/(.+)$/);
  if (revBySlug && method === 'GET') {
    if (!authed() && !(await visitorAuthed())) return respond({ error: 'unauthorized' }, 401);
    await env.DB.prepare(CREATE_REVIEWS).run();
    const slug = decodeURIComponent(revBySlug[1]);
    const row = await env.DB.prepare('SELECT * FROM reviews WHERE slug = ?').bind(slug).first();
    return row ? respond(row) : respond({ error: 'not found' }, 404);
  }

  const revSingle = route.match(/^reviews\/(\d+)$/);

  if (revSingle && method === 'GET') {
    await env.DB.prepare(CREATE_REVIEWS).run();
    const row = await env.DB.prepare('SELECT * FROM reviews WHERE id = ?').bind(parseInt(revSingle[1])).first();
    return row ? respond(row) : respond({ error: 'not found' }, 404);
  }

  if (route === 'reviews' && method === 'POST') {
    if (!authed()) return respond({ error: 'unauthorized' }, 401);
    await env.DB.prepare(CREATE_REVIEWS).run();
    const b = await request.json();
    if (!b.slug?.trim()) return respond({ error: 'slug required' }, 400);
    if (b.slug.trim().toLowerCase() === 'all') return respond({ error: '"all" is a reserved slug' }, 409);
    try {
      const r = await env.DB.prepare(
        'INSERT INTO reviews (title, slug, description, content, cover_image, rating) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(b.title || '', b.slug.trim(), b.description || '', b.content || '', b.cover_image || '', parseInt(b.rating) || 0).run();
      return respond({ id: r.meta?.last_row_id }, 201);
    } catch (e) {
      return respond({ error: 'slug already exists' }, 409);
    }
  }

  if (revSingle && method === 'PUT') {
    if (!authed()) return respond({ error: 'unauthorized' }, 401);
    await env.DB.prepare(CREATE_REVIEWS).run();
    const b = await request.json();
    if ((b.slug || '').trim().toLowerCase() === 'all') return respond({ error: '"all" is a reserved slug' }, 409);
    await env.DB.prepare(
      "UPDATE reviews SET title=?, slug=?, description=?, content=?, cover_image=?, rating=?, updated_at=datetime('now') WHERE id=?"
    ).bind(b.title || '', b.slug || '', b.description || '', b.content || '', b.cover_image || '', parseInt(b.rating) || 0, parseInt(revSingle[1])).run();
    return respond({ ok: true });
  }

  if (revSingle && method === 'DELETE') {
    if (!authed()) return respond({ error: 'unauthorized' }, 401);
    await env.DB.prepare('DELETE FROM reviews WHERE id = ?').bind(parseInt(revSingle[1])).run();
    return respond({ ok: true });
  }

  return null;
}
