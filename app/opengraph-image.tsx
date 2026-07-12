import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/config/site";

/**
 * The fallback social card, generated at build time.
 *
 * `siteConfig.ogImage` previously pointed at `/og-default.jpg`, a file that was
 * never committed — every share of the homepage, the journal index, or the about
 * page linked a 404. Generating it removes the possibility of that drifting
 * again: there is no asset to forget to add.
 *
 * Routes with real imagery (products, collections, kits, articles) override this
 * through `buildMetadata({ image })`. Everything else inherits it.
 *
 * Deliberately type-only, using the brand's anchor colours and the rarity
 * emerald. `next/og` runs Satori, which supports a strict subset of CSS: flex
 * only, no `gap` on some versions, no external fonts without loading them. The
 * design is kept simple for that reason, not for lack of ambition.
 */
export const alt = `${siteConfig.name} · ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "80px",
        backgroundColor: "#111111",
        // Satori supports linear-gradient; the vault's light from above.
        backgroundImage:
          "radial-gradient(120% 120% at 50% 0%, #1E1E1E 0%, #111111 55%)",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 22,
          letterSpacing: 10,
          textTransform: "uppercase",
          color: "#A3A3A3",
        }}
      >
        Noir Vault
      </div>

      <div
        style={{
          display: "flex",
          marginTop: 40,
          fontSize: 84,
          fontWeight: 700,
          letterSpacing: -2,
          lineHeight: 1.05,
          color: "#F5F5F5",
        }}
      >
        Enter The Vault.
      </div>

      <div
        style={{
          display: "flex",
          marginTop: 8,
          fontSize: 84,
          fontWeight: 700,
          letterSpacing: -2,
          lineHeight: 1.05,
          color: "#00C27A",
        }}
      >
        Level Up Your Scent.
      </div>

      <div
        style={{
          display: "flex",
          marginTop: 56,
          height: 4,
          width: 160,
          backgroundColor: "#D4AF37",
        }}
      />
    </div>,
    size
  );
}
