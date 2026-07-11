/**
 * Customer Account API token endpoint calls.
 *
 * Deliberately free of `next/headers` and other runtime-specific imports so the
 * same code runs in the Node route handlers (login/callback/logout) and in the
 * Edge middleware that refreshes tokens ahead of a render. Cookie plumbing lives
 * in session.ts / the middleware; this module only speaks HTTP to Shopify.
 */
import type { CustomerAccountConfig } from "@/lib/auth/config";

export interface TokenSet {
  accessToken: string;
  refreshToken: string;
  /** JWT, kept only to pass as `id_token_hint` on logout. */
  idToken?: string;
  /** Epoch milliseconds at which `accessToken` stops being valid. */
  expiresAt: number;
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  id_token?: string;
  token_type: string;
  scope?: string;
  error?: string;
  error_description?: string;
}

/**
 * The site origin doubles as the `Origin` header. Shopify requires it on token
 * requests from public (PKCE, no-secret) clients; it must match a JavaScript
 * origin registered on the Headless channel.
 */
function originOf(config: CustomerAccountConfig): string {
  return new URL(config.redirectUri).origin;
}

async function postToken(
  config: CustomerAccountConfig,
  body: URLSearchParams
): Promise<TokenSet> {
  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
    // A Public client is identified to the token endpoint by these two headers;
    // Origin must match a registered JavaScript origin, and a missing User-Agent
    // is rejected with 403.
    Origin: originOf(config),
    "User-Agent": "NoirVault/1.0",
  };

  // Confidential client: authenticate with HTTP Basic (client_secret_basic).
  if (config.clientSecret) {
    const credentials = btoa(`${config.clientId}:${config.clientSecret}`);
    headers.Authorization = `Basic ${credentials}`;
  }

  const response = await fetch(config.tokenEndpoint, {
    method: "POST",
    headers,
    body,
    cache: "no-store",
  });

  const data = (await response.json().catch(() => ({}))) as TokenResponse;

  if (!response.ok || !data.access_token) {
    throw new Error(
      `Token request failed (${response.status}): ` +
        (data.error_description || data.error || "no access token returned")
    );
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    idToken: data.id_token,
    // Refresh a minute early so an in-flight request never races the expiry.
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
}

/** Authorization-code grant: exchange the callback `code` for the first token set. */
export function exchangeCodeForTokens(
  config: CustomerAccountConfig,
  code: string,
  codeVerifier: string
): Promise<TokenSet> {
  return postToken(
    config,
    new URLSearchParams({
      grant_type: "authorization_code",
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      code,
      code_verifier: codeVerifier,
    })
  );
}

/**
 * Refresh-token grant. Shopify may or may not rotate the refresh token and does
 * not re-issue an id_token here, so the previous values are carried forward when
 * the response omits them — callers persist whatever this returns.
 */
export async function refreshAccessToken(
  config: CustomerAccountConfig,
  refreshToken: string,
  previousIdToken?: string
): Promise<TokenSet> {
  const next = await postToken(
    config,
    new URLSearchParams({
      grant_type: "refresh_token",
      client_id: config.clientId,
      refresh_token: refreshToken,
    })
  );

  return {
    ...next,
    refreshToken: next.refreshToken || refreshToken,
    idToken: next.idToken || previousIdToken,
  };
}
