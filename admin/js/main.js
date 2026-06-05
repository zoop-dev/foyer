document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('sec-' + btn.dataset.tab).classList.add('active');
    if (btn.dataset.tab === 'analytics') fetchAnalytics();
    if (btn.dataset.tab === 'builder')  { bldBoot(); bldLoadPages(); }
    if (btn.dataset.tab === 'images')   renderImgTabGallery();
    if (btn.dataset.tab === 'files')    fetchAndRenderFiles();
    if (btn.dataset.tab === 'tutorials') fetchTutorials();
    if (btn.dataset.tab === 'reviews') fetchReviews();
    if (btn.dataset.tab === 'settings') { fetchBlocklist(); fetchAllowlist(); loadNavEditor(); }
  });
});


const HIDEABLE_TABS = ['images','files','tutorials','reviews','analytics'];
const TAB_LABELS = { images:'Images', files:'Files', tutorials:'Tutorials', reviews:'Reviews', analytics:'Analytics' };
function getHiddenTabs() { try { return JSON.parse(localStorage.getItem('foyer_hidden_tabs')||'[]'); } catch { return []; } }
function setHiddenTabs(arr) { try { localStorage.setItem('foyer_hidden_tabs', JSON.stringify(arr)); } catch {} }
function applyHiddenTabs() {
  const hidden = getHiddenTabs();
  document.querySelectorAll('.tab-btn').forEach(b => {
    if (HIDEABLE_TABS.includes(b.dataset.tab)) b.style.display = hidden.includes(b.dataset.tab) ? 'none' : '';
  });
  const active = document.querySelector('.tab-btn.active');
  if (active && hidden.includes(active.dataset.tab)) document.querySelector('.tab-btn[data-tab="builder"]')?.click();
}
function renderTabToggles() {
  const el = document.getElementById('tabToggleList');
  if (!el) return;
  const hidden = getHiddenTabs();
  el.innerHTML = HIDEABLE_TABS.map(t => `<label style="display:flex;align-items:center;gap:.6rem;cursor:pointer;font-size:.72rem;font-weight:200;color:rgba(220,245,225,.8);padding:.25rem 0;"><input type="checkbox" data-tabtoggle="${t}" ${hidden.includes(t)?'':'checked'} /> ${TAB_LABELS[t]}</label>`).join('');
  el.querySelectorAll('input[data-tabtoggle]').forEach(cb => {
    cb.addEventListener('change', () => {
      let h = getHiddenTabs(); const t = cb.dataset.tabtoggle;
      if (cb.checked) h = h.filter(x => x !== t); else if (!h.includes(t)) h.push(t);
      setHiddenTabs(h); applyHiddenTabs();
    });
  });
}
applyHiddenTabs();
renderTabToggles();



