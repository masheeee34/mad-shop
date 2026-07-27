"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { useCart, selectTotal } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CartEmptyState } from "@/components/cart/cart-empty-state";

// Assurez-vous d'avoir NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY dans vos variables d'environnement
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

function CommandeContent() {
  const items = useCart((s) => s.items);
  const total = useCart(selectTotal);
  const promo = useCart((s) => s.promo);
  
  const params = useSearchParams();
  const urlClientSecret = params.get("clientSecret");
  
  const [clientSecret, setClientSecret] = useState<string | null>(urlClientSecret);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!urlClientSecret);
  
  // Utiliser un ref pour s'assurer qu'on ne fait l'appel qu'une seule fois en Strict Mode
  const fetched = useRef(false);

  useEffect(() => {
    if (urlClientSecret) return;

    if (items.length === 0) {
      setLoading(false);
      return;
    }
    
    if (fetched.current) return;
    fetched.current = true;

    async function fetchClientSecret() {
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
          // Si le backend renvoie une URL (par exemple pour le mode test manuel)
          window.location.href = data.url;
          return;
        }
        
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          setError(data.error || "Erreur de paiement.");
        }
      } catch (err: any) {
        setError("Impossible de contacter le serveur de paiement.");
      } finally {
        setLoading(false);
      }
    }

    fetchClientSecret();
  }, [items, promo]);

  if (items.length === 0) {
    return (
      <main className="container mx-auto min-h-[60vh] max-w-lg pt-24 text-center">
        <CartEmptyState showHeader={true} />
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-6xl px-4 pb-24 pt-12 md:pt-24">
      <div className="mb-8 flex items-center">
        <Link
          href="/panier"
          className="flex items-center gap-2 text-sm text-muted transition hover:text-cream"
        >
          <ArrowLeft className="size-4" />
          Retour au panier
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* Colonne de gauche : Formulaire Stripe (En bas sur mobile, à gauche sur desktop) */}
        <div className="order-2 lg:order-1 lg:col-span-7 xl:col-span-8">
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight mb-8">
            Paiement sécurisé
          </h1>
          
          {error && (
            <div className="mb-8 rounded-xl border border-it-red/30 bg-it-red/10 p-4 text-it-red">
              <p className="font-medium">Une erreur est survenue</p>
              <p className="text-sm opacity-80">{error}</p>
            </div>
          )}

          {!stripePromise && !error && (
            <div className="mb-8 rounded-xl border border-gold/30 bg-gold/10 p-4 text-cream">
              <p className="font-medium text-gold">Stripe non configuré</p>
              <p className="text-sm opacity-80">
                Ajoutez NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY dans vos variables d'environnement Vercel pour afficher le formulaire de paiement.
              </p>
            </div>
          )}

          {loading && !error && (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-line bg-elevated/50">
              <Loader2 className="mb-4 size-8 animate-spin text-gold" />
              <p className="text-sm text-muted">Préparation du paiement sécurisé...</p>
            </div>
          )}

          {clientSecret && stripePromise && (
            <div className="rounded-2xl bg-white p-2">
              <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={{ clientSecret }}
              >
                <EmbeddedCheckout className="min-h-[600px]" />
              </EmbeddedCheckoutProvider>
            </div>
          )}
        </div>

        {/* Colonne de droite : Récapitulatif simple (En haut sur mobile, à droite sur desktop) */}
        <div className="order-1 lg:order-2 lg:col-span-5 xl:col-span-4">
          <div className="sticky top-24 rounded-2xl border border-line bg-elevated p-6">
            <h2 className="font-display text-xl font-bold uppercase tracking-tight mb-6">
              Récapitulatif
            </h2>
            
            <div className="flex flex-col gap-4 mb-6 max-h-[40vh] overflow-y-auto pr-2" data-lenis-prevent>
              {items.map((i) => (
                <div key={i.slug} className="flex items-start justify-between text-sm">
                  <div className="flex flex-col">
                    <span className="font-medium text-cream">{i.name}</span>
                    <span className="text-muted">Quantité : {i.quantity}</span>
                  </div>
                  <span className="font-semibold text-gold">
                    {formatPrice(i.priceCents * i.quantity)}
                  </span>
                </div>
              ))}
            </div>
            
            <hr className="border-line mb-6" />
            
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-gold">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CommandePage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <CommandeContent />
    </Suspense>
  );
}
