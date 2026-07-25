"use client";

import { useEffect, useRef, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { SHIPPING_COUNTRIES, FREE_SHIPPING_CENTS } from "@/lib/config";
import { trackBeginCheckout, type TrackedItem } from "@/lib/analytics";
import { formatPrice } from "@/lib/utils";

/**
 * Paiement en un geste (Apple Pay, Google Pay, Link).
 *
 * Le tunnel classique demande quatre étapes : ajouter au panier, ouvrir le
 * panier, partir chez Stripe, remplir un formulaire. Ici, le portefeuille du
 * téléphone fournit l'adresse, l'email et la carte : le client ne quitte
 * jamais la fiche produit.
 *
 * Le bouton ne s'affiche que si le navigateur a réellement un moyen de
 * paiement disponible — Stripe ne monte rien sinon, et l'emplacement reste
 * vide plutôt que d'afficher un bouton qui ne mènerait nulle part.
 */
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

/** Chargé une seule fois pour toute l'application. */
const stripePromise = PUBLISHABLE_KEY ? loadStripe(PUBLISHABLE_KEY) : null;

type Quote = {
  lines: { name: string; quantity: number; amount: number }[];
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  totalCents: number;
  freeShipping: boolean;
};

export function ExpressCheckout({
  items,
  promoCode,
  trackedItems,
}: {
  items: { slug: string; quantity: number }[];
  promoCode?: string;
  /** Pour la mesure publicitaire, au moment où le portefeuille s'ouvre. */
  trackedItems?: TrackedItem[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  // Les valeurs les plus récentes, lisibles depuis les gestionnaires
  // d'événements de Stripe sans avoir à remonter l'élément à chaque frappe.
  const quoteRef = useRef<Quote | null>(null);
  const itemsRef = useRef(items);
  const promoRef = useRef(promoCode);
  const trackedRef = useRef(trackedItems);

  itemsRef.current = items;
  promoRef.current = promoCode;
  trackedRef.current = trackedItems;

  const itemsKey = JSON.stringify(items) + (promoCode ?? "");

  /* ---- Détail chiffré, recalculé à chaque changement de panier ---- */
  useEffect(() => {
    if (!stripePromise || items.length === 0) return;
    let cancelled = false;

    fetch("/api/express/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, promoCode }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Quote | null) => {
        if (cancelled) return;
        quoteRef.current = data;
        setQuote(data);
      })
      .catch(() => {
        /* le tunnel classique reste disponible */
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsKey]);

  /* ---- Montage du bouton ---- */
  useEffect(() => {
    if (!stripePromise || !quote || !containerRef.current) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    stripePromise.then((stripe) => {
      if (!stripe || cancelled || !containerRef.current) return;

      const elements = stripe.elements({
        mode: "payment",
        amount: quote.totalCents,
        currency: "eur",
      });

      const element = elements.create("expressCheckout", { buttonHeight: 48 });

      // Stripe ne déclenche `ready` avec des moyens de paiement que si le
      // navigateur en propose au moins un : c'est notre signal d'affichage.
      element.on("ready", (event) => {
        const { availablePaymentMethods } = event as {
          availablePaymentMethods?: Record<string, boolean>;
        };
        const usable = Object.values(availablePaymentMethods ?? {}).some(Boolean);
        if (!cancelled) setReady(usable);
      });

      element.on("click", (event) => {
        const current = quoteRef.current;
        if (!current) return;

        if (trackedRef.current?.length) {
          trackBeginCheckout(trackedRef.current, promoRef.current);
        }

        // `resolve` doit être appelé de façon synchrone : c'est pourquoi le
        // détail chiffré est récupéré à l'avance.
        event.resolve({
          emailRequired: true,
          phoneNumberRequired: true,
          shippingAddressRequired: true,
          allowedShippingCountries: [...SHIPPING_COUNTRIES],
          lineItems: current.lines.map((l) => ({
            name: `${l.quantity} × ${l.name}`,
            amount: l.amount,
          })),
          shippingRates: [shippingRate(current)],
        });
      });

      // Le tarif de livraison ne dépend pas de l'adresse (montant unique par
      // zone desservie) : on renvoie le même, ce qui garde la feuille ouverte.
      element.on("shippingaddresschange", (event) => {
        const current = quoteRef.current;
        if (!current) {
          event.reject();
          return;
        }
        event.resolve({ shippingRates: [shippingRate(current)] });
      });

      element.on("cancel", () => {
        if (!cancelled) setError("");
      });

      element.on("confirm", async (event) => {
        setError("");

        const { error: submitError } = await elements.submit();
        if (submitError) {
          setError(submitError.message ?? "Paiement interrompu.");
          return;
        }

        const current = quoteRef.current;
        if (!current) {
          setError("Panier indisponible. Rechargez la page.");
          return;
        }

        try {
          const res = await fetch("/api/express/intent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              items: itemsRef.current,
              promoCode: promoRef.current,
              expectedTotalCents: current.totalCents,
              email: event.billingDetails?.email,
              name: event.shippingAddress?.name ?? event.billingDetails?.name,
              phone: event.billingDetails?.phone,
              shipping: event.shippingAddress?.address,
            }),
          });

          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data.clientSecret) {
            setError(data.error ?? "Paiement indisponible pour le moment.");
            return;
          }

          const { error: confirmError } = await stripe.confirmPayment({
            elements,
            clientSecret: data.clientSecret,
            confirmParams: {
              return_url: `${window.location.origin}/commande/succes`,
            },
          });

          // Sans erreur, le navigateur part déjà vers la page de confirmation.
          if (confirmError) {
            setError(confirmError.message ?? "Le paiement n'a pas abouti.");
          }
        } catch {
          setError("Connexion impossible. Vérifiez votre réseau.");
        }
      });

      element.mount(containerRef.current);
      cleanup = () => element.unmount();
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
    // Remonté à chaque changement de montant : `elements` est figé sur le
    // montant fourni à sa création.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quote?.totalCents]);

  if (!stripePromise || items.length === 0) return null;

  return (
    <div className={ready ? "space-y-3" : "sr-only"} aria-hidden={!ready}>
      <div ref={containerRef} />

      {ready && (
        <>
          <p className="text-center text-xs text-faint">
            Paiement en un geste — livraison{" "}
            {quote?.freeShipping
              ? "offerte"
              : `${formatPrice(quote?.shippingCents ?? 0)} (offerte dès ${formatPrice(FREE_SHIPPING_CENTS)})`}
          </p>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-line" />
            <span className="text-[11px] uppercase tracking-[0.2em] text-faint">
              ou
            </span>
            <span className="h-px flex-1 bg-line" />
          </div>
        </>
      )}

      {error && (
        <p role="alert" className="text-sm text-it-red">
          {error}
        </p>
      )}
    </div>
  );
}

/** Le seul mode de livraison auquel ce panier a droit. */
function shippingRate(quote: Quote) {
  return {
    id: quote.freeShipping ? "offerte" : "standard",
    amount: quote.shippingCents,
    displayName: quote.freeShipping
      ? "Livraison offerte (24-48 h)"
      : "Livraison standard (24-48 h)",
  };
}