async function fetchSettings() {
  const res=await fetch('/api/settings'); if (!res.ok) return;
  const s=await res.json();
  document.getElementById('sName').value=s.name||'';
  document.getElementById('sCaptchaProvider').value=s.captcha_provider||'';
  document.getElementById('sGateTitle').value=s.gate_title||'';
  if (s.gate_title_font) document.getElementById('sGateTitleFont').value=s.gate_title_font;
  document.getElementById('sGateSub').value=s.gate_sub||'';
  document.getElementById('sGateSubUnlocked').value=s.gate_sub_unlocked||'';
  if (s.gate_sub_font) document.getElementById('sGateSubFont').value=s.gate_sub_font;
  document.getElementById('sGateBtn').value=s.gate_btn||'';
  document.getElementById('sGateBg').value=s.gate_bg||'';
  document.getElementById('sGateAccent').value=s.gate_accent||'';
  document.getElementById('sNavTitle').value=s.nav_title||'';
  if (s.nav_style) document.getElementById('sNavStyle').value=s.nav_style;
  if (s.nav_align) document.getElementById('sNavAlign').value=s.nav_align;
  if (s.nav_position) document.getElementById('sNavPosition').value=s.nav_position;
  document.getElementById('sSmoothScroll').checked = s.smooth_scroll !== '0';   // on by default
  document.getElementById('sScrambleTitle').checked = s.scramble_title === '1';
  document.getElementById('sScrambleStrings').value = s.scramble_strings || '';
  if (s.theme_bg)     document.getElementById('sThemeBg').value=s.theme_bg;
  if (s.theme_accent) document.getElementById('sThemeAccent').value=s.theme_accent;
  if (s.theme_text)   document.getElementById('sThemeText').value=s.theme_text;
  document.getElementById('sAuthFoyer').checked   = s.auth_foyer   === '1';
  document.getElementById('sAuthGoogle').checked  = s.auth_google  !== '0';
  document.getElementById('sAuthGithub').checked  = s.auth_github  !== '0';
  document.getElementById('sAuthDiscord').checked = s.auth_discord !== '0';
  document.getElementById('sAuthMagic').checked   = s.auth_magic   !== '0';
  document.getElementById('sSiteOffline').checked = s.site_offline === '1';
  document.getElementById('sSitePublic').checked = s.site_public === '1';
  document.getElementById('sSiteLockdown').checked = s.site_lockdown === '1';
  document.getElementById('sSignupBlockVpn').checked = s.signup_block_vpn === '1';
  document.getElementById('sSignupDomainLimit').value = s.signup_domain_limit && s.signup_domain_limit !== '0' ? s.signup_domain_limit : '';
  document.getElementById('sSignupDomainWindow').value = s.signup_domain_window_h || '';
  const DEF_EXEMPT = 'gmail.com, yahoo.com, outlook.com, hotmail.com, icloud.com, proton.me, protonmail.com, aol.com, live.com, msn.com, gmx.com, mail.com';
  document.getElementById('sSignupDomainExempt').value = s.signup_domain_exempt != null ? s.signup_domain_exempt : DEF_EXEMPT;
}
document.getElementById('saveSettingsBtn').addEventListener('click', async () => {
  const sp=document.getElementById('settingsSpinner'),ss=document.getElementById('settingsStatus'),btn=document.getElementById('saveSettingsBtn');
  sp.style.display='block'; btn.disabled=true; ss.textContent='';
  const res=await fetch('/api/settings',{method:'PUT',headers:{...authHeaders(),'Content-Type':'application/json'},
    body:JSON.stringify({name:document.getElementById('sName').value.trim(),
      captcha_provider:document.getElementById('sCaptchaProvider').value,
      gate_title:document.getElementById('sGateTitle').value.trim(),
      gate_title_font:document.getElementById('sGateTitleFont').value,
      gate_sub:document.getElementById('sGateSub').value.trim(),
      gate_sub_unlocked:document.getElementById('sGateSubUnlocked').value.trim(),
      gate_sub_font:document.getElementById('sGateSubFont').value,
      gate_btn:document.getElementById('sGateBtn').value.trim(),gate_bg:document.getElementById('sGateBg').value.trim(),
      gate_accent:document.getElementById('sGateAccent').value.trim(),
      nav_title:document.getElementById('sNavTitle').value.trim(),
      nav_style:document.getElementById('sNavStyle').value,
      nav_align:document.getElementById('sNavAlign').value,
      nav_position:document.getElementById('sNavPosition').value,
      smooth_scroll:document.getElementById('sSmoothScroll').checked?'1':'0',
      scramble_title:document.getElementById('sScrambleTitle').checked?'1':'0',
      scramble_strings:document.getElementById('sScrambleStrings').value,
      theme_bg:document.getElementById('sThemeBg').value,
      theme_accent:document.getElementById('sThemeAccent').value,
      theme_text:document.getElementById('sThemeText').value,
      auth_foyer:document.getElementById('sAuthFoyer').checked?'1':'0',
      auth_google:document.getElementById('sAuthGoogle').checked?'1':'0',
      auth_github:document.getElementById('sAuthGithub').checked?'1':'0',
      auth_discord:document.getElementById('sAuthDiscord').checked?'1':'0',
      auth_magic:document.getElementById('sAuthMagic').checked?'1':'0',
      site_offline:document.getElementById('sSiteOffline').checked?'1':'0',
      site_public:document.getElementById('sSitePublic').checked?'1':'0',
      site_lockdown:document.getElementById('sSiteLockdown').checked?'1':'0',
      signup_block_vpn:document.getElementById('sSignupBlockVpn').checked?'1':'0',
      signup_domain_limit:String(parseInt(document.getElementById('sSignupDomainLimit').value,10)||0),
      signup_domain_window_h:String(parseInt(document.getElementById('sSignupDomainWindow').value,10)||24),
      signup_domain_exempt:document.getElementById('sSignupDomainExempt').value.trim()})});
  sp.style.display='none'; btn.disabled=false; ss.textContent=res.ok?'Saved.':'Error.';
});

let _navCustomLinks = [];
let _navPageOrder = null; // null = not loaded yet

async function loadNavEditor() {

  const res = await fetch('/api/nav/pages', { headers: authHeaders() });
  if (res.ok) {
    const pages = await res.json();
    renderNavPageList(pages);
  }

  const sRes = await fetch('/api/settings');
  if (sRes.ok) {
    const s = await sRes.json();
    try { _navCustomLinks = JSON.parse(s.nav_custom_links || '[]'); } catch { _navCustomLinks = []; }
  }
  renderNavCustomLinks();
}

