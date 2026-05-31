# Foyer

A config-driven personal-site framework on **Cloudflare Pages + D1**.
One shared codebase, one small config per site. Made by [zo0p.dev](https://zo0p.dev).

Features: a gated entry (sign-in wall), magic-link + Google/GitHub/Discord auth,
sessions & account panel, a block-based page builder, tutorials/reviews, and an
admin CMS — all backed by D1.

## Layout

```
src/main/        shared main-site script, split into ordered chunks (built into one app.js)
admin/           shared admin CMS (html + js + css)
functions/       Cloudflare Pages Functions (the API) — bundled by Cloudflare
index.html       templated  ({{TOKENS}})
manifest.json    templated
style.css        shared
sites/
  <site>/
    config.json  per-site values (name, domain, theme, verifi id, Cloudflare target)
    icons/       per-site favicon/PWA icon set
build.js         node build.js <site>   → dist/
deploy.js        node deploy.js <site>  → build, bump D1 sys version, publish
config.sample.json   documented template for a new site's config
```

## Use

```bash
npm install                 # one-time (esbuild only)
node build.js lanson        # build a site to ./dist
npx wrangler pages dev dist # run it locally (uses the generated wrangler.toml)
node deploy.js lanson       # build + bump reload signal + deploy to Cloudflare
```

## Add a new site

1. `cp config.sample.json sites/<name>/config.json` and fill it in.
2. Drop the site's icons in `sites/<name>/icons/`.
3. Create its Cloudflare resources: a Pages project, a D1 database (run `schema.sql`),
   and set its **secrets/env** in the dashboard — OAuth client IDs/secrets,
   `RESEND_API_KEY`, `SITE_URL`, `RESEND_FROM`, `ADMIN_PASSWORD`. Secrets never live in config.
4. `node deploy.js <name>`.

## Versioning

Bump `"version"` in `package.json` (e.g. `51.0.0` → `52.0.0`). The major number
flows to: the bundle's `VERSION`, the admin `VERSION`, every `?v=` cache-buster,
and the D1 `versions.sys` value (which makes live clients auto-reload). One number.

## What's NOT in config (by design)

- **Secrets** — Cloudflare encrypted secrets per project.
- **Content + live theme colors** — stored in each site's D1 (`site_settings`),
  editable from the admin panel.
- **The "made by zo0p.dev" mark** — intentionally constant.
