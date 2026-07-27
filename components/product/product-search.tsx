"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { Product } from "@/lib/products";
import { ProductCard } from "@/components/product/product-card";
import { trackViewItemList, trackSearch } from "@/lib/analytics";

/** Recherche + grille produits filtrée instantanément (page boutique). */
export function ProductSearch({
  products,
  initialQuery = "",
}: {
  products: Product[];
  /** Terme issu de l'URL (`/boutique?q=…`), notamment depuis Google. */
  initialQuery?: string;
}) {
  const [q, setQ] = useState(initialQuery);
  const listReported = useRef(false);

  // Une seule remontée de la liste affichée, à l'arrivée sur la boutique.
  useEffect(() => {
    if (listReported.current || products.length === 0) return;
    listReported.current = true;
    trackViewItemList(products, "boutique");
  }, [products]);

  // Ce que les visiteurs cherchent oriente le catalogue et les mots-clés.
  useEffect(() => {
    const term = q.trim();
    if (term.length < 3) return;
    const timer = setTimeout(() => trackSearch(term), 800);
    return () => clearTimeout(timer);
  }, [q]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return products;
    return products.filter((p) =>
      [p.name, p.shortDescription, p.category, ...p.highlights]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [q, products]);

  return (
    <div>
      {/* Barre de recherche — pleine largeur sur mobile */}
      <div className="relative mt-6 w-full sm:max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-faint" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher un produit…"
          inputMode="search"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="w-full rounded-full border border-line bg-elevated py-3.5 pl-11 pr-10 text-sm text-cream placeholder:text-faint focus:border-gold/50 focus:outline-none"
        />
        {q && (
          <button
            onClick={() => setQ("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-cream"
            aria-label="Effacer"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <motion.div
        layout
        className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((p) => (
            <motion.div
              key={p.slug}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
            >
              <ProductCard product={p} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <p className="mt-16 text-center text-muted">
          Aucun produit ne correspond à « {q} ».
        </p>
      )}
    </div>
  );
}
