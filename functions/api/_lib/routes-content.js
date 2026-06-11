
import { moderatePage, logModeration, getModConfig } from './moderation.js';
import { canonHost } from './site-config.js';
import { isPro } from './plan.js';
import { translatePageJson } from './i18n.js';

const CREATE_TRANSLATIONS = "CREATE TABLE IF NOT EXISTS page_translations (page_id INTEGER NOT NULL, lang TEXT NOT NULL, page_json TEXT, updated_at TEXT, PRIMARY KEY (page_id, lang))";
let _trReady = false;
async function _ensureTr(env) { if (_trReady) return; await env.DB.prepare(CREATE_TRANSLATIONS).run().catch(() => {}); _trReady = true; }
async function _siteLangs(env) {
  const r = await env.DB.prepare("SELECT value FROM site_settings WHERE key='site_languages'").first().catch(() => null);
  return (r?.value || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
}

let _pwColReady = false;
async function _ensurePwCol(env) { if (_pwColReady) return; await env.DB.prepare('ALTER TABLE pages ADD COLUMN pw_hash TEXT').run().catch(() => {}); _pwColReady = true; }
async function _sha(s) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join(''); }
async function _hashPagePw(pw) { const salt = crypto.randomUUID().slice(0, 8); return salt + '$' + (await _sha(salt + ':' + pw)); }
async function _verifyPagePw(pw, stored) { if (!pw || !stored || stored.indexOf('$') < 0) return false; const i = stored.indexOf('$'); return (await _sha(stored.slice(0, i) + ':' + pw)) === stored.slice(i + 1); }


const CREATE_PAGE_VERSIONS = "CREATE TABLE IF NOT EXISTS page_versions (id INTEGER PRIMARY KEY AUTOINCREMENT, page_id INTEGER NOT NULL, title TEXT, slug TEXT, page_json TEXT, created_at TEXT DEFAULT (datetime('now')))";
let _pvReady = false;
async function _ensurePV(env) { if (_pvReady) return; await env.DB.prepare(CREATE_PAGE_VERSIONS).run().catch(() => {}); _pvReady = true; }
async function _snapshotPage(env, page) {
  if (!page || !page.page_json) return;
  await _ensurePV(env);
  await env.DB.prepare('INSERT INTO page_versions (page_id, title, slug, page_json) VALUES (?,?,?,?)').bind(page.id, page.title || '', page.slug || '', page.page_json).run().catch(() => {});
  await env.DB.prepare('DELETE FROM page_versions WHERE page_id=? AND id NOT IN (SELECT id FROM page_versions WHERE page_id=? ORDER BY id DESC LIMIT 30)').bind(page.id, page.id).run().catch(() => {});
}

