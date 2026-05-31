

let _revList = [];
let _revSel = null;
let _revDirty = false;

function revDraftKey(id) { return 'foyer_revdraft_' + id; }
function revFormState() {
  const g = id => document.getElementById(id);
  if (!g('revContent')) return null;
  return { title:g('revTitle').value, slug:g('revSlug').value, description:g('revDesc').value, cover_image:g('revCover').value, rating:parseInt(g('revRating').value)||0, content:g('revContent').value };
}
let _revPublished = null;
function revSaveDraft() {
  if (_revSel == null) return;
  const f = revFormState(); if (!f) return;
  if (_revPublished && JSON.stringify(f) === JSON.stringify(_revPublished)) {
    revClearDraft(_revSel);
    const st = document.getElementById('revStatus'); if (st) st.textContent = '';
    renderRevList();
    return;
  }
  try { _ls.setItem(revDraftKey(_revSel), JSON.stringify({ state:f, ts:Date.now() })); } catch {}
  const st = document.getElementById('revStatus'); if (st) st.textContent = 'Saved draft';
  renderRevList();
}
function revClearDraft(id) { try { _ls.removeItem(revDraftKey(id)); } catch {} }
function revUnsaved(t) { try { return !!_ls.getItem(revDraftKey(t.id)); } catch { return false; } }
setInterval(() => { if (document.getElementById('sec-reviews')?.classList.contains('active')) revSaveDraft(); }, 4000);

async function fetchReviews() {
  const res = await fetch('/api/reviews', { headers: authHeaders() });
  if (!res.ok) return;
  _revList = await res.json();
  renderRevList();
}

function renderRevList() {
  const el = document.getElementById('revListItems');
  if (!el) return;
  if (!_revList.length) {
    el.innerHTML = '<p style="font-size:.62rem;font-weight:100;color:var(--muted);padding:1rem .5rem;">No reviews yet.</p>';
    return;
  }
  el.innerHTML = _revList.map(t => `
    <div class="rev-list-item${_revSel === t.id ? ' active' : ''}" data-rid="${t.id}" style="position:relative;padding:.6rem .7rem;cursor:pointer;border-radius:2px;margin-bottom:.2rem;transition:background .12s;${_revSel===t.id?'background:rgba(77,189,106,.08);border-left:2px solid var(--green);padding-left:.5rem;':''}">
      ${revUnsaved(t)?`<span class="unsaved-badge" data-discard="${t.id}" title="Discard unsaved changes">!</span>`:''}
      <div style="font-weight:200;font-size:.75rem;color:${_revSel===t.id?'var(--white)':'rgba(220,245,225,.75)'};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding-right:16px;">${escHtml(t.title||'Untitled')}</div>
      <div style="font-size:.58rem;font-weight:100;color:var(--muted);margin-top:.15rem;">${t.rating?('★'.repeat(t.rating)+' · '):''}${timeAgo(t.created_at)}</div>
    </div>`).join('');
  el.querySelectorAll('[data-rid]').forEach(row => {
    row.addEventListener('click', e => { if (e.target.closest('[data-discard]')) return; selectReview(+row.dataset.rid); });
  });
  el.querySelectorAll('[data-discard]').forEach(badge => badge.addEventListener('click', async e => {
    e.stopPropagation();
    const id = +badge.dataset.discard;
    if (!await dlg.confirm('Discard unsaved changes for this review?', { confirm: 'Discard', danger: true })) return;
    revClearDraft(id);
    renderRevList();
    if (id === _revSel) {
      _revDirty = false;
      const res = await fetch(`/api/reviews/${id}`, { headers: authHeaders() });
      if (res.ok) renderRevEditor(await res.json());
    }
    toast('Draft discarded');
  }));
}

async function selectReview(id) {
  if (_revDirty && !await dlg.confirm('You have unsaved changes. Discard them?', { confirm: 'Discard', danger: true })) return;
  _revDirty = false;
  _revSel = id;
  renderRevList();
  const res = await fetch(`/api/reviews/${id}`, { headers: authHeaders() });
  if (!res.ok) return;
  let t = await res.json();
  _revPublished = { title:t.title, slug:t.slug, description:t.description, cover_image:t.cover_image, rating:parseInt(t.rating)||0, content:t.content||'' };
  try {
    const raw = _ls.getItem(revDraftKey(id));
    if (raw) {
      const d = JSON.parse(raw);
      const fresh = d.ts && (Date.now() - d.ts < 24*3600*1000);
      const differs = d.state && (d.state.title!==t.title || d.state.slug!==t.slug || d.state.description!==t.description || d.state.cover_image!==t.cover_image || (parseInt(d.state.rating)||0)!==(parseInt(t.rating)||0) || (d.state.content||'')!==(t.content||''));
      if (fresh && differs) { t = { ...t, ...d.state }; setTimeout(() => toast('Restored unsaved draft'), 300); }
      else if (!fresh || !differs) revClearDraft(id);
    }
  } catch {}
  renderRevEditor(t);
}

