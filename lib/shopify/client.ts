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
    details?: unknown,
    /** Milliseconds from a `Retry-After` header, when the response carried one. */
    readonly retryAfterMs?: number
  ) {
    super(message, details);
    this.name = "ShopifyError";
  }

  /** True for a network failure or a status Shopify may serve again. */
  get isTransient(): boolean {
    if (this.status === undefined) return this.isNetworkError;
    return this.status === 429 || this.status >= 500;
  }

  /** Set when `fetch` itself rejected: no response, no status. */
  isNetworkError = false;
}

/**
 * Retry policy.
 *
 * Only *transient* failures are retried: a network error, a 429 (Shopify's
 * Storefront API is leaky-bucket rate limited), and 5xx. A 400 or 401 is a bug
 * in our query or a bad token — retrying it three times turns one clear failure
 * into three, more slowly.
 *
 * GraphQL-level errors are never retried either: the server understood the
 * request and rejected it.
 *
 * Backoff is exponential with full jitter. Fixed backoff synchronises every
 * concurrent request onto the same retry instant, which is exactly the stampede
 * that caused the 429.
 */
const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 200;
const MAX_DELAY_MS = 5_000;

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Honour `Retry-After` when Shopify sends it; it knows its own bucket. The
 * delay is carried on the error rather than read from a shared response, so
 * concurrent requests cannot observe each other's headers.
 */
function backoffDelay(attempt: number, retryAfterMs?: number): number {
  if (retryAfterMs !== undefined) return Math.min(retryAfterMs, MAX_DELAY_MS);
  const ceiling = Math.min(BASE_DELAY_MS * 2 ** attempt, MAX_DELAY_MS);
  return Math.random() * ceiling;
}

/** `Retry-After` is seconds (or an HTTP date, which we ignore as unusual here). */
function readRetryAfter(response: Response): number | undefined {
  const header = response.headers.get("retry-after");
  if (!header) return undefined;
  const seconds = Number.parseFloat(header);
  return Number.isFinite(seconds) && seconds >= 0 ? seconds * 1000 : undefined;
}

/**
 * Execute a typed GraphQL request against the Storefront API. Callers supply
 * the expected `TData` shape (from lib/shopify/raw-types) and receive the raw
 * `data` payload; normalization into domain types happens in normalize.ts.
 *
 * Transient failures are retried with jittered exponential backoff; everything
 * else fails immediately. See the retry policy above.
 */
export async function shopifyFetch<TData, TVariables = Record<string, unknown>>(
  options: ShopifyFetchOptions<TVariables>
): Promise<TData> {
  if (!isShopifyConfigured) {
    throw new ShopifyError(
      "Shopify is not configured. Set SHOPIFY_STORE_DOMAIN and " +
        "SHOPIFY_STOREFRONT_ACCESS_TOKEN, or rely on the mock provider."
    );
  }

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    try {
      return await attemptFetch<TData, TVariables>(options);
    } catch (error) {
      const transient = error instanceof ShopifyError && error.isTransient;
      const lastAttempt = attempt === MAX_ATTEMPTS - 1;

      if (!transient || lastAttempt) throw error;

      const shopifyError = error as ShopifyError;
      console.warn(
        `Storefront request failed (attempt ${attempt + 1}/${MAX_ATTEMPTS}` +
          `${shopifyError.status ? `, status ${shopifyError.status}` : ", network"}); retrying.`
      );
      await sleep(backoffDelay(attempt, shopifyError.retryAfterMs));
    }
  }

  // Unreachable: the loop either returns or throws on its last iteration.
  throw new ShopifyError("Storefront request exhausted all retries");
}

async function attemptFetch<TData, TVariables>({
  query,
  variables,
  revalidate,
  tags,
  cache,
}: ShopifyFetchOptions<TVariables>): Promise<TData> {
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
    const error = new ShopifyError(
      "Network error contacting Shopify",
      undefined,
      cause
    );
    error.isNetworkError = true;
    throw error;
  }

  if (!response.ok) {
    // `retryAfterMs` is only meaningful on a 429, but reading it is harmless
    // and keeps the retry loop from needing to know about the response.
    throw new ShopifyError(
      `Storefront request failed: ${response.status} ${response.statusText}`,
      response.status,
      undefined,
      readRetryAfter(response)
    );
  }

  const body = (await response.json()) as {
    data?: TData;
    errors?: unknown;
  };

  // A GraphQL error arrives with HTTP 200. `isTransient` is false for a 200, so
  // this is never retried — the server understood the query and rejected it.
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
