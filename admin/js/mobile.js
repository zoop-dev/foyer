

function isMobile() { return window.innerWidth <= 640; }

const M_SECTIONS = [
  { tab: 'builder',   label: 'Page Builder', ico: '▦' },
  { tab: 'images',    label: 'Images',       ico: '🖼' },
  { tab: 'files',     label: 'Files',        ico: '📄' },
  { tab: 'settings',  label: 'Settings',     ico: '⚙' },
  { tab: 'tutorials', label: 'Tutorials',    ico: '🎓' },
  { tab: 'reviews',   label: 'Reviews',      ico: '★' },
  { tab: 'analytics', label: 'Analytics',    ico: '📊' },
];
let mCurTab = 'builder';
let mSheetMode = '';   // 'editor' | 'pages' | 'newpage' | 'theme'

function mSyncTitle() {
  const el = document.getElementById('mTitle'); if (!el) return;
  if (mCurTab === 'builder') {
    const p = (typeof bldPages !== 'undefined') ? bldPages.find(p => p.id === bldPageId) : null;
    el.textContent = p ? (p.title || 'Untitled') : 'Builder';
  } else {
    el.textContent = (M_SECTIONS.find(s => s.tab === mCurTab) || {}).label || 'Admin';
  }
}
function mSetActions() {
  const el = document.getElementById('mActions'); if (!el) return;
  if (mCurTab === 'builder') {
    el.innerHTML = `<button class="btn btn-xs" id="mPreview" title="Preview">↗</button><button class="btn btn-primary btn-xs" id="mPublish">Publish</button>`;
    el.querySelector('#mPreview').onclick = () => document.getElementById('bldPreview')?.click();
    el.querySelector('#mPublish').onclick = () => document.getElementById('bldPublish')?.click();
  } else {
    el.innerHTML = '';
  }
}

function mBuildMenu() {
  const list = document.getElementById('mMenuList'); if (!list) return;
  const visible = M_SECTIONS.filter(s => {
    const btn = document.querySelector(`.tab-btn[data-tab="${s.tab}"]`);
    return !(btn && btn.style.display === 'none');   // respect hidden-tab setting
  });
  list.innerHTML = visible.map(s => `<button class="m-menu-item${s.tab === mCurTab ? ' on' : ''}" data-tab="${s.tab}"><span class="m-menu-ico">${s.ico}</span>${s.label}${s.tab === 'analytics' ? '<span class="m-menu-badge" id="mMenuBadge" style="display:none"></span>' : ''}</button>`).join('');
  list.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => { mSwitch(b.dataset.tab); mCloseMenu(); }));
  mSyncMenuBadge();
}
function mOpenMenu() { mBuildMenu(); document.getElementById('mMenu').classList.add('open'); }
function mCloseMenu() { document.getElementById('mMenu').classList.remove('open'); }

function mSyncMenuBadge() {
  const badge = document.getElementById('mMenuBadge'); const vis = document.getElementById('visBadge');
  if (badge && vis) { badge.textContent = vis.textContent; badge.style.display = (vis.textContent || '').trim() ? '' : 'none'; }
}

function mSwitch(tab) {
  mCurTab = tab;
  const btn = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
  if (btn) btn.click();   // runs the full desktop switch + data loaders
  mSyncTitle(); mSetActions();
  if (tab === 'builder') mRenderBlockList();
}

function mOpenSheet(title, html, compact) {
  const sheet = document.getElementById('mSheet'), body = document.getElementById('mSheetBody');
  mRescueTheme();   // never let innerHTML destroy the live theme controls
  document.getElementById('mSheetTitle').textContent = title || '';
  body.innerHTML = html;
  sheet.classList.toggle('compact', !!compact);
  document.getElementById('mSheetBack').classList.add('open');
  sheet.classList.add('open');
}
function mCloseSheet() {
  if (mSheetMode === 'theme') mRescueTheme();
  if (mSheetMode === 'editor') { bldSel = null; bldParentId = null; mRenderBlockList(); }
  mSheetMode = '';
  document.getElementById('mSheet').classList.remove('open');
  document.getElementById('mSheetBack').classList.remove('open');
}

