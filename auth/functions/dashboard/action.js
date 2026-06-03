import { opsValid, opsIpAllowed, SB_URL, sbH } from '../_lib.js';
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json' } });
const enc = encodeURIComponent;
export async function onRequestPost({ request, env }) {
  if (!opsIpAllowed(env, request)) return json({ error: 'not_found' }, 404);
  if (!(await opsValid(env, request))) return json({ error: 'unauthorized' }, 401);
  const a = await request.json().catch(() => ({}));
  const base = SB_URL(env), H = sbH(env);
  const patch = (q, body) => fetch(`${base}/rest/v1/${q}`, { method: 'PATCH', headers: { ...H, Prefer: 'return=minimal' }, body: JSON.stringify(body) });
  const post = (t, body, prefer = 'return=minimal') => fetch(`${base}/rest/v1/${t}`, { method: 'POST', headers: { ...H, Prefer: prefer }, body: JSON.stringify(body) });
  const del = (q) => fetch(`${base}/rest/v1/${q}`, { method: 'DELETE', headers: { ...H, Prefer: 'return=minimal' } });
  let r;
  switch (a.type) {
    case 'offline': r = await patch(`foyer_sites?domain=eq.${enc(a.domain)}`, { offline: !!a.value, ...(a.value && a.reason ? { offline_message: a.reason } : {}) }); break;
    case 'license': r = await patch(`foyer_sites?domain=eq.${enc(a.domain)}`, { licensed: !!a.value, ...(!a.value && a.reason ? { offline_message: a.reason } : {}) }); break;
    case 'announce':
      if (!a.message || !a.scope) return json({ error: 'message and scope required' }, 400);
      r = await post('foyer_announcements', { scope: a.scope, message: a.message, level: a.level || 'info', active: true, hide_after: a.hide_after || 0, ...(a.ends_at ? { ends_at: a.ends_at } : {}) }); break;
    case 'announce_clear': r = await patch(`foyer_announcements?scope=eq.${enc(a.scope)}`, { active: false }); break;
    case 'announce_remove': r = await del(`foyer_announcements?scope=eq.${enc(a.scope)}`); break;
    case 'announce_edit': {
      if (!a.id) return json({ error: 'id required' }, 400);
      const upd = {};
      if (typeof a.message === 'string') upd.message = a.message;
      if (typeof a.level === 'string') upd.level = a.level;
      if (typeof a.active === 'boolean') upd.active = a.active;
      if (a.hide_after != null) upd.hide_after = a.hide_after | 0;
      if (a.scope) upd.scope = a.scope;
      if (!Object.keys(upd).length) return json({ error: 'nothing to update' }, 400);
      r = await patch(`foyer_announcements?id=eq.${enc(a.id)}`, upd); break;
    }
    case 'announce_delete': if (!a.id) return json({ error: 'id required' }, 400); r = await del(`foyer_announcements?id=eq.${enc(a.id)}`); break;
    case 'flag':
      if (!a.key || !a.scope) return json({ error: 'scope and key required' }, 400);
      r = await post('foyer_flags?on_conflict=scope,key', { scope: a.scope, key: a.key, value: a.value || 'on' }, 'resolution=merge-duplicates,return=minimal'); break;
    case 'flag_remove': r = await del(`foyer_flags?scope=eq.${enc(a.scope)}&key=eq.${enc(a.key)}`); break;
    case 'set_version': r = await post('foyer_meta?on_conflict=key', { key: 'latest_version', value: String(a.value) }, 'resolution=merge-duplicates,return=minimal'); break;
    default: return json({ error: 'unknown action' }, 400);
  }
  return json({ ok: !!(r && r.ok) }, r && r.ok ? 200 : 500);
}
