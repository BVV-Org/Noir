import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { getProvider } from "@/lib/data";
import { Container } from "@/components/layout/container";
import { WishlistContent } from "@/components/commerce/wishlist-content";

/** Private to the visitor's browser; never indexed. */
export const metadata: Metadata = buildMetadata({
  title: "Wishlist",
  description: "The fragrances you have saved.",
  noIndex: true,
});

/**
 * Wishlist.
 *
 * The page is a Server Component that fetches the catalogue; the saved handles
 * live in the browser, so the selection happens client-side (TDD §9). Fetching
 * the whole catalogue is right for a store of this size and wrong for a large
 * one — when the live provider lands, replace this with a query over the saved
 * handles.
 */
export default async function WishlistPage() {
  const catalogue = await getProvider().getProducts({ first: 250 });

  return (
    <Container className="py-12 sm:py-16">
      <header className="max-w-2xl">
        <p className="overline">Your vault</p>
        <h1 className="mt-4 text-h1 font-semibold text-foreground">Wishlist</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Saved to this browser. Signing in will sync it across devices in a
          future release.
        </p>
      </header>

      <div className="mt-12">
        <WishlistContent catalogue={catalogue.items} />
      </div>
    </Container>
  );
}
