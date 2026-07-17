import { describe, it, expect } from "vitest";
import { CORE_BLOCKS, CORE_BLOCK_TYPES } from "../src/blocks/core/index.js";
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
describe("block registry", () => {
  it("has 25 core block types, each exporting preview() and render()", () => {
    expect(CORE_BLOCK_TYPES).toHaveLength(25);
    for (const type of CORE_BLOCK_TYPES) {
      expect(typeof CORE_BLOCKS[type].preview).toBe("function");
      expect(typeof CORE_BLOCKS[type].render).toBe("function");
    }
  });
  it("every block's preview() and render() return an HTML string for minimal input", () => {
    const h = makeHelper();
    for (const type of CORE_BLOCK_TYPES) {
      const s = { type, items: [], sections: [], heading: "H", label: "L", url: "/x" };
      expect(typeof CORE_BLOCKS[type].preview(s, h)).toBe("string");
      expect(typeof CORE_BLOCKS[type].render(s, h)).toBe("string");
    }
  });
});
describe("group block", () => {
  it("delegates child sections through h.dispatch() rather than calling a renderer directly", () => {
    const h = makeHelper();
    const s = { type: "group", label: "My Group", sections: [{ type: "text" }, { type: "image" }] };
    expect(CORE_BLOCKS.group.preview(s, h)).toContain("[dispatch:text][dispatch:image]");
    expect(CORE_BLOCKS.group.render(s, h)).toContain("[dispatch:text][dispatch:image]");
  });
});
describe("spacer block", () => {
  it("maps size to a height and does not collide with the h parameter name", () => {
    const h = makeHelper();
    expect(CORE_BLOCKS.spacer.preview({ type: "spacer", size: "lg" }, h)).toContain("height:4rem;");
    expect(CORE_BLOCKS.spacer.render({ type: "spacer", size: "xl" }, h)).toContain("height:7rem;");
  });
});
describe("stats block (preview vs. render intentionally differ)", () => {
  it("render() includes the data-count hook that preview() omits", () => {
    const h = makeHelper();
    const s = { type: "stats", items: [{ n: "100+", label: "Customers" }] };
    expect(CORE_BLOCKS.stats.render(s, h)).toContain("data-count");
    expect(CORE_BLOCKS.stats.preview(s, h)).not.toContain("data-count");
  });
});
describe("text block", () => {
  it("passes s.text through h.md() and applies alignment", () => {
    const h = makeHelper();
    const s = { type: "text", text: "hello world", align: "center" };
    const out = CORE_BLOCKS.text.render(s, h);
    expect(out).toContain("<p>hello world</p>");
    expect(out).toContain("text-align:center;");
  });
});
describe("heading block", () => {
  it("escapes s.text via h.E() and falls back per-function on empty text", () => {
    const h = makeHelper();
    expect(CORE_BLOCKS.heading.preview({ type: "heading" }, h)).toContain(">Heading<");
    expect(CORE_BLOCKS.heading.render({ type: "heading" }, h)).not.toContain(">Heading<");
  });
  it("adds data-scramble in render() only when s.scramble is 'yes'", () => {
    const h = makeHelper();
    const s = { type: "heading", text: "Hi", scramble: "yes" };
    expect(CORE_BLOCKS.heading.render(s, h)).toContain("data-scramble");
    expect(CORE_BLOCKS.heading.preview(s, h)).not.toContain("data-scramble");
  });
});
describe("link block", () => {
  it("defaults to a pill-styled '#' link with 'Visit →' label", () => {
    const h = makeHelper();
    const out = CORE_BLOCKS.link.preview({ type: "link" }, h);
    expect(out).toContain('href="#"');
    expect(out).toContain("Visit");
  });
  it("omits target=_blank when new_tab is 'no'", () => {
    const h = makeHelper();
    const s = { type: "link", url: "/x", new_tab: "no" };
    expect(CORE_BLOCKS.link.render(s, h)).not.toContain("target=");
  });
});
describe("links block", () => {
  it("renders one anchor per item, escaping href via h.A()", () => {
    const h = makeHelper();
    const s = {
      type: "links",
      items: [
        { u: "/a", t: "Alpha" },
        { u: "/b", t: "Beta" }
      ]
    };
    const out = CORE_BLOCKS.links.render(s, h);
    expect(out).toContain('href="/a"');
    expect(out).toContain('href="/b"');
    expect(out).toContain("Alpha");
    expect(out).toContain("Beta");
  });
});
describe("image block (preview vs. render intentionally differ)", () => {
  it("preview() shows an 'Image URL' placeholder when empty; render() renders nothing", () => {
    const h = makeHelper();
    const s = { type: "image" };
    expect(CORE_BLOCKS.image.preview(s, h)).toContain("Image URL");
    expect(CORE_BLOCKS.image.render(s, h)).not.toContain("<img");
  });
  it("both include the image tag once a url is set", () => {
    const h = makeHelper();
    const s = { type: "image", url: "/pic.jpg" };
    expect(CORE_BLOCKS.image.preview(s, h)).toContain('src="/pic.jpg"');
    expect(CORE_BLOCKS.image.render(s, h)).toContain('src="/pic.jpg"');
  });
});
describe("divider block", () => {
  it("uses a fixed 2rem width when style is 'short'", () => {
    const h = makeHelper();
    const s = { type: "divider", style: "short" };
    expect(CORE_BLOCKS.divider.preview(s, h)).toContain("width:2rem;");
    expect(CORE_BLOCKS.divider.render(s, h)).toContain("width:2rem;");
  });
  it("defaults to full width otherwise", () => {
    const h = makeHelper();
    const s = { type: "divider" };
    expect(CORE_BLOCKS.divider.render(s, h)).toContain("width:100%;");
  });
});
describe("cards block", () => {
  it("renders each item's title and body", () => {
    const h = makeHelper();
    const s = { type: "cards", items: [{ title: "Card One", body: "Body text" }] };
    const out = CORE_BLOCKS.cards.preview(s, h);
    expect(out).toContain("Card One");
    expect(out).toContain("Body text");
  });
});
describe("accordion block", () => {
  it("shows a placeholder when there are no items", () => {
    const h = makeHelper();
    expect(CORE_BLOCKS.accordion.preview({ type: "accordion" }, h)).toContain(
      "Add accordion items in editor"
    );
  });
  it("renders one <details> per item with the question escaped via h.E()", () => {
    const h = makeHelper();
    const s = { type: "accordion", items: [{ q: "Why?", a: "Because." }] };
    const out = CORE_BLOCKS.accordion.render(s, h);
    expect(out).toContain("<details");
    expect(out).toContain("Why?");
  });
});
