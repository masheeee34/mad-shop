"use client";

import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useCart, selectCount } from "@/lib/store/cart";

export function CartButton() {
  const open = useCart((s) => s.open);
  const count = useCart(selectCount);
  const [mounted, setMounted] = useState(false);
  // Garde d'hydratation : le compteur (issu du localStorage) n'existe qu'au client.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  return (
    <button
      onClick={open}
      className="relative grid size-10 place-items-center rounded-full text-cream transition hover:text-gold-bright"
      aria-label="Ouvrir le panier"
    >
      <ShoppingBag className="size-5" />
      <AnimatePresence>
        {mounted && count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-gold px-1 text-[10px] font-bold text-ink"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
