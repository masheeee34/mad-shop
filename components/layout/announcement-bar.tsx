"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import { FREE_SHIPPING_CENTS, RETURN_WINDOW_DAYS } from "@/lib/config";

/**
 * Bandeau d'annonces en haut de page.
 *
 * Trois arguments qui lèvent les freins à l'achat (port offert, retours,
 * paiement), alternés en fondu plutôt qu'en défilement continu : un texte qui
 * bouge en permanence est illisible et fatigue à la lecture.
 */
const MESSAGES = [
  `Livraison offerte dès ${formatPrice(FREE_SHIPPING_CENTS)}`,
  `Retour gratuit sous ${RETURN_WINDOW_DAYS} jours`,
  "Paiement sécurisé — CB, Apple Pay, Google Pay",
];

const ROTATION_MS = 4500;

export function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAnimate(false);
      return;
    }
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % MESSAGES.length),
      ROTATION_MS,
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative z-50 border-b border-line/60 bg-ink">
      <div className="shell flex h-9 items-center justify-center overflow-hidden">
        {animate ? (
          <p
            key={index}
            className="animate-announce text-center text-[11px] uppercase tracking-[0.22em] text-muted"
          >
            {MESSAGES[index]}
          </p>
        ) : (
          <p className="text-center text-[11px] uppercase tracking-[0.22em] text-muted">
            {MESSAGES[0]}
          </p>
        )}
      </div>
    </div>
  );
}
