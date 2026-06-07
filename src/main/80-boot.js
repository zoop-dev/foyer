    const _awBtnStyle = 'display:flex;align-items:center;justify-content:center;gap:.65rem;width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);color:rgba(220,245,220,.82);font-family:\'Josefin Sans\',sans-serif;font-weight:300;font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;padding:.82rem 1.6rem;cursor:pointer;margin-top:.6rem;';

    function showAuthWall() {
      const scene = document.getElementById('scene');
      scene.style.cssText = 'position:fixed;inset:0;z-index:10;display:flex;align-items:center;justify-content:center;background:var(--site-bg);';
      scene.innerHTML = `<div style="text-align:center;font-family:'Josefin Sans',sans-serif;padding:2.5rem;max-width:340px;">
        <p style="font-weight:100;font-size:.52rem;letter-spacing:.42em;text-transform:uppercase;color:rgba(var(--site-accent-rgb),.38);margin-bottom:.9rem;">Access Required</p>
        <p style="font-weight:200;font-size:1rem;letter-spacing:.06em;color:rgba(220,245,225,.82);margin-bottom:.55rem;">Sign in to continue</p>
        <p style="font-weight:100;font-size:.68rem;letter-spacing:.08em;line-height:1.75;color:rgba(var(--site-muted-rgb),.38);margin-bottom:2rem;">You need to authenticate to view this site.</p>
        ${_bootClientId ? '<div id="authWallGoogleBtn" style="display:flex;justify-content:center;margin-bottom:.6rem;"></div>' : ''}
        ${_bootGithubId ? `<button id="authWallGithubBtn" style="${_awBtnStyle}"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>Continue with GitHub</button>` : ''}
        ${_bootDiscordId ? `<button id="authWallDiscordBtn" style="${_awBtnStyle}"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.032.054a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>Continue with Discord</button>` : ''}
      </div>`;
      if (_bootClientId && window.google?.accounts?.id) {
        window.google.accounts.id.renderButton(
          document.getElementById('authWallGoogleBtn'),
          { type: 'standard', theme: 'outline', size: 'large', text: 'continue_with', shape: 'rectangular' }
        );
      }
      if (_bootGithubId) {
        document.getElementById('authWallGithubBtn')?.addEventListener('click', () => {
          const params = new URLSearchParams({ client_id: _bootGithubId, redirect_uri: location.origin, scope: 'user:email', state: 'github' });
          location.href = `https://github.com/login/oauth/authorize?${params}`;
        });
      }
      if (_bootDiscordId) {
        document.getElementById('authWallDiscordBtn')?.addEventListener('click', () => {
          const params = new URLSearchParams({ client_id: _bootDiscordId, redirect_uri: DISCORD_REDIRECT, response_type: 'code', scope: 'identify email', state: 'discord' });
          location.href = `https://discord.com/oauth2/authorize?${params}`;
        });
      }
    }


    function foyerControlPlane() {

      fetch('/api/sb/beat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ version: VERSION }) }).catch(() => {});

      fetch('/api/sb/flags', { cache: 'no-store' }).then(r => r.ok ? r.json() : {}).then(f => { window.foyerFlags = f || {}; }).catch(() => {});


      const checkAnnouncements = () => {
        fetch('/api/sb/announcements', { cache: 'no-store' }).then(r => r.ok ? r.json() : []).then(rows => {
          if (document.getElementById('foyer-ann')) return;   // one banner at a time
          const now = Date.now();
          const a = (rows || []).find(x => {
            if (x.starts_at && new Date(x.starts_at).getTime() > now) return false;
            if (x.ends_at && new Date(x.ends_at).getTime() < now) return false;
            try { if (localStorage.getItem('foyer_ann_dismissed_' + x.id) === '1') return false; } catch {}
            return true;
          });
          if (a) renderAnnouncement(a);
        }).catch(() => {});
      };
      checkAnnouncements();
      setInterval(checkAnnouncements, 60000);

      let errCount = 0;
      const report = (message, stack) => {
        if (errCount >= 5) return; errCount++;
        fetch('/api/sb/err', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message: String(message || '').slice(0, 500), stack: String(stack || '').slice(0, 2000), url: location.href.slice(0, 300) }) }).catch(() => {});
      };
      window.addEventListener('error', e => report(e.message, e.error && e.error.stack));
      window.addEventListener('unhandledrejection', e => report('unhandledrejection: ' + ((e.reason && e.reason.message) || e.reason), e.reason && e.reason.stack));
    }

    function renderAnnouncement(a) {
      if (document.getElementById('foyer-ann')) return;

      const warn = a.level === 'warn';
      const accent = warn ? '#e0b15a' : '#7fa6d8';
      const bar = document.createElement('div');
      bar.id = 'foyer-ann';
      bar.style.cssText = [
        'position:fixed;top:0;left:0;right:0;z-index:9990;',
        'display:flex;align-items:center;justify-content:center;gap:.7rem;',
        'padding:.62rem 2.8rem;font-family:\'Josefin Sans\',system-ui,sans-serif;',
        'font-weight:300;font-size:.72rem;letter-spacing:.05em;line-height:1.5;text-align:center;',
        'background:rgba(13,17,23,0.97);color:#e8edf2;',
        `border-bottom:1px solid ${accent}59;box-shadow:0 2px 22px rgba(0,0,0,.32);`,
        'backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);',
        'transition:transform .45s cubic-bezier(.16,1,.3,1),opacity .4s ease;transform:translateY(-100%);',
      ].join('');
      const mark = document.createElement('span');
      mark.style.cssText = 'flex-shrink:0;display:inline-flex;opacity:.9;';
      mark.innerHTML = `<svg width="12" height="14" viewBox="0 0 44 50" fill="none" stroke="${accent}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 46 V24 a16 16 0 0 1 32 0 V46"/><path d="M15 46 V28 a6 6 0 0 1 12 0 V46"/></svg>`;
      bar.appendChild(mark);
      const span = document.createElement('span'); span.textContent = a.message; bar.appendChild(span);
      const x = document.createElement('button');
      x.textContent = '×'; x.setAttribute('aria-label', 'Dismiss');
      x.style.cssText = 'position:absolute;right:1rem;top:50%;transform:translateY(-50%);background:none;border:none;color:#8b94a6;font-size:1.15rem;cursor:pointer;opacity:.7;line-height:1;transition:opacity .2s,color .2s;';
      x.addEventListener('mouseenter', () => { x.style.opacity = '1'; x.style.color = '#e8edf2'; });
      x.addEventListener('mouseleave', () => { x.style.opacity = '.7'; x.style.color = '#8b94a6'; });
      const dismiss = () => { bar.style.transform = 'translateY(-100%)'; bar.style.opacity = '0'; setTimeout(() => bar.remove(), 460); };
      x.addEventListener('click', () => { try { localStorage.setItem('foyer_ann_dismissed_' + a.id, '1'); } catch {} dismiss(); });
      bar.appendChild(x);
      document.body.appendChild(bar);
      requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.transform = 'translateY(0)'; }));
      if (a.hide_after && a.hide_after > 0) setTimeout(dismiss, a.hide_after * 1000);
    }

    (async function boot() {


      try {
        console.log(
          '%c ∩ foyer %c this site runs on the foyer website architecture · v' + VERSION + ' ',
          'background:linear-gradient(135deg,#eef1f5,#a9b1bd);color:#11151b;font-weight:800;padding:3px 9px;border-radius:4px;letter-spacing:.05em',
          'color:#8b94a6;font-style:italic;padding-left:6px'
        );
      } catch {}






      let _foyerBypass = false;
      try {
        const _u = new URL(location.href);
        if (_u.searchParams.get('__fb')) {
          _foyerBypass = true;
          _u.searchParams.delete('__fb');
          history.replaceState(null, '', _u.pathname + _u.search + _u.hash);
        }
      } catch {}
      function _foyerHideBranding() {
        if (window.__FOYER_NOBRAND) return;
        window.__FOYER_NOBRAND = 1;
        const _st = document.createElement('style'); _st.textContent = '.made-by,.foyer-credit{display:none!important}'; document.head.appendChild(_st);
      }
      async function _foyerCheck() {
        try { const _r = await fetch('/api/sb/site', { cache: 'no-store' }); if (_r.ok) return await _r.json(); } catch {}
        return null;
      }
      function _foyerApply(s) {
        if (!s) return false;
        if (s.hide_branding === true) _foyerHideBranding();
        if (s.offline === true || s.licensed === false) { location.replace('/offline'); return true; }
        return false;
      }
      if (!_foyerBypass) {
        if (_foyerApply(await _foyerCheck())) return;
        setInterval(async () => { _foyerApply(await _foyerCheck()); }, 30000);
      }

      try { foyerControlPlane(); } catch {}


      if ('serviceWorker' in navigator) { try { navigator.serviceWorker.register('/sw.js').catch(() => {}); } catch {} }

      const [cfg, settings] = await Promise.all([
        fetch('/api/config').then(r => r.json()).catch(() => ({})),
        fetch('/api/settings').then(r => r.json()).catch(() => ({})),
      ]);

      let clientId  = settings.auth_google  !== '0' ? (cfg.google_client_id  || '') : '';
      let githubId  = settings.auth_github  !== '0' ? (cfg.github_client_id  || '') : '';
      let discordId = settings.auth_discord !== '0' ? (cfg.discord_client_id || '') : '';
      let magicOn   = settings.auth_magic   !== '0' && !!cfg.magic_enabled;
      let foyerOn   = settings.auth_foyer   === '1';   // Foyer Auth (opt-in)
      const publicMode = settings.site_public === '1' || __SITE__.publicAccess === true;

      try { localStorage.setItem('foyer_public', publicMode ? '1' : '0'); } catch {}
      _bootClientId   = clientId;
      _bootGithubId   = githubId;
      _bootDiscordId  = discordId;


      {
        const _set = (settings.captcha_provider || '').toLowerCase();
        const _pref = (_set === 'turnstile' || _set === 'recaptcha' || _set === 'none') ? _set : (__SITE__.captcha || '').toLowerCase();
        const _ts = cfg.turnstile_site_key || '', _rc = cfg.recaptcha_site_key || '';
        if (_pref === 'none') _bootCaptcha = { provider: '', key: '' };
        else if (_pref === 'recaptcha' && _rc) _bootCaptcha = { provider: 'recaptcha', key: _rc };
        else if (_pref === 'turnstile' && _ts) _bootCaptcha = { provider: 'turnstile', key: _ts };
        else if (!_pref && _ts) _bootCaptcha = { provider: 'turnstile', key: _ts };       // auto: turnstile if set
        else if (!_pref && _rc) _bootCaptcha = { provider: 'recaptcha', key: _rc };        // else recaptcha if set
        else _bootCaptcha = { provider: '', key: '' };
      }
      startVersionPoll();

      if (settings.theme_bg || settings.theme_accent || settings.theme_text) {
        const root = document.documentElement;
        if (settings.theme_bg)     root.style.setProperty('--site-bg',     settings.theme_bg);
        if (settings.theme_accent) {
          root.style.setProperty('--site-accent', settings.theme_accent);

          const h = settings.theme_accent.replace('#', '');
          if (h.length === 6) root.style.setProperty('--site-accent-rgb', `${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)}`);
        }
        if (settings.theme_text)   root.style.setProperty('--site-text',   settings.theme_text);
        const bg = document.getElementById('gate');
        if (bg && !settings.gate_bg) bg.style.background = settings.theme_bg;
      }

      if (settings.site_offline === '1') {
        dismissLoading();
        document.getElementById('gate').style.display = 'none';
        const acc = getComputedStyle(document.documentElement).getPropertyValue('--site-accent').trim() || '#4dbd6a';
        const scene = document.getElementById('scene');
        scene.style.cssText = 'position:fixed;inset:0;z-index:10;display:flex;align-items:center;justify-content:center;background:var(--site-bg);';
        scene.innerHTML = `<div style="position:relative;text-align:center;font-family:'Josefin Sans',sans-serif;padding:2.5rem;max-width:360px;">
          <div style="position:absolute;inset:-40% -20%;background:radial-gradient(ellipse 60% 50% at 50% 50%, ${acc}1a 0%, transparent 70%);pointer-events:none;"></div>
          <div style="position:relative;">
            <img src="/icons/favicon.svg" width="38" height="38" style="margin-bottom:1.6rem;opacity:.55;border-radius:8px;" alt="" />
            <p style="font-weight:100;font-size:.52rem;letter-spacing:.42em;text-transform:uppercase;color:${acc}99;margin-bottom:1rem;">● Offline</p>
            <p style="font-family:'Unbounded',sans-serif;font-weight:200;font-size:1.15rem;letter-spacing:.02em;color:rgba(220,245,225,.9);margin-bottom:.7rem;">${pgE(settings.name||'')}</p>
            <p style="font-weight:200;font-size:.74rem;letter-spacing:.06em;line-height:1.9;color:rgba(var(--site-muted-rgb),.42);">This site is taking a short break.<br>Check back soon.</p>
          </div>
        </div>`;
        return;
      }

      const urlParams = new URLSearchParams(location.search);
      const urlCode   = urlParams.get('code');
      const urlState  = urlParams.get('state');
      const urlMagic  = urlParams.get('ml');
      if (urlCode) {
        dismissGate();
        await handleOAuthCallback(urlCode, urlState);
        return;
      }
      if (urlMagic) {
        dismissGate();
        const res = await handleMagicVerify(urlMagic);
        if (res === true) return;

        startGate(clientId, settings);
        if (foyerOn)   startFoyerBtn();
        if (githubId)  startGithubBtn(githubId);
        if (discordId) startDiscordBtn(discordId);
        if (magicOn)   startMagicBtn();
        const err = document.getElementById('gate-err');
        if (err) err.textContent = typeof res === 'string' ? res : 'This link is invalid or has expired.';
        return;
      }

      const session = getSession();

      if (publicMode || (!clientId && !githubId && !discordId && !magicOn && !foyerOn) || session) {
        dismissGate();
        loadAndShow(session);
      } else {
        startGate(clientId, settings);
        if (foyerOn)   startFoyerBtn();
        if (githubId)  startGithubBtn(githubId);
        if (discordId) startDiscordBtn(discordId);
        if (magicOn)   startMagicBtn();
      }

      if (foyerOn && !getSession() && window.Foyer) window.Foyer.oneTap({ onSignedIn: _foyerSession });
    })();




    function _zoomable(img) {
      return img && img.closest('#scene') && !img.closest('a') &&
        !img.classList.contains('no-zoom') && !img.classList.contains('coll-thumb') &&
        (img.naturalWidth || 100) >= 90;
    }

    let _fbLoad;
    function _loadFancybox() {
      if (window.Fancybox) return Promise.resolve();
      if (_fbLoad) return _fbLoad;
      _fbLoad = new Promise((res, rej) => {
        const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = '/deps/fancybox.css'; document.head.appendChild(css);
        const s = document.createElement('script'); s.src = '/deps/fancybox.js'; s.onload = res; s.onerror = rej; document.head.appendChild(s);
      });
      return _fbLoad;
    }
    document.addEventListener('click', async (e) => {
      const img = e.target.closest('img');
      if (!_zoomable(img)) return;
      e.preventDefault();
      try { await _loadFancybox(); } catch { return; }
      if (!window.Fancybox) return;


      const card = img.closest('.coll-card');
      let srcs;
      if (card) {
        const thumbs = card.querySelectorAll('.coll-thumb');
        if (thumbs.length) srcs = Array.from(thumbs).map((t) => t.dataset.cover || t.currentSrc || t.src);
        else { const cov = card.querySelector('.coll-cover') || img; srcs = [cov.currentSrc || cov.src || cov.dataset.src]; }
      } else {
        srcs = Array.from(document.querySelectorAll('#scene img'))
          .filter((im) => _zoomable(im) && !im.closest('.coll-card'))
          .map((im) => im.currentSrc || im.src || im.dataset.src);
      }
      const seen = new Set(), slides = [];
      srcs.forEach((s) => { if (s && !seen.has(s)) { seen.add(s); slides.push({ src: s, type: 'image' }); } });
      const target = img.currentSrc || img.src || img.dataset.src;
      const idx = Math.max(0, slides.findIndex((s) => s.src === target));
      window.Fancybox.show(slides, { startIndex: idx });
    });
