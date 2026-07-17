export function preview(s, h) {
  const p = s.pad === "sm" ? "1.5rem 2rem" : s.pad === "lg" ? "5rem 2rem" : "3rem 2rem";
  const rev = s.reverse === "yes" ? "direction:rtl;" : "";
  const r2 = s.radius === "sm" ? "4px" : s.radius === "lg" ? "12px" : s.radius === "circle" ? "50%" : "0";
  const imgW = s.img_w === "sm" ? "35%" : s.img_w === "lg" ? "55%" : "45%";
  const imgH = s.img_h === "sm" ? "200px" : s.img_h === "lg" ? "420px" : "300px";
  const imgHtml = s.img ? `<img src="${h.A(s.img)}" alt="" style="width:100%;height:${imgH};object-fit:cover;border-radius:${r2};display:block;" />` : `<div style="width:100%;height:${imgH};background:${h.rgb(h.accent, 0.06)};border:1px dashed ${h.rgb(h.accent, 0.15)};border-radius:${r2};"></div>`;
  return `<div style="${h.ff}${h.fc}padding:${p};"><div style="display:grid;grid-template-columns:${imgW} 1fr;gap:2.5rem;align-items:center;${rev}">
        <div style="direction:ltr;">${imgHtml}</div>
        <div style="direction:ltr;">
          ${s.eyebrow ? `<p style="font-size:.6rem;letter-spacing:.38em;text-transform:uppercase;color:${h.accent};margin-bottom:.6rem;font-weight:200;">${h.E(s.eyebrow)}</p>` : ""}
          ${s.heading ? `<h2 style="font-size:clamp(1.2rem,3vw,1.8rem);font-weight:300;letter-spacing:.02em;margin-bottom:.8rem;line-height:1.15;">${h.E(s.heading)}</h2>` : ""}
          ${s.body ? `<p style="font-weight:200;font-size:.88rem;line-height:1.85;color:${h.rgb(h.text, 0.68)};">${h.E(s.body)}</p>` : ""}
          ${s.btn_label ? `<a href="${h.A(s.btn_url || "#")}" style="display:inline-block;margin-top:1.2rem;font-size:.68rem;font-weight:300;letter-spacing:.2em;text-transform:uppercase;color:${h.accent};border:1px solid ${h.rgb(h.accent, 0.3)};padding:.55rem 1.4rem;text-decoration:none;">${h.E(s.btn_label)}</a>` : ""}
        </div>
      </div></div>`;
}
export function render(s, h) {
  const p = s.pad === "sm" ? "1.5rem 2rem" : s.pad === "lg" ? "5rem 2rem" : "3rem 2rem";
  const rev = s.reverse === "yes" ? "direction:rtl;" : "";
  const r2 = s.radius === "sm" ? "4px" : s.radius === "lg" ? "12px" : s.radius === "circle" ? "50%" : "0";
  const imgW = s.img_w === "sm" ? "35%" : s.img_w === "lg" ? "55%" : "45%";
  const imgH = s.img_h === "sm" ? "200px" : s.img_h === "lg" ? "420px" : "300px";
  const imgHtml = s.img ? `<img src="${h.A(s.img)}" alt="" style="width:100%;height:${imgH};object-fit:cover;border-radius:${r2};display:block;" />` : `<div style="width:100%;height:${imgH};background:${h.rgb(h.accent, 0.06)};border-radius:${r2};"></div>`;
  return `<div style="${h.ff}${h.fc}padding:${p};"><div style="display:grid;grid-template-columns:${imgW} 1fr;gap:2.5rem;align-items:center;${rev}">
            <div style="direction:ltr;">${imgHtml}</div>
            <div style="direction:ltr;">
              ${s.eyebrow ? `<p style="font-size:.6rem;letter-spacing:.38em;text-transform:uppercase;color:${h.accent};margin-bottom:.6rem;font-weight:200;">${h.E(s.eyebrow)}</p>` : ""}
              ${s.heading ? `<h2 style="font-size:clamp(1.2rem,3vw,1.8rem);font-weight:300;letter-spacing:.02em;margin-bottom:.8rem;line-height:1.15;">${h.E(s.heading)}</h2>` : ""}
              ${s.body ? `<p style="font-weight:200;font-size:.88rem;line-height:1.85;color:${h.rgb(h.text, 0.68)};">${h.E(s.body)}</p>` : ""}
              ${s.btn_label ? `<a href="${h.A(s.btn_url || "#")}" style="display:inline-block;margin-top:1.2rem;font-size:.68rem;font-weight:300;letter-spacing:.2em;text-transform:uppercase;color:${h.accent};border:1px solid ${h.rgb(h.accent, 0.3)};padding:.55rem 1.4rem;text-decoration:none;">${h.E(s.btn_label)}</a>` : ""}
            </div>
          </div></div>`;
}
