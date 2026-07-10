/**
 * Mock fixture barrel. Imported only by `lib/data/mock-provider.ts` — pages read
 * content exclusively through `getProvider()` and must never reach in here.
 */
export { products } from "./products";
export { collections, collectionTagRules } from "./collections";
export { kits } from "./kits";
export { journalArticles } from "./journal";
export { homepageSections } from "./homepage";
export { image, money, bottleImages } from "./media";
