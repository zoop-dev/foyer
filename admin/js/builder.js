function bE(s)   { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
marked.use({ breaks: true, gfm: true });
const md = s => marked.parse(String(s||''));
function bA(s)   { return String(s||'').replace(/"/g,'&quot;'); }
function bRgb(hex, a) {
  const h=(hex||'#000000').replace('#','');
  const r=parseInt(h.slice(0,2),16)||0, g=parseInt(h.slice(2,4),16)||0, b=parseInt(h.slice(4,6),16)||0;
  return `rgba(${r},${g},${b},${a})`;
}



const BLOCK_CATALOG = [

  { t:'hero', l:'Hero', c:'Headers', i:'⛰️', k:'title name intro' },
  { t:'banner', l:'Banner', c:'Headers', i:'🎯', k:'cta call to action splash cover' },
  { t:'sectionhead', l:'Section header', c:'Headers', i:'🪧', k:'eyebrow subtitle' },

  { t:'heading', l:'Heading', c:'Text', i:'🔠', k:'title' },
  { t:'text', l:'Text', c:'Text', i:'¶', k:'paragraph body markdown' },
  { t:'lead', l:'Lead', c:'Text', i:'🅛', k:'intro large paragraph' },
  { t:'bio', l:'Bio', c:'Text', i:'👤', k:'about' },
  { t:'quote', l:'Quote', c:'Text', i:'❝', k:'blockquote' },
  { t:'callout', l:'Callout', c:'Text', i:'💡', k:'notice tip warning alert info' },
  { t:'code', l:'Code', c:'Text', i:'⌨️', k:'snippet pre monospace' },

  { t:'cards', l:'Cards', c:'Cards & grids', i:'🃏', k:'grid' },
  { t:'features', l:'Features', c:'Cards & grids', i:'✦', k:'benefits icons grid' },
  { t:'steps', l:'Steps', c:'Cards & grids', i:'🔢', k:'process how it works' },
  { t:'collection', l:'Collection', c:'Cards & grids', i:'🗂️', k:'items shop grid' },
  { t:'specs', l:'Specs', c:'Cards & grids', i:'📋', k:'key value details list' },
  { t:'timeline', l:'Timeline', c:'Cards & grids', i:'🪜', k:'history events dated' },
  { t:'tabs', l:'Tabs', c:'Cards & grids', i:'🗃️', k:'tabbed panels' },

  { t:'links', l:'Links', c:'Lists & links', i:'🔗', k:'list' },
  { t:'link', l:'Button', c:'Lists & links', i:'➡️', k:'link cta' },
  { t:'buttongroup', l:'Button group', c:'Lists & links', i:'🔘', k:'cta row buttons' },
  { t:'toc', l:'Table of contents', c:'Lists & links', i:'🧭', k:'jump menu anchors nav' },

  { t:'image', l:'Image', c:'Media', i:'🖼️', k:'photo' },
  { t:'gallery', l:'Gallery', c:'Media', i:'🌃', k:'photos grid' },
  { t:'masonry', l:'Masonry', c:'Media', i:'🧱', k:'pinterest gallery' },
  { t:'carousel', l:'Carousel', c:'Media', i:'🎠', k:'slider slideshow' },
  { t:'imgtext', l:'Image + Text', c:'Media', i:'🔲', k:'split media' },
  { t:'compare', l:'Before / After', c:'Media', i:'🪞', k:'slider compare image' },
  { t:'video', l:'Video', c:'Media', i:'▶️', k:'youtube vimeo' },
  { t:'fileprev', l:'File Preview', c:'Media', i:'📄', k:'pdf embed' },
  { t:'filedown', l:'File Download', c:'Media', i:'⬇️', k:'pdf download' },

  { t:'cta', l:'CTA', c:'Conversion', i:'📣', k:'call to action button' },
  { t:'pricing', l:'Pricing', c:'Conversion', i:'💲', k:'plans tiers' },
  { t:'testimonials', l:'Testimonials', c:'Conversion', i:'💬', k:'quotes reviews social proof' },
  { t:'testimonial', l:'Featured quote', c:'Conversion', i:'🗯️', k:'big testimonial' },
  { t:'rating', l:'Rating', c:'Conversion', i:'⭐', k:'stars score reviews' },
  { t:'logos', l:'Logo Strip', c:'Conversion', i:'🏷️', k:'brands trusted by partners' },
  { t:'countdown', l:'Countdown', c:'Conversion', i:'⏳', k:'timer launch event' },
  { t:'badges', l:'Trust badges', c:'Conversion', i:'🛡️', k:'guarantee secure' },
  { t:'stats', l:'Stats', c:'Conversion', i:'📊', k:'numbers metrics counter' },

  { t:'contact', l:'Contact', c:'People & contact', i:'✉️', k:'email phone' },
  { t:'social', l:'Social', c:'People & contact', i:'🌐', k:'links icons' },
  { t:'team', l:'Team', c:'People & contact', i:'👥', k:'members staff people' },
  { t:'vcard', l:'Contact card', c:'People & contact', i:'🪪', k:'vcard profile' },
  { t:'availability', l:'Availability', c:'People & contact', i:'🟢', k:'open to work status' },

  { t:'skills', l:'Skills', c:'Portfolio', i:'🧩', k:'tech stack tags badges' },
  { t:'progress', l:'Progress bars', c:'Portfolio', i:'📶', k:'skill meters levels' },
  { t:'resume', l:'Resume timeline', c:'Portfolio', i:'📜', k:'experience education cv' },
  { t:'qrcode', l:'QR code', c:'Portfolio', i:'🔳', k:'qr link' },

  { t:'accordion', l:'Accordion', c:'Interactive', i:'🪗', k:'faq collapse' },
  { t:'toggle', l:'Toggle', c:'Interactive', i:'🔽', k:'show hide spoiler' },
  { t:'copyfield', l:'Copy field', c:'Interactive', i:'📋', k:'clipboard copy' },
  { t:'marquee', l:'Marquee', c:'Interactive', i:'🎞️', k:'scrolling ticker' },

  { t:'embed', l:'Embed', c:'Embeds', i:'🧷', k:'iframe codepen figma loom' },
  { t:'audio', l:'Audio', c:'Embeds', i:'🎵', k:'spotify soundcloud podcast' },
  { t:'socialpost', l:'Social post', c:'Embeds', i:'🐦', k:'twitter x instagram tiktok' },
  { t:'map', l:'Map', c:'Embeds', i:'📍', k:'google maps location' },
  { t:'booking', l:'Booking', c:'Embeds', i:'📅', k:'calendly cal scheduling' },

  { t:'newsletter', l:'Newsletter', c:'Forms', i:'📨', k:'email signup subscribe' },
  { t:'contactform', l:'Contact form', c:'Forms', i:'📝', k:'message form email' },

  { t:'tutorials', l:'Tutorials', c:'Dynamic', i:'🎓', k:'list' },
  { t:'reviews', l:'Reviews', c:'Dynamic', i:'⭐', k:'list' },

  { t:'divider', l:'Divider', c:'Layout', i:'➖', k:'rule line separator' },
  { t:'spacer', l:'Spacer', c:'Layout', i:'⬚', k:'gap whitespace' },
  { t:'group', l:'Collapsible', c:'Layout', i:'📦', k:'group sections' },
];
const BLK_LABEL = Object.fromEntries(BLOCK_CATALOG.map(b => [b.t, b.l]));
const BLK_CATS = [...new Set(BLOCK_CATALOG.map(b => b.c))];

function bRender(s, theme) {
  const { accent=__SITE__.accent, text=__SITE__.text, font='Josefin Sans', bg=__SITE__.bg } = theme;
  const ff = `font-family:'${font}',sans-serif;`;
  const fc = `color:${text};`;

  switch(s.type) {
    case 'collection': {
      const items=s.items||[];
      const p=s.pad==='sm'?'1rem 2rem':s.pad==='lg'?'4rem 2rem':'2rem 2rem';
      const cols=s.layout==='grid-2'?2:s.layout==='grid-4'?4:3;
      const forSale=items.filter(it=>it.for_sale==='yes').length;
      const countLine=s.show_count!=='no'?`${items.length} item${items.length===1?'':'s'}${forSale?` · ${forSale} for sale`:''}`:'';
      const cards=items.map(it=>{
        const imgs=(it.imgs&&it.imgs.length)?it.imgs.filter(Boolean):(it.img?[it.img]:[]);
        const cover=imgs[0]||'';
        const coverHtml=cover?`<img src="${bA(cover)}" alt="" style="width:100%;height:130px;object-fit:cover;display:block;" />`:`<div style="width:100%;height:130px;background:${bRgb(accent,.06)};border:1px dashed ${bRgb(accent,.15)};"></div>`;
        const thumbs=imgs.length>1?`<div style="display:flex;gap:.25rem;padding:.35rem .35rem 0;overflow-x:auto;">${imgs.map(u=>`<img src="${bA(u)}" alt="" style="width:30px;height:30px;object-fit:cover;flex-shrink:0;border:1px solid ${bRgb(accent,.2)};" />`).join('')}</div>`:'';
        return `<div style="border:1px solid ${bRgb(accent,.12)};background:${bRgb(accent,.03)};position:relative;">${it.for_sale==='yes'?`<div style="position:absolute;top:.5rem;right:.5rem;background:${accent};color:${bg};font-size:.5rem;font-weight:400;letter-spacing:.1em;text-transform:uppercase;padding:.2rem .5rem;z-index:1;">For sale${it.price?` · ${bE(it.price)}`:''}</div>`:''}${coverHtml}${thumbs}<div style="padding:.6rem .8rem;"><div style="font-weight:300;font-size:.82rem;color:${bRgb(text,.9)};">${bE(it.name||'')}</div>${it.note?`<div style="font-weight:200;font-size:.68rem;line-height:1.6;color:${bRgb(text,.5)};margin-top:.2rem;">${bE(it.note)}</div>`:''}</div></div>`;
      }).join('');
      return `<div style="${ff}${fc}padding:${p};">${s.heading?`<div style="font-weight:300;font-size:1.05rem;letter-spacing:.02em;margin-bottom:.3rem;">${bE(s.heading)}</div>`:''}${countLine?`<div style="font-size:.65rem;font-weight:200;letter-spacing:.1em;text-transform:uppercase;color:${bRgb(accent,.6)};margin-bottom:1.2rem;">${countLine}</div>`:''}<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:1rem;">${cards}</div></div>`;
    }
    case 'hero': {
      const ta=`text-align:${s.align||'center'};`;
      const sz=s.name_size==='sm'?'1.6rem':s.name_size==='md'?'2.2rem':s.name_size==='xl'?'clamp(3rem,10vw,5rem)':'clamp(1.9rem,8vw,3.2rem)';
      const fw=s.weight||'300';
      const ls=s.ls==='tight'?'-.03em':s.ls==='wide'?'.06em':'-.01em';
      const p=s.pad==='sm'?'2rem 2rem 1.5rem':s.pad==='lg'?'7rem 2rem 6rem':'4rem 2rem 3rem';
      const bgImg=s.bg_img?`background-image:url('${bA(s.bg_img)}');background-size:cover;background-position:center;position:relative;`:'';
      const overlay=s.bg_img?`<div style="position:absolute;inset:0;background:rgba(0,0,0,${s.bg_overlay||'0.45'});"></div>`:'';
      return `<div style="${ff}${fc}${bgImg}${ta}padding:${p};">${overlay}
        <div style="position:relative;">
        ${s.eyebrow?`<p style="font-size:.72rem;letter-spacing:.4em;text-transform:uppercase;color:${accent};margin-bottom:1rem;font-weight:200;">${bE(s.eyebrow)}</p>`:''}
        <h1 style="font-size:${sz};font-weight:${fw};letter-spacing:${ls};margin:0 0 .5rem;line-height:1.08;">${bE(s.name||'Your Name')}</h1>
        ${s.tagline?`<p style="font-size:.95rem;font-weight:200;font-style:italic;color:${bRgb(text,.52)};letter-spacing:.1em;margin-top:.3rem;">${bE(s.tagline)}</p>`:''}
        </div></div>`;
    }
    case 'bio': {
      const ta=`text-align:${s.align||'left'};`;
      const mw=s.max_w==='narrow'?'360px':s.max_w==='wide'?'680px':s.max_w==='full'?'100%':'520px';
      const mc=s.align==='center'?'margin:0 auto;':'';
      const fs=s.fsize==='sm'?'.82rem':s.fsize==='lg'?'1.05rem':'.92rem';
      const lh=s.lh==='compact'?'1.55':s.lh==='relaxed'?'2.3':'1.9';
      const p=s.pad==='sm'?'1.2rem 2rem':s.pad==='lg'?'4.5rem 2rem':'2.5rem 2rem';
      const pr=s.photo_radius==='circle'?'50%':s.photo_radius==='sm'?'4px':s.photo_radius==='lg'?'12px':'0';
      const photoHtml=s.photo?`<img src="${bA(s.photo)}" alt="" style="width:${s.photo_size||'80px'};height:${s.photo_size||'80px'};object-fit:cover;border-radius:${pr};display:block;${s.align==='center'?'margin:0 auto 1.2rem;':'margin-bottom:1.2rem;'}" />`:'';
      return `<div style="${ff}${fc}${ta}padding:${p};">
        ${photoHtml}
        ${s.heading?`<h2 style="font-size:1.35rem;font-weight:300;letter-spacing:.04em;margin-bottom:1rem;">${bE(s.heading)}</h2>`:''}
        <div class="md-content" style="font-weight:200;font-size:${fs};line-height:${lh};color:${bRgb(text,.72)};max-width:${mw};${mc}">${md(s.body)}</div>
      </div>`;
    }
    case 'links': {
      const items=s.items||[];
      const p=s.pad==='sm'?'1rem 2rem':s.pad==='lg'?'4rem 2rem':'2rem 2rem';
      const ls=s.link_style||'card';
      let inner;
      const itTarget=it=>it.new_tab!=='no'?'target="_blank" rel="noopener"':'';
      if (ls==='minimal') {
        inner=items.map(it=>`<a href="${bA(it.u||'#')}" ${itTarget(it)} style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid ${bRgb(accent,.12)};padding:.75rem 0;text-decoration:none;"><span style="font-weight:300;font-size:.9rem;letter-spacing:.06em;color:${bRgb(text,.88)};">${bE(it.t||'Link')}</span>${it.d?`<span style="font-size:.62rem;color:${bRgb(accent,.42)};">${bE(it.d)}</span>`:''}</a>`).join('');
      } else if (ls==='pill') {
        inner=`<div style="display:flex;flex-direction:column;gap:.5rem;">${items.map(it=>`<a href="${bA(it.u||'#')}" ${itTarget(it)} style="display:block;border:1px solid ${bRgb(accent,.18)};background:${bRgb(accent,.04)};padding:.8rem 1.4rem;border-radius:40px;text-decoration:none;"><div style="font-weight:300;font-size:.9rem;letter-spacing:.06em;color:${bRgb(text,.88)};">${bE(it.t||'Link')}</div>${it.d?`<div style="font-size:.62rem;font-weight:200;color:${bRgb(accent,.42)};margin-top:.15rem;">${bE(it.d)}</div>`:''}</a>`).join('')}</div>`;
      } else {
        inner=`<div style="display:flex;flex-direction:column;gap:.52rem;">${items.map(it=>`<a href="${bA(it.u||'#')}" ${itTarget(it)} style="display:block;border:1px solid ${bRgb(accent,.15)};background:${bRgb(accent,.03)};padding:.85rem 1.2rem;text-decoration:none;"><div style="font-weight:300;font-size:.9rem;letter-spacing:.06em;color:${bRgb(text,.88)};">${bE(it.t||'Link')}</div>${it.d?`<div style="font-size:.62rem;font-weight:200;color:${bRgb(accent,.42)};margin-top:.18rem;">${bE(it.d)}</div>`:''}</a>`).join('')}</div>`;
      }
      return `<div style="${ff}${fc}padding:${p};">${inner}</div>`;
    }
    case 'contact': {
      const rawItems=s.items||(s.email||s.phone?[...(s.email?[{label:'Email',val:s.email,href:`mailto:${s.email}`}]:[]),...(s.phone?[{label:'Phone',val:s.phone,href:`tel:${s.phone}`}]:[])]:[]);
      const rows=rawItems.map(it=>[it.label||'',it.href||'',it.val||'']);
      const ai=s.align==='left'?'flex-start':s.align==='right'?'flex-end':'center';
      const p=s.pad==='sm'?'1.5rem 2rem':s.pad==='lg'?'4.5rem 2rem':'2.5rem 2rem';
      const cst=s.cstyle||'normal';
      let inner;
      const subLine=(sub)=>sub?`<span style="display:block;font-size:.62rem;font-weight:200;letter-spacing:.06em;color:${bRgb(accent,.42)};margin-top:.12rem;">${bE(sub)}</span>`:'';
      if (cst==='stacked') {
        inner=rawItems.map(it=>`<div style="display:flex;flex-direction:column;gap:.2rem;"><span style="font-size:.55rem;letter-spacing:.3em;text-transform:uppercase;color:${bRgb(accent,.4)};font-weight:200;">${bE(it.label||'')}</span><span style="font-size:.95rem;font-weight:300;letter-spacing:.06em;color:${bRgb(text,.88)};">${bE(it.val||'')}</span>${subLine(it.sub)}</div>`).join('');
      } else if (cst==='minimal') {
        inner=rawItems.map(it=>`<div><a href="${bA(it.href||'')}" style="font-size:.95rem;font-weight:300;letter-spacing:.06em;color:${bRgb(text,.82)};text-decoration:none;">${bE(it.val||'')}</a>${subLine(it.sub)}</div>`).join('');
      } else {
        inner=rawItems.map(it=>`<div style="display:flex;align-items:baseline;gap:1rem;"><span style="font-size:.65rem;letter-spacing:.26em;text-transform:uppercase;color:${bRgb(accent,.38)};min-width:3rem;text-align:right;font-weight:200;">${bE(it.label||'')}</span><div><a href="${bA(it.href||'')}" style="font-size:.92rem;font-weight:300;letter-spacing:.06em;color:${bRgb(text,.85)};text-decoration:none;">${bE(it.val||'')}</a>${subLine(it.sub)}</div></div>`).join('');
      }
      return `<div style="${ff}${fc}padding:${p};text-align:${s.align||'center'};"><div style="display:flex;flex-direction:column;align-items:${ai};gap:.8rem;">${inner}</div></div>`;
    }
    case 'social': {
      const items=s.items||[];
      const jc=s.align==='left'?'flex-start':s.align==='right'?'flex-end':'center';
      const p=s.pad==='sm'?'1rem 2rem':s.pad==='lg'?'4rem 2rem':'2rem 2rem';
      const bs=s.btn_style||'outline';
      const btnCss=bs==='solid'?`background:${accent};color:${bg};border:none;padding:.4rem .9rem;`:bs==='minimal'?`background:none;border:none;color:${accent};padding:.4rem .6rem;`:bs==='pill'?`background:none;border:1px solid ${bRgb(accent,.25)};color:${accent};border-radius:40px;padding:.4rem .9rem;`:`background:none;border:1px solid ${bRgb(accent,.22)};color:${accent};padding:.4rem .9rem;`;
      return `<div style="${ff}${fc}padding:${p};text-align:${s.align||'center'};"><div style="display:flex;flex-wrap:wrap;gap:.6rem;justify-content:${jc};">${items.map(it=>`<a href="${bA(it.url||'#')}" target="_blank" rel="noopener" style="${btnCss}font-weight:200;font-size:.7rem;letter-spacing:.2em;text-transform:uppercase;text-decoration:none;display:inline-block;">${bE(it.label||'Link')}</a>`).join('')}</div></div>`;
    }
    case 'cta': {
      const ta=`text-align:${s.align||'center'};`;
      const p=s.pad==='sm'?'1.5rem 2rem':s.pad==='lg'?'5.5rem 2rem':'3rem 2rem';
      const bs=s.btn_style||'solid';
      const bsz=s.btn_size==='sm'?'.5rem 1.3rem':s.btn_size==='lg'?'.9rem 2.8rem':'.7rem 2rem';
      const btnCss=bs==='outline'?`background:transparent;border:1px solid ${accent};color:${accent};`:bs==='ghost'?`background:transparent;border:1px solid ${bRgb(text,.25)};color:${text};`:`background:${accent};border:1px solid ${accent};color:${bg};`;
      return `<div style="${ff}${fc}${ta}padding:${p};">
        ${s.text?`<p style="font-weight:200;font-size:1rem;letter-spacing:.06em;margin-bottom:1.4rem;color:${bRgb(text,.75)};">${bE(s.text)}</p>`:''}
        <a href="${bA(s.button_url||'#')}" style="display:inline-block;font-weight:300;font-size:.78rem;letter-spacing:.25em;text-transform:uppercase;padding:${bsz};text-decoration:none;${btnCss}">${bE(s.button_label||'Get in touch')}</a>
      </div>`;
    }
    case 'quote': {
      const p=s.pad==='sm'?'1.5rem 2rem':s.pad==='lg'?'5rem 2rem':'3rem 2rem';
      const v=s.variant||'border';
      if (v==='centered') return `<div style="${ff}${fc}padding:${p};text-align:center;"><div style="max-width:480px;margin:0 auto;"><p style="font-size:2.5rem;font-weight:200;line-height:1;color:${bRgb(accent,.3)};margin-bottom:.5rem;">"</p><p style="font-size:1rem;font-weight:200;line-height:1.85;color:${bRgb(text,.75)};font-style:italic;">${bE(s.quote||'')}</p>${s.attribution?`<cite style="display:block;margin-top:.8rem;font-size:.67rem;font-weight:200;letter-spacing:.2em;text-transform:uppercase;color:${bRgb(accent,.45)};font-style:normal;">— ${bE(s.attribution)}</cite>`:''}</div></div>`;
      if (v==='minimal') return `<div style="${ff}${fc}padding:${p};max-width:480px;margin:0 auto;"><p style="font-size:1rem;font-weight:200;line-height:1.85;color:${bRgb(text,.72)};font-style:italic;">${bE(s.quote||'')}</p>${s.attribution?`<cite style="display:block;margin-top:.6rem;font-size:.67rem;font-weight:200;letter-spacing:.2em;text-transform:uppercase;color:${bRgb(accent,.38)};font-style:normal;">— ${bE(s.attribution)}</cite>`:''}</div>`;
      return `<div style="${ff}${fc}padding:${p};text-align:center;"><blockquote style="border-left:2px solid ${bRgb(accent,.4)};padding:1rem 1.5rem;text-align:left;max-width:440px;margin:0 auto;"><p style="font-size:1rem;font-weight:200;font-style:italic;line-height:1.85;color:${bRgb(text,.75)};">"${bE(s.quote||'Your quote')}"</p>${s.attribution?`<cite style="display:block;margin-top:.7rem;font-size:.67rem;font-weight:200;letter-spacing:.2em;text-transform:uppercase;color:${bRgb(accent,.45)};font-style:normal;">— ${bE(s.attribution)}</cite>`:''}</blockquote></div>`;
    }
    case 'heading': {
      const sz=s.size==='xl'?'2.4rem':s.size==='sm'?'1rem':'1.5rem';
      const fw=s.weight||'300';
      const ls=s.ls==='tight'?'-.02em':s.ls==='wide'?'.15em':s.ls==='ultra'?'.35em':'.04em';
      const p=s.pad==='sm'?'1.2rem 2rem .4rem':s.pad==='lg'?'4.5rem 2rem 1.5rem':'2.5rem 2rem .8rem';
      return `<div style="${ff}${fc}padding:${p};text-align:${s.align||'left'};"><h2 style="font-size:${sz};font-weight:${fw};letter-spacing:${ls};margin:0;">${bE(s.text||'Heading')}</h2></div>`;
    }
    case 'text': {
      const ta=`text-align:${s.align||'left'};`;
      const fs=s.fsize==='sm'?'.8rem':s.fsize==='lg'?'1.05rem':'.92rem';
      const lh=s.lh==='compact'?'1.55':s.lh==='relaxed'?'2.3':'1.9';
      const mw=s.max_w==='narrow'?'360px':s.max_w==='wide'?'680px':s.max_w==='full'?'100%':'520px';
      const mc=s.align==='center'?'margin:0 auto;':'';
      const p=s.pad==='sm'?'.8rem 2rem':s.pad==='lg'?'3rem 2rem':'1.4rem 2rem';
      return `<div style="${ff}${fc}${ta}padding:${p};"><div class="md-content" style="font-weight:200;font-size:${fs};line-height:${lh};color:${bRgb(text,.72)};max-width:${mw};${mc}">${md(s.text)}</div></div>`;
    }
    case 'image': {
      const ta=`text-align:${s.align||'center'};`;
      const mw=s.size==='sm'?'280px':s.size==='md'?'420px':'100%';
      const r=s.radius==='sm'?'4px':s.radius==='lg'?'12px':s.radius==='circle'?'999px':'0';
      const p=s.pad==='sm'?'1rem 2rem':s.pad==='lg'?'4rem 2rem':'2rem 2rem';
      return `<div style="${ff}${fc}${ta}padding:${p};">${s.url?`<img src="${bA(s.url)}" alt="${bA(s.caption||'')}" style="max-width:${mw};width:100%;height:auto;display:inline-block;border-radius:${r};" />`:`<div style="display:inline-block;width:100%;max-width:${mw};background:${bRgb(accent,.06)};border:1px dashed ${bRgb(accent,.2)};padding:3rem 2rem;font-size:.68rem;letter-spacing:.2em;color:${bRgb(accent,.3)};border-radius:${r};">Image URL</div>`}${s.caption?`<p style="margin-top:.55rem;font-size:.62rem;font-weight:200;letter-spacing:.14em;color:${bRgb(text,.38)};">${bE(s.caption)}</p>`:''}</div>`;
    }
    case 'stats': {
      const items=s.items||[];
      const p=s.pad==='sm'?'1.5rem 2rem':s.pad==='lg'?'4.5rem 2rem':'2.5rem 2rem';
      const cols=s.cols==='2'?'repeat(2,1fr)':s.cols==='3'?'repeat(3,1fr)':s.cols==='4'?'repeat(4,1fr)':'';
      const gs=cols?`display:grid;grid-template-columns:${cols};gap:2rem;`:'display:flex;flex-wrap:wrap;gap:2.5rem;justify-content:center;';
      return `<div style="${ff}${fc}padding:${p};text-align:center;"><div style="${gs}">${items.map(it=>`<div><div style="font-size:clamp(2rem,6vw,3rem);font-weight:300;letter-spacing:-.02em;color:${accent};">${bE(it.number||'0')}</div><div style="font-size:.6rem;font-weight:200;letter-spacing:.3em;text-transform:uppercase;color:${bRgb(text,.5)};margin-top:.3rem;">${bE(it.label||'')}</div></div>`).join('')}</div></div>`;
    }
    case 'divider': {
      const sp=s.spacing==='sm'?'.8rem':s.spacing==='lg'?'3rem':'1.8rem';
      const dbg=s.style==='fade'?`linear-gradient(90deg,transparent,${bRgb(accent,.38)},transparent)`:bRgb(accent,.28);
      const dw=s.style==='short'?'2rem':'100%';
      return `<div style="padding:${sp} 2rem;"><div style="width:${dw};height:1px;margin:0 auto;background:${dbg};"></div></div>`;
    }
    case 'spacer': {
      const sh=s.size==='sm'?'1rem':s.size==='lg'?'4rem':s.size==='xl'?'7rem':'2.5rem';
      return `<div style="height:${sh};"></div>`;
    }
    case 'link': {
      const ta=`text-align:${s.align||'center'};`;
      const p=s.pad==='sm'?'1rem 2rem':s.pad==='lg'?'3.5rem 2rem':'2rem 2rem';
      const sty=s.style||'pill';
      const sz=s.size==='sm'?'.5rem 1.4rem':s.size==='lg'?'.9rem 2.8rem':'.7rem 2rem';
      const target=s.new_tab!=='no'?'target="_blank" rel="noopener"':'';
      let bc;
      if (sty==='solid') bc=`background:${accent};color:${bg};border:none;`;
      else if (sty==='ghost') bc=`background:transparent;border:1px solid ${bRgb(text,.25)};color:${text};`;
      else if (sty==='underline') bc=`background:none;border:none;border-bottom:1px solid ${bRgb(accent,.5)};color:${accent};padding-bottom:.2rem;border-radius:0;`;
      else if (sty==='badge') bc=`background:${bRgb(accent,.12)};border:1px solid ${bRgb(accent,.25)};color:${accent};`;
      else bc=`background:none;border:1px solid ${bRgb(accent,.3)};color:${accent};border-radius:40px;`;
      return `<div style="${ff}${fc}${ta}padding:${p};"><a href="${bA(s.url||'#')}" ${target} style="${bc}display:inline-block;font-weight:300;font-size:.78rem;letter-spacing:.2em;text-transform:uppercase;padding:${sz};text-decoration:none;">${bE(s.label||'Visit →')}</a></div>`;
    }
    case 'cards': {
      const items=s.items||[];
      const p=s.pad==='sm'?'1rem 2rem':s.pad==='lg'?'4rem 2rem':'2rem 2rem';
      const layout=s.layout||'grid-2';
      const r=s.radius==='sm'?'4px':s.radius==='lg'?'12px':'0';
      const cImg=(it,h='140px')=>it.img
        ?`<img src="${bA(it.img)}" alt="" style="width:100%;height:${h};object-fit:cover;display:block;border-radius:${r};" />`
        :`<div style="width:100%;height:${h};background:${bRgb(accent,.06)};border:1px dashed ${bRgb(accent,.15)};border-radius:${r};display:flex;align-items:center;justify-content:center;font-size:.52rem;letter-spacing:.15em;color:${bRgb(accent,.25)};">image</div>`;
      const cText=(it)=>(it.title||it.body)?`<div style="padding:.65rem 0;">${it.title?`<div style="font-weight:300;font-size:.85rem;letter-spacing:.04em;color:${bRgb(text,.9)};margin-bottom:.25rem;">${bE(it.title)}</div>`:''} ${it.body?`<div style="font-weight:200;font-size:.76rem;line-height:1.7;color:${bRgb(text,.52)};">${bE(it.body)}</div>`:''}</div>`:' ';
      const cOpen=(it,sty='')=>it.url?`<a href="${bA(it.url||'#')}" ${it.new_tab!=='no'?'target="_blank" rel="noopener"':''} style="${sty}display:block;text-decoration:none;">`:`<div style="${sty}">`;
      const cClose=(it)=>it.url?'</a>':'</div>';
      let inner;
      if (layout==='grid-2') {
        inner=`<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:1.2rem;">${items.map(it=>`${cOpen(it)}${cImg(it)}${cText(it)}${cClose(it)}`).join('')}</div>`;
      } else if (layout==='grid-3') {
        inner=`<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;">${items.map(it=>`${cOpen(it)}${cImg(it,'110px')}${cText(it)}${cClose(it)}`).join('')}</div>`;
      } else if (layout==='grid-4') {
        inner=`<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:.7rem;">${items.map(it=>`${cOpen(it)}${cImg(it,'80px')}${it.title?`<div style="font-weight:300;font-size:.7rem;letter-spacing:.04em;color:${bRgb(text,.85)};margin-top:.38rem;">${bE(it.title)}</div>`:' '}${cClose(it)}`).join('')}</div>`;
      } else if (layout==='feature') {
        const [first,...rest]=items;
        inner=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">${first?`<div style="grid-row:1/span ${Math.max(2,rest.length)};">${cOpen(first)}${cImg(first,'100%')}${cText(first)}${cClose(first)}</div>`:''}${rest.map(it=>`<div>${cOpen(it)}${cImg(it,'110px')}${cText(it)}${cClose(it)}</div>`).join('')}</div>`;
      } else if (layout==='horizontal') {
        inner=items.map(it=>`${cOpen(it,`display:grid;grid-template-columns:2fr 3fr;gap:1.2rem;align-items:center;padding:.75rem;border:1px solid ${bRgb(accent,.09)};margin-bottom:.65rem;`)}${cImg(it,'100px')}<div>${it.title?`<div style="font-weight:300;font-size:.88rem;letter-spacing:.04em;color:${bRgb(text,.9)};margin-bottom:.28rem;">${bE(it.title)}</div>`:''} ${it.body?`<div style="font-weight:200;font-size:.76rem;line-height:1.7;color:${bRgb(text,.52)};">${bE(it.body)}</div>`:''}</div>${cClose(it)}`).join('');
      } else {
        inner=`<div style="display:flex;flex-direction:column;">${items.map(it=>`${cOpen(it,`display:flex;gap:.9rem;align-items:center;padding:.55rem 0;border-bottom:1px solid ${bRgb(accent,.07)};`)} <div style="flex-shrink:0;width:68px;height:50px;overflow:hidden;border-radius:${r};">${it.img?`<img src="${bA(it.img)}" alt="" style="width:100%;height:100%;object-fit:cover;" />`:`<div style="width:100%;height:100%;background:${bRgb(accent,.06)};border:1px dashed ${bRgb(accent,.12)};"></div>`}</div><div style="flex:1;min-width:0;">${it.title?`<div style="font-weight:300;font-size:.82rem;letter-spacing:.04em;color:${bRgb(text,.88)};margin-bottom:.15rem;">${bE(it.title)}</div>`:''} ${it.body?`<div style="font-weight:200;font-size:.7rem;line-height:1.6;color:${bRgb(text,.5)};">${bE(it.body)}</div>`:''}</div>${cClose(it)}`).join('')}</div>`;
      }
      return `<div style="${ff}${fc}padding:${p};">${inner}</div>`;
    }
    case 'gallery': {
      const items=s.items||[];
      const cols=s.cols==='2'?2:s.cols==='4'?4:s.cols==='masonry'?3:3;
      const gap=s.gap==='sm'?'.3rem':s.gap==='lg'?'1rem':'.5rem';
      const h=s.height==='sm'?'120px':s.height==='lg'?'280px':'180px';
      const p=s.pad==='sm'?'1rem 2rem':s.pad==='lg'?'4rem 2rem':'2rem 2rem';
      const r2=s.radius==='sm'?'4px':s.radius==='lg'?'12px':'0';
      const inner=`<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:${gap};">${items.map(it=>{
        const wrap=it.url?`<a href="${bA(it.url)}" target="_blank" rel="noopener" style="display:block;overflow:hidden;border-radius:${r2};">`:`<div style="overflow:hidden;border-radius:${r2};">`;
        const close=it.url?'</a>':'</div>';
        return `${wrap}${it.img?`<img src="${bA(it.img)}" alt="${bA(it.caption||'')}" style="width:100%;height:${h};object-fit:cover;display:block;transition:transform .3s;" />`:`<div style="width:100%;height:${h};background:${bRgb(accent,.06)};border:1px dashed ${bRgb(accent,.15)};"></div>`}${close}`;
      }).join('')}</div>`;
      return `<div style="${ff}${fc}padding:${p};">${inner}</div>`;
    }
    case 'imgtext': {
      const p=s.pad==='sm'?'1.5rem 2rem':s.pad==='lg'?'5rem 2rem':'3rem 2rem';
      const rev=s.reverse==='yes'?'direction:rtl;':'';
      const r2=s.radius==='sm'?'4px':s.radius==='lg'?'12px':s.radius==='circle'?'50%':'0';
      const imgW=s.img_w==='sm'?'35%':s.img_w==='lg'?'55%':'45%';
      const imgH=s.img_h==='sm'?'200px':s.img_h==='lg'?'420px':'300px';
      const imgHtml=s.img?`<img src="${bA(s.img)}" alt="" style="width:100%;height:${imgH};object-fit:cover;border-radius:${r2};display:block;" />`:`<div style="width:100%;height:${imgH};background:${bRgb(accent,.06)};border:1px dashed ${bRgb(accent,.15)};border-radius:${r2};"></div>`;
      return `<div style="${ff}${fc}padding:${p};"><div style="display:grid;grid-template-columns:${imgW} 1fr;gap:2.5rem;align-items:center;${rev}">
        <div style="direction:ltr;">${imgHtml}</div>
        <div style="direction:ltr;">
          ${s.eyebrow?`<p style="font-size:.6rem;letter-spacing:.38em;text-transform:uppercase;color:${accent};margin-bottom:.6rem;font-weight:200;">${bE(s.eyebrow)}</p>`:''}
          ${s.heading?`<h2 style="font-size:clamp(1.2rem,3vw,1.8rem);font-weight:300;letter-spacing:.02em;margin-bottom:.8rem;line-height:1.15;">${bE(s.heading)}</h2>`:''}
          ${s.body?`<p style="font-weight:200;font-size:.88rem;line-height:1.85;color:${bRgb(text,.68)};">${bE(s.body)}</p>`:''}
          ${s.btn_label?`<a href="${bA(s.btn_url||'#')}" style="display:inline-block;margin-top:1.2rem;font-size:.68rem;font-weight:300;letter-spacing:.2em;text-transform:uppercase;color:${accent};border:1px solid ${bRgb(accent,.3)};padding:.55rem 1.4rem;text-decoration:none;">${bE(s.btn_label)}</a>`:''}
        </div>
      </div></div>`;
    }
    case 'group': {
      const open=s.default_open!=='no'&&s.default_open!==false;
      const inner=(s.sections||[]).map(cs=>bRender(cs,theme)).join('');
      return `<details class="bld-group-details" ${open?'open':''}><summary class="bld-group-summary" style="color:${bRgb(text,.75)};font-family:'${theme.font}',sans-serif;">${bE(s.label||'Group')}<span style="font-size:.65rem;color:${bRgb(accent,.4)};">▾</span></summary><div class="bld-group-body">${inner||`<div class="bld-group-empty">Empty — add sections via editor</div>`}</div></details>`;
    }
    case 'accordion': {
      const items=s.items||[];
      const p=s.pad==='sm'?'1rem 2rem':s.pad==='lg'?'4rem 2rem':'2rem 2rem';
      const bordered=s.style==='bordered';
      const inner=items.map(it=>`<details style="border-bottom:1px solid ${bRgb(accent,.12)};${bordered?`border:1px solid ${bRgb(accent,.12)};margin-bottom:.5rem;`:''}">
        <summary style="cursor:pointer;padding:.85rem ${bordered?'1rem':'0'};font-weight:300;font-size:.88rem;letter-spacing:.04em;color:${bRgb(text,.88)};list-style:none;display:flex;justify-content:space-between;align-items:center;">${bE(it.q||'Question')}<span style="font-size:.7rem;color:${bRgb(accent,.45)};">▼</span></summary>
        <div class="md-content" style="padding:.5rem ${bordered?'1rem':'0'} 1rem;font-size:.82rem;font-weight:200;line-height:1.85;color:${bRgb(text,.62)};">${md(it.a)}</div>
      </details>`).join('');
      return `<div style="${ff}${fc}padding:${p};">${inner||`<div style="font-size:.65rem;letter-spacing:.2em;color:${bRgb(accent,.25)};text-align:center;padding:1rem;">Add accordion items in editor</div>`}</div>`;
    }
    case 'carousel': {
      const items=s.items||[];
      if (!items.length) return `<div style="${ff}${fc}padding:2rem;text-align:center;font-size:.65rem;letter-spacing:.2em;color:${bRgb(accent,.25)};">Add slides in the editor</div>`;
      const h=s.height==='sm'?'200px':s.height==='lg'?'480px':'320px';
      const r2=s.radius==='sm'?'4px':s.radius==='lg'?'12px':'0';
      const p=s.pad==='sm'?'1rem 2rem':s.pad==='lg'?'4rem 2rem':'2rem 2rem';
      const slides=items.map((it,i)=>`<div data-slide="${i}" style="display:${i===0?'block':'none'};">${it.img?`<img src="${bA(it.img)}" alt="${bA(it.caption||'')}" style="width:100%;height:${h};object-fit:cover;display:block;border-radius:${r2};" />`:`<div style="width:100%;height:${h};background:${bRgb(accent,.06)};border:1px dashed ${bRgb(accent,.15)};border-radius:${r2};"></div>`}${it.caption?`<p style="text-align:center;font-size:.62rem;color:${bRgb(text,.4)};margin-top:.4rem;font-weight:200;">${bE(it.caption)}</p>`:''}</div>`).join('');
      return `<div style="${ff}${fc}padding:${p};"><div class="bld-carousel-wrap" data-carousel>${slides}${items.length>1?`<button class="bld-carousel-btn" data-prev style="left:.5rem;">‹</button><button class="bld-carousel-btn" data-next style="right:.5rem;">›</button><div class="bld-carousel-ctr" data-slide-ctr>1 / ${items.length}</div>`:''}</div></div>`;
    }
    case 'fileprev': {
      const p=s.pad==='sm'?'1rem 2rem':s.pad==='lg'?'4rem 2rem':'2rem 2rem';
      const h=s.height==='sm'?'300px':s.height==='lg'?'720px':s.height==='xl'?'90vh':'520px';
      return `<div style="${ff}${fc}padding:${p};">${s.url?`<div style="border:1px solid ${bRgb(accent,.12)};overflow:hidden;height:${h};display:flex;align-items:center;justify-content:center;font-size:.65rem;letter-spacing:.18em;color:${bRgb(accent,.35)};">[ File preview: ${bE(s.url)} ]</div>`:`<div style="border:1px dashed ${bRgb(accent,.12)};height:${h};display:flex;align-items:center;justify-content:center;font-size:.58rem;letter-spacing:.22em;text-transform:uppercase;color:${bRgb(accent,.2)};">No file selected</div>`}</div>`;
    }
    case 'filedown': {
      const p=s.pad==='sm'?'1.5rem 2rem':s.pad==='lg'?'5rem 2rem':'3rem 2rem';
      const jc=s.align==='left'?'flex-start':s.align==='right'?'flex-end':'center';
      const bs=s.btn_style||'solid';
      const btnCss=bs==='outline'?`background:transparent;border:1px solid ${accent};color:${accent};`:bs==='ghost'?`background:transparent;border:1px solid ${bRgb(text,.25)};color:${text};`:`background:${accent};border:1px solid ${accent};color:${bg};`;
      return `<div style="${ff}${fc}padding:${p};"><div style="display:flex;flex-direction:column;align-items:${jc};gap:.4rem;"><a href="${bA(s.url||'#')}" style="${btnCss}display:inline-block;font-weight:300;font-size:.75rem;letter-spacing:.22em;text-transform:uppercase;padding:.65rem 1.8rem;text-decoration:none;">↓ ${bE(s.label||'Download')}</a>${s.filename?`<span style="font-size:.58rem;font-weight:200;letter-spacing:.12em;color:${bRgb(text,.38)};">${bE(s.filename)}</span>`:''}</div></div>`;
    }
    case 'tutorials': {
      const p=s.pad==='sm'?'1rem 2rem':s.pad==='lg'?'4rem 2rem':'2rem 2rem';
      const ha=s.heading_align||'center';
      const headingHtml=s.heading?`<div style="font-size:.82rem;font-weight:200;letter-spacing:.12em;text-transform:uppercase;color:${bRgb(accent,.7)};text-align:${ha};margin-bottom:1.2rem;">${bE(s.heading)}</div>`:'';
      const maxNote=s.max_items&&s.max_items!=='0'?` · max ${s.max_items}`:'';
      const styleNote=s.tut_style==='list'?'List':'Cards';
      return `<div style="${ff}${fc}padding:${p};">${headingHtml}<div style="border:1px dashed ${bRgb(accent,.12)};padding:2rem;text-align:center;font-size:.62rem;letter-spacing:.22em;text-transform:uppercase;color:${bRgb(accent,.32)};font-weight:100;">Tutorials — ${styleNote}${maxNote}</div></div>`;
    }
    case 'reviews': {
      const p=s.pad==='sm'?'1rem 2rem':s.pad==='lg'?'4rem 2rem':'2rem 2rem';
      const ha=s.heading_align||'center';
      const headingHtml=s.heading?`<div style="font-size:.82rem;font-weight:200;letter-spacing:.12em;text-transform:uppercase;color:${bRgb(accent,.7)};text-align:${ha};margin-bottom:1.2rem;">${bE(s.heading)}</div>`:'';
      const maxNote=s.max_items&&s.max_items!=='0'?` · max ${s.max_items}`:'';
      const styleNote=s.rev_style==='list'?'List':'Cards';
      return `<div style="${ff}${fc}padding:${p};">${headingHtml}<div style="border:1px dashed ${bRgb(accent,.12)};padding:2rem;text-align:center;font-size:.62rem;letter-spacing:.22em;text-transform:uppercase;color:${bRgb(accent,.32)};font-weight:100;">Reviews — ${styleNote}${maxNote}</div></div>`;
    }
    default: return bXtra(s, { E: bE, A: bA, rgb: bRgb, md, accent, text, bg, font });
  }
}



function bXtra(s, h) {
  const { E, A, rgb, md, accent, text, bg, font } = h;
  const f = `font-family:'${font}',sans-serif;`;
  const c = `color:${text};`;
  const PAD = (p) => p === 'sm' ? '2.25rem' : p === 'lg' ? '5.5rem' : '3.75rem';
  const wrap = (inner, extra = '') => `<div style="${f}${c}padding:${PAD(s.pad)} 1.5rem;${extra}">${inner}</div>`;
  const cont = (inner, mw = '1080px') => `<div style="max-width:${mw};margin:0 auto;">${inner}</div>`;
  const btn = (label, url, style) => {
    if (!label) return '';
    const base = 'display:inline-block;text-decoration:none;font-weight:400;font-size:.76rem;letter-spacing:.12em;text-transform:uppercase;padding:.8rem 1.7rem;border-radius:8px;';
    const sty = style === 'outline' ? `border:1px solid ${rgb(accent, .55)};color:${accent};` : `background:${accent};color:${bg};border:1px solid ${accent};`;
    return `<a href="${A(url || '#')}" style="${base}${sty}">${E(label)}</a>`;
  };
  const secHead = (align = 'center') => {
    if (!s.eyebrow && !s.heading && !s.sub) return '';
    return `<div style="text-align:${align};margin-bottom:2.6rem;">
      ${s.eyebrow ? `<div style="font-size:.7rem;letter-spacing:.3em;text-transform:uppercase;color:${accent};font-weight:400;margin-bottom:.85rem;">${E(s.eyebrow)}</div>` : ''}
      ${s.heading ? `<h2 style="font-size:clamp(1.6rem,4vw,2.4rem);font-weight:300;letter-spacing:-.01em;line-height:1.15;margin:0;">${E(s.heading)}</h2>` : ''}
      ${s.sub ? `<p style="font-size:1rem;font-weight:200;line-height:1.7;color:${rgb(text, .6)};max-width:560px;margin:.9rem ${align === 'center' ? 'auto' : '0'} 0;">${E(s.sub)}</p>` : ''}
    </div>`;
  };
  const items = s.items || [];

  switch (s.type) {
    case 'banner': {
      const mh = s.min_h === 'sm' ? '42vh' : s.min_h === 'lg' ? '82vh' : s.min_h === 'full' ? '100vh' : '60vh';
      const align = s.align || 'center';
      const ai = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';
      const ov = s.overlay || '0.5';
      const bgStyle = s.bg_img
        ? `background-image:linear-gradient(rgba(0,0,0,${ov}),rgba(0,0,0,${ov})),url('${A(s.bg_img)}');background-size:cover;background-position:center;`
        : `background:${rgb(accent, .06)};`;
      const onImg = !!s.bg_img;
      return `<div style="${f}${c}${bgStyle}min-height:${mh};display:flex;flex-direction:column;align-items:${ai};justify-content:center;text-align:${align};padding:4.5rem 1.5rem;">
        <div style="max-width:760px;">
        ${s.eyebrow ? `<div style="font-size:.72rem;letter-spacing:.32em;text-transform:uppercase;font-weight:400;margin-bottom:1.1rem;color:${onImg ? 'rgba(255,255,255,.88)' : accent};">${E(s.eyebrow)}</div>` : ''}
        <h1 style="font-size:clamp(2.2rem,6vw,4rem);font-weight:300;line-height:1.05;letter-spacing:-.02em;margin:0;color:${onImg ? '#fff' : text};">${E(s.heading || 'Headline')}</h1>
        ${s.subheading ? `<p style="font-size:clamp(1rem,2vw,1.22rem);font-weight:200;line-height:1.6;margin:1.2rem 0 0;color:${onImg ? 'rgba(255,255,255,.85)' : rgb(text, .62)};">${E(s.subheading)}</p>` : ''}
        ${(s.btn_label || s.btn2_label) ? `<div style="display:flex;gap:.8rem;flex-wrap:wrap;justify-content:${ai};margin-top:2rem;">${btn(s.btn_label, s.btn_url, 'solid')}${btn(s.btn2_label, s.btn2_url, 'outline')}</div>` : ''}
        </div></div>`;
    }
    case 'features': {
      const min = s.cols === '4' ? '200px' : s.cols === '2' ? '300px' : '240px';
      const ca = s.card_align || 'left';
      const cards = items.map(it => `<div style="text-align:${ca};">
        ${it.icon ? `<div style="font-size:2rem;line-height:1;margin-bottom:1rem;">${E(it.icon)}</div>` : ''}
        <div style="font-size:1.05rem;font-weight:400;letter-spacing:.01em;margin-bottom:.5rem;">${E(it.title || '')}</div>
        <div style="font-size:.9rem;font-weight:200;line-height:1.7;color:${rgb(text, .6)};">${E(it.text || '')}</div>
      </div>`).join('');
      return wrap(cont(secHead() + `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(${min},1fr));gap:2.2rem;">${cards}</div>`));
    }
    case 'steps': {
      const cards = items.map((it, i) => `<div style="display:flex;gap:1rem;align-items:flex-start;">
        <div style="flex-shrink:0;width:42px;height:42px;border-radius:50%;border:1px solid ${rgb(accent, .4)};color:${accent};display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:300;">${i + 1}</div>
        <div><div style="font-size:1.02rem;font-weight:400;margin-bottom:.35rem;">${E(it.title || '')}</div><div style="font-size:.9rem;font-weight:200;line-height:1.7;color:${rgb(text, .6)};">${E(it.text || '')}</div></div>
      </div>`).join('');
      const grid = s.layout === 'row' ? 'grid-template-columns:repeat(auto-fit,minmax(220px,1fr));' : 'grid-template-columns:1fr;max-width:620px;margin:0 auto;';
      return wrap(cont(secHead() + `<div style="display:grid;${grid}gap:2rem;">${cards}</div>`));
    }
    case 'pricing': {
      const cards = items.map(it => {
        const feat = String(it.features || '').split('\n').filter(Boolean).map(ln => `<li style="font-size:.86rem;font-weight:200;line-height:1.5;color:${rgb(text, .7)};padding:.45rem 0;border-bottom:1px solid ${rgb(accent, .08)};list-style:none;">${E(ln)}</li>`).join('');
        const fe = it.featured === 'yes';
        return `<div style="border:1px solid ${fe ? rgb(accent, .5) : rgb(accent, .14)};background:${fe ? rgb(accent, .07) : rgb(accent, .03)};border-radius:16px;padding:2rem 1.6rem;display:flex;flex-direction:column;">
          ${fe ? `<div style="align-self:flex-start;font-size:.58rem;letter-spacing:.2em;text-transform:uppercase;background:${accent};color:${bg};padding:.25rem .6rem;border-radius:5px;margin-bottom:1rem;font-weight:400;">${E(it.badge || 'Popular')}</div>` : ''}
          <div style="font-size:.92rem;font-weight:400;letter-spacing:.05em;text-transform:uppercase;color:${rgb(text, .7)};margin-bottom:.6rem;">${E(it.name || '')}</div>
          <div style="display:flex;align-items:baseline;gap:.3rem;margin-bottom:1.3rem;"><span style="font-size:2.4rem;font-weight:300;letter-spacing:-.02em;">${E(it.price || '')}</span>${it.period ? `<span style="font-size:.8rem;font-weight:200;color:${rgb(text, .5)};">${E(it.period)}</span>` : ''}</div>
          <ul style="margin:0 0 1.6rem;padding:0;flex:1;">${feat}</ul>
          ${btn(it.btn_label || 'Choose', it.btn_url, fe ? 'solid' : 'outline')}
        </div>`;
      }).join('');
      return wrap(cont(secHead() + `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.4rem;align-items:stretch;">${cards}</div>`));
    }
    case 'testimonials': {
      const cards = items.map(it => `<div style="border:1px solid ${rgb(accent, .12)};background:${rgb(accent, .03)};border-radius:14px;padding:1.6rem;display:flex;flex-direction:column;gap:1rem;">
        <div style="font-size:.95rem;font-weight:200;line-height:1.75;color:${rgb(text, .8)};font-style:italic;">&ldquo;${E(it.quote || '')}&rdquo;</div>
        <div style="display:flex;align-items:center;gap:.7rem;margin-top:auto;">
          ${it.avatar ? `<img src="${A(it.avatar)}" alt="" style="width:38px;height:38px;border-radius:50%;object-fit:cover;" />` : ''}
          <div><div style="font-size:.85rem;font-weight:400;">${E(it.name || '')}</div>${it.role ? `<div style="font-size:.72rem;font-weight:200;color:${rgb(accent, .6)};">${E(it.role)}</div>` : ''}</div>
        </div></div>`).join('');
      return wrap(cont(secHead() + `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.4rem;">${cards}</div>`));
    }
    case 'team': {
      const min = s.cols === '4' ? '160px' : s.cols === '2' ? '240px' : '200px';
      const cards = items.map(it => {
        const inner = `${it.photo ? `<img src="${A(it.photo)}" alt="" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:14px;display:block;margin-bottom:.9rem;" />` : `<div style="width:100%;aspect-ratio:1;background:${rgb(accent, .08)};border-radius:14px;margin-bottom:.9rem;"></div>`}
          <div style="font-size:1rem;font-weight:400;">${E(it.name || '')}</div>${it.role ? `<div style="font-size:.8rem;font-weight:200;color:${rgb(accent, .6)};margin-top:.2rem;">${E(it.role)}</div>` : ''}`;
        return it.url ? `<a href="${A(it.url)}" style="text-decoration:none;color:inherit;display:block;">${inner}</a>` : `<div>${inner}</div>`;
      }).join('');
      return wrap(cont(secHead() + `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(${min},1fr));gap:1.6rem;text-align:${s.card_align || 'left'};">${cards}</div>`));
    }
    case 'logos': {
      const mh = s.size === 'lg' ? '56px' : s.size === 'sm' ? '32px' : '44px';
      const logos = items.map(it => {
        const img = it.img
          ? `<img src="${A(it.img)}" alt="${A(it.label || '')}" style="max-height:${mh};max-width:150px;object-fit:contain;opacity:.7;filter:${s.mono === 'yes' ? 'grayscale(1)' : 'none'};" />`
          : `<span style="font-size:1.05rem;font-weight:300;color:${rgb(text, .5)};">${E(it.label || '')}</span>`;
        return it.url ? `<a href="${A(it.url)}" style="display:flex;align-items:center;">${img}</a>` : `<div style="display:flex;align-items:center;">${img}</div>`;
      }).join('');
      const head = s.heading ? `<div style="text-align:center;font-size:.72rem;letter-spacing:.24em;text-transform:uppercase;color:${rgb(text, .45)};margin-bottom:1.8rem;font-weight:300;">${E(s.heading)}</div>` : '';
      return wrap(cont(head + `<div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:2.6rem;">${logos}</div>`, '860px'));
    }
    case 'video': {
      const u = s.url || ''; let embed = ''; let m;
      if ((m = u.match(/(?:youtube\.com\/.*[?&]v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/))) embed = 'https://www.youtube.com/embed/' + m[1];
      else if ((m = u.match(/vimeo\.com\/(?:video\/)?(\d+)/))) embed = 'https://player.vimeo.com/video/' + m[1];
      const mw = s.max_w === 'narrow' ? '640px' : s.max_w === 'full' ? '100%' : '860px';
      const frame = embed
        ? `<div style="position:relative;width:100%;aspect-ratio:16/9;border-radius:14px;overflow:hidden;"><iframe src="${A(embed)}" style="position:absolute;inset:0;width:100%;height:100%;border:0;" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen></iframe></div>`
        : `<div style="aspect-ratio:16/9;background:${rgb(accent, .06)};border:1px dashed ${rgb(accent, .2)};border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:.8rem;color:${rgb(text, .4)};">Paste a YouTube or Vimeo URL</div>`;
      return wrap(cont(frame + (s.caption ? `<p style="text-align:center;font-size:.78rem;font-weight:200;color:${rgb(text, .5)};margin-top:.9rem;">${E(s.caption)}</p>` : ''), mw));
    }
    case 'map': {
      const q = s.query || '';
      const src = /^https?:\/\//.test(q) ? q : 'https://maps.google.com/maps?q=' + encodeURIComponent(q) + '&output=embed';
      const ht = s.height === 'sm' ? '280px' : s.height === 'lg' ? '520px' : '400px';
      const frame = q
        ? `<iframe src="${A(src)}" style="width:100%;height:${ht};border:0;border-radius:14px;display:block;" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`
        : `<div style="height:${ht};background:${rgb(accent, .06)};border:1px dashed ${rgb(accent, .2)};border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:.8rem;color:${rgb(text, .4)};">Enter an address or Google Maps embed URL</div>`;
      return wrap(cont(frame));
    }
    case 'marquee': {
      const sp = s.speed === 'slow' ? '40s' : s.speed === 'fast' ? '14s' : '24s';
      const one = `<span style="padding:0 1.5rem;">${E(s.text || 'Announcement')}</span><span style="opacity:.4;">${E(s.separator || '•')}</span>`;
      const run = one.repeat(8);
      return `<div style="${f}${c}overflow:hidden;white-space:nowrap;background:${rgb(accent, .07)};border-top:1px solid ${rgb(accent, .12)};border-bottom:1px solid ${rgb(accent, .12)};padding:.85rem 0;font-size:.95rem;font-weight:300;letter-spacing:.04em;"><style>@keyframes foyer-marq{from{transform:translateX(0)}to{transform:translateX(-50%)}}</style><div style="display:inline-block;animation:foyer-marq ${sp} linear infinite;">${run}${run}</div></div>`;
    }
    case 'sectionhead': return wrap(cont(secHead(s.align || 'center'), '720px'));
    case 'lead': {
      const ta = s.align || 'center';
      return wrap(cont(`<p style="font-size:clamp(1.1rem,2.5vw,1.5rem);font-weight:200;line-height:1.6;color:${rgb(text, .8)};text-align:${ta};margin:0;">${E(s.text || '')}</p>`, '680px'));
    }
    case 'callout': {
      const v = s.variant || 'info';
      const col = v === 'warn' ? '#e6b15a' : v === 'success' ? '#6cd49a' : v === 'tip' ? accent : '#7fa6d8';
      const ic = s.icon || (v === 'warn' ? '⚠️' : v === 'success' ? '✅' : v === 'tip' ? '💡' : 'ℹ️');
      return wrap(cont(`<div style="display:flex;gap:.9rem;border:1px solid ${rgb(text, .1)};border-left:3px solid ${col};background:${rgb(text, .03)};border-radius:10px;padding:1.1rem 1.3rem;"><div style="font-size:1.2rem;line-height:1.3;flex-shrink:0;">${E(ic)}</div><div>${s.title ? `<div style="font-weight:400;font-size:.95rem;margin-bottom:.3rem;color:${col};">${E(s.title)}</div>` : ''}<div class="md-content" style="font-size:.88rem;font-weight:200;line-height:1.7;color:${rgb(text, .72)};">${md(s.body)}</div></div></div>`, '720px'));
    }
    case 'code': {
      return wrap(cont(`<div style="border:1px solid ${rgb(accent, .14)};border-radius:10px;overflow:hidden;background:rgba(0,0,0,.35);">${s.lang ? `<div style="padding:.45rem .9rem;border-bottom:1px solid ${rgb(accent, .1)};font-size:.6rem;letter-spacing:.15em;text-transform:uppercase;color:${rgb(text, .45)};">${E(s.lang)}</div>` : ''}<pre style="margin:0;padding:1rem 1.1rem;overflow-x:auto;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:.82rem;line-height:1.6;color:${rgb(text, .85)};white-space:pre;">${E(s.code || '')}</pre></div>`, '760px'));
    }
    case 'specs': {
      const rows = items.map(it => `<div style="display:flex;justify-content:space-between;gap:1.5rem;padding:.7rem 0;border-bottom:1px solid ${rgb(accent, .1)};"><span style="font-size:.85rem;font-weight:200;color:${rgb(text, .55)};">${E(it.label || '')}</span><span style="font-size:.85rem;font-weight:300;color:${rgb(text, .9)};text-align:right;">${E(it.value || '')}</span></div>`).join('');
      return wrap(cont((s.heading ? `<h3 style="font-size:1.1rem;font-weight:300;margin-bottom:1rem;">${E(s.heading)}</h3>` : '') + `<div>${rows}</div>`, '620px'));
    }
    case 'timeline': {
      const rows = items.map(it => `<div style="display:flex;gap:1.1rem;padding-bottom:1.8rem;">
        <div style="flex-shrink:0;width:90px;text-align:right;font-size:.72rem;font-weight:300;letter-spacing:.05em;color:${accent};padding-top:.1rem;">${E(it.date || '')}</div>
        <div style="flex-shrink:0;width:1px;background:${rgb(accent, .25)};position:relative;"><span style="position:absolute;top:.2rem;left:-4px;width:9px;height:9px;border-radius:50%;background:${accent};"></span></div>
        <div><div style="font-size:.98rem;font-weight:400;margin-bottom:.25rem;">${E(it.title || '')}</div>${it.text ? `<div style="font-size:.85rem;font-weight:200;line-height:1.7;color:${rgb(text, .6)};">${E(it.text)}</div>` : ''}</div>
      </div>`).join('');
      return wrap(cont(secHead('left') + `<div>${rows}</div>`, '640px'));
    }
    case 'tabs': {
      const id = 'tb' + String(s.id || 'x').replace(/[^a-z0-9]/gi, '');
      const radios = items.map((_, i) => `<input type="radio" name="${id}" id="${id}-${i}"${i === 0 ? ' checked' : ''} style="position:absolute;opacity:0;pointer-events:none;">`).join('');
      const bar = `<div class="${id}-bar" style="display:flex;gap:.3rem;border-bottom:1px solid ${rgb(accent, .15)};overflow-x:auto;">${items.map((it, i) => `<label for="${id}-${i}" style="cursor:pointer;padding:.6rem 1rem;font-size:.8rem;font-weight:300;color:${rgb(text, .5)};border-bottom:2px solid transparent;margin-bottom:-1px;white-space:nowrap;">${E(it.label || ('Tab ' + (i + 1)))}</label>`).join('')}</div>`;
      const pan = `<div class="${id}-pan">${items.map(it => `<div style="display:none;padding-top:1.1rem;"><div class="md-content" style="font-size:.9rem;font-weight:200;line-height:1.75;color:${rgb(text, .75)};">${md(it.body)}</div></div>`).join('')}</div>`;
      const css = `<style>${items.map((_, i) => `#${id}-${i}:checked~.${id}-bar label:nth-of-type(${i + 1}){color:${text};border-bottom-color:${accent}}#${id}-${i}:checked~.${id}-pan>div:nth-of-type(${i + 1}){display:block}`).join('')}</style>`;
      return wrap(cont(`<div style="position:relative;">${radios}${bar}${pan}${css}</div>`, '760px'));
    }
    case 'buttongroup': {
      const ai = s.align === 'left' ? 'flex-start' : s.align === 'right' ? 'flex-end' : 'center';
      const bs = items.map(it => btn(it.label, it.url, it.style === 'outline' ? 'outline' : 'solid')).join('');
      return wrap(cont(`<div style="display:flex;flex-wrap:wrap;gap:.7rem;justify-content:${ai};">${bs}</div>`, '760px'));
    }
    case 'toc': {
      const links = items.map(it => `<a href="#${A(it.anchor || '')}" style="display:block;padding:.5rem .2rem;border-bottom:1px solid ${rgb(accent, .08)};font-size:.88rem;font-weight:200;color:${rgb(text, .75)};text-decoration:none;">${E(it.label || '')}</a>`).join('');
      return wrap(cont((s.heading ? `<div style="font-size:.65rem;letter-spacing:.2em;text-transform:uppercase;color:${rgb(accent, .6)};margin-bottom:.8rem;font-weight:300;">${E(s.heading)}</div>` : '') + `<nav>${links}</nav>`, '560px'));
    }
    case 'masonry': {
      const cc = s.cols === '2' ? 2 : s.cols === '4' ? 4 : 3;
      const cells = items.map(it => it.img ? `<div style="break-inside:avoid;margin-bottom:.7rem;"><img src="${A(it.img)}" alt="${A(it.caption || '')}" style="width:100%;border-radius:10px;display:block;" />${it.caption ? `<div style="font-size:.7rem;font-weight:200;color:${rgb(text, .5)};margin-top:.3rem;">${E(it.caption)}</div>` : ''}</div>` : '').join('');
      return wrap(cont(`<div style="column-count:${cc};column-gap:.7rem;">${cells}</div>`));
    }
    case 'compare': {
      const hh = s.height === 'sm' ? '260px' : s.height === 'lg' ? '520px' : '380px';
      if (!s.before || !s.after) return wrap(cont(`<div style="height:${hh};background:${rgb(accent, .06)};border:1px dashed ${rgb(accent, .2)};border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:.8rem;color:${rgb(text, .4)};">Add a before and after image</div>`, '760px'));
      const cid = 'cmp' + String(s.id || 'x').replace(/[^a-z0-9]/gi, '');
      return wrap(cont(`<div style="position:relative;height:${hh};border-radius:12px;overflow:hidden;">
        <img src="${A(s.after)}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;" />
        <img id="${cid}" src="${A(s.before)}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;clip-path:inset(0 50% 0 0);" />
        <input type="range" min="0" max="100" value="50" oninput="document.getElementById('${cid}').style.clipPath='inset(0 '+(100-this.value)+'% 0 0)'" style="position:absolute;bottom:14px;left:5%;width:90%;cursor:ew-resize;" />
      </div>`, '760px'));
    }
    case 'testimonial': {
      return wrap(cont(`<figure style="text-align:center;margin:0;">
        <blockquote style="font-size:clamp(1.2rem,3vw,1.7rem);font-weight:200;font-style:italic;line-height:1.5;color:${rgb(text, .85)};margin:0 0 1.4rem;">&ldquo;${E(s.quote || '')}&rdquo;</blockquote>
        <figcaption style="display:flex;align-items:center;justify-content:center;gap:.7rem;">${s.avatar ? `<img src="${A(s.avatar)}" alt="" style="width:44px;height:44px;border-radius:50%;object-fit:cover;" />` : ''}<div style="text-align:left;"><div style="font-weight:400;font-size:.9rem;">${E(s.name || '')}</div>${s.role ? `<div style="font-size:.75rem;font-weight:200;color:${rgb(accent, .6)};">${E(s.role)}</div>` : ''}</div></figcaption>
      </figure>`, '680px'));
    }
    case 'rating': {
      const mx = parseInt(s.max, 10) || 5;
      const score = parseFloat(s.score) || 0;
      let stars = '';
      for (let i = 1; i <= mx; i++) { const fill = Math.max(0, Math.min(1, score - (i - 1))); stars += `<span style="position:relative;display:inline-block;color:${rgb(text, .18)};">★<span style="position:absolute;left:0;top:0;width:${fill * 100}%;overflow:hidden;color:${accent};">★</span></span>`; }
      const ta = s.align || 'center';
      return wrap(cont(`<div style="text-align:${ta};"><div style="font-size:1.5rem;letter-spacing:.1em;">${stars}</div><div style="margin-top:.5rem;font-size:.85rem;font-weight:200;color:${rgb(text, .65)};">${E(s.score || '')}${s.count ? ` · ${E(s.count)} reviews` : ''}${s.label ? ` · ${E(s.label)}` : ''}</div></div>`, '480px'));
    }
    case 'countdown': {
      const ta = s.align || 'center';
      const jc = ta === 'left' ? 'flex-start' : ta === 'right' ? 'flex-end' : 'center';
      const unit = (l) => `<div style="text-align:center;min-width:62px;"><div class="cd-n" style="font-size:clamp(1.8rem,5vw,2.8rem);font-weight:200;font-variant-numeric:tabular-nums;line-height:1;">--</div><div style="font-size:.58rem;letter-spacing:.2em;text-transform:uppercase;color:${rgb(accent, .6)};margin-top:.35rem;">${l}</div></div>`;
      return wrap(cont(`${s.heading ? `<div style="text-align:${ta};font-size:1.1rem;font-weight:300;margin-bottom:1.2rem;">${E(s.heading)}</div>` : ''}<div data-foyer-cd="${A(s.target || '')}" data-done="${A(s.done_text || '')}" style="display:flex;gap:1.2rem;justify-content:${jc};flex-wrap:wrap;">${unit('Days')}${unit('Hours')}${unit('Mins')}${unit('Secs')}</div>`, '560px'));
    }
    case 'badges': {
      const ai = s.align === 'left' ? 'flex-start' : s.align === 'right' ? 'flex-end' : 'center';
      const bs = items.map(it => `<div style="display:flex;align-items:center;gap:.5rem;border:1px solid ${rgb(accent, .15)};border-radius:30px;padding:.5rem 1rem;"><span style="font-size:1rem;">${E(it.icon || '✔')}</span><span style="font-size:.78rem;font-weight:300;color:${rgb(text, .75)};">${E(it.label || '')}</span></div>`).join('');
      return wrap(cont(`<div style="display:flex;flex-wrap:wrap;gap:.7rem;justify-content:${ai};">${bs}</div>`, '760px'));
    }
    case 'vcard': {
      const rows = items.map(it => `<a href="${A(it.href || '#')}" style="display:flex;justify-content:space-between;gap:1rem;padding:.6rem 0;border-bottom:1px solid ${rgb(accent, .1)};text-decoration:none;"><span style="font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;color:${rgb(accent, .55)};">${E(it.label || '')}</span><span style="font-size:.85rem;font-weight:300;color:${rgb(text, .85)};">${E(it.val || '')}</span></a>`).join('');
      return wrap(cont(`<div style="border:1px solid ${rgb(accent, .14)};background:${rgb(accent, .03)};border-radius:16px;padding:2rem;text-align:center;">
        ${s.photo ? `<img src="${A(s.photo)}" alt="" style="width:88px;height:88px;border-radius:50%;object-fit:cover;margin:0 auto 1rem;display:block;" />` : ''}
        <div style="font-size:1.3rem;font-weight:300;">${E(s.name || '')}</div>${s.role ? `<div style="font-size:.85rem;font-weight:200;color:${rgb(accent, .65)};margin-top:.2rem;">${E(s.role)}</div>` : ''}${s.tagline ? `<p style="font-size:.85rem;font-weight:200;line-height:1.7;color:${rgb(text, .6)};margin:.9rem 0 0;">${E(s.tagline)}</p>` : ''}
        <div style="margin-top:1.3rem;text-align:left;">${rows}</div>
      </div>`, '440px'));
    }
    case 'availability': {
      const on = s.status !== 'busy' && s.status !== 'unavailable';
      const col = on ? '#6cd49a' : '#e6b15a';
      const ai = s.align === 'left' ? 'flex-start' : s.align === 'right' ? 'flex-end' : 'center';
      return wrap(cont(`<div style="display:flex;justify-content:${ai};"><div style="display:inline-flex;align-items:center;gap:.55rem;border:1px solid ${rgb(text, .12)};background:${rgb(text, .03)};border-radius:30px;padding:.5rem 1.1rem;"><span style="position:relative;width:9px;height:9px;"><span style="position:absolute;inset:0;border-radius:50%;background:${col};"></span><span style="position:absolute;inset:0;border-radius:50%;background:${col};animation:fyrping 1.8s ease-out infinite;"></span></span><span style="font-size:.8rem;font-weight:300;letter-spacing:.04em;color:${rgb(text, .8)};">${E(s.text || '')}</span></div></div><style>@keyframes fyrping{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.6);opacity:0}}</style>`, '560px'));
    }
    case 'skills': {
      const ai = s.align === 'left' ? 'flex-start' : s.align === 'right' ? 'flex-end' : 'center';
      const tags = items.map(it => `<span style="border:1px solid ${rgb(accent, .25)};background:${rgb(accent, .05)};color:${rgb(text, .8)};border-radius:7px;padding:.4rem .85rem;font-size:.8rem;font-weight:300;">${E(it.label || '')}</span>`).join('');
      return wrap(cont((s.heading ? `<div style="text-align:${ai === 'center' ? 'center' : 'left'};font-size:1.05rem;font-weight:300;margin-bottom:1.1rem;">${E(s.heading)}</div>` : '') + `<div style="display:flex;flex-wrap:wrap;gap:.5rem;justify-content:${ai};">${tags}</div>`, '680px'));
    }
    case 'progress': {
      const rows = items.map(it => { const p = Math.max(0, Math.min(100, parseInt(it.pct, 10) || 0)); return `<div style="margin-bottom:1rem;"><div style="display:flex;justify-content:space-between;font-size:.82rem;font-weight:300;margin-bottom:.4rem;"><span>${E(it.label || '')}</span><span style="color:${rgb(accent, .7)};">${p}%</span></div><div style="height:7px;border-radius:4px;background:${rgb(accent, .1)};overflow:hidden;"><div style="height:100%;width:${p}%;background:${accent};border-radius:4px;"></div></div></div>`; }).join('');
      return wrap(cont((s.heading ? `<h3 style="font-size:1.1rem;font-weight:300;margin-bottom:1.1rem;">${E(s.heading)}</h3>` : '') + rows, '620px'));
    }
    case 'resume': {
      const rows = items.map(it => `<div style="display:flex;gap:1.2rem;padding-bottom:1.6rem;">
        <div style="flex-shrink:0;width:110px;font-size:.74rem;font-weight:300;color:${rgb(accent, .65)};padding-top:.15rem;">${E(it.date || '')}</div>
        <div><div style="font-size:.98rem;font-weight:400;">${E(it.title || '')}${it.org ? ` <span style="font-weight:200;color:${rgb(text, .5)};">· ${E(it.org)}</span>` : ''}</div>${it.text ? `<div style="font-size:.85rem;font-weight:200;line-height:1.7;color:${rgb(text, .6)};margin-top:.3rem;">${E(it.text)}</div>` : ''}</div>
      </div>`).join('');
      return wrap(cont((s.heading ? `<h3 style="font-size:1.1rem;font-weight:300;margin-bottom:1.3rem;">${E(s.heading)}</h3>` : '') + rows, '660px'));
    }
    case 'qrcode': {
      const sz = s.size === 'sm' ? 140 : s.size === 'lg' ? 260 : 200;
      const ta = s.align || 'center';
      const data = s.data || '';
      const img = data ? `<img src="https://api.qrserver.com/v1/create-qr-code/?size=${sz}x${sz}&margin=0&data=${encodeURIComponent(data)}" alt="QR code" width="${sz}" height="${sz}" style="border-radius:8px;background:#fff;padding:8px;" />` : `<div style="width:${sz}px;height:${sz}px;background:${rgb(accent, .06)};border:1px dashed ${rgb(accent, .2)};border-radius:8px;display:inline-flex;align-items:center;justify-content:center;font-size:.7rem;color:${rgb(text, .4)};">Enter a URL</div>`;
      return wrap(cont(`<div style="text-align:${ta};">${img}${s.caption ? `<div style="font-size:.75rem;font-weight:200;color:${rgb(text, .55)};margin-top:.6rem;">${E(s.caption)}</div>` : ''}</div>`, '480px'));
    }
    case 'toggle': {
      return wrap(cont(`<details style="border:1px solid ${rgb(accent, .15)};border-radius:10px;padding:.2rem .3rem;"><summary style="cursor:pointer;padding:.8rem 1rem;font-size:.9rem;font-weight:300;color:${rgb(text, .85)};list-style:none;">${E(s.label || 'Show more')}</summary><div class="md-content" style="padding:.2rem 1rem 1rem;font-size:.88rem;font-weight:200;line-height:1.7;color:${rgb(text, .7)};">${md(s.body)}</div></details>`, '680px'));
    }
    case 'copyfield': {
      const val = s.value || '';
      return wrap(cont(`<div style="max-width:420px;margin:0 auto;">${s.label ? `<div style="font-size:.65rem;letter-spacing:.15em;text-transform:uppercase;color:${rgb(accent, .6)};margin-bottom:.4rem;">${E(s.label)}</div>` : ''}<button type="button" data-v="${A(val)}" onclick="navigator.clipboard&&navigator.clipboard.writeText(this.getAttribute('data-v'));var b=this;b.lastChild.textContent='Copied';setTimeout(function(){b.lastChild.textContent='Copy'},1400)" style="width:100%;display:flex;align-items:center;justify-content:space-between;gap:1rem;border:1px solid ${rgb(accent, .25)};background:${rgb(accent, .04)};border-radius:9px;padding:.7rem 1rem;cursor:pointer;font-family:inherit;"><span style="font-family:ui-monospace,monospace;font-size:.85rem;color:${rgb(text, .85)};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${E(val)}</span><span style="font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:${accent};flex-shrink:0;">Copy</span></button></div>`, '480px'));
    }
    case 'embed': {
      const hh = s.height === 'sm' ? '320px' : s.height === 'lg' ? '640px' : '460px';
      const u = s.url || '';
      if (!u) return wrap(cont(`<div style="height:${hh};background:${rgb(accent, .06)};border:1px dashed ${rgb(accent, .2)};border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:.8rem;color:${rgb(text, .4)};">Paste an embed URL (CodePen, Figma, Loom, …)</div>`));
      return wrap(cont(`<iframe src="${A(u)}" style="width:100%;height:${hh};border:0;border-radius:12px;" loading="lazy" allowfullscreen></iframe>`));
    }
    case 'audio': {
      const u = s.url || ''; let embed = '', hh = '152px', m;
      if ((m = u.match(/open\.spotify\.com\/(track|playlist|album|episode|show)\/([A-Za-z0-9]+)/))) { embed = 'https://open.spotify.com/embed/' + m[1] + '/' + m[2]; hh = (m[1] === 'track' || m[1] === 'episode') ? '152px' : '352px'; }
      else if (/soundcloud\.com\//.test(u)) { embed = 'https://w.soundcloud.com/player/?url=' + encodeURIComponent(u) + '&visual=false'; hh = '166px'; }
      else if (/spotify|podcasts\.apple|player\./.test(u)) { embed = u; }
      if (!embed) return wrap(cont(`<div style="height:120px;background:${rgb(accent, .06)};border:1px dashed ${rgb(accent, .2)};border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:.8rem;color:${rgb(text, .4)};">Paste a Spotify or SoundCloud link</div>`, '620px'));
      return wrap(cont(`<iframe src="${A(embed)}" style="width:100%;height:${hh};border:0;border-radius:12px;" loading="lazy" allow="encrypted-media"></iframe>`, '620px'));
    }
    case 'socialpost': {
      const u = s.url || '';
      if (!u) return wrap(cont(`<div style="height:120px;background:${rgb(accent, .06)};border:1px dashed ${rgb(accent, .2)};border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:.8rem;color:${rgb(text, .4)};">Paste a post URL (X, Instagram, TikTok)</div>`, '520px'));
      let host = ''; try { host = new URL(u).hostname.replace('www.', ''); } catch (_) {}
      return wrap(cont(`<a href="${A(u)}" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:.8rem;border:1px solid ${rgb(accent, .18)};background:${rgb(accent, .04)};border-radius:12px;padding:1rem 1.2rem;text-decoration:none;"><span style="font-size:1.4rem;">🔗</span><div style="min-width:0;"><div style="font-size:.85rem;font-weight:300;color:${rgb(text, .85)};">View post on ${E(host || 'the web')}</div><div style="font-size:.7rem;font-weight:200;color:${rgb(text, .45)};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${E(u)}</div></div></a>`, '520px'));
    }
    case 'booking': {
      const hh = s.height === 'sm' ? '520px' : s.height === 'lg' ? '820px' : '680px';
      const u = s.url || '';
      if (!u) return wrap(cont(`<div style="height:${hh};background:${rgb(accent, .06)};border:1px dashed ${rgb(accent, .2)};border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:.8rem;color:${rgb(text, .4)};">Paste a Calendly or Cal.com link</div>`));
      return wrap(cont(`<iframe src="${A(u)}" style="width:100%;height:${hh};border:0;border-radius:12px;" loading="lazy"></iframe>`));
    }
    case 'newsletter': {
      const ist = `background:${rgb(text, .05)};border:1px solid ${rgb(accent, .2)};color:${text};font-family:inherit;font-size:.9rem;padding:.7rem .9rem;border-radius:8px;outline:none;`;
      return wrap(cont(`<div style="text-align:center;max-width:460px;margin:0 auto;">
        ${s.heading ? `<h3 style="font-size:1.3rem;font-weight:300;margin:0 0 .4rem;">${E(s.heading)}</h3>` : ''}
        ${s.sub ? `<p style="font-size:.9rem;font-weight:200;line-height:1.6;color:${rgb(text, .6)};margin:0;">${E(s.sub)}</p>` : ''}
        <form data-w3 data-done="You’re subscribed — thanks!" onsubmit="return false" style="display:flex;gap:.5rem;margin-top:1.2rem;flex-wrap:wrap;">
          <input type="hidden" name="_subject" value="New newsletter signup" />
          <input type="checkbox" name="botcheck" style="display:none;" tabindex="-1" autocomplete="off" />
          <input type="email" name="email" required placeholder="${A(s.placeholder || 'you@email.com')}" style="flex:1;min-width:180px;${ist}" />
          <button type="submit" style="background:${accent};color:${bg};border:none;font-family:inherit;font-weight:400;font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;padding:.7rem 1.4rem;border-radius:8px;cursor:pointer;">${E(s.button || 'Subscribe')}</button>
        </form>
      </div>`, '520px'));
    }
    case 'contactform': {
      const ist = `width:100%;background:${rgb(text, .05)};border:1px solid ${rgb(accent, .2)};color:${text};font-family:inherit;font-size:.9rem;padding:.7rem .9rem;border-radius:8px;outline:none;margin-bottom:.7rem;`;
      return wrap(cont(`<div style="max-width:520px;margin:0 auto;">${secHead('center')}
        <form data-w3 data-done="Thanks — I’ll be in touch soon." onsubmit="return false">
          <input type="hidden" name="_subject" value="New contact message" />
          <input type="checkbox" name="botcheck" style="display:none;" tabindex="-1" autocomplete="off" />
          <input type="text" name="name" required placeholder="Your name" style="${ist}" />
          <input type="email" name="email" required placeholder="you@email.com" style="${ist}" />
          <textarea name="message" required rows="5" placeholder="Your message" style="${ist}resize:vertical;"></textarea>
          <button type="submit" style="width:100%;background:${accent};color:${bg};border:none;font-family:inherit;font-weight:400;font-size:.8rem;letter-spacing:.1em;text-transform:uppercase;padding:.8rem;border-radius:8px;cursor:pointer;">${E(s.button || 'Send message')}</button>
        </form>
      </div>`, '560px'));
    }
    default: return '';
  }
}

function bDefault(type) {
  const id = Math.random().toString(36).slice(2,9);
  switch(type) {
    case 'hero':    return { id, type, eyebrow:'', name:'Zachary Lanson', tagline:'', align:'center', name_size:'lg', weight:'300', ls:'normal', pad:'md' };
    case 'bio':     return { id, type, heading:'About', body:'', align:'left', max_w:'normal', fsize:'md', lh:'normal', pad:'md' };
    case 'links':   return { id, type, items:[{t:'',u:'https://',d:'',new_tab:'yes'}], link_style:'card', pad:'md' };
    case 'contact': return { id, type, items:[{label:'Email',val:'',href:''},{label:'Phone',val:'',href:''}], align:'center', cstyle:'normal', pad:'md' };
    case 'social':  return { id, type, items:[{label:'Instagram',url:'https://instagram.com/'},{label:'LinkedIn',url:'https://linkedin.com/'}], align:'center', btn_style:'outline', pad:'md' };
    case 'cta':     return { id, type, text:'', button_label:'Get in touch', button_url:'', align:'center', btn_style:'solid', btn_size:'md', pad:'md' };
    case 'quote':   return { id, type, quote:'', attribution:'', variant:'border', pad:'md' };
    case 'heading': return { id, type, text:'Heading', size:'md', align:'left', weight:'300', ls:'normal', pad:'md' };
    case 'text':    return { id, type, text:'', align:'left', fsize:'md', lh:'normal', max_w:'normal', pad:'md' };
    case 'image':   return { id, type, url:'', caption:'', size:'full', align:'center', radius:'none', pad:'md' };
    case 'stats':   return { id, type, items:[{number:'100+',label:'Projects'},{number:'10',label:'Years'}], cols:'auto', pad:'md' };
    case 'divider': return { id, type, style:'fade', spacing:'md' };
    case 'spacer':  return { id, type, size:'md' };
    case 'link':    return { id, type, label:'Visit →', url:'', align:'center', style:'pill', size:'md', new_tab:'yes', pad:'md' };
    case 'cards':   return { id, type, items:[{img:'',title:'Card Title',body:'',url:'',new_tab:'yes'},{img:'',title:'Card Title',body:'',url:'',new_tab:'yes'}], layout:'grid-2', radius:'none', pad:'md' };
    case 'collection': return { id, type, heading:'My Collection', show_count:'yes', layout:'grid-3', items:[{imgs:[''],name:'Item one',note:'',for_sale:'no',price:''},{imgs:[''],name:'Item two',note:'',for_sale:'no',price:''}], pad:'md' };
    case 'gallery': return { id, type, items:[{img:'',url:'',caption:''},{img:'',url:'',caption:''},{img:'',url:'',caption:''}], cols:'3', height:'md', gap:'sm', radius:'none', pad:'md' };
    case 'imgtext':   return { id, type, img:'', reverse:'no', img_w:'md', img_h:'md', radius:'none', eyebrow:'', heading:'Heading', body:'', btn_label:'', btn_url:'', pad:'md' };
    case 'group':     return { id, type, label:'Group', default_open:'yes', sections:[] };
    case 'accordion': return { id, type, items:[{q:'Question one',a:'Answer one'},{q:'Question two',a:'Answer two'}], style:'minimal', pad:'md' };
    case 'carousel':  return { id, type, items:[{img:'',caption:''},{img:'',caption:''}], height:'md', radius:'none', pad:'md' };
    case 'fileprev':  return { id, type, url:'', height:'md', pad:'md' };
    case 'filedown':  return { id, type, url:'', label:'Download', filename:'', align:'center', btn_style:'solid', pad:'md' };
    case 'tutorials': return { id, type, tut_style:'cards', heading:'', heading_align:'center', max_items:'0', view_all_show:'yes', view_all_label:'View all →', pad:'md' };
    case 'reviews': return { id, type, rev_style:'cards', heading:'', heading_align:'center', max_items:'0', view_all_show:'yes', view_all_label:'View all →', pad:'md' };
    case 'banner':  return { id, type, eyebrow:'', heading:'Your headline here', subheading:'A short supporting line that sells it.', btn_label:'Get started', btn_url:'', btn2_label:'', btn2_url:'', bg_img:'', overlay:'0.5', min_h:'md', align:'center', pad:'md' };
    case 'features':return { id, type, eyebrow:'', heading:'What we offer', sub:'', items:[{icon:'✦',title:'Feature one',text:'Describe it in a sentence.'},{icon:'✦',title:'Feature two',text:'Describe it in a sentence.'},{icon:'✦',title:'Feature three',text:'Describe it in a sentence.'}], cols:'3', card_align:'left', pad:'md' };
    case 'steps':   return { id, type, eyebrow:'', heading:'How it works', sub:'', items:[{title:'Step one',text:'What happens first.'},{title:'Step two',text:'What happens next.'},{title:'Step three',text:'And finally this.'}], layout:'stack', pad:'md' };
    case 'pricing': return { id, type, eyebrow:'', heading:'Pricing', sub:'', items:[{name:'Basic',price:'$0',period:'/mo',features:'Feature A\nFeature B',btn_label:'Choose',btn_url:'',featured:'no'},{name:'Pro',price:'$29',period:'/mo',features:'Everything in Basic\nFeature C\nFeature D',btn_label:'Choose',btn_url:'',featured:'yes',badge:'Popular'}], pad:'md' };
    case 'testimonials': return { id, type, eyebrow:'', heading:'What people say', sub:'', items:[{quote:'This made all the difference for us.',name:'Jane Doe',role:'Customer',avatar:''},{quote:'Couldn’t recommend it more highly.',name:'John Smith',role:'Customer',avatar:''}], pad:'md' };
    case 'team':    return { id, type, eyebrow:'', heading:'Our team', sub:'', items:[{photo:'',name:'Full Name',role:'Role',url:''},{photo:'',name:'Full Name',role:'Role',url:''},{photo:'',name:'Full Name',role:'Role',url:''}], cols:'3', card_align:'left', pad:'md' };
    case 'logos':   return { id, type, heading:'Trusted by', items:[{img:'',label:'Brand',url:''},{img:'',label:'Brand',url:''},{img:'',label:'Brand',url:''},{img:'',label:'Brand',url:''}], size:'md', mono:'yes', pad:'md' };
    case 'video':   return { id, type, url:'', caption:'', max_w:'normal', pad:'md' };
    case 'map':     return { id, type, query:'', height:'md', pad:'md' };
    case 'marquee': return { id, type, text:'Announcement — limited time offer', separator:'•', speed:'normal' };
    case 'sectionhead': return { id, type, eyebrow:'', heading:'Section heading', sub:'', align:'center', pad:'md' };
    case 'lead':    return { id, type, text:'A short, larger introduction that sets up what follows.', align:'center', pad:'md' };
    case 'callout': return { id, type, variant:'info', title:'', body:'Heads up — something worth noting goes here.', icon:'', pad:'md' };
    case 'code':    return { id, type, code:'console.log("hello")', lang:'', pad:'md' };
    case 'specs':   return { id, type, heading:'', items:[{label:'Label',value:'Value'},{label:'Label',value:'Value'}], pad:'md' };
    case 'timeline':return { id, type, eyebrow:'', heading:'', sub:'', items:[{date:'2024',title:'Something happened',text:''},{date:'2025',title:'Then this',text:''}], pad:'md' };
    case 'tabs':    return { id, type, items:[{label:'Tab one',body:'First panel.'},{label:'Tab two',body:'Second panel.'}], pad:'md' };
    case 'buttongroup': return { id, type, items:[{label:'Primary',url:'',style:'solid'},{label:'Secondary',url:'',style:'outline'}], align:'center', pad:'md' };
    case 'toc':     return { id, type, heading:'On this page', items:[{label:'Section one',anchor:''},{label:'Section two',anchor:''}], pad:'md' };
    case 'masonry': return { id, type, items:[{img:'',caption:''},{img:'',caption:''},{img:'',caption:''}], cols:'3', pad:'md' };
    case 'compare': return { id, type, before:'', after:'', height:'md', pad:'md' };
    case 'testimonial': return { id, type, quote:'A single, featured testimonial that carries the section on its own.', name:'', role:'', avatar:'', pad:'md' };
    case 'rating':  return { id, type, score:'4.9', max:'5', count:'', label:'', align:'center', pad:'md' };
    case 'countdown': return { id, type, heading:'', target:'', done_text:'It’s here!', align:'center', pad:'md' };
    case 'badges':  return { id, type, items:[{icon:'🔒',label:'Secure checkout'},{icon:'↩️',label:'30-day returns'},{icon:'⭐',label:'Top rated'}], align:'center', pad:'md' };
    case 'vcard':   return { id, type, photo:'', name:'Your Name', role:'', tagline:'', items:[{label:'Email',val:'',href:''},{label:'Website',val:'',href:''}], pad:'md' };
    case 'availability': return { id, type, status:'available', text:'Available for new work', align:'center', pad:'md' };
    case 'skills':  return { id, type, heading:'', items:[{label:'JavaScript'},{label:'Design'},{label:'Cloudflare'}], align:'center', pad:'md' };
    case 'progress':return { id, type, heading:'', items:[{label:'Design',pct:'90'},{label:'Code',pct:'75'}], pad:'md' };
    case 'resume':  return { id, type, heading:'', items:[{date:'2022 — now',title:'Role',org:'Company',text:''},{date:'2019 — 2022',title:'Role',org:'Company',text:''}], pad:'md' };
    case 'qrcode':  return { id, type, data:'', caption:'', size:'md', align:'center', pad:'md' };
    case 'toggle':  return { id, type, label:'Show more', body:'Hidden content revealed on click.', pad:'md' };
    case 'copyfield': return { id, type, label:'', value:'hello@example.com', pad:'md' };
    case 'embed':   return { id, type, url:'', height:'md', pad:'md' };
    case 'audio':   return { id, type, url:'', pad:'md' };
    case 'socialpost': return { id, type, url:'', pad:'md' };
    case 'booking': return { id, type, url:'', height:'lg', pad:'md' };
    case 'newsletter': return { id, type, heading:'Subscribe', sub:'Get new posts in your inbox.', button:'Subscribe', placeholder:'you@email.com', pad:'md' };
    case 'contactform': return { id, type, eyebrow:'', heading:'Get in touch', sub:'', button:'Send message', pad:'md' };
  }
}

function bAlignRow(cur) {
  return `<div class="bld-ef"><label>Alignment</label><div class="bld-align-row">
    <button class="bld-ab${(!cur||cur==='left')?' act':''}" data-align="left">Left</button>
    <button class="bld-ab${cur==='center'?' act':''}" data-align="center">Center</button>
    <button class="bld-ab${cur==='right'?' act':''}" data-align="right">Right</button>
  </div></div>`;
}

function bSel(name, cur, opts) {
  return `<div class="bld-ef"><label>${name}</label><select data-f="${opts[0][2]}">${opts.map(([label,val,_,def])=>`<option value="${val}"${(cur===val||(def&&!cur))?' selected':''}>${label}</option>`).join('')}</select></div>`;
}

function bPadRow(cur) {
  return `<div class="bld-ef"><label>Padding</label><select data-f="pad"><option value="sm"${cur==='sm'?' selected':''}>Compact</option><option value="md"${(!cur||cur==='md')?' selected':''}>Normal</option><option value="lg"${cur==='lg'?' selected':''}>Spacious</option></select></div>`;
}

function bEditorFields(s) {
  const typeLabels=BLK_LABEL;
  let f='';

  const ehs=`<div class="bld-ef"><label>Eyebrow <span style="opacity:.5">(small text above)</span></label><input type="text" data-f="eyebrow" value="${bA(s.eyebrow||'')}" /></div>
     <div class="bld-ef"><label>Heading <span style="opacity:.5">(optional)</span></label><input type="text" data-f="heading" value="${bA(s.heading||'')}" /></div>
     <div class="bld-ef"><label>Subheading <span style="opacity:.5">(optional)</span></label><input type="text" data-f="sub" value="${bA(s.sub||'')}" /></div>`;

  if (s.type==='hero') {
    f=`<div class="bld-ef"><label>Name</label><input type="text" data-f="name" value="${bA(s.name)}" /></div>
       <div class="bld-ef"><label>Eyebrow <span style="opacity:.5">(above name)</span></label><input type="text" data-f="eyebrow" value="${bA(s.eyebrow)}" /></div>
       <div class="bld-ef"><label>Tagline</label><input type="text" data-f="tagline" value="${bA(s.tagline)}" /></div>
       <div class="bld-ef"><label>Background Image <span style="opacity:.5">(optional)</span></label><div style="display:flex;gap:.4rem;"><input type="url" data-f="bg_img" value="${bA(s.bg_img||'')}" style="flex:1;" /><button class="btn btn-sm bld-img-pick" data-target-f="bg_img">Pick</button></div></div>
       <div class="bld-ef"><label>Image Overlay Opacity <span style="opacity:.5">(0–1)</span></label><input type="text" data-f="bg_overlay" value="${bA(s.bg_overlay||'0.45')}" /></div>
       ${bAlignRow(s.align)}
       <div class="bld-ef"><label>Name Size</label><select data-f="name_size"><option value="sm"${s.name_size==='sm'?' selected':''}>Small</option><option value="md"${s.name_size==='md'?' selected':''}>Medium</option><option value="lg"${(!s.name_size||s.name_size==='lg')?' selected':''}>Large</option><option value="xl"${s.name_size==='xl'?' selected':''}>X-Large</option></select></div>
       <div class="bld-ef"><label>Font Weight</label><select data-f="weight"><option value="200"${s.weight==='200'?' selected':''}>Thin</option><option value="300"${(!s.weight||s.weight==='300')?' selected':''}>Light</option><option value="400"${s.weight==='400'?' selected':''}>Regular</option></select></div>
       <div class="bld-ef"><label>Letter Spacing</label><select data-f="ls"><option value="tight"${s.ls==='tight'?' selected':''}>Tight</option><option value="normal"${(!s.ls||s.ls==='normal')?' selected':''}>Normal</option><option value="wide"${s.ls==='wide'?' selected':''}>Wide</option></select></div>
       ${bPadRow(s.pad)}`;
  } else if (s.type==='bio') {
    f=`<div class="bld-ef"><label>Photo <span style="opacity:.5">(optional)</span></label><div style="display:flex;gap:.4rem;"><input type="url" data-f="photo" value="${bA(s.photo||'')}" style="flex:1;" /><button class="btn btn-sm bld-img-pick" data-target-f="photo">Pick</button></div></div>
       <div class="bld-ef"><label>Photo Size</label><input type="text" data-f="photo_size" value="${bA(s.photo_size||'80px')}" placeholder="80px" /></div>
       <div class="bld-ef"><label>Photo Shape</label><select data-f="photo_radius"><option value="circle"${s.photo_radius==='circle'?' selected':''}>Circle</option><option value="none"${(!s.photo_radius||s.photo_radius==='none')?' selected':''}>Square</option><option value="sm"${s.photo_radius==='sm'?' selected':''}>Rounded</option><option value="lg"${s.photo_radius==='lg'?' selected':''}>Round</option></select></div>
       <div class="bld-ef"><label>Heading <span style="opacity:.5">(optional)</span></label><input type="text" data-f="heading" value="${bA(s.heading)}" /></div>
       <div class="bld-ef"><label>Text <span style="opacity:.45">(Markdown)</span></label><textarea data-f="body" rows="6">${bE(s.body)}</textarea></div>
       ${bAlignRow(s.align)}
       <div class="bld-ef"><label>Max Width</label><select data-f="max_w"><option value="narrow"${s.max_w==='narrow'?' selected':''}>Narrow</option><option value="normal"${(!s.max_w||s.max_w==='normal')?' selected':''}>Normal</option><option value="wide"${s.max_w==='wide'?' selected':''}>Wide</option><option value="full"${s.max_w==='full'?' selected':''}>Full</option></select></div>
       <div class="bld-ef"><label>Font Size</label><select data-f="fsize"><option value="sm"${s.fsize==='sm'?' selected':''}>Small</option><option value="md"${(!s.fsize||s.fsize==='md')?' selected':''}>Medium</option><option value="lg"${s.fsize==='lg'?' selected':''}>Large</option></select></div>
       <div class="bld-ef"><label>Line Height</label><select data-f="lh"><option value="compact"${s.lh==='compact'?' selected':''}>Compact</option><option value="normal"${(!s.lh||s.lh==='normal')?' selected':''}>Normal</option><option value="relaxed"${s.lh==='relaxed'?' selected':''}>Relaxed</option></select></div>
       ${bPadRow(s.pad)}`;
  } else if (s.type==='links') {
    const items=s.items||[];
    f=`<div id="bLI">${items.map((it,i)=>`<div class="bld-li-item"><button class="bld-li-rm" data-lrm="${i}">✕</button><div class="bld-ef"><label>Title</label><input type="text" data-li="${i}" data-lf="t" value="${bA(it.t)}" /></div><div class="bld-ef"><label>URL</label><input type="url" data-li="${i}" data-lf="u" value="${bA(it.u)}" /></div><div class="bld-ef"><label>Description</label><input type="text" data-li="${i}" data-lf="d" value="${bA(it.d)}" /></div><div class="bld-ef"><label>Open in new tab</label><select data-li="${i}" data-lf="new_tab"><option value="yes"${it.new_tab!=='no'?' selected':''}>Yes</option><option value="no"${it.new_tab==='no'?' selected':''}>No</option></select></div></div>`).join('')}</div>
      <button class="bld-add-li" id="bAddLi">+ Add link</button>
      <div class="bld-ef"><label>Link Style</label><select data-f="link_style"><option value="card"${(!s.link_style||s.link_style==='card')?' selected':''}>Card</option><option value="minimal"${s.link_style==='minimal'?' selected':''}>Minimal</option><option value="pill"${s.link_style==='pill'?' selected':''}>Pill</option></select></div>
      ${bPadRow(s.pad)}`;
  } else if (s.type==='contact') {
    if (!s.items) {
      s.items=[];
      if (s.email) s.items.push({label:'Email',val:s.email,href:`mailto:${s.email}`});
      if (s.phone) s.items.push({label:'Phone',val:s.phone,href:`tel:${s.phone}`});
      if (!s.items.length) s.items.push({label:'',val:'',href:''});
    }
    f=`<div id="bCTI">${s.items.map((it,i)=>`<div class="bld-li-item"><button class="bld-li-rm" data-ctrm="${i}">✕</button><div class="bld-ef"><label>Label</label><input type="text" data-cti="${i}" data-ctf="label" value="${bA(it.label)}" placeholder="Email" /></div><div class="bld-ef"><label>Value</label><input type="text" data-cti="${i}" data-ctf="val" value="${bA(it.val)}" placeholder="max@example.com" /></div><div class="bld-ef"><label>Subline <span style="opacity:.45">(optional)</span></label><input type="text" data-cti="${i}" data-ctf="sub" value="${bA(it.sub)}" placeholder="e.g. Call Preferred" /></div><div class="bld-ef"><label>Link <span style="opacity:.45">(optional)</span></label><input type="text" data-cti="${i}" data-ctf="href" value="${bA(it.href)}" placeholder="mailto:max@example.com" /></div></div>`).join('')}</div>
      <button class="bld-add-li" id="bAddCti">+ Add row</button>
      ${bAlignRow(s.align)}
      <div class="bld-ef"><label>Style</label><select data-f="cstyle"><option value="normal"${(!s.cstyle||s.cstyle==='normal')?' selected':''}>Normal</option><option value="stacked"${s.cstyle==='stacked'?' selected':''}>Stacked</option><option value="minimal"${s.cstyle==='minimal'?' selected':''}>Minimal</option></select></div>
      ${bPadRow(s.pad)}`;
  } else if (s.type==='social') {
    const items=s.items||[];
    f=`<div id="bSI">${items.map((it,i)=>`<div class="bld-li-item"><button class="bld-li-rm" data-srm="${i}">✕</button><div class="bld-ef"><label>Label</label><input type="text" data-si="${i}" data-sf="label" value="${bA(it.label)}" /></div><div class="bld-ef"><label>URL</label><input type="url" data-si="${i}" data-sf="url" value="${bA(it.url)}" /></div></div>`).join('')}</div>
      <button class="bld-add-li" id="bAddSi">+ Add social</button>
      ${bAlignRow(s.align)}
      <div class="bld-ef"><label>Button Style</label><select data-f="btn_style"><option value="outline"${(!s.btn_style||s.btn_style==='outline')?' selected':''}>Outline</option><option value="solid"${s.btn_style==='solid'?' selected':''}>Solid</option><option value="minimal"${s.btn_style==='minimal'?' selected':''}>Minimal</option><option value="pill"${s.btn_style==='pill'?' selected':''}>Pill</option></select></div>
      ${bPadRow(s.pad)}`;
  } else if (s.type==='cta') {
    f=`<div class="bld-ef"><label>Text above button <span style="opacity:.5">(optional)</span></label><input type="text" data-f="text" value="${bA(s.text)}" /></div>
       <div class="bld-ef"><label>Button label</label><input type="text" data-f="button_label" value="${bA(s.button_label)}" /></div>
       <div class="bld-ef"><label>Button URL</label><input type="url" data-f="button_url" value="${bA(s.button_url)}" /></div>
       ${bAlignRow(s.align)}
       <div class="bld-ef"><label>Button Style</label><select data-f="btn_style"><option value="solid"${(!s.btn_style||s.btn_style==='solid')?' selected':''}>Solid</option><option value="outline"${s.btn_style==='outline'?' selected':''}>Outline</option><option value="ghost"${s.btn_style==='ghost'?' selected':''}>Ghost</option></select></div>
       <div class="bld-ef"><label>Button Size</label><select data-f="btn_size"><option value="sm"${s.btn_size==='sm'?' selected':''}>Small</option><option value="md"${(!s.btn_size||s.btn_size==='md')?' selected':''}>Medium</option><option value="lg"${s.btn_size==='lg'?' selected':''}>Large</option></select></div>
       ${bPadRow(s.pad)}`;
  } else if (s.type==='quote') {
    f=`<div class="bld-ef"><label>Quote</label><textarea data-f="quote" rows="4">${bE(s.quote)}</textarea></div>
       <div class="bld-ef"><label>Attribution</label><input type="text" data-f="attribution" value="${bA(s.attribution)}" /></div>
       <div class="bld-ef"><label>Style</label><select data-f="variant"><option value="border"${(!s.variant||s.variant==='border')?' selected':''}>Border left</option><option value="centered"${s.variant==='centered'?' selected':''}>Centered</option><option value="minimal"${s.variant==='minimal'?' selected':''}>Minimal</option></select></div>
       ${bPadRow(s.pad)}`;
  } else if (s.type==='heading') {
    f=`<div class="bld-ef"><label>Text</label><input type="text" data-f="text" value="${bA(s.text)}" /></div>
       <div class="bld-ef"><label>Size</label><select data-f="size"><option value="sm"${s.size==='sm'?' selected':''}>Small</option><option value="md"${(!s.size||s.size==='md')?' selected':''}>Medium</option><option value="xl"${s.size==='xl'?' selected':''}>Large</option></select></div>
       ${bAlignRow(s.align)}
       <div class="bld-ef"><label>Font Weight</label><select data-f="weight"><option value="100"${s.weight==='100'?' selected':''}>Hairline</option><option value="200"${s.weight==='200'?' selected':''}>Thin</option><option value="300"${(!s.weight||s.weight==='300')?' selected':''}>Light</option><option value="400"${s.weight==='400'?' selected':''}>Regular</option></select></div>
       <div class="bld-ef"><label>Letter Spacing</label><select data-f="ls"><option value="tight"${s.ls==='tight'?' selected':''}>Tight</option><option value="normal"${(!s.ls||s.ls==='normal')?' selected':''}>Normal</option><option value="wide"${s.ls==='wide'?' selected':''}>Wide</option><option value="ultra"${s.ls==='ultra'?' selected':''}>Ultra wide</option></select></div>
       ${bPadRow(s.pad)}`;
  } else if (s.type==='text') {
    f=`<div class="bld-ef"><label>Text <span style="opacity:.45">(Markdown)</span></label><textarea data-f="text" rows="7">${bE(s.text)}</textarea></div>
       ${bAlignRow(s.align)}
       <div class="bld-ef"><label>Font Size</label><select data-f="fsize"><option value="sm"${s.fsize==='sm'?' selected':''}>Small</option><option value="md"${(!s.fsize||s.fsize==='md')?' selected':''}>Medium</option><option value="lg"${s.fsize==='lg'?' selected':''}>Large</option></select></div>
       <div class="bld-ef"><label>Line Height</label><select data-f="lh"><option value="compact"${s.lh==='compact'?' selected':''}>Compact</option><option value="normal"${(!s.lh||s.lh==='normal')?' selected':''}>Normal</option><option value="relaxed"${s.lh==='relaxed'?' selected':''}>Relaxed</option></select></div>
       <div class="bld-ef"><label>Max Width</label><select data-f="max_w"><option value="narrow"${s.max_w==='narrow'?' selected':''}>Narrow</option><option value="normal"${(!s.max_w||s.max_w==='normal')?' selected':''}>Normal</option><option value="wide"${s.max_w==='wide'?' selected':''}>Wide</option><option value="full"${s.max_w==='full'?' selected':''}>Full</option></select></div>
       ${bPadRow(s.pad)}`;
  } else if (s.type==='image') {
    f=`<div class="bld-ef"><label>Image</label><div style="display:flex;gap:.4rem;"><input type="url" data-f="url" value="${bA(s.url)}" style="flex:1;" /><button class="btn btn-sm bld-img-pick" data-target-f="url">Pick</button></div></div>
       <div class="bld-ef"><label>Caption <span style="opacity:.5">(optional)</span></label><input type="text" data-f="caption" value="${bA(s.caption)}" /></div>
       <div class="bld-ef"><label>Size</label><select data-f="size"><option value="sm"${s.size==='sm'?' selected':''}>Small</option><option value="md"${s.size==='md'?' selected':''}>Medium</option><option value="full"${(!s.size||s.size==='full')?' selected':''}>Full width</option></select></div>
       ${bAlignRow(s.align)}
       <div class="bld-ef"><label>Border Radius</label><select data-f="radius"><option value="none"${(!s.radius||s.radius==='none')?' selected':''}>None</option><option value="sm"${s.radius==='sm'?' selected':''}>Small</option><option value="lg"${s.radius==='lg'?' selected':''}>Large</option><option value="circle"${s.radius==='circle'?' selected':''}>Circle</option></select></div>
       ${bPadRow(s.pad)}`;
  } else if (s.type==='stats') {
    const items=s.items||[];
    f=`<div id="bSTI">${items.map((it,i)=>`<div class="bld-li-item"><button class="bld-li-rm" data-strm="${i}">✕</button><div class="bld-ef"><label>Number / value</label><input type="text" data-sti="${i}" data-stf="number" value="${bA(it.number)}" /></div><div class="bld-ef"><label>Label</label><input type="text" data-sti="${i}" data-stf="label" value="${bA(it.label)}" /></div></div>`).join('')}</div>
      <button class="bld-add-li" id="bAddSti">+ Add stat</button>
      <div class="bld-ef"><label>Columns</label><select data-f="cols"><option value="auto"${(!s.cols||s.cols==='auto')?' selected':''}>Auto</option><option value="2"${s.cols==='2'?' selected':''}>2 columns</option><option value="3"${s.cols==='3'?' selected':''}>3 columns</option><option value="4"${s.cols==='4'?' selected':''}>4 columns</option></select></div>
      ${bPadRow(s.pad)}`;
  } else if (s.type==='divider') {
    f=`<div class="bld-ef"><label>Style</label><select data-f="style"><option value="fade"${s.style==='fade'?' selected':''}>Fade</option><option value="full"${s.style==='full'?' selected':''}>Full line</option><option value="short"${s.style==='short'?' selected':''}>Short</option></select></div>
       <div class="bld-ef"><label>Spacing</label><select data-f="spacing"><option value="sm"${s.spacing==='sm'?' selected':''}>Compact</option><option value="md"${(!s.spacing||s.spacing==='md')?' selected':''}>Normal</option><option value="lg"${s.spacing==='lg'?' selected':''}>Spacious</option></select></div>`;
  } else if (s.type==='spacer') {
    f=`<div class="bld-ef"><label>Height</label><select data-f="size"><option value="sm"${s.size==='sm'?' selected':''}>Small</option><option value="md"${(!s.size||s.size==='md')?' selected':''}>Medium</option><option value="lg"${s.size==='lg'?' selected':''}>Large</option><option value="xl"${s.size==='xl'?' selected':''}>X-Large</option></select></div>`;
  } else if (s.type==='collection') {
    const items=s.items||[];
    f=`<div class="bld-ef"><label>Heading</label><input type="text" data-f="heading" value="${bA(s.heading||'')}" /></div>
       <div class="bld-ef"><label>Show count line</label><select data-f="show_count"><option value="yes"${s.show_count!=='no'?' selected':''}>Yes</option><option value="no"${s.show_count==='no'?' selected':''}>No</option></select></div>
       <div id="bCOLI">${items.map((it,i)=>`<div class="bld-li-item"><button class="bld-li-rm" data-crm="${i}">✕</button>
      ${(()=>{const imgs=(it.imgs&&it.imgs.length)?it.imgs:(it.img?[it.img]:['']);return `<div class="bld-ef"><label>Images</label>${imgs.map((u,j)=>`<div style="display:flex;gap:.4rem;margin-bottom:.3rem;"><input type="url" data-cii="${i}" data-ciij="${j}" value="${bA(u||'')}" style="flex:1;" placeholder="Image URL" /><button class="btn btn-sm bld-img-pick" data-target-cii="${i}" data-target-ciij="${j}">Pick</button><button class="btn btn-sm bld-cimg-rm" data-cii="${i}" data-ciij="${j}" title="Remove image">✕</button></div>`).join('')}<button class="btn btn-sm bld-cimg-add" data-cii="${i}">+ image</button></div>`;})()}
      <div class="bld-ef"><label>Name</label><input type="text" data-ci="${i}" data-cf="name" value="${bA(it.name||'')}" /></div>
      <div class="bld-ef"><label>Note <span style="opacity:.5">(optional)</span></label><textarea data-ci="${i}" data-cf="note" rows="2">${bE(it.note||'')}</textarea></div>
      <div class="bld-ef"><label>For sale</label><select data-ci="${i}" data-cf="for_sale"><option value="no"${it.for_sale!=='yes'?' selected':''}>No</option><option value="yes"${it.for_sale==='yes'?' selected':''}>Yes</option></select></div>
      <div class="bld-ef"><label>Price <span style="opacity:.5">(if for sale)</span></label><input type="text" data-ci="${i}" data-cf="price" value="${bA(it.price||'')}" placeholder="$200" /></div>
    </div>`).join('')}</div>
    <button class="bld-add-li" id="bAddColl">+ Add item</button>
    <div class="bld-ef"><label>Layout</label><select data-f="layout"><option value="grid-2"${s.layout==='grid-2'?' selected':''}>2 columns</option><option value="grid-3"${(!s.layout||s.layout==='grid-3')?' selected':''}>3 columns</option><option value="grid-4"${s.layout==='grid-4'?' selected':''}>4 columns</option></select></div>
    ${bPadRow(s.pad)}`;
  } else if (s.type==='cards') {
    const items=s.items||[];
    f=`<div id="bCI">${items.map((it,i)=>`<div class="bld-li-item"><button class="bld-li-rm" data-crm="${i}">✕</button>
      <div class="bld-ef"><label>Image</label><div style="display:flex;gap:.4rem;"><input type="url" data-ci="${i}" data-cf="img" value="${bA(it.img||'')}" style="flex:1;" /><button class="btn btn-sm bld-img-pick" data-target-ci="${i}" data-target-cf="img">Pick</button></div></div>
      <div class="bld-ef"><label>Title</label><input type="text" data-ci="${i}" data-cf="title" value="${bA(it.title||'')}" /></div>
      <div class="bld-ef"><label>Body</label><textarea data-ci="${i}" data-cf="body" rows="2">${bE(it.body||'')}</textarea></div>
      <div class="bld-ef"><label>Link URL <span style="opacity:.5">(optional)</span></label><input type="url" data-ci="${i}" data-cf="url" value="${bA(it.url||'')}" /></div>
      <div class="bld-ef"><label>Open in new tab</label><select data-ci="${i}" data-cf="new_tab"><option value="yes"${it.new_tab!=='no'?' selected':''}>Yes</option><option value="no"${it.new_tab==='no'?' selected':''}>No</option></select></div>
    </div>`).join('')}</div>
    <button class="bld-add-li" id="bAddCi">+ Add card</button>
    <div class="bld-ef"><label>Layout</label><select data-f="layout"><option value="grid-2"${(!s.layout||s.layout==='grid-2')?' selected':''}>2 columns</option><option value="grid-3"${s.layout==='grid-3'?' selected':''}>3 columns</option><option value="grid-4"${s.layout==='grid-4'?' selected':''}>4 columns</option><option value="feature"${s.layout==='feature'?' selected':''}>Feature (large + small)</option><option value="horizontal"${s.layout==='horizontal'?' selected':''}>Horizontal rows</option><option value="list"${s.layout==='list'?' selected':''}>Compact list</option></select></div>
    <div class="bld-ef"><label>Image Radius</label><select data-f="radius"><option value="none"${(!s.radius||s.radius==='none')?' selected':''}>None</option><option value="sm"${s.radius==='sm'?' selected':''}>Small</option><option value="lg"${s.radius==='lg'?' selected':''}>Large</option></select></div>
    ${bPadRow(s.pad)}`;
  } else if (s.type==='gallery') {
    const items=s.items||[];
    f=`<div id="bGALI">${items.map((it,i)=>`<div class="bld-li-item"><button class="bld-li-rm" data-galrm="${i}">✕</button>
      <div class="bld-ef"><label>Image</label><div style="display:flex;gap:.4rem;"><input type="url" data-gi="${i}" data-gf="img" value="${bA(it.img||'')}" style="flex:1;" /><button class="btn btn-sm bld-img-pick" data-target-gi="${i}" data-target-gf="img">Pick</button></div></div>
      <div class="bld-ef"><label>Link URL <span style="opacity:.5">(optional)</span></label><input type="url" data-gi="${i}" data-gf="url" value="${bA(it.url||'')}" /></div>
      <div class="bld-ef"><label>Caption</label><input type="text" data-gi="${i}" data-gf="caption" value="${bA(it.caption||'')}" /></div>
    </div>`).join('')}</div>
    <button class="bld-add-li" id="bAddGal">+ Add image</button>
    <div class="bld-ef"><label>Columns</label><select data-f="cols"><option value="2"${s.cols==='2'?' selected':''}>2</option><option value="3"${(!s.cols||s.cols==='3')?' selected':''}>3</option><option value="4"${s.cols==='4'?' selected':''}>4</option></select></div>
    <div class="bld-ef"><label>Image Height</label><select data-f="height"><option value="sm"${s.height==='sm'?' selected':''}>Small</option><option value="md"${(!s.height||s.height==='md')?' selected':''}>Medium</option><option value="lg"${s.height==='lg'?' selected':''}>Large</option></select></div>
    <div class="bld-ef"><label>Gap</label><select data-f="gap"><option value="none"${s.gap==='none'?' selected':''}>None</option><option value="sm"${(!s.gap||s.gap==='sm')?' selected':''}>Small</option><option value="lg"${s.gap==='lg'?' selected':''}>Large</option></select></div>
    <div class="bld-ef"><label>Border Radius</label><select data-f="radius"><option value="none"${(!s.radius||s.radius==='none')?' selected':''}>None</option><option value="sm"${s.radius==='sm'?' selected':''}>Small</option><option value="lg"${s.radius==='lg'?' selected':''}>Large</option></select></div>
    ${bPadRow(s.pad)}`;
  } else if (s.type==='imgtext') {
    f=`<div class="bld-ef"><label>Image</label><div style="display:flex;gap:.4rem;"><input type="url" data-f="img" value="${bA(s.img||'')}" style="flex:1;" /><button class="btn btn-sm bld-img-pick" data-target-f="img">Pick</button></div></div>
       <div class="bld-ef"><label>Image Side</label><select data-f="reverse"><option value="no"${(!s.reverse||s.reverse==='no')?' selected':''}>Left</option><option value="yes"${s.reverse==='yes'?' selected':''}>Right</option></select></div>
       <div class="bld-ef"><label>Image Width</label><select data-f="img_w"><option value="sm"${s.img_w==='sm'?' selected':''}>Narrow</option><option value="md"${(!s.img_w||s.img_w==='md')?' selected':''}>Medium</option><option value="lg"${s.img_w==='lg'?' selected':''}>Wide</option></select></div>
       <div class="bld-ef"><label>Image Height</label><select data-f="img_h"><option value="sm"${s.img_h==='sm'?' selected':''}>Short</option><option value="md"${(!s.img_h||s.img_h==='md')?' selected':''}>Medium</option><option value="lg"${s.img_h==='lg'?' selected':''}>Tall</option></select></div>
       <div class="bld-ef"><label>Image Radius</label><select data-f="radius"><option value="none"${(!s.radius||s.radius==='none')?' selected':''}>None</option><option value="sm"${s.radius==='sm'?' selected':''}>Small</option><option value="lg"${s.radius==='lg'?' selected':''}>Large</option><option value="circle"${s.radius==='circle'?' selected':''}>Circle</option></select></div>
       <div class="bld-ef"><label>Eyebrow <span style="opacity:.5">(optional)</span></label><input type="text" data-f="eyebrow" value="${bA(s.eyebrow||'')}" /></div>
       <div class="bld-ef"><label>Heading</label><input type="text" data-f="heading" value="${bA(s.heading||'')}" /></div>
       <div class="bld-ef"><label>Body</label><textarea data-f="body" rows="5">${bE(s.body||'')}</textarea></div>
       <div class="bld-ef"><label>Button Label <span style="opacity:.5">(optional)</span></label><input type="text" data-f="btn_label" value="${bA(s.btn_label||'')}" /></div>
       <div class="bld-ef"><label>Button URL</label><input type="url" data-f="btn_url" value="${bA(s.btn_url||'')}" /></div>
       ${bPadRow(s.pad)}`;
  } else if (s.type==='link') {
    f=`<div class="bld-ef"><label>Label</label><input type="text" data-f="label" value="${bA(s.label||'Visit →')}" /></div>
       <div class="bld-ef"><label>URL</label><input type="url" data-f="url" value="${bA(s.url)}" /></div>
       ${bAlignRow(s.align)}
       <div class="bld-ef"><label>Style</label><select data-f="style"><option value="pill"${(!s.style||s.style==='pill')?' selected':''}>Pill</option><option value="solid"${s.style==='solid'?' selected':''}>Solid</option><option value="ghost"${s.style==='ghost'?' selected':''}>Ghost</option><option value="underline"${s.style==='underline'?' selected':''}>Underline</option><option value="badge"${s.style==='badge'?' selected':''}>Badge</option></select></div>
       <div class="bld-ef"><label>Size</label><select data-f="size"><option value="sm"${s.size==='sm'?' selected':''}>Small</option><option value="md"${(!s.size||s.size==='md')?' selected':''}>Medium</option><option value="lg"${s.size==='lg'?' selected':''}>Large</option></select></div>
       <div class="bld-ef"><label>Open in new tab</label><select data-f="new_tab"><option value="yes"${s.new_tab!=='no'?' selected':''}>Yes</option><option value="no"${s.new_tab==='no'?' selected':''}>No</option></select></div>
       ${bPadRow(s.pad)}`;
  } else if (s.type==='group') {
    const children=s.sections||[];
    const tOpts=Object.entries(typeLabels).filter(([t])=>t!=='group').map(([t,l])=>`<option value="${t}">${l}</option>`).join('');
    f=`<div class="bld-ef"><label>Label</label><input type="text" data-f="label" value="${bA(s.label||'Group')}" /></div>
    <div class="bld-ef"><label>Default State</label><select data-f="default_open"><option value="yes"${s.default_open!=='no'?' selected':''}>Open</option><option value="no"${s.default_open==='no'?' selected':''}>Closed</option></select></div>
    <div class="bld-sep"></div>
    <div style="font-size:.52rem;letter-spacing:.3em;text-transform:uppercase;color:rgba(77,189,106,.35);margin:.6rem 0 .4rem;">Sections inside (${children.length})</div>
    <div id="bGrpList">${children.map((c,i)=>`<div class="bld-li-item" style="display:flex;align-items:center;justify-content:space-between;gap:.4rem;">
      <span style="font-size:.72rem;font-weight:200;color:var(--white);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${typeLabels[c.type]||c.type}${c.name||c.label||c.heading||c.text?` — <span style="opacity:.55">${bE((c.name||c.label||c.heading||c.text||'').slice(0,22))}</span>`:''}</span>
      <button class="btn btn-xs" data-grpedit="${i}">Edit</button>
      <button class="bld-li-rm" data-grprm="${i}" style="position:static;margin:0;">✕</button>
    </div>`).join('')}</div>
    <div style="display:flex;gap:.4rem;margin-top:.5rem;">
      <select id="bGrpAddType" style="flex:1;background:var(--panel);border:1px solid var(--border);color:var(--white);font-size:.72rem;padding:.3rem .45rem;outline:none;">${tOpts}</select>
      <button class="btn btn-xs" id="bGrpAddSec">+ Add</button>
    </div>`;
  } else if (s.type==='accordion') {
    const items=s.items||[];
    f=`<div id="bACRI">${items.map((it,i)=>`<div class="bld-li-item"><button class="bld-li-rm" data-acrrm="${i}">✕</button>
      <div class="bld-ef"><label>Question</label><input type="text" data-acri="${i}" data-acrf="q" value="${bA(it.q||'')}" /></div>
      <div class="bld-ef"><label>Answer <span style="opacity:.45">(Markdown)</span></label><textarea data-acri="${i}" data-acrf="a" rows="3">${bE(it.a||'')}</textarea></div>
    </div>`).join('')}</div>
    <button class="bld-add-li" id="bAddAcr">+ Add item</button>
    <div class="bld-ef"><label>Style</label><select data-f="style"><option value="minimal"${(!s.style||s.style==='minimal')?' selected':''}>Minimal</option><option value="bordered"${s.style==='bordered'?' selected':''}>Bordered cards</option></select></div>
    ${bPadRow(s.pad)}`;
  } else if (s.type==='carousel') {
    const items=s.items||[];
    f=`<div id="bCRI">${items.map((it,i)=>`<div class="bld-li-item"><button class="bld-li-rm" data-crrm="${i}">✕</button>
      <div class="bld-ef"><label>Image</label><div style="display:flex;gap:.4rem;"><input type="url" data-cri="${i}" data-crf="img" value="${bA(it.img||'')}" style="flex:1;" /><button class="btn btn-sm bld-img-pick" data-target-cri="${i}" data-target-crf="img">Pick</button></div></div>
      <div class="bld-ef"><label>Caption</label><input type="text" data-cri="${i}" data-crf="caption" value="${bA(it.caption||'')}" /></div>
    </div>`).join('')}</div>
    <button class="bld-add-li" id="bAddCr">+ Add slide</button>
    <div class="bld-ef"><label>Height</label><select data-f="height"><option value="sm"${s.height==='sm'?' selected':''}>Short</option><option value="md"${(!s.height||s.height==='md')?' selected':''}>Medium</option><option value="lg"${s.height==='lg'?' selected':''}>Tall</option></select></div>
    <div class="bld-ef"><label>Border Radius</label><select data-f="radius"><option value="none"${(!s.radius||s.radius==='none')?' selected':''}>None</option><option value="sm"${s.radius==='sm'?' selected':''}>Small</option><option value="lg"${s.radius==='lg'?' selected':''}>Large</option></select></div>
    ${bPadRow(s.pad)}`;
  } else if (s.type==='fileprev') {
    f=`<div class="bld-ef"><label>File URL</label><div style="display:flex;gap:.4rem;"><input type="text" data-f="url" value="${bA(s.url)}" placeholder="/api/files/1" style="flex:1;" /><button class="btn btn-xs" id="bFilePrevPick">Browse</button></div></div>
    <div class="bld-ef"><label>Height</label><select data-f="height"><option value="sm"${s.height==='sm'?' selected':''}>Short (300px)</option><option value="md"${(!s.height||s.height==='md')?' selected':''}>Medium (520px)</option><option value="lg"${s.height==='lg'?' selected':''}>Tall (720px)</option><option value="xl"${s.height==='xl'?' selected':''}>Full (90vh)</option></select></div>
    ${bPadRow(s.pad)}`;
  } else if (s.type==='filedown') {
    f=`<div class="bld-ef"><label>File URL</label><div style="display:flex;gap:.4rem;"><input type="text" data-f="url" value="${bA(s.url)}" placeholder="/api/files/1" style="flex:1;" /><button class="btn btn-xs" id="bFileDownPick">Browse</button></div></div>
    <div class="bld-ef"><label>Button label</label><input type="text" data-f="label" value="${bA(s.label||'Download')}" /></div>
    <div class="bld-ef"><label>File name <span style="opacity:.45">(shown below button, optional)</span></label><input type="text" data-f="filename" value="${bA(s.filename)}" placeholder="document.pdf" /></div>
    ${bAlignRow(s.align)}
    <div class="bld-ef"><label>Button Style</label><select data-f="btn_style"><option value="solid"${(!s.btn_style||s.btn_style==='solid')?' selected':''}>Solid</option><option value="outline"${s.btn_style==='outline'?' selected':''}>Outline</option><option value="ghost"${s.btn_style==='ghost'?' selected':''}>Ghost</option></select></div>
    ${bPadRow(s.pad)}`;
  } else if (s.type==='tutorials') {
    f=`<div class="bld-ef"><label>Heading <span style="opacity:.45">(optional)</span></label><input type="text" data-f="heading" value="${bA(s.heading||'')}" placeholder="My Tutorials" /></div>
    <div class="bld-ef"><label>Heading Alignment</label><div class="bld-align-row">
      <button class="bld-ab${(!s.heading_align||s.heading_align==='left')?' act':''}" data-align-f="heading_align" data-align="left">Left</button>
      <button class="bld-ab${s.heading_align==='center'?' act':''}" data-align-f="heading_align" data-align="center">Center</button>
      <button class="bld-ab${s.heading_align==='right'?' act':''}" data-align-f="heading_align" data-align="right">Right</button>
    </div></div>
    <div class="bld-ef"><label>Style</label><select data-f="tut_style">
      <option value="cards"${(!s.tut_style||s.tut_style==='cards')?' selected':''}>Cards</option>
      <option value="list"${s.tut_style==='list'?' selected':''}>List</option>
    </select></div>
    <div class="bld-ef"><label>Max items <span style="opacity:.45">(0 = all)</span></label><input type="number" data-f="max_items" value="${bA(s.max_items||'0')}" min="0" step="1" /></div>
    <div class="bld-ef"><label>"View all" link <span style="opacity:.45">(→ /tutorials/all)</span></label><select data-f="view_all_show">
      <option value="yes"${s.view_all_show!==false&&s.view_all_show!=='no'?' selected':''}>Show</option>
      <option value="no"${s.view_all_show===false||s.view_all_show==='no'?' selected':''}>Hide</option>
    </select></div>
    <div class="bld-ef"><label>View All Label</label><input type="text" data-f="view_all_label" value="${bA(s.view_all_label||'View all →')}" /></div>
    ${bPadRow(s.pad)}`;
  } else if (s.type==='reviews') {
    f=`<div class="bld-ef"><label>Heading <span style="opacity:.45">(optional)</span></label><input type="text" data-f="heading" value="${bA(s.heading||'')}" placeholder="Reviews" /></div>
    <div class="bld-ef"><label>Heading Alignment</label><div class="bld-align-row">
      <button class="bld-ab${(!s.heading_align||s.heading_align==='left')?' act':''}" data-align-f="heading_align" data-align="left">Left</button>
      <button class="bld-ab${s.heading_align==='center'?' act':''}" data-align-f="heading_align" data-align="center">Center</button>
      <button class="bld-ab${s.heading_align==='right'?' act':''}" data-align-f="heading_align" data-align="right">Right</button>
    </div></div>
    <div class="bld-ef"><label>Style</label><select data-f="rev_style">
      <option value="cards"${(!s.rev_style||s.rev_style==='cards')?' selected':''}>Cards</option>
      <option value="list"${s.rev_style==='list'?' selected':''}>List</option>
    </select></div>
    <div class="bld-ef"><label>Max items <span style="opacity:.45">(0 = all)</span></label><input type="number" data-f="max_items" value="${bA(s.max_items||'0')}" min="0" step="1" /></div>
    <div class="bld-ef"><label>"View all" link <span style="opacity:.45">(→ /reviews/all)</span></label><select data-f="view_all_show">
      <option value="yes"${s.view_all_show!==false&&s.view_all_show!=='no'?' selected':''}>Show</option>
      <option value="no"${s.view_all_show===false||s.view_all_show==='no'?' selected':''}>Hide</option>
    </select></div>
    <div class="bld-ef"><label>View All Label</label><input type="text" data-f="view_all_label" value="${bA(s.view_all_label||'View all →')}" /></div>
    ${bPadRow(s.pad)}`;
  } else if (s.type==='banner') {
    f=`<div class="bld-ef"><label>Eyebrow <span style="opacity:.5">(small text above)</span></label><input type="text" data-f="eyebrow" value="${bA(s.eyebrow||'')}" /></div>
       <div class="bld-ef"><label>Headline</label><input type="text" data-f="heading" value="${bA(s.heading||'')}" /></div>
       <div class="bld-ef"><label>Subheading</label><textarea data-f="subheading" rows="2">${bE(s.subheading||'')}</textarea></div>
       <div class="bld-ef"><label>Button label</label><input type="text" data-f="btn_label" value="${bA(s.btn_label||'')}" /></div>
       <div class="bld-ef"><label>Button URL</label><input type="url" data-f="btn_url" value="${bA(s.btn_url||'')}" /></div>
       <div class="bld-ef"><label>2nd button label <span style="opacity:.5">(optional)</span></label><input type="text" data-f="btn2_label" value="${bA(s.btn2_label||'')}" /></div>
       <div class="bld-ef"><label>2nd button URL</label><input type="url" data-f="btn2_url" value="${bA(s.btn2_url||'')}" /></div>
       <div class="bld-ef"><label>Background Image <span style="opacity:.5">(optional)</span></label><div style="display:flex;gap:.4rem;"><input type="url" data-f="bg_img" value="${bA(s.bg_img||'')}" style="flex:1;" /><button class="btn btn-sm bld-img-pick" data-target-f="bg_img">Pick</button></div></div>
       <div class="bld-ef"><label>Overlay darkness <span style="opacity:.5">(0–1)</span></label><input type="text" data-f="overlay" value="${bA(s.overlay||'0.5')}" /></div>
       <div class="bld-ef"><label>Height</label><select data-f="min_h"><option value="sm"${s.min_h==='sm'?' selected':''}>Short</option><option value="md"${(!s.min_h||s.min_h==='md')?' selected':''}>Medium</option><option value="lg"${s.min_h==='lg'?' selected':''}>Tall</option><option value="full"${s.min_h==='full'?' selected':''}>Full screen</option></select></div>
       ${bAlignRow(s.align)}
       ${bPadRow(s.pad)}`;
  } else if (s.type==='features') {
    const items=s.items||[];
    f=`${ehs}
       <div id="bFEAT">${items.map((it,i)=>`<div class="bld-li-item"><button class="bld-li-rm" data-crm="${i}">✕</button>
       <div class="bld-ef"><label>Icon / emoji</label><input type="text" data-ci="${i}" data-cf="icon" value="${bA(it.icon||'')}" placeholder="✦ or 🚀" /></div>
       <div class="bld-ef"><label>Title</label><input type="text" data-ci="${i}" data-cf="title" value="${bA(it.title||'')}" /></div>
       <div class="bld-ef"><label>Text</label><textarea data-ci="${i}" data-cf="text" rows="2">${bE(it.text||'')}</textarea></div>
     </div>`).join('')}</div>
       <button class="bld-add-li bld-add-item" data-shape='{"icon":"✦","title":"Feature","text":""}'>+ Add feature</button>
       <div class="bld-ef"><label>Columns</label><select data-f="cols"><option value="2"${s.cols==='2'?' selected':''}>2</option><option value="3"${(!s.cols||s.cols==='3')?' selected':''}>3</option><option value="4"${s.cols==='4'?' selected':''}>4</option></select></div>
       <div class="bld-ef"><label>Card text align</label><select data-f="card_align"><option value="left"${(!s.card_align||s.card_align==='left')?' selected':''}>Left</option><option value="center"${s.card_align==='center'?' selected':''}>Center</option></select></div>
       ${bPadRow(s.pad)}`;
  } else if (s.type==='steps') {
    const items=s.items||[];
    f=`${ehs}
       <div id="bSTEP">${items.map((it,i)=>`<div class="bld-li-item"><button class="bld-li-rm" data-crm="${i}">✕</button>
       <div class="bld-ef"><label>Title</label><input type="text" data-ci="${i}" data-cf="title" value="${bA(it.title||'')}" /></div>
       <div class="bld-ef"><label>Text</label><textarea data-ci="${i}" data-cf="text" rows="2">${bE(it.text||'')}</textarea></div>
     </div>`).join('')}</div>
       <button class="bld-add-li bld-add-item" data-shape='{"title":"Step","text":""}'>+ Add step</button>
       <div class="bld-ef"><label>Layout</label><select data-f="layout"><option value="stack"${(!s.layout||s.layout==='stack')?' selected':''}>Stacked</option><option value="row"${s.layout==='row'?' selected':''}>Row</option></select></div>
       ${bPadRow(s.pad)}`;
  } else if (s.type==='pricing') {
    const items=s.items||[];
    f=`${ehs}
       <div id="bPRICE">${items.map((it,i)=>`<div class="bld-li-item"><button class="bld-li-rm" data-crm="${i}">✕</button>
       <div class="bld-ef"><label>Plan name</label><input type="text" data-ci="${i}" data-cf="name" value="${bA(it.name||'')}" /></div>
       <div class="bld-ef"><label>Price</label><input type="text" data-ci="${i}" data-cf="price" value="${bA(it.price||'')}" placeholder="$29" /></div>
       <div class="bld-ef"><label>Period <span style="opacity:.5">(optional)</span></label><input type="text" data-ci="${i}" data-cf="period" value="${bA(it.period||'')}" placeholder="/mo" /></div>
       <div class="bld-ef"><label>Features <span style="opacity:.5">(one per line)</span></label><textarea data-ci="${i}" data-cf="features" rows="4">${bE(it.features||'')}</textarea></div>
       <div class="bld-ef"><label>Button label</label><input type="text" data-ci="${i}" data-cf="btn_label" value="${bA(it.btn_label||'')}" /></div>
       <div class="bld-ef"><label>Button URL</label><input type="url" data-ci="${i}" data-cf="btn_url" value="${bA(it.btn_url||'')}" /></div>
       <div class="bld-ef"><label>Highlight this plan</label><select data-ci="${i}" data-cf="featured"><option value="no"${it.featured!=='yes'?' selected':''}>No</option><option value="yes"${it.featured==='yes'?' selected':''}>Yes</option></select></div>
       <div class="bld-ef"><label>Badge <span style="opacity:.5">(if highlighted)</span></label><input type="text" data-ci="${i}" data-cf="badge" value="${bA(it.badge||'')}" placeholder="Popular" /></div>
     </div>`).join('')}</div>
       <button class="bld-add-li bld-add-item" data-shape='{"name":"Plan","price":"$0","period":"/mo","features":"","btn_label":"Choose","btn_url":"","featured":"no"}'>+ Add plan</button>
       ${bPadRow(s.pad)}`;
  } else if (s.type==='testimonials') {
    const items=s.items||[];
    f=`${ehs}
       <div id="bTEST">${items.map((it,i)=>`<div class="bld-li-item"><button class="bld-li-rm" data-crm="${i}">✕</button>
       <div class="bld-ef"><label>Quote</label><textarea data-ci="${i}" data-cf="quote" rows="3">${bE(it.quote||'')}</textarea></div>
       <div class="bld-ef"><label>Name</label><input type="text" data-ci="${i}" data-cf="name" value="${bA(it.name||'')}" /></div>
       <div class="bld-ef"><label>Role / company <span style="opacity:.5">(optional)</span></label><input type="text" data-ci="${i}" data-cf="role" value="${bA(it.role||'')}" /></div>
       <div class="bld-ef"><label>Avatar <span style="opacity:.5">(optional)</span></label><div style="display:flex;gap:.4rem;"><input type="url" data-ci="${i}" data-cf="avatar" value="${bA(it.avatar||'')}" style="flex:1;" /><button class="btn btn-sm bld-img-pick" data-target-ci="${i}" data-target-cf="avatar">Pick</button></div></div>
     </div>`).join('')}</div>
       <button class="bld-add-li bld-add-item" data-shape='{"quote":"","name":"","role":"","avatar":""}'>+ Add testimonial</button>
       ${bPadRow(s.pad)}`;
  } else if (s.type==='team') {
    const items=s.items||[];
    f=`${ehs}
       <div id="bTEAM">${items.map((it,i)=>`<div class="bld-li-item"><button class="bld-li-rm" data-crm="${i}">✕</button>
       <div class="bld-ef"><label>Photo</label><div style="display:flex;gap:.4rem;"><input type="url" data-ci="${i}" data-cf="photo" value="${bA(it.photo||'')}" style="flex:1;" /><button class="btn btn-sm bld-img-pick" data-target-ci="${i}" data-target-cf="photo">Pick</button></div></div>
       <div class="bld-ef"><label>Name</label><input type="text" data-ci="${i}" data-cf="name" value="${bA(it.name||'')}" /></div>
       <div class="bld-ef"><label>Role</label><input type="text" data-ci="${i}" data-cf="role" value="${bA(it.role||'')}" /></div>
       <div class="bld-ef"><label>Link <span style="opacity:.5">(optional)</span></label><input type="url" data-ci="${i}" data-cf="url" value="${bA(it.url||'')}" /></div>
     </div>`).join('')}</div>
       <button class="bld-add-li bld-add-item" data-shape='{"photo":"","name":"","role":"","url":""}'>+ Add member</button>
       <div class="bld-ef"><label>Columns</label><select data-f="cols"><option value="2"${s.cols==='2'?' selected':''}>2</option><option value="3"${(!s.cols||s.cols==='3')?' selected':''}>3</option><option value="4"${s.cols==='4'?' selected':''}>4</option></select></div>
       <div class="bld-ef"><label>Card text align</label><select data-f="card_align"><option value="left"${(!s.card_align||s.card_align==='left')?' selected':''}>Left</option><option value="center"${s.card_align==='center'?' selected':''}>Center</option></select></div>
       ${bPadRow(s.pad)}`;
  } else if (s.type==='logos') {
    const items=s.items||[];
    f=`<div class="bld-ef"><label>Heading <span style="opacity:.5">(optional)</span></label><input type="text" data-f="heading" value="${bA(s.heading||'')}" /></div>
       <div id="bLOGO">${items.map((it,i)=>`<div class="bld-li-item"><button class="bld-li-rm" data-crm="${i}">✕</button>
       <div class="bld-ef"><label>Logo image</label><div style="display:flex;gap:.4rem;"><input type="url" data-ci="${i}" data-cf="img" value="${bA(it.img||'')}" style="flex:1;" /><button class="btn btn-sm bld-img-pick" data-target-ci="${i}" data-target-cf="img">Pick</button></div></div>
       <div class="bld-ef"><label>Label <span style="opacity:.5">(alt / fallback)</span></label><input type="text" data-ci="${i}" data-cf="label" value="${bA(it.label||'')}" /></div>
       <div class="bld-ef"><label>Link <span style="opacity:.5">(optional)</span></label><input type="url" data-ci="${i}" data-cf="url" value="${bA(it.url||'')}" /></div>
     </div>`).join('')}</div>
       <button class="bld-add-li bld-add-item" data-shape='{"img":"","label":"Brand","url":""}'>+ Add logo</button>
       <div class="bld-ef"><label>Logo size</label><select data-f="size"><option value="sm"${s.size==='sm'?' selected':''}>Small</option><option value="md"${(!s.size||s.size==='md')?' selected':''}>Medium</option><option value="lg"${s.size==='lg'?' selected':''}>Large</option></select></div>
       <div class="bld-ef"><label>Grayscale</label><select data-f="mono"><option value="yes"${s.mono!=='no'?' selected':''}>Yes</option><option value="no"${s.mono==='no'?' selected':''}>No</option></select></div>
       ${bPadRow(s.pad)}`;
  } else if (s.type==='video') {
    f=`<div class="bld-ef"><label>Video URL <span style="opacity:.5">(YouTube or Vimeo)</span></label><input type="url" data-f="url" value="${bA(s.url||'')}" placeholder="https://youtube.com/watch?v=…" /></div>
       <div class="bld-ef"><label>Caption <span style="opacity:.5">(optional)</span></label><input type="text" data-f="caption" value="${bA(s.caption||'')}" /></div>
       <div class="bld-ef"><label>Width</label><select data-f="max_w"><option value="narrow"${s.max_w==='narrow'?' selected':''}>Narrow</option><option value="normal"${(!s.max_w||s.max_w==='normal')?' selected':''}>Normal</option><option value="full"${s.max_w==='full'?' selected':''}>Full</option></select></div>
       ${bPadRow(s.pad)}`;
  } else if (s.type==='map') {
    f=`<div class="bld-ef"><label>Address or embed URL</label><input type="text" data-f="query" value="${bA(s.query||'')}" placeholder="123 Main St, City, State" /></div>
       <div class="bld-ef"><label>Height</label><select data-f="height"><option value="sm"${s.height==='sm'?' selected':''}>Short</option><option value="md"${(!s.height||s.height==='md')?' selected':''}>Medium</option><option value="lg"${s.height==='lg'?' selected':''}>Tall</option></select></div>
       ${bPadRow(s.pad)}`;
  } else if (s.type==='marquee') {
    f=`<div class="bld-ef"><label>Text</label><input type="text" data-f="text" value="${bA(s.text||'')}" /></div>
       <div class="bld-ef"><label>Separator</label><input type="text" data-f="separator" value="${bA(s.separator||'•')}" /></div>
       <div class="bld-ef"><label>Speed</label><select data-f="speed"><option value="slow"${s.speed==='slow'?' selected':''}>Slow</option><option value="normal"${(!s.speed||s.speed==='normal')?' selected':''}>Normal</option><option value="fast"${s.speed==='fast'?' selected':''}>Fast</option></select></div>`;
  } else if (s.type==='sectionhead') {
    f=`${ehs}${bAlignRow(s.align)}${bPadRow(s.pad)}`;
  } else if (s.type==='lead') {
    f=`<div class="bld-ef"><label>Text</label><textarea data-f="text" rows="3">${bE(s.text||'')}</textarea></div>${bAlignRow(s.align)}${bPadRow(s.pad)}`;
  } else if (s.type==='callout') {
    f=`<div class="bld-ef"><label>Style</label><select data-f="variant"><option value="info"${(!s.variant||s.variant==='info')?' selected':''}>Info</option><option value="tip"${s.variant==='tip'?' selected':''}>Tip</option><option value="success"${s.variant==='success'?' selected':''}>Success</option><option value="warn"${s.variant==='warn'?' selected':''}>Warning</option></select></div>
       <div class="bld-ef"><label>Icon <span style="opacity:.5">(optional, emoji)</span></label><input type="text" data-f="icon" value="${bA(s.icon||'')}" placeholder="💡" /></div>
       <div class="bld-ef"><label>Title <span style="opacity:.5">(optional)</span></label><input type="text" data-f="title" value="${bA(s.title||'')}" /></div>
       <div class="bld-ef"><label>Body <span style="opacity:.45">(Markdown)</span></label><textarea data-f="body" rows="3">${bE(s.body||'')}</textarea></div>${bPadRow(s.pad)}`;
  } else if (s.type==='code') {
    f=`<div class="bld-ef"><label>Language label <span style="opacity:.5">(optional)</span></label><input type="text" data-f="lang" value="${bA(s.lang||'')}" placeholder="javascript" /></div>
       <div class="bld-ef"><label>Code</label><textarea data-f="code" rows="8" style="font-family:ui-monospace,monospace;">${bE(s.code||'')}</textarea></div>${bPadRow(s.pad)}`;
  } else if (s.type==='specs') {
    const items=s.items||[];
    f=`<div class="bld-ef"><label>Heading <span style="opacity:.5">(optional)</span></label><input type="text" data-f="heading" value="${bA(s.heading||'')}" /></div>
       <div id="bSPEC">${items.map((it,i)=>`<div class="bld-li-item"><button class="bld-li-rm" data-crm="${i}">✕</button><div class="bld-ef"><label>Label</label><input type="text" data-ci="${i}" data-cf="label" value="${bA(it.label||'')}" /></div><div class="bld-ef"><label>Value</label><input type="text" data-ci="${i}" data-cf="value" value="${bA(it.value||'')}" /></div></div>`).join('')}</div>
       <button class="bld-add-li bld-add-item" data-shape='{"label":"","value":""}'>+ Add row</button>${bPadRow(s.pad)}`;
  } else if (s.type==='timeline') {
    const items=s.items||[];
    f=`${ehs}<div id="bTL">${items.map((it,i)=>`<div class="bld-li-item"><button class="bld-li-rm" data-crm="${i}">✕</button><div class="bld-ef"><label>Date</label><input type="text" data-ci="${i}" data-cf="date" value="${bA(it.date||'')}" placeholder="2024" /></div><div class="bld-ef"><label>Title</label><input type="text" data-ci="${i}" data-cf="title" value="${bA(it.title||'')}" /></div><div class="bld-ef"><label>Text</label><textarea data-ci="${i}" data-cf="text" rows="2">${bE(it.text||'')}</textarea></div></div>`).join('')}</div>
       <button class="bld-add-li bld-add-item" data-shape='{"date":"","title":"","text":""}'>+ Add event</button>${bPadRow(s.pad)}`;
  } else if (s.type==='tabs') {
    const items=s.items||[];
    f=`<div id="bTABS">${items.map((it,i)=>`<div class="bld-li-item"><button class="bld-li-rm" data-crm="${i}">✕</button><div class="bld-ef"><label>Tab label</label><input type="text" data-ci="${i}" data-cf="label" value="${bA(it.label||'')}" /></div><div class="bld-ef"><label>Content <span style="opacity:.45">(Markdown)</span></label><textarea data-ci="${i}" data-cf="body" rows="3">${bE(it.body||'')}</textarea></div></div>`).join('')}</div>
       <button class="bld-add-li bld-add-item" data-shape='{"label":"Tab","body":""}'>+ Add tab</button>${bPadRow(s.pad)}`;
  } else if (s.type==='buttongroup') {
    const items=s.items||[];
    f=`<div id="bBG">${items.map((it,i)=>`<div class="bld-li-item"><button class="bld-li-rm" data-crm="${i}">✕</button><div class="bld-ef"><label>Label</label><input type="text" data-ci="${i}" data-cf="label" value="${bA(it.label||'')}" /></div><div class="bld-ef"><label>URL</label><input type="url" data-ci="${i}" data-cf="url" value="${bA(it.url||'')}" /></div><div class="bld-ef"><label>Style</label><select data-ci="${i}" data-cf="style"><option value="solid"${it.style!=='outline'?' selected':''}>Solid</option><option value="outline"${it.style==='outline'?' selected':''}>Outline</option></select></div></div>`).join('')}</div>
       <button class="bld-add-li bld-add-item" data-shape='{"label":"Button","url":"","style":"solid"}'>+ Add button</button>${bAlignRow(s.align)}${bPadRow(s.pad)}`;
  } else if (s.type==='toc') {
    const items=s.items||[];
    f=`<div class="bld-ef"><label>Heading <span style="opacity:.5">(optional)</span></label><input type="text" data-f="heading" value="${bA(s.heading||'')}" /></div>
       <div id="bTOC">${items.map((it,i)=>`<div class="bld-li-item"><button class="bld-li-rm" data-crm="${i}">✕</button><div class="bld-ef"><label>Label</label><input type="text" data-ci="${i}" data-cf="label" value="${bA(it.label||'')}" /></div><div class="bld-ef"><label>Anchor ID <span style="opacity:.45">(set on a block below)</span></label><input type="text" data-ci="${i}" data-cf="anchor" value="${bA(it.anchor||'')}" placeholder="about" /></div></div>`).join('')}</div>
       <button class="bld-add-li bld-add-item" data-shape='{"label":"","anchor":""}'>+ Add link</button>${bPadRow(s.pad)}`;
  } else if (s.type==='masonry') {
    const items=s.items||[];
    f=`<div id="bMAS">${items.map((it,i)=>`<div class="bld-li-item"><button class="bld-li-rm" data-crm="${i}">✕</button><div class="bld-ef"><label>Image</label><div style="display:flex;gap:.4rem;"><input type="url" data-ci="${i}" data-cf="img" value="${bA(it.img||'')}" style="flex:1;" /><button class="btn btn-sm bld-img-pick" data-target-ci="${i}" data-target-cf="img">Pick</button></div></div><div class="bld-ef"><label>Caption</label><input type="text" data-ci="${i}" data-cf="caption" value="${bA(it.caption||'')}" /></div></div>`).join('')}</div>
       <button class="bld-add-li bld-add-item" data-shape='{"img":"","caption":""}'>+ Add image</button>
       <div class="bld-ef"><label>Columns</label><select data-f="cols"><option value="2"${s.cols==='2'?' selected':''}>2</option><option value="3"${(!s.cols||s.cols==='3')?' selected':''}>3</option><option value="4"${s.cols==='4'?' selected':''}>4</option></select></div>${bPadRow(s.pad)}`;
  } else if (s.type==='compare') {
    f=`<div class="bld-ef"><label>Before image</label><div style="display:flex;gap:.4rem;"><input type="url" data-f="before" value="${bA(s.before||'')}" style="flex:1;" /><button class="btn btn-sm bld-img-pick" data-target-f="before">Pick</button></div></div>
       <div class="bld-ef"><label>After image</label><div style="display:flex;gap:.4rem;"><input type="url" data-f="after" value="${bA(s.after||'')}" style="flex:1;" /><button class="btn btn-sm bld-img-pick" data-target-f="after">Pick</button></div></div>
       <div class="bld-ef"><label>Height</label><select data-f="height"><option value="sm"${s.height==='sm'?' selected':''}>Short</option><option value="md"${(!s.height||s.height==='md')?' selected':''}>Medium</option><option value="lg"${s.height==='lg'?' selected':''}>Tall</option></select></div>${bPadRow(s.pad)}`;
  } else if (s.type==='testimonial') {
    f=`<div class="bld-ef"><label>Quote</label><textarea data-f="quote" rows="3">${bE(s.quote||'')}</textarea></div>
       <div class="bld-ef"><label>Name</label><input type="text" data-f="name" value="${bA(s.name||'')}" /></div>
       <div class="bld-ef"><label>Role / company</label><input type="text" data-f="role" value="${bA(s.role||'')}" /></div>
       <div class="bld-ef"><label>Avatar <span style="opacity:.5">(optional)</span></label><div style="display:flex;gap:.4rem;"><input type="url" data-f="avatar" value="${bA(s.avatar||'')}" style="flex:1;" /><button class="btn btn-sm bld-img-pick" data-target-f="avatar">Pick</button></div></div>${bPadRow(s.pad)}`;
  } else if (s.type==='rating') {
    f=`<div class="bld-ef"><label>Score</label><input type="text" data-f="score" value="${bA(s.score||'')}" placeholder="4.9" /></div>
       <div class="bld-ef"><label>Out of</label><input type="text" data-f="max" value="${bA(s.max||'5')}" placeholder="5" /></div>
       <div class="bld-ef"><label>Review count <span style="opacity:.5">(optional)</span></label><input type="text" data-f="count" value="${bA(s.count||'')}" placeholder="120" /></div>
       <div class="bld-ef"><label>Label <span style="opacity:.5">(optional)</span></label><input type="text" data-f="label" value="${bA(s.label||'')}" placeholder="on Google" /></div>${bAlignRow(s.align)}${bPadRow(s.pad)}`;
  } else if (s.type==='countdown') {
    f=`<div class="bld-ef"><label>Heading <span style="opacity:.5">(optional)</span></label><input type="text" data-f="heading" value="${bA(s.heading||'')}" /></div>
       <div class="bld-ef"><label>Target date &amp; time</label><input type="datetime-local" data-f="target" value="${bA(s.target||'')}" /></div>
       <div class="bld-ef"><label>Message when done</label><input type="text" data-f="done_text" value="${bA(s.done_text||'')}" /></div>${bAlignRow(s.align)}${bPadRow(s.pad)}`;
  } else if (s.type==='badges') {
    const items=s.items||[];
    f=`<div id="bBADGE">${items.map((it,i)=>`<div class="bld-li-item"><button class="bld-li-rm" data-crm="${i}">✕</button><div class="bld-ef"><label>Icon <span style="opacity:.5">(emoji)</span></label><input type="text" data-ci="${i}" data-cf="icon" value="${bA(it.icon||'')}" /></div><div class="bld-ef"><label>Label</label><input type="text" data-ci="${i}" data-cf="label" value="${bA(it.label||'')}" /></div></div>`).join('')}</div>
       <button class="bld-add-li bld-add-item" data-shape='{"icon":"✔","label":""}'>+ Add badge</button>${bAlignRow(s.align)}${bPadRow(s.pad)}`;
  } else if (s.type==='vcard') {
    const items=s.items||[];
    f=`<div class="bld-ef"><label>Photo <span style="opacity:.5">(optional)</span></label><div style="display:flex;gap:.4rem;"><input type="url" data-f="photo" value="${bA(s.photo||'')}" style="flex:1;" /><button class="btn btn-sm bld-img-pick" data-target-f="photo">Pick</button></div></div>
       <div class="bld-ef"><label>Name</label><input type="text" data-f="name" value="${bA(s.name||'')}" /></div>
       <div class="bld-ef"><label>Role</label><input type="text" data-f="role" value="${bA(s.role||'')}" /></div>
       <div class="bld-ef"><label>Tagline</label><input type="text" data-f="tagline" value="${bA(s.tagline||'')}" /></div>
       <div id="bVC">${items.map((it,i)=>`<div class="bld-li-item"><button class="bld-li-rm" data-crm="${i}">✕</button><div class="bld-ef"><label>Label</label><input type="text" data-ci="${i}" data-cf="label" value="${bA(it.label||'')}" /></div><div class="bld-ef"><label>Value</label><input type="text" data-ci="${i}" data-cf="val" value="${bA(it.val||'')}" /></div><div class="bld-ef"><label>Link</label><input type="text" data-ci="${i}" data-cf="href" value="${bA(it.href||'')}" placeholder="mailto:…" /></div></div>`).join('')}</div>
       <button class="bld-add-li bld-add-item" data-shape='{"label":"","val":"","href":""}'>+ Add link</button>${bPadRow(s.pad)}`;
  } else if (s.type==='availability') {
    f=`<div class="bld-ef"><label>Status</label><select data-f="status"><option value="available"${s.status!=='busy'&&s.status!=='unavailable'?' selected':''}>Available (green)</option><option value="busy"${s.status==='busy'?' selected':''}>Busy (amber)</option></select></div>
       <div class="bld-ef"><label>Text</label><input type="text" data-f="text" value="${bA(s.text||'')}" /></div>${bAlignRow(s.align)}${bPadRow(s.pad)}`;
  } else if (s.type==='skills') {
    const items=s.items||[];
    f=`<div class="bld-ef"><label>Heading <span style="opacity:.5">(optional)</span></label><input type="text" data-f="heading" value="${bA(s.heading||'')}" /></div>
       <div id="bSKILL">${items.map((it,i)=>`<div class="bld-li-item"><button class="bld-li-rm" data-crm="${i}">✕</button><div class="bld-ef"><label>Skill</label><input type="text" data-ci="${i}" data-cf="label" value="${bA(it.label||'')}" /></div></div>`).join('')}</div>
       <button class="bld-add-li bld-add-item" data-shape='{"label":""}'>+ Add skill</button>${bAlignRow(s.align)}${bPadRow(s.pad)}`;
  } else if (s.type==='progress') {
    const items=s.items||[];
    f=`<div class="bld-ef"><label>Heading <span style="opacity:.5">(optional)</span></label><input type="text" data-f="heading" value="${bA(s.heading||'')}" /></div>
       <div id="bPROG">${items.map((it,i)=>`<div class="bld-li-item"><button class="bld-li-rm" data-crm="${i}">✕</button><div class="bld-ef"><label>Label</label><input type="text" data-ci="${i}" data-cf="label" value="${bA(it.label||'')}" /></div><div class="bld-ef"><label>Percent (0–100)</label><input type="number" min="0" max="100" data-ci="${i}" data-cf="pct" value="${bA(it.pct||'')}" /></div></div>`).join('')}</div>
       <button class="bld-add-li bld-add-item" data-shape='{"label":"","pct":"50"}'>+ Add bar</button>${bPadRow(s.pad)}`;
  } else if (s.type==='resume') {
    const items=s.items||[];
    f=`<div class="bld-ef"><label>Heading <span style="opacity:.5">(optional)</span></label><input type="text" data-f="heading" value="${bA(s.heading||'')}" /></div>
       <div id="bRES">${items.map((it,i)=>`<div class="bld-li-item"><button class="bld-li-rm" data-crm="${i}">✕</button><div class="bld-ef"><label>Dates</label><input type="text" data-ci="${i}" data-cf="date" value="${bA(it.date||'')}" placeholder="2022 — now" /></div><div class="bld-ef"><label>Title</label><input type="text" data-ci="${i}" data-cf="title" value="${bA(it.title||'')}" /></div><div class="bld-ef"><label>Org</label><input type="text" data-ci="${i}" data-cf="org" value="${bA(it.org||'')}" /></div><div class="bld-ef"><label>Text</label><textarea data-ci="${i}" data-cf="text" rows="2">${bE(it.text||'')}</textarea></div></div>`).join('')}</div>
       <button class="bld-add-li bld-add-item" data-shape='{"date":"","title":"","org":"","text":""}'>+ Add entry</button>${bPadRow(s.pad)}`;
  } else if (s.type==='qrcode') {
    f=`<div class="bld-ef"><label>URL or text</label><input type="text" data-f="data" value="${bA(s.data||'')}" placeholder="https://…" /></div>
       <div class="bld-ef"><label>Caption <span style="opacity:.5">(optional)</span></label><input type="text" data-f="caption" value="${bA(s.caption||'')}" /></div>
       <div class="bld-ef"><label>Size</label><select data-f="size"><option value="sm"${s.size==='sm'?' selected':''}>Small</option><option value="md"${(!s.size||s.size==='md')?' selected':''}>Medium</option><option value="lg"${s.size==='lg'?' selected':''}>Large</option></select></div>${bAlignRow(s.align)}${bPadRow(s.pad)}`;
  } else if (s.type==='toggle') {
    f=`<div class="bld-ef"><label>Label</label><input type="text" data-f="label" value="${bA(s.label||'')}" /></div>
       <div class="bld-ef"><label>Hidden content <span style="opacity:.45">(Markdown)</span></label><textarea data-f="body" rows="4">${bE(s.body||'')}</textarea></div>${bPadRow(s.pad)}`;
  } else if (s.type==='copyfield') {
    f=`<div class="bld-ef"><label>Label <span style="opacity:.5">(optional)</span></label><input type="text" data-f="label" value="${bA(s.label||'')}" /></div>
       <div class="bld-ef"><label>Value to copy</label><input type="text" data-f="value" value="${bA(s.value||'')}" /></div>${bPadRow(s.pad)}`;
  } else if (s.type==='embed') {
    f=`<div class="bld-ef"><label>Embed URL <span style="opacity:.5">(CodePen, Figma, Loom, …)</span></label><input type="url" data-f="url" value="${bA(s.url||'')}" /></div>
       <div class="bld-ef"><label>Height</label><select data-f="height"><option value="sm"${s.height==='sm'?' selected':''}>Short</option><option value="md"${(!s.height||s.height==='md')?' selected':''}>Medium</option><option value="lg"${s.height==='lg'?' selected':''}>Tall</option></select></div>${bPadRow(s.pad)}`;
  } else if (s.type==='audio') {
    f=`<div class="bld-ef"><label>Spotify or SoundCloud URL</label><input type="url" data-f="url" value="${bA(s.url||'')}" placeholder="https://open.spotify.com/…" /></div>${bPadRow(s.pad)}`;
  } else if (s.type==='socialpost') {
    f=`<div class="bld-ef"><label>Post URL <span style="opacity:.5">(X, Instagram, TikTok…)</span></label><input type="url" data-f="url" value="${bA(s.url||'')}" /></div>${bPadRow(s.pad)}`;
  } else if (s.type==='booking') {
    f=`<div class="bld-ef"><label>Calendly / Cal.com URL</label><input type="url" data-f="url" value="${bA(s.url||'')}" /></div>
       <div class="bld-ef"><label>Height</label><select data-f="height"><option value="sm"${s.height==='sm'?' selected':''}>Short</option><option value="md"${s.height==='md'?' selected':''}>Medium</option><option value="lg"${(!s.height||s.height==='lg')?' selected':''}>Tall</option></select></div>${bPadRow(s.pad)}`;
  } else if (s.type==='newsletter') {
    f=`<div class="bld-ef" style="font-size:.62rem;color:var(--muted);line-height:1.6;border:1px solid var(--border);padding:.6rem .7rem;border-radius:6px;">Emails are delivered via Web3Forms. Set the <code>WEB3FORMS_APIKEY</code> secret on this site in Cloudflare for it to work.</div>
       <div class="bld-ef"><label>Heading</label><input type="text" data-f="heading" value="${bA(s.heading||'')}" /></div>
       <div class="bld-ef"><label>Subtext</label><input type="text" data-f="sub" value="${bA(s.sub||'')}" /></div>
       <div class="bld-ef"><label>Email placeholder</label><input type="text" data-f="placeholder" value="${bA(s.placeholder||'')}" /></div>
       <div class="bld-ef"><label>Button label</label><input type="text" data-f="button" value="${bA(s.button||'')}" /></div>${bPadRow(s.pad)}`;
  } else if (s.type==='contactform') {
    f=`<div class="bld-ef" style="font-size:.62rem;color:var(--muted);line-height:1.6;border:1px solid var(--border);padding:.6rem .7rem;border-radius:6px;">Messages are delivered via Web3Forms. Set the <code>WEB3FORMS_APIKEY</code> secret on this site in Cloudflare for it to work.</div>
       ${ehs}
       <div class="bld-ef"><label>Button label</label><input type="text" data-f="button" value="${bA(s.button||'')}" /></div>${bPadRow(s.pad)}`;
  }

  if (!['divider','spacer'].includes(s.type)) {
    f += `<div class="bld-sep" style="margin:.4rem 0;"></div>
    <div class="bld-ef"><label>Column Width <span style="opacity:.45">(for side-by-side rows)</span></label>
    <select data-f="width">
      <option value="full"${(!s.width||s.width==='full')?' selected':''}>Full width</option>
      <option value="half"${s.width==='half'?' selected':''}>Half — pair with next</option>
      <option value="third"${s.width==='third'?' selected':''}>One-third — group of 3</option>
    </select></div>
    <div class="bld-ef"><label>Anchor ID <span style="opacity:.45">(optional — link to it with #id)</span></label>
    <input type="text" data-f="anchor" value="${bA(s.anchor||'')}" placeholder="e.g. about" /></div>`;
  }
  return { html: f, label: typeLabels[s.type]||s.type };
}

function bBindEditor(panel, s, onUpdate) {

  panel.querySelectorAll('[data-f]').forEach(inp => {
    inp.addEventListener('input', () => {
      s[inp.dataset.f]=inp.value;
      if (inp.dataset.f==='width') { bldDrawCanvas(); } else { onUpdate(s); }
    });
  });

  panel.querySelectorAll('[data-align]:not([data-align-f])').forEach(btn => {
    btn.addEventListener('click', () => {
      panel.querySelectorAll('[data-align]:not([data-align-f])').forEach(b=>b.classList.remove('act'));
      btn.classList.add('act'); s.align=btn.dataset.align; onUpdate(s);
    });
  });

  panel.querySelectorAll('[data-align-f]').forEach(btn => {
    const field = btn.dataset.alignF;
    btn.addEventListener('click', () => {
      panel.querySelectorAll(`[data-align-f="${field}"]`).forEach(b=>b.classList.remove('act'));
      btn.classList.add('act'); s[field]=btn.dataset.align; onUpdate(s);
    });
  });

  panel.querySelectorAll('[data-li][data-lf]').forEach(inp => {
    const ev = inp.tagName==='SELECT' ? 'change' : 'input';
    inp.addEventListener(ev, () => { s.items[+inp.dataset.li][inp.dataset.lf]=inp.value; onUpdate(s); });
  });
  panel.querySelectorAll('[data-lrm]').forEach(btn => {
    btn.addEventListener('click', () => { s.items.splice(+btn.dataset.lrm,1); onUpdate(s,'re-editor'); });
  });
  const addLi=panel.querySelector('#bAddLi');
  if (addLi) addLi.addEventListener('click', () => { s.items.push({t:'',u:'https://',d:''}); onUpdate(s,'re-editor'); });

  panel.querySelectorAll('[data-si][data-sf]').forEach(inp => {
    inp.addEventListener('input', () => { s.items[+inp.dataset.si][inp.dataset.sf]=inp.value; onUpdate(s); });
  });
  panel.querySelectorAll('[data-srm]').forEach(btn => {
    btn.addEventListener('click', () => { s.items.splice(+btn.dataset.srm,1); onUpdate(s,'re-editor'); });
  });
  const addSi=panel.querySelector('#bAddSi');
  if (addSi) addSi.addEventListener('click', () => { s.items.push({label:'',url:'https://'}); onUpdate(s,'re-editor'); });

  panel.querySelectorAll('[data-sti][data-stf]').forEach(inp => {
    inp.addEventListener('input', () => { s.items[+inp.dataset.sti][inp.dataset.stf]=inp.value; onUpdate(s); });
  });
  panel.querySelectorAll('[data-strm]').forEach(btn => {
    btn.addEventListener('click', () => { s.items.splice(+btn.dataset.strm,1); onUpdate(s,'re-editor'); });
  });
  const addSti=panel.querySelector('#bAddSti');
  if (addSti) addSti.addEventListener('click', () => { s.items.push({number:'',label:''}); onUpdate(s,'re-editor'); });

  panel.querySelectorAll('[data-ci][data-cf]').forEach(inp => {
    const ev=inp.tagName==='SELECT'?'change':'input';
    inp.addEventListener(ev, () => { s.items[+inp.dataset.ci][inp.dataset.cf]=inp.value; onUpdate(s); });
  });
  panel.querySelectorAll('[data-crm]').forEach(btn => {
    btn.addEventListener('click', () => { s.items.splice(+btn.dataset.crm,1); onUpdate(s,'re-editor'); });
  });
  const addCi=panel.querySelector('#bAddCi');
  if (addCi) addCi.addEventListener('click', () => { s.items.push({img:'',title:'',body:'',url:'',new_tab:'yes'}); onUpdate(s,'re-editor'); });
  const addColl=panel.querySelector('#bAddColl');
  if (addColl) addColl.addEventListener('click', () => { s.items.push({imgs:[''],name:'',note:'',for_sale:'no',price:''}); onUpdate(s,'re-editor'); });

  const ensureColImgs = (i) => { if (!s.items[i].imgs) s.items[i].imgs = (s.items[i].img ? [s.items[i].img] : []); return s.items[i].imgs; };
  panel.querySelectorAll('input[data-cii][data-ciij]').forEach(inp => {
    inp.addEventListener('input', () => { const a=ensureColImgs(+inp.dataset.cii); a[+inp.dataset.ciij]=inp.value; onUpdate(s); });
  });
  panel.querySelectorAll('.bld-cimg-rm').forEach(btn => {
    btn.addEventListener('click', () => { const a=ensureColImgs(+btn.dataset.cii); a.splice(+btn.dataset.ciij,1); onUpdate(s,'re-editor'); });
  });
  panel.querySelectorAll('.bld-cimg-add').forEach(btn => {
    btn.addEventListener('click', () => { ensureColImgs(+btn.dataset.cii).push(''); onUpdate(s,'re-editor'); });
  });

  panel.querySelectorAll('[data-cti][data-ctf]').forEach(inp => {
    inp.addEventListener('input', () => { if (!s.items) s.items=[]; const i=+inp.dataset.cti; if (!s.items[i]) s.items[i]={label:'',val:'',href:''}; s.items[i][inp.dataset.ctf]=inp.value; onUpdate(s); });
  });
  panel.querySelectorAll('[data-ctrm]').forEach(btn => {
    btn.addEventListener('click', () => { s.items.splice(+btn.dataset.ctrm,1); onUpdate(s,'re-editor'); });
  });
  const addCti=panel.querySelector('#bAddCti');
  if (addCti) addCti.addEventListener('click', () => { if (!s.items) s.items=[]; s.items.push({label:'',val:'',href:'',sub:''}); onUpdate(s,'re-editor'); });


  panel.querySelectorAll('.bld-add-item').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!s.items) s.items=[];
      let shape={}; try { shape=JSON.parse(btn.dataset.shape||'{}'); } catch {}
      s.items.push(shape); onUpdate(s,'re-editor');
    });
  });

  panel.querySelector('#bFilePrevPick')?.addEventListener('click', () => openFilePicker(url => { s.url=url; const inp=panel.querySelector('[data-f="url"]'); if(inp){inp.value=url;} onUpdate(s); }));
  panel.querySelector('#bFileDownPick')?.addEventListener('click', () => openFilePicker(url => { s.url=url; const inp=panel.querySelector('[data-f="url"]'); if(inp){inp.value=url;} onUpdate(s); }));

  panel.querySelectorAll('[data-gi][data-gf]').forEach(inp => {
    const ev=inp.tagName==='SELECT'?'change':'input';
    inp.addEventListener(ev, () => { s.items[+inp.dataset.gi][inp.dataset.gf]=inp.value; onUpdate(s); });
  });
  panel.querySelectorAll('[data-galrm]').forEach(btn => {
    btn.addEventListener('click', () => { s.items.splice(+btn.dataset.galrm,1); onUpdate(s,'re-editor'); });
  });
  const addGal=panel.querySelector('#bAddGal');
  if (addGal) addGal.addEventListener('click', () => { s.items.push({img:'',url:'',caption:''}); onUpdate(s,'re-editor'); });

  panel.querySelectorAll('[data-target-gi][data-target-gf]').forEach(btn => {
    btn.addEventListener('click', () => {
      openImgPicker(url => {
        const inp = panel.querySelector(`[data-gi="${btn.dataset.targetGi}"][data-gf="${btn.dataset.targetGf}"]`);
        if (inp) { inp.value = url; inp.dispatchEvent(new Event('input')); }
      });
    });
  });

  panel.querySelectorAll('[data-acri][data-acrf]').forEach(inp => {
    const ev=inp.tagName==='TEXTAREA'?'input':inp.tagName==='SELECT'?'change':'input';
    inp.addEventListener(ev, () => { s.items[+inp.dataset.acri][inp.dataset.acrf]=inp.value; onUpdate(s); });
  });
  panel.querySelectorAll('[data-acrrm]').forEach(btn => {
    btn.addEventListener('click', () => { s.items.splice(+btn.dataset.acrrm,1); onUpdate(s,'re-editor'); });
  });
  const addAcr=panel.querySelector('#bAddAcr');
  if (addAcr) addAcr.addEventListener('click', () => { s.items.push({q:'',a:''}); onUpdate(s,'re-editor'); });

  panel.querySelectorAll('[data-grprm]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!s.sections) s.sections=[];
      s.sections.splice(+btn.dataset.grprm,1);
      onUpdate(s,'re-editor');
    });
  });
  panel.querySelectorAll('[data-grpedit]').forEach(btn => {
    btn.addEventListener('click', () => {
      const child=s.sections?.[+btn.dataset.grpedit]; if (!child) return;
      bldParentId=s.id; bldSel=child.id; bldDrawEditor();
    });
  });
  const addGrpSec=panel.querySelector('#bGrpAddSec');
  if (addGrpSec) addGrpSec.addEventListener('click', () => {
    const type=panel.querySelector('#bGrpAddType')?.value; if (!type) return;
    const d=bDefault(type); if (!d) { toast('That block is coming soon.', true); return; }
    if (!s.sections) s.sections=[];
    s.sections.push(d);
    onUpdate(s,'re-editor');
  });

  panel.querySelectorAll('[data-cri][data-crf]').forEach(inp => {
    const ev=inp.tagName==='SELECT'?'change':'input';
    inp.addEventListener(ev, () => { s.items[+inp.dataset.cri][inp.dataset.crf]=inp.value; onUpdate(s); });
  });
  panel.querySelectorAll('[data-crrm]').forEach(btn => {
    btn.addEventListener('click', () => { s.items.splice(+btn.dataset.crrm,1); onUpdate(s,'re-editor'); });
  });
  const addCr=panel.querySelector('#bAddCr');
  if (addCr) addCr.addEventListener('click', () => { s.items.push({img:'',caption:''}); onUpdate(s,'re-editor'); });

  panel.querySelectorAll('[data-target-cri][data-target-crf]').forEach(btn => {
    btn.addEventListener('click', () => {
      openImgPicker(url => {
        const inp = panel.querySelector(`[data-cri="${btn.dataset.targetCri}"][data-crf="${btn.dataset.targetCrf}"]`);
        if (inp) { inp.value = url; inp.dispatchEvent(new Event('input')); }
      });
    });
  });

  panel.querySelectorAll('.bld-img-pick').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetF  = btn.dataset.targetF;
      const targetCi = btn.dataset.targetCi;
      const targetCf = btn.dataset.targetCf;
      openImgPicker(url => {
        if (targetF) {
          const inp = panel.querySelector(`[data-f="${targetF}"]`);
          if (inp) { inp.value = url; inp.dispatchEvent(new Event('input')); }
        } else if (targetCi !== undefined && targetCf) {
          const inp = panel.querySelector(`[data-ci="${targetCi}"][data-cf="${targetCf}"]`);
          if (inp) { inp.value = url; inp.dispatchEvent(new Event('input')); }
        } else if (btn.dataset.targetCii !== undefined && btn.dataset.targetCiij !== undefined) {
          const inp = panel.querySelector(`[data-cii="${btn.dataset.targetCii}"][data-ciij="${btn.dataset.targetCiij}"]`);
          if (inp) { inp.value = url; inp.dispatchEvent(new Event('input')); }
        }
      });
    });
  });
}

