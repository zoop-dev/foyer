


export const TERMS_VERSION = '2026-06-07';

const DDL = `CREATE TABLE IF NOT EXISTS terms_acceptances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  who TEXT NOT NULL,
  email TEXT,
  version TEXT NOT NULL,
  accepted_at TEXT NOT NULL DEFAULT (datetime('now')),
  ip TEXT,
  user_agent TEXT
)`;
let _ready = false;
async function ensure(env) { if (_ready) return; await env.DB.prepare(DDL).run(); _ready = true; }


async function whoOf(ctx) {
  const v = await ctx.currentVisitor();
  return v ? { who: 'v' + v.id, email: v.email || null } : { who: 'pw', email: null };
}

export async function termsAccepted(ctx) {
  await ensure(ctx.env);
  const { who } = await whoOf(ctx);
  const row = await ctx.env.DB.prepare('SELECT 1 FROM terms_acceptances WHERE who = ? AND version = ? LIMIT 1')
    .bind(who, TERMS_VERSION).first().catch(() => null);
  return !!row;
}

export async function handleTerms(ctx) {
  const { route, method, request, env, respond, authed } = ctx;
  if (route !== 'terms/status' && route !== 'terms/accept') return null;
  if (!authed()) return respond({ error: 'unauthorized' }, 401);
  await ensure(env);

  if (route === 'terms/status' && method === 'GET') {
    return respond({ version: TERMS_VERSION, accepted: await termsAccepted(ctx) });
  }
  if (route === 'terms/accept' && method === 'POST') {
    const { who, email } = await whoOf(ctx);
    const ip = request.headers.get('CF-Connecting-IP') || '';
    const ua = (request.headers.get('User-Agent') || '').slice(0, 300);
    await env.DB.prepare('INSERT INTO terms_acceptances (who, email, version, ip, user_agent) VALUES (?,?,?,?,?)')
      .bind(who, email, TERMS_VERSION, ip, ua).run();
    return respond({ ok: true, version: TERMS_VERSION });
  }
  return null;
}
