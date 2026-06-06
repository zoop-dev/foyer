    function sessionHeaders(session) {
      return session?.session_token ? { 'X-Session-Token': session.session_token } : {};
    }

    function expireAndReload() {
      localStorage.removeItem(SESSION_KEY);
      location.reload();
    }

    const UI_VERSION_KEY = 'foyer_ui_version';
    let _updateShown = false;

    function showUpdateOverlay(pendingUiVersion, newVer) {
      if (_updateShown) return;
      _updateShown = true;


      const cacheNewVersion = () => { if (pendingUiVersion) localStorage.setItem(UI_VERSION_KEY, pendingUiVersion); };


      const isFoyer = !pendingUiVersion;
      const _fIcon = (w, h, style) => `<svg viewBox="0 0 44 50" width="${w}" height="${h}" fill="none" stroke="rgba(var(--site-accent-rgb),.85)" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;${style || ''}"><path d="M5 46 V24 a16 16 0 0 1 32 0 V46"/><path d="M15 46 V28 a6 6 0 0 1 12 0 V46"/></svg>`;

      const island = document.createElement('div');
      island.id = '_ver_island';
      island.style.cssText = [
        'position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:9998;',
        'background:var(--site-bg);border:1px solid rgba(var(--site-accent-rgb),.25);',
        'border-radius:999px;overflow:hidden;',
        'display:flex;align-items:center;justify-content:center;gap:.6rem;',
        'padding:0 1.2rem;width:44px;height:44px;',
        'transition:width .4s cubic-bezier(.16,1,.3,1),height .4s cubic-bezier(.16,1,.3,1),padding .4s cubic-bezier(.16,1,.3,1);',
        'font-family:"Josefin Sans",sans-serif;',
      ].join('');
      island.innerHTML = `
        ${isFoyer ? _fIcon(16, 18, 'opacity:.8;') : '<img src="/icons/favicon.svg" width="18" height="18" style="flex-shrink:0;opacity:.7;border-radius:5px;" alt="" />'}
        <div id="_isl_text" style="overflow:hidden;max-width:0;opacity:0;transition:max-width .35s cubic-bezier(.16,1,.3,1) .1s,opacity .3s ease .15s;white-space:nowrap;">
          <div style="font-weight:300;font-size:.68rem;letter-spacing:.06em;color:rgba(220,245,225,.9);">${isFoyer ? 'Foyer Updated' : 'Site Updated'}</div>
          <div style="font-weight:100;font-size:.55rem;letter-spacing:.15em;color:rgba(var(--site-accent-rgb),.65);margin-top:.1rem;">Save your progress</div>
        </div>`;
      document.body.appendChild(island);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        island.style.width = '210px';
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
        el.style.cssText = 'position:fixed;inset:0;z-index:9997;background:rgba(var(--site-bg-rgb),0);display:flex;align-items:center;justify-content:center;font-family:"Josefin Sans",sans-serif;transition:background .4s ease;';
        el.innerHTML = `
          <div style="text-align:center;max-width:300px;padding:2rem;opacity:0;transform:translateY(12px);transition:opacity .4s ease,transform .4s ease;">
            ${isFoyer ? _fIcon(25, 28, 'margin-bottom:1.4rem;opacity:.6;') : '<img src="/icons/favicon.svg" width="28" height="28" style="margin-bottom:1.4rem;opacity:.5;border-radius:6px;" alt="" />'}
            <p style="font-weight:100;font-size:.55rem;letter-spacing:.35em;text-transform:uppercase;color:rgba(var(--site-accent-rgb),.6);margin-bottom:.5rem;">Updated</p>
            <p style="font-weight:200;font-size:.7rem;letter-spacing:.04em;color:rgba(var(--site-muted-rgb),.4);line-height:1.9;margin-bottom:1.6rem;">${isFoyer ? 'Foyer has updated.<br>Reloading shortly.' : 'New content is available.<br>Reloading shortly.'}</p>
            <button id="_verBtn" style="font-family:'Josefin Sans',sans-serif;font-weight:200;font-size:.6rem;letter-spacing:.25em;text-transform:uppercase;padding:.55rem 1.8rem;border:1px solid rgba(var(--site-accent-rgb),.35);background:transparent;color:rgba(var(--site-accent-rgb),.8);cursor:pointer;">Reload Now</button>
            <p id="_verCount" style="margin-top:.8rem;font-size:.52rem;font-weight:100;color:rgba(var(--site-muted-rgb),.25);letter-spacing:.08em;"></p>
            <p style="margin-top:1.3rem;font-size:.5rem;font-weight:200;color:rgba(var(--site-muted-rgb),.35);letter-spacing:.12em;font-variant-numeric:tabular-nums;">${VERSION}<span style="opacity:.45;margin:0 .5rem;">|</span>${newVer || '—'}</p>
          </div>`;
        document.body.appendChild(el);
        requestAnimationFrame(() => requestAnimationFrame(() => {
          el.style.background = 'rgba(var(--site-bg-rgb),.93)';
          const inner = el.firstElementChild;
          if (inner) { inner.style.opacity = '1'; inner.style.transform = 'translateY(0)'; }
        }));
        el.querySelector('#_verBtn').addEventListener('click', () => location.reload());
        let n = 7;
        el.querySelector('#_verCount').textContent = `Auto-reloading in ${n}s`;
        const t = setInterval(() => {
          n--; if (n <= 0) { clearInterval(t); location.reload(); return; }
          const c = el.querySelector('#_verCount');
          if (c) c.textContent = `Auto-reloading in ${n}s`;
        }, 1000);
      }, 3000);
    }

    function startVersionPoll() {



      async function sysVersion() {
        try {
          const r = await fetch('/api/sb/version', { cache: 'no-store' });
          if (r.ok) return (await r.json()).version || null;
        } catch {}
        return null;
      }

      fetch('/api/version').then(r => r.json()).then(data => {
        if (data?.ui_version && !localStorage.getItem(UI_VERSION_KEY)) {
          localStorage.setItem(UI_VERSION_KEY, data.ui_version);
        }
      }).catch(() => {});

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
        const storedUi = localStorage.getItem(UI_VERSION_KEY);
        if (data.ui_version && storedUi && data.ui_version !== storedUi) { showUpdateOverlay(data.ui_version, data.ui_version); return; }
      }, 10000);
    }

    async function protectedFetch(url, session) {
      const r = await fetch(url, { headers: sessionHeaders(session) }).catch(() => null);
      if (!r) return null;
      if (check429(r)) return null;
      if (r.status === 403) {
        const d = await r.json().catch(() => ({}));
        if (d?.error === 'account_banned') { showBannedScreen(); return null; }
      }
      if (r.status === 401) {
        if (session) expireAndReload(); else showAuthWall();
        return null;
      }
      return r.json().catch(() => null);
    }

    function showBannedScreen() {
      dismissLoading();
      const el = document.createElement('div');
      el.id = 'banned-screen';
      el.style.cssText = 'position:fixed;inset:0;z-index:9997;background:var(--site-bg);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:1.2rem;font-family:"Josefin Sans",sans-serif;';
      el.innerHTML = `
        <img src="/icons/favicon.svg" width="36" height="36" style="opacity:.4;border-radius:8px;" alt="" />
        <p style="font-weight:100;font-size:.55rem;letter-spacing:.35em;text-transform:uppercase;color:rgba(200,80,80,.7);">Access Revoked</p>
        <p style="font-weight:200;font-size:.72rem;letter-spacing:.06em;color:rgba(var(--site-muted-rgb),.3);max-width:300px;text-align:center;line-height:1.9;">Your access to this site has been revoked. It may be returned soon.</p>`;
      document.body.appendChild(el);
    }

    let _rateLimited = false;
    function enterRateLimitMode() {
      if (_rateLimited) return;
      _rateLimited = true;            // all guarded polls stop checking the DB
      dismissLoading();
      if (!document.getElementById('rl-screen')) {
        const el = document.createElement('div');
        el.id = 'rl-screen';
        el.style.cssText = 'position:fixed;inset:0;z-index:9997;background:var(--site-bg);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:1.2rem;font-family:"Josefin Sans",sans-serif;';
        el.innerHTML = `
          <img src="/icons/favicon.svg" width="36" height="36" style="opacity:.4;border-radius:8px;" alt="" />
          <p style="font-weight:100;font-size:.55rem;letter-spacing:.35em;text-transform:uppercase;color:rgba(230,200,90,.75);">Rate Limited</p>
          <p style="font-weight:200;font-size:.72rem;letter-spacing:.06em;color:rgba(var(--site-muted-rgb),.35);max-width:320px;text-align:center;line-height:1.9;">Too many requests right now. This will recover on its own in a moment.</p>
          <p id="rl-count" style="font-weight:100;font-size:.55rem;letter-spacing:.1em;color:rgba(var(--site-muted-rgb),.25);"></p>`;
        document.body.appendChild(el);
      }

      const rec = setInterval(async () => {
        const r = await fetch('/api/version').catch(() => null);
        if (r && r.status !== 429) { clearInterval(rec); location.reload(); }
      }, 60000);
    }

    function check429(r) { if (r && r.status === 429) { enterRateLimitMode(); return true; } return false; }

