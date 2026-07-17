export function preview(s, h) {
  const items = s.items || [];
  const p = s.pad === "sm" ? "1rem 2rem" : s.pad === "lg" ? "4rem 2rem" : "2rem 2rem";
  const cols = s.layout === "grid-2" ? 2 : s.layout === "grid-4" ? 4 : 3;
  const forSale = items.filter((it) => it.for_sale === "yes").length;
  const countLine = s.show_count !== "no" ? `${items.length} item${items.length === 1 ? "" : "s"}${forSale ? ` · ${forSale} for sale` : ""}` : "";
  const cards = items.map((it) => {
    const imgs = it.imgs && it.imgs.length ? it.imgs.filter(Boolean) : it.img ? [it.img] : [];
    const cover = imgs[0] || "";
    const coverHtml = cover ? `<img src="${h.A(cover)}" alt="" style="width:100%;height:130px;object-fit:cover;display:block;" />` : `<div style="width:100%;height:130px;background:${h.rgb(h.accent, 0.06)};border:1px dashed ${h.rgb(h.accent, 0.15)};"></div>`;
    const thumbs = imgs.length > 1 ? `<div style="display:flex;gap:.25rem;padding:.35rem .35rem 0;overflow-x:auto;">${imgs.map((u) => `<img src="${h.A(u)}" alt="" style="width:30px;height:30px;object-fit:cover;flex-shrink:0;border:1px solid ${h.rgb(h.accent, 0.2)};" />`).join("")}</div>` : "";
    const onSale = it.for_sale === "yes" && it.sale === "yes" && it.sale_price && (!it.sale_until || new Date(it.sale_until).getTime() > Date.now());
    const badge = it.for_sale === "yes" ? `<div style="position:absolute;top:.5rem;right:.5rem;${onSale ? "background:#e0556a;color:#fff;" : `background:${h.accent};color:${h.bg};`}font-size:.5rem;font-weight:400;letter-spacing:.1em;text-transform:uppercase;padding:.2rem .5rem;z-index:1;">${onSale ? `Sale · <span style="text-decoration:line-through;opacity:.7;">${h.E(it.price || "")}</span> ${h.E(it.sale_price)}` : `For sale${it.price ? ` · ${h.E(it.price)}` : ""}`}</div>` : "";
    return `<div style="border:1px solid ${h.rgb(h.accent, 0.12)};background:${h.rgb(h.accent, 0.03)};position:relative;">${badge}${coverHtml}${thumbs}<div style="padding:.6rem .8rem;"><div style="font-weight:300;font-size:.82rem;color:${h.rgb(h.text, 0.9)};">${h.E(it.name || "")}</div>${it.note ? `<div style="font-weight:200;font-size:.68rem;line-height:1.6;color:${h.rgb(h.text, 0.5)};margin-top:.2rem;">${h.E(it.note)}</div>` : ""}${it.buy === "yes" && it.buy_url ? `<a href="${h.A(it.buy_url)}" target="_blank" rel="noopener" style="display:inline-block;margin-top:.55rem;background:${h.accent};color:${h.bg};font-size:.62rem;font-weight:400;letter-spacing:.08em;text-transform:uppercase;padding:.4rem .8rem;border-radius:6px;text-decoration:none;">${h.E(it.buy_label || "Buy")}</a>` : ""}</div></div>`;
  }).join("");
  return `<div style="${h.ff}${h.fc}padding:${p};">${s.heading ? `<div style="font-weight:300;font-size:1.05rem;letter-spacing:.02em;margin-bottom:.3rem;">${h.E(s.heading)}</div>` : ""}${countLine ? `<div style="font-size:.65rem;font-weight:200;letter-spacing:.1em;text-transform:uppercase;color:${h.rgb(h.accent, 0.6)};margin-bottom:1.2rem;">${countLine}</div>` : ""}<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:1rem;">${cards}</div></div>`;
}
export function render(s, h) {
  const items = s.items || [];
  const p = s.pad === "sm" ? "1rem 2rem" : s.pad === "lg" ? "4rem 2rem" : "2rem 2rem";
  const cols = s.layout === "grid-2" ? 2 : s.layout === "grid-4" ? 4 : 3;
  const forSale = items.filter((it) => it.for_sale === "yes").length;
  const countLine = s.show_count !== "no" ? `${items.length} item${items.length === 1 ? "" : "s"}${forSale ? ` · ${forSale} for sale` : ""}` : "";
  const cards = items.map((it) => {
    const imgs = it.imgs && it.imgs.length ? it.imgs.filter(Boolean) : it.img ? [it.img] : [];
    const cover = imgs[0] || "";
    const coverHtml = cover ? `<img class="coll-cover" data-src="${h.A(cover)}" alt="${h.A(it.name || "")}" decoding="async" style="width:100%;height:140px;object-fit:cover;display:block;background:${h.rgb(h.accent, 0.06)};" />` : `<div style="width:100%;height:140px;background:${h.rgb(h.accent, 0.06)};"></div>`;
    const thumbs = imgs.length > 1 ? `<div style="display:flex;gap:.3rem;padding:.4rem .4rem 0;overflow-x:auto;">${imgs.map((u, k) => `<img class="coll-thumb" data-cover="${h.A(u)}" data-src="${h.A(u)}" alt="" decoding="async" style="width:34px;height:34px;object-fit:cover;flex-shrink:0;cursor:pointer;border:1px solid ${h.rgb(h.accent, 0.2)};opacity:${k === 0 ? "1" : ".55"};background:${h.rgb(h.accent, 0.08)};" />`).join("")}</div>` : "";
    const onSale = it.for_sale === "yes" && it.sale === "yes" && it.sale_price && (!it.sale_until || new Date(it.sale_until).getTime() > Date.now());
    const badge = it.for_sale === "yes" ? `<div style="position:absolute;top:.5rem;right:.5rem;${onSale ? "background:#e0556a;color:#fff;" : `background:${h.accent};color:${h.bg};`}font-size:.55rem;font-weight:400;letter-spacing:.1em;text-transform:uppercase;padding:.2rem .5rem;z-index:1;">${onSale ? `Sale · <span style="text-decoration:line-through;opacity:.7;">${h.E(it.price || "")}</span> ${h.E(it.sale_price)}` : `For sale${it.price ? ` · ${h.E(it.price)}` : ""}`}</div>` : "";
    return `<div class="coll-card" style="border:1px solid ${h.rgb(h.accent, 0.12)};background:${h.rgb(h.accent, 0.03)};position:relative;">${badge}${coverHtml}${thumbs}<div style="padding:.7rem .9rem;"><div style="font-weight:300;font-size:.88rem;color:${h.rgb(h.text, 0.9)};">${h.E(it.name || "")}</div>${it.note ? `<div style="font-size:.7rem;font-weight:200;line-height:1.6;color:${h.rgb(h.text, 0.5)};margin-top:.25rem;">${h.E(it.note)}</div>` : ""}${it.buy === "yes" && it.buy_url ? `<a href="${h.A(it.buy_url)}" target="_blank" rel="noopener" style="display:inline-block;margin-top:.6rem;background:${h.accent};color:${h.bg};font-size:.64rem;font-weight:400;letter-spacing:.08em;text-transform:uppercase;padding:.45rem .85rem;border-radius:6px;text-decoration:none;">${h.E(it.buy_label || "Buy")}</a>` : ""}</div></div>`;
  }).join("");
  return `<div style="${h.ff}${h.fc}padding:${p};">${s.heading ? `<div style="font-weight:300;font-size:1.1rem;letter-spacing:.02em;margin-bottom:.3rem;">${h.E(s.heading)}</div>` : ""}${countLine ? `<div style="font-size:.7rem;font-weight:200;letter-spacing:.1em;text-transform:uppercase;color:${h.rgb(h.accent, 0.6)};margin-bottom:1.4rem;">${countLine}</div>` : ""}<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:1.2rem;">${cards}</div></div>`;
}