function mRescueTheme() {
  const bar = document.querySelector('.bld-topbar');
  if (bar) document.querySelectorAll('#mSheetBody .bld-tc').forEach(tc => bar.appendChild(tc));
}

function mBlockRow(s) {
  const cat = (typeof BLOCK_CATALOG !== 'undefined') ? BLOCK_CATALOG.find(b => b.t === s.type) : null;
  const ico = (cat && cat.i) || '▫';
  const label = (typeof BLK_LABEL !== 'undefined' && BLK_LABEL[s.type]) || s.type;
  const wl = s.width === 'half' ? '½' : s.width === 'third' ? '⅓' : 'Full';
  let preview;
  if (s.type === 'group') {
    const n = (s.sections || []).length;
    preview = `<div class="m-block-empty">${escHtml(s.label || 'Group')} · ${n} section${n === 1 ? '' : 's'} · tap Edit</div>`;
  } else {
    preview = bRender(s, bldState) || `<div class="m-block-empty">Empty — tap Edit to fill it in</div>`;
  }
  const bg = (typeof bldBgCss === 'function') ? bldBgCss() : (bldState.bg || '#020a03');
  return `<div class="m-block${bldSel === s.id ? ' sel' : ''}" data-sid="${s.id}">
    <div class="m-block-bar">
      <span class="m-block-handle" title="Drag to reorder">⠿</span>
      <span class="m-block-ico">${ico}</span>
      <span class="m-block-label">${escHtml(label)}</span>
      <button class="m-block-w" title="Column width">${wl}</button>
      <button class="m-block-edit">Edit</button>
      <button class="m-block-del" aria-label="Delete">✕</button>
    </div>
    <div class="m-block-prev" style="background:${bg};">${preview}</div>
  </div>`;
}
function mRenderBlockList() {
  if (!isMobile()) return;
  const col = document.querySelector('#sec-builder .bld-canvas-col'); if (!col) return;
  let list = document.getElementById('mBldList');
  if (!list) { list = document.createElement('div'); list.id = 'mBldList'; list.className = 'm-blist'; col.appendChild(list); }
  const secs = (typeof bldState !== 'undefined' && bldState.sections) || [];
  if (!bldPageId) { list.innerHTML = `<div class="m-blist-empty">Pick or create a page to start.<br>Tap the page name above.</div>`; return; }
  if (!secs.length) { list.innerHTML = `<div class="m-blist-empty">No sections yet.<br>Tap <b>＋ Section</b> to start building.</div>`; return; }

  const grouped = (typeof groupRows === 'function') ? groupRows(secs) : secs.map(s => [s]);
  list.innerHTML = grouped.map(r => r.length === 1 ? mBlockRow(r[0]) : `<div class="m-blist-row">${r.map(mBlockRow).join('')}</div>`).join('');
  list.querySelectorAll('.m-block').forEach(row => {
    const id = row.dataset.sid;
    const edit = () => { bldSel = id; bldParentId = null; mOpenEditor(id); };
    row.querySelector('.m-block-edit').addEventListener('click', e => { e.stopPropagation(); edit(); });
    row.querySelector('.m-block-prev').addEventListener('click', edit);
    row.querySelector('.m-block-del').addEventListener('click', e => { e.stopPropagation(); mDeleteBlock(id); });
    row.querySelector('.m-block-w').addEventListener('click', e => { e.stopPropagation(); mToggleWidth(id); });
    mWireDrag(row);
    const prev = row.querySelector('.m-block-prev');
    if (prev.scrollHeight > 320) prev.classList.add('tall');
  });
}
function mDeleteBlock(id) {
  bldState.sections = bldState.sections.filter(x => x.id !== id);
  if (bldSel === id) { bldSel = null; bldParentId = null; if (mSheetMode === 'editor') { mSheetMode = ''; document.getElementById('mSheet').classList.remove('open'); document.getElementById('mSheetBack').classList.remove('open'); } }
  bldDrawCanvas();
}
function mToggleWidth(id) {
  const s = bldState.sections.find(x => x.id === id); if (!s) return;
  const cur = s.width || 'full';
  s.width = cur === 'full' ? 'half' : cur === 'half' ? 'third' : 'full';
  bldDrawCanvas();
}