function bSetupDnD(canvasEl, sections, onDone) {
  canvasEl.querySelectorAll('.bld-sw').forEach(sw=>{
    sw.addEventListener('dragstart',e=>{
      bDragId=sw.dataset.sid; bDragNew=null;
      e.dataTransfer.effectAllowed='move';
      setTimeout(()=>sw.classList.add('dragging'),0);
    });
    sw.addEventListener('dragend',()=>{
      sw.classList.remove('dragging');
      canvasEl.querySelectorAll('.bld-sw').forEach(s=>s.classList.remove('drag-above','drag-below'));
      bDragId=null;
    });
    sw.addEventListener('dragover',e=>{
      if (!bDragId&&!bDragNew) return;
      if (bDragId===sw.dataset.sid) return;
      e.preventDefault();
      const r=sw.getBoundingClientRect();
      const relX=(e.clientX-r.left)/r.width;
      const relY=(e.clientY-r.top)/r.height;
      const sideDrop=relX<0.28||relX>0.72;
      canvasEl.querySelectorAll('.bld-sw').forEach(s=>s.classList.remove('drag-above','drag-below','drag-left','drag-right'));
      if (sideDrop) {
        sw.classList.add(relX<0.5?'drag-left':'drag-right');
      } else {
        sw.classList.add(relY<0.5?'drag-above':'drag-below');
      }
    });
    sw.addEventListener('dragleave',()=>sw.classList.remove('drag-above','drag-below','drag-left','drag-right'));
    sw.addEventListener('drop',e=>{
      e.preventDefault(); e.stopPropagation();
      const r=sw.getBoundingClientRect();
      const relX=(e.clientX-r.left)/r.width;
      const relY=(e.clientY-r.top)/r.height;
      const sideDrop=relX<0.28||relX>0.72;
      sw.classList.remove('drag-above','drag-below','drag-left','drag-right');
      const toIdx=sections.findIndex(s=>s.id===sw.dataset.sid);
      const targetSec=sections[toIdx];
      let ns;
      if (bDragNew) {
        ns=bDefault(bDragNew); bDragNew=null;
      } else if (bDragId&&bDragId!==sw.dataset.sid) {
        const fromIdx=sections.findIndex(s=>s.id===bDragId); if (fromIdx<0) return;
        [ns]=sections.splice(fromIdx,1); bDragId=null;
      } else return;
      if (sideDrop) {

        ns.width='half';
        if (targetSec) targetSec.width='half';
        const ins=sections.findIndex(s=>s.id===sw.dataset.sid);
        sections.splice(relX<0.5?ins:ins+1,0,ns);
      } else {
        const before=relY<0.5;
        const ins=sections.findIndex(s=>s.id===sw.dataset.sid);
        sections.splice(before?ins:ins+1,0,ns);
      }
      onDone(ns.id);
    });
  });
  canvasEl.addEventListener('dragover',e=>{
    if ((!bDragNew&&!bDragId)||e.target.closest('.bld-sw')) return;
    e.preventDefault(); canvasEl.classList.add('drag-target');
  });
  canvasEl.addEventListener('dragleave',e=>{
    if (!e.relatedTarget||!canvasEl.contains(e.relatedTarget)) canvasEl.classList.remove('drag-target');
  });
  canvasEl.addEventListener('drop',e=>{
    if (e.target.closest('.bld-sw')) return;
    e.preventDefault(); canvasEl.classList.remove('drag-target');
    if (bDragNew) {
      const ns=bDefault(bDragNew); bDragNew=null;
      sections.push(ns); onDone(ns.id);
    }
  });
}

