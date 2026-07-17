export function preview(s, h) {
  const p = s.pad === "sm" ? "1rem 2rem" : s.pad === "lg" ? "4rem 2rem" : "2rem 2rem";
  const ht = s.height === "sm" ? "300px" : s.height === "lg" ? "720px" : s.height === "xl" ? "90vh" : "520px";
  return `<div style="${h.ff}${h.fc}padding:${p};">${s.url ? `<div style="border:1px solid ${h.rgb(h.accent, 0.12)};overflow:hidden;height:${ht};display:flex;align-items:center;justify-content:center;font-size:.65rem;letter-spacing:.18em;color:${h.rgb(h.accent, 0.35)};">[ File preview: ${h.E(s.url)} ]</div>` : `<div style="border:1px dashed ${h.rgb(h.accent, 0.12)};height:${ht};display:flex;align-items:center;justify-content:center;font-size:.58rem;letter-spacing:.22em;text-transform:uppercase;color:${h.rgb(h.accent, 0.2)};">No file selected</div>`}</div>`;
}
export function render(s, h) {
  const p = s.pad === "sm" ? "1rem 2rem" : s.pad === "lg" ? "4rem 2rem" : "2rem 2rem";
  const ht = s.height === "sm" ? "300px" : s.height === "lg" ? "720px" : s.height === "xl" ? "90vh" : "520px";
  if (!s.url) return "";
  const previewUrl = s.url ? s.url + (s.url.includes("?") ? "&" : "?") + "preview=1" : "";
  return `<div style="${h.ff}${h.fc}padding:${p};">${previewUrl ? `<iframe src="${h.A(previewUrl)}" style="width:100%;height:${ht};border:none;display:block;" loading="lazy"></iframe>` : ""}</div>`;
}
