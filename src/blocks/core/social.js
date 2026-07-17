export function preview(s, h) {
  const items = s.items || [];
  const jc = s.align === "left" ? "flex-start" : s.align === "right" ? "flex-end" : "center";
  const p = s.pad === "sm" ? "1rem 2rem" : s.pad === "lg" ? "4rem 2rem" : "2rem 2rem";
  const bs = s.btn_style || "outline";
  const btnCss = bs === "solid" ? `background:${h.accent};color:${h.bg};border:none;padding:.4rem .9rem;` : bs === "minimal" ? `background:none;border:none;color:${h.accent};padding:.4rem .6rem;` : bs === "pill" ? `background:none;border:1px solid ${h.rgb(h.accent, 0.25)};color:${h.accent};border-radius:40px;padding:.4rem .9rem;` : `background:none;border:1px solid ${h.rgb(h.accent, 0.22)};color:${h.accent};padding:.4rem .9rem;`;
  return `<div style="${h.ff}${h.fc}padding:${p};text-align:${s.align || "center"};"><div style="display:flex;flex-wrap:wrap;gap:.6rem;justify-content:${jc};">${items.map((it) => `<a href="${h.A(it.url || "#")}" target="_blank" rel="noopener" style="${btnCss}font-weight:200;font-size:.7rem;letter-spacing:.2em;text-transform:uppercase;text-decoration:none;display:inline-block;">${h.E(it.label || "Link")}</a>`).join("")}</div></div>`;
}
export function render(s, h) {
  const items = s.items || [];
  const jc = s.align === "left" ? "flex-start" : s.align === "right" ? "flex-end" : "center";
  const p = s.pad === "sm" ? "1rem 2rem" : s.pad === "lg" ? "4rem 2rem" : "2rem 2rem";
  const bs = s.btn_style || "outline";
  const btnCss = bs === "solid" ? `background:${h.accent};color:${h.bg};border:none;padding:.4rem .9rem;` : bs === "minimal" ? `background:none;border:none;color:${h.accent};padding:.4rem .6rem;` : bs === "pill" ? `background:none;border:1px solid ${h.rgb(h.accent, 0.25)};color:${h.accent};border-radius:40px;padding:.4rem .9rem;` : `background:none;border:1px solid ${h.rgb(h.accent, 0.22)};color:${h.accent};padding:.4rem .9rem;`;
  return `<div style="${h.ff}${h.fc}padding:${p};text-align:${s.align || "center"};"><div style="display:flex;flex-wrap:wrap;gap:.6rem;justify-content:${jc};">${items.map((it) => `<a href="${h.A(it.url || "#")}" target="_blank" rel="noopener" style="${btnCss}font-weight:200;font-size:.7rem;letter-spacing:.2em;text-transform:uppercase;text-decoration:none;display:inline-block;">${h.E(it.label || "")}</a>`).join("")}</div></div>`;
}
