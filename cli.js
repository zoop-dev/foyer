#!/usr/bin/env node



import { readdir, readFile, writeFile, mkdir, cp, access } from "node:fs/promises";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import path from "node:path";
import process from "node:process";

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const tty = process.stdout.isTTY;

const E = (n) => (s) => (tty ? `\x1b[${n}m${s}\x1b[0m` : `${s}`);
const c = {
  dim: E(2), bold: E(1), red: E(31), green: E(32), yellow: E(33),
  blue: E(34), cyan: E(36), mag: E(35), grey: E(90),
  br: E("38;5;81"),   // foyer brand (soft cyan-blue)
};
const ok = c.green("✓"), bad = c.red("✗"), dot = c.br("•");

function banner() {
  const b = c.br, d = c.dim;
  console.log();
  console.log("   " + b("        ╭───╮"));
  console.log("   " + b("       ╭╯   ╰╮ ") + "  " + c.bold("foyer"));
  console.log("   " + b("      ╭╯ ╭─╮ ╰╮") + "  " + d("the gated-site framework"));
  console.log("   " + b("      │  │ │  │"));
  console.log();
}

const exists = (p) => access(p).then(() => true).catch(() => false);

async function sites() {
  const dir = path.join(ROOT, "sites");
  const names = await readdir(dir).catch(() => []);
  const out = [];
  for (const n of names) {
    const cfgPath = path.join(dir, n, "config.json");
    if (await exists(cfgPath)) out.push({ name: n, cfg: JSON.parse(await readFile(cfgPath, "utf8")) });
  }
  return out;
}
async function getSite(name) {
  const cfgPath = path.join(ROOT, "sites", name, "config.json");
  if (!(await exists(cfgPath))) die(`unknown site '${name}'.  Run ${c.cyan("foyer sites")} to list.`);
  return JSON.parse(await readFile(cfgPath, "utf8"));
}
async function version() {
  const pkg = JSON.parse(await readFile(path.join(ROOT, "package.json"), "utf8"));
  return pkg.version.split(".")[0];
}
function die(msg) { console.log("\n  " + bad + " " + msg + "\n"); process.exit(1); }
function header(t) { console.log("\n  " + c.bold(c.br("▸ ")) + c.bold(t)); }

function run(label, cmd, args, env = process.env) {
  const frames = ["⠋","⠙","⠹","⠸","⠼","⠴","⠦","⠧","⠇","⠏"];
  return new Promise((resolve, reject) => {
    let i = 0, buf = "";
    const tick = tty ? setInterval(() => {
      process.stdout.write("\r    " + c.br(frames[i++ % frames.length]) + " " + c.dim(label) + "   ");
    }, 80) : null;
    const p = spawn(cmd, args, { env, cwd: ROOT });
    p.stdout.on("data", (d) => (buf += d));
    p.stderr.on("data", (d) => (buf += d));
    p.on("close", (code) => {
      if (tick) clearInterval(tick);
      if (code === 0) { process.stdout.write("\r    " + ok + " " + label + "             \n"); resolve(buf); }
      else {
        process.stdout.write("\r    " + bad + " " + label + "             \n");
        console.log(c.dim(buf.split("\n").filter(Boolean).slice(-14).map((l) => "      " + l).join("\n")));
        reject(new Error(label + " failed"));
      }
    });
  });
}

function passthrough(cmd, args, env = process.env) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: "inherit", env, cwd: ROOT });
    p.on("close", (code) => (code === 0 ? resolve() : reject(new Error("exited " + code))));
  });
}
const acctEnv = (cfg) => ({ ...process.env, CLOUDFLARE_ACCOUNT_ID: cfg.cloudflare.accountId });

async function cmdSites() {
  const list = await sites(), v = await version();
  header(`sites  ${c.dim("· foyer v" + v)}`);
  console.log();
  for (const { name, cfg } of list) {
    const sw = cfg.themeColor || "#888";
    console.log("    " + c.br("∩") + " " + c.bold(name.padEnd(10)) +
      c.dim(" " + (cfg.domain || "").padEnd(18)) +
      c.grey("project=" + cfg.cloudflare.project) +
      "  " + swatch(sw) + c.dim(" " + sw));
  }
  console.log();
}
function swatch(hex) {
  const h = hex.replace("#", "");
  if (h.length !== 6 || !tty) return "■";
  const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
  return `\x1b[38;2;${r};${g};${b}m■\x1b[0m`;
}

