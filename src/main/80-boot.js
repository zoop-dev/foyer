import { VERSION, dismissGate, dismissLoading, getSession, hookHover, pgE } from "./10-core.js";
import { startVersionPoll } from "./30-net.js";
import { loadAndShow, mountAskWidget } from "./40-pages.js";
import { loadInstalledPacks } from "./20-render.js";
import {
  _foyerSession,
  handleOAuthCallback,
  setBootAuthIds,
  setBootCaptcha,
  startDiscordBtn,
  startFoyerBtn,
  startGate,
  startGithubBtn
} from "./60-gate.js";
function foyerControlPlane() {
  fetch("/api/sb/beat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ version: VERSION })
  }).catch(() => {
  });
  fetch("/api/sb/flags", { cache: "no-store" }).then((r) => r.ok ? r.json() : {}).then((f) => {
    window.foyerFlags = f || {};
  }).catch(() => {
  });
  const checkAnnouncements = () => {
    fetch("/api/sb/announcements", { cache: "no-store" }).then((r) => r.ok ? r.json() : []).then((rows) => {
      if (document.getElementById("foyer-ann")) return;
      const now = Date.now();
      const a = (rows || []).find((x) => {
        if (x.starts_at && new Date(x.starts_at).getTime() > now) return false;
        if (x.ends_at && new Date(x.ends_at).getTime() < now) return false;
        try {
          if (localStorage.getItem("foyer_ann_dismissed_" + x.id) === "1") return false;
        } catch {
        }
        return true;
      });
      if (a) renderAnnouncement(a);
    }).catch(() => {
    });
  };
  checkAnnouncements();
  setInterval(checkAnnouncements, 6e4);
  let errCount = 0;
  const report = (message, stack) => {
    if (errCount >= 5) return;
    errCount++;
    fetch("/api/sb/err", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        message: String(message || "").slice(0, 500),
        stack: String(stack || "").slice(0, 2e3),
        url: location.href.slice(0, 300)
      })
    }).catch(() => {
    });
  };
  window.addEventListener("error", (e) => report(e.message, e.error && e.error.stack));
  window.addEventListener(
    "unhandledrejection",
    (e) => report(
      "unhandledrejection: " + (e.reason && e.reason.message || e.reason),
      e.reason && e.reason.stack
    )
  );
}
function renderAnnouncement(a) {
  if (document.getElementById("foyer-ann")) return;
  const warn = a.level === "warn";
  const accent = warn ? "#e0b15a" : "#7fa6d8";
  const bar = document.createElement("div");
  bar.id = "foyer-ann";
  bar.style.cssText = [
    "position:fixed;top:0;left:0;right:0;z-index:9990;",
    "display:flex;align-items:center;justify-content:center;gap:.7rem;",
    "padding:.62rem 2.8rem;font-family:'Josefin Sans',system-ui,sans-serif;",
    "font-weight:300;font-size:.72rem;letter-spacing:.05em;line-height:1.5;text-align:center;",
    "background:rgba(13,17,23,0.97);color:#e8edf2;",
    `border-bottom:1px solid ${accent}59;box-shadow:0 2px 22px rgba(0,0,0,.32);`,
    "backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);",
    "transition:transform .45s cubic-bezier(.16,1,.3,1),opacity .4s ease;transform:translateY(-100%);"
  ].join("");
  const mark = document.createElement("span");
  mark.style.cssText = "flex-shrink:0;display:inline-flex;opacity:.9;";
  mark.innerHTML = `<svg width="12" height="14" viewBox="0 0 44 50" fill="none" stroke="${accent}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 46 V24 a16 16 0 0 1 32 0 V46"/><path d="M15 46 V28 a6 6 0 0 1 12 0 V46"/></svg>`;
  bar.appendChild(mark);
  const span = document.createElement("span");
  span.textContent = a.message;
  bar.appendChild(span);
  const x = document.createElement("button");
  x.textContent = "×";
  x.setAttribute("aria-label", "Dismiss");
  x.style.cssText = "position:absolute;right:1rem;top:50%;transform:translateY(-50%);background:none;border:none;color:#8b94a6;font-size:1.15rem;cursor:pointer;opacity:.7;line-height:1;transition:opacity .2s,color .2s;";
  x.addEventListener("mouseenter", () => {
    x.style.opacity = "1";
    x.style.color = "#e8edf2";
  });
  x.addEventListener("mouseleave", () => {
    x.style.opacity = ".7";
    x.style.color = "#8b94a6";
  });
  const dismiss = () => {
    bar.style.transform = "translateY(-100%)";
    bar.style.opacity = "0";
    setTimeout(() => bar.remove(), 460);
  };
  x.addEventListener("click", () => {
    try {
      localStorage.setItem("foyer_ann_dismissed_" + a.id, "1");
    } catch {
    }
    dismiss();
  });
  bar.appendChild(x);
  document.body.appendChild(bar);
  requestAnimationFrame(
    () => requestAnimationFrame(() => {
      bar.style.transform = "translateY(0)";
    })
  );
  if (a.hide_after && a.hide_after > 0) setTimeout(dismiss, a.hide_after * 1e3);
}
function startMagicStub() {
  const trigger = document.getElementById("emailSignInBtn");
  if (!trigger) return;
  trigger.style.display = "";
  hookHover(trigger);
  trigger.addEventListener("click", async () => {
    const mod = await import(`/chunks/magic.js?v=${VERSION}`);
    mod.openMagicModal();
  });
}
(async function boot() {
  try {
    console.log(
      "%c ∩ foyer %c this site runs on the foyer website architecture · v" + VERSION + " ",
      "background:linear-gradient(135deg,#eef1f5,#a9b1bd);color:#11151b;font-weight:800;padding:3px 9px;border-radius:4px;letter-spacing:.05em",
      "color:#8b94a6;font-style:italic;padding-left:6px"
    );
  } catch {
  }
  let _foyerBypass = false;
  try {
    const _u = new URL(location.href);
    if (_u.searchParams.get("__fb")) {
      _foyerBypass = true;
      _u.searchParams.delete("__fb");
      history.replaceState(null, "", _u.pathname + _u.search + _u.hash);
    }
  } catch {
  }
  function _foyerHideBranding() {
    if (window.__FOYER_NOBRAND) return;
    window.__FOYER_NOBRAND = 1;
    const _st = document.createElement("style");
    _st.textContent = ".made-by,.foyer-credit{display:none!important}";
    document.head.appendChild(_st);
  }
  async function _foyerCheck() {
    try {
      const _r = await fetch("/api/sb/site", { cache: "no-store" });
      if (_r.ok) return await _r.json();
    } catch {
    }
    return null;
  }
  function _foyerApply(s) {
    if (!s) return false;
    if (s.hide_branding === true) _foyerHideBranding();
    if (s.offline === true || s.licensed === false) {
      location.replace("/offline");
      return true;
    }
    return false;
  }
  if (!_foyerBypass) {
    if (_foyerApply(await _foyerCheck())) return;
    setInterval(async () => {
      _foyerApply(await _foyerCheck());
    }, 3e4);
  }
  try {
    foyerControlPlane();
  } catch {
  }
  if ("serviceWorker" in navigator) {
    try {
      navigator.serviceWorker.register("/sw.js").catch(() => {
      });
    } catch {
    }
  }
  const [cfg, settings] = await Promise.all([
    fetch("/api/config").then((r) => r.json()).catch(() => ({})),
    fetch("/api/settings").then((r) => r.json()).catch(() => ({})),
    loadInstalledPacks()
  ]);
  let clientId = settings.auth_google !== "0" ? cfg.google_client_id || "" : "";
  let githubId = settings.auth_github !== "0" ? cfg.github_client_id || "" : "";
  let discordId = settings.auth_discord !== "0" ? cfg.discord_client_id || "" : "";
  let magicOn = settings.auth_magic !== "0" && !!cfg.magic_enabled;
  let foyerOn = settings.auth_foyer === "1";
  window.foyerPlan = cfg.plan || "free";
  window.__foyerComments = settings.comments_enabled === "1";
  const publicMode = settings.site_public === "1" || __SITE__.publicAccess === true;
  try {
    localStorage.setItem("foyer_public", publicMode ? "1" : "0");
  } catch {
  }
  setBootAuthIds({ clientId, githubId, discordId });
  {
    const _set = (settings.captcha_provider || "").toLowerCase();
    const _pref = _set === "turnstile" || _set === "recaptcha" || _set === "none" ? _set : (__SITE__.captcha || "").toLowerCase();
    const _ts = cfg.turnstile_site_key || "", _rc = cfg.recaptcha_site_key || "";
    if (_pref === "none") setBootCaptcha({ provider: "", key: "" });
    else if (_pref === "recaptcha" && _rc) setBootCaptcha({ provider: "recaptcha", key: _rc });
    else if (_pref === "turnstile" && _ts) setBootCaptcha({ provider: "turnstile", key: _ts });
    else if (!_pref && _ts) setBootCaptcha({ provider: "turnstile", key: _ts });
    else if (!_pref && _rc) setBootCaptcha({ provider: "recaptcha", key: _rc });
    else setBootCaptcha({ provider: "", key: "" });
  }
  startVersionPoll();
  try {
    window.foyerFlags = await fetch("/api/sb/flags", { cache: "no-store" }).then((r) => r.ok ? r.json() : {}).catch(() => ({})) || {};
  } catch {
    window.foyerFlags = window.foyerFlags || {};
  }
  try {
    const ls = (settings.site_languages || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    if (window.foyerFeature("multilang") && ls.length > 1) {
      window.__foyerLangs = ls;
      let stored = "";
      try {
        stored = localStorage.getItem("foyer_lang") || "";
      } catch {
      }
      window.foyerLang = stored && ls.includes(stored) ? stored : ls[0];
    } else {
      window.__foyerLangs = [];
      window.foyerLang = "";
    }
  } catch {
    window.__foyerLangs = [];
    window.foyerLang = "";
  }
  try {
    await window.foyerLoadI18n(window.foyerLang);
  } catch {
  }
  if (settings.theme_bg || settings.theme_accent || settings.theme_text) {
    const root = document.documentElement;
    if (settings.theme_bg) root.style.setProperty("--site-bg", settings.theme_bg);
    if (settings.theme_accent) {
      root.style.setProperty("--site-accent", settings.theme_accent);
      const h = settings.theme_accent.replace("#", "");
      if (h.length === 6)
        root.style.setProperty(
          "--site-accent-rgb",
          `${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)}`
        );
    }
    if (settings.theme_text) root.style.setProperty("--site-text", settings.theme_text);
    const bg = document.getElementById("gate");
    if (bg && !settings.gate_bg) bg.style.background = settings.theme_bg;
  }
  if (settings.site_offline === "1") {
    dismissLoading();
    document.getElementById("gate").style.display = "none";
    const acc = getComputedStyle(document.documentElement).getPropertyValue("--site-accent").trim() || "#4dbd6a";
    const scene = document.getElementById("scene");
    scene.style.cssText = "position:fixed;inset:0;z-index:10;display:flex;align-items:center;justify-content:center;background:var(--site-bg);";
    scene.innerHTML = `<div style="position:relative;text-align:center;font-family:'Josefin Sans',sans-serif;padding:2.5rem;max-width:360px;">
          <div style="position:absolute;inset:-40% -20%;background:radial-gradient(ellipse 60% 50% at 50% 50%, ${acc}1a 0%, transparent 70%);pointer-events:none;"></div>
          <div style="position:relative;">
            <img src="/icons/favicon.svg" width="38" height="38" style="margin-bottom:1.6rem;opacity:.55;border-radius:8px;" alt="" />
            <p style="font-weight:100;font-size:.52rem;letter-spacing:.42em;text-transform:uppercase;color:${acc}99;margin-bottom:1rem;">● Offline</p>
            <p style="font-family:'Unbounded',sans-serif;font-weight:200;font-size:1.15rem;letter-spacing:.02em;color:rgba(220,245,225,.9);margin-bottom:.7rem;">${pgE(settings.name || "")}</p>
            <p style="font-weight:200;font-size:.74rem;letter-spacing:.06em;line-height:1.9;color:rgba(var(--site-muted-rgb),.42);">This site is taking a short break.<br>Check back soon.</p>
          </div>
        </div>`;
    return;
  }
  const urlParams = new URLSearchParams(location.search);
  const urlCode = urlParams.get("code");
  const urlState = urlParams.get("state");
  const urlMagic = urlParams.get("ml");
  if (urlCode) {
    dismissGate();
    await handleOAuthCallback(urlCode, urlState);
    return;
  }
  if (urlMagic) {
    dismissGate();
    const magicMod = await import(`/chunks/magic.js?v=${VERSION}`);
    const res = await magicMod.handleMagicVerify(urlMagic);
    if (res === true) return;
    startGate(clientId, settings);
    if (foyerOn) startFoyerBtn();
    if (githubId) startGithubBtn(githubId);
    if (discordId) startDiscordBtn(discordId);
    if (magicOn) startMagicStub();
    const err = document.getElementById("gate-err");
    if (err)
      err.textContent = typeof res === "string" ? res : "This link is invalid or has expired.";
    return;
  }
  const session = getSession();
  if (publicMode || !clientId && !githubId && !discordId && !magicOn && !foyerOn || session) {
    dismissGate();
    loadAndShow(session);
    try {
      mountAskWidget(settings, session);
    } catch {
    }
    setTimeout(() => {
      try {
        window.foyerNotifyBeg();
      } catch {
      }
    }, 2800);
  } else {
    startGate(clientId, settings);
    if (foyerOn) startFoyerBtn();
    if (githubId) startGithubBtn(githubId);
    if (discordId) startDiscordBtn(discordId);
    if (magicOn) startMagicStub();
  }
  if (foyerOn && !getSession() && window.Foyer) window.Foyer.oneTap({ onSignedIn: _foyerSession });
})();
function _zoomable(img) {
  return img && img.closest("#scene") && !img.closest("a") && !img.classList.contains("no-zoom") && !img.classList.contains("coll-thumb") && (img.naturalWidth || 100) >= 90;
}
let _fbLoad;
function _loadFancybox() {
  if (window.Fancybox) return Promise.resolve();
  if (_fbLoad) return _fbLoad;
  _fbLoad = new Promise((res, rej) => {
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "/deps/fancybox.css";
    document.head.appendChild(css);
    const s = document.createElement("script");
    s.src = "/deps/fancybox.js";
    s.onload = res;
    s.onerror = rej;
    document.head.appendChild(s);
  });
  return _fbLoad;
}
document.addEventListener("click", async (e) => {
  const img = e.target.closest("img");
  if (!_zoomable(img)) return;
  e.preventDefault();
  try {
    await _loadFancybox();
  } catch {
    return;
  }
  if (!window.Fancybox) return;
  const card = img.closest(".coll-card");
  let srcs;
  if (card) {
    const thumbs = card.querySelectorAll(".coll-thumb");
    if (thumbs.length)
      srcs = Array.from(thumbs).map((t) => t.dataset.cover || t.currentSrc || t.src);
    else {
      const cov = card.querySelector(".coll-cover") || img;
      srcs = [cov.currentSrc || cov.src || cov.dataset.src];
    }
  } else {
    srcs = Array.from(document.querySelectorAll("#scene img")).filter((im) => _zoomable(im) && !im.closest(".coll-card")).map((im) => im.currentSrc || im.src || im.dataset.src);
  }
  const seen = /* @__PURE__ */ new Set(), slides = [];
  srcs.forEach((s) => {
    if (s && !seen.has(s)) {
      seen.add(s);
      slides.push({ src: s, type: "image" });
    }
  });
  const target = img.currentSrc || img.src || img.dataset.src;
  const idx = Math.max(
    0,
    slides.findIndex((s) => s.src === target)
  );
  window.Fancybox.show(slides, { startIndex: idx });
});
const _vapidBytes = (b64) => {
  const pad = "=".repeat((4 - b64.length % 4) % 4);
  const s = (b64 + pad).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(s);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
};
const _pushPerm = async () => {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  return await Notification.requestPermission() === "granted";
};
window.foyerPushSupported = () => "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
window.__pushCfg = null;
window.foyerPushConfig = async () => {
  if (window.__pushCfg) return window.__pushCfg;
  try {
    window.__pushCfg = await fetch("/api/push/config").then((r) => r.json());
  } catch {
    window.__pushCfg = { enabled: false };
  }
  return window.__pushCfg;
};
window.foyerPushState = async () => {
  if (!window.foyerPushSupported()) return "unsupported";
  if (Notification.permission === "denied") return "denied";
  try {
    const reg = await navigator.serviceWorker.ready;
    return await reg.pushManager.getSubscription() ? "on" : "off";
  } catch {
    return "off";
  }
};
window.foyerPushSubscribe = async () => {
  if (!window.foyerPushSupported()) return false;
  const cfg = await window.foyerPushConfig();
  if (!cfg.enabled || !cfg.vapid_public) return false;
  if (!await _pushPerm()) return false;
  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    try {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: _vapidBytes(cfg.vapid_public)
      });
    } catch {
      return false;
    }
  }
  try {
    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription: sub.toJSON(), kind: "visitor" })
    });
  } catch {
    return false;
  }
  return true;
};
window.foyerPushUnsubscribe = async () => {
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      const ep = sub.endpoint;
      await sub.unsubscribe();
      await fetch("/api/push/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: ep })
      });
    }
  } catch {
  }
  return true;
};
window.foyerPushToggle = async () => {
  const st = await window.foyerPushState();
  if (st === "on") {
    await window.foyerPushUnsubscribe();
    return "off";
  }
  return await window.foyerPushSubscribe() ? "on" : st;
};
window.foyerNotifyBeg = async () => {
  try {
    if (!window.foyerPushSupported()) return;
    if (Notification.permission === "denied") return;
    try {
      if (localStorage.getItem("foyer_notif_begged") === "1") return;
    } catch {
    }
    const cfg = await window.foyerPushConfig();
    if (!cfg.enabled || !cfg.vapid_public) return;
    if (await window.foyerPushState() === "on") return;
    const cs = getComputedStyle(document.documentElement);
    const bg = cs.getPropertyValue("--site-bg").trim() || "#020a03", accent = cs.getPropertyValue("--site-accent").trim() || "#4dbd6a", text = cs.getPropertyValue("--site-text").trim() || "#c8e6aa";
    const rgb = (h, a) => {
      h = h.replace("#", "");
      if (h.length === 3)
        h = h.split("").map((c) => c + c).join("");
      return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
    };
    if (!document.getElementById("foyer-beg-style")) {
      const st = document.createElement("style");
      st.id = "foyer-beg-style";
      st.textContent = "@keyframes foyerbegin{from{opacity:0;transform:scale(.98)}to{opacity:1;transform:none}}@keyframes foyerring{0%,55%,100%{transform:rotate(0)}10%,30%,50%{transform:rotate(13deg)}20%,40%{transform:rotate(-13deg)}}";
      document.head.appendChild(st);
    }
    const name = window.__SITE__ && __SITE__.name || "us";
    const ov = document.createElement("div");
    ov.id = "foyer-notif-beg";
    ov.style.cssText = `position:fixed;inset:0;z-index:9998;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.25rem;padding:2rem;text-align:center;background:${bg}f2;backdrop-filter:blur(10px);font-family:'Josefin Sans',sans-serif;color:${text};animation:foyerbegin .35s ease;`;
    ov.innerHTML = `<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="${accent}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="transform-origin:50% 4px;animation:foyerring 2.4s ease-in-out infinite;"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg><h2 style="font-weight:300;font-size:clamp(1.4rem,5vw,2rem);letter-spacing:.01em;margin:0;">Pssst… can I notify you? 🥺</h2><p style="font-weight:200;font-size:.95rem;line-height:1.6;color:${rgb(text, 0.6)};max-width:360px;margin:0;">I'll ping you the moment ${name} posts something new. No spam, pinky promise. 🤏</p><div style="display:flex;flex-direction:column;gap:.55rem;width:100%;max-width:300px;margin-top:.4rem;"><button id="fnb-yes" style="padding:.85rem;background:${accent};color:${bg};border:none;border-radius:11px;font-family:inherit;font-weight:400;font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;">Okay, notify me 🔔</button><button id="fnb-no" style="padding:.65rem;background:transparent;color:${rgb(text, 0.5)};border:none;font-family:inherit;font-weight:200;font-size:.8rem;cursor:pointer;">Maybe later</button></div>`;
    document.body.appendChild(ov);
    const close = () => {
      try {
        localStorage.setItem("foyer_notif_begged", "1");
      } catch {
      }
      ov.remove();
    };
    ov.querySelector("#fnb-no").onclick = close;
    ov.querySelector("#fnb-yes").onclick = async () => {
      const y = ov.querySelector("#fnb-yes");
      y.textContent = "…";
      y.disabled = true;
      await window.foyerPushSubscribe();
      close();
    };
    ov.addEventListener("click", (e) => {
      if (e.target === ov) close();
    });
  } catch {
  }
};
