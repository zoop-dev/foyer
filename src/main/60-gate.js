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
      if (state === 'discord') {
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
      if (data?.ok) {
        const session = { email: data.email, name: data.name, picture: data.picture, session_token: data.session_token };
        setSession(session);
        const url = new URL(location.href);
        url.searchParams.delete('code');
        url.searchParams.delete('state');
        history.replaceState(null, '', url.toString());
        dismissGate();
        loadAndShow(session);
      } else {
        const err = document.getElementById('gate-err');
        if (err) err.textContent = data?.error === 'account_banned' ? 'Your access to this site has been revoked.' : data?.error === 'not_allowed' ? "This site is invite-only — your email isn't on the guest list." : data?.error === 'vpn_blocked' ? "Sign-ups over a VPN or proxy aren't allowed. Please turn it off and try again." : data?.error === 'signup_limited' ? 'Too many recent sign-ups from your email domain. Please try again later.' : (data?.error || errMsg);
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

