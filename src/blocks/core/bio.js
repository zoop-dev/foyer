export function preview(s, h) {
  const ta = `text-align:${s.align || "left"};`;
  const mw = s.max_w === "narrow" ? "360px" : s.max_w === "wide" ? "680px" : s.max_w === "full" ? "100%" : "520px";
  const mc = s.align === "center" ? "margin:0 auto;" : "";
  const fs = s.fsize === "sm" ? ".82rem" : s.fsize === "lg" ? "1.05rem" : ".92rem";
  const lh = s.lh === "compact" ? "1.55" : s.lh === "relaxed" ? "2.3" : "1.9";
  const p = s.pad === "sm" ? "1.2rem 2rem" : s.pad === "lg" ? "4.5rem 2rem" : "2.5rem 2rem";
  const pr = s.photo_radius === "circle" ? "50%" : s.photo_radius === "sm" ? "4px" : s.photo_radius === "lg" ? "12px" : "0";
  const photoHtml = s.photo ? `<img src="${h.A(s.photo)}" alt="" style="width:${s.photo_size || "80px"};height:${s.photo_size || "80px"};object-fit:cover;border-radius:${pr};display:block;${s.align === "center" ? "margin:0 auto 1.2rem;" : "margin-bottom:1.2rem;"}" />` : "";
  return `<div style="${h.ff}${h.fc}${ta}padding:${p};">
        ${photoHtml}
        ${s.heading ? `<h2 style="font-size:1.35rem;font-weight:300;letter-spacing:.04em;margin-bottom:1rem;">${h.E(s.heading)}</h2>` : ""}
        <div class="md-content" style="font-weight:200;font-size:${fs};line-height:${lh};color:${h.rgb(h.text, 0.72)};max-width:${mw};${mc}">${h.md(s.body)}</div>
      </div>`;
}
export function render(s, h) {
  const ta = `text-align:${s.align || "left"};`;
  const mw = s.max_w === "narrow" ? "360px" : s.max_w === "wide" ? "680px" : s.max_w === "full" ? "100%" : "520px";
  const mc = s.align === "center" ? "margin:0 auto;" : "";
  const fs = s.fsize === "sm" ? ".82rem" : s.fsize === "lg" ? "1.05rem" : ".92rem";
  const lh = s.lh === "compact" ? "1.55" : s.lh === "relaxed" ? "2.3" : "1.9";
  const p = s.pad === "sm" ? "1.2rem 2rem" : s.pad === "lg" ? "4.5rem 2rem" : "2.5rem 2rem";
  const pr = s.photo_radius === "circle" ? "50%" : s.photo_radius === "sm" ? "4px" : s.photo_radius === "lg" ? "12px" : "0";
  const photoHtml = s.photo ? `<img src="${h.A(s.photo)}" alt="" style="width:${s.photo_size || "80px"};height:${s.photo_size || "80px"};object-fit:cover;border-radius:${pr};display:block;${s.align === "center" ? "margin:0 auto 1.2rem;" : "margin-bottom:1.2rem;"}" />` : "";
  return `<div style="${h.ff}${h.fc}${ta}padding:${p};">
            ${photoHtml}
            ${s.heading ? `<h2 style="font-size:1.35rem;font-weight:300;letter-spacing:.04em;margin-bottom:1rem;">${h.E(s.heading)}</h2>` : ""}
            <div class="md-content" style="font-weight:200;font-size:${fs};line-height:${lh};color:${h.rgb(h.text, 0.7)};max-width:${mw};${mc}">${h.md(s.body)}</div>
          </div>`;
}
