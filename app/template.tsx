"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Transition d'entrée à chaque changement de route.
 * Volontairement subtile pour ne pas concurrencer les Reveal des sections.
 */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
