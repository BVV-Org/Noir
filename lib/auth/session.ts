import "server-only";
import { cookies } from "next/headers";
import {
  AUTH_COOKIES,
  AUTH_SESSION_MAX_AGE,
  OAUTH_TX_COOKIES,
} from "@/lib/constants";
import type { TokenSet } from "@/lib/auth/tokens";

/**
 * Session cookie plumbing for the Node contexts — Route Handlers (which persist
 * and clear the session) and Server Components (which only read it). Token
 * refresh is not done here: a Server Component render cannot set cookies, so the
 * Edge middleware keeps the access token fresh before the render runs.
 */

const secure = process.env.NODE_ENV === "production";

/** `sameSite: lax` so the cookie survives the top-level redirect back from Shopify. */
function sessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

/** Read the current session, or `null` when signed out. Safe in any server context. */
export async function readSession(): Promise<TokenSet | null> {
  const store = await cookies();
  const accessToken = store.get(AUTH_COOKIES.accessToken)?.value;
  const refreshToken = store.get(AUTH_COOKIES.refreshToken)?.value;
  const expiresAtRaw = store.get(AUTH_COOKIES.expiresAt)?.value;

  if (!accessToken || !refreshToken || !expiresAtRaw) return null;

  const expiresAt = Number.parseInt(expiresAtRaw, 10);
  if (!Number.isFinite(expiresAt)) return null;

  return {
    accessToken,
    refreshToken,
    idToken: store.get(AUTH_COOKIES.idToken)?.value,
    expiresAt,
  };
}

/** Persist a token set. Call only from a Route Handler or Server Action. */
export async function writeSession(tokens: TokenSet): Promise<void> {
  const store = await cookies();
  const options = sessionCookieOptions(AUTH_SESSION_MAX_AGE);

  store.set(AUTH_COOKIES.accessToken, tokens.accessToken, options);
  store.set(AUTH_COOKIES.refreshToken, tokens.refreshToken, options);
  store.set(AUTH_COOKIES.expiresAt, String(tokens.expiresAt), options);
  if (tokens.idToken) {
    store.set(AUTH_COOKIES.idToken, tokens.idToken, options);
  }
}

/** Sign out locally: drop every session cookie. */
export async function clearSession(): Promise<void> {
  const store = await cookies();
  for (const name of Object.values(AUTH_COOKIES)) store.delete(name);
}

/** Store the OAuth transaction secrets for the round trip to Shopify. */
export async function writeOAuthTransaction(tx: {
  state: string;
  verifier: string;
  nonce: string;
}): Promise<void> {
  const store = await cookies();
  const options = sessionCookieOptions(60 * 10);
  store.set(OAUTH_TX_COOKIES.state, tx.state, options);
  store.set(OAUTH_TX_COOKIES.verifier, tx.verifier, options);
  store.set(OAUTH_TX_COOKIES.nonce, tx.nonce, options);
}

/** Read and consume the OAuth transaction secrets at the callback. */
export async function readOAuthTransaction(): Promise<{
  state?: string;
  verifier?: string;
  nonce?: string;
}> {
  const store = await cookies();
  return {
    state: store.get(OAUTH_TX_COOKIES.state)?.value,
    verifier: store.get(OAUTH_TX_COOKIES.verifier)?.value,
    nonce: store.get(OAUTH_TX_COOKIES.nonce)?.value,
  };
}

export async function clearOAuthTransaction(): Promise<void> {
  const store = await cookies();
  for (const name of Object.values(OAUTH_TX_COOKIES)) store.delete(name);
}
