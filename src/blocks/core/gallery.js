export function preview(s, h) {
  const items = s.items || [];
  const cols = s.cols === "2" ? 2 : s.cols === "4" ? 4 : s.cols === "masonry" ? 3 : 3;
  const gap = s.gap === "sm" ? ".3rem" : s.gap === "lg" ? "1rem" : ".5rem";
  const hgt = s.height === "sm" ? "120px" : s.height === "lg" ? "280px" : "180px";
  const p = s.pad === "sm" ? "1rem 2rem" : s.pad === "lg" ? "4rem 2rem" : "2rem 2rem";
  const r2 = s.radius === "sm" ? "4px" : s.radius === "lg" ? "12px" : "0";
  const inner = `<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:${gap};">${items.map((it) => {
    const wrap = it.url ? `<a href="${h.A(it.url)}" target="_blank" rel="noopener" style="display:block;overflow:hidden;border-radius:${r2};">` : `<div style="overflow:hidden;border-radius:${r2};">`;
    const close = it.url ? "</a>" : "</div>";
    return `${wrap}${it.img ? `<img src="${h.A(it.img)}" alt="${h.A(it.caption || "")}" style="width:100%;height:${hgt};object-fit:cover;display:block;transition:transform .3s;" />` : `<div style="width:100%;height:${hgt};background:${h.rgb(h.accent, 0.06)};border:1px dashed ${h.rgb(h.accent, 0.15)};"></div>`}${close}`;
  }).join("")}</div>`;
  return `<div style="${h.ff}${h.fc}padding:${p};">${inner}</div>`;
}
export function render(s, h) {
  const items = s.items || [];
  const cols = s.cols === "2" ? 2 : s.cols === "4" ? 4 : 3;
  const gap = s.gap === "sm" ? ".3rem" : s.gap === "lg" ? "1rem" : ".5rem";
  const hgt = s.height === "sm" ? "120px" : s.height === "lg" ? "280px" : "180px";
  const p = s.pad === "sm" ? "1rem 2rem" : s.pad === "lg" ? "4rem 2rem" : "2rem 2rem";
  const r2 = s.radius === "sm" ? "4px" : s.radius === "lg" ? "12px" : "0";
  const inner = `<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:${gap};">${items.map((it) => {
    const wrap = it.url ? `<a href="${h.A(it.url)}" target="_blank" rel="noopener" style="display:block;overflow:hidden;border-radius:${r2};">` : `<div style="overflow:hidden;border-radius:${r2};">`;
    const close = it.url ? "</a>" : "</div>";
    return `${wrap}${it.img ? `<img src="${h.A(it.img)}" alt="${h.A(it.caption || "")}" style="width:100%;height:${hgt};object-fit:cover;display:block;" />` : `<div style="width:100%;height:${hgt};background:${h.rgb(h.accent, 0.06)};"></div>`}${close}`;
  }).join("")}</div>`;
  return `<div style="${h.ff}${h.fc}padding:${p};">${inner}</div>`;
}
