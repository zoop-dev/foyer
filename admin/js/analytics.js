function anFlag(code) {
  if (!code || code.length !== 2) return '';
  const o = 127397;
  return String.fromCodePoint(code.toUpperCase().charCodeAt(0)+o) + String.fromCodePoint(code.toUpperCase().charCodeAt(1)+o);
}
function anBrowser(ua) {
  if (!ua) return '?';
  if (ua.includes('Edg/'))  return 'Edge';
  if (ua.includes('OPR/') || ua.includes('Opera')) return 'Opera';
  if (ua.includes('Firefox/')) return 'Firefox';
  if (ua.includes('Chrome/'))  return 'Chrome';
  if (ua.includes('Safari/'))  return 'Safari';
  return 'Other';
}
function anOS(ua) {
  if (!ua) return '?';
  if (ua.includes('Windows')) return 'Win';
  if (ua.includes('Macintosh')) return 'Mac';
  if (ua.includes('iPhone'))  return 'iOS';
  if (ua.includes('iPad'))    return 'iPadOS';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('Linux'))   return 'Linux';
  return '?';
}
function anBars(rows, key, labelKey, max) {
  if (!rows.length) return '<p style="font-size:.6rem;color:var(--muted);font-weight:100;">No data yet.</p>';
  const top = rows[0].n;
  return rows.map(r => {
    const pct = top ? Math.round((r.n / top) * 100) : 0;
    const label = key === 'country' ? `${anFlag(r[labelKey])} ${r[labelKey]}` : escHtml(String(r[labelKey]||'?'));
    return `<div class="bar-row"><span class="bar-label" title="${escHtml(String(r[labelKey]||''))}">${label}</span><div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div><span class="bar-count">${r.n}</span></div>`;
  }).join('');
}

function renderRecentFeed(limit) {
  const feed = document.getElementById('anFeed');
  const rows = window._anRecent || [];
  if (!rows.length) {
    feed.innerHTML = '<p style="padding:1.5rem;font-size:.62rem;font-weight:100;color:var(--muted);">No page views recorded yet — views appear as soon as the site is visited.</p>';
    return;
  }
  const shown = limit ? rows.slice(0, limit) : rows;
  const rowHtml = r => `<tr>
    <td>${timeAgo(r.viewed_at)}</td>
    <td class="an-path">${escHtml(r.path||'/')}</td>
    <td>${anFlag(r.country)}<span title="${escHtml([r.city,r.region,r.country].filter(Boolean).join(', '))}">${escHtml([r.city,r.country].filter(Boolean).join(', ')||'—')}</span>${r.lat&&r.lon?` <span style="font-size:.5rem;color:var(--muted);">(${(+r.lat).toFixed(2)},${(+r.lon).toFixed(2)})</span>`:''}</td>
    <td title="${escHtml(r.isp||'')}"><span style="color:rgba(77,189,106,.7)">${escHtml(r.isp||'—')}</span>${r.asn?` <span style="color:var(--muted);font-size:.55rem;">AS${escHtml(r.asn)}</span>`:''}</td>
    <td>${escHtml(anBrowser(r.ua))}</td>
    <td>${escHtml(anOS(r.ua))}</td>
    <td>${escHtml(r.screen||'—')}</td>
    <td>${escHtml(r.lang||'—')}</td>
    <td>${escHtml(r.http||'—')}</td>
    <td>${escHtml(r.tls||'—')}</td>
    <td>${escHtml(r.colo||'—')}</td>
    <td class="an-ip">${escHtml(r.ip ? r.ip.replace(/(\d+\.\d+)\.\d+\.\d+/,'$1.x.x').replace(/([\da-f:]+:[\da-f:]+):.+/i,'$1:…') : '—')}</td>
  </tr>`;
  feed.innerHTML = `<table>
      <thead><tr>
        <th>Time</th><th>Path</th><th>Location</th><th>ISP / ASN</th>
        <th>Browser</th><th>OS</th><th>Screen</th><th>Lang</th>
        <th>Protocol</th><th>TLS</th><th>Colo</th><th>IP</th>
      </tr></thead>
      <tbody>${shown.map(rowHtml).join('')}</tbody>
    </table>
    ${limit && rows.length > limit
      ? `<div style="text-align:center;padding:.9rem;"><button id="anShowAll" class="btn btn-xs">Show all ${rows.length}</button></div>`
      : (rows.length > 20 ? `<div style="text-align:center;padding:.9rem;"><button id="anShowLess" class="btn btn-xs">Show less</button></div>` : '')}`;
  document.getElementById('anShowAll')?.addEventListener('click', () => renderRecentFeed(0));
  document.getElementById('anShowLess')?.addEventListener('click', () => renderRecentFeed(20));
}

