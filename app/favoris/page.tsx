"use client";

import { useEffect, useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { useWishlist } from "@/lib/store/wishlist";
import type { Product } from "@/lib/products";
import { ProductCard } from "@/components/product/product-card";
import { ButtonLink } from "@/components/ui/button";

export default function FavorisPage() {
  const slugs = useWishlist((s) => s.slugs);
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.products ?? []))
      .catch(() => setProducts([]));
  }, []);

  const favorites = products?.filter((p) => slugs.includes(p.slug)) ?? [];

  return (
    <div className="shell pt-32 pb-10 md:pt-40">
      <span className="gold-rule" />
      <h1 className="display mt-3 text-4xl md:text-5xl">Mes favoris</h1>
      <p className="mt-4 text-muted">
        Retrouvez ici les produits que vous avez mis de côté.
      </p>

      {products === null ? (
        <div className="mt-16 flex items-center justify-center gap-2 text-muted">
          <Loader2 className="size-5 animate-spin" /> Chargement…
        </div>
      ) : favorites.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-5 text-center">
          <Heart className="size-12 text-faint" />
          <p className="text-muted">
            Vous n'avez pas encore de favoris. Cliquez sur le cœur d'un produit
            pour l'ajouter ici.
          </p>
          <ButtonLink href="/boutique" size="lg">
            Découvrir la boutique
          </ButtonLink>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
