


const bkEl = (id) => document.getElementById(id);
let _bkBundle = null, _bkWired = false;

async function bkDownload() {
  const scope = bkEl('bkScope').value;
  let q = '?scope=' + encodeURIComponent(scope);
  if (scope === 'page') {
    const slug = bkEl('bkPage').value;
    if (!slug) { toast('Pick a page first', true); return; }
    q += '&slug=' + encodeURIComponent(slug);
  }
  const btn = bkEl('bkDownload'); const old = btn.textContent; btn.disabled = true; btn.textContent = 'Preparing…';
  try {
    const r = await fetch('/api/backup' + q, { headers: authHeaders() });
    if (!r.ok) { toast('Backup failed', true); return; }
    const text = await r.text();
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const name = (typeof __SITE__ !== 'undefined' && (__SITE__.shortName || __SITE__.name)) || 'foyer';
    a.href = url; a.download = `${String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${scope}-${new Date().toISOString().slice(0, 10)}.foyer`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast('Backup downloaded');
  } catch (e) { toast('Backup failed', true); }
  finally { btn.disabled = false; btn.textContent = old; }
}

function bkFileChosen(file) {
  _bkBundle = null; bkEl('bkRestore').disabled = true; bkEl('bkSummary').innerHTML = '';
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    let b; try { b = JSON.parse(reader.result); } catch { bkEl('bkSummary').innerHTML = '<span style="color:#e0556a;">That file isn’t valid JSON.</span>'; return; }
    if (!b || b.foyer_backup !== 1 || !b.data) { bkEl('bkSummary').innerHTML = '<span style="color:#e0556a;">Not a Foyer backup file.</span>'; return; }
    _bkBundle = b;
    const d = b.data, n = (a) => Array.isArray(a) ? a.length : 0;
    const parts = [`${n(d.pages)} pages`, `${n(d.collections)} collections`, `${n(d.collection_items)} entries`, `${n(d.tutorials)} tutorials`, `${n(d.reviews)} reviews`, `${n(d.images)} images`, `${n(d.files)} files`];
    if (d.settings) parts.push('site settings');
    bkEl('bkSummary').innerHTML = `<div style="font-size:.72rem;color:rgba(220,245,225,.55);line-height:1.8;">Scope: <b style="color:rgba(220,245,225,.85);">${b.scope || '?'}</b> · ${b.created ? new Date(b.created).toLocaleString() : 'unknown date'}<br>${parts.join(' · ')}</div>`;
    bkEl('bkRestore').disabled = false;
  };
  reader.readAsText(file);
}

async function bkRestore() {
  if (!_bkBundle) return;
  const msg = 'Restore this backup? Pages, entries and settings with the same slug/key will be overwritten; anything not in the backup is left as-is.';
  const ok = (typeof dlg !== 'undefined' && dlg.confirm) ? await dlg.confirm(msg) : confirm(msg);
  if (!ok) return;
  const btn = bkEl('bkRestore'); const old = btn.textContent; btn.disabled = true; btn.textContent = 'Restoring…';
  try {
    const r = await fetch('/api/backup/restore', { method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(_bkBundle) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) { toast(d.error || 'Restore failed', true); return; }
    const c = d.counts || {};
    bkEl('bkSummary').innerHTML = `<div style="font-size:.72rem;color:var(--green);line-height:1.8;">Restored ${c.pages || 0} pages, ${c.collection_items || 0} entries, ${c.tutorials || 0} tutorials, ${c.reviews || 0} reviews, ${c.images || 0} images, ${c.files || 0} files, ${c.settings || 0} settings.<br>Reloading…</div>`;
    toast('Restored');
    setTimeout(() => location.reload(), 1900);
  } catch (e) { toast('Restore failed', true); }
  finally { btn.disabled = false; btn.textContent = old; }
}

async function renderBackupTab() {
  if (!_bkWired) {
    _bkWired = true;
    bkEl('bkScope').addEventListener('change', () => { bkEl('bkPageWrap').style.display = bkEl('bkScope').value === 'page' ? 'block' : 'none'; });
    bkEl('bkDownload').addEventListener('click', bkDownload);
    bkEl('bkFile').addEventListener('change', (e) => bkFileChosen(e.target.files[0]));
    bkEl('bkRestore').addEventListener('click', bkRestore);
  }
  try {
    const pages = await fetch('/api/pages', { headers: authHeaders() }).then((r) => r.json());
    if (Array.isArray(pages)) bkEl('bkPage').innerHTML = pages.map((p) => `<option value="${(p.slug || '').replace(/"/g, '&quot;')}">${(p.title || p.slug || '').replace(/</g, '&lt;')} — ${(p.slug || '').replace(/</g, '&lt;')}</option>`).join('');
  } catch (e) {}
}
