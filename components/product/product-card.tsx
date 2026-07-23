"use client";

import Link from "next/link";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import { ProductImage } from "@/components/product/product-image";
import { AddToCart } from "@/components/cart/add-to-cart";
import { WishlistButton } from "@/components/product/wishlist-button";

/**
 * Carte produit avec :
 * — view-transition-name CSS pour le shared element morphing futur (React 19 stable)
 * — Container query pour s'adapter à tout contexte (grille, slider, bottom sheet)
 * — Touch targets ≥ 44px
 */
export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  return (
    <div className="product-card-container">
      <article className="group card overflow-hidden transition-colors duration-500 hover:border-gold/30">
        <Link
          href={`/produit/${product.slug}`}
          className="relative block aspect-square overflow-hidden bg-elevated"
        >
          {/* view-transition-name CSS — shared element morphing image → page produit */}
          <div
            className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
            style={{ viewTransitionName: `product-img-${product.slug}` }}
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
          <WishlistButton
            slug={product.slug}
            className="absolute right-3 top-3 size-10 bg-ink/60 hover:bg-ink/80"
          />
        </Link>

        <div className="flex flex-col gap-2.5 p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-faint">
                {product.category}
              </p>
              <Link href={`/produit/${product.slug}`}>
                <h3 className="mt-1 font-display text-base font-semibold leading-tight transition-colors group-hover:text-gold-bright sm:text-lg">
                  {product.name}
                </h3>
              </Link>
            </div>
          </div>

          <p className="text-sm text-muted line-clamp-2">{product.shortDescription}</p>

          <div className="mt-1 flex items-end justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold text-cream sm:text-xl">
                {formatPrice(product.priceCents)}
              </span>
              {product.compareAtCents && (
                <span className="text-sm text-faint line-through">
                  {formatPrice(product.compareAtCents)}
                </span>
              )}
            </div>
          </div>

          <div className="pt-1">
            <AddToCart product={product} size="sm" full />
          </div>
        </div>
      </article>
    </div>
  );
}
