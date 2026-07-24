"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MessageCircle, X, Phone, Mail, Clock, ChevronRight } from "lucide-react";

const FAQ = [
  {
    q: "Quels sont vos délais de livraison ?",
    a: "Livraison en 24 à 48h ouvrés partout en France et en Europe.",
  },
  {
    q: "La livraison est-elle gratuite ?",
    a: "Oui, dès 60 € d'achat. Sinon 4,90 €.",
  },
  {
    q: "Comment suivre ma commande ?",
    a: "Rendez-vous sur la page Suivi avec le numéro reçu par email.",
  },
  {
    q: "Quelle est votre politique de retour ?",
    a: "Satisfait ou remboursé sous 14 jours. Contactez-nous via la page Contact.",
  },
  {
    q: "Le paiement est-il sécurisé ?",
    a: "100 % sécurisé via Stripe — CB, Apple Pay, Google Pay acceptés.",
  },
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <>
      {/* Bouton flottant */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-20 right-4 z-40 grid size-14 place-items-center rounded-full bg-gold text-ink shadow-[0_12px_40px_-8px_rgba(198,164,106,0.6)] lg:bottom-6 lg:right-6"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        aria-label={open ? "Fermer" : "Aide & contact"}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="size-6" />
            </motion.span>
          ) : (
            <motion.span
              key="msg"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <MessageCircle className="size-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-36 right-4 z-40 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-2xl border border-line bg-charcoal shadow-2xl lg:bottom-24 lg:right-6"
          >
            {/* En-tête */}
            <div className="border-b border-line bg-elevated/60 px-5 py-4">
              <p className="font-display text-sm font-bold uppercase tracking-wide">Aide & Contact</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                <Clock className="size-3" /> Réponse sous 24h
              </p>
            </div>

            <div className="divide-y divide-line">
              {/* FAQ rapide */}
              <div className="px-5 py-4">
                <p className="mb-3 text-xs uppercase tracking-widest text-faint">Questions fréquentes</p>
                <div className="space-y-1">
                  {FAQ.map((item, i) => (
                    <div key={i}>
                      <button
                        onClick={() => setExpanded(expanded === i ? null : i)}
                        className="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-cream transition hover:bg-elevated"
                      >
                        <span className="font-medium leading-snug">{item.q}</span>
                        <ChevronRight
                          className={`size-4 shrink-0 text-gold transition-transform ${expanded === i ? "rotate-90" : ""}`}
                        />
                      </button>
                      <AnimatePresence>
                        {expanded === i && (
                          <motion.p
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            className="overflow-hidden px-3 pb-2 text-xs leading-relaxed text-muted"
                          >
                            {item.a}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>

              {/* Liens de contact directs */}
              <div className="grid grid-cols-2 gap-px bg-line">
                <a
                  href="/contact"
                  onClick={() => setOpen(false)}
                  className="flex flex-col items-center gap-1.5 bg-charcoal px-4 py-4 text-center text-xs text-muted transition hover:bg-elevated hover:text-cream"
                >
                  <Mail className="size-5 text-gold" />
                  <span className="font-medium">Nous écrire</span>
                </a>
                <a
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP ?? ""}`.replace("https://wa.me/", "") ? `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP}` : "/contact"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1.5 bg-charcoal px-4 py-4 text-center text-xs text-muted transition hover:bg-elevated hover:text-cream"
                >
                  <Phone className="size-5 text-gold" />
                  <span className="font-medium">WhatsApp</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
