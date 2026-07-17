(function() {
  var PROVIDER = "https://foyer.zo0p.dev";
  var CALLBACK = PROVIDER + "/popup-callback";
  function b64url(buf) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function pkce() {
    var v = b64url(crypto.getRandomValues(new Uint8Array(32)));
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(v)).then(function(h) {
      return { v, c: b64url(h) };
    });
  }
  function signIn(opts) {
    opts = opts || {};
    var exchangeUrl = opts.exchangeUrl || "/api/auth/foyer";
    return pkce().then(function(p) {
      return new Promise(function(resolve, reject) {
        var stateVal = crypto.randomUUID();
        try {
          sessionStorage.setItem("foyer_oauth_state", stateVal);
        } catch (e) {
        }
        var params = new URLSearchParams({
          client_id: location.hostname,
          redirect_uri: CALLBACK,
          state: stateVal,
          code_challenge: p.c,
          code_challenge_method: "S256",
          display: "popup"
        });
        var w = 440, h = 620, l = Math.max(0, (screen.width - w) / 2), t = Math.max(0, (screen.height - h) / 2);
        var popup = window.open(
          PROVIDER + "/authorize?" + params,
          "foyer_auth",
          "width=" + w + ",height=" + h + ",left=" + l + ",top=" + t
        );
        if (!popup) {
          reject({ error: "popup_blocked" });
          return;
        }
        var done = false;
        function onMsg(e) {
          if (e.origin !== PROVIDER || !e.data || e.data.type !== "foyer_auth" || !e.data.code)
            return;
          var storedState = null;
          try {
            storedState = sessionStorage.getItem("foyer_oauth_state");
            sessionStorage.removeItem("foyer_oauth_state");
          } catch (_) {
          }
          if (storedState && e.data.state !== storedState) {
            reject({ error: "state_mismatch" });
            done = true;
            window.removeEventListener("message", onMsg);
            try {
              popup.close();
            } catch (_) {
            }
            return;
          }
          done = true;
          window.removeEventListener("message", onMsg);
          try {
            popup.close();
          } catch (_) {
          }
          fetch(exchangeUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: e.data.code, code_verifier: p.v, redirect_uri: CALLBACK })
          }).then(function(r) {
            return r.json();
          }).then(resolve).catch(function() {
            reject({ error: "exchange_failed" });
          });
        }
        window.addEventListener("message", onMsg);
        var iv = setInterval(function() {
          if (popup.closed && !done) {
            clearInterval(iv);
            window.removeEventListener("message", onMsg);
            reject({ error: "closed" });
          }
        }, 500);
      });
    });
  }
  function oneTap(opts) {
    opts = opts || {};
    if (document.getElementById("foyer-onetap")) return;
    fetch(PROVIDER + "/session", { credentials: "include" }).then(function(r) {
      return r.ok ? r.json() : {};
    }).then(function(d) {
      var u = d && d.user;
      if (!u) return;
      var card = document.createElement("div");
      card.id = "foyer-onetap";
      card.style.cssText = [
        "position:fixed;top:20px;right:20px;z-index:99995;width:300px;",
        "background:rgba(13,17,23,0.97);border:1px solid rgba(127,166,216,0.28);border-radius:14px;",
        "box-shadow:0 12px 40px rgba(0,0,0,.45);backdrop-filter:blur(10px);",
        "font-family:'Josefin Sans',system-ui,sans-serif;color:#e8edf2;padding:1rem 1.1rem;",
        "transform:translateY(-12px);opacity:0;transition:transform .4s cubic-bezier(.16,1,.3,1),opacity .4s ease;"
      ].join("");
      var top = document.createElement("div");
      top.style.cssText = "display:flex;align-items:center;gap:.6rem;margin-bottom:.7rem;";
      top.innerHTML = '<svg width="16" height="18" viewBox="0 0 44 50" fill="none" stroke="#7fa6d8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 46 V24 a16 16 0 0 1 32 0 V46"/><path d="M15 46 V28 a6 6 0 0 1 12 0 V46"/></svg><span style="font-size:.56rem;letter-spacing:.26em;text-transform:uppercase;color:#7fa6d8;font-weight:300;">Foyer</span>';
      var x = document.createElement("button");
      x.textContent = "×";
      x.setAttribute("aria-label", "Dismiss");
      x.style.cssText = "margin-left:auto;background:none;border:none;color:#8b94a6;font-size:1.1rem;cursor:pointer;line-height:1;";
      x.onclick = function() {
        card.style.opacity = "0";
        card.style.transform = "translateY(-12px)";
        setTimeout(function() {
          card.remove();
        }, 380);
      };
      top.appendChild(x);
      var who = document.createElement("p");
      who.style.cssText = "font-weight:200;font-size:.82rem;line-height:1.5;color:rgba(232,237,242,.82);margin-bottom:.9rem;";
      who.textContent = "Continue as " + (u.name || u.email);
      var btn = document.createElement("button");
      btn.textContent = "Sign in with Foyer";
      btn.style.cssText = "width:100%;background:#7fa6d8;color:#070a0e;border:none;font-family:'Josefin Sans',sans-serif;font-weight:300;font-size:.62rem;letter-spacing:.2em;text-transform:uppercase;padding:.7rem;border-radius:8px;cursor:pointer;";
      btn.onclick = function() {
        card.remove();
        signIn(opts).then(function(s) {
          if (opts.onSignedIn) opts.onSignedIn(s);
        }).catch(function() {
        });
      };
      card.appendChild(top);
      card.appendChild(who);
      card.appendChild(btn);
      document.body.appendChild(card);
      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          card.style.opacity = "1";
          card.style.transform = "translateY(0)";
        });
      });
    }).catch(function() {
    });
  }
  function getProfile() {
    return fetch(PROVIDER + "/account", { credentials: "include" }).then(function(r) {
      return r.ok ? r.json() : { user: null };
    }).then(function(d) {
      return d.user;
    }).catch(function() {
      return null;
    });
  }
  function updateProfile(patch) {
    return fetch(PROVIDER + "/account", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch || {})
    }).then(function(r) {
      return r.json();
    });
  }
  window.Foyer = {
    signIn,
    oneTap,
    getProfile,
    updateProfile,
    PROVIDER
  };
})();
