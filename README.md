# Foyer

A config-driven framework for gated personal sites. One shared codebase, one small
config per site, deployed on **Cloudflare Pages + D1**. A separate Supabase project
holds the cross-site control-plane and Foyer Auth. Made by [zo0p.dev](https://zo0p.dev).

Today it runs **lanson.org** and **burzer.org**, with the platform itself (and the
Foyer Auth provider) living at **foyer.zo0p.dev**.

## What you get

- A sign-in gate on every site: Google, GitHub, Discord, magic link, or Foyer Auth.
  A site can be open, invite-only, or fully locked down.
- A block-based page builder in the admin panel — hero, gallery, pricing, features,
  testimonials, team, banner, video, map, and more, stacked into pages.
- Sessions + an account panel, plus per-site theming (colors, icons, nav, backgrounds).
- A control-plane shared across every site: live status, announcements, feature
  flags, a global changelog, and an operator dashboard (foyer.zo0p.dev/dashboard).

## Layout

```
src/main/        shared main-site script, split into ordered chunks → one app.js
admin/           shared admin CMS (html + js + css)
functions/       Cloudflare Pages Functions = the site API (D1-backed)
auth/            the Foyer Auth provider + foyer.zo0p.dev site (its own Pages project)
foyer/           the public /foyer "made with Foyer" page, served on every site
index.html       templated ({{TOKENS}})
style.css        shared, templated
sites/<name>/
  config.json    per-site values (name, domain, theme, captcha, Cloudflare target)
  icons/         per-site favicon / PWA icon set
supabase/        control-plane + auth schema (Postgres)
schema.sql       per-site D1 schema (run once when creating a site)
build.js         node build.js <site>  → dist/
cli.js           the `foyer` command (deploy, changelog, version, auth, …)
```

## Day-to-day (the `foyer` CLI)

```bash
npm install                 # one-time (esbuild only)
node build.js lanson        # build one site to ./dist
npx wrangler pages dev dist # run it locally

foyer deploy all            # build + publish every site, sync the global version
foyer deploy <site>         # just one
foyer auth                  # deploy the Foyer platform + Auth provider
foyer changelog <NN> <tag> "<title>" --body "…"   # add a /foyer changelog entry
foyer version [NN]          # show or set the version
```

Always add a changelog entry before a deploy — the `/foyer` changelog is meant to
match what actually ships.

## Add a new site

1. Copy `config.sample.json` to `sites/<name>/config.json` and fill it in.
2. Drop the site's icons in `sites/<name>/icons/`.
3. Create its Cloudflare resources: a Pages project and a D1 database (run
   `schema.sql`), then set its secrets in the dashboard — OAuth client IDs/secrets,
   `RESEND_API_KEY`, `SITE_URL`, `RESEND_FROM`, `ADMIN_PASSWORD`. Secrets never live
   in config.
4. `foyer deploy <name>`.

## Versioning

Bump `"version"` in `package.json` (the major number is what matters, e.g. `89` →
`90`). It flows into the bundle's `VERSION`, the admin, and every `?v=` cache-buster.
The **global "sys" version** lives in Supabase (`foyer_meta.latest_version`) and is
what tells live clients to reload; `foyer deploy` advances it only after a build is
actually published, so clients never get a false "update available".

## Notes for working on the code

- **Two renderers, kept in sync by hand.** Blocks render in `admin/js/builder.js`
  (`bRender`, the live builder preview) and again in `src/main/20-render.js`
  (`pgRenderSec`, the published site). The shared marketing blocks live in a single
  `bXtra()` body that must be byte-identical in both files. `build.js` fails the
  build if they drift, so you'll know immediately.
- **Builds ship clean.** `build.js` strips comments from the output HTML/CSS and the
  server functions before deploy, keeping only the Foyer maker's-mark in `index.html`.

## What's not in config (by design)

- **Secrets** — Cloudflare encrypted secrets per project.
- **Content + live theme colors** — stored in each site's D1 (`site_settings`),
  editable from the admin panel.
- **The "made by zo0p.dev" mark** — intentionally constant.
