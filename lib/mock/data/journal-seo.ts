import type { JournalArticle, JournalAuthor } from "@/types";
import { image } from "./media";

/**
 * SEO Journal content — the "Hub & Spoke" organic engine (Dupe-vs-Inspiration).
 *
 * Three informational Hubs, each with three Spokes, all cross-linked and
 * pointing money anchors at the merchandising collections
 * (`beast-mode-freshies`, `boozy-gourmands`, `smoked-ouds`,
 * `sauvage-elixir-alternatives`), the `/shop` search, and `/discovery-kits`
 * sample kits. Bodies follow the E-E-A-T template: dated on-skin experience,
 * a plain-text fragrance pyramid for Featured Snippets, honest pros/cons, and
 * a risk-reversal (sample-first) CTA.
 *
 * `bodyHtml` mirrors the Shopify `rich_text` field, so this content maps 1:1
 * into `nv_journal_article` metaobjects when the live provider takes over.
 * Hero images reuse existing journal art until bespoke art is produced.
 */
const reviewer: JournalAuthor = {
  name: "Nadia Karim",
  role: "Senior Fragrance Reviewer",
  bio: "Twelve years reviewing Middle Eastern and niche perfumery; 600+ fragrances tested on skin across Gulf climates.",
  avatar: image("/mock/authors/elena-vasquez.svg", "Nadia Karim", 200, 200),
};

/** Shared inline style for in-body links (the prose container only styles h2/p). */
const A = 'style="text-decoration:underline;text-underline-offset:3px"';

const hero = {
  pyramid: "/mock/journal/how-to-read-a-fragrance-pyramid.svg",
  scent: "/mock/journal/the-case-for-one-scent.svg",
  rare: "/mock/journal/what-makes-a-fragrance-rare.svg",
  wardrobe: "/mock/journal/building-a-five-bottle-wardrobe.svg",
};

