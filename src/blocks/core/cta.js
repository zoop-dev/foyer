export function preview(s, h) {
  const ta = `text-align:${s.align || "center"};`;
  const p = s.pad === "sm" ? "1.5rem 2rem" : s.pad === "lg" ? "5.5rem 2rem" : "3rem 2rem";
  const bs = s.btn_style || "solid";
  const bsz = s.btn_size === "sm" ? ".5rem 1.3rem" : s.btn_size === "lg" ? ".9rem 2.8rem" : ".7rem 2rem";
  const btnCss = bs === "outline" ? `background:transparent;border:1px solid ${h.accent};color:${h.accent};` : bs === "ghost" ? `background:transparent;border:1px solid ${h.rgb(h.text, 0.25)};color:${h.text};` : `background:${h.accent};border:1px solid ${h.accent};color:${h.bg};`;
  return `<div style="${h.ff}${h.fc}${ta}padding:${p};">
        ${s.text ? `<p style="font-weight:200;font-size:1rem;letter-spacing:.06em;margin-bottom:1.4rem;color:${h.rgb(h.text, 0.75)};">${h.E(s.text)}</p>` : ""}
        <a href="${h.A(s.button_url || "#")}" style="display:inline-block;font-weight:300;font-size:.78rem;letter-spacing:.25em;text-transform:uppercase;padding:${bsz};text-decoration:none;${btnCss}">${h.E(s.button_label || "Get in touch")}</a>
      </div>`;
}
export function render(s, h) {
  const ta = `text-align:${s.align || "center"};`;
  const p = s.pad === "sm" ? "1.5rem 2rem" : s.pad === "lg" ? "5.5rem 2rem" : "3rem 2rem";
  const bs = s.btn_style || "solid";
  const bsz = s.btn_size === "sm" ? ".5rem 1.3rem" : s.btn_size === "lg" ? ".9rem 2.8rem" : ".7rem 2rem";
  const btnCss = bs === "outline" ? `background:transparent;border:1px solid ${h.accent};color:${h.accent};` : bs === "ghost" ? `background:transparent;border:1px solid ${h.rgb(h.text, 0.25)};color:${h.text};` : `background:${h.accent};border:1px solid ${h.accent};color:${h.bg};`;
  const btnCommon = `display:inline-block;font-weight:300;font-size:.78rem;letter-spacing:.25em;text-transform:uppercase;padding:${bsz};text-decoration:none;${btnCss}`;
  const btnEl = s.button_label ? s.button_url ? `<a href="${h.A(s.button_url)}" target="_blank" rel="noopener" style="${btnCommon}">${h.E(s.button_label)}</a>` : `<button type="button" style="${btnCommon}cursor:pointer;font-family:inherit;">${h.E(s.button_label)}</button>` : "";
  return `<div style="${h.ff}${h.fc}${ta}padding:${p};">${s.text ? `<p style="font-size:1.05rem;font-weight:200;line-height:1.75;color:${h.rgb(h.text, 0.75)};margin-bottom:1.5rem;">${h.E(s.text)}</p>` : ""}${btnEl}</div>`;
}
