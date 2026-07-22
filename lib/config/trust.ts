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
 * Claims are plain strings — deliberately no icon field. The bar used to pair
 * each claim with a stock line icon (shield, droplet, truck, padlock), which
 * is the visual equivalent of clip art: every template ships those same four,
 * so they made a real guarantee read as filler. The claim carries itself, and
 * a typographic mark separates them instead.
 */
export interface TrustClaim {
  label: string;
}

/**
 * The homepage ticker. Four claims is the scan ceiling — more and none of them
 * get read. These are the defensible defaults; swap in the stronger optional
 * claims below once they're true for your operation.
 */
export const TRUST_CLAIMS: TrustClaim[] = [
  { label: "100% Original" },
  { label: "Decanted from sealed bottles" },
  { label: "Pan-India shipping" },
  { label: "Secure checkout" },
];

/**
 * The product-page version, shown at the moment of decision (next to Add to
 * Cart). Kept to three so it never competes with the buy button.
 */
export const TRUST_CLAIMS_COMPACT: TrustClaim[] = [
  { label: "100% Original" },
  { label: "Decanted from sealed bottles" },
  { label: "Secure checkout" },
];

/**
 * Stronger claims to promote once verified — each lifts conversion more than
 * the defaults, but each is also a bigger promise:
 *   { label: "Cash on delivery" }        // only if you offer COD
 *   { label: "Ships in 2–3 days" }       // only if you hit it
 *   { label: "Authenticity guaranteed" } // only with a real refund path
 */
