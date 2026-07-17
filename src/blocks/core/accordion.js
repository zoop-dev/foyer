export function preview(s, h) {
  const items = s.items || [];
  const p = s.pad === "sm" ? "1rem 2rem" : s.pad === "lg" ? "4rem 2rem" : "2rem 2rem";
  const bordered = s.style === "bordered";
  const inner = items.map(
    (it) => `<details style="border-bottom:1px solid ${h.rgb(h.accent, 0.12)};${bordered ? `border:1px solid ${h.rgb(h.accent, 0.12)};margin-bottom:.5rem;` : ""}">
        <summary style="cursor:pointer;padding:.85rem ${bordered ? "1rem" : "0"};font-weight:300;font-size:.88rem;letter-spacing:.04em;color:${h.rgb(h.text, 0.88)};list-style:none;display:flex;justify-content:space-between;align-items:center;">${h.E(it.q || "Question")}<span style="font-size:.7rem;color:${h.rgb(h.accent, 0.45)};">▼</span></summary>
        <div class="md-content" style="padding:.5rem ${bordered ? "1rem" : "0"} 1rem;font-size:.82rem;font-weight:200;line-height:1.85;color:${h.rgb(h.text, 0.62)};">${h.md(it.a)}</div>
      </details>`
  ).join("");
  return `<div style="${h.ff}${h.fc}padding:${p};">${inner || `<div style="font-size:.65rem;letter-spacing:.2em;color:${h.rgb(h.accent, 0.25)};text-align:center;padding:1rem;">Add accordion items in editor</div>`}</div>`;
}
export function render(s, h) {
  const items = s.items || [];
  const p = s.pad === "sm" ? "1rem 2rem" : s.pad === "lg" ? "4rem 2rem" : "2rem 2rem";
  const bordered = s.style === "bordered";
  const inner = items.map(
    (it) => `<details style="border-bottom:1px solid ${h.rgb(h.accent, 0.12)};${bordered ? `border:1px solid ${h.rgb(h.accent, 0.12)};margin-bottom:.5rem;` : ""}">
            <summary style="cursor:pointer;padding:.85rem ${bordered ? "1rem" : "0"};font-weight:300;font-size:.88rem;letter-spacing:.04em;color:${h.rgb(h.text, 0.88)};list-style:none;display:flex;justify-content:space-between;align-items:center;">${h.E(it.q || "")}<span style="font-size:.7rem;color:${h.rgb(h.accent, 0.45)};">▼</span></summary>
            <div class="md-content" style="padding:.5rem ${bordered ? "1rem" : "0"} 1rem;font-size:.82rem;font-weight:200;line-height:1.85;color:${h.rgb(h.text, 0.62)};">${h.md(it.a)}</div>
          </details>`
  ).join("");
  return `<div style="${h.ff}${h.fc}padding:${p};">${inner}</div>`;
}
