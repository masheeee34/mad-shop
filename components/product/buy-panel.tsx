"use client";

import { useRef } from "react";
import { Minus, Plus, Check } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useCart } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import { trackAddToCart } from "@/lib/analytics";
import { hapticSuccess } from "@/lib/haptics";
import type { Product } from "@/lib/products";
import { ReserveButton } from "@/components/product/reserve-button";

/**
 * Panneau d'achat : quantité + ajout panier avec total en direct.
 * Expose un ref pour que MobileBuyBar puisse observer sa visibilité.
 */
export function BuyPanel({
  product,
  panelRef,
}: {
  product: Product;
  panelRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    add(
      {
        slug: product.slug,
        name: product.name,
        priceCents: product.priceCents,
        image: product.images[0],
      },
      qty,
    );
    trackAddToCart({
      slug: product.slug,
      name: product.name,
      priceCents: product.priceCents,
      quantity: qty,
    });
    hapticSuccess();
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div ref={panelRef} className="space-y-4">
      <div className="flex items-stretch gap-3">
        {/* Sélecteur de quantité */}
        <div className="flex items-center rounded-full border border-line-strong">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="grid size-12 place-items-center text-muted transition hover:text-cream active:scale-90"
            aria-label="Diminuer la quantité"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-8 text-center text-lg tabular-nums">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(20, q + 1))}
            className="grid size-12 place-items-center text-muted transition hover:text-cream active:scale-90"
            aria-label="Augmenter la quantité"
          >
            <Plus className="size-4" />
          </button>
        </div>

        {/* Bouton principal */}
        <button
          onClick={handleAdd}
          disabled={!product.inStock}
          className="group relative flex h-12 flex-1 items-center justify-center gap-3 overflow-hidden rounded-full bg-cream px-6 text-sm font-semibold uppercase tracking-wide text-ink transition-all duration-300 hover:bg-gold-bright active:scale-[0.98] disabled:opacity-50"
        >
          <AnimatePresence mode="wait" initial={false}>
            {added ? (
              <motion.span
                key="ok"
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -14, opacity: 0 }}
                className="inline-flex items-center gap-2"
              >
                <Check className="size-4" /> Ajouté au panier
              </motion.span>
            ) : (
              <motion.span
                key="add"
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -14, opacity: 0 }}
                className="inline-flex items-center gap-2"
              >
                {product.inStock
                  ? `Ajouter — ${formatPrice(product.priceCents * qty)}`
                  : "Rupture de stock"}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      <ReserveButton productName={product.name} productSlug={product.slug} />
    </div>
  );
}