async function fetchAnalytics() {
  const visBadge = document.getElementById('visBadge');
  const res = await fetch('/api/analytics', { headers: authHeaders() });
  if (!res.ok) return;
  const d = await res.json();

  document.getElementById('anTotal').textContent     = d.total.toLocaleString();
  document.getElementById('anToday').textContent     = d.today.toLocaleString();
  document.getElementById('anWeek').textContent      = d.week.toLocaleString();
  document.getElementById('anIPs').textContent       = d.unique_ips.toLocaleString();
  document.getElementById('anCountriesN').textContent = d.unique_countries.toLocaleString();
  visBadge.textContent = d.total; visBadge.style.display = d.total ? 'inline-block' : 'none';

  const feed = document.getElementById('anFeed');
  window._anRecent = d.recent;
  renderRecentFeed(20);

  const bds = document.getElementById('anBreakdowns');
  const bd = (title, html) => `<div class="an-bd"><p class="an-bd-title">${title}</p>${html}</div>`;
  bds.innerHTML = [
    bd('Top Pages',      anBars(d.top_paths,     'path',    'path')),
    bd('Countries',      anBars(d.top_countries, 'country', 'country')),
    bd('Cities',         anBars(d.top_cities,    'city',    'city')),
    bd('ISPs',           anBars(d.top_isps,      'isp',     'isp')),
    bd('ASNs',           anBars(d.top_asns,      'asn',     'isp')),
    bd('Timezones',      anBars(d.top_tz,        'tz',      'tz')),
    bd('Screen Sizes',   anBars(d.top_screens,   'screen',  'screen')),
    bd('Languages',      anBars(d.top_lang,      'lang',    'lang')),
    bd('CF Datacenters', anBars(d.top_colo,      'colo',    'colo')),
    bd('TLS Versions',   anBars(d.top_tls,       'tls',     'tls')),
  ].join('');

  const vList = document.getElementById('vList');
  if (!d.visitors.length) { vList.innerHTML = '<p class="vis-empty">No signed-in visitors yet.</p>'; return; }

  window._anVisitors = d.visitors;
  const isOwner = d.caller_role === 'owner';
  const roleBadge = r => r === 'owner'
    ? '<span class="v-role-badge owner">OWNER</span>'
    : r === 'admin' ? '<span class="v-role-badge admin">ADMIN</span>' : '';
  vList.innerHTML = d.visitors.map((v, i) => `
    <div class="v-item${v.is_banned ? ' v-item-banned' : ''}" data-vi="${i}">
      ${v.picture ? `<img class="v-avatar" src="${escHtml(v.picture)}" alt="" referrerpolicy="no-referrer" />` : `<div class="v-avatar-ph">${escHtml((v.name||v.email||'?').charAt(0).toUpperCase())}</div>`}
      <div class="v-info">
        <p class="v-name">${escHtml(v.name||'—')} ${roleBadge(v.role)} ${v.is_banned ? '<span class="v-banned-badge">BANNED</span>' : ''}</p>
        <p class="v-email">${escHtml(v.email)}</p>
      </div>
      <div class="v-meta"><p class="v-count">${v.visit_count} <span>visit${v.visit_count===1?'':'s'}</span></p><p class="v-time">Last: ${timeAgo(v.last_seen)}</p></div>
      <div style="display:flex;gap:.4rem;flex-shrink:0;align-items:center;flex-wrap:wrap;justify-content:flex-end;">
        <button class="v-analytics-btn" data-vi="${i}" title="View page history">View →</button>
        ${v.role === 'owner'
          ? `<span class="v-owner-tag" title="Owners can't be modified">Owner</span>`
          : (isOwner ? (v.role === 'admin'
            ? `<button class="v-demote-btn" data-id="${v.id}">Demote</button>`
            : `<button class="v-promote-btn" data-id="${v.id}">Make Admin</button>`) : '')}
        ${v.is_banned
          ? `<button class="v-unban-btn" data-id="${v.id}" data-vi="${i}">Restore</button>`
          : (v.role === 'owner'
            ? ''   // owners can't be banned by anyone
            : `<button class="v-ban-btn" data-id="${v.id}" data-vi="${i}">Ban</button>`)}
      </div>
    </div>`).join('');

  vList.querySelectorAll('.v-analytics-btn').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); openVisitorModal(window._anVisitors[+btn.dataset.vi]); });
  });
  vList.querySelectorAll('.v-ban-btn').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); banVisitor(+btn.dataset.id, true); });
  });
  vList.querySelectorAll('.v-unban-btn').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); banVisitor(+btn.dataset.id, false); });
  });
  vList.querySelectorAll('.v-promote-btn').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); changeRole(+btn.dataset.id, 'promote'); });
  });
  vList.querySelectorAll('.v-demote-btn').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); changeRole(+btn.dataset.id, 'demote'); });
  });
}

