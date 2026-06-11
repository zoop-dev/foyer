




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
  !/^#?[0-9a-f]{3,8}$/i.test(s) &&        // hex colors
  /[a-zA-ZÀ-ɏ]/.test(s);        // has letters (latin/accented)

async function trText(env, text, from, to, cache) {
  if (cache.has(text)) return cache.get(text);
  let out = text;
  try {
    const r = await env.AI.run('@cf/meta/m2m100-1.2b', { text, source_lang: from, target_lang: to });
    out = (r && r.translated_text) || text;
  } catch {}
  cache.set(text, out);
  return out;
}

async function walk(env, obj, from, to, cache, d) {
  if (d > 9 || obj == null) return obj;
  if (typeof obj === 'string') return isText(obj) ? await trText(env, obj, from, to, cache) : obj;
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
