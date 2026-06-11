    let _navData = null;
    async function loadNav(session) {


      let data = _navData;
      if (!data) { data = await protectedFetch('/api/nav', session); if (data) _navData = data; }
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

      const hrefOf = slug => slug === '/' ? '/' : (slug.startsWith('/') ? slug : '/' + slug);
      const slugSet = new Set(pages.map(p => p.slug));
      const kidsOf = {};
      pages.forEach(p => { if (p.parent && slugSet.has(p.parent)) (kidsOf[p.parent] = kidsOf[p.parent] || []).push(p); });
      const navLink = p => `<a href="${hrefOf(p.slug)}" class="nav-a${hrefOf(p.slug) === cur ? ' cur' : ''}">${p.title}</a>`;
      const pageLinks = pages.filter(p => !(p.parent && slugSet.has(p.parent))).map(p => {
        const kids = kidsOf[p.slug];
        if (!kids || !kids.length) return navLink(p);
        return `<div class="nav-parent"><a href="${hrefOf(p.slug)}" class="nav-a${hrefOf(p.slug) === cur ? ' cur' : ''}">${p.title} <span class="nav-caret">▾</span></a><div class="nav-flyout">${kids.map(navLink).join('')}</div></div>`;
      });
      const extLinks = custom_links.map(l =>
        `<a href="${escAttr(l.url || '#')}" class="nav-a" target="${l.new_tab !== false ? '_blank' : '_self'}" rel="noopener">${pgE(l.label || '')}</a>`
      );
      window._foyerSearchOn = data.search_enabled !== false;   // admin toggle (default on)
      const searchBtn = window._foyerSearchOn
        ? `<button type="button" class="nav-a nav-search" aria-label="${foyerT('search')}" title="${foyerT('search')} (⌘K)"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg><span>${foyerT('search')}</span></button>`
        : '';

      const _langs = window.__foyerLangs || [];
      const langPicker = _langs.length > 1
        ? `<select class="nav-a nav-lang" aria-label="${foyerT('lang')}" style="background:transparent;border:1px solid ${pgRgb(siteAccent,.25)};color:rgba(var(--site-muted-rgb),0.85);font-family:inherit;font-size:.62rem;letter-spacing:.1em;padding:.25rem .4rem;border-radius:5px;cursor:pointer;">${_langs.map(l => `<option value="${l}" style="color:#000;"${l === (window.foyerLang || _langs[0]) ? ' selected' : ''}>${l.toUpperCase()}</option>`).join('')}</select>`
        : '';
      const links = [searchBtn, ...pageLinks, ...extLinks, langPicker].join('');
      const wrapStyle = vertical
        ? `display:flex;flex-direction:column;gap:1rem;align-items:${j};width:100%;`
        : `flex:1;display:flex;align-items:center;gap:2rem;justify-content:${j};`;
      const titleSpan = nav_title
        ? `<span style="font-family:'Josefin Sans',sans-serif;font-weight:200;font-size:.7rem;letter-spacing:.18em;text-transform:uppercase;color:rgba(var(--site-muted-rgb),0.75);flex-shrink:0;${vertical?'margin-bottom:.5rem;':''}">${nav_title}</span>`
        : '';
      nav.innerHTML = titleSpan + `<div style="${wrapStyle}">${links}</div>`;
      nav.querySelector('.nav-search')?.addEventListener('click', foyerOpenSearch);
      nav.querySelector('.nav-lang')?.addEventListener('change', (e) => {
        const v = e.target.value;
        try { localStorage.setItem('foyer_lang', v); } catch {}
        window.foyerLang = v;
        _pageCache.clear();                 // content differs per language
        if (window._foyerSearchIdx) window._foyerSearchIdx = null;
        navigateTo(location.pathname + location.hash);   // re-render current page in the new language
      });
      nav.className = 'on pos-' + pos;
      const scene = document.getElementById('scene');
      scene.classList.remove('nav-pad-top','nav-pad-bottom','nav-pad-left','nav-pad-right');
      scene.classList.add('nav-pad-' + pos);

      document.body.classList.remove('nav-bottom','nav-left','nav-right');
      if (pos !== 'top') document.body.classList.add('nav-' + pos);
    }

    function syncCursor() {
      const gate = document.getElementById('gate');
      const gateVisible = gate && gate.style.display !== 'none' && gate.style.opacity !== '0';
      const modalOpen = !!document.querySelector('#acct-modal.show, #ml-modal.show');
      const hide = gateVisible || modalOpen;
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

    function setMeta(title, desc, slug, image) {
      const origin = 'https://' + __SITE__.domain;
      const url = origin + (slug === '/' ? '/' : (slug.startsWith('/') ? slug : '/' + slug));
      document.title = title;
      const set = (id, val) => { const el = document.getElementById(id); if (el) el.content = val; };
      const setHref = (id, val) => { const el = document.getElementById(id); if (el) el.href = val; };
      const setAttr = (id, attr, val) => { const el = document.getElementById(id); if (el) el.setAttribute(attr, val); };
      set('og-title', title); set('tw-title', title);
      set('og-desc', desc); set('tw-desc', desc);
      setAttr('og-url', 'content', url); setHref('canonical', url);
      if (image) {
        const abs = /^https?:\/\//.test(image) ? image : origin + (image.startsWith('/') ? '' : '/') + image;
        set('og-image', abs); set('tw-image', abs);
        const tc = document.getElementById('tw-card'); if (tc) tc.content = 'summary_large_image';
      }
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


    function renderTextPage(state, session, pageTitle) {
      dismissLoading();
      const _pgbg = document.getElementById('pg-bg'); if (_pgbg) _pgbg.style.display = 'none';
      const bg = getComputedStyle(document.documentElement).getPropertyValue('--site-bg').trim() || '#020a03';
      const accent = getComputedStyle(document.documentElement).getPropertyValue('--site-accent').trim() || '#4dbd6a';
      const text = getComputedStyle(document.documentElement).getPropertyValue('--site-text').trim() || '#c8e6aa';
      const font = state.font || 'Josefin Sans';
      const scene = document.getElementById('scene');
      scene.style.cssText = 'position:fixed;inset:0;z-index:10;display:block;overflow-y:auto;padding:0;';
      scene.style.background = bg;
      loadNav(session);
      const title = state.page_title || pageTitle || '';
      const cover = state.cover
        ? `<div style="margin:1.8rem 0 2.4rem;border:1px solid ${pgRgb(accent, .12)};border-radius:12px;overflow:hidden;"><img src="${escAttr(state.cover)}" alt="" style="width:100%;max-height:380px;object-fit:cover;display:block;" /></div>`
        : `<div style="height:1px;background:${pgRgb(accent, .12)};margin:1.8rem 0 2.4rem;"></div>`;
      scene.innerHTML = `
        <article style="max-width:720px;margin:0 auto;padding:4rem 1.5rem 6rem;font-family:'${font}',sans-serif;color:${text};">
          <h1 style="font-weight:300;font-size:clamp(1.9rem,5vw,3rem);letter-spacing:-.01em;line-height:1.1;margin:0 0 .6rem;">${pgE(title)}</h1>
          ${state.desc ? `<p style="font-weight:200;font-style:italic;font-size:1.05rem;color:${pgRgb(text, .55)};letter-spacing:.02em;margin:0 0 .4rem;">${pgE(state.desc)}</p>` : ''}
          ${cover}
          <div class="md-content" style="font-weight:200;font-size:1rem;line-height:1.95;color:${pgRgb(text, .85)};">${md(state.body || '')}</div>
        </article>`;
      scene.querySelectorAll('a, button').forEach(hookHover);
      foyerHL(scene);
      if (session) {
        document.getElementById('userAvatar').src = session.picture || '';
        document.getElementById('userAvatar').style.display = session.picture ? '' : 'none';
        document.getElementById('userNameText').textContent = session.name || session.email || '';
        document.getElementById('userBadge').style.display = 'flex';
      }
    }

    let _foyerColls = null;
    async function _foyerCollections(session) {
      if (_foyerColls) return _foyerColls;
      const r = await protectedFetch('/api/collections', session);
      _foyerColls = Array.isArray(r) ? r : [];
      return _foyerColls;
    }
    function _foyerUserBadge(session) {
      if (!session) return;
      document.getElementById('userAvatar').src = session.picture || '';
      document.getElementById('userAvatar').style.display = session.picture ? '' : 'none';
      document.getElementById('userNameText').textContent = session.name || session.email || '';
      document.getElementById('userBadge').style.display = 'flex';
    }
    async function renderCollIndex(coll, session) {
      dismissLoading();
      const _pgbg = document.getElementById('pg-bg'); if (_pgbg) _pgbg.style.display = 'none';
      const bg = getComputedStyle(document.documentElement).getPropertyValue('--site-bg').trim() || '#020a03';
      const accent = getComputedStyle(document.documentElement).getPropertyValue('--site-accent').trim() || '#4dbd6a';
      const text = getComputedStyle(document.documentElement).getPropertyValue('--site-text').trim() || '#c8e6aa';
      const scene = document.getElementById('scene');
      scene.style.cssText = 'position:fixed;inset:0;z-index:10;display:block;overflow-y:auto;padding:0;';
      scene.style.background = bg; loadNav(session);
      let items = [];
      try { const r = await fetch(`/api/collections/${encodeURIComponent(coll.slug)}/items`, { headers: sessionHeaders(session) }); items = await r.json(); } catch (e) {}
      if (!Array.isArray(items)) items = [];
      const base = '/' + coll.slug;
      const card = (t) => `<a href="${escAttr(base + '/' + t.slug)}" style="display:block;text-decoration:none;border:1px solid ${pgRgb(accent, .12)};background:${pgRgb(accent, .03)};border-radius:10px;overflow:hidden;transition:border-color .2s,transform .2s;">
        ${t.cover_image ? `<img data-src="${escAttr(t.cover_image)}" alt="" decoding="async" style="width:100%;height:150px;object-fit:cover;display:block;background:${pgRgb(accent, .06)};" />` : `<div style="width:100%;height:150px;background:${pgRgb(accent, .06)};"></div>`}
        <div style="padding:.9rem 1rem;"><div style="font-weight:300;font-size:.95rem;letter-spacing:.03em;color:${pgRgb(text, .92)};">${pgE(t.title || t.slug)}</div>${t.description ? `<div style="font-size:.72rem;font-weight:200;line-height:1.65;color:${pgRgb(text, .5)};margin-top:.35rem;">${pgE(t.description)}</div>` : ''}</div></a>`;
      scene.innerHTML = `<div style="max-width:920px;margin:0 auto;padding:4rem 1.5rem 6rem;font-family:'Josefin Sans',sans-serif;color:${text};">
        <h1 style="font-weight:200;font-size:clamp(1.8rem,5vw,2.6rem);letter-spacing:.02em;margin-bottom:.4rem;">${pgE(coll.name)}</h1>
        <p style="font-weight:200;font-size:.8rem;color:${pgRgb(text, .45)};margin-bottom:2rem;">${items.length} ${items.length === 1 ? 'entry' : 'entries'}</p>
        ${items.length ? `<div id="_collgrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1.4rem;"></div>` : `<p style="font-weight:200;font-size:.85rem;color:${pgRgb(text, .4)};">Nothing here yet — check back soon.</p>`}
      </div>`;

      const grid = scene.querySelector('#_collgrid');
      if (grid) {
        let _i = 0;
        const draw = () => {
          const frag = document.createDocumentFragment();
          for (let n = 0; n < 4 && _i < items.length; n++, _i++) { const d = document.createElement('div'); d.innerHTML = card(items[_i]); const el2 = d.firstElementChild; if (el2) { hookHover(el2); frag.appendChild(el2); } }
          grid.appendChild(frag); foyerLazyImg(grid);
          if (_i < items.length) requestAnimationFrame(draw); else _foyerUserBadge(session);
        };
        draw();
      } else { _foyerUserBadge(session); }
    }
    function renderCollItem(coll, item, session) {
      dismissLoading();
      const _pgbg = document.getElementById('pg-bg'); if (_pgbg) _pgbg.style.display = 'none';
      const bg = getComputedStyle(document.documentElement).getPropertyValue('--site-bg').trim() || '#020a03';
      const accent = getComputedStyle(document.documentElement).getPropertyValue('--site-accent').trim() || '#4dbd6a';
      const text = getComputedStyle(document.documentElement).getPropertyValue('--site-text').trim() || '#c8e6aa';
      const scene = document.getElementById('scene');
      scene.style.cssText = 'position:fixed;inset:0;z-index:10;display:block;overflow-y:auto;padding:0;';
      scene.style.background = bg; loadNav(session);
      const cover = item.cover_image
        ? `<div style="margin:1.6rem 0 2.4rem;border:1px solid ${pgRgb(accent, .12)};border-radius:12px;overflow:hidden;"><img src="${escAttr(item.cover_image)}" alt="" style="width:100%;max-height:380px;object-fit:cover;display:block;" /></div>`
        : `<div style="height:1px;background:${pgRgb(accent, .12)};margin:1.8rem 0 2.4rem;"></div>`;
      scene.innerHTML = `<article style="max-width:720px;margin:0 auto;padding:4rem 1.5rem 6rem;font-family:'Josefin Sans',sans-serif;color:${text};">
        <a href="/${escAttr(coll.slug)}/all" style="font-size:.6rem;font-weight:200;letter-spacing:.2em;text-transform:uppercase;color:${pgRgb(accent, .6)};text-decoration:none;">← ${pgE(coll.name)}</a>
        <h1 style="font-weight:300;font-size:clamp(1.9rem,5vw,2.9rem);letter-spacing:-.01em;line-height:1.1;margin:1.3rem 0 .6rem;">${pgE(item.title || '')}</h1>
        ${item.description ? `<p style="font-weight:200;font-style:italic;font-size:1.05rem;color:${pgRgb(text, .55)};margin:0 0 .4rem;">${pgE(item.description)}</p>` : ''}
        ${cover}
        <div class="md-content" style="font-weight:200;font-size:1rem;line-height:1.95;color:${pgRgb(text, .85)};">${md(item.content || '')}</div>
      </article>`;
      scene.querySelectorAll('a, button').forEach(hookHover);
      foyerHL(scene); _foyerUserBadge(session);
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




    let _session = null, _routerWired = false;
    const _pageCache = new Map();   // slug → { t, p }  (timestamp + Promise of /api/pages)
    function fetchPage(slug, session) {

      const lang = window.foyerLang || '';
      const key = slug + '|' + lang;
      const hit = _pageCache.get(key);
      if (hit && Date.now() - hit.t < 60000) return hit.p;
      const p = protectedFetch(`/api/pages?slug=${encodeURIComponent(slug)}${lang ? '&lang=' + encodeURIComponent(lang) : ''}`, session);
      _pageCache.set(key, { t: Date.now(), p });
      return p;
    }

    function _routable(url) {
      if (url.origin !== location.origin) return false;
      if (/^\/(api|admin|foyer)(\/|$)/.test(url.pathname)) return false;
      if (/\.[a-z0-9]+$/i.test(url.pathname)) return false;   // an asset/file
      return true;
    }
    async function navigateTo(path) {
      if (path !== location.pathname + location.search + location.hash) history.pushState({}, '', path);
      const scene = document.getElementById('scene');
      if (window._lenis) window._lenis.scrollTo(0, { immediate: true }); else if (scene) scene.scrollTop = 0;
      await loadAndShow(_session);
      if (window._lenisResize) { window._lenisResize(); setTimeout(window._lenisResize, 500); }

      if (scene) { scene.classList.remove('pg-anim-in'); void scene.offsetWidth; scene.classList.add('pg-anim-in'); }
      if (location.hash) { const el = document.getElementById(decodeURIComponent(location.hash.slice(1))); if (el) { if (window._lenis) window._lenis.scrollTo(el); else el.scrollIntoView(); } }
    }
    function wireRouter() {
      if (_routerWired) return; _routerWired = true;
      document.addEventListener('click', (e) => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        const a = e.target.closest && e.target.closest('a[href]');
        if (!a || a.target === '_blank' || a.hasAttribute('download') || a.hasAttribute('data-no-router')) return;
        let url; try { url = new URL(a.href, location.href); } catch { return; }
        if (!_routable(url)) return;
        if (url.hash && url.pathname === location.pathname) return;   // in-page anchor: let the browser jump
        e.preventDefault();
        if (url.pathname === location.pathname && !url.hash) { if (window._lenis) window._lenis.scrollTo(0); else { const sc = document.getElementById('scene'); if (sc) sc.scrollTop = 0; } return; }
        navigateTo(url.pathname + url.search + url.hash);
      });
      window.addEventListener('popstate', () => loadAndShow(_session));

      const prefetch = (e) => {
        const a = e.target.closest && e.target.closest('a[href]');
        if (!a) return;
        let url; try { url = new URL(a.href, location.href); } catch { return; }
        if (!_routable(url) || url.hash) return;
        const slug = url.pathname.replace(/\/$/, '') || '/';
        if (/^\/(tutorials|review|reviews)(\/|$)/.test(slug)) return;   // these load via other endpoints
        fetchPage(slug, _session);   // fetchPage dedups by slug+lang internally
      };
      document.addEventListener('mouseover', prefetch);
      document.addEventListener('touchstart', prefetch, { passive: true });
      document.addEventListener('focusin', prefetch);

      document.addEventListener('keydown', (e) => { if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); foyerOpenSearch(); } });
    }

    async function _foyerLoadFuse() {
      if (window.Fuse) return;
      await new Promise((res, rej) => { const s = document.createElement('script'); s.src = '/deps/fuse.js'; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
    }
    async function _foyerSearchIndex() {
      if (window._foyerSearchIdx) return window._foyerSearchIdx;
      const r = await protectedFetch('/api/search', _session);
      window._foyerSearchIdx = Array.isArray(r) ? r : [];
      return window._foyerSearchIdx;
    }
    function _foyerSnippet(txt, term) {
      if (!txt) return '';
      const i = txt.toLowerCase().indexOf(term.toLowerCase());
      const start = i < 0 ? 0 : Math.max(0, i - 30);
      let s = txt.slice(start, start + 120);
      if (start > 0) s = '…' + s;
      if (start + 120 < txt.length) s += '…';
      return pgE(s);
    }
    function foyerOpenSearch() {
      if (window._foyerSearchOn === false) return;   // disabled in admin
      if (document.getElementById('foyer-search')) return;
      const cs = getComputedStyle(document.documentElement);
      const accent = cs.getPropertyValue('--site-accent').trim() || '#4dbd6a';
      const bg = cs.getPropertyValue('--site-bg').trim() || '#020a03';
      const text = cs.getPropertyValue('--site-text').trim() || '#c8e6aa';
      const hrefOf = s => s === '/' ? '/' : (s.startsWith('/') ? s : '/' + s);
      const ov = document.createElement('div'); ov.id = 'foyer-search';
      ov.style.cssText = 'position:fixed;inset:0;z-index:9995;background:rgba(0,0,0,.5);backdrop-filter:blur(5px);display:flex;align-items:flex-start;justify-content:center;padding:14vh 1rem 1rem;';
      ov.innerHTML = `<div style="width:100%;max-width:540px;background:${bg};border:1px solid ${pgRgb(accent, .25)};border-radius:14px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.5);font-family:'Josefin Sans',sans-serif;">
        <input id="fsq" type="text" placeholder="${foyerT('search_ph')}" autocomplete="off" style="width:100%;box-sizing:border-box;padding:1.05rem 1.3rem;background:transparent;border:none;border-bottom:1px solid ${pgRgb(accent, .15)};color:${text};font-family:inherit;font-weight:300;font-size:1.05rem;letter-spacing:.02em;outline:none;" />
        <div id="fsr" style="max-height:52vh;overflow-y:auto;"></div>
      </div>`;
      const close = () => { ov.remove(); document.removeEventListener('keydown', onKey); };
      const onKey = (e) => { if (e.key === 'Escape') close(); };
      ov.addEventListener('click', (e) => { if (e.target === ov) close(); });
      document.addEventListener('keydown', onKey);
      document.body.appendChild(ov);
      const q = ov.querySelector('#fsq'), res = ov.querySelector('#fsr');
      setTimeout(() => q.focus(), 30);
      let fuse = null, t;
      const ensure = async () => { if (fuse) return fuse; await _foyerLoadFuse(); fuse = new window.Fuse(await _foyerSearchIndex(), { keys: [{ name: 't', weight: 2 }, { name: 'x', weight: 1 }], threshold: 0.4, ignoreLocation: true, minMatchCharLength: 2 }); return fuse; };
      const run = async () => {
        const term = q.value.trim();
        if (term.length < 2) { res.innerHTML = ''; return; }
        let f; try { f = await ensure(); } catch { res.innerHTML = `<div style="padding:1.1rem 1.3rem;color:${pgRgb(text, .5)};font-weight:200;font-size:.85rem;">Search is unavailable.</div>`; return; }
        if (q.value.trim() !== term) return;   // a newer keystroke superseded this
        const hits = f.search(term).slice(0, 8);
        res.innerHTML = hits.length
          ? hits.map(h => `<a href="${escAttr(hrefOf(h.item.s))}" data-fs style="display:block;padding:.75rem 1.3rem;border-bottom:1px solid ${pgRgb(accent, .08)};text-decoration:none;color:${text};"><div style="font-weight:300;font-size:.95rem;">${pgE(h.item.t || h.item.s)}</div><div style="font-size:.74rem;font-weight:200;color:${pgRgb(text, .5)};margin-top:.2rem;line-height:1.5;">${_foyerSnippet(h.item.x, term)}</div></a>`).join('')
          : `<div style="padding:1.1rem 1.3rem;color:${pgRgb(text, .5)};font-weight:200;font-size:.88rem;">No results for &ldquo;${pgE(term)}&rdquo;.</div>`;
      };
      q.addEventListener('input', () => { clearTimeout(t); t = setTimeout(run, 120); });
      q.addEventListener('keydown', (e) => { if (e.key === 'Enter') { const a = res.querySelector('a[data-fs]'); if (a) a.click(); } });
      res.addEventListener('click', (e) => { if (e.target.closest('a[data-fs]')) close(); });   // the router handles the navigation
    }



    function mountAskWidget(settings, session) {
      if (window.__askMounted) return;
      if (!settings || settings.ask_enabled !== '1') return;
      window.__askMounted = true;
      const corner = ['br', 'bl', 'tr', 'tl'].includes(settings.ask_corner) ? settings.ask_corner : 'br';
      const cs = getComputedStyle(document.documentElement);
      const accent = cs.getPropertyValue('--site-accent').trim() || '#4dbd6a';
      const bg = cs.getPropertyValue('--site-bg').trim() || '#020a03';
      const text = cs.getPropertyValue('--site-text').trim() || '#c8e6aa';
      const siteName = (settings.name || (window.__SITE__ && __SITE__.name) || 'this site');

      const circle = (settings.ask_color && /^#?[0-9a-fA-F]{3,8}$/.test(settings.ask_color.replace(/^#/, '')) ? (settings.ask_color[0] === '#' ? settings.ask_color : '#' + settings.ask_color) : accent);

      const vert = corner[0] === 't' ? 'top:20px;' : 'bottom:60px;';
      const horz = corner[1] === 'l' ? 'left:20px;' : 'right:20px;';
      const panelVert = corner[0] === 't' ? 'top:88px;' : 'bottom:128px;';

      const root = document.createElement('div');
      root.id = 'foyer-ask';
      root.style.cssText = `position:fixed;${vert}${horz}z-index:9990;font-family:'Josefin Sans',sans-serif;`;
      root.innerHTML = `
        <button id="askBubble" aria-label="Ask this site" style="width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;background:${circle};box-shadow:0 8px 24px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;padding:0;transition:transform .18s;">
          <img src="/icons/favicon.svg" alt="" style="width:30px;height:30px;border-radius:6px;pointer-events:none;" onerror="this.style.display='none';this.nextElementSibling.style.display='block';" />
          <svg style="display:none;width:26px;height:26px;" viewBox="0 0 24 24" fill="none" stroke="${bg}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z"/></svg>
        </button>
        <div id="askPanel" style="display:none;position:absolute;${panelVert}${corner[1] === 'l' ? 'left:0;' : 'right:0;'}width:min(360px,calc(100vw - 40px));height:min(520px,70vh);background:${bg};border:1px solid ${pgRgb(accent, .25)};border-radius:16px;box-shadow:0 24px 60px rgba(0,0,0,.5);overflow:hidden;flex-direction:column;">
          <div style="padding:.9rem 1.1rem;border-bottom:1px solid ${pgRgb(accent, .14)};display:flex;align-items:center;justify-content:space-between;">
            <div style="font-weight:300;font-size:.92rem;letter-spacing:.02em;color:${text};">Ask ${pgE(siteName)}</div>
            <button id="askClose" aria-label="Close" style="background:none;border:none;color:${pgRgb(text, .55)};font-size:1.2rem;cursor:pointer;line-height:1;padding:0;">×</button>
          </div>
          <div id="askMsgs" style="flex:1;overflow-y:auto;padding:1rem 1.1rem;display:flex;flex-direction:column;gap:.7rem;"></div>
          <form id="askForm" style="display:flex;gap:.5rem;padding:.8rem;border-top:1px solid ${pgRgb(accent, .14)};">
            <input id="askInput" type="text" placeholder="${foyerT('ask_ph')}" autocomplete="off" style="flex:1;box-sizing:border-box;padding:.7rem .9rem;background:${pgRgb(accent, .05)};border:1px solid ${pgRgb(accent, .18)};border-radius:10px;color:${text};font-family:inherit;font-weight:300;font-size:.88rem;outline:none;" />
            <button type="submit" aria-label="Send" style="flex-shrink:0;width:42px;border:none;border-radius:10px;background:${accent};color:${bg};font-size:1.1rem;cursor:pointer;">↑</button>
          </form>
        </div>`;
      document.body.appendChild(root);

      const bubble = root.querySelector('#askBubble');
      const panel = root.querySelector('#askPanel');
      const msgs = root.querySelector('#askMsgs');
      const input = root.querySelector('#askInput');
      const history = [];
      let busy = false, greeted = false;

      const addMsg = (role, content) => {
        const me = role === 'user';
        const b = document.createElement('div');
        b.style.cssText = `max-width:85%;align-self:${me ? 'flex-end' : 'flex-start'};padding:.6rem .85rem;border-radius:14px;font-weight:300;font-size:.85rem;line-height:1.55;${me ? `background:${accent};color:${bg};border-bottom-right-radius:4px;` : `background:${pgRgb(accent, .07)};color:${pgRgb(text, .92)};border-bottom-left-radius:4px;`}`;
        b.textContent = content;
        msgs.appendChild(b); msgs.scrollTop = msgs.scrollHeight;
        return b;
      };
      const toggle = (open) => {
        panel.style.display = open ? 'flex' : 'none';
        bubble.style.transform = open ? 'scale(.9)' : '';
        if (open) {
          if (!greeted) { greeted = true; addMsg('assistant', foyerT('ask_hi')); }
          setTimeout(() => input.focus(), 50);
        }
      };
      bubble.addEventListener('click', () => toggle(panel.style.display === 'none'));
      root.querySelector('#askClose').addEventListener('click', () => toggle(false));
      root.querySelector('#askForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const q = input.value.trim();
        if (!q || busy) return;
        input.value = ''; busy = true;
        addMsg('user', q); history.push({ role: 'user', content: q });
        const typing = addMsg('assistant', '…');
        try {
          const r = await fetch('/api/ai/ask', { method: 'POST', headers: { ...sessionHeaders(session), 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history.slice(-8) }) });
          const d = await r.json().catch(() => ({}));
          const reply = r.ok ? (d.reply || 'Sorry — I’m not sure about that.') : (d.error || 'Something went wrong — try again.');
          typing.textContent = reply;
          if (r.ok && d.reply) history.push({ role: 'assistant', content: d.reply });
        } catch { typing.textContent = 'Network error — please try again.'; }
        busy = false; msgs.scrollTop = msgs.scrollHeight;
      });
    }

    function renderLockedPage(slug, page, session, bad) {
      dismissLoading();
      const _pgbg = document.getElementById('pg-bg'); if (_pgbg) _pgbg.style.display = 'none';
      const bg = getComputedStyle(document.documentElement).getPropertyValue('--site-bg').trim() || '#020a03';
      const accent = getComputedStyle(document.documentElement).getPropertyValue('--site-accent').trim() || '#4dbd6a';
      const text = getComputedStyle(document.documentElement).getPropertyValue('--site-text').trim() || '#c8e6aa';
      const scene = document.getElementById('scene');
      scene.style.cssText = 'position:fixed;inset:0;z-index:10;display:flex;align-items:center;justify-content:center;padding:1.5rem;';
      scene.style.background = bg;
      loadNav(session);
      scene.innerHTML = `<div style="width:100%;max-width:360px;text-align:center;font-family:'Josefin Sans',sans-serif;color:${text};">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="${accent}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:1.2rem;opacity:.8;"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <h1 style="font-weight:300;font-size:1.5rem;letter-spacing:.01em;margin:0 0 .4rem;">${pgE(page.title || 'Protected page')}</h1>
        <p style="font-weight:200;font-size:.82rem;color:${pgRgb(text, .5)};margin:0 0 1.6rem;">${foyerT('pw_protected')}</p>
        <form id="pwform" style="display:flex;flex-direction:column;gap:.7rem;">
          <input id="pwin" type="password" placeholder="${foyerT('pw_ph')}" autocomplete="current-password" style="box-sizing:border-box;padding:.85rem 1rem;background:${pgRgb(accent, .04)};border:1px solid ${pgRgb(accent, bad ? .55 : .2)};border-radius:10px;color:${text};font-family:inherit;font-weight:300;font-size:.95rem;outline:none;text-align:center;letter-spacing:.04em;" />
          ${bad ? `<div style="font-size:.72rem;font-weight:200;color:#e88;">${foyerT('pw_wrong')}</div>` : ''}
          <button type="submit" style="padding:.8rem;background:${accent};color:${bg};border:none;border-radius:10px;font-family:inherit;font-weight:400;font-size:.7rem;letter-spacing:.16em;text-transform:uppercase;cursor:pointer;">${foyerT('pw_unlock')}</button>
        </form>
      </div>`;
      scene.querySelectorAll('a, button, input').forEach(hookHover);
      _foyerUserBadge(session);
      const inp = scene.querySelector('#pwin'); setTimeout(() => inp && inp.focus(), 40);
      scene.querySelector('#pwform').addEventListener('submit', async (e) => {
        e.preventDefault();
        const pw = inp.value;
        if (!pw) return;
        const headers = { ...sessionHeaders(session), 'X-Page-Password': pw };
        let data = null;
        try { const r = await fetch(`/api/pages?slug=${encodeURIComponent(slug)}`, { headers }); data = await r.json(); } catch (err) {}
        if (!data || data.locked) { renderLockedPage(slug, page, session, true); return; }

        _pageCache.set(slug + '|' + (window.foyerLang || ''), { t: Date.now(), p: Promise.resolve(data) });
        if (data.page_json) {
          try {
            const state = JSON.parse(data.page_json);
            if (state.kind === 'text') { setMeta(state.page_title || data.title || __SITE__.name, state.desc || '', slug, state.cover); renderTextPage(state, session, data.title); return; }
            setMeta(state.page_title || data.title || __SITE__.name, state.page_subtitle || '', slug, state.page_image); renderCustomPage(state, session); return;
          } catch (err) {}
        }
        showFallback(session);
      });
    }

    async function loadAndShow(session) {
      _session = session; wireRouter(); initLiveSettings();
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

      {
        const parts = slug.replace(/^\//, '').split('/');
        const coll = (await _foyerCollections(session)).find(c => c.slug === parts[0]);
        if (coll) {
          const sub = parts.slice(1).join('/');
          if (!sub || sub === 'all') { setMeta(coll.name, '', slug); renderCollIndex(coll, session); return; }
          const item = await protectedFetch(`/api/collections/${encodeURIComponent(coll.slug)}/items/by-slug/${encodeURIComponent(sub)}`, session);
          if (item && item.id) { setMeta(item.title || coll.name, item.description || '', slug, item.cover_image); renderCollItem(coll, item, session); return; }

        }
      }

      const page = await fetchPage(slug, session);

      if (page?.locked) {
        setMeta(page.title || 'Protected', '', slug);
        renderLockedPage(slug, page, session);
        return;
      }

      if (page?.page_json) {
        try {
          const state = JSON.parse(page.page_json);
          if (state.kind === 'text') {
            setMeta(state.page_title || page.title || __SITE__.name, state.page_subtitle || state.desc || '', slug, state.page_image || state.cover);
            renderTextPage(state, session, page.title);
            return;
          }
          setMeta(state.page_title || page.title || __SITE__.name, state.page_subtitle || '', slug, state.page_image);
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

