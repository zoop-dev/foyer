import { minify as terserMinify } from "terser";
import * as esbuild from "esbuild";
import { minify as htmlMinify } from "html-minifier-terser";
import { readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";
const ROOT = path.resolve(process.argv[2] || ".");
const stripJs = async (code) => {
  try {
    const r = await terserMinify(code, {
      compress: false,
      mangle: false,
      keep_fnames: true,
      output: { comments: false }
    });
    if (r.code) return r.code;
  } catch {
  }
  try {
    return (await esbuild.transform(code, {
      loader: "js",
      minifyWhitespace: false,
      legalComments: "none"
    })).code;
  } catch {
    return code;
  }
};
const SKIP = [
  /[/\\](deps|node_modules|dist|\.git)[/\\]/,
  /[/\\]assets[/\\]fonts[/\\]/,
  /\.(json|md|sql|ico|png|svg|woff2)$/
];
const entries = await readdir(ROOT, { recursive: true, withFileTypes: true });
let n = 0;
await Promise.all(
  entries.map(async (d) => {
    if (!d.isFile()) return;
    const fp = path.join(d.parentPath || d.path, d.name);
    if (SKIP.some((r) => r.test(fp))) return;
    try {
      if (d.name.endsWith(".js")) {
        const orig = await readFile(fp, "utf8");
        const stripped = await stripJs(orig);
        if (stripped !== orig) {
          await writeFile(fp, stripped);
          n++;
        }
      } else if (d.name.endsWith(".css")) {
        const orig = await readFile(fp, "utf8");
        let stripped;
        try {
          stripped = (await esbuild.transform(orig, { loader: "css", minify: true })).code;
        } catch {
          stripped = orig.replace(/\/\*[\s\S]*?\*\//g, "");
        }
        if (stripped !== orig) {
          await writeFile(fp, stripped);
          n++;
        }
      } else if (d.name.endsWith(".html")) {
        const orig = await readFile(fp, "utf8");
        try {
          const stripped = await htmlMinify(orig, {
            collapseWhitespace: false,
            removeComments: true,
            ignoreCustomComments: [/Built with Foyer/],
            minifyCSS: false,
            minifyJS: false
          });
          if (stripped !== orig) {
            await writeFile(fp, stripped);
            n++;
          }
        } catch {
        }
      }
    } catch {
    }
  })
);
console.log(`  \u2713 stripped comments from ${n} source file${n !== 1 ? "s" : ""}`);
