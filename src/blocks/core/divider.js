export function preview(s, h) {
  const sp = s.spacing === "sm" ? ".8rem" : s.spacing === "lg" ? "3rem" : "1.8rem";
  const dbg = s.style === "fade" ? `linear-gradient(90deg,transparent,${h.rgb(h.accent, 0.38)},transparent)` : h.rgb(h.accent, 0.28);
  const dw = s.style === "short" ? "2rem" : "100%";
  return `<div style="padding:${sp} 2rem;"><div style="width:${dw};height:1px;margin:0 auto;background:${dbg};"></div></div>`;
}
export function render(s, h) {
  const sp = s.spacing === "sm" ? ".8rem" : s.spacing === "lg" ? "3rem" : "1.8rem";
  const bg2 = s.style === "fade" ? `linear-gradient(90deg,transparent,${h.rgb(h.accent, 0.38)},transparent)` : h.rgb(h.accent, 0.28);
  const w = s.style === "short" ? "2rem" : "100%";
  return `<div style="padding:${sp} 2rem;"><div style="width:${w};height:1px;margin:0 auto;background:${bg2};"></div></div>`;
}
