

const VERSION = __VERSION__;

try { if (!localStorage.getItem('foyer_cleared_v1')) { localStorage.clear(); localStorage.setItem('foyer_cleared_v1', '1'); } } catch {}

const KEY = 'foyer_admin_token';

const _ls = (() => {
  try { localStorage.getItem('_t'); return localStorage; }
  catch { const m = {}; return { getItem: k => m[k] ?? null, setItem: (k,v) => { m[k] = String(v); }, removeItem: k => { delete m[k]; } }; }
})();
let token = '';
try { token = _ls.getItem(KEY) || ''; } catch { token = ''; }



if (window.foyerToast) {
  window.foyerToast.configure({ theme: 'colored', autoClose: 4000, position: 'top-right' });
}




function classifyToast(msg, isErr) {
  const m = String(msg == null ? '' : msg).toLowerCase();
  if (isErr) {
    if (/(required|\bfirst\b|pick a|pick or|select |type a|no page|not supported|coming soon|isn'?t configured|not configured|too large|denied|permission|max )/.test(m)) return 'warning';
    return 'error';
  }
  if (/(discard|no unsaved|no changes|copied|moved to|sub-page|top level|pushed|fixed format|builds block|added to nav|removed from nav|skipped|^restored unsaved)/.test(m)) return 'info';
  return 'success';
}




function toast(msg, isErr, opts) {
  if (window.foyerToast) {
    opts = opts || {};
    const type = opts.type || classifyToast(msg, isErr);
    return window.foyerToast(msg, Object.assign({ type }, opts));
  }
  const shelf = document.getElementById('toast-shelf');
  if (!shelf) return;
  const t = document.createElement('div');
  t.className = 'toast' + (isErr ? ' err' : '');
  t.textContent = msg;
  shelf.appendChild(t);
  requestAnimationFrame(() => { requestAnimationFrame(() => { t.classList.add('show'); }); });
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 250);
  }, 2800);
}


if (window.foyerToast) {
  ['success', 'error', 'info', 'warning', 'warn', 'dark', 'loading', 'promise', 'update', 'dismiss', 'isActive'].forEach(function (k) {
    toast[k] = window.foyerToast[k].bind(window.foyerToast);
  });
}

const dlg = (() => {
  function show({ title, message, buttons }) {
    return new Promise(resolve => {
      const backdrop = document.createElement('div');
      backdrop.style.cssText = 'position:fixed;inset:0;z-index:99990;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center;padding:1.5rem;';
      backdrop.innerHTML = `
        <div style="background:var(--panel);border:1px solid rgba(var(--accent-rgb),.18);max-width:360px;width:100%;padding:1.6rem 1.8rem;">
          ${title ? `<p style="font-family:'Unbounded',sans-serif;font-weight:200;font-size:.78rem;color:#f0f7f1;margin-bottom:.6rem;">${escHtml(title)}</p>` : ''}
          <p style="font-weight:200;font-size:.75rem;line-height:1.75;color:rgba(220,245,225,.75);margin-bottom:1.4rem;">${escHtml(message)}</p>
          <div style="display:flex;gap:.6rem;justify-content:flex-end;" id="_dlgBtns"></div>
        </div>`;
      const btnRow = backdrop.querySelector('#_dlgBtns');
      buttons.forEach(({ label, value, style }) => {
        const b = document.createElement('button');
        b.textContent = label;
        b.style.cssText = `font-family:'Josefin Sans',sans-serif;font-weight:200;font-size:.58rem;letter-spacing:.2em;text-transform:uppercase;padding:.45rem 1.2rem;border:1px solid ${style==='danger'?'rgba(200,60,60,.4)':style==='primary'?'rgba(var(--accent-rgb),.5)':'rgba(var(--accent-rgb),.2)'};background:transparent;color:${style==='danger'?'rgba(200,80,80,.85)':style==='primary'?'rgba(var(--accent-rgb),.9)':'rgba(var(--muted-rgb),.5)'};cursor:pointer;`;
        b.addEventListener('click', () => { backdrop.remove(); resolve(value); });
        btnRow.appendChild(b);
      });
      document.body.appendChild(backdrop);
    });
  }
  return {
    confirm: (msg, opts = {}) => show({
      title: opts.title,
      message: msg,
      buttons: [
        { label: opts.cancel || 'Cancel', value: false, style: 'ghost' },
        { label: opts.confirm || 'Confirm', value: true, style: opts.danger ? 'danger' : 'primary' },
      ],
    }),
    alert: (msg, opts = {}) => show({
      title: opts.title,
      message: msg,
      buttons: [{ label: 'OK', value: true, style: 'primary' }],
    }),
  };
})();