function mWireDrag(row) {
  const bar = row.querySelector('.m-block-bar');
  bar.addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return;   // edit / width / delete taps pass through
    e.preventDefault();
    const list = row.parentElement;
    const startY = e.clientY;
    let dragging = false;
    try { bar.setPointerCapture(e.pointerId); } catch (_) {}
    const move = ev => {
      if (!dragging) {
        if (Math.abs(ev.clientY - startY) < 5) return;   // small threshold so taps still register
        dragging = true; row.classList.add('m-dragging');
      }
      const rows = Array.from(list.querySelectorAll('.m-block'));
      const after = rows.find(r => {
        if (r === row) return false;
        const b = r.getBoundingClientRect();
        return ev.clientY < b.top + b.height / 2;
      });
      if (after) list.insertBefore(row, after); else list.appendChild(row);
    };
    const up = () => {
      bar.removeEventListener('pointermove', move);
      bar.removeEventListener('pointerup', up);
      if (!dragging) return;
      row.classList.remove('m-dragging');
      const order = Array.from(list.querySelectorAll('.m-block')).map(r => r.dataset.sid);
      bldState.sections.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
      bldDrawCanvas();
    };
    bar.addEventListener('pointermove', move);
    bar.addEventListener('pointerup', up);
  });
}

function mOpenEditor(id) {
  const found = bldFindSection(id); if (!found || !found.sec) return;
  const sec = found.sec;
  const { html, label } = bEditorFields(sec);
  mSheetMode = 'editor';
  mOpenSheet(label, `<div class="bld-ep">${html}</div>`, false);
  bBindEditor(document.getElementById('mSheetBody'), sec, (s, mode) => {
    bldSaveDraft();
    if (mode === 'group-edit') { mOpenEditor(bldSel); return; }   // entered a group child
    if (mode === 're-editor') mOpenEditor(id);                    // list add/remove → re-render fields
  });
}

function mOpenPages() {
  const rows = (bldPages || []).map(p => `<div class="m-page-row${p.id === bldPageId ? ' on' : ''}" data-pid="${p.id}"><div><div class="m-page-row-t">${escHtml(p.title || 'Untitled')}</div><div class="m-page-row-s">${escHtml(p.slug || '')}</div></div>${p.id === bldPageId ? '<span style="color:var(--accent)">●</span>' : ''}</div>`).join('') || '<p style="color:var(--muted);font-size:.8rem;padding:1rem 0;">No pages yet.</p>';
  mSheetMode = 'pages';
  mOpenSheet('Pages', rows + `<button class="btn btn-primary" style="width:100%;margin-top:.7rem" id="mNewPage">+ New page</button>`, true);
  document.querySelectorAll('#mSheetBody [data-pid]').forEach(r => r.addEventListener('click', () => {
    bldPickPage(+r.dataset.pid); mCloseSheet(); mSyncTitle(); mUpdatePageChip(); mRenderBlockList();
  }));
  document.getElementById('mNewPage').addEventListener('click', mNewPageForm);
}
function mNewPageForm() {
  mSheetMode = 'newpage';
  mOpenSheet('New page', `
    <div class="bld-ef"><label>Page title</label><input type="text" id="mNPTitle" placeholder="About" /></div>
    <div class="bld-ef"><label>Slug — URL path</label><input type="text" id="mNPSlug" placeholder="/about" /></div>
    <p style="font-size:.62rem;color:var(--muted);margin:.2rem 0 .8rem;">Leave slug blank to auto-generate from the title.</p>
    <button class="btn btn-primary" style="width:100%" id="mNPCreate">Create page</button>`, true);
  document.getElementById('mNPCreate').addEventListener('click', () => {
    const t = document.getElementById('mNPTitle').value, s = document.getElementById('mNPSlug').value;
    const dt = document.getElementById('bldNPTitle'), ds = document.getElementById('bldNPSlug');
    if (dt) dt.value = t; if (ds) ds.value = s;
    document.getElementById('bldNPCreate')?.click();
    mCloseSheet();
    setTimeout(() => { mSyncTitle(); mUpdatePageChip(); mRenderBlockList(); }, 400);
  });
}
function mUpdatePageChip() {
  const el = document.getElementById('mBldPageName'); if (!el) return;
  const p = (bldPages || []).find(p => p.id === bldPageId);
  el.textContent = p ? (p.title || 'Untitled') : 'Pick a page';
}