function bSetupBlockDrag(blocksEl) {
  if (!blocksEl) return;
  blocksEl.querySelectorAll('.bld-blk').forEach(btn=>{
    btn.setAttribute('draggable','true');
    btn.addEventListener('dragstart',e=>{ bDragNew=btn.dataset.type; bDragId=null; e.dataTransfer.effectAllowed='copy'; });
    btn.addEventListener('dragend',()=>{ bDragNew=null; });
  });
}

let bldPickerCat='all', bldPickerQ='';
function pickCard(b){ return `<button class="bld-pick" data-type="${bA(b.t)}" title="${bA(b.l)}"><span class="bld-pick-ic">${b.i||'▫'}</span><span class="bld-pick-l">${bE(b.l)}</span></button>`; }
function bldRenderPicker(){
  const grid=document.getElementById('bldPickerGrid'); if(!grid) return;
  let list=BLOCK_CATALOG;
  if(bldPickerCat!=='all') list=list.filter(b=>b.c===bldPickerCat);
  if(bldPickerQ) list=list.filter(b=>(b.l+' '+b.t+' '+(b.k||'')).toLowerCase().includes(bldPickerQ));
  if(!list.length){ grid.innerHTML=`<p class="bld-picker-empty">No blocks match “${bE(bldPickerQ)}”.</p>`; return; }
  let html='';
  if(bldPickerCat==='all' && !bldPickerQ){
    for(const cat of BLK_CATS){ const items=list.filter(b=>b.c===cat); if(!items.length) continue; html+=`<div class="bld-picker-cathead">${bE(cat)}</div>`+items.map(pickCard).join(''); }
  } else { html=list.map(pickCard).join(''); }
  grid.innerHTML=html;
  grid.querySelectorAll('.bld-pick').forEach(b=>b.addEventListener('click',()=>bldAddBlock(b.dataset.type)));
}
function bldBuildPicker(){
  if(document.getElementById('bldPickerOv')) return;
  const ov=document.createElement('div'); ov.id='bldPickerOv'; ov.className='bld-picker-ov';
  ov.innerHTML=`<div class="bld-picker">
    <div class="bld-picker-head"><h3>Add a section</h3><input class="bld-picker-search" id="bldPickerSearch" placeholder="Search blocks…" autocomplete="off" /><button class="bld-picker-x" id="bldPickerX" aria-label="Close">×</button></div>
    <div class="bld-picker-body"><div class="bld-picker-cats" id="bldPickerCats"></div><div class="bld-picker-grid" id="bldPickerGrid"></div></div>
  </div>`;
  document.body.appendChild(ov);
  ov.addEventListener('click',e=>{ if(e.target===ov) bldClosePicker(); });
  const cats=document.getElementById('bldPickerCats');
  cats.innerHTML=`<button class="bld-picker-cat on" data-cat="all">All blocks</button>`+BLK_CATS.map(c=>`<button class="bld-picker-cat" data-cat="${bA(c)}">${bE(c)}</button>`).join('');
  cats.querySelectorAll('.bld-picker-cat').forEach(b=>b.addEventListener('click',()=>{ cats.querySelectorAll('.bld-picker-cat').forEach(x=>x.classList.remove('on')); b.classList.add('on'); bldPickerCat=b.dataset.cat; bldRenderPicker(); }));
  document.getElementById('bldPickerX').addEventListener('click',bldClosePicker);
  const search=document.getElementById('bldPickerSearch');
  search.addEventListener('input',()=>{ bldPickerQ=search.value.toLowerCase().trim(); bldRenderPicker(); });
  search.addEventListener('keydown',e=>{ if(e.key==='Escape') bldClosePicker(); });
}
function bldOpenPicker(){
  if(!bldPageId){ toast('Select or create a page first.', true); return; }
  bldBuildPicker();
  bldPickerCat='all'; bldPickerQ='';
  const s=document.getElementById('bldPickerSearch'); if(s) s.value='';
  document.getElementById('bldPickerCats').querySelectorAll('.bld-picker-cat').forEach(x=>x.classList.toggle('on',x.dataset.cat==='all'));
  bldRenderPicker();
  document.getElementById('bldPickerOv').classList.add('open');
  setTimeout(()=>{ const s2=document.getElementById('bldPickerSearch'); if(s2) s2.focus(); },40);
}
function bldClosePicker(){ document.getElementById('bldPickerOv')?.classList.remove('open'); }
function bldAddBlock(type){
  const sec=bDefault(type);
  if(!sec){ toast('That block is coming soon.', true); return; }
  bldState.sections.push(sec); bldSel=sec.id;
  bldClosePicker(); bldDrawCanvas(); bldDrawEditor();
  const col=document.getElementById('bldCanvasCol');
  if(col) setTimeout(()=>col.scrollTo({top:col.scrollHeight,behavior:'smooth'}),60);
}