async function changeRole(id, action) {
  const v = (window._anVisitors || []).find(x => x.id === id);
  const label = action === 'promote'
    ? `Promote ${v?.name || v?.email || 'this user'} to admin? They'll be able to access the admin panel.`
    : `Demote ${v?.name || v?.email || 'this admin'} back to a regular user?`;
  if (!await dlg.confirm(label, { confirm: action === 'promote' ? 'Promote' : 'Demote', danger: action === 'demote' })) return;
  const res = await fetch(`/api/visitors/${id}/${action}`, { method: 'POST', headers: authHeaders() });
  if (!res.ok) { await dlg.alert('Action failed — owner only.'); return; }
  toast(action === 'promote' ? 'Promoted to admin' : 'Demoted to user');
  fetchAnalytics();
}

async function banVisitor(id, banning) {
  if (!banning) {
    if (!await dlg.confirm('Restore access for this user? This will also unban any linked accounts with the same email.', { confirm: 'Restore' })) return;
    const res = await fetch(`/api/visitors/${id}/unban`, { method: 'POST', headers: authHeaders() });
    if (!res.ok) { await dlg.alert('Action failed.'); return; }
    fetchAnalytics();
    return;
  }

  const v = (window._anVisitors || []).find(x => x.id === id);
  const email = v?.email ? `"${v.email}"` : 'this email';

  const scope = await new Promise(resolve => {
    const backdrop = document.createElement('div');
    backdrop.style.cssText = 'position:fixed;inset:0;z-index:99990;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center;padding:1.5rem;';
    backdrop.innerHTML = `
      <div style="background:var(--panel);border:1px solid rgba(77,189,106,.18);max-width:400px;width:100%;padding:1.6rem 1.8rem;">
        <p style="font-family:'Unbounded',sans-serif;font-weight:200;font-size:.78rem;color:#f0f7f1;margin-bottom:.5rem;">Ban User</p>
        <p style="font-weight:200;font-size:.72rem;line-height:1.75;color:rgba(220,245,225,.6);margin-bottom:1.4rem;">Choose the scope of this ban:</p>
        <div style="display:flex;flex-direction:column;gap:.55rem;">
          <button data-scope="one" style="text-align:left;padding:.75rem 1rem;border:1px solid rgba(200,60,60,.3);background:transparent;color:rgba(220,245,225,.8);cursor:pointer;font-family:'Josefin Sans',sans-serif;font-weight:200;font-size:.72rem;">
            <div style="color:rgba(200,80,80,.9);font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;margin-bottom:.2rem;">Just this account</div>
            Ban only this OAuth identity
          </button>
          <button data-scope="email" style="text-align:left;padding:.75rem 1rem;border:1px solid rgba(200,60,60,.3);background:transparent;color:rgba(220,245,225,.8);cursor:pointer;font-family:'Josefin Sans',sans-serif;font-weight:200;font-size:.72rem;">
            <div style="color:rgba(200,80,80,.9);font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;margin-bottom:.2rem;">All accounts with this email</div>
            Ban all linked identities sharing ${escHtml(email)}
          </button>
          <button data-scope="email_block" style="text-align:left;padding:.75rem 1rem;border:1px solid rgba(200,60,60,.5);background:rgba(200,60,60,.06);color:rgba(220,245,225,.8);cursor:pointer;font-family:'Josefin Sans',sans-serif;font-weight:200;font-size:.72rem;">
            <div style="color:rgba(200,80,80,.9);font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;margin-bottom:.2rem;">Block email permanently</div>
            Ban all linked accounts + block any future signups with ${escHtml(email)}
          </button>
        </div>
        <button data-scope="cancel" style="margin-top:1rem;width:100%;padding:.45rem;border:1px solid rgba(77,189,106,.15);background:transparent;color:rgba(180,230,190,.4);cursor:pointer;font-family:'Josefin Sans',sans-serif;font-size:.58rem;letter-spacing:.2em;text-transform:uppercase;">Cancel</button>
      </div>`;
    backdrop.querySelectorAll('[data-scope]').forEach(btn => {
      btn.addEventListener('click', () => { backdrop.remove(); resolve(btn.dataset.scope); });
    });
    document.body.appendChild(backdrop);
  });

  if (!scope || scope === 'cancel') return;

  const res = await fetch(`/api/visitors/${id}/ban`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ scope }),
  });
  if (!res.ok) { await dlg.alert('Action failed.'); return; }
  fetchAnalytics();
}


