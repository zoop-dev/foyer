import { describe, it, expect } from "vitest";
import * as pack from "../packs/charts/charts.js";
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
const blocks = Object.entries(pack).filter(([key]) => key !== "PACK");
describe("charts pack registry", () => {
  it("has 10 blocks, each with a unique chart-prefixed type and preview/render/editorFields functions", () => {
    expect(blocks).toHaveLength(10);
    const types = /* @__PURE__ */ new Set();
    for (const [key, block] of blocks) {
      expect(block.type.startsWith("chart-")).toBe(true);
      expect(types.has(block.type)).toBe(false);
      types.add(block.type);
      expect(typeof block.preview).toBe("function");
      expect(typeof block.render).toBe("function");
      expect(typeof block.editorFields).toBe("function");
    }
    expect(types.size).toBe(10);
  });
  it("every block's preview()/render()/editorFields() return strings without throwing, for populated defaults() and empty state", () => {
    const h = makeHelper();
    for (const [key, block] of blocks) {
      const populated = block.defaults(`${key}-id`);
      expect(typeof block.preview(populated, h)).toBe("string");
      expect(typeof block.render(populated, h)).toBe("string");
      expect(typeof block.editorFields(populated)).toBe("string");
      const empty = { id: "x", type: block.type };
      expect(typeof block.preview(empty, h)).toBe("string");
      expect(typeof block.render(empty, h)).toBe("string");
      expect(typeof block.editorFields(empty)).toBe("string");
    }
  });
});
describe("chart-progress block", () => {
  it("shows the percentage value in the ring's center label", () => {
    const h = makeHelper();
    const s = { type: "chart-progress", title: "Completion", value: 68 };
    expect(pack.progressRing.render(s, h)).toContain("68%");
  });
});
describe("chart-donut block", () => {
  it("renders each data item's label in the legend", () => {
    const h = makeHelper();
    const s = {
      type: "chart-donut",
      items: [
        { label: "Direct", value: 40 },
        { label: "Search", value: 30 }
      ]
    };
    const out = pack.donutChart.render(s, h);
    expect(out).toContain("Direct");
    expect(out).toContain("Search");
  });
  it("shows a placeholder when there are no items", () => {
    const h = makeHelper();
    expect(pack.donutChart.render({ type: "chart-donut" }, h)).toContain(
      "Add chart data in editor"
    );
  });
});
describe("chart-bar block", () => {
  it("renders each item's label", () => {
    const h = makeHelper();
    const s = {
      type: "chart-bar",
      items: [
        { label: "Alpha", value: 40 },
        { label: "Beta", value: 65 }
      ]
    };
    const out = pack.barChart.render(s, h);
    expect(out).toContain("Alpha");
    expect(out).toContain("Beta");
  });
  it("switches layout direction based on orientation", () => {
    const h = makeHelper();
    const vertical = { type: "chart-bar", items: [{ label: "A", value: 10 }] };
    const horizontal = {
      type: "chart-bar",
      orientation: "horizontal",
      items: [{ label: "A", value: 10 }]
    };
    expect(pack.barChart.render(vertical, h)).toContain("flex-direction:column");
    expect(pack.barChart.render(horizontal, h)).not.toContain("flex-direction:column");
  });
});
describe("chart-comparison block", () => {
  it("renders both series names and category labels", () => {
    const h = makeHelper();
    const s = {
      type: "chart-comparison",
      seriesAName: "This year",
      seriesBName: "Last year",
      items: [{ label: "Jan", valueA: 40, valueB: 30 }]
    };
    const out = pack.comparisonChart.render(s, h);
    expect(out).toContain("This year");
    expect(out).toContain("Last year");
    expect(out).toContain("Jan");
  });
});
