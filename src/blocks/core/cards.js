export function preview(s, h) {
  const items = s.items || [];
  const p = s.pad === "sm" ? "1rem 2rem" : s.pad === "lg" ? "4rem 2rem" : "2rem 2rem";
  const layout = s.layout || "grid-2";
  const r = s.radius === "sm" ? "4px" : s.radius === "lg" ? "12px" : "0";
  const cImg = (it, hh = "140px") => it.img ? `<img src="${h.A(it.img)}" alt="" style="width:100%;height:${hh};object-fit:cover;display:block;border-radius:${r};" />` : `<div style="width:100%;height:${hh};background:${h.rgb(h.accent, 0.06)};border:1px dashed ${h.rgb(h.accent, 0.15)};border-radius:${r};display:flex;align-items:center;justify-content:center;font-size:.52rem;letter-spacing:.15em;color:${h.rgb(h.accent, 0.25)};">image</div>`;
  const cText = (it) => it.title || it.body ? `<div style="padding:.65rem 0;">${it.title ? `<div style="font-weight:300;font-size:.85rem;letter-spacing:.04em;color:${h.rgb(h.text, 0.9)};margin-bottom:.25rem;">${h.E(it.title)}</div>` : ""} ${it.body ? `<div style="font-weight:200;font-size:.76rem;line-height:1.7;color:${h.rgb(h.text, 0.52)};">${h.E(it.body)}</div>` : ""}</div>` : " ";
  const cOpen = (it, sty = "") => it.url ? `<a href="${h.A(it.url || "#")}" ${it.new_tab !== "no" ? 'target="_blank" rel="noopener"' : ""} style="${sty}display:block;text-decoration:none;">` : `<div style="${sty}">`;
  const cClose = (it) => it.url ? "</a>" : "</div>";
  let inner;
  if (layout === "grid-2") {
    inner = `<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:1.2rem;">${items.map((it) => `${cOpen(it)}${cImg(it)}${cText(it)}${cClose(it)}`).join("")}</div>`;
  } else if (layout === "grid-3") {
    inner = `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;">${items.map((it) => `${cOpen(it)}${cImg(it, "110px")}${cText(it)}${cClose(it)}`).join("")}</div>`;
  } else if (layout === "grid-4") {
    inner = `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:.7rem;">${items.map((it) => `${cOpen(it)}${cImg(it, "80px")}${it.title ? `<div style="font-weight:300;font-size:.7rem;letter-spacing:.04em;color:${h.rgb(h.text, 0.85)};margin-top:.38rem;">${h.E(it.title)}</div>` : " "}${cClose(it)}`).join("")}</div>`;
  } else if (layout === "feature") {
    const [first, ...rest] = items;
    inner = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">${first ? `<div style="grid-row:1/span ${Math.max(2, rest.length)};">${cOpen(first)}${cImg(first, "100%")}${cText(first)}${cClose(first)}</div>` : ""}${rest.map((it) => `<div>${cOpen(it)}${cImg(it, "110px")}${cText(it)}${cClose(it)}</div>`).join("")}</div>`;
  } else if (layout === "horizontal") {
    inner = items.map(
      (it) => `${cOpen(it, `display:grid;grid-template-columns:2fr 3fr;gap:1.2rem;align-items:center;padding:.75rem;border:1px solid ${h.rgb(h.accent, 0.09)};margin-bottom:.65rem;`)}${cImg(it, "100px")}<div>${it.title ? `<div style="font-weight:300;font-size:.88rem;letter-spacing:.04em;color:${h.rgb(h.text, 0.9)};margin-bottom:.28rem;">${h.E(it.title)}</div>` : ""} ${it.body ? `<div style="font-weight:200;font-size:.76rem;line-height:1.7;color:${h.rgb(h.text, 0.52)};">${h.E(it.body)}</div>` : ""}</div>${cClose(it)}`
    ).join("");
  } else {
    inner = `<div style="display:flex;flex-direction:column;">${items.map((it) => `${cOpen(it, `display:flex;gap:.9rem;align-items:center;padding:.55rem 0;border-bottom:1px solid ${h.rgb(h.accent, 0.07)};`)} <div style="flex-shrink:0;width:68px;height:50px;overflow:hidden;border-radius:${r};">${it.img ? `<img src="${h.A(it.img)}" alt="" style="width:100%;height:100%;object-fit:cover;" />` : `<div style="width:100%;height:100%;background:${h.rgb(h.accent, 0.06)};border:1px dashed ${h.rgb(h.accent, 0.12)};"></div>`}</div><div style="flex:1;min-width:0;">${it.title ? `<div style="font-weight:300;font-size:.82rem;letter-spacing:.04em;color:${h.rgb(h.text, 0.88)};margin-bottom:.15rem;">${h.E(it.title)}</div>` : ""} ${it.body ? `<div style="font-weight:200;font-size:.7rem;line-height:1.6;color:${h.rgb(h.text, 0.5)};">${h.E(it.body)}</div>` : ""}</div>${cClose(it)}`).join("")}</div>`;
  }
  return `<div style="${h.ff}${h.fc}padding:${p};">${inner}</div>`;
}
export function render(s, h) {
  const items = s.items || [];
  const p = s.pad === "sm" ? "1rem 2rem" : s.pad === "lg" ? "4rem 2rem" : "2rem 2rem";
  const layout = s.layout || "grid-2";
  const r = s.radius === "sm" ? "4px" : s.radius === "lg" ? "12px" : "0";
  const cImg = (it, hh = "140px") => it.img ? `<img src="${h.A(it.img)}" alt="${h.A(it.title || "")}" style="width:100%;height:${hh};object-fit:cover;display:block;border-radius:${r};" />` : `<div style="width:100%;height:${hh};background:${h.rgb(h.accent, 0.06)};border:1px dashed ${h.rgb(h.accent, 0.15)};border-radius:${r};"></div>`;
  const cText = (it) => it.title || it.body ? `<div style="padding:.65rem 0;">${it.title ? `<div style="font-weight:300;font-size:.85rem;letter-spacing:.04em;color:${h.rgb(h.text, 0.9)};margin-bottom:.25rem;">${h.E(it.title)}</div>` : ""} ${it.body ? `<div style="font-weight:200;font-size:.76rem;line-height:1.7;color:${h.rgb(h.text, 0.52)};">${h.E(it.body)}</div>` : ""}</div>` : " ";
  const cOpen = (it, sty = "") => it.url ? `<a href="${h.A(it.url)}" ${it.new_tab !== "no" ? 'target="_blank" rel="noopener"' : ""} style="${sty}display:block;text-decoration:none;">` : `<div style="${sty}">`;
  const cClose = (it) => it.url ? "</a>" : "</div>";
  let inner;
  if (layout === "grid-2") {
    inner = `<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:1.2rem;">${items.map((it) => `${cOpen(it)}${cImg(it)}${cText(it)}${cClose(it)}`).join("")}</div>`;
  } else if (layout === "grid-3") {
    inner = `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;">${items.map((it) => `${cOpen(it)}${cImg(it, "110px")}${cText(it)}${cClose(it)}`).join("")}</div>`;
  } else if (layout === "grid-4") {
    inner = `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:.7rem;">${items.map((it) => `${cOpen(it)}${cImg(it, "80px")}${it.title ? `<div style="font-weight:300;font-size:.7rem;letter-spacing:.04em;color:${h.rgb(h.text, 0.85)};margin-top:.38rem;">${h.E(it.title)}</div>` : " "}${cClose(it)}`).join("")}</div>`;
  } else if (layout === "feature") {
    const [first, ...rest] = items;
    inner = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">${first ? `<div style="grid-row:1/span ${Math.max(2, rest.length)};">${cOpen(first)}${cImg(first, "100%")}${cText(first)}${cClose(first)}</div>` : ""}${rest.map((it) => `<div>${cOpen(it)}${cImg(it, "110px")}${cText(it)}${cClose(it)}</div>`).join("")}</div>`;
  } else if (layout === "horizontal") {
    inner = items.map(
      (it) => `${cOpen(it, `display:grid;grid-template-columns:2fr 3fr;gap:1.2rem;align-items:center;padding:.75rem;border:1px solid ${h.rgb(h.accent, 0.09)};margin-bottom:.65rem;`)}${cImg(it, "100px")}<div>${it.title ? `<div style="font-weight:300;font-size:.88rem;letter-spacing:.04em;color:${h.rgb(h.text, 0.9)};margin-bottom:.28rem;">${h.E(it.title)}</div>` : ""} ${it.body ? `<div style="font-weight:200;font-size:.76rem;line-height:1.7;color:${h.rgb(h.text, 0.52)};">${h.E(it.body)}</div>` : ""}</div>${cClose(it)}`
    ).join("");
  } else {
    inner = `<div style="display:flex;flex-direction:column;">${items.map((it) => `${cOpen(it, `display:flex;gap:.9rem;align-items:center;padding:.55rem 0;border-bottom:1px solid ${h.rgb(h.accent, 0.07)};`)} <div style="flex-shrink:0;width:68px;height:50px;overflow:hidden;border-radius:${r};">${it.img ? `<img src="${h.A(it.img)}" alt="" style="width:100%;height:100%;object-fit:cover;" />` : `<div style="width:100%;height:100%;background:${h.rgb(h.accent, 0.06)};"></div>`}</div><div style="flex:1;min-width:0;">${it.title ? `<div style="font-weight:300;font-size:.82rem;letter-spacing:.04em;color:${h.rgb(h.text, 0.88)};margin-bottom:.15rem;">${h.E(it.title)}</div>` : ""} ${it.body ? `<div style="font-weight:200;font-size:.7rem;line-height:1.6;color:${h.rgb(h.text, 0.5)};">${h.E(it.body)}</div>` : ""}</div>${cClose(it)}`).join("")}</div>`;
  }
  return `<div style="${h.ff}${h.fc}padding:${p};">${inner}</div>`;
}
