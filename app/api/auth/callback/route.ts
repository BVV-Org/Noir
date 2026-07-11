import { NextResponse } from "next/server";
import { customerAccountConfig } from "@/lib/auth/config";
import { exchangeCodeForTokens } from "@/lib/auth/tokens";
import {
  clearOAuthTransaction,
  readOAuthTransaction,
  writeSession,
} from "@/lib/auth/session";

/**
 * OAuth callback: Shopify redirects here with `code` and `state`.
 *
 * The `state` must match the value this browser stored at /api/auth/login (CSRF
 * defence), and the PKCE `code_verifier` proves the same client that started the
 * flow is finishing it. Only then is the code exchanged for a token set. Any
 * failure lands back on /account with `?auth=error` rather than a stack trace.
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const config = customerAccountConfig;

  const failure = () => {
    const dest = new URL("/account", origin);
    dest.searchParams.set("auth", "error");
    return NextResponse.redirect(dest);
  };

  if (!config) return NextResponse.redirect(new URL("/account", origin));

  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  const tx = await readOAuthTransaction();
  await clearOAuthTransaction();

  // The state comparison also rejects a callback with no matching transaction
  // cookie (e.g. a stray or forged request).
  if (
    oauthError ||
    !code ||
    !returnedState ||
    !tx.state ||
    !tx.verifier ||
    returnedState !== tx.state
  ) {
    return failure();
  }

  try {
    const tokens = await exchangeCodeForTokens(config, code, tx.verifier);
    await writeSession(tokens);
  } catch (error) {
    console.error("OAuth token exchange failed", error);
    return failure();
  }

  return NextResponse.redirect(new URL(config.postLoginPath, origin));
}
