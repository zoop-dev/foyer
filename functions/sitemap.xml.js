export async function onRequest({ env, request }) {


  let ORIGIN = 'https://lanson.org';
  try { ORIGIN = (env.SITE_URL || new URL(request.url).origin).replace(/\/$/, ''); } catch {}

  let pages = [];
  try {
    const { results } = await env.DB.prepare(
      "SELECT slug, created_at FROM pages WHERE is_published = 1 AND slug != '__404__' ORDER BY sort_order ASC, id ASC"
    ).all();
    pages = results || [];
  } catch (e) {}

  const homePage = pages.find(p => p.slug === '/');
  const otherPages = pages.filter(p => p.slug !== '/');
  const homeLastmod = homePage?.created_at ? homePage.created_at.slice(0, 10) : '';

  const urls = [
    `<url><loc>${ORIGIN}/</loc>${homeLastmod ? `<lastmod>${homeLastmod}</lastmod>` : ''}<changefreq>weekly</changefreq><priority>1.0</priority></url>`,
    ...otherPages.map(p => {
      const loc = `${ORIGIN}${p.slug.startsWith('/') ? '' : '/'}${p.slug}`;
      const lastmod = p.created_at ? p.created_at.slice(0, 10) : '';
      return `<url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}<changefreq>monthly</changefreq><priority>0.8</priority></url>`;
    }),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
