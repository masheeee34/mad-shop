"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { motion } from "motion/react";
import { useWishlist } from "@/lib/store/wishlist";
import { trackAddToWishlist, type TrackedItem } from "@/lib/analytics";
import { hapticLight } from "@/lib/haptics";
import { cn } from "@/lib/utils";

/** Bouton favori (cœur) — sur les cartes et fiches produit. */
export function WishlistButton({
  slug,
  product,
  className,
  size = "md",
}: {
  slug: string;
  /** Renseigné quand le contexte le permet, pour la mesure publicitaire. */
  product?: TrackedItem;
  className?: string;
  size?: "sm" | "md";
}) {
  const toggle = useWishlist((s) => s.toggle);
  const slugs = useWishlist((s) => s.slugs);
  const [mounted, setMounted] = useState(false);
  // Garde d'hydratation : l'état favori vient du localStorage (client only).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const active = mounted && slugs.includes(slug);
  const dim = size === "sm" ? "size-4" : "size-5";

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        // Un ajout aux favoris signale une intention d'achat : c'est une
        // audience de reciblage bien plus qualifiée qu'une simple visite.
        if (!active && product) trackAddToWishlist(product);
        hapticLight();
        toggle(slug);
      }}
      aria-label={active ? "Retirer des favoris" : "Ajouter aux favoris"}
      aria-pressed={active}
      className={cn(
        "grid place-items-center rounded-full backdrop-blur transition",
        className,
      )}
    >
      <motion.span whileTap={{ scale: 0.8 }} animate={active ? { scale: [1, 1.25, 1] } : {}}>
        <Heart
          className={cn(
            dim,
            "transition-colors",
            active ? "fill-it-red text-it-red" : "text-cream",
          )}
        />
      </motion.span>
    </button>
  );
}