function openVisitorModal(v) {
  const existing = document.getElementById('vModal');
  if (existing) existing.remove();

  const backdrop = document.createElement('div');
  backdrop.className = 'v-modal-backdrop';
  backdrop.id = 'vModal';

  const avatarHtml = v.picture
    ? `<img class="v-modal-head-avatar" src="${escHtml(v.picture)}" referrerpolicy="no-referrer" />`
    : `<div class="v-modal-head-ph">${escHtml((v.name||v.email||'?').charAt(0).toUpperCase())}</div>`;

  backdrop.innerHTML = `
    <div class="v-modal">
      <div class="v-modal-head">
        ${avatarHtml}
        <div class="v-modal-head-info">
          <div class="v-modal-head-name">${escHtml(v.name||'—')}</div>
          <div class="v-modal-head-email">${escHtml(v.email)}</div>
        </div>
        <button class="v-modal-close" id="vModalClose">✕</button>
      </div>
      <div class="v-modal-body" id="vModalBody">
        <p class="v-modal-empty" style="opacity:.5;">Loading…</p>
      </div>
    </div>`;

  document.body.appendChild(backdrop);

  backdrop.addEventListener('click', e => { if (e.target === backdrop) backdrop.remove(); });
  document.getElementById('vModalClose').addEventListener('click', () => backdrop.remove());

  fetch(`/api/analytics/visitor/${v.id}`, { headers: authHeaders() })
    .then(r => r.json())
    .then(d => {
      const body = document.getElementById('vModalBody');
      if (!body) return;

      if (d.no_sessions) {
        body.innerHTML = `<p class="v-modal-empty">No analytics data yet — this visitor hasn't triggered a page view ping since analytics were added.</p>`;
        return;
      }
      if (!d.views || !d.views.length) {
        body.innerHTML = `<p class="v-modal-empty">This visitor has ${d.session_count} session${d.session_count===1?'':'s'} but no recorded page views yet.</p>`;
        return;
      }

      const views = d.views;
      const uniquePaths    = new Set(views.map(r => r.path)).size;
      const uniqueCountries = new Set(views.map(r => r.country).filter(Boolean)).size;
      const uniqueIPs      = new Set(views.map(r => r.ip).filter(Boolean)).size;

      body.innerHTML = `
        <div class="v-modal-stats">
          <div class="v-modal-stat"><strong>${views.length}</strong>Page Views</div>
          <div class="v-modal-stat"><strong>${uniquePaths}</strong>Unique Pages</div>
          <div class="v-modal-stat"><strong>${uniqueCountries}</strong>Countries</div>
          <div class="v-modal-stat"><strong>${uniqueIPs}</strong>IPs</div>
          <div class="v-modal-stat"><strong>${d.session_count}</strong>Sessions</div>
        </div>
        <div class="an-feed">
          <table>
            <thead><tr>
              <th>Time</th><th>Path</th><th>Location</th><th>ISP / ASN</th>
              <th>Browser</th><th>OS</th><th>Screen</th><th>Lang</th><th>TLS</th><th>Colo</th>
            </tr></thead>
            <tbody>${views.map(r => `<tr>
              <td>${timeAgo(r.viewed_at)}</td>
              <td class="an-path">${escHtml(r.path||'/')}</td>
              <td>${anFlag(r.country)} ${escHtml([r.city, r.country].filter(Boolean).join(', ')||'—')}</td>
              <td><span style="color:rgba(77,189,106,.7)">${escHtml(r.isp||'—')}</span>${r.asn ? ` <span style="color:var(--muted);font-size:.55rem;">AS${escHtml(r.asn)}</span>` : ''}</td>
              <td>${escHtml(anBrowser(r.ua))}</td>
              <td>${escHtml(anOS(r.ua))}</td>
              <td>${escHtml(r.screen||'—')}</td>
              <td>${escHtml(r.lang||'—')}</td>
              <td>${escHtml(r.tls||'—')}</td>
              <td>${escHtml(r.colo||'—')}</td>
            </tr>`).join('')}</tbody>
          </table>
        </div>`;
    })
    .catch(() => {
      const body = document.getElementById('vModalBody');
      if (body) body.innerHTML = `<p class="v-modal-empty">Failed to load analytics data.</p>`;
    });
}

