"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useWishlist, selectWishlistCount } from "@/lib/store/wishlist";

export function WishlistNav() {
  const count = useWishlist(selectWishlistCount);
  const [mounted, setMounted] = useState(false);
  // Garde d'hydratation : le compteur vient du localStorage (client only).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  return (
    <Link
      href="/favoris"
      className="relative grid size-10 place-items-center rounded-full text-cream transition hover:text-gold-bright"
      aria-label="Mes favoris"
    >
      <Heart className="size-5" />
      <AnimatePresence>
        {mounted && count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-it-red px-1 text-[10px] font-bold text-cream"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}
