




const IMG_CACHE = 'foyer-img-v1';
const TTL = 7 * 24 * 60 * 60 * 1000;   // 7 days — re-crops bust the entry explicitly from the admin

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) => e.waitUntil((async () => {
  const names = await caches.keys();
  await Promise.all(names.filter((n) => n.startsWith('foyer-img-') && n !== IMG_CACHE).map((n) => caches.delete(n)));
  await self.clients.claim();
})()));

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  let url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.origin !== self.location.origin || !url.pathname.startsWith('/api/images/')) return;   // not an image → browser handles it
  e.respondWith((async () => {
    const cache = await caches.open(IMG_CACHE);
    const hit = await cache.match(req);
    if (hit) {
      const ts = +(hit.headers.get('x-foyer-ts') || 0);
      if (Date.now() - ts < TTL) return hit;   // fresh enough → no network ping at all
    }
    try {
      const res = await fetch(req);
      if (res && res.ok) {

        const headers = new Headers(res.headers);
        headers.set('x-foyer-ts', String(Date.now()));
        const stamped = new Response(await res.clone().blob(), { status: res.status, statusText: res.statusText, headers });
        await cache.put(req, stamped.clone());
        return stamped;
      }
      return res;
    } catch (err) {
      if (hit) return hit;   // offline → serve the stale copy
      throw err;
    }
  })());
});
