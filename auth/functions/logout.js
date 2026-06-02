
import { clearCookie, readCookie, SB_URL, sbH } from './_lib.js';

export async function onRequestGet({ request, env }) {
  const token = readCookie(request);
  if (token) await fetch(`${SB_URL(env)}/rest/v1/foyer_auth_sessions?token=eq.${encodeURIComponent(token)}`, { method: 'DELETE', headers: { ...sbH(env), Prefer: 'return=minimal' } }).catch(() => {});
  const to = new URL(request.url).searchParams.get('redirect') || '/';
  return new Response(null, { status: 302, headers: { location: to, 'set-cookie': clearCookie() } });
}
