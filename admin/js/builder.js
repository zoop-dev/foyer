



function bSetupDnD(canvasEl, sections, onDone) {
  canvasEl.querySelectorAll('.bld-sw').forEach(sw=>{
    sw.addEventListener('dragstart',e=>{
      bDragId=sw.dataset.sid; bDragNew=null;
      e.dataTransfer.effectAllowed='move';
      setTimeout(()=>sw.classList.add('dragging'),0);
    });
    sw.addEventListener('dragend',()=>{
      sw.classList.remove('dragging');
      canvasEl.querySelectorAll('.bld-sw').forEach(s=>s.classList.remove('drag-above','drag-below'));
      bDragId=null;
    });
    sw.addEventListener('dragover',e=>{
      if (!bDragId&&!bDragNew) return;
      if (bDragId===sw.dataset.sid) return;
      e.preventDefault();
      const r=sw.getBoundingClientRect();
      const relX=(e.clientX-r.left)/r.width;
      const relY=(e.clientY-r.top)/r.height;
      const sideDrop=relX<0.28||relX>0.72;
      canvasEl.querySelectorAll('.bld-sw').forEach(s=>s.classList.remove('drag-above','drag-below','drag-left','drag-right'));
      if (sideDrop) {
        sw.classList.add(relX<0.5?'drag-left':'drag-right');
      } else {
        sw.classList.add(relY<0.5?'drag-above':'drag-below');
      }
    });
    sw.addEventListener('dragleave',()=>sw.classList.remove('drag-above','drag-below','drag-left','drag-right'));
    sw.addEventListener('drop',e=>{
      e.preventDefault(); e.stopPropagation();
      const r=sw.getBoundingClientRect();
      const relX=(e.clientX-r.left)/r.width;
      const relY=(e.clientY-r.top)/r.height;
      const sideDrop=relX<0.28||relX>0.72;
      sw.classList.remove('drag-above','drag-below','drag-left','drag-right');
      const toIdx=sections.findIndex(s=>s.id===sw.dataset.sid);
      const targetSec=sections[toIdx];
      let ns;
      if (bDragNew) {
        ns=bDefault(bDragNew); bDragNew=null;
      } else if (bDragId&&bDragId!==sw.dataset.sid) {
        const fromIdx=sections.findIndex(s=>s.id===bDragId); if (fromIdx<0) return;
        [ns]=sections.splice(fromIdx,1); bDragId=null;
      } else return;
      if (sideDrop) {

        ns.width='half';
        if (targetSec) targetSec.width='half';
        const ins=sections.findIndex(s=>s.id===sw.dataset.sid);
        sections.splice(relX<0.5?ins:ins+1,0,ns);
      } else {
        const before=relY<0.5;
        const ins=sections.findIndex(s=>s.id===sw.dataset.sid);
        sections.splice(before?ins:ins+1,0,ns);
      }
      onDone(ns.id);
    });
  });
  canvasEl.addEventListener('dragover',e=>{
    if ((!bDragNew&&!bDragId)||e.target.closest('.bld-sw')) return;
    e.preventDefault(); canvasEl.classList.add('drag-target');
  });
  canvasEl.addEventListener('dragleave',e=>{
    if (!e.relatedTarget||!canvasEl.contains(e.relatedTarget)) canvasEl.classList.remove('drag-target');
  });
  canvasEl.addEventListener('drop',e=>{
    if (e.target.closest('.bld-sw')) return;
    e.preventDefault(); canvasEl.classList.remove('drag-target');
    if (bDragNew) {
      const ns=bDefault(bDragNew); bDragNew=null;
      sections.push(ns); onDone(ns.id);
    }
  });
}

