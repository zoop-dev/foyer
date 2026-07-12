








const FOYER_MARK = "Built with Foyer";


const stripJs = async (code) => {
  try {
    const result = await terserMinify(code, {
      compress: { passes: 2, unsafe: false },
      mangle: { toplevel: false },
      keep_fnames: true,
      output: { comments: false },
      module: false,
    });
    return result.code || code;
  } catch {
    try { return (await esbuild.transform(code, { loader: "js", minifyWhitespace: true, legalComments: "none" })).code; }
    catch { return code; }
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
      sortClassName: false,
    });
  } catch {

    s = s.replace(/<!--[\s\S]*?-->/g, (m) => (m.includes(FOYER_MARK) ? m : ""));
    s = s.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/gi, (m, o, body, cl) => o + body.replace(/\/\*[\s\S]*?\*\//g, "") + cl);
    return s;
  }
}
async function stripComments() {
  const entries = await readdir(dist, { recursive: true, withFileTypes: true });
  await Promise.all(entries.map(async (d) => {
    if (!d.isFile()) return;
    const fp = path.join(d.parentPath || d.path, d.name);
    if (fp.includes(`${path.sep}deps${path.sep}`)) return;   // vendored libs ship pristine (keep license headers)
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

# Workers AI — powers the builder's "Generate page" assistant (env.AI).
[ai]
binding = "AI"

${cfg.kvId ? `# Edge read-cache epoch store (env.FOYER_KV).\n[[kv_namespaces]]\nbinding = "FOYER_KV"\nid = "${cfg.kvId}"\n\n` : ""}[vars]
FOYER_DOMAIN = "${cfg.domain}"
# Web-push VAPID public key (shared across all Foyer sites; private key is a per-project secret).
VAPID_PUBLIC = "BO1ElzS9nKWvk5-cWVr_MNm-dtgPkybFI_wpK7y4EPhCl_hV__sWVWdhSHqDgR2-lQt03Jt6sszyFj-ERxkq0MA"
${cfg.publicAccess === true ? `FOYER_PUBLIC = "1"\n` : ""}${cfg.dbHttp && cfg.dbHttp.url ? `DB_HTTP_URL = "${cfg.dbHttp.url}"\nDB_HTTP_NAME = "${cfg.dbHttp.name || cfg.cloudflare.project}"\n` : ""}${cfg.rag && cfg.rag.url ? `RAG_URL = "${cfg.rag.url}"\nRAG_DB = "${cfg.rag.db || cfg.cloudflare.project}"\n` : ""}[[d1_databases]]
binding = "DB"
database_name = "${cfg.cloudflare.d1Name}"
database_id = "${cfg.cloudflare.d1Id}"
`;
await writeFile(path.join(root, "wrangler.toml"), wrangler);

console.log(`✓ built ${site} (v${VERSION}) → dist/`);
