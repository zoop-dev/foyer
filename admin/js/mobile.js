function isMobile() { return window.innerWidth <= 640; }

function mobSyncTitle() {
  const p = bldPages.find(p => p.id === bldPageId);
  const el = document.getElementById('mobBldTitle');
  if (el) el.textContent = p ? p.title : '—';
}

function mobOpenDrawer() {
  const list = document.getElementById('mobDrawerPageList');
  if (!list) return;
  list.innerHTML = bldPages.map(p => `
    <div class="bld-pi${p.id===bldPageId?' sel':''}" data-pid="${p.id}" style="cursor:pointer;">
      <div>
        <div class="bld-pi-t">${escHtml(p.title||'Untitled')}</div>
        <div class="bld-pi-s">${escHtml(p.slug||'')}</div>
      </div>
    </div>`).join('') || '<p style="padding:1rem;font-size:.62rem;color:var(--muted);font-weight:100;">No pages yet</p>';
  list.querySelectorAll('[data-pid]').forEach(el => {
    el.addEventListener('click', () => {
      bldPickPage(+el.dataset.pid);
      mobCloseDrawer();
      mobSyncTitle();
    });
  });
  document.getElementById('mobDrawer').classList.add('open');
  document.getElementById('mobDrawerBackdrop').classList.add('open');
}

function mobCloseDrawer() {
  document.getElementById('mobDrawer').classList.remove('open');
  document.getElementById('mobDrawerBackdrop').classList.remove('open');
}

function mobOpenSheet(s) {
  if (!isMobile()) return;
  const head = document.getElementById('mobSheetHead');
  const body = document.getElementById('mobSheetBody');
  if (!head || !body) return;
  const { html, label } = bEditorFields(s);
  head.innerHTML = `<span style="font-weight:200;font-size:.75rem;color:#f0f7f1;">${escHtml(label)}</span><button id="mobSheetClose" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:1rem;padding:.2rem .4rem;">✕</button>`;
  body.innerHTML = `<div class="bld-ep" style="padding:.5rem 0;">${html}</div>`;
  document.getElementById('mobSheetClose').addEventListener('click', mobCloseSheet);
  document.getElementById('mobSheetBackdrop').classList.add('open');
  document.getElementById('mobSheet').classList.add('open');
  bBindEditor(body, s, sec => { bldPatch(sec); mobSyncTitle(); });
}

function mobCloseSheet() {
  document.getElementById('mobSheet').classList.remove('open');
  document.getElementById('mobSheetBackdrop').classList.remove('open');
  bldSel = null; bldParentId = null;
}

const _origBldDrawEditor = bldDrawEditor; // captures builder.js version before any override
bldDrawEditor = function() {             // assignment: not hoisted, so _orig is correct above
  if (isMobile()) {
    if (bldSel) {
      const { sec } = bldFindSection(bldSel);
      if (sec) mobOpenSheet(sec);
    } else {
      mobCloseSheet();
    }
    mobSyncTitle();
    return;
  }
  _origBldDrawEditor();
};

(function wireMob() {
  const pagesBtn = document.getElementById('mobPagesBtn');
  const drawerBackdrop = document.getElementById('mobDrawerBackdrop');
  const sheetBackdrop = document.getElementById('mobSheetBackdrop');
  const addPageBtn = document.getElementById('mobAddPageBtn');
  const drawerClose = document.getElementById('mobDrawerClose');
  const previewBtn = document.getElementById('mobPreviewBtn');
  const publishBtn = document.getElementById('mobPublishBtn');

  if (pagesBtn) pagesBtn.addEventListener('click', mobOpenDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', mobCloseDrawer);
  if (drawerClose) drawerClose.addEventListener('click', mobCloseDrawer);
  if (sheetBackdrop) sheetBackdrop.addEventListener('click', mobCloseSheet);
  if (addPageBtn) addPageBtn.addEventListener('click', () => { mobCloseDrawer(); document.getElementById('bldAddPageBtn')?.click(); });
  if (previewBtn) previewBtn.addEventListener('click', () => document.getElementById('bldPreview')?.click());
  if (publishBtn) publishBtn.addEventListener('click', () => document.getElementById('bldPublish')?.click());
})();

document.querySelectorAll('.mob-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mob-tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    document.querySelector(`.tab-btn[data-tab="${btn.dataset.tab}"]`)?.classList.add('active');
    document.getElementById('sec-' + btn.dataset.tab).classList.add('active');
    if (btn.dataset.tab === 'analytics') fetchAnalytics();
    if (btn.dataset.tab === 'builder') { bldBoot(); bldLoadPages(); mobSyncTitle(); }
    if (btn.dataset.tab === 'images') renderImgTabGallery();
    if (btn.dataset.tab === 'files') fetchAndRenderFiles();
    if (btn.dataset.tab === 'tutorials') fetchTutorials();
    if (btn.dataset.tab === 'reviews') fetchReviews();
    if (btn.dataset.tab === 'settings') { fetchBlocklist(); loadNavEditor(); }
  });
});

(function syncMobBadge() {
  const mobBadge = document.getElementById('mobBadge');
  const visBadge = document.getElementById('visBadge');
  if (mobBadge && visBadge) {
    new MutationObserver(() => {
      mobBadge.textContent = visBadge.textContent;
      mobBadge.style.display = visBadge.style.display;
    }).observe(visBadge, { childList: true, attributes: true, attributeFilter: ['style'] });
  }
})();