let bldPickerCat='all', bldPickerQ='';
function pickCard(b){ return `<button class="bld-pick" data-type="${bA(b.t)}" title="${bA(b.l)}"><span class="bld-pick-ic">${b.i||'▫'}</span><span class="bld-pick-l">${bE(b.l)}</span></button>`; }
function bldRenderPicker(){
  const grid=document.getElementById('bldPickerGrid'); if(!grid) return;
  let list=BLOCK_CATALOG;
  if(bldPickerCat!=='all') list=list.filter(b=>b.c===bldPickerCat);
  if(bldPickerQ) list=list.filter(b=>(b.l+' '+b.t+' '+(b.k||'')).toLowerCase().includes(bldPickerQ));
  if(!list.length){ grid.innerHTML=`<p class="bld-picker-empty">No blocks match “${bE(bldPickerQ)}”.</p>`; return; }
  let html='';
  if(bldPickerCat==='all' && !bldPickerQ){
    for(const cat of BLK_CATS){ const items=list.filter(b=>b.c===cat); if(!items.length) continue; html+=`<div class="bld-picker-cathead">${bE(cat)}</div>`+items.map(pickCard).join(''); }
  } else { html=list.map(pickCard).join(''); }
  grid.innerHTML=html;
  grid.querySelectorAll('.bld-pick').forEach(b=>b.addEventListener('click',()=>bldAddBlock(b.dataset.type)));
}
function bldBuildPicker(){
  if(document.getElementById('bldPickerOv')) return;
  const ov=document.createElement('div'); ov.id='bldPickerOv'; ov.className='bld-picker-ov';
  ov.innerHTML=`<div class="bld-picker">
    <div class="bld-picker-head"><h3>Add a section</h3><input class="bld-picker-search" id="bldPickerSearch" placeholder="Search blocks…" autocomplete="off" /><button class="bld-picker-x" id="bldPickerX" aria-label="Close">×</button></div>
    <div class="bld-picker-body"><div class="bld-picker-cats" id="bldPickerCats"></div><div class="bld-picker-grid" id="bldPickerGrid"></div></div>
  </div>`;
  document.body.appendChild(ov);
  ov.addEventListener('click',e=>{ if(e.target===ov) bldClosePicker(); });
  const cats=document.getElementById('bldPickerCats');
  cats.innerHTML=`<button class="bld-picker-cat on" data-cat="all">All blocks</button>`+BLK_CATS.map(c=>`<button class="bld-picker-cat" data-cat="${bA(c)}">${bE(c)}</button>`).join('');
  cats.querySelectorAll('.bld-picker-cat').forEach(b=>b.addEventListener('click',()=>{ cats.querySelectorAll('.bld-picker-cat').forEach(x=>x.classList.remove('on')); b.classList.add('on'); bldPickerCat=b.dataset.cat; bldRenderPicker(); }));
  document.getElementById('bldPickerX').addEventListener('click',bldClosePicker);
  const search=document.getElementById('bldPickerSearch');
  search.addEventListener('input',()=>{ bldPickerQ=search.value.toLowerCase().trim(); bldRenderPicker(); });
  search.addEventListener('keydown',e=>{ if(e.key==='Escape') bldClosePicker(); });
}
function bldOpenPicker(){
  if(!bldPageId){ toast('Select or create a page first.', true); return; }
  bldBuildPicker();
  bldPickerCat='all'; bldPickerQ='';
  const s=document.getElementById('bldPickerSearch'); if(s) s.value='';
  document.getElementById('bldPickerCats').querySelectorAll('.bld-picker-cat').forEach(x=>x.classList.toggle('on',x.dataset.cat==='all'));
  bldRenderPicker();
  document.getElementById('bldPickerOv').classList.add('open');
  setTimeout(()=>{ const s2=document.getElementById('bldPickerSearch'); if(s2) s2.focus(); },40);
}
function bldClosePicker(){ document.getElementById('bldPickerOv')?.classList.remove('open'); }


function bldOpenSlotWidth(sections){
  if(!sections.length) return null;
  const w=sections[sections.length-1].width;
  if(w!=='half'&&w!=='third') return null;
  const max=w==='third'?3:2;
  let n=0; for(let i=sections.length-1;i>=0;i--){ if(sections[i].width===w) n++; else break; }
  return (n%max!==0)?w:null;
}
function bldAddBlock(type){
  const sec=bDefault(type);
  if(!sec){ toast('That block is coming soon.', true); return; }
  const slot=bldOpenSlotWidth(bldState.sections);
  if(slot) sec.width=slot;   // fill an open ½/⅓ space instead of starting a new full row
  bldState.sections.push(sec); bldSel=sec.id;
  bldClosePicker(); bldDrawCanvas(); bldDrawEditor();
  const col=document.getElementById('bldCanvasCol');
  if(col) setTimeout(()=>col.scrollTo({top:col.scrollHeight,behavior:'smooth'}),60);
}

