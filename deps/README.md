# Vendored dependencies

Self-hosted copies of the third-party libraries Foyer uses, served from `/deps/` on
every site (instead of a public CDN) for resilience + privacy. Files are renamed to clean
library names; the exact version + license stays in each file's header comment (the build
excludes `deps/` from comment-stripping so attribution is preserved).

`build.js` copies this folder to `dist/deps/` and `_headers` caches `/deps/*` as immutable.
**When updating a library, re-download into the same filename and bump the cache** (the
URLs have no version, so a stale CDN/browser cache won't auto-bust — change is picked up on
the next deploy via Pages, but hard-refresh to verify).

| File | Library | Version | Source |
|------|---------|---------|--------|
| marked.js | marked | 13.0.3 | npm `marked@13` |
| fancybox.js / .css | @fancyapps/ui (Fancybox) | 5.0 | npm `@fancyapps/ui@5.0` |
| lenis.js / .css | Lenis | 1.1.14 | npm `lenis@1.1.14` |
| aos.js / .css | AOS | 2.3.4 | npm `aos@2.3.4` |
| granim.js | Granim.js | 2.0.0 | npm `granim@2.0.0` |
| highlight.js / .css | highlight.js (+ github-dark theme) | 11.11.1 | gh `highlightjs/cdn-release@11.11.1` |
| flatpickr.js / .css / -dark.css | flatpickr (+ dark theme) | 4.6.13 | npm `flatpickr@4.6.13` |
| coloris.js / .css | Coloris | 0.24.0 | gh `mdbassit/Coloris@v0.24.0` |

## Local patches (re-apply after any re-download!)

- **emoji-mart.js** — search for `/*FOYER-PATCH*/`. In the Emoji render path, if a
  skin's `src` points at `/assets/icons/`, we render the icon as a themeable
  `currentColor` CSS-mask `<span>` instead of an `<img>` (our SVGs are viewBox-only,
  so they don't size as imgs, and the mask lets them inherit the picker's color).
  This is what makes the "Foyer Icons" custom category actually display. Our custom
  emojis also use `foyericon_`-prefixed ids (see `bldOpenIconPicker`) so they don't
  collide with native emoji ids like `star`/`heart`/`fire`. **Do not** pass the
  Picker a `categories` prop — it filters against a snapshot taken before custom
  categories merge, which silently drops the Foyer Icons tab.
