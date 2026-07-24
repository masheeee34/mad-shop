"use client";

import { useEffect, useRef, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCart } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import { hapticSuccess } from "@/lib/haptics";
import type { Product } from "@/lib/products";

/**
 * Barre d'achat sticky en bas de la page produit — mobile uniquement.
 * Se révèle dès que le vrai BuyPanel sort du viewport (IntersectionObserver).
 * Permet d'acheter en 1 tap depuis n'importe où sur la page.
 */
export function MobileBuyBar({
  product,
  triggerRef,
}: {
  product: Product;
  triggerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const add = useCart((s) => s.add);
  const [visible, setVisible] = useState(false);
  const [added, setAdded] = useState(false);

  // IntersectionObserver — observe le vrai BuyPanel
  useEffect(() => {
    const el = triggerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // La barre apparaît quand le vrai bouton sort du viewport
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "0px 0px -60px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [triggerRef]);

  function handleAdd() {
    add(
      {
        slug: product.slug,
        name: product.name,
        priceCents: product.priceCents,
        image: product.images[0],
      },
      1,
    );
    hapticSuccess();
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  const stock = product.stockQuantity ?? (product.inStock ? 10 : 0);
  const isAvailable = product.inStock && stock > 0;
  if (!isAvailable) return null;

  return (
    <div
      className={`mobile-buy-bar lg:hidden ${visible ? "" : "bar-hidden"}`}
      aria-hidden={!visible}
    >
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="truncate text-xs text-muted">{product.name}</p>
          <p className="text-base font-semibold text-cream">
            {formatPrice(product.priceCents)}
            {product.compareAtCents && (
              <span className="ml-2 text-sm text-faint line-through">
                {formatPrice(product.compareAtCents)}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex h-12 shrink-0 items-center gap-2 rounded-full bg-cream px-6 text-sm font-semibold uppercase tracking-wide text-ink transition-all duration-200 active:scale-95 active:bg-gold-bright"
        >
          <AnimatePresence mode="wait" initial={false}>
            {added ? (
              <motion.span
                key="ok"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5"
              >
                ✓ Ajouté
              </motion.span>
            ) : (
              <motion.span
                key="add"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5"
              >
                <ShoppingBag className="size-4" />
                Ajouter
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
}