function renderNavPageList(pages) {
  const el = document.getElementById('navPageList');
  if (!el) return;
  if (!pages.length) { el.innerHTML = '<p style="font-size:.62rem;color:var(--muted);font-weight:100;">No published pages yet.</p>'; return; }
  el.innerHTML = pages.map((p, i) => `
    <div class="nav-page-row" data-pid="${p.id}" data-idx="${i}" draggable="true" style="display:flex;align-items:center;gap:.6rem;padding:.45rem .6rem;border:1px solid var(--border);background:var(--surface);cursor:grab;">
      <span style="font-size:.9rem;color:var(--muted);cursor:grab;">⋮⋮</span>
      <span style="flex:1;font-weight:200;font-size:.72rem;color:rgba(220,245,225,.8);">${escHtml(p.title)}</span>
      <span style="font-size:.6rem;color:var(--muted);font-family:monospace;">${escHtml(p.slug)}</span>
      <select data-parent-pid="${p.id}" title="Sub-page of…" style="font-size:.58rem;font-weight:200;background:var(--bg);color:rgba(220,245,225,.8);border:1px solid var(--border);padding:.25rem .35rem;max-width:130px;">
        <option value="">— top level —</option>
        ${pages.filter(o => o.id !== p.id).map(o => `<option value="${escAttr(o.slug)}" ${p.parent === o.slug ? 'selected' : ''}>↳ ${escHtml(o.title)}</option>`).join('')}
      </select>
      <label style="display:flex;align-items:center;gap:.35rem;cursor:pointer;font-size:.6rem;color:var(--muted);">
        <input type="checkbox" data-nav-pid="${p.id}" ${p.show_in_nav ? 'checked' : ''} /> Show
      </label>
    </div>`).join('');

  let dragSrc = null;
  el.querySelectorAll('.nav-page-row').forEach(row => {
    row.addEventListener('dragstart', () => { dragSrc = row; row.style.opacity = '.4'; });
    row.addEventListener('dragend', () => { row.style.opacity = ''; });
    row.addEventListener('dragover', e => { e.preventDefault(); });
    row.addEventListener('drop', async () => {
      if (!dragSrc || dragSrc === row) return;
      const rows = [...el.querySelectorAll('.nav-page-row')];
      const from = rows.indexOf(dragSrc), to = rows.indexOf(row);
      rows.splice(from, 1); rows.splice(to, 0, dragSrc);
      rows.forEach(r => el.appendChild(r));
      await saveNavOrder(rows.map(r => +r.dataset.pid));
    });

    row.querySelector('input[type=checkbox]').addEventListener('change', async e => {
      const pid = +e.target.dataset.navPid;

      const pRes = await fetch(`/api/pages?slug=_id_${pid}`, { headers: authHeaders() });


      const allRes = await fetch('/api/pages', { headers: authHeaders() });
      if (!allRes.ok) return;
      const allPages = await allRes.json();
      const page = allPages.find(p => p.id === pid);
      if (!page) return;
      let state = {};
      try { state = JSON.parse(page.page_json || '{}'); } catch {}
      state.show_in_nav = e.target.checked;
      await fetch(`/api/pages/${pid}`, {
        method: 'PUT',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: page.title, slug: page.slug, page_json: JSON.stringify(state), is_published: page.is_published }),
      });
      toast(e.target.checked ? 'Added to nav' : 'Removed from nav');
    });

    row.querySelector('select[data-parent-pid]').addEventListener('change', async e => {
      const pid = +e.target.dataset.parentPid;
      const allRes = await fetch('/api/pages', { headers: authHeaders() });
      if (!allRes.ok) return;
      const allPages = await allRes.json();
      const page = allPages.find(p => p.id === pid);
      if (!page) return;
      let state = {};
      try { state = JSON.parse(page.page_json || '{}'); } catch {}
      if (e.target.value) state.parent = e.target.value; else delete state.parent;
      await fetch(`/api/pages/${pid}`, {
        method: 'PUT',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: page.title, slug: page.slug, page_json: JSON.stringify(state), is_published: page.is_published }),
      });
      toast(e.target.value ? 'Now a sub-page' : 'Moved to top level');
    });
  });
}

async function saveNavOrder(ids) {
  await fetch('/api/nav/order', {
    method: 'PUT',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ order: ids }),
  });
  toast('Nav order saved');
}

function renderNavCustomLinks() {
  const el = document.getElementById('navCustomLinks');
  if (!el) return;
  if (!_navCustomLinks.length) {
    el.innerHTML = '<p style="font-size:.62rem;font-weight:100;color:var(--muted);">No custom links yet.</p>';
  } else {
    el.innerHTML = _navCustomLinks.map((l, i) => `
      <div style="display:flex;gap:.4rem;align-items:center;">
        <input type="text" value="${escHtml(l.label||'')}" data-cli="${i}" data-clf="label" placeholder="Label" style="flex:1;background:var(--panel);border:1px solid var(--border);color:var(--white);font-size:.75rem;padding:.4rem .6rem;outline:none;font-family:inherit;" />
        <input type="url" value="${escHtml(l.url||'')}" data-cli="${i}" data-clf="url" placeholder="https://..." style="flex:2;background:var(--panel);border:1px solid var(--border);color:var(--white);font-size:.75rem;padding:.4rem .6rem;outline:none;font-family:inherit;" />
        <label style="display:flex;align-items:center;gap:.3rem;font-size:.58rem;color:var(--muted);white-space:nowrap;cursor:pointer;"><input type="checkbox" data-cli="${i}" data-clf="new_tab" ${l.new_tab!==false?'checked':''} />New tab</label>
        <button class="btn btn-xs" style="border-color:rgba(200,60,60,.3);color:rgba(200,80,80,.7);" data-cl-rm="${i}">✕</button>
      </div>`).join('');
    el.querySelectorAll('[data-cli][data-clf]').forEach(inp => {
      inp.addEventListener('change', () => {
        const i = +inp.dataset.cli, f = inp.dataset.clf;
        _navCustomLinks[i][f] = inp.type === 'checkbox' ? inp.checked : inp.value;
        saveNavCustomLinks();
      });
      if (inp.tagName === 'INPUT' && inp.type !== 'checkbox') {
        inp.addEventListener('blur', saveNavCustomLinks);
      }
    });
    el.querySelectorAll('[data-cl-rm]').forEach(btn => {
      btn.addEventListener('click', () => { _navCustomLinks.splice(+btn.dataset.clRm, 1); renderNavCustomLinks(); saveNavCustomLinks(); });
    });
  }
}

async function saveNavCustomLinks() {
  await fetch('/api/settings', {
    method: 'PUT',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ nav_custom_links: JSON.stringify(_navCustomLinks) }),
  });
}

document.getElementById('navAddCustomLink')?.addEventListener('click', () => {
  _navCustomLinks.push({ label: '', url: '', new_tab: true });
  renderNavCustomLinks();
});

document.getElementById('themePresets').addEventListener('click', e => {
  const btn = e.target.closest('[data-theme]');
  if (!btn) return;
  const t = JSON.parse(btn.dataset.theme);
  document.getElementById('sThemeBg').value    = t.theme_bg;
  document.getElementById('sThemeAccent').value = t.theme_accent;
  document.getElementById('sThemeText').value   = t.theme_text;
});

let _imgPickerCallback = null;



