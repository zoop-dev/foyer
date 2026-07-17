import { describe, it, expect } from "vitest";
import * as pack from "../packs/social-proof/social-proof.js";
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
describe("social-proof pack registry", () => {
  it("has 10 blocks, each with a unique sp-prefixed type and function exports", () => {
    expect(BLOCKS).toHaveLength(10);
    const types = /* @__PURE__ */ new Set();
    for (const [key, block] of BLOCKS) {
      expect(block.type.startsWith("sp-")).toBe(true);
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
    expect(pack.PACK.name).toBe("social-proof");
    expect(typeof pack.PACK.label).toBe("string");
    expect(typeof pack.PACK.icon).toBe("string");
  });
});
describe("every block's preview()/render()/editorFields()", () => {
  it("return strings without throwing for populated defaults() state", () => {
    const h = makeHelper();
    for (const [key, block] of BLOCKS) {
      const s = block.defaults("test-id");
      expect(typeof block.preview(s, h), `${key} preview`).toBe("string");
      expect(typeof block.render(s, h), `${key} render`).toBe("string");
      expect(typeof block.editorFields(s), `${key} editorFields`).toBe("string");
    }
  });
  it("return strings without throwing for empty/minimal state", () => {
    const h = makeHelper();
    for (const [key, block] of BLOCKS) {
      const s = { id: "x", type: block.type };
      expect(typeof block.preview(s, h), `${key} preview`).toBe("string");
      expect(typeof block.render(s, h), `${key} render`).toBe("string");
      expect(typeof block.editorFields(s), `${key} editorFields`).toBe("string");
    }
  });
});
describe("sp-visitor-count block", () => {
  it("shows the count and label from defaults()", () => {
    const h = makeHelper();
    const block = pack.spVisitorCount;
    const s = block.defaults("id1");
    const out = block.render(s, h);
    expect(out).toContain("10,000+");
    expect(out).toContain("Happy customers");
  });
});
describe("sp-activity-ticker block", () => {
  it("shows a placeholder with no items and event rows once populated", () => {
    const h = makeHelper();
    const block = pack.spActivityTicker;
    expect(block.preview({ type: "sp-activity-ticker" }, h)).toContain(
      "Add activity events in editor"
    );
    const s = {
      type: "sp-activity-ticker",
      items: [{ text: "Someone just signed up", timeAgo: "2m ago" }]
    };
    const out = block.render(s, h);
    expect(out).toContain("Someone just signed up");
    expect(out).toContain("2m ago");
  });
});
describe("sp-chat-bubble block", () => {
  it("links out to the owner-provided URL via h.A() and includes no <script> tags", () => {
    const h = makeHelper();
    const block = pack.spChatBubble;
    const s = { type: "sp-chat-bubble", label: "Talk to us", url: "https://wa.me/15551234567" };
    const out = block.render(s, h);
    expect(out).toContain('href="https://wa.me/15551234567"');
    expect(out).toContain("Talk to us");
    expect(out).not.toContain("<script");
  });
});
describe("sp-trust-badges block", () => {
  it("renders each badge's label, escaped via h.E()", () => {
    const h = makeHelper();
    const block = pack.spTrustBadges;
    const s = { type: "sp-trust-badges", items: [{ icon: "🔒", label: "Secure checkout" }] };
    const out = block.render(s, h);
    expect(out).toContain("Secure checkout");
  });
});
