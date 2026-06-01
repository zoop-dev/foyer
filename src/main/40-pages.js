    async function loadNav(session) {
      const data = await protectedFetch('/api/nav', session);
      if (!data) return;
      const { pages = [], custom_links = [], nav_title = '', nav_style = 'blurred', nav_align = 'left', nav_position = 'top' } = data;
      if (!pages.length && !custom_links.length && !nav_title) return;
      const nav = document.getElementById('site-nav');
      const cur = window.location.pathname.replace(/\/$/, '') || '/';

      let navPref = '';
      try { navPref = localStorage.getItem('foyer_nav_pref') || ''; } catch {}
      const pos = ['top','bottom','left','right'].includes(navPref) ? navPref
                : ['top','bottom','left','right'].includes(nav_position) ? nav_position : 'top';
      const vertical = pos === 'left' || pos === 'right';
      const siteBg     = getComputedStyle(document.documentElement).getPropertyValue('--site-bg').trim()     || '#020a03';
      const siteAccent = getComputedStyle(document.documentElement).getPropertyValue('--site-accent').trim() || '#4dbd6a';
      const bSide = pos==='bottom'?'border-top':pos==='left'?'border-right':pos==='right'?'border-left':'border-bottom';
      const styleMap = {
        blurred:     `background:${siteBg}dd;backdrop-filter:blur(10px);${bSide}:1px solid ${siteAccent}18;`,
        solid:       `background:${siteBg};${bSide}:1px solid ${siteAccent}20;`,
        transparent: 'background:transparent;',
      };
      nav.style.cssText = (styleMap[nav_style] || styleMap.blurred);
      const alignMap = { left:'flex-start', center:'center', right:'flex-end' };
      const j = alignMap[nav_align] || 'flex-start';
      const pageLinks = pages.map(p => {
        const href = p.slug === '/' ? '/' : (p.slug.startsWith('/') ? p.slug : '/' + p.slug);
        return `<a href="${href}" class="nav-a${href === cur ? ' cur' : ''}">${p.title}</a>`;
      });
      const extLinks = custom_links.map(l =>
        `<a href="${escAttr(l.url || '#')}" class="nav-a" target="${l.new_tab !== false ? '_blank' : '_self'}" rel="noopener">${pgE(l.label || '')}</a>`
      );
      const links = [...pageLinks, ...extLinks].join('');
      const wrapStyle = vertical
        ? `display:flex;flex-direction:column;gap:1rem;align-items:${j};width:100%;`
        : `flex:1;display:flex;gap:2rem;justify-content:${j};`;
      const titleSpan = nav_title
        ? `<span style="font-family:'Josefin Sans',sans-serif;font-weight:200;font-size:.7rem;letter-spacing:.18em;text-transform:uppercase;color:rgba(var(--site-muted-rgb),0.75);flex-shrink:0;${vertical?'margin-bottom:.5rem;':''}">${nav_title}</span>`
        : '';
      nav.innerHTML = titleSpan + `<div style="${wrapStyle}">${links}</div>`;
      nav.className = 'on pos-' + pos;
      const scene = document.getElementById('scene');
      scene.classList.remove('nav-pad-top','nav-pad-bottom','nav-pad-left','nav-pad-right');
      scene.classList.add('nav-pad-' + pos);

      document.body.classList.remove('nav-bottom','nav-left','nav-right');
      if (pos !== 'top') document.body.classList.add('nav-' + pos);
    }

    function syncCursor() {
      const verifiOpen = !!document.getElementById('_st4ts_mbw');
      const gate = document.getElementById('gate');
      const gateVisible = gate && gate.style.display !== 'none' && gate.style.opacity !== '0';
      const modalOpen = !!document.querySelector('#acct-modal.show, #ml-modal.show');
      const hide = verifiOpen || gateVisible || modalOpen;
      document.getElementById('cr').style.display = hide ? 'none' : '';
      document.getElementById('cd').style.display = hide ? 'none' : '';
      document.body.classList.toggle('sys-cursor', hide);
    }

    new MutationObserver(syncCursor).observe(document.body, { childList: true, subtree: true });
    setInterval(syncCursor, 300);

    let versionPollStarted = false;
    let banPollStarted = false;
    function startBanPoll(session) {
      if (banPollStarted || !session?.session_token) return;
      banPollStarted = true;
      setInterval(async () => {
        if (_rateLimited) return;
        const r = await fetch('/api/me', { headers: sessionHeaders(session) }).catch(() => null);
        if (!r) return;
        if (check429(r)) return;
        if (r.status === 403) {
          const d = await r.json().catch(() => ({}));
          if (d?.banned) showBannedScreen();
        } else if (r.ok) {

          const bs = document.getElementById('banned-screen');
          if (bs) { bs.style.opacity = '0'; bs.style.transition = 'opacity .5s'; setTimeout(() => { bs.remove(); loadAndShow(session); }, 520); }
        }
      }, 20000);
    }

    function setMeta(title, desc, slug) {
      const origin = 'https://' + __SITE__.domain;
      const url = origin + (slug === '/' ? '/' : (slug.startsWith('/') ? slug : '/' + slug));
      document.title = title;
      const set = (id, val) => { const el = document.getElementById(id); if (el) el.content = val; };
      const setHref = (id, val) => { const el = document.getElementById(id); if (el) el.href = val; };
      const setAttr = (id, attr, val) => { const el = document.getElementById(id); if (el) el.setAttribute(attr, val); };
      set('og-title', title); set('tw-title', title);
      set('og-desc', desc); set('tw-desc', desc);
      setAttr('og-url', 'content', url); setHref('canonical', url);
      document.querySelector('meta[name="description"]').content = desc || title;
      const ldEl = document.getElementById('ld-json');
      if (ldEl) ldEl.textContent = JSON.stringify({"@context":"https://schema.org","@type":"Person","name":title,"url":url,"creator":{"@type":"Organization","name":"zo0p.dev","url":"https://zo0p.dev"}});
    }

    function pingAnalytics(path, session) {
      if (_rateLimited) return;
      fetch('/api/analytics/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session:  session?.session_token || '',
          path:     path,
          referrer: document.referrer || '',
          screen:   `${screen.width}x${screen.height}`,
          lang:     navigator.language || '',
        }),
      }).catch(() => {});
    }

    async function renderCollectionIndex(kind, session) {
      dismissLoading();
      const isRev = kind === 'reviews';
      const bg = getComputedStyle(document.documentElement).getPropertyValue('--site-bg').trim() || '#020a03';
      const accent = getComputedStyle(document.documentElement).getPropertyValue('--site-accent').trim() || '#4dbd6a';
      const text = getComputedStyle(document.documentElement).getPropertyValue('--site-text').trim() || '#c8e6aa';
      const scene = document.getElementById('scene');
      scene.style.cssText = 'position:fixed;inset:0;z-index:10;display:block;overflow-y:auto;padding:44px 0 0;';
      scene.style.background = bg;
      loadNav(session);

      let items = [];
      try {
        const r = await fetch('/api/' + kind, { headers: sessionHeaders(session) });
        items = await r.json();
      } catch(e) {}
      if (!Array.isArray(items)) items = [];

      const starStr = n => { n = Math.max(0, Math.min(5, parseInt(n)||0)); return n ? '★'.repeat(n) : ''; };
      const cards = items.map(t => `<a href="/${isRev?'review':'tutorials'}/${escAttr(t.slug)}" style="display:block;text-decoration:none;border:1px solid ${pgRgb(accent,.12)};background:${pgRgb(accent,.03)};transition:border-color .2s,transform .2s;">
        ${t.cover_image?`<img src="${escAttr(t.cover_image)}" style="width:100%;height:150px;object-fit:cover;display:block;" />`:`<div style="width:100%;height:150px;background:${pgRgb(accent,.06)};"></div>`}
        <div style="padding:.9rem 1rem;">
          ${isRev&&t.rating?`<div style="color:${accent};font-size:.82rem;letter-spacing:.1em;margin-bottom:.3rem;">${starStr(t.rating)}</div>`:''}
          <div style="font-weight:300;font-size:.95rem;letter-spacing:.03em;color:${pgRgb(text,.92)};">${pgE(t.title)}</div>
          ${t.description?`<div style="font-size:.72rem;font-weight:200;line-height:1.65;color:${pgRgb(text,.5)};margin-top:.35rem;">${pgE(t.description)}</div>`:''}
        </div>
      </a>`).join('');

      scene.innerHTML = `
        <div style="max-width:920px;margin:0 auto;padding:2.5rem 1.5rem 6rem;font-family:'Josefin Sans',sans-serif;color:${text};">
          <h1 style="font-weight:200;font-size:clamp(1.8rem,5vw,2.6rem);letter-spacing:.02em;margin-bottom:.4rem;">${isRev?'Reviews':'Tutorials'}</h1>
          <p style="font-weight:200;font-size:.8rem;color:${pgRgb(text,.45)};margin-bottom:2rem;">${items.length} ${items.length===1?(isRev?'review':'tutorial'):(isRev?'reviews':'tutorials')}</p>
          ${items.length ? `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1.4rem;">${cards}</div>`
            : `<p style="font-weight:200;font-size:.85rem;color:${pgRgb(text,.4)};">Nothing here yet — check back soon.</p>`}
        </div>`;
      scene.querySelectorAll('a, button').forEach(hookHover);
      if (session) {
        document.getElementById('userAvatar').src = session.picture || '';
        document.getElementById('userAvatar').style.display = session.picture ? '' : 'none';
        document.getElementById('userNameText').textContent = session.name || session.email || '';
        document.getElementById('userBadge').style.display = 'flex';
      }
    }

    function renderTutorialDetail(tut, session) {
      dismissLoading();
      const bg = getComputedStyle(document.documentElement).getPropertyValue('--site-bg').trim() || '#020a03';
      const accent = getComputedStyle(document.documentElement).getPropertyValue('--site-accent').trim() || '#4dbd6a';
      const text = getComputedStyle(document.documentElement).getPropertyValue('--site-text').trim() || '#c8e6aa';
      const scene = document.getElementById('scene');
      scene.style.cssText = 'position:fixed;inset:0;z-index:10;display:block;overflow-y:auto;padding:44px 0 0;';
      scene.style.background = bg;
      const cover = tut.cover_image
        ? `<img src="${escAttr(tut.cover_image)}" alt="" style="width:100%;max-height:340px;object-fit:cover;display:block;" />`
        : '';
      scene.innerHTML = `
        <article style="max-width:720px;margin:0 auto;padding:2.5rem 1.5rem 6rem;font-family:'Josefin Sans',sans-serif;color:${text};">
          <a href="/tutorials/all" style="font-size:.6rem;font-weight:200;letter-spacing:.2em;text-transform:uppercase;color:${pgRgb(accent,.6)};text-decoration:none;">← All Tutorials</a>
          <h1 style="font-weight:300;font-size:clamp(1.8rem,5vw,2.8rem);letter-spacing:-.01em;line-height:1.1;margin:1.4rem 0 .6rem;">${pgE(tut.title || '')}</h1>
          ${tut.description ? `<p style="font-weight:200;font-style:italic;font-size:1rem;color:${pgRgb(text,.55)};letter-spacing:.02em;margin-bottom:1.6rem;">${pgE(tut.description)}</p>` : ''}
          ${cover ? `<div style="margin:1.4rem 0 2rem;border:1px solid ${pgRgb(accent,.12)};">${cover}</div>` : '<div style="height:1px;background:'+pgRgb(accent,.12)+';margin:1.6rem 0 2rem;"></div>'}
          <div class="md-content" style="font-weight:200;font-size:.95rem;line-height:1.95;color:${pgRgb(text,.82)};">${md(tut.content || '')}</div>
        </article>`;
      scene.querySelectorAll('a, button').forEach(hookHover);
      if (session) {
        document.getElementById('userAvatar').src = session.picture || '';
        document.getElementById('userAvatar').style.display = session.picture ? '' : 'none';
        document.getElementById('userNameText').textContent = session.name || session.email || '';
        document.getElementById('userBadge').style.display = 'flex';
      }
    }

    function renderReviewDetail(rev, session) {
      dismissLoading();
      const bg = getComputedStyle(document.documentElement).getPropertyValue('--site-bg').trim() || '#020a03';
      const accent = getComputedStyle(document.documentElement).getPropertyValue('--site-accent').trim() || '#4dbd6a';
      const text = getComputedStyle(document.documentElement).getPropertyValue('--site-text').trim() || '#c8e6aa';
      const scene = document.getElementById('scene');
      scene.style.cssText = 'position:fixed;inset:0;z-index:10;display:block;overflow-y:auto;padding:44px 0 0;';
      scene.style.background = bg;
      const rating = Math.max(0, Math.min(5, parseInt(rev.rating) || 0));
      const stars = rating ? `<div style="font-size:1.1rem;letter-spacing:.15em;color:${accent};margin-bottom:1rem;">${'★'.repeat(rating)}<span style="color:${pgRgb(text,.2)};">${'★'.repeat(5-rating)}</span></div>` : '';
      const cover = rev.cover_image ? `<img src="${escAttr(rev.cover_image)}" alt="" style="width:100%;max-height:340px;object-fit:cover;display:block;" />` : '';
      scene.innerHTML = `
        <article style="max-width:720px;margin:0 auto;padding:2.5rem 1.5rem 6rem;font-family:'Josefin Sans',sans-serif;color:${text};">
          <a href="/reviews/all" style="font-size:.6rem;font-weight:200;letter-spacing:.2em;text-transform:uppercase;color:${pgRgb(accent,.6)};text-decoration:none;">← All Reviews</a>
          <h1 style="font-weight:300;font-size:clamp(1.8rem,5vw,2.8rem);letter-spacing:-.01em;line-height:1.1;margin:1.4rem 0 .6rem;">${pgE(rev.title || '')}</h1>
          ${stars}
          ${rev.description ? `<p style="font-weight:200;font-style:italic;font-size:1rem;color:${pgRgb(text,.55)};letter-spacing:.02em;margin-bottom:1.6rem;">${pgE(rev.description)}</p>` : ''}
          ${cover ? `<div style="margin:1.4rem 0 2rem;border:1px solid ${pgRgb(accent,.12)};">${cover}</div>` : '<div style="height:1px;background:'+pgRgb(accent,.12)+';margin:1.6rem 0 2rem;"></div>'}
          <div class="md-content" style="font-weight:200;font-size:.95rem;line-height:1.95;color:${pgRgb(text,.82)};">${md(rev.content || '')}</div>
        </article>`;
      scene.querySelectorAll('a, button').forEach(hookHover);
      if (session) {
        document.getElementById('userAvatar').src = session.picture || '';
        document.getElementById('userAvatar').style.display = session.picture ? '' : 'none';
        document.getElementById('userNameText').textContent = session.name || session.email || '';
        document.getElementById('userBadge').style.display = 'flex';
      }
    }

    async function loadAndShow(session) {
      if (!versionPollStarted) { versionPollStarted = true; }

      const _pgbg = document.getElementById('pg-bg'); if (_pgbg) _pgbg.style.display = 'none';


      let _wantsAdmin = false;
      try { _wantsAdmin = sessionStorage.getItem('foyer_admin_return') === '1' || new URLSearchParams(location.search).get('admin_return') === '1'; } catch {}
      if (session && _wantsAdmin) {
        try { sessionStorage.removeItem('foyer_admin_return'); } catch {}
        location.href = '/admin'; return;
      }
      const slug = window.location.pathname.replace(/\/$/, '') || '/';
      pingAnalytics(slug, session);
      startBanPoll(session);

      loadNav(session);

      if (slug === '/tutorials/all') { setMeta('Tutorials', '', slug); renderCollectionIndex('tutorials', session); return; }
      if (slug === '/reviews/all')   { setMeta('Reviews', '', slug);   renderCollectionIndex('reviews', session);   return; }

      const tutMatch = slug.match(/^\/tutorials\/(.+)$/);
      if (tutMatch) {
        const tut = await protectedFetch(`/api/tutorials/by-slug/${encodeURIComponent(tutMatch[1])}`, session);
        if (tut && tut.id) {
          setMeta(tut.title || 'Tutorial', tut.description || '', slug);
          renderTutorialDetail(tut, session);
          return;
        }

      }

      const revMatch = slug.match(/^\/review\/(.+)$/);
      if (revMatch) {
        const rev = await protectedFetch(`/api/reviews/by-slug/${encodeURIComponent(revMatch[1])}`, session);
        if (rev && rev.id) {
          setMeta(rev.title || 'Review', rev.description || '', slug);
          renderReviewDetail(rev, session);
          return;
        }
      }

      const page = await protectedFetch(`/api/pages?slug=${encodeURIComponent(slug)}`, session);

      if (page?.page_json) {
        try {
          const state = JSON.parse(page.page_json);
          setMeta(state.page_title || page.title || __SITE__.name, state.page_subtitle || '', slug);
          renderCustomPage(state, session);
          return;
        } catch(e) {}
      }

      if (slug === '/') {
        const settings = await fetch('/api/settings').then(r => r.json()).catch(() => ({}));
        setMeta(settings.name || __SITE__.name, settings.tagline || '', '/');
        showFallback(session);
      } else {
        const p404 = await protectedFetch('/api/pages?slug=__404__', session);
        if (p404?.page_json) {
          try {
            const state = JSON.parse(p404.page_json);
            setMeta('404 — Page Not Found', '', slug);
            renderCustomPage(state, session);
            return;
          } catch(e) {}
        }
        setMeta('404 — Not Found', '', slug);
        showFallback(session);
      }
    }

