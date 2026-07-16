export async function onRequestGet({ request: request }) {
  const url = new URL(request.url);
  const code = url.searchParams.get("foyer_code") || "";
  const state = url.searchParams.get("state") || "";
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Foyer</title>\n<style>html,body{margin:0;height:100%;background:#0b0e13}</style></head><body><script>\n(function(){\n  var code=${JSON.stringify(code)}, state=${JSON.stringify(state)};\n  try { if (window.opener) window.opener.postMessage({ type:'foyer_auth', code: code, state: state }, '*'); } catch(e){}\n  try { window.close(); } catch(e){}\n  setTimeout(function(){ try{ window.close(); }catch(e){} }, 50);\n})();\n<\/script></body></html>`;
  return new Response(html, {
    headers: { "content-type": "text/html;charset=utf-8", "cache-control": "no-store" },
  });
}
