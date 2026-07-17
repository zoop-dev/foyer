import { sendWebPush } from "./webpush.js";
import { canonHost } from "./site-config.js";
import { isUltra } from "./plan.js";
import type { Ctx, Env } from "./types.ts";

const CREATE_PUSH =
  "CREATE TABLE IF NOT EXISTS push_subs (endpoint TEXT PRIMARY KEY, p256dh TEXT NOT NULL, auth TEXT NOT NULL, kind TEXT NOT NULL DEFAULT 'visitor', created_at TEXT NOT NULL DEFAULT (datetime('now')))";
let _pushReady = false;
async function ensurePush(env: Env): Promise<void> {
  if (_pushReady) return;
  await env.DB.prepare(CREATE_PUSH)
    .run()
    .catch(() => {});
  _pushReady = true;
}
function vapidOpts(env: Env) {
  return {
    vapidPublic: env.VAPID_PUBLIC,
    vapidPrivate: env.VAPID_PRIVATE,
    subject: "mailto:zoop@foyer.zo0p.dev",
  };
}
async function sendToKind(
  env: Env,
  kind: string,
  payload: unknown
): Promise<{ sent: number; removed: number; total: number }> {
  await ensurePush(env);
  const { results: results } = await env.DB.prepare(
    "SELECT endpoint, p256dh, auth FROM push_subs WHERE kind = ?"
  )
    .bind(kind)
    .all<{ endpoint: string; p256dh: string; auth: string }>()
    .catch(() => ({ results: [] as { endpoint: string; p256dh: string; auth: string }[] }));
  const body = JSON.stringify(payload);
  const opts = vapidOpts(env);
  let sent = 0,
    gone: string[] = [];
  for (const s of results || []) {
    const sub = { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } };
    let r: { ok?: boolean; gone?: boolean };
    try {
      r = await sendWebPush(sub, body, opts);
    } catch {
      r = { ok: false };
    }
    if (r.ok) sent++;
    else if (r.gone) gone.push(s.endpoint);
  }
  if (gone.length) {
    const ph = gone.map(() => "?").join(",");
    await env.DB.prepare(`DELETE FROM push_subs WHERE endpoint IN (${ph})`)
      .bind(...gone)
      .run()
      .catch(() => {});
  }
  return { sent: sent, removed: gone.length, total: (results || []).length };
}
export async function notifyOwner(env: Env, payload: unknown): Promise<void> {
  if (!env.VAPID_PRIVATE) return;
  try {
    await sendToKind(env, "owner", payload);
  } catch {}
}
export async function handlePush(ctx: Ctx): Promise<Response | null> {
  const {
    route: route,
    method: method,
    request: request,
    env: env,
    respond: respond,
    authed: authed,
  } = ctx;
  if (!route.startsWith("push/")) return null;
  const configured =
    !!(env.VAPID_PUBLIC && env.VAPID_PRIVATE) && (await isUltra(env, canonHost(env, request)));
  if (route === "push/config" && method === "GET") {
    return respond({ vapid_public: configured ? env.VAPID_PUBLIC || "" : "", enabled: configured });
  }
  if (route === "push/subscribe" && method === "POST") {
    if (!configured) return respond({ error: "Notifications are a Pro feature." }, 403);
    const b = await request.json().catch(() => ({}) as Record<string, unknown>);
    const sub = (b as Record<string, unknown>).subscription || ({} as Record<string, unknown>);
    const subObj = sub as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
    const kind = (b as Record<string, unknown>).kind === "owner" ? "owner" : "visitor";
    if (kind === "owner" && !authed()) return respond({ error: "unauthorized" }, 401);
    if (!subObj.endpoint || !subObj.keys || !subObj.keys.p256dh || !subObj.keys.auth)
      return respond({ error: "bad subscription" }, 400);
    await ensurePush(env);
    await env.DB.prepare(
      "INSERT INTO push_subs (endpoint, p256dh, auth, kind) VALUES (?,?,?,?) ON CONFLICT(endpoint) DO UPDATE SET p256dh=excluded.p256dh, auth=excluded.auth, kind=excluded.kind"
    )
      .bind(subObj.endpoint, subObj.keys.p256dh, subObj.keys.auth, kind)
      .run();
    return respond({ ok: true, kind: kind });
  }
  if (route === "push/unsubscribe" && method === "POST") {
    const b = await request.json().catch(() => ({}) as Record<string, unknown>);
    if (!(b as Record<string, unknown>).endpoint)
      return respond({ error: "endpoint required" }, 400);
    await ensurePush(env);
    await env.DB.prepare("DELETE FROM push_subs WHERE endpoint = ?")
      .bind((b as Record<string, unknown>).endpoint)
      .run()
      .catch(() => {});
    return respond({ ok: true });
  }
  if (route === "push/stats" && method === "GET") {
    if (!authed()) return respond({ error: "unauthorized" }, 401);
    await ensurePush(env);
    const v = await env.DB.prepare("SELECT COUNT(*) n FROM push_subs WHERE kind='visitor'")
      .first<{ n: number }>()
      .catch(() => null);
    const o = await env.DB.prepare("SELECT COUNT(*) n FROM push_subs WHERE kind='owner'")
      .first<{ n: number }>()
      .catch(() => null);
    return respond({ enabled: configured, visitors: v?.n || 0, owners: o?.n || 0 });
  }
  if (route === "push/broadcast" && method === "POST") {
    if (!authed()) return respond({ error: "unauthorized" }, 401);
    if (!configured) return respond({ error: "Notifications are a Pro feature." }, 403);
    const b = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const title = String(b.title || "")
      .slice(0, 120)
      .trim();
    if (!title) return respond({ error: "A title is required." }, 400);
    const payload = {
      title: title,
      body: String(b.body || "").slice(0, 300),
      url: String(b.url || "/").slice(0, 300),
      icon: "/icons/favicon.svg",
    };
    const res = await sendToKind(env, b.to === "owner" ? "owner" : "visitor", payload);
    return respond({ ok: true, ...res });
  }
  if (route === "push/test" && method === "POST") {
    if (!authed()) return respond({ error: "unauthorized" }, 401);
    if (!configured) return respond({ error: "Notifications are a Pro feature." }, 403);
    const host = canonHost(env, request);
    const res = await sendToKind(env, "owner", {
      title: host || "Foyer",
      body: "Test notification ✓ — owner alerts are working.",
      url: "/admin",
      icon: "/icons/favicon.svg",
    });
    return respond({ ok: true, ...res });
  }
  return null;
}
