import "server-only";

/**
 * The auth boundary for account routes (TDD §20).
 *
 * V1 ships the account *shell* behind a mockable boundary rather than a full
 * Customer Account API OAuth integration, which is a larger piece of work than
 * the rest of the storefront combined. Every account page reads through
 * `getCustomer()`, so landing OAuth later changes this file and nothing else.
 *
 * It returns `null` — signed out — until the Customer Account API is
 * configured. It never invents a customer: a fake signed-in state would hide
 * exactly the bugs the shell exists to surface.
 */
export interface Customer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export const isCustomerAccountConfigured = Boolean(
  process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_URL &&
  process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID
);

export async function getCustomer(): Promise<Customer | null> {
  if (!isCustomerAccountConfigured) return null;

  // Extension point: exchange the session cookie for a customer access token,
  // then query the Customer Account API. Until that lands, a configured
  // environment must not silently behave like an unconfigured one.
  throw new Error(
    "Customer Account API is configured but getCustomer() is not implemented yet."
  );
}
