function bSetupDnD(canvasEl, sections, onDone) {
  canvasEl.querySelectorAll(".bld-sw").forEach((sw) => {
    sw.addEventListener("dragstart", (e) => {
      bDragId = sw.dataset.sid;
      bDragNew = null;
      e.dataTransfer.effectAllowed = "move";
      setTimeout(() => sw.classList.add("dragging"), 0);
    });
    sw.addEventListener("dragend", () => {
      sw.classList.remove("dragging");
      canvasEl.querySelectorAll(".bld-sw").forEach((s) => s.classList.remove("drag-above", "drag-below"));
      bDragId = null;
    });
    sw.addEventListener("dragover", (e) => {
      if (!bDragId && !bDragNew) return;
      if (bDragId === sw.dataset.sid) return;
      e.preventDefault();
      const r = sw.getBoundingClientRect();
      const relX = (e.clientX - r.left) / r.width;
      const relY = (e.clientY - r.top) / r.height;
      const sideDrop = relX < 0.28 || relX > 0.72;
      canvasEl.querySelectorAll(".bld-sw").forEach((s) => s.classList.remove("drag-above", "drag-below", "drag-left", "drag-right"));
      if (sideDrop) {
        sw.classList.add(relX < 0.5 ? "drag-left" : "drag-right");
      } else {
        sw.classList.add(relY < 0.5 ? "drag-above" : "drag-below");
      }
    });
    sw.addEventListener(
      "dragleave",
      () => sw.classList.remove("drag-above", "drag-below", "drag-left", "drag-right")
    );
    sw.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const r = sw.getBoundingClientRect();
      const relX = (e.clientX - r.left) / r.width;
      const relY = (e.clientY - r.top) / r.height;
      const sideDrop = relX < 0.28 || relX > 0.72;
      sw.classList.remove("drag-above", "drag-below", "drag-left", "drag-right");
      const toIdx = sections.findIndex((s) => s.id === sw.dataset.sid);
      const targetSec = sections[toIdx];
      let ns;
      if (bDragNew) {
        ns = bDefault(bDragNew);
        bDragNew = null;
      } else if (bDragId && bDragId !== sw.dataset.sid) {
        const fromIdx = sections.findIndex((s) => s.id === bDragId);
        if (fromIdx < 0) return;
        [ns] = sections.splice(fromIdx, 1);
        bDragId = null;
      } else return;
      if (sideDrop) {
        ns.width = "half";
        if (targetSec) targetSec.width = "half";
        const ins = sections.findIndex((s) => s.id === sw.dataset.sid);
        sections.splice(relX < 0.5 ? ins : ins + 1, 0, ns);
      } else {
        const before = relY < 0.5;
        const ins = sections.findIndex((s) => s.id === sw.dataset.sid);
        sections.splice(before ? ins : ins + 1, 0, ns);
      }
      onDone(ns.id);
    });
  });
  canvasEl.addEventListener("dragover", (e) => {
    if (!bDragNew && !bDragId || e.target.closest(".bld-sw")) return;
    e.preventDefault();
    canvasEl.classList.add("drag-target");
  });
  canvasEl.addEventListener("dragleave", (e) => {
    if (!e.relatedTarget || !canvasEl.contains(e.relatedTarget))
      canvasEl.classList.remove("drag-target");
  });
  canvasEl.addEventListener("drop", (e) => {
    if (e.target.closest(".bld-sw")) return;
    e.preventDefault();
    canvasEl.classList.remove("drag-target");
    if (bDragNew) {
      const ns = bDefault(bDragNew);
      bDragNew = null;
      sections.push(ns);
      onDone(ns.id);
    }
  });
}
let bldPickerCat = "all", bldPickerQ = "";
function bldBlockIco(ic, size) {
  size = size || "1em";
  if (!ic) return "▫";
  if (ic[0] === "@") return typeof foyerIcon === "function" ? foyerIcon(ic, size) : ic;
  const n = String(ic).replace(/[^a-z0-9-]/gi, "");
  const u = `url('/assets/block-icons/${n}.svg') center/contain no-repeat`;
  return `<span style="display:inline-block;width:${size};height:${size};background:currentColor;-webkit-mask:${u};mask:${u};vertical-align:-0.125em;"></span>`;
}
function pickCard(b) {
  return `<button class="bld-pick" data-type="${bA(b.t)}" title="${bA(b.l)}"><span class="bld-pick-ic">${bldBlockIco(b.i)}</span><span class="bld-pick-l">${bE(b.l)}</span></button>`;
}
function bldRenderPicker() {
  const grid = document.getElementById("bldPickerGrid");
  if (!grid) return;
  if (bldPickerCat === "__saved") {
    const rows = bldSavedBlocks || [];
    grid.innerHTML = rows.length ? rows.map(
      (s) => `<button class="bld-pick" data-saved="${s.id}" title="${bA(s.label)}" style="position:relative;"><span class="bld-pick-ic">✦</span><span class="bld-pick-l">${bE(s.label)}</span><span data-savdel="${s.id}" title="Remove" style="position:absolute;top:1px;right:4px;font-size:1rem;line-height:1;opacity:.5;">×</span></button>`
    ).join("") : `<p class="bld-picker-empty">No saved blocks yet. Open any block’s menu → <b>Save as reusable</b>.</p>`;
    grid.querySelectorAll(".bld-pick").forEach(
      (b) => b.addEventListener("click", (e) => {
        if (e.target.closest("[data-savdel]")) return;
        bldInsertSaved(+b.dataset.saved);
      })
    );
    grid.querySelectorAll("[data-savdel]").forEach(
      (b) => b.addEventListener("click", (e) => {
        e.stopPropagation();
        bldDeleteSaved(+b.dataset.savdel);
      })
    );
    return;
  }
  let list = BLOCK_CATALOG;
  if (bldPickerCat !== "all") list = list.filter((b) => b.c === bldPickerCat);
  if (bldPickerQ)
    list = list.filter(
      (b) => (b.l + " " + b.t + " " + (b.k || "")).toLowerCase().includes(bldPickerQ)
    );
  if (!list.length) {
    grid.innerHTML = `<p class="bld-picker-empty">No blocks match “${bE(bldPickerQ)}”.</p>`;
    return;
  }
  let html = "";
  if (bldPickerCat === "all" && !bldPickerQ) {
    for (const cat of BLK_CATS) {
      const items = list.filter((b) => b.c === cat);
      if (!items.length) continue;
      html += `<div class="bld-picker-cathead">${bE(cat)}</div>` + items.map(pickCard).join("");
    }
  } else {
    html = list.map(pickCard).join("");
  }
  grid.innerHTML = html;
  grid.querySelectorAll(".bld-pick").forEach((b) => b.addEventListener("click", () => bldAddBlock(b.dataset.type)));
}
function bldBuildPicker() {
  if (document.getElementById("bldPickerOv")) return;
  const ov = document.createElement("div");
  ov.id = "bldPickerOv";
  ov.className = "bld-picker-ov";
  ov.innerHTML = `<div class="bld-picker">
    <div class="bld-picker-head"><h3>Add a section</h3><input class="bld-picker-search" id="bldPickerSearch" placeholder="Search blocks…" autocomplete="off" /><button class="bld-picker-x" id="bldPickerX" aria-label="Close">×</button></div>
    <div class="bld-picker-body"><div class="bld-picker-cats" id="bldPickerCats"></div><div class="bld-picker-grid" id="bldPickerGrid"></div></div>
  </div>`;
  document.body.appendChild(ov);
  ov.addEventListener("click", (e) => {
    if (e.target === ov) bldClosePicker();
  });
  const cats = document.getElementById("bldPickerCats");
  cats.innerHTML = `<button class="bld-picker-cat on" data-cat="all">All blocks</button>` + (window.foyerPlan === "ultra" ? `<button class="bld-picker-cat" data-cat="__saved">✦ Saved</button>` : "") + BLK_CATS.map(
    (c) => `<button class="bld-picker-cat" data-cat="${bA(c)}">${bE(c)}</button>`
  ).join("");
  if (window.foyerPlan === "ultra" && !bldSavedBlocks)
    bldLoadSaved().then(() => {
      if (bldPickerCat === "__saved") bldRenderPicker();
    });
  cats.querySelectorAll(".bld-picker-cat").forEach(
    (b) => b.addEventListener("click", () => {
      cats.querySelectorAll(".bld-picker-cat").forEach((x) => x.classList.remove("on"));
      b.classList.add("on");
      bldPickerCat = b.dataset.cat;
      bldRenderPicker();
    })
  );
  document.getElementById("bldPickerX").addEventListener("click", bldClosePicker);
  const search = document.getElementById("bldPickerSearch");
  search.addEventListener("input", () => {
    bldPickerQ = search.value.toLowerCase().trim();
    bldRenderPicker();
  });
  search.addEventListener("keydown", (e) => {
    if (e.key === "Escape") bldClosePicker();
  });
}
function bldOpenPicker() {
  if (!bldPageId) {
    toast("Select or create a page first.", true);
    return;
  }
  if (bldState.kind === "text") {
    toast("Text pages have a fixed format — edit the article instead.");
    return;
  }
  bldBuildPicker();
  bldPickerCat = "all";
  bldPickerQ = "";
  const s = document.getElementById("bldPickerSearch");
  if (s) s.value = "";
  document.getElementById("bldPickerCats").querySelectorAll(".bld-picker-cat").forEach((x) => x.classList.toggle("on", x.dataset.cat === "all"));
  bldRenderPicker();
  document.getElementById("bldPickerOv").classList.add("open");
  setTimeout(() => {
    const s2 = document.getElementById("bldPickerSearch");
    if (s2) s2.focus();
  }, 40);
}
function bldClosePicker() {
  document.getElementById("bldPickerOv")?.classList.remove("open");
}
function ctxMenu(x, y, items) {
  document.getElementById("bld-ctx")?.remove();
  const m = document.createElement("div");
  m.id = "bld-ctx";
  m.className = "bld-ctx";
  m.innerHTML = items.map(
    (it, i) => it === "-" ? '<div class="bld-ctx-sep"></div>' : `<button class="bld-ctx-item${it.danger ? " danger" : ""}" data-i="${i}"><span class="bld-ctx-ico">${it.icon || ""}</span>${escHtml(it.label)}</button>`
  ).join("");
  document.body.appendChild(m);
  const r = m.getBoundingClientRect();
  m.style.left = Math.max(6, Math.min(x, innerWidth - r.width - 8)) + "px";
  m.style.top = Math.max(6, Math.min(y, innerHeight - r.height - 8)) + "px";
  const close = () => {
    m.remove();
    document.removeEventListener("pointerdown", out, true);
    document.removeEventListener("keydown", esc, true);
    window.removeEventListener("blur", close);
  };
  function out(e) {
    if (!m.contains(e.target)) close();
  }
  function esc(e) {
    if (e.key === "Escape") close();
  }
  setTimeout(() => {
    document.addEventListener("pointerdown", out, true);
    document.addEventListener("keydown", esc, true);
    window.addEventListener("blur", close);
  }, 0);
  m.querySelectorAll(".bld-ctx-item").forEach(
    (b) => b.addEventListener("click", () => {
      const it = items[+b.dataset.i];
      close();
      it.action && it.action();
    })
  );
}
function bldDuplicateBlock(id) {
  const i = bldState.sections.findIndex((s) => s.id === id);
  if (i < 0) return;
  const copy = JSON.parse(JSON.stringify(bldState.sections[i]));
  copy.id = Math.random().toString(36).slice(2, 9);
  bldState.sections.splice(i + 1, 0, copy);
  bldSel = copy.id;
  bldParentId = null;
  bldDrawCanvas();
  bldDrawEditor();
}
function bldMoveBlock(id, dir) {
  const i = bldState.sections.findIndex((s) => s.id === id);
  if (i < 0) return;
  const j = i + dir;
  if (j < 0 || j >= bldState.sections.length) return;
  const a = bldState.sections;
  [a[i], a[j]] = [a[j], a[i]];
  bldDrawCanvas();
  if (bldSel) bldDrawEditor();
}
function bldInitPickers(root) {
  if (!window.flatpickr || !root) return;
  root.querySelectorAll(".bld-fp").forEach((inp) => {
    if (inp._flatpickr) return;
    window.flatpickr(inp, {
      enableTime: true,
      dateFormat: "Y-m-d H:i",
      altInput: true,
      altFormat: "M j, Y · h:i K",
      onChange: () => inp.dispatchEvent(new Event("input", { bubbles: true }))
    });
  });
}
let _colorisReady = false;
function bldInitColoris() {
  if (_colorisReady || !window.Coloris) return;
  _colorisReady = true;
  window.Coloris({
    el: ".coloris",
    themeMode: "dark",
    format: "hex",
    alpha: false,
    swatches: ["#020a03", "#4dbd6a", "#f0f7f1", "#7fa6d8", "#e6b15a", "#e0556a"]
  });
}
async function bldOpenIconPicker(cb, anchor) {
  if (document.getElementById("bldEmojiPop")) return;
  const icons = typeof __ICONS__ !== "undefined" && __ICONS__ || [];
  const W = 352, H = 540;
  const pop = document.createElement("div");
  pop.id = "bldEmojiPop";
  pop.style.cssText = "position:fixed;z-index:99993;width:" + W + "px;border-radius:10px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,.5);background:var(--panel);border:1px solid rgba(77,189,106,.2);";
  const place = () => {
    let x = window.innerWidth / 2 - W / 2, y = window.innerHeight * 0.1;
    if (anchor && anchor.getBoundingClientRect) {
      const r = anchor.getBoundingClientRect();
      x = Math.min(Math.max(8, r.left), window.innerWidth - W - 8);
      y = Math.min(r.bottom + 6, window.innerHeight - H - 8);
      if (y < 8) y = 8;
    }
    pop.style.left = Math.round(x) + "px";
    pop.style.top = Math.round(y) + "px";
  };
  place();
  const iconGrid = icons.length ? `<div style="padding:.6rem .7rem .2rem;">
    <div style="font-size:.55rem;letter-spacing:.22em;text-transform:uppercase;color:var(--muted);padding:0 .2rem .45rem;">Foyer Icons</div>
    <div id="bldIcoGrid" style="display:grid;grid-template-columns:repeat(8,1fr);gap:.25rem;max-height:132px;overflow-y:auto;">${icons.map((n) => `<button type="button" class="bld-ico-cell" data-icon="${n}" title="${n}" style="aspect-ratio:1;display:flex;align-items:center;justify-content:center;background:rgba(77,189,106,.05);border:1px solid var(--border);border-radius:7px;cursor:pointer;color:var(--green);"><span style="display:inline-block;width:18px;height:18px;background:currentColor;-webkit-mask:url('/assets/icons/${n}.svg') center/contain no-repeat;mask:url('/assets/icons/${n}.svg') center/contain no-repeat;"></span></button>`).join("")}</div>
  </div>` : "";
  pop.innerHTML = iconGrid + '<div id="bldEmojiHost"><div style="padding:1rem 1.2rem;color:var(--muted);font-size:.75rem;">Loading emoji…</div></div>';
  document.body.appendChild(pop);
  pop.querySelectorAll(".bld-ico-cell").forEach(
    (b) => b.addEventListener("click", () => {
      cb("@" + b.dataset.icon);
      close();
    })
  );
  const close = () => {
    pop.remove();
    document.removeEventListener("mousedown", onOut, true);
    document.removeEventListener("keydown", onKey, true);
  };
  const onOut = (e) => {
    if (!pop.contains(e.target)) close();
  };
  const onKey = (e) => {
    if (e.key === "Escape") close();
  };
  const host = pop.querySelector("#bldEmojiHost");
  try {
    const _v = typeof __VERSION__ !== "undefined" ? __VERSION__ : "";
    if (!window.EmojiMart)
      await new Promise((res, rej) => {
        const s = document.createElement("script");
        s.src = "/deps/emoji-mart.js?v=" + _v;
        s.onload = res;
        s.onerror = rej;
        document.head.appendChild(s);
      });
    if (!window._emojiData)
      window._emojiData = await fetch("/deps/emoji-data.json").then((r) => r.json());
    if (!pop.parentNode) return;
    host.innerHTML = "";
    host.appendChild(
      new window.EmojiMart.Picker({
        data: window._emojiData,
        theme: "dark",
        previewPosition: "none",
        skinTonePosition: "none",
        autoFocus: true,
        onEmojiSelect: (e) => {
          cb(e.native || "@" + e.id);
          close();
        }
      })
    );
    place();
  } catch (e) {
    host.innerHTML = '<div style="padding:1rem 1.2rem;color:var(--muted);font-size:.75rem;">Couldn’t load the emoji picker.</div>';
  }
  setTimeout(() => document.addEventListener("mousedown", onOut, true), 0);
  document.addEventListener("keydown", onKey, true);
}
function bldBlockMenuItems(id) {
  const i = bldState.sections.findIndex((s) => s.id === id);
  const ico = (n) => typeof foyerIcon === "function" ? foyerIcon("@" + n, "1em") : "";
  return [
    {
      label: "Edit",
      icon: ico("edit"),
      action: () => {
        bldSel = id;
        bldParentId = null;
        bldDrawCanvas();
        bldDrawEditor();
      }
    },
    ...typeof foyerInteractive === "function" && foyerInteractive(bldState.sections[i]?.type) && foyerInteractionsBeta() ? [{ label: "Interactions (beta)", icon: ico("bolt"), action: () => openInteractions(id) }] : [],
    ...bldAiOn ? [{ label: "Polish copy with AI", icon: ico("sparkles"), action: () => bldPolishBlock(id) }] : [],
    { label: "Duplicate", icon: ico("copy"), action: () => bldDuplicateBlock(id) },
    ...window.foyerPlan === "ultra" ? [{ label: "Save as reusable", icon: ico("copy"), action: () => bldSaveReusable(id) }] : [],
    { label: "Move up", icon: ico("arrow-up"), action: () => bldMoveBlock(id, -1) },
    { label: "Move down", icon: ico("arrow-down"), action: () => bldMoveBlock(id, 1) },
    "-",
    {
      label: "Delete",
      icon: ico("trash"),
      danger: true,
      action: () => {
        bldState.sections = bldState.sections.filter((x) => x.id !== id);
        if (bldSel === id) {
          bldSel = null;
          bldParentId = null;
        }
        bldDrawCanvas();
        bldDrawEditor();
      }
    }
  ];
}
const AI_BLOCK_DENY = /* @__PURE__ */ new Set([
  "video",
  "audio",
  "map",
  "embed",
  "socialpost",
  "booking",
  "qrcode",
  "fileprev",
  "filedown",
  "tutorials",
  "reviews",
  "group",
  "carousel",
  "masonry",
  "gallery",
  "collection",
  "colllist",
  "image",
  "compare",
  "countdown"
]);
function bldAiSchema() {
  return BLOCK_CATALOG.filter((b) => !AI_BLOCK_DENY.has(b.t)).map((b) => {
    const def = bDefault(b.t);
    if (!def) return null;
    const opts = {};
    try {
      const html = bEditorFields(JSON.parse(JSON.stringify(def)));
      const re = /<select[^>]*\bdata-f="([^"]+)"[^>]*>([\s\S]*?)<\/select>/g;
      let m;
      while (m = re.exec(html)) {
        const v = [...m[2].matchAll(/value="([^"]*)"/g)].map((x) => x[1]).filter(Boolean);
        if (v.length) opts[m[1]] = [...new Set(v)];
      }
    } catch (e) {
    }
    const hint = (k, v) => {
      if (opts[k]) return `${k}:${opts[k].join("|")}`;
      if (Array.isArray(v)) {
        if (v[0] && typeof v[0] === "object") return `${k}:[{${Object.keys(v[0]).join(",")}}]`;
        return `${k}:[…]`;
      }
      if (typeof v === "string" && v) return `${k}="${v.slice(0, 24)}"`;
      return k;
    };
    const fields = Object.keys(def).filter((k) => k !== "id" && k !== "type" && k !== "access_key").map((k) => hint(k, def[k])).join(", ");
    return `- ${b.t} (${b.l}): ${fields}`;
  }).filter(Boolean).join("\n");
}
function bldSanitizeSections(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map((b) => {
    if (!b || typeof b !== "object" || !b.type) return null;
    const def = bDefault(b.type);
    if (!def) return null;
    const { _op, _at, ...rest } = b;
    return { ...def, ...rest, id: Math.random().toString(36).slice(2, 9) };
  }).filter(Boolean);
}
function bldApplyAi(arr) {
  if (!Array.isArray(arr) || !arr.length) return 0;
  if (!arr.some((b) => b && b._op)) {
    const secs = bldSanitizeSections(arr);
    if (secs.length) {
      bldState.sections = secs;
    }
    return secs.length;
  }
  const S = bldState.sections;
  let n = 0;
  arr.filter((b) => b && b._op === "remove" && Number.isInteger(b._at)).sort((a, b) => b._at - a._at).forEach((b) => {
    if (S[b._at]) {
      S.splice(b._at, 1);
      n++;
    }
  });
  for (const b of arr) {
    if (!b || !b._op || b._op === "remove") continue;
    const { _op, _at, ...rest } = b;
    if (_op === "update") {
      if (Number.isInteger(_at) && S[_at]) {
        S[_at] = { ...S[_at], ...rest, id: S[_at].id, type: S[_at].type };
        n++;
      }
      continue;
    }
    if (!rest.type || !bDefault(rest.type)) continue;
    const ns = { ...bDefault(rest.type), ...rest, id: Math.random().toString(36).slice(2, 9) };
    if (Number.isInteger(_at) && _at >= 0 && _at <= S.length) S.splice(_at, 0, ns);
    else S.push(ns);
    n++;
  }
  return n;
}
let bldAiChat = [];
let bldAiOn = true;
async function bldPolishBlock(id) {
  if (!bldAiOn) return;
  const idx = bldState.sections.findIndex((s) => s.id === id);
  if (idx < 0) return;
  const sec = bldState.sections[idx];
  const _spark = typeof foyerIcon === "function" ? foyerIcon("@sparkles", "1em") : "✨";
  const _wait = typeof foyerIcon === "function" ? foyerIcon("@clock", "1em") : "⏳";
  const setBtn = (loading) => {
    const b = document.querySelector(`[data-polish="${id}"]`);
    if (b) {
      b.disabled = loading;
      b.innerHTML = loading ? _wait : _spark;
    }
  };
  setBtn(true);
  const site = {
    name: __SITE__.name,
    pages: (bldPages || []).map((p) => ({ title: p.title, slug: p.slug }))
  };
  const msg = `Polish the "${sec.type}" block at index ${idx}: tighten and improve its writing, fix awkward phrasing, make the copy specific and compelling. Keep the SAME block type and structure — only rewrite text fields. Respond with a single {"_op":"update","_at":${idx}, …changed fields}.`;
  try {
    const r = await fetch("/api/ai/page", {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: msg }],
        sections: bldState.sections,
        schema: bldAiSchema(),
        site
      })
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) {
      toast(d.error || "Could not reach the assistant", true);
      setBtn(false);
      return;
    }
    const arr = Array.isArray(d.sections) ? d.sections : [];
    let op = arr.find((o) => o && o._op === "update" && o._at === idx) || arr.find((o) => o && o._op === "update");
    if (!op && arr.length === 1 && arr[0] && arr[0].type === sec.type && !arr[0]._op) op = arr[0];
    if (op) {
      const { _op, _at, ...rest } = op;
      bldState.sections[idx] = { ...sec, ...rest, id: sec.id, type: sec.type };
      bldDrawCanvas();
      bldDrawEditor();
      toast("Polished");
    } else toast("No changes suggested");
  } catch {
    toast("Network error — try again.", true);
  }
  setBtn(false);
}
const _foyerMark = '<svg viewBox="0 0 44 50" width="15" height="17" fill="none" stroke="var(--green)" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 46 V24 a16 16 0 0 1 32 0 V46"/><path d="M15 46 V28 a6 6 0 0 1 12 0 V46"/></svg>';
function bldAssistant() {
  if (!bldPageId) {
    toast("Pick or create a page first.", true);
    return;
  }
  if (bldState.kind === "text") {
    toast("The assistant builds block pages — not text pages.");
    return;
  }
  if (document.getElementById("bldAiOv")) return;
  const ov = document.createElement("div");
  ov.id = "bldAiOv";
  ov.className = "bld-ai-ov";
  ov.innerHTML = `<div class="bld-ai-box bld-ai-chat">
    <div class="bld-ai-head"><span class="bld-ai-title">${_foyerMark} Foyer assistant</span><div style="display:flex;gap:.4rem;align-items:center;"><button class="bld-ai-mini" id="bldAiNew" title="New chat">⟲</button><button class="bld-ai-x" id="bldAiX" aria-label="Close">✕</button></div></div>
    <div class="bld-ai-msgs" id="bldAiMsgs"></div>
    <form class="bld-ai-compose" id="bldAiForm"><input class="bld-ai-input2" id="bldAiPrompt" placeholder="Ask, plan, or describe a change…" autocomplete="off" /><button class="bld-ai-send" id="bldAiSend" type="submit" aria-label="Send">↑</button></form>
  </div>`;
  document.body.appendChild(ov);
  const close = () => ov.remove();
  ov.addEventListener("click", (e) => {
    if (e.target === ov) close();
  });
  document.getElementById("bldAiX").onclick = close;
  document.getElementById("bldAiNew").onclick = () => {
    bldAiChat = [];
    render();
    ta.focus();
  };
  const msgsEl = document.getElementById("bldAiMsgs");
  const ta = document.getElementById("bldAiPrompt");
  function render() {
    if (!bldAiChat.length) {
      const editing = (bldState.sections || []).length > 0;
      const chips = editing ? ["Add a pricing section", "Add an FAQ", "Make the copy punchier"] : ["A coffee-shop landing page", "A photography portfolio", "A résumé site"];
      msgsEl.innerHTML = `<div class="bld-ai-welcome">${_foyerMark}<p>${editing ? "What should we change? I can plan it with you before touching the page." : "Tell me about the page you want — or just describe your site and we’ll shape it together."}</p><div class="bld-ai-chips">${chips.map((x) => `<button class="bld-ai-chip" type="button">${escHtml(x)}</button>`).join("")}</div></div>`;
      msgsEl.querySelectorAll(".bld-ai-chip").forEach(
        (c) => c.onclick = () => {
          ta.value = c.textContent;
          ta.focus();
        }
      );
      return;
    }
    msgsEl.innerHTML = bldAiChat.map(
      (m) => `<div class="bld-ai-msg ${m.role}">${m.role === "assistant" ? `<span class="bld-ai-av">${_foyerMark}</span>` : ""}<div class="bld-ai-bubble">${m.thinking ? '<span class="bld-ai-dots"><i></i><i></i><i></i></span>' : escHtml(m.content)}${m.applied ? `<div class="bld-ai-applied">✓ Updated the page · ${m.applied} section${m.applied === 1 ? "" : "s"}</div>` : ""}</div></div>`
    ).join("");
    msgsEl.scrollTop = msgsEl.scrollHeight;
  }
  render();
  setTimeout(() => ta.focus(), 50);
  let busy = false;
  document.getElementById("bldAiForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = ta.value.trim();
    if (!text || busy) return;
    busy = true;
    ta.value = "";
    bldAiChat.push({ role: "user", content: text });
    const thinking = { role: "assistant", thinking: true };
    bldAiChat.push(thinking);
    render();
    const site = {
      name: __SITE__.name,
      pages: (bldPages || []).map((p) => ({ title: p.title, slug: p.slug }))
    };
    try {
      const msgs = bldAiChat.filter((m) => !m.thinking).map((m) => ({ role: m.role, content: m.content }));
      const r = await fetch("/api/ai/page", {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: msgs,
          sections: bldState.sections,
          schema: bldAiSchema(),
          site
        })
      });
      const d = await r.json().catch(() => ({}));
      bldAiChat = bldAiChat.filter((m) => m !== thinking);
      if (!r.ok) {
        bldAiChat.push({
          role: "assistant",
          content: d.error || "Something went wrong — try again."
        });
        render();
        busy = false;
        ta.focus();
        return;
      }
      const am = { role: "assistant", content: d.reply || "…" };
      if (Array.isArray(d.sections)) {
        const n = bldApplyAi(d.sections);
        if (n) {
          bldSel = null;
          bldParentId = null;
          bldDrawCanvas();
          bldDrawEditor();
          am.applied = n;
        }
      }
      bldAiChat.push(am);
      render();
    } catch {
      bldAiChat = bldAiChat.filter((m) => m !== thinking);
      bldAiChat.push({ role: "assistant", content: "Network error — try again." });
      render();
    }
    busy = false;
    ta.focus();
  });
}
function bldOpenSlotWidth(sections) {
  if (!sections.length) return null;
  const w = sections[sections.length - 1].width;
  if (w !== "half" && w !== "third") return null;
  const max = w === "third" ? 3 : 2;
  let n = 0;
  for (let i = sections.length - 1; i >= 0; i--) {
    if (sections[i].width === w) n++;
    else break;
  }
  return n % max !== 0 ? w : null;
}
function bldAddBlock(type) {
  const sec = bDefault(type);
  if (!sec) {
    toast("That block is coming soon.", true);
    return;
  }
  const slot = bldOpenSlotWidth(bldState.sections);
  if (slot) sec.width = slot;
  bldState.sections.push(sec);
  bldSel = sec.id;
  bldClosePicker();
  bldDrawCanvas();
  bldDrawEditor();
  const col = document.getElementById("bldCanvasCol");
  if (col) setTimeout(() => col.scrollTo({ top: col.scrollHeight, behavior: "smooth" }), 60);
}
let bldSavedBlocks = null;
async function bldLoadSaved() {
  try {
    bldSavedBlocks = await fetch("/api/saved-blocks", { headers: authHeaders() }).then(
      (r) => r.ok ? r.json() : []
    );
  } catch {
    bldSavedBlocks = [];
  }
  if (!Array.isArray(bldSavedBlocks)) bldSavedBlocks = [];
}
async function bldSaveReusable(id) {
  let sec = bldState.sections.find((s) => s.id === id);
  if (!sec && bldParentId) {
    const g = bldState.sections.find((x) => x.id === bldParentId);
    sec = (g && g.sections || []).find((c) => c.id === id);
  }
  if (!sec) return;
  const label = (BLOCK_CATALOG.find((b) => b.t === sec.type) || {}).l || sec.type;
  const { id: _omit, ...clean } = sec;
  const r = await fetch("/api/saved-blocks", {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ label, json: clean })
  });
  if (r.ok) {
    bldSavedBlocks = null;
    toast("Saved to your library ✦", false, { type: "success" });
  } else {
    const d = await r.json().catch(() => ({}));
    toast(d.error || "Could not save", true);
  }
}
function bldInsertSaved(savedId) {
  const item = (bldSavedBlocks || []).find((s) => s.id === savedId);
  if (!item) return;
  let sec;
  try {
    sec = JSON.parse(item.json);
  } catch {
    return;
  }
  sec.id = Math.random().toString(36).slice(2, 9);
  const slot = bldOpenSlotWidth(bldState.sections);
  if (slot) sec.width = slot;
  bldState.sections.push(sec);
  bldSel = sec.id;
  bldClosePicker();
  bldDrawCanvas();
  bldDrawEditor();
}
async function bldDeleteSaved(savedId) {
  await fetch(`/api/saved-blocks/${savedId}`, { method: "DELETE", headers: authHeaders() }).catch(
    () => {
    }
  );
  bldSavedBlocks = (bldSavedBlocks || []).filter((s) => s.id !== savedId);
  bldRenderPicker();
}
function groupRows(sections) {
  const rows = [];
  let batch = [], batchW = null;
  for (const s of sections) {
    const w = s.width || "full";
    if (w === "full") {
      if (batch.length) {
        rows.push(batch);
        batch = [];
        batchW = null;
      }
      rows.push([s]);
    } else {
      const max = w === "third" ? 3 : 2;
      if (batchW && batchW !== w) {
        rows.push(batch);
        batch = [];
      }
      batch.push(s);
      batchW = w;
      if (batch.length >= max) {
        rows.push(batch);
        batch = [];
        batchW = null;
      }
    }
  }
  if (batch.length) rows.push(batch);
  return rows;
}
function initCarousels(root) {
  root.querySelectorAll("[data-carousel]").forEach((el) => {
    const items = Array.from(el.querySelectorAll("[data-slide]"));
    if (!items.length) return;
    let cur = 0;
    function show(n) {
      cur = (n + items.length) % items.length;
      items.forEach((it, i) => {
        it.style.display = i === cur ? "" : "none";
      });
      const ctr = el.querySelector("[data-slide-ctr]");
      if (ctr) ctr.textContent = `${cur + 1} / ${items.length}`;
    }
    el.querySelector("[data-prev]")?.addEventListener("click", (e) => {
      e.stopPropagation();
      show(cur - 1);
    });
    el.querySelector("[data-next]")?.addEventListener("click", (e) => {
      e.stopPropagation();
      show(cur + 1);
    });
    show(0);
  });
}
let bldPages = [], bldPageId = null, bldState = {
  bg: __SITE__.bg,
  accent: __SITE__.accent,
  text: __SITE__.text,
  font: "Josefin Sans",
  sections: []
}, bldSel = null, bldParentId = null, bldBooted = false;
function bldDraftKey(id) {
  return "foyer_draft_" + id;
}
let _lastDraftJson = "";
let _autosaveT = null;
function bldSetAutosave(mode) {
  const wrap = document.getElementById("bldAutosave"), txt = document.getElementById("bldAutosaveText");
  if (!wrap || !txt) return;
  wrap.classList.remove("saving", "unsaved");
  if (mode === "saving") {
    wrap.classList.add("saving");
    txt.textContent = "Saving…";
  } else if (mode === "unsaved") {
    wrap.classList.add("unsaved");
    txt.textContent = "Unsaved";
  } else {
    txt.textContent = "Saved";
  }
}
function bldSaveDraft() {
  if (!bldPageId) return;
  const json = JSON.stringify(bldState);
  if (json === _lastDraftJson) return;
  _lastDraftJson = json;
  bldSetAutosave("saving");
  try {
    _ls.setItem(bldDraftKey(bldPageId), JSON.stringify({ state: bldState, ts: Date.now() }));
  } catch {
  }
  bldDrawPages();
  clearTimeout(_autosaveT);
  _autosaveT = setTimeout(() => bldSetAutosave("saved"), 500);
}
function bldClearDraft(id) {
  try {
    _ls.removeItem(bldDraftKey(id));
  } catch {
  }
  if (id === bldPageId) {
    _lastDraftJson = JSON.stringify(bldState);
    bldSetAutosave("saved");
  }
}
function bldPageUnsaved(p) {
  try {
    const raw = _ls.getItem(bldDraftKey(p.id));
    if (!raw) return false;
    return JSON.stringify(JSON.parse(raw).state) !== (p.page_json || "");
  } catch {
    return false;
  }
}
setInterval(bldSaveDraft, 4e3);
window.addEventListener("beforeunload", bldSaveDraft);
function bldFindSection(id) {
  for (const s of bldState.sections) {
    if (s.id === id) return { sec: s, parent: null };
    if (s.type === "group") {
      const c = (s.sections || []).find((x) => x.id === id);
      if (c) return { sec: c, parent: s };
    }
  }
  return { sec: null, parent: null };
}
function groupCanvasHtml(g) {
  const open = g.default_open !== "no" && g.default_open !== false;
  const children = (g.sections || []).map(
    (c) => `<div class="bld-sw bld-gchild${bldSel === c.id ? " sel" : ""}" data-sid="${c.id}">
    <div class="bld-ov">
      <button class="bld-ob" data-gc-edit="${c.id}" data-gc-grp="${g.id}">Edit</button>
      <button class="bld-ob rm" data-gc-del="${c.id}" data-gc-grp="${g.id}">✕</button>
    </div>
    ${bRender(c, bldState)}
  </div>`
  ).join("");
  return `<details class="bld-group-details" ${open ? "open" : ""}><summary class="bld-group-summary" style="color:${bRgb(bldState.text || __SITE__.text, 0.75)};font-family:'${bldState.font || "Josefin Sans"}',sans-serif;">${bE(g.label || "Group")}<span style="font-size:.65rem;color:${bRgb(bldState.accent || __SITE__.accent, 0.4)};">▾</span></summary><div class="bld-group-body">${children || `<div class="bld-group-empty">Empty — edit group to add sections</div>`}</div></details>`;
}
function bldThemeFromState() {
  document.getElementById("bldBg").value = bldState.bg || __SITE__.bg;
  document.getElementById("bldAccent").value = bldState.accent || __SITE__.accent;
  document.getElementById("bldText").value = bldState.text || __SITE__.text;
  document.getElementById("bldFont").value = bldState.font || "Josefin Sans";
  bldBgControls();
}
function bldBgControls() {
  const style = bldState.bg_style || "solid";
  document.getElementById("bldBgStyle").value = style;
  document.getElementById("bldBgColor2").value = bldState.bg_color2 || "#0a1f12";
  document.getElementById("bldBgAngle").value = bldState.bg_angle || "135";
  document.getElementById("bldBgImage").value = bldState.bg_image || "";
  document.getElementById("bldBgOverlay").value = bldState.bg_overlay || "0.4";
  document.getElementById("bldBgAnim").checked = !!bldState.bg_anim;
  const show = (id, on) => document.getElementById(id).style.display = on ? "" : "none";
  show("bldBgColor2Wrap", style === "gradient");
  show("bldBgAngleWrap", style === "gradient");
  show("bldBgImageWrap", style === "image");
  show("bldBgOverlayWrap", style === "image");
  show("bldBgAnimWrap", style === "gradient" || style === "aurora");
}
function bldBgCss() {
  const s = bldState, bg = s.bg || __SITE__.bg, ac = s.accent || __SITE__.accent;
  if (s.bg_style === "gradient")
    return `linear-gradient(${s.bg_angle || 135}deg, ${bg}, ${s.bg_color2 || ac})`;
  if (s.bg_style === "aurora")
    return `radial-gradient(40% 50% at 20% 25%, ${bRgb(ac, 0.18)}, transparent 60%), radial-gradient(45% 55% at 80% 30%, ${bRgb(ac, 0.14)}, transparent 60%), ${bg}`;
  if (s.bg_style === "image" && s.bg_image)
    return `linear-gradient(rgba(0,0,0,${s.bg_overlay || 0.4}),rgba(0,0,0,${s.bg_overlay || 0.4})), url('${String(s.bg_image).replace(/'/g, "%27")}') center/cover no-repeat`;
  return bg;
}
async function bldDiscardDraft(pid) {
  if (!await dlg.confirm(
    "Discard unsaved changes for this page? It reverts to the last published version.",
    { confirm: "Discard", danger: true }
  ))
    return;
  bldClearDraft(pid);
  if (pid === bldPageId) {
    const p = bldPages.find((x) => x.id === pid);
    try {
      bldState = {
        bg: __SITE__.bg,
        accent: __SITE__.accent,
        text: __SITE__.text,
        font: "Josefin Sans",
        sections: [],
        ...JSON.parse(p.page_json || "{}")
      };
    } catch {
      bldState = {
        bg: __SITE__.bg,
        accent: __SITE__.accent,
        text: __SITE__.text,
        font: "Josefin Sans",
        sections: []
      };
    }
    bldSel = null;
    bldParentId = null;
    _lastDraftJson = JSON.stringify(bldState);
    if (typeof bldThemeFromState === "function") bldThemeFromState();
    bldDrawCanvas();
    bldDrawEditor();
    bldSetAutosave("saved");
  }
  bldDrawPages();
  toast("Draft discarded");
}
function bldDrawPages() {
  const list = document.getElementById("bldPageList");
  const ultra = window.foyerPlan === "ultra";
  const bulkBar = ultra ? `<div id="bldBulkBar" style="display:none;align-items:center;gap:.5rem;padding:.4rem .6rem;background:rgba(var(--accent-rgb),.1);border-bottom:1px solid var(--border);font-size:.7rem;color:var(--white);"><span><b id="bldBulkN">0</b> selected</span><button class="btn btn-xs" id="bldBulkTrash" style="color:#e0608a;">Move to Trash</button><button class="btn btn-xs" id="bldBulkClear">Clear</button></div>` : "";
  list.innerHTML = bulkBar + bldPages.map((p) => {
    const canDel = p.slug !== "/" && p.slug !== "__404__";
    return `<div class="bld-pi${bldPageId === p.id ? " sel" : ""}" data-pid="${p.id}">
      ${ultra ? canDel ? `<input type="checkbox" class="bld-pi-chk" data-chk="${p.id}" title="Select" style="flex-shrink:0;cursor:pointer;width:auto;margin:0 .15rem 0 0;" />` : `<span style="width:13px;flex-shrink:0;"></span>` : ""}
      <div style="min-width:0;flex:1;">
        <div class="bld-pi-t">${escHtml(p.title)}</div>
        <div class="bld-pi-s">${escHtml(p.slug)}</div>
      </div>
      ${bldPageUnsaved(p) ? `<span class="bld-pi-unsaved" data-discard="${p.id}" title="Discard unsaved changes">!</span>` : ""}
      ${canDel ? `<button class="bld-pi-del" data-pdel="${p.id}" title="${ultra ? "Move to Trash" : "Delete"}">✕</button>` : ""}
    </div>`;
  }).join("") + (ultra ? `<button id="bldTrashBtn" type="button" style="display:flex;align-items:center;gap:.45rem;width:100%;background:none;border:none;border-top:1px solid var(--border);color:var(--muted);font:inherit;font-size:.72rem;padding:.6rem .7rem;cursor:pointer;margin-top:.2rem;">🗑 Trash</button>` : "");
  list.querySelector("#bldTrashBtn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    bldOpenTrash();
  });
  const bar = list.querySelector("#bldBulkBar"), nEl = list.querySelector("#bldBulkN");
  const selected = () => list.querySelectorAll(".bld-pi-chk:checked");
  const syncBulk = () => {
    const n = selected().length;
    nEl.textContent = n;
    bar.style.display = n ? "flex" : "none";
  };
  list.querySelectorAll(".bld-pi-chk").forEach(
    (c) => c.addEventListener("click", (e) => {
      e.stopPropagation();
      syncBulk();
    })
  );
  list.querySelector("#bldBulkClear")?.addEventListener("click", (e) => {
    e.stopPropagation();
    selected().forEach((c) => c.checked = false);
    syncBulk();
  });
  list.querySelector("#bldBulkTrash")?.addEventListener("click", async (e) => {
    e.stopPropagation();
    const ids = [...selected()].map((c) => +c.dataset.chk);
    if (!ids.length) return;
    if (!await dlg.confirm(`Move ${ids.length} page${ids.length > 1 ? "s" : ""} to Trash?`, {
      danger: true,
      confirm: "Move to Trash"
    }))
      return;
    await Promise.all(
      ids.map(
        (id) => fetch(`/api/pages/${id}`, { method: "DELETE", headers: authHeaders() }).catch(() => {
        })
      )
    );
    ids.forEach(bldClearDraft);
    bldPages = bldPages.filter((x) => !ids.includes(x.id));
    if (ids.includes(bldPageId)) {
      bldPageId = bldPages[0]?.id || null;
      if (bldPageId) bldPickPage(bldPageId);
      else bldDrawCanvas();
    }
    toast(`Moved ${ids.length} to Trash`, false, { type: "info" });
    bldDrawPages();
  });
  list.querySelectorAll(".bld-pi").forEach(
    (el) => el.addEventListener("click", (e) => {
      if (e.target.closest(".bld-pi-del") || e.target.closest("[data-discard]") || e.target.closest(".bld-pi-chk"))
        return;
      bldPickPage(+el.dataset.pid);
    })
  );
  list.querySelectorAll("[data-discard]").forEach(
    (badge) => badge.addEventListener("click", (e) => {
      e.stopPropagation();
      bldDiscardDraft(+badge.dataset.discard);
    })
  );
  list.querySelectorAll("[data-pdel]").forEach(
    (btn) => btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const p = bldPages.find((x) => x.id === +btn.dataset.pdel);
      if (!p) return;
      if (!await dlg.confirm(`Delete page "${p.title}"?`, { danger: true, confirm: "Delete" }))
        return;
      await fetch(`/api/pages/${p.id}`, { method: "DELETE", headers: authHeaders() });
      bldClearDraft(p.id);
      bldPages = bldPages.filter((x) => x.id !== p.id);
      if (bldPageId === p.id) {
        bldPageId = bldPages[0]?.id || null;
        if (bldPageId) bldPickPage(bldPageId);
        else bldDrawCanvas();
      }
      bldDrawPages();
    })
  );
}
async function bldOpenTrash() {
  let rows = [];
  try {
    rows = await fetch("/api/pages/trash", { headers: authHeaders() }).then(
      (r) => r.ok ? r.json() : []
    );
  } catch (e) {
  }
  if (!Array.isArray(rows)) rows = [];
  const ov = document.createElement("div");
  ov.style.cssText = "position:fixed;inset:0;z-index:100000;background:rgba(4,7,11,.72);display:flex;align-items:center;justify-content:center;padding:2rem;";
  const rowHtml = rows.length ? rows.map(
    (p) => `<div data-trow="${p.id}" style="display:flex;align-items:center;gap:.6rem;padding:.6rem 0;border-top:1px solid var(--border);">
      <div style="flex:1;min-width:0;"><div style="color:var(--white);font-size:.82rem;">${escHtml(p.title || "(untitled)")}</div><div style="color:var(--muted);font-size:.62rem;">${escHtml(p.slug || "")} · deleted ${timeAgo(p.deleted_at)}</div></div>
      <button class="btn btn-sm" data-trestore="${p.id}">Restore</button>
      <button class="btn btn-sm" data-tpurge="${p.id}" style="color:#e0608a;">Delete forever</button>
    </div>`
  ).join("") : `<p style="color:var(--muted);font-size:.78rem;padding:.6rem 0;">Trash is empty.</p>`;
  ov.innerHTML = `<div style="background:var(--panel);border:1px solid var(--border);border-radius:12px;width:100%;max-width:520px;max-height:80vh;overflow:auto;padding:1.2rem 1.4rem;box-shadow:0 20px 60px rgba(0,0,0,.5);">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.6rem;gap:.5rem;"><h3 style="margin:0;font-weight:300;color:var(--white);">🗑 Trash</h3><div style="display:flex;gap:.4rem;">${rows.length ? `<button class="btn btn-sm" id="bldTrashRestoreAll">Restore all</button><button class="btn btn-sm" id="bldTrashEmpty" style="color:#e0608a;">Empty Trash</button>` : ""}<button class="btn btn-sm" id="bldTrashX">Close</button></div></div>
    <p style="color:var(--muted);font-size:.66rem;margin:0 0 .6rem;">Deleted pages are kept here. Restore brings them back (with history); Delete forever is permanent.</p>
    <div id="bldTrashList">${rowHtml}</div></div>`;
  document.body.appendChild(ov);
  const close = () => ov.remove();
  ov.addEventListener("mousedown", (e) => {
    if (e.target === ov) close();
  });
  ov.querySelector("#bldTrashX").addEventListener("click", close);
  ov.querySelector("#bldTrashRestoreAll")?.addEventListener("click", async () => {
    await Promise.all(
      rows.map(
        (p) => fetch(`/api/pages/${p.id}/restore`, { method: "POST", headers: authHeaders() }).catch(
          () => {
          }
        )
      )
    );
    toast(`Restored ${rows.length} page${rows.length > 1 ? "s" : ""}`, false, { type: "success" });
    close();
    bldLoadPages();
  });
  ov.querySelector("#bldTrashEmpty")?.addEventListener("click", async () => {
    if (!await dlg.confirm(
      `Permanently delete all ${rows.length} pages in Trash? This cannot be undone.`,
      { danger: true, confirm: "Empty Trash" }
    ))
      return;
    await Promise.all(
      rows.map((p) => {
        bldClearDraft(p.id);
        return fetch(`/api/pages/${p.id}?permanent=1`, {
          method: "DELETE",
          headers: authHeaders()
        }).catch(() => {
        });
      })
    );
    toast("Trash emptied", false, { type: "info" });
    close();
  });
  ov.querySelectorAll("[data-trestore]").forEach(
    (b) => b.addEventListener("click", async () => {
      const id = +b.dataset.trestore;
      const r = await fetch(`/api/pages/${id}/restore`, { method: "POST", headers: authHeaders() });
      if (r.ok) {
        toast("Page restored", false, { type: "success" });
        ov.querySelector(`[data-trow="${id}"]`)?.remove();
        bldLoadPages();
      } else toast("Could not restore.", true);
    })
  );
  ov.querySelectorAll("[data-tpurge]").forEach(
    (b) => b.addEventListener("click", async () => {
      const id = +b.dataset.tpurge;
      if (!await dlg.confirm("Permanently delete this page? This cannot be undone.", {
        danger: true,
        confirm: "Delete forever"
      }))
        return;
      const r = await fetch(`/api/pages/${id}?permanent=1`, {
        method: "DELETE",
        headers: authHeaders()
      });
      if (r.ok) {
        bldClearDraft(id);
        toast("Permanently deleted", false, { type: "info" });
        ov.querySelector(`[data-trow="${id}"]`)?.remove();
      } else toast("Could not delete.", true);
    })
  );
}
function bldPickPage(id) {
  bldPageId = id;
  bldSel = null;
  const p = bldPages.find((x) => x.id === id);
  if (!p) return;
  try {
    bldState = {
      bg: __SITE__.bg,
      accent: __SITE__.accent,
      text: __SITE__.text,
      font: "Josefin Sans",
      sections: [],
      ...JSON.parse(p.page_json || "{}")
    };
  } catch (e) {
    bldState = {
      bg: __SITE__.bg,
      accent: __SITE__.accent,
      text: __SITE__.text,
      font: "Josefin Sans",
      sections: []
    };
  }
  try {
    const raw = _ls.getItem(bldDraftKey(id));
    if (raw) {
      const draft = JSON.parse(raw);
      const fresh = draft && draft.ts && Date.now() - draft.ts < 24 * 3600 * 1e3;
      if (fresh && JSON.stringify(draft.state) !== (p.page_json || "")) {
        bldState = draft.state;
        setTimeout(
          () => toast("Restored unsaved draft (" + timeAgo(new Date(draft.ts).toISOString()) + ")"),
          300
        );
      } else if (!fresh) {
        bldClearDraft(id);
      }
    }
  } catch {
  }
  bldThemeFromState();
  _lastDraftJson = JSON.stringify(bldState);
  bldSetAutosave("saved");
  const slug = p.slug === "/" ? "/" : "/" + p.slug.replace(/^\//, "");
  document.getElementById("bldChromeUrl").textContent = "lanson.pages.dev" + slug;
  bldDrawPages();
  bldDrawCanvas();
  bldDrawEditor();
}
function bSecWrap(s, inner) {
  const ac = bldState.accent || __SITE__.accent;
  let ws = "";
  const m = s.smargin === "sm" ? "1.2rem" : s.smargin === "md" ? "2.6rem" : s.smargin === "lg" ? "4.5rem" : "";
  if (m) ws += `margin-top:${m};margin-bottom:${m};`;
  const sb = s.sbg === "subtle" ? bRgb(ac, 0.04) : s.sbg === "bold" ? bRgb(ac, 0.09) : s.sbg === "dark" ? "rgba(0,0,0,.22)" : "";
  if (sb) ws += `background:${sb};`;
  const r = s.sround === "sm" ? "10px" : s.sround === "lg" ? "20px" : "";
  if (r) ws += `border-radius:${r};overflow:hidden;`;
  const badge = s.hide ? `<div style="position:absolute;top:.4rem;left:.4rem;z-index:2;font-size:.5rem;letter-spacing:.12em;text-transform:uppercase;background:rgba(230,200,90,.9);color:#1a1400;padding:.12rem .4rem;border-radius:3px;">Hidden · ${s.hide}</div>` : "";
  return ws || badge ? `<div style="position:relative;${ws}${s.hide ? "opacity:.5;" : ""}">${badge}${inner}</div>` : inner;
}
function bldTextEditorHtml() {
  return `<div class="bld-text-edit" style="max-width:720px;margin:0 auto;padding:1.2rem;display:flex;flex-direction:column;gap:1rem;">
    <p style="font-size:.6rem;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);font-weight:200;margin:0;">Text page · fixed article layout</p>
    <div class="bld-ef"><label>Description <span style="opacity:.5">(shown under the title)</span></label><input type="text" id="txtDesc" value="${bA(bldState.desc || "")}" /></div>
    <div class="bld-ef"><label>Cover image <span style="opacity:.5">(optional)</span></label><div style="display:flex;gap:.4rem;"><input type="text" id="txtCover" value="${bA(bldState.cover || "")}" style="flex:1;" placeholder="/api/images/… or URL" /><button class="btn btn-sm" id="txtCoverPick" type="button">Pick</button></div></div>
    <div class="bld-ef"><label>Body <span style="opacity:.45">(Markdown — headings, **bold**, links, lists, \`code\`)</span></label><textarea id="txtBody" rows="18" style="font-family:ui-monospace,monospace;line-height:1.6;">${bE(bldState.body || "")}</textarea></div>
  </div>`;
}
function bldWireTextEditor(root) {
  root.querySelector("#txtDesc")?.addEventListener("input", (e) => {
    bldState.desc = e.target.value;
    bldSaveDraft();
  });
  root.querySelector("#txtCover")?.addEventListener("input", (e) => {
    bldState.cover = e.target.value;
    bldSaveDraft();
  });
  root.querySelector("#txtCoverPick")?.addEventListener(
    "click",
    () => openImgPicker((url) => {
      bldState.cover = url;
      const i = root.querySelector("#txtCover");
      if (i) i.value = url;
      bldSaveDraft();
    })
  );
  root.querySelector("#txtBody")?.addEventListener("input", (e) => {
    bldState.body = e.target.value;
    bldSaveDraft();
  });
}
function bldDrawCanvas() {
  const el = document.getElementById("bldCanvas");
  if (!el) return;
  bldSaveDraft();
  el.style.background = bldBgCss();
  if (bldState.kind === "text") {
    el.innerHTML = bldTextEditorHtml();
    bldWireTextEditor(el);
    return;
  }
  if (!bldState.sections || !bldState.sections.length) {
    el.innerHTML = `<div class="bld-canvas-empty" style="color:${bRgb(bldState.accent || __SITE__.accent, 0.18)}">Add a section below to build this page</div>`;
    return;
  }
  function swHtml(s) {
    const wLabel = s.width === "half" ? "½" : s.width === "third" ? "⅓" : "Full";
    const inner = bSecWrap(s, s.type === "group" ? groupCanvasHtml(s) : bRender(s, bldState));
    return `<div class="bld-sw${bldSel === s.id ? " sel" : ""}" data-sid="${s.id}" draggable="true">
      <div class="bld-ov">
        <span class="bld-drag-handle" title="Drag to reorder">⠿</span>
        <button class="bld-ob bld-w-tog" data-wtog="${s.id}" title="Change column width">${wLabel}</button>
        ${bldAiOn && s.type !== "group" ? `<button class="bld-ob bld-polish" data-polish="${s.id}" title="Polish copy with AI">${typeof foyerIcon === "function" ? foyerIcon("@sparkles", "1em") : "✨"}</button>` : ""}
        ${typeof foyerInteractive === "function" && foyerInteractive(s.type) && typeof foyerInteractionsBeta === "function" && foyerInteractionsBeta() ? `<button class="bld-ob bld-interact" data-interact="${s.id}" title="Interactions (beta)">${typeof foyerIcon === "function" ? foyerIcon("@bolt", "1em") : "⚡"}</button>` : ""}
        <button class="bld-ob" data-edit="${s.id}">Edit</button>
        <button class="bld-ob rm" data-del="${s.id}">✕</button>
      </div>
      ${inner}
    </div>`;
  }
  const rows = groupRows(bldState.sections);
  el.innerHTML = rows.map((row) => {
    if (row.length === 1) {
      const s = row[0], w = s.width || "full";
      if (w === "full") return swHtml(s);
      const needed = w === "third" ? 3 : 2;
      const slot = `<div style="flex:1;min-width:0;border:1px dashed rgba(var(--accent-rgb),.1);display:flex;align-items:center;justify-content:center;font-size:.5rem;letter-spacing:.18em;text-transform:uppercase;color:rgba(var(--accent-rgb),.18);min-height:60px;">Drag section here</div>`;
      return `<div style="display:flex;gap:.4rem;align-items:stretch;"><div style="flex:1;min-width:0;">${swHtml(s)}</div>${slot.repeat(needed - 1)}</div>`;
    }
    return `<div style="display:flex;gap:.4rem;align-items:stretch;">${row.map((s) => `<div style="flex:1;min-width:0;">${swHtml(s)}</div>`).join("")}</div>`;
  }).join("");
  el.querySelectorAll("[data-edit]").forEach(
    (b) => b.addEventListener("click", (e) => {
      e.stopPropagation();
      bldSel = b.dataset.edit;
      bldParentId = null;
      el.querySelectorAll(".bld-sw.sel").forEach((x) => x.classList.remove("sel"));
      b.closest(".bld-sw")?.classList.add("sel");
      bldDrawEditor();
    })
  );
  el.querySelectorAll("[data-polish]").forEach(
    (b) => b.addEventListener("click", (e) => {
      e.stopPropagation();
      bldPolishBlock(b.dataset.polish);
    })
  );
  el.querySelectorAll("[data-interact]").forEach(
    (b) => b.addEventListener("click", (e) => {
      e.stopPropagation();
      if (typeof openInteractions === "function") openInteractions(b.dataset.interact);
    })
  );
  el.querySelectorAll("[data-del]").forEach(
    (b) => b.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = b.dataset.del, sec = bldState.sections.find((x) => x.id === id);
      const wasFull = !sec || (sec.width || "full") === "full";
      bldState.sections = bldState.sections.filter((x) => x.id !== id);
      if (bldSel === id) {
        bldSel = null;
        bldParentId = null;
      }
      if (wasFull && bldState.sections.length) {
        bldSaveDraft();
        b.closest(".bld-sw")?.remove();
        bldDrawEditor();
      } else {
        bldDrawCanvas();
        bldDrawEditor();
      }
    })
  );
  el.querySelectorAll("[data-wtog]").forEach(
    (b) => b.addEventListener("click", (e) => {
      e.stopPropagation();
      const sec = bldState.sections.find((s) => s.id === b.dataset.wtog);
      if (!sec) return;
      const cur = sec.width || "full";
      sec.width = cur === "full" ? "half" : cur === "half" ? "third" : "full";
      bldSel = sec.id;
      bldParentId = null;
      bldDrawCanvas();
      bldDrawEditor();
    })
  );
  el.querySelectorAll("[data-gc-edit]").forEach(
    (b) => b.addEventListener("click", (e) => {
      e.stopPropagation();
      bldParentId = b.dataset.gcGrp;
      bldSel = b.dataset.gcEdit;
      bldDrawCanvas();
      bldDrawEditor();
    })
  );
  el.querySelectorAll("[data-gc-del]").forEach(
    (b) => b.addEventListener("click", (e) => {
      e.stopPropagation();
      const grp = bldState.sections.find((s) => s.id === b.dataset.gcGrp);
      if (!grp) return;
      grp.sections = (grp.sections || []).filter((c) => c.id !== b.dataset.gcDel);
      if (bldSel === b.dataset.gcDel) {
        bldSel = grp.id;
        bldParentId = null;
      }
      bldDrawCanvas();
      bldDrawEditor();
    })
  );
  el.querySelectorAll(":scope > .bld-sw, :scope > div > .bld-sw").forEach((sw) => {
    sw.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      e.stopPropagation();
      ctxMenu(e.clientX, e.clientY, bldBlockMenuItems(sw.dataset.sid));
    });
  });
  bSetupDnD(el, bldState.sections, (newId) => {
    bldSel = newId;
    bldParentId = null;
    bldDrawCanvas();
    bldDrawEditor();
  });
  initCarousels(el);
  foyerHL(el);
}
function bldPatch(s) {
  if (s.type === "group") {
    bldDrawCanvas();
    return;
  }
  const w = document.querySelector(`#bldCanvas .bld-sw[data-sid="${s.id}"]`);
  if (!w) {
    bldDrawCanvas();
    return;
  }
  const ov = w.querySelector(".bld-ov");
  w.innerHTML = "";
  if (ov) w.appendChild(ov);
  w.insertAdjacentHTML("beforeend", bSecWrap(s, bRender(s, bldState)));
  initCarousels(w);
}
async function bldSavePageMeta(id, name, slug) {
  const curP = bldPages.find((p) => p.id === id);
  if (!curP) return false;
  name = (name || "").trim();
  slug = (slug || "").trim();
  if (!name) {
    toast("Page name is required.", true);
    return false;
  }
  if (!slug) {
    toast("Slug is required.", true);
    return false;
  }
  slug = slug.startsWith("/") ? slug : "/" + slug;
  if (name === curP.title && slug === curP.slug) return true;
  const r = await fetch(`/api/pages/${id}`, {
    method: "PUT",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ title: name, slug })
  });
  if (!r.ok) {
    const d = await r.json().catch(() => ({}));
    toast(d.error || "Could not save (is that slug taken?)", true);
    return false;
  }
  curP.title = name;
  curP.slug = slug;
  bldDrawPages();
  const cu = document.getElementById("bldChromeUrl");
  if (cu) cu.textContent = (__SITE__.domain || "site") + (slug === "/" ? "" : slug);
  if (typeof mUpdatePageChip === "function") mUpdatePageChip();
  if (typeof mSyncTitle === "function") mSyncTitle();
  toast("Page updated ✓");
  return true;
}
async function bldApplyPageMeta() {
  await bldSavePageMeta(
    bldPageId,
    document.getElementById("pgName")?.value,
    document.getElementById("pgSlug")?.value
  );
}
async function bldSavePagePassword(id, password) {
  const curP = bldPages.find((p) => p.id === id);
  if (!curP) return;
  const r = await fetch(`/api/pages/${id}`, {
    method: "PUT",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ password })
  });
  if (!r.ok) {
    const d = await r.json().catch(() => ({}));
    toast(d.error || "Could not update password.", true);
    return;
  }
  curP.has_password = !!password;
  toast(password ? "Password set ✓" : "Password removed ✓");
  bldDrawEditor();
}
function bldDrawEditor() {
  const panel = document.getElementById("bldEditor");
  if (!panel) return;
  if (!bldSel) {
    if (bldPageId) {
      const curP = bldPages.find((p) => p.id === bldPageId) || {};
      panel.innerHTML = `<div class="bld-ep"><div class="bld-ep-head">Page <span class="bld-ep-type">Settings</span></div><div class="bld-ef"><label>Page name</label><input type="text" id="pgName" value="${bA(curP.title || "")}" /></div><div class="bld-ef"><label>URL slug <span style="opacity:.5">(e.g. /about)</span></label><input type="text" id="pgSlug" value="${bA(curP.slug || "")}" placeholder="/slug" /></div><div class="bld-ef"><label>Browser Tab Title</label><input type="text" id="pgTitle" value="${bA(bldState.page_title || "")}" placeholder="Defaults to page name" /></div><div class="bld-ef"><label>Meta Description</label><input type="text" id="pgSub" value="${bA(bldState.page_subtitle || "")}" /></div><div class="bld-ef"><label>Social share image <span style="opacity:.5">(link preview, 1200×630)</span></label><div style="display:flex;gap:.4rem;"><input type="text" id="pgImage" value="${bA(bldState.page_image || "")}" placeholder="Defaults to site image" style="flex:1;" /><button class="btn btn-sm" id="pgImagePick" type="button">Pick</button></div></div><div class="bld-ef"><label>Show in nav bar</label><select id="pgNav"><option value="yes"${bldState.show_in_nav !== false ? " selected" : ""}>Yes — show in nav</option><option value="no"${bldState.show_in_nav === false ? " selected" : ""}>No — hide from nav</option></select></div><div class="bld-ef"><label>Password protection <span style="opacity:.5">(Pro)</span></label><div style="display:flex;gap:.4rem;"><input type="password" id="pgPw" autocomplete="new-password" placeholder="${curP.has_password ? "•••••• (set — type to change)" : "No password"}" style="flex:1;" /><button class="btn btn-sm" id="pgPwSave" type="button">Set</button></div>${curP.has_password ? '<button class="btn btn-xs" id="pgPwClear" type="button" style="margin-top:.4rem;width:100%;">Remove password</button>' : ""}</div><div class="bld-sep" style="margin:.6rem 0;"></div><p style="font-weight:100;font-size:.62rem;letter-spacing:.06em;color:var(--muted);line-height:1.8;">Hover a section and click <strong style="color:rgba(77,189,106,.6);font-weight:300;">Edit</strong> to change its content.</p></div>`;
      panel.querySelector("#pgName").addEventListener("change", bldApplyPageMeta);
      panel.querySelector("#pgSlug").addEventListener("change", bldApplyPageMeta);
      panel.querySelector("#pgTitle").addEventListener("input", (e) => {
        bldState.page_title = e.target.value;
        bldSaveDraft();
      });
      panel.querySelector("#pgSub").addEventListener("input", (e) => {
        bldState.page_subtitle = e.target.value;
        bldSaveDraft();
      });
      panel.querySelector("#pgImage").addEventListener("input", (e) => {
        bldState.page_image = e.target.value;
        bldSaveDraft();
      });
      panel.querySelector("#pgImagePick").addEventListener(
        "click",
        () => openImgPicker((url) => {
          bldState.page_image = url;
          const i = panel.querySelector("#pgImage");
          if (i) i.value = url;
          bldSaveDraft();
        })
      );
      panel.querySelector("#pgNav").addEventListener("change", (e) => {
        bldState.show_in_nav = e.target.value === "yes";
        e.target.value = bldState.show_in_nav ? "yes" : "no";
        bldSaveDraft();
      });
      panel.querySelector("#pgPwSave").addEventListener("click", () => {
        const v = panel.querySelector("#pgPw")?.value || "";
        if (!v) {
          toast("Type a password first.", true);
          return;
        }
        bldSavePagePassword(bldPageId, v);
      });
      panel.querySelector("#pgPwClear")?.addEventListener("click", () => bldSavePagePassword(bldPageId, ""));
    } else {
      panel.innerHTML = '<p class="bld-editor-hint">Select or create a page to get started.</p>';
    }
    return;
  }
  let s, parentGroup = null;
  if (bldParentId) {
    parentGroup = bldState.sections.find((g) => g.id === bldParentId);
    s = parentGroup ? (parentGroup.sections || []).find((c) => c.id === bldSel) : null;
  } else {
    s = bldState.sections.find((x) => x.id === bldSel);
  }
  if (!s) return;
  const { html, label } = bEditorFields(s);
  const backBtn = parentGroup ? `<button class="btn btn-xs" id="bEdBack" style="margin-bottom:.6rem;width:100%;">← Back to group</button>` : "";
  const interactBtn = !parentGroup && typeof foyerInteractive === "function" && foyerInteractive(s.type) && typeof foyerInteractionsBeta === "function" && foyerInteractionsBeta() ? `<button class="btn btn-sm" id="bEdInteract" style="width:100%;margin:.55rem 0 .3rem;display:flex;align-items:center;justify-content:center;gap:.45rem;">${typeof foyerIcon === "function" ? foyerIcon("@bolt", "1em") : "⚡"} Interactions <span style="font-size:.5rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;background:linear-gradient(135deg,#f0d792,#cda63f);color:#191205;padding:.08rem .3rem;border-radius:3px;">Ultra</span></button>` : "";
  panel.innerHTML = `<div class="bld-ep">${backBtn}<div class="bld-ep-head">${label} <span class="bld-ep-type">${parentGroup ? "in Group" : "Section"}</span></div>${interactBtn}${html}</div>`;
  if (parentGroup) {
    panel.querySelector("#bEdBack")?.addEventListener("click", () => {
      bldSel = parentGroup.id;
      bldParentId = null;
      bldDrawEditor();
    });
  }
  panel.querySelector("#bEdInteract")?.addEventListener("click", () => {
    if (typeof openInteractions === "function") openInteractions(s.id);
  });
  bBindEditor(panel, s, (sec, extra) => {
    if (parentGroup) {
      bldDrawCanvas();
    } else {
      bldPatch(sec);
    }
    if (extra === "re-editor") bldDrawEditor();
  });
  bldInitPickers(panel);
}
async function bldBoot() {
  if (bldBooted) return;
  bldBooted = true;
  fetch("/api/ai/page", { headers: authHeaders() }).then((r) => r.json()).then((d) => {
    if (d && d.enabled === false) {
      bldAiOn = false;
      document.getElementById("bldAiBtn")?.style.setProperty("display", "none");
      document.getElementById("mBldAi")?.style.setProperty("display", "none");
      if (bldPageId) bldDrawCanvas();
    }
  }).catch(() => {
  });
  bldInitColoris();
  if (!_colorisReady) setTimeout(bldInitColoris, 600);
  document.getElementById("bldBg").addEventListener("input", (e) => {
    bldState.bg = e.target.value;
    bldDrawCanvas();
  });
  document.getElementById("bldAccent").addEventListener("input", (e) => {
    bldState.accent = e.target.value;
    bldDrawCanvas();
    if (bldSel) bldDrawEditor();
  });
  document.getElementById("bldText").addEventListener("input", (e) => {
    bldState.text = e.target.value;
    bldDrawCanvas();
  });
  document.getElementById("bldFont").addEventListener("change", (e) => {
    bldState.font = e.target.value;
    bldDrawCanvas();
  });
  document.getElementById("bldBgStyle").addEventListener("change", (e) => {
    bldState.bg_style = e.target.value;
    bldBgControls();
    bldDrawCanvas();
  });
  document.getElementById("bldBgColor2").addEventListener("input", (e) => {
    bldState.bg_color2 = e.target.value;
    bldDrawCanvas();
  });
  document.getElementById("bldBgAngle").addEventListener("input", (e) => {
    bldState.bg_angle = e.target.value;
    bldDrawCanvas();
  });
  document.getElementById("bldBgImage").addEventListener("input", (e) => {
    bldState.bg_image = e.target.value;
    bldDrawCanvas();
  });
  document.getElementById("bldBgOverlay").addEventListener("input", (e) => {
    bldState.bg_overlay = e.target.value;
    bldDrawCanvas();
  });
  document.getElementById("bldBgAnim").addEventListener("change", (e) => {
    bldState.bg_anim = e.target.checked;
    bldDrawCanvas();
  });
  document.getElementById("bldOpenPicker").addEventListener("click", bldOpenPicker);
  document.getElementById("bldAiBtn")?.addEventListener("click", bldAssistant);
  const _fab = document.getElementById("bldAddFab"), _picker = document.getElementById("bldOpenPicker");
  if (_fab && _picker && "IntersectionObserver" in window) {
    _fab.addEventListener("click", bldOpenPicker);
    new IntersectionObserver(
      (es) => {
        _fab.classList.toggle("visible", !es[0].isIntersecting);
      },
      { threshold: 0 }
    ).observe(_picker);
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") bldClosePicker();
  });
  document.getElementById("bldAddPageBtn").addEventListener("click", () => {
    const f = document.getElementById("bldNewPageForm");
    f.style.display = f.style.display === "none" ? "" : "none";
  });
  document.getElementById("bldNPCancel").addEventListener("click", () => {
    document.getElementById("bldNewPageForm").style.display = "none";
  });
  document.getElementById("bldNPCreate").addEventListener("click", async () => {
    const title = document.getElementById("bldNPTitle").value.trim();
    const rawSlug = document.getElementById("bldNPSlug").value.trim();
    if (!title || !rawSlug) {
      toast("Title and slug are required.", true);
      return;
    }
    const slug = rawSlug.startsWith("/") ? rawSlug : "/" + rawSlug;
    const isText = document.getElementById("bldNPType")?.value === "text";
    const initJson = JSON.stringify(
      isText ? { kind: "text", font: "Josefin Sans", desc: "", cover: "", body: "" } : {
        bg: __SITE__.bg,
        accent: __SITE__.accent,
        text: __SITE__.text,
        font: "Josefin Sans",
        sections: []
      }
    );
    const res = await fetch("/api/pages", {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ title, slug, page_json: initJson })
    });
    if (!res.ok) {
      const d = await res.json();
      toast(d.error || "Error creating page.", true);
      return;
    }
    const data = await res.json();
    document.getElementById("bldNewPageForm").style.display = "none";
    document.getElementById("bldNPTitle").value = "";
    document.getElementById("bldNPSlug").value = "";
    bldPages.push({ id: data.id, title, slug, page_json: initJson, is_published: 1 });
    bldDrawPages();
    bldPickPage(data.id);
  });
  document.getElementById("bldPreview").addEventListener("click", () => {
    const p = bldPages.find((x) => x.id === bldPageId);
    if (!p) return;
    window.open(p.slug === "/" ? "/" : "/" + p.slug.replace(/^\//, ""), "_blank");
  });
  document.getElementById("bldDiscardBtn")?.addEventListener("click", () => {
    if (!bldPageId) {
      toast("Pick a page first.", true);
      return;
    }
    const p = bldPages.find((x) => x.id === bldPageId);
    if (p && bldPageUnsaved(p)) bldDiscardDraft(bldPageId);
    else toast("No unsaved changes to discard.");
  });
  document.getElementById("bldPublish").addEventListener("click", async () => {
    if (!bldPageId) {
      toast("No page selected.", true);
      return;
    }
    const sp = document.getElementById("bldSpinner"), btn = document.getElementById("bldPublish");
    sp.style.display = "block";
    btn.disabled = true;
    const tasks = [];
    const curP = bldPages.find((x) => x.id === bldPageId);
    if (curP) tasks.push({ id: bldPageId, title: curP.title, json: JSON.stringify(bldState) });
    for (const p of bldPages) {
      if (p.id === bldPageId) continue;
      try {
        const raw = _ls.getItem(bldDraftKey(p.id));
        if (raw) {
          const d = JSON.parse(raw);
          const j = JSON.stringify(d.state);
          if (j !== (p.page_json || "")) tasks.push({ id: p.id, title: p.title, json: j });
        }
      } catch {
      }
    }
    let ok = 0, fail = 0;
    for (const t of tasks) {
      const res = await fetch(`/api/pages/${t.id}`, {
        method: "PUT",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ title: t.title, page_json: t.json })
      });
      if (res.ok) {
        const idx = bldPages.findIndex((x) => x.id === t.id);
        if (idx >= 0) bldPages[idx].page_json = t.json;
        bldClearDraft(t.id);
        ok++;
      } else fail++;
    }
    sp.style.display = "none";
    btn.disabled = false;
    bldDrawPages();
    if (fail) toast(`Published ${ok}, ${fail} failed.`, true);
    else toast(ok > 1 ? `Published all ${ok} pages!` : "Published!");
  });
}
async function bldLoadPages() {
  const loading = document.getElementById("bldLoading");
  loading.style.display = "flex";
  const prevId = bldPageId;
  const res = await fetch("/api/pages", { headers: authHeaders() });
  if (res.ok) {
    bldPages = await res.json();
    if (!bldPages.find((p) => p.slug === "/")) {
      const sRes = await fetch("/api/settings");
      let existingJson = "";
      if (sRes.ok) {
        const s = await sRes.json();
        existingJson = s.page_json || "";
      }
      const initJson = existingJson || JSON.stringify({
        bg: __SITE__.bg,
        accent: __SITE__.accent,
        text: __SITE__.text,
        font: "Josefin Sans",
        sections: []
      });
      const cr = await fetch("/api/pages", {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Home", slug: "/", page_json: initJson })
      });
      if (cr.ok) {
        const d = await cr.json();
        bldPages.unshift({
          id: d.id,
          title: "Home",
          slug: "/",
          page_json: initJson,
          is_published: 1
        });
      }
    }
  }
  loading.style.display = "none";
  bldDrawPages();
  const toSelect = prevId && bldPages.find((p) => p.id === prevId) ? prevId : bldPages[0]?.id || null;
  if (toSelect) bldPickPage(toSelect);
}
