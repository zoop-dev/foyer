import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
const ROOT = path.dirname(new URL(import.meta.url).pathname);
const SITE = process.argv[2];
if (!SITE) {
  console.error("Usage: node migrations/run.js <site>");
  process.exit(1);
}
async function getSiteConfig(name) {
  const cfgPath = path.join(ROOT, "..", "sites", name, "config.json");
  return JSON.parse(await readFile(cfgPath, "utf8"));
}
function wrangler(cfg, sql) {
  return new Promise((resolve, reject) => {
    const env = { ...process.env, CLOUDFLARE_ACCOUNT_ID: cfg.cloudflare.accountId };
    const p = spawn(
      "npx",
      ["wrangler", "d1", "execute", cfg.cloudflare.d1Name, "--remote", "--json", "--command", sql],
      { env: env, cwd: path.join(ROOT, "..") }
    );
    let out = "";
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (out += d));
    p.on("close", (code) => (code === 0 ? resolve(out) : reject(new Error(out))));
  });
}
async function appliedMigrations(cfg) {
  try {
    const raw = await wrangler(cfg, `SELECT name FROM _migrations ORDER BY name`);
    const m = raw.match(/\[[\s\S]*\]/);
    if (!m) return [];
    const parsed = JSON.parse(m[0]);
    return (parsed[0]?.results || []).map((r) => r.name);
  } catch {
    return [];
  }
}
async function run() {
  const cfg = await getSiteConfig(SITE);
  await wrangler(
    cfg,
    `CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT (datetime('now')))`
  ).catch(() => {});
  const applied = await appliedMigrations(cfg);
  const files = (await readdir(ROOT)).filter((f) => /^\d{3}_.+\.sql$/.test(f)).sort();
  let ran = 0;
  for (const file of files) {
    if (applied.includes(file)) {
      console.log(`  skip  ${file} (already applied)`);
      continue;
    }
    const sql = await readFile(path.join(ROOT, file), "utf8");
    try {
      await wrangler(cfg, sql);
      await wrangler(cfg, `INSERT INTO _migrations (name) VALUES ('${file}')`);
      console.log(`  ✓     ${file}`);
      ran++;
    } catch (e) {
      console.error(`  ✗     ${file} FAILED: ${e.message?.slice(0, 200)}`);
      process.exit(1);
    }
  }
  console.log(ran ? `\n  ${ran} migration(s) applied.` : "\n  Up to date.");
}
run().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
