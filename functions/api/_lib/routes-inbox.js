import { canonHost } from "./site-config.js";
import { isUltra } from "./plan.js";
import { notifyOwner } from "./routes-push.js";
import { rateLimit, clientIp } from "./rate-limit.js";
const CREATE_INBOX =
  "CREATE TABLE IF NOT EXISTS inbox (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, subject TEXT, body TEXT, page TEXT, ip TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), read_at TEXT)";
let _ready = false;
async function ensureInbox(env) {
  if (_ready) return;
  await env.DB.prepare(CREATE_INBOX)
    .run()
    .catch(() => {});
  _ready = true;
}
export async function handleInbox(ctx) {
  const {
    route: route,
    method: method,
    request: request,
    env: env,
    respond: respond,
    authed: authed,
    can: can,
  } = ctx;
  if (route !== "inbox" && !route.startsWith("inbox/")) return null;
  const host = canonHost(env, request);
  if (route === "inbox" && method === "POST") {
    if (!(await isUltra(env, host)))
      return respond({ error: "The native inbox is an Ultra feature." }, 403);
    const rl = await rateLimit(env, `inbox:${clientIp(request)}`, 5, 60);
    if (!rl.ok) return respond({ error: "Too many submissions — try again shortly." }, 429);
    let data = {};
    const ct = request.headers.get("content-type") || "";
    if (ct.includes("application/json")) data = await request.json().catch(() => ({}));
    else {
      try {
        const fd = await request.formData();
        fd.forEach((v, k) => {
          data[k] = typeof v === "string" ? v : "";
        });
      } catch (e) {}
    }
    if (data.botcheck) return respond({ ok: true });
    const known = new Set(["access_key", "botcheck", "subject", "page", "email", "name"]);
    const email = String(data.email || "")
      .slice(0, 200)
      .trim();
    const name = String(data.name || data.Name || "")
      .slice(0, 120)
      .trim();
    const subject = String(data.subject || "New contact message")
      .slice(0, 200)
      .trim();
    const extra = Object.keys(data).filter((k) => !known.has(k) && String(data[k] || "").trim());
    let body = extra
      .map((k) => `${k}: ${String(data[k]).trim()}`)
      .join("\n")
      .slice(0, 5e3);
    if (!body && data.message) body = String(data.message).slice(0, 5e3);
    if (!email && !body) return respond({ error: "Nothing to send." }, 400);
    await ensureInbox(env);
    await env.DB.prepare(
      "INSERT INTO inbox (name, email, subject, body, page, ip) VALUES (?,?,?,?,?,?)"
    )
      .bind(name, email, subject, body, String(data.page || "").slice(0, 300), clientIp(request))
      .run();
    const note = notifyOwner(env, {
      title: "📥 " + subject,
      body: (name || email || "Someone") + ": " + body.slice(0, 100),
      url: "/admin",
      icon: "/icons/favicon.svg",
    });
    if (ctx.waitUntil) ctx.waitUntil(note);
    else await note.catch(() => {});
    return respond({ ok: true }, 201);
  }
  if (route === "inbox" && method === "GET") {
    if (!authed()) return respond({ error: "unauthorized" }, 401);
    if (!can("inbox")) return respond({ error: "no_permission" }, 403);
    if (!(await isUltra(env, host)))
      return respond({ error: "The native inbox is an Ultra feature." }, 403);
    await ensureInbox(env);
    const { results: results } = await env.DB.prepare(
      "SELECT id, name, email, subject, body, page, created_at, read_at FROM inbox ORDER BY id DESC LIMIT 300"
    )
      .all()
      .catch(() => ({ results: [] }));
    const unread = (results || []).filter((m) => !m.read_at).length;
    return respond({ messages: results || [], unread: unread });
  }
  const one = route.match(/^inbox\/(\d+)$/);
  const readM = route.match(/^inbox\/(\d+)\/read$/);
  if (readM && method === "POST") {
    if (!authed()) return respond({ error: "unauthorized" }, 401);
    await ensureInbox(env);
    await env.DB.prepare("UPDATE inbox SET read_at = datetime('now') WHERE id = ?")
      .bind(parseInt(readM[1]))
      .run()
      .catch(() => {});
    return respond({ ok: true });
  }
  if (one && method === "DELETE") {
    if (!authed()) return respond({ error: "unauthorized" }, 401);
    await ensureInbox(env);
    await env.DB.prepare("DELETE FROM inbox WHERE id = ?")
      .bind(parseInt(one[1]))
      .run()
      .catch(() => {});
    return respond({ ok: true });
  }
  return null;
}
