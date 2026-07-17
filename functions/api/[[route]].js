import { buildCtx } from "./_lib/core.js";
import { handleCore } from "./_lib/routes-core.js";
import { handleAuth } from "./_lib/routes-auth.js";
import { handleContent } from "./_lib/routes-content.js";
import { handlePeople } from "./_lib/routes-people.js";
import { handleMedia } from "./_lib/routes-media.js";
import { handleCollections } from "./_lib/routes-collections.js";
import { handleBackup } from "./_lib/routes-backup.js";
import { handleTerms, termsAccepted, TERMS_VERSION } from "./_lib/routes-terms.js";
import { handlePush } from "./_lib/routes-push.js";
import { handleComments } from "./_lib/routes-comments.js";
import { handleInbox } from "./_lib/routes-inbox.js";
import { handleGuestbook } from "./_lib/routes-guestbook.js";
import { cacheLookup, cacheSave, bumpEpoch } from "./_lib/edge-cache.js";
const HANDLERS = [
  { name: "core", handler: handleCore },
  { name: "auth", handler: handleAuth },
  { name: "content", handler: handleContent },
  { name: "people", handler: handlePeople },
  { name: "media", handler: handleMedia },
  { name: "collections", handler: handleCollections },
  { name: "backup", handler: handleBackup },
  { name: "terms", handler: handleTerms },
  { name: "push", handler: handlePush },
  { name: "comments", handler: handleComments },
  { name: "inbox", handler: handleInbox },
  { name: "guestbook", handler: handleGuestbook }
];
const WRITE_METHODS = /* @__PURE__ */ new Set(["POST", "PUT", "DELETE"]);
const PERM_RULES = [
  {
    need: "pages",
    test: (route, write) => write && (/^pages(\/|$)/.test(route) || /^saved-blocks(\/|$)/.test(route) || route === "nav/order")
  },
  { need: "pages", test: (route) => route === "export" },
  {
    need: "content",
    test: (route, write) => write && /^(tutorials|reviews|collections)(\/|$)/.test(route)
  },
  { need: "media", test: (route, write) => write && /^(images|files)(\/|$)/.test(route) },
  { need: "analytics", test: (route, _write, method) => route === "analytics" && method === "GET" },
  {
    need: "inbox",
    test: (route, _write, method) => /^inbox(\/|$)/.test(route) && method !== "POST"
  },
  {
    need: "comments",
    test: (route, _write, method) => route === "comments/admin" || /^comments\/\d+$/.test(route) && method === "DELETE"
  },
  { need: "settings", test: (route, _write, method) => route === "settings" && method === "PUT" },
  { need: "team", test: (route, write) => write && /^(roles|visitors)(\/|$)/.test(route) }
];
function requiredPerm(route, method) {
  const write = WRITE_METHODS.has(method);
  const rule = PERM_RULES.find((r) => r.test(route, write, method));
  return rule ? rule.need : null;
}
export async function onRequest(context) {
  const { request, env, params } = context;
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Session-Token"
      }
    });
  }
  const ctx = await buildCtx({
    request,
    env,
    params,
    waitUntil: context.waitUntil?.bind(context)
  });
  const _r = ctx.route, _m = ctx.method;
  const _exempt = _r === "terms/accept" || _r === "terms/status" || _r === "admin-check" || _r.startsWith("auth") || _r.startsWith("sb/") || _r.includes("logout");
  if (ctx._adminRole && (_m === "POST" || _m === "PUT" || _m === "DELETE") && !_exempt) {
    if (!await termsAccepted(ctx))
      return ctx.respond({ error: "terms_required", version: TERMS_VERSION }, 403);
  }
  const _need = requiredPerm(_r, _m);
  if (_need && ctx._adminRole && !ctx.can(_need))
    return ctx.respond({ error: "Your role doesn’t allow that.", need: _need }, 403);
  const cached = await cacheLookup(ctx);
  if (cached) return cached;
  for (const { handler } of HANDLERS) {
    const res = await handler(ctx);
    if (res) {
      if (ctx._adminRole && (_m === "POST" || _m === "PUT" || _m === "DELETE") && res.status >= 200 && res.status < 300) {
        bumpEpoch(ctx);
      }
      return cacheSave(ctx, res);
    }
  }
  return ctx.respond({ error: "not found" }, 404);
}
