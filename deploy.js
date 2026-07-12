import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
const root = path.dirname(new URL(import.meta.url).pathname);
const site = process.argv[2];
if (!site) {
  console.error("usage: node deploy.js <site>   (e.g. node deploy.js lanson)");
  process.exit(1);
}
const cfg = JSON.parse(await readFile(path.join(root, "sites", site, "config.json"), "utf8"));
const pkg = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const VERSION = pkg.version.split(".")[0];
const env = { ...process.env, CLOUDFLARE_ACCOUNT_ID: cfg.cloudflare.accountId };
const run = (cmd, args) => execFileSync(cmd, args, { stdio: "inherit", env });
console.log(`
\u25B8 building ${site} v${VERSION}`);
run("node", ["build.js", site]);
console.log(`
\u25B8 setting D1 (${cfg.cloudflare.d1Name}) versions.sys = '${VERSION}'`);
const versionSql = `CREATE TABLE IF NOT EXISTS versions (id INTEGER PRIMARY KEY CHECK (id = 1), sys TEXT NOT NULL DEFAULT '1', ui TEXT NOT NULL DEFAULT '1');INSERT OR IGNORE INTO versions (id, sys, ui) VALUES (1, '1', '1');UPDATE versions SET sys='${VERSION}' WHERE id=1;`;
run("npx", [
  "wrangler",
  "d1",
  "execute",
  cfg.cloudflare.d1Name,
  "--command",
  versionSql,
  "--remote"
]);
console.log(`
\u25B8 deploying dist/ \u2192 Pages project '${cfg.cloudflare.project}'`);
run("npx", [
  "wrangler",
  "pages",
  "deploy",
  "dist",
  `--project-name=${cfg.cloudflare.project}`,



  "--branch=production",
  "--commit-dirty=true"
]);
console.log(`
\u2713 deployed ${site} v${VERSION}`);
