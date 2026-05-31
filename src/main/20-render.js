    function pgRenderSec(s, accent, text, font, bg) {
      const f = `font-family:'${font}',sans-serif;`;
      const c = `color:${text};`;
      bg = bg || '#020a03';
      switch (s.type) {
        case 'hero': {
          const ta = `text-align:${s.align||'center'};`;
          const sz = s.name_size==='sm'?'1.6rem':s.name_size==='md'?'2.2rem':s.name_size==='xl'?'clamp(3rem,10vw,5rem)':'clamp(1.9rem,8vw,3.2rem)';
          const fw = s.weight||'300';
          const ls2 = s.ls==='tight'?'-.03em':s.ls==='wide'?'.06em':'-.01em';
          const p = s.pad==='sm'?'2rem 2rem 1.5rem':s.pad==='lg'?'7rem 2rem 6rem':'4rem 2rem 3rem';
          const bgImg = s.bg_img?`background-image:url('${escAttr(s.bg_img)}');background-size:cover;background-position:center;position:relative;`:'';
          const overlay = s.bg_img?`<div style="position:absolute;inset:0;background:rgba(0,0,0,${s.bg_overlay||'0.45'});"></div>`:'';
          return `<div style="${f}${c}${bgImg}${ta}padding:${p};">${overlay}<div style="position:relative;">
            ${s.eyebrow?`<p style="font-size:.72rem;letter-spacing:.4em;text-transform:uppercase;color:${accent};margin-bottom:1rem;font-weight:200;">${pgE(s.eyebrow)}</p>`:''}
            <h1 style="font-size:${sz};font-weight:${fw};letter-spacing:${ls2};margin:0 0 .5rem;line-height:1.08;">${pgE(s.name||'')}</h1>
            ${s.tagline?`<p style="font-size:.95rem;font-weight:200;font-style:italic;color:${pgRgb(text,.52)};letter-spacing:.1em;margin-top:.3rem;">${pgE(s.tagline)}</p>`:''}
          </div></div>`;
        }
        case 'bio': {
          const ta = `text-align:${s.align||'left'};`;
          const mw = s.max_w==='narrow'?'360px':s.max_w==='wide'?'680px':s.max_w==='full'?'100%':'520px';
          const mc = s.align==='center'?'margin:0 auto;':'';
          const fs = s.fsize==='sm'?'.82rem':s.fsize==='lg'?'1.05rem':'.92rem';
          const lh = s.lh==='compact'?'1.55':s.lh==='relaxed'?'2.3':'1.9';
          const p = s.pad==='sm'?'1.2rem 2rem':s.pad==='lg'?'4.5rem 2rem':'2.5rem 2rem';
          const pr = s.photo_radius==='circle'?'50%':s.photo_radius==='sm'?'4px':s.photo_radius==='lg'?'12px':'0';
          const photoHtml = s.photo?`<img src="${escAttr(s.photo)}" alt="" style="width:${s.photo_size||'80px'};height:${s.photo_size||'80px'};object-fit:cover;border-radius:${pr};display:block;${s.align==='center'?'margin:0 auto 1.2rem;':'margin-bottom:1.2rem;'}" />`:'';
          return `<div style="${f}${c}${ta}padding:${p};">
            ${photoHtml}
            ${s.heading?`<h2 style="font-size:1.35rem;font-weight:300;letter-spacing:.04em;margin-bottom:1rem;">${pgE(s.heading)}</h2>`:''}
            <div class="md-content" style="font-weight:200;font-size:${fs};line-height:${lh};color:${pgRgb(text,.7)};max-width:${mw};${mc}">${md(s.body)}</div>
          </div>`;
        }
        case 'links': {
          const items = s.items||[];
          const p = s.pad==='sm'?'1rem 2rem':s.pad==='lg'?'4rem 2rem':'2rem 2rem';
          const ls = s.link_style||'card';
          let inner;
          const itTgt = it => it.new_tab!=='no' ? 'target="_blank" rel="noopener"' : '';
          if (ls==='minimal') {
            inner=items.map(it=>`<div style="border-bottom:1px solid ${pgRgb(accent,.12)};padding:.75rem 0;display:flex;align-items:center;justify-content:space-between;"><a href="${escAttr(it.u||'#')}" ${itTgt(it)} style="font-weight:300;font-size:.9rem;letter-spacing:.06em;color:${pgRgb(text,.88)};text-decoration:none;">${pgE(it.t||'')}</a>${it.d?`<span style="font-size:.62rem;color:${pgRgb(accent,.42)};">${pgE(it.d)}</span>`:''}</div>`).join('');
          } else if (ls==='pill') {
            inner=`<div style="display:flex;flex-direction:column;gap:.5rem;">${items.map(it=>`<a href="${escAttr(it.u||'#')}" ${itTgt(it)} style="display:block;border:1px solid ${pgRgb(accent,.18)};background:${pgRgb(accent,.04)};padding:.8rem 1.4rem;border-radius:40px;text-decoration:none;"><div style="font-weight:300;font-size:.9rem;letter-spacing:.06em;color:${pgRgb(text,.88)};">${pgE(it.t||'')}</div>${it.d?`<div style="font-size:.62rem;font-weight:200;color:${pgRgb(accent,.42)};margin-top:.15rem;">${pgE(it.d)}</div>`:''}</a>`).join('')}</div>`;
          } else {
            inner=`<div style="display:flex;flex-direction:column;gap:.52rem;">${items.map(it=>`<a href="${escAttr(it.u||'#')}" ${itTgt(it)} style="display:block;border:1px solid ${pgRgb(accent,.15)};background:${pgRgb(accent,.03)};padding:.85rem 1.2rem;text-decoration:none;"><div style="font-weight:300;font-size:.9rem;letter-spacing:.06em;color:${pgRgb(text,.88)};">${pgE(it.t||'')}</div>${it.d?`<div style="font-size:.62rem;font-weight:200;color:${pgRgb(accent,.42)};margin-top:.18rem;">${pgE(it.d)}</div>`:''}</a>`).join('')}</div>`;
          }
          return `<div style="${f}${c}padding:${p};">${inner}</div>`;
        }
        case 'contact': {
          const rawItems = s.items || (s.email||s.phone ? [...(s.email?[{label:'Email',val:s.email,href:`mailto:${s.email}`}]:[]),...(s.phone?[{label:'Phone',val:s.phone,href:`tel:${s.phone}`}]:[])] : []);
          const rows = rawItems.map(it => [it.label||'', it.href||'', it.val||'']);
          const ai = s.align==='left'?'flex-start':s.align==='right'?'flex-end':'center';
          const p = s.pad==='sm'?'1.5rem 2rem':s.pad==='lg'?'4.5rem 2rem':'2.5rem 2rem';
          const cst = s.cstyle||'normal';
          const subLine = sub => sub ? `<span style="display:block;font-size:.62rem;font-weight:200;letter-spacing:.06em;color:${pgRgb(accent,.42)};margin-top:.12rem;">${pgE(sub)}</span>` : '';
          let inner;
          if (cst==='stacked') {
            inner=rawItems.map(it=>`<div style="display:flex;flex-direction:column;gap:.2rem;"><span style="font-size:.55rem;letter-spacing:.3em;text-transform:uppercase;color:${pgRgb(accent,.4)};font-weight:200;">${pgE(it.label||'')}</span><span style="font-size:.95rem;font-weight:300;letter-spacing:.06em;color:${pgRgb(text,.88)};">${pgE(it.val||'')}</span>${subLine(it.sub)}</div>`).join('');
          } else if (cst==='minimal') {
            inner=rawItems.map(it=>`<div><a href="${escAttr(it.href||'')}" style="font-size:.95rem;font-weight:300;letter-spacing:.06em;color:${pgRgb(text,.82)};text-decoration:none;">${pgE(it.val||'')}</a>${subLine(it.sub)}</div>`).join('');
          } else {
            inner=rawItems.map(it=>`<div style="display:flex;align-items:baseline;gap:1rem;"><span style="font-size:.65rem;letter-spacing:.26em;text-transform:uppercase;color:${pgRgb(accent,.38)};min-width:3rem;text-align:right;font-weight:200;">${pgE(it.label||'')}</span><div><a href="${escAttr(it.href||'')}" style="font-size:.92rem;font-weight:300;letter-spacing:.06em;color:${pgRgb(text,.85)};text-decoration:none;">${pgE(it.val||'')}</a>${subLine(it.sub)}</div></div>`).join('');
          }
          return `<div style="${f}${c}padding:${p};text-align:${s.align||'center'};"><div style="display:flex;flex-direction:column;align-items:${ai};gap:.8rem;">${inner}</div></div>`;
        }
        case 'quote': {
          const p = s.pad==='sm'?'1.5rem 2rem':s.pad==='lg'?'5rem 2rem':'3rem 2rem';
          const v = s.variant||'border';
          if (v==='centered') return `<div style="${f}${c}padding:${p};text-align:center;"><div style="max-width:480px;margin:0 auto;"><p style="font-size:2.5rem;font-weight:200;line-height:1;color:${pgRgb(accent,.3)};margin-bottom:.5rem;">"</p><p style="font-size:1rem;font-weight:200;line-height:1.85;color:${pgRgb(text,.75)};font-style:italic;">${pgE(s.quote||'')}</p>${s.attribution?`<cite style="display:block;margin-top:.8rem;font-size:.67rem;font-weight:200;letter-spacing:.2em;text-transform:uppercase;color:${pgRgb(accent,.45)};font-style:normal;">— ${pgE(s.attribution)}</cite>`:''}</div></div>`;
          if (v==='minimal') return `<div style="${f}${c}padding:${p};max-width:480px;margin:0 auto;"><p style="font-size:1rem;font-weight:200;line-height:1.85;color:${pgRgb(text,.72)};font-style:italic;">${pgE(s.quote||'')}</p>${s.attribution?`<cite style="display:block;margin-top:.6rem;font-size:.67rem;font-weight:200;letter-spacing:.2em;text-transform:uppercase;color:${pgRgb(accent,.38)};font-style:normal;">— ${pgE(s.attribution)}</cite>`:''}</div>`;
          return `<div style="${f}${c}padding:${p};text-align:center;"><blockquote style="border-left:2px solid ${pgRgb(accent,.4)};padding:1rem 1.5rem;text-align:left;max-width:440px;margin:0 auto;"><p style="font-size:1rem;font-weight:200;font-style:italic;line-height:1.85;color:${pgRgb(text,.75)};">"${pgE(s.quote||'')}"</p>${s.attribution?`<cite style="display:block;margin-top:.7rem;font-size:.67rem;font-weight:200;letter-spacing:.2em;text-transform:uppercase;color:${pgRgb(accent,.45)};font-style:normal;">— ${pgE(s.attribution)}</cite>`:''}</blockquote></div>`;
        }
        case 'heading': {
          const sz = s.size==='xl'?'2.4rem':s.size==='sm'?'1rem':'1.5rem';
          const fw = s.weight||'300';
          const ls = s.ls==='tight'?'-.02em':s.ls==='wide'?'.15em':s.ls==='ultra'?'.35em':'.04em';
          const p = s.pad==='sm'?'1.2rem 2rem .4rem':s.pad==='lg'?'4.5rem 2rem 1.5rem':'2.5rem 2rem .8rem';
          return `<div style="${f}${c}padding:${p};text-align:${s.align||'left'};"><h2 style="font-size:${sz};font-weight:${fw};letter-spacing:${ls};margin:0;">${pgE(s.text||'')}</h2></div>`;
        }
        case 'text': {
          const ta = `text-align:${s.align||'left'};`;
          const fs = s.fsize==='sm'?'.8rem':s.fsize==='lg'?'1.05rem':'.92rem';
          const lh = s.lh==='compact'?'1.55':s.lh==='relaxed'?'2.3':'1.9';
          const mw = s.max_w==='narrow'?'360px':s.max_w==='wide'?'680px':s.max_w==='full'?'100%':'520px';
          const mc = s.align==='center'?'margin:0 auto;':'';
          const p = s.pad==='sm'?'.8rem 2rem':s.pad==='lg'?'3rem 2rem':'1.4rem 2rem';
          return `<div style="${f}${c}${ta}padding:${p};"><div class="md-content" style="font-weight:200;font-size:${fs};line-height:${lh};color:${pgRgb(text,.7)};max-width:${mw};${mc}">${md(s.text)}</div></div>`;
        }
        case 'social': {
          const items = s.items||[];
          const jc = s.align==='left'?'flex-start':s.align==='right'?'flex-end':'center';
          const p = s.pad==='sm'?'1rem 2rem':s.pad==='lg'?'4rem 2rem':'2rem 2rem';
          const bs = s.btn_style||'outline';
          const btnCss = bs==='solid'?`background:${accent};color:${bg};border:none;padding:.4rem .9rem;`:bs==='minimal'?`background:none;border:none;color:${accent};padding:.4rem .6rem;`:bs==='pill'?`background:none;border:1px solid ${pgRgb(accent,.25)};color:${accent};border-radius:40px;padding:.4rem .9rem;`:`background:none;border:1px solid ${pgRgb(accent,.22)};color:${accent};padding:.4rem .9rem;`;
          return `<div style="${f}${c}padding:${p};text-align:${s.align||'center'};"><div style="display:flex;flex-wrap:wrap;gap:.6rem;justify-content:${jc};">${items.map(it=>`<a href="${escAttr(it.url||'#')}" target="_blank" rel="noopener" style="${btnCss}font-weight:200;font-size:.7rem;letter-spacing:.2em;text-transform:uppercase;text-decoration:none;display:inline-block;">${pgE(it.label||'')}</a>`).join('')}</div></div>`;
        }
        case 'cta': {
          const ta = `text-align:${s.align||'center'};`;
          const p = s.pad==='sm'?'1.5rem 2rem':s.pad==='lg'?'5.5rem 2rem':'3rem 2rem';
          const bs = s.btn_style||'solid';
          const bsz = s.btn_size==='sm'?'.5rem 1.3rem':s.btn_size==='lg'?'.9rem 2.8rem':'.7rem 2rem';
          const btnCss = bs==='outline'?`background:transparent;border:1px solid ${accent};color:${accent};`:bs==='ghost'?`background:transparent;border:1px solid ${pgRgb(text,.25)};color:${text};`:`background:${accent};border:1px solid ${accent};color:${bg};`;
          return `<div style="${f}${c}${ta}padding:${p};">${s.text?`<p style="font-size:1.05rem;font-weight:200;line-height:1.75;color:${pgRgb(text,.75)};margin-bottom:1.5rem;">${pgE(s.text)}</p>`:''}${s.button_label?`<a href="${escAttr(s.button_url||'#')}" target="_blank" rel="noopener" style="display:inline-block;font-weight:300;font-size:.78rem;letter-spacing:.25em;text-transform:uppercase;padding:${bsz};text-decoration:none;${btnCss}">${pgE(s.button_label)}</a>`:''}</div>`;
        }
        case 'image': {
          const mw = s.size==='sm'?'280px':s.size==='md'?'420px':'100%';
          const r = s.radius==='sm'?'4px':s.radius==='lg'?'12px':s.radius==='circle'?'999px':'0';
          const ai = s.align==='left'?'flex-start':s.align==='right'?'flex-end':'center';
          const p = s.pad==='sm'?'1rem 2rem':s.pad==='lg'?'4rem 2rem':'2rem 2rem';
          return `<div style="${f}${c}padding:${p};display:flex;flex-direction:column;align-items:${ai};">${s.url?`<img src="${escAttr(s.url)}" alt="${escAttr(s.caption||'')}" style="max-width:${mw};width:100%;display:block;object-fit:cover;border-radius:${r};" />`:''}${s.caption?`<p style="font-size:.67rem;font-weight:200;letter-spacing:.1em;color:${pgRgb(text,.38)};margin-top:.5rem;">${pgE(s.caption)}</p>`:''}</div>`;
        }
        case 'stats': {
          const items = s.items||[];
          const p = s.pad==='sm'?'1.5rem 2rem':s.pad==='lg'?'4.5rem 2rem':'2.5rem 2rem';
          const cols = s.cols==='2'?'repeat(2,1fr)':s.cols==='3'?'repeat(3,1fr)':s.cols==='4'?'repeat(4,1fr)':'';
          const gs = cols?`display:grid;grid-template-columns:${cols};gap:2rem;`:'display:flex;flex-wrap:wrap;gap:2rem;justify-content:center;';
          return `<div style="${f}${c}padding:${p};text-align:center;"><div style="${gs}">${items.map(it=>`<div><div style="font-size:clamp(2rem,6vw,3rem);font-weight:300;letter-spacing:-.02em;color:${accent};">${pgE(it.number||'')}</div><div style="font-size:.65rem;font-weight:200;letter-spacing:.2em;text-transform:uppercase;color:${pgRgb(text,.45)};margin-top:.35rem;">${pgE(it.label||'')}</div></div>`).join('')}</div></div>`;
        }
        case 'divider': {
          const sp = s.spacing==='sm'?'.8rem':s.spacing==='lg'?'3rem':'1.8rem';
          const bg2 = s.style==='fade'?`linear-gradient(90deg,transparent,${pgRgb(accent,.38)},transparent)`:pgRgb(accent,.28);
          const w = s.style==='short'?'2rem':'100%';
          return `<div style="padding:${sp} 2rem;"><div style="width:${w};height:1px;margin:0 auto;background:${bg2};"></div></div>`;
        }
        case 'spacer': {
          const h = s.size==='sm'?'1rem':s.size==='lg'?'4rem':s.size==='xl'?'7rem':'2.5rem';
          return `<div style="height:${h};"></div>`;
        }
        case 'link': {
          const ta = `text-align:${s.align||'center'};`;
          const p = s.pad==='sm'?'1rem 2rem':s.pad==='lg'?'3.5rem 2rem':'2rem 2rem';
          const sty = s.style||'pill';
          const sz = s.size==='sm'?'.5rem 1.4rem':s.size==='lg'?'.9rem 2.8rem':'.7rem 2rem';
          const target = s.new_tab!=='no'?'target="_blank" rel="noopener"':'';
          let bc;
          if (sty==='solid') bc=`background:${accent};color:${bg};border:none;`;
          else if (sty==='ghost') bc=`background:transparent;border:1px solid ${pgRgb(text,.25)};color:${text};`;
          else if (sty==='underline') bc=`background:none;border:none;border-bottom:1px solid ${pgRgb(accent,.5)};color:${accent};padding-bottom:.2rem;border-radius:0;`;
          else if (sty==='badge') bc=`background:${pgRgb(accent,.12)};border:1px solid ${pgRgb(accent,.25)};color:${accent};`;
          else bc=`background:none;border:1px solid ${pgRgb(accent,.3)};color:${accent};border-radius:40px;`;
          return `<div style="${f}${c}${ta}padding:${p};"><a href="${escAttr(s.url||'#')}" ${target} style="${bc}display:inline-block;font-weight:300;font-size:.78rem;letter-spacing:.2em;text-transform:uppercase;padding:${sz};text-decoration:none;">${pgE(s.label||'Visit →')}</a></div>`;
        }
        case 'cards': {
          const items=s.items||[];
          const p=s.pad==='sm'?'1rem 2rem':s.pad==='lg'?'4rem 2rem':'2rem 2rem';
          const layout=s.layout||'grid-2';
          const r=s.radius==='sm'?'4px':s.radius==='lg'?'12px':'0';
          const cImg=(it,h='140px')=>it.img
            ?`<img src="${escAttr(it.img)}" alt="${escAttr(it.title||'')}" style="width:100%;height:${h};object-fit:cover;display:block;border-radius:${r};" />`
            :`<div style="width:100%;height:${h};background:${pgRgb(accent,.06)};border:1px dashed ${pgRgb(accent,.15)};border-radius:${r};"></div>`;
          const cText=(it)=>(it.title||it.body)?`<div style="padding:.65rem 0;">${it.title?`<div style="font-weight:300;font-size:.85rem;letter-spacing:.04em;color:${pgRgb(text,.9)};margin-bottom:.25rem;">${pgE(it.title)}</div>`:''} ${it.body?`<div style="font-weight:200;font-size:.76rem;line-height:1.7;color:${pgRgb(text,.52)};">${pgE(it.body)}</div>`:''}</div>`:' ';
          const cOpen=(it,sty='')=>it.url?`<a href="${escAttr(it.url)}" ${it.new_tab!=='no'?'target="_blank" rel="noopener"':''} style="${sty}display:block;text-decoration:none;">`:`<div style="${sty}">`;
          const cClose=(it)=>it.url?'</a>':'</div>';
          let inner;
          if (layout==='grid-2') {
            inner=`<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:1.2rem;">${items.map(it=>`${cOpen(it)}${cImg(it)}${cText(it)}${cClose(it)}`).join('')}</div>`;
          } else if (layout==='grid-3') {
            inner=`<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;">${items.map(it=>`${cOpen(it)}${cImg(it,'110px')}${cText(it)}${cClose(it)}`).join('')}</div>`;
          } else if (layout==='grid-4') {
            inner=`<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:.7rem;">${items.map(it=>`${cOpen(it)}${cImg(it,'80px')}${it.title?`<div style="font-weight:300;font-size:.7rem;letter-spacing:.04em;color:${pgRgb(text,.85)};margin-top:.38rem;">${pgE(it.title)}</div>`:' '}${cClose(it)}`).join('')}</div>`;
          } else if (layout==='feature') {
            const [first,...rest]=items;
            inner=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">${first?`<div style="grid-row:1/span ${Math.max(2,rest.length)};">${cOpen(first)}${cImg(first,'100%')}${cText(first)}${cClose(first)}</div>`:''}${rest.map(it=>`<div>${cOpen(it)}${cImg(it,'110px')}${cText(it)}${cClose(it)}</div>`).join('')}</div>`;
          } else if (layout==='horizontal') {
            inner=items.map(it=>`${cOpen(it,`display:grid;grid-template-columns:2fr 3fr;gap:1.2rem;align-items:center;padding:.75rem;border:1px solid ${pgRgb(accent,.09)};margin-bottom:.65rem;`)}${cImg(it,'100px')}<div>${it.title?`<div style="font-weight:300;font-size:.88rem;letter-spacing:.04em;color:${pgRgb(text,.9)};margin-bottom:.28rem;">${pgE(it.title)}</div>`:''} ${it.body?`<div style="font-weight:200;font-size:.76rem;line-height:1.7;color:${pgRgb(text,.52)};">${pgE(it.body)}</div>`:''}</div>${cClose(it)}`).join('');
          } else {
            inner=`<div style="display:flex;flex-direction:column;">${items.map(it=>`${cOpen(it,`display:flex;gap:.9rem;align-items:center;padding:.55rem 0;border-bottom:1px solid ${pgRgb(accent,.07)};`)} <div style="flex-shrink:0;width:68px;height:50px;overflow:hidden;border-radius:${r};">${it.img?`<img src="${escAttr(it.img)}" alt="" style="width:100%;height:100%;object-fit:cover;" />`:`<div style="width:100%;height:100%;background:${pgRgb(accent,.06)};"></div>`}</div><div style="flex:1;min-width:0;">${it.title?`<div style="font-weight:300;font-size:.82rem;letter-spacing:.04em;color:${pgRgb(text,.88)};margin-bottom:.15rem;">${pgE(it.title)}</div>`:''} ${it.body?`<div style="font-weight:200;font-size:.7rem;line-height:1.6;color:${pgRgb(text,.5)};">${pgE(it.body)}</div>`:''}</div>${cClose(it)}`).join('')}</div>`;
          }
          return `<div style="${f}${c}padding:${p};">${inner}</div>`;
        }
        case 'gallery': {
          const items = s.items||[];
          const cols = s.cols==='2'?2:s.cols==='4'?4:3;
          const gap = s.gap==='sm'?'.3rem':s.gap==='lg'?'1rem':'.5rem';
          const h = s.height==='sm'?'120px':s.height==='lg'?'280px':'180px';
          const p = s.pad==='sm'?'1rem 2rem':s.pad==='lg'?'4rem 2rem':'2rem 2rem';
          const r2 = s.radius==='sm'?'4px':s.radius==='lg'?'12px':'0';
          const inner = `<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:${gap};">${items.map(it=>{
            const wrap = it.url?`<a href="${escAttr(it.url)}" target="_blank" rel="noopener" style="display:block;overflow:hidden;border-radius:${r2};">`:`<div style="overflow:hidden;border-radius:${r2};">`;
            const close = it.url?'</a>':'</div>';
            return `${wrap}${it.img?`<img src="${escAttr(it.img)}" alt="${escAttr(it.caption||'')}" style="width:100%;height:${h};object-fit:cover;display:block;" />`:`<div style="width:100%;height:${h};background:${pgRgb(accent,.06)};"></div>`}${close}`;
          }).join('')}</div>`;
          return `<div style="${f}${c}padding:${p};">${inner}</div>`;
        }
        case 'imgtext': {
          const p = s.pad==='sm'?'1.5rem 2rem':s.pad==='lg'?'5rem 2rem':'3rem 2rem';
          const rev = s.reverse==='yes'?'direction:rtl;':'';
          const r2 = s.radius==='sm'?'4px':s.radius==='lg'?'12px':s.radius==='circle'?'50%':'0';
          const imgW = s.img_w==='sm'?'35%':s.img_w==='lg'?'55%':'45%';
          const imgH = s.img_h==='sm'?'200px':s.img_h==='lg'?'420px':'300px';
          const imgHtml = s.img?`<img src="${escAttr(s.img)}" alt="" style="width:100%;height:${imgH};object-fit:cover;border-radius:${r2};display:block;" />`:`<div style="width:100%;height:${imgH};background:${pgRgb(accent,.06)};border-radius:${r2};"></div>`;
          return `<div style="${f}${c}padding:${p};"><div style="display:grid;grid-template-columns:${imgW} 1fr;gap:2.5rem;align-items:center;${rev}">
            <div style="direction:ltr;">${imgHtml}</div>
            <div style="direction:ltr;">
              ${s.eyebrow?`<p style="font-size:.6rem;letter-spacing:.38em;text-transform:uppercase;color:${accent};margin-bottom:.6rem;font-weight:200;">${pgE(s.eyebrow)}</p>`:''}
              ${s.heading?`<h2 style="font-size:clamp(1.2rem,3vw,1.8rem);font-weight:300;letter-spacing:.02em;margin-bottom:.8rem;line-height:1.15;">${pgE(s.heading)}</h2>`:''}
              ${s.body?`<p style="font-weight:200;font-size:.88rem;line-height:1.85;color:${pgRgb(text,.68)};">${pgE(s.body)}</p>`:''}
              ${s.btn_label?`<a href="${escAttr(s.btn_url||'#')}" style="display:inline-block;margin-top:1.2rem;font-size:.68rem;font-weight:300;letter-spacing:.2em;text-transform:uppercase;color:${accent};border:1px solid ${pgRgb(accent,.3)};padding:.55rem 1.4rem;text-decoration:none;">${pgE(s.btn_label)}</a>`:''}
            </div>
          </div></div>`;
        }
        case 'group': {
          const open = s.default_open !== 'no' && s.default_open !== false;
          const p = s.pad==='sm'?'1rem 2rem':s.pad==='lg'?'4rem 2rem':'2rem 2rem';
          const inner = (s.sections||[]).map(cs => pgRenderSec(cs, accent, text, font, bg)).join('');
          return `<details ${open?'open':''} style="${f}${c}border-bottom:1px solid ${pgRgb(accent,.1)};"><summary style="cursor:pointer;padding:.85rem ${p.split(' ')[1]};font-weight:300;font-size:.9rem;letter-spacing:.04em;color:${pgRgb(text,.88)};list-style:none;display:flex;justify-content:space-between;align-items:center;user-select:none;">${pgE(s.label||'')}<span style="font-size:.7rem;color:${pgRgb(accent,.4)};">▾</span></summary><div>${inner}</div></details>`;
        }
        case 'accordion': {
          const items = s.items||[];
          const p = s.pad==='sm'?'1rem 2rem':s.pad==='lg'?'4rem 2rem':'2rem 2rem';
          const bordered = s.style==='bordered';
          const inner = items.map(it=>`<details style="border-bottom:1px solid ${pgRgb(accent,.12)};${bordered?`border:1px solid ${pgRgb(accent,.12)};margin-bottom:.5rem;`:''}">
            <summary style="cursor:pointer;padding:.85rem ${bordered?'1rem':'0'};font-weight:300;font-size:.88rem;letter-spacing:.04em;color:${pgRgb(text,.88)};list-style:none;display:flex;justify-content:space-between;align-items:center;">${pgE(it.q||'')}<span style="font-size:.7rem;color:${pgRgb(accent,.45)};">▼</span></summary>
            <div class="md-content" style="padding:.5rem ${bordered?'1rem':'0'} 1rem;font-size:.82rem;font-weight:200;line-height:1.85;color:${pgRgb(text,.62)};">${md(it.a)}</div>
          </details>`).join('');
          return `<div style="${f}${c}padding:${p};">${inner}</div>`;
        }
        case 'carousel': {
          const items = s.items||[];
          if (!items.length) return '';
          const h = s.height==='sm'?'200px':s.height==='lg'?'480px':'320px';
          const r2 = s.radius==='sm'?'4px':s.radius==='lg'?'12px':'0';
          const p = s.pad==='sm'?'1rem 2rem':s.pad==='lg'?'4rem 2rem':'2rem 2rem';
          const slides = items.map((it,i)=>`<div data-slide="${i}" style="display:${i===0?'block':'none'};">${it.img?`<img src="${escAttr(it.img)}" alt="${escAttr(it.caption||'')}" style="width:100%;height:${h};object-fit:cover;display:block;border-radius:${r2};" />`:''}${it.caption?`<p style="text-align:center;font-size:.62rem;color:${pgRgb(text,.4)};margin-top:.4rem;font-weight:200;">${pgE(it.caption)}</p>`:''}</div>`).join('');
          const btnSty=`position:absolute;top:50%;transform:translateY(-50%);background:rgba(2,10,3,.65);border:1px solid rgba(77,189,106,.22);color:rgba(180,230,190,.78);width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:none;font-size:1.05rem;z-index:5;`;
          return `<div style="${f}${c}padding:${p};"><div data-carousel style="position:relative;overflow:hidden;user-select:none;">${slides}${items.length>1?`<button style="${btnSty}left:.5rem;" data-prev>‹</button><button style="${btnSty}right:.5rem;" data-next>›</button><div style="position:absolute;bottom:.5rem;right:.75rem;font-size:.52rem;letter-spacing:.1em;color:rgba(180,230,190,.5);background:rgba(2,10,3,.65);padding:.15rem .4rem;pointer-events:none;" data-slide-ctr>1 / ${items.length}</div>`:''}</div></div>`;
        }
        case 'fileprev': {
          const p = s.pad==='sm'?'1rem 2rem':s.pad==='lg'?'4rem 2rem':'2rem 2rem';
          const h = s.height==='sm'?'300px':s.height==='lg'?'720px':s.height==='xl'?'90vh':'520px';
          if (!s.url) return '';
          const previewUrl = s.url ? (s.url + (s.url.includes('?') ? '&' : '?') + 'preview=1') : '';
          return `<div style="${f}${c}padding:${p};">${previewUrl ? `<iframe src="${escAttr(previewUrl)}" style="width:100%;height:${h};border:none;display:block;" loading="lazy"></iframe>` : ''}</div>`;
        }
        case 'filedown': {
          if (!s.url) return '';
          const p = s.pad==='sm'?'1.5rem 2rem':s.pad==='lg'?'5rem 2rem':'3rem 2rem';
          const jc = s.align==='left'?'flex-start':s.align==='right'?'flex-end':'center';
          const bs = s.btn_style||'solid';
          const btnCss = bs==='outline'?`background:transparent;border:1px solid ${accent};color:${accent};`:bs==='ghost'?`background:transparent;border:1px solid ${pgRgb(text,.25)};color:${text};`:`background:${accent};border:1px solid ${accent};color:${bg};`;
          return `<div style="${f}${c}padding:${p};"><div style="display:flex;flex-direction:column;align-items:${jc};gap:.4rem;"><a href="${escAttr(s.url)}" download style="${btnCss}display:inline-block;font-weight:300;font-size:.75rem;letter-spacing:.22em;text-transform:uppercase;padding:.65rem 1.8rem;text-decoration:none;">↓ ${pgE(s.label||'Download')}</a>${s.filename?`<span style="font-size:.58rem;font-weight:200;letter-spacing:.12em;color:${pgRgb(text,.38)};">${pgE(s.filename)}</span>`:''}</div></div>`;
        }
        case 'tutorials': {
          const p = s.pad==='sm'?'1rem 2rem':s.pad==='lg'?'4rem 2rem':'2rem 2rem';
          const uid = 'tuts-' + Math.random().toString(36).slice(2,8);
          return `<div id="${uid}"
            data-tuts="${escAttr(s.tut_style||'cards')}"
            data-accent="${escAttr(accent)}" data-text="${escAttr(text)}"
            data-font="${escAttr(font)}" data-bg="${escAttr(bg)}"
            data-heading="${escAttr(s.heading||'')}"
            data-heading-align="${escAttr(s.heading_align||'center')}"
            data-max="${escAttr(s.max_items||'0')}"
            data-view-all-show="${(s.view_all_show===false||s.view_all_show==='no')?'no':'yes'}"
            data-view-all-label="${escAttr(s.view_all_label||'View all →')}"
            style="padding:${p};font-family:'${font}',sans-serif;color:${text};">
            <p style="font-size:.62rem;letter-spacing:.18em;color:${pgRgb(accent,.3)};text-align:center;">Loading tutorials…</p>
          </div>`;
        }
        case 'reviews': {
          const p = s.pad==='sm'?'1rem 2rem':s.pad==='lg'?'4rem 2rem':'2rem 2rem';
          const uid = 'revs-' + Math.random().toString(36).slice(2,8);
          return `<div id="${uid}"
            data-revs="${escAttr(s.rev_style||'cards')}"
            data-accent="${escAttr(accent)}" data-text="${escAttr(text)}"
            data-font="${escAttr(font)}" data-bg="${escAttr(bg)}"
            data-heading="${escAttr(s.heading||'')}"
            data-heading-align="${escAttr(s.heading_align||'center')}"
            data-max="${escAttr(s.max_items||'0')}"
            data-view-all-show="${(s.view_all_show===false||s.view_all_show==='no')?'no':'yes'}"
            data-view-all-label="${escAttr(s.view_all_label||'View all →')}"
            style="padding:${p};font-family:'${font}',sans-serif;color:${text};">
            <p style="font-size:.62rem;letter-spacing:.18em;color:${pgRgb(accent,.3)};text-align:center;">Loading reviews…</p>
          </div>`;
        }
        default: return '';
      }
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
        el.querySelector('[data-prev]')?.addEventListener('click', () => show(cur - 1));
        el.querySelector('[data-next]')?.addEventListener('click', () => show(cur + 1));
        show(0);
      });
    }

    function renderCustomPage(state, session) {
      dismissLoading();
      const { bg, accent, text, font, sections } = state;
      const scene = document.getElementById('scene');
      scene.style.cssText = 'position:fixed;inset:0;z-index:10;display:block;overflow-y:auto;padding:0;';
      scene.style.background = bg;
      const rows = groupRows(sections || []);
      scene.innerHTML = rows.map(row => {
        if (row.length === 1) return pgRenderSec(row[0], accent, text, font, bg);
        return `<div style="display:flex;gap:0;">${row.map(s=>`<div style="flex:1;min-width:0;">${pgRenderSec(s, accent, text, font, bg)}</div>`).join('')}</div>`;
      }).join('');
      initCarousels(scene);
      scene.querySelectorAll('a, button').forEach(hookHover);

      if (session) {
        document.getElementById('userAvatar').src = session.picture || '';
        document.getElementById('userAvatar').style.display = session.picture ? '' : 'none';
        document.getElementById('userNameText').textContent = session.name || session.email || '';
        document.getElementById('userBadge').style.display = 'flex';
      }
      populateTutorialSections(session);
      populateReviewSections(session);
    }

    async function populateReviewSections(session) {
      const els = document.querySelectorAll('[data-revs]');
      if (!els.length) return;
      let revs;
      try {
        const res = await fetch('/api/reviews', { headers: sessionHeaders(session) });
        revs = await res.json();
      } catch(e) { return; }
      if (!Array.isArray(revs)) return;
      const starStr = (n) => { n = Math.max(0, Math.min(5, parseInt(n)||0)); return n ? '★'.repeat(n) : ''; };
      els.forEach(el => {
        const style = el.dataset.revs;
        const accent = el.dataset.accent, text = el.dataset.text;
        const heading = el.dataset.heading || '';
        const headingAlign = el.dataset.headingAlign || 'center';
        const maxItems = parseInt(el.dataset.max || '0', 10);
        const showViewAll = el.dataset.viewAllShow !== 'no';
        const viewAllLabel = el.dataset.viewAllLabel || 'View all →';
        const items = maxItems > 0 ? revs.slice(0, maxItems) : revs;
        const headingHtml = heading
          ? `<div style="font-size:.72rem;font-weight:200;letter-spacing:.18em;text-transform:uppercase;color:${pgRgb(accent,.7)};text-align:${headingAlign};margin-bottom:1.4rem;">${pgE(heading)}</div>`
          : '';
        const viewAllHtml = showViewAll
          ? `<div style="text-align:center;margin-top:1.4rem;"><a href="/reviews/all" style="font-size:.68rem;font-weight:200;letter-spacing:.14em;text-transform:uppercase;color:${pgRgb(accent,.6)};text-decoration:none;border-bottom:1px solid ${pgRgb(accent,.25)};padding-bottom:.15rem;">${pgE(viewAllLabel)}</a></div>`
          : '';
        if (!items.length) { el.innerHTML = headingHtml; return; }
        let listHtml;
        if (style === 'list') {
          listHtml = items.map(t => `<a href="/review/${escAttr(t.slug)}" style="display:flex;gap:1rem;align-items:center;border-bottom:1px solid ${pgRgb(accent,.1)};padding:.9rem 0;text-decoration:none;">
            ${t.cover_image?`<img src="${escAttr(t.cover_image)}" style="width:60px;height:44px;object-fit:cover;flex-shrink:0;" />`:''}
            <div style="flex:1;"><div style="font-weight:300;font-size:.88rem;color:${pgRgb(text,.9)};">${pgE(t.title)}</div><div style="font-size:.68rem;font-weight:200;color:${pgRgb(text,.5)};margin-top:.2rem;">${pgE(t.description)}</div></div>
            ${t.rating?`<div style="color:${accent};font-size:.8rem;letter-spacing:.1em;flex-shrink:0;">${starStr(t.rating)}</div>`:''}
          </a>`).join('');
        } else {
          listHtml = `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1.2rem;">${items.map(t=>`<a href="/review/${escAttr(t.slug)}" style="display:block;text-decoration:none;border:1px solid ${pgRgb(accent,.12)};background:${pgRgb(accent,.03)};">
            ${t.cover_image?`<img src="${escAttr(t.cover_image)}" style="width:100%;height:120px;object-fit:cover;display:block;" />`:`<div style="width:100%;height:120px;background:${pgRgb(accent,.06)};"></div>`}
            <div style="padding:.7rem .9rem;">${t.rating?`<div style="color:${accent};font-size:.78rem;letter-spacing:.1em;margin-bottom:.25rem;">${starStr(t.rating)}</div>`:''}<div style="font-weight:300;font-size:.85rem;letter-spacing:.04em;color:${pgRgb(text,.9)};">${pgE(t.title)}</div>${t.description?`<div style="font-size:.68rem;font-weight:200;line-height:1.6;color:${pgRgb(text,.5)};margin-top:.25rem;">${pgE(t.description)}</div>`:''}</div>
          </a>`).join('')}</div>`;
        }
        el.innerHTML = headingHtml + listHtml + viewAllHtml;
        el.querySelectorAll('a, button').forEach(hookHover);
      });
    }

    async function populateTutorialSections(session) {
      const els = document.querySelectorAll('[data-tuts]');
      if (!els.length) return;
      let tuts;
      try {
        const res = await fetch('/api/tutorials', { headers: sessionHeaders(session) });
        tuts = await res.json();
      } catch(e) { return; }
      if (!Array.isArray(tuts)) return;
      els.forEach(el => {
        const style = el.dataset.tuts;
        const accent = el.dataset.accent;
        const text = el.dataset.text;
        const font = el.dataset.font;
        const bg = el.dataset.bg;
        const heading = el.dataset.heading || '';
        const headingAlign = el.dataset.headingAlign || 'center';
        const maxItems = parseInt(el.dataset.max || '0', 10);
        const showViewAll = el.dataset.viewAllShow !== 'no';
        const viewAllLabel = el.dataset.viewAllLabel || 'View all →';

        const items = maxItems > 0 ? tuts.slice(0, maxItems) : tuts;

        const headingHtml = heading
          ? `<div style="font-size:.72rem;font-weight:200;letter-spacing:.18em;text-transform:uppercase;color:${pgRgb(accent,.7)};text-align:${headingAlign};margin-bottom:1.4rem;">${pgE(heading)}</div>`
          : '';
        const viewAllHtml = showViewAll
          ? `<div style="text-align:center;margin-top:1.4rem;"><a href="/tutorials/all" style="font-size:.68rem;font-weight:200;letter-spacing:.14em;text-transform:uppercase;color:${pgRgb(accent,.6)};text-decoration:none;border-bottom:1px solid ${pgRgb(accent,.25)};padding-bottom:.15rem;">${pgE(viewAllLabel)}</a></div>`
          : '';

        if (!items.length) { el.innerHTML = headingHtml; return; }

        let listHtml;
        if (style === 'list') {
          listHtml = items.map(t => `<div style="border-bottom:1px solid ${pgRgb(accent,.1)};padding:.9rem 0;display:flex;gap:1rem;align-items:center;">
            ${t.cover_image?`<img src="${escAttr(t.cover_image)}" style="width:60px;height:44px;object-fit:cover;flex-shrink:0;" />`:''}
            <div><div style="font-weight:300;font-size:.88rem;color:${pgRgb(text,.9)};">${pgE(t.title)}</div><div style="font-size:.68rem;font-weight:200;color:${pgRgb(text,.5)};margin-top:.2rem;">${pgE(t.description)}</div></div>
          </div>`).join('');
        } else {
          listHtml = `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1.2rem;">${items.map(t=>`<a href="/tutorials/${escAttr(t.slug)}" style="display:block;text-decoration:none;border:1px solid ${pgRgb(accent,.12)};background:${pgRgb(accent,.03)};">
            ${t.cover_image?`<img src="${escAttr(t.cover_image)}" style="width:100%;height:120px;object-fit:cover;display:block;" />`:`<div style="width:100%;height:120px;background:${pgRgb(accent,.06)};"></div>`}
            <div style="padding:.7rem .9rem;"><div style="font-weight:300;font-size:.85rem;letter-spacing:.04em;color:${pgRgb(text,.9)};">${pgE(t.title)}</div>${t.description?`<div style="font-size:.68rem;font-weight:200;line-height:1.6;color:${pgRgb(text,.5)};margin-top:.25rem;">${pgE(t.description)}</div>`:''}</div>
          </a>`).join('')}</div>`;
        }
        el.innerHTML = headingHtml + listHtml + viewAllHtml;
        el.querySelectorAll('a, button').forEach(hookHover);
      });
    }

