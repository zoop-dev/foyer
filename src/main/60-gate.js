import { dismissGate, dismissLoading, hookHover, setSession } from "./10-core.js";
import { loadAndShow } from "./40-pages.js";
function applyGateSettings(settings) {
  const gate = document.getElementById("gate");
  if (settings.gate_bg) gate.style.background = settings.gate_bg;
  const titleEl = document.querySelector(".gate-title");
  const subEl = document.querySelector(".gate-sub");
  if (titleEl) {
    if (settings.gate_title) titleEl.textContent = settings.gate_title;
    if (settings.gate_title_font)
      titleEl.style.fontFamily = `'${settings.gate_title_font}', sans-serif`;
  }
  if (subEl) {
    if (settings.gate_sub) subEl.textContent = settings.gate_sub;
    if (settings.gate_sub_font) subEl.style.fontFamily = `'${settings.gate_sub_font}', sans-serif`;
  }
  if (settings.gate_btn) {
    const btnText = document.getElementById("googleBtnText");
    if (btnText) btnText.textContent = settings.gate_btn;
  }
  if (settings.gate_accent) {
    const btn = document.getElementById("googleSignInBtn");
    if (btn) btn.style.setProperty("--gate-accent", settings.gate_accent);
  }
}
function unlockGateBtns(settings) {
  const wrap = document.getElementById("gate-btns");
  const subEl = document.querySelector(".gate-sub");
  if (wrap) wrap.style.display = "";
  if (subEl && settings?.gate_sub_unlocked) subEl.textContent = settings.gate_sub_unlocked;
}
export function startGate(clientId, settings) {
  const name = settings.name || __SITE__.name;
  document.title = name;
  document.querySelectorAll(".site-name").forEach((el) => el.textContent = name);
  applyGateSettings(settings);
  dismissLoading();
  const gate = document.getElementById("gate");
  gate.style.opacity = "1";
  gate.style.pointerEvents = "auto";
  const _capErr = () => {
    const e = document.getElementById("gate-err");
    if (e) e.textContent = "Bot check failed — refresh to retry.";
  };
  const _embed = document.getElementById("captcha-embed");
  if (_bootCaptcha.provider === "turnstile" && _bootCaptcha.key) {
    const renderTs = () => {
      try {
        window.turnstile.render(_embed, {
          sitekey: _bootCaptcha.key,
          theme: "dark",
          callback: (t) => {
            _captchaToken = t;
            unlockGateBtns(settings);
          },
          "error-callback": _capErr
        });
      } catch {
        unlockGateBtns(settings);
      }
    };
    if (window.turnstile) renderTs();
    else {
      const ts = document.createElement("script");
      ts.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      ts.async = true;
      ts.defer = true;
      ts.onload = renderTs;
      ts.onerror = () => unlockGateBtns(settings);
      document.head.appendChild(ts);
    }
  } else if (_bootCaptcha.provider === "recaptcha" && _bootCaptcha.key) {
    const renderRc = () => {
      try {
        window.grecaptcha.render(_embed, {
          sitekey: _bootCaptcha.key,
          theme: "dark",
          callback: (t) => {
            _captchaToken = t;
            unlockGateBtns(settings);
          },
          "error-callback": _capErr
        });
      } catch {
        unlockGateBtns(settings);
      }
    };
    if (window.grecaptcha && window.grecaptcha.render) renderRc();
    else {
      const rc = document.createElement("script");
      rc.src = "https://www.google.com/recaptcha/api.js?render=explicit";
      rc.async = true;
      rc.defer = true;
      rc.onload = () => {
        if (window.grecaptcha && window.grecaptcha.render) renderRc();
        else if (window.grecaptcha && window.grecaptcha.ready) window.grecaptcha.ready(renderRc);
        else unlockGateBtns(settings);
      };
      rc.onerror = () => unlockGateBtns(settings);
      document.head.appendChild(rc);
    }
  } else {
    unlockGateBtns(settings);
  }
  const s = document.createElement("script");
  s.src = "https://accounts.google.com/gsi/client";
  s.async = true;
  s.onload = () => {
    const handleCredential = async (resp) => {
      document.getElementById("gate-err").textContent = "";
      const data = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resp.credential })
      }).then((r) => r.json()).catch(() => null);
      if (data?.ok) {
        const session = {
          email: data.email,
          name: data.name,
          picture: data.picture,
          session_token: data.session_token
        };
        setSession(session);
        dismissGate();
        loadAndShow(session);
      } else {
        document.getElementById("gate-err").textContent = data?.error === "account_banned" ? "Your access to this site has been revoked." : data?.error === "not_allowed" ? "This site is invite-only — your email isn't on the guest list." : data?.error === "vpn_blocked" ? "Sign-ups over a VPN or proxy aren't allowed. Please turn it off and try again." : data?.error === "signup_limited" ? "Too many recent sign-ups from your email domain. Please try again later." : data?.error || "Sign-in failed. Try again.";
      }
    };
    window.google.accounts.id.initialize({ client_id: clientId, callback: handleCredential });
    const hiddenGsi = document.createElement("div");
    hiddenGsi.id = "gsi-hidden";
    hiddenGsi.style.cssText = "position:absolute;top:-9999px;visibility:hidden;";
    document.body.appendChild(hiddenGsi);
    window.google.accounts.id.renderButton(hiddenGsi, {
      type: "standard",
      theme: "outline",
      size: "large"
    });
    const triggerGsi = () => document.querySelector('#gsi-hidden [role="button"]')?.click();
    const btn = document.getElementById("googleSignInBtn");
    btn.addEventListener("click", triggerGsi);
    hookHover(btn);
    window.google.accounts.id.prompt();
  };
  document.head.appendChild(s);
}
export let _bootClientId = "";
export let _bootCaptcha = { provider: "", key: "" };
let _captchaToken = "";
export function getCaptchaToken() {
  return _captchaToken;
}
export let _bootGithubId = "";
export let _bootDiscordId = "";
export const DISCORD_REDIRECT = location.origin + "/";
export function setBootAuthIds({ clientId, githubId, discordId } = {}) {
  if (clientId !== void 0) _bootClientId = clientId;
  if (githubId !== void 0) _bootGithubId = githubId;
  if (discordId !== void 0) _bootDiscordId = discordId;
}
export function setBootCaptcha(captcha) {
  _bootCaptcha = captcha;
}
export async function handleOAuthCallback(code, state) {
  let endpoint, body, errMsg;
  if (state === "foyer") {
    let verifier = "";
    try {
      verifier = sessionStorage.getItem("foyer_pkce") || "";
      sessionStorage.removeItem("foyer_pkce");
    } catch {
    }
    endpoint = "/api/auth/foyer";
    body = { code, code_verifier: verifier };
    errMsg = "Foyer sign-in failed. Try again.";
  } else if (state === "discord") {
    endpoint = "/api/auth/discord";
    body = { code, redirect_uri: DISCORD_REDIRECT };
    errMsg = "Discord sign-in failed. Try again.";
  } else {
    endpoint = "/api/auth/github";
    body = { code };
    errMsg = "GitHub sign-in failed. Try again.";
  }
  const data = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  }).then((r) => r.json()).catch(() => null);
  const url = new URL(location.href);
  url.searchParams.delete("code");
  url.searchParams.delete("state");
  url.searchParams.delete("foyer_code");
  history.replaceState(null, "", url.pathname + url.search + url.hash);
  if (data?.ok) {
    const session = {
      email: data.email,
      name: data.name,
      picture: data.picture,
      session_token: data.session_token
    };
    setSession(session);
    dismissGate();
    loadAndShow(session);
    return true;
  } else {
    const err = document.getElementById("gate-err");
    if (err)
      err.textContent = data?.error === "account_banned" ? "Your access to this site has been revoked." : data?.error === "not_allowed" ? "This site is invite-only — your email isn't on the guest list." : data?.error === "vpn_blocked" ? "Sign-ups over a VPN or proxy aren't allowed. Please turn it off and try again." : data?.error === "signup_limited" ? "Too many recent sign-ups from your email domain. Please try again later." : data?.error || errMsg;
    return false;
  }
}
export function startGithubBtn(githubClientId) {
  const btn = document.getElementById("githubSignInBtn");
  if (!btn) return;
  btn.style.display = "";
  btn.addEventListener("click", () => {
    const params = new URLSearchParams({
      client_id: githubClientId,
      redirect_uri: location.origin,
      scope: "user:email",
      state: "github"
    });
    location.href = `https://github.com/login/oauth/authorize?${params}`;
  });
  hookHover(btn);
}
export function startDiscordBtn(discordClientId) {
  const btn = document.getElementById("discordSignInBtn");
  if (!btn) return;
  btn.style.display = "";
  btn.addEventListener("click", () => {
    const params = new URLSearchParams({
      client_id: discordClientId,
      redirect_uri: DISCORD_REDIRECT,
      response_type: "code",
      scope: "identify email",
      state: "discord"
    });
    location.href = `https://discord.com/oauth2/authorize?${params}`;
  });
  hookHover(btn);
}
export function _foyerSession(data) {
  if (data && data.ok) {
    const session = {
      email: data.email,
      name: data.name,
      picture: data.picture,
      session_token: data.session_token
    };
    setSession(session);
    dismissGate();
    loadAndShow(session);
  } else {
    const err = document.getElementById("gate-err");
    if (err)
      err.textContent = data?.error === "account_banned" ? "Your access to this site has been revoked." : data?.error === "not_allowed" ? "This site is invite-only — your email isn't on the guest list." : data?.error === "vpn_blocked" ? "Sign-ups over a VPN or proxy aren't allowed." : data?.error === "signup_limited" ? "Too many recent sign-ups from your email domain. Please try again later." : "Foyer sign-in failed. Try again.";
  }
}
function foyerSignIn() {
  const err = document.getElementById("gate-err");
  if (!window.Foyer) {
    if (err) err.textContent = "Foyer is still loading — try again in a moment.";
    return;
  }
  window.Foyer.signIn({ exchangeUrl: "/api/auth/foyer" }).then(_foyerSession).catch((e) => {
    if (e && e.error === "popup_blocked" && err)
      err.textContent = "Please allow popups to sign in with Foyer.";
  });
}
export function startFoyerBtn() {
  const btn = document.getElementById("foyerSignInBtn");
  if (!btn) return;
  btn.style.display = "";
  btn.addEventListener("click", () => foyerSignIn());
  hookHover(btn);
}
const _awBtnStyle = "display:flex;align-items:center;justify-content:center;gap:.65rem;width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);color:rgba(220,245,220,.82);font-family:'Josefin Sans',sans-serif;font-weight:300;font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;padding:.82rem 1.6rem;cursor:pointer;margin-top:.6rem;";
export function showAuthWall() {
  const scene = document.getElementById("scene");
  scene.style.cssText = "position:fixed;inset:0;z-index:10;display:flex;align-items:center;justify-content:center;background:var(--site-bg);";
  scene.innerHTML = `<div style="text-align:center;font-family:'Josefin Sans',sans-serif;padding:2.5rem;max-width:340px;">
        <p style="font-weight:100;font-size:.52rem;letter-spacing:.42em;text-transform:uppercase;color:rgba(var(--site-accent-rgb),.38);margin-bottom:.9rem;">Access Required</p>
        <p style="font-weight:200;font-size:1rem;letter-spacing:.06em;color:rgba(220,245,225,.82);margin-bottom:.55rem;">Sign in to continue</p>
        <p style="font-weight:100;font-size:.68rem;letter-spacing:.08em;line-height:1.75;color:rgba(var(--site-muted-rgb),.38);margin-bottom:2rem;">You need to authenticate to view this site.</p>
        ${_bootClientId ? '<div id="authWallGoogleBtn" style="display:flex;justify-content:center;margin-bottom:.6rem;"></div>' : ""}
        ${_bootGithubId ? `<button id="authWallGithubBtn" style="${_awBtnStyle}"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>Continue with GitHub</button>` : ""}
        ${_bootDiscordId ? `<button id="authWallDiscordBtn" style="${_awBtnStyle}"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>Continue with Discord</button>` : ""}
      </div>`;
  if (_bootClientId && window.google?.accounts?.id) {
    window.google.accounts.id.renderButton(document.getElementById("authWallGoogleBtn"), {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "rectangular"
    });
  }
  if (_bootGithubId) {
    document.getElementById("authWallGithubBtn")?.addEventListener("click", () => {
      const params = new URLSearchParams({
        client_id: _bootGithubId,
        redirect_uri: location.origin,
        scope: "user:email",
        state: "github"
      });
      location.href = `https://github.com/login/oauth/authorize?${params}`;
    });
  }
  if (_bootDiscordId) {
    document.getElementById("authWallDiscordBtn")?.addEventListener("click", () => {
      const params = new URLSearchParams({
        client_id: _bootDiscordId,
        redirect_uri: DISCORD_REDIRECT,
        response_type: "code",
        scope: "identify email",
        state: "discord"
      });
      location.href = `https://discord.com/oauth2/authorize?${params}`;
    });
  }
}
