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
        ? `<button type="button" class="nav-a nav-search" aria-label="Search" title="Search (⌘K)"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg><span>Search</span></button>`
        : '';
      const links = [searchBtn, ...pageLinks, ...extLinks].join('');
      const wrapStyle = vertical
        ? `display:flex;flex-direction:column;gap:1rem;align-items:${j};width:100%;`
        : `flex:1;display:flex;align-items:center;gap:2rem;justify-content:${j};`;
      const titleSpan = nav_title
        ? `<span style="font-family:'Josefin Sans',sans-serif;font-weight:200;font-size:.7rem;letter-spacing:.18em;text-transform:uppercase;color:rgba(var(--site-muted-rgb),0.75);flex-shrink:0;${vertical?'margin-bottom:.5rem;':''}">${nav_title}</span>`
        : '';
      nav.innerHTML = titleSpan + `<div style="${wrapStyle}">${links}</div>`;
      nav.querySelector('.nav-search')?.addEventListener('click', foyerOpenSearch);
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
        ${t.cover_image ? `<img src="${escAttr(t.cover_image)}" alt="" loading="lazy" decoding="async" style="width:100%;height:150px;object-fit:cover;display:block;" />` : `<div style="width:100%;height:150px;background:${pgRgb(accent, .06)};"></div>`}
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
          grid.appendChild(frag);
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
      const hit = _pageCache.get(slug);
      if (hit && Date.now() - hit.t < 60000) return hit.p;
      const p = protectedFetch(`/api/pages?slug=${encodeURIComponent(slug)}`, session);
      _pageCache.set(slug, { t: Date.now(), p });
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
        if (!_pageCache.has(slug)) fetchPage(slug, _session);
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
        <input id="fsq" type="text" placeholder="Search this site…" autocomplete="off" style="width:100%;box-sizing:border-box;padding:1.05rem 1.3rem;background:transparent;border:none;border-bottom:1px solid ${pgRgb(accent, .15)};color:${text};font-family:inherit;font-weight:300;font-size:1.05rem;letter-spacing:.02em;outline:none;" />
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