async function cmdBuild(target) {
  const list = await resolveTargets(target);
  for (const { name } of list) { header(`build ${c.br(name)}`); await run("bundling + templating", "node", ["build.js", name]); }
  console.log("\n  " + ok + c.dim(` built ${list.length} site${list.length>1?"s":""}.\n`));
}

async function cmdDeploy(target) {
  const list = await resolveTargets(target);
  const v = await version();
  for (const { name, cfg } of list) {
    header(`deploy ${c.br(name)} ${c.dim("→ v" + v)}`);
    const env = acctEnv(cfg);
    await run("build", "node", ["build.js", name]);
    await run("bump D1 reload signal", "npx", ["wrangler","d1","execute",cfg.cloudflare.d1Name,
      "--command",`CREATE TABLE IF NOT EXISTS versions (id INTEGER PRIMARY KEY CHECK (id=1), sys TEXT NOT NULL DEFAULT '1', ui TEXT NOT NULL DEFAULT '1');INSERT OR IGNORE INTO versions (id,sys,ui) VALUES (1,'1','1');UPDATE versions SET sys='${v}' WHERE id=1;`,
      "--remote"], env);
    const out = await run("publish to Cloudflare Pages", "npx", ["wrangler","pages","deploy","dist",
      `--project-name=${cfg.cloudflare.project}`,"--branch=production","--commit-dirty=true"], env);
    const url = (out.match(/https:\/\/[a-z0-9]+\.[a-z0-9-]+\.pages\.dev/) || [])[0];
    console.log("      " + dot + c.dim(" live: ") + c.cyan("https://" + cfg.domain) + (url ? c.dim("  (" + url + ")") : ""));
  }
  console.log("\n  " + ok + c.green(c.bold(`  deployed ${list.length} site${list.length>1?"s":""} · v${v}`)) + "\n");

  await cmdGitea(`deploy v${v}`).catch((e) => console.log("  " + c.yellow("!") + c.dim(" gitea push skipped: " + e.message)));
}

async function cmdDev(name) {
  if (!name) die("usage: foyer dev <site>");
  await getSite(name);
  header(`dev ${c.br(name)}`);
  await run("build", "node", ["build.js", name]);
  console.log("    " + dot + c.dim(" starting local server (ctrl-c to stop)…\n"));
  await passthrough("npx", ["wrangler","pages","dev","dist","--ip","127.0.0.1"]);
}

async function cmdNew(name) {
  if (!name) die("usage: foyer new <site>");
  const dest = path.join(ROOT, "sites", name);
  if (await exists(path.join(dest, "config.json"))) die(`site '${name}' already exists.`);
  header(`new site ${c.br(name)}`);
  await mkdir(path.join(dest, "icons"), { recursive: true });
  const sample = await readFile(path.join(ROOT, "config.sample.json"), "utf8").catch(() => "{}");
  await writeFile(path.join(dest, "config.json"), sample);
  console.log("    " + ok + " created " + c.cyan(`sites/${name}/config.json`));
  console.log("    " + ok + " created " + c.cyan(`sites/${name}/icons/`) + c.dim(" (drop your favicon set here)"));
  console.log("\n  " + dot + c.dim(" next: edit the config, then ") + c.cyan(`foyer deploy ${name}`) + "\n");
}

async function cmdSecret(name, key) {
  if (!name || !key) die("usage: foyer secret <site> <NAME>   (value read from stdin / prompt)");
  const cfg = await getSite(name);
  header(`set secret ${c.br(key)} on ${c.br(name)}`);
  await passthrough("npx", ["wrangler","pages","secret","put",key,`--project-name=${cfg.cloudflare.project}`], acctEnv(cfg));
  console.log("    " + dot + c.dim(" redeploy for it to take effect: ") + c.cyan(`foyer deploy ${name}`) + "\n");
}