function groupRows(sections) {
  const rows = [];
  let batch = [], batchW = null;
  for (const s of sections) {
    const w = s.width || 'full';
    if (w === 'full') {
      if (batch.length) { rows.push(batch); batch = []; batchW = null; }
      rows.push([s]);
    } else {
      const max = w === 'third' ? 3 : 2;
      if (batchW && batchW !== w) { rows.push(batch); batch = []; }
      batch.push(s); batchW = w;
      if (batch.length >= max) { rows.push(batch); batch = []; batchW = null; }
    }
  }
  if (batch.length) rows.push(batch);
  return rows;
}

function initCarousels(root) {
  root.querySelectorAll('[data-carousel]').forEach(el => {
    const items = Array.from(el.querySelectorAll('[data-slide]'));
    if (!items.length) return;
    let cur = 0;
    function show(n) {
      cur = (n + items.length) % items.length;
      items.forEach((it, i) => { it.style.display = i === cur ? '' : 'none'; });
      const ctr = el.querySelector('[data-slide-ctr]');
      if (ctr) ctr.textContent = `${cur+1} / ${items.length}`;
    }
    el.querySelector('[data-prev]')?.addEventListener('click', e => { e.stopPropagation(); show(cur - 1); });
    el.querySelector('[data-next]')?.addEventListener('click', e => { e.stopPropagation(); show(cur + 1); });
    show(0);
  });
}

