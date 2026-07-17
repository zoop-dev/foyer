import { foyerHL } from "../blocks/render.js";
import { dismissLoading, escAttr, hookHover, md, pgE, pgRgb, showFallback, t } from "./10-core.js";
import { foyerLazyImg, initLiveSettings, renderCustomPage } from "./20-render.js";
import {
  _rateLimited,
  check429,
  protectedFetch,
  sessionHeaders,
  showBannedScreen
} from "./30-net.js";
let _navData = null;
export async function loadNav(session) {
  let data = _navData;
  if (!data) {
    data = await protectedFetch("/api/nav", session);
    if (data) _navData = data;
  }
  if (!data) return;
  const {
    pages = [],
    custom_links = [],
    nav_title = "",
    nav_style = "blurred",
    nav_align = "left",
    nav_position = "top"
  } = data;
  if (!pages.length && !custom_links.length && !nav_title) return;
  const nav = document.getElementById("site-nav");
  const cur = window.location.pathname.replace(/\/$/, "") || "/";
  let navPref = "";
  try {
    navPref = localStorage.getItem("foyer_nav_pref") || "";
  } catch {
  }
  const pos = ["top", "bottom", "left", "right"].includes(navPref) ? navPref : ["top", "bottom", "left", "right"].includes(nav_position) ? nav_position : "top";
  const vertical = pos === "left" || pos === "right";
  const siteBg = getComputedStyle(document.documentElement).getPropertyValue("--site-bg").trim() || "#020a03";
  const siteAccent = getComputedStyle(document.documentElement).getPropertyValue("--site-accent").trim() || "#4dbd6a";
  const bSide = pos === "bottom" ? "border-top" : pos === "left" ? "border-right" : pos === "right" ? "border-left" : "border-bottom";
  const styleMap = {
    blurred: `background:${siteBg}dd;backdrop-filter:blur(10px);${bSide}:1px solid ${siteAccent}18;`,
    solid: `background:${siteBg};${bSide}:1px solid ${siteAccent}20;`,
    transparent: "background:transparent;"
  };
  nav.style.cssText = styleMap[nav_style] || styleMap.blurred;
  const alignMap = { left: "flex-start", center: "center", right: "flex-end" };
  const j = alignMap[nav_align] || "flex-start";
  const hrefOf = (slug) => slug === "/" ? "/" : slug.startsWith("/") ? slug : "/" + slug;
  const slugSet = new Set(pages.map((p) => p.slug));
  const kidsOf = {};
  pages.forEach((p) => {
    if (p.parent && slugSet.has(p.parent)) (kidsOf[p.parent] = kidsOf[p.parent] || []).push(p);
  });
  const navLink = (p) => `<a href="${hrefOf(p.slug)}" class="nav-a${hrefOf(p.slug) === cur ? " cur" : ""}">${p.title}</a>`;
  const pageLinks = pages.filter((p) => !(p.parent && slugSet.has(p.parent))).map((p) => {
    const kids = kidsOf[p.slug];
    if (!kids || !kids.length) return navLink(p);
    return `<div class="nav-parent"><a href="${hrefOf(p.slug)}" class="nav-a${hrefOf(p.slug) === cur ? " cur" : ""}">${p.title} <span class="nav-caret">▾</span></a><div class="nav-flyout">${kids.map(navLink).join("")}</div></div>`;
  });
  const extLinks = custom_links.map(
    (l) => `<a href="${escAttr(l.url || "#")}" class="nav-a" target="${l.new_tab !== false ? "_blank" : "_self"}" rel="noopener">${pgE(l.label || "")}</a>`
  );
  window._foyerSearchOn = data.search_enabled !== false;
  const searchBtn = window._foyerSearchOn ? `<button type="button" class="nav-a nav-search" aria-label="${t("search")}" title="${t("search")} (⌘K)"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg><span>${t("search")}</span></button>` : "";
  const _langs = window.__foyerLangs || [];
  const _lname = (c) => {
    try {
      const n = new Intl.DisplayNames([c], { type: "language" }).of(c);
      return n ? n.charAt(0).toUpperCase() + n.slice(1) : c.toUpperCase();
    } catch {
      return c.toUpperCase();
    }
  };
  const langPicker = _langs.length > 1 ? `<span class="nav-lang-wrap" style="position:relative;display:inline-flex;align-items:center;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(var(--site-muted-rgb),0.7)" stroke-width="1.9" stroke-linecap="round" style="position:absolute;left:.52rem;pointer-events:none;"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></svg><select class="nav-a nav-lang" aria-label="${t("lang")}" style="appearance:none;-webkit-appearance:none;-moz-appearance:none;background:${siteBg}88;border:1px solid ${pgRgb(siteAccent, 0.22)};color:rgba(var(--site-muted-rgb),0.92);font-family:inherit;font-weight:300;font-size:.66rem;letter-spacing:.03em;padding:.34rem 1.5rem .34rem 1.65rem;border-radius:7px;cursor:pointer;outline:none;transition:border-color .2s;">` + _langs.map(
    (l) => `<option value="${l}" style="color:#111;background:#fff;"${l === (window.foyerLang || _langs[0]) ? " selected" : ""}>${_lname(l)}</option>`
  ).join("") + `</select><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="rgba(var(--site-muted-rgb),0.6)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="position:absolute;right:.5rem;pointer-events:none;"><path d="M6 9l6 6 6-6"/></svg></span>` : "";
  const pushBell = `<button type="button" class="nav-a nav-bell" aria-label="Notifications" title="Get notified of updates" style="display:none;align-items:center;background:none;border:none;color:inherit;cursor:pointer;padding:0;font:inherit;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></button>`;
  const links = [searchBtn, ...pageLinks, ...extLinks, pushBell, langPicker].join("");
  const wrapStyle = vertical ? `display:flex;flex-direction:column;gap:1rem;align-items:${j};width:100%;` : `flex:1;display:flex;align-items:center;gap:2rem;justify-content:${j};`;
  const titleSpan = nav_title ? `<span style="font-family:'Josefin Sans',sans-serif;font-weight:200;font-size:.7rem;letter-spacing:.18em;text-transform:uppercase;color:rgba(var(--site-muted-rgb),0.75);flex-shrink:0;${vertical ? "margin-bottom:.5rem;" : ""}">${nav_title}</span>` : "";
  nav.innerHTML = titleSpan + `<div style="${wrapStyle}">${links}</div>`;
  nav.querySelector(".nav-search")?.addEventListener("click", foyerOpenSearch);
  const _bell = nav.querySelector(".nav-bell");
  if (_bell) {
    const _paint = (st, enabled) => {
      _bell.style.display = enabled && st === "off" ? "inline-flex" : "none";
    };
    Promise.all([window.foyerPushConfig(), window.foyerPushState()]).then(
      ([cfg, st]) => _paint(st, cfg && cfg.enabled)
    );
    _bell.addEventListener("click", async () => {
      _bell.disabled = true;
      const st = await window.foyerPushToggle();
      _bell.disabled = false;
      const cfg = await window.foyerPushConfig();
      _paint(st, cfg && cfg.enabled);
    });
  }
  nav.querySelector(".nav-lang")?.addEventListener("change", async (e) => {
    const v = e.target.value;
    try {
      localStorage.setItem("foyer_lang", v);
    } catch {
    }
    window.foyerLang = v;
    _pageCache.clear();
    if (window._foyerSearchIdx) window._foyerSearchIdx = null;
    try {
      await window.foyerLoadI18n(v);
    } catch {
    }
    navigateTo(location.pathname + location.hash);
  });
  nav.className = "on pos-" + pos;
  const scene = document.getElementById("scene");
  scene.classList.remove("nav-pad-top", "nav-pad-bottom", "nav-pad-left", "nav-pad-right");
  scene.classList.add("nav-pad-" + pos);
  document.body.classList.remove("nav-bottom", "nav-left", "nav-right");
  if (pos !== "top") document.body.classList.add("nav-" + pos);
}
let versionPollStarted = false;
let banPollStarted = false;
function startBanPoll(session) {
  if (banPollStarted || !session?.session_token) return;
  banPollStarted = true;
  setInterval(async () => {
    if (_rateLimited) return;
    const r = await fetch("/api/me", { headers: sessionHeaders(session) }).catch(() => null);
    if (!r) return;
    if (check429(r)) return;
    if (r.status === 403) {
      const d = await r.json().catch(() => ({}));
      if (d?.banned) showBannedScreen();
    } else if (r.ok) {
      const bs = document.getElementById("banned-screen");
      if (bs) {
        bs.style.opacity = "0";
        bs.style.transition = "opacity .5s";
        setTimeout(() => {
          bs.remove();
          loadAndShow(session);
        }, 520);
      }
    }
  }, 2e4);
}
function setMeta(title, desc, slug, image) {
  const origin = "https://" + __SITE__.domain;
  const url = origin + (slug === "/" ? "/" : slug.startsWith("/") ? slug : "/" + slug);
  document.title = title;
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.content = val;
  };
  const setHref = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.href = val;
  };
  const setAttr = (id, attr, val) => {
    const el = document.getElementById(id);
    if (el) el.setAttribute(attr, val);
  };
  set("og-title", title);
  set("tw-title", title);
  set("og-desc", desc);
  set("tw-desc", desc);
  setAttr("og-url", "content", url);
  setHref("canonical", url);
  if (image) {
    const abs = /^https?:\/\//.test(image) ? image : origin + (image.startsWith("/") ? "" : "/") + image;
    set("og-image", abs);
    set("tw-image", abs);
    const tc = document.getElementById("tw-card");
    if (tc) tc.content = "summary_large_image";
  }
  document.querySelector('meta[name="description"]').content = desc || title;
  const ldEl = document.getElementById("ld-json");
  if (ldEl)
    ldEl.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Person",
      name: title,
      url,
      creator: { "@type": "Organization", name: "zo0p.dev", url: "https://zo0p.dev" }
    });
}
function pingAnalytics(path, session) {
  if (_rateLimited) return;
  fetch("/api/analytics/ping", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session: session?.session_token || "",
      path,
      referrer: document.referrer || "",
      screen: `${screen.width}x${screen.height}`,
      lang: navigator.language || ""
    })
  }).catch(() => {
  });
}
async function renderCollectionIndex(kind, session) {
  dismissLoading();
  const isRev = kind === "reviews";
  const bg = getComputedStyle(document.documentElement).getPropertyValue("--site-bg").trim() || "#020a03";
  const accent = getComputedStyle(document.documentElement).getPropertyValue("--site-accent").trim() || "#4dbd6a";
  const text = getComputedStyle(document.documentElement).getPropertyValue("--site-text").trim() || "#c8e6aa";
  const scene = document.getElementById("scene");
  scene.style.cssText = "position:fixed;inset:0;z-index:10;display:block;overflow-y:auto;padding:44px 0 0;";
  scene.style.background = bg;
  loadNav(session);
  let items = [];
  try {
    const r = await fetch("/api/" + kind, { headers: sessionHeaders(session) });
    items = await r.json();
  } catch (e) {
  }
  if (!Array.isArray(items)) items = [];
  items = await foyerMaybeTr(items, "/" + kind + "/all");
  const starStr = (n) => {
    n = Math.max(0, Math.min(5, parseInt(n) || 0));
    return n ? "★".repeat(n) : "";
  };
  const cards = items.map(
    (t2) => `<a href="/${isRev ? "review" : "tutorials"}/${escAttr(t2.slug)}" style="display:block;text-decoration:none;border:1px solid ${pgRgb(accent, 0.12)};background:${pgRgb(accent, 0.03)};transition:border-color .2s,transform .2s;">
        ${t2.cover_image ? `<img src="${escAttr(t2.cover_image)}" style="width:100%;height:150px;object-fit:cover;display:block;" />` : `<div style="width:100%;height:150px;background:${pgRgb(accent, 0.06)};"></div>`}
        <div style="padding:.9rem 1rem;">
          ${isRev && t2.rating ? `<div style="color:${accent};font-size:.82rem;letter-spacing:.1em;margin-bottom:.3rem;">${starStr(t2.rating)}</div>` : ""}
          <div style="font-weight:300;font-size:.95rem;letter-spacing:.03em;color:${pgRgb(text, 0.92)};">${pgE(t2.title)}</div>
          ${t2.description ? `<div style="font-size:.72rem;font-weight:200;line-height:1.65;color:${pgRgb(text, 0.5)};margin-top:.35rem;">${pgE(t2.description)}</div>` : ""}
        </div>
      </a>`
  ).join("");
  scene.innerHTML = `
        <div style="max-width:920px;margin:0 auto;padding:2.5rem 1.5rem 6rem;font-family:'Josefin Sans',sans-serif;color:${text};">
          <h1 style="font-weight:200;font-size:clamp(1.8rem,5vw,2.6rem);letter-spacing:.02em;margin-bottom:.4rem;">${isRev ? "Reviews" : "Tutorials"}</h1>
          <p style="font-weight:200;font-size:.8rem;color:${pgRgb(text, 0.45)};margin-bottom:2rem;">${items.length} ${items.length === 1 ? isRev ? "review" : "tutorial" : isRev ? "reviews" : "tutorials"}</p>
          ${items.length ? `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1.4rem;">${cards}</div>` : `<p style="font-weight:200;font-size:.85rem;color:${pgRgb(text, 0.4)};">Nothing here yet — check back soon.</p>`}
        </div>`;
  scene.querySelectorAll("a, button").forEach(hookHover);
  if (session) {
    document.getElementById("userAvatar").src = session.picture || "";
    document.getElementById("userAvatar").style.display = session.picture ? "" : "none";
    document.getElementById("userNameText").textContent = session.name || session.email || "";
    document.getElementById("userBadge").style.display = "flex";
  }
}
function renderTextPage(state, session, pageTitle) {
  dismissLoading();
  const _pgbg = document.getElementById("pg-bg");
  if (_pgbg) _pgbg.style.display = "none";
  const bg = getComputedStyle(document.documentElement).getPropertyValue("--site-bg").trim() || "#020a03";
  const accent = getComputedStyle(document.documentElement).getPropertyValue("--site-accent").trim() || "#4dbd6a";
  const text = getComputedStyle(document.documentElement).getPropertyValue("--site-text").trim() || "#c8e6aa";
  const font = state.font || "Josefin Sans";
  const scene = document.getElementById("scene");
  scene.style.cssText = "position:fixed;inset:0;z-index:10;display:block;overflow-y:auto;padding:0;";
  scene.style.background = bg;
  loadNav(session);
  const title = state.page_title || pageTitle || "";
  const cover = state.cover ? `<div style="margin:1.8rem 0 2.4rem;border:1px solid ${pgRgb(accent, 0.12)};border-radius:12px;overflow:hidden;"><img src="${escAttr(state.cover)}" alt="" style="width:100%;max-height:380px;object-fit:cover;display:block;" /></div>` : `<div style="height:1px;background:${pgRgb(accent, 0.12)};margin:1.8rem 0 2.4rem;"></div>`;
  scene.innerHTML = `
        <article style="max-width:720px;margin:0 auto;padding:4rem 1.5rem 6rem;font-family:'${font}',sans-serif;color:${text};">
          <h1 style="font-weight:300;font-size:clamp(1.9rem,5vw,3rem);letter-spacing:-.01em;line-height:1.1;margin:0 0 .6rem;">${pgE(title)}</h1>
          ${state.desc ? `<p style="font-weight:200;font-style:italic;font-size:1.05rem;color:${pgRgb(text, 0.55)};letter-spacing:.02em;margin:0 0 .4rem;">${pgE(state.desc)}</p>` : ""}
          ${cover}
          <div class="md-content" style="font-weight:200;font-size:1rem;line-height:1.95;color:${pgRgb(text, 0.85)};">${md(state.body || "")}</div>
        </article>`;
  scene.querySelectorAll("a, button").forEach(hookHover);
  foyerHL(scene);
  if (session) {
    document.getElementById("userAvatar").src = session.picture || "";
    document.getElementById("userAvatar").style.display = session.picture ? "" : "none";
    document.getElementById("userNameText").textContent = session.name || session.email || "";
    document.getElementById("userBadge").style.display = "flex";
  }
}
let _foyerColls = null;
async function _foyerCollections(session) {
  if (_foyerColls) return _foyerColls;
  const r = await protectedFetch("/api/collections", session);
  _foyerColls = Array.isArray(r) ? r : [];
  return _foyerColls;
}
function _foyerUserBadge(session) {
  if (!session) return;
  document.getElementById("userAvatar").src = session.picture || "";
  document.getElementById("userAvatar").style.display = session.picture ? "" : "none";
  document.getElementById("userNameText").textContent = session.name || session.email || "";
  document.getElementById("userBadge").style.display = "flex";
}
async function renderCollIndex(coll, session) {
  dismissLoading();
  const _pgbg = document.getElementById("pg-bg");
  if (_pgbg) _pgbg.style.display = "none";
  const bg = getComputedStyle(document.documentElement).getPropertyValue("--site-bg").trim() || "#020a03";
  const accent = getComputedStyle(document.documentElement).getPropertyValue("--site-accent").trim() || "#4dbd6a";
  const text = getComputedStyle(document.documentElement).getPropertyValue("--site-text").trim() || "#c8e6aa";
  const scene = document.getElementById("scene");
  scene.style.cssText = "position:fixed;inset:0;z-index:10;display:block;overflow-y:auto;padding:0;";
  scene.style.background = bg;
  loadNav(session);
  let items = [];
  try {
    const r = await fetch(`/api/collections/${encodeURIComponent(coll.slug)}/items`, {
      headers: sessionHeaders(session)
    });
    items = await r.json();
  } catch (e) {
  }
  if (!Array.isArray(items)) items = [];
  items = await foyerMaybeTr(items, "/" + coll.slug + "/all");
  const base = "/" + coll.slug;
  const card = (t2) => `<a href="${escAttr(base + "/" + t2.slug)}" style="display:block;text-decoration:none;border:1px solid ${pgRgb(accent, 0.12)};background:${pgRgb(accent, 0.03)};border-radius:10px;overflow:hidden;transition:border-color .2s,transform .2s;">
        ${t2.cover_image ? `<img data-src="${escAttr(t2.cover_image)}" alt="" decoding="async" style="width:100%;height:150px;object-fit:cover;display:block;background:${pgRgb(accent, 0.06)};" />` : `<div style="width:100%;height:150px;background:${pgRgb(accent, 0.06)};"></div>`}
        <div style="padding:.9rem 1rem;"><div style="font-weight:300;font-size:.95rem;letter-spacing:.03em;color:${pgRgb(text, 0.92)};">${pgE(t2.title || t2.slug)}</div>${t2.description ? `<div style="font-size:.72rem;font-weight:200;line-height:1.65;color:${pgRgb(text, 0.5)};margin-top:.35rem;">${pgE(t2.description)}</div>` : ""}</div></a>`;
  scene.innerHTML = `<div style="max-width:920px;margin:0 auto;padding:4rem 1.5rem 6rem;font-family:'Josefin Sans',sans-serif;color:${text};">
        <h1 style="font-weight:200;font-size:clamp(1.8rem,5vw,2.6rem);letter-spacing:.02em;margin-bottom:.4rem;">${pgE(coll.name)}</h1>
        <p style="font-weight:200;font-size:.8rem;color:${pgRgb(text, 0.45)};margin-bottom:2rem;">${items.length} ${items.length === 1 ? "entry" : "entries"}</p>
        ${items.length ? `<div id="_collgrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1.4rem;"></div>` : `<p style="font-weight:200;font-size:.85rem;color:${pgRgb(text, 0.4)};">Nothing here yet — check back soon.</p>`}
      </div>`;
  const grid = scene.querySelector("#_collgrid");
  if (grid) {
    let _i = 0;
    const draw = () => {
      const frag = document.createDocumentFragment();
      for (let n = 0; n < 4 && _i < items.length; n++, _i++) {
        const d = document.createElement("div");
        d.innerHTML = card(items[_i]);
        const el2 = d.firstElementChild;
        if (el2) {
          hookHover(el2);
          frag.appendChild(el2);
        }
      }
      grid.appendChild(frag);
      foyerLazyImg(grid);
      if (_i < items.length) requestAnimationFrame(draw);
      else _foyerUserBadge(session);
    };
    draw();
  } else {
    _foyerUserBadge(session);
  }
}
function renderCollItem(coll, item, session) {
  dismissLoading();
  const _pgbg = document.getElementById("pg-bg");
  if (_pgbg) _pgbg.style.display = "none";
  const bg = getComputedStyle(document.documentElement).getPropertyValue("--site-bg").trim() || "#020a03";
  const accent = getComputedStyle(document.documentElement).getPropertyValue("--site-accent").trim() || "#4dbd6a";
  const text = getComputedStyle(document.documentElement).getPropertyValue("--site-text").trim() || "#c8e6aa";
  const scene = document.getElementById("scene");
  scene.style.cssText = "position:fixed;inset:0;z-index:10;display:block;overflow-y:auto;padding:0;";
  scene.style.background = bg;
  loadNav(session);
  const cover = item.cover_image ? `<div style="margin:1.6rem 0 2.4rem;border:1px solid ${pgRgb(accent, 0.12)};border-radius:12px;overflow:hidden;"><img src="${escAttr(item.cover_image)}" alt="" style="width:100%;max-height:380px;object-fit:cover;display:block;" /></div>` : `<div style="height:1px;background:${pgRgb(accent, 0.12)};margin:1.8rem 0 2.4rem;"></div>`;
  scene.innerHTML = `<article style="max-width:720px;margin:0 auto;padding:4rem 1.5rem 6rem;font-family:'Josefin Sans',sans-serif;color:${text};">
        <a href="/${escAttr(coll.slug)}/all" style="font-size:.6rem;font-weight:200;letter-spacing:.2em;text-transform:uppercase;color:${pgRgb(accent, 0.6)};text-decoration:none;">← ${pgE(coll.name)}</a>
        <h1 style="font-weight:300;font-size:clamp(1.9rem,5vw,2.9rem);letter-spacing:-.01em;line-height:1.1;margin:1.3rem 0 .6rem;">${pgE(item.title || "")}</h1>
        ${item.description ? `<p style="font-weight:200;font-style:italic;font-size:1.05rem;color:${pgRgb(text, 0.55)};margin:0 0 .4rem;">${pgE(item.description)}</p>` : ""}
        ${cover}
        <div class="md-content" style="font-weight:200;font-size:1rem;line-height:1.95;color:${pgRgb(text, 0.85)};">${md(item.content || "")}</div>
      </article>`;
  scene.querySelectorAll("a, button").forEach(hookHover);
  foyerHL(scene);
  _foyerUserBadge(session);
  foyerCommentsSection(coll.slug + ":" + (item.slug || item.id), session);
}
function renderTutorialDetail(tut, session) {
  dismissLoading();
  const bg = getComputedStyle(document.documentElement).getPropertyValue("--site-bg").trim() || "#020a03";
  const accent = getComputedStyle(document.documentElement).getPropertyValue("--site-accent").trim() || "#4dbd6a";
  const text = getComputedStyle(document.documentElement).getPropertyValue("--site-text").trim() || "#c8e6aa";
  const scene = document.getElementById("scene");
  scene.style.cssText = "position:fixed;inset:0;z-index:10;display:block;overflow-y:auto;padding:44px 0 0;";
  scene.style.background = bg;
  const cover = tut.cover_image ? `<img src="${escAttr(tut.cover_image)}" alt="" style="width:100%;max-height:340px;object-fit:cover;display:block;" />` : "";
  scene.innerHTML = `
        <article style="max-width:720px;margin:0 auto;padding:2.5rem 1.5rem 6rem;font-family:'Josefin Sans',sans-serif;color:${text};">
          <a href="/tutorials/all" style="font-size:.6rem;font-weight:200;letter-spacing:.2em;text-transform:uppercase;color:${pgRgb(accent, 0.6)};text-decoration:none;">← All Tutorials</a>
          <h1 style="font-weight:300;font-size:clamp(1.8rem,5vw,2.8rem);letter-spacing:-.01em;line-height:1.1;margin:1.4rem 0 .6rem;">${pgE(tut.title || "")}</h1>
          ${tut.description ? `<p style="font-weight:200;font-style:italic;font-size:1rem;color:${pgRgb(text, 0.55)};letter-spacing:.02em;margin-bottom:1.6rem;">${pgE(tut.description)}</p>` : ""}
          ${cover ? `<div style="margin:1.4rem 0 2rem;border:1px solid ${pgRgb(accent, 0.12)};">${cover}</div>` : '<div style="height:1px;background:' + pgRgb(accent, 0.12) + ';margin:1.6rem 0 2rem;"></div>'}
          <div class="md-content" style="font-weight:200;font-size:.95rem;line-height:1.95;color:${pgRgb(text, 0.82)};">${md(tut.content || "")}</div>
        </article>`;
  scene.querySelectorAll("a, button").forEach(hookHover);
  if (session) {
    document.getElementById("userAvatar").src = session.picture || "";
    document.getElementById("userAvatar").style.display = session.picture ? "" : "none";
    document.getElementById("userNameText").textContent = session.name || session.email || "";
    document.getElementById("userBadge").style.display = "flex";
  }
  foyerCommentsSection("tutorial:" + (tut.slug || tut.id), session);
}
function renderReviewDetail(rev, session) {
  dismissLoading();
  const bg = getComputedStyle(document.documentElement).getPropertyValue("--site-bg").trim() || "#020a03";
  const accent = getComputedStyle(document.documentElement).getPropertyValue("--site-accent").trim() || "#4dbd6a";
  const text = getComputedStyle(document.documentElement).getPropertyValue("--site-text").trim() || "#c8e6aa";
  const scene = document.getElementById("scene");
  scene.style.cssText = "position:fixed;inset:0;z-index:10;display:block;overflow-y:auto;padding:44px 0 0;";
  scene.style.background = bg;
  const rating = Math.max(0, Math.min(5, parseInt(rev.rating) || 0));
  const stars = rating ? `<div style="font-size:1.1rem;letter-spacing:.15em;color:${accent};margin-bottom:1rem;">${"★".repeat(rating)}<span style="color:${pgRgb(text, 0.2)};">${"★".repeat(5 - rating)}</span></div>` : "";
  const cover = rev.cover_image ? `<img src="${escAttr(rev.cover_image)}" alt="" style="width:100%;max-height:340px;object-fit:cover;display:block;" />` : "";
  scene.innerHTML = `
        <article style="max-width:720px;margin:0 auto;padding:2.5rem 1.5rem 6rem;font-family:'Josefin Sans',sans-serif;color:${text};">
          <a href="/reviews/all" style="font-size:.6rem;font-weight:200;letter-spacing:.2em;text-transform:uppercase;color:${pgRgb(accent, 0.6)};text-decoration:none;">← All Reviews</a>
          <h1 style="font-weight:300;font-size:clamp(1.8rem,5vw,2.8rem);letter-spacing:-.01em;line-height:1.1;margin:1.4rem 0 .6rem;">${pgE(rev.title || "")}</h1>
          ${stars}
          ${rev.description ? `<p style="font-weight:200;font-style:italic;font-size:1rem;color:${pgRgb(text, 0.55)};letter-spacing:.02em;margin-bottom:1.6rem;">${pgE(rev.description)}</p>` : ""}
          ${cover ? `<div style="margin:1.4rem 0 2rem;border:1px solid ${pgRgb(accent, 0.12)};">${cover}</div>` : '<div style="height:1px;background:' + pgRgb(accent, 0.12) + ';margin:1.6rem 0 2rem;"></div>'}
          <div class="md-content" style="font-weight:200;font-size:.95rem;line-height:1.95;color:${pgRgb(text, 0.82)};">${md(rev.content || "")}</div>
        </article>`;
  scene.querySelectorAll("a, button").forEach(hookHover);
  if (session) {
    document.getElementById("userAvatar").src = session.picture || "";
    document.getElementById("userAvatar").style.display = session.picture ? "" : "none";
    document.getElementById("userNameText").textContent = session.name || session.email || "";
    document.getElementById("userBadge").style.display = "flex";
  }
  foyerCommentsSection("review:" + (rev.slug || rev.id), session);
}
function _cmtAgo(iso) {
  const d = /* @__PURE__ */ new Date(
    (iso || "").replace(" ", "T") + (/(Z|[+-]\d\d:?\d\d)$/.test(iso || "") ? "" : "Z")
  );
  const s = Math.max(1, Math.floor((Date.now() - d.getTime()) / 1e3));
  if (s < 60) return s + "s";
  if (s < 3600) return Math.floor(s / 60) + "m";
  if (s < 86400) return Math.floor(s / 3600) + "h";
  if (s < 2592e3) return Math.floor(s / 86400) + "d";
  return d.toLocaleDateString();
}
function _cmtRow(c, accent, text) {
  const av = c.avatar ? `<img src="${escAttr(c.avatar)}" alt="" style="width:34px;height:34px;border-radius:50%;object-fit:cover;flex:0 0 34px;" />` : `<div style="width:34px;height:34px;border-radius:50%;flex:0 0 34px;display:flex;align-items:center;justify-content:center;background:${pgRgb(accent, 0.16)};color:${accent};font-size:.85rem;font-weight:300;">${pgE((c.name || "?").trim().charAt(0).toUpperCase())}</div>`;
  return `<div style="display:flex;gap:.75rem;padding:.9rem 0;border-top:1px solid ${pgRgb(accent, 0.1)};">
        ${av}
        <div style="min-width:0;flex:1;">
          <div style="display:flex;align-items:baseline;gap:.5rem;"><span style="font-weight:300;font-size:.9rem;color:${pgRgb(text, 0.95)};">${pgE(c.name || "")}</span><span style="font-size:.62rem;font-weight:200;color:${pgRgb(text, 0.4)};">${_cmtAgo(c.created_at)}</span></div>
          <div style="font-weight:200;font-size:.9rem;line-height:1.6;color:${pgRgb(text, 0.78)};white-space:pre-wrap;word-break:break-word;margin-top:.15rem;">${pgE(c.body || "")}</div>
        </div>
      </div>`;
}
async function foyerCommentsSection(target, session) {
  if (!window.__foyerComments) return;
  const article = document.querySelector("#scene article");
  if (!article || article.querySelector("#foyerCmts")) return;
  const accent = getComputedStyle(document.documentElement).getPropertyValue("--site-accent").trim() || "#4dbd6a";
  const text = getComputedStyle(document.documentElement).getPropertyValue("--site-text").trim() || "#c8e6aa";
  const loggedName = session && (session.name || session.email) ? session.name || session.email : "";
  const sec = document.createElement("section");
  sec.id = "foyerCmts";
  sec.style.cssText = "margin-top:3rem;padding-top:1.5rem;border-top:1px solid " + pgRgb(accent, 0.18) + ";";
  sec.innerHTML = `
        <h3 style="font-weight:300;font-size:1.05rem;letter-spacing:.02em;color:${pgRgb(text, 0.9)};margin:0 0 1rem;">${pgE(t("comments"))} <span id="cmtCount" style="color:${pgRgb(text, 0.4)};font-size:.85rem;"></span></h3>
        <form id="cmtForm" style="margin-bottom:1.4rem;">
          ${loggedName ? "" : `<input id="cmtName" maxlength="60" placeholder="${escAttr(t("comment_name_ph"))}" style="width:100%;box-sizing:border-box;background:${pgRgb(accent, 0.06)};border:1px solid ${pgRgb(accent, 0.18)};border-radius:8px;padding:.6rem .8rem;color:${text};font-family:inherit;font-weight:200;font-size:.9rem;margin-bottom:.5rem;outline:none;" />`}
          <textarea id="cmtBody" maxlength="2000" rows="3" placeholder="${escAttr(t("comment_ph"))}" style="width:100%;box-sizing:border-box;background:${pgRgb(accent, 0.06)};border:1px solid ${pgRgb(accent, 0.18)};border-radius:8px;padding:.6rem .8rem;color:${text};font-family:inherit;font-weight:200;font-size:.9rem;resize:vertical;outline:none;"></textarea>
          <div style="display:flex;align-items:center;gap:.8rem;margin-top:.5rem;">
            <button type="submit" id="cmtPost" style="background:${accent};color:${pgRgb("#000", 0.85)};border:none;border-radius:8px;padding:.5rem 1.4rem;font-family:inherit;font-weight:300;font-size:.85rem;letter-spacing:.03em;cursor:pointer;">${pgE(t("comment_post"))}</button>
            <span id="cmtErr" style="font-size:.75rem;font-weight:200;color:#e88;"></span>
          </div>
        </form>
        <div id="cmtList" style="font-family:'Josefin Sans',sans-serif;"></div>`;
  article.appendChild(sec);
  sec.querySelectorAll("a, button").forEach(hookHover);
  const listEl = sec.querySelector("#cmtList");
  const countEl = sec.querySelector("#cmtCount");
  const paint = (rows2) => {
    countEl.textContent = rows2.length ? "· " + rows2.length : "";
    listEl.innerHTML = rows2.length ? rows2.map((c) => _cmtRow(c, accent, text)).join("") : `<p style="font-weight:200;font-size:.85rem;color:${pgRgb(text, 0.45)};padding:.6rem 0;">${pgE(t("comment_none"))}</p>`;
  };
  let rows = [];
  try {
    rows = await fetch("/api/comments?target=" + encodeURIComponent(target)).then(
      (r) => r.ok ? r.json() : []
    );
  } catch {
  }
  if (!Array.isArray(rows)) rows = [];
  paint(rows);
  sec.querySelector("#cmtForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errEl = sec.querySelector("#cmtErr");
    errEl.textContent = "";
    const nameEl = sec.querySelector("#cmtName");
    const name = (loggedName || (nameEl ? nameEl.value : "")).trim();
    const body = sec.querySelector("#cmtBody").value.trim();
    if (!name || !body) {
      errEl.textContent = t("comment_name_ph");
      return;
    }
    const btn = sec.querySelector("#cmtPost");
    const orig = btn.textContent;
    btn.disabled = true;
    btn.textContent = t("comment_sending");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target,
          name,
          body,
          avatar: session && session.picture || ""
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        errEl.textContent = data.error || "Could not post.";
      } else {
        rows.unshift(data);
        paint(rows);
        sec.querySelector("#cmtBody").value = "";
      }
    } catch {
      errEl.textContent = "Could not post.";
    }
    btn.disabled = false;
    btn.textContent = orig;
  });
}
let _session = null, _routerWired = false;
const _pageCache = /* @__PURE__ */ new Map();
function fetchPage(slug, session) {
  const hit = _pageCache.get(slug);
  if (hit && Date.now() - hit.t < 6e4) return hit.p;
  const p = protectedFetch(`/api/pages?slug=${encodeURIComponent(slug)}`, session);
  _pageCache.set(slug, { t: Date.now(), p });
  return p;
}
function _routable(url) {
  if (url.origin !== location.origin) return false;
  if (/^\/(api|admin|foyer)(\/|$)/.test(url.pathname)) return false;
  if (/\.[a-z0-9]+$/i.test(url.pathname)) return false;
  return true;
}
async function navigateTo(path) {
  if (path !== location.pathname + location.search + location.hash) history.pushState({}, "", path);
  const scene = document.getElementById("scene");
  if (window._lenis) window._lenis.scrollTo(0, { immediate: true });
  else if (scene) scene.scrollTop = 0;
  await loadAndShow(_session);
  if (window._lenisResize) {
    window._lenisResize();
    setTimeout(window._lenisResize, 500);
  }
  if (scene) {
    scene.classList.remove("pg-anim-in");
    void scene.offsetWidth;
    scene.classList.add("pg-anim-in");
  }
  if (location.hash) {
    const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (el) {
      if (window._lenis) window._lenis.scrollTo(el);
      else el.scrollIntoView();
    }
  }
}
function wireRouter() {
  if (_routerWired) return;
  _routerWired = true;
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
      return;
    const a = e.target.closest && e.target.closest("a[href]");
    if (!a || a.target === "_blank" || a.hasAttribute("download") || a.hasAttribute("data-no-router"))
      return;
    let url;
    try {
      url = new URL(a.href, location.href);
    } catch {
      return;
    }
    if (!_routable(url)) return;
    if (url.hash && url.pathname === location.pathname) return;
    e.preventDefault();
    if (url.pathname === location.pathname && !url.hash) {
      if (window._lenis) window._lenis.scrollTo(0);
      else {
        const sc = document.getElementById("scene");
        if (sc) sc.scrollTop = 0;
      }
      return;
    }
    navigateTo(url.pathname + url.search + url.hash);
  });
  window.addEventListener("popstate", () => loadAndShow(_session));
  const prefetch = (e) => {
    const a = e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    let url;
    try {
      url = new URL(a.href, location.href);
    } catch {
      return;
    }
    if (!_routable(url) || url.hash) return;
    const slug = url.pathname.replace(/\/$/, "") || "/";
    if (/^\/(tutorials|review|reviews)(\/|$)/.test(slug)) return;
    fetchPage(slug, _session);
  };
  document.addEventListener("mouseover", prefetch);
  document.addEventListener("touchstart", prefetch, { passive: true });
  document.addEventListener("focusin", prefetch);
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
      e.preventDefault();
      foyerOpenSearch();
    }
  });
}
async function _foyerLoadFuse() {
  if (window.Fuse) return;
  await new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = "/deps/fuse.js";
    s.onload = res;
    s.onerror = rej;
    document.head.appendChild(s);
  });
}
async function _foyerSearchIndex() {
  if (window._foyerSearchIdx) return window._foyerSearchIdx;
  const r = await protectedFetch("/api/search", _session);
  window._foyerSearchIdx = Array.isArray(r) ? r : [];
  return window._foyerSearchIdx;
}
function _foyerSnippet(txt, term) {
  if (!txt) return "";
  const i = txt.toLowerCase().indexOf(term.toLowerCase());
  const start = i < 0 ? 0 : Math.max(0, i - 30);
  let s = txt.slice(start, start + 120);
  if (start > 0) s = "…" + s;
  if (start + 120 < txt.length) s += "…";
  return pgE(s);
}
function foyerOpenSearch() {
  if (window._foyerSearchOn === false) return;
  if (document.getElementById("foyer-search")) return;
  const cs = getComputedStyle(document.documentElement);
  const accent = cs.getPropertyValue("--site-accent").trim() || "#4dbd6a";
  const bg = cs.getPropertyValue("--site-bg").trim() || "#020a03";
  const text = cs.getPropertyValue("--site-text").trim() || "#c8e6aa";
  const hrefOf = (s) => s === "/" ? "/" : s.startsWith("/") ? s : "/" + s;
  const ov = document.createElement("div");
  ov.id = "foyer-search";
  ov.style.cssText = "position:fixed;inset:0;z-index:9995;background:rgba(0,0,0,.5);backdrop-filter:blur(5px);display:flex;align-items:flex-start;justify-content:center;padding:14vh 1rem 1rem;";
  ov.innerHTML = `<div style="width:100%;max-width:540px;background:${bg};border:1px solid ${pgRgb(accent, 0.25)};border-radius:14px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.5);font-family:'Josefin Sans',sans-serif;">
        <input id="fsq" type="text" placeholder="${t2("search_ph")}" autocomplete="off" style="width:100%;box-sizing:border-box;padding:1.05rem 1.3rem;background:transparent;border:none;border-bottom:1px solid ${pgRgb(accent, 0.15)};color:${text};font-family:inherit;font-weight:300;font-size:1.05rem;letter-spacing:.02em;outline:none;" />
        <div id="fsr" style="max-height:52vh;overflow-y:auto;"></div>
      </div>`;
  const close = () => {
    ov.remove();
    document.removeEventListener("keydown", onKey);
  };
  const onKey = (e) => {
    if (e.key === "Escape") close();
  };
  ov.addEventListener("click", (e) => {
    if (e.target === ov) close();
  });
  document.addEventListener("keydown", onKey);
  document.body.appendChild(ov);
  const q = ov.querySelector("#fsq"), res = ov.querySelector("#fsr");
  setTimeout(() => q.focus(), 30);
  let fuse = null, t2;
  const ensure = async () => {
    if (fuse) return fuse;
    await _foyerLoadFuse();
    fuse = new window.Fuse(await _foyerSearchIndex(), {
      keys: [
        { name: "t", weight: 2 },
        { name: "x", weight: 1 }
      ],
      threshold: 0.4,
      ignoreLocation: true,
      minMatchCharLength: 2
    });
    return fuse;
  };
  const run = async () => {
    const term = q.value.trim();
    if (term.length < 2) {
      res.innerHTML = "";
      return;
    }
    let f;
    try {
      f = await ensure();
    } catch {
      res.innerHTML = `<div style="padding:1.1rem 1.3rem;color:${pgRgb(text, 0.5)};font-weight:200;font-size:.85rem;">Search is unavailable.</div>`;
      return;
    }
    if (q.value.trim() !== term) return;
    const hits = f.search(term).slice(0, 8);
    res.innerHTML = hits.length ? hits.map(
      (h) => `<a href="${escAttr(hrefOf(h.item.s))}" data-fs style="display:block;padding:.75rem 1.3rem;border-bottom:1px solid ${pgRgb(accent, 0.08)};text-decoration:none;color:${text};"><div style="font-weight:300;font-size:.95rem;">${pgE(h.item.t || h.item.s)}</div><div style="font-size:.74rem;font-weight:200;color:${pgRgb(text, 0.5)};margin-top:.2rem;line-height:1.5;">${_foyerSnippet(h.item.x, term)}</div></a>`
    ).join("") : `<div style="padding:1.1rem 1.3rem;color:${pgRgb(text, 0.5)};font-weight:200;font-size:.88rem;">No results for &ldquo;${pgE(term)}&rdquo;.</div>`;
  };
  q.addEventListener("input", () => {
    clearTimeout(t2);
    t2 = setTimeout(run, 120);
  });
  q.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const a = res.querySelector("a[data-fs]");
      if (a) a.click();
    }
  });
  res.addEventListener("click", (e) => {
    if (e.target.closest("a[data-fs]")) close();
  });
}
export function mountAskWidget(settings, session) {
  if (window.__askMounted) return;
  if (!settings || settings.ask_enabled !== "1") return;
  window.__askMounted = true;
  const corner = ["br", "bl", "tr", "tl"].includes(settings.ask_corner) ? settings.ask_corner : "br";
  const cs = getComputedStyle(document.documentElement);
  const accent = cs.getPropertyValue("--site-accent").trim() || "#4dbd6a";
  const bg = cs.getPropertyValue("--site-bg").trim() || "#020a03";
  const text = cs.getPropertyValue("--site-text").trim() || "#c8e6aa";
  const siteName = settings.name || window.__SITE__ && __SITE__.name || "this site";
  const circle = settings.ask_color && /^#?[0-9a-fA-F]{3,8}$/.test(settings.ask_color.replace(/^#/, "")) ? settings.ask_color[0] === "#" ? settings.ask_color : "#" + settings.ask_color : accent;
  const vert = corner[0] === "t" ? "top:20px;" : "bottom:60px;";
  const horz = corner[1] === "l" ? "left:20px;" : "right:20px;";
  const panelVert = corner[0] === "t" ? "top:88px;" : "bottom:128px;";
  const root = document.createElement("div");
  root.id = "foyer-ask";
  root.style.cssText = `position:fixed;${vert}${horz}z-index:9990;font-family:'Josefin Sans',sans-serif;`;
  root.innerHTML = `
        <style>
          #foyer-ask #askPanel{opacity:0;transform:translateY(12px) scale(.97);transition:opacity .22s ease,transform .22s cubic-bezier(.16,1,.3,1);pointer-events:none;}
          #foyer-ask #askPanel.open{opacity:1;transform:translateY(0) scale(1);pointer-events:auto;}
          #foyer-ask #askBubble{animation:askPulse 2.4s ease-in-out 1;}
          @keyframes askPulse{0%,100%{box-shadow:0 8px 24px rgba(0,0,0,.35),0 0 0 0 ${pgRgb(circle, 0.4)};}50%{box-shadow:0 8px 24px rgba(0,0,0,.35),0 0 0 8px ${pgRgb(circle, 0)};}}
          #foyer-ask .ask-typing{display:inline-flex;gap:.24rem;}
          #foyer-ask .ask-typing span{width:5px;height:5px;border-radius:50%;background:${pgRgb(text, 0.5)};animation:askBounce 1.1s infinite ease-in-out;}
          #foyer-ask .ask-typing span:nth-child(2){animation-delay:.15s;}
          #foyer-ask .ask-typing span:nth-child(3){animation-delay:.3s;}
          @keyframes askBounce{0%,60%,100%{transform:translateY(0);opacity:.4;}30%{transform:translateY(-4px);opacity:1;}}
        </style>
        <button id="askBubble" aria-label="Ask this site" style="width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;background:${circle};box-shadow:0 8px 24px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;padding:0;transition:transform .18s;">
          <img src="/icons/favicon.svg" alt="" style="width:30px;height:30px;border-radius:6px;pointer-events:none;" onerror="this.style.display='none';this.nextElementSibling.style.display='block';" />
          <svg style="display:none;width:26px;height:26px;" viewBox="0 0 24 24" fill="none" stroke="${bg}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z"/></svg>
        </button>
        <div id="askPanel" style="display:none;position:absolute;${panelVert}${corner[1] === "l" ? "left:0;" : "right:0;"}width:min(360px,calc(100vw - 40px));height:min(520px,70vh);background:${bg};border:1px solid ${pgRgb(accent, 0.25)};border-radius:16px;box-shadow:0 24px 60px rgba(0,0,0,.5);overflow:hidden;flex-direction:column;">
          <div style="padding:.9rem 1.1rem;border-bottom:1px solid ${pgRgb(accent, 0.14)};display:flex;align-items:center;justify-content:space-between;gap:.6rem;">
            <div style="display:flex;align-items:center;gap:.55rem;min-width:0;">
              <div style="width:24px;height:24px;border-radius:50%;background:${pgRgb(accent, 0.14)};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="${accent}" stroke="none"><path d="M12 2l1.8 5.4L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.6z"/></svg>
              </div>
              <div style="min-width:0;display:flex;align-items:baseline;gap:.5rem;overflow:hidden;">
                <span style="font-weight:400;font-size:.88rem;letter-spacing:.02em;color:${text};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Ask ${pgE(siteName)}</span>
                ${window.__FOYER_NOBRAND ? "" : `<a href="/foyer" target="_blank" rel="noopener" style="font-size:.54rem;font-weight:300;letter-spacing:.1em;text-transform:uppercase;color:${pgRgb(text, 0.32)};text-decoration:none;white-space:nowrap;flex-shrink:0;">Powered by Foyer</a>`}
              </div>
            </div>
            <button id="askClose" aria-label="Close" style="background:none;border:none;color:${pgRgb(text, 0.5)};font-size:1.2rem;cursor:pointer;line-height:1;padding:.2rem;flex-shrink:0;border-radius:6px;transition:background .15s;">×</button>
          </div>
          <div id="askMsgs" style="flex:1;overflow-y:auto;padding:1rem 1.1rem;display:flex;flex-direction:column;gap:.7rem;"></div>
          <form id="askForm" style="display:flex;gap:.5rem;padding:.8rem;border-top:1px solid ${pgRgb(accent, 0.14)};">
            <input id="askInput" type="text" placeholder="${t("ask_ph")}" autocomplete="off" style="flex:1;box-sizing:border-box;padding:.7rem .9rem;background:${pgRgb(accent, 0.05)};border:1px solid ${pgRgb(accent, 0.18)};border-radius:10px;color:${text};font-family:inherit;font-weight:300;font-size:.88rem;outline:none;transition:border-color .15s,background .15s;" />
            <button type="submit" aria-label="Send" style="flex-shrink:0;width:42px;border:none;border-radius:10px;background:${accent};color:${bg};font-size:1.1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:filter .15s;">↑</button>
          </form>
        </div>`;
  document.body.appendChild(root);
  const bubble = root.querySelector("#askBubble");
  const panel = root.querySelector("#askPanel");
  const msgs = root.querySelector("#askMsgs");
  const input = root.querySelector("#askInput");
  const closeBtn = root.querySelector("#askClose");
  const submitBtn = root.querySelector('#askForm button[type="submit"]');
  hookHover(bubble);
  hookHover(closeBtn);
  hookHover(submitBtn);
  closeBtn.addEventListener("mouseenter", () => closeBtn.style.background = pgRgb(text, 0.08));
  closeBtn.addEventListener("mouseleave", () => closeBtn.style.background = "none");
  input.addEventListener("focus", () => {
    input.style.borderColor = pgRgb(accent, 0.5);
    input.style.background = pgRgb(accent, 0.08);
  });
  input.addEventListener("blur", () => {
    input.style.borderColor = pgRgb(accent, 0.18);
    input.style.background = pgRgb(accent, 0.05);
  });
  const history2 = [];
  let busy = false, greeted = false;
  const addMsg = (role, content) => {
    const me = role === "user";
    const b = document.createElement("div");
    b.style.cssText = `max-width:85%;align-self:${me ? "flex-end" : "flex-start"};padding:.6rem .85rem;border-radius:14px;font-weight:300;font-size:.85rem;line-height:1.55;${me ? `background:${accent};color:${bg};border-bottom-right-radius:4px;` : `background:${pgRgb(accent, 0.07)};color:${pgRgb(text, 0.92)};border-bottom-left-radius:4px;`}`;
    b.textContent = content;
    msgs.appendChild(b);
    msgs.scrollTop = msgs.scrollHeight;
    return b;
  };
  const addTyping = () => {
    const b = document.createElement("div");
    b.style.cssText = `align-self:flex-start;padding:.6rem .85rem;border-radius:14px;border-bottom-left-radius:4px;background:${pgRgb(accent, 0.07)};`;
    b.innerHTML = '<span class="ask-typing"><span></span><span></span><span></span></span>';
    msgs.appendChild(b);
    msgs.scrollTop = msgs.scrollHeight;
    return b;
  };
  const toggle = (open) => {
    panel.style.display = open ? "flex" : "none";
    if (open) requestAnimationFrame(() => panel.classList.add("open"));
    else panel.classList.remove("open");
    bubble.style.transform = open ? "scale(.9)" : "";
    if (open) {
      if (!greeted) {
        greeted = true;
        addMsg("assistant", t("ask_hi"));
      }
      setTimeout(() => input.focus(), 200);
    }
  };
  bubble.addEventListener("click", () => toggle(panel.style.display !== "flex"));
  closeBtn.addEventListener("click", () => toggle(false));
  root.querySelector("#askForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q || busy) return;
    input.value = "";
    busy = true;
    submitBtn.style.opacity = ".6";
    addMsg("user", q);
    history2.push({ role: "user", content: q });
    const typing = addTyping();
    try {
      const r = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { ...sessionHeaders(session), "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history2.slice(-8) })
      });
      const d = await r.json().catch(() => ({}));
      typing.remove();
      const reply = r.ok ? d.reply || "Sorry — I’m not sure about that." : d.error || "Something went wrong — try again.";
      addMsg("assistant", reply);
      if (r.ok && d.reply) history2.push({ role: "assistant", content: d.reply });
    } catch {
      typing.remove();
      addMsg("assistant", "Network error — please try again.");
    }
    busy = false;
    submitBtn.style.opacity = "";
    msgs.scrollTop = msgs.scrollHeight;
  });
}
function renderLockedPage(slug, page, session, bad) {
  dismissLoading();
  const _pgbg = document.getElementById("pg-bg");
  if (_pgbg) _pgbg.style.display = "none";
  const bg = getComputedStyle(document.documentElement).getPropertyValue("--site-bg").trim() || "#020a03";
  const accent = getComputedStyle(document.documentElement).getPropertyValue("--site-accent").trim() || "#4dbd6a";
  const text = getComputedStyle(document.documentElement).getPropertyValue("--site-text").trim() || "#c8e6aa";
  const scene = document.getElementById("scene");
  scene.style.cssText = "position:fixed;inset:0;z-index:10;display:flex;align-items:center;justify-content:center;padding:1.5rem;";
  scene.style.background = bg;
  loadNav(session);
  scene.innerHTML = `<div style="width:100%;max-width:360px;text-align:center;font-family:'Josefin Sans',sans-serif;color:${text};">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="${accent}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:1.2rem;opacity:.8;"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <h1 style="font-weight:300;font-size:1.5rem;letter-spacing:.01em;margin:0 0 .4rem;">${pgE(page.title || "Protected page")}</h1>
        <p style="font-weight:200;font-size:.82rem;color:${pgRgb(text, 0.5)};margin:0 0 1.6rem;">${t("pw_protected")}</p>
        <form id="pwform" style="display:flex;flex-direction:column;gap:.7rem;">
          <input id="pwin" type="password" placeholder="${t("pw_ph")}" autocomplete="current-password" style="box-sizing:border-box;padding:.85rem 1rem;background:${pgRgb(accent, 0.04)};border:1px solid ${pgRgb(accent, bad ? 0.55 : 0.2)};border-radius:10px;color:${text};font-family:inherit;font-weight:300;font-size:.95rem;outline:none;text-align:center;letter-spacing:.04em;" />
          ${bad ? `<div style="font-size:.72rem;font-weight:200;color:#e88;">${t("pw_wrong")}</div>` : ""}
          <button type="submit" style="padding:.8rem;background:${accent};color:${bg};border:none;border-radius:10px;font-family:inherit;font-weight:400;font-size:.7rem;letter-spacing:.16em;text-transform:uppercase;cursor:pointer;">${t("pw_unlock")}</button>
        </form>
      </div>`;
  scene.querySelectorAll("a, button, input").forEach(hookHover);
  _foyerUserBadge(session);
  const inp = scene.querySelector("#pwin");
  setTimeout(() => inp && inp.focus(), 40);
  scene.querySelector("#pwform").addEventListener("submit", async (e) => {
    e.preventDefault();
    const pw = inp.value;
    if (!pw) return;
    const headers = { ...sessionHeaders(session), "X-Page-Password": pw };
    let data = null;
    try {
      const r = await fetch(`/api/pages?slug=${encodeURIComponent(slug)}`, { headers });
      data = await r.json();
    } catch (err) {
    }
    if (!data || data.locked) {
      renderLockedPage(slug, page, session, true);
      return;
    }
    _pageCache.set(slug, { t: Date.now(), p: Promise.resolve(data) });
    if (data.page_json) {
      try {
        const state = JSON.parse(data.page_json);
        if (state.kind === "text") {
          setMeta(
            state.page_title || data.title || __SITE__.name,
            state.desc || "",
            slug,
            state.cover
          );
          renderTextPage(state, session, data.title);
          return;
        }
        setMeta(
          state.page_title || data.title || __SITE__.name,
          state.page_subtitle || "",
          slug,
          state.page_image
        );
        renderCustomPage(state, session);
        return;
      } catch (err) {
      }
    }
    showFallback(session);
  });
}
const _TR_SKIP = /* @__PURE__ */ new Set([
  "id",
  "type",
  "variant",
  "icon",
  "align",
  "anchor",
  "slug",
  "parent",
  "font",
  "kind",
  "url",
  "href",
  "img",
  "photo",
  "src",
  "bg_img",
  "bg_image",
  "image",
  "avatar",
  "cover",
  "cover_image",
  "data",
  "access_key",
  "target",
  "buy_url",
  "btn_url",
  "btn2_url",
  "button_url",
  "bg",
  "accent",
  "color",
  "bg_style",
  "layout",
  "pad",
  "size",
  "weight",
  "ls",
  "name_size",
  "page_image",
  "show_in_nav",
  "new_tab",
  "rating",
  "featured",
  "buy",
  "for_sale",
  "sale",
  "show_count",
  "autoplay",
  "loop"
]);
const _isTrText = (s) => typeof s === "string" && s.trim().length > 1 && !/^(yes|no|true|false|on|off)$/i.test(s.trim()) && !/^(https?:|\/|#|data:|mailto:|tel:)/i.test(s) && !/^#?[0-9a-f]{3,8}$/i.test(s) && /[a-zA-ZÀ-ɏ]/.test(s);
async function _gtransOne(text, from, to) {
  for (let a = 0; a < 3; a++) {
    try {
      const r = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`
      );
      if (r.ok) {
        const d = await r.json();
        if (Array.isArray(d) && Array.isArray(d[0])) {
          const o = d[0].map((s) => s && s[0] || "").join("");
          if (o) return o;
        }
      }
    } catch {
    }
  }
  return text;
}
function _trOverlay(show, done, total) {
  let el = document.getElementById("foyer-translating");
  if (!show) {
    if (el) el.remove();
    return;
  }
  const cs = getComputedStyle(document.documentElement);
  const bg = cs.getPropertyValue("--site-bg").trim() || "#020a03", accent = cs.getPropertyValue("--site-accent").trim() || "#4dbd6a", text = cs.getPropertyValue("--site-text").trim() || "#c8e6aa";
  if (!el) {
    if (!document.getElementById("foyer-tr-style")) {
      const st = document.createElement("style");
      st.id = "foyer-tr-style";
      st.textContent = "@keyframes foyerspin{to{transform:rotate(360deg)}}";
      document.head.appendChild(st);
    }
    el = document.createElement("div");
    el.id = "foyer-translating";
    el.style.cssText = `position:fixed;inset:0;z-index:9996;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.1rem;background:${bg};font-family:'Josefin Sans',sans-serif;`;
    el.innerHTML = `<div style="width:34px;height:34px;border:3px solid ${pgRgb(accent, 0.2)};border-top-color:${accent};border-radius:50%;animation:foyerspin .8s linear infinite;"></div><div id="foyer-tr-label" style="font-weight:300;font-size:.9rem;letter-spacing:.05em;color:${pgRgb(text, 0.8)};"></div>`;
    document.body.appendChild(el);
  }
  const lbl = el.querySelector("#foyer-tr-label");
  if (lbl)
    lbl.textContent = (t("translating") || "Translating") + "…" + (total > 1 ? ` ${done}/${total}` : "");
}
async function foyerTranslateState(state, from, to, slug) {
  const ck = "foyer_tr2_" + to + "_" + slug;
  const srcLen = JSON.stringify(state).length;
  try {
    const c = JSON.parse(localStorage.getItem(ck) || "null");
    if (c && c.n === srcLen) return c.st;
  } catch {
  }
  try {
    await window.foyerLoadI18n(to);
  } catch {
  }
  const set = /* @__PURE__ */ new Set();
  const collect = (o, d) => {
    if (d > 9 || o == null) return;
    if (typeof o === "string") {
      if (_isTrText(o)) set.add(o);
      return;
    }
    if (Array.isArray(o)) {
      for (const v of o) collect(v, d + 1);
      return;
    }
    if (typeof o === "object") {
      for (const k in o) if (!_TR_SKIP.has(k)) collect(o[k], d + 1);
    }
  };
  collect(state, 0);
  const arr = [...set], map = /* @__PURE__ */ new Map();
  const CONC = 6;
  _trOverlay(true, 0, arr.length);
  for (let i = 0; i < arr.length; i += CONC) {
    const batch = arr.slice(i, i + CONC);
    const res = await Promise.all(batch.map((s) => _gtransOne(s, from, to)));
    batch.forEach((s, j) => map.set(s, res[j]));
    _trOverlay(true, Math.min(i + CONC, arr.length), arr.length);
  }
  _trOverlay(false);
  const sub = (o, d) => {
    if (d > 9 || o == null) return o;
    if (typeof o === "string") return map.has(o) ? map.get(o) : o;
    if (Array.isArray(o)) return o.map((v) => sub(v, d + 1));
    if (typeof o === "object") {
      const r = {};
      for (const k in o) r[k] = _TR_SKIP.has(k) ? o[k] : sub(o[k], d + 1);
      return r;
    }
    return o;
  };
  const out = sub(state, 0);
  try {
    localStorage.setItem(ck, JSON.stringify({ n: srcLen, st: out }));
  } catch {
  }
  return out;
}
async function foyerMaybeTr(obj, key) {
  const base = window.__foyerLangs && window.__foyerLangs[0] || "en";
  if (window.foyerLang && window.foyerLang !== base) {
    try {
      return await foyerTranslateState(obj, base, window.foyerLang, key);
    } catch {
    }
  }
  return obj;
}
export async function loadAndShow(session) {
  _session = session;
  wireRouter();
  initLiveSettings();
  if (!versionPollStarted) {
    versionPollStarted = true;
  }
  const _pgbg = document.getElementById("pg-bg");
  if (_pgbg) _pgbg.style.display = "none";
  let _wantsAdmin = false;
  try {
    _wantsAdmin = sessionStorage.getItem("foyer_admin_return") === "1" || new URLSearchParams(location.search).get("admin_return") === "1";
  } catch {
  }
  if (session && _wantsAdmin) {
    try {
      sessionStorage.removeItem("foyer_admin_return");
    } catch {
    }
    location.href = "/admin";
    return;
  }
  const slug = window.location.pathname.replace(/\/$/, "") || "/";
  pingAnalytics(slug, session);
  startBanPoll(session);
  loadNav(session);
  if (slug === "/tutorials/all") {
    setMeta("Tutorials", "", slug);
    renderCollectionIndex("tutorials", session);
    return;
  }
  if (slug === "/reviews/all") {
    setMeta("Reviews", "", slug);
    renderCollectionIndex("reviews", session);
    return;
  }
  const tutMatch = slug.match(/^\/tutorials\/(.+)$/);
  if (tutMatch) {
    let tut = await protectedFetch(
      `/api/tutorials/by-slug/${encodeURIComponent(tutMatch[1])}`,
      session
    );
    if (tut && tut.id) {
      tut = await foyerMaybeTr(tut, slug);
      setMeta(tut.title || "Tutorial", tut.description || "", slug);
      renderTutorialDetail(tut, session);
      return;
    }
  }
  const revMatch = slug.match(/^\/review\/(.+)$/);
  if (revMatch) {
    let rev = await protectedFetch(
      `/api/reviews/by-slug/${encodeURIComponent(revMatch[1])}`,
      session
    );
    if (rev && rev.id) {
      rev = await foyerMaybeTr(rev, slug);
      setMeta(rev.title || "Review", rev.description || "", slug);
      renderReviewDetail(rev, session);
      return;
    }
  }
  {
    const parts = slug.replace(/^\//, "").split("/");
    const coll = (await _foyerCollections(session)).find((c) => c.slug === parts[0]);
    if (coll) {
      const sub = parts.slice(1).join("/");
      if (!sub || sub === "all") {
        setMeta(coll.name, "", slug);
        renderCollIndex(coll, session);
        return;
      }
      let item = await protectedFetch(
        `/api/collections/${encodeURIComponent(coll.slug)}/items/by-slug/${encodeURIComponent(sub)}`,
        session
      );
      if (item && item.id) {
        item = await foyerMaybeTr(item, slug);
        setMeta(item.title || coll.name, item.description || "", slug, item.cover_image);
        renderCollItem(coll, item, session);
        return;
      }
    }
  }
  const page = await fetchPage(slug, session);
  if (page?.locked) {
    setMeta(page.title || "Protected", "", slug);
    renderLockedPage(slug, page, session);
    return;
  }
  if (page?.page_json) {
    try {
      let state = JSON.parse(page.page_json);
      const _base = window.__foyerLangs && window.__foyerLangs[0] || "en";
      if (window.foyerLang && window.foyerLang !== _base)
        state = await foyerTranslateState(state, _base, window.foyerLang, slug);
      if (state.kind === "text") {
        setMeta(
          state.page_title || page.title || __SITE__.name,
          state.page_subtitle || state.desc || "",
          slug,
          state.page_image || state.cover
        );
        renderTextPage(state, session, page.title);
        return;
      }
      setMeta(
        state.page_title || page.title || __SITE__.name,
        state.page_subtitle || "",
        slug,
        state.page_image
      );
      renderCustomPage(state, session);
      return;
    } catch (e) {
    }
  }
  if (slug === "/") {
    const settings = await fetch("/api/settings").then((r) => r.json()).catch(() => ({}));
    setMeta(settings.name || __SITE__.name, settings.tagline || "", "/");
    showFallback(session);
  } else {
    const p404 = await protectedFetch("/api/pages?slug=__404__", session);
    if (p404?.page_json) {
      try {
        const state = JSON.parse(p404.page_json);
        setMeta("404 — Page Not Found", "", slug);
        renderCustomPage(state, session);
        return;
      } catch (e) {
      }
    }
    setMeta("404 — Not Found", "", slug);
    showFallback(session);
  }
}
