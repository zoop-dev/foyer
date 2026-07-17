import { canonHost } from "./site-config.js";
import { isPro } from "./plan.js";
import { notifyOwner } from "./routes-push.js";
import { rateLimit, clientIp } from "./rate-limit.js";
import type { Ctx, Env } from "./types.ts";

function targetUrl(target: string): string {
  const i = (target || "").indexOf(":");
  if (i < 0) return "/";
  const kind = target.slice(0, i),
    slug = target.slice(i + 1);
  if (kind === "tutorial") return "/tutorials/" + slug;
  if (kind === "review") return "/review/" + slug;
  return "/" + kind + "/" + slug;
}
const CREATE_COMMENTS =
  "CREATE TABLE IF NOT EXISTS comments (id INTEGER PRIMARY KEY AUTOINCREMENT, target TEXT NOT NULL, name TEXT NOT NULL, body TEXT NOT NULL, avatar TEXT, visitor_id INTEGER, created_at TEXT NOT NULL DEFAULT (datetime('now')))";
let _cReady = false;
async function ensureComments(env: Env): Promise<void> {
  if (_cReady) return;
  await env.DB.prepare(CREATE_COMMENTS)
    .run()
    .catch(() => {});
  _cReady = true;
}
async function commentsOn(env: Env): Promise<boolean> {
  const r = await env.DB.prepare("SELECT value FROM site_settings WHERE key='comments_enabled'")
    .first<{ value: string }>()
    .catch(() => null);
  return !!(r && r.value === "1");
}
export async function handleComments(ctx: Ctx): Promise<Response | null> {
  const {
    route: route,
    method: method,
    request: request,
    env: env,
    respond: respond,
    authed: authed,
    can: can,
  } = ctx;
  if (route === "comments/admin" && method === "GET") {
    if (!authed()) return respond({ error: "unauthorized" }, 401);
    if (!can("comments")) return respond({ error: "no_permission" }, 403);
    await ensureComments(env);
    const { results: results } = await env.DB.prepare(
      "SELECT id, target, name, body, avatar, created_at FROM comments ORDER BY id DESC LIMIT 500"
    )
      .all()
      .catch(() => ({ results: [] }));
    return respond(results || []);
  }
  if (route === "comments" && method === "GET") {
    const target = (new URL(request.url).searchParams.get("target") || "").slice(0, 160).trim();
    if (!target || !(await commentsOn(env))) return respond([]);
    await ensureComments(env);
    const { results: results } = await env.DB.prepare(
      "SELECT id, name, body, avatar, created_at FROM comments WHERE target = ? ORDER BY id DESC LIMIT 200"
    )
      .bind(target)
      .all()
      .catch(() => ({ results: [] }));
    return respond(results || []);
  }
  if (route === "comments" && method === "POST") {
    if (!(await commentsOn(env))) return respond({ error: "Comments are turned off." }, 403);
    if (!(await isPro(env, canonHost(env, request))))
      return respond({ error: "Comments are a Pro feature." }, 403);
    {
      const rl = await rateLimit(env, `cmt:${clientIp(request)}`, 6, 60);
      if (!rl.ok)
        return respond({ error: "You’re commenting too fast — try again in a minute." }, 429);
    }
    const b: Record<string, unknown> = (await request.json().catch(() => ({}))) as any;
    const target = String(b.target || "")
      .slice(0, 160)
      .trim();
    const name = String(b.name || "")
      .slice(0, 60)
      .trim();
    const body = String(b.body || "")
      .slice(0, 2e3)
      .trim();
    const avatar = String(b.avatar || "").slice(0, 400);
    if (!target || !name || !body) return respond({ error: "Name and comment are required." }, 400);
    await ensureComments(env);
    const r = await env.DB.prepare(
      "INSERT INTO comments (target, name, body, avatar) VALUES (?,?,?,?)"
    )
      .bind(target, name, body, avatar)
      .run();
    const note = notifyOwner(env, {
      title: "New comment",
      body: `${name}: ${body.slice(0, 120)}`,
      url: targetUrl(target),
      icon: "/icons/favicon.svg",
    });
    if (ctx.waitUntil) ctx.waitUntil(note);
    else await note.catch(() => {});
    return respond(
      {
        id: r.meta?.last_row_id,
        name: name,
        body: body,
        avatar: avatar,
        created_at: new Date().toISOString(),
      },
      201
    );
  }
  const single = route.match(/^comments\/(\d+)$/);
  if (single && method === "DELETE") {
    if (!authed()) return respond({ error: "unauthorized" }, 401);
    await env.DB.prepare("DELETE FROM comments WHERE id = ?")
      .bind(parseInt(single[1]))
      .run()
      .catch(() => {});
    return respond({ ok: true });
  }
  return null;
}