function groupRows(sections) {
  const rows = [];
  let batch = [], batchW = null;
  for (const s of sections) {
    const w = s.width || 'full';
    if (w === 'full') {
      if (batch.length) { rows.push(batch); batch = []; batchW = null; }
      rows.push([s]);
    } else {
      const max = w === 'third' ? 3 : 2;
      if (batchW && batchW !== w) { rows.push(batch); batch = []; }
      batch.push(s); batchW = w;
      if (batch.length >= max) { rows.push(batch); batch = []; batchW = null; }
    }
  }
  if (batch.length) rows.push(batch);
  return rows;
}

function initCarousels(root) {
  root.querySelectorAll('[data-carousel]').forEach(el => {
    const items = Array.from(el.querySelectorAll('[data-slide]'));
    if (!items.length) return;
    let cur = 0;
    function show(n) {
      cur = (n + items.length) % items.length;
      items.forEach((it, i) => { it.style.display = i === cur ? '' : 'none'; });
      const ctr = el.querySelector('[data-slide-ctr]');
      if (ctr) ctr.textContent = `${cur+1} / ${items.length}`;
    }
    el.querySelector('[data-prev]')?.addEventListener('click', e => { e.stopPropagation(); show(cur - 1); });
    el.querySelector('[data-next]')?.addEventListener('click', e => { e.stopPropagation(); show(cur + 1); });
    show(0);
  });
}

let bldPages=[], bldPageId=null, bldState={bg:__SITE__.bg,accent:__SITE__.accent,text:__SITE__.text,font:'Josefin Sans',sections:[]}, bldSel=null, bldParentId=null, bldBooted=false;



function bldDraftKey(id) { return 'foyer_draft_' + id; }
let _lastDraftJson = '';
let _autosaveT = null;
function bldSetAutosave(mode) {
  const wrap = document.getElementById('bldAutosave'), txt = document.getElementById('bldAutosaveText');
  if (!wrap || !txt) return;
  wrap.classList.remove('saving', 'unsaved');
  if (mode === 'saving') { wrap.classList.add('saving'); txt.textContent = 'Saving…'; }
  else if (mode === 'unsaved') { wrap.classList.add('unsaved'); txt.textContent = 'Unsaved'; }
  else { txt.textContent = 'Saved'; }
}
function bldSaveDraft() {
  if (!bldPageId) return;
  const json = JSON.stringify(bldState);
  if (json === _lastDraftJson) return;   // nothing changed since last save
  _lastDraftJson = json;
  bldSetAutosave('saving');
  try { _ls.setItem(bldDraftKey(bldPageId), JSON.stringify({ state: bldState, ts: Date.now() })); } catch {}
  bldDrawPages();   // refresh unsaved (!) badges
  clearTimeout(_autosaveT);
  _autosaveT = setTimeout(() => bldSetAutosave('saved'), 500);
}
function bldClearDraft(id) {
  try { _ls.removeItem(bldDraftKey(id)); } catch {}
  if (id === bldPageId) { _lastDraftJson = JSON.stringify(bldState); bldSetAutosave('saved'); }
}

function bldPageUnsaved(p) {
  try {
    const raw = _ls.getItem(bldDraftKey(p.id));
    if (!raw) return false;
    return JSON.stringify(JSON.parse(raw).state) !== (p.page_json || '');
  } catch { return false; }
}

setInterval(bldSaveDraft, 4000);

window.addEventListener('beforeunload', bldSaveDraft);

function bldFindSection(id) {
  for (const s of bldState.sections) {
    if (s.id===id) return {sec:s,parent:null};
    if (s.type==='group') { const c=(s.sections||[]).find(x=>x.id===id); if(c) return {sec:c,parent:s}; }
  }
  return {sec:null,parent:null};
}

function groupCanvasHtml(g) {
  const open=g.default_open!=='no'&&g.default_open!==false;
  const children=(g.sections||[]).map(c=>`<div class="bld-sw bld-gchild${bldSel===c.id?' sel':''}" data-sid="${c.id}">
    <div class="bld-ov">
      <button class="bld-ob" data-gc-edit="${c.id}" data-gc-grp="${g.id}">Edit</button>
      <button class="bld-ob rm" data-gc-del="${c.id}" data-gc-grp="${g.id}">✕</button>
    </div>
    ${bRender(c,bldState)}
  </div>`).join('');
  return `<details class="bld-group-details" ${open?'open':''}><summary class="bld-group-summary" style="color:${bRgb(bldState.text||__SITE__.text,.75)};font-family:'${bldState.font||'Josefin Sans'}',sans-serif;">${bE(g.label||'Group')}<span style="font-size:.65rem;color:${bRgb(bldState.accent||__SITE__.accent,.4)};">▾</span></summary><div class="bld-group-body">${children||`<div class="bld-group-empty">Empty — edit group to add sections</div>`}</div></details>`;
}

