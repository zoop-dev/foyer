export const PACK = {
  name: "charts",
  label: "Charts",
  description: "Bar, line, donut, radar and other hand-drawn charts for dashboards, reports and stats sections — no external chart library, just inline SVG.",
  icon: "bar-chart-2"
};
function esc(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function attr(s) {
  return String(s ?? "").replace(/"/g, "&quot;");
}
function num(v, d = 0) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : d;
}
function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}
function wrap(h, inner) {
  return `<div style="${h.ff}${h.fc}padding:2rem;">${inner}</div>`;
}
function titleHtml(h, title) {
  if (!title) return "";
  return `<div style="font-size:.85rem;font-weight:300;letter-spacing:.08em;color:${h.rgb(h.text, 0.85)};margin-bottom:1.4rem;text-align:center;">${h.E(title)}</div>`;
}
function placeholder(h, msg) {
  return `<div style="font-size:.65rem;letter-spacing:.2em;text-transform:uppercase;color:${h.rgb(h.accent, 0.25)};text-align:center;padding:1.5rem 1rem;">${h.E(msg || "Add chart data in editor")}</div>`;
}
const PALETTE_ALPHAS = [1, 0.7, 0.5, 0.34, 0.24, 0.85, 0.6, 0.42, 0.3, 0.9];
function colorFor(it, i, h) {
  if (it && it.color) return it.color;
  return h.rgb(h.accent, PALETTE_ALPHAS[i % PALETTE_ALPHAS.length]);
}
function titleField(s) {
  return `<div class="bld-ef"><label>Title <span style="opacity:.5">(optional)</span></label><input type="text" data-f="title" value="${attr(s.title)}" /></div>`;
}
function listEditor(s, containerId, fields, addLabel, shape) {
  const items = s.items || [];
  const rows = items.map((it, i) => {
    const inputs = fields.map((f) => {
      const val = attr(it ? it[f.key] : "");
      if (f.type === "select") {
        const opts = f.options.map(
          (o) => `<option value="${attr(o.v)}"${(it && it[f.key]) === o.v ? " selected" : ""}>${esc(o.l)}</option>`
        ).join("");
        return `<div class="bld-ef"><label>${esc(f.label)}</label><select data-li="${i}" data-lf="${f.key}">${opts}</select></div>`;
      }
      return `<div class="bld-ef"><label>${esc(f.label)}</label><input type="${f.type || "text"}" data-li="${i}" data-lf="${f.key}" value="${val}" ${f.placeholder ? `placeholder="${attr(f.placeholder)}"` : ""} /></div>`;
    }).join("");
    return `<div class="bld-li-item"><button class="bld-li-rm" data-lrm="${i}">✕</button>${inputs}</div>`;
  }).join("");
  return `<div id="${containerId}">${rows}</div><button class="bld-add-li bld-add-item" data-shape='${JSON.stringify(shape)}'>+ ${esc(addLabel)}</button>`;
}
function barHtml(s, h) {
  const items = (s.items || []).filter(Boolean);
  const title = titleHtml(h, s.title);
  if (!items.length) return wrap(h, title + placeholder(h));
  const max = Math.max(...items.map((it) => num(it.value)), 1);
  const horizontal = s.orientation === "horizontal";
  if (horizontal) {
    const rows = items.map((it) => {
      const pct = clamp(num(it.value) / max * 100, 1, 100);
      return `<div style="display:flex;align-items:center;gap:.85rem;margin-bottom:.7rem;">
        <div style="width:6rem;flex-shrink:0;font-size:.62rem;font-weight:200;letter-spacing:.1em;text-transform:uppercase;color:${h.rgb(h.text, 0.55)};text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${h.E(it.label || "")}</div>
        <div style="flex:1;background:${h.rgb(h.text, 0.08)};border-radius:.2rem;height:.85rem;overflow:hidden;">
          <div style="width:${pct}%;height:100%;background:${h.rgb(h.accent, 0.75)};border-radius:.2rem;"></div>
        </div>
        <div style="width:3rem;flex-shrink:0;font-size:.68rem;font-weight:200;color:${h.rgb(h.text, 0.65)};">${h.E(String(it.value ?? ""))}</div>
      </div>`;
    }).join("");
    return wrap(h, title + `<div>${rows}</div>`);
  }
  const bars = items.map((it) => {
    const pct = clamp(num(it.value) / max * 100, 2, 100);
    return `<div style="display:flex;flex-direction:column;align-items:center;gap:.55rem;flex:1;min-width:0;">
        <div style="font-size:.68rem;font-weight:200;color:${h.rgb(h.text, 0.7)};">${h.E(String(it.value ?? ""))}</div>
        <div style="width:100%;max-width:2.75rem;height:9rem;display:flex;align-items:flex-end;">
          <div style="width:100%;height:${pct}%;background:${h.rgb(h.accent, 0.75)};border-radius:.2rem .2rem 0 0;"></div>
        </div>
        <div style="font-size:.6rem;font-weight:200;letter-spacing:.12em;text-transform:uppercase;color:${h.rgb(h.text, 0.5)};text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;width:100%;">${h.E(it.label || "")}</div>
      </div>`;
  }).join("");
  return wrap(h, title + `<div style="display:flex;align-items:flex-end;gap:1rem;">${bars}</div>`);
}
export const barChart = {
  type: "chart-bar",
  label: "Bar chart",
  icon: "bar-chart-2",
  defaults(id) {
    return {
      id,
      type: "chart-bar",
      title: "",
      orientation: "vertical",
      items: [
        { label: "A", value: 40 },
        { label: "B", value: 65 },
        { label: "C", value: 30 }
      ]
    };
  },
  preview(s, h) {
    return barHtml(s, h);
  },
  render(s, h) {
    return barHtml(s, h);
  },
  editorFields(s) {
    return `${titleField(s)}
    <div class="bld-ef"><label>Orientation</label><select data-f="orientation"><option value="vertical"${s.orientation !== "horizontal" ? " selected" : ""}>Vertical</option><option value="horizontal"${s.orientation === "horizontal" ? " selected" : ""}>Horizontal</option></select></div>
    ${listEditor(
      s,
      "chBarItems",
      [
        { key: "label", label: "Label" },
        { key: "value", label: "Value", type: "number" }
      ],
      "Add data point",
      { label: "", value: 0 }
    )}`;
  }
};
function linePoints(items, w, h0, pad) {
  const vals = items.map((it) => num(it.value));
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  const range = max - min || 1;
  const n = items.length;
  return items.map((it, i) => {
    const x = n > 1 ? pad + i * (w - pad * 2) / (n - 1) : w / 2;
    const y = pad + (1 - (num(it.value) - min) / range) * (h0 - pad * 2);
    return { x, y, v: it.value, label: it.label };
  });
}
function lineHtml(s, h, filled) {
  const items = (s.items || []).filter(Boolean);
  const title = titleHtml(h, s.title);
  if (!items.length) return wrap(h, title + placeholder(h));
  const W = 320, H = 130, pad = 12;
  const pts = linePoints(items, W, H, pad);
  const line = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const dots = pts.map((p) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3" fill="${h.accent}" />`).join("");
  let fillPath = "";
  if (filled) {
    const first = pts[0], last = pts[pts.length - 1];
    const d = `M ${first.x},${H - pad} L ${pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ")} L ${last.x},${H - pad} Z`;
    fillPath = `<path d="${d}" fill="${h.rgb(h.accent, 0.16)}" stroke="none" />`;
  }
  const labels = items.map(
    (it) => `<div style="flex:1;text-align:center;font-size:.58rem;font-weight:200;letter-spacing:.08em;text-transform:uppercase;color:${h.rgb(h.text, 0.45)};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${h.E(it.label || "")}</div>`
  ).join("");
  return wrap(
    h,
    title + `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block;" preserveAspectRatio="none">
      <line x1="${pad}" y1="${H - pad}" x2="${W - pad}" y2="${H - pad}" stroke="${h.rgb(h.text, 0.1)}" stroke-width="1" />
      ${fillPath}
      <polyline points="${line}" fill="none" stroke="${h.accent}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
      ${dots}
    </svg>
    <div style="display:flex;margin-top:.5rem;">${labels}</div>`
  );
}
export const lineChart = {
  type: "chart-line",
  label: "Line chart",
  icon: "line-chart",
  defaults(id) {
    return {
      id,
      type: "chart-line",
      title: "",
      items: [
        { label: "Jan", value: 12 },
        { label: "Feb", value: 28 },
        { label: "Mar", value: 20 },
        { label: "Apr", value: 45 },
        { label: "May", value: 38 }
      ]
    };
  },
  preview(s, h) {
    return lineHtml(s, h, false);
  },
  render(s, h) {
    return lineHtml(s, h, false);
  },
  editorFields(s) {
    return `${titleField(s)}${listEditor(
      s,
      "chLineItems",
      [
        { key: "label", label: "Label" },
        { key: "value", label: "Value", type: "number" }
      ],
      "Add data point",
      { label: "", value: 0 }
    )}`;
  }
};
function donutHtml(s, h) {
  const items = (s.items || []).filter(Boolean);
  const title = titleHtml(h, s.title);
  if (!items.length) return wrap(h, title + placeholder(h));
  const total = items.reduce((a, it) => a + Math.max(0, num(it.value)), 0) || 1;
  let acc = 0;
  const stops = items.map((it, i) => {
    const v = Math.max(0, num(it.value));
    const start = acc / total * 100;
    acc += v;
    const end = acc / total * 100;
    return `${colorFor(it, i, h)} ${start.toFixed(2)}% ${end.toFixed(2)}%`;
  }).join(", ");
  const legend = items.map((it, i) => {
    const pct = (Math.max(0, num(it.value)) / total * 100).toFixed(0);
    return `<div style="display:flex;align-items:center;gap:.5rem;font-size:.68rem;font-weight:200;color:${h.rgb(h.text, 0.75)};margin-bottom:.4rem;">
        <span style="width:.6rem;height:.6rem;border-radius:50%;background:${colorFor(it, i, h)};flex-shrink:0;"></span>
        <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${h.E(it.label || "")}</span>
        <span style="color:${h.rgb(h.text, 0.5)};">${pct}%</span>
      </div>`;
  }).join("");
  return wrap(
    h,
    title + `<div style="display:flex;align-items:center;gap:2rem;flex-wrap:wrap;justify-content:center;">
      <div style="position:relative;width:9rem;height:9rem;flex-shrink:0;border-radius:50%;background:conic-gradient(${stops});">
        <div style="position:absolute;inset:22%;border-radius:50%;background:${h.bg};"></div>
      </div>
      <div style="min-width:9rem;">${legend}</div>
    </div>`
  );
}
export const donutChart = {
  type: "chart-donut",
  label: "Donut chart",
  icon: "pie-chart",
  defaults(id) {
    return {
      id,
      type: "chart-donut",
      title: "",
      items: [
        { label: "Direct", value: 40 },
        { label: "Search", value: 30 },
        { label: "Social", value: 20 },
        { label: "Referral", value: 10 }
      ]
    };
  },
  preview(s, h) {
    return donutHtml(s, h);
  },
  render(s, h) {
    return donutHtml(s, h);
  },
  editorFields(s) {
    return `${titleField(s)}${listEditor(
      s,
      "chDonutItems",
      [
        { key: "label", label: "Label" },
        { key: "value", label: "Value", type: "number" },
        { key: "color", label: "Color (optional)", placeholder: "#4dbd6a" }
      ],
      "Add slice",
      { label: "", value: 0, color: "" }
    )}`;
  }
};
function progressHtml(s, h) {
  const pct = clamp(num(s.value), 0, 100);
  const r = 54, c = 2 * Math.PI * r;
  const offset = c * (1 - pct / 100);
  return wrap(
    h,
    `<div style="display:flex;flex-direction:column;align-items:center;gap:.9rem;">
      <div style="position:relative;width:9rem;height:9rem;">
        <svg viewBox="0 0 130 130" style="width:100%;height:100%;transform:rotate(-90deg);">
          <circle cx="65" cy="65" r="${r}" fill="none" stroke="${h.rgb(h.text, 0.09)}" stroke-width="10" />
          <circle cx="65" cy="65" r="${r}" fill="none" stroke="${h.accent}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${offset.toFixed(2)}" />
        </svg>
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:1.6rem;font-weight:300;color:${h.rgb(h.text, 0.9)};">${pct.toFixed(0)}%</div>
      </div>
      ${s.title ? `<div style="font-size:.68rem;font-weight:200;letter-spacing:.18em;text-transform:uppercase;color:${h.rgb(h.text, 0.55)};text-align:center;">${h.E(s.title)}</div>` : ""}
    </div>`
  );
}
export const progressRing = {
  type: "chart-progress",
  label: "Progress ring",
  icon: "circle-dot",
  defaults(id) {
    return { id, type: "chart-progress", title: "Completion", value: 68 };
  },
  preview(s, h) {
    return progressHtml(s, h);
  },
  render(s, h) {
    return progressHtml(s, h);
  },
  editorFields(s) {
    return `${titleField(s)}<div class="bld-ef"><label>Percent (0–100)</label><input type="number" min="0" max="100" data-f="value" value="${attr(s.value ?? 0)}" /></div>`;
  }
};
export const areaChart = {
  type: "chart-area",
  label: "Area chart",
  icon: "area-chart",
  defaults(id) {
    return {
      id,
      type: "chart-area",
      title: "",
      items: [
        { label: "Q1", value: 22 },
        { label: "Q2", value: 40 },
        { label: "Q3", value: 33 },
        { label: "Q4", value: 58 }
      ]
    };
  },
  preview(s, h) {
    return lineHtml(s, h, true);
  },
  render(s, h) {
    return lineHtml(s, h, true);
  },
  editorFields(s) {
    return `${titleField(s)}${listEditor(
      s,
      "chAreaItems",
      [
        { key: "label", label: "Label" },
        { key: "value", label: "Value", type: "number" }
      ],
      "Add data point",
      { label: "", value: 0 }
    )}`;
  }
};
function radarHtml(s, h) {
  const items = (s.items || []).filter(Boolean);
  const title = titleHtml(h, s.title);
  if (items.length < 3)
    return wrap(h, title + placeholder(h, "Add at least 3 data points in editor"));
  const cx = 100, cy = 100, R = 76;
  const n = items.length;
  const angleFor = (i) => Math.PI * 2 * i / n - Math.PI / 2;
  const ringPts = (scale) => items.map((_, i) => {
    const a = angleFor(i);
    return `${(cx + Math.cos(a) * R * scale).toFixed(1)},${(cy + Math.sin(a) * R * scale).toFixed(1)}`;
  }).join(" ");
  const rings = [0.25, 0.5, 0.75, 1].map(
    (s2) => `<polygon points="${ringPts(s2)}" fill="none" stroke="${h.rgb(h.text, 0.1)}" stroke-width="1" />`
  ).join("");
  const spokes = items.map((_, i) => {
    const a = angleFor(i);
    return `<line x1="${cx}" y1="${cy}" x2="${(cx + Math.cos(a) * R).toFixed(1)}" y2="${(cy + Math.sin(a) * R).toFixed(1)}" stroke="${h.rgb(h.text, 0.1)}" stroke-width="1" />`;
  }).join("");
  const dataPts = items.map((it, i) => {
    const a = angleFor(i);
    const v = clamp(num(it.value), 0, 100) / 100;
    return `${(cx + Math.cos(a) * R * v).toFixed(1)},${(cy + Math.sin(a) * R * v).toFixed(1)}`;
  }).join(" ");
  const labels = items.map((it, i) => {
    const a = angleFor(i);
    const lx = cx + Math.cos(a) * (R + 16);
    const ly = cy + Math.sin(a) * (R + 16);
    const anchor = Math.cos(a) > 0.3 ? "start" : Math.cos(a) < -0.3 ? "end" : "middle";
    return `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${anchor}" dominant-baseline="middle" font-size="8" fill="${h.rgb(h.text, 0.55)}" style="${h.ff}">${h.E(it.label || "")}</text>`;
  }).join("");
  return wrap(
    h,
    title + `<svg viewBox="0 0 200 200" style="width:100%;max-width:22rem;height:auto;display:block;margin:0 auto;">
      ${rings}${spokes}
      <polygon points="${dataPts}" fill="${h.rgb(h.accent, 0.22)}" stroke="${h.accent}" stroke-width="2" stroke-linejoin="round" />
      ${labels}
    </svg>`
  );
}
export const radarChart = {
  type: "chart-radar",
  label: "Radar chart",
  icon: "radar",
  defaults(id) {
    return {
      id,
      type: "chart-radar",
      title: "",
      items: [
        { label: "Speed", value: 80 },
        { label: "Power", value: 65 },
        { label: "Range", value: 50 },
        { label: "Comfort", value: 70 },
        { label: "Value", value: 60 }
      ]
    };
  },
  preview(s, h) {
    return radarHtml(s, h);
  },
  render(s, h) {
    return radarHtml(s, h);
  },
  editorFields(s) {
    return `${titleField(s)}${listEditor(
      s,
      "chRadarItems",
      [
        { key: "label", label: "Axis label" },
        { key: "value", label: "Value (0–100)", type: "number" }
      ],
      "Add axis",
      { label: "", value: 50 }
    )}`;
  }
};
function gaugeHtml(s, h) {
  const pct = clamp(num(s.value), 0, 100);
  const cx = 100, cy = 100, r = 80;
  const theta = (180 - pct / 100 * 180) * Math.PI / 180;
  const ex = (cx + Math.cos(theta) * r).toFixed(2);
  const ey = (cy - Math.sin(theta) * r).toFixed(2);
  const laf = pct > 50 ? 1 : 0;
  const needleR = 66;
  const nx = (cx + Math.cos(theta) * needleR).toFixed(2);
  const ny = (cy - Math.sin(theta) * needleR).toFixed(2);
  return wrap(
    h,
    `<div style="display:flex;flex-direction:column;align-items:center;gap:.5rem;">
      <svg viewBox="0 0 200 115" style="width:100%;max-width:16rem;height:auto;display:block;">
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="${h.rgb(h.text, 0.09)}" stroke-width="14" stroke-linecap="round" />
        <path d="M 20 100 A 80 80 0 ${laf} 1 ${ex} ${ey}" fill="none" stroke="${h.accent}" stroke-width="14" stroke-linecap="round" />
        <line x1="${cx}" y1="${cy}" x2="${nx}" y2="${ny}" stroke="${h.rgb(h.text, 0.85)}" stroke-width="3" stroke-linecap="round" />
        <circle cx="${cx}" cy="${cy}" r="6" fill="${h.rgb(h.text, 0.85)}" />
      </svg>
      <div style="font-size:1.5rem;font-weight:300;color:${h.rgb(h.text, 0.9)};margin-top:-1.5rem;">${pct.toFixed(0)}</div>
      ${s.title ? `<div style="font-size:.68rem;font-weight:200;letter-spacing:.18em;text-transform:uppercase;color:${h.rgb(h.text, 0.55)};text-align:center;">${h.E(s.title)}</div>` : ""}
    </div>`
  );
}
export const gaugeChart = {
  type: "chart-gauge",
  label: "Gauge",
  icon: "gauge",
  defaults(id) {
    return { id, type: "chart-gauge", title: "Score", value: 72 };
  },
  preview(s, h) {
    return gaugeHtml(s, h);
  },
  render(s, h) {
    return gaugeHtml(s, h);
  },
  editorFields(s) {
    return `${titleField(s)}<div class="bld-ef"><label>Value (0–100)</label><input type="number" min="0" max="100" data-f="value" value="${attr(s.value ?? 0)}" /></div>`;
  }
};
function comparisonHtml(s, h) {
  const items = (s.items || []).filter(Boolean);
  const title = titleHtml(h, s.title);
  const nameA = s.seriesAName || "Series A";
  const nameB = s.seriesBName || "Series B";
  if (!items.length) return wrap(h, title + placeholder(h));
  const max = Math.max(...items.flatMap((it) => [num(it.valueA), num(it.valueB)]), 1);
  const legend = `<div style="display:flex;gap:1.5rem;justify-content:center;margin-bottom:1.2rem;">
    <div style="display:flex;align-items:center;gap:.4rem;font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;color:${h.rgb(h.text, 0.6)};"><span style="width:.6rem;height:.6rem;border-radius:2px;background:${h.rgb(h.accent, 0.85)};"></span>${h.E(nameA)}</div>
    <div style="display:flex;align-items:center;gap:.4rem;font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;color:${h.rgb(h.text, 0.6)};"><span style="width:.6rem;height:.6rem;border-radius:2px;background:${h.rgb(h.text, 0.3)};"></span>${h.E(nameB)}</div>
  </div>`;
  const rows = items.map((it) => {
    const pctA = clamp(num(it.valueA) / max * 100, 1, 100);
    const pctB = clamp(num(it.valueB) / max * 100, 1, 100);
    return `<div style="margin-bottom:.9rem;">
        <div style="font-size:.62rem;font-weight:200;letter-spacing:.1em;text-transform:uppercase;color:${h.rgb(h.text, 0.55)};margin-bottom:.3rem;">${h.E(it.label || "")}</div>
        <div style="background:${h.rgb(h.text, 0.06)};border-radius:.2rem;height:.6rem;overflow:hidden;margin-bottom:.25rem;">
          <div style="width:${pctA}%;height:100%;background:${h.rgb(h.accent, 0.85)};"></div>
        </div>
        <div style="background:${h.rgb(h.text, 0.06)};border-radius:.2rem;height:.6rem;overflow:hidden;">
          <div style="width:${pctB}%;height:100%;background:${h.rgb(h.text, 0.3)};"></div>
        </div>
      </div>`;
  }).join("");
  return wrap(h, title + legend + `<div>${rows}</div>`);
}
export const comparisonChart = {
  type: "chart-comparison",
  label: "Comparison bars",
  icon: "bar-chart-horizontal",
  defaults(id) {
    return {
      id,
      type: "chart-comparison",
      title: "",
      seriesAName: "This year",
      seriesBName: "Last year",
      items: [
        { label: "Jan", valueA: 40, valueB: 30 },
        { label: "Feb", valueA: 55, valueB: 45 },
        { label: "Mar", valueA: 35, valueB: 50 }
      ]
    };
  },
  preview(s, h) {
    return comparisonHtml(s, h);
  },
  render(s, h) {
    return comparisonHtml(s, h);
  },
  editorFields(s) {
    return `<div class="bld-ef"><label>Title <span style="opacity:.5">(optional)</span></label><input type="text" data-f="title" value="${attr(s.title)}" /></div>
    <div class="bld-ef"><label>Series A name</label><input type="text" data-f="seriesAName" value="${attr(s.seriesAName || "Series A")}" /></div>
    <div class="bld-ef"><label>Series B name</label><input type="text" data-f="seriesBName" value="${attr(s.seriesBName || "Series B")}" /></div>
    ${listEditor(
      s,
      "chCompItems",
      [
        { key: "label", label: "Category" },
        { key: "valueA", label: "Series A value", type: "number" },
        { key: "valueB", label: "Series B value", type: "number" }
      ],
      "Add row",
      { label: "", valueA: 0, valueB: 0 }
    )}`;
  }
};
function sparklineHtml(s, h) {
  const items = (s.items || []).filter(Boolean);
  const labelHtml = s.title ? `<div style="font-size:.68rem;font-weight:200;letter-spacing:.1em;text-transform:uppercase;color:${h.rgb(h.text, 0.6)};flex-shrink:0;">${h.E(s.title)}</div>` : "";
  if (!items.length)
    return wrap(
      h,
      `<div style="display:flex;align-items:center;gap:1rem;">${labelHtml}${placeholder(h, "Add values in editor")}</div>`
    );
  const vals = items.map((it) => num(it.value));
  const max = Math.max(...vals), min = Math.min(...vals);
  const range = max - min || 1;
  const W = 100, H = 30, pad = 3;
  const n = vals.length;
  const pts = vals.map((v, i) => {
    const x = n > 1 ? pad + i * (W - pad * 2) / (n - 1) : W / 2;
    const y = pad + (1 - (v - min) / range) * (H - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const last = vals[vals.length - 1];
  return wrap(
    h,
    `<div style="display:flex;align-items:center;gap:1rem;">
      ${labelHtml}
      <svg viewBox="0 0 ${W} ${H}" style="flex:1;height:2rem;min-width:5rem;" preserveAspectRatio="none">
        <polyline points="${pts.join(" ")}" fill="none" stroke="${h.accent}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
      </svg>
      <div style="font-size:.85rem;font-weight:300;color:${h.rgb(h.accent, 0.9)};flex-shrink:0;font-variant-numeric:tabular-nums;">${h.E(String(last))}</div>
    </div>`
  );
}
export const sparklineChart = {
  type: "chart-sparkline",
  label: "Sparkline",
  icon: "trending-up",
  defaults(id) {
    return {
      id,
      type: "chart-sparkline",
      title: "Revenue",
      items: [
        { value: 12 },
        { value: 18 },
        { value: 15 },
        { value: 24 },
        { value: 22 },
        { value: 30 }
      ]
    };
  },
  preview(s, h) {
    return sparklineHtml(s, h);
  },
  render(s, h) {
    return sparklineHtml(s, h);
  },
  editorFields(s) {
    return `${titleField(s)}${listEditor(s, "chSparkItems", [{ key: "value", label: "Value", type: "number" }], "Add value", { value: 0 })}`;
  }
};
function heatmapHtml(s, h) {
  const items = (s.items || []).filter(Boolean);
  const title = titleHtml(h, s.title);
  if (!items.length) return wrap(h, title + placeholder(h));
  const max = Math.max(...items.map((it) => num(it.value)), 1);
  const cells = items.map((it) => {
    const intensity = clamp(num(it.value) / max, 0.06, 1);
    return `<div title="${h.A(`${it.label || ""}: ${it.value ?? ""}`)}" style="aspect-ratio:1;border-radius:.3rem;background:${h.rgb(h.accent, intensity)};display:flex;align-items:center;justify-content:center;padding:.3rem;">
        <span style="font-size:.55rem;font-weight:200;letter-spacing:.05em;text-transform:uppercase;color:${intensity > 0.55 ? h.bg : h.rgb(h.text, 0.7)};text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;width:100%;">${h.E(it.label || "")}</span>
      </div>`;
  }).join("");
  return wrap(
    h,
    title + `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(3.5rem,1fr));gap:.5rem;">${cells}</div>`
  );
}
export const heatmapChart = {
  type: "chart-heatmap",
  label: "Heatmap",
  icon: "grid-3x3",
  defaults(id) {
    return {
      id,
      type: "chart-heatmap",
      title: "",
      items: [
        { label: "Mon", value: 20 },
        { label: "Tue", value: 45 },
        { label: "Wed", value: 60 },
        { label: "Thu", value: 30 },
        { label: "Fri", value: 80 },
        { label: "Sat", value: 15 },
        { label: "Sun", value: 5 }
      ]
    };
  },
  preview(s, h) {
    return heatmapHtml(s, h);
  },
  render(s, h) {
    return heatmapHtml(s, h);
  },
  editorFields(s) {
    return `${titleField(s)}${listEditor(
      s,
      "chHeatItems",
      [
        { key: "label", label: "Label" },
        { key: "value", label: "Value", type: "number" }
      ],
      "Add cell",
      { label: "", value: 0 }
    )}`;
  }
};
