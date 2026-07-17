import type { Ctx, Env } from "./types.ts";

interface CatalogPack {
  name: string;
  label: string;
  description?: string;
  icon?: string;
  blocks: Array<{ type: string; label: string; icon?: string }>;
}

const CREATE_INSTALLED_PACKS =
  "CREATE TABLE IF NOT EXISTS installed_packs (pack_name TEXT PRIMARY KEY, installed_at TEXT NOT NULL DEFAULT (datetime('now')))";
let _ready = false;
async function ensureInstalledPacks(env: Env): Promise<void> {
  if (_ready) return;
  await env.DB.prepare(CREATE_INSTALLED_PACKS)
    .run()
    .catch(() => {});
  _ready = true;
}

// The pack catalog is a static file generated at build time from packs/ — no
// database involved. Read it the same way _middleware.js reads index.html.
async function fetchCatalog(env: Env, request: Request): Promise<CatalogPack[]> {
  try {
    const url = new URL(request.url);
    const res = await env.ASSETS.fetch(new Request(new URL("/pack/catalog.json", url)));
    if (!res.ok) return [];
    return (await res.json()) as CatalogPack[];
  } catch {
    return [];
  }
}

export async function handlePacks(ctx: Ctx): Promise<Response | null> {
  const { route, method, request, env, respond, authed } = ctx;
  if (route !== "packs" && route !== "packs/install" && route !== "packs/uninstall") return null;

  if (route === "packs" && method === "GET") {
    await ensureInstalledPacks(env);
    const catalog = await fetchCatalog(env, request);
    const { results } = await env.DB.prepare("SELECT pack_name FROM installed_packs")
      .all<{ pack_name: string }>()
      .catch(() => ({ results: [] as { pack_name: string }[] }));
    const installed = new Set((results || []).map((r) => r.pack_name));
    return respond(catalog.map((p) => ({ ...p, installed: installed.has(p.name) })));
  }

  if (route === "packs/install" && method === "POST") {
    if (!authed()) return respond({ error: "unauthorized" }, 401);
    const b = (await request.json().catch(() => ({}))) as { name?: string };
    const name = String(b.name || "").trim();
    if (!name) return respond({ error: "pack name required" }, 400);
    const catalog = await fetchCatalog(env, request);
    if (!catalog.some((p) => p.name === name)) return respond({ error: "unknown pack" }, 404);
    await ensureInstalledPacks(env);
    await env.DB.prepare(
      "INSERT INTO installed_packs (pack_name) VALUES (?) ON CONFLICT(pack_name) DO NOTHING"
    )
      .bind(name)
      .run();
    return respond({ ok: true });
  }

  if (route === "packs/uninstall" && method === "POST") {
    if (!authed()) return respond({ error: "unauthorized" }, 401);
    const b = (await request.json().catch(() => ({}))) as { name?: string };
    const name = String(b.name || "").trim();
    if (!name) return respond({ error: "pack name required" }, 400);
    await ensureInstalledPacks(env);
    await env.DB.prepare("DELETE FROM installed_packs WHERE pack_name = ?").bind(name).run();
    return respond({ ok: true });
  }

  return null;
}
