import { NextResponse } from "next/server";
import { customerAccountConfig } from "@/lib/auth/config";
import { clearSession, readSession } from "@/lib/auth/session";

/**
 * Sign out.
 *
 * Clears the local session cookies, then hands off to Shopify's end-session
 * endpoint so the customer is signed out of the account system too — otherwise
 * the next /api/auth/login would silently re-authenticate them. `id_token_hint`
 * lets Shopify skip its own logout confirmation.
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const config = customerAccountConfig;
  const origin = new URL(request.url).origin;

  const session = await readSession();
  await clearSession();

  if (!config) return NextResponse.redirect(new URL("/", origin));

  const homeUrl = new URL("/", new URL(config.redirectUri).origin).toString();

  const logoutUrl = new URL(config.logoutEndpoint);
  if (session?.idToken) {
    logoutUrl.searchParams.set("id_token_hint", session.idToken);
  }
  logoutUrl.searchParams.set("post_logout_redirect_uri", homeUrl);

  return NextResponse.redirect(logoutUrl);
}
