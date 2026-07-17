export const PACK = {
  name: "social-proof",
  label: "Social Proof",
  description: "Trust-building blocks — counters, reviews, activity feeds, press logos and more, all fed by numbers and copy you enter yourself.",
  icon: "badge-check"
};
function pad(s) {
  return s.pad === "sm" ? "1.5rem 2rem" : s.pad === "lg" ? "4.5rem 2rem" : "2.5rem 2rem";
}
function placeholder(h, text) {
  return `<div style="border:1px dashed ${h.rgb(h.accent, 0.15)};padding:1.75rem;text-align:center;font-size:.62rem;letter-spacing:.2em;text-transform:uppercase;color:${h.rgb(h.accent, 0.32)};font-weight:200;">${h.E(text)}</div>`;
}
function stars(h, n) {
  const r = Math.max(0, Math.min(5, Number(n) || 0));
  let out = "";
  for (let i = 1; i <= 5; i++) {
    out += `<span style="color:${i <= r ? h.accent : h.rgb(h.text, 0.2)};font-size:.75rem;">★</span>`;
  }
  return out;
}
function initials(name) {
  const n = String(name || "").trim();
  if (!n) return "?";
  const parts = n.split(/\s+/);
  return (parts[0][0] + (parts[1] ? parts[1][0] : "")).toUpperCase();
}
function avatar(h, url, name, size) {
  if (url) {
    return `<img src="${h.A(url)}" alt="${h.A(name || "")}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;flex-shrink:0;background:${h.rgb(h.text, 0.08)};" />`;
  }
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:${h.rgb(h.accent, 0.14)};color:${h.accent};font-size:${Math.round(size * 0.36)}px;font-weight:400;letter-spacing:.02em;">${h.E(initials(name))}</div>`;
}
function visitorCountHtml(s, h) {
  const uid = "spvc-" + Math.random().toString(36).slice(2, 8);
  return `<div style="${h.ff}${h.fc}padding:${pad(s)};text-align:center;">
    <style>
      #${uid}{opacity:0;transform:translateY(8px);animation:${uid} .7s cubic-bezier(.2,.7,.3,1) .05s forwards;}
      @keyframes ${uid}{to{opacity:1;transform:translateY(0);}}
    </style>
    <div id="${uid}" style="font-size:clamp(2.2rem,7vw,3.4rem);font-weight:300;letter-spacing:-.02em;color:${h.accent};font-variant-numeric:tabular-nums;">${h.E(s.count || "0")}</div>
    <div style="font-size:.65rem;font-weight:200;letter-spacing:.3em;text-transform:uppercase;color:${h.rgb(h.text, 0.5)};margin-top:.4rem;">${h.E(s.label || "")}</div>
  </div>`;
}
export const spVisitorCount = {
  type: "sp-visitor-count",
  label: "Visitor counter",
  icon: "users",
  defaults(id) {
    return { id, type: "sp-visitor-count", count: "10,000+", label: "Happy customers" };
  },
  preview(s, h) {
    return visitorCountHtml(s, h);
  },
  render(s, h) {
    return visitorCountHtml(s, h);
  },
  editorFields(s) {
    return `<div class="bld-ef"><label>Number</label><input type="text" data-f="count" value="${String(s.count || "").replace(/"/g, "&quot;")}" placeholder="10,000+" /></div>
      <div class="bld-ef"><label>Label</label><input type="text" data-f="label" value="${String(s.label || "").replace(/"/g, "&quot;")}" placeholder="Happy customers" /></div>`;
  }
};
function activityTickerHtml(s, h) {
  const items = s.items || [];
  const rows = items.map(
    (it, i) => `<div style="display:flex;align-items:center;gap:.7rem;padding:.65rem 0;${i < items.length - 1 ? `border-bottom:1px solid ${h.rgb(h.text, 0.08)};` : ""}">
        <span style="width:6px;height:6px;border-radius:50%;background:${h.accent};flex-shrink:0;box-shadow:0 0 0 3px ${h.rgb(h.accent, 0.15)};"></span>
        <span style="font-size:.82rem;font-weight:200;color:${h.rgb(h.text, 0.85)};flex:1;">${h.E(it.text || "")}</span>
        <span style="font-size:.62rem;letter-spacing:.08em;color:${h.rgb(h.text, 0.4)};white-space:nowrap;">${h.E(it.timeAgo || "")}</span>
      </div>`
  ).join("");
  return `<div style="${h.ff}${h.fc}padding:${pad(s)};">
    <div style="max-width:26rem;margin:0 auto;background:${h.rgb(h.text, 0.03)};border:1px solid ${h.rgb(h.text, 0.08)};border-radius:.6rem;padding:.25rem 1rem;">
      ${rows || placeholder(h, "Add activity events in editor")}
    </div>
  </div>`;
}
export const spActivityTicker = {
  type: "sp-activity-ticker",
  label: "Activity ticker",
  icon: "activity",
  defaults(id) {
    return {
      id,
      type: "sp-activity-ticker",
      items: [
        { text: "Someone from New York just signed up", timeAgo: "2m ago" },
        { text: "Someone from Austin purchased a plan", timeAgo: "17m ago" }
      ]
    };
  },
  preview(s, h) {
    return activityTickerHtml(s, h);
  },
  render(s, h) {
    return activityTickerHtml(s, h);
  },
  editorFields(s) {
    const esc = (v) => String(v || "").replace(/"/g, "&quot;");
    const items = s.items || [];
    return `<div id="spatItems">${items.map(
      (it, i) => `<div class="bld-li-item">
        <button class="bld-li-rm" data-lrm="${i}">✕</button>
        <div class="bld-ef"><label>Event text</label><input type="text" data-li="${i}" data-lf="text" value="${esc(it.text)}" /></div>
        <div class="bld-ef"><label>Time ago</label><input type="text" data-li="${i}" data-lf="timeAgo" value="${esc(it.timeAgo)}" placeholder="2m ago" /></div>
      </div>`
    ).join("")}</div>
      <button class="bld-add-li bld-add-item" data-shape='{"text":"","timeAgo":"just now"}'>+ Add event</button>`;
  }
};
function reviewCarouselHtml(s, h) {
  const items = s.items || [];
  const cards = items.map(
    (it) => `<div style="scroll-snap-align:start;flex:0 0 auto;width:16rem;background:${h.rgb(h.text, 0.03)};border:1px solid ${h.rgb(h.text, 0.08)};border-radius:.6rem;padding:1.25rem;">
        <div style="margin-bottom:.5rem;">${stars(h, it.rating)}</div>
        <div style="font-size:.82rem;font-weight:200;line-height:1.7;color:${h.rgb(h.text, 0.82)};margin-bottom:1rem;">${h.E(it.quote || "")}</div>
        <div style="display:flex;align-items:center;gap:.6rem;">
          ${avatar(h, it.avatar, it.name, 32)}
          <span style="font-size:.72rem;letter-spacing:.04em;color:${h.rgb(h.text, 0.6)};">${h.E(it.name || "")}</span>
        </div>
      </div>`
  ).join("");
  return `<div style="${h.ff}${h.fc}padding:${pad(s)};">
    ${cards ? `<div style="display:flex;gap:1.1rem;overflow-x:auto;scroll-snap-type:x mandatory;padding:.25rem .1rem 1rem;">${cards}</div>` : placeholder(h, "Add reviews in editor")}
  </div>`;
}
export const spReviewCarousel = {
  type: "sp-review-carousel",
  label: "Review carousel",
  icon: "star",
  defaults(id) {
    return {
      id,
      type: "sp-review-carousel",
      items: [
        {
          name: "Jamie R.",
          avatar: "",
          quote: "Exactly what we needed — clean, fast and the support was great.",
          rating: "5"
        },
        {
          name: "Priya S.",
          avatar: "",
          quote: "Switched over in an afternoon. Would recommend to anyone.",
          rating: "5"
        }
      ]
    };
  },
  preview(s, h) {
    return reviewCarouselHtml(s, h);
  },
  render(s, h) {
    return reviewCarouselHtml(s, h);
  },
  editorFields(s) {
    const esc = (v) => String(v || "").replace(/"/g, "&quot;");
    const items = s.items || [];
    return `<div id="sprcItems">${items.map(
      (it, i) => `<div class="bld-li-item">
        <button class="bld-li-rm" data-lrm="${i}">✕</button>
        <div class="bld-ef"><label>Name</label><input type="text" data-li="${i}" data-lf="name" value="${esc(it.name)}" /></div>
        <div class="bld-ef"><label>Avatar URL</label><input type="url" data-li="${i}" data-lf="avatar" value="${esc(it.avatar)}" /></div>
        <div class="bld-ef"><label>Quote</label><input type="text" data-li="${i}" data-lf="quote" value="${esc(it.quote)}" /></div>
        <div class="bld-ef"><label>Rating (0-5)</label><input type="number" min="0" max="5" data-li="${i}" data-lf="rating" value="${esc(it.rating)}" /></div>
      </div>`
    ).join("")}</div>
      <button class="bld-add-li bld-add-item" data-shape='{"name":"","avatar":"","quote":"","rating":"5"}'>+ Add review</button>`;
  }
};
function pressLogosHtml(s, h) {
  const items = s.items || [];
  const heading = s.heading ? `<div style="font-size:.62rem;font-weight:200;letter-spacing:.3em;text-transform:uppercase;text-align:center;color:${h.rgb(h.text, 0.4)};margin-bottom:1.4rem;">${h.E(s.heading)}</div>` : "";
  const logos = items.map((it) => {
    const img = it.img ? `<img src="${h.A(it.img)}" alt="${h.A(it.label || "")}" style="height:1.6rem;max-width:8rem;object-fit:contain;filter:grayscale(1) opacity(.6);transition:filter .25s ease;" onmouseover="" />` : `<span style="font-size:.85rem;letter-spacing:.06em;color:${h.rgb(h.text, 0.4)};">${h.E(it.label || "")}</span>`;
    const inner = it.url ? `<a href="${h.A(it.url)}" target="_blank" rel="noopener" style="display:block;">${img}</a>` : img;
    return `<div class="sp-press-logo" style="display:flex;align-items:center;">${inner}</div>`;
  }).join("");
  const uid = "sppl-" + Math.random().toString(36).slice(2, 8);
  return `<div id="${uid}" style="${h.ff}${h.fc}padding:${pad(s)};">
    <style>#${uid} .sp-press-logo img{filter:grayscale(1) opacity(.55);transition:filter .25s ease;}#${uid} .sp-press-logo:hover img{filter:grayscale(0) opacity(1);}</style>
    ${heading}
    ${logos ? `<div style="display:flex;flex-wrap:wrap;gap:2.5rem;align-items:center;justify-content:center;">${logos}</div>` : placeholder(h, "Add logos in editor")}
  </div>`;
}
export const spPressLogos = {
  type: "sp-press-logos",
  label: "Press logos",
  icon: "newspaper",
  defaults(id) {
    return {
      id,
      type: "sp-press-logos",
      heading: "As seen in",
      items: [
        { img: "", label: "Forbes", url: "" },
        { img: "", label: "TechCrunch", url: "" },
        { img: "", label: "Product Hunt", url: "" }
      ]
    };
  },
  preview(s, h) {
    return pressLogosHtml(s, h);
  },
  render(s, h) {
    return pressLogosHtml(s, h);
  },
  editorFields(s) {
    const esc = (v) => String(v || "").replace(/"/g, "&quot;");
    const items = s.items || [];
    return `<div class="bld-ef"><label>Heading</label><input type="text" data-f="heading" value="${esc(s.heading)}" placeholder="As seen in" /></div>
      <div id="spplItems">${items.map(
      (it, i) => `<div class="bld-li-item">
        <button class="bld-li-rm" data-lrm="${i}">✕</button>
        <div class="bld-ef"><label>Logo image URL</label><input type="url" data-li="${i}" data-lf="img" value="${esc(it.img)}" /></div>
        <div class="bld-ef"><label>Fallback label</label><input type="text" data-li="${i}" data-lf="label" value="${esc(it.label)}" /></div>
        <div class="bld-ef"><label>Link URL</label><input type="url" data-li="${i}" data-lf="url" value="${esc(it.url)}" /></div>
      </div>`
    ).join("")}</div>
      <button class="bld-add-li bld-add-item" data-shape='{"img":"","label":"Brand","url":""}'>+ Add logo</button>`;
  }
};
function chatBubbleHtml(s, h) {
  const side = s.position === "left" ? "left:1.5rem;" : "right:1.5rem;";
  const label = s.label ? `<span style="max-width:0;overflow:hidden;white-space:nowrap;transition:max-width .3s ease, margin .3s ease;font-size:.78rem;letter-spacing:.02em;">${h.E(s.label)}</span>` : "";
  const uid = "spcb-" + Math.random().toString(36).slice(2, 8);
  return `<div style="${h.ff}">
    <style>
      #${uid}{position:fixed;bottom:1.5rem;${side}z-index:60;display:inline-flex;align-items:center;gap:.5rem;background:${h.accent};color:${h.bg};border-radius:999px;padding:.85rem;box-shadow:0 8px 24px ${h.rgb(h.accent, 0.35)};text-decoration:none;transition:padding .25s ease, box-shadow .25s ease;}
      #${uid}:hover{box-shadow:0 10px 30px ${h.rgb(h.accent, 0.5)};}
      #${uid}:hover span{max-width:12rem;margin-right:.15rem;}
      #${uid} svg{flex-shrink:0;}
    </style>
    <a id="${uid}" href="${h.A(s.url || "#")}" target="_blank" rel="noopener">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
      ${label}
    </a>
  </div>`;
}
export const spChatBubble = {
  type: "sp-chat-bubble",
  label: "Chat bubble",
  icon: "message-circle",
  defaults(id) {
    return {
      id,
      type: "sp-chat-bubble",
      label: "Chat with us",
      url: "https://wa.me/15551234567",
      position: "right"
    };
  },
  preview(s, h) {
    return chatBubbleHtml(s, h);
  },
  render(s, h) {
    return chatBubbleHtml(s, h);
  },
  editorFields(s) {
    const esc = (v) => String(v || "").replace(/"/g, "&quot;");
    return `<div class="bld-ef"><label>Label</label><input type="text" data-f="label" value="${esc(s.label)}" placeholder="Chat with us" /></div>
      <div class="bld-ef"><label>Link URL <span style="opacity:.5">(WhatsApp, Calendly, mailto:, etc.)</span></label><input type="url" data-f="url" value="${esc(s.url)}" placeholder="https://wa.me/15551234567" /></div>
      <div class="bld-ef"><label>Position</label><select data-f="position">
        <option value="right"${s.position !== "left" ? " selected" : ""}>Bottom right</option>
        <option value="left"${s.position === "left" ? " selected" : ""}>Bottom left</option>
      </select></div>`;
  }
};
const SHARE_ICONS = {
  twitter: '<path d="M22 5.9c-.7.3-1.5.5-2.3.6.8-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1a4.1 4.1 0 0 0-7 3.7A11.6 11.6 0 0 1 3.4 4.6a4.1 4.1 0 0 0 1.3 5.5c-.7 0-1.3-.2-1.9-.5v.1c0 2 1.4 3.6 3.3 4a4.1 4.1 0 0 1-1.9.1 4.1 4.1 0 0 0 3.8 2.8A8.2 8.2 0 0 1 2 18.4a11.6 11.6 0 0 0 6.3 1.8c7.5 0 11.7-6.3 11.7-11.7v-.5c.8-.6 1.5-1.3 2-2.1Z"></path>',
  facebook: '<path d="M14 9V6.5c0-.8.5-1 1-1h2V2h-3c-2.7 0-4 2-4 4.3V9H8v3.5h2V22h4v-9.5h2.6L17 9h-3Z"></path>',
  linkedin: '<path d="M6.94 4.5a2 2 0 1 1-4-.1 2 2 0 0 1 4 .1ZM3 8.75h4V21H3V8.75ZM9.5 8.75h3.8v1.68h.05c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.85c0-1.4-.03-3.2-1.95-3.2-1.96 0-2.26 1.53-2.26 3.1V21h-4V8.75Z"></path>',
  whatsapp: '<path d="M20.5 3.5A10.9 10.9 0 0 0 3.2 16.7L2 22l5.4-1.4a10.9 10.9 0 0 0 5.2 1.3h.01a10.9 10.9 0 0 0 7.9-18.4ZM12.6 20.2a9 9 0 0 1-4.6-1.3l-.33-.2-3.2.85.86-3.14-.22-.32a9.1 9.1 0 1 1 7.5 4.1Zm5-6.8c-.28-.14-1.63-.8-1.88-.9-.25-.1-.44-.14-.62.14-.19.28-.72.9-.88 1.08-.16.19-.32.2-.6.07-.28-.14-1.17-.43-2.23-1.37-.82-.74-1.38-1.64-1.54-1.92-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.5.14-.16.19-.28.28-.47.1-.19.05-.35-.02-.5-.07-.13-.62-1.5-.85-2.06-.22-.53-.45-.46-.62-.47h-.53c-.19 0-.5.07-.76.35-.26.28-1 .98-1 2.38 0 1.4 1.02 2.76 1.16 2.95.14.19 2 3.05 4.85 4.27.68.29 1.2.47 1.62.6.68.22 1.3.19 1.79.11.55-.08 1.63-.66 1.86-1.3.23-.63.23-1.17.16-1.29-.07-.11-.25-.18-.53-.32Z"></path>',
  instagram: '<path d="M12 2c2.7 0 3.06.01 4.12.06 1.06.05 1.79.22 2.43.47.66.26 1.22.6 1.77 1.15.55.55.9 1.11 1.15 1.77.25.64.42 1.37.47 2.43.05 1.06.06 1.42.06 4.12s-.01 3.06-.06 4.12c-.05 1.06-.22 1.79-.47 2.43a4.9 4.9 0 0 1-1.15 1.77 4.9 4.9 0 0 1-1.77 1.15c-.64.25-1.37.42-2.43.47-1.06.05-1.42.06-4.12.06s-3.06-.01-4.12-.06c-1.06-.05-1.79-.22-2.43-.47a4.9 4.9 0 0 1-1.77-1.15 4.9 4.9 0 0 1-1.15-1.77c-.25-.64-.42-1.37-.47-2.43C2.01 15.06 2 14.7 2 12s.01-3.06.06-4.12c.05-1.06.22-1.79.47-2.43.26-.66.6-1.22 1.15-1.77A4.9 4.9 0 0 1 5.45.53C6.09.28 6.82.11 7.88.06 8.94.01 9.3 0 12 0Zm0 5a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.2-2.7a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z"></path>',
  email: '<path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"></path><path d="m22 6-10 7L2 6"></path>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>'
};
function shareIconSvg(platform) {
  const p = String(platform || "").toLowerCase();
  const path = SHARE_ICONS[p] || SHARE_ICONS.link;
  return `<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">${path}</svg>`;
}
function shareBarHtml(s, h) {
  const items = s.items || [];
  const vertical = s.layout === "vertical";
  const btns = items.map(
    (it) => `<a href="${h.A(it.url || "#")}" target="_blank" rel="noopener" title="${h.A(it.platform || "")}" style="display:flex;align-items:center;justify-content:center;width:2.4rem;height:2.4rem;border-radius:50%;background:${h.rgb(h.text, 0.06)};color:${h.rgb(h.text, 0.75)};transition:background .2s ease, color .2s ease;">${shareIconSvg(it.platform)}</a>`
  ).join("");
  return `<div style="${h.ff}${h.fc}padding:${pad(s)};display:flex;justify-content:center;">
    ${btns ? `<div style="display:flex;${vertical ? "flex-direction:column;" : ""}gap:.75rem;">${btns}</div>` : placeholder(h, "Add share links in editor")}
  </div>`;
}
export const spShareBar = {
  type: "sp-share-bar",
  label: "Share bar",
  icon: "share-2",
  defaults(id) {
    return {
      id,
      type: "sp-share-bar",
      layout: "horizontal",
      items: [
        { platform: "twitter", url: "https://twitter.com/intent/tweet" },
        { platform: "facebook", url: "https://www.facebook.com/sharer/sharer.php" },
        { platform: "linkedin", url: "https://www.linkedin.com/sharing/share-offsite/" },
        { platform: "email", url: "mailto:" }
      ]
    };
  },
  preview(s, h) {
    return shareBarHtml(s, h);
  },
  render(s, h) {
    return shareBarHtml(s, h);
  },
  editorFields(s) {
    const esc = (v) => String(v || "").replace(/"/g, "&quot;");
    const items = s.items || [];
    return `<div class="bld-ef"><label>Layout</label><select data-f="layout">
        <option value="horizontal"${s.layout !== "vertical" ? " selected" : ""}>Horizontal</option>
        <option value="vertical"${s.layout === "vertical" ? " selected" : ""}>Vertical</option>
      </select></div>
      <div id="spsbItems">${items.map(
      (it, i) => `<div class="bld-li-item">
        <button class="bld-li-rm" data-lrm="${i}">✕</button>
        <div class="bld-ef"><label>Platform</label><select data-li="${i}" data-lf="platform">
          ${["twitter", "facebook", "linkedin", "whatsapp", "instagram", "email", "link"].map(
        (p) => `<option value="${p}"${it.platform === p ? " selected" : ""}>${p[0].toUpperCase() + p.slice(1)}</option>`
      ).join("")}
        </select></div>
        <div class="bld-ef"><label>URL</label><input type="text" data-li="${i}" data-lf="url" value="${esc(it.url)}" /></div>
      </div>`
    ).join("")}</div>
      <button class="bld-add-li bld-add-item" data-shape='{"platform":"link","url":""}'>+ Add link</button>`;
  }
};
function ugcWallHtml(s, h) {
  const items = s.items || [];
  const tiles = items.map(
    (it) => `<div style="break-inside:avoid;margin-bottom:.9rem;border-radius:.5rem;overflow:hidden;background:${h.rgb(h.text, 0.04)};">
        <img src="${h.A(it.img || "")}" alt="${h.A(it.caption || "")}" style="width:100%;display:block;" />
        ${it.caption ? `<div style="padding:.5rem .7rem;font-size:.68rem;font-weight:200;letter-spacing:.02em;color:${h.rgb(h.text, 0.6)};">${h.E(it.caption)}</div>` : ""}
      </div>`
  ).join("");
  return `<div style="${h.ff}${h.fc}padding:${pad(s)};">
    ${tiles ? `<div style="columns:2 12rem;column-gap:.9rem;">${tiles}</div>` : placeholder(h, "Add customer photos in editor")}
  </div>`;
}
export const spUgcWall = {
  type: "sp-ugc-wall",
  label: "Customer photo wall",
  icon: "layout-grid",
  defaults(id) {
    return { id, type: "sp-ugc-wall", items: [] };
  },
  preview(s, h) {
    return ugcWallHtml(s, h);
  },
  render(s, h) {
    return ugcWallHtml(s, h);
  },
  editorFields(s) {
    const esc = (v) => String(v || "").replace(/"/g, "&quot;");
    const items = s.items || [];
    return `<div id="spuwItems">${items.map(
      (it, i) => `<div class="bld-li-item">
        <button class="bld-li-rm" data-lrm="${i}">✕</button>
        <div class="bld-ef"><label>Image URL</label><input type="url" data-li="${i}" data-lf="img" value="${esc(it.img)}" /></div>
        <div class="bld-ef"><label>Caption</label><input type="text" data-li="${i}" data-lf="caption" value="${esc(it.caption)}" /></div>
      </div>`
    ).join("")}</div>
      <button class="bld-add-li bld-add-item" data-shape='{"img":"","caption":""}'>+ Add photo</button>`;
  }
};
function milestoneCounterHtml(s, h) {
  const items = s.items || [];
  const uid = "spmc-" + Math.random().toString(36).slice(2, 8);
  const cards = items.map(
    (it, i) => `<div style="opacity:0;transform:translateY(8px);animation:${uid} .6s cubic-bezier(.2,.7,.3,1) ${0.05 * i}s forwards;text-align:center;">
        <div style="font-size:1.4rem;margin-bottom:.5rem;color:${h.accent};">${it.icon || "✦"}</div>
        <div style="font-size:clamp(1.6rem,5vw,2.4rem);font-weight:300;letter-spacing:-.02em;color:${h.rgb(h.text, 0.92)};">${h.E(it.number || "0")}</div>
        <div style="font-size:.62rem;font-weight:200;letter-spacing:.24em;text-transform:uppercase;color:${h.rgb(h.text, 0.48)};margin-top:.35rem;">${h.E(it.label || "")}</div>
      </div>`
  ).join("");
  return `<div style="${h.ff}${h.fc}padding:${pad(s)};">
    <style>@keyframes ${uid}{to{opacity:1;transform:translateY(0);}}</style>
    ${cards ? `<div style="display:flex;flex-wrap:wrap;gap:2.5rem;justify-content:center;">${cards}</div>` : placeholder(h, "Add milestones in editor")}
  </div>`;
}
export const spMilestoneCounter = {
  type: "sp-milestone-counter",
  label: "Milestone counter",
  icon: "flag",
  defaults(id) {
    return {
      id,
      type: "sp-milestone-counter",
      items: [
        { icon: "🎂", number: "5", label: "Years in business" },
        { icon: "🚀", number: "500+", label: "Projects shipped" },
        { icon: "🌍", number: "32", label: "Countries served" }
      ]
    };
  },
  preview(s, h) {
    return milestoneCounterHtml(s, h);
  },
  render(s, h) {
    return milestoneCounterHtml(s, h);
  },
  editorFields(s) {
    const esc = (v) => String(v || "").replace(/"/g, "&quot;");
    const items = s.items || [];
    return `<div id="spmcItems">${items.map(
      (it, i) => `<div class="bld-li-item">
        <button class="bld-li-rm" data-lrm="${i}">✕</button>
        <div class="bld-ef"><label>Icon <span style="opacity:.5">(emoji)</span></label><input type="text" data-li="${i}" data-lf="icon" value="${esc(it.icon)}" /></div>
        <div class="bld-ef"><label>Number</label><input type="text" data-li="${i}" data-lf="number" value="${esc(it.number)}" /></div>
        <div class="bld-ef"><label>Label</label><input type="text" data-li="${i}" data-lf="label" value="${esc(it.label)}" /></div>
      </div>`
    ).join("")}</div>
      <button class="bld-add-li bld-add-item" data-shape='{"icon":"✦","number":"0","label":""}'>+ Add milestone</button>`;
  }
};
function trustBadgesHtml(s, h) {
  const items = s.items || [];
  const badges = items.map(
    (it) => `<div style="display:flex;align-items:center;gap:.5rem;padding:.5rem .9rem;border:1px solid ${h.rgb(h.text, 0.1)};border-radius:999px;">
        <span style="font-size:.95rem;color:${h.accent};line-height:1;">${it.icon || "✔"}</span>
        <span style="font-size:.7rem;font-weight:200;letter-spacing:.04em;color:${h.rgb(h.text, 0.75)};white-space:nowrap;">${h.E(it.label || "")}</span>
      </div>`
  ).join("");
  return `<div style="${h.ff}${h.fc}padding:${pad(s)};display:flex;justify-content:center;">
    ${badges ? `<div style="display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center;">${badges}</div>` : placeholder(h, "Add trust badges in editor")}
  </div>`;
}
export const spTrustBadges = {
  type: "sp-trust-badges",
  label: "Trust badges",
  icon: "shield-check",
  defaults(id) {
    return {
      id,
      type: "sp-trust-badges",
      items: [
        { icon: "🔒", label: "Secure checkout" },
        { icon: "↩", label: "30-day returns" },
        { icon: "💬", label: "24/7 support" }
      ]
    };
  },
  preview(s, h) {
    return trustBadgesHtml(s, h);
  },
  render(s, h) {
    return trustBadgesHtml(s, h);
  },
  editorFields(s) {
    const esc = (v) => String(v || "").replace(/"/g, "&quot;");
    const items = s.items || [];
    return `<div id="sptbItems">${items.map(
      (it, i) => `<div class="bld-li-item">
        <button class="bld-li-rm" data-lrm="${i}">✕</button>
        <div class="bld-ef"><label>Icon <span style="opacity:.5">(emoji)</span></label><input type="text" data-li="${i}" data-lf="icon" value="${esc(it.icon)}" /></div>
        <div class="bld-ef"><label>Label</label><input type="text" data-li="${i}" data-lf="label" value="${esc(it.label)}" /></div>
      </div>`
    ).join("")}</div>
      <button class="bld-add-li bld-add-item" data-shape='{"icon":"✔","label":""}'>+ Add badge</button>`;
  }
};
function videoTestimonialsHtml(s, h) {
  const items = s.items || [];
  const cards = items.map(
    (it) => `<div style="border-radius:.6rem;overflow:hidden;background:${h.rgb(h.text, 0.03)};border:1px solid ${h.rgb(h.text, 0.08)};">
        <div style="position:relative;padding-top:56.25%;background:#000;">
          <iframe src="${h.A(it.video_url || "")}" style="position:absolute;inset:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>
        </div>
        <div style="padding:.9rem 1rem;">
          <div style="font-size:.78rem;font-weight:400;color:${h.rgb(h.text, 0.88)};">${h.E(it.name || "")}</div>
          <div style="font-size:.65rem;font-weight:200;letter-spacing:.04em;color:${h.rgb(h.text, 0.48)};margin-top:.15rem;">${h.E(it.role || "")}</div>
        </div>
      </div>`
  ).join("");
  return `<div style="${h.ff}${h.fc}padding:${pad(s)};">
    ${cards ? `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(16rem,1fr));gap:1.5rem;">${cards}</div>` : placeholder(h, "Add video testimonials in editor")}
  </div>`;
}
export const spVideoTestimonials = {
  type: "sp-video-testimonials",
  label: "Video testimonials",
  icon: "video",
  defaults(id) {
    return { id, type: "sp-video-testimonials", items: [] };
  },
  preview(s, h) {
    return videoTestimonialsHtml(s, h);
  },
  render(s, h) {
    return videoTestimonialsHtml(s, h);
  },
  editorFields(s) {
    const esc = (v) => String(v || "").replace(/"/g, "&quot;");
    const items = s.items || [];
    return `<div id="spvtItems">${items.map(
      (it, i) => `<div class="bld-li-item">
        <button class="bld-li-rm" data-lrm="${i}">✕</button>
        <div class="bld-ef"><label>Embed URL <span style="opacity:.5">(YouTube/Vimeo embed link)</span></label><input type="url" data-li="${i}" data-lf="video_url" value="${esc(it.video_url)}" placeholder="https://www.youtube.com/embed/VIDEO_ID" /></div>
        <div class="bld-ef"><label>Name</label><input type="text" data-li="${i}" data-lf="name" value="${esc(it.name)}" /></div>
        <div class="bld-ef"><label>Role</label><input type="text" data-li="${i}" data-lf="role" value="${esc(it.role)}" /></div>
      </div>`
    ).join("")}</div>
      <button class="bld-add-li bld-add-item" data-shape='{"video_url":"","name":"","role":""}'>+ Add video</button>`;
  }
};
