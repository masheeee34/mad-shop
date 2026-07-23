"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Minus, Plus, ShoppingBag, Trash2, X, Loader2 } from "lucide-react";
import { useCart, selectSubtotal, selectCount } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import { ProductImage } from "@/components/product/product-image";
import { FreeShippingBar } from "@/components/cart/free-shipping-bar";
import { CartCrossSell } from "@/components/cart/cart-cross-sell";
import { Button } from "@/components/ui/button";

/**
 * Panier en Bottom Sheet sur mobile — standard iOS/Android 2026.
 * Monte du bas avec drag-to-dismiss (touch gesture natif).
 * Sur desktop : conserve le comportement drawer latéral classique.
 */
export function CartBottomSheet() {
  const items = useCart((s) => s.items);
  const isOpen = useCart((s) => s.isOpen);
  const close = useCart((s) => s.close);
  const remove = useCart((s) => s.remove);
  const setQuantity = useCart((s) => s.setQuantity);
  const subtotal = useCart(selectSubtotal);
  const count = useCart(selectCount);
  const [loading, setLoading] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const isDragging = useRef(false);

  // Drag to dismiss sur mobile
  function onTouchStart(e: React.TouchEvent) {
    startY.current = e.touches[0].clientY;
    isDragging.current = true;
  }
  function onTouchMove(e: React.TouchEvent) {
    if (!isDragging.current || !sheetRef.current) return;
    const delta = e.touches[0].clientY - startY.current;
    currentY.current = delta;
    if (delta > 0) {
      sheetRef.current.style.transform = `translateY(${delta}px)`;
    }
  }
  function onTouchEnd() {
    isDragging.current = false;
    if (!sheetRef.current) return;
    if (currentY.current > 120) {
      close();
    } else {
      sheetRef.current.style.transform = "";
    }
    currentY.current = 0;
  }

  // Reset transform quand on réouvre
  useEffect(() => {
    if (isOpen && sheetRef.current) {
      sheetRef.current.style.transform = "";
    }
  }, [isOpen]);

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
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />

          {/* ========== MOBILE : Bottom Sheet ========== */}
          <motion.aside
            ref={sheetRef}
            className="fixed bottom-0 left-0 right-0 z-50 flex max-h-[90dvh] flex-col rounded-t-2xl border-t border-line-strong bg-charcoal lg:hidden"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            aria-label="Panier"
            style={{ transition: isDragging.current ? "none" : undefined }}
          >
            {/* Handle drag */}
            <div
              className="flex flex-col items-center pt-3 pb-1 cursor-grab active:cursor-grabbing"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <div className="h-1 w-12 rounded-full bg-line-strong" />
            </div>

            {/* Header */}
            <header className="flex items-center justify-between border-b border-line px-5 pb-4 pt-2">
              <div className="flex items-center gap-3">
                <ShoppingBag className="size-5 text-gold" />
                <h2 className="font-display text-base font-bold uppercase tracking-wide">
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

            <CartContent
              items={items}
              subtotal={subtotal}
              count={count}
              loading={loading}
              remove={remove}
              setQuantity={setQuantity}
              close={close}
              checkout={checkout}
            />
          </motion.aside>

          {/* ========== DESKTOP : Drawer latéral ========== */}
          <motion.aside
            className="fixed right-0 top-0 z-50 hidden h-full w-full max-w-md flex-col border-l border-line bg-charcoal lg:flex"
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

            <CartContent
              items={items}
              subtotal={subtotal}
              count={count}
              loading={loading}
              remove={remove}
              setQuantity={setQuantity}
              close={close}
              checkout={checkout}
            />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// Contenu commun entre bottom sheet et drawer
function CartContent({
  items, subtotal, count, loading, remove, setQuantity, close, checkout,
}: {
  items: import("@/lib/store/cart").CartItem[];
  subtotal: number;
  count: number;
  loading: boolean;
  remove: (slug: string) => void;
  setQuantity: (slug: string, qty: number) => void;
  close: () => void;
  checkout: () => void;
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <ShoppingBag className="size-10 text-faint" />
        <p className="text-muted">Votre panier est vide.</p>
        <Button variant="outline" size="sm" onClick={close}>
          Continuer mes achats
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 divide-y divide-line overflow-y-auto px-5" data-lenis-prevent>
        {items.map((i) => (
          <div key={i.slug} className="flex gap-4 py-4">
            <Link
              href={`/produit/${i.slug}`}
              onClick={close}
              className="relative aspect-square w-18 shrink-0 overflow-hidden rounded-xl bg-elevated"
            >
              <ProductImage file={i.image} alt={i.name} label={i.name} sizes="72px" />
            </Link>
            <div className="flex flex-1 flex-col">
              <Link
                href={`/produit/${i.slug}`}
                onClick={close}
                className="text-sm font-medium leading-snug hover:text-gold-bright"
              >
                {i.name}
              </Link>
              <span className="mt-1 text-sm text-gold">{formatPrice(i.priceCents)}</span>
              <div className="mt-auto flex items-center justify-between pt-2">
                <div className="flex items-center rounded-full border border-line">
                  <button
                    onClick={() => setQuantity(i.slug, i.quantity - 1)}
                    className="grid size-8 place-items-center text-muted hover:text-cream"
                    aria-label="Diminuer"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-7 text-center text-sm tabular-nums">{i.quantity}</span>
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

      <CartCrossSell />

      <footer className="border-t border-line px-5 py-4 pb-safe">
        <div className="mb-3">
          <FreeShippingBar />
        </div>
        <div className="mb-1 flex items-center justify-between text-sm text-muted">
          <span>Sous-total</span>
          <span className="text-base font-semibold text-cream">{formatPrice(subtotal)}</span>
        </div>
        <p className="mb-4 text-xs text-faint">
          Livraison calculée à l'étape suivante · France & Europe
        </p>
        <Button onClick={checkout} size="lg" full className="w-full" disabled={loading}>
          {loading ? (
            <><Loader2 className="size-4 animate-spin" /> Redirection…</>
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
  );
}
