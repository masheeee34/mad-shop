"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Package, ArrowRight, Copy, Check } from "lucide-react";
import { motion } from "motion/react";
import { useCart, selectTotal } from "@/lib/store/cart";
import { trackPurchase } from "@/lib/analytics";
import { formatPrice } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";

/** Le webhook Stripe arrive en général en moins de 2 s ; on lui laisse 10 s. */
const POLL_INTERVAL_MS = 1500;
const MAX_ATTEMPTS = 7;

type Confirmation = { number: string; totalCents: number };

function SuccessContent() {
  const params = useSearchParams();
  // Stripe renvoie `session_id` depuis le tunnel classique et `payment_intent`
  // depuis le paiement express : les deux mènent à la même commande.
  const sessionId = params.get("session_id") ?? params.get("payment_intent");
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [copied, setCopied] = useState(false);
  const reported = useRef(false);

  useEffect(() => {
    const cartState = useCart.getState();
    const fallbackTotal = selectTotal(cartState);
    const cartItems = cartState.items;

    // Le panier est vidé immédiatement : un retour arrière ne doit pas
    // laisser croire que la commande est encore en cours.
    cartState.clear();

    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;

    /** Remonte la conversion une seule fois, avec la meilleure valeur connue. */
    function report(valueCents: number, orderId?: string) {
      if (reported.current || valueCents <= 0) return;
      reported.current = true;
      trackPurchase({ valueCents, orderId, items: cartItems });
    }

    if (!sessionId) {
      report(fallbackTotal);
      return;
    }

    async function poll() {
      attempts += 1;
      try {
        const res = await fetch(
          `/api/order-confirmation?session_id=${encodeURIComponent(sessionId!)}`,
        );
        const data = await res.json();

        if (cancelled) return;

        if (data.found) {
          setConfirmation(data.order);
          report(data.order.totalCents, data.order.number);
          return;
        }
      } catch {
        /* on retente */
      }

      if (cancelled) return;

      if (attempts >= MAX_ATTEMPTS) {
        // Le montant exact reste indisponible : on remonte l'estimation panier
        // plutôt que de perdre la conversion.
        report(fallbackTotal);
        return;
      }
      timer = setTimeout(poll, POLL_INTERVAL_MS);
    }

    poll();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [sessionId]);

  async function copyNumber() {
    if (!confirmation) return;
    try {
      await navigator.clipboard.writeText(confirmation.number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* presse-papiers indisponible : le numéro reste sélectionnable */
    }
  }

  return (
    <div className="shell grid min-h-[70vh] place-items-center pt-32 pb-16 text-center">
      <div className="flex max-w-lg flex-col items-center">
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 14, stiffness: 220 }}
          className="grid size-20 place-items-center rounded-full bg-it-green/15 text-it-green"
        >
          <CheckCircle2 className="size-10" />
        </motion.span>

        <h1 className="display mt-8 text-4xl md:text-5xl">Commande confirmée</h1>

        <p className="mt-4 text-muted">
          Votre paiement a été accepté. Un email de confirmation vient de vous
          être envoyé. Préparation immédiate, expédition sous 24 à 48 h ouvrées.
        </p>

        {confirmation && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="card mt-8 w-full p-5 text-left"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-faint">
                  Numéro de suivi
                </p>
                <p className="mt-1 font-display text-xl font-bold tracking-tight text-gold-bright">
                  {confirmation.number}
                </p>
              </div>
              <button
                onClick={copyNumber}
                className="grid size-10 shrink-0 place-items-center rounded-full border border-line text-muted transition-colors hover:border-gold/50 hover:text-cream"
                aria-label="Copier le numéro de commande"
              >
                {copied ? (
                  <Check className="size-4 text-it-green" />
                ) : (
                  <Copy className="size-4" />
                )}
              </button>
            </div>
            <p className="mt-4 border-t border-line pt-4 text-sm text-muted">
              Total réglé :{" "}
              <span className="text-cream">{formatPrice(confirmation.totalCents)}</span>
            </p>
          </motion.div>
        )}

        <span className="tricolore my-8 block w-40" aria-hidden />

        <div className="flex flex-wrap justify-center gap-3">
          <ButtonLink href="/suivi" size="lg">
            Suivre ma commande <ArrowRight className="size-4" />
          </ButtonLink>
          <ButtonLink href="/boutique" variant="outline" size="lg">
            <Package className="size-4" /> Continuer mes achats
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" />}>
      <SuccessContent />
    </Suspense>
  );
}