function mOpenTheme() {
  mSheetMode = 'theme';
  mOpenSheet('Theme & background', '<div id="mThemeHost"></div>', false);
  const host = document.getElementById('mThemeHost');
  document.querySelectorAll('.bld-topbar .bld-tc').forEach(tc => host.appendChild(tc));
}

const _origBldDrawCanvas = bldDrawCanvas;
bldDrawCanvas = function () {
  if (!isMobile()) return _origBldDrawCanvas();
  if (typeof bldSaveDraft === 'function') bldSaveDraft();
  mRenderBlockList();
  mUpdatePageChip();
  mSyncTitle();
};
const _origBldDrawEditor = bldDrawEditor;
bldDrawEditor = function () {
  if (!isMobile()) return _origBldDrawEditor();
  if (bldSel) { const f = bldFindSection(bldSel); if (f && f.sec) mOpenEditor(bldSel); }
};



function mWatchListEditor(secId, editorId, saveBtnId, backLabel) {
  const editor = document.getElementById(editorId); if (!editor) return;
  const sync = () => {
    if (!isMobile()) return;
    const sec = document.getElementById(secId); if (!sec) return;
    const editing = !!document.getElementById(saveBtnId);
    sec.classList.toggle('m-editing', editing);
    if (editing && !editor.querySelector('.m-edit-back')) {
      const back = document.createElement('button');
      back.className = 'm-edit-back';
      back.textContent = '‹ ' + backLabel;
      back.addEventListener('click', () => document.getElementById(secId).classList.remove('m-editing'));
      editor.prepend(back);
    }
  };
  new MutationObserver(sync).observe(editor, { childList: true });
}

(function wireMobileShell() {
  const on = (id, ev, fn) => { const el = document.getElementById(id); if (el) el.addEventListener(ev, fn); };
  on('mBurger', 'click', mOpenMenu);
  on('mMenuClose', 'click', mCloseMenu);
  on('mLogout', 'click', () => document.getElementById('logoutBtn')?.click());
  on('mSheetX', 'click', mCloseSheet);
  on('mSheetBack', 'click', mCloseSheet);
  on('mBldPage', 'click', mOpenPages);
  on('mBldTheme', 'click', mOpenTheme);
  on('mBldAdd', 'click', () => { if (typeof bldOpenPicker === 'function') bldOpenPicker(); });

  const vis = document.getElementById('visBadge');
  if (vis) new MutationObserver(mSyncMenuBadge).observe(vis, { childList: true, characterData: true, subtree: true, attributes: true });

  mWatchListEditor('sec-tutorials', 'tutEditor', 'tutSaveBtn', 'All tutorials');
  mWatchListEditor('sec-reviews', 'revEditor', 'revSaveBtn', 'All reviews');

  if (isMobile()) { mSyncTitle(); mSetActions(); mUpdatePageChip(); mRenderBlockList(); }
})();
