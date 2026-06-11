
export async function onRequest({ env, request }) {
  let ORIGIN = 'https://lanson.org';
  try { ORIGIN = (env.SITE_URL || new URL(request.url).origin).replace(/\/$/, ''); } catch {}
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const q = async (sql) => { try { return (await env.DB.prepare(sql).all()).results || []; } catch { return []; } };

  const pages = await q("SELECT slug, created_at FROM pages WHERE is_published = 1 AND slug != '__404__' ORDER BY sort_order ASC, id ASC");
  const tutorials = await q("SELECT slug, updated_at, created_at FROM tutorials ORDER BY id DESC");
  const reviews = await q("SELECT slug, updated_at, created_at FROM reviews ORDER BY id DESC");
  const colls = await q("SELECT id, slug FROM collections ORDER BY id ASC");
  const items = await q("SELECT collection_id, slug, updated_at FROM collection_items ORDER BY id DESC");
  const collSlug = {}; colls.forEach(c => { collSlug[c.id] = c.slug; });

  const u = (loc, lastmod, freq, prio) => `<url><loc>${esc(loc)}</loc>${lastmod ? `<lastmod>${String(lastmod).slice(0, 10)}</lastmod>` : ''}<changefreq>${freq}</changefreq><priority>${prio}</priority></url>`;
  const urls = [];
  const home = pages.find(p => p.slug === '/');
  urls.push(u(ORIGIN + '/', home && home.created_at, 'weekly', '1.0'));
  for (const p of pages) if (p.slug !== '/') urls.push(u(ORIGIN + (p.slug.startsWith('/') ? '' : '/') + p.slug, p.created_at, 'monthly', '0.8'));
  if (tutorials.length) { urls.push(u(ORIGIN + '/tutorials/all', '', 'weekly', '0.7')); for (const t of tutorials) urls.push(u(ORIGIN + '/tutorials/' + t.slug, t.updated_at || t.created_at, 'monthly', '0.7')); }
  if (reviews.length) { urls.push(u(ORIGIN + '/reviews/all', '', 'weekly', '0.7')); for (const r of reviews) urls.push(u(ORIGIN + '/review/' + r.slug, r.updated_at || r.created_at, 'monthly', '0.7')); }
  for (const c of colls) urls.push(u(ORIGIN + '/' + c.slug + '/all', '', 'weekly', '0.6'));
  for (const it of items) { const cs = collSlug[it.collection_id]; if (cs) urls.push(u(ORIGIN + '/' + cs + '/' + it.slug, it.updated_at, 'monthly', '0.6')); }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
