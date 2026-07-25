import type { Metadata } from "next";
import { getProducts } from "@/lib/data/catalog";
import { WishlistGrid } from "@/components/product/wishlist-grid";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Mes favoris",
  description: "Les produits MAD Shop que vous avez mis de côté.",
  robots: { index: false, follow: true },
};

/**
 * Les favoris sont conservés dans le navigateur, mais les fiches viennent du
 * serveur : sans elles, les cartes s'afficheraient sans visuel, sans promotion
 * et surtout sans stock — donc toutes annoncées en rupture.
 */
export default async function FavorisPage() {
  const products = await getProducts();

  return (
    <div className="shell pt-32 pb-10 md:pt-40">
      <span className="gold-rule" />
      <h1 className="display mt-3 text-4xl md:text-5xl">Mes favoris</h1>
      <p className="mt-4 text-muted">
        Retrouvez ici les produits que vous avez mis de côté.
      </p>

      <WishlistGrid products={products} />
    </div>
  );
}