function cropImage(file) {
  return new Promise(resolve => {
    if (!/^image\//.test(file.type)) { resolve(file); return; }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const ov = document.createElement('div');
      ov.className = 'crop-overlay';
      ov.style.cssText = 'position:fixed;inset:0;z-index:9000;background:rgba(6,12,8,.92);backdrop-filter:blur(6px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;padding:1.5rem;';
      ov.innerHTML = `
        <div style="font-weight:200;font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;color:var(--accent);">Crop · ${escHtml(file.name)}</div>
        <div class="crop-stage" style="position:relative;line-height:0;max-width:90vw;max-height:62vh;box-shadow:0 20px 60px rgba(0,0,0,.6);touch-action:none;user-select:none;">
          <img class="crop-img" draggable="false" style="display:block;max-width:90vw;max-height:62vh;width:auto;height:auto;" />
          <div class="crop-box" style="position:absolute;border:1px solid rgba(255,255,255,.9);box-shadow:0 0 0 9999px rgba(6,12,8,.6);cursor:move;">
            ${['nw','ne','sw','se','n','s','e','w'].map(h=>`<div class="crop-h" data-h="${h}" style="position:absolute;width:14px;height:14px;background:var(--accent);border:1px solid rgba(0,0,0,.4);"></div>`).join('')}
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:.4rem;flex-wrap:wrap;justify-content:center;">
          ${[['free','Free'],['1','1:1'],['1.7778','16:9'],['1.3333','4:3'],['0.75','3:4']].map(([v,l],i)=>`<button class="crop-ar${i===0?' on':''}" data-ar="${v}" style="font-family:inherit;font-size:.58rem;letter-spacing:.1em;text-transform:uppercase;font-weight:200;padding:.35rem .7rem;border:1px solid var(--border);background:${i===0?'rgba(var(--accent-rgb),.18)':'transparent'};color:var(--white);cursor:pointer;">${l}</button>`).join('')}
        </div>
        <div style="display:flex;gap:.6rem;align-items:center;">
          <button class="crop-skip" style="font-family:inherit;font-size:.6rem;letter-spacing:.14em;text-transform:uppercase;font-weight:200;padding:.5rem 1rem;border:1px solid var(--border);background:transparent;color:var(--muted);cursor:pointer;">Use full image</button>
          <button class="crop-cancel" style="font-family:inherit;font-size:.6rem;letter-spacing:.14em;text-transform:uppercase;font-weight:200;padding:.5rem 1rem;border:1px solid rgba(200,60,60,.3);background:transparent;color:rgba(200,90,90,.8);cursor:pointer;">Cancel</button>
          <button class="crop-apply" style="font-family:inherit;font-size:.6rem;letter-spacing:.14em;text-transform:uppercase;font-weight:200;padding:.5rem 1.3rem;border:1px solid var(--accent);background:rgba(var(--accent-rgb),.2);color:var(--white);cursor:pointer;">Apply crop</button>
        </div>`;
      document.body.appendChild(ov);

      const elImg = ov.querySelector('.crop-img');
      elImg.src = url;
      const box = ov.querySelector('.crop-box');
      let dispW, dispH, ar = 'free';

      let cx, cy, cw, ch;

      function clamp() {
        cw = Math.max(20, Math.min(cw, dispW));
        ch = Math.max(20, Math.min(ch, dispH));
        cx = Math.max(0, Math.min(cx, dispW - cw));
        cy = Math.max(0, Math.min(cy, dispH - ch));
      }
      function draw() {
        box.style.left = cx + 'px'; box.style.top = cy + 'px';
        box.style.width = cw + 'px'; box.style.height = ch + 'px';
      }
      function place(h, x, y) {
        const m = -7, mid = 'calc(50% - 7px)', end = 'calc(100% - 7px)';
        box.querySelector(`[data-h="${h}"]`).style.cssText += `;${
          ({nw:`left:${m}px;top:${m}px;cursor:nwse-resize`,
            ne:`right:${m}px;top:${m}px;cursor:nesw-resize`,
            sw:`left:${m}px;bottom:${m}px;cursor:nesw-resize`,
            se:`right:${m}px;bottom:${m}px;cursor:nwse-resize`,
            n:`left:${mid};top:${m}px;cursor:ns-resize`,
            s:`left:${mid};bottom:${m}px;cursor:ns-resize`,
            e:`right:${m}px;top:${mid};cursor:ew-resize`,
            w:`left:${m}px;top:${mid};cursor:ew-resize`})[h]}`;
      }
      ['nw','ne','sw','se','n','s','e','w'].forEach(h => place(h));

      function init() {
        const r = elImg.getBoundingClientRect();
        dispW = r.width; dispH = r.height;
        cw = dispW; ch = dispH; cx = 0; cy = 0;
        applyAr(); draw();
      }
      function applyAr() {
        if (ar === 'free') return;
        const a = parseFloat(ar);

        let nw = cw, nh = nw / a;
        if (nh > ch) { nh = ch; nw = nh * a; }
        cx += (cw - nw) / 2; cy += (ch - nh) / 2; cw = nw; ch = nh;
        clamp();
      }

      let drag = null;
      function down(e, mode) {
        e.preventDefault();
        const p = 'touches' in e ? e.touches[0] : e;
        drag = { mode, sx: p.clientX, sy: p.clientY, cx, cy, cw, ch };
      }
      function move(e) {
        if (!drag) return;
        const p = 'touches' in e ? e.touches[0] : e;
        let dx = p.clientX - drag.sx, dy = p.clientY - drag.sy;
        if (drag.mode === 'move') { cx = drag.cx + dx; cy = drag.cy + dy; clamp(); draw(); return; }
        let L = drag.cx, T = drag.cy, R = drag.cx + drag.cw, B = drag.cy + drag.ch;
        const m = drag.mode;
        if (m.includes('w')) L = drag.cx + dx;
        if (m.includes('e')) R = drag.cx + drag.cw + dx;
        if (m.includes('n')) T = drag.cy + dy;
        if (m.includes('s')) B = drag.cy + drag.ch + dy;
        L = Math.max(0, Math.min(L, R - 20)); T = Math.max(0, Math.min(T, B - 20));
        R = Math.min(dispW, Math.max(R, L + 20)); B = Math.min(dispH, Math.max(B, T + 20));
        cx = L; cy = T; cw = R - L; ch = B - T;
        if (ar !== 'free') {
          const a = parseFloat(ar);
          if (m === 'n' || m === 's') cw = ch * a; else ch = cw / a;
          clamp();
        }
        draw();
      }
      function up() { drag = null; }

      box.addEventListener('mousedown', e => { if (e.target === box) down(e, 'move'); });
      box.addEventListener('touchstart', e => { if (e.target === box) down(e, 'move'); }, { passive: false });
      box.querySelectorAll('.crop-h').forEach(h => {
        h.addEventListener('mousedown', e => { e.stopPropagation(); down(e, h.dataset.h); });
        h.addEventListener('touchstart', e => { e.stopPropagation(); down(e, h.dataset.h); }, { passive: false });
      });
      window.addEventListener('mousemove', move);
      window.addEventListener('touchmove', move, { passive: false });
      window.addEventListener('mouseup', up);
      window.addEventListener('touchend', up);

      ov.querySelectorAll('.crop-ar').forEach(b => {
        b.addEventListener('click', () => {
          ov.querySelectorAll('.crop-ar').forEach(o => { o.classList.remove('on'); o.style.background = 'transparent'; });
          b.classList.add('on'); b.style.background = 'rgba(var(--accent-rgb),.18)';
          ar = b.dataset.ar; applyAr(); draw();
        });
      });

      function teardown() {
        window.removeEventListener('mousemove', move); window.removeEventListener('touchmove', move);
        window.removeEventListener('mouseup', up); window.removeEventListener('touchend', up);
        URL.revokeObjectURL(url); ov.remove();
      }
      ov.querySelector('.crop-cancel').addEventListener('click', () => { teardown(); resolve(null); });
      ov.querySelector('.crop-skip').addEventListener('click', () => { teardown(); resolve(file); });
      ov.querySelector('.crop-apply').addEventListener('click', () => {
        const scale = img.naturalWidth / dispW;
        const sx = Math.round(cx * scale), sy = Math.round(cy * scale);
        const sw = Math.max(1, Math.round(cw * scale)), sh = Math.max(1, Math.round(ch * scale));
        const canvas = document.createElement('canvas');
        canvas.width = sw; canvas.height = sh;
        canvas.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
        canvas.toBlob(blob => {
          teardown();
          if (!blob) { resolve(file); return; }
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' }));
        }, 'image/jpeg', 0.92);
      });

      if (elImg.complete && elImg.naturalWidth) requestAnimationFrame(init);
      else elImg.onload = () => requestAnimationFrame(init);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

async function compressImage(file, maxPx=1200, quality=0.75) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > maxPx || h > maxPx) {
          if (w > h) { h = Math.round(h * maxPx / w); w = maxPx; }
          else       { w = Math.round(w * maxPx / h); h = maxPx; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        const data = canvas.toDataURL('image/jpeg', quality);
        const size = Math.round((data.length * 3) / 4);
        resolve({ data, size, mime: 'image/jpeg' });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function fmtBytes(b) {
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b/1024).toFixed(1) + ' KB';
  return (b/1048576).toFixed(1) + ' MB';
}

let _imgList = [];

async function fetchImages() {
  const res = await fetch('/api/images', { headers: authHeaders() });
  if (!res.ok) return;
  _imgList = await res.json();
}

function renderImgTabGallery() {
  const gallery = document.getElementById('imgTabGallery');
  if (!gallery) return;
  if (!_imgList.length) {
    gallery.innerHTML = '<p style="font-weight:200;font-size:.68rem;color:var(--muted);">No images yet — upload one above.</p>';
    return;
  }
  gallery.innerHTML = _imgList.map(img => `
    <div class="img-card" data-img-id="${img.id}">
      <img src="/api/images/${img.id}" alt="${escHtml(img.name)}" />
      <div class="img-card-body">
        <input class="img-card-name-input" type="text" value="${escHtml(img.name||'')}" placeholder="name" data-rename-id="${img.id}" title="Click to rename" />
        <div class="img-card-ref">/api/images/${img.id}</div>
        <div class="img-card-actions">
          <button class="img-card-copy" data-copy="/api/images/${img.id}">Copy URL</button>
          <button class="img-card-copy" data-recrop="${img.id}">Crop</button>
          <button class="img-card-del" data-del="${img.id}">Delete</button>
        </div>
      </div>
    </div>`).join('');

  gallery.querySelectorAll('[data-rename-id]').forEach(inp => {
    let timer;
    inp.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        const id = inp.dataset.renameId;
        const name = inp.value.trim();
        await fetch(`/api/images/${id}`, {
          method: 'PUT',
          headers: { ...authHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        });
        const img = _imgList.find(i => i.id == id);
        if (img) img.name = name;
      }, 600);
    });
  });

  gallery.querySelectorAll('[data-del]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!await dlg.confirm('Delete this image?', { danger: true, confirm: 'Delete' })) return;
      await fetch(`/api/images/${btn.dataset.del}`, { method: 'DELETE', headers: authHeaders() });
      _imgList = _imgList.filter(i => i.id != btn.dataset.del);
      renderImgTabGallery();
    });
  });

  gallery.querySelectorAll('[data-recrop]').forEach(btn => {
    btn.addEventListener('click', () => recropImage(btn.dataset.recrop));
  });

  gallery.querySelectorAll('[data-copy]:not([data-recrop])').forEach(btn => {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(location.origin + btn.dataset.copy);
      toast('URL copied');
    });
  });
}

