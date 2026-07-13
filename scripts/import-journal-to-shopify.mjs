/**
 * import-journal-to-shopify.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Bulk-creates the Dupe-vs-Inspiration SEO journal in your Shopify store via the
 * Admin GraphQL API:
 *   • 1  nv_journal_author  metaobject  (Nadia Karim)
 *   • 12 nv_journal_article metaobjects (3 Hubs + 9 Spokes) with rich-text bodies
 *   • 4  smart Collections  (beast-mode-freshies, boozy-gourmands, smoked-ouds,
 *                            sauvage-elixir-alternatives)
 *
 * The article bodies are emitted in Shopify's `rich_text` JSON schema
 * (root/paragraph/heading/list/list-item/link/text) — the only shape the app's
 * renderer (lib/shopify/rich-text.ts) understands. The fragrance pyramid, which
 * cannot be a table in rich_text, is rebuilt as a heading + bullet lists.
 *
 * ── Requirements ────────────────────────────────────────────────────────────
 * • Node 18+ (uses global fetch).
 * • A Shopify custom app Admin API access token with scopes:
 *       write_metaobjects, read_metaobjects, write_products
 * • The `nv_journal_article` + `nv_journal_author` metaobject definitions must
 *   already exist (they do — your live journal uses them) with these field keys:
 *   article: title, excerpt, reading_time, tags, body, published_at,
 *            seo_title, seo_description, author, related_articles
 *   author : name, role, bio
 *
 * ── Usage ───────────────────────────────────────────────────────────────────
 *   export SHOPIFY_STORE_DOMAIN="your-store.myshopify.com"
 *   export SHOPIFY_ADMIN_ACCESS_TOKEN="shpat_xxx"
 *   # optional: export SHOPIFY_ADMIN_API_VERSION="2024-10"
 *   node scripts/import-journal-to-shopify.mjs            # do it
 *   node scripts/import-journal-to-shopify.mjs --dry-run  # print, don't write
 *   node scripts/import-journal-to-shopify.mjs --no-collections
 *   node scripts/import-journal-to-shopify.mjs --no-publishable  # if the
 *        # metaobject definition has NO "publishable" capability, pass this so
 *        # the script doesn't try to set an ACTIVE status it can't set.
 *
 * Safe to re-run: an entry whose handle already exists is reported and skipped
 * (Shopify returns a "handle taken" userError; the script continues).
 * ────────────────────────────────────────────────────────────────────────── */

import { existsSync, readFileSync } from "node:fs";

// ── Config ───────────────────────────────────────────────────────────────────
const DRY_RUN = process.argv.includes("--dry-run");
const DO_COLLECTIONS = !process.argv.includes("--no-collections");
const PUBLISHABLE = !process.argv.includes("--no-publishable");

loadDotEnvLocal();
const STORE = process.env.SHOPIFY_STORE_DOMAIN;
const TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const API_VERSION = process.env.SHOPIFY_ADMIN_API_VERSION || "2024-10";

if (!DRY_RUN && (!STORE || !TOKEN)) {
  console.error(
    "Missing env. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_ACCESS_TOKEN " +
      "(or run with --dry-run)."
  );
  process.exit(1);
}
const ENDPOINT = `https://${STORE}/admin/api/${API_VERSION}/graphql.json`;

// ── Rich-text builders (emit Shopify `rich_text` JSON nodes) ──────────────────
const txt = (value) => ({ type: "text", value });
const b = (value) => ({ type: "text", value, bold: true });
const i = (value) => ({ type: "text", value, italic: true });
const link = (text, url) => ({
  type: "link",
  url,
  children: [txt(text)],
});
const norm = (part) => (typeof part === "string" ? txt(part) : part);
const inlineOf = (part) =>
  Array.isArray(part) ? part.map(norm) : [norm(part)];
const p = (...parts) => ({ type: "paragraph", children: parts.map(norm) });
const h2 = (text) => ({ type: "heading", level: 2, children: [txt(text)] });
const h3 = (text) => ({ type: "heading", level: 3, children: [txt(text)] });
const ul = (...items) => ({
  type: "list",
  listType: "unordered",
  children: items.map((it) => ({ type: "list-item", children: inlineOf(it) })),
});
const richText = (blocks) =>
  JSON.stringify({ type: "root", children: blocks });

// ── Content ───────────────────────────────────────────────────────────────────
const author = {
  name: "Nadia Karim",
  role: "Senior Fragrance Reviewer",
  bio: "Twelve years reviewing Middle Eastern and niche perfumery; 600+ fragrances tested on skin across Gulf climates.",
};

// URLs used by the internal-link mesh.
const C = {
  fresh: "/collections/beast-mode-freshies",
  gourmand: "/collections/boozy-gourmands",
  oud: "/collections/smoked-ouds",
  elixir: "/collections/sauvage-elixir-alternatives",
};
const J = {
  hubA: "/journal/best-fresh-fruity-fragrances-inspired-by-creed-aventus",
  hubB: "/journal/best-boozy-gourmand-fragrances-inspired-by-kilian",
  hubC: "/journal/best-oud-fragrances-inspired-by-niche-houses",
  a1: "/journal/rasasi-hawas-review-aventus-alternative",
  a2: "/journal/armaf-club-de-nuit-intense-man-vs-creed-aventus",
  a3: "/journal/cdnim-pure-parfum-vs-edt-which-to-buy",
  b1: "/journal/lattafa-khamrah-review-angels-share-alternative",
  b2: "/journal/khamrah-vs-khamrah-qahwa-which-is-better",
  b3: "/journal/best-vanilla-coffee-fragrances-for-winter",
  c1: "/journal/lattafa-oud-for-glory-vs-initio-oud-for-greatness",
  c2: "/journal/badee-al-oud-sublime-amber-oud-differences",
  c3: "/journal/how-to-wear-smoky-oud-without-smelling-like-incense",
};
const KIT = "/discovery-kits";