let bldPages=[], bldPageId=null, bldState={bg:__SITE__.bg,accent:__SITE__.accent,text:__SITE__.text,font:'Josefin Sans',sections:[]}, bldSel=null, bldParentId=null, bldBooted=false;



function bldDraftKey(id) { return 'foyer_draft_' + id; }
let _lastDraftJson = '';
let _autosaveT = null;
function bldSetAutosave(mode) {
  const wrap = document.getElementById('bldAutosave'), txt = document.getElementById('bldAutosaveText');
  if (!wrap || !txt) return;
  wrap.classList.remove('saving', 'unsaved');
  if (mode === 'saving') { wrap.classList.add('saving'); txt.textContent = 'Saving…'; }
  else if (mode === 'unsaved') { wrap.classList.add('unsaved'); txt.textContent = 'Unsaved'; }
  else { txt.textContent = 'Saved'; }
}
function bldSaveDraft() {
  if (!bldPageId) return;
  const json = JSON.stringify(bldState);
  if (json === _lastDraftJson) return;   // nothing changed since last save
  _lastDraftJson = json;
  bldSetAutosave('saving');
  try { _ls.setItem(bldDraftKey(bldPageId), JSON.stringify({ state: bldState, ts: Date.now() })); } catch {}
  bldDrawPages();   // refresh unsaved (!) badges
  clearTimeout(_autosaveT);
  _autosaveT = setTimeout(() => bldSetAutosave('saved'), 500);
}
function bldClearDraft(id) {
  try { _ls.removeItem(bldDraftKey(id)); } catch {}
  if (id === bldPageId) { _lastDraftJson = JSON.stringify(bldState); bldSetAutosave('saved'); }
}

