/**
 * Domain type barrel — the shared vocabulary of the application. Every provider
 * (live or mock) returns exactly these normalized shapes.
 */
export type {
  Money,
  ShopImage,
  Seo,
  PageInfo,
  Paginated,
  ProductSortKey,
  Filters,
  ProductQuery,
} from "./common";
export type {
  Product,
  ProductVariant,
  PerformanceProfile,
  Classification,
  ProductNotes,
  ProductFlags,
} from "./product";
export type { Collection } from "./collection";
export type { Kit } from "./kit";
export type { JournalArticle, JournalAuthor } from "./journal";
export type {
  Cart,
  CartLine,
  CartCost,
  CartLineInput,
  CartLineUpdateInput,
} from "./cart";
export type { HomepageSection, HomepageSectionType } from "./homepage";
