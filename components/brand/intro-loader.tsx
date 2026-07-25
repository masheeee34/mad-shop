"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

/**
 * Intro de marque au premier chargement : le logo MAD apparaît (fondu + tricolore
 * qui se trace), puis l'écran se lève comme un rideau. Une fois par session,
 * désactivé si l'utilisateur préfère les mouvements réduits.
 */
export function IntroLoader() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem("mad-intro");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || reduce) return;

    setShow(true);
    const t = setTimeout(() => {
      setShow(false);
      sessionStorage.setItem("mad-intro", "1");
    }, 2300);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] grid place-items-center bg-ink"
          initial={{ opacity: 1 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="flex flex-col items-center text-center px-4">
            {/* Nouveau Logo */}
            <motion.div
              className="relative h-28 w-48 md:h-36 md:w-64"
              initial={{ opacity: 0, scale: 0.82, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <img
                src="/newlogo.jpg"
                alt="MAD Shop"
                className="h-full w-full object-contain"
              />
            </motion.div>

            {/* Shop en petit format */}
            <motion.span
              className="mt-1 text-[11px] font-bold uppercase tracking-[0.45em] text-gold/80"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Shop
            </motion.span>

            {/* Make A Difference (initiales M, A, D en majuscules et en gras, écriture en or) */}
            <motion.div
              className="mt-3 text-xs md:text-sm font-semibold tracking-[0.2em] text-gold uppercase"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6 }}
            >
              <span className="font-extrabold text-sm md:text-base text-gold-bright">M</span>AKE{" "}
              <span className="font-extrabold text-sm md:text-base text-gold-bright">A</span>{" "}
              <span className="font-extrabold text-sm md:text-base text-gold-bright">D</span>IFFERENCE
            </motion.div>

            {/* Barre de couleur entre le bas du logo/texte et le fond */}
            <motion.span
              className="tricolore mt-5"
              style={{ height: 3, borderRadius: 2 }}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
