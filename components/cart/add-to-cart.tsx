"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCart } from "@/lib/store/cart";
import { trackAddToCart } from "@/lib/analytics";
import { hapticLight } from "@/lib/haptics";
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

  const stock = product.stockQuantity ?? (product.inStock ? 10 : 0);
  const isAvailable = product.inStock && stock > 0;

  function handleAdd() {
    if (!isAvailable) return;
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
      category: product.category,
    });
    hapticLight();
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <Button
      onClick={handleAdd}
      size={size}
      disabled={!isAvailable}
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
            {isAvailable ? "Ajouter au panier" : "Rupture de stock"}
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  );
}