async function cmdDb(name, ...rest) {
  if (!name || !rest.length) die('usage: foyer db <site> "<SQL>"');
  const cfg = await getSite(name);
  const sql = rest.join(" ");
  header(`d1 ${c.br(cfg.cloudflare.d1Name)} ${c.dim("(" + name + ")")}`);
  await passthrough("npx", ["wrangler","d1","execute",cfg.cloudflare.d1Name,"--command",sql,"--remote"], acctEnv(cfg));
}

async function cmdVersion(next) {
  const pkgPath = path.join(ROOT, "package.json");
  const pkg = JSON.parse(await readFile(pkgPath, "utf8"));
  if (next) {
    const n = String(next).replace(/\D/g, "");
    pkg.version = `${n}.0.0`;
    await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
    console.log("\n  " + ok + " version → " + c.bold("v" + n) + c.dim(" (build/deploy to apply)\n"));
  } else {
    console.log("\n  " + dot + " Foyer version " + c.bold("v" + pkg.version.split(".")[0]) + "\n");
  }
}

async function cmdStatus(target) {
  const list = await resolveTargets(target);
  header("live status");
  console.log();
  const local = await version();
  for (const { name, cfg } of list) {
    let live = "—", okv = false;
    try {
      const r = await fetch(`https://${cfg.domain}/api/version?cb=${Date.now()}`);
      const j = await r.json(); live = j.sys_version || "?"; okv = live === local;
    } catch { live = c.red("unreachable"); }
    console.log("    " + (okv ? ok : c.yellow("●")) + " " + c.bold(name.padEnd(10)) +
      c.dim("live v") + (okv ? c.green(live) : c.yellow(live)) + c.dim("  / local v" + local) +
      (okv ? "" : c.dim("  (deploy to sync)")));
  }
  console.log();
}

async function resolveTargets(target) {
  const all = await sites();
  if (!target || target === "all") return all;
  const one = all.find((s) => s.name === target);
  if (!one) die(`unknown site '${target}'.  Run ${c.cyan("foyer sites")}.`);
  return [one];
}

const SB_URL = "https://tvtfoghrdqwssdwvebuo.supabase.co";
const SB_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2dGZvZ2hyZHF3c3Nkd3ZlYnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMzk2ODksImV4cCI6MjA5NTgxNTY4OX0.n_CRdzQQKYNGDHYmoVxyKafFJCfezKKlSiZddx8MXH4";
async function sbServiceKey() {
  if (process.env.FOYER_SB_SERVICE_KEY) return process.env.FOYER_SB_SERVICE_KEY;
  const env = await readFile(path.join(ROOT, ".foyer.env"), "utf8").catch(() => "");
  const m = env.match(/FOYER_SB_SERVICE_KEY\s*=\s*(.+)/);
  return m ? m[1].trim() : null;
}
const sbH = (key) => ({ apikey: key, authorization: `Bearer ${key}`, "content-type": "application/json" });
async function toDomain(name) { const a = await sites(); const s = a.find((x) => x.name === name); return s ? s.cfg.domain : name; }

