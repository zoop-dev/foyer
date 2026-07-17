#!/usr/bin/env node
import { readdir, readFile, writeFile, mkdir, cp, access, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { createHash } from "node:crypto";
import path from "node:path";
import process from "node:process";
import { SB_URL, SB_ANON } from "./functions/api/_lib/supabase.js";
const ROOT = path.dirname(new URL(import.meta.url).pathname);
const tty = process.stdout.isTTY;
const E = (n) => (s) => tty ? `\x1B[${n}m${s}\x1B[0m` : `${s}`;
const c = {
  dim: E(2),
  bold: E(1),
  red: E(31),
  green: E(32),
  yellow: E(33),
  blue: E(34),
  cyan: E(36),
  mag: E(35),
  grey: E(90),
  br: E("38;5;81")
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
    if (await exists(cfgPath))
      out.push({ name: n, cfg: JSON.parse(await readFile(cfgPath, "utf8")) });
  }
  return out;
}
async function getSite(name) {
  const cfgPath = path.join(ROOT, "sites", name, "config.json");
  if (!await exists(cfgPath))
    die(`unknown site '${name}'.  Run ${c.cyan("foyer sites")} to list.`);
  return JSON.parse(await readFile(cfgPath, "utf8"));
}
async function version() {
  const pkg = JSON.parse(await readFile(path.join(ROOT, "package.json"), "utf8"));
  return pkg.version.split(".")[0];
}
function die(msg) {
  console.log("\n  " + bad + " " + msg + "\n");
  process.exit(1);
}
function header(t) {
  console.log("\n  " + c.bold(c.br("▸ ")) + c.bold(t));
}
const STAGE_RE = /^::stage::(\d+)\/(\d+)::(.*)$/;
function run(label, cmd2, args2, env = process.env, input = null, cwd = ROOT) {
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  return new Promise((resolve, reject) => {
    let i = 0, buf = "", pending = "", statusText = c.dim(label);
    const CLR = "\r\x1B[2K";
    const render = () => process.stdout.write(CLR + "    " + c.br(frames[i++ % frames.length]) + " " + statusText);
    const feedLine = (line) => {
      const m = line.match(STAGE_RE);
      if (m) {
        const [, n, total, stageLabel] = m;
        const pct = Math.round(Number(n) / Number(total) * 100);
        statusText = c.dim(label) + c.grey(`  [${n}/${total} · ${pct}%] `) + c.dim(stageLabel);
      } else if (line) {
        buf += line + "\n";
      }
    };
    const tick = tty ? setInterval(render, 80) : null;
    const p = spawn(cmd2, args2, { env, cwd });
    if (input != null) {
      p.stdin.write(input);
      p.stdin.end();
    }
    const onData = (d) => {
      pending += d;
      const lines = pending.split("\n");
      pending = lines.pop();
      for (const l of lines) feedLine(l);
    };
    p.stdout.on("data", onData);
    p.stderr.on("data", onData);
    p.on("close", (code) => {
      if (pending) feedLine(pending);
      if (tick) clearInterval(tick);
      if (code === 0) {
        process.stdout.write(CLR + "    " + ok + " " + label + "\n");
        resolve(buf);
      } else {
        process.stdout.write(CLR + "    " + bad + " " + label + "\n");
        console.log(
          c.dim(
            buf.split("\n").filter(Boolean).slice(-14).map((l) => "      " + l).join("\n")
          )
        );
        reject(new Error(label + " failed"));
      }
    });
  });
}
function passthrough(cmd2, args2, env = process.env) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd2, args2, { stdio: "inherit", env, cwd: ROOT });
    p.on("close", (code) => code === 0 ? resolve() : reject(new Error("exited " + code)));
  });
}
const acctEnv = (cfg) => ({ ...process.env, CLOUDFLARE_ACCOUNT_ID: cfg.cloudflare.accountId });
function promptVisible(query) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl.on("SIGINT", () => {
      rl.close();
      process.stdout.write("\n");
      process.exit(130);
    });
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    });
  });
}
function readLine({ hidden = false } = {}) {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    const wasRaw = !!stdin.isRaw;
    if (stdin.setRawMode) stdin.setRawMode(true);
    stdin.resume();
    let buf = "";
    const onData = (d) => {
      for (const ch of d.toString("utf8")) {
        if (ch === "\r" || ch === "\n") {
          if (stdin.setRawMode) stdin.setRawMode(wasRaw);
          stdin.pause();
          stdin.removeListener("data", onData);
          process.stdout.write("\n");
          return resolve(buf);
        } else if (ch === "") {
          process.stdout.write("\n");
          process.exit(130);
        } else if (ch === "" || ch === "\b") {
          if (buf.length) {
            buf = buf.slice(0, -1);
            if (!hidden) process.stdout.write("\b \b");
          }
        } else if (ch >= " ") {
          buf += ch;
          process.stdout.write(hidden ? "•" : ch);
        }
      }
    };
    stdin.on("data", onData);
  });
}
async function ask(label, { def = "", required = false, hidden = false } = {}) {
  for (; ; ) {
    const hint = hidden ? "" : def ? c.dim(` [${def}]`) : required ? c.dim(" (required)") : c.dim(" (optional)");
    const q = "    " + c.br("?") + " " + c.bold(label) + hint + c.dim(": ");
    let a;
    if (hidden) {
      process.stdout.write(q);
      a = (await readLine({ hidden: true })).trim();
    } else {
      a = (await promptVisible(q)).trim();
    }
    if (a) return a;
    if (def) return def;
    if (!required) return "";
    console.log("      " + c.yellow("• required"));
  }
}
async function confirm(label, def = true) {
  const q = "    " + c.br("?") + " " + c.bold(label) + c.dim(def ? " [Y/n]: " : " [y/N]: ");
  const a = (await promptVisible(q)).trim().toLowerCase();
  return a ? a[0] === "y" : def;
}
const _rgb = (h) => {
  h = h.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};
