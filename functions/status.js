import { sb } from "./api/_lib/supabase.js";
const AUTH_URL = "https://foyer.zo0p.dev/";
async function probe(url, timeoutMs = 4e3) {
  try {
    const r = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(timeoutMs),
      cf: { cacheTtl: 30 }
    });
    if (r.ok) return true;
  } catch {
  }
  try {
    const r = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(timeoutMs),
      cf: { cacheTtl: 30 }
    });
    return r.ok;
  } catch {
    return false;
  }
}
export async function renderStatusPage(ctx) {
  const { request, env } = ctx;
  const url = new URL(request.url);
  const host = env.FOYER_DOMAIN || url.hostname.replace(/^status\./, "");
  let name = host;
  let dbOk = true;
  let siteOffline = false;
  try {
    const n = await env.DB.prepare("SELECT value FROM site_settings WHERE key='name'").first();
    name = n && n.value || host;
    const off = await env.DB.prepare(
      "SELECT value FROM site_settings WHERE key='site_offline'"
    ).first();
    siteOffline = !!(off && off.value === "1");
  } catch (e) {
    dbOk = false;
  }
  let backendOk = true;
  let cpOffline = false;
  let licensed = true;
  try {
    const { base, headers } = sb(env);
    const r = await fetch(
      `${base}/rest/v1/foyer_sites?domain=eq.${encodeURIComponent(host)}&select=offline,licensed`,
      { headers, cf: { cacheTtl: 30 } }
    );
    if (r.ok) {
      const row2 = (await r.json())[0];
      if (row2) {
        cpOffline = row2.offline === true;
        licensed = row2.licensed !== false;
      }
    } else {
      backendOk = false;
    }
  } catch (e) {
    backendOk = false;
  }
  const authOk = await probe(AUTH_URL);
  const siteGroup = [
    { label: "This site", ok: dbOk && !siteOffline && !cpOffline },
    { label: "Database", ok: dbOk },
    { label: "License", ok: licensed }
  ];
  const platformGroup = [
    { label: "Foyer backend", ok: backendOk },
    { label: "Auth provider", ok: authOk }
  ];
  const components = [...siteGroup, ...platformGroup];
  const bad = components.filter((c) => !c.ok);
  const overall = bad.length === 0 ? { t: "All systems operational", c: "#3fb96a", e: "✅" } : bad.some((c) => c.label === "This site" || c.label === "Database") ? { t: "Service disruption", c: "#e0556a", e: "🔴" } : { t: "Partial degradation", c: "#e0a93f", e: "⚠️" };
  const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const checkedAt = Date.now();
  const msvg = (d) => `<svg viewBox="0 -960 960 960" fill="currentColor"><path d="${d}"/></svg>`;
  const ICONS = {
    "This site": msvg(
      "M325-111.5q-73-31.5-127.5-86t-86-127.5Q80-398 80-480.5t31.5-155q31.5-72.5 86-127t127.5-86Q398-880 480.5-880t155 31.5q72.5 31.5 127 86t86 127Q880-563 880-480.5T848.5-325q-31.5 73-86 127.5t-127 86Q563-80 480.5-80T325-111.5ZM480-162q26-36 45-75t31-83H404q12 44 31 83t45 75Zm-104-16q-18-33-31.5-68.5T322-320H204q29 50 72.5 87t99.5 55Zm208 0q56-18 99.5-55t72.5-87H638q-9 38-22.5 73.5T584-178ZM170-400h136q-3-20-4.5-39.5T300-480q0-21 1.5-40.5T306-560H170q-5 20-7.5 39.5T160-480q0 21 2.5 40.5T170-400Zm216 0h188q3-20 4.5-39.5T580-480q0-21-1.5-40.5T574-560H386q-3 20-4.5 39.5T380-480q0 21 1.5 40.5T386-400Zm268 0h136q5-20 7.5-39.5T800-480q0-21-2.5-40.5T790-560H654q3 20 4.5 39.5T660-480q0 21-1.5 40.5T654-400Zm-16-240h118q-29-50-72.5-87T584-782q18 33 31.5 68.5T638-640Zm-234 0h152q-12-44-31-83t-45-75q-26 36-45 75t-31 83Zm-200 0h118q9-38 22.5-73.5T376-782q-56 18-99.5 55T204-640Z"
    ),
    Database: msvg(
      "M480-120q-151 0-255.5-46.5T120-280v-400q0-66 105.5-113T480-840q149 0 254.5 47T840-680v400q0-67-104.5-113.5T480-120Zm0-479q89 0 179-25.5T760-679q-11-29-100.5-55T480-760q-91 0-178.5 25.5T200-679q14 30 101.5 55T480-599Zm0 199q42 0 81-4t74.5-11.5q35.5-7.5 67-18.5t57.5-25v-120q-26 14-57.5 25t-67 18.5Q600-528 561-524t-81 4q-42 0-82-4t-75.5-11.5Q287-543 256-554t-56-25v120q25 14 56 25t66.5 18.5Q358-408 398-404t82 4Zm0 200q46 0 93.5-7t87.5-18.5q40-11.5 67-26t32-29.5v-98q-26 14-57.5 25t-67 18.5Q600-328 561-324t-81 4q-42 0-82-4t-75.5-11.5Q287-343 256-354t-56-25v99q5 15 31.5 29t66.5 25.5q40 11.5 88 18.5t94 7Z"
    ),
    License: msvg(
      "M223.5-423.5Q200-447 200-480t23.5-56.5Q247-560 280-560t56.5 23.5Q360-513 360-480t-23.5 56.5Q313-400 280-400t-56.5-23.5ZM280-240q-100 0-170-70T40-480q0-100 70-170t170-70q67 0 121.5 33t86.5 87h352l120 120-180 180-80-60-80 60-85-60h-47q-32 54-86.5 87T280-240Zm0-80q56 0 98.5-34t56.5-86h125l58 41 82-61 71 55 75-75-40-40H435q-14-52-56.5-86T280-640q-66 0-113 47t-47 113q0 66 47 113t113 47Z"
    ),
    "Foyer backend": msvg(
      "m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z"
    ),
    "Auth provider": msvg(
      "M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm296.5-143.5Q560-327 560-360t-23.5-56.5Q513-440 480-440t-56.5 23.5Q400-393 400-360t23.5 56.5Q447-280 480-280t56.5-23.5ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z"
    )
  };
  const STATUS_ICON = bad.length === 0 ? msvg("M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z") : bad.some((c) => c.label === "This site" || c.label === "Database") ? msvg(
    "M508.5-291.5Q520-303 520-320t-11.5-28.5Q497-360 480-360t-28.5 11.5Q440-337 440-320t11.5 28.5Q463-280 480-280t28.5-11.5ZM440-440h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"
  ) : msvg(
    "m40-120 440-760 440 760H40Zm138-80h604L480-720 178-200Zm330.5-51.5Q520-263 520-280t-11.5-28.5Q497-320 480-320t-28.5 11.5Q440-297 440-280t11.5 28.5Q463-240 480-240t28.5-11.5ZM440-360h80v-200h-80v200Zm40-100Z"
  );
  const row = (c) => `<div class="comp"><span class="l"><span class="ic">${ICONS[c.label] || "•"}</span>${esc(c.label)}</span><span class="s ${c.ok ? "ok" : "down"}"><span class="d"></span>${c.ok ? "Operational" : "Disrupted"}</span></div>`;
  const html = `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="refresh" content="60"><meta name="robots" content="noindex">
<title>Status — ${esc(name)}</title>
<style>
  :root{color-scheme:dark}
  *{box-sizing:border-box}
  @keyframes pulse{0%,100%{box-shadow:0 0 0 0 ${overall.c}55}50%{box-shadow:0 0 0 8px ${overall.c}00}}
  @keyframes rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  body{
    margin:0;min-height:100vh;display:flex;align-items:flex-start;justify-content:center;
    background:
      radial-gradient(ellipse 60% 40% at 50% 0%, ${overall.c}14 0%, transparent 70%),
      #090c10;
    color:#e7edf3;font-family:-apple-system,BlinkMacSystemFont,'Inter',system-ui,sans-serif;
    padding:9vh 1.2rem 4rem
  }
  .wrap{width:100%;max-width:520px;animation:rise .45s ease both}
  .brand{display:flex;align-items:center;gap:.55rem;font-size:.72rem;letter-spacing:.22em;text-transform:uppercase;color:#5b6976;margin-bottom:1.6rem}
  .brand .sq{width:6px;height:6px;border-radius:2px;background:#3d4a58}
  .hero{
    position:relative;display:flex;align-items:center;gap:1rem;
    border:1px solid ${overall.c}33;background:linear-gradient(180deg, ${overall.c}14, ${overall.c}08);
    border-radius:16px;padding:1.5rem 1.6rem;margin-bottom:2rem;overflow:hidden
  }
  .hero::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 15% 20%, ${overall.c}22, transparent 55%);pointer-events:none}
  .hero .icn{
    width:38px;height:38px;flex-shrink:0;border-radius:50%;display:flex;align-items:center;justify-content:center;
    background:${overall.c}1e;color:${overall.c};animation:pulse 2.4s ease-in-out infinite
  }
  .hero .icn svg{width:19px;height:19px}
  .hero .txt{position:relative}
  .hero h1{font-size:1.2rem;font-weight:600;margin:0 0 .15rem;color:${overall.c};letter-spacing:-.01em}
  .hero p{margin:0;font-size:.76rem;color:#8b98a5}
  .group-label{display:flex;align-items:center;gap:.6rem;font-size:.66rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#4a5764;margin:1.7rem 0 .7rem;padding-left:.1rem}
  .group-label:first-of-type{margin-top:0}
  .group-label::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,#1c242d,transparent)}
  .comp{
    display:flex;align-items:center;justify-content:space-between;padding:.9rem 1.1rem;
    border:1px solid #181f27;border-radius:12px;margin-bottom:.55rem;background:#0d1218;
    transition:border-color .15s
  }
  .comp:hover{border-color:#242e39}
  .comp .l{font-size:.88rem;font-weight:400;display:flex;align-items:center;gap:.7rem;color:#d5dde3}
  .comp .l .ic{width:17px;height:17px;flex-shrink:0;color:#6b7885}
  .comp .l .ic svg{width:100%;height:100%;display:block}
  .comp .s{font-size:.72rem;font-weight:600;display:flex;align-items:center;gap:.45rem;letter-spacing:.01em}
  .comp .s .d{width:7px;height:7px;border-radius:50%}
  .ok{color:#3fb96a}.ok .d{background:#3fb96a;box-shadow:0 0 8px #3fb96a66}
  .down{color:#e0556a}.down .d{background:#e0556a;box-shadow:0 0 8px #e0556a66}
  .foot{margin-top:2.2rem;font-size:.7rem;color:#46525e;text-align:center;line-height:2}
  .foot a{color:#6b7885;text-decoration:none;border-bottom:1px solid #262f38;padding-bottom:1px}
  .foot a:hover{color:#8b98a5;border-color:#3d4a58}
  #ticker{font-variant-numeric:tabular-nums}
</style></head><body><div class="wrap">
  <div class="brand"><span class="sq"></span>${esc(name)} · Status</div>
  <div class="hero">
    <span class="icn">${STATUS_ICON}</span>
    <div class="txt">
      <h1>${overall.t}</h1>
      <p>${bad.length === 0 ? "Everything is running normally" : `${bad.length} component${bad.length === 1 ? "" : "s"} affected`}</p>
    </div>
  </div>
  <div class="group-label">${esc(name)}</div>
  ${siteGroup.map(row).join("")}
  <div class="group-label">Foyer platform</div>
  ${platformGroup.map(row).join("")}
  <div class="foot">Checked <span id="ticker">just now</span> · refreshes automatically<br><a href="https://${esc(host)}/">← back to ${esc(name)}</a></div>
</div>
<script>(function(){var t=${checkedAt};var el=document.getElementById("ticker");function tick(){var s=Math.max(0,Math.round((Date.now()-t)/1e3));el.textContent=s<5?"just now":s+"s ago"}setInterval(tick,1e3)})()<\/script>
</body></html>`;
  return new Response(html, {
    status: bad.length ? 503 : 200,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" }
  });
}
export async function onRequest(ctx) {
  return renderStatusPage(ctx);
}
