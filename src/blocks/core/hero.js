export function preview(s, h) {
  const ta = `text-align:${s.align || "center"};`;
  const sz = s.name_size === "sm" ? "1.6rem" : s.name_size === "md" ? "2.2rem" : s.name_size === "xl" ? "clamp(3rem,10vw,5rem)" : "clamp(1.9rem,8vw,3.2rem)";
  const fw = s.weight || "300";
  const ls = s.ls === "tight" ? "-.03em" : s.ls === "wide" ? ".06em" : "-.01em";
  const p = s.pad === "sm" ? "2rem 2rem 1.5rem" : s.pad === "lg" ? "7rem 2rem 6rem" : "4rem 2rem 3rem";
  const bgImg = s.bg_img ? `background-image:url('${h.A(s.bg_img)}');background-size:cover;background-position:center;position:relative;` : "";
  const overlay = s.bg_img ? `<div style="position:absolute;inset:0;background:rgba(0,0,0,${s.bg_overlay || "0.45"});"></div>` : "";
  return `<div style="${h.ff}${h.fc}${bgImg}${ta}padding:${p};">${overlay}
        <div style="position:relative;">
        ${s.eyebrow ? `<p style="font-size:.72rem;letter-spacing:.4em;text-transform:uppercase;color:${h.accent};margin-bottom:1rem;font-weight:200;">${h.E(s.eyebrow)}</p>` : ""}
        <h1 style="font-size:${sz};font-weight:${fw};letter-spacing:${ls};margin:0 0 .5rem;line-height:1.08;">${h.E(s.name || "Your Name")}</h1>
        ${s.tagline ? `<p style="font-size:.95rem;font-weight:200;font-style:italic;color:${h.rgb(h.text, 0.52)};letter-spacing:.1em;margin-top:.3rem;">${h.E(s.tagline)}</p>` : ""}
        </div></div>`;
}
export function render(s, h) {
  const ta = `text-align:${s.align || "center"};`;
  const sz = s.name_size === "sm" ? "1.6rem" : s.name_size === "md" ? "2.2rem" : s.name_size === "xl" ? "clamp(3rem,10vw,5rem)" : "clamp(1.9rem,8vw,3.2rem)";
  const fw = s.weight || "300";
  const ls2 = s.ls === "tight" ? "-.03em" : s.ls === "wide" ? ".06em" : "-.01em";
  const p = s.pad === "sm" ? "2rem 2rem 1.5rem" : s.pad === "lg" ? "7rem 2rem 6rem" : "4rem 2rem 3rem";
  const bgImg = s.bg_img ? `background-image:url('${h.A(s.bg_img)}');background-size:cover;background-position:center;position:relative;` : "";
  const overlay = s.bg_img ? `<div style="position:absolute;inset:0;background:rgba(0,0,0,${s.bg_overlay || "0.45"});"></div>` : "";
  return `<div style="${h.ff}${h.fc}${bgImg}${ta}padding:${p};">${overlay}<div style="position:relative;">
            ${s.eyebrow ? `<p style="font-size:.72rem;letter-spacing:.4em;text-transform:uppercase;color:${h.accent};margin-bottom:1rem;font-weight:200;">${h.E(s.eyebrow)}</p>` : ""}
            <h1${s.scramble === "yes" ? " data-scramble" : ""} style="font-size:${sz};font-weight:${fw};letter-spacing:${ls2};margin:0 0 .5rem;line-height:1.08;">${h.E(s.name || "")}</h1>
            ${s.tagline ? `<p style="font-size:.95rem;font-weight:200;font-style:italic;color:${h.rgb(h.text, 0.52)};letter-spacing:.1em;margin-top:.3rem;">${h.E(s.tagline)}</p>` : ""}
          </div></div>`;
}
