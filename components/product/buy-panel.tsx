"use client";

import { useEffect, useState } from "react";
import { Minus, Plus, Check, Bell, Truck, RotateCcw, ShieldCheck } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCart } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import { trackAddToCart, trackViewItem } from "@/lib/analytics";
import { hapticSuccess } from "@/lib/haptics";
import { FREE_SHIPPING_CENTS, RETURN_WINDOW_DAYS } from "@/lib/config";
import type { Product } from "@/lib/products";
import { ReserveButton } from "@/components/product/reserve-button";
import { NotifyModal } from "@/components/product/notify-modal";
import { WishlistButton } from "@/components/product/wishlist-button";
import { ExpressCheckout } from "@/components/product/express-checkout";

/** En dessous de ce seuil, la rareté est réelle et mérite d'être signalée. */
const LOW_STOCK_THRESHOLD = 5;

/**
 * Panneau d'achat : quantité, ajout au panier et réassurance immédiate.
 * Expose un ref pour que la barre d'achat mobile puisse observer sa visibilité.
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
  const lowStock = isAvailable && stock <= LOW_STOCK_THRESHOLD;
  const qualifiesForFreeShipping = product.priceCents * qty >= FREE_SHIPPING_CENTS;

  // Consultation de la fiche — événement de base du remarketing.
  useEffect(() => {
    trackViewItem({
      slug: product.slug,
      name: product.name,
      priceCents: product.priceCents,
      category: product.category,
    });
  }, [product.slug, product.name, product.priceCents, product.category]);

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
      category: product.category,
    });
    hapticSuccess();
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div ref={panelRef} className="space-y-5">
      {isAvailable && (
        <p className="flex items-center gap-2 text-xs font-medium">
          <span
            className={`size-1.5 rounded-full ${lowStock ? "bg-gold" : "bg-it-green"}`}
          />
          {lowStock ? (
            <span className="text-gold">
              Plus que {stock} exemplaire{stock > 1 ? "s" : ""} en stock
            </span>
          ) : (
            <span className="text-it-green">En stock — expédié sous 24 h</span>
          )}
        </p>
      )}

      {isAvailable ? (
        <div className="space-y-4">
          {/* Au-dessus du panier : sur mobile, c'est le chemin le plus court
              entre la fiche et le paiement. */}
          <ExpressCheckout
            items={[{ slug: product.slug, quantity: qty }]}
            trackedItems={[
              {
                slug: product.slug,
                name: product.name,
                priceCents: product.priceCents,
                quantity: qty,
                category: product.category,
              },
            ]}
          />

          <div className="flex items-stretch gap-3">
            <div className="flex items-center rounded-full border border-line-strong">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                className="grid size-12 place-items-center text-muted transition hover:text-cream disabled:opacity-30 active:scale-90"
                aria-label="Diminuer la quantité"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-8 text-center text-lg tabular-nums" aria-live="polite">
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                disabled={qty >= maxQty}
                className="grid size-12 place-items-center text-muted transition hover:text-cream disabled:opacity-30 active:scale-90"
                aria-label="Augmenter la quantité"
              >
                <Plus className="size-4" />
              </button>
            </div>
  
            <button
              onClick={handleAdd}
              className="relative flex h-12 flex-1 items-center justify-center overflow-hidden rounded-full bg-cream px-6 text-sm font-semibold uppercase tracking-[0.08em] text-ink transition-colors duration-300 hover:bg-gold-bright active:scale-[0.98]"
            >
              <AnimatePresence mode="wait" initial={false}>
                {added ? (
                  <motion.span
                    key="ok"
                    initial={{ y: 14, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -14, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
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
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="inline-flex items-center gap-2"
                  >
                    Ajouter — {formatPrice(product.priceCents * qty)}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
  
            {/* Mettre de côté sans acheter : c'est ce qui alimente la page
                Favoris, jusqu'ici accessible depuis la navigation mais qu'aucune
                fiche produit ne permettait de remplir. */}
            <WishlistButton
              slug={product.slug}
              product={{
                slug: product.slug,
                name: product.name,
                priceCents: product.priceCents,
                category: product.category,
              }}
              className="size-12 shrink-0 border border-line-strong transition-colors hover:border-gold/50"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-2xl border border-line-strong bg-elevated/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Momentanément indisponible
            </p>
            <p className="mt-1.5 text-sm text-muted">
              Ce produit est en cours de réapprovisionnement. Laissez-nous votre
              email : vous serez prévenu avant sa remise en ligne.
            </p>
          </div>
          <button
            onClick={() => setShowNotify(true)}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-gold/50 px-6 text-sm font-semibold uppercase tracking-[0.08em] text-gold-bright transition-colors hover:bg-gold/10"
          >
            <Bell className="size-4" /> Me prévenir du retour en stock
          </button>
        </div>
      )}

      {/* Réassurance : les trois freins à l'achat, levés sous le bouton. */}
      <ul className="grid gap-2.5 border-t border-line pt-4 text-sm text-muted">
        <li className="flex items-center gap-2.5">
          <Truck className="size-4 shrink-0 text-gold" />
          {qualifiesForFreeShipping ? (
            <span className="text-cream">Livraison offerte sur cette commande</span>
          ) : (
            <span>
              Livraison 24-48 h — offerte dès {formatPrice(FREE_SHIPPING_CENTS)}
            </span>
          )}
        </li>
        <li className="flex items-center gap-2.5">
          <RotateCcw className="size-4 shrink-0 text-gold" />
          <span>Retour gratuit sous {RETURN_WINDOW_DAYS} jours</span>
        </li>
        <li className="flex items-center gap-2.5">
          <ShieldCheck className="size-4 shrink-0 text-gold" />
          <span>Paiement sécurisé par Stripe</span>
        </li>
      </ul>

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