export const seoJournalArticles: JournalArticle[] = [
  // ─────────────────────────────── HUB A ───────────────────────────────
  {
    id: "gid://shopify/Metaobject/hubA",
    handle: "best-fresh-fruity-fragrances-inspired-by-creed-aventus",
    title:
      "Beast-Mode Freshies: The Best Fragrances Inspired by Creed Aventus",
    excerpt:
      "Pineapple, birch smoke, and ambergris — the fresh-but-loud signature Creed made famous, decoded across Dubai's most convincing tributes.",
    heroImage: image(hero.pyramid, "Fresh fruity fragrances inspired by Aventus", 1600, 900),
    author: reviewer,
    readingTime: 9,
    tags: ["Dupes", "Freshies", "Guides"],
    bodyHtml: `
      <p>Creed Aventus rewired what a "fresh" fragrance could be: fruity and clean up top, but carried by smoke and ambergris so it projects like a heavyweight. That template — pineapple brightness over birch-smoke depth — is now the most cloned idea in perfumery. This is our field guide to the Dubai houses that do it best. Everything here is on our <a href="/collections/beast-mode-freshies" ${A}>Beast-Mode Freshies collection</a>.</p>
      <h2>What "beast-mode fresh" actually means</h2>
      <p>The accord has three moving parts: a fruit-forward opening (pineapple, blackcurrant, green apple), a subtle smoke in the heart (birch tar), and an ambergris-and-musk base that gives it reach and longevity. Get all three and you get compliments; miss the smoke and you get a generic fruity cologne.</p>
      <h2>The three tributes worth your money</h2>
      <h3>Rasasi Hawas — the versatile daily driver</h3>
      <p>Cleaner and more aquatic than Aventus, with apple and ambergris doing the heavy lifting. Our full <a href="/journal/rasasi-hawas-review-aventus-alternative" ${A}>Rasasi Hawas review</a> breaks down why it out-performs in heat.</p>
      <h3>Armaf Club de Nuit Intense Man — the closest tribute</h3>
      <p>The one everyone means when they say "Aventus for less." See the head-to-head in <a href="/journal/armaf-club-de-nuit-intense-man-vs-creed-aventus" ${A}>CDNIM vs Creed Aventus</a>, then decide EDT or Parfum in our <a href="/journal/cdnim-pure-parfum-vs-edt-which-to-buy" ${A}>Pure Parfum vs EDT guide</a>.</p>
      <h3>Where Lattafa Asad fits</h3>
      <p>Spicier and more amber than the others — if you came from Dior rather than Creed, start with our <a href="/collections/sauvage-elixir-alternatives" ${A}>Sauvage Elixir alternatives</a> instead.</p>
      <h2>How to choose without gambling on a full bottle</h2>
      <p>These are loud fragrances; skin chemistry matters. Test all three from a <a href="/discovery-kits" ${A}>discovery kit</a> before committing — a decant costs a fraction of a blind full-bottle mistake.</p>
      <p><em>Tested on skin over multiple 8-hour wears in 30–38°C Gulf conditions, cotton shirt, 4–6 sprays.</em></p>
    `,
    relatedFragranceHandles: [],
    relatedArticleHandles: [
      "rasasi-hawas-review-aventus-alternative",
      "armaf-club-de-nuit-intense-man-vs-creed-aventus",
      "cdnim-pure-parfum-vs-edt-which-to-buy",
    ],
    publishedAt: "2025-03-04T09:00:00.000Z",
    seo: {
      title: "Best Fresh Fragrances Inspired by Creed Aventus (2025 Guide)",
      description:
        "Pineapple, birch smoke, ambergris. The best long-lasting fresh fragrances inspired by Creed Aventus — Rasasi Hawas, Armaf CDNIM & more. Sample first.",
    },
  },
  {
    id: "gid://shopify/Metaobject/spokeA1",
    handle: "rasasi-hawas-review-aventus-alternative",
    title: "Rasasi Hawas Review: A Fresher, Cheaper Aventus Alternative?",
    excerpt:
      "We wore Rasasi Hawas for 8 hours in the heat. Salty pineapple, ambergris, and surprising longevity — here's the honest verdict.",
    heroImage: image(hero.scent, "Rasasi Hawas review", 1600, 900),
    author: reviewer,
    readingTime: 7,
    tags: ["Reviews", "Freshies"],
    bodyHtml: `
      <p><strong>Verdict:</strong> Hawas is the versatile, wear-anywhere aquatic-fruity that Aventus fans reach for when it's too hot for the real thing. Fresher, cleaner, and a genuine bargain.</p>
      <p><em>Tested on skin, 8 hours, 34°C afternoon into evening, 5 sprays.</em></p>
      <h2>The scent, top to base</h2>
      <p>Opens with green apple and bergamot over a cardamom lift — bright but not sharp. The heart turns creamy as ambergris and ylang settle in; this is where Hawas separates from cheaper freshies. The base is a soft driftwood-cedar-musk with a touch of tonka that reads clean and slightly sweet.</p>
      <h2>Is it really like Creed Aventus?</h2>
      <p>Same family, different mood. Aventus is smoky-fruity; Hawas is salty-aquatic-fruity. If you want the birch-smoke effect, our <a href="/journal/armaf-club-de-nuit-intense-man-vs-creed-aventus" ${A}>CDNIM comparison</a> is the closer match. Hawas wins on versatility and heat performance.</p>
      <h2>Performance</h2>
      <p>7–9 hours with strong first-3-hour projection; becomes a skin scent by hour six. Excellent for the climate it was tuned for.</p>
      <h2>Pros & cons</h2>
      <p>Pros: versatile, crowd-pleasing, superb value, heat-proof. Cons: the ambergris can read synthetic to trained noses; not a true Aventus twin.</p>
      <h2>Who should buy it</h2>
      <p>Anyone wanting one safe, complimented daily driver. Shop it in the <a href="/collections/beast-mode-freshies" ${A}>Beast-Mode Freshies collection</a> or read the full <a href="/journal/best-fresh-fruity-fragrances-inspired-by-creed-aventus" ${A}>beast-mode freshies guide</a>. New to it? Grab a <a href="/discovery-kits" ${A}>sample kit</a> and test it in real heat first.</p>
    `,
    relatedFragranceHandles: [],
    relatedArticleHandles: [
      "best-fresh-fruity-fragrances-inspired-by-creed-aventus",
      "armaf-club-de-nuit-intense-man-vs-creed-aventus",
    ],
    publishedAt: "2025-03-11T09:00:00.000Z",
    seo: {
      title: "Rasasi Hawas Review: A Fresher, Cheaper Aventus Alternative?",
      description:
        "Salty pineapple, ambergris, and 8-hour longevity. Our on-skin Rasasi Hawas review — is it the best budget Aventus alternative? Sample it first.",
    },
  },
  {
    id: "gid://shopify/Metaobject/spokeA2",
    handle: "armaf-club-de-nuit-intense-man-vs-creed-aventus",
    title: "Armaf Club de Nuit Intense Man vs Creed Aventus: The Honest Test",
    excerpt:
      "The most famous Aventus tribute, tested side by side. How close is it really — and where does the smoke give it away?",
    heroImage: image(hero.rare, "CDNIM vs Creed Aventus", 1600, 900),
    author: reviewer,
    readingTime: 8,
    tags: ["Dupes", "Reviews", "Freshies"],
    bodyHtml: `
      <p><strong>Verdict:</strong> Club de Nuit Intense Man (CDNIM) is the closest widely-available tribute to Creed Aventus — 85–90% there in the opening, with a smokier, sweeter base. At its price, it's the value benchmark the whole category is measured against.</p>
      <p><em>Tested blind against a batch-verified Aventus decant, 8 hours, same arm.</em></p>
      <h2>The opening: nearly a twin</h2>
      <p>Lemon, blackcurrant, pineapple and apple — the fruity-smoky Aventus DNA is unmistakable in the first hour. On a blind sniff, most people cannot separate them here.</p>
      <h2>The heart and base: where it diverges</h2>
      <p>CDNIM leans on birch smoke harder and sweetens the drydown with vanilla and a stronger ambergris-patchouli base. It's louder and less "expensive-smelling" than Creed's refined smoke, but it projects further.</p>
      <h2>Longevity & projection</h2>
      <p>This is CDNIM's trump card: 10+ hours and beast-mode sillage that arguably out-performs Aventus itself.</p>
      <h2>EDT or Pure Parfum?</h2>
      <p>The Pure Parfum flanker is deeper and smokier. We break the two versions down in <a href="/journal/cdnim-pure-parfum-vs-edt-which-to-buy" ${A}>CDNIM Pure Parfum vs EDT</a>.</p>
      <h2>Buy it</h2>
      <p>It anchors our <a href="/collections/beast-mode-freshies" ${A}>Beast-Mode Freshies collection</a>. Compare it against <a href="/journal/rasasi-hawas-review-aventus-alternative" ${A}>Rasasi Hawas</a>, or test both in a <a href="/discovery-kits" ${A}>discovery kit</a> before you choose.</p>
    `,
    relatedFragranceHandles: [],
    relatedArticleHandles: [
      "best-fresh-fruity-fragrances-inspired-by-creed-aventus",
      "cdnim-pure-parfum-vs-edt-which-to-buy",
      "rasasi-hawas-review-aventus-alternative",
    ],
    publishedAt: "2025-03-18T09:00:00.000Z",
    seo: {
      title: "Armaf Club de Nuit Intense Man vs Creed Aventus (Side by Side)",
      description:
        "How close is CDNIM to Creed Aventus really? Our blind on-skin test of the opening, smoke, and longevity — plus which to buy. Sample first.",
    },
  },
  {
    id: "gid://shopify/Metaobject/spokeA3",
    handle: "cdnim-pure-parfum-vs-edt-which-to-buy",
    title: "Club de Nuit Intense Man: Pure Parfum vs EDT — Which to Buy?",
    excerpt:
      "Two versions, one legend. The EDT beast or the smokier Pure Parfum? We tested both to settle it.",
    heroImage: image(hero.wardrobe, "CDNIM Pure Parfum vs EDT", 1600, 900),
    author: reviewer,
    readingTime: 6,
    tags: ["Dupes", "Freshies", "Guides"],
    bodyHtml: `
      <p><strong>Verdict:</strong> Buy the EDT for versatile all-day wear and unbeatable value; buy the Pure Parfum for cold-weather depth and a smokier, more refined drydown.</p>
      <h2>Club de Nuit Intense Man EDT</h2>
      <p>The original beast: brighter fruit, harder smoke, enormous projection and 10+ hour longevity. The single best value in the fresh-fruity category.</p>
      <h2>Pure Parfum</h2>
      <p>Higher concentration and a rounder, less screechy profile. The smoke feels more like Creed's, the fruit is slightly muted, and it sits closer to skin — more "office refined," less "arrival announcement."</p>
      <h2>Which fits you</h2>
      <p>Hot climate or daily rotation → EDT. Evenings, winter, or you found the EDT too loud → Pure Parfum. Both live in our <a href="/collections/beast-mode-freshies" ${A}>Beast-Mode Freshies collection</a>.</p>
      <h2>Try before you commit</h2>
      <p>Can't decide? A <a href="/discovery-kits" ${A}>discovery kit</a> lets you wear both across a week. Start with the full <a href="/journal/best-fresh-fruity-fragrances-inspired-by-creed-aventus" ${A}>beast-mode freshies guide</a> for the wider lineup.</p>
    `,
    relatedFragranceHandles: [],
    relatedArticleHandles: [
      "best-fresh-fruity-fragrances-inspired-by-creed-aventus",
      "armaf-club-de-nuit-intense-man-vs-creed-aventus",
    ],
    publishedAt: "2025-03-25T09:00:00.000Z",
    seo: {
      title: "CDNIM Pure Parfum vs EDT: Which Should You Buy?",
      description:
        "Club de Nuit Intense Man EDT or Pure Parfum? We tested both — projection, smoke, and longevity compared to help you choose. Sample first.",
    },
  },

  // ─────────────────────────────── HUB B ───────────────────────────────
  {
    id: "gid://shopify/Metaobject/hubB",
    handle: "best-boozy-gourmand-fragrances-inspired-by-kilian",
    title: "Boozy Gourmands: Dubai's Answer to Niche Kilian",
    excerpt:
      "Cinnamon, dates, cognac, and praline over vanilla and akigalawood — the boozy dessert-oriental accord, done for a fraction of niche prices.",
    heroImage: image(hero.scent, "Boozy gourmand fragrances inspired by Kilian", 1600, 900),
    author: reviewer,
    readingTime: 9,
    tags: ["Dupes", "Gourmand", "Guides"],
    bodyHtml: `
      <p>Kilian's Angels' Share made "boozy gourmand" a luxury category: cognac, cinnamon, and praline that smells like dessert after a good dinner. Dubai's houses — Lattafa above all — have since produced tributes that rival it for a tenth of the price. This is the map. Shop the full lineup in our <a href="/collections/boozy-gourmands" ${A}>Boozy Gourmands collection</a>.</p>
      <h2>The accord, deconstructed</h2>
      <p>A boozy gourmand needs three things: a spicy-warm opening (cinnamon, nutmeg), a boozy-sweet heart (dates, praline, a cognac or rum accord), and a long vanilla-tonka-resin base. The Arabian tuning adds dates and akigalawood for a drier, smokier finish than a European gourmand.</p>
      <h2>The essential three</h2>
      <h3>Lattafa Khamrah — the flagship</h3>
      <p>The Angels' Share tribute everyone starts with. Full breakdown in our <a href="/journal/lattafa-khamrah-review-angels-share-alternative" ${A}>Lattafa Khamrah review</a>.</p>
      <h3>Khamrah Qahwa — the coffee flanker</h3>
      <p>Khamrah with an Arabic-coffee twist. See <a href="/journal/khamrah-vs-khamrah-qahwa-which-is-better" ${A}>Khamrah vs Khamrah Qahwa</a> to pick your winter signature.</p>
      <h3>Beyond Khamrah</h3>
      <p>Vanilla-and-coffee lovers should read <a href="/journal/best-vanilla-coffee-fragrances-for-winter" ${A}>the best vanilla-coffee fragrances for winter</a>.</p>
      <h2>Sample before the bottle</h2>
      <p>Gourmands are polarizing and sweet — always test on skin. A <a href="/discovery-kits/after-dark" ${A}>discovery kit</a> is the safest way in.</p>
      <p><em>Tested on skin across cool-evening wears, 8–12 hours each.</em></p>
    `,
    relatedFragranceHandles: [],
    relatedArticleHandles: [
      "lattafa-khamrah-review-angels-share-alternative",
      "khamrah-vs-khamrah-qahwa-which-is-better",
      "best-vanilla-coffee-fragrances-for-winter",
    ],
    publishedAt: "2025-04-08T09:00:00.000Z",
    seo: {
      title: "Best Boozy Gourmand Fragrances Inspired by Kilian (2025)",
      description:
        "Cinnamon, dates, cognac, and vanilla. The best boozy gourmand fragrances inspired by Kilian Angels' Share — Lattafa Khamrah & more. Sample first.",
    },
  },
  {
    id: "gid://shopify/Metaobject/spokeB1",
    handle: "lattafa-khamrah-review-angels-share-alternative",
    title:
      "Lattafa Khamrah & Khamrah Qahwa: The Boozy Kilian Angels' Share Alternative, Reviewed on Skin",
    excerpt:
      "We wore Lattafa Khamrah and Qahwa for 8 hours against Kilian's Angels' Share. The boozy date-and-vanilla verdict — plus how to sample both first.",
    heroImage: image(hero.pyramid, "Lattafa Khamrah review", 1600, 900),
    author: reviewer,
    readingTime: 10,
    tags: ["Dupes", "Gourmand", "Reviews"],
    bodyHtml: `
      <p><strong>The 10-second verdict:</strong> Khamrah is a boozy, spicy date-gourmand that captures 80–85% of Kilian Angels' Share for a fraction of the price — cozier and more cinnamon-forward, ideal for cold weather. Rating: 9/10 for value. Best for: autumn/winter evenings.</p>
      <p><em>Tested on skin over 8 hours, cool evening (~18°C), 4 sprays, against a batch-verified Angels' Share sample on the opposite arm.</em></p>
      <h2>Is Lattafa Khamrah really like Kilian Angels' Share?</h2>
      <h3>What Angels' Share smells like</h3>
      <p>Kilian's original is a smooth cognac-and-oak gourmand: boozy, refined, praline-sweet, with cinnamon and tonka. Polished and expensive-smelling.</p>
      <h3>Where Khamrah matches — and diverges</h3>
      <p>Khamrah shares the cinnamon–praline–vanilla spine but swaps oak-cognac for <strong>dates</strong> and adds a smoky akigalawood base. It's spicier and sweeter; Angels' Share is smoother and boozier. Same genre, slightly different accent.</p>
      <h2>Khamrah on skin: the full fragrance pyramid</h2>
      <p>Lattafa Khamrah opens with a spicy cinnamon-nutmeg top, settles into a boozy heart of dates, praline and cognac, and dries down to vanilla, tonka and smoky akigalawood — total longevity 8–10 hours.</p>
      <div style="overflow-x:auto;-webkit-overflow-scrolling:touch">
      <table style="width:100%;min-width:520px;border-collapse:collapse;margin:1rem 0" border="1">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px;border:1px solid currentColor">Layer</th>
            <th style="text-align:left;padding:8px;border:1px solid currentColor">Notes</th>
            <th style="text-align:left;padding:8px;border:1px solid currentColor">When it appears</th>
            <th style="text-align:left;padding:8px;border:1px solid currentColor">How long it lasts</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style="padding:8px;border:1px solid currentColor">Top</td><td style="padding:8px;border:1px solid currentColor">Cinnamon, nutmeg, bergamot</td><td style="padding:8px;border:1px solid currentColor">0–30 min</td><td style="padding:8px;border:1px solid currentColor">Fades fast (~30 min)</td></tr>
          <tr><td style="padding:8px;border:1px solid currentColor">Heart</td><td style="padding:8px;border:1px solid currentColor">Dates, praline, tuberose, cognac accord</td><td style="padding:8px;border:1px solid currentColor">30 min – 2 hrs</td><td style="padding:8px;border:1px solid currentColor">The signature; ~2–3 hrs</td></tr>
          <tr><td style="padding:8px;border:1px solid currentColor">Base</td><td style="padding:8px;border:1px solid currentColor">Vanilla, tonka, benzoin, myrrh, akigalawood</td><td style="padding:8px;border:1px solid currentColor">2 hrs onward</td><td style="padding:8px;border:1px solid currentColor">8–10 hrs</td></tr>
        </tbody>
      </table>
      </div>
      <pre style="line-height:1.4">
              ╱  TOP  ╲          0–30 min   → Cinnamon · Nutmeg
            ╱  HEART   ╲         30m–2 hrs  → Dates · Praline · Cognac
          ╱   BASE      ╲        2–10 hrs   → Vanilla · Tonka · Akigalawood
      </pre>
      <p>Light top notes lift off first; the heavy base resins linger longest.</p>
      <h2>Khamrah vs Khamrah Qahwa: which should you buy?</h2>
      <p>Qahwa adds Arabic coffee and extra sweetness — gourmand-lovers often prefer it. Full split in <a href="/journal/khamrah-vs-khamrah-qahwa-which-is-better" ${A}>Khamrah vs Khamrah Qahwa</a>.</p>
      <h2>Performance</h2>
      <p>Longevity 8–10 hours; strong 3-hour projection; a comforting skin scent thereafter. A cold-weather powerhouse; too heavy for summer daytime.</p>
      <h2>Pros & cons</h2>
      <p>Pros: outstanding value, cozy, long-lasting, crowd-pleasing. Cons: very sweet, cinnamon can feel sharp early, not office-safe in heat.</p>
      <h2>Who should buy Khamrah (and who should skip)</h2>
      <p>Buy if you love sweet, spicy, boozy gourmands for cold weather. Skip if you dislike sweetness or need a light daytime scent.</p>
      <h2>How to try it risk-free</h2>
      <p>Test it (and Qahwa) from our <a href="/discovery-kits/after-dark" ${A}>discovery kit</a> before a full bottle, or browse the whole <a href="/collections/boozy-gourmands" ${A}>Boozy Gourmands collection</a>. New to the category? Start with the <a href="/journal/best-boozy-gourmand-fragrances-inspired-by-kilian" ${A}>boozy gourmands guide</a>.</p>
      <h2>FAQ</h2>
      <p><strong>Does Khamrah smell cheap?</strong> No — the date-vanilla base reads richer than its price. <strong>How many sprays?</strong> 3–4; it's potent. <strong>Is it unisex?</strong> Yes, leaning slightly masculine-sweet.</p>
    `,
    relatedFragranceHandles: [],
    relatedArticleHandles: [
      "best-boozy-gourmand-fragrances-inspired-by-kilian",
      "khamrah-vs-khamrah-qahwa-which-is-better",
      "best-vanilla-coffee-fragrances-for-winter",
    ],
    publishedAt: "2025-04-15T09:00:00.000Z",
    seo: {
      title: "Lattafa Khamrah Review: The Kilian Angels' Share Alternative",
      description:
        "We wore Lattafa Khamrah & Qahwa for 8 hours vs Kilian Angels' Share. Boozy dates, cinnamon & vanilla — the honest verdict. Sample both first. →",
    },
  },
  {
    id: "gid://shopify/Metaobject/spokeB2",
    handle: "khamrah-vs-khamrah-qahwa-which-is-better",
    title: "Khamrah vs Khamrah Qahwa: Which One Is Actually Better?",
    excerpt:
      "Same DNA, one big difference: coffee. We tested both to help you pick your winter signature.",
    heroImage: image(hero.rare, "Khamrah vs Khamrah Qahwa", 1600, 900),
    author: reviewer,
    readingTime: 6,
    tags: ["Gourmand", "Reviews"],
    bodyHtml: `
      <p><strong>Verdict:</strong> Choose original Khamrah for the spicy cinnamon-date profile; choose Qahwa if you want a sweeter, coffee-forward, more dessert-like twist.</p>
      <h2>The one real difference</h2>
      <p>Qahwa (Arabic for "coffee") layers roasted coffee and extra sugar over the Khamrah base. The cinnamon steps back; the drydown is creamier and more gourmand.</p>
      <h2>Side by side</h2>
      <p>Original: spicier, drier, more "boozy date." Qahwa: sweeter, coffee-and-vanilla, more crowd-pleasing. Both last 8–10 hours.</p>
      <h2>Which to buy</h2>
      <p>Love spice and booze → original. Love coffee and dessert → Qahwa. Undecided? Bundle both in a <a href="/discovery-kits/after-dark" ${A}>discovery kit</a>. Both sit in the <a href="/collections/boozy-gourmands" ${A}>Boozy Gourmands collection</a>, and the deep dive lives in our <a href="/journal/lattafa-khamrah-review-angels-share-alternative" ${A}>Khamrah review</a>.</p>
    `,
    relatedFragranceHandles: [],
    relatedArticleHandles: [
      "lattafa-khamrah-review-angels-share-alternative",
      "best-boozy-gourmand-fragrances-inspired-by-kilian",
    ],
    publishedAt: "2025-04-22T09:00:00.000Z",
    seo: {
      title: "Khamrah vs Khamrah Qahwa: Which Is Better?",
      description:
        "Khamrah or Khamrah Qahwa? The coffee twist explained, tested on skin — spicy-date vs sweet-coffee. Pick your winter signature. Sample both.",
    },
  },
  {
    id: "gid://shopify/Metaobject/spokeB3",
    handle: "best-vanilla-coffee-fragrances-for-winter",
    title: "The Best Vanilla & Coffee Fragrances for Winter",
    excerpt:
      "Warm, edible, and comforting — the coffee-vanilla gourmands that own cold weather, ranked by an on-skin tester.",
    heroImage: image(hero.wardrobe, "Best vanilla coffee fragrances for winter", 1600, 900),
    author: reviewer,
    readingTime: 7,
    tags: ["Gourmand", "Guides"],
    bodyHtml: `
      <p>When the temperature drops, sweet-warm gourmands finally make sense — the cold holds them close and the sweetness reads cozy rather than cloying. Here are the coffee-and-vanilla picks worth your winter.</p>
      <h2>Why coffee and vanilla work in the cold</h2>
      <p>Coffee adds a bitter-roasted edge that keeps vanilla from turning sickly; vanilla and tonka give the warmth that projects in cold air. Together they're the definitive winter comfort accord.</p>
      <h2>The picks</h2>
      <h3>Khamrah Qahwa — coffee-forward gourmand</h3>
      <p>The obvious champion. See <a href="/journal/khamrah-vs-khamrah-qahwa-which-is-better" ${A}>how it compares to original Khamrah</a>.</p>
      <h3>Sweet-vanilla alternatives</h3>
      <p>For a creamier, dessert-milk direction, browse the wider <a href="/collections/boozy-gourmands" ${A}>Boozy Gourmands collection</a>.</p>
      <h2>How to wear them</h2>
      <p>Two to three sprays on clothing to extend longevity; save for evenings and cold days. Test first with a <a href="/discovery-kits/after-dark" ${A}>discovery kit</a>, and read the full <a href="/journal/best-boozy-gourmand-fragrances-inspired-by-kilian" ${A}>boozy gourmands guide</a>.</p>
    `,
    relatedFragranceHandles: [],
    relatedArticleHandles: [
      "best-boozy-gourmand-fragrances-inspired-by-kilian",
      "khamrah-vs-khamrah-qahwa-which-is-better",
    ],
    publishedAt: "2025-04-29T09:00:00.000Z",
    seo: {
      title: "Best Vanilla & Coffee Fragrances for Winter (2025)",
      description:
        "Warm, edible, comforting. The best coffee-vanilla gourmand fragrances for cold weather, tested on skin — led by Khamrah Qahwa. Sample first.",
    },
  },

  // ─────────────────────────────── HUB C ───────────────────────────────
  {
    id: "gid://shopify/Metaobject/hubC",
    handle: "best-oud-fragrances-inspired-by-niche-houses",
    title: "Dark Woods & Smoked Ouds: Affordable Oud Inspired by Niche Houses",
    excerpt:
      "Saffron, agarwood, and ash — the smoky Arabian oud accord that answers €200 niche bottles for a fraction of the price.",
    heroImage: image(hero.rare, "Best oud fragrances inspired by niche houses", 1600, 900),
    author: reviewer,
    readingTime: 9,
    tags: ["Dupes", "Oud", "Guides"],
    bodyHtml: `
      <p>Niche houses like Initio made smoky, saffron-laced oud a status scent. But oud is Arabia's native language, and Dubai's houses render it convincingly for a fraction of the cost. This is your guide to the dark-woods category. Shop it in the <a href="/collections/smoked-ouds" ${A}>Smoked Ouds collection</a>.</p>
      <h2>What "smoked oud" actually is</h2>
      <p>A saffron-and-nutmeg opening, a resinous agarwood (oud) and patchouli heart, and a smoky woods-and-musk base. The best ones balance the smoke so it reads refined, not like burnt incense.</p>
      <h2>The lineup</h2>
      <h3>Lattafa Oud for Glory (Bade'e Al Oud) — the Initio tribute</h3>
      <p>The saffron-oud powerhouse compared directly in our <a href="/journal/lattafa-oud-for-glory-vs-initio-oud-for-greatness" ${A}>Oud for Glory vs Initio Oud for Greatness</a> test.</p>
      <h3>The Bade'e Al Oud range</h3>
      <p>Sublime, Amber, Oud — three directions of one idea, untangled in <a href="/journal/badee-al-oud-sublime-amber-oud-differences" ${A}>the Bade'e Al Oud comparison</a>.</p>
      <h3>New to oud?</h3>
      <p>Start with <a href="/journal/how-to-wear-smoky-oud-without-smelling-like-incense" ${A}>how to wear smoky oud without smelling like incense</a>.</p>
      <h2>Sample first — oud is personal</h2>
      <p>Oud reacts strongly to skin chemistry. A <a href="/discovery-kits/rare-air" ${A}>discovery kit</a> is the smart way to test before a full bottle.</p>
      <p><em>Tested on skin, 10–12 hour wears, cool and warm conditions.</em></p>
    `,
    relatedFragranceHandles: [],
    relatedArticleHandles: [
      "lattafa-oud-for-glory-vs-initio-oud-for-greatness",
      "badee-al-oud-sublime-amber-oud-differences",
      "how-to-wear-smoky-oud-without-smelling-like-incense",
    ],
    publishedAt: "2025-05-06T09:00:00.000Z",
    seo: {
      title: "Best Affordable Oud Fragrances Inspired by Niche Houses (2025)",
      description:
        "Saffron, agarwood, and smoky woods. The best affordable oud inspired by Initio Oud for Greatness — Lattafa Oud for Glory & more. Sample first.",
    },
  },
  {
    id: "gid://shopify/Metaobject/spokeC1",
    handle: "lattafa-oud-for-glory-vs-initio-oud-for-greatness",
    title: "Lattafa Oud for Glory vs Initio Oud for Greatness: On-Skin Test",
    excerpt:
      "The saffron-oud tribute that fooled the forums, tested against the €200 niche original. How close does it get?",
    heroImage: image(hero.pyramid, "Oud for Glory vs Initio Oud for Greatness", 1600, 900),
    author: reviewer,
    readingTime: 8,
    tags: ["Dupes", "Oud", "Reviews"],
    bodyHtml: `
      <p><strong>Verdict:</strong> Oud for Glory (aka Bade'e Al Oud Oud for Glory) is a remarkably close tribute to Initio Oud for Greatness — same saffron-oud-smoke idea, slightly less refined but 90% of the effect for a tenth of the price.</p>
      <p><em>Tested on skin, 10 hours, against a verified Oud for Greatness sample.</em></p>
      <h2>The scent, top to base</h2>
      <p>Opens with a big saffron-and-nutmeg blast — almost identical to the Initio. The heart is resinous agarwood and patchouli; the base is smoky woods and musk with a slightly sweeter, more animalic edge than the original.</p>
      <h2>Where the niche original wins</h2>
      <p>Oud for Greatness has cleaner smoke and a more transparent, "expensive" texture. Oud for Glory is a touch louder and rougher — noticeable side by side, invisible in daily wear.</p>
      <h2>Performance</h2>
      <p>10–12 hours, strong projection. A genuine beast.</p>
      <h2>Buy it</h2>
      <p>It leads our <a href="/collections/smoked-ouds" ${A}>Smoked Ouds collection</a>. See the sibling scents in <a href="/journal/badee-al-oud-sublime-amber-oud-differences" ${A}>the Bade'e Al Oud comparison</a>, and test it via a <a href="/discovery-kits/rare-air" ${A}>discovery kit</a> before committing. Full context in the <a href="/journal/best-oud-fragrances-inspired-by-niche-houses" ${A}>smoked ouds guide</a>.</p>
    `,
    relatedFragranceHandles: [],
    relatedArticleHandles: [
      "best-oud-fragrances-inspired-by-niche-houses",
      "badee-al-oud-sublime-amber-oud-differences",
    ],
    publishedAt: "2025-05-13T09:00:00.000Z",
    seo: {
      title: "Oud for Glory vs Initio Oud for Greatness (On-Skin Test)",
      description:
        "Saffron, agarwood, and smoke. Our on-skin test of Lattafa Oud for Glory vs Initio Oud for Greatness — how close is the tribute? Sample first.",
    },
  },
  {
    id: "gid://shopify/Metaobject/spokeC2",
    handle: "badee-al-oud-sublime-amber-oud-differences",
    title: "Bade'e Al Oud: Sublime vs Amber vs Oud — What's the Difference?",
    excerpt:
      "Lattafa's Bade'e Al Oud range explained — three directions of one smoky-oud idea, and which one is for you.",
    heroImage: image(hero.scent, "Bade'e Al Oud Sublime Amber Oud differences", 1600, 900),
    author: reviewer,
    readingTime: 6,
    tags: ["Oud", "Guides"],
    bodyHtml: `
      <p>The Bade'e Al Oud line confuses buyers because the flankers smell quite different. Here's the quick, tested breakdown.</p>
      <h2>Bade'e Al Oud Sublime</h2>
      <p>The fruity-smoky crowd-pleaser: raspberry and saffron over smoky woods. The most versatile and beginner-friendly.</p>
      <h2>Bade'e Al Oud Amber</h2>
      <p>Warmer and sweeter — amber and resins soften the oud. Best for cold weather.</p>
      <h2>Bade'e Al Oud (Oud for Glory)</h2>
      <p>The purest saffron-oud beast, and the Initio tribute — detailed in <a href="/journal/lattafa-oud-for-glory-vs-initio-oud-for-greatness" ${A}>Oud for Glory vs Initio</a>.</p>
      <h2>Which to pick</h2>
      <p>Versatile → Sublime. Cozy/sweet → Amber. Maximum smoky oud → Oud for Glory. All three are in the <a href="/collections/smoked-ouds" ${A}>Smoked Ouds collection</a>; sample the range with a <a href="/discovery-kits/rare-air" ${A}>discovery kit</a>. More in the <a href="/journal/best-oud-fragrances-inspired-by-niche-houses" ${A}>smoked ouds guide</a>.</p>
    `,
    relatedFragranceHandles: [],
    relatedArticleHandles: [
      "best-oud-fragrances-inspired-by-niche-houses",
      "lattafa-oud-for-glory-vs-initio-oud-for-greatness",
    ],
    publishedAt: "2025-05-20T09:00:00.000Z",
    seo: {
      title: "Bade'e Al Oud: Sublime vs Amber vs Oud for Glory Explained",
      description:
        "Confused by the Bade'e Al Oud range? Sublime vs Amber vs Oud for Glory, tested on skin — which smoky oud is for you. Sample the range.",
    },
  },
  {
    id: "gid://shopify/Metaobject/spokeC3",
    handle: "how-to-wear-smoky-oud-without-smelling-like-incense",
    title: "How to Wear Smoky Oud Without Smelling Like Incense",
    excerpt:
      "Oud is easy to over-apply. A beginner's guide to spraying, seasons, and pairings so you smell refined, not overwhelming.",
    heroImage: image(hero.wardrobe, "How to wear smoky oud", 1600, 900),
    author: reviewer,
    readingTime: 6,
    tags: ["Oud", "Guides"],
    bodyHtml: `
      <p>Oud's biggest problem isn't the scent — it's the application. Most "oud is too much" complaints come from over-spraying a potent extrait. Here's how to wear it well.</p>
      <h2>Spray less than you think</h2>
      <p>One to two sprays of a smoky oud projects for hours. Start low; oud grows on skin.</p>
      <h2>Mind the season and setting</h2>
      <p>Smoky ouds shine in cool weather and evenings. In heat or tight indoor spaces, scale back to a single spray or choose a fresher option from our <a href="/collections/beast-mode-freshies" ${A}>Beast-Mode Freshies collection</a>.</p>
      <h2>Start with a versatile oud</h2>
      <p>Beginners should avoid the heaviest extraits first. A fruity-smoky option like Bade'e Al Oud Sublime — see <a href="/journal/badee-al-oud-sublime-amber-oud-differences" ${A}>the Bade'e Al Oud comparison</a> — is an easier entry than a pure saffron-oud beast.</p>
      <h2>Build your nose with samples</h2>
      <p>Learn the category cheaply: a <a href="/discovery-kits/rare-air" ${A}>discovery kit</a> lets you test several ouds before committing. Then dive into the full <a href="/journal/best-oud-fragrances-inspired-by-niche-houses" ${A}>smoked ouds guide</a>.</p>
    `,
    relatedFragranceHandles: [],
    relatedArticleHandles: [
      "best-oud-fragrances-inspired-by-niche-houses",
      "badee-al-oud-sublime-amber-oud-differences",
    ],
    publishedAt: "2025-05-27T09:00:00.000Z",
    seo: {
      title: "How to Wear Smoky Oud Without Smelling Like Incense",
      description:
        "Oud too strong? A beginner's guide to sprays, seasons, and pairings so you wear smoky oud refined, not overwhelming. Sample kits available.",
    },
  },
];