const articles = [
  // ───────── HUB A ─────────
  {
    handle: "best-fresh-fruity-fragrances-inspired-by-creed-aventus",
    title: "Beast-Mode Freshies: The Best Fragrances Inspired by Creed Aventus",
    excerpt:
      "Pineapple, birch smoke, and ambergris — the fresh-but-loud signature Creed made famous, decoded across Dubai's most convincing tributes.",
    readingTime: 9,
    tags: ["Dupes", "Freshies", "Guides"],
    publishedAt: "2025-03-04T09:00:00Z",
    seoTitle: "Best Fresh Fragrances Inspired by Creed Aventus (2025 Guide)",
    seoDescription:
      "Pineapple, birch smoke, ambergris. The best long-lasting fresh fragrances inspired by Creed Aventus — Rasasi Hawas, Armaf CDNIM & more.",
    relatedArticleHandles: [
      "rasasi-hawas-review-aventus-alternative",
      "armaf-club-de-nuit-intense-man-vs-creed-aventus",
      "cdnim-pure-parfum-vs-edt-which-to-buy",
    ],
    body: [
      p(
        "Creed Aventus rewired what a fresh fragrance could be: fruity and clean up top, but carried by smoke and ambergris so it projects like a heavyweight. That template is now the most cloned idea in perfumery. This is our field guide to the Dubai houses that do it best. Everything here is on our ",
        link("Beast-Mode Freshies collection", C.fresh),
        "."
      ),
      h2("What beast-mode fresh actually means"),
      p(
        "The accord has three moving parts: a fruit-forward opening (pineapple, blackcurrant, green apple), a subtle birch smoke in the heart, and an ambergris-and-musk base that gives it reach and longevity. Get all three and you get compliments; miss the smoke and you get a generic fruity cologne."
      ),
      h2("The three tributes worth your money"),
      h3("Rasasi Hawas — the versatile daily driver"),
      p(
        "Cleaner and more aquatic than Aventus, with apple and ambergris doing the heavy lifting. Our full ",
        link("Rasasi Hawas review", J.a1),
        " breaks down why it out-performs in heat."
      ),
      h3("Armaf Club de Nuit Intense Man — the closest tribute"),
      p(
        "The one everyone means when they say Aventus-for-less. See the head-to-head in ",
        link("CDNIM vs Creed Aventus", J.a2),
        ", then decide EDT or Parfum in our ",
        link("Pure Parfum vs EDT guide", J.a3),
        "."
      ),
      h2("How to choose without gambling on a full bottle"),
      p(
        "These are loud fragrances; skin chemistry matters. Test all three from a ",
        link("discovery kit", KIT),
        " before committing — a decant costs a fraction of a blind full-bottle mistake."
      ),
      p(i("Tested on skin over multiple 8-hour wears in 30–38°C Gulf conditions.")),
    ],
  },
  {
    handle: "rasasi-hawas-review-aventus-alternative",
    title: "Rasasi Hawas Review: A Fresher, Cheaper Aventus Alternative?",
    excerpt:
      "We wore Rasasi Hawas for 8 hours in the heat. Salty pineapple, ambergris, and surprising longevity — here's the honest verdict.",
    readingTime: 7,
    tags: ["Reviews", "Freshies"],
    publishedAt: "2025-03-11T09:00:00Z",
    seoTitle: "Rasasi Hawas Review: A Fresher, Cheaper Aventus Alternative?",
    seoDescription:
      "Salty pineapple, ambergris, and 8-hour longevity. Our on-skin Rasasi Hawas review — is it the best budget Aventus alternative?",
    relatedArticleHandles: [
      "best-fresh-fruity-fragrances-inspired-by-creed-aventus",
      "armaf-club-de-nuit-intense-man-vs-creed-aventus",
    ],
    body: [
      p(
        b("Verdict: "),
        "Hawas is the versatile, wear-anywhere aquatic-fruity that Aventus fans reach for when it's too hot for the real thing. Fresher, cleaner, and a genuine bargain."
      ),
      p(i("Tested on skin, 8 hours, 34°C afternoon into evening, 5 sprays.")),
      h2("The scent, top to base"),
      p(
        "Opens with green apple and bergamot over a cardamom lift — bright but not sharp. The heart turns creamy as ambergris and ylang settle in; this is where Hawas separates from cheaper freshies. The base is a soft driftwood-cedar-musk with a touch of tonka that reads clean and slightly sweet."
      ),
      h2("Is it really like Creed Aventus?"),
      p(
        "Same family, different mood. Aventus is smoky-fruity; Hawas is salty-aquatic-fruity. If you want the birch-smoke effect, our ",
        link("CDNIM comparison", J.a2),
        " is the closer match. Hawas wins on versatility and heat performance."
      ),
      h2("Performance"),
      p(
        "7–9 hours with strong first-3-hour projection; becomes a skin scent by hour six. Excellent for the climate it was tuned for."
      ),
      h2("Pros & cons"),
      ul(
        "Pros: versatile, crowd-pleasing, superb value, heat-proof.",
        "Cons: the ambergris can read synthetic to trained noses; not a true Aventus twin."
      ),
      h2("Who should buy it"),
      p(
        "Anyone wanting one safe, complimented daily driver. Shop it in the ",
        link("Beast-Mode Freshies collection", C.fresh),
        " or read the full ",
        link("beast-mode freshies guide", J.hubA),
        ". New to it? Grab a ",
        link("sample kit", KIT),
        " and test it in real heat first."
      ),
    ],
  },
  {
    handle: "armaf-club-de-nuit-intense-man-vs-creed-aventus",
    title: "Armaf Club de Nuit Intense Man vs Creed Aventus: The Honest Test",
    excerpt:
      "The most famous Aventus tribute, tested side by side. How close is it really — and where does the smoke give it away?",
    readingTime: 8,
    tags: ["Dupes", "Reviews", "Freshies"],
    publishedAt: "2025-03-18T09:00:00Z",
    seoTitle: "Armaf Club de Nuit Intense Man vs Creed Aventus (Side by Side)",
    seoDescription:
      "How close is CDNIM to Creed Aventus really? Our blind on-skin test of the opening, smoke, and longevity — plus which to buy.",
    relatedArticleHandles: [
      "best-fresh-fruity-fragrances-inspired-by-creed-aventus",
      "cdnim-pure-parfum-vs-edt-which-to-buy",
      "rasasi-hawas-review-aventus-alternative",
    ],
    body: [
      p(
        b("Verdict: "),
        "Club de Nuit Intense Man (CDNIM) is the closest widely-available tribute to Creed Aventus — 85–90% there in the opening, with a smokier, sweeter base. At its price, it's the value benchmark the whole category is measured against."
      ),
      p(i("Tested blind against a batch-verified Aventus decant, 8 hours, same arm.")),
      h2("The opening: nearly a twin"),
      p(
        "Lemon, blackcurrant, pineapple and apple — the fruity-smoky Aventus DNA is unmistakable in the first hour. On a blind sniff, most people cannot separate them here."
      ),
      h2("The heart and base: where it diverges"),
      p(
        "CDNIM leans on birch smoke harder and sweetens the drydown with vanilla and a stronger ambergris-patchouli base. It's louder and less expensive-smelling than Creed's refined smoke, but it projects further."
      ),
      h2("Longevity & projection"),
      p(
        "This is CDNIM's trump card: 10+ hours and beast-mode sillage that arguably out-performs Aventus itself."
      ),
      h2("EDT or Pure Parfum?"),
      p(
        "The Pure Parfum flanker is deeper and smokier. We break the two versions down in ",
        link("CDNIM Pure Parfum vs EDT", J.a3),
        "."
      ),
      h2("Buy it"),
      p(
        "It anchors our ",
        link("Beast-Mode Freshies collection", C.fresh),
        ". Compare it against ",
        link("Rasasi Hawas", J.a1),
        ", or test both in a ",
        link("discovery kit", KIT),
        " before you choose."
      ),
    ],
  },
  {
    handle: "cdnim-pure-parfum-vs-edt-which-to-buy",
    title: "Club de Nuit Intense Man: Pure Parfum vs EDT — Which to Buy?",
    excerpt:
      "Two versions, one legend. The EDT beast or the smokier Pure Parfum? We tested both to settle it.",
    readingTime: 6,
    tags: ["Dupes", "Freshies", "Guides"],
    publishedAt: "2025-03-25T09:00:00Z",
    seoTitle: "CDNIM Pure Parfum vs EDT: Which Should You Buy?",
    seoDescription:
      "Club de Nuit Intense Man EDT or Pure Parfum? We tested both — projection, smoke, and longevity compared to help you choose.",
    relatedArticleHandles: [
      "best-fresh-fruity-fragrances-inspired-by-creed-aventus",
      "armaf-club-de-nuit-intense-man-vs-creed-aventus",
    ],
    body: [
      p(
        b("Verdict: "),
        "Buy the EDT for versatile all-day wear and unbeatable value; buy the Pure Parfum for cold-weather depth and a smokier, more refined drydown."
      ),
      h2("Club de Nuit Intense Man EDT"),
      p(
        "The original beast: brighter fruit, harder smoke, enormous projection and 10+ hour longevity. The single best value in the fresh-fruity category."
      ),
      h2("Pure Parfum"),
      p(
        "Higher concentration and a rounder, less screechy profile. The smoke feels more like Creed's, the fruit is slightly muted, and it sits closer to skin — more office refined, less arrival announcement."
      ),
      h2("Which fits you"),
      ul(
        "Hot climate or daily rotation → EDT.",
        "Evenings, winter, or you found the EDT too loud → Pure Parfum."
      ),
      p(
        "Both live in our ",
        link("Beast-Mode Freshies collection", C.fresh),
        ". Can't decide? A ",
        link("discovery kit", KIT),
        " lets you wear both across a week. Start with the full ",
        link("beast-mode freshies guide", J.hubA),
        " for the wider lineup."
      ),
    ],
  },

  // ───────── HUB B ─────────
  {
    handle: "best-boozy-gourmand-fragrances-inspired-by-kilian",
    title: "Boozy Gourmands: Dubai's Answer to Niche Kilian",
    excerpt:
      "Cinnamon, dates, cognac, and praline over vanilla and akigalawood — the boozy dessert-oriental accord, done for a fraction of niche prices.",
    readingTime: 9,
    tags: ["Dupes", "Gourmand", "Guides"],
    publishedAt: "2025-04-08T09:00:00Z",
    seoTitle: "Best Boozy Gourmand Fragrances Inspired by Kilian (2025)",
    seoDescription:
      "Cinnamon, dates, cognac, and vanilla. The best boozy gourmand fragrances inspired by Kilian Angels' Share — Lattafa Khamrah & more.",
    relatedArticleHandles: [
      "lattafa-khamrah-review-angels-share-alternative",
      "khamrah-vs-khamrah-qahwa-which-is-better",
      "best-vanilla-coffee-fragrances-for-winter",
    ],
    body: [
      p(
        "Kilian's Angels' Share made boozy gourmand a luxury category: cognac, cinnamon, and praline that smells like dessert after a good dinner. Dubai's houses — Lattafa above all — have since produced tributes that rival it for a tenth of the price. Shop the full lineup in our ",
        link("Boozy Gourmands collection", C.gourmand),
        "."
      ),
      h2("The accord, deconstructed"),
      p(
        "A boozy gourmand needs three things: a spicy-warm opening (cinnamon, nutmeg), a boozy-sweet heart (dates, praline, a cognac or rum accord), and a long vanilla-tonka-resin base. The Arabian tuning adds dates and akigalawood for a drier, smokier finish than a European gourmand."
      ),
      h2("The essential three"),
      h3("Lattafa Khamrah — the flagship"),
      p(
        "The Angels' Share tribute everyone starts with. Full breakdown in our ",
        link("Lattafa Khamrah review", J.b1),
        "."
      ),
      h3("Khamrah Qahwa — the coffee flanker"),
      p(
        "Khamrah with an Arabic-coffee twist. See ",
        link("Khamrah vs Khamrah Qahwa", J.b2),
        " to pick your winter signature."
      ),
      h3("Beyond Khamrah"),
      p(
        "Vanilla-and-coffee lovers should read ",
        link("the best vanilla-coffee fragrances for winter", J.b3),
        "."
      ),
      h2("Sample before the bottle"),
      p(
        "Gourmands are polarizing and sweet — always test on skin. A ",
        link("discovery kit", KIT),
        " is the safest way in."
      ),
    ],
  },
  {
    handle: "lattafa-khamrah-review-angels-share-alternative",
    title:
      "Lattafa Khamrah & Khamrah Qahwa: The Boozy Kilian Angels' Share Alternative, Reviewed on Skin",
    excerpt:
      "We wore Lattafa Khamrah and Qahwa for 8 hours against Kilian's Angels' Share. The boozy date-and-vanilla verdict — plus how to sample both first.",
    readingTime: 10,
    tags: ["Dupes", "Gourmand", "Reviews"],
    publishedAt: "2025-04-15T09:00:00Z",
    seoTitle: "Lattafa Khamrah Review: The Kilian Angels' Share Alternative",
    seoDescription:
      "We wore Lattafa Khamrah & Qahwa for 8 hours vs Kilian Angels' Share. Boozy dates, cinnamon & vanilla — the honest verdict. Sample both first.",
    relatedArticleHandles: [
      "best-boozy-gourmand-fragrances-inspired-by-kilian",
      "khamrah-vs-khamrah-qahwa-which-is-better",
      "best-vanilla-coffee-fragrances-for-winter",
    ],
    body: [
      p(
        b("The 10-second verdict: "),
        "Khamrah is a boozy, spicy date-gourmand that captures 80–85% of Kilian Angels' Share for a fraction of the price — cozier and more cinnamon-forward, ideal for cold weather. Best for autumn/winter evenings."
      ),
      p(
        i(
          "Tested on skin over 8 hours, cool evening (~18°C), 4 sprays, against a batch-verified Angels' Share sample on the opposite arm."
        )
      ),
      h2("Is Lattafa Khamrah really like Kilian Angels' Share?"),
      h3("What Angels' Share smells like"),
      p(
        "Kilian's original is a smooth cognac-and-oak gourmand: boozy, refined, praline-sweet, with cinnamon and tonka. Polished and expensive-smelling."
      ),
      h3("Where Khamrah matches — and diverges"),
      p(
        "Khamrah shares the cinnamon–praline–vanilla spine but swaps oak-cognac for dates and adds a smoky akigalawood base. It's spicier and sweeter; Angels' Share is smoother and boozier. Same genre, slightly different accent."
      ),
      h2("Khamrah on skin: the full fragrance pyramid"),
      p(
        "Lattafa Khamrah opens with a spicy cinnamon-nutmeg top, settles into a boozy heart of dates, praline and cognac, and dries down to vanilla, tonka and smoky akigalawood — total longevity 8–10 hours."
      ),
      h3("Top notes (0–30 min): fades fast"),
      ul("Cinnamon", "Nutmeg", "Bergamot"),
      h3("Heart notes (30 min–2 hrs): the signature"),
      ul("Dates", "Praline", "Tuberose", "Cognac accord"),
      h3("Base notes (2–10 hrs): the longevity"),
      ul("Vanilla", "Tonka", "Benzoin", "Myrrh", "Akigalawood"),
      p(
        i(
          "Light top notes lift off first; the heavy base resins linger longest."
        )
      ),
      h2("Khamrah vs Khamrah Qahwa: which should you buy?"),
      p(
        "Qahwa adds Arabic coffee and extra sweetness — gourmand-lovers often prefer it. Full split in ",
        link("Khamrah vs Khamrah Qahwa", J.b2),
        "."
      ),
      h2("Performance"),
      p(
        "Longevity 8–10 hours; strong 3-hour projection; a comforting skin scent thereafter. A cold-weather powerhouse; too heavy for summer daytime."
      ),
      h2("Pros & cons"),
      ul(
        "Pros: outstanding value, cozy, long-lasting, crowd-pleasing.",
        "Cons: very sweet, cinnamon can feel sharp early, not office-safe in heat."
      ),
      h2("Who should buy Khamrah (and who should skip)"),
      p(
        "Buy if you love sweet, spicy, boozy gourmands for cold weather. Skip if you dislike sweetness or need a light daytime scent."
      ),
      h2("How to try it risk-free"),
      p(
        "Test it (and Qahwa) from our ",
        link("discovery kit", KIT),
        " before a full bottle, or browse the whole ",
        link("Boozy Gourmands collection", C.gourmand),
        ". New to the category? Start with the ",
        link("boozy gourmands guide", J.hubB),
        "."
      ),
      h2("FAQ"),
      p(
        b("Does Khamrah smell cheap? "),
        "No — the date-vanilla base reads richer than its price. ",
        b("How many sprays? "),
        "3–4; it's potent. ",
        b("Is it unisex? "),
        "Yes, leaning slightly masculine-sweet."
      ),
    ],
  },
  {
    handle: "khamrah-vs-khamrah-qahwa-which-is-better",
    title: "Khamrah vs Khamrah Qahwa: Which One Is Actually Better?",
    excerpt:
      "Same DNA, one big difference: coffee. We tested both to help you pick your winter signature.",
    readingTime: 6,
    tags: ["Gourmand", "Reviews"],
    publishedAt: "2025-04-22T09:00:00Z",
    seoTitle: "Khamrah vs Khamrah Qahwa: Which Is Better?",
    seoDescription:
      "Khamrah or Khamrah Qahwa? The coffee twist explained, tested on skin — spicy-date vs sweet-coffee. Pick your winter signature.",
    relatedArticleHandles: [
      "lattafa-khamrah-review-angels-share-alternative",
      "best-boozy-gourmand-fragrances-inspired-by-kilian",
    ],
    body: [
      p(
        b("Verdict: "),
        "Choose original Khamrah for the spicy cinnamon-date profile; choose Qahwa if you want a sweeter, coffee-forward, more dessert-like twist."
      ),
      h2("The one real difference"),
      p(
        "Qahwa (Arabic for coffee) layers roasted coffee and extra sugar over the Khamrah base. The cinnamon steps back; the drydown is creamier and more gourmand."
      ),
      h2("Side by side"),
      ul(
        "Original: spicier, drier, more boozy-date.",
        "Qahwa: sweeter, coffee-and-vanilla, more crowd-pleasing.",
        "Both last 8–10 hours."
      ),
      h2("Which to buy"),
      p(
        "Love spice and booze → original. Love coffee and dessert → Qahwa. Undecided? Bundle both in a ",
        link("discovery kit", KIT),
        ". Both sit in the ",
        link("Boozy Gourmands collection", C.gourmand),
        ", and the deep dive lives in our ",
        link("Khamrah review", J.b1),
        "."
      ),
    ],
  },
  {
    handle: "best-vanilla-coffee-fragrances-for-winter",
    title: "The Best Vanilla & Coffee Fragrances for Winter",
    excerpt:
      "Warm, edible, and comforting — the coffee-vanilla gourmands that own cold weather, ranked by an on-skin tester.",
    readingTime: 7,
    tags: ["Gourmand", "Guides"],
    publishedAt: "2025-04-29T09:00:00Z",
    seoTitle: "Best Vanilla & Coffee Fragrances for Winter (2025)",
    seoDescription:
      "Warm, edible, comforting. The best coffee-vanilla gourmand fragrances for cold weather, tested on skin — led by Khamrah Qahwa.",
    relatedArticleHandles: [
      "best-boozy-gourmand-fragrances-inspired-by-kilian",
      "khamrah-vs-khamrah-qahwa-which-is-better",
    ],
    body: [
      p(
        "When the temperature drops, sweet-warm gourmands finally make sense — the cold holds them close and the sweetness reads cozy rather than cloying. Here are the coffee-and-vanilla picks worth your winter."
      ),
      h2("Why coffee and vanilla work in the cold"),
      p(
        "Coffee adds a bitter-roasted edge that keeps vanilla from turning sickly; vanilla and tonka give the warmth that projects in cold air. Together they're the definitive winter comfort accord."
      ),
      h2("The picks"),
      h3("Khamrah Qahwa — coffee-forward gourmand"),
      p(
        "The obvious champion. See ",
        link("how it compares to original Khamrah", J.b2),
        "."
      ),
      h3("Sweet-vanilla alternatives"),
      p(
        "For a creamier, dessert-milk direction, browse the wider ",
        link("Boozy Gourmands collection", C.gourmand),
        "."
      ),
      h2("How to wear them"),
      p(
        "Two to three sprays on clothing to extend longevity; save for evenings and cold days. Test first with a ",
        link("discovery kit", KIT),
        ", and read the full ",
        link("boozy gourmands guide", J.hubB),
        "."
      ),
    ],
  },

  // ───────── HUB C ─────────
  {
    handle: "best-oud-fragrances-inspired-by-niche-houses",
    title: "Dark Woods & Smoked Ouds: Affordable Oud Inspired by Niche Houses",
    excerpt:
      "Saffron, agarwood, and ash — the smoky Arabian oud accord that answers €200 niche bottles for a fraction of the price.",
    readingTime: 9,
    tags: ["Dupes", "Oud", "Guides"],
    publishedAt: "2025-05-06T09:00:00Z",
    seoTitle: "Best Affordable Oud Fragrances Inspired by Niche Houses (2025)",
    seoDescription:
      "Saffron, agarwood, and smoky woods. The best affordable oud inspired by Initio Oud for Greatness — Lattafa Oud for Glory & more.",
    relatedArticleHandles: [
      "lattafa-oud-for-glory-vs-initio-oud-for-greatness",
      "badee-al-oud-sublime-amber-oud-differences",
      "how-to-wear-smoky-oud-without-smelling-like-incense",
    ],
    body: [
      p(
        "Niche houses like Initio made smoky, saffron-laced oud a status scent. But oud is Arabia's native language, and Dubai's houses render it convincingly for a fraction of the cost. Shop the category in the ",
        link("Smoked Ouds collection", C.oud),
        "."
      ),
      h2("What smoked oud actually is"),
      p(
        "A saffron-and-nutmeg opening, a resinous agarwood (oud) and patchouli heart, and a smoky woods-and-musk base. The best ones balance the smoke so it reads refined, not like burnt incense."
      ),
      h2("The lineup"),
      h3("Lattafa Oud for Glory (Bade'e Al Oud) — the Initio tribute"),
      p(
        "The saffron-oud powerhouse compared directly in our ",
        link("Oud for Glory vs Initio Oud for Greatness", J.c1),
        " test."
      ),
      h3("The Bade'e Al Oud range"),
      p(
        "Sublime, Amber, Oud — three directions of one idea, untangled in ",
        link("the Bade'e Al Oud comparison", J.c2),
        "."
      ),
      h3("New to oud?"),
      p(
        "Start with ",
        link("how to wear smoky oud without smelling like incense", J.c3),
        "."
      ),
      h2("Sample first — oud is personal"),
      p(
        "Oud reacts strongly to skin chemistry. A ",
        link("discovery kit", KIT),
        " is the smart way to test before a full bottle."
      ),
    ],
  },
  {
    handle: "lattafa-oud-for-glory-vs-initio-oud-for-greatness",
    title: "Lattafa Oud for Glory vs Initio Oud for Greatness: On-Skin Test",
    excerpt:
      "The saffron-oud tribute that fooled the forums, tested against the €200 niche original. How close does it get?",
    readingTime: 8,
    tags: ["Dupes", "Oud", "Reviews"],
    publishedAt: "2025-05-13T09:00:00Z",
    seoTitle: "Oud for Glory vs Initio Oud for Greatness (On-Skin Test)",
    seoDescription:
      "Saffron, agarwood, and smoke. Our on-skin test of Lattafa Oud for Glory vs Initio Oud for Greatness — how close is the tribute?",
    relatedArticleHandles: [
      "best-oud-fragrances-inspired-by-niche-houses",
      "badee-al-oud-sublime-amber-oud-differences",
    ],
    body: [
      p(
        b("Verdict: "),
        "Oud for Glory (aka Bade'e Al Oud Oud for Glory) is a remarkably close tribute to Initio Oud for Greatness — same saffron-oud-smoke idea, slightly less refined but 90% of the effect for a tenth of the price."
      ),
      p(i("Tested on skin, 10 hours, against a verified Oud for Greatness sample.")),
      h2("The scent, top to base"),
      p(
        "Opens with a big saffron-and-nutmeg blast — almost identical to the Initio. The heart is resinous agarwood and patchouli; the base is smoky woods and musk with a slightly sweeter, more animalic edge than the original."
      ),
      h2("Where the niche original wins"),
      p(
        "Oud for Greatness has cleaner smoke and a more transparent, expensive texture. Oud for Glory is a touch louder and rougher — noticeable side by side, invisible in daily wear."
      ),
      h2("Performance"),
      p("10–12 hours, strong projection. A genuine beast."),
      h2("Buy it"),
      p(
        "It leads our ",
        link("Smoked Ouds collection", C.oud),
        ". See the sibling scents in ",
        link("the Bade'e Al Oud comparison", J.c2),
        ", and test it via a ",
        link("discovery kit", KIT),
        " before committing. Full context in the ",
        link("smoked ouds guide", J.hubC),
        "."
      ),
    ],
  },
  {
    handle: "badee-al-oud-sublime-amber-oud-differences",
    title: "Bade'e Al Oud: Sublime vs Amber vs Oud — What's the Difference?",
    excerpt:
      "Lattafa's Bade'e Al Oud range explained — three directions of one smoky-oud idea, and which one is for you.",
    readingTime: 6,
    tags: ["Oud", "Guides"],
    publishedAt: "2025-05-20T09:00:00Z",
    seoTitle: "Bade'e Al Oud: Sublime vs Amber vs Oud for Glory Explained",
    seoDescription:
      "Confused by the Bade'e Al Oud range? Sublime vs Amber vs Oud for Glory, tested on skin — which smoky oud is for you.",
    relatedArticleHandles: [
      "best-oud-fragrances-inspired-by-niche-houses",
      "lattafa-oud-for-glory-vs-initio-oud-for-greatness",
    ],
    body: [
      p(
        "The Bade'e Al Oud line confuses buyers because the flankers smell quite different. Here's the quick, tested breakdown."
      ),
      h2("Bade'e Al Oud Sublime"),
      p(
        "The fruity-smoky crowd-pleaser: raspberry and saffron over smoky woods. The most versatile and beginner-friendly."
      ),
      h2("Bade'e Al Oud Amber"),
      p("Warmer and sweeter — amber and resins soften the oud. Best for cold weather."),
      h2("Bade'e Al Oud (Oud for Glory)"),
      p(
        "The purest saffron-oud beast, and the Initio tribute — detailed in ",
        link("Oud for Glory vs Initio", J.c1),
        "."
      ),
      h2("Which to pick"),
      ul(
        "Versatile → Sublime.",
        "Cozy/sweet → Amber.",
        "Maximum smoky oud → Oud for Glory."
      ),
      p(
        "All three are in the ",
        link("Smoked Ouds collection", C.oud),
        "; sample the range with a ",
        link("discovery kit", KIT),
        ". More in the ",
        link("smoked ouds guide", J.hubC),
        "."
      ),
    ],
  },
  {
    handle: "how-to-wear-smoky-oud-without-smelling-like-incense",
    title: "How to Wear Smoky Oud Without Smelling Like Incense",
    excerpt:
      "Oud is easy to over-apply. A beginner's guide to spraying, seasons, and pairings so you smell refined, not overwhelming.",
    readingTime: 6,
    tags: ["Oud", "Guides"],
    publishedAt: "2025-05-27T09:00:00Z",
    seoTitle: "How to Wear Smoky Oud Without Smelling Like Incense",
    seoDescription:
      "Oud too strong? A beginner's guide to sprays, seasons, and pairings so you wear smoky oud refined, not overwhelming.",
    relatedArticleHandles: [
      "best-oud-fragrances-inspired-by-niche-houses",
      "badee-al-oud-sublime-amber-oud-differences",
    ],
    body: [
      p(
        "Oud's biggest problem isn't the scent — it's the application. Most oud-is-too-much complaints come from over-spraying a potent extrait. Here's how to wear it well."
      ),
      h2("Spray less than you think"),
      p("One to two sprays of a smoky oud projects for hours. Start low; oud grows on skin."),
      h2("Mind the season and setting"),
      p(
        "Smoky ouds shine in cool weather and evenings. In heat or tight indoor spaces, scale back to a single spray or choose a fresher option from our ",
        link("Beast-Mode Freshies collection", C.fresh),
        "."
      ),
      h2("Start with a versatile oud"),
      p(
        "Beginners should avoid the heaviest extraits first. A fruity-smoky option like Bade'e Al Oud Sublime — see ",
        link("the Bade'e Al Oud comparison", J.c2),
        " — is an easier entry than a pure saffron-oud beast."
      ),
      h2("Build your nose with samples"),
      p(
        "Learn the category cheaply: a ",
        link("discovery kit", KIT),
        " lets you test several ouds before committing. Then dive into the full ",
        link("smoked ouds guide", J.hubC),
        "."
      ),
    ],
  },
];

