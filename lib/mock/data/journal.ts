import type { JournalArticle, JournalAuthor } from "@/types";
import { image } from "./media";

/**
 * Journal fixtures — `nv_journal_article` metaobjects (TDD §8).
 *
 * `tags` doubles as the category axis on the journal index; the live metaobject
 * uses the same `list.single_line_text` field, so filtering logic written
 * against these carries over unchanged. `bodyHtml` stands in for the metaobject's
 * `rich_text` field, which Shopify returns pre-rendered.
 */
const elena: JournalAuthor = {
  name: "Elena Vasquez",
  role: "Head of Curation",
  bio: "Fifteen years buying for independent perfumeries across Europe.",
  avatar: image("/mock/authors/elena-vasquez.svg", "Elena Vasquez", 200, 200),
};

const marcus: JournalAuthor = {
  name: "Marcus Lund",
  role: "Contributing Editor",
  bio: "Writes on scent, material culture, and the economics of scarcity.",
  avatar: image("/mock/authors/marcus-lund.svg", "Marcus Lund", 200, 200),
};

export const journalArticles: JournalArticle[] = [
  {
    id: "gid://shopify/Metaobject/j1",
    handle: "how-to-read-a-fragrance-pyramid",
    title: "How to read a fragrance pyramid",
    excerpt:
      "Top, heart, base. The structure everyone cites and almost nobody uses correctly.",
    heroImage: image(
      "/mock/journal/how-to-read-a-fragrance-pyramid.svg",
      "How to read a fragrance pyramid",
      1600,
      900
    ),
    author: elena,
    readingTime: 6,
    tags: ["Guides"],
    bodyHtml: `
      <p>The pyramid is a marketing diagram that happens to be roughly true. Notes are grouped by how quickly their molecules leave your skin, not by how important they are to the composition.</p>
      <h2>Top notes are a first impression, not a fragrance</h2>
      <p>Citrus and light aromatics evaporate within fifteen minutes. Judging a fragrance at the counter means judging almost none of it. This is the single most common and most expensive mistake a new collector makes.</p>
      <h2>The heart is where the intent lives</h2>
      <p>Between thirty minutes and two hours, the middle notes carry the composition. Florals, spices, and green materials sit here. If you dislike the heart, you will dislike the fragrance.</p>
      <h2>The base decides whether you own it</h2>
      <p>Woods, resins, and musks persist for six hours or more. They are what other people smell when they stand near you at the end of an evening, and they are what you will remember the bottle by.</p>
      <p>Wear a sample for a full day before deciding. Nothing else tells you the truth.</p>
    `,
    relatedFragranceHandles: ["velvet-cipher", "obsidian-bloom"],
    relatedArticleHandles: ["building-a-five-bottle-wardrobe"],
    publishedAt: "2025-02-11T09:00:00.000Z",
    seo: {
      title: "How to read a fragrance pyramid",
      description: "Top, heart, base, and why the counter test misleads you.",
    },
  },
  {
    id: "gid://shopify/Metaobject/j2",
    handle: "the-case-for-one-scent",
    title: "The case for wearing one scent",
    excerpt:
      "A wardrobe is a modern idea. For most of perfumery's history, people smelled like themselves.",
    heroImage: image(
      "/mock/journal/the-case-for-one-scent.svg",
      "The case for wearing one scent",
      1600,
      900
    ),
    author: marcus,
    readingTime: 8,
    tags: ["Craft"],
    bodyHtml: `
      <p>The signature scent is out of fashion. Every guide now recommends a rotation: something fresh for the office, something heavy for the evening, something forgettable for the gym.</p>
      <h2>Recognition compounds</h2>
      <p>A fragrance worn consistently becomes attached to you in other people's memory. That association takes months to form and cannot be bought.</p>
      <h2>Rotation is a retail strategy</h2>
      <p>It is not an accident that the wardrobe model asks you to own six bottles instead of one. Be clear-eyed about whose interest it serves.</p>
      <h2>The compromise</h2>
      <p>Two bottles. One that is unmistakably yours, and one for the weather the first cannot handle. Everything beyond that is collecting, which is a different and perfectly good hobby.</p>
    `,
    relatedFragranceHandles: ["gold-leaf-tobacco", "ember-vow"],
    relatedArticleHandles: [
      "building-a-five-bottle-wardrobe",
      "what-makes-a-fragrance-rare",
    ],
    publishedAt: "2025-04-03T09:00:00.000Z",
    seo: {
      title: "The case for wearing one scent",
      description: "Why the fragrance wardrobe may be selling you something.",
    },
  },
  {
    id: "gid://shopify/Metaobject/j3",
    handle: "what-makes-a-fragrance-rare",
    title: "What actually makes a fragrance rare",
    excerpt:
      "Scarcity is manufactured more often than it is discovered. Here is how to tell the difference.",
    heroImage: image(
      "/mock/journal/what-makes-a-fragrance-rare.svg",
      "What actually makes a fragrance rare",
      1600,
      900
    ),
    author: marcus,
    readingTime: 11,
    tags: ["Collecting"],
    bodyHtml: `
      <p>Rarity in perfumery comes from three places, and only one of them is about the liquid.</p>
      <h2>Material scarcity</h2>
      <p>Real oud, Mysore sandalwood, and Taif rose are constrained by agriculture and regulation. A fragrance built on them is expensive for reasons that have nothing to do with the house.</p>
      <h2>Production scarcity</h2>
      <p>A run of six hundred bottles is rare because someone decided it would be. This is legitimate when the materials run out and cynical when they do not.</p>
      <h2>Reformulation scarcity</h2>
      <p>The most interesting category. When IFRA restricts a material, the original formula becomes unbuyable at any price. The bottle you own is the last of its kind, and no marketing department planned it.</p>
      <p>Our rarity tiers weight material and reformulation scarcity heavily, and production scarcity barely at all.</p>
    `,
    relatedFragranceHandles: ["crimson-oud", "midnight-cartography"],
    relatedArticleHandles: ["how-to-read-a-fragrance-pyramid"],
    publishedAt: "2025-05-27T09:00:00.000Z",
    seo: {
      title: "What actually makes a fragrance rare",
      description: "Material, production, and reformulation scarcity compared.",
    },
  },
  {
    id: "gid://shopify/Metaobject/j4",
    handle: "building-a-five-bottle-wardrobe",
    title: "Building a five-bottle wardrobe",
    excerpt:
      "Cover the year without buying twelve fragrances that smell like each other.",
    heroImage: image(
      "/mock/journal/building-a-five-bottle-wardrobe.svg",
      "Building a five-bottle wardrobe",
      1600,
      900
    ),
    author: elena,
    readingTime: 7,
    tags: ["Wardrobe", "Guides"],
    bodyHtml: `
      <p>Five is the number at which a collection stops having gaps and starts having redundancy. Spend them carefully.</p>
      <h2>One fresh, for heat</h2>
      <p>Citrus or mineral. It will be the bottle you finish first, so it should not be the bottle you spent most on.</p>
      <h2>One wood, for work</h2>
      <p>Quiet, long-lasting, legible at arm's length and no further.</p>
      <h2>One amber or tobacco, for cold</h2>
      <p>This is where weight belongs. Buy the 50ml; you will not get through 100.</p>
      <h2>One that is only yours</h2>
      <p>Chosen against advice, including ours.</p>
      <h2>One that is difficult</h2>
      <p>Something you did not like at first. It will teach you more than the other four combined.</p>
    `,
    relatedFragranceHandles: [
      "salt-and-cedar",
      "ash-vetiver",
      "gold-leaf-tobacco",
    ],
    relatedArticleHandles: [
      "the-case-for-one-scent",
      "how-to-read-a-fragrance-pyramid",
    ],
    publishedAt: "2025-06-18T09:00:00.000Z",
    seo: {
      title: "Building a five-bottle wardrobe",
      description: "Cover the year in five fragrances, without redundancy.",
    },
  },
];
