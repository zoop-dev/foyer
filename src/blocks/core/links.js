export function preview(s, h) {
  const items = s.items || [];
  const p = s.pad === "sm" ? "1rem 2rem" : s.pad === "lg" ? "4rem 2rem" : "2rem 2rem";
  const ls = s.link_style || "card";
  let inner;
  const itTarget = (it) => it.new_tab !== "no" ? 'target="_blank" rel="noopener"' : "";
  if (ls === "minimal") {
    inner = items.map(
      (it) => `<a href="${h.A(it.u || "#")}" ${itTarget(it)} style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid ${h.rgb(h.accent, 0.12)};padding:.75rem 0;text-decoration:none;"><span style="font-weight:300;font-size:.9rem;letter-spacing:.06em;color:${h.rgb(h.text, 0.88)};">${h.E(it.t || "Link")}</span>${it.d ? `<span style="font-size:.62rem;color:${h.rgb(h.accent, 0.42)};">${h.E(it.d)}</span>` : ""}</a>`
    ).join("");
  } else if (ls === "pill") {
    inner = `<div style="display:flex;flex-direction:column;gap:.5rem;">${items.map((it) => `<a href="${h.A(it.u || "#")}" ${itTarget(it)} style="display:block;border:1px solid ${h.rgb(h.accent, 0.18)};background:${h.rgb(h.accent, 0.04)};padding:.8rem 1.4rem;border-radius:40px;text-decoration:none;"><div style="font-weight:300;font-size:.9rem;letter-spacing:.06em;color:${h.rgb(h.text, 0.88)};">${h.E(it.t || "Link")}</div>${it.d ? `<div style="font-size:.62rem;font-weight:200;color:${h.rgb(h.accent, 0.42)};margin-top:.15rem;">${h.E(it.d)}</div>` : ""}</a>`).join("")}</div>`;
  } else {
    inner = `<div style="display:flex;flex-direction:column;gap:.52rem;">${items.map((it) => `<a href="${h.A(it.u || "#")}" ${itTarget(it)} style="display:block;border:1px solid ${h.rgb(h.accent, 0.15)};background:${h.rgb(h.accent, 0.03)};padding:.85rem 1.2rem;text-decoration:none;"><div style="font-weight:300;font-size:.9rem;letter-spacing:.06em;color:${h.rgb(h.text, 0.88)};">${h.E(it.t || "Link")}</div>${it.d ? `<div style="font-size:.62rem;font-weight:200;color:${h.rgb(h.accent, 0.42)};margin-top:.18rem;">${h.E(it.d)}</div>` : ""}</a>`).join("")}</div>`;
  }
  return `<div style="${h.ff}${h.fc}padding:${p};">${inner}</div>`;
}
export function render(s, h) {
  const items = s.items || [];
  const p = s.pad === "sm" ? "1rem 2rem" : s.pad === "lg" ? "4rem 2rem" : "2rem 2rem";
  const ls = s.link_style || "card";
  let inner;
  const itTgt = (it) => it.new_tab !== "no" ? 'target="_blank" rel="noopener"' : "";
  if (ls === "minimal") {
    inner = items.map(
      (it) => `<div style="border-bottom:1px solid ${h.rgb(h.accent, 0.12)};padding:.75rem 0;display:flex;align-items:center;justify-content:space-between;"><a href="${h.A(it.u || "#")}" ${itTgt(it)} style="font-weight:300;font-size:.9rem;letter-spacing:.06em;color:${h.rgb(h.text, 0.88)};text-decoration:none;">${h.E(it.t || "")}</a>${it.d ? `<span style="font-size:.62rem;color:${h.rgb(h.accent, 0.42)};">${h.E(it.d)}</span>` : ""}</div>`
    ).join("");
  } else if (ls === "pill") {
    inner = `<div style="display:flex;flex-direction:column;gap:.5rem;">${items.map((it) => `<a href="${h.A(it.u || "#")}" ${itTgt(it)} style="display:block;border:1px solid ${h.rgb(h.accent, 0.18)};background:${h.rgb(h.accent, 0.04)};padding:.8rem 1.4rem;border-radius:40px;text-decoration:none;"><div style="font-weight:300;font-size:.9rem;letter-spacing:.06em;color:${h.rgb(h.text, 0.88)};">${h.E(it.t || "")}</div>${it.d ? `<div style="font-size:.62rem;font-weight:200;color:${h.rgb(h.accent, 0.42)};margin-top:.15rem;">${h.E(it.d)}</div>` : ""}</a>`).join("")}</div>`;
  } else {
    inner = `<div style="display:flex;flex-direction:column;gap:.52rem;">${items.map((it) => `<a href="${h.A(it.u || "#")}" ${itTgt(it)} style="display:block;border:1px solid ${h.rgb(h.accent, 0.15)};background:${h.rgb(h.accent, 0.03)};padding:.85rem 1.2rem;text-decoration:none;"><div style="font-weight:300;font-size:.9rem;letter-spacing:.06em;color:${h.rgb(h.text, 0.88)};">${h.E(it.t || "")}</div>${it.d ? `<div style="font-size:.62rem;font-weight:200;color:${h.rgb(h.accent, 0.42)};margin-top:.18rem;">${h.E(it.d)}</div>` : ""}</a>`).join("")}</div>`;
  }
  return `<div style="${h.ff}${h.fc}padding:${p};">${inner}</div>`;
}
