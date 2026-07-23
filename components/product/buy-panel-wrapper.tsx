"use client";

import { useRef } from "react";
import { BuyPanel } from "@/components/product/buy-panel";
import { MobileBuyBar } from "@/components/product/mobile-buy-bar";
import type { Product } from "@/lib/products";

/**
 * Wrapper client qui relie BuyPanel (son ref) à MobileBuyBar (IntersectionObserver).
 * Séparé en composant client pour pouvoir utiliser useRef dans une page Server Component.
 */
export function BuyPanelWrapper({ product }: { product: Product }) {
  const panelRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <BuyPanel product={product} panelRef={panelRef} />
      <MobileBuyBar product={product} triggerRef={panelRef} />
    </>
  );
}
