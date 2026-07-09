import type { DataProvider } from "./provider";
import { isShopifyConfigured } from "@/lib/shopify/client";
import { mockProvider } from "./mock-provider";
import { shopifyProvider } from "./shopify-provider";

/**
 * The single entry point pages use to read content. This is the "swap by env"
 * seam: with live Shopify credentials present, the live provider answers;
 * otherwise the mock provider does — with identical normalized return types.
 *
 * Pages import ONLY from `@/lib/data` — never from `lib/shopify` or the
 * providers directly — so the data source stays invisible to the UI.
 */
export function getProvider(): DataProvider {
  return isShopifyConfigured ? shopifyProvider : mockProvider;
}

export type { DataProvider } from "./provider";