function bldPageUnsaved(p) {
  try {
    const raw = _ls.getItem(bldDraftKey(p.id));
    if (!raw) return false;
    return JSON.stringify(JSON.parse(raw).state) !== (p.page_json || '');
  } catch { return false; }
}

setInterval(bldSaveDraft, 4000);

window.addEventListener('beforeunload', bldSaveDraft);

function bldFindSection(id) {
  for (const s of bldState.sections) {
    if (s.id===id) return {sec:s,parent:null};
    if (s.type==='group') { const c=(s.sections||[]).find(x=>x.id===id); if(c) return {sec:c,parent:s}; }
  }
  return {sec:null,parent:null};
}

function groupCanvasHtml(g) {
  const open=g.default_open!=='no'&&g.default_open!==false;
  const children=(g.sections||[]).map(c=>`<div class="bld-sw bld-gchild${bldSel===c.id?' sel':''}" data-sid="${c.id}">
    <div class="bld-ov">
      <button class="bld-ob" data-gc-edit="${c.id}" data-gc-grp="${g.id}">Edit</button>
      <button class="bld-ob rm" data-gc-del="${c.id}" data-gc-grp="${g.id}">✕</button>
    </div>
    ${bRender(c,bldState)}
  </div>`).join('');
  return `<details class="bld-group-details" ${open?'open':''}><summary class="bld-group-summary" style="color:${bRgb(bldState.text||__SITE__.text,.75)};font-family:'${bldState.font||'Josefin Sans'}',sans-serif;">${bE(g.label||'Group')}<span style="font-size:.65rem;color:${bRgb(bldState.accent||__SITE__.accent,.4)};">▾</span></summary><div class="bld-group-body">${children||`<div class="bld-group-empty">Empty — edit group to add sections</div>`}</div></details>`;
}