// Smart collections (native Shopify Collections, not metaobjects).
const collections = [
  {
    handle: "beast-mode-freshies",
    title: "Beast-Mode Freshies",
    tag: "Freshie",
    descriptionHtml:
      "<p>Pineapple, blackcurrant, and birch smoke over ambergris — the fresh-but-loud signature made famous by Creed Aventus, in Dubai's most convincing tributes.</p>",
    seoTitle:
      "Beast-Mode Freshies — Fresh Fruity Fragrances Inspired by Aventus",
    seoDescription:
      "Pineapple, birch smoke, and ambergris. The best long-lasting fresh fragrances inspired by Creed Aventus.",
  },
  {
    handle: "boozy-gourmands",
    title: "Boozy Gourmands",
    tag: "Gourmand",
    descriptionHtml:
      "<p>Rich dessert orientals with a boozy edge — cinnamon and dates over vanilla, tonka, and akigalawood. Dubai's answer to niche Kilian.</p>",
    seoTitle: "Boozy Gourmands — Date & Cognac Fragrances Inspired by Kilian",
    seoDescription:
      "Cinnamon, dates, praline, and vanilla. The best boozy gourmand fragrances inspired by Kilian Angels' Share.",
  },
  {
    handle: "smoked-ouds",
    title: "Smoked Ouds",
    tag: "Oud",
    descriptionHtml:
      "<p>Dark, smoky agarwood tuned the Arabian way — saffron and nutmeg over resinous oud and woods. Affordable answers to niche houses.</p>",
    seoTitle: "Smoked Ouds — Affordable Oud Fragrances Inspired by Niche Houses",
    seoDescription:
      "Saffron, agarwood, and smoky woods. The best affordable oud fragrances inspired by Initio Oud for Greatness.",
  },
  {
    handle: "sauvage-elixir-alternatives",
    title: "Sauvage Elixir Alternatives",
    tag: "Elixir",
    descriptionHtml:
      "<p>Grapefruit, cinnamon, and black pepper over amberwood and vanilla — the spicy-amber signature of Dior Sauvage Elixir, re-tuned.</p>",
    seoTitle: "Sauvage Elixir Alternatives — Spicy Amber Fragrances Like Dior",
    seoDescription:
      "Cinnamon, cardamom, and amberwood. The best affordable alternatives to Dior Sauvage Elixir.",
  },
];

