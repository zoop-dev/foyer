    const VERSION = __VERSION__;




    try { window.foyerLang = localStorage.getItem('foyer_lang') || ''; } catch { window.foyerLang = ''; }
    window.__i18nAll = null;   // the whole file (all languages)
    window.__i18n = null;      // the current language's strings
    function t(key) { return (window.__i18n && window.__i18n[key]) || key; }
    window.foyerT = t;
    window.foyerLoadI18n = async function (lang) {
      lang = lang || 'en';
      if (!window.__i18nAll) {
        try { const c = localStorage.getItem('foyer_i18n_all'); if (c) window.__i18nAll = JSON.parse(c); } catch {}
        try { const d = await fetch('/assets/i18n.json').then(r => r.json()); if (d) { window.__i18nAll = d; try { localStorage.setItem('foyer_i18n_all', JSON.stringify(d)); } catch {} } } catch {}
      }
      window.__i18n = (window.__i18nAll && (window.__i18nAll[lang] || window.__i18nAll.en)) || null;
    };


    try { if (!localStorage.getItem('foyer_cleared_v1')) { localStorage.clear(); localStorage.setItem('foyer_cleared_v1', '1'); } } catch {}

    const ring = document.getElementById('cr');
    const dot  = document.getElementById('cd');
    let rx = -100, ry = -100, dx = -100, dy = -100;
    document.addEventListener('mousemove', e => { dx = e.clientX; dy = e.clientY; });
    function hookHover(el) {
      if (!el) return;
      el.addEventListener('mouseenter', () => ring.classList.add('hov'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hov'));
    }
    document.querySelectorAll('a, button').forEach(hookHover);
    (function moveCursor() {
      rx += (dx - rx) * 0.12; ry += (dy - ry) * 0.12;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      dot.style.left  = dx + 'px'; dot.style.top  = dy + 'px';
      requestAnimationFrame(moveCursor);
    })();

    const SESSION_KEY = 'foyer_session';
    const SESSION_TTL = 7 * 24 * 60 * 60 * 1000;

    try { if (new URLSearchParams(location.search).get('admin_return') === '1') sessionStorage.setItem('foyer_admin_return', '1'); } catch {}


    (function() {
      try {
        const s = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
        const hasSession = s && (Date.now() - s.ts <= SESSION_TTL);
        const hasOAuthCode = location.search.includes('code=');
        const isPublic = localStorage.getItem('foyer_public') === '1' || __SITE__.publicAccess === true;
        if (!hasSession && !hasOAuthCode && !isPublic) {
          const gate = document.getElementById('gate');
          gate.style.opacity = '1';
          gate.style.pointerEvents = 'auto';
        }
      } catch {}
    })();

    function getSession() {
      try {
        const s = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
        if (!s || Date.now() - s.ts > SESSION_TTL) { localStorage.removeItem(SESSION_KEY); return null; }
        return s;
      } catch { return null; }
    }
    function setSession(data) {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ ...data, ts: Date.now() }));
    }

    function dismissLoading() {
      const el = document.getElementById('loading-screen');
      if (el) { el.classList.add('out'); setTimeout(() => el.remove(), 520); }
    }

    function dismissGate() {
      const gate = document.getElementById('gate');
      gate.style.transition = 'opacity 0.55s';
      gate.style.opacity = '0';
      setTimeout(() => { gate.style.display = 'none'; }, 580);
    }

    function showFallback(session) {
      dismissLoading();
      const scene = document.getElementById('scene');
      scene.style.display = 'flex';
      if (session) {
        document.getElementById('userAvatar').src = session.picture || '';
        document.getElementById('userAvatar').style.display = session.picture ? '' : 'none';
        document.getElementById('userNameText').textContent = session.name || session.email || '';
        document.getElementById('userBadge').style.display = 'flex';
      }
    }

    function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
    function escAttr(s) { return String(s).replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

    function pgRgb(hex, a) {
      const h = hex.replace('#','');
      return `rgba(${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)},${a})`;
    }
    function pgE(s) { return foyerIconText(String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')); }
    marked.use({ breaks: true, gfm: true });


    const md = s => foyerIconText(marked.parse(String(s||'')).replace(/<\/a>(?=[A-Za-z0-9])/g, '</a> '));

