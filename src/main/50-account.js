    async function serverSignOut(session) {
      try {
        await fetch('/api/auth/signout', { method: 'POST', headers: sessionHeaders(session) });
      } catch {}
    }

    function relTime(ts) {
      if (!ts) return '';

      const t = new Date(String(ts).replace(' ', 'T') + 'Z').getTime();
      if (isNaN(t)) return '';
      const diff = Date.now() - t;
      const m = Math.round(diff / 60000);
      if (m < 1) return 'just now';
      if (m < 60) return `${m} min ago`;
      const h = Math.round(m / 60);
      if (h < 24) return `${h} hr${h===1?'':'s'} ago`;
      const d = Math.round(h / 24);
      if (d < 30) return `${d} day${d===1?'':'s'} ago`;
      return new Date(t).toLocaleDateString();
    }

    let _acctBuilt = false;
    function buildAccountPanel() {
      if (_acctBuilt) return document.getElementById('acct-modal');
      _acctBuilt = true;
      const modal = document.createElement('div');
      modal.id = 'acct-modal';
      modal.innerHTML = `
        <div class="acct-card">
          <button type="button" class="acct-close" aria-label="Close">&times;</button>
          <div class="acct-head">
            <img class="acct-avatar" id="acctAvatar" alt="" />
            <div class="acct-id">
              <div class="acct-name" id="acctName"></div>
              <div class="acct-email" id="acctEmail"></div>
              <div class="acct-tags" id="acctTags"></div>
            </div>
          </div>
          <div class="acct-meta" id="acctMeta"></div>

          <div class="acct-sec">
            <div class="acct-sec-head">
              <span>Active sessions</span>
              <button type="button" class="acct-link" id="acctRevokeOthers" style="display:none;">Sign out others</button>
            </div>
            <div id="acctSessions" class="acct-sessions"><p class="acct-loading">Loading…</p></div>
          </div>

          <div class="acct-actions">
            <a href="/admin" id="acctAdmin" class="acct-admin-btn" style="display:none;">Admin panel</a>
            <button type="button" class="acct-signout-btn" id="acctSignOut">Sign out</button>
          </div>
        </div>`;
      document.body.appendChild(modal);

      const close = () => modal.classList.remove('show');
      modal.querySelector('.acct-close').addEventListener('click', close);
      modal.addEventListener('click', e => { if (e.target === modal) close(); });
      document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('show')) close(); });

      modal.querySelector('#acctSignOut').addEventListener('click', async (e) => {
        e.currentTarget.disabled = true;
        await serverSignOut(getSession());
        localStorage.removeItem(SESSION_KEY);
        location.reload();
      });

      modal.querySelector('#acctRevokeOthers').addEventListener('click', async (e) => {
        const b = e.currentTarget; b.disabled = true; b.textContent = 'Signing out…';
        await fetch('/api/account/sessions/revoke-others', { method: 'POST', headers: sessionHeaders(getSession()) }).catch(() => {});
        b.disabled = false; b.textContent = 'Sign out others';
        loadAccountSessions();
      });

      return modal;
    }

    async function loadAccountSessions() {
      const wrap = document.getElementById('acctSessions');
      const data = await fetch('/api/account/sessions', { headers: sessionHeaders(getSession()) }).then(r => r.json()).catch(() => null);
      if (!data?.sessions) { wrap.innerHTML = '<p class="acct-loading">Couldn\'t load sessions.</p>'; return; }
      const others = data.sessions.filter(s => !s.current).length;
      const ro = document.getElementById('acctRevokeOthers');
      ro.style.display = others > 0 ? '' : 'none';
      wrap.innerHTML = data.sessions.map(s => `
        <div class="acct-session${s.current ? ' cur' : ''}">
          <div class="acct-session-info">
            <div class="acct-session-dev">${escHtml(s.device)}${s.current ? ' <span class="acct-this">this device</span>' : ''}</div>
            <div class="acct-session-time">Active ${escHtml(relTime(s.last_seen))} · since ${escHtml(relTime(s.created_at))}</div>
          </div>
          ${s.current ? '' : `<button type="button" class="acct-revoke" data-sid="${escAttr(s.sid)}" title="Sign out this device">&times;</button>`}
        </div>`).join('');
      wrap.querySelectorAll('.acct-revoke').forEach(b => {
        hookHover(b);
        b.addEventListener('click', async () => {
          b.disabled = true;
          await fetch('/api/account/sessions/revoke', {
            method: 'POST', headers: { 'Content-Type': 'application/json', ...sessionHeaders(getSession()) },
            body: JSON.stringify({ sid: b.dataset.sid }),
          }).catch(() => {});
          loadAccountSessions();
        });
      });
      wrap.querySelectorAll('a, button').forEach(hookHover);
    }

    async function openAccountPanel() {
      const modal = buildAccountPanel();
      modal.classList.add('show');
      const session = getSession();

      document.getElementById('acctName').textContent  = session?.name || session?.email || '';
      document.getElementById('acctEmail').textContent = session?.email || '';
      const av = document.getElementById('acctAvatar');
      av.src = session?.picture || ''; av.style.display = session?.picture ? '' : 'none';
      document.getElementById('acctTags').innerHTML = '';
      document.getElementById('acctMeta').textContent = '';

      const acc = await fetch('/api/account', { headers: sessionHeaders(session) }).then(r => r.json()).catch(() => null);
      if (acc && !acc.error) {
        document.getElementById('acctName').textContent  = acc.name || acc.email;
        document.getElementById('acctEmail').textContent = acc.email;
        av.src = acc.picture || ''; av.style.display = acc.picture ? '' : 'none';
        const tags = [`<span class="acct-tag">${escHtml(acc.provider)}</span>`];
        if (acc.role === 'owner' || acc.role === 'admin') tags.push(`<span class="acct-tag acct-tag-role">${escHtml(acc.role)}</span>`);
        document.getElementById('acctTags').innerHTML = tags.join('');
        document.getElementById('acctMeta').textContent =
          `Member since ${relTime(acc.first_seen)} · ${acc.visit_count} visit${acc.visit_count===1?'':'s'}`;
        const adminBtn = document.getElementById('acctAdmin');
        if (acc.role === 'owner' || acc.role === 'admin') { adminBtn.style.display = ''; hookHover(adminBtn); }
      }
      loadAccountSessions();
    }

    document.getElementById('userBadge').addEventListener('click', openAccountPanel);
    document.getElementById('userBadge').style.cursor = 'pointer';

