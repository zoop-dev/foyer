


const TERMS_VERSION = '2026-06-07';
const TERMS_KEY = 'foyer_terms_accepted';

function foyerTermsGate() {
  return new Promise((resolve) => {
    let ok = false;
    try { ok = localStorage.getItem(TERMS_KEY) === TERMS_VERSION; } catch (e) {}
    if (ok) { resolve(); return; }
    const ov = document.createElement('div');
    ov.id = 'foyerTermsGate';
    ov.style.cssText = 'position:fixed;inset:0;z-index:100002;background:rgba(8,11,9,.86);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:1.5rem;font-family:"Josefin Sans",system-ui,sans-serif;';
    ov.innerHTML = `
      <div style="max-width:420px;width:100%;background:var(--panel,#0e1510);border:1px solid rgba(var(--accent-rgb,77,189,106),.2);border-radius:16px;padding:2rem 1.8rem;text-align:center;box-shadow:0 24px 60px rgba(0,0,0,.5);">
        <svg viewBox="0 0 44 50" width="26" height="30" fill="none" stroke="rgba(var(--accent-rgb,77,189,106),.85)" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:1.1rem;"><path d="M5 46 V24 a16 16 0 0 1 32 0 V46"/><path d="M15 46 V28 a6 6 0 0 1 12 0 V46"/></svg>
        <p style="font-family:'Unbounded',system-ui,sans-serif;font-weight:200;font-size:1rem;color:var(--white,#f0f7f1);margin-bottom:.6rem;">Before you continue</p>
        <p style="font-weight:200;font-size:.82rem;line-height:1.8;color:rgba(220,245,225,.6);margin-bottom:1.5rem;">To use the Foyer admin panel you must agree to our <a href="https://foyer.zo0p.dev/terms" target="_blank" rel="noopener" style="color:var(--green,#7fd89a);text-decoration:underline;">Terms of Service</a> and <a href="https://foyer.zo0p.dev/privacy" target="_blank" rel="noopener" style="color:var(--green,#7fd89a);text-decoration:underline;">Privacy Policy</a>.</p>
        <button id="foyerTermsAgree" class="btn" style="width:100%;margin-bottom:.5rem;">I agree &amp; continue</button>
        <button id="foyerTermsDecline" style="width:100%;background:none;border:none;color:rgba(220,245,225,.4);font:inherit;font-size:.7rem;cursor:pointer;padding:.4rem;">Decline &amp; leave</button>
      </div>`;
    document.body.appendChild(ov);
    ov.querySelector('#foyerTermsAgree').addEventListener('click', () => {
      try { localStorage.setItem(TERMS_KEY, TERMS_VERSION); } catch (e) {}
      ov.remove(); resolve();
    });
    ov.querySelector('#foyerTermsDecline').addEventListener('click', () => { location.href = '/'; });
  });
}
