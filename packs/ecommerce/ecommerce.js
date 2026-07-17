export const PACK = {
  name: "ecommerce",
  label: "E-commerce",
  description: "Product grids, pricing tables, stock badges and other storefront-flavored blocks that link out to your own checkout.",
  icon: "shopping-cart"
};
const PAD = (s) => s.pad === "sm" ? "1rem 2rem" : s.pad === "lg" ? "4rem 2rem" : "2rem 2rem";
function productsHtml(s, h) {
  const items = s.items || [];
  const p = PAD(s);
  const heading = s.heading ? `<div style="font-weight:300;font-size:1.05rem;letter-spacing:.02em;margin-bottom:1.1rem;">${h.E(s.heading)}</div>` : "";
  if (!items.length) {
    return `<div style="${h.ff}${h.fc}padding:${p};">${heading}<div style="font-size:.65rem;letter-spacing:.2em;color:${h.rgb(h.accent, 0.25)};text-align:center;padding:2rem 1rem;">Add products in the editor</div></div>`;
  }
  const cards = items.map((it) => {
    const img = it.img ? `<img src="${h.A(it.img)}" alt="${h.A(it.name || "")}" style="width:100%;height:150px;object-fit:cover;display:block;" />` : `<div style="width:100%;height:150px;background:${h.rgb(h.accent, 0.06)};border:1px dashed ${h.rgb(h.accent, 0.15)};"></div>`;
    const hasSale = it.sale_price && String(it.sale_price).trim();
    const priceHtml = hasSale ? `<span style="text-decoration:line-through;opacity:.55;margin-right:.4rem;">${h.E(it.price || "")}</span><span style="color:${h.accent};">${h.E(it.sale_price)}</span>` : `<span>${h.E(it.price || "")}</span>`;
    const badge = hasSale ? `<div style="position:absolute;top:.5rem;right:.5rem;background:#e0556a;color:#fff;font-size:.55rem;font-weight:400;letter-spacing:.1em;text-transform:uppercase;padding:.2rem .5rem;z-index:1;">Sale</div>` : "";
    const cta = it.buy_url ? `<a href="${h.A(it.buy_url)}" target="_blank" rel="noopener" style="display:inline-block;margin-top:.65rem;background:${h.accent};color:${h.bg};font-size:.62rem;font-weight:400;letter-spacing:.08em;text-transform:uppercase;padding:.4rem .85rem;border-radius:6px;text-decoration:none;">Buy</a>` : "";
    return `<div style="border:1px solid ${h.rgb(h.accent, 0.12)};background:${h.rgb(h.accent, 0.03)};position:relative;">${badge}${img}<div style="padding:.7rem .9rem;"><div style="font-weight:300;font-size:.84rem;color:${h.rgb(h.text, 0.9)};margin-bottom:.3rem;">${h.E(it.name || "")}</div><div style="font-size:.78rem;font-weight:300;color:${h.rgb(h.text, 0.75)};">${priceHtml}</div>${cta}</div></div>`;
  }).join("");
  return `<div style="${h.ff}${h.fc}padding:${p};">${heading}<div style="display:grid;grid-template-columns:repeat(${s.cols === "2" ? 2 : s.cols === "4" ? 4 : 3},1fr);gap:1rem;">${cards}</div></div>`;
}
export const shopProducts = {
  type: "shop-products",
  label: "Product grid",
  icon: "shopping-bag",
  defaults(id) {
    return {
      id,
      type: "shop-products",
      heading: "Shop",
      cols: "3",
      pad: "md",
      items: [{ name: "Product name", price: "$0", sale_price: "", img: "", buy_url: "" }]
    };
  },
  preview: productsHtml,
  render: productsHtml,
  editorFields(s) {
    const items = s.items || [];
    return `<div class="bld-ef"><label>Heading</label><input type="text" data-f="heading" value="${String(s.heading || "").replace(/"/g, "&quot;")}" /></div>
<div id="shopProductsItems">${items.map(
      (it, i) => `<div class="bld-li-item">
      <button class="bld-li-rm" data-lrm="${i}">✕</button>
      <div class="bld-ef"><label>Name</label><input type="text" data-li="${i}" data-lf="name" value="${String(it.name || "").replace(/"/g, "&quot;")}" /></div>
      <div class="bld-ef"><label>Price</label><input type="text" data-li="${i}" data-lf="price" value="${String(it.price || "").replace(/"/g, "&quot;")}" placeholder="$29" /></div>
      <div class="bld-ef"><label>Sale price <span style="opacity:.5">(optional)</span></label><input type="text" data-li="${i}" data-lf="sale_price" value="${String(it.sale_price || "").replace(/"/g, "&quot;")}" /></div>
      <div class="bld-ef"><label>Image URL</label><input type="url" data-li="${i}" data-lf="img" value="${String(it.img || "").replace(/"/g, "&quot;")}" /></div>
      <div class="bld-ef"><label>Checkout URL</label><input type="url" data-li="${i}" data-lf="buy_url" value="${String(it.buy_url || "").replace(/"/g, "&quot;")}" placeholder="https://..." /></div>
    </div>`
    ).join("")}</div>
<button class="bld-add-li bld-add-item" data-shape='{"name":"","price":"","sale_price":"","img":"","buy_url":""}'>+ Add product</button>
<div class="bld-ef"><label>Columns</label><select data-f="cols"><option value="2"${s.cols === "2" ? " selected" : ""}>2</option><option value="3"${!s.cols || s.cols === "3" ? " selected" : ""}>3</option><option value="4"${s.cols === "4" ? " selected" : ""}>4</option></select></div>`;
  }
};
function cartButtonHtml(s, h) {
  const count = parseInt(s.count, 10) || 0;
  const floating = s.style === "floating";
  const label = s.label || "View cart";
  const cartSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`;
  const badge = count > 0 ? `<span style="background:${h.bg};color:${h.accent};border-radius:999px;font-size:.62rem;font-weight:500;padding:.05rem .4rem;margin-left:.4rem;">${count}</span>` : "";
  const inner = `<a href="${h.A(s.url || "#")}" target="_blank" rel="noopener" style="${h.ff}display:inline-flex;align-items:center;gap:.5rem;background:${h.accent};color:${h.bg};font-size:.7rem;font-weight:400;letter-spacing:.06em;text-transform:uppercase;padding:.6rem 1.1rem;border-radius:999px;text-decoration:none;box-shadow:0 4px 18px ${h.rgb(h.accent, 0.35)};">${cartSvg}<span>${h.E(label)}</span>${badge}</a>`;
  if (floating) {
    return `<div style="${h.ff}position:relative;padding:${PAD(s)};"><div style="position:sticky;bottom:1rem;display:flex;justify-content:flex-end;">${inner}</div></div>`;
  }
  return `<div style="${h.ff}padding:${PAD(s)};display:flex;justify-content:${s.align === "left" ? "flex-start" : s.align === "right" ? "flex-end" : "center"};">${inner}</div>`;
}
export const shopCartButton = {
  type: "shop-cart-button",
  label: "Cart button",
  icon: "shopping-cart",
  defaults(id) {
    return {
      id,
      type: "shop-cart-button",
      label: "View cart",
      url: "",
      count: "0",
      style: "inline",
      align: "center",
      pad: "md"
    };
  },
  preview: cartButtonHtml,
  render: cartButtonHtml,
  editorFields(s) {
    return `<div class="bld-ef"><label>Label</label><input type="text" data-f="label" value="${String(s.label || "").replace(/"/g, "&quot;")}" /></div>
<div class="bld-ef"><label>Cart / checkout URL</label><input type="url" data-f="url" value="${String(s.url || "").replace(/"/g, "&quot;")}" placeholder="https://..." /></div>
<div class="bld-ef"><label>Item count</label><input type="number" min="0" data-f="count" value="${String(s.count || "0").replace(/"/g, "&quot;")}" /></div>
<div class="bld-ef"><label>Style</label><select data-f="style"><option value="inline"${!s.style || s.style === "inline" ? " selected" : ""}>Inline</option><option value="floating"${s.style === "floating" ? " selected" : ""}>Floating</option></select></div>
<div class="bld-ef"><label>Alignment <span style="opacity:.5">(inline only)</span></label><select data-f="align"><option value="left"${s.align === "left" ? " selected" : ""}>Left</option><option value="center"${!s.align || s.align === "center" ? " selected" : ""}>Center</option><option value="right"${s.align === "right" ? " selected" : ""}>Right</option></select></div>`;
  }
};
function addToCartHtml(s, h) {
  const p = PAD(s);
  const img = s.img ? `<img src="${h.A(s.img)}" alt="${h.A(s.name || "")}" style="width:100%;height:220px;object-fit:cover;display:block;" />` : `<div style="width:100%;height:220px;background:${h.rgb(h.accent, 0.06)};border:1px dashed ${h.rgb(h.accent, 0.15)};"></div>`;
  return `<div style="${h.ff}${h.fc}padding:${p};display:flex;justify-content:center;"><div style="max-width:340px;width:100%;border:1px solid ${h.rgb(h.accent, 0.12)};background:${h.rgb(h.accent, 0.03)};">${img}<div style="padding:1.1rem 1.2rem;text-align:center;">${s.name ? `<div style="font-weight:300;font-size:1rem;letter-spacing:.02em;margin-bottom:.3rem;">${h.E(s.name)}</div>` : ""}${s.price ? `<div style="font-size:.85rem;font-weight:300;color:${h.rgb(h.text, 0.7)};margin-bottom:.9rem;">${h.E(s.price)}</div>` : ""}<a href="${h.A(s.url || "#")}" target="_blank" rel="noopener" style="display:block;background:${h.accent};color:${h.bg};font-size:.72rem;font-weight:400;letter-spacing:.1em;text-transform:uppercase;padding:.75rem 1rem;text-decoration:none;border-radius:6px;">${h.E(s.btn_label || "Add to cart")}</a></div></div></div>`;
}
export const shopAddToCart = {
  type: "shop-add-to-cart",
  label: "Add to cart CTA",
  icon: "shopping-cart",
  defaults(id) {
    return {
      id,
      type: "shop-add-to-cart",
      name: "Product name",
      price: "$0",
      img: "",
      url: "",
      btn_label: "Add to cart",
      pad: "md"
    };
  },
  preview: addToCartHtml,
  render: addToCartHtml,
  editorFields(s) {
    const esc = (v) => String(v || "").replace(/"/g, "&quot;");
    return `<div class="bld-ef"><label>Product name</label><input type="text" data-f="name" value="${esc(s.name)}" /></div>
<div class="bld-ef"><label>Price</label><input type="text" data-f="price" value="${esc(s.price)}" placeholder="$29" /></div>
<div class="bld-ef"><label>Image URL</label><input type="url" data-f="img" value="${esc(s.img)}" /></div>
<div class="bld-ef"><label>Checkout URL</label><input type="url" data-f="url" value="${esc(s.url)}" placeholder="https://..." /></div>
<div class="bld-ef"><label>Button label</label><input type="text" data-f="btn_label" value="${esc(s.btn_label)}" /></div>`;
  }
};
function priceTableHtml(s, h) {
  const items = s.items || [];
  const p = PAD(s);
  const heading = s.heading ? `<div style="font-weight:300;font-size:1.1rem;letter-spacing:.02em;text-align:center;margin-bottom:1.4rem;">${h.E(s.heading)}</div>` : "";
  if (!items.length) {
    return `<div style="${h.ff}${h.fc}padding:${p};">${heading}<div style="font-size:.65rem;letter-spacing:.2em;color:${h.rgb(h.accent, 0.25)};text-align:center;padding:2rem 1rem;">Add plans in the editor</div></div>`;
  }
  const cols = items.map((it) => {
    const featured = it.featured === "yes";
    const features = String(it.features || "").split("\n").map((f) => f.trim()).filter(Boolean).map(
      (f) => `<li style="display:flex;gap:.5rem;align-items:flex-start;font-size:.76rem;font-weight:200;line-height:1.7;color:${h.rgb(h.text, 0.65)};margin-bottom:.4rem;list-style:none;"><span style="color:${h.accent};">✓</span>${h.E(f)}</li>`
    ).join("");
    return `<div style="flex:1;min-width:180px;border:1px solid ${featured ? h.accent : h.rgb(h.accent, 0.12)};background:${featured ? h.rgb(h.accent, 0.07) : h.rgb(h.accent, 0.02)};padding:1.4rem 1.2rem;position:relative;">${featured && it.badge ? `<div style="position:absolute;top:-.6rem;left:50%;transform:translateX(-50%);background:${h.accent};color:${h.bg};font-size:.55rem;font-weight:400;letter-spacing:.1em;text-transform:uppercase;padding:.2rem .6rem;">${h.E(it.badge)}</div>` : ""}<div style="font-weight:300;font-size:.9rem;letter-spacing:.04em;text-align:center;margin-bottom:.5rem;">${h.E(it.name || "")}</div><div style="text-align:center;margin-bottom:1rem;"><span style="font-size:1.5rem;font-weight:300;">${h.E(it.price || "")}</span><span style="font-size:.72rem;color:${h.rgb(h.text, 0.5)};">${h.E(it.period || "")}</span></div><ul style="padding:0;margin:0 0 1.2rem;">${features}</ul>${it.btn_url ? `<a href="${h.A(it.btn_url)}" target="_blank" rel="noopener" style="display:block;text-align:center;background:${featured ? h.accent : "transparent"};border:1px solid ${h.accent};color:${featured ? h.bg : h.accent};font-size:.7rem;font-weight:400;letter-spacing:.08em;text-transform:uppercase;padding:.6rem 1rem;text-decoration:none;border-radius:6px;">${h.E(it.btn_label || "Choose")}</a>` : ""}</div>`;
  }).join("");
  return `<div style="${h.ff}${h.fc}padding:${p};">${heading}<div style="display:flex;flex-wrap:wrap;gap:1.2rem;justify-content:center;">${cols}</div></div>`;
}
export const shopPriceTable = {
  type: "shop-price-table",
  label: "Price table",
  icon: "table",
  defaults(id) {
    return {
      id,
      type: "shop-price-table",
      heading: "Plans",
      pad: "md",
      items: [
        {
          name: "Basic",
          price: "$0",
          period: "/mo",
          features: "Feature A\nFeature B",
          btn_label: "Choose",
          btn_url: "",
          featured: "no",
          badge: ""
        },
        {
          name: "Pro",
          price: "$29",
          period: "/mo",
          features: "Everything in Basic\nFeature C",
          btn_label: "Choose",
          btn_url: "",
          featured: "yes",
          badge: "Popular"
        }
      ]
    };
  },
  preview: priceTableHtml,
  render: priceTableHtml,
  editorFields(s) {
    const items = s.items || [];
    const esc = (v) => String(v || "").replace(/"/g, "&quot;");
    return `<div class="bld-ef"><label>Heading</label><input type="text" data-f="heading" value="${esc(s.heading)}" /></div>
<div id="shopPriceTableItems">${items.map(
      (it, i) => `<div class="bld-li-item">
      <button class="bld-li-rm" data-lrm="${i}">✕</button>
      <div class="bld-ef"><label>Plan name</label><input type="text" data-li="${i}" data-lf="name" value="${esc(it.name)}" /></div>
      <div class="bld-ef"><label>Price</label><input type="text" data-li="${i}" data-lf="price" value="${esc(it.price)}" placeholder="$29" /></div>
      <div class="bld-ef"><label>Period <span style="opacity:.5">(optional)</span></label><input type="text" data-li="${i}" data-lf="period" value="${esc(it.period)}" placeholder="/mo" /></div>
      <div class="bld-ef"><label>Features <span style="opacity:.5">(one per line)</span></label><textarea data-li="${i}" data-lf="features" rows="4">${String(it.features || "").replace(/</g, "&lt;")}</textarea></div>
      <div class="bld-ef"><label>Button label</label><input type="text" data-li="${i}" data-lf="btn_label" value="${esc(it.btn_label)}" /></div>
      <div class="bld-ef"><label>Button URL</label><input type="url" data-li="${i}" data-lf="btn_url" value="${esc(it.btn_url)}" /></div>
      <div class="bld-ef"><label>Featured</label><select data-li="${i}" data-lf="featured"><option value="no"${it.featured !== "yes" ? " selected" : ""}>No</option><option value="yes"${it.featured === "yes" ? " selected" : ""}>Yes</option></select></div>
      <div class="bld-ef"><label>Badge <span style="opacity:.5">(if featured)</span></label><input type="text" data-li="${i}" data-lf="badge" value="${esc(it.badge)}" placeholder="Popular" /></div>
    </div>`
    ).join("")}</div>
<button class="bld-add-li bld-add-item" data-shape='{"name":"Plan","price":"$0","period":"/mo","features":"","btn_label":"Choose","btn_url":"","featured":"no","badge":""}'>+ Add plan</button>`;
  }
};
const STOCK_COLORS = {
  in: "#4dbd6a",
  low: "#e0a53d",
  out: "#e0556a",
  preorder: "#6a9de0"
};
const STOCK_LABELS = {
  in: "In stock",
  low: "Low stock",
  out: "Out of stock",
  preorder: "Pre-order"
};
function stockBadgeHtml(s, h) {
  const status = STOCK_COLORS[s.status] ? s.status : "in";
  const color = STOCK_COLORS[status];
  const text = s.message || STOCK_LABELS[status];
  return `<div style="${h.ff}padding:${PAD(s)};display:flex;justify-content:${s.align === "left" ? "flex-start" : s.align === "right" ? "flex-end" : "center"};"><span style="display:inline-flex;align-items:center;gap:.45rem;border:1px solid ${color};background:${color}1a;color:${color};font-size:.68rem;font-weight:400;letter-spacing:.06em;text-transform:uppercase;padding:.4rem .85rem;border-radius:999px;"><span style="width:.5rem;height:.5rem;border-radius:50%;background:${color};display:inline-block;"></span>${h.E(text)}</span></div>`;
}
export const shopStockBadge = {
  type: "shop-stock-badge",
  label: "Stock badge",
  icon: "package-check",
  defaults(id) {
    return { id, type: "shop-stock-badge", status: "in", message: "", align: "center", pad: "sm" };
  },
  preview: stockBadgeHtml,
  render: stockBadgeHtml,
  editorFields(s) {
    return `<div class="bld-ef"><label>Status</label><select data-f="status"><option value="in"${!s.status || s.status === "in" ? " selected" : ""}>In stock</option><option value="low"${s.status === "low" ? " selected" : ""}>Low stock</option><option value="out"${s.status === "out" ? " selected" : ""}>Out of stock</option><option value="preorder"${s.status === "preorder" ? " selected" : ""}>Pre-order</option></select></div>
<div class="bld-ef"><label>Custom message <span style="opacity:.5">(optional)</span></label><input type="text" data-f="message" value="${String(s.message || "").replace(/"/g, "&quot;")}" /></div>
<div class="bld-ef"><label>Alignment</label><select data-f="align"><option value="left"${s.align === "left" ? " selected" : ""}>Left</option><option value="center"${!s.align || s.align === "center" ? " selected" : ""}>Center</option><option value="right"${s.align === "right" ? " selected" : ""}>Right</option></select></div>`;
  }
};
function variantPickerHtml(s, h) {
  const items = s.items || [];
  const p = PAD(s);
  const uid = "vp-" + Math.random().toString(36).slice(2, 8);
  const heading = s.heading ? `<div style="font-size:.68rem;font-weight:300;letter-spacing:.1em;text-transform:uppercase;color:${h.rgb(h.text, 0.6)};margin-bottom:.6rem;">${h.E(s.heading)}</div>` : "";
  if (!items.length) {
    return `<div style="${h.ff}${h.fc}padding:${p};">${heading}<div style="font-size:.65rem;letter-spacing:.2em;color:${h.rgb(h.accent, 0.25)};text-align:center;padding:1rem;">Add variant options in editor</div></div>`;
  }
  const inputs = items.map(
    (it, i) => `<input type="radio" name="${uid}" id="${uid}-${i}" style="position:absolute;opacity:0;pointer-events:none;" ${i === 0 ? "checked" : ""} />`
  ).join("");
  const labels = items.map(
    (it, i) => `<label for="${uid}-${i}" style="cursor:pointer;user-select:none;display:inline-block;padding:.45rem 1rem;border:1px solid ${h.rgb(h.accent, 0.3)};border-radius:999px;font-size:.74rem;font-weight:300;letter-spacing:.03em;color:${h.rgb(h.text, 0.75)};transition:background .15s,color .15s,border-color .15s;">${h.E(it.label || "")}</label>`
  ).join("");
  const css = items.map(
    (it, i) => `#${uid}-${i}:checked ~ label[for="${uid}-${i}"]{background:${h.accent};border-color:${h.accent};color:${h.bg};}`
  ).join("");
  return `<div style="${h.ff}${h.fc}padding:${p};">${heading}<style>${css}</style><div style="display:flex;flex-wrap:wrap;gap:.5rem;">${inputs}${labels}</div></div>`;
}
export const shopVariantPicker = {
  type: "shop-variant-picker",
  label: "Variant picker",
  icon: "list-checks",
  defaults(id) {
    return {
      id,
      type: "shop-variant-picker",
      heading: "Size",
      pad: "sm",
      items: [{ label: "S" }, { label: "M" }, { label: "L" }]
    };
  },
  preview: variantPickerHtml,
  render: variantPickerHtml,
  editorFields(s) {
    const items = s.items || [];
    return `<div class="bld-ef"><label>Heading</label><input type="text" data-f="heading" value="${String(s.heading || "").replace(/"/g, "&quot;")}" placeholder="Size" /></div>
<div id="shopVariantItems">${items.map(
      (it, i) => `<div class="bld-li-item">
      <button class="bld-li-rm" data-lrm="${i}">✕</button>
      <div class="bld-ef"><label>Option label</label><input type="text" data-li="${i}" data-lf="label" value="${String(it.label || "").replace(/"/g, "&quot;")}" /></div>
    </div>`
    ).join("")}</div>
<button class="bld-add-li bld-add-item" data-shape='{"label":""}'>+ Add option</button>`;
  }
};
function shippingHtml(s, h) {
  const items = s.items || [];
  const p = PAD(s);
  const heading = s.heading ? `<div style="font-weight:300;font-size:.95rem;letter-spacing:.02em;margin-bottom:.9rem;">${h.E(s.heading)}</div>` : "";
  if (!items.length) {
    return `<div style="${h.ff}${h.fc}padding:${p};">${heading}<div style="font-size:.65rem;letter-spacing:.2em;color:${h.rgb(h.accent, 0.25)};text-align:center;padding:1.5rem;">Add shipping options in editor</div></div>`;
  }
  const rows = items.map(
    (it) => `<div style="display:flex;justify-content:space-between;align-items:center;padding:.7rem 0;border-bottom:1px solid ${h.rgb(h.accent, 0.1)};"><div style="font-size:.8rem;font-weight:300;color:${h.rgb(h.text, 0.85)};">${h.E(it.region || "")}</div><div style="display:flex;gap:1.2rem;align-items:baseline;"><span style="font-size:.7rem;font-weight:200;color:${h.rgb(h.text, 0.5)};">${h.E(it.days || "")}</span><span style="font-size:.8rem;font-weight:300;color:${h.accent};min-width:3.5rem;text-align:right;">${h.E(it.cost || "")}</span></div></div>`
  ).join("");
  return `<div style="${h.ff}${h.fc}padding:${p};">${heading}<div>${rows}</div></div>`;
}
export const shopShippingEstimator = {
  type: "shop-shipping-estimator",
  label: "Shipping estimator",
  icon: "truck",
  defaults(id) {
    return {
      id,
      type: "shop-shipping-estimator",
      heading: "Shipping options",
      pad: "md",
      items: [
        { region: "Domestic", cost: "$5", days: "3–5 days" },
        { region: "International", cost: "$20", days: "7–14 days" }
      ]
    };
  },
  preview: shippingHtml,
  render: shippingHtml,
  editorFields(s) {
    const items = s.items || [];
    const esc = (v) => String(v || "").replace(/"/g, "&quot;");
    return `<div class="bld-ef"><label>Heading</label><input type="text" data-f="heading" value="${esc(s.heading)}" /></div>
<div id="shopShippingItems">${items.map(
      (it, i) => `<div class="bld-li-item">
      <button class="bld-li-rm" data-lrm="${i}">✕</button>
      <div class="bld-ef"><label>Region</label><input type="text" data-li="${i}" data-lf="region" value="${esc(it.region)}" /></div>
      <div class="bld-ef"><label>Cost</label><input type="text" data-li="${i}" data-lf="cost" value="${esc(it.cost)}" placeholder="$5" /></div>
      <div class="bld-ef"><label>Estimated time</label><input type="text" data-li="${i}" data-lf="days" value="${esc(it.days)}" placeholder="3–5 days" /></div>
    </div>`
    ).join("")}</div>
<button class="bld-add-li bld-add-item" data-shape='{"region":"","cost":"","days":""}'>+ Add option</button>`;
  }
};
function promoCodeHtml(s, h) {
  const p = PAD(s);
  const code = s.code || "SAVE10";
  return `<div style="${h.ff}${h.fc}padding:${p};display:flex;justify-content:center;"><div style="max-width:320px;width:100%;border:2px dashed ${h.rgb(h.accent, 0.5)};border-radius:10px;padding:1.2rem 1.4rem;text-align:center;background:${h.rgb(h.accent, 0.04)};">${s.description ? `<div style="font-size:.72rem;font-weight:200;letter-spacing:.03em;color:${h.rgb(h.text, 0.65)};margin-bottom:.8rem;">${h.E(s.description)}</div>` : ""}<input readonly value="${h.A(code)}" style="width:100%;text-align:center;background:transparent;border:1px solid ${h.rgb(h.accent, 0.35)};color:${h.accent};font-size:1rem;font-weight:500;letter-spacing:.25em;text-transform:uppercase;padding:.55rem .5rem;border-radius:6px;box-sizing:border-box;" /><div style="font-size:.58rem;letter-spacing:.15em;text-transform:uppercase;color:${h.rgb(h.text, 0.35)};margin-top:.55rem;">Tap to select</div></div></div>`;
}
export const shopPromoCode = {
  type: "shop-promo-code",
  label: "Promo code",
  icon: "ticket",
  defaults(id) {
    return {
      id,
      type: "shop-promo-code",
      code: "SAVE10",
      description: "10% off your first order",
      pad: "md"
    };
  },
  preview: promoCodeHtml,
  render: promoCodeHtml,
  editorFields(s) {
    const esc = (v) => String(v || "").replace(/"/g, "&quot;");
    return `<div class="bld-ef"><label>Code</label><input type="text" data-f="code" value="${esc(s.code)}" placeholder="SAVE10" /></div>
<div class="bld-ef"><label>Description</label><input type="text" data-f="description" value="${esc(s.description)}" /></div>`;
  }
};
function wishlistHtml(s, h) {
  const p = PAD(s);
  const uid = "wl-" + Math.random().toString(36).slice(2, 8);
  const heartOutline = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.6z"/></svg>`;
  const label = s.label || "Save";
  return `<div style="${h.ff}padding:${p};display:flex;justify-content:${s.align === "left" ? "flex-start" : s.align === "right" ? "flex-end" : "center"};"><input type="checkbox" id="${uid}" style="position:absolute;opacity:0;pointer-events:none;" /><style>#${uid}:checked ~ label[for="${uid}"] .wl-heart{color:#e0556a;fill:#e0556a;} #${uid}:checked ~ label[for="${uid}"] .wl-text::after{content:"d";}</style><label for="${uid}" style="cursor:pointer;user-select:none;display:inline-flex;align-items:center;gap:.5rem;border:1px solid ${h.rgb(h.accent, 0.3)};border-radius:999px;padding:.45rem .95rem;font-size:.72rem;font-weight:300;letter-spacing:.04em;color:${h.rgb(h.text, 0.75)};"><span class="wl-heart" style="display:inline-flex;color:${h.rgb(h.text, 0.6)};transition:color .15s;">${heartOutline}</span><span class="wl-text">${h.E(label)}</span></label></div>`;
}
export const shopWishlistButton = {
  type: "shop-wishlist-button",
  label: "Wishlist button",
  icon: "heart",
  defaults(id) {
    return { id, type: "shop-wishlist-button", label: "Save", align: "center", pad: "sm" };
  },
  preview: wishlistHtml,
  render: wishlistHtml,
  editorFields(s) {
    return `<div class="bld-ef"><label>Label</label><input type="text" data-f="label" value="${String(s.label || "").replace(/"/g, "&quot;")}" /></div>
<div class="bld-ef"><label>Alignment</label><select data-f="align"><option value="left"${s.align === "left" ? " selected" : ""}>Left</option><option value="center"${!s.align || s.align === "center" ? " selected" : ""}>Center</option><option value="right"${s.align === "right" ? " selected" : ""}>Right</option></select></div>`;
  }
};
function starSvg(fill, h) {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="${fill}" stroke="${h.accent}" stroke-width="1.3" stroke-linejoin="round"><polygon points="12 2 15.09 8.63 22 9.24 16.8 14.14 18.18 21 12 17.27 5.82 21 7.2 14.14 2 9.24 8.91 8.63 12 2"/></svg>`;
}
function starHalfSvg(h) {
  const uid = "sh-" + Math.random().toString(36).slice(2, 6);
  return `<svg width="16" height="16" viewBox="0 0 24 24" stroke="${h.accent}" stroke-width="1.3" stroke-linejoin="round"><defs><linearGradient id="${uid}" x1="0" x2="1" y1="0" y2="0"><stop offset="50%" stop-color="${h.accent}"/><stop offset="50%" stop-color="transparent"/></linearGradient></defs><polygon fill="url(#${uid})" points="12 2 15.09 8.63 22 9.24 16.8 14.14 18.18 21 12 17.27 5.82 21 7.2 14.14 2 9.24 8.91 8.63 12 2"/></svg>`;
}
function reviewStarsHtml(s, h) {
  const p = PAD(s);
  const rating = Math.max(0, Math.min(5, parseFloat(s.rating) || 0));
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  let stars = "";
  for (let i = 0; i < full; i++) stars += starSvg(h.accent, h);
  if (half) stars += starHalfSvg(h);
  for (let i = 0; i < empty; i++) stars += starSvg("none", h);
  const count = parseInt(s.count, 10) || 0;
  const countText = count ? `<span style="font-size:.72rem;font-weight:200;color:${h.rgb(h.text, 0.5)};margin-left:.5rem;">(${count} review${count === 1 ? "" : "s"})</span>` : "";
  return `<div style="${h.ff}${h.fc}padding:${p};display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;">${s.name ? `<span style="font-size:.82rem;font-weight:300;">${h.E(s.name)}</span>` : ""}<span style="display:inline-flex;gap:.1rem;">${stars}</span>${countText}</div>`;
}
export const shopReviewStars = {
  type: "shop-review-stars",
  label: "Review stars",
  icon: "star",
  defaults(id) {
    return { id, type: "shop-review-stars", name: "", rating: "4.5", count: "0", pad: "sm" };
  },
  preview: reviewStarsHtml,
  render: reviewStarsHtml,
  editorFields(s) {
    const esc = (v) => String(v || "").replace(/"/g, "&quot;");
    return `<div class="bld-ef"><label>Product name <span style="opacity:.5">(optional)</span></label><input type="text" data-f="name" value="${esc(s.name)}" /></div>
<div class="bld-ef"><label>Rating <span style="opacity:.5">(0–5)</span></label><input type="number" step="0.5" min="0" max="5" data-f="rating" value="${esc(s.rating)}" /></div>
<div class="bld-ef"><label>Review count</label><input type="number" min="0" data-f="count" value="${esc(s.count)}" /></div>`;
  }
};
