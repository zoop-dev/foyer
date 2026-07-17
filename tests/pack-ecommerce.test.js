import { describe, it, expect } from "vitest";
import * as pack from "../packs/ecommerce/ecommerce.js";
function makeHelper(overrides = {}) {
  return {
    E: (s) => String(s ?? ""),
    A: (s) => String(s ?? ""),
    rgb: (color, alpha) => `rgba(${color},${alpha})`,
    md: (s) => `<p>${s ?? ""}</p>`,
    accent: "#4dbd6a",
    text: "#c8e6aa",
    bg: "#020a03",
    font: "Josefin Sans",
    ff: "font-family:'Josefin Sans',sans-serif;",
    fc: "color:#c8e6aa;",
    dispatch: (cs) => `[dispatch:${cs.type}]`,
    ...overrides
  };
}
const BLOCKS = Object.entries(pack).filter(([key]) => key !== "PACK");
describe("ecommerce pack registry", () => {
  it("has 10 blocks, each with a unique shop-prefixed type and function exports", () => {
    expect(BLOCKS).toHaveLength(10);
    const types = /* @__PURE__ */ new Set();
    for (const [, block] of BLOCKS) {
      expect(block.type).toMatch(/^shop-/);
      expect(types.has(block.type)).toBe(false);
      types.add(block.type);
      expect(typeof block.preview).toBe("function");
      expect(typeof block.render).toBe("function");
      expect(typeof block.editorFields).toBe("function");
      expect(typeof block.defaults).toBe("function");
    }
    expect(types.size).toBe(10);
  });
  it("exposes pack-level metadata", () => {
    expect(pack.PACK).toBeDefined();
    expect(pack.PACK.name).toBe("ecommerce");
    expect(typeof pack.PACK.label).toBe("string");
    expect(typeof pack.PACK.icon).toBe("string");
  });
});
describe("every block's preview()/render()/editorFields()", () => {
  it("return HTML strings without throwing for populated defaults() state", () => {
    const h = makeHelper();
    for (const [key, block] of BLOCKS) {
      const s = block.defaults("test-id");
      expect(typeof block.preview(s, h), `${key} preview`).toBe("string");
      expect(typeof block.render(s, h), `${key} render`).toBe("string");
      expect(typeof block.editorFields(s), `${key} editorFields`).toBe("string");
    }
  });
  it("return HTML strings without throwing for empty/minimal state", () => {
    const h = makeHelper();
    for (const [key, block] of BLOCKS) {
      const s = { id: "x", type: block.type };
      expect(typeof block.preview(s, h), `${key} preview`).toBe("string");
      expect(typeof block.render(s, h), `${key} render`).toBe("string");
      expect(typeof block.editorFields(s), `${key} editorFields`).toBe("string");
    }
  });
});
describe("shop-stock-badge block", () => {
  it("shows the right label and color per status", () => {
    const h = makeHelper();
    const cases = [
      { status: "in", label: "In stock", color: "#4dbd6a" },
      { status: "low", label: "Low stock", color: "#e0a53d" },
      { status: "out", label: "Out of stock", color: "#e0556a" },
      { status: "preorder", label: "Pre-order", color: "#6a9de0" }
    ];
    for (const { status, label, color } of cases) {
      const out = pack.shopStockBadge.render({ type: "shop-stock-badge", status }, h);
      expect(out).toContain(label);
      expect(out).toContain(color);
    }
  });
  it("prefers a custom message over the default status label", () => {
    const h = makeHelper();
    const out = pack.shopStockBadge.render(
      { type: "shop-stock-badge", status: "low", message: "Only 2 left!" },
      h
    );
    expect(out).toContain("Only 2 left!");
    expect(out).not.toContain("Low stock");
  });
});
describe("shop-price-table block", () => {
  it("visually distinguishes the featured plan with the accent border and shows its badge", () => {
    const h = makeHelper();
    const s = {
      type: "shop-price-table",
      items: [
        { name: "Basic", price: "$0", featured: "no" },
        { name: "Pro", price: "$29", featured: "yes", badge: "Popular" }
      ]
    };
    const out = pack.shopPriceTable.render(s, h);
    expect(out).toContain("Popular");
    expect(out).toContain(`border:1px solid ${h.accent}`);
  });
  it("shows a placeholder when there are no plans", () => {
    const h = makeHelper();
    expect(pack.shopPriceTable.preview({ type: "shop-price-table", items: [] }, h)).toContain(
      "Add plans in the editor"
    );
  });
});
describe("shop-products block", () => {
  it("shows a sale badge and struck-through price only when a sale_price is set", () => {
    const h = makeHelper();
    const s = {
      type: "shop-products",
      items: [
        { name: "Regular Item", price: "$10", buy_url: "https://example.com/a" },
        { name: "Sale Item", price: "$20", sale_price: "$15", buy_url: "https://example.com/b" }
      ]
    };
    const out = pack.shopProducts.render(s, h);
    expect(out).toContain("Sale Item");
    expect(out).toContain("$15");
    expect(out).toContain("text-decoration:line-through");
    expect(out).toContain('href="https://example.com/a"');
  });
  it("shows a placeholder when there are no products", () => {
    const h = makeHelper();
    expect(pack.shopProducts.preview({ type: "shop-products", items: [] }, h)).toContain(
      "Add products in the editor"
    );
  });
});
describe("shop-promo-code block", () => {
  it("renders the code in a readonly input and includes the description", () => {
    const h = makeHelper();
    const s = { type: "shop-promo-code", code: "WELCOME15", description: "15% off" };
    const out = pack.shopPromoCode.render(s, h);
    expect(out).toContain("WELCOME15");
    expect(out).toContain("15% off");
    expect(out).toContain("readonly");
    expect(out).toContain("dashed");
  });
});
describe("shop-review-stars block", () => {
  it("includes the review count and product name", () => {
    const h = makeHelper();
    const s = { type: "shop-review-stars", name: "Wireless Mouse", rating: "4.5", count: "37" };
    const out = pack.shopReviewStars.render(s, h);
    expect(out).toContain("Wireless Mouse");
    expect(out).toContain("(37 reviews)");
  });
});
