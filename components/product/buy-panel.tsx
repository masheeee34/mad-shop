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
import { NotifyModal } from "@/components/product/notify-modal";

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
  const [showNotify, setShowNotify] = useState(false);

  const stock = product.stockQuantity ?? (product.inStock ? 10 : 0);
  const isAvailable = product.inStock && stock > 0;
  const maxQty = Math.min(20, Math.max(1, stock));

  function handleAdd() {
    if (!isAvailable) return;
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
      {isAvailable && (
        <div className="flex items-center gap-2 text-xs font-medium">
          {stock <= 5 ? (
            <span className="flex items-center gap-1.5 text-gold animate-pulse">
              <span className="size-2 rounded-full bg-gold" />
              ⚡ Stock très limité : plus que {stock} exemplaire{stock > 1 ? "s" : ""} disponible{stock > 1 ? "s" : ""} !
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-it-green">
              <span className="size-2 rounded-full bg-it-green" />
              En stock ({stock} disponibles — expédié sous 24h)
            </span>
          )}
        </div>
      )}

      {isAvailable ? (
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
              onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
              disabled={qty >= maxQty}
              className="grid size-12 place-items-center text-muted transition hover:text-cream disabled:opacity-30 active:scale-90"
              aria-label="Augmenter la quantité"
            >
              <Plus className="size-4" />
            </button>
          </div>

          {/* Bouton principal */}
          <button
            onClick={handleAdd}
            className="group relative flex h-12 flex-1 items-center justify-center gap-3 overflow-hidden rounded-full bg-cream px-6 text-sm font-semibold uppercase tracking-wide text-ink transition-all duration-300 hover:bg-gold-bright active:scale-[0.98]"
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
                  Ajouter — {formatPrice(product.priceCents * qty)}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-2xl border border-it-red/30 bg-it-red/5 p-4 text-center">
            <span className="text-xs uppercase tracking-widest text-it-red font-bold">
              🚫 Rupture de stock
            </span>
            <p className="mt-1 text-sm text-muted">
              Ce produit n'est plus disponible actuellement (0 exemplaire en stock).
            </p>
          </div>
          <button
            onClick={() => setShowNotify(true)}
            className="w-full flex h-12 items-center justify-center gap-2 rounded-full border border-gold/50 bg-gold/10 px-6 text-sm font-semibold uppercase tracking-wide text-gold-bright transition hover:bg-gold/20"
          >
            🔔 M'avertir dès le retour en stock 🔥
          </button>
        </div>
      )}

      <ReserveButton productName={product.name} productSlug={product.slug} />

      <NotifyModal
        productSlug={product.slug}
        productName={product.name}
        isOpen={showNotify}
        onClose={() => setShowNotify(false)}
      />
    </div>
  );
}
