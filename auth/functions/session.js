import { sessionUser, isLicensedClient } from "./_lib.js";
async function withCors(env, request, res) {
  const origin = request.headers.get("Origin") || "";
  const h = new Headers(res.headers);
  let allow = "";
  try {
    const host = new URL(origin).hostname;
    if (await isLicensedClient(env, host)) allow = origin;
  } catch {
  }
  if (allow) {
    h.set("access-control-allow-origin", allow);
    h.set("access-control-allow-credentials", "true");
    h.set("vary", "Origin");
  }
  h.set("access-control-allow-methods", "GET, OPTIONS");
  h.set("access-control-allow-headers", "content-type");
  return new Response(res.body, { status: res.status, headers: h });
}
export async function onRequestOptions({ request, env }) {
  return withCors(env, request, new Response(null, { status: 204 }));
}
export async function onRequestGet({ request, env }) {
  const user = await sessionUser(env, request);
  const body = user ? { user: { name: user.name, email: user.email, avatar: user.avatar } } : { user: null };
  return withCors(
    env,
    request,
    new Response(JSON.stringify(body), { headers: { "content-type": "application/json" } })
  );
}
