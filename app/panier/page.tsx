"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingBag, Loader2, ArrowRight, Info } from "lucide-react";
import { useCart, selectSubtotal, selectDiscount, selectTotal } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import {
  trackViewCart,
  trackBeginCheckout,
  trackRemoveFromCart,
} from "@/lib/analytics";
import { ProductImage } from "@/components/product/product-image";
import { PromoInput } from "@/components/cart/promo-input";
import { FreeShippingBar } from "@/components/cart/free-shipping-bar";
import { ExpressCheckout } from "@/components/product/express-checkout";
import { Button, ButtonLink } from "@/components/ui/button";

/**
 * Messages renvoyés par le lien de relance d'un panier abandonné. Sans eux, un
 * client arrivant depuis son email atterrit sur un panier muet et ne comprend
 * pas pourquoi le paiement ne s'est pas ouvert.
 */
const RECOVERY_NOTICES: Record<string, string> = {
  expiree:
    "Ce lien de reprise a expiré. Votre panier est toujours là : vous pouvez repartir d'ici.",
  introuvable:
    "Ce panier a déjà été finalisé ou n'est plus disponible. Composez-en un nouveau ci-dessous.",
  indisponible:
    "Un article de ce panier n'est plus disponible. Vérifiez votre sélection avant de payer.",
};

/** Longueur maximale d'un message d'erreur relayé par l'URL. */
const MAX_NOTICE_LENGTH = 160;

function CartNotice() {
  const params = useSearchParams();
  const message =
    RECOVERY_NOTICES[params.get("reprise") ?? ""] ??
    params.get("erreur")?.slice(0, MAX_NOTICE_LENGTH);

  if (!message) return null;

  return (
    <p
      role="status"
      className="mt-6 flex items-start gap-3 rounded-xl border border-gold/30 bg-gold/5 px-4 py-3 text-sm text-cream"
    >
      <Info className="mt-0.5 size-4 shrink-0 text-gold" />
      {message}
    </p>
  );
}

function CartPageContent() {
  const { items, remove, setQuantity, promo } = useCart();
  const subtotal = useCart(selectSubtotal);
  const discount = useCart(selectDiscount);
  const total = useCart(selectTotal);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const cartViewed = useRef(false);

  // Une seule remontée `view_cart` par visite, une fois le panier hydraté.
  useEffect(() => {
    if (cartViewed.current || items.length === 0) return;
    cartViewed.current = true;
    trackViewCart(items);
  }, [items]);

  function removeItem(item: (typeof items)[number]) {
    trackRemoveFromCart(item);
    remove(item.slug);
  }

  async function checkout() {
    setLoading(true);
    setError("");
    trackBeginCheckout(items, promo?.code);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ slug: i.slug, quantity: i.quantity })),
          promoCode: promo?.code,
        }),
      });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
        return; // on garde l'état « chargement » pendant la redirection
      }
      setError(data.error ?? "Paiement indisponible pour le moment.");
    } catch {
      setError("Connexion impossible. Vérifiez votre réseau et réessayez.");
    }
    setLoading(false);
  }

  return (
    <div className="shell pt-24 pb-8 md:pt-32 md:pb-10 lg:pt-40">
      <span className="gold-rule" />
      <h1 className="display mt-3 text-3xl md:text-5xl">Mon panier</h1>

      <CartNotice />

      {items.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-5 text-center">
          <ShoppingBag className="size-12 text-faint" />
          <p className="text-muted">Votre panier est vide pour le moment.</p>
          <ButtonLink href="/boutique" size="lg">
            Découvrir la boutique <ArrowRight className="size-4" />
          </ButtonLink>
        </div>
      ) : (
        /* Mobile : récapitulatif en premier (sticky en bas serait intrusif),
           donc on empile : items → aside sur mobile, side-by-side sur lg */
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:gap-10">
          {/* Liste des articles */}
          <div className="divide-y divide-line">
            {items.map((i) => (
              <div key={i.slug} className="flex gap-4 py-5">
                <Link
                  href={`/produit/${i.slug}`}
                  className="relative aspect-square w-20 shrink-0 overflow-hidden rounded-xl bg-elevated sm:w-28"
                >
                  <ProductImage file={i.image} alt={i.name} label={i.name} sizes="(max-width:640px) 80px, 112px" />
                </Link>
                <div className="flex flex-1 flex-col min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/produit/${i.slug}`} className="truncate text-sm font-medium hover:text-gold-bright sm:text-base">
                      {i.name}
                    </Link>
                    <span className="whitespace-nowrap text-sm font-semibold sm:text-base">
                      {formatPrice(i.priceCents * i.quantity)}
                    </span>
                  </div>
                  <span className="mt-1 text-xs text-muted sm:text-sm">{formatPrice(i.priceCents)} l'unité</span>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center rounded-full border border-line">
                      <button
                        onClick={() => setQuantity(i.slug, i.quantity - 1)}
                        className="grid size-9 place-items-center text-muted hover:text-cream"
                        aria-label="Diminuer"
                      >
                        <Minus className="size-4" />
                      </button>
                      <span className="w-8 text-center text-sm tabular-nums">{i.quantity}</span>
                      <button
                        onClick={() => setQuantity(i.slug, i.quantity + 1)}
                        className="grid size-9 place-items-center text-muted hover:text-cream"
                        aria-label="Augmenter"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(i)}
                      className="flex items-center gap-1.5 text-xs text-faint transition hover:text-it-red sm:text-sm"
                    >
                      <Trash2 className="size-4" /> Retirer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Récapitulatif — sticky sur lg, normal sur mobile */}
          <aside className="h-fit card p-5 sm:p-7 lg:sticky lg:top-28">
            <h2 className="font-display text-base font-bold uppercase tracking-wide sm:text-lg">Récapitulatif</h2>
            <div className="mt-4">
              <FreeShippingBar />
            </div>
            <div className="mt-4">
              <PromoInput />
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between text-muted">
                <dt>Sous-total</dt>
                <dd className="text-cream">{formatPrice(subtotal)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-it-green">
                  <dt>Réduction {promo ? `(${promo.code})` : ""}</dt>
                  <dd>−{formatPrice(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between text-muted">
                <dt>Livraison</dt>
                <dd className="text-cream">Calculée au paiement</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-3 text-base font-semibold">
                <dt>Total estimé</dt>
                <dd className="text-gold-bright">{formatPrice(total)}</dd>
              </div>
            </dl>
            {error && (
              <p role="alert" className="mt-4 rounded-xl border border-it-red/30 bg-it-red/5 px-4 py-3 text-sm text-it-red">
                {error}
              </p>
            )}
            <div className="mt-5">
              <ExpressCheckout
                items={items.map((i) => ({ slug: i.slug, quantity: i.quantity }))}
                promoCode={promo?.code}
                trackedItems={items}
              />
            </div>

            <Button onClick={checkout} size="lg" full className="w-full" disabled={loading}>
              {loading ? (
                <><Loader2 className="size-4 animate-spin" /> Redirection…</>
              ) : (
                <>Passer au paiement <ArrowRight className="size-4" /></>
              )}
            </Button>
            <p className="mt-3 text-center text-xs text-faint">
              Paiement sécurisé via Stripe · CB, Apple Pay, Google Pay
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}

export default function CartPage() {
  // `useSearchParams` impose une frontière de suspense : sans elle, toute la
  // page basculerait en rendu client au build.
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <CartPageContent />
    </Suspense>
  );
}
