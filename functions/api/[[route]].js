import { buildCtx } from './_lib/core.js';
import { handleCore } from './_lib/routes-core.js';
import { handleAuth } from './_lib/routes-auth.js';
import { handleContent } from './_lib/routes-content.js';
import { handlePeople } from './_lib/routes-people.js';
import { handleMedia } from './_lib/routes-media.js';
import { handleCollections } from './_lib/routes-collections.js';
import { handleBackup } from './_lib/routes-backup.js';
import { handleTerms, termsAccepted, TERMS_VERSION } from './_lib/routes-terms.js';

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

  for (const handler of [handleCore, handleAuth, handleContent, handlePeople, handleMedia, handleCollections, handleBackup, handleTerms]) {
    const res = await handler(ctx);
    if (res) return res;
  }

  return ctx.respond({ error: 'not found' }, 404);
}
