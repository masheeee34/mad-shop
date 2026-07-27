"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { HelpCircle, X, Mail, MessageSquare, ChevronRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import {
  FREE_SHIPPING_CENTS,
  SHIPPING_CENTS,
  RETURN_WINDOW_DAYS,
  WHATSAPP_NUMBER,
} from "@/lib/config";

/**
 * Aide contextuelle : les cinq questions qui précèdent le plus souvent un
 * abandon de panier, répondues sans quitter la page, plus un accès direct au
 * service client. Les montants proviennent de la configuration boutique afin
 * de ne jamais contredire ce qui est affiché en caisse.
 */
const FAQ = [
  {
    q: "Quels sont les délais de livraison ?",
    a: "Expédition sous 24 h ouvrées, réception en 24 à 48 h en France et en Europe.",
  },
  {
    q: "La livraison est-elle offerte ?",
    a: `Oui, dès ${formatPrice(FREE_SHIPPING_CENTS)} d'achat. En dessous, ${formatPrice(SHIPPING_CENTS)}.`,
  },
  {
    q: "Comment suivre ma commande ?",
    a: "Depuis la page Suivi, avec le numéro reçu par email juste après le paiement.",
  },
  {
    q: "Puis-je retourner un produit ?",
    a: `Oui, sous ${RETURN_WINDOW_DAYS} jours, sans justification et sans frais de retour.`,
  },
  {
    q: "Le paiement est-il sécurisé ?",
    a: "Le paiement est traité par Stripe. Carte bancaire, Apple Pay et Google Pay acceptés.",
  },
];

export function HelpWidget() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Fermeture au clic extérieur et à la touche Échap.
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) setOpen(false);
    };

    window.addEventListener("keydown", onKey);
    // En différé, sinon le clic d'ouverture referme aussitôt le panneau.
    const timer = setTimeout(() => document.addEventListener("click", onClick), 0);

    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(timer);
      document.removeEventListener("click", onClick);
    };
  }, [open]);

  return (
    <div ref={panelRef}>
      <motion.button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-[calc(var(--bottom-nav-h)+var(--sab)+var(--buy-bar-h)+1rem)] right-4 z-40 grid size-12 place-items-center rounded-full border border-line-strong bg-charcoal/90 text-cream backdrop-blur-xl transition-[bottom,color,border-color] duration-300 hover:border-gold/50 hover:text-gold-bright lg:bottom-6 lg:right-6"
        whileTap={{ scale: 0.92 }}
        aria-label={open ? "Fermer l'aide" : "Aide et contact"}
        aria-expanded={open}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="size-5" />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <HelpCircle className="size-5" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-[calc(var(--bottom-nav-h)+var(--sab)+var(--buy-bar-h)+4.25rem)] right-4 z-40 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-2xl border border-line-strong bg-charcoal shadow-[0_28px_70px_-24px_rgba(0,0,0,0.95)] lg:bottom-24 lg:right-6"
          >
            <div className="border-b border-line px-5 py-4">
              <p className="font-display text-sm font-bold uppercase tracking-[0.14em]">
                Une question ?
              </p>
              <p className="mt-1 text-xs text-muted">
                Réponse par email sous 24 h ouvrées.
              </p>
            </div>

            <div className="max-h-[min(60vh,26rem)] overflow-y-auto px-3 py-3">
              {FAQ.map((item, i) => {
                const isOpen = expanded === i;
                return (
                  <div key={item.q}>
                    <button
                      onClick={() => setExpanded(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left text-sm text-cream transition-colors hover:bg-elevated"
                    >
                      <span className="font-medium leading-snug">{item.q}</span>
                      <ChevronRight
                        className={`size-4 shrink-0 text-gold transition-transform duration-300 ${
                          isOpen ? "rotate-90" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <p className="px-3 pb-3 text-xs leading-relaxed text-muted">
                            {item.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-px border-t border-line bg-line">
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="flex flex-col items-center gap-1.5 bg-charcoal px-4 py-4 text-center text-xs text-muted transition-colors hover:bg-elevated hover:text-cream"
              >
                <Mail className="size-5 text-gold" />
                <span className="font-medium">Nous écrire</span>
              </Link>

              {WHATSAPP_NUMBER ? (
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1.5 bg-charcoal px-4 py-4 text-center text-xs text-muted transition-colors hover:bg-elevated hover:text-cream"
                >
                  <MessageSquare className="size-5 text-gold" />
                  <span className="font-medium">WhatsApp</span>
                </a>
              ) : (
                <Link
                  href="/livraison"
                  onClick={() => setOpen(false)}
                  className="flex flex-col items-center gap-1.5 bg-charcoal px-4 py-4 text-center text-xs text-muted transition-colors hover:bg-elevated hover:text-cream"
                >
                  <MessageSquare className="size-5 text-gold" />
                  <span className="font-medium">Livraison & retours</span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
