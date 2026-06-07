

import { opsIpAllowed } from './_lib.js';

export async function onRequestGet({ request, env }) {
  if (!opsIpAllowed(env, request)) return new Response('Not found', { status: 404 });
  return new Response(PAGE, { headers: { 'content-type': 'text/html;charset=utf-8', 'cache-control': 'no-store' } });
}

const PAGE = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Foyer — Operator</title><meta name="robots" content="noindex" />
<link rel="icon" href="/foyer-mark.svg" type="image/svg+xml" />
<link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Unbounded:wght@200;300&family=Josefin+Sans:wght@100;200;300&display=swap" />
<style>
:root{--bg:#0b0e13;--panel:#11151b;--ink:#e8edf2;--muted:#8b94a6;--accent:#7fa6d8;--line:rgba(127,166,216,.14)}
*{margin:0;padding:0;box-sizing:border-box}
body{background:var(--bg);color:var(--ink);font-family:'Josefin Sans',system-ui,sans-serif;font-weight:200;-webkit-font-smoothing:antialiased;min-height:100vh}
a{color:var(--accent);text-decoration:none}
.wrap{max-width:920px;margin:0 auto;padding:0 1.4rem}
header{position:sticky;top:0;z-index:5;background:rgba(11,14,19,.82);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
header .wrap{display:flex;align-items:center;gap:.9rem;height:60px}
.brand{display:flex;align-items:center;gap:.55rem;font-family:'Unbounded',sans-serif;font-weight:300;font-size:1rem}
.brand svg{width:18px;height:21px}.brand .tag{font-size:.5rem;letter-spacing:.3em;text-transform:uppercase;color:var(--accent);margin-left:.2rem}
header .gv{margin-left:auto;font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
header .lo{font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);cursor:pointer}
nav.tabs{display:flex;gap:.4rem;border-bottom:1px solid var(--line);margin:1.4rem 0 1.6rem}
nav.tabs button{background:none;border:none;color:var(--muted);font-family:inherit;font-weight:300;font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;padding:.6rem .9rem;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px}
nav.tabs button.on{color:var(--ink);border-bottom-color:var(--accent)}
.card{border:1px solid var(--line);background:rgba(127,166,216,.03);border-radius:12px;padding:1rem 1.1rem;margin-bottom:.7rem}
.row{display:flex;align-items:center;gap:.8rem;flex-wrap:wrap}
.dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.dom{font-weight:300;font-size:.95rem}
.sub{font-size:.66rem;color:var(--muted);letter-spacing:.04em}
.spacer{margin-left:auto}
.badge{font-size:.55rem;letter-spacing:.1em;text-transform:uppercase;padding:.18rem .45rem;border-radius:4px;font-weight:400}
.b-ok{background:rgba(120,210,150,.16);color:#8fdca8}.b-warn{background:rgba(230,177,90,.16);color:#e6c08a}.b-off{background:rgba(224,96,138,.16);color:#e0608a}.b-dim{background:rgba(139,148,166,.14);color:var(--muted)}
button.btn{font-family:inherit;font-weight:300;font-size:.6rem;letter-spacing:.14em;text-transform:uppercase;padding:.5rem .85rem;border-radius:7px;cursor:pointer;border:1px solid var(--line);background:transparent;color:rgba(232,237,242,.82)}
button.btn:hover{border-color:var(--accent)}
button.btn.danger{color:#e0608a;border-color:rgba(224,96,138,.3)}
button.btn.go{background:var(--accent);color:#070a0e;border:none}
input,select,textarea{background:var(--panel);border:1px solid var(--line);color:var(--ink);font-family:inherit;font-weight:300;font-size:.82rem;padding:.55rem .7rem;border-radius:8px;outline:none}
input:focus,select:focus,textarea:focus{border-color:var(--accent)}
.form{display:flex;gap:.5rem;flex-wrap:wrap;align-items:center;margin-bottom:1.2rem}
.form input,.form select{min-width:0}
h2{font-family:'Unbounded',sans-serif;font-weight:200;font-size:1rem;margin:1.6rem 0 .8rem}
.empty{color:var(--muted);font-size:.78rem;padding:1.2rem 0}
.err-item{font-size:.74rem;padding:.55rem 0;border-bottom:1px solid var(--line);display:flex;gap:.8rem}
.err-item .t{color:var(--muted);font-size:.6rem;letter-spacing:.08em;white-space:nowrap;min-width:64px}

#login{position:fixed;inset:0;background:var(--bg);display:flex;align-items:center;justify-content:center;z-index:10}
#login .box{width:100%;max-width:320px;text-align:center;padding:2rem}
#login svg{width:54px;margin:0 auto 1.4rem;display:block}
#login h1{font-family:'Unbounded',sans-serif;font-weight:200;font-size:1.2rem;margin-bottom:.4rem}
#login .s{font-size:.56rem;letter-spacing:.34em;text-transform:uppercase;color:var(--accent);margin-bottom:2rem}
#login input{width:100%;margin-bottom:.7rem;text-align:center}
#login button{width:100%}#login .e{color:#e0608a;font-size:.62rem;min-height:.9rem;margin-bottom:.5rem}

#toast{position:fixed;left:50%;bottom:26px;transform:translate(-50%,16px);z-index:40;background:var(--panel);border:1px solid var(--line);color:var(--ink);font-size:.74rem;font-weight:300;letter-spacing:.04em;padding:.7rem 1.1rem;border-radius:9px;box-shadow:0 12px 36px rgba(0,0,0,.5);opacity:0;pointer-events:none;transition:opacity .25s,transform .25s;max-width:80vw}
#toast.show{opacity:1;transform:translate(-50%,0)}
#toast.err{border-color:rgba(224,96,138,.5);color:#f0a8be}

#modal{position:fixed;inset:0;z-index:50;background:rgba(6,9,14,.72);backdrop-filter:blur(4px);display:none;align-items:center;justify-content:center;padding:1.5rem}
#modal.show{display:flex}
#modal .mbox{width:100%;max-width:360px;background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:1.4rem;box-shadow:0 20px 60px rgba(0,0,0,.55)}
#modal .mt{font-family:'Unbounded',sans-serif;font-weight:200;font-size:.92rem;margin-bottom:1rem}
#modal input{width:100%;margin-bottom:1rem}
#modal .mrow{display:flex;gap:.5rem;justify-content:flex-end}

.ann-edit{display:flex;flex-direction:column;gap:.55rem;margin-top:.6rem}
.ann-edit .row{gap:.5rem}
.ann-edit input{flex:1;min-width:140px}
</style></head>
<body>
<div id="login"><div class="box">
  <svg viewBox="0 0 44 50" fill="none" stroke="var(--accent)" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 46 V24 a16 16 0 0 1 32 0 V46"/><path d="M15 46 V28 a6 6 0 0 1 12 0 V46"/></svg>
  <h1>Foyer Operator</h1><p class="s">control-plane</p>
  <p class="e" id="loginErr"></p>
  <input type="password" id="pw" placeholder="Operator password" autocomplete="current-password" />
  <button class="btn go" id="loginBtn">Enter</button>
</div></div>

<div id="app" style="display:none">
<header><div class="wrap">
  <span class="brand"><svg viewBox="0 0 44 50" fill="none" stroke="var(--accent)" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 46 V24 a16 16 0 0 1 32 0 V46"/><path d="M15 46 V28 a6 6 0 0 1 12 0 V46"/></svg>Foyer<span class="tag">Operator</span></span>
  <span class="gv" id="gv"></span>
  <a class="lo" href="/dashboard/logout">Sign out</a>
</div></header>
<div class="wrap">
  <nav class="tabs" id="tabs"></nav>
  <div id="view"></div>
</div></div>

<div id="toast"></div>
<div id="modal"><div class="mbox">
  <div class="mt" id="modalTitle"></div>
  <input id="modalInput" />
  <div class="mrow"><button class="btn" id="modalCancel">Cancel</button><button class="btn go" id="modalOk">OK</button></div>
</div></div>

<script>
var D = null, TAB = 'sites';
var esc = function(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');};
function timeAgo(ts){ if(!ts) return 'never'; var s=Math.floor((Date.now()-new Date(ts).getTime())/1000); if(s<60)return s+'s ago'; var m=Math.floor(s/60); if(m<60)return m+'m ago'; var h=Math.floor(m/60); if(h<24)return h+'h ago'; return Math.floor(h/24)+'d ago'; }
function hbOf(domain){ return (D.heartbeats||[]).find(function(h){return h.domain===domain;}); }
function api(path, body){ return fetch('/dashboard/'+path, body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{}).then(function(r){return r.json().then(function(j){return {status:r.status,j:j};});}); }

var _toastT;
function toast(msg, isErr){ var t=document.getElementById('toast'); t.textContent=msg; t.className='show'+(isErr?' err':''); clearTimeout(_toastT); _toastT=setTimeout(function(){ t.className=''; }, 2600); }

function modal(title, opts){ opts=opts||{}; return new Promise(function(resolve){
  var m=document.getElementById('modal'), inp=document.getElementById('modalInput');
  document.getElementById('modalTitle').textContent=title;
  inp.style.display=opts.input?'':'none'; inp.value=opts.value||''; inp.placeholder=opts.placeholder||'';
  document.getElementById('modalOk').textContent=opts.ok||'OK';
  m.classList.add('show'); if(opts.input) setTimeout(function(){inp.focus();},30);
  function done(val){ m.classList.remove('show'); document.getElementById('modalOk').onclick=null; document.getElementById('modalCancel').onclick=null; inp.onkeydown=null; resolve(val); }
  document.getElementById('modalOk').onclick=function(){ done(opts.input?inp.value:true); };
  document.getElementById('modalCancel').onclick=function(){ done(opts.input?null:false); };
  inp.onkeydown=function(e){ if(e.key==='Enter') done(inp.value); if(e.key==='Escape') done(null); };
}); }
function modalPrompt(title, o){ o=o||{}; o.input=true; return modal(title, o); }
function modalConfirm(title, o){ return modal(title, o||{}); }

function act(payload){ return api('action', payload).then(function(r){ if(r.status!==200||!r.j.ok){ toast('Failed: '+(r.j.error||r.status), true); } return load(); }); }

function load(){
  return api('data').then(function(r){
    if(r.status===401){ document.getElementById('app').style.display='none'; document.getElementById('login').style.display='flex'; return; }
    D = r.j; document.getElementById('login').style.display='none'; document.getElementById('app').style.display='';
    document.getElementById('gv').textContent = 'global v'+(D.latest_version||'?');
    renderTabs(); render();
  });
}
function renderTabs(){
  var tabs=[['sites','Sites'],['announcements','Announcements'],['flags','Flags'],['errors','Errors'],['moderation','Moderation']];
  document.getElementById('tabs').innerHTML = tabs.map(function(t){ return '<button class="'+(TAB===t[0]?'on':'')+'" data-t="'+t[0]+'">'+t[1]+'</button>'; }).join('');
  document.querySelectorAll('#tabs button').forEach(function(b){ b.onclick=function(){ TAB=b.dataset.t; renderTabs(); render(); }; });
}
function siteOptions(){ return '<option value="global">All sites (global)</option>'+(D.sites||[]).map(function(s){return '<option value="'+esc(s.domain)+'">'+esc(s.domain)+'</option>';}).join(''); }

function render(){
  var v=document.getElementById('view');
  if(TAB==='sites') v.innerHTML = renderSites();
  else if(TAB==='announcements') v.innerHTML = renderAnn();
  else if(TAB==='flags') v.innerHTML = renderFlags();
  else if(TAB==='errors') v.innerHTML = renderErrors();
  else if(TAB==='moderation') v.innerHTML = renderModeration();
  wire();
}

function renderSites(){
  if(!(D.sites||[]).length) return '<p class="empty">No sites registered.</p>';
  return (D.sites||[]).map(function(s){
    var hb=hbOf(s.domain); var live = hb && (Date.now()-new Date(hb.last_seen).getTime()<600000);
    var dot = s.offline?'#e6c08a':(live?'#8fdca8':'#5a6373');
    var ver = hb&&hb.live_version ? (D.latest_version&&hb.live_version!==D.latest_version?'<span class="badge b-warn">v'+esc(hb.live_version)+' behind</span>':'<span class="badge b-ok">v'+esc(hb.live_version)+'</span>') : '<span class="badge b-dim">—</span>';
    return '<div class="card"><div class="row">'+
      '<span class="dot" style="background:'+dot+'"></span>'+
      '<div><div class="dom">'+esc(s.domain)+'</div><div class="sub">'+esc(s.name||'')+' · seen '+timeAgo(hb&&hb.last_seen)+'</div></div>'+
      '<span class="spacer"></span>'+ver+
      (s.licensed?'<span class="badge b-ok">licensed</span>':'<span class="badge b-off">unlicensed</span>')+
      (s.offline?'<span class="badge b-warn">offline</span>':'')+
      (s.ai_enabled===false?'<span class="badge b-dim">AI off</span>':'')+
      (s.hide_branding===true?'<span class="badge b-dim">white-label</span>':'')+
      '</div><div class="row" style="margin-top:.8rem">'+
      '<button class="btn" data-act="offline" data-dom="'+esc(s.domain)+'" data-val="'+(s.offline?'0':'1')+'">'+(s.offline?'Bring online':'Take offline')+'</button>'+
      '<button class="btn '+(s.licensed?'danger':'')+'" data-act="license" data-dom="'+esc(s.domain)+'" data-val="'+(s.licensed?'0':'1')+'">'+(s.licensed?'Unlicense':'License')+'</button>'+
      '<button class="btn" data-act="ai" data-dom="'+esc(s.domain)+'" data-val="'+(s.ai_enabled===false?'1':'0')+'">'+(s.ai_enabled===false?'Enable AI':'Disable AI')+'</button>'+
      '<button class="btn" data-act="branding" data-dom="'+esc(s.domain)+'" data-val="'+(s.hide_branding===true?'0':'1')+'">'+(s.hide_branding===true?'Show branding':'Hide branding')+'</button>'+
      '<button class="btn" data-modedit="'+esc(s.domain)+'">Moderation'+(s.moderation_config?' <span class="badge b-warn">custom</span>':'')+'</button>'+
      '</div><div class="site-mod" data-modfor="'+esc(s.domain)+'"></div></div>';
  }).join('');
}
function renderAnn(){
  var form='<div class="form"><select id="annScope">'+siteOptions()+'</select>'+
    '<input id="annMsg" placeholder="Message" style="flex:1;min-width:180px" />'+
    '<select id="annLevel"><option value="info">Info</option><option value="warn">Warn</option></select>'+
    '<input id="annHide" type="number" min="0" placeholder="hide after (s)" style="width:130px" />'+
    '<button class="btn go" id="annAdd">Push</button></div>';
  var list=(D.announcements||[]).length? (D.announcements||[]).map(function(a){
    return '<div class="card" id="ann-'+esc(a.id)+'"><div class="row"><span class="badge '+(a.active?'b-ok':'b-dim')+'">'+(a.active?'active':'off')+'</span>'+
      '<span class="badge '+(a.level==='warn'?'b-warn':'b-dim')+'">'+esc(a.level)+'</span>'+
      '<span class="badge b-dim">'+esc(a.scope==='global'?'all sites':a.scope)+'</span>'+
      '<span class="spacer"></span>'+
      '<button class="btn" data-anntoggle="'+esc(a.id)+'" data-val="'+(a.active?'0':'1')+'">'+(a.active?'Deactivate':'Activate')+'</button>'+
      '<button class="btn" data-annedit="'+esc(a.id)+'">Edit</button>'+
      '<button class="btn danger" data-anndel="'+esc(a.id)+'">Delete</button>'+
      '</div><div class="ann-body" style="margin-top:.5rem;font-size:.85rem;font-weight:200">'+esc(a.message)+'</div></div>';
  }).join(''):'<p class="empty">No announcements.</p>';
  var clr='<div class="row" style="margin-top:.4rem"><button class="btn" data-annclear="global">Deactivate all-sites</button> <button class="btn danger" data-annremove="global">Remove all-sites</button></div>';
  return '<h2>Push announcement</h2>'+form+'<h2>Recent</h2>'+list+clr;
}
function renderFlags(){
  var form='<div class="form"><select id="flScope">'+siteOptions()+'</select>'+
    '<input id="flKey" placeholder="key" style="width:160px" /><input id="flVal" placeholder="value (on)" style="width:120px" />'+
    '<button class="btn go" id="flAdd">Set</button></div>';
  var list=(D.flags||[]).length? (D.flags||[]).map(function(f){
    return '<div class="card"><div class="row"><span class="badge b-dim">'+esc(f.scope==='global'?'all':f.scope)+'</span>'+
      '<span class="dom" style="font-size:.85rem">'+esc(f.key)+'</span><span class="sub">= '+esc(f.value)+'</span>'+
      '<span class="spacer"></span><button class="btn danger" data-flrm="'+esc(f.scope)+'|'+esc(f.key)+'">Remove</button></div></div>';
  }).join(''):'<p class="empty">No flags set.</p>';
  return '<h2>Set feature flag</h2>'+form+'<h2>Flags</h2>'+list;
}
function renderErrors(){
  if(!(D.errors||[]).length) return '<p class="empty">No errors reported 🎉</p>';
  return '<div class="card">'+(D.errors||[]).map(function(e){
    return '<div class="err-item"><span class="t">'+timeAgo(e.created_at)+'</span><div><div>'+esc(e.message||'')+'</div><div class="sub">'+esc(e.domain||'')+' · '+esc(e.url||'')+'</div></div></div>';
  }).join('')+'</div>';
}
function renderModeration(){
  var c = D.moderation_config || {};
  var on = function(k){ return c[k] !== false; };   // default on
  var cb = function(id,k,label){ return '<label style="display:block;margin:.35rem 0;font-size:.82rem;font-weight:200;cursor:pointer"><input type="checkbox" id="'+id+'" '+(on(k)?'checked':'')+' style="margin-right:.5rem;vertical-align:middle"/>'+label+'</label>'; };
  var cfg = '<div class="card"><h2 style="margin-top:0">Settings</h2>'+
    cb('mEnabled','enabled','<b>Moderation enabled</b>')+
    cb('mDead','dead','Remove dead links (404 / 410 / DNS-fail)')+
    cb('mHttp','http','Remove forbidden / unauthorized (401 / 403)')+
    cb('mInappr','inappropriate','Remove inappropriate links (blocklist)')+
    '<div class="sub" style="margin:.7rem 0 .25rem">Extra blocked domains (one per line)</div>'+
    '<textarea id="mBlock" rows="4" style="width:100%;background:var(--bg);border:1px solid var(--line);color:var(--ink);border-radius:8px;padding:.5rem;font-family:inherit;font-size:.8rem">'+esc((c.blocklist||[]).join('\\n'))+'</textarea>'+
    '<div class="sub" style="margin:.7rem 0 .25rem">Extra blocked host keywords (one per line)</div>'+
    '<textarea id="mKw" rows="3" style="width:100%;background:var(--bg);border:1px solid var(--line);color:var(--ink);border-radius:8px;padding:.5rem;font-family:inherit;font-size:.8rem">'+esc((c.keywords||[]).join('\\n'))+'</textarea>'+
    '<div class="row" style="margin-top:.8rem"><button class="btn go" id="mSave">Save settings</button></div>'+
    '<div class="sub" style="margin-top:.5rem">Built-in blocklist (grabbers, adult, scams) always applies on top of these unless the category is off. Changes take effect within ~1 min.</div></div>';
  var log = '<h2>Recent removals</h2>'+((D.moderation||[]).length
    ? '<div class="card">'+(D.moderation||[]).map(function(m){
        var meta=[esc(m.domain||''), m.slug?esc(m.slug):'', m.block_type?(esc(m.block_type)+' block'):''].filter(Boolean).join(' · ');
        return '<div class="err-item"><span class="t">'+timeAgo(m.created_at)+'</span><div><div><span class="badge b-warn">'+esc(m.reason||'')+'</span> <span class="sub">'+esc(m.url||'')+'</span></div><div class="sub">'+meta+'</div></div></div>';
      }).join('')+'</div>'
    : '<p class="empty">No moderation actions yet.</p>');
  return cfg + log;
}

function annById(id){ return (D.announcements||[]).find(function(a){return String(a.id)===String(id);}); }
function openAnnEdit(id){
  var a=annById(id); if(!a) return;
  var card=document.getElementById('ann-'+id); if(!card) return;
  card.querySelector('.ann-body').style.display='none';
  if(card.querySelector('.ann-edit')) return;
  var box=document.createElement('div'); box.className='ann-edit';
  box.innerHTML='<div class="row"><input class="ae-msg" /></div>'+
    '<div class="row"><select class="ae-scope">'+siteOptions()+'</select>'+
    '<select class="ae-level"><option value="info">Info</option><option value="warn">Warn</option></select>'+
    '<input class="ae-hide" type="number" min="0" placeholder="hide after (s)" style="width:130px" /></div>'+
    '<div class="row"><button class="btn go ae-save">Save</button><button class="btn ae-cancel">Cancel</button></div>';
  card.appendChild(box);
  box.querySelector('.ae-msg').value=a.message||'';
  box.querySelector('.ae-scope').value=a.scope||'global';
  box.querySelector('.ae-level').value=a.level||'info';
  box.querySelector('.ae-hide').value=a.hide_after||'';
  box.querySelector('.ae-save').onclick=function(){
    act({type:'announce_edit', id:id, message:box.querySelector('.ae-msg').value.trim(),
      scope:box.querySelector('.ae-scope').value, level:box.querySelector('.ae-level').value,
      hide_after:parseInt(box.querySelector('.ae-hide').value,10)||0}).then(function(){ toast('Announcement updated'); });
  };
  box.querySelector('.ae-cancel').onclick=function(){ box.remove(); card.querySelector('.ann-body').style.display=''; };
}

function siteByDom(d){ return (D.sites||[]).find(function(s){return s.domain===d;}); }
function openSiteModeration(dom){
  var s=siteByDom(dom); if(!s) return;
  var box=document.querySelector('.site-mod[data-modfor="'+dom+'"]'); if(!box) return;
  if(box.innerHTML){ box.innerHTML=''; return; }
  var g=D.moderation_config||{}, ov=s.moderation_config||{};
  var eff=function(k){ var v=(k in ov)?ov[k]:g[k]; return v!==false; };
  var cb=function(id,k,label){ return '<label style="display:inline-block;margin:.3rem .9rem .3rem 0;font-size:.8rem;font-weight:200;cursor:pointer"><input type="checkbox" data-mk="'+id+'" '+(eff(k)?'checked':'')+' style="margin-right:.4rem;vertical-align:middle"/>'+label+'</label>'; };
  box.innerHTML='<div style="margin-top:.7rem;padding-top:.7rem;border-top:1px solid var(--line)">'+
    '<div class="sub" style="margin-bottom:.4rem">'+(s.moderation_config?'Overriding global':'Inherits global — saving pins these for this site')+'</div>'+
    cb('enabled','enabled','<b>Enabled</b>')+cb('dead','dead','Dead links')+cb('http','http','401 / 403')+cb('inappr','inappropriate','Inappropriate')+
    '<div class="row" style="margin-top:.5rem"><button class="btn go" data-modsave="'+esc(dom)+'">Save</button>'+
    (s.moderation_config?'<button class="btn" data-modclear="'+esc(dom)+'">Use global</button>':'')+'</div></div>';
  box.querySelector('[data-modsave]').onclick=function(){ act({type:'site_moderation', domain:dom, config:{ enabled:box.querySelector('[data-mk="enabled"]').checked, dead:box.querySelector('[data-mk="dead"]').checked, http:box.querySelector('[data-mk="http"]').checked, inappropriate:box.querySelector('[data-mk="inappr"]').checked }}).then(function(){ toast('Site moderation saved'); }); };
  var clr=box.querySelector('[data-modclear]'); if(clr) clr.onclick=function(){ act({type:'site_moderation', domain:dom, config:null}).then(function(){ toast('Reverted to global'); }); };
}
function wire(){
  document.querySelectorAll('[data-act]').forEach(function(b){ b.onclick=function(){
    var t=b.dataset.act, dom=b.dataset.dom, val=b.dataset.val==='1';
    if((t==='offline'&&val)||(t==='license'&&!val)){
      modalPrompt((t==='offline'?'Offline':'Unlicensed')+' message for '+dom+' (optional):', {ok:'Apply'}).then(function(reason){
        if(reason===null) return; act({type:t, domain:dom, value:val, reason:reason||''});
      });
    } else { act({type:t, domain:dom, value:val, reason:''}); }
  };});
  var aa=document.getElementById('annAdd'); if(aa) aa.onclick=function(){ var msg=document.getElementById('annMsg').value.trim(); if(!msg){ toast('Message required', true); return; } act({type:'announce', scope:document.getElementById('annScope').value, message:msg, level:document.getElementById('annLevel').value, hide_after:parseInt(document.getElementById('annHide').value,10)||0}).then(function(){ toast('Announcement pushed'); }); };
  document.querySelectorAll('[data-anntoggle]').forEach(function(b){ b.onclick=function(){ act({type:'announce_edit', id:b.dataset.anntoggle, active:b.dataset.val==='1'}); }; });
  document.querySelectorAll('[data-annedit]').forEach(function(b){ b.onclick=function(){ openAnnEdit(b.dataset.annedit); }; });
  document.querySelectorAll('[data-anndel]').forEach(function(b){ b.onclick=function(){ modalConfirm('Permanently delete this announcement?', {ok:'Delete'}).then(function(ok){ if(ok) act({type:'announce_delete', id:b.dataset.anndel}).then(function(){ toast('Deleted'); }); }); }; });
  document.querySelectorAll('[data-annclear]').forEach(function(b){ b.onclick=function(){ act({type:'announce_clear', scope:b.dataset.annclear}).then(function(){ toast('Deactivated'); }); }; });
  document.querySelectorAll('[data-annremove]').forEach(function(b){ b.onclick=function(){ modalConfirm('Permanently remove all-sites announcements?', {ok:'Remove'}).then(function(ok){ if(ok) act({type:'announce_remove', scope:b.dataset.annremove}); }); }; });
  var fa=document.getElementById('flAdd'); if(fa) fa.onclick=function(){ var k=document.getElementById('flKey').value.trim(); if(!k){ toast('Key required', true); return; } act({type:'flag', scope:document.getElementById('flScope').value, key:k, value:document.getElementById('flVal').value.trim()||'on'}); };
  document.querySelectorAll('[data-flrm]').forEach(function(b){ b.onclick=function(){ var p=b.dataset.flrm.split('|'); act({type:'flag_remove', scope:p[0], key:p[1]}); }; });
  document.querySelectorAll('[data-modedit]').forEach(function(b){ b.onclick=function(){ openSiteModeration(b.dataset.modedit); }; });
  var ms=document.getElementById('mSave'); if(ms) ms.onclick=function(){
    var lines=function(id){ return document.getElementById(id).value.split('\\n').map(function(s){return s.trim().toLowerCase();}).filter(Boolean); };
    var cfg={ enabled:document.getElementById('mEnabled').checked, dead:document.getElementById('mDead').checked, http:document.getElementById('mHttp').checked, inappropriate:document.getElementById('mInappr').checked, blocklist:lines('mBlock'), keywords:lines('mKw') };
    act({type:'set_moderation', config:cfg}).then(function(){ toast('Moderation settings saved'); });
  };
}

document.getElementById('loginBtn').onclick=function(){
  var pw=document.getElementById('pw').value;
  api('login',{password:pw}).then(function(r){ if(r.status===200&&r.j.ok){ load(); } else { document.getElementById('loginErr').textContent=r.status===404?'Not available from this network.':'Wrong password.'; document.getElementById('pw').value=''; } });
};
document.getElementById('pw').addEventListener('keydown',function(e){ if(e.key==='Enter') document.getElementById('loginBtn').click(); });
load();
</script></body></html>`;