const normHex = (s) => {
  s = (s || "").trim();
  if (!s) return null;
  if (!s.startsWith("#")) s = "#" + s;
  return /^#[0-9a-fA-F]{6}$/.test(s) ? s.toLowerCase() : null;
};
async function askColor(label, def) {
  for (; ; ) {
    const v = await ask(label + " " + swatch(def), { def });
    const h = normHex(v);
    if (h) {
      console.log("      " + swatch(h) + c.dim(" " + h));
      return h;
    }
    console.log("      " + c.yellow("• use a hex color like #4dbd6a"));
  }
}
function previewCard({ bg, accent, text, name, tagline }) {
  if (!tty) return;
  const [R, G, B] = _rgb(bg), [ar, ag, ab] = _rgb(accent), [tr, tg, tb] = _rgb(text);
  const BG = `\x1B[48;2;${R};${G};${B}m`, RS = "\x1B[0m";
  const AC = `\x1B[38;2;${ar};${ag};${ab}m`, TX = `\x1B[38;2;${tr};${tg};${tb}m`;
  const W = 32;
  const row = (fg, s) => {
    s = (s || "").slice(0, W);
    return "    " + BG + "  " + fg + s + " ".repeat(Math.max(0, W - s.length)) + "  " + RS;
  };
  console.log("\n    " + c.dim("preview"));
  console.log(row(TX, ""));
  console.log(row(AC, name || ""));
  console.log(row(TX, tagline || ""));
  console.log(row(TX, ""));
  console.log();
}
function putSecret(cfg, key, value, label) {
  return run(
    label || `secret ${key}`,
    "npx",
    ["wrangler", "pages", "secret", "put", key, `--project-name=${cfg.cloudflare.project}`],
    acctEnv(cfg),
    value + "\n"
  );
}
async function cmdSites() {
  const list = await sites(), v = await version();
  header(`sites  ${c.dim("· foyer v" + v)}`);
  console.log();
  for (const { name, cfg } of list) {
    const sw = cfg.themeColor || "#888";
    console.log(
      "    " + c.br("∩") + " " + c.bold(name.padEnd(10)) + c.dim(" " + (cfg.domain || "").padEnd(18)) + c.grey("project=" + cfg.cloudflare.project) + "  " + swatch(sw) + c.dim(" " + sw)
    );
  }
  console.log();
}
function swatch(hex) {
  const h = hex.replace("#", "");
  if (h.length !== 6 || !tty) return "■";
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return `\x1B[38;2;${r};${g};${b}m■\x1B[0m`;
}
async function cmdBuild(target) {
  const list = await resolveTargets(target);
  for (const { name } of list) {
    header(`build ${c.br(name)}`);
    await run("bundling + templating", "node", ["build.js", name]);
  }
  console.log(
    "\n  " + ok + c.dim(` built ${list.length} site${list.length > 1 ? "s" : ""}.
`)
  );
}
async function cmdDeploy(target) {
  const list = await resolveTargets(target);
  const v = await version();
  for (const { name, cfg } of list) {
    header(`deploy ${c.br(name)} ${c.dim("→ v" + v)}`);
    const env = acctEnv(cfg);
    await run("build", "node", ["build.js", name]);
    const out = await run(
      "publish to Cloudflare Pages",
      "npx",
      [
        "wrangler",
        "pages",
        "deploy",
        "dist",
        `--project-name=${cfg.cloudflare.project}`,
        "--branch=production",
        "--commit-dirty=true"
      ],
      env
    );
    const url = (out.match(/https:\/\/[a-z0-9]+\.[a-z0-9-]+\.pages\.dev/) || [])[0];
    console.log(
      "      " + dot + c.dim(" live: ") + c.cyan("https://" + cfg.domain) + (url ? c.dim("  (" + url + ")") : "")
    );
  }
  console.log(
    "\n  " + ok + c.green(c.bold(`  deployed ${list.length} site${list.length > 1 ? "s" : ""} · v${v}`)) + "\n"
  );
  await sbSetMeta("latest_version", v).then(
    (okv) => console.log(
      "  " + (okv ? ok : c.yellow("!")) + c.dim(okv ? " global sys version → v" + v : " couldn't sync global version") + "\n"
    )
  ).catch(() => {
  });
  await cmdGithub(`deploy v${v}`).catch(
    (e) => console.log("  " + c.yellow("!") + c.dim(" github push skipped: " + e.message))
  );
}
async function foyerEnv(key) {
  if (process.env[key]) return process.env[key];
  const env = await readFile(path.join(ROOT, ".foyer.env"), "utf8").catch(() => "");
  const m = env.match(new RegExp(key + "\\s*=\\s*(.+)"));
  return m ? m[1].trim() : null;
}
async function cfApi(method, apiPath, token, body) {
  const r = await fetch(`https://api.cloudflare.com/client/v4${apiPath}`, {
    method,
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: body ? JSON.stringify(body) : void 0
  });
  const j = await r.json().catch(() => null);
  return { success: r.ok && j?.success, status: r.status, json: j };
}
async function cmdStatusDomain(target) {
  const token = await foyerEnv("CLOUDFLARE_API_TOKEN");
  if (!token)
    die(
      "needs a Cloudflare API token.\n      Create one at dash.cloudflare.com → My Profile → API Tokens\n      (permissions: Account > Cloudflare Pages > Edit), then put " + c.cyan("CLOUDFLARE_API_TOKEN=<token>") + " in " + c.cyan(".foyer.env") + "."
    );
  const list = await resolveTargets(target);
  header(`attach status domain${list.length > 1 ? "s" : ""}`);
  for (const { name, cfg } of list) {
    const hostname = `status.${cfg.domain}`;
    const { success, status, json } = await cfApi(
      "POST",
      `/accounts/${cfg.cloudflare.accountId}/pages/projects/${cfg.cloudflare.project}/domains`,
      token,
      { name: hostname }
    );
    const alreadyExists = (json?.errors || []).some(
      (e) => /already exists|duplicate|already associated/i.test(e.message || "")
    );
    if (success || alreadyExists) {
      console.log(
        "    " + ok + " " + c.bold(hostname) + c.dim(` (${name})` + (alreadyExists ? "  already attached" : "  attached"))
      );
    } else {
      const msg = (json?.errors || []).map((e) => e.message).join("; ") || `HTTP ${status}`;
      console.log("    " + bad + " " + c.bold(hostname) + c.dim(` (${name})  ` + msg));
    }
  }
  console.log(
    "\n  " + dot + c.dim(" if the domain's zone is on this Cloudflare account, DNS is created automatically.") + "\n  " + dot + c.dim(" otherwise, add this at your DNS provider: ") + c.cyan("status.<domain> CNAME <project>.pages.dev") + "\n  " + dot + c.dim(" SSL certificate issuance can take a few minutes.") + "\n"
  );
}
async function cmdAuthDeploy() {
  header("deploy Foyer platform → " + c.br("foyer.zo0p.dev"));
  const acct = await foyerEnv("FOYER_AUTH_ACCOUNT");
  const env = acct ? { ...process.env, CLOUDFLARE_ACCOUNT_ID: acct } : { ...process.env };
  const out = await run(
    "publish to Cloudflare Pages",
    "npx",
    [
      "wrangler",
      "pages",
      "deploy",
      "--project-name=foyer-auth",
      "--branch=main",
      "--commit-dirty=true"
    ],
    env,
    null,
    path.join(ROOT, "auth")
  );
  const url = (out.match(/https:\/\/[a-z0-9]+\.[a-z0-9-]+\.pages\.dev/) || [])[0];
  console.log(
    "    " + dot + c.dim(" live: ") + c.cyan("https://foyer.zo0p.dev") + (url ? c.dim("  (" + url + ")") : "")
  );
  console.log("\n  " + dot + c.dim(" one-time setup:"));
  console.log(
    "    " + dot + c.dim(" • run ") + c.cyan("supabase/auth-schema.sql") + c.dim(" in Supabase")
  );
  console.log(
    "    " + dot + c.dim(" • set the service key: ") + c.cyan("npx wrangler pages secret put SUPABASE_SERVICE_KEY --project-name=foyer-auth")
  );
  console.log(
    "    " + dot + c.dim(" • attach the ") + c.cyan("foyer.zo0p.dev") + c.dim(" custom domain to the foyer-auth Pages project")
  );
  console.log(
    "    " + dot + c.dim(" • (optional) put ") + c.cyan("FOYER_AUTH_ACCOUNT=<cf-account-id>") + c.dim(" in .foyer.env to target a specific account") + "\n"
  );
}
async function cmdStage(target) {
  const list = await resolveTargets(target);
  for (const { name, cfg } of list) {
    header(`stage ${c.br(name)} ${c.dim("→ preview")}`);
    const env = acctEnv(cfg);
    await run("build", "node", ["build.js", name]);
    const out = await run(
      "publish preview",
      "npx",
      [
        "wrangler",
        "pages",
        "deploy",
        "dist",
        `--project-name=${cfg.cloudflare.project}`,
        "--branch=preview",
        "--commit-dirty=true"
      ],
      env
    );
    const url = (out.match(/https:\/\/[a-z0-9]+\.[a-z0-9-]+\.pages\.dev/) || [])[0];
    console.log("      " + dot + c.dim(" preview: ") + c.cyan(url || "(see Cloudflare dashboard)"));
  }
  console.log(
    "\n  " + ok + c.dim(` staged ${list.length} site${list.length > 1 ? "s" : ""} to preview branch`) + "\n"
  );
}
async function cmdDev(name) {
  if (!name) die("usage: foyer dev <site>");
  await getSite(name);
  header(`dev ${c.br(name)}`);
  await run("build", "node", ["build.js", name]);
  console.log("    " + dot + c.dim(" starting local server (ctrl-c to stop)…\n"));
  await passthrough("npx", ["wrangler", "pages", "dev", "dist", "--ip", "127.0.0.1"]);
}
function defaultIconSvg({ bg = "#020a03", accent = "#4dbd6a" } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${bg}"/><g fill="none" stroke="${accent}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 50 V30 a18 18 0 0 1 36 0 V50"/><path d="M25 50 V34 a7 7 0 0 1 14 0 V50"/></g></svg>`;
}
function makeIco(images) {
  const header2 = Buffer.alloc(6);
  header2.writeUInt16LE(0, 0);
  header2.writeUInt16LE(1, 2);
  header2.writeUInt16LE(images.length, 4);
  const dir = Buffer.alloc(16 * images.length);
  let offset = 6 + 16 * images.length;
  images.forEach((img, i) => {
    const o = i * 16, n = img.size >= 256 ? 0 : img.size;
    dir.writeUInt8(n, o);
    dir.writeUInt8(n, o + 1);
    dir.writeUInt16LE(1, o + 4);
    dir.writeUInt16LE(32, o + 6);
    dir.writeUInt32LE(img.buf.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += img.buf.length;
  });
  return Buffer.concat([header2, dir, ...images.map((i) => i.buf)]);
}
async function generateIcons(svg, dir) {
  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    die(
      "icon generation needs the " + c.cyan("sharp") + " package — run " + c.cyan("npm i sharp") + " and retry."
    );
  }
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "favicon.svg"), svg.trim() + "\n");
  const src = Buffer.from(svg);
  const png = (size) => sharp(src, { density: 512 }).resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const files = {
    16: "favicon-16.png",
    32: "favicon-32.png",
    48: "favicon-48.png",
    96: "favicon-96.png",
    180: "apple-touch-icon.png",
    192: "favicon-192.png",
    512: "favicon-512.png"
  };
  const bufs = {};
  for (const size of Object.keys(files).map(Number)) {
    bufs[size] = await png(size);
    await writeFile(path.join(dir, files[size]), bufs[size]);
  }
  await writeFile(
    path.join(dir, "favicon.ico"),
    makeIco([16, 32, 48].map((s) => ({ size: s, buf: bufs[s] })))
  );
  console.log(
    "    " + ok + " generated " + c.bold(Object.keys(files).length + 1) + c.dim(" icons (svg, ico, png 16→512, apple-touch)")
  );
}
async function autoTurnstile(accountId, domain, name) {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!token) return null;
  try {
    const r = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/challenges/widgets`,
      {
        method: "POST",
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        body: JSON.stringify({
          name: (name || domain).slice(0, 50),
          domains: [domain],
          mode: "managed"
        })
      }
    );
    const j = await r.json();
    if (j.success && j.result?.sitekey && j.result?.secret)
      return { sitekey: j.result.sitekey, secret: j.result.secret };
  } catch {
  }
  return null;
}
async function sbDelete(domain) {
  const key = await sbServiceKey();
  if (!key) {
    console.log(
      "    " + c.yellow("!") + c.dim(" no service key — skipped Supabase removal (delete the row manually)")
    );
    return;
  }
  const r = await fetch(`${SB_URL}/rest/v1/foyer_sites?domain=eq.${encodeURIComponent(domain)}`, {
    method: "DELETE",
    headers: { ...sbH(key), Prefer: "return=minimal" }
  });
  console.log(
    "    " + (r.ok ? ok : bad) + (r.ok ? " removed from the control-plane" : c.dim(" Supabase delete failed (" + r.status + ")"))
  );
}
async function sbRegister({ domain, name, project }) {
  const key = await sbServiceKey();
  if (!key) {
    console.log(
      "    " + c.yellow("!") + c.dim(
        " no service key in .foyer.env — skipped Supabase registration (run later with the key set)"
      )
    );
    return;
  }
  const r = await fetch(`${SB_URL}/rest/v1/foyer_sites?on_conflict=domain`, {
    method: "POST",
    headers: { ...sbH(key), Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({
      domain,
      name,
      cf_project: project,
      licensed: true,
      offline: false
    })
  });
  if (!r.ok) {
    console.log("    " + bad + c.dim(" Supabase: " + (await r.text()).slice(0, 160)));
    return;
  }
  console.log("    " + ok + " registered in the Foyer control-plane " + c.dim("(licensed)"));
}
async function listCfAccounts() {
  const out = await run(
    "read your Cloudflare accounts",
    "npx",
    ["wrangler", "whoami"],
    process.env
  ).catch(() => "");
  const accts = [];
  const re = /[│|]\s*([^│|]+?)\s*[│|]\s*([0-9a-fA-F]{32})\s*[│|]/g;
  let m;
  while (m = re.exec(out)) accts.push({ name: m[1].trim(), id: m[2].toLowerCase() });
  return accts;
}
async function cmdNew(initialName) {
  banner();
  console.log(
    "  " + c.bold("Onboard a new Foyer site") + c.dim("  — answer a few questions and I'll create everything.\n")
  );
  const existing = await sites();
  const taken = new Set(existing.map((s) => s.name));
  const knownAccounts = [
    ...new Set(existing.map((s) => s.cfg.cloudflare?.accountId).filter(Boolean))
  ];
  header("identity");
  let key = (initialName || "").trim();
  for (; ; ) {
    if (!key) key = await ask("Site key (folder / project slug, e.g. 'acme')", { required: true });
    if (!/^[a-z0-9][a-z0-9-]*$/.test(key)) {
      console.log("      " + c.yellow("• lowercase letters, digits and dashes only"));
      key = "";
      continue;
    }
    if (taken.has(key)) {
      console.log("      " + c.yellow(`• '${key}' already exists`));
      key = "";
      continue;
    }
    break;
  }
  const name = await ask("Display name", {
    def: key.charAt(0).toUpperCase() + key.slice(1),
    required: true
  });
  const shortName = await ask("Short name (home-screen / PWA label)", {
    def: name.split(/\s+/)[0]
  });
  let domain = await ask("Domain (bare, no https://)", { required: true });
  domain = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim();
  header("branding");
  const themeColor = await askColor("Theme / accent color", "#4dbd6a");
  const bgColor = await askColor("Background color", "#020a03");
  const textColor = await askColor("Text color", "#c8e6aa");
  const tagline = await ask("Tagline", { def: "" });
  const description = await ask("Meta description", { def: tagline });
  const keywords = await ask("Keywords (comma separated)", { def: "" });
  previewCard({ bg: bgColor, accent: themeColor, text: textColor, name, tagline });
  header("cloudflare");
  let accounts = await listCfAccounts();
  let accountId = "", accountName = "";
  for (; ; ) {
    if (accounts.length) {
      console.log("    " + dot + c.dim(" your Cloudflare accounts:"));
      accounts.forEach(
        (a, i) => console.log(
          "      " + c.cyan(String(i + 1).padStart(2)) + ". " + c.bold(a.name) + c.dim("  " + a.id) + (knownAccounts.includes(a.id) ? c.dim("  · in use") : "")
        )
      );
      console.log("       " + c.cyan("L") + ". " + c.dim("log in to a different account"));
      const pick = (await ask("Pick an account (number), or L to log in", { required: true })).trim();
      if (/^l$/i.test(pick)) {
        await passthrough("npx", ["wrangler", "login"]);
        accounts = await listCfAccounts();
        continue;
      }
      const sel = accounts[parseInt(pick) - 1];
      if (sel) {
        accountId = sel.id;
        accountName = sel.name;
        break;
      }
      console.log("      " + c.yellow("• pick a listed number, or L to log in"));
    } else {
      console.log("    " + c.yellow("• not logged in to Cloudflare (or no accounts found)"));
      if (await confirm("Log in to Cloudflare now?", true)) {
        await passthrough("npx", ["wrangler", "login"]);
        accounts = await listCfAccounts();
        continue;
      }
      accountId = await ask("Enter a Cloudflare account id manually", {
        def: knownAccounts[0] || "",
        required: true
      });
      break;
    }
  }
  if (accountName)
    console.log("    " + ok + " using " + c.bold(accountName) + c.dim("  " + accountId));
  const project = await ask("Pages project name", { def: key });
  const cfEnv = { ...process.env, CLOUDFLARE_ACCOUNT_ID: accountId };
  let dbList = [];
  const dbOut = await run(
    "scan your D1 databases",
    "npx",
    ["wrangler", "d1", "list", "--json"],
    cfEnv
  ).catch(() => "");
  try {
    const m = dbOut.match(/\[[\s\S]*\]/);
    if (m) dbList = JSON.parse(m[0]);
  } catch {
  }
  let d1Name = "", d1Id = "";
  if (dbList.length) {
    console.log("    " + dot + c.dim(" existing databases:"));
    dbList.forEach(
      (d, i) => console.log(
        "      " + c.cyan(String(i + 1).padStart(2)) + ". " + c.bold(d.name) + c.dim("  " + (d.uuid || d.database_id || ""))
      )
    );
    if (await confirm("Use one of these (instead of creating a new one)?", true)) {
      for (; ; ) {
        const pick = await ask("Which one? (number or name)", { required: true });
        const sel = dbList[parseInt(pick) - 1] || dbList.find((d) => d.name === pick.trim());
        if (sel) {
          d1Name = sel.name;
          d1Id = sel.uuid || sel.database_id || "";
          break;
        }
        console.log("      " + c.yellow("• no match — pick a number or exact name"));
      }
    }
  } else {
    console.log("    " + c.dim("(no existing D1 databases on this account)"));
  }
  if (!d1Name) d1Name = await ask("New D1 database name", { def: key });
  header("access");
  const isPublic = await confirm("Make the site fully public (no sign-in gate)?", false);
  const secrets = {};
  let turnstile = false;
  if (!isPublic) {
    console.log("    " + c.dim("Choose sign-in methods (set up the ones you say yes to):"));
    if (await confirm("  • Google sign-in?", true)) {
      secrets.GOOGLE_CLIENT_ID = await ask("Google OAuth client id", { required: true });
    }
    if (await confirm("  • GitHub sign-in?", false)) {
      secrets.GITHUB_CLIENT_ID = await ask("GitHub OAuth client id", { required: true });
      secrets.GITHUB_CLIENT_SECRET = await ask("GitHub OAuth client secret", {
        required: true,
        hidden: true
      });
    }
    if (await confirm("  • Discord sign-in?", false)) {
      secrets.DISCORD_CLIENT_ID = await ask("Discord OAuth client id", { required: true });
      secrets.DISCORD_CLIENT_SECRET = await ask("Discord OAuth client secret", {
        required: true,
        hidden: true
      });
    }
    if (await confirm("  • Magic-link (email) sign-in?", false)) {
      secrets.RESEND_API_KEY = await ask("Resend API key", { required: true, hidden: true });
      secrets.RESEND_FROM = await ask("From address (e.g. login@yourdomain.com)", {
        required: true
      });
      secrets.SITE_NAME = name;
      secrets.SITE_URL = `https://${domain}`;
    }
    turnstile = await confirm("  • Add a Turnstile bot-check on the gate?", false);
    if (turnstile) {
      const auto = await autoTurnstile(accountId, domain, name);
      if (auto) {
        secrets.TURNSTILE_SITE_KEY = auto.sitekey;
        secrets.TURNSTILE_SECRET_KEY = auto.secret;
        console.log("    " + ok + c.dim(" auto-created a Turnstile widget for ") + c.cyan(domain));
      } else {
        console.log(
          "    " + c.dim("(set CLOUDFLARE_API_TOKEN to auto-create — entering keys manually)")
        );
        secrets.TURNSTILE_SITE_KEY = await ask("Turnstile site key", { required: true });
        secrets.TURNSTILE_SECRET_KEY = await ask("Turnstile secret key", {
          required: true,
          hidden: true
        });
      }
    }
  }
  header("admin");
  secrets.ADMIN_PASSWORD = await ask("Admin password (primary)", { required: true, hidden: true });
  const adminPw2 = await ask("Second admin password (optional)", { hidden: true });
  if (adminPw2) secrets.ADMIN_PASSWORD_2 = adminPw2;
  header("icon");
  console.log(
    "    " + c.dim(
      "paste single-line <svg…> code, or a path to an .svg file (multi-line SVGs: save to a file)"
    )
  );
  let iconInput = "";
  for (; ; ) {
    iconInput = (await ask("Icon SVG (blank = generate an arch mark in your colors)", { def: "" })).trim();
    if (!iconInput || iconInput.startsWith("<") || await exists(iconInput)) break;
    console.log("      " + c.yellow("• that's neither <svg> code nor an existing file path"));
  }
  header("review");
  const line = (k, v) => console.log("    " + c.dim((k + ":").padEnd(16)) + v);
  line("key", c.bold(key));
  line("name", name);
  line("domain", c.cyan(domain));
  line("account", accountName ? accountName + c.dim("  " + accountId) : accountId);
  line("project", project);
  line("d1", d1Name + (d1Id ? c.dim("  (reuse existing)") : c.dim("  (create new)")));
  line("access", isPublic ? c.green("public (no gate)") : c.yellow("gated"));
  if (!isPublic)
    line(
      "methods",
      Object.keys(secrets).filter((k) => /CLIENT_ID|RESEND_API/.test(k)).map((k) => k.split("_")[0].toLowerCase()).join(", ") + (turnstile ? " + turnstile" : "")
    );
  console.log();
  if (!await confirm(
    "Create the D1 db, project, secrets, Supabase entry, then build & deploy?",
    true
  ))
    die("aborted — nothing was created.");
  const dest = path.join(ROOT, "sites", key);
  const cfg = {
    name,
    shortName,
    domain,
    themeColor,
    bgColor,
    textColor,
    accentBright: themeColor,
    mutedRgb: "180,230,190",
    tagline,
    description,
    keywords,
    ...isPublic ? { publicAccess: true } : {},
    cloudflare: { accountId, project, d1Name, d1Id }
  };
  const env = acctEnv(cfg);
  header("scaffold");
  await mkdir(path.join(dest, "icons"), { recursive: true });
  await writeFile(path.join(dest, "config.json"), JSON.stringify(cfg, null, 2) + "\n");
  console.log("    " + ok + " wrote " + c.cyan(`sites/${key}/config.json`));
  let iconSvg = null;
  if (iconInput.startsWith("<")) iconSvg = iconInput;
  else if (iconInput) iconSvg = await readFile(iconInput, "utf8").catch(() => null);
  await generateIcons(
    iconSvg || defaultIconSvg({ bg: bgColor, accent: themeColor }),
    path.join(dest, "icons")
  );
  header("provision cloudflare");
  if (!cfg.cloudflare.d1Id) {
    const d1Out = await run(
      `create D1 database '${d1Name}'`,
      "npx",
      ["wrangler", "d1", "create", d1Name],
      env
    );
    const id = (d1Out.match(/database_id\s*=\s*"([0-9a-f-]{36})"/i) || d1Out.match(/"(?:uuid|database_id)"\s*:\s*"([0-9a-f-]{36})"/i) || [])[1];
    if (!id)
      die(
        "couldn't read the new D1 id from wrangler output. Create it manually and set cloudflare.d1Id in the config."
      );
    cfg.cloudflare.d1Id = id;
    await writeFile(path.join(dest, "config.json"), JSON.stringify(cfg, null, 2) + "\n");
  }
  console.log("    " + ok + " D1 " + c.bold(d1Name) + c.dim("  " + cfg.cloudflare.d1Id));
  await run(
    "apply schema.sql",
    "npx",
    ["wrangler", "d1", "execute", d1Name, "--file=schema.sql", "--remote"],
    env
  );
  await run(
    "create Pages project",
    "npx",
    ["wrangler", "pages", "project", "create", project, "--production-branch=production"],
    env
  ).catch(() => console.log("      " + c.dim("(project already exists — continuing)")));
  const secretKeys = Object.keys(secrets);
  if (secretKeys.length) {
    header("secrets");
    for (const k of secretKeys) await putSecret(cfg, k, secrets[k], `set ${k}`);
  }
  header("control-plane");
  await sbRegister({ domain, name, project });
  await cmdDeploy(key);
  header("done");
  console.log(
    "    " + ok + c.green(c.bold(` ${name} is live`)) + c.dim(" once DNS points at the Pages project.")
  );
  console.log(
    "    " + dot + c.dim(" point ") + c.cyan(domain) + c.dim(" at the '") + project + c.dim("' Pages project (Cloudflare → Pages → Custom domains)")
  );
  if (!isPublic) {
    if (secrets.GOOGLE_CLIENT_ID || secrets.GITHUB_CLIENT_ID || secrets.DISCORD_CLIENT_ID)
      console.log(
        "    " + dot + c.dim(" add ") + c.cyan(`https://${domain}`) + c.dim(" as an authorized OAuth redirect/origin in each provider's console")
      );
  }
  console.log("    " + dot + c.dim(" admin panel: ") + c.cyan(`https://${domain}/admin`) + "\n");
}
async function cmdIcons(name, svgPath) {
  if (!name) die("usage: foyer icons <site> [icon.svg]   (regenerates the full favicon set)");
  const cfg = await getSite(name);
  const dir = path.join(ROOT, "sites", name, "icons");
  header(`generate icons ${c.br(name)}`);
  let svg;
  if (svgPath) {
    svg = svgPath.trim().startsWith("<") ? svgPath : await readFile(svgPath, "utf8").catch(() => die("can't read " + c.cyan(svgPath)));
  } else if (await exists(path.join(dir, "favicon.svg"))) {
    svg = await readFile(path.join(dir, "favicon.svg"), "utf8");
    console.log(
      "    " + dot + c.dim(" using existing ") + c.cyan(`sites/${name}/icons/favicon.svg`)
    );
  } else {
    svg = defaultIconSvg({ bg: cfg.bgColor || "#020a03", accent: cfg.themeColor || "#4dbd6a" });
    console.log(
      "    " + dot + c.dim(" no SVG given — generated an arch mark in the site's colors")
    );
  }
  await generateIcons(svg, dir);
  console.log(
    "    " + dot + c.dim(" rebuild/deploy to publish: ") + c.cyan(`foyer deploy ${name}`) + "\n"
  );
}
async function cmdDelete(name) {
  if (!name) die("usage: foyer delete <site>");
  const cfg = await getSite(name);
  header(`delete ${c.br(name)} ${c.red("— removes EVERYTHING")}`);
  console.log("    " + c.dim("this will permanently delete:"));
  console.log("      " + c.red("•") + c.dim(" local ") + c.cyan(`sites/${name}/`));
  console.log(
    "      " + c.red("•") + c.dim(" Cloudflare Pages project ") + c.bold(cfg.cloudflare.project) + c.dim(" (and its secrets)")
  );
  console.log(
    "      " + c.red("•") + c.dim(" D1 database ") + c.bold(cfg.cloudflare.d1Name) + c.dim(" (all its data)")
  );
  console.log(
    "      " + c.red("•") + c.dim(" the Foyer control-plane row for ") + c.cyan(cfg.domain)
  );
  console.log();
  const typed = (await ask(`Type the site key ${c.bold(name)} to confirm`, {})).trim();
  if (typed !== name) die("aborted — nothing was deleted.");
  const env = acctEnv(cfg);
  header("teardown");
  await run(
    "delete Pages project",
    "npx",
    ["wrangler", "pages", "project", "delete", cfg.cloudflare.project, "--yes"],
    env
  ).catch((e) => console.log("      " + c.yellow("! ") + c.dim("Pages project: " + e.message)));
  console.log("    " + dot + c.dim(" deleting D1 database (confirm the wrangler prompt)…"));
  await passthrough("npx", ["wrangler", "d1", "delete", cfg.cloudflare.d1Name], env).catch(
    (e) => console.log("      " + c.yellow("! ") + c.dim("D1: " + e.message))
  );
  await sbDelete(cfg.domain);
  await rm(path.join(ROOT, "sites", name), { recursive: true, force: true });
  console.log("    " + ok + " removed " + c.cyan(`sites/${name}/`));
  console.log(
    "\n  " + ok + c.green(c.bold(`  '${name}' deleted`)) + c.dim(" — remember to remove the custom domain in Cloudflare if it was attached.") + "\n"
  );
}
async function cmdSecret(name, key) {
  if (!name || !key) die("usage: foyer secret <site> <NAME>   (value read from stdin / prompt)");
  const cfg = await getSite(name);
  header(`set secret ${c.br(key)} on ${c.br(name)}`);
  await passthrough(
    "npx",
    ["wrangler", "pages", "secret", "put", key, `--project-name=${cfg.cloudflare.project}`],
    acctEnv(cfg)
  );
  console.log(
    "    " + dot + c.dim(" redeploy for it to take effect: ") + c.cyan(`foyer deploy ${name}`) + "\n"
  );
}
async function cmdDb(name, ...rest) {
  if (!name || !rest.length) die('usage: foyer db <site> "<SQL>"');
  const cfg = await getSite(name);
  const sql = rest.join(" ");
  header(`d1 ${c.br(cfg.cloudflare.d1Name)} ${c.dim("(" + name + ")")}`);
  await passthrough(
    "npx",
    ["wrangler", "d1", "execute", cfg.cloudflare.d1Name, "--command", sql, "--remote"],
    acctEnv(cfg)
  );
}
async function cmdSetRole(name, email, role) {
  if (!name || !email || !role) die("usage: foyer setrole <site> <email> <admin|owner|none>");
  const r = role.toLowerCase();
  if (!["admin", "owner", "none"].includes(r))
    die(
      "role must be " + c.cyan("admin") + ", " + c.cyan("owner") + ", or " + c.cyan("none") + "."
    );
  const cfg = await getSite(name);
  const env = acctEnv(cfg);
  const addr = email.trim().toLowerCase();
  const dbRole = r === "none" ? null : r;
  header(`set role · ${c.br(name)}`);
  const sel = await run(
    "look up visitor",
    "npx",
    [
      "wrangler",
      "d1",
      "execute",
      cfg.cloudflare.d1Name,
      "--remote",
      "--json",
      "--command",
      `SELECT id FROM visitors WHERE email = ?1`,
      "--bind",
      addr
    ],
    env
  );
  let count = 0;
  try {
    const m = sel.match(/\[[\s\S]*\]/);
    if (m) count = (JSON.parse(m[0])[0]?.results || []).length;
  } catch {
  }
  if (!count)
    die(`no visitor with email '${email}' on ${name} — they must sign in at least once first.`);
  if (dbRole) {
    await run(
      "update role",
      "npx",
      [
        "wrangler",
        "d1",
        "execute",
        cfg.cloudflare.d1Name,
        "--remote",
        "--json",
        "--command",
        `UPDATE visitors SET role = ?1 WHERE email = ?2`,
        "--bind",
        dbRole,
        "--bind",
        addr
      ],
      env
    );
  } else {
    await run(
      "clear role",
      "npx",
      [
        "wrangler",
        "d1",
        "execute",
        cfg.cloudflare.d1Name,
        "--remote",
        "--json",
        "--command",
        `UPDATE visitors SET role = '' WHERE email = ?1`,
        "--bind",
        addr
      ],
      env
    );
  }
  console.log(
    "    " + ok + " " + c.cyan(email) + c.dim(" → ") + c.bold(dbRole || "none") + c.dim(`  (${count} account${count > 1 ? "s" : ""} · live immediately, no redeploy)`)
  );
  console.log();
}
async function cmdVersion(next) {
  const pkgPath = path.join(ROOT, "package.json");
  const pkg = JSON.parse(await readFile(pkgPath, "utf8"));
  if (next) {
    const n = String(next).replace(/\D/g, "");
    pkg.version = `${n}.0.0`;
    await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
    console.log(
      "\n  " + ok + " version → " + c.bold("v" + n) + c.dim("  (deploy to ship it — the global sys version updates on deploy)") + "\n"
    );
  } else {
    const local = pkg.version.split(".")[0];
    const global = await sbGetMeta("latest_version");
    console.log(
      "\n  " + dot + " Foyer version " + c.bold("v" + local) + (global ? c.dim("   · global latest ") + (global === local ? c.green("v" + global) : c.yellow("v" + global)) : "") + "\n"
    );
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
      const j = await r.json();
      live = j.sys_version || "?";
      okv = live === local;
    } catch {
      live = c.red("unreachable");
    }
    console.log(
      "    " + (okv ? ok : c.yellow("●")) + " " + c.bold(name.padEnd(10)) + c.dim("live v") + (okv ? c.green(live) : c.yellow(live)) + c.dim("  / local v" + local) + (okv ? "" : c.dim("  (deploy to sync)"))
    );
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
async function sbServiceKey() {
  if (process.env.FOYER_SB_SERVICE_KEY) return process.env.FOYER_SB_SERVICE_KEY;
  const env = await readFile(path.join(ROOT, ".foyer.env"), "utf8").catch(() => "");
  const m = env.match(/FOYER_SB_SERVICE_KEY\s*=\s*(.+)/);
  return m ? m[1].trim() : null;
}
const sbH = (key) => ({
  apikey: key,
  authorization: `Bearer ${key}`,
  "content-type": "application/json"
});
async function toDomain(name) {
  const a = await sites();
  const s = a.find((x) => x.name === name);
  return s ? s.cfg.domain : name;
}
async function sbGetMeta(key) {
  try {
    const r = await fetch(
      `${SB_URL}/rest/v1/foyer_meta?key=eq.${encodeURIComponent(key)}&select=value`,
      { headers: sbH(SB_ANON) }
    );
    if (r.ok) return (await r.json())[0]?.value ?? null;
  } catch {
  }
  return null;
}
async function sbSetMeta(key, value) {
  const sk = await sbServiceKey();
  if (!sk) return false;
  const r = await fetch(`${SB_URL}/rest/v1/foyer_meta?on_conflict=key`, {
    method: "POST",
    headers: { ...sbH(sk), Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ key, value: String(value) })
  });
  return r.ok;
}
async function cmdOffline(name, on, reason) {
  const key = await sbServiceKey();
  if (!key)
    die(
      "needs the service key. Put " + c.cyan("FOYER_SB_SERVICE_KEY=<key>") + " in " + c.cyan(".foyer.env") + " (gitignored)."
    );
  const domain = await toDomain(name);
  header(`${on ? "take offline" : "bring online"} ${c.br(domain)}`);
  const patch = { offline: on };
  if (on && reason) patch.offline_message = reason;
  const r = await fetch(`${SB_URL}/rest/v1/foyer_sites?domain=eq.${encodeURIComponent(domain)}`, {
    method: "PATCH",
    headers: { ...sbH(key), Prefer: "return=representation" },
    body: JSON.stringify(patch)
  });
  if (!r.ok) {
    console.log(c.dim("      " + await r.text()));
    die("update failed (" + r.status + ")");
  }
  if (!(await r.json()).length)
    die(`no registry row for '${domain}'. Add it to foyer_sites first.`);
  console.log(
    "    " + ok + ` ${domain} is now ` + (on ? c.yellow("OFFLINE") : c.green("ONLINE")) + c.dim("  (edge cache clears within ~60s)")
  );
  if (on && reason) console.log("    " + dot + c.dim(' message: "') + reason + c.dim('"'));
  console.log();
}
async function cmdLicense(name, on, reason) {
  const key = await sbServiceKey();
  if (!key) die("needs the service key in " + c.cyan(".foyer.env") + ".");
  const domain = await toDomain(name);
  header(`${on ? "license" : "unlicense"} ${c.br(domain)}`);
  const patch = { licensed: on };
  if (!on && reason) patch.offline_message = reason;
  const r = await fetch(`${SB_URL}/rest/v1/foyer_sites?domain=eq.${encodeURIComponent(domain)}`, {
    method: "PATCH",
    headers: { ...sbH(key), Prefer: "return=representation" },
    body: JSON.stringify(patch)
  });
  if (!r.ok) {
    console.log(c.dim("      " + await r.text()));
    die("update failed (" + r.status + ")");
  }
  if (!(await r.json()).length)
    die(`no registry row for '${domain}'. Add it to foyer_sites first.`);
  console.log(
    "    " + ok + ` ${domain} is now ` + (on ? c.green("LICENSED") : c.red("UNLICENSED")) + c.dim("  (edge cache clears within ~60s)")
  );
  if (!on && reason) console.log("    " + dot + c.dim(' message: "') + reason + c.dim('"'));
  console.log();
}
async function cmdBypass(name, kind, code) {
  const key = await sbServiceKey();
  if (!key) die("needs the service key in " + c.cyan(".foyer.env") + ".");
  if (!name || !kind || !["offline", "unlicensed"].includes(kind))
    die("usage: foyer bypass <site> <offline|unlicensed> <code|clear>");
  const col = kind === "unlicensed" ? "unlicensed_bypass_hash" : "offline_bypass_hash";
  const domain = await toDomain(name);
  const clear = !code || code === "clear" || code === "-";
  header(`${clear ? "clear" : "set"} ${kind} bypass · ${c.br(domain)}`);
  const hash = clear ? "" : createHash("sha256").update(code).digest("hex");
  const r = await fetch(`${SB_URL}/rest/v1/foyer_sites?domain=eq.${encodeURIComponent(domain)}`, {
    method: "PATCH",
    headers: { ...sbH(key), Prefer: "return=representation" },
    body: JSON.stringify({ [col]: hash })
  });
  if (!r.ok) {
    console.log(c.dim("      " + await r.text()));
    die("update failed (" + r.status + ")");
  }
  if (!(await r.json()).length)
    die(`no registry row for '${domain}'. Add it to foyer_sites first.`);
  if (clear) {
    console.log(
      "    " + ok + ` ${kind} bypass ` + c.red("cleared") + c.dim("  (edge cache clears within ~60s)")
    );
  } else {
    console.log("    " + ok + ` ${kind} bypass set` + c.dim("  (edge cache clears within ~60s)"));
    console.log("    " + dot + c.dim(" code:  ") + c.br(code));
    console.log(
      "    " + dot + c.dim(" view:  visit the offline screen → “Operator access”, or ") + c.cyan(`https://${domain}/?__fb=${encodeURIComponent(code)}`)
    );
    console.log("    " + dot + c.dim(" lasts until you reload — nothing is stored client-side."));
  }
  console.log();
}
async function cmdGithub(msg) {
  header("deploy → GitHub");
  await run("strip source comments", "node", ["strip-src.js", ROOT]).catch(
    () => console.log("    " + c.yellow("!") + c.dim(" comment stripping skipped"))
  );
  const v = await version();
  const message = msg && msg.trim() ? msg.trim() : `deploy v${v}`;
  const st = await run("check working tree", "git", ["status", "--porcelain"]);
  if (st.trim()) {
    await passthrough("git", ["add", "-A"]);
    await passthrough("git", ["commit", "-m", message]);
  } else console.log("    " + dot + c.dim(" nothing to commit"));
  console.log("    " + dot + c.dim(" pushing — git may ask for credentials…") + "\n");
  await passthrough("git", ["push"]);
  console.log("\n  " + ok + c.green(c.bold("  pushed to GitHub")) + c.dim(` · ${message}`) + "\n");
}
function timeAgo(ts) {
  if (!ts) return "never";
  const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1e3);
  if (s < 60) return s + "s ago";
  const m = Math.floor(s / 60);
  if (m < 60) return m + "m ago";
  const h = Math.floor(m / 60);
  if (h < 24) return h + "h ago";
  return Math.floor(h / 24) + "d ago";
}
async function cmdRegistry() {
  const gv = await sbGetMeta("latest_version");
  header(`site registry${gv ? c.dim("  · global latest v" + gv) : ""}`);
  console.log();
  const [sr, hr] = await Promise.all([
    fetch(`${SB_URL}/rest/v1/foyer_sites?select=domain,licensed,offline&order=domain`, {
      headers: sbH(SB_ANON)
    }),
    fetch(`${SB_URL}/rest/v1/foyer_heartbeats?select=domain,live_version,last_seen`, {
      headers: sbH(SB_ANON)
    })
  ]);
  if (!sr.ok) die("fetch failed (" + sr.status + ")");
  const hb = {};
  if (hr.ok)
    (await hr.json()).forEach((h) => {
      hb[h.domain] = h;
    });
  for (const s of await sr.json()) {
    const h = hb[s.domain];
    const live = h && Date.now() - new Date(h.last_seen).getTime() < 10 * 60 * 1e3;
    const dot2 = s.offline ? c.yellow("●") : live ? c.green("●") : c.grey("○");
    const ver = h?.live_version ? gv && h.live_version !== gv ? c.yellow("v" + h.live_version + " behind") : c.green("v" + h.live_version) : c.dim("—");
    console.log(
      "    " + dot2 + " " + c.bold(s.domain.padEnd(18)) + (s.licensed ? c.green("licensed") : c.red("unlicensed")) + (s.offline ? c.yellow(" · offline") : "") + "  " + ver + c.dim("  · " + timeAgo(h?.last_seen))
    );
  }
  console.log();
}
async function cmdAnnounce(scope, ...argv) {
  const key = await sbServiceKey();
  if (!key) die("needs the service key in " + c.cyan(".foyer.env") + ".");
  if (!scope)
    die(
      'usage: foyer announce <site|all> "<message>" [--warn] [--hide <sec>] [--ends <iso>]  ·  or: clear | remove | list'
    );
  const target = scope === "all" ? "global" : await toDomain(scope);
  const sub = argv[0];
  if (sub === "list" || sub === "ls") {
    header(`announcements · ${c.br(target)}`);
    const r2 = await fetch(
      `${SB_URL}/rest/v1/foyer_announcements?scope=eq.${encodeURIComponent(target)}&order=created_at.desc&select=message,level,active,hide_after,ends_at`,
      { headers: sbH(key) }
    );
    const rows = r2.ok ? await r2.json() : [];
    if (!rows.length) console.log("    " + c.dim("(none)"));
    for (const a of rows)
      console.log(
        "    " + (a.active ? c.green("●") : c.grey("○")) + " " + (a.level === "warn" ? c.yellow("[warn]") : c.dim("[info]")) + " " + a.message + (a.ends_at ? c.dim("  ends " + a.ends_at) : "")
      );
    console.log();
    return;
  }
  if (sub === "clear" || sub === "off") {
    header(`clear announcements · ${c.br(target)}`);
    const r2 = await fetch(
      `${SB_URL}/rest/v1/foyer_announcements?scope=eq.${encodeURIComponent(target)}`,
      {
        method: "PATCH",
        headers: { ...sbH(key), Prefer: "return=minimal" },
        body: JSON.stringify({ active: false })
      }
    );
    console.log(
      "    " + (r2.ok ? ok : bad) + (r2.ok ? " deactivated active announcements (kept in history)" : " failed") + "\n"
    );
    return;
  }
  if (sub === "remove" || sub === "rm" || sub === "delete") {
    header(`remove announcements · ${c.br(target)}`);
    const r2 = await fetch(
      `${SB_URL}/rest/v1/foyer_announcements?scope=eq.${encodeURIComponent(target)}`,
      { method: "DELETE", headers: { ...sbH(key), Prefer: "return=minimal" } }
    );
    console.log(
      "    " + (r2.ok ? ok : bad) + (r2.ok ? " permanently removed all announcements for " + (target === "global" ? "all sites" : target) : " failed") + "\n"
    );
    return;
  }
  const flags = {};
  const words = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--warn") flags.level = "warn";
    else if (a === "--hide") flags.hide_after = parseInt(argv[++i]) || 0;
    else if (a === "--ends") flags.ends_at = argv[++i];
    else words.push(a);
  }
  const message = words.join(" ").trim();
  if (!message) die('a message is required: foyer announce <site|all> "<message>"');
  header(`announce · ${c.br(target)}`);
  const rec = {
    scope: target,
    message,
    level: flags.level || "info",
    active: true,
    hide_after: flags.hide_after || 0,
    ...flags.ends_at ? { ends_at: flags.ends_at } : {}
  };
  const r = await fetch(`${SB_URL}/rest/v1/foyer_announcements`, {
    method: "POST",
    headers: { ...sbH(key), Prefer: "return=minimal" },
    body: JSON.stringify(rec)
  });
  if (!r.ok) {
    console.log(c.dim("      " + await r.text()));
    die("insert failed (" + r.status + ")");
  }
  console.log(
    "    " + ok + " banner live on " + c.bold(target === "global" ? "all sites" : target) + (flags.level === "warn" ? c.yellow("  [warn]") : "") + (flags.hide_after ? c.dim(`  · auto-hides after ${flags.hide_after}s`) : "") + c.dim("  (clients pick it up within ~a load)")
  );
  console.log();
}
async function cmdFlag(scope, fkey, value) {
  const key = await sbServiceKey();
  if (!key) die("needs the service key in " + c.cyan(".foyer.env") + ".");
  if (!scope || !fkey) die("usage: foyer flag <site|all> <key> <on|off|value>");
  const target = scope === "all" ? "global" : await toDomain(scope);
  const val = value == null ? "on" : value === "on" || value === "off" ? value : value;
  header(`flag · ${c.br(target)}`);
  const r = await fetch(`${SB_URL}/rest/v1/foyer_flags?on_conflict=scope,key`, {
    method: "POST",
    headers: { ...sbH(key), Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ scope: target, key: fkey, value: String(val) })
  });
  if (!r.ok) {
    console.log(c.dim("      " + await r.text()));
    die("update failed (" + r.status + ")");
  }
  console.log(
    "    " + ok + " " + c.bold(fkey) + c.dim(" = ") + c.cyan(String(val)) + c.dim(" on " + (target === "global" ? "all sites" : target)) + "\n"
  );
}
async function cmdFlags(scope) {
  const target = !scope || scope === "all" ? "global" : await toDomain(scope);
  header(`flags · ${c.br(target)}`);
  const r = await fetch(
    `${SB_URL}/rest/v1/foyer_flags?scope=eq.${encodeURIComponent(target)}&order=key&select=key,value`,
    { headers: sbH(SB_ANON) }
  );
  const rows = r.ok ? await r.json() : [];
  if (!rows.length) console.log("    " + c.dim("(none)"));
  for (const f of rows)
    console.log("    " + dot + " " + c.bold(f.key.padEnd(20)) + c.cyan(f.value));
  console.log();
}
async function cmdErrors(scope, limit) {
  const key = await sbServiceKey();
  if (!key) die("needs the service key in " + c.cyan(".foyer.env") + ".");
  const n = parseInt(limit) || 20;
  let q = `order=created_at.desc&limit=${n}&select=domain,message,url,created_at`;
  if (scope && scope !== "all") q = `domain=eq.${encodeURIComponent(await toDomain(scope))}&` + q;
  header(`error reports${scope && scope !== "all" ? " · " + c.br(scope) : ""}`);
  console.log();
  const r = await fetch(`${SB_URL}/rest/v1/foyer_errors?${q}`, { headers: sbH(key) });
  if (!r.ok) {
    console.log(c.dim("      " + await r.text()));
    die("fetch failed (" + r.status + ")");
  }
  const rows = await r.json();
  if (!rows.length) {
    console.log("    " + c.dim("no errors reported 🎉") + "\n");
    return;
  }
  for (const e of rows)
    console.log(
      "    " + c.red("•") + " " + c.dim(timeAgo(e.created_at).padStart(7)) + "  " + c.grey((e.domain || "").padEnd(14)) + e.message + c.dim("  " + (e.url || ""))
    );
  console.log();
}
const CHANGELOG_TAGS = ["feature", "fix", "release", "improvement"];
async function cmdChangelog(...argv) {
  const key = await sbServiceKey();
  if (!key) die("needs the service key in " + c.cyan(".foyer.env") + ".");
  const flags = {};
  const pos = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--body" || a === "-b") flags.body = argv[++i];
    else if (a === "--tag" || a === "-t") flags.tag = argv[++i];
    else if (a === "--title") flags.title = argv[++i];
    else if (a === "--date") flags.date = argv[++i];
    else if (a === "--draft" || a === "--unpublished") flags.draft = true;
    else pos.push(a);
  }
  const version2 = pos.shift();
  let tag = flags.tag;
  if (!tag && CHANGELOG_TAGS.includes(pos[0])) tag = pos.shift();
  tag = tag || "feature";
  const title = flags.title || pos.join(" ");
  if (!version2 || !title)
    die(
      'usage: foyer changelog <version> [tag] <title…> [--body "…"] [--draft]\n        tags: ' + CHANGELOG_TAGS.join(", ")
    );
  const rec = { version: String(version2), tag, title, body: flags.body || "" };
  if (flags.draft) rec.published = false;
  if (flags.date) rec.released_at = flags.date;
  header("add changelog entry");
  const r = await fetch(`${SB_URL}/rest/v1/foyer_changelog`, {
    method: "POST",
    headers: { ...sbH(key), Prefer: "return=minimal" },
    body: JSON.stringify(rec)
  });
  if (!r.ok) {
    console.log(c.dim("      " + await r.text()));
    die("insert failed (" + r.status + ")");
  }
  const tagColor = tag === "fix" ? c.yellow : tag === "release" ? c.green : c.cyan;
  console.log(
    "    " + ok + ` v${version2}  ` + tagColor("[" + tag + "]") + "  " + c.bold(title) + (rec.published === false ? c.dim("  (draft)") : "")
  );
  if (rec.body)
    console.log(
      "    " + dot + c.dim(" " + rec.body.replace(/\n/g, " ").slice(0, 70) + (rec.body.length > 70 ? "…" : ""))
    );
  console.log();
}
function help() {
  banner();
  const row = (cmd2, desc) => "    " + c.cyan(cmd2) + " ".repeat(Math.max(2, 30 - cmd2.length)) + c.dim(desc);
  console.log(c.bold("  USAGE") + c.dim("  foyer <command> [args]\n"));
  console.log(c.bold("  COMMANDS"));
  [
    ["sites", "list configured sites"],
    ["build <site|all>", "build to dist/"],
    ["deploy <site|all>", "build → bump reload → publish"],
    ["deploy github [msg]", "commit + push to GitHub"],
    ["stage <site|all>", "deploy to preview branch (staging)"],
    ["dev <site>", "build + local server"],
    ["status <site|all>", "compare live vs local version"],
    ["new [site]", "interactive onboarding → db, project, secrets, deploy"],
    ["delete <site>", "delete a site everywhere (local, CF project, D1, registry)"],
    ["icons <site> [svg]", "generate the full favicon set from an SVG"],
    ["statusdomain <site|all>", "attach status.<domain> to the site's Pages project"],
    ["secret <site> <NAME>", "set a Cloudflare secret"],
    ['db <site> "<SQL>"', "run a D1 query (remote)"],
    ["setrole <site> <email> <role>", "set a visitor's role (admin|owner|none)"],
    ["auth", "deploy the Foyer platform + Auth provider (foyer.zo0p.dev)"],
    ["registry", "list sites: live status, version, last-seen"],
    ["announce <site|all> <msg>", "push a banner (--warn,--hide,--ends); clear|remove|list"],
    ["flag <site|all> <key> <val>", "set a feature flag (on|off|value)"],
    ["flags <site|all>", "list feature flags"],
    ["errors <site|all> [n]", "show recent client error reports"],
    ["offline <site> [reason]", "take a site offline (+ message)"],
    ["online <site>", "bring a site back online"],
    ["license <site>", "license a site to run Foyer"],
    ["unlicense <site> [reason]", "revoke a site's licence (+ message)"],
    [
      "bypass <site> <kind> <code>",
      "set view-bypass code (kind: offline|unlicensed; 'clear' to remove)"
    ],
    ["changelog <NN> [tag] <title>", "add a /foyer changelog entry (--body, --draft)"],
    ["version [NN]", "show or set the version"],
    ["help", "show this"]
  ].forEach(([a, b]) => console.log(row(a, b)));
  console.log(
    "\n  " + c.dim("examples:") + c.cyan("  foyer deploy all") + c.dim("   ·  ") + c.cyan("foyer status all") + "\n"
  );
}
const [cmd, ...args] = process.argv.slice(2);
const table = {
  sites: () => cmdSites(),
  list: () => cmdSites(),
  build: () => cmdBuild(args[0]),
  deploy: () => args[0] === "github" || args[0] === "gitea" ? cmdGithub(args.slice(1).join(" ")) : cmdDeploy(args[0]),
  stage: () => cmdStage(args[0]),
  dev: () => cmdDev(args[0]),
  status: () => cmdStatus(args[0]),
  new: () => cmdNew(args[0]),
  delete: () => cmdDelete(args[0]),
  remove: () => cmdDelete(args[0]),
  icons: () => cmdIcons(args[0], args[1]),
  statusdomain: () => cmdStatusDomain(args[0]),
  secret: () => cmdSecret(args[0], args[1]),
  db: () => cmdDb(...args),
  setrole: () => cmdSetRole(args[0], args[1], args[2]),
  auth: () => cmdAuthDeploy(),
  offline: () => cmdOffline(args[0], true, args.slice(1).join(" ")),
  online: () => cmdOffline(args[0], false),
  license: () => cmdLicense(args[0], true),
  unlicense: () => cmdLicense(args[0], false, args.slice(1).join(" ")),
  bypass: () => cmdBypass(args[0], args[1], args.slice(2).join(" ")),
  github: () => cmdGithub(args.join(" ")),
  gitea: () => cmdGithub(args.join(" ")),
  registry: () => cmdRegistry(),
  announce: () => cmdAnnounce(args[0], ...args.slice(1)),
  flag: () => cmdFlag(args[0], args[1], args[2]),
  flags: () => cmdFlags(args[0]),
  errors: () => cmdErrors(args[0], args[1]),
  changelog: () => cmdChangelog(...args),
  version: () => cmdVersion(args[0]),
  help: () => help(),
  "--help": () => help(),
  "-h": () => help()
};
Promise.resolve((table[cmd] || (() => help()))()).catch((e) => die(e.message));