export async function handleContent(ctx) {
  const { route, method, request, env, headers, respond, compressJson, decompressJson, CREATE_SESSIONS, CREATE_BANNED_EMAILS, CREATE_PAGES, authed, visitorAuthed, _adminRole, sitePublic, canView } = ctx;

  if (route === 'whoami' && method === 'GET') {
    return respond({ raw_host: new URL(request.url).hostname, canon_host: canonHost(env, request), site_domain: env.FOYER_DOMAIN || null });
  }

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
    await _ensurePwCol(env);
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug');
    if (slug !== null) {
      const vAuth = await visitorAuthed();
      if (vAuth === 'banned') return respond({ error: 'account_banned' }, 403);
      if (!authed() && vAuth !== 'ok' && !(await sitePublic())) return respond({ error: 'unauthorized' }, 401);
      const page = await env.DB.prepare(
        'SELECT * FROM pages WHERE slug = ? AND is_published = 1'
      ).bind(slug).first();

      if (page && page.pw_hash && !authed()) {
        const pw = request.headers.get('X-Page-Password') || url.searchParams.get('pw') || '';
        if (!(await _verifyPagePw(pw, page.pw_hash))) {
          return respond({ id: page.id, title: page.title, slug: page.slug, locked: true, bad: pw ? true : undefined });
        }
      }
      if (page) {
        page.page_json = await decompressJson(page.page_json);
        delete page.pw_hash;


        const lang = (url.searchParams.get('lang') || '').toLowerCase();
        if (lang) {
          const langs = await _siteLangs(env);
          if (langs.length > 1 && lang !== langs[0] && langs.includes(lang)) {
            await _ensureTr(env);
            const tr = await env.DB.prepare('SELECT page_json FROM page_translations WHERE page_id=? AND lang=?').bind(page.id, lang).first().catch(() => null);
            if (tr && tr.page_json) page.page_json = tr.page_json;
          }
        }
      }
      return respond(page || null);
    }
    if (!authed()) return respond({ error: 'unauthorized' }, 401);
    const { results } = await env.DB.prepare(
      'SELECT id, title, slug, is_published, sort_order, created_at, page_json, pw_hash FROM pages ORDER BY sort_order ASC, id ASC'
    ).all();
    const pages = await Promise.all((results || []).map(async p => { const { pw_hash, ...rest } = p; return { ...rest, has_password: !!pw_hash, page_json: await decompressJson(p.page_json) }; }));
    return respond(pages);
  }


  if (route === 'search' && method === 'GET') {
    await env.DB.prepare(CREATE_PAGES).run();
    await _ensurePwCol(env);
    const vAuth = await visitorAuthed();
    if (vAuth === 'banned') return respond({ error: 'account_banned' }, 403);
    if (!authed() && vAuth !== 'ok' && !(await sitePublic())) return respond({ error: 'unauthorized' }, 401);

    const { results } = await env.DB.prepare("SELECT title, slug, page_json FROM pages WHERE is_published = 1 AND slug != '__404__' AND (pw_hash IS NULL OR pw_hash = '')").all();
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
    if (!(await isPro(env, canonHost(env, request)))) {
      const c = await env.DB.prepare("SELECT COUNT(*) AS c FROM pages WHERE slug != '__404__'").first();
      if ((c?.c || 0) >= 10) return respond({ error: 'Free plan is limited to 10 pages — upgrade to Pro for unlimited.' }, 403);
    }
    const { title = 'Untitled', slug, page_json = '' } = await request.json().catch(() => ({}));
    if (!slug?.trim()) return respond({ error: 'slug required' }, 400);
    try {
      let pj = page_json;
      if (pj) { const host = canonHost(env, request); const cfg = await getModConfig(env, host); if (cfg.enabled !== false) { const mod = await moderatePage(pj, cfg); pj = mod.json; if (mod.log.length) await logModeration(env, host, slug.trim(), mod.log); } }
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
    await _ensurePwCol(env);
    const body = await request.json().catch(() => ({}));
    const id = parseInt(pageSingle[1]);
    const current = await env.DB.prepare('SELECT * FROM pages WHERE id=?').bind(id).first();
    if (!current) return respond({ error: 'not found' }, 404);
    let newSlug = current.slug;
    if (body.slug != null) {
      let s = String(body.slug).trim();
      if (s) { newSlug = s.startsWith('/') ? s : '/' + s; }
    }

    let newPwHash = current.pw_hash;
    if (body.password !== undefined) {
      const pw = String(body.password || '');
      if (pw) {
        if (!(await isPro(env, canonHost(env, request)))) return respond({ error: 'Password-protected pages are a Pro feature.' }, 403);
        newPwHash = await _hashPagePw(pw);
      } else newPwHash = null;
    }

    let newPageJson = current.page_json, modLog = [];
    if (body.page_json != null) {
      let pjStr = body.page_json;
      const cfg = await getModConfig(env, canonHost(env, request));
      if (cfg.enabled !== false) { const mod = await moderatePage(body.page_json, cfg); pjStr = mod.json; modLog = mod.log; }
      newPageJson = await compressJson(pjStr);

      if (newPageJson !== current.page_json) await _snapshotPage(env, current);
    }
    try {
      await env.DB.prepare(
        'UPDATE pages SET title=?, slug=?, page_json=?, is_published=?, pw_hash=? WHERE id=?'
      ).bind(
        body.title ?? current.title,
        newSlug,
        newPageJson,
        body.is_published != null ? (body.is_published ? 1 : 0) : current.is_published,
        newPwHash,
        id
      ).run();
    } catch (e) { return respond({ error: 'slug already exists' }, 409); }
    if (modLog.length) await logModeration(env, canonHost(env, request), newSlug, modLog);
    return respond({ ok: true, moderated: modLog.length || undefined });
  }

  if (pageSingle && method === 'DELETE') {
    if (!authed()) return respond({ error: 'unauthorized' }, 401);
    await env.DB.prepare('DELETE FROM pages WHERE id=?').bind(parseInt(pageSingle[1])).run();
    await env.DB.prepare('DELETE FROM page_versions WHERE page_id=?').bind(parseInt(pageSingle[1])).run().catch(() => {});
    return respond({ ok: true });
  }




  const verList = route.match(/^pages\/(\d+)\/versions$/);
  const verOne = route.match(/^pages\/(\d+)\/versions\/(\d+)$/);
  const verRestore = route.match(/^pages\/(\d+)\/versions\/(\d+)\/restore$/);

  if (verList && method === 'GET') {
    if (!authed()) return respond({ error: 'unauthorized' }, 401);
    if (!(await isPro(env, canonHost(env, request)))) return respond({ error: 'Version history is a Pro feature.', pro: true }, 403);
    await _ensurePV(env);
    const { results } = await env.DB.prepare('SELECT id, title, slug, created_at, length(page_json) AS size FROM page_versions WHERE page_id=? ORDER BY id DESC').bind(parseInt(verList[1])).all().catch(() => ({ results: [] }));
    return respond(results || []);
  }

  if (verOne && method === 'GET') {
    if (!authed()) return respond({ error: 'unauthorized' }, 401);
    if (!(await isPro(env, canonHost(env, request)))) return respond({ error: 'Version history is a Pro feature.', pro: true }, 403);
    await _ensurePV(env);
    const v = await env.DB.prepare('SELECT * FROM page_versions WHERE id=? AND page_id=?').bind(parseInt(verOne[2]), parseInt(verOne[1])).first();
    if (!v) return respond({ error: 'not found' }, 404);
    v.page_json = await decompressJson(v.page_json);
    return respond(v);
  }

  if (verRestore && method === 'POST') {
    if (!authed()) return respond({ error: 'unauthorized' }, 401);
    if (!(await isPro(env, canonHost(env, request)))) return respond({ error: 'Version history is a Pro feature.', pro: true }, 403);
    await _ensurePV(env);
    const pid = parseInt(verRestore[1]);
    const v = await env.DB.prepare('SELECT * FROM page_versions WHERE id=? AND page_id=?').bind(parseInt(verRestore[2]), pid).first();
    if (!v) return respond({ error: 'not found' }, 404);
    const current = await env.DB.prepare('SELECT * FROM pages WHERE id=?').bind(pid).first();
    if (!current) return respond({ error: 'not found' }, 404);

    if (current.page_json !== v.page_json) await _snapshotPage(env, current);
    await env.DB.prepare('UPDATE pages SET title=?, page_json=? WHERE id=?').bind(v.title || current.title, v.page_json, pid).run();
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




  if (route === 'translate' && method === 'GET') {
    if (!authed()) return respond({ error: 'unauthorized' }, 401);
    const langs = await _siteLangs(env);
    if (langs.length < 2) return respond({ enabled: false, langs });
    await _ensureTr(env);
    await env.DB.prepare(CREATE_PAGES).run();
    const pages = (await env.DB.prepare("SELECT id, title, slug FROM pages WHERE is_published=1 AND slug!='__404__' ORDER BY sort_order ASC, id ASC").all().catch(() => ({ results: [] }))).results || [];
    const done = (await env.DB.prepare('SELECT page_id, lang FROM page_translations').all().catch(() => ({ results: [] }))).results || [];
    return respond({ enabled: true, base: langs[0], langs, pages, variants: done.length });
  }

  if (route === 'translate' && method === 'POST') {
    if (!authed()) return respond({ error: 'unauthorized' }, 401);
    if (!env.AI) return respond({ error: 'Translation isn’t available (no AI binding).' }, 503);
    if (!(await isPro(env, canonHost(env, request)))) return respond({ error: 'Multi-language is a Pro feature.' }, 403);
    const langs = await _siteLangs(env);
    if (langs.length < 2) return respond({ error: 'Add at least two languages in Settings first.' }, 400);
    const base = langs[0];
    const body = await request.json().catch(() => ({}));
    const lang = String(body.lang || '').toLowerCase();
    const pageId = parseInt(body.page_id);
    if (!lang || lang === base || !langs.includes(lang)) return respond({ error: 'bad language' }, 400);
    if (!pageId) return respond({ error: 'page_id required' }, 400);
    await _ensureTr(env);
    const p = await env.DB.prepare('SELECT id, page_json FROM pages WHERE id=?').bind(pageId).first();
    if (!p) return respond({ error: 'not found' }, 404);
    const src = await decompressJson(p.page_json);
    let translated;
    try { translated = await translatePageJson(env, src, base, lang); }
    catch { return respond({ error: 'translation failed — try again' }, 502); }
    await env.DB.prepare("INSERT INTO page_translations (page_id, lang, page_json, updated_at) VALUES (?,?,?,datetime('now')) ON CONFLICT(page_id,lang) DO UPDATE SET page_json=excluded.page_json, updated_at=datetime('now')").bind(pageId, lang, translated).run();
    return respond({ ok: true, page_id: pageId, lang });
  }

  return null;
}
