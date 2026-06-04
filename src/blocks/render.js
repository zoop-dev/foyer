




function bXtra(s, h) {
  const { E, A, rgb, md, accent, text, bg, font } = h;
  const f = `font-family:'${font}',sans-serif;`;
  const c = `color:${text};`;
  const narrow = s.width === 'half' || s.width === 'third';   // in a side-by-side row
  const PAD = (p) => { const v = p === 'sm' ? 2.25 : p === 'lg' ? 5.5 : 3.75; return (narrow ? v * 0.6 : v) + 'rem'; };
  const wrap = (inner, extra = '') => `<div style="${f}${c}padding:${PAD(s.pad)} ${narrow ? '1rem' : '1.5rem'};${extra}">${inner}</div>`;
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
      return `<div style="${f}${c}${bgStyle}min-height:${narrow ? 'auto' : mh};display:flex;flex-direction:column;align-items:${ai};justify-content:center;text-align:${align};padding:${narrow ? '2.5rem 1.1rem' : '4.5rem 1.5rem'};">
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
      if (!s.access_key) return wrap(cont(`<div style="text-align:center;border:1px dashed ${rgb(accent, .25)};border-radius:12px;padding:1.4rem;font-size:.82rem;color:${rgb(text, .45)};">Add your Web3Forms access key in this block’s settings to enable the form.</div>`, '520px'));
      const ist = `background:${rgb(text, .05)};border:1px solid ${rgb(accent, .2)};color:${text};font-family:inherit;font-size:.9rem;padding:.7rem .9rem;border-radius:8px;outline:none;`;
      return wrap(cont(`<div style="text-align:center;max-width:460px;margin:0 auto;">
        ${s.heading ? `<h3 style="font-size:1.3rem;font-weight:300;margin:0 0 .4rem;">${E(s.heading)}</h3>` : ''}
        ${s.sub ? `<p style="font-size:.9rem;font-weight:200;line-height:1.6;color:${rgb(text, .6)};margin:0;">${E(s.sub)}</p>` : ''}
        <form data-w3 data-done="You’re subscribed — thanks!" onsubmit="return false" style="display:flex;gap:.5rem;margin-top:1.2rem;flex-wrap:wrap;">
          <input type="hidden" name="access_key" value="${A(s.access_key)}" />
          <input type="hidden" name="subject" value="New newsletter signup" />
          <input type="checkbox" name="botcheck" style="display:none;" tabindex="-1" autocomplete="off" />
          <input type="email" name="email" required placeholder="${A(s.placeholder || 'you@email.com')}" style="flex:1;min-width:180px;${ist}" />
          <button type="submit" style="background:${accent};color:${bg};border:none;font-family:inherit;font-weight:400;font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;padding:.7rem 1.4rem;border-radius:8px;cursor:pointer;">${E(s.button || 'Subscribe')}</button>
        </form>
      </div>`, '520px'));
    }
    case 'contactform': {
      if (!s.access_key) return wrap(cont(`<div style="text-align:center;border:1px dashed ${rgb(accent, .25)};border-radius:12px;padding:1.4rem;font-size:.82rem;color:${rgb(text, .45)};">Add your Web3Forms access key in this block’s settings to enable the form.</div>`, '560px'));
      const inp = `width:100%;background:${rgb(text, .05)};border:1px solid ${rgb(accent, .2)};color:${text};font-family:inherit;font-size:.9rem;padding:.7rem .9rem;border-radius:8px;outline:none;`;
      const lbl = (fl) => `<label style="display:block;font-size:.7rem;letter-spacing:.05em;color:${rgb(text, .6)};margin-bottom:.35rem;">${E(fl.label || 'Field')}${fl.required === 'yes' ? ' <span style="color:' + accent + '">*</span>' : ''}</label>`;
      const fields = (items.length ? items : [{ ftype: 'text', label: 'Name', required: 'yes' }, { ftype: 'email', label: 'Email', required: 'yes' }, { ftype: 'textarea', label: 'Message', required: 'yes' }]).map(fl => {
        const nm = fl.ftype === 'email' ? 'email' : (fl.name || fl.label || 'field');
        const req = fl.required === 'yes' ? ' required' : '';
        const ph = A(fl.placeholder || '');
        const opts = String(fl.options || '').split('\n').map(o => o.trim()).filter(Boolean);
        const w = fl.width === 'half' ? '1 1 200px' : '1 1 100%';
        let inner;
        if (fl.ftype === 'textarea') inner = lbl(fl) + `<textarea name="${A(nm)}"${req} rows="5" placeholder="${ph}" style="${inp}resize:vertical;"></textarea>`;
        else if (fl.ftype === 'select') inner = lbl(fl) + `<select name="${A(nm)}"${req} style="${inp}"><option value="" disabled${fl.placeholder ? ' selected' : ''}>${E(fl.placeholder || 'Choose…')}</option>${opts.map(o => `<option value="${A(o)}">${E(o)}</option>`).join('')}</select>`;
        else if (fl.ftype === 'radio') inner = lbl(fl) + `<div style="display:flex;flex-direction:column;gap:.45rem;">${opts.map((o, j) => `<label style="display:flex;align-items:center;gap:.5rem;font-size:.85rem;font-weight:200;color:${rgb(text, .8)};"><input type="radio" name="${A(nm)}" value="${A(o)}"${req && j === 0 ? ' required' : ''} />${E(o)}</label>`).join('')}</div>`;
        else if (fl.ftype === 'checkboxes') inner = lbl(fl) + `<div style="display:flex;flex-direction:column;gap:.45rem;">${opts.map(o => `<label style="display:flex;align-items:center;gap:.5rem;font-size:.85rem;font-weight:200;color:${rgb(text, .8)};"><input type="checkbox" name="${A(nm)} (${A(o)})" value="Yes" />${E(o)}</label>`).join('')}</div>`;
        else if (fl.ftype === 'checkbox') inner = `<label style="display:flex;align-items:center;gap:.5rem;font-size:.85rem;font-weight:200;color:${rgb(text, .8)};"><input type="checkbox" name="${A(nm)}" value="Yes"${req} />${E(fl.label || 'I agree')}</label>`;
        else { const t = ['email', 'tel', 'number', 'url', 'date', 'time'].includes(fl.ftype) ? fl.ftype : 'text'; inner = lbl(fl) + `<input type="${t}" name="${A(nm)}"${req} placeholder="${ph}" style="${inp}" />`; }
        return `<div style="flex:${w};min-width:0;margin-bottom:.9rem;">${inner}</div>`;
      }).join('');
      return wrap(cont(`<div style="max-width:520px;margin:0 auto;">${secHead('center')}
        <form data-w3 data-done="Thanks — I’ll be in touch soon." onsubmit="return false">
          <input type="hidden" name="access_key" value="${A(s.access_key)}" />
          <input type="hidden" name="subject" value="${A(s.subject || 'New contact message')}" />
          <input type="checkbox" name="botcheck" style="display:none;" tabindex="-1" autocomplete="off" />
          <div style="display:flex;flex-wrap:wrap;gap:0 .8rem;">${fields}</div>
          <button type="submit" style="width:100%;margin-top:.4rem;background:${accent};color:${bg};border:none;font-family:inherit;font-weight:400;font-size:.8rem;letter-spacing:.1em;text-transform:uppercase;padding:.8rem;border-radius:8px;cursor:pointer;">${E(s.button || 'Send message')}</button>
        </form>
      </div>`, '560px'));
    }
    default: return '';
  }
}
