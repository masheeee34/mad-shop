"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCart } from "@/lib/store/cart";
import { trackAddToCart } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/products";

export function AddToCart({
  product,
  size = "lg",
  full = false,
}: {
  product: Product;
  size?: "sm" | "md" | "lg";
  full?: boolean;
}) {
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    add({
      slug: product.slug,
      name: product.name,
      priceCents: product.priceCents,
      image: product.images[0],
    });
    trackAddToCart({
      slug: product.slug,
      name: product.name,
      priceCents: product.priceCents,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <Button
      onClick={handleAdd}
      size={size}
      disabled={!product.inStock}
      className={full ? "w-full" : undefined}
    >
      <AnimatePresence mode="wait" initial={false}>
        {added ? (
          <motion.span
            key="added"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="inline-flex items-center gap-2"
          >
            <Check className="size-4" /> Ajouté
          </motion.span>
        ) : (
          <motion.span
            key="add"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="inline-flex items-center gap-2"
          >
            <ShoppingBag className="size-4" />
            {product.inStock ? "Ajouter au panier" : "Rupture de stock"}
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  );
}
