"use client";

import { useState, useRef, useCallback } from "react";
import { ProductImage } from "@/components/product/product-image";
import { cn } from "@/lib/utils";

/**
 * Galerie produit avec :
 * — Swipe tactile natif (touch events + CSS scroll-snap) sur mobile
 * — ViewTransition (React 19) sur l'image principale
 * — Miniatures scrollables horizontalement
 * — Indicateur de page (1/n) sur mobile
 */
export function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  // Sync active index au scroll (mobile swipe)
  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActive(index);
  }, []);

  function scrollTo(index: number) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
    setActive(index);
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Image principale — swipe sur mobile, click miniature sur desktop */}
      <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-elevated">
        {/* Track swipeable (mobile) */}
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
          style={{ scrollSnapType: "x mandatory", touchAction: "pan-x" }}
        >
          {images.map((img, i) => (
            <div
              key={img}
              className="relative aspect-square w-full shrink-0 snap-start"
            >
              <div className="absolute inset-0">
                <ProductImage
                  file={img}
                  alt={`${name} — vue ${i + 1}`}
                  label={name}
                  priority={i === 0}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Indicateur de page (mobile) */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 lg:hidden">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                aria-label={`Vue ${i + 1}`}
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  i === active ? "w-6 bg-cream" : "w-1.5 bg-cream/40",
                )}
              />
            ))}
          </div>
        )}

        {/* Compteur discret en haut à droite (mobile) */}
        {images.length > 1 && (
          <span className="absolute right-3 top-3 rounded-full bg-ink/60 px-2.5 py-1 text-[11px] font-medium text-cream backdrop-blur-sm lg:hidden">
            {active + 1} / {images.length}
          </span>
        )}
      </div>

      {/* Miniatures — desktop seulement (sur mobile on swipe) */}
      {images.length > 1 && (
        <div className="hidden gap-2 lg:flex overflow-x-auto no-scrollbar">
          {images.map((img, i) => (
            <button
              key={img}
              onClick={() => scrollTo(i)}
              className={cn(
                "relative aspect-square w-20 shrink-0 overflow-hidden rounded-xl border bg-elevated transition",
                i === active ? "border-gold" : "border-line hover:border-line-strong",
              )}
              aria-label={`Vue ${i + 1}`}
            >
              <ProductImage
                file={img}
                alt={`${name} miniature ${i + 1}`}
                label={name}
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
