export function preview(s, h) {
  const sh = s.size === "sm" ? "1rem" : s.size === "lg" ? "4rem" : s.size === "xl" ? "7rem" : "2.5rem";
  return `<div style="height:${sh};"></div>`;
}
export function render(s, h) {
  const sh = s.size === "sm" ? "1rem" : s.size === "lg" ? "4rem" : s.size === "xl" ? "7rem" : "2.5rem";
  return `<div style="height:${sh};"></div>`;
}
