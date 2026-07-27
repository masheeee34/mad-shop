"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useWishlist } from "@/lib/store/wishlist";
import type { Product } from "@/lib/products";
import { ProductCard } from "@/components/product/product-card";
import { ButtonLink } from "@/components/ui/button";

/**
 * Grille des favoris.
 *
 * Le catalogue arrive complet depuis le serveur ; seule la sélection vient du
 * navigateur. Le premier rendu doit donc rester identique côté serveur et
 * client — d'où l'attente du montage avant d'afficher quoi que ce soit.
 */
export function WishlistGrid({ products }: { products: Product[] }) {
  const slugs = useWishlist((s) => s.slugs);
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="mt-10 min-h-[40vh]" aria-hidden />;
  }

  const favorites = products.filter((p) => slugs.includes(p.slug));

  if (favorites.length === 0) {
    return (
      <div className="mt-16 flex flex-col items-center gap-5 text-center">
        <Heart className="size-12 text-faint" />
        <p className="text-muted">
          Vous n&apos;avez pas encore de favoris. Touchez le cœur d&apos;un
          produit pour le retrouver ici.
        </p>
        <ButtonLink href="/boutique" size="lg">
          Découvrir la boutique
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {favorites.map((p) => (
        <ProductCard key={p.slug} product={p} />
      ))}
    </div>
  );
}
