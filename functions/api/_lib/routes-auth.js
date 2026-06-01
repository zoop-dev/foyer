
export async function handleAuth(ctx) {
  const { route, method, request, env, headers, respond, compressJson, decompressJson, CREATE_SESSIONS, CREATE_BANNED_EMAILS, CREATE_PAGES, authed, visitorAuthed, _adminRole, ensureSessionCols, newSession, currentVisitor } = ctx;

  if (route === 'auth' && method === 'POST') {
    const { password } = await request.json().catch(() => ({}));
    if (!password) return respond({ error: 'unauthorized' }, 401);
    if (password !== env.ADMIN_PASSWORD && password !== env.ADMIN_PASSWORD_2)
      return respond({ error: 'unauthorized' }, 401);
    return respond({ ok: true });
  }


  const CREATE_ALLOWED_EMAILS = "CREATE TABLE IF NOT EXISTS allowed_emails (email TEXT PRIMARY KEY, added_at TEXT NOT NULL DEFAULT (datetime('now')))";


  async function signupDomainLimited(email) {
    const limRow = await env.DB.prepare("SELECT value FROM site_settings WHERE key='signup_domain_limit'").first().catch(() => null);
    const limit = parseInt(limRow?.value || '0', 10);
    if (!limit) return false;
    const winRow = await env.DB.prepare("SELECT value FROM site_settings WHERE key='signup_domain_window_h'").first().catch(() => null);
    const winH = parseInt(winRow?.value || '24', 10) || 24;
    const domain = (email.split('@')[1] || '').toLowerCase();
    if (!domain) return false;


    const DEFAULT_EXEMPT = 'gmail.com,yahoo.com,outlook.com,hotmail.com,icloud.com,proton.me,protonmail.com,aol.com,live.com,msn.com,gmx.com,mail.com';
    const exRow = await env.DB.prepare("SELECT value FROM site_settings WHERE key='signup_domain_exempt'").first().catch(() => null);
    const exempt = (exRow && exRow.value != null ? exRow.value : DEFAULT_EXEMPT).toLowerCase().split(/[\s,]+/).map(d => d.replace(/^@/, '').trim()).filter(Boolean);
    if (exempt.includes(domain)) return false;
    const row = await env.DB.prepare(
      "SELECT COUNT(*) AS n FROM visitors WHERE lower(email) LIKE ? AND first_seen > datetime('now', ?)"
    ).bind('%@' + domain, '-' + winH + ' hours').first().catch(() => null);
    return (row?.n || 0) >= limit;
  }


  async function signupVpnBlocked() {
    const on = await env.DB.prepare("SELECT value FROM site_settings WHERE key='signup_block_vpn'").first().catch(() => null);
    if (on?.value !== '1') return false;
    const ip = request.headers.get('CF-Connecting-IP') || '';
    if (!ip) return false;
    try {
      const key = env.PROXYCHECK_KEY || '';
      const r = await fetch(`https://proxycheck.io/v2/${encodeURIComponent(ip)}?vpn=1${key ? '&key=' + encodeURIComponent(key) : ''}`);
      if (!r.ok) return false;
      const j = await r.json();
      const rec = j && j[ip];
      return !!(rec && rec.proxy === 'yes');
    } catch { return false; }
  }

  async function denyAccess(email) {
    await env.DB.prepare(CREATE_BANNED_EMAILS).run();
    if (await env.DB.prepare('SELECT 1 FROM banned_emails WHERE email = ?').bind(email).first()) return 'account_banned';
    const lock = await env.DB.prepare("SELECT value FROM site_settings WHERE key='site_lockdown'").first().catch(() => null);
    if (lock?.value === '1') {
      const v = await env.DB.prepare('SELECT role FROM visitors WHERE email = ?').bind(email).first().catch(() => null);
      if (!(v && (v.role === 'owner' || v.role === 'admin'))) {
        await env.DB.prepare(CREATE_ALLOWED_EMAILS).run();
        if (!await env.DB.prepare('SELECT 1 FROM allowed_emails WHERE email = ?').bind(email).first()) return 'not_allowed';
      }
    }

    const existing = await env.DB.prepare('SELECT 1 FROM visitors WHERE email = ? LIMIT 1').bind(email).first().catch(() => null);
    if (!existing) {
      if (await signupDomainLimited(email)) return 'signup_limited';
      if (await signupVpnBlocked()) return 'vpn_blocked';
    }
    return null;
  }


  function deviceLabel(ua) {
    ua = ua || '';
    if (!ua) return 'Unknown device';
    const browser =
      /Edg\//.test(ua)                          ? 'Edge'    :
      /OPR\/|Opera/.test(ua)                    ? 'Opera'   :
      /Firefox\//.test(ua)                      ? 'Firefox' :
      /Chrome\//.test(ua) && !/Chromium/.test(ua) ? 'Chrome' :
      /Safari\//.test(ua)                       ? 'Safari'  : 'Browser';
    const os =
      /iPhone|iPad|iPod/.test(ua) ? 'iOS'     :
      /Android/.test(ua)          ? 'Android' :
      /Mac OS X|Macintosh/.test(ua) ? 'macOS' :
      /Windows/.test(ua)          ? 'Windows' :
      /Linux/.test(ua)            ? 'Linux'   : '';
    return os ? `${browser} · ${os}` : browser;
  }

  if (route === 'account' && method === 'GET') {
    const v = await currentVisitor();
    if (!v) return respond({ error: 'unauthorized' }, 401);
    const sub = v.google_sub || '';
    const provider = sub.startsWith('email:')   ? 'email'
                   : sub.startsWith('github:')  ? 'github'
                   : sub.startsWith('discord:') ? 'discord'
                   : 'google';
    return respond({
      email: v.email, name: v.name, picture: v.picture, provider,
      role: v.role || '', visit_count: v.visit_count,
      first_seen: v.first_seen, last_seen: v.last_seen,
    });
  }

  if (route === 'account/sessions' && method === 'GET') {
    const v = await currentVisitor();
    if (!v) return respond({ error: 'unauthorized' }, 401);
    await ensureSessionCols();
    const cur = request.headers.get('X-Session-Token') || '';
    const { results } = await env.DB.prepare(
      "SELECT token, sid, user_agent, created_at, last_seen FROM sessions WHERE visitor_id = ? AND expires_at > datetime('now') ORDER BY (token = ?) DESC, last_seen DESC"
    ).bind(v.id, cur).all();
    const sessions = [];
    for (const r of results) {
      let sid = r.sid;
      if (!sid) { sid = crypto.randomUUID(); await env.DB.prepare('UPDATE sessions SET sid = ? WHERE token = ?').bind(sid, r.token).run(); }
      sessions.push({
        sid, current: r.token === cur,
        device: deviceLabel(r.user_agent),
        created_at: r.created_at, last_seen: r.last_seen || r.created_at,
      });
    }
    return respond({ sessions });
  }

  if (route === 'account/sessions/revoke' && method === 'POST') {
    const v = await currentVisitor();
    if (!v) return respond({ error: 'unauthorized' }, 401);
    const { sid } = await request.json().catch(() => ({}));
    if (!sid) return respond({ error: 'sid required' }, 400);
    await ensureSessionCols();
    await env.DB.prepare('DELETE FROM sessions WHERE visitor_id = ? AND sid = ?').bind(v.id, sid).run();
    return respond({ ok: true });
  }

  if (route === 'account/sessions/revoke-others' && method === 'POST') {
    const v = await currentVisitor();
    if (!v) return respond({ error: 'unauthorized' }, 401);
    const cur = request.headers.get('X-Session-Token') || '';
    await env.DB.prepare('DELETE FROM sessions WHERE visitor_id = ? AND token != ?').bind(v.id, cur).run();
    return respond({ ok: true });
  }


  if (route === 'account/name' && method === 'POST') {
    const v = await currentVisitor();
    if (!v) return respond({ error: 'unauthorized' }, 401);
    const { name } = await request.json().catch(() => ({}));
    const nm = (name || '').trim().slice(0, 80);
    if (!nm) return respond({ error: 'name required' }, 400);
    await env.DB.prepare('UPDATE visitors SET name = ? WHERE id = ?').bind(nm, v.id).run();
    return respond({ ok: true });
  }

  if (route === 'auth/signout' && method === 'POST') {
    const token = request.headers.get('X-Session-Token') || '';
    if (token) {
      await env.DB.prepare(CREATE_SESSIONS).run();
      await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
    }
    return respond({ ok: true });
  }

  const CREATE_MAGIC_LINKS = `CREATE TABLE IF NOT EXISTS magic_links (
    token         TEXT    PRIMARY KEY,
    request_id    TEXT,
    email         TEXT    NOT NULL,
    ip            TEXT,
    used          INTEGER NOT NULL DEFAULT 0,
    approved      INTEGER NOT NULL DEFAULT 0,
    session_token TEXT,
    session_name  TEXT,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
    expires_at    TEXT    NOT NULL
  )`;

  async function createEmailSession(email, name, sub) {
    const denied = await denyAccess(email);
    if (denied) return { error: denied };


    await env.DB.prepare(`
      INSERT INTO visitors (google_sub, email, name, picture)
      VALUES (?, ?, ?, '')
      ON CONFLICT(google_sub) DO UPDATE SET
        email = excluded.email,
        visit_count = visit_count + 1,
        last_seen = datetime('now')
    `).bind(sub, email, name).run();

    const visitor = await env.DB.prepare(
      'SELECT id, is_banned, name FROM visitors WHERE google_sub = ? OR google_sub = \'banned:\' || ?'
    ).bind(sub, sub).first();
    if (visitor?.is_banned) return { error: 'account_banned' };

    const { token: sessionToken } = await newSession(visitor.id);
    return { session_token: sessionToken, name: visitor.name || name };
  }

  if (route === 'auth/magic-link' && method === 'POST') {
    const mlEnabled = await env.DB.prepare("SELECT value FROM site_settings WHERE key='auth_magic'").first().catch(()=>null);
    if (mlEnabled?.value === '0') return respond({ error: 'email sign-in is disabled' }, 403);
    if (!env.RESEND_API_KEY) return respond({ error: 'email auth not configured' }, 503);

    const { email: rawEmail, redirect } = await request.json().catch(() => ({}));
    const email = (rawEmail || '').trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return respond({ error: 'enter a valid email' }, 400);


    const denied = await denyAccess(email);
    if (denied === 'account_banned') return respond({ ok: true });
    if (denied) return respond({ error: denied }, 403);

    await env.DB.prepare(CREATE_MAGIC_LINKS).run();
    await env.DB.prepare('ALTER TABLE magic_links ADD COLUMN ip TEXT').run().catch(() => {});


    const ip = request.headers.get('CF-Connecting-IP') || '';
    const emailCount = await env.DB.prepare(
      "SELECT COUNT(*) AS n FROM magic_links WHERE email = ? AND created_at > datetime('now', '-15 minutes')"
    ).bind(email).first().catch(() => ({ n: 0 }));
    if ((emailCount?.n || 0) >= 3)
      return respond({ error: 'Too many sign-in attempts for this email. Please wait a few minutes and try again.' }, 429);
    if (ip) {
      const ipCount = await env.DB.prepare(
        "SELECT COUNT(*) AS n FROM magic_links WHERE ip = ? AND created_at > datetime('now', '-15 minutes')"
      ).bind(ip).first().catch(() => ({ n: 0 }));
      if ((ipCount?.n || 0) >= 8)
        return respond({ error: 'Too many requests from your network. Please wait a few minutes and try again.' }, 429);
    }

    await env.DB.prepare('UPDATE magic_links SET used = 1 WHERE email = ? AND used = 0').bind(email).run();

    const token     = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, '');
    const requestId = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, '');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
      .toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, '');
    await env.DB.prepare(
      'INSERT INTO magic_links (token, request_id, email, ip, expires_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(token, requestId, email, ip, expiresAt).run();



    let reqOrigin = 'https://lanson.org';
    try { reqOrigin = new URL(request.url).origin; } catch {}
    const base = (env.SITE_URL || reqOrigin).replace(/\/$/, '');
    const displayDomain = base.replace(/^https?:\/\//, '');
    const nameRow = await env.DB.prepare("SELECT value FROM site_settings WHERE key='name'").first().catch(() => null);
    const siteName = nameRow?.value || env.SITE_NAME || 'this site';
    const link = `${base}/?ml=${encodeURIComponent(token)}` + (redirect === 'admin' ? '&admin_return=1' : '');
    const from = env.RESEND_FROM || `${siteName} <magic-link@${displayDomain}>`;


    const accentRow = await env.DB.prepare("SELECT value FROM site_settings WHERE key='theme_accent'").first().catch(() => null);
    const accentHex = /^#[0-9a-fA-F]{6}$/.test(accentRow?.value || '') ? accentRow.value : '#4dbd6a';
    const _a = [parseInt(accentHex.slice(1,3),16), parseInt(accentHex.slice(3,5),16), parseInt(accentHex.slice(5,7),16)];
    const _hex = (r,g,b) => '#' + [r,g,b].map(v => Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
    const dk = (t) => _hex(_a[0]*t, _a[1]*t, _a[2]*t);                     // darken toward black
    const lt = (t) => _hex(_a[0]+(255-_a[0])*t, _a[1]+(255-_a[1])*t, _a[2]+(255-_a[2])*t); // lighten toward white

    let html = `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <title>Sign in to ${siteName}</title>
  <!--[if mso]><style>body,table,td,a{font-family:Segoe UI,Arial,sans-serif !important;}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background:#070b07;">
  <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;mso-hide:all;">Your sign-in link for ${siteName} — expires in 15 minutes.</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#070b07;">
    <tr><td align="center" style="padding:44px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:460px;width:100%;">

        <!-- Logo badge (exact site favicon) -->
        <tr><td align="center" style="padding-bottom:26px;">
          <img src="${base}/icons/favicon-96.png" width="52" height="52" alt="${siteName}" style="display:block;width:52px;height:52px;border-radius:13px;" />
        </td></tr>

        <!-- Card -->
        <tr><td style="background:#0d140d;border:1px solid #18301c;border-radius:16px;padding:38px 36px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#eef7ef;font-size:21px;font-weight:600;line-height:1.3;padding-bottom:10px;">Sign in to ${siteName}</td></tr>
            <tr><td style="font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#9fc7a8;font-size:14px;line-height:1.65;padding-bottom:30px;">Tap the button below to securely sign in. This link works once and expires in <strong style="color:#cfe9d4;">15 minutes</strong>.</td></tr>

            <!-- Bulletproof button -->
            <tr><td align="center" style="padding-bottom:30px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" bgcolor="#39ff14" style="border-radius:10px;">
                <a href="${link}" target="_blank" style="display:inline-block;background:#39ff14;color:#05210a;text-decoration:none;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;letter-spacing:.3px;padding:14px 40px;border-radius:10px;">Sign in &rarr;</a>
              </td></tr></table>
            </td></tr>

            <tr><td style="font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#5f7a64;font-size:12px;line-height:1.6;padding-bottom:8px;">Button not working? Paste this link into your browser:</td></tr>
            <tr><td style="font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;word-break:break-all;padding-bottom:28px;"><a href="${link}" target="_blank" style="color:#4dbd6a;text-decoration:underline;">${link}</a></td></tr>

            <tr><td style="border-top:1px solid #18301c;padding-top:20px;font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#4a5d4e;font-size:11.5px;line-height:1.7;">If you didn't request this email, you can safely ignore it — no one can sign in without this link.</td></tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td align="center" style="padding-top:26px;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:11px;line-height:1.7;color:#3c4d40;">
          <a href="${base}" target="_blank" style="color:#4dbd6a;text-decoration:none;">${displayDomain}</a>
          &nbsp;&middot;&nbsp;
          made with <a href="https://zo0p.dev" target="_blank" style="color:${accentHex};text-decoration:none;font-weight:600;">Foyer</a>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    html = html
      .replaceAll('#070b07', dk(0.05))   // page bg
      .replaceAll('#0d140d', dk(0.11))   // card bg
      .replaceAll('#18301c', dk(0.30))   // borders
      .replaceAll('#9fc7a8', lt(0.50))   // subtext
      .replaceAll('#cfe9d4', lt(0.72))   // emphasized text
      .replaceAll('#39ff14', accentHex)  // button
      .replaceAll('#05210a', dk(0.12))   // button label
      .replaceAll('#4dbd6a', accentHex)  // links
      .replaceAll('#5f7a64', '#6b7681')  // dim helper (neutral)
      .replaceAll('#4a5d4e', '#515a63')  // dim note (neutral)
      .replaceAll('#3c4d40', '#444c54'); // footer (neutral)

    const text = `Sign in to ${siteName}\n\nUse this link to sign in (expires in 15 minutes, one-time use):\n${link}\n\nIf you didn't request this, you can ignore this email.\n\n${displayDomain} · made with Foyer`;

    const sendResp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [email], subject: `Your sign-in link for ${siteName}`, html, text }),
    });
    const sendRes = await sendResp.json().catch(() => null);

    if (!sendRes?.id) {



      const msg = `${sendRes?.message || sendRes?.name || ''}`.toLowerCase();
      if (sendResp.status === 429 || /daily|quota|limit|rate/.test(msg)) {
        return respond({ error: "Sign-in emails are temporarily maxed out for today. Please try again later, or use another sign-in option." }, 429);
      }
      return respond({ error: 'could not send email, try again' }, 502);
    }
    return respond({ ok: true, request_id: requestId });
  }




  if (route === 'auth/magic-link/verify' && method === 'POST') {
    const { token } = await request.json().catch(() => ({}));
    if (!token) return respond({ error: 'token required' }, 400);

    await env.DB.prepare(CREATE_MAGIC_LINKS).run();
    const row = await env.DB.prepare(
      "SELECT email, approved, session_token, session_name FROM magic_links WHERE token = ? AND expires_at > datetime('now')"
    ).bind(token).first().catch(() => null);
    if (!row) return respond({ error: 'this link is invalid or has expired' }, 401);

    if (row.approved && row.session_token) {
      return respond({ ok: true, approved: true, email: row.email, name: row.session_name || row.email.split('@')[0], picture: '', session_token: row.session_token });
    }

    const email = row.email.toLowerCase();
    const name  = email.split('@')[0];
    const sub   = `email:${email}`;
    const sess  = await createEmailSession(email, name, sub);
    if (sess.error) return respond({ error: sess.error }, 403);

    await env.DB.prepare(
      'UPDATE magic_links SET used = 1, approved = 1, session_token = ?, session_name = ? WHERE token = ?'
    ).bind(sess.session_token, sess.name, token).run();

    return respond({ ok: true, approved: true, email, name: sess.name, picture: '', session_token: sess.session_token, needs_name: sess.name === name });
  }

  if (route === 'auth/magic-link/status' && method === 'POST') {
    const { request_id } = await request.json().catch(() => ({}));
    if (!request_id) return respond({ error: 'request_id required' }, 400);

    await env.DB.prepare(CREATE_MAGIC_LINKS).run();
    const row = await env.DB.prepare(
      'SELECT email, approved, session_token, session_name, expires_at FROM magic_links WHERE request_id = ?'
    ).bind(request_id).first().catch(() => null);

    if (!row) return respond({ status: 'expired' });
    if (new Date(row.expires_at.replace(' ', 'T') + 'Z') < new Date()) return respond({ status: 'expired' });
    if (row.approved && row.session_token) {
      const nm = row.session_name || row.email.split('@')[0];
      return respond({ status: 'approved', email: row.email, name: nm, picture: '', session_token: row.session_token, needs_name: nm === row.email.split('@')[0] });
    }
    return respond({ status: 'pending' });
  }

  if (route === 'auth/github' && method === 'POST') {
    const ghEnabled = await env.DB.prepare("SELECT value FROM site_settings WHERE key='auth_github'").first().catch(()=>null);
    if (ghEnabled?.value === '0') return respond({ error: 'github sign-in is disabled' }, 403);

    const { code } = await request.json().catch(() => ({}));
    if (!code) return respond({ error: 'code required' }, 400);

    const clientId     = env.GITHUB_CLIENT_ID     || '';
    const clientSecret = env.GITHUB_CLIENT_SECRET || '';
    if (!clientId || !clientSecret) return respond({ error: 'github auth not configured' }, 503);

    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    }).then(r => r.json()).catch(() => null);

    if (!tokenRes?.access_token) return respond({ error: 'github token exchange failed' }, 401);

    const accessToken = tokenRes.access_token;

    const [ghUser, ghEmails] = await Promise.all([
      fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${accessToken}`, 'User-Agent': 'foyer-site' },
      }).then(r => r.json()).catch(() => null),
      fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${accessToken}`, 'User-Agent': 'foyer-site' },
      }).then(r => r.json()).catch(() => []),
    ]);

    if (!ghUser?.id) return respond({ error: 'could not fetch github user' }, 401);

    const primaryEmail = (Array.isArray(ghEmails) ? ghEmails : [])
      .find(e => e.primary && e.verified)?.email || ghUser.email || '';

    if (!primaryEmail) return respond({ error: 'no verified email on github account' }, 401);

    const sub     = `github:${ghUser.id}`;
    const name    = ghUser.name || ghUser.login || '';
    const picture = ghUser.avatar_url || '';
    const email   = primaryEmail.toLowerCase();

    const denied = await denyAccess(email);
    if (denied) return respond({ error: denied }, 403);

    await env.DB.prepare(`
      INSERT INTO visitors (google_sub, email, name, picture)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(google_sub) DO UPDATE SET
        email = excluded.email,
        name  = excluded.name,
        picture = excluded.picture,
        visit_count = visit_count + 1,
        last_seen = datetime('now')
    `).bind(sub, email, name, picture).run();

    const visitor = await env.DB.prepare(
      'SELECT id, is_banned FROM visitors WHERE google_sub = ? OR google_sub = \'banned:\' || ?'
    ).bind(sub, sub).first();
    if (visitor?.is_banned) return respond({ error: 'account_banned' }, 403);

    const { token: sessionToken } = await newSession(visitor.id);

    return respond({ ok: true, email, name, picture, session_token: sessionToken });
  }

  if (route === 'auth/discord' && method === 'POST') {
    const dcEnabled = await env.DB.prepare("SELECT value FROM site_settings WHERE key='auth_discord'").first().catch(()=>null);
    if (dcEnabled?.value === '0') return respond({ error: 'discord sign-in is disabled' }, 403);

    const { code, redirect_uri } = await request.json().catch(() => ({}));
    if (!code) return respond({ error: 'code required' }, 400);

    const clientId     = env.DISCORD_CLIENT_ID     || '';
    const clientSecret = env.DISCORD_CLIENT_SECRET || '';
    if (!clientId || !clientSecret) return respond({ error: 'discord auth not configured' }, 503);

    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirect_uri || '',
      }),
    }).then(r => r.json()).catch(() => null);

    if (!tokenRes?.access_token) return respond({ error: 'discord token exchange failed' }, 401);

    const dcUser = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenRes.access_token}` },
    }).then(r => r.json()).catch(() => null);

    if (!dcUser?.id) return respond({ error: 'could not fetch discord user' }, 401);
    if (!dcUser.verified) return respond({ error: 'discord email not verified' }, 401);

    const email   = (dcUser.email || '').toLowerCase();
    if (!email) return respond({ error: 'no email on discord account' }, 401);

    const sub     = `discord:${dcUser.id}`;
    const name    = dcUser.global_name || dcUser.username || '';
    const picture = dcUser.avatar
      ? `https://cdn.discordapp.com/avatars/${dcUser.id}/${dcUser.avatar}.png`
      : '';

    const denied = await denyAccess(email);
    if (denied) return respond({ error: denied }, 403);

    await env.DB.prepare(`
      INSERT INTO visitors (google_sub, email, name, picture)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(google_sub) DO UPDATE SET
        email = excluded.email,
        name  = excluded.name,
        picture = excluded.picture,
        visit_count = visit_count + 1,
        last_seen = datetime('now')
    `).bind(sub, email, name, picture).run();

    const visitor = await env.DB.prepare(
      'SELECT id, is_banned FROM visitors WHERE google_sub = ? OR google_sub = \'banned:\' || ?'
    ).bind(sub, sub).first();
    if (visitor?.is_banned) return respond({ error: 'account_banned' }, 403);

    const { token: sessionToken } = await newSession(visitor.id);

    return respond({ ok: true, email, name, picture, session_token: sessionToken });
  }

  if (route === 'auth/google' && method === 'POST') {
    const ggEnabled = await env.DB.prepare("SELECT value FROM site_settings WHERE key='auth_google'").first().catch(()=>null);
    if (ggEnabled?.value === '0') return respond({ error: 'google sign-in is disabled' }, 403);

    const { token } = await request.json().catch(() => ({}));
    if (!token) return respond({ error: 'token required' }, 400);

    const clientId = env.GOOGLE_CLIENT_ID || '';
    if (!clientId) return respond({ error: 'google auth not configured' }, 503);

    const info = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`)
      .then(r => r.json()).catch(() => null);

    if (!info || info.error_description || info.aud !== clientId)
      return respond({ error: 'invalid token' }, 401);

    const email = (info.email || '').toLowerCase();
    if (!email || !info.email_verified) return respond({ error: 'email unverified' }, 401);

    const name    = info.name    || '';
    const picture = info.picture || '';
    const sub     = info.sub     || '';

    const denied = await denyAccess(email);
    if (denied) return respond({ error: denied }, 403);

    await env.DB.prepare(`
      INSERT INTO visitors (google_sub, email, name, picture)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(google_sub) DO UPDATE SET
        email = excluded.email,
        name  = excluded.name,
        picture = excluded.picture,
        visit_count = visit_count + 1,
        last_seen = datetime('now')
    `).bind(sub, email, name, picture).run();

    const visitor = await env.DB.prepare(
      'SELECT id, is_banned FROM visitors WHERE google_sub = ? OR google_sub = \'banned:\' || ?'
    ).bind(sub, sub).first();
    if (visitor?.is_banned) return respond({ error: 'account_banned' }, 403);

    const { token: sessionToken } = await newSession(visitor.id);

    return respond({ ok: true, email, name, picture, session_token: sessionToken });
  }

  return null;
}
