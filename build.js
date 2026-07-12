import * as esbuild from "esbuild";
import { minify as terserMinify } from "terser";
import { minify as htmlMinify } from "html-minifier-terser";
import { readFile, writeFile, rm, mkdir, cp, readdir } from "node:fs/promises";
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
  name: cfg.name,
  shortName: cfg.shortName,
  domain: cfg.domain,
  accent: cfg.themeColor,
  bg: cfg.bgColor || "#020a03",
  text: cfg.textColor || "#c8e6aa",
  publicAccess: cfg.publicAccess === true,
  captcha: (cfg.captcha || "").toLowerCase()
};
const iconNames = (await readdir(path.join(root, "assets/icons")).catch(() => [])).filter((f) => f.endsWith(".svg")).map((f) => f.slice(0, -4)).sort();
const define = {
  __VERSION__: JSON.stringify(VERSION),
  __SITE__: JSON.stringify(SITE),
  __ICONS__: JSON.stringify(iconNames)
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
  OG_IMAGE: cfg.ogImage ? /^https?:\/\//.test(cfg.ogImage) ? cfg.ogImage : `https://${cfg.domain}${cfg.ogImage.startsWith("/") ? "" : "/"}${cfg.ogImage}` : `https://${cfg.domain}/icons/favicon-512.png`,
  TWITTER_CARD: cfg.ogImage ? "summary_large_image" : "summary",
  ACCENT: cfg.themeColor,
  ACCENT_RGB: hexToRgb(cfg.themeColor),
  ACCENT_BRIGHT: cfg.accentBright || cfg.themeColor,
  TEXT: cfg.textColor || "#c8e6aa",
  MUTED_RGB: cfg.mutedRgb || "180,230,190"
};
function applyTokens(s) {
  return s.replace(
    /\{\{([A-Z_]+)\}\}/g,
    (m, k) => k in tokens ? tokens[k] : m
  ).replace(/\?v=\d+/g, `?v=${VERSION}`);
}
const SHARED_RENDER = path.join(root, "src/blocks/render.js");
function grabFn(src, name) {
  const a = src.indexOf(`function ${name}(`);
  if (a < 0) return null;
  let depth = 0, k = src.indexOf("{", a);
  for (; k < src.length; k++) {
    if (src[k] === "{") depth++;
    else if (src[k] === "}" && --depth === 0) {
      k++;
      break;
    }
  }
  return src.slice(a, k);
}
async function assertRenderersInSync() {
  const shared = await readFile(SHARED_RENDER, "utf8");
  if (!grabFn(shared, "bXtra")) throw new Error("renderer guard: bXtra() not found in src/blocks/render.js");
  const blocks = await readFile(path.join(root, "admin/js/blocks.js"), "utf8");
  const siteRender = await readFile(path.join(root, "src/main/20-render.js"), "utf8");
  const cases = (s) => [...(s || "").matchAll(/case '([a-z]+)'/g)].map((m) => m[1]).sort();
  const c1 = cases(grabFn(blocks, "bRender")), c2 = cases(grabFn(siteRender, "pgRenderSec"));
  if (c1.join(",") !== c2.join(",")) {
    const only = (a, b) => a.filter((x) => !b.includes(x));
    throw new Error(`renderer drift: core block cases differ \u2014 preview-only [${only(c1, c2)}], site-only [${only(c2, c1)}]`);
  }
}
await assertRenderersInSync();
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
const MAIN_CHUNKS = [
  "10-core",
  "20-render",
  "30-net",
  "40-pages",
  "50-account",
  "60-gate",
  "70-magic",
  "80-boot"
];
const sharedRender = await readFile(SHARED_RENDER, "utf8");
const sharedLib = await readFile(path.join(root, "src/shared/lib.js"), "utf8");
const mainChunks = await Promise.all(
  MAIN_CHUNKS.map((n) => readFile(path.join(root, "src/main", `${n}.js`), "utf8"))
);
const mainSource = [sharedLib, sharedRender, ...mainChunks].join("\n");
await esbuild.build({
  stdin: { contents: mainSource, sourcefile: "app.combined.js", loader: "js" },
  outfile: path.join(dist, "app.js"),
  bundle: true,
  format: "iife",
  minify: true,
  sourcemap: true,
  target: "es2020",
  define,
  legalComments: "none"
});
await esbuild.build({
  entryPoints: ["utils", "terms-gate", "analytics", "tutorials", "reviews", "collections", "backup", "interactions", "mobile", "main"].map((n) => path.join(root, "admin/js", `${n}.js`)),
  outdir: path.join(dist, "admin/js"),
  bundle: false,
  minifyWhitespace: true,
  minifySyntax: true,
  minifyIdentifiers: false,
  target: "es2020",
  define,
  legalComments: "none"
});
await esbuild.build({
  entryPoints: [path.join(root, "src/shared/lib.js")],
  outfile: path.join(dist, "admin/js/lib.js"),
  bundle: false,
  minifyWhitespace: true,
  minifySyntax: true,
  minifyIdentifiers: false,
  target: "es2020",
  legalComments: "none"
});
const builderSource = [
  sharedLib,
  sharedRender,
  await readFile(path.join(root, "admin/js/blocks.js"), "utf8"),
  await readFile(path.join(root, "admin/js/builder.js"), "utf8")
].join("\n");
await esbuild.build({
  stdin: { contents: builderSource, sourcefile: "builder.combined.js", loader: "js" },
  outfile: path.join(dist, "admin/js/builder.js"),
  bundle: false,
  minifyWhitespace: true,
  minifySyntax: true,
  minifyIdentifiers: false,
  target: "es2020",
  define,
  legalComments: "none"
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
await templateFile("admin/admin-mobile.css");
for (const item of ["functions", "foyer", "offline.html", "_headers", "_redirects", "deps", "sw.js", "assets"]) {
  await cp(path.join(root, item), path.join(dist, item), { recursive: true }).catch(() => {
  });
}
for (const html of ["foyer/index.html", "foyer/changelog/index.html", "foyer/about/index.html", "offline.html"]) {
  await templateFile(html).catch(() => {
  });
}
await cp(path.join(siteDir, "icons"), path.join(dist, "icons"), { recursive: true });
const FOYER_MARK = "Built with Foyer";
const stripJs = async (code) => {
  try {
    const result = await terserMinify(code, {
      compress: { passes: 2, unsafe: false },
      mangle: { toplevel: false },
      keep_fnames: true,
      output: { comments: false },
      module: false
    });
    return result.code || code;
  } catch {
    try {
      return (await esbuild.transform(code, { loader: "js", minifyWhitespace: true, legalComments: "none" })).code;
    } catch {
      return code;
    }
  }
};
async function stripHtml(s) {
  try {
    return await htmlMinify(s, {
      collapseWhitespace: true,
      removeComments: true,
      ignoreCustomComments: [/Built with Foyer/],
      minifyCSS: true,
      minifyJS: true,
      collapseBooleanAttributes: true,
      removeRedundantAttributes: true,
      sortAttributes: true,
      sortClassName: false
    });
  } catch {
    s = s.replace(/<!--[\s\S]*?-->/g, (m) => m.includes(FOYER_MARK) ? m : "");
    s = s.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/gi, (m, o, body, cl) => o + body.replace(/\/\*[\s\S]*?\*\//g, "") + cl);
    return s;
  }
}
async function stripComments() {
  const entries = await readdir(dist, { recursive: true, withFileTypes: true });
  await Promise.all(entries.map(async (d) => {
    if (!d.isFile()) return;
    const fp = path.join(d.parentPath || d.path, d.name);
    if (fp.includes(`${path.sep}deps${path.sep}`)) return;
    if (d.name.endsWith(".html")) {
      await writeFile(fp, await stripHtml(await readFile(fp, "utf8")));
    } else if (d.name.endsWith(".css")) {
      const s = await readFile(fp, "utf8");
      try {
        const result = await esbuild.transform(s, { loader: "css", minify: true });
        await writeFile(fp, result.code);
      } catch {
        await writeFile(fp, s.replace(/\/\*[\s\S]*?\*\//g, ""));
      }
    } else if (d.name.endsWith(".js") && (fp.includes(`${path.sep}functions${path.sep}`) || d.name === "sw.js")) {
      await writeFile(fp, await stripJs(await readFile(fp, "utf8")));
    }
  }));
}
await stripComments();
const wrangler = `name = "${cfg.cloudflare.project}"
compatibility_date = "2024-09-23"
pages_build_output_dir = "dist"

# Workers AI \u2014 powers the builder's "Generate page" assistant (env.AI).
[ai]
binding = "AI"

${cfg.kvId ? `# Edge read-cache epoch store (env.FOYER_KV).
[[kv_namespaces]]
binding = "FOYER_KV"
id = "${cfg.kvId}"

` : ""}[vars]
FOYER_DOMAIN = "${cfg.domain}"
# Web-push VAPID public key (shared across all Foyer sites; private key is a per-project secret).
VAPID_PUBLIC = "BO1ElzS9nKWvk5-cWVr_MNm-dtgPkybFI_wpK7y4EPhCl_hV__sWVWdhSHqDgR2-lQt03Jt6sszyFj-ERxkq0MA"
${cfg.publicAccess === true ? `FOYER_PUBLIC = "1"
` : ""}${cfg.dbHttp && cfg.dbHttp.url ? `DB_HTTP_URL = "${cfg.dbHttp.url}"
DB_HTTP_NAME = "${cfg.dbHttp.name || cfg.cloudflare.project}"
` : ""}${cfg.rag && cfg.rag.url ? `RAG_URL = "${cfg.rag.url}"
RAG_DB = "${cfg.rag.db || cfg.cloudflare.project}"
` : ""}[[d1_databases]]
binding = "DB"
database_name = "${cfg.cloudflare.d1Name}"
database_id = "${cfg.cloudflare.d1Id}"
`;
await writeFile(path.join(root, "wrangler.toml"), wrangler);
console.log(`\u2713 built ${site} (v${VERSION}) \u2192 dist/`);