async function uploadFiles(files, nameOverride) {
  for (const original of files) {
    const file = await cropImage(original);   // admin frames each image; null = cancelled
    if (!file) { toast(`Skipped ${original.name}`); continue; }
    const { data, size, mime } = await compressImage(file);
    if (size > 900000) { toast(`${file.name} too large after compression (${fmtBytes(size)})`, true); continue; }
    const name = nameOverride || file.name.replace(/\.[^.]+$/, '');
    const res = await fetch('/api/images', {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, data, mime, size }),
    });
    if (res.ok) {
      const { id } = await res.json();
      _imgList.unshift({ id, name, size, created_at: new Date().toISOString() });
      toast(`Uploaded: ${name}`);
    } else {
      toast(`Failed to upload ${file.name}`, true);
    }
  }
  renderImgTabGallery();
  if (document.getElementById('imgPickerOverlay')?.classList.contains('open')) {
    openImgPicker(_imgPickerCallback);
  }
}

document.getElementById('imgFileInput').addEventListener('change', e => {
  if (e.target.files.length) uploadFiles(Array.from(e.target.files), null);
  e.target.value = '';
});

document.getElementById('imgTabFileInput').addEventListener('change', e => {
  if (e.target.files.length) {
    const nameOverride = document.getElementById('imgUploadName').value.trim() || null;
    uploadFiles(Array.from(e.target.files), nameOverride);
    document.getElementById('imgUploadName').value = '';
  }
  e.target.value = '';
});