let sessionToken = '';  // set when admin access is granted via an OAuth (main-site) session
function authHeaders() {
  if (sessionToken) return { 'X-Session-Token': sessionToken };
  return { 'Authorization': `Bearer ${token}` };
}
function mainSiteSessionToken() {
  try { return (JSON.parse(_ls.getItem('foyer_session') || 'null') || {}).session_token || ''; }
  catch { return ''; }
}

function timeAgo(str) {
  const d = new Date(str.endsWith('Z') ? str : str + 'Z');
  const s = Math.floor((Date.now() - d) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s/60); if (m < 60) return m+'m ago';
  const h = Math.floor(m/60); if (h < 24) return h+'h ago';
  return Math.floor(h/24)+'d ago';
}

function escHtml(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function escAttr(s) { return String(s||'').replace(/"/g,'&quot;'); }

function insertAtCursor(ta, text) {
  if (!ta) return;
  const start = ta.selectionStart ?? ta.value.length;
  const end   = ta.selectionEnd ?? ta.value.length;
  ta.value = ta.value.slice(0, start) + text + ta.value.slice(end);
  const pos = start + text.length;
  ta.selectionStart = ta.selectionEnd = pos;
  ta.focus();
  ta.dispatchEvent(new Event('input'));
}

function mdWrap(ta, before, after, ph) {
  const s = ta.selectionStart, e = ta.selectionEnd;
  const sel = ta.value.slice(s, e) || ph || '';
  ta.value = ta.value.slice(0, s) + before + sel + after + ta.value.slice(e);
  ta.selectionStart = s + before.length;
  ta.selectionEnd = s + before.length + sel.length;
  ta.focus();
  ta.dispatchEvent(new Event('input'));
}
function mdPrefixLine(ta, prefix) {
  const s = ta.selectionStart;
  const lineStart = ta.value.lastIndexOf('\n', s - 1) + 1;
  ta.value = ta.value.slice(0, lineStart) + prefix + ta.value.slice(lineStart);
  ta.selectionStart = ta.selectionEnd = s + prefix.length;
  ta.focus();
  ta.dispatchEvent(new Event('input'));
}
function mdToolbarHTML() {
  return `<div class="md-toolbar">
    <button type="button" data-md="bold" title="Bold"><b>B</b></button>
    <button type="button" data-md="italic" title="Italic"><i>I</i></button>
    <button type="button" data-md="h2" title="Heading">H</button>
    <button type="button" data-md="link" title="Link">↗</button>
    <button type="button" data-md="ul" title="Bulleted list">•</button>
    <button type="button" data-md="quote" title="Quote">❝</button>
    <button type="button" data-md="code" title="Code">&lt;/&gt;</button>
    <button type="button" data-md="image" title="Embed image">🖼</button>
  </div>`;
}

function wireMdToolbar(scope, ta, onChange) {
  scope.querySelectorAll('.md-toolbar [data-md]').forEach(btn => {
    btn.addEventListener('click', () => {
      const a = btn.dataset.md;
      if (a === 'bold')        mdWrap(ta, '**', '**', 'bold text');
      else if (a === 'italic') mdWrap(ta, '*', '*', 'italic');
      else if (a === 'code')   mdWrap(ta, '`', '`', 'code');
      else if (a === 'link')   mdWrap(ta, '[', '](https://)', 'link text');
      else if (a === 'h2')     mdPrefixLine(ta, '## ');
      else if (a === 'ul')     mdPrefixLine(ta, '- ');
      else if (a === 'quote')  mdPrefixLine(ta, '> ');
      else if (a === 'image')  {
        openImgPicker(async url => {
          const w = await pickImageSize();
          if (!w) return;
          insertAtCursor(ta, `\n\n<img src="${url}" alt="" style="display:block;margin:1.4em auto;width:${w};max-width:100%;border-radius:6px;" />\n\n`);
          onChange && onChange();
        });
        return;
      }
      onChange && onChange();
    });
  });
}

function pickImageSize() {
  return new Promise(resolve => {
    const opts = [['Small','35%'],['Medium','60%'],['Large','85%'],['Full width','100%']];
    const bd = document.createElement('div');
    bd.style.cssText = 'position:fixed;inset:0;z-index:99991;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center;padding:1.5rem;';
    bd.innerHTML = `<div style="background:var(--panel);border:1px solid rgba(var(--accent-rgb),.18);max-width:340px;width:100%;padding:1.6rem 1.8rem;">
      <p style="font-family:'Unbounded',sans-serif;font-weight:200;font-size:.78rem;color:#f0f7f1;margin-bottom:1rem;">Image size</p>
      <div style="display:flex;flex-direction:column;gap:.5rem;">
        ${opts.map(([l,w])=>`<button data-w="${w}" style="text-align:left;padding:.6rem .9rem;border:1px solid rgba(var(--accent-rgb),.2);background:transparent;color:rgba(220,245,225,.8);cursor:pointer;font-family:'Josefin Sans',sans-serif;font-weight:200;font-size:.74rem;">${l} <span style="color:var(--muted);font-size:.62rem;">${w}</span></button>`).join('')}
      </div>
      <button data-w="" style="margin-top:1rem;width:100%;padding:.45rem;border:1px solid rgba(var(--accent-rgb),.15);background:transparent;color:rgba(var(--muted-rgb),.4);cursor:pointer;font-family:'Josefin Sans',sans-serif;font-size:.58rem;letter-spacing:.2em;text-transform:uppercase;">Cancel</button>
    </div>`;
    bd.querySelectorAll('[data-w]').forEach(b => b.addEventListener('click', () => { bd.remove(); resolve(b.dataset.w || null); }));
    document.body.appendChild(bd);
  });
}

const UI_VERSION_KEY = 'foyer_admin_ui_version';
let _updateShown = false;

function showUpdateOverlay(pendingUiVersion, newVer) {
  if (_updateShown) return;
  _updateShown = true;
  const cacheNewVersion = () => { if (pendingUiVersion) _ls.setItem(UI_VERSION_KEY, pendingUiVersion); };

  const isFoyer = !pendingUiVersion;

  const knownVer = isFoyer ? VERSION : (_ls.getItem(UI_VERSION_KEY) || VERSION);
  const _fIcon = (w, h, style) => `<svg viewBox="0 0 44 50" width="${w}" height="${h}" fill="none" stroke="rgba(var(--accent-rgb),.85)" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;${style || ''}"><path d="M5 46 V24 a16 16 0 0 1 32 0 V46"/><path d="M15 46 V28 a6 6 0 0 1 12 0 V46"/></svg>`;

  const island = document.createElement('div');
  island.id = '_ver_island';
  island.style.cssText = [
    'position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:99999;',
    'background:var(--bg);border:1px solid rgba(var(--accent-rgb),.25);',
    'border-radius:999px;overflow:hidden;',
    'display:flex;align-items:center;justify-content:center;gap:.6rem;',
    'padding:0 1.2rem;',
    'width:44px;height:44px;',
    'transition:width .4s cubic-bezier(.16,1,.3,1),height .4s cubic-bezier(.16,1,.3,1),padding .4s cubic-bezier(.16,1,.3,1);',
    'font-family:"Josefin Sans",sans-serif;',
  ].join('');
  island.innerHTML = `
    ${isFoyer ? _fIcon(16, 18, 'opacity:.8;') : '<img src="/icons/favicon.svg" width="18" height="18" style="flex-shrink:0;opacity:.7;border-radius:6px;" alt="" />'}
    <div id="_isl_text" style="overflow:hidden;max-width:0;opacity:0;transition:max-width .35s cubic-bezier(.16,1,.3,1) .1s,opacity .3s ease .15s;white-space:nowrap;">
      <div style="font-weight:300;font-size:.68rem;letter-spacing:.06em;color:rgba(220,245,225,.9);">${isFoyer ? 'Foyer Updated' : 'Admin Updated'}</div>
      <div style="font-weight:100;font-size:.55rem;letter-spacing:.15em;color:rgba(var(--accent-rgb),.65);margin-top:.1rem;">Save your work</div>
    </div>`;
  document.body.appendChild(island);

  requestAnimationFrame(() => requestAnimationFrame(() => {
    island.style.width = '220px';
    island.style.height = '52px';
    const txt = island.querySelector('#_isl_text');
    if (txt) { txt.style.maxWidth = '160px'; txt.style.opacity = '1'; }
  }));

  setTimeout(() => {
    cacheNewVersion();
    island.style.opacity = '0';
    island.style.transform = 'translateX(-50%) scale(.85)';
    island.style.transition += ',opacity .3s ease,transform .3s ease';
    setTimeout(() => island.remove(), 320);

    const el = document.createElement('div');
    el.id = '_ver_overlay';
    el.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(var(--bg-rgb),.0);display:flex;align-items:center;justify-content:center;font-family:"Josefin Sans",sans-serif;transition:background .4s ease;';
    el.innerHTML = `
      <div style="text-align:center;max-width:320px;padding:2rem;opacity:0;transform:translateY(12px);transition:opacity .4s ease,transform .4s ease;">
        ${isFoyer ? _fIcon(28, 32, 'margin-bottom:1.4rem;opacity:.65;') : '<img src="/icons/favicon.svg" width="32" height="32" style="margin-bottom:1.4rem;opacity:.55;border-radius:6px;" alt="" />'}
        <p style="font-family:'Unbounded',sans-serif;font-weight:200;font-size:.82rem;color:rgba(220,245,225,.9);margin-bottom:.5rem;">${isFoyer ? 'Foyer has updated' : 'Admin Updated'}</p>
        <p style="font-weight:100;font-size:.65rem;letter-spacing:.06em;color:rgba(var(--muted-rgb),.4);margin-bottom:1.8rem;line-height:1.9;">A new version is available.<br>Save your work before the page reloads.</p>
        <button id="_verReloadBtn" style="font-family:'Josefin Sans',sans-serif;font-weight:200;font-size:.62rem;letter-spacing:.25em;text-transform:uppercase;padding:.6rem 2rem;border:1px solid rgba(var(--accent-rgb),.35);background:transparent;color:rgba(var(--accent-rgb),.8);cursor:pointer;">Reload Now</button>
        <p id="_verCount" style="margin-top:.9rem;font-size:.52rem;font-weight:100;color:rgba(var(--muted-rgb),.25);letter-spacing:.1em;"></p>
        <p style="margin-top:1.4rem;font-size:.5rem;font-weight:200;color:rgba(var(--muted-rgb),.35);letter-spacing:.12em;font-variant-numeric:tabular-nums;">${knownVer}<span style="opacity:.45;margin:0 .5rem;">|</span>${newVer || '—'}</p>
      </div>`;
    document.body.appendChild(el);

    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.background = 'rgba(var(--bg-rgb),.93)';
      const inner = el.firstElementChild;
      if (inner) { inner.style.opacity = '1'; inner.style.transform = 'translateY(0)'; }
    }));

    el.querySelector('#_verReloadBtn').addEventListener('click', () => location.reload());
    el.querySelector('#_verReloadBtn').addEventListener('mouseover', function() { this.style.background='rgba(var(--accent-rgb),.1)'; });
    el.querySelector('#_verReloadBtn').addEventListener('mouseout', function() { this.style.background='transparent'; });

    let n = 7;
    el.querySelector('#_verCount').textContent = `Auto-reloading in ${n}s`;
    const t = setInterval(() => {
      n--; if (n <= 0) { clearInterval(t); location.reload(); return; }
      const c = el.querySelector('#_verCount');
      if (c) c.textContent = `Auto-reloading in ${n}s`;
    }, 1000);
  }, 3000);
}

