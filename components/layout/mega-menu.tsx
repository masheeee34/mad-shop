"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { categories } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import { ProductImage } from "@/components/product/product-image";

type SlimProduct = {
  slug: string;
  name: string;
  category: string;
  priceCents: number;
  image: string;
  available: boolean;
};

/** Cache module : le catalogue n'est chargé qu'une fois par session. */
let cache: SlimProduct[] | null = null;

const CATEGORY_BLURB: Record<string, string> = {
  Audio: "Casques et écouteurs testés à l'écoute, pas sur la fiche technique.",
  Sécurité: "Garder un œil sur ce qui compte, sans abonnement mensuel.",
  Connecté: "Des objets qui simplifient le quotidien, vraiment.",
};

/**
 * Panneau déroulant du menu Boutique.
 *
 * Les produits ne sont chargés qu'à la première ouverture : le menu ne coûte
 * rien aux visiteurs qui n'y touchent jamais, c'est-à-dire la majorité.
 */
export function MegaMenu({ onNavigate }: { onNavigate: () => void }) {
  const [products, setProducts] = useState<SlimProduct[]>(cache ?? []);

  useEffect(() => {
    if (cache) return;
    let cancelled = false;

    fetch("/api/products")
      .then((r) => r.json())
      .then((data: { products: SlimProduct[] }) => {
        if (cancelled) return;
        cache = data.products ?? [];
        setProducts(cache);
      })
      .catch(() => {
        /* le menu reste utilisable sans les vignettes */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Une vitrine ne met pas en avant ce qu'elle ne peut pas vendre.
  const featured = products.filter((p) => p.available).slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-x-0 top-full hidden border-b border-line bg-ink/95 backdrop-blur-xl md:block"
    >
      <div className="shell grid gap-10 py-10 lg:grid-cols-[0.85fr_1.15fr]">
        {/* Rayons */}
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-faint">Rayons</p>
          <ul className="mt-5 space-y-1">
            <li>
              <Link
                href="/boutique"
                onClick={onNavigate}
                className="group flex items-baseline justify-between gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-charcoal"
              >
                <span className="font-display text-lg font-semibold uppercase tracking-tight transition-colors group-hover:text-gold-bright">
                  Tout le catalogue
                </span>
                <ArrowRight className="size-4 shrink-0 -translate-x-1 text-gold opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category}>
                <Link
                  href={`/boutique?cat=${encodeURIComponent(category)}`}
                  onClick={onNavigate}
                  className="group flex items-start justify-between gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-charcoal"
                >
                  <span>
                    <span className="block font-display text-lg font-semibold uppercase tracking-tight transition-colors group-hover:text-gold-bright">
                      {category}
                    </span>
                    <span className="mt-0.5 block text-sm text-muted">
                      {CATEGORY_BLURB[category]}
                    </span>
                  </span>
                  <ArrowRight className="mt-1.5 size-4 shrink-0 -translate-x-1 text-gold opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Mise en avant */}
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-faint">
            En ce moment
          </p>
          <div className="mt-5 grid grid-cols-3 gap-4">
            {featured.map((product) => (
              <Link
                key={product.slug}
                href={`/produit/${product.slug}`}
                onClick={onNavigate}
                className="group"
              >
                <div className="relative aspect-square overflow-hidden rounded-xl bg-elevated">
                  <div className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105">
                    <ProductImage
                      file={product.image}
                      alt={product.name}
                      label={product.name}
                      sizes="220px"
                    />
                  </div>
                </div>
                <p className="mt-3 line-clamp-1 text-sm font-medium transition-colors group-hover:text-gold-bright">
                  {product.name}
                </p>
                <p className="text-sm text-muted">{formatPrice(product.priceCents)}</p>
              </Link>
            ))}

            {/* Réserve la place pendant le chargement pour éviter le saut de mise en page. */}
            {featured.length === 0 &&
              [0, 1, 2].map((i) => (
                <div key={i} className="aspect-square rounded-xl bg-elevated/50" />
              ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
