
import { moderatePage, logModeration } from './moderation.js';

export async function handleContent(ctx) {
  const { route, method, request, env, headers, respond, compressJson, decompressJson, CREATE_SESSIONS, CREATE_BANNED_EMAILS, CREATE_PAGES, authed, visitorAuthed, _adminRole, sitePublic, canView } = ctx;

  if (route === 'settings' && method === 'GET') {
    const { results } = await env.DB.prepare('SELECT key, value FROM site_settings').all();
    const obj = {};
    results.forEach(r => { obj[r.key] = r.value; });
    return respond(obj);
  }

  if (route === 'settings' && method === 'PUT') {
    if (!authed()) return respond({ error: 'unauthorized' }, 401);
    const body = await request.json().catch(() => ({}));
    for (const [key, value] of Object.entries(body)) {
      await env.DB.prepare(
        'INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
      ).bind(key, String(value)).run();
    }
    return respond({ ok: true });
  }

  if (route === 'pages' && method === 'GET') {
    await env.DB.prepare(CREATE_PAGES).run();
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug');
    if (slug !== null) {
      const vAuth = await visitorAuthed();
      if (vAuth === 'banned') return respond({ error: 'account_banned' }, 403);
      if (!authed() && vAuth !== 'ok' && !(await sitePublic())) return respond({ error: 'unauthorized' }, 401);
      const page = await env.DB.prepare(
        'SELECT * FROM pages WHERE slug = ? AND is_published = 1'
      ).bind(slug).first();
      if (page) page.page_json = await decompressJson(page.page_json);
      return respond(page || null);
    }
    if (!authed()) return respond({ error: 'unauthorized' }, 401);
    const { results } = await env.DB.prepare(
      'SELECT id, title, slug, is_published, sort_order, created_at, page_json FROM pages ORDER BY sort_order ASC, id ASC'
    ).all();
    const pages = await Promise.all((results || []).map(async p => ({ ...p, page_json: await decompressJson(p.page_json) })));
    return respond(pages);
  }


  if (route === 'search' && method === 'GET') {
    await env.DB.prepare(CREATE_PAGES).run();
    const vAuth = await visitorAuthed();
    if (vAuth === 'banned') return respond({ error: 'account_banned' }, 403);
    if (!authed() && vAuth !== 'ok' && !(await sitePublic())) return respond({ error: 'unauthorized' }, 401);
    const { results } = await env.DB.prepare("SELECT title, slug, page_json FROM pages WHERE is_published = 1 AND slug != '__404__'").all();
    const SKIP = new Set(['id', 'type', 'url', 'href', 'img', 'photo', 'src', 'bg_img', 'bg_image', 'image', 'avatar', 'cover_image', 'data', 'anchor', 'access_key', 'target', 'buy_url', 'btn_url', 'btn2_url', 'button_url']);
    const collect = (o, out, d) => {
      if (d > 7 || o == null) return;
      if (typeof o === 'string') { if (o.length > 1 && !/^(https?:|\/|#|data:|mailto:|tel:)/i.test(o) && !/^#?[0-9a-f]{3,8}$/i.test(o)) out.push(o); return; }
      if (Array.isArray(o)) { for (const v of o) collect(v, out, d + 1); return; }
      if (typeof o === 'object') { for (const k in o) if (!SKIP.has(k)) collect(o[k], out, d + 1); }
    };
    const idx = [];
    for (const p of (results || [])) {
      let x = '';
      try { const st = JSON.parse((await decompressJson(p.page_json)) || '{}'); const out = []; collect(st.sections || [], out, 0); x = out.join(' '); } catch {}
      idx.push({ t: p.title || '', s: p.slug, x: x.slice(0, 3000) });
    }
    return respond(idx);
  }

  if (route === 'pages' && method === 'POST') {
    if (!authed()) return respond({ error: 'unauthorized' }, 401);
    await env.DB.prepare(CREATE_PAGES).run();
    const { title = 'Untitled', slug, page_json = '' } = await request.json().catch(() => ({}));
    if (!slug?.trim()) return respond({ error: 'slug required' }, 400);
    try {
      let pj = page_json;
      if (pj) { const mod = await moderatePage(pj); pj = mod.json; if (mod.log.length) await logModeration(env, slug.trim(), mod.log); }
      const compressed = pj ? await compressJson(pj) : '';
      const r = await env.DB.prepare(
        'INSERT INTO pages (title, slug, page_json) VALUES (?,?,?)'
      ).bind(title.trim(), slug.trim(), compressed).run();
      return respond({ id: r.meta?.last_row_id }, 201);
    } catch(e) {
      return respond({ error: 'slug already exists' }, 409);
    }
  }

  const pageSingle = route.match(/^pages\/(\d+)$/);

  if (pageSingle && method === 'PUT') {
    if (!authed()) return respond({ error: 'unauthorized' }, 401);
    await env.DB.prepare(CREATE_PAGES).run();
    const body = await request.json().catch(() => ({}));
    const id = parseInt(pageSingle[1]);
    const current = await env.DB.prepare('SELECT * FROM pages WHERE id=?').bind(id).first();
    if (!current) return respond({ error: 'not found' }, 404);
    let newSlug = current.slug;
    if (body.slug != null) {
      let s = String(body.slug).trim();
      if (s) { newSlug = s.startsWith('/') ? s : '/' + s; }
    }

    let newPageJson = current.page_json, modLog = [];
    if (body.page_json != null) {
      const mod = await moderatePage(body.page_json);
      newPageJson = await compressJson(mod.json); modLog = mod.log;
    }
    try {
      await env.DB.prepare(
        'UPDATE pages SET title=?, slug=?, page_json=?, is_published=? WHERE id=?'
      ).bind(
        body.title ?? current.title,
        newSlug,
        newPageJson,
        body.is_published != null ? (body.is_published ? 1 : 0) : current.is_published,
        id
      ).run();
    } catch (e) { return respond({ error: 'slug already exists' }, 409); }
    if (modLog.length) await logModeration(env, newSlug, modLog);
    return respond({ ok: true, moderated: modLog.length || undefined });
  }

  if (pageSingle && method === 'DELETE') {
    if (!authed()) return respond({ error: 'unauthorized' }, 401);
    await env.DB.prepare('DELETE FROM pages WHERE id=?').bind(parseInt(pageSingle[1])).run();
    return respond({ ok: true });
  }

  if (route === 'nav' && method === 'GET') {
    if (!(await canView())) return respond({ error: 'unauthorized' }, 401);
    await env.DB.prepare(CREATE_PAGES).run();
    const { results } = await env.DB.prepare(
      'SELECT id, title, slug, page_json, sort_order FROM pages WHERE is_published = 1 ORDER BY sort_order ASC, id ASC'
    ).all();

    const settingKeys = ['nav_title', 'nav_style', 'nav_align', 'nav_custom_links', 'nav_page_order', 'nav_position', 'search_enabled'];
    const settingsRows = await Promise.all(
      settingKeys.map(k => env.DB.prepare("SELECT value FROM site_settings WHERE key = ?").bind(k).first().catch(() => null))
    );
    const [nav_title, nav_style, nav_align, nav_custom_links_raw, nav_page_order_raw, nav_position, search_enabled] = settingsRows.map(r => r?.value || '');

    let navPageOrder = [];
    try { navPageOrder = JSON.parse(nav_page_order_raw || '[]'); } catch {}

    const pageMap = {};
    results.forEach(p => { pageMap[p.id] = p; });

    const orderedIds = [
      ...navPageOrder.filter(id => pageMap[id]),
      ...results.filter(p => !navPageOrder.includes(p.id)).map(p => p.id),
    ];

    const candidates = orderedIds.map(id => pageMap[id]).filter(p => p && p.slug !== '__404__');
    const pages = [];
    for (const p of candidates) {
      let show = true, parent = '';
      try { const st = JSON.parse((await decompressJson(p.page_json)) || '{}'); show = st.show_in_nav !== false; parent = st.parent || ''; } catch {}
      if (show) pages.push({ title: p.title, slug: p.slug, parent });
    }

    let custom_links = [];
    try { custom_links = JSON.parse(nav_custom_links_raw || '[]'); } catch {}

    return respond({
      pages,
      custom_links,
      nav_title,
      nav_style:    nav_style    || 'blurred',
      nav_align:    nav_align    || 'left',
      nav_position: nav_position || 'top',
      search_enabled: search_enabled !== '0',
    });
  }

  if (route === 'nav/pages' && method === 'GET') {

    if (!authed()) return respond({ error: 'unauthorized' }, 401);
    await env.DB.prepare(CREATE_PAGES).run();
    const { results } = await env.DB.prepare(
      'SELECT id, title, slug, page_json, sort_order FROM pages WHERE is_published = 1 AND slug != ? ORDER BY sort_order ASC, id ASC'
    ).bind('__404__').all();
    const orderRow = await env.DB.prepare("SELECT value FROM site_settings WHERE key = 'nav_page_order'").first().catch(() => null);
    let nav_page_order = [];
    try { nav_page_order = JSON.parse(orderRow?.value || '[]'); } catch {}
    const pages = [];
    for (const p of results) {
      let show = true, parent = '';
      try { const st = JSON.parse((await decompressJson(p.page_json)) || '{}'); show = st.show_in_nav !== false; parent = st.parent || ''; } catch {}
      pages.push({ id: p.id, title: p.title, slug: p.slug, show_in_nav: show, parent });
    }

    pages.sort((a, b) => {
      const ai = nav_page_order.indexOf(a.id);
      const bi = nav_page_order.indexOf(b.id);
      if (ai === -1 && bi === -1) return 0;
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
    return respond(pages);
  }

  if (route === 'nav/order' && method === 'PUT') {
    if (!authed()) return respond({ error: 'unauthorized' }, 401);
    const { order } = await request.json().catch(() => ({}));
    await env.DB.prepare(
      "INSERT INTO site_settings (key, value) VALUES ('nav_page_order', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
    ).bind(JSON.stringify(order || [])).run();
    return respond({ ok: true });
  }

  return null;
}
