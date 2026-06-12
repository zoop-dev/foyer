

import { sendWebPush } from './webpush.js';
import { canonHost } from './site-config.js';
import { isPro } from './plan.js';

const CREATE_PUSH = "CREATE TABLE IF NOT EXISTS push_subs (endpoint TEXT PRIMARY KEY, p256dh TEXT NOT NULL, auth TEXT NOT NULL, kind TEXT NOT NULL DEFAULT 'visitor', created_at TEXT NOT NULL DEFAULT (datetime('now')))";
let _pushReady = false;
async function ensurePush(env) { if (_pushReady) return; await env.DB.prepare(CREATE_PUSH).run().catch(() => {}); _pushReady = true; }

function vapidOpts(env) {
  return { vapidPublic: env.VAPID_PUBLIC, vapidPrivate: env.VAPID_PRIVATE, subject: 'mailto:zoop@foyer.zo0p.dev' };
}

async function sendToKind(env, kind, payload) {
  await ensurePush(env);
  const { results } = await env.DB.prepare('SELECT endpoint, p256dh, auth FROM push_subs WHERE kind = ?').bind(kind).all().catch(() => ({ results: [] }));
  const body = JSON.stringify(payload);
  const opts = vapidOpts(env);
  let sent = 0, gone = [];
  for (const s of (results || [])) {
    const sub = { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } };
    let r; try { r = await sendWebPush(sub, body, opts); } catch { r = { ok: false }; }
    if (r.ok) sent++;
    else if (r.gone) gone.push(s.endpoint);
  }
  if (gone.length) {
    const ph = gone.map(() => '?').join(',');
    await env.DB.prepare(`DELETE FROM push_subs WHERE endpoint IN (${ph})`).bind(...gone).run().catch(() => {});
  }
  return { sent, removed: gone.length, total: (results || []).length };
}

export async function notifyOwner(env, payload) {
  if (!env.VAPID_PRIVATE) return;
  try { await sendToKind(env, 'owner', payload); } catch {}
}

export async function handlePush(ctx) {
  const { route, method, request, env, respond, authed } = ctx;
  if (!route.startsWith('push/')) return null;

  const configured = !!(env.VAPID_PUBLIC && env.VAPID_PRIVATE) && await isPro(env, canonHost(env, request));

  if (route === 'push/config' && method === 'GET') {
    return respond({ vapid_public: configured ? (env.VAPID_PUBLIC || '') : '', enabled: configured });
  }

  if (route === 'push/subscribe' && method === 'POST') {
    if (!configured) return respond({ error: 'Notifications are a Pro feature.' }, 403);
    const b = await request.json().catch(() => ({}));
    const sub = b.subscription || {};
    const kind = b.kind === 'owner' ? 'owner' : 'visitor';
    if (kind === 'owner' && !authed()) return respond({ error: 'unauthorized' }, 401);
    if (!sub.endpoint || !sub.keys || !sub.keys.p256dh || !sub.keys.auth) return respond({ error: 'bad subscription' }, 400);
    await ensurePush(env);
    await env.DB.prepare("INSERT INTO push_subs (endpoint, p256dh, auth, kind) VALUES (?,?,?,?) ON CONFLICT(endpoint) DO UPDATE SET p256dh=excluded.p256dh, auth=excluded.auth, kind=excluded.kind").bind(sub.endpoint, sub.keys.p256dh, sub.keys.auth, kind).run();
    return respond({ ok: true, kind });
  }

  if (route === 'push/unsubscribe' && method === 'POST') {
    const b = await request.json().catch(() => ({}));
    if (!b.endpoint) return respond({ error: 'endpoint required' }, 400);
    await ensurePush(env);
    await env.DB.prepare('DELETE FROM push_subs WHERE endpoint = ?').bind(b.endpoint).run().catch(() => {});
    return respond({ ok: true });
  }

  if (route === 'push/stats' && method === 'GET') {
    if (!authed()) return respond({ error: 'unauthorized' }, 401);
    await ensurePush(env);
    const v = await env.DB.prepare("SELECT COUNT(*) n FROM push_subs WHERE kind='visitor'").first().catch(() => null);
    const o = await env.DB.prepare("SELECT COUNT(*) n FROM push_subs WHERE kind='owner'").first().catch(() => null);
    return respond({ enabled: configured, visitors: v?.n || 0, owners: o?.n || 0 });
  }

  if (route === 'push/broadcast' && method === 'POST') {
    if (!authed()) return respond({ error: 'unauthorized' }, 401);
    if (!configured) return respond({ error: 'Notifications are a Pro feature.' }, 403);
    const b = await request.json().catch(() => ({}));
    const title = String(b.title || '').slice(0, 120).trim();
    if (!title) return respond({ error: 'A title is required.' }, 400);
    const payload = { title, body: String(b.body || '').slice(0, 300), url: String(b.url || '/').slice(0, 300), icon: '/icons/favicon.svg' };
    const res = await sendToKind(env, b.to === 'owner' ? 'owner' : 'visitor', payload);
    return respond({ ok: true, ...res });
  }

  if (route === 'push/test' && method === 'POST') {
    if (!authed()) return respond({ error: 'unauthorized' }, 401);
    if (!configured) return respond({ error: 'Notifications are a Pro feature.' }, 403);
    const host = canonHost(env, request);
    const res = await sendToKind(env, 'owner', { title: host || 'Foyer', body: 'Test notification ✓ — owner alerts are working.', url: '/admin', icon: '/icons/favicon.svg' });
    return respond({ ok: true, ...res });
  }

  return null;
}