async function openCamera() {
  if (!navigator.mediaDevices?.getUserMedia) { toast('Camera not supported on this device.', true); return; }
  let stream = null, facing = 'environment', shotBlob = null;
  const ov = document.createElement('div');
  ov.className = 'cam-ov';
  ov.innerHTML = `
    <video class="cam-video" autoplay playsinline muted></video>
    <img class="cam-shot" alt="" />
    <div class="cam-top"><button class="cam-x" id="camX" aria-label="Close">✕</button></div>
    <div class="cam-bar" id="camBar">
      <button class="cam-flip" id="camFlip" aria-label="Flip camera"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg></button>
      <button class="cam-shutter" id="camShutter" aria-label="Take photo"></button>
      <span style="width:48px;"></span>
    </div>
    <div class="cam-confirm" id="camConfirm">
      <button class="cam-retake" id="camRetake">Retake</button>
      <button class="cam-use" id="camUse">Use photo</button>
    </div>`;
  document.body.appendChild(ov);
  const video = ov.querySelector('.cam-video'), shot = ov.querySelector('.cam-shot');
  const showLive = (live) => {
    video.style.display = live ? '' : 'none';
    shot.style.display = live ? 'none' : '';
    ov.querySelector('#camBar').style.display = live ? '' : 'none';
    ov.querySelector('#camConfirm').style.display = live ? 'none' : 'flex';
  };
  const stop = () => { if (stream) stream.getTracks().forEach(t => t.stop()); stream = null; };
  const close = () => { stop(); if (shot.src) URL.revokeObjectURL(shot.src); ov.remove(); };
  async function start() {
    stop();
    try { stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing }, audio: false }); video.srcObject = stream; }
    catch { toast('Couldn’t open the camera — check permissions.', true); close(); }
  }
  ov.querySelector('#camX').onclick = close;
  ov.querySelector('#camFlip').onclick = () => { facing = facing === 'environment' ? 'user' : 'environment'; start(); };
  ov.querySelector('#camShutter').onclick = () => {
    const w = video.videoWidth, hh = video.videoHeight; if (!w) return;
    const cv = document.createElement('canvas'); cv.width = w; cv.height = hh;
    cv.getContext('2d').drawImage(video, 0, 0, w, hh);
    cv.toBlob(b => { if (!b) return; shotBlob = b; if (shot.src) URL.revokeObjectURL(shot.src); shot.src = URL.createObjectURL(b); showLive(false); }, 'image/jpeg', 0.92);
  };
  ov.querySelector('#camRetake').onclick = () => { shotBlob = null; showLive(true); };
  ov.querySelector('#camUse').onclick = () => {
    if (!shotBlob) return;
    const file = new File([shotBlob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
    const nameOverride = document.getElementById('imgUploadName')?.value.trim() || null;
    close();
    uploadFiles([file], nameOverride);   // crop → compress → POST /api/images (D1)
  };
  showLive(true);
  await start();
}
document.getElementById('imgCamBtn')?.addEventListener('click', openCamera);

async function recropImage(id) {
  let resp = null;
  try { resp = await fetch(`/api/images/${id}?t=${Date.now()}`, { cache: 'reload' }); } catch {}
  if (!resp || !resp.ok) { toast('Couldn’t load that image.', true); return; }
  const blob = await resp.blob();
  const file = new File([blob], `image-${id}.jpg`, { type: blob.type || 'image/jpeg' });
  const cropped = await cropImage(file);
  if (!cropped) return;   // cancelled
  const { data, size, mime } = await compressImage(cropped);
  if (size > 900000) { toast(`Too large after crop (${fmtBytes(size)})`, true); return; }
  const r = await fetch(`/api/images/${id}`, {
    method: 'PUT', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ data, mime, size }),
  });
  if (!r.ok) { toast('Crop failed to save.', true); return; }
  toast('Image updated ✓');
  const thumb = document.querySelector(`.img-card[data-img-id="${id}"] img`);
  if (thumb) thumb.src = `/api/images/${id}?t=${Date.now()}`;   // bust the cached thumbnail
}