(function startVersionPoll() {


  const sysVersion = async () => {
    try {
      const r = await fetch('/api/sb/version', { cache: 'no-store' });
      if (r.ok) return (await r.json()).version || null;
    } catch {}
    return null;
  };

  const seedUiVersion = async () => {
    const data = await fetch('/api/version').then(r => r.json()).catch(() => null);
    if (data?.ui_version && !_ls.getItem(UI_VERSION_KEY)) {
      _ls.setItem(UI_VERSION_KEY, data.ui_version);
    }
  };
  seedUiVersion();

  const id = setInterval(async () => {
    if (_updateShown || _rateLimited) { clearInterval(id); return; }

    const sys = await sysVersion();
    if (sys && sys !== VERSION) {
      let tried = null; try { tried = sessionStorage.getItem('foyer_sys_reloaded'); } catch {}
      if (tried !== sys) { try { sessionStorage.setItem('foyer_sys_reloaded', sys); } catch {} showUpdateOverlay(undefined, sys); return; }
    }

    const r = await fetch('/api/version').catch(() => null);
    if (check429(r)) { clearInterval(id); return; }
    const data = await (r ? r.json().catch(() => null) : null);
    if (!data) return;
    const storedUi = _ls.getItem(UI_VERSION_KEY);
    if (data.ui_version && storedUi && data.ui_version !== storedUi) { showUpdateOverlay(data.ui_version, data.ui_version); return; }
  }, 10000);
})();

