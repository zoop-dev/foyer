async function serverSignOut(session) {
  try {
    await fetch("/api/auth/signout", {
      method: "POST",
      headers: window.foyerSessionHeaders(session),
    });
  } catch {}
}
function relTime(ts) {
  if (!ts) return "";
  const t = new Date(String(ts).replace(" ", "T") + "Z").getTime();
  if (isNaN(t)) return "";
  const diff = Date.now() - t;
  const m = Math.round(diff / 6e4);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr${h === 1 ? "" : "s"} ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d} day${d === 1 ? "" : "s"} ago`;
  return new Date(t).toLocaleDateString();
}
let _acctBuilt = false;
function buildAccountPanel() {
  if (_acctBuilt) return document.getElementById("acct-modal");
  _acctBuilt = true;
  const modal = document.createElement("div");
  modal.id = "acct-modal";
  modal.innerHTML = `\n        <div class="acct-card">\n          <button type="button" class="acct-close" aria-label="Close">&times;</button>\n          <div class="acct-head">\n            <img class="acct-avatar" id="acctAvatar" alt="" />\n            <div class="acct-id">\n              <div class="acct-name" id="acctName"></div>\n              <div class="acct-email" id="acctEmail"></div>\n              <div class="acct-tags" id="acctTags"></div>\n            </div>\n          </div>\n          <div class="acct-meta" id="acctMeta"></div>\n\n          <div class="acct-sec">\n            <div class="acct-sec-head"><span>Preferences</span></div>\n            <label class="acct-pref">\n              <span>Navigation position</span>\n              <select id="acctNavPos">\n                <option value="">Site default</option>\n                <option value="top">Top</option>\n                <option value="bottom">Bottom</option>\n                <option value="left">Left side</option>\n                <option value="right">Right side</option>\n              </select>\n            </label>\n          </div>\n\n          <div class="acct-sec" id="acctFoyerSec" style="display:none;">\n            <div class="acct-sec-head"><span>User settings ${window.__FOYER_NOBRAND ? "" : '<span style="opacity:.45;font-weight:200;">· powered by Foyer</span>'}</span></div>\n            <label class="acct-pref"><span>Display name</span><input type="text" id="acctFoyerName" placeholder="Your name" style="background:rgba(255,255,255,.05);border:1px solid rgba(var(--site-accent-rgb),.2);color:inherit;font:inherit;font-size:.8rem;padding:.4rem .6rem;border-radius:6px;width:165px;outline:none;" /></label>\n            <label class="acct-pref"><span>Avatar URL</span><input type="url" id="acctFoyerAvatar" placeholder="https://…" style="background:rgba(255,255,255,.05);border:1px solid rgba(var(--site-accent-rgb),.2);color:inherit;font:inherit;font-size:.8rem;padding:.4rem .6rem;border-radius:6px;width:165px;outline:none;" /></label>\n            <div style="display:flex;align-items:center;gap:.7rem;margin-top:.55rem;">\n              <button type="button" class="acct-link" id="acctFoyerSave">Save changes</button>\n              <span id="acctFoyerMsg" style="font-size:.66rem;color:rgba(var(--site-muted-rgb),.65);"></span>\n            </div>\n          </div>\n\n          <div class="acct-sec">\n            <div class="acct-sec-head">\n              <span>Active sessions</span>\n              <button type="button" class="acct-link" id="acctRevokeOthers" style="display:none;">Sign out others</button>\n            </div>\n            <div id="acctSessions" class="acct-sessions"><p class="acct-loading">Loading…</p></div>\n          </div>\n\n          <div class="acct-actions">\n            <a href="/admin" id="acctAdmin" class="acct-admin-btn" style="display:none;">Admin panel</a>\n            <button type="button" class="acct-signout-btn" id="acctSignOut">Sign out</button>\n          </div>\n        </div>`;
  document.body.appendChild(modal);
  const close = () => modal.classList.remove("show");
  modal.querySelector(".acct-close").addEventListener("click", close);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("show")) close();
  });
  modal.querySelector("#acctSignOut").addEventListener("click", async (e) => {
    e.currentTarget.disabled = true;
    await serverSignOut(window.foyerGetSession());
    localStorage.removeItem(window.foyerSessionKey);
    location.reload();
  });
  modal.querySelector("#acctFoyerSave").addEventListener("click", async (e) => {
    const b = e.currentTarget,
      msg = document.getElementById("acctFoyerMsg");
    if (!window.Foyer || typeof window.Foyer.updateProfile !== "function") {
      msg.textContent = "Foyer is still loading — refresh and try again.";
      return;
    }
    b.disabled = true;
    msg.textContent = "Saving…";
    const res = await window.Foyer.updateProfile({
      name: document.getElementById("acctFoyerName").value.trim(),
      avatar: document.getElementById("acctFoyerAvatar").value.trim(),
    }).catch(() => null);
    b.disabled = false;
    if (res && res.ok) {
      msg.textContent = "Saved ✓";
      document.getElementById("acctName").textContent =
        res.name || document.getElementById("acctName").textContent;
      const a = document.getElementById("acctAvatar");
      if (res.avatar) {
        a.src = res.avatar;
        a.style.display = "";
      }
    } else {
      msg.textContent = (res && res.error) || "Could not save.";
    }
  });
  modal.querySelector("#acctRevokeOthers").addEventListener("click", async (e) => {
    const b = e.currentTarget;
    b.disabled = true;
    b.textContent = "Signing out…";
    await fetch("/api/account/sessions/revoke-others", {
      method: "POST",
      headers: window.foyerSessionHeaders(window.foyerGetSession()),
    }).catch(() => {});
    b.disabled = false;
    b.textContent = "Sign out others";
    loadAccountSessions();
  });
  const navSel = modal.querySelector("#acctNavPos");
  try {
    navSel.value = localStorage.getItem("foyer_nav_pref") || "";
  } catch {}
  navSel.addEventListener("change", () => {
    try {
      if (navSel.value) localStorage.setItem("foyer_nav_pref", navSel.value);
      else localStorage.removeItem("foyer_nav_pref");
    } catch {}
    window.foyerLoadNav(window.foyerGetSession());
  });
  return modal;
}
async function loadAccountSessions() {
  const wrap = document.getElementById("acctSessions");
  const data = await fetch("/api/account/sessions", {
    headers: window.foyerSessionHeaders(window.foyerGetSession()),
  })
    .then((r) => r.json())
    .catch(() => null);
  if (!data?.sessions) {
    wrap.innerHTML = '<p class="acct-loading">Couldn\'t load sessions.</p>';
    return;
  }
  const others = data.sessions.filter((s) => !s.current).length;
  const ro = document.getElementById("acctRevokeOthers");
  ro.style.display = others > 0 ? "" : "none";
  wrap.innerHTML = data.sessions
    .map(
      (s) =>
        `\n        <div class="acct-session${s.current ? " cur" : ""}">\n          <div class="acct-session-info">\n            <div class="acct-session-dev">${window.foyerEscHtml(s.device)}${s.current ? ' <span class="acct-this">this device</span>' : ""}</div>\n            <div class="acct-session-time">Active ${window.foyerEscHtml(relTime(s.last_seen))} · since ${window.foyerEscHtml(relTime(s.created_at))}</div>\n          </div>\n          ${s.current ? "" : `<button type="button" class="acct-revoke" data-sid="${window.foyerEscAttr(s.sid)}" title="Sign out this device">&times;</button>`}\n        </div>`
    )
    .join("");
  wrap.querySelectorAll(".acct-revoke").forEach((b) => {
    window.foyerHookHover(b);
    b.addEventListener("click", async () => {
      b.disabled = true;
      await fetch("/api/account/sessions/revoke", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...window.foyerSessionHeaders(window.foyerGetSession()),
        },
        body: JSON.stringify({ sid: b.dataset.sid }),
      }).catch(() => {});
      loadAccountSessions();
    });
  });
  wrap.querySelectorAll("a, button").forEach(window.foyerHookHover);
}
async function openAccountPanel() {
  const modal = buildAccountPanel();
  modal.classList.add("show");
  const session = window.foyerGetSession();
  document.getElementById("acctName").textContent = session?.name || session?.email || "";
  document.getElementById("acctEmail").textContent = session?.email || "";
  const av = document.getElementById("acctAvatar");
  av.src = session?.picture || "";
  av.style.display = session?.picture ? "" : "none";
  document.getElementById("acctTags").innerHTML = "";
  document.getElementById("acctMeta").textContent = "";
  const acc = await fetch("/api/account", { headers: window.foyerSessionHeaders(session) })
    .then((r) => r.json())
    .catch(() => null);
  if (acc && !acc.error) {
    document.getElementById("acctName").textContent = acc.name || acc.email;
    document.getElementById("acctEmail").textContent = acc.email;
    av.src = acc.picture || "";
    av.style.display = acc.picture ? "" : "none";
    const tags = [`<span class="acct-tag">${window.foyerEscHtml(acc.provider)}</span>`];
    if (acc.role === "owner" || acc.role === "admin")
      tags.push(`<span class="acct-tag acct-tag-role">${window.foyerEscHtml(acc.role)}</span>`);
    document.getElementById("acctTags").innerHTML = tags.join("");
    document.getElementById("acctMeta").textContent =
      `Member since ${relTime(acc.first_seen)} · ${acc.visit_count} visit${acc.visit_count === 1 ? "" : "s"}`;
    const adminBtn = document.getElementById("acctAdmin");
    if (acc.role === "owner" || acc.role === "admin") {
      adminBtn.style.display = "";
      window.foyerHookHover(adminBtn);
    }
    if (acc.provider === "foyer" && window.Foyer && typeof window.Foyer.getProfile === "function") {
      document.getElementById("acctFoyerSec").style.display = "";
      document.getElementById("acctFoyerMsg").textContent = "";
      window.Foyer.getProfile().then((p) => {
        document.getElementById("acctFoyerName").value =
          (p && p.name) || (acc.name !== acc.email.split("@")[0] ? acc.name : "") || "";
        document.getElementById("acctFoyerAvatar").value = (p && p.avatar) || acc.picture || "";
      });
    }
  }
  loadAccountSessions();
}
export { openAccountPanel };
