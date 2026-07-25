"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useCart } from "@/lib/store/cart";
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

/** Suggestions "Complétez avec…" dans le tiroir panier. */
export function CartCrossSell() {
  const items = useCart((s) => s.items);
  const add = useCart((s) => s.add);
  const [products, setProducts] = useState<SlimProduct[] | null>(null);

  useEffect(() => {
    if (products === null) {
      fetch("/api/products")
        .then((r) => r.json())
        .then((d) => setProducts(d.products ?? []))
        .catch(() => setProducts([]));
    }
  }, [products]);

  if (!products) return null;

  // Proposer un produit en rupture ferait échouer le paiement une fois ajouté.
  const inCart = new Set(items.map((i) => i.slug));
  const suggestions = products
    .filter((p) => p.available && !inCart.has(p.slug))
    .slice(0, 2);
  if (suggestions.length === 0) return null;

  return (
    <div className="border-t border-line px-6 py-4">
      <p className="mb-3 text-xs uppercase tracking-[0.2em] text-faint">Complétez avec</p>
      <div className="space-y-3">
        {suggestions.map((p) => (
          <div key={p.slug} className="flex items-center gap-3">
            <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-elevated">
              <ProductImage file={p.image} alt={p.name} label={p.name} sizes="48px" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-cream">{p.name}</p>
              <p className="text-xs text-gold">{formatPrice(p.priceCents)}</p>
            </div>
            <button
              onClick={() =>
                add({
                  slug: p.slug,
                  name: p.name,
                  priceCents: p.priceCents,
                  image: p.image,
                })
              }
              className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-cream transition hover:border-gold/60 hover:text-gold-bright"
              aria-label={`Ajouter ${p.name}`}
            >
              <Plus className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
