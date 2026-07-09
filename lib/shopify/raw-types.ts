/**
 * Raw Storefront API response shapes.
 *
 * These mirror what Shopify actually sends: `edges`/`node` wrappers, metafields
 * as a sparse array, money as `{ amount, currencyCode }` strings. Nothing
 * outside `normalize.ts` should import from this file — the rest of the app
 * speaks the domain types in `types/`.
 *
 * Hand-written rather than codegen'd: the query surface is small and fixed, and
 * a generated 4,000-line schema would be harder to review than the twenty types
 * we actually use.
 */

export interface Connection<T> {
  edges: { node: T; cursor: string }[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
}

/** A connection queried without cursors (references, media, kit contents). */
export interface NodeList<T> {
  nodes: T[];
}

export interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

export interface ShopifyImage {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
}

export interface ShopifySeo {
  title: string | null;
  description: string | null;
}

export interface ShopifyVideoSource {
  url: string;
  mimeType: string;
}

/**
 * A metafield's resolved target. `__typename` discriminates; every arm is
 * optional because Shopify returns only the one that matches.
 */
export interface ShopifyMetafieldReference {
  __typename: string;
  /** `... on Product` — used by similar/related/kit references. */
  handle?: string;
  title?: string;
  /** `... on Video` — `nv.hero_video`. */
  sources?: ShopifyVideoSource[];
  /** `... on MediaImage` — `nv.rotation_360` frames. */
  image?: ShopifyImage | null;
  /** `... on Metaobject` — `nv_note`, `nv_brand`, journal author. */
  type?: string;
  fields?: { key: string; value: string | null }[];
}

/**
 * `metafields(identifiers: [...])` returns a positional array with `null` in
 * every slot the product does not define. Callers must tolerate the holes.
 */
export interface ShopifyMetafield {
  key: string;
  namespace: string;
  type: string;
  value: string;
  reference: ShopifyMetafieldReference | null;
  references: NodeList<ShopifyMetafieldReference> | null;
}

export type ShopifyMetafields = (ShopifyMetafield | null)[];

export interface ShopifyVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable: number | null;
  price: ShopifyMoney;
  compareAtPrice: ShopifyMoney | null;
  selectedOptions: { name: string; value: string }[];
}

export interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  vendor: string;
  availableForSale: boolean;
  tags: string[];
  seo: ShopifySeo;
  featuredImage: ShopifyImage | null;
  images: NodeList<ShopifyImage>;
  priceRange: { minVariantPrice: ShopifyMoney };
  compareAtPriceRange: { minVariantPrice: ShopifyMoney };
  variants: NodeList<ShopifyVariant>;
  metafields: ShopifyMetafields;
}

export interface ShopifyCollection {
  id: string;
  handle: string;
  title: string;
  description: string;
  seo: ShopifySeo;
  image: ShopifyImage | null;
  metafields: ShopifyMetafields;
  /** Present only on the single-collection query. */
  products?: Connection<ShopifyProduct>;
}

export interface ShopifyMetaobjectField {
  key: string;
  value: string | null;
  reference: ShopifyMetafieldReference | null;
  references: NodeList<ShopifyMetafieldReference> | null;
}

export interface ShopifyMetaobject {
  id: string;
  handle: string;
  type: string;
  fields: ShopifyMetaobjectField[];
}

export interface ShopifyCartLine {
  id: string;
  quantity: number;
  cost: { totalAmount: ShopifyMoney; amountPerQuantity: ShopifyMoney };
  merchandise: {
    id: string;
    title: string;
    image: ShopifyImage | null;
    product: { handle: string; title: string };
  };
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: Connection<ShopifyCartLine>;
  cost: {
    subtotalAmount: ShopifyMoney;
    totalAmount: ShopifyMoney;
    totalTaxAmount: ShopifyMoney | null;
  };
}

/** Every cart mutation returns this envelope. */
export interface ShopifyCartMutationPayload {
  cart: ShopifyCart | null;
  userErrors: { field: string[] | null; message: string }[];
}

// --- Query response roots -------------------------------------------------

export interface ProductsResponse {
  products: Connection<ShopifyProduct>;
}
export interface ProductResponse {
  product: ShopifyProduct | null;
}
export interface ProductHandlesResponse {
  products: Connection<{ handle: string }>;
}
export interface CollectionsResponse {
  collections: Connection<ShopifyCollection>;
}
export interface CollectionResponse {
  collection: ShopifyCollection | null;
}
export interface MetaobjectsResponse {
  metaobjects: Connection<ShopifyMetaobject>;
}
export interface MetaobjectResponse {
  metaobject: ShopifyMetaobject | null;
}
export interface CartResponse {
  cart: ShopifyCart | null;
}
export interface CartCreateResponse {
  cartCreate: ShopifyCartMutationPayload;
}
export interface CartLinesAddResponse {
  cartLinesAdd: ShopifyCartMutationPayload;
}
export interface CartLinesUpdateResponse {
  cartLinesUpdate: ShopifyCartMutationPayload;
}
export interface CartLinesRemoveResponse {
  cartLinesRemove: ShopifyCartMutationPayload;
}