let _fileList = [];

function fileIcon(mime) {
  if (mime.includes('pdf')) return '📄';
  if (mime.includes('zip') || mime.includes('compressed')) return '🗜';
  if (mime.includes('word') || mime.includes('document')) return '📝';
  if (mime.includes('audio')) return '🎵';
  if (mime.includes('video')) return '🎬';
  return '📁';
}

function renderFileList() {
  const el = document.getElementById('fileList');
  if (!el) return;
  if (!_fileList.length) {
    el.innerHTML = '<p style="font-weight:200;font-size:.68rem;color:var(--muted);">No files yet — upload one above.</p>';
    return;
  }
  el.innerHTML = _fileList.map(f => `
    <div class="file-card" data-fid="${f.id}">
      <div class="file-card-ico">${fileIcon(f.mime)}</div>
      <div class="file-card-body">
        <div class="file-card-name">${escHtml(f.name||'Unnamed file')}</div>
        <div class="file-card-meta">${escHtml(f.mime)} · ${fmtBytes(f.size)}</div>
      </div>
      <div class="file-card-actions">
        <button class="file-card-copy" data-copy="/api/files/${f.id}">Copy URL</button>
        <button class="file-card-del" data-fdel="${f.id}">Delete</button>
      </div>
    </div>`).join('');
  el.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => { navigator.clipboard.writeText(location.origin + btn.dataset.copy); toast('URL copied'); });
  });
  el.querySelectorAll('[data-fdel]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!await dlg.confirm('Delete this file?', { danger: true, confirm: 'Delete' })) return;
      await fetch(`/api/files/${btn.dataset.fdel}`, { method: 'DELETE', headers: authHeaders() });
      _fileList = _fileList.filter(f => f.id != btn.dataset.fdel);
      renderFileList();
    });
  });
}

async function fetchAndRenderFiles() {
  const res = await fetch('/api/files', { headers: authHeaders() });
  if (!res.ok) return;
  _fileList = await res.json();
  renderFileList();
}

async function uploadFileItems(files) {
  for (const file of files) {
    const MAX = 1.5 * 1024 * 1024;
    if (file.size > MAX) { toast(`${file.name} is too large (max ~1.5 MB)`, true); continue; }
    const data = await new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
    const size = Math.round((data.length * 3) / 4);
    const res = await fetch('/api/files', {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: file.name, data, mime: file.type || 'application/octet-stream', size }),
    });
    if (res.ok) {
      const { id } = await res.json();
      _fileList.unshift({ id, name: file.name, mime: file.type || 'application/octet-stream', size });
      toast(`Uploaded: ${file.name}`);
    } else {
      toast(`Failed to upload ${file.name}`, true);
    }
  }
  renderFileList();
}

const fileTabInput = document.getElementById('fileTabInput');
fileTabInput.addEventListener('change', e => {
  if (e.target.files.length) uploadFileItems(Array.from(e.target.files));
  e.target.value = '';
});

const fileUploadZone = fileTabInput.closest('.img-upload-zone');
fileUploadZone.addEventListener('dragover', e => { e.preventDefault(); fileUploadZone.classList.add('drag-over'); });
fileUploadZone.addEventListener('dragleave', () => fileUploadZone.classList.remove('drag-over'));
fileUploadZone.addEventListener('drop', e => {
  e.preventDefault(); fileUploadZone.classList.remove('drag-over');
  if (e.dataTransfer.files.length) uploadFileItems(Array.from(e.dataTransfer.files));
});

function openImgPicker(callback) {
  _imgPickerCallback = callback;
  const grid = document.getElementById('imgPickerGrid');
  const overlay = document.getElementById('imgPickerOverlay');
  grid.innerHTML = _imgList.length
    ? _imgList.map(img => `<div class="img-picker-item" data-id="${img.id}" title="${escHtml(img.name||'')}"><img src="/api/images/${img.id}" alt="" /><div class="img-picker-item-name">${escHtml(img.name||'untitled')}</div><div style="font-size:.5rem;color:rgba(77,189,106,.35);padding:0 .4rem .35rem;font-family:monospace;">/api/images/${img.id}</div></div>`).join('')
    : '<p style="font-weight:200;font-size:.68rem;color:var(--muted);padding:1rem;">No images yet — go to the Images tab to upload.</p>';
  grid.querySelectorAll('[data-id]').forEach(el => {
    el.addEventListener('click', () => {
      if (_imgPickerCallback) _imgPickerCallback(`/api/images/${el.dataset.id}`);
      overlay.classList.remove('open');
    });
  });
  overlay.classList.add('open');
}

document.getElementById('imgPickerClose').addEventListener('click', () => {
  document.getElementById('imgPickerOverlay').classList.remove('open');
});

let _filePickerCallback = null;
function openFilePicker(callback) {
  _filePickerCallback = callback;
  const overlay = document.getElementById('filePickerOverlay');
  const list = document.getElementById('filePickerList');
  fetch('/api/files', { headers: authHeaders() }).then(r => r.json()).then(files => {
    if (!files.length) { list.innerHTML='<p style="font-weight:200;font-size:.68rem;color:var(--muted);padding:1rem;">No files yet — go to the Files tab to upload.</p>'; return; }
    list.innerHTML = files.map(f => `<div class="file-pick-row" data-furl="/api/files/${f.id}"><span style="font-size:1.1rem;">${fileIcon(f.mime)}</span><span class="file-pick-row-name">${escHtml(f.name)}</span><span class="file-pick-row-meta">${fmtBytes(f.size)}</span></div>`).join('');
    list.querySelectorAll('[data-furl]').forEach(row => {
      row.addEventListener('click', () => { if (_filePickerCallback) _filePickerCallback(row.dataset.furl); overlay.classList.remove('open'); });
    });
  }).catch(() => { list.innerHTML='<p style="color:var(--muted);padding:1rem;font-size:.7rem;">Error loading files.</p>'; });
  overlay.classList.add('open');
}
document.getElementById('filePickerClose').addEventListener('click', () => {
  document.getElementById('filePickerOverlay').classList.remove('open');
});

