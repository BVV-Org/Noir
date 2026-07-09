import "server-only";
import { CommerceError } from "@/lib/data/errors";

/**
 * Shopify Storefront API client.
 *
 * A single typed `shopifyFetch<T>()` is the only thing that talks to Shopify.
 * Queries/mutations, fragments, and normalizers build on top of it. The
 * Storefront access token lives in server env and never reaches the client.
 *
 * If the store domain / token are absent, the app runs on the mock provider
 * (see lib/data) — so this module is imported only by the live provider.
 */

const API_VERSION = process.env.SHOPIFY_API_VERSION || "2025-01";
const STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

/**
 * True when live Shopify credentials are present. `lib/data/index.ts` uses this
 * to decide between the live and mock providers — the "swap by env" seam.
 */
export const isShopifyConfigured = Boolean(STORE_DOMAIN && STOREFRONT_TOKEN);

const endpoint = STORE_DOMAIN
  ? `https://${STORE_DOMAIN}/api/${API_VERSION}/graphql.json`
  : "";

export interface ShopifyFetchOptions<TVariables> {
  query: string;
  variables?: TVariables;
  /** Seconds until this response is considered stale (Next.js fetch cache). */
  revalidate?: number;
  /** Cache tags for on-demand revalidation via Shopify webhooks. */
  tags?: string[];
  /** Force a fresh request (e.g. cart mutations). */
  cache?: RequestCache;
}

export interface ShopifyFetchResult<TData> {
  data: TData;
}

/**
 * Error thrown when a Storefront request fails, returns GraphQL errors, or
 * reports `userErrors` on a cart mutation.
 *
 * Extends `CommerceError` so the cart route can handle a shopper-actionable
 * failure identically whichever provider raised it.
 */
export class ShopifyError extends CommerceError {
  constructor(
    message: string,
    readonly status?: number,
    details?: unknown
  ) {
    super(message, details);
    this.name = "ShopifyError";
  }
}

/**
 * Execute a typed GraphQL request against the Storefront API. Callers supply
 * the expected `TData` shape (from lib/shopify/raw-types) and receive the raw
 * `data` payload; normalization into domain types happens in normalize.ts.
 */
export async function shopifyFetch<
  TData,
  TVariables = Record<string, unknown>,
>({
  query,
  variables,
  revalidate,
  tags,
  cache,
}: ShopifyFetchOptions<TVariables>): Promise<TData> {
  if (!isShopifyConfigured) {
    throw new ShopifyError(
      "Shopify is not configured. Set SHOPIFY_STORE_DOMAIN and " +
        "SHOPIFY_STOREFRONT_ACCESS_TOKEN, or rely on the mock provider."
    );
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN as string,
      },
      body: JSON.stringify({ query, variables }),
      cache,
      ...(cache
        ? {}
        : { next: { revalidate: revalidate ?? 3600, tags: tags ?? [] } }),
    });
  } catch (cause) {
    throw new ShopifyError(
      "Network error contacting Shopify",
      undefined,
      cause
    );
  }

  if (!response.ok) {
    throw new ShopifyError(
      `Storefront request failed: ${response.status} ${response.statusText}`,
      response.status
    );
  }

  const body = (await response.json()) as {
    data?: TData;
    errors?: unknown;
  };

  if (body.errors) {
    throw new ShopifyError(
      "Storefront GraphQL error",
      response.status,
      body.errors
    );
  }

  if (!body.data) {
    throw new ShopifyError(
      "Storefront response contained no data",
      response.status
    );
  }

  return body.data;
}
