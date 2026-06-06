




export async function handleBackup(ctx) {
  const { route, method, request, env, respond, compressJson, decompressJson, authed } = ctx;
  if (route !== 'backup' && route !== 'backup/restore') return null;
  if (!authed()) return respond({ error: 'unauthorized' }, 401);

  const DDL = [
    `CREATE TABLE IF NOT EXISTS pages (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL DEFAULT 'Untitled', slug TEXT NOT NULL UNIQUE, page_json TEXT NOT NULL DEFAULT '', is_published INTEGER NOT NULL DEFAULT 1, sort_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS site_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL DEFAULT '')`,
    `CREATE TABLE IF NOT EXISTS images (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL DEFAULT '', data TEXT NOT NULL, mime TEXT NOT NULL DEFAULT 'image/jpeg', size INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS files (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL DEFAULT '', mime TEXT NOT NULL DEFAULT 'application/octet-stream', size INTEGER NOT NULL DEFAULT 0, data TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS collections (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS collection_items (id INTEGER PRIMARY KEY AUTOINCREMENT, collection_id INTEGER NOT NULL, title TEXT NOT NULL DEFAULT '', slug TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', content TEXT NOT NULL DEFAULT '', cover_image TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')), UNIQUE(collection_id, slug))`,
    `CREATE TABLE IF NOT EXISTS tutorials (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, description TEXT NOT NULL DEFAULT '', content TEXT NOT NULL DEFAULT '', cover_image TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS reviews (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, description TEXT NOT NULL DEFAULT '', content TEXT NOT NULL DEFAULT '', cover_image TEXT NOT NULL DEFAULT '', rating INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))`,
  ];
  const ensureAll = async () => { for (const d of DDL) await env.DB.prepare(d).run(); };

  const refIds = (str, kind) => { const set = new Set(); if (!str) return set; const re = new RegExp('/api/' + kind + '/(\\d+)', 'g'); let m; while ((m = re.exec(str))) set.add(parseInt(m[1])); return set; };

  if (route === 'backup' && method === 'GET') {
    await ensureAll();
    const url = new URL(request.url);
    const scope = url.searchParams.get('scope') || 'site';
    const out = { foyer_backup: 1, created: new Date().toISOString(), scope, site: { domain: url.hostname }, data: {} };
    const imgIds = new Set(), fileIds = new Set();
    const addRefs = (s) => { for (const id of refIds(s, 'images')) imgIds.add(id); for (const id of refIds(s, 'files')) fileIds.add(id); };

    if (scope === 'page') {
      const slug = url.searchParams.get('slug');
      const p = await env.DB.prepare('SELECT title, slug, page_json, is_published, sort_order FROM pages WHERE slug = ?').bind(slug).first();
      if (!p) return respond({ error: 'page not found' }, 404);
      p.page_json = await decompressJson(p.page_json);
      addRefs(p.page_json);
      out.data.pages = [p];
    } else {
      const { results } = await env.DB.prepare('SELECT title, slug, page_json, is_published, sort_order FROM pages ORDER BY sort_order ASC, id ASC').all();
      out.data.pages = await Promise.all((results || []).map(async (r) => { r.page_json = await decompressJson(r.page_json); addRefs(r.page_json); return r; }));
    }

    if (scope === 'site') {
      const st = await env.DB.prepare('SELECT key, value FROM site_settings').all();
      out.data.settings = {}; (st.results || []).forEach((r) => { out.data.settings[r.key] = r.value; });

      const cols = await env.DB.prepare('SELECT id, name, slug FROM collections ORDER BY id ASC').all();
      out.data.collections = (cols.results || []).map((c) => ({ name: c.name, slug: c.slug }));
      const idToSlug = {}; (cols.results || []).forEach((c) => { idToSlug[c.id] = c.slug; });

      const items = await env.DB.prepare('SELECT collection_id, title, slug, description, content, cover_image, sort_order FROM collection_items ORDER BY collection_id ASC, sort_order ASC').all();
      out.data.collection_items = (items.results || []).map((it) => { addRefs(it.content); addRefs(it.cover_image); return { collection_slug: idToSlug[it.collection_id], title: it.title, slug: it.slug, description: it.description, content: it.content, cover_image: it.cover_image, sort_order: it.sort_order }; });

      const tut = await env.DB.prepare('SELECT title, slug, description, content, cover_image FROM tutorials ORDER BY id ASC').all();
      out.data.tutorials = (tut.results || []).map((t) => { addRefs(t.content); addRefs(t.cover_image); return t; });

      const rev = await env.DB.prepare('SELECT title, slug, description, content, cover_image, rating FROM reviews ORDER BY id ASC').all();
      out.data.reviews = (rev.results || []).map((t) => { addRefs(t.content); addRefs(t.cover_image); return t; });

      const imgs = await env.DB.prepare('SELECT id, name, data, mime, size FROM images').all();
      out.data.images = imgs.results || [];
      const fls = await env.DB.prepare('SELECT id, name, data, mime, size FROM files').all();
      out.data.files = fls.results || [];
    } else {

      if (imgIds.size) { const ph = [...imgIds].map(() => '?').join(','); const r = await env.DB.prepare(`SELECT id, name, data, mime, size FROM images WHERE id IN (${ph})`).bind(...imgIds).all(); out.data.images = r.results || []; } else out.data.images = [];
      if (fileIds.size) { const ph = [...fileIds].map(() => '?').join(','); const r = await env.DB.prepare(`SELECT id, name, data, mime, size FROM files WHERE id IN (${ph})`).bind(...fileIds).all(); out.data.files = r.results || []; } else out.data.files = [];
    }
    return respond(out);
  }

  if (route === 'backup/restore' && method === 'POST') {
    const bundle = await request.json().catch(() => null);
    if (!bundle || bundle.foyer_backup !== 1 || !bundle.data) return respond({ error: 'not a valid .foyer backup' }, 400);
    await ensureAll();
    const data = bundle.data;
    const counts = { images: 0, files: 0, pages: 0, collections: 0, collection_items: 0, tutorials: 0, reviews: 0, settings: 0 };


    const insertAssets = async (rows, table, defMime) => {
      const map = {};
      const existing = await env.DB.prepare(`SELECT id, name, size FROM ${table}`).all();
      const sig = {}; (existing.results || []).forEach((r) => { sig[(r.name || '') + '|' + (r.size || 0)] = r.id; });
      const toInsert = [];
      for (const a of (rows || [])) {
        const key = (a.name || '') + '|' + (a.size || 0);
        if (sig[key] != null) { map[a.id] = sig[key]; continue; }
        toInsert.push(a);
      }
      if (toInsert.length) {
        const stmts = toInsert.map((a) => env.DB.prepare(`INSERT INTO ${table} (name, data, mime, size) VALUES (?,?,?,?)`).bind(a.name || '', a.data, a.mime || defMime, a.size || 0));
        const res = await env.DB.batch(stmts);
        res.forEach((r, i) => { const nid = r.meta?.last_row_id; map[toInsert[i].id] = nid; sig[(toInsert[i].name || '') + '|' + (toInsert[i].size || 0)] = nid; });
      }
      return { map, added: toInsert.length };
    };

    const img = await insertAssets(data.images, 'images', 'image/jpeg'); counts.images = img.added;
    const fil = await insertAssets(data.files, 'files', 'application/octet-stream'); counts.files = fil.added;
    const imgMap = img.map, fileMap = fil.map;
    const remap = (s) => { if (!s) return s; return String(s).replace(/\/api\/images\/(\d+)/g, (m, id) => imgMap[id] != null ? '/api/images/' + imgMap[id] : m).replace(/\/api\/files\/(\d+)/g, (m, id) => fileMap[id] != null ? '/api/files/' + fileMap[id] : m); };

    if (Array.isArray(data.pages) && data.pages.length) {
      const stmts = [];
      for (const p of data.pages) {
        const pj = await compressJson(remap(p.page_json || ''));
        stmts.push(env.DB.prepare('INSERT INTO pages (title, slug, page_json, is_published, sort_order) VALUES (?,?,?,?,?) ON CONFLICT(slug) DO UPDATE SET title=excluded.title, page_json=excluded.page_json, is_published=excluded.is_published, sort_order=excluded.sort_order').bind(p.title || 'Untitled', p.slug, pj, p.is_published != null ? (p.is_published ? 1 : 0) : 1, p.sort_order || 0));
      }
      await env.DB.batch(stmts); counts.pages = stmts.length;
    }

    if (Array.isArray(data.collections) && data.collections.length) {
      await env.DB.batch(data.collections.map((c) => env.DB.prepare('INSERT INTO collections (name, slug) VALUES (?,?) ON CONFLICT(slug) DO UPDATE SET name=excluded.name').bind(c.name || '', c.slug)));
      counts.collections = data.collections.length;
    }
    if (Array.isArray(data.collection_items) && data.collection_items.length) {
      const cols = await env.DB.prepare('SELECT id, slug FROM collections').all();
      const cid = {}; (cols.results || []).forEach((c) => { cid[c.slug] = c.id; });
      const stmts = [];
      for (const it of data.collection_items) {
        const collId = cid[it.collection_slug]; if (collId == null) continue;
        stmts.push(env.DB.prepare("INSERT INTO collection_items (collection_id, title, slug, description, content, cover_image, sort_order) VALUES (?,?,?,?,?,?,?) ON CONFLICT(collection_id, slug) DO UPDATE SET title=excluded.title, description=excluded.description, content=excluded.content, cover_image=excluded.cover_image, sort_order=excluded.sort_order, updated_at=datetime('now')").bind(collId, it.title || '', it.slug, it.description || '', remap(it.content || ''), remap(it.cover_image || ''), it.sort_order || 0));
      }
      if (stmts.length) await env.DB.batch(stmts); counts.collection_items = stmts.length;
    }

    if (Array.isArray(data.tutorials) && data.tutorials.length) {
      await env.DB.batch(data.tutorials.map((t) => env.DB.prepare("INSERT INTO tutorials (title, slug, description, content, cover_image) VALUES (?,?,?,?,?) ON CONFLICT(slug) DO UPDATE SET title=excluded.title, description=excluded.description, content=excluded.content, cover_image=excluded.cover_image, updated_at=datetime('now')").bind(t.title || '', t.slug, t.description || '', remap(t.content || ''), remap(t.cover_image || ''))));
      counts.tutorials = data.tutorials.length;
    }
    if (Array.isArray(data.reviews) && data.reviews.length) {
      await env.DB.batch(data.reviews.map((t) => env.DB.prepare("INSERT INTO reviews (title, slug, description, content, cover_image, rating) VALUES (?,?,?,?,?,?) ON CONFLICT(slug) DO UPDATE SET title=excluded.title, description=excluded.description, content=excluded.content, cover_image=excluded.cover_image, rating=excluded.rating, updated_at=datetime('now')").bind(t.title || '', t.slug, t.description || '', remap(t.content || ''), remap(t.cover_image || ''), parseInt(t.rating) || 0)));
      counts.reviews = data.reviews.length;
    }

    if (data.settings && typeof data.settings === 'object') {
      const entries = Object.entries(data.settings);
      if (entries.length) await env.DB.batch(entries.map(([k, v]) => env.DB.prepare('INSERT INTO site_settings (key, value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind(k, String(v))));
      counts.settings = entries.length;
    }

    return respond({ ok: true, counts });
  }

  return null;
}