function bldThemeFromState() {
  document.getElementById('bldBg').value=bldState.bg||__SITE__.bg;
  document.getElementById('bldAccent').value=bldState.accent||__SITE__.accent;
  document.getElementById('bldText').value=bldState.text||__SITE__.text;
  document.getElementById('bldFont').value=bldState.font||'Josefin Sans';
  bldBgControls();
}

function bldBgControls() {
  const style = bldState.bg_style || 'solid';
  document.getElementById('bldBgStyle').value = style;
  document.getElementById('bldBgColor2').value = bldState.bg_color2 || '#0a1f12';
  document.getElementById('bldBgAngle').value = bldState.bg_angle || '135';
  document.getElementById('bldBgImage').value = bldState.bg_image || '';
  document.getElementById('bldBgOverlay').value = bldState.bg_overlay || '0.4';
  document.getElementById('bldBgAnim').checked = !!bldState.bg_anim;
  const show = (id, on) => document.getElementById(id).style.display = on ? '' : 'none';
  show('bldBgColor2Wrap', style==='gradient');
  show('bldBgAngleWrap',  style==='gradient');
  show('bldBgImageWrap',  style==='image');
  show('bldBgOverlayWrap',style==='image');
  show('bldBgAnimWrap',   style==='gradient'||style==='aurora');
}

function bldBgCss() {
  const s = bldState, bg = s.bg||__SITE__.bg, ac = s.accent||__SITE__.accent;
  if (s.bg_style==='gradient') return `linear-gradient(${s.bg_angle||135}deg, ${bg}, ${s.bg_color2||ac})`;
  if (s.bg_style==='aurora') return `radial-gradient(40% 50% at 20% 25%, ${bRgb(ac,.18)}, transparent 60%), radial-gradient(45% 55% at 80% 30%, ${bRgb(ac,.14)}, transparent 60%), ${bg}`;
  if (s.bg_style==='image' && s.bg_image) return `linear-gradient(rgba(0,0,0,${s.bg_overlay||.4}),rgba(0,0,0,${s.bg_overlay||.4})), url('${String(s.bg_image).replace(/'/g,'%27')}') center/cover no-repeat`;
  return bg;
}

function bldDrawPages() {
  const list=document.getElementById('bldPageList');
  list.innerHTML=bldPages.map(p=>`
    <div class="bld-pi${bldPageId===p.id?' sel':''}" data-pid="${p.id}">
      <div style="min-width:0;flex:1;">
        <div class="bld-pi-t">${escHtml(p.title)}</div>
        <div class="bld-pi-s">${escHtml(p.slug)}</div>
      </div>
      ${bldPageUnsaved(p)?`<span class="bld-pi-unsaved" data-discard="${p.id}" title="Discard unsaved changes">!</span>`:''}
      ${p.slug!=='/'&&p.slug!=='__404__'?`<button class="bld-pi-del" data-pdel="${p.id}" title="Delete">✕</button>`:''}
    </div>`).join('');
  list.querySelectorAll('.bld-pi').forEach(el => el.addEventListener('click', e => {
    if (e.target.closest('.bld-pi-del') || e.target.closest('[data-discard]')) return;
    bldPickPage(+el.dataset.pid);
  }));
  list.querySelectorAll('[data-discard]').forEach(badge => badge.addEventListener('click', async e => {
    e.stopPropagation();
    const pid = +badge.dataset.discard;
    if (!await dlg.confirm('Discard unsaved changes for this page? It will revert to the last published version.', { confirm: 'Discard', danger: true })) return;
    bldClearDraft(pid);
    if (pid === bldPageId) {

      const p = bldPages.find(x => x.id === pid);
      try { bldState = { bg:__SITE__.bg,accent:__SITE__.accent,text:__SITE__.text,font:'Josefin Sans',sections:[], ...JSON.parse(p.page_json||'{}') }; }
      catch { bldState = { bg:__SITE__.bg,accent:__SITE__.accent,text:__SITE__.text,font:'Josefin Sans',sections:[] }; }
      bldSel = null; bldParentId = null;
      _lastDraftJson = JSON.stringify(bldState);
      bldThemeFromState(); bldDrawCanvas(); bldDrawEditor();
      bldSetAutosave('saved');
    }
    bldDrawPages();
    toast('Draft discarded');
  }));
  list.querySelectorAll('[data-pdel]').forEach(btn => btn.addEventListener('click', async e => {
    e.stopPropagation();
    const p=bldPages.find(x=>x.id===+btn.dataset.pdel);
    if (!p) return;
    if (!await dlg.confirm(`Delete page "${p.title}"?`, { danger: true, confirm: 'Delete' })) return;
    await fetch(`/api/pages/${p.id}`,{method:'DELETE',headers:authHeaders()});
    bldClearDraft(p.id);
    bldPages=bldPages.filter(x=>x.id!==p.id);
    if (bldPageId===p.id) { bldPageId=bldPages[0]?.id||null; if (bldPageId) bldPickPage(bldPageId); else bldDrawCanvas(); }
    bldDrawPages();
  }));
}