let _rateLimited = false;
function enterRateLimitMode() {
  if (_rateLimited) return;
  _rateLimited = true;
  dismissAdminLoading();
  if (!document.getElementById('rl-screen')) {
    const el = document.createElement('div');
    el.id = 'rl-screen';
    el.style.cssText = 'position:fixed;inset:0;z-index:9998;background:var(--bg);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:1.2rem;font-family:"Josefin Sans",sans-serif;';
    el.innerHTML = `
      <img src="/icons/favicon.svg" width="36" height="36" style="opacity:.4;border-radius:6px;" alt="" />
      <p style="font-weight:100;font-size:.55rem;letter-spacing:.35em;text-transform:uppercase;color:rgba(230,200,90,.75);">Rate Limited</p>
      <p style="font-weight:200;font-size:.72rem;letter-spacing:.06em;color:rgba(var(--muted-rgb),.35);max-width:320px;text-align:center;line-height:1.9;">Too many requests right now. The panel will recover automatically.</p>`;
    document.body.appendChild(el);
  }
  const rec = setInterval(async () => {
    const r = await fetch('/api/version').catch(() => null);
    if (r && r.status !== 429) { clearInterval(rec); location.reload(); }
  }, 60000);
}
function check429(r) { if (r && r.status === 429) { enterRateLimitMode(); return true; } return false; }

