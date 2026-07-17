function bE(s) {
  return foyerIconText(
    String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  );
}
marked.use({ breaks: true, gfm: true });
const md = (s) => foyerIconText(marked.parse(String(s || "")));
function bA(s) {
  return String(s || "").replace(/"/g, "&quot;");
}
function bRgb(hex, a) {
  const h = (hex || "#000000").replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) || 0, g = parseInt(h.slice(2, 4), 16) || 0, b = parseInt(h.slice(4, 6), 16) || 0;
  return `rgba(${r},${g},${b},${a})`;
}
const BLOCK_CATALOG = [
  { t: "hero", l: "Hero", c: "Headers", i: "panel-top", k: "title name intro" },
  { t: "banner", l: "Banner", c: "Headers", i: "target", k: "cta call to action splash cover" },
  { t: "sectionhead", l: "Section header", c: "Headers", i: "align-center", k: "eyebrow subtitle" },
  { t: "heading", l: "Heading", c: "Text", i: "type", k: "title" },
  { t: "text", l: "Text", c: "Text", i: "align-left", k: "paragraph body markdown" },
  { t: "lead", l: "Lead", c: "Text", i: "pilcrow", k: "intro large paragraph" },
  { t: "bio", l: "Bio", c: "Text", i: "@user", k: "about" },
  { t: "quote", l: "Quote", c: "Text", i: "quote", k: "blockquote" },
  { t: "callout", l: "Callout", c: "Text", i: "info", k: "notice tip warning alert info" },
  { t: "code", l: "Code", c: "Text", i: "@code", k: "snippet pre monospace" },
  { t: "cards", l: "Cards", c: "Cards & grids", i: "grid", k: "grid" },
  { t: "features", l: "Features", c: "Cards & grids", i: "@sparkles", k: "benefits icons grid" },
  { t: "steps", l: "Steps", c: "Cards & grids", i: "list-ordered", k: "process how it works" },
  { t: "collection", l: "Collection", c: "Cards & grids", i: "@folder", k: "items shop grid" },
  { t: "specs", l: "Specs", c: "Cards & grids", i: "list", k: "key value details list" },
  {
    t: "colllist",
    l: "Collection list",
    c: "Cards & grids",
    i: "@layers",
    k: "collection blog articles entries list embed posts"
  },
  { t: "timeline", l: "Timeline", c: "Cards & grids", i: "timeline", k: "history events dated" },
  { t: "tabs", l: "Tabs", c: "Cards & grids", i: "layout", k: "tabbed panels" },
  { t: "links", l: "Links", c: "Lists & links", i: "link", k: "list" },
  { t: "link", l: "Button", c: "Lists & links", i: "mouse-pointer", k: "link cta" },
  {
    t: "buttongroup",
    l: "Button group",
    c: "Lists & links",
    i: "mouse-pointer",
    k: "cta row buttons"
  },
  {
    t: "toc",
    l: "Table of contents",
    c: "Lists & links",
    i: "compass",
    k: "jump menu anchors nav"
  },
  { t: "image", l: "Image", c: "Media", i: "@image", k: "photo" },
  { t: "gallery", l: "Gallery", c: "Media", i: "images", k: "photos grid" },
  { t: "masonry", l: "Masonry", c: "Media", i: "masonry", k: "pinterest gallery" },
  { t: "carousel", l: "Carousel", c: "Media", i: "film", k: "slider slideshow" },
  { t: "imgtext", l: "Image + Text", c: "Media", i: "columns", k: "split media" },
  { t: "compare", l: "Before / After", c: "Media", i: "contrast", k: "slider compare image" },
  { t: "video", l: "Video", c: "Media", i: "play", k: "youtube vimeo" },
  { t: "fileprev", l: "File Preview", c: "Media", i: "@file", k: "pdf embed" },
  { t: "filedown", l: "File Download", c: "Media", i: "download", k: "pdf download" },
  { t: "cta", l: "CTA", c: "Conversion", i: "megaphone", k: "call to action button" },
  { t: "pricing", l: "Pricing", c: "Conversion", i: "@dollar", k: "plans tiers" },
  {
    t: "testimonials",
    l: "Testimonials",
    c: "Conversion",
    i: "@chat",
    k: "quotes reviews social proof"
  },
  { t: "testimonial", l: "Featured quote", c: "Conversion", i: "quote", k: "big testimonial" },
  { t: "rating", l: "Rating", c: "Conversion", i: "@star", k: "stars score reviews" },
  { t: "logos", l: "Logo Strip", c: "Conversion", i: "@tag", k: "brands trusted by partners" },
  { t: "countdown", l: "Countdown", c: "Conversion", i: "@clock", k: "timer launch event" },
  { t: "badges", l: "Trust badges", c: "Conversion", i: "@shield", k: "guarantee secure" },
  { t: "stats", l: "Stats", c: "Conversion", i: "@bar-chart", k: "numbers metrics counter" },
  { t: "contact", l: "Contact", c: "People & contact", i: "@mail", k: "email phone" },
  { t: "social", l: "Social", c: "People & contact", i: "@globe", k: "links icons" },
  { t: "team", l: "Team", c: "People & contact", i: "users", k: "members staff people" },
  { t: "vcard", l: "Contact card", c: "People & contact", i: "@card", k: "vcard profile" },
  {
    t: "availability",
    l: "Availability",
    c: "People & contact",
    i: "@check-circle",
    k: "open to work status"
  },
  { t: "skills", l: "Skills", c: "Portfolio", i: "puzzle", k: "tech stack tags badges" },
  { t: "progress", l: "Progress bars", c: "Portfolio", i: "signal", k: "skill meters levels" },
  {
    t: "resume",
    l: "Resume timeline",
    c: "Portfolio",
    i: "file-text",
    k: "experience education cv"
  },
  { t: "qrcode", l: "QR code", c: "Portfolio", i: "qr", k: "qr link" },
  {
    t: "faq",
    l: "FAQ",
    c: "Interactive",
    i: "help",
    k: "faq questions answers accordion frequently asked"
  },
  { t: "accordion", l: "Accordion", c: "Interactive", i: "chevron-down", k: "faq collapse" },
  { t: "toggle", l: "Toggle", c: "Interactive", i: "eye", k: "show hide spoiler" },
  { t: "copyfield", l: "Copy field", c: "Interactive", i: "@copy", k: "clipboard copy" },
  { t: "marquee", l: "Marquee", c: "Interactive", i: "film", k: "scrolling ticker" },
  { t: "embed", l: "Embed", c: "Embeds", i: "frame", k: "iframe codepen figma loom" },
  { t: "audio", l: "Audio", c: "Embeds", i: "@music", k: "spotify soundcloud podcast" },
  { t: "socialpost", l: "Social post", c: "Embeds", i: "at-sign", k: "twitter x instagram tiktok" },
  { t: "map", l: "Map", c: "Embeds", i: "@pin", k: "google maps location" },
  { t: "booking", l: "Booking", c: "Embeds", i: "@calendar", k: "calendly cal scheduling" },
  { t: "newsletter", l: "Newsletter", c: "Forms", i: "send", k: "email signup subscribe" },
  { t: "contactform", l: "Contact form", c: "Forms", i: "@edit", k: "message form email" },
  {
    t: "guestbook",
    l: "Guestbook",
    c: "Forms",
    i: "@edit",
    k: "guestbook sign signatures visitors wall ultra"
  },
  { t: "tutorials", l: "Tutorials", c: "Dynamic", i: "@cap", k: "list" },
  { t: "reviews", l: "Reviews", c: "Dynamic", i: "@star", k: "list" },
  { t: "divider", l: "Divider", c: "Layout", i: "minus", k: "rule line separator" },
  { t: "spacer", l: "Spacer", c: "Layout", i: "move-vertical", k: "gap whitespace" },
  { t: "group", l: "Collapsible", c: "Layout", i: "box", k: "group sections" }
];
const BLK_LABEL = Object.fromEntries(BLOCK_CATALOG.map((b) => [b.t, b.l]));
const BLK_CATS = [...new Set(BLOCK_CATALOG.map((b) => b.c))];
function bRender(s, theme) {
  const {
    accent = __SITE__.accent,
    text = __SITE__.text,
    font = "Josefin Sans",
    bg = __SITE__.bg
  } = theme;
  const ff = `font-family:'${font}',sans-serif;`;
  const fc = `color:${text};`;
  const h = {
    E: bE,
    A: bA,
    rgb: bRgb,
    md,
    accent,
    text,
    bg,
    font,
    ff,
    fc,
    dispatch: (cs) => bRender(cs, theme)
  };
  const mod = window.FoyerCoreBlocks.CORE_BLOCKS[s.type];
  if (mod) return mod.preview(s, h);
  return bXtra(s, {
    E: bE,
    A: bA,
    rgb: bRgb,
    md,
    accent,
    text,
    bg,
    font
  });
}
function bDefault(type) {
  const id = Math.random().toString(36).slice(2, 9);
  switch (type) {
    case "hero":
      return {
        id,
        type,
        eyebrow: "",
        name: typeof __SITE__ !== "undefined" && __SITE__.name || "Your Name",
        tagline: "",
        align: "center",
        name_size: "lg",
        weight: "300",
        ls: "normal",
        pad: "md"
      };
    case "bio":
      return {
        id,
        type,
        heading: "About",
        body: "",
        align: "left",
        max_w: "normal",
        fsize: "md",
        lh: "normal",
        pad: "md"
      };
    case "links":
      return {
        id,
        type,
        items: [{ t: "", u: "https://", d: "", new_tab: "yes" }],
        link_style: "card",
        pad: "md"
      };
    case "contact":
      return {
        id,
        type,
        items: [
          { label: "Email", val: "", href: "" },
          { label: "Phone", val: "", href: "" }
        ],
        align: "center",
        cstyle: "normal",
        pad: "md"
      };
    case "social":
      return {
        id,
        type,
        items: [
          { label: "Instagram", url: "https://instagram.com/" },
          { label: "LinkedIn", url: "https://linkedin.com/" }
        ],
        align: "center",
        btn_style: "outline",
        pad: "md"
      };
    case "cta":
      return {
        id,
        type,
        text: "",
        button_label: "Get in touch",
        button_url: "",
        align: "center",
        btn_style: "solid",
        btn_size: "md",
        pad: "md"
      };
    case "quote":
      return { id, type, quote: "", attribution: "", variant: "border", pad: "md" };
    case "heading":
      return {
        id,
        type,
        text: "Heading",
        size: "md",
        align: "left",
        weight: "300",
        ls: "normal",
        pad: "md"
      };
    case "text":
      return {
        id,
        type,
        text: "",
        align: "left",
        fsize: "md",
        lh: "normal",
        max_w: "normal",
        pad: "md"
      };
    case "image":
      return {
        id,
        type,
        url: "",
        caption: "",
        size: "full",
        align: "center",
        radius: "none",
        pad: "md"
      };
    case "stats":
      return {
        id,
        type,
        items: [
          { number: "100+", label: "Projects" },
          { number: "10", label: "Years" }
        ],
        cols: "auto",
        pad: "md"
      };
    case "divider":
      return { id, type, style: "fade", spacing: "md" };
    case "spacer":
      return { id, type, size: "md" };
    case "link":
      return {
        id,
        type,
        label: "Visit →",
        url: "",
        align: "center",
        style: "pill",
        size: "md",
        new_tab: "yes",
        pad: "md"
      };
    case "cards":
      return {
        id,
        type,
        items: [
          { img: "", title: "Card Title", body: "", url: "", new_tab: "yes" },
          { img: "", title: "Card Title", body: "", url: "", new_tab: "yes" }
        ],
        layout: "grid-2",
        radius: "none",
        pad: "md"
      };
    case "collection":
      return {
        id,
        type,
        heading: "My Collection",
        show_count: "yes",
        layout: "grid-3",
        items: [
          {
            imgs: [""],
            name: "Item one",
            note: "",
            for_sale: "no",
            price: "",
            sale: "no",
            sale_price: "",
            sale_until: "",
            buy: "no",
            buy_label: "Buy",
            buy_url: ""
          },
          {
            imgs: [""],
            name: "Item two",
            note: "",
            for_sale: "no",
            price: "",
            sale: "no",
            sale_price: "",
            sale_until: "",
            buy: "no",
            buy_label: "Buy",
            buy_url: ""
          }
        ],
        pad: "md"
      };
    case "gallery":
      return {
        id,
        type,
        items: [
          { img: "", url: "", caption: "" },
          { img: "", url: "", caption: "" },
          { img: "", url: "", caption: "" }
        ],
        cols: "3",
        height: "md",
        gap: "sm",
        radius: "none",
        pad: "md"
      };
    case "imgtext":
      return {
        id,
        type,
        img: "",
        reverse: "no",
        img_w: "md",
        img_h: "md",
        radius: "none",
        eyebrow: "",
        heading: "Heading",
        body: "",
        btn_label: "",
        btn_url: "",
        pad: "md"
      };
    case "group":
      return { id, type, label: "Group", default_open: "yes", sections: [] };
    case "accordion":
      return {
        id,
        type,
        items: [
          { q: "Question one", a: "Answer one" },
          { q: "Question two", a: "Answer two" }
        ],
        style: "minimal",
        pad: "md"
      };
    case "faq":
      return {
        id,
        type,
        eyebrow: "",
        heading: "Frequently Asked Questions",
        sub: "",
        items: [
          { q: "What do you offer?", a: "A short, helpful answer." },
          { q: "How can I get in touch?", a: "Use the contact form below." }
        ],
        style: "minimal",
        pad: "md"
      };
    case "carousel":
      return {
        id,
        type,
        items: [
          { img: "", caption: "" },
          { img: "", caption: "" }
        ],
        height: "md",
        radius: "none",
        pad: "md"
      };
    case "fileprev":
      return { id, type, url: "", height: "md", pad: "md" };
    case "filedown":
      return {
        id,
        type,
        url: "",
        label: "Download",
        filename: "",
        align: "center",
        btn_style: "solid",
        pad: "md"
      };
    case "tutorials":
      return {
        id,
        type,
        tut_style: "cards",
        heading: "",
        heading_align: "center",
        max_items: "0",
        view_all_show: "yes",
        view_all_label: "View all →",
        pad: "md"
      };
    case "reviews":
      return {
        id,
        type,
        rev_style: "cards",
        heading: "",
        heading_align: "center",
        max_items: "0",
        view_all_show: "yes",
        view_all_label: "View all →",
        pad: "md"
      };
    case "banner":
      return {
        id,
        type,
        eyebrow: "",
        heading: "Your headline here",
        subheading: "A short supporting line that sells it.",
        btn_label: "Get started",
        btn_url: "",
        btn2_label: "",
        btn2_url: "",
        bg_img: "",
        overlay: "0.5",
        min_h: "md",
        align: "center",
        pad: "md"
      };
    case "features":
      return {
        id,
        type,
        eyebrow: "",
        heading: "What we offer",
        sub: "",
        items: [
          { icon: "@bolt", title: "Feature one", text: "Describe it in a sentence." },
          { icon: "@star", title: "Feature two", text: "Describe it in a sentence." },
          { icon: "@check-circle", title: "Feature three", text: "Describe it in a sentence." }
        ],
        cols: "3",
        card_align: "left",
        pad: "md"
      };
    case "steps":
      return {
        id,
        type,
        eyebrow: "",
        heading: "How it works",
        sub: "",
        items: [
          { title: "Step one", text: "What happens first." },
          { title: "Step two", text: "What happens next." },
          { title: "Step three", text: "And finally this." }
        ],
        layout: "stack",
        pad: "md"
      };
    case "pricing":
      return {
        id,
        type,
        eyebrow: "",
        heading: "Pricing",
        sub: "",
        items: [
          {
            name: "Basic",
            price: "$0",
            period: "/mo",
            features: "Feature A\nFeature B",
            btn_label: "Choose",
            btn_url: "",
            featured: "no"
          },
          {
            name: "Pro",
            price: "$29",
            period: "/mo",
            features: "Everything in Basic\nFeature C\nFeature D",
            btn_label: "Choose",
            btn_url: "",
            featured: "yes",
            badge: "Popular"
          }
        ],
        pad: "md"
      };
    case "testimonials":
      return {
        id,
        type,
        eyebrow: "",
        heading: "What people say",
        sub: "",
        items: [
          {
            quote: "This made all the difference for us.",
            name: "Jane Doe",
            role: "Customer",
            avatar: ""
          },
          {
            quote: "Couldn’t recommend it more highly.",
            name: "John Smith",
            role: "Customer",
            avatar: ""
          }
        ],
        pad: "md"
      };
    case "team":
      return {
        id,
        type,
        eyebrow: "",
        heading: "Our team",
        sub: "",
        items: [
          { photo: "", name: "Full Name", role: "Role", url: "" },
          { photo: "", name: "Full Name", role: "Role", url: "" },
          { photo: "", name: "Full Name", role: "Role", url: "" }
        ],
        cols: "3",
        card_align: "left",
        pad: "md"
      };
    case "logos":
      return {
        id,
        type,
        heading: "Trusted by",
        items: [
          { img: "", label: "Brand", url: "" },
          { img: "", label: "Brand", url: "" },
          { img: "", label: "Brand", url: "" },
          { img: "", label: "Brand", url: "" }
        ],
        size: "md",
        mono: "yes",
        pad: "md"
      };
    case "video":
      return { id, type, url: "", caption: "", max_w: "normal", pad: "md" };
    case "map":
      return { id, type, query: "", height: "md", pad: "md" };
    case "marquee":
      return {
        id,
        type,
        items: [{ text: "Announcement — limited time offer" }, { text: "Free shipping this week" }],
        separator: "•",
        speed: "normal"
      };
    case "sectionhead":
      return {
        id,
        type,
        eyebrow: "",
        heading: "Section heading",
        sub: "",
        align: "center",
        pad: "md"
      };
    case "lead":
      return {
        id,
        type,
        text: "A short, larger introduction that sets up what follows.",
        align: "center",
        pad: "md"
      };
    case "callout":
      return {
        id,
        type,
        variant: "info",
        title: "",
        body: "Heads up — something worth noting goes here.",
        icon: "",
        pad: "md"
      };
    case "code":
      return { id, type, code: 'console.log("hello")', lang: "", pad: "md" };
    case "specs":
      return {
        id,
        type,
        heading: "",
        items: [
          { label: "Label", value: "Value" },
          { label: "Label", value: "Value" }
        ],
        pad: "md"
      };
    case "colllist":
      return {
        id,
        type,
        eyebrow: "",
        heading: "",
        sub: "",
        collection: "",
        cols: "3",
        pad: "md"
      };
    case "timeline":
      return {
        id,
        type,
        eyebrow: "",
        heading: "",
        sub: "",
        items: [
          { date: "2024", title: "Something happened", text: "" },
          { date: "2025", title: "Then this", text: "" }
        ],
        pad: "md"
      };
    case "tabs":
      return {
        id,
        type,
        items: [
          { label: "Tab one", body: "First panel." },
          { label: "Tab two", body: "Second panel." }
        ],
        pad: "md"
      };
    case "buttongroup":
      return {
        id,
        type,
        items: [
          { label: "Primary", url: "", style: "solid" },
          { label: "Secondary", url: "", style: "outline" }
        ],
        align: "center",
        pad: "md"
      };
    case "toc":
      return {
        id,
        type,
        heading: "On this page",
        items: [
          { label: "Section one", anchor: "" },
          { label: "Section two", anchor: "" }
        ],
        pad: "md"
      };
    case "masonry":
      return {
        id,
        type,
        items: [
          { img: "", caption: "" },
          { img: "", caption: "" },
          { img: "", caption: "" }
        ],
        cols: "3",
        pad: "md"
      };
    case "compare":
      return { id, type, before: "", after: "", height: "md", pad: "md" };
    case "testimonial":
      return {
        id,
        type,
        quote: "A single, featured testimonial that carries the section on its own.",
        name: "",
        role: "",
        avatar: "",
        pad: "md"
      };
    case "rating":
      return {
        id,
        type,
        score: "4.9",
        max: "5",
        count: "",
        label: "",
        align: "center",
        pad: "md"
      };
    case "countdown":
      return {
        id,
        type,
        heading: "",
        target: "",
        done_text: "It’s here!",
        align: "center",
        pad: "md"
      };
    case "badges":
      return {
        id,
        type,
        items: [
          { icon: "@shield", label: "Secure checkout" },
          { icon: "@truck", label: "30-day returns" },
          { icon: "@star", label: "Top rated" }
        ],
        align: "center",
        pad: "md"
      };
    case "vcard":
      return {
        id,
        type,
        photo: "",
        name: "Your Name",
        role: "",
        tagline: "",
        items: [
          { label: "Email", val: "", href: "" },
          { label: "Website", val: "", href: "" }
        ],
        pad: "md"
      };
    case "availability":
      return {
        id,
        type,
        status: "available",
        text: "Available for new work",
        align: "center",
        pad: "md"
      };
    case "skills":
      return {
        id,
        type,
        heading: "",
        items: [{ label: "JavaScript" }, { label: "Design" }, { label: "Cloudflare" }],
        align: "center",
        pad: "md"
      };
    case "progress":
      return {
        id,
        type,
        heading: "",
        items: [
          { label: "Design", pct: "90" },
          { label: "Code", pct: "75" }
        ],
        pad: "md"
      };
    case "resume":
      return {
        id,
        type,
        heading: "",
        items: [
          { date: "2022 — now", title: "Role", org: "Company", text: "" },
          { date: "2019 — 2022", title: "Role", org: "Company", text: "" }
        ],
        pad: "md"
      };
    case "qrcode":
      return { id, type, data: "", caption: "", size: "md", align: "center", pad: "md" };
    case "toggle":
      return {
        id,
        type,
        label: "Show more",
        body: "Hidden content revealed on click.",
        pad: "md"
      };
    case "copyfield":
      return { id, type, label: "", value: "hello@example.com", pad: "md" };
    case "embed":
      return { id, type, url: "", height: "md", pad: "md" };
    case "audio":
      return { id, type, url: "", pad: "md" };
    case "socialpost":
      return { id, type, url: "", pad: "md" };
    case "booking":
      return { id, type, url: "", height: "lg", pad: "md" };
    case "newsletter":
      return {
        id,
        type,
        access_key: "5a5edde2-d538-44de-9f98-70317e8de72d",
        heading: "Subscribe",
        sub: "Get new posts in your inbox.",
        button: "Subscribe",
        placeholder: "you@email.com",
        pad: "md"
      };
    case "contactform":
      return {
        id,
        type,
        access_key: "5a5edde2-d538-44de-9f98-70317e8de72d",
        eyebrow: "",
        heading: "Get in touch",
        sub: "",
        subject: "New contact message",
        button: "Send message",
        items: [
          {
            ftype: "text",
            label: "Name",
            placeholder: "",
            required: "yes",
            options: "",
            width: "full"
          },
          {
            ftype: "email",
            label: "Email",
            placeholder: "you@email.com",
            required: "yes",
            options: "",
            width: "full"
          },
          {
            ftype: "textarea",
            label: "Message",
            placeholder: "",
            required: "yes",
            options: "",
            width: "full"
          }
        ],
        pad: "md"
      };
    case "guestbook":
      return {
        id,
        type,
        heading: "Sign the guestbook",
        sub: "Leave a note before you go ✍️",
        button: "Sign",
        pad: "md"
      };
  }
}
function bAlignRow(cur) {
  return `<div class="bld-ef"><label>Alignment</label><div class="bld-align-row">
    <button class="bld-ab${!cur || cur === "left" ? " act" : ""}" data-align="left">Left</button>
    <button class="bld-ab${cur === "center" ? " act" : ""}" data-align="center">Center</button>
    <button class="bld-ab${cur === "right" ? " act" : ""}" data-align="right">Right</button>
  </div></div>`;
}
function bPadRow(cur) {
  return `<div class="bld-ef"><label>Padding</label><select data-f="pad"><option value="sm"${cur === "sm" ? " selected" : ""}>Compact</option><option value="md"${!cur || cur === "md" ? " selected" : ""}>Normal</option><option value="lg"${cur === "lg" ? " selected" : ""}>Spacious</option></select></div>`;
}
function bEditorFields(s) {
  const typeLabels = BLK_LABEL;
  let f = "";
  const ehs = `<div class="bld-ef"><label>Eyebrow <span style="opacity:.5">(small text above)</span></label><input type="text" data-f="eyebrow" value="${bA(s.eyebrow || "")}" /></div>
     <div class="bld-ef"><label>Heading <span style="opacity:.5">(optional)</span></label><input type="text" data-f="heading" value="${bA(s.heading || "")}" /></div>
     <div class="bld-ef"><label>Subheading <span style="opacity:.5">(optional)</span></label><input type="text" data-f="sub" value="${bA(s.sub || "")}" /></div>`;
  if (s.type === "hero") {
    f = `<div class="bld-ef"><label>Name</label><input type="text" data-f="name" value="${bA(s.name)}" /></div>
       <div class="bld-ef"><label>Eyebrow <span style="opacity:.5">(above name)</span></label><input type="text" data-f="eyebrow" value="${bA(s.eyebrow)}" /></div>
       <div class="bld-ef"><label>Tagline</label><input type="text" data-f="tagline" value="${bA(s.tagline)}" /></div>
       <div class="bld-ef"><label>Background Image <span style="opacity:.5">(optional)</span></label><div style="display:flex;gap:.4rem;"><input type="url" data-f="bg_img" value="${bA(s.bg_img || "")}" style="flex:1;" /><button class="btn btn-sm bld-img-pick" data-target-f="bg_img">Pick</button></div></div>
       <div class="bld-ef"><label>Image Overlay Opacity <span style="opacity:.5">(0–1)</span></label><input type="text" data-f="bg_overlay" value="${bA(s.bg_overlay || "0.45")}" /></div>
       ${bAlignRow(s.align)}
       <div class="bld-ef"><label>Name Size</label><select data-f="name_size"><option value="sm"${s.name_size === "sm" ? " selected" : ""}>Small</option><option value="md"${s.name_size === "md" ? " selected" : ""}>Medium</option><option value="lg"${!s.name_size || s.name_size === "lg" ? " selected" : ""}>Large</option><option value="xl"${s.name_size === "xl" ? " selected" : ""}>X-Large</option></select></div>
       <div class="bld-ef"><label>Font Weight</label><select data-f="weight"><option value="200"${s.weight === "200" ? " selected" : ""}>Thin</option><option value="300"${!s.weight || s.weight === "300" ? " selected" : ""}>Light</option><option value="400"${s.weight === "400" ? " selected" : ""}>Regular</option></select></div>
       <div class="bld-ef"><label>Letter Spacing</label><select data-f="ls"><option value="tight"${s.ls === "tight" ? " selected" : ""}>Tight</option><option value="normal"${!s.ls || s.ls === "normal" ? " selected" : ""}>Normal</option><option value="wide"${s.ls === "wide" ? " selected" : ""}>Wide</option></select></div>
       <div class="bld-ef"><label>Scramble in <span style="opacity:.5">(decode effect, live site)</span></label><select data-f="scramble"><option value="no"${s.scramble !== "yes" ? " selected" : ""}>Off</option><option value="yes"${s.scramble === "yes" ? " selected" : ""}>On</option></select></div>
       ${bPadRow(s.pad)}`;
  } else if (s.type === "bio") {
    f = `<div class="bld-ef"><label>Photo <span style="opacity:.5">(optional)</span></label><div style="display:flex;gap:.4rem;"><input type="url" data-f="photo" value="${bA(s.photo || "")}" style="flex:1;" /><button class="btn btn-sm bld-img-pick" data-target-f="photo">Pick</button></div></div>
       <div class="bld-ef"><label>Photo Size</label><input type="text" data-f="photo_size" value="${bA(s.photo_size || "80px")}" placeholder="80px" /></div>
       <div class="bld-ef"><label>Photo Shape</label><select data-f="photo_radius"><option value="circle"${s.photo_radius === "circle" ? " selected" : ""}>Circle</option><option value="none"${!s.photo_radius || s.photo_radius === "none" ? " selected" : ""}>Square</option><option value="sm"${s.photo_radius === "sm" ? " selected" : ""}>Rounded</option><option value="lg"${s.photo_radius === "lg" ? " selected" : ""}>Round</option></select></div>
       <div class="bld-ef"><label>Heading <span style="opacity:.5">(optional)</span></label><input type="text" data-f="heading" value="${bA(s.heading)}" /></div>
       <div class="bld-ef"><label>Text <span style="opacity:.45">(Markdown)</span></label><textarea data-f="body" rows="6">${bE(s.body)}</textarea></div>
       ${bAlignRow(s.align)}
       <div class="bld-ef"><label>Max Width</label><select data-f="max_w"><option value="narrow"${s.max_w === "narrow" ? " selected" : ""}>Narrow</option><option value="normal"${!s.max_w || s.max_w === "normal" ? " selected" : ""}>Normal</option><option value="wide"${s.max_w === "wide" ? " selected" : ""}>Wide</option><option value="full"${s.max_w === "full" ? " selected" : ""}>Full</option></select></div>
       <div class="bld-ef"><label>Font Size</label><select data-f="fsize"><option value="sm"${s.fsize === "sm" ? " selected" : ""}>Small</option><option value="md"${!s.fsize || s.fsize === "md" ? " selected" : ""}>Medium</option><option value="lg"${s.fsize === "lg" ? " selected" : ""}>Large</option></select></div>
       <div class="bld-ef"><label>Line Height</label><select data-f="lh"><option value="compact"${s.lh === "compact" ? " selected" : ""}>Compact</option><option value="normal"${!s.lh || s.lh === "normal" ? " selected" : ""}>Normal</option><option value="relaxed"${s.lh === "relaxed" ? " selected" : ""}>Relaxed</option></select></div>
       ${bPadRow(s.pad)}`;
  } else if (s.type === "links") {
    const items = s.items || [];
    f = `<div id="bLI">${items.map((it, i) => `<div class="bld-li-item"><button class="bld-li-rm" data-lrm="${i}">✕</button><div class="bld-ef"><label>Title</label><input type="text" data-li="${i}" data-lf="t" value="${bA(it.t)}" /></div><div class="bld-ef"><label>URL</label><input type="url" data-li="${i}" data-lf="u" value="${bA(it.u)}" /></div><div class="bld-ef"><label>Description</label><input type="text" data-li="${i}" data-lf="d" value="${bA(it.d)}" /></div><div class="bld-ef"><label>Open in new tab</label><select data-li="${i}" data-lf="new_tab"><option value="yes"${it.new_tab !== "no" ? " selected" : ""}>Yes</option><option value="no"${it.new_tab === "no" ? " selected" : ""}>No</option></select></div></div>`).join("")}</div>
      <button class="bld-add-li" id="bAddLi">+ Add link</button>
      <div class="bld-ef"><label>Link Style</label><select data-f="link_style"><option value="card"${!s.link_style || s.link_style === "card" ? " selected" : ""}>Card</option><option value="minimal"${s.link_style === "minimal" ? " selected" : ""}>Minimal</option><option value="pill"${s.link_style === "pill" ? " selected" : ""}>Pill</option></select></div>
      ${bPadRow(s.pad)}`;
  } else if (s.type === "contact") {
    if (!s.items) {
      s.items = [];
      if (s.email) s.items.push({ label: "Email", val: s.email, href: `mailto:${s.email}` });
      if (s.phone) s.items.push({ label: "Phone", val: s.phone, href: `tel:${s.phone}` });
      if (!s.items.length) s.items.push({ label: "", val: "", href: "" });
    }
    f = `<div id="bCTI">${s.items.map((it, i) => `<div class="bld-li-item"><button class="bld-li-rm" data-ctrm="${i}">✕</button><div class="bld-ef"><label>Label</label><input type="text" data-cti="${i}" data-ctf="label" value="${bA(it.label)}" placeholder="Email" /></div><div class="bld-ef"><label>Value</label><input type="text" data-cti="${i}" data-ctf="val" value="${bA(it.val)}" placeholder="max@example.com" /></div><div class="bld-ef"><label>Subline <span style="opacity:.45">(optional)</span></label><input type="text" data-cti="${i}" data-ctf="sub" value="${bA(it.sub)}" placeholder="e.g. Call Preferred" /></div><div class="bld-ef"><label>Link <span style="opacity:.45">(optional)</span></label><input type="text" data-cti="${i}" data-ctf="href" value="${bA(it.href)}" placeholder="mailto:max@example.com" /></div></div>`).join("")}</div>
      <button class="bld-add-li" id="bAddCti">+ Add row</button>
      ${bAlignRow(s.align)}
      <div class="bld-ef"><label>Style</label><select data-f="cstyle"><option value="normal"${!s.cstyle || s.cstyle === "normal" ? " selected" : ""}>Normal</option><option value="stacked"${s.cstyle === "stacked" ? " selected" : ""}>Stacked</option><option value="minimal"${s.cstyle === "minimal" ? " selected" : ""}>Minimal</option></select></div>
      ${bPadRow(s.pad)}`;
  } else if (s.type === "social") {
    const items = s.items || [];
    f = `<div id="bSI">${items.map((it, i) => `<div class="bld-li-item"><button class="bld-li-rm" data-srm="${i}">✕</button><div class="bld-ef"><label>Label</label><input type="text" data-si="${i}" data-sf="label" value="${bA(it.label)}" /></div><div class="bld-ef"><label>URL</label><input type="url" data-si="${i}" data-sf="url" value="${bA(it.url)}" /></div></div>`).join("")}</div>
      <button class="bld-add-li" id="bAddSi">+ Add social</button>
      ${bAlignRow(s.align)}
      <div class="bld-ef"><label>Button Style</label><select data-f="btn_style"><option value="outline"${!s.btn_style || s.btn_style === "outline" ? " selected" : ""}>Outline</option><option value="solid"${s.btn_style === "solid" ? " selected" : ""}>Solid</option><option value="minimal"${s.btn_style === "minimal" ? " selected" : ""}>Minimal</option><option value="pill"${s.btn_style === "pill" ? " selected" : ""}>Pill</option></select></div>
      ${bPadRow(s.pad)}`;
  } else if (s.type === "cta") {
    f = `<div class="bld-ef"><label>Text above button <span style="opacity:.5">(optional)</span></label><input type="text" data-f="text" value="${bA(s.text)}" /></div>
       <div class="bld-ef"><label>Button label</label><input type="text" data-f="button_label" value="${bA(s.button_label)}" /></div>
       <div class="bld-ef"><label>Button URL</label><input type="url" data-f="button_url" value="${bA(s.button_url)}" /></div>
       ${bAlignRow(s.align)}
       <div class="bld-ef"><label>Button Style</label><select data-f="btn_style"><option value="solid"${!s.btn_style || s.btn_style === "solid" ? " selected" : ""}>Solid</option><option value="outline"${s.btn_style === "outline" ? " selected" : ""}>Outline</option><option value="ghost"${s.btn_style === "ghost" ? " selected" : ""}>Ghost</option></select></div>
       <div class="bld-ef"><label>Button Size</label><select data-f="btn_size"><option value="sm"${s.btn_size === "sm" ? " selected" : ""}>Small</option><option value="md"${!s.btn_size || s.btn_size === "md" ? " selected" : ""}>Medium</option><option value="lg"${s.btn_size === "lg" ? " selected" : ""}>Large</option></select></div>
       ${bPadRow(s.pad)}`;
  } else if (s.type === "quote") {
    f = `<div class="bld-ef"><label>Quote</label><textarea data-f="quote" rows="4">${bE(s.quote)}</textarea></div>
       <div class="bld-ef"><label>Attribution</label><input type="text" data-f="attribution" value="${bA(s.attribution)}" /></div>
       <div class="bld-ef"><label>Style</label><select data-f="variant"><option value="border"${!s.variant || s.variant === "border" ? " selected" : ""}>Border left</option><option value="centered"${s.variant === "centered" ? " selected" : ""}>Centered</option><option value="minimal"${s.variant === "minimal" ? " selected" : ""}>Minimal</option></select></div>
       ${bPadRow(s.pad)}`;
  } else if (s.type === "heading") {
    f = `<div class="bld-ef"><label>Text</label><input type="text" data-f="text" value="${bA(s.text)}" /></div>
       <div class="bld-ef"><label>Size</label><select data-f="size"><option value="sm"${s.size === "sm" ? " selected" : ""}>Small</option><option value="md"${!s.size || s.size === "md" ? " selected" : ""}>Medium</option><option value="xl"${s.size === "xl" ? " selected" : ""}>Large</option></select></div>
       ${bAlignRow(s.align)}
       <div class="bld-ef"><label>Font Weight</label><select data-f="weight"><option value="100"${s.weight === "100" ? " selected" : ""}>Hairline</option><option value="200"${s.weight === "200" ? " selected" : ""}>Thin</option><option value="300"${!s.weight || s.weight === "300" ? " selected" : ""}>Light</option><option value="400"${s.weight === "400" ? " selected" : ""}>Regular</option></select></div>
       <div class="bld-ef"><label>Letter Spacing</label><select data-f="ls"><option value="tight"${s.ls === "tight" ? " selected" : ""}>Tight</option><option value="normal"${!s.ls || s.ls === "normal" ? " selected" : ""}>Normal</option><option value="wide"${s.ls === "wide" ? " selected" : ""}>Wide</option><option value="ultra"${s.ls === "ultra" ? " selected" : ""}>Ultra wide</option></select></div>
       <div class="bld-ef"><label>Scramble in <span style="opacity:.5">(decode effect, live site)</span></label><select data-f="scramble"><option value="no"${s.scramble !== "yes" ? " selected" : ""}>Off</option><option value="yes"${s.scramble === "yes" ? " selected" : ""}>On</option></select></div>
       ${bPadRow(s.pad)}`;
  } else if (s.type === "text") {
    f = `<div class="bld-ef"><label>Text <span style="opacity:.45">(Markdown)</span></label><textarea data-f="text" rows="7">${bE(s.text)}</textarea></div>
       ${bAlignRow(s.align)}
       <div class="bld-ef"><label>Font Size</label><select data-f="fsize"><option value="sm"${s.fsize === "sm" ? " selected" : ""}>Small</option><option value="md"${!s.fsize || s.fsize === "md" ? " selected" : ""}>Medium</option><option value="lg"${s.fsize === "lg" ? " selected" : ""}>Large</option></select></div>
       <div class="bld-ef"><label>Line Height</label><select data-f="lh"><option value="compact"${s.lh === "compact" ? " selected" : ""}>Compact</option><option value="normal"${!s.lh || s.lh === "normal" ? " selected" : ""}>Normal</option><option value="relaxed"${s.lh === "relaxed" ? " selected" : ""}>Relaxed</option></select></div>
       <div class="bld-ef"><label>Max Width</label><select data-f="max_w"><option value="narrow"${s.max_w === "narrow" ? " selected" : ""}>Narrow</option><option value="normal"${!s.max_w || s.max_w === "normal" ? " selected" : ""}>Normal</option><option value="wide"${s.max_w === "wide" ? " selected" : ""}>Wide</option><option value="full"${s.max_w === "full" ? " selected" : ""}>Full</option></select></div>
       ${bPadRow(s.pad)}`;
  } else if (s.type === "image") {
    f = `<div class="bld-ef"><label>Image</label><div style="display:flex;gap:.4rem;"><input type="url" data-f="url" value="${bA(s.url)}" style="flex:1;" /><button class="btn btn-sm bld-img-pick" data-target-f="url">Pick</button></div></div>
       <div class="bld-ef"><label>Caption <span style="opacity:.5">(optional)</span></label><input type="text" data-f="caption" value="${bA(s.caption)}" /></div>
       <div class="bld-ef"><label>Size</label><select data-f="size"><option value="sm"${s.size === "sm" ? " selected" : ""}>Small</option><option value="md"${s.size === "md" ? " selected" : ""}>Medium</option><option value="full"${!s.size || s.size === "full" ? " selected" : ""}>Full width</option></select></div>
       ${bAlignRow(s.align)}
       <div class="bld-ef"><label>Border Radius</label><select data-f="radius"><option value="none"${!s.radius || s.radius === "none" ? " selected" : ""}>None</option><option value="sm"${s.radius === "sm" ? " selected" : ""}>Small</option><option value="lg"${s.radius === "lg" ? " selected" : ""}>Large</option><option value="circle"${s.radius === "circle" ? " selected" : ""}>Circle</option></select></div>
       ${bPadRow(s.pad)}`;
  } else if (s.type === "stats") {
    const items = s.items || [];
    f = `<div id="bSTI">${items.map((it, i) => `<div class="bld-li-item"><button class="bld-li-rm" data-strm="${i}">✕</button><div class="bld-ef"><label>Number / value</label><input type="text" data-sti="${i}" data-stf="number" value="${bA(it.number)}" /></div><div class="bld-ef"><label>Label</label><input type="text" data-sti="${i}" data-stf="label" value="${bA(it.label)}" /></div></div>`).join("")}</div>
      <button class="bld-add-li" id="bAddSti">+ Add stat</button>
      <div class="bld-ef"><label>Columns</label><select data-f="cols"><option value="auto"${!s.cols || s.cols === "auto" ? " selected" : ""}>Auto</option><option value="2"${s.cols === "2" ? " selected" : ""}>2 columns</option><option value="3"${s.cols === "3" ? " selected" : ""}>3 columns</option><option value="4"${s.cols === "4" ? " selected" : ""}>4 columns</option></select></div>
      ${bPadRow(s.pad)}`;
  } else if (s.type === "divider") {
    f = `<div class="bld-ef"><label>Style</label><select data-f="style"><option value="fade"${s.style === "fade" ? " selected" : ""}>Fade</option><option value="full"${s.style === "full" ? " selected" : ""}>Full line</option><option value="short"${s.style === "short" ? " selected" : ""}>Short</option></select></div>
       <div class="bld-ef"><label>Spacing</label><select data-f="spacing"><option value="sm"${s.spacing === "sm" ? " selected" : ""}>Compact</option><option value="md"${!s.spacing || s.spacing === "md" ? " selected" : ""}>Normal</option><option value="lg"${s.spacing === "lg" ? " selected" : ""}>Spacious</option></select></div>`;
  } else if (s.type === "spacer") {
    f = `<div class="bld-ef"><label>Height</label><select data-f="size"><option value="sm"${s.size === "sm" ? " selected" : ""}>Small</option><option value="md"${!s.size || s.size === "md" ? " selected" : ""}>Medium</option><option value="lg"${s.size === "lg" ? " selected" : ""}>Large</option><option value="xl"${s.size === "xl" ? " selected" : ""}>X-Large</option></select></div>`;
  } else if (s.type === "collection") {
    const items = s.items || [];
    f = `<div class="bld-ef"><label>Heading</label><input type="text" data-f="heading" value="${bA(s.heading || "")}" /></div>
       <div class="bld-ef"><label>Show count line</label><select data-f="show_count"><option value="yes"${s.show_count !== "no" ? " selected" : ""}>Yes</option><option value="no"${s.show_count === "no" ? " selected" : ""}>No</option></select></div>
       <div id="bCOLI">${items.map(
      (it, i) => `<div class="bld-li-item"><button class="bld-li-rm" data-crm="${i}">✕</button>
      ${(() => {
        const imgs = it.imgs && it.imgs.length ? it.imgs : it.img ? [it.img] : [""];
        return `<div class="bld-ef"><label>Images</label>${imgs.map((u, j) => `<div style="display:flex;gap:.4rem;margin-bottom:.3rem;"><input type="url" data-cii="${i}" data-ciij="${j}" value="${bA(u || "")}" style="flex:1;" placeholder="Image URL" /><button class="btn btn-sm bld-img-pick" data-target-cii="${i}" data-target-ciij="${j}">Pick</button><button class="btn btn-sm bld-cimg-rm" data-cii="${i}" data-ciij="${j}" title="Remove image">✕</button></div>`).join("")}<button class="btn btn-sm bld-cimg-add" data-cii="${i}">+ image</button></div>`;
      })()}
      <div class="bld-ef"><label>Name</label><input type="text" data-ci="${i}" data-cf="name" value="${bA(it.name || "")}" /></div>
      <div class="bld-ef"><label>Note <span style="opacity:.5">(optional)</span></label><textarea data-ci="${i}" data-cf="note" rows="2">${bE(it.note || "")}</textarea></div>
      <div class="bld-ef"><label>For sale</label><select data-ci="${i}" data-cf="for_sale" data-rerender><option value="no"${it.for_sale !== "yes" ? " selected" : ""}>No</option><option value="yes"${it.for_sale === "yes" ? " selected" : ""}>Yes</option></select></div>
      ${it.for_sale === "yes" ? `
      <div class="bld-ef"><label>Price</label><input type="text" data-ci="${i}" data-cf="price" value="${bA(it.price || "")}" placeholder="$200" /></div>
      <div class="bld-ef"><label>On sale <span style="opacity:.5">(crosses out the price)</span></label><select data-ci="${i}" data-cf="sale" data-rerender><option value="no"${it.sale !== "yes" ? " selected" : ""}>No</option><option value="yes"${it.sale === "yes" ? " selected" : ""}>Yes</option></select></div>
      ${it.sale === "yes" ? `
      <div class="bld-ef"><label>Sale price</label><input type="text" data-ci="${i}" data-cf="sale_price" value="${bA(it.sale_price || "")}" placeholder="$150" /></div>
      <div class="bld-ef"><label>Sale ends <span style="opacity:.5">(optional — blank = no end)</span></label><input type="text" class="bld-fp" data-ci="${i}" data-cf="sale_until" value="${bA(it.sale_until || "")}" /></div>` : ""}` : ""}
      <div class="bld-ef"><label>Buy button</label><select data-ci="${i}" data-cf="buy" data-rerender><option value="no"${it.buy !== "yes" ? " selected" : ""}>Off</option><option value="yes"${it.buy === "yes" ? " selected" : ""}>On</option></select></div>
      ${it.buy === "yes" ? `
      <div class="bld-ef"><label>Button text</label><input type="text" data-ci="${i}" data-cf="buy_label" value="${bA(it.buy_label || "")}" placeholder="Buy" /></div>
      <div class="bld-ef"><label>Button link</label><input type="url" data-ci="${i}" data-cf="buy_url" value="${bA(it.buy_url || "")}" placeholder="https://…" /></div>` : ""}
    </div>`
    ).join("")}</div>
    <button class="bld-add-li" id="bAddColl">+ Add item</button>
    <div class="bld-ef"><label>Layout</label><select data-f="layout"><option value="grid-2"${s.layout === "grid-2" ? " selected" : ""}>2 columns</option><option value="grid-3"${!s.layout || s.layout === "grid-3" ? " selected" : ""}>3 columns</option><option value="grid-4"${s.layout === "grid-4" ? " selected" : ""}>4 columns</option></select></div>
    ${bPadRow(s.pad)}`;
  } else if (s.type === "cards") {
    const items = s.items || [];
    f = `<div id="bCI">${items.map(
      (it, i) => `<div class="bld-li-item"><button class="bld-li-rm" data-crm="${i}">✕</button>
      <div class="bld-ef"><label>Image</label><div style="display:flex;gap:.4rem;"><input type="url" data-ci="${i}" data-cf="img" value="${bA(it.img || "")}" style="flex:1;" /><button class="btn btn-sm bld-img-pick" data-target-ci="${i}" data-target-cf="img">Pick</button></div></div>
      <div class="bld-ef"><label>Title</label><input type="text" data-ci="${i}" data-cf="title" value="${bA(it.title || "")}" /></div>
      <div class="bld-ef"><label>Body</label><textarea data-ci="${i}" data-cf="body" rows="2">${bE(it.body || "")}</textarea></div>
      <div class="bld-ef"><label>Link URL <span style="opacity:.5">(optional)</span></label><input type="url" data-ci="${i}" data-cf="url" value="${bA(it.url || "")}" /></div>
      <div class="bld-ef"><label>Open in new tab</label><select data-ci="${i}" data-cf="new_tab"><option value="yes"${it.new_tab !== "no" ? " selected" : ""}>Yes</option><option value="no"${it.new_tab === "no" ? " selected" : ""}>No</option></select></div>
    </div>`
    ).join("")}</div>
    <button class="bld-add-li" id="bAddCi">+ Add card</button>
    <div class="bld-ef"><label>Layout</label><select data-f="layout"><option value="grid-2"${!s.layout || s.layout === "grid-2" ? " selected" : ""}>2 columns</option><option value="grid-3"${s.layout === "grid-3" ? " selected" : ""}>3 columns</option><option value="grid-4"${s.layout === "grid-4" ? " selected" : ""}>4 columns</option><option value="feature"${s.layout === "feature" ? " selected" : ""}>Feature (large + small)</option><option value="horizontal"${s.layout === "horizontal" ? " selected" : ""}>Horizontal rows</option><option value="list"${s.layout === "list" ? " selected" : ""}>Compact list</option></select></div>
    <div class="bld-ef"><label>Image Radius</label><select data-f="radius"><option value="none"${!s.radius || s.radius === "none" ? " selected" : ""}>None</option><option value="sm"${s.radius === "sm" ? " selected" : ""}>Small</option><option value="lg"${s.radius === "lg" ? " selected" : ""}>Large</option></select></div>
    ${bPadRow(s.pad)}`;
  } else if (s.type === "gallery") {
    const items = s.items || [];
    f = `<div id="bGALI">${items.map(
      (it, i) => `<div class="bld-li-item"><button class="bld-li-rm" data-galrm="${i}">✕</button>
      <div class="bld-ef"><label>Image</label><div style="display:flex;gap:.4rem;"><input type="url" data-gi="${i}" data-gf="img" value="${bA(it.img || "")}" style="flex:1;" /><button class="btn btn-sm bld-img-pick" data-target-gi="${i}" data-target-gf="img">Pick</button></div></div>
      <div class="bld-ef"><label>Link URL <span style="opacity:.5">(optional)</span></label><input type="url" data-gi="${i}" data-gf="url" value="${bA(it.url || "")}" /></div>
      <div class="bld-ef"><label>Caption</label><input type="text" data-gi="${i}" data-gf="caption" value="${bA(it.caption || "")}" /></div>
    </div>`
    ).join("")}</div>
    <button class="bld-add-li" id="bAddGal">+ Add image</button>
    <div class="bld-ef"><label>Columns</label><select data-f="cols"><option value="2"${s.cols === "2" ? " selected" : ""}>2</option><option value="3"${!s.cols || s.cols === "3" ? " selected" : ""}>3</option><option value="4"${s.cols === "4" ? " selected" : ""}>4</option></select></div>
    <div class="bld-ef"><label>Image Height</label><select data-f="height"><option value="sm"${s.height === "sm" ? " selected" : ""}>Small</option><option value="md"${!s.height || s.height === "md" ? " selected" : ""}>Medium</option><option value="lg"${s.height === "lg" ? " selected" : ""}>Large</option></select></div>
    <div class="bld-ef"><label>Gap</label><select data-f="gap"><option value="none"${s.gap === "none" ? " selected" : ""}>None</option><option value="sm"${!s.gap || s.gap === "sm" ? " selected" : ""}>Small</option><option value="lg"${s.gap === "lg" ? " selected" : ""}>Large</option></select></div>
    <div class="bld-ef"><label>Border Radius</label><select data-f="radius"><option value="none"${!s.radius || s.radius === "none" ? " selected" : ""}>None</option><option value="sm"${s.radius === "sm" ? " selected" : ""}>Small</option><option value="lg"${s.radius === "lg" ? " selected" : ""}>Large</option></select></div>
    ${bPadRow(s.pad)}`;
  } else if (s.type === "imgtext") {
    f = `<div class="bld-ef"><label>Image</label><div style="display:flex;gap:.4rem;"><input type="url" data-f="img" value="${bA(s.img || "")}" style="flex:1;" /><button class="btn btn-sm bld-img-pick" data-target-f="img">Pick</button></div></div>
       <div class="bld-ef"><label>Image Side</label><select data-f="reverse"><option value="no"${!s.reverse || s.reverse === "no" ? " selected" : ""}>Left</option><option value="yes"${s.reverse === "yes" ? " selected" : ""}>Right</option></select></div>
       <div class="bld-ef"><label>Image Width</label><select data-f="img_w"><option value="sm"${s.img_w === "sm" ? " selected" : ""}>Narrow</option><option value="md"${!s.img_w || s.img_w === "md" ? " selected" : ""}>Medium</option><option value="lg"${s.img_w === "lg" ? " selected" : ""}>Wide</option></select></div>
       <div class="bld-ef"><label>Image Height</label><select data-f="img_h"><option value="sm"${s.img_h === "sm" ? " selected" : ""}>Short</option><option value="md"${!s.img_h || s.img_h === "md" ? " selected" : ""}>Medium</option><option value="lg"${s.img_h === "lg" ? " selected" : ""}>Tall</option></select></div>
       <div class="bld-ef"><label>Image Radius</label><select data-f="radius"><option value="none"${!s.radius || s.radius === "none" ? " selected" : ""}>None</option><option value="sm"${s.radius === "sm" ? " selected" : ""}>Small</option><option value="lg"${s.radius === "lg" ? " selected" : ""}>Large</option><option value="circle"${s.radius === "circle" ? " selected" : ""}>Circle</option></select></div>
       <div class="bld-ef"><label>Eyebrow <span style="opacity:.5">(optional)</span></label><input type="text" data-f="eyebrow" value="${bA(s.eyebrow || "")}" /></div>
       <div class="bld-ef"><label>Heading</label><input type="text" data-f="heading" value="${bA(s.heading || "")}" /></div>
       <div class="bld-ef"><label>Body</label><textarea data-f="body" rows="5">${bE(s.body || "")}</textarea></div>
       <div class="bld-ef"><label>Button Label <span style="opacity:.5">(optional)</span></label><input type="text" data-f="btn_label" value="${bA(s.btn_label || "")}" /></div>
       <div class="bld-ef"><label>Button URL</label><input type="url" data-f="btn_url" value="${bA(s.btn_url || "")}" /></div>
       ${bPadRow(s.pad)}`;
  } else if (s.type === "link") {
    f = `<div class="bld-ef"><label>Label</label><input type="text" data-f="label" value="${bA(s.label || "Visit →")}" /></div>
       <div class="bld-ef"><label>URL</label><input type="url" data-f="url" value="${bA(s.url)}" /></div>
       ${bAlignRow(s.align)}
       <div class="bld-ef"><label>Style</label><select data-f="style"><option value="pill"${!s.style || s.style === "pill" ? " selected" : ""}>Pill</option><option value="solid"${s.style === "solid" ? " selected" : ""}>Solid</option><option value="ghost"${s.style === "ghost" ? " selected" : ""}>Ghost</option><option value="underline"${s.style === "underline" ? " selected" : ""}>Underline</option><option value="badge"${s.style === "badge" ? " selected" : ""}>Badge</option></select></div>
       <div class="bld-ef"><label>Size</label><select data-f="size"><option value="sm"${s.size === "sm" ? " selected" : ""}>Small</option><option value="md"${!s.size || s.size === "md" ? " selected" : ""}>Medium</option><option value="lg"${s.size === "lg" ? " selected" : ""}>Large</option></select></div>
       <div class="bld-ef"><label>Open in new tab</label><select data-f="new_tab"><option value="yes"${s.new_tab !== "no" ? " selected" : ""}>Yes</option><option value="no"${s.new_tab === "no" ? " selected" : ""}>No</option></select></div>
       ${bPadRow(s.pad)}`;
  } else if (s.type === "group") {
    const children = s.sections || [];
    const tOpts = Object.entries(typeLabels).filter(([t]) => t !== "group").map(([t, l]) => `<option value="${t}">${l}</option>`).join("");
    f = `<div class="bld-ef"><label>Label</label><input type="text" data-f="label" value="${bA(s.label || "Group")}" /></div>
    <div class="bld-ef"><label>Default State</label><select data-f="default_open"><option value="yes"${s.default_open !== "no" ? " selected" : ""}>Open</option><option value="no"${s.default_open === "no" ? " selected" : ""}>Closed</option></select></div>
    <div class="bld-sep"></div>
    <div style="font-size:.52rem;letter-spacing:.3em;text-transform:uppercase;color:rgba(77,189,106,.35);margin:.6rem 0 .4rem;">Sections inside (${children.length})</div>
    <div id="bGrpList">${children.map(
      (c, i) => `<div class="bld-li-item" style="display:flex;align-items:center;justify-content:space-between;gap:.4rem;">
      <span style="font-size:.72rem;font-weight:200;color:var(--white);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${typeLabels[c.type] || c.type}${c.name || c.label || c.heading || c.text ? ` — <span style="opacity:.55">${bE((c.name || c.label || c.heading || c.text || "").slice(0, 22))}</span>` : ""}</span>
      <button class="btn btn-xs" data-grpedit="${i}">Edit</button>
      <button class="bld-li-rm" data-grprm="${i}" style="position:static;margin:0;">✕</button>
    </div>`
    ).join("")}</div>
    <div style="display:flex;gap:.4rem;margin-top:.5rem;">
      <select id="bGrpAddType" style="flex:1;background:var(--panel);border:1px solid var(--border);color:var(--white);font-size:.72rem;padding:.3rem .45rem;outline:none;">${tOpts}</select>
      <button class="btn btn-xs" id="bGrpAddSec">+ Add</button>
    </div>`;
  } else if (s.type === "faq") {
    const items = s.items || [];
    f = `${ehs}<div id="bFAQ">${items.map(
      (it, i) => `<div class="bld-li-item"><button class="bld-li-rm" data-crm="${i}">✕</button>
      <div class="bld-ef"><label>Question</label><input type="text" data-ci="${i}" data-cf="q" value="${bA(it.q || "")}" /></div>
      <div class="bld-ef"><label>Answer <span style="opacity:.45">(Markdown)</span></label><textarea data-ci="${i}" data-cf="a" rows="3">${bE(it.a || "")}</textarea></div>
    </div>`
    ).join("")}</div>
    <button class="bld-add-li bld-add-item" data-shape='{"q":"","a":""}'>+ Add question</button>
    <div class="bld-ef"><label>Style</label><select data-f="style"><option value="minimal"${!s.style || s.style === "minimal" ? " selected" : ""}>Minimal</option><option value="bordered"${s.style === "bordered" ? " selected" : ""}>Bordered cards</option></select></div>
    ${bPadRow(s.pad)}`;
  } else if (s.type === "accordion") {
    const items = s.items || [];
    f = `<div id="bACRI">${items.map(
      (it, i) => `<div class="bld-li-item"><button class="bld-li-rm" data-acrrm="${i}">✕</button>
      <div class="bld-ef"><label>Question</label><input type="text" data-acri="${i}" data-acrf="q" value="${bA(it.q || "")}" /></div>
      <div class="bld-ef"><label>Answer <span style="opacity:.45">(Markdown)</span></label><textarea data-acri="${i}" data-acrf="a" rows="3">${bE(it.a || "")}</textarea></div>
    </div>`
    ).join("")}</div>
    <button class="bld-add-li" id="bAddAcr">+ Add item</button>
    <div class="bld-ef"><label>Style</label><select data-f="style"><option value="minimal"${!s.style || s.style === "minimal" ? " selected" : ""}>Minimal</option><option value="bordered"${s.style === "bordered" ? " selected" : ""}>Bordered cards</option></select></div>
    ${bPadRow(s.pad)}`;
  } else if (s.type === "carousel") {
    const items = s.items || [];
    f = `<div id="bCRI">${items.map(
      (it, i) => `<div class="bld-li-item"><button class="bld-li-rm" data-crrm="${i}">✕</button>
      <div class="bld-ef"><label>Image</label><div style="display:flex;gap:.4rem;"><input type="url" data-cri="${i}" data-crf="img" value="${bA(it.img || "")}" style="flex:1;" /><button class="btn btn-sm bld-img-pick" data-target-cri="${i}" data-target-crf="img">Pick</button></div></div>
      <div class="bld-ef"><label>Caption</label><input type="text" data-cri="${i}" data-crf="caption" value="${bA(it.caption || "")}" /></div>
    </div>`
    ).join("")}</div>
    <button class="bld-add-li" id="bAddCr">+ Add slide</button>
    <div class="bld-ef"><label>Height</label><select data-f="height"><option value="sm"${s.height === "sm" ? " selected" : ""}>Short</option><option value="md"${!s.height || s.height === "md" ? " selected" : ""}>Medium</option><option value="lg"${s.height === "lg" ? " selected" : ""}>Tall</option></select></div>
    <div class="bld-ef"><label>Border Radius</label><select data-f="radius"><option value="none"${!s.radius || s.radius === "none" ? " selected" : ""}>None</option><option value="sm"${s.radius === "sm" ? " selected" : ""}>Small</option><option value="lg"${s.radius === "lg" ? " selected" : ""}>Large</option></select></div>
    ${bPadRow(s.pad)}`;
  } else if (s.type === "fileprev") {
    f = `<div class="bld-ef"><label>File URL</label><div style="display:flex;gap:.4rem;"><input type="text" data-f="url" value="${bA(s.url)}" placeholder="/api/files/1" style="flex:1;" /><button class="btn btn-xs" id="bFilePrevPick">Browse</button></div></div>
    <div class="bld-ef"><label>Height</label><select data-f="height"><option value="sm"${s.height === "sm" ? " selected" : ""}>Short (300px)</option><option value="md"${!s.height || s.height === "md" ? " selected" : ""}>Medium (520px)</option><option value="lg"${s.height === "lg" ? " selected" : ""}>Tall (720px)</option><option value="xl"${s.height === "xl" ? " selected" : ""}>Full (90vh)</option></select></div>
    ${bPadRow(s.pad)}`;
  } else if (s.type === "filedown") {
    f = `<div class="bld-ef"><label>File URL</label><div style="display:flex;gap:.4rem;"><input type="text" data-f="url" value="${bA(s.url)}" placeholder="/api/files/1" style="flex:1;" /><button class="btn btn-xs" id="bFileDownPick">Browse</button></div></div>
    <div class="bld-ef"><label>Button label</label><input type="text" data-f="label" value="${bA(s.label || "Download")}" /></div>
    <div class="bld-ef"><label>File name <span style="opacity:.45">(shown below button, optional)</span></label><input type="text" data-f="filename" value="${bA(s.filename)}" placeholder="document.pdf" /></div>
    ${bAlignRow(s.align)}
    <div class="bld-ef"><label>Button Style</label><select data-f="btn_style"><option value="solid"${!s.btn_style || s.btn_style === "solid" ? " selected" : ""}>Solid</option><option value="outline"${s.btn_style === "outline" ? " selected" : ""}>Outline</option><option value="ghost"${s.btn_style === "ghost" ? " selected" : ""}>Ghost</option></select></div>
    ${bPadRow(s.pad)}`;
  } else if (s.type === "tutorials") {
    f = `<div class="bld-ef"><label>Heading <span style="opacity:.45">(optional)</span></label><input type="text" data-f="heading" value="${bA(s.heading || "")}" placeholder="My Tutorials" /></div>
    <div class="bld-ef"><label>Heading Alignment</label><div class="bld-align-row">
      <button class="bld-ab${!s.heading_align || s.heading_align === "left" ? " act" : ""}" data-align-f="heading_align" data-align="left">Left</button>
      <button class="bld-ab${s.heading_align === "center" ? " act" : ""}" data-align-f="heading_align" data-align="center">Center</button>
      <button class="bld-ab${s.heading_align === "right" ? " act" : ""}" data-align-f="heading_align" data-align="right">Right</button>
    </div></div>
    <div class="bld-ef"><label>Style</label><select data-f="tut_style">
      <option value="cards"${!s.tut_style || s.tut_style === "cards" ? " selected" : ""}>Cards</option>
      <option value="list"${s.tut_style === "list" ? " selected" : ""}>List</option>
    </select></div>
    <div class="bld-ef"><label>Max items <span style="opacity:.45">(0 = all)</span></label><input type="number" data-f="max_items" value="${bA(s.max_items || "0")}" min="0" step="1" /></div>
    <div class="bld-ef"><label>"View all" link <span style="opacity:.45">(→ /tutorials/all)</span></label><select data-f="view_all_show">
      <option value="yes"${s.view_all_show !== false && s.view_all_show !== "no" ? " selected" : ""}>Show</option>
      <option value="no"${s.view_all_show === false || s.view_all_show === "no" ? " selected" : ""}>Hide</option>
    </select></div>
    <div class="bld-ef"><label>View All Label</label><input type="text" data-f="view_all_label" value="${bA(s.view_all_label || "View all →")}" /></div>
    ${bPadRow(s.pad)}`;
  } else if (s.type === "reviews") {
    f = `<div class="bld-ef"><label>Heading <span style="opacity:.45">(optional)</span></label><input type="text" data-f="heading" value="${bA(s.heading || "")}" placeholder="Reviews" /></div>
    <div class="bld-ef"><label>Heading Alignment</label><div class="bld-align-row">
      <button class="bld-ab${!s.heading_align || s.heading_align === "left" ? " act" : ""}" data-align-f="heading_align" data-align="left">Left</button>
      <button class="bld-ab${s.heading_align === "center" ? " act" : ""}" data-align-f="heading_align" data-align="center">Center</button>
      <button class="bld-ab${s.heading_align === "right" ? " act" : ""}" data-align-f="heading_align" data-align="right">Right</button>
    </div></div>
    <div class="bld-ef"><label>Style</label><select data-f="rev_style">
      <option value="cards"${!s.rev_style || s.rev_style === "cards" ? " selected" : ""}>Cards</option>
      <option value="list"${s.rev_style === "list" ? " selected" : ""}>List</option>
    </select></div>
    <div class="bld-ef"><label>Max items <span style="opacity:.45">(0 = all)</span></label><input type="number" data-f="max_items" value="${bA(s.max_items || "0")}" min="0" step="1" /></div>
    <div class="bld-ef"><label>"View all" link <span style="opacity:.45">(→ /reviews/all)</span></label><select data-f="view_all_show">
      <option value="yes"${s.view_all_show !== false && s.view_all_show !== "no" ? " selected" : ""}>Show</option>
      <option value="no"${s.view_all_show === false || s.view_all_show === "no" ? " selected" : ""}>Hide</option>
    </select></div>
    <div class="bld-ef"><label>View All Label</label><input type="text" data-f="view_all_label" value="${bA(s.view_all_label || "View all →")}" /></div>
    ${bPadRow(s.pad)}`;
  } else if (s.type === "banner") {
    f = `<div class="bld-ef"><label>Eyebrow <span style="opacity:.5">(small text above)</span></label><input type="text" data-f="eyebrow" value="${bA(s.eyebrow || "")}" /></div>
       <div class="bld-ef"><label>Headline</label><input type="text" data-f="heading" value="${bA(s.heading || "")}" /></div>
       <div class="bld-ef"><label>Subheading</label><textarea data-f="subheading" rows="2">${bE(s.subheading || "")}</textarea></div>
       <div class="bld-ef"><label>Button label</label><input type="text" data-f="btn_label" value="${bA(s.btn_label || "")}" /></div>
       <div class="bld-ef"><label>Button URL</label><input type="url" data-f="btn_url" value="${bA(s.btn_url || "")}" /></div>
       <div class="bld-ef"><label>2nd button label <span style="opacity:.5">(optional)</span></label><input type="text" data-f="btn2_label" value="${bA(s.btn2_label || "")}" /></div>
       <div class="bld-ef"><label>2nd button URL</label><input type="url" data-f="btn2_url" value="${bA(s.btn2_url || "")}" /></div>
       <div class="bld-ef"><label>Background Image <span style="opacity:.5">(optional)</span></label><div style="display:flex;gap:.4rem;"><input type="url" data-f="bg_img" value="${bA(s.bg_img || "")}" style="flex:1;" /><button class="btn btn-sm bld-img-pick" data-target-f="bg_img">Pick</button></div></div>
       <div class="bld-ef"><label>Overlay darkness <span style="opacity:.5">(0–1)</span></label><input type="text" data-f="overlay" value="${bA(s.overlay || "0.5")}" /></div>
       <div class="bld-ef"><label>Height</label><select data-f="min_h"><option value="sm"${s.min_h === "sm" ? " selected" : ""}>Short</option><option value="md"${!s.min_h || s.min_h === "md" ? " selected" : ""}>Medium</option><option value="lg"${s.min_h === "lg" ? " selected" : ""}>Tall</option><option value="full"${s.min_h === "full" ? " selected" : ""}>Full screen</option></select></div>
       ${bAlignRow(s.align)}
       ${bPadRow(s.pad)}`;
  } else if (s.type === "features") {
    const items = s.items || [];
    f = `${ehs}
       <div id="bFEAT">${items.map(
      (it, i) => `<div class="bld-li-item"><button class="bld-li-rm" data-crm="${i}">✕</button>
       <div class="bld-ef"><label>Icon</label><div style="display:flex;gap:.4rem;"><input type="text" data-ci="${i}" data-cf="icon" value="${bA(it.icon || "")}" placeholder="emoji, or pick →" style="flex:1;" /><button class="btn btn-sm bld-iconpick" type="button">Pick</button></div></div>
       <div class="bld-ef"><label>Title</label><input type="text" data-ci="${i}" data-cf="title" value="${bA(it.title || "")}" /></div>
       <div class="bld-ef"><label>Text</label><textarea data-ci="${i}" data-cf="text" rows="2">${bE(it.text || "")}</textarea></div>
     </div>`
    ).join("")}</div>
       <button class="bld-add-li bld-add-item" data-shape='{"icon":"✦","title":"Feature","text":""}'>+ Add feature</button>
       <div class="bld-ef"><label>Columns</label><select data-f="cols"><option value="2"${s.cols === "2" ? " selected" : ""}>2</option><option value="3"${!s.cols || s.cols === "3" ? " selected" : ""}>3</option><option value="4"${s.cols === "4" ? " selected" : ""}>4</option></select></div>
       <div class="bld-ef"><label>Card text align</label><select data-f="card_align"><option value="left"${!s.card_align || s.card_align === "left" ? " selected" : ""}>Left</option><option value="center"${s.card_align === "center" ? " selected" : ""}>Center</option></select></div>
       ${bPadRow(s.pad)}`;
  } else if (s.type === "steps") {
    const items = s.items || [];
    f = `${ehs}
       <div id="bSTEP">${items.map(
      (it, i) => `<div class="bld-li-item"><button class="bld-li-rm" data-crm="${i}">✕</button>
       <div class="bld-ef"><label>Title</label><input type="text" data-ci="${i}" data-cf="title" value="${bA(it.title || "")}" /></div>
       <div class="bld-ef"><label>Text</label><textarea data-ci="${i}" data-cf="text" rows="2">${bE(it.text || "")}</textarea></div>
     </div>`
    ).join("")}</div>
       <button class="bld-add-li bld-add-item" data-shape='{"title":"Step","text":""}'>+ Add step</button>
       <div class="bld-ef"><label>Layout</label><select data-f="layout"><option value="stack"${!s.layout || s.layout === "stack" ? " selected" : ""}>Stacked</option><option value="row"${s.layout === "row" ? " selected" : ""}>Row</option></select></div>
       ${bPadRow(s.pad)}`;
  } else if (s.type === "pricing") {
    const items = s.items || [];
    f = `${ehs}
       <div id="bPRICE">${items.map(
      (it, i) => `<div class="bld-li-item"><button class="bld-li-rm" data-crm="${i}">✕</button>
       <div class="bld-ef"><label>Plan name</label><input type="text" data-ci="${i}" data-cf="name" value="${bA(it.name || "")}" /></div>
       <div class="bld-ef"><label>Price</label><input type="text" data-ci="${i}" data-cf="price" value="${bA(it.price || "")}" placeholder="$29" /></div>
       <div class="bld-ef"><label>Period <span style="opacity:.5">(optional)</span></label><input type="text" data-ci="${i}" data-cf="period" value="${bA(it.period || "")}" placeholder="/mo" /></div>
       <div class="bld-ef"><label>Features <span style="opacity:.5">(one per line)</span></label><textarea data-ci="${i}" data-cf="features" rows="4">${bE(it.features || "")}</textarea></div>
       <div class="bld-ef"><label>Button label</label><input type="text" data-ci="${i}" data-cf="btn_label" value="${bA(it.btn_label || "")}" /></div>
       <div class="bld-ef"><label>Button URL</label><input type="url" data-ci="${i}" data-cf="btn_url" value="${bA(it.btn_url || "")}" /></div>
       <div class="bld-ef"><label>Highlight this plan</label><select data-ci="${i}" data-cf="featured"><option value="no"${it.featured !== "yes" ? " selected" : ""}>No</option><option value="yes"${it.featured === "yes" ? " selected" : ""}>Yes</option></select></div>
       <div class="bld-ef"><label>Badge <span style="opacity:.5">(if highlighted)</span></label><input type="text" data-ci="${i}" data-cf="badge" value="${bA(it.badge || "")}" placeholder="Popular" /></div>
     </div>`
    ).join("")}</div>
       <button class="bld-add-li bld-add-item" data-shape='{"name":"Plan","price":"$0","period":"/mo","features":"","btn_label":"Choose","btn_url":"","featured":"no"}'>+ Add plan</button>
       ${bPadRow(s.pad)}`;
  } else if (s.type === "testimonials") {
    const items = s.items || [];
    f = `${ehs}
       <div id="bTEST">${items.map(
      (it, i) => `<div class="bld-li-item"><button class="bld-li-rm" data-crm="${i}">✕</button>
       <div class="bld-ef"><label>Quote</label><textarea data-ci="${i}" data-cf="quote" rows="3">${bE(it.quote || "")}</textarea></div>
       <div class="bld-ef"><label>Name</label><input type="text" data-ci="${i}" data-cf="name" value="${bA(it.name || "")}" /></div>
       <div class="bld-ef"><label>Role / company <span style="opacity:.5">(optional)</span></label><input type="text" data-ci="${i}" data-cf="role" value="${bA(it.role || "")}" /></div>
       <div class="bld-ef"><label>Avatar <span style="opacity:.5">(optional)</span></label><div style="display:flex;gap:.4rem;"><input type="url" data-ci="${i}" data-cf="avatar" value="${bA(it.avatar || "")}" style="flex:1;" /><button class="btn btn-sm bld-img-pick" data-target-ci="${i}" data-target-cf="avatar">Pick</button></div></div>
     </div>`
    ).join("")}</div>
       <button class="bld-add-li bld-add-item" data-shape='{"quote":"","name":"","role":"","avatar":""}'>+ Add testimonial</button>
       ${bPadRow(s.pad)}`;
  } else if (s.type === "team") {
    const items = s.items || [];
    f = `${ehs}
       <div id="bTEAM">${items.map(
      (it, i) => `<div class="bld-li-item"><button class="bld-li-rm" data-crm="${i}">✕</button>
       <div class="bld-ef"><label>Photo</label><div style="display:flex;gap:.4rem;"><input type="url" data-ci="${i}" data-cf="photo" value="${bA(it.photo || "")}" style="flex:1;" /><button class="btn btn-sm bld-img-pick" data-target-ci="${i}" data-target-cf="photo">Pick</button></div></div>
       <div class="bld-ef"><label>Name</label><input type="text" data-ci="${i}" data-cf="name" value="${bA(it.name || "")}" /></div>
       <div class="bld-ef"><label>Role</label><input type="text" data-ci="${i}" data-cf="role" value="${bA(it.role || "")}" /></div>
       <div class="bld-ef"><label>Link <span style="opacity:.5">(optional)</span></label><input type="url" data-ci="${i}" data-cf="url" value="${bA(it.url || "")}" /></div>
     </div>`
    ).join("")}</div>
       <button class="bld-add-li bld-add-item" data-shape='{"photo":"","name":"","role":"","url":""}'>+ Add member</button>
       <div class="bld-ef"><label>Columns</label><select data-f="cols"><option value="2"${s.cols === "2" ? " selected" : ""}>2</option><option value="3"${!s.cols || s.cols === "3" ? " selected" : ""}>3</option><option value="4"${s.cols === "4" ? " selected" : ""}>4</option></select></div>
       <div class="bld-ef"><label>Card text align</label><select data-f="card_align"><option value="left"${!s.card_align || s.card_align === "left" ? " selected" : ""}>Left</option><option value="center"${s.card_align === "center" ? " selected" : ""}>Center</option></select></div>
       ${bPadRow(s.pad)}`;
  } else if (s.type === "logos") {
    const items = s.items || [];
    f = `<div class="bld-ef"><label>Heading <span style="opacity:.5">(optional)</span></label><input type="text" data-f="heading" value="${bA(s.heading || "")}" /></div>
       <div id="bLOGO">${items.map(
      (it, i) => `<div class="bld-li-item"><button class="bld-li-rm" data-crm="${i}">✕</button>
       <div class="bld-ef"><label>Logo image</label><div style="display:flex;gap:.4rem;"><input type="url" data-ci="${i}" data-cf="img" value="${bA(it.img || "")}" style="flex:1;" /><button class="btn btn-sm bld-img-pick" data-target-ci="${i}" data-target-cf="img">Pick</button></div></div>
       <div class="bld-ef"><label>Label <span style="opacity:.5">(alt / fallback)</span></label><input type="text" data-ci="${i}" data-cf="label" value="${bA(it.label || "")}" /></div>
       <div class="bld-ef"><label>Link <span style="opacity:.5">(optional)</span></label><input type="url" data-ci="${i}" data-cf="url" value="${bA(it.url || "")}" /></div>
     </div>`
    ).join("")}</div>
       <button class="bld-add-li bld-add-item" data-shape='{"img":"","label":"Brand","url":""}'>+ Add logo</button>
       <div class="bld-ef"><label>Logo size</label><select data-f="size"><option value="sm"${s.size === "sm" ? " selected" : ""}>Small</option><option value="md"${!s.size || s.size === "md" ? " selected" : ""}>Medium</option><option value="lg"${s.size === "lg" ? " selected" : ""}>Large</option></select></div>
       <div class="bld-ef"><label>Grayscale</label><select data-f="mono"><option value="yes"${s.mono !== "no" ? " selected" : ""}>Yes</option><option value="no"${s.mono === "no" ? " selected" : ""}>No</option></select></div>
       ${bPadRow(s.pad)}`;
  } else if (s.type === "video") {
    f = `<div class="bld-ef"><label>Video URL <span style="opacity:.5">(YouTube or Vimeo)</span></label><input type="url" data-f="url" value="${bA(s.url || "")}" placeholder="https://youtube.com/watch?v=…" /></div>
       <div class="bld-ef"><label>Caption <span style="opacity:.5">(optional)</span></label><input type="text" data-f="caption" value="${bA(s.caption || "")}" /></div>
       <div class="bld-ef"><label>Width</label><select data-f="max_w"><option value="narrow"${s.max_w === "narrow" ? " selected" : ""}>Narrow</option><option value="normal"${!s.max_w || s.max_w === "normal" ? " selected" : ""}>Normal</option><option value="full"${s.max_w === "full" ? " selected" : ""}>Full</option></select></div>
       ${bPadRow(s.pad)}`;
  } else if (s.type === "map") {
    f = `<div class="bld-ef"><label>Address or embed URL</label><input type="text" data-f="query" value="${bA(s.query || "")}" placeholder="123 Main St, City, State" /></div>
       <div class="bld-ef"><label>Height</label><select data-f="height"><option value="sm"${s.height === "sm" ? " selected" : ""}>Short</option><option value="md"${!s.height || s.height === "md" ? " selected" : ""}>Medium</option><option value="lg"${s.height === "lg" ? " selected" : ""}>Tall</option></select></div>
       ${bPadRow(s.pad)}`;
  } else if (s.type === "marquee") {
    if (!s.items) s.items = s.text ? [{ text: s.text }] : [{ text: "" }];
    const items = s.items;
    f = `<div id="bMARQ">${items.map((it, i) => `<div class="bld-li-item"><button class="bld-li-rm" data-crm="${i}">✕</button><div class="bld-ef"><label>Text</label><input type="text" data-ci="${i}" data-cf="text" value="${bA(it.text || "")}" /></div></div>`).join("")}</div>
       <button class="bld-add-li bld-add-item" data-shape='{"text":""}'>+ Add text</button>
       <div class="bld-ef"><label>Separator</label><input type="text" data-f="separator" value="${bA(s.separator || "•")}" /></div>
       <div class="bld-ef"><label>Speed</label><select data-f="speed"><option value="slow"${s.speed === "slow" ? " selected" : ""}>Slow</option><option value="normal"${!s.speed || s.speed === "normal" ? " selected" : ""}>Normal</option><option value="fast"${s.speed === "fast" ? " selected" : ""}>Fast</option></select></div>`;
  } else if (s.type === "sectionhead") {
    f = `${ehs}${bAlignRow(s.align)}${bPadRow(s.pad)}`;
  } else if (s.type === "lead") {
    f = `<div class="bld-ef"><label>Text</label><textarea data-f="text" rows="3">${bE(s.text || "")}</textarea></div>${bAlignRow(s.align)}${bPadRow(s.pad)}`;
  } else if (s.type === "callout") {
    f = `<div class="bld-ef"><label>Style</label><select data-f="variant"><option value="info"${!s.variant || s.variant === "info" ? " selected" : ""}>Info</option><option value="tip"${s.variant === "tip" ? " selected" : ""}>Tip</option><option value="success"${s.variant === "success" ? " selected" : ""}>Success</option><option value="warn"${s.variant === "warn" ? " selected" : ""}>Warning</option></select></div>
       <div class="bld-ef"><label>Icon <span style="opacity:.5">(optional, emoji)</span></label><input type="text" data-f="icon" value="${bA(s.icon || "")}" placeholder="💡" /></div>
       <div class="bld-ef"><label>Title <span style="opacity:.5">(optional)</span></label><input type="text" data-f="title" value="${bA(s.title || "")}" /></div>
       <div class="bld-ef"><label>Body <span style="opacity:.45">(Markdown)</span></label><textarea data-f="body" rows="3">${bE(s.body || "")}</textarea></div>${bPadRow(s.pad)}`;
  } else if (s.type === "code") {
    f = `<div class="bld-ef"><label>Language label <span style="opacity:.5">(optional)</span></label><input type="text" data-f="lang" value="${bA(s.lang || "")}" placeholder="javascript" /></div>
       <div class="bld-ef"><label>Code</label><textarea data-f="code" rows="8" style="font-family:ui-monospace,monospace;">${bE(s.code || "")}</textarea></div>${bPadRow(s.pad)}`;
  } else if (s.type === "specs") {
    const items = s.items || [];
    f = `<div class="bld-ef"><label>Heading <span style="opacity:.5">(optional)</span></label><input type="text" data-f="heading" value="${bA(s.heading || "")}" /></div>
       <div id="bSPEC">${items.map((it, i) => `<div class="bld-li-item"><button class="bld-li-rm" data-crm="${i}">✕</button><div class="bld-ef"><label>Label</label><input type="text" data-ci="${i}" data-cf="label" value="${bA(it.label || "")}" /></div><div class="bld-ef"><label>Value</label><input type="text" data-ci="${i}" data-cf="value" value="${bA(it.value || "")}" /></div></div>`).join("")}</div>
       <button class="bld-add-li bld-add-item" data-shape='{"label":"","value":""}'>+ Add row</button>${bPadRow(s.pad)}`;
  } else if (s.type === "colllist") {
    f = `${ehs}<div class="bld-ef"><label>Collection slug <span style="opacity:.5">(from the Collections tab)</span></label><input type="text" data-f="collection" value="${bA(s.collection || "")}" placeholder="blog" /></div>
       <div class="bld-ef"><label>Columns</label><select data-f="cols"><option value="2"${s.cols === "2" ? " selected" : ""}>2</option><option value="3"${!s.cols || s.cols === "3" ? " selected" : ""}>3</option><option value="4"${s.cols === "4" ? " selected" : ""}>4</option></select></div>
       <p style="font-size:.58rem;color:var(--muted);margin:.4rem 0 0;">Entries render on the live site. Manage them in the Collections tab.</p>${bPadRow(s.pad)}`;
  } else if (s.type === "timeline") {
    const items = s.items || [];
    f = `${ehs}<div id="bTL">${items.map((it, i) => `<div class="bld-li-item"><button class="bld-li-rm" data-crm="${i}">✕</button><div class="bld-ef"><label>Date</label><input type="text" data-ci="${i}" data-cf="date" value="${bA(it.date || "")}" placeholder="2024" /></div><div class="bld-ef"><label>Title</label><input type="text" data-ci="${i}" data-cf="title" value="${bA(it.title || "")}" /></div><div class="bld-ef"><label>Text</label><textarea data-ci="${i}" data-cf="text" rows="2">${bE(it.text || "")}</textarea></div></div>`).join("")}</div>
       <button class="bld-add-li bld-add-item" data-shape='{"date":"","title":"","text":""}'>+ Add event</button>${bPadRow(s.pad)}`;
  } else if (s.type === "tabs") {
    const items = s.items || [];
    f = `<div id="bTABS">${items.map((it, i) => `<div class="bld-li-item"><button class="bld-li-rm" data-crm="${i}">✕</button><div class="bld-ef"><label>Tab label</label><input type="text" data-ci="${i}" data-cf="label" value="${bA(it.label || "")}" /></div><div class="bld-ef"><label>Content <span style="opacity:.45">(Markdown)</span></label><textarea data-ci="${i}" data-cf="body" rows="3">${bE(it.body || "")}</textarea></div></div>`).join("")}</div>
       <button class="bld-add-li bld-add-item" data-shape='{"label":"Tab","body":""}'>+ Add tab</button>${bPadRow(s.pad)}`;
  } else if (s.type === "buttongroup") {
    const items = s.items || [];
    f = `<div id="bBG">${items.map((it, i) => `<div class="bld-li-item"><button class="bld-li-rm" data-crm="${i}">✕</button><div class="bld-ef"><label>Label</label><input type="text" data-ci="${i}" data-cf="label" value="${bA(it.label || "")}" /></div><div class="bld-ef"><label>URL</label><input type="url" data-ci="${i}" data-cf="url" value="${bA(it.url || "")}" /></div><div class="bld-ef"><label>Style</label><select data-ci="${i}" data-cf="style"><option value="solid"${it.style !== "outline" ? " selected" : ""}>Solid</option><option value="outline"${it.style === "outline" ? " selected" : ""}>Outline</option></select></div></div>`).join("")}</div>
       <button class="bld-add-li bld-add-item" data-shape='{"label":"Button","url":"","style":"solid"}'>+ Add button</button>${bAlignRow(s.align)}${bPadRow(s.pad)}`;
  } else if (s.type === "toc") {
    const items = s.items || [];
    f = `<div class="bld-ef"><label>Heading <span style="opacity:.5">(optional)</span></label><input type="text" data-f="heading" value="${bA(s.heading || "")}" /></div>
       <div id="bTOC">${items.map((it, i) => `<div class="bld-li-item"><button class="bld-li-rm" data-crm="${i}">✕</button><div class="bld-ef"><label>Label</label><input type="text" data-ci="${i}" data-cf="label" value="${bA(it.label || "")}" /></div><div class="bld-ef"><label>Anchor ID <span style="opacity:.45">(set on a block below)</span></label><input type="text" data-ci="${i}" data-cf="anchor" value="${bA(it.anchor || "")}" placeholder="about" /></div></div>`).join("")}</div>
       <button class="bld-add-li bld-add-item" data-shape='{"label":"","anchor":""}'>+ Add link</button>${bPadRow(s.pad)}`;
  } else if (s.type === "masonry") {
    const items = s.items || [];
    f = `<div id="bMAS">${items.map((it, i) => `<div class="bld-li-item"><button class="bld-li-rm" data-crm="${i}">✕</button><div class="bld-ef"><label>Image</label><div style="display:flex;gap:.4rem;"><input type="url" data-ci="${i}" data-cf="img" value="${bA(it.img || "")}" style="flex:1;" /><button class="btn btn-sm bld-img-pick" data-target-ci="${i}" data-target-cf="img">Pick</button></div></div><div class="bld-ef"><label>Caption</label><input type="text" data-ci="${i}" data-cf="caption" value="${bA(it.caption || "")}" /></div></div>`).join("")}</div>
       <button class="bld-add-li bld-add-item" data-shape='{"img":"","caption":""}'>+ Add image</button>
       <div class="bld-ef"><label>Columns</label><select data-f="cols"><option value="2"${s.cols === "2" ? " selected" : ""}>2</option><option value="3"${!s.cols || s.cols === "3" ? " selected" : ""}>3</option><option value="4"${s.cols === "4" ? " selected" : ""}>4</option></select></div>${bPadRow(s.pad)}`;
  } else if (s.type === "compare") {
    f = `<div class="bld-ef"><label>Before image</label><div style="display:flex;gap:.4rem;"><input type="url" data-f="before" value="${bA(s.before || "")}" style="flex:1;" /><button class="btn btn-sm bld-img-pick" data-target-f="before">Pick</button></div></div>
       <div class="bld-ef"><label>After image</label><div style="display:flex;gap:.4rem;"><input type="url" data-f="after" value="${bA(s.after || "")}" style="flex:1;" /><button class="btn btn-sm bld-img-pick" data-target-f="after">Pick</button></div></div>
       <div class="bld-ef"><label>Height</label><select data-f="height"><option value="sm"${s.height === "sm" ? " selected" : ""}>Short</option><option value="md"${!s.height || s.height === "md" ? " selected" : ""}>Medium</option><option value="lg"${s.height === "lg" ? " selected" : ""}>Tall</option></select></div>${bPadRow(s.pad)}`;
  } else if (s.type === "testimonial") {
    f = `<div class="bld-ef"><label>Quote</label><textarea data-f="quote" rows="3">${bE(s.quote || "")}</textarea></div>
       <div class="bld-ef"><label>Name</label><input type="text" data-f="name" value="${bA(s.name || "")}" /></div>
       <div class="bld-ef"><label>Role / company</label><input type="text" data-f="role" value="${bA(s.role || "")}" /></div>
       <div class="bld-ef"><label>Avatar <span style="opacity:.5">(optional)</span></label><div style="display:flex;gap:.4rem;"><input type="url" data-f="avatar" value="${bA(s.avatar || "")}" style="flex:1;" /><button class="btn btn-sm bld-img-pick" data-target-f="avatar">Pick</button></div></div>${bPadRow(s.pad)}`;
  } else if (s.type === "rating") {
    f = `<div class="bld-ef"><label>Score</label><input type="text" data-f="score" value="${bA(s.score || "")}" placeholder="4.9" /></div>
       <div class="bld-ef"><label>Out of</label><input type="text" data-f="max" value="${bA(s.max || "5")}" placeholder="5" /></div>
       <div class="bld-ef"><label>Review count <span style="opacity:.5">(optional)</span></label><input type="text" data-f="count" value="${bA(s.count || "")}" placeholder="120" /></div>
       <div class="bld-ef"><label>Label <span style="opacity:.5">(optional)</span></label><input type="text" data-f="label" value="${bA(s.label || "")}" placeholder="on Google" /></div>${bAlignRow(s.align)}${bPadRow(s.pad)}`;
  } else if (s.type === "countdown") {
    f = `<div class="bld-ef"><label>Heading <span style="opacity:.5">(optional)</span></label><input type="text" data-f="heading" value="${bA(s.heading || "")}" /></div>
       <div class="bld-ef"><label>Target date &amp; time</label><input type="text" class="bld-fp" data-f="target" value="${bA(s.target || "")}" /></div>
       <div class="bld-ef"><label>Message when done</label><input type="text" data-f="done_text" value="${bA(s.done_text || "")}" /></div>${bAlignRow(s.align)}${bPadRow(s.pad)}`;
  } else if (s.type === "badges") {
    const items = s.items || [];
    f = `<div id="bBADGE">${items.map((it, i) => `<div class="bld-li-item"><button class="bld-li-rm" data-crm="${i}">✕</button><div class="bld-ef"><label>Icon</label><div style="display:flex;gap:.4rem;"><input type="text" data-ci="${i}" data-cf="icon" value="${bA(it.icon || "")}" placeholder="emoji" style="flex:1;" /><button class="btn btn-sm bld-iconpick" type="button">Pick</button></div></div><div class="bld-ef"><label>Label</label><input type="text" data-ci="${i}" data-cf="label" value="${bA(it.label || "")}" /></div></div>`).join("")}</div>
       <button class="bld-add-li bld-add-item" data-shape='{"icon":"✔","label":""}'>+ Add badge</button>${bAlignRow(s.align)}${bPadRow(s.pad)}`;
  } else if (s.type === "vcard") {
    const items = s.items || [];
    f = `<div class="bld-ef"><label>Photo <span style="opacity:.5">(optional)</span></label><div style="display:flex;gap:.4rem;"><input type="url" data-f="photo" value="${bA(s.photo || "")}" style="flex:1;" /><button class="btn btn-sm bld-img-pick" data-target-f="photo">Pick</button></div></div>
       <div class="bld-ef"><label>Name</label><input type="text" data-f="name" value="${bA(s.name || "")}" /></div>
       <div class="bld-ef"><label>Role</label><input type="text" data-f="role" value="${bA(s.role || "")}" /></div>
       <div class="bld-ef"><label>Tagline</label><input type="text" data-f="tagline" value="${bA(s.tagline || "")}" /></div>
       <div id="bVC">${items.map((it, i) => `<div class="bld-li-item"><button class="bld-li-rm" data-crm="${i}">✕</button><div class="bld-ef"><label>Label</label><input type="text" data-ci="${i}" data-cf="label" value="${bA(it.label || "")}" /></div><div class="bld-ef"><label>Value</label><input type="text" data-ci="${i}" data-cf="val" value="${bA(it.val || "")}" /></div><div class="bld-ef"><label>Link</label><input type="text" data-ci="${i}" data-cf="href" value="${bA(it.href || "")}" placeholder="mailto:…" /></div></div>`).join("")}</div>
       <button class="bld-add-li bld-add-item" data-shape='{"label":"","val":"","href":""}'>+ Add link</button>${bPadRow(s.pad)}`;
  } else if (s.type === "availability") {
    f = `<div class="bld-ef"><label>Status</label><select data-f="status"><option value="available"${s.status !== "busy" && s.status !== "unavailable" ? " selected" : ""}>Available (green)</option><option value="busy"${s.status === "busy" ? " selected" : ""}>Busy (amber)</option></select></div>
       <div class="bld-ef"><label>Text</label><input type="text" data-f="text" value="${bA(s.text || "")}" /></div>${bAlignRow(s.align)}${bPadRow(s.pad)}`;
  } else if (s.type === "skills") {
    const items = s.items || [];
    f = `<div class="bld-ef"><label>Heading <span style="opacity:.5">(optional)</span></label><input type="text" data-f="heading" value="${bA(s.heading || "")}" /></div>
       <div id="bSKILL">${items.map((it, i) => `<div class="bld-li-item"><button class="bld-li-rm" data-crm="${i}">✕</button><div class="bld-ef"><label>Skill</label><input type="text" data-ci="${i}" data-cf="label" value="${bA(it.label || "")}" /></div></div>`).join("")}</div>
       <button class="bld-add-li bld-add-item" data-shape='{"label":""}'>+ Add skill</button>${bAlignRow(s.align)}${bPadRow(s.pad)}`;
  } else if (s.type === "progress") {
    const items = s.items || [];
    f = `<div class="bld-ef"><label>Heading <span style="opacity:.5">(optional)</span></label><input type="text" data-f="heading" value="${bA(s.heading || "")}" /></div>
       <div id="bPROG">${items.map((it, i) => `<div class="bld-li-item"><button class="bld-li-rm" data-crm="${i}">✕</button><div class="bld-ef"><label>Label</label><input type="text" data-ci="${i}" data-cf="label" value="${bA(it.label || "")}" /></div><div class="bld-ef"><label>Percent (0–100)</label><input type="number" min="0" max="100" data-ci="${i}" data-cf="pct" value="${bA(it.pct || "")}" /></div></div>`).join("")}</div>
       <button class="bld-add-li bld-add-item" data-shape='{"label":"","pct":"50"}'>+ Add bar</button>${bPadRow(s.pad)}`;
  } else if (s.type === "resume") {
    const items = s.items || [];
    f = `<div class="bld-ef"><label>Heading <span style="opacity:.5">(optional)</span></label><input type="text" data-f="heading" value="${bA(s.heading || "")}" /></div>
       <div id="bRES">${items.map((it, i) => `<div class="bld-li-item"><button class="bld-li-rm" data-crm="${i}">✕</button><div class="bld-ef"><label>Dates</label><input type="text" data-ci="${i}" data-cf="date" value="${bA(it.date || "")}" placeholder="2022 — now" /></div><div class="bld-ef"><label>Title</label><input type="text" data-ci="${i}" data-cf="title" value="${bA(it.title || "")}" /></div><div class="bld-ef"><label>Org</label><input type="text" data-ci="${i}" data-cf="org" value="${bA(it.org || "")}" /></div><div class="bld-ef"><label>Text</label><textarea data-ci="${i}" data-cf="text" rows="2">${bE(it.text || "")}</textarea></div></div>`).join("")}</div>
       <button class="bld-add-li bld-add-item" data-shape='{"date":"","title":"","org":"","text":""}'>+ Add entry</button>${bPadRow(s.pad)}`;
  } else if (s.type === "qrcode") {
    f = `<div class="bld-ef"><label>URL or text</label><input type="text" data-f="data" value="${bA(s.data || "")}" placeholder="https://…" /></div>
       <div class="bld-ef"><label>Caption <span style="opacity:.5">(optional)</span></label><input type="text" data-f="caption" value="${bA(s.caption || "")}" /></div>
       <div class="bld-ef"><label>Size</label><select data-f="size"><option value="sm"${s.size === "sm" ? " selected" : ""}>Small</option><option value="md"${!s.size || s.size === "md" ? " selected" : ""}>Medium</option><option value="lg"${s.size === "lg" ? " selected" : ""}>Large</option></select></div>${bAlignRow(s.align)}${bPadRow(s.pad)}`;
  } else if (s.type === "toggle") {
    f = `<div class="bld-ef"><label>Label</label><input type="text" data-f="label" value="${bA(s.label || "")}" /></div>
       <div class="bld-ef"><label>Hidden content <span style="opacity:.45">(Markdown)</span></label><textarea data-f="body" rows="4">${bE(s.body || "")}</textarea></div>${bPadRow(s.pad)}`;
  } else if (s.type === "copyfield") {
    f = `<div class="bld-ef"><label>Label <span style="opacity:.5">(optional)</span></label><input type="text" data-f="label" value="${bA(s.label || "")}" /></div>
       <div class="bld-ef"><label>Value to copy</label><input type="text" data-f="value" value="${bA(s.value || "")}" /></div>${bPadRow(s.pad)}`;
  } else if (s.type === "embed") {
    f = `<div class="bld-ef"><label>Embed URL <span style="opacity:.5">(CodePen, Figma, Loom, …)</span></label><input type="url" data-f="url" value="${bA(s.url || "")}" /></div>
       <div class="bld-ef"><label>Height</label><select data-f="height"><option value="sm"${s.height === "sm" ? " selected" : ""}>Short</option><option value="md"${!s.height || s.height === "md" ? " selected" : ""}>Medium</option><option value="lg"${s.height === "lg" ? " selected" : ""}>Tall</option></select></div>${bPadRow(s.pad)}`;
  } else if (s.type === "audio") {
    f = `<div class="bld-ef"><label>Spotify or SoundCloud URL</label><input type="url" data-f="url" value="${bA(s.url || "")}" placeholder="https://open.spotify.com/…" /></div>${bPadRow(s.pad)}`;
  } else if (s.type === "socialpost") {
    f = `<div class="bld-ef"><label>Post URL <span style="opacity:.5">(X, Instagram, TikTok…)</span></label><input type="url" data-f="url" value="${bA(s.url || "")}" /></div>${bPadRow(s.pad)}`;
  } else if (s.type === "booking") {
    f = `<div class="bld-ef"><label>Calendly / Cal.com URL</label><input type="url" data-f="url" value="${bA(s.url || "")}" /></div>
       <div class="bld-ef"><label>Height</label><select data-f="height"><option value="sm"${s.height === "sm" ? " selected" : ""}>Short</option><option value="md"${s.height === "md" ? " selected" : ""}>Medium</option><option value="lg"${!s.height || s.height === "lg" ? " selected" : ""}>Tall</option></select></div>${bPadRow(s.pad)}`;
  } else if (s.type === "newsletter") {
    f = `<div class="bld-ef" style="font-size:.62rem;color:var(--muted);line-height:1.6;border:1px solid var(--border);padding:.6rem .7rem;border-radius:6px;">Delivered via <a href="https://web3forms.com" target="_blank" rel="noopener" style="color:var(--green);">Web3Forms</a> — paste your access key below. The key is safe to be public.</div>
       <div class="bld-ef"><label>Web3Forms access key</label><input type="text" data-f="access_key" value="${bA(s.access_key || "")}" placeholder="xxxxxxxx-xxxx-…" /></div>
       <div class="bld-ef"><label>Heading</label><input type="text" data-f="heading" value="${bA(s.heading || "")}" /></div>
       <div class="bld-ef"><label>Subtext</label><input type="text" data-f="sub" value="${bA(s.sub || "")}" /></div>
       <div class="bld-ef"><label>Email placeholder</label><input type="text" data-f="placeholder" value="${bA(s.placeholder || "")}" /></div>
       <div class="bld-ef"><label>Button label</label><input type="text" data-f="button" value="${bA(s.button || "")}" /></div>${bPadRow(s.pad)}`;
  } else if (s.type === "guestbook") {
    f = `<div class="bld-ef" style="font-size:.62rem;color:var(--muted);line-height:1.6;border:1px solid var(--border);padding:.6rem .7rem;border-radius:6px;">A visitor-signable guestbook — entries are stored in Foyer and shown right on the page. <b style="color:#e8c66a;">Ultra</b> feature.</div>
       <div class="bld-ef"><label>Heading</label><input type="text" data-f="heading" value="${bA(s.heading || "")}" /></div>
       <div class="bld-ef"><label>Subtext</label><input type="text" data-f="sub" value="${bA(s.sub || "")}" /></div>
       <div class="bld-ef"><label>Button label</label><input type="text" data-f="button" value="${bA(s.button || "")}" /></div>${bPadRow(s.pad)}`;
  } else if (s.type === "contactform") {
    const items = s.items || [];
    const FT = [
      ["text", "Text"],
      ["email", "Email"],
      ["tel", "Phone"],
      ["number", "Number"],
      ["url", "URL"],
      ["textarea", "Long text"],
      ["select", "Dropdown"],
      ["radio", "Radio choices"],
      ["checkboxes", "Checkboxes"],
      ["checkbox", "Single checkbox"],
      ["date", "Date"],
      ["time", "Time"]
    ];
    const opt = (v, cur) => `<option value="${v}"${(cur || "text") === v ? " selected" : ""}>`;
    const fieldUI = (it, i) => `<div class="bld-li-item"><button class="bld-li-rm" data-crm="${i}">✕</button>
       <div class="bld-ef"><label>Field type</label><select data-ci="${i}" data-cf="ftype" data-rerender>${FT.map(([v, l]) => `${opt(v, it.ftype)}${l}</option>`).join("")}</select></div>
       <div class="bld-ef"><label>Label</label><input type="text" data-ci="${i}" data-cf="label" value="${bA(it.label || "")}" /></div>
       <div class="bld-ef"><label>Placeholder <span style="opacity:.5">(or dropdown prompt)</span></label><input type="text" data-ci="${i}" data-cf="placeholder" value="${bA(it.placeholder || "")}" /></div>
       ${["select", "radio", "checkboxes"].includes(it.ftype) ? `<div class="bld-ef"><label>Options <span style="opacity:.5">(one per line)</span></label><textarea data-ci="${i}" data-cf="options" rows="3">${bE(it.options || "")}</textarea></div>` : ""}
       <div class="bld-ef"><label>Required</label><select data-ci="${i}" data-cf="required"><option value="no"${it.required !== "yes" ? " selected" : ""}>No</option><option value="yes"${it.required === "yes" ? " selected" : ""}>Yes</option></select></div>
       <div class="bld-ef"><label>Width</label><select data-ci="${i}" data-cf="width"><option value="full"${it.width !== "half" ? " selected" : ""}>Full</option><option value="half"${it.width === "half" ? " selected" : ""}>Half</option></select></div>
     </div>`;
    f = `<div class="bld-ef" style="font-size:.62rem;color:var(--muted);line-height:1.6;border:1px solid var(--border);padding:.6rem .7rem;border-radius:6px;">Delivered via <a href="https://web3forms.com" target="_blank" rel="noopener" style="color:var(--green);">Web3Forms</a> — paste your access key below. The key is safe to be public. An <b>Email</b> field becomes the reply-to.</div>
       <div class="bld-ef"><label>Web3Forms access key</label><input type="text" data-f="access_key" value="${bA(s.access_key || "")}" placeholder="xxxxxxxx-xxxx-…" /></div>
       ${ehs}
       <div class="bld-ef"><label>Email subject <span style="opacity:.5">(what you receive)</span></label><input type="text" data-f="subject" value="${bA(s.subject || "")}" /></div>
       <div class="bld-sep" style="margin:.5rem 0;"></div>
       <div style="font-size:.52rem;letter-spacing:.3em;text-transform:uppercase;color:rgba(var(--accent-rgb),.4);margin:.4rem 0 .5rem;">Form fields (${items.length})</div>
       <div id="bFORM">${items.map(fieldUI).join("")}</div>
       <button class="bld-add-li bld-add-item" data-shape='{"ftype":"text","label":"New field","placeholder":"","required":"no","options":"","width":"full"}'>+ Add field</button>
       <div class="bld-ef"><label>Submit button label</label><input type="text" data-f="button" value="${bA(s.button || "")}" /></div>${bPadRow(s.pad)}`;
  }
  if (!["divider", "spacer"].includes(s.type)) {
    f += `<div class="bld-sep" style="margin:.4rem 0;"></div>
    <div style="font-size:.52rem;letter-spacing:.3em;text-transform:uppercase;color:rgba(var(--accent-rgb),.4);margin:.2rem 0 .5rem;">Section settings</div>
    <div class="bld-ef"><label>Column Width <span style="opacity:.45">(for side-by-side rows)</span></label>
    <select data-f="width">
      <option value="full"${!s.width || s.width === "full" ? " selected" : ""}>Full width</option>
      <option value="half"${s.width === "half" ? " selected" : ""}>Half — pair with next</option>
      <option value="third"${s.width === "third" ? " selected" : ""}>One-third — group of 3</option>
    </select></div>
    <div class="bld-ef"><label>Section background</label>
    <select data-f="sbg">
      <option value=""${!s.sbg ? " selected" : ""}>None</option>
      <option value="subtle"${s.sbg === "subtle" ? " selected" : ""}>Subtle tint</option>
      <option value="bold"${s.sbg === "bold" ? " selected" : ""}>Bold tint</option>
      <option value="dark"${s.sbg === "dark" ? " selected" : ""}>Darker</option>
    </select></div>
    <div class="bld-ef"><label>Vertical spacing <span style="opacity:.45">(around the section)</span></label>
    <select data-f="smargin">
      <option value=""${!s.smargin ? " selected" : ""}>None</option>
      <option value="sm"${s.smargin === "sm" ? " selected" : ""}>Small</option>
      <option value="md"${s.smargin === "md" ? " selected" : ""}>Medium</option>
      <option value="lg"${s.smargin === "lg" ? " selected" : ""}>Large</option>
    </select></div>
    <div class="bld-ef"><label>Rounded corners</label>
    <select data-f="sround">
      <option value=""${!s.sround ? " selected" : ""}>None</option>
      <option value="sm"${s.sround === "sm" ? " selected" : ""}>Small</option>
      <option value="lg"${s.sround === "lg" ? " selected" : ""}>Large</option>
    </select></div>
    <div class="bld-ef"><label>Visibility</label>
    <select data-f="hide">
      <option value=""${!s.hide ? " selected" : ""}>Everywhere</option>
      <option value="mobile"${s.hide === "mobile" ? " selected" : ""}>Hide on mobile</option>
      <option value="desktop"${s.hide === "desktop" ? " selected" : ""}>Hide on desktop</option>
    </select></div>
    <div class="bld-ef"><label>Reveal on scroll <span style="opacity:.45">(live site)</span></label>
    <select data-f="reveal">
      <option value=""${!s.reveal ? " selected" : ""}>None</option>
      <option value="fade"${s.reveal === "fade" ? " selected" : ""}>Fade in</option>
      <option value="up"${s.reveal === "up" ? " selected" : ""}>Slide up</option>
      <option value="zoom"${s.reveal === "zoom" ? " selected" : ""}>Zoom in</option>
    </select></div>
    <div class="bld-ef"><label>Anchor ID <span style="opacity:.45">(optional — link to it with #id)</span></label>
    <input type="text" data-f="anchor" value="${bA(s.anchor || "")}" placeholder="e.g. about" /></div>`;
  }
  return { html: f, label: typeLabels[s.type] || s.type };
}
function bBindEditor(panel, s, onUpdate) {
  panel.querySelectorAll("[data-f]").forEach((inp) => {
    inp.addEventListener("input", () => {
      s[inp.dataset.f] = inp.value;
      if (inp.dataset.f === "width") {
        bldDrawCanvas();
      } else {
        onUpdate(s);
      }
    });
  });
  panel.querySelectorAll("[data-align]:not([data-align-f])").forEach((btn) => {
    btn.addEventListener("click", () => {
      panel.querySelectorAll("[data-align]:not([data-align-f])").forEach((b) => b.classList.remove("act"));
      btn.classList.add("act");
      s.align = btn.dataset.align;
      onUpdate(s);
    });
  });
  panel.querySelectorAll("[data-align-f]").forEach((btn) => {
    const field = btn.dataset.alignF;
    btn.addEventListener("click", () => {
      panel.querySelectorAll(`[data-align-f="${field}"]`).forEach((b) => b.classList.remove("act"));
      btn.classList.add("act");
      s[field] = btn.dataset.align;
      onUpdate(s);
    });
  });
  panel.querySelectorAll("[data-li][data-lf]").forEach((inp) => {
    const ev = inp.tagName === "SELECT" ? "change" : "input";
    inp.addEventListener(ev, () => {
      s.items[+inp.dataset.li][inp.dataset.lf] = inp.value;
      onUpdate(s);
    });
  });
  panel.querySelectorAll("[data-lrm]").forEach((btn) => {
    btn.addEventListener("click", () => {
      s.items.splice(+btn.dataset.lrm, 1);
      onUpdate(s, "re-editor");
    });
  });
  const addLi = panel.querySelector("#bAddLi");
  if (addLi)
    addLi.addEventListener("click", () => {
      s.items.push({ t: "", u: "https://", d: "" });
      onUpdate(s, "re-editor");
    });
  panel.querySelectorAll("[data-si][data-sf]").forEach((inp) => {
    inp.addEventListener("input", () => {
      s.items[+inp.dataset.si][inp.dataset.sf] = inp.value;
      onUpdate(s);
    });
  });
  panel.querySelectorAll("[data-srm]").forEach((btn) => {
    btn.addEventListener("click", () => {
      s.items.splice(+btn.dataset.srm, 1);
      onUpdate(s, "re-editor");
    });
  });
  const addSi = panel.querySelector("#bAddSi");
  if (addSi)
    addSi.addEventListener("click", () => {
      s.items.push({ label: "", url: "https://" });
      onUpdate(s, "re-editor");
    });
  panel.querySelectorAll("[data-sti][data-stf]").forEach((inp) => {
    inp.addEventListener("input", () => {
      s.items[+inp.dataset.sti][inp.dataset.stf] = inp.value;
      onUpdate(s);
    });
  });
  panel.querySelectorAll("[data-strm]").forEach((btn) => {
    btn.addEventListener("click", () => {
      s.items.splice(+btn.dataset.strm, 1);
      onUpdate(s, "re-editor");
    });
  });
  const addSti = panel.querySelector("#bAddSti");
  if (addSti)
    addSti.addEventListener("click", () => {
      s.items.push({ number: "", label: "" });
      onUpdate(s, "re-editor");
    });
  panel.querySelectorAll("[data-ci][data-cf]").forEach((inp) => {
    const ev = inp.tagName === "SELECT" ? "change" : "input";
    inp.addEventListener(ev, () => {
      const i = +inp.dataset.ci;
      if (!s.items) s.items = [];
      if (!s.items[i]) s.items[i] = {};
      s.items[i][inp.dataset.cf] = inp.value;
      onUpdate(s, inp.hasAttribute("data-rerender") ? "re-editor" : void 0);
    });
  });
  panel.querySelectorAll("[data-crm]").forEach((btn) => {
    btn.addEventListener("click", () => {
      s.items.splice(+btn.dataset.crm, 1);
      onUpdate(s, "re-editor");
    });
  });
  const addCi = panel.querySelector("#bAddCi");
  if (addCi)
    addCi.addEventListener("click", () => {
      s.items.push({ img: "", title: "", body: "", url: "", new_tab: "yes" });
      onUpdate(s, "re-editor");
    });
  const addColl = panel.querySelector("#bAddColl");
  if (addColl)
    addColl.addEventListener("click", () => {
      s.items.push({
        imgs: [""],
        name: "",
        note: "",
        for_sale: "no",
        price: "",
        sale: "no",
        sale_price: "",
        sale_until: "",
        buy: "no",
        buy_label: "Buy",
        buy_url: ""
      });
      onUpdate(s, "re-editor");
    });
  const ensureColImgs = (i) => {
    if (!s.items[i].imgs) s.items[i].imgs = s.items[i].img ? [s.items[i].img] : [];
    return s.items[i].imgs;
  };
  panel.querySelectorAll("input[data-cii][data-ciij]").forEach((inp) => {
    inp.addEventListener("input", () => {
      const a = ensureColImgs(+inp.dataset.cii);
      a[+inp.dataset.ciij] = inp.value;
      onUpdate(s);
    });
  });
  panel.querySelectorAll(".bld-cimg-rm").forEach((btn) => {
    btn.addEventListener("click", () => {
      const a = ensureColImgs(+btn.dataset.cii);
      a.splice(+btn.dataset.ciij, 1);
      onUpdate(s, "re-editor");
    });
  });
  panel.querySelectorAll(".bld-cimg-add").forEach((btn) => {
    btn.addEventListener("click", () => {
      ensureColImgs(+btn.dataset.cii).push("");
      onUpdate(s, "re-editor");
    });
  });
  panel.querySelectorAll("[data-cti][data-ctf]").forEach((inp) => {
    inp.addEventListener("input", () => {
      if (!s.items) s.items = [];
      const i = +inp.dataset.cti;
      if (!s.items[i]) s.items[i] = { label: "", val: "", href: "" };
      s.items[i][inp.dataset.ctf] = inp.value;
      onUpdate(s);
    });
  });
  panel.querySelectorAll("[data-ctrm]").forEach((btn) => {
    btn.addEventListener("click", () => {
      s.items.splice(+btn.dataset.ctrm, 1);
      onUpdate(s, "re-editor");
    });
  });
  const addCti = panel.querySelector("#bAddCti");
  if (addCti)
    addCti.addEventListener("click", () => {
      if (!s.items) s.items = [];
      s.items.push({ label: "", val: "", href: "", sub: "" });
      onUpdate(s, "re-editor");
    });
  panel.querySelectorAll(".bld-add-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!s.items) s.items = [];
      let shape = {};
      try {
        shape = JSON.parse(btn.dataset.shape || "{}");
      } catch {
      }
      s.items.push(shape);
      onUpdate(s, "re-editor");
    });
  });
  panel.querySelectorAll(".bld-iconpick").forEach((btn) => {
    const inp = btn.closest(".bld-ef")?.querySelector('input[data-cf="icon"]');
    btn.addEventListener("click", () => {
      if (inp && typeof bldOpenIconPicker === "function")
        bldOpenIconPicker((name) => {
          inp.value = name;
          inp.dispatchEvent(new Event("input", { bubbles: true }));
        }, btn);
    });
  });
  panel.addEventListener("contextmenu", (e) => {
    const t = e.target;
    if (!t || t.tagName !== "TEXTAREA" && !(t.tagName === "INPUT" && /^(text|url|search|email|tel|)$/i.test(t.type || "text")))
      return;
    if (typeof ctxMenu !== "function") return;
    e.preventDefault();
    const isIcon = t.matches('[data-cf="icon"]');
    const insert = (val) => {
      if (isIcon) {
        t.value = val;
      } else {
        const a = t.selectionStart ?? t.value.length, b = t.selectionEnd ?? t.value.length;
        t.value = t.value.slice(0, a) + val + t.value.slice(b);
        const p = a + val.length;
        try {
          t.setSelectionRange(p, p);
        } catch (_) {
        }
      }
      t.dispatchEvent(new Event("input", { bubbles: true }));
      t.focus();
    };
    const sel = () => t.value.slice(t.selectionStart || 0, t.selectionEnd || 0);
    const ico = (n) => typeof foyerIcon === "function" ? foyerIcon("@" + n, "1em") : "";
    const items = [
      {
        label: isIcon ? "Pick icon" : "Add emoji / icon",
        icon: ico("smile"),
        action: () => bldOpenIconPicker(insert, t)
      },
      "-",
      {
        label: "Cut",
        icon: ico("scissors"),
        action: () => {
          const s2 = sel();
          if (!s2) return;
          try {
            navigator.clipboard.writeText(s2);
          } catch (_) {
          }
          const a = t.selectionStart, b = t.selectionEnd;
          t.value = t.value.slice(0, a) + t.value.slice(b);
          try {
            t.setSelectionRange(a, a);
          } catch (_) {
          }
          t.dispatchEvent(new Event("input", { bubbles: true }));
          t.focus();
        }
      },
      {
        label: "Copy",
        icon: ico("copy"),
        action: () => {
          const s2 = sel();
          if (s2) {
            try {
              navigator.clipboard.writeText(s2);
            } catch (_) {
            }
          }
        }
      },
      {
        label: "Paste",
        icon: ico("clipboard"),
        action: async () => {
          try {
            const txt = await navigator.clipboard.readText();
            if (txt) insert(txt);
          } catch (_) {
          }
        }
      },
      {
        label: "Select all",
        icon: ico("select-all"),
        action: () => {
          t.focus();
          try {
            t.select();
          } catch (_) {
          }
        }
      }
    ];
    ctxMenu(e.clientX, e.clientY, items);
  });
  panel.querySelector("#bFilePrevPick")?.addEventListener(
    "click",
    () => openFilePicker((url) => {
      s.url = url;
      const inp = panel.querySelector('[data-f="url"]');
      if (inp) {
        inp.value = url;
      }
      onUpdate(s);
    })
  );
  panel.querySelector("#bFileDownPick")?.addEventListener(
    "click",
    () => openFilePicker((url) => {
      s.url = url;
      const inp = panel.querySelector('[data-f="url"]');
      if (inp) {
        inp.value = url;
      }
      onUpdate(s);
    })
  );
  panel.querySelectorAll("[data-gi][data-gf]").forEach((inp) => {
    const ev = inp.tagName === "SELECT" ? "change" : "input";
    inp.addEventListener(ev, () => {
      s.items[+inp.dataset.gi][inp.dataset.gf] = inp.value;
      onUpdate(s);
    });
  });
  panel.querySelectorAll("[data-galrm]").forEach((btn) => {
    btn.addEventListener("click", () => {
      s.items.splice(+btn.dataset.galrm, 1);
      onUpdate(s, "re-editor");
    });
  });
  const addGal = panel.querySelector("#bAddGal");
  if (addGal)
    addGal.addEventListener("click", () => {
      s.items.push({ img: "", url: "", caption: "" });
      onUpdate(s, "re-editor");
    });
  panel.querySelectorAll("[data-target-gi][data-target-gf]").forEach((btn) => {
    btn.addEventListener("click", () => {
      openImgPicker((url) => {
        const inp = panel.querySelector(
          `[data-gi="${btn.dataset.targetGi}"][data-gf="${btn.dataset.targetGf}"]`
        );
        if (inp) {
          inp.value = url;
          inp.dispatchEvent(new Event("input"));
        }
      });
    });
  });
  panel.querySelectorAll("[data-acri][data-acrf]").forEach((inp) => {
    const ev = inp.tagName === "TEXTAREA" ? "input" : inp.tagName === "SELECT" ? "change" : "input";
    inp.addEventListener(ev, () => {
      s.items[+inp.dataset.acri][inp.dataset.acrf] = inp.value;
      onUpdate(s);
    });
  });
  panel.querySelectorAll("[data-acrrm]").forEach((btn) => {
    btn.addEventListener("click", () => {
      s.items.splice(+btn.dataset.acrrm, 1);
      onUpdate(s, "re-editor");
    });
  });
  const addAcr = panel.querySelector("#bAddAcr");
  if (addAcr)
    addAcr.addEventListener("click", () => {
      s.items.push({ q: "", a: "" });
      onUpdate(s, "re-editor");
    });
  panel.querySelectorAll("[data-grprm]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!s.sections) s.sections = [];
      s.sections.splice(+btn.dataset.grprm, 1);
      onUpdate(s, "re-editor");
    });
  });
  panel.querySelectorAll("[data-grpedit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const child = s.sections?.[+btn.dataset.grpedit];
      if (!child) return;
      bldParentId = s.id;
      bldSel = child.id;
      bldDrawEditor();
    });
  });
  const addGrpSec = panel.querySelector("#bGrpAddSec");
  if (addGrpSec)
    addGrpSec.addEventListener("click", () => {
      const type = panel.querySelector("#bGrpAddType")?.value;
      if (!type) return;
      const d = bDefault(type);
      if (!d) {
        toast("That block is coming soon.", true);
        return;
      }
      if (!s.sections) s.sections = [];
      s.sections.push(d);
      onUpdate(s, "re-editor");
    });
  panel.querySelectorAll("[data-cri][data-crf]").forEach((inp) => {
    const ev = inp.tagName === "SELECT" ? "change" : "input";
    inp.addEventListener(ev, () => {
      s.items[+inp.dataset.cri][inp.dataset.crf] = inp.value;
      onUpdate(s);
    });
  });
  panel.querySelectorAll("[data-crrm]").forEach((btn) => {
    btn.addEventListener("click", () => {
      s.items.splice(+btn.dataset.crrm, 1);
      onUpdate(s, "re-editor");
    });
  });
  const addCr = panel.querySelector("#bAddCr");
  if (addCr)
    addCr.addEventListener("click", () => {
      s.items.push({ img: "", caption: "" });
      onUpdate(s, "re-editor");
    });
  panel.querySelectorAll("[data-target-cri][data-target-crf]").forEach((btn) => {
    btn.addEventListener("click", () => {
      openImgPicker((url) => {
        const inp = panel.querySelector(
          `[data-cri="${btn.dataset.targetCri}"][data-crf="${btn.dataset.targetCrf}"]`
        );
        if (inp) {
          inp.value = url;
          inp.dispatchEvent(new Event("input"));
        }
      });
    });
  });
  panel.querySelectorAll(".bld-img-pick").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetF = btn.dataset.targetF;
      const targetCi = btn.dataset.targetCi;
      const targetCf = btn.dataset.targetCf;
      openImgPicker((url) => {
        if (targetF) {
          const inp = panel.querySelector(`[data-f="${targetF}"]`);
          if (inp) {
            inp.value = url;
            inp.dispatchEvent(new Event("input"));
          }
        } else if (targetCi !== void 0 && targetCf) {
          const inp = panel.querySelector(`[data-ci="${targetCi}"][data-cf="${targetCf}"]`);
          if (inp) {
            inp.value = url;
            inp.dispatchEvent(new Event("input"));
          }
        } else if (btn.dataset.targetCii !== void 0 && btn.dataset.targetCiij !== void 0) {
          const inp = panel.querySelector(
            `[data-cii="${btn.dataset.targetCii}"][data-ciij="${btn.dataset.targetCiij}"]`
          );
          if (inp) {
            inp.value = url;
            inp.dispatchEvent(new Event("input"));
          }
        }
      });
    });
  });
}
