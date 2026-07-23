"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Search, X, Loader2 } from "lucide-react";
import { ProductImage } from "@/components/product/product-image";
import { formatPrice } from "@/lib/utils";

type SlimProduct = {
  slug: string;
  name: string;
  category: string;
  priceCents: number;
  image: string;
  shortDescription: string;
};

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<SlimProduct[] | null>(null);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Charge la liste une seule fois, à la première ouverture.
  useEffect(() => {
    if (open && products === null) {
      fetch("/api/products")
        .then((r) => r.json())
        .then((d) => setProducts(d.products ?? []))
        .catch(() => setProducts([]));
    }
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open, products]);

  // Raccourci clavier Cmd/Ctrl+K + Échap.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    if (!products) return [];
    const term = q.trim().toLowerCase();
    if (!term) return products.slice(0, 6);
    return products
      .filter((p) =>
        [p.name, p.shortDescription, p.category].join(" ").toLowerCase().includes(term),
      )
      .slice(0, 8);
  }, [q, products]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="grid size-10 place-items-center rounded-full text-cream transition hover:text-gold-bright"
        aria-label="Rechercher"
      >
        <Search className="size-5" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="fixed inset-x-4 top-24 z-50 mx-auto max-w-xl"
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="card overflow-hidden">
                <div className="flex items-center gap-3 border-b border-line px-5">
                  <Search className="size-5 text-faint" />
                  <input
                    ref={inputRef}
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Rechercher un produit…"
                    className="flex-1 bg-transparent py-4 text-cream placeholder:text-faint focus:outline-none"
                  />
                  <button
                    onClick={() => setOpen(false)}
                    className="text-faint hover:text-cream"
                    aria-label="Fermer"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-2" data-lenis-prevent>
                  {products === null ? (
                    <div className="flex items-center justify-center gap-2 py-10 text-muted">
                      <Loader2 className="size-4 animate-spin" /> Chargement…
                    </div>
                  ) : results.length === 0 ? (
                    <p className="py-10 text-center text-muted">Aucun résultat pour « {q} ».</p>
                  ) : (
                    results.map((p) => (
                      <Link
                        key={p.slug}
                        href={`/produit/${p.slug}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-4 rounded-xl p-2.5 transition hover:bg-elevated"
                      >
                        <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-elevated">
                          <ProductImage file={p.image} alt={p.name} label={p.name} sizes="56px" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-cream">{p.name}</span>
                          <span className="block text-xs text-faint">{p.category}</span>
                        </span>
                        <span className="text-sm font-semibold text-gold">
                          {formatPrice(p.priceCents)}
                        </span>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
