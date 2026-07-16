const VERSION = __VERSION__;
try {
  window.foyerLang = localStorage.getItem("foyer_lang") || "";
} catch {
  window.foyerLang = "";
}
window.__i18nAll = null;
window.__i18n = null;
function t(key) {
  return (
    (window.__i18n && window.__i18n[key]) ||
    (window.__i18nAll && window.__i18nAll.en && window.__i18nAll.en[key]) ||
    key
  );
}
window.foyerT = t;
window.foyerLoadI18n = async function (lang) {
  lang = lang || "en";
  if (!window.__i18nAll) {
    try {
      const c = localStorage.getItem("foyer_i18n_all");
      if (c) window.__i18nAll = JSON.parse(c);
    } catch {}
    try {
      const d = await fetch("/assets/i18n.json").then((r) => r.json());
      if (d) {
        window.__i18nAll = d;
        try {
          localStorage.setItem("foyer_i18n_all", JSON.stringify(d));
        } catch {}
      }
    } catch {}
  }
  window.__i18n = (window.__i18nAll && (window.__i18nAll[lang] || window.__i18nAll.en)) || null;
};
try {
  const _bp = new URLSearchParams(location.search).get("beta");
  if (_bp === "1") localStorage.setItem("foyer_beta", "1");
  else if (_bp === "0") localStorage.removeItem("foyer_beta");
  window.foyerBeta = localStorage.getItem("foyer_beta") === "1";
} catch {
  window.foyerBeta = false;
}
window.foyerFeature = function (key) {
  if (window.foyerBeta) return true;
  const v = (window.foyerFlags || {})[key];
  return v === true || v === 1 || v === "1" || v === "true" || v === "on";
};
if (window.foyerBeta) {
  const _betaBadge = () => {
    if (!document.body || document.getElementById("foyer-beta-badge")) return;
    const b = document.createElement("button");
    b.id = "foyer-beta-badge";
    b.textContent = "β BETA";
    b.title = "Beta preview is on for this device — click to exit";
    b.style.cssText =
      "position:fixed;bottom:10px;left:50%;transform:translateX(-50%);z-index:9997;background:#7fa6d8;color:#070a0e;border:none;border-radius:999px;font:600 .58rem/1 system-ui,sans-serif;letter-spacing:.14em;padding:.42rem .75rem;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.35);";
    b.onclick = () => {
      try {
        localStorage.removeItem("foyer_beta");
      } catch {}
      location.href = location.pathname;
    };
    document.body.appendChild(b);
  };
  if (document.body) _betaBadge();
  else document.addEventListener("DOMContentLoaded", _betaBadge);
}
try {
  if (!localStorage.getItem("foyer_cleared_v1")) {
    localStorage.clear();
    localStorage.setItem("foyer_cleared_v1", "1");
  }
} catch {}
function hookHover() {}
(function acctStub() {
  const badge = document.getElementById("userBadge");
  if (!badge) return;
  badge.style.cursor = "pointer";
  badge.addEventListener("click", async () => {
    const mod = await import(`/chunks/account.js?v=${VERSION}`);
    mod.openAccountPanel();
  });
})();
const SESSION_KEY = "foyer_session";
const SESSION_TTL = 7 * 24 * 60 * 60 * 1e3;
try {
  if (new URLSearchParams(location.search).get("admin_return") === "1")
    sessionStorage.setItem("foyer_admin_return", "1");
} catch {}
(function () {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    const hasSession = s && Date.now() - s.ts <= SESSION_TTL;
    const hasOAuthCode = location.search.includes("code=");
    const isPublic = localStorage.getItem("foyer_public") === "1" || __SITE__.publicAccess === true;
    if (!hasSession && !hasOAuthCode && !isPublic) {
      const gate = document.getElementById("gate");
      gate.style.opacity = "1";
      gate.style.pointerEvents = "auto";
    }
  } catch {}
})();
function getSession() {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    if (!s || Date.now() - s.ts > SESSION_TTL) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}
function setSession(data) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ ...data, ts: Date.now() }));
}
function dismissLoading() {
  const el = document.getElementById("loading-screen");
  if (el) {
    el.classList.add("out");
    setTimeout(() => el.remove(), 520);
  }
}
function dismissGate() {
  const gate = document.getElementById("gate");
  gate.style.transition = "opacity 0.55s";
  gate.style.opacity = "0";
  setTimeout(() => {
    gate.style.display = "none";
  }, 580);
}
function showFallback(session) {
  dismissLoading();
  const scene = document.getElementById("scene");
  scene.style.display = "flex";
  if (session) {
    document.getElementById("userAvatar").src = session.picture || "";
    document.getElementById("userAvatar").style.display = session.picture ? "" : "none";
    document.getElementById("userNameText").textContent = session.name || session.email || "";
    document.getElementById("userBadge").style.display = "flex";
  }
}
function escHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escAttr(s) {
  return String(s).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
window.foyerGetSession = getSession;
window.foyerSetSession = setSession;
window.foyerSessionKey = SESSION_KEY;
window.foyerDismissGate = dismissGate;
window.foyerHookHover = hookHover;
window.foyerEscHtml = escHtml;
window.foyerEscAttr = escAttr;
function pgRgb(hex, a) {
  const h = hex.replace("#", "");
  return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
}
function pgE(s) {
  return foyerIconText(
    String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
  );
}
marked.use({ breaks: true, gfm: true });
const md = (s) =>
  foyerIconText(marked.parse(String(s || "")).replace(/<\/a>(?=[A-Za-z0-9])/g, "</a> "));
