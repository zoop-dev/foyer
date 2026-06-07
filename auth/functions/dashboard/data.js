import { opsValid, opsIpAllowed, SB_URL, sbH } from '../_lib.js';
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
export async function onRequestGet({ request, env }) {
  if (!opsIpAllowed(env, request)) return json({ error: 'not_found' }, 404);
  if (!(await opsValid(env, request))) return json({ error: 'unauthorized' }, 401);
  const base = SB_URL(env), H = sbH(env);
  const get = (q) => fetch(`${base}/rest/v1/${q}`, { headers: H }).then(r => r.ok ? r.json() : []).catch(() => []);
  const [sites, heartbeats, announcements, flags, errors, moderation, meta] = await Promise.all([
    get('foyer_sites?select=domain,name,licensed,offline,offline_message,ai_enabled,hide_branding,moderation_config&order=domain'),
    get('foyer_heartbeats?select=domain,live_version,last_seen'),
    get('foyer_announcements?order=created_at.desc&select=id,scope,message,level,active,hide_after,ends_at,created_at'),
    get('foyer_flags?order=scope&select=scope,key,value'),
    get('foyer_errors?order=created_at.desc&limit=80&select=domain,message,url,created_at'),
    get('foyer_moderation?order=created_at.desc&limit=100&select=domain,slug,url,reason,block_type,created_at'),
    get('foyer_meta?key=in.(latest_version,moderation_config)&select=key,value'),
  ]);
  const metaMap = {}; (meta || []).forEach((m) => { metaMap[m.key] = m.value; });
  let moderation_config = { enabled: true, dead: true, http: true, inappropriate: true, blocklist: [], keywords: [] };
  try { if (metaMap.moderation_config) moderation_config = { ...moderation_config, ...JSON.parse(metaMap.moderation_config) }; } catch (e) {}
  return json({ sites, heartbeats, announcements, flags, errors, moderation, moderation_config, latest_version: metaMap.latest_version || '' });
}
