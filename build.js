








const FOYER_MARK = "Built with Foyer";
async function stripComments() {
  const entries = await readdir(dist, { recursive: true, withFileTypes: true });
  await Promise.all(entries.map(async (d) => {
    if (!d.isFile()) return;
    const fp = path.join(d.parentPath || d.path, d.name);
    if (d.name.endsWith(".html")) {
      const s = await readFile(fp, "utf8");
      await writeFile(fp, s.replace(/<!--[\s\S]*?-->/g, (m) => (m.includes(FOYER_MARK) ? m : "")));
    } else if (d.name.endsWith(".css")) {
      const s = await readFile(fp, "utf8");
      await writeFile(fp, s.replace(/\/\*[\s\S]*?\*\//g, ""));
    } else if (d.name.endsWith(".js") && fp.includes(`${path.sep}functions${path.sep}`)) {
      const code = await readFile(fp, "utf8");
      const out = await esbuild.transform(code, { loader: "js", format: "esm", minifyWhitespace: true, legalComments: "none" });
      await writeFile(fp, out.code);
    }
  }));
}
await stripComments();

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
