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

    (async function boot() {

      try {
        console.log(
          '%c ∩ foyer %c this site runs on the foyer website architecture · v' + VERSION,
          'background:linear-gradient(135deg,#eef1f5,#a9b1bd);color:#11151b;font-weight:800;padding:3px 9px;border-radius:4px;letter-spacing:.05em',
          'color:#8b94a6;font-style:italic;padding-left:6px'
        );
      } catch {}


      const _SB = 'https://tvtfoghrdqwssdwvebuo.supabase.co';
      const _K = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2dGZvZ2hyZHF3c3Nkd3ZlYnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMzk2ODksImV4cCI6MjA5NTgxNTY4OX0.n_CRdzQQKYNGDHYmoVxyKafFJCfezKKlSiZddx8MXH4';


      let _foyerBypass = false;
      try {
        const _u = new URL(location.href);
        if (_u.searchParams.get('__fb')) {
          _foyerBypass = true;
          _u.searchParams.delete('__fb');
          history.replaceState(null, '', _u.pathname + _u.search + _u.hash);
        }
      } catch {}
      async function _foyerOffline() {
        try {
          const _r = await fetch(`${_SB}/rest/v1/foyer_sites?domain=eq.${encodeURIComponent(location.hostname)}&select=offline,licensed`, { headers: { apikey: _K, authorization: 'Bearer ' + _K }, cache: 'no-store' });
          if (_r.ok) { const _s = (await _r.json())[0]; return !!(_s && (_s.offline === true || _s.licensed === false)); }
        } catch {}
        return false;
      }
      if (!_foyerBypass) {
        if (await _foyerOffline()) { location.replace('/offline'); return; }

        setInterval(async () => { if (await _foyerOffline()) location.replace('/offline'); }, 60000);
      }

      const [cfg, settings] = await Promise.all([
        fetch('/api/config').then(r => r.json()).catch(() => ({})),
        fetch('/api/settings').then(r => r.json()).catch(() => ({})),
      ]);

      let clientId  = settings.auth_google  !== '0' ? (cfg.google_client_id  || '') : '';
      let githubId  = settings.auth_github  !== '0' ? (cfg.github_client_id  || '') : '';
      let discordId = settings.auth_discord !== '0' ? (cfg.discord_client_id || '') : '';
      let magicOn   = settings.auth_magic   !== '0' && !!cfg.magic_enabled;
      const publicMode = settings.site_public === '1';

      try { localStorage.setItem('foyer_public', publicMode ? '1' : '0'); } catch {}
      _bootClientId   = clientId;
      _bootGithubId   = githubId;
      _bootDiscordId  = discordId;
      _bootTurnstile  = cfg.turnstile_site_key || '';
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
        if (githubId)  startGithubBtn(githubId);
        if (discordId) startDiscordBtn(discordId);
        if (magicOn)   startMagicBtn();
        const err = document.getElementById('gate-err');
        if (err) err.textContent = typeof res === 'string' ? res : 'This link is invalid or has expired.';
        return;
      }

      const session = getSession();

      if (publicMode || (!clientId && !githubId && !discordId && !magicOn) || session) {
        dismissGate();
        loadAndShow(session);
      } else {
        startGate(clientId, settings);
        if (githubId)  startGithubBtn(githubId);
        if (discordId) startDiscordBtn(discordId);
        if (magicOn)   startMagicBtn();
      }
    })();
