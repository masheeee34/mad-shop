"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Défilement fluide inertiel (Lenis) — le rendu "premium" des sites primés.
 * Désactivé automatiquement si l'utilisateur préfère les mouvements réduits.
 */
export function SmoothScroll() {
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const lenis = new Lenis({
        duration: 1.1,
        lerp: 0.1,
        smoothWheel: !isSafari,
        wheelMultiplier: 1,
        touchMultiplier: 1.6,
      });

      let raf = 0;
      const loop = (time: number) => {
        lenis.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);

      const onAnchorClick = (e: MouseEvent) => {
        const target = (e.target as HTMLElement).closest('a[href^="#"]');
        if (!target) return;
        const id = target.getAttribute("href");
        if (id && id.length > 1) {
          e.preventDefault();
          lenis.scrollTo(id, { offset: -100 });
        }
      };
      document.addEventListener("click", onAnchorClick);

      return () => {
        cancelAnimationFrame(raf);
        document.removeEventListener("click", onAnchorClick);
        try {
          lenis.destroy();
        } catch {}
      };
    } catch {
      // Fallback défilement natif
    }
  }, []);

  return null;
}
