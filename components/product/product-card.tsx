"use client";

import Link from "next/link";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import { ProductImage } from "@/components/product/product-image";
import { AddToCart } from "@/components/cart/add-to-cart";
import { WishlistButton } from "@/components/product/wishlist-button";

/**
 * Carte produit.
 *
 * La vignette porte un `view-transition-name` propre au produit : couplée à
 * celle de la fiche, l'image se transforme au lieu de disparaître pendant la
 * navigation.
 */
export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  return (
    <article className="group card relative flex h-full flex-col overflow-hidden transition-colors duration-500 hover:border-gold/30">
      <Link
        href={`/produit/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-elevated"
      >
        <div
          className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
          style={undefined}
        >
          <ProductImage
            file={product.images[0]}
            alt={product.name}
            label={product.name}
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </div>

        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-gold backdrop-blur">
            {product.badge}
          </span>
        )}
      </Link>

      {/* Hors du lien : un bouton imbriqué dans un lien est invalide et piège
          la navigation au clavier. */}
      <WishlistButton
        slug={product.slug}
        product={{
          slug: product.slug,
          name: product.name,
          priceCents: product.priceCents,
          category: product.category,
        }}
        className="absolute right-3 top-3 z-10 size-10 bg-ink/60 hover:bg-ink/80"
      />

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <p className="text-[11px] uppercase tracking-[0.2em] text-faint">
          {product.category}
        </p>
        <Link href={`/produit/${product.slug}`} className="-mt-1.5">
          <h3 className="font-display text-base font-semibold leading-tight transition-colors group-hover:text-gold-bright sm:text-lg">
            {product.name}
          </h3>
        </Link>

        <p className="line-clamp-2 text-sm text-muted">{product.shortDescription}</p>

        {/* `mt-auto` colle le prix et le bouton en bas : dans une grille, les
            appels à l'action restent alignés d'une carte à l'autre. */}
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="text-lg font-semibold text-cream sm:text-xl">
            {formatPrice(product.priceCents)}
          </span>
          {product.compareAtCents && (
            <span className="text-sm text-faint line-through">
              {formatPrice(product.compareAtCents)}
            </span>
          )}
        </div>

        <AddToCart product={product} size="sm" full />
      </div>
    </article>
  );
}