async function pushUiUpdate() {
  const btn = document.getElementById('pushUiUpdateBtn');
  if (btn) { btn.textContent = 'Pushing…'; btn.disabled = true; }

  const cur = await fetch('/api/version').then(r => r.json()).catch(() => null);
  const newVer = String((parseInt(cur?.ui_version || '0', 10) || 0) + 1);

  const res = await fetch('/api/version', {
    method: 'PUT',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ ui: newVer }),
  });
  if (res.ok) {
    _ls.setItem(UI_VERSION_KEY, newVer); // exempt ourselves from reload
    if (btn) {
      btn.textContent = '✓ Pushed!';
      btn.style.color = 'var(--accent)';
      btn.style.borderColor = 'rgba(var(--accent-rgb),.5)';
      setTimeout(() => {
        btn.textContent = 'Push UI Update ↑';
        btn.style.color = btn.style.borderColor = '';
        btn.disabled = false;
      }, 2500);
    }
    toast('UI update pushed — visitors will reload shortly');
  } else {
    if (btn) { btn.textContent = 'Push UI Update ↑'; btn.disabled = false; }
    dlg.alert('Failed to push update.');
  }
}

function dismissAdminLoading() {
  const ld = document.getElementById('admin-loading');
  if (ld) { ld.classList.add('out'); setTimeout(() => ld.remove(), 420); }
}

