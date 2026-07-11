import { NextResponse } from "next/server";
import { customerAccountConfig, OAUTH_SCOPES } from "@/lib/auth/config";
import { codeChallengeFrom, randomString } from "@/lib/auth/pkce";
import { writeOAuthTransaction } from "@/lib/auth/session";

/**
 * Start the Customer Account API login (OAuth 2.0 authorization code + PKCE).
 *
 * Mints the per-login secrets, stores them in httpOnly cookies for the callback
 * to verify, and redirects to Shopify's hosted authorization page. Nothing here
 * is user-supplied: the redirect target and scopes come from server config, so
 * this endpoint cannot be turned into an open redirect.
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const config = customerAccountConfig;
  const origin = new URL(request.url).origin;

  // Unconfigured: the account shell already explains the state; just go there.
  if (!config) return NextResponse.redirect(new URL("/account", origin));

  const state = randomString();
  const nonce = randomString();
  const verifier = randomString();
  const challenge = await codeChallengeFrom(verifier);

  await writeOAuthTransaction({ state, verifier, nonce });

  const authorizeUrl = new URL(config.authorizeEndpoint);
  authorizeUrl.searchParams.set("client_id", config.clientId);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("redirect_uri", config.redirectUri);
  authorizeUrl.searchParams.set("scope", OAUTH_SCOPES);
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("nonce", nonce);
  authorizeUrl.searchParams.set("code_challenge", challenge);
  authorizeUrl.searchParams.set("code_challenge_method", "S256");

  return NextResponse.redirect(authorizeUrl);
}
