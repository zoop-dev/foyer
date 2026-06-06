import { buildCtx } from './_lib/core.js';
import { handleCore } from './_lib/routes-core.js';
import { handleAuth } from './_lib/routes-auth.js';
import { handleContent } from './_lib/routes-content.js';
import { handlePeople } from './_lib/routes-people.js';
import { handleMedia } from './_lib/routes-media.js';
import { handleCollections } from './_lib/routes-collections.js';
import { handleBackup } from './_lib/routes-backup.js';

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

  for (const handler of [handleCore, handleAuth, handleContent, handlePeople, handleMedia, handleCollections, handleBackup]) {
    const res = await handler(ctx);
    if (res) return res;
  }

  return ctx.respond({ error: 'not found' }, 404);
}
