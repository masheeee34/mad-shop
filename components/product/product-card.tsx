"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import { ProductImage } from "@/components/product/product-image";
import { AddToCart } from "@/components/cart/add-to-cart";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  return (
    <article className="group card overflow-hidden transition-colors duration-500 hover:border-gold/30">
      <Link
        href={`/produit/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-elevated"
      >
        <div className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105">
          <ProductImage
            file={product.images[0]}
            alt={product.name}
            label={product.name}
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </div>

        {product.badge && (
          <span className="absolute left-4 top-4 rounded-full bg-ink/80 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-gold backdrop-blur">
            {product.badge}
          </span>
        )}
        <span className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-ink/70 text-cream opacity-0 backdrop-blur transition-all duration-500 group-hover:opacity-100">
          <ArrowUpRight className="size-4" />
        </span>
      </Link>

      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-faint">
              {product.category}
            </p>
            <Link href={`/produit/${product.slug}`}>
              <h3 className="mt-1 font-display text-lg font-semibold leading-tight transition-colors group-hover:text-gold-bright">
                {product.name}
              </h3>
            </Link>
          </div>
        </div>

        <p className="text-sm text-muted line-clamp-2">{product.shortDescription}</p>

        <div className="mt-1 flex items-end justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-semibold text-cream">
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
  );
}