async function cmdOffline(name, on, reason) {
  const key = await sbServiceKey();
  if (!key) die("needs the service key. Put " + c.cyan("FOYER_SB_SERVICE_KEY=<key>") + " in " + c.cyan(".foyer.env") + " (gitignored).");
  const domain = await toDomain(name);
  header(`${on ? "take offline" : "bring online"} ${c.br(domain)}`);
  const patch = { offline: on };
  if (on && reason) patch.offline_message = reason;   // shown on the offline screen
  const r = await fetch(`${SB_URL}/rest/v1/foyer_sites?domain=eq.${encodeURIComponent(domain)}`,
    { method: "PATCH", headers: { ...sbH(key), Prefer: "return=representation" }, body: JSON.stringify(patch) });
  if (!r.ok) { console.log(c.dim("      " + await r.text())); die("update failed (" + r.status + ")"); }
  if (!(await r.json()).length) die(`no registry row for '${domain}'. Add it to foyer_sites first.`);
  console.log("    " + ok + ` ${domain} is now ` + (on ? c.yellow("OFFLINE") : c.green("ONLINE")) + c.dim("  (edge cache clears within ~60s)"));
  if (on && reason) console.log("    " + dot + c.dim(' message: "') + reason + c.dim('"'));
  console.log();
}
async function cmdLicense(name, on, reason) {
  const key = await sbServiceKey();
  if (!key) die("needs the service key in " + c.cyan(".foyer.env") + ".");
  const domain = await toDomain(name);
  header(`${on ? "license" : "unlicense"} ${c.br(domain)}`);
  const patch = { licensed: on };
  if (!on && reason) patch.offline_message = reason;   // shown on the unlicensed screen
  const r = await fetch(`${SB_URL}/rest/v1/foyer_sites?domain=eq.${encodeURIComponent(domain)}`,
    { method: "PATCH", headers: { ...sbH(key), Prefer: "return=representation" }, body: JSON.stringify(patch) });
  if (!r.ok) { console.log(c.dim("      " + await r.text())); die("update failed (" + r.status + ")"); }
  if (!(await r.json()).length) die(`no registry row for '${domain}'. Add it to foyer_sites first.`);
  console.log("    " + ok + ` ${domain} is now ` + (on ? c.green("LICENSED") : c.red("UNLICENSED")) + c.dim("  (edge cache clears within ~60s)"));
  if (!on && reason) console.log("    " + dot + c.dim(' message: "') + reason + c.dim('"'));
  console.log();
}

async function cmdBypass(name, kind, code) {
  const key = await sbServiceKey();
  if (!key) die("needs the service key in " + c.cyan(".foyer.env") + ".");
  if (!name || !kind || !["offline", "unlicensed"].includes(kind))
    die('usage: foyer bypass <site> <offline|unlicensed> <code|clear>');
  const col = kind === "unlicensed" ? "unlicensed_bypass_hash" : "offline_bypass_hash";
  const domain = await toDomain(name);
  const clear = !code || code === "clear" || code === "-";
  header(`${clear ? "clear" : "set"} ${kind} bypass · ${c.br(domain)}`);
  const hash = clear ? "" : createHash("sha256").update(code).digest("hex");
  const r = await fetch(`${SB_URL}/rest/v1/foyer_sites?domain=eq.${encodeURIComponent(domain)}`,
    { method: "PATCH", headers: { ...sbH(key), Prefer: "return=representation" }, body: JSON.stringify({ [col]: hash }) });
  if (!r.ok) { console.log(c.dim("      " + await r.text())); die("update failed (" + r.status + ")"); }
  if (!(await r.json()).length) die(`no registry row for '${domain}'. Add it to foyer_sites first.`);
  if (clear) {
    console.log("    " + ok + ` ${kind} bypass ` + c.red("cleared") + c.dim("  (edge cache clears within ~60s)"));
  } else {
    console.log("    " + ok + ` ${kind} bypass set` + c.dim("  (edge cache clears within ~60s)"));
    console.log("    " + dot + c.dim(" code:  ") + c.br(code));
    console.log("    " + dot + c.dim(" view:  visit the offline screen → “Operator access”, or ") + c.cyan(`https://${domain}/?__fb=${encodeURIComponent(code)}`));
    console.log("    " + dot + c.dim(" lasts until you reload — nothing is stored client-side."));
  }
  console.log();
}

async function cmdGitea(msg) {
  header("deploy → Gitea");
  const v = await version();
  const message = (msg && msg.trim()) ? msg.trim() : `deploy v${v}`;
  const st = await run("check working tree", "git", ["status", "--porcelain"]);


  if (st.trim()) { await passthrough("git", ["add", "-A"]); await passthrough("git", ["commit", "-m", message]); }
  else console.log("    " + dot + c.dim(" nothing to commit"));
  console.log("    " + dot + c.dim(" pushing — git may ask for credentials…") + "\n");
  await passthrough("git", ["push"]);
  console.log("\n  " + ok + c.green(c.bold("  pushed to Gitea")) + c.dim(` · ${message}`) + "\n");
}

