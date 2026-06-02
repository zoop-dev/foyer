    function applyGateSettings(settings) {
      const gate = document.getElementById('gate');
      if (settings.gate_bg) gate.style.background = settings.gate_bg;
      const titleEl = document.querySelector('.gate-title');
      const subEl   = document.querySelector('.gate-sub');
      if (titleEl) {
        if (settings.gate_title) titleEl.textContent = settings.gate_title;
        if (settings.gate_title_font) titleEl.style.fontFamily = `'${settings.gate_title_font}', sans-serif`;
      }
      if (subEl) {
        if (settings.gate_sub) subEl.textContent = settings.gate_sub;
        if (settings.gate_sub_font) subEl.style.fontFamily = `'${settings.gate_sub_font}', sans-serif`;
      }
      if (settings.gate_btn) {
        const btnText = document.getElementById('googleBtnText');
        if (btnText) btnText.textContent = settings.gate_btn;
      }
      if (settings.gate_accent) {
        const btn = document.getElementById('googleSignInBtn');
        if (btn) btn.style.setProperty('--gate-accent', settings.gate_accent);
      }
    }

    function unlockGateBtns(settings) {
      const wrap  = document.getElementById('gate-btns');
      const subEl = document.querySelector('.gate-sub');
      if (wrap) wrap.style.display = '';
      if (subEl && settings?.gate_sub_unlocked) subEl.textContent = settings.gate_sub_unlocked;
    }

    function startGate(clientId, settings) {
      const name = settings.name || __SITE__.name;
      document.title = name;
      document.querySelectorAll('.site-name').forEach(el => el.textContent = name);
      applyGateSettings(settings);
      dismissLoading();

      const gate = document.getElementById('gate');
      gate.style.opacity = '1';
      gate.style.pointerEvents = 'auto';


      if (_bootTurnstile) {
        const renderTs = () => {
          try {
            window.turnstile.render('#turnstile-embed', {
              sitekey: _bootTurnstile, theme: 'dark',
              callback: () => unlockGateBtns(settings),
              'error-callback': () => { const e = document.getElementById('gate-err'); if (e) e.textContent = 'Bot check failed — refresh to retry.'; },
            });
          } catch { unlockGateBtns(settings); }
        };
        if (window.turnstile) renderTs();
        else {
          const ts = document.createElement('script');
          ts.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
          ts.async = true; ts.defer = true;
          ts.onload = renderTs; ts.onerror = () => unlockGateBtns(settings);
          document.head.appendChild(ts);
        }
      } else {
        unlockGateBtns(settings);
      }

      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.onload = () => {
        const handleCredential = async (resp) => {
          document.getElementById('gate-err').textContent = '';
          const data = await fetch('/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: resp.credential }),
          }).then(r => r.json()).catch(() => null);

          if (data?.ok) {
            const session = { email: data.email, name: data.name, picture: data.picture, session_token: data.session_token };
            setSession(session);
            dismissGate();
            loadAndShow(session);
          } else {
            document.getElementById('gate-err').textContent = data?.error === 'account_banned' ? 'Your access to this site has been revoked.' : data?.error === 'not_allowed' ? "This site is invite-only — your email isn't on the guest list." : data?.error === 'vpn_blocked' ? "Sign-ups over a VPN or proxy aren't allowed. Please turn it off and try again." : data?.error === 'signup_limited' ? 'Too many recent sign-ups from your email domain. Please try again later.' : (data?.error || 'Sign-in failed. Try again.');
          }
        };

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredential,
        });

        const hiddenGsi = document.createElement('div');
        hiddenGsi.id = 'gsi-hidden';
        hiddenGsi.style.cssText = 'position:absolute;top:-9999px;visibility:hidden;';
        document.body.appendChild(hiddenGsi);
        window.google.accounts.id.renderButton(hiddenGsi, { type:'standard', theme:'outline', size:'large' });

        const triggerGsi = () => document.querySelector('#gsi-hidden [role="button"]')?.click();

        const btn = document.getElementById('googleSignInBtn');
        btn.addEventListener('click', triggerGsi);
        hookHover(btn);

        window.google.accounts.id.prompt();
      };
      document.head.appendChild(s);
    }

    let _bootClientId  = '';
    let _bootTurnstile = '';
    let _bootGithubId  = '';
    let _bootDiscordId = '';

    const DISCORD_REDIRECT = location.origin + '/';

    async function handleOAuthCallback(code, state) {
      let endpoint, body, errMsg;
      if (state === 'foyer') {
        let verifier = ''; try { verifier = sessionStorage.getItem('foyer_pkce') || ''; sessionStorage.removeItem('foyer_pkce'); } catch {}
        endpoint = '/api/auth/foyer';
        body = { code, code_verifier: verifier };
        errMsg = 'Foyer sign-in failed. Try again.';
      } else if (state === 'discord') {
        endpoint = '/api/auth/discord';
        body = { code, redirect_uri: DISCORD_REDIRECT };
        errMsg = 'Discord sign-in failed. Try again.';
      } else {
        endpoint = '/api/auth/github';
        body = { code };
        errMsg = 'GitHub sign-in failed. Try again.';
      }
      const data = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).then(r => r.json()).catch(() => null);
      const url = new URL(location.href);
      url.searchParams.delete('code'); url.searchParams.delete('state'); url.searchParams.delete('foyer_code');
      history.replaceState(null, '', url.pathname + url.search + url.hash);   // always strip the auth params
      if (data?.ok) {
        const session = { email: data.email, name: data.name, picture: data.picture, session_token: data.session_token };
        setSession(session);
        dismissGate();
        loadAndShow(session);
        return true;
      } else {
        const err = document.getElementById('gate-err');
        if (err) err.textContent = data?.error === 'account_banned' ? 'Your access to this site has been revoked.' : data?.error === 'not_allowed' ? "This site is invite-only — your email isn't on the guest list." : data?.error === 'vpn_blocked' ? "Sign-ups over a VPN or proxy aren't allowed. Please turn it off and try again." : data?.error === 'signup_limited' ? 'Too many recent sign-ups from your email domain. Please try again later.' : (data?.error || errMsg);
        return false;
      }
    }

    function startGithubBtn(githubClientId) {
      const btn = document.getElementById('githubSignInBtn');
      if (!btn) return;
      btn.style.display = '';
      btn.addEventListener('click', () => {
        const params = new URLSearchParams({ client_id: githubClientId, redirect_uri: location.origin, scope: 'user:email', state: 'github' });
        location.href = `https://github.com/login/oauth/authorize?${params}`;
      });
      hookHover(btn);
    }

    function startDiscordBtn(discordClientId) {
      const btn = document.getElementById('discordSignInBtn');
      if (!btn) return;
      btn.style.display = '';
      btn.addEventListener('click', () => {
        const params = new URLSearchParams({ client_id: discordClientId, redirect_uri: DISCORD_REDIRECT, response_type: 'code', scope: 'identify email', state: 'discord' });
        location.href = `https://discord.com/oauth2/authorize?${params}`;
      });
      hookHover(btn);
    }

    const FOYER_AUTH_URL = 'https://foyer.zo0p.dev';
    function _b64url(bytes) { return btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }
    async function _foyerAuthUrl() {
      const verifier = _b64url(crypto.getRandomValues(new Uint8Array(32)));
      const challenge = _b64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)));
      const params = new URLSearchParams({ client_id: location.hostname, redirect_uri: location.origin + '/', state: 'foyer', code_challenge: challenge, code_challenge_method: 'S256', display: 'popup' });
      return { url: `${FOYER_AUTH_URL}/authorize?${params}`, verifier };
    }
    async function foyerSignIn() {
      const { url, verifier } = await _foyerAuthUrl();
      const w = 440, h = 620, lft = Math.max(0, (screen.width - w) / 2), tp = Math.max(0, (screen.height - h) / 2);
      const popup = window.open(url, 'foyer_auth', `width=${w},height=${h},left=${lft},top=${tp}`);
      if (!popup) {                                    // popup blocked → full-page redirect fallback
        try { sessionStorage.setItem('foyer_pkce', verifier); } catch {}
        location.href = url; return;
      }
      function onMsg(e) {
        if (e.origin !== location.origin || !e.data || e.data.type !== 'foyer_auth' || !e.data.code) return;
        window.removeEventListener('message', onMsg);
        try { popup.close(); } catch {}
        finishFoyer(e.data.code, verifier);
      }
      window.addEventListener('message', onMsg);
    }
    async function finishFoyer(code, verifier) {
      const data = await fetch('/api/auth/foyer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, code_verifier: verifier }) }).then(r => r.json()).catch(() => null);
      if (data?.ok) {
        const session = { email: data.email, name: data.name, picture: data.picture, session_token: data.session_token };
        setSession(session); dismissGate(); loadAndShow(session);
      } else {
        const err = document.getElementById('gate-err');
        if (err) err.textContent = data?.error === 'account_banned' ? 'Your access to this site has been revoked.' : data?.error === 'not_allowed' ? "This site is invite-only — your email isn't on the guest list." : data?.error === 'vpn_blocked' ? "Sign-ups over a VPN or proxy aren't allowed." : (data?.error || 'Foyer sign-in failed. Try again.');
      }
    }
    function startFoyerBtn() {
      const btn = document.getElementById('foyerSignInBtn');
      if (!btn) return;
      btn.style.display = '';
      btn.addEventListener('click', () => foyerSignIn());
      hookHover(btn);
    }

    async function foyerOneTap() {
      if (getSession()) return;
      let info = null;
      try {
        const r = await fetch(`${FOYER_AUTH_URL}/session`, { credentials: 'include' });
        if (r.ok) info = (await r.json()).user;
      } catch {}
      if (!info || document.getElementById('foyer-onetap')) return;
      const card = document.createElement('div');
      card.id = 'foyer-onetap';
      card.style.cssText = [
        'position:fixed;top:20px;right:20px;z-index:9995;width:300px;',
        'background:rgba(13,17,23,0.97);border:1px solid rgba(127,166,216,0.28);border-radius:14px;',
        'box-shadow:0 12px 40px rgba(0,0,0,.45);backdrop-filter:blur(10px);',
        "font-family:'Josefin Sans',system-ui,sans-serif;color:#e8edf2;padding:1rem 1.1rem;",
        'transform:translateY(-12px);opacity:0;transition:transform .4s cubic-bezier(.16,1,.3,1),opacity .4s ease;',
      ].join('');
      const top = document.createElement('div');
      top.style.cssText = 'display:flex;align-items:center;gap:.6rem;margin-bottom:.7rem;';
      top.innerHTML = `<svg width="16" height="18" viewBox="0 0 44 50" fill="none" stroke="#7fa6d8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 46 V24 a16 16 0 0 1 32 0 V46"/><path d="M15 46 V28 a6 6 0 0 1 12 0 V46"/></svg><span style="font-size:.56rem;letter-spacing:.26em;text-transform:uppercase;color:#7fa6d8;font-weight:300;">Foyer</span>`;
      const x = document.createElement('button');
      x.textContent = '×'; x.setAttribute('aria-label', 'Dismiss');
      x.style.cssText = 'margin-left:auto;background:none;border:none;color:#8b94a6;font-size:1.1rem;cursor:pointer;line-height:1;';
      x.addEventListener('click', () => { card.style.opacity = '0'; card.style.transform = 'translateY(-12px)'; setTimeout(() => card.remove(), 380); });
      top.appendChild(x);
      const who = document.createElement('p');
      who.style.cssText = 'font-weight:200;font-size:.82rem;line-height:1.5;color:rgba(232,237,242,.82);margin-bottom:.9rem;';
      who.textContent = 'Continue as ' + (info.name || info.email);
      const btn = document.createElement('button');
      btn.textContent = 'Sign in with Foyer';
      btn.style.cssText = "width:100%;background:#7fa6d8;color:#070a0e;border:none;font-family:'Josefin Sans',sans-serif;font-weight:300;font-size:.62rem;letter-spacing:.2em;text-transform:uppercase;padding:.7rem;border-radius:8px;cursor:pointer;";
      btn.addEventListener('click', () => { card.remove(); foyerSignIn(); });
      card.appendChild(top); card.appendChild(who); card.appendChild(btn);
      document.body.appendChild(card);
      requestAnimationFrame(() => requestAnimationFrame(() => { card.style.opacity = '1'; card.style.transform = 'translateY(0)'; }));
    }

