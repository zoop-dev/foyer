import { dismissGate, setSession } from "./10-core.js";
import { loadAndShow } from "./40-pages.js";
import { sessionHeaders } from "./30-net.js";
import { getCaptchaToken } from "./60-gate.js";
function promptName(session, done) {
  const el = document.createElement("div");
  el.id = "ml-name-modal";
  el.style.cssText = "position:fixed;inset:0;z-index:100002;display:flex;align-items:center;justify-content:center;padding:1.5rem;background:rgba(2,8,3,.78);backdrop-filter:blur(6px);";
  el.innerHTML = `<div class="ml-card" style="max-width:360px;">
          <h3>Welcome! What's your name?</h3>
          <p class="ml-desc">This is how you'll appear on the site. You can change it anytime.</p>
          <form id="mlNameForm" autocomplete="on">
            <input id="mlNameInput" class="ml-input" type="text" autocomplete="name" placeholder="Your name" required maxlength="80" />
            <button type="submit" class="ml-submit" id="mlNameSave">Continue →</button>
          </form>
        </div>`;
  document.body.appendChild(el);
  const input = el.querySelector("#mlNameInput");
  setTimeout(() => input.focus(), 120);
  el.querySelector("#mlNameForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = (input.value || "").trim();
    if (!name) return;
    const btn = el.querySelector("#mlNameSave");
    btn.disabled = true;
    btn.textContent = "Saving…";
    await fetch("/api/account/name", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...sessionHeaders(session) },
      body: JSON.stringify({ name })
    }).catch(() => {
    });
    session.name = name;
    setSession(session);
    const nt = document.getElementById("userNameText");
    if (nt) nt.textContent = name;
    el.remove();
    done && done();
  });
}
function magicContinue(session) {
  dismissGate();
  if (session.needs_name) promptName(session, () => loadAndShow(session));
  else loadAndShow(session);
}
function showMagicApprovedScreen(session) {
  const acc = getComputedStyle(document.documentElement).getPropertyValue("--site-accent").trim() || "#4dbd6a";
  const el = document.createElement("div");
  el.id = "ml-approved";
  el.style.cssText = 'position:fixed;inset:0;z-index:100001;background:#070b07;display:flex;align-items:center;justify-content:center;font-family:"Josefin Sans",sans-serif;padding:2rem;';
  el.innerHTML = `
        <div style="text-align:center;max-width:340px;">
          <div style="width:64px;height:64px;margin:0 auto 1.6rem;border-radius:50%;border:1.5px solid ${acc}55;display:flex;align-items:center;justify-content:center;">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="${acc}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          </div>
          <p style="font-family:'Unbounded',sans-serif;font-weight:200;font-size:1.05rem;color:rgba(238,247,239,.95);margin-bottom:.7rem;">You're authenticated</p>
          <p style="font-weight:200;font-size:.76rem;letter-spacing:.03em;line-height:1.85;color:rgba(180,230,190,.5);margin-bottom:2rem;">Head back to the device where you started — it'll sign in automatically. You can close this tab.</p>
          <button id="ml-continue-here" style="font-family:'Josefin Sans',sans-serif;font-weight:300;font-size:.66rem;letter-spacing:.2em;text-transform:uppercase;padding:.78rem 1.8rem;border:1px solid ${acc}59;background:transparent;color:${acc}cc;cursor:pointer;border-radius:8px;">Continue on this device</button>
        </div>`;
  document.body.appendChild(el);
  el.querySelector("#ml-continue-here").addEventListener("click", () => {
    setSession(session);
    el.remove();
    magicContinue(session);
  });
}
async function handleMagicVerify(token) {
  const data = await fetch("/api/auth/magic-link/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token })
  }).then((r) => r.json()).catch(() => null);
  const url = new URL(location.href);
  url.searchParams.delete("ml");
  history.replaceState(null, "", url.toString());
  if (data?.ok) {
    const session = {
      email: data.email,
      name: data.name,
      picture: data.picture,
      session_token: data.session_token,
      needs_name: data.needs_name
    };
    dismissGate();
    showMagicApprovedScreen(session);
    return true;
  }
  return data?.error || "This link is invalid or has expired.";
}
let _mlReopen = null;
function openMagicModal() {
  if (_mlReopen) {
    _mlReopen();
    return;
  }
  const modal = document.createElement("div");
  modal.id = "ml-modal";
  modal.innerHTML = `
        <div class="ml-card">
          <button type="button" class="ml-close" aria-label="Close">&times;</button>
          <div id="ml-form-view">
            <h3>Sign in with magic link</h3>
            <p class="ml-desc">Enter your email and we'll send you a secure sign-in link. No password needed.</p>
            <form id="ml-form" autocomplete="on">
              <input id="ml-email" type="email" inputmode="email" autocomplete="email" placeholder="you@email.com" class="ml-input" required />
              <button type="submit" class="ml-submit" id="ml-send">Send sign-in link</button>
            </form>
            <p class="ml-err" id="ml-err"></p>
          </div>
          <div id="ml-sent-view" class="ml-sent" style="display:none;">
            <div class="ml-spinner" id="ml-spinner"></div>
            <svg id="ml-sent-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="display:none;stroke:var(--site-accent-bright);"><path d="M20 6 9 17l-5-5"/></svg>
            <p id="ml-sent-msg">We sent a sign-in link to <b id="ml-sent-email"></b>.<br>Open it on <b>any device</b> — this window will sign in automatically.</p>
            <p class="ml-err" id="ml-resend-err"></p>
            <div class="ml-sent-actions">
              <button type="button" class="ml-resend-link" id="ml-resend-link" disabled>Resend in 30s</button>
              <button type="button" class="ml-resend" id="ml-resend">Use a different email</button>
            </div>
          </div>
        </div>`;
  document.body.appendChild(modal);
  const formView = modal.querySelector("#ml-form-view");
  const sentView = modal.querySelector("#ml-sent-view");
  const form = modal.querySelector("#ml-form");
  const input = modal.querySelector("#ml-email");
  const send = modal.querySelector("#ml-send");
  const err = modal.querySelector("#ml-err");
  const spinner = modal.querySelector("#ml-spinner");
  const sentIcon = modal.querySelector("#ml-sent-icon");
  const sentMsg = modal.querySelector("#ml-sent-msg");
  const sentMsgDefault = sentMsg.innerHTML;
  const resend = modal.querySelector("#ml-resend");
  const resendLink = modal.querySelector("#ml-resend-link");
  const resendErr = modal.querySelector("#ml-resend-err");
  const COOLDOWN = 30;
  let pollTimer = null, cooldownTimer = null, currentEmail = "";
  const stopPoll = () => {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  };
  const stopCooldown = () => {
    if (cooldownTimer) {
      clearInterval(cooldownTimer);
      cooldownTimer = null;
    }
  };
  function startCooldown() {
    stopCooldown();
    let n = COOLDOWN;
    resendLink.disabled = true;
    resendLink.textContent = `Resend in ${n}s`;
    cooldownTimer = setInterval(() => {
      n--;
      if (n <= 0) {
        stopCooldown();
        resendLink.disabled = false;
        resendLink.textContent = "Resend link";
      } else resendLink.textContent = `Resend in ${n}s`;
    }, 1e3);
  }
  function showWaiting() {
    spinner.style.display = "";
    sentIcon.style.display = "none";
    sentMsg.innerHTML = sentMsgDefault;
    modal.querySelector("#ml-sent-email").textContent = currentEmail;
    resendErr.textContent = "";
  }
  const requestLink = (email) => fetch("/api/auth/magic-link", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, captcha_token: getCaptchaToken() })
  }).then((r) => r.json()).catch(() => null);
  const open = () => {
    modal.classList.add("show");
    setTimeout(() => input.focus(), 120);
  };
  const close = () => {
    modal.classList.remove("show");
    stopPoll();
    stopCooldown();
    setTimeout(() => {
      formView.style.display = "";
      sentView.style.display = "none";
      send.disabled = false;
      send.textContent = "Send sign-in link";
      err.textContent = "";
      spinner.style.display = "";
      sentIcon.style.display = "none";
      sentMsg.innerHTML = sentMsgDefault;
      resendErr.textContent = "";
      resendLink.disabled = true;
      resendLink.textContent = `Resend in ${COOLDOWN}s`;
    }, 250);
  };
  _mlReopen = open;
  modal.querySelector(".ml-close").addEventListener("click", close);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("show")) close();
  });
  resend.addEventListener("click", () => {
    stopPoll();
    stopCooldown();
    sentView.style.display = "none";
    formView.style.display = "";
    send.disabled = false;
    send.textContent = "Send sign-in link";
    spinner.style.display = "";
    sentIcon.style.display = "none";
    sentMsg.innerHTML = sentMsgDefault;
    resendErr.textContent = "";
    err.textContent = "";
    input.focus();
  });
  resendLink.addEventListener("click", async () => {
    if (resendLink.disabled || !currentEmail) return;
    resendLink.disabled = true;
    resendLink.textContent = "Sending…";
    showWaiting();
    const data = await requestLink(currentEmail);
    if (data?.ok) {
      startCooldown();
      if (data.request_id) startPoll(data.request_id);
    } else {
      resendErr.textContent = data?.error || "Could not resend. Try again shortly.";
      startCooldown();
    }
  });
  const startPoll = (requestId) => {
    stopPoll();
    pollTimer = setInterval(async () => {
      const s = await fetch("/api/auth/magic-link/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_id: requestId })
      }).then((r) => r.json()).catch(() => null);
      if (!s) return;
      if (s.status === "approved") {
        stopPoll();
        stopCooldown();
        spinner.style.display = "none";
        sentIcon.style.display = "";
        sentMsg.innerHTML = "Approved! Signing you in…";
        const session = {
          email: s.email,
          name: s.name,
          picture: s.picture,
          session_token: s.session_token,
          needs_name: s.needs_name
        };
        setSession(session);
        setTimeout(() => {
          modal.classList.remove("show");
          magicContinue(session);
        }, 700);
      } else if (s.status === "expired") {
        stopPoll();
        spinner.style.display = "none";
        sentMsg.innerHTML = "That link expired before it was used.";
        stopCooldown();
        resendLink.disabled = false;
        resendLink.textContent = "Resend link";
      }
    }, 2500);
  };
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = (input.value || "").trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      err.textContent = "Enter a valid email.";
      return;
    }
    err.textContent = "";
    send.disabled = true;
    send.textContent = "Sending…";
    const data = await requestLink(email);
    if (data?.ok) {
      currentEmail = email;
      modal.querySelector("#ml-sent-email").textContent = email;
      formView.style.display = "none";
      sentView.style.display = "";
      showWaiting();
      startCooldown();
      if (data.request_id) startPoll(data.request_id);
    } else {
      send.disabled = false;
      send.textContent = "Send sign-in link";
      err.textContent = data?.error === "account_banned" ? "Your access to this site has been revoked." : data?.error === "not_allowed" ? "This site is invite-only — your email isn't on the guest list." : data?.error === "vpn_blocked" ? "Sign-ups over a VPN or proxy aren't allowed. Please turn it off and try again." : data?.error === "signup_limited" ? "Too many recent sign-ups from your email domain. Please try again later." : data?.error === "captcha_failed" ? "Bot check failed — please complete the captcha and try again." : data?.error || "Could not send link. Try again.";
    }
  });
  open();
}
export { handleMagicVerify, openMagicModal };
