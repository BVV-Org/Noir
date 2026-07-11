import { NextResponse, type NextRequest } from "next/server";
import { customerAccountConfig } from "@/lib/auth/config";
import { refreshAccessToken } from "@/lib/auth/tokens";
import { AUTH_COOKIES, AUTH_SESSION_MAX_AGE } from "@/lib/constants";

/**
 * Keep the Customer Account access token fresh on account routes.
 *
 * A Server Component render cannot write cookies, so `getCustomer()` cannot
 * refresh an expired token itself. This middleware runs first: when the access
 * token is missing or about to expire but a refresh token is present, it renews
 * the pair and writes the new cookies onto the response, so by the time
 * `/account` renders the token is valid. A failed refresh clears the session,
 * degrading to the signed-out shell rather than an error.
 *
 * Scoped to `/account/*` — the only place `getCustomer()` is read.
 */
export const config = {
  matcher: ["/account/:path*"],
};

const REFRESH_SKEW_MS = 30_000;

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: AUTH_SESSION_MAX_AGE,
  };
}

export async function middleware(request: NextRequest) {
  const cfg = customerAccountConfig;
  if (!cfg) return NextResponse.next();

  const refreshToken = request.cookies.get(AUTH_COOKIES.refreshToken)?.value;
  if (!refreshToken) return NextResponse.next();

  const accessToken = request.cookies.get(AUTH_COOKIES.accessToken)?.value;
  const expiresAtRaw = request.cookies.get(AUTH_COOKIES.expiresAt)?.value;
  const expiresAt = expiresAtRaw ? Number.parseInt(expiresAtRaw, 10) : 0;

  const stillFresh =
    accessToken &&
    Number.isFinite(expiresAt) &&
    expiresAt > Date.now() + REFRESH_SKEW_MS;
  if (stillFresh) return NextResponse.next();

  try {
    const previousIdToken = request.cookies.get(AUTH_COOKIES.idToken)?.value;
    const tokens = await refreshAccessToken(cfg, refreshToken, previousIdToken);

    const response = NextResponse.next();
    const options = cookieOptions();
    response.cookies.set(AUTH_COOKIES.accessToken, tokens.accessToken, options);
    response.cookies.set(AUTH_COOKIES.refreshToken, tokens.refreshToken, options);
    response.cookies.set(AUTH_COOKIES.expiresAt, String(tokens.expiresAt), options);
    if (tokens.idToken) {
      response.cookies.set(AUTH_COOKIES.idToken, tokens.idToken, options);
    }
    return response;
  } catch (error) {
    console.error("Token refresh failed; clearing session", error);
    const response = NextResponse.next();
    for (const name of Object.values(AUTH_COOKIES)) {
      response.cookies.delete(name);
    }
    return response;
  }
}
