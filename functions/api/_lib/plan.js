

import { sb } from './supabase.js';
const _planCache = new Map();
export async function sitePlan(env, host) {
  const k = host || '';
  const hit = _planCache.get(k);
  if (hit && Date.now() - hit.at < 60000) return hit.plan;
  let plan = 'free';
  try {
    const { base, headers } = sb(env);
    const r = await fetch(`${base}/rest/v1/foyer_sites?domain=eq.${encodeURIComponent(host)}&select=plan`, { headers, cf: { cacheTtl: 60, cacheEverything: true } });
    if (r.ok) { const rows = await r.json(); if (rows[0] && rows[0].plan) plan = rows[0].plan; }
  } catch (e) {}
  _planCache.set(k, { plan, at: Date.now() });
  return plan;
}

export async function isPro(env, host) { const p = await sitePlan(env, host); return p === 'pro' || p === 'ultra'; }
export async function isUltra(env, host) { return (await sitePlan(env, host)) === 'ultra'; }