function showLoginScreen() {
  dismissAdminLoading();
  const ls = document.getElementById('loginScreen');
  if (ls) { ls.classList.add('show'); setTimeout(() => document.getElementById('pw')?.focus(), 100); }
  enableLoginMagic();
}

let _loginMagicWired = false;
async function enableLoginMagic() {
  const wrap = document.getElementById('loginMagicWrap');
  if (!wrap || _loginMagicWired) return;
  const [cfg, settings] = await Promise.all([
    fetch('/api/config').then(r => r.json()).catch(() => ({})),
    fetch('/api/settings').then(r => r.json()).catch(() => ({})),
  ]);
  if (!cfg.magic_enabled || settings.auth_magic === '0') return;
  _loginMagicWired = true;
  wrap.style.display = '';
  const form = document.getElementById('loginMagicForm');
  const input = document.getElementById('loginMagicEmail');
  const btn = document.getElementById('loginMagicBtn');
  const err = document.getElementById('loginMagicErr');
  const sent = document.getElementById('loginMagicSent');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const email = (input.value || '').trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { err.textContent = 'Enter a valid email.'; err.style.display = 'block'; return; }
    err.style.display = 'none';
    btn.disabled = true; btn.textContent = 'Sending…';
    const data = await fetch('/api/auth/magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, redirect: 'admin' }),
    }).then(r => r.json()).catch(() => null);
    if (data?.ok) {
      input.style.display = 'none';
      btn.style.display = 'none';
      sent.textContent = 'Check your inbox — open the link on any device. This page will sign in automatically.';
      sent.style.display = 'block';
      if (data.request_id) pollLoginMagic(data.request_id, sent);
    } else {
      btn.disabled = false; btn.textContent = 'Email me a link';
      err.textContent = data?.error || 'Could not send link. Try again.';
      err.style.display = 'block';
    }
  });
}

function pollLoginMagic(requestId, sentEl) {
  const id = setInterval(async () => {
    const s = await fetch('/api/auth/magic-link/status', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request_id: requestId }),
    }).then(r => r.json()).catch(() => null);
    if (!s) return;
    if (s.status === 'approved') {
      clearInterval(id);

      _ls.setItem('foyer_session', JSON.stringify({ email: s.email, name: s.name, picture: s.picture, session_token: s.session_token, ts: Date.now() }));
      const r = await fetch('/api/admin-check', { headers: { 'X-Session-Token': s.session_token } }).then(x => x.json()).catch(() => null);
      if (r && (r.role === 'admin' || r.role === 'owner')) {
        sessionToken = s.session_token;
        if (sentEl) sentEl.textContent = 'Approved! Opening the panel…';
        setTimeout(boot, 500);
      } else if (sentEl) {
        sentEl.textContent = "Signed in, but this account doesn't have admin access.";
      }
    } else if (s.status === 'expired') {
      clearInterval(id);
      if (sentEl) sentEl.textContent = 'That link expired before it was used. Refresh to try again.';
    }
  }, 2500);
}

let _adminActive = false;   // true once the panel is shown; gates the 401 re-auth guard
async function boot() {
  const loginScreen = document.getElementById('loginScreen');
  const app = document.getElementById('app');
  dismissAdminLoading();
  if (loginScreen) { loginScreen.classList.add('out'); setTimeout(()=>loginScreen.remove(),450); }
  app.classList.add('visible');
  _adminActive = true;
  if (typeof foyerTermsGate === 'function') await foyerTermsGate();   // must accept Terms + Privacy first
  await fetchSettings();
  await fetchImages();
  renderImgTabGallery();
  bldBoot(); bldLoadPages();
}