// ── GraphQL plumbing ──────────────────────────────────────────────────────────
async function gql(query, variables) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors, null, 2));
  return json.data;
}

const CREATE = /* GraphQL */ `
  mutation Create($metaobject: MetaobjectCreateInput!) {
    metaobjectCreate(metaobject: $metaobject) {
      metaobject { id handle type }
      userErrors { field message code }
    }
  }`;

const UPDATE = /* GraphQL */ `
  mutation Update($id: ID!, $metaobject: MetaobjectUpdateInput!) {
    metaobjectUpdate(id: $id, metaobject: $metaobject) {
      metaobject { id handle }
      userErrors { field message code }
    }
  }`;

const COLLECTION_CREATE = /* GraphQL */ `
  mutation CollectionCreate($input: CollectionInput!) {
    collectionCreate(input: $input) {
      collection { id handle }
      userErrors { field message }
    }
  }`;

const withStatus = (fields) =>
  PUBLISHABLE
    ? { capabilities: { publishable: { status: "ACTIVE" } }, fields }
    : { fields };

async function createMetaobject(type, handle, fields) {
  if (DRY_RUN) {
    console.log(`  [dry-run] create ${type} "${handle}"`);
    return `gid://dry-run/${type}/${handle}`;
  }
  const data = await gql(CREATE, {
    metaobject: { type, handle, ...withStatus(fields) },
  });
  const r = data.metaobjectCreate;
  if (r.userErrors?.length) {
    console.warn(`  ! ${handle}: ${r.userErrors.map((e) => e.message).join("; ")}`);
    return null;
  }
  console.log(`  ✓ ${type} "${r.metaobject.handle}"`);
  return r.metaobject.id;
}