function renderRevEditor(t) {
  const el = document.getElementById('revEditor');
  if (!el) return;
  const ratingOpts = [0,1,2,3,4,5].map(n => `<option value="${n}"${(parseInt(t.rating)||0)===n?' selected':''}>${n===0?'No rating':('★'.repeat(n))}</option>`).join('');
  el.innerHTML = `
    <div style="max-width:760px;width:100%;display:flex;flex-direction:column;gap:1rem;">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;">
        <div style="font-family:'Unbounded',sans-serif;font-weight:200;font-size:.78rem;color:var(--white);">Edit Review</div>
        <div style="display:flex;gap:.5rem;align-items:center;">
          <span class="save-status" id="revStatus"></span>
          <div class="spinner" id="revSpinner" style="display:none;"></div>
          <button class="btn btn-xs btn-danger" id="revDelBtn">Delete</button>
          <button class="btn btn-primary btn-xs" id="revSaveBtn">Save</button>
        </div>
      </div>
      <div class="field"><label>Title</label><input type="text" id="revTitle" value="${escHtml(t.title||'')}" /></div>
      <div class="field-row">
        <div class="field"><label>Slug <span style="opacity:.5">(URL: /review/slug)</span></label><input type="text" id="revSlug" value="${escHtml(t.slug||'')}" placeholder="my-review" /></div>
        <div class="field" style="max-width:140px;"><label>Rating</label><select id="revRating" style="background:var(--panel);border:1px solid var(--border);color:var(--white);font-size:.82rem;padding:.6rem .75rem;outline:none;width:100%;">${ratingOpts}</select></div>
      </div>
      <div class="field"><label>Description <span style="opacity:.5">(shown in listings)</span></label><input type="text" id="revDesc" value="${escHtml(t.description||'')}" /></div>
      <div class="field"><label>Cover Image</label>
        <div style="display:flex;gap:.4rem;">
          <input type="text" id="revCover" value="${escHtml(t.cover_image||'')}" placeholder="/api/images/1" style="flex:1;" />
          <button class="btn btn-xs" id="revPickImg">Pick</button>
        </div>
        ${t.cover_image ? `<img src="${escHtml(t.cover_image)}" style="margin-top:.5rem;max-height:100px;max-width:200px;object-fit:cover;border:1px solid var(--border);" />` : ''}
      </div>
      <div class="field"><label>Content <span style="opacity:.5">(Markdown)</span></label>
        ${mdToolbarHTML()}
        <textarea id="revContent" rows="20" style="font-family:'Courier New',monospace;font-size:.78rem;line-height:1.65;">${escHtml(t.content||'')}</textarea>
      </div>
    </div>`;

  ['revTitle','revSlug','revDesc','revCover','revContent','revRating'].forEach(id => {
    const ev = id === 'revRating' ? 'change' : 'input';
    document.getElementById(id)?.addEventListener(ev, () => { _revDirty = true; document.getElementById('revStatus').textContent = ''; revSaveDraft(); });
  });

  document.getElementById('revPickImg').addEventListener('click', () => {
    openImgPicker(url => { document.getElementById('revCover').value = url; _revDirty = true; revSaveDraft(); });
  });

  wireMdToolbar(el, document.getElementById('revContent'), () => { _revDirty = true; revSaveDraft(); });

  document.getElementById('revSaveBtn').addEventListener('click', async () => {
    const spinner = document.getElementById('revSpinner');
    const status = document.getElementById('revStatus');
    spinner.style.display = 'block';
    const body = {
      title:       document.getElementById('revTitle').value.trim(),
      slug:        document.getElementById('revSlug').value.trim(),
      description: document.getElementById('revDesc').value.trim(),
      cover_image: document.getElementById('revCover').value.trim(),
      rating:      parseInt(document.getElementById('revRating').value) || 0,
      content:     document.getElementById('revContent').value,
    };
    const res = await fetch(`/api/reviews/${t.id}`, {
      method: 'PUT',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    spinner.style.display = 'none';
    if (res.ok) {
      _revDirty = false;
      _revPublished = revFormState();
      revClearDraft(t.id);
      status.textContent = 'Saved.';
      const idx = _revList.findIndex(x => x.id === t.id);
      if (idx >= 0) _revList[idx] = { ..._revList[idx], ...body };
      renderRevList();
      toast('Review saved');
    } else {
      status.textContent = 'Error saving.';
    }
  });

  document.getElementById('revDelBtn').addEventListener('click', async () => {
    if (!await dlg.confirm(`Delete "${t.title}"? This cannot be undone.`, { danger: true, confirm: 'Delete' })) return;
    await fetch(`/api/reviews/${t.id}`, { method: 'DELETE', headers: authHeaders() });
    revClearDraft(t.id);
    _revList = _revList.filter(x => x.id !== t.id);
    _revSel = null;
    _revDirty = false;
    renderRevList();
    document.getElementById('revEditor').innerHTML = '<p style="font-weight:100;font-size:.68rem;color:var(--muted);margin:auto;text-align:center;">Select a review or create a new one.</p>';
    toast('Deleted');
  });
}

async function createReview() {
  if (_revDirty && !await dlg.confirm('You have unsaved changes. Discard them?', { confirm: 'Discard', danger: true })) return;
  const result = await new Promise(resolve => {
    const bd = document.createElement('div');
    bd.style.cssText = 'position:fixed;inset:0;z-index:99990;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center;padding:1.5rem;';
    bd.innerHTML = `<div style="background:var(--panel);border:1px solid rgba(77,189,106,.18);max-width:380px;width:100%;padding:1.6rem 1.8rem;">
      <p style="font-family:'Unbounded',sans-serif;font-weight:200;font-size:.78rem;color:#f0f7f1;margin-bottom:.9rem;">New Review</p>
      <input id="_revTitleInput" type="text" placeholder="Review title" autofocus style="width:100%;background:var(--panel);border:1px solid var(--border);color:var(--white);font-size:.82rem;padding:.6rem .85rem;outline:none;font-family:inherit;margin-bottom:.6rem;box-sizing:border-box;" />
      <input id="_revSlugInput" type="text" placeholder="slug (e.g. cool-thing)" style="width:100%;background:var(--panel);border:1px solid var(--border);color:var(--white);font-size:.82rem;padding:.6rem .85rem;outline:none;font-family:inherit;margin-bottom:.4rem;box-sizing:border-box;" />
      <p style="font-size:.56rem;color:var(--muted);font-weight:100;margin-bottom:1rem;">URL will be /review/&lt;slug&gt;</p>
      <div style="display:flex;gap:.6rem;justify-content:flex-end;">
        <button id="_revCancel" style="font-family:'Josefin Sans',sans-serif;font-size:.58rem;letter-spacing:.2em;text-transform:uppercase;padding:.45rem 1.2rem;border:1px solid rgba(77,189,106,.2);background:transparent;color:rgba(180,230,190,.5);cursor:pointer;">Cancel</button>
        <button id="_revCreate" style="font-family:'Josefin Sans',sans-serif;font-size:.58rem;letter-spacing:.2em;text-transform:uppercase;padding:.45rem 1.2rem;border:1px solid rgba(77,189,106,.5);background:transparent;color:rgba(77,189,106,.9);cursor:pointer;">Create</button>
      </div></div>`;
    document.body.appendChild(bd);
    const titleInp = bd.querySelector('#_revTitleInput');
    const slugInp = bd.querySelector('#_revSlugInput');
    titleInp.focus();

    let slugEdited = false;
    slugInp.addEventListener('input', () => { slugEdited = true; });
    titleInp.addEventListener('input', () => {
      if (!slugEdited) slugInp.value = titleInp.value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    });
    const done = ok => { bd.remove(); resolve(ok ? { title: titleInp.value, slug: slugInp.value } : null); };
    bd.querySelector('#_revCancel').addEventListener('click', () => done(false));
    bd.querySelector('#_revCreate').addEventListener('click', () => done(true));
    bd.addEventListener('keydown', e => { if (e.key === 'Escape') done(false); });
  });
  if (!result || !result.title.trim() || !result.slug.trim()) return;
  const slug = result.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '');
  const res = await fetch('/api/reviews', {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: result.title.trim(), slug, description: '', content: '', cover_image: '', rating: 0 }),
  });
  if (res.status === 409) { await dlg.alert('That slug is already taken.'); return; }
  if (!res.ok) { await dlg.alert('Failed to create review.'); return; }
  const { id } = await res.json();
  _revList.unshift({ id, title: result.title.trim(), slug, description: '', cover_image: '', rating: 0, created_at: new Date().toISOString() });
  _revDirty = false;
  _revSel = id;
  renderRevList();
  renderRevEditor({ id, title: result.title.trim(), slug, description: '', content: '', cover_image: '', rating: 0 });
}

document.getElementById('revNewBtn')?.addEventListener('click', createReview);