let _reauthShown = false;
function showReauthScreen() {
  if (_reauthShown) return;
  _reauthShown = true;
  const el = document.createElement('div');
  el.id = 'reauth-screen';
  el.style.cssText = 'position:fixed;inset:0;z-index:99996;background:rgba(var(--bg-rgb),.97);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:1.3rem;font-family:"Josefin Sans",sans-serif;padding:2rem;';
  el.innerHTML = `
    <img src="/icons/favicon.svg" width="36" height="36" style="opacity:.45;border-radius:6px;" alt="" />
    <p style="font-weight:100;font-size:.55rem;letter-spacing:.35em;text-transform:uppercase;color:rgba(220,160,90,.8);">Something's not right</p>
    <p style="font-weight:200;font-size:.74rem;letter-spacing:.04em;line-height:1.9;color:rgba(var(--muted-rgb),.45);max-width:320px;text-align:center;">Your session isn't valid on the server. Please sign in again to continue.</p>
    <button id="reauthBtn" class="btn btn-primary btn-sm">Sign in with OAuth</button>
    <button id="reauthPwBtn" class="btn btn-sm">Use password instead</button>`;
  document.body.appendChild(el);
  el.querySelector('#reauthBtn').addEventListener('click', async () => {
    const st = mainSiteSessionToken();
    if (st) {
      const r = await _origFetch('/api/admin-check', { headers: { 'X-Session-Token': st } }).then(x => x.json()).catch(() => null);
      if (r && (r.role === 'admin' || r.role === 'owner')) { sessionToken = st; _reauthShown = false; el.remove(); location.reload(); return; }
    }
    location.href = '/?admin_return=1';
  });
  el.querySelector('#reauthPwBtn').addEventListener('click', () => {
    _ls.removeItem(KEY); _ls.removeItem('foyer_session'); location.reload();
  });
}

const _origFetch = window.fetch.bind(window);
window.fetch = async (...args) => {
  const res = await _origFetch(...args);
  try {
    const url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url) || '';
    if (_adminActive && res.status === 401 && url.includes('/api/')
        && !url.includes('/api/auth') && !url.includes('/api/admin-check')) {
      showReauthScreen();
    }
  } catch {}
  return res;
};

document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const pw=document.getElementById('pw').value;

  const st = mainSiteSessionToken();
  const headers = { 'Content-Type':'application/json' };
  if (st) headers['X-Session-Token'] = st;
  const res=await fetch('/api/auth',{method:'POST',headers,body:JSON.stringify({password:pw})});
  if (res.ok) { token=pw; _ls.setItem(KEY,token); document.getElementById('loginErr').style.display='none'; boot(); }
  else { document.getElementById('loginErr').style.display='block'; document.getElementById('pw').value=''; document.getElementById('pw').focus(); }
});


document.getElementById('oauthSignInBtn')?.addEventListener('click', async () => {
  const errEl = document.getElementById('oauthErr');
  if (errEl) errEl.style.display = 'none';
  const st = mainSiteSessionToken();
  if (st) {
    const r = await fetch('/api/admin-check', { headers: { 'X-Session-Token': st } }).then(x => x.json()).catch(() => null);
    if (r && (r.role === 'admin' || r.role === 'owner')) { sessionToken = st; boot(); return; }
    if (errEl) errEl.style.display = 'block';   // signed in, but no admin access
    return;
  }

  location.href = '/?admin_return=1';
});

async function adminLogout() {
  if (!await dlg.confirm('Log out of the admin panel?', { confirm: 'Log out' })) return;
  _ls.removeItem(KEY);              // password token
  if (sessionToken) _ls.removeItem('foyer_session');  // OAuth session (full sign-out)
  token = ''; sessionToken = '';
  location.reload();
}
document.getElementById('logoutBtn')?.addEventListener('click', adminLogout);



function foyerOfflineWatch() {
  async function chk() {
    try {
      const r = await fetch('/api/sb/site', { cache: 'no-store' });
      if (r.ok) { const s = await r.json(); if (s && (s.offline === true || s.licensed === false)) location.replace('/offline'); }
    } catch {}
  }
  chk();
  setInterval(chk, 30000);
}

async function init() {
  foyerOfflineWatch();

  const st = mainSiteSessionToken();
  if (st) {
    const r = await fetch('/api/admin-check', { headers: { 'X-Session-Token': st } }).then(x => x.json()).catch(() => null);
    if (r && (r.role === 'admin' || r.role === 'owner')) {
      sessionToken = st;
      boot();
      return;
    }
  }

  if (token) {
    const res = await fetch('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:token})}).catch(()=>null);
    if (res && res.ok) { boot(); return; }
    _ls.removeItem(KEY);
  }

  showLoginScreen();
}