// ── Run ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(
    `${DRY_RUN ? "DRY RUN — " : ""}Importing to ${STORE || "(no store)"} @ ${API_VERSION}\n`
  );

  // 1) Author
  console.log("Author:");
  const authorId = await createMetaobject("nv_journal_author", "nadia-karim", [
    { key: "name", value: author.name },
    { key: "role", value: author.role },
    { key: "bio", value: author.bio },
  ]);

  // 2) Articles (pass 1 — everything except related_articles)
  console.log("\nArticles:");
  const handleToId = {};
  for (const a of articles) {
    const fields = [
      { key: "title", value: a.title },
      { key: "excerpt", value: a.excerpt },
      { key: "reading_time", value: String(a.readingTime) },
      { key: "tags", value: JSON.stringify(a.tags) },
      { key: "body", value: richText(a.body) },
      { key: "published_at", value: a.publishedAt },
      { key: "seo_title", value: a.seoTitle },
      { key: "seo_description", value: a.seoDescription },
    ];
    if (authorId) fields.push({ key: "author", value: authorId });
    const id = await createMetaobject("nv_journal_article", a.handle, fields);
    if (id) handleToId[a.handle] = id;
  }

  // 3) Articles (pass 2 — wire related_articles now that GIDs exist)
  console.log("\nLinking related articles:");
  for (const a of articles) {
    const id = handleToId[a.handle];
    if (!id) continue;
    const relIds = a.relatedArticleHandles
      .map((h) => handleToId[h])
      .filter(Boolean);
    if (!relIds.length) continue;
    if (DRY_RUN) {
      console.log(`  [dry-run] link ${a.handle} → ${relIds.length} articles`);
      continue;
    }
    const data = await gql(UPDATE, {
      id,
      metaobject: {
        fields: [{ key: "related_articles", value: JSON.stringify(relIds) }],
      },
    });
    const errs = data.metaobjectUpdate.userErrors;
    console.log(
      errs?.length
        ? `  ! ${a.handle}: ${errs.map((e) => e.message).join("; ")}`
        : `  ✓ ${a.handle} → ${relIds.length} related`
    );
  }

  // 4) Smart collections
  if (DO_COLLECTIONS) {
    console.log("\nCollections:");
    for (const c of collections) {
      if (DRY_RUN) {
        console.log(`  [dry-run] smart collection "${c.handle}" (tag=${c.tag})`);
        continue;
      }
      const data = await gql(COLLECTION_CREATE, {
        input: {
          handle: c.handle,
          title: c.title,
          descriptionHtml: c.descriptionHtml,
          seo: { title: c.seoTitle, description: c.seoDescription },
          ruleSet: {
            appliedDisjunctively: false,
            rules: [{ column: "TAG", relation: "EQUALS", condition: c.tag }],
          },
        },
      });
      const r = data.collectionCreate;
      console.log(
        r.userErrors?.length
          ? `  ! ${c.handle}: ${r.userErrors.map((e) => e.message).join("; ")}`
          : `  ✓ collection "${r.collection.handle}" (tag=${c.tag})`
      );
    }
  }

  console.log(
    `\nDone.${
      DRY_RUN
        ? " (dry run — nothing written)"
        : " Trigger a redeploy or hit /api/revalidate to surface the new content."
    }`
  );
}

// Minimal .env.local loader (no dependency) so the script can pick up local vars.
function loadDotEnvLocal() {
  try {
    for (const file of [".env.local", ".env"]) {
      if (!existsSync(file)) continue;
      for (const line of readFileSync(file, "utf8").split("\n")) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
        if (m && !process.env[m[1]]) {
          process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
        }
      }
    }
  } catch {
    /* ignore */
  }
}

main().catch((e) => {
  console.error("\nFailed:", e.message);
  process.exit(1);
});
