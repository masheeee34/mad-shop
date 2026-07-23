"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus, ShoppingBag, Trash2, X, Loader2 } from "lucide-react";
import { useCart, selectSubtotal, selectCount } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import { ProductImage } from "@/components/product/product-image";
import { Button } from "@/components/ui/button";

export function CartDrawer() {
  const { items, isOpen, close, remove, setQuantity } = useCart();
  const subtotal = useCart(selectSubtotal);
  const count = useCart(selectCount);
  const [loading, setLoading] = useState(false);

  async function checkout() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ slug: i.slug, quantity: i.quantity })),
          promoCode: useCart.getState().promo?.code,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        // Stripe non configuré => on redirige vers le récap panier.
        window.location.href = "/panier";
      }
    } catch {
      window.location.href = "/panier";
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.aside
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-line bg-charcoal"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            aria-label="Panier"
          >
            <header className="flex items-center justify-between border-b border-line px-6 py-5">
              <div className="flex items-center gap-3">
                <ShoppingBag className="size-5 text-gold" />
                <h2 className="font-display text-lg font-bold uppercase tracking-wide">
                  Panier {count > 0 && <span className="text-muted">({count})</span>}
                </h2>
              </div>
              <button
                onClick={close}
                className="grid size-9 place-items-center rounded-full text-muted transition hover:bg-elevated hover:text-cream"
                aria-label="Fermer"
              >
                <X className="size-5" />
              </button>
            </header>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <ShoppingBag className="size-10 text-faint" />
                <p className="text-muted">Votre panier est vide.</p>
                <Button variant="outline" size="sm" onClick={close}>
                  Continuer mes achats
                </Button>
              </div>
            ) : (
              <>
                <div className="flex-1 divide-y divide-line overflow-y-auto px-6" data-lenis-prevent>
                  {items.map((i) => (
                    <div key={i.slug} className="flex gap-4 py-5">
                      <Link
                        href={`/produit/${i.slug}`}
                        onClick={close}
                        className="relative aspect-square w-20 shrink-0 overflow-hidden rounded-xl bg-elevated"
                      >
                        <ProductImage file={i.image} alt={i.name} label={i.name} sizes="80px" />
                      </Link>
                      <div className="flex flex-1 flex-col">
                        <Link
                          href={`/produit/${i.slug}`}
                          onClick={close}
                          className="text-sm font-medium leading-snug hover:text-gold-bright"
                        >
                          {i.name}
                        </Link>
                        <span className="mt-1 text-sm text-gold">
                          {formatPrice(i.priceCents)}
                        </span>
                        <div className="mt-auto flex items-center justify-between pt-3">
                          <div className="flex items-center rounded-full border border-line">
                            <button
                              onClick={() => setQuantity(i.slug, i.quantity - 1)}
                              className="grid size-8 place-items-center text-muted hover:text-cream"
                              aria-label="Diminuer"
                            >
                              <Minus className="size-3.5" />
                            </button>
                            <span className="w-8 text-center text-sm tabular-nums">
                              {i.quantity}
                            </span>
                            <button
                              onClick={() => setQuantity(i.slug, i.quantity + 1)}
                              className="grid size-8 place-items-center text-muted hover:text-cream"
                              aria-label="Augmenter"
                            >
                              <Plus className="size-3.5" />
                            </button>
                          </div>
                          <button
                            onClick={() => remove(i.slug)}
                            className="text-faint transition hover:text-it-red"
                            aria-label="Retirer"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <footer className="border-t border-line px-6 py-5">
                  <div className="mb-1 flex items-center justify-between text-sm text-muted">
                    <span>Sous-total</span>
                    <span className="text-lg font-semibold text-cream">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <p className="mb-4 text-xs text-faint">
                    Livraison calculée à l'étape suivante · France & Europe
                  </p>
                  <Button onClick={checkout} size="lg" full className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="size-4 animate-spin" /> Redirection…
                      </>
                    ) : (
                      "Passer commande"
                    )}
                  </Button>
                  <Link
                    href="/panier"
                    onClick={close}
                    className="mt-3 block text-center text-sm text-muted link-underline"
                  >
                    Voir le panier détaillé
                  </Link>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