async function fetchBlocklist() {
  const res = await fetch('/api/banned-emails', { headers: authHeaders() });
  if (!res.ok) return;
  const list = await res.json();
  const el = document.getElementById('blocklistItems');
  if (!el) return;
  if (!list.length) {
    el.innerHTML = '<p style="font-size:.65rem;font-weight:100;color:var(--muted);">No emails blocked yet.</p>';
    return;
  }
  el.innerHTML = list.map(row => `
    <div style="display:flex;align-items:center;gap:.6rem;padding:.5rem .75rem;border:1px solid rgba(77,189,106,.08);background:rgba(200,60,60,.04);">
      <span style="flex:1;font-size:.72rem;font-weight:200;color:rgba(220,245,225,.75);font-family:monospace;">${escHtml(row.email)}</span>
      <span style="font-size:.55rem;font-weight:100;color:var(--muted);white-space:nowrap;">${timeAgo(row.banned_at)}</span>
      <button class="bl-remove-btn" data-email="${escHtml(row.email)}" style="font-family:'Josefin Sans',sans-serif;font-weight:200;font-size:.5rem;letter-spacing:.18em;text-transform:uppercase;padding:.22rem .6rem;border:1px solid rgba(200,60,60,.3);background:transparent;color:rgba(200,80,80,.7);cursor:pointer;">Remove</button>
    </div>`).join('');
  el.querySelectorAll('.bl-remove-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!await dlg.confirm(`Remove ${btn.dataset.email} from blocklist? This will also restore any linked accounts.`, { confirm: 'Remove', danger: false })) return;
      await fetch(`/api/banned-emails/${encodeURIComponent(btn.dataset.email)}`, { method: 'DELETE', headers: authHeaders() });
      fetchBlocklist();
    });
  });
}

document.getElementById('blocklistAddBtn').addEventListener('click', async () => {
  const input = document.getElementById('blocklistEmailInput');
  const email = input.value.trim().toLowerCase();
  if (!email) return;
  const res = await fetch('/api/banned-emails', {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) { await dlg.alert('Failed to add email to blocklist.'); return; }
  input.value = '';
  toast(`Blocked: ${email}`);
  fetchBlocklist();
});

document.getElementById('blocklistEmailInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('blocklistAddBtn').click();
});

document.querySelectorAll('.tab-btn[data-tab="settings"]').forEach(btn => {
  btn.addEventListener('click', () => { fetchBlocklist(); fetchAllowlist(); });
});

async function fetchAllowlist() {
  const res = await fetch('/api/allowed-emails', { headers: authHeaders() });
  if (!res.ok) return;
  const list = await res.json();
  const el = document.getElementById('allowlistItems');
  if (!el) return;
  if (!list.length) {
    el.innerHTML = '<p style="font-size:.65rem;font-weight:100;color:var(--muted);">No emails allowlisted yet.</p>';
    return;
  }
  el.innerHTML = list.map(row => `
    <div style="display:flex;align-items:center;gap:.6rem;padding:.5rem .75rem;border:1px solid rgba(var(--accent-rgb),.12);background:rgba(var(--accent-rgb),.04);">
      <span style="flex:1;font-size:.72rem;font-weight:200;color:rgba(220,245,225,.75);font-family:monospace;">${escHtml(row.email)}</span>
      <span style="font-size:.55rem;font-weight:100;color:var(--muted);white-space:nowrap;">${timeAgo(row.added_at)}</span>
      <button class="al-remove-btn" data-email="${escHtml(row.email)}" style="font-family:'Josefin Sans',sans-serif;font-weight:200;font-size:.5rem;letter-spacing:.18em;text-transform:uppercase;padding:.22rem .6rem;border:1px solid rgba(var(--accent-rgb),.3);background:transparent;color:rgba(var(--accent-rgb),.8);cursor:pointer;">Remove</button>
    </div>`).join('');
  el.querySelectorAll('.al-remove-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!await dlg.confirm(`Remove ${btn.dataset.email} from the allowlist?`, { confirm: 'Remove' })) return;
      await fetch(`/api/allowed-emails/${encodeURIComponent(btn.dataset.email)}`, { method: 'DELETE', headers: authHeaders() });
      fetchAllowlist();
    });
  });
}
document.getElementById('allowlistAddBtn').addEventListener('click', async () => {
  const input = document.getElementById('allowlistEmailInput');
  const email = input.value.trim().toLowerCase();
  if (!email) return;
  const res = await fetch('/api/allowed-emails', {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) { await dlg.alert('Failed to add email to allowlist.'); return; }
  input.value = '';
  toast(`Allowed: ${email}`);
  fetchAllowlist();
});
document.getElementById('allowlistEmailInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('allowlistAddBtn').click();
});


document.getElementById('pushUiUpdateBtn')?.addEventListener('click', pushUiUpdate);

document.querySelectorAll('.set-cat').forEach(b => b.addEventListener('click', () => {
  const cat = b.dataset.cat;
  document.querySelectorAll('.set-cat').forEach(x => x.classList.toggle('active', x === b));
  document.querySelectorAll('.set-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === cat));
}));

init(); // called here so all scripts are loaded first