function bldPickPage(id) {
  bldPageId=id; bldSel=null;
  const p=bldPages.find(x=>x.id===id); if (!p) return;
  try { bldState={bg:__SITE__.bg,accent:__SITE__.accent,text:__SITE__.text,font:'Josefin Sans',sections:[],...JSON.parse(p.page_json||'{}')}; }
  catch(e) { bldState={bg:__SITE__.bg,accent:__SITE__.accent,text:__SITE__.text,font:'Josefin Sans',sections:[]}; }

  try {
    const raw = _ls.getItem(bldDraftKey(id));
    if (raw) {
      const draft = JSON.parse(raw);
      const fresh = draft && draft.ts && (Date.now() - draft.ts < 24*3600*1000);
      if (fresh && JSON.stringify(draft.state) !== (p.page_json || '')) {
        bldState = draft.state;
        setTimeout(() => toast('Restored unsaved draft (' + timeAgo(new Date(draft.ts).toISOString()) + ')'), 300);
      } else if (!fresh) {
        bldClearDraft(id);
      }
    }
  } catch {}
  bldThemeFromState();
  _lastDraftJson = JSON.stringify(bldState);  // baseline so we don't spuriously re-save on open
  bldSetAutosave('saved');
  const slug=p.slug==='/'?'/':'/'+p.slug.replace(/^\//,'');
  document.getElementById('bldChromeUrl').textContent='lanson.pages.dev'+slug;
  bldDrawPages(); bldDrawCanvas(); bldDrawEditor();
}



function bSecWrap(s, inner) {
  const ac = bldState.accent || __SITE__.accent;
  let ws = '';
  const m = s.smargin==='sm'?'1.2rem':s.smargin==='md'?'2.6rem':s.smargin==='lg'?'4.5rem':'';
  if (m) ws += `margin-top:${m};margin-bottom:${m};`;
  const sb = s.sbg==='subtle'?bRgb(ac,.04):s.sbg==='bold'?bRgb(ac,.09):s.sbg==='dark'?'rgba(0,0,0,.22)':'';
  if (sb) ws += `background:${sb};`;
  const r = s.sround==='sm'?'10px':s.sround==='lg'?'20px':'';
  if (r) ws += `border-radius:${r};overflow:hidden;`;
  const badge = s.hide?`<div style="position:absolute;top:.4rem;left:.4rem;z-index:2;font-size:.5rem;letter-spacing:.12em;text-transform:uppercase;background:rgba(230,200,90,.9);color:#1a1400;padding:.12rem .4rem;border-radius:3px;">Hidden · ${s.hide}</div>`:'';
  return (ws||badge) ? `<div style="position:relative;${ws}${s.hide?'opacity:.5;':''}">${badge}${inner}</div>` : inner;
}

function bldDrawCanvas() {
  const el=document.getElementById('bldCanvas'); if (!el) return;
  bldSaveDraft();   // persist on every canvas change
  el.style.background=bldBgCss();
  if (!bldState.sections||!bldState.sections.length) {
    el.innerHTML=`<div class="bld-canvas-empty" style="color:${bRgb(bldState.accent||__SITE__.accent,.18)}">Add a section below to build this page</div>`;
    return;
  }
  function swHtml(s) {
    const wLabel=s.width==='half'?'½':s.width==='third'?'⅓':'Full';
    const inner=bSecWrap(s, s.type==='group'?groupCanvasHtml(s):bRender(s,bldState));
    return `<div class="bld-sw${bldSel===s.id?' sel':''}" data-sid="${s.id}" draggable="true">
      <div class="bld-ov">
        <span class="bld-drag-handle" title="Drag to reorder">⠿</span>
        <button class="bld-ob bld-w-tog" data-wtog="${s.id}" title="Change column width">${wLabel}</button>
        <button class="bld-ob" data-edit="${s.id}">Edit</button>
        <button class="bld-ob rm" data-del="${s.id}">✕</button>
      </div>
      ${inner}
    </div>`;
  }
  const rows=groupRows(bldState.sections);
  el.innerHTML=rows.map(row=>{
    if (row.length===1) {
      const s=row[0], w=s.width||'full';
      if (w==='full') return swHtml(s);

      const needed=w==='third'?3:2;
      const slot=`<div style="flex:1;min-width:0;border:1px dashed rgba(var(--accent-rgb),.1);display:flex;align-items:center;justify-content:center;font-size:.5rem;letter-spacing:.18em;text-transform:uppercase;color:rgba(var(--accent-rgb),.18);min-height:60px;">Drag section here</div>`;
      return `<div style="display:flex;gap:.4rem;align-items:stretch;"><div style="flex:1;min-width:0;">${swHtml(s)}</div>${slot.repeat(needed-1)}</div>`;
    }
    return `<div style="display:flex;gap:.4rem;align-items:stretch;">${row.map(s=>`<div style="flex:1;min-width:0;">${swHtml(s)}</div>`).join('')}</div>`;
  }).join('');
  el.querySelectorAll('[data-edit]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();bldSel=b.dataset.edit;bldParentId=null;bldDrawCanvas();bldDrawEditor();}));
  el.querySelectorAll('[data-del]').forEach(b=>b.addEventListener('click',e=>{
    e.stopPropagation();
    bldState.sections=bldState.sections.filter(x=>x.id!==b.dataset.del);
    if (bldSel===b.dataset.del){bldSel=null;bldParentId=null;}
    bldDrawCanvas(); bldDrawEditor();
  }));
  el.querySelectorAll('[data-wtog]').forEach(b=>b.addEventListener('click',e=>{
    e.stopPropagation();
    const sec=bldState.sections.find(s=>s.id===b.dataset.wtog); if (!sec) return;
    const cur=sec.width||'full';
    sec.width=cur==='full'?'half':cur==='half'?'third':'full';
    bldSel=sec.id; bldParentId=null; bldDrawCanvas(); bldDrawEditor();
  }));

  el.querySelectorAll('[data-gc-edit]').forEach(b=>b.addEventListener('click',e=>{
    e.stopPropagation();
    bldParentId=b.dataset.gcGrp; bldSel=b.dataset.gcEdit;
    bldDrawCanvas(); bldDrawEditor();
  }));
  el.querySelectorAll('[data-gc-del]').forEach(b=>b.addEventListener('click',e=>{
    e.stopPropagation();
    const grp=bldState.sections.find(s=>s.id===b.dataset.gcGrp); if (!grp) return;
    grp.sections=(grp.sections||[]).filter(c=>c.id!==b.dataset.gcDel);
    if (bldSel===b.dataset.gcDel){bldSel=grp.id;bldParentId=null;}
    bldDrawCanvas(); bldDrawEditor();
  }));
  bSetupDnD(el, bldState.sections, (newId)=>{bldSel=newId;bldParentId=null;bldDrawCanvas();bldDrawEditor();});
  initCarousels(el);
}

function bldPatch(s) {
  if (s.type==='group') { bldDrawCanvas(); return; }
  const w=document.querySelector(`#bldCanvas .bld-sw[data-sid="${s.id}"]`); if (!w){bldDrawCanvas();return;}
  const ov=w.querySelector('.bld-ov'); w.innerHTML=''; if(ov)w.appendChild(ov);
  w.insertAdjacentHTML('beforeend',bSecWrap(s,bRender(s,bldState)));
  initCarousels(w);
}


function bldDrawEditor() {
  const panel=document.getElementById('bldEditor'); if (!panel) return;
  if (!bldSel) {
    if (bldPageId) {
      panel.innerHTML=`<div class="bld-ep"><div class="bld-ep-head">Page <span class="bld-ep-type">Settings</span></div><div class="bld-ef"><label>Browser Tab Title</label><input type="text" id="pgTitle" value="${bA(bldState.page_title||'')}" placeholder="Defaults to page name" /></div><div class="bld-ef"><label>Meta Description</label><input type="text" id="pgSub" value="${bA(bldState.page_subtitle||'')}" /></div><div class="bld-ef"><label>Show in nav bar</label><select id="pgNav"><option value="yes"${bldState.show_in_nav!==false?' selected':''}>Yes — show in nav</option><option value="no"${bldState.show_in_nav===false?' selected':''}>No — hide from nav</option></select></div><div class="bld-sep" style="margin:.6rem 0;"></div><p style="font-weight:100;font-size:.62rem;letter-spacing:.06em;color:var(--muted);line-height:1.8;">Hover a section and click <strong style="color:rgba(77,189,106,.6);font-weight:300;">Edit</strong> to change its content.</p></div>`;
      panel.querySelector('#pgTitle').addEventListener('input',e=>{bldState.page_title=e.target.value;bldSaveDraft();});
      panel.querySelector('#pgSub').addEventListener('input',e=>{bldState.page_subtitle=e.target.value;bldSaveDraft();});
      panel.querySelector('#pgNav').addEventListener('change',e=>{
        bldState.show_in_nav=(e.target.value==='yes');
        e.target.value = bldState.show_in_nav ? 'yes' : 'no';   // lock the visible value
        bldSaveDraft();
      });
    } else {
      panel.innerHTML='<p class="bld-editor-hint">Select or create a page to get started.</p>';
    }
    return;
  }
  let s, parentGroup=null;
  if (bldParentId) {
    parentGroup=bldState.sections.find(g=>g.id===bldParentId);
    s=parentGroup?(parentGroup.sections||[]).find(c=>c.id===bldSel):null;
  } else {
    s=bldState.sections.find(x=>x.id===bldSel);
  }
  if (!s) return;
  const {html,label}=bEditorFields(s);
  const backBtn=parentGroup?`<button class="btn btn-xs" id="bEdBack" style="margin-bottom:.6rem;width:100%;">← Back to group</button>`:'';
  panel.innerHTML=`<div class="bld-ep">${backBtn}<div class="bld-ep-head">${label} <span class="bld-ep-type">${parentGroup?'in Group':'Section'}</span></div>${html}</div>`;
  if (parentGroup) {
    panel.querySelector('#bEdBack')?.addEventListener('click',()=>{bldSel=parentGroup.id;bldParentId=null;bldDrawEditor();});
  }
  bBindEditor(panel, s, (sec, extra) => {
    if (parentGroup) { bldDrawCanvas(); } else { bldPatch(sec); }
    if (extra==='re-editor') bldDrawEditor();
  });
}

async function bldBoot() {
  if (bldBooted) return; bldBooted=true;

  document.getElementById('bldBg').addEventListener('input',e=>{bldState.bg=e.target.value;bldDrawCanvas();});
  document.getElementById('bldAccent').addEventListener('input',e=>{bldState.accent=e.target.value;bldDrawCanvas();if(bldSel)bldDrawEditor();});
  document.getElementById('bldText').addEventListener('input',e=>{bldState.text=e.target.value;bldDrawCanvas();});
  document.getElementById('bldFont').addEventListener('change',e=>{bldState.font=e.target.value;bldDrawCanvas();});

  document.getElementById('bldBgStyle').addEventListener('change',e=>{bldState.bg_style=e.target.value;bldBgControls();bldDrawCanvas();});
  document.getElementById('bldBgColor2').addEventListener('input',e=>{bldState.bg_color2=e.target.value;bldDrawCanvas();});
  document.getElementById('bldBgAngle').addEventListener('input',e=>{bldState.bg_angle=e.target.value;bldDrawCanvas();});
  document.getElementById('bldBgImage').addEventListener('input',e=>{bldState.bg_image=e.target.value;bldDrawCanvas();});
  document.getElementById('bldBgOverlay').addEventListener('input',e=>{bldState.bg_overlay=e.target.value;bldDrawCanvas();});
  document.getElementById('bldBgAnim').addEventListener('change',e=>{bldState.bg_anim=e.target.checked;bldDrawCanvas();});

  document.getElementById('bldOpenPicker').addEventListener('click', bldOpenPicker);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') bldClosePicker(); });

  document.getElementById('bldAddPageBtn').addEventListener('click',()=>{
    const f=document.getElementById('bldNewPageForm');
    f.style.display=f.style.display==='none'?'':'none';
  });
  document.getElementById('bldNPCancel').addEventListener('click',()=>{
    document.getElementById('bldNewPageForm').style.display='none';
  });
  document.getElementById('bldNPCreate').addEventListener('click',async()=>{
    const title=document.getElementById('bldNPTitle').value.trim();
    const rawSlug=document.getElementById('bldNPSlug').value.trim();
    if (!title||!rawSlug) { toast('Title and slug are required.', true); return; }
    const slug=rawSlug.startsWith('/')?rawSlug:'/'+rawSlug;
    const initJson=JSON.stringify({bg:__SITE__.bg,accent:__SITE__.accent,text:__SITE__.text,font:'Josefin Sans',sections:[]});
    const res=await fetch('/api/pages',{method:'POST',headers:{...authHeaders(),'Content-Type':'application/json'},body:JSON.stringify({title,slug,page_json:initJson})});
    if (!res.ok) { const d=await res.json(); toast(d.error||'Error creating page.', true); return; }
    const data=await res.json();
    document.getElementById('bldNewPageForm').style.display='none';
    document.getElementById('bldNPTitle').value=''; document.getElementById('bldNPSlug').value='';
    bldPages.push({id:data.id,title,slug,page_json:initJson,is_published:1});
    bldDrawPages(); bldPickPage(data.id);
  });

  document.getElementById('bldPreview').addEventListener('click',()=>{
    const p=bldPages.find(x=>x.id===bldPageId); if (!p) return;
    window.open(p.slug==='/'?'/':'/'+p.slug.replace(/^\//,''),'_blank');
  });

  document.getElementById('bldPublish').addEventListener('click',async()=>{
    if (!bldPageId) { toast('No page selected.', true); return; }
    const sp=document.getElementById('bldSpinner'),btn=document.getElementById('bldPublish');
    sp.style.display='block'; btn.disabled=true;

    const tasks = [];
    const curP = bldPages.find(x=>x.id===bldPageId);
    if (curP) tasks.push({ id:bldPageId, title:curP.title, json:JSON.stringify(bldState) });
    for (const p of bldPages) {
      if (p.id === bldPageId) continue;
      try {
        const raw = _ls.getItem(bldDraftKey(p.id));
        if (raw) { const d = JSON.parse(raw); const j = JSON.stringify(d.state); if (j !== (p.page_json||'')) tasks.push({ id:p.id, title:p.title, json:j }); }
      } catch {}
    }

    let ok = 0, fail = 0;
    for (const t of tasks) {
      const res = await fetch(`/api/pages/${t.id}`,{method:'PUT',headers:{...authHeaders(),'Content-Type':'application/json'},body:JSON.stringify({title:t.title,page_json:t.json})});
      if (res.ok) { const idx=bldPages.findIndex(x=>x.id===t.id); if(idx>=0)bldPages[idx].page_json=t.json; bldClearDraft(t.id); ok++; }
      else fail++;
    }
    sp.style.display='none'; btn.disabled=false;
    bldDrawPages();
    if (fail) toast(`Published ${ok}, ${fail} failed.`, true);
    else toast(ok>1 ? `Published all ${ok} pages!` : 'Published!');
  });

}

async function bldLoadPages() {
  const loading=document.getElementById('bldLoading');
  loading.style.display='flex';
  const prevId=bldPageId;
  const res=await fetch('/api/pages',{headers:authHeaders()});
  if (res.ok) {
    bldPages=await res.json();
    if (!bldPages.find(p=>p.slug==='/')) {
      const sRes=await fetch('/api/settings');
      let existingJson='';
      if (sRes.ok) { const s=await sRes.json(); existingJson=s.page_json||''; }
      const initJson=existingJson||JSON.stringify({bg:__SITE__.bg,accent:__SITE__.accent,text:__SITE__.text,font:'Josefin Sans',sections:[]});
      const cr=await fetch('/api/pages',{method:'POST',headers:{...authHeaders(),'Content-Type':'application/json'},body:JSON.stringify({title:'Home',slug:'/',page_json:initJson})});
      if (cr.ok) { const d=await cr.json(); bldPages.unshift({id:d.id,title:'Home',slug:'/',page_json:initJson,is_published:1}); }
    }
  }
  loading.style.display='none';
  bldDrawPages();
  const toSelect=prevId&&bldPages.find(p=>p.id===prevId)?prevId:bldPages[0]?.id||null;
  if (toSelect) bldPickPage(toSelect);
}
