"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Product } from "@/lib/products";
import { ProductCard } from "@/components/product/product-card";

/**
 * Slider produits horizontal, façon gros e-commerce :
 * scroll-snap, flèches, et glisser-déposer à la souris.
 */
export function ProductSlider({
  products,
  title,
  eyebrow,
  seeAllHref = "/boutique",
}: {
  products: Product[];
  title: string;
  eyebrow?: string;
  seeAllHref?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ down: false, startX: 0, startLeft: 0, moved: false });
  const [grabbing, setGrabbing] = useState(false);

  function scrollByCards(dir: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    const amount = Math.min(el.clientWidth * 0.9, 420);
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  }

  function onPointerDown(e: React.PointerEvent) {
    const el = trackRef.current;
    if (!el) return;
    drag.current = { down: true, startX: e.clientX, startLeft: el.scrollLeft, moved: false };
    setGrabbing(true);
  }
  function onPointerMove(e: React.PointerEvent) {
    const el = trackRef.current;
    if (!el || !drag.current.down) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    el.scrollLeft = drag.current.startLeft - dx;
  }
  function endDrag() {
    drag.current.down = false;
    setGrabbing(false);
  }

  return (
    <div>
      <div className="mb-8 flex items-end justify-between gap-6">
        <div className="flex flex-col gap-3">
          {eyebrow && (
            <span className="text-xs uppercase tracking-[0.3em] text-gold">{eyebrow}</span>
          )}
          <h2 className="display text-3xl md:text-4xl">{title}</h2>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={seeAllHref}
            className="link-underline hidden text-sm text-muted hover:text-cream sm:inline"
          >
            Tout voir
          </Link>
          <div className="flex gap-2">
            <button
              onClick={() => scrollByCards(-1)}
              className="grid size-11 place-items-center rounded-full border border-line text-cream transition hover:border-gold/60 hover:text-gold-bright"
              aria-label="Précédent"
            >
              <ArrowLeft className="size-4" />
            </button>
            <button
              onClick={() => scrollByCards(1)}
              className="grid size-11 place-items-center rounded-full border border-line text-cream transition hover:border-gold/60 hover:text-gold-bright"
              aria-label="Suivant"
            >
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={(e) => {
          // Empêche l'ouverture du produit si on vient de glisser.
          if (drag.current.moved) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        className={`no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 ${
          grabbing ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {products.map((p) => (
          <div
            key={p.slug}
            className="w-[78%] shrink-0 snap-start sm:w-[46%] lg:w-[31%] xl:w-[23.5%]"
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
}
