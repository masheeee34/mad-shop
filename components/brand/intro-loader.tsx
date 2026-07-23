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
    }, 1900);
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
          <div className="flex flex-col items-center">
            <motion.div
              className="h-36 w-36 md:h-44 md:w-44"
              style={{
                backgroundImage: "url(/brand/logo.png)",
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
              }}
              initial={{ opacity: 0, scale: 0.82, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.span
              className="tricolore mt-6"
              style={{ height: 3, borderRadius: 2 }}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 190, opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
