import { sb } from "./api/_lib/supabase.js";
import { renderStatusPage } from "./status.js";
async function siteState(env, host) {
  try {
    const { base, headers } = sb(env);
    const r = await fetch(
      `${base}/rest/v1/foyer_sites?domain=eq.${encodeURIComponent(host)}&select=offline,licensed,offline_message,offline_bypass_hash,unlicensed_bypass_hash,hide_branding`,
      { headers, cf: { cacheTtl: 60, cacheEverything: true } }
    );
    if (!r.ok) return { block: null, hideBranding: false };
    const row = (await r.json())[0];
    if (!row) return { block: null, hideBranding: false };
    const hideBranding = row.hide_branding === true;
    if (row.licensed === false)
      return {
        block: {
          kind: "unlicensed",
          eyebrow: "Unavailable",
          title: "This site isn’t licensed",
          message: row.offline_message || "This site is not licensed to run Foyer.",
          bypassHash: row.unlicensed_bypass_hash || ""
        },
        hideBranding
      };
    if (row.offline === true)
      return {
        block: {
          kind: "offline",
          eyebrow: "Temporarily offline",
          title: "This site is taking a short break",
          message: row.offline_message || "",
          bypassHash: row.offline_bypass_hash || ""
        },
        hideBranding
      };
    return { block: null, hideBranding };
  } catch {
    return { block: null, hideBranding: false };
  }
}
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escA = (s) => esc(s).replace(/"/g, "&quot;");
const OG_BOT = /(facebookexternalhit|Facebot|Twitterbot|Slackbot|Discordbot|LinkedInBot|WhatsApp|TelegramBot|Pinterest|redditbot|Applebot|SkypeUriPreview|vkShare|embedly|Iframely|Google-InspectionTool)/i;
async function lookupOg(env, url) {
  const path = url.pathname === "" ? "/" : url.pathname;
  let m, out = null;
  if (m = path.match(/^\/tutorials\/(.+)$/)) {
    const r = await env.DB.prepare(
      "SELECT title, description, cover_image FROM tutorials WHERE slug=?"
    ).bind(m[1]).first();
    if (r)
      out = {
        title: r.title || "",
        desc: r.description || "",
        image: r.cover_image || "",
        ld: { "@type": "Article", headline: r.title || "", description: r.description || "" }
      };
  } else if (m = path.match(/^\/review\/(.+)$/)) {
    const r = await env.DB.prepare(
      "SELECT title, description, cover_image, rating FROM reviews WHERE slug=?"
    ).bind(m[1]).first();
    if (r) {
      out = {
        title: r.title || "",
        desc: r.description || "",
        image: r.cover_image || "",
        ld: {
          "@type": "Review",
          name: r.title || "",
          reviewBody: r.description || "",
          itemReviewed: { "@type": "Thing", name: r.title || "" }
        }
      };
      if (r.rating)
        out.ld.reviewRating = { "@type": "Rating", ratingValue: r.rating, bestRating: 5 };
    }
  } else if ((m = path.match(/^\/([^\/]+)\/([^\/]+)$/)) && m[2] !== "all") {
    const coll = await env.DB.prepare("SELECT id FROM collections WHERE slug=?").bind(m[1]).first();
    if (coll) {
      const it = await env.DB.prepare(
        "SELECT title, description, cover_image FROM collection_items WHERE collection_id=? AND slug=?"
      ).bind(coll.id, m[2]).first();
      if (it)
        out = {
          title: it.title || "",
          desc: it.description || "",
          image: it.cover_image || "",
          ld: { "@type": "Article", headline: it.title || "", description: it.description || "" }
        };
    }
  } else {
    const row = await env.DB.prepare(
      "SELECT title, page_json FROM pages WHERE slug = ? AND is_published = 1"
    ).bind(path).first();
    if (row) {
      let p = {};
      try {
        p = JSON.parse(row.page_json || "{}");
      } catch {
      }
      out = {
        title: p.page_title || row.title || "",
        desc: p.page_subtitle || "",
        image: p.page_image || "",
        ld: null
      };
    }
  }
  if (out && out.image && !/^https?:\/\//.test(out.image))
    out.image = `https://${url.hostname}${out.image.startsWith("/") ? "" : "/"}${out.image}`;
  return out;
}
async function injectOg(ctx, url) {
  const { request, env } = ctx;
  if (!env.DB) return null;
  try {
    const data = await lookupOg(env, url);
    if (!data || !data.title && !data.desc && !data.image) return null;
    const { title, desc, image, ld } = data;
    const res = await env.ASSETS.fetch(
      new Request(new URL("/index.html", url), { headers: request.headers })
    );
    let html = await res.text();
    const pageUrl = `https://${url.hostname}${url.pathname === "" ? "/" : url.pathname}`;
    const setM = (id, val) => {
      if (!val) return;
      html = html.replace(
        new RegExp(`<meta\\b[^>]*\\bid="${id}"[^>]*>`),
        (tag) => tag.replace(/content="[^"]*"/, `content="${escA(val)}"`)
      );
    };
    if (title) {
      html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
      setM("og-title", title);
      setM("tw-title", title);
    }
    if (desc) {
      setM("og-desc", desc);
      setM("tw-desc", desc);
    }
    if (image) {
      setM("og-image", image);
      setM("tw-image", image);
      setM("tw-card", "summary_large_image");
    }
    html = html.replace(
      /<meta\b[^>]*\bid="og-url"[^>]*>/,
      (t) => t.replace(/content="[^"]*"/, `content="${escA(pageUrl)}"`)
    ).replace(
      /<link\b[^>]*\bid="canonical"[^>]*>/,
      (t) => t.replace(/href="[^"]*"/, `href="${escA(pageUrl)}"`)
    );
    if (ld) {
      const json = JSON.stringify({
        "@context": "https://schema.org",
        ...ld,
        url: pageUrl,
        ...image ? { image } : {}
      });
      html = html.replace(
        /<script\b[^>]*\bid="ld-json"[^>]*>[\s\S]*?<\/script>/,
        `<script type="application/ld+json" id="ld-json">${json}<\/script>`
      );
    }
    return new Response(html, {
      status: 200,
      headers: {
        "content-type": "text/html;charset=utf-8",
        "cache-control": "public, max-age=300"
      }
    });
  } catch {
    return null;
  }
}
async function sha256Hex(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
export async function onRequest(ctx) {
  const { request, next, env } = ctx;
  try {
    const url = new URL(request.url);
    if (url.hostname.startsWith("status.")) return renderStatusPage(ctx);
    if (url.pathname === "/beta" || url.pathname.startsWith("/beta/")) {
      const rest = url.pathname.slice(5) || "/";
      const dest = new URL(rest + url.search, url.origin);
      dest.searchParams.set("beta", "1");
      return Response.redirect(dest.toString(), 302);
    }
    const p = url.pathname;
    const hasExt = /\.[a-z0-9]+$/i.test(p);
    const accept = request.headers.get("accept") || "";
    if (request.method !== "GET" || hasExt || p.startsWith("/api") || p.startsWith("/foyer") || p === "/status" || !accept.includes("text/html")) {
      return next();
    }
    const { block: state, hideBranding } = await siteState(env, url.hostname);
    if (state) {
      const fb = url.searchParams.get("__fb");
      if (fb && state.bypassHash && await sha256Hex(fb) === state.bypassHash) {
        return next();
      }
      const res = await env.ASSETS.fetch(
        new Request(new URL("/offline", url), { headers: request.headers })
      );
      let html = await res.text();
      const swap = (id, val) => {
        if (val)
          html = html.replace(
            new RegExp(`(<[^>]*id="${id}"[^>]*>)[\\s\\S]*?(</)`),
            `$1${esc(val)}$2`
          );
      };
      swap("foyer-offline-eyebrow", state.eyebrow);
      swap("foyer-offline-title", state.title);
      swap("foyer-offline-msg", state.message);
      return new Response(html, {
        status: 200,
        headers: { "content-type": "text/html;charset=utf-8", "cache-control": "no-store" }
      });
    }
    if (!p.startsWith("/admin") && OG_BOT.test(request.headers.get("user-agent") || "")) {
      const og = await injectOg(ctx, url);
      if (og) return og;
    }
    if (hideBranding && !p.startsWith("/admin")) {
      try {
        const res = await env.ASSETS.fetch(
          new Request(new URL("/index.html", url), { headers: request.headers })
        );
        let html = await res.text();
        html = html.replace(
          "</head>",
          "<style>.made-by,.foyer-credit{display:none!important}</style><script>window.__FOYER_NOBRAND=1<\/script></head>"
        ).replace(/<meta name="generator"[^>]*>/, "");
        return new Response(html, {
          status: res.status,
          headers: {
            "content-type": "text/html;charset=utf-8",
            "cache-control": "public, max-age=120"
          }
        });
      } catch {
      }
    }
  } catch {
  }
  return next();
}
