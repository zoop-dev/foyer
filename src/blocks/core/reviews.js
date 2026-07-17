export function preview(s, h) {
  const p = s.pad === "sm" ? "1rem 2rem" : s.pad === "lg" ? "4rem 2rem" : "2rem 2rem";
  const ha = s.heading_align || "center";
  const headingHtml = s.heading ? `<div style="font-size:.82rem;font-weight:200;letter-spacing:.12em;text-transform:uppercase;color:${h.rgb(h.accent, 0.7)};text-align:${ha};margin-bottom:1.2rem;">${h.E(s.heading)}</div>` : "";
  const maxNote = s.max_items && s.max_items !== "0" ? ` · max ${s.max_items}` : "";
  const styleNote = s.rev_style === "list" ? "List" : "Cards";
  return `<div style="${h.ff}${h.fc}padding:${p};">${headingHtml}<div style="border:1px dashed ${h.rgb(h.accent, 0.12)};padding:2rem;text-align:center;font-size:.62rem;letter-spacing:.22em;text-transform:uppercase;color:${h.rgb(h.accent, 0.32)};font-weight:100;">Reviews — ${styleNote}${maxNote}</div></div>`;
}
export function render(s, h) {
  const p = s.pad === "sm" ? "1rem 2rem" : s.pad === "lg" ? "4rem 2rem" : "2rem 2rem";
  const uid = "revs-" + Math.random().toString(36).slice(2, 8);
  return `<div id="${uid}"
            data-revs="${h.A(s.rev_style || "cards")}"
            data-accent="${h.A(h.accent)}" data-text="${h.A(h.text)}"
            data-font="${h.A(h.font)}" data-bg="${h.A(h.bg)}"
            data-heading="${h.A(s.heading || "")}"
            data-heading-align="${h.A(s.heading_align || "center")}"
            data-max="${h.A(s.max_items || "0")}"
            data-view-all-show="${s.view_all_show === false || s.view_all_show === "no" ? "no" : "yes"}"
            data-view-all-label="${h.A(s.view_all_label || "View all →")}"
            style="padding:${p};font-family:'${h.font}',sans-serif;color:${h.text};">
            <p style="font-size:.62rem;letter-spacing:.18em;color:${h.rgb(h.accent, 0.3)};text-align:center;">Loading reviews…</p>
          </div>`;
}
