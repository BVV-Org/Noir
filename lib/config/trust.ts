/**
 * Trust claims — the reassurances a first-time fragrance buyer needs before
 * they'll risk a decant purchase (see the conversion analysis: fear of fakes
 * is the #1 objection in the Indian decant market, and a plain 5ml atomiser
 * gives none of the physical authenticity cues a sealed retail box would).
 *
 * ────────────────────────────────────────────────────────────────────────
 *  EVERY LINE HERE IS A PROMISE TO THE CUSTOMER. Only ship claims that are
 *  operationally TRUE. A claim you can't honour ("authenticity guaranteed"
 *  with no refund path, a shipping time you routinely miss) does more harm
 *  in one angry review than the bar ever did good. Edit freely — this is the
 *  single source of truth the components render from.
 * ────────────────────────────────────────────────────────────────────────
 *
 * `icon` is a string key, mapped to a `lucide-react` component in TrustBar —
 * data stays free of UI imports, matching the nav config convention.
 */
export type TrustIcon =
  | "original"
  | "sealed"
  | "shipping"
  | "secure"
  | "returns"
  | "cod";

export interface TrustClaim {
  icon: TrustIcon;
  label: string;
}

/**
 * The homepage strip (under the hero). Four claims is the scan ceiling — more
 * and none of them get read. These four are the defensible defaults; swap in
 * the stronger optional claims below once they're true for your operation.
 */
export const TRUST_CLAIMS: TrustClaim[] = [
  { icon: "original", label: "100% Original" },
  { icon: "sealed", label: "Decanted from sealed bottles" },
  { icon: "shipping", label: "Pan-India shipping" },
  { icon: "secure", label: "Secure checkout" },
];

/**
 * The product-page version, shown at the moment of decision (next to Add to
 * Cart). Kept to three so it never competes with the buy button.
 */
export const TRUST_CLAIMS_COMPACT: TrustClaim[] = [
  { icon: "original", label: "100% Original" },
  { icon: "sealed", label: "Decanted from sealed bottles" },
  { icon: "secure", label: "Secure checkout" },
];

/**
 * Stronger claims to promote once verified — each lifts conversion more than
 * the defaults, but each is also a bigger promise:
 *   { icon: "cod",     label: "Cash on delivery" }        // only if you offer COD
 *   { icon: "shipping", label: "Ships in 2–3 days" }      // only if you hit it
 *   { icon: "returns", label: "Authenticity guaranteed" } // only with a real refund path
 */
