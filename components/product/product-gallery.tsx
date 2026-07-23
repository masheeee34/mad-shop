"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ProductImage } from "@/components/product/product-image";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-4">
      <div className="card relative aspect-square overflow-hidden bg-elevated">
        <motion.div
          key={active}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <ProductImage
            file={images[active]}
            alt={`${name} — vue ${active + 1}`}
            label={name}
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </motion.div>
      </div>

      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((img, i) => (
            <button
              key={img}
              onClick={() => setActive(i)}
              className={cn(
                "relative aspect-square w-20 overflow-hidden rounded-xl border bg-elevated transition",
                i === active ? "border-gold" : "border-line hover:border-line-strong",
              )}
              aria-label={`Vue ${i + 1}`}
            >
              <ProductImage file={img} alt={`${name} miniature ${i + 1}`} label={name} sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
