











import { canonHost } from './site-config.js';

const CACHEABLE = /^(config|settings|search|nav|pages|tutorials|reviews|collections)(\/|$)/;

function isAnon(request) {
  if (request.headers.get('Authorization')) return false;
  if (request.headers.get('X-Session-Token')) return false;
  if (request.headers.get('X-Page-Password')) return false;
  try {
    const u = new URL(request.url);
    if (u.searchParams.get('pw') || u.searchParams.get('session')) return false;
  } catch { return false; }
  return true;
}

function keyFor(host, request, epoch) {
  const u = new URL(request.url);


  const k = new URL('https://' + host + u.pathname);
  k.search = u.search;
  k.searchParams.set('__e', epoch);
  return new Request(k.toString());
}


function browserCopy(r) {
  const h = new Headers(r.headers);
  h.set('Cache-Control', 'no-store');
  return new Response(r.body, { status: r.status, statusText: r.statusText, headers: h });
}

export async function cacheLookup(ctx) {
  const { env, request, method } = ctx;
  if (method !== 'GET' || !env.FOYER_KV || !CACHEABLE.test(ctx.route) || !isAnon(request)) return null;
  const host = canonHost(env, request);
  let epoch;



  try { epoch = (await env.FOYER_KV.get('epoch:' + host, { cacheTtl: 60 })) || '0'; } catch { return null; }
  ctx._cacheKey = keyFor(host, request, epoch);
  try {
    const hit = await caches.default.match(ctx._cacheKey);
    return hit ? browserCopy(hit) : null;
  } catch { return null; }
}


export function cacheSave(ctx, res) {
  if (!ctx._cacheKey) return res;
  if (res.status !== 200) return res;
  try {
    const cc = res.clone();
    const toCache = new Response(cc.body, cc);
    toCache.headers.set('Cache-Control', 'max-age=3600');
    const p = caches.default.put(ctx._cacheKey, toCache);
    if (ctx.waitUntil) ctx.waitUntil(p); else p.catch(() => {});
  } catch {}
  return browserCopy(res);
}

export function bumpEpoch(ctx) {
  const { env } = ctx;
  if (!env.FOYER_KV) return;
  try {
    const host = canonHost(env, ctx.request);
    const p = env.FOYER_KV.put('epoch:' + host, String(Date.now()));
    if (ctx.waitUntil) ctx.waitUntil(p); else p.catch(() => {});
  } catch {}
}
