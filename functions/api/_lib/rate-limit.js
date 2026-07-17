const DDL = "CREATE TABLE IF NOT EXISTS rate_limits (k TEXT PRIMARY KEY, n INTEGER NOT NULL, reset_at INTEGER NOT NULL)";
let _ready = false;
export function clientIp(request) {
  return request.headers.get("CF-Connecting-IP") || (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "0";
}
export async function rateLimit(env, key, limit, windowSec) {
  try {
    if (!_ready) {
      await env.DB.prepare(DDL).run().catch(() => {
      });
      _ready = true;
    }
    const now = Math.floor(Date.now() / 1e3);
    const row = await env.DB.prepare("SELECT n, reset_at FROM rate_limits WHERE k = ?").bind(key).first().catch(() => null);
    if (row && row.reset_at > now) {
      if (row.n >= limit) return { ok: false, remaining: 0, retryAfter: row.reset_at - now };
      await env.DB.prepare("UPDATE rate_limits SET n = n + 1 WHERE k = ?").bind(key).run().catch(() => {
      });
      return { ok: true, remaining: Math.max(0, limit - row.n - 1), retryAfter: 0 };
    }
    await env.DB.prepare(
      "INSERT INTO rate_limits (k, n, reset_at) VALUES (?, 1, ?) ON CONFLICT(k) DO UPDATE SET n = 1, reset_at = excluded.reset_at"
    ).bind(key, now + windowSec).run().catch(() => {
    });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  } catch (e) {
    return { ok: true, remaining: limit, retryAfter: 0 };
  }
}
