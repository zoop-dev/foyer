




export const UI_STRINGS = {
  search: 'Search',
  search_ph: 'Search this site',
  search_none: 'No results',
  ask_ph: 'Ask a question',
  ask_hi: 'Hi! Ask me anything.',
  pw_protected: 'This page is password protected.',
  pw_unlock: 'Unlock',
  pw_wrong: 'Incorrect password, try again.',
  pw_ph: 'Password',
  lang: 'Language',
};
const CATALOG_VERSION = '1';   // bump to invalidate cached UI-string translations

async function mm(env, text, from, to) {
  try {
    const email = (env && env.MYMEMORY_EMAIL) ? `&de=${encodeURIComponent(env.MYMEMORY_EMAIL)}` : '';
    const u = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}${email}`;
    const r = await fetch(u, { headers: { 'User-Agent': 'Foyer' } });
    if (!r.ok) return text;
    const d = await r.json();
    const tr = d && d.responseData && d.responseData.translatedText;
    return (tr && d.responseStatus === 200) ? tr : text;
  } catch { return text; }
}

async function translate(env, text, from, to, cache) {
  if (cache && cache.has(text)) return cache.get(text);
  let out;
  if (text.length <= 480) out = await mm(env, text, from, to);
  else {
    const parts = []; let s = text;
    while (s.length > 480) { let cut = s.lastIndexOf(' ', 480); if (cut < 1) cut = 480; parts.push(s.slice(0, cut)); s = s.slice(cut); }
    parts.push(s);
    const tr = []; for (const p of parts) tr.push(await mm(env, p, from, to));
    out = tr.join('');
  }
  if (cache) cache.set(text, out);
  return out;
}

const NO_TR = new Set([
  'id', 'type', 'variant', 'icon', 'align', 'anchor', 'slug', 'parent', 'font', 'kind',
  'url', 'href', 'img', 'photo', 'src', 'bg_img', 'bg_image', 'image', 'avatar', 'cover',
  'cover_image', 'data', 'access_key', 'target', 'buy_url', 'btn_url', 'btn2_url', 'button_url',
  'bg', 'accent', 'color', 'bg_style', 'layout', 'pad', 'size', 'weight', 'ls',
  'name_size', 'page_image', 'show_in_nav', 'new_tab', 'rating', 'featured',
]);
const isText = (s) =>
  typeof s === 'string' && s.trim().length > 1 &&
  !/^(https?:|\/|#|data:|mailto:|tel:)/i.test(s) &&
  !/^#?[0-9a-f]{3,8}$/i.test(s) &&
  /[a-zA-ZÀ-ɏ]/.test(s);

async function walk(env, obj, from, to, cache, d) {
  if (d > 9 || obj == null) return obj;
  if (typeof obj === 'string') return isText(obj) ? await translate(env, obj, from, to, cache) : obj;
  if (Array.isArray(obj)) { const out = []; for (const v of obj) out.push(await walk(env, v, from, to, cache, d + 1)); return out; }
  if (typeof obj === 'object') { const out = {}; for (const k in obj) out[k] = NO_TR.has(k) ? obj[k] : await walk(env, obj[k], from, to, cache, d + 1); return out; }
  return obj;
}
export async function translatePageJson(env, jsonStr, from, to) {
  let st;
  try { st = JSON.parse(jsonStr || '{}'); } catch { return jsonStr; }
  const out = await walk(env, st, from, to, new Map(), 0);
  return JSON.stringify(out);
}



export async function getCatalog(env, lang) {
  lang = (lang || '').toLowerCase();
  if (!lang || lang === 'en') return UI_STRINGS;
  const key = `i18nc:${CATALOG_VERSION}:${lang}`;
  if (env && env.FOYER_KV) { try { const c = await env.FOYER_KV.get(key, { type: 'json' }); if (c) return c; } catch {} }
  const out = {}; const cache = new Map();
  for (const k in UI_STRINGS) out[k] = await translate(env, UI_STRINGS[k], 'en', lang, cache);
  if (env && env.FOYER_KV) { try { await env.FOYER_KV.put(key, JSON.stringify(out)); } catch {} }
  return out;
}