function bldThemeFromState() {
  document.getElementById('bldBg').value=bldState.bg||__SITE__.bg;
  document.getElementById('bldAccent').value=bldState.accent||__SITE__.accent;
  document.getElementById('bldText').value=bldState.text||__SITE__.text;
  document.getElementById('bldFont').value=bldState.font||'Josefin Sans';
  bldBgControls();
}

function bldBgControls() {
  const style = bldState.bg_style || 'solid';
  document.getElementById('bldBgStyle').value = style;
  document.getElementById('bldBgColor2').value = bldState.bg_color2 || '#0a1f12';
  document.getElementById('bldBgAngle').value = bldState.bg_angle || '135';
  document.getElementById('bldBgImage').value = bldState.bg_image || '';
  document.getElementById('bldBgOverlay').value = bldState.bg_overlay || '0.4';
  document.getElementById('bldBgAnim').checked = !!bldState.bg_anim;
  const show = (id, on) => document.getElementById(id).style.display = on ? '' : 'none';
  show('bldBgColor2Wrap', style==='gradient');
  show('bldBgAngleWrap',  style==='gradient');
  show('bldBgImageWrap',  style==='image');
  show('bldBgOverlayWrap',style==='image');
  show('bldBgAnimWrap',   style==='gradient'||style==='aurora');
}

