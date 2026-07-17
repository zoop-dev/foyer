const IMG_CACHE = "foyer-img-v1";
const TTL = 7 * 24 * 60 * 60 * 1e3;
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener(
  "activate",
  (e) => e.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.filter((n) => n.startsWith("foyer-img-") && n !== IMG_CACHE).map((n) => caches.delete(n))
      );
      await self.clients.claim();
    })()
  )
);
self.addEventListener("push", (e) => {
  let d = {};
  try {
    d = e.data ? e.data.json() : {};
  } catch (err) {
    d = { body: e.data ? e.data.text() : "" };
  }
  const title = d.title || "Foyer";
  e.waitUntil(
    self.registration.showNotification(title, {
      body: d.body || "",
      icon: d.icon || "/icons/favicon.svg",
      badge: d.badge || "/icons/favicon.svg",
      tag: d.tag,
      data: { url: d.url || "/" }
    })
  );
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const target = e.notification.data && e.notification.data.url || "/";
  e.waitUntil(
    (async () => {
      const wins = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const c of wins) {
        if (c.url.includes(target) && "focus" in c) return c.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
    })()
  );
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  let url;
  try {
    url = new URL(req.url);
  } catch (err) {
    return;
  }
  if (url.origin !== self.location.origin || !url.pathname.startsWith("/api/images/")) return;
  e.respondWith(
    (async () => {
      const cache = await caches.open(IMG_CACHE);
      const hit = await cache.match(req);
      if (hit) {
        const ts = +(hit.headers.get("x-foyer-ts") || 0);
        if (Date.now() - ts < TTL) return hit;
      }
      try {
        const res = await fetch(req);
        if (res && res.ok) {
          const headers = new Headers(res.headers);
          headers.set("x-foyer-ts", String(Date.now()));
          const stamped = new Response(await res.clone().blob(), {
            status: res.status,
            statusText: res.statusText,
            headers
          });
          await cache.put(req, stamped.clone());
          return stamped;
        }
        return res;
      } catch (err) {
        if (hit) return hit;
        throw err;
      }
    })()
  );
});
