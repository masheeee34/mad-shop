"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Package, ArrowRight, Copy, Check, Star, ShieldCheck, Lock, Headphones } from "lucide-react";
import { useCart, selectTotal } from "@/lib/store/cart";
import { trackPurchase } from "@/lib/analytics";
import { formatPrice } from "@/lib/utils";
import { Button, ButtonLink } from "@/components/ui/button";
import { QRCode } from "@/components/ui/qr-code";
import { ReviewForm } from "@/components/product/reviews";

/** Le webhook Stripe arrive en général en moins de 2 s ; on lui laisse 10 s. */
const POLL_INTERVAL_MS = 1500;
const MAX_ATTEMPTS = 7;
type Confirmation = { number: string; totalCents: number; items?: { slug: string }[] };

function SuccessContent() {
  const params = useSearchParams();
  // Stripe renvoie `session_id` depuis le tunnel classique et `payment_intent`
  // depuis le paiement express : les deux mènent à la même commande.
  const sessionId = params.get("session_id") ?? params.get("payment_intent");
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [copied, setCopied] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewAdded, setReviewAdded] = useState(false);
  const [fallbackSlug] = useState(() => useCart.getState().items[0]?.slug);
  const reported = useRef(false);

  const finalSlug = confirmation?.items?.[0]?.slug || fallbackSlug;

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
    <div className="min-h-screen bg-[#0A0A0A] text-cream flex items-center justify-center p-4 pt-32 pb-16">
      <div className="w-full max-w-2xl bg-[#111111] rounded-2xl border border-line p-8 md:p-12 shadow-2xl relative overflow-hidden">
        
        {/* En-tête */}
        <div className="flex flex-col items-center text-center">
          <div className="flex flex-col items-center">
            <span className="font-display font-bold tracking-tight text-white text-5xl">
              MAD
            </span>
            <span className="text-[10px] tracking-widest text-white mt-1">MAKE A DIFFERENCE</span>
            <div className="w-32 h-[3px] mt-2 flex">
              <div className="h-full w-1/3 bg-[#0055A4]"></div>
              <div className="h-full w-1/3 bg-white"></div>
              <div className="h-full w-1/3 bg-[#EF4135]"></div>
            </div>
          </div>

          <div className="mt-12">
            <h1 className="text-6xl md:text-7xl font-display font-bold text-gold tracking-widest">
              MERCI <span className="text-3xl text-gold-bright">♡</span>
            </h1>
            <p className="mt-2 text-3xl md:text-4xl italic font-serif tracking-wide">
              pour votre confiance !
            </p>
          </div>

          <p className="mt-8 text-lg text-muted max-w-md">
            Votre satisfaction est notre priorité.<br />
            Nous espérons que votre commande<br />
            <strong className="text-gold font-normal">vous comble pleinement.</strong>
          </p>
        </div>

        {/* Bloc Avis + QR Code */}
        {showReviewForm && finalSlug ? (
          <div className="mt-10 text-left bg-black/40 border border-gold/40 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Star className="size-5 text-gold fill-gold" />
              <h2 className="text-sm uppercase tracking-widest text-muted">Donnez-nous votre avis</h2>
            </div>
            <ReviewForm 
              slug={finalSlug}
              suggestedName=""
              onAdded={() => {
                setReviewAdded(true);
                setShowReviewForm(false);
              }}
            />
            <button 
              className="mt-4 text-xs uppercase tracking-widest text-faint hover:text-white"
              onClick={() => setShowReviewForm(false)}
            >
              Annuler
            </button>
          </div>
        ) : (
          <div className="mt-10 rounded-xl border border-gold/40 bg-black/40 p-5 flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 flex items-start gap-4">
              <div className="size-12 shrink-0 rounded-full border-2 border-gold flex items-center justify-center">
                <Star className="size-6 text-gold fill-gold" />
              </div>
              <div className="text-left flex-1">
                <h2 className="text-sm uppercase tracking-widest text-muted">Vous aimez votre produit ?</h2>
                <p className="text-xl font-display font-bold text-gold mt-1">LAISSEZ-NOUS UN AVIS !</p>
                <p className="text-sm text-faint mt-2 leading-relaxed">
                  Votre retour compte énormément pour nous et aide d&apos;autres clients à faire le bon choix.
                </p>
                {reviewAdded ? (
                  <p className="mt-4 text-it-green font-bold text-sm">Merci, votre avis a bien été envoyé !</p>
                ) : (
                  finalSlug && (
                    <Button 
                      onClick={() => setShowReviewForm(true)} 
                      className="mt-4 w-full md:w-auto"
                    >
                      Laisser mon avis
                    </Button>
                  )
                )}
              </div>
            </div>
            <div className="shrink-0 flex flex-col items-center bg-gold p-2 rounded-lg hidden md:flex">
              <QRCode 
                value={finalSlug ? `https://www.madshop.fr/boutique/${finalSlug}#avis` : "https://www.madshop.fr/boutique"} 
                size={100} 
                className="bg-white p-1 rounded-md" 
              />
              <span className="text-black text-[10px] font-bold mt-1 uppercase tracking-wider">Scannez-moi</span>
            </div>
          </div>
        )}

        {/* Numéro de commande si disponible */}
        {confirmation && (
          <div className="mt-8 flex flex-col md:flex-row items-center justify-between border-t border-b border-line py-4 px-2">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-[11px] uppercase tracking-widest text-faint">Numéro de suivi</p>
              <p className="text-lg font-display text-gold-bright tracking-tight flex items-center gap-2 justify-center md:justify-start">
                {confirmation.number}
                <button
                  onClick={copyNumber}
                  className="text-muted hover:text-white transition-colors"
                  aria-label="Copier le numéro"
                >
                  {copied ? <Check className="size-4 text-it-green" /> : <Copy className="size-4" />}
                </button>
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-[11px] uppercase tracking-widest text-faint">Total réglé</p>
              <p className="text-lg font-display text-white">{formatPrice(confirmation.totalCents)}</p>
            </div>
            <ButtonLink href="/suivi" size="sm" variant="outline" className="mt-4 md:mt-0">
              Suivre <ArrowRight className="size-4 ml-1" />
            </ButtonLink>
          </div>
        )}

        {/* Réassurance */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x-0 md:divide-x divide-line">
          <div className="flex flex-col items-center px-2">
            <div className="h-10 flex items-center justify-center">
              <ShieldCheck className="size-8 text-gold stroke-[1.5]" />
            </div>
            <h3 className="mt-3 text-[11px] uppercase tracking-widest font-bold">Produits sélectionnés</h3>
            <p className="mt-2 text-xs text-faint">Qualité testée et approuvée</p>
          </div>
          <div className="flex flex-col items-center px-2">
            <div className="h-10 flex items-center justify-center">
              <Lock className="size-8 text-gold stroke-[1.5]" />
            </div>
            <h3 className="mt-3 text-[11px] uppercase tracking-widest font-bold">Paiement sécurisé</h3>
            <p className="mt-2 text-xs text-faint">Transactions 100% sécurisées</p>
          </div>
          <div className="flex flex-col items-center px-2">
            <div className="h-10 flex items-center justify-center">
              <Headphones className="size-8 text-gold stroke-[1.5]" />
            </div>
            <h3 className="mt-3 text-[11px] uppercase tracking-widest font-bold">Service client réactif</h3>
            <p className="mt-2 text-xs text-faint">À votre écoute 7j/7</p>
          </div>
          <div className="flex flex-col items-center px-2">
            <div className="h-10 flex items-center justify-center">
              <Package className="size-8 text-gold stroke-[1.5]" />
            </div>
            <h3 className="mt-3 text-[11px] uppercase tracking-widest font-bold">Livraison rapide</h3>
            <p className="mt-2 text-xs text-faint">En France et dans le monde</p>
          </div>
        </div>

        {/* Bannière Express */}
        <div className="mt-10 bg-gold text-black rounded-lg p-4 flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
          <div className="shrink-0 relative">
            <svg width="48" height="32" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="10" rx="1" />
              <path d="M16 8h4l2 3v2h-6" />
              <circle cx="5.5" cy="13.5" r="1.5" />
              <circle cx="17.5" cy="13.5" r="1.5" />
              <path d="M1 8h-1 M2 5h-2 M3 11h-3" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-bold uppercase tracking-wider text-sm md:text-base">Livraison express en Île-de-France</p>
            <p className="text-xs md:text-sm mt-0.5">En main propre sous <strong>24H</strong> à partir de 150€ d&apos;achat.</p>
          </div>
          <div className="shrink-0 bg-black text-gold text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-md">
            Offerte
          </div>
        </div>

        <div className="mt-12 text-center pb-8 border-b border-line">
          <p className="text-2xl font-serif italic text-white tracking-wide">
            À très bientôt sur MAD SHOP !
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between px-4 text-xs text-muted uppercase tracking-widest">
          <span>Suivez-nous</span>
          <div className="flex items-center gap-4 text-gold">
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
          </div>
          <span>www.madshop.fr</span>
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
