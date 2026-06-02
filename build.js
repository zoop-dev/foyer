














import * as esbuild from "esbuild";
import { readFile, writeFile, rm, mkdir, cp } from "node:fs/promises";
import path from "node:path";

const root = path.dirname(new URL(import.meta.url).pathname);
const dist = path.join(root, "dist");

const site = process.argv[2];
if (!site) {
  console.error("usage: node build.js <site>   (e.g. node build.js lanson)");
  process.exit(1);
}
const siteDir = path.join(root, "sites", site);
const cfg = JSON.parse(await readFile(path.join(siteDir, "config.json"), "utf8"));

const pkg = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const VERSION = pkg.version.split(".")[0];

const SITE = {
  name: cfg.name, shortName: cfg.shortName, domain: cfg.domain,

  accent: cfg.themeColor, bg: cfg.bgColor || "#020a03", text: cfg.textColor || "#c8e6aa",


  publicAccess: cfg.publicAccess === true,

  captcha: (cfg.captcha || "").toLowerCase(),
};
const define = {
  __VERSION__: JSON.stringify(VERSION),
  __SITE__: JSON.stringify(SITE),
};

const hexToRgb = (hex) => {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)].join(",");
};

const tokens = {
  VERSION: String(VERSION),
  NAME: cfg.name,
  SHORT_NAME: cfg.shortName,
  DOMAIN: cfg.domain,
  THEME_COLOR: cfg.themeColor,
  BG_COLOR: cfg.bgColor || "#020a03",
  BG_RGB: hexToRgb(cfg.bgColor || "#020a03"),
  TAGLINE: cfg.tagline || "",
  DESCRIPTION: cfg.description || "",
  KEYWORDS: cfg.keywords || "",

  ACCENT: cfg.themeColor,
  ACCENT_RGB: hexToRgb(cfg.themeColor),
  ACCENT_BRIGHT: cfg.accentBright || cfg.themeColor,
  TEXT: cfg.textColor || "#c8e6aa",
  MUTED_RGB: cfg.mutedRgb || "180,230,190",
};
function applyTokens(s) {
  return s.replace(/\{\{([A-Z_]+)\}\}/g, (m, k) =>
    k in tokens ? tokens[k] : m
  ).replace(/\?v=\d+/g, `?v=${VERSION}`);
}

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

const MAIN_CHUNKS = [
  "10-core", "20-render", "30-net", "40-pages",
  "50-account", "60-gate", "70-magic", "80-boot",
];
const mainSource = (
  await Promise.all(
    MAIN_CHUNKS.map((n) => readFile(path.join(root, "src/main", `${n}.js`), "utf8"))
  )
).join("\n");

const mainResult = await esbuild.build({
  stdin: { contents: mainSource, sourcefile: "app.combined.js", loader: "js" },
  outfile: path.join(dist, "app.js"),
  bundle: true, format: "iife", minify: true, sourcemap: true,
  target: "es2020", metafile: true, define,
});
await writeFile(path.join(root, "meta.json"), JSON.stringify(mainResult.metafile));

await esbuild.build({
  entryPoints: ["utils", "builder", "analytics", "tutorials", "reviews", "mobile", "main"]
    .map((n) => path.join(root, "admin/js", `${n}.js`)),
  outdir: path.join(dist, "admin/js"),
  bundle: false, minifyWhitespace: true, minifySyntax: true, minifyIdentifiers: false,
  target: "es2020", define,
});

async function templateFile(rel) {
  const out = applyTokens(await readFile(path.join(root, rel), "utf8"));
  const dest = path.join(dist, rel);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, out);
}
await templateFile("index.html");
await templateFile("admin/index.html");
await templateFile("manifest.json");
await templateFile("robots.txt");
await templateFile("style.css");
await templateFile("admin/admin.css");


for (const item of ["functions", "foyer", "offline.html", "_headers", "_redirects", "schema.sql"]) {
  await cp(path.join(root, item), path.join(dist, item), { recursive: true }).catch(() => {});
}


for (const html of ["foyer/index.html", "foyer/changelog/index.html", "foyer/about/index.html", "offline.html"]) {
  await templateFile(html).catch(() => {});
}
await cp(path.join(siteDir, "icons"), path.join(dist, "icons"), { recursive: true });

const wrangler = `name = "${cfg.cloudflare.project}"
compatibility_date = "2024-09-23"
pages_build_output_dir = "dist"
${cfg.publicAccess === true ? `
[vars]
FOYER_PUBLIC = "1"
` : ""}
[[d1_databases]]
binding = "DB"
database_name = "${cfg.cloudflare.d1Name}"
database_id = "${cfg.cloudflare.d1Id}"
`;
await writeFile(path.join(root, "wrangler.toml"), wrangler);

console.log(`✓ built ${site} (v${VERSION}) → dist/`);