function bldBgCss() {
  const s = bldState, bg = s.bg||__SITE__.bg, ac = s.accent||__SITE__.accent;
  if (s.bg_style==='gradient') return `linear-gradient(${s.bg_angle||135}deg, ${bg}, ${s.bg_color2||ac})`;
  if (s.bg_style==='aurora') return `radial-gradient(40% 50% at 20% 25%, ${bRgb(ac,.18)}, transparent 60%), radial-gradient(45% 55% at 80% 30%, ${bRgb(ac,.14)}, transparent 60%), ${bg}`;
  if (s.bg_style==='image' && s.bg_image) return `linear-gradient(rgba(0,0,0,${s.bg_overlay||.4}),rgba(0,0,0,${s.bg_overlay||.4})), url('${String(s.bg_image).replace(/'/g,'%27')}') center/cover no-repeat`;
  return bg;
}

function bldDrawPages() {
  const list=document.getElementById('bldPageList');
  list.innerHTML=bldPages.map(p=>`
    <div class="bld-pi${bldPageId===p.id?' sel':''}" data-pid="${p.id}">
      <div style="min-width:0;flex:1;">
        <div class="bld-pi-t">${escHtml(p.title)}</div>
        <div class="bld-pi-s">${escHtml(p.slug)}</div>
      </div>
      ${bldPageUnsaved(p)?`<span class="bld-pi-unsaved" data-discard="${p.id}" title="Discard unsaved changes">!</span>`:''}
      ${p.slug!=='/'&&p.slug!=='__404__'?`<button class="bld-pi-del" data-pdel="${p.id}" title="Delete">✕</button>`:''}
    </div>`).join('');
  list.querySelectorAll('.bld-pi').forEach(el => el.addEventListener('click', e => {
    if (e.target.closest('.bld-pi-del') || e.target.closest('[data-discard]')) return;
    bldPickPage(+el.dataset.pid);
  }));
  list.querySelectorAll('[data-discard]').forEach(badge => badge.addEventListener('click', async e => {
    e.stopPropagation();
    const pid = +badge.dataset.discard;
    if (!await dlg.confirm('Discard unsaved changes for this page? It will revert to the last published version.', { confirm: 'Discard', danger: true })) return;
    bldClearDraft(pid);
    if (pid === bldPageId) {

      const p = bldPages.find(x => x.id === pid);
      try { bldState = { bg:__SITE__.bg,accent:__SITE__.accent,text:__SITE__.text,font:'Josefin Sans',sections:[], ...JSON.parse(p.page_json||'{}') }; }
      catch { bldState = { bg:__SITE__.bg,accent:__SITE__.accent,text:__SITE__.text,font:'Josefin Sans',sections:[] }; }
      bldSel = null; bldParentId = null;
      _lastDraftJson = JSON.stringify(bldState);
      bldThemeFromState(); bldDrawCanvas(); bldDrawEditor();
      bldSetAutosave('saved');
    }
    bldDrawPages();
    toast('Draft discarded');
  }));
  list.querySelectorAll('[data-pdel]').forEach(btn => btn.addEventListener('click', async e => {
    e.stopPropagation();
    const p=bldPages.find(x=>x.id===+btn.dataset.pdel);
    if (!p) return;
    if (!await dlg.confirm(`Delete page "${p.title}"?`, { danger: true, confirm: 'Delete' })) return;
    await fetch(`/api/pages/${p.id}`,{method:'DELETE',headers:authHeaders()});
    bldClearDraft(p.id);
    bldPages=bldPages.filter(x=>x.id!==p.id);
    if (bldPageId===p.id) { bldPageId=bldPages[0]?.id||null; if (bldPageId) bldPickPage(bldPageId); else bldDrawCanvas(); }
    bldDrawPages();
  }));
}

function bldPickPage(id) {
  bldPageId=id; bldSel=null;
  const p=bldPages.find(x=>x.id===id); if (!p) return;
  try { bldState={bg:__SITE__.bg,accent:__SITE__.accent,text:__SITE__.text,font:'Josefin Sans',sections:[],...JSON.parse(p.page_json||'{}')}; }
  catch(e) { bldState={bg:__SITE__.bg,accent:__SITE__.accent,text:__SITE__.text,font:'Josefin Sans',sections:[]}; }

  try {
    const raw = _ls.getItem(bldDraftKey(id));
    if (raw) {
      const draft = JSON.parse(raw);
      const fresh = draft && draft.ts && (Date.now() - draft.ts < 24*3600*1000);
      if (fresh && JSON.stringify(draft.state) !== (p.page_json || '')) {
        bldState = draft.state;
        setTimeout(() => toast('Restored unsaved draft (' + timeAgo(new Date(draft.ts).toISOString()) + ')'), 300);
      } else if (!fresh) {
        bldClearDraft(id);
      }
    }
  } catch {}
  bldThemeFromState();
  _lastDraftJson = JSON.stringify(bldState);  // baseline so we don't spuriously re-save on open
  bldSetAutosave('saved');
  const slug=p.slug==='/'?'/':'/'+p.slug.replace(/^\//,'');
  document.getElementById('bldChromeUrl').textContent='lanson.pages.dev'+slug;
  bldDrawPages(); bldDrawCanvas(); bldDrawEditor();
}

function bldDrawCanvas() {
  const el=document.getElementById('bldCanvas'); if (!el) return;
  bldSaveDraft();   // persist on every canvas change
  el.style.background=bldBgCss();
  if (!bldState.sections||!bldState.sections.length) {
    el.innerHTML=`<div class="bld-canvas-empty" style="color:${bRgb(bldState.accent||__SITE__.accent,.18)}">Add a section below to build this page</div>`;
    return;
  }
  function swHtml(s) {
    const wLabel=s.width==='half'?'½':s.width==='third'?'⅓':'Full';
    const inner=s.type==='group'?groupCanvasHtml(s):bRender(s,bldState);
    return `<div class="bld-sw${bldSel===s.id?' sel':''}" data-sid="${s.id}" draggable="true">
      <div class="bld-ov">
        <span class="bld-drag-handle" title="Drag to reorder">⠿</span>
        <button class="bld-ob bld-w-tog" data-wtog="${s.id}" title="Change column width">${wLabel}</button>
        <button class="bld-ob" data-edit="${s.id}">Edit</button>
        <button class="bld-ob rm" data-del="${s.id}">✕</button>
      </div>
      ${inner}
    </div>`;
  }
  const rows=groupRows(bldState.sections);
  el.innerHTML=rows.map(row=>{
    if (row.length===1) {
      const s=row[0], w=s.width||'full';
      if (w==='full') return swHtml(s);

      const needed=w==='third'?3:2;
      const slot=`<div style="flex:1;min-width:0;border:1px dashed rgba(var(--accent-rgb),.1);display:flex;align-items:center;justify-content:center;font-size:.5rem;letter-spacing:.18em;text-transform:uppercase;color:rgba(var(--accent-rgb),.18);min-height:60px;">Drag section here</div>`;
      return `<div style="display:flex;gap:.4rem;align-items:stretch;"><div style="flex:1;min-width:0;">${swHtml(s)}</div>${slot.repeat(needed-1)}</div>`;
    }
    return `<div style="display:flex;gap:.4rem;align-items:stretch;">${row.map(s=>`<div style="flex:1;min-width:0;">${swHtml(s)}</div>`).join('')}</div>`;
  }).join('');
  el.querySelectorAll('[data-edit]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();bldSel=b.dataset.edit;bldParentId=null;bldDrawCanvas();bldDrawEditor();}));
  el.querySelectorAll('[data-del]').forEach(b=>b.addEventListener('click',e=>{
    e.stopPropagation();
    bldState.sections=bldState.sections.filter(x=>x.id!==b.dataset.del);
    if (bldSel===b.dataset.del){bldSel=null;bldParentId=null;}
    bldDrawCanvas(); bldDrawEditor();
  }));
  el.querySelectorAll('[data-wtog]').forEach(b=>b.addEventListener('click',e=>{
    e.stopPropagation();
    const sec=bldState.sections.find(s=>s.id===b.dataset.wtog); if (!sec) return;
    const cur=sec.width||'full';
    sec.width=cur==='full'?'half':cur==='half'?'third':'full';
    bldSel=sec.id; bldParentId=null; bldDrawCanvas(); bldDrawEditor();
  }));

  el.querySelectorAll('[data-gc-edit]').forEach(b=>b.addEventListener('click',e=>{
    e.stopPropagation();
    bldParentId=b.dataset.gcGrp; bldSel=b.dataset.gcEdit;
    bldDrawCanvas(); bldDrawEditor();
  }));
  el.querySelectorAll('[data-gc-del]').forEach(b=>b.addEventListener('click',e=>{
    e.stopPropagation();
    const grp=bldState.sections.find(s=>s.id===b.dataset.gcGrp); if (!grp) return;
    grp.sections=(grp.sections||[]).filter(c=>c.id!==b.dataset.gcDel);
    if (bldSel===b.dataset.gcDel){bldSel=grp.id;bldParentId=null;}
    bldDrawCanvas(); bldDrawEditor();
  }));
  bSetupDnD(el, bldState.sections, (newId)=>{bldSel=newId;bldParentId=null;bldDrawCanvas();bldDrawEditor();});
  initCarousels(el);
}

function bldPatch(s) {
  if (s.type==='group') { bldDrawCanvas(); return; }
  const w=document.querySelector(`#bldCanvas .bld-sw[data-sid="${s.id}"]`); if (!w){bldDrawCanvas();return;}
  const ov=w.querySelector('.bld-ov'); w.innerHTML=''; if(ov)w.appendChild(ov);
  w.insertAdjacentHTML('beforeend',bRender(s,bldState));
  initCarousels(w);
}


function bldDrawEditor() {
  const panel=document.getElementById('bldEditor'); if (!panel) return;
  if (!bldSel) {
    if (bldPageId) {
      panel.innerHTML=`<div class="bld-ep"><div class="bld-ep-head">Page <span class="bld-ep-type">Settings</span></div><div class="bld-ef"><label>Browser Tab Title</label><input type="text" id="pgTitle" value="${bA(bldState.page_title||'')}" placeholder="Defaults to page name" /></div><div class="bld-ef"><label>Meta Description</label><input type="text" id="pgSub" value="${bA(bldState.page_subtitle||'')}" /></div><div class="bld-ef"><label>Show in nav bar</label><select id="pgNav"><option value="yes"${bldState.show_in_nav!==false?' selected':''}>Yes — show in nav</option><option value="no"${bldState.show_in_nav===false?' selected':''}>No — hide from nav</option></select></div><div class="bld-sep" style="margin:.6rem 0;"></div><p style="font-weight:100;font-size:.62rem;letter-spacing:.06em;color:var(--muted);line-height:1.8;">Hover a section and click <strong style="color:rgba(77,189,106,.6);font-weight:300;">Edit</strong> to change its content.</p></div>`;
      panel.querySelector('#pgTitle').addEventListener('input',e=>{bldState.page_title=e.target.value;bldSaveDraft();});
      panel.querySelector('#pgSub').addEventListener('input',e=>{bldState.page_subtitle=e.target.value;bldSaveDraft();});
      panel.querySelector('#pgNav').addEventListener('change',e=>{
        bldState.show_in_nav=(e.target.value==='yes');
        e.target.value = bldState.show_in_nav ? 'yes' : 'no';   // lock the visible value
        bldSaveDraft();
      });
    } else {
      panel.innerHTML='<p class="bld-editor-hint">Select or create a page to get started.</p>';
    }
    return;
  }
  let s, parentGroup=null;
  if (bldParentId) {
    parentGroup=bldState.sections.find(g=>g.id===bldParentId);
    s=parentGroup?(parentGroup.sections||[]).find(c=>c.id===bldSel):null;
  } else {
    s=bldState.sections.find(x=>x.id===bldSel);
  }
  if (!s) return;
  const {html,label}=bEditorFields(s);
  const backBtn=parentGroup?`<button class="btn btn-xs" id="bEdBack" style="margin-bottom:.6rem;width:100%;">← Back to group</button>`:'';
  panel.innerHTML=`<div class="bld-ep">${backBtn}<div class="bld-ep-head">${label} <span class="bld-ep-type">${parentGroup?'in Group':'Section'}</span></div>${html}</div>`;
  if (parentGroup) {
    panel.querySelector('#bEdBack')?.addEventListener('click',()=>{bldSel=parentGroup.id;bldParentId=null;bldDrawEditor();});
  }
  bBindEditor(panel, s, (sec, extra) => {
    if (parentGroup) { bldDrawCanvas(); } else { bldPatch(sec); }
    if (extra==='re-editor') bldDrawEditor();
  });
}

async function bldBoot() {
  if (bldBooted) return; bldBooted=true;

  document.getElementById('bldBg').addEventListener('input',e=>{bldState.bg=e.target.value;bldDrawCanvas();});
  document.getElementById('bldAccent').addEventListener('input',e=>{bldState.accent=e.target.value;bldDrawCanvas();if(bldSel)bldDrawEditor();});
  document.getElementById('bldText').addEventListener('input',e=>{bldState.text=e.target.value;bldDrawCanvas();});
  document.getElementById('bldFont').addEventListener('change',e=>{bldState.font=e.target.value;bldDrawCanvas();});

  document.getElementById('bldBgStyle').addEventListener('change',e=>{bldState.bg_style=e.target.value;bldBgControls();bldDrawCanvas();});
  document.getElementById('bldBgColor2').addEventListener('input',e=>{bldState.bg_color2=e.target.value;bldDrawCanvas();});
  document.getElementById('bldBgAngle').addEventListener('input',e=>{bldState.bg_angle=e.target.value;bldDrawCanvas();});
  document.getElementById('bldBgImage').addEventListener('input',e=>{bldState.bg_image=e.target.value;bldDrawCanvas();});
  document.getElementById('bldBgOverlay').addEventListener('input',e=>{bldState.bg_overlay=e.target.value;bldDrawCanvas();});
  document.getElementById('bldBgAnim').addEventListener('change',e=>{bldState.bg_anim=e.target.checked;bldDrawCanvas();});

  document.getElementById('bldOpenPicker').addEventListener('click', bldOpenPicker);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') bldClosePicker(); });

  document.getElementById('bldAddPageBtn').addEventListener('click',()=>{
    const f=document.getElementById('bldNewPageForm');
    f.style.display=f.style.display==='none'?'':'none';
  });
  document.getElementById('bldNPCancel').addEventListener('click',()=>{
    document.getElementById('bldNewPageForm').style.display='none';
  });
  document.getElementById('bldNPCreate').addEventListener('click',async()=>{
    const title=document.getElementById('bldNPTitle').value.trim();
    const rawSlug=document.getElementById('bldNPSlug').value.trim();
    if (!title||!rawSlug) { toast('Title and slug are required.', true); return; }
    const slug=rawSlug.startsWith('/')?rawSlug:'/'+rawSlug;
    const initJson=JSON.stringify({bg:__SITE__.bg,accent:__SITE__.accent,text:__SITE__.text,font:'Josefin Sans',sections:[]});
    const res=await fetch('/api/pages',{method:'POST',headers:{...authHeaders(),'Content-Type':'application/json'},body:JSON.stringify({title,slug,page_json:initJson})});
    if (!res.ok) { const d=await res.json(); toast(d.error||'Error creating page.', true); return; }
    const data=await res.json();
    document.getElementById('bldNewPageForm').style.display='none';
    document.getElementById('bldNPTitle').value=''; document.getElementById('bldNPSlug').value='';
    bldPages.push({id:data.id,title,slug,page_json:initJson,is_published:1});
    bldDrawPages(); bldPickPage(data.id);
  });

  document.getElementById('bldPreview').addEventListener('click',()=>{
    const p=bldPages.find(x=>x.id===bldPageId); if (!p) return;
    window.open(p.slug==='/'?'/':'/'+p.slug.replace(/^\//,''),'_blank');
  });

  document.getElementById('bldPublish').addEventListener('click',async()=>{
    if (!bldPageId) { toast('No page selected.', true); return; }
    const sp=document.getElementById('bldSpinner'),btn=document.getElementById('bldPublish');
    sp.style.display='block'; btn.disabled=true;

    const tasks = [];
    const curP = bldPages.find(x=>x.id===bldPageId);
    if (curP) tasks.push({ id:bldPageId, title:curP.title, json:JSON.stringify(bldState) });
    for (const p of bldPages) {
      if (p.id === bldPageId) continue;
      try {
        const raw = _ls.getItem(bldDraftKey(p.id));
        if (raw) { const d = JSON.parse(raw); const j = JSON.stringify(d.state); if (j !== (p.page_json||'')) tasks.push({ id:p.id, title:p.title, json:j }); }
      } catch {}
    }

    let ok = 0, fail = 0;
    for (const t of tasks) {
      const res = await fetch(`/api/pages/${t.id}`,{method:'PUT',headers:{...authHeaders(),'Content-Type':'application/json'},body:JSON.stringify({title:t.title,page_json:t.json})});
      if (res.ok) { const idx=bldPages.findIndex(x=>x.id===t.id); if(idx>=0)bldPages[idx].page_json=t.json; bldClearDraft(t.id); ok++; }
      else fail++;
    }
    sp.style.display='none'; btn.disabled=false;
    bldDrawPages();
    if (fail) toast(`Published ${ok}, ${fail} failed.`, true);
    else toast(ok>1 ? `Published all ${ok} pages!` : 'Published!');
  });

}

async function bldLoadPages() {
  const loading=document.getElementById('bldLoading');
  loading.style.display='flex';
  const prevId=bldPageId;
  const res=await fetch('/api/pages',{headers:authHeaders()});
  if (res.ok) {
    bldPages=await res.json();
    if (!bldPages.find(p=>p.slug==='/')) {
      const sRes=await fetch('/api/settings');
      let existingJson='';
      if (sRes.ok) { const s=await sRes.json(); existingJson=s.page_json||''; }
      const initJson=existingJson||JSON.stringify({bg:__SITE__.bg,accent:__SITE__.accent,text:__SITE__.text,font:'Josefin Sans',sections:[]});
      const cr=await fetch('/api/pages',{method:'POST',headers:{...authHeaders(),'Content-Type':'application/json'},body:JSON.stringify({title:'Home',slug:'/',page_json:initJson})});
      if (cr.ok) { const d=await cr.json(); bldPages.unshift({id:d.id,title:'Home',slug:'/',page_json:initJson,is_published:1}); }
    }
  }
  loading.style.display='none';
  bldDrawPages();
  const toSelect=prevId&&bldPages.find(p=>p.id===prevId)?prevId:bldPages[0]?.id||null;
  if (toSelect) bldPickPage(toSelect);
}
