




async function gtrans(text, from, to) {
  const u = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(from)}&tl=${encodeURIComponent(to)}&dt=t&q=${encodeURIComponent(text)}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(u);
      if (r.ok) {
        const d = await r.json();
        if (Array.isArray(d) && Array.isArray(d[0])) {
          const out = d[0].map((seg) => (seg && seg[0]) || '').join('');
          if (out) return out;
        }
      }
    } catch {}
  }
  return text;
}

async function translate(env, text, from, to, cache) {
  if (cache && cache.has(text)) return cache.get(text);
  let out;
  if (text.length <= 1200) out = await gtrans(text, from, to);
  else {
    const parts = []; let s = text;
    while (s.length > 1200) { let cut = s.lastIndexOf(' ', 1200); if (cut < 1) cut = 1200; parts.push(s.slice(0, cut)); s = s.slice(cut); }
    parts.push(s);
    const tr = []; for (const p of parts) tr.push(await gtrans(p, from, to));
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
