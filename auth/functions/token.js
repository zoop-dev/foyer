

import { consumeCode, pkceMatches, SB_URL, sbH } from './_lib.js';

const cors = { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'POST, OPTIONS', 'access-control-allow-headers': 'content-type' };
export function onRequestOptions() { return new Response(null, { headers: cors }); }

export async function onRequestPost({ request, env }) {
  const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json', ...cors } });
  const body = await request.json().catch(() => ({}));
  const { code, code_verifier, client_id, redirect_uri } = body;
  if (!code) return json({ error: 'missing_code' }, 400);
  const row = await consumeCode(env, code);                         // single-use + expiry checked
  if (!row) return json({ error: 'invalid_code' }, 400);
  if (client_id && row.client_id !== client_id) return json({ error: 'client_mismatch' }, 400);
  if (redirect_uri && row.redirect_uri !== redirect_uri) return json({ error: 'redirect_mismatch' }, 400);
  if (!(await pkceMatches(code_verifier, row.code_challenge))) return json({ error: 'pkce_failed' }, 400);
  const u = await fetch(`${SB_URL(env)}/rest/v1/foyer_users?id=eq.${row.user_id}&select=id,email,name,avatar`, { headers: sbH(env) });
  const user = u.ok ? (await u.json())[0] : null;
  if (!user) return json({ error: 'user_not_found' }, 400);
  return json({ sub: user.id, email: user.email, name: user.name || '', avatar: user.avatar || '' });
}
