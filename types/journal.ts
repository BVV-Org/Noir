import type { ShopImage, Seo } from "./common";

/** Journal author — `nv_journal_author` metaobject. */
export interface JournalAuthor {
  name: string;
  avatar?: ShopImage | null;
  bio?: string;
  role?: string;
}

/**
 * Journal article — `nv_journal_article` metaobject (TDD §8). Non-product,
 * CMS-editable editorial content.
 */
export interface JournalArticle {
  id: string;
  handle: string;
  title: string;
  excerpt: string;
  heroImage?: ShopImage | null;
  author?: JournalAuthor;
  readingTime?: number;
  tags: string[];
  bodyHtml?: string;
  relatedFragranceHandles: string[];
  relatedArticleHandles: string[];
  publishedAt: string;
  seo?: Seo;
}
