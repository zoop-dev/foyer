


export const SB_URL = (env) => (env.SUPABASE_URL || 'https://tvtfoghrdqwssdwvebuo.supabase.co').replace(/\/$/, '');
export const sbH = (env) => {
  const k = env.SUPABASE_SERVICE_KEY;
  return { apikey: k, authorization: `Bearer ${k}`, 'content-type': 'application/json' };
};

const b64 = (bytes) => btoa(String.fromCharCode(...bytes));
const ub64 = (s) => Uint8Array.from(atob(s), c => c.charCodeAt(0));
const b64url = (bytes) => b64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export function randToken(n = 32) {
  return b64url(crypto.getRandomValues(new Uint8Array(n)));
}
async function sha256b64url(str) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return b64url(new Uint8Array(d));
}
export async function pkceMatches(verifier, challenge) {
  if (!challenge) return true;            // no PKCE was requested
  try { return (await sha256b64url(verifier || '')) === challenge; } catch { return false; }
}

export async function hashPassword(pw) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iter = 100000;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' }, key, 256);
  return `pbkdf2$${iter}$${b64(salt)}$${b64(new Uint8Array(bits))}`;
}
export async function verifyPassword(pw, stored) {
  const parts = String(stored || '').split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false;
  const iter = parseInt(parts[1], 10), salt = ub64(parts[2]);
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' }, key, 256);
  const a = b64(new Uint8Array(bits)), b = parts[3];
  if (a.length !== b.length) return false;
  let diff = 0; for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function findUser(env, emailNorm) {
  const r = await fetch(`${SB_URL(env)}/rest/v1/foyer_users?email_norm=eq.${encodeURIComponent(emailNorm)}&select=*`, { headers: sbH(env) });
  return r.ok ? (await r.json())[0] || null : null;
}
export async function createUser(env, { email, name, passwordHash }) {
  const r = await fetch(`${SB_URL(env)}/rest/v1/foyer_users`, {
    method: 'POST', headers: { ...sbH(env), Prefer: 'return=representation' },
    body: JSON.stringify({ email, email_norm: email.toLowerCase(), name: name || '', password_hash: passwordHash }),
  });
  if (!r.ok) return null;
  return (await r.json())[0] || null;
}
export async function touchLogin(env, id) {
  await fetch(`${SB_URL(env)}/rest/v1/foyer_users?id=eq.${id}`, {
    method: 'PATCH', headers: { ...sbH(env), Prefer: 'return=minimal' }, body: JSON.stringify({ last_login: new Date().toISOString() }),
  }).catch(() => {});
}

export async function isLicensedClient(env, domain) {
  if (!domain) return false;
  const r = await fetch(`${SB_URL(env)}/rest/v1/foyer_sites?domain=eq.${encodeURIComponent(domain)}&select=licensed`, { headers: sbH(env) });
  if (!r.ok) return false;
  const row = (await r.json())[0];
  return !!(row && row.licensed !== false);
}

export async function issueCode(env, { userId, clientId, redirectUri, codeChallenge }) {
  const code = randToken(24);
  const r = await fetch(`${SB_URL(env)}/rest/v1/foyer_auth_codes`, {
    method: 'POST', headers: { ...sbH(env), Prefer: 'return=minimal' },
    body: JSON.stringify({ code, user_id: userId, client_id: clientId, redirect_uri: redirectUri, code_challenge: codeChallenge || '', expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() }),
  });
  return r.ok ? code : null;
}
export async function consumeCode(env, code) {
  const base = SB_URL(env);
  const r = await fetch(`${base}/rest/v1/foyer_auth_codes?code=eq.${encodeURIComponent(code)}&select=*`, { headers: sbH(env) });
  const row = r.ok ? (await r.json())[0] : null;
  if (!row) return null;
  await fetch(`${base}/rest/v1/foyer_auth_codes?code=eq.${encodeURIComponent(code)}`, { method: 'DELETE', headers: { ...sbH(env), Prefer: 'return=minimal' } }).catch(() => {});
  if (new Date(row.expires_at).getTime() < Date.now()) return null;
  return row;
}

const COOKIE = 'foyer_sso';
export async function createSession(env, userId) {
  const token = randToken(32);
  await fetch(`${SB_URL(env)}/rest/v1/foyer_auth_sessions`, {
    method: 'POST', headers: { ...sbH(env), Prefer: 'return=minimal' },
    body: JSON.stringify({ token, user_id: userId, expires_at: new Date(Date.now() + 30 * 864e5).toISOString() }),
  });
  return token;
}
export function sessionCookie(token, maxAgeDays = 30) {
  return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAgeDays * 86400}`;
}
export function clearCookie() { return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`; }
export function readCookie(request) {
  const m = (request.headers.get('cookie') || '').match(new RegExp(`(?:^|; )${COOKIE}=([^;]+)`));
  return m ? m[1] : '';
}
export async function sessionUser(env, request) {
  const token = readCookie(request);
  if (!token) return null;
  const r = await fetch(`${SB_URL(env)}/rest/v1/foyer_auth_sessions?token=eq.${encodeURIComponent(token)}&select=user_id,expires_at`, { headers: sbH(env) });
  const s = r.ok ? (await r.json())[0] : null;
  if (!s || new Date(s.expires_at).getTime() < Date.now()) return null;
  const u = await fetch(`${SB_URL(env)}/rest/v1/foyer_users?id=eq.${s.user_id}&select=*`, { headers: sbH(env) });
  return u.ok ? (await u.json())[0] || null : null;
}

