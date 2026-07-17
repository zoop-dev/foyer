export function preview(s, h) {
  const ta = `text-align:${s.align || "center"};`;
  const mw = s.size === "sm" ? "280px" : s.size === "md" ? "420px" : "100%";
  const r = s.radius === "sm" ? "4px" : s.radius === "lg" ? "12px" : s.radius === "circle" ? "999px" : "0";
  const p = s.pad === "sm" ? "1rem 2rem" : s.pad === "lg" ? "4rem 2rem" : "2rem 2rem";
  return `<div style="${h.ff}${h.fc}${ta}padding:${p};">${s.url ? `<img src="${h.A(s.url)}" alt="${h.A(s.caption || "")}" style="max-width:${mw};width:100%;height:auto;display:inline-block;border-radius:${r};" />` : `<div style="display:inline-block;width:100%;max-width:${mw};background:${h.rgb(h.accent, 0.06)};border:1px dashed ${h.rgb(h.accent, 0.2)};padding:3rem 2rem;font-size:.68rem;letter-spacing:.2em;color:${h.rgb(h.accent, 0.3)};border-radius:${r};">Image URL</div>`}${s.caption ? `<p style="margin-top:.55rem;font-size:.62rem;font-weight:200;letter-spacing:.14em;color:${h.rgb(h.text, 0.38)};">${h.E(s.caption)}</p>` : ""}</div>`;
}
export function render(s, h) {
  const mw = s.size === "sm" ? "280px" : s.size === "md" ? "420px" : "100%";
  const r = s.radius === "sm" ? "4px" : s.radius === "lg" ? "12px" : s.radius === "circle" ? "999px" : "0";
  const ai = s.align === "left" ? "flex-start" : s.align === "right" ? "flex-end" : "center";
  const p = s.pad === "sm" ? "1rem 2rem" : s.pad === "lg" ? "4rem 2rem" : "2rem 2rem";
  return `<div style="${h.ff}${h.fc}padding:${p};display:flex;flex-direction:column;align-items:${ai};">${s.url ? `<img src="${h.A(s.url)}" alt="${h.A(s.caption || "")}" style="max-width:${mw};width:100%;display:block;object-fit:cover;border-radius:${r};" />` : ""}${s.caption ? `<p style="font-size:.67rem;font-weight:200;letter-spacing:.1em;color:${h.rgb(h.text, 0.38)};margin-top:.5rem;">${h.E(s.caption)}</p>` : ""}</div>`;
}
