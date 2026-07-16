let _tutList = [];
let _tutSel = null;
let _tutDirty = false;
let _tutPublished = null;
function tutDraftKey(id) {
  return "foyer_tutdraft_" + id;
}
function tutFormState() {
  const g = (id) => document.getElementById(id);
  if (!g("tutContent")) return null;
  return {
    title: g("tutTitle").value,
    slug: g("tutSlug").value,
    description: g("tutDesc").value,
    cover_image: g("tutCover").value,
    content: g("tutContent").value,
  };
}
function tutSaveDraft() {
  if (_tutSel == null) return;
  const f = tutFormState();
  if (!f) return;
  if (_tutPublished && JSON.stringify(f) === JSON.stringify(_tutPublished)) {
    tutClearDraft(_tutSel);
    const st = document.getElementById("tutStatus");
    if (st) st.textContent = "";
    renderTutList();
    return;
  }
  try {
    _ls.setItem(tutDraftKey(_tutSel), JSON.stringify({ state: f, ts: Date.now() }));
  } catch {}
  const st = document.getElementById("tutStatus");
  if (st) st.textContent = "Saved draft";
  renderTutList();
}
function tutClearDraft(id) {
  try {
    _ls.removeItem(tutDraftKey(id));
  } catch {}
}
function tutUnsaved(t) {
  try {
    return !!_ls.getItem(tutDraftKey(t.id));
  } catch {
    return false;
  }
}
setInterval(() => {
  if (document.getElementById("sec-tutorials")?.classList.contains("active")) tutSaveDraft();
}, 4e3);
async function fetchTutorials() {
  const res = await fetch("/api/tutorials", { headers: authHeaders() });
  if (!res.ok) return;
  _tutList = await res.json();
  renderTutList();
}
function renderTutList() {
  const el = document.getElementById("tutListItems");
  if (!el) return;
  if (!_tutList.length) {
    el.innerHTML =
      '<p style="font-size:.62rem;font-weight:100;color:var(--muted);padding:1rem .5rem;">No tutorials yet.</p>';
    return;
  }
  el.innerHTML = _tutList
    .map(
      (t) =>
        `\n    <div class="tut-list-item${_tutSel === t.id ? " active" : ""}" data-tid="${t.id}" style="position:relative;padding:.6rem .7rem;cursor:pointer;border-radius:2px;margin-bottom:.2rem;transition:background .12s;${_tutSel === t.id ? "background:rgba(77,189,106,.08);border-left:2px solid var(--green);padding-left:.5rem;" : ""}">\n      ${tutUnsaved(t) ? `<span class="unsaved-badge" data-discard="${t.id}" title="Discard unsaved changes">!</span>` : ""}\n      <div style="font-weight:200;font-size:.75rem;color:${_tutSel === t.id ? "var(--white)" : "rgba(220,245,225,.75)"};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding-right:16px;">${escHtml(t.title || "Untitled")}</div>\n      <div style="font-size:.58rem;font-weight:100;color:var(--muted);margin-top:.15rem;">${timeAgo(t.created_at)}</div>\n    </div>`
    )
    .join("");
  el.querySelectorAll("[data-tid]").forEach((row) => {
    row.addEventListener("click", (e) => {
      if (e.target.closest("[data-discard]")) return;
      selectTutorial(+row.dataset.tid);
    });
  });
  el.querySelectorAll("[data-discard]").forEach((badge) =>
    badge.addEventListener("click", async (e) => {
      e.stopPropagation();
      const id = +badge.dataset.discard;
      if (
        !(await dlg.confirm("Discard unsaved changes for this tutorial?", {
          confirm: "Discard",
          danger: true,
        }))
      )
        return;
      tutClearDraft(id);
      renderTutList();
      if (id === _tutSel) {
        _tutDirty = false;
        const res = await fetch(`/api/tutorials/${id}`, { headers: authHeaders() });
        if (res.ok) renderTutEditor(await res.json());
      }
      toast("Draft discarded");
    })
  );
}
async function selectTutorial(id) {
  if (
    _tutDirty &&
    !(await dlg.confirm("You have unsaved changes. Discard them?", {
      confirm: "Discard",
      danger: true,
    }))
  )
    return;
  _tutDirty = false;
  _tutSel = id;
  renderTutList();
  const res = await fetch(`/api/tutorials/${id}`, { headers: authHeaders() });
  if (!res.ok) return;
  let t = await res.json();
  _tutPublished = {
    title: t.title,
    slug: t.slug,
    description: t.description,
    cover_image: t.cover_image,
    content: t.content || "",
  };
  try {
    const raw = _ls.getItem(tutDraftKey(id));
    if (raw) {
      const d = JSON.parse(raw);
      const fresh = d.ts && Date.now() - d.ts < 24 * 3600 * 1e3;
      const differs =
        d.state &&
        (d.state.title !== t.title ||
          d.state.slug !== t.slug ||
          d.state.description !== t.description ||
          d.state.cover_image !== t.cover_image ||
          (d.state.content || "") !== (t.content || ""));
      if (fresh && differs) {
        t = { ...t, ...d.state };
        setTimeout(() => toast("Restored unsaved draft"), 300);
      } else if (!fresh || !differs) tutClearDraft(id);
    }
  } catch {}
  renderTutEditor(t);
}
function renderTutEditor(t) {
  const el = document.getElementById("tutEditor");
  if (!el) return;
  el.innerHTML = `\n    <div style="max-width:760px;width:100%;display:flex;flex-direction:column;gap:1rem;">\n      <div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;">\n        <div style="font-family:'Unbounded',sans-serif;font-weight:200;font-size:.78rem;color:var(--white);">Edit Tutorial</div>\n        <div style="display:flex;gap:.5rem;align-items:center;">\n          <span class="save-status" id="tutStatus"></span>\n          <div class="spinner" id="tutSpinner" style="display:none;"></div>\n          <button class="btn btn-xs btn-danger" id="tutDelBtn">Delete</button>\n          <button class="btn btn-primary btn-xs" id="tutSaveBtn">Save</button>\n        </div>\n      </div>\n      <div class="field"><label>Title</label><input type="text" id="tutTitle" value="${escHtml(t.title || "")}" /></div>\n      <div class="field"><label>Slug <span style="opacity:.5">(URL: /tutorials/slug)</span></label><input type="text" id="tutSlug" value="${escHtml(t.slug || "")}" placeholder="my-tutorial" /></div>\n      <div class="field"><label>Description <span style="opacity:.5">(shown in listings)</span></label><input type="text" id="tutDesc" value="${escHtml(t.description || "")}" /></div>\n      <div class="field"><label>Cover Image</label>\n        <div style="display:flex;gap:.4rem;">\n          <input type="text" id="tutCover" value="${escHtml(t.cover_image || "")}" placeholder="/api/images/1" style="flex:1;" />\n          <button class="btn btn-xs" id="tutPickImg">Pick</button>\n        </div>\n        ${t.cover_image ? `<img src="${escHtml(t.cover_image)}" style="margin-top:.5rem;max-height:100px;max-width:200px;object-fit:cover;border:1px solid var(--border);" />` : ""}\n      </div>\n      <div class="field">\n        <label>Content <span style="opacity:.5">(Markdown)</span></label>\n        ${mdToolbarHTML()}\n        <textarea id="tutContent" rows="20" style="font-family:'Courier New',monospace;font-size:.78rem;line-height:1.65;">${escHtml(t.content || "")}</textarea>\n      </div>\n    </div>`;
  ["tutTitle", "tutSlug", "tutDesc", "tutCover", "tutContent"].forEach((id) => {
    document.getElementById(id)?.addEventListener("input", () => {
      _tutDirty = true;
      document.getElementById("tutStatus").textContent = "";
      tutSaveDraft();
    });
  });
  document.getElementById("tutPickImg").addEventListener("click", () => {
    openImgPicker((url) => {
      document.getElementById("tutCover").value = url;
      _tutDirty = true;
      tutSaveDraft();
    });
  });
  wireMdToolbar(el, document.getElementById("tutContent"), () => {
    _tutDirty = true;
    tutSaveDraft();
  });
  document.getElementById("tutSaveBtn").addEventListener("click", async () => {
    const spinner = document.getElementById("tutSpinner");
    const status = document.getElementById("tutStatus");
    spinner.style.display = "block";
    const body = {
      title: document.getElementById("tutTitle").value.trim(),
      slug: document.getElementById("tutSlug").value.trim(),
      description: document.getElementById("tutDesc").value.trim(),
      cover_image: document.getElementById("tutCover").value.trim(),
      content: document.getElementById("tutContent").value,
    };
    const res = await fetch(`/api/tutorials/${t.id}`, {
      method: "PUT",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    spinner.style.display = "none";
    if (res.ok) {
      _tutDirty = false;
      _tutPublished = tutFormState();
      tutClearDraft(t.id);
      status.textContent = "Saved.";
      const idx = _tutList.findIndex((x) => x.id === t.id);
      if (idx >= 0) _tutList[idx] = { ..._tutList[idx], ...body };
      renderTutList();
      toast("Tutorial saved");
    } else {
      status.textContent = "Error saving.";
    }
  });
  document.getElementById("tutDelBtn").addEventListener("click", async () => {
    if (
      !(await dlg.confirm(`Delete "${t.title}"? This cannot be undone.`, {
        danger: true,
        confirm: "Delete",
      }))
    )
      return;
    await fetch(`/api/tutorials/${t.id}`, { method: "DELETE", headers: authHeaders() });
    tutClearDraft(t.id);
    _tutList = _tutList.filter((x) => x.id !== t.id);
    _tutSel = null;
    _tutDirty = false;
    renderTutList();
    document.getElementById("tutEditor").innerHTML =
      '<p style="font-weight:100;font-size:.68rem;color:var(--muted);margin:auto;text-align:center;">Select a tutorial or create a new one.</p>';
    toast("Deleted");
  });
}
async function createTutorial() {
  if (
    _tutDirty &&
    !(await dlg.confirm("You have unsaved changes. Discard them?", {
      confirm: "Discard",
      danger: true,
    }))
  )
    return;
  const title = await new Promise((resolve) => {
    const bd = document.createElement("div");
    bd.style.cssText =
      "position:fixed;inset:0;z-index:99990;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center;padding:1.5rem;";
    bd.innerHTML = `<div style="background:var(--panel);border:1px solid rgba(77,189,106,.18);max-width:360px;width:100%;padding:1.6rem 1.8rem;">\n      <p style="font-family:'Unbounded',sans-serif;font-weight:200;font-size:.78rem;color:#f0f7f1;margin-bottom:.8rem;">New Tutorial</p>\n      <input id="_tutTitleInput" type="text" placeholder="Tutorial title" autofocus style="width:100%;background:var(--panel);border:1px solid var(--border);color:var(--white);font-size:.82rem;padding:.6rem .85rem;outline:none;font-family:inherit;margin-bottom:1rem;" />\n      <div style="display:flex;gap:.6rem;justify-content:flex-end;">\n        <button id="_tutCancel" style="font-family:'Josefin Sans',sans-serif;font-size:.58rem;letter-spacing:.2em;text-transform:uppercase;padding:.45rem 1.2rem;border:1px solid rgba(77,189,106,.2);background:transparent;color:rgba(180,230,190,.5);cursor:pointer;">Cancel</button>\n        <button id="_tutCreate" style="font-family:'Josefin Sans',sans-serif;font-size:.58rem;letter-spacing:.2em;text-transform:uppercase;padding:.45rem 1.2rem;border:1px solid rgba(77,189,106,.5);background:transparent;color:rgba(77,189,106,.9);cursor:pointer;">Create</button>\n      </div></div>`;
    document.body.appendChild(bd);
    const inp = bd.querySelector("#_tutTitleInput");
    inp.focus();
    bd.querySelector("#_tutCancel").addEventListener("click", () => {
      bd.remove();
      resolve(null);
    });
    bd.querySelector("#_tutCreate").addEventListener("click", () => {
      bd.remove();
      resolve(inp.value);
    });
    inp.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        bd.remove();
        resolve(inp.value);
      }
      if (e.key === "Escape") {
        bd.remove();
        resolve(null);
      }
    });
  });
  if (!title?.trim()) return;
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const res = await fetch("/api/tutorials", {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      title: title.trim(),
      slug: slug,
      description: "",
      content: "",
      cover_image: "",
    }),
  });
  if (!res.ok) {
    await dlg.alert("Failed to create tutorial.");
    return;
  }
  const { id: id } = await res.json();
  _tutList.unshift({
    id: id,
    title: title.trim(),
    slug: slug,
    description: "",
    cover_image: "",
    created_at: new Date().toISOString(),
  });
  _tutDirty = false;
  _tutSel = id;
  renderTutList();
  renderTutEditor({
    id: id,
    title: title.trim(),
    slug: slug,
    description: "",
    content: "",
    cover_image: "",
  });
}
document.getElementById("tutNewBtn")?.addEventListener("click", createTutorial);
