export function preview(s, h) {
  const items = s.items || [];
  if (!items.length)
    return `<div style="${h.ff}${h.fc}padding:2rem;text-align:center;font-size:.65rem;letter-spacing:.2em;color:${h.rgb(h.accent, 0.25)};">Add slides in the editor</div>`;
  const ht = s.height === "sm" ? "200px" : s.height === "lg" ? "480px" : "320px";
  const r2 = s.radius === "sm" ? "4px" : s.radius === "lg" ? "12px" : "0";
  const p = s.pad === "sm" ? "1rem 2rem" : s.pad === "lg" ? "4rem 2rem" : "2rem 2rem";
  const slides = items.map(
    (it, i) => `<div data-slide="${i}" style="display:${i === 0 ? "block" : "none"};">${it.img ? `<img src="${h.A(it.img)}" alt="${h.A(it.caption || "")}" style="width:100%;height:${ht};object-fit:cover;display:block;border-radius:${r2};" />` : `<div style="width:100%;height:${ht};background:${h.rgb(h.accent, 0.06)};border:1px dashed ${h.rgb(h.accent, 0.15)};border-radius:${r2};"></div>`}${it.caption ? `<p style="text-align:center;font-size:.62rem;color:${h.rgb(h.text, 0.4)};margin-top:.4rem;font-weight:200;">${h.E(it.caption)}</p>` : ""}</div>`
  ).join("");
  return `<div style="${h.ff}${h.fc}padding:${p};"><div class="bld-carousel-wrap" data-carousel>${slides}${items.length > 1 ? `<button class="bld-carousel-btn" data-prev style="left:.5rem;">‹</button><button class="bld-carousel-btn" data-next style="right:.5rem;">›</button><div class="bld-carousel-ctr" data-slide-ctr>1 / ${items.length}</div>` : ""}</div></div>`;
}
export function render(s, h) {
  const items = s.items || [];
  if (!items.length) return "";
  const ht = s.height === "sm" ? "200px" : s.height === "lg" ? "480px" : "320px";
  const r2 = s.radius === "sm" ? "4px" : s.radius === "lg" ? "12px" : "0";
  const p = s.pad === "sm" ? "1rem 2rem" : s.pad === "lg" ? "4rem 2rem" : "2rem 2rem";
  const slides = items.map(
    (it, i) => `<div data-slide="${i}" style="display:${i === 0 ? "block" : "none"};">${it.img ? `<img src="${h.A(it.img)}" alt="${h.A(it.caption || "")}" style="width:100%;height:${ht};object-fit:cover;display:block;border-radius:${r2};" />` : ""}${it.caption ? `<p style="text-align:center;font-size:.62rem;color:${h.rgb(h.text, 0.4)};margin-top:.4rem;font-weight:200;">${h.E(it.caption)}</p>` : ""}</div>`
  ).join("");
  const btnSty = `position:absolute;top:50%;transform:translateY(-50%);background:rgba(2,10,3,.65);border:1px solid rgba(77,189,106,.22);color:rgba(180,230,190,.78);width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:none;font-size:1.05rem;z-index:5;`;
  return `<div style="${h.ff}${h.fc}padding:${p};"><div data-carousel style="position:relative;overflow:hidden;user-select:none;">${slides}${items.length > 1 ? `<button style="${btnSty}left:.5rem;" data-prev>‹</button><button style="${btnSty}right:.5rem;" data-next>›</button><div style="position:absolute;bottom:.5rem;right:.75rem;font-size:.52rem;letter-spacing:.1em;color:rgba(180,230,190,.5);background:rgba(2,10,3,.65);padding:.15rem .4rem;pointer-events:none;" data-slide-ctr>1 / ${items.length}</div>` : ""}</div></div>`;
}
