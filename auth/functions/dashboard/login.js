import { opsCookie, opsIpAllowed, ctEq } from "../_lib.js";
const json = (o, s = 200, h = {}) =>
  new Response(JSON.stringify(o), {
    status: s,
    headers: { "content-type": "application/json", ...h },
  });
export async function onRequestPost({ request: request, env: env }) {
  if (!opsIpAllowed(env, request)) return json({ error: "not_found" }, 404);
  const { password: password } = await request.json().catch(() => ({}));
  if (!env.FOYER_OPS_PASSWORD || !password || !ctEq(password, env.FOYER_OPS_PASSWORD))
    return json({ error: "wrong password" }, 401);
  return json({ ok: true }, 200, { "set-cookie": await opsCookie(env) });
}
