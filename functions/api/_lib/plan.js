

const SB_URL = 'https://tvtfoghrdqwssdwvebuo.supabase.co';
const SB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2dGZvZ2hyZHF3c3Nkd3ZlYnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMzk2ODksImV4cCI6MjA5NTgxNTY4OX0.n_CRdzQQKYNGDHYmoVxyKafFJCfezKKlSiZddx8MXH4';
const _planCache = new Map();
export async function sitePlan(env, host) {
  const k = host || '';
  const hit = _planCache.get(k);
  if (hit && Date.now() - hit.at < 60000) return hit.plan;
  let plan = 'free';
  try {
    const base = (env.SUPABASE_URL || SB_URL).replace(/\/$/, '');
    const key = env.SUPABASE_ANON_KEY || SB_ANON;
    const r = await fetch(`${base}/rest/v1/foyer_sites?domain=eq.${encodeURIComponent(host)}&select=plan`, { headers: { apikey: key, Authorization: `Bearer ${key}` }, cf: { cacheTtl: 60, cacheEverything: true } });
    if (r.ok) { const rows = await r.json(); if (rows[0] && rows[0].plan) plan = rows[0].plan; }
  } catch (e) {}
  _planCache.set(k, { plan, at: Date.now() });
  return plan;
}
export async function isPro(env, host) { return (await sitePlan(env, host)) === 'pro'; }
