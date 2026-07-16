const bkEl = (id) => document.getElementById(id);
let _bkBundle = null,
  _bkWired = false;
function bkProgressOverlay(title) {
  const ov = document.createElement("div");
  ov.id = "bkProg";
  ov.style.cssText =
    'position:fixed;inset:0;z-index:99996;background:rgba(var(--bg-rgb),.92);backdrop-filter:blur(7px);display:flex;align-items:center;justify-content:center;font-family:"Josefin Sans",sans-serif;';
  ov.innerHTML = `\n    <div style="text-align:center;max-width:340px;width:100%;padding:2rem;">\n      <svg viewBox="0 0 44 50" width="26" height="30" fill="none" stroke="rgba(var(--accent-rgb),.8)" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:1.2rem;"><path d="M5 46 V24 a16 16 0 0 1 32 0 V46"/><path d="M15 46 V28 a6 6 0 0 1 12 0 V46"/></svg>\n      <p style="font-family:'Unbounded',sans-serif;font-weight:200;font-size:.85rem;color:rgba(220,245,225,.92);margin:0 0 .4rem;">${title}</p>\n      <p id="bkProgStatus" style="font-weight:100;font-size:.66rem;letter-spacing:.04em;color:rgba(220,245,225,.45);margin:0 0 1.4rem;">Starting…</p>\n      <div style="height:6px;background:rgba(var(--accent-rgb),.12);border-radius:99px;overflow:hidden;position:relative;">\n        <div id="bkProgBar" style="height:100%;width:0%;background:var(--accent);border-radius:99px;transition:width .25s ease;"></div>\n      </div>\n      <p id="bkProgPct" style="margin-top:.7rem;font-size:.6rem;font-weight:100;letter-spacing:.12em;color:rgba(220,245,225,.3);font-variant-numeric:tabular-nums;">0%</p>\n    </div>`;
  document.body.appendChild(ov);
  const bar = ov.querySelector("#bkProgBar"),
    st = ov.querySelector("#bkProgStatus"),
    pct = ov.querySelector("#bkProgPct");
  return {
    status: (t) => {
      st.textContent = t;
    },
    set: (p) => {
      bar.classList.remove("bk-bar-indet");
      p = Math.max(0, Math.min(100, p));
      bar.style.width = p + "%";
      pct.textContent = Math.round(p) + "%";
    },
    indeterminate: (on) => {
      if (on) {
        bar.style.width = "";
        bar.classList.add("bk-bar-indet");
        pct.textContent = "";
      } else bar.classList.remove("bk-bar-indet");
    },
    done: (msg) => {
      bar.classList.remove("bk-bar-indet");
      bar.style.width = "100%";
      pct.textContent = "100%";
      if (msg) st.textContent = msg;
    },
    fail: (msg) => {
      bar.classList.remove("bk-bar-indet");
      bar.style.background = "#e0556a";
      if (msg) st.textContent = msg;
    },
    close: () => ov.remove(),
  };
}
function bkSaveBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2e3);
}
async function bkDownload() {
  const scope = bkEl("bkScope").value;
  let q = "?scope=" + encodeURIComponent(scope);
  if (scope === "page") {
    const slug = bkEl("bkPage").value;
    if (!slug) {
      toast("Pick a page first", true);
      return;
    }
    q += "&slug=" + encodeURIComponent(slug);
  }
  const ov = bkProgressOverlay("Creating backup");
  ov.status("Preparing on the server…");
  ov.indeterminate(true);
  try {
    const r = await fetch("/api/backup" + q, { headers: authHeaders() });
    if (!r.ok) {
      let m = "Backup failed";
      try {
        const d = await r.json();
        if (d && d.error) m = d.error;
      } catch (e) {}
      ov.fail(m);
      setTimeout(ov.close, 2600);
      toast(m, true);
      return;
    }
    const name =
      (typeof __SITE__ !== "undefined" && (__SITE__.shortName || __SITE__.name)) || "foyer";
    const filename = `${String(name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}-${scope}-${new Date().toISOString().slice(0, 10)}.foyer`;
    const len = +(r.headers.get("Content-Length") || 0);
    if (r.body && len) {
      ov.status("Downloading…");
      ov.set(0);
      const reader = r.body.getReader();
      const chunks = [];
      let received = 0;
      for (;;) {
        const { done: done, value: value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        ov.set((received / len) * 100);
      }
      bkSaveBlob(new Blob(chunks, { type: "application/json" }), filename);
    } else {
      ov.status("Downloading…");
      ov.indeterminate(true);
      bkSaveBlob(await r.blob(), filename);
    }
    ov.done("Backup downloaded");
    toast("Backup downloaded");
    setTimeout(ov.close, 1100);
  } catch (e) {
    ov.fail("Backup failed");
    setTimeout(ov.close, 1600);
    toast("Backup failed", true);
  }
}
const _BK_MAGIC = [70, 79, 89, 82, 69, 78, 67, 50];
const _bkSealedNote =
  '<div style="font-size:.72rem;color:rgba(220,245,225,.55);line-height:1.8;">🔒 Encrypted Foyer backup — sealed; it’ll be decrypted on the server during restore.</div>';
function bkFileChosen(file) {
  _bkBundle = null;
  bkEl("bkRestore").disabled = true;
  bkEl("bkSummary").innerHTML = "";
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const bytes = new Uint8Array(reader.result);
    if (bytes.length > 20 && _BK_MAGIC.every((c, i) => bytes[i] === c)) {
      _bkBundle = { binary: true, buf: reader.result };
      bkEl("bkSummary").innerHTML = _bkSealedNote;
      bkEl("bkRestore").disabled = false;
      return;
    }
    let txt = "";
    try {
      txt = new TextDecoder().decode(bytes);
    } catch {}
    let b;
    try {
      b = JSON.parse(txt);
    } catch {
      bkEl("bkSummary").innerHTML =
        '<span style="color:#e0556a;">That file isn’t a valid Foyer backup.</span>';
      return;
    }
    if (b && b.foyer_enc === 1) {
      _bkBundle = { binary: false, obj: b };
      bkEl("bkSummary").innerHTML = _bkSealedNote;
      bkEl("bkRestore").disabled = false;
      return;
    }
    if (!b || b.foyer_backup !== 1 || !b.data) {
      bkEl("bkSummary").innerHTML = '<span style="color:#e0556a;">Not a Foyer backup file.</span>';
      return;
    }
    _bkBundle = { binary: false, obj: b };
    const d = b.data,
      n = (a) => (Array.isArray(a) ? a.length : 0);
    const parts = [
      `${n(d.pages)} pages`,
      `${n(d.collections)} collections`,
      `${n(d.collection_items)} entries`,
      `${n(d.tutorials)} tutorials`,
      `${n(d.reviews)} reviews`,
      `${n(d.images)} images`,
      `${n(d.files)} files`,
    ];
    if (d.settings) parts.push("site settings");
    bkEl("bkSummary").innerHTML =
      `<div style="font-size:.72rem;color:rgba(220,245,225,.55);line-height:1.8;">Scope: <b style="color:rgba(220,245,225,.85);">${b.scope || "?"}</b> · ${b.created ? new Date(b.created).toLocaleString() : "unknown date"}<br>${parts.join(" · ")}</div>`;
    bkEl("bkRestore").disabled = false;
  };
  reader.readAsArrayBuffer(file);
}
async function bkRestore() {
  if (!_bkBundle) return;
  const msg =
    "Restore this backup? Pages, entries and settings with the same slug/key will be overwritten; anything not in the backup is left as-is.";
  const ok = typeof dlg !== "undefined" && dlg.confirm ? await dlg.confirm(msg) : confirm(msg);
  if (!ok) return;
  const isBin = _bkBundle.binary;
  const body = isBin ? _bkBundle.buf : JSON.stringify(_bkBundle.obj);
  const ov = bkProgressOverlay("Restoring backup");
  ov.status("Uploading…");
  ov.set(0);
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/api/backup/restore");
  const h = authHeaders();
  for (const k in h) xhr.setRequestHeader(k, h[k]);
  xhr.setRequestHeader("Content-Type", isBin ? "application/octet-stream" : "application/json");
  xhr.upload.onprogress = (e) => {
    if (e.lengthComputable) ov.set((e.loaded / e.total) * 100);
  };
  xhr.upload.onload = () => {
    ov.set(100);
    ov.status("Applying to the database…");
    ov.indeterminate(true);
  };
  xhr.onload = () => {
    let d = {};
    try {
      d = JSON.parse(xhr.responseText);
    } catch {}
    if (xhr.status >= 200 && xhr.status < 300) {
      const c = d.counts || {};
      ov.done("Restored — reloading…");
      ov.status(
        `${c.pages || 0} pages · ${c.collection_items || 0} entries · ${c.images || 0} images · ${c.files || 0} files`
      );
      toast("Restored");
      setTimeout(() => location.reload(), 1900);
    } else {
      ov.fail(d.error || "Restore failed");
      toast(d.error || "Restore failed", true);
      setTimeout(ov.close, 2e3);
    }
  };
  xhr.onerror = () => {
    ov.fail("Network error");
    toast("Restore failed", true);
    setTimeout(ov.close, 2e3);
  };
  xhr.send(body);
}
async function renderBackupTab() {
  if (!_bkWired) {
    _bkWired = true;
    bkEl("bkScope").addEventListener("change", () => {
      bkEl("bkPageWrap").style.display = bkEl("bkScope").value === "page" ? "block" : "none";
    });
    bkEl("bkDownload").addEventListener("click", bkDownload);
    bkEl("bkFile").addEventListener("change", (e) => bkFileChosen(e.target.files[0]));
    bkEl("bkRestore").addEventListener("click", bkRestore);
  }
  try {
    const pages = await fetch("/api/pages", { headers: authHeaders() }).then((r) => r.json());
    if (Array.isArray(pages))
      bkEl("bkPage").innerHTML = pages
        .map(
          (p) =>
            `<option value="${(p.slug || "").replace(/"/g, "&quot;")}">${(p.title || p.slug || "").replace(/</g, "&lt;")} — ${(p.slug || "").replace(/</g, "&lt;")}</option>`
        )
        .join("");
  } catch (e) {}
}
