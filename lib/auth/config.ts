/**
 * Customer Account API OAuth configuration.
 *
 * No `server-only` guard: this module is imported by the Edge middleware, which
 * must not fail on the `server-only` boundary. It is safe to leave unguarded —
 * it holds only the *public* OAuth client id and non-secret endpoint URLs, and
 * nothing here is imported by a client component. Secrets (tokens) live behind
 * `server-only` in session.ts.
 *
 * The integration needs only the GraphQL API URL and the public client id, both
 * issued by the Shopify Headless channel. Every other endpoint (authorize,
 * token, logout) is derived from the shop id embedded in the API URL, matching
 * the store's OpenID discovery document at
 * `https://shopify.com/authentication/{shopId}/.well-known/openid-configuration`.
 *
 * Keeping config to these vars means "going live" is the same shape as the rest
 * of the storefront: set the vars, and the mockable auth boundary switches from
 * signed-out-shell to the real flow (see lib/auth/customer.ts).
 */

const API_URL = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_URL?.replace(
  /\/$/,
  ""
);
const CLIENT_ID = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID;
/**
 * Only set for a *Confidential* client. A Public/Web client uses PKCE with no
 * secret; a Confidential client additionally authenticates the token request
 * with HTTP Basic. Supporting both means the Headless "client type" choice
 * during setup cannot break the flow.
 */
const CLIENT_SECRET = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET;

/**
 * Where Shopify sends the browser back after login. Must be registered verbatim
 * as a callback URI on the Headless channel, so it is derived from the single
 * canonical site URL rather than request headers (which an attacker controls).
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

/** OAuth scopes: identity (`openid email`) plus full Customer Account API read. */
export const OAUTH_SCOPES = "openid email customer-account-api:full";

export interface CustomerAccountConfig {
  /** Customer Account GraphQL endpoint, e.g. `.../account/customer/api/2025-01/graphql`. */
  apiUrl: string;
  clientId: string;
  /** Present only for a Confidential client; absent for Public/Web (PKCE). */
  clientSecret?: string;
  authorizeEndpoint: string;
  tokenEndpoint: string;
  logoutEndpoint: string;
  /** `${SITE_URL}/api/auth/callback` — registered on the Headless channel. */
  redirectUri: string;
  /** Where to send the browser after login / logout completes. */
  postLoginPath: string;
}

/**
 * Extract the numeric shop id from the API URL. Both the API URL
 * (`https://shopify.com/100708057402/account/...`) and the auth endpoints
 * (`https://shopify.com/authentication/100708057402/...`) carry it.
 */
function shopIdFrom(apiUrl: string): string | null {
  const match = apiUrl.match(
    /shopify\.com\/(?:authentication\/)?(\d+)(?:\/|$)/
  );
  return match?.[1] ?? null;
}

/**
 * The resolved config, or `null` when the integration is not set up. A single
 * source of truth so `isCustomerAccountConfigured` and every route agree on
 * whether the flow is live.
 */
export const customerAccountConfig: CustomerAccountConfig | null = (() => {
  if (!API_URL || !CLIENT_ID || !SITE_URL) return null;

  const shopId = shopIdFrom(API_URL);
  if (!shopId) return null;

  const authBase = `https://shopify.com/authentication/${shopId}`;

  return {
    apiUrl: API_URL,
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET || undefined,
    authorizeEndpoint: `${authBase}/oauth/authorize`,
    tokenEndpoint: `${authBase}/oauth/token`,
    logoutEndpoint: `${authBase}/logout`,
    redirectUri: `${SITE_URL}/api/auth/callback`,
    postLoginPath: "/account",
  };
})();

export const isCustomerAccountConfigured = customerAccountConfig !== null;
