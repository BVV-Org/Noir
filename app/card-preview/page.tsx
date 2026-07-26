import { getProvider } from "@/lib/data";
import { ProductGrid } from "@/components/commerce/product-grid";

/** Temporary scaffold for reviewing the ProductCard restyle. Delete when done. */
export default async function CardPreviewPage() {
  const { items } = await getProvider().getProducts({ first: 8 });

  return (
    <main className="px-8 py-10">
      <ProductGrid products={items} priorityCount={2} />
    </main>
  );
}
