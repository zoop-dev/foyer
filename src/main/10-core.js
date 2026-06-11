    const VERSION = __VERSION__;




    const FOYER_I18N = {
      en: { search:'Search', search_ph:'Search this site…', search_none:'No results', ask_ph:'Ask a question…', ask_hi:'Hi! Ask me anything.', pw_protected:'This page is password protected.', pw_unlock:'Unlock', pw_wrong:'Incorrect password — try again.', pw_ph:'Password', lang:'Language' },
      es: { search:'Buscar', search_ph:'Buscar en el sitio…', search_none:'Sin resultados', ask_ph:'Haz una pregunta…', ask_hi:'¡Hola! Pregúntame lo que quieras.', pw_protected:'Esta página está protegida con contraseña.', pw_unlock:'Desbloquear', pw_wrong:'Contraseña incorrecta — inténtalo de nuevo.', pw_ph:'Contraseña', lang:'Idioma' },
      fr: { search:'Rechercher', search_ph:'Rechercher sur le site…', search_none:'Aucun résultat', ask_ph:'Posez une question…', ask_hi:'Bonjour ! Posez-moi vos questions.', pw_protected:'Cette page est protégée par un mot de passe.', pw_unlock:'Déverrouiller', pw_wrong:'Mot de passe incorrect — réessayez.', pw_ph:'Mot de passe', lang:'Langue' },
      de: { search:'Suchen', search_ph:'Diese Seite durchsuchen…', search_none:'Keine Ergebnisse', ask_ph:'Stelle eine Frage…', ask_hi:'Hallo! Frag mich alles.', pw_protected:'Diese Seite ist passwortgeschützt.', pw_unlock:'Entsperren', pw_wrong:'Falsches Passwort — bitte erneut versuchen.', pw_ph:'Passwort', lang:'Sprache' },
      pt: { search:'Pesquisar', search_ph:'Pesquisar no site…', search_none:'Sem resultados', ask_ph:'Faça uma pergunta…', ask_hi:'Olá! Pergunte-me qualquer coisa.', pw_protected:'Esta página está protegida por senha.', pw_unlock:'Desbloquear', pw_wrong:'Senha incorreta — tente novamente.', pw_ph:'Senha', lang:'Idioma' },
    };
    try { window.foyerLang = localStorage.getItem('foyer_lang') || ''; } catch { window.foyerLang = ''; }
    function t(key) { const l = window.foyerLang || 'en'; return (FOYER_I18N[l] && FOYER_I18N[l][key]) || FOYER_I18N.en[key] || key; }
    window.foyerT = t;


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

