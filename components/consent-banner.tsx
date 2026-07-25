"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { readConsent, writeConsent } from "@/lib/consent";

/**
 * Les identifiants NEXT_PUBLIC_* sont figés à la compilation : si aucune régie
 * n'est configurée, aucun cookie de mesure n'est déposé et la bannière n'a pas
 * lieu d'être.
 */
const TRACKING_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_GA_ID ||
    process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ||
    process.env.NEXT_PUBLIC_META_PIXEL_ID ||
    process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID,
);

/**
 * Bandeau de consentement.
 *
 * Volontairement discret et posé en bas d'écran : il ne bloque pas la
 * navigation ni le premier rendu. Les deux choix sont présentés avec le même
 * poids visuel — un « refuser » caché est une non-conformité fréquemment
 * sanctionnée par la CNIL.
 */
export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!TRACKING_CONFIGURED) return;
    if (readConsent() !== null) return;
    // Attend la fin de l'intro de marque avant d'attirer l'attention.
    const timer = setTimeout(() => setVisible(true), 2400);
    return () => clearTimeout(timer);
  }, []);

  function decide(choice: "granted" | "denied") {
    writeConsent(choice);
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-live="polite"
          aria-label="Préférences de confidentialité"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-[calc(var(--bottom-nav-h)+var(--sab)+0.75rem)] lg:pb-6"
        >
          <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-line-strong bg-charcoal/95 p-5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:flex-row sm:items-center sm:gap-6">
            <p className="flex-1 text-sm leading-relaxed text-muted">
              Nous utilisons des cookies de mesure d&apos;audience pour comprendre
              ce qui fonctionne sur le site.{" "}
              <Link
                href="/mentions-legales"
                className="link-underline text-cream underline-offset-2"
              >
                En savoir plus
              </Link>
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => decide("denied")}
                className="h-11 rounded-full border border-line-strong px-5 text-sm font-medium text-cream transition-colors hover:border-cream/40"
              >
                Refuser
              </button>
              <button
                onClick={() => decide("granted")}
                className="h-11 rounded-full bg-cream px-6 text-sm font-semibold text-ink transition-colors hover:bg-gold-bright"
              >
                Accepter
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
