import "server-only";

/**
 * PKCE + OAuth entropy helpers.
 *
 * All randomness and hashing goes through the Web Crypto API (`globalThis.crypto`),
 * which is present in both the Node route handlers and the Edge middleware, so
 * there is one implementation rather than a runtime fork.
 */

/** base64url without padding, as required by RFC 7636 for the code challenge. */
function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** A URL-safe random string (default 32 bytes) for state, nonce, and verifier. */
export function randomString(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

/** S256 code challenge: base64url(SHA-256(verifier)). */
export async function codeChallengeFrom(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(new Uint8Array(digest));
}