const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export function loginPage({ clientDomain, params, mode = 'login', error = '', name = '', email = '' }) {
  const hidden = ['client_id', 'redirect_uri', 'state', 'code_challenge', 'code_challenge_method']
    .map(k => `<input type="hidden" name="${k}" value="${esc(params[k] || '')}" />`).join('');
  const signup = mode === 'signup';
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${signup ? 'Create your Foyer account' : 'Sign in with Foyer'}</title><meta name="robots" content="noindex" />
<link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Unbounded:wght@200;300&family=Josefin+Sans:wght@100;200;300&display=swap" />
<style>:root{--bg:#0b0e13;--ink:#e8edf2;--muted:#8b94a6;--accent:#7fa6d8}*{margin:0;padding:0;box-sizing:border-box}
body{background:var(--bg);color:var(--ink);font-family:'Josefin Sans',system-ui,sans-serif;font-weight:200;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:2rem;-webkit-font-smoothing:antialiased}
.glow{position:fixed;inset:-30% -10% auto;height:70vh;background:radial-gradient(ellipse 50% 60% at 50% 0%,rgba(127,166,216,.10),transparent 70%);pointer-events:none}
.card{position:relative;width:100%;max-width:370px;text-align:center}
.mark{width:52px;margin:0 auto 1.4rem;display:block}
h1{font-family:'Unbounded',sans-serif;font-weight:200;font-size:1.25rem;letter-spacing:.02em;margin-bottom:.4rem}
.sub{font-size:.62rem;letter-spacing:.32em;text-transform:uppercase;color:var(--accent);margin-bottom:2rem;font-weight:300}
.site{color:var(--muted);font-size:.7rem;letter-spacing:.05em;margin-bottom:1.8rem}
.site b{color:var(--ink);font-weight:300}
input[type=text],input[type=email],input[type=password]{width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(170,190,215,.2);color:var(--ink);font-family:inherit;font-weight:300;font-size:.85rem;padding:.8rem 1rem;border-radius:9px;outline:none;margin-bottom:.7rem}
input:focus{border-color:var(--accent)}
button.go{width:100%;margin-top:.5rem;background:var(--accent);color:#070a0e;border:none;font-family:inherit;font-weight:300;font-size:.7rem;letter-spacing:.24em;text-transform:uppercase;padding:.85rem;border-radius:9px;cursor:pointer}
button.go:hover{filter:brightness(1.08)}
.err{color:#e0608a;font-size:.62rem;letter-spacing:.06em;min-height:.9rem;margin-bottom:.6rem}
.alt{margin-top:1.4rem;font-size:.66rem;color:var(--muted)}.alt a{color:var(--accent);text-decoration:none}
.foot{margin-top:2.2rem;font-size:.55rem;letter-spacing:.1em;color:rgba(139,148,166,.5)}</style></head>
<body><div class="glow"></div><div class="card">
<svg class="mark" viewBox="0 0 44 50" fill="none" stroke="var(--accent)" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 46 V24 a16 16 0 0 1 32 0 V46"/><path d="M15 46 V28 a6 6 0 0 1 12 0 V46"/></svg>
<h1>${signup ? 'Create your Foyer account' : 'Sign in with Foyer'}</h1>
<p class="sub">one identity · every Foyer site</p>
${clientDomain ? `<p class="site">to continue to <b>${esc(clientDomain)}</b></p>` : ''}
<form method="POST" action="/authorize">${hidden}<input type="hidden" name="action" value="${signup ? 'signup' : 'login'}" />
<p class="err">${esc(error)}</p>
${signup ? `<input type="text" name="name" placeholder="Your name" value="${esc(name)}" autocomplete="name" />` : ''}
<input type="email" name="email" placeholder="Email" value="${esc(email)}" autocomplete="email" required />
<input type="password" name="password" placeholder="Password" autocomplete="${signup ? 'new-password' : 'current-password'}" required minlength="8" />
<button class="go" type="submit">${signup ? 'Create account' : 'Continue'}</button></form>
<p class="alt">${signup ? `Already have a Foyer account? <a href="?${esc(qs(params, 'login'))}">Sign in</a>` : `New here? <a href="?${esc(qs(params, 'signup'))}">Create an account</a>`}</p>
<p class="foot">FOYER · zo0p.dev</p></div></body></html>`;
}
function qs(params, mode) {
  const u = new URLSearchParams();
  ['client_id', 'redirect_uri', 'state', 'code_challenge', 'code_challenge_method'].forEach(k => { if (params[k]) u.set(k, params[k]); });
  u.set('mode', mode);
  return u.toString();
}