async function cmdRegistry() {
  header("site registry");
  console.log();
  const r = await fetch(`${SB_URL}/rest/v1/foyer_sites?select=domain,licensed,offline&order=domain`, { headers: sbH(SB_ANON) });
  if (!r.ok) die("fetch failed (" + r.status + ")");
  for (const s of await r.json())
    console.log("    " + (s.offline ? c.yellow("●") : ok) + " " + c.bold(s.domain.padEnd(20)) +
      (s.licensed ? c.green("licensed") : c.red("unlicensed")) + (s.offline ? c.yellow("  · offline") : ""));
  console.log();
}
async function cmdChangelog(version, ...rest) {
  const key = await sbServiceKey();
  if (!key) die("needs the service key in " + c.cyan(".foyer.env") + ".");
  if (!version || !rest.length) die('usage: foyer changelog <version> <title…>');
  header("add changelog entry");
  const r = await fetch(`${SB_URL}/rest/v1/foyer_changelog`,
    { method: "POST", headers: { ...sbH(key), Prefer: "return=minimal" }, body: JSON.stringify({ version: String(version), title: rest.join(" "), tag: "feature" }) });
  if (!r.ok) { console.log(c.dim("      " + await r.text())); die("insert failed (" + r.status + ")"); }
  console.log("    " + ok + ` added v${version}: ${rest.join(" ")}\n`);
}

function help() {
  banner();
  const row = (cmd, desc) => "    " + c.cyan(cmd.padEnd(26)) + c.dim(desc);
  console.log(c.bold("  USAGE") + c.dim("  foyer <command> [args]\n"));
  console.log(c.bold("  COMMANDS"));
  [
    ["sites", "list configured sites"],
    ["build <site|all>", "build to dist/"],
    ["deploy <site|all>", "build → bump reload → publish"],
    ["deploy gitea [msg]", "commit + push to Gitea"],
    ["dev <site>", "build + local server"],
    ["status <site|all>", "compare live vs local version"],
    ["new <site>", "scaffold a new site config"],
    ["secret <site> <NAME>", "set a Cloudflare secret"],
    ["db <site> \"<SQL>\"", "run a D1 query (remote)"],
    ["registry", "list sites in the Foyer control-plane"],
    ["offline <site> [reason]", "take a site offline (+ message)"],
    ["online <site>", "bring a site back online"],
    ["license <site>", "license a site to run Foyer"],
    ["unlicense <site> [reason]", "revoke a site's licence (+ message)"],
    ["bypass <site> <kind> <code>", "set view-bypass code (kind: offline|unlicensed; 'clear' to remove)"],
    ["changelog <NN> <title>", "add a /foyer changelog entry"],
    ["version [NN]", "show or set the version"],
    ["help", "show this"],
  ].forEach(([a, b]) => console.log(row(a, b)));
  console.log("\n  " + c.dim("examples:") + c.cyan("  foyer deploy all") + c.dim("   ·  ") + c.cyan("foyer status all") + "\n");
}

const [cmd, ...args] = process.argv.slice(2);
const table = {
  sites: () => cmdSites(), list: () => cmdSites(),
  build: () => cmdBuild(args[0]),
  deploy: () => (args[0] === "gitea" ? cmdGitea(args.slice(1).join(" ")) : cmdDeploy(args[0])),
  dev: () => cmdDev(args[0]),
  status: () => cmdStatus(args[0]),
  new: () => cmdNew(args[0]),
  secret: () => cmdSecret(args[0], args[1]),
  db: () => cmdDb(...args),
  offline: () => cmdOffline(args[0], true, args.slice(1).join(" ")),
  online: () => cmdOffline(args[0], false),
  license: () => cmdLicense(args[0], true),
  unlicense: () => cmdLicense(args[0], false, args.slice(1).join(" ")),
  bypass: () => cmdBypass(args[0], args[1], args.slice(2).join(" ")),
  gitea: () => cmdGitea(args.join(" ")),
  registry: () => cmdRegistry(),
  changelog: () => cmdChangelog(...args),
  version: () => cmdVersion(args[0]),
  help: () => help(), "--help": () => help(), "-h": () => help(),
};
Promise.resolve((table[cmd] || (() => help()))()).catch((e) => die(e.message));
