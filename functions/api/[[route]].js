import { buildCtx } from './_lib/core.js';
import { handleCore } from './_lib/routes-core.js';
import { handleAuth } from './_lib/routes-auth.js';
import { handleContent } from './_lib/routes-content.js';
import { handlePeople } from './_lib/routes-people.js';
import { handleMedia } from './_lib/routes-media.js';
import { handleCollections } from './_lib/routes-collections.js';
import { handleBackup } from './_lib/routes-backup.js';
import { handleTerms, termsAccepted, TERMS_VERSION } from './_lib/routes-terms.js';
import { handlePush } from './_lib/routes-push.js';
import { handleComments } from './_lib/routes-comments.js';
import { handleInbox } from './_lib/routes-inbox.js';
import { handleGuestbook } from './_lib/routes-guestbook.js';
import { cacheLookup, cacheSave, bumpEpoch } from './_lib/edge-cache.js';



function requiredPerm(route, method) {
  const write = method === 'POST' || method === 'PUT' || method === 'DELETE';
  if ((/^pages(\/|$)/.test(route) || /^saved-blocks(\/|$)/.test(route) || route === 'nav/order') && write) return 'pages';
  if (route === 'export') return 'pages';
  if (/^(tutorials|reviews|collections)(\/|$)/.test(route) && write) return 'content';
  if (/^(images|files)(\/|$)/.test(route) && write) return 'media';
  if (route === 'analytics' && method === 'GET') return 'analytics';
  if (/^inbox(\/|$)/.test(route) && method !== 'POST') return 'inbox';   // POST = public submit
  if (route === 'comments/admin' || (/^comments\/\d+$/.test(route) && method === 'DELETE')) return 'comments';
  if (route === 'settings' && method === 'PUT') return 'settings';
  if (/^(roles|visitors)(\/|$)/.test(route) && write) return 'team';
  return null;
}

export async function onRequest(context) {
  const { request, env, params } = context;
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Session-Token',
      },
    });
  }

  const ctx = await buildCtx({ request, env, params, waitUntil: context.waitUntil?.bind(context) });



  const _r = ctx.route, _m = ctx.method;
  const _exempt = _r === 'terms/accept' || _r === 'terms/status' || _r === 'admin-check'
    || _r.startsWith('auth') || _r.startsWith('sb/') || _r.includes('logout');
  if (ctx._adminRole && (_m === 'POST' || _m === 'PUT' || _m === 'DELETE') && !_exempt) {
    if (!(await termsAccepted(ctx))) return ctx.respond({ error: 'terms_required', version: TERMS_VERSION }, 403);
  }




  const _need = requiredPerm(_r, _m);
  if (_need && ctx._adminRole && !ctx.can(_need)) return ctx.respond({ error: 'Your role doesn’t allow that.', need: _need }, 403);


  const cached = await cacheLookup(ctx);
  if (cached) return cached;

  for (const handler of [handleCore, handleAuth, handleContent, handlePeople, handleMedia, handleCollections, handleBackup, handleTerms, handlePush, handleComments, handleInbox, handleGuestbook]) {
    const res = await handler(ctx);
    if (res) {

      if (ctx._adminRole && (_m === 'POST' || _m === 'PUT' || _m === 'DELETE') && res.status >= 200 && res.status < 300) {
        bumpEpoch(ctx);
      }
      return cacheSave(ctx, res);   // caches anon 200s; pass-through otherwise
    }
  }

  return ctx.respond({ error: 'not found' }, 404);
}
